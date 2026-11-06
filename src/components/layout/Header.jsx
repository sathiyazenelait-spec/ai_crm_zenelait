import React, { useState, useRef, useEffect } from 'react';
import { useCRM } from '../../context/CRMContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  Building2,
  Check,
  User,
  Shield,
  CreditCard,
  Crown,
  Palette,
  LayoutGrid,
  Globe,
  LogOut
} from 'lucide-react';

export function Header() {
  const {
    searchQuery,
    setSearchQuery,
    isSidebarOpen,
    setIsSidebarOpen,
    unreadNotifCount,
    setIsNotifDrawerOpen,
    navigateTo,
    companyProfile,
    currentUserName,
    currentUserRole,
    tenants,
    switchTenant,
    industryPresets,
    activeIndustryId,
    switchIndustry,
    switchRole,
    logout,
    setViewMode,
    currentRolePermissions,
    isPlatformView,
    isAiFleetAutonomousActive,
    stopAiFleetExecution,
    resumeAiFleetExecution
  } = useCRM();

  const isUltraSuperAdmin = currentRolePermissions?.isUltraSuperAdmin || currentUserRole === 'Ultra Super Admin' || currentUserRole?.includes('God') || currentUserRole?.toLowerCase().includes('ultra');

  const { theme, setTheme, layout, setLayout, mode, toggleMode, THEMES, LAYOUTS } = useTheme();
  const [isTenantOpen, setIsTenantOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const tenantMenuRef = useRef(null);
  const profileMenuRef = useRef(null);
  const themeMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (tenantMenuRef.current && !tenantMenuRef.current.contains(event.target)) {
        setIsTenantOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target)) {
        setIsThemeOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="top-header" style={{ gap: '16px' }}>
      {/* Left Section: Menu Toggle & Tenant Dropdown Pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          className="btn btn-ghost btn-icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          title="Toggle Navigation"
        >
          <Menu size={20} />
        </button>

        {/* Tenant Selector Pill */}
        <div style={{ position: 'relative' }} ref={tenantMenuRef}>
          <div
            className="header-tenant-pill"
            onClick={() => setIsTenantOpen(!isTenantOpen)}
            title={
              (currentRolePermissions?.canManageAllCompanies || currentUserRole?.includes('Super Admin') || currentUserRole?.includes('Ultra'))
                ? 'Super Admin Multi-Tenant Switcher'
                : 'My Company Workspace Hub'
            }
          >
            <div
              className="tenant-mini-icon"
              style={{
                backgroundColor: (isUltraSuperAdmin && isPlatformView)
                  ? 'rgba(217, 119, 6, 0.2)'
                  : (companyProfile.color ? `${companyProfile.color}22` : 'rgba(37, 99, 235, 0.15)'),
                color: (isUltraSuperAdmin && isPlatformView)
                  ? '#d97706'
                  : (companyProfile.color || '#2563eb')
              }}
            >
              {(isUltraSuperAdmin && isPlatformView) ? (
                <Crown size={15} style={{ color: '#d97706' }} />
              ) : (
                <Building2 size={15} style={{ color: companyProfile.color || '#2563eb' }} />
              )}
            </div>
            <span className="tenant-pill-name">
              {(isUltraSuperAdmin && isPlatformView) ? 'Zenelait AI Platform Root' : companyProfile.name}
            </span>
            <ChevronDown size={14} style={{ color: '#64748b' }} />
            <div className="tenant-pill-divider" />
            <span className="tenant-pill-industry">
              {(isUltraSuperAdmin && isPlatformView) ? 'Universal SaaS Platform' : companyProfile.industry}
            </span>
          </div>

          {isTenantOpen && (
            (currentRolePermissions?.canManageAllCompanies || currentUserRole?.includes('Super Admin') || currentUserRole?.includes('Ultra')) ? (
              // SUPER ADMIN: Multi-Tenant Switcher (All 9 Industry Verticals)
              <div className="theme-menu-popover" style={{ width: 295, top: 'calc(100% + 6px)' }}>
                <div style={{ padding: '6px 10px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Universal Workspaces Hub</span>
                  <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>9 Tenants</span>
                </div>
                <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                  {tenants.map((t) => (
                    <button
                      key={t.id}
                      className={`theme-opt-btn ${companyProfile.name === t.name ? 'active' : ''}`}
                      onClick={() => {
                        switchTenant(t.id);
                        setIsTenantOpen(false);
                      }}
                    >
                      <div
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: '6px',
                          backgroundColor: t.color || '#3b82f6',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          flexShrink: 0
                        }}
                      >
                        {t.logoLetter || t.name.substring(0, 2)}
                      </div>
                      <div style={{ flex: 1, textAlign: 'left' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{t.name}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{industryPresets[t.industryId]?.shortName}</div>
                      </div>
                      {companyProfile.name === t.name && <Check size={14} style={{ color: 'var(--primary)' }} />}
                    </button>
                  ))}
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '6px', paddingTop: '6px' }}>
                  <button
                    className="theme-opt-btn"
                    onClick={() => {
                      navigateTo('tenants');
                      setIsTenantOpen(false);
                    }}
                    style={{ color: '#8b5cf6', fontWeight: 600 }}
                  >
                    <Crown size={14} style={{ color: '#8b5cf6' }} />
                    <span>View All 9 Tenants Hub →</span>
                  </button>
                </div>
              </div>
            ) : (
              // COMPANY ADMIN & USERS: Scoped Strictly to Their Own Tenant Only
              <div className="theme-menu-popover" style={{ width: 310, top: 'calc(100% + 6px)', padding: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '8px',
                      backgroundColor: companyProfile.color || '#2563eb',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      flexShrink: 0
                    }}
                  >
                    {companyProfile.logoLetter || (companyProfile.name ? companyProfile.name.substring(0, 2).toUpperCase() : 'CO')}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {companyProfile.name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                      {companyProfile.industry}
                    </div>
                  </div>
                  <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>
                    {companyProfile.plan || 'Enterprise'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', backgroundColor: 'var(--bg-surface)', padding: '8px', borderRadius: '6px', marginBottom: '10px', border: '1px solid var(--border)' }}>
                  <div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block' }}>Seats Quota</span>
                    <strong style={{ fontSize: '0.78rem', color: 'var(--text-main)' }}>{companyProfile.totalUsers || 25} Users</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block' }}>Active AI Fleet</span>
                    <strong style={{ fontSize: '0.78rem', color: '#10b981' }}>{companyProfile.activeAiAgents || 3} Agents</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <button
                    className="theme-opt-btn"
                    onClick={() => {
                      navigateTo('company-profile');
                      setIsTenantOpen(false);
                    }}
                    style={{ fontSize: '0.78rem' }}
                  >
                    <Building2 size={13} />
                    <span>Workspace Settings & Branding</span>
                  </button>
                  <button
                    className="theme-opt-btn"
                    onClick={() => {
                      navigateTo('users-roles');
                      setIsTenantOpen(false);
                    }}
                    style={{ fontSize: '0.78rem' }}
                  >
                    <User size={13} />
                    <span>Team Members & Roles</span>
                  </button>
                  <button
                    className="theme-opt-btn"
                    onClick={() => {
                      navigateTo('subscription-billing');
                      setIsTenantOpen(false);
                    }}
                    style={{ fontSize: '0.78rem' }}
                  >
                    <CreditCard size={13} />
                    <span>Subscription & Quotas</span>
                  </button>
                </div>

                <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                  <Shield size={12} style={{ color: '#10b981' }} />
                  <span>Tenant Isolation Active: Private Workspace</span>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Middle: Search Input */}
      <div className="search-bar-wrapper" style={{ flex: 1, maxWidth: '460px' }}>
        <Search size={15} />
        <input
          type="text"
          className="search-bar-input"
          placeholder="Search leads, customers, conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Right: Theme Picker, Mode Toggle, Notifications & Profile */}
      <div className="header-actions" style={{ gap: '10px' }}>
        {/* Public Website Preview Button */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setViewMode('public')}
          title="View Public Landing Page"
          style={{ fontSize: '0.75rem', fontWeight: 600, padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          <Globe size={14} style={{ color: 'var(--primary)' }} />
          <span>Public Site</span>
        </button>

        {/* Palette Theme & Layout Selector */}
        <div style={{ position: 'relative' }} ref={themeMenuRef}>
          <button
            className="btn btn-secondary btn-icon btn-sm"
            onClick={() => setIsThemeOpen(!isThemeOpen)}
            title="Customize Theme & Layout"
          >
            <Palette size={16} />
          </button>

          {isThemeOpen && (
            <div className="theme-menu-popover" style={{ width: 250, top: 'calc(100% + 8px)' }}>
              <div style={{ padding: '6px 10px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Color Palette Theme
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
                    <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>{th.name}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{th.badge}</div>
                  </div>
                  {theme === th.id && <Check size={14} style={{ color: 'var(--primary)' }} />}
                </button>
              ))}

              <div style={{ padding: '8px 10px 4px', borderTop: '1px solid var(--border)', marginTop: '4px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Layout Mode
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
                    <div style={{ fontSize: '0.8rem', fontWeight: layout === lay.id ? 700 : 500 }}>{lay.name}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{lay.desc}</div>
                  </div>
                  {layout === lay.id && <Check size={14} style={{ color: 'var(--primary)' }} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 200% Autonomous AI Fleet Master Status & Admin Kill-Switch */}
        {isAiFleetAutonomousActive ? (
          <button
            onClick={stopAiFleetExecution}
            title="Admin Emergency Kill-Switch: Click to STOP 200% Autonomous AI Fleet"
            className="btn btn-xs"
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              color: '#10b981',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '999px',
              padding: '4px 10px',
              fontSize: '0.72rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 6px #10b981' }} />
            <span>⚡ AI Fleet: 200% Auto</span>
            <span style={{ color: '#ef4444', marginLeft: '2px', padding: '1px 5px', background: 'rgba(239, 68, 68, 0.15)', borderRadius: '4px', fontSize: '0.65rem' }}>⏹ Stop</span>
          </button>
        ) : (
          <button
            onClick={resumeAiFleetExecution}
            title="Admin Control: Click to RESUME 200% Autonomous AI Fleet"
            className="btn btn-xs"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '999px',
              padding: '4px 10px',
              fontSize: '0.72rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#ef4444' }} />
            <span>🛑 AI Fleet: Paused</span>
            <span style={{ color: '#10b981', marginLeft: '2px', padding: '1px 5px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '4px', fontSize: '0.65rem' }}>▶ Resume</span>
          </button>
        )}

        {/* Light/Dark Toggle */}
        <button
          className="btn btn-secondary btn-icon btn-sm"
          onClick={toggleMode}
          title={`Switch to ${mode === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {mode === 'dark' ? <Sun size={16} style={{ color: '#f59e0b' }} /> : <Moon size={16} />}
        </button>

        {/* Notifications Bell with Red Badge */}
        <button
          className="btn btn-secondary btn-icon btn-sm"
          style={{ position: 'relative' }}
          onClick={() => setIsNotifDrawerOpen(true)}
          title="Notifications"
        >
          <Bell size={17} />
          <span className="notif-badge-pill">3</span>
        </button>

        {/* Active Role Pill Indicator */}
        <div
          className="badge"
          onClick={currentRolePermissions?.canSwitchRoles ? () => setIsProfileOpen(!isProfileOpen) : undefined}
          style={{
            cursor: currentRolePermissions?.canSwitchRoles ? 'pointer' : 'default',
            backgroundColor: currentUserRole.includes('Super Admin') ? 'rgba(139, 92, 246, 0.15)' :
              currentUserRole.includes('Manager') ? 'rgba(2, 132, 199, 0.15)' :
              currentUserRole.includes('Support') ? 'rgba(16, 185, 129, 0.15)' :
              currentUserRole.includes('Analyst') || currentUserRole.includes('Viewer') ? 'rgba(100, 116, 139, 0.15)' :
              'rgba(37, 99, 235, 0.15)',
            color: currentUserRole.includes('Super Admin') ? '#8b5cf6' :
              currentUserRole.includes('Manager') ? '#0284c7' :
              currentUserRole.includes('Support') ? '#10b981' :
              currentUserRole.includes('Analyst') || currentUserRole.includes('Viewer') ? '#64748b' :
              '#2563eb',
            border: '1px solid currentColor',
            fontSize: '0.72rem',
            padding: '4px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontWeight: 700
          }}
          title={currentRolePermissions?.canSwitchRoles ? "Click to Switch Role Persona (Admin)" : `Assigned Role: ${currentUserRole}`}
        >
          <Shield size={12} />
          <span>Role: {currentUserRole}</span>
          {currentRolePermissions?.canSwitchRoles && <ChevronDown size={11} />}
        </div>

        {/* User Profile Pill */}
        <div style={{ position: 'relative' }} ref={profileMenuRef}>
          <div
            className="user-profile-btn"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            style={{ cursor: 'pointer' }}
          >
            <div className="header-user-avatar">
              {currentUserName ? currentUserName[0].toUpperCase() : 'U'}
            </div>
            <div className="user-profile-info">
              <span className="user-profile-name">{currentUserName || 'User'}</span>
              <span className="user-profile-role">{currentUserRole || 'Sales Manager'}</span>
            </div>
            <ChevronDown size={13} style={{ color: 'var(--text-muted)' }} />
          </div>

          {isProfileOpen && (
            <div className="theme-menu-popover" style={{ width: 320, right: 0, maxHeight: '85vh', overflowY: 'auto' }}>
              <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)', marginBottom: '4px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{currentUserName || 'User'}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  Active Persona: <strong style={{ color: 'var(--primary)' }}>{currentUserRole}</strong>
                </div>
              </div>

              {/* Only show role switcher options to Admin */}
              {currentRolePermissions?.canSwitchRoles ? (
                <>
                  {/* Ultra Super Admin & MVP Roles Section */}
                  <div style={{ padding: '6px 10px 2px', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    👑 Demo Role Switcher (Admin Only)
                  </div>
                  <div style={{ marginBottom: '6px' }}>
                    {[
                      { name: 'Ultra Super Admin', desc: '👑 Supreme God-Mode Master (All 9 Companies)', color: '#d97706', isGodMode: true },
                      { name: 'Platform Super Admin', desc: 'SaaS root infra & subscription engine', color: '#8b5cf6' },
                      { name: 'Company Owner / Company Admin', desc: 'Full workspace & AI setup', color: '#2563eb' },
                      { name: 'Sales Manager', desc: 'Pipeline, reps monitor & lead assignment', color: '#0284c7' },
                      { name: 'Sales Executive', desc: 'Assigned leads, IT demos, quotes & closing', color: '#06b6d4' },
                      { name: 'Support Manager', desc: 'SLA control, triage queue & escalations', color: '#f59e0b' },
                      { name: 'Customer Support Agent', desc: 'Omnichannel tickets & AI takeover', color: '#10b981' },
                      { name: 'Marketing Manager', desc: 'Campaign attribution, CPL/ROAS & AI drip', color: '#ec4899' },
                      { name: 'HR Role', desc: 'Employee directory, ATS, onboarding & leave', color: '#a855f7' },
                      { name: 'Analyst / Viewer', desc: 'Read-only dashboards & BI exports', color: '#64748b' }
                    ].map((mvpRole) => (
                      <button
                        key={mvpRole.name}
                        className={`theme-opt-btn ${currentUserRole === mvpRole.name ? 'active' : ''}`}
                        style={{
                          padding: '6px 10px',
                          fontSize: '0.76rem',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '8px',
                          backgroundColor: mvpRole.isGodMode && currentUserRole === mvpRole.name ? 'rgba(217, 119, 6, 0.12)' : undefined
                        }}
                        onClick={() => {
                          switchRole(mvpRole.name);
                          setIsProfileOpen(false);
                        }}
                      >
                        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: mvpRole.color, marginTop: '4px', flexShrink: 0 }} />
                        <div style={{ flex: 1, textAlign: 'left' }}>
                          <div style={{ fontWeight: currentUserRole === mvpRole.name ? 700 : 600, color: mvpRole.isGodMode ? '#d97706' : 'var(--text-main)' }}>
                            {mvpRole.name}
                          </div>
                          <div style={{ fontSize: '0.67rem', color: 'var(--text-muted)' }}>{mvpRole.desc}</div>
                        </div>
                        {currentUserRole === mvpRole.name && <Check size={13} style={{ color: mvpRole.color, marginTop: '4px' }} />}
                      </button>
                    ))}
                  </div>

                  {/* Industry-Specific Roles Section */}
                  <div style={{ padding: '6px 10px 2px', borderTop: '1px solid var(--border)', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    🏢 Tenant Industry Roles ({industryPresets[activeIndustryId]?.shortName || 'Industry'})
                  </div>
                  <div style={{ marginBottom: '6px' }}>
                    {(industryPresets[activeIndustryId]?.humanRoles || []).map((hr) => (
                      <button
                        key={hr.id || hr.name}
                        className={`theme-opt-btn ${currentUserRole === hr.name ? 'active' : ''}`}
                        style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                        onClick={() => {
                          switchRole(hr.name);
                          setIsProfileOpen(false);
                        }}
                      >
                        <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: hr.color || '#3b82f6', flexShrink: 0 }} />
                        <span style={{ flex: 1, textAlign: 'left', fontWeight: currentUserRole === hr.name ? 700 : 500 }}>
                          {hr.name} ({hr.dept})
                        </span>
                        {currentUserRole === hr.name && <Check size={12} style={{ color: 'var(--primary)' }} />}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)', marginBottom: '6px', fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                  <div>Company: <strong style={{ color: 'var(--text-main)' }}>{(isUltraSuperAdmin && isPlatformView) ? 'Zenelait AI Platform Root' : companyProfile.name}</strong></div>
                  <div>Assigned Role: <strong style={{ color: 'var(--primary)' }}>{currentUserRole}</strong></div>
                </div>
              )}

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '4px' }}>
                <button
                  className="theme-opt-btn"
                  onClick={() => {
                    navigateTo('company-profile');
                    setIsProfileOpen(false);
                  }}
                >
                  <Building2 size={14} /> Company Profile
                </button>
                {currentRolePermissions?.canManageCompany && (
                  <button
                    className="theme-opt-btn"
                    onClick={() => {
                      navigateTo('users-roles');
                      setIsProfileOpen(false);
                    }}
                  >
                    <Shield size={14} /> Users & Roles Engine
                  </button>
                )}
                {currentRolePermissions?.canManageBilling && (
                  <button
                    className="theme-opt-btn"
                    onClick={() => {
                      navigateTo('subscription-billing');
                      setIsProfileOpen(false);
                    }}
                  >
                    <CreditCard size={14} /> Subscription & Billing
                  </button>
                )}
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
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
