import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { StatusBadge } from '../common/StatusBadge';
import { Users2, Shield, Plus, Search, MoreVertical, Check, UserPlus } from 'lucide-react';

export function UsersAndRolesView() {
  const { teamMembers, setActiveModal, currentUserRole, switchRole, mvpRoles, addNotification } = useCRM();
  const [activeSubTab, setActiveSubTab] = useState('roles'); // 'users' | 'roles'
  const [searchQuery, setSearchQuery] = useState('');
  const [userPage, setUserPage] = useState(1);

  const filteredUsers = teamMembers.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const rolesList = mvpRoles || [
    { name: 'Platform Super Admin', scope: 'Zenelait Team', desc: 'Manages SaaS platform itself, registered companies, limits, subscriptions & platform health.', boundaries: 'Audited support privacy: cannot routinely browse private tenant conversations.', permissions: ['Platform Root', 'Tenant Subscriptions', 'Usage Limits', 'Global Telemetry', 'Security Audit'] },
    { name: 'Company Owner / Company Admin', scope: 'Full Workspace', desc: 'Full workspace control, billing, user invites, CRM configurations, and AI settings.', boundaries: 'Restricted strictly to own company workspace.', permissions: ['All Records', 'AI Agent Builder', 'Billing & Plans', 'Team Management', 'Integrations'] },
    { name: 'Sales Manager', scope: 'Sales Operations', desc: 'Manage leads pipeline, assign SDRs, deal approvals, sales quota and team performance.', boundaries: 'No billing or global AI architecture access.', permissions: ['Pipeline Management', 'Lead Reassignment', 'Rep Monitoring', 'Quotations & Deals'] },
    { name: 'Customer Support Agent', scope: 'Support Operations', desc: 'Respond to customer inquiries, take over from AI, resolve tickets, and escalate difficult cases.', boundaries: 'Restricted from billing & AI training configs.', permissions: ['Omnichannel Inbox', 'Live AI Takeover', 'Ticket Status', 'Internal Notes', 'Case Escalation'] },
    { name: 'Sales Representative', scope: 'Lead Management', desc: 'Handle assigned leads, update lead status, log notes, schedule follow-ups, and review AI history.', boundaries: 'View assigned records only, cannot alter settings.', permissions: ['Assigned Leads', 'Status Updates', 'Notes & Follow-ups', 'AI Chat History', 'Calendar Slots'] },
    { name: 'Analyst / Viewer', scope: 'Read-only Access', desc: 'Access analytics dashboards, conversion reports, lead trends, and export permitted data.', boundaries: 'Read-Only Mode: cannot modify records or configure AI.', permissions: ['Read-Only Dashboards', 'Conversion Trends', 'BI Reports', 'CSV/Excel Export'] }
  ];

  return (
    <div className="users-roles-view">
      <div className="page-title-row">
        <div className="page-title-group">
          <h1>Users & Roles</h1>
          <p>Manage workspace members, assign role-based permissions, and track active sessions</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setActiveModal('inviteMember')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <UserPlus size={16} />
          <span>+ Add User</span>
        </button>
      </div>

      {/* Sub Tabs: Users | Roles & Permissions */}
      <div className="crm-card" style={{ marginBottom: '20px', padding: '12px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className={`btn btn-sm ${activeSubTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveSubTab('users')}
            >
              Users ({filteredUsers.length})
            </button>
            <button
              className={`btn btn-sm ${activeSubTab === 'roles' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveSubTab('roles')}
            >
              Roles & Permissions ({rolesList.length})
            </button>
          </div>

          {activeSubTab === 'users' && (
            <div className="search-bar-wrapper" style={{ width: '260px' }}>
              <Search size={14} />
              <input
                type="text"
                placeholder="Search users by name, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      {/* TAB 1: Users Table */}
      {activeSubTab === 'users' && (
        <div className="crm-card">
          <div className="table-responsive">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          className="avatar avatar-sm"
                          style={{ backgroundColor: '#2563eb', color: '#fff', fontWeight: 700 }}
                        >
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{user.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{user.email}</td>
                    <td>
                      <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{user.department}</td>
                    <td>
                      <StatusBadge status={user.status} />
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{user.lastLogin || 'Oct 3, 2026'}</td>
                    <td>
                      <button
                        className="btn btn-secondary btn-icon btn-sm"
                        onClick={() => addNotification && addNotification({
                          type: 'info',
                          title: `Access profile for ${user.name} (${user.role})`
                        })}
                      >
                        <MoreVertical size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination bar */}
          <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Showing 1 - {filteredUsers.length} of {teamMembers.length} users</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[1, 2, 3].map(p => (
                <button
                  key={p}
                  className={`btn btn-xs ${userPage === p ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ minWidth: 28 }}
                  onClick={() => setUserPage(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Roles & Permissions Matrix */}
      {activeSubTab === 'roles' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
          {rolesList.map((r, i) => {
            const isCurrent = currentUserRole === r.name;
            return (
              <div
                key={i}
                className="crm-card"
                style={{
                  padding: '24px',
                  border: isCurrent ? '2px solid var(--primary)' : '1px solid var(--border)',
                  backgroundColor: isCurrent ? 'var(--bg-card)' : 'var(--bg-surface)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px', gap: '10px' }}>
                    <div>
                      <span className="badge badge-secondary" style={{ fontSize: '0.68rem', marginBottom: '4px', display: 'inline-block' }}>
                        {r.scope || 'Platform Scope'}
                      </span>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                        {r.name}
                      </h3>
                    </div>
                    <span className={`badge ${isCurrent ? 'badge-primary' : 'badge-qualified'}`} style={{ fontSize: '0.7rem' }}>
                      {isCurrent ? '● Active Session' : (r.badge || 'Configured')}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', minHeight: '44px', margin: '0 0 12px 0', lineHeight: 1.45 }}>
                    {r.desc || r.description}
                  </p>

                  {/* Boundaries / Guardrails box */}
                  {r.boundaries && (
                    <div
                      style={{
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: isCurrent ? 'rgba(37, 99, 235, 0.08)' : 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        fontSize: '0.74rem',
                        color: 'var(--text-secondary)',
                        marginBottom: '14px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '6px'
                      }}
                    >
                      <Shield size={13} style={{ color: r.color || 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
                      <span><strong>Access Boundary:</strong> {r.boundaries}</span>
                    </div>
                  )}

                  {/* Permissions tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                    {(r.permissions || []).map((p, pIdx) => (
                      <span
                        key={pIdx}
                        className="badge"
                        style={{
                          backgroundColor: 'var(--bg-card)',
                          border: '1px solid var(--border)',
                          fontSize: '0.68rem',
                          color: 'var(--text-main)'
                        }}
                      >
                        ✓ {p}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  className={`btn btn-sm ${isCurrent ? 'btn-secondary' : 'btn-primary'}`}
                  style={{ width: '100%', fontSize: '0.8rem', fontWeight: 600 }}
                  onClick={() => switchRole(r.name)}
                  disabled={isCurrent}
                >
                  {isCurrent ? '✓ Currently Logged In As This Role' : `Switch Active Session to ${r.name}`}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
