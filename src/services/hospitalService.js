import { apiClient } from './apiClient';

/**
 * Zenelait AI CRM — Hospital/Clinic Tenant API Service
 * Comprehensive implementation of all 93 REST APIs across 4 Role-Based Modules:
 * 1. Reception Manager (/api/v1/hospital/reception-manager/*) - 21 endpoints
 * 2. Receptionist (/api/v1/hospital/receptionist/*) - 20 endpoints
 * 3. Customer Support (/api/v1/hospital/customer-support/*) - 24 endpoints
 * 4. Appointment Coordinator (/api/v1/hospital/appointment-coordinator/*) - 28 endpoints
 */

export const hospitalService = {
  // =========================================================================
  // 1. RECEPTION MANAGER APIS (21 Endpoints)
  // Base Path: /api/v1/hospital/reception-manager
  // =========================================================================
  receptionManager: {
    getDashboard: () => apiClient.get('/hospital/reception-manager/dashboard'),
    getStaff: (params) => apiClient.get('/hospital/reception-manager/staff', { params }),
    createStaff: (data) => apiClient.post('/hospital/reception-manager/staff', data),
    getStaffDetails: (staffId) => apiClient.get(`/hospital/reception-manager/staff/${staffId}`),
    updateStaff: (staffId, data) => apiClient.patch(`/hospital/reception-manager/staff/${staffId}`, data),
    updateStaffStatus: (staffId, status) => apiClient.patch(`/hospital/reception-manager/staff/${staffId}/status`, { status }),
    getWorkAssignments: (params) => apiClient.get('/hospital/reception-manager/work-assignments', { params }),
    createWorkAssignment: (data) => apiClient.post('/hospital/reception-manager/work-assignments', data),
    updateWorkAssignment: (asgnId, data) => apiClient.patch(`/hospital/reception-manager/work-assignments/${asgnId}`, data),
    getPatientEnquiries: (params) => apiClient.get('/hospital/reception-manager/patient-enquiries', { params }),
    getPatientEnquiry: (enquiryId) => apiClient.get(`/hospital/reception-manager/patient-enquiries/${enquiryId}`),
    assignEnquiry: (enquiryId, data) => apiClient.patch(`/hospital/reception-manager/patient-enquiries/${enquiryId}/assign`, data),
    updateEnquiryPriority: (enquiryId, data) => apiClient.patch(`/hospital/reception-manager/patient-enquiries/${enquiryId}/priority`, data),
    getQueue: (params) => apiClient.get('/hospital/reception-manager/queue', { params }),
    getEscalations: (params) => apiClient.get('/hospital/reception-manager/escalations', { params }),
    createEscalation: (data) => apiClient.post('/hospital/reception-manager/escalations', data),
    updateEscalation: (escId, data) => apiClient.patch(`/hospital/reception-manager/escalations/${escId}`, data),
    getAiConfig: () => apiClient.get('/hospital/reception-manager/ai-config'),
    updateAiConfig: (data) => apiClient.patch('/hospital/reception-manager/ai-config', data),
    getPerformanceReport: (params) => apiClient.get('/hospital/reception-manager/reports/performance', { params }),
    getAuditEvents: (params) => apiClient.get('/hospital/reception-manager/audit-events', { params }),
  },

  // =========================================================================
  // 2. RECEPTIONIST APIS (20 Endpoints)
  // Base Path: /api/v1/hospital/receptionist
  // =========================================================================
  receptionist: {
    getDashboard: () => apiClient.get('/hospital/receptionist/dashboard'),
    searchPatients: (params) => apiClient.get('/hospital/receptionist/patients', { params }),
    registerPatient: (data) => apiClient.post('/hospital/receptionist/patients', data),
    getPatient: (patientId) => apiClient.get(`/hospital/receptionist/patients/${patientId}`),
    updatePatient: (patientId, data) => apiClient.patch(`/hospital/receptionist/patients/${patientId}`, data),
    getTodayAppointments: (params) => apiClient.get('/hospital/receptionist/appointments/today', { params }),
    getAppointment: (appointmentId) => apiClient.get(`/hospital/receptionist/appointments/${appointmentId}`),
    checkInPatient: (appointmentId, data) => apiClient.post(`/hospital/receptionist/appointments/${appointmentId}/check-in`, data),
    requestCancellation: (appointmentId, data) => apiClient.post(`/hospital/receptionist/appointments/${appointmentId}/cancel-request`, data),
    requestReschedule: (appointmentId, data) => apiClient.post(`/hospital/receptionist/appointments/${appointmentId}/reschedule-request`, data),
    getQueue: (params) => apiClient.get('/hospital/receptionist/queue', { params }),
    registerWalkIn: (data) => apiClient.post('/hospital/receptionist/queue/walk-ins', data),
    updateQueueStatus: (queueEntryId, data) => apiClient.patch(`/hospital/receptionist/queue/${queueEntryId}/status`, data),
    getEnquiries: (params) => apiClient.get('/hospital/receptionist/enquiries', { params }),
    createEnquiry: (data) => apiClient.post('/hospital/receptionist/enquiries', data),
    getEnquiry: (enquiryId) => apiClient.get(`/hospital/receptionist/enquiries/${enquiryId}`),
    addEnquiryNote: (enquiryId, data) => apiClient.post(`/hospital/receptionist/enquiries/${enquiryId}/notes`, data),
    handoffEnquiry: (enquiryId, data) => apiClient.post(`/hospital/receptionist/enquiries/${enquiryId}/handoff`, data),
    getTasks: () => apiClient.get('/hospital/receptionist/tasks'),
    updateTaskStatus: (taskId, status) => apiClient.patch(`/hospital/receptionist/tasks/${taskId}/status`, { status }),
  },

  // =========================================================================
  // 3. CUSTOMER SUPPORT APIS (24 Endpoints)
  // Base Path: /api/v1/hospital/customer-support
  // =========================================================================
  customerSupport: {
    getDashboard: () => apiClient.get('/hospital/customer-support/dashboard'),
    getTickets: (params) => apiClient.get('/hospital/customer-support/tickets', { params }),
    createTicket: (data) => apiClient.post('/hospital/customer-support/tickets', data),
    getTicket: (ticketId) => apiClient.get(`/hospital/customer-support/tickets/${ticketId}`),
    updateTicket: (ticketId, data) => apiClient.patch(`/hospital/customer-support/tickets/${ticketId}`, data),
    assignTicket: (ticketId, data) => apiClient.patch(`/hospital/customer-support/tickets/${ticketId}/assign`, data),
    updateTicketStatus: (ticketId, data) => apiClient.patch(`/hospital/customer-support/tickets/${ticketId}/status`, data),
    addTicketMessage: (ticketId, data) => apiClient.post(`/hospital/customer-support/tickets/${ticketId}/messages`, data),
    getTicketMessages: (ticketId) => apiClient.get(`/hospital/customer-support/tickets/${ticketId}/messages`),
    addTicketNote: (ticketId, data) => apiClient.post(`/hospital/customer-support/tickets/${ticketId}/notes`, data),
    escalateTicket: (ticketId, data) => apiClient.post(`/hospital/customer-support/tickets/${ticketId}/escalate`, data),
    handoffTicket: (ticketId, data) => apiClient.post(`/hospital/customer-support/tickets/${ticketId}/handoff`, data),
    createConversation: (data) => apiClient.post('/hospital/customer-support/conversations', data),
    getConversations: () => apiClient.get('/hospital/customer-support/conversations'),
    getConversation: (conversationId) => apiClient.get(`/hospital/customer-support/conversations/${conversationId}`),
    sendConversationMessage: (conversationId, data) => apiClient.post(`/hospital/customer-support/conversations/${conversationId}/messages`, data),
    generateAiDraft: (data) => apiClient.post('/hospital/customer-support/ai/reply-drafts', data),
    approveAiDraft: (draftId, data) => apiClient.post(`/hospital/customer-support/ai/reply-drafts/${draftId}/approve`, data),
    sendApprovedDraft: (draftId, data, idempotencyKey) => apiClient.post(`/hospital/customer-support/ai/reply-drafts/${draftId}/send`, data, {
      headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}
    }),
    getKnowledgeArticles: (params) => apiClient.get('/hospital/customer-support/knowledge/articles', { params }),
    getFollowUpTasks: () => apiClient.get('/hospital/customer-support/follow-up-tasks'),
    createFollowUpTask: (data) => apiClient.post('/hospital/customer-support/follow-up-tasks', data),
    updateFollowUpTask: (taskId, data) => apiClient.patch(`/hospital/customer-support/follow-up-tasks/${taskId}`, data),
    getMetrics: (params) => apiClient.get('/hospital/customer-support/metrics', { params }),
  },

  // =========================================================================
  // 4. APPOINTMENT COORDINATOR APIS (28 Endpoints)
  // Base Path: /api/v1/hospital/appointment-coordinator
  // =========================================================================
  appointmentCoordinator: {
    getDashboard: () => apiClient.get('/hospital/appointment-coordinator/dashboard'),
    getDoctors: (params) => apiClient.get('/hospital/appointment-coordinator/doctors', { params }),
    getDepartments: () => apiClient.get('/hospital/appointment-coordinator/departments'),
    getAvailability: (params) => apiClient.get('/hospital/appointment-coordinator/availability', { params }),
    getAppointments: (params) => apiClient.get('/hospital/appointment-coordinator/appointments', { params }),
    createAppointment: (data, idempotencyKey) => apiClient.post('/hospital/appointment-coordinator/appointments', data, {
      headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}
    }),
    getAppointment: (appointmentId) => apiClient.get(`/hospital/appointment-coordinator/appointments/${appointmentId}`),
    updateAppointment: (appointmentId, data) => apiClient.patch(`/hospital/appointment-coordinator/appointments/${appointmentId}`, data),
    confirmAppointment: (appointmentId, data) => apiClient.post(`/hospital/appointment-coordinator/appointments/${appointmentId}/confirm`, data),
    rescheduleAppointment: (appointmentId, data, idempotencyKey) => apiClient.post(`/hospital/appointment-coordinator/appointments/${appointmentId}/reschedule`, data, {
      headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}
    }),
    cancelAppointment: (appointmentId, data) => apiClient.post(`/hospital/appointment-coordinator/appointments/${appointmentId}/cancel`, data),
    getBookingRequests: () => apiClient.get('/hospital/appointment-coordinator/booking-requests'),
    createBookingRequest: (data) => apiClient.post('/hospital/appointment-coordinator/booking-requests', data),
    approveBookingRequest: (requestId) => apiClient.post(`/hospital/appointment-coordinator/booking-requests/${requestId}/approve`, {}),
    rejectBookingRequest: (requestId, data) => apiClient.post(`/hospital/appointment-coordinator/booking-requests/${requestId}/reject`, data),
    getRescheduleRequests: () => apiClient.get('/hospital/appointment-coordinator/reschedule-requests'),
    approveRescheduleRequest: (requestId, data) => apiClient.post(`/hospital/appointment-coordinator/reschedule-requests/${requestId}/approve`, data),
    rejectRescheduleRequest: (requestId, data) => apiClient.post(`/hospital/appointment-coordinator/reschedule-requests/${requestId}/reject`, data),
    getCancellationRequests: () => apiClient.get('/hospital/appointment-coordinator/cancellation-requests'),
    approveCancellationRequest: (requestId) => apiClient.post(`/hospital/appointment-coordinator/cancellation-requests/${requestId}/approve`, {}),
    getWaitingList: () => apiClient.get('/hospital/appointment-coordinator/waiting-list'),
    addToWaitingList: (data) => apiClient.post('/hospital/appointment-coordinator/waiting-list', data),
    removeWaitingListEntry: (entryId) => apiClient.delete(`/hospital/appointment-coordinator/waiting-list/${entryId}`),
    offerSlot: (entryId, data) => apiClient.post(`/hospital/appointment-coordinator/waiting-list/${entryId}/offer-slot`, data),
    getReminders: () => apiClient.get('/hospital/appointment-coordinator/reminders'),
    scheduleReminder: (data) => apiClient.post('/hospital/appointment-coordinator/reminders', data),
    cancelReminder: (reminderId) => apiClient.post(`/hospital/appointment-coordinator/reminders/${reminderId}/cancel`, {}),
    getMetrics: (params) => apiClient.get('/hospital/appointment-coordinator/metrics', { params }),
  },

  // =========================================================================
  // Hospital Company Admin Legacy Operations
  // =========================================================================
  getSettings: () => apiClient.get('/admin/hospital/settings'),
  updateSettings: (data) => apiClient.patch('/admin/hospital/settings', data),
  getLocations: () => apiClient.get('/admin/hospital/locations'),
  createLocation: (data) => apiClient.post('/admin/hospital/locations', data),
  updateLocation: (id, data) => apiClient.patch(`/admin/hospital/locations/${id}`, data),
  getLocationDepartments: (id) => apiClient.get(`/admin/hospital/locations/${id}/departments`),
  getDepartments: () => apiClient.get('/admin/hospital/departments'),
  getDepartment: (id) => apiClient.get(`/admin/hospital/departments/${id}`),
  createDepartment: (data) => apiClient.post('/admin/hospital/departments', data),
  updateDepartment: (id, data) => apiClient.patch(`/admin/hospital/departments/${id}`, data),
  updateDepartmentStatus: (id, status) => apiClient.patch(`/admin/hospital/departments/${id}/status`, { status }),
  getServices: () => apiClient.get('/admin/hospital/services'),
  getService: (id) => apiClient.get(`/admin/hospital/services/${id}`),
  createService: (data) => apiClient.post('/admin/hospital/services', data),
  updateService: (id, data) => apiClient.patch(`/admin/hospital/services/${id}`, data),
  updateServiceStatus: (id, status) => apiClient.patch(`/admin/hospital/services/${id}/status`, { status }),
  getStaff: () => apiClient.get('/admin/hospital/staff'),
  getStaffMember: (id) => apiClient.get(`/admin/hospital/staff/${id}`),
  createStaff: (data) => apiClient.post('/admin/hospital/staff', data),
  updateStaffMember: (id, data) => apiClient.patch(`/admin/hospital/staff/${id}`, data),
  updateStaffStatus: (id, status) => apiClient.patch(`/admin/hospital/staff/${id}/status`, { status }),
  getStaffSchedules: (staffId) => apiClient.get(`/admin/hospital/staff/${staffId}/schedules`),
  createStaffSchedule: (staffId, data) => apiClient.post(`/admin/hospital/staff/${staffId}/schedules`, data),
  getAllSchedules: () => apiClient.get('/admin/hospital/schedules'),
  updateSchedule: (id, data) => apiClient.patch(`/admin/hospital/schedules/${id}`, data),
  getAppointmentTypes: () => apiClient.get('/admin/hospital/appointment-types'),
  createAppointmentType: (data) => apiClient.post('/admin/hospital/appointment-types', data),
  updateAppointmentType: (id, data) => apiClient.patch(`/admin/hospital/appointment-types/${id}`, data),
  getAppointmentSettings: () => apiClient.get('/admin/hospital/appointment-settings'),
  updateAppointmentSettings: (data) => apiClient.patch('/admin/hospital/appointment-settings', data),
  getAppointmentSlots: () => apiClient.get('/admin/hospital/appointment-slots'),
  createAppointmentSlot: (data) => apiClient.post('/admin/hospital/appointment-slots', data),
  updateAppointmentSlot: (id, data) => apiClient.patch(`/admin/hospital/appointment-slots/${id}`, data),
  getBookingRules: () => apiClient.get('/admin/hospital/booking-rules'),
  createBookingRule: (data) => apiClient.post('/admin/hospital/booking-rules', data),
  getAppointments: () => apiClient.get('/admin/hospital/appointments'),
  getAppointment: (id) => apiClient.get(`/admin/hospital/appointments/${id}`),
  createAppointment: (data) => apiClient.post('/admin/hospital/appointments', data),
  updateAppointment: (id, data) => apiClient.patch(`/admin/hospital/appointments/${id}`, data),
  updateAppointmentStatus: (id, status) => apiClient.patch(`/admin/hospital/appointments/${id}/status`, { status }),
  getReceptionQueue: () => apiClient.get('/admin/hospital/reception-queue'),
  updateReceptionQueue: (queueId, data) => apiClient.patch(`/admin/hospital/reception-queue/${queueId}`, data),
  getPatients: () => apiClient.get('/admin/hospital/patients'),
  getPatient: (id) => apiClient.get(`/admin/hospital/patients/${id}`),
  createPatient: (data) => apiClient.post('/admin/hospital/patients', data),
  updatePatient: (id, data) => apiClient.patch(`/admin/hospital/patients/${id}`, data),
  getPatientAccessPolicies: () => apiClient.get('/admin/hospital/patient-access-policies'),
  updatePatientAccessPolicies: (data) => apiClient.patch('/admin/hospital/patient-access-policies', data),
  getDataRetentionPolicy: () => apiClient.get('/admin/hospital/data-retention-policy'),
  updateDataRetentionPolicy: (data) => apiClient.patch('/admin/hospital/data-retention-policy', data),
  getAppointmentsReport: () => apiClient.get('/admin/reports/appointments'),
  getReceptionReport: () => apiClient.get('/admin/reports/reception'),
  getSupportReport: () => apiClient.get('/admin/reports/support'),
  getStaffSchedulesReport: () => apiClient.get('/admin/reports/staff-schedules'),

  // =========================================================================
  // 5. DOCTOR / STAFF USER APIS (18 Endpoints)
  // Base Path: /api/v1/hospital/staff
  // =========================================================================
  staff: {
    getMyProfile: () => apiClient.get('/hospital/staff/me'),
    updateMyProfile: (data) => apiClient.patch('/hospital/staff/me', data),
    searchDirectory: (params) => apiClient.get('/hospital/staff/directory', { params }),
    getStaffProfile: (staffId) => apiClient.get(`/hospital/staff/directory/${staffId}`),
    getMySchedule: (params) => apiClient.get('/hospital/staff/me/schedule', { params }),
    getMyAvailability: (params) => apiClient.get('/hospital/staff/me/availability', { params }),
    getMyAppointments: (params) => apiClient.get('/hospital/staff/me/appointments', { params }),
    getAssignedAppointment: (appointmentId) => apiClient.get(`/hospital/staff/me/appointments/${appointmentId}`),
    createAvailabilityRule: (data) => apiClient.post('/hospital/staff/me/availability-rules', data),
    updateAvailabilityRule: (ruleId, data) => apiClient.patch(`/hospital/staff/me/availability-rules/${ruleId}`, data),
    deleteAvailabilityRule: (ruleId) => apiClient.delete(`/hospital/staff/me/availability-rules/${ruleId}`),
    getMyTasks: (params) => apiClient.get('/hospital/staff/me/tasks', { params }),
    updateTaskStatus: (taskId, data) => apiClient.patch(`/hospital/staff/me/tasks/${taskId}/status`, data),
    addTaskNote: (taskId, data) => apiClient.post(`/hospital/staff/me/tasks/${taskId}/notes`, data),
    getMyNotifications: (params) => apiClient.get('/hospital/staff/me/notifications', { params }),
    markNotificationRead: (notificationId) => apiClient.patch(`/hospital/staff/me/notifications/${notificationId}/read`),
    searchKnowledge: (params) => apiClient.get('/hospital/staff/knowledge/articles', { params }),
    getMyActivity: (params) => apiClient.get('/hospital/staff/me/activity', { params }),
  },

  // =========================================================================
  // 6. AI RECEPTIONIST APIS (20 Endpoints)
  // Base Path: /api/v1/hospital/ai-receptionist & /api/v1/public/clinic-chat
  // =========================================================================
  aiReceptionist: {
    getConfig: () => apiClient.get('/hospital/ai-receptionist/config'),
    updateConfig: (data) => apiClient.patch('/hospital/ai-receptionist/config', data),
    startSession: (data) => apiClient.post('/hospital/ai-receptionist/sessions', data),
    listSessions: (params) => apiClient.get('/hospital/ai-receptionist/sessions', { params }),
    getSession: (sessionId) => apiClient.get(`/hospital/ai-receptionist/sessions/${sessionId}`),
    sendMessage: (sessionId, data) => apiClient.post(`/hospital/ai-receptionist/sessions/${sessionId}/messages`, data),
    getSessionMessages: (sessionId, params) => apiClient.get(`/hospital/ai-receptionist/sessions/${sessionId}/messages`, { params }),
    submitFeedback: (sessionId, data) => apiClient.post(`/hospital/ai-receptionist/sessions/${sessionId}/feedback`, data),
    createHandoff: (sessionId, data) => apiClient.post(`/hospital/ai-receptionist/sessions/${sessionId}/handoff`, data),
    listHandoffs: (params) => apiClient.get('/hospital/ai-receptionist/handoffs', { params }),
    assignHandoff: (handoffId, data) => apiClient.patch(`/hospital/ai-receptionist/handoffs/${handoffId}/assign`, data),
    updateHandoffStatus: (handoffId, data) => apiClient.patch(`/hospital/ai-receptionist/handoffs/${handoffId}/status`, data),
    listKnowledgeSources: (params) => apiClient.get('/hospital/ai-receptionist/knowledge/sources', { params }),
    registerKnowledgeSource: (data) => apiClient.post('/hospital/ai-receptionist/knowledge/sources', data),
    updateKnowledgeSource: (sourceId, data) => apiClient.patch(`/hospital/ai-receptionist/knowledge/sources/${sourceId}`, data),
    syncKnowledgeSource: (sourceId, data) => apiClient.post(`/hospital/ai-receptionist/knowledge/sources/${sourceId}/sync`, data),
    searchKnowledgeArticles: (params) => apiClient.get('/hospital/ai-receptionist/knowledge/articles', { params }),
    getAnalytics: (params) => apiClient.get('/hospital/ai-receptionist/analytics', { params }),
    getActivity: (params) => apiClient.get('/hospital/ai-receptionist/activity', { params }),
    closeSession: (sessionId, data) => apiClient.post(`/hospital/ai-receptionist/sessions/${sessionId}/close`, data),
  },

  // =========================================================================
  // 7. AI APPOINTMENT AGENT APIS (22 Endpoints)
  // Base Path: /api/v1/hospital/ai-appointment-agent & /api/v1/public/appointment-chat
  // =========================================================================
  aiAppointmentAgent: {
    getConfig: () => apiClient.get('/hospital/ai-appointment-agent/config'),
    updateConfig: (data) => apiClient.patch('/hospital/ai-appointment-agent/config', data),
    startSession: (data) => apiClient.post('/hospital/ai-appointment-agent/sessions', data),
    processMessage: (sessionId, data) => apiClient.post(`/hospital/ai-appointment-agent/sessions/${sessionId}/messages`, data),
    listDepartments: () => apiClient.get('/hospital/ai-appointment-agent/departments'),
    listDoctors: (params) => apiClient.get('/hospital/ai-appointment-agent/doctors', { params }),
    getAvailability: (params) => apiClient.get('/hospital/ai-appointment-agent/availability', { params }),
    createBookingRequest: (data, headers) => apiClient.post('/hospital/ai-appointment-agent/booking-requests', data, { headers }),
    getBookingRequestStatus: (requestId) => apiClient.get(`/hospital/ai-appointment-agent/booking-requests/${requestId}`),
    confirmBookingRequest: (requestId, data) => apiClient.post(`/hospital/ai-appointment-agent/booking-requests/${requestId}/confirm`, data),
    getAppointment: (appointmentId) => apiClient.get(`/hospital/ai-appointment-agent/appointments/${appointmentId}`),
    requestReschedule: (appointmentId, data) => apiClient.post(`/hospital/ai-appointment-agent/appointments/${appointmentId}/reschedule-requests`, data),
    requestCancellation: (appointmentId, data) => apiClient.post(`/hospital/ai-appointment-agent/appointments/${appointmentId}/cancellation-requests`, data),
    scheduleReminder: (appointmentId, data) => apiClient.post(`/hospital/ai-appointment-agent/appointments/${appointmentId}/reminders`, data),
    getReminders: (appointmentId) => apiClient.get(`/hospital/ai-appointment-agent/appointments/${appointmentId}/reminders`),
    joinWaitingList: (data) => apiClient.post('/hospital/ai-appointment-agent/waiting-list', data),
    getWaitingListStatus: (entryId) => apiClient.get(`/hospital/ai-appointment-agent/waiting-list/${entryId}`),
    acceptWaitingListOffer: (entryId, offerId, data) => apiClient.post(`/hospital/ai-appointment-agent/waiting-list/${entryId}/offers/${offerId}/accept`, data),
    createHandoff: (sessionId, data) => apiClient.post(`/hospital/ai-appointment-agent/sessions/${sessionId}/handoff`, data),
    listHandoffs: (params) => apiClient.get('/hospital/ai-appointment-agent/handoffs', { params }),
    getAnalytics: (params) => apiClient.get('/hospital/ai-appointment-agent/analytics', { params }),
    getActivity: (params) => apiClient.get('/hospital/ai-appointment-agent/activity', { params }),
  },

  // Public Chat Endpoints for website visitors
  publicClinicChat: {
    startSession: (data) => apiClient.post('/public/clinic-chat/sessions', data),
    sendMessage: (sessionId, data) => apiClient.post(`/public/clinic-chat/sessions/${sessionId}/messages`, data),
    getMessages: (sessionId, params) => apiClient.get(`/public/clinic-chat/sessions/${sessionId}/messages`, { params }),
    submitFeedback: (sessionId, data) => apiClient.post(`/public/clinic-chat/sessions/${sessionId}/feedback`, data),
    requestHandoff: (sessionId, data) => apiClient.post(`/public/clinic-chat/sessions/${sessionId}/handoff`, data),
    closeSession: (sessionId, data) => apiClient.post(`/public/clinic-chat/sessions/${sessionId}/close`, data),
  },

  publicAppointmentChat: {
    startSession: (data) => apiClient.post('/public/appointment-chat/sessions', data),
    sendMessage: (sessionId, data) => apiClient.post(`/public/appointment-chat/sessions/${sessionId}/messages`, data),
    getDepartments: () => apiClient.get('/public/appointment-chat/departments'),
    getDoctors: (params) => apiClient.get('/public/appointment-chat/doctors', { params }),
    getAvailability: (params) => apiClient.get('/public/appointment-chat/availability', { params }),
    createBookingRequest: (data, headers) => apiClient.post('/public/appointment-chat/booking-requests', data, { headers }),
    getBookingRequestStatus: (requestId) => apiClient.get(`/public/appointment-chat/booking-requests/${requestId}`),
    requestHandoff: (sessionId, data) => apiClient.post(`/public/appointment-chat/sessions/${sessionId}/handoff`, data),
  }
};

