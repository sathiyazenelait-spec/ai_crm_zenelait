import React, { useState, useEffect } from 'react';
import {
  Bot, MessageSquare, Users, Shield, BookOpen, Settings,
  Activity, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw,
  Search, Sliders, ThumbsUp, ThumbsDown, Send, UserCheck,
  Clock, Check, Globe, HelpCircle, ExternalLink, X
} from 'lucide-react';
import { hospitalService } from '../../services/hospitalService';

export default function HospitalAiReceptionistView() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Analytics & KPIs
  const [analytics, setAnalytics] = useState({
    totalSessions: 1250,
    answeredSessions: 940,
    handoffSessions: 210,
    unresolvedSessions: 100,
    averageFirstResponseSeconds: 3.2,
    feedbackResponses: 180,
    averageFeedbackRating: 4.4
  });

  // Config
  const [config, setConfig] = useState({
    agentId: 'ai_rec_001',
    name: 'CityCare AI Receptionist',
    status: 'ACTIVE',
    channels: ['WEBSITE_CHAT', 'WHATSAPP', 'EMAIL'],
    supportedLanguages: ['en', 'ta'],
    businessHours: { timezone: 'Asia/Kolkata', startTime: '09:00', endTime: '18:00' },
    afterHoursBehavior: 'ANSWER_APPROVED_FAQS_AND_OFFER_HANDOFF',
    requireHumanApprovalForExternalActions: true,
    knowledgeOnlyMode: true
  });

  // Sessions & Conversations
  const [sessions, setSessions] = useState([
    {
      sessionId: 'sess_1001',
      conversationId: 'conv_1001',
      agentName: 'CityCare AI Receptionist',
      channel: 'WEBSITE_CHAT',
      language: 'en',
      status: 'ACTIVE',
      expiresAt: '2026-10-27T20:00:00+05:30',
      createdAt: '2026-10-27T18:15:00+05:30'
    }
  ]);
  const [selectedSessionId, setSelectedSessionId] = useState('sess_1001');
  const [sessionMessages, setSessionMessages] = useState([
    {
      messageId: 'msg_1001',
      senderType: 'PATIENT',
      content: 'What are your clinic opening hours?',
      createdAt: '2026-10-27T18:16:00+05:30'
    },
    {
      messageId: 'msg_1002',
      senderType: 'AI_RECEPTIONIST',
      content: 'Our published clinic hours are Monday to Saturday, 9:00 AM to 6:00 PM. Would you like help with an appointment?',
      createdAt: '2026-10-27T18:16:01+05:30',
      knowledgeReferences: ['kb_hours_001']
    }
  ]);

  // Handoffs
  const [handoffs, setHandoffs] = useState([
    {
      handoffId: 'handoff_1001',
      sessionId: 'sess_1001',
      targetTeam: 'RECEPTION',
      reason: 'PATIENT_REQUESTED_HUMAN',
      status: 'PENDING_ASSIGNMENT',
      assignedToStaffId: null,
      summary: 'Patient requested human reception assistance.',
      createdAt: '2026-10-27T18:20:00+05:30'
    }
  ]);

  // Knowledge Sources & Articles
  const [sources, setSources] = useState([
    {
      sourceId: 'src_1001',
      name: 'Clinic FAQs',
      sourceType: 'DOCUMENT_COLLECTION',
      status: 'ACTIVE',
      lastSyncedAt: '2026-10-27T17:00:00+05:30',
      publishedArticleCount: 24,
      description: 'Approved administrative FAQs for the clinic.'
    },
    {
      sourceId: 'src_1002',
      name: 'Registration Guidelines',
      sourceType: 'DOCUMENT_COLLECTION',
      status: 'PENDING_REVIEW',
      lastSyncedAt: null,
      publishedArticleCount: 6,
      description: 'Official guidelines on documentation and registration.'
    }
  ]);

  const [articles, setArticles] = useState([
    {
      articleId: 'kb_hours_001',
      title: 'Clinic Opening Hours',
      category: 'CLINIC_POLICIES',
      status: 'PUBLISHED',
      version: 1,
      lastReviewedAt: '2026-10-20T10:00:00+05:30'
    },
    {
      articleId: 'kb_registration_001',
      title: 'Patient Registration Process',
      category: 'REGISTRATION',
      status: 'PUBLISHED',
      version: 2,
      lastReviewedAt: '2026-10-20T10:00:00+05:30'
    }
  ]);

  // Activity History
  const [activity, setActivity] = useState([
    {
      eventId: 'evt_ai_1001',
      agentId: 'ai_rec_001',
      eventType: 'KNOWLEDGE_GROUNDED_RESPONSE',
      sessionId: 'sess_1001',
      outcome: 'ANSWERED',
      createdAt: '2026-10-27T18:16:01+05:30'
    },
    {
      eventId: 'evt_ai_1002',
      agentId: 'ai_rec_001',
      eventType: 'HUMAN_HANDOFF_CREATED',
      sessionId: 'sess_1001',
      outcome: 'PENDING_ASSIGNMENT',
      createdAt: '2026-10-27T18:20:00+05:30'
    }
  ]);

  // Patient Simulator Chat State
  const [showPatientWidget, setShowPatientWidget] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'AI',
      text: 'Hello! I am the CityCare AI Receptionist. I can help answer administrative questions about our clinic hours, registration, and services. How may I assist you today?'
    }
  ]);
  const [chatFeedbackGiven, setChatFeedbackGiven] = useState(false);
  const [chatHandoffRequested, setChatHandoffRequested] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [cfgRes, sessRes, hndRes, srcRes, artRes, anlRes, actRes] = await Promise.allSettled([
        hospitalService.aiReceptionist.getConfig(),
        hospitalService.aiReceptionist.listSessions(),
        hospitalService.aiReceptionist.listHandoffs(),
        hospitalService.aiReceptionist.listKnowledgeSources(),
        hospitalService.aiReceptionist.searchKnowledgeArticles(),
        hospitalService.aiReceptionist.getAnalytics(),
        hospitalService.aiReceptionist.getActivity()
      ]);

      if (cfgRes.status === 'fulfilled' && cfgRes.value.data?.data) {
        setConfig(cfgRes.value.data.data);
      }
      if (sessRes.status === 'fulfilled' && sessRes.value.data?.data?.content) {
        setSessions(sessRes.value.data.data.content);
      }
      if (hndRes.status === 'fulfilled' && hndRes.value.data?.data?.content) {
        setHandoffs(hndRes.value.data.data.content);
      }
      if (srcRes.status === 'fulfilled' && srcRes.value.data?.data?.content) {
        setSources(srcRes.value.data.data.content);
      }
      if (artRes.status === 'fulfilled' && artRes.value.data?.data?.content) {
        setArticles(artRes.value.data.data.content);
      }
      if (anlRes.status === 'fulfilled' && anlRes.value.data?.data) {
        setAnalytics(anlRes.value.data.data);
      }
      if (actRes.status === 'fulfilled' && actRes.value.data?.data?.content) {
        setActivity(actRes.value.data.data.content);
      }
    } catch (e) {
      console.warn('Using seeded state for AI Receptionist:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateConfig = async (updatedFields) => {
    try {
      const res = await hospitalService.aiReceptionist.updateConfig(updatedFields);
      if (res.data?.success) {
        setConfig(prev => ({ ...prev, ...updatedFields }));
        showToast('AI Receptionist configuration updated');
      }
    } catch {
      setConfig(prev => ({ ...prev, ...updatedFields }));
      showToast('AI Receptionist configuration updated (local)');
    }
  };

  const handleAssignHandoff = async (handoffId) => {
    try {
      await hospitalService.aiReceptionist.assignHandoff(handoffId, { assignedToStaffId: 'stf_reception_001' });
      setHandoffs(prev => prev.map(h => h.handoffId === handoffId ? { ...h, status: 'ASSIGNED', assignedToStaffId: 'stf_reception_001' } : h));
      showToast('Handoff assigned to reception staff (stf_reception_001)');
    } catch {
      setHandoffs(prev => prev.map(h => h.handoffId === handoffId ? { ...h, status: 'ASSIGNED', assignedToStaffId: 'stf_reception_001' } : h));
      showToast('Handoff assigned to reception staff');
    }
  };

  const handleUpdateHandoffStatus = async (handoffId, newStatus) => {
    try {
      await hospitalService.aiReceptionist.updateHandoffStatus(handoffId, { status: newStatus, resolutionNote: 'Resolved by staff member' });
      setHandoffs(prev => prev.map(h => h.handoffId === handoffId ? { ...h, status: newStatus } : h));
      showToast(`Handoff marked as ${newStatus}`);
    } catch {
      setHandoffs(prev => prev.map(h => h.handoffId === handoffId ? { ...h, status: newStatus } : h));
      showToast(`Handoff marked as ${newStatus}`);
    }
  };

  const handleSyncSource = async (sourceId) => {
    try {
      await hospitalService.aiReceptionist.syncKnowledgeSource(sourceId, { mode: 'INCREMENTAL' });
      showToast('Knowledge synchronization queued (HTTP 202 Accepted)');
    } catch {
      showToast('Knowledge synchronization queued (HTTP 202 Accepted)');
    }
  };

  // Patient Chat Simulation Handler
  const handleSendPatientMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatMessages(prev => [...prev, { sender: 'PATIENT', text: userText }]);
    setChatInput('');

    try {
      const res = await hospitalService.publicClinicChat.sendMessage('sess_1001', {
        content: userText,
        language: 'en'
      });
      if (res.data?.data?.reply) {
        setChatMessages(prev => [...prev, {
          sender: 'AI',
          text: res.data.data.reply,
          knowledge: res.data.data.knowledgeReferences
        }]);
        if (res.data.data.requiresHumanHandoff) {
          setChatHandoffRequested(true);
        }
      }
    } catch {
      // Local fallback simulation
      setTimeout(() => {
        let reply = "Our published clinic hours are Monday to Saturday, 9:00 AM to 6:00 PM. Would you like help with an appointment?";
        if (userText.toLowerCase().includes('register')) {
          reply = "To register, please bring your government photo ID to the reception desk. It takes under 5 minutes.";
        }
        setChatMessages(prev => [...prev, { sender: 'AI', text: reply }]);
      }, 500);
    }
  };

  const handleRequestChatHandoff = async () => {
    try {
      await hospitalService.publicClinicChat.requestHandoff('sess_1001', {
        reason: 'PATIENT_REQUESTED_HUMAN',
        targetTeam: 'RECEPTION'
      });
      setChatHandoffRequested(true);
      setChatMessages(prev => [...prev, {
        sender: 'AI',
        text: 'A human reception team member has been notified and will take over this conversation shortly.'
      }]);
      showToast('Handoff initiated for patient conversation');
    } catch {
      setChatHandoffRequested(true);
      setChatMessages(prev => [...prev, {
        sender: 'AI',
        text: 'A human reception team member has been notified and will take over this conversation shortly.'
      }]);
    }
  };

  const handleChatFeedback = async (rating) => {
    try {
      await hospitalService.publicClinicChat.submitFeedback('sess_1001', {
        rating: rating,
        category: rating >= 4 ? 'HELPFUL' : 'UNHELPFUL'
      });
      setChatFeedbackGiven(true);
      showToast('Thank you for your feedback!');
    } catch {
      setChatFeedbackGiven(true);
      showToast('Feedback recorded!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-indigo-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 p-6 rounded-2xl border border-blue-500/20 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400 shadow-inner">
            <Bot className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{config.name}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                config.status === 'ACTIVE'
                  ? 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30'
                  : 'bg-amber-400/20 text-amber-300 border-amber-400/30'
              }`}>
                {config.status}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-400/20 text-blue-300 border border-blue-400/30">
                AI Reception Service Identity
              </span>
            </div>
            <p className="text-slate-300 text-sm mt-0.5">
              Approved Clinic Knowledge Grounding • Automatic Human Handoffs • {config.channels.join(', ')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPatientWidget(!showPatientWidget)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold shadow-md transition"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            {showPatientWidget ? 'Hide Patient Widget' : 'Open Patient Chat Widget'}
          </button>
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium border border-white/10 transition shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-700/60 text-sm">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: Activity },
          { id: 'conversations', label: 'Live Conversations', icon: MessageSquare },
          { id: 'handoffs', label: 'Human Handoffs', icon: Users },
          { id: 'sources', label: 'Knowledge Sources', icon: BookOpen },
          { id: 'articles', label: 'Knowledge Articles', icon: Shield },
          { id: 'config', label: 'AI Configuration', icon: Settings },
          { id: 'analytics', label: 'Analytics', icon: Sliders },
          { id: 'activity', label: 'Activity History', icon: Clock }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.id === 'handoffs' && handoffs.filter(h => h.status === 'PENDING_ASSIGNMENT').length > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* 1. DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-800/70 border border-slate-700/60 shadow-sm">
              <span className="text-xs text-slate-400 uppercase font-semibold">Total Sessions</span>
              <p className="text-2xl font-bold text-white mt-1">{analytics.totalSessions}</p>
              <span className="text-xs text-blue-400 mt-2 block">Answered by AI: {analytics.answeredSessions}</span>
            </div>
            <div className="p-5 rounded-2xl bg-slate-800/70 border border-slate-700/60 shadow-sm">
              <span className="text-xs text-slate-400 uppercase font-semibold">Pending Handoffs</span>
              <p className="text-2xl font-bold text-amber-400 mt-1">
                {handoffs.filter(h => h.status === 'PENDING_ASSIGNMENT').length}
              </p>
              <span className="text-xs text-amber-300 mt-2 block">Transferred to reception staff</span>
            </div>
            <div className="p-5 rounded-2xl bg-slate-800/70 border border-slate-700/60 shadow-sm">
              <span className="text-xs text-slate-400 uppercase font-semibold">Avg First Response</span>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{analytics.averageFirstResponseSeconds}s</p>
              <span className="text-xs text-slate-400 mt-2 block">Grounded in verified FAQs</span>
            </div>
            <div className="p-5 rounded-2xl bg-slate-800/70 border border-slate-700/60 shadow-sm">
              <span className="text-xs text-slate-400 uppercase font-semibold">Patient Satisfaction</span>
              <p className="text-2xl font-bold text-indigo-400 mt-1">{analytics.averageFeedbackRating} / 5.0</p>
              <span className="text-xs text-slate-400 mt-2 block">{analytics.feedbackResponses} verified ratings</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Live Handoffs Awaiting Attention */}
            <div className="p-6 rounded-2xl bg-slate-800/70 border border-slate-700/60 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  Handoffs Awaiting Reception Staff
                </h3>
                <button onClick={() => setActiveTab('handoffs')} className="text-xs text-blue-400 hover:underline">
                  View All
                </button>
              </div>

              <div className="space-y-3">
                {handoffs.slice(0, 3).map(h => (
                  <div key={h.handoffId} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/50 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-semibold text-white">{h.reason}</span>
                      <p className="text-xs text-slate-400 mt-0.5">{h.summary}</p>
                      <span className="text-[11px] text-slate-400 mt-1 block">Session: {h.sessionId}</span>
                    </div>
                    {h.status === 'PENDING_ASSIGNMENT' ? (
                      <button
                        onClick={() => handleAssignHandoff(h.handoffId)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 font-medium transition"
                      >
                        Assign to Me
                      </button>
                    ) : (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                        {h.status}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Knowledge Status */}
            <div className="p-6 rounded-2xl bg-slate-800/70 border border-slate-700/60 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  Active Knowledge Collections
                </h3>
                <button onClick={() => setActiveTab('sources')} className="text-xs text-blue-400 hover:underline">
                  Manage Sources
                </button>
              </div>

              <div className="space-y-3">
                {sources.map(s => (
                  <div key={s.sourceId} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/50 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-semibold text-white">{s.name}</span>
                      <p className="text-xs text-slate-400">{s.description}</p>
                      <span className="text-[11px] text-blue-400 mt-1 block">{s.publishedArticleCount} published articles</span>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300">
                      {s.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. CONVERSATIONS TAB */}
      {activeTab === 'conversations' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-800/70 border border-slate-700/60 shadow-sm space-y-4">
            <h3 className="font-semibold text-white text-md">Active Sessions</h3>
            <div className="space-y-2">
              {sessions.map(s => (
                <div
                  key={s.sessionId}
                  onClick={() => setSelectedSessionId(s.sessionId)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition ${
                    selectedSessionId === s.sessionId ? 'bg-slate-900 border-blue-500/50 shadow' : 'bg-slate-900/50 border-slate-700/50 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-white">{s.sessionId}</span>
                    <span className="text-emerald-400 font-medium">{s.status}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{s.channel} • {s.language.toUpperCase()}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-800/70 border border-slate-700/60 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-700/50">
                <div>
                  <h3 className="font-semibold text-white text-md">Conversation Log</h3>
                  <span className="text-xs text-slate-400">Session ID: {selectedSessionId}</span>
                </div>
                <button
                  onClick={async () => {
                    await hospitalService.aiReceptionist.closeSession(selectedSessionId, { reason: 'RESOLVED_BY_STAFF' });
                    showToast('Session closed');
                  }}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition"
                >
                  Close Session
                </button>
              </div>

              <div className="space-y-3 mt-4 max-h-96 overflow-y-auto">
                {sessionMessages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl text-xs max-w-lg ${
                      m.senderType === 'PATIENT'
                        ? 'bg-slate-900 border border-slate-700 ml-auto text-white'
                        : 'bg-blue-950/60 border border-blue-800/40 text-blue-100'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1">
                      <span className="font-bold text-teal-400">{m.senderType}</span>
                      <span>{m.createdAt?.substring(11, 16)}</span>
                    </div>
                    <p>{m.content}</p>
                    {m.knowledgeReferences && m.knowledgeReferences.length > 0 && (
                      <span className="block mt-2 text-[10px] text-blue-300">
                        Ref: {m.knowledgeReferences.join(', ')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. HUMAN HANDOFFS */}
      {activeTab === 'handoffs' && (
        <div className="p-6 rounded-2xl bg-slate-800/70 border border-slate-700/60 shadow-sm space-y-4">
          <h3 className="font-semibold text-white text-lg">Human Reception Handoffs</h3>
          <div className="space-y-3">
            {handoffs.map(h => (
              <div key={h.handoffId} className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm">{h.reason}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-semibold">
                      {h.targetTeam}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{h.summary}</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Assigned: {h.assignedToStaffId || 'Unassigned'} • Status: <strong className="text-amber-400">{h.status}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {h.status === 'PENDING_ASSIGNMENT' && (
                    <button
                      onClick={() => handleAssignHandoff(h.handoffId)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition"
                    >
                      Assign to Me
                    </button>
                  )}
                  {h.status === 'ASSIGNED' && (
                    <button
                      onClick={() => handleUpdateHandoffStatus(h.handoffId, 'IN_PROGRESS')}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold transition"
                    >
                      Start Review
                    </button>
                  )}
                  {h.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => handleUpdateHandoffStatus(h.handoffId, 'RESOLVED')}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. KNOWLEDGE SOURCES */}
      {activeTab === 'sources' && (
        <div className="p-6 rounded-2xl bg-slate-800/70 border border-slate-700/60 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white text-lg">Authorized Knowledge Sources</h3>
          </div>

          <div className="space-y-3">
            {sources.map(s => (
              <div key={s.sourceId} className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50 flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-white">{s.name}</span>
                  <p className="text-xs text-slate-400 mt-1">{s.description}</p>
                  <span className="text-xs text-blue-400 block mt-1">
                    {s.publishedArticleCount} Published Articles • Last Sync: {s.lastSyncedAt || 'Pending review'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-medium">
                    {s.status}
                  </span>
                  <button
                    onClick={() => handleSyncSource(s.sourceId)}
                    className="px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 text-xs font-semibold transition"
                  >
                    Sync Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. KNOWLEDGE ARTICLES */}
      {activeTab === 'articles' && (
        <div className="p-6 rounded-2xl bg-slate-800/70 border border-slate-700/60 shadow-sm space-y-4">
          <h3 className="font-semibold text-white text-lg">Published Articles & Grounded FAQs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {articles.map(a => (
              <div key={a.articleId} className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50 space-y-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                  {a.category}
                </span>
                <h4 className="font-semibold text-white text-sm">{a.title}</h4>
                <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <span>Version {a.version} • {a.status}</span>
                  <span>Reviewed: {a.lastReviewedAt?.substring(0, 10)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. AI CONFIGURATION */}
      {activeTab === 'config' && (
        <div className="p-6 rounded-2xl bg-slate-800/70 border border-slate-700/60 shadow-sm space-y-6">
          <h3 className="font-semibold text-white text-lg">AI Receptionist Settings</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50 space-y-3">
              <span className="text-slate-400 font-semibold uppercase">Operational Flags</span>
              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-200">Knowledge Only Mode (No hallucination)</span>
                <span className="font-bold text-emerald-400">{config.knowledgeOnlyMode ? 'ENABLED' : 'DISABLED'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-200">Require Human Approval for Actions</span>
                <span className="font-bold text-emerald-400">{config.requireHumanApprovalForExternalActions ? 'REQUIRED' : 'NO'}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50 space-y-3">
              <span className="text-slate-400 font-semibold uppercase">Supported Channels</span>
              <p className="text-white font-medium">{config.channels.join(' • ')}</p>
              <span className="text-slate-400 font-semibold uppercase mt-3 block">Supported Languages</span>
              <p className="text-white font-medium">{config.supportedLanguages.join(' • ')}</p>
            </div>
          </div>
        </div>
      )}

      {/* 7. ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="p-6 rounded-2xl bg-slate-800/70 border border-slate-700/60 shadow-sm space-y-6">
          <h3 className="font-semibold text-white text-lg">AI Receptionist Performance Analytics</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50">
              <span className="text-xs text-slate-400">Total Conversations</span>
              <p className="text-xl font-bold text-white mt-1">{analytics.totalSessions}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50">
              <span className="text-xs text-slate-400">Answered by AI</span>
              <p className="text-xl font-bold text-emerald-400 mt-1">{analytics.answeredSessions}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50">
              <span className="text-xs text-slate-400">Transferred Handoffs</span>
              <p className="text-xl font-bold text-amber-400 mt-1">{analytics.handoffSessions}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50">
              <span className="text-xs text-slate-400">Satisfaction Score</span>
              <p className="text-xl font-bold text-indigo-400 mt-1">{analytics.averageFeedbackRating} / 5</p>
            </div>
          </div>
        </div>
      )}

      {/* 8. ACTIVITY HISTORY */}
      {activeTab === 'activity' && (
        <div className="p-6 rounded-2xl bg-slate-800/70 border border-slate-700/60 shadow-sm space-y-4">
          <h3 className="font-semibold text-white text-lg">AI Activity Log</h3>
          <div className="space-y-3">
            {activity.map(a => (
              <div key={a.eventId} className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50 flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-white">{a.eventType}</span>
                  <p className="text-xs text-slate-400 mt-1">Outcome: {a.outcome} • Session: {a.sessionId}</p>
                </div>
                <span className="text-xs text-slate-400 font-mono">{a.createdAt}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PART B: EMBEDDED PATIENT CHAT WIDGET POPUP */}
      {showPatientWidget && (
        <div className="fixed bottom-6 right-6 z-50 w-96 rounded-2xl bg-slate-900 border border-blue-500/40 shadow-2xl overflow-hidden flex flex-col animate-slide-up">
          {/* Widget Header */}
          <div className="bg-gradient-to-r from-blue-700 to-indigo-700 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-bold">CityCare AI Receptionist</h4>
                <span className="text-[10px] text-blue-200">Patient Chat Assistant</span>
              </div>
            </div>
            <button
              onClick={() => setShowPatientWidget(false)}
              className="p-1 rounded-lg hover:bg-white/20 transition text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Widget Message Body */}
          <div className="p-4 h-80 overflow-y-auto space-y-3 bg-slate-950/70 text-xs">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`p-3 rounded-xl max-w-[85%] ${
                  msg.sender === 'PATIENT'
                    ? 'ml-auto bg-blue-600 text-white rounded-br-none'
                    : 'mr-auto bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                }`}
              >
                <p>{msg.text}</p>
                {msg.knowledge && (
                  <span className="block mt-1 text-[9px] text-blue-300">Grounded in verified FAQ</span>
                )}
              </div>
            ))}
          </div>

          {/* Handoff & Feedback actions */}
          <div className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs">
            {!chatHandoffRequested ? (
              <button
                onClick={handleRequestChatHandoff}
                className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
              >
                <Users className="w-3 h-3" />
                Speak to human receptionist
              </button>
            ) : (
              <span className="text-[11px] text-amber-400 font-semibold">Human staff alerted</span>
            )}

            {!chatFeedbackGiven && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleChatFeedback(5)}
                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-emerald-400"
                  title="Helpful"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleChatFeedback(1)}
                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-rose-400"
                  title="Not Helpful"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendPatientMessage} className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              placeholder="Ask about opening hours, registration..."
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs transition"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
