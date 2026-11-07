import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { StatusBadge } from '../common/StatusBadge';
import { ChannelBadge } from '../common/ChannelBadge';
import {
  Search,
  Plus,
  Filter,
  Eye,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Shield,
  Download,
  UserCheck,
  Target,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export function LeadsList() {
  const {
    leads,
    navigateTo,
    setActiveModal,
    currentUserRole,
    currentRolePermissions,
    reassignLead,
    updateLeadStatus,
    teamMembers,
    autoQualifyAllInboundLeads,
    aiEmployeesList
  } = useCRM();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [onlyMyLeads, setOnlyMyLeads] = useState(false);
  const [activeReassignLeadId, setActiveReassignLeadId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const isSalesManager = currentRolePermissions?.isSalesManager || currentUserRole.includes('Sales Manager');
  const isSalesRepresentative = currentRolePermissions?.isSalesRepresentative || currentUserRole.includes('Executive') || currentUserRole.includes('Representative');
  const isAnalyst = currentRolePermissions?.isReadOnly;

  const filteredLeads = leads.filter(lead => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
    const matchesSource = sourceFilter === 'All' || lead.source === sourceFilter;
    const matchesMyLeads = !onlyMyLeads || lead.assignedTo === 'Rahul Kumar' || lead.assignedTo === 'Aarav Patel';

    return matchesSearch && matchesStatus && matchesSource && matchesMyLeads;
  });

  const exportLeadsCSV = () => {
    const headers = 'ID,Name,Email,Company,Phone,Source,Status,Score,AssignedTo\n';
    const rows = filteredLeads.map(l => `${l.id},"${l.name}","${l.email}","${l.company}","${l.phone}","${l.source}","${l.status}",${l.score || 0},"${l.assignedTo || 'Unassigned'}"`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Zenelait_Leads_Report_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-title-row">
        <div className="page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h1>Leads</h1>
            <span
              className="badge"
              style={{
                backgroundColor: isSalesManager ? 'rgba(2, 132, 199, 0.12)' :
                  isSalesRepresentative ? 'rgba(245, 158, 11, 0.12)' :
                  isAnalyst ? 'rgba(100, 116, 139, 0.12)' :
                  'rgba(37, 99, 235, 0.12)',
                color: isSalesManager ? '#0284c7' :
                  isSalesRepresentative ? '#f59e0b' :
                  isAnalyst ? '#64748b' :
                  '#2563eb',
                fontWeight: 700,
                fontSize: '0.72rem'
              }}
            >
              Role: {currentUserRole}
            </span>
          </div>
          <p>Track, qualify, and manage your inbound sales pipeline</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className="btn btn-secondary"
            onClick={exportLeadsCSV}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Download CSV Report"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>

          {!isAnalyst && (
            <button
              className="btn btn-primary"
              onClick={() => setActiveModal('addLead')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={16} />
              <span>Add Lead</span>
            </button>
          )}
        </div>
      </div>

      {/* Role-Specific Banner Alert */}
      {isSalesManager && (
        <div
          className="crm-card"
          style={{
            padding: '12px 18px',
            marginBottom: '16px',
            backgroundColor: 'rgba(2, 132, 199, 0.06)',
            border: '1px solid rgba(2, 132, 199, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Target size={18} style={{ color: '#0284c7' }} />
            <div>
              <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>Sales Manager Operations Enabled</strong>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>You have authority to reassign leads, audit SDR performance, and approve deal terms.</div>
            </div>
          </div>
          <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>Manager Lead Control Active</span>
        </div>
      )}

      {isSalesRepresentative && (
        <div
          className="crm-card"
          style={{
            padding: '12px 18px',
            marginBottom: '16px',
            backgroundColor: 'rgba(245, 158, 11, 0.06)',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UserCheck size={18} style={{ color: '#f59e0b' }} />
            <div>
              <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>Sales Representative Workspace</strong>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>Focus on your assigned high-intent prospects and execute follow-ups after AI handover.</div>
            </div>
          </div>
          <button
            className={`btn btn-sm ${onlyMyLeads ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setOnlyMyLeads(!onlyMyLeads)}
          >
            {onlyMyLeads ? '✓ Viewing My Assigned Leads' : 'Filter My Leads Only'}
          </button>
        </div>
      )}

      {isAnalyst && (
        <div
          className="crm-card"
          style={{
            padding: '12px 18px',
            marginBottom: '16px',
            backgroundColor: 'rgba(100, 116, 139, 0.08)',
            border: '1px solid rgba(100, 116, 139, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <Eye size={18} style={{ color: '#64748b' }} />
          <div>
            <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>Analyst / Viewer Mode (Read-Only)</strong>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>You have read-only access to analyze conversion metrics, lead source attribution, and export reports. Data modification is restricted.</div>
          </div>
        </div>
      )}

      {/* AI Inbound Qualification Workload Reducer Banner */}
      <div
        className="crm-card"
        style={{
          padding: '14px 20px',
          marginBottom: '16px',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3b82f6',
              fontSize: '1.2rem'
            }}
          >
            {aiEmployeesList?.find(e => e.roleCategory === 'SALES_SDR')?.avatar || '🤖'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <strong style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>
                {aiEmployeesList?.find(e => e.roleCategory === 'SALES_SDR')?.name || 'AI Inbound SDR'} • Autonomous Lead Qualification
              </strong>
              <span className="badge badge-primary" style={{ fontSize: '0.68rem' }}>24/7 Active Shift</span>
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Reduces manual rep workload by evaluating incoming website inquiries against BANT criteria, calculating intent scores, and advancing deals.
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => autoQualifyAllInboundLeads()}
          className="btn btn-primary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
        >
          <Sparkles size={14} />
          <span>⚡ Auto-Qualify & Enrich All Inbound Leads</span>
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="crm-card" style={{ marginBottom: '20px', padding: '14px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px', flexWrap: 'wrap' }}>
            <div className="search-bar-wrapper" style={{ maxWidth: '320px' }}>
              <Search size={16} />
              <input
                type="text"
                className="search-bar-input"
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="form-control"
              style={{ width: '150px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Qualified">Qualified</option>
              <option value="Contacted">Contacted</option>
              <option value="Proposal">Proposal</option>
              <option value="In Progress">In Progress</option>
              <option value="New">New</option>
            </select>

            <select
              className="form-control"
              style={{ width: '150px' }}
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
            >
              <option value="All">All Sources</option>
              <option value="Website">Website</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Email">Email</option>
              <option value="Instagram">Instagram</option>
              <option value="Referral">Referral</option>
            </select>
          </div>

          <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            Showing <strong>{filteredLeads.length}</strong> leads
          </div>
        </div>
      </div>

      {/* Leads Table Card */}
      <div className="crm-card">
        <div className="table-responsive">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Source</th>
                <th>Status</th>
                <th>Score</th>
                <th>Assigned To</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => navigateTo('lead-details', lead.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="avatar avatar-sm">
                        {lead.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{lead.name}</div>
                        <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>{lead.company}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{lead.email}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{lead.phone}</td>
                  <td>
                    <ChannelBadge channel={lead.source} />
                  </td>
                  <td>
                    <StatusBadge status={lead.status} />
                  </td>
                  <td>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: lead.score >= 80 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: lead.score >= 80 ? '#10b981' : '#f59e0b',
                        fontWeight: 700,
                        fontSize: '0.8rem'
                      }}
                    >
                      {lead.score}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.825rem' }} onClick={(e) => e.stopPropagation()}>
                      {isSalesManager ? (
                        <select
                          className="form-control"
                          style={{ padding: '3px 8px', fontSize: '0.75rem', height: '28px', maxWidth: '140px' }}
                          value={lead.assignedTo}
                          onChange={(e) => reassignLead(lead.id, e.target.value)}
                        >
                          <option value="Unassigned">Unassigned</option>
                          <option value="Rahul Kumar">Rahul Kumar (Sales Mgr)</option>
                          <option value="Sneha Iyer">Sneha Iyer (Sales Exec)</option>
                          <option value="Aarav Patel">Aarav Patel (Sales Rep)</option>
                          <option value="Vikram Singh">Vikram Singh (AE)</option>
                        </select>
                      ) : (
                        <span style={{ color: lead.assignedTo === 'Unassigned' ? 'var(--text-muted)' : 'var(--text-main)', fontWeight: 500 }}>
                          {lead.assignedTo}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                      <button
                        className="btn btn-secondary btn-icon btn-sm"
                        onClick={() => navigateTo('lead-details', lead.id)}
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>

                      {isSalesRepresentative && !isAnalyst && (
                        <select
                          className="form-control"
                          style={{ padding: '2px 6px', fontSize: '0.72rem', height: '26px', maxWidth: '105px' }}
                          value={lead.status}
                          onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Qualified">Qualified</option>
                          <option value="Proposal">Proposal</option>
                          <option value="In Progress">In Progress</option>
                        </select>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              className="btn btn-secondary btn-icon btn-sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={14} />
            </button>
            {[1, 2, 3, 4, 5].map(pageNum => (
              <button
                key={pageNum}
                className={`btn btn-sm ${currentPage === pageNum ? 'btn-primary' : 'btn-secondary'}`}
                style={{ minWidth: 32 }}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            ))}
            <button
              className="btn btn-secondary btn-icon btn-sm"
              onClick={() => setCurrentPage(p => Math.min(5, p + 1))}
              disabled={currentPage === 5}
            >
              <ChevronRight size={14} />
            </button>
          </div>
          <span style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
            Page {currentPage} of 5 • Showing {filteredLeads.length} leads
          </span>
        </div>
      </div>
    </div>
  );
}
