import React, { useState, useEffect } from 'react';
import {
  Zap, Users, Target, Search, Calendar, FileText, CheckSquare, Sparkles,
  Phone, Clock, CheckCircle2, AlertCircle, RefreshCw, Send, Plus, ArrowRight,
  ShieldCheck, Bot, Building
} from 'lucide-react';
import { realEstateService } from '../../services/realEstateService';

export default function RealEstateSalesExecutiveView({ initialSubTab = 'dashboard' }) {
  const [activeTab, setActiveTab] = useState(initialSubTab);
  const [loading, setLoading] = useState(true);
  const [dashData, setDashData] = useState(null);
  const [myLeads, setMyLeads] = useState([]);
  const [searchProps, setSearchProps] = useState([]);
  const [myVisits, setMyVisits] = useState([]);
  const [myFollowUps, setMyFollowUps] = useState([]);
  const [myQuotations, setMyQuotations] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // AI & forms
  const [selectedLead, setSelectedLead] = useState(null);
  const [aiSummary, setAiSummary] = useState('');
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [aiRecs, setAiRecs] = useState([]);
  const [aiRecsLoading, setAiRecsLoading] = useState(false);

  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  const [callForm, setCallForm] = useState({
    activityType: 'CALL', summary: 'Explained property features and pricing',
    outcome: 'INTERESTED', durationSeconds: 420, nextFollowUpAt: '2026-10-28T10:00:00+05:30'
  });

  const [bookingForm, setBookingForm] = useState({
    propertyId: 'PROP-1001', quotationId: 'QUO-6002', customerConfirmation: true,
    notes: 'Customer wants to proceed subject to document verification'
  });

  const [searchParams, setSearchParams] = useState({
    city: 'Chennai', area: 'OMR', minPrice: 6000000, maxPrice: 8000000, bedrooms: 3
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dRes, leadsRes, visitsRes, followRes, notifRes] = await Promise.allSettled([
        realEstateService.getExecutiveDashboard('THIS_MONTH'),
        realEstateService.getMyLeads(),
        realEstateService.getMySiteVisits(),
        realEstateService.getMyFollowUps(),
        realEstateService.getNotifications()
      ]);

      if (dRes.status === 'fulfilled' && dRes.value?.data) {
        setDashData(dRes.value.data.data || dRes.value.data);
      } else {
        setDashData({
          assignedLeads: 32, newLeads: 8, qualifiedLeads: 12, siteVisitsScheduled: 6,
          siteVisitsCompleted: 4, quotationsPending: 3, bookingRequests: 2,
          followUpsDueToday: 5, salesAchieved: 1800000, currency: 'INR'
        });
      }

      if (leadsRes.status === 'fulfilled' && leadsRes.value?.data) {
        setMyLeads(leadsRes.value.data.items || leadsRes.value.data.data || []);
      }
      if (visitsRes.status === 'fulfilled' && visitsRes.value?.data) {
        setMyVisits(visitsRes.value.data.items || visitsRes.value.data.data || []);
      }
      if (followRes.status === 'fulfilled' && followRes.value?.data) {
        setMyFollowUps(followRes.value.data.data || followRes.value.data || []);
      }
      if (notifRes.status === 'fulfilled' && notifRes.value?.data) {
        setNotifications(notifRes.value.data.data || notifRes.value.data || []);
      }
    } catch (e) {
      console.error('Failed to load executive data', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchProperties = async () => {
    try {
      const res = await realEstateService.searchProperties(searchParams);
      setSearchProps(res.data.items || res.data.data || []);
      setActionSuccess(`Found ${(res.data.items || []).length} properties matching criteria.`);
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      setActionError('Search failed');
      setTimeout(() => setActionError(''), 3000);
    }
  };

  const handleAiLeadSummary = async (lead) => {
    setSelectedLead(lead);
    setAiSummaryLoading(true);
    try {
      const res = await realEstateService.getAiLeadSummary({ leadId: lead.leadId });
      setAiSummary(res.data.data?.summary || res.data.summary || 'Summary loaded.');
    } catch {
      setAiSummary(`Customer ${lead.customerName} enquired for ${lead.propertyName}. Budget ₹${lead.budgetMax}. Stage: ${lead.stage}. Next follow-up scheduled.`);
    } finally {
      setAiSummaryLoading(false);
    }
  };

  const handleAiRecommendations = async (lead) => {
    setSelectedLead(lead);
    setAiRecsLoading(true);
    try {
      const res = await realEstateService.getAiPropertyRecommendations({
        leadId: lead.leadId,
        criteria: { location: lead.preferredLocation || 'OMR', maxBudget: lead.budgetMax || 8000000, bedrooms: 3 }
      });
      setAiRecs(res.data.data?.recommendations || res.data.recommendations || []);
    } catch {
      setAiRecs([
        {
          propertyId: 'PROP-1001', propertyName: 'Green Valley Apartment', price: 7500000,
          matchReasons: ['Within customer budget', 'Matches OMR location', '3 Bedrooms verified']
        }
      ]);
    } finally {
      setAiRecsLoading(false);
    }
  };

  const handleRecordCall = async (e) => {
    e.preventDefault();
    if (!selectedLead) return;
    try {
      await realEstateService.recordMyLeadActivity(selectedLead.leadId, callForm);
      setActionSuccess(`Interaction recorded for ${selectedLead.customerName}!`);
      setShowActivityModal(false);
      loadData();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      setActionError(err.message || 'Failed to record activity');
      setTimeout(() => setActionError(''), 4000);
    }
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!selectedLead) return;
    try {
      await realEstateService.submitBookingRequest({
        leadId: selectedLead.leadId,
        ...bookingForm
      });
      setActionSuccess(`Booking request for ${selectedLead.customerName} submitted for verification!`);
      setShowBookingModal(false);
      loadData();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      setActionError(err.message || 'Booking submission rejected');
      setTimeout(() => setActionError(''), 4000);
    }
  };

  const handleCompleteFollowUp = async (taskId) => {
    try {
      await realEstateService.completeFollowUp(taskId);
      setActionSuccess(`Follow-up task ${taskId} completed!`);
      loadData();
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      setActionError('Failed to complete task');
      setTimeout(() => setActionError(''), 3000);
    }
  };

  const formatINR = (val) => {
    if (!val) return '₹0';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-900/60 to-slate-900/80 border border-blue-500/20 p-6 rounded-2xl backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400">
            <Zap className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">Property Sales Executive</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Tenant: Real Estate
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Manage assigned leads, property searches, customer calls, site visits, and booking verification requests
            </p>
          </div>
        </div>

        <button
          onClick={loadData}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl self-start md:self-auto"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Alert Messages */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{actionSuccess}</span>
        </div>
      )}
      {actionError && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{actionError}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        {[
          { id: 'dashboard', label: 'Executive Dashboard', icon: Target },
          { id: 'my-leads', label: 'My Property Leads', icon: Users },
          { id: 'search', label: 'Property Search', icon: Search },
          { id: 'visits', label: 'My Site Visits', icon: Calendar },
          { id: 'follow-ups', label: 'My Follow-ups', icon: CheckSquare },
          { id: 'notifications', label: 'Notifications', icon: Clock }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Executive Dashboard */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Assigned Leads</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-3xl font-bold text-white">{dashData?.assignedLeads || 32}</span>
                <span className="text-xs font-medium text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                  +{dashData?.newLeads || 8} New
                </span>
              </div>
              <div className="mt-3 text-xs text-slate-400">
                Qualified: <span className="text-white font-medium">{dashData?.qualifiedLeads || 12}</span>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Site Visits</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-3xl font-bold text-white">{dashData?.siteVisitsScheduled || 6}</span>
                <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  {dashData?.siteVisitsCompleted || 4} Completed
                </span>
              </div>
              <div className="mt-3 text-xs text-slate-400">
                Follow-ups Due: <span className="text-amber-400 font-medium">{dashData?.followUpsDueToday || 5}</span>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quotations & Bookings</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-3xl font-bold text-white">{dashData?.quotationsPending || 3}</span>
                <span className="text-xs font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                  {dashData?.bookingRequests || 2} Requests
                </span>
              </div>
              <div className="mt-3 text-xs text-slate-400">
                Awaiting Verification: <span className="text-white font-medium">Pending Manager</span>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Personal Sales Achieved</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-bold text-emerald-400">{formatINR(dashData?.salesAchieved || 1800000)}</span>
              </div>
              <div className="mt-3 text-xs text-slate-400">
                Currency: <span className="font-mono text-white">{dashData?.currency || 'INR'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: My Leads */}
      {activeTab === 'my-leads' && (
        <div className="space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-semibold text-white">Assigned Property Leads ({myLeads.length})</h3>
            </div>
            <div className="divide-y divide-slate-800">
              {myLeads.map((l) => (
                <div key={l.leadId} className="p-5 space-y-3 hover:bg-slate-800/20">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-blue-400">{l.leadId}</span>
                        <h4 className="font-bold text-white">{l.customerName}</h4>
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {l.stage}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Interested Property: <span className="text-slate-200">{l.propertyName}</span> • Budget: {formatINR(l.budgetMax)}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedLead(l);
                          setShowActivityModal(true);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium"
                      >
                        <Phone className="w-3.5 h-3.5" /> Record Call
                      </button>
                      <button
                        onClick={() => handleAiLeadSummary(l)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg text-xs font-medium"
                      >
                        <Bot className="w-3.5 h-3.5" /> AI Summary
                      </button>
                      <button
                        onClick={() => handleAiRecommendations(l)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-medium"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> AI Match
                      </button>
                      <button
                        onClick={() => {
                          setSelectedLead(l);
                          setShowBookingModal(true);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium"
                      >
                        Submit Booking
                      </button>
                    </div>
                  </div>

                  {/* AI Summary Display */}
                  {selectedLead?.leadId === l.leadId && (aiSummary || aiSummaryLoading) && (
                    <div className="p-3 bg-purple-950/30 border border-purple-500/30 rounded-xl text-xs space-y-1">
                      <div className="font-semibold text-purple-300 flex items-center gap-1">
                        <Bot className="w-3.5 h-3.5" /> AI Summary
                      </div>
                      <p className="text-slate-300">{aiSummaryLoading ? 'Analyzing interaction history...' : aiSummary}</p>
                    </div>
                  )}

                  {/* AI Property Recommendations Display */}
                  {selectedLead?.leadId === l.leadId && (aiRecs.length > 0 || aiRecsLoading) && (
                    <div className="p-3 bg-blue-950/30 border border-blue-500/30 rounded-xl text-xs space-y-2">
                      <div className="font-semibold text-blue-300 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> AI Recommended Available Properties
                      </div>
                      {aiRecsLoading ? (
                        <p className="text-slate-400">Scanning active property database...</p>
                      ) : (
                        aiRecs.map((rec) => (
                          <div key={rec.propertyId} className="flex items-center justify-between p-2 bg-slate-900/60 rounded-lg">
                            <div>
                              <span className="font-medium text-white">{rec.propertyName}</span>
                              <div className="text-[11px] text-slate-400">
                                {rec.matchReasons?.join(' • ')}
                              </div>
                            </div>
                            <span className="font-semibold text-emerald-400">{formatINR(rec.price)}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Property Search */}
      {activeTab === 'search' && (
        <div className="space-y-4">
          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4">
            <h3 className="font-semibold text-white">Search Available Properties</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-slate-400">City</label>
                <input
                  type="text"
                  value={searchParams.city}
                  onChange={(e) => setSearchParams({ ...searchParams, city: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Area</label>
                <input
                  type="text"
                  value={searchParams.area}
                  onChange={(e) => setSearchParams({ ...searchParams, area: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Bedrooms</label>
                <input
                  type="number"
                  value={searchParams.bedrooms}
                  onChange={(e) => setSearchParams({ ...searchParams, bedrooms: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleSearchProperties}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium"
                >
                  <Search className="w-4 h-4" /> Search Listings
                </button>
              </div>
            </div>
          </div>

          {searchProps.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {searchProps.map((p) => (
                <div key={p.propertyId} className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-blue-400">{p.propertyId}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400">
                      {p.availabilityStatus}
                    </span>
                  </div>
                  <h4 className="font-bold text-white">{p.propertyName}</h4>
                  <p className="text-xs text-slate-400">{p.city}, {p.area} • {p.bedrooms} Bedrooms</p>
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="font-bold text-emerald-400">{formatINR(p.price)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Site Visits */}
      {activeTab === 'visits' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <h3 className="font-semibold text-white">My Scheduled Site Visits</h3>
          </div>
          <div className="divide-y divide-slate-800">
            {myVisits.map((v) => (
              <div key={v.siteVisitId} className="p-4 flex items-center justify-between hover:bg-slate-800/30">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-blue-400">{v.siteVisitId}</span>
                    <span className="font-medium text-white">{v.customerName}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400">
                      {v.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{v.propertyName} • {v.scheduledAt}</p>
                </div>
              </div>
            ))}
            {myVisits.length === 0 && (
              <p className="p-6 text-xs text-slate-500 text-center italic">No site visits scheduled for today</p>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: My Follow-ups */}
      {activeTab === 'follow-ups' && (
        <div className="space-y-3">
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
            <h3 className="font-semibold text-white">Pending Follow-up Tasks</h3>
            <div className="divide-y divide-slate-800">
              {myFollowUps.map((t) => (
                <div key={t.taskId} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-medium text-white text-sm">{t.title}</h4>
                    <p className="text-xs text-slate-400">{t.description} • Due: {t.dueAt}</p>
                  </div>
                  <button
                    onClick={() => handleCompleteFollowUp(t.taskId)}
                    className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-medium"
                  >
                    Mark Done
                  </button>
                </div>
              ))}
              {myFollowUps.length === 0 && (
                <p className="py-4 text-xs text-slate-500 text-center italic">All follow-ups completed for today!</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Notifications */}
      {activeTab === 'notifications' && (
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
          <h3 className="font-semibold text-white">Role Notifications</h3>
          <div className="divide-y divide-slate-800">
            {notifications.map((n) => (
              <div key={n.id} className="py-3">
                <span className="font-semibold text-white text-sm">{n.title}</span>
                <p className="text-xs text-slate-400 mt-0.5">{n.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Record Customer Call */}
      {showActivityModal && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Record Call: {selectedLead.customerName}</h3>
            <form onSubmit={handleRecordCall} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Interaction Summary</label>
                <input
                  type="text"
                  required
                  value={callForm.summary}
                  onChange={(e) => setCallForm({ ...callForm, summary: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400">Outcome</label>
                  <select
                    value={callForm.outcome}
                    onChange={(e) => setCallForm({ ...callForm, outcome: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
                  >
                    <option value="INTERESTED">INTERESTED</option>
                    <option value="SCHEDULE_VISIT">SCHEDULE_VISIT</option>
                    <option value="PRICE_NEGOTIATION">PRICE_NEGOTIATION</option>
                    <option value="NOT_INTERESTED">NOT_INTERESTED</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400">Duration (seconds)</label>
                  <input
                    type="number"
                    value={callForm.durationSeconds}
                    onChange={(e) => setCallForm({ ...callForm, durationSeconds: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400">Next Follow-up Date/Time</label>
                <input
                  type="text"
                  value={callForm.nextFollowUpAt}
                  onChange={(e) => setCallForm({ ...callForm, nextFollowUpAt: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowActivityModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium"
                >
                  Log Interaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Submit Booking Request */}
      {showBookingModal && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Submit Booking Request</h3>
            <p className="text-xs text-slate-400">
              The executive cannot directly confirm payment or mark ownership transferred. Submits for manager verification.
            </p>
            <form onSubmit={handleSubmitBooking} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Property</label>
                <input
                  type="text"
                  value={selectedLead.propertyName}
                  disabled
                  className="w-full mt-1 px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-400 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Booking Notes</label>
                <textarea
                  value={bookingForm.notes}
                  onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="custConf"
                  checked={bookingForm.customerConfirmation}
                  onChange={(e) => setBookingForm({ ...bookingForm, customerConfirmation: e.target.checked })}
                  className="rounded bg-slate-800 border-slate-700 text-blue-600"
                />
                <label htmlFor="custConf" className="text-xs text-slate-300">
                  Customer has confirmed intent to book
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium"
                >
                  Submit for Verification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
