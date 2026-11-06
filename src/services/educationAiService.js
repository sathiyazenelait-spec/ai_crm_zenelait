import { apiClient } from './apiClient';

/**
 * Zenelait AI CRM — Education / Training Tenant AI Agents API Service
 * Covers:
 * Part 1: AI Admission Agent (27 APIs) -> /education/ai-admission/*
 * Part 2: AI Follow-up Agent (28 APIs) -> /education/ai-follow-ups/*
 * Seamless fallback data enables instant zero-latency UI testing even when offline.
 */

const FALLBACK_ADMISSION_CONFIG = {
  enabled: true,
  agentName: 'Zenelait AI Admission Assistant',
  supportedChannels: ['WEBSITE_CHAT', 'WHATSAPP', 'EMAIL'],
  supportedLanguages: ['en', 'ta'],
  capabilities: {
    answerCourseQuestions: true,
    captureLeads: true,
    qualifyStudents: true,
    recommendCourses: true,
    initiateApplications: true,
    scheduleCounselling: true,
    createFollowUps: true,
    humanHandoff: true
  },
  requireConsentForProactiveMessages: true,
  requireHumanApprovalForOutboundMessages: true,
  updatedAt: '2026-10-27T15:00:00+05:30'
};

const FALLBACK_FOLLOWUP_CONFIG = {
  enabled: true,
  defaultChannel: 'EMAIL',
  humanApprovalRequired: true,
  respectContactPreferences: true,
  stopAfterStudentReply: true,
  maxAutomatedMessagesPerLeadPerWeek: 3,
  minimumHoursBetweenMessages: 24,
  permittedContactHours: {
    start: '09:00',
    end: '18:00',
    timeZone: 'Asia/Kolkata'
  },
  updatedAt: '2026-10-27T15:40:00+05:30'
};

const FALLBACK_COURSES = [
  {
    courseId: 501,
    name: 'Java Full Stack Development',
    category: 'SOFTWARE_DEVELOPMENT',
    durationWeeks: 24,
    learningModes: ['WEEKEND', 'WEEKDAY'],
    publishedFee: 45000,
    currency: 'INR',
    eligibilitySummary: 'Degree or Diploma in CS, IT, or equivalent graduation.',
    status: 'PUBLISHED'
  },
  {
    courseId: 502,
    name: 'Applied Generative AI & LLMs',
    category: 'ARTIFICIAL_INTELLIGENCE',
    durationWeeks: 16,
    learningModes: ['WEEKDAY', 'ONLINE'],
    publishedFee: 60000,
    currency: 'INR',
    eligibilitySummary: 'Python fundamentals and basic machine learning intuition.',
    status: 'PUBLISHED'
  }
];

export const educationAiService = {
  // =========================================================================
  // PART 1: AI ADMISSION AGENT (27 APIS)
  // Base: /education/ai-admission
  // =========================================================================

  // 1. Read config
  getAdmissionConfig: async () => {
    const res = await apiClient.get('/education/ai-admission/config');
    return res.success ? res.data : FALLBACK_ADMISSION_CONFIG;
  },

  // 2. Update config
  updateAdmissionConfig: async (data) => {
    const res = await apiClient.patch('/education/ai-admission/config', data);
    return res.success ? res.data : { ...FALLBACK_ADMISSION_CONFIG, ...data };
  },

  // 3. Start student conversation
  startAdmissionSession: async (data) => {
    const res = await apiClient.post('/education/ai-admission/sessions', data);
    if (res.success) return res.data;
    return {
      sessionId: 'adm_session_' + Math.floor(1000 + Math.random() * 9000),
      channel: data.channel || 'WEBSITE_CHAT',
      status: 'ACTIVE',
      visitor: { name: data.visitor?.name || 'Prospective Student' },
      initialResponse: {
        message: 'Welcome! I can help you explore our verified programs, eligibility, fees, and batch schedules. Are you looking for beginner-level training or do you already have programming experience?',
        sourceType: 'ADMISSION_ASSISTANT',
        requiresHumanReview: false
      },
      createdAt: new Date().toISOString()
    };
  },

  // 4. List sessions
  getAdmissionSessions: async (status, page = 0, size = 20) => {
    const res = await apiClient.get('/education/ai-admission/sessions', { status, page, size });
    if (res.success) return res.data;
    return {
      content: [
        {
          sessionId: 'adm_session_1001',
          channel: 'WEBSITE_CHAT',
          status: 'ACTIVE',
          studentName: 'Arun Kumar',
          intent: 'COURSE_INFORMATION',
          leadId: 1201,
          createdAt: '2026-10-27T15:10:00+05:30',
          lastMessageAt: '2026-10-27T15:11:00+05:30'
        },
        {
          sessionId: 'adm_session_1002',
          channel: 'WHATSAPP',
          status: 'QUALIFIED',
          studentName: 'Meena Raj',
          intent: 'ADMISSION_QUALIFICATION',
          leadId: 1202,
          createdAt: '2026-10-27T14:40:00+05:30',
          lastMessageAt: '2026-10-27T14:55:00+05:30'
        }
      ],
      page,
      size,
      totalElements: 2,
      totalPages: 1
    };
  },

  // 5. Get session details
  getAdmissionSession: async (sessionId) => {
    const res = await apiClient.get(`/education/ai-admission/sessions/${sessionId}`);
    if (res.success) return res.data;
    return {
      sessionId,
      channel: 'WEBSITE_CHAT',
      status: 'ACTIVE',
      intent: 'COURSE_INFORMATION',
      leadId: 1201,
      studentName: 'Arun Kumar',
      lastMessageAt: '2026-10-27T15:11:00+05:30',
      assignedEmployeeId: null
    };
  },

  // 6. Send message to agent
  sendAdmissionMessage: async (sessionId, data) => {
    const res = await apiClient.post(`/education/ai-admission/sessions/${sessionId}/messages`, data);
    if (res.success) return res.data;

    const lower = (data.message || '').toLowerCase();
    let reply = 'I can help you check verified course duration, syllabus, eligibility, and fees. Please confirm your educational background.';
    let course = null;
    let handoff = false;

    if (lower.includes('java') || lower.includes('fee') || lower.includes('duration')) {
      reply = 'The Java Full Stack Development course has a published duration of 24 weeks. The listed course fee is ₹45,000. Classes are available on Weekends (Sat & Sun 10 AM - 2 PM IST). Would you like to schedule counselling or check eligibility?';
      course = FALLBACK_COURSES[0];
    } else if (lower.includes('ai') || lower.includes('llm')) {
      reply = 'Our Applied Generative AI & LLMs course is an intensive 16-week program priced at ₹60,000, covering fine-tuning, RAG, and agent systems.';
      course = FALLBACK_COURSES[1];
    } else if (lower.includes('human') || lower.includes('agent') || lower.includes('counsellor')) {
      reply = 'I am connecting you to an Admission Executive immediately for personalized guidance.';
      handoff = true;
    }

    return {
      sessionId,
      userMessageId: 'msg_' + Date.now(),
      assistantMessageId: 'msg_' + (Date.now() + 1),
      reply,
      intent: 'COURSE_INFORMATION',
      requiresHumanHandoff: handoff,
      course,
      knowledgeSources: [{ sourceType: 'COURSE_DATABASE', sourceId: '501' }],
      createdAt: new Date().toISOString()
    };
  },

  // 7. Retrieve message history
  getAdmissionMessages: async (sessionId, page = 0, size = 20) => {
    const res = await apiClient.get(`/education/ai-admission/sessions/${sessionId}/messages`, { page, size });
    if (res.success) return res.data;
    return {
      content: [
        {
          messageId: 'msg_1001',
          sender: 'STUDENT',
          content: 'What is the duration and fee of the Java Full Stack course?',
          createdAt: '2026-10-27T15:11:00+05:30'
        },
        {
          messageId: 'msg_1002',
          sender: 'AI_ADMISSION_AGENT',
          content: 'The Java Full Stack Development course has a published duration of 24 weeks. The listed course fee is ₹45,000. Please confirm the available batch and current fee with our admission team.',
          createdAt: '2026-10-27T15:11:05+05:30'
        }
      ],
      page,
      size,
      totalElements: 2,
      totalPages: 1
    };
  },

  // 8. Qualify student
  qualifyStudent: async (sessionId, data) => {
    const res = await apiClient.post(`/education/ai-admission/sessions/${sessionId}/qualify`, data);
    if (res.success) return res.data;
    return {
      sessionId,
      qualificationId: 1101,
      qualificationStatus: 'QUALIFIED',
      interestedCourseId: data.interestedCourseId || 501,
      preferredLearningMode: data.preferredLearningMode || 'WEEKEND',
      nextRecommendedAction: 'CREATE_ADMISSION_ENQUIRY',
      requiresHumanReview: true
    };
  },

  // 9. Course recommendations
  recommendCourses: async (data) => {
    const res = await apiClient.post('/education/ai-admission/course-recommendations', data);
    if (res.success) return res.data;
    return {
      recommendations: [
        {
          courseId: 501,
          courseName: 'Java Full Stack Development',
          matchReasons: [
            "Matches the student's stated programming interests",
            'Published learning mode matches preference (WEEKEND)',
            'Duration (24 weeks) fits within requested timeframe'
          ],
          publishedFee: 45000,
          currency: 'INR',
          requiresHumanReview: true
        },
        {
          courseId: 502,
          courseName: 'Applied Generative AI & LLMs',
          matchReasons: [
            'Aligns with advanced engineering goals',
            'Flexible online cohort structure'
          ],
          publishedFee: 60000,
          currency: 'INR',
          requiresHumanReview: true
        }
      ]
    };
  },

  // 10. Search courses
  getCourses: async (search = '', learningMode = '', page = 0, size = 10) => {
    const res = await apiClient.get('/education/ai-admission/courses', { search, learningMode, page, size });
    if (res.success) return res.data;
    return { content: FALLBACK_COURSES, page, size, totalElements: FALLBACK_COURSES.length, totalPages: 1 };
  },

  // 11. Get course details
  getCourseDetails: async (courseId) => {
    const res = await apiClient.get(`/education/ai-admission/courses/${courseId}`);
    if (res.success) return res.data;
    return FALLBACK_COURSES.find(c => c.courseId === Number(courseId)) || FALLBACK_COURSES[0];
  },

  // 12. Create admission lead
  createAdmissionLead: async (sessionId, data) => {
    const res = await apiClient.post(`/education/ai-admission/sessions/${sessionId}/create-lead`, data);
    if (res.success) return res.data;
    return {
      leadId: 1201,
      sessionId,
      name: data.name,
      interestedCourseId: data.interestedCourseId || 501,
      status: 'NEW',
      source: data.source || 'WEBSITE_CHAT',
      duplicateMatch: false,
      createdAt: new Date().toISOString()
    };
  },

  // 13. List admission leads
  getAdmissionLeads: async (status, page = 0, size = 10) => {
    const res = await apiClient.get('/education/ai-admission/leads', { status, page, size });
    if (res.success) return res.data;
    return {
      content: [
        {
          leadId: 1201,
          name: 'Arun Kumar',
          email: 'arun@example.com',
          phone: '+919876543210',
          interestedCourseId: 501,
          status: 'NEW',
          source: 'WEBSITE_CHAT',
          assignedExecutiveId: null,
          createdAt: '2026-10-27T15:16:00+05:30'
        },
        {
          leadId: 1202,
          name: 'Meena Raj',
          email: 'meena@example.com',
          phone: '+919876543211',
          interestedCourseId: 501,
          status: 'QUALIFIED',
          source: 'PHONE',
          assignedExecutiveId: 101,
          createdAt: '2026-10-26T14:42:00+05:30'
        }
      ],
      page,
      size,
      totalElements: 2,
      totalPages: 1
    };
  },

  // 14. Retrieve lead
  getAdmissionLead: async (leadId) => {
    const res = await apiClient.get(`/education/ai-admission/leads/${leadId}`);
    if (res.success) return res.data;
    return {
      leadId,
      name: 'Arun Kumar',
      email: 'arun@example.com',
      phone: '+919876543210',
      interestedCourseId: 501,
      status: 'NEW',
      source: 'WEBSITE_CHAT',
      consent: { contactForAdmission: true, marketingFollowUps: false }
    };
  },

  // 15. Update lead
  updateAdmissionLead: async (leadId, data) => {
    const res = await apiClient.patch(`/education/ai-admission/leads/${leadId}`, data);
    return res.success ? res.data : { leadId, ...data, updatedAt: new Date().toISOString() };
  },

  // 16. Start application draft
  createApplicationDraft: async (sessionId, data) => {
    const res = await apiClient.post(`/education/ai-admission/sessions/${sessionId}/create-application`, data);
    if (res.success) return res.data;
    return {
      applicationId: 2101,
      leadId: data.leadId || 1201,
      courseId: data.courseId || 501,
      status: 'DRAFT',
      missingFields: ['dateOfBirth', 'educationDetails'],
      requiresStudentCompletion: true
    };
  },

  // 17. Retrieve application details
  getApplicationDetails: async (applicationId) => {
    const res = await apiClient.get(`/education/ai-admission/applications/${applicationId}`);
    if (res.success) return res.data;
    return {
      applicationId,
      leadId: 1201,
      courseId: 501,
      status: 'DRAFT',
      missingFields: ['dateOfBirth', 'educationDetails'],
      submittedAt: null
    };
  },

  // 18. Request counselling
  scheduleCounselling: async (sessionId, data) => {
    const res = await apiClient.post(`/education/ai-admission/sessions/${sessionId}/schedule-counselling`, data);
    if (res.success) return res.data;
    return {
      appointmentRequestId: 3101,
      leadId: data.leadId || 1201,
      status: 'PENDING_CONFIRMATION',
      preferredDate: data.preferredDate || '2026-10-30',
      preferredTime: data.preferredTime || '11:00',
      timeZone: data.timeZone || 'Asia/Kolkata',
      meetingMode: data.meetingMode || 'ONLINE'
    };
  },

  // 19. Create initial follow-up task
  createAdmissionFollowUp: async (sessionId, data) => {
    const res = await apiClient.post(`/education/ai-admission/sessions/${sessionId}/create-follow-up`, data);
    if (res.success) return res.data;
    return {
      taskId: 4101,
      leadId: data.leadId || 1201,
      taskType: data.taskType || 'COURSE_INFORMATION',
      status: 'PENDING',
      dueAt: data.dueAt || '2026-10-29T11:00:00+05:30',
      createdByAgent: 'AI_ADMISSION_AGENT'
    };
  },

  // 20. Hand off to staff
  handoffAdmissionSession: async (sessionId, data) => {
    const res = await apiClient.post(`/education/ai-admission/sessions/${sessionId}/handoff`, data);
    if (res.success) return res.data;
    return {
      sessionId,
      status: 'HANDOFF_PENDING',
      handoffId: 5101,
      assignedTeam: data.preferredTeam || 'ADMISSIONS',
      reason: data.reason || 'STUDENT_REQUESTED_HUMAN',
      createdAt: new Date().toISOString()
    };
  },

  // 21. Close conversation
  closeAdmissionSession: async (sessionId, data) => {
    const res = await apiClient.post(`/education/ai-admission/sessions/${sessionId}/close`, data);
    return res.success ? res.data : { sessionId, status: 'CLOSED', closedAt: new Date().toISOString() };
  },

  // 22. Get session events
  getSessionEvents: async (sessionId, page = 0, size = 20) => {
    const res = await apiClient.get(`/education/ai-admission/sessions/${sessionId}/events`, { page, size });
    if (res.success) return res.data;
    return {
      content: [
        { eventId: 'evt_1001', eventType: 'SESSION_CREATED', createdAt: '2026-10-27T15:10:00+05:30' },
        { eventId: 'evt_1002', eventType: 'COURSE_QUESTION_RECEIVED', createdAt: '2026-10-27T15:11:00+05:30' },
        { eventId: 'evt_1003', eventType: 'LEAD_CREATED', createdAt: '2026-10-27T15:16:00+05:30' }
      ],
      page,
      size,
      totalElements: 3,
      totalPages: 1
    };
  },

  // 23. List knowledge sources
  getKnowledgeSources: async (page = 0, size = 20) => {
    const res = await apiClient.get('/education/ai-admission/knowledge/sources', { page, size });
    if (res.success) return res.data;
    return {
      content: [
        { sourceId: 'KB-101', title: 'Java Course Information', sourceType: 'DOCUMENT', status: 'INDEXED', lastSyncedAt: '2026-10-26T10:00:00+05:30' },
        { sourceId: 'KB-102', title: 'Admission Policy', sourceType: 'DOCUMENT', status: 'INDEXED', lastSyncedAt: '2026-10-26T10:05:00+05:30' }
      ],
      page,
      size,
      totalElements: 2,
      totalPages: 1
    };
  },

  // 24. Register knowledge source
  registerKnowledgeSource: async (data) => {
    const res = await apiClient.post('/education/ai-admission/knowledge/sources', data);
    if (res.success) return res.data;
    return {
      sourceId: 'KB-' + Math.floor(100 + Math.random() * 900),
      title: data.title,
      sourceType: data.sourceType || 'DOCUMENT',
      status: 'PENDING_INDEXING',
      enabled: true,
      createdAt: new Date().toISOString()
    };
  },

  // 25. Sync knowledge source
  syncKnowledgeSource: async (sourceId, data = { reindex: true }) => {
    const res = await apiClient.post(`/education/ai-admission/knowledge/sources/${sourceId}/sync`, data);
    return res.success ? res.data : { sourceId, syncJobId: 'sync_1001', status: 'QUEUED', queuedAt: new Date().toISOString() };
  },

  // 26. Get metrics
  getAdmissionMetrics: async (from = '2026-10-01', to = '2026-10-31') => {
    const res = await apiClient.get('/education/ai-admission/metrics', { from, to });
    if (res.success) return res.data;
    return {
      period: { from, to },
      sessionsStarted: 850,
      sessionsClosed: 690,
      leadsCreated: 240,
      duplicateLeadsPrevented: 18,
      applicationsInitiated: 95,
      counsellingRequestsCreated: 62,
      humanHandoffs: 75,
      unansweredQuestions: 22,
      leadConversionPercent: 28.24
    };
  },

  // 27. Get audit events
  getAdmissionAuditEvents: async (page = 0, size = 20) => {
    const res = await apiClient.get('/education/ai-admission/audit-events', { page, size });
    if (res.success) return res.data;
    return {
      content: [
        {
          eventId: 'audit_1001',
          eventType: 'LEAD_CREATED',
          actorType: 'AI_AGENT',
          actorId: 'AI_ADMISSION_AGENT',
          resourceType: 'ADMISSION_LEAD',
          resourceId: '1201',
          createdAt: '2026-10-27T15:16:00+05:30'
        }
      ],
      page,
      size,
      totalElements: 1,
      totalPages: 1
    };
  },

  // =========================================================================
  // PART 2: AI FOLLOW-UP AGENT (28 APIS)
  // Base: /education/ai-follow-ups
  // =========================================================================

  // 1. Read config
  getFollowUpConfig: async () => {
    const res = await apiClient.get('/education/ai-follow-ups/config');
    return res.success ? res.data : FALLBACK_FOLLOWUP_CONFIG;
  },

  // 2. Update config
  updateFollowUpConfig: async (data) => {
    const res = await apiClient.patch('/education/ai-follow-ups/config', data);
    return res.success ? res.data : { ...FALLBACK_FOLLOWUP_CONFIG, ...data };
  },

  // 3. List rules
  getFollowUpRules: async (status, page = 0, size = 20) => {
    const res = await apiClient.get('/education/ai-follow-ups/rules', { status, page, size });
    if (res.success) return res.data;
    return {
      content: [
        {
          ruleId: 601,
          name: 'New Admission Enquiry Follow-up',
          triggerType: 'ENQUIRY_CREATED',
          delayMinutes: 1440,
          channel: 'EMAIL',
          status: 'ACTIVE',
          requiresApproval: true
        },
        {
          ruleId: 602,
          name: 'Incomplete Application Reminder',
          triggerType: 'APPLICATION_INCOMPLETE',
          delayMinutes: 2880,
          channel: 'EMAIL',
          status: 'ACTIVE',
          requiresApproval: true
        }
      ],
      page,
      size,
      totalElements: 2,
      totalPages: 1
    };
  },

  // 4. Create rule
  createFollowUpRule: async (data) => {
    const res = await apiClient.post('/education/ai-follow-ups/rules', data);
    if (res.success) return res.data;
    return {
      ruleId: 603,
      name: data.name,
      triggerType: data.triggerType,
      delayMinutes: data.delayMinutes,
      channel: data.channel,
      status: 'DRAFT',
      requiresApproval: data.requiresApproval ?? true,
      createdAt: new Date().toISOString()
    };
  },

  // 5. Get rule
  getFollowUpRule: async (ruleId) => {
    const res = await apiClient.get(`/education/ai-follow-ups/rules/${ruleId}`);
    return res.success ? res.data : { ruleId, name: 'Sample Rule', status: 'ACTIVE' };
  },

  // 6. Update rule
  updateFollowUpRule: async (ruleId, data) => {
    const res = await apiClient.patch(`/education/ai-follow-ups/rules/${ruleId}`, data);
    return res.success ? res.data : { ruleId, ...data, status: 'DRAFT', updatedAt: new Date().toISOString() };
  },

  // 7. Activate rule
  activateFollowUpRule: async (ruleId) => {
    const res = await apiClient.post(`/education/ai-follow-ups/rules/${ruleId}/activate`, { confirmation: true });
    return res.success ? res.data : { ruleId, previousStatus: 'DRAFT', status: 'ACTIVE', activatedAt: new Date().toISOString(), activatedBy: 10 };
  },

  // 8. Pause rule
  pauseFollowUpRule: async (ruleId, reason = 'Reviewing follow-up message content') => {
    const res = await apiClient.post(`/education/ai-follow-ups/rules/${ruleId}/pause`, { reason });
    return res.success ? res.data : { ruleId, previousStatus: 'ACTIVE', status: 'PAUSED', reason, pausedAt: new Date().toISOString() };
  },

  // 9. List tasks
  getFollowUpTasks: async (status, page = 0, size = 20) => {
    const res = await apiClient.get('/education/ai-follow-ups/tasks', { status, page, size });
    if (res.success) return res.data;
    return {
      content: [
        {
          taskId: 7101,
          leadId: 1201,
          leadName: 'Arun Kumar',
          taskType: 'COURSE_INFORMATION',
          channel: 'EMAIL',
          status: 'SCHEDULED',
          scheduledAt: '2026-10-29T11:00:00+05:30',
          requiresApproval: true
        }
      ],
      page,
      size,
      totalElements: 1,
      totalPages: 1
    };
  },

  // 10. Create task
  createFollowUpTask: async (data) => {
    const res = await apiClient.post('/education/ai-follow-ups/tasks', data);
    if (res.success) return res.data;
    return {
      taskId: 7101,
      leadId: data.leadId,
      taskType: data.taskType,
      channel: data.channel,
      status: 'SCHEDULED',
      scheduledAt: data.scheduledAt,
      requiresApproval: true,
      createdBy: 'AI_FOLLOWUP_AGENT'
    };
  },

  // 11. Retrieve task
  getFollowUpTask: async (taskId) => {
    const res = await apiClient.get(`/education/ai-follow-ups/tasks/${taskId}`);
    return res.success ? res.data : { taskId, status: 'SCHEDULED' };
  },

  // 12. Update task
  updateFollowUpTask: async (taskId, data) => {
    const res = await apiClient.patch(`/education/ai-follow-ups/tasks/${taskId}`, data);
    return res.success ? res.data : { taskId, ...data, status: 'SCHEDULED', updatedAt: new Date().toISOString() };
  },

  // 13. Complete task
  completeFollowUpTask: async (taskId, data = {}) => {
    const res = await apiClient.post(`/education/ai-follow-ups/tasks/${taskId}/complete`, data);
    return res.success ? res.data : { taskId, previousStatus: 'SCHEDULED', status: 'COMPLETED', outcome: data.outcome || 'STUDENT_REPLIED', completedAt: new Date().toISOString() };
  },

  // 14. Cancel task
  cancelFollowUpTask: async (taskId, reason = 'Student has submitted application') => {
    const res = await apiClient.post(`/education/ai-follow-ups/tasks/${taskId}/cancel`, { reason });
    return res.success ? res.data : { taskId, previousStatus: 'SCHEDULED', status: 'CANCELLED', reason, cancelledAt: new Date().toISOString() };
  },

  // 15. Snooze task
  snoozeFollowUpTask: async (taskId, newScheduledAt, reason = 'Student requested contact next week') => {
    const res = await apiClient.post(`/education/ai-follow-ups/tasks/${taskId}/snooze`, { newScheduledAt, reason });
    return res.success ? res.data : { taskId, scheduledAt: newScheduledAt, status: 'SCHEDULED' };
  },

  // 16. Generate draft
  generateFollowUpDraft: async (data) => {
    const res = await apiClient.post('/education/ai-follow-ups/drafts', data);
    if (res.success) return res.data;
    return {
      draftId: 'draft_8001',
      leadId: data.leadId || 1201,
      taskId: data.taskId || 7101,
      channel: data.channel || 'EMAIL',
      subject: 'Following up on your course enquiry',
      body: 'Hello Arun, I am following up on your interest in our course. Would you like any additional information about the curriculum or available batches? Please let us know if you would like to discuss the details with our admission team.',
      status: 'PENDING_APPROVAL',
      requiresApproval: true,
      generatedAt: new Date().toISOString()
    };
  },

  // 17. List drafts
  getFollowUpDrafts: async (status, page = 0, size = 20) => {
    const res = await apiClient.get('/education/ai-follow-ups/drafts', { status, page, size });
    if (res.success) return res.data;
    return {
      content: [
        {
          draftId: 'draft_8001',
          leadId: 1201,
          leadName: 'Arun Kumar',
          channel: 'EMAIL',
          purpose: 'COURSE_INFORMATION_FOLLOW_UP',
          status: 'PENDING_APPROVAL',
          generatedAt: '2026-10-27T15:53:00+05:30'
        }
      ],
      page,
      size,
      totalElements: 1,
      totalPages: 1
    };
  },

  // 18. Retrieve draft
  getFollowUpDraft: async (draftId) => {
    const res = await apiClient.get(`/education/ai-follow-ups/drafts/${draftId}`);
    if (res.success) return res.data;
    return {
      draftId,
      leadId: 1201,
      channel: 'EMAIL',
      subject: 'Following up on your course enquiry',
      body: 'Hello Arun, I am following up on your interest in our course.',
      status: 'PENDING_APPROVAL'
    };
  },

  // 19. Edit draft
  updateFollowUpDraft: async (draftId, data) => {
    const res = await apiClient.patch(`/education/ai-follow-ups/drafts/${draftId}`, data);
    return res.success ? res.data : { draftId, ...data, status: 'PENDING_APPROVAL', updatedAt: new Date().toISOString() };
  },

  // 20. Approve draft
  approveFollowUpDraft: async (draftId, decision = 'APPROVE', reviewComment = 'Verified content') => {
    const res = await apiClient.post(`/education/ai-follow-ups/drafts/${draftId}/approve`, { decision, reviewComment });
    return res.success ? res.data : { draftId, previousStatus: 'PENDING_APPROVAL', status: 'APPROVED', approvedBy: 10, approvedAt: new Date().toISOString() };
  },

  // 21. Send approved draft
  sendFollowUpDraft: async (draftId, idempotencyKey = 'edu-send-' + Date.now()) => {
    const res = await apiClient.post(`/education/ai-follow-ups/drafts/${draftId}/send`, { idempotencyKey });
    return res.success ? res.data : { draftId, executionId: 'exec_9001', status: 'QUEUED', deliveryStatus: 'PENDING', queuedAt: new Date().toISOString() };
  },

  // 22. List executions
  getFollowUpExecutions: async (status, page = 0, size = 20) => {
    const res = await apiClient.get('/education/ai-follow-ups/executions', { status, page, size });
    if (res.success) return res.data;
    return {
      content: [
        {
          executionId: 'exec_9001',
          taskId: 7101,
          draftId: 'draft_8001',
          channel: 'EMAIL',
          status: 'QUEUED',
          deliveryStatus: 'PENDING',
          attemptCount: 0,
          createdAt: '2026-10-27T15:57:00+05:30'
        }
      ],
      page,
      size,
      totalElements: 1,
      totalPages: 1
    };
  },

  // 23. Retrieve execution
  getFollowUpExecution: async (executionId) => {
    const res = await apiClient.get(`/education/ai-follow-ups/executions/${executionId}`);
    return res.success ? res.data : { executionId, status: 'QUEUED', deliveryStatus: 'PENDING' };
  },

  // 24. Retry failed execution
  retryFollowUpExecution: async (executionId, reason = 'Temporary provider error') => {
    const res = await apiClient.post(`/education/ai-follow-ups/executions/${executionId}/retry`, { reason });
    return res.success ? res.data : { executionId, previousStatus: 'FAILED', status: 'QUEUED', attemptCount: 2, retryQueuedAt: new Date().toISOString() };
  },

  // 25. Stop automated contact
  stopContact: async (data) => {
    const res = await apiClient.post('/education/ai-follow-ups/stop-contact', data);
    if (res.success) return res.data;
    return {
      suppressionId: 'supp_1001',
      leadId: data.leadId,
      channel: data.channel || 'EMAIL',
      scope: data.scope || 'MARKETING_MESSAGES',
      reason: data.reason || 'STUDENT_OPTED_OUT',
      status: 'ACTIVE',
      effectiveAt: new Date().toISOString()
    };
  },

  // 26. Get suppression list
  getSuppressionList: async (channel, page = 0, size = 20) => {
    const res = await apiClient.get('/education/ai-follow-ups/suppression-list', { channel, page, size });
    if (res.success) return res.data;
    return {
      content: [
        {
          suppressionId: 'supp_1001',
          leadId: 1201,
          channel: 'EMAIL',
          scope: 'MARKETING_MESSAGES',
          reason: 'STUDENT_OPTED_OUT',
          status: 'ACTIVE',
          effectiveAt: '2026-10-27T16:01:00+05:30'
        }
      ],
      page,
      size,
      totalElements: 1,
      totalPages: 1
    };
  },

  // 27. Follow-up metrics
  getFollowUpMetrics: async (from = '2026-10-01', to = '2026-10-31') => {
    const res = await apiClient.get('/education/ai-follow-ups/metrics', { from, to });
    if (res.success) return res.data;
    return {
      period: { from, to },
      tasksCreated: 640,
      tasksCompleted: 510,
      draftsGenerated: 420,
      draftsApproved: 350,
      messagesQueued: 320,
      messagesSent: 310,
      messagesDelivered: 295,
      messagesFailed: 10,
      tasksCancelled: 45,
      contactsSuppressed: 28,
      studentReplies: 90,
      applicationsAssociatedWithFollowUps: 65
    };
  },

  // 28. Follow-up audit events
  getFollowUpAuditEvents: async (page = 0, size = 20) => {
    const res = await apiClient.get('/education/ai-follow-ups/audit-events', { page, size });
    if (res.success) return res.data;
    return {
      content: [
        {
          eventId: 'audit_fu_1001',
          eventType: 'FOLLOWUP_DRAFT_APPROVED',
          actorType: 'USER',
          actorId: '10',
          resourceType: 'FOLLOWUP_DRAFT',
          resourceId: 'draft_8001',
          createdAt: '2026-10-27T15:56:00+05:30'
        },
        {
          eventId: 'audit_fu_1002',
          eventType: 'FOLLOWUP_MESSAGE_QUEUED',
          actorType: 'USER',
          actorId: '10',
          resourceType: 'FOLLOWUP_EXECUTION',
          resourceId: 'exec_9001',
          createdAt: '2026-10-27T15:57:00+05:30'
        }
      ],
      page,
      size,
      totalElements: 2,
      totalPages: 1
    };
  }
};
