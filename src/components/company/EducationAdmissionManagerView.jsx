import React, { useState, useEffect } from 'react';
import {
  GraduationCap, Users, Target, BookOpen, Clock, AlertCircle, Plus,
  Search, Filter, CheckCircle2, ArrowRight, TrendingUp, Sparkles,
  BarChart3, UserCheck, ShieldCheck, RefreshCw, FileText, CheckSquare,
  Award, Eye, AlertTriangle
} from 'lucide-react';
import { educationService } from '../../services/educationService';

export default function EducationAdmissionManagerView({ initialSubTab = 'dashboard' }) {
  const [activeTab, setActiveTab] = useState(initialSubTab);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [enquiries, setEnquiries] = useState([]);
  const [applications, setApplications] = useState([]);
  const [executives, setExecutives] = useState([]);
  const [targets, setTargets] = useState([]);
  const [overdueFollowUps, setOverdueFollowUps] = useState([]);
  const [aiActivities, setAiActivities] = useState([]);
  const [reports, setReports] = useState(null);

  // Modals & Action States
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Form inputs
  const [newEnquiry, setNewEnquiry] = useState({
    studentName: '', email: '', phone: '', courseId: 501,
    source: 'WEBSITE', academicYear: '2026-2027', notes: ''
  });

  const [assignForm, setAssignForm] = useState({
    executiveId: 101, reason: 'Assigning to Java Full Stack admission team'
  });

  const [statusForm, setStatusForm] = useState({
    status: 'APPROVED', remarks: 'Eligibility requirements verified'
  });

  const [newTarget, setNewTarget] = useState({
    name: 'November Admissions Drive', courseId: 501,
    periodStart: '2026-11-01', periodEnd: '2026-11-30',
    targetAdmissions: 120, targetApplications: 200
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dashRes, enqRes, appRes, execRes, tgtRes, ovdRes, aiRes, repRes] =
        await Promise.allSettled([
          educationService.getAdmissionManagerDashboard(),
          educationService.getAdmissionManagerEnquiries(),
          educationService.getAdmissionManagerApplications(),
          educationService.getAdmissionExecutives(),
          educationService.getAdmissionTargets(),
          educationService.getOverdueFollowUps(),
          educationService.getAiAdmissionActivity(),
          educationService.getAdmissionsReport()
        ]);

      if (dashRes.status === 'fulfilled' && dashRes.value?.data) {
        setDashboardData(dashRes.value.data.data || dashRes.value.data);
      }
      if (enqRes.status === 'fulfilled' && enqRes.value?.data) {
        setEnquiries(enqRes.value.data.data?.content || enqRes.value.data.data || []);
      }
      if (appRes.status === 'fulfilled' && appRes.value?.data) {
        setApplications(appRes.value.data.data?.content || appRes.value.data.data || []);
      }
      if (execRes.status === 'fulfilled' && execRes.value?.data) {
        setExecutives(execRes.value.data.data || []);
      }
      if (tgtRes.status === 'fulfilled' && tgtRes.value?.data) {
        setTargets(tgtRes.value.data.data || []);
      }
      if (ovdRes.status === 'fulfilled' && ovdRes.value?.data) {
        setOverdueFollowUps(ovdRes.value.data.data || []);
      }
      if (aiRes.status === 'fulfilled' && aiRes.value?.data) {
        setAiActivities(aiRes.value.data.data?.content || aiRes.value.data.data || []);
      }
      if (repRes.status === 'fulfilled' && repRes.value?.data) {
        setReports(repRes.value.data.data || null);
      }
    } catch (e) {
      console.error('Failed to load admission manager data', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEnquiry = async (e) => {
    e.preventDefault();
    try {
      const res = await educationService.createAdmissionManagerEnquiry(newEnquiry);
      setActionSuccess('Admission enquiry created successfully!');
      setShowEnquiryModal(false);
      setNewEnquiry({ studentName: '', email: '', phone: '', courseId: 501, source: 'WEBSITE', academicYear: '2026-2027', notes: '' });
      loadData();
    } catch (err) {
      setActionError(err.message || 'Failed to create enquiry');
    }
  };

  const handleAssignExecutive = async (e) => {
    e.preventDefault();
    if (!selectedEnquiry) return;
    try {
      await educationService.assignExecutiveToEnquiry(selectedEnquiry.enquiryId, assignForm);
      setActionSuccess(`Enquiry #${selectedEnquiry.enquiryId} assigned successfully!`);
      setShowAssignModal(false);
      loadData();
    } catch (err) {
      setActionError(err.message || 'Failed to assign executive');
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;
    try {
      await educationService.updateApplicationStatus(selectedApp.applicationId, statusForm);
      setActionSuccess(`Application #${selectedApp.applicationId} status updated to ${statusForm.status}!`);
      setShowStatusModal(false);
      loadData();
    } catch (err) {
      setActionError(err.message || 'Failed to update application status');
    }
  };

  const handleCreateTarget = async (e) => {
    e.preventDefault();
    try {
      await educationService.createAdmissionTarget(newTarget);
      setActionSuccess('Admission target created successfully!');
      setShowTargetModal(false);
      loadData();
    } catch (err) {
      setActionError(err.message || 'Failed to create target');
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Admission Dashboard', icon: BarChart3 },
    { id: 'enquiries', label: 'Enquiries Pipeline', icon: Users },
    { id: 'applications', label: 'Applications Review', icon: BookOpen },
    { id: 'targets', label: 'Targets & Goals', icon: Target },
    { id: 'workload', label: 'Executive Workload', icon: UserCheck },
    { id: 'reports', label: 'Admission Reports', icon: TrendingUp },
    { id: 'followups', label: 'Overdue Follow-ups', icon: Clock },
    { id: 'ai', label: 'AI Admission Activity', icon: Sparkles }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-violet-900 via-indigo-900 to-purple-950 p-6 rounded-2xl border border-violet-700/40 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial-gradient from-violet-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-violet-300 text-xs font-semibold uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
              Education / Training Tenant • Role Authority
            </div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-violet-400" />
              Admission Manager Portal
            </h1>
            <p className="text-violet-200/80 text-sm mt-1 max-w-2xl">
              Tenant: <span className="font-semibold text-white">ABC Training Institute</span> (TEN-EDU-001). Oversee enquiry routing, application pipelines, conversion targets, and admission performance.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowEnquiryModal(true)}
              className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-xl flex items-center gap-2 shadow-lg shadow-violet-900/40 transition-all text-sm"
            >
              <Plus className="w-4 h-4" />
              New Enquiry
            </button>
            <button
              onClick={() => setShowTargetModal(true)}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl flex items-center gap-2 border border-white/10 transition-all text-sm"
            >
              <Target className="w-4 h-4 text-violet-300" />
              New Target
            </button>
            <button
              onClick={loadData}
              className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition text-violet-200"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto mt-6 pt-4 border-t border-violet-800/60 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-white text-violet-950 shadow-md font-bold'
                    : 'text-violet-200/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-violet-700' : 'text-violet-300'}`} />
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
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400">Total Enquiries</span>
              <div className="text-2xl font-bold text-white mt-1">{dashboardData?.summary?.totalEnquiries || 420}</div>
              <span className="text-[11px] text-violet-400 mt-1 block">Full institute pipeline</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400">New Leads</span>
              <div className="text-2xl font-bold text-amber-400 mt-1">{dashboardData?.summary?.newEnquiries || 85}</div>
              <span className="text-[11px] text-slate-400 mt-1 block">Awaiting assignment</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400">Applications</span>
              <div className="text-2xl font-bold text-blue-400 mt-1">{dashboardData?.summary?.applicationsSubmitted || 145}</div>
              <span className="text-[11px] text-blue-300 mt-1 block">{dashboardData?.conversion?.enquiryToApplicationPercent || 34.52}% conversion</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400">Under Review</span>
              <div className="text-2xl font-bold text-purple-400 mt-1">{dashboardData?.summary?.applicationsUnderReview || 38}</div>
              <span className="text-[11px] text-purple-300 mt-1 block">Manager decisions</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400">Admissions Confirmed</span>
              <div className="text-2xl font-bold text-emerald-400 mt-1">{dashboardData?.summary?.admissionsConfirmed || 76}</div>
              <span className="text-[11px] text-emerald-300 mt-1 block">{dashboardData?.conversion?.applicationToAdmissionPercent || 52.41}% win rate</span>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400">Overdue Tasks</span>
              <div className="text-2xl font-bold text-rose-400 mt-1">{dashboardData?.summary?.overdueFollowUps || 12}</div>
              <span className="text-[11px] text-rose-300 mt-1 block">Requires escalation</span>
            </div>
          </div>

          {/* Quick Enquiries Table */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-violet-400" />
                Recent Admission Enquiries
              </h2>
              <button onClick={() => setActiveTab('enquiries')} className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
                View all ({enquiries.length}) <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3 font-medium">ID</th>
                    <th className="pb-3 font-medium">Student Name</th>
                    <th className="pb-3 font-medium">Contact</th>
                    <th className="pb-3 font-medium">Course Interest</th>
                    <th className="pb-3 font-medium">Assigned Executive</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {enquiries.slice(0, 5).map((e) => (
                    <tr key={e.enquiryId} className="hover:bg-slate-800/30">
                      <td className="py-3 font-mono text-slate-300">#{e.enquiryId}</td>
                      <td className="py-3 font-semibold text-white">{e.studentName}</td>
                      <td className="py-3 text-slate-400">{e.email || e.phone}</td>
                      <td className="py-3 text-slate-300">{e.courseId === 501 ? 'Java Full Stack' : 'Generative AI'}</td>
                      <td className="py-3">
                        {e.assignedExecutiveName ? (
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 border border-slate-700">
                            {e.assignedExecutiveName}
                          </span>
                        ) : (
                          <span className="text-amber-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          e.status === 'ASSIGNED' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          e.status === 'QUALIFIED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {e.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => { setSelectedEnquiry(e); setShowAssignModal(true); }}
                          className="px-2.5 py-1 bg-violet-600/20 hover:bg-violet-600/40 text-violet-300 rounded border border-violet-500/30 text-xs"
                        >
                          Assign
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ENQUIRIES */}
      {activeTab === 'enquiries' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-white">Full Admission Enquiries Registry</h2>
              <p className="text-xs text-slate-400">Filter, search, assign executives, and escalate high-priority student enquiries.</p>
            </div>
            <button
              onClick={() => setShowEnquiryModal(true)}
              className="px-3.5 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 self-start"
            >
              <Plus className="w-3.5 h-3.5" /> Create Enquiry
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-medium">ID</th>
                  <th className="pb-3 font-medium">Student Name</th>
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Phone</th>
                  <th className="pb-3 font-medium">Source</th>
                  <th className="pb-3 font-medium">Executive</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {enquiries.map((e) => (
                  <tr key={e.enquiryId} className="hover:bg-slate-800/30">
                    <td className="py-3 font-mono text-slate-300">#{e.enquiryId}</td>
                    <td className="py-3 font-semibold text-white">{e.studentName}</td>
                    <td className="py-3 text-slate-400">{e.email}</td>
                    <td className="py-3 text-slate-400">{e.phone}</td>
                    <td className="py-3 text-slate-300">{e.source}</td>
                    <td className="py-3">{e.assignedExecutiveName || <span className="text-amber-400 italic">Unassigned</span>}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-500/10 text-violet-300 border border-violet-500/20">
                        {e.status}
                      </span>
                    </td>
                    <td className="py-3 text-right flex items-center justify-end gap-2">
                      <button
                        onClick={() => { setSelectedEnquiry(e); setShowAssignModal(true); }}
                        className="px-2.5 py-1 bg-violet-600/20 hover:bg-violet-600/40 text-violet-300 rounded border border-violet-500/30 text-xs"
                      >
                        Assign
                      </button>
                      <button
                        onClick={async () => {
                          await educationService.escalateEnquiry(e.enquiryId, { reason: 'Manager High Priority' });
                          setActionSuccess(`Enquiry #${e.enquiryId} escalated!`);
                          loadData();
                        }}
                        className="px-2.5 py-1 bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 rounded border border-rose-500/30 text-xs"
                      >
                        Escalate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: APPLICATIONS */}
      {activeTab === 'applications' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Application Pipeline & Review</h2>
              <p className="text-xs text-slate-400">Validate eligibility, check submitted documents, and authorize admissions.</p>
            </div>
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
                  <th className="pb-3 font-medium">Missing Docs</th>
                  <th className="pb-3 font-medium text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {applications.map((app) => (
                  <tr key={app.applicationId} className="hover:bg-slate-800/30">
                    <td className="py-3 font-mono text-slate-300">#{app.applicationId}</td>
                    <td className="py-3 font-semibold text-white">{app.studentName}</td>
                    <td className="py-3 text-slate-300">{app.courseName || 'Java Full Stack Development'}</td>
                    <td className="py-3 text-slate-400">{app.intake || 'NOVEMBER_2026'}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        app.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        app.status === 'SUBMITTED' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400">
                      {app.missingDocuments && app.missingDocuments.length > 0 ? (
                        <span className="text-rose-400 text-[11px]">{app.missingDocuments.join(', ')}</span>
                      ) : (
                        <span className="text-emerald-400 text-[11px]">All Documents Verified</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => { setSelectedApp(app); setShowStatusModal(true); }}
                        className="px-2.5 py-1 bg-violet-600 hover:bg-violet-500 text-white rounded text-xs"
                      >
                        Review / Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: TARGETS */}
      {activeTab === 'targets' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Course & Team Admission Targets</h2>
            <button
              onClick={() => setShowTargetModal(true)}
              className="px-3.5 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Create Admission Target
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {targets.map((tgt) => (
              <div key={tgt.targetId} className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-base">{tgt.name}</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {tgt.status}
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  Period: <span className="text-slate-200">{tgt.periodStart}</span> to <span className="text-slate-200">{tgt.periodEnd}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Target Admissions</span>
                    <span className="font-semibold text-white">{tgt.currentAdmissions} / {tgt.targetAdmissions}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div
                      className="bg-violet-500 h-2 rounded-full"
                      style={{ width: `${Math.min(100, ((tgt.currentAdmissions || 0) / (tgt.targetAdmissions || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Application Volume</span>
                    <span className="font-semibold text-white">{tgt.currentApplications} / {tgt.targetApplications}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${Math.min(100, ((tgt.currentApplications || 0) / (tgt.targetApplications || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: EXECUTIVE WORKLOAD */}
      {activeTab === 'workload' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-base font-semibold text-white">Executive Workload & Allocation Balancing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {executives.map((ex) => (
              <div key={ex.executiveId} className="bg-slate-800/40 border border-slate-700/60 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">{ex.name}</h3>
                    <p className="text-xs text-slate-400">{ex.email}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-violet-500/20 text-violet-300">
                    ID #{ex.executiveId}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-slate-700/40">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Assigned</span>
                    <span className="font-bold text-white text-sm">{ex.assignedEnquiries || 42}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Submitted</span>
                    <span className="font-bold text-emerald-400 text-sm">{ex.applicationsSubmitted || 9}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Overdue Tasks</span>
                    <span className="font-bold text-rose-400 text-sm">{ex.overdueFollowUps || 3}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: REPORTS */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl space-y-2">
              <span className="text-xs text-slate-400">Total Admission Target</span>
              <div className="text-3xl font-bold text-white">{reports?.admissionsTarget || 100}</div>
              <p className="text-xs text-emerald-400 font-medium">Achieved: {reports?.admissionsAchieved || 76} (76%)</p>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl space-y-2">
              <span className="text-xs text-slate-400">Enquiry to Application</span>
              <div className="text-3xl font-bold text-blue-400">34.52%</div>
              <p className="text-xs text-slate-400">Above industry standard (28%)</p>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl space-y-2">
              <span className="text-xs text-slate-400">Application to Admission</span>
              <div className="text-3xl font-bold text-purple-400">52.41%</div>
              <p className="text-xs text-slate-400">High qualification fidelity</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: OVERDUE FOLLOW-UPS */}
      {activeTab === 'followups' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Overdue Follow-Up Tasks Requiring Manager Attention
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-medium">Task ID</th>
                  <th className="pb-3 font-medium">Student Name</th>
                  <th className="pb-3 font-medium">Task Title</th>
                  <th className="pb-3 font-medium">Due Date</th>
                  <th className="pb-3 font-medium">Priority</th>
                  <th className="pb-3 font-medium">Assigned To</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {overdueFollowUps.map((task) => (
                  <tr key={task.taskId} className="hover:bg-slate-800/30">
                    <td className="py-3 font-mono text-slate-300">#{task.taskId}</td>
                    <td className="py-3 font-semibold text-white">{task.studentName}</td>
                    <td className="py-3 text-slate-300">{task.title}</td>
                    <td className="py-3 text-rose-400">{task.dueAt}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        {task.priority || 'HIGH'}
                      </span>
                    </td>
                    <td className="py-3 text-slate-300">Executive #{task.assignedTo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 8: AI ADMISSION ACTIVITY */}
      {activeTab === 'ai' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              Authorized AI Admission Agent Activity Log
            </h2>
            <span className="text-xs text-violet-300 bg-violet-950/60 px-2.5 py-1 rounded border border-violet-800">
              Human-in-the-Loop Enforced
            </span>
          </div>
          <div className="space-y-3">
            {aiActivities.map((act) => (
              <div key={act.activityId} className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-white flex items-center gap-2">
                    <span>{act.type}</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-violet-500/20 text-violet-300 rounded font-normal">
                      {act.channel}
                    </span>
                  </div>
                  <p className="text-slate-400 mt-1">{act.summary}</p>
                </div>
                <div className="text-right">
                  <span className="text-slate-400">{act.createdAt}</span>
                  <span className="block text-[11px] text-amber-400 font-semibold">{act.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: CREATE ENQUIRY */}
      {showEnquiryModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-violet-400" />
              Register New Admission Enquiry
            </h3>
            <form onSubmit={handleCreateEnquiry} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Student Full Name</label>
                <input
                  required
                  type="text"
                  value={newEnquiry.studentName}
                  onChange={(e) => setNewEnquiry({ ...newEnquiry, studentName: e.target.value })}
                  placeholder="e.g. Arun Kumar"
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
                    placeholder="arun@example.com"
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
                    placeholder="+919876543210"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Course Interest</label>
                  <select
                    value={newEnquiry.courseId}
                    onChange={(e) => setNewEnquiry({ ...newEnquiry, courseId: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                  >
                    <option value={501}>501 - Java Full Stack Development</option>
                    <option value={502}>502 - Applied Generative AI & LLMs</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Source</label>
                  <select
                    value={newEnquiry.source}
                    onChange={(e) => setNewEnquiry({ ...newEnquiry, source: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                  >
                    <option value="WEBSITE">Website Portal</option>
                    <option value="PHONE">Inbound Phone</option>
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="EDUCATION_FAIR">Education Fair</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Admission Notes</label>
                <textarea
                  rows={3}
                  value={newEnquiry.notes}
                  onChange={(e) => setNewEnquiry({ ...newEnquiry, notes: e.target.value })}
                  placeholder="Student background, timeline, preferences..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                />
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
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-medium"
                >
                  Create Enquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN EXECUTIVE */}
      {showAssignModal && selectedEnquiry && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-violet-400" />
              Assign Enquiry #{selectedEnquiry.enquiryId}
            </h3>
            <p className="text-xs text-slate-400">
              Student: <span className="text-white font-semibold">{selectedEnquiry.studentName}</span>
            </p>
            <form onSubmit={handleAssignExecutive} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Select Admission Executive</label>
                <select
                  value={assignForm.executiveId}
                  onChange={(e) => setAssignForm({ ...assignForm, executiveId: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                >
                  <option value={101}>Priya (Exec #101) - 42 active enquiries</option>
                  <option value={102}>Rahul (Exec #102) - 35 active enquiries</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Assignment Reason</label>
                <input
                  type="text"
                  value={assignForm.reason}
                  onChange={(e) => setAssignForm({ ...assignForm, reason: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-medium"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: APPLICATION REVIEW STATUS */}
      {showStatusModal && selectedApp && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-violet-400" />
              Review Application #{selectedApp.applicationId}
            </h3>
            <p className="text-xs text-slate-400">
              Student: <span className="text-white font-semibold">{selectedApp.studentName}</span>
            </p>
            <form onSubmit={handleUpdateStatus} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Application Decision / Status</label>
                <select
                  value={statusForm.status}
                  onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                >
                  <option value="APPROVED">APPROVED (Verified)</option>
                  <option value="UNDER_REVIEW">UNDER REVIEW</option>
                  <option value="REJECTED">REJECTED (Ineligible)</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Remarks & Verification Notes</label>
                <textarea
                  rows={3}
                  value={statusForm.remarks}
                  onChange={(e) => setStatusForm({ ...statusForm, remarks: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-medium"
                >
                  Save Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE ADMISSION TARGET */}
      {showTargetModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-violet-400" />
              Set Admission Target
            </h3>
            <form onSubmit={handleCreateTarget} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Target Name</label>
                <input
                  type="text"
                  value={newTarget.name}
                  onChange={(e) => setNewTarget({ ...newTarget, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Target Admissions</label>
                  <input
                    type="number"
                    value={newTarget.targetAdmissions}
                    onChange={(e) => setNewTarget({ ...newTarget, targetAdmissions: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Target Applications</label>
                  <input
                    type="number"
                    value={newTarget.targetApplications}
                    onChange={(e) => setNewTarget({ ...newTarget, targetApplications: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTargetModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-medium"
                >
                  Create Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
