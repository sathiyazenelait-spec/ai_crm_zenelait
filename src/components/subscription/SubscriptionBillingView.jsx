import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  CreditCard,
  Sparkles,
  Check,
  Download,
  ShieldCheck,
  Zap,
  HardDrive,
  MessageSquare,
  Bot,
  Crown,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Building,
  RefreshCw,
  ExternalLink,
  Lock,
  X
} from 'lucide-react';

export function SubscriptionBillingView() {
  const { subscriptionData, currentUserRole, addNotification, navigateTo } = useCRM();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'usage' | 'invoices' | 'payment'
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [invoiceFilter, setInvoiceFilter] = useState('all');

  const isUltraAdmin =
    currentUserRole === 'Ultra Super Admin' ||
    currentUserRole?.includes('God') ||
    currentUserRole?.toLowerCase().includes('ultra');

  // Defensive data normalization with comprehensive fallbacks
  const data = subscriptionData || {};
  const planName = data.planName || data.plan || (isUltraAdmin ? 'Supreme God Mode (Omnipotent)' : 'Professional Plan');
  const billingCycle = data.billingCycle || (isUltraAdmin ? 'Platform Root • Unrestricted Lifetime Enterprise Infrastructure' : 'Annual • Renews on Nov 28, 2026');
  const price = data.price || (isUltraAdmin ? 'Platform Unlimited (Free Root)' : '₹ 5,999 / month');

  // Safe usage metrics
  const usage = data.usage || {};
  const aiMessages = usage.aiMessages || {
    used: isUltraAdmin ? 142000 : 4320,
    limit: isUltraAdmin ? 'Unlimited' : 10000,
    label: isUltraAdmin ? '142,000 / Unlimited' : '4,320 / 10,000'
  };
  const aiAgents = usage.aiAgents || {
    used: isUltraAdmin ? 36 : 4,
    limit: isUltraAdmin ? 'Unlimited' : 5,
    label: isUltraAdmin ? '36 / Unlimited' : '4 / 5'
  };
  const storage = usage.storage || {
    used: isUltraAdmin ? 142.5 : 3.2,
    limit: isUltraAdmin ? 'Unlimited' : 10,
    label: isUltraAdmin ? '142.5 GB / Unlimited' : '3.2 GB / 10 GB'
  };
  const connectedChannels = usage.connectedChannels || {
    used: isUltraAdmin ? 24 : 4,
    limit: isUltraAdmin ? 'Unlimited' : 6,
    label: isUltraAdmin ? '24 / Unlimited' : '4 / 6'
  };

  // Safe percentage helper
  const getPercent = (used, limit) => {
    if (isUltraAdmin || limit === 'Unlimited') return 100;
    const u = typeof used === 'number' ? used : parseFloat(used) || 0;
    const l = typeof limit === 'number' ? limit : parseFloat(limit) || 1;
    return Math.min(100, Math.max(0, Math.round((u / l) * 100)));
  };

  const invoices = Array.isArray(data.invoices) && data.invoices.length > 0
    ? data.invoices
    : [
        { id: isUltraAdmin ? 'INV-ROOT-001' : 'INV-2026-001', date: '28 Sep 2026', amount: isUltraAdmin ? '₹0 (Platform License)' : '₹ 5,999', status: 'Paid' },
        { id: isUltraAdmin ? 'INV-ROOT-002' : 'INV-2026-002', date: '28 Aug 2026', amount: isUltraAdmin ? '₹0 (Platform License)' : '₹ 5,999', status: 'Paid' },
        { id: isUltraAdmin ? 'INV-ROOT-003' : 'INV-2026-003', date: '28 Jul 2026', amount: isUltraAdmin ? '₹0 (Platform License)' : '₹ 5,999', status: 'Paid' }
      ];

  const filteredInvoices = invoices.filter(inv => {
    if (invoiceFilter === 'all') return true;
    return inv.status?.toLowerCase() === invoiceFilter;
  });

  const paymentMethod = data.paymentMethod || {
    type: isUltraAdmin ? 'Omnipotent Platform Root Account' : 'Visa',
    last4: isUltraAdmin ? 'ROOT' : '4242',
    expires: isUltraAdmin ? 'Lifetime' : '12/28'
  };

  const handleDownloadInvoice = (invId) => {
    addNotification({
      type: 'success',
      title: `Invoice #${invId} downloaded successfully`,
      category: 'Billing'
    });
  };

  return (
    <div className="subscription-billing-view">
      <div className="page-title-row">
        <div className="page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1>Subscription & Billing</h1>
            {isUltraAdmin && (
              <span className="badge badge-amber" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem' }}>
                <Crown size={12} />
                <span>God-Mode Active</span>
              </span>
            )}
          </div>
          <p>
            {isUltraAdmin
              ? 'Omnipotent platform root billing engine: zero platform fees, infinite quotas, and unrestricted multi-tenant licensing.'
              : 'Manage SaaS plan tiers, usage quotas, invoice receipts, and payment methods.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {isUltraAdmin ? (
            <button
              className="btn btn-secondary"
              onClick={() => navigateTo('platform-admin')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Building size={15} />
              <span>Platform Multi-Tenant Hub</span>
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={() => setIsUpgradeModalOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Sparkles size={15} />
              <span>Upgrade Plan</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="crm-card" style={{ marginBottom: '20px', padding: '10px 18px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'usage', label: 'Quota Breakdown' },
            { id: 'invoices', label: `Invoices (${invoices.length})` },
            { id: 'payment', label: 'Payment Method & License' }
          ].map((t) => (
            <button
              key={t.id}
              className={`btn btn-sm ${activeTab === t.id ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {(activeTab === 'overview' || activeTab === 'usage') && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '20px', marginBottom: '24px' }}>
          
          {/* Current Plan Card */}
          <div
            className="crm-card"
            style={{
              padding: '24px',
              background: isUltraAdmin
                ? 'linear-gradient(135deg, rgba(217, 119, 6, 0.12) 0%, rgba(245, 158, 11, 0.08) 100%)'
                : 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)',
              border: isUltraAdmin ? '1px solid rgba(217, 119, 6, 0.3)' : '1px solid rgba(37, 99, 235, 0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span
                  className={isUltraAdmin ? 'badge badge-amber' : 'badge badge-primary'}
                  style={{ fontSize: '0.72rem', marginBottom: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  {isUltraAdmin ? <Crown size={11} /> : <ShieldCheck size={11} />}
                  {isUltraAdmin ? 'OMNIPOTENT ROOT LICENSE' : 'CURRENT ACTIVE PLAN'}
                </span>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '4px 0' }}>{planName}</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>{billingCycle}</p>
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: isUltraAdmin ? '#d97706' : 'var(--primary)' }}>
                {price}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              <div style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} style={{ color: '#10b981' }} />
                <span>Unlimited Omnichannel WhatsApp, Email & Web Conversations</span>
              </div>
              <div style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} style={{ color: '#10b981' }} />
                <span>{isUltraAdmin ? 'Uncapped Autonomous AI Employees across all tenants' : 'Up to 5 Autonomous AI Employees'}</span>
              </div>
              <div style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} style={{ color: '#10b981' }} />
                <span>{isUltraAdmin ? 'Unlimited AI Messages & LLM tokens included' : '10,000 AI Messages / month included'}</span>
              </div>
              <div style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} style={{ color: '#10b981' }} />
                <span>Dedicated Enterprise Account Manager & 99.99% Cloud SLA</span>
              </div>
            </div>

            {isUltraAdmin ? (
              <div
                style={{
                  padding: '10px 14px',
                  backgroundColor: 'rgba(217, 119, 6, 0.12)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(217, 119, 6, 0.25)',
                  fontSize: '0.78rem',
                  color: 'var(--text-main)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Lock size={14} style={{ color: '#d97706', flexShrink: 0 }} />
                <span>Permanent Root Privileges Active. All platform-wide quotas unlocked.</span>
              </div>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() => setIsUpgradeModalOpen(true)}
                style={{ width: '100%' }}
              >
                Upgrade to Enterprise
              </button>
            )}
          </div>

          {/* Usage Quotas Box */}
          <div className="crm-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Monthly Usage Quotas</h3>
              <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                Status: Healthy
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Meter 1: AI Messages */}
              <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MessageSquare size={13} style={{ color: '#3b82f6' }} />
                    <span>AI Messages</span>
                  </span>
                  <span style={{ fontWeight: 600 }}>{aiMessages.label}</span>
                </div>
                <div className="progress-bar-bg" style={{ height: 6 }}>
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${getPercent(aiMessages.used, aiMessages.limit)}%`,
                      backgroundColor: '#3b82f6'
                    }}
                  />
                </div>
              </div>

              {/* Meter 2: Active AI Agents */}
              <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Bot size={13} style={{ color: '#8b5cf6' }} />
                    <span>Active AI Agents</span>
                  </span>
                  <span style={{ fontWeight: 600 }}>{aiAgents.label}</span>
                </div>
                <div className="progress-bar-bg" style={{ height: 6 }}>
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${getPercent(aiAgents.used, aiAgents.limit)}%`,
                      backgroundColor: '#8b5cf6'
                    }}
                  />
                </div>
              </div>

              {/* Meter 3: Storage */}
              <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <HardDrive size={13} style={{ color: '#10b981' }} />
                    <span>Knowledge Storage</span>
                  </span>
                  <span style={{ fontWeight: 600 }}>{storage.label}</span>
                </div>
                <div className="progress-bar-bg" style={{ height: 6 }}>
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${getPercent(storage.used, storage.limit)}%`,
                      backgroundColor: '#10b981'
                    }}
                  />
                </div>
              </div>

              {/* Meter 4: Channels */}
              <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Zap size={13} style={{ color: '#f59e0b' }} />
                    <span>Connected Channels</span>
                  </span>
                  <span style={{ fontWeight: 600 }}>{connectedChannels.label}</span>
                </div>
                <div className="progress-bar-bg" style={{ height: 6 }}>
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${getPercent(connectedChannels.used, connectedChannels.limit)}%`,
                      backgroundColor: '#f59e0b'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: INVOICES & PAYMENT ROW */}
      {(activeTab === 'overview' || activeTab === 'invoices' || activeTab === 'payment') && (
        <div style={{ display: 'grid', gridTemplateColumns: activeTab === 'overview' ? '2fr 1fr' : '1fr', gap: '20px' }}>
          
          {/* Invoices Table */}
          {(activeTab === 'overview' || activeTab === 'invoices') && (
            <div className="crm-card">
              <div className="crm-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="crm-card-title">
                  <span>Billing History & Invoices</span>
                </div>

                {activeTab === 'invoices' && (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {['all', 'paid', 'pending'].map(st => (
                      <button
                        key={st}
                        className={`btn btn-xs ${invoiceFilter === st ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setInvoiceFilter(st)}
                        style={{ textTransform: 'capitalize' }}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="table-responsive">
                <table className="crm-table">
                  <thead>
                    <tr>
                      <th>Invoice No</th>
                      <th>Billing Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map((inv) => (
                      <tr key={inv.id}>
                        <td style={{ fontWeight: 600 }}>{inv.id}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{inv.date}</td>
                        <td style={{ fontWeight: 600 }}>{inv.amount}</td>
                        <td>
                          <span className={`badge ${inv.status === 'Paid' ? 'badge-qualified' : 'badge-warning'}`}>
                            {inv.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-ghost btn-xs"
                            onClick={() => handleDownloadInvoice(inv.id)}
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)' }}
                          >
                            <Download size={13} />
                            <span>PDF</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredInvoices.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>
                          No invoices matching the selected filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Payment Method Card */}
          {(activeTab === 'overview' || activeTab === 'payment') && (
            <div className="crm-card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 14px 0' }}>Payment Method & License</h3>

              <div
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface)',
                  border: isUltraAdmin ? '1px solid rgba(217, 119, 6, 0.3)' : '1px solid var(--border)',
                  marginBottom: '14px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {isUltraAdmin ? <Crown size={15} style={{ color: '#d97706' }} /> : <CreditCard size={15} />}
                    {paymentMethod.type}
                  </span>
                  <span className={isUltraAdmin ? 'badge badge-amber' : 'badge badge-primary'} style={{ fontSize: '0.65rem' }}>
                    {isUltraAdmin ? 'Platform Root' : 'Default'}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', letterSpacing: '1px' }}>
                  {isUltraAdmin ? 'ROOT-KEY-UNLIMITED-ACCESS' : `•••• •••• •••• ${paymentMethod.last4}`}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Expires: {paymentMethod.expires}
                </div>
              </div>

              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  addNotification({
                    type: 'info',
                    title: isUltraAdmin
                      ? 'Root omnipotent licensing credentials verified.'
                      : 'Payment method update gateway opened.',
                    category: 'Billing'
                  });
                }}
                style={{ width: '100%' }}
              >
                {isUltraAdmin ? 'Verify License Security' : 'Update Card Details'}
              </button>
            </div>
          )}

        </div>
      )}

      {/* Upgrade Plan Modal Simulation */}
      {isUpgradeModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsUpgradeModalOpen(false)}>
          <div className="crm-modal" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="crm-modal-header">
              <h2>
                <Sparkles size={18} style={{ color: 'var(--primary)' }} />
                Select Subscription Tier
              </h2>
              <button type="button" className="btn-close" onClick={() => setIsUpgradeModalOpen(false)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <div className="crm-modal-body">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                Scale your autonomous CRM with dedicated AI agents, omnichannel volume, and custom SLAs.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)' }}>
                  <h4 style={{ margin: '0 0 6px 0', fontWeight: 700 }}>Professional</h4>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '8px' }}>₹ 5,999 / mo</div>
                  <ul style={{ fontSize: '0.78rem', paddingLeft: '18px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px', margin: 0 }}>
                    <li>Up to 5 AI Employees</li>
                    <li>10,000 AI Messages</li>
                    <li>WhatsApp & Email integrations</li>
                  </ul>
                </div>

                <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', border: '2px solid var(--primary)', backgroundColor: 'rgba(37, 99, 235, 0.05)', position: 'relative' }}>
                  <span className="badge badge-primary" style={{ fontSize: '0.65rem', marginBottom: '6px' }}>POPULAR</span>
                  <h4 style={{ margin: '0 0 6px 0', fontWeight: 700 }}>Enterprise</h4>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '8px' }}>₹ 14,999 / mo</div>
                  <ul style={{ fontSize: '0.78rem', paddingLeft: '18px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px', margin: 0 }}>
                    <li>Unlimited AI Employees</li>
                    <li>100,000 AI Messages</li>
                    <li>Dedicated IP & SLA Guarantee</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="crm-modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setIsUpgradeModalOpen(false)}>Close</button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setIsUpgradeModalOpen(false);
                  addNotification({
                    type: 'success',
                    title: 'Tier upgrade request submitted to your Account Executive.',
                    category: 'Billing'
                  });
                }}
              >
                Confirm Upgrade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
