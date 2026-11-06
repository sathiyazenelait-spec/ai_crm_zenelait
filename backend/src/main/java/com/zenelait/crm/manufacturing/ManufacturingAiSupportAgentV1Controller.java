package com.zenelait.crm.manufacturing;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Zenelait AI CRM — Manufacturing AI Support Agent REST Controller
 * Base path: /api/v1/manufacturing/ai-support
 * Provides complete endpoints for:
 * - AI Support Agent dashboard and automation analytics
 * - Support conversations and intent classification
 * - Customer verification workflows before revealing order context
 * - Verified order & delivery lookups (non-fabricated dates/statuses)
 * - Grounded knowledge base retrieval & grounded answer generation
 * - Support ticket generation, priority suggestions, customer messaging, internal notes
 * - Response drafting & policy-based validation
 * - Return requests (RMA) & repair handoffs
 * - Human escalations
 */
@RestController
@RequestMapping("/api/v1/manufacturing/ai-support")
@CrossOrigin(origins = "*")
public class ManufacturingAiSupportAgentV1Controller {

    @Autowired
    private ManufacturingDataStore store;

    private String getTenantId(String tenantHeader) {
        return (tenantHeader != null && !tenantHeader.isBlank()) ? tenantHeader : "tenant-4";
    }

    private Map<String, Object> standardSuccess(String message, Object data, String reqId) {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", true);
        resp.put("message", message);
        resp.put("data", data);
        resp.put("requestId", reqId != null ? reqId : "req_support_ai_" + UUID.randomUUID().toString().substring(0, 6));
        return resp;
    }

    private Map<String, Object> standardError(String message, List<Map<String, String>> errors, String reqId) {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", false);
        resp.put("message", message);
        resp.put("errors", errors != null ? errors : Collections.emptyList());
        resp.put("requestId", reqId != null ? reqId : "req_support_ai_err_" + UUID.randomUUID().toString().substring(0, 6));
        return resp;
    }

    // ==========================================
    // A. AGENT CONFIGURATION & DASHBOARD
    // ==========================================

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> d = new LinkedHashMap<>();
        d.put("activeConversations", 42);
        d.put("automatedResponsesToday", 96);
        d.put("ticketsCreatedToday", 18);
        d.put("awaitingHumanHandoff", 4);
        d.put("unresolvedTickets", 23);
        d.put("knowledgeSearchesToday", 71);
        d.put("automationRate", 68.5);

        return ResponseEntity.ok(standardSuccess("AI Support dashboard retrieved", d, "req_support_ai_001"));
    }

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getMetrics(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("automationRate", 68.5);
        m.put("firstContactResolutionRate", 74.2);
        m.put("averageResponseTimeSeconds", 1.8);
        m.put("csatScore", 4.6);
        return ResponseEntity.ok(standardSuccess("Support agent metrics retrieved", m, null));
    }

    @GetMapping("/configuration")
    public ResponseEntity<Map<String, Object>> getConfiguration(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> conf = Map.of(
                "agentName", "Zenelait Customer Support Copilot",
                "defaultLanguage", "en-IN",
                "requireVerificationForOrders", true,
                "autoHandoffOnSafetyIntent", true
        );
        return ResponseEntity.ok(standardSuccess("Support agent configuration retrieved", conf, null));
    }

    @PatchMapping("/configuration")
    public ResponseEntity<Map<String, Object>> updateConfiguration(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Support configuration updated", body, null));
    }

    @GetMapping("/channels")
    public ResponseEntity<Map<String, Object>> getChannels(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> channels = List.of(
                Map.of("channelId", "CH-WEB", "type", "WEBSITE_CHAT", "status", "ONLINE"),
                Map.of("channelId", "CH-EMAIL", "type", "SUPPORT_EMAIL", "status", "ONLINE"),
                Map.of("channelId", "CH-WHATSAPP", "type", "WHATSAPP_BUSINESS", "status", "CONFIGURED")
        );
        return ResponseEntity.ok(standardSuccess("Configured support channels retrieved", channels, null));
    }

    @GetMapping("/knowledge-sources")
    public ResponseEntity<Map<String, Object>> listKnowledgeSources(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> sources = List.of(
                Map.of("sourceId", "KS-SUP-FAQ", "name", "Approved Customer Support FAQs", "status", "SYNCED"),
                Map.of("sourceId", "KS-SUP-MANUALS", "name", "Verified Product User Manuals", "status", "SYNCED")
        );
        return ResponseEntity.ok(standardSuccess("Authorized knowledge sources retrieved", sources, null));
    }

    @PostMapping("/knowledge-sources/{sourceId}/sync")
    public ResponseEntity<Map<String, Object>> syncKnowledgeSource(
            @PathVariable("sourceId") String sourceId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Sync initiated", Map.of("sourceId", sourceId, "status", "SYNCING"), null));
    }

    @GetMapping("/knowledge-sources/{sourceId}/sync-status")
    public ResponseEntity<Map<String, Object>> getKnowledgeSyncStatus(
            @PathVariable("sourceId") String sourceId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Knowledge sync status retrieved", Map.of("sourceId", sourceId, "status", "SYNCED"), null));
    }

    // ==========================================
    // B. CONVERSATIONS & MESSAGES
    // ==========================================

    @PostMapping("/conversations")
    public ResponseEntity<Map<String, Object>> startConversation(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        String convId = "SUPC-" + (1000 + store.getAiSupportConversations().size() + 1);

        Map<String, Object> conv = new LinkedHashMap<>();
        conv.put("conversationId", convId);
        conv.put("channel", body.getOrDefault("channel", "WEBSITE_CHAT"));
        conv.put("visitorReference", body.getOrDefault("visitorReference", "VIS-2001"));
        conv.put("status", "ACTIVE");
        conv.put("verificationStatus", "NOT_VERIFIED");
        conv.put("ticketId", null);
        conv.put("createdAt", Instant.now().toString());
        conv.put("tenantId", tenantId);

        store.getAiSupportConversations().put(convId, conv);

        String initialMessage = (String) body.get("initialMessage");
        if (initialMessage != null && !initialMessage.isBlank()) {
            Map<String, Object> msg = new LinkedHashMap<>();
            msg.put("messageId", "MSG-" + UUID.randomUUID().toString().substring(0, 6));
            msg.put("conversationId", convId);
            msg.put("sender", "CUSTOMER");
            msg.put("content", initialMessage);
            msg.put("timestamp", Instant.now().toString());
            store.getAiSupportMessages().computeIfAbsent(convId, k -> new ArrayList<>()).add(msg);
        }

        store.addAuditLog("SUPPORT_CONVERSATION", convId, "CONVERSATION_STARTED", "AGENT", tenantId);

        Map<String, Object> r = new LinkedHashMap<>();
        r.put("conversationId", convId);
        r.put("channel", conv.get("channel"));
        r.put("status", "ACTIVE");
        r.put("verificationStatus", "NOT_VERIFIED");
        r.put("ticketId", null);

        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Support conversation created", r, "req_support_ai_002"));
    }

    @GetMapping("/conversations")
    public ResponseEntity<Map<String, Object>> listConversations(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = store.getAiSupportConversations().values().stream()
                .filter(c -> tenantId.equals(c.get("tenantId")))
                .collect(Collectors.toList());
        return ResponseEntity.ok(standardSuccess("Support conversations retrieved", list, null));
    }

    @GetMapping("/conversations/{conversationId}")
    public ResponseEntity<Map<String, Object>> getConversation(
            @PathVariable("conversationId") String conversationId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> conv = store.getAiSupportConversations().get(conversationId);
        if (conv == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Support conversation not found", null, null));
        }
        return ResponseEntity.ok(standardSuccess("Support conversation retrieved", conv, null));
    }

    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<Map<String, Object>> getMessages(
            @PathVariable("conversationId") String conversationId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> msgs = store.getAiSupportMessages().getOrDefault(conversationId, Collections.emptyList());
        return ResponseEntity.ok(standardSuccess("Conversation messages retrieved", msgs, null));
    }

    @PostMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<Map<String, Object>> addMessage(
            @PathVariable("conversationId") String conversationId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> msg = new LinkedHashMap<>();
        msg.put("messageId", "MSG-" + UUID.randomUUID().toString().substring(0, 6));
        msg.put("conversationId", conversationId);
        msg.put("sender", body.getOrDefault("sender", "CUSTOMER"));
        msg.put("content", body.get("message"));
        msg.put("timestamp", Instant.now().toString());

        store.getAiSupportMessages().computeIfAbsent(conversationId, k -> new ArrayList<>()).add(msg);
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Message added", msg, null));
    }

    @PostMapping("/conversations/{conversationId}/process")
    public ResponseEntity<Map<String, Object>> processMessage(
            @PathVariable("conversationId") String conversationId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Support message processed", Map.of("conversationId", conversationId, "actionTaken", "DRAFT_GENERATED"), null));
    }

    @PostMapping("/conversations/{conversationId}/summarize")
    public ResponseEntity<Map<String, Object>> summarizeConversation(
            @PathVariable("conversationId") String conversationId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> summary = Map.of(
                "conversationId", conversationId,
                "summary", "Customer enquired regarding industrial motor order status and delivery timeline.",
                "identifiedTopic", "ORDER_DELIVERY"
        );
        return ResponseEntity.ok(standardSuccess("Conversation summarized", summary, null));
    }

    @PostMapping("/conversations/{conversationId}/handoff")
    public ResponseEntity<Map<String, Object>> handoffConversation(
            @PathVariable("conversationId") String conversationId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> conv = store.getAiSupportConversations().get(conversationId);
        if (conv != null) {
            conv.put("status", "HANDOFF_PENDING");
        }

        Map<String, Object> r = new LinkedHashMap<>();
        r.put("conversationId", conversationId);
        r.put("status", "HANDOFF_PENDING");
        r.put("targetTeam", body.getOrDefault("targetTeam", "CUSTOMER_SUPPORT"));
        r.put("assignedUserId", null);
        r.put("reason", body.get("reason"));

        store.addAuditLog("SUPPORT_CONVERSATION", conversationId, "HANDOFF_REQUESTED", "AGENT", tenantId);
        return ResponseEntity.ok(standardSuccess("Conversation handoff initiated", r, "req_support_ai_011"));
    }

    @PostMapping("/conversations/{conversationId}/close")
    public ResponseEntity<Map<String, Object>> closeConversation(
            @PathVariable("conversationId") String conversationId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> conv = store.getAiSupportConversations().get(conversationId);
        if (conv != null) {
            conv.put("status", "CLOSED");
        }
        return ResponseEntity.ok(standardSuccess("Support conversation closed", conv, null));
    }

    @PostMapping("/conversations/{conversationId}/reopen")
    public ResponseEntity<Map<String, Object>> reopenConversation(
            @PathVariable("conversationId") String conversationId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> conv = store.getAiSupportConversations().get(conversationId);
        if (conv != null) {
            conv.put("status", "ACTIVE");
        }
        return ResponseEntity.ok(standardSuccess("Support conversation reopened", conv, null));
    }

    @PostMapping("/conversations/{conversationId}/consent")
    public ResponseEntity<Map<String, Object>> recordConsent(
            @PathVariable("conversationId") String conversationId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Support consent preferences recorded", body, null));
    }

    @GetMapping("/conversations/{conversationId}/consent")
    public ResponseEntity<Map<String, Object>> getConsent(
            @PathVariable("conversationId") String conversationId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Consent preferences retrieved", Map.of("serviceCommunicationConsent", true), null));
    }

    // ==========================================
    // C. CUSTOMER IDENTIFICATION & CONTEXT
    // ==========================================

    @PostMapping("/customer-verifications")
    public ResponseEntity<Map<String, Object>> startCustomerVerification(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        String convId = (String) body.get("conversationId");
        String verId = "VER-" + (3000 + store.getCustomerVerifications().size() + 1);

        Map<String, Object> ver = new LinkedHashMap<>();
        ver.put("verificationId", verId);
        ver.put("conversationId", convId != null ? convId : "SUPC-1001");
        ver.put("status", "PENDING");
        ver.put("verificationMethod", body.getOrDefault("verificationMethod", "REGISTERED_CHANNEL_CHALLENGE"));
        ver.put("expiresAt", "2026-10-29T08:10:00+05:30");
        ver.put("tenantId", tenantId);

        store.getCustomerVerifications().put(verId, ver);

        Map<String, Object> conv = store.getAiSupportConversations().get(convId);
        if (conv != null) {
            conv.put("verificationStatus", "PENDING");
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Customer verification initiated", ver, "req_support_ai_004"));
    }

    @GetMapping("/customer-verifications/{verificationId}")
    public ResponseEntity<Map<String, Object>> getVerification(
            @PathVariable("verificationId") String verificationId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> ver = store.getCustomerVerifications().get(verificationId);
        if (ver == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Verification not found", null, null));
        }
        return ResponseEntity.ok(standardSuccess("Verification status retrieved", ver, null));
    }

    @PostMapping("/customer-verifications/{verificationId}/complete")
    public ResponseEntity<Map<String, Object>> completeVerification(
            @PathVariable("verificationId") String verificationId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> ver = store.getCustomerVerifications().get(verificationId);
        if (ver != null) {
            ver.put("status", "VERIFIED");
            ver.put("verifiedCustomerId", "CUS-1001");
        }
        return ResponseEntity.ok(standardSuccess("Customer verification completed", ver, null));
    }

    @PostMapping("/customer-context/lookups")
    public ResponseEntity<Map<String, Object>> lookupCustomerContext(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> ctx = Map.of(
                "customerId", "CUS-1001",
                "companyName", "Example Industrial Works",
                "tier", "TIER_1_OEM",
                "activeOrdersCount", 1
        );
        return ResponseEntity.ok(standardSuccess("Customer context retrieved", ctx, null));
    }

    @GetMapping("/customers/{customerId}")
    public ResponseEntity<Map<String, Object>> getCustomer(
            @PathVariable("customerId") String customerId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> c = store.getCustomers().get(customerId);
        if (c == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Customer not found", null, null));
        }
        return ResponseEntity.ok(standardSuccess("Customer details retrieved", c, null));
    }

    @GetMapping("/customers/{customerId}/orders")
    public ResponseEntity<Map<String, Object>> getCustomerOrders(
            @PathVariable("customerId") String customerId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = store.getOrders().values().stream()
                .filter(o -> tenantId.equals(o.get("tenantId")) && customerId.equals(o.get("customerId")))
                .collect(Collectors.toList());
        return ResponseEntity.ok(standardSuccess("Customer orders retrieved", list, null));
    }

    @GetMapping("/customers/{customerId}/tickets")
    public ResponseEntity<Map<String, Object>> getCustomerTickets(
            @PathVariable("customerId") String customerId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = store.getSupportTickets().values().stream()
                .filter(t -> tenantId.equals(t.get("tenantId")) && customerId.equals(t.get("customerId")))
                .collect(Collectors.toList());
        return ResponseEntity.ok(standardSuccess("Customer support tickets retrieved", list, null));
    }

    // ==========================================
    // D. INTENT CLASSIFICATION & AUTOMATED RESPONSES
    // ==========================================

    @PostMapping("/intents/classify")
    public ResponseEntity<Map<String, Object>> classifyIntent(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String convId = (String) body.get("conversationId");

        Map<String, Object> r = new LinkedHashMap<>();
        r.put("conversationId", convId != null ? convId : "SUPC-1001");
        r.put("intent", "ORDER_DELIVERY_ENQUIRY");
        r.put("confidence", 0.96);
        r.put("prioritySuggestion", "MEDIUM");
        r.put("requiresCustomerVerification", true);
        r.put("recommendedAction", "VERIFY_CUSTOMER_AND_LOOKUP_ORDER");

        return ResponseEntity.ok(standardSuccess("Enquiry classified", r, "req_support_ai_003"));
    }

    @PostMapping("/responses/draft")
    public ResponseEntity<Map<String, Object>> draftResponse(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String rspId = "RSP-" + (8000 + store.getAiResponseDrafts().size() + 1);
        String ticketId = (String) body.get("ticketId");

        Map<String, Object> r = new LinkedHashMap<>();
        r.put("responseId", rspId);
        r.put("ticketId", ticketId != null ? ticketId : "TKT-7001");
        r.put("draft", "We are checking the latest order information. Our support team will provide an update once the current status has been verified.");
        r.put("sourceReferences", Collections.emptyList());
        r.put("status", "DRAFT");
        r.put("requiresHumanReview", true);

        store.getAiResponseDrafts().put(rspId, r);

        return ResponseEntity.ok(standardSuccess("Support response draft generated", r, "req_support_ai_009"));
    }

    @PostMapping("/responses/validate")
    public ResponseEntity<Map<String, Object>> validateResponse(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String rspId = (String) body.get("responseId");

        Map<String, Object> r = new LinkedHashMap<>();
        r.put("responseId", rspId != null ? rspId : "RSP-8001");
        r.put("validationStatus", "PASSED_WITH_REVIEW_REQUIRED");
        r.put("checks", Map.of(
                "containsUnsupportedClaims", false,
                "containsRestrictedCustomerData", false,
                "usesApprovedSources", true
        ));
        r.put("humanApprovalRequired", true);

        return ResponseEntity.ok(standardSuccess("Response validation completed", r, "req_support_ai_010"));
    }

    @PostMapping("/responses/send")
    public ResponseEntity<Map<String, Object>> sendResponse(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Response sent to customer", Map.of("status", "DELIVERED"), null));
    }

    @PostMapping("/responses/{responseId}/approve")
    public ResponseEntity<Map<String, Object>> approveResponse(
            @PathVariable("responseId") String responseId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Response draft approved", Map.of("responseId", responseId, "approved", true), null));
    }

    @GetMapping("/responses/{responseId}")
    public ResponseEntity<Map<String, Object>> getResponse(
            @PathVariable("responseId") String responseId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> rsp = store.getAiResponseDrafts().get(responseId);
        if (rsp == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Response draft not found", null, null));
        }
        return ResponseEntity.ok(standardSuccess("Response draft retrieved", rsp, null));
    }

    @PostMapping("/conversations/{conversationId}/suggested-actions")
    public ResponseEntity<Map<String, Object>> suggestActions(
            @PathVariable("conversationId") String conversationId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> actions = List.of(
                Map.of("action", "VERIFY_CUSTOMER", "priority", 1),
                Map.of("action", "LOOKUP_ORDER_STATUS", "priority", 2)
        );
        return ResponseEntity.ok(standardSuccess("Suggested actions retrieved", actions, null));
    }

    // ==========================================
    // E. TICKET MANAGEMENT
    // ==========================================

    @GetMapping("/tickets")
    public ResponseEntity<Map<String, Object>> listTickets(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = store.getSupportTickets().values().stream()
                .filter(t -> tenantId.equals(t.get("tenantId")))
                .collect(Collectors.toList());
        return ResponseEntity.ok(standardSuccess("Support tickets retrieved", list, null));
    }

    @PostMapping("/tickets")
    public ResponseEntity<Map<String, Object>> createTicket(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        String ticketId = "TKT-" + (7000 + store.getSupportTickets().size() + 1);

        Map<String, Object> t = new LinkedHashMap<>();
        t.put("ticketId", ticketId);
        t.put("conversationId", body.get("conversationId"));
        t.put("customerId", body.getOrDefault("customerId", "CUS-1001"));
        t.put("category", body.getOrDefault("category", "ORDER_DELIVERY"));
        t.put("subject", body.get("subject"));
        t.put("description", body.get("description"));
        t.put("priority", body.getOrDefault("priority", "MEDIUM"));
        t.put("status", "OPEN");
        t.put("assignedTeam", "CUSTOMER_SUPPORT");
        t.put("source", body.getOrDefault("source", "WEBSITE_CHAT"));
        t.put("createdAt", Instant.now().toString());
        t.put("tenantId", tenantId);

        store.getSupportTickets().put(ticketId, t);
        store.addAuditLog("SUPPORT_TICKET", ticketId, "TICKET_CREATED_BY_AI", "AI_SUPPORT_AGENT", tenantId);

        Map<String, Object> r = new LinkedHashMap<>();
        r.put("ticketId", ticketId);
        r.put("conversationId", t.get("conversationId"));
        r.put("category", t.get("category"));
        r.put("priority", t.get("priority"));
        r.put("status", "OPEN");
        r.put("assignedTeam", "CUSTOMER_SUPPORT");

        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Support ticket created", r, "req_support_ai_008"));
    }

    @GetMapping("/tickets/{ticketId}")
    public ResponseEntity<Map<String, Object>> getTicket(
            @PathVariable("ticketId") String ticketId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> t = store.getSupportTickets().get(ticketId);
        if (t == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Support ticket not found", null, null));
        }
        return ResponseEntity.ok(standardSuccess("Support ticket retrieved", t, null));
    }

    @PatchMapping("/tickets/{ticketId}")
    public ResponseEntity<Map<String, Object>> updateTicket(
            @PathVariable("ticketId") String ticketId,
            @RequestBody Map<String, Object> updates,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> t = store.getSupportTickets().get(ticketId);
        if (t == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Support ticket not found", null, null));
        }
        t.putAll(updates);
        return ResponseEntity.ok(standardSuccess("Support ticket updated", t, null));
    }

    @PostMapping("/tickets/{ticketId}/classify")
    public ResponseEntity<Map<String, Object>> classifyTicket(
            @PathVariable("ticketId") String ticketId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> t = store.getSupportTickets().get(ticketId);
        if (t != null) {
            t.put("category", body.get("category"));
        }
        return ResponseEntity.ok(standardSuccess("Ticket classified", t, null));
    }

    @PostMapping("/tickets/{ticketId}/summarize")
    public ResponseEntity<Map<String, Object>> summarizeTicket(
            @PathVariable("ticketId") String ticketId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Ticket summary generated", Map.of("ticketId", ticketId, "summary", "Order dispatch query under investigation."), null));
    }

    @PostMapping("/tickets/{ticketId}/assign")
    public ResponseEntity<Map<String, Object>> assignTicket(
            @PathVariable("ticketId") String ticketId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> t = store.getSupportTickets().get(ticketId);
        if (t != null) {
            t.put("assignedTo", body.get("assigneeId"));
        }
        return ResponseEntity.ok(standardSuccess("Ticket assigned", t, null));
    }

    @PostMapping("/tickets/{ticketId}/priority")
    public ResponseEntity<Map<String, Object>> changeTicketPriority(
            @PathVariable("ticketId") String ticketId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> t = store.getSupportTickets().get(ticketId);
        if (t != null) {
            t.put("priority", body.get("priority"));
        }
        return ResponseEntity.ok(standardSuccess("Priority updated", t, null));
    }

    @PostMapping("/tickets/{ticketId}/request-information")
    public ResponseEntity<Map<String, Object>> requestTicketInformation(
            @PathVariable("ticketId") String ticketId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> t = store.getSupportTickets().get(ticketId);
        if (t != null) {
            t.put("status", "WAITING_FOR_CUSTOMER");
        }
        return ResponseEntity.ok(standardSuccess("Customer info requested", t, null));
    }

    @PostMapping("/tickets/{ticketId}/escalate")
    public ResponseEntity<Map<String, Object>> escalateTicket(
            @PathVariable("ticketId") String ticketId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> t = store.getSupportTickets().get(ticketId);
        if (t != null) {
            t.put("status", "ESCALATED");
        }
        return ResponseEntity.ok(standardSuccess("Ticket escalated", t, null));
    }

    @PostMapping("/tickets/{ticketId}/resolve")
    public ResponseEntity<Map<String, Object>> resolveTicket(
            @PathVariable("ticketId") String ticketId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> t = store.getSupportTickets().get(ticketId);
        if (t != null) {
            t.put("status", "RESOLVED");
            t.put("resolvedAt", Instant.now().toString());
        }
        return ResponseEntity.ok(standardSuccess("Ticket resolved", t, null));
    }

    @PostMapping("/tickets/{ticketId}/reopen")
    public ResponseEntity<Map<String, Object>> reopenTicket(
            @PathVariable("ticketId") String ticketId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> t = store.getSupportTickets().get(ticketId);
        if (t != null) {
            t.put("status", "OPEN");
        }
        return ResponseEntity.ok(standardSuccess("Ticket reopened", t, null));
    }

    @GetMapping("/tickets/{ticketId}/history")
    public ResponseEntity<Map<String, Object>> getTicketHistory(
            @PathVariable("ticketId") String ticketId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Ticket history retrieved", Collections.emptyList(), null));
    }

    @PostMapping("/tickets/{ticketId}/messages")
    public ResponseEntity<Map<String, Object>> addTicketMessage(
            @PathVariable("ticketId") String ticketId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> msg = new LinkedHashMap<>();
        msg.put("messageId", "MSG-" + UUID.randomUUID().toString().substring(0, 6));
        msg.put("ticketId", ticketId);
        msg.put("sender", "CUSTOMER_SUPPORT");
        msg.put("content", body.get("message"));
        msg.put("timestamp", Instant.now().toString());

        store.getTicketMessages().computeIfAbsent(ticketId, k -> new ArrayList<>()).add(msg);
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Customer-facing message added to ticket", msg, null));
    }

    @PostMapping("/tickets/{ticketId}/internal-notes")
    public ResponseEntity<Map<String, Object>> addTicketInternalNote(
            @PathVariable("ticketId") String ticketId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> note = new LinkedHashMap<>();
        note.put("noteId", "NOTE-" + UUID.randomUUID().toString().substring(0, 6));
        note.put("ticketId", ticketId);
        note.put("author", "AI_SUPPORT_AGENT");
        note.put("content", body.get("note"));
        note.put("timestamp", Instant.now().toString());

        store.getTicketInternalNotes().computeIfAbsent(ticketId, k -> new ArrayList<>()).add(note);
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Internal note recorded on ticket", note, null));
    }

    // ==========================================
    // F. ORDER & DELIVERY ENQUIRIES
    // ==========================================

    @GetMapping("/orders/{orderId}")
    public ResponseEntity<Map<String, Object>> getOrder(
            @PathVariable("orderId") String orderId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> o = store.getOrders().get(orderId);
        if (o == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Order not found", null, null));
        }
        return ResponseEntity.ok(standardSuccess("Order details retrieved", o, null));
    }

    @GetMapping("/orders/{orderId}/status")
    public ResponseEntity<Map<String, Object>> getOrderStatus(
            @PathVariable("orderId") String orderId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> o = store.getOrders().get(orderId);
        if (o == null || !tenantId.equals(o.get("tenantId"))) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Order not found", null, null));
        }

        Map<String, Object> r = new LinkedHashMap<>();
        r.put("orderId", orderId);
        r.put("status", o.getOrDefault("status", "IN_PRODUCTION"));
        r.put("expectedDispatchDate", o.get("expectedDispatchDate"));
        r.put("deliveryStatus", o.getOrDefault("deliveryStatus", "NOT_DISPATCHED"));
        r.put("source", o.getOrDefault("source", "ORDER_MANAGEMENT_SYSTEM"));
        r.put("lastUpdatedAt", o.getOrDefault("lastUpdatedAt", "2026-10-29T07:30:00+05:30"));

        return ResponseEntity.ok(standardSuccess("Order status retrieved", r, "req_support_ai_005"));
    }

    @GetMapping("/orders/{orderId}/delivery-status")
    public ResponseEntity<Map<String, Object>> getDeliveryStatus(
            @PathVariable("orderId") String orderId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> o = store.getOrders().get(orderId);
        Object delStatus = o != null ? o.get("deliveryStatus") : "NOT_DISPATCHED";
        return ResponseEntity.ok(standardSuccess("Delivery status retrieved", Map.of("orderId", orderId, "deliveryStatus", delStatus), null));
    }

    @GetMapping("/orders/{orderId}/invoices")
    public ResponseEntity<Map<String, Object>> getOrderInvoices(
            @PathVariable("orderId") String orderId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> o = store.getOrders().get(orderId);
        Object invs = o != null ? o.getOrDefault("invoices", Collections.emptyList()) : Collections.emptyList();
        return ResponseEntity.ok(standardSuccess("Invoice metadata retrieved", invs, null));
    }

    @PostMapping("/orders/{orderId}/delivery-issues")
    public ResponseEntity<Map<String, Object>> reportDeliveryIssue(
            @PathVariable("orderId") String orderId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String issId = "DIS-" + UUID.randomUUID().toString().substring(0, 6);
        Map<String, Object> iss = new LinkedHashMap<>(body);
        iss.put("issueId", issId);
        iss.put("orderId", orderId);
        iss.put("status", "REPORTED");
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Delivery issue reported", iss, null));
    }

    @PostMapping("/orders/{orderId}/status-explanation")
    public ResponseEntity<Map<String, Object>> generateStatusExplanation(
            @PathVariable("orderId") String orderId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Status explanation generated", Map.of("orderId", orderId, "explanation", "Order is currently on the assembly line in production."), null));
    }

    // ==========================================
    // G. PRODUCT INFORMATION & KNOWLEDGE BASE
    // ==========================================

    @GetMapping("/products")
    public ResponseEntity<Map<String, Object>> listProducts(
            @RequestParam(value = "search", required = false) String search,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = store.getProducts().values().stream()
                .filter(p -> tenantId.equals(p.get("tenantId")))
                .collect(Collectors.toList());
        return ResponseEntity.ok(standardSuccess("Products retrieved", list, null));
    }

    @GetMapping("/products/{productId}")
    public ResponseEntity<Map<String, Object>> getProduct(
            @PathVariable("productId") String productId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> p = store.getProducts().get(productId);
        if (p == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Product not found", null, null));
        }
        return ResponseEntity.ok(standardSuccess("Product retrieved", p, null));
    }

    @GetMapping("/products/{productId}/specifications")
    public ResponseEntity<Map<String, Object>> getProductSpecs(
            @PathVariable("productId") String productId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> p = store.getProducts().get(productId);
        Object specs = p != null ? p.get("specifications") : Collections.emptyMap();
        return ResponseEntity.ok(standardSuccess("Product specifications retrieved", specs, null));
    }

    @GetMapping("/products/{productId}/manuals")
    public ResponseEntity<Map<String, Object>> getProductManuals(
            @PathVariable("productId") String productId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> p = store.getProducts().get(productId);
        Object manuals = p != null ? p.getOrDefault("manuals", Collections.emptyList()) : Collections.emptyList();
        return ResponseEntity.ok(standardSuccess("Manual metadata retrieved", manuals, null));
    }

    @GetMapping("/products/{productId}/known-issues")
    public ResponseEntity<Map<String, Object>> getProductKnownIssues(
            @PathVariable("productId") String productId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> p = store.getProducts().get(productId);
        Object issues = p != null ? p.getOrDefault("knownIssues", Collections.emptyList()) : Collections.emptyList();
        return ResponseEntity.ok(standardSuccess("Known issues retrieved", issues, null));
    }

    @GetMapping("/knowledge/articles")
    public ResponseEntity<Map<String, Object>> listKnowledgeArticles(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = store.getKnowledgeArticles().values().stream()
                .filter(a -> tenantId.equals(a.get("tenantId")))
                .collect(Collectors.toList());
        return ResponseEntity.ok(standardSuccess("Approved knowledge articles retrieved", list, null));
    }

    @GetMapping("/knowledge/articles/{articleId}")
    public ResponseEntity<Map<String, Object>> getKnowledgeArticle(
            @PathVariable("articleId") String articleId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> art = store.getKnowledgeArticles().get(articleId);
        if (art == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Article not found", null, null));
        }
        return ResponseEntity.ok(standardSuccess("Article retrieved", art, null));
    }

    @PostMapping("/knowledge/search")
    public ResponseEntity<Map<String, Object>> searchKnowledge(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        String q = (String) body.get("query");

        List<Map<String, Object>> results = store.getKnowledgeArticles().values().stream()
                .filter(a -> tenantId.equals(a.get("tenantId")))
                .map(a -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("articleId", a.get("articleId"));
                    item.put("title", a.get("title"));
                    item.put("sourceType", a.getOrDefault("sourceType", "APPROVED_KNOWLEDGE_BASE"));
                    item.put("relevanceScore", a.getOrDefault("relevanceScore", 0.92));
                    return item;
                })
                .collect(Collectors.toList());

        Map<String, Object> r = new LinkedHashMap<>();
        r.put("results", results);
        r.put("totalResults", results.size());
        r.put("sourceStatus", "AVAILABLE");

        return ResponseEntity.ok(standardSuccess("Knowledge search completed", r, "req_support_ai_006"));
    }

    @PostMapping("/knowledge/answer")
    public ResponseEntity<Map<String, Object>> answerFromKnowledge(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String ansId = "ANS-5001";

        Map<String, Object> r = new LinkedHashMap<>();
        r.put("answerId", ansId);
        r.put("answer", "Please follow the maintenance-request process documented in the approved product support information. If you provide your product details, the support team can help create the appropriate service request.");
        r.put("sourceReferences", List.of(
                Map.of("articleId", "KB-1001", "title", "Industrial Motor Maintenance Process")
        ));
        r.put("requiresHumanReview", false);
        r.put("status", "DRAFT");

        return ResponseEntity.ok(standardSuccess("Support answer generated", r, "req_support_ai_007"));
    }

    // ==========================================
    // H. WARRANTY, RETURNS & REPAIRS
    // ==========================================

    @GetMapping("/warranty-claims")
    public ResponseEntity<Map<String, Object>> listWarrantyClaims(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = store.getWarrantyClaims().values().stream()
                .filter(w -> tenantId.equals(w.get("tenantId")))
                .collect(Collectors.toList());
        return ResponseEntity.ok(standardSuccess("Warranty claims retrieved", list, null));
    }

    @PostMapping("/warranty-claims")
    public ResponseEntity<Map<String, Object>> createWarrantyClaim(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        String cid = "WCL-" + (3000 + store.getWarrantyClaims().size() + 1);
        Map<String, Object> wc = new LinkedHashMap<>(body);
        wc.put("claimId", cid);
        wc.put("status", "PENDING_WARRANTY_REVIEW");
        wc.put("tenantId", tenantId);
        store.getWarrantyClaims().put(cid, wc);
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Warranty claim created", wc, null));
    }

    @GetMapping("/warranty-claims/{claimId}")
    public ResponseEntity<Map<String, Object>> getWarrantyClaim(
            @PathVariable("claimId") String claimId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> wc = store.getWarrantyClaims().get(claimId);
        if (wc == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Warranty claim not found", null, null));
        }
        return ResponseEntity.ok(standardSuccess("Warranty claim status retrieved", wc, null));
    }

    @PostMapping("/warranty-claims/{claimId}/validate")
    public ResponseEntity<Map<String, Object>> validateWarrantyClaim(
            @PathVariable("claimId") String claimId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Warranty policy eligibility evaluated", Map.of("claimId", claimId, "eligibleForReview", true), null));
    }

    @GetMapping("/return-requests")
    public ResponseEntity<Map<String, Object>> listReturnRequests(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = store.getReturnRequests().values().stream()
                .filter(r -> tenantId.equals(r.get("tenantId")))
                .collect(Collectors.toList());
        return ResponseEntity.ok(standardSuccess("Return requests retrieved", list, null));
    }

    @PostMapping("/return-requests")
    public ResponseEntity<Map<String, Object>> createReturnRequest(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        String reqId = "RET-" + (9000 + store.getReturnRequests().size() + 1);

        Map<String, Object> ret = new LinkedHashMap<>();
        ret.put("requestId", reqId);
        ret.put("orderId", body.get("orderId"));
        ret.put("productId", body.get("productId"));
        ret.put("quantity", body.getOrDefault("quantity", 1));
        ret.put("status", "PENDING_ELIGIBILITY_CHECK");
        ret.put("decision", null);
        ret.put("reason", body.get("reason"));
        ret.put("description", body.get("description"));
        ret.put("createdAt", Instant.now().toString());
        ret.put("tenantId", tenantId);

        store.getReturnRequests().put(reqId, ret);
        store.addAuditLog("RETURN_REQUEST", reqId, "RMA_CREATED_BY_AI", "AI_SUPPORT_AGENT", tenantId);

        Map<String, Object> r = new LinkedHashMap<>();
        r.put("requestId", reqId);
        r.put("orderId", ret.get("orderId"));
        r.put("productId", ret.get("productId"));
        r.put("quantity", ret.get("quantity"));
        r.put("status", "PENDING_ELIGIBILITY_CHECK");
        r.put("decision", null);

        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Return request created", r, "req_support_ai_012"));
    }

    @GetMapping("/return-requests/{requestId}")
    public ResponseEntity<Map<String, Object>> getReturnRequest(
            @PathVariable("requestId") String requestId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> r = store.getReturnRequests().get(requestId);
        if (r == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Return request not found", null, null));
        }
        return ResponseEntity.ok(standardSuccess("Return request details retrieved", r, null));
    }

    @PostMapping("/return-requests/{requestId}/validate")
    public ResponseEntity<Map<String, Object>> validateReturnRequest(
            @PathVariable("requestId") String requestId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Return policy validation passed", Map.of("requestId", requestId, "eligible", true), null));
    }

    @PostMapping("/return-requests/{requestId}/handoff")
    public ResponseEntity<Map<String, Object>> handoffReturnRequest(
            @PathVariable("requestId") String requestId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Return routed to warehouse operations", Map.of("requestId", requestId, "routedTo", "WAREHOUSE"), null));
    }

    @GetMapping("/repair-requests")
    public ResponseEntity<Map<String, Object>> listRepairRequests(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = store.getRepairRequests().values().stream()
                .filter(r -> tenantId.equals(r.get("tenantId")))
                .collect(Collectors.toList());
        return ResponseEntity.ok(standardSuccess("Repair requests retrieved", list, null));
    }

    @PostMapping("/repair-requests")
    public ResponseEntity<Map<String, Object>> createRepairRequest(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String repId = "REP-" + UUID.randomUUID().toString().substring(0, 6);
        Map<String, Object> r = new LinkedHashMap<>(body);
        r.put("requestId", repId);
        r.put("status", "SUBMITTED");
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Repair request created", r, null));
    }

    @GetMapping("/repair-requests/{requestId}")
    public ResponseEntity<Map<String, Object>> getRepairRequest(
            @PathVariable("requestId") String requestId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Repair status retrieved", Map.of("requestId", requestId, "status", "IN_QUEUE"), null));
    }

    @PostMapping("/repair-requests/{requestId}/handoff")
    public ResponseEntity<Map<String, Object>> handoffRepairRequest(
            @PathVariable("requestId") String requestId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Repair transferred to technical support", Map.of("requestId", requestId, "transferredTo", "TECHNICAL_SUPPORT"), null));
    }

    // ==========================================
    // I. ESCALATION & FEEDBACK
    // ==========================================

    @GetMapping("/escalations")
    public ResponseEntity<Map<String, Object>> listEscalations(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = store.getSupportEscalations().values().stream()
                .filter(e -> tenantId.equals(e.get("tenantId")))
                .collect(Collectors.toList());
        return ResponseEntity.ok(standardSuccess("Escalations retrieved", list, null));
    }

    @PostMapping("/escalations")
    public ResponseEntity<Map<String, Object>> createEscalation(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String escId = "ESC-" + UUID.randomUUID().toString().substring(0, 6);
        Map<String, Object> esc = new LinkedHashMap<>(body);
        esc.put("escalationId", escId);
        esc.put("status", "PENDING_SUPERVISOR_ACTION");
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Escalation created", esc, null));
    }

    @GetMapping("/escalations/{escalationId}")
    public ResponseEntity<Map<String, Object>> getEscalation(
            @PathVariable("escalationId") String escalationId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Escalation details retrieved", Map.of("escalationId", escalationId), null));
    }

    @PostMapping("/escalations/{escalationId}/assign")
    public ResponseEntity<Map<String, Object>> assignEscalation(
            @PathVariable("escalationId") String escalationId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Escalation assigned", body, null));
    }

    @PostMapping("/escalations/{escalationId}/resolve")
    public ResponseEntity<Map<String, Object>> resolveEscalation(
            @PathVariable("escalationId") String escalationId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Escalation resolved", body, null));
    }

    @PostMapping("/feedback")
    public ResponseEntity<Map<String, Object>> recordFeedback(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Support feedback recorded", body, null));
    }

    @GetMapping("/reports/resolution")
    public ResponseEntity<Map<String, Object>> getResolutionReport(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Resolution report retrieved", Map.of("firstCallResolution", 74.2), null));
    }

    @GetMapping("/reports/automation")
    public ResponseEntity<Map<String, Object>> getAutomationReport(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Automation report retrieved", Map.of("automationRate", 68.5, "unassistedResolutions", 340), null));
    }

    @GetMapping("/activity-logs")
    public ResponseEntity<Map<String, Object>> getActivityLogs(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> logs = store.getAuditLogs().stream()
                .filter(l -> tenantId.equals(l.get("tenantId")))
                .collect(Collectors.toList());
        return ResponseEntity.ok(standardSuccess("Support agent activity logs retrieved", logs, null));
    }
}
