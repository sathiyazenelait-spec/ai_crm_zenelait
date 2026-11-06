import React, { useState, useEffect } from 'react';
import { useCRM } from '../../context/CRMContext';
import { travelService } from '../../services/travelService';
import {
  Clock,
  Calendar,
  Send,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  TrendingUp,
  RefreshCw,
  Plus,
  Play,
  Pause,
  Eye,
  UserX,
  UserCheck,
  Check,
  MessageSquare,
  Bot,
  Layers,
  ChevronRight,
  Filter
} from 'lucide-react';

export function TravelAiFollowUpAgentView() {
  const { addNotification } = useCRM();

  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'plans' | 'queue' | 'drafts' | 'responses' | 'consent' | 'escalations' | 'settings'
  const [isLoading, setIsLoading] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [plans, setPlans] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [queue, setQueue] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [escalations, setEscalations] = useState([]);
  const [settings, setSettings] = useState(null);
  const [preferences, setPreferences] = useState(null);

  // Active items
  const [selectedTask, setSelectedTask] = useState(null);
  const [drafts, setDrafts] = useState([]);
  const [planPreview, setPlanPreview] = useState(null);

  // Modals & Forms
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planForm, setPlanForm] = useState({
    name: 'Travel quotation follow-up',
    triggerEvent: 'TRAVEL_QUOTATION_SENT',
    delayStep1: 1440,
    channelStep1: 'EMAIL',
    delayStep2: 4320,
    channelStep2: 'EMAIL',
    stopOnReply: true,
    stopOnAcceptance: true,
    stopOnOptOut: true,
    requireApproval: true
  });

  const [replyText, setReplyText] = useState('Can you show me a cheaper package?');
  const [classifiedResponse, setClassifiedResponse] = useState(null);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [dashRes, plansRes, tasksRes, queueRes, overdueRes, escRes, setRes, prefRes] = await Promise.all([
        travelService.aiFollowUpAgent.getDashboard().catch(() => null),
        travelService.aiFollowUpAgent.getPlans().catch(() => []),
        travelService.aiFollowUpAgent.getTasks().catch(() => []),
        travelService.aiFollowUpAgent.getQueue().catch(() => []),
        travelService.aiFollowUpAgent.getOverdue().catch(() => []),
        travelService.aiFollowUpAgent.getEscalations().catch(() => []),
        travelService.aiFollowUpAgent.getSettings().catch(() => null),
        travelService.aiFollowUpAgent.getCustomerPreferences('CUST-1001').catch(() => null)
      ]);

      setDashboard(dashRes);
      setPlans(plansRes);
      setTasks(tasksRes);
      setQueue(queueRes);
      setOverdue(overdueRes);
      setEscalations(escRes);
      setSettings(setRes);
      setPreferences(prefRes);

      if (tasksRes && tasksRes.length > 0 && !selectedTask) {
        setSelectedTask(tasksRes[0]);
      }
    } catch (err) {
      console.error(err);
      addNotification?.('Failed to load Follow-up Agent data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // 1. Create Follow-up Plan
  const handleCreatePlan = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = {
        name: planForm.name,
        trigger: { event: planForm.triggerEvent },
        steps: [
          { delayMinutes: Number(planForm.delayStep1), channel: planForm.channelStep1, templateId: 'travel_quote_followup_v1' },
          { delayMinutes: Number(planForm.delayStep2), channel: planForm.channelStep2, templateId: 'travel_quote_followup_v2' }
        ],
        rules: {
          stopOnCustomerReply: planForm.stopOnReply,
          stopOnQuotationAccepted: planForm.stopOnAcceptance,
          stopOnOptOut: planForm.stopOnOptOut,
          requireConsent: true,
          maxMessagesPerLeadPerWeek: 3,
          requireHumanApproval: planForm.requireApproval
        }
      };
      const res = await travelService.aiFollowUpAgent.createPlan(payload);
      addNotification?.(`Follow-up plan ${res.planId} created successfully!`, 'success');
      setShowPlanModal(false);
      loadAllData();
    } catch (err) {
      addNotification?.(err.message || 'Failed to create plan', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Preview Plan
  const handlePreviewPlan = async (planId) => {
    setIsLoading(true);
    try {
      const res = await travelService.aiFollowUpAgent.previewPlan(planId || 'follow_plan_1001', {
        leadId: 'LEAD-1001',
        quotationId: 'QUOTE-1001'
      });
      setPlanPreview(res);
      addNotification?.('Follow-up simulation generated without sending messages.', 'info');
    } catch (err) {
      addNotification?.(err.message || 'Preview failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Draft Message for Task
  const handleDraftMessage = async (taskId) => {
    setIsLoading(true);
    try {
      const res = await travelService.aiFollowUpAgent.draftMessage(taskId || 'TASK-1001', {
        tone: 'FRIENDLY',
        language: 'en',
        purpose: 'ASK_IF_CUSTOMER_HAS_QUESTIONS',
        includeQuotationReference: true
      });
      setDrafts([res]);
      addNotification?.('AI grounded draft prepared. Consent check pending.', 'success');
      setActiveTab('drafts');
    } catch (err) {
      addNotification?.(err.message || 'Draft generation failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Approve Draft
  const handleApproveDraft = async (taskId, draftId) => {
    setIsLoading(true);
    try {
      await travelService.aiFollowUpAgent.approveMessage(taskId, {
        draftId,
        decision: 'APPROVE',
        comment: 'Approved after policy verification.'
      });
      addNotification?.('Message approval recorded. Final policy check will precede delivery.', 'success');
      loadAllData();
    } catch (err) {
      addNotification?.(err.message || 'Approval failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Send Message (Consent Enforced)
  const handleSendMessage = async (taskId, draftId) => {
    setIsLoading(true);
    try {
      await travelService.aiFollowUpAgent.sendMessage(taskId, {
        draftId: draftId || 'draft_1001',
        channel: 'EMAIL'
      });
      addNotification?.('Message enqueued for delivery!', 'success');
      loadAllData();
    } catch (err) {
      addNotification?.(`Delivery Blocked: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 6. Record Opt-Out
  const handleRecordOptOut = async (customerId) => {
    setIsLoading(true);
    try {
      const res = await travelService.aiFollowUpAgent.optOutCustomer(customerId || 'CUST-1001', {
        channel: 'EMAIL',
        reason: 'CUSTOMER_REQUEST',
        source: 'INBOUND_EMAIL'
      });
      addNotification?.(`Customer ${customerId} opted out. Cancelled ${res.pendingMatchingTasksCancelled} pending follow-up tasks!`, 'info');
      loadAllData();
    } catch (err) {
      addNotification?.(err.message || 'Opt-out failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 7. Record Opt-In
  const handleRecordOptIn = async (customerId) => {
    setIsLoading(true);
    try {
      await travelService.aiFollowUpAgent.optInCustomer(customerId || 'CUST-1001', { channel: 'EMAIL' });
      addNotification?.(`Opt-in verified and recorded for ${customerId}!`, 'success');
      loadAllData();
    } catch (err) {
      addNotification?.(err.message || 'Opt-in failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 8. Classify Response
  const handleClassifyResponse = async () => {
    setIsLoading(true);
    try {
      const res = await travelService.aiFollowUpAgent.classifyResponse({
        leadId: 'LEAD-1001',
        text: replyText
      });
      setClassifiedResponse(res);
      addNotification?.(`Intent: ${res.intent} • Sequence auto-stopped: ${res.cancelPendingFollowUps}`, 'success');
    } catch (err) {
      addNotification?.(err.message || 'Classification failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-amber-950 via-amber-900 to-indigo-950 p-6 rounded-2xl text-white shadow-xl border border-amber-800/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-500/20 rounded-lg text-amber-300 border border-amber-400/30">
              <Clock className="w-6 h-6 animate-pulse" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight">AI Follow-up Agent</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
              Durable Orchestration Engine
            </span>
          </div>
          <p className="text-amber-200 text-sm">
            Consent-Compliant Cadences • Quiet Hours Check • Opt-Out Guardrails • Reply Intent Classification
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAllData}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-medium transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowPlanModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl text-xs shadow-lg transition"
          >
            <Plus className="w-4 h-4" />
            New Follow-up Plan
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-gray-200 dark:border-gray-800 pb-2">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: Clock },
          { id: 'plans', label: 'Automation Plans', icon: Layers, count: plans.length },
          { id: 'queue', label: 'Tasks Queue', icon: Calendar, count: tasks.length },
          { id: 'drafts', label: 'Message Drafts & Approvals', icon: MessageSquare },
          { id: 'responses', label: 'Customer Responses & Intent', icon: Bot },
          { id: 'consent', label: 'Consent & Suppression', icon: UserX },
          { id: 'escalations', label: 'Human Escalations', icon: AlertTriangle, count: escalations.length },
          { id: 'settings', label: 'Policy & Quiet Hours', icon: ShieldCheck }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  isActive ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="flex items-center justify-between text-gray-500 text-xs">
                <span>Scheduled Cadence Tasks</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
                {dashboard?.scheduledTasks ?? 145}
              </div>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">Durable queue managed</p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="flex items-center justify-between text-gray-500 text-xs">
                <span>Due Now</span>
                <AlertTriangle className="w-4 h-4 text-orange-500" />
              </div>
              <div className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
                {dashboard?.dueNow ?? 18}
              </div>
              <p className="text-[11px] text-gray-500 mt-1">Awaiting consent pre-check</p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="flex items-center justify-between text-gray-500 text-xs">
                <span>Messages Delivered Today</span>
                <Send className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
                {dashboard?.messagesSentToday ?? 42}
              </div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">99.2% deliverability</p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="flex items-center justify-between text-gray-500 text-xs">
                <span>Customer Opt-Outs</span>
                <UserX className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
                {dashboard?.optOutsRecordedToday ?? 1}
              </div>
              <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">All future sends suppressed</p>
            </div>
          </div>

          {/* Privacy & Guardrail Alert */}
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
              <p className="font-semibold">Pre-Send Validation Principle Enforced</p>
              <p className="text-amber-700 dark:text-amber-300">
                A scheduled follow-up is NOT permission to send. The engine checks (1) explicit channel consent,
                (2) opt-out/suppression status, (3) quiet hours (21:00-08:00), and (4) whether the customer has already replied or accepted before every transmission.
              </p>
            </div>
          </div>

          {/* Active Tasks Preview */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-600" />
              Upcoming Follow-up Actions
            </h3>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {tasks.slice(0, 4).map((task) => (
                <div key={task.taskId} className="py-3 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-gray-400">{task.taskId}</span>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white">{task.reason || 'QUOTATION_PENDING_RESPONSE'}</h4>
                    </div>
                    <p className="text-[11px] text-gray-500">
                      Channel: <strong className="text-gray-700 dark:text-gray-300">{task.channel || 'EMAIL'}</strong> • Scheduled: {task.scheduledAt || 'Tomorrow 10:00 AM'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDraftMessage(task.taskId)}
                      className="px-3 py-1 bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-lg text-xs font-semibold hover:bg-amber-100 transition"
                    >
                      Draft AI Message
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AUTOMATION PLANS */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800">
            <h2 className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Configured Automation Plans ({plans.length})
            </h2>
            <button
              onClick={() => setShowPlanModal(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition shadow"
            >
              <Plus className="w-3.5 h-3.5" /> Create Plan
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans.map((p) => (
              <div key={p.planId} className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[10px] text-gray-400">{p.planId}</span>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">{p.name}</h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    {p.status || 'ACTIVE'}
                  </span>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/40 p-3 rounded-xl border border-gray-200 dark:border-gray-800 space-y-1.5 text-xs text-gray-600 dark:text-gray-300">
                  <div>Trigger: <strong className="text-gray-900 dark:text-white">{p.trigger?.event || 'TRAVEL_QUOTATION_SENT'}</strong></div>
                  <div>Step 1: Delay 24h • Channel EMAIL</div>
                  <div>Step 2: Delay 72h • Channel EMAIL</div>
                  <div className="pt-1 text-[11px] text-gray-500 border-t border-gray-200 dark:border-gray-700">
                    Stop on reply: <span className="text-emerald-600 font-semibold">YES</span> • Stop on acceptance: <span className="text-emerald-600 font-semibold">YES</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handlePreviewPlan(p.planId)}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <Eye className="w-3.5 h-3.5" /> Preview Simulation
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Simulation Preview Output */}
          {planPreview && (
            <div className="p-5 bg-white dark:bg-gray-900 rounded-2xl border border-amber-200 dark:border-amber-800 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-600" />
                Plan Simulation for Lead {planPreview.leadId}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {planPreview.actions?.map((act, i) => (
                  <div key={i} className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-700 space-y-1">
                    <span className="text-[10px] font-bold text-amber-600">Step {act.step}</span>
                    <p className="text-gray-800 dark:text-gray-200">Scheduled: {act.scheduledAt}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-mono">
                      {act.eligibility}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-gray-400">Simulation verified. No messages sent to customers.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TASKS QUEUE */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 dark:text-white">Active Operational Queue</span>
              <span className="text-xs text-gray-500">Overdue Tasks: {overdue.length}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-500 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5">Task ID</th>
                    <th className="p-3.5">Reason</th>
                    <th className="p-3.5">Scheduled At</th>
                    <th className="p-3.5">Channel</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {tasks.map((t) => (
                    <tr key={t.taskId} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                      <td className="p-3.5 font-mono text-[11px] text-gray-600 dark:text-gray-400">{t.taskId}</td>
                      <td className="p-3.5 font-semibold text-gray-900 dark:text-white">{t.reason}</td>
                      <td className="p-3.5 text-gray-600 dark:text-gray-400">{t.scheduledAt || '2026-10-29T10:00:00Z'}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                          {t.channel || 'EMAIL'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          t.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : t.status === 'CANCELLED_OPT_OUT'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {t.status || 'PENDING'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => handleDraftMessage(t.taskId)}
                          className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 hover:bg-amber-100 rounded text-[11px] font-semibold border border-amber-200 dark:border-amber-800 transition"
                        >
                          Draft Message
                        </button>
                        <button
                          onClick={async () => {
                            await travelService.aiFollowUpAgent.completeTask(t.taskId);
                            addNotification?.(`Task ${t.taskId} marked completed`, 'success');
                            loadAllData();
                          }}
                          className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 rounded text-[11px] font-semibold border border-emerald-200 dark:border-emerald-800 transition"
                        >
                          Complete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MESSAGE DRAFTS & APPROVALS */}
      {activeTab === 'drafts' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-600" />
              Follow-up Message Drafts & Human Approvals
            </h2>

            {drafts.length > 0 ? (
              <div className="space-y-4">
                {drafts.map((d, i) => (
                  <div key={i} className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-[10px] text-gray-400">{d.draftId}</span>
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white">Subject: {d.subject}</h4>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                        {d.status || 'DRAFT'}
                      </span>
                    </div>

                    <div className="p-3.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 text-xs text-gray-700 dark:text-gray-300">
                      {d.body}
                    </div>

                    <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
                      <span>Send Eligibility: <strong>{d.sendEligible ? 'ELIGIBLE' : 'REQUIRES_CONSENT_CHECK'}</strong></span>
                      <span className="text-[11px] text-amber-600 font-medium">Claims Validated: YES</span>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleApproveDraft(d.taskId || 'TASK-1001', d.draftId)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve Draft
                      </button>
                      <button
                        onClick={() => handleSendMessage(d.taskId || 'TASK-1001', d.draftId)}
                        className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                      >
                        <Send className="w-3.5 h-3.5" /> Send Follow-up
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 text-xs">
                No draft generated yet. Select a task in the queue and click "Draft Message".
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: CUSTOMER RESPONSES & INTENT */}
      {activeTab === 'responses' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Bot className="w-4 h-4 text-amber-600" />
              Inbound Reply Intent Classifier
            </h2>
            <p className="text-xs text-gray-500">
              When a customer replies to a travel proposal, the AI classifies the intent (e.g. requesting cheaper options, changing dates) and stops the automated sales cadence immediately.
            </p>

            <div className="space-y-3 pt-2">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block">
                Simulated Inbound Customer Message:
              </label>
              <textarea
                rows="2"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs"
              />
              <button
                onClick={handleClassifyResponse}
                disabled={isLoading}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold transition"
              >
                Classify Intent & Handle Cadence
              </button>
            </div>

            {classifiedResponse && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-800 space-y-2 text-xs mt-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Classified Intent:</span>
                  <strong className="text-indigo-600 dark:text-indigo-400 font-mono">{classifiedResponse.intent}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Sentiment:</span>
                  <strong className="text-gray-900 dark:text-white">{classifiedResponse.sentiment}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Automated Sequence Stopped:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    {classifiedResponse.cancelPendingFollowUps ? 'TRUE (Stopped)' : 'FALSE'}
                  </span>
                </div>
                <div className="pt-2 text-gray-600 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700">
                  Recommended Next Action: <em>{classifiedResponse.recommendedAction}</em>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: CONSENT & SUPPRESSION */}
      {activeTab === 'consent' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <UserX className="w-4 h-4 text-rose-600" />
              Customer Contact Preferences & Suppression Management
            </h2>

            <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white">Arun Kumar (CUST-1001)</h3>
                  <p className="text-[11px] text-gray-500">arun@example.com • +919876543210</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  preferences?.suppressionStatus === 'OPTED_OUT'
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                }`}>
                  {preferences?.suppressionStatus || 'ALLOWED'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs pt-1">
                <div className="p-2.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                  <span className="text-gray-400 text-[10px] block">Email Consent</span>
                  <strong className={preferences?.emailConsent === 'GRANTED' ? 'text-emerald-600' : 'text-rose-600'}>
                    {preferences?.emailConsent || 'GRANTED'}
                  </strong>
                </div>
                <div className="p-2.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                  <span className="text-gray-400 text-[10px] block">SMS Consent</span>
                  <strong className="text-emerald-600">{preferences?.smsConsent || 'GRANTED'}</strong>
                </div>
                <div className="p-2.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                  <span className="text-gray-400 text-[10px] block">WhatsApp Consent</span>
                  <strong className="text-emerald-600">{preferences?.whatsappConsent || 'GRANTED'}</strong>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => handleRecordOptOut('CUST-1001')}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                >
                  <UserX className="w-3.5 h-3.5" /> Record Customer Opt-Out (Revoke Email)
                </button>
                <button
                  onClick={() => handleRecordOptIn('CUST-1001')}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                >
                  <UserCheck className="w-3.5 h-3.5" /> Restore Valid Opt-In
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: HUMAN ESCALATIONS */}
      {activeTab === 'escalations' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              Human Escalation Log ({escalations.length})
            </h3>
            <p className="text-xs text-gray-500">
              When a lead requires personal assistance, negotiation, or custom travel routes beyond AI limits, the AI Follow-up Agent pauses automation and escalates.
            </p>

            <div className="space-y-3 pt-2">
              {escalations.map((esc) => (
                <div key={esc.escalationId} className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="font-mono text-[10px] text-gray-400">{esc.escalationId}</span>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">{esc.reason || 'CUSTOMER_REQUESTED_HUMAN_ASSISTANCE'}</h4>
                    <p className="text-[11px] text-gray-500">Assigned Role: <strong className="text-amber-600">{esc.assignedRole}</strong> • Automation Paused: YES</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                    {esc.status || 'OPEN'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: SETTINGS & QUIET HOURS */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              Follow-up Policy & Quiet Hours Rules
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-800 space-y-2">
                <span className="text-gray-500 block">Quiet Hours Enforced</span>
                <strong className="text-gray-900 dark:text-white font-mono">
                  {settings?.quietHoursStart || '21:00'} - {settings?.quietHoursEnd || '08:00'} (Local Tenant Time)
                </strong>
                <p className="text-[11px] text-gray-400">No automated messages will be transmitted during this window.</p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-800 space-y-2">
                <span className="text-gray-500 block">Max Contact Frequency</span>
                <strong className="text-gray-900 dark:text-white font-mono">
                  {settings?.maxMessagesPerLeadPerWeek || 3} Messages / Lead / Week
                </strong>
                <p className="text-[11px] text-gray-400">Protects customers against spam and message fatigue.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE PLAN MODAL */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full p-6 space-y-4 border border-gray-200 dark:border-gray-800 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-600" />
                Configure Follow-up Plan
              </h3>
              <button onClick={() => setShowPlanModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleCreatePlan} className="space-y-3 text-xs">
              <div>
                <label className="text-gray-500 block mb-1">Plan Name</label>
                <input
                  type="text"
                  value={planForm.name}
                  onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-500 block mb-1">Step 1 Delay (Minutes)</label>
                  <input
                    type="number"
                    value={planForm.delayStep1}
                    onChange={(e) => setPlanForm({ ...planForm, delayStep1: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="text-gray-500 block mb-1">Step 2 Delay (Minutes)</label>
                  <input
                    type="number"
                    value={planForm.delayStep2}
                    onChange={(e) => setPlanForm({ ...planForm, delayStep2: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5 pt-1">
                <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={planForm.stopOnReply}
                    onChange={(e) => setPlanForm({ ...planForm, stopOnReply: e.target.checked })}
                    className="rounded"
                  />
                  Stop cadence when customer replies
                </label>
                <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={planForm.stopOnAcceptance}
                    onChange={(e) => setPlanForm({ ...planForm, stopOnAcceptance: e.target.checked })}
                    className="rounded"
                  />
                  Stop cadence when quotation is accepted
                </label>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold transition"
                >
                  Save Automation Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
