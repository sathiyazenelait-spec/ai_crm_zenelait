import React, { useState, useEffect } from 'react';
import {
  Compass, Users, Calendar, CheckSquare, Sparkles, BookOpen, Clock,
  CheckCircle2, AlertCircle, Plus, Search, Filter, Phone, ArrowRight,
  TrendingUp, Award, RefreshCw, Send, FileText, ChevronRight, Share2,
  CalendarDays, Star
} from 'lucide-react';
import { educationService } from '../../services/educationService';

export default function EducationCounsellorView({ initialSubTab = 'dashboard' }) {
  const [activeTab, setActiveTab] = useState(initialSubTab);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [students, setStudents] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [actionPlans, setActionPlans] = useState([]);
  const [sessionNotes, setSessionNotes] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [aiBrief, setAiBrief] = useState(null);
  const [aiSummary, setAiSummary] = useState(null);

  // Modals & Action States
  const [showApptModal, setShowApptModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Forms
  const [newAppt, setNewAppt] = useState({
    studentId: 3001, appointmentType: 'COURSE_GUIDANCE',
    startAt: '2026-10-28T16:00:00+05:30', durationMinutes: 30,
    meetingMode: 'ONLINE', notes: 'Discuss course suitability'
  });

  const [rescheduleForm, setRescheduleForm] = useState({
    newStartAt: '2026-10-29T16:00:00+05:30', reason: 'Student requested different time slot'
  });

  const [assessmentForm, setAssessmentForm] = useState({
    assessmentType: 'CAREER_GUIDANCE', currentEducation: 'BSC',
    currentSkillLevel: 'BEGINNER', goals: 'LEARN_JAVA, BUILD_PROJECTS',
    preferredDurationWeeks: 24, preferredLearningMode: 'WEEKEND',
    counsellorNotes: 'Review technical background before enrolling'
  });

  const [sessionNotesForm, setSessionNotesForm] = useState({
    sessionSummary: 'Discussed student technical background and career interests',
    studentConcerns: 'Course duration, weekend batch availability',
    agreedNextSteps: 'Review published curriculum, confirm preferred batch',
    followUpRequired: true, followUpAt: '2026-10-30T11:00:00+05:30'
  });

  const [planForm, setPlanForm] = useState({
    title: 'Java Full Stack Learning Plan',
    description: 'Review curriculum and confirm schedule',
    items: [
      { title: 'Review course curriculum', dueDate: '2026-10-30' },
      { title: 'Confirm preferred batch', dueDate: '2026-11-01' }
    ],
    targetDate: '2026-11-01'
  });

  const [referralForm, setReferralForm] = useState({
    referralType: 'ADMISSION', relatedCourseId: 501,
    reason: 'Student wants to start application process', notes: 'Completed course guidance'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashRes, stuRes, apptRes] = await Promise.allSettled([
        educationService.getCounsellorDashboard(),
        educationService.getCounsellingStudents(),
        educationService.getCounsellingAppointments()
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value?.data) {
        setDashboardData(dashRes.value.data.data || dashRes.value.data);
      }
      if (stuRes.status === 'fulfilled' && stuRes.value?.data) {
        const list = stuRes.value.data.data?.content || stuRes.value.data.data || [];
        setStudents(list);
        if (list.length > 0 && !selectedStudent) {
          selectStudent(list[0]);
        }
      }
      if (apptRes.status === 'fulfilled' && apptRes.value?.data) {
        setAppointments(apptRes.value.data.data || []);
      }
    } catch (e) {
      console.error('Failed to load counsellor data', e);
    } finally {
      setLoading(false);
    }
  };

  const selectStudent = async (student) => {
    setSelectedStudent(student);
    try {
      const [asRes, plRes, snRes] = await Promise.allSettled([
        educationService.getNeedsAssessments(student.studentId),
        educationService.getActionPlans(student.studentId),
        educationService.getCounsellingSessions(student.studentId)
      ]);
      if (asRes.status === 'fulfilled') setAssessments(asRes.value.data.data || []);
      if (plRes.status === 'fulfilled') setActionPlans(plRes.value.data.data || []);
      if (snRes.status === 'fulfilled') setSessionNotes(snRes.value.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleScheduleAppt = async (e) => {
    e.preventDefault();
    try {
      await educationService.scheduleCounsellingAppointment(newAppt);
      setActionSuccess('Counselling appointment scheduled!');
      setShowApptModal(false);
      loadData();
    } catch (err) {
      setActionError(err.message || 'Failed to schedule appointment');
    }
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    if (!selectedAppt) return;
    try {
      await educationService.rescheduleAppointment(selectedAppt.appointmentId, rescheduleForm);
      setActionSuccess(`Appointment #${selectedAppt.appointmentId} rescheduled!`);
      setShowRescheduleModal(false);
      loadData();
    } catch (err) {
      setActionError(err.message || 'Failed to reschedule');
    }
  };

  const handleRecordAssessment = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;
    try {
      await educationService.recordNeedsAssessment(selectedStudent.studentId, {
        ...assessmentForm,
        goals: assessmentForm.goals.split(',').map(g => g.trim())
      });
      setActionSuccess('Needs assessment recorded!');
      setShowAssessmentModal(false);
      selectStudent(selectedStudent);
    } catch (err) {
      setActionError(err.message || 'Failed to record assessment');
    }
  };

  const handleRecordNotes = async (e) => {
    e.preventDefault();
    if (!selectedAppt) return;
    try {
      await educationService.recordCounsellingNotes(selectedAppt.appointmentId, {
        studentId: selectedAppt.studentId,
        sessionSummary: sessionNotesForm.sessionSummary,
        studentConcerns: sessionNotesForm.studentConcerns.split(',').map(s => s.trim()),
        agreedNextSteps: sessionNotesForm.agreedNextSteps.split(',').map(s => s.trim()),
        followUpRequired: sessionNotesForm.followUpRequired,
        followUpAt: sessionNotesForm.followUpAt
      });
      setActionSuccess('Session notes recorded!');
      setShowNotesModal(false);
      loadData();
    } catch (err) {
      setActionError(err.message || 'Failed to record session notes');
    }
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;
    try {
      await educationService.createActionPlan(selectedStudent.studentId, planForm);
      setActionSuccess('Student Action Plan established!');
      setShowPlanModal(false);
      selectStudent(selectedStudent);
    } catch (err) {
      setActionError(err.message || 'Failed to create action plan');
    }
  };

  const handleRecommendCourses = async () => {
    if (!selectedStudent) return;
    try {
      const res = await educationService.getCourseRecommendations(selectedStudent.studentId, {
        preferredLearningMode: 'WEEKEND',
        interests: ['JAVA', 'BACKEND_DEVELOPMENT']
      });
      setRecommendations(res.data.data?.recommendations || []);
      setActionSuccess('Course recommendations generated against verified catalog!');
    } catch (err) {
      setActionError(err.message || 'Failed to get recommendations');
    }
  };

  const handleGenerateAiBrief = async () => {
    if (!selectedStudent) return;
    try {
      const res = await educationService.generateAiSessionPreparation({
        studentId: selectedStudent.studentId,
        appointmentType: 'COURSE_GUIDANCE',
        include: ['STUDENT_GOALS', 'COURSE_OPTIONS']
      });
      setAiBrief(res.data.data || res.data);
      setActionSuccess('AI Preparation Brief generated!');
    } catch (err) {
      setActionError(err.message || 'Failed to generate brief');
    }
  };

  const handleGenerateAiSummary = async () => {
    if (!selectedAppt) return;
    try {
      const res = await educationService.generateAiSessionSummary({
        appointmentId: selectedAppt.appointmentId,
        notes: 'Discussed career interests and syllabus',
        includeActionItems: true
      });
      setAiSummary(res.data.data || res.data);
      setActionSuccess('AI Session Summary draft generated!');
    } catch (err) {
      setActionError(err.message || 'Failed to generate session summary');
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Counsellor Dashboard', icon: Compass },
    { id: 'students', label: 'Student Case Files', icon: Users },
    { id: 'calendar', label: 'Appointments Calendar', icon: CalendarDays },
    { id: 'actionplans', label: 'Action Plans', icon: CheckSquare },
    { id: 'recommendations', label: 'Course Matchmaker', icon: BookOpen },
    { id: 'ai', label: 'AI Counselling Assistant', icon: Sparkles }
  ];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 p-6 rounded-2xl border border-purple-700/40 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              Academic Counselling & Career Guidance Desk • Dr. Ananya (ID #401)
            </div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <Compass className="w-8 h-8 text-purple-400" />
              Academic & Career Counsellor Portal
            </h1>
            <p className="text-purple-200/80 text-sm mt-1 max-w-2xl">
              Conduct needs assessments, guide students to verified programs, schedule counselling appointments, maintain session notes, and formulate action plans.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowApptModal(true)}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl flex items-center gap-2 shadow-lg shadow-purple-900/40 transition-all text-sm"
            >
              <Plus className="w-4 h-4" />
              Schedule Session
            </button>
            <button
              onClick={loadData}
              className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition text-purple-200"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto mt-6 pt-4 border-t border-purple-800/60 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-white text-purple-950 shadow-md font-bold'
                    : 'text-purple-200/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-purple-700' : 'text-purple-300'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess('')} className="text-xs hover:underline">Dismiss</button>
        </div>
      )}
      {actionError && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError('')} className="text-xs hover:underline">Dismiss</button>
        </div>
      )}

      {/* TAB 1: DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400">Assigned Students</span>
              <div className="text-2xl font-bold text-white mt-1">{dashboardData?.summary?.assignedStudents || 28}</div>
              <span className="text-[11px] text-purple-400 mt-1 block">Active counselling</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400">Sessions Today</span>
              <div className="text-2xl font-bold text-amber-400 mt-1">{dashboardData?.summary?.appointmentsToday || 5}</div>
              <span className="text-[11px] text-slate-400 mt-1 block">Booked slots</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400">Upcoming Week</span>
              <div className="text-2xl font-bold text-blue-400 mt-1">{dashboardData?.summary?.upcomingAppointments || 9}</div>
              <span className="text-[11px] text-blue-300 mt-1 block">Confirmed</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400">Completed Month</span>
              <div className="text-2xl font-bold text-emerald-400 mt-1">{dashboardData?.summary?.completedSessionsThisMonth || 36}</div>
              <span className="text-[11px] text-emerald-300 mt-1 block">Sessions</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400">Follow-ups Due</span>
              <div className="text-2xl font-bold text-rose-400 mt-1">{dashboardData?.summary?.followUpsDue || 7}</div>
              <span className="text-[11px] text-rose-300 mt-1 block">Check-in pending</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400">Action Plans Active</span>
              <div className="text-2xl font-bold text-indigo-400 mt-1">{dashboardData?.summary?.actionPlansInProgress || 14}</div>
              <span className="text-[11px] text-indigo-300 mt-1 block">Milestone progress</span>
            </div>
          </div>

          {/* Today's Appointments */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-400" />
              Today's Scheduled Counselling Sessions
            </h2>
            <div className="space-y-3">
              {appointments.map((appt) => (
                <div key={appt.appointmentId} className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-white flex items-center gap-2">
                      <span>{appt.studentName}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded">
                        {appt.appointmentType}
                      </span>
                    </div>
                    <p className="text-slate-400 mt-1">Start: {appt.startAt} • Mode: {appt.meetingMode || 'ONLINE'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setSelectedAppt(appt); setShowNotesModal(true); }}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded font-medium text-xs flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5" /> Session Notes
                    </button>
                    <button
                      onClick={() => { setSelectedAppt(appt); setShowRescheduleModal(true); }}
                      className="px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-xs"
                    >
                      Reschedule
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STUDENTS CASE FILES */}
      {activeTab === 'students' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <h2 className="text-base font-semibold text-white">Assigned Student Profiles</h2>
            <div className="space-y-2">
              {students.map((s) => {
                const isSelected = selectedStudent?.studentId === s.studentId;
                return (
                  <div
                    key={s.studentId}
                    onClick={() => selectStudent(s)}
                    className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-500/50 shadow-md'
                        : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white text-sm">{s.studentName}</span>
                      <span className="font-mono text-slate-400 text-[11px]">#{s.studentId}</span>
                    </div>
                    <p className="text-slate-400 mt-1">{s.email} • {s.phone}</p>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-700/40 text-[11px]">
                      <span className="text-purple-300">Status: {s.enrolmentStatus || 'PROSPECT'}</span>
                      <span className="text-slate-400">Course #{s.courseId}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            {selectedStudent ? (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h2 className="text-lg font-bold text-white">{selectedStudent.studentName}</h2>
                    <p className="text-xs text-slate-400">ID #{selectedStudent.studentId} • {selectedStudent.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowAssessmentModal(true)}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-semibold"
                    >
                      New Assessment
                    </button>
                    <button
                      onClick={() => setShowPlanModal(true)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold"
                    >
                      Action Plan
                    </button>
                  </div>
                </div>

                {/* Assessments history */}
                <div>
                  <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Needs Assessment Records</h3>
                  {assessments.length > 0 ? (
                    assessments.map(as => (
                      <div key={as.assessmentId} className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-lg text-xs space-y-1 mb-2">
                        <div className="flex justify-between font-semibold text-white">
                          <span>{as.assessmentType}</span>
                          <span className="text-purple-400">{as.status}</span>
                        </div>
                        <p className="text-slate-300 text-[11px]">{as.counsellorNotes}</p>
                        <div className="text-[11px] text-slate-400 pt-1">
                          Edu: {as.currentEducation} • Level: {as.currentSkillLevel} • Mode: {as.preferredLearningMode}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-xs italic">No assessments recorded yet.</p>
                  )}
                </div>

                {/* Session Notes */}
                <div>
                  <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Counselling Session Notes</h3>
                  {sessionNotes.length > 0 ? (
                    sessionNotes.map(sn => (
                      <div key={sn.noteId} className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-lg text-xs space-y-1 mb-2">
                        <span className="font-semibold text-white block">{sn.sessionSummary}</span>
                        <div className="text-[11px] text-slate-400">Next Follow-up: {sn.followUpAt}</div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-xs italic">No previous session notes.</p>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-20 text-slate-500 text-xs">
                Select a student from the list to view profile and history.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CALENDAR */}
      {activeTab === 'calendar' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Counselling Calendar & Time Slots</h2>
            <button
              onClick={() => setShowApptModal(true)}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Book Slot
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-medium">Appt ID</th>
                  <th className="pb-3 font-medium">Student</th>
                  <th className="pb-3 font-medium">Session Type</th>
                  <th className="pb-3 font-medium">Start Time</th>
                  <th className="pb-3 font-medium">Meeting Mode</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {appointments.map((a) => (
                  <tr key={a.appointmentId} className="hover:bg-slate-800/30">
                    <td className="py-3 font-mono text-slate-300">#{a.appointmentId}</td>
                    <td className="py-3 font-semibold text-white">{a.studentName}</td>
                    <td className="py-3 text-slate-300">{a.appointmentType}</td>
                    <td className="py-3 text-purple-300 font-mono">{a.startAt}</td>
                    <td className="py-3 text-slate-400">{a.meetingMode || 'ONLINE'}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400">
                        {a.status}
                      </span>
                    </td>
                    <td className="py-3 text-right flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => { setSelectedAppt(a); setShowNotesModal(true); }}
                        className="px-2.5 py-1 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 rounded border border-purple-500/30 text-xs"
                      >
                        Notes
                      </button>
                      <button
                        onClick={() => { setSelectedAppt(a); setShowRescheduleModal(true); }}
                        className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-xs"
                      >
                        Reschedule
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: ACTION PLANS */}
      {activeTab === 'actionplans' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Student Career & Learning Action Plans</h2>
            <button
              onClick={() => setShowPlanModal(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Create Action Plan
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {actionPlans.map(plan => (
              <div key={plan.planId} className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-white text-sm">{plan.title}</h3>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-[10px] font-semibold">
                    {plan.status}
                  </span>
                </div>
                <p className="text-slate-400">{plan.description}</p>
                <div className="space-y-1.5 pt-2 border-t border-slate-700/40">
                  {plan.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px] text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        {item.title}
                      </span>
                      <span className="text-slate-400">Due: {item.dueDate}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-2 text-[11px] text-slate-400">
                  <span>Target Date: {plan.targetDate}</span>
                  <button
                    onClick={async () => {
                      await educationService.completeActionPlan(plan.planId);
                      setActionSuccess('Plan marked completed!');
                      loadData();
                    }}
                    className="px-2.5 py-1 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-200 rounded"
                  >
                    Mark Complete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: COURSE RECOMMENDATIONS */}
      {activeTab === 'recommendations' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Course Matchmaker (Database Grounded)</h2>
              <p className="text-xs text-slate-400">Recommend verified courses matching student schedule and technical goals without making false promises.</p>
            </div>
            <button
              onClick={handleRecommendCourses}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" /> Match Courses
            </button>
          </div>

          <div className="space-y-3">
            {recommendations.length > 0 ? (
              recommendations.map(rec => (
                <div key={rec.courseId} className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-white text-base">{rec.courseName}</h3>
                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-[10px] font-semibold">
                      Course #{rec.courseId} • {rec.durationWeeks} Weeks
                    </span>
                  </div>
                  <ul className="list-disc list-inside text-slate-300 space-y-1">
                    {rec.matchReasons?.map((reason, idx) => (
                      <li key={idx}>{reason}</li>
                    ))}
                  </ul>
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setShowReferralModal(true)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium text-xs flex items-center gap-1"
                    >
                      <Share2 className="w-3 h-3" /> Refer to Admission Team
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 text-slate-500 text-xs">
                Click Match Courses to retrieve verified recommendations for {selectedStudent?.studentName || 'student'}.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: AI COUNSELLING ASSISTANT */}
      {activeTab === 'ai' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                AI Session Preparation & Summary Assistant
              </h2>
              <p className="text-xs text-slate-400">Generate structured interview briefs and summarize session outcomes. All content requires human review.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleGenerateAiBrief}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-semibold"
              >
                Prep Brief
              </button>
              <button
                onClick={handleGenerateAiSummary}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold"
              >
                Summary Draft
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50 space-y-3 text-xs">
              <span className="font-semibold text-purple-400 block">Session Preparation Brief</span>
              {aiBrief ? (
                <div className="space-y-2">
                  <p className="text-slate-200">{aiBrief.summary}</p>
                  <div className="pt-2 border-t border-slate-700/40">
                    <span className="text-slate-400 block text-[11px] mb-1 font-semibold">Suggested Questions:</span>
                    <ul className="list-disc list-inside text-slate-300 space-y-1">
                      {aiBrief.suggestedQuestions?.map((q, idx) => (
                        <li key={idx}>{q}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="text-[11px] text-purple-300 font-medium pt-1">
                    Recommended Next Step: {aiBrief.recommendedNextStep}
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 italic">Click "Prep Brief" to generate interview questions based on student profile.</p>
              )}
            </div>

            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50 space-y-3 text-xs">
              <span className="font-semibold text-indigo-400 block">Session Summary Draft</span>
              {aiSummary ? (
                <div className="space-y-2">
                  <p className="text-slate-200">{aiSummary.summary}</p>
                  <div className="pt-2 border-t border-slate-700/40">
                    <span className="text-slate-400 block text-[11px] mb-1 font-semibold">Agreed Action Items:</span>
                    <ul className="list-disc list-inside text-slate-300 space-y-1">
                      {aiSummary.actionItems?.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 italic">Select an appointment and click "Summary Draft" to generate a reviewable session summary.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SCHEDULE APPOINTMENT */}
      {showApptModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              Book Counselling Appointment
            </h3>
            <form onSubmit={handleScheduleAppt} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Appointment Type</label>
                <select
                  value={newAppt.appointmentType}
                  onChange={(e) => setNewAppt({ ...newAppt, appointmentType: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                >
                  <option value="COURSE_GUIDANCE">Course Guidance & Career Fit</option>
                  <option value="SKILL_ASSESSMENT">Prerequisite Assessment</option>
                  <option value="BATCH_SELECTION">Batch Timing Consultation</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Session Date & Time</label>
                <input
                  type="datetime-local"
                  value={newAppt.startAt.slice(0, 16)}
                  onChange={(e) => setNewAppt({ ...newAppt, startAt: e.target.value + ':00+05:30' })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApptModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium"
                >
                  Confirm Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RESCHEDULE */}
      {showRescheduleModal && selectedAppt && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Reschedule Appointment #{selectedAppt.appointmentId}</h3>
            <form onSubmit={handleReschedule} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">New Start Time</label>
                <input
                  type="datetime-local"
                  value={rescheduleForm.newStartAt.slice(0, 16)}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, newStartAt: e.target.value + ':00+05:30' })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Reason</label>
                <input
                  type="text"
                  value={rescheduleForm.reason}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, reason: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRescheduleModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium"
                >
                  Save Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RECORD ASSESSMENT */}
      {showAssessmentModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Needs Assessment for {selectedStudent.studentName}</h3>
            <form onSubmit={handleRecordAssessment} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Current Skill Level</label>
                <select
                  value={assessmentForm.currentSkillLevel}
                  onChange={(e) => setAssessmentForm({ ...assessmentForm, currentSkillLevel: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                >
                  <option value="BEGINNER">Beginner (No coding experience)</option>
                  <option value="INTERMEDIATE">Intermediate (Basic Java / JS)</option>
                  <option value="ADVANCED">Advanced</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Counsellor Notes & Observations</label>
                <textarea
                  rows={3}
                  value={assessmentForm.counsellorNotes}
                  onChange={(e) => setAssessmentForm({ ...assessmentForm, counsellorNotes: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssessmentModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium"
                >
                  Save Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SESSION NOTES */}
      {showNotesModal && selectedAppt && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Session Notes: {selectedAppt.studentName}</h3>
            <form onSubmit={handleRecordNotes} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Session Summary</label>
                <textarea
                  rows={3}
                  value={sessionNotesForm.sessionSummary}
                  onChange={(e) => setSessionNotesForm({ ...sessionNotesForm, sessionSummary: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Student Concerns (comma separated)</label>
                <input
                  type="text"
                  value={sessionNotesForm.studentConcerns}
                  onChange={(e) => setSessionNotesForm({ ...sessionNotesForm, studentConcerns: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Agreed Next Steps (comma separated)</label>
                <input
                  type="text"
                  value={sessionNotesForm.agreedNextSteps}
                  onChange={(e) => setSessionNotesForm({ ...sessionNotesForm, agreedNextSteps: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNotesModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium"
                >
                  Save Notes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ACTION PLAN */}
      {showPlanModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Create Action Plan for {selectedStudent.studentName}</h3>
            <form onSubmit={handleCreatePlan} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Plan Title</label>
                <input
                  type="text"
                  value={planForm.title}
                  onChange={(e) => setPlanForm({ ...planForm, title: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Plan Description</label>
                <textarea
                  rows={2}
                  value={planForm.description}
                  onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium"
                >
                  Create Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
