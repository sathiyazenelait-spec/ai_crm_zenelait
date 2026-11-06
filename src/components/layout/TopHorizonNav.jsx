import React, { useState, useRef, useEffect } from 'react';
import { useCRM } from '../../context/CRMContext';
import { useTheme } from '../../context/ThemeContext';
import { TenantSelector } from '../common/TenantSelector';
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
  Search,
  Bell,
  Sun,
  Moon,
  Palette,
  LayoutGrid,
  ChevronDown,
  Sparkles,
  Check,
  User,
  Plus,
  GitFork,
  Crown,
  LogOut
} from 'lucide-react';

export function TopHorizonNav() {
  const {
    activeTab,
    navigateTo,
    searchQuery,
    setSearchQuery,
    unreadNotifCount,
    setIsNotifDrawerOpen,
    setActiveModal,
    currentIndustry,
    isPlatformView,
    setIsPlatformView,
    currentUserRole,
    setCurrentUserRole,
    platformRoles,
    logout,
    currentRolePermissions
  } = useCRM();

  const { theme, setTheme, layout, setLayout, mode, toggleMode, THEMES, LAYOUTS } = useTheme();

  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const themeMenuRef = useRef(null);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target)) {
        setIsThemeOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isSoftwareTenant = currentIndustry?.id === 'software' || currentIndustry?.id === 'software_it' || currentIndustry?.id === 'it_software';
  const isRealEstateTenant = currentIndustry?.id === 'real_estate';
  const isEducationTenant = currentIndustry?.id === 'education' || currentIndustry?.id === 'education_training';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ...(isEducationTenant ? [
      { id: 'edu-ai-admission', label: 'AI Admission Agent', icon: Bot, badge: 'AI' },
      { id: 'edu-ai-followup', label: 'AI Follow-up Agent', icon: Zap, badge: 'AI' },
      { id: 'edu-adm-enquiries', label: 'Admission Enquiries', icon: Users },
      { id: 'edu-adm-applications', label: 'Applications', icon: BookOpen }
    ] : []),
    ...(isRealEstateTenant ? [
      { id: 're-properties', label: 'Properties & Inventory', icon: Briefcase },
      { id: 're-leads', label: 'Property Leads', icon: Users },
      { id: 're-pipeline', label: 'Property Pipeline', icon: GitFork },
      { id: 're-site-visits', label: 'Site Visits', icon: Calendar },
      { id: 're-customers', label: 'Customer Relations', icon: Users }
    ] : []),
    ...(isSoftwareTenant ? [
      { id: 'sales-executive-hub', label: 'Sales Hub', icon: Zap, badge: 'Pro' },
      { id: 'lead-to-sale', label: 'Lead to Sale', icon: Sparkles },
      { id: 'it-products', label: 'IT Software Products', icon: Briefcase }
    ] : []),
    { id: 'workflows', label: 'Workflows & Pipeline', icon: GitFork, badge: 'Live' },
    { id: 'leads', label: isRealEstateTenant ? 'Property Leads' : currentIndustry.id === 'hospitals' ? 'Patients' : 'Leads', icon: Users },
    { id: 'customers', label: 'Customers', icon: Briefcase },
    { id: 'conversations', label: 'Conversations', icon: MessageSquare, badge: '12' },
    { id: 'ai-agents', label: 'AI Employees', icon: Bot },
    { id: 'automation', label: 'Automation', icon: Zap },
    { id: 'appointments', label: isRealEstateTenant ? 'Site Visits' : currentIndustry.id === 'hospitals' ? 'OPD Slots' : 'Appointments', icon: Calendar },
    { id: 'knowledge-base', label: 'Knowledge Base', icon: BookOpen },
    { id: 'hr-hub', label: 'HR Hub', icon: Users2, badge: 'HR' },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'team', label: 'Team & Roles', icon: Users2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="top-horizon-header">
      {/* Top Primary Bar */}
      <div className="top-horizon-main-bar" style={{ gap: '14px' }}>
        {/* Brand */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          onClick={() => {
            setIsPlatformView(false);
            navigateTo('dashboard');
          }}
        >
          <div className="brand-icon-box" style={{ backgroundColor: currentIndustry.color }}>
            <BotMessageSquare size={18} />
          </div>
          <span className="brand-name">Zenelait AI</span>
        </div>

        {/* Tenant Selector Dropdown */}
        <TenantSelector />

        {/* Search */}
        <div className="search-bar-wrapper" style={{ flex: 1, maxWidth: '360px' }}>
          <Search size={15} />
          <input
            type="text"
            className="search-bar-input"
            placeholder={`Search ${currentIndustry.shortName}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Header Right Actions */}
        <div className="header-actions">
          {/* Quick Lead Button */}
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setActiveModal('addLead')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={14} />
            <span>New Lead</span>
          </button>

          {/* Theme & Layout Switcher */}
          <div className="theme-dropdown-container" ref={themeMenuRef}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setIsThemeOpen(!isThemeOpen)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Theme & Layout"
            >
              <Palette size={15} style={{ color: 'var(--primary)' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Theme</span>
              <ChevronDown size={13} />
            </button>

            {isThemeOpen && (
              <div className="theme-menu-popover" style={{ width: 270 }}>
                <div style={{ padding: '6px 8px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  Theme & Paired Layout
                </div>
                {THEMES.map((th) => (
                  <button
                    key={th.id}
                    className={`theme-opt-btn ${theme === th.id ? 'active' : ''}`}
                    onClick={() => {
                      setTheme(th.id, true);
                      setIsThemeOpen(false);
                    }}
                  >
                    <span className="color-dot" style={{ background: th.previewColor }} />
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <div style={{ fontWeight: 600 }}>{th.name}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{th.layoutName}</div>
                    </div>
                    {theme === th.id && <Check size={14} style={{ color: 'var(--primary)' }} />}
                  </button>
                ))}

                <div style={{ padding: '8px 8px 4px', borderTop: '1px solid var(--border)', marginTop: '4px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  Select Layout Independently
                </div>
                {LAYOUTS.map((lay) => (
                  <button
                    key={lay.id}
                    className={`theme-opt-btn ${layout === lay.id ? 'active' : ''}`}
                    onClick={() => {
                      setLayout(lay.id);
                      setIsThemeOpen(false);
                    }}
                  >
                    <LayoutGrid size={14} style={{ color: 'var(--primary)' }} />
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: layout === lay.id ? 600 : 500 }}>{lay.name}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{lay.desc}</div>
                    </div>
                    {layout === lay.id && <Check size={14} style={{ color: 'var(--primary)' }} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mode toggle */}
          <button
            className="btn btn-secondary btn-icon btn-sm"
            onClick={toggleMode}
            title={`Switch to ${mode === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {mode === 'dark' ? <Sun size={16} style={{ color: '#f59e0b' }} /> : <Moon size={16} />}
          </button>

          {/* Notification bell */}
          <button
            className="btn btn-secondary btn-icon btn-sm"
            style={{ position: 'relative' }}
            onClick={() => setIsNotifDrawerOpen(true)}
          >
            <Bell size={16} />
            {unreadNotifCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  backgroundColor: '#ef4444',
                  color: '#fff',
                  fontSize: '0.62rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid var(--bg-card)'
                }}
              >
                {unreadNotifCount}
              </span>
            )}
          </button>

          {/* User profile */}
          <div style={{ position: 'relative' }} ref={profileMenuRef}>
            <div
              className="user-profile-btn"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              style={{ cursor: 'pointer' }}
            >
              <div className="avatar avatar-sm" style={{ backgroundColor: currentIndustry.color, color: '#fff' }}>
                {currentUserRole.substring(0, 2).toUpperCase()}
              </div>
              <div className="user-profile-info">
                <span className="user-profile-name">{currentUserRole}</span>
              </div>
              <ChevronDown size={13} style={{ color: 'var(--text-muted)' }} />
            </div>

            {isProfileOpen && (
              <div className="theme-menu-popover" style={{ width: 220 }}>
                <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)', marginBottom: '4px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{currentUserRole}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{currentIndustry.name}</div>
                </div>
                {(currentRolePermissions?.isSuperAdmin || currentRolePermissions?.canManagePlatform || currentUserRole?.includes('Super Admin')) && (
                  <button
                    className="theme-opt-btn"
                    onClick={() => {
                      setIsPlatformView(!isPlatformView);
                      setIsProfileOpen(false);
                    }}
                  >
                    <Crown size={14} /> {isPlatformView ? 'Back to Tenant' : 'Platform Super Admin'}
                  </button>
                )}
                <button
                  className="theme-opt-btn"
                  onClick={() => {
                    navigateTo('settings');
                    setIsProfileOpen(false);
                  }}
                >
                  <User size={14} /> Workspace Settings
                </button>
                <button
                  className="theme-opt-btn"
                  style={{ color: '#ef4444', fontWeight: 600, borderTop: '1px solid var(--border)', marginTop: '4px', paddingTop: '8px' }}
                  onClick={() => {
                    setIsProfileOpen(false);
                    logout();
                  }}
                >
                  <LogOut size={14} style={{ color: '#ef4444' }} /> Log Out Securely
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Secondary Horizontal Navigation Bar */}
      <div className="top-horizon-subnav-bar">
        <nav className="top-horizon-nav-links">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = !isPlatformView && (activeTab === item.id || (item.id === 'leads' && activeTab === 'lead-details'));

            return (
              <div
                key={item.id}
                className={`top-horizon-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setIsPlatformView(false);
                  navigateTo(item.id);
                }}
              >
                <Icon size={16} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className="nav-count-badge"
                    style={{
                      backgroundColor: item.badge === 'Live' ? currentIndustry.color : undefined
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
