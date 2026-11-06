import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  X,
  Building2,
  Check,
  Bot,
  Users,
  Sparkles,
  ArrowRight,
  Code2,
  GraduationCap,
  HeartPulse,
  ShoppingBag,
  Hotel,
  Plane,
  Factory,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

const ICON_MAP = {
  Code2,
  Building2,
  GraduationCap,
  HeartPulse,
  ShoppingBag,
  Hotel,
  Plane,
  Factory,
  ShieldCheck
};

export function HRRegistrationModal({ onClose }) {
  const { industryPresets, registerNewCompany } = useCRM();
  const [step, setStep] = useState(1); // 1: Company Profile, 2: Industry Selection, 3: AI Squad & Role Setup, 4: Complete

  const [formData, setFormData] = useState({
    name: '',
    hrContact: '',
    hrName: '',
    domain: '',
    companySize: '50-200',
    industryId: 'real_estate',
    plan: 'Enterprise Pro',
    seats: 30
  });

  const selectedPreset = industryPresets[formData.industryId] || industryPresets.software_it;

  const handleNext = (e) => {
    e.preventDefault();
    if (step === 1 && (!formData.name || !formData.hrContact)) return;
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Complete Registration
      registerNewCompany(formData);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '680px', width: '95%' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '8px',
                backgroundColor: 'rgba(139, 92, 246, 0.15)',
                color: '#8b5cf6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Building2 size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                HR Company Registration Portal
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                Zenelait Multi-Tenant Onboarding • Step {step} of 3
              </p>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div style={{ display: 'flex', gap: '6px', padding: '0 24px', marginTop: '14px' }}>
          <div style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: step >= 1 ? 'var(--primary)' : 'var(--border)' }} />
          <div style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: step >= 2 ? 'var(--primary)' : 'var(--border)' }} />
          <div style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: step >= 3 ? 'var(--primary)' : 'var(--border)' }} />
        </div>

        {/* Modal Body */}
        <form onSubmit={handleNext}>
          <div className="modal-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
            
            {/* STEP 1: Company & HR Info */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                    Company / Organization Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Prestige Skylines Realty Ltd."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="grid-2">
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                      HR Admin Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="form-control"
                      placeholder="e.g. Sanjay Verma"
                      value={formData.hrName}
                      onChange={(e) => setFormData({ ...formData, hrName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                      HR Official Work Email *
                    </label>
                    <input
                      type="email"
                      required
                      className="form-control"
                      placeholder="sanjay@skylineproperties.in"
                      value={formData.hrContact}
                      onChange={(e) => setFormData({ ...formData, hrContact: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                      Company Domain
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="skylineproperties.in"
                      value={formData.domain}
                      onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                      Company Size
                    </label>
                    <select
                      className="form-control"
                      value={formData.companySize}
                      onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                    >
                      <option value="1-10">1-10 Employees</option>
                      <option value="10-50">10-50 Employees</option>
                      <option value="50-200">50-200 Employees</option>
                      <option value="200-500">200-500 Employees</option>
                      <option value="500+">500+ Employees</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Pick Industry Vertical (9 Industries) */}
            {step === 2 && (
              <div>
                <div style={{ marginBottom: '14px' }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem' }}>Select Company Type / Industry</h4>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Zenelait AI will automatically customize human roles, AI agent squad, and qualification workflows.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {Object.values(industryPresets).map((preset) => {
                    const IconComp = ICON_MAP[preset.icon] || Building2;
                    const isSelected = formData.industryId === preset.id;

                    return (
                      <div
                        key={preset.id}
                        onClick={() => setFormData({ ...formData, industryId: preset.id })}
                        style={{
                          padding: '12px',
                          borderRadius: 'var(--radius-md)',
                          border: isSelected
                            ? `2px solid ${preset.color}`
                            : '1px solid var(--border)',
                          backgroundColor: isSelected ? preset.accentLight : 'var(--bg-card)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: '6px',
                              backgroundColor: preset.color,
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <IconComp size={15} />
                          </div>
                          {isSelected && <Check size={16} style={{ color: preset.color }} />}
                        </div>

                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
                          {preset.shortName}
                        </div>

                        <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                          {preset.humanRoles.length} Roles • {preset.aiEmployees.length} AI Agents
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 3: Auto-Generated Roles & AI Squad Preview */}
            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: selectedPreset.accentLight,
                    border: `1px solid ${selectedPreset.color}`
                  }}
                >
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: selectedPreset.color, marginBottom: '2px' }}>
                    {selectedPreset.name} Preset Selected
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {selectedPreset.tagline}
                  </div>
                </div>

                {/* Auto-configured Human Roles */}
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={15} style={{ color: 'var(--primary)' }} /> Auto-Configured Human Roles ({selectedPreset.humanRoles.length})
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                    {selectedPreset.humanRoles.map((role) => (
                      <div
                        key={role.id}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--bg-main)',
                          border: '1px solid var(--border)',
                          fontSize: '0.75rem'
                        }}
                      >
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{role.name}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{role.access}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Employee Squad */}
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Bot size={15} style={{ color: 'var(--primary)' }} /> Autonomous AI Employees Deployed ({selectedPreset.aiEmployees.length})
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedPreset.aiEmployees.map((agent) => (
                      <div
                        key={agent.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--bg-main)',
                          border: '1px solid var(--border)'
                        }}
                      >
                        <span style={{ fontSize: '1.2rem' }}>{agent.avatar}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{agent.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{agent.role}</div>
                        </div>
                        <span className="badge badge-qualified" style={{ fontSize: '0.68rem' }}>
                          Omnichannel 24/7
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* Modal Footer */}
          <div className="modal-footer">
            {step > 1 && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setStep(step - 1)}
              >
                Back
              </button>
            )}
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>{step === 3 ? 'Launch Workspace' : 'Continue'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
