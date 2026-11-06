import { apiClient } from './apiClient';

export const realEstateService = {
  // ==========================================
  // ROLE 1: SALES MANAGER (26 APIs)
  // ==========================================
  getSalesManagerDashboard: (period = 'THIS_MONTH') =>
    apiClient.get(`/real-estate/sales-manager/dashboard?period=${period}`),
  
  getProperties: (params = {}) =>
    apiClient.get('/real-estate/properties', params),
  
  createProperty: (data) =>
    apiClient.post('/real-estate/properties', data),
  
  getProperty: (propertyId) =>
    apiClient.get(`/real-estate/properties/${propertyId}`),
  
  updateProperty: (propertyId, data) =>
    apiClient.patch(`/real-estate/properties/${propertyId}`, data),
  
  getLeads: (params = {}) =>
    apiClient.get('/real-estate/leads', params),
  
  createLead: (data) =>
    apiClient.post('/real-estate/leads', data),
  
  getLead: (leadId) =>
    apiClient.get(`/real-estate/leads/${leadId}`),
  
  updateLead: (leadId, data) =>
    apiClient.patch(`/real-estate/leads/${leadId}`, data),
  
  assignLead: (leadId, data) =>
    apiClient.post(`/real-estate/leads/${leadId}/assign`, data),
  
  getSalesPipeline: (params = {}) =>
    apiClient.get('/real-estate/sales-pipeline', params),
  
  updateLeadStage: (leadId, data) =>
    apiClient.patch(`/real-estate/leads/${leadId}/stage`, data),
  
  getTeam: () =>
    apiClient.get('/real-estate/team'),
  
  getTeamPerformance: (period = 'THIS_MONTH') =>
    apiClient.get(`/real-estate/team/performance?period=${period}`),
  
  recordLeadActivity: (leadId, data) =>
    apiClient.post(`/real-estate/leads/${leadId}/activities`, data),
  
  getLeadActivities: (leadId) =>
    apiClient.get(`/real-estate/leads/${leadId}/activities`),
  
  scheduleSiteVisit: (data) =>
    apiClient.post('/real-estate/site-visits', data),
  
  getSiteVisits: (params = {}) =>
    apiClient.get('/real-estate/site-visits', params),
  
  createQuotation: (data) =>
    apiClient.post('/real-estate/quotations', data),
  
  getQuotation: (quotationId) =>
    apiClient.get(`/real-estate/quotations/${quotationId}`),
  
  createBooking: (data) =>
    apiClient.post('/real-estate/bookings', data),
  
  getBookings: (params = {}) =>
    apiClient.get('/real-estate/bookings', params),
  
  getSalesReports: (from, to) =>
    apiClient.get(`/real-estate/reports/sales?from=${from || '2026-10-01'}&to=${to || '2026-10-31'}`),
  
  getAutomationRules: () =>
    apiClient.get('/real-estate/automation/rules'),
  
  createAutomationRule: (data) =>
    apiClient.post('/real-estate/automation/rules', data),
  
  updateAutomationRule: (ruleId, data) =>
    apiClient.patch(`/real-estate/automation/rules/${ruleId}`, data),

  // ==========================================
  // ROLE 2: PROPERTY SALES EXECUTIVE (20 APIs)
  // ==========================================
  getExecutiveDashboard: (period = 'THIS_MONTH') =>
    apiClient.get(`/real-estate/property-sales/dashboard?period=${period}`),
  
  getMyLeads: (params = {}) =>
    apiClient.get('/real-estate/my-leads', params),
  
  getMyLead: (leadId) =>
    apiClient.get(`/real-estate/my-leads/${leadId}`),
  
  updateMyLead: (leadId, data) =>
    apiClient.patch(`/real-estate/my-leads/${leadId}`, data),
  
  searchProperties: (params = {}) =>
    apiClient.get('/real-estate/properties/search', params),
  
  recordMyLeadActivity: (leadId, data) =>
    apiClient.post(`/real-estate/my-leads/${leadId}/activities`, data),
  
  getMyLeadActivities: (leadId) =>
    apiClient.get(`/real-estate/my-leads/${leadId}/activities`),
  
  updateMyLeadStage: (leadId, data) =>
    apiClient.patch(`/real-estate/my-leads/${leadId}/stage`, data),
  
  getMySiteVisits: (params = {}) =>
    apiClient.get('/real-estate/my-site-visits', params),
  
  getMyQuotations: () =>
    apiClient.get('/real-estate/my-quotations'),
  
  submitBookingRequest: (data) =>
    apiClient.post('/real-estate/booking-requests', data),
  
  getMyFollowUps: () =>
    apiClient.get('/real-estate/my-follow-ups'),
  
  updateFollowUp: (taskId, data) =>
    apiClient.patch(`/real-estate/follow-ups/${taskId}`, data),
  
  completeFollowUp: (taskId) =>
    apiClient.post(`/real-estate/follow-ups/${taskId}/complete`, {}),
  
  getAiPropertyRecommendations: (data) =>
    apiClient.post('/real-estate/ai/property-recommendations', data),
  
  getAiLeadSummary: (data) =>
    apiClient.post('/real-estate/ai/lead-summary', data),
  
  getNotifications: () =>
    apiClient.get('/real-estate/notifications'),

  // ==========================================
  // ROLE 3: CUSTOMER RELATIONSHIP MANAGER (23 APIs)
  // ==========================================
  getCustomerRelationsDashboard: (period = 'THIS_MONTH') =>
    apiClient.get(`/real-estate/customer-relations/dashboard?period=${period}`),
  
  getCustomers: (params = {}) =>
    apiClient.get('/real-estate/customers', params),
  
  getCustomer: (customerId) =>
    apiClient.get(`/real-estate/customers/${customerId}`),
  
  updateCustomer: (customerId, data) =>
    apiClient.patch(`/real-estate/customers/${customerId}`, data),
  
  getCustomerTimeline: (customerId, params = {}) =>
    apiClient.get(`/real-estate/customers/${customerId}/timeline`, params),
  
  recordCustomerCommunication: (customerId, data) =>
    apiClient.post(`/real-estate/customers/${customerId}/communications`, data),
  
  getCustomerCommunications: (customerId) =>
    apiClient.get(`/real-estate/customers/${customerId}/communications`),
  
  createCustomerRequest: (data) =>
    apiClient.post('/real-estate/customer-requests', data),
  
  getCustomerRequests: (params = {}) =>
    apiClient.get('/real-estate/customer-requests', params),
  
  updateCustomerRequest: (requestId, data) =>
    apiClient.patch(`/real-estate/customer-requests/${requestId}`, data),
  
  registerComplaint: (data) =>
    apiClient.post('/real-estate/complaints', data),
  
  getComplaints: (params = {}) =>
    apiClient.get('/real-estate/complaints', params),
  
  getComplaint: (complaintId) =>
    apiClient.get(`/real-estate/complaints/${complaintId}`),
  
  updateComplaint: (complaintId, data) =>
    apiClient.patch(`/real-estate/complaints/${complaintId}`, data),
  
  escalateComplaint: (complaintId, data) =>
    apiClient.post(`/real-estate/complaints/${complaintId}/escalate`, data),
  
  submitCustomerFeedback: (data) =>
    apiClient.post('/real-estate/customer-feedback', data),
  
  getCustomerFeedback: (params = {}) =>
    apiClient.get('/real-estate/customer-feedback', params),
  
  getBookingCustomerUpdates: (bookingId) =>
    apiClient.get(`/real-estate/bookings/${bookingId}/customer-updates`),
  
  createCustomerFollowUp: (customerId, data) =>
    apiClient.post(`/real-estate/customers/${customerId}/follow-ups`, data),
  
  getCustomerFollowUps: () =>
    apiClient.get('/real-estate/customer-follow-ups'),
  
  generateAiCustomerSummary: (data) =>
    apiClient.post('/real-estate/ai/customer-summary', data),
  
  generateAiReplyDraft: (data) =>
    apiClient.post('/real-estate/ai/reply-drafts', data),
  
  getCustomerRelationsReports: () =>
    apiClient.get('/real-estate/customer-relations/reports'),

  // ==========================================
  // ROLE 4: SITE VISIT COORDINATOR (20 APIs)
  // ==========================================
  getCoordinatorDashboard: (period = 'TODAY') =>
    apiClient.get(`/real-estate/site-visit-coordinator/dashboard?period=${period}`),
  
  getSiteVisit: (visitId) =>
    apiClient.get(`/real-estate/site-visits/${visitId}`),
  
  updateSiteVisit: (visitId, data) =>
    apiClient.patch(`/real-estate/site-visits/${visitId}`, data),
  
  rescheduleSiteVisit: (visitId, data) =>
    apiClient.post(`/real-estate/site-visits/${visitId}/reschedule`, data),
  
  cancelSiteVisit: (visitId, data) =>
    apiClient.post(`/real-estate/site-visits/${visitId}/cancel`, data),
  
  checkAvailability: (params) =>
    apiClient.get('/real-estate/site-visits/availability', params),
  
  assignCoordinator: (visitId, data) =>
    apiClient.post(`/real-estate/site-visits/${visitId}/assign`, data),
  
  confirmSiteVisit: (visitId, data) =>
    apiClient.post(`/real-estate/site-visits/${visitId}/confirm`, data),
  
  checkInSiteVisit: (visitId, data) =>
    apiClient.post(`/real-estate/site-visits/${visitId}/check-in`, data),
  
  checkOutSiteVisit: (visitId, data) =>
    apiClient.post(`/real-estate/site-visits/${visitId}/check-out`, data),
  
  recordVisitOutcome: (visitId, data) =>
    apiClient.post(`/real-estate/site-visits/${visitId}/outcome`, data),
  
  getVisitChecklist: (visitId) =>
    apiClient.get(`/real-estate/site-visits/${visitId}/checklist`),
  
  saveVisitChecklist: (visitId, data) =>
    apiClient.put(`/real-estate/site-visits/${visitId}/checklist`, data),
  
  getVisitFeedback: (visitId) =>
    apiClient.get(`/real-estate/site-visits/${visitId}/feedback`),
  
  requestVisitFeedback: (visitId, data) =>
    apiClient.post(`/real-estate/site-visits/${visitId}/feedback-request`, data),
  
  getVisitCalendar: (params = {}) =>
    apiClient.get('/real-estate/site-visits/calendar', params),
  
  getVisitReports: () =>
    apiClient.get('/real-estate/site-visits/reports'),

  // ==========================================
  // REAL ESTATE ADMIN CATALOGUE (Legacy compat)
  // ==========================================
  getProjects: () => apiClient.get('/admin/real-estate/projects'),
  createProject: (data) => apiClient.post('/admin/real-estate/projects', data),
  getProject: (projectId) => apiClient.get(`/admin/real-estate/projects/${projectId}`),
  updateAvailability: (propertyId, availability) =>
    apiClient.patch(`/admin/real-estate/properties/${propertyId}/availability`, { availability }),
  getPropertyTypes: () => apiClient.get('/admin/real-estate/property-types'),
  createPropertyType: (data) => apiClient.post('/admin/real-estate/property-types', data),
  getAmenities: () => apiClient.get('/admin/real-estate/amenities'),
  createAmenity: (data) => apiClient.post('/admin/real-estate/amenities', data),
  getLocations: () => apiClient.get('/admin/real-estate/locations'),
  createLocation: (data) => apiClient.post('/admin/real-estate/locations', data),
  getPricingRules: () => apiClient.get('/admin/real-estate/pricing-rules'),
  createPricingRule: (data) => apiClient.post('/admin/real-estate/pricing-rules', data),
  getOffers: () => apiClient.get('/admin/real-estate/offers'),
  createOffer: (data) => apiClient.post('/admin/real-estate/offers', data),
  getBookingSettings: () => apiClient.get('/admin/real-estate/booking-settings'),
  updateBookingSettings: (data) => apiClient.patch('/admin/real-estate/booking-settings', data),
  getApprovalRules: () => apiClient.get('/admin/real-estate/approval-rules'),
  createApprovalRule: (data) => apiClient.post('/admin/real-estate/approval-rules', data),
  getSiteVisitSlots: () => apiClient.get('/admin/real-estate/site-visit-slots'),
  createSiteVisitSlot: (data) => apiClient.post('/admin/real-estate/site-visit-slots', data),
  getCoordinatorAssignments: () => apiClient.get('/admin/real-estate/coordinator-assignments'),
  createCoordinatorAssignment: (data) => apiClient.post('/admin/real-estate/coordinator-assignments', data),

  // ==========================================
  // REAL ESTATE SUPPORT AGENT (20 APIs)
  // Base: /api/v1/real-estate/support
  // ==========================================
  getSupportDashboard: (period = 'TODAY') =>
    apiClient.get(`/real-estate/support/dashboard?period=${period}`),
  getSupportTickets: (params = {}) =>
    apiClient.get('/real-estate/support/tickets', params),
  createSupportTicket: (data) =>
    apiClient.post('/real-estate/support/tickets', data),
  getSupportTicket: (ticketId) =>
    apiClient.get(`/real-estate/support/tickets/${ticketId}`),
  updateSupportTicket: (ticketId, data) =>
    apiClient.patch(`/real-estate/support/tickets/${ticketId}`, data),
  assignSupportTicket: (ticketId, data) =>
    apiClient.post(`/real-estate/support/tickets/${ticketId}/assign`, data),
  addSupportTicketMessage: (ticketId, data) =>
    apiClient.post(`/real-estate/support/tickets/${ticketId}/messages`, data),
  getSupportTicketMessages: (ticketId) =>
    apiClient.get(`/real-estate/support/tickets/${ticketId}/messages`),
  resolveSupportTicket: (ticketId, data) =>
    apiClient.post(`/real-estate/support/tickets/${ticketId}/resolve`, data),
  reopenSupportTicket: (ticketId, data = {}) =>
    apiClient.post(`/real-estate/support/tickets/${ticketId}/reopen`, data),
  escalateSupportTicket: (ticketId, data) =>
    apiClient.post(`/real-estate/support/tickets/${ticketId}/escalate`, data),
  getCustomerTickets: (customerId) =>
    apiClient.get(`/real-estate/support/customers/${customerId}/tickets`),
  getCustomerTimeline: (customerId) =>
    apiClient.get(`/real-estate/support/customers/${customerId}/timeline`),
  searchKnowledgeBase: (query = '') =>
    apiClient.get(`/real-estate/support/knowledge/search?q=${encodeURIComponent(query)}`),
  createKnowledgeArticle: (data) =>
    apiClient.post('/real-estate/support/knowledge/articles', data),
  getComplaints: () =>
    apiClient.get('/real-estate/support/complaints'),
  createComplaint: (data) =>
    apiClient.post('/real-estate/support/complaints', data),
  updateComplaint: (complaintId, data) =>
    apiClient.patch(`/real-estate/support/complaints/${complaintId}`, data),
  generateAiReplyDraft: (ticketId, data) =>
    apiClient.post(`/real-estate/support/tickets/${ticketId}/ai/reply-draft`, data),
  getSupportReports: () =>
    apiClient.get('/real-estate/support/reports'),

  // ==========================================
  // REAL ESTATE AI PROPERTY SALES AGENT (19 APIs)
  // Base: /api/v1/real-estate/ai/property-sales
  // ==========================================
  getAiPropertySalesConfig: () =>
    apiClient.get('/real-estate/ai/property-sales/config'),
  updateAiPropertySalesConfig: (data) =>
    apiClient.patch('/real-estate/ai/property-sales/config', data),
  startAiPropertySalesSession: (data) =>
    apiClient.post('/real-estate/ai/property-sales/sessions', data),
  getAiPropertySalesSession: (sessionId) =>
    apiClient.get(`/real-estate/ai/property-sales/sessions/${sessionId}`),
  getAiPropertySalesSessions: () =>
    apiClient.get('/real-estate/ai/property-sales/sessions'),
  sendAiPropertySalesMessage: (sessionId, data) =>
    apiClient.post(`/real-estate/ai/property-sales/sessions/${sessionId}/messages`, data),
  qualifyBuyer: (sessionId, data) =>
    apiClient.post(`/real-estate/ai/property-sales/sessions/${sessionId}/qualify`, data),
  recommendProperties: (data) =>
    apiClient.post('/real-estate/ai/property-sales/property-recommendations', data),
  createLeadFromAiSession: (sessionId, data) =>
    apiClient.post(`/real-estate/ai/property-sales/sessions/${sessionId}/create-lead`, data),
  scheduleVisitFromAiSession: (sessionId, data) =>
    apiClient.post(`/real-estate/ai/property-sales/sessions/${sessionId}/schedule-visit`, data),
  createQuotationDraftFromAiSession: (sessionId, data) =>
    apiClient.post(`/real-estate/ai/property-sales/sessions/${sessionId}/create-quotation-draft`, data),
  handoffAiSession: (sessionId, data) =>
    apiClient.post(`/real-estate/ai/property-sales/sessions/${sessionId}/handoff`, data),
  closeAiSession: (sessionId) =>
    apiClient.post(`/real-estate/ai/property-sales/sessions/${sessionId}/close`),
  getAiSessionEvents: (sessionId) =>
    apiClient.get(`/real-estate/ai/property-sales/sessions/${sessionId}/events`),
  getAiKnowledgeSources: () =>
    apiClient.get('/real-estate/ai/property-sales/knowledge/sources'),
  addAiKnowledgeSource: (data) =>
    apiClient.post('/real-estate/ai/property-sales/knowledge/sources', data),
  syncAiKnowledgeSource: (sourceId) =>
    apiClient.post(`/real-estate/ai/property-sales/knowledge/sources/${sourceId}/sync`),
  getAiPropertySalesMetrics: (period = 'THIS_MONTH') =>
    apiClient.get(`/real-estate/ai/property-sales/metrics?period=${period}`),
  getAiPropertySalesAuditEvents: () =>
    apiClient.get('/real-estate/ai/property-sales/audit-events')
};
