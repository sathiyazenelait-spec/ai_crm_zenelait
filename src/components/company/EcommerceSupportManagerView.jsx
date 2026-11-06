import React, { useState, useEffect } from 'react';
import {
  Headphones, Users, UserPlus, AlertTriangle, Shield, CheckCircle2,
  TrendingUp, FileText, Bot, ArrowRight, RefreshCw, Search, Clock,
  BookOpen, Sliders, Activity, Phone, Mail, ChevronRight, CheckCircle,
  HelpCircle, Settings, Award, Plus, Send
} from 'lucide-react';
import { ecommerceService } from '../../services/ecommerceService';

export default function EcommerceSupportManagerView() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState({
    openTickets: 240,
    unassignedTickets: 18,
    ticketsAwaitingCustomer: 45,
    ticketsAwaitingInternalTeam: 22,
    openEscalations: 12,
    activeAgents: 15,
    averageFirstResponseMinutes: 12.5,
    averageResolutionHours: 8.4,
    customerSatisfactionScore: 4.4,
    aiDraftsAwaitingReview: 9
  });

  const [agents, setAgents] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [queues, setQueues] = useState([]);
  const [escalations, setEscalations] = useState([]);
  const [articles, setArticles] = useState([]);
  const [aiConfig, setAiConfig] = useState(null);
  const [aiQuality, setAiQuality] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [csat, setCsat] = useState(null);
  const [auditEvents, setAuditEvents] = useState([]);
  const [toast, setToast] = useState('');

  // Modals
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newAgent, setNewAgent] = useState({ name: '', email: '', role: 'SUPPORT_AGENT', maxConcurrentTickets: 15 });
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [assignAgentId, setAssignAgentId] = useState('');
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [newArticle, setNewArticle] = useState({ title: '', category: 'ORDER_TRACKING', content: '', language: 'en' });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashRes, agRes, tktRes, qRes, escRes, artRes, aiRes, qualRes, metRes, csatRes, audRes] = await Promise.allSettled([
        ecommerceService.supportManager.getDashboard(),
        ecommerceService.supportManager.getAgents({ page: 0, size: 20 }),
        ecommerceService.supportManager.getTickets({ page: 0, size: 20 }),
        ecommerceService.supportManager.getQueues(),
        ecommerceService.supportManager.getEscalations({ page: 0, size: 20 }),
        ecommerceService.supportManager.getKnowledgeArticles({}),
        ecommerceService.supportManager.getAiSupportConfig(),
        ecommerceService.supportManager.getAiQualityMetrics(),
        ecommerceService.supportManager.getMetrics({ from: '2026-10-01', to: '2026-10-28' }),
        ecommerceService.supportManager.getCustomerSatisfaction(),
        ecommerceService.supportManager.getAuditEvents({ page: 0, size: 20 })
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value?.data?.data) {
        setDashboard(dashRes.value.data.data);
      }
      if (agRes.status === 'fulfilled' && agRes.value?.data?.data?.content) {
        setAgents(agRes.value.data.data.content);
      }
      if (tktRes.status === 'fulfilled' && tktRes.value?.data?.data?.content) {
        setTickets(tktRes.value.data.data.content);
      }
      if (qRes.status === 'fulfilled' && qRes.value?.data?.data?.content) {
        setQueues(qRes.value.data.data.content);
      }
      if (escRes.status === 'fulfilled' && escRes.value?.data?.data?.content) {
        setEscalations(escRes.value.data.data.content);
      }
      if (artRes.status === 'fulfilled' && artRes.value?.data?.data?.content) {
        setArticles(artRes.value.data.data.content);
      }
      if (aiRes.status === 'fulfilled' && aiRes.value?.data?.data) {
        setAiConfig(aiRes.value.data.data);
      }
      if (qualRes.status === 'fulfilled' && qualRes.value?.data?.data) {
        setAiQuality(qualRes.value.data.data);
      }
      if (metRes.status === 'fulfilled' && metRes.value?.data?.data) {
        setMetrics(metRes.value.data.data);
      }
      if (csatRes.status === 'fulfilled' && csatRes.value?.data?.data) {
        setCsat(csatRes.value.data.data);
      }
      if (audRes.status === 'fulfilled' && audRes.value?.data?.data?.content) {
        setAuditEvents(audRes.value.data.data.content);
      }
    } catch (e) {
      console.error('Error loading support manager data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInviteAgent = async (e) => {
    e.preventDefault();
    try {
      const res = await ecommerceService.supportManager.inviteAgent(newAgent);
      if (res.data?.success) {
        showToast('Agent invitation created');
        setShowInviteModal(false);
        setNewAgent({ name: '', email: '', role: 'SUPPORT_AGENT', maxConcurrentTickets: 15 });
        loadData();
      }
    } catch (err) {
      showToast('Error inviting agent');
    }
  };

  const handleAssignTicket = async () => {
    if (!selectedTicket || !assignAgentId) return;
    try {
      const res = await ecommerceService.supportManager.assignTicket(selectedTicket.ticketId, {
        assignedAgentId: assignAgentId,
        reason: 'Workload balance by Support Manager'
      });
      if (res.data?.success) {
        showToast('Ticket assigned successfully');
        setSelectedTicket(null);
        setAssignAgentId('');
        loadData();
      }
    } catch (err) {
      showToast('Error assigning ticket');
    }
  };

  const handleCreateArticle = async (e) => {
    e.preventDefault();
    try {
      const res = await ecommerceService.supportManager.createKnowledgeArticle(newArticle);
      if (res.data?.success) {
        showToast('Knowledge article draft created');
        setShowArticleModal(false);
        setNewArticle({ title: '', category: 'ORDER_TRACKING', content: '', language: 'en' });
        loadData();
      }
    } catch (err) {
      showToast('Error creating article draft');
    }
  };

  const handlePublishArticle = async (articleId) => {
    try {
      const res = await ecommerceService.supportManager.publishKnowledgeArticle(articleId, {
        approvalComment: 'Verified by Support Manager for AI support retrieval'
      });
      if (res.data?.success) {
        showToast('Article published to AI knowledge base');
        loadData();
      }
    } catch (err) {
      showToast('Error publishing article');
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-teal-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-teal-200" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900/90 via-cyan-900/80 to-slate-900 border border-teal-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-500/20 text-teal-400 rounded-xl border border-teal-500/30">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-wide">Customer Support Manager</h1>
              <p className="text-sm text-teal-300/80">Support Workload, SLA Protection, Escalations & AI Agent Supervision</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white px-4 py-2.5 rounded-xl font-medium shadow-lg transition-all text-sm border border-teal-400/30"
            >
              <UserPlus className="w-4 h-4" />
              <span>Onboard Agent</span>
            </button>
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 rounded-xl border border-slate-700/60 transition"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-teal-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto border-b border-teal-500/20 pb-2">
          {[
            { id: 'dashboard', label: 'Support Dashboard', icon: Activity },
            { id: 'tickets', label: 'Ticket Queue', icon: FileText },
            { id: 'agents', label: 'Support Agents', icon: Users },
            { id: 'escalations', label: 'Escalations', icon: AlertTriangle },
            { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen },
            { id: 'ai-support', label: 'AI Support Quality', icon: Bot },
            { id: 'metrics', label: 'SLA & CSAT Metrics', icon: Award },
            { id: 'audit', label: 'Audit Trail', icon: Shield },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-teal-500/25 text-teal-300 border border-teal-400/40 shadow-md'
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

      {/* TAB 1: DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>Open Support Tickets</span>
                <Headphones className="w-4 h-4 text-teal-400" />
              </div>
              <div className="mt-2 text-2xl font-bold text-white">{dashboard.openTickets || 240}</div>
              <div className="mt-2 text-xs text-amber-400 font-medium">
                {dashboard.unassignedTickets || 18} Unassigned Tickets
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>Avg First Response</span>
                <Clock className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="mt-2 text-2xl font-bold text-white">{dashboard.averageFirstResponseMinutes || 12.5} mins</div>
              <div className="mt-2 text-xs text-emerald-400 font-medium">Resolution: {dashboard.averageResolutionHours || 8.4}h avg</div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>Open Escalations</span>
                <AlertTriangle className="w-4 h-4 text-red-400" />
              </div>
              <div className="mt-2 text-2xl font-bold text-white">{dashboard.openEscalations || 12}</div>
              <div className="mt-2 text-xs text-slate-400">Targeting Order Ops & Logistics</div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>CSAT Score</span>
                <Award className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="mt-2 text-2xl font-bold text-emerald-400">{dashboard.customerSatisfactionScore || 4.4} / 5.0</div>
              <div className="mt-2 text-xs text-slate-400">Based on 820 customer ratings</div>
            </div>
          </div>

          {/* Quick Ticket Queue & Escalations Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl p-6">
              <h2 className="text-base font-semibold text-white mb-4 flex items-center justify-between">
                <span>Active Tickets Requiring Attention</span>
                <button onClick={() => setActiveTab('tickets')} className="text-xs text-teal-400 hover:underline">View All Tickets</button>
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/60 text-slate-400 font-medium uppercase border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Ticket</th>
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">Priority</th>
                      <th className="py-3 px-4">SLA Status</th>
                      <th className="py-3 px-4">Assignee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {tickets.map(t => (
                      <tr key={t.ticketId} className="hover:bg-slate-800/30">
                        <td className="py-3 px-4 font-mono text-teal-300">{t.ticketNumber}</td>
                        <td className="py-3 px-4 font-medium text-white">{t.subject}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            t.priority === 'URGENT' ? 'bg-red-500/20 text-red-300' : 'bg-slate-700 text-slate-300'
                          }`}>
                            {t.priority}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            t.slaStatus === 'AT_RISK' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                          }`}>
                            {t.slaStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-400">{t.assignedAgentId || 'Unassigned'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4">
              <h2 className="text-base font-semibold text-white">Department Escalations</h2>
              <div className="space-y-3">
                {escalations.map(esc => (
                  <div key={esc.escalationId} className="p-3.5 bg-slate-800/50 rounded-xl border border-slate-700/60 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{esc.targetTeam}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded font-semibold">{esc.status}</span>
                    </div>
                    <p className="text-slate-300">{esc.reason}</p>
                    <span className="text-slate-500 font-mono text-[10px]">Ticket ID: {esc.ticketId}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TICKET QUEUE & REASSIGNMENT */}
      {activeTab === 'tickets' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Support Ticket Allocation & Routing</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/60 text-slate-400 font-medium uppercase border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Number</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Assignee</th>
                    <th className="py-3 px-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {tickets.map(t => (
                    <tr key={t.ticketId} className="hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-mono text-teal-300">{t.ticketNumber}</td>
                      <td className="py-3 px-4 font-semibold text-white">{t.subject}</td>
                      <td className="py-3 px-4">{t.category}</td>
                      <td className="py-3 px-4">{t.priority}</td>
                      <td className="py-3 px-4">{t.status}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">{t.assignedAgentId || 'Unassigned'}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => { setSelectedTicket(t); setAssignAgentId(t.assignedAgentId || 'usr_support_101'); }}
                          className="px-3 py-1 bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/30 rounded-lg text-xs font-medium"
                        >
                          Reassign Agent
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ticket Reassignment Dialog */}
          {selectedTicket && (
            <div className="p-5 bg-slate-900 border border-teal-500/40 rounded-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center justify-between">
                <span>Assign Ticket: {selectedTicket.ticketNumber} ({selectedTicket.subject})</span>
                <button onClick={() => setSelectedTicket(null)} className="text-xs text-slate-400 hover:text-white">Cancel</button>
              </h3>
              <div className="flex items-center gap-4 text-xs">
                <select
                  value={assignAgentId}
                  onChange={(e) => setAssignAgentId(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white"
                >
                  {agents.map(ag => (
                    <option key={ag.agentId} value={ag.agentId}>
                      {ag.name} ({ag.assignedOpenTickets || 0} active tickets)
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAssignTicket}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-semibold"
                >
                  Confirm Reassignment
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: AGENTS */}
      {activeTab === 'agents' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Support Agents & Capacity</h2>
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Invite New Agent</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agents.map(ag => (
              <div key={ag.agentId} className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm">{ag.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    ag.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {ag.status}
                  </span>
                </div>
                <div className="text-slate-400">Email: <span className="text-slate-200">{ag.email}</span></div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-700 text-slate-300">
                  <span>Assigned Tickets: <strong className="text-white">{ag.assignedOpenTickets || 0}</strong></span>
                  <span>Resolved This Month: <strong className="text-teal-400">{ag.resolvedTicketsThisMonth || 0}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ESCALATIONS */}
      {activeTab === 'escalations' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Inter-Department Escalation Cases</h2>
          <div className="space-y-3">
            {escalations.map(esc => (
              <div key={esc.escalationId} className="p-4 bg-slate-800/40 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-teal-400 font-bold">{esc.escalationId}</span>
                    <span className="text-slate-400">Ticket: {esc.ticketId}</span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">{esc.status}</span>
                  </div>
                  <p className="text-white font-medium">{esc.reason}</p>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[11px]">Target Team:</span>
                  <p className="text-teal-300 font-semibold">{esc.targetTeam}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: KNOWLEDGE BASE */}
      {activeTab === 'knowledge' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">AI Support Knowledge Articles</h2>
            <button
              onClick={() => setShowArticleModal(true)}
              className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-medium flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Article Draft</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {articles.map(art => (
              <div key={art.articleId} className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm">{art.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    art.status === 'PUBLISHED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {art.status}
                  </span>
                </div>
                <div className="text-slate-400">Category: <span className="text-slate-200">{art.category}</span></div>
                <p className="text-slate-300 leading-relaxed bg-slate-800/40 p-3 rounded-lg border border-slate-800">{art.content}</p>
                {art.status === 'DRAFT' && (
                  <button
                    onClick={() => handlePublishArticle(art.articleId)}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium"
                  >
                    Approve & Publish to AI
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: AI QUALITY REVIEW */}
      {activeTab === 'ai-support' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">AI Support Quality & Grounding Audit</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800">
                <span className="text-slate-400">Total Drafts Generated</span>
                <p className="text-2xl font-bold text-white mt-1">{aiQuality?.totalDraftsGenerated || 460}</p>
              </div>
              <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800">
                <span className="text-slate-400">Accepted Without Edits</span>
                <p className="text-2xl font-bold text-emerald-400 mt-1">{aiQuality?.draftsApprovedUnmodified || 345}</p>
              </div>
              <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800">
                <span className="text-slate-400">Edited by Agent</span>
                <p className="text-2xl font-bold text-amber-400 mt-1">{aiQuality?.draftsEditedByAgent || 95}</p>
              </div>
              <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800">
                <span className="text-slate-400">Knowledge Accuracy</span>
                <p className="text-2xl font-bold text-teal-400 mt-1">{aiQuality?.knowledgeReferenceAccuracy || 98.2}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: METRICS */}
      {activeTab === 'metrics' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-bold text-white">SLA Compliance & CSAT Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800">
              <span className="text-slate-400">Tickets Resolved</span>
              <p className="text-2xl font-bold text-white mt-1">1,100 / 1,250</p>
              <span className="text-emerald-400 font-medium">88% completion rate</span>
            </div>
            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800">
              <span className="text-slate-400">SLA Breaches</span>
              <p className="text-2xl font-bold text-red-400 mt-1">22 cases</p>
              <span className="text-slate-400">1.76% breach rate</span>
            </div>
            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800">
              <span className="text-slate-400">AI-Assisted Resolution</span>
              <p className="text-2xl font-bold text-teal-400 mt-1">460 tickets</p>
              <span className="text-teal-400 font-medium">36.8% of total volume</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Authorized Audit Trail</h2>
          <div className="space-y-2">
            {auditEvents.map(evt => (
              <div key={evt.eventId} className="p-3 bg-slate-800/30 rounded-xl border border-slate-800/60 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-teal-300">{evt.eventType}</span>
                  <span className="text-slate-400 ml-2">by {evt.actorRole}</span>
                  <p className="text-slate-300 mt-0.5">{evt.details}</p>
                </div>
                <span className="text-slate-500 font-mono text-[10px]">{evt.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: INVITE AGENT */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Onboard Support Agent</h3>
            <form onSubmit={handleInviteAgent} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Agent Full Name</label>
                <input
                  type="text"
                  required
                  value={newAgent.name}
                  onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newAgent.email}
                  onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setShowInviteModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-semibold">Send Invite</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE ARTICLE */}
      {showArticleModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">New Knowledge Base Article</h3>
            <form onSubmit={handleCreateArticle} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Article Title</label>
                <input
                  type="text"
                  required
                  value={newArticle.title}
                  onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Category</label>
                <select
                  value={newArticle.category}
                  onChange={(e) => setNewArticle({ ...newArticle, category: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="ORDER_TRACKING">Order Tracking</option>
                  <option value="RETURNS_REFUNDS">Returns & Refunds</option>
                  <option value="PAYMENT_QUERIES">Payment & Billing</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Knowledge Content</label>
                <textarea
                  required
                  rows={4}
                  value={newArticle.content}
                  onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setShowArticleModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-semibold">Save Draft</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
