package com.zenelait.crm.hotel;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/v1/hotel/customer-support")
@CrossOrigin(origins = "*")
public class HotelCustomerSupportV1Controller {

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
        resp.put("requestId", reqId != null ? reqId : "req_" + UUID.randomUUID().toString().substring(0, 8));
        return resp;
    }

    // A. Dashboard & Conversations
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Customer support dashboard retrieved",
                store.getCustomerSupportDashboard(tenantId), "req_support_dashboard_001"));
    }

    @GetMapping("/conversations")
    public ResponseEntity<Map<String, Object>> getConversations(
            @RequestParam(required = false) String status,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = store.getConversations(tenantId, status);
        return ResponseEntity.ok(standardResponse(true, "Conversations retrieved", list, "req_conv_list_001"));
    }

    @PostMapping("/conversations")
    public ResponseEntity<Map<String, Object>> createConversation(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> conv = store.createConversation(tenantId, body);
        return ResponseEntity.ok(standardResponse(true, "Conversation created", conv, "req_conv_create_001"));
    }

    @GetMapping("/conversations/{conversationId}")
    public ResponseEntity<Map<String, Object>> getConversation(
            @PathVariable String conversationId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> conv = store.getConversation(tenantId, conversationId);
        if (conv == null) {
            return ResponseEntity.status(404).body(standardResponse(false, "Conversation not found", null, "req_err_404"));
        }
        return ResponseEntity.ok(standardResponse(true, "Conversation details retrieved", conv, "req_conv_get_001"));
    }

    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<Map<String, Object>> getConversationMessages(
            @PathVariable String conversationId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> msgs = store.getConversationMessages(tenantId, conversationId);
        return ResponseEntity.ok(standardResponse(true, "Conversation messages retrieved", msgs, "req_conv_msgs_001"));
    }

    @PostMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<Map<String, Object>> addConversationMessage(
            @PathVariable String conversationId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> msg = store.addConversationMessage(tenantId, conversationId, body);
        return ResponseEntity.ok(standardResponse(true, "Message sent to conversation", msg, "req_conv_msg_send_001"));
    }

    @PostMapping("/conversations/{conversationId}/summarize")
    public ResponseEntity<Map<String, Object>> summarizeConversation(
            @PathVariable String conversationId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> summary = store.summarizeConversation(tenantId, conversationId);
        return ResponseEntity.ok(standardResponse(true, "Conversation summary generated", summary, "req_conv_summary_001"));
    }

    @PostMapping("/conversations/{conversationId}/handoff")
    public ResponseEntity<Map<String, Object>> handoffConversation(
            @PathVariable String conversationId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> handoff = store.handoffConversation(tenantId, conversationId, body);
        return ResponseEntity.ok(standardResponse(true, "Conversation handed off successfully", handoff, "req_conv_handoff_001"));
    }

    @PostMapping("/conversations/{conversationId}/close")
    public ResponseEntity<Map<String, Object>> closeConversation(
            @PathVariable String conversationId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> closed = store.closeConversation(tenantId, conversationId);
        return ResponseEntity.ok(standardResponse(true, "Conversation closed", closed, "req_conv_close_001"));
    }

    // B. Ticket Management
    @GetMapping("/tickets")
    public ResponseEntity<Map<String, Object>> getTickets(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> paged = store.getTickets(tenantId, status, category, page, size);
        return ResponseEntity.ok(standardResponse(true, "Tickets retrieved", paged, "req_tickets_001"));
    }

    @PostMapping("/tickets")
    public ResponseEntity<Map<String, Object>> createTicket(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> ticket = store.createTicket(tenantId, body);
        return ResponseEntity.ok(standardResponse(true, "Support ticket created", ticket, "req_ticket_create_001"));
    }

    @GetMapping("/tickets/{ticketId}")
    public ResponseEntity<Map<String, Object>> getTicket(
            @PathVariable String ticketId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> ticket = store.getTicket(tenantId, ticketId);
        if (ticket == null) {
            return ResponseEntity.status(404).body(standardResponse(false, "Ticket not found", null, "req_err_404"));
        }
        return ResponseEntity.ok(standardResponse(true, "Ticket retrieved", ticket, "req_ticket_details_001"));
    }

    @PatchMapping("/tickets/{ticketId}")
    public ResponseEntity<Map<String, Object>> updateTicket(
            @PathVariable String ticketId,
            @RequestBody Map<String, Object> updates,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> ticket = store.updateTicket(tenantId, ticketId, updates);
        return ResponseEntity.ok(standardResponse(true, "Ticket updated", ticket, "req_ticket_patch_001"));
    }

    @PostMapping("/tickets/{ticketId}/assign")
    public ResponseEntity<Map<String, Object>> assignTicket(
            @PathVariable String ticketId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> assigned = store.assignTicket(tenantId, ticketId, body);
        return ResponseEntity.ok(standardResponse(true, "Ticket assigned", assigned, "req_ticket_assign_001"));
    }

    @PostMapping("/tickets/{ticketId}/messages")
    public ResponseEntity<Map<String, Object>> addTicketCustomerMessage(
            @PathVariable String ticketId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> msg = store.addTicketCustomerMessage(tenantId, ticketId, body);
        return ResponseEntity.ok(standardResponse(true, "Customer reply added", msg, "req_ticket_msg_001"));
    }

    @PostMapping("/tickets/{ticketId}/notes")
    public ResponseEntity<Map<String, Object>> addTicketInternalNote(
            @PathVariable String ticketId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> note = store.addTicketInternalNote(tenantId, ticketId, body);
        return ResponseEntity.ok(standardResponse(true, "Internal note created", note, "req_ticket_note_001"));
    }

    @PostMapping("/tickets/{ticketId}/classify")
    public ResponseEntity<Map<String, Object>> classifyTicket(
            @PathVariable String ticketId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> classification = store.classifyTicket(tenantId, ticketId);
        return ResponseEntity.ok(standardResponse(true, "Ticket category and priority suggested", classification, "req_ticket_classify_001"));
    }

    @PostMapping("/tickets/{ticketId}/reply-drafts")
    public ResponseEntity<Map<String, Object>> createReplyDraft(
            @PathVariable String ticketId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> draft = store.createTicketReplyDraft(tenantId, ticketId, body);
        return ResponseEntity.ok(standardResponse(true, "Reply draft generated", draft, "req_support_draft_001"));
    }

    @PostMapping("/tickets/{ticketId}/reply-drafts/{draftId}/approve")
    public ResponseEntity<Map<String, Object>> approveReplyDraft(
            @PathVariable String ticketId,
            @PathVariable String draftId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> approved = store.approveReplyDraft(tenantId, ticketId, draftId);
        return ResponseEntity.ok(standardResponse(true, "Reply draft approved", approved, "req_draft_approve_001"));
    }

    @PostMapping("/tickets/{ticketId}/reply-drafts/{draftId}/send")
    public ResponseEntity<Map<String, Object>> sendReplyDraft(
            @PathVariable String ticketId,
            @PathVariable String draftId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> sent = store.sendReplyDraft(tenantId, ticketId, draftId);
        return ResponseEntity.ok(standardResponse(true, "Approved reply sent to guest", sent, "req_draft_send_001"));
    }

    @PostMapping("/tickets/{ticketId}/escalate")
    public ResponseEntity<Map<String, Object>> escalateTicket(
            @PathVariable String ticketId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> esc = store.escalateTicket(tenantId, ticketId, body);
        return ResponseEntity.ok(standardResponse(true, "Ticket escalated", esc, "req_ticket_escalation_001"));
    }

    @PostMapping("/tickets/{ticketId}/resolve")
    public ResponseEntity<Map<String, Object>> resolveTicket(
            @PathVariable String ticketId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> res = store.resolveTicket(tenantId, ticketId, body);
        return ResponseEntity.ok(standardResponse(true, "Ticket resolved", res, "req_ticket_resolve_001"));
    }

    @PostMapping("/tickets/{ticketId}/reopen")
    public ResponseEntity<Map<String, Object>> reopenTicket(
            @PathVariable String ticketId,
            @RequestBody(required = false) Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> reopened = store.reopenTicket(tenantId, ticketId, body);
        return ResponseEntity.ok(standardResponse(true, "Ticket reopened", reopened, "req_ticket_reopen_001"));
    }

    // C. Guest Service Requests
    @GetMapping("/service-requests")
    public ResponseEntity<Map<String, Object>> getServiceRequests(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = store.getServiceRequests(tenantId, status, category);
        return ResponseEntity.ok(standardResponse(true, "Service requests retrieved", list, "req_service_list_001"));
    }

    @PostMapping("/service-requests")
    public ResponseEntity<Map<String, Object>> createServiceRequest(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> req = store.createServiceRequest(tenantId, body);
        return ResponseEntity.ok(standardResponse(true, "Service request created", req, "req_service_create_001"));
    }

    @GetMapping("/service-requests/{requestId}")
    public ResponseEntity<Map<String, Object>> getServiceRequest(
            @PathVariable String requestId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> req = store.getServiceRequest(tenantId, requestId);
        if (req == null) {
            return ResponseEntity.status(404).body(standardResponse(false, "Service request not found", null, "req_err_404"));
        }
        return ResponseEntity.ok(standardResponse(true, "Service request retrieved", req, "req_service_get_001"));
    }

    @PatchMapping("/service-requests/{requestId}")
    public ResponseEntity<Map<String, Object>> updateServiceRequest(
            @PathVariable String requestId,
            @RequestBody Map<String, Object> updates,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> req = store.updateServiceRequest(tenantId, requestId, updates);
        return ResponseEntity.ok(standardResponse(true, "Service request updated", req, "req_service_patch_001"));
    }

    @PostMapping("/service-requests/{requestId}/assign")
    public ResponseEntity<Map<String, Object>> assignServiceRequest(
            @PathVariable String requestId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> req = store.assignServiceRequest(tenantId, requestId, body);
        return ResponseEntity.ok(standardResponse(true, "Service request assigned", req, "req_service_assign_001"));
    }

    @PostMapping("/service-requests/{requestId}/escalate")
    public ResponseEntity<Map<String, Object>> escalateServiceRequest(
            @PathVariable String requestId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> req = store.escalateServiceRequest(tenantId, requestId, body);
        return ResponseEntity.ok(standardResponse(true, "Service request escalated", req, "req_service_esc_001"));
    }

    @PostMapping("/service-requests/{requestId}/resolve")
    public ResponseEntity<Map<String, Object>> resolveServiceRequest(
            @PathVariable String requestId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> req = store.resolveServiceRequest(tenantId, requestId, body);
        return ResponseEntity.ok(standardResponse(true, "Service request resolved", req, "req_service_resolve_001"));
    }

    // D. Knowledge & AI Assistance
    @GetMapping("/knowledge/articles")
    public ResponseEntity<Map<String, Object>> getKnowledgeArticles(
            @RequestParam(required = false) String query,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = store.getKnowledgeArticles(tenantId, query);
        return ResponseEntity.ok(standardResponse(true, "Published knowledge articles retrieved", list, "req_kb_list_001"));
    }

    @GetMapping("/knowledge/articles/{articleId}")
    public ResponseEntity<Map<String, Object>> getKnowledgeArticle(
            @PathVariable String articleId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> art = store.getKnowledgeArticle(tenantId, articleId);
        if (art == null) {
            return ResponseEntity.status(404).body(standardResponse(false, "Article not found", null, "req_err_404"));
        }
        return ResponseEntity.ok(standardResponse(true, "Article details retrieved", art, "req_kb_get_001"));
    }

    @PostMapping("/knowledge/search")
    public ResponseEntity<Map<String, Object>> searchKnowledge(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        String q = (String) body.getOrDefault("query", "");
        List<Map<String, Object>> results = store.getKnowledgeArticles(tenantId, q);
        return ResponseEntity.ok(standardResponse(true, "Knowledge search completed", results, "req_kb_search_001"));
    }

    @PostMapping("/knowledge/answer")
    public ResponseEntity<Map<String, Object>> answerWithKnowledge(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> ans = store.generateGroundedAnswer(tenantId, body);
        return ResponseEntity.ok(standardResponse(true, "Grounded answer generated", ans, "req_kb_ans_001"));
    }

    @PostMapping("/ai/summaries")
    public ResponseEntity<Map<String, Object>> generateAiSummary(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        String convId = (String) body.get("conversationId");
        Map<String, Object> sum = store.summarizeConversation(tenantId, convId);
        return ResponseEntity.ok(standardResponse(true, "AI summary generated", sum, "req_ai_sum_001"));
    }

    @PostMapping("/ai/reply-drafts")
    public ResponseEntity<Map<String, Object>> generateGeneralReplyDraft(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> draft = store.generateGeneralReplyDraft(tenantId, body);
        return ResponseEntity.ok(standardResponse(true, "General reply draft generated", draft, "req_ai_reply_001"));
    }

    // E. Escalations, Feedback & Metrics
    @GetMapping("/escalations")
    public ResponseEntity<Map<String, Object>> getEscalations(
            @RequestParam(required = false) String status,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = store.getSupportEscalations(tenantId, status);
        return ResponseEntity.ok(standardResponse(true, "Escalation list retrieved", list, "req_esc_list_001"));
    }

    @GetMapping("/escalations/{escalationId}")
    public ResponseEntity<Map<String, Object>> getEscalation(
            @PathVariable String escalationId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> esc = store.getSupportEscalation(tenantId, escalationId);
        if (esc == null) {
            return ResponseEntity.status(404).body(standardResponse(false, "Escalation not found", null, "req_err_404"));
        }
        return ResponseEntity.ok(standardResponse(true, "Escalation details retrieved", esc, "req_esc_get_001"));
    }

    @PostMapping("/escalations/{escalationId}/assign")
    public ResponseEntity<Map<String, Object>> assignEscalation(
            @PathVariable String escalationId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> esc = store.assignSupportEscalation(tenantId, escalationId, body);
        return ResponseEntity.ok(standardResponse(true, "Escalation assigned", esc, "req_esc_assign_001"));
    }

    @PostMapping("/escalations/{escalationId}/resolve")
    public ResponseEntity<Map<String, Object>> resolveEscalation(
            @PathVariable String escalationId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> esc = store.resolveSupportEscalation(tenantId, escalationId, body);
        return ResponseEntity.ok(standardResponse(true, "Escalation resolved", esc, "req_esc_resolve_001"));
    }

    @PostMapping("/feedback")
    public ResponseEntity<Map<String, Object>> recordFeedback(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> feedback = store.recordGuestFeedback(tenantId, body);
        return ResponseEntity.ok(standardResponse(true, "Feedback recorded", feedback, "req_feedback_001"));
    }

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getMetrics(
            @RequestParam(defaultValue = "LAST_30_DAYS") String period,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> metrics = store.getCustomerSupportMetrics(tenantId, period);
        return ResponseEntity.ok(standardResponse(true, "Support performance metrics retrieved", metrics, "req_metrics_001"));
    }

    @GetMapping("/activity-logs")
    public ResponseEntity<Map<String, Object>> getActivityLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> logs = store.getAuditEvents(tenantId);
        Map<String, Object> paged = new LinkedHashMap<>();
        paged.put("items", logs);
        paged.put("page", page);
        paged.put("size", size);
        paged.put("totalElements", logs.size());
        return ResponseEntity.ok(standardResponse(true, "Support activity logs retrieved", paged, "req_act_001"));
    }
}
