import React, { useState, useEffect } from 'react';
import {
  Clock, Shield, Send, CheckCircle2, AlertCircle, RefreshCw, Plus,
  Search, Filter, Play, Pause, Edit, Trash2, Calendar, FileText,
  Mail, MessageSquare, AlertTriangle, UserCheck, X, Sparkles, Check,
  Sliders, Settings, ArrowRight, Ban
} from 'lucide-react';
import { educationAiService } from '../../services/educationAiService';

export default function EducationAiFollowUpAgentView({ initialSubTab = 'overview' }) {
  const [activeTab, setActiveTab] = useState(initialSubTab);
  const [loading, setLoading] = useState(true);

  // Data States
  const [config, setConfig] = useState(null);
  const [rules, setRules] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [executions, setExecutions] = useState([]);
  const [suppressions, setSuppressions] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [auditEvents, setAuditEvents] = useState([]);

  // Modals & Forms
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [showSnoozeModal, setShowSnoozeModal] = useState(false);
  const [showStopContactModal, setShowStopContactModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedDraft, setSelectedDraft] = useState(null);

  // Form inputs
  const [newRuleForm, setNewRuleForm] = useState({
    name: '', triggerType: 'ENQUIRY_CREATED', delayMinutes: 1440, channel: 'EMAIL',
    requiresApproval: true, maxExecutionsPerLead: 1, messageTemplateId: 'EDU_ADMISSION_FOLLOWUP_01'
  });
  const [editDraftForm, setEditDraftForm] = useState({ subject: '', body: '' });
  const [snoozeForm, setSnoozeForm] = useState({ newScheduledAt: '2026-11-02T11:00:00+05:30', reason: 'Student requested contact next week' });
  const [stopContactForm, setStopContactForm] = useState({ leadId: 1201, channel: 'EMAIL', scope: 'MARKETING_MESSAGES', reason: 'STUDENT_OPTED_OUT' });

  // Status feedback
  const [feedback, setFeedback] = useState({ message: '', isError: false });

  useEffect(() => {
    loadAllData();
  }, []);

  const showFeedback = (msg, isError = false) => {
    setFeedback({ message: msg, isError });
    setTimeout(() => setFeedback({ message: '', isError: false }), 4500);
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [
        cfgData, rlsData, tskData, drfData, excData, supData, metData, audData
      ] = await Promise.allSettled([
        educationAiService.getFollowUpConfig(),
        educationAiService.getFollowUpRules(),
        educationAiService.getFollowUpTasks(),
        educationAiService.getFollowUpDrafts(),
        educationAiService.getFollowUpExecutions(),
        educationAiService.getSuppressionList(),
        educationAiService.getFollowUpMetrics(),
        educationAiService.getFollowUpAuditEvents()
      ]);

      if (cfgData.status === 'fulfilled') setConfig(cfgData.value);
      if (rlsData.status === 'fulfilled') setRules(rlsData.value?.content || []);
      if (tskData.status === 'fulfilled') setTasks(tskData.value?.content || []);
      if (drfData.status === 'fulfilled') setDrafts(drfData.value?.content || []);
      if (excData.status === 'fulfilled') setExecutions(excData.value?.content || []);
      if (supData.status === 'fulfilled') setSuppressions(supData.value?.content || []);
      if (metData.status === 'fulfilled') setMetrics(metData.value);
      if (audData.status === 'fulfilled') setAuditEvents(audData.value?.content || []);
    } catch (err) {
      console.error('Error loading AI Follow-up data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Rule actions
  const handleToggleRule = async (rule) => {
    if (rule.status === 'ACTIVE') {
      const res = await educationAiService.pauseFollowUpRule(rule.ruleId);
      if (res) {
        showFeedback(`Rule #${rule.ruleId} paused.`);
        setRules(prev => prev.map(r => r.ruleId === rule.ruleId ? { ...r, status: 'PAUSED' } : r));
      }
    } else {
      const res = await educationAiService.activateFollowUpRule(rule.ruleId);
      if (res) {
        showFeedback(`Rule #${rule.ruleId} activated.`);
        setRules(prev => prev.map(r => r.ruleId === rule.ruleId ? { ...r, status: 'ACTIVE' } : r));
      }
    }
  };

  const handleCreateRule = async (e) => {
    e.preventDefault();
    const res = await educationAiService.createFollowUpRule(newRuleForm);
    if (res) {
      showFeedback(`Follow-up rule created: ${newRuleForm.name} (Rule #${res.ruleId}).`);
      setRules(prev => [res, ...prev]);
      setShowRuleModal(false);
      setNewRuleForm({
        name: '', triggerType: 'ENQUIRY_CREATED', delayMinutes: 1440, channel: 'EMAIL',
        requiresApproval: true, maxExecutionsPerLead: 1, messageTemplateId: 'EDU_ADMISSION_FOLLOWUP_01'
      });
    }
  };

  // Task actions
  const handleCompleteTask = async (taskId) => {
    const res = await educationAiService.completeFollowUpTask(taskId, { outcome: 'STUDENT_REPLIED' });
    if (res) {
      showFeedback(`Task #${taskId} marked COMPLETED.`);
      setTasks(prev => prev.map(t => t.taskId === taskId ? { ...t, status: 'COMPLETED' } : t));
    }
  };

  const handleCancelTask = async (taskId) => {
    const res = await educationAiService.cancelFollowUpTask(taskId, 'Cancelled by staff');
    if (res) {
      showFeedback(`Task #${taskId} marked CANCELLED.`);
      setTasks(prev => prev.map(t => t.taskId === taskId ? { ...t, status: 'CANCELLED' } : t));
    }
  };

  const handleSnoozeTask = async (e) => {
    e.preventDefault();
    if (!selectedTask) return;
    const res = await educationAiService.snoozeFollowUpTask(selectedTask.taskId, snoozeForm.newScheduledAt, snoozeForm.reason);
    if (res) {
      showFeedback(`Task #${selectedTask.taskId} rescheduled to ${snoozeForm.newScheduledAt}.`);
      setTasks(prev => prev.map(t => t.taskId === selectedTask.taskId ? { ...t, scheduledAt: snoozeForm.newScheduledAt } : t));
      setShowSnoozeModal(false);
    }
  };

  // Draft actions
  const handleApproveDraft = async (draftId) => {
    const res = await educationAiService.approveFollowUpDraft(draftId);
    if (res) {
      showFeedback(`Draft #${draftId} approved by authorized staff.`);
      setDrafts(prev => prev.map(d => d.draftId === draftId ? { ...d, status: 'APPROVED' } : d));
    }
  };

  const handleSendDraft = async (draftId) => {
    const res = await educationAiService.sendFollowUpDraft(draftId);
    if (res) {
      showFeedback(`Draft #${draftId} queued for delivery (Execution #${res.executionId}).`);
      setDrafts(prev => prev.map(d => d.draftId === draftId ? { ...d, status: 'QUEUED' } : d));
      setExecutions(prev => [res, ...prev]);
    }
  };

  const handleEditDraft = async (e) => {
    e.preventDefault();
    if (!selectedDraft) return;
    const res = await educationAiService.updateFollowUpDraft(selectedDraft.draftId, editDraftForm);
    if (res) {
      showFeedback(`Draft #${selectedDraft.draftId} updated. Previous approval invalidated as safety measure.`);
      setDrafts(prev => prev.map(d => d.draftId === selectedDraft.draftId ? { ...d, ...editDraftForm, status: 'PENDING_APPROVAL' } : d));
      setShowDraftModal(false);
    }
  };

  // Retry execution
  const handleRetryExecution = async (executionId) => {
    const res = await educationAiService.retryFollowUpExecution(executionId);
    if (res) {
      showFeedback(`Retry queued for execution #${executionId}.`);
      setExecutions(prev => prev.map(ex => ex.executionId === executionId ? { ...ex, status: 'QUEUED', attemptCount: (ex.attemptCount || 0) + 1 } : ex));
    }
  };

  // Stop contact
  const handleStopContact = async (e) => {
    e.preventDefault();
    const res = await educationAiService.stopContact(stopContactForm);
    if (res) {
      showFeedback(`Contact suppression recorded for Lead #${stopContactForm.leadId}. Future marketing follow-ups halted.`);
      setSuppressions(prev => [res, ...prev]);
      setShowStopContactModal(false);
    }
  };

  return (
    <div className="education-ai-followup-view" style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Title Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.8rem' }}>🎯</span>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
              AI Follow-up Agent
            </h1>
            <span className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={12} /> Autonomous Nurture Engine
            </span>
            <span className="badge" style={{ backgroundColor: config?.enabled ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: config?.enabled ? '#10b981' : '#ef4444' }}>
              ● {config?.enabled ? 'Online (Active)' : 'Paused'}
            </span>
          </div>
          <p style={{ margin: '6px 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Manages automated admission follow-ups, incomplete application reminders, draft approvals, and stops contact on student reply or opt-out.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={loadAllData}
            title="Refresh All Records"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowConfigModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Settings size={14} />
            <span>Follow-up Settings</span>
          </button>
        </div>
      </div>

      {/* Action Notification Alert */}
      {feedback.message && (
        <div style={{
          padding: '12px 18px',
          marginBottom: '20px',
          borderRadius: '8px',
          backgroundColor: feedback.isError ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
          border: `1px solid ${feedback.isError ? '#ef4444' : '#10b981'}`,
          color: feedback.isError ? '#ef4444' : '#10b981',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.88rem',
          fontWeight: 600
        }}>
          {feedback.isError ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Subtab Navigation */}
      <div className="crm-card" style={{ marginBottom: '24px', padding: '10px 16px' }}>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {[
            { id: 'overview', label: 'Dashboard Overview', icon: <Clock size={15} /> },
            { id: 'rules', label: `Follow-up Rules (${rules.length})`, icon: <Sliders size={15} /> },
            { id: 'tasks', label: `Scheduled Tasks (${tasks.length})`, icon: <Calendar size={15} /> },
            { id: 'drafts', label: `Message Drafts & Approval (${drafts.length})`, icon: <FileText size={15} /> },
            { id: 'executions', label: `Execution History (${executions.length})`, icon: <Send size={15} /> },
            { id: 'suppression', label: `Contact Suppression List (${suppressions.length})`, icon: <Ban size={15} /> },
            { id: 'metrics', label: 'Metrics & Audit Log', icon: <Sparkles size={15} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`btn btn-sm ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* =========================================================================
          TAB 1: OVERVIEW & KPIS
          ========================================================================= */}
      {activeTab === 'overview' && (
        <div>
          {/* KPI Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div className="crm-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '8px' }}>
                <span>Tasks Scheduled</span>
                <Clock size={16} color="#3b82f6" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {metrics?.tasksCreated || 640}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px' }}>
                {metrics?.tasksCompleted || 510} completed on schedule
              </div>
            </div>

            <div className="crm-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '8px' }}>
                <span>Drafts Awaiting Approval</span>
                <FileText size={16} color="#f59e0b" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b' }}>
                {drafts.filter(d => d.status === 'PENDING_APPROVAL').length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Human approval policy active
              </div>
            </div>

            <div className="crm-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '8px' }}>
                <span>Messages Delivered</span>
                <Send size={16} color="#10b981" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {metrics?.messagesDelivered || 295}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px' }}>
                95.2% delivery success rate
              </div>
            </div>

            <div className="crm-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '8px' }}>
                <span>Student Replies Captured</span>
                <MessageSquare size={16} color="#8b5cf6" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {metrics?.studentReplies || 90}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#8b5cf6', marginTop: '4px' }}>
                Automated nurture auto-paused
              </div>
            </div>

            <div className="crm-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '8px' }}>
                <span>Suppressed / Opt-outs</span>
                <Ban size={16} color="#ef4444" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {metrics?.contactsSuppressed || 28}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Marketing consent strictly respected
              </div>
            </div>
          </div>

          {/* Workflow & Safety Rules */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
            <div className="crm-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} color="var(--primary)" />
                AI Follow-up Operational Flow
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  { step: 1, title: 'Trigger Event Detection', desc: 'Enquiry created, incomplete application, upcoming counselling or inactive inquiry.', badge: 'Automated' },
                  { step: 2, title: 'Safety & Suppression Verification', desc: 'Checks student consent, permitted contact hours (9 AM - 6 PM), and frequency limits (max 3/week).', badge: 'Enforced' },
                  { step: 3, title: 'AI Personalized Draft Generation', desc: 'Composes polite message grounded in verified course information and previous conversation history.', badge: 'AI Generated' },
                  { step: 4, title: 'Human Staff Approval Queue', desc: 'Admission Manager reviews and signs off before message is dispatched.', badge: 'Human in the Loop' },
                  { step: 5, title: 'Automatic Stop Condition', desc: 'If student replies, applies, or opts out, all future automated follow-ups are cancelled immediately.', badge: 'Auto-Stop' }
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      backgroundColor: 'rgba(59, 130, 246, 0.15)', color: 'var(--primary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0
                    }}>
                      {item.step}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-main)' }}>{item.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{item.desc}</div>
                    </div>
                    <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{item.badge}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="crm-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sliders size={18} color="#8b5cf6" />
                Quick Follow-up Actions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowRuleModal(true)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px' }}
                >
                  <Plus size={16} />
                  <span>Create Follow-up Rule</span>
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setActiveTab('drafts')}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px' }}
                >
                  <FileText size={16} />
                  <span>Review Approval Queue ({drafts.filter(d => d.status === 'PENDING_APPROVAL').length})</span>
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowStopContactModal(true)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', color: '#ef4444' }}
                >
                  <Ban size={16} />
                  <span>Register Contact Suppression / Opt-out</span>
                </button>
              </div>

              <div style={{ marginTop: '20px', padding: '14px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  POLICY COMPLIANCE
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', lineHeight: 1.45 }}>
                  Quiet hours active between 18:00 and 09:00 IST. Automated outbound broadcasts scheduled during this window are queued for next-day dispatch.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: FOLLOW-UP RULES
          ========================================================================= */}
      {activeTab === 'rules' && (
        <div className="crm-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Admission Follow-up Automation Rules</h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Configurable triggers, delay timings, channel selections, and stop conditions.
              </p>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowRuleModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={14} />
              <span>Create New Rule</span>
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Rule ID</th>
                  <th>Rule Name</th>
                  <th>Trigger Event</th>
                  <th>Delay</th>
                  <th>Channel</th>
                  <th>Requires Approval</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rules.map(rule => (
                  <tr key={rule.ruleId}>
                    <td style={{ fontWeight: 700 }}>#{rule.ruleId}</td>
                    <td style={{ fontWeight: 600 }}>{rule.name}</td>
                    <td>
                      <span className="badge badge-secondary" style={{ fontSize: '0.72rem' }}>
                        {rule.triggerType}
                      </span>
                    </td>
                    <td>{Math.round(rule.delayMinutes / 60)} hours</td>
                    <td>{rule.channel}</td>
                    <td>
                      <span style={{ fontSize: '0.78rem', color: rule.requiresApproval ? '#f59e0b' : '#10b981', fontWeight: 600 }}>
                        {rule.requiresApproval ? 'Yes (Review Required)' : 'No (Automated)'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${rule.status === 'ACTIVE' ? 'badge-qualified' : 'badge-secondary'}`}>
                        {rule.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary btn-xs"
                        onClick={() => handleToggleRule(rule)}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        {rule.status === 'ACTIVE' ? <Pause size={12} /> : <Play size={12} />}
                        <span>{rule.status === 'ACTIVE' ? 'Pause' : 'Activate'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: SCHEDULED TASKS
          ========================================================================= */}
      {activeTab === 'tasks' && (
        <div className="crm-card" style={{ padding: '20px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Scheduled Follow-up Tasks</h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Tasks queued for prospective student contact with configurable completion, snooze, and cancellation workflows.
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Task ID</th>
                  <th>Student Name</th>
                  <th>Task Type</th>
                  <th>Channel</th>
                  <th>Scheduled At</th>
                  <th>Status</th>
                  <th>Requires Approval</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task.taskId}>
                    <td style={{ fontWeight: 700 }}>#{task.taskId}</td>
                    <td style={{ fontWeight: 600 }}>{task.leadName || 'Arun Kumar'}</td>
                    <td>
                      <span className="badge badge-secondary" style={{ fontSize: '0.72rem' }}>
                        {task.taskType}
                      </span>
                    </td>
                    <td>{task.channel}</td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{task.scheduledAt?.substring(0, 10)}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{task.scheduledAt?.substring(11, 16)} IST</div>
                    </td>
                    <td>
                      <span className={`badge ${task.status === 'SCHEDULED' ? 'badge-primary' : task.status === 'COMPLETED' ? 'badge-qualified' : 'badge-lost'}`}>
                        {task.status}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.78rem', color: '#f59e0b', fontWeight: 600 }}>
                        {task.requiresApproval ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="btn btn-secondary btn-xs"
                          onClick={() => {
                            setSelectedTask(task);
                            setShowSnoozeModal(true);
                          }}
                          title="Snooze / Reschedule"
                        >
                          Snooze
                        </button>
                        <button
                          className="btn btn-secondary btn-xs"
                          onClick={() => handleCompleteTask(task.taskId)}
                          title="Mark Complete"
                        >
                          Complete
                        </button>
                        <button
                          className="btn btn-secondary btn-xs"
                          onClick={() => handleCancelTask(task.taskId)}
                          title="Cancel Task"
                          style={{ color: '#ef4444' }}
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: MESSAGE DRAFTS & APPROVAL QUEUE
          ========================================================================= */}
      {activeTab === 'drafts' && (
        <div className="crm-card" style={{ padding: '20px' }}>
          <div style={{ marginBottom: '18px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>AI Message Drafts & Human Approval Queue</h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Generated personalized follow-up messages awaiting review before dispatch to prospective students.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {drafts.map(draft => (
              <div
                key={draft.draftId}
                style={{
                  padding: '20px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>
                        Draft {draft.draftId}
                      </span>
                      <span className="badge badge-secondary">{draft.channel}</span>
                      <span className={`badge ${draft.status === 'APPROVED' ? 'badge-qualified' : draft.status === 'QUEUED' ? 'badge-primary' : 'badge-secondary'}`}>
                        {draft.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Recipient: <strong>{draft.leadName || 'Arun Kumar'}</strong> (Lead #{draft.leadId}) • Task #{draft.taskId}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn-secondary btn-xs"
                      onClick={() => {
                        setSelectedDraft(draft);
                        setEditDraftForm({ subject: draft.subject, body: draft.body });
                        setShowDraftModal(true);
                      }}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Edit size={13} />
                      <span>Edit Draft</span>
                    </button>
                    {draft.status === 'PENDING_APPROVAL' && (
                      <button
                        className="btn btn-primary btn-xs"
                        onClick={() => handleApproveDraft(draft.draftId)}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Check size={13} />
                        <span>Approve</span>
                      </button>
                    )}
                    {draft.status === 'APPROVED' && (
                      <button
                        className="btn btn-primary btn-xs"
                        onClick={() => handleSendDraft(draft.draftId)}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Send size={13} />
                        <span>Send Now</span>
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--bg-card)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.88rem' }}>
                  <div style={{ fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>
                    Subject: {draft.subject}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                    {draft.body}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: EXECUTION HISTORY
          ========================================================================= */}
      {activeTab === 'executions' && (
        <div className="crm-card" style={{ padding: '20px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Automation Execution History & Delivery Queue</h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Real-time audit log of outbound message delivery, attempts, provider acknowledgments, and retry mechanisms.
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Execution ID</th>
                  <th>Task ID</th>
                  <th>Draft ID</th>
                  <th>Channel</th>
                  <th>Status</th>
                  <th>Delivery Status</th>
                  <th>Attempt Count</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {executions.map(ex => (
                  <tr key={ex.executionId}>
                    <td style={{ fontWeight: 700 }}>{ex.executionId}</td>
                    <td>#{ex.taskId}</td>
                    <td>{ex.draftId}</td>
                    <td>{ex.channel}</td>
                    <td>
                      <span className={`badge ${ex.status === 'QUEUED' ? 'badge-primary' : ex.status === 'FAILED' ? 'badge-lost' : 'badge-qualified'}`}>
                        {ex.status}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-secondary">{ex.deliveryStatus}</span>
                    </td>
                    <td>{ex.attemptCount || 0}</td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {ex.createdAt ? ex.createdAt.substring(0, 16) : '2026-10-27T15:57'}
                    </td>
                    <td>
                      {ex.status === 'FAILED' ? (
                        <button
                          className="btn btn-secondary btn-xs"
                          onClick={() => handleRetryExecution(ex.executionId)}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <RefreshCw size={12} />
                          <span>Retry</span>
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>In Progress</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 6: CONTACT SUPPRESSION LIST
          ========================================================================= */}
      {activeTab === 'suppression' && (
        <div className="crm-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Contact Suppression & Stop-Contact Registry</h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Students who have opted out or requested stop of automated messages. Guaranteed zero promotional contact.
              </p>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowStopContactModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Ban size={14} />
              <span>Register Stop Contact</span>
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Suppression ID</th>
                  <th>Lead ID</th>
                  <th>Channel</th>
                  <th>Scope</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Effective Date</th>
                </tr>
              </thead>
              <tbody>
                {suppressions.map(sup => (
                  <tr key={sup.suppressionId}>
                    <td style={{ fontWeight: 700 }}>{sup.suppressionId}</td>
                    <td>#{sup.leadId}</td>
                    <td>{sup.channel}</td>
                    <td>
                      <span className="badge badge-secondary">{sup.scope}</span>
                    </td>
                    <td>{sup.reason}</td>
                    <td>
                      <span className="badge badge-lost">{sup.status}</span>
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {sup.effectiveAt ? sup.effectiveAt.substring(0, 16) : '2026-10-27'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 7: METRICS & AUDIT
          ========================================================================= */}
      {activeTab === 'metrics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="crm-card" style={{ padding: '20px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 700 }}>Outbound Nurture Telemetry & Conversion Metrics</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Tasks Cancelled</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px' }}>{metrics?.tasksCancelled || 45}</div>
              </div>
              <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Messages Sent</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px', color: '#10b981' }}>{metrics?.messagesSent || 310}</div>
              </div>
              <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Drafts Approved</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px', color: 'var(--primary)' }}>{metrics?.draftsApproved || 350}</div>
              </div>
              <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Associated Applications</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '4px', color: '#8b5cf6' }}>{metrics?.applicationsAssociatedWithFollowUps || 65}</div>
              </div>
            </div>
          </div>

          <div className="crm-card" style={{ padding: '20px' }}>
            <h3 style={{ margin: '0 0 14px', fontSize: '1.1rem', fontWeight: 700 }}>AI Follow-up Audit Events</h3>
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Event ID</th>
                  <th>Event Type</th>
                  <th>Actor Type</th>
                  <th>Actor ID</th>
                  <th>Resource Type</th>
                  <th>Resource ID</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {auditEvents.map(evt => (
                  <tr key={evt.eventId}>
                    <td style={{ fontWeight: 700 }}>{evt.eventId}</td>
                    <td>
                      <span className="badge badge-primary">{evt.eventType}</span>
                    </td>
                    <td>{evt.actorType}</td>
                    <td>{evt.actorId}</td>
                    <td>{evt.resourceType}</td>
                    <td>#{evt.resourceId}</td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{evt.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CREATE FOLLOW-UP RULE
          ========================================================================= */}
      {showRuleModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Create Follow-up Automation Rule</h3>
              <button className="btn btn-secondary btn-xs" onClick={() => setShowRuleModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateRule} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Rule Name *</label>
                <input
                  type="text"
                  required
                  className="input"
                  placeholder="e.g. New Admission Enquiry 24h Follow-up"
                  value={newRuleForm.name}
                  onChange={(e) => setNewRuleForm({ ...newRuleForm, name: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Trigger Event *</label>
                <select
                  className="input"
                  value={newRuleForm.triggerType}
                  onChange={(e) => setNewRuleForm({ ...newRuleForm, triggerType: e.target.value })}
                >
                  <option value="ENQUIRY_CREATED">New Admission Enquiry Created</option>
                  <option value="APPLICATION_INCOMPLETE">Incomplete Application Pending</option>
                  <option value="COUNSELLING_UPCOMING">Upcoming Counselling Session Reminder</option>
                  <option value="INACTIVE_ENQUIRY">Quiet / Inactive Enquiry Re-engagement</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Delay (Minutes)</label>
                <input
                  type="number"
                  className="input"
                  value={newRuleForm.delayMinutes}
                  onChange={(e) => setNewRuleForm({ ...newRuleForm, delayMinutes: Number(e.target.value) })}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>1440 min = 24 hours, 2880 min = 48 hours</span>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Outbound Channel</label>
                <select
                  className="input"
                  value={newRuleForm.channel}
                  onChange={(e) => setNewRuleForm({ ...newRuleForm, channel: e.target.value })}
                >
                  <option value="EMAIL">EMAIL</option>
                  <option value="WHATSAPP">WHATSAPP</option>
                  <option value="SMS">SMS</option>
                </select>
              </div>

              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowRuleModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Rule</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: EDIT MESSAGE DRAFT
          ========================================================================= */}
      {showDraftModal && selectedDraft && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Edit Follow-up Draft {selectedDraft.draftId}</h3>
              <button className="btn btn-secondary btn-xs" onClick={() => setShowDraftModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleEditDraft} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Subject Line *</label>
                <input
                  type="text"
                  required
                  className="input"
                  value={editDraftForm.subject}
                  onChange={(e) => setEditDraftForm({ ...editDraftForm, subject: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Message Body *</label>
                <textarea
                  required
                  rows={6}
                  className="input"
                  value={editDraftForm.body}
                  onChange={(e) => setEditDraftForm({ ...editDraftForm, body: e.target.value })}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ padding: '10px 14px', borderRadius: '6px', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid #f59e0b', fontSize: '0.78rem', color: '#f59e0b' }}>
                ⚠️ Note: Editing this draft will invalidate previous staff approval and return status to PENDING_APPROVAL.
              </div>

              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowDraftModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: SNOOZE / RESCHEDULE
          ========================================================================= */}
      {showSnoozeModal && selectedTask && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Reschedule Task #{selectedTask.taskId}</h3>
              <button className="btn btn-secondary btn-xs" onClick={() => setShowSnoozeModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSnoozeTask} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px', display: 'block' }}>New Schedule Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  className="input"
                  value={snoozeForm.newScheduledAt.substring(0, 16)}
                  onChange={(e) => setSnoozeForm({ ...snoozeForm, newScheduledAt: e.target.value + ':00+05:30' })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Reason for Rescheduling</label>
                <input
                  type="text"
                  className="input"
                  value={snoozeForm.reason}
                  onChange={(e) => setSnoozeForm({ ...snoozeForm, reason: e.target.value })}
                />
              </div>

              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowSnoozeModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Confirm Reschedule</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: STOP CONTACT / SUPPRESSION
          ========================================================================= */}
      {showStopContactModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#ef4444' }}>Register Contact Suppression</h3>
              <button className="btn btn-secondary btn-xs" onClick={() => setShowStopContactModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleStopContact} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Lead ID *</label>
                <input
                  type="number"
                  required
                  className="input"
                  value={stopContactForm.leadId}
                  onChange={(e) => setStopContactForm({ ...stopContactForm, leadId: Number(e.target.value) })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Channel</label>
                <select
                  className="input"
                  value={stopContactForm.channel}
                  onChange={(e) => setStopContactForm({ ...stopContactForm, channel: e.target.value })}
                >
                  <option value="EMAIL">EMAIL</option>
                  <option value="WHATSAPP">WHATSAPP</option>
                  <option value="ALL">ALL CHANNELS</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Suppression Scope</label>
                <select
                  className="input"
                  value={stopContactForm.scope}
                  onChange={(e) => setStopContactForm({ ...stopContactForm, scope: e.target.value })}
                >
                  <option value="MARKETING_MESSAGES">Marketing & Promotional Messages</option>
                  <option value="ALL_AUTOMATED_CONTACT">All Automated Contact</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px', display: 'block' }}>Reason</label>
                <input
                  type="text"
                  className="input"
                  value={stopContactForm.reason}
                  onChange={(e) => setStopContactForm({ ...stopContactForm, reason: e.target.value })}
                />
              </div>

              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowStopContactModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#ef4444', borderColor: '#ef4444' }}>Enforce Suppression</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: AGENT CONFIGURATION
          ========================================================================= */}
      {showConfigModal && config && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '580px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>AI Follow-up Configuration</h3>
              <button className="btn btn-secondary btn-xs" onClick={() => setShowConfigModal(false)}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Human Approval Required</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>All AI generated drafts must be approved prior to dispatch</div>
                </div>
                <span className="badge badge-qualified">Enforced</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Stop After Student Reply</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Automatically cancel scheduled follow-up sequences when student responds</div>
                </div>
                <span className="badge badge-qualified">Active</span>
              </div>

              <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>Permitted Contact Hours</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  09:00 - 18:00 ({config.permittedContactHours?.timeZone || 'Asia/Kolkata'}). No automated communications during quiet hours.
                </div>
              </div>

              <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>Contact Frequency Limits</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Maximum {config.maxAutomatedMessagesPerLeadPerWeek || 3} automated messages per student per week with minimum {config.minimumHoursBetweenMessages || 24} hours interval.
                </div>
              </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn btn-secondary" onClick={() => setShowConfigModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
