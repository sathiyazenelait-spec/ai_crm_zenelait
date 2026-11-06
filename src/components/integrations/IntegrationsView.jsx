import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  Layers,
  MessageSquare,
  Mail,
  Calendar,
  Code,
  Shield,
  Bell,
  Sliders,
  Database,
  FileText,
  Check,
  Power
} from 'lucide-react';

function InstagramIcon({ size = 18, color = 'currentColor', style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

const Instagram = InstagramIcon;

export function IntegrationsView() {
  const { integrations, toggleIntegration } = useCRM();
  const [activeTab, setActiveTab] = useState('integrations'); // 'integrations' | 'settings'
  const [activeSettingSub, setActiveSettingSub] = useState('general');

  const getIntegrationIcon = (id) => {
    switch (id) {
      case 'whatsapp':
        return <MessageSquare size={20} style={{ color: '#22c55e' }} />;
      case 'email':
        return <Mail size={20} style={{ color: '#ef4444' }} />;
      case 'instagram':
        return <InstagramIcon size={20} color="#ec4899" />;
      case 'calendar':
        return <Calendar size={20} style={{ color: '#3b82f6' }} />;
      default:
        return <Code size={20} style={{ color: '#8b5cf6' }} />;
    }
  };

  return (
    <div className="integrations-view">
      <div className="page-title-row">
        <div className="page-title-group">
          <h1>Integrations & Company Settings</h1>
          <p>Connect third-party communications APIs, calendar syncs, security controls, and audit logs</p>
        </div>
      </div>

      {/* Primary Tabs */}
      <div className="crm-card" style={{ marginBottom: '20px', padding: '10px 18px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`btn btn-sm ${activeTab === 'integrations' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('integrations')}
          >
            Connected Channels & APIs ({integrations.length})
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'settings' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('settings')}
          >
            Company Security & Global Settings
          </button>
        </div>
      </div>

      {/* TAB 1: Integrations Grid */}
      {activeTab === 'integrations' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {integrations.map((integ) => {
            const isConnected = integ.status === 'Connected';

            return (
              <div key={integ.id} className="crm-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: '10px',
                          backgroundColor: 'var(--bg-surface)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid var(--border)'
                        }}
                      >
                        {getIntegrationIcon(integ.id)}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{integ.name}</h3>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Official Provider</span>
                      </div>
                    </div>
                    <span className={`badge ${isConnected ? 'badge-qualified' : 'badge-new'}`}>
                      {integ.status}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 16px 0', lineHeight: 1.4 }}>
                    {integ.desc}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {isConnected ? 'Webhook Active • 24/7 Sync' : 'Ready to configure'}
                  </span>
                  <button
                    className={`btn btn-xs ${isConnected ? 'btn-secondary' : 'btn-primary'}`}
                    onClick={() => toggleIntegration(integ.id)}
                  >
                    {isConnected ? 'Disconnect' : 'Connect API'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: Company Security & Settings */}
      {activeTab === 'settings' && (
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '20px' }}>
          {/* Sub Navigation */}
          <div className="crm-card" style={{ padding: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {[
                { id: 'general', label: 'General Settings', icon: Sliders },
                { id: 'security', label: 'Security & 2FA', icon: Shield },
                { id: 'notifications', label: 'Notifications', icon: Bell },
                { id: 'custom_fields', label: 'Custom Fields', icon: Database },
                { id: 'data_retention', label: 'Data Retention', icon: Database },
                { id: 'audit_log', label: 'Audit Log', icon: FileText }
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeSettingSub === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSettingSub(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: 'none',
                      background: isActive ? 'var(--primary-light)' : 'transparent',
                      color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <Icon size={15} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Details Panel */}
          <div className="crm-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 14px 0', textTransform: 'capitalize' }}>
              {activeSettingSub.replace('_', ' ')}
            </h3>

            {activeSettingSub === 'security' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Two-Factor Authentication (2FA)</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Enforce SMS or Authenticator App for all company admins</div>
                  </div>
                  <input type="checkbox" defaultChecked style={{ width: 18, height: 18 }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Single Sign-On (SAML / Google SSO)</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Allow team members to sign in using company Google Workspace</div>
                  </div>
                  <input type="checkbox" defaultChecked style={{ width: 18, height: 18 }} />
                </div>
              </div>
            )}

            {activeSettingSub === 'general' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label className="form-label">Default Workspace Lead Assignment</label>
                  <select className="form-control" defaultValue="Round-Robin">
                    <option value="Round-Robin">Round-Robin (Equal Distribution)</option>
                    <option value="AI-Scored">AI-Scored (High intent to senior reps)</option>
                    <option value="Manual">Manual Manager Triage</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Auto Lead Archive</label>
                  <select className="form-control" defaultValue="90 Days">
                    <option value="30 Days">Archive after 30 days of inactivity</option>
                    <option value="90 Days">Archive after 90 days of inactivity</option>
                    <option value="Never">Never archive leads</option>
                  </select>
                </div>
              </div>
            )}

            {activeSettingSub !== 'security' && activeSettingSub !== 'general' && (
              <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', padding: '20px 0' }}>
                Configuration settings for {activeSettingSub.replace('_', ' ')} are active and synced across your tenant workspace.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
