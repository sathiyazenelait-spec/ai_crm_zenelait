import React, { useState, useEffect } from 'react';
import {
  MessageSquare, Send, Lock, RotateCcw, XCircle, DollarSign, Bot,
  Clock, CheckCircle2, AlertTriangle, Search, RefreshCw, ChevronRight,
  Package, Truck, Eye, ShieldCheck, Plus, Sparkles, BookOpen
} from 'lucide-react';
import { ecommerceService } from '../../services/ecommerceService';

export default function EcommerceSupportAgentView() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState({
    myOpenTickets: 18,
    myUrgentTickets: 3,
    awaitingMyReply: 6,
    awaitingCustomerResponse: 5,
    followUpsDueToday: 4,
    resolvedToday: 12,
    aiDraftsAwaitingReview: 2
  });

  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketDetails, setTicketDetails] = useState(null);
  const [orderSummary, setOrderSummary] = useState(null);
  const [aiDraft, setAiDraft] = useState(null);
  const [followUps, setFollowUps] = useState([]);
  const [knowledge, setKnowledge] = useState([]);
  const [toast, setToast] = useState('');

  // Composers
  const [replyMessage, setReplyMessage] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnData, setReturnData] = useState({ reason: 'DAMAGED_ITEM', customerDescription: 'Product arrived damaged' });
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundData, setRefundData] = useState({ requestedAmount: 2499.00, reason: 'DAMAGED_ITEM', comment: 'Customer reported damage' });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashRes, tktRes, fuRes, kbRes] = await Promise.allSettled([
        ecommerceService.supportAgent.getDashboard(),
        ecommerceService.supportAgent.getTickets({ status: 'OPEN', page: 0, size: 20 }),
        ecommerceService.supportAgent.getFollowUpTasks({ page: 0, size: 20 }),
        ecommerceService.supportAgent.getKnowledgeArticles({})
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value?.data?.data) {
        setDashboard(dashRes.value.data.data);
      }
      if (tktRes.status === 'fulfilled' && tktRes.value?.data?.data?.content) {
        setTickets(tktRes.value.data.data.content);
        if (tktRes.value.data.data.content.length > 0 && !selectedTicket) {
          selectTicket(tktRes.value.data.data.content[0]);
        }
      }
      if (fuRes.status === 'fulfilled' && fuRes.value?.data?.data?.content) {
        setFollowUps(fuRes.value.data.data.content);
      }
      if (kbRes.status === 'fulfilled' && kbRes.value?.data?.data?.content) {
        setKnowledge(kbRes.value.data.data.content);
      }
    } catch (e) {
      console.error('Error loading support agent data:', e);
    } finally {
      setLoading(false);
    }
  };

  const selectTicket = async (tkt) => {
    setSelectedTicket(tkt);
    try {
      const detailRes = await ecommerceService.supportAgent.getTicket(tkt.ticketId);
      if (detailRes.data?.data) {
        setTicketDetails(detailRes.data.data);
      }
      // If ticket has orderReference
      if (tkt.orderReference) {
        const ordRes = await ecommerceService.supportAgent.getOrderSummary('ord_2001');
        if (ordRes.data?.data) {
          setOrderSummary(ordRes.data.data);
        }
      }
    } catch (e) {
      console.error('Error loading ticket details:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleClaimTicket = async (ticketId) => {
    try {
      const res = await ecommerceService.supportAgent.claimTicket(ticketId, { reason: 'Agent self-claim' });
      if (res.data?.success) {
        showToast('Ticket claimed successfully');
        loadData();
      }
    } catch (err) {
      showToast('Conflict: Ticket already claimed by another agent');
    }
  };

  const handleSendPublicReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedTicket) return;
    try {
      const res = await ecommerceService.supportAgent.sendMessage(selectedTicket.ticketId, {
        messageType: 'PUBLIC_REPLY',
        channel: 'EMAIL',
        content: replyMessage
      }, { 'Idempotency-Key': 'reply-' + Date.now() });

      if (res.data?.success) {
        showToast('Public reply queued for delivery');
        setReplyMessage('');
        selectTicket(selectedTicket);
      }
    } catch (err) {
      showToast('Error sending reply');
    }
  };

  const handleAddInternalNote = async (e) => {
    e.preventDefault();
    if (!internalNote.trim() || !selectedTicket) return;
    try {
      const res = await ecommerceService.supportAgent.addInternalNote(selectedTicket.ticketId, {
        visibility: 'INTERNAL',
        content: internalNote
      });

      if (res.data?.success) {
        showToast('Internal note saved (strictly hidden from customer)');
        setInternalNote('');
        selectTicket(selectedTicket);
      }
    } catch (err) {
      showToast('Error saving note');
    }
  };

  const handleGenerateAiDraft = async () => {
    if (!selectedTicket) return;
    try {
      const res = await ecommerceService.supportAgent.generateAiDraft(selectedTicket.ticketId, {
        replyGoal: 'Explain current order status',
        tone: 'FRIENDLY',
        useApprovedKnowledgeOnly: true
      });
      if (res.data?.success) {
        setAiDraft(res.data.data);
        showToast('AI Draft generated with verified order records');
      }
    } catch (err) {
      showToast('Failed to generate draft');
    }
  };

  const handleSendAiDraft = async (draftId) => {
    try {
      const res = await ecommerceService.supportAgent.sendAiDraft(draftId);
      if (res.data?.success) {
        showToast('AI Draft approved and queued for customer');
        setAiDraft(null);
        selectTicket(selectedTicket);
      }
    } catch (err) {
      showToast('Error sending AI draft');
    }
  };

  const handleSubmitReturn = async (e) => {
    e.preventDefault();
    try {
      const res = await ecommerceService.supportAgent.submitReturnRequest('ord_2001', returnData);
      if (res.data?.success) {
        showToast('Return request submitted for Order Operations review');
        setShowReturnModal(false);
      }
    } catch (err) {
      showToast('Error submitting return');
    }
  };

  const handleSubmitRefund = async (e) => {
    e.preventDefault();
    try {
      const res = await ecommerceService.supportAgent.submitRefundRequest('ord_2001', refundData);
      if (res.data?.success) {
        showToast('Refund request submitted for Order Operations review');
        setShowRefundModal(false);
      }
    } catch (err) {
      showToast('Error submitting refund');
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-cyan-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-cyan-200" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-cyan-900/90 via-sky-900/80 to-slate-900 border border-cyan-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/20 text-cyan-400 rounded-xl border border-cyan-500/30">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-wide">Support Agent Workspace</h1>
              <p className="text-sm text-cyan-300/80">Customer Inquiries, Order Tracking, AI Replies & Request Submissions</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 rounded-xl border border-slate-700/60 transition"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto border-b border-cyan-500/20 pb-2">
          {[
            { id: 'dashboard', label: 'My Dashboard', icon: Clock },
            { id: 'workspace', label: 'Ticket Workspace', icon: MessageSquare },
            { id: 'orders', label: 'Order Lookup', icon: Package },
            { id: 'follow-ups', label: 'Follow-up Tasks', icon: CheckCircle2 },
            { id: 'knowledge', label: 'Approved Knowledge', icon: BookOpen },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/40 shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: MY DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
              <span className="text-slate-400 text-xs">My Open Tickets</span>
              <p className="text-2xl font-bold text-white mt-1">{dashboard.myOpenTickets || 18}</p>
              <span className="text-xs text-red-400 font-semibold">{dashboard.myUrgentTickets || 3} Urgent Priority</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
              <span className="text-slate-400 text-xs">Awaiting My Reply</span>
              <p className="text-2xl font-bold text-amber-400 mt-1">{dashboard.awaitingMyReply || 6}</p>
              <span className="text-xs text-slate-400">Needs first response</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
              <span className="text-slate-400 text-xs">Follow-ups Due Today</span>
              <p className="text-2xl font-bold text-cyan-400 mt-1">{dashboard.followUpsDueToday || 4}</p>
              <span className="text-xs text-slate-400">Carrier updates & notes</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
              <span className="text-slate-400 text-xs">Resolved Today</span>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{dashboard.resolvedToday || 12}</p>
              <span className="text-xs text-emerald-400 font-semibold">100% SLA compliant</span>
            </div>
          </div>

          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block mb-0.5">Role Boundary & Separation of Duties Notice:</strong>
              As a Support Agent, you can submit return, cancellation, and refund requests for customer orders. However, approval and payment execution are restricted to the Order Manager / Finance authority to ensure financial integrity.
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TICKET WORKSPACE */}
      {activeTab === 'workspace' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ticket List Column */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <h2 className="text-sm font-bold text-white mb-2">My Ticket Queue</h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {tickets.map(t => (
                <div
                  key={t.ticketId}
                  onClick={() => selectTicket(t)}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition ${
                    selectedTicket?.ticketId === t.ticketId
                      ? 'bg-cyan-950/60 border-cyan-500/50 shadow-md'
                      : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-cyan-300 font-bold">{t.ticketNumber}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-300">{t.priority}</span>
                  </div>
                  <p className="text-white font-medium mt-1 truncate">{t.subject}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                    <span>{t.category}</span>
                    <span className="text-emerald-400 font-semibold">{t.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ticket Conversation & Actions */}
          <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-6">
            {selectedTicket ? (
              <>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-white">{selectedTicket.subject}</span>
                      <span className="font-mono text-xs text-cyan-300">({selectedTicket.ticketNumber})</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">Order Ref: {selectedTicket.orderReference || 'None'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowReturnModal(true)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                      <span>Request Return</span>
                    </button>
                    <button
                      onClick={() => setShowRefundModal(true)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 flex items-center gap-1"
                    >
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Request Refund</span>
                    </button>
                  </div>
                </div>

                {/* Conversation History */}
                <div className="space-y-4 max-h-[300px] overflow-y-auto p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Customer Conversation</h3>
                  {ticketDetails?.messages?.map(msg => (
                    <div
                      key={msg.messageId}
                      className={`p-3 rounded-xl text-xs max-w-[85%] ${
                        msg.senderType === 'CUSTOMER'
                          ? 'bg-slate-800 text-slate-200 mr-auto border border-slate-700'
                          : 'bg-cyan-950 text-cyan-100 ml-auto border border-cyan-800'
                      }`}
                    >
                      <div className="text-[10px] text-slate-400 mb-1 font-semibold">
                        {msg.senderType === 'CUSTOMER' ? 'Customer' : 'Support Agent'}
                      </div>
                      <p>{msg.content}</p>
                    </div>
                  ))}
                </div>

                {/* Internal Notes Section (Strictly Hidden from Customers) */}
                <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                    <Lock className="w-4 h-4" />
                    <span>Internal Notes (Strictly Confidential - Never Sent to Customer)</span>
                  </div>
                  {ticketDetails?.internalNotes?.map(note => (
                    <div key={note.noteId} className="p-2.5 bg-slate-900/60 rounded-lg text-xs text-amber-200 border border-amber-900/50">
                      <p>{note.content}</p>
                      <span className="text-[10px] text-amber-400/60 mt-1 block">by {note.createdBy} at {note.createdAt}</span>
                    </div>
                  ))}
                  <form onSubmit={handleAddInternalNote} className="flex gap-2 pt-2">
                    <input
                      type="text"
                      placeholder="Add private investigation note..."
                      value={internalNote}
                      onChange={(e) => setInternalNote(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                    <button type="submit" className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-medium">Save Note</button>
                  </form>
                </div>

                {/* AI Reply Assistant Draft Card */}
                {aiDraft && (
                  <div className="p-4 bg-cyan-950/40 border border-cyan-500/40 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                        <Bot className="w-4 h-4" />
                        <span>AI Reply Draft Grounded in Order Tracking ({aiDraft.draftId})</span>
                      </div>
                      <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-bold">AWAITING REVIEW</span>
                    </div>
                    <p className="text-xs text-slate-200 bg-slate-900/80 p-3 rounded-lg border border-slate-800">{aiDraft.content}</p>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleSendAiDraft(aiDraft.draftId)}
                        className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Approve & Send to Customer</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Customer Public Reply Composer */}
                <form onSubmit={handleSendPublicReply} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300">Send Customer Public Reply</label>
                    <button
                      type="button"
                      onClick={handleGenerateAiDraft}
                      className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate AI Draft</span>
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    required
                    placeholder="Type your response to the customer..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Customer Reply</span>
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center py-16 text-slate-500 text-xs">Select a ticket from the queue to start.</div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ORDER LOOKUP */}
      {activeTab === 'orders' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-bold text-white">Order & Shipment Details (ORD-2026-2001)</h2>
          {orderSummary ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800 space-y-2">
                <span className="text-slate-400 font-medium">Order Status & Amounts</span>
                <p className="text-white font-bold text-base">₹{Number(orderSummary.totalAmount).toLocaleString('en-IN')}</p>
                <div className="text-slate-300">Order Status: <strong className="text-cyan-300">{orderSummary.orderStatus}</strong></div>
                <div className="text-slate-300">Payment Status: <strong className="text-emerald-400">{orderSummary.paymentStatus}</strong></div>
              </div>
              <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800 space-y-2">
                <span className="text-slate-400 font-medium">Carrier & Shipping Status</span>
                <p className="text-cyan-300 font-bold text-base">{orderSummary.carrier}</p>
                <div className="text-slate-300">Live Status: <strong className="text-amber-400">{orderSummary.trackingStatus}</strong></div>
                <div className="text-slate-300">Estimated Delivery: <strong className="text-white">{orderSummary.estimatedDeliveryDate}</strong></div>
              </div>
            </div>
          ) : (
            <p className="text-slate-500 text-xs">Loading order data...</p>
          )}
        </div>
      )}

      {/* TAB 4: FOLLOW-UP TASKS */}
      {activeTab === 'follow-ups' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Support Follow-up Tasks</h2>
          <div className="space-y-3">
            {followUps.map(fu => (
              <div key={fu.taskId} className="p-4 bg-slate-800/40 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <h3 className="font-bold text-white">{fu.title}</h3>
                  <span className="text-slate-400">Due At: {fu.dueAt}</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">{fu.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: APPROVED KNOWLEDGE */}
      {activeTab === 'knowledge' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Published Knowledge for Customer Enquiries</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {knowledge.map(k => (
              <div key={k.articleId} className="p-4 bg-slate-800/40 rounded-xl border border-slate-800 text-xs space-y-2">
                <h3 className="font-bold text-white text-sm">{k.title}</h3>
                <span className="text-cyan-400 font-mono text-[10px]">{k.category}</span>
                <p className="text-slate-300">{k.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: REQUEST RETURN */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Submit Return Request</h3>
            <form onSubmit={handleSubmitReturn} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Reason</label>
                <select
                  value={returnData.reason}
                  onChange={(e) => setReturnData({ ...returnData, reason: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="DAMAGED_ITEM">Damaged Item</option>
                  <option value="WRONG_ITEM">Wrong Item Shipped</option>
                  <option value="DEFECTIVE">Product Defective</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Customer Description</label>
                <textarea
                  rows={3}
                  value={returnData.customerDescription}
                  onChange={(e) => setReturnData({ ...returnData, customerDescription: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setShowReturnModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-semibold">Submit for Review</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REQUEST REFUND */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Submit Refund Request</h3>
            <p className="text-[11px] text-slate-400">Submitted to Order Operations for policy compliance and payment provider dispatch.</p>
            <form onSubmit={handleSubmitRefund} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Requested Amount (INR)</label>
                <input
                  type="number"
                  required
                  value={refundData.requestedAmount}
                  onChange={(e) => setRefundData({ ...refundData, requestedAmount: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Reason</label>
                <select
                  value={refundData.reason}
                  onChange={(e) => setRefundData({ ...refundData, reason: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="DAMAGED_ITEM">Damaged Item</option>
                  <option value="LOST_IN_TRANSIT">Lost in Transit</option>
                  <option value="CUSTOMER_CANCEL">Order Cancellation</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setShowRefundModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold">Submit Refund</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
