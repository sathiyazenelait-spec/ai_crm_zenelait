import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_METRICS,
  INITIAL_LEADS,
  INITIAL_CUSTOMERS,
  INITIAL_CONVERSATIONS,
  INITIAL_AI_AGENTS,
  INITIAL_APPOINTMENTS,
  INITIAL_DOCUMENTS,
  INITIAL_AUTOMATIONS,
  INITIAL_TEAM_MEMBERS,
  INITIAL_NOTIFICATIONS,
  INITIAL_COMPANY_PROFILE,
  INITIAL_SUBSCRIPTION_DATA,
  INITIAL_OPPORTUNITIES,
  INITIAL_TASKS,
  INITIAL_TEMPLATES,
  INITIAL_INTEGRATIONS,
  INITIAL_AI_ACTIVITY_FEED,
  PIPELINE_STAGES,
  LEAD_SOURCES_DATA,
  TREND_DATA
} from '../data/mockData';
import {
  INDUSTRY_PRESETS,
  MOCK_TENANTS,
  PLATFORM_ROLES,
  MVP_ROLES,
  INDUSTRY_SPECIFIC_DATA
} from '../data/industryData';
import {
  INITIAL_AI_EMPLOYEES,
  INITIAL_AI_EMPLOYEE_TASKS,
  INITIAL_AI_EXECUTION_LOG,
  getTenantAiEmployees,
  getTenantAiTasks
} from '../data/aiEmployeeData';

export const PLATFORM_ROOT_COMPANY_PROFILE = {
  name: 'Zenelait AI Platform Root',
  industry: 'Universal SaaS Platform',
  domain: 'zenelait.ai',
  phone: '+1 (800) ZENELAIT',
  email: 'root@zenelait.ai',
  address: 'Global Multi-Tenant Cloud Infrastructure',
  tagline: 'Omnipotent Multi-Company Management Engine',
  description: 'Global maintenance control over all companies, global AI fleet, and security lockdown.',
  timezone: '(GMT+00:00) UTC / Global',
  currency: 'USD / INR ($ / ₹)',
  logoLetter: '👑',
  color: '#d97706',
  totalUsers: 'All Platform Users',
  activeAiAgents: 36,
  plan: 'Supreme God Mode (Omnipotent)',
  renewalDate: 'Perpetual License'
};

export const GOD_MODE_SUBSCRIPTION_DATA = {
  plan: 'Supreme God Mode (Omnipotent)',
  planName: 'Supreme God Mode (Omnipotent Platform License)',
  billingCycle: 'Platform Root • Unrestricted Lifetime Enterprise Infrastructure',
  price: 'Platform Unlimited (Free Root License)',
  status: 'Active',
  seats: 'Unlimited Users',
  renewalDate: 'Perpetual / Never Expires',
  usage: {
    aiMessages: { used: 142000, limit: 'Unlimited', label: '142,000 / Unlimited' },
    aiAgents: { used: 36, limit: 'Unlimited', label: '36 / Unlimited Agents' },
    storage: { used: 142.5, limit: 'Unlimited', label: '142.5 GB / Unlimited' },
    connectedChannels: { used: 24, limit: 'Unlimited', label: '24 / Unlimited Channels' }
  },
  invoices: [
    { id: 'INV-ROOT-001', date: '01 Nov 2026', amount: '₹0 (Platform License)', status: 'Paid' },
    { id: 'INV-ROOT-002', date: '01 Oct 2026', amount: '₹0 (Platform License)', status: 'Paid' },
    { id: 'INV-ROOT-003', date: '01 Sep 2026', amount: '₹0 (Platform License)', status: 'Paid' }
  ],
  paymentMethod: {
    type: 'Omnipotent Platform Root Account',
    last4: 'ROOT',
    expires: 'Lifetime'
  }
};


const CRMContext = createContext();

export function CRMProvider({ children }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedLeadId, setSelectedLeadId] = useState('lead-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  
  // Modals state
  const [activeModal, setActiveModal] = useState(null); 

  // Navigation View Mode: 'public' | 'login' | 'app'
  const [viewMode, setViewMode] = useState('public');

  // Authentication States
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    name: 'Sathiyaseelan',
    email: 'admin@abctech.com',
    role: 'Company Admin',
    avatar: 'S',
    tenantId: 'tenant-1'
  });

  // Multi-Tenant & Industry States
  const [tenants, setTenants] = useState(() => {
    try {
      const saved = localStorage.getItem('zenelait_registered_tenants');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const customIds = new Set(parsed.map(t => t.id));
          return [...parsed, ...MOCK_TENANTS.filter(t => !customIds.has(t.id))];
        }
      }
    } catch (e) {
      console.error('Error loading tenants from localStorage:', e);
    }
    return MOCK_TENANTS;
  });

  const [activeTenantId, setActiveTenantId] = useState(() => {
    try {
      const last = localStorage.getItem('zenelait_active_tenant_id');
      if (last) return last;
    } catch (e) {}
    return 'tenant-1';
  });
  const [isPlatformView, setIsPlatformView] = useState(false);
  const [activeIndustryId, setActiveIndustryId] = useState('software_it');
  const [currentUserRole, setCurrentUserRole] = useState('Company Owner / Company Admin');
  const [currentUserName, setCurrentUserName] = useState('Sathiyaseelan');

  // Ultra Super Admin Delegated Support Access Session State
  const [impersonationSession, setImpersonationSession] = useState({
    isActive: false,
    tenantId: null,
    tenantName: '',
    reason: '',
    accessMode: 'READ_ONLY',
    startedAt: null,
    expiresAt: null
  });

  // Regulated Financial Approval Queue
  const [approvalQueue, setApprovalQueue] = useState([
    {
      id: 'appr-1',
      tenantId: 'tenant-9',
      customerName: 'Sanjay Dutt (Dutt Enterprises)',
      requestType: 'Commercial Expansion Loan Term Sheet',
      amount: '₹50,00,000 @ 8.75%',
      riskGrade: 'Low Risk (CIBIL 780+)',
      aiConfidence: '98.5%',
      aiSummary: 'Turnover ₹3.2 Cr, clean 3-yr ITR verified. AI generated term sheet #LN-500 requires human RM sign-off.',
      status: 'Pending Approval',
      submittedAt: '10 mins ago',
      assignedRM: 'Anita Sharma (Sr. RM)'
    }
  ]);

  // Current active industry preset & tenant
  const currentIndustry = INDUSTRY_PRESETS[activeIndustryId] || INDUSTRY_PRESETS.software_it;
  const currentTenant = tenants.find(t => t.id === activeTenantId) || tenants[0];

  // Data states
  const [metrics, setMetrics] = useState(INITIAL_METRICS);
  const [leads, setLeads] = useState(INITIAL_LEADS);
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  const [activeChatId, setActiveChatId] = useState('conv-1');
  const [aiAgents, setAiAgents] = useState(INITIAL_AI_AGENTS);
  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);
  const [documents, setDocuments] = useState(INITIAL_DOCUMENTS);
  const [automations, setAutomations] = useState(INITIAL_AUTOMATIONS);
  const [teamMembers, setTeamMembers] = useState(INITIAL_TEAM_MEMBERS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [companyProfile, setCompanyProfile] = useState(INITIAL_COMPANY_PROFILE);
  const [subscriptionData, setSubscriptionData] = useState(INITIAL_SUBSCRIPTION_DATA);
  const [opportunities, setOpportunities] = useState(INITIAL_OPPORTUNITIES);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [templates, setTemplates] = useState(INITIAL_TEMPLATES);
  const [integrations, setIntegrations] = useState(INITIAL_INTEGRATIONS);
  const [aiActivityFeed, setAiActivityFeed] = useState(INITIAL_AI_ACTIVITY_FEED);
  const [pipelineStages, setPipelineStages] = useState(PIPELINE_STAGES);
  const [leadSources, setLeadSources] = useState(LEAD_SOURCES_DATA);

  // Industry-specific dashboard profiles dictionary for 9 tenants
  const TENANT_DASHBOARD_CONFIG = {
    software_it: {
      metrics: {
        totalLeads: { value: 248, change: '+12%', period: 'vs last week', isPositive: true },
        qualifiedLeads: { value: 89, change: '+18%', period: 'vs last week', isPositive: true },
        appointmentsBooked: { value: 42, change: '+25%', period: 'vs last week', isPositive: true },
        conversions: { value: 18, change: '+35%', period: 'vs last week', isPositive: true },
        avgResponseTime: { value: '2m 34s', change: '+42%', period: 'vs last week', isPositive: true }
      },
      pipelineStages: [
        { id: 'new', name: 'New Leads', count: 248, percentage: 100, color: 'blue' },
        { id: 'contacted', name: 'Contacted', count: 187, percentage: 75, color: 'cyan' },
        { id: 'qualified', name: 'Qualified', count: 89, percentage: 36, color: 'emerald' },
        { id: 'proposal', name: 'Proposal', count: 46, percentage: 19, color: 'amber' },
        { id: 'won', name: 'Won', count: 18, percentage: 7, color: 'purple' }
      ],
      leadSources: [
        { name: 'Website', percentage: 42, color: '#3b82f6', count: 104 },
        { name: 'WhatsApp', percentage: 23, color: '#10b981', count: 57 },
        { name: 'Email', percentage: 15, color: '#f59e0b', count: 37 },
        { name: 'Instagram', percentage: 8, color: '#ec4899', count: 20 },
        { name: 'Referral', percentage: 7, color: '#8b5cf6', count: 17 },
        { name: 'Others', percentage: 5, color: '#6b7280', count: 13 }
      ],
      conversations: [
        { id: 'conv-1', customer: 'Priya Sharma', email: 'priya@company.com', phone: '+91 98765 43210', channel: 'Website', lastMessage: 'I want to know more about your enterprise plan for 50 users...', status: 'AI Responded', assignedTo: 'AI Agent', time: '2m ago' },
        { id: 'conv-2', customer: 'Rahul Mehta', email: 'rahul@global.com', phone: '+91 98764 32109', channel: 'WhatsApp', lastMessage: 'Can you share the quotation for 50 users?', status: 'Waiting', assignedTo: 'Sales Team', time: '12m ago' },
        { id: 'conv-3', customer: 'Sneha Iyer', email: 'sneha@fresh.com', phone: '+91 98763 21098', channel: 'Email', lastMessage: 'Thanks for the demo. I have a few questions on API rate limits.', status: 'Human Handover', assignedTo: 'Anita Sharma', time: '25m ago' },
        { id: 'conv-4', customer: 'Vikram Singh', email: 'vikram@bright.com', phone: '+91 98762 10987', channel: 'Instagram', lastMessage: 'Do you provide 24/7 support on weekends?', status: 'AI Responded', assignedTo: 'AI Agent', time: '38m ago' },
        { id: 'conv-5', customer: 'Ananya Roy', email: 'ananya@fintech.com', phone: '+91 98761 09876', channel: 'Website', lastMessage: 'Requesting a detailed security & SOC2 compliance sheet...', status: 'Lead Captured', assignedTo: 'Sales Team', time: '1h ago' }
      ],
      aiActivityFeed: [
        { id: 'feed-1', text: 'Sales Agent qualified a new lead (Rohit Verma - 120 seats)', time: '2m ago', color: '#3b82f6', agent: 'Sales Agent' },
        { id: 'feed-2', text: 'Support Agent resolved API Webhook debugging query', time: '12m ago', color: '#10b981', agent: 'Support Agent' },
        { id: 'feed-3', text: 'Follow-up Agent sent trial re-engagement email drip', time: '25m ago', color: '#f59e0b', agent: 'Follow-up Agent' },
        { id: 'feed-4', text: 'Appointment Agent booked architecture walkthrough demo', time: '38m ago', color: '#8b5cf6', agent: 'Appointment Agent' },
        { id: 'feed-5', text: 'AI generated technical lead summary for Vikram Mehta', time: '1h ago', color: '#06b6d4', agent: 'AI Core' }
      ]
    },
    real_estate: {
      metrics: {
        totalLeads: { value: 312, change: '+16%', period: 'vs last week', isPositive: true },
        qualifiedLeads: { value: 124, change: '+22%', period: 'vs last week', isPositive: true },
        appointmentsBooked: { value: 58, change: '+30%', period: 'vs last week', isPositive: true },
        conversions: { value: 14, change: '+40%', period: 'vs last week', isPositive: true },
        avgResponseTime: { value: '1m 45s', change: '+55%', period: 'vs last week', isPositive: true }
      },
      pipelineStages: [
        { id: 'inquiry', name: 'Property Inquiries', count: 312, percentage: 100, color: 'blue' },
        { id: 'verified', name: 'BHK Verified', count: 245, percentage: 78, color: 'cyan' },
        { id: 'site_visit', name: 'Site Visit Booked', count: 124, percentage: 40, color: 'emerald' },
        { id: 'negotiation', name: 'Price Negotiation', count: 48, percentage: 15, color: 'amber' },
        { id: 'token_advance', name: 'Token Advance', count: 14, percentage: 4, color: 'purple' }
      ],
      leadSources: [
        { name: 'MagicBricks', percentage: 38, color: '#10b981', count: 118 },
        { name: '99acres', percentage: 26, color: '#3b82f6', count: 81 },
        { name: 'WhatsApp', percentage: 18, color: '#25d366', count: 56 },
        { name: 'Website', percentage: 10, color: '#8b5cf6', count: 31 },
        { name: 'Referral', percentage: 8, color: '#f59e0b', count: 26 }
      ],
      conversations: [
        { id: 'conv-re-1', customer: 'Karthik Subramanian', email: 'karthik.sub@gmail.com', phone: '+91 98401 22334', channel: 'Website', lastMessage: 'Looking for 2BHK under ₹60 Lakh in OMR with covered parking...', status: 'AI Responded', assignedTo: 'AI Property Agent', time: '3m ago' },
        { id: 'conv-re-2', customer: 'Pooja Hegde', email: 'pooja@investcorp.in', phone: '+91 98402 33445', channel: 'WhatsApp', lastMessage: 'Can you send the 3D VR walkthrough video for Azure Penthouse?', status: 'Waiting', assignedTo: 'Sales Manager', time: '15m ago' },
        { id: 'conv-re-3', customer: 'Suresh Menon', email: 'suresh.m@yahoo.com', phone: '+91 98403 44556', channel: 'Email', lastMessage: 'Confirmed Saturday 11:00 AM site visit with free pickup cab.', status: 'AI Responded', assignedTo: 'AI Appointment Agent', time: '28m ago' },
        { id: 'conv-re-4', customer: 'Anand Chandran', email: 'anand.c@gmail.com', phone: '+91 98404 55667', channel: 'Instagram', lastMessage: 'Are ready-to-move villas available in Phase 2?', status: 'Lead Captured', assignedTo: 'Sales Team', time: '45m ago' }
      ],
      aiActivityFeed: [
        { id: 'feed-re-1', text: 'AI Property Agent shared 2BHK floor plan PDF with Karthik Subramanian', time: '3m ago', color: '#10b981', agent: 'AI Property Agent' },
        { id: 'feed-re-2', text: 'AI Appointment Agent booked Saturday 11:00 AM Site Tour & pass', time: '15m ago', color: '#3b82f6', agent: 'AI Appointment Agent' },
        { id: 'feed-re-3', text: 'AI Follow-up Agent sent price drop notification for Tower B', time: '32m ago', color: '#f59e0b', agent: 'AI Follow-up Agent' },
        { id: 'feed-re-4', text: 'AI Scored High Intent Buyer (Score: 95 - Ready in 60 days)', time: '50m ago', color: '#8b5cf6', agent: 'AI Scoring Engine' }
      ]
    },
    education: {
      metrics: {
        totalLeads: { value: 420, change: '+20%', period: 'vs last week', isPositive: true },
        qualifiedLeads: { value: 185, change: '+15%', period: 'vs last week', isPositive: true },
        appointmentsBooked: { value: 76, change: '+34%', period: 'vs last week', isPositive: true },
        conversions: { value: 32, change: '+28%', period: 'vs last week', isPositive: true },
        avgResponseTime: { value: '1m 15s', change: '+60%', period: 'vs last week', isPositive: true }
      },
      pipelineStages: [
        { id: 'inquiry', name: 'Course Inquiries', count: 420, percentage: 100, color: 'blue' },
        { id: 'evaluated', name: 'Profile Evaluated', count: 310, percentage: 74, color: 'cyan' },
        { id: 'demo_class', name: 'Demo Class Booked', count: 185, percentage: 44, color: 'emerald' },
        { id: 'counseling', name: 'Fee Counseling', count: 82, percentage: 20, color: 'amber' },
        { id: 'enrolled', name: 'Enrolled Students', count: 32, percentage: 8, color: 'purple' }
      ],
      leadSources: [
        { name: 'Instagram', percentage: 40, color: '#ec4899', count: 168 },
        { name: 'Website', percentage: 30, color: '#8b5cf6', count: 126 },
        { name: 'WhatsApp', percentage: 15, color: '#10b981', count: 63 },
        { name: 'YouTube', percentage: 10, color: '#ef4444', count: 42 },
        { name: 'Referral', percentage: 5, color: '#f59e0b', count: 21 }
      ],
      conversations: [
        { id: 'conv-edu-1', customer: 'Rohan Deshmukh', email: 'rohan.desh@gmail.com', phone: '+91 97654 88990', channel: 'Website', lastMessage: 'What is the Java Full Stack 16-week weekend fee and EMI options?', status: 'AI Responded', assignedTo: 'AI Admission Agent', time: '4m ago' },
        { id: 'conv-edu-2', customer: 'Simran Kaur', email: 'simran.k@yahoo.com', phone: '+91 97654 99001', channel: 'Instagram', lastMessage: 'Does your Python AI Bootcamp include 100% placement support?', status: 'Waiting', assignedTo: 'Counsellor', time: '18m ago' }
      ],
      aiActivityFeed: [
        { id: 'feed-edu-1', text: 'AI Admission Agent sent Java Full Stack syllabus PDF to Rohan', time: '4m ago', color: '#8b5cf6', agent: 'AI Admission Agent' },
        { id: 'feed-edu-2', text: 'AI Follow-up Agent registered seat for Saturday Live Masterclass', time: '18m ago', color: '#3b82f6', agent: 'AI Follow-up Agent' },
        { id: 'feed-edu-3', text: 'AI calculated No-Cost EMI installment breakdown (₹4,500/mo)', time: '40m ago', color: '#10b981', agent: 'AI Engine' }
      ]
    },
    hospitals: {
      metrics: {
        totalLeads: { value: 560, change: '+24%', period: 'vs last week', isPositive: true },
        qualifiedLeads: { value: 290, change: '+19%', period: 'vs last week', isPositive: true },
        appointmentsBooked: { value: 112, change: '+38%', period: 'vs last week', isPositive: true },
        conversions: { value: 98, change: '+42%', period: 'vs last week', isPositive: true },
        avgResponseTime: { value: '48s', change: '+70%', period: 'vs last week', isPositive: true }
      },
      pipelineStages: [
        { id: 'query', name: 'Patient Inbound', count: 560, percentage: 100, color: 'blue' },
        { id: 'triaged', name: 'Symptom Triaged', count: 420, percentage: 75, color: 'cyan' },
        { id: 'matched', name: 'Specialist Chamber', count: 290, percentage: 52, color: 'emerald' },
        { id: 'scheduled', name: 'OPD Booked', count: 112, percentage: 20, color: 'amber' },
        { id: 'consulted', name: 'Consultation Done', count: 98, percentage: 17, color: 'purple' }
      ],
      leadSources: [
        { name: 'Phone Bot', percentage: 44, color: '#ef4444', count: 246 },
        { name: 'WhatsApp', percentage: 28, color: '#10b981', count: 157 },
        { name: 'Website', percentage: 18, color: '#3b82f6', count: 101 },
        { name: 'Emergency Desk', percentage: 10, color: '#f59e0b', count: 56 }
      ],
      conversations: [
        { id: 'conv-hosp-1', customer: 'Sunil Gavaskar', email: 'sunil.g@outlook.com', phone: '+91 99887 66554', channel: 'Website', lastMessage: 'Chest discomfort on exertion. Need a Cardiologist appointment today.', status: 'AI Responded', assignedTo: 'AI Receptionist', time: '1m ago' },
        { id: 'conv-hosp-2', customer: 'Meera Nambiar', email: 'meera.n@gmail.com', phone: '+91 99887 77665', channel: 'WhatsApp', lastMessage: 'Need Saturday 10:30 AM slot for skin allergy consultation.', status: 'Waiting', assignedTo: 'Reception Desk', time: '14m ago' }
      ],
      aiActivityFeed: [
        { id: 'feed-hosp-1', text: 'AI Receptionist triaged priority cardiology patient & generated token #CARD-819', time: '1m ago', color: '#ef4444', agent: 'AI Receptionist' },
        { id: 'feed-hosp-2', text: 'AI Appointment Agent booked 03:00 PM slot with Dr. Anand Raman', time: '10m ago', color: '#3b82f6', agent: 'AI Appointment Agent' },
        { id: 'feed-hosp-3', text: 'AI Health Pass sent QR check-in instructions over WhatsApp', time: '22m ago', color: '#10b981', agent: 'AI Core' }
      ]
    },
    ecommerce: {
      metrics: {
        totalLeads: { value: 890, change: '+32%', period: 'vs last week', isPositive: true },
        qualifiedLeads: { value: 440, change: '+28%', period: 'vs last week', isPositive: true },
        appointmentsBooked: { value: 165, change: '+45%', period: 'vs last week', isPositive: true },
        conversions: { value: 124, change: '+38%', period: 'vs last week', isPositive: true },
        avgResponseTime: { value: '35s', change: '+80%', period: 'vs last week', isPositive: true }
      },
      pipelineStages: [
        { id: 'visitor', name: 'Shopper Inbound', count: 890, percentage: 100, color: 'blue' },
        { id: 'product_match', name: 'Product Matched', count: 620, percentage: 70, color: 'cyan' },
        { id: 'cart', name: 'Cart Added', count: 440, percentage: 49, color: 'emerald' },
        { id: 'checkout', name: 'Checkout Started', count: 210, percentage: 24, color: 'amber' },
        { id: 'purchased', name: 'Order Placed', count: 124, percentage: 14, color: 'purple' }
      ],
      leadSources: [
        { name: 'Live Web Chat', percentage: 45, color: '#ec4899', count: 400 },
        { name: 'Instagram DM', percentage: 25, color: '#8b5cf6', count: 223 },
        { name: 'WhatsApp', percentage: 20, color: '#10b981', count: 178 },
        { name: 'SMS Broadcast', percentage: 10, color: '#3b82f6', count: 89 }
      ],
      conversations: [
        { id: 'conv-ec-1', customer: 'Aditya Birla', email: 'aditya.creations@gmail.com', phone: '+91 91234 88776', channel: 'Website', lastMessage: 'Which laptop under ₹80k do you recommend for Premiere Pro 4K editing?', status: 'AI Responded', assignedTo: 'AI Sales Agent', time: '2m ago' },
        { id: 'conv-ec-2', customer: 'Tanvi Shah', email: 'tanvi.shah@gmail.com', phone: '+91 91234 99887', channel: 'WhatsApp', lastMessage: 'Where is my order #US-8942?', status: 'AI Responded', assignedTo: 'AI Support Agent', time: '12m ago' }
      ],
      aiActivityFeed: [
        { id: 'feed-ec-1', text: 'AI Support Agent pulled Bluedart live GPS transit ETA for #US-8942', time: '2m ago', color: '#ec4899', agent: 'AI Support Agent' },
        { id: 'feed-ec-2', text: 'AI Sales Agent shared ASUS TUF A15 recommendation + 10% coupon', time: '14m ago', color: '#3b82f6', agent: 'AI Sales Agent' },
        { id: 'feed-ec-3', text: 'AI Order Agent generated reverse-pickup barcode for return #RET-441', time: '30m ago', color: '#10b981', agent: 'AI Order Agent' }
      ]
    },
    hospitality: {
      metrics: {
        totalLeads: { value: 340, change: '+18%', period: 'vs last week', isPositive: true },
        qualifiedLeads: { value: 180, change: '+22%', period: 'vs last week', isPositive: true },
        appointmentsBooked: { value: 92, change: '+35%', period: 'vs last week', isPositive: true },
        conversions: { value: 46, change: '+40%', period: 'vs last week', isPositive: true },
        avgResponseTime: { value: '1m 20s', change: '+65%', period: 'vs last week', isPositive: true }
      },
      pipelineStages: [
        { id: 'inquiry', name: 'Room Inquiries', count: 340, percentage: 100, color: 'blue' },
        { id: 'checked', name: 'Dates Checked', count: 260, percentage: 76, color: 'cyan' },
        { id: 'quoted', name: 'Villa Quoted', count: 180, percentage: 53, color: 'emerald' },
        { id: 'reserved', name: 'Reservation Locked', count: 92, percentage: 27, color: 'amber' },
        { id: 'confirmed', name: 'Booking Confirmed', count: 46, percentage: 14, color: 'purple' }
      ],
      leadSources: [
        { name: 'Website', percentage: 40, color: '#f59e0b', count: 136 },
        { name: 'WhatsApp', percentage: 30, color: '#10b981', count: 102 },
        { name: 'Instagram', percentage: 18, color: '#ec4899', count: 61 },
        { name: 'Booking.com', percentage: 12, color: '#3b82f6', count: 41 }
      ],
      conversations: [
        { id: 'conv-hot-1', customer: 'Arjun Kapoor', email: 'arjun.k@kapoorcorp.com', phone: '+91 98111 22334', channel: 'WhatsApp', lastMessage: 'Sea view villa for 2 adults, 3 nights Nov 14-17 with candle dinner...', status: 'AI Responded', assignedTo: 'AI Reservation Agent', time: '3m ago' },
        { id: 'conv-hot-2', customer: 'Nisha Singhania', email: 'nisha@singhaniagroup.com', phone: '+91 98111 33445', channel: 'Email', lastMessage: 'Need corporate offsite quote for 25 rooms with banquet hall.', status: 'Waiting', assignedTo: 'Reservation Manager', time: '20m ago' }
      ],
      aiActivityFeed: [
        { id: 'feed-hot-1', text: 'AI Reservation Agent locked Oceanfront Villa #104 for Nov 14-17', time: '3m ago', color: '#f59e0b', agent: 'AI Reservation Agent' },
        { id: 'feed-hot-2', text: 'AI Concierge dispatched airport luxury pickup voucher', time: '16m ago', color: '#3b82f6', agent: 'AI Support Agent' },
        { id: 'feed-hot-3', text: 'AI Follow-up Agent sent TripAdvisor 5-star review discount code', time: '42m ago', color: '#10b981', agent: 'AI Follow-up Agent' }
      ]
    },
    travel: {
      metrics: {
        totalLeads: { value: 290, change: '+15%', period: 'vs last week', isPositive: true },
        qualifiedLeads: { value: 145, change: '+24%', period: 'vs last week', isPositive: true },
        appointmentsBooked: { value: 68, change: '+30%', period: 'vs last week', isPositive: true },
        conversions: { value: 28, change: '+36%', period: 'vs last week', isPositive: true },
        avgResponseTime: { value: '1m 50s', change: '+50%', period: 'vs last week', isPositive: true }
      },
      pipelineStages: [
        { id: 'discovery', name: 'Trip Discovery', count: 290, percentage: 100, color: 'blue' },
        { id: 'itinerary', name: 'Itinerary Drafted', count: 210, percentage: 72, color: 'cyan' },
        { id: 'proposal', name: 'Proposal Sent', count: 145, percentage: 50, color: 'emerald' },
        { id: 'visa_tickets', name: 'Visa & Tickets', count: 68, percentage: 23, color: 'amber' },
        { id: 'booked', name: 'Trip Confirmed', count: 28, percentage: 10, color: 'purple' }
      ],
      leadSources: [
        { name: 'Website', percentage: 42, color: '#06b6d4', count: 122 },
        { name: 'WhatsApp', percentage: 26, color: '#10b981', count: 75 },
        { name: 'Instagram', percentage: 18, color: '#ec4899', count: 52 },
        { name: 'Referral', percentage: 14, color: '#8b5cf6', count: 41 }
      ],
      conversations: [
        { id: 'conv-trv-1', customer: 'Rajesh Khanna', email: 'rajesh.khanna@biz.in', phone: '+91 97111 44556', channel: 'Website', lastMessage: 'Need 5-day Dubai trip for 4 adults in Dec with 4-star hotel & desert safari.', status: 'AI Responded', assignedTo: 'AI Travel Agent', time: '5m ago' },
        { id: 'conv-trv-2', customer: 'Siddharth Roy', email: 'sid.roy@gmail.com', phone: '+91 97111 55667', channel: 'WhatsApp', lastMessage: 'What are the document requirements for Switzerland Schengen visa?', status: 'Waiting', assignedTo: 'Travel Consultant', time: '30m ago' }
      ],
      aiActivityFeed: [
        { id: 'feed-trv-1', text: 'AI Travel Agent drafted custom 5D/4N Dubai itinerary PDF for Rajesh Khanna', time: '5m ago', color: '#06b6d4', agent: 'AI Travel Agent' },
        { id: 'feed-trv-2', text: 'AI Booking Agent verified passport scans for tourist visa', time: '20m ago', color: '#3b82f6', agent: 'AI Booking Agent' },
        { id: 'feed-trv-3', text: 'AI Follow-up Agent dispatched 48h pre-departure luggage packing guide', time: '45m ago', color: '#10b981', agent: 'AI Follow-up Agent' }
      ]
    },
    manufacturing_b2b: {
      metrics: {
        totalLeads: { value: 175, change: '+14%', period: 'vs last week', isPositive: true },
        qualifiedLeads: { value: 82, change: '+20%', period: 'vs last week', isPositive: true },
        appointmentsBooked: { value: 48, change: '+28%', period: 'vs last week', isPositive: true },
        conversions: { value: 16, change: '+35%', period: 'vs last week', isPositive: true },
        avgResponseTime: { value: '2m 10s', change: '+45%', period: 'vs last week', isPositive: true }
      },
      pipelineStages: [
        { id: 'rfq', name: 'RFQ Received', count: 175, percentage: 100, color: 'blue' },
        { id: 'moq_check', name: 'MOQ Checked', count: 120, percentage: 69, color: 'cyan' },
        { id: 'drawing_review', name: 'Tech Drawing Review', count: 82, percentage: 47, color: 'emerald' },
        { id: 'proforma', name: 'Proforma Quoted', count: 48, percentage: 27, color: 'amber' },
        { id: 'po_won', name: 'PO Received', count: 16, percentage: 9, color: 'purple' }
      ],
      leadSources: [
        { name: 'Corporate Email', percentage: 48, color: '#d97706', count: 84 },
        { name: 'Website B2B', percentage: 28, color: '#3b82f6', count: 49 },
        { name: 'Trade India', percentage: 14, color: '#10b981', count: 25 },
        { name: 'Dealer Network', percentage: 10, color: '#8b5cf6', count: 17 }
      ],
      conversations: [
        { id: 'conv-mfg-1', customer: 'Girish Kulkarni', email: 'girish@kulkarnipumps.com', phone: '+91 94222 66778', channel: 'Email', lastMessage: 'RFQ for 500 units Model HV-40 Hydraulic Valves in SS-316 grade for Pune plant...', status: 'AI Responded', assignedTo: 'AI B2B Sales Agent', time: '6m ago' },
        { id: 'conv-mfg-2', customer: 'Harish Mehta', email: 'harish@mehtadealers.com', phone: '+91 94222 77889', channel: 'Website', lastMessage: 'Applying for regional dealership distributorship in Gujarat corridor.', status: 'Waiting', assignedTo: 'Dealer Manager', time: '40m ago' }
      ],
      aiActivityFeed: [
        { id: 'feed-mfg-1', text: 'AI B2B Sales Agent generated Opportunity #OPP-500-HV (₹12,50,000) for Girish', time: '6m ago', color: '#d97706', agent: 'AI B2B Sales Agent' },
        { id: 'feed-mfg-2', text: 'AI Support Agent dispatched SS-316 tolerance datasheet & ISO certificate', time: '25m ago', color: '#3b82f6', agent: 'AI Support Agent' },
        { id: 'feed-mfg-3', text: 'AI Dealer Agent routed Gujarat distributorship inquiry to Senior Manager', time: '1h ago', color: '#10b981', agent: 'AI Dealer Agent' }
      ]
    },
    financial_services: {
      metrics: {
        totalLeads: { value: 230, change: '+16%', period: 'vs last week', isPositive: true },
        qualifiedLeads: { value: 110, change: '+22%', period: 'vs last week', isPositive: true },
        appointmentsBooked: { value: 44, change: '+32%', period: 'vs last week', isPositive: true },
        conversions: { value: 22, change: '+38%', period: 'vs last week', isPositive: true },
        avgResponseTime: { value: '1m 30s', change: '+60%', period: 'vs last week', isPositive: true }
      },
      pipelineStages: [
        { id: 'inquiry', name: 'Loan Inquiries', count: 230, percentage: 100, color: 'blue' },
        { id: 'screened', name: 'Risk & KYC Screened', count: 160, percentage: 70, color: 'cyan' },
        { id: 'approval_gate', name: 'Human RM Approval', count: 110, percentage: 48, color: 'emerald' },
        { id: 'term_sheet', name: 'Term Sheet Sent', count: 44, percentage: 19, color: 'amber' },
        { id: 'disbursed', name: 'Disbursed / Active', count: 22, percentage: 10, color: 'purple' }
      ],
      leadSources: [
        { name: 'Website', percentage: 45, color: '#059669', count: 104 },
        { name: 'WhatsApp', percentage: 25, color: '#10b981', count: 58 },
        { name: 'Corporate Referral', percentage: 20, color: '#3b82f6', count: 46 },
        { name: 'Bank Partner', percentage: 10, color: '#f59e0b', count: 22 }
      ],
      conversations: [
        { id: 'conv-fin-1', customer: 'Sanjay Dutt', email: 'sanjay.dutt@duttenterprises.com', phone: '+91 98220 11223', channel: 'Website', lastMessage: 'Need ₹50 Lakh commercial expansion loan. Turnover ₹3.2 Cr, CIBIL 780+...', status: 'AI Responded', assignedTo: 'AI Qualification Agent', time: '2m ago' },
        { id: 'conv-fin-2', customer: 'Kavita Menon', email: 'kavita.menon@wealthcorp.in', phone: '+91 98220 22334', channel: 'WhatsApp', lastMessage: 'Portfolio restructuring for ₹2.5 Cr corpus seeking tax-efficient growth.', status: 'Waiting', assignedTo: 'Relationship Manager', time: '25m ago' }
      ],
      aiActivityFeed: [
        { id: 'feed-fin-1', text: 'AI Risk Engine screened ₹50L Commercial Loan (Score: 98) & queued for RM sign-off', time: '2m ago', color: '#059669', agent: 'AI Risk Engine' },
        { id: 'feed-fin-2', text: 'AI Support Agent generated FY26 Tax Deduction 80C Investment Summary PDF', time: '18m ago', color: '#3b82f6', agent: 'AI Support Agent' },
        { id: 'feed-fin-3', text: 'AI Follow-up Agent sent annual KYC periodic verification reminder', time: '40m ago', color: '#10b981', agent: 'AI Follow-up Agent' }
      ]
    }
  };

  // Helper to persist custom tenant changes to localStorage
  const persistTenantData = (tenantId, updates) => {
    if (!tenantId) return;
    const isCustom = tenantId.startsWith('TEN-') || tenants.find(t => t.id === tenantId)?.isCustomRegistered;
    if (!isCustom) return;
    try {
      const key = `zenelait_tenant_data_${tenantId}`;
      const existing = JSON.parse(localStorage.getItem(key) || '{}');
      const merged = { ...existing, ...updates };
      localStorage.setItem(key, JSON.stringify(merged));
    } catch (e) {
      console.error('Error persisting tenant data:', e);
    }
  };

  // Helper to dynamically recalculate metrics and pipeline stages from real records
  const updateDynamicStats = (leadList = [], apptList = appointments) => {
    const total = leadList.length;
    const qual = leadList.filter(l => (l.status || '').toLowerCase().includes('qual') || (l.stage || '').toLowerCase().includes('qual')).length;
    const won = leadList.filter(l => (l.status || '').toLowerCase().includes('won') || (l.status || '').toLowerCase().includes('convert') || (l.stage || '').toLowerCase().includes('won')).length;
    const appts = apptList ? apptList.length : 0;

    setMetrics({
      totalLeads: { value: total, change: total > 0 ? '+100%' : '0%', period: 'active records', isPositive: true },
      qualifiedLeads: { value: qual, change: qual > 0 ? '+100%' : '0%', period: 'active records', isPositive: true },
      appointmentsBooked: { value: appts, change: appts > 0 ? '+100%' : '0%', period: 'active records', isPositive: true },
      conversions: { value: won, change: won > 0 ? '+100%' : '0%', period: 'active records', isPositive: true },
      avgResponseTime: { value: '< 30s', change: 'AI Autonomous', period: 'real-time', isPositive: true }
    });

    const newC = leadList.filter(l => (l.status || '').toLowerCase().includes('new') || !l.status).length;
    const contactC = leadList.filter(l => (l.status || '').toLowerCase().includes('contact')).length;
    const propC = leadList.filter(l => (l.status || '').toLowerCase().includes('prop') || (l.stage || '').toLowerCase().includes('prop')).length;

    setPipelineStages([
      { id: 'new', name: 'New Inbound', count: newC, percentage: total ? Math.round((newC / total) * 100) : 0, color: 'blue' },
      { id: 'contacted', name: 'Contacted', count: contactC, percentage: total ? Math.round((contactC / total) * 100) : 0, color: 'cyan' },
      { id: 'qualified', name: 'Qualified', count: qual, percentage: total ? Math.round((qual / total) * 100) : 0, color: 'emerald' },
      { id: 'proposal', name: 'Proposal / Demo', count: propC, percentage: total ? Math.round((propC / total) * 100) : 0, color: 'amber' },
      { id: 'won', name: 'Closed / Converted', count: won, percentage: total ? Math.round((won / total) * 100) : 0, color: 'purple' }
    ]);

    const srcCounts = {};
    leadList.forEach(l => {
      const s = l.source || 'Website';
      srcCounts[s] = (srcCounts[s] || 0) + 1;
    });

    if (total > 0) {
      const palette = ['#3b82f6', '#10b981', '#06b6d4', '#f59e0b', '#8b5cf6'];
      setLeadSources(Object.entries(srcCounts).map(([name, count], idx) => ({
        name,
        count,
        percentage: Math.round((count / total) * 100),
        color: palette[idx % palette.length]
      })));
    } else {
      setLeadSources([
        { name: 'Website Form', percentage: 0, color: '#3b82f6', count: 0 },
        { name: 'Direct Referral', percentage: 0, color: '#10b981', count: 0 },
        { name: 'WhatsApp Bot', percentage: 0, color: '#06b6d4', count: 0 },
        { name: 'Inbound Call', percentage: 0, color: '#f59e0b', count: 0 }
      ]);
    }
  };

  // Sync data when tenant or industry switches
  useEffect(() => {
    const isUltraUser = currentUserRole === 'Ultra Super Admin' || currentUserRole?.includes('God') || currentUserRole?.toLowerCase().includes('ultra');
    if (isUltraUser && (isPlatformView || activeTenantId === 'platform-root')) {
      setCompanyProfile(PLATFORM_ROOT_COMPANY_PROFILE);
      setSubscriptionData(GOD_MODE_SUBSCRIPTION_DATA);
      return;
    }

    const preset = INDUSTRY_PRESETS[activeIndustryId] || INDUSTRY_PRESETS.software_it;
    const selectedTenant = tenants.find(t => t.id === activeTenantId) || tenants[0];
    const dashboardConfig = TENANT_DASHBOARD_CONFIG[activeIndustryId] || TENANT_DASHBOARD_CONFIG.software_it;

    if (!selectedTenant) return;

    try {
      localStorage.setItem('zenelait_active_tenant_id', selectedTenant.id);
    } catch (e) {}

    const isCustomTenant = Boolean(selectedTenant.isCustomRegistered || (selectedTenant.id && selectedTenant.id.startsWith('TEN-')));

    if (isCustomTenant) {
      // 1. Load tenant dynamic store from localStorage
      let tenantStore = null;
      try {
        const raw = localStorage.getItem(`zenelait_tenant_data_${selectedTenant.id}`);
        if (raw) tenantStore = JSON.parse(raw);
      } catch (e) {
        console.error('Error reading tenant store:', e);
      }

      const cleanDomain = selectedTenant.website
        ? selectedTenant.website.replace(/^https?:\/\//, '').replace(/\/.*$/, '')
        : `${selectedTenant.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;

      const tenantLeads = tenantStore?.leads || [];
      const tenantCustomers = tenantStore?.customers || [];
      const tenantAppts = tenantStore?.appointments || [];
      const tenantOpps = tenantStore?.opportunities || [];
      const tenantConvs = tenantStore?.conversations || [];
      const tenantTasks = tenantStore?.tasks || [];
      const tenantTeam = (tenantStore?.teamMembers && tenantStore.teamMembers.length > 0)
        ? tenantStore.teamMembers
        : [
            {
              id: `usr-owner-${selectedTenant.id}`,
              name: selectedTenant.ownerName || currentUserName || 'Company Owner',
              email: selectedTenant.hrContact || selectedTenant.ownerEmail || `admin@${cleanDomain}`,
              role: 'Company Owner / Company Admin',
              department: 'Executive Management',
              status: 'Active',
              leadsHandled: 0,
              phone: selectedTenant.phone || '+91 90000 00000',
              access: 'Full Company Admin'
            }
          ];

      const tenantProfile = tenantStore?.companyProfile || {
        name: selectedTenant.name,
        industry: preset?.name || 'Software / IT Company',
        domain: cleanDomain,
        phone: selectedTenant.phone || '+91 90000 00000',
        email: selectedTenant.hrContact || selectedTenant.ownerEmail || `admin@${cleanDomain}`,
        address: selectedTenant.address || 'Corporate Tech Park, India',
        tagline: `${selectedTenant.name} Enterprise Workspace`,
        description: `Official enterprise workspace for ${selectedTenant.name} on Zenelait AI CRM.`,
        timezone: '(GMT+05:30) India Standard Time',
        currency: 'INR - Indian Rupee (₹)',
        logoLetter: selectedTenant.logoLetter || selectedTenant.name.substring(0, 2).toUpperCase(),
        color: selectedTenant.color || '#2563eb',
        totalUsers: selectedTenant.seats || 25,
        activeAiAgents: 4,
        plan: selectedTenant.plan || 'Professional',
        renewalDate: 'Oct 22, 2027'
      };

      const tenantFeed = tenantStore?.aiActivityFeed || [
        {
          id: `feed-${selectedTenant.id}-1`,
          text: `🎉 Workspace ${selectedTenant.name} activated under ${selectedTenant.plan || 'Professional'} Plan with ₹0 Free Trial. Welcome, Company Owner!`,
          time: 'Just now',
          color: '#10b981',
          agent: 'System'
        }
      ];

      // Update state for custom tenant
      setCompanyProfile(tenantProfile);
      setSubscriptionData(prev => ({
        ...INITIAL_SUBSCRIPTION_DATA,
        ...prev,
        plan: selectedTenant.plan || 'Professional',
        planName: `${selectedTenant.plan || 'Professional'} Plan`,
        billingCycle: 'Annual • Free Trial Renews Oct 22, 2027',
        price: '₹0 (Promotional Free Trial)',
        status: 'Active',
        seats: selectedTenant.seats || 25,
        renewalDate: 'Oct 22, 2027',
        usage: prev?.usage || INITIAL_SUBSCRIPTION_DATA.usage,
        invoices: prev?.invoices || INITIAL_SUBSCRIPTION_DATA.invoices,
        paymentMethod: prev?.paymentMethod || INITIAL_SUBSCRIPTION_DATA.paymentMethod
      }));
      setLeads(tenantLeads);
      setCustomers(tenantCustomers);
      setAppointments(tenantAppts);
      setOpportunities(tenantOpps);
      setConversations(tenantConvs);
      setTasks(tenantTasks);
      setTeamMembers(tenantTeam);
      setAiActivityFeed(tenantFeed);

      // Compute dynamic metrics & pipeline stages strictly from real records
      updateDynamicStats(tenantLeads, tenantAppts);

      // Hydrate 9-Tenant-Wise AI Employee Fleet & Domain Tasks
      const tenantInd = selectedTenant.industryId || selectedTenant.industry || activeIndustryId;
      setAiEmployeesList(getTenantAiEmployees(tenantInd));
      setAiEmployeeTasks(getTenantAiTasks(tenantInd));

      // Initialize AI employees tailored to this company with clean 0 stats
      const initialCustomAgents = (preset?.aiEmployees || []).map((ae, idx) => ({
        id: ae.id || `agent-${idx}`,
        name: ae.name,
        role: ae.role,
        description: ae.description,
        status: ae.status || 'Active',
        leads: 0,
        appointments: 0,
        resolved: 0,
        satisfaction: '5.0/5.0',
        conversionRate: '0%',
        activeConversations: 0,
        accuracy: ae.accuracy || '99%',
        performance: 100,
        channels: ae.channels || ['Website', 'WhatsApp'],
        capabilities: ae.capabilities,
        guardrails: ae.guardrails,
        avatar: ae.avatar
      }));
      setAiAgents(initialCustomAgents);

      const isSuperAdminOrUltra = currentUserRole === 'Ultra Super Admin' || currentUserRole?.includes('God') || currentUserRole?.toLowerCase().includes('ultra') || currentUserRole === 'Super Admin' || currentUserRole === 'Platform Super Admin';
      if (!isSuperAdminOrUltra) {
        setCurrentUserRole('Company Owner / Company Admin');
        if (selectedTenant.ownerName) {
          setCurrentUserName(selectedTenant.ownerName);
        }
      }

    } else {
      // 2. Demo preset tenant (retains showcase demo data)
      setCompanyProfile({
        name: selectedTenant.name,
        industry: preset.name,
        domain: preset.domain || 'company.com',
        phone: selectedTenant.phone || '+91 44 4567 8901',
        email: selectedTenant.hrContact || `admin@${preset.domain || 'company.com'}`,
        address: selectedTenant.address || 'Chennai, Tamil Nadu, India',
        tagline: preset.tagline,
        description: preset.description,
        timezone: '(GMT+05:30) India Standard Time',
        currency: 'INR - Indian Rupee (₹)',
        logoLetter: selectedTenant.logoLetter || selectedTenant.name.substring(0, 2).toUpperCase(),
        color: selectedTenant.color || preset.color,
        totalUsers: selectedTenant.seats || 25,
        activeAiAgents: preset.aiEmployees.length || 4,
        plan: selectedTenant.plan || 'Professional',
        renewalDate: 'Nov 28, 2026'
      });

      setSubscriptionData(prev => ({
        ...INITIAL_SUBSCRIPTION_DATA,
        ...prev,
        plan: selectedTenant.plan || 'Professional',
        planName: `${selectedTenant.plan || 'Professional'} Plan`,
        billingCycle: 'Annual • Renews Nov 28, 2026',
        price: selectedTenant.mrr ? selectedTenant.mrr.split('/')[0] : '₹5,999 / month',
        status: 'Active',
        seats: selectedTenant.seats || 25,
        renewalDate: 'Nov 28, 2026',
        usage: prev?.usage || INITIAL_SUBSCRIPTION_DATA.usage,
        invoices: prev?.invoices || INITIAL_SUBSCRIPTION_DATA.invoices,
        paymentMethod: prev?.paymentMethod || INITIAL_SUBSCRIPTION_DATA.paymentMethod
      }));

      if (dashboardConfig.metrics) setMetrics(dashboardConfig.metrics);
      if (dashboardConfig.pipelineStages) setPipelineStages(dashboardConfig.pipelineStages);
      if (dashboardConfig.leadSources) setLeadSources(dashboardConfig.leadSources);
      if (dashboardConfig.conversations) setConversations(dashboardConfig.conversations);
      if (dashboardConfig.aiActivityFeed) setAiActivityFeed(dashboardConfig.aiActivityFeed);

      const newAgents = preset.aiEmployees.map((ae, idx) => ({
        id: ae.id || `agent-${idx}`,
        name: ae.name,
        role: ae.role,
        description: ae.description,
        status: ae.status || 'Active',
        leads: Math.floor(Math.random() * 60) + 30,
        appointments: Math.floor(Math.random() * 25) + 10,
        resolved: Math.floor(Math.random() * 100) + 50,
        satisfaction: '4.9/5.0',
        conversionRate: `${Math.floor(Math.random() * 25) + 25}%`,
        activeConversations: Math.floor(Math.random() * 15) + 4,
        accuracy: ae.accuracy || '98%',
        performance: 92,
        channels: ae.channels || ['Website', 'WhatsApp'],
        capabilities: ae.capabilities,
        guardrails: ae.guardrails,
        avatar: ae.avatar
      }));
      setAiAgents(newAgents);

      // Hydrate 9-Tenant-Wise AI Employee Fleet & Domain Tasks
      setAiEmployeesList(getTenantAiEmployees(activeIndustryId));
      setAiEmployeeTasks(getTenantAiTasks(activeIndustryId));

      const indData = INDUSTRY_SPECIFIC_DATA[activeIndustryId];
      if (indData && indData.leads) {
        setLeads(indData.leads);
      } else {
        setLeads(INITIAL_LEADS);
      }
      if (indData && indData.appointments) {
        setAppointments(indData.appointments);
      } else {
        setAppointments(INITIAL_APPOINTMENTS);
      }

      const generatedTeam = preset.humanRoles.map((hr, i) => ({
        id: `team-ind-${i}`,
        name: i === 0 ? 'Sathiyaseelan' : i === 1 ? 'Rahul Kumar' : i === 2 ? 'Sneha Iyer' : i === 3 ? 'Anita Sharma' : 'Karthik Patel',
        email: `${(i === 0 ? 'admin' : i === 1 ? 'rahul' : i === 2 ? 'sneha' : i === 3 ? 'anita' : 'karthik')}@${preset.domain || 'company.com'}`,
        role: hr.name,
        department: hr.dept,
        status: 'Active',
        leadsHandled: Math.floor(Math.random() * 50) + 15,
        access: hr.access
      }));
      setTeamMembers(generatedTeam);

      const isSuperAdminOrUltra = currentUserRole === 'Ultra Super Admin' || currentUserRole?.includes('God') || currentUserRole?.toLowerCase().includes('ultra') || currentUserRole === 'Super Admin' || currentUserRole === 'Platform Super Admin';
      if (!isSuperAdminOrUltra) {
        const validRole = preset.humanRoles.find(r => r.name === currentUserRole);
        if (!validRole) {
          setCurrentUserRole(preset.humanRoles[0]?.name || 'Company Admin');
        }
      }
    }
  }, [activeIndustryId, activeTenantId, isPlatformView]);

  // Audited access state for Platform Super Admin
  const [auditedPrivacyAccess, setAuditedPrivacyAccess] = useState(false);

  // Ultra Super Admin Global Engine States
  const [isEmergencyLockdown, setIsEmergencyLockdown] = useState(false);
  const [globalAiConfig, setGlobalAiConfig] = useState({
    primaryModel: 'Claude 3.5 Sonnet (Enterprise)',
    fallbackModel: 'GPT-4o (High Concurrency)',
    embeddingModel: 'text-embedding-3-large',
    temperature: 0.25,
    maxTokens: 4096,
    vectorStatus: 'All 9 Tenant Vectors Active',
    tokenBurnRateMonthly: '$1,428.50',
    globalRateLimitPerMin: 12000
  });

  const [systemBackups, setSystemBackups] = useState([
    { id: 'bak-1', timestamp: 'Today, 04:00 AM UTC', size: '14.2 GB', type: 'Automated Snapshot', status: 'Completed', storage: 'AWS S3 Glacier Multi-Region' },
    { id: 'bak-2', timestamp: 'Yesterday, 04:00 AM UTC', size: '13.9 GB', type: 'Automated Snapshot', status: 'Completed', storage: 'AWS S3 Glacier Multi-Region' }
  ]);

  const [globalAnnouncements, setGlobalAnnouncements] = useState([
    { id: 'ann-1', title: 'Zenelait AI 2.0 Engine Live', message: 'All 9 tenant vector embedding pipelines upgraded to sub-20ms latency.', timestamp: '1 hour ago', priority: 'High' }
  ]);

  // Role Detection and Permission Matrix
  const getRolePermissions = (roleName) => {
    const roleLower = (roleName || '').toLowerCase();
    const isUltraSuperAdmin = roleLower.includes('ultra') || roleLower.includes('god') || roleName === 'Ultra Super Admin';
    const isSuperAdmin = isUltraSuperAdmin || roleLower.includes('super admin') || roleLower.includes('platform super admin');
    const isCompanyAdmin = roleLower.includes('admin') || roleLower.includes('owner') || roleLower.includes('hospital admin') || roleLower.includes('store admin') || roleLower.includes('hotel admin');
    const isSalesManager = roleLower.includes('sales manager') || roleLower.includes('admission manager') || roleLower.includes('reservation manager') || roleLower.includes('dealer manager') || roleLower.includes('head of sales');
    const isSupportManager = roleLower.includes('support manager') || roleLower.includes('head of support');
    const isMarketingManager = roleLower.includes('marketing manager') || roleLower.includes('head of marketing');
    const isSalesRepresentative = roleLower.includes('executive') || roleLower.includes('consultant') || roleLower.includes('representative') || roleLower.includes('sales rep') || roleLower.includes('counsellor') || roleLower.includes('relationship manager') || roleLower.includes('sdr') || roleLower.includes('ae');
    const isSupportAgent = !isSupportManager && (roleLower.includes('support') || roleLower.includes('receptionist') || roleLower.includes('desk') || roleLower.includes('coordinator') || roleLower.includes('triage') || roleLower.includes('patient care'));
    const isAnalyst = roleLower.includes('analyst') || roleLower.includes('viewer');
    const isHr = roleLower === 'hr' || roleLower.includes('hr role') || roleLower.includes('human resources') || roleLower.includes('hr executive') || roleLower.includes('hr manager');
    const isRealEstateSalesManager = (roleLower.includes('sales manager') || roleLower.includes('salesmanager')) && (activeIndustryId === 'real_estate');
    const isRealEstateSalesExecutive = (roleLower.includes('property sales') || roleLower.includes('sales executive') || roleLower.includes('real estate sales executive')) && (activeIndustryId === 'real_estate');
    const isRealEstateCrmManager = (roleLower.includes('customer relationship') || roleLower.includes('customer relations') || roleLower.includes('crm manager')) && (activeIndustryId === 'real_estate');
    const isRealEstateCoordinator = (roleLower.includes('site visit coordinator') || roleLower.includes('visit coordinator') || roleLower.includes('coordinator')) && (activeIndustryId === 'real_estate');

    return {
      isUltraSuperAdmin,
      isSuperAdmin,
      isCompanyAdmin,
      isSalesManager,
      isSupportManager,
      isMarketingManager,
      isSalesRepresentative,
      isSupportAgent,
      isAnalyst,
      isHr,
      isRealEstateSalesManager,
      isRealEstateSalesExecutive,
      isRealEstateCrmManager,
      isRealEstateCoordinator,
      canManageAllCompanies: isUltraSuperAdmin || isSuperAdmin,
      canImpersonateAnyTenant: isUltraSuperAdmin,
      canManagePlatform: isSuperAdmin,
      canManageCompany: isCompanyAdmin || isSuperAdmin,
      canManageBilling: isSuperAdmin || isCompanyAdmin,
      canConfigureAI: isCompanyAdmin || isUltraSuperAdmin,
      canAssignLeads: isCompanyAdmin || isSalesManager || isMarketingManager || isUltraSuperAdmin,
      canEditLeads: isCompanyAdmin || isSalesManager || isMarketingManager || isSalesRepresentative || isUltraSuperAdmin,
      canTakeoverSupport: isCompanyAdmin || isSupportManager || isSupportAgent || isSalesRepresentative || isSalesManager || isUltraSuperAdmin,
      canModifyWorkflows: isCompanyAdmin || isSalesManager || isSupportManager || isUltraSuperAdmin,
      isReadOnly: (isAnalyst && !isCompanyAdmin && !isSalesManager && !isSupportManager && !isMarketingManager && !isSalesRepresentative && !isSupportAgent && !isUltraSuperAdmin),
      canExportData: true,
      hasAuditedPrivacyGuardrail: (isSuperAdmin && !isUltraSuperAdmin),
      canSwitchRoles: (isCompanyAdmin || isSuperAdmin || isUltraSuperAdmin),

      // Education / Training Tenant AI Permissions (Section 11 Spec)
      canViewAiAdmission: isCompanyAdmin || isSuperAdmin || roleLower.includes('admission') || roleLower.includes('counsellor') || roleLower.includes('counselor') || roleLower.includes('student support'),
      canConfigureAiAdmission: isCompanyAdmin || isSuperAdmin || roleLower.includes('admission manager'),
      canViewAiAdmissionMetrics: isCompanyAdmin || isSuperAdmin || roleLower.includes('admission manager'),
      canCreateAdmissionLeads: isCompanyAdmin || isSuperAdmin || roleLower.includes('admission'),
      canViewAiFollowups: isCompanyAdmin || isSuperAdmin || roleLower.includes('admission'),
      canConfigureAiFollowups: isCompanyAdmin || isSuperAdmin || roleLower.includes('admission manager'),
      canApproveAiFollowups: isCompanyAdmin || isSuperAdmin || roleLower.includes('admission manager'),
      canSendAiFollowups: isCompanyAdmin || isSuperAdmin || roleLower.includes('admission manager'),
      canCreateFollowupDraft: isCompanyAdmin || isSuperAdmin || roleLower.includes('admission'),
      canViewAiFollowupMetrics: isCompanyAdmin || isSuperAdmin || roleLower.includes('admission manager'),

      // Hospital / Clinic Tenant Role Permissions (Section 8 Spec)
      isReceptionManager: roleLower.includes('reception manager') || currentUserRole === 'RECEPTION_MANAGER',
      isReceptionist: roleLower.includes('receptionist') || currentUserRole === 'RECEPTIONIST',
      isCustomerSupport: roleLower.includes('customer support') || currentUserRole === 'CUSTOMER_SUPPORT',
      isAppointmentCoordinator: roleLower.includes('appointment coordinator') || currentUserRole === 'APPOINTMENT_COORDINATOR',
      isDoctorStaff: roleLower.includes('doctor') || roleLower.includes('staff') || currentUserRole === 'DOCTOR' || currentUserRole === 'STAFF',
      isAiReceptionist: roleLower.includes('ai receptionist') || currentUserRole === 'AI_RECEPTIONIST',
      isAiAppointmentAgent: roleLower.includes('ai appointment') || currentUserRole === 'AI_APPOINTMENT_AGENT',
      canManageReceptionStaff: isCompanyAdmin || isSuperAdmin || roleLower.includes('reception manager'),
      canCheckInAppointments: isCompanyAdmin || isSuperAdmin || roleLower.includes('receptionist') || roleLower.includes('reception manager') || roleLower.includes('appointment coordinator'),
      canCoordinateAppointments: isCompanyAdmin || isSuperAdmin || roleLower.includes('appointment coordinator') || roleLower.includes('reception manager'),
      canManageSupportTickets: isCompanyAdmin || isSuperAdmin || roleLower.includes('customer support') || roleLower.includes('support manager') || roleLower.includes('reception manager'),
      canApproveAiSupportDrafts: isCompanyAdmin || isSuperAdmin || roleLower.includes('customer support') || roleLower.includes('support manager'),

      // E-Commerce Tenant Role Permissions (Section 6.3 Spec)
      isEcommerceSalesManager: roleLower.includes('sales manager') || currentUserRole === 'SALES_MANAGER' || currentUserRole === 'ECOMMERCE_SALES_MANAGER',
      isEcommerceSupportManager: roleLower.includes('customer support manager') || (roleLower.includes('support manager') && !roleLower.includes('reception')) || currentUserRole === 'SUPPORT_MANAGER' || currentUserRole === 'ECOMMERCE_SUPPORT_MANAGER',
      isEcommerceSupportAgent: roleLower.includes('support agent') || currentUserRole === 'SUPPORT_AGENT' || currentUserRole === 'ECOMMERCE_SUPPORT_AGENT',
      isEcommerceOrderManager: roleLower.includes('order manager') || currentUserRole === 'ORDER_MANAGER' || currentUserRole === 'ECOMMERCE_ORDER_MANAGER',
      isEcommerceAiSalesAgent: roleLower.includes('ai sales') || currentUserRole === 'AI_SALES_AGENT',
      isEcommerceAiSupportAgent: roleLower.includes('ai support') || currentUserRole === 'AI_SUPPORT_AGENT',
      isEcommerceAiOrderAgent: roleLower.includes('ai order') || currentUserRole === 'AI_ORDER_AGENT',
      canManageEcommerceCampaigns: isCompanyAdmin || isSuperAdmin || roleLower.includes('sales manager'),
      canApproveEcommerceRefunds: isCompanyAdmin || isSuperAdmin || roleLower.includes('order manager'),
      canExecuteEcommerceRefunds: isCompanyAdmin || isSuperAdmin || roleLower.includes('order manager'),
      canSubmitEcommerceRefundRequests: isCompanyAdmin || isSuperAdmin || roleLower.includes('support agent') || roleLower.includes('order manager'),
      canManageFulfilment: isCompanyAdmin || isSuperAdmin || roleLower.includes('order manager'),

      // Hotel Tenant Role Permissions
      isHotelReservationManager: roleLower.includes('reservation manager') || currentUserRole === 'RESERVATION_MANAGER' || currentUserRole === 'HOTEL_RESERVATION_MANAGER',
      isHotelReservationExecutive: roleLower.includes('reservation executive') || currentUserRole === 'RESERVATION_EXECUTIVE' || currentUserRole === 'HOTEL_RESERVATION_EXECUTIVE',
      isHotelCustomerSupport: roleLower.includes('customer support') || (roleLower.includes('support') && !roleLower.includes('manager')) || currentUserRole === 'CUSTOMER_SUPPORT' || currentUserRole === 'HOTEL_CUSTOMER_SUPPORT',
      isHotelFrontDesk: roleLower.includes('front desk') || roleLower.includes('reception') || currentUserRole === 'FRONT_DESK' || currentUserRole === 'HOTEL_FRONT_DESK',
      isHotelAiReservationAgent: roleLower.includes('ai reservation') || currentUserRole === 'AI_RESERVATION_AGENT',
      isHotelAiSupportAgent: roleLower.includes('ai support') || currentUserRole === 'AI_SUPPORT_AGENT',
      isHotelAiFollowUpAgent: roleLower.includes('ai follow-up') || roleLower.includes('ai followup') || currentUserRole === 'AI_FOLLOW_UP_AGENT'
    };
  };

  const currentRolePermissions = getRolePermissions(currentUserRole);

  // Smart Credential & Domain-to-Company Resolver
  const resolveCredentials = (email = '', explicitRole = null) => {
    const rawEmail = (email || '').trim().toLowerCase();
    const [prefix, domain] = rawEmail.includes('@') ? rawEmail.split('@') : [rawEmail, ''];

    let matchedTenant = tenants[0];
    let detectedRole = explicitRole || 'Company Owner / Company Admin';
    let matchedIndustryId = 'software_it';
    let isGodMode = false;
    let matchedMember = null;

    let formattedName = prefix ? prefix.split('.')[0] : 'User';
    formattedName = formattedName.charAt(0).toUpperCase() + formattedName.slice(1);
    if (prefix.includes('rahul')) {
      formattedName = 'Rahul Kumar';
    } else if (prefix.includes('.')) {
      const parts = prefix.split('.');
      formattedName = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
    }

    // Check if email belongs to an invited team member under any registered custom tenant
    for (const t of tenants) {
      if (t.isCustomRegistered || (t.id && t.id.startsWith('TEN-'))) {
        try {
          const rawStore = localStorage.getItem(`zenelait_tenant_data_${t.id}`);
          if (rawStore) {
            const storeData = JSON.parse(rawStore);
            const found = (storeData.teamMembers || []).find(m => m.email && m.email.toLowerCase() === rawEmail);
            if (found) {
              matchedMember = { tenant: t, member: found };
              break;
            }
          }
        } catch (e) {}
      }
    }

    // 1. Check for Ultra God-Mode / Root Admin
    if (
      prefix.includes('root') ||
      prefix.includes('god') ||
      prefix.includes('ultra') ||
      domain.includes('zenelait.ai') ||
      explicitRole === 'Ultra Super Admin'
    ) {
      return {
        tenant: {
          id: 'platform-root',
          name: 'Zenelait AI Platform Root',
          industryId: 'universal_saas',
          plan: 'Supreme God Mode (Omnipotent)',
          color: '#d97706',
          logoLetter: '👑'
        },
        tenantId: 'platform-root',
        companyName: 'Zenelait AI Platform Root',
        industryId: 'universal_saas',
        industryName: 'Universal SaaS Platform',
        role: 'Ultra Super Admin',
        name: 'Master Chief (God Mode)',
        email: rawEmail || 'root@zenelait.ai',
        isGodMode: true
      };
    }
    // 2. Priority check: Custom registered tenants (Company Owner by email/domain)
    else if (
      tenants.some(t =>
        (t.isCustomRegistered || (t.id && t.id.startsWith('TEN-'))) &&
        ((t.ownerEmail && t.ownerEmail.toLowerCase() === rawEmail) ||
         (t.hrContact && t.hrContact.toLowerCase() === rawEmail) ||
         (t.website && domain && t.website.toLowerCase().includes(domain)))
      )
    ) {
      const customMatch = tenants.find(t =>
        (t.isCustomRegistered || (t.id && t.id.startsWith('TEN-'))) &&
        ((t.ownerEmail && t.ownerEmail.toLowerCase() === rawEmail) ||
         (t.hrContact && t.hrContact.toLowerCase() === rawEmail) ||
         (t.website && domain && t.website.toLowerCase().includes(domain)))
      );
      matchedTenant = customMatch;
      matchedIndustryId = customMatch.industryId || 'software_it';
      detectedRole = explicitRole || 'Company Owner / Company Admin';
      if (customMatch.ownerName) formattedName = customMatch.ownerName;
    }
    // 3. Priority check: Invited team members under any custom registered tenant
    else if (matchedMember) {
      matchedTenant = matchedMember.tenant;
      matchedIndustryId = matchedMember.tenant.industryId || 'software_it';
      detectedRole = explicitRole || matchedMember.member.role || 'Sales Representative';
      if (matchedMember.member.name) formattedName = matchedMember.member.name;
    }
    // 4. Map domain or keywords to demo presets
    else if (domain.includes('skyline') || domain.includes('realty') || domain.includes('property') || prefix.includes('realty')) {
      matchedTenant = tenants.find(t => t.id === 'tenant-2') || tenants[1];
      matchedIndustryId = 'real_estate';
    } else if (domain.includes('abctraining') || domain.includes('apexacademy') || domain.includes('edtech') || domain.includes('education') || domain.includes('edu')) {
      matchedTenant = tenants.find(t => t.id === 'TEN-EDU-001' || t.id === 'tenant-3') || tenants[2];
      matchedIndustryId = 'education';
    } else if (domain.includes('zenithhealth') || domain.includes('hospital') || domain.includes('clinic') || domain.includes('health') || domain.includes('citycare')) {
      matchedTenant = tenants.find(t => t.id === 'tenant-4') || tenants[3];
      matchedIndustryId = 'hospitals';
    } else if (domain.includes('urbanstyle') || domain.includes('shop') || domain.includes('store') || domain.includes('ecommerce') || domain.includes('shopease')) {
      matchedTenant = tenants.find(t => t.id === 'tenant-5') || tenants[4];
      matchedIndustryId = 'ecommerce';
    } else if (domain.includes('grandazure') || domain.includes('resort') || domain.includes('hotel') || domain.includes('hospitality')) {
      matchedTenant = tenants.find(t => t.id === 'tenant-6') || tenants[5];
      matchedIndustryId = 'hospitality';
    } else if (domain.includes('wanderlust') || domain.includes('tour') || domain.includes('travel') || domain.includes('wanderpro')) {
      matchedTenant = tenants.find(t => t.id === 'tenant-7') || tenants[6];
      matchedIndustryId = 'travel';
    } else if (domain.includes('industrial') || domain.includes('gear') || domain.includes('mfg') || domain.includes('globalindustries')) {
      matchedTenant = tenants.find(t => t.id === 'tenant-8') || tenants[7];
      matchedIndustryId = 'manufacturing_b2b';
    } else if (domain.includes('wealth') || domain.includes('advisory') || domain.includes('finance') || domain.includes('securewealth') || domain.includes('consulting') || domain.includes('zenith')) {
      matchedTenant = tenants.find(t => t.id === 'tenant-9') || tenants[8];
      matchedIndustryId = 'consulting';
    } else if (domain.includes('abctech') || domain.includes('software') || domain.includes('tech')) {
      matchedTenant = tenants.find(t => t.id === 'tenant-1') || tenants[0];
      matchedIndustryId = 'software_it';
    } else {
      // Default fallback based on tenant HR email match
      const byHr = tenants.find(t => t.hrContact && t.hrContact.toLowerCase().includes(domain));
      if (byHr) {
        matchedTenant = byHr;
        matchedIndustryId = byHr.industryId;
      }
    }

    // 3. Detect Role from prefix if not explicitly given
    if (!explicitRole && !isGodMode) {
      if (
        prefix.includes('reception.manager') ||
        prefix.includes('reception_mgr') ||
        (prefix.includes('reception') && prefix.includes('manager'))
      ) {
        detectedRole = 'Reception Manager';
      } else if (
        prefix.includes('receptionist') ||
        (matchedIndustryId === 'hospitals' && prefix.includes('reception'))
      ) {
        detectedRole = 'Receptionist';
      } else if (
        (matchedIndustryId === 'hospitals' && prefix.includes('support')) ||
        prefix.includes('customer_support')
      ) {
        detectedRole = 'Customer Support';
      } else if (
        prefix.includes('appointment.coord') ||
        prefix.includes('coordinator') ||
        (matchedIndustryId === 'hospitals' && prefix.includes('scheduling'))
      ) {
        detectedRole = 'Appointment Coordinator';
      } else if (
        prefix.includes('admission.mgr') ||
        prefix.includes('admission_mgr') ||
        (prefix.includes('admission') && prefix.includes('mgr'))
      ) {
        detectedRole = 'Admission Manager';
      } else if (
        prefix.includes('admission.exec') ||
        prefix.includes('admission_exec') ||
        prefix.includes('priya.exec')
      ) {
        detectedRole = 'Admission Executive';
      } else if (
        prefix.includes('counsellor') ||
        prefix.includes('counselor')
      ) {
        detectedRole = 'Counsellor';
      } else if (
        prefix.includes('student_support') ||
        (domain.includes('abctraining') && prefix.includes('support'))
      ) {
        detectedRole = 'Student Support Agent';
      } else if (
        prefix.includes('consultant') ||
        prefix.includes('travel_consultant') ||
        (matchedIndustryId === 'travel' && prefix.includes('consult'))
      ) {
        detectedRole = 'Travel Consultant';
      } else if (
        prefix.includes('booking') ||
        prefix.includes('booking_exec') ||
        (matchedIndustryId === 'travel' && prefix.includes('ops'))
      ) {
        detectedRole = 'Booking Executive';
      } else if (
        prefix.includes('sales.mgr') ||
        prefix.includes('salesmgr') ||
        prefix.includes('mgr') ||
        prefix.includes('manager') ||
        prefix.includes('rahul') ||
        prefix.includes('lead')
      ) {
        detectedRole = 'Sales Manager';
      } else if (
        prefix.includes('sales.rep') ||
        prefix.includes('salesrep') ||
        prefix.includes('rep') ||
        prefix.includes('sdr') ||
        prefix.includes('exec') ||
        prefix.includes('anita') ||
        prefix.includes('sneha')
      ) {
        detectedRole = 'Sales Representative';
      } else if (
        prefix.includes('support') ||
        prefix.includes('care') ||
        prefix.includes('desk') ||
        prefix.includes('help') ||
        prefix.includes('deepak')
      ) {
        detectedRole = 'Customer Support Agent';
      } else if (prefix.includes('analyst') || prefix.includes('viewer') || prefix.includes('bi')) {
        detectedRole = 'Analyst / Viewer';
      } else if (
        prefix.includes('kavitha') ||
        prefix.includes('hr') ||
        rawEmail.includes('hr@') ||
        rawEmail.includes('.hr@')
      ) {
        detectedRole = 'HR Role';
      } else if (
        prefix.includes('admin') ||
        prefix.includes('ceo') ||
        prefix.includes('founder') ||
        prefix.includes('owner') ||
        prefix.includes('ops') ||
        prefix.includes('gm') ||
        prefix.includes('sathiya')
      ) {
        detectedRole = 'Company Owner / Company Admin';
      } else {
        detectedRole = 'Company Owner / Company Admin';
      }
    }

    if (isGodMode) formattedName = 'Master Chief (God Mode)';

    return {
      tenant: matchedTenant,
      tenantId: matchedTenant?.id || 'tenant-1',
      companyName: matchedTenant?.name || 'ABC Technologies',
      industryId: matchedIndustryId,
      industryName: INDUSTRY_PRESETS[matchedIndustryId]?.name || 'Software / IT Company',
      role: detectedRole,
      name: formattedName,
      email: rawEmail || 'admin@abctech.com',
      isGodMode
    };
  };

  // Authentication Actions (Login & Logout Flow)
  const login = ({ email, password, role, companyId, name, tenantId, industryId, companyName, plan }) => {
    // If credentials entered, automatically resolve tenant and role if not specified
    const rawEmail = (email || '').trim().toLowerCase();
    const resolved = resolveCredentials(email, role);
    let targetTenantId = tenantId || companyId || resolved.tenantId;
    let matchedTenant = tenants.find(t => t.id === targetTenantId) || resolved.tenant;

    if (companyName && (!matchedTenant || matchedTenant.id.startsWith('tenant-'))) {
      const customFound = tenants.find(t => t.name.toLowerCase() === companyName.toLowerCase());
      if (customFound) {
        matchedTenant = customFound;
        targetTenantId = customFound.id;
      }
    }

    if (!matchedTenant) {
      matchedTenant = tenants[0];
    }

    const userRole = role || resolved.role || 'Company Owner / Company Admin';
    const isUltra =
      userRole === 'Ultra Super Admin' ||
      userRole.toLowerCase().includes('ultra') ||
      userRole.toLowerCase().includes('god') ||
      resolved.isGodMode;

    if (isUltra) {
      const superAdminName = name || resolved.name || 'Master Chief (God Mode)';
      setCurrentUserName(superAdminName);
      setCurrentUserRole('Ultra Super Admin');
      setIsPlatformView(true);
      setActiveTenantId('platform-root');
      setActiveIndustryId('universal_saas');
      setCompanyProfile(PLATFORM_ROOT_COMPANY_PROFILE);
      setSubscriptionData(GOD_MODE_SUBSCRIPTION_DATA);
      setCurrentUser({
        name: superAdminName,
        email: email || resolved.email || 'root@zenelait.ai',
        role: 'Ultra Super Admin',
        avatar: '👑',
        tenantId: 'platform-root'
      });
      setIsAuthenticated(true);
      setViewMode('app');
      setActiveTab('dashboard');

      addNotification({
        type: 'system',
        title: `👑 God-Mode Active: Logged in as Ultra Super Admin (Zenelait AI Platform Root)`,
        category: 'Auth'
      });
      return;
    }

    const userName = name || resolved.name || (email ? email.split('@')[0].replace('.', ' ') : 'Priya');
    const targetIndustryId = industryId || matchedTenant?.industryId || resolved.industryId || 'software_it';

    setCurrentUserName(userName);
    setCurrentUserRole(userRole);
    if (matchedTenant) {
      setActiveTenantId(matchedTenant.id);
      setActiveIndustryId(targetIndustryId);
      try {
        localStorage.setItem('zenelait_active_tenant_id', matchedTenant.id);
      } catch (e) {}
    }
    
    setCurrentUser({
      name: userName,
      email: email || resolved.email || 'priya@gmail.com',
      role: userRole,
      avatar: userName[0]?.toUpperCase() || 'P',
      tenantId: matchedTenant?.id || 'tenant-1'
    });

    const isSuperAdminRole =
      userRole.toLowerCase().includes('super admin');

    setIsPlatformView(isSuperAdminRole);
    setIsAuthenticated(true);
    setViewMode('app');
    setActiveTab('dashboard');

    addNotification({
      type: 'system',
      title: `Welcome back, ${userName}! Logged in to ${matchedTenant?.name || 'Workspace'} as ${userRole}`,
      category: 'Auth'
    });
  };

  // Register a brand new Tenant / Company with chosen package plan & initial 0-cost payment
  const registerTenant = ({ companyName, industryId, packagePlan, fullName, email, password, phone, website, address }) => {
    const tenantId = 'TEN-' + Math.random().toString(36).substring(2, 7).toUpperCase();
    const cleanDomain = website ? website.replace(/^https?:\/\//, '').replace(/\/.*$/, '') : (companyName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com');
    const newTenant = {
      id: tenantId,
      name: companyName,
      industryId: industryId || 'software_it',
      plan: packagePlan || 'Professional',
      seats: packagePlan === 'Enterprise' ? 100 : packagePlan === 'Starter' ? 5 : 25,
      hrContact: email,
      phone: phone || '+91 90000 00000',
      address: address || 'Corporate Tech Park, India',
      website: website || `https://${cleanDomain}`,
      color: '#2563eb',
      logoLetter: companyName.charAt(0).toUpperCase(),
      isCustomRegistered: true,
      ownerName: fullName,
      ownerEmail: email
    };

    // Clean dynamic starter dataset isolated for this new tenant
    const cleanTenantData = {
      leads: [],
      customers: [],
      appointments: [],
      opportunities: [],
      conversations: [],
      tasks: [],
      teamMembers: [
        {
          id: `usr-owner-${Date.now()}`,
          name: fullName,
          email: email,
          role: 'Company Owner / Company Admin',
          department: 'Executive Management',
          status: 'Active',
          leadsHandled: 0,
          phone: phone || '+91 90000 00000',
          access: 'Full Company Admin'
        }
      ],
      companyProfile: {
        name: companyName,
        industry: INDUSTRY_PRESETS[industryId || 'software_it']?.name || 'Software / IT Company',
        domain: cleanDomain,
        phone: phone || '+91 90000 00000',
        email: email,
        address: address || 'Corporate Tech Park, India',
        tagline: `${companyName} Enterprise Solutions`,
        description: `Official enterprise workspace for ${companyName} on Zenelait AI CRM.`,
        timezone: '(GMT+05:30) India Standard Time',
        currency: 'INR - Indian Rupee (₹)',
        logoLetter: companyName.charAt(0).toUpperCase(),
        color: '#2563eb',
        totalUsers: packagePlan === 'Enterprise' ? 100 : packagePlan === 'Starter' ? 5 : 25,
        activeAiAgents: 4,
        plan: packagePlan || 'Professional',
        renewalDate: 'Oct 22, 2027'
      },
      aiActivityFeed: [
        {
          id: `feed-init-${Date.now()}`,
          text: `🎉 Workspace ${companyName} activated under ${packagePlan} Plan with ₹0 Free Trial. Initialized for ${fullName} (Company Owner).`,
          time: 'Just now',
          color: '#10b981',
          agent: 'System'
        }
      ]
    };

    try {
      localStorage.setItem(`zenelait_tenant_data_${tenantId}`, JSON.stringify(cleanTenantData));
      const existingSaved = JSON.parse(localStorage.getItem('zenelait_registered_tenants') || '[]');
      localStorage.setItem('zenelait_registered_tenants', JSON.stringify([newTenant, ...existingSaved.filter(t => t.id !== tenantId)]));
      localStorage.setItem('zenelait_active_tenant_id', tenantId);
    } catch (e) {
      console.error('Storage error:', e);
    }

    setTenants(prev => [newTenant, ...prev.filter(t => t.id !== tenantId)]);
    setActiveTenantId(tenantId);
    setActiveIndustryId(industryId || 'software_it');
    setCurrentUserName(fullName);
    setCurrentUserRole('Company Owner / Company Admin');
    setCurrentUser({
      name: fullName,
      email: email,
      role: 'Company Owner / Company Admin',
      avatar: fullName.charAt(0).toUpperCase(),
      tenantId: tenantId
    });
    setIsAuthenticated(true);
    setViewMode('app');
    setActiveTab('dashboard');

    addNotification({
      type: 'system',
      title: `🎉 Workspace "${companyName}" created under ${packagePlan} Plan. Activated with ₹0 Free Trial. Welcome, Company Owner!`,
      category: 'Auth'
    });

    return newTenant;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setViewMode('public');
    addNotification({
      type: 'system',
      title: 'You have been logged out securely.',
      category: 'Auth'
    });
  };

  // Switch User Role
  const switchRole = (roleName, userName = null) => {
    setCurrentUserRole(roleName);
    const isUltra = roleName === 'Ultra Super Admin' || roleName.toLowerCase().includes('ultra') || roleName.toLowerCase().includes('god');
    if (isUltra) {
      setCurrentUserName(userName || 'Master Chief (God Mode)');
      setIsPlatformView(true);
      setActiveTenantId('platform-root');
      setActiveIndustryId('universal_saas');
      setCompanyProfile(PLATFORM_ROOT_COMPANY_PROFILE);
      setSubscriptionData(GOD_MODE_SUBSCRIPTION_DATA);
      setCurrentUser(prev => ({
        ...prev,
        name: userName || 'Master Chief (God Mode)',
        email: 'root@zenelait.ai',
        role: 'Ultra Super Admin',
        avatar: '👑',
        tenantId: 'platform-root'
      }));
    } else if (userName) {
      setCurrentUserName(userName);
    }
    addNotification({
      type: 'system',
      title: `Switched active role to ${roleName}`,
      category: 'System'
    });
  };

  // Ultra Super Admin: Audited Delegated Support Access (Controlled Impersonation)
  const startDelegatedAccess = (tenantId, reason = 'Administrative diagnostics & support', accessMode = 'READ_ONLY') => {
    const selected = tenants.find(t => t.id === tenantId);
    if (selected) {
      setImpersonationSession({
        isActive: true,
        tenantId,
        tenantName: selected.name,
        reason,
        accessMode,
        startedAt: new Date().toLocaleTimeString(),
        expiresAt: new Date(Date.now() + 30 * 60000).toLocaleTimeString()
      });
      setActiveTenantId(tenantId);
      setActiveIndustryId(selected.industryId);
      setIsPlatformView(false);
      setActiveTab('dashboard');
      addNotification({
        type: 'warning',
        title: `🛡️ Delegated Support Access Active: ${selected.name} (${accessMode})`,
        category: 'Security'
      });
    }
  };

  const terminateDelegatedAccess = () => {
    setImpersonationSession({
      isActive: false,
      tenantId: null,
      tenantName: '',
      reason: '',
      accessMode: 'READ_ONLY',
      startedAt: null,
      expiresAt: null
    });
    setIsPlatformView(true);
    setActiveTenantId('platform-root');
    setActiveIndustryId('universal_saas');
    setCompanyProfile(PLATFORM_ROOT_COMPANY_PROFILE);
    setSubscriptionData(GOD_MODE_SUBSCRIPTION_DATA);
    addNotification({
      type: 'system',
      title: 'Delegated support access session terminated. Returned to Platform Command Center.',
      category: 'Security'
    });
  };

  const impersonateTenant = (tenantId, reason, accessMode) => startDelegatedAccess(tenantId, reason, accessMode);

  // Ultra Super Admin: Update Live Tenant Quotas & Limits
  const updateTenantLimits = (tenantId, newLimits) => {
    setTenants(prev => prev.map(t => {
      if (t.id === tenantId) {
        return {
          ...t,
          seats: newLimits.seats !== undefined ? newLimits.seats : t.seats,
          plan: newLimits.plan || t.plan,
          mrr: newLimits.mrr || t.mrr,
          storageGB: newLimits.storageGB || t.storageGB || 100,
          aiMessagesLimit: newLimits.aiMessagesLimit || t.aiMessagesLimit || 50000,
          whatsappLimit: newLimits.whatsappLimit || t.whatsappLimit || 20000
        };
      }
      return t;
    }));
    addNotification({
      type: 'system',
      title: `Universal Quotas updated for tenant ID: ${tenantId}`,
      category: 'System'
    });
  };

  // Ultra Super Admin: Update Live Tenant Status (Active / Suspended / Maintenance)
  const updateTenantStatus = (tenantId, newStatus) => {
    setTenants(prev => prev.map(t => {
      if (t.id === tenantId) {
        return { ...t, status: newStatus };
      }
      return t;
    }));
    addNotification({
      type: 'system',
      title: `Tenant status changed to: ${newStatus}`,
      category: 'Platform'
    });
  };

  // Ultra Super Admin: Trigger Instant Database Snapshot Backup
  const triggerDatabaseBackup = () => {
    const newBackup = {
      id: `bak-${Date.now()}`,
      timestamp: 'Just now (Ultra Master Trigger)',
      size: '14.3 GB',
      type: 'Manual Master Snapshot',
      status: 'Completed',
      storage: 'AWS S3 Glacier Multi-Region'
    };
    setSystemBackups(prev => [newBackup, ...prev]);
    addNotification({
      type: 'system',
      title: 'Database snapshot backup triggered and stored in S3 Multi-Region',
      category: 'Security'
    });
  };

  // Ultra Super Admin: Toggle Emergency Platform Lockdown
  const toggleEmergencyLockdown = () => {
    setIsEmergencyLockdown(prev => {
      const nextState = !prev;
      addNotification({
        type: 'system',
        title: nextState ? '🚨 EMERGENCY PLATFORM LOCKDOWN ACTIVATED (Non-Super-Admins locked out)' : '✅ Platform lockdown deactivated - Normal operations restored',
        category: 'Security'
      });
      return nextState;
    });
  };

  // Ultra Super Admin: Broadcast Global Announcement
  const broadcastGlobalAnnouncement = (title, message, priority = 'High') => {
    const newAnn = {
      id: `ann-${Date.now()}`,
      title,
      message,
      timestamp: 'Just now',
      priority
    };
    setGlobalAnnouncements(prev => [newAnn, ...prev]);
    addNotification({
      type: 'system',
      title: `📢 Global Announcement broadcasted to all 9 tenant companies: ${title}`,
      category: 'Broadcast'
    });
  };

  // Ultra Super Admin: Update Global AI Config
  const updateGlobalAiConfig = (updatedFields) => {
    setGlobalAiConfig(prev => ({
      ...prev,
      ...updatedFields
    }));
    addNotification({
      type: 'system',
      title: 'Global AI Model Orchestration & Gateway config updated',
      category: 'AI Engine'
    });
  };

  // Reassign Lead to a Sales Rep (Sales Manager / Admin Action)
  const reassignLead = (leadId, newAssignee, assigneeRole = 'Sales Executive') => {
    setLeads(prev => prev.map(lead => {
      if (lead.id === leadId) {
        return {
          ...lead,
          assignedTo: newAssignee,
          assigneeRole: assigneeRole,
          lastActivity: 'Just now'
        };
      }
      return lead;
    }));
    addNotification({
      type: 'crm',
      title: `Lead reassigned to ${newAssignee} (${assigneeRole})`,
      category: 'Sales'
    });
  };

  // Add Note to Lead (Sales Rep / Manager Action)
  const updateLeadNote = (leadId, noteText) => {
    setLeads(prev => prev.map(lead => {
      if (lead.id === leadId) {
        return {
          ...lead,
          notes: [...(lead.notes || []), { text: noteText, author: currentUserName, role: currentUserRole, time: 'Just now' }],
          lastActivity: 'Just now'
        };
      }
      return lead;
    }));
    addNotification({
      type: 'crm',
      title: `New internal note logged for lead`,
      category: 'CRM'
    });
  };

  // Support Agent - Escalate Conversation / Ticket
  const escalateConversation = (convId, reason = 'Complex case escalation to senior specialist') => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === convId) {
        return {
          ...conv,
          status: 'Escalated',
          assignedTo: 'Support Manager',
          escalationReason: reason
        };
      }
      return conv;
    }));
    addNotification({
      type: 'support',
      title: `Ticket escalated to Support Manager: ${reason}`,
      category: 'Support'
    });
  };

  // Switch Tenant
  const switchTenant = (tenantId) => {
    const selected = tenants.find(t => t.id === tenantId);
    if (selected) {
      setActiveTenantId(tenantId);
      setActiveIndustryId(selected.industryId);
      setIsPlatformView(false);
      addNotification({
        type: 'system',
        title: `Switched workspace to ${selected.name} (${INDUSTRY_PRESETS[selected.industryId]?.shortName || selected.industryId})`,
        category: 'System'
      });
    }
  };

  // Switch Industry Directly
  const switchIndustry = (industryId) => {
    if (INDUSTRY_PRESETS[industryId]) {
      setActiveIndustryId(industryId);
      // Find matching tenant or update current tenant's industry
      const matchedTenant = tenants.find(t => t.industryId === industryId);
      if (matchedTenant) {
        setActiveTenantId(matchedTenant.id);
      }
      setIsPlatformView(false);
      addNotification({
        type: 'system',
        title: `Loaded ${INDUSTRY_PRESETS[industryId].name} architecture & AI agents`,
        category: 'System'
      });
    }
  };

  // Register New Company (HR / Admin Onboarding Flow)
  const registerNewCompany = (companyData) => {
    const industryPreset = INDUSTRY_PRESETS[companyData.industryId] || INDUSTRY_PRESETS.software_it;
    const newTenant = {
      id: `tenant-${Date.now()}`,
      name: companyData.name,
      industryId: companyData.industryId,
      plan: companyData.plan || 'Enterprise Pro',
      seats: companyData.seats || 25,
      mrr: companyData.plan === 'Enterprise Pro' ? '$3,200/mo' : '$1,400/mo',
      activeAiEmployees: industryPreset.aiEmployees.length,
      status: 'Active',
      joinedDate: 'Just now',
      hrContact: companyData.hrContact || 'hr@company.com',
      logoLetter: companyData.name.substring(0, 2).toUpperCase(),
      color: industryPreset.color || '#3b82f6'
    };

    setTenants(prev => [newTenant, ...prev]);
    setActiveTenantId(newTenant.id);
    setActiveIndustryId(newTenant.industryId);
    setIsPlatformView(false);

    addNotification({
      type: 'system',
      title: `🎉 Company Registered: ${newTenant.name} (${industryPreset.name})`,
      category: 'System'
    });

    navigateTo('dashboard');
  };

  // Regulated Financial Approval Actions
  const approveFinancialAction = (apprId, approverName = 'Anita Sharma') => {
    setApprovalQueue(prev =>
      prev.map(a =>
        a.id === apprId
          ? { ...a, status: 'Approved', approvedBy: approverName, approvedAt: 'Just now' }
          : a
      )
    );
    addNotification({
      type: 'financial',
      title: `✅ Compliance Approved: Loan term sheet authorized for client`,
      category: 'System'
    });
  };

  const rejectFinancialAction = (apprId, reason = 'Requires additional collateral docs') => {
    setApprovalQueue(prev =>
      prev.map(a =>
        a.id === apprId
          ? { ...a, status: 'Rejected', rejectionReason: reason, rejectedAt: 'Just now' }
          : a
      )
    );
    addNotification({
      type: 'financial',
      title: `❌ Financial Proposal Returned for Corrections`,
      category: 'System'
    });
  };

  // Helper navigation actions
  const navigateTo = (tab, leadId = null) => {
    setActiveTab(tab);
    if (leadId) setSelectedLeadId(leadId);
    if (tab === 'platform-admin' || tab === 'tenants' || tab === 'platform' || tab === 'workspaces-hub') {
      setIsPlatformView(true);
    } else if (tab !== 'dashboard') {
      setIsPlatformView(false);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addLead = (newLead) => {
    const isCustom = activeTenantId.startsWith('TEN-') || currentTenant?.isCustomRegistered;
    const defaultAssignee = isCustom ? (teamMembers[0]?.name || currentUserName || 'Company Owner') : (teamMembers[0]?.name || 'Rahul Kumar');
    const defaultAssigneeRole = isCustom ? (teamMembers[0]?.role || 'Company Owner / Company Admin') : (currentIndustry.humanRoles[1]?.name || 'Sales Executive');

    const lead = {
      id: `lead-${Date.now()}`,
      name: newLead.name,
      email: newLead.email,
      phone: newLead.phone || '+91 99999 00000',
      company: newLead.company || currentTenant.name,
      designation: newLead.designation || 'Decision Maker',
      companySize: newLead.companySize || '10-50',
      source: newLead.source || 'Website',
      status: newLead.status || 'New',
      score: Math.floor(Math.random() * 40) + 60,
      assignedTo: newLead.assignedTo || defaultAssignee,
      assigneeRole: newLead.assigneeRole || defaultAssigneeRole,
      lastActivity: 'Just now',
      createdAt: 'Today',
      scoreBreakdown: {
        companySize: { score: 15, label: 'Company Size' },
        budgetProvided: { score: 20, label: 'Budget Provided' },
        timeline: { score: 10, label: 'Timeline' },
        websiteVisits: { score: 10, label: 'Website Visits' },
        total: 55
      },
      aiSummary: newLead.aiSummary || `Newly captured inquiry for ${currentIndustry.name}.`,
      recommendedAction: 'Send automated intro message and schedule consultation.',
      notes: []
    };

    setLeads(prev => {
      const updated = [lead, ...prev];
      if (isCustom) {
        updateDynamicStats(updated, appointments);
        persistTenantData(activeTenantId, { leads: updated });
      }
      return updated;
    });

    addNotification({
      type: 'lead',
      title: `New lead added: ${lead.name}`,
      category: 'Leads'
    });
  };

  const updateLeadStatus = (leadId, newStatus) => {
    const isCustom = activeTenantId.startsWith('TEN-') || currentTenant?.isCustomRegistered;
    setLeads(prev => {
      const updated = prev.map(l => l.id === leadId ? { ...l, status: newStatus, lastActivity: 'Just now' } : l);
      if (isCustom) {
        updateDynamicStats(updated, appointments);
        persistTenantData(activeTenantId, { leads: updated });
      }
      return updated;
    });
  };

  const addCustomer = (customerData) => {
    const isCustom = activeTenantId.startsWith('TEN-') || currentTenant?.isCustomRegistered;
    const newCust = {
      id: `cust-${Date.now()}`,
      name: customerData.name,
      email: customerData.email,
      phone: customerData.phone,
      company: customerData.company || currentTenant.name,
      segment: customerData.segment || 'Enterprise',
      plan: customerData.plan || 'Growth Plan',
      mrr: customerData.mrr || '$450/mo',
      lastContact: 'Just now',
      status: 'Active'
    };
    setCustomers(prev => {
      const updated = [newCust, ...prev];
      if (isCustom) {
        persistTenantData(activeTenantId, { customers: updated });
      }
      return updated;
    });
    addNotification({
      type: 'lead',
      title: `Customer converted: ${newCust.name}`,
      category: 'Leads'
    });
  };

  // Dynamic CRUD for Leads
  const updateLead = (leadId, updatedFields) => {
    const isCustom = activeTenantId.startsWith('TEN-') || currentTenant?.isCustomRegistered;
    setLeads(prev => {
      const updated = prev.map(l => l.id === leadId ? { ...l, ...updatedFields, lastActivity: 'Just now' } : l);
      if (isCustom) {
        updateDynamicStats(updated, appointments);
        persistTenantData(activeTenantId, { leads: updated });
      }
      return updated;
    });
    addNotification({
      type: 'crm',
      title: `Lead updated: ${updatedFields.name || 'Record'}`,
      category: 'Leads'
    });
  };

  const deleteLead = (leadId) => {
    const leadToDelete = leads.find(l => l.id === leadId);
    const isCustom = activeTenantId.startsWith('TEN-') || currentTenant?.isCustomRegistered;
    setLeads(prev => {
      const updated = prev.filter(l => l.id !== leadId);
      if (isCustom) {
        updateDynamicStats(updated, appointments);
        persistTenantData(activeTenantId, { leads: updated });
      }
      return updated;
    });
    addNotification({
      type: 'crm',
      title: `Lead removed: ${leadToDelete?.name || 'Lead'}`,
      category: 'Leads'
    });
  };

  // Dynamic CRUD for Customers
  const updateCustomer = (custId, updatedFields) => {
    const isCustom = activeTenantId.startsWith('TEN-') || currentTenant?.isCustomRegistered;
    setCustomers(prev => {
      const updated = prev.map(c => c.id === custId ? { ...c, ...updatedFields } : c);
      if (isCustom) {
        persistTenantData(activeTenantId, { customers: updated });
      }
      return updated;
    });
    addNotification({
      type: 'crm',
      title: `Customer details updated: ${updatedFields.name || ''}`,
      category: 'CRM'
    });
  };

  const deleteCustomer = (custId) => {
    const isCustom = activeTenantId.startsWith('TEN-') || currentTenant?.isCustomRegistered;
    setCustomers(prev => {
      const updated = prev.filter(c => c.id !== custId);
      if (isCustom) {
        persistTenantData(activeTenantId, { customers: updated });
      }
      return updated;
    });
  };

  // Dynamic AI Chat Engine: Automatic contextual response
  const sendChatMessage = (convId, messageText, sender = 'user') => {
    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: sender === 'user' ? 'agent' : sender,
      text: messageText,
      time: 'Just now'
    };

    setConversations(prev =>
      prev.map(c => {
        if (c.id === convId) {
          return {
            ...c,
            lastMessage: messageText,
            time: 'Just now',
            messages: [...(c.messages || []), userMsg]
          };
        }
        return c;
      })
    );

    // If human/agent sent message or user sent query, trigger dynamic AI assistant reaction
    if (sender === 'customer' || sender === 'user') {
      setTimeout(() => {
        const aiReplies = [
          `Thank you for reaching out to ${currentTenant.name}! Based on your inquiry, I've noted your requirement and our ${currentIndustry.humanRoles[1]?.name || 'Specialist'} will connect with you shortly.`,
          `I've verified the details in our ${currentIndustry.name} database. Would you like me to reserve a priority consultation slot for you?`,
          `Understood! I've updated your preferences in our system and forwarded your request with high priority.`
        ];
        const randomReply = aiReplies[Math.floor(Math.random() * aiReplies.length)];
        
        const aiMsg = {
          id: `msg-ai-${Date.now()}`,
          sender: 'ai',
          text: randomReply,
          time: 'Just now',
          badge: '⚡ Autonomous AI Agent'
        };

        setConversations(prev =>
          prev.map(c => {
            if (c.id === convId) {
              return {
                ...c,
                lastMessage: randomReply,
                status: 'AI Responded',
                time: 'Just now',
                messages: [...(c.messages || []), aiMsg]
              };
            }
            return c;
          })
        );
      }, 700);
    }
  };

  // Dynamic Appointments CRUD
  const addAppointment = (aptData) => {
    const isCustom = activeTenantId.startsWith('TEN-') || currentTenant?.isCustomRegistered;
    const defaultHost = isCustom ? (teamMembers[0]?.name || currentUserName || 'Company Owner') : (teamMembers[0]?.name || 'Rahul Kumar');
    const newApt = {
      id: `apt-${Date.now()}`,
      customer: aptData.customer,
      company: aptData.company || currentTenant.name,
      dateTime: aptData.dateTime || 'Tomorrow 11:00 AM',
      type: aptData.type || (currentIndustry.id === 'real_estate' ? 'Site Visit' : currentIndustry.id === 'hospitals' ? 'Doctor Consultation' : 'Product Demo'),
      host: aptData.host || defaultHost,
      status: 'Confirmed'
    };
    setAppointments(prev => {
      const updated = [newApt, ...prev];
      if (isCustom) {
        updateDynamicStats(leads, updated);
        persistTenantData(activeTenantId, { appointments: updated });
      }
      return updated;
    });
    addNotification({
      type: 'appointment',
      title: `Appointment booked: ${newApt.customer} (${newApt.dateTime})`,
      category: 'Appointments'
    });
  };

  const updateAppointment = (aptId, updatedFields) => {
    const isCustom = activeTenantId.startsWith('TEN-') || currentTenant?.isCustomRegistered;
    setAppointments(prev => {
      const updated = prev.map(a => a.id === aptId ? { ...a, ...updatedFields } : a);
      if (isCustom) {
        updateDynamicStats(leads, updated);
        persistTenantData(activeTenantId, { appointments: updated });
      }
      return updated;
    });
    addNotification({
      type: 'appointment',
      title: `Appointment updated`,
      category: 'Appointments'
    });
  };

  const deleteAppointment = (aptId) => {
    const isCustom = activeTenantId.startsWith('TEN-') || currentTenant?.isCustomRegistered;
    setAppointments(prev => {
      const updated = prev.filter(a => a.id !== aptId);
      if (isCustom) {
        updateDynamicStats(leads, updated);
        persistTenantData(activeTenantId, { appointments: updated });
      }
      return updated;
    });
  };

  // Dynamic Documents / Knowledge CRUD
  const uploadDocument = (docData) => {
    const newDoc = {
      id: `doc-${Date.now()}`,
      title: docData.title,
      type: docData.type || 'PDF',
      size: docData.size || '1.8 MB',
      uploadedBy: currentUserName || 'Company Admin',
      lastUpdated: 'Just now',
      status: 'Active',
      vectors: 'Indexed (Sub-20ms RAG)'
    };
    setDocuments(prev => [newDoc, ...prev]);
    addNotification({
      type: 'system',
      title: `Knowledge document indexed: ${newDoc.title}`,
      category: 'AI Knowledge'
    });
  };

  const deleteDocument = (docId) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
    addNotification({
      type: 'system',
      title: 'Knowledge document removed from AI embedding index',
      category: 'AI Knowledge'
    });
  };

  // Dynamic Automations CRUD
  const toggleAutomation = (autoId) => {
    setAutomations(prev =>
      prev.map(a => (a.id === autoId ? { ...a, status: a.status === 'Active' ? 'Paused' : 'Active' } : a))
    );
  };

  const addAutomation = (autoData) => {
    const newAuto = {
      id: `auto-${Date.now()}`,
      name: autoData.name || 'New Custom Automation',
      description: autoData.description || 'Custom Trigger-Condition-Action workflow',
      trigger: autoData.trigger || 'Lead Score > 80',
      action: autoData.action || 'Assign to Sales Rep & Send WhatsApp',
      status: 'Active',
      runs: 0,
      successRate: '100%',
      industry: currentIndustry.name
    };
    setAutomations(prev => [newAuto, ...prev]);
    addNotification({
      type: 'system',
      title: `New automation workflow activated: ${newAuto.name}`,
      category: 'Automation'
    });
  };

  const deleteAutomation = (autoId) => {
    setAutomations(prev => prev.filter(a => a.id !== autoId));
  };

  // Dynamic Team & Roles CRUD
  const inviteTeamMember = (memberData) => {
    const isCustom = activeTenantId.startsWith('TEN-') || currentTenant?.isCustomRegistered;
    const newMember = {
      id: `team-${Date.now()}`,
      name: memberData.name,
      email: memberData.email,
      role: memberData.role || currentIndustry.humanRoles[0]?.name || 'Sales Executive',
      department: memberData.department || 'Operations',
      status: 'Active',
      leadsHandled: 0,
      access: 'Assigned Role Permissions'
    };
    setTeamMembers(prev => {
      const updated = [...prev, newMember];
      if (isCustom) {
        persistTenantData(activeTenantId, { teamMembers: updated });
      }
      return updated;
    });
    addNotification({
      type: 'team',
      title: `Team member invited: ${newMember.name} (${newMember.role})`,
      category: 'Team'
    });
  };

  const updateTeamMember = (memberId, updatedFields) => {
    const isCustom = activeTenantId.startsWith('TEN-') || currentTenant?.isCustomRegistered;
    setTeamMembers(prev => {
      const updated = prev.map(m => m.id === memberId ? { ...m, ...updatedFields } : m);
      if (isCustom) {
        persistTenantData(activeTenantId, { teamMembers: updated });
      }
      return updated;
    });
  };

  const deleteTeamMember = (memberId) => {
    const isCustom = activeTenantId.startsWith('TEN-') || currentTenant?.isCustomRegistered;
    setTeamMembers(prev => {
      const updated = prev.filter(m => m.id !== memberId);
      if (isCustom) {
        persistTenantData(activeTenantId, { teamMembers: updated });
      }
      return updated;
    });
  };

  // Dynamic AI Agents CRUD
  const addAiAgent = (agentData) => {
    const newAgent = {
      id: `agent-${Date.now()}`,
      name: agentData.name,
      role: agentData.role || 'Autonomous Assistant',
      description: agentData.description,
      status: 'Active',
      leads: 0,
      appointments: 0,
      conversionRate: '0%',
      activeConversations: 0,
      accuracy: '99%',
      performance: 90,
      channels: agentData.channels || ['Website', 'WhatsApp'],
      avatar: agentData.avatar || '🤖'
    };
    setAiAgents(prev => [...prev, newAgent]);
    addNotification({
      type: 'system',
      title: `New AI Employee deployed: ${newAgent.name}`,
      category: 'AI Engine'
    });
  };

  const updateAiAgent = (agentId, updatedFields) => {
    setAiAgents(prev => prev.map(a => a.id === agentId ? { ...a, ...updatedFields } : a));
    addNotification({
      type: 'system',
      title: `AI Agent parameters updated`,
      category: 'AI Engine'
    });
  };

  const deleteAiAgent = (agentId) => {
    setAiAgents(prev => prev.filter(a => a.id !== agentId));
  };

  // Notifications
  const addNotification = (notif) => {
    const newNotif = {
      id: `notif-${Date.now()}`,
      type: notif.type || 'lead',
      title: notif.title,
      time: 'Just now',
      unread: true,
      category: notif.category || 'System'
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const unreadNotifCount = notifications.filter(n => n.unread).length;

  // ===================================================================
  // 200% SUPERCHARGED AUTONOMOUS AI EMPLOYEE ENGINE & WORKSTATION
  // ===================================================================
  const [isAiFleetAutonomousActive, setIsAiFleetAutonomousActive] = useState(() => {
    try {
      const saved = localStorage.getItem('zenelait_ai_autonomous_active');
      return saved !== 'false';
    } catch {
      return true;
    }
  });

  const [aiAutonomousStats, setAiAutonomousStats] = useState({
    leadsAutoQualified: 148,
    followUpsDispatched: 392,
    ticketsAutoResolved: 219,
    guardrailsEnforced: 61,
    velocity: '200% Supercharged',
    uptime: '99.98%'
  });

  // Dedicated Autonomous AI Employee Fleet Data
  const [aiEmployeesList, setAiEmployeesList] = useState(INITIAL_AI_EMPLOYEES);
  const [aiEmployeeTasks, setAiEmployeeTasks] = useState(INITIAL_AI_EMPLOYEE_TASKS);
  const [aiExecutionLog, setAiExecutionLog] = useState(INITIAL_AI_EXECUTION_LOG);
  const [activeExecutingTaskId, setActiveExecutingTaskId] = useState(null);

  const stopAiFleetExecution = () => {
    setIsAiFleetAutonomousActive(false);
    try {
      localStorage.setItem('zenelait_ai_autonomous_active', 'false');
    } catch {}
    addNotification({
      type: 'warning',
      title: '🛑 Emergency Stop: Autonomous Fleet Paused',
      category: 'Autonomous AI'
    });
  };

  const resumeAiFleetExecution = () => {
    setIsAiFleetAutonomousActive(true);
    try {
      localStorage.setItem('zenelait_ai_autonomous_active', 'true');
    } catch {}
    addNotification({
      type: 'system',
      title: '⚡ Autonomous AI Fleet Resumed (200% Speed)',
      category: 'Autonomous AI'
    });
  };

  const toggleAiFleetExecution = () => {
    if (isAiFleetAutonomousActive) {
      stopAiFleetExecution();
    } else {
      resumeAiFleetExecution();
    }
  };

  const toggleEmployeeShift = (agentId) => {
    setAiEmployeesList(prev =>
      prev.map(emp => {
        if (emp.id === agentId) {
          const nextStatus = emp.status === 'ON_DUTY' ? 'ON_BREAK' : 'ON_DUTY';
          addNotification({
            type: 'system',
            title: `${emp.name} shift updated to ${nextStatus.replace('_', ' ')}`,
            category: 'AI Employee'
          });
          return { ...emp, status: nextStatus };
        }
        return emp;
      })
    );
  };

  const toggleEmployeeAutoPilot = (agentId) => {
    setAiEmployeesList(prev =>
      prev.map(emp => {
        if (emp.id === agentId) {
          const nextAuto = !emp.isAutoPilotActive;
          addNotification({
            type: nextAuto ? 'system' : 'warning',
            title: `${emp.name} Auto-Pilot ${nextAuto ? 'Enabled' : 'Paused'}`,
            category: 'AI Employee'
          });
          return { ...emp, isAutoPilotActive: nextAuto };
        }
        return emp;
      })
    );
  };

  const assignCustomEmployeeTask = (agentId, taskData) => {
    const emp = aiEmployeesList.find(e => e.id === agentId) || aiEmployeesList[0];
    const newTask = {
      id: `tsk-custom-${Date.now()}`,
      agentId: emp.id,
      roleCategory: emp.roleCategory,
      title: taskData.title || `Custom Assignment for ${emp.name}`,
      clientName: taskData.clientName || 'Commercial Client',
      clientCompany: taskData.clientCompany || 'Enterprise Prospect',
      contactEmail: taskData.contactEmail || 'contact@client.com',
      contactPhone: taskData.contactPhone || '+91 98000 00000',
      type: taskData.type || 'LEAD_QUALIFICATION',
      priority: taskData.priority || 'HIGH',
      channel: taskData.channel || 'WhatsApp & Email',
      details: taskData.details || 'Autonomous task dispatched by human manager.',
      suggestedAction: taskData.suggestedAction || 'Review parameters, execute policy-compliant response, and update CRM records.',
      status: 'PENDING',
      createdAt: 'Just now',
      estimatedImpact: taskData.estimatedImpact || '+₹2,50,000 Pipeline'
    };

    setAiEmployeeTasks(prev => [newTask, ...prev]);
    addNotification({
      type: 'crm',
      title: `Task assigned to ${emp.name}`,
      category: 'AI Workstation'
    });
    return newTask;
  };

  const executeEmployeeTask = (taskId) => {
    const task = aiEmployeeTasks.find(t => t.id === taskId);
    if (!task || task.status === 'COMPLETED') return;

    setActiveExecutingTaskId(taskId);
    const emp = aiEmployeesList.find(e => e.id === task.agentId) || aiEmployeesList[0];
    const execDuration = Math.floor(Math.random() * 450) + 650; // 650 - 1100ms realistic turnaround

    // 1. MUTATE REAL CRM STATE BASED ON WORK TYPE
    if (task.type === 'LEAD_QUALIFICATION') {
      // Find or create lead in leads state
      setLeads(prev => {
        const existingIdx = prev.findIndex(l => l.name === task.clientName || (task.clientCompany && l.company === task.clientCompany));
        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = {
            ...updated[existingIdx],
            status: 'Qualified',
            score: 96,
            notes: `AI SDR ${emp.name} qualified lead: Enterprise intent verified. Budget: ₹5L+. Moved to Discovery demo.`
          };
          return updated;
        } else {
          const newLead = {
            id: `lead-auto-${Date.now()}`,
            name: task.clientName,
            company: task.clientCompany,
            email: task.contactEmail || `${task.clientName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
            phone: task.contactPhone || '+91 98200 11223',
            status: 'Qualified',
            score: 96,
            value: task.estimatedImpact?.replace('+', '') || '₹5,00,000',
            source: task.channel || 'Website Chat',
            notes: `Autonomous BANT qualification by ${emp.name}: ${task.details}`,
            createdAt: 'Just now'
          };
          return [newLead, ...prev];
        }
      });

      // Create new deal in opportunities
      setOpportunities(prev => [
        {
          id: `opp-auto-${Date.now()}`,
          title: `${task.clientCompany} - Enterprise CRM Fleet`,
          company: task.clientCompany,
          value: task.estimatedImpact?.replace('+', '') || '₹5,00,000',
          stage: 'Proposal',
          probability: 75,
          owner: emp.name,
          expectedClose: '30 Days',
          description: `Generated by ${emp.name} during autonomous inbound qualification shift. Requirement: ${task.details}`
        },
        ...prev
      ]);

      setAiAutonomousStats(prev => ({ ...prev, leadsAutoQualified: prev.leadsAutoQualified + 1 }));
    } else if (task.type === 'FOLLOW_UP_OUTBOUND') {
      // Append real message to conversations in Inbox
      setConversations(prev => {
        if (!prev || prev.length === 0) return prev;
        const targetConv = prev.find(c => c.contactName === task.clientName || c.company === task.clientCompany) || prev[0];
        const newMsg = {
          id: `msg-auto-${Date.now()}`,
          sender: 'ai',
          text: `Hello ${task.clientName}! Following up from Zenelait AI CRM. I reviewed our commercial proposal for ${task.clientCompany} and wanted to share our latest implementation case study. Would you like a 10-minute walkthrough this week?`,
          time: 'Just now',
          badge: `🤖 ${emp.name}`
        };

        return prev.map(c => {
          if (c.id === targetConv.id) {
            return {
              ...c,
              lastMessage: newMsg.text,
              lastMessageTime: 'Just now',
              messages: [...(c.messages || []), newMsg]
            };
          }
          return c;
        });
      });

      // Add a completed task in tasks
      setTasks(prev => [
        {
          id: `tsk-crm-${Date.now()}`,
          title: `Autonomous WhatsApp Cadence sent to ${task.clientName}`,
          dueDate: 'Today',
          priority: 'High',
          completed: true,
          assignedTo: emp.name,
          category: 'Sales'
        },
        ...prev
      ]);

      setAiAutonomousStats(prev => ({ ...prev, followUpsDispatched: prev.followUpsDispatched + 1 }));
    } else if (task.type === 'APPOINTMENT_BOOKING') {
      // Add confirmed appointment in calendar
      setAppointments(prev => [
        {
          id: `apt-auto-${Date.now()}`,
          title: `Product Demo & Architecture: ${task.clientCompany}`,
          client: task.clientName,
          date: 'Tomorrow',
          time: '03:00 PM',
          type: 'Google Meet',
          status: 'Confirmed',
          notes: `Autonomous scheduling by ${emp.name}. Video conferencing link dispatched.`
        },
        ...prev
      ]);
    } else if (task.type === 'SUPPORT_RESOLUTION') {
      setAiAutonomousStats(prev => ({ ...prev, ticketsAutoResolved: prev.ticketsAutoResolved + 1 }));
    } else if (task.type === 'REVOPS_ANALYSIS') {
      addNotification({
        type: 'system',
        title: `📊 Marcus Chen: End-of-Day Executive Briefing Ready`,
        category: 'RevOps'
      });
    }

    // 2. MARK TASK COMPLETED WITH GENERATED REASONING TRACE
    const generatedTrace = [
      { step: '1. Ingest & Context Assessment', detail: `Analyzed customer record for ${task.clientName} (${task.clientCompany}) via ${task.channel}.` },
      { step: '2. Policy & Guardrail Verification', detail: `Checked compliance rules, business hours, and enterprise authority limits. Guardrail check passed 100%.` },
      { step: '3. Strategic Execution', detail: `${task.suggestedAction} Turnaround time: ${execDuration}ms.` },
      { step: '4. CRM Mutation', detail: `Updated CRM database: ${task.estimatedImpact || 'Records synchronized'}.` }
    ];

    setAiEmployeeTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            status: 'COMPLETED',
            completedAt: 'Just now',
            executionDurationMs: execDuration,
            reasoningTrace: generatedTrace
          };
        }
        return t;
      })
    );

    // 3. LOG TO AUDIT LOG
    const newLogEntry = {
      id: `exec-log-${Date.now()}`,
      taskId: task.id,
      agentId: emp.id,
      agentName: emp.name,
      roleCategory: emp.roleCategory,
      clientName: `${task.clientName} (${task.clientCompany})`,
      taskTitle: task.title,
      completedAt: 'Just now',
      durationMs: execDuration,
      impact: task.estimatedImpact || 'Completed in Full',
      crmRecordUpdated: `Record updated for ${task.clientName} | Handled by ${emp.name}`,
      reasoningTrace: generatedTrace
    };
    setAiExecutionLog(prev => [newLogEntry, ...(prev || []).slice(0, 24)]);

    // 4. UPDATE AGENT PRODUCTIVITY COUNTER
    setAiEmployeesList(prev =>
      prev.map(e => {
        if (e.id === emp.id) {
          return {
            ...e,
            tasksCompletedToday: e.tasksCompletedToday + 1
          };
        }
        return e;
      })
    );

    // 5. NOTIFY USER
    addNotification({
      type: 'crm',
      title: `⚡ ${emp.name} completed: ${task.title}`,
      category: 'AI Employee'
    });

    setTimeout(() => {
      setActiveExecutingTaskId(null);
    }, 400);
  };

  const resetDemoWorkQueue = () => {
    setAiEmployeeTasks(INITIAL_AI_EMPLOYEE_TASKS);
    addNotification({
      type: 'info',
      title: 'Demo task queue reset with pending assignments',
      category: 'AI Employee'
    });
  };

  // Continuous autonomous background execution loop
  useEffect(() => {
    if (!isAiFleetAutonomousActive) return;

    const interval = setInterval(() => {
      // Check if there is any pending task in aiEmployeeTasks
      setAiEmployeeTasks(currentTasks => {
        const pendingTask = currentTasks.find(t => t.status === 'PENDING');
        if (pendingTask) {
          // Asynchronously execute it
          setTimeout(() => {
            executeEmployeeTask(pendingTask.id);
          }, 100);
          return currentTasks;
        }

        // If no pending tasks, run background ticker simulation
        const actionTypes = ['QUALIFY_LEAD', 'DISPATCH_FOLLOWUP', 'RESOLVE_TICKET', 'GUARDRAIL_COMPLIANCE'];
        const action = actionTypes[Math.floor(Math.random() * actionTypes.length)];
        const sampleNames = [
          'Suresh Nair (FinTech Corp)',
          'Ananya Gupta (EdTech Solutions)',
          'Karan Johar (Skyline Realty)',
          'Neha Sharma (Global Healthcare)',
          'Vikram Batra (Apex Logistics)',
          'Pooja Hegde (Nexus Retail)',
          'Meera Iyer (CloudScale Tech)'
        ];
        const randomPerson = sampleNames[Math.floor(Math.random() * sampleNames.length)];

        if (action === 'QUALIFY_LEAD') {
          const score = Math.floor(Math.random() * 12) + 88;
          const newFeed = {
            id: `feed-auto-${Date.now()}`,
            text: `⚡ Autonomous SDR Aria auto-qualified lead ${randomPerson} (Intent: ${score}% - Enterprise Budget)`,
            time: 'Just now',
            color: '#3b82f6',
            agent: 'Aria Sharma'
          };
          setAiActivityFeed(prev => [newFeed, ...(prev || []).slice(0, 14)]);
          setAiAutonomousStats(prev => ({ ...prev, leadsAutoQualified: prev.leadsAutoQualified + 1 }));
        } else if (action === 'DISPATCH_FOLLOWUP') {
          const newFeed = {
            id: `feed-auto-${Date.now()}`,
            text: `🤖 Autonomous Specialist Vikram delivered personalized WhatsApp & Email sequence to ${randomPerson}`,
            time: 'Just now',
            color: '#10b981',
            agent: 'Vikram Singh'
          };
          setAiActivityFeed(prev => [newFeed, ...(prev || []).slice(0, 14)]);
          setAiAutonomousStats(prev => ({ ...prev, followUpsDispatched: prev.followUpsDispatched + 1 }));
        } else if (action === 'RESOLVE_TICKET') {
          const responseTime = Math.floor(Math.random() * 400) + 600;
          const newFeed = {
            id: `feed-auto-${Date.now()}`,
            text: `✨ Autonomous Support Specialist Kavita closed inquiry for ${randomPerson} in ${responseTime}ms with 5/5 CSAT`,
            time: 'Just now',
            color: '#06b6d4',
            agent: 'Kavita Rao'
          };
          setAiActivityFeed(prev => [newFeed, ...(prev || []).slice(0, 14)]);
          setAiAutonomousStats(prev => ({ ...prev, ticketsAutoResolved: prev.ticketsAutoResolved + 1 }));
        } else {
          const newFeed = {
            id: `feed-auto-${Date.now()}`,
            text: `🛡️ Autonomous Guardrail Sentinel verified opt-out compliance and encrypted PII payload`,
            time: 'Just now',
            color: '#8b5cf6',
            agent: 'Guardrail Sentinel'
          };
          setAiActivityFeed(prev => [newFeed, ...(prev || []).slice(0, 14)]);
          setAiAutonomousStats(prev => ({ ...prev, guardrailsEnforced: prev.guardrailsEnforced + 1 }));
        }

        return currentTasks;
      });
    }, 6000);

    return () => clearInterval(interval);
  }, [isAiFleetAutonomousActive]);

  // ===================================================================
  // CROSS-MODULE AUTONOMOUS AI WORKLOAD REDUCTION ENGINES
  // ===================================================================
  const autoQualifyAllInboundLeads = () => {
    let count = 0;
    const currentEmp = aiEmployeesList.find(e => e.roleCategory === 'SALES_SDR') || aiEmployeesList[0];

    setLeads(prev =>
      prev.map(l => {
        if (!l.status || l.status.toLowerCase() === 'new' || l.status === 'Open' || (l.score || 0) < 80) {
          count++;
          return {
            ...l,
            status: 'Qualified',
            score: Math.floor(Math.random() * 8) + 92,
            notes: `${currentEmp.name} evaluated intent: High BANT fit, verified commercial criteria, ready for proposal.`
          };
        }
        return l;
      })
    );

    addNotification({
      type: 'crm',
      title: `⚡ ${currentEmp.name} Auto-Qualified ${count || 'All'} Inbound Leads`,
      category: 'Lead Automation'
    });
    return count;
  };

  const autoAccelerateStalledDeals = () => {
    let count = 0;
    const currentEmp = aiEmployeesList.find(e => e.roleCategory === 'PIPELINE_NURTURE') || aiEmployeesList[0];

    setOpportunities(prev =>
      prev.map(opp => {
        if (opp.stage === 'Lead In' || opp.stage === 'Discovery') {
          count++;
          return {
            ...opp,
            stage: 'Proposal',
            probability: 75,
            description: `${opp.description || ''} • [AI Accelerated by ${currentEmp.name}]: Custom commercial terms dispatched.`
          };
        }
        return opp;
      })
    );

    addNotification({
      type: 'crm',
      title: `⚡ ${currentEmp.name} Accelerated ${count || 2} Deals to Proposal Stage`,
      category: 'Sales Automation'
    });
    return count;
  };

  const autoResolveDueTasks = () => {
    let count = 0;
    const currentEmp = aiEmployeesList[0] || { name: 'AI Specialist' };

    setTasks(prev =>
      prev.map(t => {
        if (!t.completed) {
          count++;
          return {
            ...t,
            completed: true,
            assignedTo: currentEmp.name
          };
        }
        return t;
      })
    );

    addNotification({
      type: 'crm',
      title: `⚡ AI Assistant Auto-Completed ${count || 3} Scheduled Tasks`,
      category: 'Task Automation'
    });
    return count;
  };

  // Dynamic Opportunities CRUD
  const addOpportunity = (oppData) => {
    const isCustom = activeTenantId.startsWith('TEN-') || currentTenant?.isCustomRegistered;
    const defaultOwner = isCustom ? (teamMembers[0]?.name || currentUserName || 'Company Owner') : (teamMembers[0]?.name || 'Rahul Kumar');
    const newOpp = {
      id: `opp-${Date.now()}`,
      title: oppData.title,
      company: oppData.company || currentTenant.name,
      value: oppData.value || '₹2,50,000',
      stage: oppData.stage || 'Proposal',
      probability: oppData.probability || 60,
      owner: oppData.owner || defaultOwner,
      expectedClose: oppData.expectedClose || 'Nov 30, 2026',
      description: oppData.description || 'Sales Deal'
    };
    setOpportunities(prev => {
      const updated = [newOpp, ...prev];
      if (isCustom) {
        persistTenantData(activeTenantId, { opportunities: updated });
      }
      return updated;
    });
    addNotification({
      type: 'crm',
      title: `New deal added: ${newOpp.title} (${newOpp.value})`,
      category: 'Sales'
    });
  };

  const updateOpportunityStage = (oppId, newStage) => {
    const isCustom = activeTenantId.startsWith('TEN-') || currentTenant?.isCustomRegistered;
    setOpportunities(prev => {
      const updated = prev.map(o => o.id === oppId ? { ...o, stage: newStage } : o);
      if (isCustom) {
        persistTenantData(activeTenantId, { opportunities: updated });
      }
      return updated;
    });
  };

  const deleteOpportunity = (oppId) => {
    const isCustom = activeTenantId.startsWith('TEN-') || currentTenant?.isCustomRegistered;
    setOpportunities(prev => {
      const updated = prev.filter(o => o.id !== oppId);
      if (isCustom) {
        persistTenantData(activeTenantId, { opportunities: updated });
      }
      return updated;
    });
  };

  // Dynamic Tasks CRUD
  const addTask = (taskData) => {
    const newTask = {
      id: `task-${Date.now()}`,
      title: taskData.title,
      relatedTo: taskData.relatedTo || 'Lead / General',
      priority: taskData.priority || 'Medium',
      dueDate: taskData.dueDate || 'Tomorrow',
      status: 'Pending'
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const toggleTaskStatus = (taskId) => {
    setTasks(prev =>
      prev.map(t => t.id === taskId ? { ...t, status: t.status === 'Completed' ? 'Pending' : 'Completed' } : t)
    );
  };

  const deleteTask = (taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  // Dynamic Templates CRUD
  const addTemplate = (tmplData) => {
    const newTmpl = {
      id: `tmpl-${Date.now()}`,
      title: tmplData.title,
      type: tmplData.type || 'Email',
      category: tmplData.category || 'General',
      status: 'Active',
      subject: tmplData.subject || tmplData.title,
      preview: tmplData.preview || tmplData.content || 'Template content...'
    };
    setTemplates(prev => [newTmpl, ...prev]);
    return newTmpl;
  };

  const updateTemplate = (tmplId, updatedData) => {
    setTemplates(prev =>
      prev.map(t => (t.id === tmplId ? { ...t, ...updatedData } : t))
    );
  };

  const deleteTemplate = (tmplId) => {
    setTemplates(prev => prev.filter(t => t.id !== tmplId));
  };

  const updateCompanyProfile = (updated) => {
    const isCustom = activeTenantId.startsWith('TEN-') || currentTenant?.isCustomRegistered;
    setCompanyProfile(prev => {
      const merged = { ...prev, ...updated };
      if (isCustom) {
        persistTenantData(activeTenantId, { companyProfile: merged });
      }
      return merged;
    });
  };

  const toggleIntegration = (integId) => {
    setIntegrations(prev =>
      prev.map(i => i.id === integId ? { ...i, status: i.status === 'Connected' ? 'Not Connected' : 'Connected' } : i)
    );
  };

  return (
    <CRMContext.Provider
      value={{
        activeTab,
        setActiveTab,
        navigateTo,
        selectedLeadId,
        setSelectedLeadId,
        searchQuery,
        setSearchQuery,
        isSidebarOpen,
        setIsSidebarOpen,
        isNotifDrawerOpen,
        setIsNotifDrawerOpen,
        activeModal,
        setActiveModal,
        
        // Multi-Tenant & Industry engine
        tenants,
        currentTenant,
        activeTenantId,
        switchTenant,
        activeIndustryId,
        currentIndustry,
        switchIndustry,
        industryPresets: INDUSTRY_PRESETS,
        platformRoles: PLATFORM_ROLES,
        isPlatformView,
        setIsPlatformView,
        currentUserRole,
        setCurrentUserRole,
        currentUserName,
        setCurrentUserName,
        registerNewCompany,
        
        // Regulated financial approval queue
        approvalQueue,
        approveFinancialAction,
        rejectFinancialAction,

        // Core data
        metrics,
        leads,
        customers,
        conversations,
        activeChatId,
        setActiveChatId,
        aiAgents,
        appointments,
        documents,
        automations,
        teamMembers,
        notifications,
        companyProfile,
        subscriptionData,
        opportunities,
        tasks,
        templates,
        integrations,
        aiActivityFeed,
        unreadNotifCount,
        pipelineStages,
        leadSources,
        trendData: TREND_DATA,

        // Navigation View Mode & Smart Resolver
        viewMode,
        setViewMode,
        resolveCredentials,

        // Authentication
        isAuthenticated,
        setIsAuthenticated,
        currentUser,
        login,
        logout,

        // Handlers
        addLead,
        updateLead,
        deleteLead,
        updateLeadStatus,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        sendChatMessage,
        addAppointment,
        updateAppointment,
        deleteAppointment,
        uploadDocument,
        deleteDocument,
        toggleAutomation,
        addAutomation,
        deleteAutomation,
        inviteTeamMember,
        updateTeamMember,
        deleteTeamMember,
        addAiAgent,
        updateAiAgent,
        deleteAiAgent,
        addNotification,
        markAllNotificationsRead,
        addOpportunity,
        updateOpportunityStage,
        deleteOpportunity,
        addTask,
        toggleTaskStatus,
        deleteTask,
        addTemplate,
        updateTemplate,
        deleteTemplate,
        toggleIntegration,
        updateCompanyProfile,
        mvpRoles: MVP_ROLES,
        getRolePermissions,
        currentRolePermissions,
        reassignLead,
        updateLeadNote,
        escalateConversation,
        auditedPrivacyAccess,
        setAuditedPrivacyAccess,
        
        // Ultra Super Admin God-Mode Master Operations
        isEmergencyLockdown,
        toggleEmergencyLockdown,
        globalAiConfig,
        updateGlobalAiConfig,
        systemBackups,
        triggerDatabaseBackup,
        globalAnnouncements,
        broadcastGlobalAnnouncement,
        impersonateTenant,
        impersonationSession,
        startDelegatedAccess,
        terminateDelegatedAccess,
        updateTenantLimits,
        updateTenantStatus,

        switchRole,
        registerTenant,

        // 200% Autonomous AI Employee Fleet Controls & Workstation
        isAiFleetAutonomousActive,
        setIsAiFleetAutonomousActive,
        aiAutonomousStats,
        stopAiFleetExecution,
        resumeAiFleetExecution,
        toggleAiFleetExecution,
        aiEmployeesList,
        setAiEmployeesList,
        aiEmployeeTasks,
        setAiEmployeeTasks,
        aiExecutionLog,
        activeExecutingTaskId,
        executeEmployeeTask,
        assignCustomEmployeeTask,
        toggleEmployeeShift,
        toggleEmployeeAutoPilot,
        resetDemoWorkQueue,
        autoQualifyAllInboundLeads,
        autoAccelerateStalledDeals,
        autoResolveDueTasks
      }}
    >
      {children}
    </CRMContext.Provider>
  );
}

export function useCRM() {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
}
