package com.zenelait.crm.education;

import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

/**
 * Zenelait AI CRM — Education & Training Tenant Shared Data Store
 * All 4 roles (Admission Manager, Admission Executive, Student Support Agent, Counsellor)
 * interact with these unified tenant-isolated records.
 */
@Component
public class EducationDataStore {

    public static final String TENANT_ID = "TEN-EDU-001";

    // Primary Entities
    public final List<Map<String, Object>> courses = new CopyOnWriteArrayList<>();
    public final List<Map<String, Object>> students = new CopyOnWriteArrayList<>();
    public final List<Map<String, Object>> enquiries = new CopyOnWriteArrayList<>();
    public final List<Map<String, Object>> applications = new CopyOnWriteArrayList<>();
    public final List<Map<String, Object>> applicationDocuments = new CopyOnWriteArrayList<>();
    public final List<Map<String, Object>> followUps = new CopyOnWriteArrayList<>();
    public final List<Map<String, Object>> interactions = new CopyOnWriteArrayList<>();
    public final List<Map<String, Object>> targets = new CopyOnWriteArrayList<>();
    public final List<Map<String, Object>> executives = new CopyOnWriteArrayList<>();
    public final List<Map<String, Object>> supportTickets = new CopyOnWriteArrayList<>();
    public final List<Map<String, Object>> supportMessages = new CopyOnWriteArrayList<>();
    public final List<Map<String, Object>> internalNotes = new CopyOnWriteArrayList<>();
    public final List<Map<String, Object>> complaints = new CopyOnWriteArrayList<>();
    public final Map<Long, Map<String, Object>> counsellingProfiles = new ConcurrentHashMap<>();
    public final List<Map<String, Object>> counsellingAssessments = new CopyOnWriteArrayList<>();
    public final List<Map<String, Object>> counsellingAppointments = new CopyOnWriteArrayList<>();
    public final List<Map<String, Object>> counsellingNotes = new CopyOnWriteArrayList<>();
    public final List<Map<String, Object>> actionPlans = new CopyOnWriteArrayList<>();
    public final List<Map<String, Object>> referrals = new CopyOnWriteArrayList<>();
    public final List<Map<String, Object>> knowledgeBase = new CopyOnWriteArrayList<>();
    public final List<Map<String, Object>> aiActivities = new CopyOnWriteArrayList<>();
    public final List<Map<String, Object>> auditEvents = new CopyOnWriteArrayList<>();

    // AI Admission Agent Entities
    public final Map<String, Object> aiAdmissionConfig = new ConcurrentHashMap<>();
    public final List<Map<String, Object>> aiAdmissionSessions = new CopyOnWriteArrayList<>();
    public final List<Map<String, Object>> aiAdmissionMessages = new CopyOnWriteArrayList<>();
    public final List<Map<String, Object>> aiAdmissionQualifications = new CopyOnWriteArrayList<>();
    public final List<Map<String, Object>> aiAdmissionHandoffs = new CopyOnWriteArrayList<>();
    public final List<Map<String, Object>> aiAdmissionEvents = new CopyOnWriteArrayList<>();
    public final List<Map<String, Object>> aiAdmissionKnowledgeSources = new CopyOnWriteArrayList<>();
    public final List<Map<String, Object>> aiAdmissionAuditEvents = new CopyOnWriteArrayList<>();

    // AI Follow-up Agent Entities
    public final Map<String, Object> aiFollowUpConfig = new ConcurrentHashMap<>();
    public final List<Map<String, Object>> aiFollowUpRules = new CopyOnWriteArrayList<>();
    public final List<Map<String, Object>> aiFollowUpTasks = new CopyOnWriteArrayList<>();
    public final List<Map<String, Object>> aiFollowUpDrafts = new CopyOnWriteArrayList<>();
    public final List<Map<String, Object>> aiFollowUpExecutions = new CopyOnWriteArrayList<>();
    public final List<Map<String, Object>> aiFollowUpSuppressions = new CopyOnWriteArrayList<>();
    public final List<Map<String, Object>> aiFollowUpAuditEvents = new CopyOnWriteArrayList<>();

    // ID Sequences
    public final AtomicInteger enquirySeq = new AtomicInteger(1002);
    public final AtomicInteger appSeq = new AtomicInteger(2002);
    public final AtomicInteger docSeq = new AtomicInteger(901);
    public final AtomicInteger followUpSeq = new AtomicInteger(702);
    public final AtomicInteger interactionSeq = new AtomicInteger(801);
    public final AtomicInteger targetSeq = new AtomicInteger(301);
    public final AtomicInteger ticketSeq = new AtomicInteger(4001);
    public final AtomicInteger msgSeq = new AtomicInteger(5001);
    public final AtomicInteger noteSeq = new AtomicInteger(6001);
    public final AtomicInteger complaintSeq = new AtomicInteger(7001);
    public final AtomicInteger apptSeq = new AtomicInteger(8002);
    public final AtomicInteger assessmentSeq = new AtomicInteger(9001);
    public final AtomicInteger planSeq = new AtomicInteger(9201);
    public final AtomicInteger referralSeq = new AtomicInteger(9301);
    public final AtomicInteger sessionNoteSeq = new AtomicInteger(9101);

    // AI Agent ID Sequences
    public final AtomicInteger aiSessionSeq = new AtomicInteger(1001);
    public final AtomicInteger aiMsgSeq = new AtomicInteger(1002);
    public final AtomicInteger aiQualSeq = new AtomicInteger(1101);
    public final AtomicInteger aiHandoffSeq = new AtomicInteger(5101);
    public final AtomicInteger aiEventSeq = new AtomicInteger(1003);
    public final AtomicInteger aiRuleSeq = new AtomicInteger(603);
    public final AtomicInteger aiTaskSeq = new AtomicInteger(7101);
    public final AtomicInteger aiDraftSeq = new AtomicInteger(8001);
    public final AtomicInteger aiExecSeq = new AtomicInteger(9001);
    public final AtomicInteger aiSuppSeq = new AtomicInteger(1001);
    public final AtomicInteger aiKbSeq = new AtomicInteger(103);
    public final AtomicInteger aiAuditSeq = new AtomicInteger(1001);

    public EducationDataStore() {
        initData();
    }

    private void initData() {
        // 1. Courses
        Map<String, Object> c1 = new LinkedHashMap<>();
        c1.put("courseId", 501L);
        c1.put("courseCode", "JAVA-FS-501");
        c1.put("courseName", "Java Full Stack Development");
        c1.put("durationWeeks", 24);
        c1.put("fee", 45000.0);
        c1.put("preferredSchedule", "WEEKEND");
        c1.put("mode", "HYBRID");
        c1.put("academicYear", "2026-2027");
        c1.put("status", "ACTIVE");
        c1.put("tenantId", TENANT_ID);
        courses.add(c1);

        Map<String, Object> c2 = new LinkedHashMap<>();
        c2.put("courseId", 502L);
        c2.put("courseCode", "AI-LLM-502");
        c2.put("courseName", "Applied Generative AI & LLMs");
        c2.put("durationWeeks", 16);
        c2.put("fee", 60000.0);
        c2.put("preferredSchedule", "WEEKDAY");
        c2.put("mode", "ONLINE");
        c2.put("academicYear", "2026-2027");
        c2.put("status", "ACTIVE");
        c2.put("tenantId", TENANT_ID);
        courses.add(c2);

        // 2. Executives
        Map<String, Object> e1 = new LinkedHashMap<>();
        e1.put("executiveId", 101L);
        e1.put("name", "Priya");
        e1.put("email", "priya.exec@abctraining.com");
        e1.put("assignedEnquiries", 42);
        e1.put("overdueFollowUps", 3);
        e1.put("applicationsSubmitted", 9);
        e1.put("active", true);
        e1.put("tenantId", TENANT_ID);
        executives.add(e1);

        Map<String, Object> e2 = new LinkedHashMap<>();
        e2.put("executiveId", 102L);
        e2.put("name", "Rahul");
        e2.put("email", "rahul.exec@abctraining.com");
        e2.put("assignedEnquiries", 35);
        e2.put("overdueFollowUps", 1);
        e2.put("applicationsSubmitted", 7);
        e2.put("active", true);
        e2.put("tenantId", TENANT_ID);
        executives.add(e2);

        // 3. Students
        Map<String, Object> s1 = new LinkedHashMap<>();
        s1.put("studentId", 3001L);
        s1.put("studentName", "Meena Raj");
        s1.put("email", "meena@example.com");
        s1.put("phone", "+919876543211");
        s1.put("courseId", 501L);
        s1.put("enrolmentStatus", "ENROLLED");
        s1.put("tenantId", TENANT_ID);
        students.add(s1);

        Map<String, Object> s2 = new LinkedHashMap<>();
        s2.put("studentId", 3002L);
        s2.put("studentName", "Arun Kumar");
        s2.put("email", "arun@example.com");
        s2.put("phone", "+919876543210");
        s2.put("courseId", 501L);
        s2.put("enrolmentStatus", "PROSPECT");
        s2.put("tenantId", TENANT_ID);
        students.add(s2);

        // 4. Enquiries
        Map<String, Object> enq1 = new LinkedHashMap<>();
        enq1.put("enquiryId", 1001L);
        enq1.put("studentName", "Arun Kumar");
        enq1.put("email", "arun@example.com");
        enq1.put("phone", "+919876543210");
        enq1.put("courseId", 501L);
        enq1.put("source", "WEBSITE");
        enq1.put("academicYear", "2026-2027");
        enq1.put("notes", "Interested in Java Full Stack training");
        enq1.put("status", "ASSIGNED");
        enq1.put("assignedExecutiveId", 101L);
        enq1.put("assignedExecutiveName", "Priya");
        enq1.put("createdBy", 101L);
        enq1.put("createdAt", "2026-10-26T14:30:00+05:30");
        enq1.put("tenantId", TENANT_ID);
        enquiries.add(enq1);

        Map<String, Object> enq2 = new LinkedHashMap<>();
        enq2.put("enquiryId", 1002L);
        enq2.put("studentName", "Meena Raj");
        enq2.put("email", "meena@example.com");
        enq2.put("phone", "+919876543211");
        enq2.put("courseId", 501L);
        enq2.put("source", "PHONE");
        enq2.put("preferredContactMethod", "WHATSAPP");
        enq2.put("academicYear", "2026-2027");
        enq2.put("notes", "Interested in weekend Java classes");
        enq2.put("status", "QUALIFIED");
        enq2.put("assignedExecutiveId", 101L);
        enq2.put("assignedExecutiveName", "Priya");
        enq2.put("createdBy", 101L);
        enq2.put("createdAt", "2026-10-26T14:42:00+05:30");
        enq2.put("qualificationStatus", "QUALIFIED");
        enq2.put("educationLevel", "BSC");
        enq2.put("preferredSchedule", "WEEKEND");
        enq2.put("expectedJoiningDate", "2026-11-15");
        enq2.put("tenantId", TENANT_ID);
        enquiries.add(enq2);

        // 5. Applications
        Map<String, Object> app1 = new LinkedHashMap<>();
        app1.put("applicationId", 2001L);
        app1.put("enquiryId", 1001L);
        app1.put("studentName", "Arun Kumar");
        app1.put("courseId", 501L);
        app1.put("courseName", "Java Full Stack Development");
        app1.put("status", "UNDER_REVIEW");
        app1.put("academicYear", "2026-2027");
        app1.put("intake", "NOVEMBER_2026");
        app1.put("submittedAt", "2026-10-25T10:00:00+05:30");
        app1.put("assignedExecutiveId", 101L);
        app1.put("missingDocuments", new ArrayList<>());
        app1.put("tenantId", TENANT_ID);
        applications.add(app1);

        Map<String, Object> app2 = new LinkedHashMap<>();
        app2.put("applicationId", 2002L);
        app2.put("enquiryId", 1002L);
        app2.put("studentName", "Meena Raj");
        app2.put("courseId", 501L);
        app2.put("courseName", "Java Full Stack Development");
        app2.put("status", "SUBMITTED");
        app2.put("academicYear", "2026-2027");
        app2.put("intake", "NOVEMBER_2026");
        app2.put("submittedAt", "2026-10-26T14:54:00+05:30");
        app2.put("assignedExecutiveId", 101L);
        app2.put("missingDocuments", new ArrayList<>(List.of("IDENTITY_PROOF")));
        app2.put("tenantId", TENANT_ID);
        applications.add(app2);

        // 6. Application Documents
        Map<String, Object> doc1 = new LinkedHashMap<>();
        doc1.put("documentId", 901L);
        doc1.put("applicationId", 2002L);
        doc1.put("documentType", "EDUCATION_CERTIFICATE");
        doc1.put("fileName", "degree-certificate.pdf");
        doc1.put("storageKey", "education/tenant-files/2002/degree-certificate.pdf");
        doc1.put("verificationStatus", "PENDING");
        doc1.put("tenantId", TENANT_ID);
        applicationDocuments.add(doc1);

        // 7. Follow-ups
        Map<String, Object> f1 = new LinkedHashMap<>();
        f1.put("taskId", 701L);
        f1.put("enquiryId", 1001L);
        f1.put("studentName", "Arun Kumar");
        f1.put("taskType", "CALL");
        f1.put("title", "Initial follow-up call");
        f1.put("dueAt", "2026-10-26T16:00:00+05:30");
        f1.put("priority", "HIGH");
        f1.put("status", "PENDING");
        f1.put("assignedTo", 101L);
        f1.put("tenantId", TENANT_ID);
        followUps.add(f1);

        Map<String, Object> f2 = new LinkedHashMap<>();
        f2.put("taskId", 702L);
        f2.put("enquiryId", 1002L);
        f2.put("studentName", "Meena Raj");
        f2.put("taskType", "CALL");
        f2.put("title", "Discuss weekend batch options");
        f2.put("dueAt", "2026-10-28T11:00:00+05:30");
        f2.put("priority", "MEDIUM");
        f2.put("status", "COMPLETED");
        f2.put("outcome", "STUDENT_WANTS_TO_JOIN");
        f2.put("completedAt", "2026-10-28T11:15:00+05:30");
        f2.put("assignedTo", 101L);
        f2.put("tenantId", TENANT_ID);
        followUps.add(f2);

        // 8. Interactions
        Map<String, Object> i1 = new LinkedHashMap<>();
        i1.put("interactionId", 801L);
        i1.put("enquiryId", 1002L);
        i1.put("interactionType", "CALL");
        i1.put("direction", "OUTBOUND");
        i1.put("outcome", "INTERESTED");
        i1.put("notes", "Explained the course duration, curriculum, and available batches");
        i1.put("nextAction", "FOLLOW_UP");
        i1.put("nextActionAt", "2026-10-28T11:00:00+05:30");
        i1.put("createdBy", 101L);
        i1.put("createdAt", "2026-10-26T14:47:00+05:30");
        i1.put("tenantId", TENANT_ID);
        interactions.add(i1);

        // 9. Targets
        Map<String, Object> tg1 = new LinkedHashMap<>();
        tg1.put("targetId", 301L);
        tg1.put("name", "October Java Admissions");
        tg1.put("periodStart", "2026-10-01");
        tg1.put("periodEnd", "2026-10-31");
        tg1.put("courseId", 501L);
        tg1.put("targetAdmissions", 100);
        tg1.put("targetApplications", 180);
        tg1.put("currentAdmissions", 76);
        tg1.put("currentApplications", 145);
        tg1.put("status", "ACTIVE");
        tg1.put("tenantId", TENANT_ID);
        targets.add(tg1);

        // 10. Support Tickets
        Map<String, Object> tk1 = new LinkedHashMap<>();
        tk1.put("ticketId", 4001L);
        tk1.put("studentId", 3001L);
        tk1.put("studentName", "Meena Raj");
        tk1.put("subject", "Unable to access learning portal");
        tk1.put("description", "My account accepts the password but does not open the course page.");
        tk1.put("category", "LEARNING_PLATFORM");
        tk1.put("priority", "HIGH");
        tk1.put("status", "OPEN");
        tk1.put("channel", "EMAIL");
        tk1.put("assignedAgentId", 201L);
        tk1.put("createdAt", "2026-10-26T15:01:00+05:30");
        tk1.put("tenantId", TENANT_ID);
        supportTickets.add(tk1);

        // 11. Support Messages & Notes
        Map<String, Object> msg1 = new LinkedHashMap<>();
        msg1.put("messageId", 5001L);
        msg1.put("ticketId", 4001L);
        msg1.put("messageType", "PUBLIC_REPLY");
        msg1.put("channel", "EMAIL");
        msg1.put("content", "Hello Meena, we can help you troubleshoot the learning portal. Please confirm whether the issue occurs after signing in on another browser as well.");
        msg1.put("deliveryStatus", "QUEUED");
        msg1.put("createdBy", 201L);
        msg1.put("createdAt", "2026-10-26T15:03:00+05:30");
        msg1.put("tenantId", TENANT_ID);
        supportMessages.add(msg1);

        Map<String, Object> note1 = new LinkedHashMap<>();
        note1.put("noteId", 6001L);
        note1.put("ticketId", 4001L);
        note1.put("visibility", "INTERNAL");
        note1.put("content", "Check whether the student's account is activated in the learning management system.");
        note1.put("createdBy", 201L);
        note1.put("createdAt", "2026-10-26T15:04:00+05:30");
        note1.put("tenantId", TENANT_ID);
        internalNotes.add(note1);

        // 12. Complaints
        Map<String, Object> comp1 = new LinkedHashMap<>();
        comp1.put("complaintId", 7001L);
        comp1.put("studentId", 3001L);
        comp1.put("category", "COURSE_DELIVERY");
        comp1.put("subject", "Class schedule changed without notification");
        comp1.put("description", "I was not informed about the revised class schedule.");
        comp1.put("priority", "MEDIUM");
        comp1.put("status", "OPEN");
        comp1.put("createdAt", "2026-10-26T15:12:00+05:30");
        comp1.put("tenantId", TENANT_ID);
        complaints.add(comp1);

        // 13. Counselling Profiles
        Map<String, Object> cp1 = new LinkedHashMap<>();
        cp1.put("studentId", 3001L);
        cp1.put("educationLevel", "BSC");
        cp1.put("careerGoal", "Become a Java Full Stack Developer");
        cp1.put("interests", new ArrayList<>(List.of("JAVA", "BACKEND_DEVELOPMENT", "WEB_DEVELOPMENT")));
        cp1.put("preferredLearningMode", "WEEKEND");
        cp1.put("preferredCounsellingLanguage", "ENGLISH");
        cp1.put("notes", "Interested in structured training with practical projects");
        cp1.put("updatedAt", "2026-10-26T15:16:00+05:30");
        counsellingProfiles.put(3001L, cp1);

        // 14. Needs Assessments
        Map<String, Object> as1 = new LinkedHashMap<>();
        as1.put("assessmentId", 9001L);
        as1.put("studentId", 3001L);
        as1.put("assessmentType", "CAREER_GUIDANCE");
        as1.put("currentEducation", "BSC");
        as1.put("currentSkillLevel", "BEGINNER");
        as1.put("goals", new ArrayList<>(List.of("LEARN_JAVA", "BUILD_PROJECTS", "PREPARE_FOR_INTERVIEWS")));
        as1.put("preferredDurationWeeks", 24);
        as1.put("preferredLearningMode", "WEEKEND");
        as1.put("counsellorNotes", "Recommend reviewing the student's schedule and technical background before selecting a course.");
        as1.put("status", "COMPLETED");
        as1.put("recordedBy", 401L);
        as1.put("recordedAt", "2026-10-26T15:18:00+05:30");
        as1.put("tenantId", TENANT_ID);
        counsellingAssessments.add(as1);

        // 15. Appointments
        Map<String, Object> ap1 = new LinkedHashMap<>();
        ap1.put("appointmentId", 8001L);
        ap1.put("studentId", 3001L);
        ap1.put("studentName", "Meena Raj");
        ap1.put("counsellorId", 401L);
        ap1.put("appointmentType", "COURSE_GUIDANCE");
        ap1.put("startAt", "2026-10-26T16:00:00+05:30");
        ap1.put("endAt", "2026-10-26T16:30:00+05:30");
        ap1.put("type", "COURSE_GUIDANCE");
        ap1.put("status", "CONFIRMED");
        ap1.put("tenantId", TENANT_ID);
        counsellingAppointments.add(ap1);

        Map<String, Object> ap2 = new LinkedHashMap<>();
        ap2.put("appointmentId", 8002L);
        ap2.put("studentId", 3001L);
        ap2.put("studentName", "Meena Raj");
        ap2.put("counsellorId", 401L);
        ap2.put("appointmentType", "COURSE_GUIDANCE");
        ap2.put("startAt", "2026-10-28T16:00:00+05:30");
        ap2.put("endAt", "2026-10-28T16:30:00+05:30");
        ap2.put("durationMinutes", 30);
        ap2.put("meetingMode", "ONLINE");
        ap2.put("notes", "Discuss course suitability and learning schedule");
        ap2.put("status", "CONFIRMED");
        ap2.put("tenantId", TENANT_ID);
        counsellingAppointments.add(ap2);

        // 16. Counselling Session Notes
        Map<String, Object> cn1 = new LinkedHashMap<>();
        cn1.put("noteId", 9101L);
        cn1.put("appointmentId", 8002L);
        cn1.put("studentId", 3001L);
        cn1.put("sessionSummary", "Discussed the student's technical background and interest in full-stack development.");
        cn1.put("studentConcerns", new ArrayList<>(List.of("Course duration", "Weekend batch availability")));
        cn1.put("agreedNextSteps", new ArrayList<>(List.of("Review the published curriculum", "Confirm preferred batch")));
        cn1.put("followUpRequired", true);
        cn1.put("followUpAt", "2026-10-30T11:00:00+05:30");
        cn1.put("createdBy", 401L);
        cn1.put("createdAt", "2026-10-28T16:35:00+05:30");
        cn1.put("tenantId", TENANT_ID);
        counsellingNotes.add(cn1);

        // 17. Action Plans
        Map<String, Object> pl1 = new LinkedHashMap<>();
        pl1.put("planId", 9201L);
        pl1.put("studentId", 3001L);
        pl1.put("title", "Java Full Stack Learning Plan");
        pl1.put("description", "Review the curriculum, confirm the training schedule, and identify initial learning goals.");
        pl1.put("items", new ArrayList<>(List.of(
                Map.of("title", "Review course curriculum", "dueDate", "2026-10-30", "completed", false),
                Map.of("title", "Confirm preferred batch", "dueDate", "2026-11-01", "completed", false)
        )));
        pl1.put("targetDate", "2026-11-01");
        pl1.put("status", "ACTIVE");
        pl1.put("completedItems", 0);
        pl1.put("totalItems", 2);
        pl1.put("tenantId", TENANT_ID);
        actionPlans.add(pl1);

        // 18. Referrals
        Map<String, Object> ref1 = new LinkedHashMap<>();
        ref1.put("referralId", 9301L);
        ref1.put("studentId", 3001L);
        ref1.put("referralType", "ADMISSION");
        ref1.put("relatedCourseId", 501L);
        ref1.put("reason", "Student wants to discuss the application process");
        ref1.put("notes", "Student has completed the initial course-guidance session");
        ref1.put("status", "PENDING_ASSIGNMENT");
        ref1.put("createdAt", "2026-10-26T15:28:00+05:30");
        ref1.put("tenantId", TENANT_ID);
        referrals.add(ref1);

        // 19. Knowledge Base
        Map<String, Object> kb1 = new LinkedHashMap<>();
        kb1.put("sourceId", "KB-101");
        kb1.put("title", "Learning Portal Troubleshooting");
        kb1.put("category", "LEARNING_PLATFORM_HELP");
        kb1.put("content", "Clear browser cache or use Google Chrome/Mozilla Firefox. Verify credentials with student registry.");
        kb1.put("tenantId", TENANT_ID);
        knowledgeBase.add(kb1);

        Map<String, Object> kb2 = new LinkedHashMap<>();
        kb2.put("sourceId", "KB-102");
        kb2.put("title", "Certificate Issuance & Verification Policy");
        kb2.put("category", "CERTIFICATE");
        kb2.put("content", "Certificates are published 14 days after completion and project submission verification.");
        kb2.put("tenantId", TENANT_ID);
        knowledgeBase.add(kb2);

        // 20. AI Activity Seed
        Map<String, Object> aiAct = new LinkedHashMap<>();
        aiAct.put("activityId", "AI-ACT-001");
        aiAct.put("type", "FOLLOW_UP_DRAFT");
        aiAct.put("actorId", 101L);
        aiAct.put("studentName", "Meena Raj");
        aiAct.put("channel", "EMAIL");
        aiAct.put("status", "DRAFT");
        aiAct.put("summary", "Generated friendly course information follow-up draft");
        aiAct.put("createdAt", "2026-10-26T14:55:00+05:30");
        aiAct.put("tenantId", TENANT_ID);
        aiActivities.add(aiAct);

        // 21. AI Admission Agent Configuration
        aiAdmissionConfig.put("enabled", true);
        aiAdmissionConfig.put("agentName", "Zenelait AI Admission Assistant");
        aiAdmissionConfig.put("supportedChannels", new ArrayList<>(List.of("WEBSITE_CHAT", "WHATSAPP", "EMAIL")));
        aiAdmissionConfig.put("supportedLanguages", new ArrayList<>(List.of("en", "ta")));
        Map<String, Object> caps = new LinkedHashMap<>();
        caps.put("answerCourseQuestions", true);
        caps.put("captureLeads", true);
        caps.put("qualifyStudents", true);
        caps.put("recommendCourses", true);
        caps.put("initiateApplications", true);
        caps.put("scheduleCounselling", true);
        caps.put("createFollowUps", true);
        caps.put("humanHandoff", true);
        aiAdmissionConfig.put("capabilities", caps);
        aiAdmissionConfig.put("requireConsentForProactiveMessages", true);
        aiAdmissionConfig.put("requireHumanApprovalForOutboundMessages", true);
        aiAdmissionConfig.put("updatedAt", "2026-10-27T15:00:00+05:30");
        aiAdmissionConfig.put("tenantId", TENANT_ID);

        // 22. Seed AI Admission Session & Messages
        Map<String, Object> sess1 = new LinkedHashMap<>();
        sess1.put("sessionId", "adm_session_1001");
        sess1.put("channel", "WEBSITE_CHAT");
        sess1.put("status", "ACTIVE");
        sess1.put("language", "en");
        sess1.put("studentName", "Arun Kumar");
        sess1.put("visitor", Map.of("name", "Arun Kumar", "email", "arun@example.com", "phone", "+919876543210"));
        sess1.put("intent", "COURSE_INFORMATION");
        sess1.put("leadId", 1201L);
        sess1.put("assignedEmployeeId", null);
        sess1.put("lastMessageAt", "2026-10-27T15:11:00+05:30");
        sess1.put("createdAt", "2026-10-27T15:10:00+05:30");
        sess1.put("tenantId", TENANT_ID);
        aiAdmissionSessions.add(sess1);

        Map<String, Object> m1 = new LinkedHashMap<>();
        m1.put("messageId", "msg_1001");
        m1.put("sessionId", "adm_session_1001");
        m1.put("sender", "STUDENT");
        m1.put("content", "What is the duration and fee of the Java Full Stack course?");
        m1.put("createdAt", "2026-10-27T15:11:00+05:30");
        m1.put("tenantId", TENANT_ID);
        aiAdmissionMessages.add(m1);

        Map<String, Object> m2 = new LinkedHashMap<>();
        m2.put("messageId", "msg_1002");
        m2.put("sessionId", "adm_session_1001");
        m2.put("sender", "AI_ADMISSION_AGENT");
        m2.put("content", "The Java Full Stack Development course has a published duration of 24 weeks. The listed course fee is ₹30,000. Please confirm the available batch and current fee with our admission team.");
        m2.put("intent", "COURSE_INFORMATION");
        m2.put("requiresHumanHandoff", false);
        m2.put("knowledgeSources", List.of(Map.of("sourceType", "COURSE_DATABASE", "sourceId", "501")));
        m2.put("createdAt", "2026-10-27T15:11:00+05:30");
        m2.put("tenantId", TENANT_ID);
        aiAdmissionMessages.add(m2);

        // 23. Seed AI Knowledge Sources
        Map<String, Object> aiKb1 = new LinkedHashMap<>();
        aiKb1.put("sourceId", "KB-101");
        aiKb1.put("title", "Java Course Information");
        aiKb1.put("sourceType", "DOCUMENT");
        aiKb1.put("storageKey", "knowledge/java-course-information.pdf");
        aiKb1.put("language", "en");
        aiKb1.put("enabled", true);
        aiKb1.put("status", "INDEXED");
        aiKb1.put("lastSyncedAt", "2026-10-26T10:00:00+05:30");
        aiKb1.put("createdAt", "2026-10-26T09:00:00+05:30");
        aiKb1.put("tenantId", TENANT_ID);
        aiAdmissionKnowledgeSources.add(aiKb1);

        Map<String, Object> aiKb2 = new LinkedHashMap<>();
        aiKb2.put("sourceId", "KB-102");
        aiKb2.put("title", "Admission Policy & Eligibility Guide");
        aiKb2.put("sourceType", "DOCUMENT");
        aiKb2.put("storageKey", "knowledge/admission-policy.pdf");
        aiKb2.put("language", "en");
        aiKb2.put("enabled", true);
        aiKb2.put("status", "INDEXED");
        aiKb2.put("lastSyncedAt", "2026-10-26T10:05:00+05:30");
        aiKb2.put("createdAt", "2026-10-26T09:15:00+05:30");
        aiKb2.put("tenantId", TENANT_ID);
        aiAdmissionKnowledgeSources.add(aiKb2);

        // 24. Seed AI Admission Audit Events
        Map<String, Object> aud1 = new LinkedHashMap<>();
        aud1.put("eventId", "audit_1001");
        aud1.put("eventType", "LEAD_CREATED");
        aud1.put("actorType", "AI_AGENT");
        aud1.put("actorId", "AI_ADMISSION_AGENT");
        aud1.put("resourceType", "ADMISSION_LEAD");
        aud1.put("resourceId", "1201");
        aud1.put("createdAt", "2026-10-27T15:16:00+05:30");
        aud1.put("tenantId", TENANT_ID);
        aiAdmissionAuditEvents.add(aud1);

        // 25. Seed AI Follow-up Configuration
        aiFollowUpConfig.put("enabled", true);
        aiFollowUpConfig.put("defaultChannel", "EMAIL");
        aiFollowUpConfig.put("humanApprovalRequired", true);
        aiFollowUpConfig.put("respectContactPreferences", true);
        aiFollowUpConfig.put("stopAfterStudentReply", true);
        aiFollowUpConfig.put("maxAutomatedMessagesPerLeadPerWeek", 3);
        aiFollowUpConfig.put("minimumHoursBetweenMessages", 24);
        Map<String, Object> contactHours = new LinkedHashMap<>();
        contactHours.put("start", "09:00");
        contactHours.put("end", "18:00");
        contactHours.put("timeZone", "Asia/Kolkata");
        aiFollowUpConfig.put("permittedContactHours", contactHours);
        aiFollowUpConfig.put("updatedAt", "2026-10-27T15:40:00+05:30");
        aiFollowUpConfig.put("tenantId", TENANT_ID);

        // 26. Seed AI Follow-up Rules
        Map<String, Object> r1 = new LinkedHashMap<>();
        r1.put("ruleId", 601L);
        r1.put("name", "New Admission Enquiry Follow-up");
        r1.put("triggerType", "ENQUIRY_CREATED");
        r1.put("delayMinutes", 1440);
        r1.put("channel", "EMAIL");
        r1.put("conditions", Map.of("leadStatusIn", List.of("NEW", "CONTACTED"), "marketingConsentRequired", true, "stopIfApplicationSubmitted", true, "stopIfStudentReplies", true));
        r1.put("messageTemplateId", "EDU_ADMISSION_FOLLOWUP_01");
        r1.put("requiresApproval", true);
        r1.put("maxExecutionsPerLead", 1);
        r1.put("status", "ACTIVE");
        r1.put("activatedAt", "2026-10-26T10:00:00+05:30");
        r1.put("tenantId", TENANT_ID);
        aiFollowUpRules.add(r1);

        Map<String, Object> r2 = new LinkedHashMap<>();
        r2.put("ruleId", 602L);
        r2.put("name", "Incomplete Application Reminder");
        r2.put("triggerType", "APPLICATION_INCOMPLETE");
        r2.put("delayMinutes", 2880);
        r2.put("channel", "EMAIL");
        r2.put("conditions", Map.of("stopIfApplicationSubmitted", true, "stopIfStudentReplies", true));
        r2.put("messageTemplateId", "EDU_APP_INCOMPLETE_02");
        r2.put("requiresApproval", true);
        r2.put("maxExecutionsPerLead", 2);
        r2.put("status", "ACTIVE");
        r2.put("activatedAt", "2026-10-26T11:00:00+05:30");
        r2.put("tenantId", TENANT_ID);
        aiFollowUpRules.add(r2);

        // 27. Seed AI Follow-up Tasks
        Map<String, Object> t1 = new LinkedHashMap<>();
        t1.put("taskId", 7101L);
        t1.put("leadId", 1201L);
        t1.put("leadName", "Arun Kumar");
        t1.put("taskType", "COURSE_INFORMATION");
        t1.put("channel", "EMAIL");
        t1.put("status", "SCHEDULED");
        t1.put("scheduledAt", "2026-10-29T11:00:00+05:30");
        t1.put("timeZone", "Asia/Kolkata");
        t1.put("reason", "Student requested time to review course information");
        t1.put("requiresApproval", true);
        t1.put("createdBy", "AI_FOLLOWUP_AGENT");
        t1.put("lastExecutionId", null);
        t1.put("tenantId", TENANT_ID);
        aiFollowUpTasks.add(t1);

        // 28. Seed AI Follow-up Draft
        Map<String, Object> dr1 = new LinkedHashMap<>();
        dr1.put("draftId", "draft_8001");
        dr1.put("leadId", 1201L);
        dr1.put("leadName", "Arun Kumar");
        dr1.put("taskId", 7101L);
        dr1.put("channel", "EMAIL");
        dr1.put("purpose", "COURSE_INFORMATION_FOLLOW_UP");
        dr1.put("tone", "FRIENDLY");
        dr1.put("language", "en");
        dr1.put("subject", "Following up on your course enquiry");
        dr1.put("body", "Hello Arun, I am following up on your interest in our course. Would you like any additional information about the curriculum or available batches? Please let us know if you would like to discuss the details with our admission team.");
        dr1.put("status", "PENDING_APPROVAL");
        dr1.put("requiresApproval", true);
        dr1.put("approvedBy", null);
        dr1.put("approvedAt", null);
        dr1.put("sentAt", null);
        dr1.put("generatedAt", "2026-10-27T15:53:00+05:30");
        dr1.put("tenantId", TENANT_ID);
        aiFollowUpDrafts.add(dr1);

        // 29. Seed AI Follow-up Execution
        Map<String, Object> ex1 = new LinkedHashMap<>();
        ex1.put("executionId", "exec_9001");
        ex1.put("taskId", 7101L);
        ex1.put("draftId", "draft_8001");
        ex1.put("channel", "EMAIL");
        ex1.put("status", "QUEUED");
        ex1.put("deliveryStatus", "PENDING");
        ex1.put("attemptCount", 0);
        ex1.put("providerMessageId", null);
        ex1.put("lastError", null);
        ex1.put("createdAt", "2026-10-27T15:57:00+05:30");
        ex1.put("tenantId", TENANT_ID);
        aiFollowUpExecutions.add(ex1);

        // 30. Seed AI Follow-up Suppression
        Map<String, Object> sup1 = new LinkedHashMap<>();
        sup1.put("suppressionId", "supp_1001");
        sup1.put("leadId", 1201L);
        sup1.put("channel", "EMAIL");
        sup1.put("scope", "MARKETING_MESSAGES");
        sup1.put("reason", "STUDENT_OPTED_OUT");
        sup1.put("status", "ACTIVE");
        sup1.put("effectiveAt", "2026-10-27T16:01:00+05:30");
        sup1.put("tenantId", TENANT_ID);
        aiFollowUpSuppressions.add(sup1);

        // 31. Seed AI Follow-up Audit Events
        Map<String, Object> audFu1 = new LinkedHashMap<>();
        audFu1.put("eventId", "audit_fu_1001");
        audFu1.put("eventType", "FOLLOWUP_DRAFT_APPROVED");
        audFu1.put("actorType", "USER");
        audFu1.put("actorId", "10");
        audFu1.put("resourceType", "FOLLOWUP_DRAFT");
        audFu1.put("resourceId", "draft_8001");
        audFu1.put("createdAt", "2026-10-27T15:56:00+05:30");
        audFu1.put("tenantId", TENANT_ID);
        aiFollowUpAuditEvents.add(audFu1);

        Map<String, Object> audFu2 = new LinkedHashMap<>();
        audFu2.put("eventId", "audit_fu_1002");
        audFu2.put("eventType", "FOLLOWUP_MESSAGE_QUEUED");
        audFu2.put("actorType", "USER");
        audFu2.put("actorId", "10");
        audFu2.put("resourceType", "FOLLOWUP_EXECUTION");
        audFu2.put("resourceId", "exec_9001");
        audFu2.put("createdAt", "2026-10-27T15:57:00+05:30");
        audFu2.put("tenantId", TENANT_ID);
        aiFollowUpAuditEvents.add(audFu2);
    }
}
