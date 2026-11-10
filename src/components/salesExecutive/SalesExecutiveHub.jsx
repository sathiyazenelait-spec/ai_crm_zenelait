import React, { useState, useEffect } from 'react';
import { useCRM } from '../../context/CRMContext';
import api from '../../services/api';
import {
  LayoutDashboard,
  UserPlus,
  Users,
  Target,
  CheckSquare,
  Calendar,
  Bot,
  FileText,
  BarChart3,
  Zap,
  Sparkles,
  Clock,
  ArrowRight,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  AlertCircle,
  Shield,
  DollarSign,
  TrendingUp,
  Send,
  Eye,
  RefreshCw,
  Play,
  Check,
  X,
  Award,
  HelpCircle,
  Phone,
  Mail,
  Video,
  MessageSquare,
  Building,
  ChevronRight,
  Download,
  Layers,
  Lock,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

export function SalesExecutiveHub({ initialSubTab = 'cockpit' }) {
  const {
    leads,
    setLeads,
    customers,
    opportunities,
    setOpportunities,
    tasks,
    setTasks,
    appointments,
    setAppointments,
    conversations,
    currentUserRole,
    currentUserName,
    activeIndustryId,
    setActiveModal,
    navigateTo
  } = useCRM();

  const [activeTab, setActiveTab] = useState(initialSubTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductFilter, setSelectedProductFilter] = useState('ALL');
  const [apiFeedback, setApiFeedback] = useState(null);

  // ========================================================
  // 1. PRODUCTS CATALOGUE STATE (HRMS, ERP, LMS, CRM)
  // ========================================================
  const [products, setProducts] = useState([
    {
      id: 'PROD-HRMS',
      name: 'Enterprise HRMS & Payroll Suite',
      category: 'HRMS',
      sku: 'HRMS-ENT-500',
      basePrice: 450000,
      currency: 'INR',
      billing: 'Annual',
      description: 'Comprehensive human resource management system featuring automated biometric attendance, statutory Indian payroll, employee self-service, leave rosters, and appraisal OKRs.',
      modules: ['Statutory Payroll Engine', 'Biometric / Geofenced Attendance', 'Leave & Shift Management', 'Performance Appraisal & OKRs', 'Employee Self-Service Portal'],
      supportedDeployments: ['Cloud SaaS', 'Dedicated VPC', 'On-Premise'],
      supportedIntegrations: ['Slack', 'Microsoft Teams', 'Tally ERP', 'Biometric Hardware', 'SAP']
    },
    {
      id: 'PROD-ERP',
      name: 'Cloud ERP & Supply Chain Core',
      category: 'ERP',
      sku: 'ERP-CORE-CLD',
      basePrice: 750000,
      currency: 'INR',
      billing: 'Annual',
      description: 'End-to-end enterprise resource planning with multi-warehouse inventory, procurement workflows, production scheduling, bill of materials, and financial ledger.',
      modules: ['Financial Ledger & GST Billing', 'Multi-Warehouse Inventory', 'Procurement & Vendor Portal', 'BOM & Production Scheduling', 'Logistics & Dispatch Tracking'],
      supportedDeployments: ['Cloud SaaS', 'Dedicated VPC'],
      supportedIntegrations: ['Razorpay', 'Stripe', 'Shiprocket', 'Salesforce', 'Zoho Books']
    },
    {
      id: 'PROD-LMS',
      name: 'AI-Powered Corporate Learning LMS',
      category: 'LMS',
      sku: 'LMS-AI-ED',
      basePrice: 350000,
      currency: 'INR',
      billing: 'Annual',
      description: 'NextGen corporate training platform with interactive video course builder, SCORM/xAPI compliance, proctored examinations, and AI skill gap analysis.',
      modules: ['Drag & Drop Course Builder', 'Interactive Quizzes & Certificates', 'SCORM / xAPI / AICC Player', 'Compliance Audit Reports', 'Live Classrooms & Zoom Bridge'],
      supportedDeployments: ['Cloud SaaS', 'Hybrid'],
      supportedIntegrations: ['Zoom', 'Google Meet', 'Canvas', 'Moodle', 'Stripe']
    },
    {
      id: 'PROD-CRM',
      name: 'Omnichannel AI CRM & Sales Bot',
      category: 'CRM',
      sku: 'CRM-BOT-OMNI',
      basePrice: 320000,
      currency: 'INR',
      billing: 'Annual',
      description: 'Unified sales acceleration workspace featuring AI web chatbot, WhatsApp/Email qualification agent, deal pipeline tracking, CPQ proposals, and customer 360.',
      modules: ['Lead Inbound Auto-Routing', 'WhatsApp & Web Chat Bot', 'Deal Pipeline & Forecasting', 'Automated CPQ Quotations', 'Omnichannel Shared Inbox'],
      supportedDeployments: ['Cloud SaaS', 'Dedicated VPC'],
      supportedIntegrations: ['WhatsApp Cloud API', 'SendGrid', 'Meta Ads', 'Google Workspace', 'Zapier']
    }
  ]);

  // ========================================================
  // 2. DEMOS & DEMO OUTCOMES STATE
  // ========================================================
  const [demosList, setDemosList] = useState([
    {
      id: 'DEMO-IT-2001',
      leadId: 'LEAD-5001',
      leadName: 'Priya Sharma (Tech Solutions Inc.)',
      product: 'HRMS (500 Employees)',
      scheduledAt: '2026-10-18T11:00',
      presenter: 'Anita Sharma (Sales Executive)',
      channel: 'Google Meet',
      meetingUrl: 'https://meet.google.com/zen-hrms-5001',
      status: 'SCHEDULED',
      specialNotes: 'Focus on 500-seat payroll compliance & biometric sync'
    },
    {
      id: 'DEMO-IT-2002',
      leadId: 'LEAD-5003',
      leadName: 'Vikram Mehta (Apex Infotech)',
      product: 'Cloud ERP & Logistics',
      scheduledAt: '2026-10-19T14:30',
      presenter: 'Rahul Kumar (Sales Executive)',
      channel: 'Zoom Call',
      meetingUrl: 'https://zoom.us/j/982736410',
      status: 'SCHEDULED',
      specialNotes: 'Multi-location inventory and GST e-invoicing demo'
    }
  ]);

  // Selected Demo for Outcome Recording
  const [selectedDemoForOutcome, setSelectedDemoForOutcome] = useState(null);
  const [demoOutcomeForm, setDemoOutcomeForm] = useState({
    outcomeStatus: 'POSITIVE_ADVANCING',
    interestScore: 92,
    questionsAsked: 'Can attendance sync automatically with Matrix biometric hardware?',
    objectionsFaced: 'Client comparing with Darwinbox pricing for 500 licenses',
    nextSteps: 'Prepare commercial proposal with 500 licenses & 5% introductory discount',
    techStaffRequired: true
  });

  // ========================================================
  // 3. PROPOSALS & DISCOUNT APPROVAL STATE
  // ========================================================
  const [proposalsList, setProposalsList] = useState([
    {
      id: 'PROP-IT-3001',
      title: 'Enterprise HRMS & Payroll Cloud Proposal',
      client: 'Tech Solutions Inc. (Priya Sharma)',
      product: 'Enterprise HRMS & Payroll Suite',
      opportunityId: 'OPP-7001',
      subtotal: 500000,
      discountPercent: 5,
      discountAmount: 25000,
      taxAmount: 85500,
      totalAmount: 560500,
      status: 'PENDING_APPROVAL',
      approvalStatus: 'SUBMITTED_TO_MANAGER',
      validUntil: '2026-11-15',
      preparedBy: 'Anita Sharma (Sales Executive)',
      notes: 'Competitive proposal against rival HRMS. 5% discount requested for immediate 1-year upfront commitment.'
    },
    {
      id: 'PROP-IT-3002',
      title: 'NextGen LMS Corporate Training License',
      client: 'EduCore Global (Meera Iyer)',
      product: 'AI-Powered Corporate Learning LMS',
      opportunityId: 'OPP-7002',
      subtotal: 350000,
      discountPercent: 0,
      discountAmount: 0,
      taxAmount: 63000,
      totalAmount: 413000,
      status: 'SENT',
      approvalStatus: 'NOT_REQUIRED',
      validUntil: '2026-11-20',
      preparedBy: 'Anita Sharma (Sales Executive)',
      notes: 'Standard approved catalog pricing. Awaiting procurement signature.'
    }
  ]);

  // New Proposal Form
  const [isCreatingProposal, setIsCreatingProposal] = useState(false);
  const [newProposal, setNewProposal] = useState({
    title: 'Enterprise Software Implementation Proposal',
    client: 'Tech Solutions Inc.',
    product: 'Enterprise HRMS & Payroll Suite',
    opportunityId: 'OPP-7001',
    userSeats: 500,
    ratePerSeat: 900,
    implementationFee: 50000,
    discountPercent: 5,
    discountReason: 'Competitive bid against competitor; upfront annual payment',
    notes: 'Includes dedicated account manager and 99.95% SLA.'
  });

  // ========================================================
  // 4. DUPLICATE CHECKER STATE
  // ========================================================
  const [duplicateCheckQuery, setDuplicateCheckQuery] = useState('priya@techsolutions.com');
  const [duplicateResult, setDuplicateResult] = useState(null);

  // ========================================================
  // 5. INTERACTIVE 5-STEP LEAD-TO-SALE WALKTHROUGH STATE
  // ========================================================
  const [walkthroughStep, setWalkthroughStep] = useState(1);
  const [walkthroughLogs, setWalkthroughLogs] = useState([]);
  const [isSimulatingStep, setIsSimulatingStep] = useState(false);

  // Pre-seed API Data if available
  useEffect(() => {
    // Attempt to load live products & proposals from backend
    api.getItProducts().then((res) => {
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setProducts(res.data);
      }
    });

    api.listItProposals().then((res) => {
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setProposalsList(res.data);
      }
    });

    api.listItDemos().then((res) => {
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setDemosList(res.data);
      }
    });
  }, []);

  const showNotification = (msg, isSuccess = true) => {
    setApiFeedback({ message: msg, isSuccess });
    setTimeout(() => setApiFeedback(null), 4500);
  };

  // Duplicate Check Handler
  const handleCheckDuplicates = () => {
    const q = duplicateCheckQuery.toLowerCase().trim();
    const matches = leads.filter(
      (l) =>
        (l.email && l.email.toLowerCase().includes(q)) ||
        (l.phone && l.phone.includes(q)) ||
        (l.company && l.company.toLowerCase().includes(q))
    );

    if (matches.length > 0) {
      setDuplicateResult({
        hasDuplicates: true,
        message: `Found ${matches.length} existing record(s) matching "${duplicateCheckQuery}".`,
        matches
      });
    } else {
      setDuplicateResult({
        hasDuplicates: false,
        message: `No duplicates found for "${duplicateCheckQuery}". Safe to create new lead!`
      });
    }
  };

  // Demo Outcome Submission Handler
  const handleRecordOutcomeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDemoForOutcome) return;

    try {
      const outcomePayload = {
        status: 'COMPLETED',
        outcomeStatus: demoOutcomeForm.outcomeStatus,
        interestScore: Number(demoOutcomeForm.interestScore),
        questionsAsked: demoOutcomeForm.questionsAsked,
        objectionsFaced: demoOutcomeForm.objectionsFaced,
        nextSteps: demoOutcomeForm.nextSteps,
        techStaffRequired: demoOutcomeForm.techStaffRequired
      };

      // Call Backend API
      await api.recordItDemoOutcome(selectedDemoForOutcome.id, outcomePayload);

      // Update local state
      setDemosList((prev) =>
        prev.map((d) =>
          d.id === selectedDemoForOutcome.id
            ? { ...d, status: 'COMPLETED', outcome: outcomePayload }
            : d
        )
      );

      showNotification(`Demo outcome recorded for ${selectedDemoForOutcome.leadName}. Advancing deal!`);
      setSelectedDemoForOutcome(null);
    } catch (err) {
      showNotification('Outcome recorded locally (Dev fallback).', true);
      setSelectedDemoForOutcome(null);
    }
  };

  // Proposal Creation & Discount Approval Handler
  const handleCreateProposalSubmit = async (e) => {
    e.preventDefault();
    const subtotal = newProposal.userSeats * newProposal.ratePerSeat + Number(newProposal.implementationFee);
    const discAmount = (subtotal * Number(newProposal.discountPercent)) / 100;
    const taxable = subtotal - discAmount;
    const taxAmount = taxable * 0.18;
    const totalAmount = taxable + taxAmount;

    const propId = `PROP-IT-${Math.floor(1000 + Math.random() * 9000)}`;
    const needsApproval = Number(newProposal.discountPercent) > 0;

    const proposalRecord = {
      id: propId,
      title: newProposal.title,
      client: newProposal.client,
      product: newProposal.product,
      opportunityId: newProposal.opportunityId,
      subtotal,
      discountPercent: Number(newProposal.discountPercent),
      discountAmount: discAmount,
      taxAmount,
      totalAmount,
      status: needsApproval ? 'PENDING_APPROVAL' : 'DRAFT',
      approvalStatus: needsApproval ? 'SUBMITTED_TO_MANAGER' : 'NOT_REQUIRED',
      validUntil: '2026-11-20',
      preparedBy: currentUserName || 'Sales Executive',
      notes: newProposal.notes
    };

    // Call Backend API
    try {
      await api.createItProposal(proposalRecord);
      if (needsApproval) {
        await api.requestProposalApproval(propId, {
          discountPercent: newProposal.discountPercent,
          requestedDiscountAmount: discAmount,
          reason: newProposal.discountReason,
          requestedBy: currentUserName || 'Sales Executive'
        });
      }
    } catch (err) {
      // Dev fallback
    }

    setProposalsList([proposalRecord, ...proposalsList]);
    setIsCreatingProposal(false);
    showNotification(
      needsApproval
        ? `Proposal ${propId} generated! ${newProposal.discountPercent}% discount request routed to Sales Manager for approval gate.`
        : `Proposal ${propId} generated successfully as DRAFT.`
    );
  };

  // ========================================================
  // 5-STEP LEAD-TO-SALE INTERACTIVE SIMULATION
  // ========================================================
  const runWalkthroughStep = async (stepNumber) => {
    setIsSimulatingStep(true);

    if (stepNumber === 1) {
      // Step 1: New Enquiry
      const newLead = {
        id: 'LEAD-5001',
        name: 'Priya Sharma',
        email: 'priya.sharma@techsolutions.com',
        phone: '+91 98765 43210',
        company: 'Tech Solutions Inc.',
        source: 'Website AI Chat',
        status: 'New',
        score: 88,
        productInterest: 'HRMS Software (500 Employees)',
        budget: 500000,
        assignedTo: currentUserName || 'Anita Sharma (Sales Executive)'
      };

      try {
        await api.createLead({
          name: newLead.name,
          email: newLead.email,
          phone: newLead.phone,
          companyName: newLead.company,
          source: 'WEBSITE',
          requirement: 'HRMS for 500 employees',
          budget: 500000
        });
      } catch (e) {}

      setLeads((prev) => [newLead, ...prev.filter((l) => l.id !== 'LEAD-5001')]);
      setWalkthroughLogs((prev) => [
        `[Step 1] Inbound AI Chat capture: Customer asked for 500-employee HRMS software. AI logged LEAD-5001 with Fit Score 88/100. Dispatched API: POST /api/v1/leads`,
        ...prev
      ]);
      setWalkthroughStep(2);
    } else if (stepNumber === 2) {
      // Step 2: Qualify Lead
      try {
        await api.updateLeadStage('LEAD-5001', 'QUALIFIED');
      } catch (e) {}

      setLeads((prev) =>
        prev.map((l) => (l.id === 'LEAD-5001' ? { ...l, status: 'Qualified', score: 94 } : l))
      );
      setWalkthroughLogs((prev) => [
        `[Step 2] Sales Executive qualified LEAD-5001: Verified 500 headcount, ₹5L approved budget, Attendance/Payroll modules, 3-week purchase timeline. Dispatched API: PATCH /api/v1/leads/LEAD-5001/stage`,
        ...prev
      ]);
      setWalkthroughStep(3);
    } else if (stepNumber === 3) {
      // Step 3: Schedule Demo & Create Task
      const newApt = {
        id: 'APT-8001',
        title: 'HRMS 500-Employee Product Demonstration',
        leadId: 'LEAD-5001',
        leadName: 'Priya Sharma (Tech Solutions Inc.)',
        date: 'Tomorrow, 11:00 AM',
        status: 'Scheduled',
        channel: 'Google Meet',
        assignedTo: currentUserName || 'Anita Sharma'
      };

      const newTask = {
        id: 'TSK-9001',
        title: 'Prepare HRMS Multi-Shift & Biometric Sandbox for Demo',
        leadId: 'LEAD-5001',
        priority: 'High',
        status: 'In Progress',
        dueDate: 'Tomorrow 10:00 AM'
      };

      try {
        await api.createAppointment(newApt);
        await api.createTask(newTask);
      } catch (e) {}

      setAppointments((prev) => [newApt, ...prev]);
      setTasks((prev) => [newTask, ...prev]);
      setWalkthroughLogs((prev) => [
        `[Step 3] Demo scheduled on Google Meet for LEAD-5001. Prep task TSK-9001 generated for sales engineering. Dispatched API: POST /api/v1/appointments, POST /api/v1/tasks`,
        ...prev
      ]);
      setWalkthroughStep(4);
    } else if (stepNumber === 4) {
      // Step 4: Send Proposal & Request Discount
      const proposal = {
        id: 'PROP-IT-3001',
        title: 'Enterprise HRMS & Payroll Cloud Proposal (500 Seats)',
        client: 'Tech Solutions Inc. (Priya Sharma)',
        product: 'Enterprise HRMS & Payroll Suite',
        subtotal: 500000,
        discountPercent: 5,
        discountAmount: 25000,
        taxAmount: 85500,
        totalAmount: 560500,
        status: 'PENDING_APPROVAL',
        approvalStatus: 'SUBMITTED_TO_MANAGER',
        validUntil: '2026-11-15'
      };

      try {
        await api.createItProposal(proposal);
        await api.requestProposalApproval(proposal.id, {
          discountPercent: 5,
          reason: '500-seat upfront annual commitment'
        });
      } catch (e) {}

      setProposalsList((prev) => [proposal, ...prev.filter((p) => p.id !== 'PROP-IT-3001')]);
      setWalkthroughLogs((prev) => [
        `[Step 4] Post-demo proposal PROP-IT-3001 created. 5% discount requested and routed to Sales Manager approval gate. Dispatched API: POST /api/v1/it/proposals, POST /api/v1/it/proposals/PROP-IT-3001/approval-requests`,
        ...prev
      ]);
      setWalkthroughStep(5);
    } else if (stepNumber === 5) {
      // Step 5: Close Deal WON
      const wonOpp = {
        id: 'OPP-7001',
        title: 'Tech Solutions Inc. - 500 HRMS Cloud Seats',
        leadId: 'LEAD-5001',
        amount: 560500,
        currency: 'INR',
        stage: 'Won',
        probability: 100,
        expectedCloseDate: 'Today'
      };

      try {
        await api.updateOpportunityStage('OPP-7001', 'WON');
      } catch (e) {}

      setOpportunities((prev) => [wonOpp, ...prev.filter((o) => o.id !== 'OPP-7001')]);
      setProposalsList((prev) =>
        prev.map((p) =>
          p.id === 'PROP-IT-3001' ? { ...p, status: 'ACCEPTED', approvalStatus: 'APPROVED' } : p
        )
      );

      setWalkthroughLogs((prev) => [
        `[Step 5] Deal Closed as WON! Customer accepted proposal. Revenue ₹5,60,500 booked to sales quota. Handover to implementation initiated. Dispatched API: PATCH /api/v1/opportunities/OPP-7001/stage`,
        ...prev
      ]);
      setWalkthroughStep(1); // loop back
    }

    setIsSimulatingStep(false);
  };

  return (
    <div className="sales-executive-hub-view" style={{ paddingBottom: '40px' }}>
      {/* Toast Alert Feedback */}
      {apiFeedback && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: apiFeedback.isSuccess ? '#10b981' : '#ef4444',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            fontWeight: 600,
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <CheckCircle2 size={18} />
          <span>{apiFeedback.message}</span>
        </div>
      )}

      {/* Hero Header for Sales Executive */}
      <div
        className="crm-card"
        style={{
          marginBottom: '20px',
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(37, 99, 235, 0.08) 100%)',
          borderColor: 'rgba(6, 182, 212, 0.3)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span
                style={{
                  background: '#06b6d4',
                  color: '#fff',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <Award size={13} />
                Sales Executive Cockpit
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Industry Tenant: <strong>Software / IT Company (ABC Technologies)</strong>
              </span>
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '4px 0 6px 0', letterSpacing: '-0.02em' }}>
              Sales Executive Operating Hub
            </h1>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '780px' }}>
              Full lead-to-close workflow: Manage personal leads, schedule IT software demos (HRMS, ERP, LMS, CRM),
              prepare proposals with approved pricing, trigger manager discount approvals, and track quota attainment.
            </p>
          </div>

          {/* Quick Action Badges */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setActiveTab('lead-to-sale')}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #06b6d4, #2563eb)' }}
              >
                <Sparkles size={14} />
                <span>Lead-to-Sale Guide (5 Steps)</span>
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setActiveTab('products-demos')}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Layers size={14} />
                <span>Software Catalogue</span>
              </button>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={12} style={{ color: '#10b981' }} />
              <span>Strict Tenant Isolation & Role Boundaries Active</span>
            </div>
          </div>
        </div>

        {/* Section 5: What Sales Executive Should Not Control Banner */}
        <div
          style={{
            marginTop: '16px',
            padding: '10px 14px',
            borderRadius: '6px',
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.8rem',
            color: 'var(--text-main)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={15} style={{ color: '#ef4444', flexShrink: 0 }} />
            <span>
              <strong>Enforced Security Guardrails:</strong> Other sales reps' leads sealed &bull; Tenant billing/roles locked &bull; Workflow publishing restricted to Manager &bull; Unapproved discounts blocked.
            </span>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>Active Spring Security Rule</span>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="crm-tabs-header" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', marginBottom: '20px' }}>
        {[
          { id: 'cockpit', label: '1. Cockpit & Daily Work', icon: LayoutDashboard },
          { id: 'leads', label: '2. Lead Management', icon: UserPlus },
          { id: 'customers', label: '3. Accounts & Customers', icon: Users },
          { id: 'pipeline', label: '4. Deals & Pipeline', icon: Target },
          { id: 'products-demos', label: '5. Software & Demos', icon: Layers },
          { id: 'proposals', label: '6. Proposals & Quotes', icon: FileText },
          { id: 'activities', label: '7. Activities & Follow-ups', icon: CheckSquare },
          { id: 'ai-agent', label: '8. AI Sales Agent', icon: Bot },
          { id: 'performance', label: '10. Performance & Reports', icon: BarChart3 },
          { id: 'lead-to-sale', label: '⚡ Guided 5-Step Lead to Sale', icon: Sparkles }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
                fontWeight: isActive ? 700 : 500,
                borderColor: isActive ? 'var(--primary)' : 'var(--border)'
              }}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================
          TAB 1: COCKPIT & DAILY WORK
          ======================================================== */}
      {activeTab === 'cockpit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Key Metrics Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px' }}>
            <div className="metric-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>
                <span>PERSONAL ACTIVE LEADS</span>
                <UserPlus size={16} style={{ color: '#06b6d4' }} />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, margin: '6px 0 2px 0' }}>42</div>
              <div style={{ fontSize: '0.75rem', color: '#10b981' }}>+8 assigned this week &bull; 92% SLA met</div>
            </div>

            <div className="metric-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>
                <span>DEALS CLOSED THIS MONTH</span>
                <Target size={16} style={{ color: '#10b981' }} />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, margin: '6px 0 2px 0' }}>6 Deals</div>
              <div style={{ fontSize: '0.75rem', color: '#10b981' }}>₹28,50,000 revenue booked</div>
            </div>

            <div className="metric-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>
                <span>MONTHLY TARGET ATTAINMENT</span>
                <Award size={16} style={{ color: '#f59e0b' }} />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, margin: '6px 0 2px 0' }}>81.4%</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Target: ₹35,00,000 (₹6.5L left)</div>
            </div>

            <div className="metric-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>
                <span>CONVERSION RATE</span>
                <TrendingUp size={16} style={{ color: '#8b5cf6' }} />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, margin: '6px 0 2px 0' }}>14.2%</div>
              <div style={{ fontSize: '0.75rem', color: '#10b981' }}>+2.4% above IT software benchmark</div>
            </div>
          </div>

          {/* Target Attainment Bar */}
          <div className="crm-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
              <span><strong>Q4 Monthly Target Progress:</strong> ₹28,50,000 / ₹35,00,000</span>
              <span style={{ fontWeight: 700, color: '#10b981' }}>81.4% Achieved (13 days left in month)</span>
            </div>
            <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--bg-surface)', borderRadius: '5px', overflow: 'hidden', border: '1px solid var(--border)' }}>
              <div style={{ width: '81.4%', height: '100%', background: 'linear-gradient(90deg, #06b6d4, #10b981)' }} />
            </div>
          </div>

          {/* Split: Upcoming Demos & Overdue Tasks vs AI Recommendations */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
            {/* Upcoming Demos & Meetings */}
            <div className="crm-card">
              <div className="crm-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={18} style={{ color: 'var(--primary)' }} />
                  <span style={{ fontWeight: 700 }}>Upcoming Product Demos & Meetings</span>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('products-demos')}>
                  Schedule Demo +
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {demosList.map((demo) => (
                  <div
                    key={demo.id}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      background: 'var(--bg-surface)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{demo.product}</span>
                        <span className="badge badge-active-pill" style={{ fontSize: '0.7rem' }}>{demo.status}</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Client: <strong>{demo.leadName}</strong> &bull; Slot: {demo.scheduledAt}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {demo.specialNotes}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <a
                        href={demo.meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-primary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Video size={13} />
                        <span>Join</span>
                      </a>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setSelectedDemoForOutcome(demo);
                          setActiveTab('products-demos');
                        }}
                      >
                        Outcome
                      </button>
                    </div>
                  </div>
                ))}

                {/* Overdue Tasks List */}
                <div style={{ marginTop: '12px' }}>
                  <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#ef4444', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertCircle size={14} />
                    <span>Priority Follow-up Tasks</span>
                  </div>
                  {tasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border)',
                        marginBottom: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input type="checkbox" style={{ cursor: 'pointer' }} />
                        <span style={{ fontSize: '0.825rem', color: 'var(--text-main)' }}>{task.title}</span>
                      </div>
                      <span className="badge" style={{ fontSize: '0.7rem', backgroundColor: 'rgba(239, 68, 68, 0.12)', color: '#ef4444' }}>
                        Due {task.dueDate || 'Today'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Recommendations & Daily Priorities */}
            <div className="crm-card" style={{ background: 'var(--card-bg)' }}>
              <div className="crm-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={18} style={{ color: '#06b6d4' }} />
                  <span style={{ fontWeight: 700 }}>AI Recommendations & Daily Priorities</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    background: 'rgba(6, 182, 212, 0.08)',
                    border: '1px solid rgba(6, 182, 212, 0.25)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#06b6d4' }}>HIGH INTENT LEAD (Fit Score 94)</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>10m ago</span>
                  </div>
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-main)', marginBottom: '6px' }}>
                    <strong>Priya Sharma (Tech Solutions)</strong> requested HRMS demo for 500 seats. AI verified ₹5L budget.
                  </div>
                  <button
                    className="btn btn-sm btn-primary"
                    style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                    onClick={() => setActiveTab('lead-to-sale')}
                  >
                    Launch 5-Step Deal Flow &rarr;
                  </button>
                </div>

                <div
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    background: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.25)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f59e0b' }}>STALLED PROPOSAL ALERT</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>3 days idle</span>
                  </div>
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-main)', marginBottom: '6px' }}>
                    Proposal PROP-IT-3001 pending discount approval. Remind Sales Manager to approve 5% concession.
                  </div>
                  <button
                    className="btn btn-sm btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                    onClick={() => setActiveTab('proposals')}
                  >
                    View Proposal Details &rarr;
                  </button>
                </div>

                <div
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.25)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#10b981' }}>COMPETITOR INTEL BATTLECARD</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Updated</span>
                  </div>
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-main)' }}>
                    AI detected competitor "Darwinbox" in client notes. Positioning tip: Highlight Zenelait's sub-20ms WhatsApp payroll slip bot.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: LEAD MANAGEMENT (Assigned, Duplicates, Qualify)
          ======================================================== */}
      {activeTab === 'leads' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Controls Bar */}
          <div className="crm-card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '280px' }}>
                <div className="search-box" style={{ flex: 1 }}>
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search personal leads by contact, company, product interest..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setActiveModal('addLead')}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={14} />
                  <span>Create Lead</span>
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    const csvContent =
                      'Name,Email,Company,Product,Budget\nPriya Sharma,priya@techsolutions.com,Tech Solutions Inc,HRMS,500000\nVikram Mehta,vikram@apex.com,Apex Infotech,ERP,750000';
                    const blob = new Blob([csvContent], { type: 'text/csv' });
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.download = 'Sample_Leads_Template.csv';
                    a.click();
                    showNotification('Sample lead import template exported.');
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Download size={14} />
                  <span>Import/Export</span>
                </button>
              </div>
            </div>

            {/* Duplicate Checker Bar */}
            <div
              style={{
                marginTop: '16px',
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Shield size={16} style={{ color: '#06b6d4' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Check Potential Lead Duplicates:</span>
                <input
                  type="text"
                  placeholder="Enter email or phone..."
                  value={duplicateCheckQuery}
                  onChange={(e) => setDuplicateCheckQuery(e.target.value)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    fontSize: '0.825rem'
                  }}
                />
                <button className="btn btn-secondary btn-sm" onClick={handleCheckDuplicates}>
                  Scan Database
                </button>
              </div>

              {duplicateResult && (
                <div
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: duplicateResult.hasDuplicates ? '#ef4444' : '#10b981'
                  }}
                >
                  {duplicateResult.message}
                </div>
              )}
            </div>
          </div>

          {/* Leads Table */}
          <div className="crm-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-responsive">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Lead Name & Contact</th>
                    <th>Company</th>
                    <th>Product Interest</th>
                    <th>Lead Source</th>
                    <th>Fit Score</th>
                    <th>Stage</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads
                    .filter(
                      (l) =>
                        !searchQuery ||
                        l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        l.company.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((lead) => (
                      <tr key={lead.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{lead.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {lead.email} &bull; {lead.phone}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 500 }}>{lead.company}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Size: 250-500</div>
                        </td>
                        <td>
                          <span
                            className="badge"
                            style={{
                              backgroundColor: lead.productInterest?.includes('ERP')
                                ? 'rgba(139, 92, 246, 0.12)'
                                : 'rgba(6, 182, 212, 0.12)',
                              color: lead.productInterest?.includes('ERP') ? '#8b5cf6' : '#06b6d4',
                              fontWeight: 600
                            }}
                          >
                            {lead.productInterest || 'HRMS Software'}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Bot size={13} style={{ color: '#06b6d4' }} />
                            <span>{lead.source || 'Website AI Chat'}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                backgroundColor: (lead.score || 85) >= 80 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                color: (lead.score || 85) >= 80 ? '#10b981' : '#f59e0b'
                              }}
                            >
                              {lead.score || 88}
                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              {(lead.score || 85) >= 80 ? 'High Intent' : 'Warm'}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${lead.status === 'Qualified' ? 'badge-active-pill' : 'badge-waiting'}`}>
                            {lead.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ fontSize: '0.72rem', padding: '4px 8px' }}
                              onClick={() => {
                                api.updateLeadStage(lead.id, 'QUALIFIED');
                                setLeads((prev) =>
                                  prev.map((l) => (l.id === lead.id ? { ...l, status: 'Qualified' } : l))
                                );
                                showNotification(`Lead ${lead.id} (${lead.name}) qualified!`);
                              }}
                            >
                              Qualify
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '0.72rem', padding: '4px 8px' }}
                              onClick={() => {
                                showNotification(`Recorded activity call log for ${lead.name}`);
                              }}
                            >
                              <Phone size={11} />
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
          TAB 3: ACCOUNTS & CUSTOMER MANAGEMENT
          ======================================================== */}
      {activeTab === 'customers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="crm-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>
              Customer Company Profiles & Interaction Timeline
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Track customer size, existing software stack, products purchased, account ownership, and renewal dates.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginTop: '16px' }}>
              {customers.slice(0, 4).map((c) => (
                <div
                  key={c.id}
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-surface)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 700 }}>{c.name}</h4>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{c.company || 'Enterprise Client'}</div>
                    </div>
                    <span className="badge badge-active-pill" style={{ fontSize: '0.7rem' }}>
                      {c.plan || 'HRMS Annual'}
                    </span>
                  </div>

                  <div style={{ margin: '12px 0', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div><strong>Headcount:</strong> 500 Employees</div>
                    <div><strong>Existing Software:</strong> Legacy On-Premise Tally + Excel</div>
                    <div><strong>Active Subscription:</strong> Enterprise HRMS & Payroll Cloud</div>
                    <div><strong>Contract Renewal:</strong> 2027-10-15 &bull; <span style={{ color: '#10b981' }}>Healthy Account</span></div>
                  </div>

                  {/* Interaction Timeline Snippet */}
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Recent Timeline:</div>
                    <div>&bull; Demo conducted with CTO on 2026-10-14</div>
                    <div>&bull; Proposal #PROP-IT-3001 accepted & contract signed</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: DEALS & SALES PIPELINE (Competitors, Objections)
          ======================================================== */}
      {activeTab === 'pipeline' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Pipeline Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
            {[
              { stage: 'Qualification', count: 12, value: '₹24.0L', color: '#06b6d4' },
              { stage: 'Demo Scheduled', count: 8, value: '₹18.5L', color: '#3b82f6' },
              { stage: 'Proposal Sent', count: 6, value: '₹15.2L', color: '#8b5cf6' },
              { stage: 'Negotiation', count: 4, value: '₹11.0L', color: '#f59e0b' },
              { stage: 'Closed Won', count: 14, value: '₹48.0L', color: '#10b981' }
            ].map((st) => (
              <div
                key={st.stage}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${st.color}30`,
                  background: 'var(--bg-surface)'
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: st.color }}>{st.stage.toUpperCase()}</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, margin: '4px 0' }}>{st.value}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{st.count} Active Deals</div>
              </div>
            ))}
          </div>

          {/* Active Opportunities Table with Competitors & Objections */}
          <div className="crm-card" style={{ padding: 0 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700 }}>Personal Software Sales Opportunities</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Forecast Q4: <strong>₹68,00,000 Weighted</strong>
              </div>
            </div>

            <div className="table-responsive">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Deal Name & Account</th>
                    <th>Estimated Value</th>
                    <th>Probability</th>
                    <th>Stage</th>
                    <th>Competitors Recorded</th>
                    <th>Objections / Budget</th>
                    <th>Close Date</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      id: 'OPP-7001',
                      title: 'Tech Solutions Inc. - 500 HRMS Cloud',
                      amount: '₹5,60,500',
                      prob: '90%',
                      stage: 'Negotiation',
                      competitors: 'Darwinbox, Keka',
                      objection: 'Wants 5% upfront discount; ₹5L budget cap',
                      closeDate: '2026-10-25'
                    },
                    {
                      id: 'OPP-7002',
                      title: 'Apex Infotech - ERP Logistics Core',
                      amount: '₹8,50,000',
                      prob: '75%',
                      stage: 'Proposal Sent',
                      competitors: 'SAP Business One',
                      objection: 'Questions on GST multi-state e-way bill bridge',
                      closeDate: '2026-11-05'
                    },
                    {
                      id: 'OPP-7003',
                      title: 'EduCore Global - LMS Training Suite',
                      amount: '₹4,13,000',
                      prob: '85%',
                      stage: 'Demo Scheduled',
                      competitors: 'Moodle Enterprise',
                      objection: 'Requires SCORM 2004 4th edition verification',
                      closeDate: '2026-11-10'
                    }
                  ].map((opp) => (
                    <tr key={opp.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{opp.title}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{opp.id}</div>
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{opp.amount}</td>
                      <td>
                        <span style={{ fontWeight: 600, color: '#10b981' }}>{opp.prob}</span>
                      </td>
                      <td>
                        <span className="badge badge-active-pill">{opp.stage}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 500 }}>
                          {opp.competitors}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {opp.objection}
                      </td>
                      <td style={{ fontSize: '0.8rem' }}>{opp.closeDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 5: SOFTWARE PRODUCTS CATALOGUE & DEMOS
          ======================================================== */}
      {activeTab === 'products-demos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Software Catalogue Grid */}
          <div className="crm-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                  IT Company Software Catalogue (HRMS, ERP, LMS, CRM)
                </h3>
                <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Approved pricing, modules breakdown, deployment modes, and technical integrations.
                </p>
              </div>

              {/* Filter */}
              <div style={{ display: 'flex', gap: '6px' }}>
                {['ALL', 'HRMS', 'ERP', 'LMS', 'CRM'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedProductFilter(cat)}
                    className={`btn btn-sm ${selectedProductFilter === cat ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {products
                .filter((p) => selectedProductFilter === 'ALL' || p.category === selectedProductFilter)
                .map((prod) => (
                  <div
                    key={prod.id}
                    style={{
                      padding: '16px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      background: 'var(--bg-surface)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <span
                          className="badge"
                          style={{
                            background: 'rgba(6, 182, 212, 0.12)',
                            color: '#06b6d4',
                            fontWeight: 700,
                            fontSize: '0.72rem'
                          }}
                        >
                          {prod.category}
                        </span>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
                          ₹{prod.basePrice.toLocaleString()} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>/ yr</span>
                        </span>
                      </div>

                      <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', fontWeight: 700 }}>{prod.name}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                        {prod.description}
                      </p>

                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                          Core Modules Included:
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {prod.modules.map((m, idx) => (
                            <li key={idx}>{m}</li>
                          ))}
                        </ul>
                      </div>

                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <strong>Integrations:</strong> {prod.supportedIntegrations?.join(', ')}
                      </div>
                    </div>

                    <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ flex: 1 }}
                        onClick={() => {
                          setNewProposal({
                            ...newProposal,
                            product: prod.name,
                            ratePerSeat: prod.category === 'HRMS' ? 900 : 1500
                          });
                          setIsCreatingProposal(true);
                          setActiveTab('proposals');
                        }}
                      >
                        Create Quote
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          showNotification(`Solution engineering team notified for custom technical requirements on ${prod.name}.`);
                        }}
                        title="Coordinate with technical staff"
                      >
                        <HelpCircle size={14} />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Record Demo Outcome Modal / Drawer */}
          {selectedDemoForOutcome && (
            <div
              className="crm-card"
              style={{
                border: '2px solid var(--primary)',
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.05) 0%, rgba(37, 99, 235, 0.05) 100%)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={18} style={{ color: 'var(--primary)' }} />
                  <h4 style={{ margin: 0, fontWeight: 700 }}>
                    Record Demo Outcome: {selectedDemoForOutcome.product} &bull; {selectedDemoForOutcome.leadName}
                  </h4>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => setSelectedDemoForOutcome(null)}>
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleRecordOutcomeSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Demo Status Outcome</label>
                    <select
                      className="form-select-sm"
                      value={demoOutcomeForm.outcomeStatus}
                      onChange={(e) => setDemoOutcomeForm({ ...demoOutcomeForm, outcomeStatus: e.target.value })}
                      style={{ width: '100%', marginTop: '4px' }}
                    >
                      <option value="POSITIVE_ADVANCING">Positive — Advancing to Commercial Proposal</option>
                      <option value="TECHNICAL_QUESTIONS_PENDING">Needs Technical Review with Engineers</option>
                      <option value="RESCHEDULED">Needs Second Demo for Executive Stakeholders</option>
                      <option value="NOT_A_FIT">Disqualified / No Budget Fit</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Client Interest Score (0 - 100)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={demoOutcomeForm.interestScore}
                      onChange={(e) => setDemoOutcomeForm({ ...demoOutcomeForm, interestScore: e.target.value })}
                      min="0"
                      max="100"
                      style={{ width: '100%', marginTop: '4px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Questions Asked by Prospect</label>
                    <input
                      type="text"
                      className="form-control"
                      value={demoOutcomeForm.questionsAsked}
                      onChange={(e) => setDemoOutcomeForm({ ...demoOutcomeForm, questionsAsked: e.target.value })}
                      style={{ width: '100%', marginTop: '4px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Objections / Competitor Mentions</label>
                    <input
                      type="text"
                      className="form-control"
                      value={demoOutcomeForm.objectionsFaced}
                      onChange={(e) => setDemoOutcomeForm({ ...demoOutcomeForm, objectionsFaced: e.target.value })}
                      style={{ width: '100%', marginTop: '4px' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Agreed Next Steps</label>
                  <input
                    type="text"
                    className="form-control"
                    value={demoOutcomeForm.nextSteps}
                    onChange={(e) => setDemoOutcomeForm({ ...demoOutcomeForm, nextSteps: e.target.value })}
                    style={{ width: '100%', marginTop: '4px' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={demoOutcomeForm.techStaffRequired}
                      onChange={(e) => setDemoOutcomeForm({ ...demoOutcomeForm, techStaffRequired: e.target.checked })}
                    />
                    <span>Flag Solution Engineering Staff for complex custom requirement</span>
                  </label>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedDemoForOutcome(null)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary btn-sm">
                      Save Outcome
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 6: PROPOSALS & QUOTATIONS (Discount Approval)
          ======================================================== */}
      {activeTab === 'proposals' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="crm-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                  Proposals, Quotations & Discount Approval Gate
                </h3>
                <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Generate software proposals from approved catalogue pricing. Discounts require Sales Manager approval.
                </p>
              </div>

              <button
                className="btn btn-primary btn-sm"
                onClick={() => setIsCreatingProposal(!isCreatingProposal)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={14} />
                <span>{isCreatingProposal ? 'Close Generator' : 'Prepare Proposal'}</span>
              </button>
            </div>

            {/* Proposal Generator Form */}
            {isCreatingProposal && (
              <form
                onSubmit={handleCreateProposalSubmit}
                style={{
                  padding: '16px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  marginBottom: '20px'
                }}
              >
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)' }}>
                  New Software Quotation Builder
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Proposal Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newProposal.title}
                      onChange={(e) => setNewProposal({ ...newProposal, title: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Customer / Company</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newProposal.client}
                      onChange={(e) => setNewProposal({ ...newProposal, client: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Software Product</label>
                    <select
                      className="form-select-sm"
                      value={newProposal.product}
                      onChange={(e) => setNewProposal({ ...newProposal, product: e.target.value })}
                      style={{ width: '100%', height: '36px' }}
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>User Licenses / Seats</label>
                    <input
                      type="number"
                      className="form-control"
                      value={newProposal.userSeats}
                      onChange={(e) => setNewProposal({ ...newProposal, userSeats: Number(e.target.value) })}
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Approved Rate Per Seat (₹/yr)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={newProposal.ratePerSeat}
                      onChange={(e) => setNewProposal({ ...newProposal, ratePerSeat: Number(e.target.value) })}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Implementation & Training Fee (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={newProposal.implementationFee}
                      onChange={(e) => setNewProposal({ ...newProposal, implementationFee: Number(e.target.value) })}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f59e0b' }}>
                      Discount Requested (%) &bull; Manager Gate
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      value={newProposal.discountPercent}
                      onChange={(e) => setNewProposal({ ...newProposal, discountPercent: Number(e.target.value) })}
                      min="0"
                      max="30"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Discount Justification Reason</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newProposal.discountReason}
                      onChange={(e) => setNewProposal({ ...newProposal, discountReason: e.target.value })}
                      placeholder="e.g. 500 licenses upfront deal"
                    />
                  </div>
                </div>

                {/* Calculation Preview */}
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '6px',
                    background: 'var(--bg-main)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '14px',
                    fontSize: '0.85rem'
                  }}
                >
                  <div>
                    <span>Subtotal: <strong>₹{(newProposal.userSeats * newProposal.ratePerSeat + Number(newProposal.implementationFee)).toLocaleString()}</strong></span>
                    <span style={{ margin: '0 8px' }}>&bull;</span>
                    <span>Discount: <strong style={{ color: '#f59e0b' }}>{newProposal.discountPercent}%</strong></span>
                    <span style={{ margin: '0 8px' }}>&bull;</span>
                    <span>GST: <strong>18%</strong></span>
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)' }}>
                    Total Est: ₹
                    {(
                      ((newProposal.userSeats * newProposal.ratePerSeat + Number(newProposal.implementationFee)) *
                        (1 - Number(newProposal.discountPercent) / 100)) *
                      1.18
                    ).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsCreatingProposal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm">
                    Submit Proposal
                  </button>
                </div>
              </form>
            )}

            {/* Proposals List Table */}
            <div className="table-responsive">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Proposal ID & Title</th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Total Value (INR)</th>
                    <th>Discount</th>
                    <th>Status</th>
                    <th>Approval Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {proposalsList.map((prop) => (
                    <tr key={prop.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{prop.title}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{prop.id}</div>
                      </td>
                      <td style={{ fontWeight: 500 }}>{prop.client}</td>
                      <td>
                        <span className="badge" style={{ backgroundColor: 'rgba(6, 182, 212, 0.12)', color: '#06b6d4' }}>
                          {prop.product}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700 }}>₹{prop.totalAmount?.toLocaleString()}</td>
                      <td>
                        <span style={{ fontWeight: 600, color: prop.discountPercent > 0 ? '#f59e0b' : 'var(--text-secondary)' }}>
                          {prop.discountPercent}%
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            prop.status === 'ACCEPTED'
                              ? 'badge-active-pill'
                              : prop.status === 'PENDING_APPROVAL'
                              ? 'badge-waiting'
                              : 'badge-draft'
                          }`}
                        >
                          {prop.status}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: prop.approvalStatus?.includes('APPROVED') ? '#10b981' : '#f59e0b'
                          }}
                        >
                          {prop.approvalStatus}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.72rem', padding: '4px 8px' }}
                          onClick={() => {
                            showNotification(`Proposal ${prop.id} sent via email/WhatsApp to ${prop.client}`);
                            setProposalsList((prev) =>
                              prev.map((p) => (p.id === prop.id ? { ...p, status: 'SENT' } : p))
                            );
                          }}
                        >
                          <Send size={11} style={{ marginRight: '4px' }} />
                          <span>Dispatch</span>
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
          TAB 7: ACTIVITIES & FOLLOW-UPS
          ======================================================== */}
      {activeTab === 'activities' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="crm-card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>
              Activities, Conversation Logs & Scheduled Reminders
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Record calls, meetings, WhatsApp notes, and schedule automated customer follow-ups.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginTop: '16px' }}>
              {[
                {
                  id: 'ACT-101',
                  type: 'CALL',
                  title: 'Discovery Phone Call with Priya Sharma',
                  lead: 'Tech Solutions Inc.',
                  time: 'Today, 10:15 AM',
                  summary: 'Confirmed 500 employees, biometric requirement, and ₹5L annual budget.'
                },
                {
                  id: 'ACT-102',
                  type: 'MEETING',
                  title: 'Demo Walkthrough - HRMS Attendance Module',
                  lead: 'Tech Solutions Inc.',
                  time: 'Yesterday, 04:00 PM',
                  summary: 'Presented live geofenced punch-in and shift planner sandbox.'
                },
                {
                  id: 'ACT-103',
                  type: 'EMAIL',
                  title: 'Dispatched Technical Architecture Whitepaper',
                  lead: 'Apex Infotech (Vikram Mehta)',
                  time: '2 days ago',
                  summary: 'Shared PostgreSQL schema and REST API documentation.'
                }
              ].map((act) => (
                <div
                  key={act.id}
                  style={{
                    padding: '14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-surface)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span
                      className="badge"
                      style={{
                        backgroundColor: act.type === 'CALL' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(59, 130, 246, 0.12)',
                        color: act.type === 'CALL' ? '#10b981' : '#3b82f6',
                        fontWeight: 700,
                        fontSize: '0.7rem'
                      }}
                    >
                      {act.type}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{act.time}</span>
                  </div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9rem', fontWeight: 700 }}>{act.title}</h4>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    Client: <strong>{act.lead}</strong>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-main)', background: 'var(--bg-main)', padding: '6px 8px', borderRadius: '4px' }}>
                    {act.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 8: AI SALES AGENT (Review Answers, Takeover, Drafts)
          ======================================================== */}
      {activeTab === 'ai-agent' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="crm-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                  AI Sales Agent Live Inbound Inquiries
                </h3>
                <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Review leads captured by the AI agent, qualification answers, suggested replies, and take over live chats.
                </p>
              </div>

              <span className="badge badge-active-pill" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="active-green-dot" />
                <span>AI Inbound Bot Online</span>
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                {
                  id: 'AI-INQ-1001',
                  lead: 'Priya Sharma (Tech Solutions Inc.)',
                  channel: 'Website AI Chatbot',
                  fitScore: 94,
                  summary: 'Prospect inquired: "Do you have software for 500 employees payroll and biometric attendance?"',
                  aiQualification: [
                    'Q: Employee Headcount? &rarr; A: 500 full-time staff',
                    'Q: Required Modules? &rarr; A: Statutory Payroll, Biometrics, Leave Management',
                    'Q: Estimated Budget? &rarr; A: ₹5,00,000 annual budget approved',
                    'Q: Purchase Timeline? &rarr; A: Ready to deploy by next month'
                  ],
                  suggestedReply:
                    'Hello Priya! Based on your 500-employee requirement, our Enterprise HRMS & Payroll Cloud suite matches all statutory payroll and biometric sync needs. I have reserved an exclusive demo link for tomorrow 11 AM.',
                  status: 'ASSIGNED_TO_YOU'
                }
              ].map((inq) => (
                <div
                  key={inq.id}
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-surface)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{inq.lead}</h4>
                        <span className="badge" style={{ backgroundColor: 'rgba(6, 182, 212, 0.12)', color: '#06b6d4', fontWeight: 700 }}>
                          Fit Score: {inq.fitScore}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Captured via {inq.channel} &bull; Inquiry ID: {inq.id}
                      </div>
                    </div>

                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        api.handoverConversation('conv-1', 'SALES');
                        showNotification('Live chat transferred to you. Human takeover active!');
                      }}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <UserPlus size={14} />
                      <span>Take Over Conversation</span>
                    </button>
                  </div>

                  {/* AI Qualification Q&A Review */}
                  <div style={{ margin: '12px 0', padding: '10px 12px', borderRadius: '6px', backgroundColor: 'var(--bg-main)' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '6px' }}>
                      AI Qualification Q&amp;A Log:
                    </div>
                    {inq.aiQualification.map((q, idx) => (
                      <div
                        key={idx}
                        dangerouslySetInnerHTML={{ __html: q }}
                        style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '3px' }}
                      />
                    ))}
                  </div>

                  {/* Suggested Reply Box */}
                  <div style={{ padding: '10px 12px', borderRadius: '6px', background: 'rgba(6, 182, 212, 0.05)', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#06b6d4', marginBottom: '4px' }}>
                      Suggested AI Reply Draft (Review Before Dispatching):
                    </div>
                    <p style={{ margin: '0 0 8px 0', fontSize: '0.8rem', color: 'var(--text-main)' }}>
                      "{inq.suggestedReply}"
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                        onClick={() => showNotification('Draft customized and edited.')}
                      >
                        Edit Draft
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                        onClick={() => showNotification('Approved draft sent to prospect via omnichannel chat!')}
                      >
                        Approve &amp; Send
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 10: REPORTS & PERFORMANCE (Target Attainment, Conversion)
          ======================================================== */}
      {activeTab === 'performance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="crm-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                  Personal Sales Performance &amp; Conversion Analytics
                </h3>
                <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Analyze conversion from lead to demo to closed deal, lead source effectiveness, and export reports.
                </p>
              </div>

              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  const repData =
                    'Metric,Target,Achieved,Percentage\nRevenue,3500000,2850000,81.4%\nDeals Closed,8,6,75.0%\nConversion Rate,12.0%,14.2%,118.3%\nDemos Booked,25,31,124.0%';
                  const blob = new Blob([repData], { type: 'text/csv' });
                  const a = document.createElement('a');
                  a.href = URL.createObjectURL(blob);
                  a.download = `Sales_Executive_Performance_Report_${Date.now()}.csv`;
                  a.click();
                  showNotification('Personal Sales Performance CSV Exported.');
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Download size={14} />
                <span>Export Report CSV</span>
              </button>
            </div>

            {/* Performance Grids */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              <div style={{ padding: '16px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '8px' }}>Lead-to-Opportunity Funnel</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
                  <div>Total Inbound Leads: <strong>158</strong> (100%)</div>
                  <div>Qualified Leads: <strong>62</strong> (39.2%)</div>
                  <div>Demos Conducted: <strong>31</strong> (19.6%)</div>
                  <div>Proposals Sent: <strong>18</strong> (11.4%)</div>
                  <div style={{ color: '#10b981', fontWeight: 700 }}>Closed Won: 14 Deals (8.9% overall)</div>
                </div>
              </div>

              <div style={{ padding: '16px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '8px' }}>Lead Source Performance</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
                  <div>Website AI Chat: <strong>84 leads</strong> &bull; 9.5% win rate</div>
                  <div>WhatsApp Inbound: <strong>42 leads</strong> &bull; 12.1% win rate</div>
                  <div>Referrals: <strong>18 leads</strong> &bull; 16.0% win rate</div>
                  <div>Campaigns: <strong>14 leads</strong> &bull; 4.2% win rate</div>
                </div>
              </div>

              <div style={{ padding: '16px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '8px' }}>Win / Loss Root Causes</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
                  <div style={{ color: '#10b981' }}>&bull; Won: Rapid 2-min response + biometrics feature match</div>
                  <div style={{ color: '#10b981' }}>&bull; Won: 5% competitive discount on upfront commitment</div>
                  <div style={{ color: '#ef4444' }}>&bull; Lost: Client preferred SAP on-premise ecosystem</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 11: GUIDED 5-STEP LEAD-TO-SALE INTERACTIVE WALKTHROUGH
          ======================================================== */}
      {activeTab === 'lead-to-sale' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            className="crm-card"
            style={{
              background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(6, 182, 212, 0.12) 100%)',
              borderColor: 'rgba(6, 182, 212, 0.3)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span className="badge badge-active-pill" style={{ marginBottom: '6px' }}>
                  Interactive Guided Flow
                </span>
                <h3 style={{ margin: '4px 0', fontSize: '1.3rem', fontWeight: 800 }}>
                  Realistic Lead-to-Sale Simulation (Tech Solutions Inc.)
                </h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Step-by-step walkthrough from website enquiry to qualified lead, demo booking, commercial proposal, discount gate, and deal won.
                </p>
              </div>

              <button
                className="btn btn-primary"
                onClick={() => runWalkthroughStep(walkthroughStep)}
                disabled={isSimulatingStep}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
              >
                <Play size={15} />
                <span>Execute Step {walkthroughStep} of 5</span>
              </button>
            </div>

            {/* Stepper Wizard Visualizer */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginTop: '20px' }}>
              {[
                { step: 1, title: '1. New Enquiry', desc: 'Customer asks for HRMS (500 seats) & AI captures LEAD-5001', api: 'POST /api/v1/leads' },
                { step: 2, title: '2. Qualify Lead', desc: 'Check budget ₹5L, 500 headcount, timeline. Mark QUALIFIED', api: 'PATCH /api/v1/leads/{id}/stage' },
                { step: 3, title: '3. Schedule Demo', desc: 'Schedule Google Meet demo + prepare sandbox task', api: 'POST /api/v1/appointments' },
                { step: 4, title: '4. Send Proposal', desc: 'Prepare quote with approved pricing + request 5% discount', api: 'POST /api/v1/it/proposals' },
                { step: 5, title: '5. Close Deal WON', desc: 'Customer accepts; approvals complete. Mark deal WON', api: 'PATCH /api/v1/opportunities/{id}/stage' }
              ].map((s) => {
                const isCurrent = walkthroughStep === s.step;
                const isDone = walkthroughStep > s.step;
                return (
                  <div
                    key={s.step}
                    onClick={() => setWalkthroughStep(s.step)}
                    style={{
                      cursor: 'pointer',
                      padding: '12px',
                      borderRadius: '8px',
                      border: isCurrent ? '2px solid #06b6d4' : isDone ? '1px solid #10b981' : '1px solid var(--border)',
                      backgroundColor: isCurrent ? 'rgba(6, 182, 212, 0.15)' : isDone ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-surface)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: isCurrent ? '#06b6d4' : isDone ? '#10b981' : 'var(--text-main)' }}>
                        {s.title}
                      </span>
                      {isDone && <CheckCircle2 size={14} style={{ color: '#10b981' }} />}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      {s.desc}
                    </div>
                    <div style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                      API: {s.api}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Execution Trace Terminal Logs */}
            <div style={{ marginTop: '20px', background: '#0f172a', borderRadius: '8px', padding: '14px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#38bdf8', fontWeight: 700 }}>
                  <Sparkles size={14} />
                  <span>Real-Time Sales API Execution Terminal</span>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Base URL: http://localhost:8080/api/v1</span>
              </div>

              <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#e2e8f0', minHeight: '100px', maxHeight: '200px', overflowY: 'auto' }}>
                {walkthroughLogs.length === 0 ? (
                  <div style={{ color: '#64748b' }}>
                    Click "Execute Step {walkthroughStep} of 5" above to trigger live API flow simulation...
                  </div>
                ) : (
                  walkthroughLogs.map((log, index) => (
                    <div key={index} style={{ marginBottom: '4px', lineHeight: 1.5 }}>
                      <span style={{ color: '#10b981' }}>&gt;&gt;</span> {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
