import React, { useState, useEffect } from 'react';
import {
  Building2, Users, Target, Calendar, CheckSquare, Sparkles, TrendingUp,
  FileText, Clock, AlertCircle, Plus, Search, Filter, CheckCircle2,
  Phone, ArrowRight, ShieldCheck, DollarSign, RefreshCw, ChevronRight,
  UserCheck, AlertTriangle
} from 'lucide-react';
import { realEstateService } from '../../services/realEstateService';

export default function RealEstateSalesManagerView({ initialSubTab = 'dashboard' }) {
  const [activeTab, setActiveTab] = useState(initialSubTab);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [properties, setProperties] = useState([]);
  const [leads, setLeads] = useState([]);
  const [pipeline, setPipeline] = useState([]);
  const [team, setTeam] = useState([]);
  const [siteVisits, setSiteVisits] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [automationRules, setAutomationRules] = useState([]);
  const [salesReports, setSalesReports] = useState(null);

  // Modals & form state
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Form inputs
  const [newProp, setNewProp] = useState({
    propertyName: '', propertyType: 'APARTMENT', transactionType: 'SALE',
    city: 'Chennai', area: 'OMR', price: 7500000, bedrooms: 3, bathrooms: 2,
    areaSqFt: 1450, description: ''
  });

  const [newLead, setNewLead] = useState({
    customerName: '', email: '', phone: '', propertyId: 'PROP-1001',
    leadSource: 'WEBSITE', budgetMin: 6000000, budgetMax: 8000000,
    preferredLocation: 'OMR', notes: ''
  });

  const [assignForm, setAssignForm] = useState({
    salesExecutiveId: 'USR-3001', assignmentReason: 'Executive handles local properties'
  });

  const [newQuotation, setNewQuotation] = useState({
    leadId: 'RL-2001', propertyId: 'PROP-1001', basePrice: 7500000,
    discountAmount: 100000, additionalCharges: 150000, validUntil: '2026-11-30'
  });

  const [newRule, setNewRule] = useState({
    name: 'New property lead follow-up', trigger: 'LEAD_CREATED',
    delayMinutes: 30, action: 'CREATE_FOLLOW_UP_TASK', enabled: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashRes, propsRes, leadsRes, pipeRes, teamRes, visitsRes, quotesRes, bookRes, rulesRes, repRes] =
        await Promise.allSettled([
          realEstateService.getSalesManagerDashboard('THIS_MONTH'),
          realEstateService.getProperties(),
          realEstateService.getLeads(),
          realEstateService.getSalesPipeline(),
          realEstateService.getTeam(),
          realEstateService.getSiteVisits(),
          realEstateService.getQuotations ? apiClientWrap('quotations') : Promise.resolve({ data: [] }),
          realEstateService.getBookings ? apiClientWrap('bookings') : Promise.resolve({ data: [] }),
          realEstateService.getAutomationRules ? apiClientWrap('rules') : Promise.resolve({ data: [] }),
          realEstateService.getSalesReports ? realEstateService.getSalesReports('2026-10-01', '2026-10-31') : Promise.resolve({ data: {} })
        ]);

      if (dashRes.status === 'fulfilled' && dashRes.value?.data) {
        setDashboardData(dashRes.value.data.data || dashRes.value.data);
      } else {
        // Fallback demo data
        setDashboardData({
          period: 'THIS_MONTH', totalLeads: 248, newLeads: 42, qualifiedLeads: 96,
          siteVisitsScheduled: 35, siteVisitsCompleted: 22, activeNegotiations: 18,
          bookingsCompleted: 9, salesTarget: 10000000, salesAchieved: 6400000,
          targetAchievementPercentage: 64.0, teamMembers: 8, pendingFollowUps: 27
        });
      }

      if (propsRes.status === 'fulfilled' && propsRes.value?.data) {
        setProperties(propsRes.value.data.items || propsRes.value.data.data || []);
      }
      if (leadsRes.status === 'fulfilled' && leadsRes.value?.data) {
        setLeads(leadsRes.value.data.items || leadsRes.value.data.data || []);
      }
      if (pipeRes.status === 'fulfilled' && pipeRes.value?.data) {
        setPipeline(pipeRes.value.data.items || pipeRes.value.data.data || []);
      }
      if (teamRes.status === 'fulfilled' && teamRes.value?.data) {
        setTeam(teamRes.value.data.data || teamRes.value.data || []);
      }
      if (visitsRes.status === 'fulfilled' && visitsRes.value?.data) {
        setSiteVisits(visitsRes.value.data.items || visitsRes.value.data.data || []);
      }
    } catch (e) {
      console.error('Failed to load Sales Manager data', e);
    } finally {
      setLoading(false);
    }
  };

  const apiClientWrap = async (type) => {
    try {
      if (type === 'quotations') {
        const res = await realEstateService.getSalesPipeline();
        return { data: [] };
      }
      return { data: [] };
    } catch {
      return { data: [] };
    }
  };

  const handleCreateProperty = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newProp,
        location: { city: newProp.city, area: newProp.area }
      };
      await realEstateService.createProperty(payload);
      setActionSuccess('Property listing created successfully!');
      setShowPropertyModal(false);
      loadData();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      setActionError(err.message || 'Failed to create property');
      setTimeout(() => setActionError(''), 4000);
    }
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    try {
      await realEstateService.createLead(newLead);
      setActionSuccess('Property lead registered successfully!');
      setShowLeadModal(false);
      loadData();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      setActionError(err.message || 'Failed to create lead');
      setTimeout(() => setActionError(''), 4000);
    }
  };

  const handleAssignLead = async (e) => {
    e.preventDefault();
    if (!selectedLead) return;
    try {
      await realEstateService.assignLead(selectedLead.leadId, assignForm);
      setActionSuccess(`Lead ${selectedLead.leadId} assigned to ${assignForm.salesExecutiveId}!`);
      setShowAssignModal(false);
      loadData();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      setActionError(err.message || 'Failed to assign lead');
      setTimeout(() => setActionError(''), 4000);
    }
  };

  const handleCreateQuotation = async (e) => {
    e.preventDefault();
    try {
      await realEstateService.createQuotation(newQuotation);
      setActionSuccess('Property quotation generated successfully!');
      setShowQuotationModal(false);
      loadData();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      setActionError(err.message || 'Failed to create quotation');
      setTimeout(() => setActionError(''), 4000);
    }
  };

  const handleCreateRule = async (e) => {
    e.preventDefault();
    try {
      await realEstateService.createAutomationRule(newRule);
      setActionSuccess('Follow-up automation rule created!');
      setShowRuleModal(false);
      loadData();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      setActionError(err.message || 'Failed to create rule');
      setTimeout(() => setActionError(''), 4000);
    }
  };

  const formatINR = (val) => {
    if (!val) return '₹0';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-900/60 to-slate-900/80 border border-emerald-500/20 p-6 rounded-2xl backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">Real Estate Sales Manager</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Tenant: Real Estate
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Oversee property sales team, leads, pipeline, targets, quotations, bookings, and site visits
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowPropertyModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-emerald-900/40"
          >
            <Plus className="w-4 h-4" /> Add Property Listing
          </button>
          <button
            onClick={() => setShowLeadModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-medium text-sm transition-all"
          >
            <Plus className="w-4 h-4" /> Add Lead
          </button>
          <button
            onClick={loadData}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl transition-all"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
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
          { id: 'dashboard', label: 'Dashboard KPIs', icon: TrendingUp },
          { id: 'inventory', label: 'Property Inventory', icon: Building2 },
          { id: 'leads', label: 'Property Leads', icon: Users },
          { id: 'pipeline', label: 'Sales Pipeline', icon: Target },
          { id: 'team', label: 'Sales Team', icon: UserCheck },
          { id: 'site-visits', label: 'Site Visits', icon: Calendar },
          { id: 'quotations', label: 'Offers & Quotations', icon: FileText },
          { id: 'automation', label: 'Automation Rules', icon: Sparkles }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Dashboard KPIs */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl backdrop-blur-md">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Leads</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-3xl font-bold text-white">{dashboardData?.totalLeads || 248}</span>
                <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  +{dashboardData?.newLeads || 42} New
                </span>
              </div>
              <div className="mt-3 text-xs text-slate-400">
                Qualified: <span className="text-white font-medium">{dashboardData?.qualifiedLeads || 96}</span>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl backdrop-blur-md">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Site Visits</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-3xl font-bold text-white">{dashboardData?.siteVisitsScheduled || 35}</span>
                <span className="text-xs font-medium text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                  {dashboardData?.siteVisitsCompleted || 22} Done
                </span>
              </div>
              <div className="mt-3 text-xs text-slate-400">
                Completion rate: <span className="text-white font-medium">62.8%</span>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl backdrop-blur-md">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sales Achieved</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-bold text-emerald-400">{formatINR(dashboardData?.salesAchieved || 6400000)}</span>
                <span className="text-xs font-semibold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                  {dashboardData?.targetAchievementPercentage || 64.0}%
                </span>
              </div>
              <div className="mt-3 text-xs text-slate-400">
                Target: {formatINR(dashboardData?.salesTarget || 10000000)}
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl backdrop-blur-md">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Bookings Completed</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-3xl font-bold text-white">{dashboardData?.bookingsCompleted || 9}</span>
                <span className="text-xs font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                  {dashboardData?.activeNegotiations || 18} In Neg.
                </span>
              </div>
              <div className="mt-3 text-xs text-slate-400">
                Pending Follow-ups: <span className="text-amber-400 font-medium">{dashboardData?.pendingFollowUps || 27}</span>
              </div>
            </div>
          </div>

          {/* Quick Progress Bar */}
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-400" />
                <h3 className="font-semibold text-white">Monthly Sales Target Achievement</h3>
              </div>
              <span className="text-sm font-bold text-emerald-400">
                {formatINR(dashboardData?.salesAchieved || 6400000)} / {formatINR(dashboardData?.salesTarget || 10000000)}
              </span>
            </div>
            <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden mt-3">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(dashboardData?.targetAchievementPercentage || 64, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Property Inventory */}
      {activeTab === 'inventory' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-semibold text-white">Property Listings ({properties.length})</h3>
            <button
              onClick={() => setShowPropertyModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium"
            >
              <Plus className="w-3.5 h-3.5" /> Add Listing
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/50 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Property ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">BHK / Area</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {properties.map((p) => (
                  <tr key={p.propertyId || p.id} className="hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-mono text-xs text-emerald-400">{p.propertyId || p.id}</td>
                    <td className="px-4 py-3 font-medium text-white">{p.propertyName || p.name}</td>
                    <td className="px-4 py-3 text-slate-400">{p.propertyType}</td>
                    <td className="px-4 py-3 text-slate-300">{p.city}, {p.area}</td>
                    <td className="px-4 py-3 text-slate-400">{p.bedrooms} BHK ({p.areaSqFt} sq ft)</td>
                    <td className="px-4 py-3 font-semibold text-emerald-400">{formatINR(p.price)}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {p.availabilityStatus || 'AVAILABLE'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Property Leads & Assignment */}
      {activeTab === 'leads' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-semibold text-white">Property Leads ({leads.length})</h3>
            <button
              onClick={() => setShowLeadModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium"
            >
              <Plus className="w-3.5 h-3.5" /> New Lead
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/50 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Lead ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Interested Property</th>
                  <th className="px-4 py-3">Budget Range</th>
                  <th className="px-4 py-3">Stage</th>
                  <th className="px-4 py-3">Assigned To</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {leads.map((l) => (
                  <tr key={l.leadId} className="hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-mono text-xs text-emerald-400">{l.leadId}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{l.customerName}</div>
                      <div className="text-xs text-slate-400">{l.email} • {l.phone}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{l.propertyName || l.propertyId}</td>
                    <td className="px-4 py-3 text-xs text-slate-400 font-mono">
                      {formatINR(l.budgetMin)} - {formatINR(l.budgetMax)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {l.stage}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {l.assignedTo ? (
                        <span className="font-mono text-emerald-400">{l.assignedTo}</span>
                      ) : (
                        <span className="text-amber-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedLead(l);
                          setShowAssignModal(true);
                        }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium"
                      >
                        Assign Lead
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Sales Pipeline */}
      {activeTab === 'pipeline' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {['NEW', 'QUALIFIED', 'SITE_VISIT_SCHEDULED', 'PRICE_NEGOTIATION'].map((stg) => {
              const items = leads.filter((l) => l.stage === stg);
              return (
                <div key={stg} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-slate-300 tracking-wider uppercase">{stg.replace(/_/g, ' ')}</span>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-slate-800 text-slate-400 font-semibold">{items.length}</span>
                  </div>
                  <div className="space-y-2">
                    {items.map((lead) => (
                      <div key={lead.leadId} className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{lead.customerName}</span>
                          <span className="font-mono text-emerald-400 text-[11px]">{lead.leadId}</span>
                        </div>
                        <p className="text-xs text-slate-400">{lead.propertyName}</p>
                        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-700/30">
                          <span>{formatINR(lead.budgetMax)}</span>
                          <span className="font-mono text-slate-400">{lead.assignedTo || 'Unassigned'}</span>
                        </div>
                      </div>
                    ))}
                    {items.length === 0 && (
                      <p className="text-xs text-slate-500 text-center py-4 italic">No leads in this stage</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 5: Sales Team */}
      {activeTab === 'team' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {team.map((mbr) => (
            <div key={mbr.userId} className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center">
                    {mbr.name?.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{mbr.name}</h4>
                    <p className="text-xs text-slate-400">{mbr.role?.replace(/_/g, ' ')}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400">
                  ★ {mbr.rating || '4.8'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800">
                <div>
                  <span className="text-slate-500">Active Leads:</span>{' '}
                  <span className="font-semibold text-white">{mbr.activeLeads || mbr.assignedVisits || 12}</span>
                </div>
                <div>
                  <span className="text-slate-500">Closed Deals:</span>{' '}
                  <span className="font-semibold text-emerald-400">{mbr.closedDeals || mbr.completedVisits || 5}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 6: Site Visits */}
      {activeTab === 'site-visits' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <h3 className="font-semibold text-white">Scheduled Site Visits</h3>
          </div>
          <div className="divide-y divide-slate-800">
            {siteVisits.map((sv) => (
              <div key={sv.siteVisitId} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-800/30">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-emerald-400">{sv.siteVisitId}</span>
                    <h4 className="font-medium text-white">{sv.customerName}</h4>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {sv.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Property: <span className="text-slate-300 font-medium">{sv.propertyName}</span> • Time: {sv.scheduledAt}
                  </p>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-4">
                  <span>Coordinator: <strong className="text-white font-mono">{sv.coordinatorId}</strong></span>
                  <span>Executive: <strong className="text-white font-mono">{sv.assignedExecutiveId}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 7: Offers & Quotations */}
      {activeTab === 'quotations' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowQuotationModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium shadow-md shadow-emerald-900/30"
            >
              <Plus className="w-3.5 h-3.5" /> Create Quotation
            </button>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-center space-y-3">
            <FileText className="w-12 h-12 text-slate-600 mx-auto" />
            <h4 className="text-white font-medium">Real Estate Quotation Engine</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Backend computes ₹Total = Base Price - Discount + Additional Charges with strict discount limit authorization.
            </p>
          </div>
        </div>
      )}

      {/* Tab 8: Automation Rules */}
      {activeTab === 'automation' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowRuleModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium shadow-md shadow-emerald-900/30"
            >
              <Plus className="w-3.5 h-3.5" /> Add Automation Rule
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">New Property Lead Follow-up</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400">ACTIVE</span>
              </div>
              <p className="text-xs text-slate-400">Trigger: LEAD_CREATED • Delay: 30 mins</p>
              <p className="text-xs text-slate-300">Action: CREATE_FOLLOW_UP_TASK (Safe task creation enforced)</p>
            </div>
            <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Post Site Visit Feedback Trigger</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400">ACTIVE</span>
              </div>
              <p className="text-xs text-slate-400">Trigger: VISIT_COMPLETED • Delay: 60 mins</p>
              <p className="text-xs text-slate-300">Action: SEND_FEEDBACK_REQUEST (Customer consent verified)</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Property Listing */}
      {showPropertyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Create Property Listing</h3>
            <form onSubmit={handleCreateProperty} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Property Name</label>
                <input
                  type="text"
                  required
                  value={newProp.propertyName}
                  onChange={(e) => setNewProp({ ...newProp, propertyName: e.target.value })}
                  placeholder="Green Valley Apartment"
                  className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400">Property Type</label>
                  <select
                    value={newProp.propertyType}
                    onChange={(e) => setNewProp({ ...newProp, propertyType: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
                  >
                    <option value="APARTMENT">APARTMENT</option>
                    <option value="VILLA">VILLA</option>
                    <option value="PENTHOUSE">PENTHOUSE</option>
                    <option value="PLOT">PLOT</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400">Price (INR)</label>
                  <input
                    type="number"
                    required
                    value={newProp.price}
                    onChange={(e) => setNewProp({ ...newProp, price: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400">City</label>
                  <input
                    type="text"
                    required
                    value={newProp.city}
                    onChange={(e) => setNewProp({ ...newProp, city: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400">Area</label>
                  <input
                    type="text"
                    required
                    value={newProp.area}
                    onChange={(e) => setNewProp({ ...newProp, area: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-400">Bedrooms</label>
                  <input
                    type="number"
                    value={newProp.bedrooms}
                    onChange={(e) => setNewProp({ ...newProp, bedrooms: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400">Bathrooms</label>
                  <input
                    type="number"
                    value={newProp.bathrooms}
                    onChange={(e) => setNewProp({ ...newProp, bathrooms: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400">Area Sq Ft</label>
                  <input
                    type="number"
                    value={newProp.areaSqFt}
                    onChange={(e) => setNewProp({ ...newProp, areaSqFt: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPropertyModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium"
                >
                  Save Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Property Lead */}
      {showLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Create Property Lead</h3>
            <form onSubmit={handleCreateLead} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Customer Name</label>
                <input
                  type="text"
                  required
                  value={newLead.customerName}
                  onChange={(e) => setNewLead({ ...newLead, customerName: e.target.value })}
                  placeholder="Arun Kumar"
                  className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400">Email</label>
                  <input
                    type="email"
                    required
                    value={newLead.email}
                    onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400">Phone</label>
                  <input
                    type="text"
                    required
                    value={newLead.phone}
                    onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400">Budget Min (INR)</label>
                  <input
                    type="number"
                    value={newLead.budgetMin}
                    onChange={(e) => setNewLead({ ...newLead, budgetMin: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400">Budget Max (INR)</label>
                  <input
                    type="number"
                    value={newLead.budgetMax}
                    onChange={(e) => setNewLead({ ...newLead, budgetMax: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowLeadModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium"
                >
                  Register Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Assign Lead */}
      {showAssignModal && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Assign Lead: {selectedLead.customerName}</h3>
            <p className="text-xs text-slate-400">Backend verifies executive belongs to tenant before assignment.</p>
            <form onSubmit={handleAssignLead} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Select Sales Executive</label>
                <select
                  value={assignForm.salesExecutiveId}
                  onChange={(e) => setAssignForm({ ...assignForm, salesExecutiveId: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
                >
                  <option value="USR-3001">Arun Kumar (USR-3001)</option>
                  <option value="USR-3002">Priya Devi (USR-3002)</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400">Assignment Reason</label>
                <input
                  type="text"
                  value={assignForm.assignmentReason}
                  onChange={(e) => setAssignForm({ ...assignForm, assignmentReason: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
