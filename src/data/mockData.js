export const INITIAL_METRICS = {
  totalLeads: { value: 248, change: '+12%', period: 'vs last week', isPositive: true },
  qualifiedLeads: { value: 89, change: '+18%', period: 'vs last week', isPositive: true },
  appointmentsBooked: { value: 42, change: '+25%', period: 'vs last week', isPositive: true },
  conversions: { value: 18, change: '+35%', period: 'vs last week', isPositive: true },
  avgResponseTime: { value: '2m 34s', change: '+42%', period: 'vs last week', isPositive: true },
};

export const PIPELINE_STAGES = [
  { id: 'new', name: 'New Leads', count: 248, percentage: 100, color: 'blue' },
  { id: 'contacted', name: 'Contacted', count: 187, percentage: 75, color: 'cyan' },
  { id: 'qualified', name: 'Qualified', count: 89, percentage: 36, color: 'emerald' },
  { id: 'proposal', name: 'Proposal', count: 46, percentage: 19, color: 'amber' },
  { id: 'won', name: 'Won', count: 18, percentage: 7, color: 'purple' },
];

export const LEAD_SOURCES_DATA = [
  { name: 'Website', percentage: 42, color: '#3b82f6', count: 104 },
  { name: 'WhatsApp', percentage: 23, color: '#10b981', count: 57 },
  { name: 'Email', percentage: 15, color: '#f59e0b', count: 37 },
  { name: 'Instagram', percentage: 8, color: '#ec4899', count: 20 },
  { name: 'Referral', percentage: 7, color: '#8b5cf6', count: 17 },
  { name: 'Others', percentage: 5, color: '#6b7280', count: 13 },
];

export const INITIAL_LEADS = [
  {
    id: 'lead-1',
    name: 'Priya Sharma',
    email: 'priya@company.com',
    phone: '+91 98765 43210',
    company: 'Tech Solutions Inc',
    designation: 'Project Manager',
    companySize: '50-200',
    source: 'Website',
    status: 'Qualified',
    score: 92,
    assignedTo: 'Rahul Kumar',
    assigneeRole: 'Sales Manager',
    lastActivity: '2m ago',
    createdAt: 'Sep 28, 2026 10:24 AM',
    scoreBreakdown: {
      companySize: { score: 20, label: 'Company Size' },
      budgetProvided: { score: 25, label: 'Budget Provided' },
      timeline: { score: 15, label: 'Timeline' },
      websiteVisits: { score: 12, label: 'Website Visits' },
      total: 92
    },
    aiSummary: 'Customer is interested in the Enterprise plan for 50 users. Budget is around $5-7k/mo. Requested a demo and is evaluating competitors. High intent, needs follow-up within 2 days.',
    recommendedAction: 'Schedule a product demo and share the detailed proposal with custom API integration modules.',
    notes: [
      { id: 'n1', author: 'Rahul Kumar', text: 'Spoke over phone. Very keen on the AI agent omnichannel features.', time: '1 hour ago' }
    ]
  },
  {
    id: 'lead-2',
    name: 'Rahul Mehta',
    email: 'rahul@global.com',
    phone: '+91 98764 32109',
    company: 'Global Systems',
    designation: 'VP of Operations',
    companySize: '200-500',
    source: 'WhatsApp',
    status: 'Contacted',
    score: 87,
    assignedTo: 'Sneha Iyer',
    assigneeRole: 'Sales Executive',
    lastActivity: '12m ago',
    createdAt: 'Sep 28, 2026 09:15 AM',
    scoreBreakdown: {
      companySize: { score: 25, label: 'Company Size' },
      budgetProvided: { score: 20, label: 'Budget Provided' },
      timeline: { score: 12, label: 'Timeline' },
      websiteVisits: { score: 10, label: 'Website Visits' },
      total: 87
    },
    aiSummary: 'Requested quotations for 50 seats. Needs WhatsApp and Instagram unified inbox capabilities with AI auto-responder.',
    recommendedAction: 'Send automated customized pricing sheet and follow up via WhatsApp call.',
    notes: []
  },
  {
    id: 'lead-3',
    name: 'Sneha Iyer',
    email: 'sneha@fresh.com',
    phone: '+91 98763 21098',
    company: 'Future Corp',
    designation: 'Head of Growth',
    companySize: '20-50',
    source: 'Email',
    status: 'Proposal',
    score: 78,
    assignedTo: 'Unassigned',
    assigneeRole: 'None',
    lastActivity: '25m ago',
    createdAt: 'Sep 27, 2026 04:40 PM',
    scoreBreakdown: {
      companySize: { score: 15, label: 'Company Size' },
      budgetProvided: { score: 20, label: 'Budget Provided' },
      timeline: { score: 15, label: 'Timeline' },
      websiteVisits: { score: 8, label: 'Website Visits' },
      total: 78
    },
    aiSummary: 'Evaluating proposal sent yesterday. Compared with Zendesk. Positive feedback on AI agent speed.',
    recommendedAction: 'Schedule technical integration walkthrough.',
    notes: []
  },
  {
    id: 'lead-4',
    name: 'Vikram Singh',
    email: 'vikram@abc.com',
    phone: '+91 91234 56789',
    company: 'Bright Media',
    designation: 'Founder & CEO',
    companySize: '10-50',
    source: 'Instagram',
    status: 'New',
    score: 65,
    assignedTo: 'Anita Sharma',
    assigneeRole: 'Sales Rep',
    lastActivity: '38m ago',
    createdAt: 'Sep 27, 2026 02:10 PM',
    scoreBreakdown: {
      companySize: { score: 12, label: 'Company Size' },
      budgetProvided: { score: 15, label: 'Budget Provided' },
      timeline: { score: 10, label: 'Timeline' },
      websiteVisits: { score: 8, label: 'Website Visits' },
      total: 65
    },
    aiSummary: 'Inquired about weekend customer support automation and CRM webhook triggers.',
    recommendedAction: 'Trigger automated AI weekend support demo video.',
    notes: []
  },
  {
    id: 'lead-5',
    name: 'Ananya Reddy',
    email: 'ananya@biz.com',
    phone: '+91 94321 09876',
    company: 'NextGen Ltd',
    designation: 'Marketing Director',
    companySize: '50-100',
    source: 'Website',
    status: 'New',
    score: 58,
    assignedTo: 'Rahul Kumar',
    assigneeRole: 'Sales Manager',
    lastActivity: '1h ago',
    createdAt: 'Sep 27, 2026 11:30 AM',
    scoreBreakdown: {
      companySize: { score: 10, label: 'Company Size' },
      budgetProvided: { score: 10, label: 'Budget Provided' },
      timeline: { score: 10, label: 'Timeline' },
      websiteVisits: { score: 18, label: 'Website Visits' },
      total: 58
    },
    aiSummary: 'Requested detailed price list for multi-agent deployment across 3 branch offices.',
    recommendedAction: 'Call customer directly to confirm setup requirements.',
    notes: []
  },
  {
    id: 'lead-6',
    name: 'Rohit Sharma',
    email: 'rohit@techcorp.com',
    phone: '+91 98765 43210',
    company: 'TechCorp Solutions',
    designation: 'Project Manager',
    companySize: '50-200',
    source: 'Website',
    status: 'Qualified',
    score: 95,
    assignedTo: 'Rahul Kumar',
    assigneeRole: 'Sales Manager',
    lastActivity: 'Just now',
    createdAt: 'Sep 28, 2026 10:24 AM',
    scoreBreakdown: {
      companySize: { score: 25, label: 'Company Size' },
      budgetProvided: { score: 25, label: 'Budget Provided' },
      timeline: { score: 20, label: 'Timeline' },
      websiteVisits: { score: 25, label: 'Website Visits' },
      total: 95
    },
    aiSummary: 'Customer requires enterprise multi-agent deployment with custom API rate limits and WhatsApp business inbox integration.',
    recommendedAction: 'Send customized enterprise quote and initiate technical walkthrough.',
    notes: []
  }
];

export const INITIAL_CUSTOMERS = [
  {
    id: 'cust-1',
    name: 'TechCorp Pvt Ltd',
    contactPerson: 'Rohit Sharma',
    email: 'rohit@techcorp.com',
    phone: '+91 98765 43210',
    company: 'TechCorp Solutions',
    segment: 'Enterprise',
    plan: 'Enterprise Pro',
    mrr: '₹45,000/mo',
    lastContact: '2m ago',
    status: 'Active'
  },
  {
    id: 'cust-2',
    name: 'SoftSolutions Ltd',
    contactPerson: 'Priya Verma',
    email: 'priya@softsolutions.com',
    phone: '+91 98764 32109',
    company: 'SoftSolutions',
    segment: 'SMB',
    plan: 'Growth Plan',
    mrr: '₹18,000/mo',
    lastContact: '12m ago',
    status: 'Active'
  },
  {
    id: 'cust-3',
    name: 'NexGen AI Labs',
    contactPerson: 'Karan Mehra',
    email: 'karan@nexgen.ai',
    phone: '+91 98763 21098',
    company: 'NexGen AI',
    segment: 'Enterprise',
    plan: 'Enterprise Tier 2',
    mrr: '₹65,000/mo',
    lastContact: '25m ago',
    status: 'Active'
  },
  {
    id: 'cust-4',
    name: 'CloudTech Systems',
    contactPerson: 'Sneha Iyer',
    email: 'sneha@cloudtech.io',
    phone: '+91 91234 56789',
    company: 'CloudTech',
    segment: 'SMB',
    plan: 'Starter Plan',
    mrr: '₹9,999/mo',
    lastContact: '1h ago',
    status: 'Active'
  },
  {
    id: 'cust-5',
    name: 'Fluid Systems',
    contactPerson: 'Vikram Singh',
    email: 'vikram@fluidsys.com',
    phone: '+91 94321 09876',
    company: 'Fluid Systems',
    segment: 'Enterprise',
    plan: 'Enterprise Pro',
    mrr: '₹35,000/mo',
    lastContact: '2h ago',
    status: 'Active'
  },
  {
    id: 'cust-6',
    name: 'Innovate Labs',
    contactPerson: 'Ananya Reddy',
    email: 'ananya@innovatelabs.com',
    phone: '+91 97654 32109',
    company: 'Innovate Labs',
    segment: 'SMB',
    plan: 'Growth Plan',
    mrr: '₹18,000/mo',
    lastContact: '3h ago',
    status: 'Active'
  }
];

export const INITIAL_CONVERSATIONS = [
  {
    id: 'conv-1',
    customer: 'Priya Sharma',
    email: 'priya@company.com',
    channel: 'Website',
    lastMessage: 'I want to know more about your enterprise plan...',
    status: 'AI Responded',
    assignedTo: 'AI Agent',
    time: '2m ago',
    unread: false,
    messages: [
      { id: 'm1', sender: 'customer', text: 'Hi, can you explain the differences between Pro and Enterprise?', time: '10:20 AM' },
      { id: 'm2', sender: 'ai', text: 'Hello Priya! Our Enterprise plan includes unlimited AI agents, custom webhook integrations, dedicated account manager, and 99.99% SLA.', time: '10:21 AM' },
      { id: 'm3', sender: 'customer', text: 'I want to know more about your enterprise plan...', time: '10:22 AM' },
      { id: 'm4', sender: 'ai', text: 'Enterprise plans include up to 5,000 requests per minute with dedicated throughput. Would you like me to schedule a product demo with Sathiyaseelan?', time: '10:23 AM' }
    ]
  },
  {
    id: 'conv-2',
    customer: 'Rahul Mehta',
    email: 'rahul@global.com',
    phone: '+91 98765 43210',
    channel: 'WhatsApp',
    lastMessage: 'Can you share the quotation for 50 users?',
    status: 'Waiting',
    assignedTo: 'Sales Team',
    time: '12m ago',
    unread: true,
    messages: [
      { id: 'm1', sender: 'customer', text: 'Can you share the quotation for 50 users?', time: '10:12 AM' }
    ]
  },
  {
    id: 'conv-3',
    customer: 'Sneha Iyer',
    email: 'sneha@gmail.com',
    channel: 'Email',
    lastMessage: 'Thanks for the demo. I have a few questions...',
    status: 'Human Handover',
    assignedTo: 'Anita Sharma',
    time: '25m ago',
    unread: false,
    messages: [
      { id: 'm1', sender: 'customer', text: 'Thanks for the demo. I have a few questions...', time: '09:59 AM' }
    ]
  },
  {
    id: 'conv-4',
    customer: 'Vikram Singh',
    email: 'vikram@abc.com',
    phone: '+91 91234 56789',
    channel: 'Instagram',
    lastMessage: 'Do you provide support on weekends?',
    status: 'AI Responded',
    assignedTo: 'AI Agent',
    time: '38m ago',
    unread: false,
    messages: [
      { id: 'm1', sender: 'customer', text: 'Do you provide support on weekends?', time: '09:46 AM' },
      { id: 'm2', sender: 'ai', text: 'Yes! Our AI agents operate 24/7/365 to handle your customer queries automatically on weekends and holidays.', time: '09:47 AM' }
    ]
  },
  {
    id: 'conv-5',
    customer: 'Ananya Reddy',
    email: 'ananya@biz.com',
    channel: 'Website',
    lastMessage: 'Requesting a detailed price list...',
    status: 'Lead Captured',
    assignedTo: 'Sales Team',
    time: '1h ago',
    unread: false,
    messages: [
      { id: 'm1', sender: 'customer', text: 'Requesting a detailed price list...', time: '09:24 AM' }
    ]
  }
];

export const INITIAL_AI_AGENTS = [
  {
    id: 'agent-1',
    name: 'Sales Agent',
    role: 'Inbound Qualification & Demos',
    description: 'Handles 12 conversations, lead qualification, demo scheduling, and pricing FAQs',
    status: 'Active',
    leads: 48,
    appointments: 15,
    conversionRate: '31.2%',
    activeConversations: 12,
    accuracy: '98%',
    performance: 92,
    channels: ['Website', 'WhatsApp', 'Email'],
    avatar: '🤖',
    color: '#3b82f6'
  },
  {
    id: 'agent-2',
    name: 'Support Agent',
    role: 'Technical Support & Ticketing',
    description: 'Handles 8 conversations, ticket resolution, API docs, and product troubleshooting',
    status: 'Active',
    resolved: 76,
    satisfaction: '4.8/5.0',
    conversionRate: 'N/A',
    activeConversations: 8,
    accuracy: '96%',
    performance: 88,
    channels: ['Website', 'Instagram', 'Email'],
    avatar: '⚙️',
    color: '#06b6d4'
  },
  {
    id: 'agent-3',
    name: 'Follow-up Agent',
    role: 'Re-engagement & Drips',
    description: 'Active • 5 scheduled follow-ups, re-engagement drip, and quote follow-ups',
    status: 'Active',
    sent: 120,
    conversion: 68,
    conversionRate: '56.6%',
    activeConversations: 5,
    accuracy: '94%',
    performance: 76,
    channels: ['WhatsApp', 'Email', 'SMS'],
    avatar: '🎯',
    color: '#10b981'
  },
  {
    id: 'agent-4',
    name: 'Appointment Agent',
    role: 'Demo Booking & Calendars',
    description: 'Handling 3 conversations, calendar syncing, meeting links, and rescheduling',
    status: 'Active',
    leads: 32,
    appointments: 28,
    conversionRate: '87.5%',
    activeConversations: 3,
    accuracy: '99%',
    performance: 95,
    channels: ['Website', 'WhatsApp', 'Google Meet'],
    avatar: '📅',
    color: '#8b5cf6'
  }
];

export const INITIAL_AI_ACTIVITY_FEED = [
  {
    id: 'act-1',
    agent: 'Sales Agent',
    text: 'Sales Agent qualified a new lead (Rohit Verma)',
    time: '2m ago',
    type: 'qualification',
    color: '#3b82f6',
    icon: 'Bot'
  },
  {
    id: 'act-2',
    agent: 'Support Agent',
    text: 'Support Agent resolved a customer query',
    time: '12m ago',
    type: 'resolution',
    color: '#10b981',
    icon: 'CheckCircle'
  },
  {
    id: 'act-3',
    agent: 'Follow-up Agent',
    text: 'Follow-up Agent sent a follow-up message',
    time: '25m ago',
    type: 'followup',
    color: '#f59e0b',
    icon: 'Clock'
  },
  {
    id: 'act-4',
    agent: 'Appointment Agent',
    text: 'Appointment Agent booked a demo',
    time: '38m ago',
    type: 'appointment',
    color: '#8b5cf6',
    icon: 'Calendar'
  },
  {
    id: 'act-5',
    agent: 'AI Intelligence',
    text: 'AI generated a lead summary for Rahul Mehta',
    time: '1h ago',
    type: 'summary',
    color: '#0284c7',
    icon: 'Sparkles'
  }
];

export const INITIAL_OPPORTUNITIES = [
  {
    id: 'opp-1',
    title: 'AI Implementation',
    company: 'Fluid Systems',
    value: '₹2,10,000',
    stage: 'Qualified',
    probability: 60,
    owner: 'Rahul Kumar',
    expectedClose: 'Oct 15, 2026',
    description: 'Omnichannel multi-agent deployment for 50 agents.'
  },
  {
    id: 'opp-2',
    title: 'AI Chatbot Solution',
    company: 'CloudTech',
    value: '₹2,25,000',
    stage: 'Proposal',
    probability: 75,
    owner: 'Priya Sharma',
    expectedClose: 'Oct 20, 2026',
    description: 'Customer chatbot with custom API and webhook triggers.'
  },
  {
    id: 'opp-3',
    title: 'Cloud Migration & AI',
    company: 'TechCorp',
    value: '₹3,50,000',
    stage: 'New',
    probability: 40,
    owner: 'Sathiyaseelan',
    expectedClose: 'Nov 05, 2026',
    description: 'Enterprise data migration and autonomous AI customer support.'
  },
  {
    id: 'opp-4',
    title: 'Full Stack SaaS License',
    company: 'ZenCorp',
    value: '₹5,00,000',
    stage: 'Won',
    probability: 100,
    owner: 'Sathiyaseelan',
    expectedClose: 'Sep 28, 2026',
    description: 'Annual enterprise multi-tenant license.'
  }
];

export const INITIAL_TASKS = [
  {
    id: 'task-1',
    title: 'Follow up with Rohit',
    relatedTo: 'Lead: Rohit Sharma',
    priority: 'High',
    dueDate: 'Oct 4, 2026',
    status: 'In Progress'
  },
  {
    id: 'task-2',
    title: 'Send proposal to SoftSolutions',
    relatedTo: 'Deal: SoftSolutions',
    priority: 'High',
    dueDate: 'Oct 4, 2026',
    status: 'Pending'
  },
  {
    id: 'task-3',
    title: 'Schedule demo with ApexGen',
    relatedTo: 'Lead: ApexGen Tech',
    priority: 'Medium',
    dueDate: 'Oct 5, 2026',
    status: 'Pending'
  },
  {
    id: 'task-4',
    title: 'Update customer details',
    relatedTo: 'Customer 360',
    priority: 'Low',
    dueDate: 'Oct 5, 2026',
    status: 'Completed'
  },
  {
    id: 'task-5',
    title: 'Prepare weekly report',
    relatedTo: 'Executive Summary',
    priority: 'Medium',
    dueDate: 'Oct 6, 2026',
    status: 'Pending'
  }
];

export const INITIAL_APPOINTMENTS = [
  {
    id: 'apt-1',
    customer: 'Rohit Sharma',
    company: 'TechCorp Solutions',
    dateTime: 'Today 10:00 AM',
    date: '2026-10-03',
    time: '10:00 AM',
    type: 'Client Meeting',
    host: 'Sathiyaseelan',
    platform: 'Zoom Meeting',
    status: 'Confirmed'
  },
  {
    id: 'apt-2',
    customer: 'Priya Verma',
    company: 'SoftSolutions',
    dateTime: 'Today 02:30 PM',
    date: '2026-10-03',
    time: '02:30 PM',
    type: 'Product Demo',
    host: 'Rahul Kumar',
    platform: 'Google Meet',
    status: 'Confirmed'
  },
  {
    id: 'apt-3',
    customer: 'Dev Team',
    company: 'ABC Technologies',
    dateTime: 'Today 04:00 PM',
    date: '2026-10-03',
    time: '04:00 PM',
    type: 'Internal Meeting',
    host: 'Sathiyaseelan',
    platform: 'Room A2 / Google Meet',
    status: 'Confirmed'
  }
];

export const INITIAL_TEMPLATES = [
  {
    id: 'tmpl-1',
    title: 'Welcome Email',
    type: 'Email',
    category: 'Onboarding',
    status: 'Active',
    subject: 'Welcome to ABC Technologies! Let’s get you set up',
    preview: 'Hi {{name}}, Welcome onboard! Our AI agent squad is ready to assist your team 24/7...'
  },
  {
    id: 'tmpl-2',
    title: 'Follow-up (3 Days)',
    type: 'Email',
    category: 'Follow-up',
    status: 'Active',
    subject: 'Checking in on your proposal evaluation',
    preview: 'Hi {{name}}, Just following up on our recent demo call. Did you have a chance to review the quotation?...'
  },
  {
    id: 'tmpl-3',
    title: 'Demo Confirmation',
    type: 'Email',
    category: 'Meeting',
    status: 'Active',
    subject: 'Confirmed: Product Demo with ABC Technologies',
    preview: 'Hi {{name}}, Your demo is scheduled for {{dateTime}}. Here is your Google Meet link...'
  },
  {
    id: 'tmpl-4',
    title: 'Support Response',
    type: 'WhatsApp',
    category: 'Support',
    status: 'Active',
    subject: 'Support Ticket Update',
    preview: 'Hello {{name}}, Our support agent has resolved Ticket #{{ticketId}}. Please let us know if you need more help.'
  },
  {
    id: 'tmpl-5',
    title: 'WhatsApp Instant Greeting',
    type: 'WhatsApp',
    category: 'General',
    status: 'Active',
    subject: 'Instant WhatsApp Intro',
    preview: 'Hi {{name}}! 👋 Thanks for reaching out to ABC Technologies. How can our AI assist you today?'
  }
];

export const INITIAL_DOCUMENTS = [
  {
    id: 'doc-1',
    title: 'Product Brochure.pdf',
    type: 'PDF',
    size: '2.4 MB',
    uploadedBy: 'Sathiyaseelan',
    lastUpdated: 'Sep 28, 2026 10:24 AM',
    status: 'Processed'
  },
  {
    id: 'doc-2',
    title: 'Pricing Plans.pdf',
    type: 'PDF',
    size: '1.8 MB',
    uploadedBy: 'Rahul Kumar',
    lastUpdated: 'Sep 26, 2026',
    status: 'Processed'
  },
  {
    id: 'doc-3',
    title: 'FAQ Document.pdf',
    type: 'PDF',
    size: '1.1 MB',
    uploadedBy: 'Priya Sharma',
    lastUpdated: 'Sep 24, 2026',
    status: 'Processed'
  },
  {
    id: 'doc-4',
    title: 'API Documentation.pdf',
    type: 'PDF',
    size: '4.2 MB',
    uploadedBy: 'Sathiyaseelan',
    lastUpdated: 'Sep 20, 2026',
    status: 'Processed'
  },
  {
    id: 'doc-5',
    title: 'Company Overview.docx',
    type: 'DOCX',
    size: '3.1 MB',
    uploadedBy: 'Sathiyaseelan',
    lastUpdated: 'Sep 18, 2026',
    status: 'Processed'
  }
];

export const INITIAL_AUTOMATIONS = [
  {
    id: 'auto-1',
    name: 'New Lead Auto-Assignment & WhatsApp Intro',
    trigger: 'New Lead Created',
    action: 'AI Qualify + Assign to Sales Team + Send WhatsApp',
    status: 'Active',
    executions: '1,420 runs'
  },
  {
    id: 'auto-2',
    name: 'Demo Reminder Sequence',
    trigger: 'Appointment Scheduled (24h before)',
    action: 'Send WhatsApp Reminder + Google Meet Link',
    status: 'Active',
    executions: '512 runs'
  },
  {
    id: 'auto-3',
    name: 'Re-engage Cold Leads',
    trigger: 'No response (3 days)',
    action: 'AI personalized check-in message',
    status: 'Active',
    executions: '890 runs'
  }
];

export const INITIAL_TEAM_MEMBERS = [
  {
    id: 'team-1',
    name: 'Sathiyaseelan',
    email: 'admin@abctech.com',
    role: 'Company Admin',
    department: 'Admin',
    status: 'Active',
    lastLogin: 'Oct 4, 2026',
    leadsHandled: 124
  },
  {
    id: 'team-2',
    name: 'Rahul Kumar',
    email: 'rahul@abctech.com',
    role: 'Sales Manager',
    department: 'Sales',
    status: 'Active',
    lastLogin: 'Oct 3, 2026',
    leadsHandled: 84
  },
  {
    id: 'team-3',
    name: 'Priya Sharma',
    email: 'priya@abctech.com',
    role: 'Sales Executive',
    department: 'Sales',
    status: 'Active',
    lastLogin: 'Oct 3, 2026',
    leadsHandled: 62
  },
  {
    id: 'team-4',
    name: 'Vikram Singh',
    email: 'vikram@abctech.com',
    role: 'Support Manager',
    department: 'Support',
    status: 'Active',
    lastLogin: 'Oct 2, 2026',
    leadsHandled: 45
  },
  {
    id: 'team-5',
    name: 'Ananya Reddy',
    email: 'ananya@abctech.com',
    role: 'Support Agent',
    department: 'Support',
    status: 'Active',
    lastLogin: 'Oct 2, 2026',
    leadsHandled: 39
  },
  {
    id: 'team-6',
    name: 'Karthik Nair',
    email: 'karthik@abctech.com',
    role: 'Marketing Manager',
    department: 'Marketing',
    status: 'Active',
    lastLogin: 'Oct 1, 2026',
    leadsHandled: 28
  },
  {
    id: 'team-7',
    name: 'Sneha Iyer',
    email: 'sneha@abctech.com',
    role: 'Analyst',
    department: 'Marketing',
    status: 'Active',
    lastLogin: 'Sep 30, 2026',
    leadsHandled: 18
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    type: 'lead',
    title: 'New lead assigned: Rohit Sharma (TechCorp Solutions)',
    time: '2m ago',
    unread: true,
    category: 'Leads'
  },
  {
    id: 'notif-2',
    type: 'appointment',
    title: 'Demo confirmed - Priya Verma (Today 02:30 PM)',
    time: '12m ago',
    unread: true,
    category: 'Appointments'
  },
  {
    id: 'notif-3',
    type: 'ai',
    title: 'Sales Agent handled 12 conversations with 98% accuracy',
    time: '25m ago',
    unread: true,
    category: 'System'
  }
];

export const INITIAL_COMPANY_PROFILE = {
  name: 'ABC Technologies',
  tagline: 'We build innovative software solutions for businesses worldwide.',
  industry: 'Software / IT Company',
  industryCategory: 'Software / IT',
  website: 'www.abctechnologies.com',
  email: 'admin@abctech.com',
  phone: '+91 44 4567 8901',
  address: '123 Tech Park, OMR Road, Chennai, Tamil Nadu - 600097',
  timezone: '(GMT+05:30) India Standard Time',
  currency: 'INR - Indian Rupee (₹)',
  logoText: 'ABC',
  plan: 'Professional',
  totalUsers: 12,
  activeAiAgents: 4,
  renewalDate: 'Nov 28, 2026'
};

export const INITIAL_SUBSCRIPTION_DATA = {
  planName: 'Pro Plan',
  billingCycle: 'Annual • Renews on Sep 28, 2027',
  price: '₹ 5,999 / month',
  usage: {
    aiMessages: { used: 4320, limit: 10000, label: '4,320 / 10,000' },
    aiAgents: { used: 4, limit: 5, label: '4 / 5' },
    storage: { used: 3.2, limit: 10, label: '3.2 GB / 10 GB' },
    connectedChannels: { used: 4, limit: 6, label: '4 / 6' }
  },
  invoices: [
    { id: 'INV-2026-001', date: '28 Sep 2026', amount: '₹ 5,999', status: 'Paid' },
    { id: 'INV-2026-002', date: '28 Aug 2026', amount: '₹ 5,999', status: 'Paid' },
    { id: 'INV-2026-003', date: '28 Jul 2026', amount: '₹ 5,999', status: 'Paid' }
  ],
  paymentMethod: {
    type: 'Visa',
    last4: '4242',
    expires: '12/28'
  }
};

export const INITIAL_INTEGRATIONS = [
  { id: 'whatsapp', name: 'WhatsApp Cloud API', desc: 'Direct WhatsApp Bot & unified inbox', status: 'Connected', icon: 'MessageSquare' },
  { id: 'email', name: 'Email (Gmail / Outlook)', desc: 'Omnichannel email syncing & AI drafts', status: 'Connected', icon: 'Mail' },
  { id: 'instagram', name: 'Instagram DM', desc: 'Auto-reply to Instagram story & DMs', status: 'Connected', icon: 'Instagram' },
  { id: 'calendar', name: 'Google Calendar', desc: 'Real-time appointment slot booking', status: 'Connected', icon: 'Calendar' },
  { id: 'crm_api', name: 'CRM & Webhook API', desc: 'Sync leads to external ERP / databases', status: 'Not Connected', icon: 'Code' }
];

export const TREND_DATA = [
  { day: 'Sep 28', leads: 32, conversions: 2 },
  { day: 'Sep 29', leads: 48, conversions: 4 },
  { day: 'Sep 30', leads: 39, conversions: 3 },
  { day: 'Oct 1', leads: 54, conversions: 5 },
  { day: 'Oct 2', leads: 42, conversions: 3 },
  { day: 'Oct 3', leads: 68, conversions: 6 },
  { day: 'Oct 4', leads: 58, conversions: 5 },
];
