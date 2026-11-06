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
 * Support Agent V1 Controller
 * Base Path: /api/v1/ecommerce/support-agent
 * Implements 24 REST API endpoints specified in Section 4.2.
 */
@RestController
@RequestMapping("/api/v1/ecommerce/support-agent")
@CrossOrigin(origins = "*")
public class EcommerceSupportAgentV1Controller {

    private final EcommerceDataStore store;

    public EcommerceSupportAgentV1Controller(EcommerceDataStore store) {
        this.store = store;
    }

    private <T> ResponseEntity<Map<String, Object>> buildResponse(boolean success, String message, T data, HttpStatus status, String requestId) {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", success);
        resp.put("message", message);
        if (data != null) {
            resp.put("data", data);
        }
        resp.put("timestamp", "2026-10-28T12:00:00+05:30");
        resp.put("requestId", requestId != null ? requestId : "req_sa_" + UUID.randomUUID().toString().substring(0, 8));
        return ResponseEntity.status(status).body(resp);
    }

    // 1. GET /dashboard
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("myOpenTickets", 18);
        data.put("myUrgentTickets", 3);
        data.put("awaitingMyReply", 6);
        data.put("awaitingCustomerResponse", 5);
        data.put("followUpsDueToday", 4);
        data.put("resolvedToday", 12);
        data.put("aiDraftsAwaitingReview", 2);

        return buildResponse(true, "Support Agent dashboard retrieved", data, HttpStatus.OK, "req_support_agent_dashboard_001");
    }

    // 2. GET /tickets
    @GetMapping("/tickets")
    public ResponseEntity<?> listTickets(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        List<Map<String, Object>> list = new ArrayList<>(store.getSupportTickets().values());
        if (status != null && !status.isEmpty()) {
            list = list.stream().filter(t -> status.equalsIgnoreCase(String.valueOf(t.get("status")))).collect(Collectors.toList());
        }

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", list);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", list.size());
        data.put("totalPages", 1);

        return buildResponse(true, "Support tickets retrieved", data, HttpStatus.OK, "req_support_agent_tickets_001");
    }

    // 3. GET /tickets/{ticketId}
    @GetMapping("/tickets/{ticketId}")
    public ResponseEntity<?> getTicket(@PathVariable String ticketId) {
        Map<String, Object> ticket = store.getSupportTickets().get(ticketId);
        if (ticket == null) {
            return buildResponse(false, "Ticket not found: " + ticketId, null, HttpStatus.NOT_FOUND, "req_ticket_not_found");
        }
        Map<String, Object> detail = new LinkedHashMap<>(ticket);
        detail.put("messages", store.getTicketMessages().getOrDefault(ticketId, Collections.emptyList()));
        detail.put("internalNotes", store.getTicketNotes().getOrDefault(ticketId, Collections.emptyList()));

        return buildResponse(true, "Ticket details retrieved", detail, HttpStatus.OK, "req_agent_ticket_detail_001");
    }

    // 4. POST /tickets
    @PostMapping("/tickets")
    public ResponseEntity<?> createTicket(@RequestBody Map<String, Object> body) {
        String ticketId = "ticket_" + (store.getSupportTickets().size() + 2001);
        String ticketNumber = "SUP-" + (store.getSupportTickets().size() + 2001);
        String subject = String.valueOf(body.getOrDefault("subject", "Customer Enquiry"));
        String category = String.valueOf(body.getOrDefault("category", "GENERAL"));
        String priority = String.valueOf(body.getOrDefault("priority", "NORMAL"));

        Map<String, Object> ticket = new LinkedHashMap<>(body);
        ticket.put("ticketId", ticketId);
        ticket.put("ticketNumber", ticketNumber);
        ticket.put("subject", subject);
        ticket.put("category", category);
        ticket.put("priority", priority);
        ticket.put("status", "OPEN");
        ticket.put("assignedAgentId", "usr_support_101");
        ticket.put("assignedToMe", true);
        ticket.put("createdAt", "2026-10-28T12:05:00+05:30");

        store.getSupportTickets().put(ticketId, ticket);
        store.recordAuditEvent("SUPPORT_TICKET_CREATED", "SUPPORT_AGENT", ticketId, "Created ticket " + ticketNumber);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("ticketId", ticketId);
        data.put("ticketNumber", ticketNumber);
        data.put("status", "OPEN");
        data.put("priority", priority);
        data.put("assignedToMe", true);
        data.put("createdAt", "2026-10-28T12:05:00+05:30");

        return buildResponse(true, "Support ticket created", data, HttpStatus.CREATED, "req_support_agent_create_001");
    }

    // 5. PATCH /tickets/{ticketId}/claim
    @PatchMapping("/tickets/{ticketId}/claim")
    public ResponseEntity<?> claimTicket(@PathVariable String ticketId, @RequestBody(required = false) Map<String, Object> body) {
        Map<String, Object> ticket = store.getSupportTickets().get(ticketId);
        if (ticket == null) {
            return buildResponse(false, "Ticket not found: " + ticketId, null, HttpStatus.NOT_FOUND, "req_claim_not_found");
        }
        // Conflict check if already assigned to someone else
        Object currentAssignee = ticket.get("assignedAgentId");
        if (currentAssignee != null && !"usr_support_101".equals(currentAssignee) && !currentAssignee.toString().isEmpty()) {
            return buildResponse(false, "Ticket is already claimed by agent: " + currentAssignee, null, HttpStatus.CONFLICT, "req_claim_conflict_001");
        }

        ticket.put("assignedAgentId", "usr_support_101");
        ticket.put("assignedToMe", true);
        ticket.put("assignedAt", "2026-10-28T12:07:00+05:30");
        store.recordAuditEvent("TICKET_CLAIMED", "SUPPORT_AGENT", ticketId, "Claimed ticket by usr_support_101");

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("ticketId", ticketId);
        data.put("assignedAgentId", "usr_support_101");
        data.put("status", ticket.get("status"));
        data.put("assignedAt", "2026-10-28T12:07:00+05:30");

        return buildResponse(true, "Ticket claimed successfully", data, HttpStatus.OK, "req_support_agent_claim_001");
    }

    // 6. PATCH /tickets/{ticketId}/status
    @PatchMapping("/tickets/{ticketId}/status")
    public ResponseEntity<?> updateStatus(@PathVariable String ticketId, @RequestBody Map<String, Object> body) {
        Map<String, Object> ticket = store.getSupportTickets().get(ticketId);
        if (ticket == null) {
            return buildResponse(false, "Ticket not found: " + ticketId, null, HttpStatus.NOT_FOUND, "req_status_err");
        }
        String status = String.valueOf(body.get("status"));
        ticket.put("status", status);
        store.recordAuditEvent("TICKET_STATUS_UPDATED", "SUPPORT_AGENT", ticketId, "Agent updated status to " + status);

        return buildResponse(true, "Ticket status updated", ticket, HttpStatus.OK, "req_agent_ticket_status_001");
    }

    // 7. POST /tickets/{ticketId}/messages
    @PostMapping("/tickets/{ticketId}/messages")
    public ResponseEntity<?> sendMessage(
            @PathVariable String ticketId,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @RequestBody Map<String, Object> body
    ) {
        Map<String, Object> ticket = store.getSupportTickets().get(ticketId);
        if (ticket == null) {
            return buildResponse(false, "Ticket not found: " + ticketId, null, HttpStatus.NOT_FOUND, "req_msg_not_found");
        }
        String messageId = "msg_" + UUID.randomUUID().toString().substring(0, 8);
        Map<String, Object> message = new LinkedHashMap<>();
        message.put("messageId", messageId);
        message.put("ticketId", ticketId);
        message.put("senderType", "SUPPORT_AGENT");
        message.put("messageType", body.getOrDefault("messageType", "PUBLIC_REPLY"));
        message.put("channel", body.getOrDefault("channel", "EMAIL"));
        message.put("content", body.get("content"));
        message.put("deliveryStatus", "QUEUED");
        message.put("createdAt", "2026-10-28T12:12:00+05:30");

        store.getTicketMessages().computeIfAbsent(ticketId, k -> new ArrayList<>()).add(message);
        store.recordAuditEvent("SUPPORT_MESSAGE_QUEUED", "SUPPORT_AGENT", messageId, "Queued public reply to customer for ticket " + ticketId);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("messageId", messageId);
        data.put("ticketId", ticketId);
        data.put("deliveryStatus", "QUEUED");
        data.put("createdAt", "2026-10-28T12:12:00+05:30");

        return buildResponse(true, "Customer reply queued", data, HttpStatus.ACCEPTED, "req_support_agent_message_001");
    }

    // 8. POST /tickets/{ticketId}/notes
    @PostMapping("/tickets/{ticketId}/notes")
    public ResponseEntity<?> addInternalNote(@PathVariable String ticketId, @RequestBody Map<String, Object> body) {
        Map<String, Object> ticket = store.getSupportTickets().get(ticketId);
        if (ticket == null) {
            return buildResponse(false, "Ticket not found: " + ticketId, null, HttpStatus.NOT_FOUND, "req_note_not_found");
        }
        String noteId = "note_" + UUID.randomUUID().toString().substring(0, 8);
        Map<String, Object> note = new LinkedHashMap<>();
        note.put("noteId", noteId);
        note.put("ticketId", ticketId);
        note.put("visibility", "INTERNAL");
        note.put("content", body.get("content"));
        note.put("createdBy", "usr_support_101");
        note.put("createdAt", "2026-10-28T12:15:00+05:30");

        store.getTicketNotes().computeIfAbsent(ticketId, k -> new ArrayList<>()).add(note);
        store.recordAuditEvent("INTERNAL_NOTE_CREATED", "SUPPORT_AGENT", noteId, "Added internal note on ticket " + ticketId);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("noteId", noteId);
        data.put("ticketId", ticketId);
        data.put("visibility", "INTERNAL");
        data.put("createdBy", "usr_support_101");
        data.put("createdAt", "2026-10-28T12:15:00+05:30");

        return buildResponse(true, "Internal note created", data, HttpStatus.OK, "req_support_agent_note_001");
    }

    // 9. GET /tickets/{ticketId}/messages
    @GetMapping("/tickets/{ticketId}/messages")
    public ResponseEntity<?> getMessages(@PathVariable String ticketId) {
        List<Map<String, Object>> messages = store.getTicketMessages().getOrDefault(ticketId, Collections.emptyList());
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", messages);
        data.put("totalElements", messages.size());

        return buildResponse(true, "Permitted conversation history retrieved", data, HttpStatus.OK, "req_agent_msgs_001");
    }

    // 10. GET /customers/{customerId}
    @GetMapping("/customers/{customerId}")
    public ResponseEntity<?> getCustomer(@PathVariable String customerId) {
        Map<String, Object> cust = store.getCustomers().get(customerId);
        if (cust == null) {
            return buildResponse(false, "Customer not found: " + customerId, null, HttpStatus.NOT_FOUND, "req_cust_not_found");
        }
        // Mask customer email & phone for privacy
        Map<String, Object> masked = new LinkedHashMap<>(cust);
        masked.put("email", "c***@example.com");
        masked.put("phone", "+91 98*** ****1");

        return buildResponse(true, "Authorized customer summary retrieved", masked, HttpStatus.OK, "req_agent_cust_001");
    }

    // 11. GET /customers/{customerId}/orders
    @GetMapping("/customers/{customerId}/orders")
    public ResponseEntity<?> getCustomerOrders(@PathVariable String customerId) {
        List<Map<String, Object>> list = store.getOrders().values().stream()
                .filter(o -> customerId.equals(o.get("customerReference")))
                .collect(Collectors.toList());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", list);
        data.put("totalElements", list.size());

        return buildResponse(true, "Customer orders retrieved", data, HttpStatus.OK, "req_cust_orders_001");
    }

    // 12. GET /orders/{orderId}
    @GetMapping("/orders/{orderId}")
    public ResponseEntity<?> getOrderSummary(@PathVariable String orderId) {
        Map<String, Object> order = store.getOrders().get(orderId);
        if (order == null) {
            return buildResponse(false, "Order not found: " + orderId, null, HttpStatus.NOT_FOUND, "req_order_not_found");
        }
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("orderId", orderId);
        data.put("orderNumber", order.get("orderNumber"));
        data.put("orderStatus", order.get("orderStatus"));
        data.put("paymentStatus", order.get("paymentStatus"));
        data.put("fulfilmentStatus", order.get("fulfilmentStatus"));
        data.put("trackingStatus", "IN_TRANSIT");
        data.put("carrier", "Example Express");
        data.put("estimatedDeliveryDate", "2026-10-29");
        data.put("currency", order.get("currency"));
        data.put("totalAmount", order.get("totalAmount"));

        return buildResponse(true, "Order summary retrieved", data, HttpStatus.OK, "req_support_agent_order_001");
    }

    // 13. POST /orders/{orderId}/return-requests
    @PostMapping("/orders/{orderId}/return-requests")
    public ResponseEntity<?> submitReturnRequest(@PathVariable String orderId, @RequestBody Map<String, Object> body) {
        Map<String, Object> order = store.getOrders().get(orderId);
        if (order == null) {
            return buildResponse(false, "Order not found: " + orderId, null, HttpStatus.NOT_FOUND, "req_order_not_found");
        }
        String retId = "return_req_" + (store.getReturnRequests().size() + 2001);
        Map<String, Object> ret = new LinkedHashMap<>(body);
        ret.put("returnRequestId", retId);
        ret.put("orderId", orderId);
        ret.put("status", "PENDING_REVIEW");
        ret.put("createdAt", "2026-10-28T12:20:00+05:30");

        store.getReturnRequests().put(retId, ret);
        store.recordAuditEvent("RETURN_REQUEST_SUBMITTED", "SUPPORT_AGENT", retId, "Submitted return request for " + orderId);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("returnRequestId", retId);
        data.put("orderId", orderId);
        data.put("status", "PENDING_REVIEW");
        data.put("createdAt", "2026-10-28T12:20:00+05:30");

        return buildResponse(true, "Return request submitted", data, HttpStatus.CREATED, "req_support_agent_return_001");
    }

    // 14. POST /orders/{orderId}/cancellation-requests
    @PostMapping("/orders/{orderId}/cancellation-requests")
    public ResponseEntity<?> submitCancellationRequest(@PathVariable String orderId, @RequestBody Map<String, Object> body) {
        Map<String, Object> order = store.getOrders().get(orderId);
        if (order == null) {
            return buildResponse(false, "Order not found: " + orderId, null, HttpStatus.NOT_FOUND, "req_order_not_found");
        }
        String cancelId = "cancel_req_" + (store.getCancellationRequests().size() + 2001);
        Map<String, Object> cancel = new LinkedHashMap<>(body);
        cancel.put("cancellationRequestId", cancelId);
        cancel.put("orderId", orderId);
        cancel.put("status", "PENDING_REVIEW");
        cancel.put("createdAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

        store.getCancellationRequests().put(cancelId, cancel);
        store.recordAuditEvent("CANCELLATION_REQUEST_SUBMITTED", "SUPPORT_AGENT", cancelId, "Submitted cancellation request for " + orderId);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("cancellationRequestId", cancelId);
        data.put("orderId", orderId);
        data.put("status", "PENDING_REVIEW");

        return buildResponse(true, "Cancellation request submitted", data, HttpStatus.OK, "req_support_agent_cancel_001");
    }

    // 15. POST /orders/{orderId}/refund-requests
    @PostMapping("/orders/{orderId}/refund-requests")
    public ResponseEntity<?> submitRefundRequest(@PathVariable String orderId, @RequestBody Map<String, Object> body) {
        Map<String, Object> order = store.getOrders().get(orderId);
        if (order == null) {
            return buildResponse(false, "Order not found: " + orderId, null, HttpStatus.NOT_FOUND, "req_order_not_found");
        }
        String refundId = "refund_req_" + (store.getRefundRequests().size() + 2001);
        double requestedAmt = body.containsKey("requestedAmount") ? ((Number) body.get("requestedAmount")).doubleValue() : 2499.00;

        Map<String, Object> req = new LinkedHashMap<>(body);
        req.put("refundRequestId", refundId);
        req.put("orderId", orderId);
        req.put("requestedAmount", requestedAmt);
        req.put("currency", body.getOrDefault("currency", "INR"));
        req.put("status", "PENDING_REVIEW");
        req.put("createdAt", "2026-10-28T12:25:00+05:30");

        store.getRefundRequests().put(refundId, req);
        store.recordAuditEvent("REFUND_REQUEST_SUBMITTED", "SUPPORT_AGENT", refundId, "Submitted refund request for " + orderId + " (" + requestedAmt + " INR)");

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("refundRequestId", refundId);
        data.put("orderId", orderId);
        data.put("requestedAmount", requestedAmt);
        data.put("currency", body.getOrDefault("currency", "INR"));
        data.put("status", "PENDING_REVIEW");

        return buildResponse(true, "Refund request submitted for review", data, HttpStatus.OK, "req_support_agent_refund_001");
    }

    // 16. POST /tickets/{ticketId}/escalations
    @PostMapping("/tickets/{ticketId}/escalations")
    public ResponseEntity<?> escalateTicket(@PathVariable String ticketId, @RequestBody Map<String, Object> body) {
        Map<String, Object> ticket = store.getSupportTickets().get(ticketId);
        if (ticket == null) {
            return buildResponse(false, "Ticket not found: " + ticketId, null, HttpStatus.NOT_FOUND, "req_ticket_not_found");
        }
        String escId = "esc_" + (store.getSupportEscalations().size() + 2001);
        String targetTeam = String.valueOf(body.getOrDefault("targetTeam", "ORDER_OPERATIONS"));

        Map<String, Object> esc = new LinkedHashMap<>(body);
        esc.put("escalationId", escId);
        esc.put("ticketId", ticketId);
        esc.put("targetTeam", targetTeam);
        esc.put("status", "OPEN");
        esc.put("createdAt", "2026-10-28T12:30:00+05:30");

        store.getSupportEscalations().put(escId, esc);
        store.recordAuditEvent("TICKET_ESCALATED_BY_AGENT", "SUPPORT_AGENT", escId, "Agent escalated ticket " + ticketId + " to " + targetTeam);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("escalationId", escId);
        data.put("ticketId", ticketId);
        data.put("targetTeam", targetTeam);
        data.put("status", "OPEN");

        return buildResponse(true, "Ticket escalated", data, HttpStatus.OK, "req_support_agent_escalation_001");
    }

    // 17. POST /tickets/{ticketId}/handoff
    @PostMapping("/tickets/{ticketId}/handoff")
    public ResponseEntity<?> handoffTicket(@PathVariable String ticketId, @RequestBody Map<String, Object> body) {
        Map<String, Object> ticket = store.getSupportTickets().get(ticketId);
        if (ticket == null) {
            return buildResponse(false, "Ticket not found: " + ticketId, null, HttpStatus.NOT_FOUND, "req_ticket_not_found");
        }
        String toTeam = String.valueOf(body.getOrDefault("targetTeam", "TIER_2_TECHNICAL"));
        ticket.put("currentTeam", toTeam);
        ticket.put("handoffReason", body.get("reason"));
        store.recordAuditEvent("TICKET_HANDOFF", "SUPPORT_AGENT", ticketId, "Transferred ticket to " + toTeam);

        return buildResponse(true, "Ticket transferred successfully to " + toTeam, ticket, HttpStatus.OK, "req_ticket_handoff_001");
    }

    // 18. POST /tickets/{ticketId}/ai-reply-drafts
    @PostMapping("/tickets/{ticketId}/ai-reply-drafts")
    public ResponseEntity<?> generateAiDraft(@PathVariable String ticketId, @RequestBody(required = false) Map<String, Object> body) {
        Map<String, Object> ticket = store.getSupportTickets().get(ticketId);
        if (ticket == null) {
            return buildResponse(false, "Ticket not found: " + ticketId, null, HttpStatus.NOT_FOUND, "req_ticket_not_found");
        }
        String draftId = "ai_reply_" + (store.getAiReplyDrafts().size() + 2001);

        Map<String, Object> draft = new LinkedHashMap<>();
        draft.put("draftId", draftId);
        draft.put("ticketId", ticketId);
        draft.put("status", "AWAITING_REVIEW");
        draft.put("content", "Your order is currently in transit. Please check the tracking information for the latest delivery updates.");

        List<Map<String, Object>> refs = new ArrayList<>();
        refs.add(EcommerceDataStore.createMap("articleId", "kb_1001", "title", "How to track an order"));
        draft.put("knowledgeReferences", refs);
        draft.put("requiresHumanApproval", true);
        draft.put("createdAt", "2026-10-28T12:28:00+05:30");

        store.getAiReplyDrafts().put(draftId, draft);
        store.recordAuditEvent("AI_REPLY_DRAFT_GENERATED", "AI_SUPPORT", draftId, "Generated AI reply draft using kb_1001");

        return buildResponse(true, "AI reply draft generated", draft, HttpStatus.OK, "req_ai_reply_001");
    }

    // 19. POST /ai-reply-drafts/{draftId}/approve
    @PostMapping("/ai-reply-drafts/{draftId}/approve")
    public ResponseEntity<?> approveDraft(@PathVariable String draftId) {
        Map<String, Object> draft = store.getAiReplyDrafts().get(draftId);
        if (draft == null) {
            return buildResponse(false, "Draft not found: " + draftId, null, HttpStatus.NOT_FOUND, "req_draft_not_found");
        }
        draft.put("status", "APPROVED");
        draft.put("approvedBy", "usr_support_101");
        store.recordAuditEvent("AI_REPLY_DRAFT_APPROVED", "SUPPORT_AGENT", draftId, "Approved reply draft");

        return buildResponse(true, "AI reply draft approved", draft, HttpStatus.OK, "req_draft_appr_001");
    }

    // 20. POST /ai-reply-drafts/{draftId}/send
    @PostMapping("/ai-reply-drafts/{draftId}/send")
    public ResponseEntity<?> sendApprovedDraft(@PathVariable String draftId) {
        Map<String, Object> draft = store.getAiReplyDrafts().get(draftId);
        if (draft == null) {
            return buildResponse(false, "Draft not found: " + draftId, null, HttpStatus.NOT_FOUND, "req_draft_not_found");
        }
        draft.put("status", "QUEUED");
        String ticketId = String.valueOf(draft.get("ticketId"));

        // Push message to ticket messages
        Map<String, Object> message = new LinkedHashMap<>();
        message.put("messageId", "msg_" + UUID.randomUUID().toString().substring(0, 8));
        message.put("ticketId", ticketId);
        message.put("senderType", "SUPPORT_AGENT");
        message.put("content", draft.get("content"));
        message.put("deliveryStatus", "QUEUED");
        message.put("createdAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

        store.getTicketMessages().computeIfAbsent(ticketId, k -> new ArrayList<>()).add(message);
        store.recordAuditEvent("AI_REPLY_SENT", "SUPPORT_AGENT", draftId, "Dispatched approved reply to customer for ticket " + ticketId);

        return buildResponse(true, "Approved reply queued for sending", draft, HttpStatus.ACCEPTED, "req_ai_draft_send_001");
    }

    // 21. GET /knowledge/articles
    @GetMapping("/knowledge/articles")
    public ResponseEntity<?> getPublishedKnowledge(@RequestParam(required = false) String query) {
        List<Map<String, Object>> list = store.getKnowledgeArticles().values().stream()
                .filter(a -> "PUBLISHED".equals(a.get("status")))
                .collect(Collectors.toList());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", list);
        data.put("totalElements", list.size());

        return buildResponse(true, "Approved knowledge articles retrieved", data, HttpStatus.OK, "req_agent_kb_001");
    }

    // 22. GET /follow-up-tasks
    @GetMapping("/follow-up-tasks")
    public ResponseEntity<?> listFollowUps(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        List<Map<String, Object>> list = new ArrayList<>(store.getSupportFollowUpTasks().values());
        if (status != null && !status.isEmpty()) {
            list = list.stream().filter(f -> status.equalsIgnoreCase(String.valueOf(f.get("status")))).collect(Collectors.toList());
        }

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", list);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", list.size());
        data.put("totalPages", 1);

        return buildResponse(true, "Follow-up tasks retrieved", data, HttpStatus.OK, "req_followup_list_001");
    }

    // 23. POST /follow-up-tasks
    @PostMapping("/follow-up-tasks")
    public ResponseEntity<?> createFollowUp(@RequestBody Map<String, Object> body) {
        String taskId = "followup_" + (store.getSupportFollowUpTasks().size() + 2001);
        String ticketId = String.valueOf(body.get("ticketId"));
        String title = String.valueOf(body.getOrDefault("title", "Check carrier update"));
        String dueAt = String.valueOf(body.getOrDefault("dueAt", "2026-10-29T10:00:00+05:30"));

        Map<String, Object> task = new LinkedHashMap<>();
        task.put("taskId", taskId);
        task.put("ticketId", ticketId);
        task.put("title", title);
        task.put("status", "OPEN");
        task.put("dueAt", dueAt);
        task.put("createdAt", "2026-10-28T12:35:00+05:30");

        store.getSupportFollowUpTasks().put(taskId, task);
        store.recordAuditEvent("SUPPORT_FOLLOWUP_CREATED", "SUPPORT_AGENT", taskId, "Created follow-up for ticket " + ticketId);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("taskId", taskId);
        data.put("ticketId", ticketId);
        data.put("status", "OPEN");
        data.put("dueAt", dueAt);

        return buildResponse(true, "Follow-up task created", data, HttpStatus.OK, "req_followup_create_001");
    }

    // 24. PATCH /follow-up-tasks/{taskId}
    @PatchMapping("/follow-up-tasks/{taskId}")
    public ResponseEntity<?> updateFollowUp(@PathVariable String taskId, @RequestBody Map<String, Object> body) {
        Map<String, Object> task = store.getSupportFollowUpTasks().get(taskId);
        if (task == null) {
            return buildResponse(false, "Follow-up task not found: " + taskId, null, HttpStatus.NOT_FOUND, "req_fu_not_found");
        }
        task.putAll(body);
        store.recordAuditEvent("SUPPORT_FOLLOWUP_UPDATED", "SUPPORT_AGENT", taskId, "Updated follow-up status");

        return buildResponse(true, "Follow-up task updated", task, HttpStatus.OK, "req_fu_update_001");
    }
}
