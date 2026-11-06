// Zenelait AI - Multi-Tenant SaaS Industry Presets & Multi-Company Data Engine

export const PLATFORM_ROLES = [
  {
    id: 'ultra-super-admin',
    name: 'Ultra Super Admin',
    badge: '👑 Root Master God-Mode',
    color: '#d97706',
    description: 'Omnipotent root master with total maintenance control over all companies, global AI engines, cross-tenant database overrides, billing engines, and infrastructure lockdown.',
    permissions: ['Omnipotent Cross-Tenant Control', '1-Click Tenant Impersonation', 'Global AI Fleet Gateway', 'Financial MRR/ARR Engine', 'Infrastructure Lockdown & Backups', 'Universal Quota Master']
  },
  {
    id: 'super-admin',
    name: 'Super Admin',
    badge: 'Zenelait Platform',
    color: '#8b5cf6',
    description: 'Full root access to platform infrastructure, all tenant workspaces, billing engines, and global AI model configurations.',
    permissions: ['All Tenants Control', 'Global AI Models', 'Billing & Invoicing', 'Security & Audit Logs', 'Tenant Provisioning']
  },
  {
    id: 'platform-admin',
    name: 'Platform Admin',
    badge: 'Zenelait Platform',
    color: '#3b82f6',
    description: 'Manages multi-tenant onboarding, platform feature flags, API integrations, and system monitoring.',
    permissions: ['Tenant Onboarding', 'Feature Toggles', 'API Gateway', 'System Health', 'User Management']
  },
  {
    id: 'billing-admin',
    name: 'Billing Admin',
    badge: 'Zenelait Platform',
    color: '#10b981',
    description: 'Oversees SaaS subscriptions, invoice generation, revenue analytics, and tenant payment gateways.',
    permissions: ['Subscription Plans', 'Stripe/Razorpay Gateways', 'MRR & ARR Analytics', 'Refunds & Invoices']
  },
  {
    id: 'support-admin',
    name: 'Support Admin',
    badge: 'Zenelait Platform',
    color: '#f59e0b',
    description: 'Cross-tenant technical support, issue escalation, AI agent debugging, and customer SLA monitoring.',
    permissions: ['Cross-Tenant Support', 'AI Agent Logs', 'Ticket Escalations', 'Knowledge Base Maintenance']
  }
];

export const MVP_ROLES = [
  {
    id: 'ultra-super-admin',
    name: 'Ultra Super Admin',
    shortName: 'Ultra Admin (God Mode)',
    scope: 'Omnipotent Global Master (All Companies)',
    badge: '👑 God Mode Master',
    color: '#d97706',
    icon: 'Crown',
    description: 'Supreme root authority to maintain, configure, and override everything across all subscribed companies: tenant provisioning, live usage quotas, global AI model orchestration, cross-company impersonation, financial engines, and platform security lockdown.',
    responsibilities: [
      'Manage, maintain, and provision all customer companies',
      'Impersonate any company workspace with 1 click',
      'Orchestrate global AI model gateways (GPT-4o, Claude 3.5, Gemini 1.5, Llama 3)',
      'Manage global billing, ARR/MRR revenue, and manual invoice overrides',
      'Emergency platform lockdown, instant database snapshots & audit logs',
      'Configure live usage quotas (seats, storage, AI messages, WhatsApp broadcasts)'
    ],
    boundaries: 'Omnipotent Master Control: Unrestricted cross-tenant root access with full audit trail logging.',
    permissions: ['All Companies Control', '1-Click Tenant Impersonation', 'Global AI Model Orchestrator', 'Universal Usage Quotas', 'Financial Billing Engine', 'Emergency Lockdown & Backups']
  },
  {
    id: 'super-admin',
    name: 'Platform Super Admin',
    shortName: 'Super Admin',
    scope: 'Zenelait Team (Platform-wide)',
    badge: 'Platform Root',
    color: '#8b5cf6',
    icon: 'Crown',
    description: 'Manages the SaaS platform itself, registered companies, usage limits, subscriptions, and platform-wide telemetry. Private company conversations are sealed and audited.',
    responsibilities: [
      'Manage registered companies and subscriptions',
      'Configure usage limits and plans',
      'Monitor platform-wide usage and system health',
      'Manage billing configuration and platform settings',
      'Audited exceptional support access'
    ],
    boundaries: 'Should not routinely read private company conversations. Exceptional support access is logged & audited.',
    permissions: ['Platform Telemetry', 'Tenant Onboarding', 'Global Usage Limits', 'Subscription Plans', 'Audited Support Logs']
  },
  {
    id: 'company-admin',
    name: 'Company Owner / Company Admin',
    shortName: 'Company Admin',
    scope: 'Full Company Administration',
    badge: 'Company Master',
    color: '#2563eb',
    icon: 'Building2',
    description: 'Full company administration, employee invitations, role assignments, AI agents setup, knowledge base management, CRM settings, and billing.',
    responsibilities: [
      'Manage company profile and employees',
      'Invite users and assign roles',
      'Create and configure AI agents',
      'Upload company documents and FAQs',
      'Manage CRM settings, integrations, subscriptions',
      'View company analytics'
    ],
    boundaries: 'Restricted strictly to own tenant workspace.',
    permissions: ['All Workspace Records', 'AI Agent Builder', 'Billing & Plans', 'Team Management', 'Integrations', 'Knowledge Base']
  },
  {
    id: 'sales-manager',
    name: 'Sales Manager',
    shortName: 'Sales Manager',
    scope: 'Sales Operations',
    badge: 'Sales Lead',
    color: '#0284c7',
    icon: 'Target',
    description: 'Sales operations, assigning leads, monitoring sales representatives, reviewing lead qualification scores, configuring sales workflows, and tracking deals & appointments.',
    responsibilities: [
      'View and assign inbound leads to sales reps',
      'Monitor sales rep quotas and performance',
      'Review lead qualification and conversion rates',
      'Configure permitted sales workflows',
      'Track follow-ups, quotations, and appointments'
    ],
    boundaries: 'Cannot alter company subscription billing or edit global AI system architectures.',
    permissions: ['Pipeline Management', 'Lead Reassignment', 'Sales Performance Analytics', 'Deals Approval', 'Follow-up Tracking']
  },
  {
    id: 'sales-rep',
    name: 'Sales Executive',
    shortName: 'Sales Executive',
    scope: 'Lead Management & Deal Closing',
    badge: 'Sales Executive',
    color: '#06b6d4',
    icon: 'UserCheck',
    description: 'Manages assigned leads, accounts, and opportunities, contacts leads, schedules demos, creates proposals, and closes software deals.',
    responsibilities: [
      'View assigned leads, accounts, contacts, and opportunities',
      'Accept leads assigned by the manager or lead-routing rules',
      'View lead source, score, priority, product interest, and conversation history',
      'Contact leads through approved email, WhatsApp, or CRM messaging integrations',
      'Add call notes, activities, and next follow-up dates',
      'Schedule demos and meetings',
      'Create and update opportunities and sales stages',
      'Generate proposals from approved products and pricing',
      'Request discount or quotation approval',
      'View personal sales targets, win rate, and pipeline value',
      'Receive alerts for overdue tasks, demo bookings, and stale deals',
      'Hand off customers to support after a sale'
    ],
    boundaries: 'Cannot modify company-wide settings, access billing, or delete workspace data.',
    permissions: ['Assigned Leads', 'Status Updates', 'Notes & Follow-ups', 'Proposals & Quotations', 'Calendar Bookings', 'Deal Pipelines']
  },
  {
    id: 'support-manager',
    name: 'Support Manager',
    shortName: 'Support Manager',
    scope: 'Support Operations & SLA Control',
    badge: 'Support Lead',
    color: '#f59e0b',
    icon: 'Headphones',
    description: 'Oversees support tickets, team workload, queues, SLA compliance, AI escalations, and customer satisfaction metrics.',
    responsibilities: [
      'View all support tickets and conversations for the tenant',
      'Assign, reassign, prioritize, and escalate tickets',
      'Manage support agents, queues, skills, shifts, and workload',
      'Configure SLA targets by priority and ticket category',
      'Monitor first-response time, resolution time, backlog, and customer satisfaction',
      'Review tickets escalated by AI Support Agent or human agents',
      'Create ticket categories, priority rules, and escalation policies',
      'Approve customer-impacting exceptions, such as eligible service credits',
      'Analyze recurring issues and product defect trends',
      'Review AI responses, handovers, and unresolved knowledge-base questions',
      'Manage internal notes, service announcements, and incident communications',
      'View support performance reports and audit trails'
    ],
    boundaries: 'Cannot modify global billing settings or core platform architectures.',
    permissions: ['Ticket Management', 'Queue & Agent Allocation', 'SLA Configuration', 'Escalations & Approvals', 'Support Analytics']
  },
  {
    id: 'support-agent',
    name: 'Customer Support Agent',
    shortName: 'Support Agent',
    scope: 'Support Operations & Ticket Resolution',
    badge: 'Customer Support',
    color: '#10b981',
    icon: 'Headphones',
    description: 'Support operations, viewing assigned tickets, replying across omnichannel channels, using knowledge base, resolving issues, and escalating cases.',
    responsibilities: [
      'View assigned tickets and customer conversations',
      'Reply to customers through connected channels',
      'View customer profile, subscription, product version, and support history',
      'Create, update, categorize, and resolve tickets',
      'Add private internal notes that customers cannot see',
      'Use approved knowledge-base articles and troubleshooting guides',
      'Request technical-team assistance and escalate tickets',
      'Track SLA deadlines and response reminders',
      'Add attachments and diagnostic details',
      'Record resolution codes and customer feedback',
      'Reopen eligible tickets when customers report unresolved issues',
      'Use AI-suggested responses while retaining responsibility for sending them'
    ],
    boundaries: 'Should not automatically have access to billing administration or company AI agent configuration.',
    permissions: ['Omnichannel Inbox', 'Live AI Takeover', 'Ticket Status Management', 'Internal Notes', 'Knowledge Base Search']
  },
  {
    id: 'marketing-manager',
    name: 'Marketing Manager',
    shortName: 'Marketing Manager',
    scope: 'Campaigns & Lead Acquisition',
    badge: 'Marketing Lead',
    color: '#ec4899',
    icon: 'Target',
    description: 'Manages marketing campaigns, landing pages, lead attribution, email nurture sequences, and marketing-qualified lead routing.',
    responsibilities: [
      'Create and manage marketing campaigns',
      'Capture leads from website forms, landing pages, webinars, and permitted ad integrations',
      'Manage lead sources, UTM parameters, and campaign attribution',
      'Create email campaigns and approved nurture sequences',
      'Segment contacts by industry, product interest, company size, and consent',
      'Build and manage landing pages and enquiry forms',
      'Score marketing-qualified leads and define qualification criteria',
      'Route qualified leads to Sales Executives',
      'Suppress unsubscribed contacts and maintain consent records',
      'Track impressions, clicks, conversions, cost per lead, and campaign ROI where data is available',
      'Run A/B tests on approved content',
      'Monitor lead-to-demo and demo-to-opportunity conversion',
      'Coordinate with the Sales Manager on campaign quality and lead acceptance'
    ],
    boundaries: 'Cannot modify core sales pipeline quotas or access private support ticket details without authorization.',
    permissions: ['Campaign Management', 'Lead Scoring & Routing', 'Form & Landing Page Builder', 'Attribution Analytics', 'Email Nurtures']
  },
  {
    id: 'analyst-viewer',
    name: 'Analyst / Viewer',
    shortName: 'Analyst',
    scope: 'Read-only Access & BI Analytics',
    badge: 'BI Analyst',
    color: '#64748b',
    icon: 'Eye',
    description: 'Consolidated sales, marketing, and support KPIs, conversion trends, ticket SLA compliance, AI performance, and business intelligence exports.',
    responsibilities: [
      'View consolidated sales, marketing, and support KPIs',
      'Analyze lead sources, qualification rates, and sales conversion',
      'Track pipeline value, win rate, average deal size, and forecast accuracy',
      'Compare performance by team, product, campaign, and date range',
      'Analyze ticket volume, resolution time, SLA compliance, and CSAT',
      'Measure AI agent containment, escalation, and resolution rates',
      'Create saved reports and scheduled report deliveries',
      'Export permitted data to CSV or Excel',
      'Analyze product demand, lost deals, churn signals, and recurring support issues',
      'Compare actual performance with targets',
      'Drill down from a chart into authorized underlying records',
      'Track data freshness and report-generation failures'
    ],
    boundaries: 'Cannot modify records, add leads, or configure AI agents by default (Read-Only Mode).',
    permissions: ['Read-Only Dashboards', 'Conversion Analytics', 'BI Reports', 'CSV/Excel Export', 'KPI Drill-down']
  },
  {
    id: 'hr-role',
    name: 'HR Role',
    shortName: 'HR Executive',
    scope: 'HR Operations & Employee Lifecycle',
    badge: 'Human Resources',
    color: '#a855f7',
    icon: 'Users',
    description: 'Manages employee records, recruitment ATS, onboarding checklists, leave requests and attendance, HR service enquiries, documents, and HR-related AI automation.',
    responsibilities: [
      'Manage employee records and directory (e.g. EMP-1001)',
      'Track recruitment, job openings, and candidate stages (CAN-1001 Meena Raj)',
      'Manage employee onboarding tasks and offboarding checklists (ONB-1001)',
      'Review and approve/reject leave requests and attendance corrections (LVR-1001)',
      'Manage HR document templates, policies, and generate employee letters',
      'Resolve HR service requests and enquiries (HRR-1001)',
      'Supervise HR AI Assistant and run HR onboarding/leave workflows'
    ],
    boundaries: 'Cannot modify tenant-wide security, platform billing, or company AI agent master configurations.',
    permissions: ['Employee Directory', 'Recruitment ATS', 'Onboarding Checklists', 'Leave Approvals', 'HR Documents', 'HR Helpdesk', 'HR AI Assistant']
  },
  {
    id: 'reception-manager',
    name: 'Reception Manager',
    shortName: 'Reception Manager',
    scope: 'Hospital / Clinic — Reception & Front Desk Operations',
    badge: 'Reception Lead',
    color: '#0284c7',
    icon: 'Shield',
    description: 'Manages reception staff, daily appointment operations, patient enquiries, queue triage, supervisory escalations, and reception operational performance.',
    responsibilities: [
      'Supervise reception staff and manage roster assignments',
      'Oversee front-desk patient registration and enquiry handling',
      'Monitor real-time waiting queue and administrative wait times',
      'Resolve administrative escalations and supervise priority triage',
      'Configure AI reception settings within approved clinic boundaries',
      'Review operational performance reports and audit logs'
    ],
    boundaries: 'Administrative workflows only. Must not access clinical notes or decide medical urgency.',
    permissions: ['RECEPTION_DASHBOARD_VIEW', 'RECEPTION_STAFF_VIEW', 'PATIENT_ENQUIRIES_VIEW', 'RECEPTION_QUEUE_VIEW', 'RECEPTION_ESCALATIONS_VIEW', 'RECEPTION_AI_CONFIG_VIEW', 'RECEPTION_REPORTS_VIEW', 'RECEPTION_AUDIT_VIEW']
  },
  {
    id: 'receptionist',
    name: 'Receptionist',
    shortName: 'Receptionist',
    scope: 'Hospital / Clinic — Front Desk Desk Operations',
    badge: 'Front Desk Operator',
    color: '#059669',
    icon: 'UserCheck',
    description: 'Registers patients, checks in appointments, registers walk-ins, submits rescheduling requests, handles enquiries, and manages front-desk checklists.',
    responsibilities: [
      'Register patients with duplicate detection and consent checks',
      'Check in scheduled patients arriving at reception',
      'Register walk-in patients into the administrative queue',
      'Submit appointment rescheduling and cancellation requests',
      'Record administrative notes and transfer enquiries to scheduling',
      'Complete daily reception checklist tasks'
    ],
    boundaries: 'No access to staff management, AI configuration, or clinical records.',
    permissions: ['RECEPTIONIST_DASHBOARD_VIEW', 'PATIENT_SEARCH', 'PATIENT_REGISTER', 'APPOINTMENTS_TODAY_VIEW', 'APPOINTMENT_CHECK_IN', 'RECEPTION_QUEUE_VIEW', 'PATIENT_ENQUIRIES_CREATE', 'RECEPTION_TASKS_VIEW']
  },
  {
    id: 'customer-support',
    name: 'Customer Support',
    shortName: 'Customer Support',
    scope: 'Hospital / Clinic — Patient Service & Omnichannel Support',
    badge: 'Support Desk',
    color: '#7c3aed',
    icon: 'Headphones',
    description: 'Handles patient inquiries, complaints, service requests, and follow-ups across website chat, WhatsApp, and email, with AI reply draft review.',
    responsibilities: [
      'Handle support tickets across omnichannel channels',
      'Review and approve AI-generated reply drafts using approved knowledge',
      'Record internal administrative notes separated from public replies',
      'Escalate complex cases and transfer to Appointment Coordination',
      'Search approved clinic knowledge-base articles',
      'Manage follow-up tasks and track customer support metrics'
    ],
    boundaries: 'AI must not diagnose or prescribe; potential emergencies routed to ER protocol.',
    permissions: ['SUPPORT_DASHBOARD_VIEW', 'SUPPORT_TICKETS_VIEW', 'SUPPORT_MESSAGES_SEND', 'SUPPORT_INTERNAL_NOTES_CREATE', 'SUPPORT_AI_DRAFT_APPROVE', 'SUPPORT_ESCALATIONS_CREATE', 'SUPPORT_METRICS_VIEW']
  },
  {
    id: 'appointment-coordinator',
    name: 'Appointment Coordinator',
    shortName: 'Appointment Coordinator',
    scope: 'Hospital / Clinic — Scheduling & Doctor Availability',
    badge: 'Scheduling Lead',
    color: '#0d9488',
    icon: 'Calendar',
    description: 'Manages doctor schedules, slot availability, booking requests, rescheduling, cancellations, waiting lists, and automated appointment reminders.',
    responsibilities: [
      'Inspect real-time doctor availability and book appointment slots',
      'Review and approve/reject booking, rescheduling, and cancellation requests',
      'Manage patient waiting lists and issue timed slot offers',
      'Schedule automated SMS/WhatsApp appointment reminders',
      'Invalidate obsolete reminders upon appointment changes',
      'Track scheduling metrics, no-show rates, and reminder delivery stats'
    ],
    boundaries: 'Enforces slot concurrency and clinic booking policies.',
    permissions: ['APPOINTMENT_DASHBOARD_VIEW', 'DOCTORS_VIEW', 'DOCTOR_AVAILABILITY_VIEW', 'APPOINTMENTS_VIEW', 'APPOINTMENTS_CREATE', 'APPOINTMENTS_CONFIRM', 'BOOKING_REQUESTS_APPROVE', 'WAITING_LIST_MANAGE', 'APPOINTMENT_REMINDERS_MANAGE']
  }
];

export const INDUSTRY_PRESETS = {
  software_it: {
    id: 'software_it',
    name: 'Software / IT Company',
    shortName: 'Software / IT Company',
    category: 'Technology',
    icon: 'Code2',
    color: '#3b82f6',
    accentLight: 'rgba(59, 130, 246, 0.12)',
    tagline: 'We build innovative software solutions for businesses worldwide.',
    description: 'Automates inbound SaaS trial conversions, technical RFPs, product demos, API rate limit queries, and 24/7 technical support.',
    defaultCompanyName: 'ABC Technologies',
    domain: 'abctechnologies.com',
    humanRoles: [
      { id: 'role-1', name: 'Company Admin', dept: 'Admin', count: 1, access: 'Full Workspace Access', color: '#8b5cf6' },
      { id: 'role-2', name: 'Sales Manager', dept: 'Sales', count: 2, access: 'Pipeline & Deals Approval', color: '#3b82f6' },
      {
        id: 'role-3',
        name: 'Sales Executive',
        dept: 'Sales',
        count: 4,
        access: 'Lead Demos & Quotations',
        color: '#06b6d4',
        features: [
          'View assigned leads, accounts, contacts, and opportunities.',
          'Accept leads assigned by the manager or lead-routing rules.',
          'View lead source, score, priority, product interest, and conversation history.',
          'Contact leads through approved email, WhatsApp, or CRM messaging integrations.',
          'Add call notes, activities, and next follow-up dates.',
          'Schedule demos and meetings.',
          'Create and update opportunities and sales stages.',
          'Generate proposals from approved products and pricing.',
          'Request discount or quotation approval.',
          'View personal sales targets, win rate, and pipeline value.',
          'Receive alerts for overdue tasks, demo bookings, and stale deals.',
          'Hand off customers to support after a sale.'
        ]
      },
      {
        id: 'role-4',
        name: 'Support Manager',
        dept: 'Support',
        count: 1,
        access: 'Escalations & SLA Management',
        color: '#f59e0b',
        features: [
          'View all support tickets and conversations for the tenant.',
          'Assign, reassign, prioritize, and escalate tickets.',
          'Manage support agents, queues, skills, shifts, and workload.',
          'Configure SLA targets by priority and ticket category.',
          'Monitor first-response time, resolution time, backlog, and customer satisfaction.',
          'Review tickets escalated by AI Support Agent or human agents.',
          'Create ticket categories, priority rules, and escalation policies.',
          'Approve customer-impacting exceptions, such as eligible service credits.',
          'Analyze recurring issues and product defect trends.',
          'Review AI responses, handovers, and unresolved knowledge-base questions.',
          'Manage internal notes, service announcements, and incident communications.',
          'View support performance reports and audit trails.'
        ]
      },
      {
        id: 'role-5',
        name: 'Support Agent',
        dept: 'Support',
        count: 3,
        access: 'Ticket Resolution & Docs',
        color: '#10b981',
        features: [
          'View assigned tickets and customer conversations.',
          'Reply to customers through connected channels.',
          'View customer profile, subscription, product version, and support history.',
          'Create, update, categorize, and resolve tickets.',
          'Add private internal notes that customers cannot see.',
          'Use approved knowledge-base articles and troubleshooting guides.',
          'Request technical-team assistance and escalate tickets.',
          'Track SLA deadlines and response reminders.',
          'Add attachments and diagnostic details.',
          'Record resolution codes and customer feedback.',
          'Reopen eligible tickets when customers report unresolved issues.',
          'Use AI-suggested responses while retaining responsibility for sending them.'
        ]
      },
      {
        id: 'role-6',
        name: 'Marketing Manager',
        dept: 'Marketing',
        count: 1,
        access: 'Campaigns & Lead Attribution',
        color: '#ec4899',
        features: [
          'Create and manage marketing campaigns.',
          'Capture leads from website forms, landing pages, webinars, and permitted ad integrations.',
          'Manage lead sources, UTM parameters, and campaign attribution.',
          'Create email campaigns and approved nurture sequences.',
          'Segment contacts by industry, product interest, company size, and consent.',
          'Build and manage landing pages and enquiry forms.',
          'Score marketing-qualified leads and define qualification criteria.',
          'Route qualified leads to Sales Executives.',
          'Suppress unsubscribed contacts and maintain consent records.',
          'Track impressions, clicks, conversions, cost per lead, and campaign ROI where data is available.',
          'Run A/B tests on approved content.',
          'Monitor lead-to-demo and demo-to-opportunity conversion.',
          'Coordinate with the Sales Manager on campaign quality and lead acceptance.'
        ]
      },
      {
        id: 'role-7',
        name: 'Analyst',
        dept: 'Marketing',
        count: 1,
        access: 'BI Reports & Conversion Metrics',
        color: '#64748b',
        features: [
          'View consolidated sales, marketing, and support KPIs.',
          'Analyze lead sources, qualification rates, and sales conversion.',
          'Track pipeline value, win rate, average deal size, and forecast accuracy.',
          'Compare performance by team, product, campaign, and date range.',
          'Analyze ticket volume, resolution time, SLA compliance, and CSAT.',
          'Measure AI agent containment, escalation, and resolution rates.',
          'Create saved reports and scheduled report deliveries.',
          'Export permitted data to CSV or Excel.',
          'Analyze product demand, lost deals, churn signals, and recurring support issues.',
          'Compare actual performance with targets.',
          'Drill down from a chart into authorized underlying records.',
          'Track data freshness and report-generation failures.'
        ]
      },
    ],
    aiEmployees: [
      {
        id: 'ai-it-1',
        name: 'AI Sales Agent',
        avatar: '🤖',
        role: 'Inbound Qualification & Demo Booking',
        description: 'Qualifies SaaS enquiries, identifies HRMS/LMS/ERP/CRM product requirements, calculates lead score, offers demo slots, and prepares handover notes.',
        channels: ['Website', 'WhatsApp', 'Email'],
        accuracy: '98%',
        handledCount: '1,420 conversations',
        status: 'Active',
        capabilities: ['Tech Stack Detection', 'Budget Qualification', 'Calendar Sync', 'CRM Lead Enrichment', 'HRMS/LMS/ERP/CRM Discovery'],
        features: [
          'Respond to sales enquiries using approved product information.',
          'Ask qualifying questions about business needs, employee count, budget, and timeline.',
          'Identify the requested product: HRMS, LMS, ERP, CRM, or custom development.',
          'Create or update leads after validating the required information.',
          'Calculate a lead score using configured, explainable rules.',
          'Detect duplicate leads and attach conversations to the correct record when safe.',
          'Recommend a product or request additional information.',
          'Offer demo slots based on real calendar availability.',
          'Prepare draft proposals from approved pricing and templates.',
          'Summarize conversations and prepare handover notes.',
          'Recommend the next action to a Sales Executive.',
          'Escalate high-value, complex, or uncertain enquiries to a human.',
          'Track qualification, conversion, response quality, and handover metrics.'
        ]
      },
      {
        id: 'ai-it-2',
        name: 'AI Support Agent',
        avatar: '⚡',
        role: 'Technical L1/L2 Support & API Docs',
        description: 'Answers HRMS, LMS, ERP, and CRM product questions, searches verified documentation, triages tickets, detects frustrated customers, and manages escalations.',
        channels: ['Website', 'Instagram', 'Email'],
        accuracy: '96%',
        handledCount: '2,890 tickets',
        status: 'Active',
        capabilities: ['API Doc Search', 'Code Snippet Gen', 'Webhook Debugger', 'Ticket Triage', 'HRMS/LMS/ERP/CRM Knowledge Search'],
        features: [
          'Answer HRMS, LMS, ERP, and CRM product questions.',
          'Search approved FAQs, documentation, release notes, and troubleshooting guides.',
          'Classify incoming enquiries by issue type, urgency, and product.',
          'Create support tickets from conversations.',
          'Suggest troubleshooting steps based on verified documentation.',
          'Retrieve permitted subscription and ticket-status information.',
          'Detect frustrated customers and potential high-impact incidents.',
          'Escalate unresolved questions to human support.',
          'Summarize the issue and include troubleshooting already attempted.',
          'Detect missing or outdated knowledge articles.',
          'Support website chat and other configured channels.',
          'Measure resolution rate, answer quality, and human-handover rate.'
        ]
      },
      {
        id: 'ai-it-3',
        name: 'AI Follow-up Agent',
        avatar: '🎯',
        role: 'Trial Drip & POC Re-engagement',
        description: 'Automates personalized multi-step follow-ups after demos, stops sequences on reply, enforces quiet hours and limits, and re-engages dormant leads.',
        channels: ['WhatsApp', 'Email', 'SMS'],
        accuracy: '94%',
        handledCount: '840 drips sent',
        status: 'Active',
        capabilities: ['POC Health Checks', 'No-Show Recovery', 'Feature Announcement Drips', 'Quiet Hours Compliance', 'Multi-Step Sequences'],
        features: [
          'Detect leads with no response after a demo or sales conversation.',
          'Schedule follow-up tasks and reminders.',
          'Send approved email or messaging templates through connected channels.',
          'Personalize messages using verified CRM information.',
          'Create multi-step follow-up sequences with configurable delays.',
          'Stop sequences when a prospect replies, opts out, books a demo, or becomes a customer.',
          'Avoid duplicate messages and respect quiet hours and frequency limits.',
          'Retry transient delivery failures safely.',
          'Notify the Sales Executive when human intervention is needed.',
          'Generate follow-up summaries and suggest next actions.',
          'Re-engage eligible dormant leads.',
          'Track sent, delivered, replied, bounced, and opted-out messages.'
        ]
      },
      {
        id: 'ai-it-4',
        name: 'Appointment Agent',
        avatar: '📅',
        role: 'Calendar Sync & Meeting Booking',
        description: 'Handling 3 conversations, demo booking, meeting links, and rescheduling.',
        channels: ['Website', 'WhatsApp', 'Google Meet'],
        accuracy: '99%',
        handledCount: '920 meetings',
        status: 'Active',
        capabilities: ['Calendar Sync', 'Time Zone Conversion', 'Google Meet Link Gen']
      }
    ],
    workflowStages: [
      { step: 1, title: 'Website Enquiry', actor: 'Visitor / Prospect', desc: 'Inbound enquiry via website bot, WhatsApp or tech docs', type: 'inbound' },
      { step: 2, title: 'AI Sales Agent', actor: 'AI Agent', desc: 'Instant 24/7 engagement & conversational discovery', type: 'ai' },
      { step: 3, title: 'Requirement Collection', actor: 'AI Agent', desc: 'Collects user seats, cloud environment, budget & timelines', type: 'ai' },
      { step: 4, title: 'Lead Qualification', actor: 'AI Scoring Engine', desc: 'Computes fit score (0-100) & checks BANT criteria', type: 'ai' },
      { step: 5, title: 'Sales Manager', actor: 'Human Manager', desc: 'Auto-assigns qualified lead to senior SDR/AE', type: 'human' },
      { step: 6, title: 'Sales Executive', actor: 'Human AE', desc: 'Conducts deep-dive technical architecture review', type: 'human' },
      { step: 7, title: 'Demo', actor: 'Human AE', desc: 'Executes live interactive software demonstration', type: 'human' },
      { step: 8, title: 'Quotation', actor: 'Sales Manager', desc: 'Generates customized enterprise SLA & pricing proposal', type: 'human' },
      { step: 9, title: 'Deal Won', actor: 'Executive', desc: 'Digital contract signoff & automated customer onboarding', type: 'closed' }
    ],
    simulation: {
      title: 'IT Enterprise SaaS Qualification Simulation',
      sampleQuery: 'Hi, we have 120 engineers and want to know your Enterprise pricing and AWS VPC deployment options.',
      extractedEntities: {
        companySize: '120 Engineers',
        deploymentType: 'AWS VPC / Self-Hosted',
        intent: 'Enterprise Plan Pricing & Architecture Review',
        leadScore: 94,
        routingTarget: 'Sales Executive (Cloud Solutions)'
      },
      aiResponse: 'Hello! Our Enterprise plan is built specifically for 100+ engineering teams and supports dedicated AWS VPC deployment with single-tenant isolation, 99.99% SLA, and SOC2 Type II compliance. Would you like me to book a 20-minute architecture review with Rahul Kumar (Sales Executive)?'
    }
  },

  real_estate: {
    id: 'real_estate',
    name: 'Real Estate Companies',
    shortName: 'Real Estate & Properties',
    category: 'Property & Construction',
    icon: 'Building2',
    color: '#10b981',
    accentLight: 'rgba(16, 185, 129, 0.12)',
    tagline: 'Residential Communities, Luxury Villas & Commercial Realty',
    description: 'Instantly captures property requirements, parses BHK/budget/location preferences, shares digital floor plans, and books site visits.',
    defaultCompanyName: 'Prestige Skyline Developers',
    domain: 'skylineproperties.in',
    humanRoles: [
      { id: 'role-re-1', name: 'Company Admin', dept: 'Executive', count: 1, access: 'Full Realty Workspace', color: '#8b5cf6' },
      { id: 'role-re-2', name: 'Sales Manager', dept: 'Sales', count: 2, access: 'Inventory & Deals Approval', color: '#10b981' },
      { id: 'role-re-3', name: 'Property Sales Executive', dept: 'Sales', count: 6, access: 'Site Visits & Negotiations', color: '#06b6d4' },
      { id: 'role-re-4', name: 'Customer Relationship Manager', dept: 'CRM', count: 2, access: 'Buyer Onboarding & Loan Docs', color: '#f59e0b' },
      { id: 'role-re-5', name: 'Site Visit Coordinator', dept: 'Operations', count: 3, access: 'Cab Dispatch & Site Passes', color: '#3b82f6' },
      { id: 'role-re-6', name: 'Support Agent', dept: 'Support', count: 2, access: 'Possession Queries & Maintenance', color: '#64748b' }
    ],
    aiEmployees: [
      {
        id: 'ai-re-1',
        name: 'AI Property Sales Agent',
        avatar: '🏡',
        role: 'Property Matchmaker & Requirement Extractor',
        description: 'Understands complex property queries (BHK, carpet area, budget, amenities, ready-to-move vs under-construction) and recommends matching units.',
        channels: ['WhatsApp', 'Website', 'Instagram'],
        accuracy: '99.1%',
        handledCount: '3,210 buyers',
        status: 'Active',
        capabilities: ['BHK & Budget Parsing', 'Floor Plan PDF Delivery', 'Locality Insights', 'Price Calculation']
      },
      {
        id: 'ai-re-2',
        name: 'AI Appointment Agent',
        avatar: '📅',
        role: 'Site Visit Booking & Cab Coordinator',
        description: 'Schedules on-site project walkthroughs, confirms visitor slots, syncs with Site Visit Coordinator, and dispatches Google Maps directions.',
        channels: ['WhatsApp', 'SMS', 'Phone Bot'],
        accuracy: '97.4%',
        handledCount: '920 visits booked',
        status: 'Active',
        capabilities: ['Weekend Slot Allotment', 'Directions & Site Pass Dispatch', 'Reminder Broadcast']
      },
      {
        id: 'ai-re-3',
        name: 'AI Follow-up Agent',
        avatar: '🔔',
        role: 'Post-Visit Feedback & Price Drop Alerts',
        description: 'Follows up within 2 hours after site visits, captures buyer sentiment, triggers home loan pre-checks, and shares limited-period developer discounts.',
        channels: ['WhatsApp', 'Email'],
        accuracy: '96.0%',
        handledCount: '1,150 follow-ups',
        status: 'Active',
        capabilities: ['Post-Visit Feedback', 'Home Loan Assistance Trigger', 'Festive Offer Drips']
      }
    ],
    workflowStages: [
      { step: 1, title: 'Property Enquiry', actor: 'Buyer', desc: 'Customer asks: "I need a 2BHK under ₹60 lakh in Chennai"', type: 'inbound' },
      { step: 2, title: 'AI Property Agent', actor: 'AI Agent', desc: 'Extracts Budget (₹60L), Type (2BHK), Location (OMR Chennai), Timeline (3 mos)', type: 'ai' },
      { step: 3, title: 'Qualified Lead', actor: 'AI Engine', desc: 'Flags as High Intent Buyer (Score: 92) and locks requirements', type: 'ai' },
      { step: 4, title: 'Property Recommendation', actor: 'AI Agent', desc: 'Sends digital brochure, 3D virtual tour & price breakdown over WhatsApp', type: 'ai' },
      { step: 5, title: 'Site Visit Scheduled', actor: 'AI Appointment Agent', desc: 'Books Saturday 11:00 AM site tour + generates visitor gate pass', type: 'ai' },
      { step: 6, title: 'Site Visit Coordinator', actor: 'Human Staff', desc: 'Prepares sample apartment model & assigns dedicated tour guide', type: 'human' },
      { step: 7, title: 'Property Sales Exec', actor: 'Human Sales Rep', desc: 'Conducts in-person negotiation, parking allotment & payment schedule', type: 'human' },
      { step: 8, title: 'Booking Token / Deal', actor: 'Sales Manager', desc: 'Token advance received, unit blocked in inventory & CRM marked Won', type: 'closed' }
    ],
    simulation: {
      title: 'Real Estate 2BHK Property Match & Site Visit Booking',
      sampleQuery: 'I need a 2BHK under ₹60 lakh in Chennai with car parking, ready to move in 3 months.',
      extractedEntities: {
        budget: '₹60 Lakhs',
        propertyType: '2 BHK Luxury Apartment',
        location: 'Chennai (OMR / Medavakkam corridor)',
        timeline: 'Within 3 Months (Ready to Move)',
        amenities: 'Covered Car Parking, Clubhouse, 24/7 Security',
        leadScore: 95
      },
      aiResponse: 'Found 2 matching properties! Skyline Meadows (Tower B - 2BHK, 1,085 sq.ft at ₹58.5 Lakhs) with ready possession in 60 days. Shall I send you the floor plan on WhatsApp and book your Saturday 11:00 AM Site Visit with free pickup?'
    }
  },

  education: {
    id: 'education',
    name: 'Education / Training Companies',
    shortName: 'Education & EdTech',
    category: 'Education & Coaching',
    icon: 'GraduationCap',
    color: '#8b5cf6',
    accentLight: 'rgba(139, 92, 246, 0.12)',
    tagline: 'EdTech Bootcamps, Universities, Certifications & Coaching',
    description: 'Answers curriculum & fee structure queries, collects student background, evaluates eligibility, and books counsellor 1-on-1 demo classes.',
    defaultCompanyName: 'Apex Coding Academy & EdTech',
    domain: 'apexacademy.edu',
    humanRoles: [
      { id: 'role-edu-1', name: 'Admin', dept: 'Executive', count: 1, access: 'Full Academy Workspace', color: '#8b5cf6' },
      { id: 'role-edu-2', name: 'Admission Manager', dept: 'Admissions', count: 2, access: 'Batch Allocation & Fee Approvals', color: '#3b82f6' },
      { id: 'role-edu-3', name: 'Admission Executive', dept: 'Admissions', count: 5, access: 'Counseling & Enrollment Calls', color: '#06b6d4' },
      { id: 'role-edu-4', name: 'Counsellor', dept: 'Student Success', count: 3, access: 'Career Guidance & Skill Assessment', color: '#ec4899' },
      { id: 'role-edu-5', name: 'Student Support Agent', dept: 'Support', count: 2, access: 'LMS Access & Certification Inquiries', color: '#10b981' }
    ],
    aiEmployees: [
      {
        id: 'ai-edu-1',
        name: 'AI Admission Agent',
        avatar: '🎓',
        role: 'Course Advisor & Syllabus Guide',
        description: 'Answers course fees, placement records, syllabus breakdown, weekend vs weekday batches, and collects candidate graduation status.',
        channels: ['Website', 'WhatsApp', 'Instagram'],
        accuracy: '98.9%',
        handledCount: '4,150 student inquiries',
        status: 'Active',
        capabilities: ['Syllabus PDF Delivery', 'Fee Installment Calculator', 'Placement Stats FAQ', 'Eligibility Screening']
      },
      {
        id: 'ai-edu-2',
        name: 'AI Follow-up Agent',
        avatar: '📚',
        role: 'Webinar Invites & Batch Deadline Reminders',
        description: 'Sends automated reminders for free live masterclasses, early-bird scholarship deadlines, and EMI loan pre-approvals.',
        channels: ['WhatsApp', 'Email', 'SMS'],
        accuracy: '96.5%',
        handledCount: '1,980 reminders',
        status: 'Active',
        capabilities: ['Demo Class Reminder', 'Scholarship Countdown', 'No-Cost EMI Assistance']
      }
    ],
    workflowStages: [
      { step: 1, title: 'Course Enquiry', actor: 'Student / Parent', desc: 'Enquires: "What is the Java Full Stack course fee & duration?"', type: 'inbound' },
      { step: 2, title: 'AI Admission Agent', actor: 'AI Agent', desc: 'Answers fee (₹45,000 / ₹4,500 EMI), 16-week curriculum & 100% placement stats', type: 'ai' },
      { step: 3, title: 'Student Profile Capture', actor: 'AI Agent', desc: 'Collects educational qualification, graduation year & preferred timing', type: 'ai' },
      { step: 4, title: 'Free Demo Class Booked', actor: 'AI Agent', desc: 'Reserves seat for upcoming Saturday Live Coding Masterclass', type: 'ai' },
      { step: 5, title: 'Admission Manager', actor: 'Human Staff', desc: 'Reviews scholarship eligibility & allocates to Career Counsellor', type: 'human' },
      { step: 6, title: 'Counsellor / Executive', actor: 'Human Staff', desc: '1-on-1 counseling call, portfolio walkthrough & doubt clearing', type: 'human' },
      { step: 7, title: 'Fee Payment / Enrollment', actor: 'Student & Admin', desc: 'Seat confirmation via payment link & instant LMS onboarding', type: 'closed' }
    ],
    simulation: {
      title: 'EdTech Course Fee & Syllabus Qualification',
      sampleQuery: 'What is the Java Full Stack course fee, duration, and do you provide weekend classes with placement support?',
      extractedEntities: {
        interestedCourse: 'Java Full Stack Development',
        batchPreference: 'Weekend Batch (Saturday & Sunday)',
        feeTier: '₹45,000 (or No-Cost EMI @ ₹4,500/mo)',
        placementAssistance: 'Yes (100+ Hiring Partners)',
        leadScore: 91
      },
      aiResponse: 'Our Java Full Stack Master program is 16 weeks (Weekend: Sat & Sun 10 AM - 2 PM). The fee is ₹45,000 with 0% interest EMI options at ₹4,500/month. We have a 94% placement record with top MNCs. Would you like me to send the complete syllabus PDF on WhatsApp and book your free trial class seat?'
    }
  },

  hospitals: {
    id: 'hospitals',
    name: 'Hospitals / Clinics',
    shortName: 'Healthcare & Clinics',
    category: 'Healthcare & Medicine',
    icon: 'HeartPulse',
    color: '#ef4444',
    accentLight: 'rgba(239, 68, 68, 0.12)',
    tagline: 'Multi-Speciality Hospitals, Diagnostic Centers & Dental Clinics',
    description: 'Triage patient symptoms, routes to matching medical departments, checks doctor OPD schedules, books appointments, and syncs with reception.',
    defaultCompanyName: 'Apollo Zenith Multi-Speciality Clinic',
    domain: 'zenithhealth.org',
    humanRoles: [
      { id: 'role-hosp-1', name: 'Hospital Admin', dept: 'Executive', count: 1, access: 'Hospital Master Config', color: '#8b5cf6' },
      { id: 'role-hosp-2', name: 'Reception Manager', dept: 'Front Desk', count: 2, access: 'Queue Management & Patient Check-in', color: '#ef4444' },
      { id: 'role-hosp-3', name: 'Receptionist', dept: 'Front Desk', count: 4, access: 'Desk Registration & Token Generation', color: '#f59e0b' },
      { id: 'role-hosp-4', name: 'Appointment Coordinator', dept: 'OPD Services', count: 3, access: 'Doctor Schedules & Rescheduling', color: '#3b82f6' },
      { id: 'role-hosp-5', name: 'Doctor / Staff User', dept: 'Clinical', count: 8, access: 'Patient History & Prescription Notes', color: '#10b981' },
      { id: 'role-hosp-6', name: 'Customer Support', dept: 'Support', count: 2, access: 'Insurance & Lab Report Queries', color: '#64748b' }
    ],
    aiEmployees: [
      {
        id: 'ai-hosp-1',
        name: 'AI Receptionist',
        avatar: '👩‍⚕️',
        role: 'Patient Triage & Department Router',
        description: 'Listens to patient symptoms, determines appropriate clinical department (Cardiology, Ortho, Dermatology, Pediatrics), and checks emergency red flags.',
        channels: ['Phone Bot', 'WhatsApp', 'Website'],
        accuracy: '99.4%',
        handledCount: '5,820 patient queries',
        status: 'Active',
        capabilities: ['Symptom Triage', 'Emergency Detection', 'Department Mapping', 'Insurance Empanelment FAQ']
      },
      {
        id: 'ai-hosp-2',
        name: 'AI Appointment Agent',
        avatar: '🏥',
        role: 'Doctor Slot Booking & Fast Check-in',
        description: 'Checks real-time doctor availability across OPD consultation chambers, locks appointment time, and issues digital QR token.',
        channels: ['WhatsApp', 'SMS'],
        accuracy: '98.7%',
        handledCount: '3,410 appointments',
        status: 'Active',
        capabilities: ['Doctor Schedule Sync', 'Digital Token Gen', 'Lab Fast-Track Pass', 'Consultation Reminders']
      }
    ],
    workflowStages: [
      { step: 1, title: 'Patient Enquiry', actor: 'Patient / Family', desc: 'Patient messages: "I have recurring knee pain and need a specialist today"', type: 'inbound' },
      { step: 2, title: 'AI Receptionist', actor: 'AI Agent', desc: 'Triages symptoms, flags non-emergency, and identifies Orthopedics Department', type: 'ai' },
      { step: 3, title: 'Department & Doctor Match', actor: 'AI Agent', desc: 'Recommends Dr. Suresh Iyer (Sr. Orthopedic Surgeon, OPD Chamber 4)', type: 'ai' },
      { step: 4, title: 'Doctor Availability Check', actor: 'AI Agent', desc: 'Finds open slot: Today at 04:30 PM (Consultation Fee: ₹800)', type: 'ai' },
      { step: 5, title: 'Appointment Confirmed', actor: 'AI Agent', desc: 'Generates digital appointment pass #HOSP-9421 & sends WhatsApp directions', type: 'ai' },
      { step: 6, title: 'Reception Manager / Desk', actor: 'Human Receptionist', desc: 'Fast QR check-in upon arrival & issue physical patient file', type: 'human' },
      { step: 7, title: 'Doctor Consultation', actor: 'Doctor User', desc: 'In-person diagnosis, X-Ray prescription & digital prescription upload', type: 'closed' }
    ],
    simulation: {
      title: 'Hospital OPD Triage & Specialist Appointment Booking',
      sampleQuery: 'I have severe chest discomfort after stairs and high blood pressure. Need a cardiologist appointment today.',
      extractedEntities: {
        primarySymptoms: 'Chest discomfort on exertion, Hypertension',
        urgencyLevel: 'Priority OPD (High Attention)',
        department: 'Cardiology & Heart Health',
        recommendedDoctor: 'Dr. Anand Raman (Sr. Cardiologist)',
        availableSlot: 'Today @ 03:00 PM (Slot #04)',
        leadScore: 98
      },
      aiResponse: 'I have matched you with Dr. Anand Raman (Sr. Cardiologist, OPD Chamber 3B). We have an immediate appointment slot today at 03:00 PM. I have reserved your token (#CARD-819). Please arrive 15 minutes prior for BP screening. If experiencing acute crushing pain, please dial our 24/7 Emergency at 1066 directly.'
    }
  },

  ecommerce: {
    id: 'ecommerce',
    name: 'E-commerce Companies',
    shortName: 'E-Commerce & Retail',
    category: 'Retail & Consumer Goods',
    icon: 'ShoppingBag',
    color: '#ec4899',
    accentLight: 'rgba(236, 72, 153, 0.12)',
    tagline: 'Online Stores, D2C Brands & Multi-Vendor Marketplaces',
    description: 'Answers live tracking questions ("Where is my order?"), recommends personalized products based on buyer criteria, and processes returns.',
    defaultCompanyName: 'UrbanStyle Direct & Electronics',
    domain: 'urbanstyle.shop',
    humanRoles: [
      { id: 'role-ecom-1', name: 'Store Admin', dept: 'Executive', count: 1, access: 'Full Store Workspace', color: '#8b5cf6' },
      { id: 'role-ecom-2', name: 'Sales Manager', dept: 'Growth', count: 2, access: 'Promotions & High-Value Baskets', color: '#ec4899' },
      { id: 'role-ecom-3', name: 'Customer Support Manager', dept: 'Support', count: 1, access: 'Disputes & Refund Authorizations', color: '#f59e0b' },
      { id: 'role-ecom-4', name: 'Support Agent', dept: 'Support', count: 5, access: 'Live Chat & Return Approvals', color: '#3b82f6' },
      { id: 'role-ecom-5', name: 'Order Manager', dept: 'Fulfillment', count: 2, access: 'Warehouse Dispatch & Courier Tracking', color: '#10b981' }
    ],
    aiEmployees: [
      {
        id: 'ai-ecom-1',
        name: 'AI Sales Agent',
        avatar: '🛍️',
        role: 'Product Recommendation & Upsell Bot',
        description: 'Recommends products (e.g. "Which laptop is good for 4K video editing?"), compares specifications, and applies active coupon codes.',
        channels: ['Website', 'Instagram DM', 'WhatsApp'],
        accuracy: '98.2%',
        handledCount: '6,200 shoppers',
        status: 'Active',
        capabilities: ['Catalog Search', 'Spec Comparison', 'Dynamic Discounting', 'Abandoned Cart Recovery']
      },
      {
        id: 'ai-ecom-2',
        name: 'AI Support Agent',
        avatar: '📦',
        role: 'Order Tracking & Delivery Status',
        description: 'Instantly checks courier API ("Where is my order?") and gives live GPS transit location, delivery ETA, and driver contact.',
        channels: ['WhatsApp', 'Website', 'SMS'],
        accuracy: '99.5%',
        handledCount: '9,140 lookups',
        status: 'Active',
        capabilities: ['Courier Tracking API', 'ETA Calculation', 'Address Modification', 'Delivery Re-attempt']
      },
      {
        id: 'ai-ecom-3',
        name: 'AI Order Agent',
        avatar: '🔄',
        role: 'Returns, Exchanges & Instant Refunds',
        description: 'Validates return window policy, generates reverse-pickup barcodes, and automatically triggers UPI refund upon pickup confirmation.',
        channels: ['WhatsApp', 'Email'],
        accuracy: '97.1%',
        handledCount: '1,420 returns',
        status: 'Active',
        capabilities: ['Return Policy Verification', 'Reverse Pickup Barcode', 'Store Credit / Refund Webhook']
      }
    ],
    workflowStages: [
      { step: 1, title: 'Shopper Enquiry', actor: 'Online Customer', desc: 'Asks: "Where is my order #ZN-8921?" or "Which laptop is best for 4K editing?"', type: 'inbound' },
      { step: 2, title: 'AI Assistant', actor: 'AI Agent', desc: 'Detects intent: Order Lookup vs Product Discovery', type: 'ai' },
      { step: 3, title: 'Catalog / Order API Query', actor: 'AI Engine', desc: 'Pulls live logistics status or searches product database specifications', type: 'ai' },
      { step: 4, title: 'Instant Response & Upsell', actor: 'AI Agent', desc: 'Provides live tracking ETA or recommended laptop bundle with 10% coupon', type: 'ai' },
      { step: 5, title: 'Order Manager', actor: 'Human Staff', desc: 'Warehouse fulfillment & shipping carrier dispatch', type: 'human' },
      { step: 6, title: 'Support Agent (Escalations)', actor: 'Human Support', desc: 'Handles complex damage claims or custom bulk order negotiations', type: 'human' },
      { step: 7, title: 'Delivered / Converted', actor: 'Customer', desc: 'Successful delivery or purchase completed in 1-click', type: 'closed' }
    ],
    simulation: {
      title: 'E-Commerce Live Order Tracking & Product Recommendation',
      sampleQuery: 'Where is my order #US-8942? Also, which laptop under ₹80,000 do you recommend for Premiere Pro video editing?',
      extractedEntities: {
        orderId: '#US-8942',
        orderStatus: 'Out for Delivery (Bluedart Express #BD-78901)',
        deliveryETA: 'Today by 04:30 PM',
        productSearch: 'Video Editing Laptop (Premiere Pro / After Effects)',
        budgetConstraint: 'Under ₹80,000',
        topRecommendation: 'ASUS TUF Gaming A15 (Ryzen 7, 16GB RAM, RTX 4050, 100% sRGB) @ ₹74,990'
      },
      aiResponse: '1️⃣ Order Status: Package #US-8942 is Out for Delivery with courier Bluedart. Expected delivery today by 4:30 PM. 2️⃣ Laptop Recommendation: For Premiere Pro under ₹80k, we highly recommend the ASUS TUF A15 (Ryzen 7 + RTX 4050 6GB + 100% sRGB display) priced at ₹74,990. Use coupon CREATOR10 for an extra ₹2,500 off at checkout!'
    }
  },

  hospitality: {
    id: 'hospitality',
    name: 'Hotels / Hospitality',
    shortName: 'Hotels & Resorts',
    category: 'Travel & Hospitality',
    icon: 'Hotel',
    color: '#f59e0b',
    accentLight: 'rgba(245, 158, 11, 0.12)',
    tagline: 'Boutique Hotels, Luxury Resorts & Villa Stays',
    description: 'Handles 24/7 room enquiries, checks date availability, offers customized package upgrades, and executes instant room reservations.',
    defaultCompanyName: 'Grand Azure Beachfront Resort & Spa',
    domain: 'grandazureresort.com',
    humanRoles: [
      { id: 'role-hot-1', name: 'Hotel Admin', dept: 'Executive', count: 1, access: 'Property Master Settings', color: '#8b5cf6' },
      { id: 'role-hot-2', name: 'Reservation Manager', dept: 'Reservations', count: 2, access: 'Yield Pricing & Group Allocations', color: '#f59e0b' },
      { id: 'role-hot-3', name: 'Reservation Executive', dept: 'Reservations', count: 4, access: 'Direct Bookings & Special Requests', color: '#3b82f6' },
      { id: 'role-hot-4', name: 'Front Desk', dept: 'Guest Experience', count: 4, access: 'Key Cards & Room Allocation', color: '#10b981' },
      { id: 'role-hot-5', name: 'Customer Support', dept: 'Support', count: 2, access: 'Airport Transfer & Spa Booking', color: '#64748b' }
    ],
    aiEmployees: [
      {
        id: 'ai-hot-1',
        name: 'AI Reservation Agent',
        avatar: '🛎️',
        role: 'Room Availability & Direct Booking Engine',
        description: 'Collects check-in/out dates, guest counts, room preferences (Ocean View, Presidential Suite), checks PMS availability and locks direct bookings.',
        channels: ['WhatsApp', 'Website', 'Instagram'],
        accuracy: '99.0%',
        handledCount: '3,890 guest bookings',
        status: 'Active',
        capabilities: ['Live Room Inventory Sync', 'Dynamic Season Pricing', 'Meal Plan Add-on', 'Payment Link Dispatch']
      },
      {
        id: 'ai-hot-2',
        name: 'AI Support Agent',
        avatar: '🌴',
        role: 'In-Stay Concierge & Amenities Guide',
        description: 'Answers breakfast timings, infinity pool rules, spa bookings, candlelight beach dinner setups, and airport cab transfers.',
        channels: ['WhatsApp', 'In-Room QR'],
        accuracy: '97.8%',
        handledCount: '5,120 concierge requests',
        status: 'Active',
        capabilities: ['Spa & Activity Booking', 'Room Service Routing', 'Local Sightseeing Recommendations']
      },
      {
        id: 'ai-hot-3',
        name: 'AI Follow-up Agent',
        avatar: '⭐',
        role: 'Post-Checkout Feedback & Loyalty Upgrades',
        description: 'Collects Google/TripAdvisor reviews after checkout and shares exclusive anniversary & return stay discount vouchers.',
        channels: ['WhatsApp', 'Email'],
        accuracy: '96.2%',
        handledCount: '1,420 guests',
        status: 'Active',
        capabilities: ['TripAdvisor Review Drip', 'Loyalty Tier Status', 'Return Stay Promo']
      }
    ],
    workflowStages: [
      { step: 1, title: 'Room Enquiry', actor: 'Guest', desc: 'Enquires: "Sea view villa for 2 adults, 3 nights from Nov 12th"', type: 'inbound' },
      { step: 2, title: 'AI Reservation Agent', actor: 'AI Agent', desc: 'Captures dates (Nov 12-15), 2 Guests, Room category: Oceanfront Pool Villa', type: 'ai' },
      { step: 3, title: 'Live Availability & Rate', actor: 'AI Agent', desc: 'Checks PMS: 2 Villas Available @ ₹18,500/night with complimentary buffet breakfast', type: 'ai' },
      { step: 4, title: 'Booking Confirmation', actor: 'AI Agent', desc: 'Issues digital confirmation voucher #AZURE-781 + secure payment gateway link', type: 'ai' },
      { step: 5, title: 'Reservation Executive', actor: 'Human Staff', desc: 'Coordinates honeymoon bed decoration & airport luxury pickup', type: 'human' },
      { step: 6, title: 'Front Desk', actor: 'Human Staff', desc: 'Welcomes guest with signature drink & presents contactless keycard', type: 'closed' }
    ],
    simulation: {
      title: 'Resort Room Reservation & Concierge Booking',
      sampleQuery: 'I want to book an Ocean View Villa for 2 adults from Nov 14 to 17. Include airport transfer and anniversary dinner.',
      extractedEntities: {
        dates: 'Nov 14 - Nov 17 (3 Nights)',
        guests: '2 Adults',
        roomType: 'Oceanfront Luxury Villa with Private Plunge Pool',
        specialRequests: 'Airport Pickup + Romantic Candlelight Beach Dinner',
        quotedRate: '₹55,500 all-inclusive with breakfast & airport cab',
        leadScore: 96
      },
      aiResponse: 'Wonderful! Our Oceanfront Plunge Pool Villa is available for Nov 14-17 at ₹55,500 total (includes daily champagne breakfast, complimentary airport pickup, and complimentary anniversary cake). Would you like me to reserve this and send the payment link with complimentary beach dinner setup?'
    }
  },

  travel: {
    id: 'travel',
    name: 'Travel Companies',
    shortName: 'Travel & Tourism',
    category: 'Tours & Travel',
    icon: 'Plane',
    color: '#06b6d4',
    accentLight: 'rgba(6, 182, 212, 0.12)',
    tagline: 'International Tour Operators, Custom Holidays & Visa Services',
    description: 'Gathers holiday criteria (destination, pax, budget, dates, hotel preference, activities), creates custom itineraries, and hands over to travel consultants.',
    defaultCompanyName: 'Wanderlust Global Expeditions',
    domain: 'wanderlusttours.com',
    humanRoles: [
      { id: 'role-trv-1', name: 'Admin', dept: 'Executive', count: 1, access: 'Full Agency Workspace', color: '#8b5cf6' },
      { id: 'role-trv-2', name: 'Sales Manager', dept: 'Sales', count: 2, access: 'Supplier Contracts & Quotation Margins', color: '#06b6d4' },
      { id: 'role-trv-3', name: 'Travel Consultant', dept: 'Sales', count: 5, access: 'Custom Itinerary Building & Flight PNRs', color: '#3b82f6' },
      { id: 'role-trv-4', name: 'Booking Executive', dept: 'Operations', count: 3, access: 'Hotel Vouchers & Visa Processing', color: '#10b981' },
      { id: 'role-trv-5', name: 'Customer Support', dept: 'Support', count: 2, access: 'Emergency In-Trip Assistance 24/7', color: '#64748b' }
    ],
    aiEmployees: [
      {
        id: 'ai-trv-1',
        name: 'AI Travel Sales Agent',
        avatar: '✈️',
        role: 'Itinerary Discovery & Requirement Qualifier',
        description: 'Understands customer dream trips, parses destination, pax count, budget, flight preferences, 4-star vs 5-star hotels, and preferred excursions.',
        channels: ['WhatsApp', 'Website', 'Instagram'],
        accuracy: '98.6%',
        handledCount: '4,450 trip inquiries',
        status: 'Active',
        capabilities: ['Multi-Destination Parsing', 'Budget-to-Itinerary Matching', 'Visa Checklist Delivery', 'Day-wise Plan Drafting']
      },
      {
        id: 'ai-trv-2',
        name: 'AI Booking Agent',
        avatar: '🎫',
        role: 'Visa Checklist & Document Collection',
        description: 'Collects passport scans, assists with visa application forms, and dispatches confirmed flight & hotel confirmation vouchers.',
        channels: ['WhatsApp', 'Email'],
        accuracy: '99.1%',
        handledCount: '2,100 bookings',
        status: 'Active',
        capabilities: ['Passport OCR Extraction', 'Visa Requirements Engine', 'Travel Insurance Generator']
      },
      {
        id: 'ai-trv-3',
        name: 'AI Follow-up Agent',
        avatar: '🗺️',
        role: 'Pre-Departure Briefing & Weather Alerts',
        description: 'Sends automated luggage packing checklists, local currency exchange tips, and destination weather updates 48h before flight departure.',
        channels: ['WhatsApp', 'SMS'],
        accuracy: '97.0%',
        handledCount: '1,890 travelers',
        status: 'Active',
        capabilities: ['Weather & Packing Guide', 'Emergency SOS Sync', 'Post-Trip Photo Contest']
      }
    ],
    workflowStages: [
      { step: 1, title: 'Trip Enquiry', actor: 'Traveler', desc: 'Customer: "I need a 5-day trip to Dubai for 4 people with 4-star hotel and desert safari"', type: 'inbound' },
      { step: 2, title: 'AI Travel Agent', actor: 'AI Agent', desc: 'Collects: Destination (Dubai), 4 Pax, Budget (₹2.2 Lakhs total), Dates (Dec 10-15), 4-Star Hotel', type: 'ai' },
      { step: 3, title: 'Draft Itinerary Created', actor: 'AI Agent', desc: 'Generates day-by-day itinerary (Burj Khalifa, Desert Safari, Marina Cruise, Miracle Garden)', type: 'ai' },
      { step: 4, title: 'Qualified Enquiry Handover', actor: 'AI Engine', desc: 'Packages all extracted requirements and notifies Travel Consultant', type: 'ai' },
      { step: 5, title: 'Travel Consultant', actor: 'Human Consultant', desc: 'Customizes flight timings, locks group hotel rates & calls customer with final proposal', type: 'human' },
      { step: 6, title: 'Booking Executive', actor: 'Human Staff', desc: 'Processes Dubai tourist visa & issues airline PNR tickets', type: 'human' },
      { step: 7, title: 'Trip Confirmed / Won', actor: 'Agency & Traveler', desc: 'Trip package booked with 24/7 dedicated local tour guide', type: 'closed' }
    ],
    simulation: {
      title: 'Custom Dubai Holiday Package Requirement Extraction',
      sampleQuery: 'I need a 5-day trip to Dubai for 4 people in December. Budget is around ₹2 Lakhs. We want 4-star hotel, Desert Safari, and Burj Khalifa 124th floor.',
      extractedEntities: {
        destination: 'Dubai, UAE',
        duration: '5 Days / 4 Nights',
        travelers: '4 Adults',
        budget: '₹2,00,000 (Approx ₹50,000/person)',
        hotelPreference: '4-Star (Bur Dubai / Downtown area)',
        includedActivities: 'Desert Safari with BBQ, Burj Khalifa 124th Floor, Dhow Cruise Dinner',
        leadScore: 94,
        routingTarget: 'Travel Consultant (Middle East Desk)'
      },
      aiResponse: 'Awesome! We have crafted a popular 5D/4N Dubai package for 4 adults within your ₹2,00,000 budget! Includes: 4-Star accommodation, Airport transfers, Burj Khalifa 124th Floor, Desert Safari with BBQ dinner & Tanoura show, and Marina Dhow cruise. Our Senior Dubai Specialist Priya Iyer is reviewing custom flight slots and will call you with your finalized PDF itinerary!'
    }
  },

  manufacturing_b2b: {
    id: 'manufacturing_b2b',
    name: 'Manufacturing / B2B Companies',
    shortName: 'Manufacturing & B2B',
    category: 'Industrial & Wholesale',
    icon: 'Factory',
    color: '#d97706',
    accentLight: 'rgba(217, 119, 6, 0.12)',
    tagline: 'Industrial Equipment, OEM Parts, Wholesale & Heavy Machinery',
    description: 'Collects bulk quantity requests, technical drawings, MOQ inquiries, and creates qualified sales opportunities for dealer managers.',
    defaultCompanyName: 'Apex Precision Engineering & Hydraulics',
    domain: 'apexindustrialgear.com',
    humanRoles: [
      { id: 'role-mfg-1', name: 'Company Admin', dept: 'Executive', count: 1, access: 'Plant & ERP Master Settings', color: '#8b5cf6' },
      { id: 'role-mfg-2', name: 'Sales Manager', dept: 'Sales', count: 2, access: 'Commercial Pricing & Margin Approvals', color: '#d97706' },
      { id: 'role-mfg-3', name: 'Sales Executive', dept: 'B2B Sales', count: 4, access: 'Client RFQs & Technical Quotations', color: '#3b82f6' },
      { id: 'role-mfg-4', name: 'Dealer Manager', dept: 'Distribution', count: 2, access: 'Dealer Network & Territory Quotas', color: '#10b981' },
      { id: 'role-mfg-5', name: 'Technical Support', dept: 'Engineering', count: 3, access: 'CAD Drawings & Spec Compliance', color: '#06b6d4' },
      { id: 'role-mfg-6', name: 'Customer Support', dept: 'Support', count: 2, access: 'Order Dispatch & Warranty Claims', color: '#64748b' }
    ],
    aiEmployees: [
      {
        id: 'ai-mfg-1',
        name: 'AI B2B Sales Agent',
        avatar: '⚙️',
        role: 'Bulk RFQ Collector & Specification Scorer',
        description: 'Interprets bulk orders ("We need 500 units of Hydraulic Valves"), extracts material grade, tolerance, delivery timeline, and generates sales opportunity.',
        channels: ['Email', 'Website', 'WhatsApp'],
        accuracy: '98.8%',
        handledCount: '1,780 RFQs parsed',
        status: 'Active',
        capabilities: ['MOQ & Volume Discounting', 'Technical Drawing Intake', 'B2B ERP Sync', 'Tender Lead Scoring']
      },
      {
        id: 'ai-mfg-2',
        name: 'AI Support Agent',
        avatar: '🔧',
        role: 'Technical Datasheets & Warranty Assist',
        description: 'Serves machine operating manuals, CAD dimensional specs, ISO test certificates, and coordinates warranty field replacements.',
        channels: ['Website', 'Email'],
        accuracy: '97.2%',
        handledCount: '2,340 engineering queries',
        status: 'Active',
        capabilities: ['CAD / Datasheet PDF Delivery', 'Spare Part Lookup', 'Warranty Verification']
      }
    ],
    workflowStages: [
      { step: 1, title: 'B2B RFQ Enquiry', actor: 'Corporate Buyer', desc: 'Customer: "We need 500 units of Model HV-40 valves. Can you provide a quotation?"', type: 'inbound' },
      { step: 2, title: 'AI B2B Sales Agent', actor: 'AI Agent', desc: 'Validates MOQ (min 100 units), collects material grade (SS-316) & shipping location', type: 'ai' },
      { step: 3, title: 'Sales Opportunity Created', actor: 'AI Engine', desc: 'Estimated deal value: ₹12,50,000 (Score: 96) logged into CRM pipeline', type: 'ai' },
      { step: 4, title: 'Technical Review', actor: 'Technical Support', desc: 'Reviews tolerance specs & confirms production run schedule', type: 'human' },
      { step: 5, title: 'Dealer / Sales Manager', actor: 'Human Manager', desc: 'Applies volume tier discount and issues official commercial proforma quote', type: 'human' },
      { step: 6, title: 'Purchase Order (PO)', actor: 'Sales Executive', desc: 'PO received, advance payment verified & factory production triggered', type: 'closed' }
    ],
    simulation: {
      title: 'B2B Wholesale 500-Unit Quotation & RFQ Capture',
      sampleQuery: 'We need 500 units of Stainless Steel Hydraulic Valves (Model HV-40, SS-316). Can you provide a commercial quotation with delivery timeline for Pune plant?',
      extractedEntities: {
        productModel: 'Model HV-40 Hydraulic Valves',
        materialGrade: 'SS-316 Grade Stainless Steel',
        quantity: '500 Units (Meets Wholesale MOQ of 100)',
        deliveryLocation: 'Pune Manufacturing Plant, MH',
        estimatedValue: '₹12,50,000 (Ex-factory)',
        leadScore: 96
      },
      aiResponse: 'Thank you for your inquiry! For 500 units of Model HV-40 in SS-316 Grade, our wholesale tiered unit price is ₹2,500/unit (Total: ₹12,50,000 + GST). Current factory lead time for Pune dispatch is 12 working days. I have generated Opportunity #OPP-500-HV and assigned Senior Sales Manager Vikram Singh to send your official tax proforma quotation.'
    }
  },

  financial_services: {
    id: 'financial_services',
    name: 'Financial / Professional Services',
    shortName: 'Finance & Legal Advisory',
    category: 'Finance & Legal',
    icon: 'ShieldCheck',
    color: '#059669',
    accentLight: 'rgba(5, 150, 105, 0.12)',
    tagline: 'Insurance, Wealth Advisory, Accounting, Consulting & Legal Services',
    description: 'Qualifies financial requirements, checks compliance guidelines, and enforces human approval workflows for regulated & high-impact decisions.',
    defaultCompanyName: 'Zenith Wealth & Legal Advisory LLP',
    domain: 'zenithwealth.com',
    humanRoles: [
      { id: 'role-fin-1', name: 'Company Admin', dept: 'Executive', count: 1, access: 'Full Compliance & Firm Settings', color: '#8b5cf6' },
      { id: 'role-fin-2', name: 'Sales Manager', dept: 'Advisory', count: 2, access: 'Portfolio & Deal Underwriting', color: '#059669' },
      { id: 'role-fin-3', name: 'Relationship Manager', dept: 'Wealth Advisory', count: 4, access: 'Client Portfolio & Mandatory Approvals', color: '#3b82f6' },
      { id: 'role-fin-4', name: 'Sales Executive', dept: 'Sales', count: 3, access: 'Insurance & Loan Proposals', color: '#06b6d4' },
      { id: 'role-fin-5', name: 'Customer Support', dept: 'Support', count: 2, access: 'KYC & Statement Inquiries', color: '#64748b' }
    ],
    aiEmployees: [
      {
        id: 'ai-fin-1',
        name: 'AI Lead Qualification Agent',
        avatar: '⚖️',
        role: 'Risk Assessment & Financial Needs Screener',
        description: 'Screens loan eligibility, insurance coverage requirements, and investment risk profiles while enforcing regulatory disclaimers.',
        channels: ['Website', 'WhatsApp', 'Email'],
        accuracy: '99.8%',
        handledCount: '3,110 clients',
        status: 'Active',
        guardrails: 'Restricted Permissions - Human RM Sign-off Required for Proposals',
        capabilities: ['KYC Document Intake', 'Risk Profile Questionnaire', 'EMI / Premium Calculator', 'Mandatory Regulatory Disclaimer Injection']
      },
      {
        id: 'ai-fin-2',
        name: 'AI Support Agent',
        avatar: '📊',
        role: 'Portfolio Statements & Policy Status',
        description: 'Answers policy renewal dates, NAV updates, tax deduction 80C queries, and audit documentation checklists.',
        channels: ['Website', 'Email'],
        accuracy: '98.5%',
        handledCount: '4,500 queries',
        status: 'Active',
        guardrails: 'Read-only access to customer verified ledgers',
        capabilities: ['Tax Statement PDF Gen', 'Policy Status Check', 'Audit Document Checklists']
      },
      {
        id: 'ai-fin-3',
        name: 'AI Follow-up Agent',
        avatar: '🛡️',
        role: 'Policy Renewal & Compliance Drips',
        description: 'Automates insurance renewal reminders, tax filing deadlines, and mandatory KYC periodic re-verification alerts.',
        channels: ['WhatsApp', 'Email'],
        accuracy: '97.4%',
        handledCount: '1,620 renewals',
        status: 'Active',
        guardrails: 'No automated policy changes without human authorization',
        capabilities: ['Policy Expiry Warning', 'KYC Reminder', 'Quarterly Portfolio Review Notice']
      }
    ],
    workflowStages: [
      { step: 1, title: 'Client Financial Inquiry', actor: 'Client', desc: 'Inquiry: "I need ₹50 Lakh commercial loan for business expansion"', type: 'inbound' },
      { step: 2, title: 'AI Qualification Agent', actor: 'AI Agent', desc: 'Gathers annual turnover, GST returns, credit score estimate & collateral type', type: 'ai' },
      { step: 3, title: 'Compliance & Risk Scoring', actor: 'AI Engine', desc: 'Screens financial health & checks AML/KYC preliminary compliance', type: 'ai' },
      { step: 4, title: 'Human Approval Gate ⚠️', actor: 'Regulated Guardrail', desc: 'HIGH-IMPACT ACTION: AI cannot issue final loan term sheet without Human RM Approval', type: 'human' },
      { step: 5, title: 'Relationship Manager (RM)', actor: 'Human RM', desc: 'Verifies ITR docs, approves tailored 8.5% interest rate & signs off on term sheet', type: 'human' },
      { step: 6, title: 'Client Formal Proposal', actor: 'Sales Executive', desc: 'Dispatches legally compliant term sheet with certified digital signature', type: 'human' },
      { step: 7, title: 'Disbursal / Policy Active', actor: 'Firm Admin', desc: 'Loan sanctioned / policy issued with complete audit log retained', type: 'closed' }
    ],
    simulation: {
      title: 'Regulated Commercial Loan Qualification & Human Approval Gate',
      sampleQuery: 'We need a ₹50 Lakh business expansion loan. Annual turnover is ₹3.2 Crore with clean CIBIL score.',
      extractedEntities: {
        loanAmount: '₹50,00,000 (Commercial Expansion)',
        annualTurnover: '₹3.20 Crores',
        cibilEstimate: '780+ (Excellent Tier)',
        riskLevel: 'Low Risk / High Creditworthiness',
        guardrailTriggered: 'YES - Regulated Financial Action requires Human RM Authorization',
        leadScore: 98
      },
      aiResponse: 'Based on your ₹3.2 Cr annual turnover and strong credit profile, you qualify for our Prime Business Loan at competitive interest rates starting from 8.75% p.a. Note: As per regulatory compliance, all term sheets require authorized Relationship Manager sign-off. I have routed your dossier to Senior RM Anita Sharma for priority approval.'
    }
  }
};

export const MOCK_TENANTS = [
  {
    id: 'tenant-1',
    name: 'ABC Technologies',
    industryId: 'software_it',
    plan: 'Professional',
    seats: 12,
    mrr: '₹5,999/mo',
    activeAiEmployees: 4,
    status: 'Active',
    joinedDate: 'Nov 28, 2026',
    hrContact: 'admin@abctech.com',
    logoLetter: 'ABC',
    color: '#3b82f6',
    phone: '+91 44 4567 8901',
    address: '123 Tech Park, OMR Road, Chennai, Tamil Nadu - 600097'
  },
  {
    id: 'tenant-2',
    name: 'Prestige Skyline Realty',
    industryId: 'real_estate',
    plan: 'Enterprise Pro',
    seats: 35,
    mrr: '$2,900/mo',
    activeAiEmployees: 3,
    status: 'Active',
    joinedDate: 'Feb 2026',
    hrContact: 'sanjay@skylineproperties.in',
    logoLetter: 'PS',
    color: '#10b981'
  },
  {
    id: 'tenant-3',
    name: 'Apex Coding Academy',
    industryId: 'education',
    plan: 'Growth Plan',
    seats: 22,
    mrr: '$1,450/mo',
    activeAiEmployees: 2,
    status: 'Active',
    joinedDate: 'Mar 2026',
    hrContact: 'hr@apexacademy.edu',
    logoLetter: 'AA',
    color: '#8b5cf6'
  },
  {
    id: 'tenant-4',
    name: 'Apollo Zenith Clinic',
    industryId: 'hospitals',
    plan: 'Enterprise Pro',
    seats: 40,
    mrr: '$3,200/mo',
    activeAiEmployees: 2,
    status: 'Active',
    joinedDate: 'Apr 2026',
    hrContact: 'admin@zenithhealth.org',
    logoLetter: 'AZ',
    color: '#ef4444'
  },
  {
    id: 'tenant-5',
    name: 'UrbanStyle E-Commerce',
    industryId: 'ecommerce',
    plan: 'Growth Plan',
    seats: 28,
    mrr: '$1,800/mo',
    activeAiEmployees: 3,
    status: 'Active',
    joinedDate: 'May 2026',
    hrContact: 'ops@urbanstyle.shop',
    logoLetter: 'US',
    color: '#ec4899'
  },
  {
    id: 'tenant-6',
    name: 'Grand Azure Resort',
    industryId: 'hospitality',
    plan: 'Growth Plan',
    seats: 18,
    mrr: '$1,600/mo',
    activeAiEmployees: 3,
    status: 'Active',
    joinedDate: 'Jun 2026',
    hrContact: 'gm@grandazureresort.com',
    logoLetter: 'GA',
    color: '#f59e0b'
  },
  {
    id: 'tenant-7',
    name: 'Wanderlust Expeditions',
    industryId: 'travel',
    plan: 'Starter Plan',
    seats: 14,
    mrr: '$950/mo',
    activeAiEmployees: 3,
    status: 'Active',
    joinedDate: 'Jul 2026',
    hrContact: 'hr@wanderlusttours.com',
    logoLetter: 'WE',
    color: '#06b6d4'
  },
  {
    id: 'tenant-8',
    name: 'Apex Industrial Gear',
    industryId: 'manufacturing_b2b',
    plan: 'Enterprise Pro',
    seats: 30,
    mrr: '$2,400/mo',
    activeAiEmployees: 2,
    status: 'Active',
    joinedDate: 'Aug 2026',
    hrContact: 'dealers@apexindustrialgear.com',
    logoLetter: 'AI',
    color: '#d97706'
  },
  {
    id: 'tenant-9',
    name: 'Zenith Wealth & Legal Advisory',
    industryId: 'financial_services',
    plan: 'Enterprise Pro',
    seats: 25,
    mrr: '$3,100/mo',
    activeAiEmployees: 3,
    status: 'Active',
    joinedDate: 'Sep 2026',
    hrContact: 'compliance@zenithwealth.com',
    logoLetter: 'ZW',
    color: '#059669'
  },
  {
    id: 'TEN-8AD47B',
    name: 'C priya tech sparks pvt ltd',
    industryId: 'software_it',
    plan: 'Starter Plan (₹0 / 30 Days Free Trial)',
    seats: 5,
    mrr: '₹0/mo (Free Trial)',
    activeAiEmployees: 4,
    status: 'Active',
    joinedDate: 'Oct 22, 2026',
    hrContact: 'priya@gmail.com',
    ownerEmail: 'priya@gmail.com',
    ownerName: 'Priya',
    logoLetter: 'CP',
    color: '#059669',
    phone: '+91 98765 43210',
    address: 'Chennai, Tamil Nadu, India',
    website: 'https://cpriyatechsparks.com',
    isCustomRegistered: true
  }
];

// Industry-specific sample leads, appointments, documents, metrics for dynamic hydration
export const INDUSTRY_SPECIFIC_DATA = {
  software_it: {
    leadsTitle: 'SaaS Leads & Prospects',
    leadsSubtitle: 'Inbound software evaluations, POC requests and trial users',
    appointmentsTitle: 'Product Demos & Architecture Walkthroughs',
    leads: [
      { id: 'it-lead-1', name: 'Vikram Mehta', email: 'vikram@cloudscale.io', phone: '+91 98765 11001', company: 'CloudScale Systems', designation: 'VP of Engineering', companySize: '100-500', source: 'Website', status: 'Qualified', score: 94, assignedTo: 'Rahul Kumar', assigneeRole: 'Sales Manager', lastActivity: '2m ago', aiSummary: '120 engineers evaluating AWS VPC dedicated deployment. High intent, requested architecture walkthrough.', recommendedAction: 'Schedule 30-min deep dive demo with Solution Architect.' },
      { id: 'it-lead-2', name: 'Ananya Roy', email: 'ananya@fintechglobal.com', phone: '+91 98765 11002', company: 'Fintech Global', designation: 'Head of Product', companySize: '50-200', source: 'WhatsApp', status: 'Proposal', score: 88, assignedTo: 'Sneha Iyer', assigneeRole: 'Sales Executive', lastActivity: '14m ago', aiSummary: 'Requesting quotation for 50 seats with WhatsApp and Slack integrations.', recommendedAction: 'Send customized enterprise tier quote.' }
    ],
    appointments: [
      { id: 'it-apt-1', customer: 'Vikram Mehta', company: 'CloudScale Systems', dateTime: 'Tomorrow 11:00 AM', type: 'Architecture Demo', host: 'Rahul Kumar', status: 'Confirmed' },
      { id: 'it-apt-2', customer: 'Ananya Roy', company: 'Fintech Global', dateTime: 'Oct 5, 03:30 PM', type: 'Pricing Review', host: 'Sneha Iyer', status: 'Confirmed' }
    ]
  },

  real_estate: {
    leadsTitle: 'Property Inquiries & Home Buyers',
    leadsSubtitle: 'Buyers qualified for 2BHK/3BHK, luxury villas, and commercial plots',
    appointmentsTitle: 'Site Visits & Sample Flat Walkthroughs',
    leads: [
      { id: 're-lead-1', name: 'Karthik Subramanian', email: 'karthik.sub@gmail.com', phone: '+91 98401 22334', company: 'Individual Home Buyer', designation: 'Tech Lead', companySize: 'Individual', source: 'Website', status: 'Qualified', score: 95, assignedTo: 'Aarav Patel', assigneeRole: 'Property Sales Executive', lastActivity: '5m ago', aiSummary: 'Looking for 2BHK under ₹60 Lakh in Chennai OMR with covered car parking. Ready to move within 3 months.', recommendedAction: 'Send Skyline Meadows floor plan PDF and confirm Saturday 11 AM site visit pickup.' },
      { id: 're-lead-2', name: 'Pooja Hegde', email: 'pooja@investcorp.in', phone: '+91 98402 33445', company: 'Hegde Family Trust', designation: 'Investor', companySize: 'Individual', source: 'WhatsApp', status: 'Contacted', score: 89, assignedTo: 'Ramesh Sundaram', assigneeRole: 'Site Visit Coordinator', lastActivity: '20m ago', aiSummary: 'Interested in 3BHK Penthouse with sea view in ECR. Budget ₹1.8 Cr.', recommendedAction: 'Share 3D VR walkthrough video and arrange executive site pass.' }
    ],
    appointments: [
      { id: 're-apt-1', customer: 'Karthik Subramanian', company: 'Skyline Meadows 2BHK', dateTime: 'Saturday 11:00 AM', type: 'Site Visit & Model Flat', host: 'Aarav Patel', status: 'Confirmed' },
      { id: 're-apt-2', customer: 'Pooja Hegde', company: 'Azure Penthouse ECR', dateTime: 'Sunday 03:00 PM', type: 'Executive Site Walkthrough', host: 'Ramesh Sundaram', status: 'Confirmed' }
    ]
  },

  education: {
    leadsTitle: 'Student Admissions & Course Inquiries',
    leadsSubtitle: 'Prospective students inquiring about curriculum, fees, and placements',
    appointmentsTitle: '1-on-1 Counseling & Free Demo Masterclasses',
    leads: [
      { id: 'edu-lead-1', name: 'Rohan Deshmukh', email: 'rohan.desh@gmail.com', phone: '+91 97654 88990', company: '2025 CS Graduate', designation: 'Aspiring Developer', companySize: 'Individual', source: 'Website', status: 'Qualified', score: 92, assignedTo: 'Deepika Sen', assigneeRole: 'Admission Executive', lastActivity: '8m ago', aiSummary: 'Inquired for Java Full Stack 16-week weekend program. Looking for no-cost EMI at ₹4,500/mo.', recommendedAction: 'Send syllabus PDF and register seat for Saturday Live Coding Masterclass.' },
      { id: 'edu-lead-2', name: 'Simran Kaur', email: 'simran.k@yahoo.com', phone: '+91 97654 99001', company: 'Working Professional', designation: 'QA Engineer', companySize: 'Individual', source: 'Instagram', status: 'New', score: 85, assignedTo: 'Manoj Verma', assigneeRole: 'Counsellor', lastActivity: '30m ago', aiSummary: 'Wants to switch to AI/ML engineering. Inquired about Python Data Science Bootcamp.', recommendedAction: 'Call for career roadmap counseling.' }
    ],
    appointments: [
      { id: 'edu-apt-1', customer: 'Rohan Deshmukh', company: 'Java Full Stack Demo', dateTime: 'Saturday 10:00 AM', type: 'Live Masterclass Demo', host: 'Deepika Sen', status: 'Confirmed' },
      { id: 'edu-apt-2', customer: 'Simran Kaur', company: 'Career Counseling', dateTime: 'Friday 05:00 PM', type: '1-on-1 Roadmap Call', host: 'Manoj Verma', status: 'Confirmed' }
    ]
  },

  hospitals: {
    leadsTitle: 'Patient Consultations & Inquiries',
    leadsSubtitle: 'Patient symptom triage, specialist consultations and health checkups',
    appointmentsTitle: 'Doctor OPD Appointments & Lab Slots',
    leads: [
      { id: 'hosp-lead-1', name: 'Sunil Gavaskar', email: 'sunil.g@outlook.com', phone: '+91 99887 66554', company: 'Patient', designation: 'Self', companySize: 'Individual', source: 'Phone Bot', status: 'Qualified', score: 98, assignedTo: 'Dr. Anand Raman', assigneeRole: 'Doctor / Staff User', lastActivity: '1m ago', aiSummary: 'Chest discomfort on exertion + hypertension history. Non-emergency priority OPD required.', recommendedAction: 'Confirm 3:00 PM slot with Dr. Anand Raman (Chamber 3B).' },
      { id: 'hosp-lead-2', name: 'Meera Nambiar', email: 'meera.n@gmail.com', phone: '+91 99887 77665', company: 'Patient', designation: 'Self', companySize: 'Individual', source: 'WhatsApp', status: 'Contacted', score: 86, assignedTo: 'Dr. Kavita Rao', assigneeRole: 'Doctor / Staff User', lastActivity: '15m ago', aiSummary: 'Dermatology consultation for skin allergy. Needs Saturday morning slot.', recommendedAction: 'Book Saturday 10:30 AM slot.' }
    ],
    appointments: [
      { id: 'hosp-apt-1', customer: 'Sunil Gavaskar', company: 'Cardiology OPD #04', dateTime: 'Today 03:00 PM', type: 'Specialist Consultation', host: 'Dr. Anand Raman', status: 'Confirmed' },
      { id: 'hosp-apt-2', customer: 'Meera Nambiar', company: 'Dermatology OPD', dateTime: 'Saturday 10:30 AM', type: 'Skin Consultation', host: 'Dr. Kavita Rao', status: 'Confirmed' }
    ]
  },

  ecommerce: {
    leadsTitle: 'Shopper Inquiries & VIP Customers',
    leadsSubtitle: 'Active cart consultations, custom product recommendations, and bulk orders',
    appointmentsTitle: 'VIP Personal Styling & Bulk Order Reviews',
    leads: [
      { id: 'ecom-lead-1', name: 'Aditya Birla', email: 'aditya.creations@gmail.com', phone: '+91 91234 88776', company: 'Video Creator Studio', designation: 'Creator', companySize: '1-10', source: 'Website', status: 'Qualified', score: 92, assignedTo: 'Neha Kapoor', assigneeRole: 'Sales Executive', lastActivity: '3m ago', aiSummary: 'Looking for 3 units of 4K Video Editing Laptops under ₹80,000 with RTX graphics. High basket intent.', recommendedAction: 'Send coupon CREATOR10 and quote for 3x ASUS TUF A15.' },
      { id: 'ecom-lead-2', name: 'Tanvi Shah', email: 'tanvi.shah@gmail.com', phone: '+91 91234 99887', company: 'Online Shopper', designation: 'Consumer', companySize: 'Individual', source: 'WhatsApp', status: 'New', score: 78, assignedTo: 'Kiran Patel', assigneeRole: 'Order Manager', lastActivity: '18m ago', aiSummary: 'Inquired status for Order #US-8942. Package out for delivery with Bluedart today.', recommendedAction: 'Automated SMS sent with courier live tracking link.' }
    ],
    appointments: [
      { id: 'ecom-apt-1', customer: 'Aditya Birla', company: 'Studio Bulk Setup', dateTime: 'Oct 3, 04:00 PM', type: 'B2B Creator Bundle Call', host: 'Neha Kapoor', status: 'Confirmed' }
    ]
  },

  hospitality: {
    leadsTitle: 'Guest Bookings & Group Inquiries',
    leadsSubtitle: 'Room reservations, destination weddings and corporate retreats',
    appointmentsTitle: 'Event Space Walkthroughs & VIP Check-ins',
    leads: [
      { id: 'hot-lead-1', name: 'Arjun Kapoor', email: 'arjun.k@kapoorcorp.com', phone: '+91 98111 22334', company: 'Honeymoon Couple', designation: 'Guest', companySize: 'Individual', source: 'WhatsApp', status: 'Qualified', score: 96, assignedTo: 'Rajesh Nair', assigneeRole: 'Reservation Executive', lastActivity: '4m ago', aiSummary: 'Wants Oceanfront Pool Villa for 3 nights (Nov 14-17) with airport transfer and candlelight beach dinner.', recommendedAction: 'Lock Villa #104 at ₹55,500 total and send reservation voucher payment link.' },
      { id: 'hot-lead-2', name: 'Nisha Singhania', email: 'nisha@singhaniagroup.com', phone: '+91 98111 33445', company: 'Corporate Retreat', designation: 'HR Director', companySize: '50-100', source: 'Email', status: 'Proposal', score: 91, assignedTo: 'Priya Pillai', assigneeRole: 'Reservation Manager', lastActivity: '22m ago', aiSummary: 'Inquiring 25 Deluxe rooms + banquet for 2-day annual strategy offsite.', recommendedAction: 'Send corporate conference package proposal.' }
    ],
    appointments: [
      { id: 'hot-apt-1', customer: 'Arjun Kapoor', company: 'Villa Reservation Check-in', dateTime: 'Nov 14, 02:00 PM', type: 'VIP Ocean Villa Check-in', host: 'Rajesh Nair', status: 'Confirmed' },
      { id: 'hot-apt-2', customer: 'Nisha Singhania', company: 'Singhania Group Offsite', dateTime: 'Oct 6, 03:00 PM', type: 'Banquet Facility Tour', host: 'Priya Pillai', status: 'Confirmed' }
    ]
  },

  travel: {
    leadsTitle: 'Holiday Enquiries & Custom Itineraries',
    leadsSubtitle: 'International family holidays, luxury tours and visa applications',
    appointmentsTitle: 'Itinerary Customization & Flight Reviews',
    leads: [
      { id: 'trv-lead-1', name: 'Rajesh Khanna', email: 'rajesh.khanna@biz.in', phone: '+91 97111 44556', company: 'Family Vacation', designation: 'Traveler', companySize: '4 Pax', source: 'Website', status: 'Qualified', score: 94, assignedTo: 'Priya Iyer', assigneeRole: 'Travel Consultant', lastActivity: '6m ago', aiSummary: '5-day Dubai trip for 4 adults in December. Budget ₹2 Lakhs with 4-star hotel, Desert Safari & Burj Khalifa.', recommendedAction: 'Call customer with day-by-day customized PDF itinerary and flight options.' },
      { id: 'trv-lead-2', name: 'Siddharth Roy', email: 'sid.roy@gmail.com', phone: '+91 97111 55667', company: 'Europe Tour Group', designation: 'Traveler', companySize: '2 Pax', source: 'WhatsApp', status: 'New', score: 87, assignedTo: 'Amit Joshi', assigneeRole: 'Travel Consultant', lastActivity: '35m ago', aiSummary: 'Inquired Schengen visa requirements and 7-day Switzerland package for April.', recommendedAction: 'Send Switzerland Grand Train Tour package details.' }
    ],
    appointments: [
      { id: 'trv-apt-1', customer: 'Rajesh Khanna', company: 'Dubai 5D/4N Package', dateTime: 'Tomorrow 04:30 PM', type: 'Itinerary Review Call', host: 'Priya Iyer', status: 'Confirmed' }
    ]
  },

  manufacturing_b2b: {
    leadsTitle: 'Wholesale RFQs & Industrial Orders',
    leadsSubtitle: 'Bulk purchase quotes, OEM custom manufacturing and dealer requests',
    appointmentsTitle: 'Factory Audits & Commercial Quote Negotiations',
    leads: [
      { id: 'mfg-lead-1', name: 'Girish Kulkarni', email: 'girish@kulkarnipumps.com', phone: '+91 94222 66778', company: 'Kulkarni Pumps Ltd', designation: 'Procurement Head', companySize: '200-500', source: 'Email', status: 'Qualified', score: 96, assignedTo: 'Vikram Singh', assigneeRole: 'Sales Manager', lastActivity: '9m ago', aiSummary: 'RFQ for 500 units Model HV-40 Hydraulic Valves in SS-316 grade. Estimated deal value ₹12.5 Lakhs.', recommendedAction: 'Issue official commercial proforma quote with 12-day delivery lead time.' },
      { id: 'mfg-lead-2', name: 'Harish Mehta', email: 'harish@mehtadealers.com', phone: '+91 94222 77889', company: 'Mehta Industrial Traders', designation: 'Managing Director', companySize: '50-100', source: 'Website', status: 'Proposal', score: 89, assignedTo: 'Suresh Rao', assigneeRole: 'Dealer Manager', lastActivity: '45m ago', aiSummary: 'Applying for regional dealership distributorship in Gujarat corridor.', recommendedAction: 'Review dealer territory quota and schedule factory visit.' }
    ],
    appointments: [
      { id: 'mfg-apt-1', customer: 'Girish Kulkarni', company: 'Kulkarni Pumps (500 Units)', dateTime: 'Tomorrow 02:00 PM', type: 'Commercial Quote Negotiation', host: 'Vikram Singh', status: 'Confirmed' },
      { id: 'mfg-apt-2', customer: 'Harish Mehta', company: 'Dealership Application', dateTime: 'Oct 6, 11:00 AM', type: 'Plant Audit & Dealer Meeting', host: 'Suresh Rao', status: 'Confirmed' }
    ]
  },

  financial_services: {
    leadsTitle: 'Wealth, Loan & Advisory Inquiries',
    leadsSubtitle: 'Regulated loan applications, wealth portfolios and insurance proposals',
    appointmentsTitle: 'RM Portfolio Reviews & Loan Underwriting Sign-offs',
    leads: [
      { id: 'fin-lead-1', name: 'Sanjay Dutt', email: 'sanjay.dutt@duttenterprises.com', phone: '+91 98220 11223', company: 'Dutt Enterprises', designation: 'Managing Partner', companySize: '50-200', source: 'Website', status: 'Qualified', score: 98, assignedTo: 'Anita Sharma', assigneeRole: 'Relationship Manager', lastActivity: '2m ago', aiSummary: '₹50 Lakh business expansion loan inquiry. Annual turnover ₹3.2 Cr, CIBIL 780+. Requires Human RM term-sheet signoff.', recommendedAction: 'Review ITR docs in approval queue and authorize 8.75% commercial term sheet.' },
      { id: 'fin-lead-2', name: 'Kavita Menon', email: 'kavita.menon@wealthcorp.in', phone: '+91 98220 22334', company: 'High Net Worth Client', designation: 'Director', companySize: 'Individual', source: 'WhatsApp', status: 'Contacted', score: 90, assignedTo: 'Rohan Joshi', assigneeRole: 'Relationship Manager', lastActivity: '28m ago', aiSummary: 'Portfolio restructuring for ₹2.5 Cr corpus seeking tax-efficient capital growth.', recommendedAction: 'Prepare asset allocation draft and schedule compliance-approved Zoom meeting.' }
    ],
    appointments: [
      { id: 'fin-apt-1', customer: 'Sanjay Dutt', company: '₹50L Business Loan', dateTime: 'Today 04:00 PM', type: 'RM Loan Term-Sheet Review', host: 'Anita Sharma', status: 'Confirmed' },
      { id: 'fin-apt-2', customer: 'Kavita Menon', company: '₹2.5 Cr Portfolio Advisory', dateTime: 'Oct 5, 02:30 PM', type: 'Wealth Strategy Consultation', host: 'Rohan Joshi', status: 'Confirmed' }
    ]
  }
};
