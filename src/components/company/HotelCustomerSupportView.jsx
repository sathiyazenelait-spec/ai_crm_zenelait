import React, { useState, useEffect } from 'react';
import {
  MessageSquare, LifeBuoy, AlertCircle, CheckCircle2, Clock, ShieldAlert,
  Send, Bot, BookOpen, User, RefreshCw, Plus, Filter, Search, X, Check,
  ChevronRight, Wrench, Sparkles, Shield
} from 'lucide-react';
import { hotelService } from '../../services/hotelService';

export default function HotelCustomerSupportView() {
  const [activeTab, setActiveTab] = useState('tickets');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  // Dashboard
  const [dashboard, setDashboard] = useState({
    openTickets: 23,
    highPriorityTickets: 4,
    unassignedTickets: 3,
    openConversations: 12,
    pendingServiceRequests: 9,
    pendingEscalations: 2,
    ticketsResolvedToday: 17
  });

  // Entities
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketMessages, setTicketMessages] = useState([]);
  const [ticketNotes, setTicketNotes] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [knowledgeArticles, setKnowledgeArticles] = useState([]);
  const [escalations, setEscalations] = useState([]);

  // Filter & Search
  const [ticketStatus, setTicketStatus] = useState('');
  const [ticketCategory, setTicketCategory] = useState('');
  const [kbQuery, setKbQuery] = useState('');
  const [kbAnswer, setKbAnswer] = useState(null);

  // Forms & Drafts
  const [customerReplyText, setCustomerReplyText] = useState('');
  const [internalNoteText, setInternalNoteText] = useState('');
  const [activeReplyDraft, setActiveReplyDraft] = useState(null);

  const [showCreateTicketModal, setShowCreateTicketModal] = useState(false);
  const [newTicket, setNewTicket] = useState({
    guestId: 'guest_1002',
    reservationId: 'res_1002',
    subject: '',
    description: '',
    category: 'ROOM_MAINTENANCE',
    priority: 'HIGH'
  });

  const [showServiceModal, setShowServiceModal] = useState(false);
  const [newServiceReq, setNewServiceReq] = useState({
    guestId: 'guest_1002',
    reservationId: 'res_1002',
    category: 'HOUSEKEEPING',
    description: '',
    priority: 'NORMAL'
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [dash, tRes, sRes, kbRes, escRes] = await Promise.allSettled([
        hotelService.customerSupport.getDashboard(),
        hotelService.customerSupport.getTickets(),
        hotelService.customerSupport.getServiceRequests(),
        hotelService.customerSupport.getKnowledgeArticles(),
        hotelService.customerSupport.getEscalations()
      ]);

      if (dash.status === 'fulfilled' && dash.value) setDashboard(dash.value);
      if (tRes.status === 'fulfilled' && tRes.value?.items) {
        setTickets(tRes.value.items);
        if (!selectedTicket && tRes.value.items.length > 0) {
          setSelectedTicket(tRes.value.items[0]);
        }
      }
      if (sRes.status === 'fulfilled' && sRes.value) setServiceRequests(sRes.value);
      if (kbRes.status === 'fulfilled' && kbRes.value) setKnowledgeArticles(kbRes.value);
      if (escRes.status === 'fulfilled' && escRes.value) setEscalations(escRes.value);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      const t = await hotelService.customerSupport.createTicket(newTicket);
      showToast('Support ticket created');
      setShowCreateTicketModal(false);
      setTickets([t, ...tickets]);
      setSelectedTicket(t);
    } catch (err) {
      showToast('Failed to create ticket');
    }
  };

  const handleSendCustomerMessage = async (e) => {
    e.preventDefault();
    if (!selectedTicket || !customerReplyText.trim()) return;
    try {
      await hotelService.customerSupport.addTicketCustomerMessage(selectedTicket.ticketId, {
        sender: 'SUPPORT_AGENT',
        content: customerReplyText
      });
      showToast('Customer reply sent');
      setCustomerReplyText('');
      loadData();
    } catch (err) {
      showToast('Failed to send reply');
    }
  };

  const handleAddInternalNote = async (e) => {
    e.preventDefault();
    if (!selectedTicket || !internalNoteText.trim()) return;
    try {
      await hotelService.customerSupport.addTicketInternalNote(selectedTicket.ticketId, {
        note: internalNoteText,
        visibility: 'INTERNAL'
      });
      showToast('Internal note saved (Private)');
      setInternalNoteText('');
      loadData();
    } catch (err) {
      showToast('Failed to save note');
    }
  };

  const handleGenerateReplyDraft = async () => {
    if (!selectedTicket) return;
    try {
      const draft = await hotelService.customerSupport.createReplyDraft(selectedTicket.ticketId, {
        tone: 'PROFESSIONAL',
        includeKnowledgeReferences: true
      });
      setActiveReplyDraft(draft);
      showToast('AI draft generated for human review');
    } catch (err) {
      showToast('Failed to generate draft');
    }
  };

  const handleApproveAndSendDraft = async () => {
    if (!selectedTicket || !activeReplyDraft) return;
    try {
      await hotelService.customerSupport.approveReplyDraft(selectedTicket.ticketId, activeReplyDraft.draftId);
      await hotelService.customerSupport.sendReplyDraft(selectedTicket.ticketId, activeReplyDraft.draftId);
      showToast('Approved AI reply dispatched to guest');
      setActiveReplyDraft(null);
      loadData();
    } catch (err) {
      showToast('Failed to send approved draft');
    }
  };

  const handleResolveTicket = async () => {
    if (!selectedTicket) return;
    try {
      await hotelService.customerSupport.resolveTicket(selectedTicket.ticketId, {
        resolutionCode: 'MAINTENANCE_COMPLETED',
        resolutionNote: 'The duty maintenance technician verified issue solved.'
      });
      showToast('Ticket marked RESOLVED');
      loadData();
    } catch (err) {
      showToast('Failed to resolve ticket');
    }
  };

  const handleEscalateTicket = async () => {
    if (!selectedTicket) return;
    try {
      await hotelService.customerSupport.escalateTicket(selectedTicket.ticketId, {
        reason: 'GUEST_REQUESTED_MANAGER',
        priority: 'HIGH',
        summary: 'Guest requested manager attention regarding AC delay'
      });
      showToast('Ticket escalated to Duty Manager');
      loadData();
    } catch (err) {
      showToast('Failed to escalate');
    }
  };

  const handleCreateServiceRequest = async (e) => {
    e.preventDefault();
    try {
      await hotelService.customerSupport.createServiceRequest(newServiceReq);
      showToast('Service request routed to team');
      setShowServiceModal(false);
      loadData();
    } catch (err) {
      showToast('Failed to create service request');
    }
  };

  const handleSearchKnowledge = async (e) => {
    e.preventDefault();
    if (!kbQuery.trim()) return;
    try {
      const ans = await hotelService.customerSupport.generateGroundedAnswer({ question: kbQuery });
      setKbAnswer(ans);
    } catch (err) {
      showToast('Knowledge search error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl animate-fade-in text-sm font-medium">
          <CheckCircle2 className="w-5 h-5" />
          {toast}
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/40 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold rounded-full uppercase tracking-wider">
                Hotel Tenant — Role 3
              </span>
              <span className="text-xs text-indigo-300 font-medium">Guest In-Stay Support & Service Desk</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-2 text-white">
              Customer Support & Concierge Desk
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Handle guest enquiries, manage maintenance & housekeeping tickets, inspect internal audit notes, and draft verified AI responses grounded in published hotel policy.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateTicketModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              New Ticket
            </button>
            <button
              onClick={() => setShowServiceModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-sm font-medium"
            >
              <Wrench className="w-4 h-4" />
              Dispatch Service
            </button>
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tab Strip */}
        <div className="flex items-center gap-2 mt-6 border-t border-slate-800/80 pt-4 overflow-x-auto no-scrollbar">
          {[
            { id: 'tickets', label: 'Support Tickets & Triage', icon: LifeBuoy },
            { id: 'service', label: 'Service Requests (HK & Maint)', icon: Wrench },
            { id: 'knowledge', label: 'Policy Knowledge & Grounding', icon: BookOpen },
            { id: 'escalations', label: 'Manager Escalations', icon: ShieldAlert }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${
                  active
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* METRIC STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 uppercase font-semibold">Open Tickets</span>
          <div className="text-2xl font-bold text-indigo-400 mt-1">{dashboard.openTickets}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 uppercase font-semibold">High Priority</span>
          <div className="text-2xl font-bold text-rose-400 mt-1">{dashboard.highPriorityTickets}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 uppercase font-semibold">Unassigned</span>
          <div className="text-2xl font-bold text-amber-400 mt-1">{dashboard.unassignedTickets}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 uppercase font-semibold">Live Chats</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{dashboard.openConversations}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 uppercase font-semibold">Service Dispatches</span>
          <div className="text-2xl font-bold text-blue-400 mt-1">{dashboard.pendingServiceRequests}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400 uppercase font-semibold">Resolved Today</span>
          <div className="text-2xl font-bold text-purple-400 mt-1">{dashboard.ticketsResolvedToday}</div>
        </div>
      </div>

      {/* TAB 1: TICKETS & TRIAGE */}
      {activeTab === 'tickets' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ticket List Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <span className="text-xs font-semibold text-slate-300">Active Ticket Queue</span>
              <span className="text-xs text-slate-500">{tickets.length} records</span>
            </div>

            <div className="space-y-2.5 overflow-y-auto max-h-[680px] pr-1">
              {tickets.map((t) => {
                const isSelected = selectedTicket?.ticketId === t.ticketId;
                return (
                  <div
                    key={t.ticketId}
                    onClick={() => setSelectedTicket(t)}
                    className={`p-4 rounded-xl border cursor-pointer transition ${
                      isSelected
                        ? 'bg-slate-800/80 border-indigo-500 shadow-md'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-indigo-400 font-semibold">{t.ticketId}</span>
                      <span className={`px-2 py-0.5 rounded-full font-bold ${
                        t.priority === 'HIGH' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-700 text-slate-300'
                      }`}>
                        {t.priority}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-white mt-1.5">{t.subject}</div>
                    <div className="text-xs text-slate-400 mt-1 line-clamp-1">{t.description}</div>
                    <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                      <span>Team: {t.assignedTeam}</span>
                      <span className={`font-medium ${t.status === 'RESOLVED' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {t.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ticket Details & Action Column */}
          {selectedTicket ? (
            <div className="lg:col-span-2 space-y-5 bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              {/* Ticket Top bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full font-semibold">
                      {selectedTicket.category}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Stay: {selectedTicket.reservationId || 'In-House'}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1.5">{selectedTicket.subject}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleEscalateTicket}
                    className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold"
                  >
                    Escalate
                  </button>
                  <button
                    onClick={handleResolveTicket}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md"
                  >
                    Mark Resolved
                  </button>
                </div>
              </div>

              {/* Description box */}
              <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-800 text-sm text-slate-200">
                <span className="text-xs text-slate-400 block mb-1 font-semibold uppercase">Initial Guest Statement:</span>
                {selectedTicket.description}
              </div>

              {/* AI Reply Draft Assistant */}
              <div className="p-4 bg-indigo-950/30 border border-indigo-900/60 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    AI Grounded Reply Drafter
                  </span>
                  <button
                    onClick={handleGenerateReplyDraft}
                    className="px-3 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 rounded-lg text-xs font-medium border border-indigo-500/30"
                  >
                    Generate Draft
                  </button>
                </div>

                {activeReplyDraft && (
                  <div className="space-y-3 pt-2">
                    <div className="p-3 bg-slate-900 rounded-xl border border-indigo-500/40 text-xs text-slate-200 leading-relaxed">
                      {activeReplyDraft.body}
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Status: <strong className="text-amber-400">Requires Human Approval</strong></span>
                      <button
                        onClick={handleApproveAndSendDraft}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow"
                      >
                        <Check className="w-4 h-4" /> Approve & Send to Guest
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Communication Area: Public Reply vs Internal Note */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Guest-Facing Reply Box */}
                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5" /> Customer-Visible Reply
                  </span>
                  <textarea
                    rows={4}
                    value={customerReplyText}
                    onChange={(e) => setCustomerReplyText(e.target.value)}
                    placeholder="Type official message sent to guest via app or SMS..."
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={handleSendCustomerMessage}
                    className="w-full py-2 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold transition"
                  >
                    Send to Guest
                  </button>
                </div>

                {/* Internal Note Box (Strictly Isolated) */}
                <div className="p-4 bg-slate-900 rounded-xl border border-amber-900/30 space-y-3">
                  <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" /> Internal Staff Note (Confidential)
                  </span>
                  <textarea
                    rows={4}
                    value={internalNoteText}
                    onChange={(e) => setInternalNoteText(e.target.value)}
                    placeholder="Staff-only diagnostic or handoff notes (Never exposed to guest)..."
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={handleAddInternalNote}
                    className="w-full py-2 bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold transition"
                  >
                    Save Private Note
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-2 flex items-center justify-center p-12 bg-slate-900/60 border border-slate-800 rounded-2xl text-slate-500 text-sm">
              Select a ticket from the queue to review details and dispatch actions.
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SERVICE REQUESTS */}
      {activeTab === 'service' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {serviceRequests.map((sr) => (
              <div key={sr.requestId} className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-indigo-400">{sr.category}</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold ${
                    sr.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {sr.status}
                  </span>
                </div>
                <div className="text-sm font-medium text-white">{sr.description}</div>
                <div className="pt-2 border-t border-slate-800 text-xs text-slate-500 flex justify-between">
                  <span>Assigned: {sr.assignedTeam}</span>
                  <span>ID: {sr.requestId}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: POLICY KNOWLEDGE & GROUNDING */}
      {activeTab === 'knowledge' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              Published Policy RAG Engine
            </h3>
            <p className="text-xs text-slate-400">
              Only approved, published tenant policy articles are utilized for generative AI responses to eliminate hallucinations.
            </p>
            <form onSubmit={handleSearchKnowledge} className="flex gap-3">
              <input
                type="text"
                placeholder="Ask policy question, e.g. What is the cancellation window?"
                value={kbQuery}
                onChange={(e) => setKbQuery(e.target.value)}
                className="flex-1 p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
              >
                Query Engine
              </button>
            </form>

            {kbAnswer && (
              <div className="p-4 bg-slate-800/60 border border-indigo-500/40 rounded-xl space-y-2 mt-4">
                <span className="text-xs text-emerald-400 font-semibold block">Grounded Response:</span>
                <p className="text-sm text-white leading-relaxed">{kbAnswer.answer}</p>
                <div className="text-xs text-slate-400 pt-1">
                  Verified Sources: <code className="text-indigo-400">{kbAnswer.sourceArticles?.join(', ')}</code>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {knowledgeArticles.map((art) => (
              <div key={art.articleId} className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white text-sm">{art.title}</span>
                  <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full">
                    {art.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{art.snippet}</p>
                <div className="text-xs text-slate-500 pt-1">Version: {art.version} • Published</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ESCALATIONS */}
      {activeTab === 'escalations' && (
        <div className="space-y-4">
          <div className="space-y-3">
            {escalations.map((esc) => (
              <div key={esc.escalationId} className="p-4 bg-slate-900/60 border border-rose-900/30 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-rose-400">{esc.reason}</span>
                  <span className="text-slate-400">Assigned: {esc.assignedTeam}</span>
                </div>
                <div className="text-sm font-semibold text-white">{esc.summary}</div>
                <div className="text-xs text-slate-500">Ticket Ref: {esc.ticketId}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: CREATE TICKET */}
      {showCreateTicketModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-semibold text-white">Create Guest Support Ticket</h3>
              <button onClick={() => setShowCreateTicketModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTicket} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Subject</label>
                <input
                  type="text"
                  required
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  placeholder="e.g. AC cooling issue in Room 301"
                  className="w-full mt-1 p-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Category</label>
                <select
                  value={newTicket.category}
                  onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                >
                  <option value="ROOM_MAINTENANCE">ROOM_MAINTENANCE</option>
                  <option value="HOUSEKEEPING">HOUSEKEEPING</option>
                  <option value="BILLING">BILLING</option>
                  <option value="CONCIERGE">CONCIERGE</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400">Description</label>
                <textarea
                  required
                  rows={3}
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateTicketModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold"
                >
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DISPATCH SERVICE */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-semibold text-white">Dispatch Operational Service Request</h3>
              <button onClick={() => setShowServiceModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateServiceRequest} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Department</label>
                <select
                  value={newServiceReq.category}
                  onChange={(e) => setNewServiceReq({ ...newServiceReq, category: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                >
                  <option value="HOUSEKEEPING">HOUSEKEEPING (Towels, Cleaning)</option>
                  <option value="MAINTENANCE">MAINTENANCE (AC, Plumbing, Electrical)</option>
                  <option value="ROOM_SERVICE">ROOM_SERVICE (Food & Beverage)</option>
                  <option value="CONCIERGE">CONCIERGE (Luggage, Transfer)</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400">Request Details</label>
                <textarea
                  required
                  rows={3}
                  value={newServiceReq.description}
                  onChange={(e) => setNewServiceReq({ ...newServiceReq, description: e.target.value })}
                  placeholder="e.g. 2 extra bath sheets requested for Room 301"
                  className="w-full mt-1 p-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowServiceModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold"
                >
                  Dispatch Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
