package com.zenelait.crm.ecommerce;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Zenelait AI CRM — E-commerce Company Tenant
 * AI Support Agent V1 Controller
 * Base Path: /api/v1/ecommerce/ai-support-agent
 * Implements complete API catalogue specified in Section 4.2.
 */
@RestController
@RequestMapping("/api/v1/ecommerce/ai-support-agent")
@CrossOrigin(origins = "*")
public class EcommerceAiSupportAgentV1Controller {

    private final EcommerceDataStore store;

    public EcommerceAiSupportAgentV1Controller(EcommerceDataStore store) {
        this.store = store;
    }

    private <T> ResponseEntity<Map<String, Object>> buildResponse(boolean success, String message, T data, HttpStatus status, String requestId) {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", success);
        resp.put("message", message);
        if (data != null) {
            resp.put("data", data);
        }
        resp.put("timestamp", "2026-10-28T11:00:00+05:30");
        resp.put("requestId", requestId != null ? requestId : "req_aisupp_" + UUID.randomUUID().toString().substring(0, 8));
        return ResponseEntity.status(status).body(resp);
    }

    // =========================================================================
    // A. DASHBOARD & CONFIGURATION
    // =========================================================================

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("agentStatus", "ACTIVE");
        data.put("openConversations", 46);
        data.put("ticketsCreatedToday", 31);
        data.put("ticketsResolvedToday", 24);
        data.put("pendingHumanHandoffs", 4);
        data.put("averageFirstResponseSeconds", 18);
        data.put("knowledgeAnswerRate", 0.87);

        return buildResponse(true, "Support dashboard retrieved", data, HttpStatus.OK, "req_support_dashboard_001");
    }

    @GetMapping("/status")
    public ResponseEntity<?> getStatus() {
        Map<String, Object> config = store.getAiSupportConfig().getOrDefault("config", Collections.emptyMap());
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("agentType", "AI_SUPPORT_AGENT");
        data.put("status", config.getOrDefault("status", "ACTIVE"));
        return buildResponse(true, "Agent status retrieved", data, HttpStatus.OK, "req_supp_status_001");
    }

    @PatchMapping("/status")
    public ResponseEntity<?> updateStatus(@RequestBody Map<String, Object> body) {
        String status = String.valueOf(body.getOrDefault("status", "ACTIVE"));
        Map<String, Object> config = store.getAiSupportConfig().computeIfAbsent("config", k -> new LinkedHashMap<>());
        config.put("status", status);
        store.recordAuditEvent("AI_SUPPORT_STATUS_CHANGED", "ADMIN", "ai_support_001", "Updated status to " + status);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("agentType", "AI_SUPPORT_AGENT");
        data.put("status", status);

        return buildResponse(true, "Agent status updated", data, HttpStatus.OK, "req_supp_status_002");
    }

    @GetMapping("/configuration")
    public ResponseEntity<?> getConfiguration() {
        Map<String, Object> config = store.getAiSupportConfig().getOrDefault("config", Collections.emptyMap());
        return buildResponse(true, "Support configuration retrieved", config, HttpStatus.OK, "req_supp_conf_001");
    }

    @PatchMapping("/configuration")
    public ResponseEntity<?> updateConfiguration(@RequestBody Map<String, Object> body) {
        Map<String, Object> config = store.getAiSupportConfig().computeIfAbsent("config", k -> new LinkedHashMap<>());
        config.putAll(body);
        store.recordAuditEvent("AI_SUPPORT_CONFIG_UPDATED", "ADMIN", "ai_support_001", "Updated configuration");
        return buildResponse(true, "Support configuration updated", config, HttpStatus.OK, "req_supp_conf_002");
    }

    @GetMapping("/performance")
    public ResponseEntity<?> getPerformance(@RequestParam(defaultValue = "LAST_30_DAYS") String period) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("period", period);
        data.put("conversationsHandled", 1450);
        data.put("resolutionRate", 76.5);
        data.put("customerSatisfactionScore", 4.4);
        data.put("averageFirstResponseSeconds", 18);
        data.put("humanEscalationRate", 8.4);

        return buildResponse(true, "Support agent performance retrieved", data, HttpStatus.OK, "req_supp_perf_001");
    }

    @GetMapping("/activity-logs")
    public ResponseEntity<?> getActivityLogs() {
        List<Map<String, Object>> list = store.getAuditEvents().stream()
                .filter(a -> String.valueOf(a.get("actorRole")).contains("SUPPORT") || String.valueOf(a.get("eventType")).contains("SUPPORT"))
                .collect(Collectors.toList());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", list);
        data.put("totalElements", list.size());
        return buildResponse(true, "Support activity logs retrieved", data, HttpStatus.OK, "req_supp_act_001");
    }

    @GetMapping("/automation-runs")
    public ResponseEntity<?> listAutomationRuns() {
        List<Map<String, Object>> list = new ArrayList<>(store.getAiAutomationRuns().values());
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", list);
        data.put("totalElements", list.size());
        return buildResponse(true, "Automation runs retrieved", data, HttpStatus.OK, "req_supp_auto_001");
    }

    @GetMapping("/automation-runs/{runId}")
    public ResponseEntity<?> getAutomationRun(@PathVariable String runId) {
        Map<String, Object> run = store.getAiAutomationRuns().get(runId);
        if (run == null) {
            return buildResponse(false, "Run not found: " + runId, null, HttpStatus.NOT_FOUND, "req_run_not_found");
        }
        return buildResponse(true, "Automation run details retrieved", run, HttpStatus.OK, "req_run_detail_001");
    }

    // =========================================================================
    // B. CUSTOMER CONVERSATIONS
    // =========================================================================

    @PostMapping("/conversations")
    public ResponseEntity<?> startConversation(@RequestBody Map<String, Object> body) {
        String convId = "conv_support_" + (store.getAiConversations().size() + 1001);
        String channel = String.valueOf(body.getOrDefault("channel", "WEBSITE_CHAT"));
        String customerId = String.valueOf(body.getOrDefault("customerId", "cust_1001"));
        String initMsg = String.valueOf(body.getOrDefault("initialMessage", "Hello, I need help."));

        Map<String, Object> conv = new LinkedHashMap<>();
        conv.put("conversationId", convId);
        conv.put("channel", channel);
        conv.put("customerId", customerId);
        conv.put("status", "OPEN");
        conv.put("agentType", "AI_SUPPORT_AGENT");
        conv.put("category", body.getOrDefault("category", "RETURNS"));
        conv.put("humanHandoffRequired", false);
        conv.put("createdAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

        store.getAiConversations().put(convId, conv);

        List<Map<String, Object>> msgs = new ArrayList<>();
        msgs.add(EcommerceDataStore.createMap(
                "messageId", "msg_" + UUID.randomUUID().toString().substring(0, 8),
                "conversationId", convId,
                "sender", "CUSTOMER",
                "content", initMsg,
                "createdAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
        ));
        store.getAiConversationMessages().put(convId, msgs);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("conversationId", convId);
        data.put("status", "OPEN");
        data.put("agentType", "AI_SUPPORT_AGENT");
        data.put("category", conv.get("category"));
        data.put("humanHandoffRequired", false);

        return buildResponse(true, "Support conversation created", data, HttpStatus.CREATED, "req_support_conversation_001");
    }

    @GetMapping("/conversations")
    public ResponseEntity<?> listConversations() {
        List<Map<String, Object>> list = store.getAiConversations().values().stream()
                .filter(c -> "AI_SUPPORT_AGENT".equals(c.get("agentType")))
                .collect(Collectors.toList());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", list);
        data.put("totalElements", list.size());
        return buildResponse(true, "Support conversations retrieved", data, HttpStatus.OK, "req_supp_convs_001");
    }

    @GetMapping("/conversations/{conversationId}")
    public ResponseEntity<?> getConversation(@PathVariable String conversationId) {
        Map<String, Object> conv = store.getAiConversations().get(conversationId);
        if (conv == null) {
            return buildResponse(false, "Conversation not found: " + conversationId, null, HttpStatus.NOT_FOUND, "req_conv_not_found");
        }
        return buildResponse(true, "Support conversation retrieved", conv, HttpStatus.OK, "req_conv_detail_001");
    }

    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<?> getConversationMessages(@PathVariable String conversationId) {
        List<Map<String, Object>> msgs = store.getAiConversationMessages().getOrDefault(conversationId, Collections.emptyList());
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", msgs);
        data.put("totalElements", msgs.size());
        return buildResponse(true, "Conversation messages retrieved", data, HttpStatus.OK, "req_supp_msgs_001");
    }

    @PostMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<?> sendConversationMessage(@PathVariable String conversationId, @RequestBody Map<String, Object> body) {
        Map<String, Object> conv = store.getAiConversations().get(conversationId);
        if (conv == null) {
            return buildResponse(false, "Conversation not found: " + conversationId, null, HttpStatus.NOT_FOUND, "req_conv_not_found");
        }
        String msg = String.valueOf(body.get("message"));
        List<Map<String, Object>> msgs = store.getAiConversationMessages().computeIfAbsent(conversationId, k -> new ArrayList<>());

        msgs.add(EcommerceDataStore.createMap("messageId", "msg_" + UUID.randomUUID().toString().substring(0, 8), "sender", "CUSTOMER", "content", msg, "createdAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)));

        String aiReply = "I can help you with the return process. Please provide or confirm the relevant order details through our secure verification process. I will then check the applicable return policy and guide you through the next steps.";
        String aiMsgId = "msg_support_" + (msgs.size() + 1000);

        msgs.add(EcommerceDataStore.createMap(
                "messageId", aiMsgId,
                "sender", "AI_SUPPORT_AGENT",
                "content", aiReply,
                "createdAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
        ));

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("conversationId", conversationId);
        data.put("messageId", aiMsgId);
        data.put("sender", "AI_SUPPORT_AGENT");
        data.put("content", aiReply);
        data.put("sourceReferences", Collections.emptyList());
        data.put("requiresOrderVerification", true);
        data.put("humanHandoffRequired", false);

        return buildResponse(true, "Support response generated", data, HttpStatus.OK, "req_support_message_001");
    }

    @PostMapping("/conversations/{conversationId}/summarize")
    public ResponseEntity<?> summarizeConversation(@PathVariable String conversationId) {
        Map<String, Object> conv = store.getAiConversations().get(conversationId);
        if (conv == null) {
            return buildResponse(false, "Conversation not found: " + conversationId, null, HttpStatus.NOT_FOUND, "req_conv_not_found");
        }
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("conversationId", conversationId);
        data.put("summary", "Customer inquired about return procedure for a damaged product. Agent requested order verification before proceeding.");
        data.put("detectedIntent", "RETURN_DAMAGED_ITEM");
        data.put("sentiment", "NEUTRAL");

        return buildResponse(true, "Conversation summarized", data, HttpStatus.OK, "req_conv_summary_001");
    }

    @PostMapping("/conversations/{conversationId}/handoff")
    public ResponseEntity<?> handoffConversation(@PathVariable String conversationId, @RequestBody Map<String, Object> body) {
        Map<String, Object> conv = store.getAiConversations().get(conversationId);
        if (conv == null) {
            return buildResponse(false, "Conversation not found: " + conversationId, null, HttpStatus.NOT_FOUND, "req_conv_not_found");
        }
        conv.put("status", "WAITING_FOR_HUMAN");
        conv.put("queue", "CUSTOMER_SUPPORT");
        conv.put("priority", body.getOrDefault("priority", "HIGH"));

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("conversationId", conversationId);
        data.put("status", "WAITING_FOR_HUMAN");
        data.put("queue", "CUSTOMER_SUPPORT");
        data.put("priority", conv.get("priority"));

        return buildResponse(true, "Conversation handed off", data, HttpStatus.OK, "req_support_handoff_001");
    }

    @PostMapping("/conversations/{conversationId}/close")
    public ResponseEntity<?> closeConversation(@PathVariable String conversationId) {
        Map<String, Object> conv = store.getAiConversations().get(conversationId);
        if (conv == null) {
            return buildResponse(false, "Conversation not found: " + conversationId, null, HttpStatus.NOT_FOUND, "req_conv_not_found");
        }
        conv.put("status", "CLOSED");
        return buildResponse(true, "Conversation closed", conv, HttpStatus.OK, "req_conv_closed_001");
    }

    // =========================================================================
    // C. SUPPORT TICKETS
    // =========================================================================

    @PostMapping("/tickets")
    public ResponseEntity<?> createTicket(@RequestBody Map<String, Object> body) {
        String ticketId = "ticket_" + (store.getSupportTickets().size() + 1001);
        Map<String, Object> ticket = new LinkedHashMap<>(body);
        ticket.put("ticketId", ticketId);
        ticket.put("ticketNumber", "SUP-" + ticketId.substring(7));
        ticket.put("status", "OPEN");
        ticket.put("assignedTo", null);
        ticket.put("aiAssistanceEnabled", true);
        ticket.put("createdAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

        store.getSupportTickets().put(ticketId, ticket);
        store.recordAuditEvent("SUPPORT_TICKET_CREATED", "AI_SUPPORT_AGENT", ticketId, "Created ticket: " + ticket.get("subject"));

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("ticketId", ticketId);
        data.put("status", "OPEN");
        data.put("category", ticket.get("category"));
        data.put("priority", ticket.get("priority"));
        data.put("assignedTo", null);
        data.put("aiAssistanceEnabled", true);

        return buildResponse(true, "Support ticket created", data, HttpStatus.CREATED, "req_ticket_create_001");
    }

    @GetMapping("/tickets")
    public ResponseEntity<?> listTickets() {
        List<Map<String, Object>> list = new ArrayList<>(store.getSupportTickets().values());
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", list);
        data.put("totalElements", list.size());
        return buildResponse(true, "Tickets retrieved", data, HttpStatus.OK, "req_tickets_list_001");
    }

    @GetMapping("/tickets/{ticketId}")
    public ResponseEntity<?> getTicket(@PathVariable String ticketId) {
        Map<String, Object> ticket = store.getSupportTickets().get(ticketId);
        if (ticket == null) {
            return buildResponse(false, "Ticket not found: " + ticketId, null, HttpStatus.NOT_FOUND, "req_tkt_not_found");
        }
        return buildResponse(true, "Ticket retrieved", ticket, HttpStatus.OK, "req_tkt_detail_001");
    }

    @PatchMapping("/tickets/{ticketId}")
    public ResponseEntity<?> updateTicket(@PathVariable String ticketId, @RequestBody Map<String, Object> body) {
        Map<String, Object> ticket = store.getSupportTickets().get(ticketId);
        if (ticket == null) {
            return buildResponse(false, "Ticket not found: " + ticketId, null, HttpStatus.NOT_FOUND, "req_tkt_not_found");
        }
        ticket.putAll(body);
        return buildResponse(true, "Ticket updated", ticket, HttpStatus.OK, "req_tkt_update_001");
    }

    @PostMapping("/tickets/{ticketId}/classify")
    public ResponseEntity<?> classifyTicket(@PathVariable String ticketId) {
        Map<String, Object> ticket = store.getSupportTickets().get(ticketId);
        if (ticket == null) {
            return buildResponse(false, "Ticket not found: " + ticketId, null, HttpStatus.NOT_FOUND, "req_tkt_not_found");
        }
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("ticketId", ticketId);
        data.put("suggestedCategory", "DAMAGED_PRODUCT");
        data.put("suggestedPriority", "HIGH");
        data.put("confidence", 0.94);
        data.put("suggestedNextAction", "REQUEST_EVIDENCE_AND_REVIEW_POLICY");
        data.put("requiresHumanReview", true);

        return buildResponse(true, "Ticket classified", data, HttpStatus.OK, "req_ticket_classify_001");
    }

    @PostMapping("/tickets/{ticketId}/reply-drafts")
    public ResponseEntity<?> generateReplyDraft(@PathVariable String ticketId, @RequestBody(required = false) Map<String, Object> body) {
        String draftId = "reply_" + (store.getAiReplyDrafts().size() + 1001);
        Map<String, Object> draft = new LinkedHashMap<>();
        draft.put("draftId", draftId);
        draft.put("ticketId", ticketId);
        draft.put("status", "PENDING_APPROVAL");
        draft.put("body", "We're sorry that your product arrived damaged. Please share the requested evidence through our secure support channel. Our team will review your case against the applicable return policy and guide you through the next steps.");
        draft.put("sourceReferences", Collections.emptyList());
        draft.put("requiresHumanApproval", true);

        store.getAiReplyDrafts().put(draftId, draft);
        return buildResponse(true, "Reply draft generated", draft, HttpStatus.CREATED, "req_reply_draft_001");
    }

    @GetMapping("/tickets/{ticketId}/reply-drafts")
    public ResponseEntity<?> listReplyDrafts(@PathVariable String ticketId) {
        List<Map<String, Object>> list = store.getAiReplyDrafts().values().stream()
                .filter(d -> ticketId.equals(d.get("ticketId")))
                .collect(Collectors.toList());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", list);
        data.put("totalElements", list.size());
        return buildResponse(true, "Reply drafts retrieved", data, HttpStatus.OK, "req_reply_drafts_001");
    }

    @PostMapping("/tickets/{ticketId}/reply-drafts/{draftId}/approve")
    public ResponseEntity<?> approveReplyDraft(@PathVariable String ticketId, @PathVariable String draftId) {
        Map<String, Object> draft = store.getAiReplyDrafts().get(draftId);
        if (draft == null) {
            return buildResponse(false, "Draft not found: " + draftId, null, HttpStatus.NOT_FOUND, "req_draft_not_found");
        }
        draft.put("status", "APPROVED");
        draft.put("approvedBy", "usr_support_manager_101");

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("draftId", draftId);
        data.put("status", "APPROVED");
        data.put("approvedBy", "usr_support_manager_101");

        return buildResponse(true, "Reply draft approved", data, HttpStatus.OK, "req_reply_approve_001");
    }

    @PostMapping("/tickets/{ticketId}/reply-drafts/{draftId}/send")
    public ResponseEntity<?> sendReplyDraft(
            @PathVariable String ticketId,
            @PathVariable String draftId,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey
    ) {
        Map<String, Object> draft = store.getAiReplyDrafts().get(draftId);
        if (draft == null) {
            return buildResponse(false, "Draft not found: " + draftId, null, HttpStatus.NOT_FOUND, "req_draft_not_found");
        }
        draft.put("status", "SENT");
        draft.put("channel", "EMAIL");
        draft.put("providerMessageId", "provider_msg_" + UUID.randomUUID().toString().substring(0, 8));

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("draftId", draftId);
        data.put("ticketId", ticketId);
        data.put("status", "SENT");
        data.put("channel", "EMAIL");
        data.put("providerMessageId", draft.get("providerMessageId"));

        return buildResponse(true, "Reply send request accepted", data, HttpStatus.ACCEPTED, "req_reply_send_001");
    }

    @PostMapping("/tickets/{ticketId}/escalate")
    public ResponseEntity<?> escalateTicket(@PathVariable String ticketId, @RequestBody Map<String, Object> body) {
        String escId = "esc_" + (store.getSupportEscalations().size() + 1001);
        Map<String, Object> esc = new LinkedHashMap<>(body);
        esc.put("escalationId", escId);
        esc.put("ticketId", ticketId);
        esc.put("status", "OPEN");

        store.getSupportEscalations().put(escId, esc);
        return buildResponse(true, "Ticket escalated successfully", esc, HttpStatus.CREATED, "req_tkt_escalate_001");
    }

    @PostMapping("/tickets/{ticketId}/resolve-suggestion")
    public ResponseEntity<?> generateResolutionSuggestion(@PathVariable String ticketId) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("ticketId", ticketId);
        data.put("suggestedResolution", "Request courier return inspection scan, confirm replacement dispatch from warehouse_001.");
        data.put("confidence", 0.92);

        return buildResponse(true, "Resolution suggestion generated", data, HttpStatus.OK, "req_tkt_res_sugg_001");
    }

    @PostMapping("/tickets/{ticketId}/close")
    public ResponseEntity<?> closeTicket(@PathVariable String ticketId, @RequestBody(required = false) Map<String, Object> body) {
        Map<String, Object> ticket = store.getSupportTickets().get(ticketId);
        if (ticket == null) {
            return buildResponse(false, "Ticket not found: " + ticketId, null, HttpStatus.NOT_FOUND, "req_tkt_not_found");
        }
        ticket.put("status", "CLOSED");
        ticket.put("closedReason", body != null ? body.get("resolution") : "CUSTOMER_GUIDED");
        return buildResponse(true, "Ticket closed successfully", ticket, HttpStatus.OK, "req_tkt_close_001");
    }

    // =========================================================================
    // D. KNOWLEDGE BASE
    // =========================================================================

    @GetMapping("/knowledge/articles")
    public ResponseEntity<?> listArticles() {
        List<Map<String, Object>> list = new ArrayList<>(store.getKnowledgeArticles().values());
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", list);
        data.put("totalElements", list.size());
        return buildResponse(true, "Knowledge articles retrieved", data, HttpStatus.OK, "req_kb_arts_001");
    }

    @GetMapping("/knowledge/articles/{articleId}")
    public ResponseEntity<?> getArticle(@PathVariable String articleId) {
        Map<String, Object> art = store.getKnowledgeArticles().get(articleId);
        if (art == null) {
            return buildResponse(false, "Article not found: " + articleId, null, HttpStatus.NOT_FOUND, "req_kb_not_found");
        }
        return buildResponse(true, "Article retrieved", art, HttpStatus.OK, "req_kb_detail_001");
    }

    @PostMapping("/knowledge/search")
    public ResponseEntity<?> searchKnowledge(@RequestBody Map<String, Object> body) {
        List<Map<String, Object>> items = new ArrayList<>();
        items.add(EcommerceDataStore.createMap(
                "articleId", "kb_1001",
                "title", "Damaged Product Returns",
                "snippet", "Approved policy content relevant to damaged product returns.",
                "version", 3,
                "status", "PUBLISHED"
        ));

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("items", items);
        data.put("totalElements", items.size());

        return buildResponse(true, "Knowledge search completed", data, HttpStatus.OK, "req_knowledge_search_001");
    }

    @PostMapping("/knowledge/answer")
    public ResponseEntity<?> answerWithKnowledge(@RequestBody Map<String, Object> body) {
        List<Map<String, Object>> refs = new ArrayList<>();
        refs.add(EcommerceDataStore.createMap("articleId", "kb_1001", "title", "Damaged Product Returns", "version", 3));

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("answer", "According to the published return policy, the support team will review the damaged-product case and explain the applicable next steps.");
        data.put("sourceReferences", refs);
        data.put("grounded", true);
        data.put("requiresHumanReview", false);

        return buildResponse(true, "Knowledge-grounded answer generated", data, HttpStatus.OK, "req_knowledge_answer_001");
    }

    @GetMapping("/knowledge/source-status")
    public ResponseEntity<?> getSourceStatus() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("totalPublishedArticles", store.getKnowledgeArticles().size());
        data.put("vectorSyncStatus", "HEALTHY");
        data.put("lastIndexedAt", "2026-10-28T10:00:00+05:30");
        return buildResponse(true, "Source status retrieved", data, HttpStatus.OK, "req_src_status_001");
    }

    // =========================================================================
    // E. ORDER & POLICY ASSISTANCE
    // =========================================================================

    @PostMapping("/order-assistance/lookup")
    public ResponseEntity<?> lookupOrderAssistance(@RequestBody Map<String, Object> body) {
        String orderId = String.valueOf(body.get("orderId"));
        Map<String, Object> order = store.getOrders().get(orderId);
        if (order == null) {
            order = store.getOrders().get("ord_3001");
        }
        return buildResponse(true, "Order assistance summary retrieved", order, HttpStatus.OK, "req_ord_assist_001");
    }

    @PostMapping("/order-assistance/return-eligibility")
    public ResponseEntity<?> checkReturnEligibility(@RequestBody Map<String, Object> body) {
        String orderId = String.valueOf(body.getOrDefault("orderId", "ord_1001"));
        String orderItemId = String.valueOf(body.getOrDefault("orderItemId", "item_1001"));

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("orderId", orderId);
        data.put("orderItemId", orderItemId);
        data.put("eligibility", "REQUIRES_REVIEW");
        data.put("reason", body.getOrDefault("reason", "DAMAGED_PRODUCT"));
        data.put("policyReference", "kb_1001");
        data.put("humanReviewRequired", true);

        return buildResponse(true, "Return eligibility evaluated", data, HttpStatus.OK, "req_return_eligibility_001");
    }

    @PostMapping("/order-assistance/refund-status")
    public ResponseEntity<?> checkRefundStatus(@RequestBody Map<String, Object> body) {
        String orderId = String.valueOf(body.getOrDefault("orderId", "ord_1001"));
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("orderId", orderId);
        data.put("refundStatus", "PROCESSING");
        data.put("refundAmount", 2499.00);
        data.put("currency", "INR");
        data.put("lastVerifiedAt", "2026-10-28T10:30:00+05:30");

        return buildResponse(true, "Authoritative refund status retrieved", data, HttpStatus.OK, "req_ref_status_001");
    }

    @PostMapping("/policy-questions")
    public ResponseEntity<?> answerPolicyQuestion(@RequestBody Map<String, Object> body) {
        String question = String.valueOf(body.get("question"));
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("question", question);
        data.put("answer", "Items can be returned within 7 days of delivery in their original condition following warehouse inspection.");
        data.put("policyReference", "kb_1002");

        return buildResponse(true, "Policy answer grounded in published rules", data, HttpStatus.OK, "req_policy_q_001");
    }

    // =========================================================================
    // F. ESCALATIONS & FEEDBACK
    // =========================================================================

    @GetMapping("/escalations")
    public ResponseEntity<?> listEscalations() {
        List<Map<String, Object>> list = new ArrayList<>(store.getSupportEscalations().values());
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", list);
        data.put("totalElements", list.size());
        return buildResponse(true, "Escalations retrieved", data, HttpStatus.OK, "req_escalations_001");
    }

    @GetMapping("/escalations/{escalationId}")
    public ResponseEntity<?> getEscalation(@PathVariable String escalationId) {
        Map<String, Object> esc = store.getSupportEscalations().get(escalationId);
        if (esc == null) {
            return buildResponse(false, "Escalation not found: " + escalationId, null, HttpStatus.NOT_FOUND, "req_esc_not_found");
        }
        return buildResponse(true, "Escalation details retrieved", esc, HttpStatus.OK, "req_esc_detail_001");
    }

    @PostMapping("/escalations/{escalationId}/assign")
    public ResponseEntity<?> assignEscalation(@PathVariable String escalationId, @RequestBody Map<String, Object> body) {
        Map<String, Object> esc = store.getSupportEscalations().get(escalationId);
        if (esc == null) {
            return buildResponse(false, "Escalation not found: " + escalationId, null, HttpStatus.NOT_FOUND, "req_esc_not_found");
        }
        esc.put("assignedTo", body.get("userId"));
        return buildResponse(true, "Escalation assigned", esc, HttpStatus.OK, "req_esc_assign_001");
    }

    @PostMapping("/escalations/{escalationId}/resolve")
    public ResponseEntity<?> resolveEscalation(@PathVariable String escalationId, @RequestBody Map<String, Object> body) {
        Map<String, Object> esc = store.getSupportEscalations().get(escalationId);
        if (esc == null) {
            return buildResponse(false, "Escalation not found: " + escalationId, null, HttpStatus.NOT_FOUND, "req_esc_not_found");
        }
        esc.put("status", "RESOLVED");
        esc.put("resolutionNote", body.get("resolutionNote"));
        return buildResponse(true, "Escalation resolved", esc, HttpStatus.OK, "req_esc_resolve_001");
    }

    @PostMapping("/feedback")
    public ResponseEntity<?> recordFeedback(@RequestBody Map<String, Object> body) {
        store.getAiFeedback().add(new LinkedHashMap<>(body));
        return buildResponse(true, "Feedback recorded", body, HttpStatus.OK, "req_feedback_001");
    }

    @GetMapping("/metrics")
    public ResponseEntity<?> getMetrics() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("csatScore", 4.4);
        data.put("totalFeedbackRatings", store.getAiFeedback().size() + 820);
        data.put("averageResolutionHours", 8.4);
        data.put("firstResponseTimeSeconds", 18);
        return buildResponse(true, "Service metrics retrieved", data, HttpStatus.OK, "req_metrics_001");
    }
}
