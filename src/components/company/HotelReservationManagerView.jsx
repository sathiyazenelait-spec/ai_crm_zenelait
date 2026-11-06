import React, { useState, useEffect } from 'react';
import {
  Calendar, BedDouble, Users, Bot, Shield, TrendingUp, AlertTriangle, CheckCircle2,
  Clock, Plus, Search, Filter, RefreshCw, ArrowUpRight, DollarSign, Layers,
  ChevronRight, Check, X, FileText, UserCheck, ShieldAlert, Award
} from 'lucide-react';
import { hotelService } from '../../services/hotelService';

export default function HotelReservationManagerView({ initialSubTab = 'dashboard' }) {
  const [activeTab, setActiveTab] = useState(initialSubTab);

  useEffect(() => {
    if (initialSubTab) setActiveTab(initialSubTab);
  }, [initialSubTab]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  // Dashboard Data
  const [dashboard, setDashboard] = useState({
    date: '2026-10-28',
    arrivals: 42,
    departures: 31,
    confirmedReservations: 186,
    pendingReservations: 8,
    cancelledReservationsToday: 4,
    availableRooms: 27,
    openEnquiries: 16,
    openExceptions: 2,
    aiAgentStatus: 'ACTIVE'
  });

  // Main Entities
  const [reservations, setReservations] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [ratePlans, setRatePlans] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [escalations, setEscalations] = useState([]);
  const [automationRules, setAutomationRules] = useState([]);
  const [aiConfig, setAiConfig] = useState({
    status: 'ACTIVE',
    autoQuoteGeneration: true,
    requireApprovalForRates: true,
    escalateGroupBookingsMinRooms: 4,
    responseTone: 'HOSPITABLE_LUXURY'
  });
  const [auditEvents, setAuditEvents] = useState([]);

  // Modals & Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showRateModal, setShowRateModal] = useState(false);
  const [newRatePlan, setNewRatePlan] = useState({
    name: '',
    roomTypeId: 'roomtype_1001',
    currency: 'INR',
    pricePerNight: 4800,
    validFrom: '2026-11-01',
    validTo: '2026-12-31',
    refundable: true,
    requiresApproval: true
  });

  const [showRuleModal, setShowRuleModal] = useState(false);
  const [newRule, setNewRule] = useState({
    name: '',
    trigger: 'RESERVATION_CONFIRMED',
    actionType: 'SEND_CONFIRMATION_EMAIL'
  });

  const [selectedReservation, setSelectedReservation] = useState(null);
  const [reservationHistory, setReservationHistory] = useState([]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [dash, resv, rt, rp, stf, asgn, enq, esc, rules, ai, audit] = await Promise.allSettled([
        hotelService.reservationManager.getDashboard('2026-10-28'),
        hotelService.reservationManager.getReservations(),
        hotelService.reservationManager.getRoomTypes(),
        hotelService.reservationManager.getRatePlans(),
        hotelService.reservationManager.getStaff(),
        hotelService.reservationManager.getWorkAssignments(),
        hotelService.reservationManager.getEnquiries(),
        hotelService.reservationManager.getEscalations(),
        hotelService.reservationManager.getAutomationRules(),
        hotelService.reservationManager.getAiConfig(),
        hotelService.reservationManager.getAuditEvents()
      ]);

      if (dash.status === 'fulfilled' && dash.value) setDashboard(dash.value);
      if (resv.status === 'fulfilled' && resv.value?.items) setReservations(resv.value.items);
      else if (resv.status === 'fulfilled' && Array.isArray(resv.value)) setReservations(resv.value);
      if (rt.status === 'fulfilled' && rt.value) setRoomTypes(rt.value);
      if (rp.status === 'fulfilled' && rp.value) setRatePlans(rp.value);
      if (stf.status === 'fulfilled' && stf.value) setStaffList(stf.value);
      if (asgn.status === 'fulfilled' && asgn.value) setAssignments(asgn.value);
      if (enq.status === 'fulfilled' && enq.value) setEnquiries(enq.value);
      if (esc.status === 'fulfilled' && esc.value) setEscalations(esc.value);
      if (rules.status === 'fulfilled' && rules.value) setAutomationRules(rules.value);
      if (ai.status === 'fulfilled' && ai.value) setAiConfig(ai.value);
      if (audit.status === 'fulfilled' && audit.value?.items) setAuditEvents(audit.value.items);
    } catch (err) {
      console.error('Error loading reservation manager data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateRatePlan = async (e) => {
    e.preventDefault();
    try {
      await hotelService.reservationManager.createRatePlan(newRatePlan);
      showToast('Rate plan submitted successfully');
      setShowRateModal(false);
      loadData();
    } catch (err) {
      showToast('Failed to create rate plan');
    }
  };

  const handleCreateRule = async (e) => {
    e.preventDefault();
    try {
      await hotelService.reservationManager.createAutomationRule({
        name: newRule.name,
        trigger: newRule.trigger,
        actions: [{ type: newRule.actionType }],
        enabled: false
      });
      showToast('Automation rule registered');
      setShowRuleModal(false);
      loadData();
    } catch (err) {
      showToast('Failed to create automation rule');
    }
  };

  const handleToggleRule = async (ruleId, currentEnabled) => {
    try {
      if (currentEnabled) {
        await hotelService.reservationManager.disableAutomationRule(ruleId);
        showToast('Rule disabled');
      } else {
        await hotelService.reservationManager.enableAutomationRule(ruleId, { comment: 'Enabled by manager' });
        showToast('Rule enabled safely');
      }
      loadData();
    } catch (err) {
      showToast('Action failed');
    }
  };

  const handleViewReservation = async (res) => {
    setSelectedReservation(res);
    try {
      const hist = await hotelService.reservationManager.getReservationHistory(res.reservationId);
      setReservationHistory(hist || []);
    } catch (e) {
      setReservationHistory([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl animate-fade-in text-sm font-medium">
          <CheckCircle2 className="w-5 h-5" />
          {toast}
        </div>
      )}

      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/40 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold rounded-full uppercase tracking-wider">
                Hotel Tenant — Role 1
              </span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                AI Agent Active
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-2 text-white">
              Reservation Manager Operations
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Authoritative inventory, rate policies, occupancy analytics, staff assignments, and automated reservation workflows for Grand Azure Resort.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-sm font-medium transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
              Refresh Sync
            </button>
            <button
              onClick={() => setShowRateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium shadow-lg shadow-indigo-600/30 transition"
            >
              <Plus className="w-4 h-4" />
              New Rate Plan
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 border-t border-slate-800/80 pt-4 overflow-x-auto no-scrollbar">
          {[
            { id: 'dashboard', label: 'Overview', icon: TrendingUp },
            { id: 'reservations', label: 'Reservations & Calendar', icon: Calendar },
            { id: 'inventory', label: 'Inventory & Rates', icon: BedDouble },
            { id: 'staff', label: 'Staff & Assignments', icon: Users },
            { id: 'enquiries', label: 'Enquiries & Escalations', icon: AlertTriangle },
            { id: 'automation', label: 'AI & Automations', icon: Bot },
            { id: 'reports', label: 'Reports & Audits', icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${
                  active
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: OVERVIEW DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Key Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Today's Arrivals</span>
              <div className="text-2xl font-bold text-emerald-400 mt-1">{dashboard.arrivals}</div>
              <span className="text-xs text-slate-500 mt-1 block">Expected check-ins</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Departures</span>
              <div className="text-2xl font-bold text-amber-400 mt-1">{dashboard.departures}</div>
              <span className="text-xs text-slate-500 mt-1 block">Check-outs scheduled</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Confirmed Bookings</span>
              <div className="text-2xl font-bold text-indigo-400 mt-1">{dashboard.confirmedReservations}</div>
              <span className="text-xs text-slate-500 mt-1 block">Authoritative stays</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Available Rooms</span>
              <div className="text-2xl font-bold text-blue-400 mt-1">{dashboard.availableRooms}</div>
              <span className="text-xs text-slate-500 mt-1 block">Ready for sale</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Open Enquiries</span>
              <div className="text-2xl font-bold text-purple-400 mt-1">{dashboard.openEnquiries}</div>
              <span className="text-xs text-slate-500 mt-1 block">Assigned / In queue</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Exceptions</span>
              <div className="text-2xl font-bold text-rose-400 mt-1">{dashboard.openExceptions}</div>
              <span className="text-xs text-slate-500 mt-1 block">Requires manager review</span>
            </div>
          </div>

          {/* Quick Action & System Health Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live Inventory Status */}
            <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <BedDouble className="w-5 h-5 text-indigo-400" />
                  Room Inventory Allocation
                </h3>
                <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full border border-slate-700">
                  Target: 82% Occupancy
                </span>
              </div>
              <div className="space-y-4">
                {roomTypes.map((rt) => (
                  <div key={rt.roomTypeId} className="p-3.5 bg-slate-800/40 border border-slate-700/50 rounded-xl">
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <span className="font-semibold text-white">{rt.name}</span>
                        <span className="text-xs text-slate-400 ml-2">Code: {rt.code}</span>
                      </div>
                      <span className="font-medium text-emerald-400">₹{rt.basePrice?.toLocaleString()} / night</span>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-xs text-slate-400">
                      <span>Max Occupancy: {rt.maxOccupancy} Guests</span>
                      <span>•</span>
                      <span>Allocated: 50 rooms</span>
                      <span>•</span>
                      <span className="text-indigo-300 font-medium">Available: 4</span>
                    </div>
                    <div className="w-full bg-slate-700/50 h-2 rounded-full mt-2.5 overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full" style={{ width: '92%' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Agent & Automation Status */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-3">
                  <Bot className="w-5 h-5 text-purple-400" />
                  AI Reservation Agent
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Autonomously handles room queries, calculates rate quotations from live plans, and drafts confirmation emails with human approval guards.
                </p>

                <div className="mt-4 space-y-2.5">
                  <div className="flex items-center justify-between text-xs p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
                    <span className="text-slate-300">Operational Mode</span>
                    <span className="text-emerald-400 font-semibold uppercase">{aiConfig.status || 'ACTIVE'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
                    <span className="text-slate-300">Automatic Quotes</span>
                    <span className="text-indigo-400 font-semibold">{aiConfig.autoQuoteGeneration ? 'ENABLED' : 'MANUAL'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
                    <span className="text-slate-300">Rate Plan Overrides</span>
                    <span className="text-amber-400 font-semibold">REQUIRES APPROVAL</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 mt-4">
                <button
                  onClick={() => setActiveTab('automation')}
                  className="w-full py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-semibold transition"
                >
                  Configure AI Automation Rules
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RESERVATIONS & CALENDAR */}
      {activeTab === 'reservations' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 border border-slate-800 rounded-xl">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search guest or conf #"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-sm px-3 py-2"
              >
                <option value="">All Statuses</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="CHECKED_IN">Checked In</option>
                <option value="PENDING_CONFIRMATION">Pending</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <span className="text-xs text-slate-400">Total Records: {reservations.length}</span>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800/60 text-slate-400 text-xs uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Confirmation</th>
                  <th className="py-3 px-4">Guest</th>
                  <th className="py-3 px-4">Room Type</th>
                  <th className="py-3 px-4">Dates</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {reservations
                  .filter((r) => !statusFilter || r.status === statusFilter)
                  .filter((r) => !searchQuery || r.guestName?.toLowerCase().includes(searchQuery.toLowerCase()) || r.confirmationNumber?.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((res) => (
                    <tr key={res.reservationId} className="hover:bg-slate-800/30 transition">
                      <td className="py-3.5 px-4 font-mono text-xs text-indigo-400 font-semibold">
                        {res.confirmationNumber}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-white">{res.guestName}</td>
                      <td className="py-3.5 px-4 text-slate-300">{res.roomType}</td>
                      <td className="py-3.5 px-4 text-xs text-slate-400">
                        {res.checkInDate} → {res.checkOutDate} ({res.nights || 2}n)
                      </td>
                      <td className="py-3.5 px-4 font-medium text-white">₹{res.totalAmount?.toLocaleString()}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          res.status === 'CONFIRMED'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : res.status === 'CHECKED_IN'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {res.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-xs text-emerald-400 font-medium">{res.paymentStatus || 'PAID'}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleViewReservation(res)}
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium"
                        >
                          Audit History
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Reservation Audit History Drawer */}
          {selectedReservation && (
            <div className="p-4 bg-slate-900 border border-indigo-900/60 rounded-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-sm font-semibold text-white">
                  Reservation Trail: {selectedReservation.confirmationNumber} ({selectedReservation.guestName})
                </span>
                <button onClick={() => setSelectedReservation(null)} className="text-slate-400 hover:text-white text-xs">
                  Close
                </button>
              </div>
              <div className="space-y-2">
                {reservationHistory.map((h, i) => (
                  <div key={i} className="flex items-center justify-between text-xs bg-slate-800/40 p-2 rounded-lg">
                    <span className="font-semibold text-indigo-400">{h.action} ({h.status})</span>
                    <span className="text-slate-400">Actor: {h.actor}</span>
                    <span className="text-slate-500">{h.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: INVENTORY & RATES */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Active Rate Plans & Approval Governance</h3>
            <button
              onClick={() => setShowRateModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Rate Plan
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ratePlans.map((rp) => (
              <div key={rp.ratePlanId} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">{rp.name}</span>
                  <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                    {rp.status || 'ACTIVE'}
                  </span>
                </div>
                <div className="text-2xl font-bold text-emerald-400">
                  ₹{rp.pricePerNight?.toLocaleString()} <span className="text-xs text-slate-400 font-normal">/ night</span>
                </div>
                <div className="text-xs text-slate-400 space-y-1">
                  <div>Room Type: {rp.roomTypeId}</div>
                  <div>Policy: {rp.refundable ? 'Fully Refundable' : 'Non-Refundable'}</div>
                </div>
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Governance</span>
                  <span className="text-indigo-300 font-medium">Standard Policy</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: STAFF & ASSIGNMENTS */}
      {activeTab === 'staff' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-base font-semibold text-white mb-4">Reservation Staff & Workload</h3>
              <div className="space-y-3">
                {staffList.map((st) => (
                  <div key={st.staffId} className="flex items-center justify-between p-3.5 bg-slate-800/40 border border-slate-700/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-300 text-sm">
                        {st.name?.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">{st.name}</div>
                        <div className="text-xs text-slate-400">{st.role}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-slate-300 bg-slate-700/60 px-2.5 py-1 rounded-lg">
                        {st.assignedEnquiries || 3} Active Tasks
                      </span>
                      <span className="text-xs text-emerald-400 font-semibold px-2 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                        {st.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-base font-semibold text-white">Delegation Summary</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Reservation assignments are routed automatically based on shift availability and skill level for VIP and group booking conversions.
              </p>
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Enquiries Today:</span>
                  <span className="text-white font-semibold">{dashboard.openEnquiries}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Avg Response Time:</span>
                  <span className="text-emerald-400 font-semibold">14 mins</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ENQUIRIES & ESCALATIONS */}
      {activeTab === 'enquiries' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-base font-semibold text-white">Guest Booking Enquiries</h3>
              <div className="space-y-3">
                {enquiries.map((enq) => (
                  <div key={enq.enquiryId} className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-indigo-400">{enq.guestName}</span>
                      <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full">
                        {enq.channel}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-white">{enq.subject}</div>
                    <p className="text-xs text-slate-400 line-clamp-2">{enq.message}</p>
                    <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
                      <span>Assigned to: {enq.assignedTo || 'Unassigned'}</span>
                      <span className="text-amber-400 font-medium">Status: {enq.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-base font-semibold text-white">Escalation Queue</h3>
              <div className="space-y-3">
                {escalations.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-800 rounded-xl">
                    No active policy or overbooking escalations pending.
                  </div>
                ) : (
                  escalations.map((esc) => (
                    <div key={esc.escalationId} className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs space-y-1">
                      <div className="font-semibold text-rose-400">{esc.reason || 'Group Booking Threshold'}</div>
                      <div className="text-slate-300">{esc.summary}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: AI & AUTOMATION RULES */}
      {activeTab === 'automation' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Reservation Automation Allowlist</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Executes pre-vetted triggers like booking confirmation emails, follow-up notifications, and group escalation.
              </p>
            </div>
            <button
              onClick={() => setShowRuleModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Create Rule
            </button>
          </div>

          <div className="space-y-3">
            {automationRules.map((rule) => {
              const enabled = rule.status === 'ENABLED' || rule.enabled;
              return (
                <div key={rule.ruleId} className="flex items-center justify-between p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
                  <div>
                    <div className="text-sm font-semibold text-white">{rule.name}</div>
                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                      <span>Trigger: <code className="text-indigo-400 font-mono">{rule.trigger}</code></span>
                      <span>•</span>
                      <span>Allowlisted Actions: {rule.actionsCount || 1}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                      enabled ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {enabled ? 'ENABLED' : 'DISABLED'}
                    </span>
                    <button
                      onClick={() => handleToggleRule(rule.ruleId, enabled)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                        enabled
                          ? 'border-rose-500/40 text-rose-300 hover:bg-rose-500/20'
                          : 'border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20'
                      }`}
                    >
                      {enabled ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 7: REPORTS & AUDITS */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 text-center">
              <span className="text-xs text-slate-400 uppercase font-semibold">Average Occupancy</span>
              <div className="text-3xl font-bold text-emerald-400 mt-2">78.4%</div>
              <span className="text-xs text-slate-500 mt-1 block">Past 7 Days (Sellable: 100 rooms)</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 text-center">
              <span className="text-xs text-slate-400 uppercase font-semibold">Booking Conversion</span>
              <div className="text-3xl font-bold text-indigo-400 mt-2">64.2%</div>
              <span className="text-xs text-slate-500 mt-1 block">Enquiry to Confirmed Stay</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 text-center">
              <span className="text-xs text-slate-400 uppercase font-semibold">AI Handled Volume</span>
              <div className="text-3xl font-bold text-purple-400 mt-2">82.1%</div>
              <span className="text-xs text-slate-500 mt-1 block">First-contact quote generation</span>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-base font-semibold text-white mb-3">Authoritative Audit Trail</h3>
            <div className="space-y-2">
              {auditEvents.slice(0, 10).map((ev, i) => (
                <div key={i} className="text-xs p-2.5 bg-slate-800/40 rounded-lg flex items-center justify-between">
                  <span className="text-slate-300 font-medium">{ev.action || 'INVENTORY_RESERVATION_UPDATE'}</span>
                  <span className="text-slate-500">{ev.timestamp || '2026-10-28 11:00:00'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Rate Plan */}
      {showRateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-semibold text-white">Create Rate Plan</h3>
              <button onClick={() => setShowRateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateRatePlan} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Plan Name</label>
                <input
                  type="text"
                  required
                  value={newRatePlan.name}
                  onChange={(e) => setNewRatePlan({ ...newRatePlan, name: e.target.value })}
                  placeholder="e.g. Winter Holiday Special"
                  className="w-full mt-1 p-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Room Type</label>
                <select
                  value={newRatePlan.roomTypeId}
                  onChange={(e) => setNewRatePlan({ ...newRatePlan, roomTypeId: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                >
                  {roomTypes.map((rt) => (
                    <option key={rt.roomTypeId} value={rt.roomTypeId}>{rt.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400">Price / Night (₹)</label>
                  <input
                    type="number"
                    required
                    value={newRatePlan.pricePerNight}
                    onChange={(e) => setNewRatePlan({ ...newRatePlan, pricePerNight: Number(e.target.value) })}
                    className="w-full mt-1 p-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400">Currency</label>
                  <input
                    type="text"
                    disabled
                    value="INR"
                    className="w-full mt-1 p-2 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-slate-400"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="reqApp"
                  checked={newRatePlan.requiresApproval}
                  onChange={(e) => setNewRatePlan({ ...newRatePlan, requiresApproval: e.target.checked })}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="reqApp" className="text-xs text-slate-300">
                  Subject to Rate-Plan Governance Approval
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold"
                >
                  Submit Rate Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Automation Rule */}
      {showRuleModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-semibold text-white">Register Automation Rule</h3>
              <button onClick={() => setShowRuleModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateRule} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Rule Name</label>
                <input
                  type="text"
                  required
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  placeholder="e.g. Check-in 24h Reminder"
                  className="w-full mt-1 p-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Allowlisted Trigger</label>
                <select
                  value={newRule.trigger}
                  onChange={(e) => setNewRule({ ...newRule, trigger: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                >
                  <option value="RESERVATION_CONFIRMED">RESERVATION_CONFIRMED</option>
                  <option value="ARRIVAL_T_MINUS_24H">ARRIVAL_T_MINUS_24H</option>
                  <option value="DEPARTURE_REMINDER">DEPARTURE_REMINDER</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400">Action</label>
                <select
                  value={newRule.actionType}
                  onChange={(e) => setNewRule({ ...newRule, actionType: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white"
                >
                  <option value="SEND_CONFIRMATION_EMAIL">SEND_CONFIRMATION_EMAIL</option>
                  <option value="SEND_WHATSAPP_REMINDER">SEND_WHATSAPP_REMINDER</option>
                  <option value="NOTIFY_FRONT_DESK">NOTIFY_FRONT_DESK</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRuleModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold"
                >
                  Create Rule (Disabled by default)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
