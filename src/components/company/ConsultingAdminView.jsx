import React, { useState, useEffect } from 'react';
import { useCRM } from '../../context/CRMContext';
import { consultingService } from '../../services/consultingService';
import { DataTable } from '../common/DataTable';
import { FormDialog } from '../common/FormDialog';
import { StatusBadge } from '../common/StatusBadge';
import {
  Briefcase,
  Award,
  Users,
  Building,
  Calendar,
  FileCheck2,
  FolderGit2,
  TrendingUp,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  Bot,
  Send,
  Building2,
  FileText,
  Shield,
  BarChart3,
  Layers,
  Check,
  X,
  Video,
  Presentation,
  Target
} from 'lucide-react';

export function ConsultingAdminView() {
  const { addNotification } = useCRM();

  const [activeTab, setActiveTab] = useState('overview'); // overview, services, consultants, leads, accounts, appointments, proposals, engagements, projects, ai_agents, reports
  const [dashboard, setDashboard] = useState(null);
  const [services, setServices] = useState([]);
  const [consultants, setConsultants] = useState([]);
  const [leads, setLeads] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [engagements, setEngagements] = useState([]);
  const [projects, setProjects] = useState([]);
  const [revenueReport, setRevenueReport] = useState(null);
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Modals & Form States
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [showAddConsultantModal, setShowAddConsultantModal] = useState(false);
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [showAddApptModal, setShowAddApptModal] = useState(false);
  const [showAddProposalModal, setShowAddProposalModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Service Form
  const [serviceCode, setServiceCode] = useState('SEC-AUDIT-003');
  const [serviceName, setServiceName] = useState('Enterprise Cybersecurity & SOC-2 Compliance Advisory');
  const [serviceModel, setServiceModel] = useState('FIXED_FEE');
  const [servicePrice, setServicePrice] = useState(85000);
  const [serviceDesc, setServiceDesc] = useState('Comprehensive audit of cloud infrastructure, IAM policies, and penetration test preparation.');

  // New Consultant Form
  const [consName, setConsName] = useState('Dr. Vikramaditya Sen');
  const [consTitle, setConsTitle] = useState('Senior Security & Compliance Strategist');
  const [consSpecs, setConsSpecs] = useState('SOC-2, ISO 27001, AWS Security');
  const [consExp, setConsExp] = useState(16);
  const [consRate, setConsRate] = useState(12000);

  // New Lead Form
  const [leadCompany, setLeadCompany] = useState('PayPulse Payments Technologies');
  const [leadContact, setLeadContact] = useState('Shreya Iyer');
  const [leadEmail, setLeadEmail] = useState('shreya@paypulse.in');
  const [leadPhone, setLeadPhone] = useState('+91 98409 88776');
  const [leadService, setLeadService] = useState('IT Strategy & Cloud Migration Consulting');
  const [leadBudget, setLeadBudget] = useState('₹2,00,000 - ₹5,00,000');

  // New Appointment Form
  const [apptTitle, setApptTitle] = useState('Cloud Migration Architecture Discovery Call');
  const [apptLead, setApptLead] = useState('CLEAD-001');
  const [apptConsultant, setApptConsultant] = useState('Karthik Subramanian');
  const [apptStart, setApptStart] = useState('2026-11-10T14:30:00+05:30');
  const [apptType, setApptType] = useState('VIDEO_CALL');

  // AI Agent Simulator State
  const [agentTestType, setAgentTestType] = useState('CONSULTING_LEAD_QUALIFICATION');
  const [testQuestion, setTestQuestion] = useState('We are a Series-B fintech startup with 80 engineers looking to migrate from on-prem datacenter to AWS within 6 months. Budget is ₹15-20 Lakhs.');
  const [testResult, setTestResult] = useState(null);
  const [isTestingAgent, setIsTestingAgent] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [dash, sList, cList, lList, aList, appList, pList, eList, prjList, rev, sett] = await Promise.all([
        consultingService.getDashboard(),
        consultingService.getServices(),
        consultingService.getConsultants(),
        consultingService.getLeads(),
        consultingService.getAccounts(),
        consultingService.getAppointments(),
        consultingService.getProposals(),
        consultingService.getEngagements(),
        consultingService.getProjects(),
        consultingService.getRevenueReport(),
        consultingService.getSettings()
      ]);

      setDashboard(dash);
      setServices(sList);
      setConsultants(cList);
      setLeads(lList);
      setAccounts(aList);
      setAppointments(appList);
      setProposals(pList);
      setEngagements(eList);
      setProjects(prjList);
      setRevenueReport(rev);
      setSettings(sett);
    } catch (err) {
      console.error('Failed to load consulting data:', err);
      addNotification?.({
        type: 'error',
        title: 'Sync Error',
        message: 'Could not sync with Consulting API. Displaying localized advisory cache.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await consultingService.createService({
        serviceCode,
        name: serviceName,
        billingModel: serviceModel,
        startingPrice: parseFloat(servicePrice),
        currency: 'INR',
        description: serviceDesc,
        status: 'ACTIVE'
      });

      addNotification?.({
        type: 'success',
        title: 'Service Catalog Updated',
        message: `${serviceName} published to consulting offerings.`
      });
      setShowAddServiceModal(false);
      loadData();
    } catch (err) {
      addNotification?.({
        type: 'error',
        title: 'Error',
        message: err.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateConsultant = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await consultingService.createConsultant({
        displayName: consName,
        title: consTitle,
        specializations: consSpecs.split(',').map((s) => s.trim()),
        yearsOfExperience: parseInt(consExp, 10),
        ratePerHour: parseFloat(consRate),
        status: 'ACTIVE'
      });

      addNotification?.({
        type: 'success',
        title: 'Consultant Profile Created',
        message: `${consName} joined the practice roster.`
      });
      setShowAddConsultantModal(false);
      loadData();
    } catch (err) {
      addNotification?.({
        type: 'error',
        title: 'Error',
        message: err.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await consultingService.createLead({
        companyName: leadCompany,
        contactName: leadContact,
        email: leadEmail,
        phone: leadPhone,
        serviceInterest: leadService,
        budgetRange: leadBudget,
        stage: 'NEW',
        source: 'WEBSITE_CONSULTATION'
      });

      addNotification?.({
        type: 'success',
        title: 'Prospect Logged',
        message: `${leadCompany} added to lead pipeline.`
      });
      setShowAddLeadModal(false);
      loadData();
    } catch (err) {
      addNotification?.({
        type: 'error',
        title: 'Error',
        message: err.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendProposal = async (propId) => {
    try {
      await consultingService.sendProposal(propId);
      addNotification?.({
        type: 'success',
        title: 'Proposal Dispatched',
        message: `Proposal ${propId} sent to client executive team.`
      });
      loadData();
    } catch (err) {
      addNotification?.({
        type: 'error',
        title: 'Dispatch Failed',
        message: err.message
      });
    }
  };

  const handleAcceptProposal = async (propId) => {
    try {
      await consultingService.acceptProposal(propId);
      addNotification?.({
        type: 'success',
        title: 'Proposal Accepted & Engagement Created',
        message: `Client authorized proposal ${propId}. Engagement milestone active.`
      });
      loadData();
    } catch (err) {
      addNotification?.({
        type: 'error',
        title: 'Error',
        message: err.message
      });
    }
  };

  const handleSimulateAgent = () => {
    setIsTestingAgent(true);
    setTestResult(null);
    setTimeout(() => {
      setIsTestingAgent(false);
      setTestResult({
        status: 'QUALIFIED',
        score: 94,
        organizationProfile: {
          client: 'PayPulse Technologies (Fintech / 80 Engineers)',
          coreChallenge: 'Accelerated Datacenter-to-AWS Migration (SOC-2 Compliance Requirement)',
          budgetMatch: '₹15L - ₹20L (Fits Enterprise Fixed-Fee Roadmap Model)',
          timelineMatch: '6 Months (High urgency)'
        },
        recommendedPracticeService: 'CSVC-001 (IT Strategy & Cloud Migration Consulting)',
        assignedPracticeLead: 'Karthik Subramanian (Principal Cloud Strategist)',
        automatedNextAction: 'Calendar slot reserved for 30-min Discovery Call via Google Meet with Karthik Subramanian.',
        aiResponse: 'Thank you for contacting Zenith Strategic Advisory. Given your 6-month migration horizon and fintech compliance parameters, our Principal Cloud Strategist Karthik Subramanian can assist you in architecting the Landing Zone, IAM policies, and VPC peering. I have scheduled a preliminary 30-minute discovery call for your team.'
      });
    }, 900);
  };

  const formatINR = (val) => {
    if (val === undefined || val === null) return '₹0';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 border border-slate-800 p-6 shadow-xl text-white">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="p-2.5 rounded-xl bg-teal-500/20 border border-teal-400/30 text-teal-400">
                <Briefcase className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  {settings?.companyName || 'Zenith Strategic & Management Advisory'}
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    Consulting Practice Admin
                  </span>
                </h1>
                <p className="text-sm text-slate-400">
                  Default Currency: {settings?.defaultCurrency || 'INR'} • Standard Validity: {settings?.standardProposalValidityDays || 14} Days
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 transition"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Practice
            </button>
            <button
              onClick={() => setShowAddServiceModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-600/30 transition"
            >
              <Plus className="w-4 h-4" />
              Add Advisory Service
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'services', label: 'Service Catalog', icon: Layers },
          { id: 'consultants', label: 'Consultants Roster', icon: Users },
          { id: 'leads', label: 'Prospects & RFPs', icon: Target },
          { id: 'accounts', label: 'Client Accounts', icon: Building2 },
          { id: 'appointments', label: 'Discovery Calls', icon: Calendar },
          { id: 'proposals', label: 'Proposals', icon: FileCheck2 },
          { id: 'engagements', label: 'Engagements', icon: Award },
          { id: 'projects', label: 'Projects & Milestones', icon: FolderGit2 },
          { id: 'ai_agents', label: 'AI Lead Agent', icon: Bot },
          { id: 'reports', label: 'Practice Revenue', icon: TrendingUp }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition whitespace-nowrap ${
                isActive
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* 1. OVERVIEW TAB */}
      {/* ========================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  New Advisory Leads
                </span>
                <span className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                  <Target className="w-5 h-5" />
                </span>
              </div>
              <p className="text-2xl font-bold mt-2 text-slate-900 dark:text-white">
                {dashboard?.metrics?.newLeads || leads.length}
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> {dashboard?.metrics?.qualifiedLeads || 48} Qualified
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Discovery Calls
                </span>
                <span className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Calendar className="w-5 h-5" />
                </span>
              </div>
              <p className="text-2xl font-bold mt-2 text-slate-900 dark:text-white">
                {dashboard?.metrics?.discoveryCallsScheduled || appointments.length}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Scheduled this month
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Proposal Pipeline
                </span>
                <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <FileCheck2 className="w-5 h-5" />
                </span>
              </div>
              <p className="text-2xl font-bold mt-2 text-slate-900 dark:text-white">
                {formatINR(dashboard?.sales?.proposalValue || 3200000)}
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                {formatINR(dashboard?.sales?.acceptedProposalValue || 1450000)} Accepted
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  AI Lead Capture
                </span>
                <span className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <Bot className="w-5 h-5" />
                </span>
              </div>
              <p className="text-2xl font-bold mt-2 text-slate-900 dark:text-white">
                {dashboard?.ai?.qualifiedLeadsCaptured || 82}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Out of {dashboard?.ai?.totalConversations || 390} chats
              </p>
            </div>
          </div>

          {/* Active Projects & Engagements Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <FolderGit2 className="w-5 h-5 text-teal-500" />
                  Active Strategic Engagements & Deliverables
                </h3>
                <button
                  onClick={() => setActiveTab('engagements')}
                  className="text-xs text-teal-600 hover:text-teal-500 font-medium"
                >
                  View All Engagements →
                </button>
              </div>
              <div className="space-y-4">
                {engagements.map((eng) => (
                  <div key={eng.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{eng.name}</h4>
                      <StatusBadge status={eng.status} />
                    </div>
                    <p className="text-xs text-slate-500">
                      Lead Consultant: <strong>{eng.projectManager || 'Karthik Subramanian'}</strong> • Timeline: {eng.startDate} to {eng.targetEndDate}
                    </p>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                      <span>Proposal: <strong>{eng.proposalId}</strong></span>
                      <span className="font-semibold text-teal-600 dark:text-teal-400">Fixed-Fee Retainer</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                Upcoming Discovery Appointments
              </h3>
              <div className="space-y-3">
                {appointments.slice(0, 3).map((app) => (
                  <div key={app.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                      <span>{app.clientName}</span>
                      <StatusBadge status={app.status} />
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                      <Video className="w-3.5 h-3.5 text-blue-500" />
                      {new Date(app.startAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">With: {app.consultantName}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setActiveTab('appointments')}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 hover:bg-teal-100 transition"
              >
                Open Discovery Calendar →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. SERVICES CATALOG TAB */}
      {/* ========================================================= */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Consulting Practice Service Catalog</h2>
              <p className="text-sm text-slate-500">Service descriptions, billing models (Fixed Fee, T&M), and baseline engagement fees</p>
            </div>
            <button
              onClick={() => setShowAddServiceModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-teal-600 hover:bg-teal-500 text-white shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              Add Service
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((svc) => (
              <div
                key={svc.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400">
                      {svc.serviceCode}
                    </span>
                    <StatusBadge status={svc.status || 'ACTIVE'} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{svc.name}</h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{svc.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                    Model: {svc.billingModel}
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    Starts from {formatINR(svc.startingPrice)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. CONSULTANTS ROSTER TAB */}
      {/* ========================================================= */}
      {activeTab === 'consultants' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Senior Advisory & Partner Roster</h2>
              <p className="text-sm text-slate-500">Domain expertise, years of experience, and billing billable rates</p>
            </div>
            <button
              onClick={() => setShowAddConsultantModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-teal-600 hover:bg-teal-500 text-white shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              Add Consultant Profile
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {consultants.map((cons) => (
              <div
                key={cons.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {cons.id}
                  </span>
                  <StatusBadge status={cons.status || 'ACTIVE'} />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{cons.displayName}</h3>
                <p className="text-xs text-teal-600 dark:text-teal-400 font-medium mt-0.5">{cons.title}</p>
                <p className="text-xs text-slate-500 mt-2">
                  Experience: <strong>{cons.yearsOfExperience} Years</strong> • Billable Rate: <strong>{formatINR(cons.ratePerHour)}/hr</strong>
                </p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {cons.specializations?.map((spec, i) => (
                    <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. PROSPECTS & LEADS TAB */}
      {/* ========================================================= */}
      {activeTab === 'leads' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Advisory Leads & Prospects</h2>
              <p className="text-sm text-slate-500">Inbound discovery requests and qualified consulting prospects</p>
            </div>
            <button
              onClick={() => setShowAddLeadModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-teal-600 hover:bg-teal-500 text-white shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              New Prospect
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-800/50 text-slate-500">
                <tr>
                  <th className="px-4 py-3.5">Lead ID</th>
                  <th className="px-4 py-3.5">Company Name</th>
                  <th className="px-4 py-3.5">Key Contact</th>
                  <th className="px-4 py-3.5">Service Interest</th>
                  <th className="px-4 py-3.5">Budget Range</th>
                  <th className="px-4 py-3.5">Assigned Consultant</th>
                  <th className="px-4 py-3.5">Stage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {leads.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3.5 font-mono font-semibold text-slate-900 dark:text-white">{l.id}</td>
                    <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">{l.companyName}</td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                      <div>{l.contactName}</div>
                      <div className="text-xs text-slate-400">{l.email}</div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300 font-medium">{l.serviceInterest}</td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400 font-semibold">{l.budgetRange}</td>
                    <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300">{l.assignedConsultant || 'Unassigned'}</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={l.stage} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. CLIENT ACCOUNTS TAB */}
      {/* ========================================================= */}
      {activeTab === 'accounts' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Client Accounts & Enterprises</h2>
              <p className="text-sm text-slate-500">Retained corporate relationships and advisory contracts</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {acc.id}
                  </span>
                  <StatusBadge status={acc.status} />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{acc.companyName}</h3>
                <p className="text-xs text-slate-500 mt-1">Industry: <strong className="text-slate-700 dark:text-slate-300">{acc.industry}</strong></p>
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 space-y-1">
                  <p>Primary Contact: <strong>{acc.primaryContact}</strong></p>
                  <p>Email: <strong>{acc.email}</strong> • Phone: <strong>{acc.phone}</strong></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. DISCOVERY CALL APPOINTMENTS TAB */}
      {/* ========================================================= */}
      {activeTab === 'appointments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Discovery Call Appointments</h2>
              <p className="text-sm text-slate-500">Consultation sessions, requirements scoping, and calendar sync</p>
            </div>
          </div>

          <div className="space-y-4">
            {appointments.map((app) => (
              <div
                key={app.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {app.id}
                    </span>
                    <StatusBadge status={app.status} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{app.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Client: <strong className="text-slate-700 dark:text-slate-300">{app.clientName}</strong> • Consultant: <strong className="text-slate-700 dark:text-slate-300">{app.consultantName}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
                    <div className="text-slate-400">Scheduled Date & Time:</div>
                    <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                      {new Date(app.startAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. PROPOSALS TAB */}
      {/* ========================================================= */}
      {activeTab === 'proposals' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Consulting Proposals</h2>
              <p className="text-sm text-slate-500">Formal scope of work, deliverables, advisory fees, and validity</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {proposals.map((prop) => (
              <div
                key={prop.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {prop.proposalNumber}
                    </span>
                    <StatusBadge status={prop.status} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{prop.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">Client: <span className="font-semibold text-slate-800 dark:text-slate-200">{prop.clientName}</span></p>
                  
                  <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">Professional Advisory Fee:</span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">{formatINR(prop.fee)}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Duration: {prop.estimatedDurationWeeks} Weeks • Valid until: {prop.validUntil}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                  {prop.status === 'DRAFT' && (
                    <button
                      onClick={() => handleSendProposal(prop.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white"
                    >
                      <Send className="w-3.5 h-3.5" /> Dispatch Proposal
                    </button>
                  )}
                  {prop.status === 'SENT' && (
                    <button
                      onClick={() => handleAcceptProposal(prop.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
                    >
                      <Check className="w-3.5 h-3.5" /> Client Authorized
                    </button>
                  )}
                  {prop.status === 'ACCEPTED' && (
                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Engagement Active
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 8. ENGAGEMENTS & PROJECTS TAB */}
      {/* ========================================================= */}
      {(activeTab === 'engagements' || activeTab === 'projects') && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Client Engagements & Project Milestones</h2>
              <p className="text-sm text-slate-500">Execution roadmap, deliverables tracking, and project status</p>
            </div>
          </div>

          <div className="space-y-4">
            {projects.map((prj) => (
              <div
                key={prj.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {prj.id}
                    </span>
                    <span className="text-xs text-slate-400">Client: {prj.clientName}</span>
                  </div>
                  <StatusBadge status={prj.status} />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{prj.name}</h3>

                {/* Milestones Checklist */}
                {prj.milestones && prj.milestones.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Project Milestones</p>
                    <div className="space-y-2">
                      {prj.milestones.map((m, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-xs">
                          <span className="font-medium text-slate-800 dark:text-slate-200">{m.title}</span>
                          <span className={`px-2 py-0.5 rounded-full font-semibold ${
                            m.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                          }`}>
                            {m.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 9. AI LEAD QUALIFICATION AGENT SIMULATOR */}
      {/* ========================================================= */}
      {activeTab === 'ai_agents' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Bot className="w-5 h-5 text-teal-500" />
                  Zenelait Consulting AI Lead Qualification Agent
                </h2>
                <p className="text-sm text-slate-500">
                  Simulate prospect discovery, budget qualification, BANT scoring, and automatic calendar booking.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Simulated Inbound Prospect Message
                </label>
                <textarea
                  rows={3}
                  value={testQuestion}
                  onChange={(e) => setTestQuestion(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                  placeholder="Enter prospect discovery prompt..."
                />
              </div>

              <button
                onClick={handleSimulateAgent}
                disabled={isTestingAgent}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-teal-600 hover:bg-teal-500 text-white shadow-md shadow-teal-600/20 transition"
              >
                <Sparkles className={`w-4 h-4 ${isTestingAgent ? 'animate-spin' : ''}`} />
                {isTestingAgent ? 'Analyzing Business Intent...' : 'Test AI Qualification Agent'}
              </button>
            </div>

            {testResult && (
              <div className="mt-6 p-5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/60 pb-3">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> BANT Lead Qualified (Score: {testResult.score}/100)
                  </span>
                  <span className="text-xs text-slate-400">Agent: Zenelait Consulting AI</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Identified Need:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{testResult.organizationProfile.coreChallenge}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Budget Viability:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400">{testResult.organizationProfile.budgetMatch}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Matched Service:</span>
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{testResult.recommendedPracticeService}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Assigned Practice Lead:</span>
                    <span className="text-teal-600 dark:text-teal-400 font-semibold">{testResult.assignedPracticeLead}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Auto-Dispatched Discovery Response:
                  </span>
                  <p className="text-sm text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800">
                    "{testResult.aiResponse}"
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 10. PRACTICE REVENUE REPORTS TAB */}
      {/* ========================================================= */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Consulting Practice Sales & Realization</h2>
            <p className="text-sm text-slate-500 mb-6">Proposal acceptance rate, billable realization, and practice performance</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-400">Total Proposals Dispatched</span>
                <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">₹32,00,000</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-400">Signed Engagement Revenue</span>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">₹14,50,000</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-400">Discovery-to-Proposal Rate</span>
                <p className="text-xl font-bold text-teal-600 dark:text-teal-400 mt-1">73.3%</p>
              </div>
            </div>

            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">Top Advisory Practices by Revenue</h3>
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Cloud Architecture & Migration Advisory</h4>
                  <p className="text-xs text-slate-500">Active Retainers: 4 • Average Project Fee: ₹1,20,000</p>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">₹4,80,000</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Business Process Optimization & ERP Alignment</h4>
                  <p className="text-xs text-slate-500">Active Retainers: 2 • Average Project Fee: ₹3,50,000</p>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">₹7,00,000</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD ADVISORY SERVICE */}
      {/* ========================================================= */}
      <FormDialog
        isOpen={showAddServiceModal}
        onClose={() => setShowAddServiceModal(false)}
        title="Add Consulting Service"
        onSubmit={handleCreateService}
        isSubmitting={isSubmitting}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Service Code</label>
              <input
                type="text"
                required
                value={serviceCode}
                onChange={(e) => setServiceCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Billing Model</label>
              <select
                value={serviceModel}
                onChange={(e) => setServiceModel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              >
                <option value="FIXED_FEE">Fixed Fee Project</option>
                <option value="TIME_AND_MATERIALS">Time & Materials (Hourly)</option>
                <option value="MONTHLY_RETAINER">Monthly Advisory Retainer</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Service Title</label>
            <input
              type="text"
              required
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Starting Baseline Fee (₹)</label>
            <input
              type="number"
              required
              value={servicePrice}
              onChange={(e) => setServicePrice(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Scope & Methodology Description</label>
            <textarea
              rows={3}
              value={serviceDesc}
              onChange={(e) => setServiceDesc(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            />
          </div>
        </div>
      </FormDialog>

      {/* ========================================================= */}
      {/* MODAL: ADD CONSULTANT PROFILE */}
      {/* ========================================================= */}
      <FormDialog
        isOpen={showAddConsultantModal}
        onClose={() => setShowAddConsultantModal(false)}
        title="Add Consultant to Practice"
        onSubmit={handleCreateConsultant}
        isSubmitting={isSubmitting}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Consultant Display Name</label>
            <input
              type="text"
              required
              value={consName}
              onChange={(e) => setConsName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Professional Title</label>
            <input
              type="text"
              required
              value={consTitle}
              onChange={(e) => setConsTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Experience (Years)</label>
              <input
                type="number"
                required
                value={consExp}
                onChange={(e) => setConsExp(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Rate / Hour (₹)</label>
              <input
                type="number"
                required
                value={consRate}
                onChange={(e) => setConsRate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Specializations (Comma separated)</label>
            <input
              type="text"
              value={consSpecs}
              onChange={(e) => setConsSpecs(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            />
          </div>
        </div>
      </FormDialog>

      {/* ========================================================= */}
      {/* MODAL: ADD LEAD */}
      {/* ========================================================= */}
      <FormDialog
        isOpen={showAddLeadModal}
        onClose={() => setShowAddLeadModal(false)}
        title="Create Advisory Prospect"
        onSubmit={handleCreateLead}
        isSubmitting={isSubmitting}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Company / Organization</label>
            <input
              type="text"
              required
              value={leadCompany}
              onChange={(e) => setLeadCompany(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Contact Name</label>
              <input
                type="text"
                required
                value={leadContact}
                onChange={(e) => setLeadContact(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Budget Range</label>
              <input
                type="text"
                value={leadBudget}
                onChange={(e) => setLeadBudget(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Email</label>
              <input
                type="email"
                required
                value={leadEmail}
                onChange={(e) => setLeadEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Phone</label>
              <input
                type="text"
                required
                value={leadPhone}
                onChange={(e) => setLeadPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              />
            </div>
          </div>
        </div>
      </FormDialog>
    </div>
  );
}
