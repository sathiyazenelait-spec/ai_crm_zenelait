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

export const manufacturingService = {
  // Legacy / Shared Manufacturing Company Admin APIs
  getDashboard: (from, to) => unwrapData(apiClient.get('/manufacturing/dashboard', { from, to })),
  getSettings: () => unwrapData(apiClient.get('/manufacturing/settings')),
  updateSettings: (data) => unwrapData(apiClient.put('/manufacturing/settings', data)),
  getCategories: () => unwrapList(apiClient.get('/manufacturing/product-categories')),
  getProducts: () => unwrapList(apiClient.get('/manufacturing/products')),
  createProduct: (data) => unwrapData(apiClient.post('/manufacturing/products', data)),
  getProduct: (id) => unwrapData(apiClient.get(`/manufacturing/products/${id}`)),
  updateSpecifications: (id, specs) => unwrapData(apiClient.put(`/manufacturing/products/${id}/specifications`, { specifications: specs })),
  getInventory: () => unwrapList(apiClient.get('/manufacturing/inventory')),
  getPartners: () => unwrapList(apiClient.get('/manufacturing/partners')),
  createPartner: (data) => unwrapData(apiClient.post('/manufacturing/partners', data)),
  getEnquiries: () => unwrapList(apiClient.get('/manufacturing/enquiries')),
  createEnquiry: (data) => unwrapData(apiClient.post('/manufacturing/enquiries', data)),
  getQuotations: () => unwrapList(apiClient.get('/manufacturing/quotations')),
  createQuotation: (data) => unwrapData(apiClient.post('/manufacturing/quotations', data)),
  sendQuotation: (id) => unwrapData(apiClient.post(`/manufacturing/quotations/${id}/send`)),
  getOrders: () => unwrapList(apiClient.get('/manufacturing/orders')),
  createOrder: (data) => unwrapData(apiClient.post('/manufacturing/orders', data)),
  getSupportTickets: () => unwrapList(apiClient.get('/manufacturing/support-tickets')),
  createSupportTicket: (data) => unwrapData(apiClient.post('/manufacturing/support-tickets', data)),
  getSalesReport: () => unwrapData(apiClient.get('/reports/manufacturing/sales')),

  // ==========================================
  // 1. MANUFACTURING SALES MANAGER
  // ==========================================
  salesManager: {
    getDashboard: (period = 'MONTH') => unwrapData(apiClient.get('/manufacturing/sales-manager/dashboard', { period })),
    getMetrics: (period = 'MONTH') => unwrapData(apiClient.get('/manufacturing/sales-manager/metrics', { period })),
    getRevenueReport: (period = 'MONTH') => unwrapData(apiClient.get('/manufacturing/sales-manager/reports/revenue', { period })),
    getPipelineReport: () => unwrapData(apiClient.get('/manufacturing/sales-manager/reports/pipeline')),
    getConversionReport: () => unwrapData(apiClient.get('/manufacturing/sales-manager/reports/conversion')),
    getExecutivePerformance: () => unwrapList(apiClient.get('/manufacturing/sales-manager/reports/executive-performance')),
    getProductPerformance: () => unwrapList(apiClient.get('/manufacturing/sales-manager/reports/product-performance')),
    getForecastReport: () => unwrapData(apiClient.get('/manufacturing/sales-manager/reports/forecast')),
    getOverdueFollowUps: () => unwrapList(apiClient.get('/manufacturing/sales-manager/reports/overdue-follow-ups')),
    getActivityLogs: () => unwrapList(apiClient.get('/manufacturing/sales-manager/activity-logs')),

    getLeads: (status) => unwrapList(apiClient.get('/manufacturing/sales-manager/leads', { status })),
    createLead: (data) => unwrapData(apiClient.post('/manufacturing/sales-manager/leads', data)),
    getLead: (leadId) => unwrapData(apiClient.get(`/manufacturing/sales-manager/leads/${leadId}`)),
    updateLead: (leadId, data) => unwrapData(apiClient.patch(`/manufacturing/sales-manager/leads/${leadId}`, data)),
    assignLead: (leadId, data) => unwrapData(apiClient.post(`/manufacturing/sales-manager/leads/${leadId}/assign`, data)),
    reassignLead: (leadId, data) => unwrapData(apiClient.post(`/manufacturing/sales-manager/leads/${leadId}/reassign`, data)),
    qualifyLead: (leadId, data) => unwrapData(apiClient.post(`/manufacturing/sales-manager/leads/${leadId}/qualify`, data)),

    getOpportunities: () => unwrapList(apiClient.get('/manufacturing/sales-manager/opportunities')),
    createOpportunity: (data) => unwrapData(apiClient.post('/manufacturing/sales-manager/opportunities', data)),
    getOpportunity: (oppId) => unwrapData(apiClient.get(`/manufacturing/sales-manager/opportunities/${oppId}`)),
    updateOpportunity: (oppId, data) => unwrapData(apiClient.patch(`/manufacturing/sales-manager/opportunities/${oppId}`, data)),
    changeOpportunityStage: (oppId, data) => unwrapData(apiClient.post(`/manufacturing/sales-manager/opportunities/${oppId}/stage`, data)),
    closeOpportunity: (oppId, data) => unwrapData(apiClient.post(`/manufacturing/sales-manager/opportunities/${oppId}/close`, data)),

    getTeam: () => unwrapList(apiClient.get('/manufacturing/sales-manager/team')),
    getTeamMemberPerformance: (userId, period = 'MONTH') => unwrapData(apiClient.get(`/manufacturing/sales-manager/team/${userId}/performance`, { period })),
    getTargets: () => unwrapList(apiClient.get('/manufacturing/sales-manager/targets')),
    createTarget: (data) => unwrapData(apiClient.post('/manufacturing/sales-manager/targets', data)),
    getTarget: (targetId) => unwrapData(apiClient.get(`/manufacturing/sales-manager/targets/${targetId}`)),
    updateTarget: (targetId, data) => unwrapData(apiClient.patch(`/manufacturing/sales-manager/targets/${targetId}`, data)),
    getAssignments: () => unwrapList(apiClient.get('/manufacturing/sales-manager/assignments')),
    bulkAssign: (data) => unwrapData(apiClient.post('/manufacturing/sales-manager/assignments/bulk', data)),
    getWorkload: () => unwrapList(apiClient.get('/manufacturing/sales-manager/workload')),

    getProducts: (category) => unwrapList(apiClient.get('/manufacturing/sales-manager/products', { category })),
    getProduct: (productId) => unwrapData(apiClient.get(`/manufacturing/sales-manager/products/${productId}`)),
    getPriceLists: () => unwrapList(apiClient.get('/manufacturing/sales-manager/price-lists')),
    getPriceList: (plId) => unwrapData(apiClient.get(`/manufacturing/sales-manager/price-lists/${plId}`)),
    getDiscountPolicies: () => unwrapList(apiClient.get('/manufacturing/sales-manager/discount-policies')),
    getInventorySummary: () => unwrapList(apiClient.get('/manufacturing/sales-manager/inventory-summary')),

    getQuotations: () => unwrapList(apiClient.get('/manufacturing/sales-manager/quotations')),
    getQuotation: (qId) => unwrapData(apiClient.get(`/manufacturing/sales-manager/quotations/${qId}`)),
    approveQuotation: (qId, data) => unwrapData(apiClient.post(`/manufacturing/sales-manager/quotations/${qId}/approve`, data)),
    rejectQuotation: (qId, data) => unwrapData(apiClient.post(`/manufacturing/sales-manager/quotations/${qId}/reject`, data)),
    requestRevision: (qId, data) => unwrapData(apiClient.post(`/manufacturing/sales-manager/quotations/${qId}/request-revision`, data)),
    getQuotationApprovals: (status, page = 0, size = 20) => unwrapData(apiClient.get('/manufacturing/sales-manager/quotation-approvals', { status, page, size })),
    getQuotationApproval: (appId) => unwrapData(apiClient.get(`/manufacturing/sales-manager/quotation-approvals/${appId}`)),
    decideQuotationApproval: (appId, data) => unwrapData(apiClient.post(`/manufacturing/sales-manager/quotation-approvals/${appId}/decision`, data)),

    getOrders: () => unwrapList(apiClient.get('/manufacturing/sales-manager/orders')),
    getOrder: (orderId) => unwrapData(apiClient.get(`/manufacturing/sales-manager/orders/${orderId}`)),
    getEscalations: () => unwrapList(apiClient.get('/manufacturing/sales-manager/escalations')),
    assignEscalation: (escId, data) => unwrapData(apiClient.post(`/manufacturing/sales-manager/escalations/${escId}/assign`, data)),
    resolveEscalation: (escId, data) => unwrapData(apiClient.post(`/manufacturing/sales-manager/escalations/${escId}/resolve`, data))
  },

  // ==========================================
  // 2. MANUFACTURING SALES EXECUTIVE
  // ==========================================
  salesExecutive: {
    getDashboard: () => unwrapData(apiClient.get('/manufacturing/sales-executive/dashboard')),
    getMyLeads: (params) => unwrapData(apiClient.get('/manufacturing/sales-executive/my-leads', params)),
    getMyOpportunities: () => unwrapList(apiClient.get('/manufacturing/sales-executive/my-opportunities')),
    getMyTasks: () => unwrapList(apiClient.get('/manufacturing/sales-executive/my-tasks')),
    getMetrics: () => unwrapData(apiClient.get('/manufacturing/sales-executive/metrics')),
    getActivityLogs: () => unwrapList(apiClient.get('/manufacturing/sales-executive/activity-logs')),

    getCustomers: (search) => unwrapList(apiClient.get('/manufacturing/sales-executive/customers', { search })),
    createCustomer: (data) => unwrapData(apiClient.post('/manufacturing/sales-executive/customers', data)),
    getCustomer: (customerId) => unwrapData(apiClient.get(`/manufacturing/sales-executive/customers/${customerId}`)),
    updateCustomer: (customerId, data) => unwrapData(apiClient.patch(`/manufacturing/sales-executive/customers/${customerId}`, data)),
    getLeads: () => unwrapList(apiClient.get('/manufacturing/sales-executive/leads')),
    createLead: (data) => unwrapData(apiClient.post('/manufacturing/sales-executive/leads', data)),
    getLead: (leadId) => unwrapData(apiClient.get(`/manufacturing/sales-executive/leads/${leadId}`)),
    updateLead: (leadId, data) => unwrapData(apiClient.patch(`/manufacturing/sales-executive/leads/${leadId}`, data)),
    recordActivity: (leadId, data) => unwrapData(apiClient.post(`/manufacturing/sales-executive/leads/${leadId}/activities`, data)),
    getActivities: (leadId) => unwrapList(apiClient.get(`/manufacturing/sales-executive/leads/${leadId}/activities`)),
    qualifyLead: (leadId, data) => unwrapData(apiClient.post(`/manufacturing/sales-executive/leads/${leadId}/qualify`, data)),
    requestHandoff: (leadId, data) => unwrapData(apiClient.post(`/manufacturing/sales-executive/leads/${leadId}/handoff`, data)),

    getProducts: (params) => unwrapData(apiClient.get('/manufacturing/sales-executive/products', params)),
    getProduct: (productId) => unwrapData(apiClient.get(`/manufacturing/sales-executive/products/${productId}`)),
    getProductSpecs: (productId) => unwrapData(apiClient.get(`/manufacturing/sales-executive/products/${productId}/specifications`)),
    getCompatibleProducts: (productId) => unwrapList(apiClient.get(`/manufacturing/sales-executive/products/${productId}/compatible-products`)),
    getAlternatives: (productId) => unwrapList(apiClient.get(`/manufacturing/sales-executive/products/${productId}/alternatives`)),
    getPriceLists: () => unwrapList(apiClient.get('/manufacturing/sales-executive/price-lists')),
    getPriceListProduct: (plId, pId) => unwrapData(apiClient.get(`/manufacturing/sales-executive/price-lists/${plId}/products/${pId}`)),

    createProductRequirement: (data) => unwrapData(apiClient.post('/manufacturing/sales-executive/product-requirements', data)),
    getProductRequirement: (reqId) => unwrapData(apiClient.get(`/manufacturing/sales-executive/product-requirements/${reqId}`)),
    updateProductRequirement: (reqId, data) => unwrapData(apiClient.patch(`/manufacturing/sales-executive/product-requirements/${reqId}`, data)),
    validateRequirement: (reqId) => unwrapData(apiClient.post(`/manufacturing/sales-executive/product-requirements/${reqId}/validate`)),
    getRecommendations: (reqId) => unwrapList(apiClient.get(`/manufacturing/sales-executive/product-requirements/${reqId}/recommendations`)),

    getProductInventory: (productId) => unwrapData(apiClient.get(`/manufacturing/sales-executive/inventory/products/${productId}`)),
    checkInventoryAvailability: (data) => unwrapData(apiClient.post('/manufacturing/sales-executive/inventory/availability-checks', data)),
    getAvailabilityCheck: (checkId) => unwrapData(apiClient.get(`/manufacturing/sales-executive/inventory/availability-checks/${checkId}`)),
    requestFulfilmentEstimate: (data) => unwrapData(apiClient.post('/manufacturing/sales-executive/fulfilment-estimates', data)),
    getFulfilmentEstimate: (estimateId) => unwrapData(apiClient.get(`/manufacturing/sales-executive/fulfilment-estimates/${estimateId}`)),

    getQuotations: () => unwrapList(apiClient.get('/manufacturing/sales-executive/quotations')),
    createQuotation: (data) => unwrapData(apiClient.post('/manufacturing/sales-executive/quotations', data)),
    getQuotation: (qId) => unwrapData(apiClient.get(`/manufacturing/sales-executive/quotations/${qId}`)),
    updateQuotation: (qId, data) => unwrapData(apiClient.patch(`/manufacturing/sales-executive/quotations/${qId}`, data)),
    addItem: (qId, data) => unwrapData(apiClient.post(`/manufacturing/sales-executive/quotations/${qId}/items`, data)),
    updateItem: (qId, itemId, data) => unwrapData(apiClient.patch(`/manufacturing/sales-executive/quotations/${qId}/items/${itemId}`, data)),
    deleteItem: (qId, itemId) => unwrapData(apiClient.delete(`/manufacturing/sales-executive/quotations/${qId}/items/${itemId}`)),
    recalculateQuotation: (qId) => unwrapData(apiClient.post(`/manufacturing/sales-executive/quotations/${qId}/recalculate`)),
    validateQuotation: (qId) => unwrapData(apiClient.post(`/manufacturing/sales-executive/quotations/${qId}/validate`)),
    requestApproval: (qId, data) => unwrapData(apiClient.post(`/manufacturing/sales-executive/quotations/${qId}/request-approval`, data)),
    sendQuotation: (qId, data) => unwrapData(apiClient.post(`/manufacturing/sales-executive/quotations/${qId}/send`, data)),
    createRevision: (qId, data) => unwrapData(apiClient.post(`/manufacturing/sales-executive/quotations/${qId}/revisions`, data)),
    getHistory: (qId) => unwrapList(apiClient.get(`/manufacturing/sales-executive/quotations/${qId}/history`)),
    recordResponse: (qId, data) => unwrapData(apiClient.post(`/manufacturing/sales-executive/quotations/${qId}/record-response`, data)),

    getFollowUps: () => unwrapList(apiClient.get('/manufacturing/sales-executive/follow-ups')),
    createFollowUp: (data) => unwrapData(apiClient.post('/manufacturing/sales-executive/follow-ups', data)),
    updateFollowUp: (taskId, data) => unwrapData(apiClient.patch(`/manufacturing/sales-executive/follow-ups/${taskId}`, data)),
    completeFollowUp: (taskId) => unwrapData(apiClient.post(`/manufacturing/sales-executive/follow-ups/${taskId}/complete`)),
    snoozeFollowUp: (taskId, data) => unwrapData(apiClient.post(`/manufacturing/sales-executive/follow-ups/${taskId}/snooze`, data)),

    getConversations: () => unwrapList(apiClient.get('/manufacturing/sales-executive/conversations')),
    getMessages: (conversationId) => unwrapList(apiClient.get(`/manufacturing/sales-executive/conversations/${conversationId}/messages`)),
    sendMessage: (conversationId, data) => unwrapData(apiClient.post(`/manufacturing/sales-executive/conversations/${conversationId}/messages`, data)),
    transferConversation: (conversationId, data) => unwrapData(apiClient.post(`/manufacturing/sales-executive/conversations/${conversationId}/handoff`, data)),

    createOrderHandoff: (qId, data) => unwrapData(apiClient.post(`/manufacturing/sales-executive/quotations/${qId}/order-handoffs`, data)),
    getOrderHandoff: (handoffId) => unwrapData(apiClient.get(`/manufacturing/sales-executive/order-handoffs/${handoffId}`)),
    getOrder: (orderId) => unwrapData(apiClient.get(`/manufacturing/sales-executive/orders/${orderId}`)),
    getOrderStatus: (orderId) => unwrapData(apiClient.get(`/manufacturing/sales-executive/orders/${orderId}/status`))
  },

  // ==========================================
  // 3. MANUFACTURING DEALER MANAGER
  // ==========================================
  dealerManager: {
    getDashboard: () => unwrapData(apiClient.get('/manufacturing/dealer-manager/dashboard')),
    getMetrics: () => unwrapData(apiClient.get('/manufacturing/dealer-manager/metrics')),
    getDealerPerformanceReport: () => unwrapList(apiClient.get('/manufacturing/dealer-manager/reports/dealer-performance')),
    getTerritoryPerformanceReport: () => unwrapList(apiClient.get('/manufacturing/dealer-manager/reports/territory-performance')),
    getProductPerformanceReport: () => unwrapList(apiClient.get('/manufacturing/dealer-manager/reports/product-performance')),
    getOrderPerformanceReport: () => unwrapData(apiClient.get('/manufacturing/dealer-manager/reports/order-performance')),
    getCreditExposure: () => unwrapData(apiClient.get('/manufacturing/dealer-manager/reports/credit-exposure')),
    getOverduePayments: () => unwrapList(apiClient.get('/manufacturing/dealer-manager/reports/overdue-payments')),
    getActivityLogs: () => unwrapList(apiClient.get('/manufacturing/dealer-manager/activity-logs')),

    getDealers: (params) => unwrapList(apiClient.get('/manufacturing/dealer-manager/dealers', params)),
    registerDealer: (data) => unwrapData(apiClient.post('/manufacturing/dealer-manager/dealers', data)),
    getDealer: (dealerId) => unwrapData(apiClient.get(`/manufacturing/dealer-manager/dealers/${dealerId}`)),
    updateDealer: (dealerId, data) => unwrapData(apiClient.patch(`/manufacturing/dealer-manager/dealers/${dealerId}`, data)),
    submitVerification: (dealerId, data) => unwrapData(apiClient.post(`/manufacturing/dealer-manager/dealers/${dealerId}/submit-verification`, data)),
    getVerification: (dealerId) => unwrapData(apiClient.get(`/manufacturing/dealer-manager/dealers/${dealerId}/verification`)),
    decideVerification: (dealerId, data) => unwrapData(apiClient.post(`/manufacturing/dealer-manager/dealers/${dealerId}/verification-decision`, data)),
    activateDealer: (dealerId) => unwrapData(apiClient.post(`/manufacturing/dealer-manager/dealers/${dealerId}/activate`)),
    suspendDealer: (dealerId, data) => unwrapData(apiClient.post(`/manufacturing/dealer-manager/dealers/${dealerId}/suspend`, data)),
    reactivateDealer: (dealerId) => unwrapData(apiClient.post(`/manufacturing/dealer-manager/dealers/${dealerId}/reactivate`)),
    getContacts: (dealerId) => unwrapList(apiClient.get(`/manufacturing/dealer-manager/dealers/${dealerId}/contacts`)),
    addContact: (dealerId, data) => unwrapData(apiClient.post(`/manufacturing/dealer-manager/dealers/${dealerId}/contacts`, data)),
    updateContact: (dealerId, contactId, data) => unwrapData(apiClient.patch(`/manufacturing/dealer-manager/dealers/${dealerId}/contacts/${contactId}`, data)),
    getDocuments: (dealerId) => unwrapList(apiClient.get(`/manufacturing/dealer-manager/dealers/${dealerId}/documents`)),
    addDocument: (dealerId, data) => unwrapData(apiClient.post(`/manufacturing/dealer-manager/dealers/${dealerId}/documents`, data)),

    getTerritories: () => unwrapList(apiClient.get('/manufacturing/dealer-manager/territories')),
    createTerritory: (data) => unwrapData(apiClient.post('/manufacturing/dealer-manager/territories', data)),
    getTerritory: (territoryId) => unwrapData(apiClient.get(`/manufacturing/dealer-manager/territories/${territoryId}`)),
    updateTerritory: (territoryId, data) => unwrapData(apiClient.patch(`/manufacturing/dealer-manager/territories/${territoryId}`, data)),
    getTerritoryDealers: (territoryId) => unwrapList(apiClient.get(`/manufacturing/dealer-manager/territories/${territoryId}/dealers`)),
    assignDealerToTerritory: (territoryId, data) => unwrapData(apiClient.post(`/manufacturing/dealer-manager/territories/${territoryId}/dealers`, data)),
    removeDealerFromTerritory: (territoryId, dealerId) => unwrapData(apiClient.delete(`/manufacturing/dealer-manager/territories/${territoryId}/dealers/${dealerId}`)),
    getTerritoryAssignments: () => unwrapList(apiClient.get('/manufacturing/dealer-manager/territory-assignments')),
    bulkAssignTerritories: (data) => unwrapData(apiClient.post('/manufacturing/dealer-manager/territory-assignments/bulk', data)),

    getPriceLists: () => unwrapList(apiClient.get('/manufacturing/dealer-manager/price-lists')),
    getDealerPriceLists: (dealerId) => unwrapList(apiClient.get(`/manufacturing/dealer-manager/dealers/${dealerId}/price-lists`)),
    createDealerPriceRequest: (data) => unwrapData(apiClient.post('/manufacturing/dealer-manager/dealer-price-requests', data)),
    getDealerPriceRequests: () => unwrapList(apiClient.get('/manufacturing/dealer-manager/dealer-price-requests')),
    getDealerPriceRequest: (requestId) => unwrapData(apiClient.get(`/manufacturing/dealer-manager/dealer-price-requests/${requestId}`)),
    decideDealerPriceRequest: (requestId, data) => unwrapData(apiClient.post(`/manufacturing/dealer-manager/dealer-price-requests/${requestId}/decision`, data)),
    getAgreements: () => unwrapList(apiClient.get('/manufacturing/dealer-manager/dealer-agreements')),
    createAgreement: (data) => unwrapData(apiClient.post('/manufacturing/dealer-manager/dealer-agreements', data)),
    getAgreement: (agreementId) => unwrapData(apiClient.get(`/manufacturing/dealer-manager/dealer-agreements/${agreementId}`)),
    updateAgreement: (agreementId, data) => unwrapData(apiClient.patch(`/manufacturing/dealer-manager/dealer-agreements/${agreementId}`, data)),
    submitAgreementForApproval: (agreementId) => unwrapData(apiClient.post(`/manufacturing/dealer-manager/dealer-agreements/${agreementId}/submit-approval`)),
    activateAgreement: (agreementId) => unwrapData(apiClient.post(`/manufacturing/dealer-manager/dealer-agreements/${agreementId}/activate`)),

    getDealerTargets: (dealerId) => unwrapList(apiClient.get(`/manufacturing/dealer-manager/dealers/${dealerId}/targets`)),
    createDealerTarget: (dealerId, data) => unwrapData(apiClient.post(`/manufacturing/dealer-manager/dealers/${dealerId}/targets`, data)),
    updateDealerTarget: (targetId, data) => unwrapData(apiClient.patch(`/manufacturing/dealer-manager/dealer-targets/${targetId}`, data)),
    getDealerPerformance: (dealerId, period = 'QUARTER') => unwrapData(apiClient.get(`/manufacturing/dealer-manager/dealers/${dealerId}/performance`, { period })),
    getDealerOrders: () => unwrapList(apiClient.get('/manufacturing/dealer-manager/dealer-orders')),
    getDealerOrder: (orderId) => unwrapData(apiClient.get(`/manufacturing/dealer-manager/dealer-orders/${orderId}`)),
    getInventoryReports: (dealerId) => unwrapList(apiClient.get(`/manufacturing/dealer-manager/dealers/${dealerId}/inventory-reports`)),
    submitInventoryReport: (dealerId, data) => unwrapData(apiClient.post(`/manufacturing/dealer-manager/dealers/${dealerId}/inventory-reports`, data)),
    getEscalations: () => unwrapList(apiClient.get('/manufacturing/dealer-manager/dealer-escalations')),
    assignEscalation: (escId, data) => unwrapData(apiClient.post(`/manufacturing/dealer-manager/dealer-escalations/${escId}/assign`, data)),
    resolveEscalation: (escId, data) => unwrapData(apiClient.post(`/manufacturing/dealer-manager/dealer-escalations/${escId}/resolve`, data))
  },

  // ==========================================
  // 4. MANUFACTURING CUSTOMER SUPPORT
  // ==========================================
  customerSupport: {
    getDashboard: () => unwrapData(apiClient.get('/manufacturing/customer-support/dashboard')),
    getMetrics: () => unwrapData(apiClient.get('/manufacturing/customer-support/metrics')),
    getTickets: (params) => unwrapList(apiClient.get('/manufacturing/customer-support/tickets', params)),
    getTicket: (ticketId) => unwrapData(apiClient.get(`/manufacturing/customer-support/tickets/${ticketId}`)),
    createTicket: (data) => unwrapData(apiClient.post('/manufacturing/customer-support/tickets', data)),
    updateTicket: (ticketId, data) => unwrapData(apiClient.patch(`/manufacturing/customer-support/tickets/${ticketId}`, data)),
    assignTicket: (ticketId, data) => unwrapData(apiClient.post(`/manufacturing/customer-support/tickets/${ticketId}/assign`, data)),
    updatePriority: (ticketId, data) => unwrapData(apiClient.post(`/manufacturing/customer-support/tickets/${ticketId}/priority`, data)),
    escalateTicket: (ticketId, data) => unwrapData(apiClient.post(`/manufacturing/customer-support/tickets/${ticketId}/escalate`, data)),
    resolveTicket: (ticketId, data) => unwrapData(apiClient.post(`/manufacturing/customer-support/tickets/${ticketId}/resolve`, data)),
    reopenTicket: (ticketId, data) => unwrapData(apiClient.post(`/manufacturing/customer-support/tickets/${ticketId}/reopen`, data)),
    getTicketHistory: (ticketId) => unwrapList(apiClient.get(`/manufacturing/customer-support/tickets/${ticketId}/history`)),

    getMessages: (ticketId) => unwrapList(apiClient.get(`/manufacturing/customer-support/tickets/${ticketId}/messages`)),
    sendMessage: (ticketId, data) => unwrapData(apiClient.post(`/manufacturing/customer-support/tickets/${ticketId}/messages`, data)),
    getInternalNotes: (ticketId) => unwrapList(apiClient.get(`/manufacturing/customer-support/tickets/${ticketId}/internal-notes`)),
    addInternalNote: (ticketId, data) => unwrapData(apiClient.post(`/manufacturing/customer-support/tickets/${ticketId}/internal-notes`, data)),
    classifyTicket: (ticketId, data) => unwrapData(apiClient.post(`/manufacturing/customer-support/tickets/${ticketId}/classify`, data)),
    summarizeTicket: (ticketId) => unwrapData(apiClient.post(`/manufacturing/customer-support/tickets/${ticketId}/summarize`)),
    draftReply: (ticketId, data) => unwrapData(apiClient.post(`/manufacturing/customer-support/tickets/${ticketId}/draft-reply`, data)),
    approveReply: (ticketId, data) => unwrapData(apiClient.post(`/manufacturing/customer-support/tickets/${ticketId}/approve-reply`, data)),
    suggestResolution: (ticketId) => unwrapData(apiClient.post(`/manufacturing/customer-support/tickets/${ticketId}/suggest-resolution`)),
    handoffToHuman: (ticketId) => unwrapData(apiClient.post(`/manufacturing/customer-support/tickets/${ticketId}/handoff-to-human`)),

    getCustomers: (search) => unwrapList(apiClient.get('/manufacturing/customer-support/customers', { search })),
    getCustomer: (customerId) => unwrapData(apiClient.get(`/manufacturing/customer-support/customers/${customerId}`)),
    getCustomerOrders: (customerId) => unwrapList(apiClient.get(`/manufacturing/customer-support/customers/${customerId}/orders`)),
    getOrder: (orderId) => unwrapData(apiClient.get(`/manufacturing/customer-support/orders/${orderId}`)),
    getDeliveryStatus: (orderId) => unwrapData(apiClient.get(`/manufacturing/customer-support/orders/${orderId}/delivery-status`)),
    getOrderInvoices: (orderId) => unwrapList(apiClient.get(`/manufacturing/customer-support/orders/${orderId}/invoices`)),
    getProducts: () => unwrapList(apiClient.get('/manufacturing/customer-support/products')),
    getProduct: (productId) => unwrapData(apiClient.get(`/manufacturing/customer-support/products/${productId}`)),
    getProductSpecs: (productId) => unwrapData(apiClient.get(`/manufacturing/customer-support/products/${productId}/specifications`)),
    getProductDocuments: (productId) => unwrapList(apiClient.get(`/manufacturing/customer-support/products/${productId}/documents`)),
    getProductRecalls: (productId) => unwrapList(apiClient.get(`/manufacturing/customer-support/products/${productId}/recalls`)),
    verifyCustomerContext: (data) => unwrapData(apiClient.post('/manufacturing/customer-support/customer-context/verify', data)),
    lookupCustomerContext: (data) => unwrapData(apiClient.post('/manufacturing/customer-support/customer-context/lookup', data)),

    getWarrantyClaims: () => unwrapList(apiClient.get('/manufacturing/customer-support/warranty-claims')),
    createWarrantyClaim: (data) => unwrapData(apiClient.post('/manufacturing/customer-support/warranty-claims', data)),
    getWarrantyClaim: (claimId) => unwrapData(apiClient.get(`/manufacturing/customer-support/warranty-claims/${claimId}`)),
    updateWarrantyClaim: (claimId, data) => unwrapData(apiClient.patch(`/manufacturing/customer-support/warranty-claims/${claimId}`, data)),
    validateWarrantyClaim: (claimId, data) => unwrapData(apiClient.post(`/manufacturing/customer-support/warranty-claims/${claimId}/validate`, data)),
    submitWarrantyClaim: (claimId) => unwrapData(apiClient.post(`/manufacturing/customer-support/warranty-claims/${claimId}/submit`)),
    decideWarrantyClaim: (claimId, data) => unwrapData(apiClient.post(`/manufacturing/customer-support/warranty-claims/${claimId}/decision`, data)),
    requestWarrantyInfo: (claimId, data) => unwrapData(apiClient.post(`/manufacturing/customer-support/warranty-claims/${claimId}/request-information`, data)),
    escalateWarrantyClaim: (claimId, data) => unwrapData(apiClient.post(`/manufacturing/customer-support/warranty-claims/${claimId}/escalate`, data)),
    getWarrantyPolicies: () => unwrapList(apiClient.get('/manufacturing/customer-support/warranty-policies')),
    getWarrantyPolicy: (policyId) => unwrapData(apiClient.get(`/manufacturing/customer-support/warranty-policies/${policyId}`)),

    getReturnRequests: () => unwrapList(apiClient.get('/manufacturing/customer-support/return-requests')),
    createReturnRequest: (data) => unwrapData(apiClient.post('/manufacturing/customer-support/return-requests', data)),
    getReturnRequest: (requestId) => unwrapData(apiClient.get(`/manufacturing/customer-support/return-requests/${requestId}`)),
    validateReturnRequest: (requestId) => unwrapData(apiClient.post(`/manufacturing/customer-support/return-requests/${requestId}/validate`)),
    decideReturnRequest: (requestId, data) => unwrapData(apiClient.post(`/manufacturing/customer-support/return-requests/${requestId}/decision`, data)),
    handoffReturnToWarehouse: (requestId) => unwrapData(apiClient.post(`/manufacturing/customer-support/return-requests/${requestId}/handoff-to-warehouse`)),

    getRepairRequests: () => unwrapList(apiClient.get('/manufacturing/customer-support/repair-requests')),
    createRepairRequest: (data) => unwrapData(apiClient.post('/manufacturing/customer-support/repair-requests', data)),
    getRepairRequest: (requestId) => unwrapData(apiClient.get(`/manufacturing/customer-support/repair-requests/${requestId}`)),
    assignTechnician: (requestId, data) => unwrapData(apiClient.post(`/manufacturing/customer-support/repair-requests/${requestId}/assign-technician`, data)),
    updateRepairStatus: (requestId, data) => unwrapData(apiClient.post(`/manufacturing/customer-support/repair-requests/${requestId}/update-status`, data)),
    completeRepair: (requestId, data) => unwrapData(apiClient.post(`/manufacturing/customer-support/repair-requests/${requestId}/complete`, data)),

    getDeliveryIssues: () => unwrapList(apiClient.get('/manufacturing/customer-support/delivery-issues')),
    reportDeliveryIssue: (data) => unwrapData(apiClient.post('/manufacturing/customer-support/delivery-issues', data)),
    getQualityComplaints: () => unwrapList(apiClient.get('/manufacturing/customer-support/quality-complaints')),
    createQualityComplaint: (data) => unwrapData(apiClient.post('/manufacturing/customer-support/quality-complaints', data)),
    getQualityComplaint: (complaintId) => unwrapData(apiClient.get(`/manufacturing/customer-support/quality-complaints/${complaintId}`)),
    classifyComplaint: (complaintId) => unwrapData(apiClient.post(`/manufacturing/customer-support/quality-complaints/${complaintId}/classify`)),
    escalateComplaint: (complaintId, data) => unwrapData(apiClient.post(`/manufacturing/customer-support/quality-complaints/${complaintId}/escalate`, data)),
    resolveComplaint: (complaintId, data) => unwrapData(apiClient.post(`/manufacturing/customer-support/quality-complaints/${complaintId}/resolve`, data)),

    getEscalations: () => unwrapList(apiClient.get('/manufacturing/customer-support/escalations')),
    getActivityLogs: () => unwrapList(apiClient.get('/manufacturing/customer-support/activity-logs')),

    getArticles: () => unwrapList(apiClient.get('/manufacturing/customer-support/knowledge/articles')),
    getArticle: (articleId) => unwrapData(apiClient.get(`/manufacturing/customer-support/knowledge/articles/${articleId}`)),
    searchKnowledge: (data) => unwrapData(apiClient.post('/manufacturing/customer-support/knowledge/search', data)),
    recordFeedback: (data) => unwrapData(apiClient.post('/manufacturing/customer-support/feedback', data)),
    getResolutionReport: () => unwrapData(apiClient.get('/manufacturing/customer-support/reports/resolution')),
    getIssueTrends: () => unwrapList(apiClient.get('/manufacturing/customer-support/reports/issues'))
  },

  // ==========================================
  // 5. MANUFACTURING TECHNICAL SUPPORT
  // ==========================================
  technicalSupport: {
    getDashboard: () => unwrapData(apiClient.get('/manufacturing/technical-support/dashboard')),
    getMetrics: () => unwrapData(apiClient.get('/manufacturing/technical-support/metrics')),
    getMyCases: (assigneeId) => unwrapList(apiClient.get('/manufacturing/technical-support/my-cases', { assigneeId })),
    getTechnicalIssuesReport: () => unwrapList(apiClient.get('/manufacturing/technical-support/reports/technical-issues')),
    getProductDefectsReport: () => unwrapList(apiClient.get('/manufacturing/technical-support/reports/product-defects')),
    getResolutionTimeReport: () => unwrapData(apiClient.get('/manufacturing/technical-support/reports/resolution-time')),
    getActivityLogs: () => unwrapList(apiClient.get('/manufacturing/technical-support/activity-logs')),

    getCases: (params) => unwrapList(apiClient.get('/manufacturing/technical-support/cases', params)),
    createCase: (data) => unwrapData(apiClient.post('/manufacturing/technical-support/cases', data)),
    getCase: (caseId) => unwrapData(apiClient.get(`/manufacturing/technical-support/cases/${caseId}`)),
    updateCase: (caseId, data) => unwrapData(apiClient.patch(`/manufacturing/technical-support/cases/${caseId}`, data)),
    assignCase: (caseId, data) => unwrapData(apiClient.post(`/manufacturing/technical-support/cases/${caseId}/assign`, data)),
    changePriority: (caseId, data) => unwrapData(apiClient.post(`/manufacturing/technical-support/cases/${caseId}/priority`, data)),
    classifyCase: (caseId, data) => unwrapData(apiClient.post(`/manufacturing/technical-support/cases/${caseId}/classify`, data)),
    requestInformation: (caseId, data) => unwrapData(apiClient.post(`/manufacturing/technical-support/cases/${caseId}/request-information`, data)),
    escalateCase: (caseId, data) => unwrapData(apiClient.post(`/manufacturing/technical-support/cases/${caseId}/escalate`, data)),
    resolveCase: (caseId, data) => unwrapData(apiClient.post(`/manufacturing/technical-support/cases/${caseId}/resolve`, data)),
    reopenCase: (caseId) => unwrapData(apiClient.post(`/manufacturing/technical-support/cases/${caseId}/reopen`)),
    getCaseHistory: (caseId) => unwrapList(apiClient.get(`/manufacturing/technical-support/cases/${caseId}/history`)),
    getCaseTimeline: (caseId) => unwrapList(apiClient.get(`/manufacturing/technical-support/cases/${caseId}/timeline`)),

    getProducts: (params) => unwrapList(apiClient.get('/manufacturing/technical-support/products', params)),
    getProduct: (productId) => unwrapData(apiClient.get(`/manufacturing/technical-support/products/${productId}`)),
    getProductSpecs: (productId) => unwrapData(apiClient.get(`/manufacturing/technical-support/products/${productId}/specifications`)),
    getCompatibleProducts: (productId) => unwrapList(apiClient.get(`/manufacturing/technical-support/products/${productId}/compatible-products`)),
    getProductManuals: (productId) => unwrapList(apiClient.get(`/manufacturing/technical-support/products/${productId}/manuals`)),
    getSafetyDocuments: (productId) => unwrapList(apiClient.get(`/manufacturing/technical-support/products/${productId}/safety-documents`)),
    getKnownIssues: (productId) => unwrapList(apiClient.get(`/manufacturing/technical-support/products/${productId}/known-issues`)),
    getRecalls: (productId) => unwrapList(apiClient.get(`/manufacturing/technical-support/products/${productId}/recalls`)),
    getDocument: (documentId) => unwrapData(apiClient.get(`/manufacturing/technical-support/documents/${documentId}`)),

    startDiagnosticSession: (data) => unwrapData(apiClient.post('/manufacturing/technical-support/diagnostics/sessions', data)),
    getDiagnosticSession: (sessionId) => unwrapData(apiClient.get(`/manufacturing/technical-support/diagnostics/sessions/${sessionId}`)),
    recordObservations: (sessionId, data) => unwrapData(apiClient.post(`/manufacturing/technical-support/diagnostics/sessions/${sessionId}/observations`, data)),
    runDiagnosticCheck: (sessionId, data) => unwrapData(apiClient.post(`/manufacturing/technical-support/diagnostics/sessions/${sessionId}/run-check`, data)),
    getTroubleshootingSuggestions: (sessionId, data) => unwrapData(apiClient.post(`/manufacturing/technical-support/diagnostics/sessions/${sessionId}/suggestions`, data)),
    completeDiagnosticSession: (sessionId) => unwrapData(apiClient.post(`/manufacturing/technical-support/diagnostics/sessions/${sessionId}/complete`)),
    getDiagnosticRules: () => unwrapList(apiClient.get('/manufacturing/technical-support/diagnostics/rules')),

    uploadAttachment: (caseId, data) => unwrapData(apiClient.post(`/manufacturing/technical-support/cases/${caseId}/attachments`, data)),
    getAttachments: (caseId) => unwrapList(apiClient.get(`/manufacturing/technical-support/cases/${caseId}/attachments`)),
    recordEvidence: (caseId, data) => unwrapData(apiClient.post(`/manufacturing/technical-support/cases/${caseId}/evidence`, data)),
    getEvidence: (caseId) => unwrapList(apiClient.get(`/manufacturing/technical-support/cases/${caseId}/evidence`)),

    getServiceRequests: () => unwrapList(apiClient.get('/manufacturing/technical-support/service-requests')),
    createServiceRequest: (data) => unwrapData(apiClient.post('/manufacturing/technical-support/service-requests', data)),
    getServiceRequest: (requestId) => unwrapData(apiClient.get(`/manufacturing/technical-support/service-requests/${requestId}`)),
    updateServiceRequest: (requestId, data) => unwrapData(apiClient.patch(`/manufacturing/technical-support/service-requests/${requestId}`, data)),
    scheduleService: (requestId, data) => unwrapData(apiClient.post(`/manufacturing/technical-support/service-requests/${requestId}/schedule`, data)),
    assignTechnician: (requestId, data) => unwrapData(apiClient.post(`/manufacturing/technical-support/service-requests/${requestId}/assign-technician`, data)),
    updateServiceStatus: (requestId, data) => unwrapData(apiClient.post(`/manufacturing/technical-support/service-requests/${requestId}/update-status`, data)),
    completeServiceRequest: (requestId, data) => unwrapData(apiClient.post(`/manufacturing/technical-support/service-requests/${requestId}/complete`, data)),
    getMaintenancePlans: () => unwrapList(apiClient.get('/manufacturing/technical-support/maintenance-plans')),
    getMaintenanceHistory: (productId) => unwrapList(apiClient.get(`/manufacturing/technical-support/products/${productId}/maintenance-history`)),

    getWarrantyClaims: () => unwrapList(apiClient.get('/manufacturing/technical-support/warranty-claims')),
    getWarrantyClaim: (claimId) => unwrapData(apiClient.get(`/manufacturing/technical-support/warranty-claims/${claimId}`)),
    recordWarrantyTechnicalAssessment: (claimId, data) => unwrapData(apiClient.post(`/manufacturing/technical-support/warranty-claims/${claimId}/technical-assessment`, data)),
    requestWarrantyEvidence: (claimId, data) => unwrapData(apiClient.post(`/manufacturing/technical-support/warranty-claims/${claimId}/request-evidence`, data)),
    escalateWarranty: (claimId, data) => unwrapData(apiClient.post(`/manufacturing/technical-support/warranty-claims/${claimId}/escalate`, data)),
    getQualityComplaints: () => unwrapList(apiClient.get('/manufacturing/technical-support/quality-complaints')),
    recordQualityComplaint: (data) => unwrapData(apiClient.post('/manufacturing/technical-support/quality-complaints', data)),
    getQualityComplaint: (complaintId) => unwrapData(apiClient.get(`/manufacturing/technical-support/quality-complaints/${complaintId}`)),
    addQualityFindings: (complaintId, data) => unwrapData(apiClient.post(`/manufacturing/technical-support/quality-complaints/${complaintId}/technical-findings`, data)),
    escalateQualityComplaint: (complaintId, data) => unwrapData(apiClient.post(`/manufacturing/technical-support/quality-complaints/${complaintId}/escalate`, data)),

    getCaseMessages: (caseId) => unwrapList(apiClient.get(`/manufacturing/technical-support/cases/${caseId}/messages`)),
    addCaseMessage: (caseId, data) => unwrapData(apiClient.post(`/manufacturing/technical-support/cases/${caseId}/messages`, data)),
    addInternalNote: (caseId, data) => unwrapData(apiClient.post(`/manufacturing/technical-support/cases/${caseId}/internal-notes`, data)),
    getArticles: () => unwrapList(apiClient.get('/manufacturing/technical-support/knowledge/articles')),
    getArticle: (articleId) => unwrapData(apiClient.get(`/manufacturing/technical-support/knowledge/articles/${articleId}`)),
    searchKnowledge: (data) => unwrapList(apiClient.post('/manufacturing/technical-support/knowledge/search', data)),
    handoffCase: (caseId, data) => unwrapData(apiClient.post(`/manufacturing/technical-support/cases/${caseId}/handoff`, data)),
    recordFeedback: (data) => unwrapData(apiClient.post('/manufacturing/technical-support/feedback', data))
  },

  // ==========================================
  // 6. MANUFACTURING AI B2B SALES AGENT
  // ==========================================
  aiB2BSalesAgent: {
    getDashboard: () => unwrapData(apiClient.get('/manufacturing/ai-b2b-sales/dashboard')),
    getMetrics: () => unwrapData(apiClient.get('/manufacturing/ai-b2b-sales/metrics')),
    getConfiguration: () => unwrapData(apiClient.get('/manufacturing/ai-b2b-sales/configuration')),
    updateConfiguration: (data) => unwrapData(apiClient.patch('/manufacturing/ai-b2b-sales/configuration', data)),
    getKnowledgeSources: () => unwrapList(apiClient.get('/manufacturing/ai-b2b-sales/knowledge-sources')),
    syncKnowledgeSource: (sourceId) => unwrapData(apiClient.post(`/manufacturing/ai-b2b-sales/knowledge-sources/${sourceId}/sync`)),

    startConversation: (data) => unwrapData(apiClient.post('/manufacturing/ai-b2b-sales/conversations', data)),
    getConversations: () => unwrapList(apiClient.get('/manufacturing/ai-b2b-sales/conversations')),
    getConversation: (convId) => unwrapData(apiClient.get(`/manufacturing/ai-b2b-sales/conversations/${convId}`)),
    getMessages: (convId) => unwrapList(apiClient.get(`/manufacturing/ai-b2b-sales/conversations/${convId}/messages`)),
    addMessage: (convId, data) => unwrapData(apiClient.post(`/manufacturing/ai-b2b-sales/conversations/${convId}/messages`, data)),
    processMessage: (convId, data) => unwrapData(apiClient.post(`/manufacturing/ai-b2b-sales/conversations/${convId}/process`, data)),
    handoffConversation: (convId, data) => unwrapData(apiClient.post(`/manufacturing/ai-b2b-sales/conversations/${convId}/handoff`, data)),
    closeConversation: (convId) => unwrapData(apiClient.post(`/manufacturing/ai-b2b-sales/conversations/${convId}/close`)),

    getLeads: () => unwrapList(apiClient.get('/manufacturing/ai-b2b-sales/leads')),
    createLead: (data) => unwrapData(apiClient.post('/manufacturing/ai-b2b-sales/leads', data)),
    getLead: (leadId) => unwrapData(apiClient.get(`/manufacturing/ai-b2b-sales/leads/${leadId}`)),
    updateLead: (leadId, data) => unwrapData(apiClient.patch(`/manufacturing/ai-b2b-sales/leads/${leadId}`, data)),
    scoreLead: (leadId) => unwrapData(apiClient.post(`/manufacturing/ai-b2b-sales/leads/${leadId}/score`)),
    qualifyLead: (leadId, data) => unwrapData(apiClient.post(`/manufacturing/ai-b2b-sales/leads/${leadId}/qualify`, data)),

    extractRequirements: (data) => unwrapData(apiClient.post('/manufacturing/ai-b2b-sales/requirement-extractions', data)),
    recommendProducts: (data) => unwrapData(apiClient.post('/manufacturing/ai-b2b-sales/product-recommendations', data)),
    getPriceLists: () => unwrapList(apiClient.get('/manufacturing/ai-b2b-sales/price-lists')),
    getProductPricing: (priceListId, productId) => unwrapData(apiClient.get(`/manufacturing/ai-b2b-sales/price-lists/${priceListId}/products/${productId}`)),
    checkInventoryAvailability: (data) => unwrapData(apiClient.post('/manufacturing/ai-b2b-sales/inventory/availability-checks', data)),

    createQuotationDraft: (data) => unwrapData(apiClient.post('/manufacturing/ai-b2b-sales/quotations/drafts', data)),
    getQuotation: (quotationId) => unwrapData(apiClient.get(`/manufacturing/ai-b2b-sales/quotations/${quotationId}`)),
    requestQuotationApproval: (quotationId, data) => unwrapData(apiClient.post(`/manufacturing/ai-b2b-sales/quotations/${quotationId}/request-approval`, data)),
    sendQuotation: (quotationId) => unwrapData(apiClient.post(`/manufacturing/ai-b2b-sales/quotations/${quotationId}/send`)),

    getFollowUps: () => unwrapList(apiClient.get('/manufacturing/ai-b2b-sales/follow-ups')),
    createFollowUp: (data) => unwrapData(apiClient.post('/manufacturing/ai-b2b-sales/follow-ups', data)),
    completeFollowUp: (taskId) => unwrapData(apiClient.post(`/manufacturing/ai-b2b-sales/follow-ups/${taskId}/complete`)),
    requestMeeting: (data) => unwrapData(apiClient.post('/manufacturing/ai-b2b-sales/meeting-requests', data)),
    getActivityLogs: () => unwrapList(apiClient.get('/manufacturing/ai-b2b-sales/activity-logs'))
  },

  // ==========================================
  // 7. MANUFACTURING AI SUPPORT AGENT
  // ==========================================
  aiSupportAgent: {
    getDashboard: () => unwrapData(apiClient.get('/manufacturing/ai-support/dashboard')),
    getMetrics: () => unwrapData(apiClient.get('/manufacturing/ai-support/metrics')),
    getConfiguration: () => unwrapData(apiClient.get('/manufacturing/ai-support/configuration')),
    getChannels: () => unwrapList(apiClient.get('/manufacturing/ai-support/channels')),

    startConversation: (data) => unwrapData(apiClient.post('/manufacturing/ai-support/conversations', data)),
    getConversations: () => unwrapList(apiClient.get('/manufacturing/ai-support/conversations')),
    getConversation: (convId) => unwrapData(apiClient.get(`/manufacturing/ai-support/conversations/${convId}`)),
    getMessages: (convId) => unwrapList(apiClient.get(`/manufacturing/ai-support/conversations/${convId}/messages`)),
    addMessage: (convId, data) => unwrapData(apiClient.post(`/manufacturing/ai-support/conversations/${convId}/messages`, data)),
    summarizeConversation: (convId) => unwrapData(apiClient.post(`/manufacturing/ai-support/conversations/${convId}/summarize`)),
    handoffConversation: (convId, data) => unwrapData(apiClient.post(`/manufacturing/ai-support/conversations/${convId}/handoff`, data)),

    startCustomerVerification: (data) => unwrapData(apiClient.post('/manufacturing/ai-support/customer-verifications', data)),
    getVerification: (verId) => unwrapData(apiClient.get(`/manufacturing/ai-support/customer-verifications/${verId}`)),
    completeVerification: (verId, data) => unwrapData(apiClient.post(`/manufacturing/ai-support/customer-verifications/${verId}/complete`, data)),

    classifyIntent: (data) => unwrapData(apiClient.post('/manufacturing/ai-support/intents/classify', data)),
    draftResponse: (data) => unwrapData(apiClient.post('/manufacturing/ai-support/responses/draft', data)),
    validateResponse: (data) => unwrapData(apiClient.post('/manufacturing/ai-support/responses/validate', data)),
    sendResponse: (data) => unwrapData(apiClient.post('/manufacturing/ai-support/responses/send', data)),
    approveResponse: (rspId) => unwrapData(apiClient.post(`/manufacturing/ai-support/responses/${rspId}/approve`)),

    getTickets: () => unwrapList(apiClient.get('/manufacturing/ai-support/tickets')),
    createTicket: (data) => unwrapData(apiClient.post('/manufacturing/ai-support/tickets', data)),
    getTicket: (ticketId) => unwrapData(apiClient.get(`/manufacturing/ai-support/tickets/${ticketId}`)),
    updateTicket: (ticketId, data) => unwrapData(apiClient.patch(`/manufacturing/ai-support/tickets/${ticketId}`, data)),
    escalateTicket: (ticketId, data) => unwrapData(apiClient.post(`/manufacturing/ai-support/tickets/${ticketId}/escalate`, data)),
    resolveTicket: (ticketId, data) => unwrapData(apiClient.post(`/manufacturing/ai-support/tickets/${ticketId}/resolve`, data)),

    getOrderStatus: (orderId) => unwrapData(apiClient.get(`/manufacturing/ai-support/orders/${orderId}/status`)),
    getDeliveryStatus: (orderId) => unwrapData(apiClient.get(`/manufacturing/ai-support/orders/${orderId}/delivery-status`)),
    searchKnowledge: (data) => unwrapData(apiClient.post('/manufacturing/ai-support/knowledge/search', data)),
    answerFromKnowledge: (data) => unwrapData(apiClient.post('/manufacturing/ai-support/knowledge/answer', data)),

    getWarrantyClaims: () => unwrapList(apiClient.get('/manufacturing/ai-support/warranty-claims')),
    getReturnRequests: () => unwrapList(apiClient.get('/manufacturing/ai-support/return-requests')),
    createReturnRequest: (data) => unwrapData(apiClient.post('/manufacturing/ai-support/return-requests', data)),
    getReturnRequest: (requestId) => unwrapData(apiClient.get(`/manufacturing/ai-support/return-requests/${requestId}`)),
    getRepairRequests: () => unwrapList(apiClient.get('/manufacturing/ai-support/repair-requests')),
    createRepairRequest: (data) => unwrapData(apiClient.post('/manufacturing/ai-support/repair-requests', data)),
    getActivityLogs: () => unwrapList(apiClient.get('/manufacturing/ai-support/activity-logs'))
  }
};

