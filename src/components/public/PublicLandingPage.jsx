import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { useTheme } from '../../context/ThemeContext';
import {
  BotMessageSquare,
  Sparkles,
  Zap,
  ShieldCheck,
  Building2,
  ArrowRight,
  CheckCircle2,
  Lock,
  Globe,
  Users,
  Calendar,
  Layers,
  ChevronRight,
  Crown,
  Play,
  Star,
  Activity,
  BarChart3,
  Cpu,
  Workflow,
  Radio,
  Clock,
  Shield,
  Sun,
  Moon,
  ExternalLink,
  MessageSquare,
  Code2,
  HeartPulse,
  ShoppingBag,
  Hotel,
  Plane,
  Factory,
  Landmark,
  FileCheck
} from 'lucide-react';
import { RegisterModal } from '../auth/RegisterModal';

export function PublicLandingPage() {
  const {
    login,
    setViewMode,
    tenants,
    industryPresets,
    activeIndustryId,
    switchIndustry,
    resolveCredentials
  } = useCRM();

  const { mode, toggleMode } = useTheme();

  const [selectedPreviewIndustry, setSelectedPreviewIndustry] = useState('software_it');
  const [interactiveQuery, setInteractiveQuery] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [pricingCycle, setPricingCycle] = useState('monthly'); // 'monthly' | 'annual'
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [registerModalMode, setRegisterModalMode] = useState('register'); // 'register' | 'enquiry'

  const currentPreset = industryPresets[selectedPreviewIndustry] || industryPresets.software_it;
  const currentTenant = tenants.find(t => t.industryId === selectedPreviewIndustry) || tenants[0];

  // Industry Icons map
  const getIndustryIcon = (id, size = 20) => {
    switch (id) {
      case 'software_it': return <Code2 size={size} />;
      case 'real_estate': return <Building2 size={size} />;
      case 'education': return <Sparkles size={size} />;
      case 'hospitals': return <HeartPulse size={size} />;
      case 'ecommerce': return <ShoppingBag size={size} />;
      case 'hospitality': return <Hotel size={size} />;
      case 'travel': return <Plane size={size} />;
      case 'manufacturing_b2b': return <Factory size={size} />;
      case 'financial_services': return <Landmark size={size} />;
      default: return <Building2 size={size} />;
    }
  };

  // 1-Click Launch Dashboard for a specific Company
  const handleLaunchCompanyDashboard = (tenantId, industryId, customEmail = null) => {
    const matchedTenant = tenants.find(t => t.id === tenantId) || tenants[0];
    const emailToUse = customEmail || matchedTenant.hrContact || `admin@${matchedTenant.name.toLowerCase().replace(/\s+/g, '')}.com`;
    
    login({
      email: emailToUse,
      tenantId: matchedTenant.id,
      industryId: industryId || matchedTenant.industryId,
      companyId: matchedTenant.id,
      role: 'Company Owner / Company Admin',
      name: emailToUse.split('@')[0].replace('.', ' ')
    });
  };

  // Run AI Simulation for selected industry
  const runAiSimulation = (sample = null) => {
    setIsSimulating(true);
    const queryToRun = sample || interactiveQuery || currentPreset.simulation?.sampleQuery || 'Can you explain your pricing and features?';
    
    setTimeout(() => {
      setSimulationResult({
        query: queryToRun,
        entities: currentPreset.simulation?.extractedEntities || { intent: 'Inquiry', score: 92 },
        response: currentPreset.simulation?.aiResponse || `Thank you for reaching out! Based on your requirement, I have personalized this recommendation for ${currentTenant.name}.`
      });
      setIsSimulating(false);
    }, 600);
  };

  return (
    <div className="public-landing-container" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', overflowX: 'hidden' }}>
      
      {/* 1. TOP NAVBAR */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: 'var(--bg-card)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border)',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'all 0.2s ease'
        }}
      >
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '12px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)'
            }}
          >
            <BotMessageSquare size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--text-main)' }}>
              Zenelait AI
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Multi-Tenant SaaS CRM 2.0
            </div>
          </div>
        </div>

        {/* Navigation Anchor Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '22px' }} className="public-nav-links">
          <a href="#four-pillars" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, transition: 'color 0.15s' }}>
            4 Pillars
          </a>
          <a href="#industries-showcase" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, transition: 'color 0.15s' }}>
            9 Industries
          </a>
          <a href="#ai-fleet" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, transition: 'color 0.15s' }}>
            AI Agents Fleet
          </a>
          <a href="#pricing" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, transition: 'color 0.15s' }}>
            Pricing
          </a>
        </nav>

        {/* Right CTA Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Light / Dark Mode */}
          <button
            className="btn btn-ghost btn-icon btn-sm"
            onClick={toggleMode}
            title="Toggle Light / Dark Mode"
          >
            {mode === 'dark' ? <Sun size={17} style={{ color: '#f59e0b' }} /> : <Moon size={17} />}
          </button>

          {/* Sign In Button */}
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setRegisterModalMode('register');
              setIsRegisterOpen(true);
            }}
            style={{ fontWeight: 700, padding: '6px 12px', fontSize: '0.8rem' }}
          >
            Register
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setViewMode('login')}
            style={{ fontWeight: 700, padding: '6px 14px', fontSize: '0.8rem' }}
          >
            Sign In
          </button>

          {/* Enquire / Get Software CTA */}
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => {
              setRegisterModalMode('enquiry');
              setIsRegisterOpen(true);
            }}
            style={{ fontWeight: 700, padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span>Get Started</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section
        style={{
          position: 'relative',
          padding: '80px 24px 60px',
          textAlign: 'center',
          maxWidth: '1180px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {/* Glow Effects */}
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '600px',
            height: '350px',
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.22) 0%, rgba(139, 92, 246, 0.08) 50%, rgba(0,0,0,0) 70%)',
            filter: 'blur(50px)',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />

        {/* Hero Top Tag */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '999px',
            backgroundColor: 'rgba(37, 99, 235, 0.12)',
            border: '1px solid rgba(37, 99, 235, 0.3)',
            color: '#3b82f6',
            fontSize: '0.8rem',
            fontWeight: 700,
            marginBottom: '24px',
            position: 'relative',
            zIndex: 1
          }}
        >
          <Sparkles size={14} /> Next-Generation Multi-Tenant AI CRM Platform
        </div>

        {/* Main Title */}
        <h1
          style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
            fontWeight: 900,
            lineHeight: 1.15,
            letterSpacing: '-1.5px',
            maxWidth: '960px',
            margin: '0 0 20px 0',
            position: 'relative',
            zIndex: 1
          }}
        >
          Autonomous AI Sales & Support Agents <br />
          <span
            style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #8b5cf6 50%, #ec4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Tailored for 9 Global Industries
          </span>
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: '1.1rem',
            color: 'var(--text-secondary)',
            maxWidth: '740px',
            lineHeight: 1.6,
            margin: '0 0 32px 0',
            position: 'relative',
            zIndex: 1
          }}
        >
          Deliver sub-second customer resolutions, automated lead qualification, and multi-tenant data isolation out of the box. Simply enter your company credential to launch your tailored CRM dashboard.
        </p>

        {/* Hero Action Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginBottom: '40px', position: 'relative', zIndex: 1 }}>
          <button
            type="button"
            className="btn btn-primary"
            style={{ padding: '10px 20px', fontSize: '0.875rem', fontWeight: 700, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 6px 20px rgba(37, 99, 235, 0.35)' }}
            onClick={() => setViewMode('login')}
          >
            <span>Sign In to Workspace</span>
            <ArrowRight size={15} />
          </button>

          <a
            href="#industries-showcase"
            className="btn btn-secondary"
            style={{ padding: '10px 18px', fontSize: '0.875rem', fontWeight: 600, borderRadius: 'var(--radius-md)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Building2 size={15} />
            <span>Explore 9 Workspaces</span>
          </a>

          <button
            type="button"
            className="btn btn-ghost"
            style={{ padding: '10px 16px', fontSize: '0.875rem', fontWeight: 600, color: '#d97706', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => {
              login({
                name: 'Master Chief (God Mode)',
                email: 'root@zenelait.ai',
                role: 'Ultra Super Admin',
                companyId: 'tenant-1'
              });
            }}
          >
            <Crown size={15} />
            <span>👑 Launch God Mode</span>
          </button>
        </div>

        {/* Hero Quick Key Metrics */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            width: '100%',
            maxWidth: '1000px',
            position: 'relative',
            zIndex: 1
          }}
        >
          {[
            { label: 'AI Response Latency', value: '< 45 seconds', icon: <Clock size={18} color="#10b981" />, sub: '24/7 instant omnichannel discovery' },
            { label: 'Autonomous Lead Accuracy', value: '99.4%', icon: <TargetIcon size={18} color="#3b82f6" />, sub: 'BANT qualification scoring' },
            { label: 'Multi-Tenant Isolation', value: '100% Isolated', icon: <ShieldCheck size={18} color="#8b5cf6" />, sub: 'Isolated DB, Vector & KMS keys' },
            { label: 'Turnkey Industry Presets', value: '9 Verticals', icon: <Layers size={18} color="#d97706" />, sub: 'IT, Real Estate, Health, EdTech+' }
          ].map((m, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '18px 16px',
                textAlign: 'left',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{m.label}</span>
                {m.icon}
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '2px' }}>{m.value}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{m.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. THE 4 PILLARS OF ZENELAIT AI SAAS */}
      <section id="four-pillars" style={{ padding: '70px 24px', backgroundColor: 'var(--bg-surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="badge badge-primary" style={{ fontSize: '0.75rem', padding: '4px 12px', marginBottom: '10px' }}>
              Architecture Breakdown
            </span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '8px 0', letterSpacing: '-0.5px' }}>
              Built upon 4 Architectural Pillars
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '620px', margin: '0 auto' }}>
              Zenelait AI unifies full-stack CRM records, autonomous AI employee fleets, drag-and-drop automations, and enterprise multi-tenancy.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            
            {/* PILLAR 1: CRM */}
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ width: 44, height: 44, borderRadius: '10px', backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <Users size={22} />
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Pillar 1
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 10px 0' }}>
                  CRM Engine
                </h3>
                <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                  High-velocity pipeline stages, full customer 360 profiles, lead scoring, follow-up calendars, and omnichannel chat histories.
                </p>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.78rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={14} color="#10b981" /> Customers & Inbound Leads</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={14} color="#10b981" /> Dynamic Pipeline Stages</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={14} color="#10b981" /> Follow-ups & Appointments</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={14} color="#10b981" /> Omnichannel Conversation History</li>
              </ul>
            </div>

            {/* PILLAR 2: AI AGENT */}
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ width: 44, height: 44, borderRadius: '10px', backgroundColor: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <BotMessageSquare size={22} />
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8b5cf6', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Pillar 2
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 10px 0' }}>
                  AI Agent Fleet
                </h3>
                <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                  Autonomous 24/7 AI agents executing sales qualification, RAG knowledge retrieval, and zero-friction handover to live reps.
                </p>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.78rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={14} color="#10b981" /> Customer Support & Sales Agents</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={14} color="#10b981" /> Knowledge RAG Document Answering</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={14} color="#10b981" /> Automated Lead Scoring (0-100)</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={14} color="#10b981" /> Seamless Human Handover Protocol</li>
              </ul>
            </div>

            {/* PILLAR 3: AUTOMATION */}
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ width: 44, height: 44, borderRadius: '10px', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <Zap size={22} />
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Pillar 3
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 10px 0' }}>
                  Automation Core
                </h3>
                <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                  Condition-based trigger logic, automated WhatsApp drips, SLA alerts, calendar meeting reservations, and webhook sync.
                </p>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.78rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={14} color="#10b981" /> Triggers, Conditions & Actions</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={14} color="#10b981" /> Multi-Step Follow-up Drips</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={14} color="#10b981" /> Instant Push & SMS Notifications</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={14} color="#10b981" /> Automated Appointment Booking</li>
              </ul>
            </div>

            {/* PILLAR 4: SAAS PLATFORM */}
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ width: 44, height: 44, borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <Building2 size={22} />
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Pillar 4
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 10px 0' }}>
                  SaaS Multi-Tenancy
                </h3>
                <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                  Strict company isolation, subscription management, seat & AI token quotas, and Ultra Super Admin God-Mode governance.
                </p>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.78rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={14} color="#10b981" /> Full Multi-Tenant Database Isolation</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={14} color="#10b981" /> 7 Built-in Persona & MVP Roles</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={14} color="#10b981" /> Subscription Limits & Quotas Engine</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={14} color="#10b981" /> Ultra Super Admin Command Center</li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE 9 INDUSTRIES SHOWCASE & DASHBOARD LAUNCHER */}
      <section id="industries-showcase" style={{ padding: '80px 24px', maxWidth: '1180px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <span className="badge badge-warning" style={{ fontSize: '0.75rem', padding: '4px 12px', marginBottom: '10px' }}>
            Interactive Directory
          </span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '8px 0', letterSpacing: '-0.5px' }}>
            9 Pre-Configured Industry Solutions
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '680px', margin: '0 auto' }}>
            Click on any vertical to test its isolated AI agents and launch directly into that company's real dashboard.
          </p>
        </div>

        {/* 9 Industry Pill Buttons */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            justifyContent: 'center',
            marginBottom: '32px'
          }}
        >
          {Object.values(industryPresets).map((preset) => {
            const isSelected = selectedPreviewIndustry === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setSelectedPreviewIndustry(preset.id);
                  setSimulationResult(null);
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '999px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  backgroundColor: isSelected ? (preset.color || '#2563eb') : 'var(--bg-card)',
                  color: isSelected ? '#ffffff' : 'var(--text-main)',
                  border: isSelected ? `1px solid ${preset.color || '#2563eb'}` : '1px solid var(--border)',
                  boxShadow: isSelected ? `0 4px 14px ${(preset.color || '#2563eb')}44` : 'none'
                }}
              >
                {getIndustryIcon(preset.id, 15)}
                <span>{preset.shortName}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Industry Dynamic Preview Box */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: `1px solid ${currentPreset.color ? `${currentPreset.color}55` : 'var(--border)'}`,
            padding: '32px',
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: '28px',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.25)',
            position: 'relative',
            overflow: 'hidden'
          }}
          className="industry-preview-grid"
        >
          {/* Left: Industry Overview & Live Dashboard Launcher */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '10px',
                  backgroundColor: `${currentPreset.color}22`,
                  color: currentPreset.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {getIndustryIcon(currentPreset.id, 20)}
              </div>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                  {currentTenant.name}
                </h3>
                <div style={{ fontSize: '0.78rem', color: currentPreset.color, fontWeight: 700 }}>
                  {currentPreset.name} • {currentTenant.plan} ({currentTenant.seats} Seats)
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
              {currentPreset.description}
            </p>

            {/* AI Agents for this Tenant */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '10px' }}>
                🤖 Active Autonomous AI Employees ({currentPreset.aiEmployees.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {currentPreset.aiEmployees.map((agent) => (
                  <div
                    key={agent.id}
                    style={{
                      padding: '10px 14px',
                      backgroundColor: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.2rem' }}>{agent.avatar}</span>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{agent.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{agent.role}</div>
                      </div>
                    </div>
                    <span className="badge badge-qualified" style={{ fontSize: '0.68rem' }}>
                      {agent.accuracy} Accuracy
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Dashboard Launch Button */}
            <button
              type="button"
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '10px 16px',
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                backgroundColor: currentPreset.color || '#2563eb'
              }}
              onClick={() => handleLaunchCompanyDashboard(currentTenant.id, currentPreset.id, currentTenant.hrContact)}
            >
              <span>Launch {currentTenant.name ? (currentTenant.name.length > 18 ? currentTenant.name.substring(0, 16) + '...' : currentTenant.name) : 'Workspace'}</span>
              <ArrowRight size={15} />
            </button>
          </div>

          {/* Right: Interactive AI Discovery Simulator */}
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                  ⚡ Live AI Agent Simulator
                </span>
                <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>Sub-Second RAG</span>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                Sample Customer Query for {currentPreset.shortName}:
              </div>

              <div
                style={{
                  padding: '12px',
                  backgroundColor: 'var(--bg-card)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  fontSize: '0.82rem',
                  color: 'var(--text-main)',
                  fontStyle: 'italic',
                  marginBottom: '14px',
                  lineHeight: 1.4
                }}
              >
                "{currentPreset.simulation?.sampleQuery || 'Can you explain the qualification workflow?'}"
              </div>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                onClick={() => runAiSimulation(currentPreset.simulation?.sampleQuery)}
                disabled={isSimulating}
              >
                <Play size={13} />
                <span>{isSimulating ? 'AI Processing & Qualifying...' : 'Run Live AI Qualification'}</span>
              </button>

              {/* Simulation Result */}
              {simulationResult ? (
                <div
                  style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                    animation: 'fadeIn 0.25s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981' }}>
                      ✓ Lead Score: {simulationResult.entities?.leadScore || 94}/100 (Qualified)
                    </span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>0.4s response</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-main)', lineHeight: 1.45 }}>
                    {simulationResult.response}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 10px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  Click "Run Live AI Qualification" to test the instant extraction and conversational response.
                </div>
              )}
            </div>

            {/* Footer credentials reminder */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px', marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              <span>HR Email: <strong>{currentTenant.hrContact}</strong></span>
              <span style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }} onClick={() => setViewMode('login')}>
                Sign In Screen ➔
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* 5. TRANSPARENT SAAS PRICING */}
      <section id="pricing" style={{ padding: '80px 24px', backgroundColor: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span className="badge badge-primary" style={{ fontSize: '0.75rem', padding: '4px 12px', marginBottom: '10px' }}>
              Multi-Tenant SaaS Plans
            </span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '8px 0', letterSpacing: '-0.5px' }}>
              Simple, Transparent Pricing per Company
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto' }}>
              Every plan includes full tenant isolation, 24/7 autonomous AI agents, and custom domain mapping.
            </p>

            {/* Monthly / Annual Toggle */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px',
                backgroundColor: 'var(--bg-card)',
                borderRadius: '999px',
                border: '1px solid var(--border)',
                marginTop: '20px'
              }}
            >
              <button
                type="button"
                className={`btn btn-xs ${pricingCycle === 'monthly' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ borderRadius: '999px', padding: '6px 16px' }}
                onClick={() => setPricingCycle('monthly')}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                className={`btn btn-xs ${pricingCycle === 'annual' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ borderRadius: '999px', padding: '6px 16px' }}
                onClick={() => setPricingCycle('annual')}
              >
                Annual (Save 20%)
              </button>
            </div>
          </div>

          {/* PROMOTIONAL LAUNCH BANNER */}
          <div
            style={{
              padding: '12px 20px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              maxWidth: '850px',
              margin: '0 auto 28px',
              textAlign: 'center'
            }}
          >
            <Sparkles size={18} color="#10b981" />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
              SPECIAL LAUNCH OFFER: Super Admin has temporarily enabled all 3 packages at <span style={{ color: '#10b981' }}>₹0 / Free Trial</span>! Register your tenant on this common page with ₹0 initial payment.
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            {[
              {
                name: 'Starter Plan',
                planId: 'Starter',
                price: '₹0',
                originalPrice: pricingCycle === 'monthly' ? '₹4,999' : '₹3,999',
                period: '/month',
                desc: 'Perfect for small software teams & boutique agencies.',
                seats: '5 Team Seats',
                aiAgents: '2 Autonomous AI Agents',
                storage: '25 GB Storage',
                quota: '10,000 AI Messages/mo',
                color: '#3b82f6',
                popular: false,
                isFreeTrial: true
              },
              {
                name: 'Professional',
                planId: 'Professional',
                price: '₹0',
                originalPrice: pricingCycle === 'monthly' ? '₹14,999' : '₹11,999',
                period: '/month',
                desc: 'Full Software/IT CRM + HRMS Pro + Recruitment ATS + AI Employees.',
                seats: '25 Team Seats',
                aiAgents: '4 Autonomous AI Agents',
                storage: '100 GB Storage',
                quota: '50,000 AI Messages/mo',
                color: '#8b5cf6',
                popular: true,
                isFreeTrial: true
              },
              {
                name: 'Enterprise Pro',
                planId: 'Enterprise',
                price: '₹0',
                originalPrice: pricingCycle === 'monthly' ? '₹34,999' : '₹27,999',
                period: '/month',
                desc: 'Omnichannel WhatsApp, custom Vector RAG, and full IT product suite.',
                seats: '100 Team Seats',
                aiAgents: 'Unlimited AI Agents',
                storage: '500 GB Storage',
                quota: '250,000 AI Messages/mo',
                color: '#10b981',
                popular: false,
                isFreeTrial: true
              },
              {
                name: 'Ultra SaaS White-Label',
                price: pricingCycle === 'monthly' ? '₹39,999' : '₹31,999',
                period: '/month',
                desc: 'Full platform root God-Mode to resell SaaS to unlimited companies.',
                seats: 'Unlimited Companies',
                aiAgents: 'All 9 Industry Fleets',
                storage: 'Multi-TB Glacier Backup',
                quota: 'Unlimited AI Model Mesh',
                color: '#d97706',
                popular: false,
                tenantId: 'tenant-1',
                isGodMode: true
              }
            ].map((plan, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  border: plan.popular ? '2px solid #8b5cf6' : '1px solid var(--border)',
                  padding: '28px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  boxShadow: plan.popular ? '0 10px 30px rgba(139, 92, 246, 0.2)' : 'none'
                }}
              >
                {plan.popular && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-12px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: '#8b5cf6',
                      color: '#ffffff',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '3px 12px',
                      borderRadius: '999px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    ★ Recommended Free Trial
                  </div>
                )}

                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 6px 0', color: plan.color }}>
                    {plan.name}
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    {plan.desc}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '20px' }}>
                    <span style={{ fontSize: '2rem', fontWeight: 900, color: plan.isFreeTrial ? '#10b981' : 'var(--text-main)' }}>{plan.price}</span>
                    {plan.originalPrice && (
                      <span style={{ fontSize: '0.85rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>{plan.originalPrice}</span>
                    )}
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{plan.period}</span>
                    {plan.isFreeTrial && (
                      <span className="badge badge-success" style={{ fontSize: '0.62rem', marginLeft: 'auto' }}>100% FREE TRIAL</span>
                    )}
                  </div>

                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem', marginBottom: '24px' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={14} color="#10b981" /> {plan.seats}</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={14} color="#10b981" /> {plan.aiAgents}</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={14} color="#10b981" /> {plan.storage}</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={14} color="#10b981" /> {plan.quota}</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={14} color="#10b981" /> Isolated DB &amp; Vector Index</li>
                  </ul>
                </div>

                <button
                  type="button"
                  className={`btn ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    fontSize: '0.825rem',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                  onClick={() => {
                    if (plan.isGodMode) {
                      login({
                        name: 'Master Chief (God Mode)',
                        email: 'root@zenelait.ai',
                        role: 'Ultra Super Admin',
                        companyId: 'tenant-1'
                      });
                    } else {
                      setRegisterModalMode('register');
                      setIsRegisterOpen(true);
                    }
                  }}
                >
                  {plan.isGodMode ? '👑 Launch God Mode' : 'Start Free Trial (₹0)'}
                </button>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 6. TRUST & COMPLIANCE BAR */}
      <section style={{ padding: '36px 24px', backgroundColor: 'var(--bg-main)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-around', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <ShieldCheck size={18} color="#10b981" /> SOC2 Type II Certified
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <Lock size={18} color="#3b82f6" /> 256-Bit TLS & At-Rest Encryption
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <HeartPulse size={18} color="#ef4444" /> HIPAA Healthcare Compliant
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <Activity size={18} color="#f59e0b" /> 99.99% Guaranteed SLA Uptime
          </div>
        </div>
      </section>

      {/* 7. PUBLIC FOOTER */}
      <footer style={{ padding: '48px 24px 32px', backgroundColor: 'var(--bg-card)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '32px', marginBottom: '40px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{ width: 32, height: 32, borderRadius: '8px', backgroundColor: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BotMessageSquare size={18} />
                </div>
                <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>Zenelait AI</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                The autonomous multi-tenant CRM SaaS platform powering sales, support, and RAG document intelligence across 9 industries.
              </p>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                © 2026 Zenelait AI Inc. All rights reserved.
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '12px' }}>Company Directories</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.78rem' }}>
                {tenants.slice(0, 5).map(t => (
                  <li key={t.id}>
                    <span
                      style={{ color: 'var(--text-secondary)', cursor: 'pointer', transition: 'color 0.15s' }}
                      onClick={() => handleLaunchCompanyDashboard(t.id, t.industryId)}
                    >
                      {t.name} ({industryPresets[t.industryId]?.shortName})
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '12px' }}>Enterprise Verticals</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.78rem' }}>
                {tenants.slice(5, 9).map(t => (
                  <li key={t.id}>
                    <span
                      style={{ color: 'var(--text-secondary)', cursor: 'pointer', transition: 'color 0.15s' }}
                      onClick={() => handleLaunchCompanyDashboard(t.id, t.industryId)}
                    >
                      {t.name} ({industryPresets[t.industryId]?.shortName})
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '12px' }}>Workspace Access</div>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                style={{ width: '100%', marginBottom: '8px', fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                onClick={() => setViewMode('login')}
              >
                Sign In to Dashboard
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ width: '100%', color: '#d97706', fontSize: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                onClick={() => {
                  login({
                    name: 'Master Chief (God Mode)',
                    email: 'root@zenelait.ai',
                    role: 'Ultra Super Admin',
                    companyId: 'tenant-1'
                  });
                }}
              >
                👑 Launch God Mode
              </button>
            </div>
          </div>

        </div>
      </footer>

      {/* Registration & Public Enquiry Modal */}
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        initialMode={registerModalMode}
        onSwitchToLogin={() => setViewMode('app')}
      />

    </div>
  );
}

// Small Helper Icon
function TargetIcon({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}
