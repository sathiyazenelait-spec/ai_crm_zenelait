import React, { useState, useEffect } from 'react';
import {
  LifeBuoy, MessageSquare, Bot, AlertTriangle, CheckCircle, Clock,
  Send, Lock, BookOpen, CheckSquare, BarChart3, Search, Filter,
  User, PlusCircle, ArrowRight, ShieldCheck, RefreshCw, FileText
} from 'lucide-react';
import { hospitalService } from '../../services/hospitalService';

export default function HospitalCustomerSupportView({ initialSubTab = 'tickets' }) {
  const [activeTab, setActiveTab] = useState(initialSubTab);

  useEffect(() => {
    if (initialSubTab) setActiveTab(initialSubTab);
  }, [initialSubTab]);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Dashboard
  const [dashboard, setDashboard] = useState({
    openTickets: 74,
    myAssignedTickets: 12,
    unassignedTickets: 8,
    awaitingPatientResponse: 17,
    awaitingInternalResponse: 9,
    openEscalations: 4,
    aiDraftsAwaitingReview: 6
  });

  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketMessages, setTicketMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);

  // AI Reply Draft
  const [currentDraft, setCurrentDraft] = useState(null);
  const [knowledgeArticles, setKnowledgeArticles] = useState([]);
  const [followUpTasks, setFollowUpTasks] = useState([]);
  const [metrics, setMetrics] = useState(null);

  // Modals
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [newTicket, setNewTicket] = useState({
    patientId: 'pat_7001',
    category: 'APPOINTMENT_ENQUIRY',
    channel: 'WEBSITE_CHAT',
    subject: '',
    description: '',
    priority: 'NORMAL'
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashRes, tixRes, kbRes, tasksRes, metRes] = await Promise.allSettled([
        hospitalService.customerSupport.getDashboard(),
        hospitalService.customerSupport.getTickets(),
        hospitalService.customerSupport.getKnowledgeArticles(),
        hospitalService.customerSupport.getFollowUpTasks(),
        hospitalService.customerSupport.getMetrics()
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value?.data?.data) {
        setDashboard(dashRes.value.data.data);
      }
      if (tixRes.status === 'fulfilled' && tixRes.value?.data?.data?.items) {
        setTickets(tixRes.value.data.data.items);
        if (!selectedTicket && tixRes.value.data.data.items.length > 0) {
          handleSelectTicket(tixRes.value.data.data.items[0]);
        }
      } else {
        const defaultTix = [
          { ticketId: 'tic_1301', ticketNumber: 'SUP-2026-001301', subject: 'Appointment confirmation', category: 'APPOINTMENT_ENQUIRY', status: 'OPEN', priority: 'NORMAL', assignedTo: 'usr_1401' }
        ];
        setTickets(defaultTix);
        if (!selectedTicket) handleSelectTicket(defaultTix[0]);
      }
      if (kbRes.status === 'fulfilled' && kbRes.value?.data?.data) {
        setKnowledgeArticles(kbRes.value.data.data);
      }
      if (tasksRes.status === 'fulfilled' && tasksRes.value?.data?.data) {
        setFollowUpTasks(tasksRes.value.data.data);
      }
      if (metRes.status === 'fulfilled' && metRes.value?.data?.data) {
        setMetrics(metRes.value.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTicket = async (ticket) => {
    setSelectedTicket(ticket);
    try {
      const res = await hospitalService.customerSupport.getTicketMessages(ticket.ticketId);
      if (res.data?.success && res.data.data) {
        setTicketMessages(res.data.data);
      } else {
        setTicketMessages([
          { messageId: 'msg_1501', messageType: 'PUBLIC_REPLY', channel: 'WEBSITE_CHAT', content: 'We can help you check your appointment details. Please complete the identity verification.', createdAt: '2026-10-27T18:00:00+05:30' }
        ]);
      }
    } catch (err) {
      setTicketMessages([]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedTicket) return;
    try {
      if (isInternalNote) {
        await hospitalService.customerSupport.addTicketNote(selectedTicket.ticketId, {
          note: newMessage,
          visibility: 'INTERNAL'
        });
        showToast('Internal administrative note saved');
      } else {
        await hospitalService.customerSupport.addTicketMessage(selectedTicket.ticketId, {
          content: newMessage,
          messageType: 'PUBLIC_REPLY',
          channel: 'WEBSITE_CHAT'
        });
        showToast('Message sent to patient');
      }
      setNewMessage('');
      handleSelectTicket(selectedTicket);
    } catch (err) {
      showToast('Error recording message');
    }
  };

  const handleGenerateAiDraft = async () => {
    if (!selectedTicket) return;
    try {
      const res = await hospitalService.customerSupport.generateAiDraft({
        ticketId: selectedTicket.ticketId,
        replyGoal: 'Explain how patient confirms appointment',
        tone: 'POLITE_AND_CLEAR',
        useApprovedKnowledgeOnly: true
      });
      if (res.data?.success) {
        setCurrentDraft(res.data.data);
        showToast('AI reply draft generated based on approved knowledge');
      }
    } catch (err) {
      showToast('Error generating AI draft');
    }
  };

  const handleApproveDraft = async () => {
    if (!currentDraft) return;
    try {
      const res = await hospitalService.customerSupport.approveAiDraft(currentDraft.draftId, {
        decision: 'APPROVE',
        reviewComment: 'Verified against approved clinic scheduling policy'
      });
      if (res.data?.success) {
        setCurrentDraft({ ...currentDraft, status: 'APPROVED' });
        showToast('Draft approved! Ready to send');
      }
    } catch (err) {
      showToast('Error approving draft');
    }
  };

  const handleSendDraft = async () => {
    if (!currentDraft) return;
    try {
      const res = await hospitalService.customerSupport.sendApprovedDraft(currentDraft.draftId, {
        channel: 'WEBSITE_CHAT',
        recipientReference: selectedTicket?.ticketId
      }, `send-${currentDraft.draftId}-1`);
      if (res.data?.success) {
        showToast('Approved message queued for delivery');
        setCurrentDraft(null);
        handleSelectTicket(selectedTicket);
      }
    } catch (err) {
      showToast('Error sending draft: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEscalate = async () => {
    if (!selectedTicket) return;
    try {
      const res = await hospitalService.customerSupport.escalateTicket(selectedTicket.ticketId, {
        targetTeam: 'APPOINTMENT_COORDINATION',
        reason: 'Requires direct scheduling coordinator action'
      });
      if (res.data?.success) {
        showToast('Ticket escalated to Appointment Coordination!');
        loadData();
      }
    } catch (err) {
      showToast('Escalation failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 lg:p-8 space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-2 border border-emerald-400/30 animate-bounce">
          <CheckCircle className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950/70 via-indigo-900/40 to-slate-900/80 border border-purple-500/30 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30">
            <LifeBuoy className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-purple-200 text-sm">Customer Support Desk</h4>
            <p className="text-xs text-purple-300/80">
              Omnichannel patient enquiries, AI-assisted draft approvals, escalations, and follow-ups.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowNewTicketModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-medium shadow-md shadow-purple-600/30 transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Ticket</span>
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <p className="text-xs text-slate-400">Open Tickets</p>
          <p className="text-xl font-bold text-white mt-1">{dashboard.openTickets}</p>
          <span className="text-[10px] text-purple-400 font-medium">Support Queue</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <p className="text-xs text-slate-400">My Assigned</p>
          <p className="text-xl font-bold text-sky-400 mt-1">{dashboard.myAssignedTickets}</p>
          <span className="text-[10px] text-sky-300 font-medium">In Progress</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <p className="text-xs text-slate-400">Unassigned</p>
          <p className="text-xl font-bold text-amber-400 mt-1">{dashboard.unassignedTickets}</p>
          <span className="text-[10px] text-amber-300 font-medium">Pending Triage</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <p className="text-xs text-slate-400">Awaiting Patient</p>
          <p className="text-xl font-bold text-indigo-400 mt-1">{dashboard.awaitingPatientResponse}</p>
          <span className="text-[10px] text-indigo-300 font-medium">Pending Reply</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <p className="text-xs text-slate-400">Awaiting Team</p>
          <p className="text-xl font-bold text-rose-400 mt-1">{dashboard.awaitingInternalResponse}</p>
          <span className="text-[10px] text-rose-300 font-medium">Internal Review</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <p className="text-xs text-slate-400">Escalations</p>
          <p className="text-xl font-bold text-orange-400 mt-1">{dashboard.openEscalations}</p>
          <span className="text-[10px] text-orange-300 font-medium">To Coordinator</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <p className="text-xs text-slate-400">AI Drafts Review</p>
          <p className="text-xl font-bold text-emerald-400 mt-1">{dashboard.aiDraftsAwaitingReview}</p>
          <span className="text-[10px] text-emerald-300 font-medium">Approval Required</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'tickets', label: 'Ticket Workspace', icon: MessageSquare },
          { id: 'knowledge', label: 'Approved Knowledge Base', icon: BookOpen },
          { id: 'follow-ups', label: 'Follow-Up Tasks', icon: CheckSquare },
          { id: 'metrics', label: 'Service Metrics', icon: BarChart3 }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-purple-600/20 text-purple-400 border border-purple-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Ticket Workspace */}
      {activeTab === 'tickets' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ticket List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-semibold text-white text-sm">Tickets ({tickets.length})</h3>
              <span className="text-xs text-slate-400">Channel: Website Chat</span>
            </div>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {tickets.map((t) => (
                <div
                  key={t.ticketId}
                  onClick={() => handleSelectTicket(t)}
                  className={`p-3.5 rounded-xl cursor-pointer border transition ${
                    selectedTicket?.ticketId === t.ticketId
                      ? 'bg-purple-950/40 border-purple-500/50 shadow-md'
                      : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-purple-400 font-bold">{t.ticketNumber || t.ticketId}</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px]">
                      {t.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-white mt-1 line-clamp-1">{t.subject}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{t.category}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Ticket Detail & Omnichannel Conversation */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
            {selectedTicket ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-purple-400">{selectedTicket.ticketNumber}</span>
                      <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full">{selectedTicket.category}</span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-1">{selectedTicket.subject}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleEscalate}
                      className="text-xs px-3 py-1.5 bg-orange-600/30 text-orange-300 hover:bg-orange-600/50 border border-orange-500/30 rounded-xl"
                    >
                      Escalate
                    </button>
                    <button
                      onClick={handleGenerateAiDraft}
                      className="text-xs px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
                    >
                      <Bot className="w-3.5 h-3.5" />
                      <span>Draft with AI</span>
                    </button>
                  </div>
                </div>

                {/* AI Draft Review Card */}
                {currentDraft && (
                  <div className="bg-gradient-to-r from-indigo-950/80 to-purple-950/80 border border-indigo-500/40 p-4 rounded-xl space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-indigo-300 font-semibold">
                        <Bot className="w-4 h-4 text-indigo-400" />
                        <span>AI Reply Draft ({currentDraft.draftId})</span>
                      </span>
                      <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
                        {currentDraft.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                      {currentDraft.content}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>Source: KB-1701 (Approved Appointment Confirmation Process)</span>
                      <div className="space-x-2">
                        {currentDraft.status === 'AWAITING_REVIEW' ? (
                          <button
                            onClick={handleApproveDraft}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium"
                          >
                            Approve Draft
                          </button>
                        ) : (
                          <button
                            onClick={handleSendDraft}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" />
                            <span>Send Approved Reply</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Message Stream */}
                <div className="space-y-3 min-h-[220px] max-h-[360px] overflow-y-auto p-3 bg-slate-950 rounded-xl border border-slate-800">
                  {ticketMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl max-w-lg text-xs ${
                        msg.messageType === 'INTERNAL_NOTE'
                          ? 'bg-amber-950/30 border border-amber-600/30 text-amber-200'
                          : 'bg-purple-900/30 border border-purple-600/30 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span className="font-semibold flex items-center gap-1">
                          {msg.messageType === 'INTERNAL_NOTE' && <Lock className="w-3 h-3 text-amber-400" />}
                          <span>{msg.messageType || 'PUBLIC_REPLY'}</span>
                        </span>
                        <span>{msg.createdAt?.split('T')[1]?.substring(0, 5) || '18:00'}</span>
                      </div>
                      <p>{msg.content || msg.text || msg.note}</p>
                    </div>
                  ))}
                </div>

                {/* Input Area */}
                <form onSubmit={handleSendMessage} className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center space-x-3">
                      <label className="flex items-center space-x-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isInternalNote}
                          onChange={(e) => setIsInternalNote(e.target.checked)}
                          className="rounded border-slate-700 bg-slate-950"
                        />
                        <span className={isInternalNote ? 'text-amber-400 font-semibold' : 'text-slate-400'}>
                          Internal Note (Not visible to patient)
                        </span>
                      </label>
                    </div>
                    <span>Channel: {selectedTicket.channel || 'Website Chat'}</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={isInternalNote ? 'Write internal note for staff...' : 'Type public reply to patient...'}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-medium flex items-center gap-1.5 shadow-md shadow-purple-600/30"
                    >
                      <Send className="w-4 h-4" />
                      <span>{isInternalNote ? 'Save Note' : 'Send'}</span>
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500 text-sm">
                Select a support ticket to view conversation history and generate AI replies.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Approved Knowledge Base */}
      {activeTab === 'knowledge' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg text-white">Approved Clinic Knowledge Sources</h3>
              <p className="text-xs text-slate-400">AI drafts strictly cite these clinic-approved operational procedures.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {knowledgeArticles.map((art) => (
              <div key={art.articleId} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-purple-400 font-bold">{art.articleId}</span>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full text-[10px]">VERIFIED</span>
                </div>
                <h4 className="text-sm font-bold text-white">{art.title}</h4>
                <p className="text-xs text-slate-300">{art.summary}</p>
                <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800/80 text-[11px] text-slate-400">
                  {art.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Follow-Up Tasks */}
      {activeTab === 'follow-ups' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-lg text-white">Support Follow-Up Tasks</h3>
          <div className="space-y-2">
            {followUpTasks.map((t) => (
              <div key={t.taskId} className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                <div>
                  <h4 className="text-sm font-semibold text-white">{t.title}</h4>
                  <p className="text-xs text-slate-400">Due: {t.dueDate} • Assigned: {t.assignedToUserId}</p>
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Service Metrics */}
      {activeTab === 'metrics' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg text-white">Customer Support Performance Metrics</h3>
            <span className="text-xs text-slate-400">Period: 2026-10-01 to 2026-10-27</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <p className="text-xs text-slate-400">Tickets Resolved</p>
              <p className="text-2xl font-bold text-white mt-1">1,085 / 1,250</p>
              <p className="text-xs text-emerald-400 mt-1">86.8% resolution rate</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <p className="text-xs text-slate-400">Avg First Response</p>
              <p className="text-2xl font-bold text-purple-400 mt-1">8 min</p>
              <p className="text-xs text-slate-400 mt-1">Target: &lt; 15 min</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <p className="text-xs text-slate-400">AI Drafts Approved</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">410</p>
              <p className="text-xs text-slate-400 mt-1">21 Rejected for revision</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <p className="text-xs text-slate-400">Escalated Requests</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">62</p>
              <p className="text-xs text-slate-400 mt-1">Transferred to coordinator</p>
            </div>
          </div>
        </div>
      )}

      {/* New Ticket Modal */}
      {showNewTicketModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Create Support Ticket</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const res = await hospitalService.customerSupport.createTicket(newTicket);
                if (res.data?.success) {
                  showToast('Ticket created: ' + res.data.data.ticketNumber);
                  setShowNewTicketModal(false);
                  loadData();
                }
              } catch (err) {
                showToast('Failed to create ticket');
              }
            }} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Appointment confirmation inquiry"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Category</label>
                <select
                  value={newTicket.category}
                  onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="APPOINTMENT_ENQUIRY">Appointment Enquiry</option>
                  <option value="DOCTOR_INFORMATION">Doctor Information</option>
                  <option value="BILLING_INQUIRY">Billing & Insurance</option>
                  <option value="GENERAL_FEEDBACK">Service Feedback</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400">Description</label>
                <textarea
                  rows={3}
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowNewTicketModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-medium">
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
