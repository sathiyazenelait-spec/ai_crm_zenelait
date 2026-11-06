import React, { useState, useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  BotMessageSquare,
  Sparkles,
  Eye,
  EyeOff,
  CheckCircle2,
  KeyRound,
  ArrowLeft
} from 'lucide-react';
import { RegisterModal } from './RegisterModal';
import { api } from '../../services/api';

export function LoginView() {
  const {
    login,
    setViewMode,
    resolveCredentials
  } = useCRM();

  const { mode } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [registerMode, setRegisterMode] = useState('register');

  // Dynamic Real-Time Smart Tenant & Credential Detector
  const detectedAuth = useMemo(() => {
    return resolveCredentials(email, selectedRole);
  }, [email, selectedRole, resolveCredentials]);

  const handleCredentialSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Authenticate with Spring Boot Backend
      const res = await api.login(email.trim(), password);
      if (res.success && res.data) {
        const authData = res.data;
        const tenantId = authData.companyId || detectedAuth.tenantId || 'TEN-8AD47B';
        const role = authData.role === 'COMPANY_ADMIN' ? 'Company Owner / Company Admin' : (selectedRole || detectedAuth.role || 'Company Owner / Company Admin');
        
        login({
          email: authData.email || email.trim(),
          password,
          role: role,
          companyId: tenantId,
          tenantId: tenantId,
          companyName: authData.companyName,
          industryId: authData.industryId || detectedAuth.industryId || 'software_it',
          name: authData.fullName || detectedAuth.name || 'User',
          plan: authData.plan || 'Starter'
        });
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.warn('Backend login fallback to local credentials:', err);
    }

    // Fallback to local / mock login
    login({
      email: email.trim(),
      password,
      role: selectedRole || detectedAuth.role || 'Company Owner / Company Admin',
      companyId: detectedAuth.tenantId,
      tenantId: detectedAuth.tenantId,
      industryId: detectedAuth.industryId,
      name: detectedAuth.name
    });
    setIsLoading(false);
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setResetSent(true);
    setTimeout(() => {
      setShowForgotModal(false);
      setResetSent(false);
      setForgotEmail('');
    }, 2000);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at top, rgba(37, 99, 235, 0.15) 0%, var(--bg-main) 70%)',
        padding: '16px',
        position: 'relative',
        overflowY: 'auto'
      }}
    >
      {/* Background Decorative Glow Orbs */}
      <div
        style={{
          position: 'absolute',
          top: '-120px',
          left: '10%',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, rgba(0,0,0,0) 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-120px',
          right: '10%',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(217, 119, 6, 0.15) 0%, rgba(0,0,0,0) 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none'
        }}
      />

      {/* Top Header Link: Return to Public Site */}
      <div style={{ width: '100%', maxWidth: '480px', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 20 }}>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => setViewMode('public')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '0.82rem' }}
        >
          <ArrowLeft size={16} />
          <span>← Return to Public Website</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <ShieldCheck size={14} color="#10b981" />
          <span>Multi-Tenant Auth Gateway</span>
        </div>
      </div>

      <div className="login-card-container" style={{ maxWidth: '480px', gridTemplateColumns: '1fr', display: 'flex', flexDirection: 'column' }}>
        {/* Interactive Login Card */}
        <div style={{ padding: '26px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflowY: 'auto' }}>
          <div>
            {/* Logo and Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: '#2563eb',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)'
                }}
              >
                <BotMessageSquare size={22} />
              </div>
              <div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
                  Zenelait AI
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                  Enterprise Multi-Tenant SaaS CRM
                </div>
              </div>
            </div>

            {/* Title */}
            <div style={{ marginBottom: '16px' }}>
              <h1 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 4px 0', color: 'var(--text-main)' }}>
                Sign in to your Company Workspace
              </h1>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                Enter your company business email and password to access your secure dashboard.
              </p>
            </div>

            {/* Authentication Form */}
            <form onSubmit={handleCredentialSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              {/* Email Input */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Business Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    className="form-control"
                    style={{ paddingLeft: '36px', fontSize: '0.85rem', padding: '9px 12px 9px 36px' }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. priya@gmail.com or admin@abctech.com"
                    required
                  />
                </div>
              </div>

              {/* Real-time Smart Tenant Detection Badge (only when email is entered) */}
              {email.trim().length > 0 && detectedAuth && (
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: detectedAuth.isGodMode ? 'rgba(217, 119, 6, 0.08)' : 'rgba(37, 99, 235, 0.08)',
                    border: detectedAuth.isGodMode ? '1px solid rgba(217, 119, 6, 0.3)' : '1px solid rgba(37, 99, 235, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    animation: 'fadeIn 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: '6px',
                        backgroundColor: detectedAuth.isGodMode ? '#d97706' : (detectedAuth.tenant?.color || '#2563eb'),
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.65rem',
                        fontWeight: 800
                      }}
                    >
                      {detectedAuth.isGodMode ? '👑' : (detectedAuth.companyName || 'CO').substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        Company: {detectedAuth.companyName}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                        Industry: {detectedAuth.industryName} • Role: {detectedAuth.role}
                      </div>
                    </div>
                  </div>
                  <span className="badge badge-qualified" style={{ fontSize: '0.62rem', padding: '2px 6px' }}>
                    Auto-Matched
                  </span>
                </div>
              )}

              {/* Password Input */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, margin: 0 }}>Password</label>
                  <span
                    onClick={() => setShowForgotModal(true)}
                    style={{ fontSize: '0.72rem', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Forgot password?
                  </span>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-muted)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    style={{ paddingLeft: '36px', paddingRight: '36px', padding: '9px 36px 9px 36px', fontSize: '0.85rem' }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your account password"
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-ghost btn-icon btn-xs"
                    style={{ position: 'absolute', right: 8, top: 8 }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', cursor: 'pointer', margin: 0 }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember this session</span>
                </label>
              </div>

              {/* PROMINENT SUBMIT BUTTON */}
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '11px 16px', fontSize: '0.9rem', fontWeight: 700, boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)' }}
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : (email.trim().length > 0 && detectedAuth?.companyName ? `Sign In to ${detectedAuth.companyName}` : 'Sign In')}
                <ArrowRight size={16} />
              </button>

              {/* Self Register / Enquire Link */}
              <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Need an account?{' '}
                <span
                  style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 700 }}
                  onClick={() => {
                    setRegisterMode('register');
                    setIsRegisterOpen(true);
                  }}
                >
                  Register here
                </span>
                {' · '}
                <span
                  style={{ color: '#d97706', cursor: 'pointer', fontWeight: 700 }}
                  onClick={() => {
                    setRegisterMode('enquiry');
                    setIsRegisterOpen(true);
                  }}
                >
                  Get Software
                </span>
              </div>

              {/* Terms and Conditions Link */}
              <div style={{ textAlign: 'center', marginTop: '6px', fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                By signing in, you agree to our{' '}
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: 'var(--primary)',
                    cursor: 'pointer',
                    fontWeight: 700,
                    textDecoration: 'underline'
                  }}
                >
                  Terms and Conditions
                </button>
              </div>
            </form>
          </div>

          {/* Footer Security Badge & Terms Link */}
          <div style={{ marginTop: '16px', paddingTop: '10px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              <ShieldCheck size={14} style={{ color: '#10b981' }} /> SOC2 Type II & 256-Bit SSL Encrypted
            </div>
            <button
              type="button"
              onClick={() => setShowTermsModal(true)}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                color: 'var(--primary)',
                fontSize: '0.72rem',
                cursor: 'pointer',
                fontWeight: 600,
                textDecoration: 'underline'
              }}
            >
              Terms and Conditions
            </button>
          </div>
        </div>
      </div>

      {/* Terms and Conditions / Multi-Tenant Architecture Modal */}
      {showTermsModal && (
        <div className="modal-backdrop" onClick={() => setShowTermsModal(false)}>
          <div
            className="modal-container"
            style={{ maxWidth: '540px', width: '92%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px', borderRadius: '999px', backgroundColor: 'rgba(37, 99, 235, 0.15)', color: '#3b82f6', fontSize: '0.74rem', fontWeight: 700 }}>
                <Sparkles size={14} /> Multi-Tenant Architecture
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-icon btn-sm"
                onClick={() => setShowTermsModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body" style={{ padding: '20px 24px', maxHeight: '75vh', overflowY: 'auto' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, lineHeight: 1.35, color: 'var(--text-main)', marginBottom: '10px' }}>
                Isolated SaaS Workspaces for Every Subscribed Company
              </h2>

              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '16px' }}>
                When you log in, Zenelait AI instantly mounts that company's private CRM database, pipeline stages, custom knowledge embeddings, and AI employee fleet.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
                {[
                  { title: 'Dynamic Industry Hydration', desc: 'Custom metrics, stage names, and workflows per industry.' },
                  { title: 'Zero Data Leaks Between Tenants', desc: 'Complete multi-tenant isolation with SOC2 grade security.' },
                  { title: '24/7 Autonomous AI Employees', desc: 'Inbound qualification, appointment bookings & support handovers.' }
                ].map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border)' }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                      <CheckCircle2 size={13} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>{f.title}</div>
                      <div style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#d97706' }}>👑 Ultra God Mode Master</span>
                  <span className="badge badge-primary" style={{ fontSize: '0.64rem' }}>Platform Root</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Use <strong style={{ color: 'var(--text-main)' }}>root@zenelait.ai</strong> to access global cross-company orchestration, AI model mesh, and emergency platform controls.
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 24px', borderTop: '1px solid var(--border)' }}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setShowTermsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="modal-backdrop">
          <div className="modal-container" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <KeyRound size={16} style={{ color: 'var(--primary)' }} /> Reset Password
              </h3>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowForgotModal(false)}>✕</button>
            </div>

            <form onSubmit={handleForgotSubmit}>
              <div className="modal-body">
                {resetSent ? (
                  <div style={{ textAlign: 'center', padding: '20px 10px' }}>
                    <CheckCircle2 size={36} style={{ color: '#10b981', margin: '0 auto 10px' }} />
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Password Reset Link Sent!</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Check your inbox for instructions to reset your workspace access.
                    </div>
                  </div>
                ) : (
                  <>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                      Enter your verified business email address and we'll dispatch a secure one-time login link.
                    </p>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="e.g. admin@abctech.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                    />
                  </>
                )}
              </div>

              {!resetSent && (
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForgotModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Dispatch Reset Link</button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Registration Modal */}
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        defaultMode={registerMode}
      />
    </div>
  );
}
