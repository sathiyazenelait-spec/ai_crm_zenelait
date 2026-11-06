import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { StatusBadge } from '../common/StatusBadge';
import {
  Users2,
  Plus,
  Mail,
  Shield,
  MoreVertical,
  Bot,
  Sparkles,
  CheckCircle2,
  Sliders,
  ShieldAlert,
  Check,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export function TeamManagementView() {
  const {
    teamMembers,
    setActiveModal,
    currentIndustry,
    approvalQueue,
    approveFinancialAction,
    rejectFinancialAction
  } = useCRM();

  const [activeTab, setActiveTab] = useState('human'); // 'human' | 'ai' | 'roles' | 'approvals'
  const [roleFilter, setRoleFilter] = useState('All');
  const [expandedRoleId, setExpandedRoleId] = useState('role-3'); // Default to Sales Executive to showcase features immediately

  const departments = ['All', ...new Set(currentIndustry.humanRoles.map(r => r.dept))];

  const filteredMembers = teamMembers.filter(m => {
    if (roleFilter === 'All') return true;
    return m.department === roleFilter;
  });

  return (
    <div>
      {/* Title Row */}
      <div className="page-title-row">
        <div className="page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              className="badge"
              style={{
                backgroundColor: currentIndustry.accentLight,
                color: currentIndustry.color,
                fontWeight: 700,
                fontSize: '0.75rem'
              }}
            >
              {currentIndustry.shortName}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>• Role-Based Access Control</span>
          </div>
          <h1>Team & Role Management</h1>
          <p>Configure industry-tailored human roles, seat permissions, and autonomous AI employee assignments</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setActiveTab('roles')}
          >
            <Shield size={15} />
            <span>Role Permissions Matrix</span>
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setActiveModal('inviteMember')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={15} />
            <span>Invite Team Member</span>
          </button>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="crm-card" style={{ marginBottom: '20px', padding: '10px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className={`btn btn-sm ${activeTab === 'human' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('human')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Users2 size={14} />
              <span>Human Staff ({filteredMembers.length})</span>
            </button>

            <button
              className={`btn btn-sm ${activeTab === 'ai' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('ai')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Bot size={14} />
              <span>AI Employees ({currentIndustry.aiEmployees.length})</span>
            </button>

            <button
              className={`btn btn-sm ${activeTab === 'roles' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('roles')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Shield size={14} />
              <span>Configured Roles ({currentIndustry.humanRoles.length})</span>
            </button>

            {currentIndustry.id === 'financial_services' && (
              <button
                className={`btn btn-sm ${activeTab === 'approvals' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('approvals')}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', borderColor: '#059669', color: activeTab === 'approvals' ? '#fff' : '#059669' }}
              >
                <ShieldAlert size={14} />
                <span>Regulated Approval Queue ({approvalQueue.filter(a => a.status === 'Pending Approval').length})</span>
              </button>
            )}
          </div>

          {activeTab === 'human' && (
            <div style={{ display: 'flex', gap: '6px' }}>
              {departments.map((d) => (
                <button
                  key={d}
                  className={`btn btn-xs ${roleFilter === d ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setRoleFilter(d)}
                  style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                >
                  {d}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* VIEW 1: Human Staff Table */}
      {activeTab === 'human' && (
        <div className="crm-card">
          <div className="table-responsive">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Team Member</th>
                  <th>Email</th>
                  <th>Tailored Industry Role</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Permission Scope</th>
                  <th>Workload</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          className="avatar avatar-sm"
                          style={{ backgroundColor: currentIndustry.color, color: '#fff', fontWeight: 700 }}
                        >
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span style={{ fontWeight: 600 }}>{member.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{member.email}</td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: currentIndustry.accentLight,
                          color: currentIndustry.color,
                          fontWeight: 700
                        }}
                      >
                        {member.role}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{member.department}</span>
                    </td>
                    <td>
                      <StatusBadge status={member.status} />
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {member.access || 'Standard Access'}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                      {member.leadsHandled} Handled
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: AI Employees Grid */}
      {activeTab === 'ai' && (
        <div className="grid-3">
          {currentIndustry.aiEmployees.map((agent) => (
            <div key={agent.id} className="crm-card" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ fontSize: '1.8rem' }}>{agent.avatar}</div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>{agent.name}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{agent.role}</span>
                  </div>
                </div>
                <StatusBadge status={agent.status} />
              </div>

              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', minHeight: '44px', lineHeight: 1.45, margin: '0 0 16px 0' }}>
                {agent.description}
              </p>

              {/* Capabilities Chips */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Autonomous Capabilities:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {agent.capabilities?.map((cap, i) => (
                    <span
                      key={i}
                      className="badge"
                      style={{
                        backgroundColor: 'var(--bg-main)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-main)',
                        fontSize: '0.68rem'
                      }}
                    >
                      ✓ {cap}
                    </span>
                  ))}
                </div>
              </div>

              {/* Guardrails if any */}
              {agent.guardrails && (
                <div
                  style={{
                    padding: '8px 10px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(5, 150, 105, 0.08)',
                    border: '1px solid rgba(5, 150, 105, 0.2)',
                    fontSize: '0.72rem',
                    color: '#059669',
                    fontWeight: 600,
                    marginBottom: '14px'
                  }}
                >
                  🛡️ {agent.guardrails}
                </div>
              )}

              {/* Stats Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '12px', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Handling: {agent.handledCount}</span>
                <span style={{ fontWeight: 700, color: '#10b981' }}>{agent.accuracy} Accuracy</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW 3: Role & Permissions Breakdown */}
      {activeTab === 'roles' && (
        <div className="crm-card" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '18px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 4px 0' }}>
              Custom Roles for {currentIndustry.name}
            </h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Configured roles adapt dynamically according to the company type registered by HR.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {currentIndustry.humanRoles.map((role) => {
              const isExpanded = expandedRoleId === role.id;
              const hasFeatures = role.features && role.features.length > 0;

              return (
                <div
                  key={role.id}
                  style={{
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-main)',
                    border: isExpanded ? `1px solid ${role.color || currentIndustry.color}` : '1px solid var(--border)',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div
                    onClick={() => setExpandedRoleId(isExpanded ? null : role.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 18px',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          backgroundColor: role.color || currentIndustry.color
                        }}
                      />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--text-main)' }}>
                            {role.name}
                          </span>
                          {hasFeatures && (
                            <span
                              className="badge"
                              style={{
                                fontSize: '0.68rem',
                                backgroundColor: 'var(--bg-surface)',
                                border: '1px solid var(--border)',
                                color: 'var(--text-secondary)'
                              }}
                            >
                              {role.features.length} Features
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          Department: {role.dept}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: currentIndustry.accentLight,
                          color: currentIndustry.color,
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}
                      >
                        {role.access}
                      </span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {role.count} Assigned
                      </span>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedRoleId(isExpanded ? null : role.id);
                        }}
                      >
                        <span>{isExpanded ? 'Hide' : 'View Features'}</span>
                        {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Features Panel */}
                  {isExpanded && hasFeatures && (
                    <div
                      style={{
                        padding: '16px 20px',
                        backgroundColor: 'var(--bg-surface)',
                        borderTop: '1px solid var(--border)'
                      }}
                    >
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Sparkles size={14} style={{ color: role.color || currentIndustry.color }} />
                        <span>Core Role Features & Permissions ({role.features.length})</span>
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                          gap: '8px 16px'
                        }}
                      >
                        {role.features.map((feat, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '8px',
                              fontSize: '0.78rem',
                              color: 'var(--text-main)',
                              lineHeight: 1.45
                            }}
                          >
                            <span style={{ color: '#10b981', fontWeight: 700, fontSize: '0.85rem' }}>✓</span>
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 4: Regulated Approval Queue (Financial / Professional Services) */}
      {activeTab === 'approvals' && (
        <div className="crm-card" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '18px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 4px 0', color: '#059669' }}>
                Regulated Actions & Human Authorization Queue
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                High-impact financial decisions, loan proposals & compliance terms requiring Relationship Manager sign-off.
              </p>
            </div>
            <span className="badge badge-qualified">Mandatory Regulatory Gate</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {approvalQueue.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: '18px',
                  borderRadius: 'var(--radius-md)',
                  border: item.status === 'Approved' ? '1px solid #10b981' : '1px solid var(--border)',
                  backgroundColor: item.status === 'Approved' ? 'rgba(16, 185, 129, 0.04)' : 'var(--bg-card)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>{item.customerName}</span>
                      <span className="badge" style={{ backgroundColor: '#059669', color: '#fff', fontSize: '0.68rem' }}>
                        {item.requestType}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Amount/Terms: <strong>{item.amount}</strong> • {item.riskGrade}
                    </div>
                  </div>

                  <div>
                    <StatusBadge status={item.status} />
                  </div>
                </div>

                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--bg-main)',
                    fontSize: '0.78rem',
                    color: 'var(--text-main)'
                  }}
                >
                  <strong>AI Screener Dossier:</strong> {item.aiSummary}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    Assigned: {item.assignedRM} • {item.submittedAt}
                  </span>

                  {item.status === 'Pending Approval' ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ color: '#ef4444', borderColor: '#ef4444' }}
                        onClick={() => rejectFinancialAction(item.id)}
                      >
                        <X size={13} />
                        <span>Reject / Return</span>
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ backgroundColor: '#059669', borderColor: '#059669' }}
                        onClick={() => approveFinancialAction(item.id)}
                      >
                        <Check size={13} />
                        <span>Authorize & Sign Term Sheet</span>
                      </button>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={14} /> Signed by {item.approvedBy || 'Anita Sharma'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
