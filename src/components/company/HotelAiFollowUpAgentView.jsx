import React, { useState, useEffect } from 'react';
import {
  Clock, Send, RefreshCw, CheckCircle2, AlertTriangle, Play, Pause,
  Calendar, UserCheck, Mail, Shield, Filter, Plus, ChevronRight, X,
  ArrowRight, FileText, Bot, Sparkles, Layers, ListFilter, Activity, Check
} from 'lucide-react';
import { hotelService } from '../../services/hotelService';

export default function HotelAiFollowUpAgentView() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  // Dashboard Metrics
  const [dashboard, setDashboard] = useState({
    pendingTasks: 48,
    overdueTasks: 5,
    messagesQueued: 12,
    messagesDelivered: 84,
    messagesFailed: 2,
    quotesAwaitingFollowUp: 16,
    reservationsAttributed: 9,
    activeCampaigns: 3
  });

  // Campaigns State
  const [campaigns, setCampaigns] = useState([]);
  const [showCreateCampaignModal, setShowCreateCampaignModal] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: 'Unconverted Quote Follow-up',
    description: 'Follow up with eligible guests who received a quote but did not complete booking',
    campaignType: 'QUOTE_CONVERSION',
    channel: 'EMAIL',
    timezone: 'Asia/Kolkata',
    maxMessagesPerGuest: 2
  });

  // Sequences State
  const [sequences, setSequences] = useState([]);

  // Follow-up Tasks State
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigneeId, setAssigneeId] = useState('EMP-201');
  const [snoozeDate, setSnoozeDate] = useState('2026-10-30T10:00:00+05:30');

  // Message Drafts & Consent State
  const [messageDraft, setMessageDraft] = useState(null);
  const [guestConsent, setGuestConsent] = useState(null);
  const [guestConsentForm, setGuestConsentForm] = useState({
    emailMarketingConsent: false,
    whatsappMarketingConsent: false,
    preferredTransactionalChannel: 'EMAIL'
  });

  // Executions State
  const [executions, setExecutions] = useState([]);

  const showNotification = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [dashRes, campRes, seqRes, tasksRes, execRes, consentRes] = await Promise.allSettled([
        hotelService.aiFollowUpAgent.getDashboard(),
        hotelService.aiFollowUpAgent.getCampaigns(),
        hotelService.aiFollowUpAgent.getSequences(),
        hotelService.aiFollowUpAgent.getTasks(),
        hotelService.aiFollowUpAgent.getExecutions(),
        hotelService.aiFollowUpAgent.getGuestConsent('guest_1001')
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value) setDashboard(dashRes.value);
      if (campRes.status === 'fulfilled' && campRes.value) setCampaigns(campRes.value);
      if (seqRes.status === 'fulfilled' && seqRes.value) setSequences(seqRes.value);
      if (tasksRes.status === 'fulfilled' && tasksRes.value) {
        setTasks(tasksRes.value);
        if (tasksRes.value.length > 0) setSelectedTask(tasksRes.value[0]);
      }
      if (execRes.status === 'fulfilled' && execRes.value?.items) setExecutions(execRes.value.items);
      if (consentRes.status === 'fulfilled' && consentRes.value) {
        setGuestConsent(consentRes.value);
        setGuestConsentForm({
          emailMarketingConsent: consentRes.value.emailMarketingConsent || false,
          whatsappMarketingConsent: consentRes.value.whatsappMarketingConsent || false,
          preferredTransactionalChannel: 'EMAIL'
        });
      }
    } catch (err) {
      console.error('Error loading AI Follow-up Agent data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleCreateCampaign = async () => {
    if (!newCampaign.name.trim()) return;
    setLoading(true);
    try {
      const res = await hotelService.aiFollowUpAgent.createCampaign({
        name: newCampaign.name,
        description: newCampaign.description,
        campaignType: newCampaign.campaignType,
        channel: newCampaign.channel,
        audience: {
          quoteStatus: ['ACTIVE'],
          reservationStatus: ['NONE'],
          marketingConsentRequired: false
        },
        schedule: {
          timezone: newCampaign.timezone,
          maxMessagesPerGuest: newCampaign.maxMessagesPerGuest,
          minimumHoursBetweenMessages: 24
        },
        approvalMode: 'REVIEW_BEFORE_ACTIVATION'
      });
      setCampaigns(prev => [res, ...prev]);
      setShowCreateCampaignModal(false);
      showNotification(`Campaign #${res.campaignId} created in DRAFT state`);
    } catch (err) {
      showNotification(err.message || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleActivateCampaign = async (cid) => {
    setLoading(true);
    try {
      const res = await hotelService.aiFollowUpAgent.activateCampaign(cid);
      setCampaigns(prev => prev.map(c => c.campaignId === cid ? { ...c, status: 'ACTIVE', eligibleAudienceCount: res.eligibleAudienceCount || 25 } : c));
      showNotification(`Campaign #${cid} ACTIVATED for 25 eligible quotes`);
    } catch (err) {
      showNotification(err.message || 'Activation failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePauseCampaign = async (cid) => {
    setLoading(true);
    try {
      await hotelService.aiFollowUpAgent.pauseCampaign(cid);
      setCampaigns(prev => prev.map(c => c.campaignId === cid ? { ...c, status: 'PAUSED' } : c));
      showNotification(`Campaign #${cid} paused`);
    } catch (err) {
      showNotification(err.message || 'Failed to pause');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMessageDraft = async () => {
    setLoading(true);
    try {
      const draft = await hotelService.aiFollowUpAgent.generateMessageDraft({
        guestId: selectedTask?.guestId || 'GUEST-1002',
        relatedEntityType: 'RESERVATION_QUOTE',
        relatedEntityId: selectedTask?.relatedEntityId || 'QUOTE-1001',
        purpose: 'TRANSACTIONAL_QUOTE_FOLLOW_UP',
        channel: 'EMAIL',
        tone: 'FRIENDLY'
      });
      setMessageDraft(draft);
      showNotification('Follow-up draft generated with real quote context');
    } catch (err) {
      showNotification(err.message || 'Draft generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveDraft = async () => {
    if (!messageDraft?.draftId) return;
    setLoading(true);
    try {
      await hotelService.aiFollowUpAgent.approveMessageDraft(messageDraft.draftId, {
        reviewComment: 'Reviewed for accuracy and approved by reservation executive'
      });
      setMessageDraft({ ...messageDraft, status: 'APPROVED' });
      showNotification('Draft approved for dispatch');
    } catch (err) {
      showNotification(err.message || 'Approval failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessageDraft = async () => {
    if (!messageDraft?.draftId) return;
    setLoading(true);
    const idempotencyKey = 'followup-msg-' + Date.now();
    try {
      const res = await hotelService.aiFollowUpAgent.sendMessageDraft(
        messageDraft.draftId,
        { channel: 'EMAIL' },
        idempotencyKey
      );
      setMessageDraft({ ...messageDraft, status: 'QUEUED', deliveryStatus: 'QUEUED', messageId: res.messageId });
      showNotification('Message submitted to dispatch provider (QUEUED)');
    } catch (err) {
      showNotification(err.message || 'Failed to dispatch message');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTask = async () => {
    if (!selectedTask) return;
    setLoading(true);
    try {
      await hotelService.aiFollowUpAgent.assignTask(selectedTask.taskId, {
        employeeId: assigneeId,
        reason: 'Guest requested negotiated rates'
      });
      setTasks(prev => prev.map(t => t.taskId === selectedTask.taskId ? { ...t, status: 'ASSIGNED', assignedEmployeeId: assigneeId } : t));
      setShowAssignModal(false);
      showNotification(`Task assigned to ${assigneeId}`);
    } catch (err) {
      showNotification(err.message || 'Assignment failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (tid) => {
    setLoading(true);
    try {
      await hotelService.aiFollowUpAgent.completeTask(tid, {
        outcome: 'GUEST_CONTACTED',
        notes: 'Guest contacted; requested quote breakdown'
      });
      setTasks(prev => prev.map(t => t.taskId === tid ? { ...t, status: 'COMPLETED', outcome: 'GUEST_CONTACTED' } : t));
      showNotification(`Task #${tid} completed with GUEST_CONTACTED outcome`);
    } catch (err) {
      showNotification(err.message || 'Completion failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSnoozeTask = async (tid) => {
    setLoading(true);
    try {
      await hotelService.aiFollowUpAgent.snoozeTask(tid, {
        newScheduledAt: snoozeDate,
        reason: 'Guest requested contact tomorrow morning'
      });
      setTasks(prev => prev.map(t => t.taskId === tid ? { ...t, status: 'PENDING', scheduledAt: snoozeDate } : t));
      showNotification(`Task #${tid} snoozed to ${snoozeDate}`);
    } catch (err) {
      showNotification(err.message || 'Snooze failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setLoading(true);
    try {
      await hotelService.aiFollowUpAgent.updateGuestPreferences('guest_1001', guestConsentForm);
      showNotification('Guest communication preferences updated and audited');
    } catch (err) {
      showNotification(err.message || 'Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleRetryExecution = async (execId) => {
    setLoading(true);
    try {
      await hotelService.aiFollowUpAgent.retryExecution(execId);
      setExecutions(prev => prev.map(e => e.executionId === execId ? { ...e, status: 'RETRYING', attemptCount: 2 } : e));
      showNotification(`Execution #${execId} queued for retry`);
    } catch (err) {
      showNotification(err.message || 'Retry failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-gradient-to-r from-purple-900 to-indigo-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-purple-500/40 text-sm backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-purple-500/30 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 shadow-inner">
              <Clock className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">AI Follow-up Agent</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                  ONLINE • AUTOMATION ENGINE
                </span>
              </div>
              <p className="text-slate-300 text-sm mt-1">
                Recovers unconverted room quotes, schedules pre-arrival reminders, monitors unresolved service tasks, and honors guest communication consent.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadInitialData}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 rounded-xl text-sm border border-slate-700 transition-all shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Sync Engine
            </button>
            <div className="bg-purple-900/40 border border-purple-500/40 px-3 py-1.5 rounded-xl text-right">
              <span className="text-[10px] text-purple-300 block uppercase font-medium">Attributed Bookings</span>
              <span className="text-base font-bold text-purple-200">{dashboard.reservationsAttributed || 9} Bookings</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-slate-800/80">
          {[
            { id: 'dashboard', label: 'Follow-up Dashboard', icon: Activity },
            { id: 'campaigns', label: 'Campaign Manager', icon: Layers },
            { id: 'sequences', label: 'Sequence Builder', icon: Clock },
            { id: 'tasks', label: 'Task Inbox', icon: ListFilter },
            { id: 'drafts', label: 'Drafts & Consent', icon: Mail },
            { id: 'monitor', label: 'Execution Monitor', icon: Shield }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-purple-500 text-slate-950 font-semibold shadow-md shadow-purple-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 backdrop-blur-md">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Pending Follow-up Tasks</span>
                <Clock className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-white">{dashboard.pendingTasks || 48}</div>
              <div className="text-xs text-purple-400 mt-2">5 overdue • Assigned to staff</div>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 backdrop-blur-md">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Unconverted Quotes</span>
                <FileText className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-white">{dashboard.quotesAwaitingFollowUp || 16}</div>
              <div className="text-xs text-amber-400 mt-2">Quotes in active window awaiting follow-up</div>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 backdrop-blur-md">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Delivered Messages</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-white">{dashboard.messagesDelivered || 84}</div>
              <div className="text-xs text-emerald-400 mt-2">12 queued • 2 failed (retryable)</div>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 backdrop-blur-md">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Active Campaigns</span>
                <Layers className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-bold text-white">{dashboard.activeCampaigns || 3}</div>
              <div className="text-xs text-indigo-400 mt-2">Timezone: Asia/Kolkata</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Communication Type Rules */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-400" />
                Transactional vs Marketing Message Separation
              </h3>
              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <div className="flex items-center justify-between mb-1">
                    <strong className="text-white">Transactional Reminders</strong>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">BOOKING PURPOSE</span>
                  </div>
                  <p className="text-slate-400">
                    Quote follow-ups, pre-arrival confirmations, and feedback requests. Requires basic booking consent; exempt from marketing suppression.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <div className="flex items-center justify-between mb-1">
                    <strong className="text-white">Marketing & Promotional Campaigns</strong>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">OPT-IN MANDATORY</span>
                  </div>
                  <p className="text-slate-400">
                    Repeat stay discounts and seasonal offers. Explicit guest opt-in required; strictly halted if guest withdraws marketing consent.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Automated Sequences & Triggers
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Triggers fire 24h after an enquiry or quote. All pending actions are immediately cancelled if the reservation is confirmed.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setActiveTab('campaigns')}
                    className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-left border border-slate-700 transition-all"
                  >
                    <Layers className="w-4 h-4 text-purple-400 mb-1" />
                    <span className="text-xs font-bold text-white block">Quote Campaigns</span>
                    <span className="text-[10px] text-slate-400">Manage conversion audiences</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('tasks')}
                    className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-left border border-slate-700 transition-all"
                  >
                    <Clock className="w-4 h-4 text-teal-400 mb-1" />
                    <span className="text-xs font-bold text-white block">Task Inbox</span>
                    <span className="text-[10px] text-slate-400">Assign & snooze tasks</span>
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Active Triggers: ENQUIRY_CREATED</span>
                <span className="text-purple-300">Stop Event: RESERVATION_CONFIRMED</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CAMPAIGN MANAGER */}
      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              Follow-Up Campaigns ({campaigns.length})
            </h3>
            <button
              onClick={() => setShowCreateCampaignModal(true)}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Campaign
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaigns.map(c => (
              <div
                key={c.campaignId}
                className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-purple-300">{c.campaignId}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                      c.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {c.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm mt-2">{c.name}</h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{c.description}</p>

                  <div className="mt-3 p-2.5 rounded-lg bg-slate-800/60 text-[11px] space-y-1 text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Channel:</span>
                      <span className="font-medium text-white">{c.channel || 'EMAIL'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Audience:</span>
                      <span className="font-medium text-teal-300">{c.eligibleAudienceCount ? `${c.eligibleAudienceCount} Guests` : 'Evaluating'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                  {c.status !== 'ACTIVE' ? (
                    <button
                      onClick={() => handleActivateCampaign(c.campaignId)}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition-all flex items-center gap-1"
                    >
                      <Play className="w-3 h-3" /> Activate
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePauseCampaign(c.campaignId)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg text-xs transition-all flex items-center gap-1"
                    >
                      <Pause className="w-3 h-3" /> Pause
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SEQUENCE BUILDER */}
      {activeTab === 'sequences' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                Automated Follow-up Sequence Pipeline
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Visual timeline showing scheduled delay intervals and server-side stop condition hooks.
              </p>
            </div>
            <span className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/40 px-3 py-1 rounded-full">
              Trigger: ENQUIRY_CREATED
            </span>
          </div>

          <div className="space-y-4 max-w-2xl">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-purple-500 text-slate-950 font-bold flex items-center justify-center text-xs shrink-0">
                1
              </div>
              <div className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">Step 1 — Initial Quote Follow-up</h4>
                  <span className="text-[11px] text-purple-300 font-mono">Delay: 1,440 mins (24h)</span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Sends friendly transactional reminder to guest with active quote breakdown and questions check.
                </p>
              </div>
            </div>

            <div className="w-0.5 h-6 bg-slate-700 ml-4" />

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-500 text-slate-950 font-bold flex items-center justify-center text-xs shrink-0">
                2
              </div>
              <div className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">Step 2 — Final Enquiry Follow-up</h4>
                  <span className="text-[11px] text-indigo-300 font-mono">Delay: 2,880 mins (48h)</span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Alerts guest about impending quote expiry; suggests transferring to reservation executive if questions remain.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs space-y-2">
            <span className="font-bold text-purple-300 uppercase tracking-wider block">Automatic Stop Conditions</span>
            <div className="flex flex-wrap gap-2 text-slate-300">
              <span className="bg-slate-900 px-2.5 py-1 rounded border border-slate-800">• RESERVATION_CONFIRMED</span>
              <span className="bg-slate-900 px-2.5 py-1 rounded border border-slate-800">• GUEST_REPLIED</span>
              <span className="bg-slate-900 px-2.5 py-1 rounded border border-slate-800">• ENQUIRY_CLOSED</span>
              <span className="bg-slate-900 px-2.5 py-1 rounded border border-slate-800">• CONSENT_WITHDRAWN</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TASK INBOX */}
      {activeTab === 'tasks' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex flex-col space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-semibold text-white text-sm">Follow-up Tasks</h3>
              <span className="text-xs text-slate-400">{tasks.length} Total</span>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-[600px]">
              {tasks.map(t => {
                const isSelected = selectedTask?.taskId === t.taskId;
                return (
                  <div
                    key={t.taskId}
                    onClick={() => setSelectedTask(t)}
                    className={`p-3 rounded-xl cursor-pointer border transition-all text-xs ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-500/60 shadow'
                        : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-purple-300 font-semibold">{t.taskId}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        t.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                    <div className="font-medium text-white mt-1.5">{t.taskType || 'QUOTE_FOLLOW_UP'}</div>
                    <div className="text-slate-400 mt-1 line-clamp-1">{t.reason || 'Guest requested quote'}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 lg:col-span-2 space-y-6">
            {selectedTask ? (
              <>
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      {selectedTask.taskType}
                      <span className="text-xs font-mono bg-slate-800 text-purple-300 px-2 py-0.5 rounded">
                        {selectedTask.taskId}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">{selectedTask.reason}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowAssignModal(true)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs transition-all"
                    >
                      Assign Staff
                    </button>
                    <button
                      onClick={() => handleCompleteTask(selectedTask.taskId)}
                      disabled={selectedTask.status === 'COMPLETED'}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all disabled:opacity-50"
                    >
                      Mark Completed
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs bg-slate-800/40 p-4 rounded-xl border border-slate-700">
                  <div>
                    <span className="text-slate-400 block">Guest ID:</span>
                    <span className="font-semibold text-white">{selectedTask.guestId || 'GUEST-1002'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Related Entity:</span>
                    <span className="font-semibold text-teal-300">{selectedTask.relatedEntityId || 'QUOTE-1001'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Scheduled Time:</span>
                    <span className="font-semibold text-white">{selectedTask.scheduledAt ? new Date(selectedTask.scheduledAt).toLocaleString() : 'Pending'}</span>
                  </div>
                </div>

                {/* Snooze Workspace */}
                <div className="pt-4 border-t border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Snooze Follow-up</h4>
                  <div className="flex gap-2">
                    <input
                      type="datetime-local"
                      value={snoozeDate}
                      onChange={(e) => setSnoozeDate(e.target.value)}
                      className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                    <button
                      onClick={() => handleSnoozeTask(selectedTask.taskId)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-purple-300 font-bold rounded-xl text-xs border border-purple-500/40"
                    >
                      Snooze Task
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-slate-500 text-sm">Select a task to view execution details</div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: DRAFTS & CONSENT */}
      {activeTab === 'drafts' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Message Draft Generator & Gating */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-purple-400" />
              Follow-up Message Draft Workspace
            </h3>

            <button
              onClick={handleGenerateMessageDraft}
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-md shadow-purple-500/20 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Generate Grounded Follow-up Draft
            </button>

            {messageDraft && (
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/40 space-y-3 animate-fade-in text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-300">Draft #{messageDraft.draftId}</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-semibold">
                    {messageDraft.status}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Subject:</span>
                  <div className="font-semibold text-white">{messageDraft.subject}</div>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-slate-200 leading-relaxed">
                  {messageDraft.body}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-purple-500/20">
                  {messageDraft.status !== 'APPROVED' && messageDraft.status !== 'QUEUED' && (
                    <button
                      onClick={handleApproveDraft}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs"
                    >
                      Approve Draft
                    </button>
                  )}
                  {messageDraft.status === 'APPROVED' && (
                    <button
                      onClick={handleSendMessageDraft}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Send to Provider (QUEUED)
                    </button>
                  )}
                  {messageDraft.status === 'QUEUED' && (
                    <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                      <Check className="w-3.5 h-3.5" /> Dispatched (Id: {messageDraft.messageId || 'FUP-MSG-1001'})
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Guest Communication Consent & Opt-Outs */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              Guest Consent & Opt-Out Registry
            </h3>

            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 text-xs space-y-3">
              <div className="flex items-center justify-between font-bold text-white">
                <span>Guest: Arun Kumar (guest_1001)</span>
                <span className="text-teal-300 text-[10px] font-mono">AUDITED RECORD</span>
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={guestConsentForm.emailMarketingConsent}
                    onChange={(e) => setGuestConsentForm({ ...guestConsentForm, emailMarketingConsent: e.target.checked })}
                    className="rounded border-slate-700 text-purple-500 focus:ring-purple-500"
                  />
                  Opt-In to Email Marketing & Promotional Stays
                </label>

                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={guestConsentForm.whatsappMarketingConsent}
                    onChange={(e) => setGuestConsentForm({ ...guestConsentForm, whatsappMarketingConsent: e.target.checked })}
                    className="rounded border-slate-700 text-purple-500 focus:ring-purple-500"
                  />
                  Opt-In to WhatsApp Promotional Notifications
                </label>
              </div>

              <div className="pt-3 border-t border-slate-700 flex justify-end">
                <button
                  onClick={handleSavePreferences}
                  disabled={loading}
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow"
                >
                  Save Consent Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: EXECUTION MONITOR */}
      {activeTab === 'monitor' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              Automation Execution History & Retry Monitor
            </h3>
            <span className="text-xs text-slate-400">{executions.length} Recorded Runs</span>
          </div>

          <div className="space-y-3">
            {executions.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">No automation runs recorded</div>
            ) : (
              executions.map(ex => (
                <div
                  key={ex.executionId}
                  className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white">{ex.executionId}</span>
                      <span className="text-purple-300">Seq: {ex.sequenceId}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        ex.status === 'FAILED' ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {ex.status}
                      </span>
                    </div>
                    <div className="text-slate-400">
                      Failure Code: <span className="text-rose-400 font-mono">{ex.failureCode || 'NONE'}</span> • Attempts: {ex.attemptCount}
                    </div>
                  </div>

                  {ex.retryable && ex.status === 'FAILED' && (
                    <button
                      onClick={() => handleRetryExecution(ex.executionId)}
                      className="px-3 py-1.5 bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold rounded-lg text-xs transition-all flex items-center gap-1 shadow"
                    >
                      <RefreshCw className="w-3 h-3" /> Retry Run
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Assign Task Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-purple-400" />
                Assign Follow-up Task
              </h3>
              <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Employee ID</label>
              <input
                type="text"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignTask}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold rounded-xl text-xs"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Campaign Modal */}
      {showCreateCampaignModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-400" />
                Create New Follow-up Campaign
              </h3>
              <button onClick={() => setShowCreateCampaignModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Campaign Name</label>
              <input
                type="text"
                value={newCampaign.name}
                onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Description</label>
              <textarea
                value={newCampaign.description}
                onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                rows="2"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Channel</label>
                <select
                  value={newCampaign.channel}
                  onChange={(e) => setNewCampaign({ ...newCampaign, channel: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                >
                  <option value="EMAIL">Email</option>
                  <option value="WHATSAPP">WhatsApp</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Max Messages/Guest</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={newCampaign.maxMessagesPerGuest}
                  onChange={(e) => setNewCampaign({ ...newCampaign, maxMessagesPerGuest: parseInt(e.target.value) || 2 })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCreateCampaignModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCampaign}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold rounded-xl text-xs"
              >
                Save Draft Campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
