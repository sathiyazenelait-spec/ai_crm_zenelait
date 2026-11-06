import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Building2, Save, Upload, Check, Globe, Mail, Phone, MapPin, Clock, DollarSign } from 'lucide-react';

export function CompanyProfileView() {
  const { companyProfile, updateCompanyProfile } = useCRM();
  const [formData, setFormData] = useState({ ...companyProfile });
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateCompanyProfile(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="company-profile-view">
      <div className="page-title-row">
        <div className="page-title-group">
          <h1>Company Profile</h1>
          <p>Update your company information, branding, and regional preferences</p>
        </div>
      </div>

      <div className="crm-card" style={{ padding: '28px' }}>
        <form onSubmit={handleSubmit}>
          {/* Company Logo Section */}
          <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border)' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>
              Company Logo
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '12px',
                  backgroundColor: 'rgba(59, 130, 246, 0.12)',
                  border: '2px solid #3b82f6',
                  color: '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.25rem'
                }}
              >
                ABC
              </div>
              <div>
                <button type="button" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Upload size={14} />
                  <span>Change Logo</span>
                </button>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Recommended: 256x256px PNG or SVG (Max 2MB)
                </div>
              </div>
            </div>
          </div>

          {/* Form Fields Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <div>
              <label className="form-label">Company Name</label>
              <input
                type="text"
                className="form-control"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="form-label">Tagline / Mission</label>
              <input
                type="text"
                className="form-control"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              />
            </div>

            <div>
              <label className="form-label">Industry</label>
              <select
                className="form-control"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              >
                <option value="Software / IT Company">Software / IT Company</option>
                <option value="Real Estate Company">Real Estate Company</option>
                <option value="Education / EdTech">Education / EdTech</option>
                <option value="Healthcare / Clinic">Healthcare / Clinic</option>
                <option value="E-Commerce / Retail">E-Commerce / Retail</option>
              </select>
            </div>

            <div>
              <label className="form-label">Company Website</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-control"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="form-label">Official Work Email</label>
              <input
                type="email"
                className="form-control"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                className="form-control"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Headquarters Address</label>
              <input
                type="text"
                className="form-control"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div>
              <label className="form-label">Timezone</label>
              <select
                className="form-control"
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              >
                <option value="(GMT+05:30) India Standard Time">(GMT+05:30) India Standard Time (IST)</option>
                <option value="(GMT-05:00) Eastern Standard Time">(GMT-05:00) Eastern Standard Time (EST)</option>
                <option value="(GMT+00:00) UTC / London">(GMT+00:00) UTC / London (GMT)</option>
                <option value="(GMT+04:00) Gulf Standard Time">(GMT+04:00) Gulf Standard Time (GST)</option>
              </select>
            </div>

            <div>
              <label className="form-label">Default Currency</label>
              <select
                className="form-control"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              >
                <option value="INR - Indian Rupee (₹)">INR - Indian Rupee (₹)</option>
                <option value="USD - US Dollar ($)">USD - US Dollar ($)</option>
                <option value="EUR - Euro (€)">EUR - Euro (€)</option>
                <option value="AED - UAE Dirham (AED)">AED - UAE Dirham (AED)</option>
              </select>
            </div>
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--border)', paddingTop: '18px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setFormData({ ...companyProfile })}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {isSaved ? <Check size={16} /> : <Save size={16} />}
              <span>{isSaved ? 'Changes Saved!' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
