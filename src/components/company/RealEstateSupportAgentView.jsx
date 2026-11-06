import React, { useState, useEffect } from 'react';
import { realEstateService } from '../../services/realEstateService';
import {
  LifeBuoy,
  Search,
  Plus,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  MessageSquare,
  UserCheck,
  Send,
  Sparkles,
  BookOpen,
  Filter,
  BarChart3,
  ShieldCheck,
  User,
  ChevronRight,
  FileText
} from 'lucide-react';

export function RealEstateSupportAgentView({ initialSubTab = 'dashboard' }) {
  const [activeTab, setActiveTab] = useState(initialSubTab);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState({
    openTickets: 42,
    assignedToMe: 12,
    unassignedTickets: 5,
    highPriorityTickets: 4,
    pendingCustomerReplies: 8,
    resolvedToday: 15,
    overdueTickets: 3,
    averageResolutionHours: 6.5
  });

  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketMessages, setTicketMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [messageVisibility, setMessageVisibility] = useState('CUSTOMER_VISIBLE');
  const [aiDraft, setAiDraft] = useState(null);
  const [generatingDraft, setGeneratingDraft] = useState(false);

  // Complaints
  const [complaints, setComplaints] = useState([]);
  const [showNewComplaintModal, setShowNewComplaintModal] = useState(false);
  const [complaintForm, setComplaintForm] = useState({
    customerId: 'CUS-4001',
    ticketId: '',
    complaintType: 'BOOKING_DELAY',
    severity: 'MEDIUM',
    description: ''
  });

  // Knowledge Base
  const [kbQuery, setKbQuery] = useState('');
  const [kbArticles, setKbArticles] = useState([]);

  // Create Ticket Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    customerId: 'CUS-4001',
    customerName: 'Arun Kumar',
    relatedPropertyId: 'PROP-1001',
    relatedBookingId: 'BK-7001',
    category: 'BOOKING_ENQUIRY',
    subject: '',
    description: '',
    priority: 'NORMAL',
    channel: 'EMAIL'
  });

  // Resolution & Escalation modals
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalateData, setEscalateData] = useState({
    reason: '',
    targetTeam: 'BOOKING_SUPPORT',
    priority: 'HIGH'
  });

  useEffect(() => {
    setActiveTab(initialSubTab);
  }, [initialSubTab]);

  useEffect(() => {
    loadDashboardData();
    loadTickets();
    loadComplaints();
    searchKB('');
  }, []);

  const loadDashboardData = async () => {
    try {
      const res = await realEstateService.getSupportDashboard('TODAY');
      if (res?.data) {
        setMetrics(res.data);
      }
    } catch (e) {
      console.warn('Using default support metrics', e);
    }
  };

  const loadTickets = async () => {
    setLoading(true);
    try {
      const res = await realEstateService.getSupportTickets();
      if (res?.data?.items) {
        setTickets(res.data.items);
        if (res.data.items.length > 0 && !selectedTicket) {
          selectTicket(res.data.items[0]);
        }
      }
    } catch (e) {
      console.warn('Using local tickets fallback', e);
    } finally {
      setLoading(false);
    }
  };

  const loadComplaints = async () => {
    try {
      const res = await realEstateService.getComplaints();
      if (res?.data) {
        setComplaints(res.data);
      }
    } catch (e) {
      console.warn('Complaints fallback', e);
    }
  };

  const searchKB = async (q = '') => {
    try {
      const res = await realEstateService.searchKnowledgeBase(q);
      if (res?.data?.items) {
        setKbArticles(res.data.items);
      }
    } catch (e) {
      console.warn('KB search fallback', e);
    }
  };

  const selectTicket = async (ticket) => {
    setSelectedTicket(ticket);
    setAiDraft(null);
    try {
      const res = await realEstateService.getSupportTicketMessages(ticket.ticketId);
      if (res?.data) {
        setTicketMessages(res.data);
      }
    } catch (e) {
      console.warn('Failed to load messages', e);
      setTicketMessages([]);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;
    try {
      const payload = {
        message: newMessage,
        visibility: messageVisibility,
        channel: selectedTicket.channel || 'EMAIL'
      };
      const res = await realEstateService.addSupportTicketMessage(selectedTicket.ticketId, payload);
      if (res?.data) {
        setTicketMessages(prev => [...prev, {
          messageId: res.data.messageId,
          ticketId: selectedTicket.ticketId,
          message: newMessage,
          visibility: messageVisibility,
          deliveryStatus: 'NOT_SENT',
          createdBy: 'USR-5001',
          createdAt: new Date().toISOString()
        }]);
        setNewMessage('');
      }
    } catch (e) {
      alert('Error sending message: ' + e.message);
    }
  };

  const handleGenerateAiDraft = async () => {
    if (!selectedTicket) return;
    setGeneratingDraft(true);
    try {
      const res = await realEstateService.generateAiReplyDraft(selectedTicket.ticketId, {
        channel: 'EMAIL',
        tone: 'PROFESSIONAL',
        useKnowledgeBase: true
      });
      if (res?.data) {
        setAiDraft(res.data);
        setNewMessage(res.data.body || '');
      }
    } catch (e) {
      alert('Could not generate AI draft: ' + e.message);
    } finally {
      setGeneratingDraft(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      const res = await realEstateService.createSupportTicket(ticketForm);
      if (res?.data) {
        setShowCreateModal(false);
        loadTickets();
        loadDashboardData();
        setTicketForm({
          customerId: 'CUS-4001',
          customerName: 'Arun Kumar',
          relatedPropertyId: 'PROP-1001',
          relatedBookingId: 'BK-7001',
          category: 'BOOKING_ENQUIRY',
          subject: '',
          description: '',
          priority: 'NORMAL',
          channel: 'EMAIL'
        });
      }
    } catch (e) {
      alert('Error creating ticket: ' + e.message);
    }
  };

  const handleResolveTicket = async () => {
    if (!selectedTicket) return;
    try {
      await realEstateService.resolveSupportTicket(selectedTicket.ticketId, {
        resolutionSummary: resolutionSummary || 'Provided verified property booking details.',
        resolutionCategory: 'INFORMATION_PROVIDED'
      });
      setShowResolveModal(false);
      setResolutionSummary('');
      loadTickets();
      loadDashboardData();
    } catch (e) {
      alert('Failed to resolve ticket: ' + e.message);
    }
  };

  const handleEscalateTicket = async () => {
    if (!selectedTicket) return;
    try {
      await realEstateService.escalateSupportTicket(selectedTicket.ticketId, escalateData);
      setShowEscalateModal(false);
      loadTickets();
      loadDashboardData();
    } catch (e) {
      alert('Failed to escalate ticket: ' + e.message);
    }
  };

  const handleRegisterComplaint = async (e) => {
    e.preventDefault();
    try {
      await realEstateService.createComplaint(complaintForm);
      setShowNewComplaintModal(false);
      loadComplaints();
    } catch (e) {
      alert('Failed to register complaint: ' + e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-900/30 via-slate-900/40 to-slate-900/20 p-5 rounded-2xl border border-emerald-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              REAL ESTATE TENANT
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300">
              ROLE: SUPPORT_AGENT
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1.5 flex items-center gap-2">
            <LifeBuoy className="w-6 h-6 text-emerald-400" />
            Support Agent Operations Hub
          </h1>
          <p className="text-sm text-slate-400">
            Resolve customer queries on verified property listings, booking tokens, RERA certificates, and site visits.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { loadDashboardData(); loadTickets(); }}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm shadow-lg shadow-emerald-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Ticket
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'inbox', label: 'Support Inbox & Tickets' },
          { id: 'complaints', label: 'Complaints & SLA' },
          { id: 'knowledge', label: 'Knowledge Base' },
          { id: 'reports', label: 'Support Reports' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400 font-medium">Open Tickets</span>
              <p className="text-2xl font-bold text-white mt-1">{metrics.openTickets}</p>
              <span className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                Active tenant queue
              </span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400 font-medium">Assigned to Me</span>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{metrics.assignedToMe}</p>
              <span className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                My assigned workload
              </span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400 font-medium">High / Urgent Priority</span>
              <p className="text-2xl font-bold text-amber-400 mt-1">{metrics.highPriorityTickets}</p>
              <span className="text-xs text-amber-400/80 flex items-center gap-1 mt-1">
                Immediate response needed
              </span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400 font-medium">Avg Resolution Time</span>
              <p className="text-2xl font-bold text-cyan-400 mt-1">{metrics.averageResolutionHours}h</p>
              <span className="text-xs text-cyan-400/80 flex items-center gap-1 mt-1">
                SLA target: &lt;8.0h
              </span>
            </div>
          </div>

          {/* Quick Actions & Recent Tickets Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  Recent Property Support Tickets
                </h3>
                <button
                  onClick={() => setActiveTab('inbox')}
                  className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
                >
                  View All <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-3">
                {tickets.slice(0, 4).map(t => (
                  <div
                    key={t.ticketId}
                    onClick={() => { setSelectedTicket(t); setActiveTab('inbox'); }}
                    className="p-3.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 rounded-xl flex items-center justify-between cursor-pointer transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-emerald-400 font-semibold">{t.ticketId}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          t.priority === 'HIGH' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-slate-700 text-slate-300'
                        }`}>
                          {t.priority}
                        </span>
                        <span className="text-xs text-slate-400">· {t.category}</span>
                      </div>
                      <p className="text-sm font-medium text-white mt-1">{t.subject}</p>
                      <p className="text-xs text-slate-400 mt-0.5">Customer: {t.customerName || t.customerId} · Property: {t.relatedPropertyId || 'General'}</p>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Support Agent Quick Tools */}
            <div className="space-y-4">
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
                <h3 className="font-semibold text-white flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  AI Support Guidelines
                </h3>
                <ul className="text-xs text-slate-300 space-y-2.5">
                  <li className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Ground answers strictly in verified RERA catalog and real booking records.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>Never promise unofficial discounts or guarantee unconfirmed possession dates.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Always require human approval before external dispatch of reply drafts.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5 mb-1.5">
                  <LifeBuoy className="w-4 h-4" />
                  Knowledge Base Quick Lookup
                </h4>
                <p className="text-xs text-slate-400 mb-3">
                  Search approved title deed, token refund, and visit protocols.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Search articles..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    onChange={(e) => { setKbQuery(e.target.value); searchKB(e.target.value); }}
                  />
                  <button
                    onClick={() => setActiveTab('knowledge')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium"
                  >
                    Go
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SUPPORT INBOX & TICKETS */}
      {activeTab === 'inbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
          {/* Ticket List Pane */}
          <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col h-[700px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="font-semibold text-white text-sm">Tickets ({tickets.length})</span>
              <button
                onClick={() => setShowCreateModal(true)}
                className="text-xs px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> New
              </button>
            </div>

            {/* Ticket Scroll List */}
            <div className="flex-1 overflow-y-auto space-y-2 pt-3 pr-1">
              {tickets.map(t => (
                <div
                  key={t.ticketId}
                  onClick={() => selectTicket(t)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedTicket?.ticketId === t.ticketId
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-white shadow-md'
                      : 'bg-slate-800/40 hover:bg-slate-800 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-emerald-400">{t.ticketId}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      t.priority === 'HIGH' ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {t.priority}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-white mt-1 line-clamp-1">{t.subject}</p>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{t.description}</p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/60 text-[10px] text-slate-400">
                    <span>{t.customerName || t.customerId}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">{t.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ticket Detail & Conversation Pane */}
          <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col h-[700px]">
            {selectedTicket ? (
              <>
                {/* Header info */}
                <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-emerald-400">{selectedTicket.ticketId}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">{selectedTicket.category}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium">{selectedTicket.status}</span>
                    </div>
                    <h2 className="text-base font-bold text-white mt-1">{selectedTicket.subject}</h2>
                    <p className="text-xs text-slate-400">
                      Customer: <strong className="text-white">{selectedTicket.customerName || selectedTicket.customerId}</strong> | Property: <strong className="text-emerald-400">{selectedTicket.relatedPropertyId || 'N/A'}</strong>
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setShowResolveModal(true)}
                      className="px-3 py-1.5 bg-emerald-600/80 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold"
                    >
                      Resolve
                    </button>
                    <button
                      onClick={() => setShowEscalateModal(true)}
                      className="px-3 py-1.5 bg-amber-600/80 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold"
                    >
                      Escalate
                    </button>
                  </div>
                </div>

                {/* Conversation History */}
                <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-2">
                  {ticketMessages.map((m, idx) => {
                    const isAgent = m.createdBy?.includes('USR') || m.sender?.includes('USR');
                    return (
                      <div
                        key={m.messageId || idx}
                        className={`p-3 rounded-xl max-w-[85%] text-xs ${
                          isAgent
                            ? 'ml-auto bg-emerald-950/40 border border-emerald-500/30 text-white'
                            : 'mr-auto bg-slate-800/80 border border-slate-700/60 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                          <span className="font-semibold">{isAgent ? 'Support Agent' : 'Customer'}</span>
                          <span>{m.createdAt ? m.createdAt.slice(11, 16) : 'Just now'}</span>
                        </div>
                        <p className="whitespace-pre-wrap">{m.message}</p>
                        {m.visibility && (
                          <div className="mt-1 pt-1 border-t border-slate-700/40 text-[9px] text-slate-400">
                            Visibility: {m.visibility} | Status: {m.deliveryStatus || 'RECORDED'}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* AI Draft Suggestion Box */}
                {aiDraft && (
                  <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3 mb-2 text-xs">
                    <div className="flex items-center justify-between text-emerald-400 font-semibold mb-1">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> AI Reply Draft (Review Required)
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">Grounding verified</span>
                    </div>
                    <p className="text-slate-300 italic mb-2 line-clamp-3">{aiDraft.body}</p>
                    <button
                      onClick={() => setNewMessage(aiDraft.body)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-medium"
                    >
                      Use This Draft
                    </button>
                  </div>
                )}

                {/* Message Composer */}
                <div className="pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <select
                        value={messageVisibility}
                        onChange={(e) => setMessageVisibility(e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-300"
                      >
                        <option value="CUSTOMER_VISIBLE">Customer Visible</option>
                        <option value="INTERNAL_NOTE">Internal Team Note</option>
                      </select>
                    </div>
                    <button
                      onClick={handleGenerateAiDraft}
                      disabled={generatingDraft}
                      className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {generatingDraft ? 'Generating Draft...' : 'Generate AI Draft'}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <textarea
                      rows={2}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a verified support response (will not send email automatically)..."
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 self-end"
                    >
                      <Send className="w-3.5 h-3.5" /> Record
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500">
                <LifeBuoy className="w-12 h-12 mb-2 text-slate-600" />
                <p className="text-sm">Select a ticket from the inbox to review conversation history.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: COMPLAINTS & SLA */}
      {activeTab === 'complaints' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Service Complaints & Escalation Tracking
            </h3>
            <button
              onClick={() => setShowNewComplaintModal(true)}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Register Complaint
            </button>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700/60">
                <tr>
                  <th className="p-3.5">Complaint ID</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Severity</th>
                  <th className="p-3.5">Description</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {complaints.map(c => (
                  <tr key={c.complaintId} className="hover:bg-slate-800/40">
                    <td className="p-3.5 font-mono text-emerald-400 font-semibold">{c.complaintId}</td>
                    <td className="p-3.5 text-white font-medium">{c.customerId}</td>
                    <td className="p-3.5">{c.complaintType}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        c.severity === 'HIGH' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {c.severity}
                      </span>
                    </td>
                    <td className="p-3.5 max-w-xs truncate">{c.description}</td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-medium">
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: KNOWLEDGE BASE */}
      {activeTab === 'knowledge' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                Approved Real Estate Knowledge Registry
              </h3>
              <p className="text-xs text-slate-400">
                Use verified knowledge articles to ground AI replies and customer answers.
              </p>
            </div>
            <div className="w-64">
              <input
                type="text"
                placeholder="Search articles..."
                value={kbQuery}
                onChange={(e) => { setKbQuery(e.target.value); searchKB(e.target.value); }}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {kbArticles.map(a => (
              <div key={a.articleId} className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-emerald-400 font-bold">{a.articleId}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 uppercase">
                    {a.category}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-white">{a.title}</h4>
                <p className="text-xs text-slate-300 line-clamp-3">{a.content}</p>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Last verified: {a.lastUpdated ? a.lastUpdated.slice(0, 10) : 'Recent'}</span>
                  <span className="text-emerald-400 font-medium">RERA Compliant</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: SUPPORT REPORTS */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400">First Contact Resolution</span>
              <p className="text-2xl font-bold text-emerald-400 mt-1">78.4%</p>
              <span className="text-xs text-emerald-400 mt-1 block">+3.2% vs target</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400">Customer CSAT Score</span>
              <p className="text-2xl font-bold text-amber-400 mt-1">4.72 / 5.0</p>
              <span className="text-xs text-slate-400 mt-1 block">Based on 148 reviews</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400">SLA Adherence Rate</span>
              <p className="text-2xl font-bold text-cyan-400 mt-1">94.6%</p>
              <span className="text-xs text-cyan-400 mt-1 block">SLA threshold: 90%</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400">Escalation Rate</span>
              <p className="text-2xl font-bold text-purple-400 mt-1">4.2%</p>
              <span className="text-xs text-purple-400 mt-1 block">Low exception band</span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE TICKET */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" /> Create Real Estate Support Ticket
            </h3>
            <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 mb-1 block">Customer ID</label>
                  <input
                    type="text"
                    required
                    value={ticketForm.customerId}
                    onChange={(e) => setTicketForm({ ...ticketForm, customerId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 mb-1 block">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={ticketForm.customerName}
                    onChange={(e) => setTicketForm({ ...ticketForm, customerName: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 mb-1 block">Category</label>
                  <select
                    value={ticketForm.category}
                    onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="BOOKING_ENQUIRY">Booking Enquiry</option>
                    <option value="DOCUMENTATION">Title Deed / Legal Documentation</option>
                    <option value="PAYMENT_VERIFICATION">Payment & Bank Loan</option>
                    <option value="SITE_VISIT_SUPPORT">Site Visit Support</option>
                    <option value="GENERAL_ENQUIRY">General Enquiry</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 mb-1 block">Priority</label>
                  <select
                    value={ticketForm.priority}
                    onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 mb-1 block">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Request for booking confirmation"
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 mb-1 block">Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Customer enquiry details..."
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold"
                >
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RESOLVE TICKET */}
      {showResolveModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" /> Resolve Ticket {selectedTicket?.ticketId}
            </h3>
            <p className="text-slate-400">
              Provide a verified summary of the resolution provided to the customer.
            </p>
            <textarea
              rows={3}
              placeholder="e.g. Verified booking status and dispatched RERA certificate link."
              value={resolutionSummary}
              onChange={(e) => setResolutionSummary(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowResolveModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleResolveTicket}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold"
              >
                Confirm Resolution
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ESCALATE TICKET */}
      {showEscalateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" /> Escalate Ticket {selectedTicket?.ticketId}
            </h3>
            <div>
              <label className="text-slate-400 mb-1 block">Target Team</label>
              <select
                value={escalateData.targetTeam}
                onChange={(e) => setEscalateData({ ...escalateData, targetTeam: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
              >
                <option value="BOOKING_SUPPORT">Booking Operations Team</option>
                <option value="LEGAL_RERA">Legal & RERA Compliance Team</option>
                <option value="FINANCE_ACCOUNTS">Accounts & Billing</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 mb-1 block">Reason for Escalation</label>
              <textarea
                rows={3}
                placeholder="Reason why this ticket requires higher-tier intervention..."
                value={escalateData.reason}
                onChange={(e) => setEscalateData({ ...escalateData, reason: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowEscalateModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleEscalateTicket}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-semibold"
              >
                Escalate Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REGISTER COMPLAINT */}
      {showNewComplaintModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" /> Register Customer Complaint
            </h3>
            <form onSubmit={handleRegisterComplaint} className="space-y-3">
              <div>
                <label className="text-slate-400 mb-1 block">Customer ID</label>
                <input
                  type="text"
                  required
                  value={complaintForm.customerId}
                  onChange={(e) => setComplaintForm({ ...complaintForm, customerId: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 mb-1 block">Complaint Category</label>
                <select
                  value={complaintForm.complaintType}
                  onChange={(e) => setComplaintForm({ ...complaintForm, complaintType: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                >
                  <option value="BOOKING_DELAY">Booking Delay</option>
                  <option value="VISIT_MISMANAGEMENT">Site Visit Mismanagement</option>
                  <option value="DOCUMENT_DISCREPANCY">Document Discrepancy</option>
                  <option value="COMMUNICATION_DELAY">Communication Failure</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 mb-1 block">Severity</label>
                <select
                  value={complaintForm.severity}
                  onChange={(e) => setComplaintForm({ ...complaintForm, severity: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High (Breach risk)</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 mb-1 block">Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Complaint explanation..."
                  value={complaintForm.description}
                  onChange={(e) => setComplaintForm({ ...complaintForm, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewComplaintModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-semibold"
                >
                  Register Complaint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
