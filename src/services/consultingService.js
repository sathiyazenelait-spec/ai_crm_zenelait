import { apiClient } from './apiClient';

const unwrapData = async (promise) => {
  const res = await promise;
  if (!res.success) {
    throw new Error(res.message || res.error || 'API Request failed');
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

export const consultingService = {
  // ==========================================
  // SHARED & ADMIN LEGACY APIS
  // ==========================================
  getDashboard: (from, to) => unwrapData(apiClient.get('/consulting/dashboard', { from, to })),
  getSettings: () => unwrapData(apiClient.get('/consulting/settings')),
  updateSettings: (data) => unwrapData(apiClient.put('/consulting/settings', data)),
  getServices: () => unwrapList(apiClient.get('/consulting/services')),
  createService: (data) => unwrapData(apiClient.post('/consulting/services', data)),
  getConsultants: () => unwrapList(apiClient.get('/consulting/consultants')),
  createConsultant: (data) => unwrapData(apiClient.post('/consulting/consultants', data)),
  getLeads: () => unwrapList(apiClient.get('/consulting/leads')),
  createLead: (data) => unwrapData(apiClient.post('/consulting/leads', data)),
  qualifyLead: (id, data) => unwrapData(apiClient.post(`/consulting/leads/${id}/qualify`, data)),
  getAccounts: () => unwrapList(apiClient.get('/consulting/accounts')),
  createAccount: (data) => unwrapData(apiClient.post('/consulting/accounts', data)),
  getAppointments: () => unwrapList(apiClient.get('/consulting/appointments')),
  createAppointment: (data) => unwrapData(apiClient.post('/consulting/appointments', data)),
  getProposals: () => unwrapList(apiClient.get('/consulting/proposals')),
  createProposal: (data) => unwrapData(apiClient.post('/consulting/proposals', data)),
  sendProposal: (id) => unwrapData(apiClient.post(`/consulting/proposals/${id}/send`)),
  acceptProposal: (id) => unwrapData(apiClient.post(`/consulting/proposals/${id}/accept`)),
  getEngagements: () => unwrapList(apiClient.get('/consulting/engagements')),
  createEngagement: (data) => unwrapData(apiClient.post('/consulting/engagements', data)),
  getProjects: () => unwrapList(apiClient.get('/consulting/projects')),
  createProject: (data) => unwrapData(apiClient.post('/consulting/projects', data)),
  getRevenueReport: () => unwrapData(apiClient.get('/reports/consulting/revenue')),

  // ==========================================
  // 1. CONSULTING SALES MANAGER APIS
  // Base: /consulting/sales-manager
  // ==========================================
  salesManager: {
    getDashboard: () => unwrapData(apiClient.get('/consulting/sales-manager/dashboard')),
    getMetrics: () => unwrapData(apiClient.get('/consulting/sales-manager/metrics')),
    getPipeline: (params) => unwrapData(apiClient.get('/consulting/sales-manager/pipeline', params)),
    getForecast: (period) => unwrapData(apiClient.get('/consulting/sales-manager/forecast', { period })),
    getTeamPerformance: (period) => unwrapData(apiClient.get('/consulting/sales-manager/team-performance', { period })),
    getSalesReport: () => unwrapData(apiClient.get('/consulting/sales-manager/reports/sales')),
    getWinLossReport: () => unwrapData(apiClient.get('/consulting/sales-manager/reports/win-loss')),
    getServiceDemandReport: () => unwrapData(apiClient.get('/consulting/sales-manager/reports/service-demand')),
    getProposalsReport: () => unwrapData(apiClient.get('/consulting/sales-manager/reports/proposals')),
    getRevenueReport: () => unwrapData(apiClient.get('/consulting/sales-manager/reports/revenue')),
    getActivityLogs: () => unwrapList(apiClient.get('/consulting/sales-manager/activity-logs')),

    // Leads
    getLeads: () => unwrapList(apiClient.get('/consulting/sales-manager/leads')),
    getLeadById: (id) => unwrapData(apiClient.get(`/consulting/sales-manager/leads/${id}`)),
    createLead: (data) => unwrapData(apiClient.post('/consulting/sales-manager/leads', data)),
    patchLead: (id, data) => unwrapData(apiClient.patch(`/consulting/sales-manager/leads/${id}`, data)),
    assignLead: (id, assigneeId, reason) => unwrapData(apiClient.post(`/consulting/sales-manager/leads/${id}/assign`, { assigneeId, reason })),
    qualifyLead: (id, notes) => unwrapData(apiClient.post(`/consulting/sales-manager/leads/${id}/qualify`, { notes })),
    disqualifyLead: (id, reason) => unwrapData(apiClient.post(`/consulting/sales-manager/leads/${id}/disqualify`, { reason })),
    getLeadActivities: (id) => unwrapList(apiClient.get(`/consulting/sales-manager/leads/${id}/activities`)),
    addLeadActivity: (id, data) => unwrapData(apiClient.post(`/consulting/sales-manager/leads/${id}/activities`, data)),

    // Opportunities & Pipeline
    getOpportunities: () => unwrapList(apiClient.get('/consulting/sales-manager/opportunities')),
    createOpportunity: (data) => unwrapData(apiClient.post('/consulting/sales-manager/opportunities', data)),
    getOpportunityById: (id) => unwrapData(apiClient.get(`/consulting/sales-manager/opportunities/${id}`)),
    patchOpportunity: (id, data) => unwrapData(apiClient.patch(`/consulting/sales-manager/opportunities/${id}`, data)),
    assignOpportunity: (id, assigneeId) => unwrapData(apiClient.post(`/consulting/sales-manager/opportunities/${id}/assign`, { assigneeId })),
    updateOpportunityStage: (id, stage, reason) => unwrapData(apiClient.post(`/consulting/sales-manager/opportunities/${id}/stage`, { stage, reason })),
    updateProbability: (id, probability) => unwrapData(apiClient.post(`/consulting/sales-manager/opportunities/${id}/probability`, { probability })),
    closeWon: (id, reason) => unwrapData(apiClient.post(`/consulting/sales-manager/opportunities/${id}/close-won`, { reason })),
    closeLost: (id, reason) => unwrapData(apiClient.post(`/consulting/sales-manager/opportunities/${id}/close-lost`, { reason })),
    getOpportunityHistory: (id) => unwrapList(apiClient.get(`/consulting/sales-manager/opportunities/${id}/history`)),

    // Team & Targets
    getTeam: () => unwrapList(apiClient.get('/consulting/sales-manager/team')),
    getUserPerformance: (userId) => unwrapData(apiClient.get(`/consulting/sales-manager/team/${userId}/performance`)),
    getTargets: () => unwrapList(apiClient.get('/consulting/sales-manager/targets')),
    createTarget: (data) => unwrapData(apiClient.post('/consulting/sales-manager/targets', data)),
    getTargetById: (id) => unwrapData(apiClient.get(`/consulting/sales-manager/targets/${id}`)),
    patchTarget: (id, data) => unwrapData(apiClient.patch(`/consulting/sales-manager/targets/${id}`, data)),
    assignTarget: (id, assigneeId) => unwrapData(apiClient.post(`/consulting/sales-manager/targets/${id}/assign`, { assigneeId })),
    getTeamAssignments: () => unwrapList(apiClient.get('/consulting/sales-manager/team-assignments')),
    bulkTeamAssignments: (data) => unwrapData(apiClient.post('/consulting/sales-manager/team-assignments/bulk', data)),

    // Services & Proposals
    getServices: () => unwrapList(apiClient.get('/consulting/sales-manager/services')),
    createService: (data) => unwrapData(apiClient.post('/consulting/sales-manager/services', data)),
    getProposals: () => unwrapList(apiClient.get('/consulting/sales-manager/proposals')),
    getProposalById: (id) => unwrapData(apiClient.get(`/consulting/sales-manager/proposals/${id}`)),
    validateProposal: (id) => unwrapData(apiClient.post(`/consulting/sales-manager/proposals/${id}/validate`)),
    requestProposalApproval: (id) => unwrapData(apiClient.post(`/consulting/sales-manager/proposals/${id}/request-approval`)),
    decideProposal: (id, decision, comments) => unwrapData(apiClient.post(`/consulting/sales-manager/proposals/${id}/decision`, { decision, comments })),
    requestProposalRevision: (id, comments) => unwrapData(apiClient.post(`/consulting/sales-manager/proposals/${id}/request-revision`, { comments })),
    getProposalHistory: (id) => unwrapList(apiClient.get(`/consulting/sales-manager/proposals/${id}/history`)),
    getPendingProposals: () => unwrapData(apiClient.get('/consulting/sales-manager/proposals/pending-approval')),

    // Pricing & Discounts
    getPricingRequests: () => unwrapList(apiClient.get('/consulting/sales-manager/pricing/requests')),
    getPricingRequestById: (id) => unwrapData(apiClient.get(`/consulting/sales-manager/pricing/requests/${id}`)),
    decidePricing: (id, decision) => unwrapData(apiClient.post(`/consulting/sales-manager/pricing/requests/${id}/decision`, { decision })),
    getDiscountPolicies: () => unwrapData(apiClient.get('/consulting/sales-manager/discount-policies')),
    getApprovalQueue: () => unwrapList(apiClient.get('/consulting/sales-manager/approval-queue')),

    // Contracts & Handoffs
    getContracts: () => unwrapList(apiClient.get('/consulting/sales-manager/contracts')),
    getContractById: (id) => unwrapData(apiClient.get(`/consulting/sales-manager/contracts/${id}`)),
    requestContractReview: (id) => unwrapData(apiClient.post(`/consulting/sales-manager/contracts/${id}/request-review`)),
    getEngagementHandoffs: () => unwrapList(apiClient.get('/consulting/sales-manager/engagement-handoffs')),
    initiateHandoff: (data) => unwrapData(apiClient.post('/consulting/sales-manager/engagement-handoffs', data)),
    getHandoffById: (id) => unwrapData(apiClient.get(`/consulting/sales-manager/engagement-handoffs/${id}`)),
    acceptHandoff: (id) => unwrapData(apiClient.post(`/consulting/sales-manager/engagement-handoffs/${id}/accept`)),
    returnHandoff: (id, reason) => unwrapData(apiClient.post(`/consulting/sales-manager/engagement-handoffs/${id}/return`, { reason }))
  },

  // ==========================================
  // 2. CONSULTING SALES EXECUTIVE APIS
  // Base: /consulting/sales-executive
  // ==========================================
  salesExecutive: {
    getDashboard: () => unwrapData(apiClient.get('/consulting/sales-executive/dashboard')),
    getMyLeads: (page = 0, size = 20) => unwrapData(apiClient.get('/consulting/sales-executive/my-leads', { page, size })),
    getMyOpportunities: () => unwrapList(apiClient.get('/consulting/sales-executive/my-opportunities')),
    getMyTasks: () => unwrapList(apiClient.get('/consulting/sales-executive/my-tasks')),
    getMetrics: () => unwrapData(apiClient.get('/consulting/sales-executive/metrics')),
    getActivityLogs: () => unwrapList(apiClient.get('/consulting/sales-executive/activity-logs')),

    // Clients & Contacts
    getClients: () => unwrapList(apiClient.get('/consulting/sales-executive/clients')),
    createClient: (data) => unwrapData(apiClient.post('/consulting/sales-executive/clients', data)),
    getClientById: (id) => unwrapData(apiClient.get(`/consulting/sales-executive/clients/${id}`)),
    patchClient: (id, data) => unwrapData(apiClient.patch(`/consulting/sales-executive/clients/${id}`, data)),
    getClientContacts: (id) => unwrapList(apiClient.get(`/consulting/sales-executive/clients/${id}/contacts`)),
    addClientContact: (id, data) => unwrapData(apiClient.post(`/consulting/sales-executive/clients/${id}/contacts`, data)),
    patchContact: (clientId, contactId, data) => unwrapData(apiClient.patch(`/consulting/sales-executive/clients/${clientId}/contacts/${contactId}`, data)),
    getClientActivities: (id) => unwrapList(apiClient.get(`/consulting/sales-executive/clients/${id}/activities`)),
    recordClientActivity: (id, data) => unwrapData(apiClient.post(`/consulting/sales-executive/clients/${id}/activities`, data)),
    checkDuplicates: (data) => unwrapData(apiClient.post('/consulting/sales-executive/duplicate-checks', data)),

    // Leads
    getLeads: () => unwrapList(apiClient.get('/consulting/sales-executive/leads')),
    createLead: (data) => unwrapData(apiClient.post('/consulting/sales-executive/leads', data)),
    getLeadById: (id) => unwrapData(apiClient.get(`/consulting/sales-executive/leads/${id}`)),
    patchLead: (id, data) => unwrapData(apiClient.patch(`/consulting/sales-executive/leads/${id}`, data)),
    qualifyLead: (id) => unwrapData(apiClient.post(`/consulting/sales-executive/leads/${id}/qualify`)),
    disqualifyLead: (id, reason) => unwrapData(apiClient.post(`/consulting/sales-executive/leads/${id}/disqualify`, { reason })),
    convertLead: (id) => unwrapData(apiClient.post(`/consulting/sales-executive/leads/${id}/convert`)),
    handoffLead: (id, assigneeId) => unwrapData(apiClient.post(`/consulting/sales-executive/leads/${id}/handoff`, { assigneeId })),

    // Discovery & Requirements
    getServiceCatalogue: () => unwrapList(apiClient.get('/consulting/sales-executive/service-catalogue')),
    getServiceDetail: (id) => unwrapData(apiClient.get(`/consulting/sales-executive/service-catalogue/${id}`)),
    createDiscoverySession: (data) => unwrapData(apiClient.post('/consulting/sales-executive/discovery-sessions', data)),
    getDiscoverySession: (id) => unwrapData(apiClient.get(`/consulting/sales-executive/discovery-sessions/${id}`)),
    addDiscoveryNotes: (id, notes) => unwrapData(apiClient.post(`/consulting/sales-executive/discovery-sessions/${id}/notes`, { notes })),
    recordDiscoveryRequirements: (sessionId, data) => unwrapData(apiClient.post(`/consulting/sales-executive/discovery-sessions/${sessionId}/requirements`, data)),
    getSessionRequirements: (sessionId) => unwrapList(apiClient.get(`/consulting/sales-executive/discovery-sessions/${sessionId}/requirements`)),
    validateRequirement: (id) => unwrapData(apiClient.post(`/consulting/sales-executive/requirements/${id}/validate`)),
    approveRequirement: (id) => unwrapData(apiClient.post(`/consulting/sales-executive/requirements/${id}/approve`)),
    completeDiscovery: (sessionId) => unwrapData(apiClient.post(`/consulting/sales-executive/discovery-sessions/${sessionId}/complete`)),

    // Meetings
    getMeetings: () => unwrapList(apiClient.get('/consulting/sales-executive/meetings')),
    createMeeting: (data) => unwrapData(apiClient.post('/consulting/sales-executive/meetings', data)),
    cancelMeeting: (id) => unwrapData(apiClient.post(`/consulting/sales-executive/meetings/${id}/cancel`)),

    // Opportunities
    getOpportunities: () => unwrapList(apiClient.get('/consulting/sales-executive/opportunities')),
    createOpportunity: (data) => unwrapData(apiClient.post('/consulting/sales-executive/opportunities', data)),
    getOpportunityById: (id) => unwrapData(apiClient.get(`/consulting/sales-executive/opportunities/${id}`)),
    updateOpportunityStage: (id, stage) => unwrapData(apiClient.post(`/consulting/sales-executive/opportunities/${id}/stage`, { stage })),
    closeWon: (id) => unwrapData(apiClient.post(`/consulting/sales-executive/opportunities/${id}/close-won`)),
    closeLost: (id, reason) => unwrapData(apiClient.post(`/consulting/sales-executive/opportunities/${id}/close-lost`, { reason })),

    // Proposals & Pricing
    getProposals: () => unwrapList(apiClient.get('/consulting/sales-executive/proposals')),
    createProposalDraft: (data) => unwrapData(apiClient.post('/consulting/sales-executive/proposals', data)),
    getProposalById: (id) => unwrapData(apiClient.get(`/consulting/sales-executive/proposals/${id}`)),
    requestPricingEstimate: (data) => unwrapData(apiClient.post('/consulting/sales-executive/pricing/estimates', data)),
    requestProposalApproval: (id, reason) => unwrapData(apiClient.post(`/consulting/sales-executive/proposals/${id}/request-approval`, { reason })),
    sendProposal: (id, data) => unwrapData(apiClient.post(`/consulting/sales-executive/proposals/${id}/send`, data)),
    recordClientResponse: (id, data) => unwrapData(apiClient.post(`/consulting/sales-executive/proposals/${id}/record-response`, data)),

    // Follow-ups & Tasks
    getFollowUps: () => unwrapList(apiClient.get('/consulting/sales-executive/follow-ups')),
    createFollowUp: (data) => unwrapData(apiClient.post('/consulting/sales-executive/follow-ups', data)),
    completeFollowUp: (id) => unwrapData(apiClient.post(`/consulting/sales-executive/follow-ups/${id}/complete`)),

    // Engagement Handoff
    initiateHandoff: (data) => unwrapData(apiClient.post('/consulting/sales-executive/engagement-handoffs', data)),
    getHandoffStatus: (id) => unwrapData(apiClient.get(`/consulting/sales-executive/engagement-handoffs/${id}`)),
    submitHandoff: (id) => unwrapData(apiClient.post(`/consulting/sales-executive/engagement-handoffs/${id}/submit`)),
    getMyPerformance: () => unwrapData(apiClient.get('/consulting/sales-executive/reports/my-performance'))
  },

  // ==========================================
  // 3. CONSULTING CUSTOMER SUPPORT APIS
  // Base: /consulting/customer-support
  // ==========================================
  customerSupport: {
    getDashboard: () => unwrapData(apiClient.get('/consulting/customer-support/dashboard')),
    getMetrics: () => unwrapData(apiClient.get('/consulting/customer-support/metrics')),
    getMyTickets: () => unwrapList(apiClient.get('/consulting/customer-support/my-tickets')),
    getResolutionReport: () => unwrapData(apiClient.get('/consulting/customer-support/reports/resolution')),
    getSlaReport: () => unwrapData(apiClient.get('/consulting/customer-support/reports/sla')),
    getClientSatisfaction: () => unwrapData(apiClient.get('/consulting/customer-support/reports/client-satisfaction')),
    getIssueCategories: () => unwrapList(apiClient.get('/consulting/customer-support/reports/issue-categories')),
    getActivityLogs: () => unwrapList(apiClient.get('/consulting/customer-support/activity-logs')),

    // Tickets
    getTickets: () => unwrapList(apiClient.get('/consulting/customer-support/tickets')),
    createTicket: (data) => unwrapData(apiClient.post('/consulting/customer-support/tickets', data)),
    getTicketById: (id) => unwrapData(apiClient.get(`/consulting/customer-support/tickets/${id}`)),
    patchTicket: (id, data) => unwrapData(apiClient.patch(`/consulting/customer-support/tickets/${id}`, data)),
    assignTicket: (id, assigneeId, reason) => unwrapData(apiClient.post(`/consulting/customer-support/tickets/${id}/assign`, { assigneeId, reason })),
    changePriority: (id, priority) => unwrapData(apiClient.post(`/consulting/customer-support/tickets/${id}/priority`, { priority })),
    changeCategory: (id, category) => unwrapData(apiClient.post(`/consulting/customer-support/tickets/${id}/category`, { category })),
    escalateTicket: (id, reason, targetTeam, description) => unwrapData(apiClient.post(`/consulting/customer-support/tickets/${id}/escalate`, { reason, targetTeam, description })),
    resolveTicket: (id, resolutionNotes) => unwrapData(apiClient.post(`/consulting/customer-support/tickets/${id}/resolve`, { resolutionNotes })),
    reopenTicket: (id) => unwrapData(apiClient.post(`/consulting/customer-support/tickets/${id}/reopen`)),
    getTicketMessages: (id) => unwrapList(apiClient.get(`/consulting/customer-support/tickets/${id}/messages`)),
    sendTicketMessage: (id, message, sender = 'CUSTOMER_SUPPORT') => unwrapData(apiClient.post(`/consulting/customer-support/tickets/${id}/messages`, { message, sender })),
    addInternalNote: (id, text, author = 'CUSTOMER_SUPPORT') => unwrapData(apiClient.post(`/consulting/customer-support/tickets/${id}/internal-notes`, { text, author })),

    // Client & Engagement Lookups
    getClients: () => unwrapList(apiClient.get('/consulting/customer-support/clients')),
    getClientById: (id) => unwrapData(apiClient.get(`/consulting/customer-support/clients/${id}`)),
    getEngagements: () => unwrapList(apiClient.get('/consulting/customer-support/engagements')),
    getEngagementStatus: (id) => unwrapData(apiClient.get(`/consulting/customer-support/engagements/${id}/status`)),
    getEngagementMilestones: (id) => unwrapData(apiClient.get(`/consulting/customer-support/engagements/${id}/milestones`)),
    getEngagementDeliverables: (id) => unwrapList(apiClient.get(`/consulting/customer-support/engagements/${id}/deliverables`)),

    // Invoices & Billing
    getInvoiceStatus: (id) => unwrapData(apiClient.get(`/consulting/customer-support/invoices/${id}/status`)),
    createBillingEnquiry: (data) => unwrapData(apiClient.post('/consulting/customer-support/billing-enquiries', data)),

    // Meetings & Deliverable Access
    createMeetingRequest: (data) => unwrapData(apiClient.post('/consulting/customer-support/meeting-requests', data)),
    requestDeliverableAccess: (data) => unwrapData(apiClient.post('/consulting/customer-support/deliverable-access-requests', data)),

    // SLA & Knowledge Base
    getTicketSla: (id) => unwrapData(apiClient.get(`/consulting/customer-support/tickets/${id}/sla`)),
    getKnowledgeArticles: () => unwrapList(apiClient.get('/consulting/customer-support/knowledge/articles')),
    searchKnowledge: (query) => unwrapList(apiClient.post('/consulting/customer-support/knowledge/search', { query })),

    // AI Assistance
    classifyTicketAi: (subject, description) => unwrapData(apiClient.post('/consulting/customer-support/ai/classify-ticket', { subject, description })),
    summarizeTicketAi: (ticketId) => unwrapData(apiClient.post('/consulting/customer-support/ai/summarize-ticket', { ticketId })),
    draftResponseAi: (ticketId, clientMessage) => unwrapData(apiClient.post('/consulting/customer-support/ai/draft-response', { ticketId, clientMessage })),

    // Feedback & Complaints
    recordFeedback: (data) => unwrapData(apiClient.post('/consulting/customer-support/feedback', data)),
    createComplaint: (data) => unwrapData(apiClient.post('/consulting/customer-support/complaints', data)),
    escalateComplaint: (id) => unwrapData(apiClient.post(`/consulting/customer-support/complaints/${id}/escalate`)),
    getEscalations: () => unwrapList(apiClient.get('/consulting/customer-support/escalations'))
  },

  // ==========================================
  // 4. CONSULTING RELATIONSHIP MANAGER APIS
  // Base: /consulting/relationship-manager
  // ==========================================
  relationshipManager: {
    getDashboard: () => unwrapData(apiClient.get('/consulting/relationship-manager/dashboard')),
    getMetrics: () => unwrapData(apiClient.get('/consulting/relationship-manager/metrics')),
    getMyAccounts: (params) => unwrapData(apiClient.get('/consulting/relationship-manager/my-accounts', params)),
    getAccountById: (id) => unwrapData(apiClient.get(`/consulting/relationship-manager/accounts/${id}`)),
    createAccount: (data) => unwrapData(apiClient.post('/consulting/relationship-manager/accounts', data)),
    patchAccount: (id, data) => unwrapData(apiClient.patch(`/consulting/relationship-manager/accounts/${id}`, data)),
    getContacts: (accountId) => unwrapList(apiClient.get(`/consulting/relationship-manager/accounts/${accountId}/contacts`)),
    addContact: (accountId, data) => unwrapData(apiClient.post(`/consulting/relationship-manager/accounts/${accountId}/contacts`, data)),
    getEngagements: (accountId) => unwrapList(apiClient.get(`/consulting/relationship-manager/accounts/${accountId}/engagements`)),
    getContracts: (accountId) => unwrapList(apiClient.get(`/consulting/relationship-manager/accounts/${accountId}/contracts`)),
    getActivities: (accountId) => unwrapList(apiClient.get(`/consulting/relationship-manager/accounts/${accountId}/activities`)),
    recordActivity: (accountId, data) => unwrapData(apiClient.post(`/consulting/relationship-manager/accounts/${accountId}/activities`, data)),
    getHealth: (accountId) => unwrapData(apiClient.get(`/consulting/relationship-manager/accounts/${accountId}/health`)),
    recordHealthAssessment: (accountId, data) => unwrapData(apiClient.post(`/consulting/relationship-manager/accounts/${accountId}/health-assessments`, data)),
    getRisks: (accountId) => unwrapList(apiClient.get(`/consulting/relationship-manager/accounts/${accountId}/risks`)),
    createRisk: (accountId, data) => unwrapData(apiClient.post(`/consulting/relationship-manager/accounts/${accountId}/risks`, data)),
    resolveRisk: (accountId, riskId, resolutionNotes) => unwrapData(apiClient.post(`/consulting/relationship-manager/accounts/${accountId}/risks/${riskId}/resolve`, { resolutionNotes })),
    getReviewMeetings: (accountId) => unwrapList(apiClient.get(`/consulting/relationship-manager/accounts/${accountId}/review-meetings`)),
    requestReviewMeeting: (accountId, data) => unwrapData(apiClient.post(`/consulting/relationship-manager/accounts/${accountId}/review-meetings`, data)),
    getSatisfaction: (accountId) => unwrapList(apiClient.get(`/consulting/relationship-manager/accounts/${accountId}/satisfaction`)),
    requestSatisfactionSurvey: (accountId, data) => unwrapData(apiClient.post(`/consulting/relationship-manager/accounts/${accountId}/satisfaction-surveys`, data)),
    getComplaints: (accountId) => unwrapList(apiClient.get(`/consulting/relationship-manager/accounts/${accountId}/complaints`)),
    createComplaint: (accountId, data) => unwrapData(apiClient.post(`/consulting/relationship-manager/accounts/${accountId}/complaints`, data)),
    escalateComplaint: (complaintId, data) => unwrapData(apiClient.post(`/consulting/relationship-manager/complaints/${complaintId}/escalate`, data)),
    getRenewals: (accountId) => unwrapList(apiClient.get(`/consulting/relationship-manager/accounts/${accountId}/renewals`)),
    getAllRenewals: () => unwrapList(apiClient.get('/consulting/relationship-manager/renewals')),
    createRenewal: (data) => unwrapData(apiClient.post('/consulting/relationship-manager/renewals', data)),
    getGrowthOpportunities: (accountId) => unwrapList(apiClient.get(`/consulting/relationship-manager/accounts/${accountId}/growth-opportunities`)),
    createGrowthOpportunity: (accountId, data) => unwrapData(apiClient.post(`/consulting/relationship-manager/accounts/${accountId}/growth-opportunities`, data)),
    handoffGrowthOpportunity: (opportunityId, data) => unwrapData(apiClient.post(`/consulting/relationship-manager/growth-opportunities/${opportunityId}/handoff`, data)),
    generateAccountSummaryAi: (accountId, include) => unwrapData(apiClient.post('/consulting/relationship-manager/ai/account-summary', { accountId, include })),
    generateMeetingBriefAi: (accountId, meetingId) => unwrapData(apiClient.post('/consulting/relationship-manager/ai/meeting-brief', { accountId, meetingId })),
    getReportsHealth: () => unwrapData(apiClient.get('/consulting/relationship-manager/reports/account-health')),
    getReportsRenewals: () => unwrapData(apiClient.get('/consulting/relationship-manager/reports/renewals'))
  },

  // ==========================================
  // 5. CONSULTING AI LEAD QUALIFICATION APIS
  // Base: /consulting/ai-lead-qualification
  // ==========================================
  aiLeadQualification: {
    getDashboard: () => unwrapData(apiClient.get('/consulting/ai-lead-qualification/dashboard')),
    getMetrics: () => unwrapData(apiClient.get('/consulting/ai-lead-qualification/metrics')),
    getJobs: () => unwrapList(apiClient.get('/consulting/ai-lead-qualification/jobs')),
    getJobById: (id) => unwrapData(apiClient.get(`/consulting/ai-lead-qualification/jobs/${id}`)),
    submitJob: (data) => unwrapData(apiClient.post('/consulting/ai-lead-qualification/jobs', data)),
    getPendingLeads: () => unwrapList(apiClient.get('/consulting/ai-lead-qualification/leads/pending')),
    getLeadById: (id) => unwrapData(apiClient.get(`/consulting/ai-lead-qualification/leads/${id}`)),
    qualifyLead: (id) => unwrapData(apiClient.post(`/consulting/ai-lead-qualification/leads/${id}/qualify`)),
    getLeadQualification: (id) => unwrapData(apiClient.get(`/consulting/ai-lead-qualification/leads/${id}/qualification`)),
    getQuestions: (leadId) => unwrapData(apiClient.get(`/consulting/ai-lead-qualification/leads/${leadId}/questions`)),
    recordAnswers: (leadId, data) => unwrapData(apiClient.post(`/consulting/ai-lead-qualification/leads/${leadId}/answers`, data)),
    checkDuplicates: (leadId, data) => unwrapData(apiClient.post(`/consulting/ai-lead-qualification/leads/${leadId}/duplicate-check`, data)),
    getExplanations: (leadId) => unwrapData(apiClient.get(`/consulting/ai-lead-qualification/leads/${leadId}/explanations`)),
    getRecommendations: (leadId, data) => unwrapData(apiClient.post(`/consulting/ai-lead-qualification/leads/${leadId}/recommendations`, data)),
    routeLead: (leadId, data) => unwrapData(apiClient.post(`/consulting/ai-lead-qualification/leads/${leadId}/route`, data)),
    getReviewQueue: () => unwrapList(apiClient.get('/consulting/ai-lead-qualification/review-queue')),
    recordReviewDecision: (leadId, data) => unwrapData(apiClient.post(`/consulting/ai-lead-qualification/leads/${leadId}/review-decisions`, data)),
    getScoringRules: () => unwrapList(apiClient.get('/consulting/ai-lead-qualification/scoring-rules')),
    getReportsQualification: () => unwrapData(apiClient.get('/consulting/ai-lead-qualification/reports/qualification'))
  },

  // ==========================================
  // 6. CONSULTING CUSTOMER AI SUPPORT APIS
  // Base: /consulting/ai-support
  // ==========================================
  aiSupport: {
    getDashboard: () => unwrapData(apiClient.get('/consulting/ai-support/dashboard')),
    getMetrics: () => unwrapData(apiClient.get('/consulting/ai-support/metrics')),
    getConversations: () => unwrapList(apiClient.get('/consulting/ai-support/conversations')),
    startConversation: (data) => unwrapData(apiClient.post('/consulting/ai-support/conversations', data)),
    getConversationById: (id) => unwrapData(apiClient.get(`/consulting/ai-support/conversations/${id}`)),
    submitMessage: (conversationId, data) => unwrapData(apiClient.post(`/consulting/ai-support/conversations/${conversationId}/messages`, data)),
    getMessages: (conversationId) => unwrapList(apiClient.get(`/consulting/ai-support/conversations/${conversationId}/messages`)),
    handoffConversation: (conversationId, data) => unwrapData(apiClient.post(`/consulting/ai-support/conversations/${conversationId}/handoff`, data)),
    getTickets: () => unwrapList(apiClient.get('/consulting/ai-support/tickets')),
    createTicket: (data) => unwrapData(apiClient.post('/consulting/ai-support/tickets', data)),
    getTicketById: (id) => unwrapData(apiClient.get(`/consulting/ai-support/tickets/${id}`)),
    classifyTicket: (id, data) => unwrapData(apiClient.post(`/consulting/ai-support/tickets/${id}/classify`, data)),
    requestInformation: (id, data) => unwrapData(apiClient.post(`/consulting/ai-support/tickets/${id}/request-information`, data)),
    escalateTicket: (id, data) => unwrapData(apiClient.post(`/consulting/ai-support/tickets/${id}/escalate`, data)),
    searchKnowledge: (data) => unwrapData(apiClient.post('/consulting/ai-support/knowledge/search', data)),
    generateAnswerAi: (data) => unwrapData(apiClient.post('/consulting/ai-support/ai/answer', data)),
    recordFeedback: (data) => unwrapData(apiClient.post('/consulting/ai-support/feedback', data)),
    getHandoffs: () => unwrapList(apiClient.get('/consulting/ai-support/handoffs'))
  },

  // ==========================================
  // 7. CONSULTING CUSTOMER AI FOLLOW-UP APIS
  // Base: /consulting/ai-follow-up
  // ==========================================
  aiFollowUp: {
    getDashboard: () => unwrapData(apiClient.get('/consulting/ai-follow-up/dashboard')),
    getMetrics: () => unwrapData(apiClient.get('/consulting/ai-follow-up/metrics')),
    getTasks: () => unwrapList(apiClient.get('/consulting/ai-follow-up/tasks')),
    createTask: (data) => unwrapData(apiClient.post('/consulting/ai-follow-up/tasks', data)),
    getTaskById: (id) => unwrapData(apiClient.get(`/consulting/ai-follow-up/tasks/${id}`)),
    cancelTask: (id, reason) => unwrapData(apiClient.post(`/consulting/ai-follow-up/tasks/${id}/cancel`, { reason })),
    createProposalFollowUp: (proposalId, data) => unwrapData(apiClient.post(`/consulting/ai-follow-up/proposals/${proposalId}/follow-ups`, data)),
    checkEligibilityAi: (data) => unwrapData(apiClient.post('/consulting/ai-follow-up/ai/check-eligibility', data)),
    draftMessageAi: (data) => unwrapData(apiClient.post('/consulting/ai-follow-up/ai/draft-message', data)),
    getApprovals: () => unwrapList(apiClient.get('/consulting/ai-follow-up/approvals')),
    approveFollowUp: (approvalId, data) => unwrapData(apiClient.post(`/consulting/ai-follow-up/approvals/${approvalId}/approve`, data)),
    rejectFollowUp: (approvalId, data) => unwrapData(apiClient.post(`/consulting/ai-follow-up/approvals/${approvalId}/reject`, data)),
    recordOptOut: (contactId, data) => unwrapData(apiClient.post(`/consulting/ai-follow-up/contacts/${contactId}/opt-outs`, data)),
    getCommunicationStatus: (contactId, channel) => unwrapData(apiClient.get(`/consulting/ai-follow-up/contacts/${contactId}/communication-status`, { channel })),
    getMessageStatus: (messageId) => unwrapData(apiClient.get(`/consulting/ai-follow-up/messages/${messageId}`))
  }
};

