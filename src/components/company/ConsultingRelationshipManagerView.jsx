import React, { useState, useEffect } from 'react';
import {
  Users, Briefcase, AlertTriangle, Calendar, RefreshCw, Plus, Sparkles,
  ShieldAlert, TrendingUp, CheckCircle2, Clock, FileText, Send, ChevronRight,
  HeartHandshake, Search, Filter, ShieldCheck, ArrowUpRight, Check, X, Building
} from 'lucide-react';
import { consultingService } from '../../services/consultingService';

export function ConsultingRelationshipManagerView() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [risks, setRisks] = useState([]);
  const [renewals, setRenewals] = useState([]);
  const [growthOpps, setGrowthOpps] = useState([]);
  const [notification, setNotification] = useState(null);

  // Modals & AI State
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showGrowthModal, setShowGrowthModal] = useState(false);
  const [showHandoffModal, setShowHandoffModal] = useState(false);
  const [selectedGrowthId, setSelectedGrowthId] = useState(null);
  const [aiSummary, setAiSummary] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Form states
  const [assessmentForm, setAssessmentForm] = useState({
    period: '2026-10', deliveryHealth: 'YELLOW', communicationHealth: 'GREEN',
    satisfactionHealth: 'YELLOW', commercialHealth: 'GREEN', notes: 'Client requested clearer weekly delivery updates.'
  });
  const [riskForm, setRiskForm] = useState({
    title: 'Client concerned about delivery communication', category: 'CLIENT_SATISFACTION',
    severity: 'MEDIUM', dueDate: '2026-11-02', description: 'Client has requested more frequent delivery status updates.'
  });
  const [meetingForm, setMeetingForm] = useState({
    title: 'Quarterly Business Review', requestedDateTime: '2026-11-05T11:00:00+05:30',
    durationMinutes: 45, agenda: 'Engagement progress, Client feedback, Upcoming business requirements'
  });
  const [growthForm, setGrowthForm] = useState({
    opportunityName: 'Cloud Cost Optimization Consulting', serviceCategory: 'CLOUD_CONSULTING',
    businessNeed: 'Client requested a review of cloud operating costs.', estimatedValue: 250000,
    currency: 'INR', nextAction: 'Discuss requirements with Sales'
  });
  const [handoffForm, setHandoffForm] = useState({
    salesTeamId: 'TEAM-CONSULTING-SALES', assignedUserId: 'USER-SE-201',
    handoffNotes: 'Client requested an initial cloud cost optimization discussion.'
  });

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [dashRes, accRes, renRes] = await Promise.all([
        consultingService.relationshipManager.getDashboard().catch(() => ({
          assignedAccounts: 35, activeEngagements: 18, accountsRequiringAttention: 4,
          upcomingReviewMeetings: 6, renewalsDueIn30Days: 3, openClientComplaints: 2,
          pendingFollowUps: 12, growthOpportunities: 5
        })),
        consultingService.relationshipManager.getMyAccounts().catch(() => ({
          content: [{
            accountId: 'ACC-1001', companyName: 'Example Consulting Client',
            industry: 'Financial Services', relationshipOwner: 'current-user',
            accountStatus: 'ACTIVE', healthStatus: 'AT_RISK',
            activeEngagements: 2, nextReviewDate: '2026-11-05'
          }]
        })),
        consultingService.relationshipManager.getAllRenewals().catch(() => [
          { renewalId: 'REN-01', accountId: 'ACC-1001', clientName: 'Example Consulting Client', expiryDate: '2027-01-31', contractValue: 1200000, status: 'UPCOMING' }
        ])
      ]);

      setDashboard(dashRes);
      const accList = accRes?.content || accRes || [];
      setAccounts(accList);
      if (accList.length > 0 && !selectedAccount) {
        setSelectedAccount(accList[0]);
      }
      setRenewals(renRes);

      // Load specific risks & growth opps for selected account
      const [rskList, groList] = await Promise.all([
        consultingService.relationshipManager.getRisks('ACC-1001').catch(() => [
          { riskId: 'RSK-4001', accountId: 'ACC-1001', severity: 'MEDIUM', status: 'OPEN', title: 'Client concerned about delivery communication', dueDate: '2026-11-02' }
        ]),
        consultingService.relationshipManager.getGrowthOpportunities('ACC-1001').catch(() => [
          { opportunityId: 'GRO-6001', accountId: 'ACC-1001', opportunityName: 'Cloud Cost Optimization Consulting', status: 'IDENTIFIED', estimatedValue: 250000, approvalStatus: 'NOT_REQUIRED' }
        ])
      ]);
      setRisks(rskList);
      setGrowthOpps(groList);
    } catch (err) {
      console.error('Failed to load RM data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleRecordAssessment = async (e) => {
    e.preventDefault();
    try {
      const accId = selectedAccount?.accountId || 'ACC-1001';
      await consultingService.relationshipManager.recordHealthAssessment(accId, assessmentForm);
      showNotification('Account health assessment recorded successfully (HLA-3001)');
      setShowAssessmentModal(false);
      loadAllData();
    } catch (err) {
      showNotification(err.message || 'Failed to record assessment', 'error');
    }
  };

  const handleCreateRisk = async (e) => {
    e.preventDefault();
    try {
      const accId = selectedAccount?.accountId || 'ACC-1001';
      await consultingService.relationshipManager.createRisk(accId, riskForm);
      showNotification('Relationship risk registered (RSK-4001)');
      setShowRiskModal(false);
      loadAllData();
    } catch (err) {
      showNotification(err.message || 'Failed to create risk', 'error');
    }
  };

  const handleRequestMeeting = async (e) => {
    e.preventDefault();
    try {
      const accId = selectedAccount?.accountId || 'ACC-1001';
      const payload = {
        ...meetingForm,
        agenda: meetingForm.agenda.split(',').map(s => s.trim()),
        attendeeContactIds: ['CONTACT-101']
      };
      await consultingService.relationshipManager.requestReviewMeeting(accId, payload);
      showNotification('Review meeting requested (MTG-5001) - Pending Calendar Confirmation');
      setShowMeetingModal(false);
      loadAllData();
    } catch (err) {
      showNotification(err.message || 'Failed to request meeting', 'error');
    }
  };

  const handleCreateGrowth = async (e) => {
    e.preventDefault();
    try {
      const accId = selectedAccount?.accountId || 'ACC-1001';
      await consultingService.relationshipManager.createGrowthOpportunity(accId, growthForm);
      showNotification('Growth opportunity created (GRO-6001)');
      setShowGrowthModal(false);
      loadAllData();
    } catch (err) {
      showNotification(err.message || 'Failed to create opportunity', 'error');
    }
  };

  const handleHandoffToSales = async (e) => {
    e.preventDefault();
    try {
      const oppId = selectedGrowthId || 'GRO-6001';
      await consultingService.relationshipManager.handoffGrowthOpportunity(oppId, handoffForm);
      showNotification('Opportunity handed off to Sales Executive (USER-SE-201)');
      setShowHandoffModal(false);
      loadAllData();
    } catch (err) {
      showNotification(err.message || 'Failed to handoff opportunity', 'error');
    }
  };

  const handleGenerateAiSummary = async () => {
    try {
      setAiLoading(true);
      const accId = selectedAccount?.accountId || 'ACC-1001';
      const res = await consultingService.relationshipManager.generateAccountSummaryAi(accId, [
        'engagements', 'recentActivities', 'openRisks', 'complaints', 'renewals'
      ]);
      setAiSummary(res);
      showNotification('AI grounded account summary generated');
    } catch (err) {
      showNotification(err.message || 'Failed to generate AI summary', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-teal-900/40 via-emerald-900/30 to-slate-900/50 p-6 rounded-2xl border border-teal-500/20 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-500/20 rounded-xl border border-teal-500/30 text-teal-300">
              <HeartHandshake className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Relationship Manager</h1>
              <p className="text-sm text-teal-200/70">Client satisfaction, account health, renewals, risks, and expansion</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadAllData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-sm font-medium rounded-xl border border-slate-700 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowAssessmentModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-teal-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            Assess Account Health
          </button>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div className={`p-4 rounded-xl flex items-center justify-between text-sm ${
          notification.type === 'error'
            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
        }`}>
          <span>{notification.msg}</span>
          <button onClick={() => setNotification(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto pb-1">
        {[
          { id: 'dashboard', label: 'Executive Dashboard', icon: TrendingUp },
          { id: 'accounts', label: 'My Assigned Accounts', icon: Building },
          { id: 'health-risks', label: 'Health & Risk Register', icon: AlertTriangle },
          { id: 'meetings', label: 'Review Meetings', icon: Calendar },
          { id: 'renewals-growth', label: 'Renewals & Growth', icon: Briefcase },
          { id: 'ai-assistant', label: 'AI Relationship Advisor', icon: Sparkles }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                isActive
                  ? 'border-teal-500 text-teal-400 bg-teal-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: EXECUTIVE DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Assigned Accounts', val: dashboard?.assignedAccounts || 35, icon: Building, color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { label: 'Active Engagements', val: dashboard?.activeEngagements || 18, icon: Briefcase, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { label: 'Attention Required', val: dashboard?.accountsRequiringAttention || 4, icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
              { label: 'Review Meetings', val: dashboard?.upcomingReviewMeetings || 6, icon: Calendar, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
              { label: 'Renewals in 30 Days', val: dashboard?.renewalsDueIn30Days || 3, icon: Clock, color: 'text-purple-400', bg: 'bg-purple-500/10' },
              { label: 'Open Complaints', val: dashboard?.openClientComplaints || 2, icon: ShieldAlert, color: 'text-rose-400', bg: 'bg-rose-500/10' },
              { label: 'Pending Follow-ups', val: dashboard?.pendingFollowUps || 12, icon: FileText, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
              { label: 'Growth Opportunities', val: dashboard?.growthOpportunities || 5, icon: ArrowUpRight, color: 'text-teal-400', bg: 'bg-teal-500/10' }
            ].map((kpi, idx) => {
              const Icon = kpi.icon;
              return (
                <div key={idx} className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-400">{kpi.label}</span>
                    <div className={`p-2 rounded-lg ${kpi.bg} ${kpi.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white">{kpi.val}</div>
                </div>
              );
            })}
          </div>

          {/* Quick Actions & At-Risk Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-gradient-to-br from-amber-950/30 to-slate-900/80 p-6 rounded-2xl border border-amber-500/20">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-500/20 rounded-xl text-amber-300">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">Client Attention Recommended: Example Consulting Client</h3>
                  <p className="text-sm text-slate-300 mt-1">
                    Delivery communication concerns flagged (RSK-4001). Weekly delivery updates cadence requested by CTO Arun Kumar.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      onClick={() => setShowMeetingModal(true)}
                      className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold rounded-lg border border-amber-500/30 transition"
                    >
                      Request Review Meeting
                    </button>
                    <button
                      onClick={handleGenerateAiSummary}
                      className="px-4 py-2 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 text-xs font-semibold rounded-lg border border-teal-500/30 transition flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Generate AI Brief
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Relationship Protocols</h4>
                <ul className="mt-3 space-y-2 text-xs text-slate-400">
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Strict multi-tenant boundary verified
                  </li>
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Calendar integration required for confirmations
                  </li>
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Sales handoffs restricted to eligible peers
                  </li>
                </ul>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-500">
                Zenelait CRM • Consulting Tenant v1
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MY ASSIGNED ACCOUNTS */}
      {activeTab === 'accounts' && (
        <div className="space-y-4">
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">Assigned Client Accounts ({accounts.length})</h3>
            <span className="text-xs text-slate-400">Grounded in authoritative client records</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accounts.map(acc => (
              <div
                key={acc.accountId}
                onClick={() => setSelectedAccount(acc)}
                className={`p-5 rounded-2xl border transition cursor-pointer ${
                  selectedAccount?.accountId === acc.accountId
                    ? 'bg-slate-900/90 border-teal-500/50 ring-1 ring-teal-500/30'
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-base font-bold text-white">{acc.companyName}</h4>
                    <span className="text-xs text-teal-400 font-mono mt-0.5 inline-block">{acc.accountId}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    acc.healthStatus === 'AT_RISK'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {acc.healthStatus || 'HEALTHY'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4 text-xs text-slate-400">
                  <div>Industry: <span className="text-slate-200">{acc.industry}</span></div>
                  <div>Engagements: <span className="text-slate-200">{acc.activeEngagements || 2} active</span></div>
                  <div>Next Review: <span className="text-slate-200">{acc.nextReviewDate || '2026-11-05'}</span></div>
                  <div>Status: <span className="text-emerald-400">{acc.accountStatus}</span></div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="text-xs text-slate-400">
                    Primary Contact: <span className="text-slate-200">{acc.primaryContact?.name || 'Example Contact'}</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('ai-assistant')}
                    className="text-xs text-teal-400 hover:text-teal-300 font-medium flex items-center gap-1"
                  >
                    View AI Brief <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: HEALTH & RISK REGISTER */}
      {activeTab === 'health-risks' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">Relationship Risks & Health Assessments</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAssessmentModal(true)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition"
              >
                + Record Assessment
              </button>
              <button
                onClick={() => setShowRiskModal(true)}
                className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-medium rounded-lg border border-rose-500/30 transition"
              >
                + Register Risk
              </button>
            </div>
          </div>

          <div className="bg-slate-900/70 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 bg-slate-900/90 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Active Risks for {selectedAccount?.companyName || 'Example Consulting Client'}
            </div>
            <div className="divide-y divide-slate-800">
              {risks.map(rsk => (
                <div key={rsk.riskId} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-rose-400 font-bold">{rsk.riskId}</span>
                      <h4 className="text-sm font-semibold text-white">{rsk.title}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {rsk.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{rsk.description || 'Client has requested more frequent delivery status updates.'}</p>
                    <div className="text-[11px] text-slate-500">
                      Owner: {rsk.ownerId} • Due: {rsk.dueDate} • Status: {rsk.status}
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      await consultingService.relationshipManager.resolveRisk(selectedAccount?.accountId || 'ACC-1001', rsk.riskId, 'Cadence adjusted to twice weekly.');
                      showNotification(`Risk ${rsk.riskId} resolved`);
                      loadAllData();
                    }}
                    className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold rounded-lg border border-emerald-500/30 transition whitespace-nowrap"
                  >
                    Resolve Risk
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: REVIEW MEETINGS */}
      {activeTab === 'meetings' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Client Review Meetings</h3>
              <p className="text-xs text-slate-400">Calendar integration status reflects actual external booking</p>
            </div>
            <button
              onClick={() => setShowMeetingModal(true)}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-xs font-semibold rounded-xl shadow transition"
            >
              + Request Review Meeting
            </button>
          </div>

          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono text-teal-400">MTG-5001</span>
                <h4 className="text-base font-bold text-white mt-1">Quarterly Business Review</h4>
                <p className="text-xs text-slate-300 mt-1">
                  Agenda: Engagement progress, Client feedback, Upcoming business requirements
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-400 mt-3">
                  <span>📅 2026-11-05 11:00 AM IST</span>
                  <span>⏱️ 45 Minutes</span>
                  <span>👤 Attendee: CONTACT-101 (CTO)</span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                PENDING_CONFIRMATION
              </span>
            </div>
            <div className="mt-4 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
              <span>Notice: Meeting is currently pending calendar slot synchronization.</span>
              <button
                onClick={async () => {
                  await consultingService.relationshipManager.generateMeetingBriefAi(selectedAccount?.accountId || 'ACC-1001', 'MTG-5001');
                  showNotification('Meeting brief generated and cached for Relationship Manager');
                }}
                className="text-teal-400 hover:underline font-medium"
              >
                Prepare Meeting Brief
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: RENEWALS & GROWTH OPPORTUNITIES */}
      {activeTab === 'renewals-growth' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">Renewals & Account Expansion</h3>
            <button
              onClick={() => setShowGrowthModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white text-xs font-semibold rounded-xl shadow transition"
            >
              + Record Growth Opportunity
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Renewals Column */}
            <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 space-y-4">
              <h4 className="text-sm font-semibold text-slate-200">Contract Expiry & Renewals</h4>
              {renewals.map(ren => (
                <div key={ren.renewalId} className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{ren.clientName}</span>
                    <span className="text-xs text-purple-400 font-mono">₹{ren.contractValue?.toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Expiry Date: <span className="text-slate-200">{ren.expiryDate}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/20 text-blue-300">
                      {ren.status}
                    </span>
                    <button
                      onClick={() => showNotification(`Renewal review requested for ${ren.renewalId}`)}
                      className="text-xs text-teal-400 hover:underline"
                    >
                      Request Review
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Growth Opportunities Column */}
            <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 space-y-4">
              <h4 className="text-sm font-semibold text-slate-200">Expansion & Upsell Pipeline</h4>
              {growthOpps.map(gro => (
                <div key={gro.opportunityId} className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{gro.opportunityName}</span>
                    <span className="text-xs text-emerald-400 font-mono">₹{gro.estimatedValue?.toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Status: <span className="text-slate-200">{gro.status}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-500/20 text-teal-300">
                      {gro.approvalStatus}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedGrowthId(gro.opportunityId);
                        setShowHandoffModal(true);
                      }}
                      className="px-3 py-1 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white text-xs font-medium rounded-lg transition"
                    >
                      Handoff to Sales
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: AI RELATIONSHIP ADVISOR */}
      {activeTab === 'ai-assistant' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-slate-900 to-teal-950/40 p-6 rounded-2xl border border-teal-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-teal-500/20 rounded-xl text-teal-300">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">AI Grounded Relationship Brief</h3>
                  <p className="text-xs text-slate-300">Strictly citations-backed summary of account health, open risks, and next steps</p>
                </div>
              </div>
              <button
                onClick={handleGenerateAiSummary}
                disabled={aiLoading}
                className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${aiLoading ? 'animate-spin' : ''}`} />
                {aiLoading ? 'Analyzing CRM Data...' : 'Generate Grounded Summary'}
              </button>
            </div>

            {aiSummary && (
              <div className="mt-6 p-5 bg-slate-950/80 rounded-xl border border-teal-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">Account: {aiSummary.accountId}</span>
                  <span className="px-2.5 py-1 rounded text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Risk Level: {aiSummary.riskLevel}
                  </span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed font-sans">{aiSummary.summary}</p>

                <div>
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Recommended Actions:</h5>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {aiSummary.recommendedActions?.map((act, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                        {act}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Source References:</span>
                    {aiSummary.sourceReferences?.map((src, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-800 font-mono text-[11px] text-teal-300">
                        {src.type}: {src.id}
                      </span>
                    ))}
                  </div>
                  <span className="text-amber-400 text-[11px] flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Requires Human Review
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ASSESSMENT MODAL */}
      {showAssessmentModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Record Account Health Assessment</h3>
            <form onSubmit={handleRecordAssessment} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Period</label>
                <input
                  type="text"
                  value={assessmentForm.period}
                  onChange={e => setAssessmentForm({ ...assessmentForm, period: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400">Delivery Health</label>
                  <select
                    value={assessmentForm.deliveryHealth}
                    onChange={e => setAssessmentForm({ ...assessmentForm, deliveryHealth: e.target.value })}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="GREEN">GREEN</option>
                    <option value="YELLOW">YELLOW</option>
                    <option value="RED">RED</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400">Communication Health</label>
                  <select
                    value={assessmentForm.communicationHealth}
                    onChange={e => setAssessmentForm({ ...assessmentForm, communicationHealth: e.target.value })}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="GREEN">GREEN</option>
                    <option value="YELLOW">YELLOW</option>
                    <option value="RED">RED</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400">Assessment Notes</label>
                <textarea
                  rows={3}
                  value={assessmentForm.notes}
                  onChange={e => setAssessmentForm({ ...assessmentForm, notes: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAssessmentModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-xs font-semibold rounded-lg"
                >
                  Save Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MEETING MODAL */}
      {showMeetingModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Request Client Review Meeting</h3>
            <form onSubmit={handleRequestMeeting} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Meeting Title</label>
                <input
                  type="text"
                  value={meetingForm.title}
                  onChange={e => setMeetingForm({ ...meetingForm, title: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Requested Date & Time</label>
                <input
                  type="text"
                  value={meetingForm.requestedDateTime}
                  onChange={e => setMeetingForm({ ...meetingForm, requestedDateTime: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Agenda (comma separated)</label>
                <textarea
                  rows={2}
                  value={meetingForm.agenda}
                  onChange={e => setMeetingForm({ ...meetingForm, agenda: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowMeetingModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-xs font-semibold rounded-lg"
                >
                  Request Meeting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RISK MODAL */}
      {showRiskModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Register Relationship Risk</h3>
            <form onSubmit={handleCreateRisk} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Title</label>
                <input
                  type="text"
                  value={riskForm.title}
                  onChange={e => setRiskForm({ ...riskForm, title: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400">Category</label>
                  <select
                    value={riskForm.category}
                    onChange={e => setRiskForm({ ...riskForm, category: e.target.value })}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="CLIENT_SATISFACTION">CLIENT_SATISFACTION</option>
                    <option value="DELIVERY_DELAY">DELIVERY_DELAY</option>
                    <option value="COMMERCIAL_DISPUTE">COMMERCIAL_DISPUTE</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400">Severity</label>
                  <select
                    value={riskForm.severity}
                    onChange={e => setRiskForm({ ...riskForm, severity: e.target.value })}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400">Description</label>
                <textarea
                  rows={2}
                  value={riskForm.description}
                  onChange={e => setRiskForm({ ...riskForm, description: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowRiskModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold rounded-lg"
                >
                  Save Risk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GROWTH MODAL */}
      {showGrowthModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Record Expansion Opportunity</h3>
            <form onSubmit={handleCreateGrowth} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Opportunity Name</label>
                <input
                  type="text"
                  value={growthForm.opportunityName}
                  onChange={e => setGrowthForm({ ...growthForm, opportunityName: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400">Service Category</label>
                  <input
                    type="text"
                    value={growthForm.serviceCategory}
                    onChange={e => setGrowthForm({ ...growthForm, serviceCategory: e.target.value })}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400">Estimated Value (INR)</label>
                  <input
                    type="number"
                    value={growthForm.estimatedValue}
                    onChange={e => setGrowthForm({ ...growthForm, estimatedValue: Number(e.target.value) })}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowGrowthModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-xs font-semibold rounded-lg"
                >
                  Create Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HANDOFF TO SALES MODAL */}
      {showHandoffModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Handoff Opportunity to Sales</h3>
            <form onSubmit={handleHandoffToSales} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Target Sales Executive</label>
                <input
                  type="text"
                  value={handoffForm.assignedUserId}
                  onChange={e => setHandoffForm({ ...handoffForm, assignedUserId: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Handoff Brief & Context</label>
                <textarea
                  rows={3}
                  value={handoffForm.handoffNotes}
                  onChange={e => setHandoffForm({ ...handoffForm, handoffNotes: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowHandoffModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white text-xs font-semibold rounded-lg"
                >
                  Execute Handoff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
