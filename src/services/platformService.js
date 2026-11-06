import { apiClient } from './apiClient';

/**
 * Zenelait AI CRM — Ultra Super Admin (Platform Root / God Mode)
 * Comprehensive Service Module for Platform Command Center, Package Settings & Revenue Management
 */
export const platformService = {
  // =========================================================================
  // 1. DASHBOARD & SYSTEM TELEMETRY
  // =========================================================================
  getDashboardOverview: () => apiClient.get('/platform/dashboard'),
  getTenantSummary: () => apiClient.get('/platform/dashboard/tenant-summary'),
  getUserSummary: () => apiClient.get('/platform/dashboard/user-summary'),
  getSystemHealth: () => apiClient.get('/platform/dashboard/system-health'),

  // =========================================================================
  // 2. TENANT FLEET ACROSS ALL 9 VERTICALS
  // =========================================================================
  getFleetTenants: (params = {}) => apiClient.get('/platform/tenants', params),
  updateTenantLimits: (tenantId, limits) => apiClient.patch(`/platform/tenants/${tenantId}/limits`, limits),
  updateTenantStatus: (tenantId, status) => apiClient.patch(`/platform/tenants/${tenantId}/status`, { status }),
  suspendTenant: (tenantId, reason) => apiClient.post(`/platform/tenants/${tenantId}/suspend`, { reason }),
  activateTenant: (tenantId) => apiClient.post(`/platform/tenants/${tenantId}/activate`),

  // =========================================================================
  // 3. CONTACT ENQUIRIES & WORKSPACE PROVISIONING
  // =========================================================================
  getContactQueries: (params = {}) => apiClient.get('/platform/contact-queries', params),
  submitContactQuery: (queryData) => apiClient.post('/platform/contact-queries/submit', queryData),
  approveAndProvisionTenant: (queryId, overrideData = {}) => apiClient.post(`/platform/contact-queries/${queryId}/approve`, overrideData),
  updateQueryStatus: (queryId, status) => apiClient.patch(`/platform/contact-queries/${queryId}/status`, { status }),

  // =========================================================================
  // 4. SAAS PACKAGE SETTINGS & QUOTAS
  // =========================================================================
  getPackages: () => apiClient.get('/platform/packages'),
  createPackage: (packageData) => apiClient.post('/platform/packages', packageData),
  getPackageDetails: (packageId) => apiClient.get(`/platform/packages/${packageId}`),
  updatePackage: (packageId, updates) => apiClient.put(`/platform/packages/${packageId}`, updates),
  updatePackageStatus: (packageId, status) => apiClient.patch(`/platform/packages/${packageId}/status`, { status }),
  updatePackagePricing: (packageId, pricing) => apiClient.patch(`/platform/packages/${packageId}/pricing`, pricing),
  updatePackageQuotas: (packageId, quotas) => apiClient.put(`/platform/packages/${packageId}/quotas`, quotas),
  updatePackageFeatures: (packageId, features) => apiClient.put(`/platform/packages/${packageId}/features`, { features }),
  updatePackageVerticals: (packageId, supportedVerticals) => apiClient.put(`/platform/packages/${packageId}/verticals`, { supportedVerticals }),
  duplicatePackage: (packageId) => apiClient.post(`/platform/packages/${packageId}/duplicate`),
  archivePackage: (packageId) => apiClient.post(`/platform/packages/${packageId}/archive`),
  getPackageComparison: () => apiClient.get('/platform/packages/comparison'),
  getPackageHistory: () => apiClient.get('/platform/packages/change-history'),

  // =========================================================================
  // 5. REVENUE & FINANCIAL MANAGEMENT
  // =========================================================================
  getRevenueOverview: (params = {}) => apiClient.get('/platform/revenue/overview', params),
  getMrrReport: () => apiClient.get('/platform/revenue/mrr'),
  getArrReport: () => apiClient.get('/platform/revenue/arr'),
  getRevenueTrends: () => apiClient.get('/platform/revenue/trends'),
  getRevenueByPackage: () => apiClient.get('/platform/revenue/by-package'),
  getRevenueByVertical: (period = 'MONTHLY') => apiClient.get('/platform/revenue/by-vertical', { period }),
  getRevenueByTenant: () => apiClient.get('/platform/revenue/by-tenant'),
  getInvoices: () => apiClient.get('/platform/revenue/invoices'),
  getInvoiceDetails: (invoiceId) => apiClient.get(`/platform/revenue/invoices/${invoiceId}`),
  voidInvoice: (invoiceId, reason = '') => apiClient.post(`/platform/revenue/invoices/${invoiceId}/void`, { reason }),
  getPayments: () => apiClient.get('/platform/revenue/payments'),
  getFailedPayments: () => apiClient.get('/platform/revenue/payments/failed'),
  retryPayment: (paymentId) => apiClient.post(`/platform/revenue/payments/${paymentId}/retry`),
  getRefunds: () => apiClient.get('/platform/revenue/refunds'),
  requestRefund: (refundData) => apiClient.post('/platform/revenue/refunds', refundData),
  getTaxSummary: () => apiClient.get('/platform/revenue/tax-summary'),
  getGatewaySummary: () => apiClient.get('/platform/revenue/gateway-summary'),
  getAiCosts: () => apiClient.get('/platform/revenue/ai-costs'),
  getProfitability: () => apiClient.get('/platform/revenue/profitability'),

  // =========================================================================
  // 6. CONTROLLED DELEGATED IMPERSONATION (AUDITED SUPPORT ACCESS)
  // =========================================================================
  createImpersonationSession: (sessionData) => apiClient.post('/platform/impersonation/sessions', sessionData),
  getImpersonationSessions: () => apiClient.get('/platform/impersonation/sessions'),
  terminateImpersonationSession: (sessionId) => apiClient.post(`/platform/impersonation/sessions/${sessionId}/terminate`),

  // =========================================================================
  // 7. EMERGENCY OPERATIONS & BACKUP RECOVERY
  // =========================================================================
  getEmergencyStatus: () => apiClient.get('/platform/emergency/status'),
  triggerLockdown: (lockdownData = {}) => apiClient.post('/platform/emergency/lockdown', lockdownData),
  triggerUnlock: () => apiClient.post('/platform/emergency/unlock'),
  getBackups: () => apiClient.get('/platform/backups'),
  requestDatabaseBackup: (backupData = {}) => apiClient.post('/platform/backups', backupData)
};
