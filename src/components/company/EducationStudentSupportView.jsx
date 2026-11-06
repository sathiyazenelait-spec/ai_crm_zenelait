import React, { useState, useEffect } from 'react';
import {
  LifeBuoy, MessageSquare, AlertCircle, CheckCircle2, Clock, ShieldCheck,
  Search, Plus, Filter, Sparkles, Send, Lock, BookOpen, AlertTriangle,
  FileText, ArrowRight, RefreshCw, UserCheck, CheckSquare, ChevronRight
} from 'lucide-react';
import { educationService } from '../../services/educationService';

export default function EducationStudentSupportView({ initialSubTab = 'dashboard' }) {
  const [activeTab, setActiveTab] = useState(initialSubTab);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [kbArticles, setKbArticles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketMessages, setTicketMessages] = useState([]);
  const [aiDraft, setAiDraft] = useState(null);

  // Modals & Action States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Forms
  const [newTicket, setNewTicket] = useState({
    studentId: 3001, subject: '', description: '',
    category: 'LEARNING_PLATFORM', priority: 'HIGH', channel: 'EMAIL'
  });

  const [replyContent, setReplyContent] = useState('');
  const [internalNoteContent, setInternalNoteContent] = useState('');
  const [resolveForm, setResolveForm] = useState({
    resolutionCode: 'ACCOUNT_ACCESS_RESTORED', resolutionNotes: 'Issue resolved with student confirmation'
  });
  const [escalateForm, setEscalateForm] = useState({
    escalationType: 'TECHNICAL_TEAM', reason: 'Issue persists after basic troubleshooting', priority: 'HIGH'
  });
  const [newComplaint, setNewComplaint] = useState({
    studentId: 3001, category: 'COURSE_DELIVERY', subject: '', description: '', priority: 'MEDIUM'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashRes, tktRes, compRes, kbRes] = await Promise.allSettled([
        educationService.getStudentSupportDashboard(),
        educationService.getSupportTickets(),
        educationService.getComplaints(),
        educationService.searchKnowledgeBase('')
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value?.data) {
        setDashboardData(dashRes.value.data.data || dashRes.value.data);
      }
      if (tktRes.status === 'fulfilled' && tktRes.value?.data) {
        const list = tktRes.value.data.data?.content || tktRes.value.data.data || [];
        setTickets(list);
        if (list.length > 0 && !selectedTicket) {
          selectTicket(list[0]);
        }
      }
      if (compRes.status === 'fulfilled' && compRes.value?.data) {
        setComplaints(compRes.value.data.data?.content || compRes.value.data.data || []);
      }
      if (kbRes.status === 'fulfilled' && kbRes.value?.data) {
        setKbArticles(kbRes.value.data.data || []);
      }
    } catch (e) {
      console.error('Failed to load support data', e);
    } finally {
      setLoading(false);
    }
  };

  const selectTicket = async (ticket) => {
    setSelectedTicket(ticket);
    try {
      const res = await educationService.getTicketMessages(ticket.ticketId);
      setTicketMessages(res.data.data || []);
    } catch (err) {
      setTicketMessages([]);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      await educationService.createSupportTicket(newTicket);
      setActionSuccess('Support ticket created successfully!');
      setShowCreateModal(false);
      setNewTicket({ studentId: 3001, subject: '', description: '', category: 'LEARNING_PLATFORM', priority: 'HIGH', channel: 'EMAIL' });
      loadData();
    } catch (err) {
      setActionError(err.message || 'Failed to create ticket');
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!selectedTicket || !replyContent.trim()) return;
    try {
      await educationService.sendTicketReply(selectedTicket.ticketId, {
        messageType: 'PUBLIC_REPLY',
        channel: 'EMAIL',
        content: replyContent
      });
      setActionSuccess('Public reply queued for delivery!');
      setReplyContent('');
      selectTicket(selectedTicket);
    } catch (err) {
      setActionError(err.message || 'Failed to send reply');
    }
  };

  const handleAddInternalNote = async (e) => {
    e.preventDefault();
    if (!selectedTicket || !internalNoteContent.trim()) return;
    try {
      await educationService.addInternalNote(selectedTicket.ticketId, {
        content: internalNoteContent
      });
      setActionSuccess('Internal staff note recorded!');
      setInternalNoteContent('');
      selectTicket(selectedTicket);
    } catch (err) {
      setActionError(err.message || 'Failed to add internal note');
    }
  };

  const handleGenerateAiReply = async () => {
    if (!selectedTicket) return;
    try {
      const res = await educationService.generateAiReplyDraft(selectedTicket.ticketId, {
        tone: 'PROFESSIONAL',
        knowledgeScope: ['LEARNING_PLATFORM_HELP', 'STUDENT_ACCOUNT_POLICY']
      });
      setAiDraft(res.data.data || res.data);
      setActionSuccess('AI reply draft generated with knowledge citations!');
    } catch (err) {
      setActionError(err.message || 'Failed to generate AI draft');
    }
  };

  const handleResolveTicket = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;
    try {
      await educationService.resolveSupportTicket(selectedTicket.ticketId, resolveForm);
      setActionSuccess(`Ticket #${selectedTicket.ticketId} marked as RESOLVED!`);
      setShowResolveModal(false);
      loadData();
    } catch (err) {
      setActionError(err.message || 'Failed to resolve ticket');
    }
  };

  const handleEscalateTicket = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;
    try {
      await educationService.escalateSupportTicket(selectedTicket.ticketId, escalateForm);
      setActionSuccess(`Ticket #${selectedTicket.ticketId} ESCALATED!`);
      setShowEscalateModal(false);
      loadData();
    } catch (err) {
      setActionError(err.message || 'Failed to escalate ticket');
    }
  };

  const handleCreateComplaint = async (e) => {
    e.preventDefault();
    try {
      await educationService.createComplaint(newComplaint);
      setActionSuccess('Student complaint logged for investigation!');
      setShowComplaintModal(false);
      setNewComplaint({ studentId: 3001, category: 'COURSE_DELIVERY', subject: '', description: '', priority: 'MEDIUM' });
      loadData();
    } catch (err) {
      setActionError(err.message || 'Failed to create complaint');
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Support Dashboard', icon: LifeBuoy },
    { id: 'tickets', label: 'Ticket Workspace', icon: MessageSquare },
    { id: 'complaints', label: 'Student Complaints', icon: AlertTriangle },
    { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen },
    { id: 'reports', label: 'Support Reports', icon: ShieldCheck }
  ];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-cyan-950 to-slate-900 p-6 rounded-2xl border border-teal-700/40 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-teal-300 text-xs font-semibold uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-teal-400" />
              Student Support Desk • Deepak (Agent #201)
            </div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <LifeBuoy className="w-8 h-8 text-teal-400" />
              Student Support & Care Center
            </h1>
            <p className="text-teal-200/80 text-sm mt-1 max-w-2xl">
              Resolve student questions, handle complaints, assist with learning portal and schedule enquiries, manage internal notes, and utilize AI knowledge assistance.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-medium rounded-xl flex items-center gap-2 shadow-lg shadow-teal-900/40 transition-all text-sm"
            >
              <Plus className="w-4 h-4" />
              Create Ticket
            </button>
            <button
              onClick={() => setShowComplaintModal(true)}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-xl flex items-center gap-2 transition-all text-sm"
            >
              <AlertTriangle className="w-4 h-4" />
              Log Complaint
            </button>
            <button
              onClick={loadData}
              className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition text-teal-200"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto mt-6 pt-4 border-t border-teal-800/60 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-white text-teal-950 shadow-md font-bold'
                    : 'text-teal-200/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-teal-700' : 'text-teal-300'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess('')} className="text-xs hover:underline">Dismiss</button>
        </div>
      )}
      {actionError && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError('')} className="text-xs hover:underline">Dismiss</button>
        </div>
      )}

      {/* TAB 1: DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400">Assigned Tickets</span>
              <div className="text-2xl font-bold text-white mt-1">{dashboardData?.summary?.assignedTickets || 38}</div>
              <span className="text-[11px] text-teal-400 mt-1 block">Your queue</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400">Open Tickets</span>
              <div className="text-2xl font-bold text-amber-400 mt-1">{dashboardData?.summary?.openTickets || 14}</div>
              <span className="text-[11px] text-slate-400 mt-1 block">Active</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400">High Priority</span>
              <div className="text-2xl font-bold text-rose-400 mt-1">{dashboardData?.summary?.highPriorityTickets || 3}</div>
              <span className="text-[11px] text-rose-300 mt-1 block">Urgent action</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400">Unassigned</span>
              <div className="text-2xl font-bold text-blue-400 mt-1">{dashboardData?.summary?.unassignedTickets || 5}</div>
              <span className="text-[11px] text-blue-300 mt-1 block">New queue</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400">Resolved Month</span>
              <div className="text-2xl font-bold text-emerald-400 mt-1">{dashboardData?.summary?.resolvedThisMonth || 52}</div>
              <span className="text-[11px] text-emerald-300 mt-1 block">78.5% FCR</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400">Overdue SLA</span>
              <div className="text-2xl font-bold text-rose-500 mt-1">{dashboardData?.summary?.overdueTickets || 4}</div>
              <span className="text-[11px] text-rose-400 mt-1 block">SLA breach risk</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
              <h2 className="text-base font-semibold text-white mb-3">Tickets by Category</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300">Learning Platform & LMS Login</span>
                  <span className="px-2 py-0.5 bg-teal-500/20 text-teal-300 rounded font-bold">12</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300">Course Information & Timetable</span>
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded font-bold">9</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300">Certificates & Verification</span>
                  <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded font-bold">5</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
              <h2 className="text-base font-semibold text-white mb-3">Live Active Complaints</h2>
              <div className="space-y-2">
                {complaints.slice(0, 3).map(c => (
                  <div key={c.complaintId} className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/40 text-xs">
                    <div className="flex justify-between items-center font-semibold text-white">
                      <span>#{c.complaintId} - {c.subject}</span>
                      <span className="text-[10px] text-amber-400">{c.priority}</span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-1">{c.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TICKETS WORKSPACE */}
      {activeTab === 'tickets' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Ticket Queue (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">Support Ticket Queue</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-2.5 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded text-xs flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> New
              </button>
            </div>
            <div className="space-y-2">
              {tickets.map((t) => {
                const isSelected = selectedTicket?.ticketId === t.ticketId;
                return (
                  <div
                    key={t.ticketId}
                    onClick={() => selectTicket(t)}
                    className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-teal-950/40 border-teal-500/50 shadow-md'
                        : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-slate-400">#{t.ticketId}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        t.priority === 'HIGH' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-700 text-slate-300'
                      }`}>
                        {t.priority}
                      </span>
                    </div>
                    <h3 className="font-semibold text-white mt-1 text-sm">{t.subject}</h3>
                    <p className="text-slate-400 text-[11px] line-clamp-2 mt-1">{t.description}</p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/30 text-[11px] text-slate-400">
                      <span>{t.studentName || `Student #${t.studentId}`}</span>
                      <span className="text-teal-400 font-semibold">{t.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ticket Detail & Communication (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            {selectedTicket ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-teal-400 text-xs">#{selectedTicket.ticketId}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300">
                        {selectedTicket.status}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-white mt-1">{selectedTicket.subject}</h2>
                    <p className="text-xs text-slate-400">Student: {selectedTicket.studentName} (ID #{selectedTicket.studentId})</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowEscalateModal(true)}
                      className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 rounded text-xs font-semibold"
                    >
                      Escalate
                    </button>
                    <button
                      onClick={() => setShowResolveModal(true)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold"
                    >
                      Resolve
                    </button>
                  </div>
                </div>

                {/* Conversation Timeline */}
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  <div className="p-3 bg-slate-800/30 rounded-lg border border-slate-700/40 text-xs">
                    <span className="text-slate-400 font-semibold block text-[11px]">Original Issue Description</span>
                    <p className="text-slate-200 mt-1 whitespace-pre-wrap">{selectedTicket.description}</p>
                  </div>

                  {ticketMessages.map((m) => (
                    <div
                      key={m.messageId}
                      className={`p-3 rounded-lg text-xs ${
                        m.messageType === 'PUBLIC_REPLY'
                          ? 'bg-blue-950/40 border border-blue-800/40 ml-4'
                          : 'bg-amber-950/40 border border-amber-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-bold text-blue-300">Agent Reply ({m.channel})</span>
                        <span className="text-slate-400">{m.createdAt}</span>
                      </div>
                      <p className="text-slate-200 whitespace-pre-wrap">{m.content}</p>
                    </div>
                  ))}
                </div>

                {/* Action Boxes: Public Reply vs. Internal Staff Note */}
                <div className="pt-2 border-t border-slate-800 space-y-4">
                  {/* AI Assistance Trigger */}
                  <div className="flex items-center justify-between p-3 bg-teal-950/30 border border-teal-800/40 rounded-xl">
                    <div className="flex items-center gap-2 text-xs text-teal-300">
                      <Sparkles className="w-4 h-4 text-teal-400" />
                      <span>Need help drafting an answer from verified institutional knowledge?</span>
                    </div>
                    <button
                      onClick={handleGenerateAiReply}
                      className="px-3 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded text-xs font-medium"
                    >
                      Draft AI Reply
                    </button>
                  </div>

                  {aiDraft && (
                    <div className="p-3 bg-slate-800 rounded-lg border border-teal-500/40 space-y-2 text-xs">
                      <div className="flex justify-between items-center text-teal-400 font-semibold">
                        <span>AI Suggested Reply (KB-Grounded)</span>
                        <button
                          onClick={() => setReplyContent(aiDraft.suggestedReply)}
                          className="text-[11px] bg-teal-600/30 hover:bg-teal-600/60 text-teal-200 px-2 py-0.5 rounded"
                        >
                          Use in Public Reply
                        </button>
                      </div>
                      <p className="text-slate-200 text-xs italic">{aiDraft.suggestedReply}</p>
                      <div className="text-[11px] text-slate-400">
                        Sources: {aiDraft.knowledgeSources?.map(k => k.title).join(', ')}
                      </div>
                    </div>
                  )}

                  {/* Public Reply Input */}
                  <div>
                    <label className="text-xs text-slate-300 font-semibold flex items-center gap-1 mb-1">
                      <Send className="w-3.5 h-3.5 text-blue-400" />
                      Send Public Reply to Student (Email / Portal)
                    </label>
                    <textarea
                      rows={2}
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Type response to student..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                    />
                    <div className="flex justify-end mt-1">
                      <button
                        onClick={handleSendReply}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium text-xs flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" /> Send Reply
                      </button>
                    </div>
                  </div>

                  {/* Internal Staff Note Input */}
                  <div>
                    <label className="text-xs text-amber-300 font-semibold flex items-center gap-1 mb-1">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      Add Private Internal Staff Note (Never shared with student)
                    </label>
                    <textarea
                      rows={2}
                      value={internalNoteContent}
                      onChange={(e) => setInternalNoteContent(e.target.value)}
                      placeholder="e.g. Verified LMS credentials in database..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                    />
                    <div className="flex justify-end mt-1">
                      <button
                        onClick={handleAddInternalNote}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded font-medium text-xs flex items-center gap-1"
                      >
                        <Lock className="w-3 h-3" /> Save Note
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-20 text-slate-500 text-xs">
                Select a ticket from the queue to view messages and respond.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: COMPLAINTS */}
      {activeTab === 'complaints' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Student Complaints & Grievance Log</h2>
            <button
              onClick={() => setShowComplaintModal(true)}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Log Complaint
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-medium">Complaint ID</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Subject</th>
                  <th className="pb-3 font-medium">Student ID</th>
                  <th className="pb-3 font-medium">Priority</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {complaints.map((c) => (
                  <tr key={c.complaintId} className="hover:bg-slate-800/30">
                    <td className="py-3 font-mono text-slate-300">#{c.complaintId}</td>
                    <td className="py-3 font-semibold text-white">{c.category}</td>
                    <td className="py-3 text-slate-300">{c.subject}</td>
                    <td className="py-3 text-slate-400">#{c.studentId}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400">
                        {c.priority}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-400">
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400">{c.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: KNOWLEDGE BASE */}
      {activeTab === 'knowledge' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Institutional Knowledge Base (Grounding Truth)</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {kbArticles.map((kb) => (
              <div key={kb.sourceId} className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm">{kb.title}</h3>
                  <span className="font-mono text-slate-400 text-[11px]">{kb.sourceId}</span>
                </div>
                <p className="text-slate-300 leading-relaxed">{kb.content}</p>
                <span className="px-2 py-0.5 bg-teal-500/20 text-teal-300 rounded text-[10px] inline-block font-semibold">
                  {kb.category || 'APPROVED_POLICY'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: REPORTS */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl space-y-2">
              <span className="text-xs text-slate-400">Resolution Speed</span>
              <div className="text-3xl font-bold text-teal-400">4.2 Hours</div>
              <p className="text-xs text-slate-400">Well under 8-hour target SLA</p>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl space-y-2">
              <span className="text-xs text-slate-400">First Contact Resolution</span>
              <div className="text-3xl font-bold text-emerald-400">78.5%</div>
              <p className="text-xs text-slate-400">Target: 70%</p>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl space-y-2">
              <span className="text-xs text-slate-400">CSAT Student Rating</span>
              <div className="text-3xl font-bold text-amber-400">4.8 / 5.0 ⭐</div>
              <p className="text-xs text-slate-400">52 resolved tickets this month</p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE TICKET */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-teal-400" />
              Open Support Ticket
            </h3>
            <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Subject</label>
                <input
                  required
                  type="text"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  placeholder="e.g. Unable to access learning portal"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Category</label>
                  <select
                    value={newTicket.category}
                    onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                  >
                    <option value="LEARNING_PLATFORM">Learning Platform (LMS)</option>
                    <option value="COURSE_INFORMATION">Course Information</option>
                    <option value="CERTIFICATE">Certificate Issuance</option>
                    <option value="SCHEDULE">Batch Schedule</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Priority</label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                  >
                    <option value="HIGH">High Priority</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  placeholder="Student description of problem..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-medium"
                >
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RESOLVE TICKET */}
      {showResolveModal && selectedTicket && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Resolve Ticket #{selectedTicket.ticketId}
            </h3>
            <form onSubmit={handleResolveTicket} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Resolution Code</label>
                <select
                  value={resolveForm.resolutionCode}
                  onChange={(e) => setResolveForm({ ...resolveForm, resolutionCode: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                >
                  <option value="ACCOUNT_ACCESS_RESTORED">Account Access Restored</option>
                  <option value="COURSE_SCHEDULE_CONFIRMED">Schedule Clarified</option>
                  <option value="CERTIFICATE_DISPATCHED">Certificate Dispatched</option>
                  <option value="INFORMATION_PROVIDED">Information Provided</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Resolution Summary</label>
                <textarea
                  rows={3}
                  value={resolveForm.resolutionNotes}
                  onChange={(e) => setResolveForm({ ...resolveForm, resolutionNotes: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResolveModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium"
                >
                  Mark Resolved
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ESCALATE TICKET */}
      {showEscalateModal && selectedTicket && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              Escalate Ticket #{selectedTicket.ticketId}
            </h3>
            <form onSubmit={handleEscalateTicket} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Escalate To</label>
                <select
                  value={escalateForm.escalationType}
                  onChange={(e) => setEscalateForm({ ...escalateForm, escalationType: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                >
                  <option value="TECHNICAL_TEAM">Technical / LMS Infrastructure</option>
                  <option value="ACADEMIC_DIRECTOR">Academic Lead</option>
                  <option value="BILLING_TEAM">Finance / Billing</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Reason for Escalation</label>
                <textarea
                  rows={3}
                  value={escalateForm.reason}
                  onChange={(e) => setEscalateForm({ ...escalateForm, reason: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEscalateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-medium"
                >
                  Confirm Escalation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LOG COMPLAINT */}
      {showComplaintModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Register Formal Complaint
            </h3>
            <form onSubmit={handleCreateComplaint} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Subject</label>
                <input
                  required
                  type="text"
                  value={newComplaint.subject}
                  onChange={(e) => setNewComplaint({ ...newComplaint, subject: e.target.value })}
                  placeholder="e.g. Class schedule changed without notice"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Category</label>
                <select
                  value={newComplaint.category}
                  onChange={(e) => setNewComplaint({ ...newComplaint, category: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                >
                  <option value="COURSE_DELIVERY">Course Delivery</option>
                  <option value="FACULTY">Faculty Interaction</option>
                  <option value="FACILITY">Technical Platform</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Details</label>
                <textarea
                  rows={3}
                  required
                  value={newComplaint.description}
                  onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowComplaintModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium"
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
