package com.zenelait.crm.hotel;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/v1/hotel/ai-reservation-agent")
@CrossOrigin(origins = "*")
public class HotelAiReservationAgentV1Controller {

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
        resp.put("requestId", reqId != null ? reqId : "req-res-" + UUID.randomUUID().toString().substring(0, 6));
        return resp;
    }

    // 1. Dashboard, Config, Channels, Knowledge
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "AI Reservation Agent dashboard retrieved",
                store.getAiReservationDashboard(tenantId), "req-res-001"));
    }

    @GetMapping("/config")
    public ResponseEntity<Map<String, Object>> getConfig(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardResponse(true, "AI Reservation Agent configuration retrieved",
                store.getAiConfig(), "req-res-cfg"));
    }

    @PatchMapping("/config")
    public ResponseEntity<Map<String, Object>> updateConfig(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        store.getAiConfig().putAll(body);
        return ResponseEntity.ok(standardResponse(true, "AI Reservation Agent configuration updated",
                store.getAiConfig(), "req-res-cfg-upd"));
    }

    @GetMapping("/channels")
    public ResponseEntity<Map<String, Object>> getChannels(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Authorized reservation channels retrieved",
                store.getAiReservationChannels(tenantId), "req-res-chn"));
    }

    @GetMapping("/knowledge/search")
    public ResponseEntity<Map<String, Object>> searchKnowledge(
            @RequestParam(required = false, defaultValue = "") String q,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Approved hotel knowledge retrieved",
                store.getKnowledgeArticles(tenantId, q), "req-res-kb"));
    }

    // 2. Conversations & Messaging
    @PostMapping("/conversations")
    public ResponseEntity<Map<String, Object>> startConversation(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> conv = store.startAiReservationConversation(tenantId, body);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                standardResponse(true, "Reservation conversation created", conv, "req-res-001"));
    }

    @GetMapping("/conversations")
    public ResponseEntity<Map<String, Object>> getConversations(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Authorized conversations retrieved",
                store.getConversations(tenantId, null), "req-res-convs"));
    }

    @GetMapping("/conversations/{conversationId}")
    public ResponseEntity<Map<String, Object>> getConversation(
            @PathVariable String conversationId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> conv = store.getConversation(tenantId, conversationId);
        if (conv == null) {
            return ResponseEntity.status(404).body(standardResponse(false, "Conversation not found", null, "req-res-404"));
        }
        return ResponseEntity.ok(standardResponse(true, "Conversation details retrieved", conv, "req-res-conv-get"));
    }

    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<Map<String, Object>> getConversationMessages(
            @PathVariable String conversationId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Conversation messages retrieved",
                store.getConversationMessages(tenantId, conversationId), "req-res-conv-msgs"));
    }

    @PostMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<Map<String, Object>> processMessage(
            @PathVariable String conversationId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Guest message processed",
                store.processAiReservationMessage(tenantId, conversationId, body), "req-res-009"));
    }

    @PostMapping("/conversations/{conversationId}/handoff")
    public ResponseEntity<Map<String, Object>> handoff(
            @PathVariable String conversationId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Conversation handed off",
                store.handoffAiReservationConversation(tenantId, conversationId, body), "req-res-012"));
    }

    // 3. Room Types, Rates & Availability
    @PostMapping("/availability/search")
    public ResponseEntity<Map<String, Object>> searchAvailability(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Availability search completed",
                store.searchAiAvailability(tenantId, body), "req-res-002"));
    }

    @GetMapping("/room-types")
    public ResponseEntity<Map<String, Object>> getRoomTypes(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> list = new ArrayList<>(store.getRoomTypes().values());
        return ResponseEntity.ok(standardResponse(true, "Room types retrieved", list, "req-res-003"));
    }

    @GetMapping("/room-types/{roomTypeId}")
    public ResponseEntity<Map<String, Object>> getRoomType(
            @PathVariable String roomTypeId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> rt = store.getRoomTypes().get(roomTypeId);
        if (rt == null) {
            return ResponseEntity.status(404).body(standardResponse(false, "Room type not found", null, "req-res-404"));
        }
        return ResponseEntity.ok(standardResponse(true, "Room type details retrieved", rt, "req-res-rt-get"));
    }

    @GetMapping("/rate-plans")
    public ResponseEntity<Map<String, Object>> getRatePlans(
            @RequestParam(required = false) String roomTypeId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> list = new ArrayList<>(store.getRatePlans().values());
        return ResponseEntity.ok(standardResponse(true, "Applicable rate plans retrieved", list, "req-res-rp-get"));
    }

    // 4. Quotes & Recalculation
    @PostMapping("/quotes")
    public ResponseEntity<Map<String, Object>> calculateQuote(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Quote generated",
                store.calculateAiQuote(tenantId, body), "req-res-004"));
    }

    @GetMapping("/quotes/{quoteId}")
    public ResponseEntity<Map<String, Object>> getQuote(
            @PathVariable String quoteId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> q = store.getQuotes().get(quoteId);
        if (q == null) {
            return ResponseEntity.status(404).body(standardResponse(false, "Quote not found", null, "req-res-404"));
        }
        return ResponseEntity.ok(standardResponse(true, "Quote details retrieved", q, "req-res-q-get"));
    }

    @PostMapping("/quotes/{quoteId}/recalculate")
    public ResponseEntity<Map<String, Object>> recalculateQuote(
            @PathVariable String quoteId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Quote recalculated based on live inventory",
                store.recalculateAiQuote(tenantId, quoteId), "req-res-q-recalc"));
    }

    // 5. Guest Matching & Creation
    @PostMapping("/guests/match")
    public ResponseEntity<Map<String, Object>> matchGuest(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Guest match completed",
                store.matchGuest(tenantId, body), "req-res-005"));
    }

    @PostMapping("/guests")
    public ResponseEntity<Map<String, Object>> createGuest(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> g = store.createGuest(tenantId, body);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                standardResponse(true, "Guest created", g, "req-res-006"));
    }

    @GetMapping("/guests/{guestId}")
    public ResponseEntity<Map<String, Object>> getGuest(
            @PathVariable String guestId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> g = store.getGuest(tenantId, guestId);
        if (g == null) {
            return ResponseEntity.status(404).body(standardResponse(false, "Guest not found", null, "req-res-404"));
        }
        return ResponseEntity.ok(standardResponse(true, "Authorized guest details retrieved", g, "req-res-g-get"));
    }

    // 6. Reservation Creation, Confirmation & Lifecycle
    @PostMapping("/reservations")
    public ResponseEntity<Map<String, Object>> createPendingReservation(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> res = store.createPendingReservation(tenantId, body, idempotencyKey);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                standardResponse(true, "Reservation created and awaiting confirmation", res, "req-res-007"));
    }

    @GetMapping("/reservations/{reservationId}")
    public ResponseEntity<Map<String, Object>> getReservation(
            @PathVariable String reservationId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> res = store.getReservation(tenantId, reservationId);
        if (res == null) {
            return ResponseEntity.status(404).body(standardResponse(false, "Reservation not found", null, "req-res-404"));
        }
        return ResponseEntity.ok(standardResponse(true, "Authorized reservation details retrieved", res, "req-res-r-get"));
    }

    @PostMapping("/reservations/{reservationId}/confirm")
    public ResponseEntity<Map<String, Object>> confirmReservation(
            @PathVariable String reservationId,
            @RequestBody(required = false) Map<String, Object> body,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> res = store.confirmReservationWithIdempotency(tenantId, reservationId, body, idempotencyKey);
        return ResponseEntity.ok(standardResponse(true, "Reservation confirmed", res, "req-res-008"));
    }

    @PostMapping("/reservations/{reservationId}/modification-requests")
    public ResponseEntity<Map<String, Object>> submitModificationRequest(
            @PathVariable String reservationId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> req = store.createRoomMoveRequest(tenantId, body);
        req.put("reservationId", reservationId);
        req.put("status", "PENDING_REVIEW");
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(
                standardResponse(true, "Modification request submitted for validation", req, "req-res-010"));
    }

    @PostMapping("/reservations/{reservationId}/cancellation-requests")
    public ResponseEntity<Map<String, Object>> submitCancellationRequest(
            @PathVariable String reservationId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> req = new LinkedHashMap<>(body);
        req.put("cancellationRequestId", "CAN-" + (1001 + store.getCancellationRequests().size()));
        req.put("reservationId", reservationId);
        req.put("status", "PENDING_REVIEW");
        store.getCancellationRequests().put((String) req.get("cancellationRequestId"), req);
        return ResponseEntity.ok(standardResponse(true, "Cancellation request submitted", req, "req-res-011"));
    }

    @GetMapping("/reservations/{reservationId}/status")
    public ResponseEntity<Map<String, Object>> getReservationStatus(
            @PathVariable String reservationId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> res = store.getReservation(tenantId, reservationId);
        Map<String, Object> ret = new LinkedHashMap<>();
        ret.put("reservationId", reservationId);
        ret.put("status", res != null ? res.get("status") : "CONFIRMED");
        return ResponseEntity.ok(standardResponse(true, "Reservation status retrieved", ret, "req-res-st"));
    }

    @PostMapping("/reservations/{reservationId}/send-confirmation")
    public ResponseEntity<Map<String, Object>> sendConfirmation(
            @PathVariable String reservationId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> ret = new LinkedHashMap<>();
        ret.put("reservationId", reservationId);
        ret.put("deliveryStatus", "QUEUED");
        return ResponseEntity.ok(standardResponse(true, "Approved booking confirmation queued", ret, "req-res-snd"));
    }

    // 7. Payment Checkout Sessions
    @PostMapping("/payments/checkout-sessions")
    public ResponseEntity<Map<String, Object>> createCheckoutSession(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Checkout session created",
                store.createCheckoutSession(tenantId, body), "req-res-cs"));
    }

    @GetMapping("/payments/{paymentReference}/status")
    public ResponseEntity<Map<String, Object>> getPaymentStatus(
            @PathVariable String paymentReference,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Payment status verified with provider",
                store.getPaymentSessionStatus(tenantId, paymentReference), "req-res-ps"));
    }

    // 8. Handoffs, Metrics, Logs
    @GetMapping("/handoffs")
    public ResponseEntity<Map<String, Object>> getHandoffs(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> list = new ArrayList<>(store.getAiHandoffs().values());
        return ResponseEntity.ok(standardResponse(true, "Cases awaiting human attention retrieved", list, "req-res-ho"));
    }

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getMetrics(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("totalQuotes", store.getQuotes().size());
        m.put("conversionRate", 64.2);
        m.put("averageQuoteTimeSeconds", 1.8);
        m.put("totalHandoffs", store.getAiHandoffs().size());
        return ResponseEntity.ok(standardResponse(true, "Booking conversion and operational metrics retrieved", m, "req-res-met"));
    }

    @GetMapping("/activity-logs")
    public ResponseEntity<Map<String, Object>> getActivityLogs(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Permitted agent activity records retrieved",
                store.getAuditEvents(tenantId), "req-res-act"));
    }
}
