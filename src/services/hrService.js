import { apiClient } from './apiClient';

export const hrService = {
  // HR Dashboard
  getDashboard: () => apiClient.get('/hr/dashboard'),

  // Employees Directory
  getEmployees: (params = {}) => apiClient.get('/hr/employees', params),
  getEmployee: (employeeId) => apiClient.get(`/hr/employees/${employeeId}`),
  createEmployee: (employeeData) => apiClient.post('/hr/employees', employeeData),
  updateEmployee: (employeeId, updates) => apiClient.patch(`/hr/employees/${employeeId}`, updates),

  // Departments & Designations
  getDepartments: () => apiClient.get('/hr/departments'),
  getDesignations: () => apiClient.get('/hr/designations'),

  // Recruitment & ATS
  getJobs: () => apiClient.get('/hr/jobs'),
  createJob: (jobData) => apiClient.post('/hr/jobs', jobData),
  getCandidates: () => apiClient.get('/hr/candidates'),
  createCandidate: (candidateData) => apiClient.post('/hr/candidates', candidateData),
  getApplications: () => apiClient.get('/hr/applications'),

  // Onboarding & Offboarding
  getOnboardingCases: () => apiClient.get('/hr/onboarding'),
  createOnboardingCase: (data) => apiClient.post('/hr/onboarding', data),
  getOffboardingCases: () => apiClient.get('/hr/offboarding'),

  // Leave & Attendance
  getLeaveRequests: () => apiClient.get('/hr/leave-requests'),
  submitLeaveRequest: (leaveData) => apiClient.post('/hr/leave-requests', leaveData),
  updateLeaveStatus: (leaveId, status) => apiClient.patch(`/hr/leave-requests/${leaveId}/status`, { status }),
  getAttendance: () => apiClient.get('/hr/attendance'),

  // Policies, Documents, Service Requests
  getPolicies: () => apiClient.get('/hr/policies'),
  createPolicy: (policyData) => apiClient.post('/hr/policies', policyData),
  getDocuments: () => apiClient.get('/hr/documents'),
  getServiceRequests: () => apiClient.get('/hr/service-requests'),
  submitServiceRequest: (reqData) => apiClient.post('/hr/service-requests', reqData),

  // AI & Automations
  getAiHelpdeskConfig: () => apiClient.get('/hr/ai/helpdesk-config'),
  queryAiAssistant: (prompt) => apiClient.post('/hr/ai/assistant/query', { prompt }),
  getAutomations: () => apiClient.get('/hr/automations')
};
