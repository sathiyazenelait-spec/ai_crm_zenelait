import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  MessageSquare,
  Bot,
  Zap,
  Calendar,
  BookOpen,
  BarChart3,
  Users2,
  Settings,
  BotMessageSquare,
  Sparkles,
  GitFork,
  Crown,
  Building2,
  GraduationCap,
  HeartPulse,
  ShoppingBag,
  BedDouble,
  Plane,
  Factory,
  Layers,
  Headphones,
  Megaphone,
  PhoneCall,
  Mail,
  Database
} from 'lucide-react';

export function FloatingDock() {
  const { activeTab, navigateTo, currentIndustry, isPlatformView, setIsPlatformView, currentRolePermissions } = useCRM();
  const [hoveredTab, setHoveredTab] = useState(null);

  const isSuperAdmin = currentRolePermissions?.isSuperAdmin;
  const isCompanyAdmin = currentRolePermissions?.isCompanyAdmin;
  const isSalesManager = currentRolePermissions?.isSalesManager;
  const isSupportManager = currentRolePermissions?.isSupportManager;
  const isSalesRepresentative = currentRolePermissions?.isSalesRepresentative;
  const isSupportAgent = currentRolePermissions?.isSupportAgent;
  const isAnalyst = currentRolePermissions?.isAnalyst;

  const isSoftwareTenant = currentIndustry?.id === 'software' || currentIndustry?.id === 'software_it' || currentIndustry?.id === 'it_software';
  const isRealEstateTenant = currentIndustry?.id === 'real_estate';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ...(isRealEstateTenant ? [
      { id: 're-properties', label: 'Properties & Inventory', icon: Building2 },
      { id: 're-leads', label: 'Property Leads', icon: Users },
      { id: 're-pipeline', label: 'Property Pipeline', icon: Target },
      { id: 're-site-visits', label: 'Site Visits', icon: Calendar },
      { id: 're-customers', label: 'Customer Relations', icon: Users }
    ] : [
      currentIndustry.id === 'education'
        ? { id: 'education-admin', label: 'Courses & Admissions', icon: GraduationCap }
        : currentIndustry.id === 'hospitals'
        ? { id: 'hospital-admin', label: 'Clinical Ops & Appointments', icon: HeartPulse }
        : currentIndustry.id === 'ecommerce'
        ? { id: 'ecommerce-admin', label: 'Store & Inventory', icon: ShoppingBag }
        : currentIndustry.id === 'hospitality'
        ? { id: 'hotel-admin', label: 'Hotel PMS & Rooms', icon: BedDouble }
        : currentIndustry.id === 'travel'
        ? { id: 'travel-admin', label: 'Tours & Packages', icon: Plane }
        : currentIndustry.id === 'manufacturing_b2b' || currentIndustry.id === 'manufacturing'
        ? { id: 'manufacturing-admin', label: 'Products & B2B Orders', icon: Factory }
        : currentIndustry.id === 'consulting' || currentIndustry.id === 'financial_services'
        ? { id: 'consulting-admin', label: 'Services & Advisory', icon: Briefcase }
        : isSoftwareTenant
        ? { id: 'it-products', label: 'IT Software Products', icon: Layers }
        : null
    ].filter(Boolean)),
    ...(isSoftwareTenant ? [
      { id: 'sales-manager-hub', label: 'Sales Manager Hub', icon: Briefcase },
      { id: 'sales-executive-hub', label: 'Sales Hub', icon: Zap },
      { id: 'lead-to-sale', label: 'Lead to Sale', icon: Sparkles }
    ] : []),
    { id: 'marketing-hub', label: 'Marketing Hub', icon: Megaphone },
    { id: 'support-hub', label: 'Support Ops Hub', icon: Headphones },
    { id: 'ai-fleet-hub', label: 'AI Fleet & Follow-up', icon: Sparkles },
    ...((currentIndustry?.id === 'education' || currentIndustry?.id === 'education_training') ? [
      { id: 'edu-ai-admission', label: 'AI Admission Agent', icon: Bot },
      { id: 'edu-ai-followup', label: 'AI Follow-up Agent', icon: Clock }
    ] : []),
    { id: 'workflows', label: 'Workflow & Pipeline', icon: GitFork, badge: 'Live' },
    { id: 'leads', label: isRealEstateTenant ? 'Property Leads' : currentIndustry.id === 'hospitals' ? 'Patients' : 'Leads', icon: Users },
    { id: 'customers', label: 'Customers', icon: Briefcase },
    { id: 'conversations', label: 'Conversations', icon: MessageSquare, badge: '12' },
    { id: 'ai-agents', label: 'AI Employees', icon: Bot },
    { id: 'voice-agent', label: 'Voice AI SDR', icon: PhoneCall },
    { id: 'whatsapp-hub', label: 'WhatsApp Hub', icon: MessageSquare },
    { id: 'email-copilot', label: 'Email Copilot', icon: Mail },
    { id: 'vector-rag', label: 'Vector RAG Hub', icon: Database },
    { id: 'automation', label: 'Automation', icon: Zap },
    { id: 'appointments', label: isRealEstateTenant ? 'Site Visits' : currentIndustry.id === 'hospitals' ? 'OPD Slots' : 'Appointments', icon: Calendar },
    { id: 'knowledge-base', label: 'Knowledge Base', icon: BookOpen },
    { id: 'analyst-hub', label: 'BI Analytics', icon: BarChart3 },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'team', label: 'Team & Roles', icon: Users2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const visibleDockItems = navItems.filter((item) => {
    if (item.id === 'settings' || item.id === 'team') {
      return isCompanyAdmin || isSuperAdmin;
    }
    if (item.id === 'sales-manager-hub') {
      return isCompanyAdmin || isSuperAdmin || isSalesManager;
    }
    if (item.id === 'marketing-hub') {
      return isCompanyAdmin || isSuperAdmin || currentRolePermissions?.isMarketingManager;
    }
    if (item.id === 'support-hub') {
      return isCompanyAdmin || isSuperAdmin || isSupportManager || isSupportAgent;
    }
    if (item.id === 'analyst-hub') {
      return isCompanyAdmin || isSuperAdmin || isAnalyst;
    }
    if (item.id === 'workflows' || item.id === 'automation') {
      return isCompanyAdmin || isSuperAdmin || isSalesManager;
    }
    if (item.id === 'leads') {
      return !isSupportAgent;
    }
    if (item.id === 'reports') {
      return isCompanyAdmin || isSuperAdmin || isSalesManager || isSalesRepresentative || isAnalyst;
    }
    if (item.id === 'ai-agents' || item.id === 'ai-fleet-hub') {
      return !isSalesRepresentative && !isAnalyst;
    }
    return true;
  });

  return (
    <aside className="floating-glass-dock">
      {/* Brand Icon Capsule */}
      <div
        className="dock-brand-icon"
        style={{ backgroundColor: currentIndustry.color }}
        onClick={() => {
          setIsPlatformView(false);
          navigateTo('dashboard');
        }}
        title="Zenelait AI Multi-Tenant CRM"
      >
        <BotMessageSquare size={22} />
      </div>

      <div className="dock-separator" />

      {/* Nav items */}
      <div className="dock-nav-items">
        {visibleDockItems.map((item) => {
          const Icon = item.icon;
          const isActive = !isPlatformView && (activeTab === item.id || (item.id === 'leads' && activeTab === 'lead-details'));

          return (
            <div
              key={item.id}
              className={`dock-item ${isActive ? 'active' : ''}`}
              onClick={() => {
                setIsPlatformView(false);
                navigateTo(item.id);
              }}
              onMouseEnter={() => setHoveredTab(item.id)}
              onMouseLeave={() => setHoveredTab(null)}
            >
              <Icon size={19} />
              {item.badge && <span className="dock-badge-dot" style={{ backgroundColor: currentIndustry.color }} />}

              {/* Floating Tooltip Pill */}
              {hoveredTab === item.id && (
                <div className="dock-tooltip">
                  <span>{item.label}</span>
                  {item.badge && <span className="nav-count-badge" style={{ marginLeft: 6 }}>{item.badge}</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="dock-separator" />

      {/* Quick Platform Super Admin Trigger */}
      {(currentRolePermissions?.isSuperAdmin || currentRolePermissions?.canManagePlatform) && (
        <div
          className={`dock-item ${isPlatformView ? 'active' : ''}`}
          onClick={() => setIsPlatformView(!isPlatformView)}
          style={{ color: '#8b5cf6', marginTop: 'auto' }}
          title="Zenelait Platform Super Admin"
        >
          <Crown size={18} />
        </div>
      )}
    </aside>
  );
}
