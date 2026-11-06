import { apiClient } from './apiClient';

const unwrapData = async (promise) => {
  const res = await promise;
  if (!res.success) {
    throw new Error(res.error || 'API Request failed');
  }
  return res.data;
};

const unwrapList = async (promise) => {
  const data = await unwrapData(promise);
  if (Array.isArray(data)) return data;
  if (data?.content && Array.isArray(data.content)) return data.content;
  if (data?.items && Array.isArray(data.items)) return data.items;
  return [];
};

export const softwareService = {
  // 1. Dashboard & Tenant
  getTenant: () => unwrapData(apiClient.get('/tenant')),
  getDashboardSummary: (params = {}) => unwrapData(apiClient.get('/dashboard/summary', params)),
  getDashboardActivity: () => unwrapList(apiClient.get('/dashboard/activity')),

  // 2. Users & Team
  getUsers: (role) => unwrapList(apiClient.get('/users', role ? { role } : {})),
  getSalesExecutives: () => unwrapList(apiClient.get('/users', { role: 'SALES_EXECUTIVE' })),
  getSupportAgents: () => unwrapList(apiClient.get('/users', { role: 'SUPPORT_AGENT' })),

  // 3. Leads & Qualification
  getLeads: (params = {}) => unwrapData(apiClient.get('/leads', params)),
  createLead: (lead) => unwrapData(apiClient.post('/leads', lead)),
  getLead: (id) => unwrapData(apiClient.get(`/leads/${id}`)),
  updateLead: (id, updates) => unwrapData(apiClient.patch(`/leads/${id}`, updates)),
  assignLead: (id, assigneeUserId, reason) => unwrapData(apiClient.post(`/leads/${id}/assign`, { assigneeUserId, reason })),
  qualifyLead: (id, qualData) => unwrapData(apiClient.post(`/leads/${id}/qualify`, qualData)),
  getLeadActivities: (id) => unwrapList(apiClient.get(`/leads/${id}/activities`)),
  addLeadActivity: (id, activity) => unwrapData(apiClient.post(`/leads/${id}/activities`, activity)),

  // 4. Opportunities & Products
  getOpportunities: (params = {}) => unwrapList(apiClient.get('/opportunities', params)),
  createOpportunity: (opp) => unwrapData(apiClient.post('/opportunities', opp)),
  getContacts: () => unwrapList(apiClient.get('/contacts')),
  createContact: (contact) => unwrapData(apiClient.post('/contacts', contact)),
  getProducts: () => unwrapList(apiClient.get('/products')),
  createProduct: (product) => unwrapData(apiClient.post('/products', product)),

  // 5. Quotations
  getQuotes: (params = {}) => unwrapList(apiClient.get('/quotes', params)),
  createQuote: (quote) => unwrapData(apiClient.post('/quotes', quote)),
  getQuote: (id) => unwrapData(apiClient.get(`/quotes/${id}`)),
  submitQuoteForApproval: (id, comment) => unwrapData(apiClient.post(`/quotes/${id}/submit-for-approval`, { comment })),
  approveQuote: (id, comment) => unwrapData(apiClient.post(`/quotes/${id}/approve`, { comment })),
  rejectQuote: (id, reason) => unwrapData(apiClient.post(`/quotes/${id}/reject`, { reason })),

  // 6. Support Tickets
  getTickets: (params = {}) => unwrapList(apiClient.get('/tickets', params)),
  createTicket: (ticket) => unwrapData(apiClient.post('/tickets', ticket)),
  getTicket: (id) => unwrapData(apiClient.get(`/tickets/${id}`)),
  updateTicket: (id, updates) => unwrapData(apiClient.patch(`/tickets/${id}`, updates)),
  assignTicket: (id, assigneeUserId, reason) => unwrapData(apiClient.post(`/tickets/${id}/assign`, { assigneeUserId, reason })),
  escalateTicket: (id, details) => unwrapData(apiClient.post(`/tickets/${id}/escalate`, details)),
  resolveTicket: (id, resolutionNotes) => unwrapData(apiClient.post(`/tickets/${id}/resolve`, { resolutionNotes })),
  reopenTicket: (id) => unwrapData(apiClient.post(`/tickets/${id}/reopen`)),
  getTicketMessages: (id) => unwrapList(apiClient.get(`/tickets/${id}/messages`)),
  addTicketMessage: (id, messageType, body) => unwrapData(apiClient.post(`/tickets/${id}/messages`, { messageType, body })),

  // 7. Knowledge Base & AI Assistants
  getKnowledgeSources: () => unwrapList(apiClient.get('/knowledge-sources')),
  createKnowledgeSource: (source) => unwrapData(apiClient.post('/knowledge-sources', source)),
  syncKnowledgeSource: (id) => unwrapData(apiClient.post(`/knowledge-sources/${id}/sync`)),
  searchKnowledge: (query) => unwrapData(apiClient.get('/knowledge/search', { q: query })),
  salesAssist: (task, leadId, context) => unwrapData(apiClient.post('/ai/sales-assist', { task, leadId, context })),
  supportAssist: (ticketId, task, question) => unwrapData(apiClient.post('/ai/support-assist', { ticketId, task, question })),
  getEscalations: () => unwrapList(apiClient.get('/ai/escalations')),
  assignEscalation: (id, assigneeUserId) => unwrapData(apiClient.post(`/ai/escalations/${id}/assign`, { assigneeUserId })),

  // 8. Automations
  getAutomations: () => unwrapList(apiClient.get('/automations')),
  createAutomation: (aut) => unwrapData(apiClient.post('/automations', aut)),
  activateAutomation: (id) => unwrapData(apiClient.post(`/automations/${id}/activate`)),
  pauseAutomation: (id) => unwrapData(apiClient.post(`/automations/${id}/pause`)),
  getAutomationRuns: () => unwrapList(apiClient.get('/automation-runs')),

  // 9. Reports & Audits
  getSalesReport: () => unwrapData(apiClient.get('/reports/sales')),
  getLeadsReport: () => unwrapData(apiClient.get('/reports/leads')),
  getMyPerformance: (role) => unwrapData(apiClient.get('/reports/my-performance', role ? { role } : {})),
  getSupportReport: () => unwrapData(apiClient.get('/reports/support')),
  getSlaReport: () => unwrapData(apiClient.get('/reports/sla')),
  getCsatReport: () => unwrapData(apiClient.get('/reports/customer-satisfaction')),
  getAuditLogs: () => unwrapList(apiClient.get('/audit-logs')),

  // =========================================================================
  // 10. MARKETING MANAGER
  // =========================================================================
  getMarketingDashboard: (period = 'THIS_MONTH') => unwrapData(apiClient.get('/dashboard/summary', { department: 'MARKETING', period })),
  getCampaigns: () => unwrapList(apiClient.get('/marketing/campaigns')),
  createCampaign: (data) => unwrapData(apiClient.post('/marketing/campaigns', data)),
  getCampaign: (id) => unwrapData(apiClient.get(`/marketing/campaigns/${id}`)),
  updateCampaign: (id, data) => unwrapData(apiClient.patch(`/marketing/campaigns/${id}`, data)),
  scheduleCampaign: (id, sched) => unwrapData(apiClient.post(`/marketing/campaigns/${id}/schedule`, sched)),
  pauseCampaign: (id) => unwrapData(apiClient.post(`/marketing/campaigns/${id}/pause`)),
  cancelCampaign: (id) => unwrapData(apiClient.post(`/marketing/campaigns/${id}/cancel`)),
  getCampaignRecipients: (id) => unwrapList(apiClient.get(`/marketing/campaigns/${id}/recipients`)),
  getAudiences: () => unwrapList(apiClient.get('/marketing/audiences')),
  createAudience: (data) => unwrapData(apiClient.post('/marketing/audiences', data)),
  previewAudience: (id, params = {}) => unwrapData(apiClient.post(`/marketing/audiences/${id}/preview`, params)),
  getForms: () => unwrapList(apiClient.get('/marketing/forms')),
  createForm: (data) => unwrapData(apiClient.post('/marketing/forms', data)),
  getMarketingSources: () => unwrapList(apiClient.get('/marketing/sources')),
  getMarketingAttribution: () => unwrapData(apiClient.get('/marketing/attribution')),
  markLeadMql: (leadId, data) => unwrapData(apiClient.post(`/leads/${leadId}/mark-mql`, data)),
  getMarketingAutomations: () => unwrapList(apiClient.get('/marketing/automations')),
  createMarketingAutomation: (data) => unwrapData(apiClient.post('/marketing/automations', data)),
  generateMarketingDraft: (data) => unwrapData(apiClient.post('/marketing/ai/content-draft', data)),
  getMarketingInsights: (data = {}) => unwrapData(apiClient.post('/marketing/ai/campaign-insights', data)),
  getMarketingReport: () => unwrapData(apiClient.get('/reports/marketing')),
  getCampaignsReport: (params = {}) => unwrapData(apiClient.get('/reports/campaigns', params)),

  // =========================================================================
  // 11. ANALYST
  // =========================================================================
  getAnalystDashboard: (period = 'THIS_MONTH') => unwrapData(apiClient.get('/dashboard/summary', { department: 'ANALYTICS', period })),
  getSalesFunnel: (params = {}) => unwrapData(apiClient.get('/analytics/sales-funnel', params)),
  getLeadSourcesAnalytics: (params = {}) => unwrapData(apiClient.get('/analytics/lead-sources', params)),
  getConversionsAnalytics: () => unwrapData(apiClient.get('/analytics/conversions')),
  getRevenuePipelineAnalytics: () => unwrapData(apiClient.get('/analytics/revenue-pipeline')),
  getMarketingAnalytics: () => unwrapData(apiClient.get('/analytics/marketing')),
  getSupportAnalytics: () => unwrapData(apiClient.get('/analytics/support')),
  getAiAgentsAnalytics: (params = {}) => unwrapData(apiClient.get('/analytics/ai-agents', params)),
  getFollowUpsAnalytics: () => unwrapData(apiClient.get('/analytics/follow-ups')),
  getDataQualityAnalytics: () => unwrapData(apiClient.get('/analytics/data-quality')),
  getSavedReports: () => unwrapList(apiClient.get('/reports')),
  createReportDefinition: (data) => unwrapData(apiClient.post('/reports', data)),
  runReport: (id, data = {}) => unwrapData(apiClient.post(`/reports/${id}/run`, data)),
  getReportRunStatus: (runId) => unwrapData(apiClient.get(`/report-runs/${runId}`)),
  getReportRunResults: (runId) => unwrapData(apiClient.get(`/report-runs/${runId}/results`)),
  scheduleReport: (id, data) => unwrapData(apiClient.post(`/reports/${id}/schedule`, data)),
  cancelReportSchedule: (id) => unwrapData(apiClient.delete(`/reports/${id}/schedule`)),
  requestExport: (data) => unwrapData(apiClient.post('/exports', data)),
  getExportStatus: (id) => unwrapData(apiClient.get(`/exports/${id}`)),

  // =========================================================================
  // 12. AI SALES AGENT
  // =========================================================================
  getSalesSessions: () => unwrapList(apiClient.get('/ai/sales/sessions')),
  startSalesSession: (data) => unwrapData(apiClient.post('/ai/sales/sessions', data)),
  getSalesSession: (id) => unwrapData(apiClient.get(`/ai/sales/sessions/${id}`)),
  sendSalesMessage: (id, data) => unwrapData(apiClient.post(`/ai/sales/sessions/${id}/messages`, data)),
  qualifySalesSession: (id, data) => unwrapData(apiClient.post(`/ai/sales/sessions/${id}/qualify`, data)),
  recommendServices: (id, data) => unwrapData(apiClient.post(`/ai/sales/sessions/${id}/recommendations`, data)),
  createLeadFromSession: (id, data) => unwrapData(apiClient.post(`/ai/sales/sessions/${id}/create-lead`, data)),
  createTaskFromSession: (id, data) => unwrapData(apiClient.post(`/ai/sales/sessions/${id}/create-task`, data)),
  summarizeSalesSession: (id, data = {}) => unwrapData(apiClient.post(`/ai/sales/sessions/${id}/summarize`, data)),
  handoffSalesSession: (id, data) => unwrapData(apiClient.post(`/ai/sales/sessions/${id}/handoff`, data)),
  closeSalesSession: (id) => unwrapData(apiClient.post(`/ai/sales/sessions/${id}/close`)),
  getSalesSessionEvents: (id) => unwrapList(apiClient.get(`/ai/sales/sessions/${id}/events`)),
  getSalesMetrics: (params = {}) => unwrapData(apiClient.get('/ai/sales/metrics', params)),

  // =========================================================================
  // 13. AI SUPPORT AGENT
  // =========================================================================
  startSupportSession: (data) => unwrapData(apiClient.post('/ai/support/sessions', data)),
  getSupportSession: (id) => unwrapData(apiClient.get(`/ai/support/sessions/${id}`)),
  sendSupportMessage: (id, data) => unwrapData(apiClient.post(`/ai/support/sessions/${id}/messages`, data)),
  classifySupportIssue: (id, data) => unwrapData(apiClient.post(`/ai/support/sessions/${id}/classify`, data)),
  searchSupportKnowledge: (id, data) => unwrapData(apiClient.post(`/ai/support/sessions/${id}/search-knowledge`, data)),
  troubleshootSupport: (id, data) => unwrapData(apiClient.post(`/ai/support/sessions/${id}/troubleshoot`, data)),
  createTicketFromSession: (id, data) => unwrapData(apiClient.post(`/ai/support/sessions/${id}/create-ticket`, data)),
  summarizeSupportSession: (id, data = {}) => unwrapData(apiClient.post(`/ai/support/sessions/${id}/summarize`, data)),
  handoffSupportSession: (id, data) => unwrapData(apiClient.post(`/ai/support/sessions/${id}/handoff`, data)),
  closeSupportSession: (id) => unwrapData(apiClient.post(`/ai/support/sessions/${id}/close`)),
  getSupportSessionEvents: (id) => unwrapList(apiClient.get(`/ai/support/sessions/${id}/events`)),
  getSupportMetrics: (params = {}) => unwrapData(apiClient.get('/ai/support/metrics', params)),

  // =========================================================================
  // 14. AI FOLLOW-UP AGENT
  // =========================================================================
  getFollowUpConfig: () => unwrapData(apiClient.get('/ai/follow-up/config')),
  updateFollowUpConfig: (data) => unwrapData(apiClient.patch('/ai/follow-up/config', data)),
  getFollowUpRules: () => unwrapList(apiClient.get('/ai/follow-up/rules')),
  createFollowUpRule: (data) => unwrapData(apiClient.post('/ai/follow-up/rules', data)),
  activateFollowUpRule: (id) => unwrapData(apiClient.post(`/ai/follow-up/rules/${id}/activate`)),
  pauseFollowUpRule: (id) => unwrapData(apiClient.post(`/ai/follow-up/rules/${id}/pause`)),
  getFollowUpTasks: () => unwrapList(apiClient.get('/ai/follow-up/tasks')),
  createFollowUpTask: (data) => unwrapData(apiClient.post('/ai/follow-up/tasks', data)),
  completeFollowUpTask: (id) => unwrapData(apiClient.post(`/ai/follow-up/tasks/${id}/complete`)),
  cancelFollowUpTask: (id) => unwrapData(apiClient.post(`/ai/follow-up/tasks/${id}/cancel`)),
  snoozeFollowUpTask: (id, data) => unwrapData(apiClient.post(`/ai/follow-up/tasks/${id}/snooze`, data)),
  createFollowUpDraft: (data) => unwrapData(apiClient.post('/ai/follow-up/drafts', data)),
  approveFollowUpDraft: (id, data = {}) => unwrapData(apiClient.post(`/ai/follow-up/drafts/${id}/approve`, data)),
  sendFollowUpDraft: (id, data = {}) => unwrapData(apiClient.post(`/ai/follow-up/drafts/${id}/send`, data)),
  getFollowUpExecutions: () => unwrapList(apiClient.get('/ai/follow-up/executions')),
  retryFollowUpExecution: (id) => unwrapData(apiClient.post(`/ai/follow-up/executions/${id}/retry`)),
  stopContactFollowUp: (data) => unwrapData(apiClient.post('/ai/follow-up/stop-contact', data)),
  getFollowUpMetrics: (params = {}) => unwrapData(apiClient.get('/ai/follow-up/metrics', params)),

  // =========================================================================
  // 15. AI APPOINTMENT AGENT (20 APIs)
  // Base: /api/v1/software/ai/appointments
  // =========================================================================
  getAppointmentConfig: () => unwrapData(apiClient.get('/software/ai/appointments/config')),
  updateAppointmentConfig: (data) => unwrapData(apiClient.patch('/software/ai/appointments/config', data)),
  startAppointmentSession: (data) => unwrapData(apiClient.post('/software/ai/appointments/sessions', data)),
  getAppointmentSession: (sessionId) => unwrapData(apiClient.get(`/software/ai/appointments/sessions/${sessionId}`)),
  sendAppointmentMessage: (sessionId, data) => unwrapData(apiClient.post(`/software/ai/appointments/sessions/${sessionId}/messages`, data)),
  getAvailableSlots: (params = {}) => unwrapData(apiClient.get('/software/ai/appointments/availability', params)),
  createBookingRequest: (data) => unwrapData(apiClient.post('/software/ai/appointments/booking-requests', data)),
  getBookingRequests: () => unwrapList(apiClient.get('/software/ai/appointments/booking-requests')),
  getBookingRequest: (requestId) => unwrapData(apiClient.get(`/software/ai/appointments/booking-requests/${requestId}`)),
  confirmBookingRequest: (requestId, data = {}) => unwrapData(apiClient.post(`/software/ai/appointments/booking-requests/${requestId}/confirm`, data)),
  rescheduleBookingRequest: (requestId, data) => unwrapData(apiClient.post(`/software/ai/appointments/booking-requests/${requestId}/reschedule`, data)),
  cancelBookingRequest: (requestId, data = {}) => unwrapData(apiClient.post(`/software/ai/appointments/booking-requests/${requestId}/cancel`, data)),
  getAppointments: () => unwrapList(apiClient.get('/software/ai/appointments/appointments')),
  getAppointment: (appointmentId) => unwrapData(apiClient.get(`/software/ai/appointments/appointments/${appointmentId}`)),
  createAppointmentReminder: (appointmentId, data) => unwrapData(apiClient.post(`/software/ai/appointments/appointments/${appointmentId}/reminders`, data)),
  getAppointmentEvents: (appointmentId) => unwrapList(apiClient.get(`/software/ai/appointments/appointments/${appointmentId}/events`)),
  handoffAppointmentSession: (sessionId, data) => unwrapData(apiClient.post(`/software/ai/appointments/sessions/${sessionId}/handoff`, data)),
  closeAppointmentSession: (sessionId) => unwrapData(apiClient.post(`/software/ai/appointments/sessions/${sessionId}/close`)),
  getAppointmentMetrics: (params = {}) => unwrapData(apiClient.get('/software/ai/appointments/metrics', params)),
  getAppointmentAuditEvents: () => unwrapList(apiClient.get('/software/ai/appointments/audit-events')),

  // =========================================================================
  // 16. AI FOLLOW-UP AGENT V1 (25 APIs)
  // Base: /api/v1/software/ai/follow-ups
  // =========================================================================
  getFollowUpsConfig: () => unwrapData(apiClient.get('/software/ai/follow-ups/config')),
  updateFollowUpsConfig: (data) => unwrapData(apiClient.patch('/software/ai/follow-ups/config', data)),
  getFollowUpsRules: () => unwrapList(apiClient.get('/software/ai/follow-ups/rules')),
  createFollowUpsRule: (data) => unwrapData(apiClient.post('/software/ai/follow-ups/rules', data)),
  getFollowUpsRule: (ruleId) => unwrapData(apiClient.get(`/software/ai/follow-ups/rules/${ruleId}`)),
  updateFollowUpsRule: (ruleId, data) => unwrapData(apiClient.patch(`/software/ai/follow-ups/rules/${ruleId}`, data)),
  activateFollowUpsRule: (ruleId) => unwrapData(apiClient.post(`/software/ai/follow-ups/rules/${ruleId}/activate`)),
  pauseFollowUpsRule: (ruleId) => unwrapData(apiClient.post(`/software/ai/follow-ups/rules/${ruleId}/pause`)),
  getFollowUpsTasks: (params = {}) => unwrapList(apiClient.get('/software/ai/follow-ups/tasks', params)),
  createFollowUpsTask: (data) => unwrapData(apiClient.post('/software/ai/follow-ups/tasks', data)),
  getFollowUpsTask: (taskId) => unwrapData(apiClient.get(`/software/ai/follow-ups/tasks/${taskId}`)),
  updateFollowUpsTask: (taskId, data) => unwrapData(apiClient.patch(`/software/ai/follow-ups/tasks/${taskId}`, data)),
  completeFollowUpsTask: (taskId, data = {}) => unwrapData(apiClient.post(`/software/ai/follow-ups/tasks/${taskId}/complete`, data)),
  cancelFollowUpsTask: (taskId, data = {}) => unwrapData(apiClient.post(`/software/ai/follow-ups/tasks/${taskId}/cancel`, data)),
  snoozeFollowUpsTask: (taskId, data) => unwrapData(apiClient.post(`/software/ai/follow-ups/tasks/${taskId}/snooze`, data)),
  createFollowUpsDraft: (data) => unwrapData(apiClient.post('/software/ai/follow-ups/drafts', data)),
  getFollowUpsDrafts: () => unwrapList(apiClient.get('/software/ai/follow-ups/drafts')),
  approveFollowUpsDraft: (draftId, data = {}) => unwrapData(apiClient.post(`/software/ai/follow-ups/drafts/${draftId}/approve`, data)),
  sendFollowUpsDraft: (draftId, data = {}) => unwrapData(apiClient.post(`/software/ai/follow-ups/drafts/${draftId}/send`, data)),
  getFollowUpsExecutions: (params = {}) => unwrapData(apiClient.get('/software/ai/follow-ups/executions', params)),
  getFollowUpsExecution: (executionId) => unwrapData(apiClient.get(`/software/ai/follow-ups/executions/${executionId}`)),
  retryFollowUpsExecution: (executionId) => unwrapData(apiClient.post(`/software/ai/follow-ups/executions/${executionId}/retry`)),
  stopContactFollowUps: (data) => unwrapData(apiClient.post('/software/ai/follow-ups/stop-contact', data)),
  getFollowUpsSuppressionList: () => unwrapList(apiClient.get('/software/ai/follow-ups/suppression-list')),
  getFollowUpsMetrics: (params = {}) => unwrapData(apiClient.get('/software/ai/follow-ups/metrics', params))
};
