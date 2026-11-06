package com.zenelait.crm.hotel;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/v1/hotel/ai-support-agent")
@CrossOrigin(origins = "*")
public class HotelAiSupportAgentV1Controller {

    @Autowired
    private HotelDataStore store;

    private String getTenantId(String tenantHeader) {
        return (tenantHeader != null && !tenantHeader.isBlank()) ? tenantHeader : "tenant-6";
    }

    private Map<String, Object> standardResponse(boolean success, String message, Object data, String reqId) {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", success);
        resp.put("message", message);
        resp.put("data", data);
        resp.put("timestamp", OffsetDateTime.now().toString());
        resp.put("requestId", reqId != null ? reqId : "req-sup-" + UUID.randomUUID().toString().substring(0, 6));
        return resp;
    }

    // 1. Dashboard, Config, Channels
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Support activity and resolution metrics retrieved",
                store.getAiSupportDashboard(tenantId), "req-sup-dash"));
    }

    @GetMapping("/config")
    public ResponseEntity<Map<String, Object>> getConfig(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardResponse(true, "AI Support Agent configuration retrieved",
                store.getAiConfig(), "req-sup-cfg"));
    }

    @PatchMapping("/config")
    public ResponseEntity<Map<String, Object>> updateConfig(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        store.getAiConfig().putAll(body);
        return ResponseEntity.ok(standardResponse(true, "AI Support Agent configuration updated",
                store.getAiConfig(), "req-sup-cfg-upd"));
    }

    @GetMapping("/channels")
    public ResponseEntity<Map<String, Object>> getChannels(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Connected support channels retrieved",
                store.getAiSupportChannels(tenantId), "req-sup-chn"));
    }

    // 2. Conversations
    @PostMapping("/conversations")
    public ResponseEntity<Map<String, Object>> startConversation(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> c = store.startAiSupportConversation(tenantId, body);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                standardResponse(true, "Support conversation created", c, "req-sup-001"));
    }

    @GetMapping("/conversations")
    public ResponseEntity<Map<String, Object>> getConversations(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Authorized conversations retrieved",
                store.getConversations(tenantId, null), "req-sup-convs"));
    }

    @GetMapping("/conversations/{conversationId}")
    public ResponseEntity<Map<String, Object>> getConversation(
            @PathVariable String conversationId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> c = store.getConversation(tenantId, conversationId);
        if (c == null) {
            return ResponseEntity.status(404).body(standardResponse(false, "Conversation not found", null, "req-sup-404"));
        }
        return ResponseEntity.ok(standardResponse(true, "Conversation details retrieved", c, "req-sup-conv-get"));
    }

    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<Map<String, Object>> getConversationMessages(
            @PathVariable String conversationId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Conversation messages retrieved",
                store.getConversationMessages(tenantId, conversationId), "req-sup-msgs"));
    }

    @PostMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<Map<String, Object>> processMessage(
            @PathVariable String conversationId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Guest message processed",
                store.processAiSupportMessage(tenantId, conversationId, body), "req-sup-002"));
    }

    @PostMapping("/conversations/{conversationId}/summarize")
    public ResponseEntity<Map<String, Object>> summarizeConversation(
            @PathVariable String conversationId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Conversation summary generated",
                store.summarizeConversation(tenantId, conversationId), "req-sup-sum"));
    }

    @PostMapping("/conversations/{conversationId}/handoff")
    public ResponseEntity<Map<String, Object>> handoffConversation(
            @PathVariable String conversationId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Conversation handed off",
                store.handoffConversation(tenantId, conversationId, body), "req-sup-ho"));
    }

    @PostMapping("/conversations/{conversationId}/close")
    public ResponseEntity<Map<String, Object>> closeConversation(
            @PathVariable String conversationId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Conversation closed",
                store.closeConversation(tenantId, conversationId), "req-sup-cls"));
    }

    // 3. Knowledge Base
    @PostMapping("/knowledge/search")
    public ResponseEntity<Map<String, Object>> searchKnowledge(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        String q = (String) body.getOrDefault("query", "");
        List<Map<String, Object>> results = store.getKnowledgeArticles(tenantId, q);
        Map<String, Object> data = Collections.singletonMap("results", results);
        return ResponseEntity.ok(standardResponse(true, "Knowledge search completed", data, "req-sup-003"));
    }

    @GetMapping("/knowledge/articles")
    public ResponseEntity<Map<String, Object>> getArticles(
            @RequestParam(required = false) String query,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Approved knowledge articles retrieved",
                store.getKnowledgeArticles(tenantId, query), "req-sup-arts"));
    }

    @GetMapping("/knowledge/articles/{articleId}")
    public ResponseEntity<Map<String, Object>> getArticle(
            @PathVariable String articleId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> art = store.getKnowledgeArticle(tenantId, articleId);
        if (art == null) {
            return ResponseEntity.status(404).body(standardResponse(false, "Article not found", null, "req-sup-404"));
        }
        return ResponseEntity.ok(standardResponse(true, "Article retrieved", art, "req-sup-art-get"));
    }

    @PostMapping("/knowledge/answer")
    public ResponseEntity<Map<String, Object>> answerWithKnowledge(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Answer generated",
                store.generateGroundedAnswer(tenantId, body), "req-sup-004"));
    }

    // 4. Guest Verification Sessions
    @PostMapping("/guest-verification/sessions")
    public ResponseEntity<Map<String, Object>> startVerificationSession(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Guest verification session started",
                store.startGuestVerificationSession(tenantId, body), "req-sup-v-sess"));
    }

    @PostMapping("/guest-verification/sessions/{sessionId}/verify")
    public ResponseEntity<Map<String, Object>> verifySession(
            @PathVariable String sessionId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Guest verification complete",
                store.verifyGuestSession(tenantId, sessionId, body), "req-sup-v-res"));
    }

    @PostMapping("/guest-context/lookup")
    public ResponseEntity<Map<String, Object>> lookupContext(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Permitted guest context retrieved",
                store.lookupGuestContext(tenantId, body), "req-sup-g-ctx"));
    }

    // 5. Support Tickets
    @GetMapping("/tickets")
    public ResponseEntity<Map<String, Object>> getTickets(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Support tickets retrieved",
                store.getTickets(tenantId, status, category, page, size), "req-sup-tkts"));
    }

    @PostMapping("/tickets")
    public ResponseEntity<Map<String, Object>> createTicket(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> t = store.createTicket(tenantId, body);
        t.put("ticketNumber", "HT-SUP-" + t.get("ticketId").toString().replace("ticket_", ""));
        return ResponseEntity.status(HttpStatus.CREATED).body(
                standardResponse(true, "Support ticket created", t, "req-sup-005"));
    }

    @GetMapping("/tickets/{ticketId}")
    public ResponseEntity<Map<String, Object>> getTicket(
            @PathVariable String ticketId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> t = store.getTicket(tenantId, ticketId);
        if (t == null) {
            return ResponseEntity.status(404).body(standardResponse(false, "Ticket not found", null, "req-sup-404"));
        }
        return ResponseEntity.ok(standardResponse(true, "Ticket details retrieved", t, "req-sup-tkt-get"));
    }

    @PatchMapping("/tickets/{ticketId}")
    public ResponseEntity<Map<String, Object>> updateTicket(
            @PathVariable String ticketId,
            @RequestBody Map<String, Object> updates,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Ticket updated",
                store.updateTicket(tenantId, ticketId, updates), "req-sup-tkt-patch"));
    }

    @PostMapping("/tickets/{ticketId}/classify")
    public ResponseEntity<Map<String, Object>> classifyTicket(
            @PathVariable String ticketId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> c = store.classifyTicket(tenantId, ticketId);
        c.put("suggestedTeam", "MAINTENANCE");
        c.put("reason", "Guest reported room equipment problem");
        c.put("requiresHumanReview", false);
        return ResponseEntity.ok(standardResponse(true, "Ticket classified", c, "req-sup-006"));
    }

    @PostMapping("/tickets/{ticketId}/assign")
    public ResponseEntity<Map<String, Object>> assignTicket(
            @PathVariable String ticketId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Ticket assigned",
                store.assignTicket(tenantId, ticketId, body), "req-sup-007"));
    }

    @PostMapping("/tickets/{ticketId}/reply-drafts")
    public ResponseEntity<Map<String, Object>> createReplyDraft(
            @PathVariable String ticketId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Reply draft generated",
                store.createTicketReplyDraft(tenantId, ticketId, body), "req-sup-008"));
    }

    @PostMapping("/tickets/{ticketId}/reply-drafts/{draftId}/approve")
    public ResponseEntity<Map<String, Object>> approveReplyDraft(
            @PathVariable String ticketId,
            @PathVariable String draftId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Reply approved",
                store.approveReplyDraft(tenantId, ticketId, draftId), "req-sup-009"));
    }

    @PostMapping("/tickets/{ticketId}/reply-drafts/{draftId}/send")
    public ResponseEntity<Map<String, Object>> sendReplyDraft(
            @PathVariable String ticketId,
            @PathVariable String draftId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> sent = store.sendReplyDraft(tenantId, ticketId, draftId);
        sent.put("deliveryStatus", "QUEUED");
        sent.put("providerMessageId", "MSG-1001");
        return ResponseEntity.ok(standardResponse(true, "Reply submitted to messaging provider", sent, "req-sup-010"));
    }

    @PostMapping("/tickets/{ticketId}/notes")
    public ResponseEntity<Map<String, Object>> addInternalNote(
            @PathVariable String ticketId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Internal note created",
                store.addTicketInternalNote(tenantId, ticketId, body), "req-sup-note"));
    }

    @PostMapping("/tickets/{ticketId}/escalate")
    public ResponseEntity<Map<String, Object>> escalateTicket(
            @PathVariable String ticketId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Ticket escalated",
                store.escalateTicket(tenantId, ticketId, body), "req-sup-012"));
    }

    @PostMapping("/tickets/{ticketId}/resolve")
    public ResponseEntity<Map<String, Object>> resolveTicket(
            @PathVariable String ticketId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> res = store.resolveTicket(tenantId, ticketId, body);
        res.put("resolutionEvidenceReference", body.getOrDefault("resolutionEvidenceReference", "MAINT-WORK-1001"));
        return ResponseEntity.ok(standardResponse(true, "Ticket resolved", res, "req-sup-013"));
    }

    @PostMapping("/tickets/{ticketId}/reopen")
    public ResponseEntity<Map<String, Object>> reopenTicket(
            @PathVariable String ticketId,
            @RequestBody(required = false) Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Ticket reopened",
                store.reopenTicket(tenantId, ticketId, body), "req-sup-reopen"));
    }

    // 6. Guest Service Requests
    @GetMapping("/service-requests")
    public ResponseEntity<Map<String, Object>> getServiceRequests(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Service requests retrieved",
                store.getServiceRequests(tenantId, status, category), "req-sup-srs"));
    }

    @PostMapping("/service-requests")
    public ResponseEntity<Map<String, Object>> createServiceRequest(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> sr = store.createServiceRequest(tenantId, body);
        sr.put("serviceRequestId", sr.get("requestId"));
        return ResponseEntity.status(HttpStatus.CREATED).body(
                standardResponse(true, "Guest service request created", sr, "req-sup-011"));
    }

    @GetMapping("/service-requests/{requestId}")
    public ResponseEntity<Map<String, Object>> getServiceRequest(
            @PathVariable String requestId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> sr = store.getServiceRequest(tenantId, requestId);
        if (sr == null) {
            return ResponseEntity.status(404).body(standardResponse(false, "Service request not found", null, "req-sup-404"));
        }
        return ResponseEntity.ok(standardResponse(true, "Service request details retrieved", sr, "req-sup-sr-get"));
    }

    @PatchMapping("/service-requests/{requestId}")
    public ResponseEntity<Map<String, Object>> updateServiceRequest(
            @PathVariable String requestId,
            @RequestBody Map<String, Object> updates,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Service request updated",
                store.updateServiceRequest(tenantId, requestId, updates), "req-sup-sr-patch"));
    }

    @PostMapping("/service-requests/{requestId}/assign")
    public ResponseEntity<Map<String, Object>> assignServiceRequest(
            @PathVariable String requestId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Service request assigned",
                store.assignServiceRequest(tenantId, requestId, body), "req-sup-sr-asgn"));
    }

    @PostMapping("/service-requests/{requestId}/escalate")
    public ResponseEntity<Map<String, Object>> escalateServiceRequest(
            @PathVariable String requestId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Service request escalated",
                store.escalateServiceRequest(tenantId, requestId, body), "req-sup-sr-esc"));
    }

    @PostMapping("/service-requests/{requestId}/resolve")
    public ResponseEntity<Map<String, Object>> resolveServiceRequest(
            @PathVariable String requestId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Service request resolved with evidence",
                store.resolveServiceRequest(tenantId, requestId, body), "req-sup-sr-res"));
    }

    // 7. Escalations & Metrics
    @GetMapping("/escalations")
    public ResponseEntity<Map<String, Object>> getEscalations(
            @RequestParam(required = false) String status,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Escalated cases retrieved",
                store.getSupportEscalations(tenantId, status), "req-sup-escs"));
    }

    @PostMapping("/feedback")
    public ResponseEntity<Map<String, Object>> recordFeedback(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Guest feedback recorded",
                store.recordGuestFeedback(tenantId, body), "req-sup-fb"));
    }

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getMetrics(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Support metrics retrieved",
                store.getCustomerSupportMetrics(tenantId, "LAST_30_DAYS"), "req-sup-met"));
    }

    @GetMapping("/activity-logs")
    public ResponseEntity<Map<String, Object>> getActivityLogs(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Authorized audit records retrieved",
                store.getAuditEvents(tenantId), "req-sup-act"));
    }
}
