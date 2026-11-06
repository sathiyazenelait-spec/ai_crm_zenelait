import React, { useState, useEffect } from 'react';
import {
  Users, UserPlus, Clock, AlertTriangle, Shield, CheckCircle2,
  TrendingUp, FileText, Bot, ArrowRight, RefreshCw, Search,
  Sliders, Activity, Phone, Mail, ChevronRight, CheckCircle,
  HelpCircle, Settings, Calendar, Award
} from 'lucide-react';
import { hospitalService } from '../../services/hospitalService';

export default function HospitalReceptionManagerView({ initialSubTab = 'dashboard' }) {
  const [activeTab, setActiveTab] = useState(initialSubTab);

  useEffect(() => {
    if (initialSubTab) setActiveTab(initialSubTab);
  }, [initialSubTab]);
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    date: '2026-10-27',
    appointmentsToday: 86,
    checkedInPatients: 31,
    waitingPatients: 12,
    openPatientEnquiries: 18,
    unassignedEnquiries: 4,
    openEscalations: 3,
    availableReceptionists: 5,
    averageAdministrativeWaitingMinutes: 14
  });

  const [staffList, setStaffList] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [queue, setQueue] = useState([]);
  const [escalations, setEscalations] = useState([]);
  const [auditEvents, setAuditEvents] = useState([]);
  const [aiConfig, setAiConfig] = useState({
    autoReplyEnabled: false,
    humanReviewRequired: true,
    escalateExplicitEmergency: true,
    emergencyProtocolContact: '+91 44 2800 9900',
    prohibitMedicalDiagnosis: true,
    tone: 'EMPATHIC_PROFESSIONAL'
  });

  // Modals
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', email: '', phone: '', role: 'RECEPTIONIST', department: 'FRONT_DESK' });
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [assigneeId, setAssigneeId] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [dashRes, staffRes, enqRes, qRes, escRes, aiRes, audRes] = await Promise.allSettled([
        hospitalService.receptionManager.getDashboard(),
        hospitalService.receptionManager.getStaff({ page: 0, size: 20 }),
        hospitalService.receptionManager.getPatientEnquiries({ page: 0, size: 20 }),
        hospitalService.receptionManager.getQueue({ status: 'WAITING' }),
        hospitalService.receptionManager.getEscalations({ page: 0, size: 20 }),
        hospitalService.receptionManager.getAiConfig(),
        hospitalService.receptionManager.getAuditEvents({ page: 0, size: 20 })
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value?.data?.data) {
        setDashboardData(dashRes.value.data.data);
      }
      if (staffRes.status === 'fulfilled' && staffRes.value?.data?.data?.items) {
        setStaffList(staffRes.value.data.data.items);
      } else {
        setStaffList([
          { staffId: 'staff_2001', name: 'Priya Kumar', email: 'priya.reception@example.com', role: 'RECEPTIONIST', department: 'FRONT_DESK', status: 'ACTIVE', openAssignments: 7 }
        ]);
      }
      if (enqRes.status === 'fulfilled' && enqRes.value?.data?.data?.items) {
        setEnquiries(enqRes.value.data.data.items);
      } else {
        setEnquiries([
          { enquiryId: 'enq_3001', patientReference: 'PAT-1042', subject: 'Front desk follow-up required', category: 'ADMINISTRATIVE', priority: 'HIGH', status: 'ASSIGNED', assignedToStaffId: 'staff_2001' }
        ]);
      }
      if (qRes.status === 'fulfilled' && qRes.value?.data?.data?.items) {
        setQueue(qRes.value.data.data.items);
      } else {
        setQueue([
          { queueEntryId: 'queue_4001', patientReference: 'PAT-1042', checkInTime: '2026-10-27T17:42:00+05:30', status: 'WAITING', administrativeWaitMinutes: 18 }
        ]);
      }
      if (escRes.status === 'fulfilled' && escRes.value?.data?.data?.items) {
        setEscalations(escRes.value.data.data.items);
      } else {
        setEscalations([
          { escalationId: 'esc_6001', enquiryId: 'enq_3001', category: 'UNRESOLVED_ADMINISTRATIVE_REQUEST', status: 'OPEN', assignedToStaffId: 'staff_2001' }
        ]);
      }
      if (aiRes.status === 'fulfilled' && aiRes.value?.data?.data) {
        setAiConfig(aiRes.value.data.data);
      }
      if (audRes.status === 'fulfilled' && audRes.value?.data?.data?.items) {
        setAuditEvents(audRes.value.data.data.items);
      }
    } catch (err) {
      console.error('Error fetching reception manager data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      const res = await hospitalService.receptionManager.createStaff(newStaff);
      if (res.data?.success) {
        showToast('Receptionist account created successfully!');
        setShowStaffModal(false);
        setNewStaff({ name: '', email: '', phone: '', role: 'RECEPTIONIST', department: 'FRONT_DESK' });
        loadAllData();
      }
    } catch (err) {
      showToast('Error creating receptionist account: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleAssignEnquiry = async (enquiryId) => {
    if (!assigneeId) return;
    try {
      await hospitalService.receptionManager.assignEnquiry(enquiryId, {
        assignedToStaffId: assigneeId,
        reason: 'Manager administrative dispatch'
      });
      showToast('Enquiry assigned successfully!');
      setSelectedEnquiry(null);
      loadAllData();
    } catch (err) {
      showToast('Error assigning enquiry');
    }
  };

  const handleUpdatePriority = async (enquiryId, priority) => {
    try {
      await hospitalService.receptionManager.updateEnquiryPriority(enquiryId, {
        priority,
        reason: 'Administrative triage update'
      });
      showToast(`Priority set to ${priority}`);
      loadAllData();
    } catch (err) {
      showToast('Error updating priority');
    }
  };

  const handleToggleStaffStatus = async (staffId, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await hospitalService.receptionManager.updateStaffStatus(staffId, newStatus);
      showToast(`Staff member status changed to ${newStatus}`);
      loadAllData();
    } catch (err) {
      showToast('Error updating staff status');
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

      {/* Scope Boundary Notification Banner */}
      <div className="bg-gradient-to-r from-sky-950/80 via-blue-900/40 to-slate-900/80 border border-sky-500/30 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-sky-500/20 text-sky-400 rounded-xl border border-sky-500/30">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-sky-200 text-sm">Administrative Operations Boundary</h4>
            <p className="text-xs text-sky-300/80">
              Reception Manager manages front-desk workload, queues, and staff. AI agents must not diagnose or triage medical emergencies.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-xs bg-sky-900/50 px-3 py-1.5 rounded-lg border border-sky-700/50 text-sky-300">
          <Clock className="w-3.5 h-3.5" />
          <span>Hospital / Clinic Tenant (Apollo Zenith)</span>
        </div>
      </div>

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>Reception Manager Dashboard</span>
            <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
              RECEPTION_MANAGER
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Supervise reception desks, staffing assignments, patient enquiries, and operational escalations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadAllData}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl text-sm transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowStaffModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium rounded-xl text-sm shadow-lg shadow-indigo-600/30 transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Receptionist</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
          <p className="text-xs text-slate-400">Appointments</p>
          <p className="text-xl font-bold text-white mt-1">{dashboardData.appointmentsToday}</p>
          <span className="text-[10px] text-emerald-400 font-medium">Today</span>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
          <p className="text-xs text-slate-400">Checked In</p>
          <p className="text-xl font-bold text-sky-400 mt-1">{dashboardData.checkedInPatients}</p>
          <span className="text-[10px] text-sky-300 font-medium">Patients</span>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
          <p className="text-xs text-slate-400">Waiting Queue</p>
          <p className="text-xl font-bold text-amber-400 mt-1">{dashboardData.waitingPatients}</p>
          <span className="text-[10px] text-amber-300 font-medium">Front Desk</span>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
          <p className="text-xs text-slate-400">Open Enquiries</p>
          <p className="text-xl font-bold text-purple-400 mt-1">{dashboardData.openPatientEnquiries}</p>
          <span className="text-[10px] text-purple-300 font-medium">Active</span>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
          <p className="text-xs text-slate-400">Unassigned</p>
          <p className="text-xl font-bold text-rose-400 mt-1">{dashboardData.unassignedEnquiries}</p>
          <span className="text-[10px] text-rose-300 font-medium">Needs Action</span>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
          <p className="text-xs text-slate-400">Escalations</p>
          <p className="text-xl font-bold text-orange-400 mt-1">{dashboardData.openEscalations}</p>
          <span className="text-[10px] text-orange-300 font-medium">Supervisor</span>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
          <p className="text-xs text-slate-400">Active Staff</p>
          <p className="text-xl font-bold text-emerald-400 mt-1">{dashboardData.availableReceptionists}</p>
          <span className="text-[10px] text-emerald-300 font-medium">On Duty</span>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
          <p className="text-xs text-slate-400">Avg Wait</p>
          <p className="text-xl font-bold text-indigo-400 mt-1">{dashboardData.averageAdministrativeWaitingMinutes}m</p>
          <span className="text-[10px] text-indigo-300 font-medium">Admin Queue</span>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex space-x-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'dashboard', label: 'Overview & Queue', icon: Activity },
          { id: 'staff', label: 'Reception Staff', icon: Users },
          { id: 'enquiries', label: 'Patient Enquiries', icon: HelpCircle },
          { id: 'escalations', label: 'Escalations', icon: AlertTriangle },
          { id: 'ai-config', label: 'AI Reception Settings', icon: Bot },
          { id: 'performance', label: 'Performance Report', icon: TrendingUp },
          { id: 'audit', label: 'Audit Trail', icon: FileText }
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

      {/* Tab 1: Overview & Waiting Queue */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-400" />
                  <span>Real-Time Front Desk Waiting Queue</span>
                </h3>
                <span className="text-xs bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full border border-amber-500/30">
                  {queue.length} Patients Waiting
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="text-xs uppercase bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Queue ID</th>
                      <th className="px-4 py-3">Patient Ref</th>
                      <th className="px-4 py-3">Check-in Time</th>
                      <th className="px-4 py-3">Wait (Mins)</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {queue.map((entry) => (
                      <tr key={entry.queueEntryId} className="hover:bg-slate-800/40">
                        <td className="px-4 py-3 font-mono text-xs text-slate-400">{entry.queueEntryId}</td>
                        <td className="px-4 py-3 font-medium text-white">{entry.patientReference}</td>
                        <td className="px-4 py-3 text-xs text-slate-400">{entry.checkInTime}</td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-amber-400">{entry.administrativeWaitMinutes} min</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {entry.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold text-lg text-white mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <span>Supervisory Alerts</span>
              </h3>
              <div className="space-y-3">
                {escalations.map((esc) => (
                  <div key={esc.escalationId} className="p-3 bg-slate-950 border border-rose-500/20 rounded-xl">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-rose-400 font-bold">{esc.escalationId}</span>
                      <span className="bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full">{esc.status}</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 font-medium">{esc.category}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Assigned to: {esc.assignedToStaffId || 'Unassigned'}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Reception Staff */}
      {activeTab === 'staff' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg text-white">Reception Staff Accounts</h3>
              <p className="text-xs text-slate-400">View roster, department shifts, and manage account statuses.</p>
            </div>
            <button
              onClick={() => setShowStaffModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-medium"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Staff Account</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Staff ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Open Assignments</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {staffList.map((s) => (
                  <tr key={s.staffId} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{s.staffId}</td>
                    <td className="px-4 py-3 font-semibold text-white">{s.name}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{s.email}</td>
                    <td className="px-4 py-3 text-xs">{s.role}</td>
                    <td className="px-4 py-3 text-xs text-slate-300">{s.department}</td>
                    <td className="px-4 py-3 font-bold text-sky-400">{s.openAssignments || 0}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        s.status === 'ACTIVE'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleStaffStatus(s.staffId, s.status)}
                        className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
                      >
                        {s.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Patient Enquiries */}
      {activeTab === 'enquiries' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg text-white">Patient Enquiries Inbox</h3>
              <p className="text-xs text-slate-400">Manage administrative inquiries, assign to staff, and set priority.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Enquiry ID</th>
                  <th className="px-4 py-3">Patient Ref</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Assigned Staff</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {enquiries.map((enq) => (
                  <tr key={enq.enquiryId} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{enq.enquiryId}</td>
                    <td className="px-4 py-3 font-semibold text-white">{enq.patientReference}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">{enq.subject}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{enq.category}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        enq.priority === 'HIGH' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-slate-700 text-slate-300'
                      }`}>
                        {enq.priority || 'NORMAL'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-sky-400">{enq.assignedToStaffId || 'Unassigned'}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {enq.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 space-x-2">
                      <button
                        onClick={() => setSelectedEnquiry(enq)}
                        className="text-xs px-2.5 py-1 bg-blue-600/30 text-blue-300 hover:bg-blue-600/50 rounded-lg border border-blue-500/30"
                      >
                        Assign
                      </button>
                      <button
                        onClick={() => handleUpdatePriority(enq.enquiryId, enq.priority === 'HIGH' ? 'NORMAL' : 'HIGH')}
                        className="text-xs px-2.5 py-1 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-lg border border-slate-700"
                      >
                        {enq.priority === 'HIGH' ? 'Set Normal' : 'Set High'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Escalations */}
      {activeTab === 'escalations' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg text-white">Reception Escalations Board</h3>
            <span className="text-xs text-slate-400">Unresolved administrative items needing supervisor review</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {escalations.map((esc) => (
              <div key={esc.escalationId} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-rose-400 font-bold">{esc.escalationId}</span>
                  <span className="text-xs px-2 py-0.5 bg-rose-500/20 text-rose-300 rounded-full border border-rose-500/30">{esc.status}</span>
                </div>
                <h4 className="text-sm font-semibold text-white">{esc.category}</h4>
                <p className="text-xs text-slate-400">{esc.reason || 'Supervisor assistance requested for patient enquiry.'}</p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
                  <span>Enquiry: {esc.enquiryId}</span>
                  <span>Assigned: {esc.assignedToStaffId || 'Supervisor Desk'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: AI Reception Config */}
      {activeTab === 'ai-config' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 max-w-3xl">
          <div>
            <h3 className="font-semibold text-lg text-white flex items-center gap-2">
              <Bot className="w-5 h-5 text-indigo-400" />
              <span>AI Reception Settings & Policies</span>
            </h3>
            <p className="text-xs text-slate-400">Strictly regulated AI parameters for front desk and reception triage.</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl">
              <div>
                <p className="font-medium text-sm text-white">Strict Clinical Guardrails</p>
                <p className="text-xs text-slate-400">AI agents are hard-locked to prevent diagnosis, prescription, or clinical triaging.</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
                ALWAYS ENFORCED
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl">
              <div>
                <p className="font-medium text-sm text-white">Emergency Protocol Contact</p>
                <p className="text-xs text-slate-400">Direct hospital ER dispatch for life-safety escalation.</p>
              </div>
              <span className="font-mono text-xs font-bold text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/30">
                {aiConfig.emergencyProtocolContact}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl">
              <div>
                <p className="font-medium text-sm text-white">Require Human Supervisor Review</p>
                <p className="text-xs text-slate-400">AI message drafts must be approved prior to dispatch.</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
                ENABLED
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Performance Report */}
      {activeTab === 'performance' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg text-white">Operational Reception Performance</h3>
            <span className="text-xs text-slate-400">Period: 2026-10-01 to 2026-10-27</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <p className="text-xs text-slate-400">Total Patient Enquiries</p>
              <p className="text-2xl font-bold text-white mt-1">720</p>
              <p className="text-xs text-emerald-400 mt-1">665 Resolved (92.3%)</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <p className="text-xs text-slate-400">Avg Resolution Time</p>
              <p className="text-2xl font-bold text-indigo-400 mt-1">24 min</p>
              <p className="text-xs text-slate-400 mt-1">Target: &lt; 30 min</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <p className="text-xs text-slate-400">Escalations Logged</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">38</p>
              <p className="text-xs text-slate-400 mt-1">Resolved at supervisor level</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Audit Trail */}
      {activeTab === 'audit' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg text-white">Audit Event Logs</h3>
            <span className="text-xs text-slate-400">Immutable chronological security and operational trail</span>
          </div>
          <div className="space-y-2">
            {auditEvents.map((evt) => (
              <div key={evt.eventId} className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs">
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-slate-400">{evt.eventId}</span>
                  <span className="font-semibold text-blue-400">{evt.eventType}</span>
                  <span className="text-slate-300">{evt.details}</span>
                </div>
                <span className="text-slate-500 font-mono">{evt.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Receptionist Modal */}
      {showStaffModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-400" />
                <span>Create Receptionist Account</span>
              </h3>
              <button onClick={() => setShowStaffModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreateStaff} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Kumar"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="priya.reception@example.com"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Phone</label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={newStaff.phone}
                  onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Department</label>
                <select
                  value={newStaff.department}
                  onChange={(e) => setNewStaff({ ...newStaff, department: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="FRONT_DESK">Front Desk & Reception</option>
                  <option value="OUTPATIENT_WING">Outpatient Wing</option>
                  <option value="TELEMEDICINE">Telemedicine Desk</option>
                </select>
              </div>
              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowStaffModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Enquiry Drawer / Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Assign Enquiry {selectedEnquiry.enquiryId}</h3>
            <p className="text-xs text-slate-400">Patient: {selectedEnquiry.patientReference} — {selectedEnquiry.subject}</p>
            <div>
              <label className="text-xs text-slate-400">Select Active Receptionist</label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">-- Choose Staff Member --</option>
                {staffList.filter(s => s.status === 'ACTIVE').map(s => (
                  <option key={s.staffId} value={s.staffId}>{s.name} ({s.department})</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button onClick={() => setSelectedEnquiry(null)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm">
                Cancel
              </button>
              <button onClick={() => handleAssignEnquiry(selectedEnquiry.enquiryId)} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium">
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
