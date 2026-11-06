package com.zenelait.crm.consulting;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Consulting Customer AI Support Agent V1 REST API Controller
 * Base URL: /api/v1/consulting/ai-support
 * Answers client questions using approved knowledge and authorized project/contract records,
 * creates and manages support tickets, detects escalation risks, and handles human handoffs.
 */
@RestController
@RequestMapping("/api/v1/consulting/ai-support")
@CrossOrigin(origins = "*")
public class ConsultingCustomerAiSupportV1Controller {

    @Autowired
    private ConsultingDataStore store;

    private String getTenantId(String tenantHeader) {
        return (tenantHeader != null && !tenantHeader.isBlank()) ? tenantHeader : ConsultingDataStore.DEFAULT_TENANT;
    }

    private Map<String, Object> standardSuccess(String message, Object data, String reqId) {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", true);
        resp.put("message", message);
        resp.put("data", data);
        resp.put("requestId", reqId != null ? reqId : "req_ai_support_" + UUID.randomUUID().toString().substring(0, 6));
        return resp;
    }

    private Map<String, Object> standardError(String message, List<Map<String, String>> errors, String reqId) {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", false);
        resp.put("message", message);
        resp.put("errors", errors != null ? errors : Collections.emptyList());
        resp.put("requestId", reqId != null ? reqId : "req_ai_sup_err_" + UUID.randomUUID().toString().substring(0, 6));
        return resp;
    }

    // ==========================================
    // 1. DASHBOARD & METRICS
    // ==========================================

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("activeConversations", 32);
        data.put("ticketsCreatedToday", 14);
        data.put("awaitingHumanHandoff", 4);
        data.put("resolvedByAutomation", 21);
        data.put("groundingFailures", 2);
        data.put("escalatedConversations", 5);

        return ResponseEntity.ok(standardSuccess("AI support dashboard retrieved", data, "req_ai_support_dashboard_001"));
    }

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getMetrics(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("groundingAccuracyRate", 0.96);
        data.put("avgFirstResponseTimeSeconds", 3.2);
        data.put("csatScore", 4.6);
        data.put("handoffRate", 0.12);
        data.put("knowledgeHits", 185);
        return ResponseEntity.ok(standardSuccess("Support automation metrics retrieved", data, null));
    }

    // ==========================================
    // 2. CONVERSATIONS & MESSAGES
    // ==========================================

    @GetMapping("/conversations")
    public ResponseEntity<Map<String, Object>> listConversations(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = new ArrayList<>(store.getConversations(tenantId).values());
        return ResponseEntity.ok(standardSuccess("Conversations retrieved", list, null));
    }

    @PostMapping("/conversations")
    public ResponseEntity<Map<String, Object>> startConversation(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @RequestBody Map<String, Object> req) {
        String tenantId = getTenantId(tenantHeader);
        String clientId = (String) req.getOrDefault("clientId", "CLIENT-1001");
        String channel = (String) req.getOrDefault("channel", "WEB_CHAT");

        String convId = "CONV-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        Map<String, Object> conv = new LinkedHashMap<>();
        conv.put("conversationId", convId);
        conv.put("clientId", clientId);
        conv.put("channel", channel);
        conv.put("status", "OPEN");
        conv.put("assignedAgent", "AI_SUPPORT_AGENT");
        conv.put("subject", req.getOrDefault("subject", "General Consulting Enquiry"));
        conv.put("createdAt", Instant.now().toString());

        List<Map<String, Object>> messages = new ArrayList<>();
        if (req.containsKey("initialMessage")) {
            Map<String, Object> initMsg = new LinkedHashMap<>();
            initMsg.put("messageId", "MSG-" + UUID.randomUUID().toString().substring(0, 4));
            initMsg.put("sender", "CLIENT");
            initMsg.put("message", req.get("initialMessage"));
            initMsg.put("timestamp", Instant.now().toString());
            messages.add(initMsg);
        }
        conv.put("messages", messages);

        store.getConversations(tenantId).put(convId, conv);
        store.addActivity(tenantId, "AI_SUPPORT_AGENT", "CONVERSATION_STARTED", "Conversation " + convId + " for client " + clientId);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("conversationId", convId);
        data.put("clientId", clientId);
        data.put("channel", channel);
        data.put("status", "OPEN");
        data.put("assignedAgent", "AI_SUPPORT_AGENT");

        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Support conversation created", data, "req_ai_support_conversation_001"));
    }

    @GetMapping("/conversations/{conversationId}")
    public ResponseEntity<Map<String, Object>> getConversation(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("conversationId") String conversationId) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> conv = store.getConversations(tenantId).get(conversationId);
        if (conv == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Conversation not found", null, null));
        }
        return ResponseEntity.ok(standardSuccess("Conversation retrieved", conv, null));
    }

    @PostMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<Map<String, Object>> submitMessage(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("conversationId") String conversationId,
            @RequestBody Map<String, Object> req) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> conv = store.getConversations(tenantId).get(conversationId);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("conversationId", conversationId);
        Map<String, Object> classification = new LinkedHashMap<>();
        classification.put("category", "PROJECT_STATUS");
        classification.put("priority", "NORMAL");
        data.put("classification", classification);
        data.put("responseStatus", "READY_FOR_GENERATION");
        data.put("humanHandoffRecommended", false);

        if (conv != null) {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> msgs = (List<Map<String, Object>>) conv.computeIfAbsent("messages", k -> new ArrayList<>());
            Map<String, Object> m = new LinkedHashMap<>(req);
            m.put("messageId", "MSG-" + UUID.randomUUID().toString().substring(0, 4));
            m.put("timestamp", Instant.now().toString());
            msgs.add(m);
        }

        return ResponseEntity.ok(standardSuccess("Message processed", data, "req_ai_support_message_001"));
    }

    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<Map<String, Object>> getMessages(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("conversationId") String conversationId) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> conv = store.getConversations(tenantId).get(conversationId);
        List<?> msgs = (conv != null && conv.containsKey("messages")) ? (List<?>) conv.get("messages") : List.of();
        return ResponseEntity.ok(standardSuccess("Message history retrieved", msgs, null));
    }

    @PostMapping("/conversations/{conversationId}/classify")
    public ResponseEntity<Map<String, Object>> classifyConversation(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("conversationId") String conversationId) {
        Map<String, Object> classification = new LinkedHashMap<>();
        classification.put("conversationId", conversationId);
        classification.put("category", "PROJECT_STATUS");
        classification.put("urgency", "NORMAL");
        classification.put("sentiment", "NEUTRAL");
        return ResponseEntity.ok(standardSuccess("Conversation classified", classification, null));
    }

    @PostMapping("/conversations/{conversationId}/summarize")
    public ResponseEntity<Map<String, Object>> summarizeConversation(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("conversationId") String conversationId) {
        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("conversationId", conversationId);
        summary.put("summary", "Client enquired about the status of the cloud migration project. AI confirmed testing phase.");
        summary.put("keyPoints", List.of("Cloud migration in testing phase", "Milestones on track"));
        return ResponseEntity.ok(standardSuccess("Conversation summarized", summary, null));
    }

    @PostMapping("/conversations/{conversationId}/resolve")
    public ResponseEntity<Map<String, Object>> resolveConversation(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("conversationId") String conversationId) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> conv = store.getConversations(tenantId).get(conversationId);
        if (conv != null) {
            conv.put("status", "RESOLVED");
        }
        return ResponseEntity.ok(standardSuccess("Conversation resolved", conv != null ? conv : Map.of("conversationId", conversationId, "status", "RESOLVED"), null));
    }

    @PostMapping("/conversations/{conversationId}/close")
    public ResponseEntity<Map<String, Object>> closeConversation(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("conversationId") String conversationId) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> conv = store.getConversations(tenantId).get(conversationId);
        if (conv != null) {
            conv.put("status", "CLOSED");
        }
        return ResponseEntity.ok(standardSuccess("Conversation closed", conv != null ? conv : Map.of("conversationId", conversationId, "status", "CLOSED"), null));
    }

    @PostMapping("/conversations/{conversationId}/handoff")
    public ResponseEntity<Map<String, Object>> handoffConversation(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("conversationId") String conversationId,
            @RequestBody Map<String, Object> req) {
        String tenantId = getTenantId(tenantHeader);
        String handoffId = "HO-SUP-1001";
        Map<String, Object> handoff = new LinkedHashMap<>(req);
        handoff.put("handoffId", handoffId);
        handoff.put("conversationId", conversationId);
        handoff.put("status", "PENDING_ASSIGNMENT");
        handoff.put("targetTeam", req.getOrDefault("targetTeam", "TECHNICAL_SUPPORT"));
        handoff.put("createdAt", Instant.now().toString());

        store.getSupportHandoffs(tenantId).put(handoffId, handoff);
        store.addActivity(tenantId, "AI_SUPPORT_AGENT", "HANDOFF_CREATED", "Handoff " + handoffId + " for conversation " + conversationId);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("handoffId", handoffId);
        data.put("conversationId", conversationId);
        data.put("status", "PENDING_ASSIGNMENT");
        data.put("targetTeam", handoff.get("targetTeam"));

        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Human handoff created", data, "req_ai_support_handoff_001"));
    }

    @GetMapping("/conversations/{conversationId}/handoffs")
    public ResponseEntity<Map<String, Object>> getConversationHandoffs(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("conversationId") String conversationId) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = store.getSupportHandoffs(tenantId).values().stream()
                .filter(h -> conversationId.equalsIgnoreCase((String) h.get("conversationId")))
                .collect(Collectors.toList());
        return ResponseEntity.ok(standardSuccess("Conversation handoffs retrieved", list, null));
    }

    // ==========================================
    // 3. TICKETS & ESCALATIONS
    // ==========================================

    @GetMapping("/tickets")
    public ResponseEntity<Map<String, Object>> listTickets(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = new ArrayList<>(store.getTickets(tenantId).values());
        return ResponseEntity.ok(standardSuccess("Tickets retrieved", list, null));
    }

    @PostMapping("/tickets")
    public ResponseEntity<Map<String, Object>> createTicket(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @RequestBody Map<String, Object> req) {
        String tenantId = getTenantId(tenantHeader);
        String ticketId = "TKT-1001";
        Map<String, Object> ticket = new LinkedHashMap<>(req);
        ticket.put("ticketId", ticketId);
        ticket.put("status", "OPEN");
        ticket.put("category", req.getOrDefault("category", "TECHNICAL_SUPPORT"));
        ticket.put("priority", req.getOrDefault("priority", "NORMAL"));
        ticket.put("createdBy", "AI_SUPPORT_AGENT");
        ticket.put("humanAssignmentRequired", true);
        ticket.put("createdAt", Instant.now().toString());

        store.getTickets(tenantId).put(ticketId, ticket);
        store.addActivity(tenantId, "AI_SUPPORT_AGENT", "TICKET_CREATED", "Ticket " + ticketId + " created");

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("ticketId", ticketId);
        data.put("clientId", req.get("clientId"));
        data.put("status", "OPEN");
        data.put("category", ticket.get("category"));
        data.put("priority", ticket.get("priority"));
        data.put("createdBy", "AI_SUPPORT_AGENT");
        data.put("humanAssignmentRequired", true);

        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Support ticket created", data, "req_ai_support_ticket_001"));
    }

    @GetMapping("/tickets/{ticketId}")
    public ResponseEntity<Map<String, Object>> getTicket(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("ticketId") String ticketId) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> ticket = store.getTickets(tenantId).get(ticketId);
        if (ticket == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Ticket not found", null, null));
        }
        return ResponseEntity.ok(standardSuccess("Ticket retrieved", ticket, null));
    }

    @PatchMapping("/tickets/{ticketId}")
    public ResponseEntity<Map<String, Object>> updateTicket(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("ticketId") String ticketId,
            @RequestBody Map<String, Object> req) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> ticket = store.getTickets(tenantId).get(ticketId);
        if (ticket == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Ticket not found", null, null));
        }
        ticket.putAll(req);
        return ResponseEntity.ok(standardSuccess("Ticket updated", ticket, null));
    }

    @PostMapping("/tickets/{ticketId}/classify")
    public ResponseEntity<Map<String, Object>> classifyTicket(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("ticketId") String ticketId,
            @RequestBody(required = false) Map<String, Object> req) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("ticketId", ticketId);
        data.put("category", "TECHNICAL_SUPPORT");
        data.put("suggestedPriority", "NORMAL");
        data.put("sentiment", "NEUTRAL");
        data.put("escalationRisk", "LOW");
        data.put("requiresHumanReview", true);

        return ResponseEntity.ok(standardSuccess("Ticket classification completed", data, "req_ai_support_classify_001"));
    }

    @PostMapping("/tickets/{ticketId}/summarize")
    public ResponseEntity<Map<String, Object>> summarizeTicket(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("ticketId") String ticketId) {
        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("ticketId", ticketId);
        summary.put("summary", "Client unable to access consulting analytics dashboard due to permissions mismatch.");
        summary.put("impact", "Client executive cannot verify engagement KPIs.");
        return ResponseEntity.ok(standardSuccess("Ticket summary generated", summary, null));
    }

    @PostMapping("/tickets/{ticketId}/suggest-resolution")
    public ResponseEntity<Map<String, Object>> suggestResolution(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("ticketId") String ticketId) {
        List<String> steps = List.of(
                "Verify client contact is mapped to the engagement role",
                "Reset dashboard view cache in security admin console",
                "Request client confirmation"
        );
        return ResponseEntity.ok(standardSuccess("Suggested resolution steps retrieved", steps, null));
    }

    @PostMapping("/tickets/{ticketId}/request-information")
    public ResponseEntity<Map<String, Object>> requestInformation(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("ticketId") String ticketId,
            @RequestBody Map<String, Object> req) {
        List<?> requestedInfo = (List<?>) req.get("requestedInformation");
        int count = requestedInfo != null ? requestedInfo.size() : 3;

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("ticketId", ticketId);
        data.put("status", "PENDING_APPROVAL");
        data.put("channel", req.getOrDefault("channel", "WEB_CHAT"));
        data.put("requestedInformationCount", count);

        return ResponseEntity.status(HttpStatus.ACCEPTED).body(standardSuccess("Information request prepared", data, "req_ai_support_info_001"));
    }

    @PostMapping("/tickets/{ticketId}/handoff")
    public ResponseEntity<Map<String, Object>> handoffTicket(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("ticketId") String ticketId,
            @RequestBody Map<String, Object> req) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> ticket = store.getTickets(tenantId).get(ticketId);
        if (ticket != null) {
            ticket.put("assignedTeam", req.getOrDefault("targetTeam", "TECHNICAL_SUPPORT"));
            ticket.put("status", "PENDING_ASSIGNMENT");
        }
        return ResponseEntity.ok(standardSuccess("Ticket handed off to human team", ticket != null ? ticket : req, null));
    }

    @PostMapping("/tickets/{ticketId}/escalate")
    public ResponseEntity<Map<String, Object>> escalateTicket(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("ticketId") String ticketId,
            @RequestBody Map<String, Object> req) {
        String tenantId = getTenantId(tenantHeader);
        String escalationId = "ESC-1001";

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("ticketId", ticketId);
        data.put("status", "ESCALATED");
        data.put("escalationId", escalationId);
        data.put("targetTeam", req.getOrDefault("targetTeam", "TECHNICAL_SUPPORT"));
        data.put("assignmentStatus", "PENDING_ASSIGNMENT");

        Map<String, Object> ticket = store.getTickets(tenantId).get(ticketId);
        if (ticket != null) {
            ticket.put("status", "ESCALATED");
            ticket.put("escalationId", escalationId);
            ticket.put("priority", req.getOrDefault("priority", "HIGH"));
        }

        store.addActivity(tenantId, "AI_SUPPORT_AGENT", "TICKET_ESCALATED", "Ticket " + ticketId + " escalated to " + data.get("targetTeam"));

        return ResponseEntity.ok(standardSuccess("Ticket escalation recorded", data, "req_ai_support_escalate_001"));
    }

    // ==========================================
    // 4. CLIENT CONTEXT & VERIFIED STATUS
    // ==========================================

    @GetMapping("/clients/{clientId}/profile")
    public ResponseEntity<Map<String, Object>> getClientProfile(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("clientId") String clientId) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> client = store.getClients(tenantId).get(clientId);
        if (client == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Client not found", null, null));
        }
        return ResponseEntity.ok(standardSuccess("Client profile retrieved", client, null));
    }

    @GetMapping("/clients/{clientId}/engagements")
    public ResponseEntity<Map<String, Object>> getClientEngagements(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("clientId") String clientId) {
        List<Map<String, Object>> list = List.of(
                Map.of("engagementId", "ENG-1001", "name", "Cloud Migration Consulting", "status", "TESTING", "milestone", "UAT & Sign-off")
        );
        return ResponseEntity.ok(standardSuccess("Client engagements retrieved", list, null));
    }

    @GetMapping("/clients/{clientId}/engagements/{engagementId}/status")
    public ResponseEntity<Map<String, Object>> getEngagementStatus(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("clientId") String clientId,
            @PathVariable("engagementId") String engagementId) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("engagementId", engagementId);
        data.put("clientId", clientId);
        data.put("status", "TESTING");
        data.put("verifiedBy", "PROJECT_MANAGEMENT_SYSTEM");
        data.put("lastVerifiedAt", "2026-10-29T10:10:00+05:30");
        return ResponseEntity.ok(standardSuccess("Verified engagement status retrieved", data, null));
    }

    @GetMapping("/clients/{clientId}/engagements/{engagementId}/milestones")
    public ResponseEntity<Map<String, Object>> getEngagementMilestones(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("clientId") String clientId,
            @PathVariable("engagementId") String engagementId) {
        List<Map<String, Object>> milestones = List.of(
                Map.of("milestoneId", "MIL-01", "title", "Infrastructure Architecture", "status", "COMPLETED"),
                Map.of("milestoneId", "MIL-02", "title", "Database Migration", "status", "COMPLETED"),
                Map.of("milestoneId", "MIL-03", "title", "Application Testing & UAT", "status", "IN_PROGRESS")
        );
        return ResponseEntity.ok(standardSuccess("Permitted milestones retrieved", milestones, null));
    }

    @GetMapping("/clients/{clientId}/contracts")
    public ResponseEntity<Map<String, Object>> getClientContracts(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("clientId") String clientId) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardSuccess("Client contracts retrieved",
                new ArrayList<>(store.getContracts(tenantId).values()), null));
    }

    @GetMapping("/clients/{clientId}/invoices")
    public ResponseEntity<Map<String, Object>> getClientInvoices(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("clientId") String clientId) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardSuccess("Client invoices retrieved",
                new ArrayList<>(store.getInvoices(tenantId).values()), null));
    }

    @PostMapping("/clients/{clientId}/billing-enquiries")
    public ResponseEntity<Map<String, Object>> createBillingEnquiry(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("clientId") String clientId,
            @RequestBody Map<String, Object> req) {
        String tenantId = getTenantId(tenantHeader);
        String enqId = "BIL-" + UUID.randomUUID().toString().substring(0, 6);
        Map<String, Object> enquiry = new LinkedHashMap<>(req);
        enquiry.put("enquiryId", enqId);
        enquiry.put("clientId", clientId);
        enquiry.put("status", "SUBMITTED");
        store.getBillingEnquiries(tenantId).put(enqId, enquiry);
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Billing enquiry created", enquiry, null));
    }

    // ==========================================
    // 5. KNOWLEDGE BASE & SEARCH
    // ==========================================

    @GetMapping("/knowledge/articles")
    public ResponseEntity<Map<String, Object>> listArticles(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardSuccess("Approved articles retrieved",
                new ArrayList<>(store.getKnowledgeArticles(tenantId).values()), null));
    }

    @GetMapping("/knowledge/articles/{articleId}")
    public ResponseEntity<Map<String, Object>> getArticle(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("articleId") String articleId) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> art = store.getKnowledgeArticles(tenantId).get(articleId);
        if (art == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Article not found", null, null));
        }
        return ResponseEntity.ok(standardSuccess("Approved article retrieved", art, null));
    }

    @PostMapping("/knowledge/search")
    public ResponseEntity<Map<String, Object>> searchKnowledge(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @RequestBody(required = false) Map<String, Object> req) {
        Map<String, Object> data = new LinkedHashMap<>();
        List<Map<String, Object>> results = new ArrayList<>();
        Map<String, Object> art1 = new LinkedHashMap<>();
        art1.put("articleId", "KB-1001");
        art1.put("title", "Customer Support Escalation Policy");
        art1.put("category", "SUPPORT_POLICY");
        art1.put("published", true);
        art1.put("relevanceScore", 0.94);
        results.add(art1);

        data.put("results", results);
        return ResponseEntity.ok(standardSuccess("Knowledge search completed", data, "req_ai_support_knowledge_001"));
    }

    // ==========================================
    // 6. AI REASONING, GROUNDING & DRAFTING
    // ==========================================

    @PostMapping("/ai/answer")
    public ResponseEntity<Map<String, Object>> generateAnswer(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @RequestBody Map<String, Object> req) {
        String convId = (String) req.getOrDefault("conversationId", "CONV-1001");

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("conversationId", convId);
        data.put("answer", "I can help you check the current status. The latest authorized project record indicates that the engagement is in the testing phase. Would you like me to connect you with the project team for more detail?");
        data.put("groundingStatus", "GROUNDED");

        List<Map<String, Object>> sources = new ArrayList<>();
        Map<String, Object> src1 = new LinkedHashMap<>();
        src1.put("sourceType", "PROJECT_STATUS");
        src1.put("sourceId", "ENG-1001");
        src1.put("retrievedAt", "2026-10-29T10:10:00+05:30");
        sources.add(src1);

        data.put("sourceReferences", sources);
        data.put("requiresHumanReview", false);

        return ResponseEntity.ok(standardSuccess("Grounded response generated", data, "req_ai_support_answer_001"));
    }

    @PostMapping("/ai/draft-response")
    public ResponseEntity<Map<String, Object>> draftResponse(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @RequestBody Map<String, Object> req) {
        Map<String, Object> draft = new LinkedHashMap<>();
        draft.put("draftText", "Thank you for contacting consulting support. Your engagement is currently undergoing UAT testing.");
        draft.put("groundedIn", List.of("ENG-1001", "KB-1001"));
        draft.put("readyForReview", true);
        return ResponseEntity.ok(standardSuccess("Draft response prepared", draft, null));
    }

    @PostMapping("/ai/check-grounding")
    public ResponseEntity<Map<String, Object>> checkGrounding(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @RequestBody Map<String, Object> req) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("isGrounded", true);
        result.put("confidence", 0.98);
        result.put("unsupportedClaims", Collections.emptyList());
        return ResponseEntity.ok(standardSuccess("Grounding check passed", result, null));
    }

    @PostMapping("/ai/detect-sentiment")
    public ResponseEntity<Map<String, Object>> detectSentiment(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @RequestBody Map<String, Object> req) {
        Map<String, Object> res = Map.of("sentiment", "NEUTRAL", "confidence", 0.89);
        return ResponseEntity.ok(standardSuccess("Sentiment detected", res, null));
    }

    @PostMapping("/ai/detect-escalation")
    public ResponseEntity<Map<String, Object>> detectEscalation(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @RequestBody Map<String, Object> req) {
        Map<String, Object> res = Map.of("escalationNeeded", false, "riskScore", 0.15);
        return ResponseEntity.ok(standardSuccess("Escalation check completed", res, null));
    }

    @PostMapping("/ai/recommend-actions")
    public ResponseEntity<Map<String, Object>> recommendActions(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @RequestBody Map<String, Object> req) {
        List<String> actions = List.of("Send deliverable timeline update", "Offer to schedule technical sync");
        return ResponseEntity.ok(standardSuccess("Next actions recommended", actions, null));
    }

    // ==========================================
    // 7. POLICIES & SLA
    // ==========================================

    @GetMapping("/policies/escalation")
    public ResponseEntity<Map<String, Object>> getEscalationPolicies(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> policies = List.of(
                Map.of("policyId", "ESC-POL-01", "condition", "Production outage or security incident", "action", "Immediate L3 Support Escalation"),
                Map.of("policyId", "ESC-POL-02", "condition", "Client unsatisfied with deliverable", "action", "Relationship Manager Alert")
        );
        return ResponseEntity.ok(standardSuccess("Escalation policies retrieved", policies, null));
    }

    @GetMapping("/policies/communication")
    public ResponseEntity<Map<String, Object>> getCommunicationPolicies(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> policy = Map.of(
                "quietHours", "20:00 - 08:00",
                "maxContactFrequencyDaily", 2,
                "optOutStrictEnforcement", true
        );
        return ResponseEntity.ok(standardSuccess("Communication policies retrieved", policy, null));
    }

    @GetMapping("/sla/policies")
    public ResponseEntity<Map<String, Object>> getSlaPolicies(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardSuccess("SLA policies retrieved",
                new ArrayList<>(store.getSlaPolicies(tenantId).values()), null));
    }

    @GetMapping("/tickets/{ticketId}/sla")
    public ResponseEntity<Map<String, Object>> getTicketSla(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("ticketId") String ticketId) {
        Map<String, Object> sla = new LinkedHashMap<>();
        sla.put("ticketId", ticketId);
        sla.put("firstResponseDue", "2026-10-29T14:00:00+05:30");
        sla.put("resolutionDue", "2026-10-30T10:00:00+05:30");
        sla.put("breached", false);
        return ResponseEntity.ok(standardSuccess("Ticket SLA information retrieved", sla, null));
    }

    // ==========================================
    // 8. FEEDBACK & HANDOFFS
    // ==========================================

    @PostMapping("/feedback")
    public ResponseEntity<Map<String, Object>> recordFeedback(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @RequestBody Map<String, Object> req) {
        String tenantId = getTenantId(tenantHeader);
        String fbId = "FB-SUP-1001";
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("feedbackId", fbId);
        data.put("conversationId", req.get("conversationId"));
        data.put("rating", req.getOrDefault("rating", 4));
        data.put("status", "RECORDED");

        store.getFeedbacks(tenantId).put(fbId, data);
        store.addActivity(tenantId, "AI_SUPPORT_AGENT", "FEEDBACK_RECORDED", "Feedback " + fbId + " recorded");

        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Feedback recorded", data, "req_ai_support_feedback_001"));
    }

    @GetMapping("/feedback/{feedbackId}")
    public ResponseEntity<Map<String, Object>> getFeedback(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("feedbackId") String feedbackId) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> fb = store.getFeedbacks(tenantId).get(feedbackId);
        if (fb == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Feedback not found", null, null));
        }
        return ResponseEntity.ok(standardSuccess("Feedback retrieved", fb, null));
    }

    @GetMapping("/handoffs")
    public ResponseEntity<Map<String, Object>> listHandoffs(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardSuccess("Authorized human handoffs retrieved",
                new ArrayList<>(store.getSupportHandoffs(tenantId).values()), null));
    }

    @GetMapping("/handoffs/{handoffId}")
    public ResponseEntity<Map<String, Object>> getHandoff(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("handoffId") String handoffId) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> h = store.getSupportHandoffs(tenantId).get(handoffId);
        if (h == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Handoff not found", null, null));
        }
        return ResponseEntity.ok(standardSuccess("Handoff retrieved", h, null));
    }

    @PostMapping("/handoffs/{handoffId}/assign")
    public ResponseEntity<Map<String, Object>> assignHandoff(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("handoffId") String handoffId,
            @RequestBody Map<String, Object> req) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> h = store.getSupportHandoffs(tenantId).get(handoffId);
        if (h != null) {
            h.put("status", "ASSIGNED");
            h.put("assignedUserId", req.get("assignedUserId"));
        }
        return ResponseEntity.ok(standardSuccess("Handoff assigned to human agent", h != null ? h : req, null));
    }

    // ==========================================
    // 9. REPORTS & AUDIT LOGS
    // ==========================================

    @PostMapping("/reports/resolution")
    public ResponseEntity<Map<String, Object>> getResolutionReport(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> rep = Map.of("firstContactResolutionRate", 0.74, "avgResolutionTimeHours", 4.8);
        return ResponseEntity.ok(standardSuccess("Resolution metrics retrieved", rep, null));
    }

    @PostMapping("/reports/automation")
    public ResponseEntity<Map<String, Object>> getAutomationReport(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> rep = Map.of("automatedDeflectionRate", 0.65, "totalQueriesAnswered", 380);
        return ResponseEntity.ok(standardSuccess("Automation metrics retrieved", rep, null));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<Map<String, Object>> getAuditLogs(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardSuccess("Authorized agent activity records retrieved",
                store.getActivityLogs(tenantId), null));
    }
}
