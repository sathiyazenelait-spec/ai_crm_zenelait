import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { StatCard } from '../common/StatCard';
import {
  Crown,
  Building2,
  Users,
  Bot,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Activity,
  Server,
  Database,
  Cpu,
  Radio,
  ArrowRight,
  ExternalLink,
  Layers,
  Sparkles,
  Lock,
  Unlock,
  RefreshCw,
  Send,
  Eye,
  Settings,
  CheckCircle2,
  Search,
  Globe
} from 'lucide-react';

export function PlatformMasterDashboard() {
  const {
    tenants,
    switchTenant,
    impersonateTenant,
    isEmergencyLockdown,
    toggleEmergencyLockdown,
    systemBackups,
    triggerDatabaseBackup,
    globalAnnouncements,
    broadcastGlobalAnnouncement,
    globalAiConfig,
    currentUserRole,
    navigateTo,
    setIsPlatformView,
    addNotification
  } = useCRM();

  const [annTitle, setAnnTitle] = useState('');
  const [annMsg, setAnnMsg] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [workspaceSearchQuery, setWorkspaceSearchQuery] = useState('');

  const isUltraAdmin = currentUserRole.includes('Ultra') || currentUserRole.includes('God');

  const filteredTenants = tenants.filter((t) => {
    const q = workspaceSearchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      t.name.toLowerCase().includes(q) ||
      (t.industryName || '').toLowerCase().includes(q) ||
      (t.plan || '').toLowerCase().includes(q) ||
      (t.id || '').toLowerCase().includes(q)
    );
  });

  const totalSeats = tenants.reduce((acc, t) => acc + (t.seats || 0), 0);
  const totalAIEmployees = tenants.reduce((acc, t) => acc + (t.activeAiEmployees || 0), 0);

  const handleBroadcast = (e) => {
    e.preventDefault();
    if (!annTitle.trim() || !annMsg.trim()) return;
    broadcastGlobalAnnouncement(annTitle, annMsg, 'High');
    setAnnTitle('');
    setAnnMsg('');
    setIsBroadcasting(false);
  };

  return (
    <div className="platform-master-dashboard">
      {/* 1. Supreme God-Mode / Super Admin Header Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          padding: '16px 20px',
          borderRadius: 'var(--radius-md)',
          background: isUltraAdmin
            ? 'linear-gradient(135deg, rgba(217, 119, 6, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)'
            : 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(59, 130, 246, 0.12) 100%)',
          border: isUltraAdmin
            ? '1.5px solid rgba(217, 119, 6, 0.4)'
            : '1.5px solid rgba(139, 92, 246, 0.3)',
          marginBottom: '24px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-md)',
              backgroundColor: isUltraAdmin ? '#d97706' : '#8b5cf6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
            }}
          >
            <Crown size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {isUltraAdmin ? '👑 Ultra Super Admin — God-Mode Root Command Center' : '🛡️ Platform Super Admin — SaaS Infrastructure Hub'}
              </span>
              <span
                className="badge"
                style={{
                  backgroundColor: isUltraAdmin ? 'rgba(217, 119, 6, 0.2)' : 'rgba(139, 92, 246, 0.2)',
                  color: isUltraAdmin ? '#d97706' : '#8b5cf6',
                  fontWeight: 700,
                  fontSize: '0.72rem'
                }}
              >
                {isUltraAdmin ? 'All 9 Tenants Omnipotent Control' : 'Platform Telemetry & Provisioning'}
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              Universal cross-tenant management, 1-click tenant impersonation, global AI model orchestration, and billing engine.
            </p>
          </div>
        </div>

        {/* Global Quick Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Emergency Lockdown Toggle */}
          <button
            onClick={toggleEmergencyLockdown}
            className={`btn btn-sm ${isEmergencyLockdown ? 'btn-danger' : 'btn-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem' }}
          >
            {isEmergencyLockdown ? <Lock size={14} /> : <Unlock size={14} />}
            <span>{isEmergencyLockdown ? 'LOCKDOWN ACTIVE' : 'Emergency Lockdown'}</span>
          </button>

          {/* Trigger Database Backup */}
          <button
            onClick={triggerDatabaseBackup}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem' }}
          >
            <Database size={14} style={{ color: '#10b981' }} />
            <span>Snapshot DB</span>
          </button>

          {/* Go to full Platform Admin hub */}
          <button
            onClick={() => {
              setIsPlatformView(true);
              navigateTo('platform-admin');
            }}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem' }}
          >
            <Server size={14} />
            <span>Open All Tenants Hub</span>
          </button>
        </div>
      </div>

      {/* 2. Top 5 Global Platform KPIs */}
      <div className="grid-5" style={{ marginBottom: '24px' }}>
        <StatCard
          title="Global Platform ARR"
          value="$14.2M"
          change="+28.4%"
          period="vs prior year"
          isPositive={true}
          icon={DollarSign}
        />
        <StatCard
          title="Active Tenant Workspaces"
          value={tenants.length}
          change="9 / 9"
          period="100% healthy"
          isPositive={true}
          icon={Building2}
        />
        <StatCard
          title="Total User Seats"
          value={totalSeats}
          change="92% active"
          period="across tenants"
          isPositive={true}
          icon={Users}
        />
        <StatCard
          title="Active AI Employees"
          value={totalAIEmployees}
          change="+14 new"
          period="this quarter"
          isPositive={true}
          icon={Bot}
        />
        <StatCard
          title="Platform Uptime"
          value="99.98%"
          change="18ms"
          period="avg latency"
          isPositive={true}
          icon={Activity}
        />
      </div>

      {/* 3. Universal Workspaces Hub — All Industry Tenants */}
      <div className="crm-card" style={{ marginBottom: '24px' }}>
        <div className="crm-card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={20} style={{ color: '#8b5cf6' }} />
              <h2 className="crm-card-title" style={{ margin: 0, fontSize: '1.1rem' }}>
                Universal Workspaces Hub — All {tenants.length} Industry Tenants
              </h2>
            </div>
            <p className="crm-card-subtitle" style={{ margin: '4px 0 0 0' }}>
              Super Admin multi-tenant command center. Jump into any company workspace with 1-click root impersonation.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                minWidth: '240px'
              }}
            >
              <Search size={14} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search workspace, company, plan..."
                value={workspaceSearchQuery}
                onChange={(e) => setWorkspaceSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  color: 'var(--text-main)',
                  fontSize: '0.78rem',
                  width: '100%'
                }}
              />
            </div>
            <button
              onClick={() => {
                setIsPlatformView(true);
                navigateTo('platform-admin');
              }}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <ExternalLink size={13} />
              <span>Full Workspaces Hub Console</span>
            </button>
            <span className="badge badge-primary">
              {filteredTenants.length} / {tenants.length} Live
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {filteredTenants.map((t) => (
            <div
              key={t.id}
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', backgroundColor: t.color || 'var(--primary)' }} />
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: '8px',
                        backgroundColor: t.color || '#3b82f6',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        flexShrink: 0
                      }}
                    >
                      {t.logoLetter || t.name.substring(0, 2)}
                    </div>
                    <div>
                      <span className="badge badge-secondary" style={{ fontSize: '0.66rem', marginBottom: '2px' }}>
                        {t.industryName}
                      </span>
                      <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                        {t.name}
                      </h3>
                    </div>
                  </div>
                  <span className="badge badge-qualified" style={{ fontSize: '0.7rem' }}>
                    {t.plan || 'Enterprise'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '14px', backgroundColor: 'var(--bg-card)', padding: '8px 10px', borderRadius: 'var(--radius-sm)' }}>
                  <div>Seats: <strong style={{ color: 'var(--text-main)' }}>{t.seats || 25}</strong></div>
                  <div>Storage: <strong style={{ color: 'var(--text-main)' }}>{t.storageGB || 100} GB</strong></div>
                  <div>AI Agents: <strong style={{ color: '#10b981' }}>{t.activeAiEmployees || 4} Live</strong></div>
                  <div>Health: <strong style={{ color: '#10b981' }}>99.9%</strong></div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => {
                    impersonateTenant(t.id);
                  }}
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1, fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  title="Open this company workspace with Super Admin impersonation"
                >
                  <Crown size={13} />
                  <span>Open Workspace</span>
                </button>
                <button
                  onClick={() => {
                    switchTenant(t.id);
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', padding: '0 10px' }}
                  title="Switch Active Tenant View"
                >
                  <Eye size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Global AI Fleet Orchestration & System Health */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Global AI Fleet Gateway */}
        <div className="crm-card">
          <div className="crm-card-header">
            <div>
              <h2 className="crm-card-title">Universal AI Fleet Model Gateway</h2>
              <p className="crm-card-subtitle">Real-time health of LLM backbones powering CRM workflows</p>
            </div>
            <span className="badge badge-primary">Auto-Failover Active</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { name: 'GPT-4o (Omni)', provider: 'OpenAI Enterprise', role: 'Complex Negotiations & Deal Term Sheets', latency: '420ms', status: 'Optimal', color: '#10b981' },
              { name: 'Claude 3.5 Sonnet', provider: 'Anthropic AI', role: 'Support Triage & Policy Document Grounding', latency: '380ms', status: 'Optimal', color: '#8b5cf6' },
              { name: 'Gemini 1.5 Pro', provider: 'Google Cloud', role: 'Multimodal RFP Reading & Video Demos', latency: '290ms', status: 'Optimal', color: '#3b82f6' },
              { name: 'Llama 3 70B (Private VPC)', provider: 'Local VPC / vLLM', role: 'Regulated PII Loan Triage (Air-Gapped)', latency: '180ms', status: 'Optimal', color: '#f59e0b' }
            ].map((m, idx) => (
              <div
                key={idx}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: m.color }} />
                  <div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)' }}>{m.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{m.provider} • {m.role}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.latency}</span>
                  <span className="badge badge-qualified" style={{ fontSize: '0.68rem' }}>
                    ● {m.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global Broadcast & System Backups */}
        <div className="crm-card">
          <div className="crm-card-header">
            <div>
              <h2 className="crm-card-title">System Infrastructure & Broadcast</h2>
              <p className="crm-card-subtitle">Real-time alerts and snapshot status</p>
            </div>
            <span className="badge badge-secondary">PostgreSQL Multi-AZ</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Backup status box */}
            <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Last Automated Backup</span>
                <span className="badge badge-qualified" style={{ fontSize: '0.68rem' }}>Verified 100%</span>
              </div>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: 0 }}>
                {systemBackups[0]?.timestamp || '15 minutes ago'} — {systemBackups[0]?.size || '1.84 GB'} across 9 tenant schemas.
              </p>
            </div>

            {/* Broadcast Announcement Form */}
            <form onSubmit={handleBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
                📢 Broadcast Notification to All 9 Tenants
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Announcement Title (e.g., Scheduled Maintenance)..."
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                style={{ fontSize: '0.78rem', padding: '6px 10px' }}
              />
              <textarea
                className="form-control"
                placeholder="Announcement Message broadcasted to all logged-in workspace headers..."
                value={annMsg}
                onChange={(e) => setAnnMsg(e.target.value)}
                rows={2}
                style={{ fontSize: '0.78rem', padding: '6px 10px', resize: 'none' }}
              />
              <button type="submit" className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Send size={13} />
                <span>Broadcast to All Companies</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
