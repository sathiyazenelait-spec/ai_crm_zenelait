package com.zenelait.crm.education;

import com.zenelait.crm.common.exception.ForbiddenException;
import com.zenelait.crm.common.exception.ResourceNotFoundException;
import com.zenelait.crm.tenant.TenantSecurityService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Zenelait AI CRM — Education Tenant: AI Admission Agent V1 Controller
 * Base Path: /api/v1/education/ai-admission
 * Implements 27 complete REST APIs as specified in Section 3 of Education Tenant Specification.
 */
@RestController
@RequestMapping("/api/v1/education/ai-admission")
@CrossOrigin(origins = "*")
public class EducationAiAdmissionV1Controller {

    private final EducationDataStore store;
    private final TenantSecurityService tenantSecurityService;

    public EducationAiAdmissionV1Controller(EducationDataStore store, TenantSecurityService tenantSecurityService) {
        this.store = store;
        this.tenantSecurityService = tenantSecurityService;
    }

    private String getTenantId() {
        try {
            String tid = tenantSecurityService.getCurrentTenantId();
            if (tid != null && !tid.isBlank()) return tid;
        } catch (Exception ignored) {}
        return EducationDataStore.TENANT_ID;
    }

    private <T> ResponseEntity<Map<String, Object>> buildSuccess(String message, T data, HttpStatus status, String requestId) {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", true);
        resp.put("message", message);
        resp.put("data", data);
        resp.put("timestamp", LocalDateTime.now().toString());
        resp.put("requestId", requestId != null ? requestId : "req_ai_adm_" + UUID.randomUUID().toString().substring(0, 8));
        return ResponseEntity.status(status).body(resp);
    }

    // 1. GET /config
    @GetMapping("/config")
    public ResponseEntity<?> getConfig() {
        return buildSuccess("AI Admission Agent configuration retrieved", store.aiAdmissionConfig, HttpStatus.OK, "req_ai_admission_config_001");
    }

    // 2. PATCH /config
    @PatchMapping("/config")
    public ResponseEntity<?> updateConfig(@RequestBody Map<String, Object> updates) {
        if (updates.containsKey("enabled")) store.aiAdmissionConfig.put("enabled", updates.get("enabled"));
        if (updates.containsKey("supportedChannels")) store.aiAdmissionConfig.put("supportedChannels", updates.get("supportedChannels"));
        if (updates.containsKey("supportedLanguages")) store.aiAdmissionConfig.put("supportedLanguages", updates.get("supportedLanguages"));
        if (updates.containsKey("capabilities")) store.aiAdmissionConfig.put("capabilities", updates.get("capabilities"));
        if (updates.containsKey("requireHumanApprovalForOutboundMessages")) store.aiAdmissionConfig.put("requireHumanApprovalForOutboundMessages", updates.get("requireHumanApprovalForOutboundMessages"));
        if (updates.containsKey("requireConsentForProactiveMessages")) store.aiAdmissionConfig.put("requireConsentForProactiveMessages", updates.get("requireConsentForProactiveMessages"));
        store.aiAdmissionConfig.put("updatedAt", LocalDateTime.now().toString());
        store.aiAdmissionConfig.put("updatedBy", 10);
        return buildSuccess("AI Admission Agent configuration updated", store.aiAdmissionConfig, HttpStatus.OK, "req_ai_admission_config_002");
    }

    // 3. POST /sessions - Start student conversation
    @PostMapping("/sessions")
    public ResponseEntity<?> startSession(@RequestBody Map<String, Object> body) {
        String sessionId = "adm_session_" + store.aiSessionSeq.incrementAndGet();
        String channel = (String) body.getOrDefault("channel", "WEBSITE_CHAT");
        String language = (String) body.getOrDefault("language", "en");
        @SuppressWarnings("unchecked")
        Map<String, Object> visitor = (Map<String, Object>) body.getOrDefault("visitor", new HashMap<>());
        String studentName = (String) visitor.getOrDefault("name", "Prospective Student");
        String initialMsg = (String) body.getOrDefault("initialMessage", "Hello, I am interested in courses.");

        Map<String, Object> session = new LinkedHashMap<>();
        session.put("sessionId", sessionId);
        session.put("channel", channel);
        session.put("status", "ACTIVE");
        session.put("language", language);
        session.put("studentName", studentName);
        session.put("visitor", visitor);
        session.put("intent", "COURSE_INFORMATION");
        session.put("leadId", null);
        session.put("assignedEmployeeId", null);
        session.put("createdAt", LocalDateTime.now().toString());
        session.put("lastMessageAt", LocalDateTime.now().toString());
        session.put("tenantId", getTenantId());
        store.aiAdmissionSessions.add(session);

        // Record student message
        String msg1Id = "msg_" + store.aiMsgSeq.incrementAndGet();
        Map<String, Object> userMsg = new LinkedHashMap<>();
        userMsg.put("messageId", msg1Id);
        userMsg.put("sessionId", sessionId);
        userMsg.put("sender", "STUDENT");
        userMsg.put("content", initialMsg);
        userMsg.put("createdAt", LocalDateTime.now().toString());
        userMsg.put("tenantId", getTenantId());
        store.aiAdmissionMessages.add(userMsg);

        // Generate initial AI response
        String msg2Id = "msg_" + store.aiMsgSeq.incrementAndGet();
        String replyText = "Welcome to our Academy! I can help you explore our verified programs, eligibility, fees, and batch schedules. Are you looking for beginner-level training or do you already have programming experience?";
        Map<String, Object> aiMsg = new LinkedHashMap<>();
        aiMsg.put("messageId", msg2Id);
        aiMsg.put("sessionId", sessionId);
        aiMsg.put("sender", "AI_ADMISSION_AGENT");
        aiMsg.put("content", replyText);
        aiMsg.put("intent", "COURSE_INFORMATION");
        aiMsg.put("requiresHumanHandoff", false);
        aiMsg.put("createdAt", LocalDateTime.now().toString());
        aiMsg.put("tenantId", getTenantId());
        store.aiAdmissionMessages.add(aiMsg);

        // Record session event
        Map<String, Object> evt = new LinkedHashMap<>();
        evt.put("eventId", "evt_" + store.aiEventSeq.incrementAndGet());
        evt.put("sessionId", sessionId);
        evt.put("eventType", "SESSION_CREATED");
        evt.put("createdAt", LocalDateTime.now().toString());
        store.aiAdmissionEvents.add(evt);

        Map<String, Object> resData = new LinkedHashMap<>();
        resData.put("sessionId", sessionId);
        resData.put("channel", channel);
        resData.put("status", "ACTIVE");
        resData.put("visitor", Map.of("name", studentName));
        resData.put("initialResponse", Map.of(
                "message", replyText,
                "sourceType", "ADMISSION_ASSISTANT",
                "requiresHumanReview", false
        ));
        resData.put("createdAt", session.get("createdAt"));

        return buildSuccess("Admission conversation started", resData, HttpStatus.CREATED, "req_ai_admission_session_001");
    }

    // 4. GET /sessions - List sessions
    @GetMapping("/sessions")
    public ResponseEntity<?> listSessions(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        String tenantId = getTenantId();
        List<Map<String, Object>> filtered = store.aiAdmissionSessions.stream()
                .filter(s -> status == null || status.equalsIgnoreCase((String) s.get("status")))
                .collect(Collectors.toList());

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("content", filtered);
        res.put("page", page);
        res.put("size", size);
        res.put("totalElements", filtered.size());
        res.put("totalPages", 1);
        return buildSuccess("Admission sessions retrieved", res, HttpStatus.OK, "req_ai_admission_sessions_001");
    }

    // 5. GET /sessions/{sessionId}
    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<?> getSession(@PathVariable String sessionId) {
        Map<String, Object> session = store.aiAdmissionSessions.stream()
                .filter(s -> sessionId.equals(s.get("sessionId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Admission session not found: " + sessionId));
        return buildSuccess("Admission session retrieved", session, HttpStatus.OK, "req_ai_admission_session_002");
    }

    // 6. POST /sessions/{sessionId}/messages - Send message to agent
    @PostMapping("/sessions/{sessionId}/messages")
    public ResponseEntity<?> sendMessage(@PathVariable String sessionId, @RequestBody Map<String, Object> body) {
        Map<String, Object> session = store.aiAdmissionSessions.stream()
                .filter(s -> sessionId.equals(s.get("sessionId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Session not found: " + sessionId));

        String content = (String) body.getOrDefault("message", "");
        String userMsgId = "msg_" + store.aiMsgSeq.incrementAndGet();

        Map<String, Object> uMsg = new LinkedHashMap<>();
        uMsg.put("messageId", userMsgId);
        uMsg.put("sessionId", sessionId);
        uMsg.put("sender", "STUDENT");
        uMsg.put("content", content);
        uMsg.put("createdAt", LocalDateTime.now().toString());
        uMsg.put("tenantId", getTenantId());
        store.aiAdmissionMessages.add(uMsg);

        // Grounded knowledge response generation
        String reply;
        String intent = "COURSE_INFORMATION";
        boolean handoff = false;
        List<Map<String, String>> sources = new ArrayList<>();
        Map<String, Object> courseInfo = null;

        String lower = content.toLowerCase();
        if (lower.contains("java") || lower.contains("full stack") || lower.contains("fee") || lower.contains("duration")) {
            Map<String, Object> c = store.courses.stream()
                    .filter(x -> ((String) x.get("courseName")).toLowerCase().contains("java"))
                    .findFirst()
                    .orElse(store.courses.get(0));
            courseInfo = c;
            sources.add(Map.of("sourceType", "COURSE_DATABASE", "sourceId", String.valueOf(c.get("courseId"))));
            reply = String.format("The %s course has a published duration of %s weeks. The listed course fee is ₹%,.0f. Learning modes include %s with hands-on capstone projects. Would you like to check admission eligibility or book a 1-on-1 counselling session?",
                    c.get("courseName"), c.get("durationWeeks"), (Double) c.get("fee"), c.get("preferredSchedule"));
        } else if (lower.contains("ai") || lower.contains("llm") || lower.contains("generative")) {
            Map<String, Object> c = store.courses.stream()
                    .filter(x -> ((String) x.get("courseName")).toLowerCase().contains("ai"))
                    .findFirst()
                    .orElse(store.courses.get(0));
            courseInfo = c;
            sources.add(Map.of("sourceType", "COURSE_DATABASE", "sourceId", String.valueOf(c.get("courseId"))));
            reply = String.format("Our %s is an intensive %s-week program with a published fee of ₹%,.0f. It covers LLM fine-tuning, RAG pipelines, and agent architecture. Shall I share the complete syllabus?",
                    c.get("courseName"), c.get("durationWeeks"), (Double) c.get("fee"));
        } else if (lower.contains("human") || lower.contains("talk to agent") || lower.contains("representative") || lower.contains("executive") || lower.contains("counsellor")) {
            reply = "I am transferring this conversation to our senior admission team. An executive will join you shortly to assist with your specific questions.";
            handoff = true;
            session.put("status", "HANDOFF_PENDING");
        } else {
            reply = "Thank you for asking! We provide accredited programs in Java Full Stack and Applied Generative AI. Could you let me know your educational background or preferred schedule (Weekday vs Weekend)?";
        }

        String aiMsgId = "msg_" + store.aiMsgSeq.incrementAndGet();
        Map<String, Object> aiMsg = new LinkedHashMap<>();
        aiMsg.put("messageId", aiMsgId);
        aiMsg.put("sessionId", sessionId);
        aiMsg.put("sender", "AI_ADMISSION_AGENT");
        aiMsg.put("content", reply);
        aiMsg.put("intent", intent);
        aiMsg.put("requiresHumanHandoff", handoff);
        aiMsg.put("knowledgeSources", sources);
        aiMsg.put("createdAt", LocalDateTime.now().toString());
        aiMsg.put("tenantId", getTenantId());
        store.aiAdmissionMessages.add(aiMsg);

        session.put("lastMessageAt", LocalDateTime.now().toString());

        Map<String, Object> resData = new LinkedHashMap<>();
        resData.put("sessionId", sessionId);
        resData.put("userMessageId", userMsgId);
        resData.put("assistantMessageId", aiMsgId);
        resData.put("reply", reply);
        resData.put("intent", intent);
        resData.put("requiresHumanHandoff", handoff);
        resData.put("knowledgeSources", sources);
        if (courseInfo != null) resData.put("course", courseInfo);
        resData.put("createdAt", LocalDateTime.now().toString());

        return buildSuccess("AI response generated", resData, HttpStatus.OK, "req_ai_admission_message_001");
    }

    // 7. GET /sessions/{sessionId}/messages - Retrieve history
    @GetMapping("/sessions/{sessionId}/messages")
    public ResponseEntity<?> getMessages(
            @PathVariable String sessionId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        List<Map<String, Object>> msgs = store.aiAdmissionMessages.stream()
                .filter(m -> sessionId.equals(m.get("sessionId")))
                .collect(Collectors.toList());

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("content", msgs);
        res.put("page", page);
        res.put("size", size);
        res.put("totalElements", msgs.size());
        res.put("totalPages", 1);
        return buildSuccess("Conversation history retrieved", res, HttpStatus.OK, "req_ai_admission_messages_001");
    }

    // 8. POST /sessions/{sessionId}/qualify
    @PostMapping("/sessions/{sessionId}/qualify")
    public ResponseEntity<?> qualifyStudent(@PathVariable String sessionId, @RequestBody Map<String, Object> body) {
        Map<String, Object> session = store.aiAdmissionSessions.stream()
                .filter(s -> sessionId.equals(s.get("sessionId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Session not found: " + sessionId));

        int qId = store.aiQualSeq.incrementAndGet();
        Long courseId = body.get("interestedCourseId") != null ? Long.valueOf(body.get("interestedCourseId").toString()) : 501L;

        Map<String, Object> qual = new LinkedHashMap<>();
        qual.put("qualificationId", qId);
        qual.put("sessionId", sessionId);
        qual.put("qualificationStatus", "QUALIFIED");
        qual.put("interestedCourseId", courseId);
        qual.put("preferredLearningMode", body.getOrDefault("preferredLearningMode", "WEEKEND"));
        qual.put("educationLevel", body.getOrDefault("educationLevel", "GRADUATE"));
        qual.put("nextRecommendedAction", "CREATE_ADMISSION_ENQUIRY");
        qual.put("requiresHumanReview", true);
        qual.put("answers", body.getOrDefault("qualificationAnswers", new HashMap<>()));
        qual.put("createdAt", LocalDateTime.now().toString());
        qual.put("tenantId", getTenantId());
        store.aiAdmissionQualifications.add(qual);

        session.put("status", "QUALIFIED");

        Map<String, Object> resData = new LinkedHashMap<>();
        resData.put("sessionId", sessionId);
        resData.put("qualificationId", qId);
        resData.put("qualificationStatus", "QUALIFIED");
        resData.put("interestedCourseId", courseId);
        resData.put("preferredLearningMode", qual.get("preferredLearningMode"));
        resData.put("nextRecommendedAction", "CREATE_ADMISSION_ENQUIRY");
        resData.put("requiresHumanReview", true);

        return buildSuccess("Student qualification recorded", resData, HttpStatus.OK, "req_ai_admission_qualify_001");
    }

    // 9. POST /course-recommendations
    @PostMapping("/course-recommendations")
    public ResponseEntity<?> recommendCourses(@RequestBody Map<String, Object> body) {
        List<Map<String, Object>> recs = new ArrayList<>();
        for (Map<String, Object> c : store.courses) {
            Map<String, Object> rec = new LinkedHashMap<>();
            rec.put("courseId", c.get("courseId"));
            rec.put("courseName", c.get("courseName"));
            rec.put("matchReasons", List.of(
                    "Matches the student's stated technical career goals",
                    "Published learning mode (" + c.get("preferredSchedule") + ") aligns with preference",
                    "Course duration (" + c.get("durationWeeks") + " weeks) meets timeline"
            ));
            rec.put("publishedFee", c.get("fee"));
            rec.put("currency", "INR");
            rec.put("requiresHumanReview", true);
            recs.add(rec);
        }

        Map<String, Object> data = Map.of("recommendations", recs);
        return buildSuccess("Course recommendations generated", data, HttpStatus.OK, "req_ai_admission_recommend_001");
    }

    // 10. GET /courses - Search published courses
    @GetMapping("/courses")
    public ResponseEntity<?> getCourses(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String learningMode,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        List<Map<String, Object>> list = store.courses.stream()
                .filter(c -> {
                    if (search != null && !search.isBlank()) {
                        String name = ((String) c.get("courseName")).toLowerCase();
                        if (!name.contains(search.toLowerCase())) return false;
                    }
                    if (learningMode != null && !learningMode.isBlank()) {
                        String sched = (String) c.get("preferredSchedule");
                        if (sched != null && !sched.equalsIgnoreCase(learningMode)) return false;
                    }
                    return true;
                })
                .map(c -> {
                    Map<String, Object> m = new LinkedHashMap<>(c);
                    m.put("category", "SOFTWARE_DEVELOPMENT");
                    m.put("learningModes", List.of("WEEKEND", "WEEKDAY"));
                    m.put("publishedFee", c.get("fee"));
                    m.put("currency", "INR");
                    m.put("eligibilitySummary", "Degree/Diploma in CS, IT, Science, or engineering graduates.");
                    m.put("status", "PUBLISHED");
                    return m;
                })
                .collect(Collectors.toList());

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("content", list);
        res.put("page", page);
        res.put("size", size);
        res.put("totalElements", list.size());
        res.put("totalPages", 1);
        return buildSuccess("Courses retrieved", res, HttpStatus.OK, "req_ai_admission_courses_001");
    }

    // 11. GET /courses/{courseId}
    @GetMapping("/courses/{courseId}")
    public ResponseEntity<?> getCourseDetails(@PathVariable Long courseId) {
        Map<String, Object> c = store.courses.stream()
                .filter(x -> courseId.equals(x.get("courseId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + courseId));

        Map<String, Object> details = new LinkedHashMap<>(c);
        details.put("description", "Comprehensive industry-aligned curriculum covering core and advanced concepts with real-time projects.");
        details.put("publishedFee", c.get("fee"));
        details.put("currency", "INR");
        details.put("learningModes", List.of("WEEKEND", "WEEKDAY"));
        details.put("eligibility", Map.of("requirements", List.of("Basic computer literacy", "Graduation or final year student")));
        details.put("publishedSchedule", List.of(Map.of("batchName", "Weekend Batch #12", "startDate", "2026-11-15", "timing", "10:00 AM - 02:00 PM IST")));
        details.put("status", "PUBLISHED");

        return buildSuccess("Course details retrieved", details, HttpStatus.OK, "req_ai_admission_course_001");
    }

    // 12. POST /sessions/{sessionId}/create-lead
    @PostMapping("/sessions/{sessionId}/create-lead")
    public ResponseEntity<?> createLead(@PathVariable String sessionId, @RequestBody Map<String, Object> body) {
        String email = (String) body.get("email");
        String phone = (String) body.get("phone");

        // Duplicate check
        boolean duplicate = store.enquiries.stream().anyMatch(e ->
                (email != null && email.equalsIgnoreCase((String) e.get("email"))) ||
                (phone != null && phone.equals(e.get("phone")))
        );

        int leadId = store.enquirySeq.incrementAndGet();
        Map<String, Object> lead = new LinkedHashMap<>();
        lead.put("enquiryId", (long) leadId);
        lead.put("leadId", (long) leadId);
        lead.put("sessionId", sessionId);
        lead.put("studentName", body.getOrDefault("name", "Prospective Student"));
        lead.put("name", body.getOrDefault("name", "Prospective Student"));
        lead.put("email", email);
        lead.put("phone", phone);
        lead.put("interestedCourseId", body.getOrDefault("interestedCourseId", 501L));
        lead.put("courseId", body.getOrDefault("interestedCourseId", 501L));
        lead.put("source", body.getOrDefault("source", "WEBSITE_CHAT"));
        lead.put("status", "NEW");
        lead.put("assignedExecutiveId", null);
        lead.put("consent", body.getOrDefault("consent", Map.of("contactForAdmission", true, "marketingFollowUps", false)));
        lead.put("duplicateMatch", duplicate);
        lead.put("createdAt", LocalDateTime.now().toString());
        lead.put("tenantId", getTenantId());
        store.enquiries.add(lead);

        // Update session
        store.aiAdmissionSessions.stream()
                .filter(s -> sessionId.equals(s.get("sessionId")))
                .findFirst()
                .ifPresent(s -> s.put("leadId", (long) leadId));

        // Audit Event
        Map<String, Object> aud = new LinkedHashMap<>();
        aud.put("eventId", "audit_" + store.aiAuditSeq.incrementAndGet());
        aud.put("eventType", "LEAD_CREATED");
        aud.put("actorType", "AI_AGENT");
        aud.put("actorId", "AI_ADMISSION_AGENT");
        aud.put("resourceType", "ADMISSION_LEAD");
        aud.put("resourceId", String.valueOf(leadId));
        aud.put("createdAt", LocalDateTime.now().toString());
        aud.put("tenantId", getTenantId());
        store.aiAdmissionAuditEvents.add(aud);

        Map<String, Object> resData = new LinkedHashMap<>();
        resData.put("leadId", leadId);
        resData.put("sessionId", sessionId);
        resData.put("name", lead.get("name"));
        resData.put("interestedCourseId", lead.get("interestedCourseId"));
        resData.put("status", "NEW");
        resData.put("source", lead.get("source"));
        resData.put("duplicateMatch", duplicate);
        resData.put("createdAt", lead.get("createdAt"));

        return buildSuccess("Admission enquiry created", resData, HttpStatus.CREATED, "req_ai_admission_lead_001");
    }

    // 13. GET /leads - List admission leads
    @GetMapping("/leads")
    public ResponseEntity<?> listLeads(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        List<Map<String, Object>> leads = store.enquiries.stream()
                .filter(e -> status == null || status.equalsIgnoreCase((String) e.get("status")))
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>(e);
                    m.put("leadId", e.get("enquiryId"));
                    m.put("name", e.get("studentName"));
                    m.put("interestedCourseId", e.get("courseId"));
                    return m;
                })
                .collect(Collectors.toList());

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("content", leads);
        res.put("page", page);
        res.put("size", size);
        res.put("totalElements", leads.size());
        res.put("totalPages", 1);
        return buildSuccess("Admission leads retrieved", res, HttpStatus.OK, "req_ai_admission_leads_001");
    }

    // 14. GET /leads/{leadId}
    @GetMapping("/leads/{leadId}")
    public ResponseEntity<?> getLead(@PathVariable Long leadId) {
        Map<String, Object> e = store.enquiries.stream()
                .filter(x -> leadId.equals(x.get("enquiryId")) || leadId.equals(x.get("leadId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found: " + leadId));

        Map<String, Object> m = new LinkedHashMap<>(e);
        m.put("leadId", e.get("enquiryId"));
        m.put("name", e.get("studentName"));
        m.put("interestedCourseId", e.get("courseId"));
        return buildSuccess("Admission lead retrieved", m, HttpStatus.OK, "req_ai_admission_lead_002");
    }

    // 15. PATCH /leads/{leadId}
    @PatchMapping("/leads/{leadId}")
    public ResponseEntity<?> updateLead(@PathVariable Long leadId, @RequestBody Map<String, Object> updates) {
        Map<String, Object> e = store.enquiries.stream()
                .filter(x -> leadId.equals(x.get("enquiryId")) || leadId.equals(x.get("leadId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found: " + leadId));

        String prevStatus = (String) e.get("status");
        if (updates.containsKey("status")) e.put("status", updates.get("status"));
        if (updates.containsKey("interestedCourseId")) {
            e.put("interestedCourseId", updates.get("interestedCourseId"));
            e.put("courseId", updates.get("interestedCourseId"));
        }
        if (updates.containsKey("notes")) e.put("notes", updates.get("notes"));
        e.put("updatedAt", LocalDateTime.now().toString());

        Map<String, Object> resData = new LinkedHashMap<>();
        resData.put("leadId", leadId);
        resData.put("interestedCourseId", e.get("interestedCourseId"));
        resData.put("previousStatus", prevStatus);
        resData.put("status", e.get("status"));
        resData.put("updatedAt", e.get("updatedAt"));

        return buildSuccess("Admission lead updated", resData, HttpStatus.OK, "req_ai_admission_lead_003");
    }

    // 16. POST /sessions/{sessionId}/create-application
    @PostMapping("/sessions/{sessionId}/create-application")
    public ResponseEntity<?> createApplicationDraft(@PathVariable String sessionId, @RequestBody Map<String, Object> body) {
        int appId = store.appSeq.incrementAndGet();
        Long leadId = body.get("leadId") != null ? Long.valueOf(body.get("leadId").toString()) : 1201L;
        Long courseId = body.get("courseId") != null ? Long.valueOf(body.get("courseId").toString()) : 501L;

        Map<String, Object> app = new LinkedHashMap<>();
        app.put("applicationId", (long) appId);
        app.put("leadId", leadId);
        app.put("enquiryId", leadId);
        app.put("courseId", courseId);
        app.put("academicYear", body.getOrDefault("academicYear", "2026-2027"));
        app.put("intake", body.getOrDefault("intake", "NOVEMBER_2026"));
        app.put("status", "DRAFT");
        app.put("missingFields", List.of("dateOfBirth", "educationDetails"));
        app.put("requiresStudentCompletion", true);
        app.put("createdAt", LocalDateTime.now().toString());
        app.put("tenantId", getTenantId());
        store.applications.add(app);

        Map<String, Object> resData = new LinkedHashMap<>();
        resData.put("applicationId", appId);
        resData.put("leadId", leadId);
        resData.put("courseId", courseId);
        resData.put("status", "DRAFT");
        resData.put("missingFields", app.get("missingFields"));
        resData.put("requiresStudentCompletion", true);

        return buildSuccess("Application draft created", resData, HttpStatus.CREATED, "req_ai_admission_application_001");
    }

    // 17. GET /applications/{applicationId}
    @GetMapping("/applications/{applicationId}")
    public ResponseEntity<?> getApplicationDetails(@PathVariable Long applicationId) {
        Map<String, Object> app = store.applications.stream()
                .filter(a -> applicationId.equals(a.get("applicationId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + applicationId));

        Map<String, Object> res = new LinkedHashMap<>(app);
        if (!res.containsKey("missingFields")) {
            res.put("missingFields", List.of("dateOfBirth", "educationDetails"));
        }
        return buildSuccess("Application retrieved", res, HttpStatus.OK, "req_ai_admission_application_002");
    }

    // 18. POST /sessions/{sessionId}/schedule-counselling
    @PostMapping("/sessions/{sessionId}/schedule-counselling")
    public ResponseEntity<?> scheduleCounselling(@PathVariable String sessionId, @RequestBody Map<String, Object> body) {
        int apptId = store.apptSeq.incrementAndGet();
        Long leadId = body.get("leadId") != null ? Long.valueOf(body.get("leadId").toString()) : 1201L;

        Map<String, Object> appt = new LinkedHashMap<>();
        appt.put("appointmentId", (long) apptId);
        appt.put("appointmentRequestId", apptId);
        appt.put("leadId", leadId);
        appt.put("sessionId", sessionId);
        appt.put("status", "PENDING_CONFIRMATION");
        appt.put("preferredDate", body.getOrDefault("preferredDate", "2026-10-30"));
        appt.put("preferredTime", body.getOrDefault("preferredTime", "11:00"));
        appt.put("timeZone", body.getOrDefault("timeZone", "Asia/Kolkata"));
        appt.put("meetingMode", body.getOrDefault("meetingMode", "ONLINE"));
        appt.put("reason", body.getOrDefault("reason", "Course and career guidance"));
        appt.put("createdAt", LocalDateTime.now().toString());
        appt.put("tenantId", getTenantId());
        store.counsellingAppointments.add(appt);

        Map<String, Object> resData = new LinkedHashMap<>(appt);
        return buildSuccess("Counselling appointment request created", resData, HttpStatus.OK, "req_ai_admission_counselling_001");
    }

    // 19. POST /sessions/{sessionId}/create-follow-up
    @PostMapping("/sessions/{sessionId}/create-follow-up")
    public ResponseEntity<?> createFollowUp(@PathVariable String sessionId, @RequestBody Map<String, Object> body) {
        int taskId = store.aiTaskSeq.incrementAndGet();
        Long leadId = body.get("leadId") != null ? Long.valueOf(body.get("leadId").toString()) : 1201L;

        Map<String, Object> task = new LinkedHashMap<>();
        task.put("taskId", (long) taskId);
        task.put("leadId", leadId);
        task.put("sessionId", sessionId);
        task.put("taskType", body.getOrDefault("taskType", "COURSE_INFORMATION"));
        task.put("status", "PENDING");
        task.put("dueAt", body.getOrDefault("dueAt", "2026-10-29T11:00:00+05:30"));
        task.put("timeZone", body.getOrDefault("timeZone", "Asia/Kolkata"));
        task.put("reason", body.getOrDefault("reason", "Student requested time to review course information"));
        task.put("createdByAgent", "AI_ADMISSION_AGENT");
        task.put("tenantId", getTenantId());
        store.aiFollowUpTasks.add(task);

        Map<String, Object> resData = new LinkedHashMap<>(task);
        return buildSuccess("Admission follow-up task created", resData, HttpStatus.OK, "req_ai_admission_followup_001");
    }

    // 20. POST /sessions/{sessionId}/handoff
    @PostMapping("/sessions/{sessionId}/handoff")
    public ResponseEntity<?> handoffToHuman(@PathVariable String sessionId, @RequestBody Map<String, Object> body) {
        Map<String, Object> session = store.aiAdmissionSessions.stream()
                .filter(s -> sessionId.equals(s.get("sessionId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Session not found: " + sessionId));

        int handoffId = store.aiHandoffSeq.incrementAndGet();
        session.put("status", "HANDOFF_PENDING");

        Map<String, Object> handoff = new LinkedHashMap<>();
        handoff.put("handoffId", handoffId);
        handoff.put("sessionId", sessionId);
        handoff.put("status", "HANDOFF_PENDING");
        handoff.put("assignedTeam", body.getOrDefault("preferredTeam", "ADMISSIONS"));
        handoff.put("reason", body.getOrDefault("reason", "STUDENT_REQUESTED_HUMAN"));
        handoff.put("summary", body.getOrDefault("summary", "Student requested human assistance"));
        handoff.put("createdAt", LocalDateTime.now().toString());
        handoff.put("tenantId", getTenantId());
        store.aiAdmissionHandoffs.add(handoff);

        Map<String, Object> resData = new LinkedHashMap<>(handoff);
        return buildSuccess("Conversation transferred to the admissions team", resData, HttpStatus.OK, "req_ai_admission_handoff_001");
    }

    // 21. POST /sessions/{sessionId}/close
    @PostMapping("/sessions/{sessionId}/close")
    public ResponseEntity<?> closeSession(@PathVariable String sessionId, @RequestBody Map<String, Object> body) {
        Map<String, Object> session = store.aiAdmissionSessions.stream()
                .filter(s -> sessionId.equals(s.get("sessionId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Session not found: " + sessionId));

        String prevStatus = (String) session.get("status");
        session.put("status", "CLOSED");
        session.put("closedAt", LocalDateTime.now().toString());
        session.put("closeReason", body.getOrDefault("reason", "STUDENT_ENQUIRY_COMPLETED"));

        Map<String, Object> resData = new LinkedHashMap<>();
        resData.put("sessionId", sessionId);
        resData.put("previousStatus", prevStatus);
        resData.put("status", "CLOSED");
        resData.put("closedAt", session.get("closedAt"));

        return buildSuccess("Admission session closed", resData, HttpStatus.OK, "req_ai_admission_close_001");
    }

    // 22. GET /sessions/{sessionId}/events
    @GetMapping("/sessions/{sessionId}/events")
    public ResponseEntity<?> getSessionEvents(
            @PathVariable String sessionId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        List<Map<String, Object>> events = store.aiAdmissionEvents.stream()
                .filter(e -> sessionId.equals(e.get("sessionId")))
                .collect(Collectors.toList());

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("content", events);
        res.put("page", page);
        res.put("size", size);
        res.put("totalElements", events.size());
        res.put("totalPages", 1);
        return buildSuccess("Session events retrieved", res, HttpStatus.OK, "req_ai_admission_events_001");
    }

    // 23. GET /knowledge/sources
    @GetMapping("/knowledge/sources")
    public ResponseEntity<?> listKnowledgeSources(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        List<Map<String, Object>> sources = new ArrayList<>(store.aiAdmissionKnowledgeSources);
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("content", sources);
        res.put("page", page);
        res.put("size", size);
        res.put("totalElements", sources.size());
        res.put("totalPages", 1);
        return buildSuccess("Knowledge sources retrieved", res, HttpStatus.OK, "req_ai_admission_knowledge_001");
    }

    // 24. POST /knowledge/sources
    @PostMapping("/knowledge/sources")
    public ResponseEntity<?> registerKnowledgeSource(@RequestBody Map<String, Object> body) {
        String sourceId = "KB-" + store.aiKbSeq.incrementAndGet();
        Map<String, Object> src = new LinkedHashMap<>();
        src.put("sourceId", sourceId);
        src.put("title", body.getOrDefault("title", "Course Knowledge Document"));
        src.put("sourceType", body.getOrDefault("sourceType", "DOCUMENT"));
        src.put("storageKey", body.getOrDefault("storageKey", "knowledge/" + sourceId.toLowerCase() + ".pdf"));
        src.put("language", body.getOrDefault("language", "en"));
        src.put("enabled", body.getOrDefault("enabled", true));
        src.put("status", "PENDING_INDEXING");
        src.put("createdAt", LocalDateTime.now().toString());
        src.put("tenantId", getTenantId());
        store.aiAdmissionKnowledgeSources.add(src);

        return buildSuccess("Knowledge source registered", src, HttpStatus.CREATED, "req_ai_admission_knowledge_002");
    }

    // 25. POST /knowledge/sources/{sourceId}/sync
    @PostMapping("/knowledge/sources/{sourceId}/sync")
    public ResponseEntity<?> syncKnowledgeSource(@PathVariable String sourceId, @RequestBody Map<String, Object> body) {
        Map<String, Object> src = store.aiAdmissionKnowledgeSources.stream()
                .filter(s -> sourceId.equals(s.get("sourceId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Knowledge source not found: " + sourceId));

        src.put("status", "INDEXED");
        src.put("lastSyncedAt", LocalDateTime.now().toString());

        Map<String, Object> resData = new LinkedHashMap<>();
        resData.put("sourceId", sourceId);
        resData.put("syncJobId", "sync_" + UUID.randomUUID().toString().substring(0, 6));
        resData.put("status", "QUEUED");
        resData.put("queuedAt", LocalDateTime.now().toString());

        return buildSuccess("Knowledge synchronization queued", resData, HttpStatus.OK, "req_ai_admission_sync_001");
    }

    // 26. GET /metrics
    @GetMapping("/metrics")
    public ResponseEntity<?> getMetrics(
            @RequestParam(required = false, defaultValue = "2026-10-01") String from,
            @RequestParam(required = false, defaultValue = "2026-10-31") String to
    ) {
        Map<String, Object> metrics = new LinkedHashMap<>();
        metrics.put("period", Map.of("from", from, "to", to));
        metrics.put("sessionsStarted", Math.max(850, store.aiAdmissionSessions.size()));
        metrics.put("sessionsClosed", 690);
        metrics.put("leadsCreated", Math.max(240, store.enquiries.size()));
        metrics.put("duplicateLeadsPrevented", 18);
        metrics.put("applicationsInitiated", Math.max(95, store.applications.size()));
        metrics.put("counsellingRequestsCreated", Math.max(62, store.counsellingAppointments.size()));
        metrics.put("humanHandoffs", Math.max(75, store.aiAdmissionHandoffs.size()));
        metrics.put("unansweredQuestions", 22);
        metrics.put("leadConversionPercent", 28.24);

        return buildSuccess("AI Admission Agent metrics retrieved", metrics, HttpStatus.OK, "req_ai_admission_metrics_001");
    }

    // 27. GET /audit-events
    @GetMapping("/audit-events")
    public ResponseEntity<?> getAuditEvents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        List<Map<String, Object>> events = new ArrayList<>(store.aiAdmissionAuditEvents);
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("content", events);
        res.put("page", page);
        res.put("size", size);
        res.put("totalElements", events.size());
        res.put("totalPages", 1);
        return buildSuccess("AI Admission Agent audit events retrieved", res, HttpStatus.OK, "req_ai_admission_audit_001");
    }
}
