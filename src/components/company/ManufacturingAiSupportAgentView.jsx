import React, { useState, useEffect } from 'react';
import { useCRM } from '../../context/CRMContext';
import { manufacturingService } from '../../services/manufacturingService';
import {
  LifeBuoy,
  MessageSquare,
  Sparkles,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  UserCheck,
  FileText,
  RotateCcw,
  Truck,
  ShieldCheck,
  Send,
  HelpCircle,
  Eye,
  Check,
  X,
  Lock,
  Unlock,
  Package
} from 'lucide-react';

export function ManufacturingAiSupportAgentView() {
  const { addNotification } = useCRM();

  const [activeTab, setActiveTab] = useState('conversations'); // 'conversations' | 'verification' | 'orders' | 'tickets' | 'drafts' | 'returns'
  const [isLoading, setIsLoading] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');

  // Customer verification state
  const [verification, setVerification] = useState({
    verificationId: 'VER-3001',
    conversationId: 'SUPC-1001',
    status: 'PENDING',
    verificationMethod: 'REGISTERED_CHANNEL_CHALLENGE',
    expiresAt: '2026-10-29T08:10:00+05:30'
  });

  // Intent & order state
  const [classifiedIntent, setClassifiedIntent] = useState({
    intent: 'ORDER_DELIVERY_ENQUIRY',
    confidence: 0.96,
    prioritySuggestion: 'MEDIUM',
    requiresCustomerVerification: true,
    recommendedAction: 'VERIFY_CUSTOMER_AND_LOOKUP_ORDER'
  });

  const [orderStatus, setOrderStatus] = useState({
    orderId: 'ORD-1001',
    status: 'IN_PRODUCTION',
    expectedDispatchDate: null,
    deliveryStatus: 'NOT_DISPATCHED',
    source: 'ORDER_MANAGEMENT_SYSTEM',
    lastUpdatedAt: '2026-10-29T07:30:00+05:30'
  });

  // AI draft response state
  const [responseDraft, setResponseDraft] = useState({
    responseId: 'RSP-8001',
    ticketId: 'TKT-7001',
    draft: 'We are checking the latest order information. Our support team will provide an update once the current status has been verified.',
    sourceReferences: [],
    status: 'DRAFT',
    requiresHumanReview: true
  });

  const [validationResult, setValidationResult] = useState({
    validationStatus: 'PASSED_WITH_REVIEW_REQUIRED',
    checks: {
      containsUnsupportedClaims: false,
      containsRestrictedCustomerData: false,
      usesApprovedSources: true
    },
    humanApprovalRequired: true
  });

  // Modals
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showRmaModal, setShowRmaModal] = useState(false);
  const [showHandoffModal, setShowHandoffModal] = useState(false);

  const [ticketForm, setTicketForm] = useState({
    customerId: 'CUS-1001',
    category: 'ORDER_DELIVERY',
    subject: 'Order delivery delay enquiry',
    description: 'Customer reports that the expected equipment delivery has not occurred.',
    priority: 'MEDIUM'
  });

  const [rmaForm, setRmaForm] = useState({
    customerId: 'CUS-1001',
    orderId: 'ORD-1001',
    productId: 'PRD-2001',
    quantity: 1,
    reason: 'PRODUCT_DEFECT_REPORTED',
    description: 'Customer reports a temperature anomaly with the delivered industrial motor.'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [dashRes, convsRes, orderRes] = await Promise.allSettled([
        manufacturingService.aiSupportAgent.getDashboard(),
        manufacturingService.aiSupportAgent.getConversations(),
        manufacturingService.aiSupportAgent.getOrderStatus('ORD-1001')
      ]);

      if (dashRes.status === 'fulfilled') setDashboard(dashRes.value);
      if (orderRes.status === 'fulfilled') setOrderStatus(orderRes.value);

      if (convsRes.status === 'fulfilled' && convsRes.value.length > 0) {
        setConversations(convsRes.value);
        setSelectedConv(convsRes.value[0]);
        loadMessages(convsRes.value[0].conversationId);
      } else {
        const seed = {
          conversationId: 'SUPC-1001',
          channel: 'WEBSITE_CHAT',
          visitorReference: 'VIS-2001',
          status: 'ACTIVE',
          verificationStatus: 'NOT_VERIFIED',
          ticketId: null
        };
        setConversations([seed]);
        setSelectedConv(seed);
        loadMessages('SUPC-1001');
      }
    } catch (err) {
      console.warn('Fallback loading:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (convId) => {
    try {
      const res = await manufacturingService.aiSupportAgent.getMessages(convId);
      if (res && res.length > 0) {
        setMessages(res);
      } else {
        setMessages([
          {
            messageId: 'sup-1',
            sender: 'CUSTOMER',
            content: 'My industrial equipment order ORD-1001 has not arrived. Can you check its status?',
            timestamp: '08:05 AM'
          },
          {
            messageId: 'sup-2',
            sender: 'AI_AGENT',
            content: 'I will certainly assist you with order status. To protect your commercial account details, please complete the quick registered channel challenge verification.',
            timestamp: '08:05 AM'
          }
        ]);
      }
    } catch {
      // Keep initial
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg = {
      messageId: `msg-${Date.now()}`,
      sender: 'CUSTOMER',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newMsg]);
    setInputMessage('');

    try {
      const convId = selectedConv ? selectedConv.conversationId : 'SUPC-1001';
      await manufacturingService.aiSupportAgent.addMessage(convId, { message: newMsg.content, sender: 'CUSTOMER' });

      setTimeout(() => {
        const aiMsg = {
          messageId: `msg-ai-${Date.now()}`,
          sender: 'AI_AGENT',
          content: 'Thank you. I have verified your registered customer record for Example Industrial Works. Our production records confirm Order ORD-1001 is on the assembly line (IN_PRODUCTION). Expected dispatch will be updated once quality checks conclude.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiMsg]);
      }, 700);
    } catch (err) {
      console.warn('Send message fallback:', err);
    }
  };

  const handleCompleteVerification = async () => {
    try {
      const verId = verification.verificationId || 'VER-3001';
      await manufacturingService.aiSupportAgent.completeVerification(verId, { method: 'CHALLENGE_ACCEPTED' });
      setVerification(prev => ({ ...prev, status: 'VERIFIED' }));
      setSelectedConv(prev => ({ ...prev, verificationStatus: 'VERIFIED' }));
      addNotification?.({ type: 'success', message: 'Customer identity verified! Order and invoice context unlocked.' });
    } catch (err) {
      addNotification?.({ type: 'error', message: err.message || 'Verification failed' });
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      const convId = selectedConv ? selectedConv.conversationId : 'SUPC-1001';
      const res = await manufacturingService.aiSupportAgent.createTicket({
        ...ticketForm,
        conversationId: convId
      });
      addNotification?.({ type: 'success', message: `Support Ticket ${res.ticketId || 'TKT-7001'} created and assigned to Customer Support queue.` });
      setShowTicketModal(false);
    } catch (err) {
      addNotification?.({ type: 'error', message: err.message || 'Ticket creation failed' });
    }
  };

  const handleCreateRma = async (e) => {
    e.preventDefault();
    try {
      const res = await manufacturingService.aiSupportAgent.createReturnRequest(rmaForm);
      addNotification?.({ type: 'success', message: `Return Request (RMA) ${res.requestId || 'RET-9001'} submitted for policy eligibility review.` });
      setShowRmaModal(false);
      setActiveTab('returns');
    } catch (err) {
      addNotification?.({ type: 'error', message: err.message || 'Return request creation failed' });
    }
  };

  const handleHandoff = async () => {
    try {
      const convId = selectedConv ? selectedConv.conversationId : 'SUPC-1001';
      await manufacturingService.aiSupportAgent.handoffConversation(convId, {
        reason: 'Customer requires investigation into a delayed order',
        targetTeam: 'CUSTOMER_SUPPORT',
        summary: 'Customer reports delayed order delivery. Verification passed.'
      });
      addNotification?.({ type: 'info', message: 'Conversation transferred to Human Support queue (HANDOFF_PENDING)' });
      setShowHandoffModal(false);
      setSelectedConv(prev => ({ ...prev, status: 'HANDOFF_PENDING' }));
    } catch (err) {
      addNotification?.({ type: 'error', message: err.message || 'Handoff failed' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center gap-1">
              <LifeBuoy className="w-3.5 h-3.5" /> First-Line AI Support Agent
            </span>
            <span className="px-2.5 py-1 text-xs font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-full">
              Multichannel Manufacturing Support
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">AI Support Agent</h1>
          <p className="text-sm text-slate-400">
            Automates customer identity verification, checks authoritative order status, answers grounded FAQs, generates tickets, and governs RMA return requests.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition border border-slate-700"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowTicketModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-xl transition flex items-center gap-2 shadow-lg shadow-blue-500/20"
          >
            <FileText className="w-4 h-4" /> Create Support Ticket
          </button>
          <button
            onClick={() => setShowRmaModal(true)}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-medium text-sm rounded-xl transition flex items-center gap-2 shadow-lg shadow-rose-500/20"
          >
            <RotateCcw className="w-4 h-4" /> Create Return (RMA)
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase">Active Chats</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{dashboard?.activeConversations ?? 42}</p>
          <span className="text-xs text-blue-600 font-medium">Multichannel</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase">Automated Today</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{dashboard?.automatedResponsesToday ?? 96}</p>
          <span className="text-xs text-emerald-600 font-medium">Grounded Replies</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase">Tickets Created</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{dashboard?.ticketsCreatedToday ?? 18}</p>
          <span className="text-xs text-indigo-600 font-medium">Auto-Categorized</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase">Human Handoff</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{dashboard?.awaitingHumanHandoff ?? 4}</p>
          <span className="text-xs text-amber-500 font-medium">Complex Cases</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase">Unresolved</p>
          <p className="text-2xl font-bold text-rose-600 mt-1">{dashboard?.unresolvedTickets ?? 23}</p>
          <span className="text-xs text-rose-500 font-medium">Open Queue</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase">KB Searches</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{dashboard?.knowledgeSearchesToday ?? 71}</p>
          <span className="text-xs text-purple-600 font-medium">Approved FAQs</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase">Automation Rate</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{dashboard?.automationRate ?? 68.5}%</p>
          <span className="text-xs text-emerald-600 font-medium">SLA Target &gt; 65%</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('conversations')}
          className={`pb-3 transition border-b-2 flex items-center gap-1.5 ${activeTab === 'conversations' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <MessageSquare className="w-4 h-4" /> Live Support Hub
        </button>
        <button
          onClick={() => setActiveTab('verification')}
          className={`pb-3 transition border-b-2 flex items-center gap-1.5 ${activeTab === 'verification' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <ShieldCheck className="w-4 h-4" /> Customer Verification Gate
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 transition border-b-2 flex items-center gap-1.5 ${activeTab === 'orders' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <Truck className="w-4 h-4" /> Verified Order Tracking
        </button>
        <button
          onClick={() => setActiveTab('drafts')}
          className={`pb-3 transition border-b-2 flex items-center gap-1.5 ${activeTab === 'drafts' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <Sparkles className="w-4 h-4" /> AI Grounded Drafts & Validation
        </button>
        <button
          onClick={() => setActiveTab('returns')}
          className={`pb-3 transition border-b-2 flex items-center gap-1.5 ${activeTab === 'returns' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <RotateCcw className="w-4 h-4" /> Return Requests (RMA)
        </button>
      </div>

      {/* TAB 1: CONVERSATION HUB */}
      {activeTab === 'conversations' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversation List */}
          <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="font-semibold text-slate-800 text-sm">Active Support Chats</span>
              <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-medium">{conversations.length}</span>
            </div>
            <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
              {conversations.map((c) => (
                <div
                  key={c.conversationId}
                  onClick={() => { setSelectedConv(c); loadMessages(c.conversationId); }}
                  className={`p-4 cursor-pointer transition hover:bg-slate-50 ${selectedConv?.conversationId === c.conversationId ? 'bg-blue-50/50 border-l-4 border-blue-600' : ''}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs text-blue-600">{c.conversationId}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      c.verificationStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {c.verificationStatus}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-800">Order Delivery Delay Enquiry</h4>
                  <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
                    <span>Intent: ORDER_DELIVERY</span>
                    <span className={`font-semibold ${c.status === 'HANDOFF_PENDING' ? 'text-amber-600' : 'text-blue-600'}`}>{c.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Conversation Stream & Context Controls */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[600px]">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></span>
                <span className="font-bold text-sm text-slate-900">{selectedConv?.conversationId || 'SUPC-1001'}</span>
                <span className="text-xs text-slate-500">• Intent: {classifiedIntent.intent} (96% conf)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowHandoffModal(true)}
                  className="px-3 py-1.5 text-xs bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg font-semibold transition flex items-center gap-1"
                >
                  <UserCheck className="w-3.5 h-3.5 text-amber-600" /> Escalate to Human
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m) => (
                <div
                  key={m.messageId}
                  className={`flex flex-col ${m.sender === 'CUSTOMER' ? 'items-start' : 'items-end'}`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1">
                    <span className="font-semibold">{m.sender === 'CUSTOMER' ? 'Customer (Arun Kumar)' : 'AI Support Copilot'}</span>
                    <span>• {m.timestamp}</span>
                  </div>
                  <div
                    className={`p-3.5 rounded-2xl max-w-lg text-xs leading-relaxed ${
                      m.sender === 'CUSTOMER'
                        ? 'bg-slate-100 text-slate-800 rounded-tl-sm'
                        : 'bg-emerald-600 text-white rounded-tr-sm shadow-sm'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 bg-slate-50 flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Reply to customer enquiry..."
                className="flex-1 px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: CUSTOMER VERIFICATION GATE */}
      {activeTab === 'verification' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Customer Identity Verification Gate</h3>
              <p className="text-xs text-slate-500">
                To protect confidentiality, customer order details, invoices, and serial numbers are masked until authenticated verification completes.
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${
              verification.status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              {verification.status === 'VERIFIED' ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              Status: {verification.status}
            </span>
          </div>

          <div className="p-5 border border-slate-200 rounded-xl bg-slate-50/50 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Verification ID</span>
                <p className="text-sm font-mono text-slate-800">{verification.verificationId}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Conversation ID</span>
                <p className="text-sm font-mono text-slate-800">{verification.conversationId}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Security Method</span>
                <p className="text-xs font-semibold text-slate-700">{verification.verificationMethod}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Challenge Expiry</span>
                <p className="text-xs text-slate-500">{verification.expiresAt}</p>
              </div>
            </div>

            {verification.status !== 'VERIFIED' ? (
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <p className="text-xs text-slate-600">
                  Challenge sent to registered company phone/email for <strong>Example Industrial Works</strong>.
                </p>
                <button
                  onClick={handleCompleteVerification}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" /> Complete Verification Challenge
                </button>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Customer identity verified successfully. Real order metadata and invoices unlocked for this session.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: VERIFIED ORDER TRACKING */}
      {activeTab === 'orders' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Authoritative Order & Delivery Enquiries</h3>
              <p className="text-xs text-slate-500">Live order status from the authoritative Order Management System. Dates are never fabricated.</p>
            </div>
            <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-semibold">
              Source: ORDER_MANAGEMENT_SYSTEM
            </span>
          </div>

          <div className="p-5 border border-slate-200 rounded-xl bg-slate-50/50 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Order Reference: {orderStatus.orderId}</span>
              <span className="px-3 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
                {orderStatus.status}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Production State</span>
                <p className="text-sm font-bold text-blue-600 mt-0.5">{orderStatus.status}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Delivery Status</span>
                <p className="text-sm font-bold text-slate-700 mt-0.5">{orderStatus.deliveryStatus}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Expected Dispatch</span>
                <p className="text-sm text-slate-500 mt-0.5 font-medium">{orderStatus.expectedDispatchDate || 'Unconfirmed (In Assembly)'}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Last Updated</span>
                <p className="text-xs text-slate-500 mt-0.5">{orderStatus.lastUpdatedAt}</p>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 font-medium">
              Important: Dispatch dates are only confirmed once quality control inspections conclude. The AI agent will not invent a speculative shipping date.
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: GROUNDED DRAFTS & VALIDATION */}
      {activeTab === 'drafts' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">AI Response Drafting & Policy Validation</h3>
              <p className="text-xs text-slate-500">
                Responses are grounded in verified knowledge articles. Responses requiring approval are held until confirmed.
              </p>
            </div>
            <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-semibold">
              {validationResult.validationStatus}
            </span>
          </div>

          <div className="p-5 border border-slate-200 rounded-xl space-y-4 bg-slate-50/50">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Draft Response: {responseDraft.responseId}</span>
            <div className="p-4 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 leading-relaxed font-medium">
              "{responseDraft.draft}"
            </div>

            {/* Validation Checks */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-white border border-emerald-200 rounded-lg flex items-center justify-between text-xs">
                <span>No Unsupported Claims</span>
                <Check className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="p-3 bg-white border border-emerald-200 rounded-lg flex items-center justify-between text-xs">
                <span>Restricted Data Protected</span>
                <Check className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="p-3 bg-white border border-emerald-200 rounded-lg flex items-center justify-between text-xs">
                <span>Uses Approved Sources</span>
                <Check className="w-4 h-4 text-emerald-600" />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => addNotification?.({ type: 'success', message: 'Response approved and dispatched to customer' })}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5 shadow-sm"
              >
                <Check className="w-3.5 h-3.5" /> Approve & Send Outbound
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: RETURN REQUESTS (RMA) */}
      {activeTab === 'returns' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">RMA Return Requests & Eligibility Checks</h3>
              <p className="text-xs text-slate-500">
                The AI agent registers return requests and checks policy eligibility, but does not independently approve replacements or refunds.
              </p>
            </div>
            <button
              onClick={() => setShowRmaModal(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" /> Create Return Request
            </button>
          </div>

          <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 flex items-start gap-3">
            <Package className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900">RMA Request: RET-9001</h4>
                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full">
                  PENDING_ELIGIBILITY_CHECK
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Order: <span className="font-mono">ORD-1001</span> • Product: <span className="font-semibold">PRD-2001 (Industrial Motor M200)</span> • Qty: 1
              </p>
              <p className="text-xs text-slate-500 mt-1">Reason: Customer reports temperature anomaly with the delivered unit.</p>
            </div>
          </div>
        </div>
      )}

      {/* CREATE TICKET MODAL */}
      {showTicketModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900">Create Support Ticket</h3>
              <button onClick={() => setShowTicketModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Customer ID</label>
                <input
                  type="text"
                  value={ticketForm.customerId}
                  onChange={(e) => setTicketForm({ ...ticketForm, customerId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 font-mono"
                  required
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Category</label>
                <select
                  value={ticketForm.category}
                  onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50"
                >
                  <option value="ORDER_DELIVERY">ORDER_DELIVERY</option>
                  <option value="TECHNICAL_ISSUE">TECHNICAL_ISSUE</option>
                  <option value="INVOICE_BILLING">INVOICE_BILLING</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Subject</label>
                <input
                  type="text"
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50"
                  required
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows="3"
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50"
                  required
                ></textarea>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setShowTicketModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold">Create Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE RMA MODAL */}
      {showRmaModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900">Submit Return Request (RMA)</h3>
              <button onClick={() => setShowRmaModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateRma} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Order ID</label>
                <input
                  type="text"
                  value={rmaForm.orderId}
                  onChange={(e) => setRmaForm({ ...rmaForm, orderId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 font-mono"
                  required
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Product ID</label>
                <input
                  type="text"
                  value={rmaForm.productId}
                  onChange={(e) => setRmaForm({ ...rmaForm, productId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 font-mono"
                  required
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Reason</label>
                <select
                  value={rmaForm.reason}
                  onChange={(e) => setRmaForm({ ...rmaForm, reason: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50"
                >
                  <option value="PRODUCT_DEFECT_REPORTED">PRODUCT_DEFECT_REPORTED</option>
                  <option value="WRONG_ITEM_DELIVERED">WRONG_ITEM_DELIVERED</option>
                  <option value="SHIPPING_DAMAGE">SHIPPING_DAMAGE</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows="3"
                  value={rmaForm.description}
                  onChange={(e) => setRmaForm({ ...rmaForm, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50"
                  required
                ></textarea>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setShowRmaModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-semibold">Submit Return Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HUMAN HANDOFF MODAL */}
      {showHandoffModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900">Transfer Conversation to Human Support Staff</h3>
              <button onClick={() => setShowHandoffModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4 text-xs">
              <p className="text-slate-600">
                Are you sure you want to transfer this conversation to a human Customer Support Specialist?
              </p>
              <div className="p-3 bg-slate-50 border rounded-lg">
                <p className="font-semibold text-slate-700">Reason: Customer enquiry requires order dispatch investigation</p>
                <p className="text-slate-500 mt-1">Target Department: CUSTOMER_SUPPORT</p>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setShowHandoffModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg">Cancel</button>
                <button type="button" onClick={handleHandoff} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-semibold">Confirm Handoff</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
