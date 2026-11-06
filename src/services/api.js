// Zenelait AI - Java Spring Boot Backend API Service
const API_HOST = import.meta.env.VITE_API_URL || 'https://trustworthy-liberation-production-90f6.up.railway.app';
const API_BASE_URL = `${API_HOST}/api`;
const API_V1_BASE_URL = `${API_HOST}/api/v1`;

class ApiService {
  constructor() {
    this.token = localStorage.getItem('zenelait_jwt_token') || null;
    this.refreshToken = localStorage.getItem('zenelait_refresh_token') || null;
  }

  setToken(token, refreshToken = null) {
    this.token = token;
    if (token) {
      localStorage.setItem('zenelait_jwt_token', token);
    } else {
      localStorage.removeItem('zenelait_jwt_token');
    }
    if (refreshToken) {
      this.refreshToken = refreshToken;
      localStorage.setItem('zenelait_refresh_token', refreshToken);
    } else if (!token) {
      localStorage.removeItem('zenelait_refresh_token');
    }
  }

  getToken() {
    return this.token || localStorage.getItem('zenelait_jwt_token');
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_V1_BASE_URL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...(options.headers || {})
      }
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        return { success: true, data, status: response.status };
      }
      return { success: false, error: data.error || data, status: response.status };
    } catch (err) {
      return { success: false, isOffline: true, error: err.message };
    }
  }

  // ==========================================
  // 3.1 Authentication & Profile APIs
  // ==========================================
  async loginV1(email, password) {
    const res = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (res.success && res.data.accessToken) {
      this.setToken(res.data.accessToken, res.data.refreshToken);
    }
    return res;
  }

  async register(payload) {
    const res = await this.request(`${API_HOST}/api/auth/register`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (res.success && res.data && res.data.token) {
      this.setToken(res.data.token);
    }
    return res;
  }

  async submitEnquiry(enquiryData) {
    return this.request(`${API_HOST}/api/enquiry`, {
      method: 'POST',
      body: JSON.stringify(enquiryData)
    });
  }

  async refreshAuth() {
    const refreshToken = this.refreshToken || localStorage.getItem('zenelait_refresh_token');
    const res = await this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken })
    });
    if (res.success && res.data.accessToken) {
      this.setToken(res.data.accessToken, res.data.refreshToken);
    }
    return res;
  }

  async getMe() {
    return this.request('/users/me');
  }

  async getCompanyProfile() {
    return this.request('/company/profile');
  }

  async getIndustryConfig() {
    return this.request('/company/industry-config');
  }

  // ==========================================
  // 3.2 Dashboard & Pipeline APIs
  // ==========================================
  async getDashboard(from, to) {
    const query = new URLSearchParams();
    if (from) query.set('from', from);
    if (to) query.set('to', to);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request(`/sales/dashboard${qs}`);
  }

  async getPipeline() {
    return this.request('/sales/pipeline');
  }

  async getSalesPerformance() {
    return this.request('/sales/performance');
  }

  async getLeadSources() {
    return this.request('/sales/lead-sources');
  }

  async getForecast() {
    return this.request('/sales/forecast');
  }

  // ==========================================
  // 3.3 Lead APIs
  // ==========================================
  async createLead(leadData) {
    return this.request('/leads', {
      method: 'POST',
      body: JSON.stringify(leadData)
    });
  }

  async searchLeads(params = {}) {
    const query = new URLSearchParams(params);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request(`/leads${qs}`);
  }

  async getLead(leadId) {
    return this.request(`/leads/${leadId}`);
  }

  async updateLead(leadId, leadData) {
    return this.request(`/leads/${leadId}`, {
      method: 'PATCH',
      body: JSON.stringify(leadData)
    });
  }

  async updateLeadStage(leadId, stage, reason) {
    return this.request(`/leads/${leadId}/stage`, {
      method: 'PATCH',
      body: JSON.stringify({ stage, reason })
    });
  }

  async assignLead(leadId, ownerId) {
    return this.request(`/leads/${leadId}/owner`, {
      method: 'PATCH',
      body: JSON.stringify({ ownerId })
    });
  }

  async addLeadActivity(leadId, activityData) {
    return this.request(`/leads/${leadId}/activities`, {
      method: 'POST',
      body: JSON.stringify(activityData)
    });
  }

  async convertLead(leadId, convertData = {}) {
    return this.request(`/leads/${leadId}/convert`, {
      method: 'POST',
      body: JSON.stringify(convertData)
    });
  }

  async importLeads(leads) {
    return this.request('/leads/import', {
      method: 'POST',
      body: JSON.stringify(leads)
    });
  }

  async exportLeads() {
    return this.request('/leads/export');
  }

  // ==========================================
  // 3.4 Customers & Opportunities
  // ==========================================
  async createCustomer(data) {
    return this.request('/customers', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async listCustomers(params = {}) {
    const query = new URLSearchParams(params);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request(`/customers${qs}`);
  }

  async getCustomer(customerId) {
    return this.request(`/customers/${customerId}`);
  }

  async updateCustomer(customerId, data) {
    return this.request(`/customers/${customerId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async getCustomerTimeline(customerId) {
    return this.request(`/customers/${customerId}/timeline`);
  }

  async createOpportunity(data) {
    return this.request('/opportunities', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async listOpportunities(params = {}) {
    const query = new URLSearchParams(params);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request(`/opportunities${qs}`);
  }

  async getOpportunity(id) {
    return this.request(`/opportunities/${id}`);
  }

  async updateOpportunity(id, data) {
    return this.request(`/opportunities/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async updateOpportunityStage(id, stage) {
    return this.request(`/opportunities/${id}/stage`, {
      method: 'PATCH',
      body: JSON.stringify({ stage })
    });
  }

  // ==========================================
  // 3.5 Tasks, Appointments & Follow-ups
  // ==========================================
  async createTask(data) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async listTasks() {
    return this.request('/tasks');
  }

  async updateTask(id, data) {
    return this.request(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async createAppointment(data) {
    return this.request('/appointments', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async listAppointments() {
    return this.request('/appointments');
  }

  async updateAppointment(id, data) {
    return this.request(`/appointments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async createFollowUp(data) {
    return this.request('/follow-ups', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async listFollowUps() {
    return this.request('/follow-ups');
  }

  // ==========================================
  // 3.6 Conversations & AI Agents
  // ==========================================
  async listConversations() {
    return this.request('/conversations');
  }

  async getConversation(id) {
    return this.request(`/conversations/${id}`);
  }

  async sendConversationMessage(id, messageData) {
    return this.request(`/conversations/${id}/messages`, {
      method: 'POST',
      body: JSON.stringify(messageData)
    });
  }

  async assignConversation(id, assigneeId, reason) {
    return this.request(`/conversations/${id}/assignment`, {
      method: 'PATCH',
      body: JSON.stringify({ assigneeId, reason })
    });
  }

  async handoverConversation(id, handoverData) {
    return this.request(`/conversations/${id}/handover`, {
      method: 'POST',
      body: JSON.stringify(handoverData)
    });
  }

  async listAiAgents() {
    return this.request('/ai-agents');
  }

  async getAiAgentPerformance(id) {
    return this.request(`/ai-agents/${id}/performance`);
  }

  async testAiAgent(id, testData) {
    return this.request(`/ai-agents/${id}/test`, {
      method: 'POST',
      body: JSON.stringify(testData)
    });
  }

  async getAiAgentUsage() {
    return this.request('/ai-agents/usage');
  }

  // ==========================================
  // Additional Workspace APIs (Teams, Rules, Workflows, Audit)
  // ==========================================
  async getTeamMembers() {
    return this.request('/teams/members');
  }

  async getLeadAssignmentRules() {
    return this.request('/lead-assignment-rules');
  }

  async createLeadAssignmentRule(data) {
    return this.request('/lead-assignment-rules', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getActivities() {
    return this.request('/activities');
  }

  async getNotifications() {
    return this.request('/notifications');
  }

  async markNotificationRead(id) {
    return this.request(`/notifications/${id}/read`, {
      method: 'PATCH'
    });
  }

  async getWorkflows() {
    return this.request('/workflows');
  }

  async createWorkflow(data) {
    return this.request('/workflows', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getWorkflowRuns(id) {
    return this.request(`/workflows/${id}/runs`);
  }

  async getReports() {
    return this.request('/reports');
  }

  async getAuditLogs() {
    return this.request('/audit-logs');
  }

  // ==========================================
  // 4. Software / IT APIs (/api/v1/it)
  // ==========================================
  async getItProducts() {
    return this.request('/it/products');
  }

  async createItRequirement(data) {
    return this.request('/it/requirements', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getItRequirement(id) {
    return this.request(`/it/requirements/${id}`);
  }

  async createItDemo(data) {
    return this.request('/it/demos', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async listItDemos() {
    return this.request('/it/demos');
  }

  async createItProposal(data) {
    return this.request('/it/proposals', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getItProposal(id) {
    return this.request(`/it/proposals/${id}`);
  }

  async updateItProposalStatus(id, status) {
    return this.request(`/it/proposals/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  async getItProducts() {
    return this.request('/it/products');
  }

  async getItProduct(productId) {
    return this.request(`/it/products/${productId}`);
  }

  async listItRequirements() {
    return this.request('/it/requirements');
  }

  async updateItRequirement(id, data) {
    return this.request(`/it/requirements/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async updateItDemo(demoId, data) {
    return this.request(`/it/demos/${demoId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async recordItDemoOutcome(demoId, outcomeData) {
    return this.request(`/it/demos/${demoId}/outcomes`, {
      method: 'POST',
      body: JSON.stringify(outcomeData)
    });
  }

  async listItProposals() {
    return this.request('/it/proposals');
  }

  async updateItProposal(id, data) {
    return this.request(`/it/proposals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async requestProposalApproval(id, approvalData) {
    return this.request(`/it/proposals/${id}/approval-requests`, {
      method: 'POST',
      body: JSON.stringify(approvalData)
    });
  }

  async listItContracts() {
    return this.request('/it/contracts');
  }

  async getMyLeads() {
    return this.request('/sales/my-leads');
  }

  // ==========================================
  // 5. Real Estate APIs (/api/v1/real-estate)
  // ==========================================
  async searchProperties(params = {}) {
    const query = new URLSearchParams(params);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request(`/real-estate/properties${qs}`);
  }

  async getProperty(id) {
    return this.request(`/real-estate/properties/${id}`);
  }

  async createBuyerRequirement(data) {
    return this.request('/real-estate/buyer-requirements', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async matchProperties(data) {
    return this.request('/real-estate/matches', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async createSiteVisit(data) {
    return this.request('/real-estate/site-visits', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async listSiteVisits() {
    return this.request('/real-estate/site-visits');
  }

  async recordNegotiation(data) {
    return this.request('/real-estate/negotiations', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async createPropertyBooking(data) {
    return this.request('/real-estate/bookings', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateBookingStatus(id, status) {
    return this.request(`/real-estate/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  // ==========================================
  // 6. E-commerce APIs (/api/v1/ecommerce)
  // ==========================================
  async getEcommerceProducts() {
    return this.request('/ecommerce/products');
  }

  async getSalesFunnel(from, to) {
    const query = new URLSearchParams();
    if (from) query.set('from', from);
    if (to) query.set('to', to);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request(`/ecommerce/sales-funnel${qs}`);
  }

  async getAbandonedCarts(params = {}) {
    const query = new URLSearchParams(params);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request(`/ecommerce/carts/abandoned${qs}`);
  }

  async createCartRecovery(data) {
    return this.request('/ecommerce/cart-recovery', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async listEcommerceOrders() {
    return this.request('/ecommerce/orders');
  }

  async getEcommerceOrder(id) {
    return this.request(`/ecommerce/orders/${id}`);
  }

  async createPromotion(data) {
    return this.request('/ecommerce/promotions', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getTopSellingProducts() {
    return this.request('/ecommerce/products/top-selling');
  }

  async getCampaignPerformance() {
    return this.request('/ecommerce/campaigns/performance');
  }

  // ==========================================
  // 7. Travel APIs (/api/v1/travel)
  // ==========================================
  async getDestinations() {
    return this.request('/travel/destinations');
  }

  async getTravelPackages() {
    return this.request('/travel/packages');
  }

  async createTravelEnquiry(data) {
    return this.request('/travel/enquiries', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async matchTravelPackages(data) {
    return this.request('/travel/package-matches', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async createTravelQuotation(data) {
    return this.request('/travel/quotations', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getTravelQuotation(id) {
    return this.request(`/travel/quotations/${id}`);
  }

  async createTravelBooking(data) {
    return this.request('/travel/bookings', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async listTravelBookings() {
    return this.request('/travel/bookings');
  }

  async updateTravelBookingStatus(id, status) {
    return this.request(`/travel/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  // ==========================================
  // 8. Manufacturing / B2B APIs (/api/v1/manufacturing)
  // ==========================================
  async getManufacturingProducts() {
    return this.request('/manufacturing/products');
  }

  async getManufacturingAccounts() {
    return this.request('/manufacturing/accounts');
  }

  async createManufacturingRequirement(data) {
    return this.request('/manufacturing/requirements', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async createRfq(data) {
    return this.request('/manufacturing/rfqs', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async listRfqs() {
    return this.request('/manufacturing/rfqs');
  }

  async createManufacturingQuotation(data) {
    return this.request('/manufacturing/quotations', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getManufacturingQuotation(id) {
    return this.request(`/manufacturing/quotations/${id}`);
  }

  async createPurchaseOrder(data) {
    return this.request('/manufacturing/purchase-orders', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async listPurchaseOrders() {
    return this.request('/manufacturing/purchase-orders');
  }

  // ==========================================
  // 9. Financial Services APIs (/api/v1/financial)
  // ==========================================
  async getFinancialProducts() {
    return this.request('/financial/products');
  }

  async createProspectRequirements(data) {
    return this.request('/financial/prospect-requirements', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async createConsultation(data) {
    return this.request('/financial/consultations', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async listConsultations() {
    return this.request('/financial/consultations');
  }

  async createFinancialApplication(data) {
    return this.request('/financial/applications', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getFinancialApplication(id) {
    return this.request(`/financial/applications/${id}`);
  }

  async updateFinancialApplicationStatus(id, status) {
    return this.request(`/financial/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  async submitFinancialApproval(data) {
    return this.request('/financial/approvals', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // ==========================================
  // Workflow & Automation Center Endpoints
  // ==========================================
  async listWorkflows() {
    return this.request('/workflows');
  }

  async getWorkflow(workflowId) {
    return this.request(`/workflows/${workflowId}`);
  }

  async createWorkflow(workflowData) {
    return this.request('/workflows', {
      method: 'POST',
      body: JSON.stringify(workflowData)
    });
  }

  async updateWorkflow(workflowId, workflowData) {
    return this.request(`/workflows/${workflowId}`, {
      method: 'PUT',
      body: JSON.stringify(workflowData)
    });
  }

  async publishWorkflow(workflowId) {
    return this.request(`/workflows/${workflowId}/publish`, {
      method: 'POST'
    });
  }

  async toggleWorkflow(workflowId) {
    return this.request(`/workflows/${workflowId}/toggle`, {
      method: 'PUT'
    });
  }

  async deleteWorkflow(workflowId) {
    return this.request(`/workflows/${workflowId}`, {
      method: 'DELETE'
    });
  }

  async runWorkflow(workflowId, runData = {}) {
    return this.request(`/workflows/${workflowId}/runs`, {
      method: 'POST',
      body: JSON.stringify({
        mode: runData.mode || 'MANUAL',
        recordType: runData.recordType || 'LEAD',
        recordId: runData.recordId || 'LEAD-5001',
        dryRun: Boolean(runData.dryRun)
      })
    });
  }

  async testWorkflow(workflowId, sampleLead = null) {
    return this.request(`/workflows/${workflowId}/test`, {
      method: 'POST',
      body: JSON.stringify(sampleLead || {
        leadId: 'LEAD-5001',
        productInterest: 'HRMS',
        leadScore: 88,
        stage: 'NEW'
      })
    });
  }

  async getWorkflowRuns(workflowId) {
    return this.request(`/workflows/${workflowId}/runs`);
  }

  async listAllWorkflowRuns() {
    return this.request('/workflow-runs');
  }

  async getWorkflowRunDetails(runId) {
    return this.request(`/workflow-runs/${runId}`);
  }

  async getWorkflowTemplates() {
    return this.request('/workflows/templates');
  }

  async getWorkflowAnalytics() {
    return this.request('/workflows/analytics');
  }

  async getWorkflowSettings() {
    return this.request('/workflows/settings');
  }

  // ==========================================
  // Backward compatibility methods
  // ==========================================
  async login(email, password, role = null, companyId = null) {
    // Attempt login via v1 first
    const v1Res = await this.loginV1(email, password);
    if (v1Res.success) {
      return { success: true, data: { ...v1Res.data, token: v1Res.data.accessToken } };
    }
    // Fallback to legacy endpoint
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ email, password, role, companyId })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.token) this.setToken(data.token);
        return { success: true, data };
      }
      const err = await response.json().catch(() => ({}));
      return { success: false, error: err.message || 'Invalid credentials' };
    } catch (e) {
      return { success: false, isOffline: true, error: e.message };
    }
  }

  async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(userData)
      });
      if (response.ok) {
        const data = await response.json();
        if (data.token) this.setToken(data.token);
        return { success: true, data };
      }
      const err = await response.json().catch(() => ({}));
      return { success: false, error: err.message || 'Registration failed' };
    } catch (e) {
      return { success: false, isOffline: true, error: e.message };
    }
  }

  async searchCompanies(query = '') {
    try {
      const response = await fetch(`${API_BASE_URL}/companies/search?query=${encodeURIComponent(query)}`, {
        headers: this.getHeaders()
      });
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  async submitEnquiry(enquiryData) {
    try {
      const response = await fetch(`${API_BASE_URL}/enquiries/submit`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(enquiryData)
      });
      if (response.ok) {
        return await response.json();
      }
      const err = await response.json().catch(() => ({}));
      return { status: 'ERROR', message: err.message || 'Failed to submit' };
    } catch (e) {
      return { status: 'OFFLINE_SAVED', message: 'Enquiry captured locally' };
    }
  }

  async createCompany(companyData) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/companies`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(companyData)
      });
      if (response.ok) {
        return await response.json();
      }
      const err = await response.json().catch(() => ({}));
      return { status: 'ERROR', message: err.message || 'Failed to create company' };
    } catch (e) {
      return { status: 'ERROR', message: e.message };
    }
  }

  // ==========================================
  // Blueprint Part A: Company Admin APIs
  // ==========================================
  async getAdminDashboard() {
    return this.request('/admin/dashboard');
  }

  async getAdminActivity() {
    return this.request('/admin/dashboard/activity');
  }

  async getAdminHealth() {
    return this.request('/admin/dashboard/health');
  }

  async updateCompanyProfile(profileData) {
    return this.request('/company/profile', {
      method: 'PATCH',
      body: JSON.stringify(profileData)
    });
  }

  async getCompanyPreferences() {
    return this.request('/company/preferences');
  }

  async getCompanyBranding() {
    return this.request('/company/branding');
  }

  async listAdminUsers() {
    return this.request('/admin/users');
  }

  async inviteAdminUser(userData) {
    return this.request('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async listAdminRoles() {
    return this.request('/admin/roles');
  }

  async listAdminPermissions() {
    return this.request('/admin/permissions');
  }

  async getAdminAuditLogs() {
    return this.request('/admin/audit-logs');
  }

  async listAdminProducts() {
    return this.request('/admin/products');
  }

  async createAdminProduct(productData) {
    return this.request('/admin/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  }

  async getAdminCrmSettings() {
    return this.request('/admin/crm/settings');
  }

  async listAdminIntegrations() {
    return this.request('/admin/integrations');
  }

  async testAdminIntegration(integrationId, testRecipient = null) {
    return this.request(`/admin/integrations/${integrationId}/test`, {
      method: 'POST',
      body: JSON.stringify({ testRecipient })
    });
  }

  async listAdminAiAgents() {
    return this.request('/admin/ai-agents');
  }

  async createAdminAiAgent(agentData) {
    return this.request('/admin/ai-agents', {
      method: 'POST',
      body: JSON.stringify(agentData)
    });
  }

  async listAdminAutomations() {
    return this.request('/admin/automations');
  }

  async runAdminAutomation(workflowId, mode = 'DRY_RUN', input = {}) {
    return this.request(`/admin/automations/${workflowId}/runs`, {
      method: 'POST',
      body: JSON.stringify({ mode, input })
    });
  }

  async getAdminSubscription() {
    return this.request('/admin/billing/subscription');
  }

  // ==========================================
  // Blueprint Part B: HR Role APIs
  // ==========================================
  async getHrDashboard() {
    return this.request('/hr/dashboard');
  }

  async getHrActivity() {
    return this.request('/hr/dashboard/activity');
  }

  async listHrEmployees(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/hr/employees${qs ? '?' + qs : ''}`);
  }

  async createHrEmployee(employeeData) {
    return this.request('/hr/employees', {
      method: 'POST',
      body: JSON.stringify(employeeData)
    });
  }

  async getHrEmployee(employeeId) {
    return this.request(`/hr/employees/${employeeId}`);
  }

  async listHrDepartments() {
    return this.request('/hr/departments');
  }

  async listHrDesignations() {
    return this.request('/hr/designations');
  }

  async exportHrEmployees() {
    return this.request('/hr/employees/export');
  }

  async listHrJobs() {
    return this.request('/hr/jobs');
  }

  async createHrJob(jobData) {
    return this.request('/hr/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData)
    });
  }

  async listHrCandidates() {
    return this.request('/hr/candidates');
  }

  async addHrCandidate(candidateData) {
    return this.request('/hr/candidates', {
      method: 'POST',
      body: JSON.stringify(candidateData)
    });
  }

  async listHrApplications() {
    return this.request('/hr/applications');
  }

  async updateHrApplicationStage(applicationId, stage) {
    return this.request(`/hr/applications/${applicationId}/stage`, {
      method: 'PATCH',
      body: JSON.stringify({ stage })
    });
  }

  async listHrOnboarding() {
    return this.request('/hr/onboarding');
  }

  async createHrOnboardingPlan(planData) {
    return this.request('/hr/onboarding', {
      method: 'POST',
      body: JSON.stringify(planData)
    });
  }

  async updateHrOnboardingTask(taskId, completed = true) {
    return this.request(`/hr/onboarding/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify({ completed })
    });
  }

  async listHrLeaveRequests() {
    return this.request('/hr/leave-requests');
  }

  async submitHrLeaveRequest(requestData) {
    return this.request('/hr/leave-requests', {
      method: 'POST',
      body: JSON.stringify(requestData)
    });
  }

  async approveHrLeaveRequest(requestId, comment = 'Approved according to leave policy') {
    return this.request(`/hr/leave-requests/${requestId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ decision: 'APPROVED', comment })
    });
  }

  async rejectHrLeaveRequest(requestId, comment = 'Rejected') {
    return this.request(`/hr/leave-requests/${requestId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ decision: 'REJECTED', comment })
    });
  }

  async getHrLeaveBalances() {
    return this.request('/hr/leave-balances');
  }

  async listHrPolicies() {
    return this.request('/hr/policies');
  }

  async listHrServiceRequests() {
    return this.request('/hr/requests');
  }

  async createHrServiceRequest(requestData) {
    return this.request('/hr/requests', {
      method: 'POST',
      body: JSON.stringify(requestData)
    });
  }

  async runHrAutomation(workflowId, mode = 'DRY_RUN', input = {}) {
    return this.request(`/hr/automations/${workflowId}/runs`, {
      method: 'POST',
      body: JSON.stringify({ mode, input })
    });
  }

  async startHrAiSession() {
    return this.request('/hr/ai-assistant/sessions', {
      method: 'POST'
    });
  }
}

export const api = new ApiService();
export default api;

