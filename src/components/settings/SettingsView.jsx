import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  Building,
  Bot,
  Layers,
  Bell,
  Lock,
  CreditCard,
  Save,
  Check
} from 'lucide-react';

export function SettingsView() {
  const [activeSubTab, setActiveSubTab] = useState('profile');
  const [isSaved, setIsSaved] = useState(false);
  const [formData, setFormData] = useState({
    companyName: 'Tech Solutions Inc',
    website: 'https://www.techsolutions.com',
    industry: 'IT Services',
    companySize: '50-200',
    timezone: 'GMT +5:30 India Standard Time',
    address: '12 Business Street, Chennai, Tamil Nadu, India'
  });

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const navItems = [
    { id: 'profile', label: 'Company Profile', icon: Building },
    { id: 'ai-config', label: 'AI Configuration', icon: Bot },
    { id: 'integrations', label: 'Integrations', icon: Layers },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security & Auth', icon: Lock },
    { id: 'billing', label: 'Billing & Plan', icon: CreditCard },
  ];

  return (
    <div>
      <div className="page-title-row">
        <div className="page-title-group">
          <h1>Settings</h1>
          <p>Configure organization profile, AI guardrails, and third-party integrations</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px' }}>
        {/* Left Subnav */}
        <div className="crm-card" style={{ padding: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSubTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSubTab(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    background: isActive ? 'var(--primary-light)' : 'transparent',
                    color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s'
                  }}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Settings Body */}
        <div className="crm-card" style={{ padding: '28px' }}>
          {activeSubTab === 'profile' && (
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '14px' }}>
                <h3 style={{ fontSize: '1.15rem' }}>Company Profile</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Update your workspace name and business details</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div className="grid-2">
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Company Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Website</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Industry</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Company Size</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.companySize}
                      onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Timezone</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Headquarters Address</label>
                  <textarea
                    rows={3}
                    className="form-control"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px' }}>
                  <button type="submit" className="btn btn-primary">
                    {isSaved ? <Check size={16} /> : <Save size={16} />}
                    <span>{isSaved ? 'Changes Saved!' : 'Save Changes'}</span>
                  </button>
                  {isSaved && <span style={{ fontSize: '0.8rem', color: '#10b981' }}>Updated successfully</span>}
                </div>
              </div>
            </form>
          )}

          {activeSubTab !== 'profile' && (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <p>Configuration panel for <strong>{navItems.find(i => i.id === activeSubTab)?.label}</strong> is active and connected.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
