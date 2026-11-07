import React from 'react';
import { useCRM } from '../../context/CRMContext';
import { StatCard } from '../common/StatCard';
import {
  TrendingUp,
  Target,
  DollarSign,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertTriangle,
  Award,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  Send,
  Calendar,
  Layers,
  FileCheck
} from 'lucide-react';

export function SalesManagerDashboard() {
  const {
    companyProfile,
    currentUserName,
    teamMembers,
    opportunities,
    leads,
    updateOpportunityStage,
    navigateTo,
    setActiveModal,
    activeIndustryId,
    currentIndustry,
    approvalQueue,
    addNotification,
    approveFinancialAction,
    rejectFinancialAction
  } = useCRM();

  // Industry-specific manager metrics
  const getManagerMetrics = () => {
    switch (activeIndustryId) {
      case 'real_estate':
        return {
          quota: { value: '₹1.85 Cr', change: '+24%', period: 'vs target ₹1.5 Cr', isPositive: true },
          activeDeals: { value: '28 Units', change: '+8', period: 'in active negotiation', isPositive: true },
          teamWinRate: { value: '38.5%', change: '+5.2%', period: 'vs last month', isPositive: true },
          avgDealSize: { value: '₹68.5 L', change: '+12%', period: 'avg property price', isPositive: true },
          pendingApprovals: { value: '3 Deals', change: 'Token Advance', period: 'requires review', isPositive: true }
        };
      case 'hospitals':
        return {
          quota: { value: '420 OPDs', change: '+18%', period: 'vs target 350 OPDs', isPositive: true },
          activeDeals: { value: '64 Slots', change: '+12', period: 'specialist consultations', isPositive: true },
          teamWinRate: { value: '92.4%', change: '+3.1%', period: 'consultation completion', isPositive: true },
          avgDealSize: { value: '₹1,200', change: '+8%', period: 'avg patient ticket', isPositive: true },
          pendingApprovals: { value: '2 Cases', change: 'Priority Referral', period: 'chamber allocation', isPositive: true }
        };
      case 'education':
        return {
          quota: { value: '₹14.2 L', change: '+28%', period: 'vs target ₹12 L', isPositive: true },
          activeDeals: { value: '45 Seats', change: '+15', period: 'counseling evaluations', isPositive: true },
          teamWinRate: { value: '42.0%', change: '+6.4%', period: 'demo-to-enroll rate', isPositive: true },
          avgDealSize: { value: '₹45,000', change: '0% EMI', period: 'avg course fee', isPositive: true },
          pendingApprovals: { value: '4 Grants', change: 'Scholarship App', period: 'requires approval', isPositive: true }
        };
      case 'financial_services':
        return {
          quota: { value: '₹3.40 Cr', change: '+32%', period: 'vs target ₹2.8 Cr', isPositive: true },
          activeDeals: { value: '18 Loans', change: '+6', period: 'underwriting review', isPositive: true },
          teamWinRate: { value: '54.2%', change: '+8.1%', period: 'sanction rate', isPositive: true },
          avgDealSize: { value: '₹48.0 L', change: '+15%', period: 'commercial ticket', isPositive: true },
          pendingApprovals: { value: '1 Term Sheet', change: 'High Impact', period: 'RM sign-off gate', isPositive: false }
        };
      default: // software_it & others
        return {
          quota: { value: '$45,200', change: '+19%', period: 'vs target $40,000 (113%)', isPositive: true },
          activeDeals: { value: '18 Deals', change: '+$148k', period: 'in sales pipeline', isPositive: true },
          teamWinRate: { value: '34.8%', change: '+4.5%', period: 'vs last quarter', isPositive: true },
          avgDealSize: { value: '$8,250', change: '+14%', period: 'annual contract value', isPositive: true },
          pendingApprovals: { value: '3 Quotes', change: 'Discount >15%', period: 'requires approval', isPositive: true }
        };
    }
  };

  const metrics = getManagerMetrics();

  // High-value deals pending manager approval
  const pendingApprovalsList = [
    {
      id: 'appr-deal-1',
      title: activeIndustryId === 'real_estate' ? 'Skyline Meadows 3BHK Penthouse (#PH-401)' : activeIndustryId === 'manufacturing_b2b' ? '500x SS-316 Hydraulic Valves Wholesale' : 'Enterprise SaaS 120-Seat Custom SLA',
      account: activeIndustryId === 'real_estate' ? 'Pooja Hegde (Hegde Family Trust)' : activeIndustryId === 'manufacturing_b2b' ? 'Kulkarni Pumps Ltd' : 'CloudScale Systems Inc',
      value: activeIndustryId === 'real_estate' ? '₹1.80 Cr' : activeIndustryId === 'manufacturing_b2b' ? '₹12,50,000' : '$28,500/yr',
      owner: 'Rahul Kumar',
      requestedDiscount: '12% Special Tier Discount',
      aiScore: 94,
      aiSummary: 'Customer meets all qualification criteria. Competitor POC active. Approving discount gives 88% probability to close within 48h.'
    },
    {
      id: 'appr-deal-2',
      title: activeIndustryId === 'education' ? 'Java Full Stack 10-Student Corporate Batch' : 'AI Chatbot + Omnichannel WhatsApp Add-on',
      account: activeIndustryId === 'education' ? 'Tech Mahindra Campus Hire' : 'Global Systems Ltd',
      value: activeIndustryId === 'education' ? '₹4,00,000' : '$14,200/yr',
      owner: 'Sneha Iyer',
      requestedDiscount: 'Quarterly Payment Terms (Standard is Annual)',
      aiScore: 89,
      aiSummary: 'Client budget approved by VP of Operations. Low default risk.'
    }
  ];

  return (
    <div className="sales-manager-dashboard">
      {/* Title Row */}
      <div className="page-title-row">
        <div className="page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', fontWeight: 700 }}>
              Sales Manager Dashboard
            </span>
            <span className="badge" style={{ backgroundColor: companyProfile.color ? `${companyProfile.color}22` : 'rgba(37,99,235,0.12)', color: companyProfile.color || '#2563eb' }}>
              {companyProfile.name}
            </span>
          </div>
          <h1>Sales Pipeline & Team Performance</h1>
          <p>Real-time quota attainment, deal approvals, sales rep leaderboards, and AI win forecasting</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigateTo('opportunities')}>
            <Layers size={15} />
            <span>Open Kanban Board</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setActiveModal('addOpportunity')}>
            <span>+ Create Opportunity</span>
          </button>
        </div>
      </div>

      {/* Top 5 KPI Metrics */}
      <div className="grid-5" style={{ marginBottom: '24px' }}>
        <StatCard
          title="Team Quota Target"
          value={metrics.quota.value}
          change={metrics.quota.change}
          period={metrics.quota.period}
          isPositive={metrics.quota.isPositive}
          icon={DollarSign}
          color="blue"
        />
        <StatCard
          title="Active Pipeline Deals"
          value={metrics.activeDeals.value}
          change={metrics.activeDeals.change}
          period={metrics.activeDeals.period}
          isPositive={metrics.activeDeals.isPositive}
          icon={Target}
          color="emerald"
        />
        <StatCard
          title="Team Win Rate"
          value={metrics.teamWinRate.value}
          change={metrics.teamWinRate.change}
          period={metrics.teamWinRate.period}
          isPositive={metrics.teamWinRate.isPositive}
          icon={TrendingUp}
          color="purple"
        />
        <StatCard
          title="Avg. Deal Size"
          value={metrics.avgDealSize.value}
          change={metrics.avgDealSize.change}
          period={metrics.avgDealSize.period}
          isPositive={metrics.avgDealSize.isPositive}
          icon={Award}
          color="cyan"
        />
        <StatCard
          title="Pending Approvals"
          value={metrics.pendingApprovals.value}
          change={metrics.pendingApprovals.change}
          period={metrics.pendingApprovals.period}
          isPositive={metrics.pendingApprovals.isPositive}
          icon={AlertTriangle}
          color="amber"
        />
      </div>

      {/* Regulated Financial RM Gate (If Financial Services Tenant) */}
      {activeIndustryId === 'financial_services' && approvalQueue && approvalQueue.length > 0 && (
        <div
          className="crm-card"
          style={{
            marginBottom: '24px',
            padding: '20px',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(245, 158, 11, 0.08) 100%)',
            border: '2px solid rgba(239, 68, 68, 0.3)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={20} style={{ color: '#ef4444' }} />
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#ef4444' }}>
                  Regulated Action: Mandatory Relationship Manager Approval Gate
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  As per compliance, AI is restricted from dispatching loan sanction term sheets without authorized RM signature.
                </span>
              </div>
            </div>
            <span className="badge badge-waiting">1 Awaiting RM Sign-off</span>
          </div>

          {approvalQueue.map((item) => (
            <div
              key={item.id}
              style={{
                backgroundColor: 'var(--bg-card)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.customerName}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>{item.requestType} • {item.amount}</div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>{item.aiSummary}</p>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => rejectFinancialAction(item.id)}
                  style={{ color: '#ef4444' }}
                >
                  Request ITR Clarification
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => approveFinancialAction(item.id)}
                  style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
                >
                  <FileCheck size={14} />
                  <span>Authorize & Sign Term Sheet</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grid: Deal Approval Queue & Team Quota Leaderboard */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px', marginBottom: '24px' }}>
        
        {/* Deal Approvals & High-Impact Opportunities */}
        <div className="crm-card">
          <div className="crm-card-header">
            <div className="crm-card-title">
              <FileCheck size={18} style={{ color: 'var(--primary)' }} />
              <span>Deal Approvals & Pricing Exceptions ({pendingApprovalsList.length})</span>
            </div>
            <span className="badge badge-primary">Requires Signoff</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pendingApprovalsList.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>{item.title}</div>
                  <span className="badge badge-qualified" style={{ fontWeight: 700 }}>{item.value}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  <span>Account: <strong style={{ color: 'var(--text-main)' }}>{item.account}</strong></span>
                  <span>Owner: <strong>{item.owner}</strong></span>
                  <span className="badge badge-waiting" style={{ fontSize: '0.68rem' }}>{item.requestedDiscount}</span>
                </div>

                <div style={{ padding: '8px 10px', backgroundColor: 'var(--bg-main)', borderRadius: '6px', fontSize: '0.725rem', color: 'var(--text-secondary)', marginBottom: '10px', borderLeft: '3px solid var(--primary)' }}>
                  <Sparkles size={12} style={{ color: 'var(--primary)', marginRight: '4px', verticalAlign: 'middle' }} />
                  <strong>AI Copilot:</strong> {item.aiSummary}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button
                    className="btn btn-secondary btn-xs"
                    onClick={() => addNotification && addNotification({
                      type: 'info',
                      title: `Terms review opened for ${item.dealTitle}`
                    })}
                  >
                    Modify Terms
                  </button>
                  <button
                    className="btn btn-primary btn-xs"
                    onClick={() => {
                      if (addNotification) {
                        addNotification({
                          type: 'success',
                          title: `Quotation generated for ${item.dealTitle}!`
                        });
                      }
                      if (navigateTo) navigateTo('accelerators');
                    }}
                  >
                    Approve & Generate Quotation
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sales Rep Leaderboard */}
        <div className="crm-card">
          <div className="crm-card-header">
            <div className="crm-card-title">
              <Award size={18} style={{ color: 'var(--primary)' }} />
              <span>Sales Rep Leaderboard</span>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigateTo('users-roles')}>
              <span>Manage Team</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {teamMembers.slice(0, 5).map((member, idx) => {
              const quotaPct = Math.min(100, Math.floor(65 + idx * 8 + (5 - idx) * 3));
              return (
                <div
                  key={member.id || idx}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: idx === 0 ? '#f59e0b' : 'var(--text-muted)', width: 16 }}>
                        #{idx + 1}
                      </span>
                      <div className="avatar avatar-xs" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.825rem', fontWeight: 600 }}>{member.name}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{member.role}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: quotaPct >= 80 ? '#10b981' : '#f59e0b' }}>
                        {quotaPct}% Quota
                      </span>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{member.leadsHandled || 24} leads</div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ width: '100%', height: 4, backgroundColor: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${quotaPct}%`,
                        height: '100%',
                        backgroundColor: quotaPct >= 80 ? '#10b981' : 'var(--primary)',
                        borderRadius: 2
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
