import React, { useState, useEffect } from 'react';
import {
  UserCheck, Users, Calendar, Phone, Mail, CheckCircle2, AlertCircle,
  Plus, Search, Filter, Clock, Sparkles, FileText, Upload, ArrowRight,
  TrendingUp, Award, RefreshCw, Send, CheckSquare, MessageSquare, AlertTriangle
} from 'lucide-react';
import { educationService } from '../../services/educationService';

export default function EducationAdmissionExecutiveView({ initialSubTab = 'dashboard' }) {
  const [activeTab, setActiveTab] = useState(initialSubTab);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [enquiries, setEnquiries] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [applications, setApplications] = useState([]);
  const [performance, setPerformance] = useState(null);

  // Modals & Action States
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [showQualifyModal, setShowQualifyModal] = useState(false);
  const [showInteractionModal, setShowInteractionModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [showAppModal, setShowAppModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [aiDraft, setAiDraft] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Forms
  const [newEnquiry, setNewEnquiry] = useState({
    studentName: '', email: '', phone: '', courseId: 501,
    source: 'PHONE', preferredContactMethod: 'WHATSAPP',
    academicYear: '2026-2027', notes: ''
  });

  const [qualifyForm, setQualifyForm] = useState({
    qualificationStatus: 'QUALIFIED', educationLevel: 'BSC',
    preferredSchedule: 'WEEKEND', expectedJoiningDate: '2026-11-15',
    notes: 'Meets eligibility criteria'
  });

  const [interactionForm, setInteractionForm] = useState({
    interactionType: 'CALL', direction: 'OUTBOUND',
    outcome: 'INTERESTED', notes: 'Discussed weekend batch and syllabus',
    nextAction: 'FOLLOW_UP', nextActionAt: '2026-10-28T11:00:00+05:30'
  });

  const [followUpForm, setFollowUpForm] = useState({
    taskType: 'CALL', title: 'Discuss weekend batch options',
    dueAt: '2026-10-28T11:00:00+05:30', priority: 'MEDIUM', notes: ''
  });

  const [appForm, setAppForm] = useState({
    courseId: 501, academicYear: '2026-2027', intake: 'NOVEMBER_2026',
    applicationNotes: 'Initiated after qualification'
  });

  const [docForm, setDocForm] = useState({
    documentType: 'EDUCATION_CERTIFICATE', fileName: 'degree-certificate.pdf'
  });

  const [aiForm, setAiForm] = useState({
    channel: 'EMAIL', purpose: 'COURSE_INFORMATION_FOLLOW_UP', tone: 'FRIENDLY'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashRes, enqRes, folRes, appRes, perfRes] = await Promise.allSettled([
        educationService.getAdmissionExecutiveDashboard(),
        educationService.getAssignedEnquiries(),
        educationService.getMyFollowUps(),
        educationService.getMyApplications(),
        educationService.getPersonalPerformance()
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value?.data) {
        setDashboardData(dashRes.value.data.data || dashRes.value.data);
      }
      if (enqRes.status === 'fulfilled' && enqRes.value?.data) {
        setEnquiries(enqRes.value.data.data?.content || enqRes.value.data.data || []);
      }
      if (folRes.status === 'fulfilled' && folRes.value?.data) {
        setFollowUps(folRes.value.data.data || []);
      }
      if (appRes.status === 'fulfilled' && appRes.value?.data) {
        setApplications(appRes.value.data.data || []);
      }
      if (perfRes.status === 'fulfilled' && perfRes.value?.data) {
        setPerformance(perfRes.value.data.data || null);
      }
    } catch (e) {
      console.error('Failed to load executive data', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEnquiry = async (e) => {
    e.preventDefault();
    try {
      await educationService.createExecutiveEnquiry(newEnquiry);
      setActionSuccess('Enquiry created and assigned to you!');
      setShowEnquiryModal(false);
      setNewEnquiry({ studentName: '', email: '', phone: '', courseId: 501, source: 'PHONE', preferredContactMethod: 'WHATSAPP', academicYear: '2026-2027', notes: '' });
      loadData();
    } catch (err) {
      setActionError(err.message || 'Failed to create enquiry');
    }
  };

  const handleQualify = async (e) => {
    e.preventDefault();
    if (!selectedEnquiry) return;
    try {
      await educationService.qualifyEnquiry(selectedEnquiry.enquiryId, qualifyForm);
      setActionSuccess(`Enquiry #${selectedEnquiry.enquiryId} qualified!`);
      setShowQualifyModal(false);
      loadData();
    } catch (err) {
      setActionError(err.message || 'Failed to qualify enquiry');
    }
  };

  const handleInteraction = async (e) => {
    e.preventDefault();
    if (!selectedEnquiry) return;
    try {
      await educationService.recordInteraction(selectedEnquiry.enquiryId, interactionForm);
      setActionSuccess(`Interaction logged for #${selectedEnquiry.enquiryId}`);
      setShowInteractionModal(false);
      loadData();
    } catch (err) {
      setActionError(err.message || 'Failed to record interaction');
    }
  };

  const handleCreateFollowUp = async (e) => {
    e.preventDefault();
    if (!selectedEnquiry) return;
    try {
      await educationService.createFollowUpTask(selectedEnquiry.enquiryId, followUpForm);
      setActionSuccess('Follow-up task created!');
      setShowFollowUpModal(false);
      loadData();
    } catch (err) {
      setActionError(err.message || 'Failed to create follow-up');
    }
  };

  const handleCompleteFollowUp = async (taskId) => {
    try {
      await educationService.completeFollowUp(taskId, { outcome: 'STUDENT_WANTS_TO_JOIN' });
      setActionSuccess(`Follow-up #${taskId} marked completed!`);
      loadData();
    } catch (err) {
      setActionError(err.message || 'Failed to complete task');
    }
  };

  const handleStartApp = async (e) => {
    e.preventDefault();
    if (!selectedEnquiry) return;
    try {
      await educationService.startApplication(selectedEnquiry.enquiryId, appForm);
      setActionSuccess(`Application started for ${selectedEnquiry.studentName}!`);
      setShowAppModal(false);
      loadData();
    } catch (err) {
      setActionError(err.message || 'Failed to initiate application');
    }
  };

  const handleRegisterDoc = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;
    try {
      await educationService.registerDocument(selectedApp.applicationId, docForm);
      setActionSuccess(`Document metadata registered for #${selectedApp.applicationId}!`);
      setShowDocModal(false);
      loadData();
    } catch (err) {
      setActionError(err.message || 'Failed to register document');
    }
  };

  const handleGenerateAiDraft = async (e) => {
    e.preventDefault();
    if (!selectedEnquiry) return;
    try {
      const res = await educationService.generateAiFollowUpDraft({
        enquiryId: selectedEnquiry.enquiryId,
        ...aiForm
      });
      setAiDraft(res.data.data || res.data);
      setActionSuccess('AI Follow-up Draft generated for review!');
    } catch (err) {
      setActionError(err.message || 'Failed to generate draft');
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'My Dashboard', icon: UserCheck },
    { id: 'enquiries', label: 'My Assigned Enquiries', icon: Users },
    { id: 'followups', label: 'My Follow-up Tasks', icon: Clock },
    { id: 'applications', label: 'Applications & Docs', icon: FileText },
    { id: 'ai', label: 'AI Follow-up Drafts', icon: Sparkles },
    { id: 'performance', label: 'My Performance', icon: Award }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 p-6 rounded-2xl border border-indigo-700/40 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Admission Executive Workspace • Priya (ID #101)
            </div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <UserCheck className="w-8 h-8 text-indigo-400" />
              Admission Executive Desk
            </h1>
            <p className="text-indigo-200/80 text-sm mt-1 max-w-2xl">
              Manage personal leads, qualify student interests, record calls & WhatsApp interactions, complete follow-up tasks, and submit verified applications.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowEnquiryModal(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-900/40 transition-all text-sm"
            >
              <Plus className="w-4 h-4" />
              New Student Lead
            </button>
            <button
              onClick={loadData}
              className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition text-indigo-200"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto mt-6 pt-4 border-t border-indigo-800/60 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-white text-indigo-950 shadow-md font-bold'
                    : 'text-indigo-200/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-indigo-700' : 'text-indigo-300'}`} />
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
              <span className="text-xs text-slate-400">Assigned Enquiries</span>
              <div className="text-2xl font-bold text-white mt-1">{dashboardData?.summary?.assignedEnquiries || 42}</div>
              <span className="text-[11px] text-indigo-400 mt-1 block">Active prospects</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400">New Uncontacted</span>
              <div className="text-2xl font-bold text-amber-400 mt-1">{dashboardData?.summary?.newEnquiries || 8}</div>
              <span className="text-[11px] text-slate-400 mt-1 block">Awaiting call</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400">Due Today</span>
              <div className="text-2xl font-bold text-blue-400 mt-1">{dashboardData?.summary?.followUpsDueToday || 6}</div>
              <span className="text-[11px] text-blue-300 mt-1 block">Follow-up calls</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400">Overdue Tasks</span>
              <div className="text-2xl font-bold text-rose-400 mt-1">{dashboardData?.summary?.overdueFollowUps || 2}</div>
              <span className="text-[11px] text-rose-300 mt-1 block">High priority</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400">In Progress Apps</span>
              <div className="text-2xl font-bold text-purple-400 mt-1">{dashboardData?.summary?.applicationsInProgress || 12}</div>
              <span className="text-[11px] text-purple-300 mt-1 block">Doc collection</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400">Submitted Apps</span>
              <div className="text-2xl font-bold text-emerald-400 mt-1">{dashboardData?.summary?.applicationsSubmittedThisMonth || 9}</div>
              <span className="text-[11px] text-emerald-300 mt-1 block">This month</span>
            </div>
          </div>

          {/* Today Tasks */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              Follow-ups Due Today
            </h2>
            <div className="space-y-3">
              {followUps.map((f) => (
                <div key={f.taskId} className="p-3.5 bg-slate-800/40 border border-slate-700/50 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-white flex items-center gap-2">
                      <span>{f.studentName}</span>
                      <span className="text-[10px] px-1.5 py-0.2 bg-blue-500/20 text-blue-300 rounded">{f.taskType}</span>
                    </div>
                    <p className="text-slate-400 mt-1">{f.title}</p>
                    <span className="text-[11px] text-indigo-400 block mt-1">Due: {f.dueAt}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {f.status !== 'COMPLETED' ? (
                      <button
                        onClick={() => handleCompleteFollowUp(f.taskId)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium text-xs flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                      </button>
                    ) : (
                      <span className="text-emerald-400 font-semibold">Done</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ENQUIRIES */}
      {activeTab === 'enquiries' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Assigned Student Enquiries</h2>
            <button
              onClick={() => setShowEnquiryModal(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> New Enquiry
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-medium">ID</th>
                  <th className="pb-3 font-medium">Student Name</th>
                  <th className="pb-3 font-medium">Contact</th>
                  <th className="pb-3 font-medium">Source</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {enquiries.map((e) => (
                  <tr key={e.enquiryId} className="hover:bg-slate-800/30">
                    <td className="py-3 font-mono text-slate-300">#{e.enquiryId}</td>
                    <td className="py-3 font-semibold text-white">{e.studentName}</td>
                    <td className="py-3 text-slate-400">{e.email} • {e.phone}</td>
                    <td className="py-3 text-slate-300">{e.source}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {e.status}
                      </span>
                    </td>
                    <td className="py-3 text-right flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => { setSelectedEnquiry(e); setShowQualifyModal(true); }}
                        className="px-2 py-1 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 rounded border border-indigo-500/30 text-xs"
                      >
                        Qualify
                      </button>
                      <button
                        onClick={() => { setSelectedEnquiry(e); setShowInteractionModal(true); }}
                        className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-xs"
                      >
                        Log Call
                      </button>
                      <button
                        onClick={() => { setSelectedEnquiry(e); setShowFollowUpModal(true); }}
                        className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-xs"
                      >
                        Follow-up
                      </button>
                      <button
                        onClick={() => { setSelectedEnquiry(e); setShowAppModal(true); }}
                        className="px-2 py-1 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 rounded border border-emerald-500/30 text-xs"
                      >
                        Start App
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: FOLLOW-UPS */}
      {activeTab === 'followups' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-base font-semibold text-white">My Follow-Up Task Queue</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-medium">Task ID</th>
                  <th className="pb-3 font-medium">Student Name</th>
                  <th className="pb-3 font-medium">Task Type</th>
                  <th className="pb-3 font-medium">Title</th>
                  <th className="pb-3 font-medium">Due At</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {followUps.map((f) => (
                  <tr key={f.taskId} className="hover:bg-slate-800/30">
                    <td className="py-3 font-mono text-slate-300">#{f.taskId}</td>
                    <td className="py-3 font-semibold text-white">{f.studentName}</td>
                    <td className="py-3 text-slate-300">{f.taskType}</td>
                    <td className="py-3 text-slate-300">{f.title}</td>
                    <td className="py-3 text-slate-400">{f.dueAt}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        f.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {f.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {f.status !== 'COMPLETED' && (
                        <button
                          onClick={() => handleCompleteFollowUp(f.taskId)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs"
                        >
                          Complete
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

      {/* TAB 4: APPLICATIONS & DOCUMENTS */}
      {activeTab === 'applications' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Student Applications & Document Registry</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-medium">Application ID</th>
                  <th className="pb-3 font-medium">Student Name</th>
                  <th className="pb-3 font-medium">Course</th>
                  <th className="pb-3 font-medium">Intake</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Missing Documents</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {applications.map((app) => (
                  <tr key={app.applicationId} className="hover:bg-slate-800/30">
                    <td className="py-3 font-mono text-slate-300">#{app.applicationId}</td>
                    <td className="py-3 font-semibold text-white">{app.studentName}</td>
                    <td className="py-3 text-slate-300">{app.courseName || 'Java Full Stack'}</td>
                    <td className="py-3 text-slate-400">{app.intake || 'NOVEMBER_2026'}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-300">
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400">
                      {app.missingDocuments && app.missingDocuments.length > 0 ? (
                        <span className="text-rose-400 text-[11px]">{app.missingDocuments.join(', ')}</span>
                      ) : (
                        <span className="text-emerald-400 text-[11px]">All Clean</span>
                      )}
                    </td>
                    <td className="py-3 text-right flex items-center justify-end gap-2">
                      <button
                        onClick={() => { setSelectedApp(app); setShowDocModal(true); }}
                        className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-xs flex items-center gap-1"
                      >
                        <Upload className="w-3 h-3" /> Add Doc
                      </button>
                      <button
                        onClick={async () => {
                          await educationService.submitApplicationForReview(app.applicationId, { submissionNote: 'All docs ready' });
                          setActionSuccess(`Application #${app.applicationId} submitted for review!`);
                          loadData();
                        }}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs"
                      >
                        Submit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: AI FOLLOW-UP DRAFTS */}
      {activeTab === 'ai' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                AI Follow-up Message Generator
              </h2>
              <p className="text-xs text-slate-400">Generate friendly, contextual email or WhatsApp follow-up messages based on course details and student notes.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3 text-xs bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
              <div>
                <label className="text-slate-400 block mb-1">Select Student Prospect</label>
                <select
                  onChange={(e) => {
                    const found = enquiries.find(x => x.enquiryId === Number(e.target.value));
                    setSelectedEnquiry(found);
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                >
                  <option value="">-- Choose Enquiry --</option>
                  {enquiries.map(e => (
                    <option key={e.enquiryId} value={e.enquiryId}>#{e.enquiryId} - {e.studentName}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Channel</label>
                  <select
                    value={aiForm.channel}
                    onChange={(e) => setAiForm({ ...aiForm, channel: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                  >
                    <option value="EMAIL">Email</option>
                    <option value="WHATSAPP">WhatsApp</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Tone</label>
                  <select
                    value={aiForm.tone}
                    onChange={(e) => setAiForm({ ...aiForm, tone: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                  >
                    <option value="FRIENDLY">Friendly & Encouraging</option>
                    <option value="PROFESSIONAL">Professional & Direct</option>
                  </select>
                </div>
              </div>
              <button
                onClick={handleGenerateAiDraft}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Generate Follow-up Draft
              </button>
            </div>

            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50 space-y-3">
              <span className="text-xs font-semibold text-slate-300">Generated Draft Output (Human Review Required)</span>
              {aiDraft ? (
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Subject</span>
                    <div className="font-semibold text-white">{aiDraft.subject}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Message Body</span>
                    <div className="p-3 bg-slate-900 rounded border border-slate-800 text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {aiDraft.body}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setActionSuccess('Draft copied to clipboard!')}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium text-xs flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" /> Approve & Send
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 text-xs">
                  Select an enquiry and click Generate to produce an AI follow-up draft.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: PERFORMANCE */}
      {activeTab === 'performance' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl space-y-2">
              <span className="text-xs text-slate-400">Conversion Rate</span>
              <div className="text-3xl font-bold text-emerald-400">{performance?.conversionRate || 32.14}%</div>
              <p className="text-xs text-slate-400">Assigned: {performance?.assignedEnquiries || 42} • Qualified: {performance?.qualifiedCount || 28}</p>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl space-y-2">
              <span className="text-xs text-slate-400">Applications Submitted</span>
              <div className="text-3xl font-bold text-indigo-400">{performance?.applicationsSubmitted || 9}</div>
              <p className="text-xs text-slate-400">Monthly Target: 10</p>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl space-y-2">
              <span className="text-xs text-slate-400">Response Speed</span>
              <div className="text-3xl font-bold text-amber-400">{performance?.averageFirstResponseMinutes || 15} min</div>
              <p className="text-xs text-slate-400">Rating: {performance?.rating || 4.8} / 5.0 ⭐</p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NEW ENQUIRY */}
      {showEnquiryModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-400" />
              Register Prospect Enquiry
            </h3>
            <form onSubmit={handleCreateEnquiry} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Student Name</label>
                <input
                  required
                  type="text"
                  value={newEnquiry.studentName}
                  onChange={(e) => setNewEnquiry({ ...newEnquiry, studentName: e.target.value })}
                  placeholder="e.g. Meena Raj"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Email</label>
                  <input
                    required
                    type="email"
                    value={newEnquiry.email}
                    onChange={(e) => setNewEnquiry({ ...newEnquiry, email: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Phone</label>
                  <input
                    required
                    type="tel"
                    value={newEnquiry.phone}
                    onChange={(e) => setNewEnquiry({ ...newEnquiry, phone: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEnquiryModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium"
                >
                  Register Enquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: QUALIFY ENQUIRY */}
      {showQualifyModal && selectedEnquiry && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-indigo-400" />
              Qualify Prospect #{selectedEnquiry.enquiryId}
            </h3>
            <form onSubmit={handleQualify} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Education Level</label>
                <input
                  type="text"
                  value={qualifyForm.educationLevel}
                  onChange={(e) => setQualifyForm({ ...qualifyForm, educationLevel: e.target.value })}
                  placeholder="e.g. B.Sc Computer Science / B.Tech"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Schedule Preference</label>
                  <select
                    value={qualifyForm.preferredSchedule}
                    onChange={(e) => setQualifyForm({ ...qualifyForm, preferredSchedule: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                  >
                    <option value="WEEKEND">Weekend Cohort</option>
                    <option value="WEEKDAY">Weekday Evening</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Target Joining Date</label>
                  <input
                    type="date"
                    value={qualifyForm.expectedJoiningDate}
                    onChange={(e) => setQualifyForm({ ...qualifyForm, expectedJoiningDate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQualifyModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium"
                >
                  Save Qualification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LOG INTERACTION */}
      {showInteractionModal && selectedEnquiry && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Phone className="w-5 h-5 text-indigo-400" />
              Log Interaction with {selectedEnquiry.studentName}
            </h3>
            <form onSubmit={handleInteraction} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Channel</label>
                  <select
                    value={interactionForm.interactionType}
                    onChange={(e) => setInteractionForm({ ...interactionForm, interactionType: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                  >
                    <option value="CALL">Phone Call</option>
                    <option value="WHATSAPP">WhatsApp Message</option>
                    <option value="EMAIL">Email</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Outcome</label>
                  <select
                    value={interactionForm.outcome}
                    onChange={(e) => setInteractionForm({ ...interactionForm, outcome: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                  >
                    <option value="INTERESTED">Interested</option>
                    <option value="NEEDS_COUNSELLING">Needs Counselling</option>
                    <option value="CALL_BACK_LATER">Call Back Later</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Interaction Notes</label>
                <textarea
                  rows={3}
                  value={interactionForm.notes}
                  onChange={(e) => setInteractionForm({ ...interactionForm, notes: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInteractionModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium"
                >
                  Record Interaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: START APPLICATION */}
      {showAppModal && selectedEnquiry && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              Initiate Application for {selectedEnquiry.studentName}
            </h3>
            <form onSubmit={handleStartApp} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Academic Year</label>
                <input
                  type="text"
                  value={appForm.academicYear}
                  onChange={(e) => setAppForm({ ...appForm, academicYear: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Intake Batch</label>
                <input
                  type="text"
                  value={appForm.intake}
                  onChange={(e) => setAppForm({ ...appForm, intake: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAppModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium"
                >
                  Create Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD DOCUMENT */}
      {showDocModal && selectedApp && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-400" />
              Register Document Metadata
            </h3>
            <form onSubmit={handleRegisterDoc} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Document Type</label>
                <select
                  value={docForm.documentType}
                  onChange={(e) => setDocForm({ ...docForm, documentType: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                >
                  <option value="EDUCATION_CERTIFICATE">Graduation / Degree Certificate</option>
                  <option value="IDENTITY_PROOF">Government Identity Proof</option>
                  <option value="TRANSCRIPT">Marks Transcript</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">File Name</label>
                <input
                  type="text"
                  value={docForm.fileName}
                  onChange={(e) => setDocForm({ ...docForm, fileName: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDocModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium"
                >
                  Save Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
