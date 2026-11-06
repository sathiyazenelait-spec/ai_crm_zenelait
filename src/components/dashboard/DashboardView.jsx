import React from 'react';
import { useCRM } from '../../context/CRMContext';
import { StatCard } from '../common/StatCard';
import { PipelineChevron } from '../charts/PipelineChevron';
import { DonutChart } from '../charts/DonutChart';
import { SalesManagerDashboard } from './SalesManagerDashboard';
import { SalesExecutiveDashboard } from './SalesExecutiveDashboard';
import { SupportDashboard } from './SupportDashboard';
import { MarketingDashboard } from './MarketingDashboard';
import { AnalystDashboard } from './AnalystDashboard';
import { HRDashboard } from './HRDashboard';
import { PlatformMasterDashboard } from './PlatformMasterDashboard';
import { INDUSTRY_PRESETS, MVP_ROLES } from '../../data/industryData';
import {
  Users,
  Target,
  Calendar,
  CheckCircle,
  Clock,
  ArrowRight,
  Plus,
  Radio,
  ChevronRight,
  Bot,
  Activity,
  Zap,
  Sparkles,
  Building2,
  CalendarCheck,
  PhoneCall,
  Send,
  BarChart3,
  Edit,
  Globe,
  Phone,
  MapPin,
  Shield,
  Briefcase,
  Layers,
  UserCheck,
  Crown,
  GraduationCap,
  HeartPulse,
  BookOpen,
  Stethoscope,
  ShoppingBag,
  BedDouble,
  CreditCard,
  User,
  ExternalLink
} from 'lucide-react';

export function DashboardView() {
  const {
    metrics,
    pipelineStages,
    leadSources,
    conversations,
    leads,
    navigateTo,
    setActiveModal,
    companyProfile,
    aiAgents,
    aiActivityFeed,
    currentUserName,
    currentUserRole,
    activeIndustryId,
    subscriptionData,
    currentRolePermissions,
    mvpRoles,
    isAiFleetAutonomousActive,
    stopAiFleetExecution,
    resumeAiFleetExecution,
    isPlatformView,
    setIsPlatformView
  } = useCRM();

  const roleLower = (currentUserRole || '').toLowerCase();

  // Distinct Role Detection Logic
  const isSuperAdmin =
    roleLower.includes('ultra') ||
    roleLower.includes('god') ||
    roleLower.includes('super admin') ||
    roleLower.includes('platform super admin');

  const isSalesManager =
    !isSuperAdmin &&
    (roleLower.includes('sales manager') ||
      roleLower.includes('admission manager') ||
      roleLower.includes('reservation manager') ||
      roleLower.includes('dealer manager') ||
      roleLower.includes('showroom sales manager') ||
      roleLower.includes('commercial sales manager') ||
      roleLower.includes('credit / sales manager') ||
      (roleLower.includes('manager') &&
        !roleLower.includes('support') &&
        !roleLower.includes('marketing') &&
        !roleLower.includes('general') &&
        !roleLower.includes('admission director') &&
        !roleLower.includes('relationship')));

  const isSalesExecutive =
    !isSuperAdmin &&
    (roleLower.includes('executive') ||
      roleLower.includes('consultant') ||
      roleLower.includes('test drive') ||
      roleLower.includes('relationship manager') ||
      roleLower.includes('sdr') ||
      roleLower.includes('ae') ||
      roleLower.includes('sales rep') ||
      roleLower.includes('advisor'));

  const isSupport =
    !isSuperAdmin &&
    (roleLower.includes('support') ||
      roleLower.includes('triage') ||
      roleLower.includes('receptionist') ||
      roleLower.includes('patient care') ||
      roleLower.includes('frontdesk') ||
      roleLower.includes('guest experience') ||
      roleLower.includes('loan processing') ||
      roleLower.includes('service support'));

  const isAnalyst =
    !isSuperAdmin &&
    (roleLower.includes('analyst') || roleLower.includes('viewer'));

  const isHr =
    !isSuperAdmin &&
    (roleLower === 'hr' ||
      roleLower.includes('hr manager') ||
      roleLower.includes('hr executive') ||
      roleLower.includes('human resources') ||
      roleLower.includes('people ops') ||
      roleLower.includes('talent'));

  const isMarketing =
    !isSuperAdmin &&
    !isAnalyst &&
    !isHr &&
    (roleLower.includes('marketing') ||
      roleLower.includes('growth') ||
      roleLower.includes('campaign') ||
      roleLower.includes('lead gen'));

  // Available roles for active tenant
  const currentTenantPreset = INDUSTRY_PRESETS[activeIndustryId];
  const tenantRoles = currentTenantPreset?.humanRoles || [
    { id: 'role-1', name: 'Company Admin' },
    { id: 'role-2', name: 'Sales Manager' },
    { id: 'role-3', name: 'Sales Executive' },
    { id: 'role-4', name: 'Support Manager' },
    { id: 'role-5', name: 'Marketing Manager' }
  ];

  const allMvpRoles = mvpRoles || MVP_ROLES || [];

  // Helper formatting
  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'AI Responded':
        return 'badge-ai-responded';
      case 'Waiting':
        return 'badge-waiting';
      case 'Human Handover':
        return 'badge-handover';
      case 'Lead Captured':
        return 'badge-lead-captured';
      case 'Qualified':
        return 'badge-qualified';
      case 'Contacted':
        return 'badge-contacted';
      case 'Proposal':
        return 'badge-proposal';
      default:
        return 'badge-new';
    }
  };

  const getChannelBadge = (channel) => {
    switch (channel) {
      case 'Website':
        return <span className="channel-pill channel-website">🌐 Website</span>;
      case 'WhatsApp':
        return <span className="channel-pill channel-whatsapp">💬 WhatsApp</span>;
      case 'Email':
        return <span className="channel-pill channel-email">✉️ Email</span>;
      case 'Instagram':
        return <span className="channel-pill channel-instagram">📸 Instagram</span>;
      default:
        return <span className="channel-pill">{channel}</span>;
    }
  };

  // 0. Specialized Platform Master View (Ultra Super Admin / Platform Super Admin)
  if (isSuperAdmin && (isPlatformView || isPlatformView === undefined)) {
    return (
      <div className="dashboard-content">
        <PlatformMasterDashboard />
      </div>
    );
  }

  // 1. Specialized Sales Manager View
  if (isSalesManager) {
    return (
      <div className="dashboard-content">
        <SalesManagerDashboard />
      </div>
    );
  }

  // 2. Specialized Sales Executive View
  if (isSalesExecutive) {
    return (
      <div className="dashboard-content">
        <SalesExecutiveDashboard />
      </div>
    );
  }

  // 3. Specialized Support View
  if (isSupport) {
    return (
      <div className="dashboard-content">
        <SupportDashboard />
      </div>
    );
  }

  // 4. Specialized Marketing View
  if (isMarketing) {
    return (
      <div className="dashboard-content">
        <MarketingDashboard />
      </div>
    );
  }

  // 5. Specialized Analyst / BI Viewer View
  if (isAnalyst) {
    return (
      <div className="dashboard-content">
        <AnalystDashboard />
      </div>
    );
  }

  // 6. Specialized HR Operations View
  if (isHr) {
    return (
      <div className="dashboard-content">
        <HRDashboard />
      </div>
    );
  }

  // 7. Default / Company Admin Master Dashboard (Screen 1)
  return (
    <div className="dashboard-content">
      {/* Super Admin Impersonation Notice Banner */}
      {isSuperAdmin && !isPlatformView && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            padding: '12px 18px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(217, 119, 6, 0.12)',
            border: '1.5px solid rgba(217, 119, 6, 0.4)',
            marginBottom: '18px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Crown size={18} style={{ color: '#d97706' }} />
            <div>
              <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#d97706' }}>
                👑 Super Admin Impersonation Active: {companyProfile.name}
              </span>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginLeft: '8px' }}>
                ({companyProfile.industry} • {companyProfile.plan || 'Enterprise'})
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsPlatformView(true)}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span>← Return to Super Admin Platform Hub</span>
          </button>
        </div>
      )}

      {/* Top Greeting and Filter Row */}
      <div className="page-title-row">
        <div className="page-title-group">
          <h1>Good Morning, {currentUserName || 'Sathiyaseelan'} 👋</h1>
          <p>Here's an overview of your company's performance and AI activities.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Date Picker Pill */}
          <div className="date-picker-pill">
            <Calendar size={14} style={{ color: 'var(--text-secondary)' }} />
            <span>Sep 28, 2026 - Oct 4, 2026</span>
          </div>

          {/* Create New Lead Button */}
          <button
            className="btn btn-primary"
            onClick={() => setActiveModal('addLead')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={16} />
            <span>Create New Lead</span>
          </button>
        </div>
      </div>

      {/* 5 Top Stat Metric Cards (Dynamic Tenant-wise: Real Estate vs Education vs Hospital vs Software IT) */}
      {activeIndustryId === 'real_estate' ? (
        <div className="grid-5" style={{ marginBottom: '24px' }}>
          <StatCard
            title="Active Properties"
            value={128}
            change="+14 units"
            period="in inventory"
            isPositive={true}
            icon={Building2}
            color="emerald"
          />
          <StatCard
            title="New Enquiries"
            value={246}
            change="+18.4%"
            period="this month"
            isPositive={true}
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Site Visits This Month"
            value={74}
            change="68% by AI Bot"
            period="scheduled"
            isPositive={true}
            icon={Calendar}
            color="purple"
          />
          <StatCard
            title="Pending Bookings"
            value={12}
            change="₹14.8 Cr"
            period="in pipeline"
            isPositive={true}
            icon={CheckCircle}
            color="rose"
          />
          <StatCard
            title="Agent Productivity"
            value="94.2%"
            change="AI Instant"
            period="SLA compliant"
            isPositive={true}
            icon={Zap}
            color="cyan"
          />
        </div>
      ) : activeIndustryId === 'education' ? (
        <div className="grid-5" style={{ marginBottom: '24px' }}>
          <StatCard
            title="Total Active Students"
            value="1,420"
            change="+118 this term"
            period="enrolled cohorts"
            isPositive={true}
            icon={GraduationCap}
            color="purple"
          />
          <StatCard
            title="New Admission Enquiries"
            value={384}
            change="+24.2%"
            period="this month"
            isPositive={true}
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Applications Awaiting Review"
            value={42}
            change="6 priority"
            period="pending review"
            isPositive={false}
            icon={CheckCircle}
            color="amber"
          />
          <StatCard
            title="Upcoming Counselling"
            value={68}
            change="74% via Video"
            period="scheduled"
            isPositive={true}
            icon={Calendar}
            color="emerald"
          />
          <StatCard
            title="Admission Conversion Rate"
            value="28.4%"
            change="AI Assisted"
            period="cohort fill rate"
            isPositive={true}
            icon={Zap}
            color="cyan"
          />
        </div>
      ) : activeIndustryId === 'hospitals' || activeIndustryId === 'hospital_clinic' ? (
        <div className="grid-5" style={{ marginBottom: '24px' }}>
          <StatCard
            title="Appointments Scheduled"
            value={320}
            change="+12 today"
            period="this month"
            isPositive={true}
            icon={Calendar}
            color="rose"
          />
          <StatCard
            title="Appointments Pending"
            value={18}
            change="Requires confirmation"
            period="awaiting review"
            isPositive={false}
            icon={Clock}
            color="amber"
          />
          <StatCard
            title="Today's Appointments"
            value={46}
            change="32 In-Clinic • 14 Tele"
            period="today"
            isPositive={true}
            icon={Stethoscope}
            color="blue"
          />
          <StatCard
            title="Reception Queue Waiting"
            value={8}
            change="Avg wait 11m"
            period="current triage"
            isPositive={true}
            icon={Users}
            color="emerald"
          />
          <StatCard
            title="AI Receptionist SLA"
            value="99.4%"
            change="840 triaged"
            period="instant response"
            isPositive={true}
            icon={HeartPulse}
            color="cyan"
          />
        </div>
      ) : activeIndustryId === 'ecommerce' ? (
        <div className="grid-5" style={{ marginBottom: '24px' }}>
          <StatCard
            title="Total Store Orders"
            value={245}
            change="+18.4%"
            period="this month"
            isPositive={true}
            icon={ShoppingBag}
            color="indigo"
          />
          <StatCard
            title="Pending Orders"
            value={18}
            change="Awaiting fulfillment"
            period="dispatch queue"
            isPositive={false}
            icon={Clock}
            color="amber"
          />
          <StatCard
            title="Gross Merchandise Sales"
            value="₹3,25,000"
            change="+22.1% YoY"
            period="authorized revenue"
            isPositive={true}
            icon={Zap}
            color="emerald"
          />
          <StatCard
            title="Low Stock Alert"
            value="2 SKUs"
            change="Reorder threshold"
            period="inventory ledger"
            isPositive={false}
            icon={Target}
            color="rose"
          />
          <StatCard
            title="AI Sales & Resolution"
            value="72.9%"
            change="620 resolved"
            period="autonomous close"
            isPositive={true}
            icon={Bot}
            color="cyan"
          />
        </div>
      ) : activeIndustryId === 'hospitality' ? (
        <div className="grid-5" style={{ marginBottom: '24px' }}>
          <StatCard
            title="Total Reservations"
            value={323}
            change="+14.2%"
            period="current season"
            isPositive={true}
            icon={BedDouble}
            color="amber"
          />
          <StatCard
            title="Occupancy Rate"
            value="71.3%"
            change="410 room nights"
            period="of 575 capacity"
            isPositive={true}
            icon={Building2}
            color="emerald"
          />
          <StatCard
            title="Room Revenue"
            value="₹8,50,000"
            change="RevPAR ₹3,707"
            period="verified stays"
            isPositive={true}
            icon={Zap}
            color="blue"
          />
          <StatCard
            title="Today's Front Desk"
            value="12 In • 9 Out"
            change="3 VIP Arrivals"
            period="operational queue"
            isPositive={true}
            icon={Users}
            color="rose"
          />
          <StatCard
            title="AI Reservation Agent"
            value="71.9%"
            change="460 booked/answered"
            period="automated quotes"
            isPositive={true}
            icon={Bot}
            color="cyan"
          />
        </div>
      ) : (
        <div className="grid-5" style={{ marginBottom: '24px' }}>
          <StatCard
            title="Total Leads"
            value={metrics?.totalLeads?.value ?? 0}
            change={metrics?.totalLeads?.change ?? '0%'}
            period={metrics?.totalLeads?.period ?? 'active records'}
            isPositive={metrics?.totalLeads?.isPositive ?? true}
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Qualified Leads"
            value={metrics?.qualifiedLeads?.value ?? 0}
            change={metrics?.qualifiedLeads?.change ?? '0%'}
            period={metrics?.qualifiedLeads?.period ?? 'active records'}
            isPositive={metrics?.qualifiedLeads?.isPositive ?? true}
            icon={Target}
            color="emerald"
          />
          <StatCard
            title="Appointments Booked"
            value={metrics?.appointmentsBooked?.value ?? 0}
            change={metrics?.appointmentsBooked?.change ?? '0%'}
            period={metrics?.appointmentsBooked?.period ?? 'active records'}
            isPositive={metrics?.appointmentsBooked?.isPositive ?? true}
            icon={Calendar}
            color="purple"
          />
          <StatCard
            title="Conversions"
            value={metrics?.conversions?.value ?? 0}
            change={metrics?.conversions?.change ?? '0%'}
            period={metrics?.conversions?.period ?? 'active records'}
            isPositive={metrics?.conversions?.isPositive ?? true}
            icon={CheckCircle}
            color="rose"
          />
          <StatCard
            title="Avg. Response Time"
            value={metrics?.avgResponseTime?.value ?? '< 30s'}
            change={metrics?.avgResponseTime?.change ?? 'AI Instant'}
            period={metrics?.avgResponseTime?.period ?? 'real-time'}
            isPositive={metrics?.avgResponseTime?.isPositive ?? true}
            icon={Clock}
            color="cyan"
          />
        </div>
      )}

      {/* ROW 1: Sales Pipeline, Lead Sources, AI Employees */}
      <div className="dashboard-grid-row-1">
        {/* Sales Pipeline */}
        <div className="crm-card">
          <div className="crm-card-header">
            <div className="crm-card-title">
              <Target size={18} style={{ color: 'var(--primary)' }} />
              <span>Sales Pipeline</span>
            </div>
            <select className="form-select-sm" defaultValue="This Week">
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
              <option value="This Quarter">This Quarter</option>
            </select>
          </div>
          <PipelineChevron stages={pipelineStages} />
        </div>

        {/* Lead Sources Donut Chart */}
        <div className="crm-card">
          <div className="crm-card-header">
            <div className="crm-card-title">
              <Activity size={18} style={{ color: 'var(--primary)' }} />
              <span>Lead Sources</span>
            </div>
          </div>
          <DonutChart data={leadSources} totalCount={metrics?.totalLeads?.value ?? 0} />
        </div>

        {/* AI Employees Live Card */}
        <div className="crm-card">
          <div className="crm-card-header">
            <div className="crm-card-title">
              <Zap size={18} style={{ color: isAiFleetAutonomousActive ? '#10b981' : '#ef4444' }} />
              <span>AI Employees</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                className="badge"
                style={{
                  backgroundColor: isAiFleetAutonomousActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: isAiFleetAutonomousActive ? '#10b981' : '#ef4444',
                  fontSize: '0.68rem',
                  fontWeight: 700
                }}
              >
                {isAiFleetAutonomousActive ? '⚡ 200% Auto' : '🛑 Paused'}
              </span>
              {isAiFleetAutonomousActive ? (
                <button
                  onClick={stopAiFleetExecution}
                  title="Admin Emergency Stop: Pause Autonomous AI Execution"
                  className="btn btn-ghost btn-xs"
                  style={{ color: '#ef4444', fontWeight: 700, padding: '2px 6px', fontSize: '0.68rem' }}
                >
                  ⏹ Stop
                </button>
              ) : (
                <button
                  onClick={resumeAiFleetExecution}
                  title="Admin Resume: Start 200% Autonomous AI Fleet"
                  className="btn btn-ghost btn-xs"
                  style={{ color: '#10b981', fontWeight: 700, padding: '2px 6px', fontSize: '0.68rem' }}
                >
                  ▶ Resume
                </button>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
            {(aiAgents || []).map((agent) => (
              <div
                key={agent.id || agent.name}
                className="ai-employee-row"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '6px',
                      backgroundColor: 'var(--primary-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem'
                    }}
                  >
                    {agent.avatar || '🤖'}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-main)' }}>{agent.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{agent.description}</div>
                  </div>
                </div>
                <span className="active-green-dot" />
              </div>
            ))}

            <button
              className="btn btn-ghost btn-sm"
              style={{ justifyContent: 'space-between', color: 'var(--primary)', fontWeight: 600, padding: '6px 4px', marginTop: '4px' }}
              onClick={() => navigateTo('ai-employees')}
            >
              <span>View All Agents</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ROW 2: Recent Conversations & Quick Actions */}
      <div className="dashboard-grid-row-2">
        {/* Recent Conversations */}
        <div className="crm-card">
          <div className="crm-card-header">
            <div className="crm-card-title">
              <span>Recent Conversations</span>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--primary)', fontWeight: 600 }}
              onClick={() => navigateTo('conversations')}
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="table-responsive">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Channel</th>
                  <th>Last Message</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {(conversations && conversations.length > 0) ? (
                  conversations.slice(0, 5).map((conv) => (
                    <tr
                      key={conv.id || conv.customer}
                      onClick={() => navigateTo('conversations')}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div className="avatar avatar-sm">
                            {getInitials(conv.customer)}
                          </div>
                          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{conv.customer}</span>
                        </div>
                      </td>
                      <td>{getChannelBadge(conv.channel)}</td>
                      <td style={{ maxWidth: '220px' }}>
                        <span className="truncate" style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                          {conv.lastMessage}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(conv.status)}`}>
                          {conv.status}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {conv.assignedTo}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {conv.time}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <Bot size={28} style={{ color: 'var(--primary)', opacity: 0.8 }} />
                        <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>No active customer conversations yet</span>
                        <span style={{ fontSize: '0.8rem' }}>AI Employees are deployed and standing by for inbound queries via Website and WhatsApp.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="crm-card">
          <div className="crm-card-header">
            <div className="crm-card-title">
              <span>Quick Actions</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              className="quick-action-btn"
              onClick={() => setActiveModal('addLead')}
            >
              <div className="quick-action-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6' }}>
                <Plus size={16} />
              </div>
              <div className="quick-action-info">
                <span className="quick-action-title">Add Lead</span>
                <span className="quick-action-desc">Manual lead entry</span>
              </div>
              <ChevronRight size={14} className="quick-action-arrow" />
            </button>

            <button
              className="quick-action-btn"
              onClick={() => setActiveModal('broadcast')}
            >
              <div className="quick-action-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
                <Send size={16} />
              </div>
              <div className="quick-action-info">
                <span className="quick-action-title">Send Broadcast</span>
                <span className="quick-action-desc">WhatsApp / Email campaign</span>
              </div>
              <ChevronRight size={14} className="quick-action-arrow" />
            </button>

            <button
              className="quick-action-btn"
              onClick={() => setActiveModal('addAppointment')}
            >
              <div className="quick-action-icon" style={{ backgroundColor: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6' }}>
                <CalendarCheck size={16} />
              </div>
              <div className="quick-action-info">
                <span className="quick-action-title">Book Appointment</span>
                <span className="quick-action-desc">Schedule customer meeting</span>
              </div>
              <ChevronRight size={14} className="quick-action-arrow" />
            </button>

            <button
              className="quick-action-btn"
              onClick={() => setActiveModal('addOpportunity')}
            >
              <div className="quick-action-icon" style={{ backgroundColor: 'rgba(244, 63, 94, 0.12)', color: '#f43f5e' }}>
                <Target size={16} />
              </div>
              <div className="quick-action-info">
                <span className="quick-action-title">Add Opportunity</span>
                <span className="quick-action-desc">New pipeline deal</span>
              </div>
              <ChevronRight size={14} className="quick-action-arrow" />
            </button>
          </div>
        </div>
      </div>

      {/* ROW 3: AI Live Activity Feed & Company Profile */}
      <div className="dashboard-grid-row-3">
        {/* Live AI Activity Feed */}
        <div className="crm-card">
          <div className="crm-card-header">
            <div className="crm-card-title">
              <Sparkles size={18} style={{ color: '#f59e0b' }} />
              <span>AI Activity Feed</span>
              <span className="pulse-indicator" />
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Real-time event stream</span>
          </div>

          <div className="activity-feed-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(aiActivityFeed || []).slice(0, 5).map((act) => (
              <div
                key={act.id}
                className="activity-feed-item"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border)'
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: act.color ? `${act.color}22` : 'rgba(59, 130, 246, 0.15)',
                    color: act.color || '#3b82f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.9rem',
                    flexShrink: 0
                  }}
                >
                  <Bot size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      {act.agentName || 'AI Agent'}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{act.time}</span>
                  </div>
                  <p style={{ fontSize: '0.785rem', color: 'var(--text-secondary)', margin: '0 0 4px', lineHeight: 1.4 }}>
                    {act.text || act.action}
                  </p>
                  {act.customer && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 500 }}>
                      Lead: {act.customer}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Company Workspace Hub — Scoped Strictly to This Tenant Only */}
        <div className="crm-card">
          <div className="crm-card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '6px',
                  backgroundColor: companyProfile.color ? `${companyProfile.color}22` : 'rgba(37, 99, 235, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Building2 size={16} style={{ color: companyProfile.color || 'var(--primary)' }} />
              </div>
              <div>
                <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  My Company Workspace Hub
                </span>
                <span className="badge badge-primary" style={{ marginLeft: '8px', fontSize: '0.65rem' }}>
                  {subscriptionData?.plan || companyProfile.plan || 'Enterprise'}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Shield size={11} />
                <span>Isolated Sandbox</span>
              </span>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setActiveModal('companyProfile')}
                style={{ color: 'var(--primary)', padding: '4px 8px', fontSize: '0.72rem' }}
                title="Edit Workspace Settings"
              >
                <Edit size={12} />
                <span>Settings</span>
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '6px' }}>
            {/* Company Identity */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: companyProfile.color || 'var(--primary)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                }}
              >
                {companyProfile.logoLetter || (companyProfile.name ? companyProfile.name.substring(0, 2).toUpperCase() : 'CO')}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {companyProfile.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span>{companyProfile.industry}</span>
                  <span>•</span>
                  <span style={{ color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <Globe size={11} /> {companyProfile.domain || companyProfile.website || 'workspace.local'}
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '12px', marginTop: '3px', flexWrap: 'wrap' }}>
                  <span><Phone size={11} style={{ verticalAlign: 'middle', marginRight: 3 }} /> {companyProfile.phone || '+91 44 4567 8901'}</span>
                  <span><MapPin size={11} style={{ verticalAlign: 'middle', marginRight: 3 }} /> {companyProfile.address || 'Chennai HQ, India'}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid — Scoped Strictly to This Tenant */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', backgroundColor: 'var(--bg-surface)', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div>
                <span style={{ fontSize: '0.66rem', color: 'var(--text-secondary)', display: 'block' }}>User Seats</span>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>{companyProfile.totalUsers || subscriptionData?.seats || 25} Users</div>
              </div>
              <div>
                <span style={{ fontSize: '0.66rem', color: 'var(--text-secondary)', display: 'block' }}>AI Employees</span>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#10b981' }}>{aiAgents?.length || companyProfile.activeAiAgents || 3} Live</div>
              </div>
              <div>
                <span style={{ fontSize: '0.66rem', color: 'var(--text-secondary)', display: 'block' }}>Active Plan</span>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--primary)' }}>{subscriptionData?.plan || companyProfile.plan || 'Professional'}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.66rem', color: 'var(--text-secondary)', display: 'block' }}>Renewal Date</span>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>{companyProfile.renewalDate || 'Nov 28, 2026'}</div>
              </div>
            </div>

            {/* Tenant AI Fleet Summary */}
            <div style={{ backgroundColor: 'var(--bg-card)', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Bot size={13} style={{ color: '#10b981' }} />
                  <span>Workspace AI Fleet ({aiAgents?.length || 3} Agents)</span>
                </span>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => navigateTo('ai-employees')}
                  style={{ fontSize: '0.68rem', padding: '2px 6px', color: 'var(--primary)' }}
                >
                  Manage Fleet →
                </button>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {(aiAgents || []).slice(0, 3).map((agent) => (
                  <span
                    key={agent.id}
                    style={{
                      fontSize: '0.68rem',
                      padding: '3px 8px',
                      borderRadius: '12px',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-main)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981' }} />
                    {agent.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Workspace Management Actions */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => navigateTo('users-roles')}
                style={{ flex: 1, fontSize: '0.74rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
              >
                <User size={13} />
                <span>Team & Seats</span>
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => navigateTo('subscription-billing')}
                style={{ flex: 1, fontSize: '0.74rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
              >
                <CreditCard size={13} />
                <span>Billing & Quota</span>
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setActiveModal('companyProfile')}
                style={{ fontSize: '0.74rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
              >
                <Edit size={13} />
                <span>Profile</span>
              </button>
            </div>

            {/* Tenant Isolation Guarantee Notice */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.68rem', color: 'var(--text-muted)', paddingTop: '6px', borderTop: '1px solid var(--border)' }}>
              <Shield size={12} style={{ color: '#10b981', flexShrink: 0 }} />
              <span>Strict Tenant Isolation Active: Zero cross-tenant data visibility permitted.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
