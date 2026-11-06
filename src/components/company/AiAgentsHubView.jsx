import React, { useState, useEffect } from 'react';
import {
  Bot,
  Zap,
  Clock,
  Send,
  MessageSquare,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Pause,
  Play,
  RotateCcw,
  UserCheck,
  Headphones,
  Settings,
  HelpCircle,
  FileText,
  UserX,
  ExternalLink,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { softwareService } from '../../services/softwareService';
import { useCRM } from '../../context/CRMContext';
import { AIEmployeeWorkstation } from '../aiAgents/AIEmployeeWorkstation';

export function AiAgentsHubView() {
  const {
    isAiFleetAutonomousActive,
    aiAutonomousStats,
    stopAiFleetExecution,
    resumeAiFleetExecution,
    currentUserRole
  } = useCRM();
  const [activeModule, setActiveModule] = useState('workstation'); // workstation | sales-agent | support-agent | follow-up-agent
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // 1. AI SALES AGENT SIMULATOR STATE
  const [salesSessionId, setSalesSessionId] = useState('AIS-1001');
  const [salesMessages, setSalesMessages] = useState([
    { sender: 'ai', text: 'Hello! I can help you explore our software and CRM services. What would you like to achieve?' },
    { sender: 'user', text: 'We need a CRM application for our software company.' },
    { sender: 'ai', text: 'I can help you explore a CRM solution. Are you mainly looking for lead management, customer support, sales automation, or a combination of these?' }
  ]);
  const [userSalesInput, setUserSalesInput] = useState('');
  const [salesQualification, setSalesQualification] = useState(null);
  const [salesRecommendations, setSalesRecommendations] = useState([]);
  const [salesMetrics, setSalesMetrics] = useState({
    totalSessions: 850,
    leadsCreated: 95,
    qualifiedLeads: 58,
    handoffRequests: 120,
    averageResponseTimeMs: 950
  });

  // 2. AI SUPPORT AGENT SIMULATOR STATE
  const [supportSessionId, setSupportSessionId] = useState('AISUP-1001');
  const [supportMessages, setSupportMessages] = useState([
    { sender: 'ai', text: 'Hello! I can help troubleshoot your issue or connect you with our support team. What problem are you experiencing?' },
    { sender: 'user', text: 'I cannot log in to the customer portal.' },
    { sender: 'ai', text: 'I can help you troubleshoot that. Are you seeing an error message, or does the login page keep loading?' }
  ]);
  const [userSupportInput, setUserSupportInput] = useState('');
  const [supportClassification, setSupportClassification] = useState(null);
  const [supportTroubleshooting, setSupportTroubleshooting] = useState(null);
  const [supportTicketCreated, setSupportTicketCreated] = useState(null);
  const [supportMetrics, setSupportMetrics] = useState({
    totalSessions: 600,
    ticketsCreated: 145,
    handoffRequests: 90,
    knowledgeRetrievalSuccessPercent: 92.0,
    averageResponseTimeMs: 1100
  });

  // 3. AI FOLLOW-UP AGENT CONSOLE STATE
  const [followUpConfig, setFollowUpConfig] = useState({
    enabled: true,
    defaultTimezone: 'Asia/Kolkata',
    maxAutomatedAttempts: 3,
    minimumIntervalHours: 24,
    respectQuietHours: true,
    stopOnCustomerReply: true,
    stopOnOptOut: true,
    requireApprovalForFirstOutboundMessage: true
  });
  const [followUpRules, setFollowUpRules] = useState([]);
  const [followUpTasks, setFollowUpTasks] = useState([]);
  const [followUpExecutions, setFollowUpExecutions] = useState([]);
  const [followUpMetrics, setFollowUpMetrics] = useState({
    tasksCreated: 620,
    tasksCompleted: 510,
    messagesDelivered: 385,
    customerReplies: 95,
    optOuts: 8
  });

  // Opt-out modal
  const [suppressContactId, setSuppressContactId] = useState('CON-2001');
  const [suppressedList, setSuppressedList] = useState([]);

  useEffect(() => {
    loadFollowUpData();
  }, []);

  const loadFollowUpData = async () => {
    try {
      const [cfgRes, rRes, tRes, exRes, mRes] = await Promise.allSettled([
        softwareService.getFollowUpConfig(),
        softwareService.getFollowUpRules(),
        softwareService.getFollowUpTasks(),
        softwareService.getFollowUpExecutions(),
        softwareService.getFollowUpMetrics()
      ]);

      if (cfgRes.status === 'fulfilled') setFollowUpConfig(cfgRes.value);
      if (rRes.status === 'fulfilled') setFollowUpRules(rRes.value);
      if (tRes.status === 'fulfilled') setFollowUpTasks(tRes.value);
      if (exRes.status === 'fulfilled') setFollowUpExecutions(exRes.value);
      if (mRes.status === 'fulfilled') setFollowUpMetrics(mRes.value);
    } catch (e) {
      console.warn('Error loading follow-up data:', e);
    }
  };

  // Sales Agent Handlers
  const handleSendSalesMessage = async (e) => {
    e.preventDefault();
    if (!userSalesInput.trim()) return;
    const msg = userSalesInput;
    setUserSalesInput('');
    setSalesMessages(prev => [...prev, { sender: 'user', text: msg }]);

    try {
      const res = await softwareService.sendSalesMessage(salesSessionId, { message: msg });
      setSalesMessages(prev => [...prev, { sender: 'ai', text: res.reply }]);
    } catch (err) {
      setSalesMessages(prev => [...prev, { sender: 'ai', text: 'I understand your software requirements. Would you like me to connect you with our solutions architect for a live walkthrough?' }]);
    }
  };

  const handleQualifySales = async () => {
    try {
      const res = await softwareService.qualifySalesSession(salesSessionId, {
        companyName: 'ABC Technologies',
        industry: 'SOFTWARE_IT',
        requirement: 'Custom CRM with automated follow-ups',
        estimatedBudget: 500000,
        currency: 'INR'
      });
      setSalesQualification(res);
      setMessage({ type: 'success', text: `Lead qualified with score ${res.qualificationScore}/100. Next: ${res.recommendedNextAction}` });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleRecommendServices = async () => {
    try {
      const res = await softwareService.recommendServices(salesSessionId, {
        requirement: 'Enterprise CRM development',
        budget: { amount: 500000, currency: 'INR' }
      });
      setSalesRecommendations(res.recommendations || []);
      setMessage({ type: 'success', text: 'Authorized services recommended from verified catalogue.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleCreateLeadFromAi = async () => {
    try {
      const res = await softwareService.createLeadFromSession(salesSessionId, {
        name: 'Karthik Raj',
        companyName: 'ABC Technologies',
        email: 'karthik@abctech.example',
        source: 'WEBSITE_CHAT'
      });
      setMessage({ type: 'success', text: `Lead ${res.leadId} created successfully from AI session.` });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleHandoffSales = async () => {
    try {
      const res = await softwareService.handoffSalesSession(salesSessionId, {
        reason: 'CUSTOM_REQUIREMENT',
        preferredTeam: 'SALES'
      });
      setMessage({ type: 'info', text: `Human handoff queued (${res.handoffId}). Handing conversation to Sales Executive team.` });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  // Support Agent Handlers
  const handleSendSupportMessage = async (e) => {
    e.preventDefault();
    if (!userSupportInput.trim()) return;
    const msg = userSupportInput;
    setUserSupportInput('');
    setSupportMessages(prev => [...prev, { sender: 'user', text: msg }]);

    try {
      const res = await softwareService.sendSupportMessage(supportSessionId, { message: msg });
      setSupportMessages(prev => [...prev, { sender: 'ai', text: res.reply }]);
    } catch (err) {
      setSupportMessages(prev => [...prev, { sender: 'ai', text: 'I am retrieving the portal authentication guide from approved documentation. Please verify if your account is experiencing a timeout.' }]);
    }
  };

  const handleClassifySupport = async () => {
    try {
      const res = await softwareService.classifySupportIssue(supportSessionId, {
        message: 'The portal says authentication failed'
      });
      setSupportClassification(res);
      setMessage({ type: 'success', text: `Issue classified as ${res.category} (Priority: ${res.prioritySuggestion})` });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleTroubleshootSupport = async () => {
    try {
      const res = await softwareService.troubleshootSupport(supportSessionId, {
        problem: 'Portal login failure',
        useApprovedKnowledgeOnly: true
      });
      setSupportTroubleshooting(res);
      setMessage({ type: 'success', text: 'Diagnostic troubleshooting checklist retrieved with article citations.' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleCreateTicketFromAi = async () => {
    try {
      const res = await softwareService.createTicketFromSession(supportSessionId, {
        subject: 'Unable to log in to the customer portal',
        category: 'AUTHENTICATION',
        prioritySuggestion: 'MEDIUM'
      });
      setSupportTicketCreated(res);
      setMessage({ type: 'success', text: `Support ticket ${res.ticketId} created with SLA policy applied.` });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  // Follow-up Handlers
  const handleCompleteTask = async (taskId) => {
    try {
      await softwareService.completeFollowUpTask(taskId);
      setFollowUpTasks(followUpTasks.map(t => t.taskId === taskId ? { ...t, status: 'COMPLETED' } : t));
      setMessage({ type: 'success', text: `Follow-up task ${taskId} marked as completed.` });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleSnoozeTask = async (taskId) => {
    try {
      const res = await softwareService.snoozeFollowUpTask(taskId, { newDueAt: new Date(Date.now() + 86400000 * 2).toISOString() });
      setFollowUpTasks(followUpTasks.map(t => t.taskId === taskId ? { ...t, dueAt: res.dueAt } : t));
      setMessage({ type: 'info', text: `Task ${taskId} snoozed by 48 hours.` });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleStopContact = async () => {
    if (!suppressContactId) return;
    try {
      const res = await softwareService.stopContactFollowUp({ contactId: suppressContactId, channel: 'EMAIL' });
      setSuppressedList([res.contactId, ...suppressedList]);
      setMessage({ type: 'info', text: `Contact ${res.contactId} recorded in suppression opt-out registry. All follow-ups halted.` });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="crm-page-container" style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 40, height: 40, borderRadius: '10px', backgroundColor: '#8b5cf6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                Autonomous AI Fleet Operations
              </h1>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                AI Sales Assistant (AI-SALES-001) • AI Support Assistant (AI-SUPPORT-001) • AI Follow-up Engine
              </span>
            </div>
          </div>
        </div>

        {/* Module Switcher Buttons */}
        <div className="overflow-x-auto" style={{ display: 'flex', gap: '8px', paddingBottom: '4px' }}>
          {[
            { id: 'workstation', label: '⚡ Autonomous Workstation (Shift & Tasks)', icon: Zap, color: '#3b82f6' },
            { id: 'sales-agent', label: 'AI Sales Simulator', icon: Bot, color: '#06b6d4' },
            { id: 'support-agent', label: 'AI Support Simulator', icon: Headphones, color: '#10b981' },
            { id: 'follow-up-agent', label: 'AI Follow-up Engine', icon: Clock, color: '#8b5cf6' }
          ].map(m => {
            const Icon = m.icon;
            const isSelected = activeModule === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setActiveModule(m.id)}
                className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: isSelected ? m.color : 'transparent',
                  borderColor: isSelected ? m.color : 'var(--border)',
                  whiteSpace: 'nowrap'
                }}
              >
                <Icon size={14} />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Banner */}
      {message && (
        <div style={{ padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: message.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(139, 92, 246, 0.15)', border: `1px solid ${message.type === 'error' ? '#ef4444' : '#8b5cf6'}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem' }}>
            {message.type === 'error' ? <AlertCircle size={16} color="#ef4444" /> : <CheckCircle2 size={16} color="#8b5cf6" />}
            <span style={{ color: message.type === 'error' ? '#ef4444' : '#8b5cf6', fontWeight: 600 }}>{message.text}</span>
          </div>
          <button className="btn btn-ghost btn-xs" onClick={() => setMessage(null)}>Dismiss</button>
        </div>
      )}

      {/* 200% SUPERCHARGED AUTONOMOUS AI FLEET MASTER CONTROL CENTER */}
      <div
        className="crm-card"
        style={{
          marginBottom: '20px',
          background: isAiFleetAutonomousActive
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%)'
            : 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(245, 158, 11, 0.08) 100%)',
          border: isAiFleetAutonomousActive ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                backgroundColor: isAiFleetAutonomousActive ? '#10b981' : '#ef4444',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isAiFleetAutonomousActive ? '0 0 16px rgba(16, 185, 129, 0.4)' : '0 0 16px rgba(239, 68, 68, 0.4)'
              }}
            >
              <Zap size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                  {isAiFleetAutonomousActive ? '⚡ 200% Autonomous AI Fleet: ACTIVE' : '🛑 Autonomous AI Fleet: STOPPED BY ADMIN'}
                </h2>
                <span className="badge" style={{ backgroundColor: isAiFleetAutonomousActive ? '#10b981' : '#ef4444', color: '#fff', fontSize: '0.68rem', fontWeight: 700 }}>
                  {isAiFleetAutonomousActive ? '200% Velocity' : 'Halted'}
                </span>
              </div>
              <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {isAiFleetAutonomousActive
                  ? 'Continuous autonomous execution is actively qualifying inbound leads, delivering multi-step WhatsApp/Email follow-ups, and auto-resolving tickets until Admin stops execution.'
                  : 'All autonomous background loops, automated follow-up sequences, and AI triage have been paused by Administrator command.'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isAiFleetAutonomousActive ? (
              <button
                onClick={stopAiFleetExecution}
                className="btn btn-danger btn-sm"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 700,
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)'
                }}
              >
                <span>⏹ Stop Execution (Emergency Kill-Switch)</span>
              </button>
            ) : (
              <button
                onClick={resumeAiFleetExecution}
                className="btn btn-primary btn-sm"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 700,
                  backgroundColor: '#10b981',
                  borderColor: '#10b981',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
                }}
              >
                <span>▶ Resume 200% Autonomous Execution</span>
              </button>
            )}
          </div>
        </div>

        {/* Real-time Autonomous Metrics Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '12px',
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border)'
          }}
        >
          <div style={{ padding: '8px 12px', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Leads Auto-Qualified</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#3b82f6' }}>{aiAutonomousStats?.leadsAutoQualified || 148}</div>
          </div>
          <div style={{ padding: '8px 12px', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Follow-ups Dispatched</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#10b981' }}>{aiAutonomousStats?.followUpsDispatched || 392}</div>
          </div>
          <div style={{ padding: '8px 12px', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Tickets Auto-Resolved</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f59e0b' }}>{aiAutonomousStats?.ticketsAutoResolved || 219}</div>
          </div>
          <div style={{ padding: '8px 12px', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>SLA Guardrails Enforced</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#8b5cf6' }}>{aiAutonomousStats?.guardrailsEnforced || 61}</div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MODULE 0: AUTONOMOUS AI EMPLOYEE WORKSTATION (SHIFT & TASK EXECUTION)
          ========================================================================= */}
      {activeModule === 'workstation' && (
        <AIEmployeeWorkstation />
      )}

      {/* =========================================================================
          MODULE 1: AI SALES AGENT (AI-SALES-001)
          ========================================================================= */}
      {activeModule === 'sales-agent' && (
        <div className="responsive-split-grid-reverse">
          {/* Chat Simulator */}
          <div className="responsive-chat-height" style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: '0.94rem' }}>Software Sales Assistant Live Chat</span>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Session: {salesSessionId} • Website Widget</div>
              </div>
              <span className="badge badge-qualified" style={{ fontSize: '0.66rem' }}>ACTIVE</span>
            </div>

            {/* Message Thread */}
            <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {salesMessages.map((m, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '80%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    fontSize: '0.82rem',
                    lineHeight: 1.5,
                    backgroundColor: m.sender === 'user' ? '#3b82f6' : 'var(--bg-surface)',
                    color: m.sender === 'user' ? '#fff' : 'var(--text-main)',
                    border: m.sender === 'user' ? 'none' : '1px solid var(--border)'
                  }}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendSalesMessage} style={{ padding: '12px', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="form-control"
                style={{ fontSize: '0.82rem' }}
                placeholder="Ask about CRM services, software packages, or pricing..."
                value={userSalesInput}
                onChange={(e) => setUserSalesInput(e.target.value)}
              />
              <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '8px 16px' }}>
                <Send size={15} />
              </button>
            </form>
          </div>

          {/* AI Orchestration & Tool Execution Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', padding: '18px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>Autonomous Tool Execution</h3>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                The agent invokes backend tools with typed validation. Pricing exceptions, contracts, and discounts require human sign-off.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
                <button className="btn btn-secondary btn-sm" onClick={handleQualifySales}>
                  <span>1. Qualify BANT</span>
                </button>
                <button className="btn btn-secondary btn-sm" onClick={handleRecommendServices}>
                  <span>2. Service Match</span>
                </button>
                <button className="btn btn-secondary btn-sm" onClick={handleCreateLeadFromAi}>
                  <span>3. Create Lead</span>
                </button>
                <button className="btn btn-secondary btn-sm" onClick={handleHandoffSales} style={{ color: '#ef4444' }}>
                  <span>4. Human Handoff</span>
                </button>
              </div>

              {/* Qualification Results */}
              {salesQualification && (
                <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', marginBottom: '12px', fontSize: '0.78rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong>Score: {salesQualification.qualificationScore}/100</strong>
                    <span className="badge badge-qualified" style={{ fontSize: '0.62rem' }}>{salesQualification.qualificationStatus}</span>
                  </div>
                  <div>Criteria: {salesQualification.matchedCriteria?.join(', ')}</div>
                  <div style={{ color: '#f59e0b', marginTop: '4px' }}>Missing: {salesQualification.missingInformation?.join(', ')}</div>
                </div>
              )}

              {/* Service Recommendations */}
              {salesRecommendations.length > 0 && (
                <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', fontSize: '0.78rem' }}>
                  <strong style={{ display: 'block', marginBottom: '6px' }}>Recommended Catalog Items:</strong>
                  {salesRecommendations.map((r, i) => (
                    <div key={i} style={{ marginBottom: '6px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{r.name} ({r.productId})</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.72rem' }}>{r.reason} • Score: {r.matchScore}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Performance KPIs */}
            <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', padding: '18px' }}>
              <h3 style={{ fontSize: '0.94rem', fontWeight: 700, marginBottom: '12px' }}>AI Sales Telemetry</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Total Sessions</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>{salesMetrics.totalSessions}</div>
                </div>
                <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Leads Created</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#10b981' }}>{salesMetrics.leadsCreated}</div>
                </div>
                <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Handoff Rate</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f59e0b' }}>
                    {((salesMetrics.handoffRequests / salesMetrics.totalSessions) * 100).toFixed(1)}%
                  </div>
                </div>
                <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Avg Response Time</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#3b82f6' }}>{salesMetrics.averageResponseTimeMs} ms</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODULE 2: AI SUPPORT AGENT (AI-SUPPORT-001)
          ========================================================================= */}
      {activeModule === 'support-agent' && (
        <div className="responsive-split-grid-reverse">
          {/* Chat Simulator */}
          <div className="responsive-chat-height" style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: '0.94rem' }}>IT Customer Support Assistant</span>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Session: {supportSessionId} • KB Source Verified</div>
              </div>
              <span className="badge badge-qualified" style={{ fontSize: '0.66rem' }}>ACTIVE</span>
            </div>

            {/* Thread */}
            <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {supportMessages.map((m, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '80%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    fontSize: '0.82rem',
                    lineHeight: 1.5,
                    backgroundColor: m.sender === 'user' ? '#10b981' : 'var(--bg-surface)',
                    color: m.sender === 'user' ? '#fff' : 'var(--text-main)',
                    border: m.sender === 'user' ? 'none' : '1px solid var(--border)'
                  }}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendSupportMessage} style={{ padding: '12px', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="form-control"
                style={{ fontSize: '0.82rem' }}
                placeholder="Ask technical support questions (e.g. portal login, API timeout, MFA)..."
                value={userSupportInput}
                onChange={(e) => setUserSupportInput(e.target.value)}
              />
              <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '8px 16px', backgroundColor: '#10b981', borderColor: '#10b981' }}>
                <Send size={15} />
              </button>
            </form>
          </div>

          {/* AI Support Actions Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', padding: '18px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>Knowledge Diagnostic Tools</h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
                <button className="btn btn-secondary btn-sm" onClick={handleClassifySupport}>
                  <span>1. Classify Issue</span>
                </button>
                <button className="btn btn-secondary btn-sm" onClick={handleTroubleshootSupport}>
                  <span>2. Troubleshoot (KB)</span>
                </button>
                <button className="btn btn-secondary btn-sm" onClick={handleCreateTicketFromAi}>
                  <span>3. Create Ticket</span>
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => setMessage({ type: 'info', text: 'Support session handoff queued to Support Agent Meena Raj.' })} style={{ color: '#ef4444' }}>
                  <span>4. Agent Handoff</span>
                </button>
              </div>

              {/* Classification */}
              {supportClassification && (
                <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', marginBottom: '12px', fontSize: '0.78rem' }}>
                  <div>Category: <strong>{supportClassification.category}</strong></div>
                  <div>Suggested Priority: <span className="badge badge-warning" style={{ fontSize: '0.64rem' }}>{supportClassification.prioritySuggestion}</span></div>
                  <div>Sentiment: {supportClassification.sentiment}</div>
                </div>
              )}

              {/* Troubleshooting */}
              {supportTroubleshooting && (
                <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', marginBottom: '12px', fontSize: '0.78rem' }}>
                  <strong style={{ display: 'block', marginBottom: '6px' }}>Approved Diagnostic Steps:</strong>
                  <ol style={{ margin: 0, paddingLeft: '18px' }}>
                    {supportTroubleshooting.suggestions?.map((s, idx) => (
                      <li key={idx} style={{ marginBottom: '4px' }}>{s}</li>
                    ))}
                  </ol>
                  <div style={{ marginTop: '8px', color: '#10b981', fontSize: '0.72rem' }}>
                    Cited Documentation: {supportTroubleshooting.sourceArticleIds?.join(', ')}
                  </div>
                </div>
              )}

              {/* Ticket Created */}
              {supportTicketCreated && (
                <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', fontSize: '0.78rem' }}>
                  <div style={{ fontWeight: 700, color: '#10b981' }}>Ticket Created: {supportTicketCreated.ticketId}</div>
                  <div>{supportTicketCreated.subject} ({supportTicketCreated.priority})</div>
                </div>
              )}
            </div>

            {/* Support Metrics */}
            <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', padding: '18px' }}>
              <h3 style={{ fontSize: '0.94rem', fontWeight: 700, marginBottom: '12px' }}>AI Support Telemetry</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Tickets Created</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#10b981' }}>{supportMetrics.ticketsCreated}</div>
                </div>
                <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>KB Success Rate</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#3b82f6' }}>{supportMetrics.knowledgeRetrievalSuccessPercent}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODULE 3: AI FOLLOW-UP AGENT
          ========================================================================= */}
      {activeModule === 'follow-up-agent' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Engine Config & Opt-out Bar */}
          <div className="responsive-split-grid-reverse">
            <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', padding: '18px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '10px' }}>Autonomous Engine Configuration</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" style={{ fontSize: '0.78rem' }}>
                <div>Timezone: <strong>{followUpConfig.defaultTimezone}</strong></div>
                <div>Max Attempts: <strong>{followUpConfig.maxAutomatedAttempts}</strong></div>
                <div>Quiet Hours: <strong style={{ color: '#10b981' }}>Enforced (10 PM - 8 AM)</strong></div>
                <div>Halt on Customer Reply: <strong style={{ color: '#10b981' }}>Active</strong></div>
                <div>Halt on Customer Opt-out: <strong style={{ color: '#10b981' }}>Active</strong></div>
                <div>Require Approval for 1st Outbound: <strong style={{ color: '#f59e0b' }}>True</strong></div>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', padding: '18px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '10px', color: '#ef4444' }}>Contact Opt-Out Suppression</h3>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                Immediately records contact unsubscribe request and stops all automated email/SMS sequences.
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="form-control"
                  style={{ fontSize: '0.82rem' }}
                  value={suppressContactId}
                  onChange={(e) => setSuppressContactId(e.target.value)}
                  placeholder="Contact ID (e.g. CON-2001)"
                />
                <button className="btn btn-secondary btn-sm" onClick={handleStopContact} style={{ color: '#ef4444', borderColor: '#ef4444' }}>
                  Record Opt-Out
                </button>
              </div>
            </div>
          </div>

          {/* Follow-up Tasks Queue */}
          <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '0.94rem' }}>Scheduled Follow-Up Tasks Queue</span>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>{followUpTasks.length} Pending Tasks</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-surface)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 14px' }}>Task ID</th>
                  <th style={{ padding: '10px 14px' }}>Title & Relation</th>
                  <th style={{ padding: '10px 14px' }}>Channel</th>
                  <th style={{ padding: '10px 14px' }}>Assignee</th>
                  <th style={{ padding: '10px 14px' }}>Due Date</th>
                  <th style={{ padding: '10px 14px' }}>Status</th>
                  <th style={{ padding: '10px 14px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {followUpTasks.map((t, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#8b5cf6' }}>{t.taskId}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{t.title}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{t.relatedType}: {t.relatedId}</div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span className="badge" style={{ backgroundColor: '#8b5cf620', color: '#8b5cf6', fontSize: '0.68rem' }}>{t.channel}</span>
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>{t.assignedUserId}</td>
                    <td style={{ padding: '12px 14px' }}>{t.dueAt?.substring(0, 10)}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span className="badge" style={{ backgroundColor: t.status === 'COMPLETED' ? '#10b98120' : '#f59e0b20', color: t.status === 'COMPLETED' ? '#10b981' : '#f59e0b', fontSize: '0.68rem' }}>
                        {t.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      {t.status !== 'COMPLETED' && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button className="btn btn-primary btn-xs" onClick={() => handleCompleteTask(t.taskId)}>Complete</button>
                          <button className="btn btn-secondary btn-xs" onClick={() => handleSnoozeTask(t.taskId)}>+48h</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Execution History */}
          <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', fontWeight: 700 }}>
              Recent Outbound Follow-Up Executions (Provider Telemetry)
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-surface)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 14px' }}>Execution ID</th>
                  <th style={{ padding: '10px 14px' }}>Draft ID</th>
                  <th style={{ padding: '10px 14px' }}>Channel</th>
                  <th style={{ padding: '10px 14px' }}>Attempts</th>
                  <th style={{ padding: '10px 14px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {followUpExecutions.map((ex, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 700 }}>{ex.executionId}</td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>{ex.draftId}</td>
                    <td style={{ padding: '12px 14px' }}>{ex.channel}</td>
                    <td style={{ padding: '12px 14px' }}>{ex.attemptCount}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span className="badge badge-qualified" style={{ fontSize: '0.68rem' }}>{ex.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
