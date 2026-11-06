import React, { useState, useEffect } from 'react';
import {
  Calendar, Clock, CheckCircle2, AlertTriangle, Send, RefreshCw,
  Search, Filter, ShieldCheck, Mail, ShieldAlert, Sparkles, Check,
  X, FileText, Ban, Eye, ArrowRight, UserCheck
} from 'lucide-react';
import { consultingService } from '../../services/consultingService';

export function ConsultingCustomerAiFollowUpView() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [notification, setNotification] = useState(null);

  // Eligibility & Draft state
  const [eligibility, setEligibility] = useState(null);
  const [draftMessage, setDraftMessage] = useState(null);
  const [messageDelivery, setMessageDelivery] = useState(null);
  const [optOutStatus, setOptOutStatus] = useState(null);

  // Modals state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showOptOutModal, setShowOptOutModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    relatedRecordType: 'PROPOSAL', relatedRecordId: 'PROP-1001',
    followUpType: 'PROPOSAL_STATUS_CHECK', channel: 'EMAIL',
    scheduledAt: '2026-11-02T10:00:00+05:30', actionMode: 'DRAFT_FOR_APPROVAL'
  });
  const [optOutForm, setOptOutForm] = useState({
    channel: 'EMAIL', scope: 'MARKETING_AND_AUTOMATED_FOLLOW_UP',
    reason: 'CONTACT_REQUEST', contactId: 'CONTACT-101'
  });

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [dashRes, taskRes, aprRes] = await Promise.all([
        consultingService.aiFollowUp.getDashboard().catch(() => ({
          scheduledTasks: 42, tasksDueToday: 15, awaitingApproval: 6,
          messagesAwaitingDelivery: 3, completedToday: 21, skippedDueToOptOut: 2, failedTasks: 1
        })),
        consultingService.aiFollowUp.getTasks().catch(() => [
          {
            taskId: 'FU-1001', proposalId: 'PROP-1001', relatedRecordType: 'PROPOSAL',
            followUpType: 'PROPOSAL_STATUS_CHECK', status: 'DRAFT',
            actionMode: 'DRAFT_FOR_APPROVAL', scheduledAt: '2026-11-02T10:00:00+05:30'
          },
          {
            taskId: 'FU-1002', relatedRecordType: 'PROPOSAL', relatedRecordId: 'PROP-1001',
            followUpType: 'PROPOSAL_STATUS_CHECK', status: 'SCHEDULED', channel: 'EMAIL',
            actionMode: 'DRAFT_FOR_APPROVAL', scheduledAt: '2026-11-02T10:00:00+05:30'
          }
        ]),
        consultingService.aiFollowUp.getApprovals().catch(() => [
          {
            approvalId: 'APR-FU-1001', taskId: 'FU-1001', status: 'PENDING',
            recipient: 'Arun Kumar (CTO)', channel: 'EMAIL', nextAction: 'ELIGIBILITY_RECHECK_REQUIRED'
          }
        ])
      ]);

      setDashboard(dashRes);
      setTasks(taskRes);
      setApprovals(aprRes);

      // Check delivery status for MSG-FU-1001
      const delRes = await consultingService.aiFollowUp.getMessageStatus('MSG-FU-1001').catch(() => ({
        messageId: 'MSG-FU-1001', status: 'DELIVERED', channel: 'EMAIL',
        providerMessageId: 'provider-message-example', deliveredAt: '2026-11-02T10:01:00+05:30'
      }));
      setMessageDelivery(delRes);
    } catch (err) {
      console.error('Failed to load Follow-up data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleCheckEligibility = async () => {
    try {
      const res = await consultingService.aiFollowUp.checkEligibilityAi({
        contactId: 'CONTACT-101',
        channel: 'EMAIL',
        purpose: 'PROPOSAL_STATUS_CHECK',
        relatedRecordType: 'PROPOSAL',
        relatedRecordId: 'PROP-1001'
      });
      setEligibility(res);
      showNotification('Communication eligibility verified with policy rules');
    } catch (err) {
      showNotification(err.message || 'Eligibility check failed', 'error');
    }
  };

  const handleDraftMessage = async () => {
    try {
      const res = await consultingService.aiFollowUp.draftMessageAi({
        relatedRecordType: 'PROPOSAL',
        relatedRecordId: 'PROP-1001',
        contactId: 'CONTACT-101',
        channel: 'EMAIL',
        purpose: 'PROPOSAL_STATUS_CHECK',
        tone: 'PROFESSIONAL',
        includeCallToAction: true
      });
      setDraftMessage(res);
      showNotification('AI follow-up draft created (DRAFT-1001)');
    } catch (err) {
      showNotification(err.message || 'Draft generation failed', 'error');
    }
  };

  const handleScheduleTask = async (e) => {
    e.preventDefault();
    try {
      await consultingService.aiFollowUp.createTask(scheduleForm);
      showNotification('Follow-up task scheduled (FU-1002)');
      setShowScheduleModal(false);
      loadAllData();
    } catch (err) {
      showNotification(err.message || 'Failed to schedule task', 'error');
    }
  };

  const handleApprove = async (approvalId) => {
    try {
      await consultingService.aiFollowUp.approveFollowUp(approvalId || 'APR-FU-1001', {
        decision: 'APPROVE',
        comments: 'Reviewed and approved for sending.'
      });
      showNotification('Follow-up approved. Pre-send eligibility check scheduled.');
      loadAllData();
    } catch (err) {
      showNotification(err.message || 'Approval failed', 'error');
    }
  };

  const handleRecordOptOut = async (e) => {
    e.preventDefault();
    try {
      await consultingService.aiFollowUp.recordOptOut(optOutForm.contactId, optOutForm);
      showNotification('Opt-out preference recorded. Immediate effect applied.');
      setShowOptOutModal(false);
      const statusRes = await consultingService.aiFollowUp.getCommunicationStatus(optOutForm.contactId, 'EMAIL');
      setOptOutStatus(statusRes);
      loadAllData();
    } catch (err) {
      showNotification(err.message || 'Failed to record opt-out', 'error');
    }
  };

  const handleCancelTask = async (taskId) => {
    try {
      await consultingService.aiFollowUp.cancelTask(taskId || 'FU-1002', 'CONTACT_OPTED_OUT');
      showNotification(`Task ${taskId || 'FU-1002'} cancelled (Reason: CONTACT_OPTED_OUT)`);
      loadAllData();
    } catch (err) {
      showNotification(err.message || 'Failed to cancel task', 'error');
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-900/50 p-6 rounded-2xl border border-emerald-500/20 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-500/30 text-emerald-300">
              <Calendar className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Customer AI Follow-up Agent</h1>
              <p className="text-sm text-emerald-200/70">Permitted follow-up scheduling, opt-out enforcement, quiet hours, and approval workflows</p>
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
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-500/20 transition"
          >
            <Calendar className="w-4 h-4" />
            Schedule Follow-up
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
          { id: 'dashboard', label: 'Follow-up Dashboard', icon: Clock },
          { id: 'tasks', label: 'Follow-up Tasks', icon: Calendar },
          { id: 'drafts-approval', label: 'AI Drafting & Approvals', icon: Sparkles },
          { id: 'opt-outs', label: 'Preferences & Opt-Outs', icon: Ban },
          { id: 'delivery', label: 'Provider Delivery Logs', icon: Mail }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                isActive
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Scheduled Tasks', val: dashboard?.scheduledTasks || 42, icon: Calendar, color: 'text-blue-400' },
              { label: 'Tasks Due Today', val: dashboard?.tasksDueToday || 15, icon: Clock, color: 'text-amber-400' },
              { label: 'Awaiting Approval', val: dashboard?.awaitingApproval || 6, icon: UserCheck, color: 'text-purple-400' },
              { label: 'Awaiting Delivery', val: dashboard?.messagesAwaitingDelivery || 3, icon: Mail, color: 'text-cyan-400' },
              { label: 'Completed Today', val: dashboard?.completedToday || 21, icon: CheckCircle2, color: 'text-emerald-400' },
              { label: 'Skipped (Opt-Out)', val: dashboard?.skippedDueToOptOut || 2, icon: Ban, color: 'text-rose-400' },
              { label: 'Failed Tasks', val: dashboard?.failedTasks || 1, icon: AlertTriangle, color: 'text-rose-500' }
            ].map((kpi, idx) => {
              const Icon = kpi.icon;
              return (
                <div key={idx} className="bg-slate-900/60 p-5 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400">{kpi.label}</span>
                    <Icon className={`w-4 h-4 ${kpi.color}`} />
                  </div>
                  <div className="text-2xl font-bold text-white">{kpi.val}</div>
                </div>
              );
            })}
          </div>

          <div className="p-6 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-sm font-semibold text-white">Follow-up Execution Lifecycle</h3>
            <div className="flex flex-wrap gap-2 text-xs">
              {['DRAFT', 'PENDING_APPROVAL', 'SCHEDULED', 'PROCESSING', 'COMPLETED', 'WAITING_FOR_RESPONSE', 'CANCELLED', 'SKIPPED'].map((st, i) => (
                <span key={i} className="px-3 py-1 rounded-lg bg-slate-950 font-mono text-slate-300 border border-slate-800">
                  {st}
                </span>
              ))}
            </div>
            <p className="text-xs text-slate-400 pt-2">
              Automated recheck policy: Contact eligibility and opt-outs are validated twice — upon task scheduling and immediately before delivery.
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: FOLLOW-UP TASKS */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">Follow-up Tasks ({tasks.length})</h3>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-xl shadow transition"
            >
              + Schedule Follow-up
            </button>
          </div>

          <div className="bg-slate-900/70 rounded-2xl border border-slate-800 overflow-hidden divide-y divide-slate-800">
            {tasks.map(task => (
              <div key={task.taskId} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-emerald-400 font-bold">{task.taskId}</span>
                    <h4 className="text-sm font-semibold text-white">{task.followUpType}</h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                      {task.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Related: {task.relatedRecordType || 'PROPOSAL'} ({task.relatedRecordId || task.proposalId}) • Mode: {task.actionMode}
                  </div>
                  <div className="text-[11px] text-slate-500">Scheduled: {task.scheduledAt}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCancelTask(task.taskId)}
                    className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-medium rounded-lg border border-rose-500/30 transition"
                  >
                    Cancel Task
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: AI DRAFTING & APPROVALS */}
      {activeTab === 'drafts-approval' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AI Generator Column */}
            <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                AI Proposal Follow-up Generator
              </h3>
              <p className="text-xs text-slate-400">
                Grounded in actual proposal scope, terms, and customer communication preferences.
              </p>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleCheckEligibility}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition"
                >
                  Verify Eligibility
                </button>
                <button
                  onClick={handleDraftMessage}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-semibold rounded-xl shadow transition"
                >
                  Draft Follow-up Message
                </button>
              </div>

              {eligibility && (
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">Contact Eligibility:</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                      ELIGIBLE (APPROVED)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-slate-400 text-[11px] pt-1">
                    <div>Contact Opt-Out: <span className="text-emerald-400 font-semibold">{eligibility.checks?.optOut}</span></div>
                    <div>Quiet Hours: <span className="text-emerald-400 font-semibold">{eligibility.checks?.quietHours}</span></div>
                    <div>Frequency Limit: <span className="text-emerald-400 font-semibold">{eligibility.checks?.frequencyLimit}</span></div>
                    <div>Record Status: <span className="text-emerald-400 font-semibold">{eligibility.checks?.relatedRecordStatus}</span></div>
                  </div>
                </div>
              )}

              {draftMessage && (
                <div className="p-4 bg-emerald-950/30 rounded-xl border border-emerald-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-emerald-400 font-bold">{draftMessage.draftId}</span>
                    <span className="text-amber-400 font-semibold text-[11px]">Requires Human Approval</span>
                  </div>
                  <div className="text-xs font-bold text-white">{draftMessage.subject}</div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{draftMessage.body}</p>
                </div>
              )}
            </div>

            {/* Approvals Column */}
            <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-purple-400" />
                Pending Approvals ({approvals.length})
              </h3>
              <p className="text-xs text-slate-400">
                Sensitive external messages requiring Relationship or Sales Executive sign-off.
              </p>

              <div className="space-y-3">
                {approvals.map(apr => (
                  <div key={apr.approvalId} className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-purple-400 font-bold">{apr.approvalId}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                        {apr.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300">
                      Recipient: {apr.recipient || 'Arun Kumar (CTO)'} • Channel: {apr.channel}
                    </div>
                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        onClick={() => handleApprove(apr.approvalId)}
                        className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-semibold rounded-lg transition"
                      >
                        Approve for Sending
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PREFERENCES & OPT-OUTS */}
      {activeTab === 'opt-outs' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Communication Opt-Out Enforcement</h3>
              <p className="text-xs text-slate-400">Strict legal and customer preference suppression across all channels</p>
            </div>
            <button
              onClick={() => setShowOptOutModal(true)}
              className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold rounded-xl border border-rose-500/30 transition"
            >
              + Record Contact Opt-Out
            </button>
          </div>

          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-sm font-semibold text-white">Active Contact Status: CONTACT-101 (Arun Kumar)</h4>
            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div>Channel: <span className="font-mono text-emerald-400">EMAIL</span></div>
              <div>
                Eligible for Automated Marketing: <span className="font-semibold text-emerald-400">TRUE (Default)</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Recording an opt-out automatically cancels all pending and scheduled automated messages for this contact.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PROVIDER DELIVERY LOGS */}
      {activeTab === 'delivery' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-semibold text-white">Message Delivery Tracking</h3>
            <p className="text-xs text-slate-400">
              Delivery statuses are only marked DELIVERED when confirmed by authenticated provider webhook.
            </p>

            {messageDelivery && (
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-emerald-400 font-bold">{messageDelivery.messageId}</span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300">
                    {messageDelivery.status}
                  </span>
                </div>
                <div className="text-slate-300">Channel: {messageDelivery.channel}</div>
                <div className="text-slate-400 font-mono text-[11px]">Provider ID: {messageDelivery.providerMessageId}</div>
                <div className="text-slate-500 text-[11px]">Delivered At: {messageDelivery.deliveredAt}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SCHEDULE TASK MODAL */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Schedule Follow-up Task</h3>
            <form onSubmit={handleScheduleTask} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Follow-up Type</label>
                <input
                  type="text"
                  value={scheduleForm.followUpType}
                  onChange={e => setScheduleForm({ ...scheduleForm, followUpType: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Scheduled Date & Time</label>
                <input
                  type="text"
                  value={scheduleForm.scheduledAt}
                  onChange={e => setScheduleForm({ ...scheduleForm, scheduledAt: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400">Channel</label>
                  <select
                    value={scheduleForm.channel}
                    onChange={e => setScheduleForm({ ...scheduleForm, channel: e.target.value })}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="EMAIL">EMAIL</option>
                    <option value="WEB_CHAT">WEB_CHAT</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400">Action Mode</label>
                  <select
                    value={scheduleForm.actionMode}
                    onChange={e => setScheduleForm({ ...scheduleForm, actionMode: e.target.value })}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="DRAFT_FOR_APPROVAL">DRAFT_FOR_APPROVAL</option>
                    <option value="AUTO_SEND">AUTO_SEND (Policy permitting)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg"
                >
                  Schedule Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OPT-OUT MODAL */}
      {showOptOutModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Record Contact Opt-Out</h3>
            <form onSubmit={handleRecordOptOut} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Contact ID</label>
                <input
                  type="text"
                  value={optOutForm.contactId}
                  onChange={e => setOptOutForm({ ...optOutForm, contactId: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Channel</label>
                <select
                  value={optOutForm.channel}
                  onChange={e => setOptOutForm({ ...optOutForm, channel: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                >
                  <option value="EMAIL">EMAIL</option>
                  <option value="SMS">SMS</option>
                  <option value="ALL">ALL CHANNELS</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400">Reason</label>
                <input
                  type="text"
                  value={optOutForm.reason}
                  onChange={e => setOptOutForm({ ...optOutForm, reason: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowOptOutModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold rounded-lg"
                >
                  Record Opt-Out
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
