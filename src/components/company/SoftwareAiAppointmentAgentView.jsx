import React, { useState, useEffect } from 'react';
import { softwareService } from '../../services/softwareService';
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Plus,
  Users,
  Video,
  ShieldCheck,
  Send,
  AlertTriangle,
  UserCheck,
  ChevronRight,
  BarChart3,
  Bell,
  TrendingUp,
  Download,
  CheckCircle2,
  Activity,
  Sliders,
  DollarSign
} from 'lucide-react';

export function SoftwareAiAppointmentAgentView({ initialSubTab = 'overview' }) {
  const [activeTab, setActiveTab] = useState(initialSubTab);
  const [metrics, setMetrics] = useState({
    appointmentsRequested: 320,
    appointmentsConfirmed: 240,
    appointmentsCompleted: 198,
    appointmentsCancelled: 18,
    rescheduleRequests: 25,
    noShows: 9,
    confirmationRatePercentage: 75.0
  });

  const [bookingRequests, setBookingRequests] = useState([]);
  const [confirmedAppointments, setConfirmedAppointments] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotDate, setSlotDate] = useState('2026-10-27');
  const [slotDuration, setSlotDuration] = useState(30);
  const [timezone, setTimezone] = useState('Asia/Kolkata');

  // Modals
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({
    customerId: 'CUS-1001',
    customerName: 'Arun Kumar',
    appointmentType: 'SOFTWARE_DEMO',
    subject: 'Zenelait CRM demonstration',
    startAt: '2026-10-27T14:00:00+05:30',
    durationMinutes: 30,
    timezone: 'Asia/Kolkata',
    notes: 'Interested in sales and support automation'
  });

  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({
    requestId: '',
    newStartAt: '2026-10-27T15:00:00+05:30',
    reason: 'Customer requested a later time'
  });

  useEffect(() => {
    setActiveTab(initialSubTab);
  }, [initialSubTab]);

  useEffect(() => {
    loadData();
    searchSlots('2026-10-27', 30);
  }, []);

  const loadData = async () => {
    try {
      const [metRes, reqRes, aptRes] = await Promise.all([
        softwareService.getAppointmentMetrics(),
        softwareService.getBookingRequests(),
        softwareService.getAppointments()
      ]);
      if (metRes) setMetrics(metRes);
      if (reqRes) setBookingRequests(reqRes);
      if (aptRes) setConfirmedAppointments(aptRes);
    } catch (e) {
      console.warn('Appointment data fallback', e);
    }
  };

  const searchSlots = async (d = slotDate, dur = slotDuration) => {
    try {
      const res = await softwareService.getAvailableSlots({
        date: d,
        durationMinutes: dur,
        timezone: timezone,
        appointmentType: 'SOFTWARE_DEMO'
      });
      if (res?.slots) {
        setAvailableSlots(res.slots);
      }
    } catch (e) {
      console.warn('Slot search fallback', e);
    }
  };

  const handleConfirmRequest = async (requestId) => {
    try {
      const res = await softwareService.confirmBookingRequest(requestId, {
        confirmationSource: 'CALENDAR_VALIDATION',
        sendConfirmation: true
      });
      if (res) {
        alert('Appointment successfully confirmed! Delivery status: QUEUED');
        loadData();
      }
    } catch (e) {
      alert('Error confirming appointment: ' + e.message);
    }
  };

  const handleReschedule = async () => {
    try {
      const res = await softwareService.rescheduleBookingRequest(rescheduleData.requestId, {
        newStartAt: rescheduleData.newStartAt,
        timezone: 'Asia/Kolkata',
        reason: rescheduleData.reason
      });
      if (res) {
        alert('Appointment successfully rescheduled!');
        setShowRescheduleModal(false);
        loadData();
      }
    } catch (e) {
      alert('Error rescheduling: ' + e.message);
    }
  };

  const handleCancel = async (requestId) => {
    if (!confirm('Are you sure you want to cancel this booking request?')) return;
    try {
      await softwareService.cancelBookingRequest(requestId, {
        reason: 'Customer requested cancellation',
        notifyAttendees: true
      });
      alert('Appointment cancelled.');
      loadData();
    } catch (e) {
      alert('Error cancelling: ' + e.message);
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    try {
      const res = await softwareService.createBookingRequest(requestForm);
      if (res) {
        alert('Booking request registered successfully! ID: ' + res.requestId);
        setShowRequestModal(false);
        loadData();
      }
    } catch (e) {
      alert('Error submitting request: ' + e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-900/30 via-slate-900/50 to-slate-900/20 p-5 rounded-2xl border border-blue-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
              SOFTWARE / IT TENANT
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300">
              ROLE: AI_APPOINTMENT_AGENT
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1.5 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-400" />
            AI Appointment & Demo Scheduling Hub
          </h1>
          <p className="text-sm text-slate-400">
            Schedules software demos, sales discovery, technical consultations, and onboarding appointments with calendar validation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowRequestModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm shadow-lg shadow-blue-600/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Book Appointment
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Appointment Overview' },
          { id: 'requests', label: 'Booking Requests' },
          { id: 'confirmed', label: 'Confirmed Appointments' },
          { id: 'slots', label: 'Available Slots Search' },
          { id: 'config', label: 'Agent Configuration' },
          { id: 'reports', label: 'Performance Reports' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-sm'
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
              <span className="text-xs text-slate-400">Appointments Requested</span>
              <p className="text-2xl font-bold text-white mt-1">{metrics.appointmentsRequested}</p>
              <span className="text-xs text-blue-400 mt-1 block">Inbound software leads</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400">Confirmed & Scheduled</span>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{metrics.appointmentsConfirmed}</p>
              <span className="text-xs text-slate-400 mt-1 block">Calendar validated</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400">Completed Sessions</span>
              <p className="text-2xl font-bold text-cyan-400 mt-1">{metrics.appointmentsCompleted}</p>
              <span className="text-xs text-cyan-400/80 mt-1 block">Held with sales host</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400">Confirmation Rate</span>
              <p className="text-2xl font-bold text-purple-400 mt-1">{metrics.confirmationRatePercentage}%</p>
              <span className="text-xs text-purple-400/80 mt-1 block">Slot lock-in SLA</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" /> Pending Booking Requests
              </h3>
              <div className="space-y-2.5">
                {bookingRequests.map(r => (
                  <div key={r.requestId} className="p-3.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-400">{r.requestId}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-semibold">{r.appointmentType}</span>
                      </div>
                      <p className="text-sm font-semibold text-white mt-1">{r.subject}</p>
                      <p className="text-xs text-slate-400">
                        {r.customerName || r.customerId} · {r.startAt ? r.startAt.slice(0, 16) : 'Pending Slot'} ({r.durationMinutes}m)
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleConfirmRequest(r.requestId)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => { setRescheduleData({ ...rescheduleData, requestId: r.requestId }); setShowRescheduleModal(true); }}
                        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs"
                      >
                        Reschedule
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400" /> Calendar Safeguards
              </h3>
              <ul className="text-xs text-slate-300 space-y-2.5">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">✓</span>
                  <span>Checks real-time calendar availability before offering meeting slots.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">✓</span>
                  <span>Concurrency-safe reservation prevents double booking same slot.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">✓</span>
                  <span>Confirmation emails are queued and tracked with provider status.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BOOKING REQUESTS */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700/60">
                <tr>
                  <th className="p-3.5">Request ID</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Meeting Type</th>
                  <th className="p-3.5">Proposed Time</th>
                  <th className="p-3.5">Duration</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {bookingRequests.map(r => (
                  <tr key={r.requestId} className="hover:bg-slate-800/40">
                    <td className="p-3.5 font-mono text-blue-400 font-semibold">{r.requestId}</td>
                    <td className="p-3.5 text-white font-medium">{r.customerName || r.customerId}</td>
                    <td className="p-3.5">{r.appointmentType}</td>
                    <td className="p-3.5 text-slate-400">{r.startAt ? r.startAt.slice(0, 16) : 'TBD'}</td>
                    <td className="p-3.5">{r.durationMinutes} mins</td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-1.5">
                      <button
                        onClick={() => handleConfirmRequest(r.requestId)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-semibold"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => { setRescheduleData({ ...rescheduleData, requestId: r.requestId }); setShowRescheduleModal(true); }}
                        className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-[11px]"
                      >
                        Reschedule
                      </button>
                      <button
                        onClick={() => handleCancel(r.requestId)}
                        className="px-2.5 py-1 bg-red-600/80 hover:bg-red-600 text-white rounded text-[11px]"
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CONFIRMED APPOINTMENTS */}
      {activeTab === 'confirmed' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {confirmedAppointments.map(a => (
              <div key={a.appointmentId} className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-emerald-400 font-bold">{a.appointmentId}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold">
                    {a.status}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-white">{a.subject}</h4>
                <p className="text-xs text-slate-400">
                  Customer: <strong className="text-slate-200">{a.customerName}</strong> ({a.customerEmail})
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-300 pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    {a.startAt ? a.startAt.slice(0, 16) : 'Oct 27 14:00'} ({a.durationMinutes || 30}m)
                  </span>
                  <span className="flex items-center gap-1">
                    <Video className="w-3.5 h-3.5 text-purple-400" /> Google Meet
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Host: {a.host || 'Rahul Sharma'}</span>
                  <span>Confirmation: {a.confirmationDeliveryStatus || 'QUEUED'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: AVAILABLE SLOTS SEARCH */}
      {activeTab === 'slots' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" /> Real-time Slot Lookup
            </h3>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-slate-400 mb-1 block">Date</label>
                <input
                  type="date"
                  value={slotDate}
                  onChange={(e) => { setSlotDate(e.target.value); searchSlots(e.target.value, slotDuration); }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 mb-1 block">Duration</label>
                <select
                  value={slotDuration}
                  onChange={(e) => { setSlotDuration(Number(e.target.value)); searchSlots(slotDate, Number(e.target.value)); }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                >
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>60 Minutes</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 mb-1 block">Timezone</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="Europe/London">Europe/London (BST)</option>
                  <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {availableSlots.map(s => (
              <div key={s.slotId} className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs text-blue-400 font-semibold">{s.slotId}</span>
                  <p className="text-sm font-bold text-white mt-0.5">
                    {s.startAt ? s.startAt.slice(11, 16) : '14:00'} - {s.endAt ? s.endAt.slice(11, 16) : '14:30'}
                  </p>
                  <span className="text-[10px] text-emerald-400">Available</span>
                </div>
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
                >
                  Book Slot
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: AGENT CONFIGURATION */}
      {activeTab === 'config' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 max-w-2xl text-xs">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" /> Appointment Agent Settings
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-slate-400 mb-1 block">Default Meeting Timezone</label>
              <input
                type="text"
                value="Asia/Kolkata"
                readOnly
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 mb-1 block">Buffer Between Meetings (Minutes)</label>
              <input
                type="number"
                value={15}
                readOnly
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 mb-1 block">Working Hours</label>
              <input
                type="text"
                value="09:00 - 18:00 IST (Mon - Fri)"
                readOnly
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: PERFORMANCE REPORTS */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-400" /> Appointment Intelligence & Performance Analytics
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Real-time scheduling efficiency, completion rates, and conversion metrics</p>
            </div>
            <button
              onClick={() => {
                const csvData = "Metric,Value\nTotal Bookings Requested," + metrics.appointmentsRequested + "\nConfirmed Sessions," + metrics.appointmentsConfirmed + "\nCompleted Sessions," + metrics.appointmentsCompleted + "\nConfirmation Rate," + metrics.confirmationRatePercentage + "%\nReschedules," + metrics.rescheduleRequests;
                const blob = new Blob([csvData], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `appointment_performance_report_${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" /> Export CSV Report
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Schedule Fulfillment Rate</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-3xl font-bold text-emerald-400 mt-2">{metrics.confirmationRatePercentage}%</p>
              <p className="text-xs text-slate-500 mt-1">Confirmed vs total inbound booking requests</p>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Session Show-Up Rate</span>
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              </div>
              <p className="text-3xl font-bold text-cyan-400 mt-2">
                {metrics.appointmentsConfirmed > 0 ? ((metrics.appointmentsCompleted / metrics.appointmentsConfirmed) * 100).toFixed(1) : 0}%
              </p>
              <p className="text-xs text-slate-500 mt-1">{metrics.appointmentsCompleted} completed of {metrics.appointmentsConfirmed} confirmed</p>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Reschedule / No-Show Rate</span>
                <Activity className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-3xl font-bold text-amber-400 mt-2">
                {metrics.appointmentsConfirmed > 0 ? (((metrics.rescheduleRequests + metrics.noShows) / metrics.appointmentsConfirmed) * 100).toFixed(1) : 0}%
              </p>
              <p className="text-xs text-slate-500 mt-1">{metrics.rescheduleRequests} reschedules • {metrics.noShows} no-shows</p>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">Channel & Meeting Type Breakdown</h4>
            <div className="space-y-3">
              {[
                { type: 'Software Demonstration (30m)', count: 184, share: '57%', rate: '82%' },
                { type: 'Sales Discovery Meeting (45m)', count: 86, share: '27%', rate: '76%' },
                { type: 'Technical Consultation (60m)', count: 32, share: '10%', rate: '68%' },
                { type: 'Customer Onboarding (45m)', count: 18, share: '6%', rate: '94%' },
              ].map((row, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40 border border-slate-800/80 text-xs">
                  <span className="font-medium text-white">{row.type}</span>
                  <div className="flex items-center gap-6">
                    <span className="text-slate-400">{row.count} requested ({row.share})</span>
                    <span className="text-emerald-400 font-medium">{row.rate} attendance</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: BOOK APPOINTMENT */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" /> Book Software Demonstration
            </h3>
            <form onSubmit={handleCreateRequest} className="space-y-3">
              <div>
                <label className="text-slate-400 mb-1 block">Meeting Type</label>
                <select
                  value={requestForm.appointmentType}
                  onChange={(e) => setRequestForm({ ...requestForm, appointmentType: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                >
                  <option value="SOFTWARE_DEMO">Software Demonstration (30m)</option>
                  <option value="SALES_DISCOVERY">Sales Discovery Meeting (45m)</option>
                  <option value="TECHNICAL_CONSULTATION">Technical Consultation (60m)</option>
                  <option value="CUSTOMER_ONBOARDING">Customer Onboarding (45m)</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 mb-1 block">Customer Name</label>
                <input
                  type="text"
                  required
                  value={requestForm.customerName}
                  onChange={(e) => setRequestForm({ ...requestForm, customerName: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 mb-1 block">Subject</label>
                <input
                  type="text"
                  required
                  value={requestForm.subject}
                  onChange={(e) => setRequestForm({ ...requestForm, subject: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 mb-1 block">Preferred Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value="2026-10-27T14:00"
                  onChange={(e) => setRequestForm({ ...requestForm, startAt: e.target.value + ':00+05:30' })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RESCHEDULE */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" /> Reschedule Appointment
            </h3>
            <div>
              <label className="text-slate-400 mb-1 block">New Slot Time</label>
              <input
                type="datetime-local"
                required
                value="2026-10-27T15:00"
                onChange={(e) => setRescheduleData({ ...rescheduleData, newStartAt: e.target.value + ':00+05:30' })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
              />
            </div>
            <div>
              <label className="text-slate-400 mb-1 block">Reason for Rescheduling</label>
              <textarea
                rows={2}
                value={rescheduleData.reason}
                onChange={(e) => setRescheduleData({ ...rescheduleData, reason: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleReschedule}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold"
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
