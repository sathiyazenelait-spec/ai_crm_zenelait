import React, { useState, useEffect } from 'react';
import { useCRM } from '../../context/CRMContext';
import { api } from '../../services/api';
import {
  Zap,
  GitFork,
  Layers,
  Clock,
  TrendingUp,
  Settings,
  Play,
  Pause,
  Plus,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Search,
  Filter,
  ArrowRight,
  ArrowDown,
  UserCheck,
  Send,
  Calendar,
  Shield,
  Sliders,
  Building,
  Terminal,
  FileText,
  Mail,
  MessageSquare,
  Bot,
  ExternalLink,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Eye,
  Trash2,
  Copy,
  Edit3,
  Flame,
  Check,
  HelpCircle,
  Database
} from 'lucide-react';

export function AutomationCenter({ initialTab = 'my-automations' }) {
  const {
    leads,
    addLead,
    addTask,
    addNotification,
    currentRolePermissions,
    currentUserRole
  } = useCRM();

  // Navigation tab inside Automation Center
  const [activeTab, setActiveTab] = useState(initialTab);

  // Default seeded workflows
  const [workflows, setWorkflows] = useState([
    {
      id: 'WF-IT-1001',
      name: 'IT_HOT_LEAD_AUTO_ASSIGN',
      subtitle: 'Route high-intent HRMS leads to product specialist and send instant welcome calendar invite',
      status: 'ACTIVE',
      published: true,
      publishedAt: '2026-10-12T18:00:00+05:30',
      category: 'Lead Inbound & Routing',
      tag: 'Growth',
      runsCount: 122,
      successRate: '100%',
      p50Runtime: '142ms',
      p95Runtime: '280ms',
      trigger: {
        event: 'LEAD_CREATED',
        label: 'When a new lead is created',
        source: 'Website Chat / Contact Form / WhatsApp / API'
      },
      conditions: [
        { field: 'productInterest', operator: 'EQUALS', value: 'HRMS' },
        { field: 'leadScore', operator: 'GREATER_THAN_OR_EQUAL', value: 75 }
      ],
      steps: [
        {
          id: 'step-1',
          category: 'TRIGGER',
          label: 'TRIGGER',
          title: 'When a new lead is created',
          desc: 'Captured via IT Company Website, Chatbot, or LinkedIn form',
          icon: Zap,
          color: '#6366f1',
          bg: '#e0e7ff',
          badge: 'Inbound Event'
        },
        {
          id: 'step-2',
          category: 'CONDITION',
          label: 'CONDITION',
          title: 'If Product Interest is HRMS and Lead Score ≥ 75',
          desc: 'lead.productInterest == "HRMS" && lead.score >= 75',
          icon: Sliders,
          color: '#f59e0b',
          bg: '#fef3c7',
          badge: 'Qualification Gate'
        },
        {
          id: 'step-3',
          category: 'ACTION',
          label: 'ACTION',
          title: 'Assign by territory & skill',
          desc: 'team=AE - HRMS Specialist (Rahul Kumar) · strategy=round_robin',
          icon: UserCheck,
          color: '#10b981',
          bg: '#d1fae5',
          badge: 'Routing Rule'
        },
        {
          id: 'step-4',
          category: 'WAIT',
          label: 'WAIT',
          title: 'Wait 1h',
          desc: 'Buffer window for lead to open scheduling link before follow-up',
          icon: Clock,
          color: '#64748b',
          bg: '#f1f5f9',
          badge: 'Time Delay'
        },
        {
          id: 'step-5',
          category: 'ACTION',
          label: 'ACTION',
          title: 'Send welcome & demo calendar email',
          desc: 'template=Welcome - HRMS Enterprise Demo · sender=rahul@abctech.com',
          icon: Mail,
          color: '#06b6d4',
          bg: '#cffafe',
          badge: 'Outbound Email'
        },
        {
          id: 'step-6',
          category: 'ACTION',
          label: 'ACTION',
          title: 'Create follow-up task & notify manager',
          desc: 'priority=HIGH · task="Contact qualified HRMS lead within 15 mins" · notify=Sales Manager',
          icon: Send,
          color: '#ec4899',
          bg: '#fce7f3',
          badge: 'SLA Alert'
        }
      ]
    },
    {
      id: 'WF-IT-1002',
      name: 'IT_DEMO_BOOKING_AND_REMINDER',
      subtitle: 'Sync salesperson calendar, generate Google Meet link, and dispatch 24h & 1h WhatsApp reminders',
      status: 'ACTIVE',
      published: true,
      publishedAt: '2026-10-10T14:30:00+05:30',
      category: 'Demo Scheduling',
      tag: 'Productivity',
      runsCount: 78,
      successRate: '98.7%',
      p50Runtime: '165ms',
      p95Runtime: '295ms',
      trigger: {
        event: 'DEMO_REQUESTED',
        label: 'When prospect requests a software demo',
        source: 'Calendly / Website booking widget'
      },
      conditions: [
        { field: 'stage', operator: 'EQUALS', value: 'QUALIFIED' }
      ],
      steps: [
        {
          id: 'step-d1',
          category: 'TRIGGER',
          label: 'TRIGGER',
          title: 'When prospect requests a demo',
          desc: 'Submitted date & preferred slot via interactive scheduler',
          icon: Calendar,
          color: '#6366f1',
          bg: '#e0e7ff',
          badge: 'Demo Request'
        },
        {
          id: 'step-d2',
          category: 'ACTION',
          label: 'ACTION',
          title: 'Check AE availability & lock Google Meet slot',
          desc: 'Calendar sync with host=Rahul Kumar (Sales Manager)',
          icon: UserCheck,
          color: '#10b981',
          bg: '#d1fae5',
          badge: 'Meeting Created'
        },
        {
          id: 'step-d3',
          category: 'ACTION',
          label: 'ACTION',
          title: 'Dispatch 24h & 1h WhatsApp & Email Reminders',
          desc: 'Includes calendar invite (.ics) & direct Google Meet video link',
          icon: Mail,
          color: '#06b6d4',
          bg: '#cffafe',
          badge: 'No-Show Prevention'
        }
      ]
    },
    {
      id: 'WF-IT-1003',
      name: 'IT_PROPOSAL_FOLLOWUP_SEQUENCE',
      subtitle: 'Automatically nudge prospect 3 business days after quotation sent if still unviewed or unaccepted',
      status: 'ACTIVE',
      published: true,
      publishedAt: '2026-10-08T11:15:00+05:30',
      category: 'Deals & Proposals',
      tag: 'Revenue',
      runsCount: 45,
      successRate: '100%',
      p50Runtime: '118ms',
      p95Runtime: '210ms',
      trigger: {
        event: 'PROPOSAL_UNANSWERED_3D',
        label: 'When proposal remains unanswered for 72h',
        source: 'Quote Tracker'
      },
      conditions: [
        { field: 'stage', operator: 'EQUALS', value: 'PROPOSAL' }
      ],
      steps: [
        {
          id: 'step-p1',
          category: 'TRIGGER',
          label: 'TRIGGER',
          title: 'Proposal unanswered for 3 days',
          desc: 'Monitors proposal sent timestamp vs client response',
          icon: Clock,
          color: '#6366f1',
          bg: '#e0e7ff',
          badge: 'Deal Stagnation'
        },
        {
          id: 'step-p2',
          category: 'ACTION',
          label: 'ACTION',
          title: 'Send polite proposal follow-up email',
          desc: 'template=Proposal Evaluation Check-in · offers Q&A call',
          icon: Mail,
          color: '#06b6d4',
          bg: '#cffafe',
          badge: 'Auto Email'
        },
        {
          id: 'step-p3',
          category: 'ACTION',
          label: 'ACTION',
          title: 'Create high-priority phone call task for Account Exec',
          desc: 'dueDate=Today · SLA=Call decision maker to resolve blockers',
          icon: Send,
          color: '#ec4899',
          bg: '#fce7f3',
          badge: 'Human Task'
        }
      ]
    },
    {
      id: 'WF-IT-1004',
      name: 'IT_STALE_DEAL_SLA_ALERT',
      subtitle: 'Alert Sales Manager when an active enterprise deal has had no rep activity for over 7 days',
      status: 'PAUSED',
      published: true,
      publishedAt: '2026-10-05T09:00:00+05:30',
      category: 'Alerts & SLA',
      tag: 'Compliance',
      runsCount: 19,
      successRate: '100%',
      p50Runtime: '98ms',
      p95Runtime: '175ms',
      trigger: {
        event: 'DEAL_INACTIVE_7D',
        label: 'When deal has no activity for 7 days',
        source: 'CRM Activity Auditor'
      },
      conditions: [
        { field: 'dealValue', operator: 'GREATER_THAN', value: 100000 }
      ],
      steps: [
        {
          id: 'step-s1',
          category: 'TRIGGER',
          label: 'TRIGGER',
          title: 'Deal inactive for 7 consecutive days',
          desc: 'No calls, emails, notes or stage updates recorded',
          icon: AlertTriangle,
          color: '#f59e0b',
          bg: '#fef3c7',
          badge: 'SLA Breach'
        },
        {
          id: 'step-s2',
          category: 'ACTION',
          label: 'ACTION',
          title: 'Escalate to Sales Manager Dashboard & Push Alert',
          desc: 'Highlights risk of losing account to competitor',
          icon: Send,
          color: '#ec4899',
          bg: '#fce7f3',
          badge: 'Manager Alert'
        }
      ]
    }
  ]);

  // Current workflow in builder
  const [editingWorkflow, setEditingWorkflow] = useState(workflows[0]);

  // All 25 IT Sales Manager Automations (from specification)
  const IT_TEMPLATES = [
    { id: 1, name: 'Lead capture', trigger: 'New website enquiry', action: 'Create CRM lead, detect duplicates, notify sales team', category: 'Lead Inbound & Routing', icon: Zap },
    { id: 2, name: 'Duplicate detection', trigger: 'New lead arrives', action: 'Match existing records by email & phone for review or merge', category: 'Lead Inbound & Routing', icon: Search },
    { id: 3, name: 'AI qualification', trigger: 'Lead created', action: 'Ask qualifying questions on team size, budget & tech stack', category: 'AI Qualification', icon: Bot },
    { id: 4, name: 'Lead scoring', trigger: 'Lead data changes', action: 'Recalculate dynamic fit score (0-100) and categorize Hot/Warm/Cold', category: 'AI Qualification', icon: Flame },
    { id: 5, name: 'Lead assignment', trigger: 'Qualified lead', action: 'HRMS enquiries → HRMS specialist; ERP enquiries → ERP specialist', category: 'Lead Inbound & Routing', icon: UserCheck },
    { id: 6, name: 'SLA alert', trigger: 'Lead remains untouched 15m', action: 'Notify lead owner and escalate to Sales Manager', category: 'Alerts & SLA', icon: AlertTriangle },
    { id: 7, name: 'Demo scheduling', trigger: 'Prospect requests demo', action: 'Offer available calendar slots matching salesperson availability', category: 'Demo Scheduling', icon: Calendar },
    { id: 8, name: 'Demo reminder', trigger: '24h & 1h before meeting', action: 'Send configured WhatsApp & Email reminder with video conference link', category: 'Demo Scheduling', icon: Clock },
    { id: 9, name: 'No-show recovery', trigger: 'Demo marked missed', action: 'Offer frictionless 1-click rescheduling sequence', category: 'Demo Scheduling', icon: RotateCcw },
    { id: 10, name: 'Proposal creation', trigger: 'Opportunity reaches proposal stage', action: 'Prepare draft proposal from approved software packages and pricing', category: 'Deals & Proposals', icon: FileText },
    { id: 11, name: 'Discount approval', trigger: 'Discount exceeds 15%', action: 'Route proposal to Sales Manager for approval gate before sending', category: 'Approvals & Governance', icon: Shield },
    { id: 12, name: 'Proposal follow-up', trigger: 'Proposal remains unanswered 3d', action: 'Schedule permitted follow-up email and phone task for rep', category: 'Deals & Proposals', icon: Mail },
    { id: 13, name: 'Deal-stage update', trigger: 'Valid milestone occurs', action: 'Update pipeline stage after human confirmation', category: 'Deals & Proposals', icon: CheckCircle2 },
    { id: 14, name: 'Stale-deal alert', trigger: 'No activity for 7 days', action: 'Notify salesperson and suggest re-engagement battlecards', category: 'Alerts & SLA', icon: Clock },
    { id: 15, name: 'Competitor tracking', trigger: 'Salesperson records competitor', action: 'Update opportunity analysis & surface competitive battlecard', category: 'Intelligence', icon: Sparkles },
    { id: 16, name: 'Renewal reminder', trigger: 'Contract renewal approaches (60d)', action: 'Create renewal task and check upsell potential', category: 'Retention & CS', icon: RefreshCw },
    { id: 17, name: 'Upsell opportunity', trigger: 'Customer reaches 80% usage threshold', action: 'Create suggested expansion deal for account executive', category: 'Retention & CS', icon: TrendingUp },
    { id: 18, name: 'Customer handover', trigger: 'Deal becomes WON', action: 'Notify implementation team & schedule customer success kickoff', category: 'Retention & CS', icon: Building },
    { id: 19, name: 'Sales forecast', trigger: 'Opportunity stage changes', action: 'Recalculate weighted pipeline forecast dynamically', category: 'Analytics & Forecasting', icon: TrendingUp },
    { id: 20, name: 'Performance report', trigger: 'Weekly schedule (Monday 9 AM)', action: 'Send team sales performance summary to Sales Manager', category: 'Analytics & Forecasting', icon: FileText },
    { id: 21, name: 'Knowledge gap detection', trigger: 'AI cannot answer technical query', action: 'Log unanswered question for solution architect review', category: 'AI Learning', icon: HelpCircle },
    { id: 22, name: 'Human handover', trigger: 'AI needs assistance / Frustration', action: 'Route conversation with full context to active sales rep', category: 'AI Assistance', icon: UserCheck },
    { id: 23, name: 'Failed integration alert', trigger: 'Email/calendar action fails', action: 'Retry safely with exponential backoff; notify admin if unresolved', category: 'Resilience & Integrations', icon: AlertTriangle },
    { id: 24, name: 'Lead re-engagement', trigger: 'Eligible dormant lead (>30 days)', action: 'Start approved product feature re-engagement sequence', category: 'Retention & CS', icon: Mail },
    { id: 25, name: 'Workflow audit', trigger: 'Any automation executes', action: 'Record trigger, conditions, action outcome, and errors in immutable audit log', category: 'Auditing & Governance', icon: Database }
  ];

  // Execution History state
  const [historyRuns, setHistoryRuns] = useState([
    {
      runId: 'RUN-10001',
      workflowId: 'WF-IT-1001',
      workflowName: 'IT_HOT_LEAD_AUTO_ASSIGN',
      trigger: 'LEAD_CREATED',
      recordType: 'LEAD',
      recordId: 'LEAD-5001',
      recordName: 'Rajesh Sharma · TechCorp',
      mode: 'AUTOMATIC',
      status: 'SUCCESS',
      durationMs: 142,
      executedAt: '6/29/2026, 2:52:19 PM',
      stepsCount: 5,
      actionsSummary: 'Priority set to HIGH, Assigned to Rahul Kumar, Follow-up task #TSK-892 created, Manager notified'
    },
    {
      runId: 'RUN-10002',
      workflowId: 'WF-IT-1001',
      workflowName: 'IT_HOT_LEAD_AUTO_ASSIGN',
      trigger: 'LEAD_CREATED',
      recordType: 'LEAD',
      recordId: 'LEAD-5002',
      recordName: 'Priya Narang · Global Systems',
      mode: 'AUTOMATIC',
      status: 'SUCCESS',
      durationMs: 158,
      executedAt: '6/29/2026, 2:52:18 PM',
      stepsCount: 5,
      actionsSummary: 'Priority set to HIGH, Assigned to Rahul Kumar, Welcome email dispatched'
    },
    {
      runId: 'RUN-10003',
      workflowId: 'WF-IT-1002',
      workflowName: 'IT_DEMO_BOOKING_AND_REMINDER',
      trigger: 'DEMO_REQUESTED',
      recordType: 'LEAD',
      recordId: 'LEAD-4890',
      recordName: 'Vikram Mehta · Apex Cloud',
      mode: 'MANUAL',
      status: 'SUCCESS',
      durationMs: 210,
      executedAt: '6/29/2026, 2:51:10 PM',
      stepsCount: 3,
      actionsSummary: 'Google Meet link generated, 24h & 1h reminders scheduled'
    },
    {
      runId: 'RUN-10004',
      workflowId: 'WF-IT-1003',
      workflowName: 'IT_PROPOSAL_FOLLOWUP_SEQUENCE',
      trigger: 'PROPOSAL_UNANSWERED_3D',
      recordType: 'OPPORTUNITY',
      recordId: 'OPP-102',
      recordName: 'CloudTech Software Quote #Q-882',
      mode: 'AUTOMATIC',
      status: 'SUCCESS',
      durationMs: 115,
      executedAt: '6/29/2026, 2:48:05 PM',
      stepsCount: 3,
      actionsSummary: 'Proposal nudge email sent, phone task assigned to AE'
    },
    {
      runId: 'RUN-10005',
      workflowId: 'WF-IT-1001',
      workflowName: 'IT_HOT_LEAD_AUTO_ASSIGN',
      trigger: 'LEAD_CREATED',
      recordType: 'LEAD',
      recordId: 'LEAD-4998',
      recordName: 'Anand Verma · FinServ Ltd',
      mode: 'DRY_RUN',
      status: 'SUCCESS',
      durationMs: 96,
      executedAt: '6/29/2026, 2:40:22 PM',
      stepsCount: 5,
      actionsSummary: 'Simulated dry-run test: All conditions satisfied, zero live records mutated'
    }
  ]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState('ALL');

  // Dry run preview state
  const [previewLead, setPreviewLead] = useState('Jordan Reed · Northwind Trading (HRMS, Score 88)');
  const [isDryRunning, setIsDryRunning] = useState(false);
  const [dryRunCompleted, setDryRunCompleted] = useState(true);
  const [dryRunProgressStep, setDryRunProgressStep] = useState(5);

  // Modals state
  const [showRunNowModal, setShowRunNowModal] = useState(false);
  const [targetWorkflowForRun, setTargetWorkflowForRun] = useState(workflows[0]);
  const [selectedLeadIdForRun, setSelectedLeadIdForRun] = useState('LEAD-5001');
  const [dryRunToggle, setDryRunToggle] = useState(false);
  const [isExecutingRunNow, setIsExecutingRunNow] = useState(false);

  // Automatic Trigger Simulator modal
  const [showAutoTriggerModal, setShowAutoTriggerModal] = useState(false);
  const [simulatedLead, setSimulatedLead] = useState({
    leadId: 'LEAD-5001',
    productInterest: 'HRMS',
    leadScore: 88,
    stage: 'NEW',
    company: 'Alpha Infotech Ltd',
    contactName: 'Sanjay Dutt'
  });
  const [autoSimulationProgress, setAutoSimulationProgress] = useState(null); // 'trigger' | 'condition' | 'actions' | 'complete'

  // Selected Run Detail Drawer
  const [selectedRunDetail, setSelectedRunDetail] = useState(null);

  // Filtered workflows
  const filteredWorkflows = workflows.filter((w) => {
    const matchesSearch = w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || w.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered templates
  const templateCategories = ['ALL', 'Lead Inbound & Routing', 'AI Qualification', 'Demo Scheduling', 'Deals & Proposals', 'Alerts & SLA', 'Retention & CS'];
  const filteredTemplates = IT_TEMPLATES.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.action.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = templateCategoryFilter === 'ALL' || t.category === templateCategoryFilter;
    return matchesSearch && matchesCat;
  });

  // 1. EXECUTION CONTROL: Run Now
  const handleRunNowSubmit = async () => {
    setIsExecutingRunNow(true);

    try {
      // Call backend API if online
      await api.runWorkflow(targetWorkflowForRun.id, {
        mode: 'MANUAL',
        recordType: 'LEAD',
        recordId: selectedLeadIdForRun,
        dryRun: dryRunToggle
      });
    } catch (e) {
      // Fallback handled smoothly
    }

    const runId = `RUN-${10000 + historyRuns.length + 1}`;
    const newRun = {
      runId,
      workflowId: targetWorkflowForRun.id,
      workflowName: targetWorkflowForRun.name,
      trigger: targetWorkflowForRun.trigger.event,
      recordType: 'LEAD',
      recordId: selectedLeadIdForRun,
      recordName: `${selectedLeadIdForRun} · Manual Execution`,
      mode: dryRunToggle ? 'DRY_RUN' : 'MANUAL',
      status: 'SUCCESS',
      durationMs: Math.floor(Math.random() * 80) + 120,
      executedAt: new Date().toLocaleTimeString(),
      stepsCount: targetWorkflowForRun.steps ? targetWorkflowForRun.steps.length : 4,
      actionsSummary: 'Manually executed workflow rules: Lead assigned, task generated, confirmation push sent'
    };

    // Increment workflow run count
    if (!dryRunToggle) {
      setWorkflows((prev) =>
        prev.map((w) => (w.id === targetWorkflowForRun.id ? { ...w, runsCount: w.runsCount + 1 } : w))
      );
    }

    setHistoryRuns([newRun, ...historyRuns]);
    setIsExecutingRunNow(false);
    setShowRunNowModal(false);

    addNotification({
      type: 'system',
      title: `⚡ Workflow executed: ${targetWorkflowForRun.name} on ${selectedLeadIdForRun}`,
      category: 'Automation'
    });
  };

  // 2. EXECUTION CONTROL: Automatic Trigger Simulation
  const handleRunAutomaticLeadSimulation = async () => {
    setAutoSimulationProgress('trigger');

    // Step 1: Trigger fires
    setTimeout(() => {
      setAutoSimulationProgress('condition');

      // Step 2: Condition check
      setTimeout(() => {
        setAutoSimulationProgress('actions');

        // Step 3: Actions executed
        setTimeout(() => {
          setAutoSimulationProgress('complete');

          // Add to leads in CRM context
          addLead({
            name: simulatedLead.contactName || 'Sanjay Dutt',
            company: simulatedLead.company || 'Alpha Infotech Ltd',
            email: 'sanjay.dutt@alphainfotech.com',
            phone: '+91 98401 55667',
            source: 'Website Form (HRMS)',
            status: 'Qualified',
            productInterest: simulatedLead.productInterest,
            score: simulatedLead.leadScore,
            assignedTo: 'Rahul Kumar (HRMS Specialist)'
          });

          // Add follow-up task
          addTask({
            title: `Contact high-score HRMS lead: ${simulatedLead.contactName} (${simulatedLead.company})`,
            relatedTo: `Lead: ${simulatedLead.leadId}`,
            priority: 'High',
            dueDate: 'Today (Within 15 mins)'
          });

          // Record run history
          const runId = `RUN-${10000 + historyRuns.length + 1}`;
          const newRun = {
            runId,
            workflowId: 'WF-IT-1001',
            workflowName: 'IT_HOT_LEAD_AUTO_ASSIGN',
            trigger: 'LEAD_CREATED',
            recordType: 'LEAD',
            recordId: simulatedLead.leadId,
            recordName: `${simulatedLead.contactName} · ${simulatedLead.company}`,
            mode: 'AUTOMATIC',
            status: 'SUCCESS',
            durationMs: 146,
            executedAt: new Date().toLocaleTimeString(),
            stepsCount: 5,
            actionsSummary: `HRMS Interest & Score ${simulatedLead.leadScore} verified ➔ Priority HIGH ➔ Assigned to Rahul Kumar ➔ Follow-up task created`
          };

          setHistoryRuns((prev) => [newRun, ...prev]);

          // Update runs count on workflow
          setWorkflows((prev) =>
            prev.map((w) => (w.id === 'WF-IT-1001' ? { ...w, runsCount: w.runsCount + 1 } : w))
          );

          addNotification({
            type: 'system',
            title: `🎯 Automatic Workflow Completed: Lead ${simulatedLead.leadId} routed to Rahul Kumar`,
            category: 'Automation'
          });
        }, 1200);
      }, 1000);
    }, 800);
  };

  // 3. EXECUTION CONTROL: Pause / Resume Toggle
  const handleToggleWorkflow = async (workflowId) => {
    try {
      await api.toggleWorkflow(workflowId);
    } catch (e) {
      // offline fallback
    }

    setWorkflows((prev) =>
      prev.map((w) => {
        if (w.id === workflowId) {
          const nextStatus = w.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
          addNotification({
            type: 'system',
            title: `Workflow ${w.name} is now ${nextStatus}`,
            category: 'Automation'
          });
          return { ...w, status: nextStatus };
        }
        return w;
      })
    );

    if (editingWorkflow.id === workflowId) {
      setEditingWorkflow((prev) => ({
        ...prev,
        status: prev.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
      }));
    }
  };

  // Step 5: Test dry-run preview in builder
  const handleRunDryRunPreview = () => {
    setIsDryRunning(true);
    setDryRunCompleted(false);
    setDryRunProgressStep(1);

    const interval = setInterval(() => {
      setDryRunProgressStep((prev) => {
        if (prev >= 5) {
          clearInterval(interval);
          setIsDryRunning(false);
          setDryRunCompleted(true);
          return 5;
        }
        return prev + 1;
      });
    }, 450);
  };

  // Publish workflow
  const handlePublishWorkflow = async () => {
    try {
      await api.publishWorkflow(editingWorkflow.id);
    } catch (e) {
      // fallback
    }

    setWorkflows((prev) =>
      prev.map((w) =>
        w.id === editingWorkflow.id
          ? { ...w, status: 'ACTIVE', published: true, publishedAt: new Date().toISOString() }
          : w
      )
    );

    setEditingWorkflow((prev) => ({
      ...prev,
      status: 'ACTIVE',
      published: true,
      publishedAt: new Date().toISOString()
    }));

    addNotification({
      type: 'system',
      title: `🚀 Workflow Published & Live: ${editingWorkflow.name}`,
      category: 'Automation'
    });
  };

  // Use Template action
  const handleUseTemplate = (template) => {
    const newWf = {
      id: `WF-IT-${1000 + workflows.length + 1}`,
      name: `IT_${template.name.toUpperCase().replace(/\s+/g, '_')}`,
      subtitle: template.action,
      status: 'ACTIVE',
      published: true,
      publishedAt: new Date().toISOString(),
      category: template.category,
      tag: 'Template',
      runsCount: 0,
      successRate: '100%',
      p50Runtime: '135ms',
      p95Runtime: '260ms',
      trigger: {
        event: template.trigger.toUpperCase().replace(/\s+/g, '_'),
        label: template.trigger,
        source: 'Automated CRM Event'
      },
      conditions: [
        { field: 'stage', operator: 'EXISTS', value: 'TRUE' }
      ],
      steps: [
        {
          id: 'step-t1',
          category: 'TRIGGER',
          label: 'TRIGGER',
          title: template.trigger,
          desc: `Monitors inbound events: ${template.trigger}`,
          icon: template.icon || Zap,
          color: '#6366f1',
          bg: '#e0e7ff',
          badge: 'Trigger'
        },
        {
          id: 'step-t2',
          category: 'CONDITION',
          label: 'CONDITION',
          title: 'Validate software criteria & lead status',
          desc: 'Conditions pass if record satisfies validation rules',
          icon: Sliders,
          color: '#f59e0b',
          bg: '#fef3c7',
          badge: 'Rule Filter'
        },
        {
          id: 'step-t3',
          category: 'ACTION',
          label: 'ACTION',
          title: template.action.split(',')[0] || template.action,
          desc: template.action,
          icon: UserCheck,
          color: '#10b981',
          bg: '#d1fae5',
          badge: 'Core Action'
        },
        {
          id: 'step-t4',
          category: 'ACTION',
          label: 'ACTION',
          title: 'Audit log & Manager Notification',
          desc: 'Logs execution results to history and alerts Sales Manager',
          icon: Send,
          color: '#ec4899',
          bg: '#fce7f3',
          badge: 'Audit & SLA'
        }
      ]
    };

    setWorkflows([newWf, ...workflows]);
    setEditingWorkflow(newWf);
    setActiveTab('builder');

    addNotification({
      type: 'system',
      title: `Loaded template: ${template.name} into Workflow Builder`,
      category: 'Automation'
    });
  };

  return (
    <div className="automation-container">
      {/* ========================================================
          TOP HEADER & GLOBAL EXECUTION CONTROLS
          ======================================================== */}
      <div className="auto-header-bar">
        <div className="auto-header-left">
          <div className="auto-header-icon">
            <Zap size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 className="auto-header-title">Automation Center</h1>
              <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                Sales Manager Suite
              </span>
              <span className="badge badge-outline" style={{ fontSize: '0.7rem' }}>
                Software / IT Company
              </span>
            </div>
            <p className="auto-header-desc">
              Execute, build, and audit visual autonomous sales workflows without code or manual API triggers.
            </p>
          </div>
        </div>

        {/* Global Execution Controls Bar */}
        <div className="auto-controls-group">
          {/* CONTROL 1: Automatic Trigger Simulation */}
          <button
            className="btn btn-secondary"
            onClick={() => {
              setAutoSimulationProgress(null);
              setShowAutoTriggerModal(true);
            }}
            title="Simulate automatic execution when a new HRMS lead arrives from the website"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', borderColor: '#6366f1' }}
          >
            <Sparkles size={15} style={{ color: '#6366f1' }} />
            <span>Simulate Inbound Lead (Auto Trigger)</span>
          </button>

          {/* CONTROL 2: Run Now (Manual Execution) */}
          <button
            className="btn btn-primary"
            onClick={() => {
              setTargetWorkflowForRun(workflows[0]);
              setShowRunNowModal(true);
            }}
            title="Manually trigger workflow for a selected lead or record"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Play size={15} />
            <span>Run Now</span>
          </button>

          {/* Create Workflow Button */}
          <button
            className="btn btn-secondary"
            onClick={() => {
              const blankWf = {
                id: `WF-IT-${1000 + workflows.length + 1}`,
                name: 'NEW_SALES_WORKFLOW',
                subtitle: 'Custom autonomous pipeline for inbound software inquiries',
                status: 'DRAFT',
                published: false,
                category: 'Lead Inbound',
                tag: 'Draft',
                runsCount: 0,
                successRate: '100%',
                p50Runtime: '140ms',
                p95Runtime: '270ms',
                trigger: { event: 'LEAD_CREATED', label: 'When a new lead is created', source: 'Website Chat / Webhook' },
                conditions: [{ field: 'productInterest', operator: 'EQUALS', value: 'HRMS' }],
                steps: workflows[0].steps
              };
              setWorkflows([blankWf, ...workflows]);
              setEditingWorkflow(blankWf);
              setActiveTab('builder');
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={15} />
            <span>+ Create Automation</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          SECTION SUB-NAVIGATION TABS (6 SECTIONS)
          ======================================================== */}
      <div className="auto-tabs-nav">
        <button
          className={`auto-tab-btn ${activeTab === 'my-automations' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-automations')}
        >
          <Zap size={15} />
          <span>My Automations ({workflows.length})</span>
        </button>

        <button
          className={`auto-tab-btn ${activeTab === 'builder' ? 'active' : ''}`}
          onClick={() => setActiveTab('builder')}
        >
          <GitFork size={15} />
          <span>Workflow Builder</span>
        </button>

        <button
          className={`auto-tab-btn ${activeTab === 'templates' ? 'active' : ''}`}
          onClick={() => setActiveTab('templates')}
        >
          <Layers size={15} />
          <span>Templates (25 IT Sales Flows)</span>
        </button>

        <button
          className={`auto-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <Clock size={15} />
          <span>Execution History ({historyRuns.length})</span>
        </button>

        <button
          className={`auto-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <TrendingUp size={15} />
          <span>Analytics & Errors</span>
        </button>

        <button
          className={`auto-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings size={15} />
          <span>Settings & Quotas</span>
        </button>
      </div>

      {/* ========================================================
          SECTION 1: MY AUTOMATIONS
          ======================================================== */}
      {activeTab === 'my-automations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Executive Stat Counters */}
          <div className="auto-stats-grid">
            <div className="auto-stat-card">
              <div className="auto-stat-icon" style={{ background: '#e0e7ff', color: '#4f46e5' }}>
                <Zap size={20} />
              </div>
              <div>
                <div className="auto-stat-val">{workflows.length}</div>
                <div className="auto-stat-lbl">Active Workflows</div>
              </div>
            </div>

            <div className="auto-stat-card">
              <div className="auto-stat-icon" style={{ background: '#d1fae5', color: '#059669' }}>
                <CheckCircle2 size={20} />
              </div>
              <div>
                <div className="auto-stat-val">99.4%</div>
                <div className="auto-stat-lbl">Success Rate</div>
              </div>
            </div>

            <div className="auto-stat-card">
              <div className="auto-stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                <Clock size={20} />
              </div>
              <div>
                <div className="auto-stat-val">142ms</div>
                <div className="auto-stat-lbl">Median (P50) Latency</div>
              </div>
            </div>

            <div className="auto-stat-card">
              <div className="auto-stat-icon" style={{ background: '#fce7f3', color: '#db2777' }}>
                <TrendingUp size={20} />
              </div>
              <div>
                <div className="auto-stat-val">184h</div>
                <div className="auto-stat-lbl">Time Saved / Month</div>
              </div>
            </div>
          </div>

          {/* Search, Filter & Actions Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, maxWidth: '480px' }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <Search size={15} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="crm-input"
                  placeholder="Search workflows by name or trigger event..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '36px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {['ALL', 'ACTIVE', 'PAUSED', 'DRAFT'].map((st) => (
                <button
                  key={st}
                  className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setStatusFilter(st)}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Workflows Table */}
          <div className="crm-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div className="table-responsive">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Workflow Name</th>
                    <th>Trigger & Event</th>
                    <th>Status</th>
                    <th>Executions</th>
                    <th>Success Rate</th>
                    <th>P50 Runtime</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWorkflows.map((wf) => (
                    <tr key={wf.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: '10px',
                              background: wf.status === 'ACTIVE' ? '#e0e7ff' : '#f1f5f9',
                              color: wf.status === 'ACTIVE' ? '#4f46e5' : '#64748b',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            <GitFork size={18} />
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                                {wf.name}
                              </span>
                              <span className="builder-id-pill">{wf.id}</span>
                              {wf.tag && (
                                <span className="builder-badge-growth">{wf.tag}</span>
                              )}
                            </div>
                            <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              {wf.subtitle}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span style={{ padding: '4px 8px', borderRadius: '4px', background: 'var(--bg-surface)', border: '1px solid var(--border)', fontSize: '0.75rem', fontWeight: 600 }}>
                          {wf.trigger.label}
                        </span>
                      </td>

                      <td>
                        {wf.status === 'ACTIVE' ? (
                          <span className="builder-badge-active">● Active</span>
                        ) : wf.status === 'PAUSED' ? (
                          <span className="builder-badge-paused">⏸ Paused</span>
                        ) : (
                          <span className="badge" style={{ background: '#f1f5f9', color: '#64748b' }}>Draft</span>
                        )}
                      </td>

                      <td style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                        {wf.runsCount} runs
                      </td>

                      <td>
                        <span style={{ color: '#059669', fontWeight: 700, fontSize: '0.85rem' }}>
                          {wf.successRate}
                        </span>
                      </td>

                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                        {wf.p50Runtime}
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {/* CONTROL: Run Now */}
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                              setTargetWorkflowForRun(wf);
                              setShowRunNowModal(true);
                            }}
                            title="Run Now manually on a lead"
                          >
                            <Play size={12} />
                            <span>Run</span>
                          </button>

                          {/* CONTROL: Pause / Resume */}
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleToggleWorkflow(wf.id)}
                            title={wf.status === 'ACTIVE' ? 'Pause workflow' : 'Resume workflow'}
                          >
                            {wf.status === 'ACTIVE' ? <Pause size={12} /> : <Play size={12} />}
                          </button>

                          {/* Edit in Builder */}
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                              setEditingWorkflow(wf);
                              setActiveTab('builder');
                            }}
                            title="Open in Workflow Builder"
                          >
                            <Edit3 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SECTION 2: CREATE AUTOMATION / WORKFLOW BUILDER
          (Modeled on the exact screenshot layout)
          ======================================================== */}
      {activeTab === 'builder' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Top Actions Row matching screenshot */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  background: '#6366f120',
                  color: '#6366f1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <GitFork size={18} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {editingWorkflow.name}
                </h2>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  {editingWorkflow.subtitle}
                </p>
              </div>
            </div>

            {/* Top Toolbar matching screenshot: Back, Duplicate, Delete, Rename, Save Draft, Test, Pause/Run, Publish */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('my-automations')}>
                Back
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  const duplicated = {
                    ...editingWorkflow,
                    id: `WF-IT-${1000 + workflows.length + 1}`,
                    name: `${editingWorkflow.name}_COPY`,
                    runsCount: 0
                  };
                  setWorkflows([duplicated, ...workflows]);
                  setEditingWorkflow(duplicated);
                  addNotification({ type: 'system', title: `Workflow duplicated as ${duplicated.name}`, category: 'Automation' });
                }}
              >
                <Copy size={13} />
                <span>Duplicate</span>
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setWorkflows(workflows.filter((w) => w.id !== editingWorkflow.id));
                  setActiveTab('my-automations');
                  addNotification({ type: 'system', title: 'Workflow deleted', category: 'Automation' });
                }}
              >
                <Trash2 size={13} style={{ color: '#ef4444' }} />
                <span>Delete</span>
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  const newName = prompt('Enter new workflow name:', editingWorkflow.name);
                  if (newName) setEditingWorkflow({ ...editingWorkflow, name: newName });
                }}
              >
                <Edit3 size={13} />
                <span>Rename</span>
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => addNotification({ type: 'system', title: 'Draft changes saved', category: 'Automation' })}
              >
                Save draft
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleRunDryRunPreview}
                disabled={isDryRunning}
              >
                <Play size={13} className={isDryRunning ? 'pulse' : ''} />
                <span>{isDryRunning ? 'Testing...' : 'Test'}</span>
              </button>

              {/* Pause / Resume Button */}
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleToggleWorkflow(editingWorkflow.id)}
                style={{
                  background: editingWorkflow.status === 'ACTIVE' ? '#fef3c7' : '#ecfdf5',
                  color: editingWorkflow.status === 'ACTIVE' ? '#b45309' : '#047857',
                  borderColor: editingWorkflow.status === 'ACTIVE' ? '#fde68a' : '#a7f3d0'
                }}
              >
                {editingWorkflow.status === 'ACTIVE' ? <Pause size={13} /> : <Play size={13} />}
                <span>{editingWorkflow.status === 'ACTIVE' ? 'Pause' : 'Resume'}</span>
              </button>

              {/* Step 6: Publish and Activate */}
              <button
                className="btn btn-primary btn-sm"
                onClick={handlePublishWorkflow}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Sparkles size={14} />
                <span>Publish</span>
              </button>
            </div>
          </div>

          {/* Main Canvas + Right Inspector Grid */}
          <div className="builder-layout-grid">
            {/* Center Canvas */}
            <div className="builder-canvas-panel">
              {/* Breadcrumb line matching screenshot */}
              <div className="builder-breadcrumb-bar">
                <div className="builder-breadcrumb-left">
                  <span>Automations</span>
                  <span>&gt;</span>
                  <span className="builder-breadcrumb-title">{editingWorkflow.name}</span>
                  <span className="builder-id-pill">{editingWorkflow.id}</span>
                  <span className="builder-badge-growth">Growth</span>
                  {editingWorkflow.status === 'ACTIVE' ? (
                    <span className="builder-badge-active">● Active</span>
                  ) : (
                    <span className="builder-badge-paused">⏸ Paused</span>
                  )}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  {editingWorkflow.runsCount} runs · {editingWorkflow.successRate} success
                </div>
              </div>

              {/* Visual Connected Step Cards */}
              <div className="builder-steps-container">
                {editingWorkflow.steps.map((step, idx) => {
                  const IconComp = step.icon;
                  return (
                    <React.Fragment key={step.id}>
                      <div className="step-card">
                        <div className="step-card-left">
                          <div
                            className="step-icon-box"
                            style={{ background: step.bg, color: step.color }}
                          >
                            <IconComp size={20} />
                          </div>
                          <div className="step-content">
                            <span className="step-category-label" style={{ color: step.color }}>
                              {step.label}
                            </span>
                            <h4 className="step-title">{step.title}</h4>
                            <p className="step-subtext">
                              {step.desc.includes('=') ? (
                                <span className="step-subtext-code">{step.desc}</span>
                              ) : (
                                step.desc
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Edit Step action */}
                        <button
                          className="step-edit-btn"
                          onClick={() => {
                            const newDesc = prompt(`Edit configuration for ${step.title}:`, step.desc);
                            if (newDesc) {
                              const updated = editingWorkflow.steps.map((s) =>
                                s.id === step.id ? { ...s, desc: newDesc } : s
                              );
                              setEditingWorkflow({ ...editingWorkflow, steps: updated });
                            }
                          }}
                        >
                          <Edit3 size={12} />
                          <span>Edit</span>
                        </button>
                      </div>

                      {/* Connecting vertical line */}
                      {idx < editingWorkflow.steps.length - 1 && (
                        <div className="step-connecting-line" />
                      )}
                    </React.Fragment>
                  );
                })}

                {/* + Add Step Button */}
                <button
                  className="add-step-btn"
                  onClick={() => {
                    const stepType = prompt('Enter Step Type (ACTION, CONDITION, WAIT):', 'ACTION');
                    if (stepType) {
                      const newStep = {
                        id: `step-${Date.now()}`,
                        category: stepType.toUpperCase(),
                        label: stepType.toUpperCase(),
                        title: 'Custom Action / Notification',
                        desc: 'type=CUSTOM · target=Sales Representative',
                        icon: Sparkles,
                        color: '#8b5cf6',
                        bg: '#ede9fe',
                        badge: 'Custom'
                      };
                      setEditingWorkflow({
                        ...editingWorkflow,
                        steps: [...editingWorkflow.steps, newStep]
                      });
                    }
                  }}
                >
                  <Plus size={14} />
                  <span>Add step</span>
                </button>
              </div>
            </div>

            {/* Right Inspector Panel matching screenshot exactly */}
            <div className="builder-inspector-panel">
              {/* Section 1: Dry run preview */}
              <div className="inspector-card">
                <div className="inspector-card-header">
                  <Sparkles size={14} style={{ color: '#6366f1' }} />
                  <span>Dry run preview</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input
                    type="text"
                    className="crm-input"
                    value={previewLead}
                    onChange={(e) => setPreviewLead(e.target.value)}
                    style={{ fontSize: '0.825rem', padding: '8px 12px' }}
                    placeholder="Enter prospect name or lead ID..."
                  />

                  <button
                    className="btn btn-primary"
                    onClick={handleRunDryRunPreview}
                    disabled={isDryRunning}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <Play size={14} className={isDryRunning ? 'pulse' : ''} />
                    <span>{isDryRunning ? 'Running preview...' : 'Run preview'}</span>
                  </button>
                </div>

                {/* Checklist with green checkmark circles matching screenshot */}
                <div className="dry-run-checklist">
                  <div className="dry-run-item">
                    {dryRunProgressStep >= 1 ? (
                      <CheckCircle2 size={16} className="dry-run-check-icon" />
                    ) : (
                      <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #cbd5e1' }} />
                    )}
                    <div>
                      <div style={{ fontWeight: 600 }}>1 When a new lead is created</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        Fired on {previewLead.split('(')[0]}
                      </div>
                    </div>
                  </div>

                  <div className="dry-run-item">
                    {dryRunProgressStep >= 2 ? (
                      <CheckCircle2 size={16} className="dry-run-check-icon" />
                    ) : (
                      <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #cbd5e1' }} />
                    )}
                    <div>
                      <div style={{ fontWeight: 600 }}>2 If product equals HRMS &amp; score ≥ 75</div>
                      <div style={{ fontSize: '0.72rem', color: '#059669' }}>
                        Condition satisfied (Score: 88 &ge; 75)
                      </div>
                    </div>
                  </div>

                  <div className="dry-run-item">
                    {dryRunProgressStep >= 3 ? (
                      <CheckCircle2 size={16} className="dry-run-check-icon" />
                    ) : (
                      <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #cbd5e1' }} />
                    )}
                    <div>
                      <div style={{ fontWeight: 600 }}>3 Assign by territory &amp; skill</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        Assigned to Rahul Kumar (HRMS Specialist)
                      </div>
                    </div>
                  </div>

                  <div className="dry-run-item">
                    {dryRunProgressStep >= 4 ? (
                      <CheckCircle2 size={16} className="dry-run-check-icon" />
                    ) : (
                      <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #cbd5e1' }} />
                    )}
                    <div>
                      <div style={{ fontWeight: 600 }}>4 Wait 1h</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        Delivery queue scheduled
                      </div>
                    </div>
                  </div>

                  <div className="dry-run-item">
                    {dryRunProgressStep >= 5 ? (
                      <CheckCircle2 size={16} className="dry-run-check-icon" />
                    ) : (
                      <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #cbd5e1' }} />
                    )}
                    <div>
                      <div style={{ fontWeight: 600 }}>5 Send welcome &amp; demo invite email</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        Dispatched template: Welcome - HRMS
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: INSIGHTS 2x2 grid matching screenshot */}
              <div className="inspector-card">
                <div className="inspector-card-header">
                  <TrendingUp size={14} style={{ color: '#059669' }} />
                  <span>Insights</span>
                </div>

                <div className="insights-stats-grid">
                  <div className="insight-tile">
                    <div className="insight-tile-label">Success Rate</div>
                    <div className="insight-tile-val" style={{ color: '#059669' }}>100%</div>
                    <div className="insight-tile-sub">25/25 completed</div>
                  </div>

                  <div className="insight-tile">
                    <div className="insight-tile-label">Failed Runs</div>
                    <div className="insight-tile-val" style={{ color: '#0284c7' }}>0</div>
                    <div className="insight-tile-sub">over 25 runs</div>
                  </div>

                  <div className="insight-tile">
                    <div className="insight-tile-label">P50 Runtime</div>
                    <div className="insight-tile-val" style={{ fontSize: '1.05rem', fontFamily: 'monospace' }}>142ms</div>
                    <div className="insight-tile-sub">median over recent runs</div>
                  </div>

                  <div className="insight-tile">
                    <div className="insight-tile-label">P95 Runtime</div>
                    <div className="insight-tile-val" style={{ fontSize: '1.05rem', fontFamily: 'monospace' }}>280ms</div>
                    <div className="insight-tile-sub">tail latency SLA</div>
                  </div>
                </div>

                {/* Mini Activity Chart matching screenshot */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>
                    <span>LAST 14 DAYS</span>
                    <span>25 runs · 0 failed</span>
                  </div>
                  <div className="spark-bar-chart">
                    {[12, 18, 8, 22, 14, 28, 35, 20, 26, 40, 32, 29, 38, 48].map((val, i) => (
                      <div
                        key={i}
                        className={`spark-bar ${i === 13 ? '' : 'dim'}`}
                        style={{ height: `${(val / 48) * 44}px` }}
                        title={`Day ${i + 1}: ${val} executions`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 3: RECENT RUNS matching screenshot */}
              <div className="inspector-card">
                <div className="inspector-card-header">
                  <Clock size={14} style={{ color: '#64748b' }} />
                  <span>Recent Runs</span>
                </div>

                <div className="recent-runs-list">
                  {historyRuns.slice(0, 5).map((run) => (
                    <div
                      key={run.runId}
                      className="recent-run-item"
                      onClick={() => setSelectedRunDetail(run)}
                      title="Click to inspect trace logs"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="run-status-pill success">SUCCESS</span>
                        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>lead.created</span>
                      </div>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>
                        {run.executedAt}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SECTION 3: TEMPLATES (ALL 25 IT SALES AUTOMATIONS)
          ======================================================== */}
      {activeTab === 'templates' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Header & Filter Chips */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                Pre-Built IT Sales Automation Templates (25 Workflows)
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Production-ready automations tailored for Software &amp; IT companies. Click "Use Template" to customize.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              {templateCategories.map((cat) => (
                <button
                  key={cat}
                  className={`btn btn-sm ${templateCategoryFilter === cat ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setTemplateCategoryFilter(cat)}
                  style={{ fontSize: '0.75rem' }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Templates Grid */}
          <div className="templates-grid">
            {filteredTemplates.map((tmpl) => {
              const IconComp = tmpl.icon;
              return (
                <div key={tmpl.id} className="template-card">
                  <div>
                    <div className="template-header">
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: '10px',
                          background: '#6366f115',
                          color: '#6366f1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <IconComp size={18} />
                      </div>
                      <span className="template-category-badge">{tmpl.category}</span>
                    </div>

                    <h4 className="template-title">
                      #{tmpl.id} — {tmpl.name}
                    </h4>

                    {/* Trigger & Action breakdown */}
                    <div className="template-flow-preview">
                      <div className="template-flow-item">
                        <span style={{ fontWeight: 700, color: '#6366f1', minWidth: '55px' }}>Trigger:</span>
                        <span style={{ color: 'var(--text-main)' }}>{tmpl.trigger}</span>
                      </div>
                      <div className="template-flow-item">
                        <span style={{ fontWeight: 700, color: '#10b981', minWidth: '55px' }}>Action:</span>
                        <span style={{ color: 'var(--text-main)' }}>{tmpl.action}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    className="btn btn-primary"
                    onClick={() => handleUseTemplate(tmpl)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <span>Use Template</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================
          SECTION 4: EXECUTION HISTORY
          ======================================================== */}
      {activeTab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                Workflow Execution History &amp; Audit Logs
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Immutable execution records tracking each trigger, evaluated condition, dispatched action, and latency.
              </p>
            </div>

            <button
              className="btn btn-secondary btn-sm"
              onClick={() => addNotification({ type: 'system', title: 'Execution history refreshed from database', category: 'Automation' })}
            >
              <RefreshCw size={13} />
              <span>Refresh Logs</span>
            </button>
          </div>

          {/* History Table */}
          <div className="crm-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-responsive">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Run ID</th>
                    <th>Workflow Name</th>
                    <th>Target Record</th>
                    <th>Execution Mode</th>
                    <th>Status</th>
                    <th>Latency</th>
                    <th>Timestamp</th>
                    <th>Action Summary</th>
                    <th>Trace</th>
                  </tr>
                </thead>
                <tbody>
                  {historyRuns.map((run) => (
                    <tr key={run.runId}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>
                        {run.runId}
                      </td>

                      <td style={{ fontWeight: 600 }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{run.workflowName}</div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{run.trigger}</span>
                      </td>

                      <td>
                        <span style={{ fontWeight: 600, fontSize: '0.825rem' }}>{run.recordName || run.recordId}</span>
                      </td>

                      <td>
                        <span
                          className="badge"
                          style={{
                            background: run.mode === 'AUTOMATIC' ? '#eff6ff' : run.mode === 'MANUAL' ? '#f5f3ff' : '#f1f5f9',
                            color: run.mode === 'AUTOMATIC' ? '#2563eb' : run.mode === 'MANUAL' ? '#7c3aed' : '#475569'
                          }}
                        >
                          {run.mode}
                        </span>
                      </td>

                      <td>
                        <span className="run-status-pill success">
                          {run.status}
                        </span>
                      </td>

                      <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        {run.durationMs}ms
                      </td>

                      <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {run.executedAt}
                      </td>

                      <td style={{ fontSize: '0.78rem', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {run.actionsSummary}
                      </td>

                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedRunDetail(run)}
                          title="View complete step trace and payload"
                        >
                          <Eye size={12} />
                          <span>Trace</span>
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

      {/* ========================================================
          SECTION 5: ANALYTICS & ERRORS
          ======================================================== */}
      {activeTab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Top KPI Cards */}
          <div className="auto-stats-grid">
            <div className="auto-stat-card">
              <div className="auto-stat-icon" style={{ background: '#e0e7ff', color: '#4f46e5' }}>
                <UserCheck size={20} />
              </div>
              <div>
                <div className="auto-stat-val">1,420</div>
                <div className="auto-stat-lbl">Leads Auto-Assigned</div>
              </div>
            </div>

            <div className="auto-stat-card">
              <div className="auto-stat-icon" style={{ background: '#cffafe', color: '#0891b2' }}>
                <Send size={20} />
              </div>
              <div>
                <div className="auto-stat-val">3,890</div>
                <div className="auto-stat-lbl">Follow-ups Dispatched</div>
              </div>
            </div>

            <div className="auto-stat-card">
              <div className="auto-stat-icon" style={{ background: '#d1fae5', color: '#059669' }}>
                <Calendar size={20} />
              </div>
              <div>
                <div className="auto-stat-val">412</div>
                <div className="auto-stat-lbl">Demos Auto-Booked</div>
              </div>
            </div>

            <div className="auto-stat-card">
              <div className="auto-stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                <FileText size={20} />
              </div>
              <div>
                <div className="auto-stat-val">215</div>
                <div className="auto-stat-lbl">Proposals Generated</div>
              </div>
            </div>

            <div className="auto-stat-card">
              <div className="auto-stat-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>
                <AlertTriangle size={20} />
              </div>
              <div>
                <div className="auto-stat-val">0.6%</div>
                <div className="auto-stat-lbl">Transient Error Rate</div>
              </div>
            </div>
          </div>

          {/* Breakdown Charts Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Trigger Distribution */}
            <div className="crm-card">
              <h4 style={{ margin: '0 0 16px 0', fontSize: '0.95rem', fontWeight: 700 }}>
                Execution Volume by Trigger Event
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { trigger: 'LEAD_CREATED (Website / Inbound Chat)', count: 2480, share: '42%', color: '#6366f1' },
                  { trigger: 'DEMO_REQUESTED (Scheduler Widget)', count: 1360, share: '23%', color: '#10b981' },
                  { trigger: 'PROPOSAL_UNANSWERED (3-Day Stagnation)', count: 980, share: '16%', color: '#f59e0b' },
                  { trigger: 'STALE_DEAL_SLA (7-Day Inactivity)', count: 610, share: '10%', color: '#ec4899' },
                  { trigger: 'OTHER_EVENTS (Renewals & Audits)', count: 507, share: '9%', color: '#64748b' }
                ].map((item) => (
                  <div key={item.trigger}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600 }}>{item.trigger}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{item.count} runs ({item.share})</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'var(--bg-surface)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ width: item.share, height: '100%', background: item.color, borderRadius: '999px' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Interest Routing */}
            <div className="crm-card">
              <h4 style={{ margin: '0 0 16px 0', fontSize: '0.95rem', fontWeight: 700 }}>
                Lead Routing by Software Product
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { product: 'HRMS Software (Assigned to Rahul Kumar)', count: 639, share: '45%', color: '#3b82f6' },
                  { product: 'ERP Suite (Assigned to Sneha Iyer)', count: 397, share: '28%', color: '#8b5cf6' },
                  { product: 'Cloud & DevOps Solutions', count: 255, share: '18%', color: '#06b6d4' },
                  { product: 'Custom SaaS & AI Agents', count: 129, share: '9%', color: '#10b981' }
                ].map((item) => (
                  <div key={item.product}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600 }}>{item.product}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{item.count} leads ({item.share})</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'var(--bg-surface)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ width: item.share, height: '100%', background: item.color, borderRadius: '999px' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SECTION 6: SETTINGS, PERMISSIONS & INTEGRATIONS
          ======================================================== */}
      {activeTab === 'settings' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Card 1: Execution Engine & Retry Policy */}
          <div className="crm-card">
            <h4 style={{ margin: '0 0 16px 0', fontSize: '0.95rem', fontWeight: 700 }}>
              Execution Limits &amp; Retry Policies
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Monthly Workflow Runs Quota</span>
                <span style={{ fontWeight: 700 }}>12,480 / 50,000 used (24.9%)</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Concurrency Execution Limit</span>
                <span style={{ fontWeight: 700 }}>25 concurrent workers</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Transient Error Retry Policy</span>
                <span style={{ fontWeight: 700 }}>3 attempts · Exponential Backoff</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Pause Execution Policy</span>
                <span style={{ fontWeight: 700 }}>Drain active runs safely</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Tenant Isolation Enforcement</span>
                <span style={{ color: '#059669', fontWeight: 700 }}>Strict Multitenancy Active</span>
              </div>
            </div>
          </div>

          {/* Card 2: Connected Integrations */}
          <div className="crm-card">
            <h4 style={{ margin: '0 0 16px 0', fontSize: '0.95rem', fontWeight: 700 }}>
              Connected Channels &amp; Integrations
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { name: 'Website Chat & Form Webhooks', status: 'ACTIVE', latency: 'Sub-10ms delivery', icon: Zap },
                { name: 'WhatsApp Cloud API (Meta)', status: 'ACTIVE', latency: 'Verified Business Account', icon: MessageSquare },
                { name: 'SendGrid SMTP Email Relay', status: 'ACTIVE', latency: 'Dedicated IP configured', icon: Mail },
                { name: 'Google Calendar & Meet (OAuth)', status: 'ACTIVE', latency: 'Auto room link generation', icon: Calendar }
              ].map((integ) => {
                const IconComp = integ.icon;
                return (
                  <div
                    key={integ.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px',
                      borderRadius: '8px',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <IconComp size={16} style={{ color: '#6366f1' }} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.825rem' }}>{integ.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{integ.latency}</div>
                      </div>
                    </div>
                    <span className="builder-badge-active">Connected</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 1: RUN NOW (MANUAL EXECUTION CONTROL)
          ======================================================== */}
      {showRunNowModal && (
        <div className="modal-overlay" onClick={() => setShowRunNowModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Play size={18} style={{ color: '#6366f1' }} />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                  Run Workflow Now (Manual Start)
                </h3>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowRunNowModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8rem' }}>
                  Select Workflow
                </label>
                <select
                  className="crm-input"
                  value={targetWorkflowForRun.id}
                  onChange={(e) => {
                    const found = workflows.find((w) => w.id === e.target.value);
                    if (found) setTargetWorkflowForRun(found);
                  }}
                >
                  {workflows.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.trigger.label})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8rem' }}>
                  Select Target Record ID
                </label>
                <select
                  className="crm-input"
                  value={selectedLeadIdForRun}
                  onChange={(e) => setSelectedLeadIdForRun(e.target.value)}
                >
                  <option value="LEAD-5001">LEAD-5001: Rajesh Sharma · TechCorp (HRMS, Score 88)</option>
                  <option value="LEAD-5002">LEAD-5002: Priya Narang · Global Systems (ERP, Score 82)</option>
                  <option value="LEAD-4890">LEAD-4890: Vikram Mehta · Apex Cloud (Score 90)</option>
                  <option value="OPP-102">OPP-102: CloudTech Software License Quote (₹2,25,000)</option>
                </select>
              </div>

              {/* Dry Run Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '8px', background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <input
                  type="checkbox"
                  id="dryRunCheck"
                  checked={dryRunToggle}
                  onChange={(e) => setDryRunToggle(e.target.checked)}
                />
                <label htmlFor="dryRunCheck" style={{ fontSize: '0.8rem', cursor: 'pointer' }}>
                  <strong>Dry Run Mode:</strong> Validate condition criteria and action outcome without modifying live database records.
                </label>
              </div>

              {/* Intended Action Preview */}
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.78rem' }}>
                <div style={{ fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Intended Actions to Execute:
                </div>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#475569', lineHeight: 1.5 }}>
                  <li>Evaluate {targetWorkflowForRun.trigger.label}</li>
                  <li>Verify qualification rules: productInterest and leadScore threshold</li>
                  <li>Assign record to eligible product specialist</li>
                  <li>Create follow-up task and notify Sales Manager</li>
                  <li>Dispatch welcome email &amp; demo calendar link</li>
                </ul>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowRunNowModal(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleRunNowSubmit}
                disabled={isExecutingRunNow}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Play size={14} />
                <span>{isExecutingRunNow ? 'Queuing run...' : 'Confirm & Run Now'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: AUTOMATIC TRIGGER SIMULATOR (INBOUND HRMS LEAD)
          (Shows the exact flow from user specification)
          ======================================================== */}
      {showAutoTriggerModal && (
        <div className="modal-overlay" onClick={() => setShowAutoTriggerModal(false)}>
          <div className="modal-dialog" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} style={{ color: '#6366f1' }} />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                  Automatic Inbound Lead Trigger Simulator
                </h3>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowAutoTriggerModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ margin: 0, fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                Suppose a new lead arrives from your IT company's website with interest in HRMS software:
              </p>

              {/* JSON Payload Display */}
              <div style={{ background: '#0f172a', color: '#38bdf8', padding: '14px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.8rem', lineHeight: 1.5 }}>
                <pre style={{ margin: 0 }}>
{`{
  "leadId": "${simulatedLead.leadId}",
  "productInterest": "${simulatedLead.productInterest}",
  "leadScore": ${simulatedLead.leadScore},
  "stage": "${simulatedLead.stage}",
  "company": "${simulatedLead.company}",
  "contact": "${simulatedLead.contactName}"
}`}
                </pre>
              </div>

              {/* End-to-End Pipeline Visualization */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '4px 0' }}>
                {/* Step 1: Trigger */}
                <div style={{ padding: '10px 14px', borderRadius: '8px', background: autoSimulationProgress ? '#eff6ff' : 'var(--bg-surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Zap size={16} style={{ color: '#6366f1' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>1. Trigger: New lead created ({simulatedLead.leadId})</span>
                  </div>
                  {autoSimulationProgress && <CheckCircle2 size={16} style={{ color: '#10b981' }} />}
                </div>

                {/* Step 2: Condition */}
                <div style={{ padding: '10px 14px', borderRadius: '8px', background: autoSimulationProgress === 'condition' || autoSimulationProgress === 'actions' || autoSimulationProgress === 'complete' ? '#fef3c7' : 'var(--bg-surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sliders size={16} style={{ color: '#f59e0b' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>2. Condition: HRMS interest and score &ge; 75?</span>
                  </div>
                  {(autoSimulationProgress === 'actions' || autoSimulationProgress === 'complete') && (
                    <span style={{ color: '#059669', fontWeight: 700, fontSize: '0.78rem' }}>YES (88 &ge; 75)</span>
                  )}
                </div>

                {/* Step 3: Action */}
                <div style={{ padding: '10px 14px', borderRadius: '8px', background: autoSimulationProgress === 'actions' || autoSimulationProgress === 'complete' ? '#ecfdf5' : 'var(--bg-surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <UserCheck size={16} style={{ color: '#10b981' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>3. Actions: Assign Rahul Kumar, create task, notify manager</span>
                  </div>
                  {autoSimulationProgress === 'complete' && <CheckCircle2 size={16} style={{ color: '#10b981' }} />}
                </div>

                {/* Step 4: History Record */}
                <div style={{ padding: '10px 14px', borderRadius: '8px', background: autoSimulationProgress === 'complete' ? '#f5f3ff' : 'var(--bg-surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={16} style={{ color: '#7c3aed' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>4. Execution History: Logged in audit registry</span>
                  </div>
                  {autoSimulationProgress === 'complete' && <CheckCircle2 size={16} style={{ color: '#10b981' }} />}
                </div>
              </div>

              {autoSimulationProgress === 'complete' && (
                <div style={{ padding: '12px', borderRadius: '8px', background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', fontSize: '0.825rem' }}>
                  ✅ <strong>Automation Succeeded!</strong> The Sales Manager does not have to click Run. The workflow engine automatically processed the lead, assigned the HRMS specialist, scheduled a task, and recorded the trace in Execution History.
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAutoTriggerModal(false)}>
                Close
              </button>
              <button
                className="btn btn-primary"
                onClick={handleRunAutomaticLeadSimulation}
                disabled={autoSimulationProgress === 'trigger' || autoSimulationProgress === 'condition' || autoSimulationProgress === 'actions'}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Sparkles size={14} />
                <span>Simulate Inbound Event</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: RUN DETAIL & TRACE VIEWER
          ======================================================== */}
      {selectedRunDetail && (
        <div className="modal-overlay" onClick={() => setSelectedRunDetail(null)}>
          <div className="modal-dialog" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} style={{ color: '#6366f1' }} />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                  Execution Trace — {selectedRunDetail.runId}
                </h3>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setSelectedRunDetail(null)}>
                ✕
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.825rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Workflow:</span>
                  <div style={{ fontWeight: 700 }}>{selectedRunDetail.workflowName}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Target Record:</span>
                  <div style={{ fontWeight: 700 }}>{selectedRunDetail.recordName}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Mode:</span>
                  <div style={{ fontWeight: 700 }}>{selectedRunDetail.mode}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
                  <span className="run-status-pill success">{selectedRunDetail.status}</span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', fontWeight: 700 }}>Step Execution Pipeline:</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { step: 1, name: 'Evaluate Trigger & Inbound Payload', status: 'PASSED', duration: '18ms' },
                    { step: 2, name: 'Condition Check: HRMS & Score >= 75', status: 'PASSED', duration: '24ms' },
                    { step: 3, name: 'Assign to Rahul Kumar (HRMS Specialist)', status: 'PASSED', duration: '42ms' },
                    { step: 4, name: 'Create Follow-up Task (15 min SLA)', status: 'PASSED', duration: '38ms' },
                    { step: 5, name: 'Immutable Audit Record Saved', status: 'PASSED', duration: '20ms' }
                  ].map((s) => (
                    <div
                      key={s.step}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        background: 'var(--bg-surface)',
                        borderRadius: '6px',
                        border: '1px solid var(--border)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle2 size={14} style={{ color: '#10b981' }} />
                        <span>{s.step}. {s.name}</span>
                      </div>
                      <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                        {s.duration}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedRunDetail(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
