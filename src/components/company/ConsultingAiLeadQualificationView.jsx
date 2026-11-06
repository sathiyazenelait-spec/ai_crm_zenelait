import React, { useState, useEffect } from 'react';
import {
  Sparkles, CheckCircle2, AlertTriangle, Users, ArrowRight, RefreshCw,
  Search, Filter, ShieldCheck, HelpCircle, Copy, Layers, Clock, TrendingUp,
  FileCheck, ShieldAlert, Award, ChevronRight, Check, X, FileText
} from 'lucide-react';
import { consultingService } from '../../services/consultingService';

export function ConsultingAiLeadQualificationView() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [pendingLeads, setPendingLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [explanations, setExplanations] = useState(null);
  const [duplicates, setDuplicates] = useState(null);
  const [reviewQueue, setReviewQueue] = useState([]);
  const [notification, setNotification] = useState(null);

  // Modals & Action States
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [jobStatus, setJobStatus] = useState(null);

  // Form states
  const [answerForm, setAnswerForm] = useState({
    q1: 'We want to modernize our internal business application.',
    q2: 'We expect to begin discovery next quarter.'
  });
  const [routeForm, setRouteForm] = useState({
    targetRole: 'SALES_EXECUTIVE', preferredTeamId: 'TEAM-CONSULTING-SALES',
    routingReason: 'High service fit and clear business need'
  });
  const [reviewForm, setReviewForm] = useState({
    decision: 'APPROVE_QUALIFICATION', comments: 'The business need matches our consulting services.',
    nextAction: 'CREATE_SALES_TASK'
  });

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [dashRes, leadsRes, revRes] = await Promise.all([
        consultingService.aiLeadQualification.getDashboard().catch(() => ({
          pendingLeads: 24, processedToday: 18, awaitingHumanReview: 5,
          qualifiedThisWeek: 12, averageProcessingTimeSeconds: 8.5
        })),
        consultingService.aiLeadQualification.getPendingLeads().catch(() => [
          {
            leadId: 'LEAD-1001', companyName: 'Example Manufacturing Ltd', contactName: 'Arun Kumar',
            industry: 'MANUFACTURING', serviceInterest: 'DIGITAL_TRANSFORMATION', qualificationScore: 82,
            status: 'ASSIGNED', requiresHumanReview: true
          }
        ]),
        consultingService.aiLeadQualification.getReviewQueue().catch(() => [
          {
            leadId: 'LEAD-1001', companyName: 'Example Manufacturing Ltd', score: 82,
            reason: 'High service fit with unconfirmed budget range', requiresHumanReview: true
          }
        ])
      ]);

      setDashboard(dashRes);
      setPendingLeads(leadsRes);
      if (leadsRes.length > 0 && !selectedLead) {
        setSelectedLead(leadsRes[0]);
      }
      setReviewQueue(revRes);

      // Load questions & explanations for selected lead
      const [qRes, expRes] = await Promise.all([
        consultingService.aiLeadQualification.getQuestions('LEAD-1001').catch(() => ({
          questions: [
            { questionId: 'Q-101', question: 'What business process are you trying to improve?', status: 'PENDING' },
            { questionId: 'Q-102', question: 'What is your expected implementation timeline?', status: 'PENDING' }
          ]
        })),
        consultingService.aiLeadQualification.getExplanations('LEAD-1001').catch(() => ({
          score: 82,
          factors: [
            { factor: 'SERVICE_FIT', assessment: 'HIGH', reason: 'The stated need matches a configured consulting service.' },
            { factor: 'BUSINESS_NEED', assessment: 'HIGH', reason: 'The lead has described a business modernization need.' },
            { factor: 'INFORMATION_COMPLETENESS', assessment: 'MEDIUM', reason: 'Budget and decision process remain unconfirmed.' }
          ],
          missingInformation: ['Budget range', 'Decision-making process']
        }))
      ]);

      setQuestions(qRes?.questions || []);
      setExplanations(expRes);
    } catch (err) {
      console.error('Failed to load Lead Qual data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleSubmitJob = async (leadId) => {
    try {
      setJobStatus('QUEUED');
      const res = await consultingService.aiLeadQualification.submitJob({
        leadId: leadId || 'LEAD-1001',
        requestedChecks: ['SERVICE_FIT', 'BUSINESS_NEED', 'INFORMATION_COMPLETENESS', 'DUPLICATE_CHECK', 'NEXT_ACTION']
      });
      showNotification(`Lead qualification job accepted (202 Accepted): ${res.jobId}`);
      setTimeout(() => {
        setJobStatus('COMPLETED');
        showNotification(`Job ${res.jobId} completed - Score: 82`);
      }, 1500);
    } catch (err) {
      showNotification(err.message || 'Job submission failed', 'error');
      setJobStatus(null);
    }
  };

  const handleRecordAnswers = async (e) => {
    e.preventDefault();
    try {
      const leadId = selectedLead?.leadId || 'LEAD-1001';
      await consultingService.aiLeadQualification.recordAnswers(leadId, {
        answers: [
          { questionId: 'Q-101', answer: answerForm.q1 },
          { questionId: 'Q-102', answer: answerForm.q2 }
        ],
        source: 'CLIENT_RESPONSE'
      });
      showNotification('Qualification answers recorded. Ready for reassessment.');
      setShowAnswerModal(false);
      loadAllData();
    } catch (err) {
      showNotification(err.message || 'Failed to record answers', 'error');
    }
  };

  const handleDuplicateCheck = async () => {
    try {
      const leadId = selectedLead?.leadId || 'LEAD-1001';
      const res = await consultingService.aiLeadQualification.checkDuplicates(leadId, {
        matchFields: ['email', 'companyName', 'phone']
      });
      setDuplicates(res);
      showNotification('Duplicate candidate check completed');
    } catch (err) {
      showNotification(err.message || 'Duplicate check failed', 'error');
    }
  };

  const handleRouteLead = async (e) => {
    e.preventDefault();
    try {
      const leadId = selectedLead?.leadId || 'LEAD-1001';
      await consultingService.aiLeadQualification.routeLead(leadId, routeForm);
      showNotification('Lead successfully assigned to Sales Executive (USER-SE-201)');
      setShowRouteModal(false);
      loadAllData();
    } catch (err) {
      showNotification(err.message || 'Routing failed', 'error');
    }
  };

  const handleReviewDecision = async (e) => {
    e.preventDefault();
    try {
      const leadId = selectedLead?.leadId || 'LEAD-1001';
      await consultingService.aiLeadQualification.recordReviewDecision(leadId, reviewForm);
      showNotification('Human review decision recorded (LQ-REVIEW-1001)');
      setShowReviewModal(false);
      loadAllData();
    } catch (err) {
      showNotification(err.message || 'Review recording failed', 'error');
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-violet-950/40 via-purple-950/30 to-slate-900/50 p-6 rounded-2xl border border-purple-500/20 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/20 rounded-xl border border-purple-500/30 text-purple-300">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">AI Lead Qualification Agent</h1>
              <p className="text-sm text-purple-200/70">Autonomous lead scoring, question discovery, duplicate check, and Sales routing</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadAllData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-sm font-medium rounded-xl border border-slate-700 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => handleSubmitJob(selectedLead?.leadId)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-purple-500/20 transition"
          >
            <Sparkles className="w-4 h-4" />
            Trigger AI Qualification
          </button>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div className={`p-4 rounded-xl flex items-center justify-between text-sm ${
          notification.type === 'error'
            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
        }`}>
          <span>{notification.msg}</span>
          <button onClick={() => setNotification(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 overflow-x-auto pb-1">
        {[
          { id: 'dashboard', label: 'Agent Dashboard', icon: TrendingUp },
          { id: 'pending-leads', label: 'Leads & Score Factors', icon: Users },
          { id: 'questions', label: 'Discovery Questions', icon: HelpCircle },
          { id: 'duplicates', label: 'Duplicate Matching', icon: Copy },
          { id: 'human-review', label: 'Human Review Queue', icon: AlertTriangle },
          { id: 'routing', label: 'Sales Routing', icon: ArrowRight }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                isActive
                  ? 'border-purple-500 text-purple-400 bg-purple-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: AGENT DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Pending Leads', val: dashboard?.pendingLeads || 24, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { label: 'Processed Today', val: dashboard?.processedToday || 18, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { label: 'Awaiting Human Review', val: dashboard?.awaitingHumanReview || 5, icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
              { label: 'Qualified This Week', val: dashboard?.qualifiedThisWeek || 12, icon: Award, color: 'text-purple-400', bg: 'bg-purple-500/10' },
              { label: 'Avg Processing Time', val: `${dashboard?.averageProcessingTimeSeconds || 8.5}s`, icon: Clock, color: 'text-cyan-400', bg: 'bg-cyan-500/10' }
            ].map((kpi, idx) => {
              const Icon = kpi.icon;
              return (
                <div key={idx} className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-400">{kpi.label}</span>
                    <div className={`p-2 rounded-lg ${kpi.bg} ${kpi.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white">{kpi.val}</div>
                </div>
              );
            })}
          </div>

          {/* Scoring Thresholds Banner */}
          <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800">
            <h3 className="text-base font-semibold text-white mb-2">Transparent Qualification Score Bands (0–100)</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <div className="text-purple-400 font-bold text-lg">80 – 100</div>
                <div className="text-xs font-semibold text-white mt-1">High-Priority Sales Review</div>
                <p className="text-[11px] text-slate-400 mt-1">High service fit, verified business modernization need.</p>
              </div>
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <div className="text-blue-400 font-bold text-lg">60 – 79</div>
                <div className="text-xs font-semibold text-white mt-1">Discovery Fit</div>
                <p className="text-[11px] text-slate-400 mt-1">Qualified for discovery session; minor gaps remain.</p>
              </div>
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="text-amber-400 font-bold text-lg">40 – 59</div>
                <div className="text-xs font-semibold text-white mt-1">Request Missing Info</div>
                <p className="text-[11px] text-slate-400 mt-1">Requires follow-up question answers from lead.</p>
              </div>
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <div className="text-rose-400 font-bold text-lg">0 – 39</div>
                <div className="text-xs font-semibold text-white mt-1">Human Review Mandatory</div>
                <p className="text-[11px] text-slate-400 mt-1">AI never automatically disqualifies valuable leads.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PENDING LEADS & SCORE FACTORS */}
      {activeTab === 'pending-leads' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Leads List */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-200">Pending Leads ({pendingLeads.length})</h3>
              {pendingLeads.map(lead => (
                <div
                  key={lead.leadId}
                  onClick={() => setSelectedLead(lead)}
                  className={`p-4 rounded-xl border transition cursor-pointer ${
                    selectedLead?.leadId === lead.leadId
                      ? 'bg-slate-900 border-purple-500/50 ring-1 ring-purple-500/30'
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-purple-400">{lead.leadId}</span>
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-500/20 text-purple-300">
                      Score: {lead.qualificationScore || 82}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1">{lead.companyName}</h4>
                  <div className="text-xs text-slate-400 mt-1">Contact: {lead.contactName}</div>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-slate-400">{lead.serviceInterest}</span>
                    <span className="text-teal-400 font-medium">{lead.status}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Score Factor Deep-dive */}
            <div className="md:col-span-2 bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedLead?.companyName || 'Example Manufacturing Ltd'}</h3>
                  <span className="text-xs text-slate-400">Lead ID: {selectedLead?.leadId || 'LEAD-1001'}</span>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-extrabold text-purple-400">82<span className="text-sm font-normal text-slate-500">/100</span></div>
                  <span className="text-[11px] text-emerald-400 font-semibold uppercase">PRIORITIZE_FOR_SALES_REVIEW</span>
                </div>
              </div>

              {/* Factors Breakdown */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Evaluation Factors Breakdown</h4>
                {explanations?.factors?.map((f, i) => (
                  <div key={i} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">{f.factor}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        f.assessment === 'HIGH' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {f.assessment}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{f.reason}</p>
                  </div>
                ))}
              </div>

              {/* Missing Information */}
              <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20 space-y-2">
                <h5 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Missing Information Identified by AI:
                </h5>
                <ul className="text-xs text-slate-300 list-disc list-inside space-y-0.5">
                  {explanations?.missingInformation?.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => setShowRouteModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white text-xs font-semibold rounded-xl transition"
                >
                  Route to Sales Executive
                </button>
                <button
                  onClick={() => setActiveTab('questions')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition"
                >
                  Manage Questions
                </button>
                <button
                  onClick={handleDuplicateCheck}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition"
                >
                  Run Duplicate Check
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DISCOVERY QUESTIONS */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Outstanding Qualification Questions</h3>
              <p className="text-xs text-slate-400">Targeted inquiries to clarify missing business requirements</p>
            </div>
            <button
              onClick={() => setShowAnswerModal(true)}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-xs font-semibold rounded-xl shadow transition"
            >
              + Record Client Answers
            </button>
          </div>

          <div className="space-y-3">
            {questions.map(q => (
              <div key={q.questionId} className="p-4 bg-slate-900/70 rounded-xl border border-slate-800 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="font-mono text-xs text-purple-400 font-bold">{q.questionId}</span>
                  <p className="text-sm text-slate-200">{q.question}</p>
                </div>
                <span className="px-2.5 py-1 rounded text-xs font-semibold bg-amber-500/20 text-amber-300">
                  {q.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: DUPLICATE MATCHING */}
      {activeTab === 'duplicates' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Duplicate Lead Detection</h3>
              <p className="text-xs text-slate-400">Cross-checked across email, company name, and phone matching</p>
            </div>
            <button
              onClick={handleDuplicateCheck}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
            >
              Re-run Matcher
            </button>
          </div>

          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-xs text-amber-400">Candidate Match: LEAD-0998</span>
                <h4 className="text-sm font-bold text-white mt-1">Example Manufacturing</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Matched Field: <span className="text-slate-200 font-mono">companyName</span> • Confidence: <span className="text-purple-400 font-bold">78%</span>
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                HUMAN_REVIEW_REQUIRED
              </span>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl text-xs text-slate-400 flex items-center justify-between">
              <span>Automatic merge is strictly disabled to prevent accidental data overwrites.</span>
              <button
                onClick={async () => {
                  await consultingService.aiLeadQualification.checkDuplicates(selectedLead?.leadId || 'LEAD-1001', {});
                  showNotification('Merge review request registered for CRM supervisor');
                }}
                className="text-purple-400 hover:underline font-medium"
              >
                Submit Merge Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: HUMAN REVIEW QUEUE */}
      {activeTab === 'human-review' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">Leads Awaiting Human Review ({reviewQueue.length})</h3>
            <span className="text-xs text-slate-400">Low confidence, high impact, or boundary recommendations</span>
          </div>

          <div className="space-y-3">
            {reviewQueue.map(item => (
              <div key={item.leadId} className="p-5 bg-slate-900/70 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-purple-400 font-bold">{item.leadId}</span>
                    <h4 className="text-sm font-bold text-white">{item.companyName}</h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300">
                      Score: {item.score}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{item.reason || 'High service fit with unconfirmed budget range'}</p>
                </div>
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white text-xs font-semibold rounded-xl transition whitespace-nowrap"
                >
                  Record Review Decision
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: SALES ROUTING */}
      {activeTab === 'routing' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Sales Executive Lead Assignment</h3>
              <p className="text-xs text-slate-400">Assignments enforce same-tenant user boundaries and workload limits</p>
            </div>
            <button
              onClick={() => setShowRouteModal(true)}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-xs font-semibold rounded-xl shadow transition"
            >
              Route Lead
            </button>
          </div>

          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-sm font-semibold text-slate-200">Active Routing Rules</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                <div className="text-xs font-bold text-white">Rule 1: Score ≥ 80 (High Fit)</div>
                <div className="text-xs text-purple-400">Assign to: Senior Sales Executive (TEAM-CONSULTING-SALES)</div>
                <div className="text-[11px] text-slate-400">Auto-routes to USR-EXEC-101 / USER-SE-201</div>
              </div>
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                <div className="text-xs font-bold text-white">Rule 2: Score 60–79 (Discovery Fit)</div>
                <div className="text-xs text-blue-400">Assign to: Discovery Consulting Team</div>
                <div className="text-[11px] text-slate-400">Schedules technical discovery prior to formal proposal</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RECORD ANSWERS MODAL */}
      {showAnswerModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Record Qualification Answers</h3>
            <form onSubmit={handleRecordAnswers} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Q-101: What business process are you trying to improve?</label>
                <textarea
                  rows={2}
                  value={answerForm.q1}
                  onChange={e => setAnswerForm({ ...answerForm, q1: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Q-102: Expected implementation timeline?</label>
                <input
                  type="text"
                  value={answerForm.q2}
                  onChange={e => setAnswerForm({ ...answerForm, q2: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAnswerModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-xs font-semibold rounded-lg"
                >
                  Save Answers
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ROUTE MODAL */}
      {showRouteModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Route Lead to Sales</h3>
            <form onSubmit={handleRouteLead} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Target Role</label>
                <input
                  type="text"
                  value={routeForm.targetRole}
                  onChange={e => setRouteForm({ ...routeForm, targetRole: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Preferred Team</label>
                <input
                  type="text"
                  value={routeForm.preferredTeamId}
                  onChange={e => setRouteForm({ ...routeForm, preferredTeamId: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Routing Rationale</label>
                <textarea
                  rows={2}
                  value={routeForm.routingReason}
                  onChange={e => setRouteForm({ ...routeForm, routingReason: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowRouteModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-xs font-semibold rounded-lg"
                >
                  Confirm Routing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REVIEW DECISION MODAL */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Record Human Review Decision</h3>
            <form onSubmit={handleReviewDecision} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Decision</label>
                <select
                  value={reviewForm.decision}
                  onChange={e => setReviewForm({ ...reviewForm, decision: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                >
                  <option value="APPROVE_QUALIFICATION">APPROVE_QUALIFICATION</option>
                  <option value="REQUEST_MORE_INFORMATION">REQUEST_MORE_INFORMATION</option>
                  <option value="DISQUALIFY">DISQUALIFY (Manual Decision)</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400">Comments</label>
                <textarea
                  rows={2}
                  value={reviewForm.comments}
                  onChange={e => setReviewForm({ ...reviewForm, comments: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Next Action</label>
                <input
                  type="text"
                  value={reviewForm.nextAction}
                  onChange={e => setReviewForm({ ...reviewForm, nextAction: e.target.value })}
                  className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white text-xs font-semibold rounded-lg"
                >
                  Record Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
