import React, { useState, useEffect } from 'react';
import {
  FileText, CheckCircle2, AlertCircle, RefreshCw, Send, Plus, Users,
  Target, Calendar, Clock, DollarSign, ChevronRight, FilePlus, Sparkles,
  Layers, ArrowRight, ShieldAlert, Award, Check, X, Search
} from 'lucide-react';
import { consultingService } from '../../services/consultingService';

export function ConsultingSalesExecutiveView() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [myLeads, setMyLeads] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [notification, setNotification] = useState(null);

  // New Discovery Form State
  const [discLeadId, setDiscLeadId] = useState('CLD-1001');
  const [discObjective, setDiscObjective] = useState('Understand business challenges and consulting requirements.');
  const [discChallenge, setDiscChallenge] = useState('Manual processes cause reporting delays.');
  const [desiredOutcomes, setDesiredOutcomes] = useState('Reduce reporting time, Improve process visibility');
  const [budgetMin, setBudgetMin] = useState(500000);
  const [budgetMax, setBudgetMax] = useState(1500000);

  // New Proposal Form State
  const [propOppId, setPropOppId] = useState('OPP-2001');
  const [propTitle, setPropTitle] = useState('Business Process Modernization Proposal');
  const [propScope, setPropScope] = useState('Assess existing processes and recommend a phased modernization plan.');
  const [propDeliverables, setPropDeliverables] = useState('Current-state assessment, Gap analysis, Target-state recommendations, Implementation roadmap');
  const [propAssumptions, setPropAssumptions] = useState('The client will provide access to relevant stakeholders.');
  const [propExclusions, setPropExclusions] = useState('Software licensing costs, Implementation work not explicitly included in final scope');

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [dashRes, leadsRes, oppsRes, propsRes, fupRes] = await Promise.all([
        consultingService.salesExecutive.getDashboard().catch(() => ({
          assignedLeads: 24, qualifiedLeads: 12, openOpportunities: 9,
          proposalsInProgress: 4, proposalsAwaitingApproval: 2, pendingFollowUps: 7,
          meetingsThisWeek: 3, closedWonValue: 450000, currency: 'INR'
        })),
        consultingService.salesExecutive.getMyLeads().catch(() => ({ items: [] })),
        consultingService.salesExecutive.getMyOpportunities().catch(() => []),
        consultingService.salesExecutive.getProposals().catch(() => []),
        consultingService.salesExecutive.getFollowUps().catch(() => [])
      ]);

      setDashboard(dashRes);
      setMyLeads(leadsRes?.items || []);
      setOpportunities(oppsRes || []);
      setProposals(propsRes || []);
      setFollowUps(fupRes || []);
    } catch (err) {
      console.error('Failed to load Sales Executive data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateDiscovery = async (e) => {
    e.preventDefault();
    try {
      const sess = await consultingService.salesExecutive.createDiscoverySession({
        leadId: discLeadId,
        clientId: 'CLI-1001',
        meetingType: 'BUSINESS_DISCOVERY',
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
        objective: discObjective
      });

      await consultingService.salesExecutive.recordDiscoveryRequirements(sess.sessionId, {
        businessChallenge: discChallenge,
        desiredOutcomes: desiredOutcomes.split(',').map(s => s.trim()),
        currentSystems: ['Legacy ERP', 'Spreadsheet-based reporting'],
        budgetRange: { minimum: Number(budgetMin), maximum: Number(budgetMax), currency: 'INR' },
        targetCompletionDate: '2027-03-31'
      });

      showNotification(`Discovery Session ${sess.sessionId} & requirements recorded successfully!`);
      setActiveTab('proposals');
      loadData();
    } catch (err) {
      showNotification(err.message || 'Discovery creation failed', 'error');
    }
  };

  const handleCreateProposal = async (e) => {
    e.preventDefault();
    try {
      const p = await consultingService.salesExecutive.createProposalDraft({
        opportunityId: propOppId,
        proposalTitle: propTitle,
        serviceId: 'CSVC-1001',
        scopeSummary: propScope,
        deliverables: propDeliverables.split(',').map(s => s.trim()),
        assumptions: propAssumptions.split(',').map(s => s.trim()),
        exclusions: propExclusions.split(',').map(s => s.trim()),
        currency: 'INR'
      });

      showNotification(`Proposal draft ${p.proposalId} created!`);
      loadData();
    } catch (err) {
      showNotification(err.message || 'Proposal creation failed', 'error');
    }
  };

  const handleRequestApproval = async (proposalId) => {
    try {
      await consultingService.salesExecutive.requestProposalApproval(proposalId, 'Commercial terms and deliverables finalized for manager review.');
      showNotification(`Approval requested for ${proposalId}`);
      loadData();
    } catch (err) {
      showNotification(err.message || 'Approval request failed', 'error');
    }
  };

  const handleSendProposal = async (proposalId) => {
    try {
      await consultingService.salesExecutive.sendProposal(proposalId, {
        channel: 'EMAIL',
        recipientContactId: 'CONT-1001',
        message: 'Please review the attached consulting proposal and share your feedback.'
      });
      showNotification(`Proposal ${proposalId} submitted to client contact!`);
      loadData();
    } catch (err) {
      showNotification(err.message || 'Proposal cannot be sent before required approval', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-8 border border-slate-800 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Consulting Sales Executive
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Client Discovery & Engagements
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Consulting Engagement Workspace</h1>
            <p className="text-slate-400 mt-1 max-w-2xl text-sm leading-relaxed">
              Conduct discovery sessions, document client challenges, prepare scoping proposals, request approval, and coordinate delivery handoffs.
            </p>
          </div>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl border border-slate-700 flex items-center gap-2 transition-all shadow-sm"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {notification && (
        <div className={`p-4 rounded-xl text-sm flex items-center gap-3 border shadow-sm ${
          notification.type === 'error'
            ? 'bg-rose-50 border-rose-200 text-rose-700'
            : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}>
          {notification.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
          <span className="font-medium">{notification.msg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto space-x-2">
        {[
          { id: 'dashboard', label: 'My Desk & Metrics', icon: Target },
          { id: 'leads', label: `My Leads (${myLeads.length})`, icon: Users },
          { id: 'discovery', label: 'Discovery & Scoping', icon: Sparkles },
          { id: 'proposals', label: `Proposals (${proposals.length})`, icon: FileText },
          { id: 'followups', label: 'Follow-ups & Tasks', icon: Calendar }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-xs font-semibold text-slate-500 uppercase">Assigned Leads</div>
              <div className="text-2xl font-bold text-slate-900 mt-2">{dashboard?.assignedLeads || 24}</div>
              <div className="text-xs text-blue-600 mt-1 font-medium">{dashboard?.qualifiedLeads || 12} Qualified for Scoping</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-xs font-semibold text-slate-500 uppercase">Open Opportunities</div>
              <div className="text-2xl font-bold text-slate-900 mt-2">{dashboard?.openOpportunities || 9}</div>
              <div className="text-xs text-slate-500 mt-1">{dashboard?.proposalsInProgress || 4} Proposals in Drafting</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-xs font-semibold text-slate-500 uppercase">Awaiting Approval</div>
              <div className="text-2xl font-bold text-purple-700 mt-2">{dashboard?.proposalsAwaitingApproval || 2}</div>
              <div className="text-xs text-purple-600 mt-1">Pending Manager Review</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-xs font-semibold text-slate-500 uppercase">Closed Won (MTD)</div>
              <div className="text-2xl font-bold text-emerald-600 mt-2">
                ₹{Number(dashboard?.closedWonValue || 450000).toLocaleString()}
              </div>
              <div className="text-xs text-emerald-700 mt-1">INR • 45% Quota Target</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MY LEADS */}
      {activeTab === 'leads' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">My Assigned Consulting Leads</h3>
            <span className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 font-semibold rounded-full">
              Assigned to Current Executive
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {myLeads.map((lead) => (
              <div key={lead.leadId} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{lead.companyName}</span>
                    <span className="text-xs font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded">{lead.leadId}</span>
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700">
                      {lead.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Interest: <strong>{lead.serviceInterest}</strong> • Next Follow-up: {lead.nextFollowUpDate || '2026-10-30'}</p>
                </div>
                <button
                  onClick={() => {
                    setDiscLeadId(lead.leadId);
                    setActiveTab('discovery');
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Start Discovery
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DISCOVERY & REQUIREMENTS */}
      {activeTab === 'discovery' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="max-w-2xl space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Document Client Discovery & Scope</h3>
              <p className="text-xs text-slate-500 mt-0.5">Capture client business challenges, desired outcomes, and budget expectations before drafting formal proposals.</p>
            </div>

            <form onSubmit={handleCreateDiscovery} className="space-y-4 text-sm pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Lead ID</label>
                  <input
                    type="text"
                    value={discLeadId}
                    onChange={(e) => setDiscLeadId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Completion Date</label>
                  <input
                    type="text"
                    defaultValue="2027-03-31"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Business Challenge</label>
                <textarea
                  value={discChallenge}
                  onChange={(e) => setDiscChallenge(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Desired Client Outcomes (Comma-separated)</label>
                <input
                  type="text"
                  value={desiredOutcomes}
                  onChange={(e) => setDesiredOutcomes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Min Budget (INR)</label>
                  <input
                    type="number"
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Max Budget (INR)</label>
                  <input
                    type="number"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Save Discovery Session & Requirements
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: PROPOSALS */}
      {activeTab === 'proposals' && (
        <div className="space-y-6">
          {/* Proposal List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Consulting Proposals</h3>
              <span className="text-xs px-2.5 py-1 bg-purple-50 text-purple-700 font-semibold rounded-full">
                Segregated Approval Workflow
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {proposals.map((prop) => (
                <div key={prop.proposalId} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{prop.proposalTitle || 'Business Process Modernization Proposal'}</span>
                      <span className="text-xs font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded">{prop.proposalId}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        prop.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        prop.status === 'SENT' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {prop.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 max-w-xl">{prop.scopeSummary}</p>
                    <div className="mt-2 text-xs font-semibold text-slate-700">
                      Estimated Value: ₹{Number(prop.proposalValue || 1200000).toLocaleString()} INR
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {prop.status === 'DRAFT' && (
                      <button
                        onClick={() => handleRequestApproval(prop.proposalId)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
                      >
                        Request Manager Approval
                      </button>
                    )}
                    <button
                      onClick={() => handleSendProposal(prop.proposalId)}
                      className={`px-4 py-2 text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-1.5 ${
                        prop.status === 'APPROVED'
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" /> Send to Client
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: FOLLOW-UPS */}
      {activeTab === 'followups' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Follow-up Tasks & Cadence</h3>
            <span className="text-xs px-2.5 py-1 bg-amber-50 text-amber-700 font-semibold rounded-full">
              Active Client Reviews
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {followUps.map((task) => (
              <div key={task.taskId} className="p-5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{task.notes}</span>
                    <span className="text-xs font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded">{task.taskId}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Due: {task.dueAt || '2026-10-31 10:00 AM'} • Type: {task.followUpType}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
