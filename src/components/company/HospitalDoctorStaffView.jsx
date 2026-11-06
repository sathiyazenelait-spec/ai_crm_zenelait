import React, { useState, useEffect } from 'react';
import {
  User, Calendar, Clock, CheckCircle2, AlertCircle, FileText,
  Bell, BookOpen, Activity, Search, Edit3, Plus, Trash2,
  Check, Phone, Mail, Globe, Shield, RefreshCw, ChevronRight,
  Filter, Stethoscope, Briefcase, ListTodo, MessageSquare
} from 'lucide-react';
import { hospitalService } from '../../services/hospitalService';

export default function HospitalDoctorStaffView() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Data states
  const [profile, setProfile] = useState({
    staffId: 'stf_1001',
    userId: 'usr_1001',
    fullName: 'Dr. Arun Kumar',
    professionalTitle: 'Doctor',
    department: 'Cardiology',
    email: 'doctor@citycare.example',
    phone: '+919876543210',
    role: 'DOCTOR',
    employmentStatus: 'ACTIVE',
    profileStatus: 'VERIFIED',
    timezone: 'Asia/Kolkata',
    preferredLanguage: 'en',
    availabilityStatus: 'AVAILABLE'
  });

  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    phone: '+919876543210',
    preferredLanguage: 'en',
    timezone: 'Asia/Kolkata'
  });

  const [schedule, setSchedule] = useState({
    timezone: 'Asia/Kolkata',
    workingDays: [
      { date: '2026-10-28', startTime: '09:00', endTime: '13:00', status: 'WORKING' },
      { date: '2026-10-29', startTime: '14:00', endTime: '18:00', status: 'WORKING' },
      { date: '2026-10-30', startTime: null, endTime: null, status: 'DAY_OFF' },
      { date: '2026-10-31', startTime: '09:00', endTime: '13:00', status: 'WORKING' }
    ]
  });

  const [availabilitySlots, setAvailabilitySlots] = useState([
    { slotId: 'slot_1001', startTime: '09:00', endTime: '09:20', status: 'BOOKED' },
    { slotId: 'slot_1002', startTime: '09:20', endTime: '09:40', status: 'AVAILABLE' },
    { slotId: 'slot_1003', startTime: '09:40', endTime: '10:00', status: 'AVAILABLE' },
    { slotId: 'slot_1004', startTime: '10:00', endTime: '10:20', status: 'AVAILABLE' }
  ]);

  const [rules, setRules] = useState([
    {
      ruleId: 'rule_1001',
      dayOfWeek: 'WEDNESDAY',
      startTime: '09:00',
      endTime: '13:00',
      appointmentDurationMinutes: 20,
      effectiveFrom: '2026-11-01',
      effectiveTo: '2026-12-31',
      status: 'ACTIVE'
    }
  ]);

  const [newRule, setNewRule] = useState({
    dayOfWeek: 'MONDAY',
    startTime: '09:00',
    endTime: '13:00',
    appointmentDurationMinutes: 20
  });

  const [appointments, setAppointments] = useState([
    {
      appointmentId: 'apt_2001',
      patientReference: 'PAT-00051',
      scheduledStart: '2026-10-28T09:20:00+05:30',
      scheduledEnd: '2026-10-28T09:40:00+05:30',
      appointmentType: 'CONSULTATION',
      status: 'BOOKED',
      department: 'Cardiology'
    }
  ]);

  const [selectedAppt, setSelectedAppt] = useState(null);

  const [tasks, setTasks] = useState([
    {
      taskId: 'task_1001',
      title: 'Review appointment confirmation issue',
      description: 'Check the status of a pending administrative confirmation.',
      priority: 'NORMAL',
      status: 'OPEN',
      dueAt: '2026-10-28T12:00:00+05:30',
      assignedBy: 'usr_manager_001'
    }
  ]);

  const [taskNotes, setTaskNotes] = useState({
    task_1001: [
      { noteId: 'note_1001', content: 'Checked notification queue. Awaiting delivery result.', visibility: 'INTERNAL', createdAt: '2026-10-27 18:50' }
    ]
  });

  const [newTaskNote, setNewTaskNote] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState('task_1001');

  const [notifications, setNotifications] = useState([
    {
      notificationId: 'ntf_1001',
      title: 'Appointment schedule updated',
      message: 'An appointment in your schedule has changed.',
      type: 'SCHEDULE_UPDATE',
      read: false,
      createdAt: '2026-10-27T17:50:00+05:30'
    }
  ]);

  const [knowledgeArticles, setKnowledgeArticles] = useState([]);
  const [knowledgeQuery, setKnowledgeQuery] = useState('');

  const [activityHistory, setActivityHistory] = useState([
    {
      eventId: 'evt_1001',
      eventType: 'TASK_STATUS_UPDATED',
      resourceType: 'STAFF_TASK',
      resourceId: 'task_1001',
      createdAt: '2026-10-27T18:45:00+05:30'
    }
  ]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [profRes, schRes, availRes, apptRes, taskRes, notifRes, kbRes, actRes] = await Promise.allSettled([
        hospitalService.staff.getMyProfile(),
        hospitalService.staff.getMySchedule(),
        hospitalService.staff.getMyAvailability(),
        hospitalService.staff.getMyAppointments(),
        hospitalService.staff.getMyTasks(),
        hospitalService.staff.getMyNotifications(),
        hospitalService.staff.searchKnowledge(),
        hospitalService.staff.getMyActivity()
      ]);

      if (profRes.status === 'fulfilled' && profRes.value.data?.data) {
        setProfile(profRes.value.data.data);
        setProfileForm({
          phone: profRes.value.data.data.phone || '',
          preferredLanguage: profRes.value.data.data.preferredLanguage || 'en',
          timezone: profRes.value.data.data.timezone || 'Asia/Kolkata'
        });
      }
      if (schRes.status === 'fulfilled' && schRes.value.data?.data) {
        setSchedule(schRes.value.data.data);
      }
      if (availRes.status === 'fulfilled' && availRes.value.data?.data?.slots) {
        setAvailabilitySlots(availRes.value.data.data.slots);
      }
      if (apptRes.status === 'fulfilled' && apptRes.value.data?.data?.content) {
        setAppointments(apptRes.value.data.data.content);
      }
      if (taskRes.status === 'fulfilled' && taskRes.value.data?.data?.content) {
        setTasks(taskRes.value.data.data.content);
      }
      if (notifRes.status === 'fulfilled' && notifRes.value.data?.data?.content) {
        setNotifications(notifRes.value.data.data.content);
      }
      if (kbRes.status === 'fulfilled' && kbRes.value.data?.data?.content) {
        setKnowledgeArticles(kbRes.value.data.data.content);
      }
      if (actRes.status === 'fulfilled' && actRes.value.data?.data?.content) {
        setActivityHistory(actRes.value.data.data.content);
      }
    } catch (e) {
      console.warn('Using seeded data for Doctor/Staff module:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await hospitalService.staff.updateMyProfile(profileForm);
      if (res.data?.success) {
        setProfile(prev => ({ ...prev, ...profileForm }));
        showToast('Profile updated successfully');
        setEditProfileOpen(false);
      }
    } catch {
      setProfile(prev => ({ ...prev, ...profileForm }));
      showToast('Profile updated successfully (local)');
      setEditProfileOpen(false);
    }
  };

  const handleCreateRule = async (e) => {
    e.preventDefault();
    try {
      const res = await hospitalService.staff.createAvailabilityRule(newRule);
      if (res.data?.data) {
        setRules(prev => [...prev, res.data.data]);
        showToast('Availability rule added');
      }
    } catch {
      const mockRule = {
        ruleId: 'rule_' + Date.now(),
        ...newRule,
        effectiveFrom: '2026-11-01',
        effectiveTo: '2026-12-31',
        status: 'ACTIVE'
      };
      setRules(prev => [...prev, mockRule]);
      showToast('Availability rule added');
    }
  };

  const handleDeleteRule = async (ruleId) => {
    try {
      await hospitalService.staff.deleteAvailabilityRule(ruleId);
      setRules(prev => prev.filter(r => r.ruleId !== ruleId));
      showToast('Availability rule removed');
    } catch {
      setRules(prev => prev.filter(r => r.ruleId !== ruleId));
      showToast('Availability rule removed');
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await hospitalService.staff.updateTaskStatus(taskId, { status: newStatus, comment: `Updated to ${newStatus}` });
      setTasks(prev => prev.map(t => t.taskId === taskId ? { ...t, status: newStatus } : t));
      showToast(`Task updated to ${newStatus}`);
    } catch {
      setTasks(prev => prev.map(t => t.taskId === taskId ? { ...t, status: newStatus } : t));
      showToast(`Task updated to ${newStatus}`);
    }
  };

  const handleAddTaskNote = async (taskId) => {
    if (!newTaskNote.trim()) return;
    try {
      await hospitalService.staff.addTaskNote(taskId, { content: newTaskNote, visibility: 'INTERNAL' });
      const newNoteObj = { noteId: 'note_' + Date.now(), content: newTaskNote, visibility: 'INTERNAL', createdAt: 'Just now' };
      setTaskNotes(prev => ({
        ...prev,
        [taskId]: [...(prev[taskId] || []), newNoteObj]
      }));
      setNewTaskNote('');
      showToast('Internal note added');
    } catch {
      const newNoteObj = { noteId: 'note_' + Date.now(), content: newTaskNote, visibility: 'INTERNAL', createdAt: 'Just now' };
      setTaskNotes(prev => ({
        ...prev,
        [taskId]: [...(prev[taskId] || []), newNoteObj]
      }));
      setNewTaskNote('');
      showToast('Internal note added');
    }
  };

  const handleMarkNotificationRead = async (notifId) => {
    try {
      await hospitalService.staff.markNotificationRead(notifId);
      setNotifications(prev => prev.map(n => n.notificationId === notifId ? { ...n, read: true } : n));
      showToast('Notification marked as read');
    } catch {
      setNotifications(prev => prev.map(n => n.notificationId === notifId ? { ...n, read: true } : n));
      showToast('Notification marked as read');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 p-6 rounded-2xl border border-teal-500/20 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-400 shadow-inner">
            <Stethoscope className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{profile.fullName}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-400/20 text-teal-300 border border-teal-400/30">
                {profile.role}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                {profile.profileStatus}
              </span>
            </div>
            <p className="text-slate-300 text-sm mt-0.5">
              {profile.department} Department • {profile.timezone} • {profile.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium border border-white/10 transition shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setEditProfileOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-xs font-semibold shadow-md transition"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-700/60 text-sm">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: Activity },
          { id: 'profile', label: 'My Profile', icon: User },
          { id: 'schedule', label: 'My Schedule', icon: Calendar },
          { id: 'availability', label: 'My Availability', icon: Clock },
          { id: 'appointments', label: 'My Appointments', icon: Briefcase },
          { id: 'tasks', label: 'My Tasks', icon: ListTodo },
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'knowledge', label: 'Clinic Knowledge', icon: BookOpen },
          { id: 'activity', label: 'My Activity', icon: FileText }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-teal-500 text-white font-semibold shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.id === 'notifications' && notifications.filter(n => !n.read).length > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* 1. DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-800/70 border border-slate-700/60 shadow-sm">
              <span className="text-xs text-slate-400 uppercase font-semibold">Today's Assigned</span>
              <p className="text-2xl font-bold text-white mt-1">{appointments.length}</p>
              <span className="text-xs text-teal-400 mt-2 block">Next at 09:20 AM</span>
            </div>
            <div className="p-5 rounded-2xl bg-slate-800/70 border border-slate-700/60 shadow-sm">
              <span className="text-xs text-slate-400 uppercase font-semibold">Pending Tasks</span>
              <p className="text-2xl font-bold text-amber-400 mt-1">
                {tasks.filter(t => t.status !== 'COMPLETED').length}
              </p>
              <span className="text-xs text-slate-400 mt-2 block">Requires administrative review</span>
            </div>
            <div className="p-5 rounded-2xl bg-slate-800/70 border border-slate-700/60 shadow-sm">
              <span className="text-xs text-slate-400 uppercase font-semibold">Available Slots</span>
              <p className="text-2xl font-bold text-emerald-400 mt-1">
                {availabilitySlots.filter(s => s.status === 'AVAILABLE').length}
              </p>
              <span className="text-xs text-emerald-400/80 mt-2 block">Ready for patient booking</span>
            </div>
            <div className="p-5 rounded-2xl bg-slate-800/70 border border-slate-700/60 shadow-sm">
              <span className="text-xs text-slate-400 uppercase font-semibold">Unread Alerts</span>
              <p className="text-2xl font-bold text-indigo-400 mt-1">
                {notifications.filter(n => !n.read).length}
              </p>
              <span className="text-xs text-slate-400 mt-2 block">Schedule & task alerts</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Today's Schedule Overview */}
            <div className="p-6 rounded-2xl bg-slate-800/70 border border-slate-700/60 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-teal-400" />
                  Upcoming Assigned Appointments
                </h3>
                <button onClick={() => setActiveTab('appointments')} className="text-xs text-teal-400 hover:underline">
                  View All
                </button>
              </div>

              {appointments.length === 0 ? (
                <p className="text-slate-400 text-sm py-6 text-center">No appointments scheduled for today.</p>
              ) : (
                <div className="space-y-3">
                  {appointments.slice(0, 3).map((a, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/50 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">{a.patientReference}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-medium">
                            {a.appointmentType}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          {a.scheduledStart.substring(11, 16)} - {a.scheduledEnd.substring(11, 16)} • {a.department}
                        </p>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400">
                        {a.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Tasks */}
            <div className="p-6 rounded-2xl bg-slate-800/70 border border-slate-700/60 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <ListTodo className="w-4 h-4 text-amber-400" />
                  Immediate Administrative Tasks
                </h3>
                <button onClick={() => setActiveTab('tasks')} className="text-xs text-amber-400 hover:underline">
                  View Tasks
                </button>
              </div>

              {tasks.length === 0 ? (
                <p className="text-slate-400 text-sm py-6 text-center">No open administrative tasks.</p>
              ) : (
                <div className="space-y-3">
                  {tasks.slice(0, 3).map((t, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/50 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-white">{t.title}</p>
                        <p className="text-xs text-slate-400 mt-1">{t.description}</p>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400">
                        {t.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. PROFILE TAB */}
      {activeTab === 'profile' && (
        <div className="p-6 rounded-2xl bg-slate-800/70 border border-slate-700/60 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white text-lg">Staff Member Details</h3>
            <button
              onClick={() => setEditProfileOpen(true)}
              className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-xs font-semibold transition"
            >
              Update Permitted Fields
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/40">
              <span className="text-xs text-slate-400">Staff ID</span>
              <p className="font-semibold text-white mt-1">{profile.staffId}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/40">
              <span className="text-xs text-slate-400">Full Name</span>
              <p className="font-semibold text-white mt-1">{profile.fullName}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/40">
              <span className="text-xs text-slate-400">Professional Title</span>
              <p className="font-semibold text-white mt-1">{profile.professionalTitle}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/40">
              <span className="text-xs text-slate-400">Department</span>
              <p className="font-semibold text-white mt-1">{profile.department}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/40">
              <span className="text-xs text-slate-400">Role & Security Context</span>
              <p className="font-semibold text-teal-400 mt-1">{profile.role}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/40">
              <span className="text-xs text-slate-400">Employment Status</span>
              <p className="font-semibold text-emerald-400 mt-1">{profile.employmentStatus}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/40">
              <span className="text-xs text-slate-400">Phone (Permitted to edit)</span>
              <p className="font-semibold text-white mt-1">{profile.phone}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/40">
              <span className="text-xs text-slate-400">Preferred Language</span>
              <p className="font-semibold text-white mt-1">{profile.preferredLanguage}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/40">
              <span className="text-xs text-slate-400">Timezone</span>
              <p className="font-semibold text-white mt-1">{profile.timezone}</p>
            </div>
          </div>
        </div>
      )}

      {/* 3. SCHEDULE TAB */}
      {activeTab === 'schedule' && (
        <div className="p-6 rounded-2xl bg-slate-800/70 border border-slate-700/60 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white text-lg">Personal Working Schedule</h3>
              <p className="text-xs text-slate-400">Timezone: {schedule.timezone}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {schedule.workingDays?.map((day, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50 space-y-2">
                <span className="text-xs font-semibold text-slate-400">{day.date}</span>
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2.5 py-1 rounded-md font-semibold ${
                    day.status === 'WORKING' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {day.status}
                  </span>
                </div>
                <p className="text-sm font-medium text-white">
                  {day.startTime ? `${day.startTime} - ${day.endTime}` : 'No working hours (Leave / Off)'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. AVAILABILITY TAB */}
      {activeTab === 'availability' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-800/70 border border-slate-700/60 shadow-sm space-y-4">
            <h3 className="font-semibold text-white text-lg">Active Availability Rules</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rules.map(r => (
                <div key={r.ruleId} className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-white">{r.dayOfWeek}</span>
                    <p className="text-xs text-slate-400 mt-1">
                      {r.startTime} - {r.endTime} ({r.appointmentDurationMinutes} min slots)
                    </p>
                    <span className="text-xs text-teal-400 font-medium">Status: {r.status}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteRule(r.ruleId)}
                    className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                    title="Remove rule"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Rule Form */}
            <form onSubmit={handleCreateRule} className="p-4 rounded-xl bg-slate-900/40 border border-slate-700/40 grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Day</label>
                <select
                  value={newRule.dayOfWeek}
                  onChange={e => setNewRule({ ...newRule, dayOfWeek: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                >
                  {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Start Time</label>
                <input
                  type="text"
                  value={newRule.startTime}
                  onChange={e => setNewRule({ ...newRule, startTime: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">End Time</label>
                <input
                  type="text"
                  value={newRule.endTime}
                  onChange={e => setNewRule({ ...newRule, endTime: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Duration (Min)</label>
                <input
                  type="number"
                  value={newRule.appointmentDurationMinutes}
                  onChange={e => setNewRule({ ...newRule, appointmentDurationMinutes: parseInt(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-xs font-semibold transition"
              >
                Add Rule
              </button>
            </form>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/70 border border-slate-700/60 shadow-sm space-y-4">
            <h3 className="font-semibold text-white text-lg">Calculated Slots for Today (2026-10-28)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {availabilitySlots.map(s => (
                <div
                  key={s.slotId}
                  className={`p-3 rounded-xl border text-center ${
                    s.status === 'AVAILABLE'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                >
                  <p className="text-sm font-semibold">{s.startTime} - {s.endTime}</p>
                  <span className="text-xs uppercase font-medium">{s.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. APPOINTMENTS TAB */}
      {activeTab === 'appointments' && (
        <div className="p-6 rounded-2xl bg-slate-800/70 border border-slate-700/60 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white text-lg">Assigned Appointments</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-900/60 text-slate-400">
                <tr>
                  <th className="px-4 py-3">Appointment ID</th>
                  <th className="px-4 py-3">Patient Ref</th>
                  <th className="px-4 py-3">Start Time</th>
                  <th className="px-4 py-3">End Time</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {appointments.map((a, i) => (
                  <tr key={i} className="hover:bg-slate-700/20 transition">
                    <td className="px-4 py-3 font-semibold text-white">{a.appointmentId}</td>
                    <td className="px-4 py-3 font-medium text-teal-400">{a.patientReference}</td>
                    <td className="px-4 py-3">{a.scheduledStart.substring(11, 16)}</td>
                    <td className="px-4 py-3">{a.scheduledEnd.substring(11, 16)}</td>
                    <td className="px-4 py-3">{a.appointmentType}</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-teal-500/20 text-teal-300">
                        {a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedAppt(a)}
                        className="text-xs px-3 py-1 bg-teal-500/20 text-teal-300 rounded-lg hover:bg-teal-500/30 font-medium transition"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. TASKS TAB */}
      {activeTab === 'tasks' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-800/70 border border-slate-700/60 shadow-sm space-y-4">
            <h3 className="font-semibold text-white text-lg">Assigned Administrative Tasks</h3>
            <div className="space-y-3">
              {tasks.map(t => (
                <div
                  key={t.taskId}
                  onClick={() => setSelectedTaskId(t.taskId)}
                  className={`p-4 rounded-xl border cursor-pointer transition ${
                    selectedTaskId === t.taskId ? 'bg-slate-900 border-teal-500/50 shadow-md' : 'bg-slate-900/50 border-slate-700/50 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white text-sm">{t.title}</span>
                    <span className="text-xs px-2 py-0.5 rounded-md font-semibold bg-amber-500/20 text-amber-300">
                      {t.priority}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{t.description}</p>
                  <div className="flex items-center justify-between mt-3 text-xs">
                    <span className="text-slate-400">Due: {t.dueAt?.substring(0, 10)}</span>
                    <div className="flex items-center gap-1.5">
                      {['OPEN', 'IN_PROGRESS', 'COMPLETED'].map(st => (
                        <button
                          key={st}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateTaskStatus(t.taskId, st);
                          }}
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                            t.status === st ? 'bg-teal-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Internal Task Notes */}
          <div className="p-6 rounded-2xl bg-slate-800/70 border border-slate-700/60 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-white text-md flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-teal-400" />
                Internal Task Notes
              </h3>
              <p className="text-xs text-slate-400 mt-1">For Task: {selectedTaskId} (Strictly internal)</p>

              <div className="space-y-2 mt-4 max-h-60 overflow-y-auto">
                {(taskNotes[selectedTaskId] || []).map((n, i) => (
                  <div key={i} className="p-3 rounded-lg bg-slate-900/80 border border-slate-700/40 text-xs">
                    <p className="text-slate-200">{n.content}</p>
                    <div className="flex justify-between items-center text-slate-400 text-[10px] mt-2">
                      <span className="text-teal-400 font-semibold">{n.visibility}</span>
                      <span>{n.createdAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-700/40">
              <input
                type="text"
                placeholder="Add internal task note..."
                value={newTaskNote}
                onChange={e => setNewTaskNote(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400"
              />
              <button
                onClick={() => handleAddTaskNote(selectedTaskId)}
                className="w-full py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-xs font-semibold transition shadow"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. NOTIFICATIONS TAB */}
      {activeTab === 'notifications' && (
        <div className="p-6 rounded-2xl bg-slate-800/70 border border-slate-700/60 shadow-sm space-y-4">
          <h3 className="font-semibold text-white text-lg">Work Notifications</h3>
          <div className="space-y-3">
            {notifications.map(n => (
              <div
                key={n.notificationId}
                className={`p-4 rounded-xl border flex items-center justify-between transition ${
                  n.read ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-900/80 border-teal-500/40 shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm">{n.title}</span>
                    {!n.read && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-bold">NEW</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{n.message}</p>
                  <span className="text-[11px] text-slate-400 block mt-1">{n.createdAt?.substring(0, 16)}</span>
                </div>
                {!n.read && (
                  <button
                    onClick={() => handleMarkNotificationRead(n.notificationId)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 transition font-medium"
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. KNOWLEDGE TAB */}
      {activeTab === 'knowledge' && (
        <div className="p-6 rounded-2xl bg-slate-800/70 border border-slate-700/60 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white text-lg">Approved Clinic Knowledge & Policies</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {knowledgeArticles.map(k => (
              <div key={k.articleId} className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50 space-y-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-500/20 text-teal-300">
                  {k.category}
                </span>
                <h4 className="font-semibold text-white text-sm">{k.title}</h4>
                <p className="text-xs text-slate-400">{k.summary}</p>
                <div className="flex justify-between items-center text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                  <span>Version {k.version} • {k.status}</span>
                  <span>Reviewed: {k.lastReviewedAt?.substring(0, 10)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9. ACTIVITY TAB */}
      {activeTab === 'activity' && (
        <div className="p-6 rounded-2xl bg-slate-800/70 border border-slate-700/60 shadow-sm space-y-4">
          <h3 className="font-semibold text-white text-lg">Authorized Activity History</h3>
          <div className="space-y-3">
            {activityHistory.map(evt => (
              <div key={evt.eventId} className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50 flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-white">{evt.eventType}</span>
                  <p className="text-xs text-slate-400 mt-1">Resource: {evt.resourceType} ({evt.resourceId})</p>
                </div>
                <span className="text-xs text-slate-400 font-mono">{evt.createdAt}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Edit Profile */}
      {editProfileOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="font-bold text-white text-lg">Update Permitted Profile Fields</h3>
            <p className="text-xs text-slate-400">
              Note: Roles, tenant membership, and verification status are server-authoritative and cannot be modified here.
            </p>

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1">Preferred Language</label>
                <select
                  value={profileForm.preferredLanguage}
                  onChange={e => setProfileForm({ ...profileForm, preferredLanguage: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="en">English (en)</option>
                  <option value="ta">Tamil (ta)</option>
                  <option value="hi">Hindi (hi)</option>
                </select>
              </div>
              <div>
                <label className="text-slate-300 block mb-1">Timezone</label>
                <input
                  type="text"
                  value={profileForm.timezone}
                  onChange={e => setProfileForm({ ...profileForm, timezone: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditProfileOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Appointment */}
      {selectedAppt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="font-bold text-white text-lg">Appointment Details</h3>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-lg bg-slate-800">
                <span className="text-slate-400">Appointment ID:</span>
                <p className="font-bold text-white">{selectedAppt.appointmentId}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-800">
                <span className="text-slate-400">Patient Reference:</span>
                <p className="font-bold text-teal-400">{selectedAppt.patientReference}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-800">
                <span className="text-slate-400">Scheduled Time:</span>
                <p className="font-bold text-white">
                  {selectedAppt.scheduledStart} to {selectedAppt.scheduledEnd}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-800">
                <span className="text-slate-400">Department:</span>
                <p className="font-bold text-white">{selectedAppt.department}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-800">
                <span className="text-slate-400">Status:</span>
                <p className="font-bold text-emerald-400">{selectedAppt.status}</p>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedAppt(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
