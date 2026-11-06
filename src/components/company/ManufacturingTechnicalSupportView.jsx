import React, { useState, useEffect } from 'react';
import { useCRM } from '../../context/CRMContext';
import { manufacturingService } from '../../services/manufacturingService';
import {
  Wrench,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  Calendar,
  Check,
  X,
  BookOpen,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Layers,
  Thermometer,
  Activity,
  FileText,
  UserCheck,
  Send,
  Sliders,
  Clock,
  Eye
} from 'lucide-react';

export function ManufacturingTechnicalSupportView() {
  const { addNotification } = useCRM();

  const [activeTab, setActiveTab] = useState('cases'); // 'dashboard' | 'cases' | 'diagnostics' | 'specs' | 'services' | 'warranty'
  const [isLoading, setIsLoading] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);

  // Diagnostic session states
  const [activeSession, setActiveSession] = useState(null);
  const [diagnosticObservations, setDiagnosticObservations] = useState([
    { type: 'TEMPERATURE', value: 92, unit: 'C', recordedAt: '2026-10-29T08:20:00+05:30' },
    { type: 'VIBRATION', value: 'ABOVE_NORMAL', unit: 'QUALITATIVE', recordedAt: '2026-10-29T08:21:00+05:30' }
  ]);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [newObsType, setNewObsType] = useState('TEMPERATURE');
  const [newObsVal, setNewObsVal] = useState('88');
  const [newObsUnit, setNewObsUnit] = useState('C');

  // Modals & form states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);

  // Forms
  const [caseForm, setCaseForm] = useState({
    customerId: 'CUS-1001',
    productId: 'PRD-2001',
    serialNumber: 'SN-MTR-2026-001',
    subject: 'Industrial motor overheating',
    description: 'The motor temperature rises above its normal operating range under rated load.',
    issueCategory: 'OVERHEATING',
    priority: 'HIGH',
    source: 'PHONE'
  });

  const [escalateForm, setEscalateForm] = useState({
    reason: 'Potential equipment safety concern',
    escalationType: 'SAFETY',
    description: 'The reported temperature exceeds 90 C and poses a thermal safety hazard.'
  });

  const [resolveForm, setResolveForm] = useState({
    resolutionCode: 'INSPECTION_COMPLETED',
    resolutionSummary: 'Bearing cooling clearance adjusted and temperature stabilized at 68 C.',
    knowledgeArticleId: 'KB-1001'
  });

  const [serviceForm, setServiceForm] = useState({
    serviceType: 'ONSITE_INSPECTION',
    description: 'Field diagnostic inspection requested for industrial motor thermal monitoring.',
    requestedDate: '2026-10-31',
    locationId: 'LOC-1001'
  });

  const [assessmentForm, setAssessmentForm] = useState({
    claimId: 'WCL-3001',
    findings: 'Operating temperature exceeded rated 85 C operating thermal envelope under continuous duty.',
    recommendedAction: 'FURTHER_INSPECTION',
    confidence: 'NEEDS_VERIFICATION'
  });

  const [selectedProductSpecs, setSelectedProductSpecs] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [dashRes, casesRes, specsRes] = await Promise.allSettled([
        manufacturingService.technicalSupport.getDashboard(),
        manufacturingService.technicalSupport.getCases(),
        manufacturingService.technicalSupport.getProductSpecs('PRD-2001')
      ]);

      if (dashRes.status === 'fulfilled') setDashboard(dashRes.value);
      if (casesRes.status === 'fulfilled') {
        setCases(casesRes.value);
        if (casesRes.value.length > 0 && !selectedCase) {
          setSelectedCase(casesRes.value[0]);
        }
      }
      if (specsRes.status === 'fulfilled') {
        setSelectedProductSpecs(specsRes.value);
      }
    } catch (err) {
      console.warn('Fallback loading:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCase = async (e) => {
    e.preventDefault();
    try {
      const res = await manufacturingService.technicalSupport.createCase(caseForm);
      addNotification?.({ type: 'success', message: `Technical Case ${res.caseId || 'Created'} successfully!` });
      setShowCreateModal(false);
      loadData();
    } catch (err) {
      addNotification?.({ type: 'error', message: err.message || 'Failed to create case' });
    }
  };

  const handleAssign = async (assigneeId = 'USR-TECH-101') => {
    if (!selectedCase) return;
    try {
      await manufacturingService.technicalSupport.assignCase(selectedCase.caseId, {
        assigneeId,
        reason: 'Requires specialized high-voltage motor diagnostics'
      });
      addNotification?.({ type: 'success', message: `Case ${selectedCase.caseId} assigned to ${assigneeId}` });
      loadData();
    } catch (err) {
      addNotification?.({ type: 'error', message: err.message || 'Assignment failed' });
    }
  };

  const handleEscalateSafety = async (e) => {
    e.preventDefault();
    if (!selectedCase) return;
    try {
      const res = await manufacturingService.technicalSupport.escalateCase(selectedCase.caseId, escalateForm);
      addNotification?.({ type: 'warning', message: `CRITICAL SAFETY ESCALATION triggered for Case ${res.caseId}!` });
      setShowEscalateModal(false);
      loadData();
    } catch (err) {
      addNotification?.({ type: 'error', message: err.message || 'Escalation failed' });
    }
  };

  const handleResolveCase = async (e) => {
    e.preventDefault();
    if (!selectedCase) return;
    try {
      await manufacturingService.technicalSupport.resolveCase(selectedCase.caseId, resolveForm);
      addNotification?.({ type: 'success', message: `Case ${selectedCase.caseId} technical resolution logged!` });
      setShowResolveModal(false);
      loadData();
    } catch (err) {
      addNotification?.({ type: 'error', message: err.message || 'Resolution failed' });
    }
  };

  const handleStartDiagnostics = async () => {
    try {
      const res = await manufacturingService.technicalSupport.startDiagnosticSession({
        caseId: selectedCase ? selectedCase.caseId : 'TSC-10001',
        productId: 'PRD-2001',
        diagnosticType: 'MOTOR_OVERHEATING',
        reportedSymptoms: ['High temperature', 'Unusual vibration']
      });
      setActiveSession(res);
      addNotification?.({ type: 'info', message: `Diagnostic Session ${res.sessionId || 'DGS-5001'} started` });
      setActiveTab('diagnostics');
    } catch (err) {
      addNotification?.({ type: 'error', message: err.message || 'Failed to start diagnostic session' });
    }
  };

  const handleAddObservation = async (e) => {
    e.preventDefault();
    const sessionId = activeSession ? activeSession.sessionId : 'DGS-5001';
    try {
      const newObs = { type: newObsType, value: newObsVal, unit: newObsUnit, recordedAt: new Date().toISOString() };
      await manufacturingService.technicalSupport.recordObservations(sessionId, {
        observations: [newObs]
      });
      setDiagnosticObservations(prev => [...prev, newObs]);
      addNotification?.({ type: 'success', message: 'Diagnostic observation recorded in session' });
      setNewObsVal('');
    } catch (err) {
      addNotification?.({ type: 'error', message: err.message || 'Failed to record observation' });
    }
  };

  const handleGetAiSuggestions = async () => {
    const sessionId = activeSession ? activeSession.sessionId : 'DGS-5001';
    try {
      const res = await manufacturingService.technicalSupport.getTroubleshootingSuggestions(sessionId, {
        includeKnowledgeBase: true,
        includeProductManuals: true,
        includeKnownIssues: true
      });
      setAiSuggestions(res);
      addNotification?.({ type: 'info', message: 'AI troubleshooting suggestions generated (Technician Review Required)' });
    } catch (err) {
      addNotification?.({ type: 'error', message: err.message || 'Failed to generate suggestions' });
    }
  };

  const handleCreateServiceRequest = async (e) => {
    e.preventDefault();
    try {
      const res = await manufacturingService.technicalSupport.createServiceRequest({
        ...serviceForm,
        caseId: selectedCase ? selectedCase.caseId : 'TSC-10001',
        customerId: 'CUS-1001',
        productId: 'PRD-2001'
      });
      addNotification?.({ type: 'success', message: `Service Request ${res.requestId || 'SRV-9001'} created (Requested date pending scheduling confirmation)` });
      setShowServiceModal(false);
    } catch (err) {
      addNotification?.({ type: 'error', message: err.message || 'Service request failed' });
    }
  };

  const handleRecordWarrantyAssessment = async (e) => {
    e.preventDefault();
    try {
      const res = await manufacturingService.technicalSupport.recordWarrantyTechnicalAssessment(assessmentForm.claimId, {
        caseId: selectedCase ? selectedCase.caseId : 'TSC-10001',
        findings: [assessmentForm.findings],
        evidenceIds: ['EVD-7001'],
        recommendedAction: assessmentForm.recommendedAction,
        confidence: assessmentForm.confidence
      });
      addNotification?.({ type: 'success', message: `Technical assessment ${res.assessmentId || 'ASM-4001'} recorded. Awaiting warranty manager approval.` });
      setShowAssessmentModal(false);
    } catch (err) {
      addNotification?.({ type: 'error', message: err.message || 'Assessment recording failed' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Tenant: Manufacturing
            </span>
            <span className="px-2.5 py-1 text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full">
              Industrial Technical Support
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Manufacturing Technical Support</h1>
          <p className="text-sm text-slate-400">
            Diagnose product faults, manage diagnostic telemetry, inspect verified specifications, schedule field services, and escalate safety concerns.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition border border-slate-700"
            title="Refresh records"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-xl transition flex items-center gap-2 shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" /> Create Technical Case
          </button>
          <button
            onClick={handleStartDiagnostics}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl transition flex items-center gap-2 shadow-lg shadow-indigo-500/20"
          >
            <Wrench className="w-4 h-4" /> Start Diagnostics
          </button>
        </div>
      </div>

      {/* KPI Metrics Dashboard Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Open Cases</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{dashboard?.openCases ?? 28}</p>
          <span className="text-xs text-blue-600 font-medium">Tenant Active</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Assigned to Me</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{dashboard?.assignedToMe ?? 8}</p>
          <span className="text-xs text-indigo-600 font-medium">Specialist Queue</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">High Priority</p>
          <p className="text-2xl font-bold text-rose-600 mt-1">{dashboard?.highPriorityCases ?? 3}</p>
          <span className="text-xs text-rose-500 font-medium">Requires Fast Action</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Awaiting Info</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{dashboard?.awaitingCustomer ?? 5}</p>
          <span className="text-xs text-amber-500 font-medium">Customer Evidence</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pending Service</p>
          <p className="text-2xl font-bold text-cyan-600 mt-1">{dashboard?.pendingServiceRequests ?? 6}</p>
          <span className="text-xs text-cyan-600 font-medium">Field Inspections</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Resolved Today</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{dashboard?.resolvedToday ?? 4}</p>
          <span className="text-xs text-emerald-600 font-medium">Verified Solutions</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Avg Resolution</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{dashboard?.averageResolutionHours ?? 18.5}h</p>
          <span className="text-xs text-slate-500 font-medium">Tenant SLA</span>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('cases')}
          className={`pb-3 transition border-b-2 ${activeTab === 'cases' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Technical Cases & Queue
        </button>
        <button
          onClick={() => setActiveTab('diagnostics')}
          className={`pb-3 transition border-b-2 flex items-center gap-1.5 ${activeTab === 'diagnostics' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <Wrench className="w-4 h-4" /> Diagnostic Session & AI Suggestions
        </button>
        <button
          onClick={() => setActiveTab('specs')}
          className={`pb-3 transition border-b-2 flex items-center gap-1.5 ${activeTab === 'specs' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <BookOpen className="w-4 h-4" /> Product Specs & Manuals
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`pb-3 transition border-b-2 flex items-center gap-1.5 ${activeTab === 'services' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <Calendar className="w-4 h-4" /> Field Service Requests
        </button>
        <button
          onClick={() => setActiveTab('warranty')}
          className={`pb-3 transition border-b-2 flex items-center gap-1.5 ${activeTab === 'warranty' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <ShieldAlert className="w-4 h-4" /> Warranty Assessments & Quality
        </button>
      </div>

      {/* TAB 1: TECHNICAL CASES */}
      {activeTab === 'cases' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cases List */}
          <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[650px]">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="font-semibold text-slate-800 text-sm">Industrial Cases</span>
              <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-medium">{cases.length}</span>
            </div>
            <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
              {cases.map((c) => (
                <div
                  key={c.caseId}
                  onClick={() => setSelectedCase(c)}
                  className={`p-4 cursor-pointer transition hover:bg-slate-50 ${selectedCase?.caseId === c.caseId ? 'bg-blue-50/50 border-l-4 border-blue-600' : ''}`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-semibold text-xs text-blue-600">{c.caseId}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      c.priority === 'CRITICAL' ? 'bg-rose-100 text-rose-700' :
                      c.priority === 'HIGH' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {c.priority}
                    </span>
                  </div>
                  <h4 className="text-sm font-medium text-slate-900 line-clamp-1">{c.subject}</h4>
                  <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                    <span>SN: {c.serialNumber || 'N/A'}</span>
                    <span className={`font-medium ${
                      c.status === 'ESCALATED' ? 'text-rose-600 font-bold' :
                      c.status === 'RESOLVED' ? 'text-emerald-600' : 'text-blue-600'
                    }`}>{c.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Case Detail */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
            {selectedCase ? (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-xl font-bold text-slate-900">{selectedCase.subject}</h2>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                        selectedCase.status === 'ESCALATED' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                        selectedCase.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {selectedCase.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">Case ID: <span className="font-mono text-slate-700">{selectedCase.caseId}</span> • Product: <span className="font-semibold text-slate-800">{selectedCase.productId}</span></p>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleAssign('USR-TECH-101')}
                      className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition flex items-center gap-1"
                    >
                      <UserCheck className="w-3.5 h-3.5" /> Assign Me
                    </button>
                    <button
                      onClick={() => setShowEscalateModal(true)}
                      className="px-3 py-1.5 text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-medium transition flex items-center gap-1"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-600" /> Escalate Safety
                    </button>
                    <button
                      onClick={() => setShowServiceModal(true)}
                      className="px-3 py-1.5 text-xs bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 rounded-lg font-medium transition flex items-center gap-1"
                    >
                      <Calendar className="w-3.5 h-3.5 text-cyan-600" /> Request Service
                    </button>
                    <button
                      onClick={() => setShowResolveModal(true)}
                      className="px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition flex items-center gap-1 shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" /> Resolve Case
                    </button>
                  </div>
                </div>

                {/* Case Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Customer</span>
                    <span className="text-sm font-medium text-slate-800">{selectedCase.customerId || 'CUS-1001'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Serial Number</span>
                    <span className="text-sm font-mono text-slate-800">{selectedCase.serialNumber || 'SN-MTR-2026-001'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Category</span>
                    <span className="text-sm font-medium text-slate-800">{selectedCase.issueCategory || 'OVERHEATING'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Assigned Specialist</span>
                    <span className="text-sm font-medium text-indigo-700">{selectedCase.assignedTo || 'Unassigned'}</span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Reported Problem Description</h4>
                  <p className="text-sm text-slate-700 bg-white p-3.5 rounded-lg border border-slate-200">
                    {selectedCase.description || 'Customer reports that industrial motor temperature spikes after 2 hours of continuous duty operation.'}
                  </p>
                </div>

                {/* Reported Symptoms */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Reported Symptoms</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCase.reportedSymptoms?.map((s, idx) => (
                      <span key={idx} className="px-3 py-1 bg-amber-50 text-amber-800 text-xs rounded-full border border-amber-200 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-600" /> {s}
                      </span>
                    )) || (
                      <span className="text-xs text-slate-400">No specific symptoms recorded</span>
                    )}
                  </div>
                </div>

                {/* Safety Warning Banner if Escalated */}
                {selectedCase.status === 'ESCALATED' && (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-rose-900">High-Voltage Thermal Safety Escalation Triggered</h4>
                      <p className="text-xs text-rose-700 mt-0.5">
                        Follow the company approved equipment isolation procedure before inspecting equipment. AI troubleshooting suggestions cannot independently verify physical machine safety.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 py-16">
                <Wrench className="w-12 h-12 stroke-[1.5] mb-3 text-slate-300" />
                <p className="text-sm font-medium">Select a case to inspect technical evidence</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: DIAGNOSTICS & AI SUGGESTIONS */}
      {activeTab === 'diagnostics' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    Diagnostic Session: {activeSession ? activeSession.sessionId : 'DGS-5001'}
                  </h3>
                  <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                    IN_PROGRESS
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Target Product: <span className="font-semibold text-slate-800">PRD-2001 (Industrial Motor M200)</span> • Type: <span className="font-semibold text-slate-800">MOTOR_OVERHEATING</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleGetAiSuggestions}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Request AI Troubleshooting Suggestions
                </button>
              </div>
            </div>

            {/* Observation Logging Form */}
            <form onSubmit={handleAddObservation} className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-6 flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Thermometer className="w-4 h-4 text-rose-500" /> Log Diagnostic Observation:
              </span>
              <select
                value={newObsType}
                onChange={(e) => setNewObsType(e.target.value)}
                className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
              >
                <option value="TEMPERATURE">TEMPERATURE</option>
                <option value="VIBRATION">VIBRATION</option>
                <option value="VOLTAGE_DROP">VOLTAGE_DROP</option>
                <option value="BEARING_NOISE">BEARING_NOISE</option>
              </select>
              <input
                type="text"
                value={newObsVal}
                onChange={(e) => setNewObsVal(e.target.value)}
                placeholder="Observed Value (e.g. 92)"
                required
                className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg w-32"
              />
              <input
                type="text"
                value={newObsUnit}
                onChange={(e) => setNewObsUnit(e.target.value)}
                placeholder="Unit (e.g. C)"
                className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg w-20"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition"
              >
                Record Observation
              </button>
            </form>

            {/* Recorded Observations Table */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-blue-600" /> Recorded Physical Telemetry & Observations
              </h4>
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 text-slate-500 uppercase font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Telemetry Type</th>
                      <th className="py-2.5 px-3">Measured Value</th>
                      <th className="py-2.5 px-3">Unit</th>
                      <th className="py-2.5 px-3">Recorded By</th>
                      <th className="py-2.5 px-3">Recorded Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {diagnosticObservations.map((obs, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-semibold text-slate-800">{obs.type}</td>
                        <td className="py-2 px-3 font-mono text-rose-600 font-bold">{obs.value}</td>
                        <td className="py-2 px-3 text-slate-500">{obs.unit}</td>
                        <td className="py-2 px-3 text-slate-600">TECHNICIAN_AUTHENTICATED</td>
                        <td className="py-2 px-3 text-slate-400">{obs.recordedAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI Grounded Troubleshooting Suggestions */}
            {aiSuggestions && (
              <div className="p-5 bg-indigo-50/60 border border-indigo-200 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    <h4 className="text-sm font-bold text-indigo-950">
                      Grounded AI Troubleshooting Suggestions
                    </h4>
                  </div>
                  <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-full border border-amber-200">
                    REQUIRES TECHNICIAN REVIEW
                  </span>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-xs text-amber-900 font-medium">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{aiSuggestions.safetyWarning}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {aiSuggestions.suggestions?.map((sugg, idx) => (
                    <div key={idx} className="p-4 bg-white rounded-lg border border-indigo-100 shadow-sm space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-indigo-700">{sugg.sourceType}</span>
                        <span className="font-mono text-slate-400 text-[10px]">{sugg.documentReference}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-900">{sugg.title}</p>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                        <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">Unverified Suggestion</span>
                        <button
                          onClick={() => addNotification?.({ type: 'success', message: `Technician verified procedure: ${sugg.title}` })}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                        >
                          Mark Reviewed & Verified
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: PRODUCT SPECS & MANUALS */}
      {activeTab === 'specs' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Authoritative Product Technical Specifications</h3>
              <p className="text-xs text-slate-500">Verified from Manufacturing ERP Product Catalogue & Engineering Baseline</p>
            </div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
              Source: PRODUCT_CATALOGUE
            </span>
          </div>

          {selectedProductSpecs ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Product Model</span>
                  <p className="text-sm font-bold text-slate-900">{selectedProductSpecs.productName}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Manufacturer Part No</span>
                  <p className="text-sm font-mono text-slate-800">{selectedProductSpecs.manufacturerPartNumber}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Rated Power</span>
                  <p className="text-sm font-semibold text-blue-600">{selectedProductSpecs.specifications?.ratedPowerKw} kW</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Voltage / Frequency</span>
                  <p className="text-sm font-semibold text-slate-800">{selectedProductSpecs.specifications?.voltage} • {selectedProductSpecs.specifications?.frequency}</p>
                </div>
              </div>

              {/* Safety & Manuals List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-slate-200 rounded-xl bg-white shadow-sm space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-blue-600" /> Approved Product Manuals
                  </h4>
                  <ul className="text-xs text-slate-600 space-y-1.5">
                    <li className="p-2 bg-slate-50 rounded flex items-center justify-between">
                      <span>MAN-M200-01: Industrial Motor M200 User Manual & Installation Guide</span>
                      <a href="#manual" className="text-blue-600 font-semibold hover:underline">View PDF</a>
                    </li>
                  </ul>
                </div>

                <div className="p-4 border border-rose-200 rounded-xl bg-rose-50/30 shadow-sm space-y-2">
                  <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-600" /> Authorized Safety Documents
                  </h4>
                  <ul className="text-xs text-rose-900 space-y-1.5">
                    <li className="p-2 bg-rose-50 rounded flex items-center justify-between border border-rose-100">
                      <span>SAF-M200-01: High Voltage & Thermal Safety Isolation Procedure</span>
                      <a href="#safety" className="text-rose-600 font-semibold hover:underline">View Protocol</a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Loading verified product specifications...</p>
          )}
        </div>
      )}

      {/* TAB 4: FIELD SERVICE REQUESTS */}
      {activeTab === 'services' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Service, Repair & Field Technician Scheduling</h3>
              <p className="text-xs text-slate-500">Requested dates remain tentative until confirmed by the live service scheduler.</p>
            </div>
            <button
              onClick={() => setShowServiceModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Create Service Request
            </button>
          </div>

          <div className="p-4 border border-cyan-200 bg-cyan-50/50 rounded-xl flex items-start gap-3">
            <Calendar className="w-5 h-5 text-cyan-600 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-cyan-950">Active Service Request: SRV-9001</h4>
              <p className="text-xs text-cyan-800 mt-0.5">
                Target: <span className="font-semibold">ONSITE_INSPECTION</span> • Case: <span className="font-mono">TSC-10001</span> • Customer: <span className="font-semibold">CUS-1001</span>
              </p>
              <div className="mt-2 flex items-center gap-3 text-xs">
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-semibold">Status: PENDING_SCHEDULING</span>
                <span className="text-slate-600">Requested Date: <strong>2026-10-31</strong> (Appointment Unconfirmed)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: WARRANTY & QUALITY ASSESSMENTS */}
      {activeTab === 'warranty' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Warranty Technical Findings & Quality Support</h3>
              <p className="text-xs text-slate-500">
                Technical Support records evidence and assessments. Final approval decisions belong to the authorized warranty manager.
              </p>
            </div>
            <button
              onClick={() => setShowAssessmentModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Record Technical Assessment
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-indigo-600">Claim: WCL-3001</span>
                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">PENDING_WARRANTY_REVIEW</span>
              </div>
              <h4 className="text-sm font-semibold text-slate-900">Technical Assessment: ASM-4001</h4>
              <p className="text-xs text-slate-600">
                Finding: Reported operating temperature exceeds threshold entered in the submitted diagnostic observation.
              </p>
              <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-200">
                <span>Recommendation: <strong>FURTHER_INSPECTION</strong></span>
                <span className="text-amber-700 font-medium">Confidence: NEEDS_VERIFICATION</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-slate-600">Quality Complaint: QC-101</span>
                <span className="text-[10px] bg-slate-200 text-slate-800 font-bold px-2 py-0.5 rounded-full">MONITORED</span>
              </div>
              <h4 className="text-sm font-semibold text-slate-900">Bearing Thermal Rise Under 110% Load</h4>
              <p className="text-xs text-slate-600">
                Escalated to plant engineering for batch review under IE3 manufacturing tolerance checks.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CREATE CASE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900">Create Manufacturing Technical Case</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateCase} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Customer ID</label>
                <input
                  type="text"
                  value={caseForm.customerId}
                  onChange={(e) => setCaseForm({ ...caseForm, customerId: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Product ID</label>
                <input
                  type="text"
                  value={caseForm.productId}
                  onChange={(e) => setCaseForm({ ...caseForm, productId: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Serial Number</label>
                <input
                  type="text"
                  value={caseForm.serialNumber}
                  onChange={(e) => setCaseForm({ ...caseForm, serialNumber: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 font-mono"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Subject</label>
                <input
                  type="text"
                  value={caseForm.subject}
                  onChange={(e) => setCaseForm({ ...caseForm, subject: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Detailed Description</label>
                <textarea
                  rows="3"
                  value={caseForm.description}
                  onChange={(e) => setCaseForm({ ...caseForm, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50"
                ></textarea>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium"
                >
                  Create Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ESCALATE SAFETY MODAL */}
      {showEscalateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-rose-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" /> Escalate Safety-Critical Case
              </h3>
              <button onClick={() => setShowEscalateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEscalateSafety} className="space-y-4 text-xs">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800">
                Safety escalations set priority to <strong>CRITICAL</strong> and activate the mandatory organization safety review workflow.
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Reason</label>
                <input
                  type="text"
                  value={escalateForm.reason}
                  onChange={(e) => setEscalateForm({ ...escalateForm, reason: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description & Safety Assessment</label>
                <textarea
                  rows="3"
                  value={escalateForm.description}
                  onChange={(e) => setEscalateForm({ ...escalateForm, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50"
                ></textarea>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowEscalateModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold"
                >
                  Confirm Safety Escalation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESOLVE CASE MODAL */}
      {showResolveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900">Record Technical Resolution</h3>
              <button onClick={() => setShowResolveModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleResolveCase} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Resolution Code</label>
                <select
                  value={resolveForm.resolutionCode}
                  onChange={(e) => setResolveForm({ ...resolveForm, resolutionCode: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50"
                >
                  <option value="INSPECTION_COMPLETED">INSPECTION_COMPLETED</option>
                  <option value="COMPONENT_REPLACED">COMPONENT_REPLACED</option>
                  <option value="LUBRICATION_APPLIED">LUBRICATION_APPLIED</option>
                  <option value="NO_FAULT_FOUND">NO_FAULT_FOUND</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Resolution Summary</label>
                <textarea
                  rows="3"
                  value={resolveForm.resolutionSummary}
                  onChange={(e) => setResolveForm({ ...resolveForm, resolutionSummary: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50"
                ></textarea>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowResolveModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold"
                >
                  Record Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SERVICE REQUEST MODAL */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900">Request Field Service Visit</h3>
              <button onClick={() => setShowServiceModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateServiceRequest} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Service Type</label>
                <select
                  value={serviceForm.serviceType}
                  onChange={(e) => setServiceForm({ ...serviceForm, serviceType: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50"
                >
                  <option value="ONSITE_INSPECTION">ONSITE_INSPECTION</option>
                  <option value="EMERGENCY_REPAIR">EMERGENCY_REPAIR</option>
                  <option value="SCHEDULED_OVERHAUL">SCHEDULED_OVERHAUL</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Requested Date</label>
                <input
                  type="date"
                  value={serviceForm.requestedDate}
                  onChange={(e) => setServiceForm({ ...serviceForm, requestedDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows="3"
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50"
                ></textarea>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setShowServiceModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-semibold">Create Service Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSESSMENT MODAL */}
      {showAssessmentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900">Record Warranty Technical Assessment</h3>
              <button onClick={() => setShowAssessmentModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRecordWarrantyAssessment} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Warranty Claim ID</label>
                <input
                  type="text"
                  value={assessmentForm.claimId}
                  onChange={(e) => setAssessmentForm({ ...assessmentForm, claimId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 font-mono"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Technical Findings</label>
                <textarea
                  rows="3"
                  value={assessmentForm.findings}
                  onChange={(e) => setAssessmentForm({ ...assessmentForm, findings: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50"
                ></textarea>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Recommended Action</label>
                <select
                  value={assessmentForm.recommendedAction}
                  onChange={(e) => setAssessmentForm({ ...assessmentForm, recommendedAction: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50"
                >
                  <option value="FURTHER_INSPECTION">FURTHER_INSPECTION</option>
                  <option value="REPAIR_AUTHORIZED">REPAIR_AUTHORIZED</option>
                  <option value="REPLACE_COMPONENT">REPLACE_COMPONENT</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setShowAssessmentModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold">Record Assessment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
