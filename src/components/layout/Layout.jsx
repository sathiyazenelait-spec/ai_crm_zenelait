import React from 'react';
import { useCRM } from '../../context/CRMContext';
import { useTheme } from '../../context/ThemeContext';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { TopHorizonNav } from './TopHorizonNav';
import { FloatingDock } from './FloatingDock';
import { NotificationsDrawer } from '../notifications/NotificationsDrawer';
import { ModalsContainer } from '../common/Modals';

// All 18 Screen Views for Company Admin (Software / IT Company)
import { DashboardView } from '../dashboard/DashboardView';
import { CompanyProfileView } from '../company/CompanyProfileView';
import { UsersAndRolesView } from '../team/UsersAndRolesView';
import { SubscriptionBillingView } from '../subscription/SubscriptionBillingView';
import { LeadsList } from '../leads/LeadsList';
import { LeadDetails } from '../leads/LeadDetails';
import { CustomersList } from '../customers/CustomersList';
import { OpportunitiesView } from '../opportunities/OpportunitiesView';
import { TasksView } from '../tasks/TasksView';
import { CalendarView } from '../appointments/CalendarView';
import { AIAgentsView } from '../aiAgents/AIAgentsView';
import { AgentBuilderView } from '../aiAgents/AgentBuilderView';
import { OmnichannelInbox } from '../conversations/OmnichannelInbox';
import { CommunicationTemplatesView } from '../templates/CommunicationTemplatesView';
import { KnowledgeBaseView } from '../knowledgeBase/KnowledgeBaseView';
import { AutomationCenter } from '../automation/AutomationCenter';
import { WorkflowBuilderView } from '../automation/WorkflowBuilderView';
import { ReportsAnalyticsView } from '../reports/ReportsAnalyticsView';
import { IntegrationsView } from '../integrations/IntegrationsView';
import { IndustryWorkflowView } from '../workflows/IndustryWorkflowView';
import { PlatformAdminView } from '../platform/PlatformAdminView';
import { SalesExecutiveHub } from '../salesExecutive/SalesExecutiveHub';
import { HRHub } from '../hr/HRHub';
import { ITProductsView } from '../company/ITProductsView';
import { RealEstateInventoryView } from '../company/RealEstateInventoryView';
import { EducationAdminView } from '../company/EducationAdminView';
import { HospitalAdminView } from '../company/HospitalAdminView';
import { EcommerceAdminView } from '../company/EcommerceAdminView';
import { HotelAdminView } from '../company/HotelAdminView';
import { TravelAdminView } from '../company/TravelAdminView';
import { ManufacturingAdminView } from '../company/ManufacturingAdminView';
import { ConsultingAdminView } from '../company/ConsultingAdminView';
import { ConsultingSalesManagerView } from '../company/ConsultingSalesManagerView';
import { ConsultingSalesExecutiveView } from '../company/ConsultingSalesExecutiveView';
import { ConsultingCustomerSupportView } from '../company/ConsultingCustomerSupportView';
import { ConsultingRelationshipManagerView } from '../company/ConsultingRelationshipManagerView';
import { ConsultingAiLeadQualificationView } from '../company/ConsultingAiLeadQualificationView';
import { ConsultingCustomerAiSupportView } from '../company/ConsultingCustomerAiSupportView';
import { ConsultingCustomerAiFollowUpView } from '../company/ConsultingCustomerAiFollowUpView';
import { SalesManagerView } from '../company/SalesManagerView';
import { SupportOperationsHub } from '../company/SupportOperationsHub';
import { MarketingManagerView } from '../company/MarketingManagerView';
import { AnalystHubView } from '../company/AnalystHubView';
import { AiAgentsHubView } from '../company/AiAgentsHubView';
import { ErrorBoundary } from '../common/ErrorBoundary';
import RealEstateSalesManagerView from '../company/RealEstateSalesManagerView';
import RealEstateSalesExecutiveView from '../company/RealEstateSalesExecutiveView';
import RealEstateCustomerRelationsView from '../company/RealEstateCustomerRelationsView';
import RealEstateCoordinatorView from '../company/RealEstateCoordinatorView';
import { RealEstateSupportAgentView } from '../company/RealEstateSupportAgentView';
import { RealEstateAiPropertySalesAgentView } from '../company/RealEstateAiPropertySalesAgentView';
import { SoftwareAiAppointmentAgentView } from '../company/SoftwareAiAppointmentAgentView';
import { SoftwareAiFollowUpAgentView } from '../company/SoftwareAiFollowUpAgentView';
import EducationAdmissionManagerView from '../company/EducationAdmissionManagerView';
import EducationAdmissionExecutiveView from '../company/EducationAdmissionExecutiveView';
import EducationStudentSupportView from '../company/EducationStudentSupportView';
import EducationCounsellorView from '../company/EducationCounsellorView';
import EducationAiAdmissionAgentView from '../company/EducationAiAdmissionAgentView';
import EducationAiFollowUpAgentView from '../company/EducationAiFollowUpAgentView';
import EducationStudentChatWidget from '../company/EducationStudentChatWidget';
import HospitalReceptionManagerView from '../company/HospitalReceptionManagerView';
import HospitalReceptionistView from '../company/HospitalReceptionistView';
import HospitalCustomerSupportView from '../company/HospitalCustomerSupportView';
import HospitalAppointmentCoordinatorView from '../company/HospitalAppointmentCoordinatorView';
import HospitalDoctorStaffView from '../company/HospitalDoctorStaffView';
import HospitalAiReceptionistView from '../company/HospitalAiReceptionistView';
import HospitalAiAppointmentAgentView from '../company/HospitalAiAppointmentAgentView';
import EcommerceSalesManagerView from '../company/EcommerceSalesManagerView';
import EcommerceSupportManagerView from '../company/EcommerceSupportManagerView';
import EcommerceSupportAgentView from '../company/EcommerceSupportAgentView';
import EcommerceOrderManagerView from '../company/EcommerceOrderManagerView';
import EcommerceAiSalesAgentView from '../company/EcommerceAiSalesAgentView';
import EcommerceAiSupportAgentView from '../company/EcommerceAiSupportAgentView';
import EcommerceAiOrderAgentView from '../company/EcommerceAiOrderAgentView';
import HotelReservationManagerView from '../company/HotelReservationManagerView';
import HotelReservationExecutiveView from '../company/HotelReservationExecutiveView';
import HotelCustomerSupportView from '../company/HotelCustomerSupportView';
import HotelFrontDeskView from '../company/HotelFrontDeskView';
import HotelAiReservationAgentView from '../company/HotelAiReservationAgentView';
import HotelAiSupportAgentView from '../company/HotelAiSupportAgentView';
import HotelAiFollowUpAgentView from '../company/HotelAiFollowUpAgentView';
import { TravelSalesManagerView } from '../company/TravelSalesManagerView';
import { TravelConsultantView } from '../company/TravelConsultantView';
import { TravelCustomerSupportView } from '../company/TravelCustomerSupportView';
import { TravelBookingExecutiveView } from '../company/TravelBookingExecutiveView';
import { TravelAiSalesAgentView } from '../company/TravelAiSalesAgentView';
import { TravelAiFollowUpAgentView } from '../company/TravelAiFollowUpAgentView';
import { TravelAiBookingAgentView } from '../company/TravelAiBookingAgentView';
import { ManufacturingSalesManagerView } from '../company/ManufacturingSalesManagerView';
import { ManufacturingSalesExecutiveView } from '../company/ManufacturingSalesExecutiveView';
import { ManufacturingDealerManagerView } from '../company/ManufacturingDealerManagerView';
import { ManufacturingCustomerSupportView } from '../company/ManufacturingCustomerSupportView';
import { ManufacturingTechnicalSupportView } from '../company/ManufacturingTechnicalSupportView';
import { ManufacturingAiB2BSalesAgentView } from '../company/ManufacturingAiB2BSalesAgentView';
import { ManufacturingAiSupportAgentView } from '../company/ManufacturingAiSupportAgentView';

export function Layout() {
  const {
    activeTab,
    isPlatformView,
    activeIndustryId,
    currentUserRole,
    isSidebarOpen,
    currentRolePermissions,
    impersonationSession,
    terminateDelegatedAccess
  } = useCRM();
  const { layout } = useTheme();
  const isEducationTenant = activeIndustryId === 'education' || activeIndustryId === 'education_training';

  const isSuperAdminUser =
    currentRolePermissions?.canManageAllCompanies ||
    currentRolePermissions?.isSuperAdmin ||
    (currentUserRole || '').includes('Super Admin') ||
    (currentUserRole || '').includes('Ultra') ||
    (currentUserRole || '').includes('God');

  const renderActiveView = () => {
    // Platform Command Center view (only when on platform tabs or on dashboard while in platform mode)
    const isPlatformTab = activeTab === 'platform-admin' || activeTab === 'tenants' || activeTab === 'platform' || activeTab === 'workspaces-hub';
    if (isPlatformTab || (isPlatformView && activeTab === 'dashboard')) {
      if (isSuperAdminUser) {
        return <PlatformAdminView />;
      }
      return <CompanyProfileView />;
    }

    const isSoftwareTenant = activeIndustryId === 'software' || activeIndustryId === 'software_it' || activeIndustryId === 'it_software';
    const isRealEstateTenant = activeIndustryId === 'real_estate';
    const isEducationTenant = activeIndustryId === 'education' || activeIndustryId === 'education_training';
    const isHospitalTenant = activeIndustryId === 'hospitals' || activeIndustryId === 'hospital_clinic';
    const roleLower = (currentUserRole || '').toLowerCase();

    switch (activeTab) {
      // Platform / Tenants Hub
      case 'platform-admin':
      case 'tenants':
      case 'platform':
      case 'workspaces-hub':
        if (isSuperAdminUser) {
          return <PlatformAdminView />;
        }
        return <CompanyProfileView />;

      // 1. Dashboard
      case 'dashboard':
        if (isHospitalTenant) {
          if (roleLower.includes('doctor') || roleLower.includes('staff') || currentUserRole === 'DOCTOR' || currentUserRole === 'STAFF') {
            return <HospitalDoctorStaffView />;
          }
          if (roleLower.includes('ai receptionist') || currentUserRole === 'AI_RECEPTIONIST') {
            return <HospitalAiReceptionistView />;
          }
          if (roleLower.includes('ai appointment') || currentUserRole === 'AI_APPOINTMENT_AGENT') {
            return <HospitalAiAppointmentAgentView />;
          }
          if (roleLower.includes('reception manager') || currentUserRole === 'RECEPTION_MANAGER') {
            return <HospitalReceptionManagerView />;
          }
          if (roleLower.includes('receptionist') || currentUserRole === 'RECEPTIONIST') {
            return <HospitalReceptionistView />;
          }
          if (roleLower.includes('customer support') || roleLower.includes('support agent') || currentUserRole === 'CUSTOMER_SUPPORT') {
            return <HospitalCustomerSupportView />;
          }
          if (roleLower.includes('appointment coordinator') || roleLower.includes('coordinator') || currentUserRole === 'APPOINTMENT_COORDINATOR') {
            return <HospitalAppointmentCoordinatorView />;
          }
          return <HospitalReceptionManagerView />;
        }
        if (isRealEstateTenant) {
          if (roleLower.includes('support') || roleLower.includes('customer care')) {
            return <RealEstateSupportAgentView initialSubTab="dashboard" />;
          }
          if (roleLower.includes('sales manager') || roleLower.includes('salesmanager')) {
            return <RealEstateSalesManagerView initialSubTab="dashboard" />;
          }
          if (roleLower.includes('property sales') || roleLower.includes('sales executive') || roleLower.includes('real estate sales executive')) {
            return <RealEstateSalesExecutiveView initialSubTab="dashboard" />;
          }
          if (roleLower.includes('customer relationship') || roleLower.includes('customer relations') || roleLower.includes('crm manager')) {
            return <RealEstateCustomerRelationsView initialSubTab="dashboard" />;
          }
          if (roleLower.includes('site visit coordinator') || roleLower.includes('visit coordinator') || roleLower.includes('coordinator')) {
            return <RealEstateCoordinatorView initialSubTab="dashboard" />;
          }
          return <RealEstateSalesManagerView initialSubTab="dashboard" />;
        }
        if (isEducationTenant) {
          if (roleLower.includes('admission manager') || roleLower.includes('admission_manager') || currentUserRole === 'ADMISSION_MANAGER') {
            return <EducationAdmissionManagerView initialSubTab="dashboard" />;
          }
          if (roleLower.includes('admission executive') || roleLower.includes('admission_executive') || currentUserRole === 'ADMISSION_EXECUTIVE') {
            return <EducationAdmissionExecutiveView initialSubTab="dashboard" />;
          }
          if (roleLower.includes('student support') || roleLower.includes('student_support') || currentUserRole === 'STUDENT_SUPPORT_AGENT') {
            return <EducationStudentSupportView initialSubTab="dashboard" />;
          }
          if (roleLower.includes('counsellor') || roleLower.includes('counselor') || currentUserRole === 'COUNSELLOR') {
            return <EducationCounsellorView initialSubTab="dashboard" />;
          }
          return <EducationAdmissionManagerView initialSubTab="dashboard" />;
        }
        if (activeIndustryId === 'ecommerce') {
          if (roleLower.includes('ai sales') || currentUserRole === 'AI_SALES_AGENT') {
            return <EcommerceAiSalesAgentView />;
          }
          if (roleLower.includes('ai support') || currentUserRole === 'AI_SUPPORT_AGENT') {
            return <EcommerceAiSupportAgentView />;
          }
          if (roleLower.includes('ai order') || currentUserRole === 'AI_ORDER_AGENT') {
            return <EcommerceAiOrderAgentView />;
          }
          if (roleLower.includes('order manager') || currentUserRole === 'ORDER_MANAGER' || currentUserRole === 'ECOMMERCE_ORDER_MANAGER') {
            return <EcommerceOrderManagerView />;
          }
          if (roleLower.includes('customer support manager') || (roleLower.includes('support manager') && !roleLower.includes('reception')) || currentUserRole === 'SUPPORT_MANAGER' || currentUserRole === 'ECOMMERCE_SUPPORT_MANAGER') {
            return <EcommerceSupportManagerView />;
          }
          if (roleLower.includes('support agent') || currentUserRole === 'SUPPORT_AGENT' || currentUserRole === 'ECOMMERCE_SUPPORT_AGENT') {
            return <EcommerceSupportAgentView />;
          }
          return <EcommerceSalesManagerView />;
        }
        if (activeIndustryId === 'hospitality' || activeIndustryId === 'hotel' || activeIndustryId === 'hotel_resort') {
          if (roleLower.includes('ai reservation') || currentUserRole === 'AI_RESERVATION_AGENT' || currentUserRole === 'HOTEL_AI_RESERVATION_AGENT') {
            return <HotelAiReservationAgentView />;
          }
          if (roleLower.includes('ai support') || currentUserRole === 'AI_SUPPORT_AGENT' || currentUserRole === 'HOTEL_AI_SUPPORT_AGENT') {
            return <HotelAiSupportAgentView />;
          }
          if (roleLower.includes('ai follow-up') || roleLower.includes('ai followup') || currentUserRole === 'AI_FOLLOW_UP_AGENT' || currentUserRole === 'HOTEL_AI_FOLLOW_UP_AGENT') {
            return <HotelAiFollowUpAgentView />;
          }
          if (roleLower.includes('reservation executive') || currentUserRole === 'RESERVATION_EXECUTIVE') {
            return <HotelReservationExecutiveView />;
          }
          if (roleLower.includes('customer support') || currentUserRole === 'HOTEL_CUSTOMER_SUPPORT') {
            return <HotelCustomerSupportView />;
          }
          if (roleLower.includes('front desk') || roleLower.includes('reception') || currentUserRole === 'FRONT_DESK') {
            return <HotelFrontDeskView />;
          }
          return <HotelReservationManagerView />;
        }
        if (activeIndustryId === 'travel' || activeIndustryId === 'travel_tourism') {
          if (roleLower.includes('ai travel sales') || roleLower.includes('ai sales') || currentUserRole === 'AI_TRAVEL_SALES_AGENT') {
            return <TravelAiSalesAgentView />;
          }
          if (roleLower.includes('ai follow-up') || roleLower.includes('ai followup') || currentUserRole === 'AI_FOLLOW_UP_AGENT') {
            return <TravelAiFollowUpAgentView />;
          }
          if (roleLower.includes('ai booking') || currentUserRole === 'AI_BOOKING_AGENT') {
            return <TravelAiBookingAgentView />;
          }
          if (roleLower.includes('consultant') || currentUserRole === 'TRAVEL_CONSULTANT') {
            return <TravelConsultantView />;
          }
          if (roleLower.includes('customer support') || (roleLower.includes('support') && !roleLower.includes('sales')) || currentUserRole === 'TRAVEL_CUSTOMER_SUPPORT' || currentUserRole === 'CUSTOMER_SUPPORT') {
            return <TravelCustomerSupportView />;
          }
          if (roleLower.includes('booking') || currentUserRole === 'BOOKING_EXECUTIVE' || currentUserRole === 'TRAVEL_BOOKING_EXECUTIVE') {
            return <TravelBookingExecutiveView />;
          }
          return <TravelSalesManagerView />;
        }
        const isManufacturingTenant = activeIndustryId === 'manufacturing' || activeIndustryId === 'manufacturing_b2b' || activeIndustryId === 'industrial';
        if (isManufacturingTenant) {
          if (roleLower.includes('technical') || currentUserRole === 'MANUFACTURING_TECHNICAL_SUPPORT') {
            return <ManufacturingTechnicalSupportView />;
          }
          if (roleLower.includes('ai b2b sales') || roleLower.includes('ai sales') || currentUserRole === 'MANUFACTURING_AI_B2B_SALES_AGENT') {
            return <ManufacturingAiB2BSalesAgentView />;
          }
          if (roleLower.includes('ai support') || currentUserRole === 'MANUFACTURING_AI_SUPPORT_AGENT') {
            return <ManufacturingAiSupportAgentView />;
          }
          if (roleLower.includes('sales executive') || roleLower.includes('executive') || currentUserRole === 'MANUFACTURING_SALES_EXECUTIVE') {
            return <ManufacturingSalesExecutiveView />;
          }
          if (roleLower.includes('dealer') || currentUserRole === 'MANUFACTURING_DEALER_MANAGER') {
            return <ManufacturingDealerManagerView />;
          }
          if (roleLower.includes('customer support') || (roleLower.includes('support') && !roleLower.includes('manager')) || currentUserRole === 'CUSTOMER_SUPPORT' || currentUserRole === 'MANUFACTURING_CUSTOMER_SUPPORT') {
            return <ManufacturingCustomerSupportView />;
          }
          return <ManufacturingSalesManagerView />;
        }
        const isConsultingTenant = activeIndustryId === 'consulting' || activeIndustryId === 'financial_services' || activeIndustryId === 'advisory';
        if (isConsultingTenant) {
          if (roleLower.includes('relationship manager') || currentUserRole === 'RELATIONSHIP_MANAGER' || currentUserRole === 'CONSULTING_RELATIONSHIP_MANAGER') {
            return <ConsultingRelationshipManagerView />;
          }
          if (roleLower.includes('ai lead qualification') || roleLower.includes('lead qualification') || currentUserRole === 'AI_LEAD_QUALIFICATION_AGENT') {
            return <ConsultingAiLeadQualificationView />;
          }
          if (roleLower.includes('ai support') || currentUserRole === 'CONSULTING_AI_SUPPORT_AGENT') {
            return <ConsultingCustomerAiSupportView />;
          }
          if (roleLower.includes('ai follow-up') || roleLower.includes('ai followup') || currentUserRole === 'CONSULTING_AI_FOLLOW_UP_AGENT') {
            return <ConsultingCustomerAiFollowUpView />;
          }
          if (roleLower.includes('sales executive') || currentUserRole === 'CONSULTING_SALES_EXECUTIVE') {
            return <ConsultingSalesExecutiveView />;
          }
          if (roleLower.includes('customer support') || (roleLower.includes('support') && !roleLower.includes('manager')) || currentUserRole === 'CONSULTING_CUSTOMER_SUPPORT') {
            return <ConsultingCustomerSupportView />;
          }
          if (roleLower.includes('sales manager') || currentUserRole === 'CONSULTING_SALES_MANAGER') {
            return <ConsultingSalesManagerView />;
          }
          return <ConsultingRelationshipManagerView />;
        }
        if (isSoftwareTenant) {
          if (roleLower.includes('sales manager')) {
            return <SalesManagerView />;
          }
          if (roleLower.includes('sales executive')) {
            return <SalesExecutiveHub initialSubTab="cockpit" />;
          }
          if (roleLower.includes('support manager')) {
            return <SupportOperationsHub defaultRole="SUPPORT_MANAGER" initialSubTab="sla-manager" />;
          }
          if (roleLower.includes('support agent')) {
            return <SupportOperationsHub defaultRole="SUPPORT_AGENT" initialSubTab="agent-desk" />;
          }
          if (roleLower.includes('marketing manager')) {
            return <MarketingManagerView />;
          }
          if (roleLower.includes('analyst')) {
            return <AnalystHubView />;
          }
          if (roleLower.includes('ai sales agent') || roleLower.includes('ai sales')) {
            return <AiAgentsHubView initialTab="sales" />;
          }
          if (roleLower.includes('ai support agent') || roleLower.includes('ai support')) {
            return <AiAgentsHubView initialTab="support" />;
          }
          if (roleLower.includes('ai follow-up') || roleLower.includes('ai followup')) {
            return <SoftwareAiFollowUpAgentView />;
          }
        }
        return <DashboardView />;

      // =========================================================================
      // REAL ESTATE ROLE: SUPPORT AGENT
      // =========================================================================
      case 're-support-dashboard':
        return <RealEstateSupportAgentView initialSubTab="dashboard" />;
      case 're-support-inbox':
      case 're-support-my-tickets':
      case 're-support-questions':
      case 're-support-property-enquiries':
      case 're-support-booking-support':
      case 're-support-site-visit-support':
      case 're-support-communications':
      case 're-support-ai-reply':
        return <RealEstateSupportAgentView initialSubTab="inbox" />;
      case 're-support-complaints':
      case 're-support-escalations':
        return <RealEstateSupportAgentView initialSubTab="complaints" />;
      case 're-support-kb':
        return <RealEstateSupportAgentView initialSubTab="knowledge" />;
      case 're-support-reports':
        return <RealEstateSupportAgentView initialSubTab="reports" />;

      // =========================================================================
      // REAL ESTATE ROLE: AI PROPERTY SALES AGENT
      // =========================================================================
      case 're-ai-agent':
      case 're-ai-sales-overview':
      case 're-ai-sales-history':
        return <RealEstateAiPropertySalesAgentView initialSubTab="overview" />;
      case 're-ai-sales-conversations':
      case 're-ai-sales-handoffs':
      case 're-ai-sales-leads':
        return <RealEstateAiPropertySalesAgentView initialSubTab="conversations" />;
      case 're-ai-sales-qualification':
        return <RealEstateAiPropertySalesAgentView initialSubTab="qualification" />;
      case 're-ai-sales-recommendations':
        return <RealEstateAiPropertySalesAgentView initialSubTab="recommendations" />;
      case 're-ai-sales-knowledge':
        return <RealEstateAiPropertySalesAgentView initialSubTab="knowledge" />;
      case 're-ai-sales-config':
      case 're-ai-sales-metrics':
      case 're-ai-sales-audit':
        return <RealEstateAiPropertySalesAgentView initialSubTab="audit" />;

      // =========================================================================
      // SOFTWARE/IT ROLE: AI APPOINTMENT AGENT
      // =========================================================================
      case 'sw-ai-app-overview':
        return <SoftwareAiAppointmentAgentView key={activeTab} initialSubTab="overview" />;
      case 'sw-ai-app-reports':
        return <SoftwareAiAppointmentAgentView key={activeTab} initialSubTab="reports" />;
      case 'sw-ai-app-requests':
      case 'sw-ai-app-reschedule':
      case 'sw-ai-app-cancel':
      case 'sw-ai-app-handoffs':
        return <SoftwareAiAppointmentAgentView key={activeTab} initialSubTab="requests" />;
      case 'sw-ai-app-calendar':
      case 'sw-ai-app-demos':
      case 'sw-ai-app-consultations':
      case 'sw-ai-app-onboarding':
      case 'sw-ai-app-reminders':
        return <SoftwareAiAppointmentAgentView key={activeTab} initialSubTab="confirmed" />;
      case 'sw-ai-app-slots':
        return <SoftwareAiAppointmentAgentView key={activeTab} initialSubTab="slots" />;
      case 'sw-ai-app-config':
        return <SoftwareAiAppointmentAgentView key={activeTab} initialSubTab="config" />;

      // =========================================================================
      // SOFTWARE/IT ROLE: AI FOLLOW-UP AGENT
      // =========================================================================
      case 'sw-ai-followup-overview':
        return <SoftwareAiFollowUpAgentView key={activeTab} initialSubTab="overview" />;
      case 'sw-ai-followup-reports':
        return <SoftwareAiFollowUpAgentView key={activeTab} initialSubTab="reports" />;
      case 'sw-ai-followup-rules':
        return <SoftwareAiFollowUpAgentView key={activeTab} initialSubTab="rules" />;
      case 'sw-ai-followup-tasks':
      case 'sw-ai-followup-leads':
      case 'sw-ai-followup-demos':
      case 'sw-ai-followup-quotations':
      case 'sw-ai-followup-customers':
        return <SoftwareAiFollowUpAgentView key={activeTab} initialSubTab="tasks" />;
      case 'sw-ai-followup-drafts':
      case 'sw-ai-followup-approvals':
        return <SoftwareAiFollowUpAgentView key={activeTab} initialSubTab="drafts" />;
      case 'sw-ai-followup-executions':
      case 'sw-ai-followup-failures':
        return <SoftwareAiFollowUpAgentView key={activeTab} initialSubTab="executions" />;
      case 'sw-ai-followup-suppressions':
        return <SoftwareAiFollowUpAgentView key={activeTab} initialSubTab="suppression" />;
      case 'sw-ai-followup-config':
        return <SoftwareAiFollowUpAgentView key={activeTab} initialSubTab="config" />;

      // Real Estate Sales Manager Hub & Screens
      case 're-sales-manager-hub':
        return <RealEstateSalesManagerView initialSubTab="dashboard" />;
      case 're-properties':
        return <RealEstateSalesManagerView initialSubTab="inventory" />;
      case 're-leads':
      case 're-assign-leads':
        return <RealEstateSalesManagerView initialSubTab="leads" />;
      case 're-pipeline':
        return <RealEstateSalesManagerView initialSubTab="pipeline" />;
      case 're-team':
        return <RealEstateSalesManagerView initialSubTab="team" />;
      case 're-site-visits':
        return <RealEstateSalesManagerView initialSubTab="site-visits" />;
      case 're-quotations':
      case 're-bookings':
        return <RealEstateSalesManagerView initialSubTab="quotations" />;
      case 're-automation':
      case 're-ai-agent':
        return <RealEstateSalesManagerView initialSubTab="automation" />;
      case 're-reports':
        return <RealEstateSalesManagerView initialSubTab="dashboard" />;

      // Real Estate Property Sales Executive Hub & Screens
      case 're-executive-hub':
        return <RealEstateSalesExecutiveView initialSubTab="dashboard" />;
      case 're-my-leads':
      case 're-customer-details':
        return <RealEstateSalesExecutiveView initialSubTab="my-leads" />;
      case 're-my-pipeline':
        return <RealEstateSalesExecutiveView initialSubTab="dashboard" />;
      case 're-properties-search':
        return <RealEstateSalesExecutiveView initialSubTab="search" />;
      case 're-activities':
        return <RealEstateSalesExecutiveView initialSubTab="my-leads" />;
      case 're-my-site-visits':
        return <RealEstateSalesExecutiveView initialSubTab="visits" />;
      case 're-my-follow-ups':
        return <RealEstateSalesExecutiveView initialSubTab="follow-ups" />;
      case 're-my-quotations':
      case 're-booking-requests':
        return <RealEstateSalesExecutiveView initialSubTab="dashboard" />;

      // Real Estate Customer Relationship Manager Hub & Screens
      case 're-crm-hub':
      case 're-customer-relations':
        return <RealEstateCustomerRelationsView initialSubTab="dashboard" />;
      case 're-customers':
      case 're-customer-timeline':
      case 're-communications':
      case 're-ai-assistant':
        return <RealEstateCustomerRelationsView initialSubTab="customers" />;
      case 're-customer-requests':
      case 're-customer-follow-ups':
        return <RealEstateCustomerRelationsView initialSubTab="requests" />;
      case 're-complaints':
      case 're-escalations':
        return <RealEstateCustomerRelationsView initialSubTab="complaints" />;
      case 're-customer-feedback':
      case 're-booking-support':
      case 're-customer-reports':
        return <RealEstateCustomerRelationsView initialSubTab="feedback" />;

      // Real Estate Site Visit Coordinator Hub & Screens
      case 're-coordinator-hub':
        return <RealEstateCoordinatorView initialSubTab="dashboard" />;
      case 're-visit-calendar':
        return <RealEstateCoordinatorView initialSubTab="dashboard" />;
      case 're-assigned-visits':
      case 're-visit-assignments':
      case 're-schedule-visit':
      case 're-reschedule-requests':
      case 're-attendance':
      case 're-visit-outcomes':
        return <RealEstateCoordinatorView initialSubTab="visits" />;
      case 're-property-locations':
        return <RealEstateCoordinatorView initialSubTab="availability" />;
      case 're-visit-checklists':
        return <RealEstateCoordinatorView initialSubTab="checklist" />;
      case 're-visit-feedback':
      case 're-visit-reports':
        return <RealEstateCoordinatorView initialSubTab="dashboard" />;

      // HR Dedicated Management Hub & Modules
      case 'hr-hub':
      case 'hr':
      case 'employees':
        return <HRHub initialSubTab="employees" />;
      case 'recruitment':
      case 'ats':
        return <HRHub initialSubTab="recruitment" />;
      case 'onboarding':
        return <HRHub initialSubTab="onboarding" />;
      case 'leave':
      case 'attendance':
        return <HRHub initialSubTab="leave" />;

      // IT Software Products & Solutions Catalog (HRMS Pro, ERP, LMS) - strictly software tenant
      case 'products':
      case 'it-products':
      case 'software-products':
        if (!isSoftwareTenant) {
          if (isRealEstateTenant) return <RealEstateSalesManagerView initialSubTab="inventory" />;
          return <DashboardView />;
        }
        return <ITProductsView />;

      // Real Estate Projects & Inventory (Units, Pricing, Site Visits)
      case 'real-estate-inventory':
      case 'real-estate':
      case 'properties-inventory':
        return <RealEstateInventoryView />;

      // Education Courses & Admissions (Courses, Batches, Enquiries, Counselling)
      case 'education-admin':
      case 'education':
      case 'courses':
      case 'batches':
        return <EducationAdminView />;

      // =========================================================================
      // EDUCATION TENANT 4 ROLES: ADMISSION MGR, ADMISSION EXEC, SUPPORT, COUNSELLOR
      // =========================================================================
      // 1. Admission Manager
      case 'edu-adm-dashboard':
        return <EducationAdmissionManagerView initialSubTab="dashboard" />;
      case 'edu-adm-enquiries':
        return <EducationAdmissionManagerView initialSubTab="enquiries" />;
      case 'edu-adm-applications':
        return <EducationAdmissionManagerView initialSubTab="applications" />;
      case 'edu-adm-workload':
        return <EducationAdmissionManagerView initialSubTab="workload" />;
      case 'edu-adm-targets':
        return <EducationAdmissionManagerView initialSubTab="targets" />;
      case 'edu-adm-reports':
        return <EducationAdmissionManagerView initialSubTab="reports" />;
      case 'edu-adm-followups':
        return <EducationAdmissionManagerView initialSubTab="followups" />;
      case 'edu-adm-ai':
        return <EducationAdmissionManagerView initialSubTab="ai" />;

      // 2. Admission Executive
      case 'edu-exec-dashboard':
        return <EducationAdmissionExecutiveView initialSubTab="dashboard" />;
      case 'edu-exec-enquiries':
        return <EducationAdmissionExecutiveView initialSubTab="enquiries" />;
      case 'edu-exec-followups':
        return <EducationAdmissionExecutiveView initialSubTab="followups" />;
      case 'edu-exec-applications':
        return <EducationAdmissionExecutiveView initialSubTab="applications" />;
      case 'edu-exec-ai':
        return <EducationAdmissionExecutiveView initialSubTab="ai" />;
      case 'edu-exec-performance':
        return <EducationAdmissionExecutiveView initialSubTab="performance" />;

      // 3. Student Support Agent
      case 'edu-supp-dashboard':
        return <EducationStudentSupportView initialSubTab="dashboard" />;
      case 'edu-supp-tickets':
        return <EducationStudentSupportView initialSubTab="tickets" />;
      case 'edu-supp-complaints':
        return <EducationStudentSupportView initialSubTab="complaints" />;
      case 'edu-supp-knowledge':
        return <EducationStudentSupportView initialSubTab="knowledge" />;
      case 'edu-supp-reports':
        return <EducationStudentSupportView initialSubTab="reports" />;

      // 4. Counsellor
      case 'edu-coun-dashboard':
        return <EducationCounsellorView initialSubTab="dashboard" />;
      case 'edu-coun-students':
        return <EducationCounsellorView initialSubTab="students" />;
      case 'edu-coun-calendar':
        return <EducationCounsellorView initialSubTab="calendar" />;
      case 'edu-coun-actionplans':
        return <EducationCounsellorView initialSubTab="actionplans" />;
      case 'edu-coun-recommendations':
        return <EducationCounsellorView initialSubTab="recommendations" />;
      case 'edu-coun-ai':
        return <EducationCounsellorView initialSubTab="ai" />;

      // =========================================================================
      // 5. EDUCATION TENANT: AI ADMISSION AGENT (AUTONOMOUS CONVERSION)
      // =========================================================================
      case 'edu-ai-admission':
      case 'edu-ai-admission-overview':
        return <EducationAiAdmissionAgentView initialSubTab="overview" />;
      case 'edu-ai-admission-conversations':
      case 'edu-ai-admission-chat':
        return <EducationAiAdmissionAgentView initialSubTab="conversations" />;
      case 'edu-ai-admission-leads':
        return <EducationAiAdmissionAgentView initialSubTab="leads" />;
      case 'edu-ai-admission-recommendations':
        return <EducationAiAdmissionAgentView initialSubTab="recommendations" />;
      case 'edu-ai-admission-applications':
        return <EducationAiAdmissionAgentView initialSubTab="applications" />;
      case 'edu-ai-admission-counselling':
        return <EducationAiAdmissionAgentView initialSubTab="counselling" />;
      case 'edu-ai-admission-knowledge':
        return <EducationAiAdmissionAgentView initialSubTab="knowledge" />;
      case 'edu-ai-admission-metrics':
      case 'edu-ai-admission-audit':
        return <EducationAiAdmissionAgentView initialSubTab="metrics" />;

      // =========================================================================
      // 6. EDUCATION TENANT: AI FOLLOW-UP AGENT (NURTURE & RETENTION)
      // =========================================================================
      case 'edu-ai-followup':
      case 'edu-ai-followup-overview':
        return <EducationAiFollowUpAgentView initialSubTab="overview" />;
      case 'edu-ai-followup-rules':
        return <EducationAiFollowUpAgentView initialSubTab="rules" />;
      case 'edu-ai-followup-tasks':
        return <EducationAiFollowUpAgentView initialSubTab="tasks" />;
      case 'edu-ai-followup-drafts':
      case 'edu-ai-followup-approvals':
        return <EducationAiFollowUpAgentView initialSubTab="drafts" />;
      case 'edu-ai-followup-executions':
        return <EducationAiFollowUpAgentView initialSubTab="executions" />;
      case 'edu-ai-followup-suppression':
        return <EducationAiFollowUpAgentView initialSubTab="suppression" />;
      case 'edu-ai-followup-metrics':
      case 'edu-ai-followup-audit':
        return <EducationAiFollowUpAgentView initialSubTab="metrics" />;

      // =========================================================================
      // 7. HOSPITAL / CLINIC TENANT ROLE VIEWS
      // =========================================================================
      // Reception Manager (21 endpoints / Section 2)
      case 'hosp-reception-manager':
      case 'hosp-queue':
        return <HospitalReceptionManagerView key={activeTab} initialSubTab="dashboard" />;
      case 'hosp-staff':
      case 'hosp-assignments':
        return <HospitalReceptionManagerView key={activeTab} initialSubTab="staff" />;
      case 'hosp-enquiries':
        return <HospitalReceptionManagerView key={activeTab} initialSubTab="enquiries" />;
      case 'hosp-escalations':
        return <HospitalReceptionManagerView key={activeTab} initialSubTab="escalations" />;
      case 'hosp-ai-reception':
      case 'hosp-ai-config':
        return <HospitalReceptionManagerView key={activeTab} initialSubTab="ai-config" />;
      case 'hosp-performance':
      case 'hosp-service-metrics':
        return <HospitalReceptionManagerView key={activeTab} initialSubTab="performance" />;
      case 'hosp-audit':
        return <HospitalReceptionManagerView key={activeTab} initialSubTab="audit" />;

      // Receptionist Desk (20 endpoints / Section 3)
      case 'hosp-receptionist':
      case 'hosp-today-appointments':
      case 'hosp-checkin':
        return <HospitalReceptionistView key={activeTab} initialSubTab="appointments" />;
      case 'hosp-patient-search':
      case 'hosp-patient-register':
        return <HospitalReceptionistView key={activeTab} initialSubTab="patients" />;
      case 'hosp-walkin':
        return <HospitalReceptionistView key={activeTab} initialSubTab="queue" />;
      case 'hosp-handoffs':
      case 'hosp-tasks':
        return <HospitalReceptionistView key={activeTab} initialSubTab="tasks" />;

      // Customer Support (24 endpoints / Section 4)
      case 'hosp-customer-support':
      case 'hosp-support-inbox':
      case 'hosp-tickets-open':
      case 'hosp-tickets-assigned':
      case 'hosp-conv-web':
      case 'hosp-conv-whatsapp':
      case 'hosp-conv-email':
      case 'hosp-ai-drafts':
      case 'hosp-ai-approvals':
      case 'hosp-ai-support':
        return <HospitalCustomerSupportView key={activeTab} initialSubTab="tickets" />;
      case 'hosp-kb':
        return <HospitalCustomerSupportView key={activeTab} initialSubTab="knowledge" />;
      case 'hosp-followups':
      case 'hosp-ai-followup':
        return <HospitalCustomerSupportView key={activeTab} initialSubTab="follow-ups" />;
      case 'hosp-support-metrics':
        return <HospitalCustomerSupportView key={activeTab} initialSubTab="metrics" />;

      // Appointment Coordinator (28 endpoints / Section 5)
      case 'hosp-appointment-coordinator':
      case 'hosp-cal-day':
      case 'hosp-cal-week':
      case 'hosp-cal-month':
      case 'hosp-doctors':
      case 'hosp-departments':
      case 'hosp-availability':
        return <HospitalAppointmentCoordinatorView key={activeTab} initialSubTab="calendar" />;
      case 'hosp-new-appointment':
        return <HospitalAppointmentCoordinatorView key={activeTab} initialSubTab="appointments" />;
      case 'hosp-booking-requests':
      case 'hosp-reschedule-requests':
      case 'hosp-cancellation-requests':
        return <HospitalAppointmentCoordinatorView key={activeTab} initialSubTab="requests" />;
      case 'hosp-waiting-list':
        return <HospitalAppointmentCoordinatorView key={activeTab} initialSubTab="waiting" />;
      case 'hosp-reminders':
        return <HospitalAppointmentCoordinatorView key={activeTab} initialSubTab="reminders" />;
      case 'hosp-scheduling-metrics':
        return <HospitalAppointmentCoordinatorView key={activeTab} initialSubTab="metrics" />;

      // Doctor / Staff User Workspace (18 endpoints / Section 2)
      case 'hosp-doctor-staff':
      case 'hosp-staff-profile':
      case 'hosp-staff-schedule':
      case 'hosp-staff-availability':
      case 'hosp-staff-appointments':
      case 'hosp-staff-tasks':
      case 'hosp-staff-notifications':
      case 'hosp-staff-knowledge':
      case 'hosp-staff-activity':
        return <HospitalDoctorStaffView />;

      // AI Receptionist Management & Handoffs (20 endpoints / Section 3)
      case 'hosp-ai-receptionist':
      case 'hosp-ai-rec-conversations':
      case 'hosp-ai-rec-handoffs':
      case 'hosp-ai-rec-sources':
      case 'hosp-ai-rec-articles':
      case 'hosp-ai-rec-config':
      case 'hosp-ai-rec-analytics':
      case 'hosp-ai-rec-activity':
        return <HospitalAiReceptionistView />;

      // AI Appointment Agent Management & Engine (22 endpoints / Section 4)
      case 'hosp-ai-appointment-agent':
      case 'hosp-ai-appt-conversations':
      case 'hosp-ai-appt-bookings':
      case 'hosp-ai-appt-search':
      case 'hosp-ai-appt-reschedule':
      case 'hosp-ai-appt-cancellations':
      case 'hosp-ai-appt-waiting':
      case 'hosp-ai-appt-reminders':
      case 'hosp-ai-appt-handoffs':
      case 'hosp-ai-appt-config':
      case 'hosp-ai-appt-analytics':
      case 'hosp-ai-appt-activity':
        return <HospitalAiAppointmentAgentView />;

      // Hospital / Clinic Medical Operations (Company Admin legacy)
      case 'hospital-admin':
      case 'hospital':
      case 'clinic':
      case 'departments':
      case 'reception-queue':
        return <HospitalAdminView />;

      // E-Commerce Store Admin & Role-Specific Workspaces
      case 'ecommerce-sales-manager':
      case 'ecommerce-campaigns':
      case 'ecommerce-abandoned-carts':
      case 'ecommerce-ai-sales':
      case 'ecommerce-sales-reports':
        return <EcommerceSalesManagerView />;

      case 'ecommerce-support-manager':
      case 'ecommerce-support-agents':
      case 'ecommerce-support-queues':
      case 'ecommerce-support-escalations':
      case 'ecommerce-ai-support':
      case 'ecommerce-knowledge':
        return <EcommerceSupportManagerView />;

      case 'ecommerce-support-agent':
      case 'ecommerce-my-tickets':
      case 'ecommerce-agent-orders':
      case 'ecommerce-agent-returns':
      case 'ecommerce-ai-replies':
        return <EcommerceSupportAgentView />;

      case 'ecommerce-order-manager':
      case 'ecommerce-all-orders':
      case 'ecommerce-fulfilment-queue':
      case 'ecommerce-shipments':
      case 'ecommerce-cancellations':
      case 'ecommerce-returns':
      case 'ecommerce-refunds':
        return <EcommerceOrderManagerView />;

      // E-Commerce AI Employees (AI Sales Agent, AI Support Agent, AI Order Agent)
      case 'ecommerce-ai-sales-agent':
      case 'ecommerce-ai-sales-conversations':
      case 'ecommerce-ai-sales-leads':
      case 'ecommerce-ai-sales-recommendations':
      case 'ecommerce-ai-sales-recovery':
        return <EcommerceAiSalesAgentView />;

      case 'ecommerce-ai-support-agent':
      case 'ecommerce-ai-support-conversations':
      case 'ecommerce-ai-support-tickets':
      case 'ecommerce-ai-support-knowledge':
      case 'ecommerce-ai-support-assistance':
        return <EcommerceAiSupportAgentView />;

      case 'ecommerce-ai-order-agent':
      case 'ecommerce-ai-order-lookup':
      case 'ecommerce-ai-order-shipments':
      case 'ecommerce-ai-order-cancellations':
      case 'ecommerce-ai-order-returns':
      case 'ecommerce-ai-order-refunds':
        return <EcommerceAiOrderAgentView />;

      case 'ecommerce-admin':
      case 'ecommerce':
      case 'store-admin':
      case 'ecommerce-store':
        return <EcommerceAdminView />;

      // Hotel AI Employees (AI Reservation Agent, AI Support Agent, AI Follow-up Agent)
      case 'hotel-ai-reservation-agent':
      case 'hotel-ai-reservation-conversations':
      case 'hotel-ai-reservation-quotes':
        return <HotelAiReservationAgentView />;

      case 'hotel-ai-support-agent':
      case 'hotel-ai-support-inbox':
      case 'hotel-ai-support-knowledge':
        return <HotelAiSupportAgentView />;

      case 'hotel-ai-follow-up-agent':
      case 'hotel-ai-followup-campaigns':
      case 'hotel-ai-followup-sequences':
        return <HotelAiFollowUpAgentView />;

      // Hotel 4 Roles: Reservation Manager, Reservation Executive, Customer Support, Front Desk
      case 'hotel-reservation-manager':
      case 'hotel-rm-dashboard':
        return <HotelReservationManagerView key={activeTab} initialSubTab="dashboard" />;
      case 'hotel-rm-reservations':
      case 'hotel-rm-calendar':
        return <HotelReservationManagerView key={activeTab} initialSubTab="reservations" />;
      case 'hotel-rm-inventory':
        return <HotelReservationManagerView key={activeTab} initialSubTab="inventory" />;
      case 'hotel-rm-staff':
        return <HotelReservationManagerView key={activeTab} initialSubTab="staff" />;
      case 'hotel-rm-automation':
        return <HotelReservationManagerView key={activeTab} initialSubTab="automation" />;
      case 'hotel-rm-reports':
        return <HotelReservationManagerView key={activeTab} initialSubTab="reports" />;

      case 'hotel-reservation-executive':
      case 'hotel-re-availability':
      case 'hotel-re-reservations':
      case 'hotel-re-guests':
      case 'hotel-re-quotes':
      case 'hotel-re-enquiries':
      case 'hotel-re-followups':
        return <HotelReservationExecutiveView />;

      case 'hotel-customer-support':
      case 'hotel-cs-tickets':
      case 'hotel-cs-service':
      case 'hotel-cs-knowledge':
      case 'hotel-cs-escalations':
        return <HotelCustomerSupportView />;

      case 'hotel-front-desk':
      case 'hotel-fd-arrivals':
      case 'hotel-fd-inhouse':
      case 'hotel-fd-departures':
      case 'hotel-fd-housekeeping':
      case 'hotel-fd-moves':
        return <HotelFrontDeskView />;

      // Hotel Admin / Hospitality PMS (Properties, Room Types, Rooms, Availability, Reservations, Front Desk)
      case 'hotel-admin':
      case 'hotel':
      case 'hospitality':
      case 'pms':
      case 'reservations':
        return <HotelAdminView />;

      // Travel Company Tenant — 4 Roles Workspaces
      case 'travel-sales-manager':
      case 'travel-sm-dashboard':
      case 'travel-sm-pipeline':
        return <TravelSalesManagerView key={activeTab} initialSubTab="dashboard" />;
      case 'travel-sm-leads':
        return <TravelSalesManagerView key={activeTab} initialSubTab="leads" />;
      case 'travel-sm-consultants':
        return <TravelSalesManagerView key={activeTab} initialSubTab="consultants" />;
      case 'travel-sm-approvals':
        return <TravelSalesManagerView key={activeTab} initialSubTab="approvals" />;
      case 'travel-sm-targets':
        return <TravelSalesManagerView key={activeTab} initialSubTab="targets" />;
      case 'travel-sm-reports':
        return <TravelSalesManagerView key={activeTab} initialSubTab="reports" />;

      case 'travel-consultant':
      case 'travel-tc-dashboard':
      case 'travel-tc-requirements':
        return <TravelConsultantView key={activeTab} initialSubTab="dashboard" />;
      case 'travel-tc-leads':
        return <TravelConsultantView key={activeTab} initialSubTab="leads" />;
      case 'travel-tc-search':
        return <TravelConsultantView key={activeTab} initialSubTab="search" />;
      case 'travel-tc-itineraries':
        return <TravelConsultantView key={activeTab} initialSubTab="itineraries" />;
      case 'travel-tc-quotations':
        return <TravelConsultantView key={activeTab} initialSubTab="quotations" />;
      case 'travel-tc-handoff':
        return <TravelConsultantView key={activeTab} initialSubTab="handoff" />;

      case 'travel-customer-support':
      case 'travel-cs-dashboard':
        return <TravelCustomerSupportView key={activeTab} initialSubTab="dashboard" />;
      case 'travel-cs-conversations':
        return <TravelCustomerSupportView key={activeTab} initialSubTab="conversations" />;
      case 'travel-cs-bookings':
        return <TravelCustomerSupportView key={activeTab} initialSubTab="bookings" />;
      case 'travel-cs-tickets':
        return <TravelCustomerSupportView key={activeTab} initialSubTab="tickets" />;
      case 'travel-cs-changes':
        return <TravelCustomerSupportView key={activeTab} initialSubTab="changes" />;
      case 'travel-cs-refunds':
        return <TravelCustomerSupportView key={activeTab} initialSubTab="refunds" />;

      case 'travel-booking-executive':
      case 'travel-be-dashboard':
        return <TravelBookingExecutiveView key={activeTab} initialSubTab="dashboard" />;
      case 'travel-be-handoffs':
        return <TravelBookingExecutiveView key={activeTab} initialSubTab="handoffs" />;
      case 'travel-be-bookings':
        return <TravelBookingExecutiveView key={activeTab} initialSubTab="bookings" />;
      case 'travel-be-suppliers':
        return <TravelBookingExecutiveView key={activeTab} initialSubTab="suppliers" />;
      case 'travel-be-payments':
        return <TravelBookingExecutiveView key={activeTab} initialSubTab="payments" />;
      case 'travel-be-vouchers':
        return <TravelBookingExecutiveView key={activeTab} initialSubTab="vouchers" />;
      case 'travel-be-exceptions':
        return <TravelBookingExecutiveView key={activeTab} initialSubTab="exceptions" />;

      // Travel Company Tenant — 3 AI Agents
      case 'travel-ai-sales-agent':
      case 'travel-ai-sales-dashboard':
      case 'travel-ai-sales-leads':
      case 'travel-ai-sales-search':
      case 'travel-ai-sales-itineraries':
      case 'travel-ai-sales-quotations':
        return <TravelAiSalesAgentView />;

      case 'travel-ai-follow-up-agent':
      case 'travel-ai-followup-dashboard':
      case 'travel-ai-followup-plans':
      case 'travel-ai-followup-queue':
      case 'travel-ai-followup-drafts':
      case 'travel-ai-followup-responses':
        return <TravelAiFollowUpAgentView />;

      case 'travel-ai-booking-agent':
      case 'travel-ai-booking-dashboard':
      case 'travel-ai-booking-handoffs':
      case 'travel-ai-booking-reservations':
      case 'travel-ai-booking-payments':
      case 'travel-ai-booking-vouchers':
        return <TravelAiBookingAgentView />;

      // Travel Company Admin (Destinations, Packages, Itineraries, Enquiries, Bookings, Suppliers)
      case 'travel-admin':
      case 'travel':
      case 'travel-agency':
      case 'tours':
        return <TravelAdminView />;

      // Manufacturing Company Admin (Catalog, Technical Specs, Distributors, RFQs, Sales Orders, Support)
      case 'manufacturing-admin':
      case 'manufacturing':
      case 'manufacturing-b2b':
      case 'distributors':
        return <ManufacturingAdminView />;

      // Manufacturing Company Technical Support & AI Agents
      case 'manufacturing-technical-support':
      case 'mfg-technical-support':
        return <ManufacturingTechnicalSupportView />;
      case 'manufacturing-ai-b2b-sales':
      case 'mfg-ai-b2b-sales':
      case 'manufacturing-ai-b2b-sales-agent':
        return <ManufacturingAiB2BSalesAgentView />;
      case 'manufacturing-ai-support':
      case 'mfg-ai-support':
      case 'manufacturing-ai-support-agent':
        return <ManufacturingAiSupportAgentView />;

      // Manufacturing Company 4 Dedicated Roles
      case 'manufacturing-sales-manager':
        return <ManufacturingSalesManagerView />;
      case 'manufacturing-sales-executive':
        return <ManufacturingSalesExecutiveView />;
      case 'manufacturing-dealer-manager':
        return <ManufacturingDealerManagerView />;
      case 'manufacturing-customer-support':
        return <ManufacturingCustomerSupportView />;

      // Consulting Company Admin (Services, Consultant Roster, Discovery Calls, Proposals, Engagements, Projects)
      case 'consulting-admin':
      case 'consulting':
      case 'advisory':
      case 'engagements':
        return <ConsultingAdminView />;

      // Consulting Roles (Sales Manager, Sales Executive, Customer Support)
      case 'consulting-sales-manager':
        return <ConsultingSalesManagerView />;
      case 'consulting-sales-executive':
        return <ConsultingSalesExecutiveView />;
      case 'consulting-customer-support':
        return <ConsultingCustomerSupportView />;
      case 'consulting-relationship-manager':
        return <ConsultingRelationshipManagerView />;
      case 'consulting-ai-lead-qualification':
        return <ConsultingAiLeadQualificationView />;
      case 'consulting-ai-support':
        return <ConsultingCustomerAiSupportView />;
      case 'consulting-ai-follow-up':
        return <ConsultingCustomerAiFollowUpView />;

      // Sales Executive Dedicated Hub & Modules
      case 'sales-executive-hub':
      case 'sales-cockpit':
        return <SalesExecutiveHub initialSubTab="cockpit" />;
      case 'lead-to-sale':
        return <SalesExecutiveHub initialSubTab="lead-to-sale" />;
      case 'software-demos':
      case 'demos':
        return <SalesExecutiveHub initialSubTab="products-demos" />;
      case 'proposals':
      case 'quotations':
        return <SalesExecutiveHub initialSubTab="proposals" />;
      
      // Sales Manager Dedicated Hub & Team Management
      case 'sales-manager':
      case 'sales-manager-hub':
      case 'sales-mgmt':
        return <SalesManagerView />;

      // Support Manager & Support Agent Operations Desk
      case 'support-hub':
      case 'support-manager':
      case 'support-operations':
      case 'support-desk':
        return <SupportOperationsHub defaultRole="SUPPORT_MANAGER" />;
      case 'support-agent':
      case 'support-tickets':
      case 'my-tickets':
        return <SupportOperationsHub defaultRole="SUPPORT_AGENT" />;

      // Marketing Manager Hub & Campaigns
      case 'marketing-manager':
      case 'marketing-hub':
      case 'marketing':
      case 'campaigns':
      case 'audiences':
        return <MarketingManagerView />;

      // Analyst Hub & BI Analytics
      case 'analyst-hub':
      case 'analytics-hub':
      case 'analyst':
      case 'bi-analytics':
      case 'funnel':
        return <AnalystHubView />;

      // Autonomous AI Fleet & Follow-up Engine
      case 'ai-fleet-hub':
      case 'ai-fleet':
      case 'ai-sales-agent':
      case 'ai-support-agent':
      case 'ai-followup-hub':
      case 'ai-followup':
        return <AiAgentsHubView />;

      // 2. Company Profile
      case 'company-profile':
        return <CompanyProfileView />;
      
      // 3. Users & Roles
      case 'users-roles':
      case 'team':
        return <UsersAndRolesView />;
      
      // 4. Subscription & Billing
      case 'subscription-billing':
      case 'subscription':
        return <SubscriptionBillingView />;
      
      // 5. Leads
      case 'leads':
        return <LeadsList />;
      
      // 6. Lead Details
      case 'lead-details':
        return <LeadDetails />;
      
      // 7. Customers
      case 'customers':
        return <CustomersList />;
      
      // 8. Opportunities / Deals
      case 'opportunities':
        return <OpportunitiesView />;
      
      // 9. Tasks & Reminders
      case 'tasks':
        return <TasksView />;
      
      // 10. Calendar & Appointments
      case 'calendar':
      case 'appointments':
        return <CalendarView />;
      
      // 11. AI Employees
      case 'ai-employees':
      case 'ai-agents':
        return <AIAgentsView />;
      
      // 12. AI Agent Builder
      case 'agent-builder':
        return <AgentBuilderView />;
      
      // 13. Conversations & Omnichannel Inbox
      case 'conversations':
      case 'inbox':
        return <OmnichannelInbox />;
      
      // 14. Communication Templates
      case 'templates':
        return <CommunicationTemplatesView />;
      
      // 15. Knowledge Base & Documents & FAQ
      case 'knowledge-base':
      case 'documents':
      case 'faq':
        return <KnowledgeBaseView />;
      
      // 16. Workflow Builder & Automation Center (Sales Manager Automation)
      case 'automation-center':
      case 'workflow-builder':
      case 'automation-templates':
      case 'automation-history':
      case 'automation-analytics':
      case 'automation-settings':
      case 'followup-rules':
      case 'automation':
      case 'workflows':
      case 'automations':
        return (
          <AutomationCenter
            initialTab={
              activeTab === 'workflow-builder'
                ? 'builder'
                : activeTab === 'automation-templates'
                ? 'templates'
                : activeTab === 'automation-history'
                ? 'history'
                : activeTab === 'automation-analytics'
                ? 'analytics'
                : activeTab === 'automation-settings'
                ? 'settings'
                : 'my-automations'
            }
          />
        );
      
      // 17. Reports & Analytics
      case 'reports':
      case 'analytics':
        return <ReportsAnalyticsView />;
      
      // 18. Integrations & Company Settings
      case 'integrations':
      case 'company-settings':
      case 'settings':
        return <IntegrationsView />;

      case 'notifications':
        return <DashboardView />;
      
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className={`app-container layout-${layout}`}>
      {/* Dynamic Navigation Structure based on Layout */}
      {(layout === 'sidebar' || isSidebarOpen) && <Sidebar />}
      {layout === 'floating-dock' && <FloatingDock />}

      <div className={`main-content-wrapper wrapper-${layout}`}>
        {layout === 'topnav' ? <TopHorizonNav /> : <Header />}

        {/* Ultra Super Admin Delegated Support Access Persistent Banner */}
        {impersonationSession?.isActive && (
          <div
            style={{
              background: 'linear-gradient(90deg, #9a3412 0%, #d97706 50%, #b45309 100%)',
              color: '#ffffff',
              padding: '10px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.85rem',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
              position: 'sticky',
              top: 0,
              zIndex: 100,
              borderBottom: '2px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>
                🛡️ AUDITED DELEGATED ACCESS
              </span>
              <span>Workspace: <strong>{impersonationSession.tenantName}</strong></span>
              <span style={{ opacity: 0.85, fontSize: '0.8rem' }}>
                • Mode: <strong>{impersonationSession.accessMode}</strong> • Reason: {impersonationSession.reason}
              </span>
            </div>

            <button
              onClick={terminateDelegatedAccess}
              style={{
                backgroundColor: '#ffffff',
                color: '#9a3412',
                border: 'none',
                borderRadius: '6px',
                padding: '5px 14px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
              }}
            >
              <span>Exit to Platform Command Center</span>
            </button>
          </div>
        )}

        <main className="page-content" key={activeTab}>
          <ErrorBoundary key={activeTab}>
            {renderActiveView()}
          </ErrorBoundary>
        </main>
      </div>

      {/* Global Overlays */}
      <NotificationsDrawer />
      <ModalsContainer />
      {isEducationTenant && <EducationStudentChatWidget />}
    </div>
  );
}
