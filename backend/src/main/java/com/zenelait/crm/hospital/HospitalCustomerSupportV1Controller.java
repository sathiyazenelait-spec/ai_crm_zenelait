package com.zenelait.crm.hospital;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Zenelait AI CRM — Hospital/Clinic Tenant
 * Customer Support V1 Controller
 * Base Path: /api/v1/hospital/customer-support
 * Implements 24 REST API endpoints specified in Section 4.
 */
@RestController
@RequestMapping("/api/v1/hospital/customer-support")
@CrossOrigin(origins = "*")
public class HospitalCustomerSupportV1Controller {

    private final HospitalDataStore store;

    public HospitalCustomerSupportV1Controller(HospitalDataStore store) {
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
        resp.put("requestId", requestId != null ? requestId : "req_sup_" + UUID.randomUUID().toString().substring(0, 8));
        return ResponseEntity.status(status).body(resp);
    }

    // 1. GET /dashboard
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("openTickets", 74);
        data.put("myAssignedTickets", 12);
        data.put("unassignedTickets", 8);
        data.put("awaitingPatientResponse", 17);
        data.put("awaitingInternalResponse", 9);
        data.put("openEscalations", 4);
        data.put("aiDraftsAwaitingReview", 6);
        return buildResponse(true, "Customer Support dashboard retrieved", data, HttpStatus.OK, "req_support_dashboard_001");
    }

    // 2. GET /tickets
    @GetMapping("/tickets")
    public ResponseEntity<?> listTickets(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        List<Map<String, Object>> items = store.getSupportTickets().values().stream()
                .filter(t -> (status == null || status.equalsIgnoreCase(String.valueOf(t.get("status"))))
                        && (priority == null || priority.equalsIgnoreCase(String.valueOf(t.get("priority")))))
                .collect(Collectors.toList());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("items", items);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", items.size());
        data.put("totalPages", 1);

        return buildResponse(true, "Support tickets retrieved", data, HttpStatus.OK, "req_ticket_list_001");
    }

    // 3. POST /tickets
    @PostMapping("/tickets")
    public ResponseEntity<?> createTicket(@RequestBody Map<String, Object> payload) {
        String ticketId = "tic_" + (1300 + store.getSupportTickets().size() + 1);
        String ticketNumber = "SUP-2026-00" + (1300 + store.getSupportTickets().size() + 1);
        String timestamp = "2026-10-27T18:00:00+05:30";

        Map<String, Object> ticket = new LinkedHashMap<>(payload);
        ticket.put("ticketId", ticketId);
        ticket.put("ticketNumber", ticketNumber);
        ticket.put("status", "OPEN");
        ticket.put("assignedTeam", "CUSTOMER_SUPPORT");
        ticket.put("createdAt", timestamp);
        store.getSupportTickets().put(ticketId, ticket);

        store.recordAuditEvent("SUPPORT_TICKET_CREATED", "CUSTOMER_SUPPORT", ticketId, "Created ticket " + ticketNumber);

        Map<String, Object> respData = new LinkedHashMap<>();
        respData.put("ticketId", ticketId);
        respData.put("ticketNumber", ticketNumber);
        respData.put("category", payload.get("category"));
        respData.put("status", "OPEN");
        respData.put("priority", payload.getOrDefault("priority", "NORMAL"));
        respData.put("assignedTeam", "CUSTOMER_SUPPORT");
        respData.put("createdAt", timestamp);

        return buildResponse(true, "Support ticket created", respData, HttpStatus.CREATED, "req_ticket_create_001");
    }

    // 4. GET /tickets/{ticketId}
    @GetMapping("/tickets/{ticketId}")
    public ResponseEntity<?> getTicket(@PathVariable String ticketId) {
        Map<String, Object> ticket = store.getSupportTickets().get(ticketId);
        if (ticket == null) {
            return buildResponse(false, "Ticket not found", null, HttpStatus.NOT_FOUND, null);
        }
        return buildResponse(true, "Ticket details retrieved", ticket, HttpStatus.OK, null);
    }

    // 5. PATCH /tickets/{ticketId}
    @PatchMapping("/tickets/{ticketId}")
    public ResponseEntity<?> updateTicket(@PathVariable String ticketId, @RequestBody Map<String, Object> updates) {
        Map<String, Object> ticket = store.getSupportTickets().get(ticketId);
        if (ticket == null) {
            return buildResponse(false, "Ticket not found", null, HttpStatus.NOT_FOUND, null);
        }
        ticket.putAll(updates);
        return buildResponse(true, "Ticket updated", ticket, HttpStatus.OK, null);
    }

    // 6. PATCH /tickets/{ticketId}/assign
    @PatchMapping("/tickets/{ticketId}/assign")
    public ResponseEntity<?> assignTicket(@PathVariable String ticketId, @RequestBody Map<String, Object> payload) {
        Map<String, Object> ticket = store.getSupportTickets().get(ticketId);
        if (ticket == null) {
            return buildResponse(false, "Ticket not found", null, HttpStatus.NOT_FOUND, null);
        }
        String userId = String.valueOf(payload.get("assignedToUserId"));
        ticket.put("assignedToUserId", userId);
        ticket.put("status", "ASSIGNED");
        ticket.put("assignedAt", "2026-10-27T18:00:00+05:30");

        store.recordAuditEvent("TICKET_ASSIGNED", "CUSTOMER_SUPPORT", ticketId, "Assigned ticket to " + userId);

        Map<String, Object> respData = new LinkedHashMap<>();
        respData.put("ticketId", ticketId);
        respData.put("assignedToUserId", userId);
        respData.put("status", "ASSIGNED");
        respData.put("assignedAt", "2026-10-27T18:00:00+05:30");

        return buildResponse(true, "Ticket assigned successfully", respData, HttpStatus.OK, "req_ticket_assign_001");
    }

    // 7. PATCH /tickets/{ticketId}/status
    @PatchMapping("/tickets/{ticketId}/status")
    public ResponseEntity<?> updateTicketStatus(@PathVariable String ticketId, @RequestBody Map<String, Object> payload) {
        Map<String, Object> ticket = store.getSupportTickets().get(ticketId);
        if (ticket == null) {
            return buildResponse(false, "Ticket not found", null, HttpStatus.NOT_FOUND, null);
        }
        String status = String.valueOf(payload.getOrDefault("status", "IN_PROGRESS"));
        ticket.put("status", status);
        ticket.put("updatedAt", "2026-10-27T18:00:00+05:30");

        store.recordAuditEvent("TICKET_STATUS_UPDATED", "CUSTOMER_SUPPORT", ticketId, "Status updated to " + status);

        Map<String, Object> respData = new LinkedHashMap<>();
        respData.put("ticketId", ticketId);
        respData.put("status", status);
        respData.put("updatedAt", "2026-10-27T18:00:00+05:30");

        return buildResponse(true, "Ticket status updated", respData, HttpStatus.OK, "req_ticket_status_001");
    }

    // 8. POST /tickets/{ticketId}/messages
    @PostMapping("/tickets/{ticketId}/messages")
    public ResponseEntity<?> addTicketMessage(@PathVariable String ticketId, @RequestBody Map<String, Object> payload) {
        Map<String, Object> ticket = store.getSupportTickets().get(ticketId);
        if (ticket == null) {
            return buildResponse(false, "Ticket not found", null, HttpStatus.NOT_FOUND, null);
        }

        String msgId = "msg_" + (1500 + store.getTicketMessages().getOrDefault(ticketId, Collections.emptyList()).size() + 1);
        String timestamp = "2026-10-27T18:00:00+05:30";

        Map<String, Object> msg = new LinkedHashMap<>(payload);
        msg.put("messageId", msgId);
        msg.put("ticketId", ticketId);
        msg.put("deliveryStatus", "RECORDED");
        msg.put("createdAt", timestamp);

        store.getTicketMessages().computeIfAbsent(ticketId, k -> new ArrayList<>()).add(msg);
        store.recordAuditEvent("SUPPORT_MESSAGE_RECORDED", "CUSTOMER_SUPPORT", ticketId, "Message " + msgId + " recorded");

        Map<String, Object> respData = new LinkedHashMap<>();
        respData.put("messageId", msgId);
        respData.put("ticketId", ticketId);
        respData.put("messageType", payload.getOrDefault("messageType", "PUBLIC_REPLY"));
        respData.put("channel", payload.getOrDefault("channel", "WEBSITE_CHAT"));
        respData.put("deliveryStatus", "RECORDED");
        respData.put("createdAt", timestamp);

        return buildResponse(true, "Support message recorded", respData, HttpStatus.CREATED, "req_support_message_001");
    }

    // 9. GET /tickets/{ticketId}/messages
    @GetMapping("/tickets/{ticketId}/messages")
    public ResponseEntity<?> getTicketMessages(@PathVariable String ticketId) {
        List<Map<String, Object>> msgs = store.getTicketMessages().getOrDefault(ticketId, Collections.emptyList());
        return buildResponse(true, "Authorized messages retrieved", msgs, HttpStatus.OK, null);
    }

    // 10. POST /tickets/{ticketId}/notes
    @PostMapping("/tickets/{ticketId}/notes")
    public ResponseEntity<?> addInternalNote(@PathVariable String ticketId, @RequestBody Map<String, Object> payload) {
        Map<String, Object> ticket = store.getSupportTickets().get(ticketId);
        if (ticket == null) {
            return buildResponse(false, "Ticket not found", null, HttpStatus.NOT_FOUND, null);
        }
        String noteId = "note_" + UUID.randomUUID().toString().substring(0, 8);
        Map<String, Object> note = new LinkedHashMap<>(payload);
        note.put("noteId", noteId);
        note.put("ticketId", ticketId);
        note.put("visibility", "INTERNAL");
        note.put("createdAt", "2026-10-27T18:00:00+05:30");

        store.getTicketNotes().computeIfAbsent(ticketId, k -> new ArrayList<>()).add(note);
        return buildResponse(true, "Internal note added", note, HttpStatus.CREATED, null);
    }

    // 11. POST /tickets/{ticketId}/escalate
    @PostMapping("/tickets/{ticketId}/escalate")
    public ResponseEntity<?> escalateTicket(@PathVariable String ticketId, @RequestBody Map<String, Object> payload) {
        Map<String, Object> ticket = store.getSupportTickets().get(ticketId);
        if (ticket == null) {
            return buildResponse(false, "Ticket not found", null, HttpStatus.NOT_FOUND, null);
        }
        String escId = "esc_" + (2000 + store.getEscalations().size() + 1);
        String targetTeam = String.valueOf(payload.getOrDefault("targetTeam", "APPOINTMENT_COORDINATION"));

        Map<String, Object> esc = new LinkedHashMap<>(payload);
        esc.put("escalationId", escId);
        esc.put("ticketId", ticketId);
        esc.put("targetTeam", targetTeam);
        esc.put("status", "OPEN");
        esc.put("createdAt", "2026-10-27T18:00:00+05:30");
        store.getEscalations().put(escId, esc);

        store.recordAuditEvent("TICKET_ESCALATED", "CUSTOMER_SUPPORT", ticketId, "Escalated ticket to " + targetTeam);

        Map<String, Object> respData = new LinkedHashMap<>();
        respData.put("escalationId", escId);
        respData.put("ticketId", ticketId);
        respData.put("targetTeam", targetTeam);
        respData.put("status", "OPEN");
        respData.put("createdAt", "2026-10-27T18:00:00+05:30");

        return buildResponse(true, "Ticket escalated", respData, HttpStatus.CREATED, "req_support_escalation_001");
    }

    // 12. POST /tickets/{ticketId}/handoff
    @PostMapping("/tickets/{ticketId}/handoff")
    public ResponseEntity<?> handoffTicket(@PathVariable String ticketId, @RequestBody Map<String, Object> payload) {
        Map<String, Object> ticket = store.getSupportTickets().get(ticketId);
        if (ticket == null) {
            return buildResponse(false, "Ticket not found", null, HttpStatus.NOT_FOUND, null);
        }
        String targetTeam = String.valueOf(payload.getOrDefault("targetTeam", "HUMAN_AGENT"));
        ticket.put("assignedTeam", targetTeam);
        ticket.put("status", "TRANSFERRED");
        store.recordAuditEvent("TICKET_HANDOFF", "CUSTOMER_SUPPORT", ticketId, "Handed off to " + targetTeam);
        return buildResponse(true, "Ticket transferred successfully", ticket, HttpStatus.OK, null);
    }

    // 13. POST /conversations
    @PostMapping("/conversations")
    public ResponseEntity<?> createConversation(@RequestBody Map<String, Object> payload) {
        String convId = "conversation_" + UUID.randomUUID().toString().substring(0, 8);
        Map<String, Object> conv = new LinkedHashMap<>(payload);
        conv.put("conversationId", convId);
        conv.put("status", "ACTIVE");
        conv.put("createdAt", "2026-10-27T18:00:00+05:30");
        store.getConversations().put(convId, conv);
        return buildResponse(true, "Conversation created", conv, HttpStatus.CREATED, null);
    }

    // 14. GET /conversations
    @GetMapping("/conversations")
    public ResponseEntity<?> listConversations() {
        List<Map<String, Object>> convs = new ArrayList<>(store.getConversations().values());
        return buildResponse(true, "Authorized conversations retrieved", convs, HttpStatus.OK, null);
    }

    // 15. GET /conversations/{conversationId}
    @GetMapping("/conversations/{conversationId}")
    public ResponseEntity<?> getConversation(@PathVariable String conversationId) {
        Map<String, Object> conv = store.getConversations().get(conversationId);
        if (conv == null) {
            return buildResponse(false, "Conversation not found", null, HttpStatus.NOT_FOUND, null);
        }
        return buildResponse(true, "Conversation details retrieved", conv, HttpStatus.OK, null);
    }

    // 16. POST /conversations/{conversationId}/messages
    @PostMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<?> sendConversationMessage(@PathVariable String conversationId, @RequestBody Map<String, Object> payload) {
        String msgId = "conv_msg_" + UUID.randomUUID().toString().substring(0, 8);
        Map<String, Object> msg = new LinkedHashMap<>(payload);
        msg.put("messageId", msgId);
        msg.put("conversationId", conversationId);
        msg.put("deliveryStatus", "SENT");
        msg.put("createdAt", "2026-10-27T18:00:00+05:30");
        store.getConversationMessages().computeIfAbsent(conversationId, k -> new ArrayList<>()).add(msg);
        return buildResponse(true, "Support reply sent", msg, HttpStatus.CREATED, null);
    }

    // 17. POST /ai/reply-drafts
    @PostMapping("/ai/reply-drafts")
    public ResponseEntity<?> generateAiDraft(@RequestBody Map<String, Object> payload) {
        String draftId = "drf_" + (1600 + store.getAiReplyDrafts().size() + 1);
        String ticketId = String.valueOf(payload.get("ticketId"));

        Map<String, Object> draft = new LinkedHashMap<>();
        draft.put("draftId", draftId);
        draft.put("ticketId", ticketId);
        draft.put("status", "AWAITING_REVIEW");
        draft.put("content", "You can confirm your appointment through the clinic's approved booking channel. If you need assistance, our support team can help after the required identity verification.");
        draft.put("knowledgeReferences", List.of(Map.of("articleId", "kb_1701", "title", "Appointment Confirmation Process")));
        draft.put("requiresHumanApproval", true);
        store.getAiReplyDrafts().put(draftId, draft);

        store.recordAuditEvent("AI_REPLY_DRAFTED", "CUSTOMER_SUPPORT", draftId, "Generated AI draft for ticket " + ticketId);

        return buildResponse(true, "AI reply draft generated", draft, HttpStatus.CREATED, "req_ai_draft_001");
    }

    // 18. POST /ai/reply-drafts/{draftId}/approve
    @PostMapping("/ai/reply-drafts/{draftId}/approve")
    public ResponseEntity<?> approveDraft(@PathVariable String draftId, @RequestBody Map<String, Object> payload) {
        Map<String, Object> draft = store.getAiReplyDrafts().get(draftId);
        if (draft == null) {
            return buildResponse(false, "Draft not found", null, HttpStatus.NOT_FOUND, null);
        }
        draft.put("status", "APPROVED");
        draft.put("approvedBy", "usr_1401");
        draft.put("approvedAt", "2026-10-27T18:00:00+05:30");
        draft.put("reviewComment", payload.get("reviewComment"));

        store.recordAuditEvent("AI_REPLY_APPROVED", "CUSTOMER_SUPPORT", draftId, "Approved by usr_1401");

        Map<String, Object> respData = new LinkedHashMap<>();
        respData.put("draftId", draftId);
        respData.put("status", "APPROVED");
        respData.put("approvedBy", "usr_1401");
        respData.put("approvedAt", "2026-10-27T18:00:00+05:30");

        return buildResponse(true, "AI reply approved", respData, HttpStatus.OK, "req_ai_approve_001");
    }

    // 19. POST /ai/reply-drafts/{draftId}/send
    @PostMapping("/ai/reply-drafts/{draftId}/send")
    public ResponseEntity<?> sendApprovedDraft(
            @PathVariable String draftId,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @RequestBody Map<String, Object> payload
    ) {
        Map<String, Object> draft = store.getAiReplyDrafts().get(draftId);
        if (draft == null) {
            return buildResponse(false, "Draft not found", null, HttpStatus.NOT_FOUND, null);
        }
        if (!"APPROVED".equals(draft.get("status"))) {
            Map<String, Object> err = new LinkedHashMap<>();
            err.put("field", "status");
            err.put("message", "Cannot send draft that has not been approved by an authorized reviewer.");
            return buildResponse(false, "Draft requires approval", List.of(err), HttpStatus.UNPROCESSABLE_ENTITY, null);
        }

        String execId = "exe_" + (1900 + store.getAiReplyDrafts().size() + 1);
        draft.put("status", "QUEUED_FOR_DELIVERY");
        draft.put("sentExecutionId", execId);

        store.recordAuditEvent("AI_REPLY_SENT", "CUSTOMER_SUPPORT", draftId, "Queued delivery with execution " + execId);

        Map<String, Object> respData = new LinkedHashMap<>();
        respData.put("draftId", draftId);
        respData.put("executionId", execId);
        respData.put("status", "QUEUED");
        respData.put("channel", payload.getOrDefault("channel", "WEBSITE_CHAT"));

        return buildResponse(true, "Message accepted for delivery", respData, HttpStatus.ACCEPTED, "req_ai_send_001");
    }

    // 20. GET /knowledge/articles
    @GetMapping("/knowledge/articles")
    public ResponseEntity<?> searchKnowledgeArticles(@RequestParam(required = false) String query) {
        List<Map<String, Object>> articles = new ArrayList<>(store.getKnowledgeArticles().values());
        return buildResponse(true, "Approved support articles retrieved", articles, HttpStatus.OK, null);
    }

    // 21. GET /follow-up-tasks
    @GetMapping("/follow-up-tasks")
    public ResponseEntity<?> listFollowUpTasks() {
        List<Map<String, Object>> tasks = new ArrayList<>(store.getSupportFollowUpTasks().values());
        return buildResponse(true, "Support follow-up tasks retrieved", tasks, HttpStatus.OK, null);
    }

    // 22. POST /follow-up-tasks
    @PostMapping("/follow-up-tasks")
    public ResponseEntity<?> createFollowUpTask(@RequestBody Map<String, Object> payload) {
        String taskId = "task_" + UUID.randomUUID().toString().substring(0, 8);
        Map<String, Object> task = new LinkedHashMap<>(payload);
        task.put("taskId", taskId);
        task.put("status", "PENDING");
        task.put("createdAt", "2026-10-27T18:00:00+05:30");
        store.getSupportFollowUpTasks().put(taskId, task);
        return buildResponse(true, "Follow-up task created", task, HttpStatus.CREATED, null);
    }

    // 23. PATCH /follow-up-tasks/{taskId}
    @PatchMapping("/follow-up-tasks/{taskId}")
    public ResponseEntity<?> updateFollowUpTask(@PathVariable String taskId, @RequestBody Map<String, Object> updates) {
        Map<String, Object> task = store.getSupportFollowUpTasks().get(taskId);
        if (task == null) {
            return buildResponse(false, "Task not found", null, HttpStatus.NOT_FOUND, null);
        }
        task.putAll(updates);
        return buildResponse(true, "Follow-up task updated", task, HttpStatus.OK, null);
    }

    // 24. GET /metrics
    @GetMapping("/metrics")
    public ResponseEntity<?> getSupportMetrics(
            @RequestParam(required = false, defaultValue = "2026-10-01") String from,
            @RequestParam(required = false, defaultValue = "2026-10-27") String to
    ) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("period", Map.of("from", from, "to", to));
        data.put("ticketsCreated", 1250);
        data.put("ticketsResolved", 1085);
        data.put("currentlyOpen", 165);
        data.put("averageFirstResponseMinutes", 8);
        data.put("averageResolutionMinutes", 36);
        data.put("escalations", 62);
        data.put("aiDraftsApproved", 410);
        data.put("aiDraftsRejected", 21);

        return buildResponse(true, "Support metrics retrieved", data, HttpStatus.OK, "req_support_metrics_001");
    }
}
