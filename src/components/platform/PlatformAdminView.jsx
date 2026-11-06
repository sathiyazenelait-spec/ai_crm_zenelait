import React, { useState, useEffect } from 'react';
import { useCRM } from '../../context/CRMContext';
import { platformService } from '../../services/platformService';
import { DataTable } from '../common/DataTable';
import { StatusBadge } from '../common/StatusBadge';
import {
  Crown,
  Building2,
  Users,
  Bot,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Plus,
  ArrowRight,
  Search,
  ExternalLink,
  Layers,
  Sparkles,
  Zap,
  Activity,
  CheckCircle2,
  Globe,
  Sliders,
  Lock,
  Unlock,
  AlertTriangle,
  Radio,
  Server,
  Database,
  Cpu,
  HardDrive,
  RefreshCw,
  Send,
  Eye,
  Settings2,
  CreditCard,
  UserX,
  UserCheck,
  Terminal,
  FileSpreadsheet,
  Check,
  X,
  Copy,
  Archive,
  BarChart3,
  Percent,
  Receipt,
  RotateCcw,
  Clock,
  Briefcase,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';

export function PlatformAdminView() {
  const {
    tenants,
    switchTenant,
    platformRoles,
    industryPresets,
    setActiveModal,
    switchIndustry,
    currentUserRole,
    switchRole,
    impersonateTenant,
    startDelegatedAccess,
    terminateDelegatedAccess,
    impersonationSession,
    updateTenantLimits,
    updateTenantStatus,
    globalAiConfig,
    updateGlobalAiConfig,
    systemBackups,
    triggerDatabaseBackup,
    isEmergencyLockdown,
    toggleEmergencyLockdown,
    globalAnnouncements,
    broadcastGlobalAnnouncement,
    addNotification
  } = useCRM();

  // Navigation Category & Active Module
  const [activeNav, setActiveNav] = useState('overview'); 
  // 'overview' | 'tenants' | 'provisioning' | 'queries' | 'package-settings' | 'package-comparison' | 'feature-quotas' | 'tenant-subscriptions' | 'revenue-dashboard' | 'mrr-arr' | 'revenue-vertical' | 'revenue-package' | 'payments' | 'invoices' | 'refunds' | 'failed-payments' | 'tax-reports' | 'ai-profitability' | 'ai-fleet' | 'ai-gateways' | 'ai-governance' | 'ai-costs' | 'global-users' | 'integrations' | 'monitoring' | 'security' | 'audit-logs' | 'impersonation' | 'emergency' | 'backups' | 'announcements' | 'feature-flags' | 'config' | 'reports' | 'root-account'

  const [industryFilter, setIndustryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Quota editor modal state
  const [editingTenant, setEditingTenant] = useState(null);
  const [quotaSeats, setQuotaSeats] = useState(25);
  const [quotaStorage, setQuotaStorage] = useState(100);
  const [quotaAiMessages, setQuotaAiMessages] = useState(50000);
  const [quotaPlan, setQuotaPlan] = useState('Enterprise Sovereign');

  // Delegated Access Request Modal State
  const [delegatedModalTenant, setDelegatedModalTenant] = useState(null);
  const [delegatedReason, setDelegatedReason] = useState('Administrative diagnostic review & tenant support');
  const [delegatedAccessMode, setDelegatedAccessMode] = useState('READ_ONLY');

  // Package Form Modal State
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [pkgName, setPkgName] = useState('');
  const [pkgCode, setPkgCode] = useState('');
  const [pkgDescription, setPkgDescription] = useState('');
  const [pkgPriceMonthly, setPkgPriceMonthly] = useState(4999);
  const [pkgPriceQuarterly, setPkgPriceQuarterly] = useState(13999);
  const [pkgPriceYearly, setPkgPriceYearly] = useState(49999);
  const [pkgTrialDays, setPkgTrialDays] = useState(14);
  const [pkgMaxUsers, setPkgMaxUsers] = useState(25);
  const [pkgMaxAiAgents, setPkgMaxAiAgents] = useState(5);
  const [pkgStorageGb, setPkgStorageGb] = useState(100);
  const [pkgAiCredits, setPkgAiCredits] = useState(50000);
  const [pkgWhatsappMessages, setPkgWhatsappMessages] = useState(10000);
  const [pkgApiRequests, setPkgApiRequests] = useState(100000);
  const [pkgFeatures, setPkgFeatures] = useState([
    'CRM_DASHBOARD',
    'LEAD_MANAGEMENT',
    'AI_SALES_AGENT',
    'AI_SUPPORT_AGENT',
    'WHATSAPP',
    'EMAIL_AUTOMATION',
    'ADVANCED_REPORTS'
  ]);
  const [pkgSupportedVerticals, setPkgSupportedVerticals] = useState([
    'SOFTWARE_IT', 'REAL_ESTATE', 'HEALTHCARE', 'HOSPITALITY', 'EDUCATION', 'ECOMMERCE', 'CONSULTING', 'MANUFACTURING', 'TRAVEL'
  ]);

  // Refund Modal State
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundPaymentId, setRefundPaymentId] = useState('');
  const [refundAmount, setRefundAmount] = useState(2500);
  const [refundReason, setRefundReason] = useState('Customer billing adjustment / satisfaction warranty');

  // Announcement state
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annPriority, setAnnPriority] = useState('HIGH');

  // User search state
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Data states from platform API
  const [contactQueries, setContactQueries] = useState([]);
  const [packagesList, setPackagesList] = useState([]);
  const [packageHistory, setPackageHistory] = useState([]);
  const [revenueOverview, setRevenueOverview] = useState(null);
  const [revenueTrends, setRevenueTrends] = useState([]);
  const [verticalRevenue, setVerticalRevenue] = useState([]);
  const [invoicesList, setInvoicesList] = useState([]);
  const [paymentsList, setPaymentsList] = useState([]);
  const [failedPaymentsList, setFailedPaymentsList] = useState([]);
  const [refundsList, setRefundsList] = useState([]);
  const [taxSummary, setTaxSummary] = useState(null);
  const [gatewaySummary, setGatewaySummary] = useState([]);
  const [aiCosts, setAiCosts] = useState(null);
  const [profitability, setProfitability] = useState(null);
  const [impersonationSessions, setImpersonationSessions] = useState([]);
  const [backupsList, setBackupsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // All 9 Industry Verticals Catalogue
  const VERTICALS = [
    { id: 'SOFTWARE_IT', name: 'Software / IT', desc: 'B2B SaaS, dev shops, product consultancies', color: '#3b82f6' },
    { id: 'REAL_ESTATE', name: 'Real Estate', desc: 'Builders, brokerage townships, inventory CRM', color: '#10b981' },
    { id: 'HEALTHCARE', name: 'Healthcare', desc: 'Hospitals, specialty clinics, doctor appointment bot', color: '#ef4444' },
    { id: 'HOSPITALITY', name: 'Hospitality', desc: 'Luxury hotels, resorts, banquet reservation AI', color: '#f59e0b' },
    { id: 'EDUCATION', name: 'Education', desc: 'Universities, K-12 schools, admissions guidance', color: '#8b5cf6' },
    { id: 'ECOMMERCE', name: 'E-Commerce', desc: 'D2C brands, order tracking & support bot', color: '#ec4899' },
    { id: 'CONSULTING', name: 'Consulting', desc: 'Corporate legal, tax strategy, enterprise audits', color: '#06b6d4' },
    { id: 'MANUFACTURING', name: 'Manufacturing', desc: 'B2B distributors, parts inventory, dealer quotes', color: '#84cc16' },
    { id: 'TRAVEL', name: 'Travel', desc: 'Tour operators, visa desks, holiday itinerary AI', color: '#14b8a6' }
  ];

  const loadAllPlatformData = async () => {
    setIsLoading(true);
    try {
      const [
        queriesRes,
        packagesRes,
        revOverRes,
        trendsRes,
        vertRevRes,
        invoicesRes,
        paymentsRes,
        failedPayRes,
        refundsRes,
        taxRes,
        gatewaysRes,
        aiCostsRes,
        profitRes,
        backupsRes,
        impSessRes
      ] = await Promise.all([
        platformService.getContactQueries().catch(() => ({ data: [] })),
        platformService.getPackages().catch(() => ({ data: [] })),
        platformService.getRevenueOverview().catch(() => ({ data: null })),
        platformService.getRevenueTrends().catch(() => ({ data: [] })),
        platformService.getRevenueByVertical().catch(() => ({ data: [] })),
        platformService.getInvoices().catch(() => ({ data: [] })),
        platformService.getPayments().catch(() => ({ data: [] })),
        platformService.getFailedPayments().catch(() => ({ data: [] })),
        platformService.getRefunds().catch(() => ({ data: [] })),
        platformService.getTaxSummary().catch(() => ({ data: null })),
        platformService.getGatewaySummary().catch(() => ({ data: [] })),
        platformService.getAiCosts().catch(() => ({ data: null })),
        platformService.getProfitability().catch(() => ({ data: null })),
        platformService.getBackups().catch(() => ({ data: [] })),
        platformService.getImpersonationSessions().catch(() => ({ data: [] }))
      ]);

      if (queriesRes?.data) setContactQueries(queriesRes.data);
      if (packagesRes?.data) setPackagesList(packagesRes.data);
      if (revOverRes?.data) setRevenueOverview(revOverRes.data);
      if (trendsRes?.data) setRevenueTrends(trendsRes.data);
      if (vertRevRes?.data) setVerticalRevenue(vertRevRes.data);
      if (invoicesRes?.data) setInvoicesList(invoicesRes.data);
      if (paymentsRes?.data) setPaymentsList(paymentsRes.data);
      if (failedPayRes?.data) setFailedPaymentsList(failedPayRes.data);
      if (refundsRes?.data) setRefundsList(refundsRes.data);
      if (taxRes?.data) setTaxSummary(taxRes.data);
      if (gatewaysRes?.data) setGatewaySummary(gatewaysRes.data);
      if (aiCostsRes?.data) setAiCosts(aiCostsRes.data);
      if (profitRes?.data) setProfitability(profitRes.data);
      if (backupsRes?.data) setBackupsList(backupsRes.data);
      if (impSessRes?.data) setImpersonationSessions(impSessRes.data);
    } catch (e) {
      console.error('Error loading platform command center data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllPlatformData();
  }, []);

  // Filtered Tenants across 9 Verticals
  const filteredTenants = tenants.filter((t) => {
    const matchesInd = industryFilter === 'All' || t.industryId === industryFilter.toLowerCase() || t.industry === industryFilter;
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.hrContact && t.hrContact.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.id && t.id.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesInd && matchesSearch;
  });

  const totalSeats = tenants.reduce((acc, t) => acc + (t.seats || 0), 0);
  const totalAIEmployees = tenants.reduce((acc, t) => acc + (t.activeAiEmployees || 4), 0);

  // Quota Modal Handlers
  const openQuotaModal = (tenant) => {
    setEditingTenant(tenant);
    setQuotaSeats(tenant.seats || 25);
    setQuotaStorage(tenant.storageGB || 100);
    setQuotaAiMessages(tenant.aiMessagesLimit || 50000);
    setQuotaPlan(tenant.plan || 'Enterprise Sovereign');
  };

  const handleSaveQuotas = async (e) => {
    e.preventDefault();
    if (!editingTenant) return;
    const limits = {
      seats: Number(quotaSeats),
      storageGB: Number(quotaStorage),
      aiMessagesLimit: Number(quotaAiMessages),
      plan: quotaPlan
    };
    updateTenantLimits(editingTenant.id, limits);
    await platformService.updateTenantLimits(editingTenant.id, limits);
    addNotification({
      type: 'success',
      title: `Quotas updated for ${editingTenant.name}`,
      category: 'Billing'
    });
    setEditingTenant(null);
    loadAllPlatformData();
  };

  // Delegated Access Handlers
  const handleStartDelegatedAccess = async (e) => {
    e.preventDefault();
    if (!delegatedModalTenant) return;
    await platformService.createImpersonationSession({
      tenantId: delegatedModalTenant.id,
      tenantName: delegatedModalTenant.name,
      reason: delegatedReason,
      accessMode: delegatedAccessMode,
      durationMinutes: 30
    });
    startDelegatedAccess(delegatedModalTenant.id, delegatedReason, delegatedAccessMode);
    setDelegatedModalTenant(null);
  };

  // Package Form Handlers
  const handleOpenCreatePackage = () => {
    setEditingPackage(null);
    setPkgName('Enterprise Sovereign');
    setPkgCode('ENTERPRISE_SOVEREIGN');
    setPkgDescription('Full-suite AI multi-tenant CRM with autonomous fleet orchestration, dedicated quotas, and SOC2 isolation.');
    setPkgPriceMonthly(4999);
    setPkgPriceQuarterly(13999);
    setPkgPriceYearly(49999);
    setPkgTrialDays(14);
    setPkgMaxUsers(25);
    setPkgMaxAiAgents(5);
    setPkgStorageGb(100);
    setPkgAiCredits(50000);
    setPkgWhatsappMessages(10000);
    setPkgApiRequests(100000);
    setIsPackageModalOpen(true);
  };

  const handleSavePackage = async (e) => {
    e.preventDefault();
    const pkgData = {
      name: pkgName,
      code: pkgCode || pkgName.toUpperCase().replace(/\s+/g, '_'),
      description: pkgDescription,
      billingCycles: {
        monthly: Number(pkgPriceMonthly),
        quarterly: Number(pkgPriceQuarterly),
        yearly: Number(pkgPriceYearly)
      },
      pricePerMonth: Number(pkgPriceMonthly),
      currency: 'INR',
      trialDays: Number(pkgTrialDays),
      setupFee: 0,
      quotas: {
        maxUsers: Number(pkgMaxUsers),
        maxAiAgents: Number(pkgMaxAiAgents),
        maxLeads: 10000,
        maxContacts: 25000,
        aiCredits: Number(pkgAiCredits),
        storageGb: Number(pkgStorageGb),
        whatsappMessages: Number(pkgWhatsappMessages),
        apiRequestsPerMonth: Number(pkgApiRequests),
        integrations: 8,
        channels: 6
      },
      includedSeats: Number(pkgMaxUsers),
      storageGB: Number(pkgStorageGb),
      aiMessagesPerMonth: Number(pkgAiCredits),
      features: pkgFeatures,
      supportedVerticals: pkgSupportedVerticals,
      status: 'ACTIVE'
    };

    if (editingPackage) {
      await platformService.updatePackage(editingPackage.packageId, pkgData);
      addNotification({ type: 'success', title: `Package ${pkgName} updated successfully`, category: 'Packages' });
    } else {
      await platformService.createPackage(pkgData);
      addNotification({ type: 'success', title: `New Package ${pkgName} created successfully`, category: 'Packages' });
    }
    setIsPackageModalOpen(false);
    loadAllPlatformData();
  };

  const handleDuplicatePackage = async (pkgId) => {
    await platformService.duplicatePackage(pkgId);
    addNotification({ type: 'info', title: `Package duplicated as draft template`, category: 'Packages' });
    loadAllPlatformData();
  };

  const handleArchivePackage = async (pkgId) => {
    await platformService.archivePackage(pkgId);
    addNotification({ type: 'warning', title: `Package ${pkgId} has been archived`, category: 'Packages' });
    loadAllPlatformData();
  };

  // Refund Handlers
  const handleProcessRefund = async (e) => {
    e.preventDefault();
    await platformService.requestRefund({
      paymentId: refundPaymentId,
      amount: Number(refundAmount),
      currency: 'INR',
      reason: refundReason,
      status: 'COMPLETED'
    });
    addNotification({
      type: 'success',
      title: `Refund of ₹${refundAmount} processed to customer ledger`,
      category: 'Billing'
    });
    setIsRefundModalOpen(false);
    loadAllPlatformData();
  };

  const handleRetryFailedPayment = async (payId) => {
    await platformService.retryPayment(payId);
    addNotification({
      type: 'info',
      title: `Payment ${payId} retry scheduled through gateway webhook`,
      category: 'Billing'
    });
  };

  const handleVoidInvoice = async (invId) => {
    await platformService.voidInvoice(invId, 'Voided by Ultra Super Admin');
    addNotification({
      type: 'warning',
      title: `Invoice #${invId} has been marked as VOID`,
      category: 'Billing'
    });
    loadAllPlatformData();
  };

  const handleApproveQuery = async (queryId) => {
    const res = await platformService.approveAndProvisionTenant(queryId);
    if (res?.success) {
      addNotification({
        type: 'success',
        title: `Workspace provisioned successfully for enquiry #${queryId}`,
        category: 'Provisioning'
      });
      loadAllPlatformData();
    }
  };

  const handleSendAnnouncement = (e) => {
    e.preventDefault();
    if (!annTitle.trim() || !annMessage.trim()) return;
    broadcastGlobalAnnouncement(annTitle, annMessage);
    addNotification({
      type: 'success',
      title: `Announcement published to all 9 verticals`,
      category: 'System'
    });
    setAnnTitle('');
    setAnnMessage('');
  };

  return (
    <div className="platform-admin-container" style={{ paddingBottom: '60px' }}>
      
      {/* 👑 SUPREME ULTRA SUPER ADMIN COCKPIT HEADER */}
      <div
        className="crm-card"
        style={{
          marginBottom: '20px',
          padding: '24px',
          background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.14) 0%, rgba(139, 92, 246, 0.10) 50%, rgba(37, 99, 235, 0.08) 100%)',
          border: '1px solid rgba(217, 119, 6, 0.35)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.16)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span
                className="badge"
                style={{
                  backgroundColor: '#d97706',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '4px 10px',
                  letterSpacing: '0.5px'
                }}
              >
                <Crown size={14} /> ULTRA SUPER ADMIN PLATFORM ROOT
              </span>
              <span className="badge badge-qualified" style={{ fontSize: '0.72rem' }}>
                <Activity size={12} className="pulse" /> Omnipotent Control Active
              </span>
              {isEmergencyLockdown && (
                <span className="badge" style={{ backgroundColor: '#ef4444', color: '#fff', fontSize: '0.72rem', fontWeight: 800 }}>
                  🚨 PLATFORM LOCKDOWN ACTIVE
                </span>
              )}
            </div>

            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
              Zenelait AI SaaS Platform Command Center
            </h1>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.88rem', maxWidth: '880px' }}>
              Root control plane governing all 9 industry tenant applications, SaaS packages, multi-tenant billing, autonomous AI fleet orchestration, and enterprise security.
            </p>
          </div>

          {/* Quick Platform Master Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={loadAllPlatformData}
              title="Refresh all metrics from live backend"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}
            >
              <RefreshCw size={13} className={isLoading ? 'spin' : ''} />
              <span>Sync Telemetry</span>
            </button>

            <button
              className="btn btn-secondary btn-sm"
              onClick={triggerDatabaseBackup}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}
            >
              <Database size={13} />
              <span>Snapshot DB Backup</span>
            </button>

            <button
              className={`btn btn-sm ${isEmergencyLockdown ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                backgroundColor: isEmergencyLockdown ? '#ef4444' : 'transparent',
                borderColor: '#ef4444',
                color: isEmergencyLockdown ? '#ffffff' : '#ef4444',
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onClick={toggleEmergencyLockdown}
            >
              {isEmergencyLockdown ? <Unlock size={13} /> : <Lock size={13} />}
              <span>{isEmergencyLockdown ? 'Deactivate Lockdown' : 'Emergency Lockdown'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2-COLUMN PLATFORM CONTROL LAYOUT: SIDEBAR TABS + MAIN VIEW */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '20px', alignItems: 'start' }}>
        
        {/* PLATFORM COMMAND CENTER NAVIGATION SIDEBAR */}
        <div className="crm-card" style={{ padding: '16px', position: 'sticky', top: '16px' }}>
          
          {/* Section 1: Core Platform */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
              Platform Command Center
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <button
                className={`btn btn-sm ${activeNav === 'overview' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setActiveNav('overview')}
                style={{ justifyContent: 'flex-start', fontSize: '0.8rem', padding: '8px 10px' }}
              >
                <Activity size={14} style={{ marginRight: '8px' }} />
                <span>Overview Dashboard</span>
              </button>
              <button
                className={`btn btn-sm ${activeNav === 'tenants' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setActiveNav('tenants')}
                style={{ justifyContent: 'flex-start', fontSize: '0.8rem', padding: '8px 10px' }}
              >
                <Building2 size={14} style={{ marginRight: '8px' }} />
                <span>Tenant Fleet (9 Verticals)</span>
              </button>
              <button
                className={`btn btn-sm ${activeNav === 'queries' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setActiveNav('queries')}
                style={{ justifyContent: 'flex-start', fontSize: '0.8rem', padding: '8px 10px' }}
              >
                <Send size={14} style={{ marginRight: '8px' }} />
                <span>Contact Enquiries ({contactQueries.length})</span>
              </button>
            </div>
          </div>

          {/* Section 2: Package & Subscription Management */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
              Package & Subscriptions
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <button
                className={`btn btn-sm ${activeNav === 'package-settings' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setActiveNav('package-settings')}
                style={{ justifyContent: 'flex-start', fontSize: '0.8rem', padding: '8px 10px' }}
              >
                <Sliders size={14} style={{ marginRight: '8px' }} />
                <span>Package Settings</span>
              </button>
              <button
                className={`btn btn-sm ${activeNav === 'package-comparison' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setActiveNav('package-comparison')}
                style={{ justifyContent: 'flex-start', fontSize: '0.8rem', padding: '8px 10px' }}
              >
                <Layers size={14} style={{ marginRight: '8px' }} />
                <span>Package Comparison</span>
              </button>
              <button
                className={`btn btn-sm ${activeNav === 'tenant-subscriptions' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setActiveNav('tenant-subscriptions')}
                style={{ justifyContent: 'flex-start', fontSize: '0.8rem', padding: '8px 10px' }}
              >
                <CreditCard size={14} style={{ marginRight: '8px' }} />
                <span>Tenant Subscriptions</span>
              </button>
            </div>
          </div>

          {/* Section 3: Financial & Revenue Management */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
              Financial Management
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <button
                className={`btn btn-sm ${activeNav === 'revenue-dashboard' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setActiveNav('revenue-dashboard')}
                style={{ justifyContent: 'flex-start', fontSize: '0.8rem', padding: '8px 10px' }}
              >
                <TrendingUp size={14} style={{ marginRight: '8px' }} />
                <span>Revenue Dashboard</span>
              </button>
              <button
                className={`btn btn-sm ${activeNav === 'revenue-vertical' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setActiveNav('revenue-vertical')}
                style={{ justifyContent: 'flex-start', fontSize: '0.8rem', padding: '8px 10px' }}
              >
                <BarChart3 size={14} style={{ marginRight: '8px' }} />
                <span>Revenue by Vertical</span>
              </button>
              <button
                className={`btn btn-sm ${activeNav === 'invoices' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setActiveNav('invoices')}
                style={{ justifyContent: 'flex-start', fontSize: '0.8rem', padding: '8px 10px' }}
              >
                <Receipt size={14} style={{ marginRight: '8px' }} />
                <span>Invoices & Billing</span>
              </button>
              <button
                className={`btn btn-sm ${activeNav === 'failed-payments' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setActiveNav('failed-payments')}
                style={{ justifyContent: 'flex-start', fontSize: '0.8rem', padding: '8px 10px' }}
              >
                <RotateCcw size={14} style={{ marginRight: '8px' }} />
                <span>Failed Payments & Retries</span>
              </button>
              <button
                className={`btn btn-sm ${activeNav === 'ai-profitability' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setActiveNav('ai-profitability')}
                style={{ justifyContent: 'flex-start', fontSize: '0.8rem', padding: '8px 10px' }}
              >
                <Percent size={14} style={{ marginRight: '8px' }} />
                <span>AI Cost & Profitability</span>
              </button>
            </div>
          </div>

          {/* Section 4: AI & Platform Operations */}
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
              Operations & Security
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <button
                className={`btn btn-sm ${activeNav === 'ai-fleet' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setActiveNav('ai-fleet')}
                style={{ justifyContent: 'flex-start', fontSize: '0.8rem', padding: '8px 10px' }}
              >
                <Bot size={14} style={{ marginRight: '8px' }} />
                <span>Global AI Fleet (36 Agents)</span>
              </button>
              <button
                className={`btn btn-sm ${activeNav === 'impersonation' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setActiveNav('impersonation')}
                style={{ justifyContent: 'flex-start', fontSize: '0.8rem', padding: '8px 10px' }}
              >
                <Eye size={14} style={{ marginRight: '8px' }} />
                <span>Delegated Impersonation</span>
              </button>
              <button
                className={`btn btn-sm ${activeNav === 'security' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setActiveNav('security')}
                style={{ justifyContent: 'flex-start', fontSize: '0.8rem', padding: '8px 10px' }}
              >
                <ShieldCheck size={14} style={{ marginRight: '8px' }} />
                <span>Security & Backups</span>
              </button>
              <button
                className={`btn btn-sm ${activeNav === 'announcements' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setActiveNav('announcements')}
                style={{ justifyContent: 'flex-start', fontSize: '0.8rem', padding: '8px 10px' }}
              >
                <Radio size={14} style={{ marginRight: '8px' }} />
                <span>Global Announcements</span>
              </button>
            </div>
          </div>

        </div>

        {/* MAIN DISPLAY VIEW AREA */}
        <div style={{ minWidth: 0 }}>
          
          {/* =========================================================================
              VIEW 1: OVERVIEW DASHBOARD
             ========================================================================= */}
          {activeNav === 'overview' && (
            <div>
              {/* Top 4 KPI Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
                <div className="crm-card" style={{ padding: '20px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Total Active MRR
                  </div>
                  <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#10b981' }}>
                    {revenueOverview?.mrrFormatted || '₹18,50,000 / mo'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#10b981', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <TrendingUp size={12} /> {revenueOverview?.monthlyGrowthRate || '+14.8%'} MoM Growth
                  </div>
                </div>

                <div className="crm-card" style={{ padding: '20px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Projected ARR
                  </div>
                  <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#3b82f6' }}>
                    {revenueOverview?.arrFormatted || '₹2,22,00,000 / yr'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Across 9 Industry Verticals
                  </div>
                </div>

                <div className="crm-card" style={{ padding: '20px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Subscribed Tenants
                  </div>
                  <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#d97706' }}>
                    {tenants.length} Companies
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#10b981', marginTop: '4px' }}>
                    100% Isolated Databases
                  </div>
                </div>

                <div className="crm-card" style={{ padding: '20px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Autonomous AI Fleet
                  </div>
                  <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#8b5cf6' }}>
                    {totalAIEmployees} Live Agents
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#10b981', marginTop: '4px' }}>
                    99.98% Model Uptime
                  </div>
                </div>
              </div>

              {/* 9 Industry Verticals Quick Launch Matrix */}
              <div className="crm-card" style={{ padding: '20px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>The 9 Industry Tenant Applications</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Each tenant vertical runs isolated CRM pipelines, specialized AI employees, and industry workflows.
                    </p>
                  </div>
                  <button className="btn btn-secondary btn-xs" onClick={() => setActiveNav('tenants')}>
                    View Full Fleet
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {VERTICALS.map((v) => {
                    const count = tenants.filter(t => t.industryId === v.id.toLowerCase() || t.industry === v.id).length;
                    return (
                      <div
                        key={v.id}
                        style={{
                          padding: '14px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--bg-surface)',
                          border: `1px solid var(--border)`,
                          borderLeft: `4px solid ${v.color}`
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)' }}>{v.name}</span>
                          <span className="badge badge-primary" style={{ fontSize: '0.68rem' }}>{count} Active</span>
                        </div>
                        <p style={{ margin: '0 0 8px 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{v.desc}</p>
                        <button
                          className="btn btn-ghost btn-xs"
                          onClick={() => {
                            setIndustryFilter(v.name);
                            setActiveNav('tenants');
                          }}
                          style={{ padding: '2px 6px', fontSize: '0.72rem', color: v.color }}
                        >
                          <span>Manage Tenants</span>
                          <ArrowRight size={11} style={{ marginLeft: '4px' }} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Invoices & Gateway Health Overview */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }}>
                <div className="crm-card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Recent Multi-Tenant Invoices</h3>
                    <button className="btn btn-ghost btn-xs" onClick={() => setActiveNav('invoices')}>
                      View All
                    </button>
                  </div>
                  <div className="table-responsive">
                    <table className="crm-table">
                      <thead>
                        <tr>
                          <th>Invoice</th>
                          <th>Company</th>
                          <th>Vertical</th>
                          <th>Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoicesList.slice(0, 5).map(inv => (
                          <tr key={inv.invoiceId || inv.id}>
                            <td style={{ fontWeight: 600 }}>{inv.invoiceId || inv.id}</td>
                            <td>{inv.companyName}</td>
                            <td><span className="badge badge-secondary" style={{ fontSize: '0.68rem' }}>{inv.industry}</span></td>
                            <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{inv.amountFormatted || `₹${inv.amount}`}</td>
                            <td><span className="badge badge-qualified" style={{ fontSize: '0.68rem' }}>{inv.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="crm-card" style={{ padding: '20px' }}>
                  <h3 style={{ margin: '0 0 14px 0', fontSize: '1rem', fontWeight: 700 }}>Payment Gateway Status</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {gatewaySummary.map((gw, idx) => (
                      <div key={idx} style={{ padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{gw.gateway}</span>
                          <span className="badge badge-qualified" style={{ fontSize: '0.65rem' }}>{gw.status}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          <span>Success Rate: <strong>{gw.successRate}</strong></span>
                          <span>Volume: <strong>₹{(gw.monthlyVolume / 100000).toFixed(1)}L</strong></span>
                        </div>
                      </div>
                    ))}
                    {gatewaySummary.length === 0 && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Stripe Global & Razorpay Cloud: Both Online (99.8% Uptime)
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 2: TENANT FLEET ACROSS ALL 9 VERTICALS
             ========================================================================= */}
          {activeNav === 'tenants' && (
            <div>
              <div className="crm-card" style={{ padding: '16px 20px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Tenant Fleet Management</h3>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Search, inspect quotas, change status, and initiate delegated access across all 9 industries.
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <div className="search-box" style={{ width: '220px' }}>
                      <Search size={14} className="search-icon" />
                      <input
                        type="text"
                        placeholder="Search company or owner..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                        style={{ fontSize: '0.8rem' }}
                      />
                    </div>

                    <select
                      value={industryFilter}
                      onChange={(e) => setIndustryFilter(e.target.value)}
                      className="form-select"
                      style={{ fontSize: '0.8rem', width: '180px' }}
                    >
                      <option value="All">All 9 Industries</option>
                      {VERTICALS.map(v => (
                        <option key={v.id} value={v.name}>{v.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="crm-card" style={{ padding: '0px' }}>
                <div className="table-responsive">
                  <table className="crm-table">
                    <thead>
                      <tr>
                        <th>Company / Tenant ID</th>
                        <th>Industry Vertical</th>
                        <th>Active Plan & MRR</th>
                        <th>Seats Utilized</th>
                        <th>AI Quota Used</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTenants.map((t) => (
                        <tr key={t.id}>
                          <td>
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.88rem' }}>{t.name}</div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                                {t.id} • {t.hrContact || t.ownerEmail}
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                              {t.industry}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{t.plan}</div>
                            <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>
                              {t.mrr || '₹7,999/mo'}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                              {t.seats || 10} / {t.seatsLimit || 50}
                            </div>
                            <div className="progress-bar-bg" style={{ height: 4, width: '90px', marginTop: 4 }}>
                              <div
                                className="progress-bar-fill"
                                style={{
                                  width: `${Math.min(100, Math.round(((t.seats || 10) / (t.seatsLimit || 50)) * 100))}%`,
                                  backgroundColor: '#3b82f6'
                                }}
                              />
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                              {(t.aiMessagesUsed || 12000).toLocaleString()} / {(t.aiMessagesLimit || 50000).toLocaleString()}
                            </div>
                            <div className="progress-bar-bg" style={{ height: 4, width: '90px', marginTop: 4 }}>
                              <div
                                className="progress-bar-fill"
                                style={{
                                  width: `${Math.min(100, Math.round(((t.aiMessagesUsed || 12000) / (t.aiMessagesLimit || 50000)) * 100))}%`,
                                  backgroundColor: '#8b5cf6'
                                }}
                              />
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${t.status === 'ACTIVE' || t.status === 'Active' ? 'badge-qualified' : 'badge-warning'}`}>
                              {t.status || 'Active'}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                className="btn btn-secondary btn-xs"
                                onClick={() => openQuotaModal(t)}
                                title="Edit Resource Quotas"
                              >
                                <Sliders size={12} />
                                <span>Quotas</span>
                              </button>

                              <button
                                className="btn btn-primary btn-xs"
                                onClick={() => setDelegatedModalTenant(t)}
                                title="Audited Support Access (Controlled Impersonation)"
                                style={{ backgroundColor: '#d97706', borderColor: '#d97706' }}
                              >
                                <Eye size={12} />
                                <span>Access</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredTenants.length === 0 && (
                        <tr>
                          <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                            No tenants found matching criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 3: CONTACT ENQUIRIES & WORKSPACE PROVISIONING
             ========================================================================= */}
          {activeNav === 'queries' && (
            <div>
              <div className="crm-card" style={{ padding: '20px', marginBottom: '16px', borderLeft: '4px solid #d97706' }}>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', fontWeight: 800 }}>
                  Public Landing Page Contact Enquiries & Provisioning Queue
                </h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Approve incoming company requests to trigger automated 1-click workspace provisioning, dedicated database setup, and generated credentials.
                </p>
              </div>

              <div className="crm-card" style={{ padding: '0px' }}>
                <div className="table-responsive">
                  <table className="crm-table">
                    <thead>
                      <tr>
                        <th>Enquiry ID</th>
                        <th>Company & Contact</th>
                        <th>Vertical</th>
                        <th>Team Size</th>
                        <th>Requested Plan</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contactQueries.map((q) => (
                        <tr key={q.queryId}>
                          <td style={{ fontWeight: 700 }}>{q.queryId}</td>
                          <td>
                            <div style={{ fontWeight: 700 }}>{q.companyName}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                              {q.fullName} • {q.email}
                            </div>
                          </td>
                          <td><span className="badge badge-secondary">{q.industry}</span></td>
                          <td>{q.teamSize}</td>
                          <td><span className="badge badge-primary">{q.packageInterest}</span></td>
                          <td>
                            <span className={`badge ${q.status === 'APPROVED' ? 'badge-qualified' : 'badge-warning'}`}>
                              {q.status}
                            </span>
                          </td>
                          <td>
                            {q.status === 'PENDING_REVIEW' ? (
                              <button
                                className="btn btn-primary btn-xs"
                                onClick={() => handleApproveQuery(q.queryId)}
                                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                              >
                                <CheckCircle2 size={12} />
                                <span>1-Click Provision</span>
                              </button>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>Provisioned</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 4: SAAS PACKAGE SETTINGS MODULE (NEW)
             ========================================================================= */}
          {activeNav === 'package-settings' && (
            <div>
              <div className="crm-card" style={{ padding: '18px 20px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>SaaS Package Settings & Tiers</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      Configure pricing plans, seat allocations, AI message credits, and feature entitlements for all 9 industry verticals.
                    </p>
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleOpenCreatePackage}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Plus size={14} />
                    <span>Create New Package</span>
                  </button>
                </div>
              </div>

              {/* Package Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {packagesList.map((pkg) => (
                  <div
                    key={pkg.packageId}
                    className="crm-card"
                    style={{
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      border: pkg.code === 'PROFESSIONAL' ? '2px solid #3b82f6' : '1px solid var(--border)',
                      position: 'relative'
                    }}
                  >
                    {pkg.code === 'PROFESSIONAL' && (
                      <span
                        className="badge badge-primary"
                        style={{ position: 'absolute', top: -10, right: 16, fontSize: '0.65rem' }}
                      >
                        MOST POPULAR
                      </span>
                    )}

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>{pkg.name}</h4>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Code: {pkg.code}</span>
                        </div>
                        <span className={`badge ${pkg.status === 'ACTIVE' ? 'badge-qualified' : 'badge-secondary'}`} style={{ fontSize: '0.65rem' }}>
                          {pkg.status}
                        </span>
                      </div>

                      <div style={{ margin: '12px 0 16px 0' }}>
                        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)' }}>
                          ₹{(pkg.pricePerMonth || 0).toLocaleString()} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)' }}>/ month</span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                          Quarterly: ₹{(pkg.billingCycles?.quarterly || 0).toLocaleString()} • Annual: ₹{(pkg.billingCycles?.yearly || 0).toLocaleString()}
                        </div>
                      </div>

                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', minHeight: '36px', marginBottom: '14px' }}>
                        {pkg.description}
                      </p>

                      <div style={{ fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid var(--border)', paddingTop: '12px', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Max Users:</span>
                          <span style={{ fontWeight: 700 }}>{pkg.quotas?.maxUsers || pkg.includedSeats || 5} Seats</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>AI Agents:</span>
                          <span style={{ fontWeight: 700 }}>{pkg.quotas?.maxAiAgents || 1} Autonomous</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>AI Credits:</span>
                          <span style={{ fontWeight: 700 }}>{(pkg.quotas?.aiCredits || 5000).toLocaleString()} msgs</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Storage:</span>
                          <span style={{ fontWeight: 700 }}>{pkg.quotas?.storageGb || pkg.storageGB || 15} GB</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        className="btn btn-secondary btn-xs"
                        onClick={() => handleDuplicatePackage(pkg.packageId)}
                        title="Duplicate Template"
                        style={{ flex: 1 }}
                      >
                        <Copy size={11} />
                        <span>Copy</span>
                      </button>
                      <button
                        className="btn btn-secondary btn-xs"
                        onClick={() => handleArchivePackage(pkg.packageId)}
                        title="Archive Package"
                      >
                        <Archive size={11} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 5: PACKAGE COMPARISON MATRIX (NEW)
             ========================================================================= */}
          {activeNav === 'package-comparison' && (
            <div className="crm-card" style={{ padding: '24px' }}>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '1.15rem', fontWeight: 800 }}>Feature Entitlement Matrix Comparison</h3>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Side-by-side entitlement breakdown across all active SaaS tiers.
                </p>
              </div>

              <div className="table-responsive">
                <table className="crm-table">
                  <thead>
                    <tr>
                      <th>Platform Feature / Quota</th>
                      <th>Starter (Free)</th>
                      <th>Growth (₹2,999)</th>
                      <th>Professional (₹7,999)</th>
                      <th>Enterprise (₹24,999)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: 700 }}>Included User Seats</td>
                      <td>5 Seats</td>
                      <td>15 Seats</td>
                      <td>50 Seats</td>
                      <td>200 Seats</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 700 }}>Autonomous AI Employees</td>
                      <td>1 Agent</td>
                      <td>4 Agents</td>
                      <td>10 Agents</td>
                      <td>36 Agents (Uncapped)</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 700 }}>Monthly AI Message Credits</td>
                      <td>10,000</td>
                      <td>50,000</td>
                      <td>100,000</td>
                      <td>500,000+</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 700 }}>Cloud Storage Quota</td>
                      <td>15 GB</td>
                      <td>50 GB</td>
                      <td>250 GB</td>
                      <td>1,000 GB (1 TB)</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 700 }}>WhatsApp Business Integration</td>
                      <td>Limited</td>
                      <td><Check size={16} color="#10b981" /></td>
                      <td><Check size={16} color="#10b981" /></td>
                      <td><Check size={16} color="#10b981" /> (Dedicated WABA)</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 700 }}>Email Automation & DMs</td>
                      <td>Basic</td>
                      <td><Check size={16} color="#10b981" /></td>
                      <td><Check size={16} color="#10b981" /></td>
                      <td><Check size={16} color="#10b981" /></td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 700 }}>REST API & Webhooks Access</td>
                      <td><X size={16} color="#ef4444" /></td>
                      <td>Limited</td>
                      <td><Check size={16} color="#10b981" /></td>
                      <td>Custom Endpoints</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 700 }}>Dedicated Cloud SLA</td>
                      <td>Standard</td>
                      <td>99.5%</td>
                      <td>99.9%</td>
                      <td>99.99% Sovereign</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 6: TENANT SUBSCRIPTIONS DIRECTORY (NEW)
             ========================================================================= */}
          {activeNav === 'tenant-subscriptions' && (
            <div className="crm-card" style={{ padding: '0px' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', fontWeight: 800 }}>Tenant Subscriptions Directory</h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Active recurring contracts, billing cycles, and renewal timelines across all 9 vertical companies.
                </p>
              </div>

              <div className="table-responsive">
                <table className="crm-table">
                  <thead>
                    <tr>
                      <th>Tenant Workspace</th>
                      <th>Active Plan</th>
                      <th>Billing Term</th>
                      <th>Contract Value</th>
                      <th>Renewal Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenants.map((t) => (
                      <tr key={t.id}>
                        <td>
                          <div style={{ fontWeight: 700 }}>{t.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{t.id} • {t.industry}</div>
                        </td>
                        <td><span className="badge badge-primary">{t.plan || 'Professional'}</span></td>
                        <td>Annual (Auto-renew)</td>
                        <td style={{ fontWeight: 700, color: '#10b981' }}>{t.mrr || '₹7,999/mo'}</td>
                        <td>Nov 28, 2027</td>
                        <td><span className="badge badge-qualified">Active</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 7: REVENUE DASHBOARD & MRR/ARR (NEW)
             ========================================================================= */}
          {activeNav === 'revenue-dashboard' && (
            <div>
              {/* Financial Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
                <div className="crm-card" style={{ padding: '20px' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Collected Revenue
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981', margin: '6px 0' }}>
                    ₹{(revenueOverview?.collectedRevenue || 1680000).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    Current month settled
                  </div>
                </div>

                <div className="crm-card" style={{ padding: '20px' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Outstanding Invoices
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f59e0b', margin: '6px 0' }}>
                    ₹{(revenueOverview?.pendingRevenue || 170000).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    In grace period
                  </div>
                </div>

                <div className="crm-card" style={{ padding: '20px' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Net Operating Profit
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#3b82f6', margin: '6px 0' }}>
                    ₹{(profitability?.netOperatingProfit || 1383000).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>
                    {profitability?.netMargin || '74.7%'} Margin
                  </div>
                </div>

                <div className="crm-card" style={{ padding: '20px' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                    AI Inference Cost
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ef4444', margin: '6px 0' }}>
                    ₹{(aiCosts?.totalMonthlyCost || 340000).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                    18.4% of total revenue
                  </div>
                </div>
              </div>

              {/* Monthly Revenue Trend Breakdown */}
              <div className="crm-card" style={{ padding: '20px', marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', fontWeight: 800 }}>6-Month Revenue & AI Cost Trend</h3>
                <div className="table-responsive">
                  <table className="crm-table">
                    <thead>
                      <tr>
                        <th>Billing Month</th>
                        <th>Gross Billed</th>
                        <th>Collected</th>
                        <th>AI Inference Cost</th>
                        <th>Net Platform Spread</th>
                      </tr>
                    </thead>
                    <tbody>
                      {revenueTrends.map((rt, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 700 }}>{rt.date}</td>
                          <td>₹{rt.billed.toLocaleString()}</td>
                          <td style={{ fontWeight: 700, color: '#10b981' }}>₹{rt.collected.toLocaleString()}</td>
                          <td style={{ color: '#ef4444' }}>₹{rt.aiCost.toLocaleString()}</td>
                          <td style={{ fontWeight: 800, color: 'var(--primary)' }}>₹{(rt.collected - rt.aiCost).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 8: REVENUE BY VERTICAL (ALL 9 INDUSTRIES) (NEW)
             ========================================================================= */}
          {activeNav === 'revenue-vertical' && (
            <div className="crm-card" style={{ padding: '24px' }}>
              <div style={{ marginBottom: '18px' }}>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '1.15rem', fontWeight: 800 }}>Revenue Breakdown Across the 9 Industry Verticals</h3>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Consolidated distribution of MRR and active customer companies by industry domain.
                </p>
              </div>

              <div className="table-responsive">
                <table className="crm-table">
                  <thead>
                    <tr>
                      <th>Vertical Industry</th>
                      <th>Monthly Revenue</th>
                      <th>Share of Total</th>
                      <th>Active Workspaces</th>
                      <th>Distribution Bar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verticalRevenue.map((v) => (
                      <tr key={v.vertical}>
                        <td style={{ fontWeight: 700 }}>{v.name}</td>
                        <td style={{ fontWeight: 800, color: '#10b981' }}>{v.revenueFormatted || `₹${v.revenue}`}</td>
                        <td><span className="badge badge-primary">{v.share}</span></td>
                        <td>{v.activeSubscriptions} Companies</td>
                        <td>
                          <div className="progress-bar-bg" style={{ height: 6, width: '120px' }}>
                            <div
                              className="progress-bar-fill"
                              style={{ width: v.share, backgroundColor: '#3b82f6' }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 9: INVOICES & BILLING (NEW)
             ========================================================================= */}
          {activeNav === 'invoices' && (
            <div className="crm-card" style={{ padding: '0px' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: 800 }}>Platform Invoices & Receipts</h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Billed receipts generated across all multi-tenant workspaces.
                  </p>
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsRefundModalOpen(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <RotateCcw size={13} />
                  <span>Issue Refund</span>
                </button>
              </div>

              <div className="table-responsive">
                <table className="crm-table">
                  <thead>
                    <tr>
                      <th>Invoice ID</th>
                      <th>Company</th>
                      <th>Vertical</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoicesList.map((inv) => (
                      <tr key={inv.invoiceId || inv.id}>
                        <td style={{ fontWeight: 700 }}>{inv.invoiceId || inv.id}</td>
                        <td style={{ fontWeight: 600 }}>{inv.companyName}</td>
                        <td><span className="badge badge-secondary">{inv.industry}</span></td>
                        <td style={{ color: 'var(--text-secondary)' }}>{inv.date}</td>
                        <td style={{ fontWeight: 800, color: 'var(--text-main)' }}>{inv.amountFormatted || `₹${inv.amount}`}</td>
                        <td>
                          <span className={`badge ${inv.status === 'PAID' ? 'badge-qualified' : inv.status === 'VOIDED' ? 'badge-warning' : 'badge-primary'}`}>
                            {inv.status}
                          </span>
                        </td>
                        <td>
                          {inv.status !== 'VOIDED' && (
                            <button
                              className="btn btn-ghost btn-xs"
                              onClick={() => handleVoidInvoice(inv.invoiceId || inv.id)}
                              style={{ color: '#ef4444' }}
                            >
                              Void
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 10: FAILED PAYMENTS & RETRIES (NEW)
             ========================================================================= */}
          {activeNav === 'failed-payments' && (
            <div className="crm-card" style={{ padding: '0px' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: 800 }}>Failed Payment Recovery Center</h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Monitor card declines and gateway 3D-Secure timeouts with automated retry dispatch.
                </p>
              </div>

              <div className="table-responsive">
                <table className="crm-table">
                  <thead>
                    <tr>
                      <th>Transaction ID</th>
                      <th>Tenant Company</th>
                      <th>Amount</th>
                      <th>Decline Reason</th>
                      <th>Gateway</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {failedPaymentsList.map((fp) => (
                      <tr key={fp.paymentId}>
                        <td style={{ fontWeight: 700 }}>{fp.paymentId}</td>
                        <td style={{ fontWeight: 600 }}>{fp.companyName}</td>
                        <td style={{ fontWeight: 800, color: '#ef4444' }}>₹{fp.amount}</td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{fp.reason}</td>
                        <td><span className="badge badge-primary">{fp.gateway}</span></td>
                        <td>
                          <button
                            className="btn btn-secondary btn-xs"
                            onClick={() => handleRetryFailedPayment(fp.paymentId)}
                            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <RotateCcw size={12} />
                            <span>Retry Charge</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {failedPaymentsList.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: '#10b981' }}>
                          All scheduled billing transactions settled successfully. Zero failed payments.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 11: AI COST & PROFITABILITY (NEW)
             ========================================================================= */}
          {activeNav === 'ai-profitability' && (
            <div>
              <div className="crm-card" style={{ padding: '20px', marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '1.15rem', fontWeight: 800 }}>Global AI Inference Costs & Model Gateways</h3>
                <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Telemetry measuring prompt/completion token usage across Claude 3.5 Sonnet, GPT-4o, and Gemini 1.5 Pro.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px' }}>Anthropic Claude 3.5 Sonnet</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#d97706' }}>₹1,85,000</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Complex sales negotiations & multi-turn reasoning</div>
                  </div>

                  <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px' }}>OpenAI GPT-4o</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>₹1,15,000</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Omnichannel WhatsApp auto-replies & sentiment routing</div>
                  </div>

                  <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px' }}>Google Gemini 1.5 Pro</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#3b82f6' }}>₹40,000</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Long-context knowledgebase document retrieval</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 12: DELEGATED IMPERSONATION SESSIONS
             ========================================================================= */}
          {activeNav === 'impersonation' && (
            <div className="crm-card" style={{ padding: '24px' }}>
              <div style={{ marginBottom: '18px' }}>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '1.15rem', fontWeight: 800 }}>Controlled Delegated Support Access</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Unlike unshielded logins, all impersonation is audited, time-limited, and displays a prominent warning banner throughout the target workspace.
                </p>
              </div>

              {impersonationSession?.isActive && (
                <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(217, 119, 6, 0.15)', border: '1px solid #d97706', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>Currently Delegating Access:</strong> {impersonationSession.tenantName} ({impersonationSession.accessMode})
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Reason: {impersonationSession.reason}</div>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={terminateDelegatedAccess}>
                      Exit Session
                    </button>
                  </div>
                </div>
              )}

              <div className="table-responsive">
                <table className="crm-table">
                  <thead>
                    <tr>
                      <th>Session ID</th>
                      <th>Target Tenant</th>
                      <th>Initiated By</th>
                      <th>Access Mode</th>
                      <th>Reason</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {impersonationSessions.map(s => (
                      <tr key={s.sessionId}>
                        <td style={{ fontWeight: 700 }}>{s.sessionId}</td>
                        <td style={{ fontWeight: 600 }}>{s.tenantName}</td>
                        <td style={{ fontSize: '0.78rem' }}>{s.initiatedBy}</td>
                        <td><span className="badge badge-primary">{s.accessMode}</span></td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.reason}</td>
                        <td><span className="badge badge-qualified">{s.status}</span></td>
                      </tr>
                    ))}
                    {impersonationSessions.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>
                          No previous delegated access sessions recorded in this control plane cycle.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 13: GLOBAL AI FLEET
             ========================================================================= */}
          {activeNav === 'ai-fleet' && (
            <div className="crm-card" style={{ padding: '20px' }}>
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: 800 }}>Global AI Employee Fleet (All 9 Verticals)</h3>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Total of 36 autonomous domain agents actively servicing incoming prospects and WhatsApp inquiries.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                {VERTICALS.map(v => (
                  <div key={v.id} style={{ padding: '14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Bot size={16} color={v.color} />
                      <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{v.name} Fleet</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      4 Specialized AI Agents (Sales, Admissions/Intake, Support, Coordinator)
                    </div>
                    <span className="badge badge-qualified" style={{ fontSize: '0.68rem' }}>
                      100% Operational • 99.4% Accuracy
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 14: SECURITY CENTER & BACKUPS
             ========================================================================= */}
          {activeNav === 'security' && (
            <div>
              <div className="crm-card" style={{ padding: '20px', marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 800 }}>Multi-Region Database Snapshot Backups</h3>
                <p style={{ margin: '0 0 16px 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Automated cold-storage snapshots stored on AWS S3 ap-south-1 with SHA-256 integrity verification.
                </p>

                <div className="table-responsive">
                  <table className="crm-table">
                    <thead>
                      <tr>
                        <th>Backup ID</th>
                        <th>Type</th>
                        <th>Scope</th>
                        <th>Size (MB)</th>
                        <th>Storage Region</th>
                        <th>Integrity Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {backupsList.map(b => (
                        <tr key={b.backupId}>
                          <td style={{ fontWeight: 700 }}>{b.backupId}</td>
                          <td><span className="badge badge-primary">{b.backupType}</span></td>
                          <td>{b.scope}</td>
                          <td>{b.sizeMB} MB</td>
                          <td>{b.storageRegion}</td>
                          <td><span className="badge badge-qualified">{b.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 15: GLOBAL ANNOUNCEMENTS
             ========================================================================= */}
          {activeNav === 'announcements' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="crm-card" style={{ padding: '26px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '10px', backgroundColor: 'rgba(217, 119, 6, 0.12)', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Radio size={22} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        Broadcast Global Platform Announcement
                      </h3>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        Publish immediate notification banners across all 9 industry tenant workspaces and company dashboards.
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span className="badge badge-primary" style={{ fontSize: '0.72rem', padding: '4px 10px' }}>
                      All 9 Industry Verticals
                    </span>
                    <span className="badge badge-qualified" style={{ fontSize: '0.72rem', padding: '4px 10px' }}>
                      Real-Time Push
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSendAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '720px', marginTop: '10px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '12px' }}>
                    <div>
                      <label className="form-label" style={{ fontWeight: 600, marginBottom: '6px' }}>
                        Announcement Title *
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Scheduled Infrastructure Maintenance Window"
                        value={annTitle}
                        onChange={(e) => setAnnTitle(e.target.value)}
                        required
                        style={{ padding: '10px 14px' }}
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontWeight: 600, marginBottom: '6px' }}>
                        Priority Level
                      </label>
                      <select
                        className="form-select"
                        value={annPriority}
                        onChange={(e) => setAnnPriority(e.target.value)}
                        style={{ padding: '10px 12px' }}
                      >
                        <option value="HIGH">🚨 High Priority (Red)</option>
                        <option value="INFO">ℹ️ General Info (Blue)</option>
                        <option value="MAINTENANCE">⚙️ Maintenance (Amber)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="form-label" style={{ fontWeight: 600, marginBottom: '6px' }}>
                      Message Content *
                    </label>
                    <textarea
                      className="form-input"
                      rows={4}
                      placeholder="Details about maintenance, new AI features, or policy updates..."
                      value={annMessage}
                      onChange={(e) => setAnnMessage(e.target.value)}
                      required
                      style={{ padding: '12px 14px', resize: 'vertical', lineHeight: 1.5 }}
                    />
                  </div>

                  {/* Live Banner Preview Box */}
                  {(annTitle.trim() || annMessage.trim()) && (
                    <div style={{ padding: '14px 16px', borderRadius: 'var(--radius-md)', backgroundColor: annPriority === 'HIGH' ? 'rgba(239, 68, 68, 0.08)' : annPriority === 'MAINTENANCE' ? 'rgba(217, 119, 6, 0.08)' : 'rgba(37, 99, 235, 0.08)', border: annPriority === 'HIGH' ? '1px solid rgba(239, 68, 68, 0.3)' : annPriority === 'MAINTENANCE' ? '1px solid rgba(217, 119, 6, 0.3)' : '1px solid rgba(37, 99, 235, 0.3)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: annPriority === 'HIGH' ? '#ef4444' : annPriority === 'MAINTENANCE' ? '#d97706' : '#2563eb' }}>
                          Live Preview • {annPriority} Announcement
                        </span>
                      </div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {annTitle || 'Untitled Announcement'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.4 }}>
                        {annMessage || 'No content specified yet.'}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                    <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontWeight: 700, backgroundColor: '#d97706', borderColor: '#d97706' }}>
                      <Send size={15} />
                      <span>Broadcast to All Tenants</span>
                    </button>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Will display immediately to all active companies on their next refresh.
                    </span>
                  </div>
                </form>
              </div>

              {/* Broadcast Announcements History */}
              <div className="crm-card" style={{ padding: '24px' }}>
                <h4 style={{ margin: '0 0 14px 0', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Radio size={16} style={{ color: 'var(--primary)' }} />
                  Recent Global Announcements ({globalAnnouncements?.length || 0})
                </h4>

                {(!globalAnnouncements || globalAnnouncements.length === 0) ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No global announcements currently published. Use the form above to broadcast to all 9 verticals.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {globalAnnouncements.map((ann, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '14px 18px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--bg-surface)',
                          border: '1px solid var(--border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                            <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>Active</span>
                            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>{ann.title}</span>
                          </div>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{ann.message}</p>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          Delivered to 9 Tenants
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* =========================================================================
          MODAL 1: TENANT QUOTA EDITOR
         ========================================================================= */}
      {editingTenant && (
        <div className="modal-backdrop" onClick={() => setEditingTenant(null)}>
          <div className="crm-modal" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="crm-modal-header">
              <h2>
                <Sliders size={18} style={{ color: 'var(--primary)' }} />
                Edit Quotas: {editingTenant.name}
              </h2>
              <button type="button" className="btn-close" onClick={() => setEditingTenant(null)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveQuotas}>
              <div className="crm-modal-body">
                <div>
                  <label className="form-label" style={{ fontWeight: 600, marginBottom: '6px' }}>Assigned Plan</label>
                  <select
                    className="form-select"
                    value={quotaPlan}
                    onChange={(e) => setQuotaPlan(e.target.value)}
                  >
                    <option value="Starter (Free Trial)">Starter (Free Trial)</option>
                    <option value="Growth">Growth</option>
                    <option value="Professional">Professional</option>
                    <option value="Enterprise Sovereign">Enterprise Sovereign</option>
                  </select>
                </div>

                <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label className="form-label" style={{ margin: 0, fontWeight: 600 }}>User Seat Limit</label>
                    <span className="badge badge-primary" style={{ fontWeight: 700 }}>{quotaSeats} Seats</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="200"
                    step="5"
                    value={quotaSeats}
                    onChange={(e) => setQuotaSeats(e.target.value)}
                    style={{ width: '100%', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    <span>5 Seats (Min)</span>
                    <span>200 Seats (Max)</span>
                  </div>
                </div>

                <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label className="form-label" style={{ margin: 0, fontWeight: 600 }}>Storage Quota</label>
                    <span className="badge badge-primary" style={{ fontWeight: 700 }}>{quotaStorage} GB</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="1000"
                    step="10"
                    value={quotaStorage}
                    onChange={(e) => setQuotaStorage(e.target.value)}
                    style={{ width: '100%', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    <span>10 GB</span>
                    <span>1,000 GB (1 TB)</span>
                  </div>
                </div>

                <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label className="form-label" style={{ margin: 0, fontWeight: 600 }}>Monthly AI Messages</label>
                    <span className="badge badge-primary" style={{ fontWeight: 700 }}>{Number(quotaAiMessages).toLocaleString()} msgs</span>
                  </div>
                  <input
                    type="range"
                    min="10000"
                    max="500000"
                    step="10000"
                    value={quotaAiMessages}
                    onChange={(e) => setQuotaAiMessages(e.target.value)}
                    style={{ width: '100%', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    <span>10,000</span>
                    <span>500,000</span>
                  </div>
                </div>
              </div>

              <div className="crm-modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingTenant(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={16} /> Save Quota Limits
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: DELEGATED SUPPORT ACCESS REQUEST
         ========================================================================= */}
      {delegatedModalTenant && (
        <div className="modal-backdrop" onClick={() => setDelegatedModalTenant(null)}>
          <div className="crm-modal" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="crm-modal-header">
              <h2>
                <ShieldCheck size={18} style={{ color: '#d97706' }} />
                Request Delegated Support Access
              </h2>
              <button type="button" className="btn-close" onClick={() => setDelegatedModalTenant(null)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleStartDelegatedAccess}>
              <div className="crm-modal-body">
                <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(217, 119, 6, 0.08)', border: '1px solid rgba(217, 119, 6, 0.3)', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <ShieldCheck size={20} style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                    You are initiating audited delegated access to <strong style={{ color: '#d97706' }}>{delegatedModalTenant.name}</strong> ({delegatedModalTenant.industry}). All actions will be signed with your identity in the sovereign audit ledger.
                  </div>
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 600, marginBottom: '6px' }}>Access Mode</label>
                  <select
                    className="form-select"
                    value={delegatedAccessMode}
                    onChange={(e) => setDelegatedAccessMode(e.target.value)}
                  >
                    <option value="READ_ONLY">Read-Only Diagnostics (Recommended)</option>
                    <option value="SUPPORT_WRITE">Support Write (Requires Approval)</option>
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 600, marginBottom: '6px' }}>Access Justification / Ticket Reference</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    value={delegatedReason}
                    onChange={(e) => setDelegatedReason(e.target.value)}
                    placeholder="Describe ticket number or reason for support access..."
                    required
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>

              <div className="crm-modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setDelegatedModalTenant(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#d97706', borderColor: '#d97706', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Lock size={15} /> Authorize & Start Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: CREATE / EDIT PACKAGE MODAL
         ========================================================================= */}
      {isPackageModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsPackageModalOpen(false)}>
          <div className="crm-modal" style={{ maxWidth: '680px', width: '95%' }} onClick={(e) => e.stopPropagation()}>
            <div className="crm-modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <Package size={20} style={{ color: 'var(--primary)' }} />
                  {editingPackage ? 'Edit SaaS Package' : 'Create SaaS Package'}
                </h2>
                <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Define pricing tiers, billing cycles, seats, storage, and AI autonomous workforce limits.
                </p>
              </div>
              <button type="button" className="btn-close" onClick={() => setIsPackageModalOpen(false)} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePackage}>
              <div className="crm-modal-body" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: 'calc(85vh - 120px)', overflowY: 'auto' }}>
                
                {/* Section 1: Package Identity */}
                <div style={{ backgroundColor: 'var(--bg-surface)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)', marginBottom: '12px' }}>
                    1. Package Identity
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px' }}>Package Name</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Enterprise Sovereign"
                        value={pkgName}
                        onChange={(e) => setPkgName(e.target.value)}
                        required
                        style={{ height: '38px', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px' }}>Package Code</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. ENTERPRISE_SOVEREIGN"
                        value={pkgCode}
                        onChange={(e) => setPkgCode(e.target.value)}
                        required
                        style={{ height: '38px', fontSize: '0.85rem', fontFamily: 'monospace' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px' }}>Description</label>
                    <textarea
                      className="form-input"
                      rows={2}
                      placeholder="Short description of audience and capabilities..."
                      value={pkgDescription}
                      onChange={(e) => setPkgDescription(e.target.value)}
                      style={{ fontSize: '0.85rem', resize: 'vertical' }}
                    />
                  </div>
                </div>

                {/* Section 2: Pricing Tiers */}
                <div style={{ backgroundColor: 'var(--bg-surface)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>2. Pricing Structure (₹ INR)</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'none', fontWeight: 500 }}>Tax exclusive</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    <div style={{ backgroundColor: 'var(--bg-main)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                      <label className="form-label" style={{ fontWeight: 600, fontSize: '0.78rem', marginBottom: '4px' }}>Monthly Price (₹)</label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600 }}>₹</span>
                        <input
                          type="number"
                          className="form-input"
                          style={{ paddingLeft: '24px', height: '38px', fontWeight: 600 }}
                          value={pkgPriceMonthly}
                          onChange={(e) => setPkgPriceMonthly(e.target.value)}
                          required
                        />
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>Billed every month</div>
                    </div>

                    <div style={{ backgroundColor: 'var(--bg-main)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <label className="form-label" style={{ fontWeight: 600, fontSize: '0.78rem', margin: 0 }}>Quarterly (₹)</label>
                        <span className="badge badge-success" style={{ fontSize: '0.62rem', padding: '1px 4px' }}>Save 7%</span>
                      </div>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600 }}>₹</span>
                        <input
                          type="number"
                          className="form-input"
                          style={{ paddingLeft: '24px', height: '38px', fontWeight: 600 }}
                          value={pkgPriceQuarterly}
                          onChange={(e) => setPkgPriceQuarterly(e.target.value)}
                        />
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>Billed every 3 mos</div>
                    </div>

                    <div style={{ backgroundColor: 'var(--bg-main)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <label className="form-label" style={{ fontWeight: 600, fontSize: '0.78rem', margin: 0 }}>Annual Price (₹)</label>
                        <span className="badge badge-primary" style={{ fontSize: '0.62rem', padding: '1px 4px' }}>Save 17%</span>
                      </div>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600 }}>₹</span>
                        <input
                          type="number"
                          className="form-input"
                          style={{ paddingLeft: '24px', height: '38px', fontWeight: 600 }}
                          value={pkgPriceYearly}
                          onChange={(e) => setPkgPriceYearly(e.target.value)}
                        />
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>Billed annually</div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Resource Quotas */}
                <div style={{ backgroundColor: 'var(--bg-surface)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)', marginBottom: '12px' }}>
                    3. Resource Quotas & AI Fleet Allowances
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    <div style={{ backgroundColor: 'var(--bg-main)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                      <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Users size={14} style={{ color: 'var(--primary)' }} /> User Seats Limit
                      </label>
                      <input
                        type="number"
                        className="form-input"
                        style={{ height: '38px', fontWeight: 600 }}
                        value={pkgMaxUsers}
                        onChange={(e) => setPkgMaxUsers(e.target.value)}
                        required
                        min="1"
                      />
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>Licensed team members</div>
                    </div>

                    <div style={{ backgroundColor: 'var(--bg-main)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                      <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Bot size={14} style={{ color: '#8b5cf6' }} /> Autonomous AI Employees
                      </label>
                      <input
                        type="number"
                        className="form-input"
                        style={{ height: '38px', fontWeight: 600 }}
                        value={pkgMaxAiAgents}
                        onChange={(e) => setPkgMaxAiAgents(e.target.value)}
                        required
                        min="1"
                      />
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>Autonomous agent workers</div>
                    </div>

                    <div style={{ backgroundColor: 'var(--bg-main)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                      <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Database size={14} style={{ color: '#0ea5e9' }} /> Storage Quota (GB)
                      </label>
                      <input
                        type="number"
                        className="form-input"
                        style={{ height: '38px', fontWeight: 600 }}
                        value={pkgStorageGb}
                        onChange={(e) => setPkgStorageGb(e.target.value)}
                        required
                        min="1"
                      />
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>Dedicated storage quota</div>
                    </div>

                    <div style={{ backgroundColor: 'var(--bg-main)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                      <label className="form-label" style={{ fontWeight: 600, fontSize: '0.8rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Zap size={14} style={{ color: '#eab308' }} /> AI Message Credits
                      </label>
                      <input
                        type="number"
                        className="form-input"
                        style={{ height: '38px', fontWeight: 600 }}
                        value={pkgAiCredits}
                        onChange={(e) => setPkgAiCredits(e.target.value)}
                        required
                        min="1000"
                      />
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>Monthly LLM inference credits</div>
                    </div>
                  </div>
                </div>

              </div>

              <div className="crm-modal-footer" style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsPackageModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                  <Check size={16} /> Save Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: REFUND REQUEST MODAL
         ========================================================================= */}
      {isRefundModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsRefundModalOpen(false)}>
          <div className="crm-modal" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="crm-modal-header">
              <h2>
                <RotateCcw size={18} style={{ color: '#ef4444' }} />
                Issue Customer Refund
              </h2>
              <button type="button" className="btn-close" onClick={() => setIsRefundModalOpen(false)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleProcessRefund}>
              <div className="crm-modal-body">
                <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <AlertCircle size={20} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                    Refunds are irreversible and will be credited back via the original payment gateway (Stripe / Razorpay) within 5–7 business days.
                  </div>
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 600, marginBottom: '6px' }}>Payment ID</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. PAY-901"
                    value={refundPaymentId}
                    onChange={(e) => setRefundPaymentId(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 600, marginBottom: '6px' }}>Refund Amount (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 600, marginBottom: '6px' }}>Refund Reason</label>
                  <textarea
                    className="form-input"
                    rows={2}
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    placeholder="Provide justification for billing audit..."
                    required
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>

              <div className="crm-modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsRefundModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#ef4444', borderColor: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <RotateCcw size={16} /> Authorize Refund
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
