package com.zenelait.crm.travel;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/travel/customer-support")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class TravelCustomerSupportV1Controller {

    private final TravelDataStore store;

    public TravelCustomerSupportV1Controller(TravelDataStore store) {
        this.store = store;
    }

    private <T> Map<String, Object> envelope(String message, T data, String requestId) {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", true);
        resp.put("message", message);
        resp.put("data", data);
        resp.put("requestId", requestId != null ? requestId : "req-cs-" + System.currentTimeMillis());
        return resp;
    }

    // --- Dashboard & Metrics ---
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("openTickets", store.getTicketsList().stream().filter(t -> "OPEN".equals(t.get("status"))).count());
        data.put("urgentTickets", store.getTicketsList().stream().filter(t -> "HIGH".equals(t.get("priority"))).count());
        data.put("unassignedTickets", store.getTicketsList().stream().filter(t -> t.get("assignedTeam") == null).count());
        data.put("pendingChangeRequests", store.getChangeRequestsList().size());
        data.put("pendingCancellationRequests", store.getCancellationRequestsList().size());
        data.put("overdueTickets", 2);
        data.put("averageFirstResponseMinutes", 14);
        data.put("period", "CURRENT_MONTH");
        return ResponseEntity.ok(envelope("Support dashboard retrieved", data, "req-cs-001"));
    }

    @GetMapping("/metrics")
    public ResponseEntity<?> getMetrics() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("resolutionRate", 91.5);
        data.put("csatScore", 4.7);
        data.put("totalTicketsResolved", 148);
        data.put("firstContactResolution", 78.2);
        return ResponseEntity.ok(envelope("Support metrics retrieved", data, "req-cs-met"));
    }

    @GetMapping("/activity-logs")
    public ResponseEntity<?> getActivityLogs() {
        return ResponseEntity.ok(envelope("Support audit history retrieved", store.getAuditLogs(), "req-cs-audit"));
    }

    // --- Conversations & Messaging ---
    @GetMapping("/conversations")
    public ResponseEntity<?> listConversations() {
        List<Map<String, Object>> convs = List.of(
                Map.of("conversationId", "CONV-1001", "customerId", "CUST-1001", "customerName", "Arun Kumar", "channel", "WHATSAPP", "lastMessage", "Can we change travel dates?", "unread", true),
                Map.of("conversationId", "CONV-1002", "customerId", "CUST-1002", "customerName", "Priya Sharma", "channel", "EMAIL", "lastMessage", "Received the vouchers, thank you!", "unread", false)
        );
        return ResponseEntity.ok(envelope("Authorized conversations retrieved", convs, "req-cs-convs"));
    }

    @PostMapping("/conversations")
    public ResponseEntity<?> createConversation(@RequestBody Map<String, Object> body) {
        String convId = "CONV-" + System.currentTimeMillis();
        Map<String, Object> conv = new LinkedHashMap<>(body);
        conv.put("conversationId", convId);
        conv.put("status", "ACTIVE");
        return ResponseEntity.status(HttpStatus.CREATED).body(envelope("Conversation created", conv, "req-cs-conv-new"));
    }

    @GetMapping("/conversations/{conversationId}")
    public ResponseEntity<?> getConversation(@PathVariable String conversationId) {
        Map<String, Object> conv = Map.of(
                "conversationId", conversationId,
                "customerId", "CUST-1001",
                "status", "ACTIVE",
                "channel", "WHATSAPP",
                "assignedAgent", "EMP-203"
        );
        return ResponseEntity.ok(envelope("Conversation details retrieved", conv, "req-cs-conv-get"));
    }

    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<?> getMessages(@PathVariable String conversationId) {
        List<Map<String, Object>> msgs = List.of(
                Map.of("messageId", "MSG-1", "sender", "CUSTOMER", "content", "Hi, I need to postpone my Bali trip by 1 day.", "timestamp", "2026-10-28T14:10:00+05:30"),
                Map.of("messageId", "MSG-2", "sender", "AGENT", "content", "Hello Arun! Let me check the supplier conditions for your booking.", "timestamp", "2026-10-28T14:15:00+05:30")
        );
        return ResponseEntity.ok(envelope("Message history retrieved", msgs, "req-cs-msgs"));
    }

    @PostMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<?> sendMessage(@PathVariable String conversationId, @RequestBody Map<String, Object> body) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("conversationId", conversationId);
        data.put("messageId", "MSG-" + System.currentTimeMillis());
        data.put("status", "SENT");
        data.put("content", body.get("content"));
        return ResponseEntity.ok(envelope("Message sent", data, "req-cs-msg-send"));
    }

    @PostMapping("/conversations/{conversationId}/summarize")
    public ResponseEntity<?> summarizeConversation(@PathVariable String conversationId) {
        Map<String, Object> data = Map.of(
                "conversationId", conversationId,
                "summary", "Guest Arun Kumar requested to shift Bali departure date from 2026-12-10 to 2026-12-11. Change request CHG-1001 raised with operations."
        );
        return ResponseEntity.ok(envelope("Conversation summarized", data, "req-cs-summ"));
    }

    @PostMapping("/conversations/{conversationId}/handoff")
    public ResponseEntity<?> handoffConversation(@PathVariable String conversationId, @RequestBody Map<String, Object> body) {
        Map<String, Object> data = Map.of(
                "conversationId", conversationId,
                "targetTeam", body.getOrDefault("targetTeam", "BOOKING_OPERATIONS"),
                "status", "HANDED_OFF"
        );
        return ResponseEntity.ok(envelope("Conversation handed off", data, "req-cs-handoff"));
    }

    @PostMapping("/conversations/{conversationId}/close")
    public ResponseEntity<?> closeConversation(@PathVariable String conversationId) {
        Map<String, Object> data = Map.of("conversationId", conversationId, "status", "CLOSED");
        return ResponseEntity.ok(envelope("Conversation closed", data, "req-cs-close"));
    }

    // --- Guest Verification & Context Lookup ---
    @PostMapping("/guest-verification/sessions")
    public ResponseEntity<?> startVerificationSession(@RequestBody Map<String, Object> body) {
        String sessionId = "GVER-" + System.currentTimeMillis();
        Map<String, Object> data = Map.of(
                "sessionId", sessionId,
                "status", "INITIATED",
                "challengeType", "OTP_PHONE",
                "recipient", body.getOrDefault("phone", "+919876543210")
        );
        return ResponseEntity.ok(envelope("Guest verification session initiated", data, "req-cs-ver-start"));
    }

    @PostMapping("/guest-verification/sessions/{sessionId}/verify")
    public ResponseEntity<?> verifySession(@PathVariable String sessionId, @RequestBody Map<String, Object> body) {
        Map<String, Object> data = Map.of(
                "sessionId", sessionId,
                "status", "VERIFIED",
                "customerId", "CUST-1001",
                "verifiedAt", "2026-10-28T17:00:00+05:30"
        );
        return ResponseEntity.ok(envelope("Guest identity verified", data, "req-cs-ver-done"));
    }

    @PostMapping("/guest-context/lookup")
    public ResponseEntity<?> lookupGuestContext(@RequestBody Map<String, Object> body) {
        Map<String, Object> customer = store.findCustomer(String.valueOf(body.get("customerId")));
        return ResponseEntity.ok(envelope("Guest context retrieved", customer, "req-cs-lookup"));
    }

    // --- Bookings Search & Read ---
    @GetMapping("/bookings")
    public ResponseEntity<?> searchBookings(@RequestParam(required = false) String customerId) {
        List<Map<String, Object>> list = store.getBookingsList().stream()
                .filter(b -> customerId == null || customerId.equalsIgnoreCase(String.valueOf(b.get("customerId"))))
                .toList();
        return ResponseEntity.ok(envelope("Authorized bookings retrieved", list, "req-cs-bks"));
    }

    @GetMapping("/bookings/{bookingId}")
    public ResponseEntity<?> getBooking(@PathVariable String bookingId) {
        Map<String, Object> b = store.findBooking(bookingId);
        if (b == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(envelope("Booking not found", null, "req-cs-err"));
        return ResponseEntity.ok(envelope("Booking retrieved", b, "req-cs-004"));
    }

    @GetMapping("/bookings/{bookingId}/status")
    public ResponseEntity<?> getBookingStatus(@PathVariable String bookingId) {
        Map<String, Object> b = store.findBooking(bookingId);
        if (b == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(envelope("Booking not found", null, "req-cs-err"));
        Map<String, Object> data = Map.of(
                "bookingId", bookingId,
                "status", b.get("status"),
                "bookingReference", b.get("bookingReference")
        );
        return ResponseEntity.ok(envelope("Booking status retrieved", data, "req-cs-bk-status"));
    }

    @GetMapping("/bookings/{bookingId}/documents")
    public ResponseEntity<?> getBookingDocuments(@PathVariable String bookingId) {
        List<Map<String, Object>> docs = store.getVouchersList().stream()
                .filter(v -> bookingId.equalsIgnoreCase(String.valueOf(v.get("bookingId"))))
                .toList();
        return ResponseEntity.ok(envelope("Booking travel documents retrieved", docs, "req-cs-docs"));
    }

    // --- Tickets ---
    @GetMapping("/tickets")
    public ResponseEntity<?> listTickets() {
        return ResponseEntity.ok(envelope("Support tickets retrieved", store.getTicketsList(), "req-cs-t-list"));
    }

    @PostMapping("/tickets")
    public ResponseEntity<?> createTicket(@RequestBody Map<String, Object> body) {
        Map<String, Object> ticket = store.createTicket(body);
        store.recordAudit("TRAVEL_SUPPORT_TICKET_CREATED", "ticketId=" + ticket.get("ticketId"));
        return ResponseEntity.status(HttpStatus.CREATED).body(envelope("Support ticket created", ticket, "req-cs-002"));
    }

    @GetMapping("/tickets/{ticketId}")
    public ResponseEntity<?> getTicket(@PathVariable String ticketId) {
        Map<String, Object> t = store.findTicket(ticketId);
        if (t == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(envelope("Ticket not found", null, "req-cs-err"));
        return ResponseEntity.ok(envelope("Ticket details retrieved", t, "req-cs-t-get"));
    }

    @PatchMapping("/tickets/{ticketId}")
    public ResponseEntity<?> updateTicket(@PathVariable String ticketId, @RequestBody Map<String, Object> updates) {
        Map<String, Object> t = store.findTicket(ticketId);
        if (t == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(envelope("Ticket not found", null, "req-cs-err"));
        t.putAll(updates);
        return ResponseEntity.ok(envelope("Ticket updated", t, "req-cs-t-patch"));
    }

    @PostMapping("/tickets/{ticketId}/assign")
    public ResponseEntity<?> assignTicket(@PathVariable String ticketId, @RequestBody Map<String, Object> body) {
        Map<String, Object> t = store.findTicket(ticketId);
        if (t != null) {
            t.put("assignedTeam", body.get("team"));
            t.put("assignedAgent", body.get("agentId"));
        }
        return ResponseEntity.ok(envelope("Ticket assigned", t, "req-cs-t-assign"));
    }

    @PostMapping("/tickets/{ticketId}/notes")
    public ResponseEntity<?> addInternalNote(@PathVariable String ticketId, @RequestBody Map<String, Object> body) {
        Map<String, Object> note = Map.of(
                "noteId", "NOTE-" + System.currentTimeMillis(),
                "ticketId", ticketId,
                "content", body.get("content"),
                "isInternal", true,
                "timestamp", "2026-10-28T17:20:00+05:30"
        );
        return ResponseEntity.ok(envelope("Internal note added", note, "req-cs-t-note"));
    }

    @PostMapping("/tickets/{ticketId}/classify")
    public ResponseEntity<?> classifyTicket(@PathVariable String ticketId, @RequestBody(required = false) Map<String, Object> body) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("ticketId", ticketId);
        data.put("category", "ITINERARY_CHANGE");
        data.put("priority", "HIGH");
        data.put("suggestedTeam", "BOOKING_OPERATIONS");
        data.put("reason", "The customer requested a change to a travel date");
        data.put("requiresHumanReview", true);
        return ResponseEntity.ok(envelope("Ticket classified", data, "req-cs-003"));
    }

    @PostMapping("/tickets/{ticketId}/reply-drafts")
    public ResponseEntity<?> createReplyDraft(@PathVariable String ticketId, @RequestBody Map<String, Object> body) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("draftId", "CS-DRAFT-1001");
        data.put("status", "PENDING_APPROVAL");
        data.put("body", "We have recorded your request to change the travel dates. Our booking team will review the applicable supplier conditions and update you once the available options have been verified.");
        return ResponseEntity.ok(envelope("Reply draft generated", data, "req-cs-008"));
    }

    @PostMapping("/tickets/{ticketId}/reply-drafts/{draftId}/approve")
    public ResponseEntity<?> approveReplyDraft(@PathVariable String ticketId, @PathVariable String draftId) {
        Map<String, Object> data = Map.of("draftId", draftId, "status", "APPROVED");
        return ResponseEntity.ok(envelope("Reply draft approved", data, "req-cs-draft-appr"));
    }

    @PostMapping("/tickets/{ticketId}/reply-drafts/{draftId}/send")
    public ResponseEntity<?> sendReplyDraft(@PathVariable String ticketId, @PathVariable String draftId) {
        Map<String, Object> data = Map.of("draftId", draftId, "status", "SENT", "channel", "EMAIL");
        return ResponseEntity.ok(envelope("Reply draft sent", data, "req-cs-draft-send"));
    }

    @PostMapping("/tickets/{ticketId}/escalate")
    public ResponseEntity<?> escalateTicket(@PathVariable String ticketId, @RequestBody Map<String, Object> body) {
        Map<String, Object> t = store.findTicket(ticketId);
        if (t != null) {
            t.put("status", "ESCALATED");
        }
        store.recordAudit("TRAVEL_SUPPORT_TICKET_ESCALATED", "ticketId=" + ticketId);
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("ticketId", ticketId);
        data.put("status", "ESCALATED");
        data.put("assignedRole", body.getOrDefault("targetRole", "SUPPORT_MANAGER"));
        return ResponseEntity.ok(envelope("Ticket escalated", data, "req-cs-009"));
    }

    @PostMapping("/tickets/{ticketId}/resolve")
    public ResponseEntity<?> resolveTicket(@PathVariable String ticketId, @RequestBody Map<String, Object> body) {
        Map<String, Object> t = store.findTicket(ticketId);
        if (t != null) {
            t.put("status", "RESOLVED");
        }
        store.recordAudit("TRAVEL_SUPPORT_TICKET_RESOLVED", "ticketId=" + ticketId);
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("ticketId", ticketId);
        data.put("status", "RESOLVED");
        data.put("resolutionReference", body.getOrDefault("resolutionReference", "CHG-1001"));
        return ResponseEntity.ok(envelope("Support ticket resolved", data, "req-cs-010"));
    }

    @PostMapping("/tickets/{ticketId}/reopen")
    public ResponseEntity<?> reopenTicket(@PathVariable String ticketId, @RequestBody Map<String, Object> body) {
        Map<String, Object> t = store.findTicket(ticketId);
        if (t != null) {
            t.put("status", "REOPENED");
        }
        return ResponseEntity.ok(envelope("Support ticket reopened", t, "req-cs-t-reopen"));
    }

    // --- Change Requests ---
    @GetMapping("/change-requests")
    public ResponseEntity<?> listChangeRequests() {
        return ResponseEntity.ok(envelope("Booking change requests retrieved", store.getChangeRequestsList(), "req-cs-cr-list"));
    }

    @PostMapping("/change-requests")
    public ResponseEntity<?> createChangeRequest(@RequestBody Map<String, Object> body) {
        Map<String, Object> cr = store.createChangeRequest(body);
        store.recordAudit("TRAVEL_CHANGE_REQUEST_CREATED", "changeRequestId=" + cr.get("changeRequestId"));
        return ResponseEntity.ok(envelope("Change request submitted", cr, "req-cs-005"));
    }

    @GetMapping("/change-requests/{requestId}")
    public ResponseEntity<?> getChangeRequest(@PathVariable String requestId) {
        Map<String, Object> cr = store.findChangeRequest(requestId);
        if (cr == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(envelope("Change request not found", null, "req-cs-err"));
        return ResponseEntity.ok(envelope("Change request details retrieved", cr, "req-cs-cr-get"));
    }

    @PostMapping("/change-requests/{requestId}/escalate")
    public ResponseEntity<?> escalateChangeRequest(@PathVariable String requestId, @RequestBody Map<String, Object> body) {
        Map<String, Object> cr = store.findChangeRequest(requestId);
        if (cr != null) cr.put("status", "ESCALATED");
        return ResponseEntity.ok(envelope("Change request escalated", cr, "req-cs-cr-esc"));
    }

    // --- Cancellation Requests ---
    @GetMapping("/cancellation-requests")
    public ResponseEntity<?> listCancellationRequests() {
        return ResponseEntity.ok(envelope("Cancellation requests retrieved", store.getCancellationRequestsList(), "req-cs-can-list"));
    }

    @PostMapping("/cancellation-requests")
    public ResponseEntity<?> createCancellationRequest(@RequestBody Map<String, Object> body) {
        Map<String, Object> can = store.createCancellationRequest(body);
        store.recordAudit("TRAVEL_CANCELLATION_REQUESTED", "cancellationRequestId=" + can.get("cancellationRequestId"));
        return ResponseEntity.ok(envelope("Cancellation request created", can, "req-cs-006"));
    }

    @GetMapping("/cancellation-requests/{requestId}")
    public ResponseEntity<?> getCancellationRequest(@PathVariable String requestId) {
        Map<String, Object> can = store.getCancellationRequestsList().stream()
                .filter(c -> requestId.equalsIgnoreCase(String.valueOf(c.get("cancellationRequestId"))))
                .findFirst().orElse(null);
        return ResponseEntity.ok(envelope("Cancellation request retrieved", can, "req-cs-can-get"));
    }

    // --- Refund Status ---
    @GetMapping("/refunds/{refundReference}/status")
    public ResponseEntity<?> getRefundStatus(@PathVariable String refundReference) {
        Map<String, Object> ref = store.getRefundsList().stream()
                .filter(r -> refundReference.equalsIgnoreCase(String.valueOf(r.get("refundReference"))))
                .findFirst().orElse(null);

        if (ref == null) {
            Map<String, Object> fallback = Map.of(
                    "refundReference", refundReference,
                    "status", "PROCESSING",
                    "currency", "INR",
                    "amount", 15000,
                    "lastUpdatedAt", "2026-10-28T16:00:00+05:30"
            );
            return ResponseEntity.ok(envelope("Refund status retrieved", fallback, "req-cs-007"));
        }
        return ResponseEntity.ok(envelope("Refund status retrieved", ref, "req-cs-007"));
    }

    // --- Service Requests ---
    @GetMapping("/service-requests")
    public ResponseEntity<?> listServiceRequests() {
        List<Map<String, Object>> list = List.of(
                Map.of("requestId", "SR-101", "bookingId", "TBOOK-1001", "serviceType", "WHEELCHAIR_ASSISTANCE", "status", "CONFIRMED")
        );
        return ResponseEntity.ok(envelope("Customer service requests retrieved", list, "req-cs-sr-list"));
    }

    @PostMapping("/service-requests")
    public ResponseEntity<?> createServiceRequest(@RequestBody Map<String, Object> body) {
        Map<String, Object> sr = new LinkedHashMap<>(body);
        sr.put("requestId", "SR-" + System.currentTimeMillis());
        sr.put("serviceRequestId", "SR-" + System.currentTimeMillis());
        sr.put("status", "RECORDED");
        return ResponseEntity.status(HttpStatus.CREATED).body(envelope("Service request created", sr, "req-cs-sr-new"));
    }

    @GetMapping("/service-requests/{requestId}")
    public ResponseEntity<?> getServiceRequest(@PathVariable String requestId) {
        Map<String, Object> sr = Map.of("requestId", requestId, "status", "CONFIRMED");
        return ResponseEntity.ok(envelope("Service request details retrieved", sr, "req-cs-sr-get"));
    }

    @PostMapping("/service-requests/{requestId}/assign")
    public ResponseEntity<?> assignServiceRequest(@PathVariable String requestId, @RequestBody Map<String, Object> body) {
        Map<String, Object> sr = Map.of("requestId", requestId, "assignedTo", body.get("assignee"), "status", "ASSIGNED");
        return ResponseEntity.ok(envelope("Service request assigned", sr, "req-cs-sr-assign"));
    }

    @PostMapping("/service-requests/{requestId}/escalate")
    public ResponseEntity<?> escalateServiceRequest(@PathVariable String requestId, @RequestBody Map<String, Object> body) {
        Map<String, Object> sr = Map.of("requestId", requestId, "status", "ESCALATED");
        return ResponseEntity.ok(envelope("Service request escalated", sr, "req-cs-sr-esc"));
    }

    @PostMapping("/service-requests/{requestId}/resolve")
    public ResponseEntity<?> resolveServiceRequest(@PathVariable String requestId, @RequestBody Map<String, Object> body) {
        Map<String, Object> sr = Map.of("requestId", requestId, "status", "RESOLVED");
        return ResponseEntity.ok(envelope("Service request resolved", sr, "req-cs-sr-res"));
    }

    // --- Knowledge Search & Feedback & Escalations ---
    @GetMapping("/knowledge/articles")
    public ResponseEntity<?> listKnowledgeArticles() {
        List<Map<String, Object>> articles = List.of(
                Map.of("articleId", "KB-101", "title", "Cancellation Policy - Bali Packages", "category", "POLICIES"),
                Map.of("articleId", "KB-102", "title", "Visa On Arrival Requirements - Indonesia", "category", "TRAVEL_RULES")
        );
        return ResponseEntity.ok(envelope("Approved support articles retrieved", articles, "req-cs-kb-art"));
    }

    @PostMapping("/knowledge/search")
    public ResponseEntity<?> searchKnowledge(@RequestBody Map<String, Object> query) {
        List<Map<String, Object>> results = List.of(
                Map.of("articleId", "KB-101", "title", "Cancellation Policy - Bali Packages", "snippet", "Full refund available up to 14 days before departure.")
        );
        return ResponseEntity.ok(envelope("Knowledge search completed", Map.of("results", results), "req-cs-kb-search"));
    }

    @PostMapping("/feedback")
    public ResponseEntity<?> recordFeedback(@RequestBody Map<String, Object> body) {
        Map<String, Object> fb = new LinkedHashMap<>(body);
        fb.put("feedbackId", "FB-" + System.currentTimeMillis());
        fb.put("recordedAt", "2026-10-28T17:30:00+05:30");
        return ResponseEntity.ok(envelope("Customer feedback recorded", fb, "req-cs-fb"));
    }

    @GetMapping("/escalations")
    public ResponseEntity<?> listEscalations() {
        List<Map<String, Object>> list = List.of(
                Map.of("escalationId", "ESC-1", "ticketId", "TTICKET-1001", "reason", "Date change SLA breached", "status", "OPEN")
        );
        return ResponseEntity.ok(envelope("Support escalations retrieved", list, "req-cs-esc"));
    }
}
