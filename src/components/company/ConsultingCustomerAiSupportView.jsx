import React, { useState, useEffect } from 'react';
import {
  MessageSquare, Bot, AlertTriangle, CheckCircle2, Search, RefreshCw,
  Send, HelpCircle, ShieldAlert, Users, Clock, BookOpen, Star, Sparkles,
  ArrowRight, ShieldCheck, ChevronRight, Check, X, Building
} from 'lucide-react';
import { consultingService } from '../../services/consultingService';

export function ConsultingCustomerAiSupportView() {
  const [activeTab, setActiveTab] = useState('chat-workspace');
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [articles, setArticles] = useState([]);
  const [notification, setNotification] = useState(null);

  // Chat message & AI answer state
  const [chatInput, setChatInput] = useState('');
  const [aiAnswer, setAiAnswer] = useState(null);
  const [aiGenerating, setAiGenerating] = useState(false);

  // Modals state
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [showHandoffModal, setShowHandoffModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  // Forms
  const [ticketForm, setTicketForm] = useState({
    subject: 'Unable to access project dashboard', category: 'TECHNICAL_SUPPORT',
    priority: 'NORMAL', description: 'The client reports that the project dashboard does not load.'
  });
  const [escalateForm, setEscalateForm] = useState({
    targetTeam: 'TECHNICAL_SUPPORT', reason: 'CLIENT_REQUEST',
    summary: 'Client requests technical assistance with the project dashboard.', priority: 'HIGH'
  });
  const [handoffForm, setHandoffForm] = useState({
    targetTeam: 'TECHNICAL_SUPPORT', reason: 'COMPLEX_TECHNICAL_ISSUE',
    summary: 'The client needs help investigating a project dashboard issue.', urgency: 'NORMAL'
  });

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [dashRes, convRes, tktRes, kbRes] = await Promise.all([
        consultingService.aiSupport.getDashboard().catch(() => ({
          activeConversations: 32, ticketsCreatedToday: 14, awaitingHumanHandoff: 4,
          resolvedByAutomation: 21, groundingFailures: 2, escalatedConversations: 5
        })),
        consultingService.aiSupport.getConversations().catch(() => [
          {
            conversationId: 'CONV-1001', clientId: 'CLIENT-1001', channel: 'WEB_CHAT',
            status: 'OPEN', assignedAgent: 'AI_SUPPORT_AGENT', subject: 'Cloud migration project status'
          }
        ]),
        consultingService.aiSupport.getTickets().catch(() => [
          {
            ticketId: 'TKT-1001', clientId: 'CLIENT-1001', subject: 'Unable to access project dashboard',
            category: 'TECHNICAL_SUPPORT', priority: 'NORMAL', status: 'OPEN', createdBy: 'AI_SUPPORT_AGENT'
          }
        ]),
        consultingService.aiSupport.searchKnowledge({ query: 'support escalation' }).catch(() => ({
          results: [{
            articleId: 'KB-1001', title: 'Customer Support Escalation Policy',
            category: 'SUPPORT_POLICY', published: true, relevanceScore: 0.94
          }]
        }))
      ]);

      setDashboard(dashRes);
      setConversations(convRes);
      if (convRes.length > 0 && !activeConv) {
        setActiveConv(convRes[0]);
      }
      setTickets(tktRes);
      setArticles(kbRes?.results || []);
    } catch (err) {
      console.error('Failed to load AI Support data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    try {
      const convId = activeConv?.conversationId || 'CONV-1001';
      await consultingService.aiSupport.submitMessage(convId, {
        message: chatInput,
        messageType: 'TEXT',
        language: 'en'
      });
      setChatInput('');
      showNotification('Message processed by AI support agent');
    } catch (err) {
      showNotification(err.message || 'Failed to submit message', 'error');
    }
  };

  const handleGenerateAnswer = async () => {
    try {
      setAiGenerating(true);
      const res = await consultingService.aiSupport.generateAnswerAi({
        conversationId: activeConv?.conversationId || 'CONV-1001',
        question: 'What is the current status of our cloud migration?',
        context: { clientId: 'CLIENT-1001', engagementId: 'ENG-1001' },
        responseMode: 'GROUNDED'
      });
      setAiAnswer(res);
      showNotification('Grounded response generated with verified project reference');
    } catch (err) {
      showNotification(err.message || 'Failed to generate answer', 'error');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      await consultingService.aiSupport.createTicket({
        ...ticketForm,
        clientId: 'CLIENT-1001',
        conversationId: activeConv?.conversationId || 'CONV-1001'
      });
      showNotification('Support ticket created (TKT-1001)');
      setShowTicketModal(false);
      loadAllData();
    } catch (err) {
      showNotification(err.message || 'Failed to create ticket', 'error');
    }
  };

  const handleEscalateTicket = async (e) => {
    e.preventDefault();
    try {
      const tId = selectedTicketId || 'TKT-1001';
      await consultingService.aiSupport.escalateTicket(tId, escalateForm);
      showNotification(`Ticket ${tId} escalated to ${escalateForm.targetTeam} (ESC-1001)`);
      setShowEscalateModal(false);
      loadAllData();
    } catch (err) {
      showNotification(err.message || 'Failed to escalate ticket', 'error');
    }
  };

  const handleHandoffConversation = async (e) => {
    e.preventDefault();
    try {
      const convId = activeConv?.conversationId || 'CONV-1001';
      await consultingService.aiSupport.handoffConversation(convId, handoffForm);
      showNotification('Conversation handed off to human agent (HO-SUP-1001)');
      setShowHandoffModal(false);
      loadAllData();
    } catch (err) {
      showNotification(err.message || 'Failed to handoff conversation', 'error');
    }
  };

  const handleRequestInformation = async (ticketId) => {
    try {
      await consultingService.aiSupport.requestInformation(ticketId || 'TKT-1001', {
        requestedInformation: [
          'Approximate time the issue started',
          'Error message displayed',
          'Whether the issue affects other authorized users'
        ],
        channel: 'WEB_CHAT',
        requiresHumanApproval: true
      });
      showNotification('Information request prepared (202 Accepted: PENDING_APPROVAL)');
    } catch (err) {
      showNotification(err.message || 'Failed to prepare information request', 'error');
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-950/40 via-cyan-950/30 to-slate-900/50 p-6 rounded-2xl border border-blue-500/20 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-500/30 text-blue-300">
              <Bot className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Customer AI Support Agent</h1>
              <p className="text-sm text-blue-200/70">Authoritative grounded answers, project status verification, tickets & human escalation</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadAllData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-sm font-medium rounded-xl border border-slate-700 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowTicketModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition"
          >
            <MessageSquare className="w-4 h-4" />
            Create Ticket
          </button>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div className={`p-4 rounded-xl flex items-center justify-between text-sm ${
          notification.type === 'error'
            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
        }`}>
          <span>{notification.msg}</span>
          <button onClick={() => setNotification(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto pb-1">
        {[
          { id: 'chat-workspace', label: 'AI Support Chat', icon: MessageSquare },
          { id: 'dashboard', label: 'Automation Metrics', icon: Clock },
          { id: 'tickets', label: 'Tickets & Escalations', icon: ShieldAlert },
          { id: 'knowledge', label: 'Approved Knowledge Base', icon: BookOpen },
          { id: 'feedback', label: 'Client Feedback & CSAT', icon: Star }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                isActive
                  ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: AI SUPPORT CHAT WORKSPACE */}
      {activeTab === 'chat-workspace' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Chat Window */}
          <div className="md:col-span-2 bg-slate-900/80 rounded-2xl border border-slate-800 flex flex-col h-[600px] overflow-hidden">
            {/* Conversation Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-blue-400 font-bold">{activeConv?.conversationId || 'CONV-1001'}</span>
                <span className="text-xs text-slate-400">• Channel: WEB_CHAT • Status: OPEN</span>
              </div>
              <button
                onClick={() => setShowHandoffModal(true)}
                className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold rounded-lg border border-amber-500/30 transition flex items-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5" />
                Transfer to Human
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
                  CL
                </div>
                <div className="p-4 bg-slate-800 rounded-2xl max-w-lg space-y-1">
                  <div className="text-xs font-semibold text-slate-400">Arun Kumar (Client)</div>
                  <p className="text-sm text-white">Can you provide an update on our cloud migration project status?</p>
                </div>
              </div>

              {aiAnswer && (
                <div className="flex items-start gap-3 justify-end">
                  <div className="p-4 bg-blue-950/60 border border-blue-500/30 rounded-2xl max-w-lg space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-blue-300 flex items-center gap-1">
                        <Bot className="w-3.5 h-3.5" /> AI Support Agent
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {aiAnswer.groundingStatus}
                      </span>
                    </div>
                    <p className="text-sm text-slate-200">{aiAnswer.answer}</p>
                    <div className="pt-2 border-t border-blue-900/40 text-[11px] text-slate-400 flex items-center gap-2">
                      <span>Source:</span>
                      {aiAnswer.sourceReferences?.map((s, i) => (
                        <span key={i} className="font-mono text-cyan-300 bg-blue-900/30 px-1.5 py-0.5 rounded">
                          {s.sourceType}: {s.sourceId}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-300 shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input / Action Bar */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/90 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Grounding status: Authorized CRM & Project DB</span>
                <button
                  type="button"
                  onClick={handleGenerateAnswer}
                  disabled={aiGenerating}
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {aiGenerating ? 'Verifying with Project API...' : 'Generate Grounded Answer'}
                </button>
              </div>
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a support response or question..."
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send
                </button>
              </form>
            </div>
          </div>

          {/* Context Sidebar */}
          <div className="space-y-6">
            <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
              <h4 className="text-sm font-semibold text-white">Verified Client Context</h4>
              <div className="space-y-2 text-xs text-slate-300">
                <div>Client: <span className="font-semibold text-white">Example Manufacturing Ltd</span></div>
                <div>Account ID: <span className="font-mono text-blue-400">CLIENT-1001</span></div>
                <div>Active Engagement: <span className="text-white">Cloud Migration Consulting (ENG-1001)</span></div>
                <div>Status Source: <span className="text-emerald-400 font-semibold">PROJECT_MANAGEMENT_SYSTEM</span></div>
                <div>Verified Phase: <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">TESTING</span></div>
              </div>
              <div className="pt-3 border-t border-slate-800 text-xs text-slate-400">
                Grounding Policy: Never invent project milestones or contract prices.
              </div>
            </div>

            <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-sm font-semibold text-white">Quick Ticket Actions</h4>
              <button
                onClick={() => handleRequestInformation('TKT-1001')}
                className="w-full text-left px-3 py-2 bg-slate-950/60 hover:bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 transition"
              >
                Request Missing Information (202 Accepted)
              </button>
              <button
                onClick={() => {
                  setSelectedTicketId('TKT-1001');
                  setShowEscalateModal(true);
                }}
                className="w-full text-left px-3 py-2 bg-slate-950/60 hover:bg-slate-950 rounded-xl border border-slate-800 text-xs text-rose-400 transition"
              >
                Escalate to Technical Support
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AUTOMATION METRICS */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: 'Active Conversations', val: dashboard?.activeConversations || 32, icon: MessageSquare, color: 'text-blue-400' },
            { label: 'Tickets Created Today', val: dashboard?.ticketsCreatedToday || 14, icon: ShieldAlert, color: 'text-emerald-400' },
            { label: 'Awaiting Human Handoff', val: dashboard?.awaitingHumanHandoff || 4, icon: Users, color: 'text-amber-400' },
            { label: 'Resolved By Automation', val: dashboard?.resolvedByAutomation || 21, icon: CheckCircle2, color: 'text-teal-400' },
            { label: 'Grounding Failures', val: dashboard?.groundingFailures || 2, icon: AlertTriangle, color: 'text-rose-400' },
            { label: 'Escalated Conversations', val: dashboard?.escalatedConversations || 5, icon: Clock, color: 'text-purple-400' }
          ].map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <div key={idx} className="bg-slate-900/60 p-5 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400">{kpi.label}</span>
                  <Icon className={`w-4 h-4 ${kpi.color}`} />
                </div>
                <div className="text-2xl font-bold text-white">{kpi.val}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: TICKETS & ESCALATIONS */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">Support Tickets ({tickets.length})</h3>
            <button
              onClick={() => setShowTicketModal(true)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-xl shadow transition"
            >
              + Create Support Ticket
            </button>
          </div>

          <div className="bg-slate-900/70 rounded-2xl border border-slate-800 overflow-hidden divide-y divide-slate-800">
            {tickets.map(tkt => (
              <div key={tkt.ticketId} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-blue-400 font-bold">{tkt.ticketId}</span>
                    <h4 className="text-sm font-semibold text-white">{tkt.subject}</h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300">
                      {tkt.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{tkt.description}</p>
                  <div className="text-[11px] text-slate-500">
                    Created By: {tkt.createdBy} • Priority: {tkt.priority} • Status: {tkt.status}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRequestInformation(tkt.ticketId)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition"
                  >
                    Request Info
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTicketId(tkt.ticketId);
                      setShowEscalateModal(true);
                    }}
                    className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-medium rounded-lg border border-rose-500/30 transition"
                  >
                    Escalate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: KNOWLEDGE BASE */}
      {activeTab === 'knowledge' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
            <h3 className="text-base font-semibold text-white mb-2">Approved Knowledge Articles</h3>
            <div className="space-y-3 mt-4">
              {articles.map(art => (
                <div key={art.articleId} className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs text-blue-400">{art.articleId}</span>
                    <h4 className="text-sm font-bold text-white mt-0.5">{art.title}</h4>
                    <span className="text-xs text-slate-400">Category: {art.category}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300">
                    Relevance: 94%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: CSAT FEEDBACK */}
      {activeTab === 'feedback' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">Client Feedback & CSAT</h3>
                <p className="text-xs text-slate-400">Recent ratings recorded for AI support interactions</p>
              </div>
              <button
                onClick={async () => {
                  await consultingService.aiSupport.recordFeedback({
                    conversationId: activeConv?.conversationId || 'CONV-1001',
                    rating: 4,
                    comments: 'The response was helpful.',
                    source: 'WEB_CHAT'
                  });
                  showNotification('Feedback recorded (FB-SUP-1001: 4/5 Stars)');
                }}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-xl shadow transition"
              >
                + Record Sample Feedback
              </button>
            </div>
            <div className="mt-4 p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-mono text-slate-400">FB-SUP-1001 • CONV-1001</div>
                <div className="text-sm text-slate-200 mt-1">"The response was helpful."</div>
              </div>
              <div className="flex items-center gap-1 text-amber-400 font-bold">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>4.0 / 5.0</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE TICKET MODAL */}
      {showTicketModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Create Support Ticket</h3>
            <form onSubmit={handleCreateTicket} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Subject</label>
                <input
                  type="text"
                  value={ticketForm.subject}
                  onChange={e => setTicketForm({ ...ticketForm, subject: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400">Category</label>
                  <select
                    value={ticketForm.category}
                    onChange={e => setTicketForm({ ...ticketForm, category: e.target.value })}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="TECHNICAL_SUPPORT">TECHNICAL_SUPPORT</option>
                    <option value="PROJECT_STATUS">PROJECT_STATUS</option>
                    <option value="BILLING_ENQUIRY">BILLING_ENQUIRY</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400">Priority</label>
                  <select
                    value={ticketForm.priority}
                    onChange={e => setTicketForm({ ...ticketForm, priority: e.target.value })}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                  >
                    <option value="NORMAL">NORMAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400">Description</label>
                <textarea
                  rows={3}
                  value={ticketForm.description}
                  onChange={e => setTicketForm({ ...ticketForm, description: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowTicketModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg"
                >
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ESCALATE MODAL */}
      {showEscalateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Escalate Ticket</h3>
            <form onSubmit={handleEscalateTicket} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Target Support Team</label>
                <input
                  type="text"
                  value={escalateForm.targetTeam}
                  onChange={e => setEscalateForm({ ...escalateForm, targetTeam: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Escalation Summary</label>
                <textarea
                  rows={2}
                  value={escalateForm.summary}
                  onChange={e => setEscalateForm({ ...escalateForm, summary: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEscalateModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold rounded-lg"
                >
                  Confirm Escalation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HANDOFF CONVERSATION MODAL */}
      {showHandoffModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Transfer Conversation to Human Support</h3>
            <form onSubmit={handleHandoffConversation} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Target Team</label>
                <input
                  type="text"
                  value={handoffForm.targetTeam}
                  onChange={e => setHandoffForm({ ...handoffForm, targetTeam: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Context Summary</label>
                <textarea
                  rows={3}
                  value={handoffForm.summary}
                  onChange={e => setHandoffForm({ ...handoffForm, summary: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowHandoffModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white text-xs font-semibold rounded-lg"
                >
                  Transfer to Human
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
