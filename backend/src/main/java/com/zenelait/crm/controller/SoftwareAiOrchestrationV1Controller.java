package com.zenelait.crm.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Zenelait AI CRM — AI Orchestration & AI Agents Controller
 * Implements 3 controlled autonomous services:
 * 1. AI Sales Agent (/api/v1/ai/sales/**)
 * 2. AI Support Agent (/api/v1/ai/support/**)
 * 3. AI Follow-up Agent (/api/v1/ai/follow-up/**)
 */
@RestController
@RequestMapping("/api/v1/ai")
@CrossOrigin(origins = "*")
public class SoftwareAiOrchestrationV1Controller {

    // Sales Sessions State
    private final Map<String, Map<String, Object>> salesSessions = new LinkedHashMap<>();
    private final Map<String, List<Map<String, Object>>> salesSessionEvents = new LinkedHashMap<>();

    // Support Sessions State
    private final Map<String, Map<String, Object>> supportSessions = new LinkedHashMap<>();
    private final Map<String, List<Map<String, Object>>> supportSessionEvents = new LinkedHashMap<>();

    // Follow-up Engine State
    private final Map<String, Object> followUpConfig = new LinkedHashMap<>();
    private final List<Map<String, Object>> followUpRules = new ArrayList<>();
    private final List<Map<String, Object>> followUpTasks = new ArrayList<>();
    private final Map<String, Map<String, Object>> followUpDrafts = new LinkedHashMap<>();
    private final Map<String, Map<String, Object>> followUpExecutions = new LinkedHashMap<>();
    private final Set<String> contactOptOutSuppression = new HashSet<>();

    public SoftwareAiOrchestrationV1Controller() {
        initAiOrchestrationData();
    }

    private void initAiOrchestrationData() {
        // Seed initial Sales Session
        Map<String, Object> s1 = new LinkedHashMap<>();
        s1.put("sessionId", "AIS-1001");
        s1.put("agentId", "AI-SALES-001");
        s1.put("channel", "WEBSITE_CHAT");
        s1.put("visitorId", "VIS-1001");
        s1.put("status", "ACTIVE");
        s1.put("prospectName", "Karthik Raj");
        s1.put("companyName", "ABC Technologies");
        s1.put("initialMessage", "Hello! I can help you explore our software and CRM services. What would you like to achieve?");
        s1.put("createdAt", LocalDateTime.now().minusHours(1).toString());
        salesSessions.put("AIS-1001", s1);

        List<Map<String, Object>> s1Events = new ArrayList<>();
        s1Events.add(Map.of("eventId", "EVT-1", "type", "SESSION_STARTED", "timestamp", LocalDateTime.now().minusMinutes(50).toString()));
        s1Events.add(Map.of("eventId", "EVT-2", "type", "MESSAGE_RECEIVED", "message", "We need a CRM application for our software company", "timestamp", LocalDateTime.now().minusMinutes(48).toString()));
        salesSessionEvents.put("AIS-1001", s1Events);

        // Seed initial Support Session
        Map<String, Object> sup1 = new LinkedHashMap<>();
        sup1.put("sessionId", "AISUP-1001");
        sup1.put("agentId", "AI-SUPPORT-001");
        sup1.put("channel", "WEBSITE_CHAT");
        sup1.put("customerReference", "CUS-9001");
        sup1.put("status", "ACTIVE");
        sup1.put("initialMessage", "Hello! I can help troubleshoot your issue or connect you with our support team. What problem are you experiencing?");
        sup1.put("createdAt", LocalDateTime.now().minusMinutes(30).toString());
        supportSessions.put("AISUP-1001", sup1);

        List<Map<String, Object>> sup1Events = new ArrayList<>();
        sup1Events.add(Map.of("eventId", "EVT-S1", "type", "SESSION_STARTED", "timestamp", LocalDateTime.now().minusMinutes(30).toString()));
        supportSessionEvents.put("AISUP-1001", sup1Events);

        // Follow-up configuration
        followUpConfig.put("enabled", true);
        followUpConfig.put("defaultTimezone", "Asia/Kolkata");
        followUpConfig.put("maxAutomatedAttempts", 3);
        followUpConfig.put("minimumIntervalHours", 24);
        followUpConfig.put("respectQuietHours", true);
        followUpConfig.put("stopOnCustomerReply", true);
        followUpConfig.put("stopOnOptOut", true);
        followUpConfig.put("requireApprovalForFirstOutboundMessage", true);

        // Follow-up rules
        Map<String, Object> r1 = new LinkedHashMap<>();
        r1.put("ruleId", "FUR-101");
        r1.put("name", "Quotation Sent 48h Follow-up");
        r1.put("trigger", "QUOTATION_SENT");
        r1.put("delayHours", 48);
        r1.put("channel", "EMAIL");
        r1.put("status", "ACTIVE");
        followUpRules.add(r1);

        Map<String, Object> r2 = new LinkedHashMap<>();
        r2.put("ruleId", "FUR-102");
        r2.put("name", "SLA Expiry Warning Notice");
        r2.put("trigger", "TICKET_SLA_NEAR_BREACH");
        r2.put("delayHours", 1);
        r2.put("channel", "INTERNAL_TASK");
        r2.put("status", "ACTIVE");
        followUpRules.add(r2);

        // Follow-up tasks
        Map<String, Object> t1 = new LinkedHashMap<>();
        t1.put("taskId", "FUT-1001");
        t1.put("relatedType", "LEAD");
        t1.put("relatedId", "LEAD-1001");
        t1.put("taskType", "SALES_FOLLOW_UP");
        t1.put("title", "Follow up on CRM proposal");
        t1.put("dueAt", LocalDateTime.now().plusDays(1).toString());
        t1.put("channel", "EMAIL");
        t1.put("assignedUserId", "USR-SE-001");
        t1.put("status", "SCHEDULED");
        followUpTasks.add(t1);

        // Seeded draft & execution
        Map<String, Object> d1 = new LinkedHashMap<>();
        d1.put("draftId", "FUD-1001");
        d1.put("relatedType", "LEAD");
        d1.put("relatedId", "LEAD-1001");
        d1.put("channel", "EMAIL");
        d1.put("subject", "Following up on your CRM proposal");
        d1.put("body", "Hello Karthik, I wanted to follow up on the CRM proposal we shared. Would you like to arrange a brief discussion to review the requirements and answer any questions?");
        d1.put("status", "PENDING_REVIEW");
        d1.put("requiresApproval", true);
        followUpDrafts.put("FUD-1001", d1);

        Map<String, Object> ex1 = new LinkedHashMap<>();
        ex1.put("executionId", "FUE-1001");
        ex1.put("draftId", "FUD-1001");
        ex1.put("channel", "EMAIL");
        ex1.put("status", "DELIVERED");
        ex1.put("attemptCount", 1);
        ex1.put("providerMessageId", "provider-msg-1001");
        ex1.put("completedAt", LocalDateTime.now().minusMinutes(10).toString());
        followUpExecutions.put("FUE-1001", ex1);
    }

    private Map<String, Object> envelope(String message, Object data, String requestId) {
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("message", message);
        res.put("data", data);
        res.put("timestamp", LocalDateTime.now().toString());
        res.put("requestId", requestId != null ? requestId : "req_ai_" + (System.currentTimeMillis() % 100000));
        return res;
    }

    // =========================================================================
    // SECTION 1: AI SALES AGENT (/api/v1/ai/sales/**)
    // =========================================================================

    @GetMapping("/sales/sessions")
    public ResponseEntity<Map<String, Object>> getSalesSessions() {
        return ResponseEntity.ok(envelope("Sales sessions retrieved", new ArrayList<>(salesSessions.values()), "req_ais_list"));
    }

    @PostMapping("/sales/sessions")
    public ResponseEntity<Map<String, Object>> startSalesSession(@RequestBody Map<String, Object> body) {
        String sessionId = "AIS-" + (1000 + salesSessions.size() + 1);
        Map<String, Object> session = new LinkedHashMap<>(body);
        session.put("sessionId", sessionId);
        session.put("agentId", "AI-SALES-001");
        session.put("channel", body.getOrDefault("channel", "WEBSITE_CHAT"));
        session.put("status", "ACTIVE");
        session.put("initialMessage", "Hello! I can help you explore our software and CRM services. What would you like to achieve?");
        session.put("createdAt", LocalDateTime.now().toString());

        salesSessions.put(sessionId, session);
        salesSessionEvents.put(sessionId, new ArrayList<>(List.of(
                Map.of("eventId", "EVT-" + System.currentTimeMillis() % 10000, "type", "SESSION_STARTED", "timestamp", LocalDateTime.now().toString())
        )));

        return ResponseEntity.status(HttpStatus.CREATED).body(envelope("AI sales session started", session, "req_ais_001"));
    }

    @GetMapping("/sales/sessions/{sessionId}")
    public ResponseEntity<Map<String, Object>> getSalesSession(@PathVariable String sessionId) {
        Map<String, Object> session = salesSessions.get(sessionId);
        if (session != null) {
            return ResponseEntity.ok(envelope("Sales session retrieved", session, "req_ais_sess"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(envelope("Session not found", null, "req_err"));
    }

    @PostMapping("/sales/sessions/{sessionId}/messages")
    public ResponseEntity<Map<String, Object>> sendSalesMessage(@PathVariable String sessionId, @RequestBody Map<String, Object> body) {
        String userMsg = (String) body.getOrDefault("message", "");

        Map<String, Object> replyData = new LinkedHashMap<>();
        replyData.put("sessionId", sessionId);
        replyData.put("messageId", "MSG-AI-" + (System.currentTimeMillis() % 10000));
        replyData.put("reply", "I can help you explore a CRM solution. Are you mainly looking for lead management, customer support, sales automation, or a combination of these?");
        replyData.put("intent", "SOFTWARE_CRM_ENQUIRY");
        replyData.put("nextAction", "ASK_QUALIFICATION_QUESTION");
        replyData.put("handoffRecommended", false);

        List<Map<String, Object>> events = salesSessionEvents.computeIfAbsent(sessionId, k -> new ArrayList<>());
        events.add(Map.of("eventId", "EVT-" + (System.currentTimeMillis() % 10000), "type", "MESSAGE_EXCHANGED", "user", userMsg, "aiReply", replyData.get("reply"), "timestamp", LocalDateTime.now().toString()));

        return ResponseEntity.ok(envelope("AI response generated", replyData, "req_ais_002"));
    }

    @PostMapping("/sales/sessions/{sessionId}/qualify")
    public ResponseEntity<Map<String, Object>> qualifySalesSession(@PathVariable String sessionId, @RequestBody Map<String, Object> body) {
        Map<String, Object> qual = new LinkedHashMap<>();
        qual.put("sessionId", sessionId);
        qual.put("qualificationStatus", "QUALIFIED");
        qual.put("qualificationScore", 82);
        qual.put("matchedCriteria", List.of("TARGET_INDUSTRY", "DEFINED_REQUIREMENT", "BUDGET_PROVIDED"));
        qual.put("missingInformation", List.of("CONTACT_EMAIL"));
        qual.put("recommendedNextAction", "COLLECT_CONTACT_EMAIL");
        qual.put("requiresHumanReview", true);

        return ResponseEntity.ok(envelope("Lead qualification completed", qual, "req_ais_003"));
    }

    @PostMapping("/sales/sessions/{sessionId}/recommendations")
    public ResponseEntity<Map<String, Object>> recommendServices(@PathVariable String sessionId, @RequestBody Map<String, Object> body) {
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("recommendations", List.of(
                Map.of("productId", "PRD-3001", "name", "Enterprise CRM Development", "reason", "The service can be evaluated for the requested lead and support workflows.", "matchScore", 0.91, "priceVerified", true),
                Map.of("productId", "PRD-3002", "name", "Sales Workflow Automation", "reason", "Relevant to the requested follow-up automation.", "matchScore", 0.84, "priceVerified", true)
        ));
        res.put("requiresSalesReview", true);

        return ResponseEntity.ok(envelope("Service recommendations generated", res, "req_ais_004"));
    }

    @PostMapping("/sales/sessions/{sessionId}/create-lead")
    public ResponseEntity<Map<String, Object>> createLeadFromSession(@PathVariable String sessionId, @RequestBody Map<String, Object> body) {
        String leadId = "LEAD-" + (1000 + (System.currentTimeMillis() % 9000));
        Map<String, Object> lead = new LinkedHashMap<>();
        lead.put("leadId", leadId);
        lead.put("sessionId", sessionId);
        lead.put("name", body.getOrDefault("name", "Prospect Contact"));
        lead.put("companyName", body.getOrDefault("companyName", "Technology Partner"));
        lead.put("status", "NEW");
        lead.put("source", body.getOrDefault("source", "WEBSITE_CHAT"));
        lead.put("createdByAgentId", "AI-SALES-001");
        lead.put("reviewStatus", "PENDING_REVIEW");

        return ResponseEntity.status(HttpStatus.CREATED).body(envelope("Lead created from AI sales session", lead, "req_ais_005"));
    }

    @PostMapping("/sales/sessions/{sessionId}/create-task")
    public ResponseEntity<Map<String, Object>> createTaskFromSession(@PathVariable String sessionId, @RequestBody Map<String, Object> body) {
        Map<String, Object> task = new LinkedHashMap<>(body);
        task.put("taskId", "TASK-" + (System.currentTimeMillis() % 10000));
        task.put("sessionId", sessionId);
        task.put("status", "OPEN");
        task.put("createdAt", LocalDateTime.now().toString());

        return ResponseEntity.status(HttpStatus.CREATED).body(envelope("Follow-up task created", task, "req_ais_task"));
    }

    @PostMapping("/sales/sessions/{sessionId}/summarize")
    public ResponseEntity<Map<String, Object>> summarizeSalesSession(@PathVariable String sessionId, @RequestBody(required = false) Map<String, Object> body) {
        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("sessionId", sessionId);
        summary.put("summary", "The prospect is evaluating a custom CRM for lead tracking and follow-up automation.");
        summary.put("requirements", List.of("Lead management", "Customer support", "Follow-up automation"));
        summary.put("budget", Map.of("amount", 500000, "currency", "INR"));
        summary.put("nextActions", List.of("Collect the preferred contact email", "Arrange a discovery call", "Have the sales team review the project scope"));
        summary.put("requiresHumanReview", true);

        return ResponseEntity.ok(envelope("Conversation summary generated", summary, "req_ais_006"));
    }

    @PostMapping("/sales/sessions/{sessionId}/handoff")
    public ResponseEntity<Map<String, Object>> handoffSalesSession(@PathVariable String sessionId, @RequestBody Map<String, Object> body) {
        Map<String, Object> handoff = new LinkedHashMap<>();
        handoff.put("sessionId", sessionId);
        handoff.put("handoffId", "HANDOFF-" + (1000 + (System.currentTimeMillis() % 9000)));
        handoff.put("status", "PENDING_ASSIGNMENT");
        handoff.put("preferredTeam", body.getOrDefault("preferredTeam", "SALES"));
        handoff.put("conversationId", "CONV-" + (1000 + (System.currentTimeMillis() % 9000)));

        return ResponseEntity.ok(envelope("Human handoff requested", handoff, "req_ais_007"));
    }

    @PostMapping("/sales/sessions/{sessionId}/close")
    public ResponseEntity<Map<String, Object>> closeSalesSession(@PathVariable String sessionId) {
        Map<String, Object> s = salesSessions.get(sessionId);
        if (s != null) {
            s.put("status", "CLOSED");
            return ResponseEntity.ok(envelope("Sales session closed", s, "req_ais_close"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(envelope("Session not found", null, "req_err"));
    }

    @GetMapping("/sales/sessions/{sessionId}/events")
    public ResponseEntity<Map<String, Object>> getSalesSessionEvents(@PathVariable String sessionId) {
        List<Map<String, Object>> events = salesSessionEvents.getOrDefault(sessionId, Collections.emptyList());
        return ResponseEntity.ok(envelope("Session events retrieved", events, "req_ais_events"));
    }

    @GetMapping("/sales/metrics")
    public ResponseEntity<Map<String, Object>> getSalesMetrics(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to
    ) {
        Map<String, Object> metrics = new LinkedHashMap<>();
        metrics.put("totalSessions", 850);
        metrics.put("leadsCreated", 95);
        metrics.put("qualifiedLeads", 58);
        metrics.put("handoffRequests", 120);
        metrics.put("successfulHandoffs", 112);
        metrics.put("failedGenerations", 12);
        metrics.put("averageResponseTimeMs", 950);

        return ResponseEntity.ok(envelope("AI Sales Agent metrics retrieved", metrics, "req_ais_008"));
    }

    // =========================================================================
    // SECTION 2: AI SUPPORT AGENT (/api/v1/ai/support/**)
    // =========================================================================

    @PostMapping("/support/sessions")
    public ResponseEntity<Map<String, Object>> startSupportSession(@RequestBody Map<String, Object> body) {
        String sessionId = "AISUP-" + (1000 + supportSessions.size() + 1);
        Map<String, Object> session = new LinkedHashMap<>(body);
        session.put("sessionId", sessionId);
        session.put("agentId", "AI-SUPPORT-001");
        session.put("channel", body.getOrDefault("channel", "WEBSITE_CHAT"));
        session.put("status", "ACTIVE");
        session.put("initialMessage", "Hello! I can help troubleshoot your issue or connect you with our support team. What problem are you experiencing?");
        session.put("createdAt", LocalDateTime.now().toString());

        supportSessions.put(sessionId, session);
        supportSessionEvents.put(sessionId, new ArrayList<>(List.of(
                Map.of("eventId", "EVT-" + (System.currentTimeMillis() % 10000), "type", "SUPPORT_SESSION_STARTED", "timestamp", LocalDateTime.now().toString())
        )));

        return ResponseEntity.status(HttpStatus.CREATED).body(envelope("AI support session started", session, "req_asp_001"));
    }

    @GetMapping("/support/sessions/{sessionId}")
    public ResponseEntity<Map<String, Object>> getSupportSession(@PathVariable String sessionId) {
        Map<String, Object> session = supportSessions.get(sessionId);
        if (session != null) {
            return ResponseEntity.ok(envelope("Support session retrieved", session, "req_asp_sess"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(envelope("Session not found", null, "req_err"));
    }

    @PostMapping("/support/sessions/{sessionId}/messages")
    public ResponseEntity<Map<String, Object>> sendSupportMessage(@PathVariable String sessionId, @RequestBody Map<String, Object> body) {
        String userMsg = (String) body.getOrDefault("message", "");

        Map<String, Object> reply = new LinkedHashMap<>();
        reply.put("sessionId", sessionId);
        reply.put("messageId", "MSG-AI-SUP-" + (System.currentTimeMillis() % 10000));
        reply.put("reply", "I can help you troubleshoot that. Are you seeing an error message, or does the login page keep loading?");
        reply.put("issueCategory", "AUTHENTICATION");
        reply.put("confidence", 0.89);
        reply.put("suggestedAction", "COLLECT_DIAGNOSTIC_DETAILS");
        reply.put("handoffRecommended", false);

        List<Map<String, Object>> events = supportSessionEvents.computeIfAbsent(sessionId, k -> new ArrayList<>());
        events.add(Map.of("eventId", "EVT-" + (System.currentTimeMillis() % 10000), "type", "SUPPORT_MESSAGE", "user", userMsg, "reply", reply.get("reply"), "timestamp", LocalDateTime.now().toString()));

        return ResponseEntity.ok(envelope("Support response generated", reply, "req_asp_002"));
    }

    @PostMapping("/support/sessions/{sessionId}/classify")
    public ResponseEntity<Map<String, Object>> classifySupportIssue(@PathVariable String sessionId, @RequestBody Map<String, Object> body) {
        Map<String, Object> cl = new LinkedHashMap<>();
        cl.put("sessionId", sessionId);
        cl.put("category", "AUTHENTICATION");
        cl.put("prioritySuggestion", "MEDIUM");
        cl.put("sentiment", "FRUSTRATED");
        cl.put("productArea", "CUSTOMER_PORTAL");
        cl.put("recommendedNextAction", "SEARCH_KNOWLEDGE_BASE");
        cl.put("requiresHumanReview", false);

        return ResponseEntity.ok(envelope("Support issue classified", cl, "req_asp_003"));
    }

    @PostMapping("/support/sessions/{sessionId}/search-knowledge")
    public ResponseEntity<Map<String, Object>> searchKnowledgeSupport(@PathVariable String sessionId, @RequestBody Map<String, Object> body) {
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("results", List.of(
                Map.of("articleId", "KB-ART-001", "title", "Customer Portal Login Troubleshooting", "summary", "Approved steps for investigating common login problems.", "sourceId", "KB-8301", "relevanceScore", 0.94)
        ));
        res.put("totalElements", 1);

        return ResponseEntity.ok(envelope("Knowledge search completed", res, "req_asp_004"));
    }

    @PostMapping("/support/sessions/{sessionId}/troubleshoot")
    public ResponseEntity<Map<String, Object>> troubleshootSupport(@PathVariable String sessionId, @RequestBody Map<String, Object> body) {
        Map<String, Object> tb = new LinkedHashMap<>();
        tb.put("sessionId", sessionId);
        tb.put("suggestions", List.of(
                "Ask the customer for the exact error message.",
                "Confirm whether the issue affects one account or multiple users.",
                "Check the approved login troubleshooting guide.",
                "Escalate if the problem appears to affect multiple customers."
        ));
        tb.put("sourceArticleIds", List.of("KB-ART-001"));
        tb.put("requiresHumanReview", true);

        return ResponseEntity.ok(envelope("Troubleshooting suggestions generated", tb, "req_asp_005"));
    }

    @PostMapping("/support/sessions/{sessionId}/create-ticket")
    public ResponseEntity<Map<String, Object>> createTicketFromSession(@PathVariable String sessionId, @RequestBody Map<String, Object> body) {
        String ticketId = "TKT-" + (8000 + (System.currentTimeMillis() % 1000));
        Map<String, Object> t = new LinkedHashMap<>();
        t.put("ticketId", ticketId);
        t.put("sessionId", sessionId);
        t.put("subject", body.getOrDefault("subject", "Unable to log in to the customer portal"));
        t.put("category", body.getOrDefault("category", "AUTHENTICATION"));
        t.put("priority", body.getOrDefault("prioritySuggestion", "MEDIUM"));
        t.put("status", "OPEN");
        t.put("createdByAgentId", "AI-SUPPORT-001");
        t.put("assignedTo", null);

        return ResponseEntity.status(HttpStatus.CREATED).body(envelope("Support ticket created from AI session", t, "req_asp_006"));
    }

    @PostMapping("/support/sessions/{sessionId}/summarize")
    public ResponseEntity<Map<String, Object>> summarizeSupportSession(@PathVariable String sessionId, @RequestBody(required = false) Map<String, Object> body) {
        Map<String, Object> sum = new LinkedHashMap<>();
        sum.put("sessionId", sessionId);
        sum.put("summary", "Customer cannot log in to the portal. The exact error message and account-wide impact still need confirmation.");
        sum.put("issueCategory", "AUTHENTICATION");
        sum.put("actionsSuggested", List.of("Collect the exact error message", "Check the approved troubleshooting guide", "Escalate if the problem affects multiple users"));
        sum.put("unresolvedQuestions", List.of("Does the issue affect one user or multiple users?"));

        return ResponseEntity.ok(envelope("Support summary generated", sum, "req_asp_007"));
    }

    @PostMapping("/support/sessions/{sessionId}/handoff")
    public ResponseEntity<Map<String, Object>> handoffSupportSession(@PathVariable String sessionId, @RequestBody Map<String, Object> body) {
        Map<String, Object> h = new LinkedHashMap<>();
        h.put("sessionId", sessionId);
        h.put("handoffId", "HANDOFF-" + (2000 + (System.currentTimeMillis() % 1000)));
        h.put("ticketId", "TKT-8001");
        h.put("status", "PENDING_ASSIGNMENT");
        h.put("preferredTeam", body.getOrDefault("preferredTeam", "SUPPORT"));

        return ResponseEntity.ok(envelope("Support handoff queued", h, "req_asp_008"));
    }

    @PostMapping("/support/sessions/{sessionId}/close")
    public ResponseEntity<Map<String, Object>> closeSupportSession(@PathVariable String sessionId) {
        Map<String, Object> s = supportSessions.get(sessionId);
        if (s != null) {
            s.put("status", "CLOSED");
            return ResponseEntity.ok(envelope("Support session closed", s, "req_asp_close"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(envelope("Session not found", null, "req_err"));
    }

    @GetMapping("/support/sessions/{sessionId}/events")
    public ResponseEntity<Map<String, Object>> getSupportSessionEvents(@PathVariable String sessionId) {
        List<Map<String, Object>> events = supportSessionEvents.getOrDefault(sessionId, Collections.emptyList());
        return ResponseEntity.ok(envelope("Support session events retrieved", events, "req_asp_events"));
    }

    @GetMapping("/support/metrics")
    public ResponseEntity<Map<String, Object>> getSupportMetrics(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to
    ) {
        Map<String, Object> metrics = new LinkedHashMap<>();
        metrics.put("totalSessions", 600);
        metrics.put("ticketsCreated", 145);
        metrics.put("handoffRequests", 90);
        metrics.put("successfulHandoffs", 84);
        metrics.put("failedGenerations", 8);
        metrics.put("knowledgeRetrievalSuccessPercent", 92.0);
        metrics.put("averageResponseTimeMs", 1100);

        return ResponseEntity.ok(envelope("AI support metrics retrieved", metrics, "req_asp_009"));
    }

    // =========================================================================
    // SECTION 3: AI FOLLOW-UP AGENT (/api/v1/ai/follow-up/**)
    // =========================================================================

    @GetMapping("/follow-up/config")
    public ResponseEntity<Map<String, Object>> getFollowUpConfig() {
        return ResponseEntity.ok(envelope("Follow-up configuration retrieved", followUpConfig, "req_af_001"));
    }

    @PatchMapping("/follow-up/config")
    public ResponseEntity<Map<String, Object>> updateFollowUpConfig(@RequestBody Map<String, Object> body) {
        followUpConfig.putAll(body);
        return ResponseEntity.ok(envelope("Follow-up configuration updated", followUpConfig, "req_af_cfg_upd"));
    }

    @GetMapping("/follow-up/rules")
    public ResponseEntity<Map<String, Object>> getFollowUpRules() {
        return ResponseEntity.ok(envelope("Follow-up rules retrieved", followUpRules, "req_af_rules"));
    }

    @PostMapping("/follow-up/rules")
    public ResponseEntity<Map<String, Object>> createFollowUpRule(@RequestBody Map<String, Object> body) {
        String ruleId = "FUR-" + (100 + followUpRules.size() + 1);
        Map<String, Object> r = new LinkedHashMap<>(body);
        r.put("ruleId", ruleId);
        r.put("status", "ACTIVE");
        followUpRules.add(0, r);

        return ResponseEntity.status(HttpStatus.CREATED).body(envelope("Follow-up rule created", r, "req_af_rule_new"));
    }

    @PatchMapping("/follow-up/rules/{ruleId}")
    public ResponseEntity<Map<String, Object>> updateFollowUpRule(@PathVariable String ruleId, @RequestBody Map<String, Object> body) {
        for (Map<String, Object> r : followUpRules) {
            if (ruleId.equalsIgnoreCase((String) r.get("ruleId"))) {
                r.putAll(body);
                return ResponseEntity.ok(envelope("Follow-up rule updated", r, "req_af_rule_upd"));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(envelope("Rule not found", null, "req_err"));
    }

    @PostMapping("/follow-up/rules/{ruleId}/activate")
    public ResponseEntity<Map<String, Object>> activateFollowUpRule(@PathVariable String ruleId) {
        for (Map<String, Object> r : followUpRules) {
            if (ruleId.equalsIgnoreCase((String) r.get("ruleId"))) {
                r.put("status", "ACTIVE");
                return ResponseEntity.ok(envelope("Follow-up rule activated", r, "req_af_rule_act"));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(envelope("Rule not found", null, "req_err"));
    }

    @PostMapping("/follow-up/rules/{ruleId}/pause")
    public ResponseEntity<Map<String, Object>> pauseFollowUpRule(@PathVariable String ruleId) {
        for (Map<String, Object> r : followUpRules) {
            if (ruleId.equalsIgnoreCase((String) r.get("ruleId"))) {
                r.put("status", "PAUSED");
                return ResponseEntity.ok(envelope("Follow-up rule paused", r, "req_af_rule_pau"));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(envelope("Rule not found", null, "req_err"));
    }

    @GetMapping("/follow-up/tasks")
    public ResponseEntity<Map<String, Object>> getFollowUpTasks() {
        return ResponseEntity.ok(envelope("Follow-up tasks retrieved", followUpTasks, "req_af_tasks"));
    }

    @PostMapping("/follow-up/tasks")
    public ResponseEntity<Map<String, Object>> createFollowUpTask(@RequestBody Map<String, Object> body) {
        String taskId = "FUT-" + (1000 + followUpTasks.size() + 1);
        Map<String, Object> task = new LinkedHashMap<>(body);
        task.put("taskId", taskId);
        task.put("status", "SCHEDULED");
        followUpTasks.add(0, task);

        return ResponseEntity.status(HttpStatus.CREATED).body(envelope("Follow-up task created", task, "req_af_002"));
    }

    @GetMapping("/follow-up/tasks/{taskId}")
    public ResponseEntity<Map<String, Object>> getFollowUpTask(@PathVariable String taskId) {
        return followUpTasks.stream()
                .filter(t -> taskId.equalsIgnoreCase((String) t.get("taskId")))
                .findFirst()
                .map(t -> ResponseEntity.ok(envelope("Task details retrieved", t, "req_af_t_get")))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(envelope("Task not found", null, "req_err")));
    }

    @PatchMapping("/follow-up/tasks/{taskId}")
    public ResponseEntity<Map<String, Object>> updateFollowUpTask(@PathVariable String taskId, @RequestBody Map<String, Object> body) {
        for (Map<String, Object> t : followUpTasks) {
            if (taskId.equalsIgnoreCase((String) t.get("taskId"))) {
                t.putAll(body);
                return ResponseEntity.ok(envelope("Task updated", t, "req_af_t_upd"));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(envelope("Task not found", null, "req_err"));
    }

    @PostMapping("/follow-up/tasks/{taskId}/complete")
    public ResponseEntity<Map<String, Object>> completeFollowUpTask(@PathVariable String taskId) {
        for (Map<String, Object> t : followUpTasks) {
            if (taskId.equalsIgnoreCase((String) t.get("taskId"))) {
                t.put("status", "COMPLETED");
                t.put("completedAt", LocalDateTime.now().toString());
                return ResponseEntity.ok(envelope("Task completed", t, "req_af_t_comp"));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(envelope("Task not found", null, "req_err"));
    }

    @PostMapping("/follow-up/tasks/{taskId}/cancel")
    public ResponseEntity<Map<String, Object>> cancelFollowUpTask(@PathVariable String taskId) {
        for (Map<String, Object> t : followUpTasks) {
            if (taskId.equalsIgnoreCase((String) t.get("taskId"))) {
                t.put("status", "CANCELLED");
                return ResponseEntity.ok(envelope("Task cancelled", t, "req_af_t_canc"));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(envelope("Task not found", null, "req_err"));
    }

    @PostMapping("/follow-up/tasks/{taskId}/snooze")
    public ResponseEntity<Map<String, Object>> snoozeFollowUpTask(@PathVariable String taskId, @RequestBody Map<String, Object> body) {
        for (Map<String, Object> t : followUpTasks) {
            if (taskId.equalsIgnoreCase((String) t.get("taskId"))) {
                t.put("dueAt", body.getOrDefault("newDueAt", LocalDateTime.now().plusDays(2).toString()));
                t.put("status", "SCHEDULED");
                t.put("updatedBy", "USR-SE-001");

                Map<String, Object> res = new LinkedHashMap<>();
                res.put("taskId", taskId);
                res.put("status", "SCHEDULED");
                res.put("dueAt", t.get("dueAt"));
                res.put("updatedBy", "USR-SE-001");
                return ResponseEntity.ok(envelope("Follow-up task rescheduled", res, "req_af_006"));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(envelope("Task not found", null, "req_err"));
    }

    @PostMapping("/follow-up/drafts")
    public ResponseEntity<Map<String, Object>> createFollowUpDraft(@RequestBody Map<String, Object> body) {
        String draftId = "FUD-" + (1000 + followUpDrafts.size() + 1);
        Map<String, Object> d = new LinkedHashMap<>(body);
        d.put("draftId", draftId);
        d.put("subject", body.getOrDefault("subject", "Following up on your CRM proposal"));
        d.put("body", body.getOrDefault("body", "Hello Karthik, I wanted to follow up on the CRM proposal we shared. Would you like to arrange a brief discussion to review the requirements and answer any questions?"));
        d.put("status", "PENDING_REVIEW");
        d.put("requiresApproval", true);

        followUpDrafts.put(draftId, d);
        return ResponseEntity.status(HttpStatus.CREATED).body(envelope("Follow-up draft generated", d, "req_af_003"));
    }

    @PostMapping("/follow-up/drafts/{draftId}/approve")
    public ResponseEntity<Map<String, Object>> approveFollowUpDraft(@PathVariable String draftId, @RequestBody(required = false) Map<String, Object> body) {
        Map<String, Object> d = followUpDrafts.get(draftId);
        if (d != null) {
            d.put("status", "APPROVED");
            d.put("approvedBy", "USR-SM-001");
            d.put("approvedAt", LocalDateTime.now().toString());

            Map<String, Object> res = new LinkedHashMap<>();
            res.put("draftId", draftId);
            res.put("status", "APPROVED");
            res.put("approvedBy", "USR-SM-001");
            res.put("approvedAt", d.get("approvedAt"));

            return ResponseEntity.ok(envelope("Follow-up draft approved", res, "req_af_004"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(envelope("Draft not found", null, "req_err"));
    }

    @PostMapping("/follow-up/drafts/{draftId}/send")
    public ResponseEntity<Map<String, Object>> sendFollowUpDraft(@PathVariable String draftId, @RequestBody(required = false) Map<String, Object> body) {
        Map<String, Object> d = followUpDrafts.get(draftId);
        if (d == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(envelope("Draft not found", null, "req_err"));
        }

        String executionId = "FUE-" + (1000 + followUpExecutions.size() + 1);
        Map<String, Object> ex = new LinkedHashMap<>();
        ex.put("draftId", draftId);
        ex.put("executionId", executionId);
        ex.put("status", "QUEUED");
        ex.put("channel", d.getOrDefault("channel", "EMAIL"));

        followUpExecutions.put(executionId, ex);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(envelope("Follow-up send request queued", ex, "req_af_005"));
    }

    @GetMapping("/follow-up/executions")
    public ResponseEntity<Map<String, Object>> getFollowUpExecutions() {
        return ResponseEntity.ok(envelope("Follow-up executions retrieved", new ArrayList<>(followUpExecutions.values()), "req_af_execs"));
    }

    @GetMapping("/follow-up/executions/{executionId}")
    public ResponseEntity<Map<String, Object>> getFollowUpExecution(@PathVariable String executionId) {
        Map<String, Object> ex = followUpExecutions.get(executionId);
        if (ex != null) {
            return ResponseEntity.ok(envelope("Follow-up execution retrieved", ex, "req_af_008"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(envelope("Execution not found", null, "req_err"));
    }

    @PostMapping("/follow-up/executions/{executionId}/retry")
    public ResponseEntity<Map<String, Object>> retryFollowUpExecution(@PathVariable String executionId) {
        Map<String, Object> ex = followUpExecutions.get(executionId);
        if (ex != null) {
            ex.put("status", "QUEUED");
            ex.put("attemptCount", ((int) ex.getOrDefault("attemptCount", 1)) + 1);
            return ResponseEntity.ok(envelope("Execution retry queued", ex, "req_af_retry"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(envelope("Execution not found", null, "req_err"));
    }

    @PostMapping("/follow-up/stop-contact")
    public ResponseEntity<Map<String, Object>> stopContact(@RequestBody Map<String, Object> body) {
        String contactId = (String) body.getOrDefault("contactId", "CON-2001");
        contactOptOutSuppression.add(contactId);

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("contactId", contactId);
        res.put("channel", body.getOrDefault("channel", "EMAIL"));
        res.put("suppressionStatus", "ACTIVE");
        res.put("reason", body.getOrDefault("reason", "CUSTOMER_OPTOUT"));
        res.put("effectiveAt", LocalDateTime.now().toString());

        return ResponseEntity.ok(envelope("Follow-up suppression recorded", res, "req_af_007"));
    }

    @GetMapping("/follow-up/metrics")
    public ResponseEntity<Map<String, Object>> getFollowUpMetrics(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to
    ) {
        Map<String, Object> metrics = new LinkedHashMap<>();
        metrics.put("tasksCreated", 620);
        metrics.put("tasksCompleted", 510);
        metrics.put("tasksOverdue", 35);
        metrics.put("messagesQueued", 400);
        metrics.put("messagesDelivered", 385);
        metrics.put("messagesFailed", 15);
        metrics.put("customerReplies", 95);
        metrics.put("optOuts", 8);
        metrics.put("leadsConvertedAfterFollowUp", 28);

        return ResponseEntity.ok(envelope("Follow-up metrics retrieved", metrics, "req_af_009"));
    }
}
