import React, { useState, useEffect } from 'react';
import { useCRM } from '../../context/CRMContext';
import { manufacturingService } from '../../services/manufacturingService';
import {
  Bot,
  Send,
  MessageSquare,
  Sparkles,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  UserCheck,
  FileText,
  DollarSign,
  Package,
  Calendar,
  Layers,
  ArrowRight,
  Shield,
  Briefcase,
  TrendingUp,
  Cpu,
  Check,
  X
} from 'lucide-react';

export function ManufacturingAiB2BSalesAgentView() {
  const { addNotification } = useCRM();

  const [activeTab, setActiveTab] = useState('conversations'); // 'conversations' | 'requirements' | 'inventory' | 'quotations' | 'followups'
  const [isLoading, setIsLoading] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');

  // AI requirements & recommendations state
  const [extraction, setExtraction] = useState({
    extractionId: 'REQ-7001',
    leadId: 'LEAD-5001',
    requirements: {
      quantity: 50,
      ratedPowerKw: 5.5,
      voltage: '415 V',
      operatingMode: 'CONTINUOUS'
    },
    missingInformation: [
      'Frequency',
      'Mounting requirements',
      'Environmental conditions'
    ],
    validationStatus: 'PENDING_CATALOGUE_VALIDATION'
  });

  // Inventory check state
  const [inventoryCheck, setInventoryCheck] = useState({
    checkId: 'INVCHK-3001',
    productId: 'PRD-2001',
    requestedQuantity: 50,
    availabilityStatus: 'PARTIAL',
    availableQuantity: 20,
    shortfallQuantity: 30,
    source: 'ERP_INVENTORY',
    checkedAt: '2026-10-29T08:45:00+05:30'
  });

  // Quotation state
  const [quotation, setQuotation] = useState({
    quotationId: 'QUO-9001',
    leadId: 'LEAD-5001',
    status: 'DRAFT',
    currency: 'INR',
    items: [
      { productId: 'PRD-2001', productName: 'Industrial Motor M200', quantity: 50, unitPrice: 18500.0, lineTotal: 925000.0 }
    ],
    requiresPricingResolution: false,
    requiresApproval: true
  });

  // Modals
  const [showHandoffModal, setShowHandoffModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);

  const [handoffReason, setHandoffReason] = useState('Technical product suitability requires human review');
  const [followUpDue, setFollowUpDue] = useState('2026-10-30T10:00:00+05:30');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [dashRes, convsRes] = await Promise.allSettled([
        manufacturingService.aiB2BSalesAgent.getDashboard(),
        manufacturingService.aiB2BSalesAgent.getConversations()
      ]);

      if (dashRes.status === 'fulfilled') setDashboard(dashRes.value);
      if (convsRes.status === 'fulfilled' && convsRes.value.length > 0) {
        setConversations(convsRes.value);
        setSelectedConv(convsRes.value[0]);
        loadMessages(convsRes.value[0].conversationId);
      } else {
        // Fallback seed conversation
        const seedConv = {
          conversationId: 'AISC-1001',
          channel: 'WEBSITE_CHAT',
          visitorReference: 'VIS-9001',
          status: 'ACTIVE',
          leadId: 'LEAD-5001',
          nextAction: 'COLLECT_REQUIREMENTS'
        };
        setConversations([seedConv]);
        setSelectedConv(seedConv);
        loadMessages('AISC-1001');
      }
    } catch (err) {
      console.warn('Fallback loading:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (convId) => {
    try {
      const res = await manufacturingService.aiB2BSalesAgent.getMessages(convId);
      if (res && res.length > 0) {
        setMessages(res);
      } else {
        setMessages([
          {
            messageId: 'msg-1',
            sender: 'CUSTOMER',
            content: 'We need 50 industrial motors for our factory. Can you provide specifications and availability?',
            timestamp: '10:30 AM'
          },
          {
            messageId: 'msg-2',
            sender: 'AI_AGENT',
            content: 'I can certainly help identify suitable motors from our engineering catalog. Could you share your required power rating, voltage, and expected delivery date?',
            timestamp: '10:31 AM'
          },
          {
            messageId: 'msg-3',
            sender: 'CUSTOMER',
            content: 'We need 5.5 kW, 415 V, 3-phase motors suitable for continuous duty in an ambient temperature up to 45 C.',
            timestamp: '10:33 AM'
          }
        ]);
      }
    } catch {
      // Keep initial messages
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
      const convId = selectedConv ? selectedConv.conversationId : 'AISC-1001';
      await manufacturingService.aiB2BSalesAgent.addMessage(convId, { message: newMsg.content, sender: 'CUSTOMER' });

      // Simulate AI response
      setTimeout(() => {
        const aiReply = {
          messageId: `msg-ai-${Date.now()}`,
          sender: 'AI_AGENT',
          content: 'I have extracted your 5.5 kW, 415 V continuous duty requirements and checked our live catalogue. Product Industrial Motor M200 is a candidate match. Checking authorized pricing and inventory availability now.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiReply]);
      }, 700);
    } catch (err) {
      console.warn('Message send fallback:', err);
    }
  };

  const handleExtractRequirements = async () => {
    try {
      const res = await manufacturingService.aiB2BSalesAgent.extractRequirements({
        leadId: 'LEAD-5001',
        conversationId: selectedConv ? selectedConv.conversationId : 'AISC-1001',
        customerMessage: 'We need 50 motors, 5.5 kW, 415 V, continuous duty.'
      });
      setExtraction(res);
      addNotification?.({ type: 'success', message: 'Requirements extracted and validated against catalog schema' });
      setActiveTab('requirements');
    } catch (err) {
      addNotification?.({ type: 'error', message: err.message || 'Extraction failed' });
    }
  };

  const handleCheckInventory = async () => {
    try {
      const res = await manufacturingService.aiB2BSalesAgent.checkInventoryAvailability({
        productId: 'PRD-2001',
        quantity: 50,
        requiredBy: '2026-11-15',
        locationId: 'LOC-1001'
      });
      setInventoryCheck(res);
      addNotification?.({ type: 'info', message: 'Real-time non-reservational stock check completed' });
      setActiveTab('inventory');
    } catch (err) {
      addNotification?.({ type: 'error', message: err.message || 'Inventory check failed' });
    }
  };

  const handleRequestQuoteApproval = async () => {
    try {
      const quoteId = quotation.quotationId || 'QUO-9001';
      const res = await manufacturingService.aiB2BSalesAgent.requestQuotationApproval(quoteId, {
        reason: 'B2B commercial quotation requires sales manager sign-off'
      });
      setQuotation(prev => ({ ...prev, status: 'PENDING_APPROVAL' }));
      addNotification?.({ type: 'success', message: `Quotation ${quoteId} submitted for human commercial approval (ID: ${res.approvalRequestId || 'APR-4001'})` });
    } catch (err) {
      addNotification?.({ type: 'error', message: err.message || 'Approval request failed' });
    }
  };

  const handleHandoff = async (e) => {
    e.preventDefault();
    try {
      const convId = selectedConv ? selectedConv.conversationId : 'AISC-1001';
      await manufacturingService.aiB2BSalesAgent.handoffConversation(convId, {
        reason: handoffReason,
        targetTeam: 'MANUFACTURING_SALES',
        summary: 'Prospect requires 50 industrial motors with specialized mounting specs.'
      });
      addNotification?.({ type: 'info', message: 'Conversation transferred to Human Sales Specialist (HANDOFF_PENDING)' });
      setShowHandoffModal(false);
      setSelectedConv(prev => ({ ...prev, status: 'HANDOFF_PENDING' }));
    } catch (err) {
      addNotification?.({ type: 'error', message: err.message || 'Handoff failed' });
    }
  };

  const handleCreateFollowUp = async (e) => {
    e.preventDefault();
    try {
      const res = await manufacturingService.aiB2BSalesAgent.createFollowUp({
        leadId: 'LEAD-5001',
        conversationId: selectedConv ? selectedConv.conversationId : 'AISC-1001',
        followUpType: 'COLLECT_REQUIREMENTS',
        dueAt: followUpDue,
        reason: 'Awaiting customer specification confirmation'
      });
      addNotification?.({ type: 'success', message: `Follow-up task ${res.taskId || 'FUP-7001'} scheduled` });
      setShowFollowUpModal(false);
    } catch (err) {
      addNotification?.({ type: 'error', message: err.message || 'Follow-up creation failed' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center gap-1">
              <Bot className="w-3.5 h-3.5" /> Autonomous B2B Sales Agent
            </span>
            <span className="px-2.5 py-1 text-xs font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-full">
              Industrial Products Copilot
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">AI B2B Sales Agent</h1>
          <p className="text-sm text-slate-400">
            Automatically qualifies prospective industrial customers, extracts equipment specs, looks up authorized pricing, and prepares governed quotation drafts.
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
            onClick={handleExtractRequirements}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-xl transition flex items-center gap-2 shadow-lg shadow-blue-500/20"
          >
            <Cpu className="w-4 h-4" /> Extract Requirements
          </button>
          <button
            onClick={handleCheckInventory}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl transition flex items-center gap-2 shadow-lg shadow-indigo-500/20"
          >
            <Package className="w-4 h-4" /> Check Stock
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase">Conversations</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{dashboard?.activeConversations ?? 18}</p>
          <span className="text-xs text-blue-600 font-medium">Active Channels</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase">Leads Today</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{dashboard?.newLeadsToday ?? 12}</p>
          <span className="text-xs text-indigo-600 font-medium">Auto-captured</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase">Qualification</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{dashboard?.pendingQualification ?? 7}</p>
          <span className="text-xs text-amber-500 font-medium">Pending Specs</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase">Human Handoff</p>
          <p className="text-2xl font-bold text-rose-600 mt-1">{dashboard?.pendingHumanHandoff ?? 3}</p>
          <span className="text-xs text-rose-500 font-medium">High Value OEM</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase">Quote Drafts</p>
          <p className="text-2xl font-bold text-cyan-600 mt-1">{dashboard?.quotationDrafts ?? 5}</p>
          <span className="text-xs text-cyan-600 font-medium">Awaiting Pricing</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase">Pending Approvals</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{dashboard?.pendingApprovals ?? 2}</p>
          <span className="text-xs text-purple-600 font-medium">Manager Sign-off</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase">Meetings</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{dashboard?.meetingsRequested ?? 4}</p>
          <span className="text-xs text-emerald-600 font-medium">Authorized Cal</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('conversations')}
          className={`pb-3 transition border-b-2 flex items-center gap-1.5 ${activeTab === 'conversations' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <MessageSquare className="w-4 h-4" /> Live Sales Conversations
        </button>
        <button
          onClick={() => setActiveTab('requirements')}
          className={`pb-3 transition border-b-2 flex items-center gap-1.5 ${activeTab === 'requirements' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <Cpu className="w-4 h-4" /> Extracted Requirements & Specs
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 transition border-b-2 flex items-center gap-1.5 ${activeTab === 'inventory' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <Package className="w-4 h-4" /> Pricing & Inventory Availability
        </button>
        <button
          onClick={() => setActiveTab('quotations')}
          className={`pb-3 transition border-b-2 flex items-center gap-1.5 ${activeTab === 'quotations' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <FileText className="w-4 h-4" /> Quotation Drafts & Governance
        </button>
        <button
          onClick={() => setActiveTab('followups')}
          className={`pb-3 transition border-b-2 flex items-center gap-1.5 ${activeTab === 'followups' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <Calendar className="w-4 h-4" /> Scheduled Follow-ups
        </button>
      </div>

      {/* TAB 1: CONVERSATION WORKSPACE */}
      {activeTab === 'conversations' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversation List */}
          <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="font-semibold text-slate-800 text-sm">Active Channels</span>
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
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">{c.channel}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-800">{c.visitorReference || 'Visitor'} • Enquiry: 50 Motors</h4>
                  <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
                    <span>Lead: {c.leadId || 'Pending'}</span>
                    <span className={`font-semibold ${c.status === 'HANDOFF_PENDING' ? 'text-amber-600' : 'text-emerald-600'}`}>{c.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Conversation Stream & Copilot Control */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[600px]">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="font-bold text-sm text-slate-900">{selectedConv?.conversationId || 'AISC-1001'}</span>
                <span className="text-xs text-slate-400">({selectedConv?.channel || 'WEBSITE_CHAT'})</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowHandoffModal(true)}
                  className="px-3 py-1.5 text-xs bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg font-semibold transition flex items-center gap-1"
                >
                  <UserCheck className="w-3.5 h-3.5 text-amber-600" /> Human Handoff
                </button>
                <button
                  onClick={() => setShowFollowUpModal(true)}
                  className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition flex items-center gap-1"
                >
                  <Calendar className="w-3.5 h-3.5" /> Schedule Follow-up
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
                    <span className="font-semibold">{m.sender === 'CUSTOMER' ? 'Prospect (Arun Kumar)' : 'AI Sales Copilot'}</span>
                    <span>• {m.timestamp}</span>
                  </div>
                  <div
                    className={`p-3.5 rounded-2xl max-w-lg text-xs leading-relaxed ${
                      m.sender === 'CUSTOMER'
                        ? 'bg-slate-100 text-slate-800 rounded-tl-sm'
                        : 'bg-blue-600 text-white rounded-tr-sm shadow-sm'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 bg-slate-50 flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type customer message or simulated reply..."
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

      {/* TAB 2: EXTRACTED REQUIREMENTS */}
      {activeTab === 'requirements' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Extracted Industrial Product Requirements</h3>
              <p className="text-xs text-slate-500">Automated Natural Language Extraction validated against standard schema</p>
            </div>
            <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-semibold">
              Status: {extraction.validationStatus}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Quantity Required</span>
              <p className="text-base font-bold text-slate-900">{extraction.requirements?.quantity} Units</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Rated Power</span>
              <p className="text-base font-bold text-blue-600">{extraction.requirements?.ratedPowerKw} kW</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Voltage Rating</span>
              <p className="text-base font-bold text-slate-800">{extraction.requirements?.voltage}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Operating Duty Cycle</span>
              <p className="text-base font-bold text-emerald-600">{extraction.requirements?.operatingMode}</p>
            </div>
          </div>

          <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" /> Missing Information for Engineering Compatibility
            </h4>
            <div className="flex flex-wrap gap-2">
              {extraction.missingInformation?.map((item, idx) => (
                <span key={idx} className="px-3 py-1 bg-white border border-amber-200 text-amber-800 text-xs rounded-full font-medium">
                  • {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PRICING & INVENTORY */}
      {activeTab === 'inventory' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Authorized OEM Pricing & ERP Inventory Availability</h3>
              <p className="text-xs text-slate-500">Live query against ERP warehouse records without automated inventory reservation.</p>
            </div>
            <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-semibold">
              Source: ERP_INVENTORY
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pricing Card */}
            <div className="p-5 border border-slate-200 rounded-xl space-y-4 bg-slate-50/50">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Price List: PL-100 (Direct OEM 2026)</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">₹18,500</span>
                <span className="text-xs text-slate-500 font-medium">/ unit (Excl. Tax)</span>
              </div>
              <p className="text-xs text-slate-600">
                Indicative OEM price valid until <strong>2026-12-31</strong>. Requires commercial approval for customer discounts.
              </p>
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <span>Total 50 Units: <strong>₹925,000.00</strong></span>
                <span className="text-indigo-600 font-medium">Approved Direct Pricing</span>
              </div>
            </div>

            {/* Inventory Status Card */}
            <div className="p-5 border border-slate-200 rounded-xl space-y-4 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">ERP Stock Availability: INVCHK-3001</span>
                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
                  PARTIAL AVAILABILITY
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white border border-slate-200 rounded-lg">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Currently in Stock</span>
                  <p className="text-xl font-bold text-emerald-600 mt-0.5">{inventoryCheck.availableQuantity} Units</p>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-lg">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Shortfall / Production</span>
                  <p className="text-xl font-bold text-rose-600 mt-0.5">{inventoryCheck.shortfallQuantity} Units</p>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Live ERP checked at {inventoryCheck.checkedAt}. Production lead time estimate: 3 weeks for 30 units.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: QUOTATION DRAFTS & GOVERNANCE */}
      {activeTab === 'quotations' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Quotation Draft Workspace & Commercial Approvals</h3>
              <p className="text-xs text-slate-500">
                AI prepares quotations as drafts only. The AI agent cannot approve its own commercial quotations or discounts.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                quotation.status === 'PENDING_APPROVAL' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                'bg-blue-100 text-blue-700 border-blue-200'
              }`}>
                Status: {quotation.status}
              </span>
              <button
                onClick={handleRequestQuoteApproval}
                disabled={quotation.status === 'PENDING_APPROVAL'}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition"
              >
                {quotation.status === 'PENDING_APPROVAL' ? 'Approval Requested (APR-4001)' : 'Request Human Approval'}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Product ID</th>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3">Quantity</th>
                  <th className="py-2.5 px-3">Authorized Unit Price</th>
                  <th className="py-2.5 px-3">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {quotation.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3 px-3 font-mono font-semibold text-slate-800">{item.productId}</td>
                    <td className="py-3 px-3 font-medium text-slate-900">{item.productName}</td>
                    <td className="py-3 px-3 font-bold text-slate-800">{item.quantity}</td>
                    <td className="py-3 px-3">₹{item.unitPrice?.toLocaleString() || '18,500.00'}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">₹{item.lineTotal?.toLocaleString() || '925,000.00'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1 text-right">
            <div>
              <p className="text-slate-500">Subtotal: <span className="font-semibold text-slate-800">₹925,000.00</span></p>
              <p className="text-slate-500">GST (18%): <span className="font-semibold text-slate-800">₹166,500.00</span></p>
              <p className="text-sm font-bold text-slate-900 mt-1">Total Commercial Value: ₹1,091,500.00</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SCHEDULED FOLLOW-UPS */}
      {activeTab === 'followups' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Sales Follow-up & Meeting Task Management</h3>
              <p className="text-xs text-slate-500">Scheduled reminders respect prospect communication preferences.</p>
            </div>
            <button
              onClick={() => setShowFollowUpModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4" /> Create Follow-up
            </button>
          </div>

          <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 flex items-start gap-3">
            <Calendar className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-slate-900">Follow-up: FUP-7001</h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Type: <span className="font-semibold">COLLECT_REQUIREMENTS</span> • Due: <span className="font-mono text-blue-700">2026-10-30 10:00 AM</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">Reason: Awaiting technical mounting specifications from prospect Arun Kumar.</p>
            </div>
          </div>
        </div>
      )}

      {/* HUMAN HANDOFF MODAL */}
      {showHandoffModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900">Transfer Conversation to Human Representative</h3>
              <button onClick={() => setShowHandoffModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleHandoff} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Target Department / Team</label>
                <select className="w-full px-3 py-2 border rounded-lg bg-slate-50">
                  <option value="MANUFACTURING_SALES">MANUFACTURING_SALES (Direct OEM Sales)</option>
                  <option value="APPLICATION_ENGINEERING">APPLICATION_ENGINEERING</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Handoff Reason</label>
                <input
                  type="text"
                  value={handoffReason}
                  onChange={(e) => setHandoffReason(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setShowHandoffModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-semibold">Initiate Handoff</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCHEDULE FOLLOW-UP MODAL */}
      {showFollowUpModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900">Schedule Sales Follow-up Task</h3>
              <button onClick={() => setShowFollowUpModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateFollowUp} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Follow-up Due Timestamp</label>
                <input
                  type="text"
                  value={followUpDue}
                  onChange={(e) => setFollowUpDue(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 font-mono"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setShowFollowUpModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold">Save Follow-up</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
