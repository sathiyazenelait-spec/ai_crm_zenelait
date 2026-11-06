import React, { useState, useEffect } from 'react';
import { useCRM } from '../../context/CRMContext';
import { softwareService } from '../../services/softwareService';
import { FormDialog } from '../common/FormDialog';
import { StatusBadge } from '../common/StatusBadge';
import {
  TrendingUp,
  Users,
  Target,
  FileCheck2,
  Zap,
  BarChart3,
  RefreshCw,
  Plus,
  Send,
  CheckCircle2,
  Clock,
  Sparkles,
  Bot,
  UserCheck,
  Check,
  X,
  Building,
  DollarSign,
  Briefcase,
  Layers,
  ArrowRight
} from 'lucide-react';

export function SalesManagerView() {
  const { addNotification } = useCRM();

  const [activeTab, setActiveTab] = useState('overview'); // overview, leads, team, quotes, automations, reports
  const [dashboard, setDashboard] = useState(null);
  const [team, setTeam] = useState([]);
  const [leads, setLeads] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [automations, setAutomations] = useState([]);
  const [salesReport, setSalesReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Modals & Action States
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [assigneeId, setAssigneeId] = useState('USR-SE-001');
  const [assignReason, setAssignReason] = useState('Strong experience with custom enterprise software solutions');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [dash, teamList, leadData, quoteList, autoList, rep] = await Promise.all([
        softwareService.getDashboardSummary({ period: 'THIS_MONTH' }),
        softwareService.getSalesExecutives(),
        softwareService.getLeads(),
        softwareService.getQuotes(),
        softwareService.getAutomations(),
        softwareService.getSalesReport()
      ]);

      setDashboard(dash);
      setTeam(teamList);
      setLeads(leadData?.items || leadData || []);
      setQuotes(quoteList);
      setAutomations(autoList);
      setSalesReport(rep);
    } catch (err) {
      console.error('Failed to load Sales Manager data:', err);
      addNotification?.({
        type: 'error',
        title: 'Sync Error',
        message: 'Could not sync with Sales Manager API.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignLead = async (e) => {
    e.preventDefault();
    if (!selectedLead) return;
    setIsSubmitting(true);
    try {
      await softwareService.assignLead(selectedLead.id || selectedLead.leadId, assigneeId, assignReason);
      addNotification?.({
        type: 'success',
        title: 'Lead Assigned',
        message: `${selectedLead.name} successfully assigned to ${assigneeId === 'USR-SE-001' ? 'Arun Kumar' : 'Priya Devi'}.`
      });
      setShowAssignModal(false);
      loadData();
    } catch (err) {
      addNotification?.({
        type: 'error',
        title: 'Assignment Failed',
        message: err.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveQuote = async (quoteId) => {
    try {
      await softwareService.approveQuote(quoteId, 'Approved within commercial pricing policy threshold');
      addNotification?.({
        type: 'success',
        title: 'Quotation Approved',
        message: `Quotation ${quoteId} has been authorized for client dispatch.`
      });
      loadData();
    } catch (err) {
      addNotification?.({
        type: 'error',
        title: 'Approval Failed',
        message: err.message
      });
    }
  };

  const handleRejectQuote = async (quoteId) => {
    try {
      await softwareService.rejectQuote(quoteId, 'Discount exceeds standard 5% threshold without executive sign-off');
      addNotification?.({
        type: 'info',
        title: 'Quotation Returned',
        message: `Quotation ${quoteId} rejected for revision.`
      });
      loadData();
    } catch (err) {
      addNotification?.({
        type: 'error',
        title: 'Error',
        message: err.message
      });
    }
  };

  const handleToggleAutomation = async (autId, currentStatus) => {
    try {
      if (currentStatus === 'ACTIVE') {
        await softwareService.pauseAutomation(autId);
        addNotification?.({ type: 'info', title: 'Automation Paused', message: `Workflow ${autId} paused.` });
      } else {
        await softwareService.activateAutomation(autId);
        addNotification?.({ type: 'success', title: 'Automation Activated', message: `Workflow ${autId} live.` });
      }
      loadData();
    } catch (err) {
      addNotification?.({ type: 'error', title: 'Error', message: err.message });
    }
  };

  const formatINR = (val) => {
    if (val === undefined || val === null) return '₹0';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-slate-800 p-6 shadow-xl text-white">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="p-2.5 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-400">
                <Briefcase className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  Software Sales Operations
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Sales Manager Cockpit
                  </span>
                </h1>
                <p className="text-sm text-slate-400">
                  Tenant: TEN-IT-001 (Zenelait Software Solutions) • Role: SALES_MANAGER
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 transition"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Sync Data
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Sales Overview', icon: BarChart3 },
          { id: 'leads', label: 'Leads & Reassignment', icon: Target },
          { id: 'team', label: 'Sales Executive Team', icon: Users },
          { id: 'quotes', label: 'Quotation Approvals', icon: FileCheck2 },
          { id: 'automations', label: 'Sales Automations', icon: Zap },
          { id: 'reports', label: 'Performance Analytics', icon: TrendingUp }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 1. OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
              <span className="text-xs font-semibold uppercase text-slate-500">Total Leads (This Month)</span>
              <p className="text-2xl font-bold mt-2 text-slate-900 dark:text-white">
                {dashboard?.totalLeads || 240}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                {dashboard?.unassignedLeads || 30} awaiting assignment
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
              <span className="text-xs font-semibold uppercase text-slate-500">Open Opportunities</span>
              <p className="text-2xl font-bold mt-2 text-slate-900 dark:text-white">
                {dashboard?.openOpportunities || 64}
              </p>
              <p className="text-xs text-emerald-600 mt-1">
                Pipeline Value: {formatINR(dashboard?.quotationValue || 1250000)}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
              <span className="text-xs font-semibold uppercase text-slate-500">Deals Won / Lost</span>
              <p className="text-2xl font-bold mt-2 text-slate-900 dark:text-white">
                {dashboard?.wonDeals || 12} / {dashboard?.lostDeals || 4}
              </p>
              <p className="text-xs text-emerald-600 mt-1">
                Win Rate: {dashboard?.conversionRate || 18.75}%
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
              <span className="text-xs font-semibold uppercase text-slate-500">Active Sales Reps</span>
              <p className="text-2xl font-bold mt-2 text-slate-900 dark:text-white">
                {team.length || dashboard?.activeSalesExecutives || 6}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {dashboard?.followUpsDueToday || 18} follow-ups scheduled today
              </p>
            </div>
          </div>

          {/* Quick Approvals Queue */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-blue-500" />
                Quotations Awaiting Manager Approval
              </span>
              <button onClick={() => setActiveTab('quotes')} className="text-xs text-blue-600 font-semibold">
                View All Quotes →
              </button>
            </h3>
            <div className="space-y-3">
              {quotes.filter(q => q.status === 'PENDING_APPROVAL').map((q) => (
                <div key={q.quoteId} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-mono font-bold text-blue-600">{q.quotationNumber}</span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{q.clientName}</h4>
                    <p className="text-xs text-slate-500">Total: <strong>{formatINR(q.totalAmount)}</strong> (Discount: {formatINR(q.discountAmount)})</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApproveQuote(q.quoteId)}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => handleRejectQuote(q.quoteId)}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-300 transition flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. LEADS & REASSIGNMENT */}
      {activeTab === 'leads' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Lead Routing & Assignment</h2>
              <p className="text-sm text-slate-500">Allocate inbound leads among executive team and balance SDR workload</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-800/50 text-slate-500">
                <tr>
                  <th className="px-4 py-3.5">Lead Name</th>
                  <th className="px-4 py-3.5">Company</th>
                  <th className="px-4 py-3.5">Interest</th>
                  <th className="px-4 py-3.5">Assigned Rep</th>
                  <th className="px-4 py-3.5">Stage</th>
                  <th className="px-4 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {leads.map((l) => (
                  <tr key={l.id || l.leadId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">{l.name}</td>
                    <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300">{l.companyName}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">{l.interest || 'Custom CRM Development'}</td>
                    <td className="px-4 py-3.5 text-slate-800 dark:text-slate-200 font-medium">
                      {l.ownerName || l.assignedTo || 'Unassigned'}
                    </td>
                    <td className="px-4 py-3.5"><StatusBadge status={l.stage || l.status || 'NEW'} /></td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => {
                          setSelectedLead(l);
                          setShowAssignModal(true);
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition"
                      >
                        Reassign
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. SALES TEAM */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Sales Executives Performance Roster</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {team.map((rep) => (
              <div key={rep.userId} className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-blue-600">{rep.userId}</span>
                  <StatusBadge status={rep.status} />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{rep.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{rep.email}</p>
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center text-xs">
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                    <span className="text-slate-400 block">Assigned</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-bold">{rep.assignedLeads}</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                    <span className="text-slate-400 block">Open Deals</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-bold">{rep.openOpportunities}</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                    <span className="text-slate-400 block">Follow-ups</span>
                    <strong className="text-blue-600 font-bold">{rep.followUpsDue}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. QUOTATIONS */}
      {activeTab === 'quotes' && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">All Team Quotations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quotes.map((q) => (
              <div key={q.quoteId} className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-blue-600">{q.quotationNumber}</span>
                    <StatusBadge status={q.status} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{q.clientName}</h3>
                  <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs space-y-1">
                    <div className="flex justify-between"><span>Subtotal:</span><span>{formatINR(q.subtotal)}</span></div>
                    <div className="flex justify-between text-red-500"><span>Discount:</span><span>-{formatINR(q.discountAmount)}</span></div>
                    <div className="flex justify-between font-bold text-sm text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-700">
                      <span>Total Amount:</span><span>{formatINR(q.totalAmount)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Valid Until: {q.validUntil}</p>
                </div>
                {q.status === 'PENDING_APPROVAL' && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                    <button
                      onClick={() => handleApproveQuote(q.quoteId)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
                    >
                      Authorize
                    </button>
                    <button
                      onClick={() => handleRejectQuote(q.quoteId)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. AUTOMATIONS */}
      {activeTab === 'automations' && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Sales Follow-Up Automations</h2>
          <div className="space-y-3">
            {automations.map((aut) => (
              <div key={aut.automationId} className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{aut.name}</h4>
                  <p className="text-xs text-slate-500">Trigger: {aut.triggerEvent} • Auto-dispatches follow-up task</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={aut.status} />
                  <button
                    onClick={() => handleToggleAutomation(aut.automationId, aut.status)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition"
                  >
                    {aut.status === 'ACTIVE' ? 'Pause' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. REPORTS */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Sales Performance & Attainment Report</h2>
            <p className="text-sm text-slate-500 mb-6">Aggregated deal closing metrics for period {salesReport?.from} to {salesReport?.to}</p>

            <div className="space-y-4">
              {salesReport?.team?.map((rep) => (
                <div key={rep.userId} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{rep.name}</h4>
                    <p className="text-xs text-slate-500">
                      Deals Closed: {rep.opportunitiesWon} • Activities: {rep.activitiesCompleted}
                    </p>
                  </div>
                  <span className="text-base font-bold text-emerald-600">{formatINR(rep.revenueWon)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN MODAL */}
      <FormDialog
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Assign Lead to Sales Executive"
        onSubmit={handleAssignLead}
        isSubmitting={isSubmitting}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Select Sales Executive</label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            >
              {team.map((t) => (
                <option key={t.userId} value={t.userId}>
                  {t.name} ({t.assignedLeads} active leads)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Assignment Routing Reason</label>
            <textarea
              rows={3}
              value={assignReason}
              onChange={(e) => setAssignReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            />
          </div>
        </div>
      </FormDialog>
    </div>
  );
}
