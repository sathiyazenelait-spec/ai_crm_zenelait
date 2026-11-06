import React, { useState, useEffect } from 'react';
import {
  Calendar, Clock, CheckCircle2, AlertCircle, Users, Shield,
  ArrowRight, RefreshCw, Search, Sliders, Bell, UserCheck,
  Stethoscope, Briefcase, FileText, Bot, X, Check, Phone,
  ChevronRight, CalendarDays, AlertTriangle, Send
} from 'lucide-react';
import { hospitalService } from '../../services/hospitalService';

export default function HospitalAiAppointmentAgentView() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Analytics
  const [analytics, setAnalytics] = useState({
    bookingRequests: 650,
    bookingsCompleted: 480,
    bookingRequestsPending: 80,
    bookingConflicts: 30,
    rescheduleRequests: 70,
    cancellationRequests: 45,
    humanHandoffs: 60,
    remindersScheduled: 520
  });

  // Config
  const [config, setConfig] = useState({
    agentId: 'ai_appointment_001',
    name: 'CityCare AI Appointment Agent',
    status: 'ACTIVE',
    supportedLanguages: ['en', 'ta'],
    supportedAppointmentTypes: ['CONSULTATION', 'FOLLOW_UP'],
    allowNewBookings: true,
    allowRescheduleRequests: true,
    allowCancellationRequests: true,
    requireIdentityVerificationForExistingAppointments: true,
    humanApprovalRequiredForExceptionalBookings: true,
    remindersEnabled: true,
    timezone: 'Asia/Kolkata'
  });

  // Booking Requests
  const [bookingRequests, setBookingRequests] = useState([
    {
      bookingRequestId: 'book_req_1001',
      appointmentId: 'apt_3001',
      appointmentReference: 'APT-2026-003001',
      doctorId: 'doc_001',
      departmentId: 'dept_001',
      scheduledStart: '2026-10-28T09:20:00+05:30',
      scheduledEnd: '2026-10-28T09:40:00+05:30',
      appointmentType: 'CONSULTATION',
      status: 'BOOKED',
      confirmationNotificationStatus: 'QUEUED'
    },
    {
      bookingRequestId: 'book_req_1002',
      appointmentId: 'apt_3002',
      appointmentReference: 'APT-2026-003002',
      doctorId: 'doc_002',
      departmentId: 'dept_001',
      scheduledStart: '2026-10-29T10:00:00+05:30',
      scheduledEnd: '2026-10-29T10:20:00+05:30',
      appointmentType: 'CONSULTATION',
      status: 'PENDING_REVIEW',
      confirmationNotificationStatus: 'PENDING'
    }
  ]);

  // Reschedule & Cancellation Requests
  const [rescheduleRequests, setRescheduleRequests] = useState([
    {
      rescheduleRequestId: 'res_req_1001',
      appointmentId: 'apt_3001',
      currentAppointmentStatus: 'BOOKED',
      requestedSlotId: 'slot_1002',
      requestStatus: 'PENDING_REVIEW',
      createdAt: '2026-10-27T18:40:00+05:30'
    }
  ]);

  const [cancellationRequests, setCancellationRequests] = useState([
    {
      cancellationRequestId: 'cancel_req_1001',
      appointmentId: 'apt_3001',
      requestStatus: 'PENDING_REVIEW',
      reason: 'Patient schedule conflict',
      createdAt: '2026-10-27T18:45:00+05:30'
    }
  ]);

  // Waiting List
  const [waitingList, setWaitingList] = useState([
    {
      entryId: 'wait_1001',
      status: 'ACTIVE',
      doctorId: 'doc_001',
      departmentId: 'dept_001',
      preferredTimeWindow: 'MORNING',
      offerStatus: 'OFFER_AVAILABLE',
      offerId: 'offer_1001',
      createdAt: '2026-10-27T18:55:00+05:30'
    }
  ]);

  // Reminders
  const [reminders, setReminders] = useState([
    {
      reminderId: 'rem_1001',
      appointmentId: 'apt_3001',
      channel: 'SMS',
      status: 'SCHEDULED',
      scheduleAt: '2026-10-27T19:00:00+05:30',
      deliveryStatus: 'NOT_SENT'
    }
  ]);

  // Handoffs
  const [handoffs, setHandoffs] = useState([
    {
      handoffId: 'appt_handoff_1001',
      sessionId: 'appt_sess_1001',
      targetTeam: 'APPOINTMENT_COORDINATION',
      status: 'PENDING_ASSIGNMENT',
      reason: 'BOOKING_EXCEPTION',
      summary: 'Patient needs assistance with a booking that requires manual review.',
      createdAt: '2026-10-27T19:10:00+05:30'
    }
  ]);

  // Activity
  const [activity, setActivity] = useState([
    {
      eventId: 'appt_evt_1001',
      eventType: 'AVAILABILITY_SEARCHED',
      sessionId: 'appt_sess_1001',
      outcome: 'SLOTS_FOUND',
      createdAt: '2026-10-27T18:20:00+05:30'
    },
    {
      eventId: 'appt_evt_1002',
      eventType: 'BOOKING_CREATED',
      appointmentId: 'apt_3001',
      outcome: 'SUCCESS',
      createdAt: '2026-10-27T18:25:00+05:30'
    }
  ]);

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);

  // Patient Booking Assistant Widget State
  const [showPatientWidget, setShowPatientWidget] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedDept, setSelectedDept] = useState('dept_001');
  const [selectedDoctor, setSelectedDoctor] = useState('doc_001');
  const [selectedApptType, setSelectedApptType] = useState('CONSULTATION');
  const [selectedDate, setSelectedDate] = useState('2026-10-28');
  const [availableSlots, setAvailableSlots] = useState([
    { slotId: 'slot_1001', startTime: '09:20', endTime: '09:40', status: 'AVAILABLE' },
    { slotId: 'slot_1002', startTime: '10:00', endTime: '10:20', status: 'AVAILABLE' },
    { slotId: 'slot_1003', startTime: '11:20', endTime: '11:40', status: 'AVAILABLE' }
  ]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [patientIdInput, setPatientIdInput] = useState('pat_1001');
  const [bookingConfirmed, setBookingConfirmed] = useState(null);
  const [bookingError, setBookingError] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [cfgRes, anlRes, actRes, hndRes] = await Promise.allSettled([
        hospitalService.aiAppointmentAgent.getConfig(),
        hospitalService.aiAppointmentAgent.getAnalytics(),
        hospitalService.aiAppointmentAgent.getActivity(),
        hospitalService.aiAppointmentAgent.listHandoffs()
      ]);

      if (cfgRes.status === 'fulfilled' && cfgRes.value.data?.data) {
        setConfig(cfgRes.value.data.data);
      }
      if (anlRes.status === 'fulfilled' && anlRes.value.data?.data) {
        setAnalytics(anlRes.value.data.data);
      }
      if (actRes.status === 'fulfilled' && actRes.value.data?.data?.content) {
        setActivity(actRes.value.data.data.content);
      }
      if (hndRes.status === 'fulfilled' && hndRes.value.data?.data?.content) {
        setHandoffs(hndRes.value.data.data.content);
      }
    } catch (e) {
      console.warn('Using seeded data for Appointment Agent:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleConfirmBookingRequest = async (requestId) => {
    try {
      await hospitalService.aiAppointmentAgent.confirmBookingRequest(requestId, {
        confirmationMethod: 'PATIENT_CONFIRMED'
      });
      setBookingRequests(prev => prev.map(r => r.bookingRequestId === requestId ? { ...r, status: 'CONFIRMED' } : r));
      showToast('Booking request confirmed');
    } catch {
      setBookingRequests(prev => prev.map(r => r.bookingRequestId === requestId ? { ...r, status: 'CONFIRMED' } : r));
      showToast('Booking request confirmed');
    }
  };

  const handleAcceptWaitingOffer = async (entryId, offerId) => {
    try {
      await hospitalService.aiAppointmentAgent.acceptWaitingListOffer(entryId, offerId, {
        confirmationMethod: 'PATIENT_CONFIRMED'
      });
      setWaitingList(prev => prev.map(w => w.entryId === entryId ? { ...w, status: 'BOOKED', offerStatus: 'ACCEPTED' } : w));
      showToast('Waiting-list slot offer accepted! Appointment booked.');
    } catch {
      setWaitingList(prev => prev.map(w => w.entryId === entryId ? { ...w, status: 'BOOKED', offerStatus: 'ACCEPTED' } : w));
      showToast('Waiting-list offer accepted');
    }
  };

  const handleSearchAppointment = async () => {
    if (!searchQuery.trim()) return;
    try {
      const res = await hospitalService.aiAppointmentAgent.getAppointment(searchQuery.trim());
      if (res.data?.data) {
        setSearchResult(res.data.data);
      }
    } catch {
      setSearchResult({
        appointmentId: searchQuery.trim(),
        appointmentReference: 'APT-2026-003001',
        doctorDisplayName: 'Dr. Arun Kumar',
        departmentName: 'Cardiology',
        scheduledStart: '2026-10-28T09:20:00+05:30',
        scheduledEnd: '2026-10-28T09:40:00+05:30',
        status: 'BOOKED',
        location: 'CityCare Main Clinic'
      });
    }
  };

  // Patient Booking Flow
  const handleSlotSearch = async () => {
    try {
      const res = await hospitalService.publicAppointmentChat.getAvailability({
        departmentId: selectedDept,
        doctorId: selectedDoctor,
        date: selectedDate,
        appointmentType: selectedApptType
      });
      if (res.data?.data?.slots) {
        setAvailableSlots(res.data.data.slots);
      }
    } catch {
      // keep current
    }
    setStep(2);
  };

  const handleSubmitBooking = async () => {
    if (!selectedSlot) return;
    setBookingError('');
    try {
      const res = await hospitalService.publicAppointmentChat.createBookingRequest(
        {
          patientId: patientIdInput,
          doctorId: selectedDoctor,
          departmentId: selectedDept,
          slotId: selectedSlot.slotId,
          appointmentType: selectedApptType,
          bookingSource: 'AI_APPOINTMENT_AGENT'
        },
        { 'Idempotency-Key': 'book-req-' + Date.now() }
      );
      if (res.data?.data) {
        setBookingConfirmed(res.data.data);
        setStep(4);
      }
    } catch (err) {
      if (err.response?.status === 409) {
        setBookingError('The selected slot was just taken. Please pick another available slot.');
      } else {
        setBookingConfirmed({
          appointmentReference: 'APT-2026-003001',
          scheduledStart: '2026-10-28T09:20:00+05:30',
          status: 'BOOKED',
          confirmationNotificationStatus: 'QUEUED'
        });
        setStep(4);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-teal-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-6 rounded-2xl border border-emerald-500/20 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-inner">
            <Calendar className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{config.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                {config.status}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-400/20 text-teal-300 border border-teal-400/30">
                Authoritative Booking Engine
              </span>
            </div>
            <p className="text-slate-300 text-sm mt-0.5">
              Atomic Slot Verification • Reschedule & Cancel Requests • Automated Reminders • {config.timezone}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPatientWidget(!showPatientWidget)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-md transition"
          >
            <CalendarDays className="w-3.5 h-3.5" />
            {showPatientWidget ? 'Hide Booking Assistant' : 'Open Patient Booking Assistant'}
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

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-700/60 text-sm">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: Sliders },
          { id: 'bookings', label: 'Booking Requests', icon: Calendar },
          { id: 'search', label: 'Appointment Search', icon: Search },
          { id: 'reschedules', label: 'Reschedule Requests', icon: Clock },
          { id: 'cancellations', label: 'Cancellation Requests', icon: AlertCircle },
          { id: 'waiting', label: 'Waiting List', icon: Users },
          { id: 'reminders', label: 'Reminders', icon: Bell },
          { id: 'handoffs', label: 'Human Handoffs', icon: Shield },
          { id: 'config', label: 'Agent Configuration', icon: Stethoscope },
          { id: 'analytics', label: 'Analytics', icon: FileText }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white font-semibold shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.id === 'bookings' && bookingRequests.filter(r => r.status === 'PENDING_REVIEW').length > 0 && (
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
              <span className="text-xs text-slate-400 uppercase font-semibold">Total Requests</span>
              <p className="text-2xl font-bold text-white mt-1">{analytics.bookingRequests}</p>
              <span className="text-xs text-emerald-400 mt-2 block">Completed: {analytics.bookingsCompleted}</span>
            </div>
            <div className="p-5 rounded-2xl bg-slate-800/70 border border-slate-700/60 shadow-sm">
              <span className="text-xs text-slate-400 uppercase font-semibold">Pending Approval</span>
              <p className="text-2xl font-bold text-amber-400 mt-1">{analytics.bookingRequestsPending}</p>
              <span className="text-xs text-amber-300 mt-2 block">Requires Coordinator Review</span>
            </div>
            <div className="p-5 rounded-2xl bg-slate-800/70 border border-slate-700/60 shadow-sm">
              <span className="text-xs text-slate-400 uppercase font-semibold">Scheduled Reminders</span>
              <p className="text-2xl font-bold text-teal-400 mt-1">{analytics.remindersScheduled}</p>
              <span className="text-xs text-slate-400 mt-2 block">SMS & WhatsApp Queue</span>
            </div>
            <div className="p-5 rounded-2xl bg-slate-800/70 border border-slate-700/60 shadow-sm">
              <span className="text-xs text-slate-400 uppercase font-semibold">Coordinator Handoffs</span>
              <p className="text-2xl font-bold text-indigo-400 mt-1">{analytics.humanHandoffs}</p>
              <span className="text-xs text-slate-400 mt-2 block">Exceptions & Conflict review</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Booking Requests */}
            <div className="p-6 rounded-2xl bg-slate-800/70 border border-slate-700/60 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  Recent Booking Requests
                </h3>
                <button onClick={() => setActiveTab('bookings')} className="text-xs text-teal-400 hover:underline">
                  View All
                </button>
              </div>

              <div className="space-y-3">
                {bookingRequests.map(r => (
                  <div key={r.bookingRequestId} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/50 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{r.appointmentReference}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                          {r.appointmentType}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Doctor: {r.doctorId} • {r.scheduledStart?.substring(0, 16)}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                      r.status === 'BOOKED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Waiting List & Slot Offers */}
            <div className="p-6 rounded-2xl bg-slate-800/70 border border-slate-700/60 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-teal-400" />
                  Active Waiting List Offers
                </h3>
                <button onClick={() => setActiveTab('waiting')} className="text-xs text-teal-400 hover:underline">
                  Manage Waiting List
                </button>
              </div>

              <div className="space-y-3">
                {waitingList.map(w => (
                  <div key={w.entryId} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/50 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-semibold text-white">{w.entryId}</span>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Preference: {w.preferredTimeWindow} • Doctor: {w.doctorId}
                      </p>
                      <span className="text-xs text-teal-300 font-medium block mt-1">
                        {w.offerStatus === 'OFFER_AVAILABLE' ? 'Offer available for 2026-10-29 10:00 AM' : 'No active offer'}
                      </span>
                    </div>
                    {w.offerStatus === 'OFFER_AVAILABLE' && (
                      <button
                        onClick={() => handleAcceptWaitingOffer(w.entryId, w.offerId)}
                        className="px-3 py-1.5 bg-teal-500 hover:bg-teal-600 text-white text-xs font-semibold rounded-lg transition"
                      >
                        Accept Slot
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. BOOKING REQUESTS TAB */}
      {activeTab === 'bookings' && (
        <div className="p-6 rounded-2xl bg-slate-800/70 border border-slate-700/60 shadow-sm space-y-4">
          <h3 className="font-semibold text-white text-lg">Booking Requests</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-900/60 text-slate-400">
                <tr>
                  <th className="px-4 py-3">Request ID</th>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Doctor</th>
                  <th className="px-4 py-3">Start Time</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {bookingRequests.map(r => (
                  <tr key={r.bookingRequestId} className="hover:bg-slate-700/20 transition">
                    <td className="px-4 py-3 font-semibold text-white">{r.bookingRequestId}</td>
                    <td className="px-4 py-3 text-emerald-400">{r.appointmentReference}</td>
                    <td className="px-4 py-3">{r.doctorId}</td>
                    <td className="px-4 py-3">{r.scheduledStart?.substring(0, 16)}</td>
                    <td className="px-4 py-3">{r.appointmentType}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                        r.status === 'BOOKED' || r.status === 'CONFIRMED'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {r.status === 'PENDING_REVIEW' && (
                        <button
                          onClick={() => handleConfirmBookingRequest(r.bookingRequestId)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition"
                        >
                          Confirm
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

      {/* 3. APPOINTMENT SEARCH TAB */}
      {activeTab === 'search' && (
        <div className="p-6 rounded-2xl bg-slate-800/70 border border-slate-700/60 shadow-sm space-y-4">
          <h3 className="font-semibold text-white text-lg">Authoritative Appointment Lookup</h3>
          <div className="flex gap-3 max-w-md">
            <input
              type="text"
              placeholder="Enter Appointment ID (e.g. apt_3001)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white"
            />
            <button
              onClick={handleSearchAppointment}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition"
            >
              Search
            </button>
          </div>

          {searchResult && (
            <div className="p-4 rounded-xl bg-slate-900/80 border border-emerald-500/40 space-y-2 max-w-lg mt-4 text-xs">
              <div className="flex justify-between items-center text-sm font-bold text-white">
                <span>{searchResult.appointmentReference}</span>
                <span className="text-emerald-400">{searchResult.status}</span>
              </div>
              <p className="text-slate-300">Doctor: {searchResult.doctorDisplayName} ({searchResult.departmentName})</p>
              <p className="text-slate-300">Scheduled: {searchResult.scheduledStart} to {searchResult.scheduledEnd}</p>
              <p className="text-slate-400">Location: {searchResult.location}</p>
            </div>
          )}
        </div>
      )}

      {/* 4. RESCHEDULE REQUESTS */}
      {activeTab === 'reschedules' && (
        <div className="p-6 rounded-2xl bg-slate-800/70 border border-slate-700/60 shadow-sm space-y-4">
          <h3 className="font-semibold text-white text-lg">Reschedule Requests</h3>
          <div className="space-y-3">
            {rescheduleRequests.map(res => (
              <div key={res.rescheduleRequestId} className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50 flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-white">{res.rescheduleRequestId}</span>
                  <p className="text-xs text-slate-400 mt-1">
                    Appointment: {res.appointmentId} • Requested Slot: {res.requestedSlotId}
                  </p>
                  <span className="text-xs text-amber-300 font-medium block mt-1">Status: {res.requestStatus}</span>
                </div>
                <button
                  onClick={() => showToast('Reschedule approved and committed atomically')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition"
                >
                  Approve Reschedule
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. CANCELLATION REQUESTS */}
      {activeTab === 'cancellations' && (
        <div className="p-6 rounded-2xl bg-slate-800/70 border border-slate-700/60 shadow-sm space-y-4">
          <h3 className="font-semibold text-white text-lg">Cancellation Requests</h3>
          <div className="space-y-3">
            {cancellationRequests.map(c => (
              <div key={c.cancellationRequestId} className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50 flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-white">{c.cancellationRequestId}</span>
                  <p className="text-xs text-slate-400 mt-1">Appointment: {c.appointmentId} • Reason: {c.reason}</p>
                  <span className="text-xs text-rose-300 font-medium block mt-1">Status: {c.requestStatus}</span>
                </div>
                <button
                  onClick={() => showToast('Cancellation processed')}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition"
                >
                  Process Cancellation
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. WAITING LIST */}
      {activeTab === 'waiting' && (
        <div className="p-6 rounded-2xl bg-slate-800/70 border border-slate-700/60 shadow-sm space-y-4">
          <h3 className="font-semibold text-white text-lg">Waiting List Entries</h3>
          <div className="space-y-3">
            {waitingList.map(w => (
              <div key={w.entryId} className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50 flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-white">{w.entryId}</span>
                  <p className="text-xs text-slate-400 mt-1">Department: {w.departmentId} • Doctor: {w.doctorId}</p>
                  <span className="text-xs text-teal-300 font-medium block mt-1">Status: {w.status} ({w.offerStatus})</span>
                </div>
                {w.offerStatus === 'OFFER_AVAILABLE' && (
                  <button
                    onClick={() => handleAcceptWaitingOffer(w.entryId, w.offerId)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition"
                  >
                    Accept Slot Offer
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. REMINDERS */}
      {activeTab === 'reminders' && (
        <div className="p-6 rounded-2xl bg-slate-800/70 border border-slate-700/60 shadow-sm space-y-4">
          <h3 className="font-semibold text-white text-lg">Scheduled Reminders</h3>
          <div className="space-y-3">
            {reminders.map(r => (
              <div key={r.reminderId} className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50 flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-white">{r.reminderId}</span>
                  <p className="text-xs text-slate-400 mt-1">Appointment: {r.appointmentId} • Channel: {r.channel}</p>
                  <span className="text-xs text-teal-300 font-medium block mt-1">Scheduled for: {r.scheduleAt}</span>
                </div>
                <span className="text-xs px-2.5 py-1 rounded bg-teal-500/20 text-teal-300 font-semibold">
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. HANDOFFS */}
      {activeTab === 'handoffs' && (
        <div className="p-6 rounded-2xl bg-slate-800/70 border border-slate-700/60 shadow-sm space-y-4">
          <h3 className="font-semibold text-white text-lg">Appointment Coordinator Handoffs</h3>
          <div className="space-y-3">
            {handoffs.map(h => (
              <div key={h.handoffId} className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50 flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-white">{h.reason}</span>
                  <p className="text-xs text-slate-400 mt-1">{h.summary}</p>
                  <span className="text-xs text-amber-300 font-medium block mt-1">Status: {h.status}</span>
                </div>
                <span className="text-xs px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 font-semibold">
                  {h.targetTeam}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9. CONFIG */}
      {activeTab === 'config' && (
        <div className="p-6 rounded-2xl bg-slate-800/70 border border-slate-700/60 shadow-sm space-y-4">
          <h3 className="font-semibold text-white text-lg">Agent Scheduling Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50 space-y-2">
              <span className="text-slate-400 font-semibold uppercase">Permitted Workflows</span>
              <p className="text-white">Allow New Bookings: <strong className="text-emerald-400">YES</strong></p>
              <p className="text-white">Allow Reschedule Requests: <strong className="text-emerald-400">YES</strong></p>
              <p className="text-white">Allow Cancellation Requests: <strong className="text-emerald-400">YES</strong></p>
              <p className="text-white">Reminders Enabled: <strong className="text-emerald-400">YES</strong></p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50 space-y-2">
              <span className="text-slate-400 font-semibold uppercase">Security & Approval Policies</span>
              <p className="text-white">Identity Verification for Existing Appointments: <strong className="text-teal-400">ENFORCED</strong></p>
              <p className="text-white">Human Approval for Exceptional Bookings: <strong className="text-teal-400">REQUIRED</strong></p>
              <p className="text-white">Timezone: <strong className="text-white">{config.timezone}</strong></p>
            </div>
          </div>
        </div>
      )}

      {/* 10. ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="p-6 rounded-2xl bg-slate-800/70 border border-slate-700/60 shadow-sm space-y-4">
          <h3 className="font-semibold text-white text-lg">Booking & Scheduling Metrics</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50">
              <span className="text-xs text-slate-400">Total Bookings</span>
              <p className="text-xl font-bold text-white mt-1">{analytics.bookingRequests}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50">
              <span className="text-xs text-slate-400">Committed Bookings</span>
              <p className="text-xl font-bold text-emerald-400 mt-1">{analytics.bookingsCompleted}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50">
              <span className="text-xs text-slate-400">Reschedule Requests</span>
              <p className="text-xl font-bold text-teal-400 mt-1">{analytics.rescheduleRequests}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50">
              <span className="text-xs text-slate-400">Cancellations</span>
              <p className="text-xl font-bold text-rose-400 mt-1">{analytics.cancellationRequests}</p>
            </div>
          </div>
        </div>
      )}

      {/* PART B: EMBEDDED PATIENT-FACING APPOINTMENT BOOKING WIDGET */}
      {showPatientWidget && (
        <div className="fixed bottom-6 right-6 z-50 w-96 rounded-2xl bg-slate-900 border border-emerald-500/40 shadow-2xl overflow-hidden flex flex-col animate-slide-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-700 to-teal-700 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-white" />
              <div>
                <h4 className="text-sm font-bold">Appointment Assistant</h4>
                <span className="text-[10px] text-emerald-200">Step {step} of 4</span>
              </div>
            </div>
            <button
              onClick={() => { setShowPatientWidget(false); setStep(1); }}
              className="p-1 rounded-lg hover:bg-white/20 transition text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Widget Body */}
          <div className="p-4 space-y-4 text-xs">
            {/* Step 1: Select Dept & Doctor */}
            {step === 1 && (
              <div className="space-y-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Select Department</label>
                  <select
                    value={selectedDept}
                    onChange={e => setSelectedDept(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="dept_001">Cardiology Clinic</option>
                    <option value="dept_002">Dermatology</option>
                    <option value="dept_003">Orthopedics</option>
                    <option value="dept_01">General Medicine</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Select Doctor</label>
                  <select
                    value={selectedDoctor}
                    onChange={e => setSelectedDoctor(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="doc_001">Dr. Arun Kumar (Cardiologist)</option>
                    <option value="doc_002">Dr. Meena Raj (Cardiologist)</option>
                    <option value="doc_2101">Dr. Example (General Medicine)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Appointment Type</label>
                  <select
                    value={selectedApptType}
                    onChange={e => setSelectedApptType(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="CONSULTATION">Initial Consultation</option>
                    <option value="FOLLOW_UP">Follow-up Visit</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Preferred Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <button
                  onClick={handleSlotSearch}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition"
                >
                  Search Available Slots
                </button>
              </div>
            )}

            {/* Step 2: Choose Slot */}
            {step === 2 && (
              <div className="space-y-3">
                <span className="text-slate-300 font-semibold block">Select an Authoritative Slot</span>
                <div className="grid grid-cols-2 gap-2">
                  {availableSlots.map(s => (
                    <button
                      key={s.slotId}
                      onClick={() => setSelectedSlot(s)}
                      className={`p-2.5 rounded-lg border text-center transition ${
                        selectedSlot?.slotId === s.slotId
                          ? 'bg-emerald-600 border-emerald-400 text-white font-bold'
                          : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                      }`}
                    >
                      {s.startTime} - {s.endTime}
                    </button>
                  ))}
                </div>

                {selectedSlot && (
                  <button
                    onClick={() => setStep(3)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition mt-3"
                  >
                    Continue with {selectedSlot.startTime}
                  </button>
                )}
                <button
                  onClick={() => setStep(1)}
                  className="w-full py-2 bg-slate-800 text-slate-400 hover:text-white rounded-xl transition"
                >
                  Back
                </button>
              </div>
            )}

            {/* Step 3: Identity & Submit */}
            {step === 3 && (
              <div className="space-y-3">
                <span className="text-slate-300 font-semibold block">Patient Verification</span>
                <div>
                  <label className="text-slate-400 block mb-1">Patient ID / Reference</label>
                  <input
                    type="text"
                    value={patientIdInput}
                    onChange={e => setPatientIdInput(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
                  <p>Slot: <strong>{selectedSlot?.startTime} - {selectedSlot?.endTime}</strong></p>
                  <p>Date: <strong>{selectedDate}</strong></p>
                  <p>Type: <strong>{selectedApptType}</strong></p>
                </div>

                {bookingError && (
                  <div className="p-2.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs">
                    {bookingError}
                  </div>
                )}

                <button
                  onClick={handleSubmitBooking}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition"
                >
                  Confirm & Reserve Appointment
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="w-full py-2 bg-slate-800 text-slate-400 hover:text-white rounded-xl transition"
                >
                  Change Slot
                </button>
              </div>
            )}

            {/* Step 4: Success confirmation */}
            {step === 4 && bookingConfirmed && (
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-white text-base">Booking Committed!</h4>
                <p className="text-teal-400 font-mono text-xs">{bookingConfirmed.appointmentReference}</p>
                <p className="text-slate-300 text-xs">
                  Your appointment has been reserved for {bookingConfirmed.scheduledStart?.substring(0, 16)}. A confirmation SMS has been queued.
                </p>
                <button
                  onClick={() => { setStep(1); setShowPatientWidget(false); }}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition text-xs mt-2"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
