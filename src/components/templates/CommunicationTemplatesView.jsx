import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { FileText, Plus, Mail, MessageSquare, Phone, Edit, Check, Eye, Trash2, X, Sparkles } from 'lucide-react';

export function CommunicationTemplatesView() {
  const { templates, addTemplate, updateTemplate, deleteTemplate, addNotification } = useCRM();
  const [activeChannel, setActiveChannel] = useState('All'); // 'All' | 'Email' | 'WhatsApp' | 'SMS'

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    type: 'Email',
    category: 'Lead Qualification',
    subject: '',
    preview: '',
    status: 'Active'
  });

  const filteredTemplates = templates.filter(
    (t) => activeChannel === 'All' || t.type === activeChannel
  );

  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setFormData({
      title: '',
      type: activeChannel === 'All' ? 'Email' : activeChannel,
      category: 'Lead Qualification',
      subject: '',
      preview: '',
      status: 'Active'
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (tmpl) => {
    setEditingTemplate(tmpl);
    setFormData({
      title: tmpl.title || '',
      type: tmpl.type || 'Email',
      category: tmpl.category || 'General',
      subject: tmpl.subject || '',
      preview: tmpl.preview || tmpl.content || '',
      status: tmpl.status || 'Active'
    });
    setIsFormModalOpen(true);
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingTemplate) {
      updateTemplate(editingTemplate.id, {
        title: formData.title,
        type: formData.type,
        category: formData.category,
        subject: formData.subject,
        preview: formData.preview,
        status: formData.status
      });
      addNotification?.({
        type: 'system',
        title: `Template updated: ${formData.title}`,
        category: 'Templates'
      });
    } else {
      addTemplate({
        title: formData.title,
        type: formData.type,
        category: formData.category,
        subject: formData.subject,
        preview: formData.preview,
        status: formData.status
      });
      addNotification?.({
        type: 'system',
        title: `Template created: ${formData.title}`,
        category: 'Templates'
      });
    }

    setIsFormModalOpen(false);
    setEditingTemplate(null);
  };

  const handleDelete = (tmpl) => {
    if (window.confirm(`Are you sure you want to delete template "${tmpl.title}"?`)) {
      deleteTemplate(tmpl.id);
      addNotification?.({
        type: 'warning',
        title: `Template deleted: ${tmpl.title}`,
        category: 'Templates'
      });
    }
  };

  const insertVariable = (variable) => {
    setFormData(prev => ({
      ...prev,
      preview: (prev.preview ? prev.preview + ' ' : '') + variable
    }));
  };

  return (
    <div className="communication-templates-view">
      <div className="page-title-row">
        <div className="page-title-group">
          <h1>Communication Templates</h1>
          <p>Pre-approved message templates for Email, WhatsApp, and SMS automated sequences</p>
        </div>

        <button 
          className="btn btn-primary" 
          onClick={handleOpenCreate}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={16} />
          <span>+ Create Template</span>
        </button>
      </div>

      {/* Channel Filters */}
      <div className="crm-card" style={{ marginBottom: '20px', padding: '10px 18px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['All', 'Email', 'WhatsApp', 'SMS'].map((ch) => (
            <button
              key={ch}
              className={`btn btn-sm ${activeChannel === ch ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveChannel(ch)}
            >
              {ch === 'All' ? 'All Channels' : `${ch} Templates`}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Table Card */}
      <div className="crm-card">
        <div className="table-responsive">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Template Title</th>
                <th>Channel</th>
                <th>Category</th>
                <th>Subject / Header</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTemplates.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    No templates found for {activeChannel}. Click <strong>+ Create Template</strong> to add one.
                  </td>
                </tr>
              ) : (
                filteredTemplates.map((tmpl) => (
                  <tr key={tmpl.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                        <span style={{ fontWeight: 600 }}>{tmpl.title}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${tmpl.type === 'Email' ? 'badge-primary' : tmpl.type === 'WhatsApp' ? 'badge-qualified' : 'badge-warning'}`}>
                        {tmpl.type}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{tmpl.category}</td>
                    <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-main)' }}>
                      {tmpl.subject || tmpl.preview || '—'}
                    </td>
                    <td>
                      <span className={`badge ${tmpl.status === 'Active' ? 'badge-qualified' : 'badge-secondary'}`}>
                        {tmpl.status || 'Active'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button 
                          className="btn btn-secondary btn-xs" 
                          title="Preview Template"
                          onClick={() => setPreviewTemplate(tmpl)}
                        >
                          <Eye size={13} />
                        </button>
                        <button 
                          className="btn btn-secondary btn-xs" 
                          title="Edit Template"
                          onClick={() => handleOpenEdit(tmpl)}
                        >
                          <Edit size={13} />
                        </button>
                        <button 
                          className="btn btn-secondary btn-xs" 
                          title="Delete Template"
                          style={{ color: '#ef4444' }}
                          onClick={() => handleDelete(tmpl)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT TEMPLATE MODAL */}
      {isFormModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsFormModalOpen(false)}>
          <div className="crm-modal" style={{ maxWidth: '580px', width: '95%' }} onClick={(e) => e.stopPropagation()}>
            <div className="crm-modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <FileText size={18} style={{ color: 'var(--primary)' }} />
                  {editingTemplate ? 'Edit Communication Template' : 'Create Communication Template'}
                </h2>
                <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Configure dispatch channels, subjects, and dynamic smart personalization variables.
                </p>
              </div>
              <button type="button" className="btn-close" onClick={() => setIsFormModalOpen(false)} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitForm}>
              <div className="crm-modal-body" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: 'calc(85vh - 120px)', overflowY: 'auto' }}>
                
                <div>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px' }}>Template Title *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. VIP Demo Follow-up Sequence"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                    style={{ height: '38px', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  <div>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px' }}>Channel *</label>
                    <select
                      className="form-select"
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      style={{ height: '38px', fontSize: '0.85rem' }}
                    >
                      <option value="Email">Email</option>
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="SMS">SMS</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px' }}>Category *</label>
                    <select
                      className="form-select"
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      style={{ height: '38px', fontSize: '0.85rem' }}
                    >
                      <option value="Lead Qualification">Lead Qualification</option>
                      <option value="Follow-up">Follow-up</option>
                      <option value="Meeting Confirmation">Meeting Confirmation</option>
                      <option value="Proposal & Pricing">Proposal & Pricing</option>
                      <option value="Onboarding">Onboarding</option>
                      <option value="Support">Support</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px' }}>
                    {formData.type === 'Email' ? 'Email Subject Line *' : 'Header / Summary Line'}
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={formData.type === 'Email' ? 'e.g. Your Custom Zenelait AI Architecture Blueprint' : 'e.g. Booking Confirmation #{{bookingId}}'}
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    style={{ height: '38px', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', margin: 0 }}>
                      Message Content / Body *
                    </label>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {['{{firstName}}', '{{company}}', '{{link}}'].map((v) => (
                        <button
                          key={v}
                          type="button"
                          className="btn btn-secondary btn-xs"
                          style={{ fontSize: '0.68rem', padding: '2px 6px' }}
                          onClick={() => insertVariable(v)}
                        >
                          + {v}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    className="form-input"
                    rows={5}
                    placeholder="Type the message template body. Use variables like {{firstName}} for dynamic customer personalization..."
                    value={formData.preview}
                    onChange={(e) => setFormData(prev => ({ ...prev, preview: e.target.value }))}
                    required
                    style={{ fontSize: '0.85rem', resize: 'vertical', lineHeight: 1.5 }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', margin: 0 }}>Template Status:</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <input
                      type="radio"
                      name="status"
                      value="Active"
                      checked={formData.status === 'Active'}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    />
                    Active
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <input
                      type="radio"
                      name="status"
                      value="Draft"
                      checked={formData.status === 'Draft'}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    />
                    Draft
                  </label>
                </div>

              </div>

              <div className="crm-modal-footer" style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsFormModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                  <Check size={16} /> {editingTemplate ? 'Save Changes' : 'Create Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW TEMPLATE MODAL */}
      {previewTemplate && (
        <div className="modal-backdrop" onClick={() => setPreviewTemplate(null)}>
          <div className="crm-modal" style={{ maxWidth: '520px', width: '95%' }} onClick={(e) => e.stopPropagation()}>
            <div className="crm-modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <Eye size={18} style={{ color: 'var(--primary)' }} />
                  Template Preview: {previewTemplate.title}
                </h2>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <span className={`badge ${previewTemplate.type === 'Email' ? 'badge-primary' : previewTemplate.type === 'WhatsApp' ? 'badge-qualified' : 'badge-warning'}`}>
                    {previewTemplate.type}
                  </span>
                  <span className="badge badge-secondary">{previewTemplate.category}</span>
                </div>
              </div>
              <button type="button" className="btn-close" onClick={() => setPreviewTemplate(null)} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <div className="crm-modal-body" style={{ padding: '20px' }}>
              {previewTemplate.subject && (
                <div style={{ marginBottom: '14px', padding: '10px 14px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Subject:</span>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>{previewTemplate.subject}</div>
                </div>
              )}

              <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: previewTemplate.type === 'WhatsApp' ? '#064e3b15' : 'var(--bg-main)', border: '1px solid var(--border)', whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                {previewTemplate.preview || previewTemplate.content || 'No message content defined.'}
              </div>
            </div>

            <div className="crm-modal-footer" style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setPreviewTemplate(null)}>
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
