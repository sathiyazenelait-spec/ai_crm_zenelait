import React, { useState, useEffect } from 'react';
import { softwareService } from '../../services/softwareService';
import {
  Sparkles,
  CheckSquare,
  Clock,
  Play,
  Pause,
  Send,
  AlertTriangle,
  ShieldCheck,
  RefreshCw,
  Plus,
  UserX,
  FileText,
  BarChart3,
  CheckCircle,
  XCircle,
  RotateCcw,
  Settings,
  Sliders,
  TrendingUp,
  DollarSign,
  Bot
} from 'lucide-react';

export function SoftwareAiFollowUpAgentView({ initialSubTab = 'overview' }) {
  const [activeTab, setActiveTab] = useState(initialSubTab);
  const [metrics, setMetrics] = useState({
    tasksCreated: 480,
    tasksCompleted: 350,
    messagesQueued: 280,
    messagesDelivered: 260,
    messagesFailed: 12,
    customersOptedOut: 8,
    humanEscalations: 25,
    taskCompletionRatePercentage: 72.92
  });

  const [rules, setRules] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [executions, setExecutions] = useState([]);
  const [suppressions, setSuppressions] = useState([]);

  // Modals
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [ruleForm, setRuleForm] = useState({
    name: 'Follow up after software demo',
    trigger: 'DEMO_COMPLETED',
    delayMinutes: 1440,
    action: 'CREATE_FOLLOW_UP_TASK',
    channel: 'EMAIL',
    enabled: true,
    stopConditions: ['CUSTOMER_REPLIED', 'CUSTOMER_OPTED_OUT']
  });

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    leadId: 'SL-1001',
    taskType: 'SALES_FOLLOW_UP',
    title: 'Follow up after CRM demo',
    description: 'Ask whether the prospect needs additional product information.',
    dueAt: '2026-10-28T10:00:00+05:30',
    priority: 'HIGH',
    assignedTo: 'USR-2001'
  });

  useEffect(() => {
    setActiveTab(initialSubTab);
  }, [initialSubTab]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [metRes, ruleRes, taskRes, draftRes, execRes, supRes] = await Promise.all([
        softwareService.getFollowUpsMetrics(),
        softwareService.getFollowUpsRules(),
        softwareService.getFollowUpsTasks(),
        softwareService.getFollowUpsDrafts(),
        softwareService.getFollowUpsExecutions(),
        softwareService.getFollowUpsSuppressionList()
      ]);

      if (metRes) setMetrics(metRes);
      if (ruleRes) setRules(ruleRes);
      if (taskRes) setTasks(taskRes);
      if (draftRes) setDrafts(draftRes);
      if (execRes?.items) setExecutions(execRes.items);
      if (supRes) setSuppressions(supRes);
    } catch (e) {
      console.warn('Follow-up data fallback', e);
    }
  };

  const handleToggleRule = async (rule) => {
    try {
      if (rule.status === 'ACTIVE') {
        await softwareService.pauseFollowUpsRule(rule.ruleId);
      } else {
        await softwareService.activateFollowUpsRule(rule.ruleId);
      }
      loadData();
    } catch (e) {
      alert('Error updating rule: ' + e.message);
    }
  };

  const handleCreateRule = async (e) => {
    e.preventDefault();
    try {
      await softwareService.createFollowUpsRule(ruleForm);
      setShowRuleModal(false);
      loadData();
    } catch (e) {
      alert('Error creating rule: ' + e.message);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await softwareService.createFollowUpsTask(taskForm);
      setShowTaskModal(false);
      loadData();
    } catch (e) {
      alert('Error creating task: ' + e.message);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await softwareService.completeFollowUpsTask(taskId, { completionNotes: 'Completed successfully.' });
      loadData();
    } catch (e) {
      alert('Error completing task: ' + e.message);
    }
  };

  const handleApproveDraft = async (draftId) => {
    try {
      await softwareService.approveFollowUpsDraft(draftId, { approvalComment: 'Approved by human reviewer' });
      alert('Draft approved successfully!');
      loadData();
    } catch (e) {
      alert('Error approving draft: ' + e.message);
    }
  };

  const handleSendDraft = async (draftId) => {
    try {
      await softwareService.sendFollowUpsDraft(draftId);
      alert('Follow-up message dispatched and queued for provider delivery!');
      loadData();
    } catch (e) {
      alert('Error sending draft: ' + e.message);
    }
  };

  const handleRetryExecution = async (executionId) => {
    try {
      await softwareService.retryFollowUpsExecution(executionId);
      alert('Execution successfully retried!');
      loadData();
    } catch (e) {
      alert('Retry error: ' + e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-900/30 via-slate-900/50 to-slate-900/20 p-5 rounded-2xl border border-blue-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
              SOFTWARE / IT TENANT
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300">
              ROLE: AI_FOLLOW_UP_AGENT
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1.5 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-400" />
            AI Follow-up & Nurture Agent
          </h1>
          <p className="text-sm text-slate-400">
            Automates post-demo nurturing, quotation reminders, SLA follow-ups, with human approval and opt-out suppression.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowTaskModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm shadow-lg shadow-blue-600/20 transition-all"
          >
            <Plus className="w-4 h-4" /> New Follow-up Task
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'rules', label: 'Follow-up Rules' },
          { id: 'tasks', label: 'Follow-up Tasks' },
          { id: 'drafts', label: 'AI Message Drafts & Approvals' },
          { id: 'executions', label: 'Execution Logs & Retries' },
          { id: 'suppression', label: 'Suppression & Opt-outs' },
          { id: 'config', label: 'Agent Configuration' },
          { id: 'reports', label: 'Performance Reports' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400 font-medium">Tasks Created</span>
              <p className="text-2xl font-bold text-white mt-1">{metrics.tasksCreated}</p>
              <span className="text-xs text-blue-400 mt-1 block">Scheduled automated tasks</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400 font-medium">Tasks Completed</span>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{metrics.tasksCompleted}</p>
              <span className="text-xs text-slate-400 mt-1 block">Completion rate: {metrics.taskCompletionRatePercentage}%</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400 font-medium">Messages Delivered</span>
              <p className="text-2xl font-bold text-cyan-400 mt-1">{metrics.messagesDelivered}</p>
              <span className="text-xs text-cyan-400/80 mt-1 block">Provider verified delivery</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400 font-medium">Opt-outs Respected</span>
              <p className="text-2xl font-bold text-amber-400 mt-1">{metrics.customersOptedOut}</p>
              <span className="text-xs text-amber-400/80 mt-1 block">Suppressed from outreach</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-blue-400" /> Pending Follow-up Tasks
                </h3>
                <button onClick={() => setActiveTab('tasks')} className="text-xs text-blue-400 hover:underline">
                  View All
                </button>
              </div>
              <div className="space-y-2.5">
                {tasks.map(t => (
                  <div key={t.taskId} className="p-3.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-400">{t.taskId}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          t.priority === 'HIGH' ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-300'
                        }`}>
                          {t.priority}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-white mt-1">{t.title}</p>
                      <p className="text-xs text-slate-400">{t.description}</p>
                    </div>
                    <button
                      onClick={() => handleCompleteTask(t.taskId)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
                    >
                      Complete
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400" /> Communication Safety Rules
              </h3>
              <ul className="text-xs text-slate-300 space-y-2.5">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">1.</span>
                  <span>Stop condition triggers instantly if customer replies or opts out.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">2.</span>
                  <span>Maximum 3 automated outreach messages per prospect per week.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">3.</span>
                  <span>External drafts require explicit human approval before send.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">4.</span>
                  <span>Idempotency safeguards prevent duplicate emails on network retries.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RULES */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-400" /> Automated Follow-up Trigger Rules
            </h3>
            <button
              onClick={() => setShowRuleModal(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Create Rule
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rules.map(r => (
              <div key={r.ruleId} className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-blue-400 font-bold">{r.ruleId}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    r.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'
                  }`}>
                    {r.status}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-white">{r.name}</h4>
                <div className="text-xs text-slate-400 space-y-1">
                  <div>Trigger Event: <strong className="text-slate-200">{r.trigger}</strong></div>
                  <div>Delay: <strong className="text-slate-200">{(r.delayMinutes / 60).toFixed(0)} hours</strong></div>
                  <div>Channel: <strong className="text-slate-200">{r.channel}</strong></div>
                </div>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">Stop on: Customer Reply / Opt-Out</span>
                  <button
                    onClick={() => handleToggleRule(r)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                      r.status === 'ACTIVE' ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    {r.status === 'ACTIVE' ? <><Pause className="w-3 h-3" /> Pause</> : <><Play className="w-3 h-3" /> Activate</>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: TASKS */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700/60">
                <tr>
                  <th className="p-3.5">Task ID</th>
                  <th className="p-3.5">Title</th>
                  <th className="p-3.5">Lead</th>
                  <th className="p-3.5">Priority</th>
                  <th className="p-3.5">Due At</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {tasks.map(t => (
                  <tr key={t.taskId} className="hover:bg-slate-800/40">
                    <td className="p-3.5 font-mono text-blue-400 font-semibold">{t.taskId}</td>
                    <td className="p-3.5 text-white font-medium">{t.title}</td>
                    <td className="p-3.5 text-slate-400">{t.leadName || t.leadId}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        t.priority === 'HIGH' ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-300'
                      }`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400">{t.dueAt ? t.dueAt.slice(0, 16) : 'N/A'}</td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-medium">
                        {t.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      {t.status !== 'COMPLETED' ? (
                        <button
                          onClick={() => handleCompleteTask(t.taskId)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-semibold"
                        >
                          Complete
                        </button>
                      ) : (
                        <span className="text-emerald-400 text-xs">Done ✓</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: DRAFTS & APPROVALS */}
      {activeTab === 'drafts' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" /> AI Message Drafts & Human Review Queue
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {drafts.map(d => (
              <div key={d.draftId} className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-blue-400 font-bold">{d.draftId}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    d.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {d.status}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-white">{d.subject}</h4>
                <p className="text-xs text-slate-300 line-clamp-3 italic bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/40">
                  "{d.body}"
                </p>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">Channel: {d.channel}</span>
                  <div className="space-x-1.5">
                    {d.status === 'PENDING_APPROVAL' && (
                      <button
                        onClick={() => handleApproveDraft(d.draftId)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold"
                      >
                        Approve Draft
                      </button>
                    )}
                    {d.status === 'APPROVED' && (
                      <button
                        onClick={() => handleSendDraft(d.draftId)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" /> Dispatch Message
                      </button>
                    )}
                    {d.status === 'SENT' && (
                      <span className="text-xs text-emerald-400 font-medium">Dispatched ✓</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: EXECUTIONS & RETRIES */}
      {activeTab === 'executions' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" /> Provider Execution & Delivery Logs
          </h3>
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700/60">
                <tr>
                  <th className="p-3.5">Execution ID</th>
                  <th className="p-3.5">Channel</th>
                  <th className="p-3.5">Delivery Status</th>
                  <th className="p-3.5">Failure Code</th>
                  <th className="p-3.5">Attempts</th>
                  <th className="p-3.5 text-right">Retry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {executions.map(e => (
                  <tr key={e.executionId} className="hover:bg-slate-800/40">
                    <td className="p-3.5 font-mono text-blue-400 font-semibold">{e.executionId}</td>
                    <td className="p-3.5">{e.channel}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        e.status === 'DELIVERED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400">{e.failureCode || 'None (Success)'}</td>
                    <td className="p-3.5">{e.attemptCount || 1}</td>
                    <td className="p-3.5 text-right">
                      {e.retryable ? (
                        <button
                          onClick={() => handleRetryExecution(e.executionId)}
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-[11px] font-semibold flex items-center gap-1 ml-auto"
                        >
                          <RotateCcw className="w-3 h-3" /> Safe Retry
                        </button>
                      ) : (
                        <span className="text-slate-500 text-[11px]">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: SUPPRESSION & OPT-OUTS */}
      {activeTab === 'suppression' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <UserX className="w-5 h-5 text-red-400" /> Contact Suppression & Opt-out Registry
          </h3>
          <p className="text-xs text-slate-400">
            Prospects who have opted out or requested suppression. The system guarantees zero message dispatch to these recipients.
          </p>
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700/60">
                <tr>
                  <th className="p-3.5">Suppression ID</th>
                  <th className="p-3.5">Customer ID</th>
                  <th className="p-3.5">Channel</th>
                  <th className="p-3.5">Reason</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {suppressions.map(s => (
                  <tr key={s.suppressionId} className="hover:bg-slate-800/40">
                    <td className="p-3.5 font-mono text-red-400 font-semibold">{s.suppressionId}</td>
                    <td className="p-3.5 text-white font-medium">{s.customerId}</td>
                    <td className="p-3.5">{s.channel}</td>
                    <td className="p-3.5 text-slate-400">{s.reason}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/20 text-red-400">
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: AGENT CONFIGURATION */}
      {activeTab === 'config' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6 max-w-3xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-400" /> AI Follow-Up Agent Engine Configuration
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Customize autonomous post-demo cadences, multi-touch nurture logic, and SLA thresholds.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Active v2.4
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">Primary LLM Model</label>
              <select className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white">
                <option>Claude 3.5 Sonnet (Enterprise)</option>
                <option>GPT-4o (High Concurrency)</option>
                <option>Google Gemini 1.5 Pro</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">Max Follow-up Attempts Per Lead</label>
              <input type="number" defaultValue={3} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white" />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">Cadence Delays (Hours)</label>
              <input type="text" defaultValue="24h, 48h, 96h" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white" />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">Human Review Trigger Amount</label>
              <input type="text" defaultValue="₹50,000+ Deals" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white" />
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-800 text-xs">
            <h4 className="font-semibold text-white">Autonomous Channels & Safeguards</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="flex items-center gap-2 p-3 bg-slate-800/60 border border-slate-700 rounded-xl cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                <span className="text-slate-200">Email Sequences</span>
              </label>
              <label className="flex items-center gap-2 p-3 bg-slate-800/60 border border-slate-700 rounded-xl cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                <span className="text-slate-200">WhatsApp Nudges</span>
              </label>
              <label className="flex items-center gap-2 p-3 bg-slate-800/60 border border-slate-700 rounded-xl cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                <span className="text-slate-200">SMS Reminders</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              onClick={() => alert('Follow-Up Agent Configuration Saved Successfully!')}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 transition"
            >
              Save Configuration
            </button>
          </div>
        </div>
      )}

      {/* TAB 8: PERFORMANCE REPORTS */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400 font-medium">Nurture Conversion</span>
              <p className="text-2xl font-bold text-emerald-400 mt-1">28.4%</p>
              <span className="text-xs text-slate-400 mt-1 block">+4.2% vs human manual</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400 font-medium">Avg Response Latency</span>
              <p className="text-2xl font-bold text-sky-400 mt-1">2h 15m</p>
              <span className="text-xs text-sky-400/80 mt-1 block">Post-demo engagement</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400 font-medium">Influenced Revenue</span>
              <p className="text-2xl font-bold text-amber-400 mt-1">₹18,40,000</p>
              <span className="text-xs text-amber-400/80 mt-1 block">Closed nurtured deals</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400 font-medium">Delivery Success Rate</span>
              <p className="text-2xl font-bold text-blue-400 mt-1">98.6%</p>
              <span className="text-xs text-slate-400 mt-1 block">Across all 3 channels</span>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-400" /> Channel Engagement Breakdown
              </h3>
              <button
                onClick={() => alert('Performance report exported as CSV.')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700"
              >
                Export CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="text-[11px] uppercase bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3">Channel</th>
                    <th className="p-3">Sent</th>
                    <th className="p-3">Delivered</th>
                    <th className="p-3">Opened</th>
                    <th className="p-3">Replied</th>
                    <th className="p-3">Conversion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  <tr className="hover:bg-slate-800/30">
                    <td className="p-3 font-semibold text-white">WhatsApp Business API</td>
                    <td className="p-3">180</td>
                    <td className="p-3 text-emerald-400">178 (98.8%)</td>
                    <td className="p-3 text-sky-400">165 (91.6%)</td>
                    <td className="p-3 text-purple-400">62 (34.4%)</td>
                    <td className="p-3 font-bold text-emerald-400">32.2%</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30">
                    <td className="p-3 font-semibold text-white">Email (AWS SES)</td>
                    <td className="p-3">120</td>
                    <td className="p-3 text-emerald-400">118 (98.3%)</td>
                    <td className="p-3 text-sky-400">82 (68.3%)</td>
                    <td className="p-3 text-purple-400">28 (23.3%)</td>
                    <td className="p-3 font-bold text-emerald-400">24.5%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE RULE */}
      {showRuleModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-400" /> Create Follow-up Trigger Rule
            </h3>
            <form onSubmit={handleCreateRule} className="space-y-3">
              <div>
                <label className="text-slate-400 mb-1 block">Rule Name</label>
                <input
                  type="text"
                  required
                  value={ruleForm.name}
                  onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 mb-1 block">Trigger Event</label>
                <select
                  value={ruleForm.trigger}
                  onChange={(e) => setRuleForm({ ...ruleForm, trigger: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                >
                  <option value="DEMO_COMPLETED">Demo Completed</option>
                  <option value="QUOTATION_SENT">Quotation Sent</option>
                  <option value="NEW_LEAD_UNCONTACTED">New Lead (No contact in 24h)</option>
                  <option value="CUSTOMER_ONBOARDING_STARTED">Onboarding Started</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 mb-1 block">Delay (Minutes)</label>
                <input
                  type="number"
                  required
                  value={ruleForm.delayMinutes}
                  onChange={(e) => setRuleForm({ ...ruleForm, delayMinutes: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRuleModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold"
                >
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE TASK */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-400" /> Create Follow-up Task
            </h3>
            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="text-slate-400 mb-1 block">Lead ID</label>
                <input
                  type="text"
                  required
                  value={taskForm.leadId}
                  onChange={(e) => setTaskForm({ ...taskForm, leadId: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 mb-1 block">Title</label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 mb-1 block">Description</label>
                <textarea
                  rows={2}
                  required
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
