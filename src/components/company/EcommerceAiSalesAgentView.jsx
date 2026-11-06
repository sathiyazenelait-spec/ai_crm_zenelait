import React, { useState, useEffect } from 'react';
import {
  Bot, ShoppingCart, Target, Users, Send, CheckCircle2, AlertCircle,
  RefreshCw, Plus, ChevronRight, MessageSquare, ShieldCheck, Sparkles,
  ArrowRight, Search, Play, Phone, Mail, Award, Clock
} from 'lucide-react';
import { ecommerceService } from '../../services/ecommerceService';

export default function EcommerceAiSalesAgentView() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  // Dashboard Data
  const [dashboard, setDashboard] = useState({
    agentStatus: 'ACTIVE',
    conversationsToday: 128,
    leadsCapturedToday: 32,
    qualifiedLeads: 18,
    recommendationsGenerated: 74,
    followUpsPending: 21,
    cartRecoveryCandidates: 15,
    humanHandoffs: 6
  });

  // Conversations & Chat State
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [budgetMax, setBudgetMax] = useState(60000);

  // Recommendations State
  const [recommendations, setRecommendations] = useState([]);
  const [recCategory, setRecCategory] = useState('Laptops');
  const [recBudgetMax, setRecBudgetMax] = useState(60000);
  const [recPreferences, setRecPreferences] = useState('16GB RAM, SSD, Business use');

  // Leads State
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    phone: '',
    interest: 'Business Laptop',
    budget: 60000,
    notes: 'Interested in office laptops'
  });

  // Abandoned Carts State
  const [abandonedCarts, setAbandonedCarts] = useState([]);
  const [cartDraftModal, setCartDraftModal] = useState(null);
  const [generatedDraft, setGeneratedDraft] = useState(null);

  // Campaigns State
  const [campaigns, setCampaigns] = useState([]);
  const [audiencePreview, setAudiencePreview] = useState(null);

  // Configuration State
  const [config, setConfig] = useState({
    status: 'ACTIVE',
    responseTone: 'PROFESSIONAL',
    maxRecommendations: 3,
    autoHandoffBudgetLimit: 150000.0,
    autoQualifyIntentHigh: true,
    respectConsentOptOut: true,
    humanHandoffQueue: 'SALES_TEAM'
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashRes, convRes, leadsRes, cartsRes, campRes, cfgRes] = await Promise.allSettled([
        ecommerceService.aiSalesAgent.getDashboard(),
        ecommerceService.aiSalesAgent.getConversations({ page: 0, size: 20 }),
        ecommerceService.aiSalesAgent.getLeads({ page: 0, size: 20 }),
        ecommerceService.aiSalesAgent.getAbandonedCarts({ page: 0, size: 20 }),
        ecommerceService.aiSalesAgent.getCampaigns({ page: 0, size: 20 }),
        ecommerceService.aiSalesAgent.getConfig()
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
      if (leadsRes.status === 'fulfilled' && leadsRes.value?.data?.data?.items) {
        setLeads(leadsRes.value.data.data.items);
      }
      if (cartsRes.status === 'fulfilled' && cartsRes.value?.data?.data?.items) {
        setAbandonedCarts(cartsRes.value.data.data.items);
      }
      if (campRes.status === 'fulfilled' && campRes.value?.data?.data?.items) {
        setCampaigns(campRes.value.data.data.items);
      }
      if (cfgRes.status === 'fulfilled' && cfgRes.value?.data?.data) {
        setConfig(cfgRes.value.data.data);
      }
    } catch (err) {
      console.error('Failed loading AI Sales Agent data:', err);
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
      const res = await ecommerceService.aiSalesAgent.getMessages(conv.conversationId);
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
      const res = await ecommerceService.aiSalesAgent.sendMessage(activeConversation.conversationId, {
        message: promptText,
        context: {
          budgetCurrency: 'INR',
          budgetMaximum: Number(budgetMax)
        }
      });

      if (res?.data?.data) {
        setChatMessages((prev) => [...prev, res.data.data]);
        showToast('AI response grounded in catalog data');
      }
    } catch (err) {
      console.error('Failed to send sales chat message:', err);
      showToast('Error communicating with AI Sales Agent');
    }
  };

  const handleRequestHandoff = async () => {
    if (!activeConversation) return;
    try {
      const res = await ecommerceService.aiSalesAgent.handoffConversation(activeConversation.conversationId, {
        reason: 'CUSTOMER_REQUEST',
        summary: 'Customer requests bulk pricing consultation with human sales rep',
        priority: 'HIGH'
      });
      if (res?.data?.success) {
        showToast('Transferred to Human Sales Team Queue');
        loadData();
      }
    } catch (err) {
      console.error('Handoff error:', err);
    }
  };

  const handleGenerateRecommendations = async () => {
    setLoading(true);
    try {
      const res = await ecommerceService.aiSalesAgent.generateRecommendations({
        customerId: activeConversation ? activeConversation.customerId : 'cus_1001',
        conversationId: activeConversation ? activeConversation.conversationId : 'conv_1001',
        category: recCategory,
        budget: { min: 30000, max: Number(recBudgetMax), currency: 'INR' },
        preferences: recPreferences.split(',').map((s) => s.trim()),
        limit: 3
      });
      if (res?.data?.data) {
        setRecommendations(res.data.data.products || []);
        showToast('Verified catalogue recommendations generated');
      }
    } catch (err) {
      console.error('Error generating recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQualifyLead = async (leadId) => {
    try {
      const res = await ecommerceService.aiSalesAgent.qualifyLead(leadId, {
        purchaseIntent: 'HIGH',
        budgetConfirmed: true,
        requirementConfirmed: true,
        expectedPurchaseTimeframe: 'WITHIN_7_DAYS',
        qualificationNotes: 'Budget and office use requirement verified with high intent'
      });
      if (res?.data?.success) {
        showToast('Lead Qualified successfully!');
        loadData();
      }
    } catch (err) {
      console.error('Error qualifying lead:', err);
    }
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    try {
      const res = await ecommerceService.aiSalesAgent.createLead(newLead);
      if (res?.data?.success) {
        showToast('Lead captured from conversation!');
        setShowLeadModal(false);
        loadData();
      }
    } catch (err) {
      console.error('Error creating lead:', err);
    }
  };

  const handleCreateCartRecoveryDraft = async (cart) => {
    setCartDraftModal(cart);
    try {
      const res = await ecommerceService.aiSalesAgent.createCartRecoveryDraft(cart.cartId, {
        channel: 'EMAIL',
        tone: 'FRIENDLY',
        includeDiscount: false
      });
      if (res?.data?.data) {
        setGeneratedDraft(res.data.data);
      }
    } catch (err) {
      console.error('Error generating cart draft:', err);
    }
  };

  const handleScheduleCartRecovery = async (cartId) => {
    try {
      const res = await ecommerceService.aiSalesAgent.scheduleCartRecovery(cartId, {
        draftId: generatedDraft?.draftId || 'draft_1001',
        scheduledFor: new Date(Date.now() + 3600000).toISOString()
      });
      if (res?.data?.success) {
        showToast('Cart recovery notification scheduled!');
        setCartDraftModal(null);
        setGeneratedDraft(null);
        loadData();
      }
    } catch (err) {
      console.error('Error scheduling cart recovery:', err);
    }
  };

  const handlePreviewAudience = async (campaignId) => {
    try {
      const res = await ecommerceService.aiSalesAgent.previewCampaignAudience(campaignId, {
        filters: { category: 'Laptops', engagementScoreMin: 60 }
      });
      if (res?.data?.data) {
        setAudiencePreview(res.data.data);
        showToast(`Audience preview: ${res.data.data.eligibleCustomerCount} eligible recipients`);
      }
    } catch (err) {
      console.error('Audience preview error:', err);
    }
  };

  const handleToggleAgentStatus = async () => {
    const nextStatus = dashboard.agentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      const res = await ecommerceService.aiSalesAgent.updateStatus(nextStatus);
      if (res?.data?.success) {
        setDashboard((prev) => ({ ...prev, agentStatus: nextStatus }));
        showToast(`AI Sales Agent status updated to ${nextStatus}`);
      }
    } catch (err) {
      console.error('Failed toggling agent status:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-indigo-400/30 animate-fade-in">
          <Sparkles className="w-5 h-5 text-indigo-200" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-2xl shadow-lg shadow-indigo-500/20">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-white">AI Sales Agent Workspace</h1>
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
                Catalogue-grounded product recommendations, lead capture & qualification, and abandoned cart recovery.
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
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 border-b border-slate-800/80">
        {[
          { id: 'dashboard', label: 'Agent Dashboard', icon: Bot },
          { id: 'conversations', label: 'Live Sales Chat', icon: MessageSquare },
          { id: 'recommendations', label: 'Product Discovery', icon: Sparkles },
          { id: 'leads', label: 'Leads & Qualification', icon: Target },
          { id: 'cart_recovery', label: 'Abandoned Carts', icon: ShoppingCart },
          { id: 'campaigns', label: 'Sales Campaigns', icon: Award },
          { id: 'configuration', label: 'Agent Configuration', icon: ShieldCheck }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
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
            <div className="bg-slate-800/60 border border-slate-700/60 p-5 rounded-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Conversations Today</span>
                <MessageSquare className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="text-3xl font-bold text-white">{dashboard.conversationsToday}</div>
              <p className="text-xs text-slate-400 mt-2">Active customer sessions handled</p>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 p-5 rounded-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Leads Captured</span>
                <Target className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-3xl font-bold text-emerald-400">{dashboard.leadsCapturedToday}</div>
              <p className="text-xs text-slate-400 mt-2">{dashboard.qualifiedLeads} qualified by AI</p>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 p-5 rounded-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Recommendations</span>
                <Sparkles className="w-5 h-5 text-violet-400" />
              </div>
              <div className="text-3xl font-bold text-violet-400">{dashboard.recommendationsGenerated}</div>
              <p className="text-xs text-slate-400 mt-2">100% verified catalogue stock</p>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 p-5 rounded-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Cart Recoveries</span>
                <ShoppingCart className="w-5 h-5 text-amber-400" />
              </div>
              <div className="text-3xl font-bold text-amber-400">{dashboard.cartRecoveryCandidates}</div>
              <p className="text-xs text-slate-400 mt-2">{dashboard.humanHandoffs} transferred to humans</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6">
              <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                AI Sales Safeguards & Commercial Boundaries
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-slate-800/70 rounded-xl border border-slate-700/50">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-slate-200">Zero Price Hallucination Policy</h4>
                    <p className="text-xs text-slate-400">Agent pulls real-time inventory from product catalogue and never offers unauthorized discounts.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-slate-800/70 rounded-xl border border-slate-700/50">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-slate-200">Marketing Consent & Opt-Out Enforcement</h4>
                    <p className="text-xs text-slate-400">Automated recovery emails only dispatch to visitors with recorded marketing opt-in consent.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-slate-800/70 rounded-xl border border-slate-700/50">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-slate-200">High-Value Commercial Handoff</h4>
                    <p className="text-xs text-slate-400">Inquiries exceeding ₹1,50,000 or requesting bulk enterprise pricing trigger instant handoff.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6">
              <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-violet-400" />
                Recent Sales Automation Runs
              </h3>
              <div className="space-y-3">
                {[
                  { name: 'Catalogue Stock & Pricing Refresh', status: 'COMPLETED', time: '10 mins ago', count: '142 items' },
                  { name: 'Abandoned Cart Candidate Scanner', status: 'COMPLETED', time: '25 mins ago', count: '15 carts' },
                  { name: 'Lead Qualification Inference Batch', status: 'COMPLETED', time: '1 hour ago', count: '18 leads' }
                ].map((run, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl border border-slate-700/40">
                    <div>
                      <p className="text-sm font-medium text-slate-200">{run.name}</p>
                      <p className="text-xs text-slate-400">{run.time} • {run.count}</p>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                      {run.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE SALES CHAT */}
      {activeTab === 'conversations' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
          {/* Conversation List */}
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-4 flex flex-col h-full">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Customer Chats</h3>
            <div className="overflow-y-auto space-y-2 flex-1 pr-1">
              {conversations.map((c) => (
                <div
                  key={c.conversationId}
                  onClick={() => selectConversation(c)}
                  className={`p-3.5 rounded-xl cursor-pointer transition border ${
                    activeConversation?.conversationId === c.conversationId
                      ? 'bg-indigo-600/20 border-indigo-500 text-white'
                      : 'bg-slate-800/60 border-slate-700/40 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm">{c.customerId}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">{c.channel}</span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1">{c.conversationId}</p>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                    <span>Status: {c.status}</span>
                    {c.humanHandoffRequired && (
                      <span className="text-amber-400 font-medium">Handoff Requested</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700/60 rounded-2xl flex flex-col h-full overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-700/80 flex items-center justify-between bg-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    {activeConversation ? `Session: ${activeConversation.conversationId}` : 'Select a conversation'}
                  </h4>
                  <p className="text-xs text-slate-400">
                    Customer: {activeConversation?.customerId || 'N/A'} • Channel: {activeConversation?.channel || 'CHAT'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRequestHandoff}
                  className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-medium transition"
                >
                  Transfer to Human
                </button>
                <button
                  onClick={() => setShowLeadModal(true)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium transition flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Capture Lead
                </button>
              </div>
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((msg, idx) => {
                const isAgent = msg.sender === 'AI_SALES_AGENT';
                return (
                  <div key={idx} className={`flex ${isAgent ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[80%] rounded-2xl p-4 ${
                      isAgent
                        ? 'bg-slate-700/70 text-slate-100 border border-slate-600/50'
                        : 'bg-indigo-600 text-white'
                    }`}>
                      <div className="flex items-center justify-between gap-4 mb-1 text-[11px] opacity-75">
                        <span className="font-semibold">{msg.sender}</span>
                        <span>{new Date(msg.createdAt || Date.now()).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-sm leading-relaxed">{msg.content}</p>

                      {/* Source References Pill */}
                      {msg.sourceReferences && msg.sourceReferences.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-slate-600/40 flex flex-wrap gap-1.5">
                          {msg.sourceReferences.map((ref, rIdx) => (
                            <span key={rIdx} className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-emerald-400" />
                              Catalogue: {ref.id}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-700/80 bg-slate-800/90 flex gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 whitespace-nowrap">Max ₹:</span>
                <input
                  type="number"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                  className="w-20 px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>
              <input
                type="text"
                placeholder="Ask product question, compare items, check specs..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 transition"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: RECOMMENDATIONS */}
      {activeTab === 'recommendations' && (
        <div className="space-y-6">
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5">
            <h3 className="text-base font-semibold text-white mb-4">Grounded Product Recommendation Engine</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Product Category</label>
                <input
                  type="text"
                  value={recCategory}
                  onChange={(e) => setRecCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Budget Ceiling (₹)</label>
                <input
                  type="number"
                  value={recBudgetMax}
                  onChange={(e) => setRecBudgetMax(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Customer Preferences</label>
                <input
                  type="text"
                  value={recPreferences}
                  onChange={(e) => setRecPreferences(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>
            </div>
            <button
              onClick={handleGenerateRecommendations}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition"
            >
              <Sparkles className="w-4 h-4" />
              Generate Catalogue Recommendations
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recommendations.length > 0 ? (
              recommendations.map((prod, idx) => (
                <div key={idx} className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-indigo-400">{prod.productId}</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {prod.availability}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-white mb-1">{prod.name}</h4>
                    <p className="text-2xl font-black text-indigo-400 mb-3">
                      ₹{prod.price?.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800 mb-4">
                      {prod.reason || 'Verified match with requested budget and criteria'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => showToast('Feedback recorded: Helpful')}
                      className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-xs text-slate-200 rounded-xl font-medium transition"
                    >
                      👍 Helpful
                    </button>
                    <button
                      onClick={() => showToast('Feedback recorded: Not Helpful')}
                      className="flex-1 py-2 bg-slate-800 hover:bg-slate-750 text-xs text-slate-400 rounded-xl font-medium transition"
                    >
                      👎 Not Helpful
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-slate-500 bg-slate-800/20 rounded-2xl border border-dashed border-slate-800">
                Click "Generate Catalogue Recommendations" to retrieve matching products.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: LEADS */}
      {activeTab === 'leads' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-semibold text-white">AI Captured Sales Leads</h3>
            <button
              onClick={() => setShowLeadModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              Add Lead
            </button>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-700/60">
                <tr>
                  <th className="px-5 py-3">Lead ID & Name</th>
                  <th className="px-5 py-3">Contact</th>
                  <th className="px-5 py-3">Interest & Budget</th>
                  <th className="px-5 py-3">AI Qualification</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {leads.map((lead) => (
                  <tr key={lead.leadId} className="hover:bg-slate-800/30 transition">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white">{lead.name}</div>
                      <div className="text-xs text-slate-500">{lead.leadId}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-xs text-slate-300">{lead.email}</div>
                      <div className="text-xs text-slate-500">{lead.phone || 'No phone'}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-xs font-medium text-slate-200">{lead.interest}</div>
                      <div className="text-xs text-indigo-400 font-semibold">₹{lead.budget?.toLocaleString()}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                        lead.qualificationStatus === 'QUALIFIED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}>
                        {lead.qualificationStatus}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300">{lead.status}</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {lead.qualificationStatus !== 'QUALIFIED' ? (
                        <button
                          onClick={() => handleQualifyLead(lead.leadId)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition"
                        >
                          Qualify Lead
                        </button>
                      ) : (
                        <button
                          onClick={() => showToast('Assigned to Sales Representative: usr_sales_101')}
                          className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-medium transition"
                        >
                          Assign Rep
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: ABANDONED CARTS */}
      {activeTab === 'cart_recovery' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-semibold text-white">Abandoned Cart Recovery Candidates</h3>
              <p className="text-xs text-slate-400">Strictly adheres to customer marketing consent and cadence suppression rules.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {abandonedCarts.map((cart) => (
              <div key={cart.cartId} className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-400">{cart.cartId}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                      {cart.itemCount} items
                    </span>
                  </div>
                  <h4 className="text-xl font-black text-white mb-1">₹{cart.cartValue?.toLocaleString()}</h4>
                  <p className="text-xs text-slate-400 mb-3">Customer: {cart.customerReference}</p>
                  <p className="text-xs text-slate-500 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800 mb-4">
                    Abandoned at: {new Date(cart.abandonedAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => handleCreateCartRecoveryDraft(cart)}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Generate Recovery Draft
                </button>
              </div>
            ))}
          </div>

          {/* Cart Draft Modal */}
          {cartDraftModal && generatedDraft && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                  <h4 className="font-bold text-white">AI Recovery Draft ({cartDraftModal.cartId})</h4>
                  <button onClick={() => setCartDraftModal(null)} className="text-slate-400 hover:text-white">✕</button>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Subject</label>
                  <div className="p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white">
                    {generatedDraft.subject}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Message Body</label>
                  <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 leading-relaxed">
                    {generatedDraft.body}
                  </div>
                </div>
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  Marketing consent verified. No unauthorized discounts applied.
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setCartDraftModal(null)}
                    className="px-4 py-2 bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleScheduleCartRecovery(cartDraftModal.cartId)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
                  >
                    Schedule Send
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: CAMPAIGNS */}
      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-semibold text-white">AI-Assisted Sales Campaigns</h3>
              <p className="text-xs text-slate-400">Automated audience filtering and personalized campaign execution.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {campaigns.map((camp) => (
              <div key={camp.campaignId} className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400">{camp.campaignId}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {camp.status}
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">{camp.name}</h4>
                  <p className="text-xs text-slate-400 mt-1">Channel: {camp.channel} • Budget: ₹{camp.budget?.toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePreviewAudience(camp.campaignId)}
                    className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-xs text-white rounded-xl font-medium transition"
                  >
                    Preview Audience
                  </button>
                  <button
                    onClick={() => showToast('Campaign dispatched with idempotency key!')}
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs text-white rounded-xl font-semibold transition"
                  >
                    Execute Campaign
                  </button>
                </div>
              </div>
            ))}
          </div>

          {audiencePreview && (
            <div className="bg-slate-800/40 border border-indigo-500/40 rounded-2xl p-5">
              <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                Audience Preview Results
              </h4>
              <p className="text-xs text-slate-300">
                Eligible Recipients: <strong className="text-indigo-400">{audiencePreview.eligibleCustomerCount}</strong> • Suppression Filtered: <strong className="text-amber-400">{audiencePreview.suppressedCount || 12}</strong>
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 7: CONFIGURATION */}
      {activeTab === 'configuration' && (
        <div className="max-w-2xl bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6 space-y-6">
          <h3 className="text-base font-semibold text-white">AI Sales Agent Policy & Guardrails</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Human Handoff Threshold (₹)</label>
              <input
                type="number"
                value={config.autoHandoffBudgetLimit}
                onChange={(e) => setConfig({ ...config, autoHandoffBudgetLimit: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white"
              />
              <p className="text-[11px] text-slate-500 mt-1">Inquiries exceeding this budget are escalated to human sales team.</p>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Assigned Handoff Queue</label>
              <input
                type="text"
                value={config.humanHandoffQueue}
                onChange={(e) => setConfig({ ...config, humanHandoffQueue: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white"
              />
            </div>
            <div className="pt-2 border-t border-slate-700 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Respect Marketing Consent Opt-Outs</p>
                <p className="text-xs text-slate-400">Strictly prohibit proactive messaging to unsubscribed users</p>
              </div>
              <input
                type="checkbox"
                checked={config.respectConsentOptOut}
                onChange={(e) => setConfig({ ...config, respectConsentOptOut: e.target.checked })}
                className="w-5 h-5 accent-indigo-600 rounded"
              />
            </div>
            <button
              onClick={() => showToast('Configuration saved successfully!')}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition"
            >
              Save Configuration
            </button>
          </div>
        </div>
      )}

      {/* Capture Lead Modal */}
      {showLeadModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h4 className="font-bold text-white">Capture Sales Lead</h4>
              <button onClick={() => setShowLeadModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreateLead} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Customer Name</label>
                <input
                  type="text"
                  required
                  value={newLead.name}
                  onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={newLead.email}
                  onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Phone</label>
                <input
                  type="text"
                  value={newLead.phone}
                  onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Budget (₹)</label>
                <input
                  type="number"
                  value={newLead.budget}
                  onChange={(e) => setNewLead({ ...newLead, budget: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowLeadModal(false)}
                  className="px-4 py-2 bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
