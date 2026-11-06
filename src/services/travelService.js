import { apiClient } from './apiClient';

const unwrapData = async (promise) => {
  const res = await promise;
  if (!res.success) {
    throw new Error(res.error || res.message || 'API Request failed');
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

export const travelService = {
  // Legacy / Shared Travel APIs
  getDashboard: (from, to) => unwrapData(apiClient.get('/travel/dashboard', { from, to })),
  getSettings: () => unwrapData(apiClient.get('/travel/settings')),
  updateSettings: (data) => unwrapData(apiClient.put('/travel/settings', data)),
  getBusinessHours: () => unwrapData(apiClient.get('/travel/business-hours')),
  getDestinations: () => unwrapList(apiClient.get('/travel/destinations')),
  createDestination: (data) => unwrapData(apiClient.post('/travel/destinations', data)),
  getPackages: () => unwrapList(apiClient.get('/travel/packages')),
  createPackage: (data) => unwrapData(apiClient.post('/travel/packages', data)),
  getPackage: (id) => unwrapData(apiClient.get(`/travel/packages/${id}`)),
  updatePackageStatus: (id, status) => unwrapData(apiClient.patch(`/travel/packages/${id}/status`, { status })),
  getEnquiries: () => unwrapList(apiClient.get('/travel/enquiries')),
  createEnquiry: (data) => unwrapData(apiClient.post('/travel/enquiries', data)),
  getQuotations: () => unwrapList(apiClient.get('/travel/quotations')),
  createQuotation: (data) => unwrapData(apiClient.post('/travel/quotations', data)),
  sendQuotation: (id) => unwrapData(apiClient.post(`/travel/quotations/${id}/send`)),
  acceptQuotation: (id) => unwrapData(apiClient.post(`/travel/quotations/${id}/accept`)),
  getBookings: () => unwrapList(apiClient.get('/travel/bookings')),
  createBooking: (data) => unwrapData(apiClient.post('/travel/bookings', data)),
  confirmBooking: (id) => unwrapData(apiClient.post(`/travel/bookings/${id}/confirm`)),
  cancelBooking: (id) => unwrapData(apiClient.post(`/travel/bookings/${id}/cancel`)),
  getSuppliers: () => unwrapList(apiClient.get('/travel/suppliers')),
  createSupplier: (data) => unwrapData(apiClient.post('/travel/suppliers', data)),
  getRevenueReport: () => unwrapData(apiClient.get('/reports/travel/revenue')),

  // ==========================================
  // 1. SALES MANAGER WORKSPACE (/api/v1/travel/sales-manager)
  // ==========================================
  salesManager: {
    getDashboard: () => unwrapData(apiClient.get('/travel/sales-manager/dashboard')),
    getPipeline: () => unwrapData(apiClient.get('/travel/sales-manager/dashboard/pipeline')),
    getConversion: () => unwrapData(apiClient.get('/travel/sales-manager/dashboard/conversion')),
    getRevenue: () => unwrapData(apiClient.get('/travel/sales-manager/dashboard/revenue')),
    getActivity: () => unwrapData(apiClient.get('/travel/sales-manager/dashboard/activity')),
    getLeads: (params) => unwrapData(apiClient.get('/travel/sales-manager/leads', params)),
    createLead: (data) => unwrapData(apiClient.post('/travel/sales-manager/leads', data)),
    getLead: (leadId) => unwrapData(apiClient.get(`/travel/sales-manager/leads/${leadId}`)),
    updateLead: (leadId, data) => unwrapData(apiClient.patch(`/travel/sales-manager/leads/${leadId}`, data)),
    assignLead: (leadId, data) => unwrapData(apiClient.post(`/travel/sales-manager/leads/${leadId}/assign`, data)),
    reassignLead: (leadId, data) => unwrapData(apiClient.post(`/travel/sales-manager/leads/${leadId}/reassign`, data)),
    qualifyLead: (leadId, data) => unwrapData(apiClient.post(`/travel/sales-manager/leads/${leadId}/qualify`, data)),
    disqualifyLead: (leadId, data) => unwrapData(apiClient.post(`/travel/sales-manager/leads/${leadId}/disqualify`, data)),
    updateLeadStage: (leadId, data) => unwrapData(apiClient.patch(`/travel/sales-manager/leads/${leadId}/stage`, data)),
    getConsultants: () => unwrapList(apiClient.get('/travel/sales-manager/consultants')),
    getConsultantPerformance: (employeeId, params) => unwrapData(apiClient.get(`/travel/sales-manager/consultants/${employeeId}/performance`, params)),
    getTeams: () => unwrapList(apiClient.get('/travel/sales-manager/teams')),
    createTeam: (data) => unwrapData(apiClient.post('/travel/sales-manager/teams', data)),
    getTargets: () => unwrapList(apiClient.get('/travel/sales-manager/targets')),
    createTarget: (data) => unwrapData(apiClient.post('/travel/sales-manager/targets', data)),
    getQuotations: () => unwrapList(apiClient.get('/travel/sales-manager/quotations')),
    approveQuotation: (quoteId, data) => unwrapData(apiClient.post(`/travel/sales-manager/quotations/${quoteId}/approve`, data)),
    rejectQuotation: (quoteId, data) => unwrapData(apiClient.post(`/travel/sales-manager/quotations/${quoteId}/reject`, data)),
    getDestinationPerformance: () => unwrapData(apiClient.get('/travel/sales-manager/reports/destination-performance')),
    getPackagePerformance: () => unwrapData(apiClient.get('/travel/sales-manager/reports/package-performance')),
    getOverdueFollowUps: () => unwrapList(apiClient.get('/travel/sales-manager/follow-ups/overdue'))
  },

  // ==========================================
  // 2. TRAVEL CONSULTANT WORKSPACE (/api/v1/travel/consultant)
  // ==========================================
  consultant: {
    getDashboard: () => unwrapData(apiClient.get('/travel/consultant/dashboard')),
    getAssignedLeads: (params) => unwrapData(apiClient.get('/travel/consultant/leads', params)),
    getLead: (leadId) => unwrapData(apiClient.get(`/travel/consultant/leads/${leadId}`)),
    updateLead: (leadId, data) => unwrapData(apiClient.patch(`/travel/consultant/leads/${leadId}`, data)),
    recordRequirements: (leadId, data) => unwrapData(apiClient.post(`/travel/consultant/leads/${leadId}/requirements`, data)),
    getRequirements: (leadId) => unwrapData(apiClient.get(`/travel/consultant/leads/${leadId}/requirements`)),
    searchTravelProducts: (query) => unwrapData(apiClient.post('/travel/consultant/travel-search', query)),
    getDestinations: () => unwrapList(apiClient.get('/travel/consultant/destinations')),
    getPackages: () => unwrapList(apiClient.get('/travel/consultant/packages')),
    createItinerary: (data) => unwrapData(apiClient.post('/travel/consultant/itineraries', data)),
    getItineraries: () => unwrapList(apiClient.get('/travel/consultant/itineraries')),
    getItinerary: (itineraryId) => unwrapData(apiClient.get(`/travel/consultant/itineraries/${itineraryId}`)),
    addItineraryItem: (itineraryId, item) => unwrapData(apiClient.post(`/travel/consultant/itineraries/${itineraryId}/items`, item)),
    validateItinerary: (itineraryId, body) => unwrapData(apiClient.post(`/travel/consultant/itineraries/${itineraryId}/validate`, body)),
    createQuotation: (data) => unwrapData(apiClient.post('/travel/consultant/quotations', data)),
    getQuotations: () => unwrapList(apiClient.get('/travel/consultant/quotations')),
    recalculateQuotation: (quoteId, body) => unwrapData(apiClient.post(`/travel/consultant/quotations/${quoteId}/recalculate`, body)),
    sendQuotation: (quoteId, body) => unwrapData(apiClient.post(`/travel/consultant/quotations/${quoteId}/send`, body)),
    createQuotationRevision: (quoteId, body) => unwrapData(apiClient.post(`/travel/consultant/quotations/${quoteId}/revisions`, body)),
    handoffToBooking: (leadId, data) => unwrapData(apiClient.post(`/travel/consultant/leads/${leadId}/handoff-to-booking`, data)),
    getFollowUps: () => unwrapList(apiClient.get('/travel/consultant/follow-ups')),
    completeFollowUp: (taskId) => unwrapData(apiClient.post(`/travel/consultant/follow-ups/${taskId}/complete`)),
    sendMessage: (conversationId, data) => unwrapData(apiClient.post(`/travel/consultant/conversations/${conversationId}/messages`, data))
  },

  // ==========================================
  // 3. CUSTOMER SUPPORT WORKSPACE (/api/v1/travel/customer-support)
  // ==========================================
  customerSupport: {
    getDashboard: () => unwrapData(apiClient.get('/travel/customer-support/dashboard')),
    getConversations: () => unwrapList(apiClient.get('/travel/customer-support/conversations')),
    getMessages: (conversationId) => unwrapList(apiClient.get(`/travel/customer-support/conversations/${conversationId}/messages`)),
    sendMessage: (conversationId, data) => unwrapData(apiClient.post(`/travel/customer-support/conversations/${conversationId}/messages`, data)),
    verifyGuest: (sessionId, data) => unwrapData(apiClient.post(`/travel/customer-support/guest-verification/sessions/${sessionId}/verify`, data)),
    lookupGuestContext: (data) => unwrapData(apiClient.post('/travel/customer-support/guest-context/lookup', data)),
    getBookings: (params) => unwrapList(apiClient.get('/travel/customer-support/bookings', params)),
    getBooking: (bookingId) => unwrapData(apiClient.get(`/travel/customer-support/bookings/${bookingId}`)),
    getBookingDocuments: (bookingId) => unwrapList(apiClient.get(`/travel/customer-support/bookings/${bookingId}/documents`)),
    getTickets: () => unwrapList(apiClient.get('/travel/customer-support/tickets')),
    createTicket: (data) => unwrapData(apiClient.post('/travel/customer-support/tickets', data)),
    getTicket: (ticketId) => unwrapData(apiClient.get(`/travel/customer-support/tickets/${ticketId}`)),
    classifyTicket: (ticketId, body) => unwrapData(apiClient.post(`/travel/customer-support/tickets/${ticketId}/classify`, body)),
    createReplyDraft: (ticketId, body) => unwrapData(apiClient.post(`/travel/customer-support/tickets/${ticketId}/reply-drafts`, body)),
    sendReplyDraft: (ticketId, draftId) => unwrapData(apiClient.post(`/travel/customer-support/tickets/${ticketId}/reply-drafts/${draftId}/send`)),
    escalateTicket: (ticketId, data) => unwrapData(apiClient.post(`/travel/customer-support/tickets/${ticketId}/escalate`, data)),
    resolveTicket: (ticketId, data) => unwrapData(apiClient.post(`/travel/customer-support/tickets/${ticketId}/resolve`, data)),
    getChangeRequests: () => unwrapList(apiClient.get('/travel/customer-support/change-requests')),
    createChangeRequest: (data) => unwrapData(apiClient.post('/travel/customer-support/change-requests', data)),
    getCancellationRequests: () => unwrapList(apiClient.get('/travel/customer-support/cancellation-requests')),
    createCancellationRequest: (data) => unwrapData(apiClient.post('/travel/customer-support/cancellation-requests', data)),
    getRefundStatus: (refundReference) => unwrapData(apiClient.get(`/travel/customer-support/refunds/${refundReference}/status`)),
    searchKnowledge: (query) => unwrapData(apiClient.post('/travel/customer-support/knowledge/search', { query }))
  },

  // ==========================================
  // 4. BOOKING EXECUTIVE WORKSPACE (/api/v1/travel/booking-executive)
  // ==========================================
  bookingExecutive: {
    getDashboard: () => unwrapData(apiClient.get('/travel/booking-executive/dashboard')),
    getHandoffs: (params) => unwrapData(apiClient.get('/travel/booking-executive/handoffs', params)),
    acceptHandoff: (handoffId, body) => unwrapData(apiClient.post(`/travel/booking-executive/handoffs/${handoffId}/accept`, body)),
    returnHandoff: (handoffId, body) => unwrapData(apiClient.post(`/travel/booking-executive/handoffs/${handoffId}/return-to-consultant`, body)),
    getBookings: () => unwrapList(apiClient.get('/travel/booking-executive/bookings')),
    createBooking: (data) => unwrapData(apiClient.post('/travel/booking-executive/bookings', data)),
    getBooking: (bookingId) => unwrapData(apiClient.get(`/travel/booking-executive/bookings/${bookingId}`)),
    validateBooking: (bookingId, body) => unwrapData(apiClient.post(`/travel/booking-executive/bookings/${bookingId}/validate`, body)),
    confirmBooking: (bookingId) => unwrapData(apiClient.post(`/travel/booking-executive/bookings/${bookingId}/confirm`)),
    searchSupplierInventory: (query) => unwrapData(apiClient.post('/travel/booking-executive/supplier-searches', query)),
    submitSupplierBooking: (data) => unwrapData(apiClient.post('/travel/booking-executive/supplier-bookings', data)),
    getSupplierBookingStatus: (supplierBookingId) => unwrapData(apiClient.get(`/travel/booking-executive/supplier-bookings/${supplierBookingId}/status`)),
    reconcileSupplierBooking: (supplierBookingId) => unwrapData(apiClient.post(`/travel/booking-executive/supplier-bookings/${supplierBookingId}/reconcile`)),
    createCheckoutSession: (data) => unwrapData(apiClient.post('/travel/booking-executive/payments/checkout-sessions', data)),
    getPaymentStatus: (paymentReference) => unwrapData(apiClient.get(`/travel/booking-executive/payments/${paymentReference}/status`)),
    getInvoices: () => unwrapList(apiClient.get('/travel/booking-executive/invoices')),
    issueInvoice: (invoiceId) => unwrapData(apiClient.post(`/travel/booking-executive/invoices/${invoiceId}/issue`)),
    getVouchers: () => unwrapList(apiClient.get('/travel/booking-executive/vouchers')),
    generateVoucher: (bookingId, data) => unwrapData(apiClient.post(`/travel/booking-executive/bookings/${bookingId}/vouchers/generate`, data)),
    sendVoucher: (voucherId, data) => unwrapData(apiClient.post(`/travel/booking-executive/vouchers/${voucherId}/send`, data)),
    getCancellations: () => unwrapList(apiClient.get('/travel/booking-executive/cancellations')),
    processCancellation: (cancellationId, data) => unwrapData(apiClient.post(`/travel/booking-executive/cancellations/${cancellationId}/process`, data)),
    getExceptions: () => unwrapList(apiClient.get('/travel/booking-executive/exceptions')),
    assignException: (exceptionId, data) => unwrapData(apiClient.post(`/travel/booking-executive/exceptions/${exceptionId}/assign`, data)),
    resolveException: (exceptionId) => unwrapData(apiClient.post(`/travel/booking-executive/exceptions/${exceptionId}/resolve`))
  },

  // ==========================================
  // 5. AI TRAVEL SALES AGENT (/api/v1/travel/ai-sales-agent)
  // ==========================================
  aiSalesAgent: {
    getDashboard: () => unwrapData(apiClient.get('/travel/ai-sales-agent/dashboard')),
    getSettings: () => unwrapData(apiClient.get('/travel/ai-sales-agent/settings')),
    updateSettings: (data) => unwrapData(apiClient.patch('/travel/ai-sales-agent/settings', data)),
    getHealth: () => unwrapData(apiClient.get('/travel/ai-sales-agent/health')),
    getActivityLogs: () => unwrapList(apiClient.get('/travel/ai-sales-agent/activity-logs')),
    getMetrics: () => unwrapData(apiClient.get('/travel/ai-sales-agent/metrics')),
    getLeads: (params) => unwrapList(apiClient.get('/travel/ai-sales-agent/leads', params)),
    createLead: (data) => unwrapData(apiClient.post('/travel/ai-sales-agent/leads', data)),
    getLead: (leadId) => unwrapData(apiClient.get(`/travel/ai-sales-agent/leads/${leadId}`)),
    updateLead: (leadId, data) => unwrapData(apiClient.patch(`/travel/ai-sales-agent/leads/${leadId}`, data)),
    qualifyLead: (leadId, data) => unwrapData(apiClient.post(`/travel/ai-sales-agent/leads/${leadId}/qualify`, data)),
    classifyLead: (leadId, data) => unwrapData(apiClient.post(`/travel/ai-sales-agent/leads/${leadId}/classify`, data)),
    extractRequirements: (leadId, data) => unwrapData(apiClient.post(`/travel/ai-sales-agent/leads/${leadId}/extract-requirements`, data)),
    getRequirements: (leadId) => unwrapData(apiClient.get(`/travel/ai-sales-agent/leads/${leadId}/requirements`)),
    updateRequirements: (leadId, data) => unwrapData(apiClient.patch(`/travel/ai-sales-agent/leads/${leadId}/requirements`, data)),
    validateRequirements: (leadId, data) => unwrapData(apiClient.post(`/travel/ai-sales-agent/leads/${leadId}/requirements/validate`, data)),
    generateQuestions: (leadId) => unwrapList(apiClient.post(`/travel/ai-sales-agent/leads/${leadId}/requirements/questions`)),
    searchTravel: (data) => unwrapData(apiClient.post('/travel/ai-sales-agent/travel-search', data)),
    getSearchResults: (searchId) => unwrapData(apiClient.get(`/travel/ai-sales-agent/travel-search/${searchId}`)),
    generateRecommendations: (data) => unwrapData(apiClient.post('/travel/ai-sales-agent/recommendations', data)),
    getRecommendation: (recId) => unwrapData(apiClient.get(`/travel/ai-sales-agent/recommendations/${recId}`)),
    createItinerary: (data) => unwrapData(apiClient.post('/travel/ai-sales-agent/itineraries', data)),
    getItineraries: (params) => unwrapList(apiClient.get('/travel/ai-sales-agent/itineraries', params)),
    getItinerary: (itineraryId) => unwrapData(apiClient.get(`/travel/ai-sales-agent/itineraries/${itineraryId}`)),
    validateItinerary: (itineraryId, data) => unwrapData(apiClient.post(`/travel/ai-sales-agent/itineraries/${itineraryId}/validate`, data)),
    explainItinerary: (itineraryId) => unwrapData(apiClient.post(`/travel/ai-sales-agent/itineraries/${itineraryId}/explain`)),
    createQuotation: (data) => unwrapData(apiClient.post('/travel/ai-sales-agent/quotations', data)),
    getQuotations: (params) => unwrapList(apiClient.get('/travel/ai-sales-agent/quotations', params)),
    recalculateQuotation: (quoteId, data) => unwrapData(apiClient.post(`/travel/ai-sales-agent/quotations/${quoteId}/recalculate`, data)),
    requestQuotationApproval: (quoteId, data) => unwrapData(apiClient.post(`/travel/ai-sales-agent/quotations/${quoteId}/request-approval`, data)),
    sendQuotation: (quoteId, data) => unwrapData(apiClient.post(`/travel/ai-sales-agent/quotations/${quoteId}/send`, data)),
    recordCustomerResponse: (quoteId, data) => unwrapData(apiClient.post(`/travel/ai-sales-agent/quotations/${quoteId}/record-customer-response`, data)),
    createBookingHandoff: (leadId, data) => unwrapData(apiClient.post(`/travel/ai-sales-agent/leads/${leadId}/booking-handoffs`, data)),
    getBookingHandoff: (handoffId) => unwrapData(apiClient.get(`/travel/ai-sales-agent/booking-handoffs/${handoffId}`)),
    handoffToHuman: (leadId, data) => unwrapData(apiClient.post(`/travel/ai-sales-agent/leads/${leadId}/handoff-to-human`, data))
  },

  // ==========================================
  // 6. AI FOLLOW-UP AGENT (/api/v1/travel/ai-follow-up-agent)
  // ==========================================
  aiFollowUpAgent: {
    getDashboard: () => unwrapData(apiClient.get('/travel/ai-follow-up-agent/dashboard')),
    getSettings: () => unwrapData(apiClient.get('/travel/ai-follow-up-agent/settings')),
    updateSettings: (data) => unwrapData(apiClient.patch('/travel/ai-follow-up-agent/settings', data)),
    getHealth: () => unwrapData(apiClient.get('/travel/ai-follow-up-agent/health')),
    getMetrics: () => unwrapData(apiClient.get('/travel/ai-follow-up-agent/metrics')),
    getActivityLogs: () => unwrapList(apiClient.get('/travel/ai-follow-up-agent/activity-logs')),
    getPlans: () => unwrapList(apiClient.get('/travel/ai-follow-up-agent/plans')),
    createPlan: (data) => unwrapData(apiClient.post('/travel/ai-follow-up-agent/plans', data)),
    getPlan: (planId) => unwrapData(apiClient.get(`/travel/ai-follow-up-agent/plans/${planId}`)),
    activatePlan: (planId) => unwrapData(apiClient.post(`/travel/ai-follow-up-agent/plans/${planId}/activate`)),
    pausePlan: (planId) => unwrapData(apiClient.post(`/travel/ai-follow-up-agent/plans/${planId}/pause`)),
    previewPlan: (planId, data) => unwrapData(apiClient.post(`/travel/ai-follow-up-agent/plans/${planId}/preview`, data)),
    getTasks: (params) => unwrapList(apiClient.get('/travel/ai-follow-up-agent/tasks', params)),
    createTask: (data) => unwrapData(apiClient.post('/travel/ai-follow-up-agent/tasks', data)),
    completeTask: (taskId) => unwrapData(apiClient.post(`/travel/ai-follow-up-agent/tasks/${taskId}/complete`)),
    getQueue: () => unwrapList(apiClient.get('/travel/ai-follow-up-agent/queue')),
    getOverdue: () => unwrapList(apiClient.get('/travel/ai-follow-up-agent/overdue')),
    draftMessage: (taskId, data) => unwrapData(apiClient.post(`/travel/ai-follow-up-agent/tasks/${taskId}/draft-message`, data)),
    getDrafts: (taskId) => unwrapList(apiClient.get(`/travel/ai-follow-up-agent/tasks/${taskId}/message-drafts`)),
    approveMessage: (taskId, data) => unwrapData(apiClient.post(`/travel/ai-follow-up-agent/tasks/${taskId}/approve-message`, data)),
    sendMessage: (taskId, data) => unwrapData(apiClient.post(`/travel/ai-follow-up-agent/tasks/${taskId}/send`, data)),
    classifyResponse: (data) => unwrapData(apiClient.post('/travel/ai-follow-up-agent/responses/classify', data)),
    getCustomerPreferences: (customerId) => unwrapData(apiClient.get(`/travel/ai-follow-up-agent/customers/${customerId}/preferences`)),
    optOutCustomer: (customerId, data) => unwrapData(apiClient.post(`/travel/ai-follow-up-agent/customers/${customerId}/opt-out`, data)),
    optInCustomer: (customerId, data) => unwrapData(apiClient.post(`/travel/ai-follow-up-agent/customers/${customerId}/opt-in`, data)),
    getSuppressionStatus: (customerId) => unwrapData(apiClient.get(`/travel/ai-follow-up-agent/customers/${customerId}/suppression-status`)),
    escalateTask: (taskId, data) => unwrapData(apiClient.post(`/travel/ai-follow-up-agent/tasks/${taskId}/escalate`, data)),
    getEscalations: () => unwrapList(apiClient.get('/travel/ai-follow-up-agent/escalations'))
  },

  // ==========================================
  // 7. AI BOOKING AGENT (/api/v1/travel/ai-booking-agent)
  // ==========================================
  aiBookingAgent: {
    getDashboard: () => unwrapData(apiClient.get('/travel/ai-booking-agent/dashboard')),
    getSettings: () => unwrapData(apiClient.get('/travel/ai-booking-agent/settings')),
    updateSettings: (data) => unwrapData(apiClient.patch('/travel/ai-booking-agent/settings', data)),
    getHealth: () => unwrapData(apiClient.get('/travel/ai-booking-agent/health')),
    getMetrics: () => unwrapData(apiClient.get('/travel/ai-booking-agent/metrics')),
    getActivityLogs: () => unwrapList(apiClient.get('/travel/ai-booking-agent/activity-logs')),
    getHandoffs: (params) => unwrapData(apiClient.get('/travel/ai-booking-agent/handoffs', params)),
    validateHandoff: (handoffId, data) => unwrapData(apiClient.post(`/travel/ai-booking-agent/handoffs/${handoffId}/validate`, data)),
    acceptHandoff: (handoffId) => unwrapData(apiClient.post(`/travel/ai-booking-agent/handoffs/${handoffId}/accept`)),
    returnHandoff: (handoffId, data) => unwrapData(apiClient.post(`/travel/ai-booking-agent/handoffs/${handoffId}/return`, data)),
    getBookings: (params) => unwrapList(apiClient.get('/travel/ai-booking-agent/bookings', params)),
    createBooking: (data) => unwrapData(apiClient.post('/travel/ai-booking-agent/bookings', data)),
    getBooking: (bookingId) => unwrapData(apiClient.get(`/travel/ai-booking-agent/bookings/${bookingId}`)),
    validateBooking: (bookingId) => unwrapData(apiClient.post(`/travel/ai-booking-agent/bookings/${bookingId}/validate`)),
    confirmBooking: (bookingId) => unwrapData(apiClient.post(`/travel/ai-booking-agent/bookings/${bookingId}/confirm`)),
    startSupplierSearch: (data) => unwrapData(apiClient.post('/travel/ai-booking-agent/supplier-searches', data)),
    getSupplierSearch: (searchId) => unwrapData(apiClient.get(`/travel/ai-booking-agent/supplier-searches/${searchId}`)),
    submitSupplierReservation: (bookingId, data) => unwrapData(apiClient.post(`/travel/ai-booking-agent/bookings/${bookingId}/supplier-reservations`, data)),
    getSupplierReservationStatus: (reservationId) => unwrapData(apiClient.get(`/travel/ai-booking-agent/supplier-reservations/${reservationId}/status`)),
    reconcileSupplierReservation: (reservationId) => unwrapData(apiClient.post(`/travel/ai-booking-agent/supplier-reservations/${reservationId}/reconcile`)),
    createCheckoutSession: (bookingId, data) => unwrapData(apiClient.post(`/travel/ai-booking-agent/bookings/${bookingId}/checkout-sessions`, data)),
    getPaymentStatus: (paymentId) => unwrapData(apiClient.get(`/travel/ai-booking-agent/payments/${paymentId}/status`)),
    getVouchers: (bookingId) => unwrapList(apiClient.get(`/travel/ai-booking-agent/bookings/${bookingId}/vouchers`)),
    generateVoucher: (bookingId, data) => unwrapData(apiClient.post(`/travel/ai-booking-agent/bookings/${bookingId}/vouchers`, data)),
    createCancellationRequest: (bookingId, data) => unwrapData(apiClient.post(`/travel/ai-booking-agent/bookings/${bookingId}/cancellation-requests`, data)),
    getExceptions: () => unwrapList(apiClient.get('/travel/ai-booking-agent/exceptions')),
    resolveException: (exceptionId, data) => unwrapData(apiClient.post(`/travel/ai-booking-agent/exceptions/${exceptionId}/resolve`, data)),
    handoffToHuman: (bookingId, data) => unwrapData(apiClient.post(`/travel/ai-booking-agent/bookings/${bookingId}/handoff-to-human`, data))
  }
};

