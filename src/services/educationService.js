import { apiClient } from './apiClient';

/**
 * Zenelait AI CRM — Education & Training Tenant API Service
 * Covers:
 * 1. Admission Manager (21 APIs) - /education/admission-manager/*
 * 2. Admission Executive (23 APIs) - /education/admission-executive/*
 * 3. Student Support Agent (20 APIs) - /education/student-support/*
 * 4. Counsellor (24 APIs) - /education/counsellor/*
 * 5. Education Admin & Course Catalogs
 */
export const educationService = {
  // ==========================================
  // ROLE 1: ADMISSION MANAGER (21 APIs)
  // ==========================================
  getAdmissionManagerDashboard: (from = '2026-10-01', to = '2026-10-31') =>
    apiClient.get(`/education/admission-manager/dashboard?from=${from}&to=${to}`),

  getAdmissionManagerEnquiries: (status, page = 0, size = 20) =>
    apiClient.get('/education/admission-manager/enquiries', { status, page, size }),

  getAdmissionManagerEnquiry: (enquiryId) =>
    apiClient.get(`/education/admission-manager/enquiries/${enquiryId}`),

  createAdmissionManagerEnquiry: (data) =>
    apiClient.post('/education/admission-manager/enquiries', data),

  updateAdmissionManagerEnquiry: (enquiryId, data) =>
    apiClient.patch(`/education/admission-manager/enquiries/${enquiryId}`, data),

  assignExecutiveToEnquiry: (enquiryId, data) =>
    apiClient.post(`/education/admission-manager/enquiries/${enquiryId}/assign`, data),

  escalateEnquiry: (enquiryId, data) =>
    apiClient.post(`/education/admission-manager/enquiries/${enquiryId}/escalate`, data),

  getAdmissionManagerApplications: (status, page = 0, size = 10) =>
    apiClient.get('/education/admission-manager/applications', { status, page, size }),

  getAdmissionManagerApplication: (applicationId) =>
    apiClient.get(`/education/admission-manager/applications/${applicationId}`),

  updateApplicationStatus: (applicationId, data) =>
    apiClient.patch(`/education/admission-manager/applications/${applicationId}/status`, data),

  recordApplicationReview: (applicationId, data) =>
    apiClient.post(`/education/admission-manager/applications/${applicationId}/review`, data),

  getAdmissionExecutives: () =>
    apiClient.get('/education/admission-manager/executives'),

  getExecutiveWorkload: (executiveId) =>
    apiClient.get(`/education/admission-manager/executives/${executiveId}/workload`),

  getAdmissionTargets: () =>
    apiClient.get('/education/admission-manager/targets'),

  createAdmissionTarget: (data) =>
    apiClient.post('/education/admission-manager/targets', data),

  updateAdmissionTarget: (targetId, data) =>
    apiClient.patch(`/education/admission-manager/targets/${targetId}`, data),

  getAdmissionsReport: (from = '2026-10-01', to = '2026-10-31') =>
    apiClient.get(`/education/admission-manager/reports/admissions?from=${from}&to=${to}`),

  getConversionReport: (from = '2026-10-01', to = '2026-10-31') =>
    apiClient.get(`/education/admission-manager/reports/conversion?from=${from}&to=${to}`),

  getExecutiveReport: (from = '2026-10-01', to = '2026-10-31') =>
    apiClient.get(`/education/admission-manager/reports/executives?from=${from}&to=${to}`),

  getOverdueFollowUps: () =>
    apiClient.get('/education/admission-manager/follow-ups/overdue'),

  getAiAdmissionActivity: (page = 0, size = 20) =>
    apiClient.get(`/education/admission-manager/ai-activity?page=${page}&size=${size}`),

  // ==========================================
  // ROLE 2: ADMISSION EXECUTIVE (23 APIs)
  // ==========================================
  getAdmissionExecutiveDashboard: () =>
    apiClient.get('/education/admission-executive/dashboard'),

  getAssignedEnquiries: (status, page = 0, size = 20) =>
    apiClient.get('/education/admission-executive/enquiries', { status, page, size }),

  createExecutiveEnquiry: (data) =>
    apiClient.post('/education/admission-executive/enquiries', data),

  getExecutiveEnquiry: (enquiryId) =>
    apiClient.get(`/education/admission-executive/enquiries/${enquiryId}`),

  updateExecutiveEnquiry: (enquiryId, data) =>
    apiClient.patch(`/education/admission-executive/enquiries/${enquiryId}`, data),

  qualifyEnquiry: (enquiryId, data) =>
    apiClient.post(`/education/admission-executive/enquiries/${enquiryId}/qualify`, data),

  recordInteraction: (enquiryId, data) =>
    apiClient.post(`/education/admission-executive/enquiries/${enquiryId}/interactions`, data),

  getInteractions: (enquiryId) =>
    apiClient.get(`/education/admission-executive/enquiries/${enquiryId}/interactions`),

  createFollowUpTask: (enquiryId, data) =>
    apiClient.post(`/education/admission-executive/enquiries/${enquiryId}/follow-ups`, data),

  getMyFollowUps: (status) =>
    apiClient.get('/education/admission-executive/follow-ups', { status }),

  updateFollowUp: (taskId, data) =>
    apiClient.patch(`/education/admission-executive/follow-ups/${taskId}`, data),

  completeFollowUp: (taskId, data) =>
    apiClient.post(`/education/admission-executive/follow-ups/${taskId}/complete`, data),

  snoozeFollowUp: (taskId, data) =>
    apiClient.post(`/education/admission-executive/follow-ups/${taskId}/snooze`, data),

  startApplication: (enquiryId, data) =>
    apiClient.post(`/education/admission-executive/enquiries/${enquiryId}/application`, data),

  getMyApplications: (status) =>
    apiClient.get('/education/admission-executive/applications', { status }),

  getMyApplication: (applicationId) =>
    apiClient.get(`/education/admission-executive/applications/${applicationId}`),

  updateMyApplication: (applicationId, data) =>
    apiClient.patch(`/education/admission-executive/applications/${applicationId}`, data),

  registerDocument: (applicationId, data) =>
    apiClient.post(`/education/admission-executive/applications/${applicationId}/documents`, data),

  getApplicationDocuments: (applicationId) =>
    apiClient.get(`/education/admission-executive/applications/${applicationId}/documents`),

  submitApplicationForReview: (applicationId, data) =>
    apiClient.post(`/education/admission-executive/applications/${applicationId}/submit`, data),

  requestCounselling: (enquiryId, data) =>
    apiClient.post(`/education/admission-executive/enquiries/${enquiryId}/counselling-request`, data),

  generateAiFollowUpDraft: (data) =>
    apiClient.post('/education/admission-executive/ai/follow-up-draft', data),

  getPersonalPerformance: () =>
    apiClient.get('/education/admission-executive/performance'),

  // ==========================================
  // ROLE 3: STUDENT SUPPORT AGENT (20 APIs)
  // ==========================================
  getStudentSupportDashboard: (from = '2026-10-01', to = '2026-10-31') =>
    apiClient.get(`/education/student-support/dashboard?from=${from}&to=${to}`),

  getSupportTickets: (status, priority, page = 0, size = 10) =>
    apiClient.get('/education/student-support/tickets', { status, priority, page, size }),

  createSupportTicket: (data) =>
    apiClient.post('/education/student-support/tickets', data),

  getSupportTicket: (ticketId) =>
    apiClient.get(`/education/student-support/tickets/${ticketId}`),

  updateSupportTicket: (ticketId, data) =>
    apiClient.patch(`/education/student-support/tickets/${ticketId}`, data),

  assignSupportTicket: (ticketId, data) =>
    apiClient.post(`/education/student-support/tickets/${ticketId}/assign`, data),

  getTicketMessages: (ticketId) =>
    apiClient.get(`/education/student-support/tickets/${ticketId}/messages`),

  sendTicketReply: (ticketId, data) =>
    apiClient.post(`/education/student-support/tickets/${ticketId}/messages`, data),

  addInternalNote: (ticketId, data) =>
    apiClient.post(`/education/student-support/tickets/${ticketId}/internal-notes`, data),

  resolveSupportTicket: (ticketId, data) =>
    apiClient.post(`/education/student-support/tickets/${ticketId}/resolve`, data),

  reopenSupportTicket: (ticketId, data) =>
    apiClient.post(`/education/student-support/tickets/${ticketId}/reopen`, data),

  escalateSupportTicket: (ticketId, data) =>
    apiClient.post(`/education/student-support/tickets/${ticketId}/escalate`, data),

  getStudentTickets: (studentId) =>
    apiClient.get(`/education/student-support/students/${studentId}/tickets`),

  getStudentTimeline: (studentId) =>
    apiClient.get(`/education/student-support/students/${studentId}/timeline`),

  searchKnowledgeBase: (q = '') =>
    apiClient.get(`/education/student-support/knowledge/search?q=${encodeURIComponent(q)}`),

  getComplaints: (status, page = 0, size = 10) =>
    apiClient.get('/education/student-support/complaints', { status, page, size }),

  createComplaint: (data) =>
    apiClient.post('/education/student-support/complaints', data),

  updateComplaint: (complaintId, data) =>
    apiClient.patch(`/education/student-support/complaints/${complaintId}`, data),

  generateAiReplyDraft: (ticketId, data) =>
    apiClient.post(`/education/student-support/tickets/${ticketId}/ai/reply-draft`, data),

  getSupportReports: (from = '2026-10-01', to = '2026-10-31') =>
    apiClient.get(`/education/student-support/reports?from=${from}&to=${to}`),

  // ==========================================
  // ROLE 4: COUNSELLOR (24 APIs)
  // ==========================================
  getCounsellorDashboard: (from = '2026-10-01', to = '2026-10-31') =>
    apiClient.get(`/education/counsellor/dashboard?from=${from}&to=${to}`),

  getCounsellingStudents: (search = '', page = 0, size = 20) =>
    apiClient.get('/education/counsellor/students', { search, page, size }),

  getCounsellingStudent: (studentId) =>
    apiClient.get(`/education/counsellor/students/${studentId}`),

  updateCounsellingProfile: (studentId, data) =>
    apiClient.patch(`/education/counsellor/students/${studentId}/counselling-profile`, data),

  recordNeedsAssessment: (studentId, data) =>
    apiClient.post(`/education/counsellor/students/${studentId}/assessments`, data),

  getNeedsAssessments: (studentId) =>
    apiClient.get(`/education/counsellor/students/${studentId}/assessments`),

  getCounsellingAppointments: (status) =>
    apiClient.get('/education/counsellor/appointments', { status }),

  scheduleCounsellingAppointment: (data) =>
    apiClient.post('/education/counsellor/appointments', data),

  getCounsellingAppointment: (appointmentId) =>
    apiClient.get(`/education/counsellor/appointments/${appointmentId}`),

  updateCounsellingAppointment: (appointmentId, data) =>
    apiClient.patch(`/education/counsellor/appointments/${appointmentId}`, data),

  rescheduleAppointment: (appointmentId, data) =>
    apiClient.post(`/education/counsellor/appointments/${appointmentId}/reschedule`, data),

  cancelAppointment: (appointmentId, data) =>
    apiClient.post(`/education/counsellor/appointments/${appointmentId}/cancel`, data),

  completeAppointment: (appointmentId, data) =>
    apiClient.post(`/education/counsellor/appointments/${appointmentId}/complete`, data),

  recordCounsellingNotes: (appointmentId, data) =>
    apiClient.post(`/education/counsellor/appointments/${appointmentId}/notes`, data),

  getCounsellingSessions: (studentId) =>
    apiClient.get(`/education/counsellor/students/${studentId}/sessions`),

  createActionPlan: (studentId, data) =>
    apiClient.post(`/education/counsellor/students/${studentId}/action-plans`, data),

  getActionPlans: (studentId) =>
    apiClient.get(`/education/counsellor/students/${studentId}/action-plans`),

  updateActionPlan: (planId, data) =>
    apiClient.patch(`/education/counsellor/action-plans/${planId}`, data),

  completeActionPlan: (planId) =>
    apiClient.post(`/education/counsellor/action-plans/${planId}/complete`),

  getCourseRecommendations: (studentId, data) =>
    apiClient.post(`/education/counsellor/students/${studentId}/course-recommendations`, data),

  createStudentReferral: (studentId, data) =>
    apiClient.post(`/education/counsellor/students/${studentId}/referrals`, data),

  generateAiSessionPreparation: (data) =>
    apiClient.post('/education/counsellor/ai/session-preparation', data),

  generateAiSessionSummary: (data) =>
    apiClient.post('/education/counsellor/ai/session-summary', data),

  getCounsellorReports: (from = '2026-10-01', to = '2026-10-31') =>
    apiClient.get(`/education/counsellor/reports?from=${from}&to=${to}`),

  // ==========================================
  // SHARED COURSES & BATCHES (Admin API fallback)
  // ==========================================
  getCourses: () => apiClient.get('/admin/education/courses'),
  getCourse: (id) => apiClient.get(`/admin/education/courses/${id}`),
  createCourse: (data) => apiClient.post('/admin/education/courses', data),
  getBatches: () => apiClient.get('/admin/education/batches')
};
