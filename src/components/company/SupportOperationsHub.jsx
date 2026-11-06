import React, { useState, useEffect } from 'react';
import { useCRM } from '../../context/CRMContext';
import { softwareService } from '../../services/softwareService';
import { FormDialog } from '../common/FormDialog';
import { StatusBadge } from '../common/StatusBadge';
import {
  Headphones,
  LifeBuoy,
  Users,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Bot,
  Send,
  Building,
  RefreshCw,
  Plus,
  BookOpen,
  FileText,
  BarChart3,
  Lock,
  MessageSquare,
  ShieldAlert,
  HelpCircle,
  Eye,
  Check,
  X
} from 'lucide-react';

export function SupportOperationsHub({ defaultRole = 'SUPPORT_MANAGER' }) {
  const { addNotification } = useCRM();

  const [activeRole, setActiveRole] = useState(defaultRole); // SUPPORT_MANAGER or SUPPORT_AGENT
  const [activeTab, setActiveTab] = useState('tickets'); // tickets, knowledge, ai_assist, escalations, reports
  const [dashboard, setDashboard] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [agents, setAgents] = useState([]);
  const [knowledgeSources, setKnowledgeSources] = useState([]);
  const [escalations, setEscalations] = useState([]);
  const [slaReport, setSlaReport] = useState(null);
  const [csatReport, setCsatReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // New Message State
  const [replyBody, setReplyBody] = useState('');
  const [replyType, setReplyType] = useState('PUBLIC_REPLY'); // PUBLIC_REPLY or INTERNAL_NOTE
  const [isSending, setIsSending] = useState(false);

  // Knowledge Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // AI Assist State
  const [aiPrompt, setAiPrompt] = useState('What troubleshooting steps should I check for a portal login failure?');
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Modals
  const [showCreateTicketModal, setShowCreateTicketModal] = useState(false);
  const [newSubj, setNewSubj] = useState('');
  const [newCust, setNewCust] = useState('Ravi Kumar');
  const [newCat, setNewCat] = useState('AUTHENTICATION');
  const [newPrio, setNewPrio] = useState('HIGH');
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => {
    loadData();
  }, [activeRole]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [dash, tktList, agentList, kbList, escList, sla, csat] = await Promise.all([
        softwareService.getDashboardSummary({ department: 'SUPPORT', role: activeRole }),
        softwareService.getTickets(activeRole === 'SUPPORT_AGENT' ? { assignee: 'me' } : {}),
        softwareService.getSupportAgents(),
        softwareService.getKnowledgeSources(),
        softwareService.getEscalations(),
        softwareService.getSlaReport(),
        softwareService.getCsatReport()
      ]);

      setDashboard(dash);
      setTickets(tktList);
      setAgents(agentList);
      setKnowledgeSources(kbList);
      setEscalations(escList);
      setSlaReport(sla);
      setCsatReport(csat);

      if (tktList.length > 0 && !selectedTicket) {
        selectTicket(tktList[0]);
      }
    } catch (err) {
      console.error('Failed to load support data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const selectTicket = async (tkt) => {
    setSelectedTicket(tkt);
    try {
      const msgs = await softwareService.getTicketMessages(tkt.ticketId);
      setMessages(msgs);
    } catch (err) {
      setMessages([]);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedTicket || !replyBody.trim()) return;
    setIsSending(true);
    try {
      await softwareService.addTicketMessage(selectedTicket.ticketId, replyType, replyBody);
      addNotification?.({
        type: 'success',
        title: replyType === 'INTERNAL_NOTE' ? 'Internal Note Added' : 'Customer Reply Dispatched',
        message: replyType === 'INTERNAL_NOTE' ? 'Private to support team' : 'Accepted for delivery to customer portal'
      });
      setReplyBody('');
      const updatedMsgs = await softwareService.getTicketMessages(selectedTicket.ticketId);
      setMessages(updatedMsgs);
    } catch (err) {
      addNotification?.({ type: 'error', title: 'Failed to send message', message: err.message });
    } finally {
      setIsSending(false);
    }
  };

  const handleResolveTicket = async () => {
    if (!selectedTicket) return;
    try {
      await softwareService.resolveTicket(selectedTicket.ticketId, 'Resolved with verified customer solution.');
      addNotification?.({ type: 'success', title: 'Ticket Resolved', message: `Ticket ${selectedTicket.ticketId} closed.` });
      loadData();
    } catch (err) {
      addNotification?.({ type: 'error', title: 'Error', message: err.message });
    }
  };

  const handleEscalateTicket = async () => {
    if (!selectedTicket) return;
    try {
      await softwareService.escalateTicket(selectedTicket.ticketId, {
        severity: 'HIGH',
        reason: 'TECHNICAL_COMPLEXITY',
        description: 'Issue persists after standard troubleshooting guide (KB-ART-001).'
      });
      addNotification?.({ type: 'warning', title: 'Ticket Escalated', message: `Ticket ${selectedTicket.ticketId} marked ESCALATED.` });
      loadData();
    } catch (err) {
      addNotification?.({ type: 'error', title: 'Error', message: err.message });
    }
  };

  const handleSearchKnowledge = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await softwareService.searchKnowledge(searchQuery);
      setSearchResults(res?.results || []);
    } catch (err) {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAiTroubleshoot = async () => {
    if (!selectedTicket) return;
    setIsAiLoading(true);
    try {
      const res = await softwareService.supportAssist(selectedTicket.ticketId, 'SUGGEST_TROUBLESHOOTING', aiPrompt);
      setAiSuggestions(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      await softwareService.createTicket({
        subject: newSubj,
        customerName: newCust,
        category: newCat,
        priority: newPrio,
        description: newDesc,
        source: 'PORTAL'
      });
      addNotification?.({ type: 'success', title: 'Ticket Created', message: 'New support ticket logged.' });
      setShowCreateTicketModal(false);
      setNewSubj('');
      setNewDesc('');
      loadData();
    } catch (err) {
      addNotification?.({ type: 'error', title: 'Error', message: err.message });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', paddingBottom: '48px', color: 'var(--text-main)' }}>
      {/* =========================================================================
          HEADER BANNER
         ========================================================================= */}
      <div
        style={{
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #090e1a 0%, #171c2f 50%, #1e1b4b 100%)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          padding: '24px 28px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.45)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '18px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: 'rgba(245, 158, 11, 0.18)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              color: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Headphones size={26} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>
                Software Support Operations Desk
              </h1>
              <span
                style={{
                  fontSize: '0.72rem',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  fontWeight: 700,
                  backgroundColor: 'rgba(245, 158, 11, 0.2)',
                  color: '#fbbf24',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  letterSpacing: '0.02em'
                }}
              >
                {activeRole === 'SUPPORT_MANAGER' ? 'Support Manager' : 'Support Agent Workspace'}
              </span>
            </div>
            <p style={{ margin: '5px 0 0 0', fontSize: '0.84rem', color: '#94a3b8' }}>
              Target SLA: 30m First Response • 8h Full Resolution • Tenant: TEN-IT-001
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Mode Switcher */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              padding: '4px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <button
              type="button"
              onClick={() => setActiveRole('SUPPORT_MANAGER')}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                backgroundColor: activeRole === 'SUPPORT_MANAGER' ? '#f59e0b' : 'rgba(255, 255, 255, 0.08)',
                color: activeRole === 'SUPPORT_MANAGER' ? '#000000' : '#ffffff'
              }}
            >
              Manager Mode
            </button>
            <button
              type="button"
              onClick={() => setActiveRole('SUPPORT_AGENT')}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                backgroundColor: activeRole === 'SUPPORT_AGENT' ? '#f59e0b' : 'rgba(255, 255, 255, 0.08)',
                color: activeRole === 'SUPPORT_AGENT' ? '#000000' : '#ffffff'
              }}
            >
              Agent Mode
            </button>
          </div>

          {/* Create Ticket Button */}
          <button
            type="button"
            onClick={() => setShowCreateTicketModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 18px',
              borderRadius: '10px',
              fontSize: '0.84rem',
              fontWeight: 700,
              backgroundColor: '#d97706',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(217, 119, 6, 0.35)',
              transition: 'all 0.15s ease'
            }}
          >
            <Plus size={16} />
            <span>Create Ticket</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB NAVIGATION ROW
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
          { id: 'tickets', label: activeRole === 'SUPPORT_MANAGER' ? 'All Support Tickets' : 'My Assigned Tickets', icon: LifeBuoy },
          { id: 'knowledge', label: 'Knowledge Base Search', icon: BookOpen },
          { id: 'ai_assist', label: 'AI Troubleshooting Assist', icon: Bot },
          { id: 'escalations', label: 'Escalations Queue', icon: AlertTriangle },
          { id: 'reports', label: 'SLA & CSAT Metrics', icon: BarChart3 }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: isActive ? 700 : 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                backgroundColor: isActive ? '#f59e0b' : 'var(--bg-card)',
                color: isActive ? '#000000' : 'var(--text-main)',
                border: isActive ? '1px solid #f59e0b' : '1px solid var(--border)',
                boxShadow: isActive ? '0 4px 12px rgba(245, 158, 11, 0.3)' : 'none'
              }}
            >
              <Icon size={16} style={{ color: isActive ? '#000000' : 'var(--primary)' }} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          KPI CARDS
         ========================================================================= */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px'
        }}
      >
        {/* KPI 1 */}
        <div
          style={{
            padding: '16px 20px',
            borderRadius: '14px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <span style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>
            {activeRole === 'SUPPORT_MANAGER' ? 'Total Open Tickets' : 'My Active Queue'}
          </span>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, marginTop: '6px', color: 'var(--text-main)' }}>
            {activeRole === 'SUPPORT_MANAGER' ? (dashboard?.totalOpenTickets || 156) : (dashboard?.myOpenTickets || 18)}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#f59e0b', marginTop: '4px', fontWeight: 600 }}>
            {dashboard?.newTicketsToday || 24} new cases logged today
          </div>
        </div>

        {/* KPI 2 */}
        <div
          style={{
            padding: '16px 20px',
            borderRadius: '14px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <span style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>
            SLA Compliance
          </span>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, marginTop: '6px', color: '#10b981' }}>
            {dashboard?.slaCompliancePercent || 94.5}%
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Avg First Response: <strong style={{ color: 'var(--text-main)' }}>{dashboard?.averageFirstResponseMinutes || 18} mins</strong>
          </div>
        </div>

        {/* KPI 3 */}
        <div
          style={{
            padding: '16px 20px',
            borderRadius: '14px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <span style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>
            Escalated Tickets
          </span>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, marginTop: '6px', color: '#ef4444' }}>
            {dashboard?.escalatedTickets || escalations.length || 8}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            High severity engineering triage
          </div>
        </div>

        {/* KPI 4 */}
        <div
          style={{
            padding: '16px 20px',
            borderRadius: '14px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <span style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>
            Customer Satisfaction (CSAT)
          </span>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, marginTop: '6px', color: 'var(--text-main)' }}>
            {dashboard?.customerSatisfactionPercent || 91.2}%
          </div>
          <div style={{ fontSize: '0.78rem', color: '#10b981', marginTop: '4px', fontWeight: 600 }}>
            From 340 customer post-resolution surveys
          </div>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: TICKETS & CONVERSATION MESSAGES
         ========================================================================= */}
      {activeTab === 'tickets' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 38%) minmax(0, 62%)',
            gap: '20px',
            alignItems: 'start'
          }}
        >
          {/* Ticket List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                Active Support Cases
              </h3>
              <span className="badge" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
                {tickets.length} Cases
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {tickets.map((tkt) => {
                const isSelected = selectedTicket?.ticketId === tkt.ticketId;
                return (
                  <div
                    key={tkt.ticketId}
                    onClick={() => selectTicket(tkt)}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      backgroundColor: isSelected ? 'rgba(245, 158, 11, 0.08)' : 'var(--bg-card)',
                      border: isSelected ? '2px solid #f59e0b' : '1px solid var(--border)',
                      boxShadow: isSelected ? '0 4px 14px rgba(245, 158, 11, 0.2)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 800, color: '#f59e0b' }}>
                        {tkt.ticketId}
                      </span>
                      <StatusBadge status={tkt.status} />
                    </div>

                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 4px 0', lineHeight: 1.3 }}>
                      {tkt.subject}
                    </h4>

                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                      {tkt.customerName} <span style={{ color: 'var(--text-muted)' }}>({tkt.category})</span>
                    </p>

                    <div
                      style={{
                        marginTop: '10px',
                        paddingTop: '8px',
                        borderTop: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.74rem'
                      }}
                    >
                      <span style={{ color: '#ef4444', fontWeight: 700 }}>{tkt.priority} Priority</span>
                      <span style={{ color: 'var(--text-muted)' }}>
                        SLA: {new Date(tkt.slaDueAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ticket Details & Message Composer */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '22px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              minHeight: '540px',
              justifyContent: 'space-between'
            }}
          >
            {selectedTicket ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', height: '100%' }}>
                {/* Header */}
                <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 800, color: 'var(--text-muted)' }}>
                      {selectedTicket.ticketId}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={handleResolveTicket}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          backgroundColor: '#10b981',
                          color: '#ffffff',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Check size={14} /> Resolve Case
                      </button>
                      <button
                        type="button"
                        onClick={handleEscalateTicket}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          backgroundColor: '#ef4444',
                          color: '#ffffff',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <AlertTriangle size={14} /> Escalate
                      </button>
                    </div>
                  </div>

                  <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: '8px 0 4px 0' }}>
                    {selectedTicket.subject}
                  </h2>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Customer: <strong style={{ color: 'var(--text-main)' }}>{selectedTicket.customerName}</strong> • Assigned: <span style={{ color: '#38bdf8', fontWeight: 600 }}>{selectedTicket.assignedTo}</span>
                  </p>
                </div>

                {/* Message Stream */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
                  {messages.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem', fontStyle: 'italic' }}>
                      No messages recorded yet for this case.
                    </div>
                  ) : (
                    messages.map((m) => {
                      const isInternal = m.messageType === 'INTERNAL_NOTE';
                      return (
                        <div
                          key={m.messageId}
                          style={{
                            padding: '12px 14px',
                            borderRadius: '10px',
                            backgroundColor: isInternal ? 'rgba(245, 158, 11, 0.12)' : 'var(--bg-surface)',
                            border: isInternal ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid var(--border)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: isInternal ? '#fbbf24' : '#38bdf8' }}>
                              {isInternal ? <Lock size={13} /> : <MessageSquare size={13} />}
                              {isInternal ? 'INTERNAL NOTE (Private to Support)' : 'PUBLIC CUSTOMER REPLY'}
                            </span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 400 }}>
                              {new Date(m.createdAt || Date.now()).toLocaleTimeString()}
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: '0.84rem', lineHeight: 1.5, color: 'var(--text-main)', whiteSpace: 'pre-wrap' }}>
                            {m.body}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Reply Form */}
                <form onSubmit={handleSendMessage} style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '14px', borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => setReplyType('PUBLIC_REPLY')}
                        style={{
                          padding: '5px 12px',
                          borderRadius: '8px',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          backgroundColor: replyType === 'PUBLIC_REPLY' ? '#2563eb' : 'var(--bg-surface)',
                          color: replyType === 'PUBLIC_REPLY' ? '#ffffff' : 'var(--text-secondary)',
                          border: replyType === 'PUBLIC_REPLY' ? '1px solid #2563eb' : '1px solid var(--border)'
                        }}
                      >
                        Public Reply
                      </button>
                      <button
                        type="button"
                        onClick={() => setReplyType('INTERNAL_NOTE')}
                        style={{
                          padding: '5px 12px',
                          borderRadius: '8px',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          backgroundColor: replyType === 'INTERNAL_NOTE' ? '#f59e0b' : 'var(--bg-surface)',
                          color: replyType === 'INTERNAL_NOTE' ? '#000000' : 'var(--text-secondary)',
                          border: replyType === 'INTERNAL_NOTE' ? '1px solid #f59e0b' : '1px solid var(--border)'
                        }}
                      >
                        Internal Note
                      </button>
                    </div>
                  </div>

                  <textarea
                    rows={3}
                    required
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    placeholder={replyType === 'INTERNAL_NOTE' ? 'Enter private engineering or diagnostic notes (internal team only)...' : 'Type reply message to dispatch to customer...'}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--bg-surface)',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem',
                      outline: 'none',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                      lineHeight: 1.5
                    }}
                  />

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="submit"
                      disabled={isSending}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 18px',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        backgroundColor: '#f59e0b',
                        color: '#000000',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Send size={14} />
                      <span>{isSending ? 'Sending...' : replyType === 'INTERNAL_NOTE' ? 'Post Internal Note' : 'Send Customer Reply'}</span>
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Select a ticket from the left column to inspect conversation timeline.
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: KNOWLEDGE BASE SEARCH
         ========================================================================= */}
      {activeTab === 'knowledge' && (
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 4px 0' }}>
            Approved Support Documentation Search
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: '0 0 18px 0' }}>
            Semantic vector lookup of indexed SAML, SSO, API guides, and troubleshooting runbooks
          </p>

          <form onSubmit={handleSearchKnowledge} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search troubleshooting guides (e.g. customer portal login)..."
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-main)',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={isSearching}
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                backgroundColor: '#f59e0b',
                color: '#000000',
                fontWeight: 700,
                fontSize: '0.85rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </form>

          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {searchResults.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Type a query above to search internal verified troubleshooting runbooks.
              </div>
            ) : (
              searchResults.map((art) => (
                <div
                  key={art.articleId}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                      {art.title}
                    </h4>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981' }}>
                      Relevance: {(art.relevanceScore * 100).toFixed(0)}%
                    </span>
                  </div>

                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '6px 0 0 0', lineHeight: 1.5 }}>
                    {art.summary}
                  </p>

                  <div
                    style={{
                      marginTop: '10px',
                      backgroundColor: 'var(--bg-card)',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      fontFamily: 'monospace',
                      fontSize: '0.78rem',
                      color: 'var(--text-main)',
                      lineHeight: 1.5
                    }}
                  >
                    {art.content}
                  </div>

                  <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setReplyBody(art.content);
                        setActiveTab('tickets');
                        addNotification?.({ type: 'info', title: 'Article Copied', message: 'Article text inserted into response composer.' });
                      }}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        backgroundColor: 'rgba(245, 158, 11, 0.18)',
                        color: '#fbbf24',
                        border: '1px solid rgba(245, 158, 11, 0.35)',
                        cursor: 'pointer'
                      }}
                    >
                      Use as Basis for Reply →
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: AI TROUBLESHOOTING ASSISTANT
         ========================================================================= */}
      {activeTab === 'ai_assist' && (
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bot size={22} style={{ color: '#f59e0b' }} />
            AI Support Diagnostic Assistant
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: '0 0 18px 0' }}>
            Synthesizes error messages with verified support knowledge base to output safe, citeable resolution steps.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
              Diagnostic Query
            </label>
            <textarea
              rows={3}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-main)',
                fontSize: '0.85rem',
                outline: 'none',
                boxSizing: 'border-box',
                lineHeight: 1.5
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <button
                type="button"
                onClick={handleAiTroubleshoot}
                disabled={isAiLoading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  backgroundColor: '#f59e0b',
                  color: '#000000',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                }}
              >
                <Sparkles size={16} />
                <span>{isAiLoading ? 'Analyzing System Runbooks...' : 'Generate Troubleshooting Checklist'}</span>
              </button>
            </div>
          </div>

          {aiSuggestions && (
            <div
              style={{
                marginTop: '22px',
                padding: '18px',
                borderRadius: '12px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} />
                Validated Runbook Steps (Citations: {aiSuggestions.sourceArticleIds?.join(', ') || 'KB-ART-001'})
              </span>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {aiSuggestions.suggestions?.map((s, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.84rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                    <span
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(245, 158, 11, 0.2)',
                        color: '#f59e0b',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.72rem',
                        flexShrink: 0,
                        marginTop: '2px'
                      }}
                    >
                      {idx + 1}
                    </span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 4: ESCALATIONS QUEUE
         ========================================================================= */}
      {activeTab === 'escalations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            Active Tier-2 Engineering Escalations
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {escalations.map((esc) => (
              <div
                key={esc.escalationId}
                style={{
                  padding: '16px 20px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div>
                  <span style={{ fontSize: '0.74rem', fontFamily: 'monospace', fontWeight: 800, color: '#ef4444' }}>
                    {esc.escalationId}
                  </span>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', margin: '3px 0 2px 0' }}>
                    {esc.reason || 'CUSTOMER_IMPACT'}
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                    {esc.description || 'Multiple users experiencing login failures'}
                  </p>
                </div>
                <StatusBadge status={esc.status || 'ESCALATED'} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: REPORTS & CSAT
         ========================================================================= */}
      {activeTab === 'reports' && (
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 4px 0' }}>
            SLA Priority Compliance Breakdown
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: '0 0 20px 0' }}>
            First response and resolution deadlines by ticket severity
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
            {slaReport?.byPriority?.map((p) => (
              <div
                key={p.priority}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border)'
                }}
              >
                <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                  {p.priority} PRIORITY
                </span>
                <p style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: '6px 0 2px 0' }}>
                  {p.totalTickets - p.breachedTickets} / {p.totalTickets} Compliant
                </p>
                <p style={{ fontSize: '0.76rem', color: '#ef4444', margin: 0, fontWeight: 600 }}>
                  {p.breachedTickets} SLA Breaches
                </p>
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '10px' }}>
            Customer Satisfaction Rating (CSAT: {csatReport?.csatScore || 91.2}%)
          </h3>
          <div
            style={{
              padding: '16px 20px',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.84rem',
              color: 'var(--text-main)',
              flexWrap: 'wrap',
              gap: '10px'
            }}
          >
            <span>⭐⭐⭐⭐⭐ 5-Star: <strong>{csatReport?.fiveStarRatings || 280}</strong></span>
            <span>⭐⭐⭐⭐ 4-Star: <strong>{csatReport?.fourStarRatings || 45}</strong></span>
            <span>⭐⭐⭐ 3-Star or Less: <strong style={{ color: '#ef4444' }}>{csatReport?.threeStarOrLess || 15}</strong></span>
          </div>
        </div>
      )}

      {/* =========================================================================
          CREATE TICKET MODAL
         ========================================================================= */}
      <FormDialog
        isOpen={showCreateTicketModal}
        onClose={() => setShowCreateTicketModal(false)}
        title="Log Support Ticket"
        onSubmit={handleCreateTicket}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px', display: 'block', color: 'var(--text-main)' }}>
              Subject *
            </label>
            <input
              type="text"
              required
              value={newSubj}
              onChange={(e) => setNewSubj(e.target.value)}
              className="form-input"
              placeholder="e.g. Cannot reset portal MFA token"
              style={{ width: '100%', height: '38px', fontSize: '0.85rem' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <div>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px', display: 'block', color: 'var(--text-main)' }}>
                Customer Name *
              </label>
              <input
                type="text"
                required
                value={newCust}
                onChange={(e) => setNewCust(e.target.value)}
                className="form-input"
                style={{ width: '100%', height: '38px', fontSize: '0.85rem' }}
              />
            </div>
            <div>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px', display: 'block', color: 'var(--text-main)' }}>
                Priority *
              </label>
              <select
                value={newPrio}
                onChange={(e) => setNewPrio(e.target.value)}
                className="form-select"
                style={{ width: '100%', height: '38px', fontSize: '0.85rem' }}
              >
                <option value="CRITICAL">Critical (2h SLA)</option>
                <option value="HIGH">High (2h SLA)</option>
                <option value="MEDIUM">Medium (6h SLA)</option>
                <option value="LOW">Low (8h SLA)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px', display: 'block', color: 'var(--text-main)' }}>
              Category
            </label>
            <select
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              className="form-select"
              style={{ width: '100%', height: '38px', fontSize: '0.85rem' }}
            >
              <option value="AUTHENTICATION">Authentication / SAML</option>
              <option value="API_INTEGRATION">API & Webhooks</option>
              <option value="BILLING_TIER">Subscription & Billing</option>
              <option value="GENERAL_BUG">Software Defect</option>
            </select>
          </div>

          <div>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px', display: 'block', color: 'var(--text-main)' }}>
              Issue Description *
            </label>
            <textarea
              rows={3}
              required
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="form-input"
              placeholder="Provide technical error codes or reproduction steps..."
              style={{ width: '100%', fontSize: '0.85rem', resize: 'vertical', lineHeight: 1.5 }}
            />
          </div>
        </div>
      </FormDialog>
    </div>
  );
}
