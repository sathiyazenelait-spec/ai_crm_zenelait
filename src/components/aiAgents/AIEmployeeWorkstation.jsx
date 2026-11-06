import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  Bot,
  Zap,
  Clock,
  Send,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Pause,
  Play,
  RotateCcw,
  Users,
  Headphones,
  Settings,
  HelpCircle,
  FileText,
  ChevronRight,
  TrendingUp,
  Calendar,
  Briefcase,
  Layers,
  ArrowRight,
  Check,
  Plus,
  Flame,
  AlertTriangle,
  Award,
  Terminal,
  Activity,
  Phone,
  Mail,
  ExternalLink,
  Info
} from 'lucide-react';

export function AIEmployeeWorkstation() {
  const {
    isAiFleetAutonomousActive,
    toggleAiFleetExecution,
    aiAutonomousStats,
    aiEmployeesList,
    aiEmployeeTasks,
    aiExecutionLog,
    activeExecutingTaskId,
    executeEmployeeTask,
    assignCustomEmployeeTask,
    toggleEmployeeShift,
    toggleEmployeeAutoPilot,
    resetDemoWorkQueue,
    currentIndustry,
    currentTenant,
    tenants,
    switchTenant,
    switchIndustry,
    navigateTo
  } = useCRM();

  // Active Role Module Tab: 'EMPLOYEE' | 'AUDIT_LOG'
  const [activeRoleCategory, setActiveRoleCategory] = useState('EMPLOYEE');

  // Selected Employee ID (safely defaults to first in list)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(() => aiEmployeesList[0]?.id || 'emp-it-1');

  // Active Task for detailed Terminal inspection
  const [inspectedTaskId, setInspectedTaskId] = useState(null);

  // Modal: Assign Work to Employee
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState({
    agentId: aiEmployeesList[0]?.id || 'emp-it-1',
    title: '',
    clientName: '',
    clientCompany: '',
    contactEmail: '',
    contactPhone: '',
    type: 'LEAD_QUALIFICATION',
    priority: 'HIGH',
    channel: 'WhatsApp & Email',
    details: '',
    suggestedAction: '',
    estimatedImpact: '+₹3,00,000 Pipeline'
  });

  // Selected Employee (safely resolved)
  const selectedEmployee = aiEmployeesList.find(e => e.id === selectedEmployeeId) || aiEmployeesList[0] || {
    id: 'emp-default',
    name: 'AI Autonomous Specialist',
    avatar: '🤖',
    role: 'Autonomous Agent',
    department: 'Operations',
    status: 'ON_DUTY',
    color: '#3b82f6',
    guardrails: ['SOC2 & DPDP Compliant'],
    capabilities: [{ name: 'Task Automation', desc: 'Auto-completes CRM actions.' }],
    tasksCompletedToday: 24,
    accuracyScore: '98.5%',
    avgResponseSpeed: '0.8s',
    pipelineGeneratedToday: '₹5,00,000'
  };

  // Filter Tasks for the selected employee
  const employeeTasks = aiEmployeeTasks.filter(t => t.agentId === selectedEmployee.id);
  const pendingTasks = employeeTasks.filter(t => t.status === 'PENDING');
  const completedTasks = employeeTasks.filter(t => t.status === 'COMPLETED');

  // Selected or Active Inspected Task for the live terminal
  const activeTask = inspectedTaskId
    ? aiEmployeeTasks.find(t => t.id === inspectedTaskId)
    : employeeTasks.find(t => t.id === activeExecutingTaskId) || pendingTasks[0] || completedTasks[0] || null;

  // Submit Custom Task Assignment
  const handleAssignSubmit = (e) => {
    e.preventDefault();
    if (!assignForm.title.trim() || !assignForm.clientName.trim()) return;

    assignCustomEmployeeTask(assignForm.agentId || selectedEmployee.id, {
      ...assignForm,
      estimatedImpact: assignForm.estimatedImpact || '+₹2,50,000 Pipeline'
    });

    setShowAssignModal(false);
    setAssignForm({
      agentId: selectedEmployee.id,
      title: '',
      clientName: '',
      clientCompany: '',
      contactEmail: '',
      contactPhone: '',
      type: selectedEmployee.roleCategory === 'SALES_SDR' ? 'LEAD_QUALIFICATION' : 'FOLLOW_UP_OUTBOUND',
      priority: 'HIGH',
      channel: 'WhatsApp & Email',
      details: '',
      suggestedAction: '',
      estimatedImpact: '+₹3,00,000 Pipeline'
    });
  };

  // Total fleet pending tasks
  const totalFleetPending = aiEmployeeTasks.filter(t => t.status === 'PENDING').length;
  const totalFleetCompleted = aiEmployeeTasks.filter(t => t.status === 'COMPLETED').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', paddingBottom: '60px' }}>
      {/* =========================================================================
          1. FLEET COMMAND BAR & EXECUTIVE METRICS
         ========================================================================= */}
      <div
        style={{
          borderRadius: '18px',
          background: 'linear-gradient(135deg, #090e1a 0%, #111827 50%, #1e1b4b 100%)',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          padding: '24px 28px',
          boxShadow: '0 10px 32px rgba(0, 0, 0, 0.45)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  color: '#60a5fa',
                  border: '1px solid rgba(59, 130, 246, 0.4)'
                }}
              >
                <Sparkles size={14} />
                <span>9-Tenant Autonomous AI Fleet Workstation</span>
              </span>

              {/* Dynamic Tenant Selector Dropdown */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 600 }}>Active Tenant:</span>
                <select
                  aria-label="Active Tenant"
                  value={currentTenant?.id}
                  onChange={(e) => {
                    const targetT = tenants.find(t => t.id === e.target.value);
                    if (targetT) {
                      switchTenant(targetT.id);
                      if (targetT.industryId) switchIndustry(targetT.industryId);
                    }
                  }}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    borderRadius: '8px',
                    padding: '3px 10px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {tenants.map(t => (
                    <option key={t.id} value={t.id} style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                      {t.name} ({t.industry || t.industryId})
                    </option>
                  ))}
                </select>
              </div>

              <span
                style={{
                  fontSize: '0.74rem',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  fontWeight: 600,
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: '#34d399',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}
              >
                SOC2 Isolated
              </span>
            </div>

            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>
              {currentIndustry.name} AI Employee Fleet & Autonomous Workplace
            </h1>
            <p style={{ margin: '6px 0 0 0', fontSize: '0.86rem', color: '#94a3b8', maxWidth: '780px', lineHeight: 1.5 }}>
              Dedicated autonomous AI employees executing daily shifts, resolving customer inquiries, qualifying inbound leads,
              sending multi-touch follow-ups, and updating the CRM database in real time for <strong>{currentTenant?.name || currentIndustry.name}</strong>.
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={resetDemoWorkQueue}
              title="Reset Work Queues with Sample Inbound Assignments"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 16px',
                borderRadius: '10px',
                fontSize: '0.8rem',
                fontWeight: 600,
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: '#e2e8f0',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <RotateCcw size={15} />
              <span>Reset Tenant Queue</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAssignForm(prev => ({
                  ...prev,
                  agentId: selectedEmployee.id,
                  type: selectedEmployee.roleCategory === 'SALES_SDR' ? 'LEAD_QUALIFICATION' : 'FOLLOW_UP_OUTBOUND'
                }));
                setShowAssignModal(true);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: 700,
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Plus size={16} />
              <span>+ Assign Work to Employee</span>
            </button>

            <button
              type="button"
              onClick={toggleAiFleetExecution}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: 700,
                backgroundColor: isAiFleetAutonomousActive ? '#10b981' : '#f59e0b',
                color: isAiFleetAutonomousActive ? '#ffffff' : '#000000',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                boxShadow: isAiFleetAutonomousActive ? '0 4px 14px rgba(16, 185, 129, 0.4)' : '0 4px 14px rgba(245, 158, 11, 0.4)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {isAiFleetAutonomousActive ? <Play size={16} /> : <Pause size={16} />}
              <span>{isAiFleetAutonomousActive ? 'Auto-Pilot Shift: Active' : 'Auto-Pilot: Paused'}</span>
            </button>
          </div>
        </div>

        {/* Global Fleet Quick Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '16px'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.04em' }}>
              Pending Task Queue
            </span>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f59e0b', marginTop: '2px' }}>
              {totalFleetPending} Tasks
            </div>
            <span style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>Awaiting autonomous execution</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.04em' }}>
              Tasks Completed Today
            </span>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#10b981', marginTop: '2px' }}>
              {aiAutonomousStats.leadsAutoQualified + aiAutonomousStats.followUpsDispatched + aiAutonomousStats.ticketsAutoResolved + totalFleetCompleted}
            </div>
            <span style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>Across all 5 AI employees</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.04em' }}>
              Pipeline Generated
            </span>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#60a5fa', marginTop: '2px' }}>
              ₹51,20,000
            </div>
            <span style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>From AI SDR & Follow-Up actions</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.04em' }}>
              Avg Fleet Accuracy
            </span>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#a78bfa', marginTop: '2px' }}>
              98.4%
            </div>
            <span style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>SOC2 & Guardrail compliant</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.04em' }}>
              Turnaround Speed
            </span>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>
              &lt; 0.8s
            </div>
            <span style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>Real-time event processing</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. ROLE MODULE NAVIGATION (SPLIT AND WORK)
         ========================================================================= */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
          borderBottom: '1px solid var(--border)'
        }}
      >
        {[
          ...aiEmployeesList.map(emp => ({
            id: emp.id,
            type: 'EMPLOYEE',
            label: emp.name,
            roleName: emp.role?.split('&')[0]?.trim() || emp.role,
            avatar: emp.avatar,
            color: emp.color,
            pendingCount: aiEmployeeTasks.filter(t => t.agentId === emp.id && t.status === 'PENDING').length
          })),
          {
            id: 'AUDIT_LOG',
            type: 'AUDIT_LOG',
            label: 'Fleet Shift Audit Trail',
            roleName: 'Execution History',
            avatar: '📋',
            color: '#ec4899',
            pendingCount: aiExecutionLog.length
          }
        ].map((tab) => {
          const isActive = tab.type === 'AUDIT_LOG'
            ? activeRoleCategory === 'AUDIT_LOG'
            : selectedEmployee.id === tab.id && activeRoleCategory !== 'AUDIT_LOG';

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                if (tab.type === 'AUDIT_LOG') {
                  setActiveRoleCategory('AUDIT_LOG');
                } else {
                  setActiveRoleCategory('EMPLOYEE');
                  setSelectedEmployeeId(tab.id);
                  setInspectedTaskId(null);
                }
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '12px',
                fontSize: '0.82rem',
                fontWeight: isActive ? 700 : 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                backgroundColor: isActive ? 'var(--primary)' : 'var(--bg-card)',
                color: isActive ? '#ffffff' : 'var(--text-main)',
                border: isActive ? '1px solid var(--primary)' : '1px solid var(--border)',
                boxShadow: isActive ? '0 4px 12px rgba(59, 130, 246, 0.35)' : 'none'
              }}
            >
              <span style={{ fontSize: '1.05rem' }}>{tab.avatar}</span>
              <span>{tab.label}</span>
              <span style={{ fontSize: '0.74rem', opacity: isActive ? 0.9 : 0.65 }}>({tab.roleName})</span>
              {tab.pendingCount > 0 && (
                <span
                  style={{
                    padding: '2px 7px',
                    borderRadius: '9999px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.25)' : 'rgba(245, 158, 11, 0.2)',
                    color: isActive ? '#ffffff' : '#f59e0b',
                    marginLeft: '4px'
                  }}
                >
                  {tab.pendingCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          3. AUDIT LOG TAB VIEW (IF SELECTED)
         ========================================================================= */}
      {activeRoleCategory === 'AUDIT_LOG' ? (
        <div className="crm-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                Global Autonomous Shift Execution Audit Trail
              </h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Full transparent timeline of every customer interaction, CRM mutation, and tool executed by your AI fleet today.
              </p>
            </div>
            <span className="badge badge-primary">{aiExecutionLog.length} Shift Events Logged</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {aiExecutionLog.map((log) => (
              <div
                key={log.id}
                style={{
                  padding: '16px 20px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        backgroundColor: 'var(--primary)',
                        color: '#ffffff'
                      }}
                    >
                      {log.agentName}
                    </span>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{log.taskTitle}</strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>• {log.clientName}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '0.74rem', color: '#10b981', fontWeight: 700 }}>{log.impact}</span>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{log.completedAt} ({log.durationMs}ms)</span>
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', padding: '6px 10px', backgroundColor: 'var(--bg-main)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                  <strong>CRM Mutation:</strong> {log.crmRecordUpdated}
                </div>

                {log.reasoningTrace && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginTop: '4px' }}>
                    {log.reasoningTrace.map((tr, idx) => (
                      <div key={idx} style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{tr.step}:</span> {tr.detail}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* =========================================================================
            4. ACTIVE EMPLOYEE WORKSTATION VIEW
           ========================================================================= */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* EMPLOYEE PROFILE & SHIFT CONTROL CARD */}
          <div
            className="crm-card"
            style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              borderLeft: `5px solid ${selectedEmployee.color}`
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: '16px',
                    backgroundColor: selectedEmployee.accentLight,
                    border: `1px solid ${selectedEmployee.color}40`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.9rem',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  {selectedEmployee.avatar}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                      {selectedEmployee.name}
                    </h2>
                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        backgroundColor: selectedEmployee.status === 'ON_DUTY' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: selectedEmployee.status === 'ON_DUTY' ? '#10b981' : '#ef4444',
                        border: selectedEmployee.status === 'ON_DUTY' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)'
                      }}
                    >
                      {selectedEmployee.status === 'ON_DUTY' ? '🟢 On Duty (Active Shift)' : '🔴 On Break'}
                    </span>
                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        backgroundColor: 'var(--bg-surface)',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border)'
                      }}
                    >
                      {selectedEmployee.department}
                    </span>
                  </div>

                  <p style={{ margin: '4px 0 0 0', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                    {selectedEmployee.role} • <strong>{selectedEmployee.experienceYears}</strong>
                  </p>
                </div>
              </div>

              {/* Employee Shift Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => toggleEmployeeShift(selectedEmployee.id)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    backgroundColor: selectedEmployee.status === 'ON_DUTY' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.15)',
                    color: selectedEmployee.status === 'ON_DUTY' ? '#ef4444' : '#10b981',
                    border: selectedEmployee.status === 'ON_DUTY' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)'
                  }}
                >
                  {selectedEmployee.status === 'ON_DUTY' ? 'Take Lunch / Rest Break' : 'Resume Shift'}
                </button>

                <button
                  type="button"
                  onClick={() => toggleEmployeeAutoPilot(selectedEmployee.id)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    backgroundColor: selectedEmployee.isAutoPilotActive ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-surface)',
                    color: selectedEmployee.isAutoPilotActive ? '#3b82f6' : 'var(--text-secondary)',
                    border: '1px solid var(--border)'
                  }}
                >
                  {selectedEmployee.isAutoPilotActive ? '⚡ Auto-Pilot Active' : '⏸️ Auto-Pilot Paused'}
                </button>
              </div>
            </div>

            {/* Performance KPIs for this Employee */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '12px',
                padding: '14px 18px',
                borderRadius: '12px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)'
              }}
            >
              <div>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700 }}>
                  Tasks Completed Today
                </span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                  {selectedEmployee.tasksCompletedToday}
                </div>
                <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>100% SLA Attainment</span>
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700 }}>
                  Model Accuracy Score
                </span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981', marginTop: '2px' }}>
                  {selectedEmployee.accuracyScore}
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Based on human verification</span>
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700 }}>
                  Response & Turnaround
                </span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#3b82f6', marginTop: '2px' }}>
                  {selectedEmployee.avgResponseSpeed}
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Sub-second latency</span>
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700 }}>
                  Pipeline Value Created
                </span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b', marginTop: '2px' }}>
                  {selectedEmployee.pipelineGeneratedToday}
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Direct commercial contribution</span>
              </div>
            </div>

            {/* Bio & Guardrails Banner */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                {selectedEmployee.bio}
              </p>

              {/* Guardrails Pill Row */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', alignSelf: 'center', marginRight: '4px' }}>
                  Operational Guardrails:
                </span>
                {selectedEmployee.guardrails.map((gd, i) => (
                  <span
                    key={i}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      backgroundColor: 'rgba(5, 150, 105, 0.08)',
                      color: '#059669',
                      border: '1px solid rgba(5, 150, 105, 0.2)'
                    }}
                  >
                    🛡️ {gd}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* =========================================================================
              5. SPLIT WORKBENCH: LEFT (TASK QUEUE) & RIGHT (LIVE EXECUTION TERMINAL)
             ========================================================================= */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
            {/* LEFT COLUMN: ACTIVE WORK TASK QUEUE */}
            <div className="crm-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Briefcase size={18} style={{ color: selectedEmployee.color }} />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                    Active Work Queue ({pendingTasks.length} Pending)
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setAssignForm(prev => ({
                      ...prev,
                      agentId: selectedEmployee.id,
                      type: selectedEmployee.roleCategory === 'SALES_SDR' ? 'LEAD_QUALIFICATION' : 'FOLLOW_UP_OUTBOUND'
                    }));
                    setShowAssignModal(true);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '5px 10px',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--primary)',
                    border: '1px solid var(--border)',
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={13} />
                  <span>Add Task</span>
                </button>
              </div>

              {pendingTasks.length === 0 ? (
                <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <CheckCircle2 size={36} style={{ color: '#10b981', margin: '0 auto 10px auto' }} />
                  <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>All Work Tasks Completed!</div>
                  <p style={{ margin: '4px 0 12px 0', fontSize: '0.8rem' }}>
                    {selectedEmployee.name} has cleared their queue. Use "Reset Demo Queue" or assign a new custom assignment above.
                  </p>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={resetDemoWorkQueue}
                  >
                    <RotateCcw size={14} /> Refill Demo Tasks
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '580px', overflowY: 'auto' }}>
                  {pendingTasks.map((task) => {
                    const isExecuting = activeExecutingTaskId === task.id;
                    const isInspected = activeTask?.id === task.id;

                    return (
                      <div
                        key={task.id}
                        style={{
                          padding: '16px',
                          borderRadius: '12px',
                          backgroundColor: isInspected ? 'var(--bg-main)' : 'var(--bg-surface)',
                          border: isInspected ? `2px solid ${selectedEmployee.color}` : '1px solid var(--border)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                          boxShadow: 'var(--shadow-sm)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {/* Task Header */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                              <span
                                style={{
                                  fontSize: '0.68rem',
                                  padding: '2px 8px',
                                  borderRadius: '9999px',
                                  fontWeight: 700,
                                  backgroundColor: task.priority === 'URGENT' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                  color: task.priority === 'URGENT' ? '#ef4444' : '#f59e0b',
                                  border: task.priority === 'URGENT' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)'
                                }}
                              >
                                {task.priority}
                              </span>
                              <span
                                style={{
                                  fontSize: '0.68rem',
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  backgroundColor: 'var(--bg-card)',
                                  color: 'var(--text-secondary)',
                                  border: '1px solid var(--border)'
                                }}
                              >
                                {task.channel}
                              </span>
                            </div>
                            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                              {task.title}
                            </h4>
                          </div>

                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#10b981', whiteSpace: 'nowrap' }}>
                            {task.estimatedImpact}
                          </span>
                        </div>

                        {/* Customer & Details */}
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                          <strong style={{ color: 'var(--text-main)' }}>{task.clientName}</strong> ({task.clientCompany})
                          <p style={{ margin: '4px 0 0 0', color: 'var(--text-main)', opacity: 0.9 }}>
                            {task.details}
                          </p>
                        </div>

                        {/* Suggested Action Note */}
                        <div
                          style={{
                            padding: '8px 10px',
                            borderRadius: '8px',
                            backgroundColor: 'var(--bg-card)',
                            border: '1px dashed var(--border)',
                            fontSize: '0.72rem',
                            color: 'var(--text-secondary)'
                          }}
                        >
                          <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>Plan:</span> {task.suggestedAction}
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', paddingTop: '4px' }}>
                          <button
                            type="button"
                            onClick={() => setInspectedTaskId(task.id)}
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              color: 'var(--primary)',
                              border: 'none',
                              background: 'transparent',
                              cursor: 'pointer'
                            }}
                          >
                            Inspect Reasoning Context →
                          </button>

                          <button
                            type="button"
                            disabled={isExecuting}
                            onClick={() => executeEmployeeTask(task.id)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '7px 14px',
                              borderRadius: '8px',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                              backgroundColor: isExecuting ? '#64748b' : selectedEmployee.color,
                              color: '#ffffff',
                              border: 'none',
                              cursor: isExecuting ? 'not-allowed' : 'pointer',
                              boxShadow: 'var(--shadow-sm)',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {isExecuting ? (
                              <>
                                <span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} />
                                <span>Executing Work...</span>
                              </>
                            ) : (
                              <>
                                <Zap size={14} />
                                <span>⚡ Execute Task Now</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: LIVE REASONING & WORK TERMINAL */}
            <div className="crm-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Terminal size={18} style={{ color: '#10b981' }} />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                    Live Autonomous Work Terminal
                  </h3>
                </div>

                <span
                  style={{
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    fontWeight: 700,
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    color: '#10b981',
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                  }}
                >
                  🟢 Live Engine Output
                </span>
              </div>

              {/* Terminal Screen Box */}
              <div
                style={{
                  borderRadius: '12px',
                  backgroundColor: '#090d16',
                  border: '1px solid #1e293b',
                  padding: '16px 18px',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  fontSize: '0.76rem',
                  lineHeight: 1.6,
                  color: '#e2e8f0',
                  minHeight: '260px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.6)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '8px' }}>
                  <span style={{ color: '#94a3b8' }}>
                    AGENT: <strong style={{ color: '#38bdf8' }}>{selectedEmployee.name.toUpperCase()}</strong> [{selectedEmployee.modelMesh}]
                  </span>
                  <span style={{ color: '#10b981' }}>STATUS: 200% VELOCITY</span>
                </div>

                {activeTask ? (
                  <>
                    <div style={{ color: '#fbbf24' }}>
                      &gt; [ASSIGNMENT] {activeTask.title}
                    </div>
                    <div style={{ color: '#94a3b8' }}>
                      &gt; [CLIENT] {activeTask.clientName} ({activeTask.clientCompany}) • Channel: {activeTask.channel}
                    </div>
                    <div style={{ color: '#cbd5e1' }}>
                      &gt; [INBOUND CONTEXT] {activeTask.details}
                    </div>

                    <div style={{ margin: '4px 0', borderTop: '1px dashed #334155', paddingTop: '6px' }}>
                      <div style={{ color: '#34d399' }}>
                        ✔ [REASONING & GUARDRAILS]
                      </div>
                      <div style={{ paddingLeft: '12px', color: '#94a3b8' }}>
                        • Authority Check: Verified enterprise decision-maker requirements.<br />
                        • Privacy Check: Encrypted contact payload under SOC2 Isolation.<br />
                        • Policy Check: Response scheduled inside approved SLA window.
                      </div>
                    </div>

                    <div style={{ color: '#60a5fa' }}>
                      &gt; [ACTION EXECUTED] {activeTask.suggestedAction}
                    </div>

                    {activeTask.status === 'COMPLETED' ? (
                      <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid #059669', padding: '8px 12px', borderRadius: '6px', color: '#34d399', fontWeight: 700 }}>
                        ✔ WORK COMPLETE: Records synchronized with CRM Leads, Deals & Timeline.
                      </div>
                    ) : (
                      <div style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>⚡ Ready for execution. Click "Execute Task Now" on the left.</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ color: '#64748b', textAlign: 'center', margin: 'auto' }}>
                    Select a task from the active queue to view live model thoughts and tool outputs.
                  </div>
                )}
              </div>

              {/* Completed Shift Tasks for this Employee */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h4 style={{ fontSize: '0.84rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                    Completed During This Shift ({completedTasks.length})
                  </h4>
                  <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>100% Quality Score</span>
                </div>

                {completedTasks.length === 0 ? (
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', padding: '12px', textAlign: 'center' }}>
                    No completed tasks recorded yet for this session.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                    {completedTasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => setInspectedTaskId(t.id)}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '8px',
                          backgroundColor: 'var(--bg-surface)',
                          border: '1px solid var(--border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '10px',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <CheckCircle2 size={15} style={{ color: '#10b981', flexShrink: 0 }} />
                          <div>
                            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)' }}>{t.title}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{t.clientName} • {t.completedAt || 'Just now'}</div>
                          </div>
                        </div>

                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#10b981' }}>
                          {t.estimatedImpact}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          6. MODAL: ASSIGN CUSTOM WORK TO AI EMPLOYEE
         ========================================================================= */}
      {showAssignModal && (
        <div className="modal-backdrop" onClick={() => setShowAssignModal(false)}>
          <div className="crm-modal" style={{ maxWidth: '580px', width: '95%' }} onClick={(e) => e.stopPropagation()}>
            <div className="crm-modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Briefcase size={20} style={{ color: 'var(--primary)' }} />
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                    Assign Autonomous Task to AI Employee
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                    Dispatch a real-world commercial assignment directly into the employee's active work queue.
                  </p>
                </div>
              </div>
              <button type="button" className="btn-close" onClick={() => setShowAssignModal(false)} aria-label="Close">
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignSubmit}>
              <div className="crm-modal-body" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: 'calc(85vh - 120px)', overflowY: 'auto' }}>
                {/* Select AI Employee */}
                <div>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px' }}>Assignee Employee *</label>
                  <select
                    className="form-control"
                    value={assignForm.agentId}
                    onChange={(e) => setAssignForm(prev => ({ ...prev, agentId: e.target.value }))}
                  >
                    {aiEmployeesList.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} — {emp.role}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Task Title */}
                <div>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px' }}>Task Assignment Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Qualify enterprise lead: ACME Healthcare (50 seats)"
                    value={assignForm.title}
                    onChange={(e) => setAssignForm(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>

                {/* Client & Company */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  <div>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px' }}>Customer / Lead Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Ramesh Patel"
                      value={assignForm.clientName}
                      onChange={(e) => setAssignForm(prev => ({ ...prev, clientName: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px' }}>Company Organization</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Patel Healthcare Ltd"
                      value={assignForm.clientCompany}
                      onChange={(e) => setAssignForm(prev => ({ ...prev, clientCompany: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Channel & Priority */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  <div>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px' }}>Communication Channel</label>
                    <select
                      className="form-control"
                      value={assignForm.channel}
                      onChange={(e) => setAssignForm(prev => ({ ...prev, channel: e.target.value }))}
                    >
                      <option value="WhatsApp & Email">WhatsApp & Email</option>
                      <option value="Website Live Chat">Website Live Chat</option>
                      <option value="Support Portal">Support Portal</option>
                      <option value="Calendar Booking">Calendar Booking</option>
                      <option value="SMS / Direct Phone">SMS / Direct Phone</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px' }}>Urgency Priority</label>
                    <select
                      className="form-control"
                      value={assignForm.priority}
                      onChange={(e) => setAssignForm(prev => ({ ...prev, priority: e.target.value }))}
                    >
                      <option value="URGENT">URGENT (Execute within 5m)</option>
                      <option value="HIGH">HIGH (Execute within 30m)</option>
                      <option value="MEDIUM">MEDIUM (Standard Queue)</option>
                    </select>
                  </div>
                </div>

                {/* Specific Instructions / Details */}
                <div>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px' }}>Task Instructions & Context *</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Provide specific details, commercial parameters, budget numbers, or problem descriptions for the AI employee..."
                    value={assignForm.details}
                    onChange={(e) => setAssignForm(prev => ({ ...prev, details: e.target.value }))}
                    required
                  />
                </div>

                {/* Expected Suggested Action */}
                <div>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px' }}>Expected Autonomous Action</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Verify BANT budget, calculate quote, and update CRM stage to Proposal"
                    value={assignForm.suggestedAction}
                    onChange={(e) => setAssignForm(prev => ({ ...prev, suggestedAction: e.target.value }))}
                  />
                </div>
              </div>

              <div className="crm-modal-footer" style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Plus size={16} /> Assign to Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

