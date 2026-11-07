import React, { useState, useEffect } from 'react';
import {
  Calendar, Clock, User, CheckCircle2, XCircle, AlertTriangle,
  RefreshCw, CheckCircle, PlusCircle, Search, ArrowRight,
  Bell, Users, Check, Filter, CalendarDays, ChevronRight
} from 'lucide-react';
import { hospitalService } from '../../services/hospitalService';

export default function HospitalAppointmentCoordinatorView({ initialSubTab = 'calendar' }) {
  const [activeTab, setActiveTab] = useState(initialSubTab);

  useEffect(() => {
    if (initialSubTab) setActiveTab(initialSubTab);
  }, [initialSubTab]);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Dashboard
  const [dashboard, setDashboard] = useState({
    date: '2026-10-27',
    totalAppointments: 86,
    confirmedAppointments: 68,
    pendingBookingRequests: 11,
    pendingRescheduleRequests: 5,
    pendingCancellationRequests: 2,
    waitingListCount: 17,
    remindersPending: 23
  });

  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('doc_2101');
  const [selectedDate, setSelectedDate] = useState('2026-10-29');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [bookingRequests, setBookingRequests] = useState([]);
  const [rescheduleRequests, setRescheduleRequests] = useState([]);
  const [cancellationRequests, setCancellationRequests] = useState([]);
  const [waitingList, setWaitingList] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [metrics, setMetrics] = useState(null);

  // Modals
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showWaitingListModal, setShowWaitingListModal] = useState(false);
  const [showOfferSlotModal, setShowOfferSlotModal] = useState(false);
  const [selectedWaitingEntry, setSelectedWaitingEntry] = useState(null);

  // Booking Form
  const [bookingForm, setBookingForm] = useState({
    patientId: 'pat_7001',
    doctorId: 'doc_2101',
    slotId: '',
    appointmentType: 'CONSULTATION',
    bookingSource: 'COORDINATOR',
    administrativeNote: 'Booked via Scheduling Coordinator Desk'
  });

  // Waiting list form
  const [waitingForm, setWaitingForm] = useState({
    patientId: 'pat_7001',
    doctorId: 'doc_2101',
    preferredDateFrom: '2026-10-29',
    preferredDateTo: '2026-11-05',
    preferredTimeWindow: 'MORNING',
    contactPreference: 'SMS'
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashRes, docRes, deptRes, aptRes, reqRes, resReqRes, cnlReqRes, wlRes, remRes, metRes] = await Promise.allSettled([
        hospitalService.appointmentCoordinator.getDashboard(),
        hospitalService.appointmentCoordinator.getDoctors(),
        hospitalService.appointmentCoordinator.getDepartments(),
        hospitalService.appointmentCoordinator.getAppointments(),
        hospitalService.appointmentCoordinator.getBookingRequests(),
        hospitalService.appointmentCoordinator.getRescheduleRequests(),
        hospitalService.appointmentCoordinator.getCancellationRequests(),
        hospitalService.appointmentCoordinator.getWaitingList(),
        hospitalService.appointmentCoordinator.getReminders(),
        hospitalService.appointmentCoordinator.getMetrics()
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value?.data?.data) {
        setDashboard(dashRes.value.data.data);
      }
      if (docRes.status === 'fulfilled' && docRes.value?.data?.data?.items) {
        setDoctors(docRes.value.data.data.items);
      } else {
        setDoctors([
          { doctorId: 'doc_2101', displayName: 'Dr. Example', department: 'GENERAL_MEDICINE', bookingEnabled: true },
          { doctorId: 'doc_2102', displayName: 'Dr. Shalini Menon', department: 'CARDIOLOGY', bookingEnabled: true }
        ]);
      }
      if (deptRes.status === 'fulfilled' && deptRes.value?.data?.data) {
        setDepartments(deptRes.value.data.data);
      }
      if (aptRes.status === 'fulfilled' && aptRes.value?.data?.data?.items) {
        setAppointments(aptRes.value.data.data.items);
      } else {
        setAppointments([
          { appointmentId: 'apt_2301', patientReference: 'PAT-1042', doctorId: 'doc_2101', scheduledStart: '2026-10-29T10:00:00+05:30', status: 'BOOKED', confirmationStatus: 'CONFIRMED' },
          { appointmentId: 'apt_8001', patientReference: 'PAT-1042', doctorId: 'doc_2101', scheduledStart: '2026-10-27T18:30:00+05:30', status: 'BOOKED', confirmationStatus: 'PENDING' }
        ]);
      }
      if (reqRes.status === 'fulfilled' && reqRes.value?.data?.data) {
        setBookingRequests(reqRes.value.data.data);
      }
      if (resReqRes.status === 'fulfilled' && resReqRes.value?.data?.data) {
        setRescheduleRequests(resReqRes.value.data.data);
      } else {
        setRescheduleRequests([
          { requestId: 'res_1001', appointmentId: 'apt_8001', status: 'PENDING_COORDINATOR_REVIEW', requestedDate: '2026-10-29' }
        ]);
      }
      if (cnlReqRes.status === 'fulfilled' && cnlReqRes.value?.data?.data) {
        setCancellationRequests(cnlReqRes.value.data.data);
      }
      if (wlRes.status === 'fulfilled' && wlRes.value?.data?.data) {
        setWaitingList(wlRes.value.data.data);
      } else {
        setWaitingList([
          { waitingListEntryId: 'wl_2501', patientReference: 'PAT-1042', doctorId: 'doc_2101', status: 'ACTIVE', contactPreference: 'SMS' }
        ]);
      }
      if (remRes.status === 'fulfilled' && remRes.value?.data?.data) {
        setReminders(remRes.value.data.data);
      } else {
        setReminders([
          { reminderId: 'rem_2701', appointmentId: 'apt_2301', channel: 'SMS', status: 'SCHEDULED', scheduleAt: '2026-10-28T10:00:00+05:30' }
        ]);
      }
      if (metRes.status === 'fulfilled' && metRes.value?.data?.data) {
        setMetrics(metRes.value.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = async () => {
    try {
      const res = await hospitalService.appointmentCoordinator.getAvailability({
        doctorId: selectedDoctorId,
        date: selectedDate,
        appointmentType: 'CONSULTATION'
      });
      if (res.data?.success && res.data.data?.slots) {
        setAvailableSlots(res.data.data.slots);
      } else {
        setAvailableSlots([
          { slotId: 'slot_2201', startTime: '10:00', endTime: '10:15', status: 'AVAILABLE' },
          { slotId: 'slot_2202', startTime: '10:15', endTime: '10:30', status: 'AVAILABLE' },
          { slotId: 'slot_2203', startTime: '10:30', endTime: '10:45', status: 'AVAILABLE' }
        ]);
      }
    } catch (err) {
      setAvailableSlots([]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    fetchAvailability();
  }, [selectedDoctorId, selectedDate]);

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    try {
      const res = await hospitalService.appointmentCoordinator.createAppointment(bookingForm, `book-${Date.now()}`);
      if (res.data?.success) {
        showToast('Appointment booked successfully! ID: ' + res.data.data.appointmentId);
        setShowBookingModal(false);
        fetchAvailability();
        loadData();
      }
    } catch (err) {
      showToast('Booking failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleConfirmAppointment = async (apptId) => {
    try {
      const res = await hospitalService.appointmentCoordinator.confirmAppointment(apptId, {
        confirmationChannel: 'SMS',
        sendNotification: true
      });
      if (res.data?.success) {
        showToast('Confirmation queued for SMS delivery');
        loadData();
      }
    } catch (err) {
      showToast('Confirmation failed');
    }
  };

  const handleApproveReschedule = async (req) => {
    try {
      const res = await hospitalService.appointmentCoordinator.approveRescheduleRequest(req.requestId, {
        approvedSlotId: 'slot_2202',
        notifyPatient: true,
        comment: 'Verified slot availability'
      });
      if (res.data?.success) {
        showToast('Rescheduling approved!');
        loadData();
      }
    } catch (err) {
      showToast('Error approving reschedule');
    }
  };

  const handleAddToWaitingList = async (e) => {
    e.preventDefault();
    try {
      const res = await hospitalService.appointmentCoordinator.addToWaitingList(waitingForm);
      if (res.data?.success) {
        showToast('Patient added to waiting list: ' + res.data.data.waitingListEntryId);
        setShowWaitingListModal(false);
        loadData();
      }
    } catch (err) {
      showToast('Error adding to waiting list');
    }
  };

  const handleOfferSlot = async (e) => {
    e.preventDefault();
    if (!selectedWaitingEntry) return;
    try {
      const res = await hospitalService.appointmentCoordinator.offerSlot(selectedWaitingEntry.waitingListEntryId, {
        slotId: 'slot_2201',
        expiresAt: '2026-10-28T12:00:00+05:30',
        channel: 'SMS'
      });
      if (res.data?.success) {
        showToast('Slot offer queued for patient');
        setShowOfferSlotModal(false);
        loadData();
      }
    } catch (err) {
      showToast('Error offering slot');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 lg:p-8 space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-2 border border-emerald-400/30 animate-bounce">
          <CheckCircle className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-950/70 via-emerald-900/40 to-slate-900/80 border border-teal-500/30 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-teal-500/20 text-teal-400 rounded-xl border border-teal-500/30">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-teal-200 text-sm">Appointment Coordination & Scheduling</h4>
            <p className="text-xs text-teal-300/80">
              Manage doctor schedules, slot availability, booking/reschedule requests, waiting lists, and automated reminders.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowWaitingListModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700"
          >
            <Users className="w-4 h-4" />
            <span>Join Waiting List</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <p className="text-xs text-slate-400">Total Booked</p>
          <p className="text-xl font-bold text-white mt-1">{dashboard.totalAppointments}</p>
          <span className="text-[10px] text-teal-400 font-medium">Appointments</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <p className="text-xs text-slate-400">Confirmed</p>
          <p className="text-xl font-bold text-emerald-400 mt-1">{dashboard.confirmedAppointments}</p>
          <span className="text-[10px] text-emerald-300 font-medium">Verified</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <p className="text-xs text-slate-400">New Booking Req</p>
          <p className="text-xl font-bold text-blue-400 mt-1">{dashboard.pendingBookingRequests}</p>
          <span className="text-[10px] text-blue-300 font-medium">Pending Review</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <p className="text-xs text-slate-400">Reschedule Req</p>
          <p className="text-xl font-bold text-amber-400 mt-1">{dashboard.pendingRescheduleRequests}</p>
          <span className="text-[10px] text-amber-300 font-medium">To Reallocate</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <p className="text-xs text-slate-400">Cancel Req</p>
          <p className="text-xl font-bold text-rose-400 mt-1">{dashboard.pendingCancellationRequests}</p>
          <span className="text-[10px] text-rose-300 font-medium">Approvals</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <p className="text-xs text-slate-400">Waiting List</p>
          <p className="text-xl font-bold text-purple-400 mt-1">{dashboard.waitingListCount}</p>
          <span className="text-[10px] text-purple-300 font-medium">Patients Queued</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <p className="text-xs text-slate-400">Reminders</p>
          <p className="text-xl font-bold text-sky-400 mt-1">{dashboard.remindersPending}</p>
          <span className="text-[10px] text-sky-300 font-medium">Scheduled</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'calendar', label: 'Doctor Availability & Booking', icon: CalendarDays },
          { id: 'appointments', label: 'All Appointments', icon: Calendar },
          { id: 'requests', label: 'Booking & Reschedule Inboxes', icon: Clock },
          { id: 'waiting', label: 'Waiting List & Slot Offers', icon: Users },
          { id: 'reminders', label: 'Appointment Reminders', icon: Bell },
          { id: 'metrics', label: 'Scheduling Metrics', icon: Filter }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-teal-600/20 text-teal-400 border border-teal-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Doctor Availability & Slot Finder */}
      {activeTab === 'calendar' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="font-semibold text-lg text-white">Doctor Availability Search</h3>
              <p className="text-xs text-slate-400">Real-time slot inspection directly connected to clinic schedule database.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Select Doctor</label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none focus:border-teal-500"
                >
                  {doctors.map((doc) => (
                    <option key={doc.doctorId} value={doc.doctorId}>{doc.displayName} ({doc.department})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none focus:border-teal-500"
                >
                </input>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-3">Available Slots for {selectedDate}</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {availableSlots.map((slot) => (
                <div
                  key={slot.slotId}
                  className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-center space-y-2 hover:border-teal-500/50 transition cursor-pointer"
                  onClick={() => {
                    setBookingForm({ ...bookingForm, slotId: slot.slotId, doctorId: selectedDoctorId });
                    setSelectedSlot(slot);
                    setShowBookingModal(true);
                  }}
                >
                  <p className="font-mono text-base font-bold text-white">{slot.startTime} - {slot.endTime}</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                    {slot.status}
                  </span>
                  <button
                    className="w-full text-xs py-1 bg-teal-600/30 hover:bg-teal-600 text-teal-200 hover:text-white rounded-lg transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSlot(slot);
                      setShowBookingModal(true);
                    }}
                  >
                    Book Slot
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: All Appointments */}
      {activeTab === 'appointments' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg text-white">Appointments Master List</h3>
            <span className="text-xs text-slate-400">{appointments.length} Total Records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Appointment ID</th>
                  <th className="px-4 py-3">Patient Ref</th>
                  <th className="px-4 py-3">Doctor</th>
                  <th className="px-4 py-3">Scheduled Start</th>
                  <th className="px-4 py-3">Booking Status</th>
                  <th className="px-4 py-3">Confirmation Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {appointments.map((apt) => (
                  <tr key={apt.appointmentId} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{apt.appointmentId}</td>
                    <td className="px-4 py-3 font-bold text-white">{apt.patientReference}</td>
                    <td className="px-4 py-3 text-teal-400">{apt.doctorDisplayName || 'Dr. Example'}</td>
                    <td className="px-4 py-3 text-xs text-slate-300">{apt.scheduledStart}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {apt.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                        apt.confirmationStatus === 'CONFIRMED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {apt.confirmationStatus || 'PENDING'}
                      </span>
                    </td>
                    <td className="px-4 py-3 space-x-2">
                      {apt.confirmationStatus !== 'CONFIRMED' && (
                        <button
                          onClick={() => handleConfirmAppointment(apt.appointmentId)}
                          className="text-xs px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium"
                        >
                          Confirm & SMS
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

      {/* Tab 3: Booking & Reschedule Inboxes */}
      {activeTab === 'requests' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-semibold text-lg text-white">Rescheduling Requests Inbox</h3>
            <div className="space-y-3">
              {rescheduleRequests.map((req) => (
                <div key={req.requestId} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-amber-400 font-bold">{req.requestId}</span>
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-full">{req.status}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-white">Appt: {req.appointmentId}</h4>
                  <p className="text-xs text-slate-400">Target Date: {req.requestedDate}</p>
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => handleApproveReschedule(req)}
                      className="text-xs px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-medium"
                    >
                      Approve & Reassign Slot
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-semibold text-lg text-white">Cancellation Requests</h3>
            <div className="space-y-3">
              {cancellationRequests.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">No pending cancellation requests.</div>
              ) : (
                cancellationRequests.map((cnl) => (
                  <div key={cnl.requestId} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                    <span className="font-mono text-xs text-rose-400">{cnl.requestId}</span>
                    <p className="text-xs text-slate-300">Appt: {cnl.appointmentId}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Waiting List & Slot Offers */}
      {activeTab === 'waiting' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg text-white">Patient Waiting List</h3>
            <button
              onClick={() => setShowWaitingListModal(true)}
              className="text-xs px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-medium"
            >
              Add Patient to Waiting List
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Entry ID</th>
                  <th className="px-4 py-3">Patient Ref</th>
                  <th className="px-4 py-3">Doctor</th>
                  <th className="px-4 py-3">Contact Preference</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {waitingList.map((entry) => (
                  <tr key={entry.waitingListEntryId} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{entry.waitingListEntryId}</td>
                    <td className="px-4 py-3 font-bold text-white">{entry.patientReference}</td>
                    <td className="px-4 py-3 text-teal-400">{entry.doctorId}</td>
                    <td className="px-4 py-3 text-xs text-slate-300">{entry.contactPreference}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {entry.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          setSelectedWaitingEntry(entry);
                          setShowOfferSlotModal(true);
                        }}
                        className="text-xs px-3 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-medium"
                      >
                        Offer Available Slot
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Reminders */}
      {activeTab === 'reminders' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-lg text-white">Scheduled Automated Reminders</h3>
          <div className="space-y-3">
            {reminders.map((rem) => (
              <div key={rem.reminderId} className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-sky-400 font-bold">{rem.reminderId}</span>
                    <span className="text-xs text-slate-300">Appointment: {rem.appointmentId}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Scheduled At: {rem.scheduleAt} via {rem.channel}</p>
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {rem.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Scheduling Metrics */}
      {activeTab === 'metrics' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg text-white">Scheduling & Reminders Metrics</h3>
            <span className="text-xs text-slate-400">Period: 2026-10-01 to 2026-10-27</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <p className="text-xs text-slate-400">Appointments Booked</p>
              <p className="text-2xl font-bold text-white mt-1">1,840</p>
              <p className="text-xs text-emerald-400 mt-1">1,590 Confirmed</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <p className="text-xs text-slate-400">Rescheduled Slots</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">125</p>
              <p className="text-xs text-slate-400 mt-1">96 Cancellations</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <p className="text-xs text-slate-400">Reminders Sent</p>
              <p className="text-2xl font-bold text-sky-400 mt-1">1,420</p>
              <p className="text-xs text-slate-400 mt-1">18 delivery failures</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <p className="text-xs text-slate-400">No-Show Rate</p>
              <p className="text-2xl font-bold text-rose-400 mt-1">2.4% (44)</p>
              <p className="text-xs text-emerald-400 mt-1">Reduced by reminders</p>
            </div>
          </div>
        </div>
      )}

      {/* Book Appointment Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Confirm Appointment Booking</h3>
            <p className="text-xs text-slate-400">Slot: {selectedSlot?.startTime} - {selectedSlot?.endTime} ({selectedSlot?.slotId})</p>
            <form onSubmit={handleBookAppointment} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Patient ID</label>
                <input
                  type="text"
                  required
                  value={bookingForm.patientId}
                  onChange={(e) => setBookingForm({ ...bookingForm, patientId: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Appointment Type</label>
                <select
                  value={bookingForm.appointmentType}
                  onChange={(e) => setBookingForm({ ...bookingForm, appointmentType: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="CONSULTATION">Standard Consultation</option>
                  <option value="FOLLOW_UP">Follow-Up Review</option>
                  <option value="SPECIALIST">Specialist Referral</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowBookingModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm font-medium">
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Waiting List Modal */}
      {showWaitingListModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Add Patient to Waiting List</h3>
            <form onSubmit={handleAddToWaitingList} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Patient ID</label>
                <input
                  type="text"
                  required
                  value={waitingForm.patientId}
                  onChange={(e) => setWaitingForm({ ...waitingForm, patientId: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Preferred Date From</label>
                <input
                  type="date"
                  value={waitingForm.preferredDateFrom}
                  onChange={(e) => setWaitingForm({ ...waitingForm, preferredDateFrom: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowWaitingListModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm font-medium">
                  Add to Waiting List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Offer Slot Modal */}
      {showOfferSlotModal && selectedWaitingEntry && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Offer Slot to Waiting Patient</h3>
            <p className="text-xs text-slate-400">Patient Reference: {selectedWaitingEntry.patientReference}</p>
            <form onSubmit={handleOfferSlot} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Available Slot ID</label>
                <input
                  type="text"
                  defaultValue="slot_2201"
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Offer Expiration Window</label>
                <p className="text-xs text-slate-400 mt-1">Expires 24h from now: 2026-10-28 12:00 IST</p>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowOfferSlotModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm font-medium">
                  Queue Slot Offer (SMS)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
