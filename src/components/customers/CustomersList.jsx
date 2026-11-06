import React, { useState, useEffect, useRef } from 'react';
import { useCRM } from '../../context/CRMContext';
import { StatusBadge } from '../common/StatusBadge';
import { Search, Plus, MoreVertical, Eye, Edit, Trash2, X, Check, Building2, Mail, Phone, DollarSign } from 'lucide-react';

export function CustomersList() {
  const { customers, addCustomer, updateCustomer, deleteCustomer, addNotification, currentTenant } = useCRM();
  const [searchTerm, setSearchTerm] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('All');

  // Popover state
  const [activeMenuId, setActiveMenuId] = useState(null);
  const menuRef = useRef(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  // Customer Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    segment: 'Enterprise',
    plan: 'Growth Plan',
    mrr: '₹35,000/mo',
    status: 'Active'
  });

  // Close popup menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCustomers = customers.filter(c => {
    const matchesSearch =
      (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.company && c.company.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSegment = segmentFilter === 'All' || c.segment === segmentFilter;
    return matchesSearch && matchesSegment;
  });

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: currentTenant?.name || '',
      segment: 'Enterprise',
      plan: 'Growth Plan',
      mrr: '₹35,000/mo',
      status: 'Active'
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (cust) => {
    setEditingCustomer(cust);
    setFormData({
      name: cust.name || '',
      email: cust.email || '',
      phone: cust.phone || '',
      company: cust.company || '',
      segment: cust.segment || 'Enterprise',
      plan: cust.plan || 'Growth Plan',
      mrr: cust.mrr || '₹35,000/mo',
      status: cust.status || 'Active'
    });
    setActiveMenuId(null);
  };

  const handleDelete = (cust) => {
    setActiveMenuId(null);
    if (window.confirm(`Are you sure you want to remove customer "${cust.name}"?`)) {
      deleteCustomer(cust.id);
      addNotification?.({
        type: 'warning',
        title: `Customer removed: ${cust.name}`,
        category: 'CRM'
      });
    }
  };

  const handleSaveAdd = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    addCustomer({
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      company: formData.company.trim() || 'Enterprise Client',
      segment: formData.segment,
      plan: formData.plan,
      mrr: formData.mrr,
      status: formData.status
    });

    addNotification?.({
      type: 'crm',
      title: `Customer created: ${formData.name.trim()}`,
      category: 'CRM'
    });

    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingCustomer || !formData.name.trim()) return;

    updateCustomer(editingCustomer.id, {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      company: formData.company.trim(),
      segment: formData.segment,
      plan: formData.plan,
      mrr: formData.mrr,
      status: formData.status
    });

    addNotification?.({
      type: 'crm',
      title: `Customer updated: ${formData.name.trim()}`,
      category: 'CRM'
    });

    setEditingCustomer(null);
  };

  return (
    <div>
      <div className="page-title-row">
        <div className="page-title-group">
          <h1>Customers</h1>
          <p>Manage enterprise accounts, active subscriptions, and customer health</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleOpenAdd}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={16} />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="crm-card" style={{ marginBottom: '20px', padding: '14px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
            <div className="search-bar-wrapper" style={{ maxWidth: '320px' }}>
              <Search size={16} />
              <input
                type="text"
                className="search-bar-input"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="form-select"
              style={{ width: '160px', height: '38px', fontSize: '0.85rem' }}
              value={segmentFilter}
              onChange={(e) => setSegmentFilter(e.target.value)}
            >
              <option value="All">All Segments</option>
              <option value="Enterprise">Enterprise</option>
              <option value="SMB">SMB</option>
              <option value="Startup">Startup</option>
            </select>
          </div>

          <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            Showing <strong>{filteredCustomers.length}</strong> active customers
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="crm-card">
        <div className="table-responsive">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Company</th>
                <th>Segment</th>
                <th>MRR / Plan</th>
                <th>Last Contact</th>
                <th style={{ width: 80, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    No customers found matching your criteria. Click <strong>Add Customer</strong> to create one.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const isMenuOpen = activeMenuId === cust.id;

                  return (
                    <tr key={cust.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div className="avatar avatar-sm" style={{ fontWeight: 700, backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                            {cust.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{cust.name}</div>
                            {cust.plan && (
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{cust.plan}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{cust.email || '—'}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{cust.phone || '—'}</td>
                      <td style={{ color: 'var(--text-main)', fontWeight: 500 }}>{cust.company || '—'}</td>
                      <td>
                        <StatusBadge status={cust.segment || 'Enterprise'} />
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{cust.mrr}</span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{cust.lastContact || 'Recently'}</td>
                      <td style={{ textAlign: 'center', position: 'relative' }}>
                        <div style={{ display: 'inline-block' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-icon btn-sm"
                            title="Customer Actions"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(isMenuOpen ? null : cust.id);
                            }}
                            style={{
                              backgroundColor: isMenuOpen ? 'var(--bg-surface)' : undefined,
                              borderColor: isMenuOpen ? 'var(--primary)' : undefined
                            }}
                          >
                            <MoreVertical size={14} />
                          </button>

                          {/* Action Dropdown Menu */}
                          {isMenuOpen && (
                            <div
                              ref={menuRef}
                              style={{
                                position: 'absolute',
                                right: '10px',
                                top: '38px',
                                width: '160px',
                                backgroundColor: 'var(--bg-card)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-md)',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.22)',
                                zIndex: 100,
                                padding: '6px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '2px',
                                textAlign: 'left'
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                className="btn btn-ghost btn-sm"
                                style={{
                                  width: '100%',
                                  justifyContent: 'flex-start',
                                  gap: '8px',
                                  fontSize: '0.82rem',
                                  padding: '8px 10px',
                                  color: 'var(--text-main)',
                                  borderRadius: 'var(--radius-sm)'
                                }}
                                onClick={() => handleOpenEdit(cust)}
                              >
                                <Edit size={14} style={{ color: 'var(--primary)' }} />
                                <span>Edit Customer</span>
                              </button>

                              <button
                                type="button"
                                className="btn btn-ghost btn-sm"
                                style={{
                                  width: '100%',
                                  justifyContent: 'flex-start',
                                  gap: '8px',
                                  fontSize: '0.82rem',
                                  padding: '8px 10px',
                                  color: '#ef4444',
                                  borderRadius: 'var(--radius-sm)'
                                }}
                                onClick={() => handleDelete(cust)}
                              >
                                <Trash2 size={14} />
                                <span>Delete Customer</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD CUSTOMER MODAL */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="crm-modal" style={{ maxWidth: '540px', width: '95%' }} onClick={(e) => e.stopPropagation()}>
            <div className="crm-modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <Building2 size={18} style={{ color: 'var(--primary)' }} />
                  Add Enterprise Customer
                </h2>
                <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Register a customer record into your isolated company database.
                </p>
              </div>
              <button type="button" className="btn-close" onClick={() => setIsAddModalOpen(false)} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAdd}>
              <div className="crm-modal-body" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: 'calc(85vh - 120px)', overflowY: 'auto' }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px' }}>Customer Contact Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Vikram Malhotra"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    style={{ height: '38px', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  <div>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px' }}>Email Address *</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="e.g. vikram@malhotratech.com"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                      style={{ height: '38px', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px' }}>Phone Number</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="e.g. +91 98200 11223"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      style={{ height: '38px', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px' }}>Company / Organization *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Malhotra Technologies Pvt Ltd"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    required
                    style={{ height: '38px', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  <div>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px' }}>Segment</label>
                    <select
                      className="form-select"
                      value={formData.segment}
                      onChange={(e) => setFormData(prev => ({ ...prev, segment: e.target.value }))}
                      style={{ height: '38px', fontSize: '0.85rem' }}
                    >
                      <option value="Enterprise">Enterprise</option>
                      <option value="SMB">SMB</option>
                      <option value="Startup">Startup</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px' }}>Plan</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Growth Plan"
                      value={formData.plan}
                      onChange={(e) => setFormData(prev => ({ ...prev, plan: e.target.value }))}
                      style={{ height: '38px', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px' }}>MRR</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="₹35,000/mo"
                      value={formData.mrr}
                      onChange={(e) => setFormData(prev => ({ ...prev, mrr: e.target.value }))}
                      style={{ height: '38px', fontSize: '0.85rem', fontWeight: 600 }}
                    />
                  </div>
                </div>

              </div>

              <div className="crm-modal-footer" style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                  <Check size={16} /> Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CUSTOMER MODAL */}
      {editingCustomer && (
        <div className="modal-backdrop" onClick={() => setEditingCustomer(null)}>
          <div className="crm-modal" style={{ maxWidth: '540px', width: '95%' }} onClick={(e) => e.stopPropagation()}>
            <div className="crm-modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <Edit size={18} style={{ color: 'var(--primary)' }} />
                  Edit Customer Details
                </h2>
                <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Update enterprise credentials, segment classifications, and recurring subscription MRR.
                </p>
              </div>
              <button type="button" className="btn-close" onClick={() => setEditingCustomer(null)} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="crm-modal-body" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: 'calc(85vh - 120px)', overflowY: 'auto' }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px' }}>Customer Contact Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    style={{ height: '38px', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  <div>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px' }}>Email Address *</label>
                    <input
                      type="email"
                      className="form-input"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                      style={{ height: '38px', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px' }}>Phone Number</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      style={{ height: '38px', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px' }}>Company / Organization *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    required
                    style={{ height: '38px', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  <div>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px' }}>Segment</label>
                    <select
                      className="form-select"
                      value={formData.segment}
                      onChange={(e) => setFormData(prev => ({ ...prev, segment: e.target.value }))}
                      style={{ height: '38px', fontSize: '0.85rem' }}
                    >
                      <option value="Enterprise">Enterprise</option>
                      <option value="SMB">SMB</option>
                      <option value="Startup">Startup</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px' }}>Plan</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.plan}
                      onChange={(e) => setFormData(prev => ({ ...prev, plan: e.target.value }))}
                      style={{ height: '38px', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px' }}>MRR</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.mrr}
                      onChange={(e) => setFormData(prev => ({ ...prev, mrr: e.target.value }))}
                      style={{ height: '38px', fontSize: '0.85rem', fontWeight: 600 }}
                    />
                  </div>
                </div>

              </div>

              <div className="crm-modal-footer" style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingCustomer(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                  <Check size={16} /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
