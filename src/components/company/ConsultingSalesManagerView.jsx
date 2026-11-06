import React, { useState, useEffect } from 'react';
import {
  TrendingUp, Users, DollarSign, Award, Target, FileText, CheckCircle2,
  AlertCircle, ChevronRight, Filter, Search, Plus, ArrowRight, ShieldCheck,
  Briefcase, Activity, Calendar, ArrowUpRight, BarChart3, Layers, Clock, Send,
  RefreshCw, Check, X, FileCheck
} from 'lucide-react';
import { consultingService } from '../../services/consultingService';

export function ConsultingSalesManagerView() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [pipeline, setPipeline] = useState([]);
  const [leads, setLeads] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [targets, setTargets] = useState([]);
  const [handoffs, setHandoffs] = useState([]);
  const [notification, setNotification] = useState(null);

  // Modals state
  const [selectedLead, setSelectedLead] = useState(null);
  const [assigneeId, setAssigneeId] = useState('USR-EXEC-101');
  const [assignReason, setAssignReason] = useState('');
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [decisionNotes, setDecisionNotes] = useState('');

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [dashRes, pipeRes, leadsRes, propRes, teamRes, targetRes, handoffRes] = await Promise.all([
        consultingService.salesManager.getDashboard().catch(() => ({
          totalLeads: 145, qualifiedLeads: 62, openOpportunities: 34,
          pipelineValue: 8500000, monthlyTarget: 2500000, closedWonValue: 1750000,
          pendingProposalApprovals: 6, overdueFollowUps: 9, teamMembers: 8
        })),
        consultingService.salesManager.getPipeline().catch(() => ({ items: [] })),
        consultingService.salesManager.getLeads().catch(() => []),
        consultingService.salesManager.getPendingProposals().catch(() => ({ items: [] })),
        consultingService.salesManager.getTeam().catch(() => []),
        consultingService.salesManager.getTargets().catch(() => []),
        consultingService.salesManager.getEngagementHandoffs().catch(() => [])
      ]);

      setDashboard(dashRes);
      setPipeline(pipeRes?.items || []);
      setLeads(leadsRes || []);
      setProposals(propRes?.items || []);
      setTeamMembers(teamRes || []);
      setTargets(targetRes || []);
      setHandoffs(handoffRes || []);
    } catch (err) {
      console.error('Failed to load Sales Manager data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleAssignLead = async () => {
    if (!selectedLead) return;
    try {
      await consultingService.salesManager.assignLead(selectedLead.leadId, assigneeId, assignReason || 'Assigned by Sales Manager');
      showNotification(`Lead ${selectedLead.leadId} assigned to ${assigneeId}`);
      setSelectedLead(null);
      loadAllData();
    } catch (e) {
      showNotification(e.message || 'Assignment failed', 'error');
    }
  };

  const handleProposalDecision = async (decision) => {
    if (!selectedProposal) return;
    try {
      await consultingService.salesManager.decideProposal(selectedProposal.proposalId, decision, decisionNotes || 'Manager decision');
      showNotification(`Proposal ${selectedProposal.proposalId} ${decision.toLowerCase()} successfully`);
      setSelectedProposal(null);
      loadAllData();
    } catch (e) {
      showNotification(e.message || 'Decision failed', 'error');
    }
  };

  const handleAcceptHandoff = async (handoffId) => {
    try {
      await consultingService.salesManager.acceptHandoff(handoffId);
      showNotification(`Engagement Handoff ${handoffId} accepted for project delivery`);
      loadAllData();
    } catch (e) {
      showNotification(e.message || 'Acceptance failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 border border-slate-800 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" />
                Consulting Companies Tenant
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Commercial Operations
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Consulting Sales Manager</h1>
            <p className="text-slate-400 mt-1 max-w-2xl text-sm leading-relaxed">
              Oversee high-value consulting engagements, professional services revenue targets, proposal approvals, pipeline velocity, and delivery handoffs.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadAllData}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl border border-slate-700 flex items-center gap-2 transition-all shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
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

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto space-x-2">
        {[
          { id: 'dashboard', label: 'Dashboard & Targets', icon: BarChart3 },
          { id: 'pipeline', label: 'Consulting Pipeline', icon: Layers },
          { id: 'leads', label: 'Lead Management', icon: Users },
          { id: 'approvals', label: `Proposal Approvals (${proposals.length})`, icon: FileCheck },
          { id: 'team', label: 'Team Performance', icon: Award },
          { id: 'handoffs', label: 'Delivery Handoffs', icon: ArrowRight }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
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
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Pipeline Value</span>
                <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><DollarSign className="w-5 h-5" /></span>
              </div>
              <div className="text-2xl font-bold text-slate-900">
                ₹{dashboard ? (dashboard.pipelineValue / 100000).toFixed(1) : '85.0'} Lakhs
              </div>
              <div className="text-xs text-emerald-600 font-medium mt-2 flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" /> Full Opportunity Value (Weighted ₹51.0L)
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Closed Won (MTD)</span>
                <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><Award className="w-5 h-5" /></span>
              </div>
              <div className="text-2xl font-bold text-slate-900">
                ₹{dashboard ? (dashboard.closedWonValue / 100000).toFixed(1) : '17.5'} Lakhs
              </div>
              <div className="text-xs text-slate-500 font-medium mt-2">
                Target: ₹{dashboard ? (dashboard.monthlyTarget / 100000).toFixed(1) : '25.0'}L (70% achieved)
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Qualified Deals</span>
                <span className="p-2 bg-amber-50 text-amber-600 rounded-xl"><Target className="w-5 h-5" /></span>
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {dashboard?.openOpportunities || 34} Opportunities
              </div>
              <div className="text-xs text-amber-600 font-medium mt-2">
                Across {dashboard?.qualifiedLeads || 62} qualified business leads
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Proposal Queue</span>
                <span className="p-2 bg-purple-50 text-purple-600 rounded-xl"><FileCheck className="w-5 h-5" /></span>
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {dashboard?.pendingProposalApprovals || 6} Awaiting Approval
              </div>
              <div className="text-xs text-purple-600 font-medium mt-2">
                Average approval turnaround: 4.2 hours
              </div>
            </div>
          </div>

          {/* Revenue Forecast Breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              Quarterly Revenue Forecast Pacing (INR)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-xs font-semibold text-slate-500 uppercase">Committed Revenue</div>
                <div className="text-xl font-bold text-slate-900 mt-1">₹32,00,000</div>
                <p className="text-xs text-slate-500 mt-1">Legally signed consulting contracts in execution</p>
              </div>
              <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100">
                <div className="text-xs font-semibold text-indigo-600 uppercase">Weighted Probability Forecast</div>
                <div className="text-xl font-bold text-indigo-900 mt-1">₹51,00,000</div>
                <p className="text-xs text-indigo-600/80 mt-1">Probability-adjusted across stage pipeline</p>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
                <div className="text-xs font-semibold text-emerald-600 uppercase">Best Case Upside</div>
                <div className="text-xl font-bold text-emerald-900 mt-1">₹94,00,000</div>
                <p className="text-xs text-emerald-600/80 mt-1">If all active proposals and discussions close</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PIPELINE */}
      {activeTab === 'pipeline' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Active Consulting Opportunities</h3>
            <span className="text-xs px-2.5 py-1 bg-indigo-50 text-indigo-700 font-semibold rounded-full">
              {pipeline.length} Deals in Pipeline
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Opportunity</th>
                  <th className="py-3.5 px-4">Client Company</th>
                  <th className="py-3.5 px-4">Service</th>
                  <th className="py-3.5 px-4">Stage</th>
                  <th className="py-3.5 px-4">Est. Value</th>
                  <th className="py-3.5 px-4">Probability</th>
                  <th className="py-3.5 px-4">Expected Close</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pipeline.map((opp) => (
                  <tr key={opp.opportunityId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div>{opp.opportunityName || opp.opportunityId}</div>
                      <span className="text-xs text-slate-400">{opp.opportunityId}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">{opp.companyName || 'Example Manufacturing Ltd'}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                        {opp.service || 'DIGITAL_TRANSFORMATION'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {opp.stage || 'PROPOSAL'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ₹{opp.estimatedValue ? Number(opp.estimatedValue).toLocaleString() : '12,00,000'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-semibold">
                      {opp.probability != null ? `${opp.probability}%` : '60%'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs">
                      {opp.expectedCloseDate || '2026-11-30'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: LEADS */}
      {activeTab === 'leads' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Consulting Inbound & Strategic Leads</h3>
            <span className="text-xs text-slate-500">Assign leads to eligible tenant sales executives</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Lead ID</th>
                  <th className="py-3.5 px-4">Company & Contact</th>
                  <th className="py-3.5 px-4">Service Interest</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Assigned To</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((lead) => (
                  <tr key={lead.leadId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-600">{lead.leadId}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{lead.companyName}</div>
                      <div className="text-xs text-slate-500">{lead.contactName} • {lead.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                        {lead.serviceInterest}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        lead.status === 'ASSIGNED' ? 'bg-indigo-50 text-indigo-700' :
                        lead.status === 'QUALIFIED' ? 'bg-emerald-50 text-emerald-700' :
                        'bg-amber-50 text-amber-700'
                      }`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 text-xs">
                      {lead.assignedTo || 'Unassigned'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="px-3 py-1.5 text-xs font-semibold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
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

      {/* TAB 4: PROPOSAL APPROVALS */}
      {activeTab === 'approvals' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Segregation of Commercial Authority:</span>
              <p className="text-xs text-amber-700 mt-0.5">
                Sales Executives cannot approve their own proposals. As Sales Manager, ensure scope deliverables, payment milestones, and discount margins comply with tenant policies before granting approval.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Proposals Awaiting Manager Decision</h3>
              <span className="text-xs font-semibold px-2 py-1 bg-purple-50 text-purple-700 rounded-full">
                {proposals.length} Pending
              </span>
            </div>
            {proposals.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No proposals currently awaiting review.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {proposals.map((prop) => (
                  <div key={prop.proposalId} className="p-5 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-base">{prop.proposalTitle || 'Consulting Engagement Proposal'}</span>
                        <span className="text-xs font-mono px-2 py-0.5 bg-slate-100 text-slate-600 rounded">{prop.proposalId}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Client: {prop.clientName || 'Example Manufacturing Ltd'} • Opp: {prop.opportunityId}</p>
                      <div className="mt-2 flex items-center gap-4 text-xs text-slate-600">
                        <span className="font-semibold text-slate-900">Value: ₹{Number(prop.proposalValue || 1200000).toLocaleString()} INR</span>
                        <span>Requested: {prop.requestedAt ? new Date(prop.requestedAt).toLocaleTimeString() : '10:00 AM'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedProposal(prop)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
                      >
                        Review & Decide
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: TEAM PERFORMANCE */}
      {activeTab === 'team' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Consulting Sales Team Targets & Pacing</h3>
            <span className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-700 font-semibold rounded-full">
              Monthly Cycle
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Team Member</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Assigned Leads</th>
                  <th className="py-3.5 px-4">Qualified</th>
                  <th className="py-3.5 px-4">Open Deals</th>
                  <th className="py-3.5 px-4">Closed Won</th>
                  <th className="py-3.5 px-4">Target Achievement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teamMembers.map((member) => (
                  <tr key={member.userId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div>{member.name}</div>
                      <div className="text-xs text-slate-400 font-mono">{member.userId}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">{member.role}</td>
                    <td className="py-3.5 px-4 font-medium">{member.assignedLeads || 25}</td>
                    <td className="py-3.5 px-4 font-medium">{member.qualifiedLeads || 14}</td>
                    <td className="py-3.5 px-4 font-medium">{member.openOpportunities || 8}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ₹{member.closedWonValue ? Number(member.closedWonValue).toLocaleString() : '6,50,000'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${member.targetAchievementPercent || 65}%` }} />
                        </div>
                        <span className="text-xs font-bold text-slate-700">{member.targetAchievementPercent || 65}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: DELIVERY HANDOFFS */}
      {activeTab === 'handoffs' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Engagement Delivery Handoffs</h3>
              <p className="text-xs text-slate-500 mt-0.5">Bridge commercial win to delivery project kick-off</p>
            </div>
            <span className="text-xs px-2.5 py-1 bg-indigo-50 text-indigo-700 font-semibold rounded-full">
              {handoffs.length} Active Handoffs
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {handoffs.map((h) => (
              <div key={h.handoffId} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{h.handoffId}</span>
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      {h.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 max-w-xl">{h.handoffSummary}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                    <span>Opp: <strong>{h.opportunityId}</strong></span>
                    <span>Contract: <strong>{h.contractId}</strong></span>
                    <span>Target Team: <strong>{h.receivingTeamId}</strong></span>
                  </div>
                </div>
                {h.status === 'PENDING_ACCEPTANCE' && (
                  <button
                    onClick={() => handleAcceptHandoff(h.handoffId)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> Accept for Delivery
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LEAD ASSIGNMENT MODAL */}
      {selectedLead && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Assign Consulting Lead</h3>
            <p className="text-xs text-slate-500 mb-4">{selectedLead.companyName} ({selectedLead.leadId})</p>

            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Sales Executive</label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="USR-EXEC-101">USR-EXEC-101 • Consulting Sales Executive</option>
                  <option value="USR-MGR-001">USR-MGR-001 • Deepak Sharma (Manager)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assignment Reason</label>
                <textarea
                  value={assignReason}
                  onChange={(e) => setAssignReason(e.target.value)}
                  placeholder="e.g. Relevant expertise in digital transformation consulting"
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  onClick={() => setSelectedLead(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignLead}
                  className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-all"
                >
                  Confirm Assignment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PROPOSAL REVIEW MODAL */}
      {selectedProposal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Proposal Decision Review</h3>
              <button onClick={() => setSelectedProposal(null)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-sm">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div className="text-xs text-slate-500 font-semibold uppercase">Proposal Title</div>
                <div className="font-bold text-slate-900">{selectedProposal.proposalTitle || 'Business Process Modernization Proposal'}</div>
                <div className="text-xs text-slate-600">ID: {selectedProposal.proposalId} • Value: ₹{Number(selectedProposal.proposalValue || 1200000).toLocaleString()} INR</div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Review Comments</label>
                <textarea
                  value={decisionNotes}
                  onChange={(e) => setDecisionNotes(e.target.value)}
                  placeholder="Approved within the configured commercial authority."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  onClick={() => handleProposalDecision('REJECTED')}
                  className="px-4 py-2 text-xs font-semibold bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl transition-colors"
                >
                  Reject Proposal
                </button>
                <button
                  onClick={() => handleProposalDecision('APPROVED')}
                  className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Approve Proposal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
