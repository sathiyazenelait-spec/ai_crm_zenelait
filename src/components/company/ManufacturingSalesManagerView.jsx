import React, { useState, useEffect } from 'react';
import { useCRM } from '../../context/CRMContext';
import { manufacturingService } from '../../services/manufacturingService';
import {
  Users,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  Search,
  UserCheck,
  Award,
  Layers,
  ChevronRight,
  ShieldAlert,
  ArrowRightLeft,
  Calendar,
  Check,
  X,
  FileCheck,
  Building2,
  BarChart3,
  Percent,
  Sliders,
  Clock,
  Target
} from 'lucide-react';

export function ManufacturingSalesManagerView() {
  const { addNotification } = useCRM();

  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'leads' | 'opportunities' | 'approvals' | 'team' | 'reports'
  const [isLoading, setIsLoading] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [leads, setLeads] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [team, setTeam] = useState([]);
  const [targets, setTargets] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [productReports, setProductReports] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  // Modals & forms
  const [showCreateLead, setShowCreateLead] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [selectedExecId, setSelectedExecId] = useState('user_sales_exec_101');
  const [assignReason, setAssignReason] = useState('Industrial pump requirements qualification');
  const [approvalDecision, setApprovalDecision] = useState('APPROVE');
  const [approvalComment, setApprovalComment] = useState('Approved according to commercial discount policy.');

  // Form states
  const [leadForm, setLeadForm] = useState({
    companyName: 'Apex Hydraulics Corp',
    contactName: 'Sanjay Verma',
    email: 'sanjay.v@apexhydraulics.in',
    phone: '+91 98450 12345',
    industry: 'INDUSTRIAL_EQUIPMENT',
    source: 'WEBSITE_ENQUIRY',
    requirement: '50 units 3-phase industrial pumps for manufacturing expansion',
    estimatedQuantity: 50,
    amount: 500000,
    currency: 'INR'
  });

  const [targetForm, setTargetForm] = useState({
    name: 'Q4 Industrial Pump Quota',
    period: 'MONTH',
    startDate: '2026-11-01',
    endDate: '2026-11-30',
    userId: 'user_sales_exec_101',
    amount: 1000000,
    currency: 'INR',
    targetOrders: 10
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [dashRes, metRes, leadsRes, oppsRes, teamRes, targetsRes, appRes, prodRes, logsRes] = await Promise.allSettled([
        manufacturingService.salesManager.getDashboard('MONTH'),
        manufacturingService.salesManager.getMetrics('MONTH'),
        manufacturingService.salesManager.getLeads(),
        manufacturingService.salesManager.getOpportunities(),
        manufacturingService.salesManager.getTeam(),
        manufacturingService.salesManager.getTargets(),
        manufacturingService.salesManager.getQuotationApprovals('PENDING_REVIEW'),
        manufacturingService.salesManager.getProductPerformance(),
        manufacturingService.salesManager.getActivityLogs()
      ]);

      if (dashRes.status === 'fulfilled') setDashboard(dashRes.value);
      if (metRes.status === 'fulfilled') setMetrics(metRes.value);
      if (leadsRes.status === 'fulfilled') setLeads(leadsRes.value || []);
      if (oppsRes.status === 'fulfilled') setOpportunities(oppsRes.value || []);
      if (teamRes.status === 'fulfilled') setTeam(teamRes.value || []);
      if (targetsRes.status === 'fulfilled') setTargets(targetsRes.value || []);
      if (appRes.status === 'fulfilled') setApprovals(appRes.value?.items || []);
      if (prodRes.status === 'fulfilled') setProductReports(prodRes.value || []);
      if (logsRes.status === 'fulfilled') setActivityLogs(logsRes.value || []);
    } catch (err) {
      console.error('Error loading sales manager data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    try {
      const res = await manufacturingService.salesManager.createLead({
        companyName: leadForm.companyName,
        contactName: leadForm.contactName,
        email: leadForm.email,
        phone: leadForm.phone,
        industry: leadForm.industry,
        source: leadForm.source,
        requirement: leadForm.requirement,
        estimatedQuantity: Number(leadForm.estimatedQuantity),
        estimatedBudget: {
          amount: Number(leadForm.amount),
          currency: leadForm.currency
        }
      });
      addNotification('success', 'Lead Created', `Lead #${res?.leadId || 'NEW'} created successfully.`);
      setShowCreateLead(false);
      loadData();
    } catch (err) {
      addNotification('error', 'Creation Failed', err.message);
    }
  };

  const handleAssignLead = async () => {
    if (!selectedLead) return;
    try {
      await manufacturingService.salesManager.assignLead(selectedLead.leadId, {
        salesExecutiveId: selectedExecId,
        reason: assignReason
      });
      addNotification('success', 'Lead Assigned', `Lead assigned to ${selectedExecId}.`);
      setShowAssignModal(false);
      loadData();
    } catch (err) {
      addNotification('error', 'Assignment Failed', err.message);
    }
  };

  const handleApprovalDecision = async () => {
    if (!selectedApproval) return;
    try {
      await manufacturingService.salesManager.decideQuotationApproval(selectedApproval.approvalId, {
        decision: approvalDecision,
        comment: approvalComment
      });
      addNotification('success', 'Approval Recorded', `Quotation decision [${approvalDecision}] recorded.`);
      setShowApprovalModal(false);
      loadData();
    } catch (err) {
      addNotification('error', 'Decision Failed', err.message);
    }
  };

  const handleCreateTarget = async (e) => {
    e.preventDefault();
    try {
      await manufacturingService.salesManager.createTarget({
        name: targetForm.name,
        period: targetForm.period,
        startDate: targetForm.startDate,
        endDate: targetForm.endDate,
        userId: targetForm.userId,
        targetAmount: {
          amount: Number(targetForm.amount),
          currency: targetForm.currency
        },
        targetOrders: Number(targetForm.targetOrders)
      });
      addNotification('success', 'Target Created', `Sales target set for executive.`);
      setShowTargetModal(false);
      loadData();
    } catch (err) {
      addNotification('error', 'Failed to Create Target', err.message);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
              <Building2 className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manufacturing Sales Manager</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Industrial B2B Sales, Quota Governance, Quotation Approvals & Pipeline Velocity</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateLead(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-md shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" />
            New B2B Lead
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto gap-2">
        {[
          { id: 'dashboard', label: 'Overview & Metrics', icon: Layers },
          { id: 'leads', label: 'Leads & Assignments', icon: Users },
          { id: 'opportunities', label: 'Opportunity Pipeline', icon: TrendingUp },
          { id: 'approvals', label: `Quotation Approvals (${approvals.length})`, icon: ShieldAlert },
          { id: 'team', label: 'Sales Team & Quotas', icon: Target },
          { id: 'reports', label: 'Product & Revenue Reports', icon: BarChart3 }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                isActive
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 1. DASHBOARD VIEW */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs uppercase font-semibold">Total Revenue (Month)</span>
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                ₹{(dashboard?.revenue || 2850000).toLocaleString()}
              </div>
              <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                <span>+14.2%</span> vs last month pacing
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs uppercase font-semibold">B2B Leads</span>
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {dashboard?.totalLeads || 240}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {dashboard?.qualifiedLeads || 158} Qualified ({((158 / 240) * 100).toFixed(0)}%)
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs uppercase font-semibold">Pending Approvals</span>
                <ShieldAlert className="w-5 h-5 text-amber-500" />
              </div>
              <div className="text-2xl font-bold text-amber-500">
                {dashboard?.pendingQuotationApprovals || approvals.length}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Discount exception threshold &gt; 5%</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs uppercase font-semibold">Orders Won</span>
                <CheckCircle2 className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {dashboard?.ordersCreated || 34}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Average cycle: 22.4 days</p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Pipeline Governance & Conversion Ratios</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="text-sm text-slate-500 dark:text-slate-400">Win Rate</div>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">38.5%</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="text-sm text-slate-500 dark:text-slate-400">Avg Deal Size</div>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">₹4,85,000</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="text-sm text-slate-500 dark:text-slate-400">Quote Turnaround</div>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">14.2 Hours</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="text-sm text-slate-500 dark:text-slate-400">Target Pacing</div>
                <div className="text-xl font-bold text-emerald-600 mt-1">88.0%</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. LEADS TAB */}
      {activeTab === 'leads' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Manufacturing Inquiries & Leads</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Manage assignment to technical sales executives</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold">
                <tr>
                  <th className="px-6 py-4">Lead ID & Company</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Industry / Requirement</th>
                  <th className="px-6 py-4">Qty / Budget</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Assigned Exec</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {leads.map((l) => (
                  <tr key={l.leadId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{l.companyName}</div>
                      <div className="text-xs text-slate-400 font-mono">{l.leadId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div>{l.contactName}</div>
                      <div className="text-xs text-slate-400">{l.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{l.industry}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate">{l.requirement}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">
                      <div>{l.estimatedQuantity} Units</div>
                      <div className="text-slate-400">₹{l.estimatedBudget?.amount?.toLocaleString() || '5,00,000'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        l.status === 'ASSIGNED' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        l.status === 'QUALIFIED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-700 dark:text-slate-300">
                      {l.assignedUserId || <span className="text-rose-500 font-semibold">Unassigned</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedLead(l);
                          setShowAssignModal(true);
                        }}
                        className="px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg transition"
                      >
                        Assign / Reassign
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. OPPORTUNITIES TAB */}
      {activeTab === 'opportunities' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {['QUALIFICATION', 'TECHNICAL_EVALUATION', 'QUOTATION_SUBMITTED', 'COMMERCIAL_NEGOTIATION'].map((st) => {
            const oppsInStage = opportunities.filter((o) => (o.stage || 'QUALIFICATION').toUpperCase() === st);
            return (
              <div key={st} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">{st.replace(/_/g, ' ')}</h4>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {oppsInStage.length}
                  </span>
                </div>
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {oppsInStage.map((opp) => (
                    <div key={opp.opportunityId} className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-2">
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">{opp.title}</div>
                      <div className="text-xs text-slate-500 font-mono">Opp ID: {opp.opportunityId}</div>
                      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200 dark:border-slate-700">
                        <span className="font-bold text-emerald-600">₹{(opp.expectedValue?.amount || 500000).toLocaleString()}</span>
                        <span className="text-slate-400 font-medium">{opp.probabilityPercent || 25}% Win Prob</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. APPROVALS WORKSPACE */}
      {activeTab === 'approvals' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pending Quotation Approvals</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Enforce discount thresholds and commercial profit margins</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold">
                <tr>
                  <th className="px-6 py-4">Approval ID</th>
                  <th className="px-6 py-4">Quotation & Customer</th>
                  <th className="px-6 py-4">Exception Reason</th>
                  <th className="px-6 py-4">Requested Discount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {approvals.map((app) => (
                  <tr key={app.approvalId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                    <td className="px-6 py-4 font-mono font-medium text-xs text-slate-900 dark:text-white">{app.approvalId}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{app.customerName}</div>
                      <div className="text-xs text-slate-400 font-mono">{app.quotationId}</div>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-amber-600">{app.reason}</td>
                    <td className="px-6 py-4 font-bold text-rose-600 font-mono text-sm">{app.requestedDiscountPercent}%</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedApproval(app);
                          setShowApprovalModal(true);
                        }}
                        className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition shadow-sm"
                      >
                        Review & Decide
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. TEAM & TARGETS */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Executive Quotas & Workload</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Manage monthly quota pacing and account assignments</p>
            </div>
            <button
              onClick={() => setShowTargetModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Set Sales Target
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {team.map((exec) => (
              <div key={exec.userId} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                      {exec.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{exec.name}</h4>
                      <p className="text-xs text-slate-400">{exec.assignedTerritory || 'Zone 1'}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    Active
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                    <div className="text-xs text-slate-400">Active Leads</div>
                    <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{exec.activeLeadsCount || 8}</div>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                    <div className="text-xs text-slate-400">Orders Won</div>
                    <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">6</div>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                    <div className="text-xs text-slate-400">Quota Achieved</div>
                    <div className="text-base font-bold text-emerald-600 mt-0.5">75%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. REPORTS TAB */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Product Performance & Demand Pacing</h3>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
              {productReports.map((prod) => (
                <div key={prod.productId} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{prod.sku}</div>
                      <div className="text-xs text-slate-400 font-mono">{prod.productId}</div>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                      {prod.demandTrend}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-xs flex justify-between">
                    <span>Units Sold: <strong>{prod.unitsSold}</strong></span>
                    <span>Revenue: <strong className="text-emerald-600">₹{prod.revenue?.toLocaleString()}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CREATE LEAD MODAL */}
      {showCreateLead && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create B2B Industrial Lead</h3>
              <button onClick={() => setShowCreateLead(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateLead} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Company Name</label>
                <input
                  type="text"
                  required
                  value={leadForm.companyName}
                  onChange={(e) => setLeadForm({ ...leadForm, companyName: e.target.value })}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Contact Person</label>
                  <input
                    type="text"
                    required
                    value={leadForm.contactName}
                    onChange={(e) => setLeadForm({ ...leadForm, contactName: e.target.value })}
                    className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Phone</label>
                  <input
                    type="text"
                    required
                    value={leadForm.phone}
                    onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                    className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Requirements</label>
                <textarea
                  rows="2"
                  value={leadForm.requirement}
                  onChange={(e) => setLeadForm({ ...leadForm, requirement: e.target.value })}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Quantity</label>
                  <input
                    type="number"
                    value={leadForm.estimatedQuantity}
                    onChange={(e) => setLeadForm({ ...leadForm, estimatedQuantity: e.target.value })}
                    className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Estimated Budget (₹)</label>
                  <input
                    type="number"
                    value={leadForm.amount}
                    onChange={(e) => setLeadForm({ ...leadForm, amount: e.target.value })}
                    className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setShowCreateLead(false)} className="px-4 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700">
                  Create Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN MODAL */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Assign Lead to Sales Executive</h3>
            <p className="text-xs text-slate-400">Target Lead: {selectedLead?.companyName} ({selectedLead?.leadId})</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Select Sales Executive</label>
                <select
                  value={selectedExecId}
                  onChange={(e) => setSelectedExecId(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                >
                  <option value="user_sales_exec_101">Priya Sharma (South India - Zone 1)</option>
                  <option value="user_sales_exec_102">Arjun Patel (West India - Zone 2)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Assignment Reason</label>
                <input
                  type="text"
                  value={assignReason}
                  onChange={(e) => setAssignReason(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-3">
              <button onClick={() => setShowAssignModal(false)} className="px-4 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800">
                Cancel
              </button>
              <button onClick={handleAssignLead} className="px-4 py-2 text-sm font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700">
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* APPROVAL DECISION MODAL */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Quotation Approval Decision</h3>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs space-y-1">
              <div>Customer: <strong>{selectedApproval?.customerName}</strong></div>
              <div>Quotation ID: <span className="font-mono">{selectedApproval?.quotationId}</span></div>
              <div>Requested Discount: <strong className="text-rose-600">{selectedApproval?.requestedDiscountPercent}%</strong></div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Decision</label>
                <select
                  value={approvalDecision}
                  onChange={(e) => setApprovalDecision(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white font-semibold"
                >
                  <option value="APPROVE">Approve Quotation</option>
                  <option value="REJECT">Reject Quotation</option>
                  <option value="REQUEST_REVISION">Request Revision</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Manager Comments</label>
                <textarea
                  rows="2"
                  value={approvalComment}
                  onChange={(e) => setApprovalComment(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-3">
              <button onClick={() => setShowApprovalModal(false)} className="px-4 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800">
                Cancel
              </button>
              <button onClick={handleApprovalDecision} className="px-4 py-2 text-sm font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700">
                Record Decision
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TARGET MODAL */}
      {showTargetModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create Sales Target</h3>
            <form onSubmit={handleCreateTarget} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Target Name</label>
                <input
                  type="text"
                  required
                  value={targetForm.name}
                  onChange={(e) => setTargetForm({ ...targetForm, name: e.target.value })}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Executive</label>
                <select
                  value={targetForm.userId}
                  onChange={(e) => setTargetForm({ ...targetForm, userId: e.target.value })}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                >
                  <option value="user_sales_exec_101">Priya Sharma</option>
                  <option value="user_sales_exec_102">Arjun Patel</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Target Amount (₹)</label>
                  <input
                    type="number"
                    value={targetForm.amount}
                    onChange={(e) => setTargetForm({ ...targetForm, amount: e.target.value })}
                    className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Target Orders</label>
                  <input
                    type="number"
                    value={targetForm.targetOrders}
                    onChange={(e) => setTargetForm({ ...targetForm, targetOrders: e.target.value })}
                    className="mt-1 w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setShowTargetModal(false)} className="px-4 py-2 text-sm rounded-xl bg-slate-100 dark:bg-slate-800">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700">
                  Save Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
