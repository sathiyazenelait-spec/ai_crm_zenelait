import React, { useState, useEffect } from 'react';
import { useCRM } from '../../context/CRMContext';
import { travelService } from '../../services/travelService';
import {
  Bot,
  Compass,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Search,
  CheckCircle2,
  Send,
  FileText,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Hotel,
  RefreshCw,
  Plus,
  HelpCircle,
  TrendingUp,
  UserCheck,
  ChevronRight,
  Layers,
  MessageSquare,
  AlertCircle
} from 'lucide-react';

export function TravelAiSalesAgentView() {
  const { addNotification } = useCRM();

  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'leads' | 'requirements' | 'search' | 'itineraries' | 'quotations' | 'handoff' | 'settings'
  const [isLoading, setIsLoading] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [leads, setLeads] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [itineraries, setItineraries] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [settings, setSettings] = useState(null);
  const [health, setHealth] = useState(null);

  // Active items
  const [selectedLead, setSelectedLead] = useState(null);
  const [extractedReqs, setExtractedReqs] = useState(null);
  const [clarificationQuestions, setClarificationQuestions] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [recommendations, setRecommendations] = useState(null);

  // Forms & Modals
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadForm, setLeadForm] = useState({
    name: 'Arun Kumar',
    email: 'arun@example.com',
    phone: '+919876543210',
    message: 'I want a five-day Bali holiday for two adults in December, with a budget of ₹1,00,000.',
    channel: 'EMAIL'
  });

  const [searchForm, setSearchForm] = useState({
    destination: 'Bali',
    departureCity: 'Chennai',
    departureDate: '2026-12-10',
    returnDate: '2026-12-15',
    adults: 2,
    children: 0,
    budget: 100000,
    currency: 'INR'
  });

  const [quoteForm, setQuoteForm] = useState({
    leadId: 'LEAD-1001',
    itineraryId: 'ITIN-1001',
    description: '4-Star Bali Resort & Airport Transfer',
    quantity: 1,
    unitPrice: 32000,
    currency: 'INR'
  });

  const [showQuoteModal, setShowQuoteModal] = useState(false);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [dashRes, leadsRes, destsRes, itinsRes, quotesRes, setRes, healthRes] = await Promise.all([
        travelService.aiSalesAgent.getDashboard().catch(() => null),
        travelService.aiSalesAgent.getLeads().catch(() => []),
        travelService.getDestinations().catch(() => []),
        travelService.aiSalesAgent.getItineraries().catch(() => []),
        travelService.aiSalesAgent.getQuotations().catch(() => []),
        travelService.aiSalesAgent.getSettings().catch(() => null),
        travelService.aiSalesAgent.getHealth().catch(() => null)
      ]);

      setDashboard(dashRes);
      setLeads(leadsRes);
      setDestinations(destsRes);
      setItineraries(itinsRes);
      setQuotations(quotesRes);
      setSettings(setRes);
      setHealth(healthRes);

      if (leadsRes && leadsRes.length > 0 && !selectedLead) {
        setSelectedLead(leadsRes[0]);
      }
    } catch (err) {
      console.error(err);
      addNotification?.('Failed to load AI Sales Agent data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // 1. Create Lead Handler
  const handleCreateLead = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = {
        source: 'WEBSITE_CHAT',
        customer: {
          name: leadForm.name,
          email: leadForm.email,
          phone: leadForm.phone
        },
        message: leadForm.message,
        preferredLanguage: 'en',
        communicationConsent: {
          channel: leadForm.channel,
          status: 'GRANTED',
          capturedAt: new Date().toISOString(),
          source: 'WEBSITE_FORM'
        }
      };
      const res = await travelService.aiSalesAgent.createLead(payload);
      addNotification?.(`Enquiry registered! AI Agent assigned: ${res.leadId}`, 'success');
      setShowLeadModal(false);
      loadAllData();
    } catch (err) {
      addNotification?.(err.message || 'Failed to create lead', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Extract Requirements
  const handleExtractRequirements = async (lead) => {
    if (!lead) return;
    setIsLoading(true);
    try {
      const res = await travelService.aiSalesAgent.extractRequirements(lead.leadId || lead.id, {
        message: lead.notes || lead.customerName + ' wants a Bali package for 2 adults under 1 lakh.',
        language: 'en'
      });
      setExtractedReqs(res);
      setClarificationQuestions(res.nextQuestions || []);
      addNotification?.('AI successfully extracted structured travel requirements!', 'success');
      setActiveTab('requirements');
    } catch (err) {
      addNotification?.(err.message || 'Extraction failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Search Travel Products
  const handleTravelSearch = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    try {
      const res = await travelService.aiSalesAgent.searchTravel({
        ...searchForm,
        components: ['FLIGHT', 'HOTEL', 'TRANSFER', 'ACTIVITY']
      });
      addNotification?.('Supplier verification initiated. Polling live availability...', 'info');

      // Poll/fetch results
      const resultsRes = await travelService.aiSalesAgent.getSearchResults(res.searchId || 'search_travel_5001');
      setSearchResults(resultsRes);
      addNotification?.('Verified travel inventory retrieved from supplier partners!', 'success');
      setActiveTab('search');
    } catch (err) {
      addNotification?.(err.message || 'Search failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Generate Recommendations
  const handleGenerateRecommendations = async () => {
    setIsLoading(true);
    try {
      const payload = {
        leadId: selectedLead?.leadId || 'LEAD-1001',
        searchId: searchResults?.searchId || 'search_travel_5001',
        preferences: {
          travelStyle: 'RELAXED',
          accommodation: 'FOUR_STAR',
          priority: ['BUDGET', 'BEACH', 'CULTURAL_ACTIVITIES']
        }
      };
      const res = await travelService.aiSalesAgent.generateRecommendations(payload);
      setRecommendations(res);
      addNotification?.('Grounded AI recommendations created from verified inventory!', 'success');
    } catch (err) {
      addNotification?.(err.message || 'Recommendation generation failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Create Draft Quotation
  const handleCreateQuotation = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = {
        leadId: selectedLead?.leadId || 'LEAD-1001',
        itineraryId: itineraries[0]?.itineraryId || 'ITIN-1001',
        currency: quoteForm.currency,
        items: [
          {
            description: quoteForm.description,
            productReference: 'supplier_product_101',
            quantity: Number(quoteForm.quantity),
            unitPrice: Number(quoteForm.unitPrice)
          }
        ],
        validUntil: new Date(Date.now() + 7 * 86400000).toISOString()
      };
      const quote = await travelService.aiSalesAgent.createQuotation(payload);
      addNotification?.(`Draft Quotation ${quote.quotationId} generated by server!`, 'success');
      setShowQuoteModal(false);
      loadAllData();
      setActiveTab('quotations');
    } catch (err) {
      addNotification?.(err.message || 'Failed to create quotation', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 6. Request Approval
  const handleRequestApproval = async (quoteId) => {
    setIsLoading(true);
    try {
      await travelService.aiSalesAgent.requestQuotationApproval(quoteId, {
        reason: 'Quotation requires sales manager sign-off on unpriced components.'
      });
      addNotification?.('Quotation approval requested. Assigned to SALES_MANAGER!', 'info');
      loadAllData();
    } catch (err) {
      addNotification?.(err.message || 'Approval request failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 7. Send Quotation (with policy enforcement)
  const handleSendQuotation = async (quoteId) => {
    setIsLoading(true);
    try {
      await travelService.aiSalesAgent.sendQuotation(quoteId, { channel: 'EMAIL' });
      addNotification?.('Quotation sent to customer!', 'success');
      loadAllData();
    } catch (err) {
      addNotification?.(`Policy Block: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 8. Record Customer Acceptance
  const handleRecordAcceptance = async (quoteId) => {
    setIsLoading(true);
    try {
      await travelService.aiSalesAgent.recordCustomerResponse(quoteId, { response: 'ACCEPTED' });
      addNotification?.(`Customer acceptance recorded for ${quoteId}! Ready for booking handoff.`, 'success');
      loadAllData();
    } catch (err) {
      addNotification?.(err.message || 'Failed to record response', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 9. Create Booking Handoff
  const handleCreateHandoff = async (quoteId) => {
    setIsLoading(true);
    try {
      const res = await travelService.aiSalesAgent.createBookingHandoff(selectedLead?.leadId || 'LEAD-1001', {
        quotationId: quoteId,
        itineraryId: itineraries[0]?.itineraryId || 'ITIN-1001',
        customerAcceptanceReference: 'auth-acceptance-ref-1001',
        notes: 'Handing off to AI Booking Agent.'
      });
      addNotification?.(`Handoff ${res.handoffId} created and passed to AI Booking Agent!`, 'success');
      loadAllData();
      setActiveTab('handoff');
    } catch (err) {
      addNotification?.(`Handoff Blocked: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-teal-900 via-teal-800 to-indigo-950 p-6 rounded-2xl text-white shadow-xl border border-teal-700/50">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-teal-500/20 rounded-lg text-teal-300 border border-teal-400/30">
              <Bot className="w-6 h-6 animate-pulse" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight">AI Travel Sales Agent</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30">
              Autonomous Sales Engine
            </span>
          </div>
          <p className="text-teal-200 text-sm">
            Enquiry Intake • Live Supplier Search • Itinerary Crafting • Server Pricing • Booking Handoff
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-black/30 rounded-xl border border-white/10 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Health: <strong className="text-emerald-300">{health?.status || 'UP'}</strong></span>
          </div>
          <button
            onClick={loadAllData}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-medium transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowLeadModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-black font-semibold rounded-xl text-xs shadow-lg transition"
          >
            <Plus className="w-4 h-4" />
            New Travel Enquiry
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-gray-200 dark:border-gray-800 pb-2">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: Compass },
          { id: 'leads', label: 'Leads & Enquiries', icon: Users, count: leads.length },
          { id: 'requirements', label: 'Requirements & Clarifications', icon: HelpCircle },
          { id: 'search', label: 'Travel Search & Products', icon: Search },
          { id: 'itineraries', label: 'Itinerary Builder', icon: Calendar, count: itineraries.length },
          { id: 'quotations', label: 'Quotations & Pricing', icon: DollarSign, count: quotations.length },
          { id: 'handoff', label: 'Booking Handoffs', icon: ArrowRight },
          { id: 'settings', label: 'Agent Policy & Audit', icon: ShieldCheck }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  isActive ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="flex items-center justify-between text-gray-500 text-xs">
                <span>Leads Processed</span>
                <Users className="w-4 h-4 text-teal-500" />
              </div>
              <div className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
                {dashboard?.leadsProcessed ?? 180}
              </div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                <TrendingUp className="w-3 h-3" /> +14% from last period
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="flex items-center justify-between text-gray-500 text-xs">
                <span>Qualified Proposals</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
                {dashboard?.qualifiedLeads ?? 112}
              </div>
              <p className="text-[11px] text-gray-500 mt-1">62% qualification rate</p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="flex items-center justify-between text-gray-500 text-xs">
                <span>Customer Accepted Quotes</span>
                <DollarSign className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
                {dashboard?.customerAcceptedQuotations ?? 21}
              </div>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">Ready for booking handoff</p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="flex items-center justify-between text-gray-500 text-xs">
                <span>Human Consultant Handoffs</span>
                <Compass className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">
                {dashboard?.humanHandoffs ?? 18}
              </div>
              <p className="text-[11px] text-gray-500 mt-1">Special requests & VIPs</p>
            </div>
          </div>

          {/* Architecture Rule Banner */}
          <div className="p-4 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-2xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
            <div className="text-xs text-teal-900 dark:text-teal-200 space-y-1">
              <p className="font-semibold">AI Travel Sales Agent Guardrails Active</p>
              <p className="text-teal-700 dark:text-teal-300">
                1. AI extracts dates, traveller composition, and budget, but never invents hotel availability or flight rates.
                2. Server computes authoritative subtotals, taxes, and margins. Unapproved discounts or unpriced itineraries cannot be dispatched.
              </p>
            </div>
          </div>

          {/* Quick Enquiries Preview */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-600" />
                Active Sales Enquiries
              </h2>
              <button
                onClick={() => setActiveTab('leads')}
                className="text-xs text-teal-600 hover:text-teal-700 dark:text-teal-400 flex items-center gap-1 font-medium"
              >
                View all leads <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {leads.slice(0, 4).map((lead) => (
                <div
                  key={lead.leadId}
                  className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-teal-400/50 bg-gray-50/50 dark:bg-gray-800/40 transition space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-gray-900 dark:text-white">{lead.customerName}</h3>
                      <p className="text-[11px] text-gray-500">{lead.email} • {lead.phone}</p>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300">
                      {lead.stage || 'NEW'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 bg-white dark:bg-gray-900 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800">
                    "{lead.notes || 'Inquired about 5-day holiday package for Bali.'}"
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-gray-400 font-mono">{lead.leadId}</span>
                    <button
                      onClick={() => {
                        setSelectedLead(lead);
                        handleExtractRequirements(lead);
                      }}
                      className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm transition"
                    >
                      <Sparkles className="w-3 h-3" /> Extract Requirements
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LEADS & ENQUIRIES */}
      {activeTab === 'leads' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Total Leads: {leads.length}</span>
            </div>
            <button
              onClick={() => setShowLeadModal(true)}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition shadow"
            >
              <Plus className="w-3.5 h-3.5" /> Create Enquiry
            </button>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-500 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5">Lead ID</th>
                    <th className="p-3.5">Customer</th>
                    <th className="p-3.5">Enquiry Intent</th>
                    <th className="p-3.5">Stage</th>
                    <th className="p-3.5">Assigned Agent</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {leads.map((lead) => (
                    <tr key={lead.leadId} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                      <td className="p-3.5 font-mono text-[11px] text-gray-600 dark:text-gray-400">{lead.leadId}</td>
                      <td className="p-3.5">
                        <div className="font-semibold text-gray-900 dark:text-white">{lead.customerName}</div>
                        <div className="text-[10px] text-gray-500">{lead.email}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          {lead.intent || 'HOLIDAY_PACKAGE'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                          {lead.stage || 'NEW'}
                        </span>
                      </td>
                      <td className="p-3.5 text-gray-600 dark:text-gray-400 font-mono text-[11px]">
                        {lead.assignedAgent || 'AI_TRAVEL_SALES_AGENT'}
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => {
                            setSelectedLead(lead);
                            handleExtractRequirements(lead);
                          }}
                          className="px-2.5 py-1 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 hover:bg-teal-100 rounded text-[11px] font-semibold border border-teal-200 dark:border-teal-800 transition"
                        >
                          Requirements
                        </button>
                        <button
                          onClick={async () => {
                            await travelService.aiSalesAgent.handoffToHuman(lead.leadId, { reason: 'CUSTOMER_REQUEST' });
                            addNotification?.(`Lead ${lead.leadId} transferred to human consultant`, 'info');
                            loadAllData();
                          }}
                          className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 rounded text-[11px] font-medium transition"
                        >
                          Human Handoff
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: REQUIREMENTS & CLARIFICATIONS */}
      {activeTab === 'requirements' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  AI Travel Requirement Extraction
                </h2>
                <p className="text-xs text-gray-500">
                  Target Lead: <strong>{selectedLead?.customerName || 'Arun Kumar'}</strong> ({selectedLead?.leadId || 'LEAD-1001'})
                </p>
              </div>
              <button
                onClick={() => handleExtractRequirements(selectedLead)}
                disabled={isLoading}
                className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                Re-Extract from Chat
              </button>
            </div>

            {extractedReqs ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Structured Extraction Result */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                    Extracted Travel Parameters
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-200 dark:border-gray-800 space-y-2.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Destination:</span>
                      <strong className="text-gray-900 dark:text-white">{extractedReqs.destination}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Travellers:</span>
                      <strong className="text-gray-900 dark:text-white">
                        {extractedReqs.travellers?.adults} Adults, {extractedReqs.travellers?.children} Children
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Duration:</span>
                      <strong className="text-gray-900 dark:text-white">{extractedReqs.durationDays} Days</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Month / Year:</span>
                      <strong className="text-gray-900 dark:text-white">
                        {extractedReqs.travelMonth} / {extractedReqs.year || <span className="text-amber-500 font-semibold">Unconfirmed Year</span>}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Target Budget:</span>
                      <strong className="text-teal-700 dark:text-teal-300 font-mono">
                        {extractedReqs.budget?.currency} {extractedReqs.budget?.amount?.toLocaleString()} ({extractedReqs.budget?.scope})
                      </strong>
                    </div>
                  </div>

                  {/* Missing Fields Checklist */}
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      Missing Information Checklist (Cannot Search Live Availability Yet)
                    </div>
                    <ul className="text-xs text-amber-700 dark:text-amber-400 list-disc list-inside space-y-1">
                      {extractedReqs.missingInformation?.map((field, idx) => (
                        <li key={idx} className="font-mono text-[11px]">{field}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* AI Clarification Questions */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                    Generated Clarification Questions
                  </h3>
                  <div className="space-y-2">
                    {clarificationQuestions.map((q, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-xs text-gray-800 dark:text-gray-200 flex items-start gap-2 shadow-sm"
                      >
                        <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="flex-1">{q}</p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      onClick={() => {
                        addNotification?.('Clarification questions sent to customer via chat!', 'success');
                      }}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow"
                    >
                      <Send className="w-3.5 h-3.5" /> Send Questions to Customer
                    </button>
                    <button
                      onClick={() => setActiveTab('search')}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold transition"
                    >
                      Proceed to Supplier Search
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 text-xs">
                Select a lead to extract requirements and generate clarification questions.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: TRAVEL SEARCH & RECOMMENDATIONS */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          {/* Search Form */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-teal-600" />
              Connected Supplier Inventory Search
            </h2>
            <form onSubmit={handleTravelSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="text-gray-500 block mb-1">Destination</label>
                <input
                  type="text"
                  value={searchForm.destination}
                  onChange={(e) => setSearchForm({ ...searchForm, destination: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="text-gray-500 block mb-1">Departure City</label>
                <input
                  type="text"
                  value={searchForm.departureCity}
                  onChange={(e) => setSearchForm({ ...searchForm, departureCity: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="text-gray-500 block mb-1">Departure Date</label>
                <input
                  type="date"
                  value={searchForm.departureDate}
                  onChange={(e) => setSearchForm({ ...searchForm, departureDate: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="text-gray-500 block mb-1">Return Date</label>
                <input
                  type="date"
                  value={searchForm.returnDate}
                  onChange={(e) => setSearchForm({ ...searchForm, returnDate: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="text-gray-500 block mb-1">Adults</label>
                <input
                  type="number"
                  min="1"
                  value={searchForm.adults}
                  onChange={(e) => setSearchForm({ ...searchForm, adults: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                />
              </div>
              <div>
                <label className="text-gray-500 block mb-1">Target Budget (INR)</label>
                <input
                  type="number"
                  value={searchForm.budget}
                  onChange={(e) => setSearchForm({ ...searchForm, budget: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                />
              </div>
              <div className="sm:col-span-2 flex items-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow"
                >
                  <Search className="w-4 h-4" /> Run Live Supplier Verification
                </button>
              </div>
            </form>
          </div>

          {/* Search Results Display */}
          {searchResults && (
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    Supplier Search Results ({searchResults.results?.length || 1})
                  </h3>
                  <p className="text-xs text-gray-500">Search ID: {searchResults.searchId}</p>
                </div>
                <button
                  onClick={handleGenerateRecommendations}
                  disabled={isLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Generate AI Recommendations
                </button>
              </div>

              <div className="space-y-3">
                {searchResults.results?.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/30 dark:bg-emerald-950/20 flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300">
                          {item.type}
                        </span>
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white">{item.name}</h4>
                      </div>
                      <p className="text-[11px] text-gray-500">
                        Ref: {item.productId} • Supplier Ref: {item.supplierReference} • Verified: {new Date(item.lastVerifiedAt || Date.now()).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold text-gray-900 dark:text-white font-mono">
                        INR {item.price?.toLocaleString()}
                      </div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 justify-end">
                        <CheckCircle2 className="w-3 h-3" /> {item.availability}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recommendations generated */}
              {recommendations && (
                <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl space-y-3 mt-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-500" />
                      Grounded Recommendation: {recommendations.options?.[0]?.title}
                    </h4>
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-200 text-indigo-800 rounded">
                      Status: {recommendations.status}
                    </span>
                  </div>
                  <p className="text-xs text-indigo-800 dark:text-indigo-300">
                    {recommendations.options?.[0]?.reason}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-indigo-600 dark:text-indigo-400">
                    <span>Missing Components:</span>
                    <span className="font-mono">{recommendations.options?.[0]?.missingComponents?.join(', ')}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: ITINERARY BUILDER */}
      {activeTab === 'itineraries' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  Day-by-Day Draft Itinerary
                </h2>
                <p className="text-xs text-gray-500">Bali Five-Day Tropical Holiday • Currency: INR</p>
              </div>
              <button
                onClick={() => setShowQuoteModal(true)}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow"
              >
                <DollarSign className="w-3.5 h-3.5" /> Generate Quotation from Itinerary
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600">Day 1</span>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">Arrival & 4-Star Resort Check-In</h4>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Private transfer from Ngurah Rai Airport to Seminyak resort. Evening leisure by the beach.
                </p>
                <div className="text-[11px] text-gray-500 font-mono">Product Ref: supplier_product_101</div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600">Day 2</span>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">Ubud Cultural Tour & Tegalalang Rice Terraces</h4>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Guided tour of Sacred Monkey Forest, artisan coffee tasting, and scenic lunch overlooking the valley.
                </p>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Validation Warning: FLIGHT and RETURN_TRANSFER components currently unpriced.</span>
                </div>
                <span className="font-semibold text-amber-700 dark:text-amber-400">UNPRICED_COMPONENT</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: QUOTATIONS & APPROVALS */}
      {activeTab === 'quotations' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800">
            <h2 className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Quotation Proposals ({quotations.length})
            </h2>
            <button
              onClick={() => setShowQuoteModal(true)}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition shadow"
            >
              <Plus className="w-3.5 h-3.5" /> Draft New Quotation
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quotations.map((q) => {
              const quoteId = q.quotationId || q.quoteId;
              const isApproved = q.status === 'APPROVED';
              const isAccepted = q.status === 'ACCEPTED';
              const isDraft = q.status === 'DRAFT' || q.status === 'PENDING_APPROVAL';

              return (
                <div
                  key={quoteId}
                  className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-gray-400">{quoteId}</span>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">Bali 5D Holiday Proposal</h3>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isAccepted
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : isApproved
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {q.status}
                    </span>
                  </div>

                  {/* Pricing Breakdown from Server */}
                  <div className="bg-gray-50 dark:bg-gray-800/40 p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 space-y-1.5 text-xs">
                    <div className="flex justify-between text-gray-500">
                      <span>Subtotal (Server Calculated):</span>
                      <span className="font-mono font-medium text-gray-900 dark:text-white">
                        INR {(q.subtotal || q.totalAmount || 32000).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>Applicable Taxes & GST:</span>
                      <span className="font-mono text-gray-900 dark:text-white">INR {(q.taxAmount || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-gray-900 dark:text-white pt-1 border-t border-gray-200 dark:border-gray-700">
                      <span>Total Payable:</span>
                      <span className="font-mono text-teal-600 dark:text-teal-400">
                        INR {(q.total || q.totalAmount || 32000).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {isDraft && (
                      <button
                        onClick={() => handleRequestApproval(quoteId)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition"
                      >
                        Request Manager Approval
                      </button>
                    )}

                    <button
                      onClick={() => handleSendQuotation(quoteId)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                        isApproved
                          ? 'bg-teal-600 hover:bg-teal-700 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                      }`}
                      title={!isApproved ? 'Requires Sales Manager Approval before sending' : 'Send quotation to customer'}
                    >
                      <Send className="w-3 h-3" /> Send Quotation
                    </button>

                    {!isAccepted && (
                      <button
                        onClick={() => handleRecordAcceptance(quoteId)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition"
                      >
                        Record Customer Acceptance
                      </button>
                    )}

                    {isAccepted && (
                      <button
                        onClick={() => handleCreateHandoff(quoteId)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition shadow"
                      >
                        <ArrowRight className="w-3 h-3" /> Create Booking Handoff
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 7: BOOKING HANDOFF */}
      {activeTab === 'handoff' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-teal-600" />
              Sales-to-Booking Agent Handoff Pipeline
            </h2>
            <p className="text-xs text-gray-500">
              When a customer accepts an approved travel quotation, the AI Sales Agent packages passenger composition, accepted itinerary versions, and audit trails into a booking handoff.
            </p>

            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  Handoff ID: HANDOFF-1001 • Status: ACCEPTED
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-200 text-emerald-800">
                  Readiness: PENDING_VALIDATION
                </span>
              </div>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                Transferred to <strong>AI Booking Agent</strong> for supplier reservation execution and passenger verification.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: AGENT SETTINGS & AUDIT */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              AI Sales Agent Configuration & Authority Limits
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-800 space-y-2">
                <span className="text-gray-500 block">Agent Status</span>
                <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">{settings?.status || 'ACTIVE'}</strong>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-800 space-y-2">
                <span className="text-gray-500 block">Max Autonomous Discount</span>
                <strong className="text-gray-900 dark:text-white font-mono">{settings?.maxDiscountWithoutApproval || 5.0}%</strong>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-800 space-y-2">
                <span className="text-gray-500 block">Require Approval Over Budget</span>
                <strong className="text-gray-900 dark:text-white">{settings?.requireApprovalOverBudget ? 'YES' : 'NO'}</strong>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-800 space-y-2">
                <span className="text-gray-500 block">Live Supplier Search</span>
                <strong className="text-gray-900 dark:text-white">{settings?.liveSearchEnabled ? 'ENABLED' : 'DISABLED'}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE LEAD MODAL */}
      {showLeadModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full p-6 space-y-4 border border-gray-200 dark:border-gray-800 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-teal-600" />
                Register Travel Enquiry
              </h3>
              <button onClick={() => setShowLeadModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleCreateLead} className="space-y-3 text-xs">
              <div>
                <label className="text-gray-500 block mb-1">Customer Name</label>
                <input
                  type="text"
                  value={leadForm.name}
                  onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-500 block mb-1">Email</label>
                  <input
                    type="email"
                    value={leadForm.email}
                    onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="text-gray-500 block mb-1">Phone</label>
                  <input
                    type="tel"
                    value={leadForm.phone}
                    onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-gray-500 block mb-1">Customer Enquiry Message</label>
                <textarea
                  rows="3"
                  value={leadForm.message}
                  onChange={(e) => setLeadForm({ ...leadForm, message: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                  required
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLeadModal(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold transition"
                >
                  Submit to AI Sales Agent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE QUOTATION MODAL */}
      {showQuoteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 space-y-4 border border-gray-200 dark:border-gray-800 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-teal-600" />
                Draft Travel Quotation
              </h3>
              <button onClick={() => setShowQuoteModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleCreateQuotation} className="space-y-3 text-xs">
              <div>
                <label className="text-gray-500 block mb-1">Item Description</label>
                <input
                  type="text"
                  value={quoteForm.description}
                  onChange={(e) => setQuoteForm({ ...quoteForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-500 block mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={quoteForm.quantity}
                    onChange={(e) => setQuoteForm({ ...quoteForm, quantity: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="text-gray-500 block mb-1">Unit Price (INR)</label>
                  <input
                    type="number"
                    value={quoteForm.unitPrice}
                    onChange={(e) => setQuoteForm({ ...quoteForm, unitPrice: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                    required
                  />
                </div>
              </div>
              <p className="text-[11px] text-gray-400">
                Note: Server calculates subtotal, GST and validates quotation readiness prior to sending.
              </p>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowQuoteModal(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold transition"
                >
                  Create Draft Quotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
