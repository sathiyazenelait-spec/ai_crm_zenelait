import { apiClient } from './apiClient';

export const adminService = {
  // Dashboard & Health
  getDashboard: (industry = null) => apiClient.get('/admin/dashboard', industry ? { industry } : {}),
  getDashboardActivity: () => apiClient.get('/admin/dashboard/activity'),
  getDashboardHealth: () => apiClient.get('/admin/dashboard/health'),

  // Company Settings & Profile
  getCompanyProfile: () => apiClient.get('/company/profile'),
  updateCompanyProfile: (updates) => apiClient.patch('/company/profile', updates),
  getPreferences: () => apiClient.get('/company/preferences'),
  getIndustryConfig: () => apiClient.get('/company/industry-config'),

  // Users & Roles
  getUsers: (params = {}) => apiClient.get('/admin/users', params),
  inviteUser: (userData) => apiClient.post('/admin/users', userData),
  updateUser: (userId, updates) => apiClient.patch(`/admin/users/${userId}`, updates),
  toggleUserStatus: (userId, status) => apiClient.patch(`/admin/users/${userId}/status`, { status }),
  resendInvite: (userId) => apiClient.post(`/admin/users/${userId}/resend-invite`),
  getRoles: () => apiClient.get('/admin/roles'),
  createRole: (roleData) => apiClient.post('/admin/roles', roleData),
  getPermissions: () => apiClient.get('/admin/permissions'),
  getAuditLogs: (params = {}) => apiClient.get('/admin/audit-logs', params),

  // IT Products & CRM Catalog
  getProducts: (params = {}) => apiClient.get('/admin/products', params),
  createProduct: (productData) => apiClient.post('/admin/products', productData),
  updateProduct: (productId, updates) => apiClient.patch(`/admin/products/${productId}`, updates),
  getCrmSettings: () => apiClient.get('/admin/crm/settings'),
  getLeadFields: () => apiClient.get('/admin/lead-fields'),
  createLeadField: (fieldData) => apiClient.post('/admin/lead-fields', fieldData),
  getPipelineStages: () => apiClient.get('/admin/pipeline-stages'),
  createPipelineStage: (stageData) => apiClient.post('/admin/pipeline-stages', stageData),
  getLeadAssignmentRules: () => apiClient.get('/admin/lead-assignment-rules'),
  createLeadAssignmentRule: (ruleData) => apiClient.post('/admin/lead-assignment-rules', ruleData),
  getSalesSettings: () => apiClient.get('/admin/sales-settings'),

  // Integrations & Webhooks
  getIntegrations: () => apiClient.get('/admin/integrations'),
  testIntegration: (id) => apiClient.post(`/admin/integrations/${id}/test`),
  getWebhooks: () => apiClient.get('/admin/webhooks'),
  createWebhook: (data) => apiClient.post('/admin/webhooks', data),
  testWebhook: (id) => apiClient.post(`/admin/webhooks/${id}/test`),
  getChannelSettings: () => apiClient.get('/admin/channel-settings'),
  getWebchatSettings: () => apiClient.get('/admin/webchat/settings'),

  // AI Employees & Knowledge Base
  getAiAgents: () => apiClient.get('/admin/ai-agents'),
  createAiAgent: (agentData) => apiClient.post('/admin/ai-agents', agentData),
  getKnowledgeSources: () => apiClient.get('/admin/knowledge-sources'),
  addKnowledgeSource: (sourceData) => apiClient.post('/admin/knowledge-sources', sourceData),
  deleteKnowledgeSource: (id) => apiClient.delete(`/admin/knowledge-sources/${id}`),
  getEscalationRules: () => apiClient.get('/admin/escalation-rules'),
  createEscalationRule: (ruleData) => apiClient.post('/admin/escalation-rules', ruleData),

  // Automations & Runs
  getAutomations: () => apiClient.get('/admin/automations'),
  runAutomation: (workflowId, mode = 'DRY_RUN', input = {}) =>
    apiClient.post(`/admin/automations/${workflowId}/runs`, { mode, input }),

  // Reports
  getReportOverview: () => apiClient.get('/admin/reports/overview'),
  getReportCrm: () => apiClient.get('/admin/reports/crm'),
  getReportUsers: () => apiClient.get('/admin/reports/users'),
  getReportAiUsage: () => apiClient.get('/admin/reports/ai-usage'),
  getReportIntegrations: () => apiClient.get('/admin/reports/integrations'),

  // Billing
  getSubscription: () => apiClient.get('/admin/billing/subscription')
};
