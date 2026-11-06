import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Target, Plus, DollarSign, User, Calendar, Edit, CheckCircle, ArrowRight, MoreVertical, X, Check, Trash2, TrendingUp, Sparkles } from 'lucide-react';

export function OpportunitiesView() {
  const {
    opportunities,
    addOpportunity,
    updateOpportunityStage,
    deleteOpportunity,
    addNotification,
    teamMembers,
    currentTenant,
    autoAccelerateStalledDeals,
    aiEmployeesList
  } = useCRM();
  const [selectedDealId, setSelectedDealId] = useState(() => opportunities[0]?.id || null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [oppForm, setOppForm] = useState({
    title: '',
    company: '',
    value: '₹3,50,000',
    stage: 'Proposal',
    probability: 65,
    owner: 'Rahul Kumar',
    expectedClose: 'Nov 30, 2026',
    description: ''
  });

  const stages = [
    { id: 'New', name: 'New Inquiries', color: '#3b82f6' },
    { id: 'Qualified', name: 'Qualified Leads', color: '#10b981' },
    { id: 'Proposal', name: 'Proposal Sent', color: '#f59e0b' },
    { id: 'Won', name: 'Won Deals', color: '#8b5cf6' }
  ];

  const selectedDeal = opportunities.find(o => o.id === selectedDealId) || opportunities[0] || null;

  const handleOpenModal = () => {
    setOppForm({
      title: '',
      company: currentTenant?.name || '',
      value: '₹3,50,000',
      stage: 'Proposal',
      probability: 65,
      owner: teamMembers[0]?.name || 'Rahul Kumar',
      expectedClose: 'Nov 30, 2026',
      description: ''
    });
    setIsModalOpen(true);
  };

  const handleCreateOpportunity = (e) => {
    e.preventDefault();
    if (!oppForm.title.trim()) return;

    let formattedValue = oppForm.value.trim();
    if (!formattedValue.startsWith('₹') && !formattedValue.startsWith('$')) {
      formattedValue = `₹${formattedValue}`;
    }

    addOpportunity({
      title: oppForm.title.trim(),
      company: oppForm.company.trim() || 'Enterprise Client',
      value: formattedValue,
      stage: oppForm.stage,
      probability: Number(oppForm.probability) || 50,
      owner: oppForm.owner,
      expectedClose: oppForm.expectedClose,
      description: oppForm.description || 'Enterprise contract pipeline deal'
    });

    addNotification?.({
      type: 'crm',
      title: `Opportunity added: ${oppForm.title.trim()} (${formattedValue})`,
      category: 'Sales'
    });

    setIsModalOpen(false);
  };

  const handleWinDeal = (deal) => {
    if (!deal) return;
    updateOpportunityStage(deal.id, 'Won');
    addNotification?.({
      type: 'success',
      title: `🎉 Deal Won! ${deal.title} (${deal.value})`,
      category: 'Revenue'
    });
  };

  const handleDeleteDeal = (deal) => {
    if (window.confirm(`Are you sure you want to remove deal "${deal.title}"?`)) {
      deleteOpportunity(deal.id);
      addNotification?.({
        type: 'warning',
        title: `Opportunity removed: ${deal.title}`,
        category: 'Sales'
      });
      if (selectedDealId === deal.id) {
        setSelectedDealId(opportunities.find(o => o.id !== deal.id)?.id || null);
      }
    }
  };

  // Helper to parse numbers from strings like "₹2,50,000" or "$3,200"
  const parseVal = (str) => {
    if (!str) return 0;
    const num = Number(str.replace(/[^0-9]/g, ''));
    return isNaN(num) ? 0 : num;
  };

  return (
    <div className="opportunities-view">
      <div className="page-title-row">
        <div className="page-title-group">
          <h1>Opportunities & Deals</h1>
          <p>Visual sales pipeline stages, deal probabilities, and value forecasting</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleOpenModal}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={16} />
          <span>+ Add Opportunity</span>
        </button>
      </div>

      {/* AI Pipeline Acceleration Workload Reducer Banner */}
      <div
        className="crm-card"
        style={{
          padding: '14px 20px',
          marginBottom: '18px',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
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
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10b981',
              fontSize: '1.2rem'
            }}
          >
            {aiEmployeesList?.find(e => e.roleCategory === 'PIPELINE_NURTURE')?.avatar || '🎯'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <strong style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>
                {aiEmployeesList?.find(e => e.roleCategory === 'PIPELINE_NURTURE')?.name || 'AI Pipeline Nurture Specialist'} • Autonomous Deal Acceleration
              </strong>
              <span className="badge badge-qualified" style={{ fontSize: '0.68rem' }}>Active Cadence</span>
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Reduces sales rep workload by analyzing deal stagnation across pipeline stages and automatically preparing proposal terms.
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => autoAccelerateStalledDeals()}
          className="btn btn-primary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
        >
          <Sparkles size={14} />
          <span>⚡ AI Auto-Accelerate Stalled Deals</span>
        </button>
      </div>

      {/* Kanban Board Grid */}
      <div className="opportunities-board-layout">
        
        {/* Left: 4-Column Kanban Columns */}
        <div className="opportunities-kanban-cols">
          {stages.map((st) => {
            const dealsInStage = opportunities.filter(o => o.stage === st.id);
            const stageTotal = dealsInStage.length;
            const stageValueSum = dealsInStage.reduce((acc, d) => acc + parseVal(d.value), 0);

            return (
              <div
                key={st.id}
                style={{
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  minHeight: '480px'
                }}
              >
                {/* Column Header */}
                <div style={{ paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: st.color }} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{st.name}</span>
                    </div>
                    <span className="badge" style={{ fontSize: '0.7rem', backgroundColor: 'var(--bg-card)', fontWeight: 700 }}>{stageTotal}</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Total: <strong style={{ color: 'var(--text-main)' }}>₹{stageValueSum.toLocaleString()}</strong>
                  </div>
                </div>

                {/* Deal Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                  {dealsInStage.length === 0 ? (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '24px 8px', fontStyle: 'italic' }}>
                      No deals in this stage
                    </div>
                  ) : (
                    dealsInStage.map((deal) => {
                      const isSelected = selectedDeal && selectedDeal.id === deal.id;

                      return (
                        <div
                          key={deal.id}
                          className="crm-card"
                          onClick={() => setSelectedDealId(deal.id)}
                          style={{
                            padding: '12px 14px',
                            cursor: 'pointer',
                            border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                            backgroundColor: 'var(--bg-card)',
                            boxShadow: isSelected ? '0 4px 14px rgba(37, 99, 235, 0.18)' : 'none',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                            <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.3 }}>
                              {deal.title}
                            </div>
                          </div>
                          
                          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                            {deal.company}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '8px', marginTop: '4px' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)' }}>
                              {deal.value}
                            </span>
                            <span className="badge badge-secondary" style={{ fontSize: '0.65rem', fontWeight: 600 }}>
                              {deal.probability}% Win
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Deal Details Drawer Card */}
        {selectedDeal ? (
          <div className="crm-card" style={{ padding: '22px', height: 'fit-content' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
              <div>
                <span className={`badge ${selectedDeal.stage === 'Won' ? 'badge-qualified' : selectedDeal.stage === 'Proposal' ? 'badge-warning' : 'badge-primary'}`} style={{ fontSize: '0.68rem', fontWeight: 700 }}>
                  {selectedDeal.stage}
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '6px 0 2px 0', color: 'var(--text-main)' }}>{selectedDeal.title}</h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{selectedDeal.company}</div>
              </div>
              <button 
                className="btn btn-secondary btn-icon btn-sm" 
                title="Delete Opportunity"
                style={{ color: '#ef4444' }}
                onClick={() => handleDeleteDeal(selectedDeal)}
              >
                <Trash2 size={15} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              <div style={{ backgroundColor: 'var(--bg-surface)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Contract Deal Value</span>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--primary)', marginTop: '2px' }}>{selectedDeal.value}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ backgroundColor: 'var(--bg-surface)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Probability</span>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>{selectedDeal.probability}%</span>
                </div>
                <div style={{ backgroundColor: 'var(--bg-surface)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>Expected Close</span>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>{selectedDeal.expectedClose}</span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', fontWeight: 600 }}>Deal Owner</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                  <div className="avatar avatar-xs" style={{ backgroundColor: 'var(--primary)', color: '#fff', fontWeight: 700 }}>
                    {(selectedDeal.owner || 'AI').substring(0, 2).toUpperCase()}
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{selectedDeal.owner}</span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', fontWeight: 600 }}>Move Stage</span>
                <select
                  className="form-select"
                  style={{ marginTop: '6px', height: '38px', fontSize: '0.85rem' }}
                  value={selectedDeal.stage}
                  onChange={(e) => updateOpportunityStage(selectedDeal.id, e.target.value)}
                >
                  <option value="New">New Inquiries</option>
                  <option value="Qualified">Qualified Leads</option>
                  <option value="Proposal">Proposal Sent</option>
                  <option value="Won">Won Deals</option>
                </select>
              </div>

              {selectedDeal.description && (
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', fontWeight: 600 }}>Deal Scope / Notes</span>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', margin: '4px 0 0 0', lineHeight: 1.5, backgroundColor: 'var(--bg-surface)', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    {selectedDeal.description}
                  </p>
                </div>
              )}
            </div>

            {selectedDeal.stage !== 'Won' ? (
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 700, padding: '10px' }}
                onClick={() => handleWinDeal(selectedDeal)}
              >
                <CheckCircle size={16} />
                Proposal Accepted & Win Deal
              </button>
            ) : (
              <div style={{ textAlign: 'center', padding: '10px', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <CheckCircle size={16} /> Closed as Won Contract
              </div>
            )}
          </div>
        ) : (
          <div className="crm-card" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Select a deal card to view contract details.
          </div>
        )}

      </div>

      {/* ADD OPPORTUNITY MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="crm-modal" style={{ maxWidth: '540px', width: '95%' }} onClick={(e) => e.stopPropagation()}>
            <div className="crm-modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <Target size={18} style={{ color: 'var(--primary)' }} />
                  Add Sales Opportunity
                </h2>
                <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Add a high-intent commercial deal to your active multi-stage pipeline.
                </p>
              </div>
              <button type="button" className="btn-close" onClick={() => setIsModalOpen(false)} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateOpportunity}>
              <div className="crm-modal-body" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: 'calc(85vh - 120px)', overflowY: 'auto' }}>
                
                <div>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px' }}>Opportunity Title *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Enterprise CRM Cloud Mesh Deployment"
                    value={oppForm.title}
                    onChange={(e) => setOppForm(prev => ({ ...prev, title: e.target.value }))}
                    required
                    style={{ height: '38px', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  <div>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px' }}>Client / Company Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Acme Innovations Ltd"
                      value={oppForm.company}
                      onChange={(e) => setOppForm(prev => ({ ...prev, company: e.target.value }))}
                      required
                      style={{ height: '38px', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px' }}>Deal Value (₹) *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. ₹3,50,000"
                      value={oppForm.value}
                      onChange={(e) => setOppForm(prev => ({ ...prev, value: e.target.value }))}
                      required
                      style={{ height: '38px', fontSize: '0.85rem', fontWeight: 600 }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  <div>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px' }}>Pipeline Stage</label>
                    <select
                      className="form-select"
                      value={oppForm.stage}
                      onChange={(e) => setOppForm(prev => ({ ...prev, stage: e.target.value }))}
                      style={{ height: '38px', fontSize: '0.85rem' }}
                    >
                      <option value="New">New Inquiries</option>
                      <option value="Qualified">Qualified Leads</option>
                      <option value="Proposal">Proposal Sent</option>
                      <option value="Won">Won Deals</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px' }}>Win Probability: {oppForm.probability}%</label>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={oppForm.probability}
                      onChange={(e) => setOppForm(prev => ({ ...prev, probability: e.target.value }))}
                      style={{ width: '100%', height: '38px', cursor: 'pointer' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  <div>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px' }}>Deal Owner</label>
                    <input
                      type="text"
                      className="form-input"
                      value={oppForm.owner}
                      onChange={(e) => setOppForm(prev => ({ ...prev, owner: e.target.value }))}
                      placeholder="e.g. Rahul Kumar"
                      style={{ height: '38px', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px' }}>Expected Close Date</label>
                    <input
                      type="text"
                      className="form-input"
                      value={oppForm.expectedClose}
                      onChange={(e) => setOppForm(prev => ({ ...prev, expectedClose: e.target.value }))}
                      placeholder="e.g. Nov 30, 2026"
                      style={{ height: '38px', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px' }}>Description / Notes</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="Provide scope, deliverables, or special commercial agreements..."
                    value={oppForm.description}
                    onChange={(e) => setOppForm(prev => ({ ...prev, description: e.target.value }))}
                    style={{ fontSize: '0.85rem', resize: 'vertical' }}
                  />
                </div>

              </div>

              <div className="crm-modal-footer" style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                  <Check size={16} /> Save Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
