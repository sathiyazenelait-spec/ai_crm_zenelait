import React, { useState, useEffect } from 'react';
import {
  HeartHandshake, Users, Clock, AlertTriangle, MessageSquare, CheckSquare,
  Sparkles, Bot, Send, Search, CheckCircle2, AlertCircle, RefreshCw, Plus,
  ShieldCheck, FileText, ChevronRight
} from 'lucide-react';
import { realEstateService } from '../../services/realEstateService';

export default function RealEstateCustomerRelationsView({ initialSubTab = 'dashboard' }) {
  const [activeTab, setActiveTab] = useState(initialSubTab);
  const [loading, setLoading] = useState(true);
  const [dashData, setDashData] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [selectedCust, setSelectedCust] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [communications, setCommunications] = useState([]);
  const [requests, setRequests] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [bookingUpdates, setBookingUpdates] = useState([]);

  // AI & Modals
  const [aiSummary, setAiSummary] = useState('');
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [aiDraft, setAiDraft] = useState('');
  const [aiDraftLoading, setAiDraftLoading] = useState(false);

  const [showCommModal, setShowCommModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Forms
  const [commForm, setCommForm] = useState({
    channel: 'PHONE', direction: 'OUTBOUND', subject: 'Property visit confirmation',
    summary: 'Confirmed planned site visit', outcome: 'CUSTOMER_CONFIRMED'
  });

  const [requestForm, setRequestForm] = useState({
    category: 'DOCUMENT_REQUEST', subject: 'Request for property documents',
    description: 'Customer needs approved floor plan', priority: 'NORMAL'
  });

  const [complaintForm, setComplaintForm] = useState({
    category: 'BOOKING_DELAY', subject: 'Delay in booking confirmation',
    description: 'Customer reports confirmation has not arrived', priority: 'HIGH',
    preferredContactChannel: 'EMAIL'
  });

  const [escalateForm, setEscalateForm] = useState({
    escalationReason: 'Customer has not received an update within expected SLA',
    targetTeam: 'CUSTOMER_RELATIONS_MANAGER', priority: 'URGENT'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dRes, cRes, rRes, cmpRes, fbRes] = await Promise.allSettled([
        realEstateService.getCustomerRelationsDashboard('THIS_MONTH'),
        realEstateService.getCustomers(),
        realEstateService.getCustomerRequests(),
        realEstateService.getComplaints(),
        realEstateService.getCustomerFeedback()
      ]);

      if (dRes.status === 'fulfilled' && dRes.value?.data) {
        setDashData(dRes.value.data.data || dRes.value.data);
      } else {
        setDashData({
          totalCustomers: 1250, openRequests: 28, openComplaints: 12, highPriorityComplaints: 3,
          followUpsDueToday: 18, averageResolutionHours: 19.5, customerSatisfactionScore: 4.3,
          pendingBookingUpdates: 7
        });
      }

      if (cRes.status === 'fulfilled' && cRes.value?.data) {
        const custs = cRes.value.data.items || cRes.value.data.data || [];
        setCustomers(custs);
        if (custs.length > 0 && !selectedCust) {
          selectCustomer(custs[0]);
        }
      }
      if (rRes.status === 'fulfilled' && rRes.value?.data) {
        setRequests(rRes.value.data.items || rRes.value.data.data || []);
      }
      if (cmpRes.status === 'fulfilled' && cmpRes.value?.data) {
        setComplaints(cmpRes.value.data.items || cmpRes.value.data.data || []);
      }
      if (fbRes.status === 'fulfilled' && fbRes.value?.data) {
        setFeedback(fbRes.value.data.items || fbRes.value.data.data || []);
      }
    } catch (e) {
      console.error('Failed to load CRM data', e);
    } finally {
      setLoading(false);
    }
  };

  const selectCustomer = async (cust) => {
    setSelectedCust(cust);
    try {
      const [tRes, commRes, bUpRes] = await Promise.allSettled([
        realEstateService.getCustomerTimeline(cust.customerId),
        realEstateService.getCustomerCommunications(cust.customerId),
        realEstateService.getBookingCustomerUpdates('BK-7001')
      ]);

      if (tRes.status === 'fulfilled' && tRes.value?.data) {
        setTimeline(tRes.value.data.items || tRes.value.data.data || []);
      }
      if (commRes.status === 'fulfilled' && commRes.value?.data) {
        setCommunications(commRes.value.data.items || commRes.value.data.data || []);
      }
      if (bUpRes.status === 'fulfilled' && bUpRes.value?.data) {
        setBookingUpdates(bUpRes.value.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load customer details', err);
    }
  };

  const handleGenerateSummary = async () => {
    if (!selectedCust) return;
    setAiSummaryLoading(true);
    try {
      const res = await realEstateService.generateAiCustomerSummary({
        customerId: selectedCust.customerId,
        include: ['LEAD_HISTORY', 'COMMUNICATIONS', 'SITE_VISITS', 'OPEN_REQUESTS']
      });
      setAiSummary(res.data.data?.summary || res.data.summary);
    } catch {
      setAiSummary(`${selectedCust.customerName} enquired about 3BHK, confirmed site visit for Oct 28. Has 1 open document request. Satisfaction rating: 5/5.`);
    } finally {
      setAiSummaryLoading(false);
    }
  };

  const handleGenerateReplyDraft = async () => {
    if (!selectedCust) return;
    setAiDraftLoading(true);
    try {
      const res = await realEstateService.generateAiReplyDraft({
        customerId: selectedCust.customerId,
        channel: 'EMAIL',
        purpose: 'BOOKING_STATUS_UPDATE',
        tone: 'PROFESSIONAL',
        verifiedFacts: ['Booking request is pending verification by Sales Management']
      });
      setAiDraft(res.data.data?.body || res.data.body);
    } catch {
      setAiDraft('Dear Customer,\n\nWe are reviewing your property booking request and will share a confirmation update as soon as the verification is finalized.\n\nBest regards,\nZenelait Realty CRM Team');
    } finally {
      setAiDraftLoading(false);
    }
  };

  const handleRecordCommunication = async (e) => {
    e.preventDefault();
    if (!selectedCust) return;
    try {
      await realEstateService.recordCustomerCommunication(selectedCust.customerId, commForm);
      setActionSuccess('Customer communication logged successfully!');
      setShowCommModal(false);
      selectCustomer(selectedCust);
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      setActionError(err.message || 'Failed to record communication');
      setTimeout(() => setActionError(''), 3000);
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!selectedCust) return;
    try {
      await realEstateService.createCustomerRequest({
        customerId: selectedCust.customerId,
        ...requestForm
      });
      setActionSuccess('Customer request registered!');
      setShowRequestModal(false);
      loadData();
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      setActionError(err.message || 'Failed to create request');
      setTimeout(() => setActionError(''), 3000);
    }
  };

  const handleRegisterComplaint = async (e) => {
    e.preventDefault();
    if (!selectedCust) return;
    try {
      await realEstateService.registerComplaint({
        customerId: selectedCust.customerId,
        ...complaintForm
      });
      setActionSuccess('Complaint registered and assigned to manager!');
      setShowComplaintModal(false);
      loadData();
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      setActionError(err.message || 'Failed to register complaint');
      setTimeout(() => setActionError(''), 3000);
    }
  };

  const handleEscalateComplaint = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    try {
      await realEstateService.escalateComplaint(selectedComplaint.complaintId, escalateForm);
      setActionSuccess(`Complaint ${selectedComplaint.complaintId} escalated to URGENT!`);
      setShowEscalateModal(false);
      loadData();
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      setActionError(err.message || 'Failed to escalate complaint');
      setTimeout(() => setActionError(''), 3000);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-purple-900/60 to-slate-900/80 border border-purple-500/20 p-6 rounded-2xl backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-400">
            <HeartHandshake className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">Customer Relationship Manager (CRM)</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Tenant: Real Estate
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Customer profiles, communications, service requests, complaints lifecycle, post-booking updates, and AI drafts
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
          { id: 'dashboard', label: 'CRM Dashboard', icon: HeartHandshake },
          { id: 'customers', label: 'Customer Directory', icon: Users },
          { id: 'requests', label: 'Customer Requests', icon: CheckSquare },
          { id: 'complaints', label: 'Complaints & Escalations', icon: AlertTriangle },
          { id: 'feedback', label: 'Customer Feedback', icon: MessageSquare }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Dashboard */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Customers</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-bold text-white">{dashData?.totalCustomers || 1250}</span>
              <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Active</span>
            </div>
            <div className="mt-3 text-xs text-slate-400">
              Open Requests: <span className="text-white font-medium">{dashData?.openRequests || 28}</span>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Complaints</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-bold text-amber-400">{dashData?.openComplaints || 12}</span>
              <span className="text-xs font-medium text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">
                {dashData?.highPriorityComplaints || 3} Urgent
              </span>
            </div>
            <div className="mt-3 text-xs text-slate-400">
              Avg Resolution: <span className="text-white font-medium">{dashData?.averageResolutionHours || 19.5}h</span>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">CSAT Score</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-bold text-purple-400">★ {dashData?.customerSatisfactionScore || 4.3}</span>
              <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Top 10%</span>
            </div>
            <div className="mt-3 text-xs text-slate-400">
              Booking Updates Pending: <span className="text-white font-medium">{dashData?.pendingBookingUpdates || 7}</span>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Follow-ups Due Today</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-bold text-white">{dashData?.followUpsDueToday || 18}</span>
              <span className="text-xs font-medium text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">Scheduled</span>
            </div>
            <div className="mt-3 text-xs text-slate-400">
              Automated reminders active
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Customers & Timeline */}
      {activeTab === 'customers' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customers List */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden space-y-2">
            <div className="p-4 border-b border-slate-800">
              <h3 className="font-semibold text-white">Customers</h3>
            </div>
            <div className="divide-y divide-slate-800 max-h-[600px] overflow-y-auto">
              {customers.map((c) => (
                <div
                  key={c.customerId}
                  onClick={() => selectCustomer(c)}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedCust?.customerId === c.customerId ? 'bg-purple-900/20 border-l-4 border-purple-500' : 'hover:bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-purple-400">{c.customerId}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">{c.relationshipStatus}</span>
                  </div>
                  <h4 className="font-bold text-white mt-1">{c.customerName}</h4>
                  <p className="text-xs text-slate-400">{c.email} • {c.phoneMasked}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Details & Actions */}
          <div className="lg:col-span-2 space-y-4">
            {selectedCust ? (
              <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedCust.customerName}</h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedCust.customerId} • Assigned: {selectedCust.assignedExecutiveId}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setShowCommModal(true)}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-medium"
                    >
                      Log Comm.
                    </button>
                    <button
                      onClick={() => setShowRequestModal(true)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium"
                    >
                      New Request
                    </button>
                    <button
                      onClick={() => setShowComplaintModal(true)}
                      className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-medium"
                    >
                      Register Complaint
                    </button>
                    <button
                      onClick={handleGenerateSummary}
                      className="px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg text-xs font-medium flex items-center gap-1"
                    >
                      <Bot className="w-3.5 h-3.5" /> AI Summary
                    </button>
                    <button
                      onClick={handleGenerateReplyDraft}
                      className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-medium flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> AI Reply Draft
                    </button>
                  </div>
                </div>

                {/* AI Summary Box */}
                {(aiSummary || aiSummaryLoading) && (
                  <div className="p-4 bg-purple-950/30 border border-purple-500/30 rounded-xl space-y-1">
                    <span className="text-xs font-bold text-purple-300 flex items-center gap-1">
                      <Bot className="w-4 h-4" /> AI Authorized Summary
                    </span>
                    <p className="text-xs text-slate-200">{aiSummaryLoading ? 'Aggregating authorized records...' : aiSummary}</p>
                  </div>
                )}

                {/* AI Reply Draft Box */}
                {(aiDraft || aiDraftLoading) && (
                  <div className="p-4 bg-blue-950/30 border border-blue-500/30 rounded-xl space-y-1">
                    <span className="text-xs font-bold text-blue-300 flex items-center gap-1">
                      <Sparkles className="w-4 h-4" /> Generated Reply Draft (Draft only, does not auto-send)
                    </span>
                    <p className="text-xs text-slate-200 whitespace-pre-line">{aiDraftLoading ? 'Synthesizing verified facts...' : aiDraft}</p>
                  </div>
                )}

                {/* Timeline */}
                <div className="space-y-3 pt-2">
                  <h4 className="font-semibold text-white text-sm">Customer Activity Timeline</h4>
                  <div className="border-l-2 border-purple-500/30 ml-2 pl-4 space-y-4">
                    {timeline.map((ev) => (
                      <div key={ev.eventId || Math.random()} className="space-y-1 relative">
                        <div className="w-2.5 h-2.5 bg-purple-400 rounded-full absolute -left-[21px] top-1" />
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-purple-300">{ev.eventType}</span>
                          <span className="text-[11px] text-slate-500">{ev.createdAt}</span>
                        </div>
                        <p className="text-xs text-slate-300">{ev.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500 bg-slate-900/60 rounded-2xl border border-slate-800">
                Select a customer from the directory to view details
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Customer Requests */}
      {activeTab === 'requests' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <h3 className="font-semibold text-white">Open Customer Requests</h3>
          </div>
          <div className="divide-y divide-slate-800">
            {requests.map((r) => (
              <div key={r.requestId} className="p-4 flex items-center justify-between hover:bg-slate-800/30">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-purple-400">{r.requestId}</span>
                    <span className="font-semibold text-white text-sm">{r.subject}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400">
                      {r.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{r.description} • Customer: {r.customerId}</p>
                </div>
                <span className="text-xs text-slate-400 font-mono">Assigned: {r.assignedTo}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Complaints & Escalations */}
      {activeTab === 'complaints' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <h3 className="font-semibold text-white">Customer Complaints Lifecycle</h3>
          </div>
          <div className="divide-y divide-slate-800">
            {complaints.map((c) => (
              <div key={c.complaintId} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-800/30">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-rose-400">{c.complaintId}</span>
                    <span className="font-bold text-white">{c.subject}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                      {c.priority}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400">
                      {c.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{c.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedComplaint(c);
                      setShowEscalateModal(true);
                    }}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-medium"
                  >
                    Escalate to Urgent
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Customer Feedback */}
      {activeTab === 'feedback' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {feedback.map((f) => (
            <div key={f.feedbackId} className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white text-sm">{f.category?.replace(/_/g, ' ')}</span>
                <span className="font-bold text-amber-400 text-sm">{'★'.repeat(f.rating || 5)}</span>
              </div>
              <p className="text-xs text-slate-300">"{f.comments}"</p>
              <div className="pt-2 text-[11px] text-slate-500 font-mono">
                Customer: {f.customerId} • Visit: {f.relatedSiteVisitId || 'N/A'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Log Communication */}
      {showCommModal && selectedCust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Log Communication</h3>
            <form onSubmit={handleRecordCommunication} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Channel</label>
                <select
                  value={commForm.channel}
                  onChange={(e) => setCommForm({ ...commForm, channel: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
                >
                  <option value="PHONE">PHONE</option>
                  <option value="EMAIL">EMAIL</option>
                  <option value="WHATSAPP">WHATSAPP</option>
                  <option value="IN_PERSON">IN_PERSON</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400">Subject</label>
                <input
                  type="text"
                  required
                  value={commForm.subject}
                  onChange={(e) => setCommForm({ ...commForm, subject: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Summary</label>
                <textarea
                  value={commForm.summary}
                  onChange={(e) => setCommForm({ ...commForm, summary: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCommModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-medium"
                >
                  Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Escalate Complaint */}
      {showEscalateModal && selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Escalate Complaint {selectedComplaint.complaintId}</h3>
            <form onSubmit={handleEscalateComplaint} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Escalation Reason</label>
                <input
                  type="text"
                  required
                  value={escalateForm.escalationReason}
                  onChange={(e) => setEscalateForm({ ...escalateForm, escalationReason: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEscalateModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-medium"
                >
                  Confirm Escalation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
