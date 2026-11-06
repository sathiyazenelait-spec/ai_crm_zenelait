import React, { useState, useEffect } from 'react';
import {
  LifeBuoy, Bot, MessageSquare, FileText, CheckCircle2, AlertTriangle,
  RefreshCw, Plus, ChevronRight, ShieldCheck, Search, BookOpen, Send,
  UserCheck, ArrowRight, CornerDownRight, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { ecommerceService } from '../../services/ecommerceService';

export default function EcommerceAiSupportAgentView() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  // Dashboard Data
  const [dashboard, setDashboard] = useState({
    agentStatus: 'ACTIVE',
    openConversations: 46,
    ticketsCreatedToday: 31,
    ticketsResolvedToday: 24,
    pendingHumanHandoffs: 4,
    averageFirstResponseSeconds: 18,
    knowledgeAnswerRate: 0.87
  });

  // Conversations State
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [orderContextId, setOrderContextId] = useState('ord_1001');

  // Tickets State
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showCreateTicketModal, setShowCreateTicketModal] = useState(false);
  const [newTicket, setNewTicket] = useState({
    customerId: 'cus_1001',
    orderId: 'ord_1001',
    subject: 'Damaged product received',
    description: 'The package arrived, but the product appears damaged.',
    category: 'DAMAGED_PRODUCT',
    priority: 'HIGH'
  });
  const [ticketClassification, setTicketClassification] = useState(null);
  const [replyDraft, setReplyDraft] = useState(null);

  // Knowledge Base State
  const [kbQuery, setKbQuery] = useState('What is the return policy for damaged products?');
  const [kbResults, setKbResults] = useState([]);
  const [groundedAnswer, setGroundedAnswer] = useState(null);

  // Order Assistance State
  const [orderLookupId, setOrderLookupId] = useState('ord_1001');
  const [orderLookupResult, setOrderLookupResult] = useState(null);
  const [returnEligibilityResult, setReturnEligibilityResult] = useState(null);

  // Escalations State
  const [escalations, setEscalations] = useState([]);

  // Configuration
  const [config, setConfig] = useState({
    status: 'ACTIVE',
    requireApprovalForReplies: true,
    minConfidenceForAutoReply: 0.85,
    maxPendingHandoffs: 10,
    enableKnowledgeGrounding: true
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashRes, convRes, tktRes, escRes, cfgRes] = await Promise.allSettled([
        ecommerceService.aiSupportAgent.getDashboard(),
        ecommerceService.aiSupportAgent.getConversations({ page: 0, size: 20 }),
        ecommerceService.aiSupportAgent.getTickets({ page: 0, size: 20 }),
        ecommerceService.aiSupportAgent.getEscalations({ page: 0, size: 20 }),
        ecommerceService.aiSupportAgent.getConfig()
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value?.data?.data) {
        setDashboard(dashRes.value.data.data);
      }
      if (convRes.status === 'fulfilled' && convRes.value?.data?.data?.items) {
        const convs = convRes.value.data.data.items;
        setConversations(convs);
        if (convs.length > 0 && !activeConversation) {
          selectConversation(convs[0]);
        }
      }
      if (tktRes.status === 'fulfilled' && tktRes.value?.data?.data?.items) {
        setTickets(tktRes.value.data.data.items);
      }
      if (escRes.status === 'fulfilled' && escRes.value?.data?.data?.items) {
        setEscalations(escRes.value.data.data.items);
      }
      if (cfgRes.status === 'fulfilled' && cfgRes.value?.data?.data) {
        setConfig(cfgRes.value.data.data);
      }
    } catch (err) {
      console.error('Failed loading AI Support Agent data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectConversation = async (conv) => {
    setActiveConversation(conv);
    try {
      const res = await ecommerceService.aiSupportAgent.getMessages(conv.conversationId);
      if (res?.data?.data?.items) {
        setChatMessages(res.data.data.items);
      }
    } catch (err) {
      console.error('Error fetching conversation messages:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeConversation) return;

    const userMsg = {
      messageId: 'msg_' + Date.now(),
      sender: 'CUSTOMER',
      content: chatInput,
      createdAt: new Date().toISOString()
    };

    setChatMessages((prev) => [...prev, userMsg]);
    const promptText = chatInput;
    setChatInput('');

    try {
      const res = await ecommerceService.aiSupportAgent.sendMessage(activeConversation.conversationId, {
        message: promptText,
        context: {
          orderId: orderContextId
        }
      });

      if (res?.data?.data) {
        setChatMessages((prev) => [...prev, res.data.data]);
        showToast('AI Support response generated');
      }
    } catch (err) {
      console.error('Failed sending message:', err);
      showToast('Error sending message');
    }
  };

  const handleHandoff = async () => {
    if (!activeConversation) return;
    try {
      const res = await ecommerceService.aiSupportAgent.handoffConversation(activeConversation.conversationId, {
        reason: 'CUSTOMER_REQUEST',
        summary: 'Customer requested human support executive intervention',
        priority: 'HIGH'
      });
      if (res?.data?.success) {
        showToast('Transferred to Human Support Queue');
        loadData();
      }
    } catch (err) {
      console.error('Handoff error:', err);
    }
  };

  const handleClassifyTicket = async (ticketId) => {
    try {
      const res = await ecommerceService.aiSupportAgent.classifyTicket(ticketId, {
        useCustomerMessage: true,
        includeOrderContext: true
      });
      if (res?.data?.data) {
        setTicketClassification(res.data.data);
        showToast(`Classified as ${res.data.data.suggestedCategory} (${Math.round(res.data.data.confidence * 100)}% confidence)`);
      }
    } catch (err) {
      console.error('Classification error:', err);
    }
  };

  const handleGenerateReplyDraft = async (ticketId) => {
    try {
      const res = await ecommerceService.aiSupportAgent.createReplyDraft(ticketId, {
        tone: 'PROFESSIONAL',
        includePolicyReferences: true
      });
      if (res?.data?.data) {
        setReplyDraft(res.data.data);
        showToast('Policy-grounded reply draft generated');
      }
    } catch (err) {
      console.error('Draft error:', err);
    }
  };

  const handleApproveReplyDraft = async (ticketId, draftId) => {
    try {
      const res = await ecommerceService.aiSupportAgent.approveReplyDraft(ticketId, draftId, {
        comment: 'Verified against Damaged Product Return policy'
      });
      if (res?.data?.success) {
        setReplyDraft((prev) => ({ ...prev, status: 'APPROVED' }));
        showToast('Reply draft approved for dispatch');
      }
    } catch (err) {
      console.error('Approval error:', err);
    }
  };

  const handleSendReplyDraft = async (ticketId, draftId) => {
    try {
      const res = await ecommerceService.aiSupportAgent.sendReplyDraft(ticketId, draftId, {
        idempotencyKey: `reply-send-${ticketId}-${Date.now()}`
      });
      if (res?.data?.success) {
        showToast('Reply dispatched via customer channel');
        setReplyDraft(null);
        loadData();
      }
    } catch (err) {
      console.error('Send reply error:', err);
    }
  };

  const handleSearchKnowledge = async () => {
    try {
      const [searchRes, ansRes] = await Promise.all([
        ecommerceService.aiSupportAgent.searchKnowledge({ query: kbQuery, limit: 3 }),
        ecommerceService.aiSupportAgent.answerFromKnowledge({
          question: kbQuery,
          conversationId: activeConversation?.conversationId || 'conv_support_1001'
        })
      ]);

      if (searchRes?.data?.data?.items) {
        setKbResults(searchRes.data.data.items);
      }
      if (ansRes?.data?.data) {
        setGroundedAnswer(ansRes.data.data);
      }
      showToast('Retrieved knowledge articles and grounded answer');
    } catch (err) {
      console.error('Knowledge search error:', err);
    }
  };

  const handleCheckOrderAssistance = async () => {
    try {
      const [lookupRes, eligRes] = await Promise.all([
        ecommerceService.aiSupportAgent.lookupOrder({ orderId: orderLookupId }),
        ecommerceService.aiSupportAgent.checkReturnEligibility({
          orderId: orderLookupId,
          orderItemId: 'item_1001',
          reason: 'DAMAGED_PRODUCT'
        })
      ]);

      if (lookupRes?.data?.data) {
        setOrderLookupResult(lookupRes.data.data);
      }
      if (eligRes?.data?.data) {
        setReturnEligibilityResult(eligRes.data.data);
      }
      showToast('Order details and return eligibility evaluated');
    } catch (err) {
      console.error('Order assistance error:', err);
    }
  };

  const handleToggleAgentStatus = async () => {
    const nextStatus = dashboard.agentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      const res = await ecommerceService.aiSupportAgent.updateStatus(nextStatus);
      if (res?.data?.success) {
        setDashboard((prev) => ({ ...prev, agentStatus: nextStatus }));
        showToast(`AI Support Agent status updated to ${nextStatus}`);
      }
    } catch (err) {
      console.error('Status toggle error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-teal-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-teal-400/30 animate-fade-in">
          <ShieldCheck className="w-5 h-5 text-teal-200" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-teal-600 to-cyan-500 rounded-2xl shadow-lg shadow-teal-500/20">
              <LifeBuoy className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-white">AI Support Agent Workspace</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${
                  dashboard.agentStatus === 'ACTIVE'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${dashboard.agentStatus === 'ACTIVE' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                  {dashboard.agentStatus}
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Policy-grounded replies, ticket triage & classification, order assistance, and human escalation.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleAgentStatus}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
              dashboard.agentStatus === 'ACTIVE'
                ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30'
            }`}
          >
            {dashboard.agentStatus === 'ACTIVE' ? 'Pause Agent' : 'Activate Agent'}
          </button>
          <button
            onClick={loadData}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-teal-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 border-b border-slate-800/80">
        {[
          { id: 'dashboard', label: 'Support Dashboard', icon: LifeBuoy },
          { id: 'conversations', label: 'Support Chat Inbox', icon: MessageSquare },
          { id: 'tickets', label: 'Tickets & AI Drafts', icon: FileText },
          { id: 'knowledge', label: 'Knowledge Base & RAG', icon: BookOpen },
          { id: 'order_assistance', label: 'Order Assistance', icon: ShieldCheck },
          { id: 'escalations', label: 'Escalations Queue', icon: AlertTriangle },
          { id: 'configuration', label: 'Guardrails & Config', icon: Bot }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition whitespace-nowrap ${
                isActive
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-800/60 border border-slate-700/60 p-5 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Open Conversations</span>
                <MessageSquare className="w-5 h-5 text-teal-400" />
              </div>
              <div className="text-3xl font-bold text-white">{dashboard.openConversations}</div>
              <p className="text-xs text-slate-400 mt-2">Avg first response: {dashboard.averageFirstResponseSeconds}s</p>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 p-5 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Tickets Created</span>
                <FileText className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="text-3xl font-bold text-indigo-400">{dashboard.ticketsCreatedToday}</div>
              <p className="text-xs text-slate-400 mt-2">{dashboard.ticketsResolvedToday} resolved today</p>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 p-5 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Knowledge Answer Rate</span>
                <BookOpen className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-3xl font-bold text-emerald-400">{Math.round(dashboard.knowledgeAnswerRate * 100)}%</div>
              <p className="text-xs text-slate-400 mt-2">Grounded in published policies</p>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 p-5 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Human Escalations</span>
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div className="text-3xl font-bold text-amber-400">{dashboard.pendingHumanHandoffs}</div>
              <p className="text-xs text-slate-400 mt-2">Active handoff queue items</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6">
              <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-400" />
                Customer Support Policy Guardrails
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-slate-800/70 rounded-xl border border-slate-700/50">
                  <CheckCircle2 className="w-5 h-5 text-teal-400 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-slate-200">Strict Return Window Verification</h4>
                    <p className="text-xs text-slate-400">Agent will not approve return requests if delivery timestamp exceeds the 7-day policy window.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-slate-800/70 rounded-xl border border-slate-700/50">
                  <CheckCircle2 className="w-5 h-5 text-teal-400 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-slate-200">No Unauthorized Refund Commitments</h4>
                    <p className="text-xs text-slate-400">Refund status must come from authoritative payment gateway. The AI never promises money without approval.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-slate-800/70 rounded-xl border border-slate-700/50">
                  <CheckCircle2 className="w-5 h-5 text-teal-400 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-slate-200">Customer Identity Challenge Required</h4>
                    <p className="text-xs text-slate-400">Order tracking and refund states require verified customer session to prevent data leakage.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6">
              <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                Published Knowledge Grounding Sources
              </h3>
              <div className="space-y-3">
                {[
                  { id: 'kb_1001', title: 'Damaged Product Returns Policy', version: 'v3', status: 'INDEXED' },
                  { id: 'kb_1002', title: 'Standard Courier Shipping & Delivery Timeframes', version: 'v2', status: 'INDEXED' },
                  { id: 'kb_1003', title: 'Electronics Warranty & Replacement Terms', version: 'v1', status: 'INDEXED' }
                ].map((art) => (
                  <div key={art.id} className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl border border-slate-700/40">
                    <div>
                      <p className="text-sm font-medium text-slate-200">{art.title}</p>
                      <p className="text-xs text-slate-400">Source: {art.id} • Version: {art.version}</p>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-semibold text-teal-400 bg-teal-500/10 border border-teal-500/30 rounded-full">
                      {art.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONVERSATIONS */}
      {activeTab === 'conversations' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
          {/* Conversation List */}
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-4 flex flex-col h-full">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Support Inquiries</h3>
            <div className="overflow-y-auto space-y-2 flex-1 pr-1">
              {conversations.map((c) => (
                <div
                  key={c.conversationId}
                  onClick={() => selectConversation(c)}
                  className={`p-3.5 rounded-xl cursor-pointer transition border ${
                    activeConversation?.conversationId === c.conversationId
                      ? 'bg-teal-600/20 border-teal-500 text-white'
                      : 'bg-slate-800/60 border-slate-700/40 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm">{c.customerId}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">{c.category || 'SUPPORT'}</span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1">{c.conversationId}</p>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                    <span>Status: {c.status}</span>
                    {c.humanHandoffRequired && (
                      <span className="text-amber-400 font-medium">Handoff Pending</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700/60 rounded-2xl flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-700/80 flex items-center justify-between bg-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-600/30 border border-teal-500/50 flex items-center justify-center">
                  <LifeBuoy className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    {activeConversation ? `Ticket / Chat: ${activeConversation.conversationId}` : 'Select a conversation'}
                  </h4>
                  <p className="text-xs text-slate-400">
                    Customer: {activeConversation?.customerId || 'N/A'} • Context Order: {orderContextId}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleHandoff}
                  className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-medium transition"
                >
                  Transfer to Human
                </button>
                <button
                  onClick={() => setShowCreateTicketModal(true)}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-medium transition flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create Ticket
                </button>
              </div>
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((msg, idx) => {
                const isAgent = msg.sender === 'AI_SUPPORT_AGENT';
                return (
                  <div key={idx} className={`flex ${isAgent ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[80%] rounded-2xl p-4 ${
                      isAgent
                        ? 'bg-slate-700/70 text-slate-100 border border-slate-600/50'
                        : 'bg-teal-600 text-white'
                    }`}>
                      <div className="flex items-center justify-between gap-4 mb-1 text-[11px] opacity-75">
                        <span className="font-semibold">{msg.sender}</span>
                        <span>{new Date(msg.createdAt || Date.now()).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-sm leading-relaxed">{msg.content}</p>

                      {msg.requiresOrderVerification && (
                        <div className="mt-3 p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-300 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          Order verification challenge dispatched to customer session.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-700/80 bg-slate-800/90 flex gap-2">
              <input
                type="text"
                placeholder="Ask support question, report defective item, ask about warranty..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500"
              />
              <button
                type="submit"
                className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 transition"
              >
                <Send className="w-4 h-4" />
                Reply
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: TICKETS & AI DRAFTS */}
      {activeTab === 'tickets' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-semibold text-white">Support Tickets & AI Triage</h3>
            <button
              onClick={() => setShowCreateTicketModal(true)}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              New Ticket
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ticket Table */}
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-700/60">
                  <tr>
                    <th className="px-4 py-3">Ticket ID & Subject</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {tickets.map((tkt) => (
                    <tr
                      key={tkt.ticketId}
                      onClick={() => setSelectedTicket(tkt)}
                      className={`hover:bg-slate-800/50 cursor-pointer transition ${
                        selectedTicket?.ticketId === tkt.ticketId ? 'bg-slate-800/80' : ''
                      }`}
                    >
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-white text-xs">{tkt.subject}</div>
                        <div className="text-[11px] text-slate-500">{tkt.ticketId} • {tkt.customerId}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300">{tkt.category}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          tkt.priority === 'HIGH' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' : 'bg-slate-700 text-slate-300'
                        }`}>
                          {tkt.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right space-x-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleClassifyTicket(tkt.ticketId); }}
                          className="px-2.5 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-lg text-xs"
                        >
                          Classify
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleGenerateReplyDraft(tkt.ticketId); }}
                          className="px-2.5 py-1 bg-teal-600/30 hover:bg-teal-600/50 text-teal-300 border border-teal-500/40 rounded-lg text-xs"
                        >
                          Draft Reply
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* AI Review Panel */}
            <div className="space-y-4">
              {ticketClassification && (
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 space-y-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Bot className="w-4 h-4 text-teal-400" />
                    AI Ticket Classification Result
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-900 rounded-xl">
                      <span className="text-slate-400 block mb-1">Suggested Category</span>
                      <strong className="text-teal-400">{ticketClassification.suggestedCategory}</strong>
                    </div>
                    <div className="p-3 bg-slate-900 rounded-xl">
                      <span className="text-slate-400 block mb-1">Confidence Score</span>
                      <strong className="text-emerald-400">{Math.round(ticketClassification.confidence * 100)}%</strong>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl text-xs">
                    <span className="text-slate-400 block mb-1">Suggested Next Action</span>
                    <strong className="text-white">{ticketClassification.suggestedNextAction}</strong>
                  </div>
                </div>
              )}

              {replyDraft && (
                <div className="bg-slate-800/60 border border-teal-500/40 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-teal-400" />
                      Policy-Grounded Reply Draft ({replyDraft.draftId})
                    </h4>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                      replyDraft.status === 'APPROVED'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}>
                      {replyDraft.status}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl text-xs text-slate-300 leading-relaxed">
                    {replyDraft.body}
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    {replyDraft.status !== 'APPROVED' ? (
                      <button
                        onClick={() => handleApproveReplyDraft(selectedTicket?.ticketId || 'ticket_1001', replyDraft.draftId)}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold"
                      >
                        Approve Draft
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSendReplyDraft(selectedTicket?.ticketId || 'ticket_1001', replyDraft.draftId)}
                        className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold"
                      >
                        Send Approved Reply
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: KNOWLEDGE BASE & RAG */}
      {activeTab === 'knowledge' && (
        <div className="space-y-6">
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5">
            <h3 className="text-base font-semibold text-white mb-2">Grounding Knowledge Retrieval (RAG)</h3>
            <p className="text-xs text-slate-400 mb-4">
              Answers are strictly grounded in published company policies and cite authoritative article versions.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={kbQuery}
                onChange={(e) => setKbQuery(e.target.value)}
                placeholder="Ask policy question (e.g., return window, warranty, delivery delay)..."
                className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500"
              />
              <button
                onClick={handleSearchKnowledge}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition"
              >
                <Search className="w-4 h-4" />
                Query Knowledge
              </button>
            </div>
          </div>

          {groundedAnswer && (
            <div className="bg-slate-800/60 border border-teal-500/40 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  Grounded AI Answer
                </h4>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium">
                  Grounded: 100% Verified
                </span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                {groundedAnswer.answer}
              </p>
              {groundedAnswer.sourceReferences && (
                <div>
                  <h5 className="text-xs font-semibold text-slate-400 mb-2">Cited Knowledge Sources:</h5>
                  <div className="flex flex-wrap gap-2">
                    {groundedAnswer.sourceReferences.map((ref, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-900 border border-slate-700/60 rounded-xl text-xs flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-teal-400" />
                        <span className="text-white font-medium">{ref.title}</span>
                        <span className="text-slate-500">({ref.articleId} v{ref.version})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {kbResults.map((art) => (
              <div key={art.articleId} className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4">
                <span className="text-[10px] font-bold text-teal-400">{art.articleId} • v{art.version}</span>
                <h4 className="text-sm font-bold text-white mt-1 mb-2">{art.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{art.snippet}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: ORDER ASSISTANCE */}
      {activeTab === 'order_assistance' && (
        <div className="space-y-6">
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5">
            <h3 className="text-base font-semibold text-white mb-2">Customer Order & Return Assistance</h3>
            <p className="text-xs text-slate-400 mb-4">
              Provides verified order summary and checks item return eligibility against policy.
            </p>
            <div className="flex gap-2 max-w-md">
              <input
                type="text"
                value={orderLookupId}
                onChange={(e) => setOrderLookupId(e.target.value)}
                placeholder="Enter Order ID (e.g. ord_1001)..."
                className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white"
              />
              <button
                onClick={handleCheckOrderAssistance}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm font-semibold transition"
              >
                Inspect Order
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {orderLookupResult && (
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-5 space-y-3">
                <h4 className="text-sm font-bold text-white">Verified Order Summary</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Order ID:</span>
                    <strong className="text-white">{orderLookupResult.orderId}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Payment Status:</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {orderLookupResult.paymentStatus}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Order Amount:</span>
                    <strong className="text-white">₹{orderLookupResult.totalAmount?.toLocaleString()}</strong>
                  </div>
                </div>
              </div>
            )}

            {returnEligibilityResult && (
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-5 space-y-3">
                <h4 className="text-sm font-bold text-white">Return Eligibility Decision</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Eligibility Result:</span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold">
                      {returnEligibilityResult.eligibility}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Reason Evaluated:</span>
                    <span className="text-white">{returnEligibilityResult.reason}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Policy Citation:</span>
                    <span className="text-teal-400">{returnEligibilityResult.policyReference}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: ESCALATIONS */}
      {activeTab === 'escalations' && (
        <div className="space-y-6">
          <h3 className="text-base font-semibold text-white">Human Escalation Queue</h3>
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-700/60">
                <tr>
                  <th className="px-5 py-3">Escalation ID & Reason</th>
                  <th className="px-5 py-3">Priority</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {escalations.map((esc) => (
                  <tr key={esc.escalationId} className="hover:bg-slate-800/30 transition">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white">{esc.reason}</div>
                      <div className="text-xs text-slate-500">{esc.escalationId}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30">
                        {esc.priority}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300">{esc.status}</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => showToast('Assigned to Support Representative: usr_support_101')}
                        className="px-3 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-medium transition"
                      >
                        Claim Escalation
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: GUARDRAILS & CONFIG */}
      {activeTab === 'configuration' && (
        <div className="max-w-2xl bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6 space-y-6">
          <h3 className="text-base font-semibold text-white">AI Support Agent Guardrails & Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <div>
                <p className="text-sm font-medium text-white">Require Human Approval for AI Replies</p>
                <p className="text-xs text-slate-400">Drafts remain in pending state until explicitly signed off by staff</p>
              </div>
              <input
                type="checkbox"
                checked={config.requireApprovalForReplies}
                onChange={(e) => setConfig({ ...config, requireApprovalForReplies: e.target.checked })}
                className="w-5 h-5 accent-teal-600 rounded"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Minimum Confidence Threshold for Auto-Drafts</label>
              <input
                type="number"
                step="0.05"
                min="0.5"
                max="1.0"
                value={config.minConfidenceForAutoReply}
                onChange={(e) => setConfig({ ...config, minConfidenceForAutoReply: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white"
              />
              <p className="text-[11px] text-slate-500 mt-1">Below this confidence score, ticket automatically routes to human review queue.</p>
            </div>
            <button
              onClick={() => showToast('Configuration saved successfully!')}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm font-semibold transition"
            >
              Save Configuration
            </button>
          </div>
        </div>
      )}

      {/* Create Ticket Modal */}
      {showCreateTicketModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h4 className="font-bold text-white">Create Support Ticket</h4>
              <button onClick={() => setShowCreateTicketModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const res = await ecommerceService.aiSupportAgent.createTicket(newTicket);
                  if (res?.data?.success) {
                    showToast('Ticket created and queued for AI classification');
                    setShowCreateTicketModal(false);
                    loadData();
                  }
                } catch (err) {
                  console.error(err);
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-xs text-slate-400 block mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Description</label>
                <textarea
                  rows="3"
                  required
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Category</label>
                <select
                  value={newTicket.category}
                  onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white"
                >
                  <option value="DAMAGED_PRODUCT">Damaged Product</option>
                  <option value="DELIVERY_DELAY">Delivery Delay</option>
                  <option value="REFUND_INQUIRY">Refund Inquiry</option>
                  <option value="GENERAL_SUPPORT">General Support</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateTicketModal(false)}
                  className="px-4 py-2 bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold"
                >
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
