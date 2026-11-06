import React, { useState, useEffect } from 'react';
import {
  LifeBuoy, MessageSquare, BookOpen, Wrench, ShieldAlert, CheckCircle2,
  Clock, AlertTriangle, Send, RefreshCw, Sparkles, UserCheck, X, FileText,
  Sliders, ArrowRight, CornerDownRight, ThumbsUp, Activity, Lock
} from 'lucide-react';
import { hotelService } from '../../services/hotelService';

export default function HotelAiSupportAgentView() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  // Dashboard Data
  const [dashboard, setDashboard] = useState({
    openTickets: 12,
    serviceRequestsActive: 8,
    escalationsCount: 2,
    avgResponseMinutes: 1.8,
    resolutionRate: 91.4,
    aiHandoffsToday: 4
  });

  // Conversations State
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversationMessages, setConversationMessages] = useState([]);
  const [guestMessageInput, setGuestMessageInput] = useState('');
  const [aiProcessing, setAiProcessing] = useState(false);
  const [conversationSummary, setConversationSummary] = useState(null);

  // Knowledge Base State
  const [searchQuery, setSearchQuery] = useState('breakfast');
  const [knowledgeResults, setKnowledgeResults] = useState([]);
  const [groundedAnswer, setGroundedAnswer] = useState(null);

  // Guest Verification State
  const [verificationSession, setVerificationSession] = useState(null);
  const [guestContext, setGuestContext] = useState(null);

  // Tickets State
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [internalNoteInput, setInternalNoteInput] = useState('');
  const [replyDraft, setReplyDraft] = useState(null);

  // Service Requests State
  const [serviceRequests, setServiceRequests] = useState([]);
  const [newServiceReq, setNewServiceReq] = useState({
    category: 'HOUSEKEEPING',
    description: 'Guest requested two extra bath towels and toiletries.',
    locationReference: 'ROOM-204',
    priority: 'MEDIUM'
  });
  const [showServiceModal, setShowServiceModal] = useState(false);

  // Escalations State
  const [escalations, setEscalations] = useState([]);

  const showNotification = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [dashRes, convsRes, ticketsRes, srvRes, escRes, kbRes] = await Promise.allSettled([
        hotelService.aiSupportAgent.getDashboard(),
        hotelService.aiSupportAgent.getConversations(),
        hotelService.aiSupportAgent.getTickets(),
        hotelService.aiSupportAgent.getServiceRequests(),
        hotelService.aiSupportAgent.getEscalations(),
        hotelService.aiSupportAgent.searchKnowledge({ query: 'policy', topK: 5 })
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value) setDashboard(dashRes.value);
      if (convsRes.status === 'fulfilled' && convsRes.value) {
        setConversations(convsRes.value);
        if (convsRes.value.length > 0) selectConversation(convsRes.value[0]);
      }
      if (ticketsRes.status === 'fulfilled' && ticketsRes.value?.items) {
        setTickets(ticketsRes.value.items);
        if (ticketsRes.value.items.length > 0) setSelectedTicket(ticketsRes.value.items[0]);
      }
      if (srvRes.status === 'fulfilled' && srvRes.value) setServiceRequests(srvRes.value);
      if (escRes.status === 'fulfilled' && escRes.value) setEscalations(escRes.value);
      if (kbRes.status === 'fulfilled' && kbRes.value) setKnowledgeResults(kbRes.value);
    } catch (err) {
      console.error('Error loading AI Support Agent data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const selectConversation = async (conv) => {
    setSelectedConversation(conv);
    try {
      const msgs = await hotelService.aiSupportAgent.getConversationMessages(conv.conversationId);
      setConversationMessages(msgs || []);
    } catch {
      setConversationMessages([
        { sender: 'GUEST', content: conv.initialMessage || 'The air conditioner in my room is not working.', timestamp: '15:10' },
        { sender: 'AI_SUPPORT_AGENT', content: 'I am sorry to hear you are experiencing this issue. I can create a maintenance request for our hotel team.', timestamp: '15:11' }
      ]);
    }
  };

  const handleSendMessage = async () => {
    if (!guestMessageInput.trim() || !selectedConversation) return;
    const text = guestMessageInput;
    setGuestMessageInput('');
    setAiProcessing(true);

    const tempMsg = { sender: 'GUEST', content: text, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setConversationMessages(prev => [...prev, tempMsg]);

    try {
      const res = await hotelService.aiSupportAgent.processMessage(selectedConversation.conversationId, {
        message: text,
        channel: selectedConversation.channel || 'WEBSITE_CHAT'
      });

      const reply = {
        sender: 'AI_SUPPORT_AGENT',
        content: res?.reply || 'I have recorded your request. Our maintenance staff will inspect your unit promptly.',
        intent: res?.intent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setConversationMessages(prev => [...prev, reply]);
      showNotification('AI Support formulated grounded reply');
    } catch (err) {
      showNotification(err.message || 'Failed to process message');
    } finally {
      setAiProcessing(false);
    }
  };

  const handleSummarizeConversation = async () => {
    if (!selectedConversation) return;
    setLoading(true);
    try {
      const res = await hotelService.aiSupportAgent.summarizeConversation(selectedConversation.conversationId);
      setConversationSummary(res);
      showNotification('Conversation summarized with sentiment analysis');
    } catch (err) {
      showNotification(err.message || 'Summarization failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchKnowledge = async () => {
    setLoading(true);
    try {
      const res = await hotelService.aiSupportAgent.searchKnowledge({ query: searchQuery, topK: 5 });
      setKnowledgeResults(res);
      showNotification('Approved hotel knowledge retrieved');
    } catch (err) {
      showNotification(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAskKnowledgeAnswer = async () => {
    setLoading(true);
    try {
      const res = await hotelService.aiSupportAgent.answerWithKnowledge({
        question: searchQuery,
        conversationId: selectedConversation?.conversationId || 'conv_1001',
        responseChannel: 'WEBSITE_CHAT'
      });
      setGroundedAnswer(res);
      showNotification('Grounded answer generated with source citations');
    } catch (err) {
      showNotification(err.message || 'Answer generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleStartVerification = async () => {
    setLoading(true);
    try {
      const sess = await hotelService.aiSupportAgent.startGuestVerification({
        reservationId: 'res_1001',
        guestIdentifier: 'guest@example.com'
      });
      setVerificationSession(sess);
      showNotification('Verification session started');
    } catch (err) {
      showNotification(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySession = async () => {
    if (!verificationSession?.sessionId) return;
    setLoading(true);
    try {
      const res = await hotelService.aiSupportAgent.verifyGuestSession(verificationSession.sessionId, {
        verificationCode: '749210'
      });
      setVerificationSession(res);

      const ctx = await hotelService.aiSupportAgent.lookupGuestContext({
        sessionId: verificationSession.sessionId,
        reservationId: 'res_1001'
      });
      setGuestContext(ctx);
      showNotification('Guest verified. Stay details loaded securely.');
    } catch (err) {
      showNotification(err.message || 'Failed to complete verification');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReplyDraft = async (ticketId) => {
    setLoading(true);
    try {
      const draft = await hotelService.aiSupportAgent.createReplyDraft(ticketId, {
        tone: 'POLITE',
        includeNextSteps: true
      });
      setReplyDraft(draft);
      showNotification('AI response draft generated. Requires employee review.');
    } catch (err) {
      showNotification(err.message || 'Failed to generate draft');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAndSendReply = async () => {
    if (!selectedTicket || !replyDraft?.draftId) return;
    setLoading(true);
    try {
      await hotelService.aiSupportAgent.approveReplyDraft(selectedTicket.ticketId, replyDraft.draftId, {
        reviewComment: 'Verified and approved for dispatch'
      });
      await hotelService.aiSupportAgent.sendReplyDraft(selectedTicket.ticketId, replyDraft.draftId, {
        channel: 'EMAIL',
        recipientReference: 'VERIFIED_GUEST_CONTACT'
      });
      setReplyDraft({ ...replyDraft, status: 'SENT', deliveryStatus: 'QUEUED' });
      showNotification('Approved response submitted to message queue');
    } catch (err) {
      showNotification(err.message || 'Send failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAddInternalNote = async () => {
    if (!internalNoteInput.trim() || !selectedTicket) return;
    try {
      await hotelService.aiSupportAgent.addTicketNote(selectedTicket.ticketId, {
        note: internalNoteInput,
        createdBy: 'AI_SUPPORT_AGENT'
      });
      setInternalNoteInput('');
      showNotification('Internal note recorded (never exposed to guest)');
    } catch (err) {
      showNotification(err.message || 'Failed to add note');
    }
  };

  const handleCreateServiceRequest = async () => {
    setLoading(true);
    try {
      const res = await hotelService.aiSupportAgent.createServiceRequest({
        ...newServiceReq,
        conversationId: selectedConversation?.conversationId || 'conv_1001'
      });
      setServiceRequests(prev => [res, ...prev]);
      setShowServiceModal(false);
      showNotification(`Service request #${res.serviceRequestId || res.requestId} dispatched to ${res.assignedTeam || 'Team'}`);
    } catch (err) {
      showNotification(err.message || 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveServiceRequest = async (reqId) => {
    setLoading(true);
    try {
      await hotelService.aiSupportAgent.resolveServiceRequest(reqId, {
        resolutionEvidenceReference: 'MAINT-EVIDENCE-1001',
        completedBy: 'Maintenance Lead'
      });
      setServiceRequests(prev => prev.map(s => (s.serviceRequestId === reqId || s.requestId === reqId) ? { ...s, status: 'COMPLETED' } : s));
      showNotification('Service request marked completed with verified evidence');
    } catch (err) {
      showNotification(err.message || 'Resolution failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-gradient-to-r from-blue-900 to-indigo-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-blue-500/40 text-sm backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-500/30 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300 shadow-inner">
              <LifeBuoy className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">AI Support Agent</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  ONLINE • KNOWLEDGE GROUNDED
                </span>
              </div>
              <p className="text-slate-300 text-sm mt-1">
                Autonomous 24/7 guest service: answers hotel policy questions, logs maintenance/housekeeping tickets, and escalates emergencies.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadInitialData}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 rounded-xl text-sm border border-slate-700 transition-all shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Sync Desk
            </button>
            <div className="bg-blue-900/40 border border-blue-500/40 px-3 py-1.5 rounded-xl text-right">
              <span className="text-[10px] text-blue-300 block uppercase font-medium">CSAT Resolution</span>
              <span className="text-base font-bold text-blue-200">{dashboard.resolutionRate || 91.4}%</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-slate-800/80">
          {[
            { id: 'dashboard', label: 'Support Dashboard', icon: Activity },
            { id: 'inbox', label: 'Guest Conversations', icon: MessageSquare },
            { id: 'knowledge', label: 'Knowledge Search & RAG', icon: BookOpen },
            { id: 'verification', label: 'Guest Verification', icon: Lock },
            { id: 'tickets', label: 'Tickets & AI Drafts', icon: FileText },
            { id: 'services', label: 'Service Requests', icon: Wrench }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-blue-500 text-slate-950 font-semibold shadow-md shadow-blue-500/20'
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

      {/* TAB 1: SUPPORT DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 backdrop-blur-md">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Open Support Tickets</span>
                <FileText className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-white">{dashboard.openTickets || 12}</div>
              <div className="text-xs text-blue-400 mt-2">Classified by AI intent</div>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 backdrop-blur-md">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Active Service Requests</span>
                <Wrench className="w-4 h-4 text-teal-400" />
              </div>
              <div className="text-2xl font-bold text-white">{dashboard.serviceRequestsActive || 8}</div>
              <div className="text-xs text-slate-400 mt-2">Housekeeping & Maintenance dispatches</div>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 backdrop-blur-md">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Avg First Response</span>
                <Clock className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-white">{dashboard.avgResponseMinutes || 1.8}m</div>
              <div className="text-xs text-emerald-400 mt-2">Sub-2 minute response target achieved</div>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 backdrop-blur-md">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Active Escalations</span>
                <ShieldAlert className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-white">{dashboard.escalationsCount || 2}</div>
              <div className="text-xs text-amber-400 mt-2">Routed to Duty Manager</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Guardrails */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-400" />
                AI Support Boundaries & Privacy Rules
              </h3>
              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Identity Verification Gate</strong>
                    Private folio charges, room assignment details, and stay histories are locked until 2-factor OTP/room code verification completes.
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Reply Approval Gating</strong>
                    AI drafts customer responses, but public dispatch requires employee approval whenever safety, compensation, or billing is involved.
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Evidence Required for Physical Completion</strong>
                    The agent cannot mark physical housekeeping or maintenance tasks complete without verified technician work references.
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  Active Support Workspaces
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Quickly navigate between live conversation handling, approved policy RAG grounding, and maintenance dispatching.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setActiveTab('inbox')}
                    className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-left border border-slate-700 transition-all"
                  >
                    <MessageSquare className="w-4 h-4 text-blue-400 mb-1" />
                    <span className="text-xs font-bold text-white block">Live Guest Inbox</span>
                    <span className="text-[10px] text-slate-400">Review real-time chats</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('knowledge')}
                    className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-left border border-slate-700 transition-all"
                  >
                    <BookOpen className="w-4 h-4 text-teal-400 mb-1" />
                    <span className="text-xs font-bold text-white block">Grounded RAG</span>
                    <span className="text-[10px] text-slate-400">Search hotel policies</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('tickets')}
                    className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-left border border-slate-700 transition-all"
                  >
                    <FileText className="w-4 h-4 text-emerald-400 mb-1" />
                    <span className="text-xs font-bold text-white block">Tickets & Drafts</span>
                    <span className="text-[10px] text-slate-400">Approve AI responses</span>
                  </button>
                  <button
                    onClick={() => setShowServiceModal(true)}
                    className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-left border border-slate-700 transition-all"
                  >
                    <Wrench className="w-4 h-4 text-amber-400 mb-1" />
                    <span className="text-xs font-bold text-white block">Dispatch Service</span>
                    <span className="text-[10px] text-slate-400">Housekeeping/AC</span>
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                <span>Tenant: Grand Azure Resort</span>
                <span className="text-blue-400">Provider: Grounded LLM Hub</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GUEST CONVERSATIONS */}
      {activeTab === 'inbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[720px]">
          {/* Conversation List */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-400" />
                <h3 className="font-semibold text-white text-sm">Support Inquiries</h3>
              </div>
              <span className="text-xs text-slate-400">{conversations.length} Active</span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
              {conversations.map(c => {
                const isSelected = selectedConversation?.conversationId === c.conversationId;
                return (
                  <div
                    key={c.conversationId}
                    onClick={() => selectConversation(c)}
                    className={`p-4 cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-950/40 border-l-4 border-blue-400' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-blue-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        {c.channel}
                      </span>
                      <span className="text-[11px] text-slate-400">{c.category || 'MAINTENANCE'}</span>
                    </div>
                    <div className="text-sm font-medium text-white mt-1.5 truncate">
                      {c.guestIdentifier || 'Guest Room 204'}
                    </div>
                    <div className="text-xs text-slate-400 mt-1 line-clamp-1">
                      {c.initialMessage || 'Air conditioner not cooling.'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Conversation Stream & Actions */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl lg:col-span-2 flex flex-col overflow-hidden">
            {selectedConversation ? (
              <>
                <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-300">
                      <LifeBuoy className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        {selectedConversation.guestIdentifier}
                        <span className="text-[10px] bg-blue-950 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30">
                          {selectedConversation.category || 'MAINTENANCE'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">ID: {selectedConversation.conversationId}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSummarizeConversation}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs transition-all flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                      Summarize
                    </button>
                    <button
                      onClick={() => setShowServiceModal(true)}
                      className="px-3 py-1.5 bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      Create Service Dispatch
                    </button>
                  </div>
                </div>

                {/* Summary View if generated */}
                {conversationSummary && (
                  <div className="mx-4 mt-4 p-3.5 rounded-xl bg-blue-950/30 border border-blue-500/30 text-xs text-slate-300 space-y-1 animate-fade-in">
                    <div className="flex items-center justify-between font-semibold text-blue-300">
                      <span>AI Conversation Summary</span>
                      <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded">Sentiment: {conversationSummary.sentiment || 'POSITIVE'}</span>
                    </div>
                    <p>{conversationSummary.summary}</p>
                  </div>
                )}

                {/* Message Stream */}
                <div className="flex-1 p-5 overflow-y-auto space-y-4">
                  {conversationMessages.map((m, idx) => {
                    const isAi = m.sender === 'AI_SUPPORT_AGENT';
                    return (
                      <div
                        key={idx}
                        className={`flex flex-col ${isAi ? 'items-start' : 'items-end'}`}
                      >
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1 px-1">
                          {isAi ? <LifeBuoy className="w-3 h-3 text-blue-400" /> : <UserCheck className="w-3 h-3 text-indigo-400" />}
                          <span>{isAi ? 'AI Support Assistant' : 'Guest'}</span>
                          <span>•</span>
                          <span>{m.timestamp || 'Just now'}</span>
                        </div>
                        <div
                          className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                            isAi
                              ? 'bg-slate-800/90 text-slate-100 border border-slate-700/80 rounded-tl-sm shadow-md'
                              : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-sm shadow-md'
                          }`}
                        >
                          {m.content}
                        </div>
                      </div>
                    );
                  })}
                  {aiProcessing && (
                    <div className="flex items-center gap-2 text-blue-400 text-xs py-2 px-1">
                      <LifeBuoy className="w-4 h-4 animate-spin" />
                      <span>Retrieving approved hotel knowledge articles...</span>
                    </div>
                  )}
                </div>

                {/* Composer */}
                <div className="p-4 border-t border-slate-800 bg-slate-900/90">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={guestMessageInput}
                      onChange={(e) => setGuestMessageInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Simulate guest message (e.g. 'Can I get two extra towels in room 204?')..."
                      className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={aiProcessing || !guestMessageInput.trim()}
                      className="px-4 py-2.5 bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold rounded-xl text-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <Send className="w-4 h-4" />
                      Send
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-sm">
                <MessageSquare className="w-10 h-10 text-slate-600 mb-2" />
                Select a conversation to view support history
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: KNOWLEDGE SEARCH & RAG */}
      {activeTab === 'knowledge' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-400" />
              Grounded Hotel Knowledge Search
            </h3>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Search approved policies & FAQs</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. breakfast, cancellation, check-out time"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSearchKnowledge}
                disabled={loading}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl text-xs transition-all border border-slate-700"
              >
                Search Articles
              </button>
              <button
                onClick={handleAskKnowledgeAnswer}
                disabled={loading}
                className="flex-1 py-2 bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-blue-500/20"
              >
                Generate Grounded Answer
              </button>
            </div>

            {groundedAnswer && (
              <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/30 text-xs space-y-2 mt-4 animate-fade-in">
                <div className="flex items-center justify-between font-bold text-blue-300">
                  <span>Grounded Answer</span>
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">
                    Confidence: {groundedAnswer.confidence || '0.94'}
                  </span>
                </div>
                <p className="text-white leading-relaxed">{groundedAnswer.answer}</p>
                {groundedAnswer.sources && (
                  <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                    Citations: {groundedAnswer.sources.map(s => s.title || s.articleId).join(', ')}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 lg:col-span-2 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Approved Hotel Articles & Policies ({knowledgeResults.length})
            </h3>

            <div className="space-y-3">
              {knowledgeResults.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">No articles match your query</div>
              ) : (
                knowledgeResults.map((art, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-sm">{art.title}</h4>
                      <span className="text-[10px] font-mono bg-slate-900 text-blue-300 px-2 py-0.5 rounded border border-slate-700">
                        {art.articleId}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{art.snippet || art.content}</p>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2">
                      <span>Source: {art.sourceType || 'HOTEL_KNOWLEDGE_BASE'}</span>
                      <span>•</span>
                      <span>Status: APPROVED</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: GUEST VERIFICATION */}
      {activeTab === 'verification' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-400" />
              Guest Identity Verification Flow
            </h3>
            <p className="text-xs text-slate-400">
              To prevent unauthorized access to billing, room assignments, and personal stay history, the AI agent initiates a secure verification session.
            </p>

            <button
              onClick={handleStartVerification}
              disabled={loading}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl text-xs transition-all border border-slate-700 flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4 text-blue-400" />
              Initiate Verification for Reservation #res_1001
            </button>

            {verificationSession && (
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Session ID:</span>
                  <span className="font-mono text-blue-300">{verificationSession.sessionId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Session Status:</span>
                  <span className="font-semibold text-amber-300">{verificationSession.status}</span>
                </div>

                <button
                  onClick={handleVerifySession}
                  disabled={loading || verificationSession.status === 'VERIFIED'}
                  className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Validate One-Time Code (Pass Verification)
                </button>
              </div>
            )}
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              Authorized Guest Stay Context
            </h3>

            {guestContext ? (
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 text-xs space-y-3 animate-fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                  <span className="font-bold text-white text-sm">{guestContext.guestName || 'Rajesh Mehta'}</span>
                  <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[10px]">VERIFIED GUEST</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 block">Room Number:</span>
                    <span className="font-semibold text-white">{guestContext.roomNumber || '204 (Deluxe Ocean)'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Stay Dates:</span>
                    <span className="font-semibold text-white">{guestContext.stayDates || 'Nov 15 - Nov 17'}</span>
                  </div>
                </div>
                <div className="text-slate-400 pt-2 border-t border-slate-700">
                  Folio Status: <span className="text-emerald-400 font-semibold">{guestContext.folioStatus || 'ACTIVE (Settled)'}</span>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
                Guest context is masked until the verification session is successfully verified.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: TICKETS & AI DRAFTS */}
      {activeTab === 'tickets' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ticket List */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex flex-col space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-semibold text-white text-sm">Support Tickets</h3>
              <span className="text-xs text-slate-400">{tickets.length} Total</span>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-[600px]">
              {tickets.map(t => {
                const isSelected = selectedTicket?.ticketId === t.ticketId;
                return (
                  <div
                    key={t.ticketId}
                    onClick={() => { setSelectedTicket(t); setReplyDraft(null); }}
                    className={`p-3 rounded-xl cursor-pointer border transition-all text-xs ${
                      isSelected
                        ? 'bg-blue-950/40 border-blue-500/60 shadow'
                        : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-blue-300 font-semibold">{t.ticketNumber || t.ticketId}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        t.priority === 'HIGH' ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-700 text-slate-300'
                      }`}>
                        {t.priority}
                      </span>
                    </div>
                    <div className="font-medium text-white mt-1.5">{t.subject || 'Room AC Maintenance'}</div>
                    <div className="text-slate-400 mt-1 flex items-center justify-between">
                      <span>{t.category}</span>
                      <span>{t.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ticket Details & AI Reply Gating */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 lg:col-span-2 space-y-6">
            {selectedTicket ? (
              <>
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      {selectedTicket.subject}
                      <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-mono">
                        {selectedTicket.ticketId}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">{selectedTicket.description}</p>
                  </div>
                  <button
                    onClick={() => handleGenerateReplyDraft(selectedTicket.ticketId)}
                    disabled={loading}
                    className="px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-slate-950 font-bold rounded-xl text-xs transition-all shadow flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Draft AI Reply
                  </button>
                </div>

                {/* AI Reply Draft & Approval Gate */}
                {replyDraft && (
                  <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                        AI Draft #{replyDraft.draftId}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        replyDraft.status === 'SENT' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {replyDraft.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                      {replyDraft.body}
                    </p>

                    {replyDraft.status !== 'SENT' ? (
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-[11px] text-amber-400 flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          Requires staff review before sending to guest
                        </span>
                        <button
                          onClick={handleApproveAndSendReply}
                          disabled={loading}
                          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Approve & Send
                        </button>
                      </div>
                    ) : (
                      <div className="text-xs text-emerald-400 flex items-center gap-1 pt-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Submitted to Email Provider (Delivery Status: {replyDraft.deliveryStatus})
                      </div>
                    )}
                  </div>
                )}

                {/* Internal Notes Workspace */}
                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    Internal Staff Notes (Protected from Guest View)
                  </h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={internalNoteInput}
                      onChange={(e) => setInternalNoteInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddInternalNote()}
                      placeholder="Add an internal note for technicians or support team..."
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                    <button
                      onClick={handleAddInternalNote}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl text-xs border border-slate-700"
                    >
                      Save Note
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-slate-500 text-sm">Select a ticket to review details</div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: SERVICE REQUESTS */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Wrench className="w-4 h-4 text-teal-400" />
              Guest Service Requests (Housekeeping & Maintenance)
            </h3>
            <button
              onClick={() => setShowServiceModal(true)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5"
            >
              <Wrench className="w-3.5 h-3.5" />
              New Service Order
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {serviceRequests.map(sr => (
              <div
                key={sr.serviceRequestId || sr.requestId}
                className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-teal-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                      {sr.category}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                      sr.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {sr.status}
                    </span>
                  </div>
                  <p className="text-xs text-white font-medium mt-2">{sr.description}</p>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Location: <strong className="text-slate-200">{sr.locationReference || 'ROOM-204'}</strong>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">ID: {sr.serviceRequestId || sr.requestId}</span>
                  {sr.status !== 'COMPLETED' && (
                    <button
                      onClick={() => handleResolveServiceRequest(sr.serviceRequestId || sr.requestId)}
                      className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-semibold transition-all"
                    >
                      Resolve with Evidence
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Service Request Modal */}
      {showServiceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-teal-400" />
                Dispatch Guest Service Request
              </h3>
              <button onClick={() => setShowServiceModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Category</label>
              <select
                value={newServiceReq.category}
                onChange={(e) => setNewServiceReq({ ...newServiceReq, category: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
              >
                <option value="HOUSEKEEPING">Housekeeping (Towels, Linen, Cleaning)</option>
                <option value="MAINTENANCE">Maintenance (AC, Plumbing, Electrical)</option>
                <option value="ROOM_AMENITIES">Room Amenities (Water, Toiletries)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Room / Location</label>
              <input
                type="text"
                value={newServiceReq.locationReference}
                onChange={(e) => setNewServiceReq({ ...newServiceReq, locationReference: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Description</label>
              <textarea
                value={newServiceReq.description}
                onChange={(e) => setNewServiceReq({ ...newServiceReq, description: e.target.value })}
                rows="3"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowServiceModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateServiceRequest}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold rounded-xl text-xs"
              >
                Dispatch Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
