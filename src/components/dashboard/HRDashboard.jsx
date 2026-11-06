import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { StatCard } from '../common/StatCard';
import {
  Users,
  Briefcase,
  UserPlus,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  Bot,
  Plus,
  Sparkles,
  ArrowRight,
  Send,
  MessageSquare,
  Search,
  Filter,
  Check,
  X,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export function HRDashboard() {
  const { companyProfile, currentUserName, addNotification, navigateTo } = useCRM();

  const [leaveRequests, setLeaveRequests] = useState([
    {
      id: 'LVR-1001',
      employee: 'Arun Kumar (EMP-1001)',
      role: 'Java Developer',
      type: 'Casual Leave',
      dates: 'Nov 14 - Nov 15 (2 days)',
      reason: 'Family gathering / personal commitment',
      status: 'Pending Approval'
    },
    {
      id: 'LVR-1002',
      employee: 'Sneha Verma (EMP-1005)',
      role: 'Marketing Lead',
      type: 'Sick Leave',
      dates: 'Oct 24 (1 day)',
      reason: 'Viral fever / doctor consultation',
      status: 'Pending Approval'
    }
  ]);

  const [onboardingList, setOnboardingList] = useState([
    {
      id: 'ONB-1001',
      employee: 'Arun Kumar',
      role: 'Java Developer',
      startDate: 'Nov 02, 2026',
      progress: 33,
      status: 'In Progress',
      currentTask: 'Prepare laptop and developer access (IT Admin)'
    },
    {
      id: 'ONB-1002',
      employee: 'Meena Raj (Offer Accepted)',
      role: 'Senior Cloud Architect',
      startDate: 'Nov 10, 2026',
      progress: 10,
      status: 'Pre-Onboarding',
      currentTask: 'Verify educational & employment background docs'
    }
  ]);

  const handleApproveLeave = (id) => {
    setLeaveRequests(prev => prev.map(l => l.id === id ? { ...l, status: 'Approved' } : l));
    addNotification({
      type: 'system',
      title: `Leave request ${id} approved by HR`,
      category: 'HR'
    });
  };

  const handleRejectLeave = (id) => {
    setLeaveRequests(prev => prev.map(l => l.id === id ? { ...l, status: 'Rejected' } : l));
    addNotification({
      type: 'system',
      title: `Leave request ${id} rejected`,
      category: 'HR'
    });
  };

  return (
    <div className="hr-dashboard">
      {/* Top Banner */}
      <div className="page-title-row">
        <div className="page-title-group">
          <h1>HR Operations & People Command Center 👥</h1>
          <p>Employee lifecycle, recruitment ATS, onboarding, and service requests for {companyProfile.name}</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigateTo('hr-hub')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Briefcase size={14} />
            <span>Open Full HR Hub</span>
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigateTo('hr-hub')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <UserPlus size={14} />
            <span>+ Add Employee (EMP)</span>
          </button>
        </div>
      </div>

      {/* 5 Top HR Metric Cards */}
      <div className="grid-5" style={{ marginBottom: '24px' }}>
        <StatCard
          title="Active Headcount"
          value="40 Staff"
          change="+3 this month"
          period="across 4 depts"
          isPositive={true}
          icon={Users}
        />
        <StatCard
          title="Open Job Openings"
          value="5 Positions"
          change="3 in IT/Eng"
          period="recruitment active"
          isPositive={true}
          icon={Briefcase}
        />
        <StatCard
          title="Active Onboarding"
          value="2 Joiners"
          change="Arun Kumar (EMP-1001)"
          period="starting Nov 2"
          isPositive={true}
          icon={Sparkles}
        />
        <StatCard
          title="Pending Leave Approvals"
          value={leaveRequests.filter(l => l.status === 'Pending Approval').length}
          change="Action required"
          period="SLA < 24 hrs"
          isPositive={leaveRequests.filter(l => l.status === 'Pending Approval').length === 0}
          icon={Calendar}
        />
        <StatCard
          title="HR AI Triage Deflection"
          value="84.5%"
          change="128 FAQs auto-answered"
          period="Zero wait time"
          isPositive={true}
          icon={Bot}
        />
      </div>

      {/* 2-Column Grid: Pending Leave Requests & Live Onboarding Cases */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Pending Leave Approvals */}
        <div className="crm-card">
          <div className="crm-card-header">
            <div>
              <h2 className="crm-card-title">Pending Leave Requests Queue</h2>
              <p className="crm-card-subtitle">Review, approve, or reject with policy reason</p>
            </div>
            <span className="badge badge-warning">Segregation of Duties Enforced</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {leaveRequests.map((req) => (
              <div
                key={req.id}
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {req.employee}
                    </span>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
                      ({req.role})
                    </span>
                    <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600, marginTop: '2px' }}>
                      {req.type} • {req.dates}
                    </div>
                  </div>

                  <span
                    className={`badge ${req.status === 'Approved' ? 'badge-qualified' : req.status === 'Rejected' ? 'badge-error' : 'badge-waiting'}`}
                    style={{ fontSize: '0.72rem' }}
                  >
                    {req.status}
                  </span>
                </div>

                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '2px 0 6px 0' }}>
                  "{req.reason}"
                </p>

                {req.status === 'Pending Approval' && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <button
                      onClick={() => handleApproveLeave(req.id)}
                      className="btn btn-primary btn-xs"
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#10b981', borderColor: '#10b981' }}
                    >
                      <Check size={12} />
                      <span>Approve Leave</span>
                    </button>
                    <button
                      onClick={() => handleRejectLeave(req.id)}
                      className="btn btn-secondary btn-xs"
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444' }}
                    >
                      <X size={12} />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Live Onboarding Progress */}
        <div className="crm-card">
          <div className="crm-card-header">
            <div>
              <h2 className="crm-card-title">Active Employee Onboarding Checklists</h2>
              <p className="crm-card-subtitle">Task completion and departmental handoffs</p>
            </div>
            <span className="badge badge-primary">2 In Flight</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {onboardingList.map((onb) => (
              <div
                key={onb.id}
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {onb.employee} — {onb.role}
                  </span>
                  <span className="badge badge-secondary" style={{ fontSize: '0.7rem' }}>
                    Join: {onb.startDate}
                  </span>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Current Task: <strong>{onb.currentTask}</strong>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="progress-bar-bg" style={{ flex: 1, height: 7 }}>
                    <div className="progress-bar-fill" style={{ width: `${onb.progress}%`, backgroundColor: '#3b82f6' }} />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {onb.progress}%
                  </span>
                </div>
              </div>
            ))}

            <button
              onClick={() => navigateTo('hr-hub')}
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <span>Manage All Onboarding Tasks in HR Hub</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Recruitment ATS Kanban & HR Service Queue Preview */}
      <div className="crm-card">
        <div className="crm-card-header">
          <div>
            <h2 className="crm-card-title">Recruitment Pipeline ATS (Software / IT Positions)</h2>
            <p className="crm-card-subtitle">Stage-by-stage candidate progression (APPLIED → SCREENING → INTERVIEW → OFFER → HIRED)</p>
          </div>
          <button
            onClick={() => navigateTo('hr-hub')}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <UserPlus size={14} />
            <span>+ Add Candidate (CAN-1001)</span>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
          {[
            { stage: 'APPLIED', count: 14, color: '#3b82f6', sample: 'Karthik Raja (React)' },
            { stage: 'SCREENING', count: 6, color: '#06b6d4', sample: 'Divya Nair (DevOps)' },
            { stage: 'INTERVIEW', count: 3, color: '#f59e0b', sample: 'Meena Raj (Java Cloud - CAN-1001)' },
            { stage: 'OFFER', count: 1, color: '#8b5cf6', sample: 'Venkatesh P (Staff Architect)' },
            { stage: 'HIRED', count: 8, color: '#10b981', sample: 'Arun Kumar (EMP-1001)' }
          ].map((col, idx) => (
            <div
              key={idx}
              style={{
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: col.color }}>{col.stage}</span>
                <span className="badge badge-secondary" style={{ fontSize: '0.68rem' }}>{col.count}</span>
              </div>
              <div style={{ padding: '8px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', fontSize: '0.72rem' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{col.sample}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', marginTop: '2px' }}>Active review</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
