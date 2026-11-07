import React from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  LayoutDashboard,
  Building,
  Users2,
  CreditCard,
  UserPlus,
  Users,
  Target,
  CheckSquare,
  Calendar,
  Bot,
  Wrench,
  MessageSquare,
  Inbox,
  FileText,
  BookOpen,
  HelpCircle,
  GitFork,
  Clock,
  BarChart3,
  TrendingUp,
  Layers,
  Settings,
  ChevronRight,
  BotMessageSquare,
  Sparkles,
  Crown,
  LogOut,
  Zap,
  UserCheck,
  Briefcase,
  Building2,
  GraduationCap,
  HeartPulse,
  ShoppingBag,
  BedDouble,
  Plane,
  Luggage,
  Factory,
  Boxes,
  Package,
  Headphones,
  Megaphone,
  HeartHandshake,
  FileCheck,
  Bell,
  MapPin,
  Search,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  UserX,
  Video,
  Compass,
  LifeBuoy,
  Award,
  Stethoscope,
  CalendarDays,
  PlusCircle,
  XCircle,
  KeyRound,
  LogIn,
  ShieldAlert,
  DollarSign,
  AlertCircle,
  PhoneCall,
  Mail,
  Database
} from 'lucide-react';

export function Sidebar() {
  const {
    activeTab,
    navigateTo,
    isSidebarOpen,
    setIsSidebarOpen,
    companyProfile,
    currentUserRole,
    currentRolePermissions,
    activeIndustryId,
    isPlatformView,
    setIsNotifDrawerOpen,
    logout
  } = useCRM();

  const handleNavClick = (id) => {
    if (id === 'notifications') {
      if (setIsNotifDrawerOpen) setIsNotifDrawerOpen(true);
      return;
    }
    navigateTo(id);
    if (window.innerWidth <= 1024) {
      setIsSidebarOpen(false);
    }
  };

  const isUltraSuperAdmin = currentRolePermissions?.isUltraSuperAdmin || currentUserRole === 'Ultra Super Admin' || currentUserRole?.includes('God') || currentUserRole?.toLowerCase().includes('ultra');
  const isSuperAdmin = currentRolePermissions?.isSuperAdmin;
  const isCompanyAdmin = currentRolePermissions?.isCompanyAdmin;
  const isSalesManager = currentRolePermissions?.isSalesManager;
  const isMarketingManager = currentRolePermissions?.isMarketingManager;
  const isSupportManager = currentRolePermissions?.isSupportManager;
  const isSalesRepresentative = currentRolePermissions?.isSalesRepresentative;
  const isSupportAgent = currentRolePermissions?.isSupportAgent;
  const isAnalyst = currentRolePermissions?.isAnalyst;

  const roleLower = (currentUserRole || '').toLowerCase();
  const isSoftwareTenant = activeIndustryId === 'software' || activeIndustryId === 'software_it' || activeIndustryId === 'it_software';
  const isRealEstateTenant = activeIndustryId === 'real_estate';
  const isEducationTenant = activeIndustryId === 'education' || activeIndustryId === 'education_training';

  const isRealEstateSupportAgent = isRealEstateTenant && (roleLower.includes('support') || roleLower.includes('customer care'));
  const isRealEstateSalesManager = isRealEstateTenant && (roleLower.includes('sales manager') || roleLower.includes('salesmanager'));
  const isRealEstateSalesExecutive = isRealEstateTenant && (roleLower.includes('property sales') || roleLower.includes('sales executive') || roleLower.includes('real estate sales executive'));
  const isRealEstateCrmManager = isRealEstateTenant && (roleLower.includes('customer relationship') || roleLower.includes('customer relations') || roleLower.includes('crm manager'));
  const isRealEstateCoordinator = isRealEstateTenant && (roleLower.includes('site visit coordinator') || roleLower.includes('visit coordinator') || roleLower.includes('coordinator'));

  const isAdmissionManager = isEducationTenant && (roleLower.includes('admission manager') || roleLower.includes('admission_manager') || currentUserRole === 'ADMISSION_MANAGER');
  const isAdmissionExecutive = isEducationTenant && (roleLower.includes('admission executive') || roleLower.includes('admission_executive') || currentUserRole === 'ADMISSION_EXECUTIVE');
  const isStudentSupportAgent = isEducationTenant && (roleLower.includes('student support') || roleLower.includes('student_support') || currentUserRole === 'STUDENT_SUPPORT_AGENT');
  const isCounsellor = isEducationTenant && (roleLower.includes('counsellor') || roleLower.includes('counselor') || currentUserRole === 'COUNSELLOR');

  const isHospitalTenant = activeIndustryId === 'hospitals' || activeIndustryId === 'hospital_clinic';
  const isReceptionManager = isHospitalTenant && (roleLower.includes('reception manager') || currentUserRole === 'RECEPTION_MANAGER');
  const isReceptionist = isHospitalTenant && (roleLower.includes('receptionist') || currentUserRole === 'RECEPTIONIST');
  const isHospitalSupport = isHospitalTenant && (roleLower.includes('customer support') || roleLower.includes('support agent') || currentUserRole === 'CUSTOMER_SUPPORT');
  const isAppointmentCoordinator = isHospitalTenant && (roleLower.includes('appointment coordinator') || roleLower.includes('coordinator') || currentUserRole === 'APPOINTMENT_COORDINATOR');
  const isDoctorStaff = isHospitalTenant && (roleLower.includes('doctor') || roleLower.includes('staff') || currentUserRole === 'DOCTOR' || currentUserRole === 'STAFF');
  const isAiReceptionistRole = isHospitalTenant && (roleLower.includes('ai receptionist') || currentUserRole === 'AI_RECEPTIONIST');
  const isAiAppointmentAgentRole = isHospitalTenant && (roleLower.includes('ai appointment') || currentUserRole === 'AI_APPOINTMENT_AGENT');

  const isEcommerceTenant = activeIndustryId === 'ecommerce';
  const isEcommerceSalesManager = isEcommerceTenant && (roleLower.includes('sales manager') || currentUserRole === 'SALES_MANAGER' || currentUserRole === 'ECOMMERCE_SALES_MANAGER');
  const isEcommerceSupportManager = isEcommerceTenant && (roleLower.includes('customer support manager') || (roleLower.includes('support manager') && !roleLower.includes('reception')) || currentUserRole === 'SUPPORT_MANAGER' || currentUserRole === 'ECOMMERCE_SUPPORT_MANAGER');
  const isEcommerceSupportAgent = isEcommerceTenant && (roleLower.includes('support agent') || currentUserRole === 'SUPPORT_AGENT' || currentUserRole === 'ECOMMERCE_SUPPORT_AGENT');
  const isEcommerceOrderManager = isEcommerceTenant && (roleLower.includes('order manager') || currentUserRole === 'ORDER_MANAGER' || currentUserRole === 'ECOMMERCE_ORDER_MANAGER');
  const isEcommerceAiSalesAgent = isEcommerceTenant && (roleLower.includes('ai sales') || currentUserRole === 'AI_SALES_AGENT');
  const isEcommerceAiSupportAgent = isEcommerceTenant && (roleLower.includes('ai support') || currentUserRole === 'AI_SUPPORT_AGENT');
  const isEcommerceAiOrderAgent = isEcommerceTenant && (roleLower.includes('ai order') || currentUserRole === 'AI_ORDER_AGENT');

  const isHotelTenant = activeIndustryId === 'hospitality' || activeIndustryId === 'hotel' || activeIndustryId === 'hotel_resort';
  const isHotelReservationManager = isHotelTenant && (roleLower.includes('reservation manager') || currentUserRole === 'RESERVATION_MANAGER' || currentUserRole === 'HOTEL_RESERVATION_MANAGER');
  const isHotelReservationExecutive = isHotelTenant && (roleLower.includes('reservation executive') || currentUserRole === 'RESERVATION_EXECUTIVE' || currentUserRole === 'HOTEL_RESERVATION_EXECUTIVE');
  const isHotelCustomerSupport = isHotelTenant && (roleLower.includes('customer support') || (roleLower.includes('support') && !roleLower.includes('manager')) || currentUserRole === 'CUSTOMER_SUPPORT' || currentUserRole === 'HOTEL_CUSTOMER_SUPPORT');
  const isHotelFrontDesk = isHotelTenant && (roleLower.includes('front desk') || roleLower.includes('reception') || currentUserRole === 'FRONT_DESK' || currentUserRole === 'HOTEL_FRONT_DESK');
  const isHotelAiReservationAgent = isHotelTenant && (roleLower.includes('ai reservation') || currentUserRole === 'AI_RESERVATION_AGENT');
  const isHotelAiSupportAgent = isHotelTenant && (roleLower.includes('ai support') || currentUserRole === 'AI_SUPPORT_AGENT');
  const isHotelAiFollowUpAgent = isHotelTenant && (roleLower.includes('ai follow-up') || roleLower.includes('ai followup') || currentUserRole === 'AI_FOLLOW_UP_AGENT');

  const isTravelTenant = activeIndustryId === 'travel' || activeIndustryId === 'travel_tourism';
  const isTravelSalesManager = isTravelTenant && (roleLower.includes('sales manager') || currentUserRole === 'SALES_MANAGER' || currentUserRole === 'TRAVEL_SALES_MANAGER');
  const isTravelConsultant = isTravelTenant && (roleLower.includes('consultant') || currentUserRole === 'TRAVEL_CONSULTANT');
  const isTravelCustomerSupport = isTravelTenant && (roleLower.includes('customer support') || (roleLower.includes('support') && !roleLower.includes('sales')) || currentUserRole === 'CUSTOMER_SUPPORT' || currentUserRole === 'TRAVEL_CUSTOMER_SUPPORT');
  const isTravelBookingExecutive = isTravelTenant && (roleLower.includes('booking') || currentUserRole === 'BOOKING_EXECUTIVE' || currentUserRole === 'TRAVEL_BOOKING_EXECUTIVE');
  const isTravelAiSalesAgent = isTravelTenant && (roleLower.includes('ai travel sales') || roleLower.includes('ai sales') || currentUserRole === 'AI_TRAVEL_SALES_AGENT');
  const isTravelAiFollowUpAgent = isTravelTenant && (roleLower.includes('ai follow-up') || roleLower.includes('ai followup') || currentUserRole === 'AI_FOLLOW_UP_AGENT');
  const isTravelAiBookingAgent = isTravelTenant && (roleLower.includes('ai booking') || currentUserRole === 'AI_BOOKING_AGENT');

  const isManufacturingTenant = activeIndustryId === 'manufacturing' || activeIndustryId === 'manufacturing_b2b' || activeIndustryId === 'industrial';
  const isManufacturingSalesManager = isManufacturingTenant && (roleLower.includes('sales manager') || currentUserRole === 'SALES_MANAGER' || currentUserRole === 'MANUFACTURING_SALES_MANAGER');
  const isManufacturingSalesExecutive = isManufacturingTenant && (roleLower.includes('sales executive') || roleLower.includes('executive') || currentUserRole === 'MANUFACTURING_SALES_EXECUTIVE');
  const isManufacturingDealerManager = isManufacturingTenant && (roleLower.includes('dealer') || currentUserRole === 'MANUFACTURING_DEALER_MANAGER');
  const isManufacturingCustomerSupport = isManufacturingTenant && (roleLower.includes('customer support') || (roleLower.includes('support') && !roleLower.includes('manager')) || currentUserRole === 'CUSTOMER_SUPPORT' || currentUserRole === 'MANUFACTURING_CUSTOMER_SUPPORT');

  const isConsultingTenant = activeIndustryId === 'consulting' || activeIndustryId === 'financial_services' || activeIndustryId === 'advisory';
  const isConsultingSalesManager = isConsultingTenant && (roleLower.includes('sales manager') || currentUserRole === 'SALES_MANAGER' || currentUserRole === 'CONSULTING_SALES_MANAGER');
  const isConsultingSalesExecutive = isConsultingTenant && (roleLower.includes('sales executive') || roleLower.includes('executive') || currentUserRole === 'SALES_EXECUTIVE' || currentUserRole === 'CONSULTING_SALES_EXECUTIVE');
  const isConsultingCustomerSupport = isConsultingTenant && (roleLower.includes('customer support') || (roleLower.includes('support') && !roleLower.includes('manager')) || currentUserRole === 'CUSTOMER_SUPPORT' || currentUserRole === 'CONSULTING_CUSTOMER_SUPPORT');

  let navSections = [];
  let isGeneralTenantLayout = false;

  // =========================================================================
  // CASE 0: ULTRA SUPER ADMIN (PLATFORM ROOT / GOD MODE)
  // =========================================================================
  if ((isUltraSuperAdmin && isPlatformView) || activeTab === 'platform-admin' || activeTab === 'tenants') {
    navSections = [
      {
        title: 'PLATFORM COMMAND CENTER',
        items: [
          { id: 'tenants', label: 'Platform Command Center', icon: Crown },
          { id: 'company-profile', label: 'Company Workspaces', icon: Building2 },
          { id: 'users-roles', label: 'Platform Users & Roles', icon: Users2 },
          { id: 'subscription-billing', label: 'Platform Billing & Ledger', icon: CreditCard }
        ]
      },
      {
        title: 'TENANT WORKSPACE',
        items: [
          { id: 'dashboard', label: 'Switch to Tenant View →', icon: Layers }
        ]
      }
    ];
  } else if (isRealEstateSupportAgent) {
    navSections = [
      {
        title: 'ZENELAIT AI CRM',
        items: [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 're-support-inbox', label: 'Support Inbox', icon: Inbox },
          { id: 're-support-my-tickets', label: 'My Tickets', icon: CheckSquare },
          { id: 're-support-questions', label: 'Customer Questions', icon: MessageSquare },
          { id: 're-support-property-enquiries', label: 'Property Enquiries', icon: Building2 },
          { id: 're-support-booking-support', label: 'Booking Support', icon: FileCheck },
          { id: 're-support-site-visit-support', label: 'Site Visit Support', icon: Calendar },
          { id: 're-support-complaints', label: 'Complaints', icon: AlertTriangle },
          { id: 're-support-kb', label: 'Knowledge Base', icon: BookOpen },
          { id: 're-support-communications', label: 'Customer Communications', icon: Headphones },
          { id: 're-support-escalations', label: 'Escalations', icon: ShieldCheck },
          { id: 're-support-ai-reply', label: 'AI Reply Assistant', icon: Sparkles },
          { id: 're-support-reports', label: 'Support Reports', icon: BarChart3 },
          { id: 'notifications', label: 'Notifications', icon: Bell }
        ]
      }
    ];
  } else if (isRealEstateSalesManager) {
    navSections = [
      {
        title: 'ZENELAIT AI CRM',
        items: [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 're-properties', label: 'Property Inventory', icon: Building2 },
          { id: 're-leads', label: 'Property Leads', icon: Users },
          { id: 're-pipeline', label: 'Sales Pipeline', icon: Target },
          { id: 're-team', label: 'Sales Team', icon: UserCheck },
          { id: 're-assign-leads', label: 'Assign Leads', icon: UserPlus },
          { id: 're-customer-relations', label: 'Customer Relationships', icon: HeartHandshake },
          { id: 're-site-visits', label: 'Site Visits', icon: Calendar },
          { id: 're-quotations', label: 'Offers & Quotations', icon: FileText },
          { id: 're-bookings', label: 'Bookings', icon: CheckSquare },
          { id: 're-automation', label: 'Follow-up Automation', icon: Sparkles },
          { id: 're-ai-agent', label: 'AI Property Sales Agent', icon: Bot },
          { id: 're-reports', label: 'Reports & Analytics', icon: BarChart3 },
          { id: 'notifications', label: 'Notifications', icon: Bell }
        ]
      }
    ];
  } else if (isRealEstateSalesExecutive) {
    navSections = [
      {
        title: 'PROPERTY SALES EXECUTIVE',
        items: [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 're-my-leads', label: 'My Property Leads', icon: Users },
          { id: 're-my-pipeline', label: 'My Sales Pipeline', icon: Target },
          { id: 're-properties-search', label: 'Property Search', icon: Search },
          { id: 're-customer-details', label: 'Customer Details', icon: Building2 },
          { id: 're-activities', label: 'Calls & Activities', icon: MessageSquare },
          { id: 're-my-site-visits', label: 'Site Visits', icon: Calendar },
          { id: 're-my-follow-ups', label: 'My Follow-ups', icon: CheckSquare },
          { id: 're-my-quotations', label: 'Quotations', icon: FileText },
          { id: 're-booking-requests', label: 'Booking Requests', icon: Sparkles },
          { id: 'notifications', label: 'Notifications', icon: Bell }
        ]
      }
    ];
  } else if (isRealEstateCrmManager) {
    navSections = [
      {
        title: 'CUSTOMER RELATIONSHIPS (CRM)',
        items: [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 're-customers', label: 'Customers', icon: Users },
          { id: 're-customer-timeline', label: 'Customer Timeline', icon: Clock },
          { id: 're-communications', label: 'Customer Communications', icon: MessageSquare },
          { id: 're-customer-requests', label: 'Customer Requests', icon: CheckSquare },
          { id: 're-complaints', label: 'Complaints & Issues', icon: AlertTriangle },
          { id: 're-customer-feedback', label: 'Customer Feedback', icon: HeartHandshake },
          { id: 're-booking-support', label: 'Booking Support', icon: Building2 },
          { id: 're-customer-follow-ups', label: 'Customer Follow-ups', icon: CheckSquare },
          { id: 're-escalations', label: 'Escalations', icon: ShieldCheck },
          { id: 're-ai-assistant', label: 'AI Customer Assistant', icon: Bot },
          { id: 're-customer-reports', label: 'Customer Reports', icon: BarChart3 },
          { id: 'notifications', label: 'Notifications', icon: Bell }
        ]
      }
    ];
  } else if (isRealEstateCoordinator) {
    navSections = [
      {
        title: 'SITE VISIT COORDINATION',
        items: [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 're-visit-calendar', label: 'Site Visit Calendar', icon: Calendar },
          { id: 're-assigned-visits', label: 'All Assigned Visits', icon: Users },
          { id: 're-schedule-visit', label: 'Schedule a Visit', icon: Calendar },
          { id: 're-reschedule-requests', label: 'Reschedule Requests', icon: Clock },
          { id: 're-visit-assignments', label: 'Visit Assignments', icon: UserCheck },
          { id: 're-property-locations', label: 'Property Locations', icon: MapPin },
          { id: 're-visit-checklists', label: 'Visit Checklists', icon: FileCheck },
          { id: 're-attendance', label: 'Attendance', icon: CheckCircle2 },
          { id: 're-visit-outcomes', label: 'Visit Outcomes', icon: Target },
          { id: 're-visit-feedback', label: 'Customer Feedback', icon: HeartHandshake },
          { id: 're-visit-reports', label: 'Visit Reports', icon: BarChart3 },
          { id: 'notifications', label: 'Notifications', icon: Bell }
        ]
      }
    ];
  } else if (isRealEstateTenant && (isCompanyAdmin || isSuperAdmin)) {
    // Real Estate Admin sees all 4 Real Estate modules organized by role
    navSections = [
      {
        items: [
          { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
          { id: 're-sales-manager-hub', label: 'Sales Manager Hub', icon: Briefcase },
          { id: 're-executive-hub', label: 'Sales Executive Hub', icon: Zap },
          { id: 're-crm-hub', label: 'Customer Relations Hub', icon: HeartHandshake },
          { id: 're-coordinator-hub', label: 'Site Visit Coordinator Hub', icon: Calendar }
        ]
      },
      {
        title: 'SALES MANAGEMENT',
        items: [
          { id: 're-properties', label: 'Property Inventory', icon: Building2 },
          { id: 're-leads', label: 'Property Leads', icon: Users },
          { id: 're-pipeline', label: 'Sales Pipeline', icon: Target },
          { id: 're-team', label: 'Sales Team', icon: UserCheck },
          { id: 're-assign-leads', label: 'Assign Leads', icon: UserPlus },
          { id: 're-quotations', label: 'Offers & Quotations', icon: FileText },
          { id: 're-bookings', label: 'Bookings', icon: CheckSquare },
          { id: 're-automation', label: 'Follow-up Automation', icon: Sparkles }
        ]
      },
      {
        title: 'CUSTOMER RELATIONSHIPS (CRM)',
        items: [
          { id: 're-customers', label: 'Customers', icon: Users },
          { id: 're-customer-timeline', label: 'Customer Timeline', icon: Clock },
          { id: 're-communications', label: 'Communications', icon: MessageSquare },
          { id: 're-customer-requests', label: 'Customer Requests', icon: CheckSquare },
          { id: 're-complaints', label: 'Complaints & Escalations', icon: AlertTriangle },
          { id: 're-customer-feedback', label: 'Customer Feedback', icon: HeartHandshake }
        ]
      },
      {
        title: 'SITE VISIT OPERATIONS',
        items: [
          { id: 're-visit-calendar', label: 'Site Visit Calendar', icon: Calendar },
          { id: 're-assigned-visits', label: 'All Assigned Visits', icon: Users },
          { id: 're-schedule-visit', label: 'Schedule Visit', icon: Calendar },
          { id: 're-visit-checklists', label: 'Visit Checklists', icon: FileCheck },
          { id: 're-visit-reports', label: 'Visit Reports', icon: BarChart3 }
        ]
      },
      {
        title: 'AI PROPERTY SALES AGENT',
        items: [
          { id: 're-ai-sales-overview', label: 'Agent Overview', icon: Bot },
          { id: 're-ai-sales-conversations', label: 'Conversations', icon: MessageSquare },
          { id: 're-ai-sales-qualification', label: 'Buyer Qualification', icon: CheckCircle2 },
          { id: 're-ai-sales-recommendations', label: 'Property Recommendations', icon: Building2 },
          { id: 're-ai-sales-leads', label: 'Lead Creation', icon: Users },
          { id: 're-ai-sales-handoffs', label: 'Human Handoffs', icon: HeartHandshake },
          { id: 're-ai-sales-knowledge', label: 'Knowledge Sources', icon: BookOpen },
          { id: 're-ai-sales-audit', label: 'Audit Events & Metrics', icon: ShieldCheck }
        ]
      },
      {
        title: 'COMPANY MANAGEMENT',
        adminOnly: true,
        items: [
          { id: 'company-profile', label: 'Company Profile', icon: Building },
          { id: 'users-roles', label: 'Users & Roles', icon: Users2 },
          { id: 'real-estate-inventory', label: 'Properties & Inventory', icon: Building2 },
          { id: 'subscription-billing', label: 'Subscription & Billing', icon: CreditCard, adminOnly: true }
        ]
      }
    ];
  } else if (isAdmissionManager) {
    // =========================================================================
    // CASE 2A: EDUCATION TENANT — ADMISSION MANAGER
    // =========================================================================
    navSections = [
      {
        title: 'ZENELAIT AI CRM',
        items: [
          { id: 'dashboard', label: 'Admission Dashboard', icon: LayoutDashboard },
          { id: 'edu-adm-enquiries', label: 'Admission Enquiries', icon: Users },
          { id: 'edu-adm-applications', label: 'Applications Pipeline', icon: BookOpen },
          { id: 'edu-adm-workload', label: 'Executive Workload', icon: UserCheck },
          { id: 'edu-adm-targets', label: 'Admission Targets', icon: Target },
          { id: 'edu-adm-reports', label: 'Admission Reports', icon: BarChart3 }
        ]
      },
      {
        title: 'AI EMPLOYEES',
        items: [
          { id: 'edu-ai-admission', label: 'AI Admission Agent', icon: Bot },
          { id: 'edu-ai-admission-conversations', label: 'Live Conversations', icon: MessageSquare },
          { id: 'edu-ai-admission-leads', label: 'Admission Leads', icon: Users },
          { id: 'edu-ai-admission-recommendations', label: 'Course Recommendations', icon: BookOpen },
          { id: 'edu-ai-admission-knowledge', label: 'Knowledge Sources', icon: HelpCircle },
          { id: 'edu-ai-admission-metrics', label: 'Admission AI Metrics', icon: BarChart3 },
          { id: 'edu-ai-followup', label: 'AI Follow-up Agent', icon: Clock },
          { id: 'edu-ai-followup-rules', label: 'Follow-up Rules', icon: GitFork },
          { id: 'edu-ai-followup-tasks', label: 'Scheduled Tasks', icon: Calendar },
          { id: 'edu-ai-followup-drafts', label: 'Approval Queue', icon: FileCheck },
          { id: 'edu-ai-followup-executions', label: 'Execution History', icon: Layers },
          { id: 'edu-ai-followup-suppression', label: 'Suppression List', icon: UserX },
          { id: 'edu-ai-followup-metrics', label: 'Follow-up Metrics', icon: TrendingUp }
        ]
      },
      {
        title: 'SYSTEM & ALERTS',
        items: [
          { id: 'notifications', label: 'Notifications', icon: Bell }
        ]
      }
    ];
  } else if (isAdmissionExecutive) {
    // =========================================================================
    // CASE 2B: EDUCATION TENANT — ADMISSION EXECUTIVE
    // =========================================================================
    navSections = [
      {
        title: 'ZENELAIT AI CRM',
        items: [
          { id: 'dashboard', label: 'My Dashboard', icon: LayoutDashboard },
          { id: 'edu-exec-enquiries', label: 'My Enquiries', icon: Users },
          { id: 'edu-exec-followups', label: 'My Follow-ups', icon: Clock },
          { id: 'edu-exec-applications', label: 'Application Pipeline', icon: BookOpen },
          { id: 'edu-exec-performance', label: 'My Performance', icon: Award }
        ]
      },
      {
        title: 'AI EMPLOYEES',
        items: [
          { id: 'edu-ai-admission-conversations', label: 'AI Admission Chat', icon: Bot },
          { id: 'edu-ai-admission-leads', label: 'AI Admission Leads', icon: Users },
          { id: 'edu-ai-admission-recommendations', label: 'Course Recommendations', icon: BookOpen },
          { id: 'edu-ai-followup-tasks', label: 'Follow-up Tasks', icon: Clock },
          { id: 'edu-ai-followup-drafts', label: 'AI Message Drafts', icon: FileCheck }
        ]
      },
      {
        title: 'SYSTEM & ALERTS',
        items: [
          { id: 'notifications', label: 'Notifications', icon: Bell }
        ]
      }
    ];
  } else if (isStudentSupportAgent) {
    // =========================================================================
    // CASE 2C: EDUCATION TENANT — STUDENT SUPPORT AGENT
    // =========================================================================
    navSections = [
      {
        title: 'ZENELAIT AI CRM',
        items: [
          { id: 'dashboard', label: 'Support Dashboard', icon: LayoutDashboard },
          { id: 'edu-supp-tickets', label: 'Ticket Workspace', icon: CheckSquare },
          { id: 'edu-supp-complaints', label: 'Complaints', icon: AlertTriangle },
          { id: 'edu-supp-knowledge', label: 'Knowledge Base', icon: BookOpen },
          { id: 'edu-supp-reports', label: 'Support Reports', icon: BarChart3 },
          { id: 'edu-ai-admission-conversations', label: 'Student Admissions Chat', icon: Bot },
          { id: 'notifications', label: 'Notifications', icon: Bell }
        ]
      }
    ];
  } else if (isCounsellor) {
    // =========================================================================
    // CASE 2D: EDUCATION TENANT — COUNSELLOR
    // =========================================================================
    navSections = [
      {
        title: 'ZENELAIT AI CRM',
        items: [
          { id: 'dashboard', label: 'Counsellor Dashboard', icon: LayoutDashboard },
          { id: 'edu-coun-students', label: 'Student Case Files', icon: Users },
          { id: 'edu-coun-calendar', label: 'Appointments Calendar', icon: Calendar },
          { id: 'edu-coun-actionplans', label: 'Action Plans', icon: CheckSquare },
          { id: 'edu-coun-recommendations', label: 'Course Matchmaker', icon: BookOpen },
          { id: 'edu-coun-ai', label: 'AI Preparation Briefs', icon: Sparkles },
          { id: 'edu-ai-admission-counselling', label: 'AI Counselling Requests', icon: Bot },
          { id: 'notifications', label: 'Notifications', icon: Bell }
        ]
      }
    ];
  } else if (isEducationTenant && (isCompanyAdmin || isSuperAdmin)) {
    // =========================================================================
    // CASE 2E: EDUCATION TENANT — COMPANY ADMIN
    // =========================================================================
    navSections = [
      {
        items: [
          { id: 'dashboard', label: 'Admission Dashboard', icon: LayoutDashboard },
          { id: 'edu-adm-dashboard', label: 'Admission Manager Portal', icon: GraduationCap },
          { id: 'edu-exec-dashboard', label: 'Admission Executive Desk', icon: UserCheck },
          { id: 'edu-supp-dashboard', label: 'Student Support Center', icon: LifeBuoy },
          { id: 'edu-coun-dashboard', label: 'Academic Counsellor Portal', icon: Compass }
        ]
      },
      {
        title: 'AI EMPLOYEES',
        items: [
          { id: 'edu-ai-admission', label: 'AI Admission Agent', icon: Bot },
          { id: 'edu-ai-admission-conversations', label: 'Live Student Chat', icon: MessageSquare },
          { id: 'edu-ai-admission-leads', label: 'Admission Leads', icon: Users },
          { id: 'edu-ai-admission-recommendations', label: 'Course Recommendations', icon: BookOpen },
          { id: 'edu-ai-admission-knowledge', label: 'Verified Knowledge Base', icon: HelpCircle },
          { id: 'edu-ai-admission-metrics', label: 'Admission AI Metrics', icon: BarChart3 },
          { id: 'edu-ai-followup', label: 'AI Follow-up Agent', icon: Clock },
          { id: 'edu-ai-followup-rules', label: 'Follow-up Rules', icon: GitFork },
          { id: 'edu-ai-followup-tasks', label: 'Scheduled Tasks', icon: Calendar },
          { id: 'edu-ai-followup-drafts', label: 'Draft Approvals Queue', icon: FileCheck },
          { id: 'edu-ai-followup-executions', label: 'Execution History', icon: Layers },
          { id: 'edu-ai-followup-suppression', label: 'Suppression List', icon: UserX },
          { id: 'edu-ai-followup-metrics', label: 'Follow-up Performance', icon: TrendingUp }
        ]
      },
      {
        title: 'ADMISSIONS MANAGEMENT',
        items: [
          { id: 'edu-adm-enquiries', label: 'Admission Enquiries', icon: Users },
          { id: 'edu-adm-applications', label: 'Application Reviews', icon: BookOpen },
          { id: 'edu-adm-targets', label: 'Admission Targets', icon: Target },
          { id: 'edu-adm-reports', label: 'Admission Reports', icon: BarChart3 }
        ]
      },
      {
        title: 'STUDENT CARE & COUNSELLING',
        items: [
          { id: 'edu-supp-tickets', label: 'Support Tickets', icon: CheckSquare },
          { id: 'edu-supp-complaints', label: 'Student Complaints', icon: AlertTriangle },
          { id: 'edu-coun-calendar', label: 'Counselling Calendar', icon: Calendar },
          { id: 'edu-coun-recommendations', label: 'Course Matchmaker', icon: Sparkles }
        ]
      },
      {
        title: 'COMPANY MANAGEMENT',
        adminOnly: true,
        items: [
          { id: 'company-profile', label: 'Company Profile', icon: Building },
          { id: 'users-roles', label: 'Users & Roles', icon: Users2 },
          { id: 'education-admin', label: 'Courses & Cohorts Admin', icon: GraduationCap },
          { id: 'subscription-billing', label: 'Subscription & Billing', icon: CreditCard, adminOnly: true }
        ]
      }
    ];
  } else if (isReceptionManager) {
    // =========================================================================
    // CASE 3A: HOSPITAL / CLINIC TENANT — RECEPTION MANAGER (Section 6.1)
    // =========================================================================
    navSections = [
      {
        title: 'HOSPITAL / CLINIC',
        items: [
          { id: 'dashboard', label: 'Reception Dashboard', icon: LayoutDashboard },
          { id: 'hosp-staff', label: 'Reception Staff', icon: Users },
          { id: 'hosp-assignments', label: 'Work Assignments', icon: Briefcase },
          { id: 'hosp-enquiries', label: 'Patient Enquiries', icon: HelpCircle },
          { id: 'hosp-queue', label: 'Reception Queue', icon: Clock },
          { id: 'hosp-escalations', label: 'Escalations', icon: AlertTriangle }
        ]
      },
      {
        title: 'AI EMPLOYEES',
        items: [
          { id: 'hosp-ai-reception', label: 'AI Reception Assistant', icon: Bot },
          { id: 'hosp-ai-support', label: 'AI Support Agent', icon: Headphones },
          { id: 'hosp-ai-followup', label: 'AI Follow-up Agent', icon: Clock },
          { id: 'hosp-kb', label: 'Knowledge Base', icon: BookOpen }
        ]
      },
      {
        title: 'REPORTS & SETTINGS',
        items: [
          { id: 'hosp-performance', label: 'Reception Performance', icon: BarChart3 },
          { id: 'hosp-service-metrics', label: 'Service Metrics', icon: TrendingUp },
          { id: 'hosp-ai-config', label: 'AI Configuration', icon: Settings },
          { id: 'hosp-audit', label: 'Audit Events', icon: ShieldCheck }
        ]
      }
    ];
  } else if (isReceptionist) {
    // =========================================================================
    // CASE 3B: HOSPITAL / CLINIC TENANT — RECEPTIONIST (Section 6.2)
    // =========================================================================
    navSections = [
      {
        title: 'HOSPITAL / CLINIC',
        items: [
          { id: 'dashboard', label: 'Receptionist Desk', icon: LayoutDashboard }
        ]
      },
      {
        title: 'PATIENTS',
        items: [
          { id: 'hosp-patient-search', label: 'Search Patients', icon: Search },
          { id: 'hosp-patient-register', label: 'Register Patient', icon: UserPlus }
        ]
      },
      {
        title: 'APPOINTMENTS',
        items: [
          { id: 'hosp-today-appointments', label: "Today's Appointments", icon: Calendar },
          { id: 'hosp-checkin', label: 'Check-in Desk', icon: UserCheck },
          { id: 'hosp-reschedule-requests', label: 'Rescheduling Requests', icon: Clock }
        ]
      },
      {
        title: 'RECEPTION QUEUE',
        items: [
          { id: 'hosp-queue', label: 'Waiting Patients', icon: Clock },
          { id: 'hosp-walkin', label: 'Walk-in Registration', icon: UserPlus }
        ]
      },
      {
        title: 'PATIENT ENQUIRIES',
        items: [
          { id: 'hosp-enquiries', label: 'My Enquiries', icon: HelpCircle },
          { id: 'hosp-handoffs', label: 'Handoffs', icon: HeartHandshake }
        ]
      },
      {
        title: 'MY TASKS',
        items: [
          { id: 'hosp-tasks', label: 'Reception Tasks', icon: CheckSquare }
        ]
      }
    ];
  } else if (isHospitalSupport) {
    // =========================================================================
    // CASE 3C: HOSPITAL / CLINIC TENANT — CUSTOMER SUPPORT (Section 6.3)
    // =========================================================================
    navSections = [
      {
        title: 'HOSPITAL / CLINIC',
        items: [
          { id: 'dashboard', label: 'Support Dashboard', icon: LayoutDashboard },
          { id: 'hosp-support-inbox', label: 'Support Inbox', icon: Inbox }
        ]
      },
      {
        title: 'TICKETS & CONVERSATIONS',
        items: [
          { id: 'hosp-tickets-open', label: 'Open Tickets', icon: MessageSquare },
          { id: 'hosp-tickets-assigned', label: 'My Assigned Tickets', icon: UserCheck },
          { id: 'hosp-conv-web', label: 'Website Chat', icon: MessageSquare },
          { id: 'hosp-conv-whatsapp', label: 'WhatsApp', icon: Phone },
          { id: 'hosp-conv-email', label: 'Email', icon: Mail }
        ]
      },
      {
        title: 'AI SUPPORT & ESCALATIONS',
        items: [
          { id: 'hosp-ai-drafts', label: 'Reply Drafts', icon: Bot },
          { id: 'hosp-ai-approvals', label: 'Approval Queue', icon: FileCheck },
          { id: 'hosp-kb', label: 'Knowledge Base', icon: BookOpen },
          { id: 'hosp-escalations', label: 'Escalations', icon: AlertTriangle },
          { id: 'hosp-followups', label: 'Follow-up Tasks', icon: CheckSquare },
          { id: 'hosp-support-metrics', label: 'Support Metrics', icon: BarChart3 }
        ]
      }
    ];
  } else if (isAppointmentCoordinator) {
    // =========================================================================
    // CASE 3D: HOSPITAL / CLINIC TENANT — APPOINTMENT COORDINATOR (Section 6.4)
    // =========================================================================
    navSections = [
      {
        title: 'HOSPITAL / CLINIC',
        items: [
          { id: 'dashboard', label: 'Scheduling Dashboard', icon: LayoutDashboard }
        ]
      },
      {
        title: 'APPOINTMENT CALENDAR',
        items: [
          { id: 'hosp-cal-day', label: 'Day View', icon: Calendar },
          { id: 'hosp-cal-week', label: 'Week View', icon: CalendarDays },
          { id: 'hosp-cal-month', label: 'Month View', icon: CalendarDays }
        ]
      },
      {
        title: 'SCHEDULING',
        items: [
          { id: 'hosp-doctors', label: 'Doctors', icon: Users },
          { id: 'hosp-departments', label: 'Departments', icon: Building2 },
          { id: 'hosp-availability', label: 'Availability', icon: CheckCircle2 },
          { id: 'hosp-new-appointment', label: 'New Appointment', icon: PlusCircle }
        ]
      },
      {
        title: 'REQUESTS',
        items: [
          { id: 'hosp-booking-requests', label: 'Booking Requests', icon: Clock },
          { id: 'hosp-reschedule-requests', label: 'Rescheduling Requests', icon: Clock },
          { id: 'hosp-cancellation-requests', label: 'Cancellation Requests', icon: XCircle }
        ]
      },
      {
        title: 'AUTOMATION & METRICS',
        items: [
          { id: 'hosp-waiting-list', label: 'Waiting List', icon: Users },
          { id: 'hosp-reminders', label: 'Appointment Reminders', icon: Bell },
          { id: 'hosp-scheduling-metrics', label: 'Scheduling Metrics', icon: BarChart3 }
        ]
      }
    ];
  } else if (isDoctorStaff) {
    // =========================================================================
    // CASE 3E: HOSPITAL / CLINIC TENANT — DOCTOR / STAFF USER (Section 6)
    // =========================================================================
    navSections = [
      {
        title: 'DOCTOR / STAFF WORKSPACE',
        items: [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'hosp-staff-profile', label: 'My Profile', icon: UserCheck },
          { id: 'hosp-staff-schedule', label: 'My Schedule', icon: Calendar },
          { id: 'hosp-staff-availability', label: 'My Availability', icon: Clock },
          { id: 'hosp-staff-appointments', label: 'My Appointments', icon: Briefcase },
          { id: 'hosp-staff-tasks', label: 'My Tasks', icon: CheckSquare },
          { id: 'hosp-staff-notifications', label: 'Notifications', icon: Bell },
          { id: 'hosp-staff-knowledge', label: 'Clinic Knowledge', icon: BookOpen },
          { id: 'hosp-staff-activity', label: 'My Activity', icon: FileText }
        ]
      }
    ];
  } else if (isAiReceptionistRole) {
    // =========================================================================
    // CASE 3F: HOSPITAL / CLINIC TENANT — AI RECEPTIONIST (Section 6)
    // =========================================================================
    navSections = [
      {
        title: 'AI RECEPTIONIST',
        items: [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'hosp-ai-rec-conversations', label: 'Live Conversations', icon: MessageSquare },
          { id: 'hosp-ai-rec-handoffs', label: 'Human Handoffs', icon: Users },
          { id: 'hosp-ai-rec-sources', label: 'Knowledge Sources', icon: BookOpen },
          { id: 'hosp-ai-rec-articles', label: 'Knowledge Articles', icon: ShieldCheck },
          { id: 'hosp-ai-rec-config', label: 'AI Configuration', icon: Settings },
          { id: 'hosp-ai-rec-analytics', label: 'Analytics', icon: BarChart3 },
          { id: 'hosp-ai-rec-activity', label: 'Activity History', icon: Clock }
        ]
      }
    ];
  } else if (isAiAppointmentAgentRole) {
    // =========================================================================
    // CASE 3G: HOSPITAL / CLINIC TENANT — AI APPOINTMENT AGENT (Section 6)
    // =========================================================================
    navSections = [
      {
        title: 'AI APPOINTMENT AGENT',
        items: [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'hosp-ai-appt-conversations', label: 'Appointment Conversations', icon: MessageSquare },
          { id: 'hosp-ai-appt-bookings', label: 'Booking Requests', icon: Calendar },
          { id: 'hosp-ai-appt-search', label: 'Appointment Search', icon: Search },
          { id: 'hosp-ai-appt-reschedule', label: 'Reschedule Requests', icon: Clock },
          { id: 'hosp-ai-appt-cancellations', label: 'Cancellation Requests', icon: AlertTriangle },
          { id: 'hosp-ai-appt-waiting', label: 'Waiting List', icon: Users },
          { id: 'hosp-ai-appt-reminders', label: 'Reminders', icon: Bell },
          { id: 'hosp-ai-appt-handoffs', label: 'Human Handoffs', icon: ShieldCheck },
          { id: 'hosp-ai-appt-config', label: 'Agent Configuration', icon: Settings },
          { id: 'hosp-ai-appt-analytics', label: 'Analytics', icon: BarChart3 },
          { id: 'hosp-ai-appt-activity', label: 'Activity History', icon: Clock }
        ]
      }
    ];
  } else if (isHospitalTenant && (isCompanyAdmin || isSuperAdmin)) {
    // =========================================================================
    // CASE 3H: HOSPITAL / CLINIC TENANT — CLINIC ADMIN / SUPERVISOR
    // =========================================================================
    navSections = [
      {
        title: 'HOSPITAL / CLINIC ROLES',
        items: [
          { id: 'hosp-reception-manager', label: 'Reception Manager', icon: ShieldCheck },
          { id: 'hosp-receptionist', label: 'Receptionist Desk', icon: UserCheck },
          { id: 'hosp-customer-support', label: 'Customer Support', icon: LifeBuoy },
          { id: 'hosp-appointment-coordinator', label: 'Appointment Coordinator', icon: Calendar },
          { id: 'hosp-doctor-staff', label: 'Doctor / Staff User', icon: Stethoscope },
          { id: 'hosp-ai-receptionist', label: 'AI Receptionist', icon: Bot },
          { id: 'hosp-ai-appointment-agent', label: 'AI Appointment Agent', icon: CalendarDays }
        ]
      },
      {
        title: 'CLINICAL OPERATIONS',
        items: [
          { id: 'dashboard', label: 'Reception Overview', icon: LayoutDashboard },
          { id: 'hosp-today-appointments', label: "Today's Appointments", icon: Calendar },
          { id: 'hosp-queue', label: 'Front-Desk Queue', icon: Clock },
          { id: 'hosp-waiting-list', label: 'Waiting List', icon: Users },
          { id: 'hosp-reminders', label: 'Reminders Scheduler', icon: Bell }
        ]
      },
      {
        title: 'COMPANY MANAGEMENT',
        adminOnly: true,
        items: [
          { id: 'company-profile', label: 'Clinic Profile', icon: Building },
          { id: 'users-roles', label: 'Staff & Roles', icon: Users2 },
          { id: 'hospital-admin', label: 'Hospital Settings & Slots', icon: HeartPulse },
          { id: 'subscription-billing', label: 'Subscription & Billing', icon: CreditCard, adminOnly: true }
        ]
      }
    ];
  } else if (isEcommerceTenant && isEcommerceSalesManager) {
    // E-COMMERCE TENANT: SALES MANAGER
    navSections = [
      {
        title: 'SALES MANAGEMENT',
        items: [
          { id: 'dashboard', label: 'Sales Dashboard', icon: LayoutDashboard },
          { id: 'ecommerce-sales-manager', label: 'Sales Performance', icon: TrendingUp },
          { id: 'ecommerce-campaigns', label: 'Campaigns & Offers', icon: Target },
          { id: 'ecommerce-abandoned-carts', label: 'Abandoned Carts', icon: Clock },
          { id: 'ecommerce-ai-sales', label: 'AI Sales Agent', icon: Bot },
          { id: 'ecommerce-sales-reports', label: 'Sales Reports', icon: BarChart3 }
        ]
      },
      {
        title: 'STORE & CATALOG',
        items: [
          { id: 'ecommerce-admin', label: 'Products & Categories', icon: ShoppingBag }
        ]
      }
    ];
  } else if (isEcommerceTenant && isEcommerceSupportManager) {
    // E-COMMERCE TENANT: CUSTOMER SUPPORT MANAGER
    navSections = [
      {
        title: 'SUPPORT OPERATIONS',
        items: [
          { id: 'dashboard', label: 'Support Dashboard', icon: LayoutDashboard },
          { id: 'ecommerce-support-manager', label: 'Ticket Allocation', icon: CheckSquare },
          { id: 'ecommerce-support-agents', label: 'Support Team', icon: Users },
          { id: 'ecommerce-support-escalations', label: 'Escalations', icon: AlertTriangle },
          { id: 'ecommerce-ai-support', label: 'AI Support Configuration', icon: Bot },
          { id: 'ecommerce-knowledge', label: 'Knowledge Base', icon: BookOpen }
        ]
      }
    ];
  } else if (isEcommerceTenant && isEcommerceSupportAgent) {
    // E-COMMERCE TENANT: SUPPORT AGENT
    navSections = [
      {
        title: 'AGENT DESK',
        items: [
          { id: 'dashboard', label: 'My Dashboard', icon: LayoutDashboard },
          { id: 'ecommerce-support-agent', label: 'Ticket Workspace', icon: MessageSquare },
          { id: 'ecommerce-agent-orders', label: 'Order Inquiries', icon: Package },
          { id: 'ecommerce-agent-returns', label: 'Returns & Refunds', icon: RotateCcw },
          { id: 'ecommerce-ai-replies', label: 'AI Reply Assistant', icon: Sparkles }
        ]
      }
    ];
  } else if (isEcommerceTenant && isEcommerceOrderManager) {
    // E-COMMERCE TENANT: ORDER MANAGER
    navSections = [
      {
        title: 'ORDER OPERATIONS',
        items: [
          { id: 'dashboard', label: 'Operations Dashboard', icon: LayoutDashboard },
          { id: 'ecommerce-order-manager', label: 'All Orders', icon: Package },
          { id: 'ecommerce-fulfilment-queue', label: 'Fulfilment Queue', icon: Clock },
          { id: 'ecommerce-shipments', label: 'Shipments & Tracking', icon: Truck },
          { id: 'ecommerce-cancellations', label: 'Cancellation Requests', icon: XCircle },
          { id: 'ecommerce-returns', label: 'Return Requests', icon: RotateCcw },
          { id: 'ecommerce-refunds', label: 'Refund Execution', icon: DollarSign }
        ]
      }
    ];
  } else if (isEcommerceTenant && isEcommerceAiSalesAgent) {
    // E-COMMERCE TENANT: AI SALES AGENT
    navSections = [
      {
        title: 'AI SALES AGENT',
        items: [
          { id: 'dashboard', label: 'Agent Dashboard', icon: LayoutDashboard },
          { id: 'ecommerce-ai-sales-agent', label: 'Sales Agent Desk', icon: Bot },
          { id: 'ecommerce-ai-sales-conversations', label: 'Live Sales Chat', icon: MessageSquare },
          { id: 'ecommerce-ai-sales-leads', label: 'Captured Leads', icon: Target },
          { id: 'ecommerce-ai-sales-recommendations', label: 'Recommendations', icon: Sparkles },
          { id: 'ecommerce-ai-sales-recovery', label: 'Cart Recoveries', icon: ShoppingBag }
        ]
      }
    ];
  } else if (isEcommerceTenant && isEcommerceAiSupportAgent) {
    // E-COMMERCE TENANT: AI SUPPORT AGENT
    navSections = [
      {
        title: 'AI SUPPORT AGENT',
        items: [
          { id: 'dashboard', label: 'Agent Dashboard', icon: LayoutDashboard },
          { id: 'ecommerce-ai-support-agent', label: 'Support Agent Desk', icon: LifeBuoy },
          { id: 'ecommerce-ai-support-conversations', label: 'Support Chat', icon: MessageSquare },
          { id: 'ecommerce-ai-support-tickets', label: 'Ticket Triage', icon: FileText },
          { id: 'ecommerce-ai-support-knowledge', label: 'Knowledge Base', icon: BookOpen }
        ]
      }
    ];
  } else if (isEcommerceTenant && isEcommerceAiOrderAgent) {
    // E-COMMERCE TENANT: AI ORDER AGENT
    navSections = [
      {
        title: 'AI ORDER AGENT',
        items: [
          { id: 'dashboard', label: 'Agent Dashboard', icon: LayoutDashboard },
          { id: 'ecommerce-ai-order-agent', label: 'Order Agent Desk', icon: Package },
          { id: 'ecommerce-ai-order-lookup', label: 'Order Lookup', icon: Search },
          { id: 'ecommerce-ai-order-shipments', label: 'Tracking & Carrier', icon: Truck },
          { id: 'ecommerce-ai-order-cancellations', label: 'Cancellations', icon: AlertCircle },
          { id: 'ecommerce-ai-order-returns', label: 'Returns & Refunds', icon: RotateCcw }
        ]
      }
    ];
  } else if (isEcommerceTenant && (isCompanyAdmin || isSuperAdmin)) {
    // E-COMMERCE TENANT: COMPANY ADMIN
    navSections = [
      {
        title: 'AI EMPLOYEES (3 AGENTS)',
        items: [
          { id: 'ecommerce-ai-sales-agent', label: 'AI Sales Agent Desk', icon: Bot },
          { id: 'ecommerce-ai-support-agent', label: 'AI Support Agent Desk', icon: LifeBuoy },
          { id: 'ecommerce-ai-order-agent', label: 'AI Order Agent Desk', icon: Package }
        ]
      },
      {
        title: 'E-COMMERCE ROLES',
        items: [
          { id: 'ecommerce-sales-manager', label: 'Sales Manager', icon: TrendingUp },
          { id: 'ecommerce-support-manager', label: 'Customer Support Manager', icon: Headphones },
          { id: 'ecommerce-support-agent', label: 'Support Agent Desk', icon: MessageSquare },
          { id: 'ecommerce-order-manager', label: 'Order & Fulfilment Manager', icon: Package }
        ]
      },
      {
        title: 'STORE & SETTINGS',
        items: [
          { id: 'dashboard', label: 'Store Overview', icon: LayoutDashboard },
          { id: 'ecommerce-admin', label: 'Products & Inventory', icon: ShoppingBag },
          { id: 'company-profile', label: 'Company Profile', icon: Building },
          { id: 'users-roles', label: 'Staff & Roles', icon: Users2 },
          { id: 'subscription-billing', label: 'Subscription & Billing', icon: CreditCard, adminOnly: true }
        ]
      }
    ];
  } else if (isHotelTenant && isHotelReservationManager) {
    navSections = [
      {
        title: 'RESERVATION MANAGER',
        items: [
          { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
          { id: 'hotel-reservation-manager', label: 'Manager Operations', icon: BedDouble },
          { id: 'hotel-rm-calendar', label: 'Reservation Calendar', icon: Calendar },
          { id: 'hotel-rm-inventory', label: 'Inventory & Rate Plans', icon: DollarSign },
          { id: 'hotel-rm-staff', label: 'Staff Assignments', icon: Users },
          { id: 'hotel-rm-automation', label: 'AI & Automations', icon: Bot },
          { id: 'hotel-rm-reports', label: 'Occupancy Reports', icon: TrendingUp }
        ]
      }
    ];
  } else if (isHotelTenant && isHotelReservationExecutive) {
    navSections = [
      {
        title: 'RESERVATION EXECUTIVE',
        items: [
          { id: 'dashboard', label: 'Executive Desk', icon: LayoutDashboard },
          { id: 'hotel-reservation-executive', label: 'Bookings & Quotations', icon: BedDouble },
          { id: 'hotel-re-availability', label: 'Availability Query', icon: Search },
          { id: 'hotel-re-reservations', label: 'Active Reservations', icon: Calendar },
          { id: 'hotel-re-guests', label: 'Guest Profiles', icon: UserCheck },
          { id: 'hotel-re-enquiries', label: 'Enquiries & Chats', icon: MessageSquare },
          { id: 'hotel-re-followups', label: 'Follow-up Tasks', icon: Clock }
        ]
      }
    ];
  } else if (isHotelTenant && isHotelCustomerSupport) {
    navSections = [
      {
        title: 'CUSTOMER SUPPORT',
        items: [
          { id: 'dashboard', label: 'Support Overview', icon: LayoutDashboard },
          { id: 'hotel-customer-support', label: 'Tickets & Service Desk', icon: LifeBuoy },
          { id: 'hotel-cs-tickets', label: 'Guest Tickets Queue', icon: AlertCircle },
          { id: 'hotel-cs-service', label: 'Service Dispatches', icon: Wrench },
          { id: 'hotel-cs-knowledge', label: 'Policy Knowledge (RAG)', icon: BookOpen },
          { id: 'hotel-cs-escalations', label: 'Duty Escalations', icon: ShieldAlert }
        ]
      }
    ];
  } else if (isHotelTenant && isHotelFrontDesk) {
    navSections = [
      {
        title: 'FRONT DESK RECEPTION',
        items: [
          { id: 'dashboard', label: 'Reception Dashboard', icon: LayoutDashboard },
          { id: 'hotel-front-desk', label: 'Front Desk Hub', icon: KeyRound },
          { id: 'hotel-fd-arrivals', label: 'Expected Arrivals', icon: LogIn },
          { id: 'hotel-fd-inhouse', label: 'In-House Guests', icon: Users },
          { id: 'hotel-fd-departures', label: 'Departures & Folios', icon: LogOut },
          { id: 'hotel-fd-housekeeping', label: 'Room Readiness (HK)', icon: Sparkles },
          { id: 'hotel-fd-moves', label: 'Room Moves', icon: BedDouble }
        ]
      }
    ];
  } else if (isHotelTenant && isHotelAiReservationAgent) {
    navSections = [
      {
        title: 'AI RESERVATION AGENT',
        items: [
          { id: 'dashboard', label: 'Agent Dashboard', icon: LayoutDashboard },
          { id: 'hotel-ai-reservation-agent', label: 'Reservation Agent Desk', icon: Bot },
          { id: 'hotel-re-availability', label: 'Availability Search', icon: Search },
          { id: 'hotel-re-reservations', label: 'Pending & Confirmed', icon: Calendar },
          { id: 'hotel-re-guests', label: 'Guest Matcher', icon: UserCheck }
        ]
      }
    ];
  } else if (isHotelTenant && isHotelAiSupportAgent) {
    navSections = [
      {
        title: 'AI SUPPORT AGENT',
        items: [
          { id: 'dashboard', label: 'Agent Dashboard', icon: LayoutDashboard },
          { id: 'hotel-ai-support-agent', label: 'Support Agent Desk', icon: LifeBuoy },
          { id: 'hotel-cs-tickets', label: 'Support Tickets', icon: AlertCircle },
          { id: 'hotel-cs-service', label: 'Service Dispatches', icon: Wrench },
          { id: 'hotel-cs-knowledge', label: 'Policy Knowledge (RAG)', icon: BookOpen }
        ]
      }
    ];
  } else if (isHotelTenant && isHotelAiFollowUpAgent) {
    navSections = [
      {
        title: 'AI FOLLOW-UP AGENT',
        items: [
          { id: 'dashboard', label: 'Agent Dashboard', icon: LayoutDashboard },
          { id: 'hotel-ai-follow-up-agent', label: 'Follow-up Desk', icon: Clock },
          { id: 'hotel-re-followups', label: 'Task Inbox', icon: CheckSquare },
          { id: 'hotel-rm-automation', label: 'Campaigns & Rules', icon: Bot }
        ]
      }
    ];
  } else if (isHotelTenant && (isCompanyAdmin || isSuperAdmin)) {
    navSections = [
      {
        title: 'HOTEL AI EMPLOYEES (3 AGENTS)',
        items: [
          { id: 'hotel-ai-reservation-agent', label: 'AI Reservation Agent Desk', icon: Bot },
          { id: 'hotel-ai-support-agent', label: 'AI Support Agent Desk', icon: LifeBuoy },
          { id: 'hotel-ai-follow-up-agent', label: 'AI Follow-up Agent Desk', icon: Clock }
        ]
      },
      {
        title: 'HOTEL 4 ROLES WORKSPACES',
        items: [
          { id: 'hotel-reservation-manager', label: 'Reservation Manager', icon: BedDouble },
          { id: 'hotel-reservation-executive', label: 'Reservation Executive', icon: Calendar },
          { id: 'hotel-customer-support', label: 'Customer Support Desk', icon: LifeBuoy },
          { id: 'hotel-front-desk', label: 'Front Desk Reception', icon: KeyRound }
        ]
      },
      {
        title: 'HOTEL PMS & SETTINGS',
        items: [
          { id: 'dashboard', label: 'Hotel Overview', icon: LayoutDashboard },
          { id: 'hotel-admin', label: 'Properties & Rooms PMS', icon: Building },
          { id: 'company-profile', label: 'Company Profile', icon: Building2 },
          { id: 'users-roles', label: 'Staff & Roles', icon: Users2 },
          { id: 'subscription-billing', label: 'Subscription & Billing', icon: CreditCard, adminOnly: true }
        ]
      }
    ];
  } else if (isTravelTenant && isTravelAiSalesAgent) {
    navSections = [
      {
        title: 'AI TRAVEL SALES AGENT',
        items: [
          { id: 'dashboard', label: 'Agent Dashboard', icon: LayoutDashboard },
          { id: 'travel-ai-sales-agent', label: 'Sales Agent Desk', icon: Bot },
          { id: 'travel-tc-leads', label: 'Leads & Enquiries', icon: Users },
          { id: 'travel-tc-search', label: 'Live Inventory Search', icon: Search },
          { id: 'travel-tc-itineraries', label: 'Draft Itineraries', icon: Calendar },
          { id: 'travel-tc-quotations', label: 'Quotations & Pricing', icon: FileText }
        ]
      }
    ];
  } else if (isTravelTenant && isTravelAiFollowUpAgent) {
    navSections = [
      {
        title: 'AI FOLLOW-UP AGENT',
        items: [
          { id: 'dashboard', label: 'Agent Dashboard', icon: LayoutDashboard },
          { id: 'travel-ai-follow-up-agent', label: 'Follow-up Desk', icon: Clock },
          { id: 'travel-tc-leads', label: 'Enquiries Cadence', icon: Users },
          { id: 'travel-sm-approvals', label: 'Draft Approvals', icon: CheckSquare }
        ]
      }
    ];
  } else if (isTravelTenant && isTravelAiBookingAgent) {
    navSections = [
      {
        title: 'AI BOOKING AGENT',
        items: [
          { id: 'dashboard', label: 'Agent Dashboard', icon: LayoutDashboard },
          { id: 'travel-ai-booking-agent', label: 'Booking Agent Desk', icon: Luggage },
          { id: 'travel-be-handoffs', label: 'Accepted Handoffs', icon: ArrowRight },
          { id: 'travel-be-bookings', label: 'Internal Bookings', icon: Calendar },
          { id: 'travel-be-suppliers', label: 'Supplier Reservations', icon: Building }
        ]
      }
    ];
  } else if (isTravelTenant) {
    navSections = [
      {
        title: 'TRAVEL AI EMPLOYEES (3 AGENTS)',
        items: [
          { id: 'travel-ai-sales-agent', label: 'AI Travel Sales Agent', icon: Bot },
          { id: 'travel-ai-follow-up-agent', label: 'AI Follow-up Agent', icon: Clock },
          { id: 'travel-ai-booking-agent', label: 'AI Booking Agent', icon: Sparkles }
        ]
      },
      {
        title: 'TRAVEL COMPANY 4 ROLES',
        items: [
          { id: 'travel-sales-manager', label: 'Sales Manager', icon: Compass },
          { id: 'travel-consultant', label: 'Travel Consultant', icon: Plane },
          { id: 'travel-customer-support', label: 'Customer Support Desk', icon: LifeBuoy },
          { id: 'travel-booking-executive', label: 'Booking Operations Executive', icon: Luggage }
        ]
      },
      {
        title: 'TOURS & PACKAGES PMS',
        items: [
          { id: 'dashboard', label: 'Travel Overview', icon: LayoutDashboard },
          { id: 'travel-admin', label: 'Destinations & Packages', icon: MapPin },
          { id: 'company-profile', label: 'Company Profile', icon: Building2 },
          { id: 'users-roles', label: 'Staff & Roles', icon: Users2 },
          { id: 'subscription-billing', label: 'Subscription & Billing', icon: CreditCard, adminOnly: true }
        ]
      }
    ];
  } else if (isManufacturingTenant) {
    // =========================================================================
    // CASE: MANUFACTURING TENANT (TECHNICAL SUPPORT + AI AGENTS + 4 ROLES & ERP CATALOG)
    // =========================================================================
    navSections = [
      {
        title: 'MANUFACTURING AI AGENTS & SUPPORT',
        items: [
          { id: 'manufacturing-technical-support', label: 'Technical Support', icon: Wrench },
          { id: 'manufacturing-ai-b2b-sales', label: 'AI B2B Sales Agent', icon: Bot },
          { id: 'manufacturing-ai-support', label: 'AI Support Agent', icon: LifeBuoy }
        ]
      },
      {
        title: 'MANUFACTURING 4 ROLES',
        items: [
          { id: 'manufacturing-sales-manager', label: 'Sales Manager', icon: TrendingUp },
          { id: 'manufacturing-sales-executive', label: 'Sales Executive', icon: Boxes },
          { id: 'manufacturing-dealer-manager', label: 'Dealer Manager', icon: Building },
          { id: 'manufacturing-customer-support', label: 'Customer Support Desk', icon: Headphones }
        ]
      },
      {
        title: 'MANUFACTURING ERP & CATALOG',
        items: [
          { id: 'dashboard', label: 'Manufacturing Overview', icon: LayoutDashboard },
          { id: 'manufacturing-admin', label: 'Catalog & Technical Specs', icon: Package },
          { id: 'company-profile', label: 'Company Profile', icon: Building2 },
          { id: 'users-roles', label: 'Staff & Roles', icon: Users2 },
          { id: 'subscription-billing', label: 'Subscription & Billing', icon: CreditCard, adminOnly: true }
        ]
      }
    ];
  } else if (isConsultingTenant) {
    // =========================================================================
    // CASE: CONSULTING COMPANIES TENANT (3 ROLES & ADVISORY CATALOG)
    // =========================================================================
    navSections = [
      {
        title: 'CONSULTING CRM ROLES',
        items: [
          { id: 'consulting-relationship-manager', label: 'Relationship Manager', icon: HeartHandshake },
          { id: 'consulting-sales-manager', label: 'Sales Manager Desk', icon: Briefcase },
          { id: 'consulting-sales-executive', label: 'Sales Executive Hub', icon: Target },
          { id: 'consulting-customer-support', label: 'Customer Support Desk', icon: Headphones }
        ]
      },
      {
        title: 'CONSULTING AI AGENTS',
        items: [
          { id: 'consulting-ai-lead-qualification', label: 'AI Lead Qualification', icon: Sparkles },
          { id: 'consulting-ai-support', label: 'Customer AI Support', icon: Bot },
          { id: 'consulting-ai-follow-up', label: 'Customer AI Follow-up', icon: Calendar }
        ]
      },
      {
        title: 'CONSULTING ENGAGEMENTS & PMS',
        items: [
          { id: 'dashboard', label: 'Consulting Overview', icon: LayoutDashboard },
          { id: 'consulting-admin', label: 'Services & Advisory Roster', icon: Layers },
          { id: 'company-profile', label: 'Company Profile', icon: Building2 },
          { id: 'users-roles', label: 'Consultants & Staff', icon: Users2 },
          { id: 'subscription-billing', label: 'Subscription & Billing', icon: CreditCard, adminOnly: true }
        ]
      }
    ];
  } else {
    // =========================================================================
    // CASE 3: GENERAL TENANTS & SOFTWARE TENANT
    // =========================================================================
    isGeneralTenantLayout = true;
    navSections = [
      {
        items: [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'tenants', label: '🏢 All 9 Tenants Hub', icon: Crown, superAdminOnly: true }
        ]
      },
      {
        title: 'COMPANY MANAGEMENT',
        adminOnly: true,
        items: [
          { id: 'company-profile', label: 'Company Profile', icon: Building },
          { id: 'users-roles', label: 'Users & Roles', icon: Users2 },
          // Industry-specific operational catalog item:
          activeIndustryId === 'education'
            ? { id: 'education-admin', label: 'Courses & Admissions', icon: GraduationCap }
            : activeIndustryId === 'hospitals' || activeIndustryId === 'hospital_clinic'
            ? { id: 'hospital-admin', label: 'Clinical Ops & Appointments', icon: HeartPulse }
            : activeIndustryId === 'ecommerce'
            ? { id: 'ecommerce-admin', label: 'Store & Inventory', icon: ShoppingBag }
            : activeIndustryId === 'hospitality'
            ? { id: 'hotel-admin', label: 'Hotel PMS & Rooms', icon: BedDouble }
            : activeIndustryId === 'travel'
            ? { id: 'travel-admin', label: 'Tours & Packages', icon: Plane }
            : activeIndustryId === 'manufacturing_b2b' || activeIndustryId === 'manufacturing'
            ? { id: 'manufacturing-admin', label: 'Products & B2B Orders', icon: Factory }
            : activeIndustryId === 'consulting' || activeIndustryId === 'financial_services'
            ? { id: 'consulting-admin', label: 'Services & Advisory', icon: Briefcase }
            : isSoftwareTenant
            ? { id: 'it-products', label: 'IT Software Products', icon: Layers }
            : null,
          { id: 'subscription-billing', label: 'Subscription & Billing', icon: CreditCard, adminOnly: true }
        ].filter(Boolean)
      },
      {
        title: 'HUMAN RESOURCES',
        allowedRoles: ['admin', 'hr'],
        items: [
          { id: 'hr-hub', label: 'HR Management Hub', icon: Users },
          { id: 'employees', label: 'Employees Directory', icon: UserCheck },
          { id: 'recruitment', label: 'Recruitment & ATS', icon: Briefcase },
          { id: 'onboarding', label: 'Onboarding & Checklists', icon: Sparkles },
          { id: 'leave', label: 'Leave & Attendance', icon: Calendar }
        ]
      },
      // SOFTWARE SALES & AI APPOINTMENT / FOLLOW-UP FEATURES: Strictly visible ONLY in Software/IT Tenant
      ...(isSoftwareTenant
        ? [
            {
              title: 'SALES MANAGEMENT',
              allowedRoles: ['admin', 'salesmanager'],
              items: [
                { id: 'sales-manager-hub', label: 'Sales Manager Hub', icon: Briefcase },
                { id: 'proposals', label: 'Quotations & Approvals', icon: FileText }
              ]
            },
            {
              title: 'SALES EXECUTIVE',
              allowedRoles: ['admin', 'salesmanager', 'salesrep'],
              items: [
                { id: 'sales-executive-hub', label: 'Sales Executive Hub', icon: Zap },
                { id: 'lead-to-sale', label: '⚡ Lead-to-Sale (5 Steps)', icon: Sparkles },
                { id: 'software-demos', label: 'Software & Demos', icon: Layers },
                { id: 'proposals', label: 'Proposals & Quotes', icon: FileText }
              ]
            },
            {
              title: 'AI APPOINTMENT AGENT',
              items: [
                { id: 'sw-ai-app-overview', label: 'Appointment Overview', icon: Calendar },
                { id: 'sw-ai-app-calendar', label: 'Appointment Calendar', icon: Calendar },
                { id: 'sw-ai-app-requests', label: 'Booking Requests', icon: Clock },
                { id: 'sw-ai-app-slots', label: 'Available Time Slots', icon: CheckCircle2 },
                { id: 'sw-ai-app-demos', label: 'Sales Demo Meetings', icon: Video },
                { id: 'sw-ai-app-consultations', label: 'Technical Consultations', icon: Briefcase },
                { id: 'sw-ai-app-onboarding', label: 'Customer Onboarding', icon: UserCheck },
                { id: 'sw-ai-app-reschedule', label: 'Reschedule Requests', icon: Clock },
                { id: 'sw-ai-app-cancel', label: 'Cancellation Requests', icon: AlertTriangle },
                { id: 'sw-ai-app-reminders', label: 'Meeting Reminders', icon: Bell },
                { id: 'sw-ai-app-handoffs', label: 'Human Handoffs', icon: HeartHandshake },
                { id: 'sw-ai-app-config', label: 'Agent Configuration', icon: Settings },
                { id: 'sw-ai-app-reports', label: 'Appointment Reports', icon: BarChart3 }
              ]
            },
            {
              title: 'AI FOLLOW-UP AGENT',
              items: [
                { id: 'sw-ai-followup-overview', label: 'Overview', icon: Sparkles },
                { id: 'sw-ai-followup-tasks', label: 'Follow-up Tasks', icon: CheckSquare },
                { id: 'sw-ai-followup-rules', label: 'Follow-up Rules', icon: GitFork },
                { id: 'sw-ai-followup-leads', label: 'Lead Follow-ups', icon: Users },
                { id: 'sw-ai-followup-demos', label: 'Demo Follow-ups', icon: Video },
                { id: 'sw-ai-followup-quotations', label: 'Quotation Follow-ups', icon: FileText },
                { id: 'sw-ai-followup-customers', label: 'Customer Follow-ups', icon: HeartHandshake },
                { id: 'sw-ai-followup-drafts', label: 'AI Message Drafts', icon: FileText },
                { id: 'sw-ai-followup-approvals', label: 'Approval Queue', icon: CheckCircle2 },
                { id: 'sw-ai-followup-executions', label: 'Execution History', icon: Clock },
                { id: 'sw-ai-followup-failures', label: 'Failed Deliveries', icon: AlertTriangle },
                { id: 'sw-ai-followup-suppressions', label: 'Suppression & Opt-outs', icon: UserX },
                { id: 'sw-ai-followup-config', label: 'Agent Configuration', icon: Settings },
                { id: 'sw-ai-followup-reports', label: 'Performance Reports', icon: BarChart3 }
              ]
            }
          ]
        : []),
      {
        title: 'SUPPORT OPERATIONS',
        allowedRoles: ['admin', 'support'],
        items: [
          { id: 'support-hub', label: 'Support Operations Hub', icon: Headphones, badge: 'Live' }
        ]
      },
      {
        title: 'MARKETING MANAGEMENT',
        allowedRoles: ['admin', 'marketingmanager'],
        items: [
          { id: 'marketing-hub', label: 'Marketing Hub', icon: Megaphone },
          { id: 'campaigns', label: 'Campaigns & Lifecycle', icon: Target },
          { id: 'audiences', label: 'Audience Segments', icon: Users }
        ]
      },
      {
        title: 'CRM',
        items: [
          { id: 'leads', label: 'Leads', icon: UserPlus, hideForRoles: ['support'] },
          { id: 'customers', label: 'Customers', icon: Users },
          { id: 'opportunities', label: 'Opportunities', icon: Target, hideForRoles: ['support'] },
          { id: 'tasks', label: 'Tasks', icon: CheckSquare },
          { id: 'calendar', label: 'Calendar', icon: Calendar }
        ]
      },
      {
        title: 'AI EMPLOYEES & COPILOTS',
        hideForRoles: ['analyst'],
        items: [
          { id: 'ai-fleet-hub', label: 'AI Fleet & Follow-up', icon: Sparkles },
          { id: 'ai-employees', label: 'AI Employees', icon: Bot },
          { id: 'voice-agent', label: 'Voice AI SDR & Calling', icon: PhoneCall, badge: 'AI' },
          { id: 'whatsapp-hub', label: 'WhatsApp Business API', icon: MessageSquare, badge: 'Live' },
          { id: 'email-copilot', label: 'Email Copilot & Reactivation', icon: Mail },
          { id: 'vector-rag', label: 'TiDB Vector RAG & Widget', icon: Database, badge: 'RAG' },
          { id: 'accelerators', label: '⚡ Sales Accelerators & Sync', icon: Zap, badge: '5-in-1' },
          { id: 'agent-builder', label: 'Agent Builder', icon: Wrench, adminOnly: true }
        ]
      },
      {
        title: 'COMMUNICATIONS',
        hideForRoles: ['analyst'],
        items: [
          { id: 'conversations', label: 'Conversations', icon: MessageSquare },
          { id: 'inbox', label: 'Omnichannel Inbox', icon: Inbox, badge: '12' },
          { id: 'templates', label: 'Templates', icon: FileText }
        ]
      },
      {
        title: 'KNOWLEDGE BASE',
        items: [
          { id: 'knowledge-base', label: 'Knowledge Base', icon: BookOpen },
          { id: 'documents', label: 'Documents', icon: FileText },
          { id: 'faq', label: 'FAQ', icon: HelpCircle }
        ]
      },
      {
        title: 'AUTOMATION',
        allowedRoles: ['admin', 'salesmanager', 'marketingmanager'],
        items: [
          { id: 'automation-center', label: 'My Automations', icon: Zap },
          { id: 'workflow-builder', label: 'Create Automation', icon: GitFork },
          { id: 'automation-templates', label: 'Templates', icon: Layers },
          { id: 'automation-history', label: 'Execution History', icon: Clock },
          { id: 'automation-analytics', label: 'Analytics', icon: TrendingUp },
          { id: 'automation-settings', label: 'Settings', icon: Settings }
        ]
      },
      {
        title: 'ANALYTICS & REPORTS',
        allowedRoles: ['admin', 'salesmanager', 'salesrep', 'analyst', 'marketingmanager', 'support'],
        items: [
          { id: 'analyst-hub', label: 'BI Analytics Hub', icon: BarChart3 },
          { id: 'reports', label: 'Reports', icon: BarChart3 },
          { id: 'analytics', label: 'Analytics', icon: TrendingUp }
        ]
      },
      {
        title: 'INTEGRATIONS',
        adminOnly: true,
        items: [
          { id: 'integrations', label: 'Integrations', icon: Layers }
        ]
      },
      {
        title: 'SETTINGS',
        adminOnly: true,
        items: [
          { id: 'company-settings', label: 'Company Settings', icon: Settings }
        ]
      }
    ];
  }

  // Role Category
  const isHr = currentRolePermissions?.isHr || (currentUserRole || '').toLowerCase().includes('hr');
  const roleCategory = isSuperAdmin ? 'superadmin' :
    isCompanyAdmin ? 'admin' :
    isHr ? 'hr' :
    isSalesManager ? 'salesmanager' :
    isMarketingManager ? 'marketingmanager' :
    (isSupportManager || isSupportAgent) ? 'support' :
    isSalesRepresentative ? 'salesrep' :
    isAnalyst ? 'analyst' : 'admin';

  // Dedicated industry/role layouts are already explicitly crafted for that persona.
  // For the general/software tenant fallback, filter sections and items strictly based on the active role category.
  const visibleNavSections = !isGeneralTenantLayout
    ? navSections
    : navSections
        .map((section) => {
          if (section.adminOnly && !isCompanyAdmin && !isSuperAdmin) return null;
          if (section.allowedRoles && !section.allowedRoles.includes(roleCategory) && !isSuperAdmin) return null;
          if (section.hideForRoles && section.hideForRoles.includes(roleCategory) && !isSuperAdmin) return null;

          const items = section.items.filter((item) => {
            if (item.superAdminOnly && !isSuperAdmin) return false;
            if (item.adminOnly && !isCompanyAdmin && !isSuperAdmin) return false;
            if (item.hideForRoles && item.hideForRoles.includes(roleCategory) && !isSuperAdmin) return false;
            return true;
          });

          if (items.length === 0) return null;
          return { ...section, items };
        })
        .filter(Boolean);

  return (
    <>
      {/* Mobile backdrop */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            zIndex: 45
          }}
        />
      )}

      <aside className={`sidebar ${isSidebarOpen ? 'mobile-open' : ''}`}>
        {/* Brand Logo */}
        <div className="sidebar-brand">
          <div className="brand-icon-box" style={{ backgroundColor: '#2563eb' }}>
            <BotMessageSquare size={20} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="brand-name">Zenelait AI</span>
            <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 500 }}>
              AI CRM & Multi-Tenant SaaS
            </span>
          </div>
        </div>

        {/* Active Role Tag Bar */}
        <div style={{ padding: '0 16px 12px', flexShrink: 0 }}>
          <div
            onClick={currentRolePermissions?.canSwitchRoles ? () => navigateTo('users-roles') : undefined}
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: currentRolePermissions?.canSwitchRoles ? 'pointer' : 'default'
            }}
            title={currentRolePermissions?.canSwitchRoles ? "Active Session Persona - Click to Manage Roles" : `Logged in as ${currentUserRole}`}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  backgroundColor: currentUserRole.includes('Super Admin') ? '#8b5cf6' :
                    currentUserRole.includes('Manager') ? '#0284c7' :
                    currentUserRole.includes('Support') ? '#10b981' :
                    currentUserRole.includes('Analyst') || currentUserRole.includes('Viewer') ? '#64748b' :
                    '#2563eb'
                }}
              />
              <span style={{ fontSize: '0.72rem', color: '#e2e8f0', fontWeight: 600 }}>
                {currentUserRole}
              </span>
            </div>
            {currentRolePermissions?.canSwitchRoles && (
              <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Switch</span>
            )}
          </div>
        </div>

        {/* Grouped Navigation */}
        <nav className="sidebar-nav">
          {visibleNavSections.map((section, sIdx) => (
            <div key={sIdx} className="sidebar-section">
              {section.title && (
                <div className="sidebar-section-title">
                  {section.title}
                </div>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  activeTab === item.id ||
                  (item.id === 'leads' && activeTab === 'lead-details') ||
                  (item.id === 'ai-employees' && activeTab === 'ai-agents') ||
                  (item.id === 'inbox' && activeTab === 'conversations') ||
                  (item.id === 'automation-center' && (activeTab === 'automations' || activeTab === 'automation-center')) ||
                  (item.id === 'workflow-builder' && activeTab === 'workflows') ||
                  (item.id === 're-properties' && activeTab === 're-properties') ||
                  (item.id === 're-leads' && activeTab === 're-leads') ||
                  (item.id === 're-pipeline' && activeTab === 're-pipeline');

                return (
                  <div
                    key={item.id}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => handleNavClick(item.id)}
                    style={{ cursor: 'pointer' }}
                    title={item.label}
                  >
                    <div className="nav-item-left">
                      <Icon size={16} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="nav-count-badge red-badge">
                        {item.badge}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer: Tenant Capsule & Log Out */}
        <div className="sidebar-footer" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div
            className="sidebar-tenant-capsule"
            onClick={() => handleNavClick('company-profile')}
          >
            <div
              className="tenant-logo-badge"
              style={{
                backgroundColor: (isUltraSuperAdmin && isPlatformView) ? '#d97706' : (companyProfile.color || '#2563eb'),
                color: '#fff',
                fontWeight: 700
              }}
            >
              {(isUltraSuperAdmin && isPlatformView) ? '👑' : (companyProfile.logoLetter || (companyProfile.name ? companyProfile.name.substring(0, 2).toUpperCase() : 'CO'))}
            </div>
            <div className="tenant-info-text">
              <div className="tenant-name-text">
                {(isUltraSuperAdmin && isPlatformView) ? 'Zenelait AI Platform Root' : companyProfile.name}
              </div>
              <div className="tenant-sub-text">
                {(isUltraSuperAdmin && isPlatformView) ? 'Universal SaaS Platform' : companyProfile.industry}
              </div>
            </div>
            <ChevronRight size={14} style={{ color: '#64748b' }} />
          </div>

          <button
            onClick={logout}
            style={{
              width: '100%',
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'transparent',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#ef4444',
              fontSize: '0.72rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            title="Log Out Securely"
          >
            <LogOut size={13} />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>
    </>
  );
}
