import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { StatusBadge } from '../common/StatusBadge';
import { ChannelBadge } from '../common/ChannelBadge';
import {
  ArrowLeft,
  UserCheck,
  FileText,
  Calendar,
  Sparkles,
  Zap,
  Building,
  Mail,
  Phone,
  Clock,
  Send,
  Plus
} from 'lucide-react';

export function LeadDetails() {
  const { selectedLeadId, leads, navigateTo, setActiveModal, addCustomer, addAppointment } = useCRM();
  const [activeTab, setActiveTab] = useState('overview');
  const [newNote, setNewNote] = useState('');
  const [notes, setNotes] = useState([
    { id: '1', author: 'Rahul Kumar', text: 'Spoke over phone. Client needs omni-channel automated AI workflows.', time: '1 hour ago' }
  ]);

  const lead = leads.find(l => l.id === selectedLeadId) || leads[0];

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setNotes(prev => [{ id: Date.now().toString(), author: 'Rahul Kumar', text: newNote, time: 'Just now' }, ...prev]);
    setNewNote('');
  };

  const handleConvertToCustomer = () => {
    addCustomer({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      segment: 'Enterprise',
      mrr: '$1,200/mo'
    });
    alert(`${lead.name} has been successfully converted to a Customer!`);
    navigateTo('customers');
  };

  return (
    <div>
      {/* Top Breadcrumb navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '0.825rem' }}>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => navigateTo('leads')}
          style={{ padding: '4px 8px' }}
        >
          <ArrowLeft size={14} />
          <span>Back to Leads</span>
        </button>
        <span style={{ color: 'var(--text-muted)' }}>/</span>
        <span style={{ color: 'var(--text-secondary)' }}>Lead Details</span>
        <span style={{ color: 'var(--text-muted)' }}>/</span>
        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{lead.name}</span>
      </div>

      {/* Main Profile Header Banner Card */}
      <div className="crm-card" style={{ marginBottom: '24px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="avatar avatar-lg">
              {lead.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h2 style={{ fontSize: '1.4rem' }}>{lead.name}</h2>
                <StatusBadge status={lead.status} />
                <span
                  style={{
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    color: '#10b981',
                    fontSize: '0.8rem',
                    fontWeight: 700
                  }}
                >
                  Score: {lead.score}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px', color: 'var(--text-secondary)', fontSize: '0.825rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Mail size={14} /> {lead.email}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Phone size={14} /> {lead.phone}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Building size={14} /> {lead.company}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveModal('inviteMember')}>
              <UserCheck size={14} />
              <span>Assign</span>
            </button>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveModal('scheduleAppointment')}
            >
              <Calendar size={14} />
              <span>Schedule Follow-up</span>
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleConvertToCustomer}
            >
              <Zap size={14} />
              <span>Convert to Customer</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '24px', borderTop: '1px solid var(--border)', marginTop: '20px', paddingTop: '16px' }}>
          {['overview', 'conversations', 'activities', 'documents'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '6px 0',
                borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
                color: activeTab === tab ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === tab ? 600 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.2s'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '20px' }}>
          {/* Left Column: Lead Info & Notes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Lead Information Card */}
            <div className="crm-card">
              <div className="crm-card-header">
                <div className="crm-card-title">
                  <UserCheck size={18} style={{ color: 'var(--primary)' }} />
                  <span>Lead Information</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Company</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{lead.company}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Designation</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{lead.designation}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Company Size</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{lead.companySize}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Source</span>
                  <ChannelBadge channel={lead.source} />
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Assigned Rep</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{lead.assignedTo} ({lead.assigneeRole})</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Created At</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{lead.createdAt}</span>
                </div>
              </div>
            </div>

            {/* Notes & Activity Log */}
            <div className="crm-card">
              <div className="crm-card-header">
                <div className="crm-card-title">
                  <FileText size={18} style={{ color: 'var(--primary)' }} />
                  <span>Notes & Comments</span>
                </div>
              </div>

              <form onSubmit={handleAddNote} style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Add a quick note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
                <button type="submit" className="btn btn-primary btn-sm">
                  <Send size={14} />
                  <span>Post</span>
                </button>
              </form>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {notes.map((note) => (
                  <div key={note.id} style={{ padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{note.author}</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{note.time}</span>
                    </div>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: 0 }}>{note.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Score Breakdown & AI Insights */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Lead Score Breakdown */}
            <div className="crm-card">
              <div className="crm-card-header">
                <div className="crm-card-title">
                  <Zap size={18} style={{ color: '#10b981' }} />
                  <span>Lead Score Breakdown</span>
                </div>
                <span style={{ fontWeight: 700, color: '#10b981', fontSize: '1.1rem' }}>{lead.score} / 100</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.825rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Company Size (50-200)</span>
                  <span style={{ fontWeight: 600, color: '#10b981' }}>+20</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.825rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Budget Provided ($5k+)</span>
                  <span style={{ fontWeight: 600, color: '#10b981' }}>+25</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.825rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Timeline (Within 1 Month)</span>
                  <span style={{ fontWeight: 600, color: '#10b981' }}>+15</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.825rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Website Visits (4+ pages)</span>
                  <span style={{ fontWeight: 600, color: '#10b981' }}>+12</span>
                </div>
              </div>
            </div>

            {/* AI Summary Card */}
            <div className="crm-card" style={{ background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
              <div className="crm-card-header">
                <div className="crm-card-title">
                  <Sparkles size={18} style={{ color: 'var(--primary)' }} />
                  <span>AI Summary</span>
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {lead.aiSummary}
              </p>
            </div>

            {/* Recommended Action Card */}
            <div className="crm-card" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(6, 182, 212, 0.08) 100%)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
              <div className="crm-card-header">
                <div className="crm-card-title">
                  <Zap size={18} style={{ color: '#10b981' }} />
                  <span>Recommended Action</span>
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
                {lead.recommendedAction}
              </p>
              <button
                className="btn btn-primary btn-sm"
                style={{ width: '100%' }}
                onClick={() => setActiveModal('scheduleAppointment')}
              >
                Schedule Product Demo
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'conversations' && (
        <div className="crm-card" style={{ padding: '30px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>View full omnichannel message history with {lead.name}</p>
          <button className="btn btn-primary" onClick={() => navigateTo('conversations')}>
            Open Omnichannel Inbox
          </button>
        </div>
      )}

      {activeTab === 'activities' && (
        <div className="crm-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#3b82f6', marginTop: 4 }} />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Inbound Lead Captured via Website Bot</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sep 28, 2026 10:24 AM</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#10b981', marginTop: 4 }} />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>AI Lead Qualification Completed (Score: 92)</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sep 28, 2026 10:26 AM</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="crm-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h4 style={{ fontSize: '0.95rem' }}>Attached Documents</h4>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveModal('uploadDoc')}>
              <Plus size={14} /> Upload Doc
            </button>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            📄 Enterprise Proposal v1.pdf (Sent yesterday)
          </div>
        </div>
      )}
    </div>
  );
}
