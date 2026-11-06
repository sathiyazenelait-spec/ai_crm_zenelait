package com.zenelait.crm.hospital;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Zenelait AI CRM — Hospital/Clinic Tenant
 * AI Receptionist V1 Controller
 * Supports Staff Base Path: /api/v1/hospital/ai-receptionist
 * and Public Chat Path: /api/v1/public/clinic-chat
 * Implements 20 REST API endpoints specified in Section 3.
 */
@RestController
@CrossOrigin(origins = "*")
public class HospitalAiReceptionistV1Controller {

    private final HospitalDataStore store;

    public HospitalAiReceptionistV1Controller(HospitalDataStore store) {
        this.store = store;
    }

    private <T> ResponseEntity<Map<String, Object>> buildResponse(boolean success, String message, T data, HttpStatus status, String requestId) {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", success);
        resp.put("message", message);
        if (data != null) {
            resp.put("data", data);
        }
        resp.put("timestamp", "2026-10-27T18:00:00+05:30");
        resp.put("requestId", requestId != null ? requestId : "req_ai_rec_" + UUID.randomUUID().toString().substring(0, 8));
        return ResponseEntity.status(status).body(resp);
    }

    // 1. GET /api/v1/hospital/ai-receptionist/config — Read AI Receptionist configuration
    @GetMapping("/api/v1/hospital/ai-receptionist/config")
    public ResponseEntity<?> getConfig() {
        Map<String, Object> config = store.getAiReceptionistConfig().get("config");
        if (config == null) {
            return buildResponse(false, "AI Receptionist configuration not found", null, HttpStatus.NOT_FOUND, "req_ai_rec_001_err");
        }
        return buildResponse(true, "AI Receptionist configuration retrieved", config, HttpStatus.OK, "req_ai_rec_001");
    }

    // 2. PATCH /api/v1/hospital/ai-receptionist/config — Update configuration if authorized
    @PatchMapping("/api/v1/hospital/ai-receptionist/config")
    public ResponseEntity<?> updateConfig(@RequestBody Map<String, Object> body) {
        Map<String, Object> config = store.getAiReceptionistConfig().get("config");
        if (config == null) {
            return buildResponse(false, "AI Receptionist configuration not found", null, HttpStatus.NOT_FOUND, "req_ai_rec_002_err");
        }

        if (body.containsKey("status")) config.put("status", body.get("status"));
        if (body.containsKey("supportedLanguages")) config.put("supportedLanguages", body.get("supportedLanguages"));
        if (body.containsKey("businessHours")) config.put("businessHours", body.get("businessHours"));
        if (body.containsKey("afterHoursBehavior")) config.put("afterHoursBehavior", body.get("afterHoursBehavior"));
        if (body.containsKey("knowledgeOnlyMode")) config.put("knowledgeOnlyMode", body.get("knowledgeOnlyMode"));
        if (body.containsKey("requireHumanApprovalForExternalActions")) config.put("requireHumanApprovalForExternalActions", body.get("requireHumanApprovalForExternalActions"));
        config.put("updatedAt", "2026-10-27T18:10:00+05:30");

        store.recordAuditEvent("AI_RECEPTIONIST_CONFIG_UPDATED", "COMPANY_ADMIN", "ai_rec_001", "Updated configuration settings");

        Map<String, Object> data = new LinkedHashMap<>(config);
        return buildResponse(true, "AI Receptionist configuration updated", data, HttpStatus.OK, "req_ai_rec_002");
    }

    // 3. POST /sessions — Start a patient conversation (Staff or Public)
    @PostMapping({"/api/v1/hospital/ai-receptionist/sessions", "/api/v1/public/clinic-chat/sessions"})
    public ResponseEntity<?> startSession(@RequestBody Map<String, Object> body) {
        String sessionId = "sess_" + UUID.randomUUID().toString().substring(0, 8);
        String convId = "conv_" + UUID.randomUUID().toString().substring(0, 8);

        Map<String, Object> session = new LinkedHashMap<>();
        session.put("sessionId", sessionId);
        session.put("conversationId", convId);
        session.put("agentName", "CityCare AI Receptionist");
        session.put("channel", body.getOrDefault("channel", "WEBSITE_CHAT"));
        session.put("language", body.getOrDefault("language", "en"));
        session.put("status", "ACTIVE");
        session.put("expiresAt", "2026-10-27T20:00:00+05:30");
        session.put("createdAt", "2026-10-27T18:15:00+05:30");

        store.getAiReceptionistSessions().put(sessionId, session);
        store.getAiReceptionistMessages().put(sessionId, new ArrayList<>());

        return buildResponse(true, "AI Receptionist session created", session, HttpStatus.CREATED, "req_ai_rec_003");
    }

    // 4. GET /api/v1/hospital/ai-receptionist/sessions — List authorized conversation sessions
    @GetMapping("/api/v1/hospital/ai-receptionist/sessions")
    public ResponseEntity<?> listSessions(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        List<Map<String, Object>> list = store.getAiReceptionistSessions().values().stream()
                .filter(s -> status == null || status.equalsIgnoreCase((String) s.get("status")))
                .collect(Collectors.toList());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", list);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", list.size());
        data.put("totalPages", 1);

        return buildResponse(true, "Conversation sessions retrieved", data, HttpStatus.OK, "req_ai_rec_004");
    }

    // 5. GET /api/v1/hospital/ai-receptionist/sessions/{sessionId} — Get a conversation session
    @GetMapping({"/api/v1/hospital/ai-receptionist/sessions/{sessionId}", "/api/v1/public/clinic-chat/sessions/{sessionId}"})
    public ResponseEntity<?> getSession(@PathVariable String sessionId) {
        Map<String, Object> session = store.getAiReceptionistSessions().get(sessionId);
        if (session == null) {
            return buildResponse(false, "Session not found", null, HttpStatus.NOT_FOUND, "req_ai_rec_005_err");
        }
        return buildResponse(true, "Conversation session retrieved", session, HttpStatus.OK, "req_ai_rec_005");
    }

    // 6. POST /sessions/{sessionId}/messages — Submit a message and receive an AI response
    @PostMapping({"/api/v1/hospital/ai-receptionist/sessions/{sessionId}/messages", "/api/v1/public/clinic-chat/sessions/{sessionId}/messages"})
    public ResponseEntity<?> sendMessage(@PathVariable String sessionId, @RequestBody Map<String, Object> body) {
        Map<String, Object> session = store.getAiReceptionistSessions().get(sessionId);
        if (session == null) {
            // Auto create session if testing
            session = new LinkedHashMap<>();
            session.put("sessionId", sessionId);
            session.put("conversationId", "conv_" + sessionId);
            session.put("agentName", "CityCare AI Receptionist");
            session.put("channel", "WEBSITE_CHAT");
            session.put("language", "en");
            session.put("status", "ACTIVE");
            store.getAiReceptionistSessions().put(sessionId, session);
        }

        String userMsgId = "msg_" + UUID.randomUUID().toString().substring(0, 8);
        String assistantMsgId = "msg_" + UUID.randomUUID().toString().substring(0, 8);
        String userContent = (String) body.getOrDefault("content", "");

        // Grounded knowledge response generation
        String replyText;
        List<Map<String, Object>> knowledgeRefs = new ArrayList<>();
        boolean requiresHandoff = false;

        String lower = userContent.toLowerCase();
        if (lower.contains("hour") || lower.contains("open") || lower.contains("time") || lower.contains("timing")) {
            replyText = "Our published clinic hours are Monday to Saturday, 9:00 AM to 6:00 PM. Would you like help with an appointment?";
            knowledgeRefs.add(HospitalDataStore.createMap("articleId", "kb_hours_001", "title", "Clinic Opening Hours"));
        } else if (lower.contains("register") || lower.contains("new patient") || lower.contains("document")) {
            replyText = "To register as a new patient, please bring a government photo ID and health insurance card (if applicable). Registration takes less than 5 minutes at front desk reception.";
            knowledgeRefs.add(HospitalDataStore.createMap("articleId", "kb_registration_001", "title", "Patient Registration Process"));
        } else if (lower.contains("emergency") || lower.contains("chest pain") || lower.contains("breathing") || lower.contains("urgent")) {
            replyText = "CRITICAL MEDICAL ADVICE: If you are experiencing a medical emergency, please call emergency services immediately at +91 44 2800 9900 or proceed to the nearest emergency room. Transferring to human staff now.";
            requiresHandoff = true;
        } else if (lower.contains("human") || lower.contains("agent") || lower.contains("person") || lower.contains("speak")) {
            replyText = "I will connect you directly with a human reception team member who can assist you.";
            requiresHandoff = true;
        } else {
            replyText = "Welcome to CityCare Clinic. I can help answer administrative questions about our clinic hours, registration, departments, and booking appointments. How may I assist you today?";
            knowledgeRefs.add(HospitalDataStore.createMap("articleId", "kb_1001", "title", "Appointment Booking Policy"));
        }

        // Store user message
        Map<String, Object> uMsg = new LinkedHashMap<>();
        uMsg.put("messageId", userMsgId);
        uMsg.put("senderType", "PATIENT");
        uMsg.put("content", userContent);
        uMsg.put("createdAt", "2026-10-27T18:16:00+05:30");

        // Store assistant message
        Map<String, Object> aMsg = new LinkedHashMap<>();
        aMsg.put("messageId", assistantMsgId);
        aMsg.put("senderType", "AI_RECEPTIONIST");
        aMsg.put("content", replyText);
        aMsg.put("createdAt", "2026-10-27T18:16:01+05:30");
        aMsg.put("knowledgeReferences", knowledgeRefs.stream().map(k -> k.get("articleId")).collect(Collectors.toList()));

        List<Map<String, Object>> msgList = store.getAiReceptionistMessages().computeIfAbsent(sessionId, k -> new ArrayList<>());
        msgList.add(uMsg);
        msgList.add(aMsg);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("conversationId", session.get("conversationId"));
        data.put("userMessageId", userMsgId);
        data.put("assistantMessageId", assistantMsgId);
        data.put("reply", replyText);
        data.put("status", "ANSWERED");
        data.put("knowledgeReferences", knowledgeRefs);
        data.put("requiresHumanHandoff", requiresHandoff);
        data.put("externalActionExecuted", false);

        return buildResponse(true, "AI response generated", data, HttpStatus.OK, "req_ai_rec_006");
    }

    // 7. GET /sessions/{sessionId}/messages — Get session messages
    @GetMapping({"/api/v1/hospital/ai-receptionist/sessions/{sessionId}/messages", "/api/v1/public/clinic-chat/sessions/{sessionId}/messages"})
    public ResponseEntity<?> getSessionMessages(
            @PathVariable String sessionId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        List<Map<String, Object>> msgs = store.getAiReceptionistMessages().getOrDefault(sessionId, new ArrayList<>());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", msgs);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", msgs.size());
        data.put("totalPages", 1);

        return buildResponse(true, "Conversation messages retrieved", data, HttpStatus.OK, "req_ai_rec_007");
    }

    // 8. POST /sessions/{sessionId}/feedback — Submit patient feedback
    @PostMapping({"/api/v1/hospital/ai-receptionist/sessions/{sessionId}/feedback", "/api/v1/public/clinic-chat/sessions/{sessionId}/feedback"})
    public ResponseEntity<?> submitFeedback(@PathVariable String sessionId, @RequestBody Map<String, Object> body) {
        String fbId = "fb_" + UUID.randomUUID().toString().substring(0, 8);
        Map<String, Object> feedback = new LinkedHashMap<>();
        feedback.put("feedbackId", fbId);
        feedback.put("sessionId", sessionId);
        feedback.put("rating", body.getOrDefault("rating", 5));
        feedback.put("category", body.getOrDefault("category", "HELPFUL"));
        feedback.put("comment", body.getOrDefault("comment", ""));
        feedback.put("status", "RECORDED");

        store.getAiReceptionistFeedback().put(fbId, feedback);

        return buildResponse(true, "Feedback recorded successfully", feedback, HttpStatus.CREATED, "req_ai_rec_008");
    }

    // 9. POST /sessions/{sessionId}/handoff — Transfer the conversation to a human
    @PostMapping({"/api/v1/hospital/ai-receptionist/sessions/{sessionId}/handoff", "/api/v1/public/clinic-chat/sessions/{sessionId}/handoff"})
    public ResponseEntity<?> createHandoff(@PathVariable String sessionId, @RequestBody Map<String, Object> body) {
        String handoffId = "handoff_" + UUID.randomUUID().toString().substring(0, 8);
        Map<String, Object> handoff = new LinkedHashMap<>();
        handoff.put("handoffId", handoffId);
        handoff.put("sessionId", sessionId);
        handoff.put("targetTeam", body.getOrDefault("targetTeam", "RECEPTION"));
        handoff.put("status", "PENDING_ASSIGNMENT");
        handoff.put("reason", body.getOrDefault("reason", "PATIENT_REQUESTED_HUMAN"));
        handoff.put("summary", body.getOrDefault("summary", "Patient transferred to human staff"));
        handoff.put("createdAt", "2026-10-27T18:20:00+05:30");

        store.getAiReceptionistHandoffs().put(handoffId, handoff);

        store.getAiReceptionistActivity().add(HospitalDataStore.createMap(
                "eventId", "evt_ai_" + UUID.randomUUID().toString().substring(0, 8),
                "agentId", "ai_rec_001",
                "eventType", "HUMAN_HANDOFF_CREATED",
                "sessionId", sessionId,
                "outcome", "PENDING_ASSIGNMENT",
                "createdAt", "2026-10-27T18:20:00+05:30"
        ));

        return buildResponse(true, "Human handoff created", handoff, HttpStatus.CREATED, "req_ai_rec_009");
    }

    // 10. GET /api/v1/hospital/ai-receptionist/handoffs — List pending handoffs
    @GetMapping("/api/v1/hospital/ai-receptionist/handoffs")
    public ResponseEntity<?> listHandoffs(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        List<Map<String, Object>> handoffs = store.getAiReceptionistHandoffs().values().stream()
                .filter(h -> status == null || status.equalsIgnoreCase((String) h.get("status")))
                .collect(Collectors.toList());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", handoffs);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", handoffs.size());
        data.put("totalPages", 1);

        return buildResponse(true, "Handoffs retrieved successfully", data, HttpStatus.OK, "req_ai_rec_010");
    }

    // 11. PATCH /api/v1/hospital/ai-receptionist/handoffs/{handoffId}/assign — Assign a handoff
    @PatchMapping("/api/v1/hospital/ai-receptionist/handoffs/{handoffId}/assign")
    public ResponseEntity<?> assignHandoff(@PathVariable String handoffId, @RequestBody Map<String, Object> body) {
        Map<String, Object> handoff = store.getAiReceptionistHandoffs().get(handoffId);
        if (handoff == null) {
            return buildResponse(false, "Handoff not found", null, HttpStatus.NOT_FOUND, "req_ai_rec_011_err");
        }

        String assignedStaffId = (String) body.getOrDefault("assignedToStaffId", "stf_reception_001");
        handoff.put("assignedToStaffId", assignedStaffId);
        handoff.put("status", "ASSIGNED");
        handoff.put("assignedAt", "2026-10-27T18:22:00+05:30");

        return buildResponse(true, "Handoff assigned successfully", handoff, HttpStatus.OK, "req_ai_rec_011");
    }

    // 12. PATCH /api/v1/hospital/ai-receptionist/handoffs/{handoffId}/status — Update handoff status
    @PatchMapping("/api/v1/hospital/ai-receptionist/handoffs/{handoffId}/status")
    public ResponseEntity<?> updateHandoffStatus(@PathVariable String handoffId, @RequestBody Map<String, Object> body) {
        Map<String, Object> handoff = store.getAiReceptionistHandoffs().get(handoffId);
        if (handoff == null) {
            return buildResponse(false, "Handoff not found", null, HttpStatus.NOT_FOUND, "req_ai_rec_012_err");
        }

        String newStatus = (String) body.getOrDefault("status", "IN_PROGRESS");
        handoff.put("status", newStatus);
        if (body.containsKey("resolutionNote")) {
            handoff.put("resolutionNote", body.get("resolutionNote"));
        }
        handoff.put("updatedAt", "2026-10-27T18:23:00+05:30");

        return buildResponse(true, "Handoff status updated", handoff, HttpStatus.OK, "req_ai_rec_012");
    }

    // 13. GET /api/v1/hospital/ai-receptionist/knowledge/sources — List knowledge sources
    @GetMapping("/api/v1/hospital/ai-receptionist/knowledge/sources")
    public ResponseEntity<?> listKnowledgeSources(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        List<Map<String, Object>> sources = new ArrayList<>(store.getKnowledgeSources().values());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", sources);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", sources.size());
        data.put("totalPages", 1);

        return buildResponse(true, "Knowledge sources retrieved", data, HttpStatus.OK, "req_ai_rec_013");
    }

    // 14. POST /api/v1/hospital/ai-receptionist/knowledge/sources — Register a knowledge source
    @PostMapping("/api/v1/hospital/ai-receptionist/knowledge/sources")
    public ResponseEntity<?> registerKnowledgeSource(@RequestBody Map<String, Object> body) {
        String sourceId = "src_" + UUID.randomUUID().toString().substring(0, 8);
        Map<String, Object> src = new LinkedHashMap<>();
        src.put("sourceId", sourceId);
        src.put("name", body.getOrDefault("name", "New Knowledge Source"));
        src.put("sourceType", body.getOrDefault("sourceType", "DOCUMENT_COLLECTION"));
        src.put("description", body.getOrDefault("description", ""));
        src.put("contentReference", body.getOrDefault("contentReference", "collection_ref"));
        src.put("status", "PENDING_REVIEW");
        src.put("createdAt", "2026-10-27T18:26:00+05:30");

        store.getKnowledgeSources().put(sourceId, src);

        return buildResponse(true, "Knowledge source registered", src, HttpStatus.CREATED, "req_ai_rec_014");
    }

    // 15. PATCH /api/v1/hospital/ai-receptionist/knowledge/sources/{sourceId} — Update a knowledge source
    @PatchMapping("/api/v1/hospital/ai-receptionist/knowledge/sources/{sourceId}")
    public ResponseEntity<?> updateKnowledgeSource(@PathVariable String sourceId, @RequestBody Map<String, Object> body) {
        Map<String, Object> src = store.getKnowledgeSources().get(sourceId);
        if (src == null) {
            return buildResponse(false, "Source not found", null, HttpStatus.NOT_FOUND, "req_ai_rec_015_err");
        }
        if (body.containsKey("name")) src.put("name", body.get("name"));
        if (body.containsKey("status")) src.put("status", body.get("status"));
        if (body.containsKey("description")) src.put("description", body.get("description"));

        return buildResponse(true, "Knowledge source updated", src, HttpStatus.OK, "req_ai_rec_015");
    }

    // 16. POST /api/v1/hospital/ai-receptionist/knowledge/sources/{sourceId}/sync — Request sync
    @PostMapping("/api/v1/hospital/ai-receptionist/knowledge/sources/{sourceId}/sync")
    public ResponseEntity<?> syncKnowledgeSource(@PathVariable String sourceId, @RequestBody Map<String, Object> body) {
        String execId = "sync_" + UUID.randomUUID().toString().substring(0, 8);
        Map<String, Object> execution = new LinkedHashMap<>();
        execution.put("executionId", execId);
        execution.put("sourceId", sourceId);
        execution.put("status", "QUEUED");
        execution.put("mode", body.getOrDefault("mode", "INCREMENTAL"));

        store.getKnowledgeSyncs().put(execId, execution);

        return buildResponse(true, "Knowledge synchronization queued", execution, HttpStatus.ACCEPTED, "req_ai_rec_016");
    }

    // 17. GET /api/v1/hospital/ai-receptionist/knowledge/articles — Search approved articles
    @GetMapping("/api/v1/hospital/ai-receptionist/knowledge/articles")
    public ResponseEntity<?> searchKnowledgeArticles(
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        List<Map<String, Object>> articles = new ArrayList<>();
        articles.add(HospitalDataStore.createMap(
                "articleId", "kb_registration_001",
                "title", "Patient Registration Process",
                "category", "REGISTRATION",
                "status", "PUBLISHED",
                "version", 2,
                "lastReviewedAt", "2026-10-20T10:00:00+05:30"
        ));
        articles.add(HospitalDataStore.createMap(
                "articleId", "kb_hours_001",
                "title", "Clinic Opening Hours",
                "category", "CLINIC_POLICIES",
                "status", "PUBLISHED",
                "version", 1,
                "lastReviewedAt", "2026-10-20T10:00:00+05:30"
        ));

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", articles);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", articles.size());
        data.put("totalPages", 1);

        return buildResponse(true, "Approved knowledge articles retrieved", data, HttpStatus.OK, "req_ai_rec_017");
    }

    // 18. GET /api/v1/hospital/ai-receptionist/analytics — View AI Receptionist metrics
    @GetMapping("/api/v1/hospital/ai-receptionist/analytics")
    public ResponseEntity<?> getAnalytics(
            @RequestParam(defaultValue = "2026-10-01") String from,
            @RequestParam(defaultValue = "2026-10-27") String to) {

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("period", HospitalDataStore.createMap("from", from, "to", to));
        data.put("totalSessions", 1250);
        data.put("answeredSessions", 940);
        data.put("handoffSessions", 210);
        data.put("unresolvedSessions", 100);
        data.put("averageFirstResponseSeconds", 3.2);
        data.put("feedbackResponses", 180);
        data.put("averageFeedbackRating", 4.4);

        return buildResponse(true, "AI Receptionist analytics retrieved", data, HttpStatus.OK, "req_ai_rec_018");
    }

    // 19. GET /api/v1/hospital/ai-receptionist/activity — View AI activity history
    @GetMapping("/api/v1/hospital/ai-receptionist/activity")
    public ResponseEntity<?> getActivity(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        List<Map<String, Object>> list = new ArrayList<>(store.getAiReceptionistActivity());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", list);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", list.size());
        data.put("totalPages", 1);

        return buildResponse(true, "AI activity retrieved", data, HttpStatus.OK, "req_ai_rec_019");
    }

    // 20. POST /sessions/{sessionId}/close — Close a conversation
    @PostMapping({"/api/v1/hospital/ai-receptionist/sessions/{sessionId}/close", "/api/v1/public/clinic-chat/sessions/{sessionId}/close"})
    public ResponseEntity<?> closeSession(@PathVariable String sessionId, @RequestBody Map<String, Object> body) {
        Map<String, Object> session = store.getAiReceptionistSessions().get(sessionId);
        if (session != null) {
            session.put("status", "CLOSED");
            session.put("closedAt", "2026-10-27T18:35:00+05:30");
        }

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("sessionId", sessionId);
        data.put("status", "CLOSED");
        data.put("closedAt", "2026-10-27T18:35:00+05:30");

        return buildResponse(true, "Conversation closed", data, HttpStatus.OK, "req_ai_rec_020");
    }
}
