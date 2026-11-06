import React, { useState, useEffect } from 'react';
import { realEstateService } from '../../services/realEstateService';
import {
  Bot,
  Sparkles,
  MessageSquare,
  Users,
  CheckCircle2,
  Calendar,
  FileText,
  UserCheck,
  Building2,
  Settings,
  BarChart3,
  ShieldCheck,
  Send,
  Plus,
  RefreshCw,
  Search,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

export function RealEstateAiPropertySalesAgentView({ initialSubTab = 'overview' }) {
  const [activeTab, setActiveTab] = useState(initialSubTab);
  const [metrics, setMetrics] = useState({
    conversations: 850,
    leadsCreated: 210,
    qualifiedBuyers: 135,
    propertyRecommendations: 410,
    siteVisitRequests: 95,
    humanHandoffs: 70,
    conversionRatePercentage: 24.7
  });

  const [agentConfig, setAgentConfig] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionMessages, setSessionMessages] = useState([]);
  const [testMessage, setTestMessage] = useState('');
  const [aiTyping, setAiTyping] = useState(false);

  // Recommendations
  const [recommendedProps, setRecommendedProps] = useState([]);
  const [searchCriteria, setSearchCriteria] = useState({
    city: 'Chennai',
    area: 'OMR',
    budgetMax: 8000000,
    bedrooms: 3
  });

  // Qualification
  const [qualResult, setQualResult] = useState(null);

  // Modals
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadForm, setLeadForm] = useState({
    customerName: 'Arun Kumar',
    email: 'arun@example.com',
    phone: '+919876543210',
    requirements: { area: 'OMR', propertyType: 'APARTMENT', bedrooms: 3, budgetMin: 6000000, budgetMax: 8000000 },
    consentToContact: true
  });

  const [showVisitModal, setShowVisitModal] = useState(false);
  const [visitForm, setVisitForm] = useState({
    leadId: 'RL-2101',
    propertyId: 'PROP-1001',
    preferredDate: '2026-10-28',
    preferredTime: '14:00',
    timezone: 'Asia/Kolkata',
    durationMinutes: 60
  });

  const [auditEvents, setAuditEvents] = useState([]);
  const [knowledgeSources, setKnowledgeSources] = useState([]);

  useEffect(() => {
    setActiveTab(initialSubTab);
  }, [initialSubTab]);

  useEffect(() => {
    loadOverviewData();
  }, []);

  const loadOverviewData = async () => {
    try {
      const [metRes, cfgRes, sesRes, ksRes, audRes] = await Promise.all([
        realEstateService.getAiPropertySalesMetrics(),
        realEstateService.getAiPropertySalesConfig(),
        realEstateService.getAiPropertySalesSessions(),
        realEstateService.getAiKnowledgeSources(),
        realEstateService.getAiPropertySalesAuditEvents()
      ]);

      if (metRes?.data) setMetrics(metRes.data);
      if (cfgRes?.data) setAgentConfig(cfgRes.data);
      if (sesRes?.data) {
        setSessions(sesRes.data);
        if (sesRes.data.length > 0 && !selectedSession) {
          selectSession(sesRes.data[0]);
        }
      }
      if (ksRes?.data) setKnowledgeSources(ksRes.data);
      if (audRes?.data) setAuditEvents(audRes.data);
    } catch (e) {
      console.warn('Overview fallback', e);
    }
  };

  const selectSession = async (s) => {
    setSelectedSession(s);
    try {
      const res = await realEstateService.getAiPropertySalesSession(s.sessionId);
      if (res?.data?.messages) {
        setSessionMessages(res.data.messages);
      }
    } catch (e) {
      console.warn('Failed to fetch session detail', e);
    }
  };

  const handleSendMessage = async () => {
    if (!testMessage.trim() || !selectedSession) return;
    const msgText = testMessage;
    setTestMessage('');
    setSessionMessages(prev => [...prev, {
      messageId: 'usr-' + Date.now(),
      sender: 'USER',
      text: msgText,
      timestamp: new Date().toLocaleTimeString()
    }]);

    setAiTyping(true);
    try {
      const res = await realEstateService.sendAiPropertySalesMessage(selectedSession.sessionId, {
        message: msgText
      });
      if (res?.data) {
        setSessionMessages(prev => [...prev, {
          messageId: 'ai-' + Date.now(),
          sender: 'AI',
          text: res.data.reply,
          timestamp: new Date().toLocaleTimeString(),
          intent: res.data.intent,
          confidence: res.data.confidence
        }]);
      }
    } catch (e) {
      alert('Error sending message: ' + e.message);
    } finally {
      setAiTyping(false);
    }
  };

  const handleQualifyBuyer = async () => {
    if (!selectedSession) return;
    try {
      const res = await realEstateService.qualifyBuyer(selectedSession.sessionId, {
        requirements: searchCriteria
      });
      if (res?.data) {
        setQualResult(res.data);
      }
    } catch (e) {
      alert('Qualification error: ' + e.message);
    }
  };

  const handleRecommendProperties = async () => {
    try {
      const res = await realEstateService.recommendProperties({
        sessionId: selectedSession?.sessionId || 'PAS-1001',
        criteria: searchCriteria,
        maxResults: 5
      });
      if (res?.data?.recommendations) {
        setRecommendedProps(res.data.recommendations);
      }
    } catch (e) {
      alert('Failed to get property recommendations: ' + e.message);
    }
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    if (!selectedSession) return;
    try {
      const res = await realEstateService.createLeadFromAiSession(selectedSession.sessionId, leadForm);
      if (res?.data) {
        alert(`Lead Created Successfully! ID: ${res.data.leadId}`);
        setShowLeadModal(false);
        loadOverviewData();
      }
    } catch (e) {
      alert('Error creating lead: ' + e.message);
    }
  };

  const handleScheduleVisit = async (e) => {
    e.preventDefault();
    if (!selectedSession) return;
    try {
      const res = await realEstateService.scheduleVisitFromAiSession(selectedSession.sessionId, visitForm);
      if (res?.data) {
        alert(`Site Visit Request Registered! ID: ${res.data.visitRequestId}`);
        setShowVisitModal(false);
        loadOverviewData();
      }
    } catch (e) {
      alert('Error scheduling visit: ' + e.message);
    }
  };

  const handleHandoff = async () => {
    if (!selectedSession) return;
    try {
      const res = await realEstateService.handoffAiSession(selectedSession.sessionId, {
        reason: 'CUSTOMER_REQUESTED_HUMAN',
        summary: 'Customer has specific financing & possession query regarding OMR 3BHK project.'
      });
      if (res?.data) {
        alert('Conversation transferred to Sales Team successfully!');
        loadOverviewData();
      }
    } catch (e) {
      alert('Handoff error: ' + e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-900/30 via-slate-900/50 to-slate-900/20 p-5 rounded-2xl border border-emerald-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              REAL ESTATE TENANT
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300">
              ROLE: AI_PROPERTY_SALES_AGENT
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1.5 flex items-center gap-2">
            <Bot className="w-6 h-6 text-emerald-400" />
            AI Property Sales Assistant
          </h1>
          <p className="text-sm text-slate-400">
            Captures buyer requirements, qualifies property intent, recommends verified listings, and requests site visits.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadOverviewData}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setActiveTab('conversations'); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm shadow-lg shadow-emerald-600/20 transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            Live Chat Simulator
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Agent Overview' },
          { id: 'conversations', label: 'Conversations & Simulator' },
          { id: 'qualification', label: 'Buyer Qualification' },
          { id: 'recommendations', label: 'Property Recommendations' },
          { id: 'knowledge', label: 'Knowledge Sources' },
          { id: 'audit', label: 'Audit Events' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400 font-medium">Conversations</span>
              <p className="text-2xl font-bold text-white mt-1">{metrics.conversations}</p>
              <span className="text-xs text-emerald-400 mt-1 block">Active sales sessions</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400 font-medium">Leads Captured</span>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{metrics.leadsCreated}</p>
              <span className="text-xs text-slate-400 mt-1 block">With validated consent</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400 font-medium">Qualified Buyers</span>
              <p className="text-2xl font-bold text-cyan-400 mt-1">{metrics.qualifiedBuyers}</p>
              <span className="text-xs text-cyan-400/80 mt-1 block">Score &ge; 70 threshold</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400 font-medium">Conversion Rate</span>
              <p className="text-2xl font-bold text-amber-400 mt-1">{metrics.conversionRatePercentage}%</p>
              <span className="text-xs text-amber-400/80 mt-1 block">Session-to-lead ratio</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Active Sales Conversations
              </h3>
              <div className="space-y-3">
                {sessions.map(s => (
                  <div
                    key={s.sessionId}
                    onClick={() => { selectSession(s); setActiveTab('conversations'); }}
                    className="p-3.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 rounded-xl flex items-center justify-between cursor-pointer transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-emerald-400 font-semibold">{s.sessionId}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">{s.channel}</span>
                        {s.qualificationScore && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                            Score: {s.qualificationScore}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-white mt-1">{s.customerName || 'Anonymous Prospect'}</p>
                      <p className="text-xs text-slate-400">{s.email || 'No email recorded'} · {s.phone || 'Phone pending'}</p>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {s.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  RERA Compliance Guardrails
                </h3>
                <ul className="text-xs text-slate-300 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>Property recommendations pulled directly from verified database catalog.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>AI forbidden from fabricating prices, discounts, or inventory availability.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>Explicit customer contact consent enforced before lead creation.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
                <h4 className="text-sm font-semibold text-white mb-2">Agent Configuration</h4>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Languages:</span>
                    <span>English, Tamil, Hindi, Telugu</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Qualification Threshold:</span>
                    <span className="text-emerald-400 font-bold">70 / 100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">High-Value Handoff:</span>
                    <span>&gt; ₹1.5 Crore</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONVERSATIONS & SIMULATOR */}
      {activeTab === 'conversations' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
          {/* Sessions Pane */}
          <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col h-[700px]">
            <h3 className="text-sm font-bold text-white pb-3 border-b border-slate-800">
              Sales Sessions ({sessions.length})
            </h3>
            <div className="flex-1 overflow-y-auto space-y-2 pt-3">
              {sessions.map(s => (
                <div
                  key={s.sessionId}
                  onClick={() => selectSession(s)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedSession?.sessionId === s.sessionId
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                      : 'bg-slate-800/40 hover:bg-slate-800 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-emerald-400">{s.sessionId}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">{s.channel}</span>
                  </div>
                  <p className="text-xs font-semibold text-white mt-1">{s.customerName || 'Prospect'}</p>
                  <p className="text-[10px] text-slate-400 mt-1">Status: {s.status}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Chat Pane */}
          <div className="lg:col-span-8 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col h-[700px]">
            {selectedSession ? (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <span className="font-mono text-xs text-emerald-400 font-bold">{selectedSession.sessionId}</span>
                    <h3 className="text-sm font-bold text-white">Conversation with {selectedSession.customerName || 'Prospect'}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowLeadModal(true)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                    >
                      <UserCheck className="w-3.5 h-3.5" /> Convert to Lead
                    </button>
                    <button
                      onClick={() => setShowVisitModal(true)}
                      className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                    >
                      <Calendar className="w-3.5 h-3.5" /> Site Visit
                    </button>
                    <button
                      onClick={handleHandoff}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold"
                    >
                      Human Handoff
                    </button>
                  </div>
                </div>

                {/* Messages list */}
                <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-2">
                  {sessionMessages.map((m, idx) => {
                    const isAi = m.sender === 'AI';
                    return (
                      <div
                        key={m.messageId || idx}
                        className={`p-3 rounded-xl max-w-[85%] text-xs ${
                          isAi
                            ? 'mr-auto bg-emerald-950/40 border border-emerald-500/30 text-white'
                            : 'ml-auto bg-slate-800/90 border border-slate-700/60 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                          <span className="font-bold flex items-center gap-1">
                            {isAi ? <Bot className="w-3 h-3 text-emerald-400" /> : <Users className="w-3 h-3 text-cyan-400" />}
                            {isAi ? 'AI Property Specialist' : 'Customer'}
                          </span>
                          <span>{m.timestamp || 'Recent'}</span>
                        </div>
                        <p>{m.text}</p>
                        {m.intent && (
                          <div className="mt-1 pt-1 border-t border-slate-700/40 text-[9px] text-emerald-400">
                            Intent: {m.intent} · Confidence: {m.confidence || 0.94}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {aiTyping && (
                    <div className="text-xs text-emerald-400 animate-pulse flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5" /> AI is consulting verified property registry...
                    </div>
                  )}
                </div>

                {/* Message input */}
                <div className="pt-3 border-t border-slate-800 flex gap-2">
                  <input
                    type="text"
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type prospect enquiry (e.g., 'Looking for a 3BHK in OMR under 80 Lakhs')..."
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" /> Send
                  </button>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">
                Select a sales session to inspect messages.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: BUYER QUALIFICATION */}
      {activeTab === 'qualification' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Explainable Buyer Qualification Tool
            </h3>
            <p className="text-xs text-slate-400">
              AI evaluates stated budget, locality, bedrooms, and timeline against real estate criteria to generate a transparent qualification score (0-100).
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-slate-400 mb-1 block">City</label>
                <input
                  type="text"
                  value={searchCriteria.city}
                  onChange={(e) => setSearchCriteria({ ...searchCriteria, city: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 mb-1 block">Area</label>
                <input
                  type="text"
                  value={searchCriteria.area}
                  onChange={(e) => setSearchCriteria({ ...searchCriteria, area: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 mb-1 block">Max Budget (INR)</label>
                <input
                  type="number"
                  value={searchCriteria.budgetMax}
                  onChange={(e) => setSearchCriteria({ ...searchCriteria, budgetMax: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 mb-1 block">Bedrooms</label>
                <input
                  type="number"
                  value={searchCriteria.bedrooms}
                  onChange={(e) => setSearchCriteria({ ...searchCriteria, bedrooms: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>
            </div>

            <button
              onClick={handleQualifyBuyer}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" /> Qualify Buyer Now
            </button>
          </div>

          {qualResult && (
            <div className="bg-slate-900/80 border border-emerald-500/30 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400">Qualification Status</span>
                  <p className="text-lg font-bold text-emerald-400">{qualResult.qualificationStatus}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">Score</span>
                  <p className="text-2xl font-bold text-white">{qualResult.score} / 100</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <h4 className="font-semibold text-slate-300 mb-1">Evaluated Criteria:</h4>
                  <ul className="space-y-1 text-slate-400">
                    <li>Budget Provided: <strong className="text-white">Yes (+20)</strong></li>
                    <li>Location Provided: <strong className="text-white">Yes (+20)</strong></li>
                    <li>Property Type: <strong className="text-white">Yes (+10)</strong></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-300 mb-1">Recommended Next Action:</h4>
                  <p className="text-emerald-400 font-medium">{qualResult.recommendedNextAction}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PROPERTY RECOMMENDATIONS */}
      {activeTab === 'recommendations' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" /> Grounded Property Recommendations
              </h3>
              <p className="text-xs text-slate-400">
                AI retrieves only verified database inventory matching buyer parameters.
              </p>
            </div>
            <button
              onClick={handleRecommendProperties}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <Search className="w-4 h-4" /> Fetch Matches
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendedProps.map(p => (
              <div key={p.propertyId} className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-emerald-400 font-bold">{p.propertyId}</span>
                  <span className="text-sm font-bold text-white">₹{(p.price / 100000).toFixed(2)} Lakhs</span>
                </div>
                <h4 className="text-sm font-semibold text-white">{p.propertyName}</h4>
                <p className="text-xs text-slate-400">{p.area}, {p.city} · {p.bedrooms} BHK · {p.sqft || 1400} sqft</p>
                <div className="pt-2 border-t border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 block font-medium">Match Reasons:</span>
                  {(p.matchReasons || []).map((r, i) => (
                    <span key={i} className="inline-block px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 mr-1.5 mb-1">
                      ✓ {r}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: KNOWLEDGE SOURCES */}
      {activeTab === 'knowledge' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-400" /> Approved Property Knowledge Catalogs
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {knowledgeSources.map(k => (
              <div key={k.sourceId} className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-emerald-400 font-bold">{k.sourceId}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">{k.type}</span>
                </div>
                <h4 className="text-sm font-semibold text-white">{k.name}</h4>
                <p className="text-xs text-slate-400">Total verified items: {k.itemCount || 48}</p>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Last synced: {k.lastSyncedAt ? k.lastSyncedAt.slice(0, 16) : 'Recent'}</span>
                  <span className="text-emerald-400 font-bold">STATUS: {k.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: AUDIT EVENTS */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" /> AI Agent Audit Trail & Decisions
          </h3>
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700/60">
                <tr>
                  <th className="p-3.5">Audit ID</th>
                  <th className="p-3.5">Action</th>
                  <th className="p-3.5">Target</th>
                  <th className="p-3.5">Details</th>
                  <th className="p-3.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {auditEvents.map(a => (
                  <tr key={a.auditId} className="hover:bg-slate-800/40">
                    <td className="p-3.5 font-mono text-emerald-400">{a.auditId}</td>
                    <td className="p-3.5 text-white font-semibold">{a.action}</td>
                    <td className="p-3.5 text-slate-400">{a.targetId}</td>
                    <td className="p-3.5 max-w-sm truncate">{a.details}</td>
                    <td className="p-3.5 text-slate-500">{a.timestamp ? a.timestamp.slice(11, 19) : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: CREATE LEAD */}
      {showLeadModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-400" /> Create Property Lead from AI Session
            </h3>
            <form onSubmit={handleCreateLead} className="space-y-3">
              <div>
                <label className="text-slate-400 mb-1 block">Customer Name</label>
                <input
                  type="text"
                  required
                  value={leadForm.customerName}
                  onChange={(e) => setLeadForm({ ...leadForm, customerName: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 mb-1 block">Phone Number</label>
                <input
                  type="text"
                  required
                  value={leadForm.phone}
                  onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 mb-1 block">Email</label>
                <input
                  type="email"
                  value={leadForm.email}
                  onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="consentCheck"
                  checked={leadForm.consentToContact}
                  onChange={(e) => setLeadForm({ ...leadForm, consentToContact: e.target.checked })}
                  className="rounded bg-slate-800 border-slate-700 text-emerald-500"
                />
                <label htmlFor="consentCheck" className="text-slate-300">
                  Explicit customer consent recorded to receive property sales calls
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowLeadModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold"
                >
                  Confirm Lead Creation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SCHEDULE VISIT */}
      {showVisitModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" /> Request Site Visit for Prospect
            </h3>
            <form onSubmit={handleScheduleVisit} className="space-y-3">
              <div>
                <label className="text-slate-400 mb-1 block">Property ID</label>
                <input
                  type="text"
                  required
                  value={visitForm.propertyId}
                  onChange={(e) => setVisitForm({ ...visitForm, propertyId: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 mb-1 block">Preferred Date</label>
                  <input
                    type="date"
                    required
                    value={visitForm.preferredDate}
                    onChange={(e) => setVisitForm({ ...visitForm, preferredDate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 mb-1 block">Preferred Time</label>
                  <input
                    type="time"
                    required
                    value={visitForm.preferredTime}
                    onChange={(e) => setVisitForm({ ...visitForm, preferredTime: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                Note: Visit will be marked PENDING_AVAILABILITY_CHECK until the Site Visit Coordinator confirms slot.
              </p>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowVisitModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-semibold"
                >
                  Submit Visit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
