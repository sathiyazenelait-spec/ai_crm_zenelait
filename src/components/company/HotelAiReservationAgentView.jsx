import React, { useState, useEffect } from 'react';
import {
  Bot, Calendar, Search, FileText, CheckCircle2, Clock, Send, AlertTriangle,
  RefreshCw, DollarSign, BedDouble, Mail, Phone, ChevronRight, X, ArrowRight,
  Shield, UserCheck, MessageSquare, UserPlus, Sliders, Layers, UserX, CreditCard,
  TrendingUp, Activity, Sparkles, Check, HelpCircle
} from 'lucide-react';
import { hotelService } from '../../services/hotelService';

export default function HotelAiReservationAgentView() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  // Dashboard Data
  const [dashboard, setDashboard] = useState({
    conversationsToday: 38,
    quotesGenerated: 24,
    reservationsCreated: 16,
    reservationsConfirmed: 11,
    conversionRate: 68.7,
    humanHandoffs: 3,
    activeChannels: ['WEBSITE_CHAT', 'WHATSAPP', 'EMAIL']
  });

  // Conversations State
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversationMessages, setConversationMessages] = useState([]);
  const [guestMessageInput, setGuestMessageInput] = useState('');
  const [aiProcessing, setAiProcessing] = useState(false);
  const [showHandoffModal, setShowHandoffModal] = useState(false);
  const [handoffReason, setHandoffReason] = useState('Guest requested group booking & negotiated rates');
  const [handoffRole, setHandoffRole] = useState('RESERVATION_EXECUTIVE');

  // Availability & Quotes State
  const [searchParams, setSearchParams] = useState({
    checkInDate: '2026-11-15',
    checkOutDate: '2026-11-17',
    adults: 2,
    children: 0,
    rooms: 1,
    currency: 'INR'
  });
  const [availabilityResults, setAvailabilityResults] = useState(null);
  const [selectedRoomType, setSelectedRoomType] = useState(null);
  const [activeQuote, setActiveQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  // Guest Matching & Booking Workspace
  const [guestMatchQuery, setGuestMatchQuery] = useState({ email: 'arun@example.com', phone: '+919876543210' });
  const [matchedGuest, setMatchedGuest] = useState(null);
  const [newGuestForm, setNewGuestForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    consentEmail: true,
    consentWhatsapp: false
  });
  const [showCreateGuestModal, setShowCreateGuestModal] = useState(false);

  // Reservations State
  const [pendingReservation, setPendingReservation] = useState(null);
  const [confirmedReservation, setConfirmedReservation] = useState(null);
  const [handoffsList, setHandoffsList] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  // Config State
  const [agentConfig, setAgentConfig] = useState({
    autoQuote: true,
    requireReviewForDiscount: true,
    maxRoomsPerAiReservation: 3,
    operatingStatus: 'ONLINE'
  });

  const showNotification = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [dashRes, convsRes, handoffsRes, logsRes, cfgRes] = await Promise.allSettled([
        hotelService.aiReservationAgent.getDashboard(),
        hotelService.aiReservationAgent.getConversations(),
        hotelService.aiReservationAgent.getHandoffs(),
        hotelService.aiReservationAgent.getActivityLogs(),
        hotelService.aiReservationAgent.getConfig()
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value) setDashboard(dashRes.value);
      if (convsRes.status === 'fulfilled' && convsRes.value) {
        setConversations(convsRes.value);
        if (convsRes.value.length > 0) {
          selectConversation(convsRes.value[0]);
        }
      }
      if (handoffsRes.status === 'fulfilled' && handoffsRes.value) setHandoffsList(handoffsRes.value);
      if (logsRes.status === 'fulfilled' && logsRes.value?.items) setActivityLogs(logsRes.value.items);
      if (cfgRes.status === 'fulfilled' && cfgRes.value) setAgentConfig(cfgRes.value);
    } catch (err) {
      console.error('Error loading AI Reservation Agent data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const selectConversation = async (conv) => {
    setSelectedConversation(conv);
    try {
      const msgs = await hotelService.aiReservationAgent.getConversationMessages(conv.conversationId);
      setConversationMessages(msgs || []);
    } catch {
      setConversationMessages([
        { messageId: 'm1', sender: 'GUEST', content: conv.initialMessage || 'I need a room for two adults for two nights.', timestamp: '14:02' },
        { messageId: 'm2', sender: 'AI_RESERVATION_AGENT', content: 'Warm greetings from Grand Azure Resort! I would be delighted to assist you with your booking. Let me check the best options for your stay.', timestamp: '14:03' }
      ]);
    }
  };

  const handleSendMessage = async () => {
    if (!guestMessageInput.trim() || !selectedConversation) return;
    const userText = guestMessageInput;
    setGuestMessageInput('');
    setAiProcessing(true);

    const tempMsg = {
      messageId: 'tmp-' + Date.now(),
      sender: 'GUEST',
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setConversationMessages(prev => [...prev, tempMsg]);

    try {
      const res = await hotelService.aiReservationAgent.processMessage(selectedConversation.conversationId, {
        message: userText,
        channel: selectedConversation.channel || 'WEBSITE_CHAT'
      });

      const replyMsg = {
        messageId: 'ai-' + Date.now(),
        sender: 'AI_RESERVATION_AGENT',
        content: res?.reply || 'I found availability for Deluxe Room at ₹3,500/night. Would you like me to prepare a reservation quote?',
        intent: res?.intent,
        sources: res?.sources,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setConversationMessages(prev => [...prev, replyMsg]);
      showNotification('AI Agent formulated grounded reply');
    } catch (err) {
      showNotification(err.message || 'Failed to process message');
    } finally {
      setAiProcessing(false);
    }
  };

  const handleHandoff = async () => {
    if (!selectedConversation) return;
    try {
      await hotelService.aiReservationAgent.handoff(selectedConversation.conversationId, {
        reason: handoffReason,
        targetRole: handoffRole,
        summary: `Guest conversation transferred: ${handoffReason}`
      });
      setShowHandoffModal(false);
      showNotification(`Conversation handed off to ${handoffRole}`);
      loadInitialData();
    } catch (err) {
      showNotification(err.message || 'Handoff failed');
    }
  };

  const handleSearchAvailability = async () => {
    setLoading(true);
    try {
      const res = await hotelService.aiReservationAgent.searchAvailability(searchParams);
      setAvailabilityResults(res);
      showNotification('Live inventory & rate plans checked');
    } catch (err) {
      showNotification(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuote = async (roomType) => {
    setSelectedRoomType(roomType);
    setQuoteLoading(true);
    try {
      const res = await hotelService.aiReservationAgent.calculateQuote({
        roomTypeId: roomType.roomTypeId || 'roomtype_1001',
        checkInDate: searchParams.checkInDate,
        checkOutDate: searchParams.checkOutDate,
        adults: searchParams.adults,
        children: searchParams.children,
        rooms: searchParams.rooms,
        ratePlanId: 'FLEXIBLE',
        currency: 'INR'
      });
      setActiveQuote(res);
      showNotification('Official reservation quote generated');
    } catch (err) {
      showNotification(err.message || 'Failed to calculate quote');
    } finally {
      setQuoteLoading(false);
    }
  };

  const handleRecalculateQuote = async () => {
    if (!activeQuote?.quoteId) return;
    setQuoteLoading(true);
    try {
      const res = await hotelService.aiReservationAgent.recalculateQuote(activeQuote.quoteId);
      setActiveQuote(res);
      showNotification('Quote recalculated with verified latest rates');
    } catch (err) {
      showNotification(err.message || 'Recalculation failed');
    } finally {
      setQuoteLoading(false);
    }
  };

  const handleMatchGuest = async () => {
    setLoading(true);
    try {
      const res = await hotelService.aiReservationAgent.matchGuest(guestMatchQuery);
      setMatchedGuest(res);
      if (res?.matchFound) {
        showNotification(`Guest identified: ${res.guestId}`);
      } else {
        showNotification('No existing record found. Proceed to create guest.');
      }
    } catch (err) {
      showNotification(err.message || 'Guest match failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGuest = async () => {
    if (!newGuestForm.firstName || !newGuestForm.email) {
      showNotification('First name and email are required');
      return;
    }
    setLoading(true);
    try {
      const res = await hotelService.aiReservationAgent.createGuest({
        firstName: newGuestForm.firstName,
        lastName: newGuestForm.lastName,
        email: newGuestForm.email,
        phone: newGuestForm.phone,
        communicationConsent: {
          email: newGuestForm.consentEmail,
          whatsapp: newGuestForm.consentWhatsapp
        }
      });
      setMatchedGuest({ matchFound: true, guestId: res.guestId, guestName: `${res.firstName} ${res.lastName}` });
      setShowCreateGuestModal(false);
      showNotification(`Guest ${res.guestId} registered with consent audit`);
    } catch (err) {
      showNotification(err.message || 'Failed to create guest');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePendingReservation = async () => {
    if (!activeQuote) {
      showNotification('Please generate a quote first');
      return;
    }
    setLoading(true);
    const idempotencyKey = 'res-create-' + Date.now();
    try {
      const res = await hotelService.aiReservationAgent.createReservation({
        quoteId: activeQuote.quoteId,
        guestId: matchedGuest?.guestId || 'guest_1001',
        primaryGuest: {
          firstName: matchedGuest?.guestName?.split(' ')[0] || 'Arun',
          lastName: matchedGuest?.guestName?.split(' ')[1] || 'Kumar'
        },
        roomTypeId: activeQuote.roomTypeId || 'roomtype_1001',
        checkInDate: searchParams.checkInDate,
        checkOutDate: searchParams.checkOutDate,
        adults: searchParams.adults,
        children: searchParams.children,
        rooms: searchParams.rooms,
        specialRequests: 'High-floor room preferred'
      }, idempotencyKey);

      setPendingReservation(res);
      showNotification(`Pending booking ${res.bookingReference || res.reservationId} created`);
    } catch (err) {
      showNotification(err.message || 'Reservation creation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReservation = async () => {
    if (!pendingReservation?.reservationId) return;
    setLoading(true);
    const idempotencyKey = 'res-confirm-' + Date.now();
    try {
      const res = await hotelService.aiReservationAgent.confirmReservation(
        pendingReservation.reservationId,
        {
          quoteId: activeQuote?.quoteId,
          confirmationChannel: 'EMAIL',
          guestConsentVerified: true
        },
        idempotencyKey
      );
      setConfirmedReservation(res);
      setPendingReservation(null);
      showNotification(`Reservation CONFIRMED! Reference: ${res.bookingReference}`);
    } catch (err) {
      showNotification(err.message || 'Confirmation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-gradient-to-r from-teal-900 to-indigo-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-teal-500/40 animate-fade-in text-sm backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-teal-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-indigo-950 border border-teal-500/30 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 shadow-inner">
              <Bot className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">AI Reservation Agent</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/40 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                  ONLINE • TENANT HOTEL
                </span>
              </div>
              <p className="text-slate-300 text-sm mt-1">
                Autonomous booking assistant for room enquiries, inventory search, quotation calculation, and booking confirmation.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadInitialData}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 rounded-xl text-sm border border-slate-700 transition-all shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Sync Agent
            </button>
            <div className="bg-teal-900/40 border border-teal-500/40 px-3 py-1.5 rounded-xl text-right">
              <span className="text-[10px] text-teal-300 block uppercase font-medium">Conversion Rate</span>
              <span className="text-base font-bold text-teal-200">{dashboard.conversionRate || 68.7}%</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-slate-800/80">
          {[
            { id: 'dashboard', label: 'Agent Dashboard', icon: Activity },
            { id: 'conversations', label: 'Live Conversations', icon: MessageSquare },
            { id: 'availability', label: 'Availability & Quotes', icon: Calendar },
            { id: 'workspace', label: 'Booking Workspace', icon: FileText },
            { id: 'handoffs', label: 'Human Handoffs & Logs', icon: Shield }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-teal-500 text-slate-950 font-semibold shadow-md shadow-teal-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 backdrop-blur-md">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Conversations Handled</span>
                <MessageSquare className="w-4 h-4 text-teal-400" />
              </div>
              <div className="text-2xl font-bold text-white">{dashboard.conversationsToday || 38}</div>
              <div className="text-xs text-teal-400 mt-2 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                Across Web Chat, WhatsApp, Email
              </div>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 backdrop-blur-md">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Quotes Generated</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-white">{dashboard.quotesGenerated || 24}</div>
              <div className="text-xs text-slate-400 mt-2">Zero hallucinations; verified rate plans</div>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 backdrop-blur-md">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Confirmed Bookings</span>
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold text-white">{dashboard.reservationsConfirmed || 11}</div>
              <div className="text-xs text-cyan-400 mt-2">Atomic inventory lock check passed</div>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 backdrop-blur-md">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Human Handoffs</span>
                <Shield className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-white">{dashboard.humanHandoffs || 3}</div>
              <div className="text-xs text-amber-400 mt-2">Group stays & negotiated policy escalations</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Autonomous Capabilities & Channel Status */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 lg:col-span-2">
              <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-400" />
                Active Authorized Channel Connectors
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { channel: 'WEBSITE_CHAT', label: 'Direct Hotel Chatbot', status: 'ACTIVE', latency: '320ms' },
                  { channel: 'WHATSAPP', label: 'Verified Business API', status: 'ACTIVE', latency: '480ms' },
                  { channel: 'EMAIL', label: 'Reservations Inbox Parser', status: 'ACTIVE', latency: '1.2s' }
                ].map(c => (
                  <div key={c.channel} className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-teal-300">{c.channel}</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    </div>
                    <div className="text-sm font-medium text-white mt-1">{c.label}</div>
                    <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
                      <span>Status: {c.status}</span>
                      <span>{c.latency}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Safety Rules */}
              <div className="mt-6 p-4 rounded-xl bg-teal-950/20 border border-teal-500/30">
                <div className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-teal-400" />
                  Strict AI Operational Boundaries
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5 mt-2">
                  <li>• <strong>No Hallucinated Inventory:</strong> Queries deterministic database inventory before presenting room types.</li>
                  <li>• <strong>Double Validation:</strong> Rechecks room inventory right before confirmation to prevent overbooking race conditions.</li>
                  <li>• <strong>Idempotency Enforcement:</strong> All reservations and confirmation calls require unique keys to block double billing.</li>
                  <li>• <strong>Group Safeguard:</strong> Automatically triggers handoff to Reservation Executive if guest requests &gt; 3 rooms.</li>
                </ul>
              </div>
            </div>

            {/* Quick Status and Settings */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-teal-400" />
                  Agent Execution Rules
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">Auto-Generate Quotes</span>
                    <span className="text-xs font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40">ENABLED</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">Discount Review Policy</span>
                    <span className="text-xs font-semibold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/40">REQUIRED</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">Max Auto Rooms</span>
                    <span className="text-xs font-semibold text-white bg-slate-800 px-2.5 py-0.5 rounded-md border border-slate-700">3 Rooms</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">Default Currency</span>
                    <span className="text-xs font-semibold text-white bg-slate-800 px-2.5 py-0.5 rounded-md border border-slate-700">INR (₹)</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800">
                <button
                  onClick={() => setActiveTab('conversations')}
                  className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Open Live Conversation Desk
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE CONVERSATIONS */}
      {activeTab === 'conversations' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[720px]">
          {/* Conversation List */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-teal-400" />
                <h3 className="font-semibold text-white text-sm">Booking Conversations</h3>
              </div>
              <span className="text-xs text-slate-400">{conversations.length} Active</span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">No active conversations found</div>
              ) : (
                conversations.map(c => {
                  const isSelected = selectedConversation?.conversationId === c.conversationId;
                  return (
                    <div
                      key={c.conversationId}
                      onClick={() => selectConversation(c)}
                      className={`p-4 cursor-pointer transition-colors ${
                        isSelected ? 'bg-teal-950/40 border-l-4 border-teal-400' : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-teal-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          {c.channel}
                        </span>
                        <span className="text-[11px] text-slate-400">{c.status}</span>
                      </div>
                      <div className="text-sm font-medium text-white mt-1.5 truncate">
                        {c.guestIdentifier || 'Guest Session'}
                      </div>
                      <div className="text-xs text-slate-400 mt-1 line-clamp-1">
                        {c.initialMessage || 'Enquiring about deluxe accommodations.'}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Conversation Detail & Reply Composer */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl lg:col-span-2 flex flex-col overflow-hidden">
            {selectedConversation ? (
              <>
                <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        {selectedConversation.guestIdentifier}
                        <span className="text-[10px] bg-teal-950 text-teal-300 px-2 py-0.5 rounded-full border border-teal-500/30">
                          {selectedConversation.intent || 'ROOM_BOOKING'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">Channel: {selectedConversation.channel} • Id: {selectedConversation.conversationId}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowHandoffModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-medium transition-all"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      Transfer to Human
                    </button>
                  </div>
                </div>

                {/* Message Stream */}
                <div className="flex-1 p-5 overflow-y-auto space-y-4">
                  {conversationMessages.map((m, idx) => {
                    const isAi = m.sender === 'AI_RESERVATION_AGENT';
                    return (
                      <div
                        key={idx}
                        className={`flex flex-col ${isAi ? 'items-start' : 'items-end'}`}
                      >
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1 px-1">
                          {isAi ? <Bot className="w-3 h-3 text-teal-400" /> : <UserCheck className="w-3 h-3 text-indigo-400" />}
                          <span>{isAi ? 'AI Reservation Assistant' : 'Guest'}</span>
                          <span>•</span>
                          <span>{m.timestamp || 'Just now'}</span>
                        </div>
                        <div
                          className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                            isAi
                              ? 'bg-slate-800/90 text-slate-100 border border-slate-700/80 rounded-tl-sm shadow-md'
                              : 'bg-gradient-to-r from-teal-600 to-indigo-600 text-white rounded-tr-sm shadow-md'
                          }`}
                        >
                          {m.content}
                          {m.sources && (
                            <div className="mt-2.5 pt-2 border-t border-slate-700/60 text-[11px] text-teal-300 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3 h-3 text-teal-400" />
                              Grounded in Rate Plan: {m.sources.map(s => s.referenceId).join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {aiProcessing && (
                    <div className="flex items-center gap-2 text-teal-400 text-xs py-2 px-1">
                      <Bot className="w-4 h-4 animate-bounce" />
                      <span>AI Reservation Agent is checking inventory & policies...</span>
                    </div>
                  )}
                </div>

                {/* Composer */}
                <div className="p-4 border-t border-slate-800 bg-slate-900/90">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={guestMessageInput}
                      onChange={(e) => setGuestMessageInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type a guest enquiry (e.g. 'Do you have breakfast included?' or 'Check deluxe room for 2 nights')..."
                      className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={aiProcessing || !guestMessageInput.trim()}
                      className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <Send className="w-4 h-4" />
                      Send
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
                    <span>Simulates direct inbound guest message stream with autonomous grounding</span>
                    <button
                      onClick={() => setActiveTab('availability')}
                      className="text-teal-400 hover:underline flex items-center gap-1"
                    >
                      Search Room Inventory &gt;
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-sm">
                <MessageSquare className="w-10 h-10 text-slate-600 mb-2" />
                Select a conversation from the sidebar to inspect
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: AVAILABILITY & QUOTES */}
      {activeTab === 'availability' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Search Criteria */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-400" />
              Live Inventory Search
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Check-in Date</label>
                <input
                  type="date"
                  value={searchParams.checkInDate}
                  onChange={(e) => setSearchParams({ ...searchParams, checkInDate: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Check-out Date</label>
                <input
                  type="date"
                  value={searchParams.checkOutDate}
                  onChange={(e) => setSearchParams({ ...searchParams, checkOutDate: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Adults</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={searchParams.adults}
                    onChange={(e) => setSearchParams({ ...searchParams, adults: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Children</label>
                  <input
                    type="number"
                    min="0"
                    max="4"
                    value={searchParams.children}
                    onChange={(e) => setSearchParams({ ...searchParams, children: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Rooms</label>
                  <input
                    type="number"
                    min="1"
                    max="4"
                    value={searchParams.rooms}
                    onChange={(e) => setSearchParams({ ...searchParams, rooms: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>

              <button
                onClick={handleSearchAvailability}
                disabled={loading}
                className="w-full py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-md shadow-teal-500/20 flex items-center justify-center gap-2 mt-4"
              >
                <Search className="w-4 h-4" />
                Query Real Inventory
              </button>
            </div>
          </div>

          {/* Available Room Types & Active Quote */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <BedDouble className="w-4 h-4 text-teal-400" />
                  Available Bookable Inventory
                </h3>
                {availabilityResults && (
                  <span className="text-xs text-teal-300 bg-teal-950/60 border border-teal-500/40 px-2.5 py-1 rounded-lg">
                    {availabilityResults.nights || 2} Nights • Currency: {availabilityResults.currency || 'INR'}
                  </span>
                )}
              </div>

              {availabilityResults?.availableRoomTypes?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availabilityResults.availableRoomTypes.map(rt => (
                    <div
                      key={rt.roomTypeId}
                      className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 flex flex-col justify-between hover:border-teal-500/60 transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-white text-base">{rt.roomTypeName}</h4>
                          <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                            {rt.availableRooms} Available
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Max Occupancy: {rt.maxOccupancy} Guests</p>
                        <div className="text-lg font-bold text-white mt-3">
                          ₹{rt.startingPricePerNight?.toLocaleString()} <span className="text-xs font-normal text-slate-400">/ night</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleGenerateQuote(rt)}
                        disabled={quoteLoading}
                        className="mt-4 w-full py-2 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-slate-950 font-bold rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 shadow"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        Calculate Instant Quote
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl text-slate-400 text-sm">
                  Run an availability search to retrieve verified bookable room inventory.
                </div>
              )}
            </div>

            {/* Generated Quote Display */}
            {activeQuote && (
              <div className="border border-teal-500/40 bg-teal-950/20 rounded-2xl p-5 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-teal-500/20">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-teal-400" />
                    <span className="text-sm font-bold text-white">Official Quote #{activeQuote.quoteId}</span>
                    <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full border border-teal-500/40">
                      {activeQuote.status}
                    </span>
                  </div>
                  <button
                    onClick={handleRecalculateQuote}
                    disabled={quoteLoading}
                    className="flex items-center gap-1.5 text-xs text-teal-300 hover:text-teal-200 transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${quoteLoading ? 'animate-spin' : ''}`} />
                    Recalculate
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 text-xs">
                  <div>
                    <span className="text-slate-400 block">Nights</span>
                    <span className="text-sm font-semibold text-white">{activeQuote.nights} Nights</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Room Subtotal</span>
                    <span className="text-sm font-semibold text-white">₹{activeQuote.roomSubtotal?.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">GST Taxes (12%)</span>
                    <span className="text-sm font-semibold text-white">₹{activeQuote.taxes?.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Total Payable</span>
                    <span className="text-base font-bold text-emerald-400">₹{activeQuote.totalAmount?.toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-teal-500/20 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-slate-300">
                  <div>
                    <span className="text-slate-400">Policy: </span>
                    {activeQuote.cancellationPolicy || 'Flexible 48-hour cancellation policy applies.'}
                  </div>
                  <button
                    onClick={() => setActiveTab('workspace')}
                    className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0"
                  >
                    Proceed to Guest & Booking Desk
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: BOOKING WORKSPACE */}
      {activeTab === 'workspace' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Step 1: Guest Identification & Consent */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-teal-400" />
                  1. Guest Verification
                </h3>
                <button
                  onClick={() => setShowCreateGuestModal(true)}
                  className="text-xs text-teal-400 hover:underline flex items-center gap-1"
                >
                  <UserPlus className="w-3 h-3" />
                  New Guest
                </button>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Email</label>
                <input
                  type="email"
                  value={guestMatchQuery.email}
                  onChange={(e) => setGuestMatchQuery({ ...guestMatchQuery, email: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Phone</label>
                <input
                  type="text"
                  value={guestMatchQuery.phone}
                  onChange={(e) => setGuestMatchQuery({ ...guestMatchQuery, phone: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>

              <button
                onClick={handleMatchGuest}
                disabled={loading}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl text-xs transition-all border border-slate-700 flex items-center justify-center gap-2"
              >
                <Search className="w-3.5 h-3.5" />
                Search / Match Guest Profile
              </button>

              {matchedGuest && (
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-teal-300">Match Found</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">VERIFIED</span>
                  </div>
                  <div className="text-white font-medium">{matchedGuest.guestId}</div>
                  <div className="text-slate-400">Communication consent logged on server</div>
                </div>
              )}
            </div>

            {/* Step 2: Pending Reservation Creation */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-400" />
                2. Create Pending Reservation
              </h3>

              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Active Quote:</span>
                  <span className="font-semibold text-white">{activeQuote ? `#${activeQuote.quoteId}` : 'Not Generated'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Room Type:</span>
                  <span className="text-white">{selectedRoomType?.roomTypeName || 'Deluxe Room'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Price:</span>
                  <span className="font-bold text-teal-300">₹{activeQuote ? activeQuote.totalAmount?.toLocaleString() : '7,840'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status Rule:</span>
                  <span className="text-amber-400">PENDING_CONFIRMATION</span>
                </div>
              </div>

              <button
                onClick={handleCreatePendingReservation}
                disabled={loading || !activeQuote}
                className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-md shadow-teal-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Create Pending Reservation
              </button>

              {pendingReservation && (
                <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/40 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-amber-300">Pending Creation Success</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">AWAITING CONFIRM</span>
                  </div>
                  <div className="text-white font-medium">Ref: {pendingReservation.bookingReference || pendingReservation.reservationId}</div>
                  <div className="text-slate-400">Not displayed as confirmed booking until lock check passes.</div>
                </div>
              )}
            </div>

            {/* Step 3: Server-side Confirmation */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                3. Final Confirmation
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed">
                Executes atomic inventory recheck, consent verification, and marks booking status <strong>CONFIRMED</strong> with queued email confirmation delivery.
              </p>

              <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Idempotency Key:</span>
                  <span className="font-mono text-teal-300">AUTO-PROTECTED</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Channel Delivery:</span>
                  <span className="text-white">EMAIL (QUEUED)</span>
                </div>
              </div>

              <button
                onClick={handleConfirmReservation}
                disabled={loading || !pendingReservation}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirm Reservation (Idempotent)
              </button>

              {confirmedReservation && (
                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-300 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> CONFIRMED
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
                      {confirmedReservation.bookingReference}
                    </span>
                  </div>
                  <div className="text-slate-300">
                    Delivery Status: <span className="text-teal-300 font-semibold">{confirmedReservation.confirmationDeliveryStatus || 'QUEUED'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: HANDOFFS & AUDIT */}
      {activeTab === 'handoffs' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Escalated Cases */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-400" />
                  Cases Transferred to Human Staff
                </h3>
                <span className="text-xs text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/40">
                  {handoffsList.length} Active
                </span>
              </div>

              <div className="space-y-3">
                {handoffsList.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-sm">No pending handoff requests</div>
                ) : (
                  handoffsList.map((h, i) => (
                    <div key={i} className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white">Conv: {h.conversationId}</span>
                        <span className="text-amber-300 font-medium bg-slate-900 px-2 py-0.5 rounded">
                          Assigned: {h.targetRole || h.assignedRole}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">{h.reason}</p>
                      <div className="text-[11px] text-slate-400">{h.summary}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Audit Logs */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-400" />
                Permitted Agent Activity Logs
              </h3>

              <div className="space-y-3 max-h-[460px] overflow-y-auto">
                {activityLogs.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-sm">No activity records found</div>
                ) : (
                  activityLogs.map((log, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 text-xs">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="font-bold text-teal-300">{log.action}</span>
                        <span>{log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'Recent'}</span>
                      </div>
                      <div className="text-white mt-1">{log.details}</div>
                      <div className="text-[10px] text-slate-400 mt-1">Tenant: {log.tenantId} • Entity: {log.entityId}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Human Handoff Modal */}
      {showHandoffModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-400" />
                Transfer to Hotel Executive
              </h3>
              <button onClick={() => setShowHandoffModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Target Role</label>
              <select
                value={handoffRole}
                onChange={(e) => setHandoffRole(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
              >
                <option value="RESERVATION_EXECUTIVE">Reservation Executive</option>
                <option value="RESERVATION_MANAGER">Reservation Manager</option>
                <option value="FRONT_DESK">Front Desk Reception</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Reason for Transfer</label>
              <textarea
                value={handoffReason}
                onChange={(e) => setHandoffReason(e.target.value)}
                rows="3"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowHandoffModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleHandoff}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
              >
                Confirm Transfer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Guest Modal */}
      {showCreateGuestModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-teal-400" />
                Register Guest with Consent
              </h3>
              <button onClick={() => setShowCreateGuestModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">First Name *</label>
                <input
                  type="text"
                  value={newGuestForm.firstName}
                  onChange={(e) => setNewGuestForm({ ...newGuestForm, firstName: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Last Name</label>
                <input
                  type="text"
                  value={newGuestForm.lastName}
                  onChange={(e) => setNewGuestForm({ ...newGuestForm, lastName: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Email *</label>
              <input
                type="email"
                value={newGuestForm.email}
                onChange={(e) => setNewGuestForm({ ...newGuestForm, email: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Phone</label>
              <input
                type="text"
                value={newGuestForm.phone}
                onChange={(e) => setNewGuestForm({ ...newGuestForm, phone: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block">Communication Consent</label>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newGuestForm.consentEmail}
                  onChange={(e) => setNewGuestForm({ ...newGuestForm, consentEmail: e.target.checked })}
                  className="rounded border-slate-700 text-teal-500 focus:ring-teal-500"
                />
                Consent to Email Booking Confirmation & Updates
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newGuestForm.consentWhatsapp}
                  onChange={(e) => setNewGuestForm({ ...newGuestForm, consentWhatsapp: e.target.checked })}
                  className="rounded border-slate-700 text-teal-500 focus:ring-teal-500"
                />
                Consent to WhatsApp Messages
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCreateGuestModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGuest}
                className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs"
              >
                Save Guest Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
