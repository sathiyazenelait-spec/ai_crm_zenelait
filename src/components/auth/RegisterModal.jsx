import React, { useState, useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import { api } from '../../services/api';
import {
  Building2,
  Mail,
  Lock,
  User,
  ShieldCheck,
  CheckCircle2,
  Search,
  ArrowRight,
  Briefcase,
  Sparkles,
  Phone,
  FileText,
  X,
  Check,
  Zap,
  Globe,
  MapPin,
  CreditCard,
  Crown
} from 'lucide-react';

export function RegisterModal({ isOpen, onClose, initialMode = 'register', defaultMode, onSwitchToLogin }) {
  const { tenants, login, registerTenant, industryPresets, addNotification } = useCRM();

  const [mode, setMode] = useState(defaultMode || initialMode); // 'register' | 'enquiry'
  const [step, setStep] = useState(1); // 1: Company & Admin Details, 2: Package Selection & ₹0 Checkout

  // User & Company Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industryId, setIndustryId] = useState('software_it');
  const [website, setWebsite] = useState('');
  const [city, setCity] = useState('Chennai');

  // Package Selection State (All 3 packages temporarily ₹0)
  const [selectedPackage, setSelectedPackage] = useState('Professional');

  // Enquiry Specific state
  const [enquiryCompanyName, setEnquiryCompanyName] = useState('');
  const [enquiryIndustry, setEnquiryIndustry] = useState('software_it');
  const [enquiryTeamSize, setEnquiryTeamSize] = useState('10-50');
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [enquirySubmitted, setEnquirySubmitted] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const PACKAGES = [
    {
      id: 'Starter',
      name: 'Starter Plan',
      price: '₹0',
      originalPrice: '₹4,999',
      period: '/month',
      badge: '100% OFF PROMO',
      seats: '5 Team Seats',
      description: 'Essential CRM pipelines, lead capture, and basic AI assistant.',
      features: [
        '5 User Accounts (Sales / Support)',
        'Lead Capture & Contact Management',
        'Sales Pipeline Stages',
        'Standard AI Assistant',
        'Community Support'
      ]
    },
    {
      id: 'Professional',
      name: 'Professional Plan',
      price: '₹0',
      originalPrice: '₹14,999',
      period: '/month',
      badge: 'RECOMMENDED • FREE TRIAL',
      recommended: true,
      seats: '25 Team Seats',
      description: 'Full Software/IT Tenant CRM + HRMS Pro + Recruitment ATS + Autonomous AI.',
      features: [
        '25 User Accounts (Admin, HR, Sales, Support, Analyst)',
        'Full HR Hub: Employee Lifecycle (EMP-1001), ATS & Onboarding',
        'IT Software Products Catalog (PRD-101 HRMS Pro)',
        'Leave Management & Attendance Approvals',
        'Autonomous AI Employees & Dry-Run Workflows',
        'Omnichannel Integrations (Webchat, Email)'
      ]
    },
    {
      id: 'Enterprise',
      name: 'Enterprise Suite',
      price: '₹0',
      originalPrice: '₹34,999',
      period: '/month',
      badge: '100% OFF PROMO',
      seats: '100+ Team Seats',
      description: 'Omnichannel WhatsApp, custom Vector RAG, and dedicated SLA.',
      features: [
        '100+ User Accounts & Role Permissions',
        'WhatsApp Business + Instagram + Email Omnichannel',
        'Custom Vector RAG Knowledge Sources',
        'Enterprise BI Visualizations & Unit Economics',
        'Dedicated SLA & 24/7 Security Auditing'
      ]
    }
  ];

  // Handle Tenant Registration with ₹0 First Payment
  const handleRegisterTenant = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const payload = {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      password: password,
      role: 'COMPANY_ADMIN',
      department: 'Executive / Management',
      phone: phone || '+91 90000 00000',
      companyName: companyName.trim() || 'My IT Company Pvt. Ltd.',
      industryId: industryId,
      packagePlan: selectedPackage,
      website: website || 'https://' + (companyName || 'mycompany').toLowerCase().replace(/[^a-z0-9]/g, '') + '.example',
      address: city + ', India',
      isNewCompany: true
    };

    try {
      // 1. Call Java Spring Boot Backend API
      const res = await api.register(payload);

      // 2. Hydrate frontend context & tenants engine
      registerTenant({
        companyName: payload.companyName,
        industryId: payload.industryId,
        packagePlan: selectedPackage,
        fullName: payload.fullName,
        email: payload.email,
        password: payload.password,
        phone: payload.phone,
        website: payload.website,
        address: payload.address
      });

      setIsLoading(false);
      onClose();
    } catch (err) {
      // Zero-setup offline fallback
      registerTenant({
        companyName: payload.companyName,
        industryId: payload.industryId,
        packagePlan: selectedPackage,
        fullName: payload.fullName,
        email: payload.email,
        password: payload.password,
        phone: payload.phone,
        website: payload.website,
        address: payload.address
      });
      setIsLoading(false);
      onClose();
    }
  };

  // Handle Public Software Enquiry Submission
  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const enquiryData = {
      fullName,
      businessEmail: email,
      phone,
      companyName: enquiryCompanyName,
      industryId: enquiryIndustry,
      teamSize: enquiryTeamSize,
      message: enquiryMessage
    };

    await api.submitEnquiry(enquiryData);

    setTimeout(() => {
      setIsLoading(false);
      setEnquirySubmitted(true);
      addNotification({
        type: 'system',
        title: `Enquiry submitted for ${enquiryCompanyName}! Super Admin will review & provision your workspace.`,
        category: 'Sales'
      });
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div
        className="modal-container"
        style={{
          maxWidth: '740px',
          width: '100%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.45)',
          overflow: 'hidden'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-surface)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 32, height: 32, borderRadius: '8px', backgroundColor: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={18} />
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Register Tenant Workspace
                <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>Special: All 3 Packages ₹0 Trial</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Register your company, choose a package with ₹0 initial payment, and become the Company Owner.
              </div>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Tab Toggle */}
        <div style={{ padding: '12px 20px 0', display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className={`btn btn-xs ${mode === 'register' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ flex: 1, padding: '7px 12px', fontWeight: 700 }}
            onClick={() => { setMode('register'); setEnquirySubmitted(false); }}
          >
            🏢 New Tenant Registration (Company Owner)
          </button>
          <button
            type="button"
            className={`btn btn-xs ${mode === 'enquiry' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ flex: 1, padding: '7px 12px' }}
            onClick={() => { setMode('enquiry'); setEnquirySubmitted(false); }}
          >
            📋 Custom Enterprise Consultation
          </button>
        </div>

        {/* IMPORTANT NOTICE FOR NON-ADMIN ROLES (HR, SALES, SUPPORT, ANALYST) */}
        {mode === 'register' && (
          <div
            style={{
              margin: '12px 20px 0',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(139, 92, 246, 0.08)',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              fontSize: '0.74rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
              <ShieldCheck size={16} style={{ color: '#8b5cf6', flexShrink: 0 }} />
              <div>
                <strong>Invited Team Member (HR, Sales, Support, Analyst)?</strong> Your Company Admin creates your account email. You do not need to register a new tenant.
              </div>
            </div>
            {onSwitchToLogin && (
              <button
                type="button"
                className="btn btn-secondary btn-xs"
                style={{ flexShrink: 0, fontWeight: 700 }}
                onClick={() => {
                  onClose();
                  onSwitchToLogin();
                }}
              >
                Sign In to Workspace
              </button>
            )}
          </div>
        )}

        {/* MODE 1: REGISTER TENANT & PACKAGE SELECTION */}
        {mode === 'register' && (
          <form
            onSubmit={handleRegisterTenant}
            style={{
              padding: '16px 20px',
              overflowY: 'auto',
              flex: 1,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {error && (
              <div style={{ padding: '8px 12px', borderRadius: '6px', backgroundColor: 'rgba(239, 68, 68, 0.12)', border: '1px solid #ef4444', color: '#ef4444', fontSize: '0.78rem', marginBottom: '12px' }}>
                {error}
              </div>
            )}

            {/* Stepper Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              <div
                onClick={() => setStep(1)}
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: step === 1 ? 'rgba(37, 99, 235, 0.15)' : 'var(--bg-surface)',
                  border: `1px solid ${step === 1 ? '#2563eb' : 'var(--border)'}`,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: step === 1 ? '#2563eb' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                1. Owner &amp; Company Details
              </div>
              <div
                onClick={() => setStep(2)}
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: step === 2 ? 'rgba(37, 99, 235, 0.15)' : 'var(--bg-surface)',
                  border: `1px solid ${step === 2 ? '#2563eb' : 'var(--border)'}`,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: step === 2 ? '#2563eb' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                2. Choose Package (₹0 Payment)
              </div>
            </div>

            {/* STEP 1: COMPANY & OWNER DETAILS */}
            {step === 1 && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Company Owner Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Priya Kumar"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Business Email (Admin Login)</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="e.g. admin@abctech.example"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Password (Encrypted BCrypt)</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Contact Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="+91-90000 00000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '4px', color: 'var(--primary)' }}>Company / Workspace Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. ABC Technologies Pvt. Ltd."
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Tenant Industry Preset</label>
                    <select
                      className="form-control"
                      value={industryId}
                      onChange={(e) => setIndustryId(e.target.value)}
                    >
                      <option value="software_it">Software / IT (HRMS Pro, Cloud IT)</option>
                      <option value="real_estate">Real Estate &amp; Builders</option>
                      <option value="education">Higher Ed &amp; EdTech</option>
                      <option value="hospitals">Hospitals &amp; Healthcare</option>
                      <option value="ecommerce">E-Commerce &amp; Retail</option>
                      <option value="hospitality">Resorts &amp; Hospitality</option>
                      <option value="travel">Travel &amp; Tours</option>
                      <option value="manufacturing_b2b">Manufacturing B2B</option>
                      <option value="financial_services">Wealth &amp; Financial Services</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Website / Domain</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="https://abctech.example"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>City / Location</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Chennai, Tamil Nadu"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                </div>

                <div
                  style={{
                    position: 'sticky',
                    bottom: 0,
                    backgroundColor: 'var(--bg-card)',
                    paddingTop: '12px',
                    paddingBottom: '4px',
                    borderTop: '1px solid var(--border)',
                    marginTop: '16px',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    zIndex: 20
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ padding: '9px 22px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}
                    onClick={() => {
                      if (!fullName.trim() || !email.trim() || !password || !companyName.trim()) {
                        setError('Please fill in your name, email, password, and company name.');
                        return;
                      }
                      setError(null);
                      setStep(2);
                    }}
                  >
                    Next: Choose Package &amp; ₹0 Activation <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: CHOOSE PACKAGE & ZERO-COST PAYMENT */}
            {step === 2 && (
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                  Select the package features for <strong>{companyName || 'your company'}</strong>. Super Admin has set all 3 packages at <strong>₹0 cost</strong> during this introductory trial.
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                  {PACKAGES.map((pkg) => {
                    const isSelected = selectedPackage === pkg.id;
                    return (
                      <div
                        key={pkg.id}
                        onClick={() => setSelectedPackage(pkg.id)}
                        style={{
                          padding: '12px',
                          borderRadius: 'var(--radius-md)',
                          border: `2px solid ${isSelected ? '#2563eb' : 'var(--border)'}`,
                          backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.06)' : 'var(--bg-surface)',
                          cursor: 'pointer',
                          position: 'relative',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main)' }}>{pkg.name}</span>
                          {isSelected && <CheckCircle2 size={16} color="#2563eb" />}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>{pkg.price}</span>
                          <span style={{ fontSize: '0.7rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>{pkg.originalPrice}</span>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{pkg.period}</span>
                        </div>

                        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#2563eb', marginBottom: '6px' }}>
                          {pkg.seats}
                        </div>

                        <div style={{ fontSize: '0.67rem', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: 1.3 }}>
                          {pkg.description}
                        </div>

                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '6px' }}>
                          {pkg.features.slice(0, 3).map((feat, i) => (
                            <div key={i} style={{ fontSize: '0.64rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                              <Check size={10} color="#10b981" /> {feat}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* FIRST PAYMENT & ACTIVATION SUMMARY */}
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    marginBottom: '16px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CreditCard size={15} color="#10b981" />
                      Initial Package Registration Payment:
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#10b981' }}>
                      ₹0 (Free Trial Promo)
                    </div>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    • No credit card required today. Your tenant workspace and <strong>{selectedPackage}</strong> features will be activated instantly.
                    <br />
                    • As <strong>Company Owner</strong>, you will manage tenant users, IT products, and analytics visualization. After the trial period expires, simply pay your package subscription to continue.
                  </div>
                </div>

                {/* Submit Buttons - Fixed Sticky Footer */}
                <div
                  style={{
                    position: 'sticky',
                    bottom: 0,
                    backgroundColor: 'var(--bg-card)',
                    paddingTop: '12px',
                    paddingBottom: '4px',
                    borderTop: '1px solid var(--border)',
                    marginTop: '14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    zIndex: 20
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setStep(1)}
                  >
                    ← Back to Details
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isLoading}
                    style={{
                      padding: '11px 28px',
                      fontSize: '0.9rem',
                      fontWeight: 800,
                      backgroundColor: '#10b981',
                      borderColor: '#10b981',
                      boxShadow: '0 4px 16px rgba(16, 185, 129, 0.45)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    {isLoading ? (
                      'Provisioning Tenant...'
                    ) : (
                      <>
                        <Sparkles size={16} /> Pay ₹0 &amp; Activate Tenant Workspace
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        )}

        {/* MODE 2: CUSTOM ENTERPRISE CONSULTATION ENQUIRY */}
        {mode === 'enquiry' && (
          <form onSubmit={handleEnquirySubmit} style={{ padding: '16px 20px' }}>
            {enquirySubmitted ? (
              <div style={{ textAlign: 'center', padding: '24px 10px' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <CheckCircle2 size={26} />
                </div>
                <h4 style={{ fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>Enquiry Received!</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 16px' }}>
                  Our Super Admin engineering team will provision your dedicated cluster for <strong>{enquiryCompanyName}</strong>.
                </p>
                <button type="button" className="btn btn-primary btn-sm" onClick={onClose}>
                  Done
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Your Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Sathiyaseelan"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Work Email</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="e.g. sathi@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Company Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Global Tech Solutions"
                      value={enquiryCompanyName}
                      onChange={(e) => setEnquiryCompanyName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Team Size</label>
                    <select
                      className="form-control"
                      value={enquiryTeamSize}
                      onChange={(e) => setEnquiryTeamSize(e.target.value)}
                    >
                      <option value="1-10">1-10 Employees</option>
                      <option value="10-50">10-50 Employees</option>
                      <option value="50-250">50-250 Employees</option>
                      <option value="250+">250+ Enterprise Cluster</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Requirements &amp; Architecture Notes</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Describe custom AI integrations, custom vector RAG pipelines, or compliance requirements..."
                    value={enquiryMessage}
                    onChange={(e) => setEnquiryMessage(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={isLoading}>
                    {isLoading ? 'Submitting...' : 'Submit Enterprise Enquiry'}
                  </button>
                </div>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
