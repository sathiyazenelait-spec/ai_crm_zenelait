import React from 'react';
import { useCRM } from '../../context/CRMContext';
import { Sparkles, Check, ArrowRight, ShieldCheck, Zap, HelpCircle, Video, MessageCircle } from 'lucide-react';

export function SubscriptionView() {
  const { navigateTo } = useCRM();

  return (
    <div>
      <div className="page-title-row">
        <div className="page-title-group">
          <h1>Subscription & Usage</h1>
          <p>Manage your tier limits, monthly token quotas, and billing invoices</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => alert('Redirecting to Stripe Billing Portal...')}
        >
          <Sparkles size={16} />
          <span>Upgrade to Enterprise</span>
        </button>
      </div>

      {/* Plan Card */}
      <div className="crm-card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%)', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <span className="badge badge-qualified" style={{ marginBottom: '8px' }}>Active Plan</span>
            <h2 style={{ fontSize: '1.6rem', marginTop: '4px' }}>Pro Plan — $99/mo</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Your next billing cycle renews on <strong>October 12, 2026</strong> via Visa ending in 4242.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-secondary" onClick={() => alert('Downloading invoice...')}>Download Invoices</button>
            <button className="btn btn-primary">Change Plan</button>
          </div>
        </div>

        {/* Usage meters */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '6px' }}>
              <span>Monthly Inbound Leads</span>
              <strong>248 / 1,000</strong>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: '25%' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '6px' }}>
              <span>AI Agent Tokens</span>
              <strong>68% Used</strong>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: '68%' }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '6px' }}>
              <span>Team Seats</span>
              <strong>5 / 10 Active</strong>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: '50%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Help & Tutorials Grid */}
      <div className="grid-3">
        <div className="crm-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
            <Video size={18} />
          </div>
          <h3 style={{ fontSize: '1rem' }}>Video Tutorials</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Step-by-step masterclasses on building multi-channel AI lead qualification bots.
          </p>
          <button className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start', color: 'var(--primary)', padding: 0 }}>
            Watch Videos →
          </button>
        </div>

        <div className="crm-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
            <HelpCircle size={18} />
          </div>
          <h3 style={{ fontSize: '1rem' }}>Knowledge Base Docs</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Explore API documentation, webhooks, and custom integration tutorials.
          </p>
          <button
            className="btn btn-ghost btn-sm"
            style={{ alignSelf: 'flex-start', color: '#10b981', padding: 0 }}
            onClick={() => navigateTo('knowledge-base')}
          >
            Open Docs →
          </button>
        </div>

        <div className="crm-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(236, 72, 153, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ec4899' }}>
            <MessageCircle size={18} />
          </div>
          <h3 style={{ fontSize: '1rem' }}>Live Priority Support</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Connect instantly with our sales engineering team via omnichannel live chat.
          </p>
          <button
            className="btn btn-ghost btn-sm"
            style={{ alignSelf: 'flex-start', color: '#ec4899', padding: 0 }}
            onClick={() => navigateTo('conversations')}
          >
            Start Chat →
          </button>
        </div>
      </div>
    </div>
  );
}
