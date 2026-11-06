import React, { useState, useEffect } from 'react';
import {
  Users, UserCheck, Clock, CheckCircle2, AlertCircle, Search,
  Calendar, ArrowRight, PlusCircle, CheckCircle, FileText, Phone,
  HelpCircle, Send, CheckSquare, RefreshCw, XCircle, ChevronRight
} from 'lucide-react';
import { hospitalService } from '../../services/hospitalService';

export default function HospitalReceptionistView({ initialSubTab = 'appointments' }) {
  const [activeTab, setActiveTab] = useState(initialSubTab);

  useEffect(() => {
    if (initialSubTab) setActiveTab(initialSubTab);
  }, [initialSubTab]);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Dashboard Data
  const [dashboard, setDashboard] = useState({
    date: '2026-10-27',
    appointmentsToday: 42,
    checkedIn: 18,
    waiting: 7,
    completed: 12,
    myOpenEnquiries: 5,
    myPendingTasks: 3
  });

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState([]);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [queue, setQueue] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [tasks, setTasks] = useState([]);

  // Modals
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);

  // Selected Entities
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [newNoteText, setNewNoteText] = useState('');

  // Forms
  const [newPatient, setNewPatient] = useState({
    fullName: '',
    dateOfBirth: '1998-04-15',
    phone: '',
    email: '',
    preferredLanguage: 'en',
    registrationSource: 'WALK_IN',
    consents: { appointmentNotifications: true, marketingMessages: false }
  });

  const [checkInData, setCheckInData] = useState({
    arrivalChannel: 'FRONT_DESK',
    identityVerified: true,
    administrativeNote: 'Patient arrived at front desk'
  });

  const [walkInData, setWalkInData] = useState({
    patientId: 'pat_7001',
    department: 'GENERAL_MEDICINE',
    arrivalChannel: 'WALK_IN',
    administrativeNote: 'Front desk walk-in'
  });

  const [rescheduleData, setRescheduleData] = useState({
    requestedDate: '2026-10-29',
    preferredTimeWindow: 'AFTERNOON',
    reason: 'Patient requested schedule adjustment'
  });

  const [newEnquiry, setNewEnquiry] = useState({
    patientId: 'pat_7001',
    category: 'APPOINTMENT_INFORMATION',
    channel: 'PHONE',
    subject: '',
    summary: '',
    priority: 'NORMAL'
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashRes, aptRes, qRes, enqRes, taskRes, patRes] = await Promise.allSettled([
        hospitalService.receptionist.getDashboard(),
        hospitalService.receptionist.getTodayAppointments(),
        hospitalService.receptionist.getQueue(),
        hospitalService.receptionist.getEnquiries(),
        hospitalService.receptionist.getTasks(),
        hospitalService.receptionist.searchPatients({ search: searchQuery })
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value?.data?.data) {
        setDashboard(dashRes.value.data.data);
      }
      if (aptRes.status === 'fulfilled' && aptRes.value?.data?.data?.items) {
        setTodayAppointments(aptRes.value.data.data.items);
      } else {
        setTodayAppointments([
          { appointmentId: 'apt_8001', patientReference: 'PAT-1042', patientName: 'Arun Kumar', doctorDisplayName: 'Dr. Example', department: 'GENERAL_MEDICINE', scheduledStart: '2026-10-27T18:30:00+05:30', status: 'BOOKED' }
        ]);
      }
      if (qRes.status === 'fulfilled' && qRes.value?.data?.data?.items) {
        setQueue(qRes.value.data.data.items);
      } else {
        setQueue([
          { queueEntryId: 'queue_9001', patientReference: 'PAT-1042', department: 'GENERAL_MEDICINE', status: 'WAITING', arrivalChannel: 'FRONT_DESK' }
        ]);
      }
      if (enqRes.status === 'fulfilled' && enqRes.value?.data?.data?.items) {
        setEnquiries(enqRes.value.data.data.items);
      } else {
        setEnquiries([
          { enquiryId: 'enq_1101', patientReference: 'PAT-1042', category: 'APPOINTMENT_INFORMATION', status: 'OPEN', assignedTeam: 'RECEPTION' }
        ]);
      }
      if (taskRes.status === 'fulfilled' && taskRes.value?.data?.data) {
        setTasks(taskRes.value.data.data);
      } else {
        setTasks([
          { taskId: 'rec_task_01', title: 'Verify check-in documents for waiting queue', status: 'IN_PROGRESS', priority: 'HIGH' },
          { taskId: 'rec_task_02', title: 'Follow up on phone enquiry for Dr. Example schedule', status: 'PENDING', priority: 'NORMAL' }
        ]);
      }
      if (patRes.status === 'fulfilled' && patRes.value?.data?.data?.items) {
        setPatients(patRes.value.data.data.items);
      } else {
        setPatients([
          { patientId: 'pat_7001', patientReference: 'PAT-1042', fullName: 'Arun Kumar', phoneMasked: '******3210', registrationStatus: 'REGISTERED' }
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery]);

  const handleRegisterPatient = async (e) => {
    e.preventDefault();
    try {
      const res = await hospitalService.receptionist.registerPatient(newPatient);
      if (res.data?.success) {
        showToast('Patient registered successfully: ' + res.data.data.patientReference);
        setShowRegisterModal(false);
        setNewPatient({ fullName: '', dateOfBirth: '1998-04-15', phone: '', email: '', preferredLanguage: 'en', registrationSource: 'WALK_IN', consents: { appointmentNotifications: true, marketingMessages: false } });
        loadData();
      }
    } catch (err) {
      showToast('Registration failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCheckIn = async () => {
    if (!selectedAppointment) return;
    try {
      const res = await hospitalService.receptionist.checkInPatient(selectedAppointment.appointmentId, checkInData);
      if (res.data?.success) {
        showToast(`Patient checked in! Queue entry: ${res.data.data.queueEntryId}`);
        setShowCheckInModal(false);
        loadData();
      }
    } catch (err) {
      showToast('Check-in error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleWalkIn = async (e) => {
    e.preventDefault();
    try {
      const res = await hospitalService.receptionist.registerWalkIn(walkInData);
      if (res.data?.success) {
        showToast(`Walk-in added to queue: ${res.data.data.queueEntryId}`);
        setShowWalkInModal(false);
        loadData();
      }
    } catch (err) {
      showToast('Walk-in registration error');
    }
  };

  const handleRequestReschedule = async () => {
    if (!selectedAppointment) return;
    try {
      const res = await hospitalService.receptionist.requestReschedule(selectedAppointment.appointmentId, rescheduleData);
      if (res.data?.success) {
        showToast(`Reschedule request submitted: ${res.data.data.requestId}`);
        setShowRescheduleModal(false);
        loadData();
      }
    } catch (err) {
      showToast('Reschedule error');
    }
  };

  const handleCreateEnquiry = async (e) => {
    e.preventDefault();
    try {
      const res = await hospitalService.receptionist.createEnquiry(newEnquiry);
      if (res.data?.success) {
        showToast(`Enquiry logged: ${res.data.data.enquiryId}`);
        setShowEnquiryModal(false);
        setNewEnquiry({ patientId: 'pat_7001', category: 'APPOINTMENT_INFORMATION', channel: 'PHONE', subject: '', summary: '', priority: 'NORMAL' });
        loadData();
      }
    } catch (err) {
      showToast('Error logging enquiry');
    }
  };

  const handleAddNote = async (enquiryId) => {
    if (!newNoteText.trim()) return;
    try {
      await hospitalService.receptionist.addEnquiryNote(enquiryId, { note: newNoteText, visibility: 'INTERNAL' });
      showToast('Administrative note added!');
      setNewNoteText('');
      loadData();
    } catch (err) {
      showToast('Error adding note');
    }
  };

  const handleHandoff = async (enquiryId) => {
    try {
      await hospitalService.receptionist.handoffEnquiry(enquiryId, { targetTeam: 'APPOINTMENT_COORDINATION', reason: 'Requires coordinator slot confirmation' });
      showToast('Enquiry transferred to Appointment Coordination!');
      loadData();
    } catch (err) {
      showToast('Handoff error');
    }
  };

  const handleToggleTask = async (taskId, currentStatus) => {
    const newStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      await hospitalService.receptionist.updateTaskStatus(taskId, newStatus);
      showToast(`Task status updated to ${newStatus}`);
      loadData();
    } catch (err) {
      showToast('Task update error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 lg:p-8 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-2 border border-emerald-400/30 animate-bounce">
          <CheckCircle className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-950/70 via-indigo-900/40 to-slate-900/80 border border-blue-500/30 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-200 text-sm">Front-Desk Reception Workstation</h4>
            <p className="text-xs text-blue-300/80">
              Check in scheduled patients, register walk-ins, log enquiries, and route rescheduling requests.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRegisterModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-medium shadow-md shadow-blue-600/30 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Register Patient</span>
          </button>
          <button
            onClick={() => setShowWalkInModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium shadow-md shadow-emerald-600/30 transition"
          >
            <Clock className="w-4 h-4" />
            <span>Add Walk-In</span>
          </button>
        </div>
      </div>

      {/* Dashboard KPI Bar */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <p className="text-xs text-slate-400">Today's Total</p>
          <p className="text-xl font-bold text-white mt-1">{dashboard.appointmentsToday}</p>
          <span className="text-[10px] text-blue-400 font-medium">Appointments</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <p className="text-xs text-slate-400">Checked In</p>
          <p className="text-xl font-bold text-emerald-400 mt-1">{dashboard.checkedIn}</p>
          <span className="text-[10px] text-emerald-300 font-medium">Arrived</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <p className="text-xs text-slate-400">Waiting in Lobby</p>
          <p className="text-xl font-bold text-amber-400 mt-1">{dashboard.waiting}</p>
          <span className="text-[10px] text-amber-300 font-medium">In Queue</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <p className="text-xs text-slate-400">Completed</p>
          <p className="text-xl font-bold text-sky-400 mt-1">{dashboard.completed}</p>
          <span className="text-[10px] text-sky-300 font-medium">Consulted</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <p className="text-xs text-slate-400">My Enquiries</p>
          <p className="text-xl font-bold text-purple-400 mt-1">{dashboard.myOpenEnquiries}</p>
          <span className="text-[10px] text-purple-300 font-medium">Assigned</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <p className="text-xs text-slate-400">Pending Tasks</p>
          <p className="text-xl font-bold text-rose-400 mt-1">{dashboard.myPendingTasks}</p>
          <span className="text-[10px] text-rose-300 font-medium">To Do</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'appointments', label: "Today's Appointments", icon: Calendar },
          { id: 'patients', label: 'Patient Directory & Search', icon: Users },
          { id: 'queue', label: 'Reception Queue', icon: Clock },
          { id: 'enquiries', label: 'Patient Enquiries', icon: HelpCircle },
          { id: 'tasks', label: 'My Front Desk Tasks', icon: CheckSquare }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Today's Appointments & Check-in */}
      {activeTab === 'appointments' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg text-white">Today's Appointment Schedule</h3>
            <span className="text-xs text-slate-400">Date: 2026-10-27</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Apt ID</th>
                  <th className="px-4 py-3">Patient Ref</th>
                  <th className="px-4 py-3">Patient Name</th>
                  <th className="px-4 py-3">Doctor</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {todayAppointments.map((apt) => (
                  <tr key={apt.appointmentId} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{apt.appointmentId}</td>
                    <td className="px-4 py-3 font-bold text-white">{apt.patientReference}</td>
                    <td className="px-4 py-3 text-slate-200">{apt.patientName}</td>
                    <td className="px-4 py-3 text-blue-400">{apt.doctorDisplayName}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{apt.department}</td>
                    <td className="px-4 py-3 font-mono text-xs text-amber-300">{apt.scheduledStart?.split('T')[1]?.substring(0, 5) || '18:30'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                        apt.status === 'CHECKED_IN'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 space-x-2">
                      {apt.status !== 'CHECKED_IN' && (
                        <button
                          onClick={() => {
                            setSelectedAppointment(apt);
                            setShowCheckInModal(true);
                          }}
                          className="text-xs px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium shadow-sm transition"
                        >
                          Check In
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedAppointment(apt);
                          setShowRescheduleModal(true);
                        }}
                        className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700"
                      >
                        Reschedule Req
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Patient Directory & Search */}
      {activeTab === 'patients' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-lg text-white">Patient Search & Directory</h3>
              <p className="text-xs text-slate-400">Search by patient reference, name, or phone number.</p>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search patient..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Patient ID</th>
                  <th className="px-4 py-3">Patient Reference</th>
                  <th className="px-4 py-3">Full Name</th>
                  <th className="px-4 py-3">Phone (Masked)</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {patients.map((pat) => (
                  <tr key={pat.patientId} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{pat.patientId}</td>
                    <td className="px-4 py-3 font-bold text-white">{pat.patientReference}</td>
                    <td className="px-4 py-3 text-slate-200">{pat.fullName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{pat.phoneMasked || '******3210'}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {pat.registrationStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Reception Queue */}
      {activeTab === 'queue' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg text-white">Active Reception Queue</h3>
            <button
              onClick={() => setShowWalkInModal(true)}
              className="text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium"
            >
              Add Walk-In to Queue
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Queue ID</th>
                  <th className="px-4 py-3">Patient Ref</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Channel</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {queue.map((q) => (
                  <tr key={q.queueEntryId} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{q.queueEntryId}</td>
                    <td className="px-4 py-3 font-bold text-white">{q.patientReference}</td>
                    <td className="px-4 py-3 text-xs text-slate-300">{q.department || 'GENERAL_MEDICINE'}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{q.arrivalChannel || 'FRONT_DESK'}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {q.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Patient Enquiries */}
      {activeTab === 'enquiries' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg text-white">Patient Enquiries</h3>
            <button
              onClick={() => setShowEnquiryModal(true)}
              className="text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium"
            >
              New Enquiry
            </button>
          </div>

          <div className="space-y-3">
            {enquiries.map((enq) => (
              <div key={enq.enquiryId} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs text-blue-400 font-bold">{enq.enquiryId}</span>
                    <span className="text-sm font-semibold text-white">{enq.patientReference}</span>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {enq.status}
                  </span>
                </div>
                <p className="text-xs text-slate-300">{enq.subject || enq.category}</p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                  <span className="text-slate-400">Team: {enq.assignedTeam}</span>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleHandoff(enq.enquiryId)}
                      className="px-2.5 py-1 bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600/50 rounded-lg border border-indigo-500/30"
                    >
                      Handoff to Scheduling
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: My Tasks */}
      {activeTab === 'tasks' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-lg text-white">My Reception Checklist</h3>
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.taskId}
                onClick={() => handleToggleTask(task.taskId, task.status)}
                className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:bg-slate-800/40 transition"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                    task.status === 'COMPLETED' ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-700'
                  }`}>
                    {task.status === 'COMPLETED' && <CheckCircle className="w-3.5 h-3.5" />}
                  </div>
                  <span className={`text-sm ${task.status === 'COMPLETED' ? 'line-through text-slate-500' : 'text-white'}`}>
                    {task.title}
                  </span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  task.priority === 'HIGH' ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-400'
                }`}>
                  {task.priority || 'NORMAL'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Check-In Modal */}
      {showCheckInModal && selectedAppointment && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Check In Patient</h3>
            <p className="text-xs text-slate-400">
              Appointment: {selectedAppointment.appointmentId} — {selectedAppointment.patientName} ({selectedAppointment.patientReference})
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Arrival Channel</label>
                <select
                  value={checkInData.arrivalChannel}
                  onChange={(e) => setCheckInData({ ...checkInData, arrivalChannel: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="FRONT_DESK">Front Desk Lobby</option>
                  <option value="KIOSK">Self-Service Kiosk</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="idVerify"
                  checked={checkInData.identityVerified}
                  onChange={(e) => setCheckInData({ ...checkInData, identityVerified: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-950"
                />
                <label htmlFor="idVerify" className="text-xs text-slate-300">Identity Verified with Photo ID</label>
              </div>
              <div>
                <label className="text-xs text-slate-400">Administrative Note</label>
                <input
                  type="text"
                  value={checkInData.administrativeNote}
                  onChange={(e) => setCheckInData({ ...checkInData, administrativeNote: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button onClick={() => setShowCheckInModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm">
                Cancel
              </button>
              <button onClick={handleCheckIn} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium">
                Confirm Check-In
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register Patient Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Register New Patient</h3>
            <form onSubmit={handleRegisterPatient} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Arun Kumar"
                  value={newPatient.fullName}
                  onChange={(e) => setNewPatient({ ...newPatient, fullName: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Phone</label>
                <input
                  type="text"
                  required
                  placeholder="+91 98765 43210"
                  value={newPatient.phone}
                  onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Email Address</label>
                <input
                  type="email"
                  placeholder="patient@example.com"
                  value={newPatient.email}
                  onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="consentNotif"
                  checked={newPatient.consents.appointmentNotifications}
                  onChange={(e) => setNewPatient({ ...newPatient, consents: { ...newPatient.consents, appointmentNotifications: e.target.checked } })}
                  className="rounded border-slate-700 bg-slate-950"
                />
                <label htmlFor="consentNotif" className="text-xs text-slate-300">Consent for appointment notifications (SMS/WhatsApp)</label>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowRegisterModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium">
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Walk-In Modal */}
      {showWalkInModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Register Walk-In Patient</h3>
            <form onSubmit={handleWalkIn} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Registered Patient ID</label>
                <input
                  type="text"
                  required
                  value={walkInData.patientId}
                  onChange={(e) => setWalkInData({ ...walkInData, patientId: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Department</label>
                <select
                  value={walkInData.department}
                  onChange={(e) => setWalkInData({ ...walkInData, department: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="GENERAL_MEDICINE">General Medicine</option>
                  <option value="CARDIOLOGY">Cardiology Clinic</option>
                  <option value="PEDIATRICS">Pediatrics & Child Wellness</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowWalkInModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium">
                  Add to Waiting Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reschedule Request Modal */}
      {showRescheduleModal && selectedAppointment && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Submit Reschedule Request</h3>
            <p className="text-xs text-slate-400">Appointment: {selectedAppointment.appointmentId} for {selectedAppointment.patientName}</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Requested Date</label>
                <input
                  type="date"
                  value={rescheduleData.requestedDate}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, requestedDate: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Time Window</label>
                <select
                  value={rescheduleData.preferredTimeWindow}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, preferredTimeWindow: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="MORNING">Morning (09:00 - 12:00)</option>
                  <option value="AFTERNOON">Afternoon (14:00 - 17:00)</option>
                  <option value="EVENING">Evening (17:00 - 20:00)</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400">Reason</label>
                <input
                  type="text"
                  value={rescheduleData.reason}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, reason: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button onClick={() => setShowRescheduleModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm">
                Cancel
              </button>
              <button onClick={handleRequestReschedule} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium">
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Enquiry Modal */}
      {showEnquiryModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Create Patient Enquiry</h3>
            <form onSubmit={handleCreateEnquiry} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Question about appointment timing"
                  value={newEnquiry.subject}
                  onChange={(e) => setNewEnquiry({ ...newEnquiry, subject: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Category</label>
                <select
                  value={newEnquiry.category}
                  onChange={(e) => setNewEnquiry({ ...newEnquiry, category: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="APPOINTMENT_INFORMATION">Appointment Information</option>
                  <option value="DOCTOR_SCHEDULE">Doctor Schedule Inquiry</option>
                  <option value="BILLING_GENERAL">General Billing/Pricing</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setShowEnquiryModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium">
                  Create Enquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
