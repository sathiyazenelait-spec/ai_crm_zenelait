package com.zenelait.crm.travel;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/travel/booking-executive")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class TravelBookingExecutiveV1Controller {

    private final TravelDataStore store;

    public TravelBookingExecutiveV1Controller(TravelDataStore store) {
        this.store = store;
    }

    private <T> Map<String, Object> envelope(String message, T data, String requestId) {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", true);
        resp.put("message", message);
        resp.put("data", data);
        resp.put("requestId", requestId != null ? requestId : "req-be-" + System.currentTimeMillis());
        return resp;
    }

    // --- Dashboard & Metrics ---
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("pendingHandoffs", store.getHandoffsList().stream().filter(h -> "PENDING_BOOKING_REVIEW".equals(h.get("status"))).count());
        data.put("pendingSupplierConfirmations", store.getSupplierBookingsList().stream().filter(sb -> "PENDING_SUPPLIER_CONFIRMATION".equals(sb.get("status"))).count());
        data.put("confirmedBookings", store.getBookingsList().stream().filter(b -> "CONFIRMED".equals(b.get("status"))).count());
        data.put("paymentPendingBookings", store.getPaymentsList().stream().filter(p -> "PENDING".equals(p.get("status"))).count());
        data.put("bookingExceptions", store.getExceptionsList().size());
        data.put("pendingCancellations", store.getCancellationRequestsList().size());
        data.put("period", "CURRENT_MONTH");
        return ResponseEntity.ok(envelope("Booking dashboard retrieved", data, "req-be-001"));
    }

    @GetMapping("/metrics")
    public ResponseEntity<?> getMetrics() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("slaAdherence", 96.4);
        data.put("autoReconcileRate", 88.0);
        data.put("bookingsProcessed", 84);
        data.put("avgProcessingMinutes", 28);
        return ResponseEntity.ok(envelope("Booking operations metrics retrieved", data, "req-be-met"));
    }

    @GetMapping("/activity-logs")
    public ResponseEntity<?> getActivityLogs() {
        return ResponseEntity.ok(envelope("Booking operations audit history retrieved", store.getAuditLogs(), "req-be-audit"));
    }

    // --- Booking Handoffs ---
    @GetMapping("/handoffs")
    public ResponseEntity<?> listHandoffs(@RequestParam(required = false) String status,
                                         @RequestParam(defaultValue = "0") int page,
                                         @RequestParam(defaultValue = "20") int size) {
        List<Map<String, Object>> filtered = store.getHandoffsList().stream()
                .filter(h -> status == null || status.equalsIgnoreCase(String.valueOf(h.get("status"))))
                .toList();
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("items", filtered);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", filtered.size());
        return ResponseEntity.ok(envelope("Booking handoffs retrieved", data, "req-be-002"));
    }

    @GetMapping("/handoffs/{handoffId}")
    public ResponseEntity<?> getHandoff(@PathVariable String handoffId) {
        Map<String, Object> h = store.findHandoff(handoffId);
        if (h == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(envelope("Handoff not found", null, "req-be-err"));
        return ResponseEntity.ok(envelope("Handoff details retrieved", h, "req-be-h-get"));
    }

    @PostMapping("/handoffs/{handoffId}/accept")
    public ResponseEntity<?> acceptHandoff(@PathVariable String handoffId, @RequestBody Map<String, Object> body) {
        Map<String, Object> h = store.findHandoff(handoffId);
        if (h != null) {
            h.put("status", "ACCEPTED");
            h.put("assignedBookingExecutive", "EMP-204");
        }
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("handoffId", handoffId);
        data.put("status", "ACCEPTED");
        data.put("assignedBookingExecutive", "EMP-204");
        return ResponseEntity.ok(envelope("Booking handoff accepted", data, "req-be-003"));
    }

    @PostMapping("/handoffs/{handoffId}/return-to-consultant")
    public ResponseEntity<?> returnHandoff(@PathVariable String handoffId, @RequestBody Map<String, Object> body) {
        Map<String, Object> h = store.findHandoff(handoffId);
        if (h != null) {
            h.put("status", "RETURNED_TO_CONSULTANT");
            h.put("returnReason", body.get("reason"));
        }
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("handoffId", handoffId);
        data.put("status", "RETURNED_TO_CONSULTANT");
        return ResponseEntity.ok(envelope("Handoff returned for additional information", data, "req-be-004"));
    }

    // --- Bookings Management ---
    @GetMapping("/bookings")
    public ResponseEntity<?> listBookings() {
        return ResponseEntity.ok(envelope("Authorized bookings retrieved", store.getBookingsList(), "req-be-bks"));
    }

    @PostMapping("/bookings")
    public ResponseEntity<?> createBooking(@RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
                                          @RequestBody Map<String, Object> body) {
        Map<String, Object> b = store.createBooking(body);
        store.recordAudit("TRAVEL_BOOKING_CREATED", "bookingId=" + b.get("bookingId"));
        return ResponseEntity.status(HttpStatus.CREATED).body(envelope("Booking record created", b, "req-be-006"));
    }

    @GetMapping("/bookings/{bookingId}")
    public ResponseEntity<?> getBooking(@PathVariable String bookingId) {
        Map<String, Object> b = store.findBooking(bookingId);
        if (b == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(envelope("Booking not found", null, "req-be-err"));
        return ResponseEntity.ok(envelope("Booking details retrieved", b, "req-be-bk-get"));
    }

    @PatchMapping("/bookings/{bookingId}")
    public ResponseEntity<?> updateBooking(@PathVariable String bookingId, @RequestBody Map<String, Object> updates) {
        Map<String, Object> b = store.findBooking(bookingId);
        if (b == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(envelope("Booking not found", null, "req-be-err"));
        b.putAll(updates);
        return ResponseEntity.ok(envelope("Booking updated", b, "req-be-bk-patch"));
    }

    @GetMapping("/bookings/{bookingId}/history")
    public ResponseEntity<?> getBookingHistory(@PathVariable String bookingId) {
        List<Map<String, Object>> hist = List.of(
                Map.of("status", "PENDING_CONFIRMATION", "changedBy", "EMP-204", "timestamp", "2026-10-28T15:00:00+05:30"),
                Map.of("status", "CONFIRMED", "changedBy", "SYSTEM", "timestamp", "2026-10-28T16:35:00+05:30")
        );
        return ResponseEntity.ok(envelope("Booking history retrieved", hist, "req-be-bk-hist"));
    }

    @PostMapping("/bookings/{bookingId}/validate")
    public ResponseEntity<?> validateBooking(@PathVariable String bookingId, @RequestBody(required = false) Map<String, Object> body) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("bookingId", bookingId);
        data.put("readyForConfirmation", false);
        data.put("checks", List.of(
                Map.of("name", "QUOTATION_VALIDITY", "status", "PASSED"),
                Map.of("name", "TRAVELLER_DETAILS", "status", "PASSED"),
                Map.of("name", "SUPPLIER_AVAILABILITY", "status", "PENDING"),
                Map.of("name", "PAYMENT_REQUIREMENTS", "status", "PENDING")
        ));
        return ResponseEntity.ok(envelope("Booking validation completed", data, "req-be-005"));
    }

    @PostMapping("/bookings/{bookingId}/confirm")
    public ResponseEntity<?> confirmBooking(@PathVariable String bookingId) {
        Map<String, Object> b = store.findBooking(bookingId);
        if (b != null) {
            b.put("status", "CONFIRMED");
        }
        store.recordAudit("TRAVEL_BOOKING_CONFIRMED", "bookingId=" + bookingId);
        return ResponseEntity.ok(envelope("Booking confirmed", b, "req-be-bk-conf"));
    }

    @GetMapping("/bookings/{bookingId}/status")
    public ResponseEntity<?> getBookingStatus(@PathVariable String bookingId) {
        Map<String, Object> b = store.findBooking(bookingId);
        if (b == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(envelope("Booking not found", null, "req-be-err"));
        Map<String, Object> data = Map.of("bookingId", bookingId, "status", b.get("status"), "supplierStatus", b.get("supplierStatus"));
        return ResponseEntity.ok(envelope("Booking status retrieved", data, "req-be-bk-stat"));
    }

    @GetMapping("/bookings/{bookingId}/items")
    public ResponseEntity<?> getBookingItems(@PathVariable String bookingId) {
        List<Map<String, Object>> items = List.of(
                Map.of("itemId", "BITEM-1", "bookingId", bookingId, "type", "HOTEL", "supplierId", "SUP-101", "status", "CONFIRMED"),
                Map.of("itemId", "BITEM-2", "bookingId", bookingId, "type", "TRANSFER", "supplierId", "SUP-102", "status", "CONFIRMED")
        );
        return ResponseEntity.ok(envelope("Booking items retrieved", items, "req-be-bitems"));
    }

    @PostMapping("/bookings/{bookingId}/items")
    public ResponseEntity<?> addBookingItem(@PathVariable String bookingId, @RequestBody Map<String, Object> body) {
        Map<String, Object> item = new LinkedHashMap<>(body);
        item.put("itemId", "BITEM-" + System.currentTimeMillis());
        item.put("bookingId", bookingId);
        item.put("status", "PENDING");
        return ResponseEntity.status(HttpStatus.CREATED).body(envelope("Booking component added", item, "req-be-bitem-add"));
    }

    @PatchMapping("/bookings/{bookingId}/items/{itemId}")
    public ResponseEntity<?> updateBookingItem(@PathVariable String bookingId, @PathVariable String itemId, @RequestBody Map<String, Object> body) {
        Map<String, Object> item = new LinkedHashMap<>(body);
        item.put("itemId", itemId);
        item.put("bookingId", bookingId);
        return ResponseEntity.ok(envelope("Booking component updated", item, "req-be-bitem-up"));
    }

    // --- Supplier Searches & Bookings ---
    @PostMapping("/supplier-searches")
    public ResponseEntity<?> supplierSearch(@RequestBody Map<String, Object> body) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("searchId", "SUP-SEARCH-1001");
        data.put("status", "PROCESSING");
        data.put("results", List.of());
        return ResponseEntity.ok(envelope("Supplier search submitted", data, "req-be-007"));
    }

    @GetMapping("/supplier-searches/{searchId}")
    public ResponseEntity<?> getSupplierSearchResult(@PathVariable String searchId) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("searchId", searchId);
        data.put("status", "COMPLETED");
        data.put("results", List.of(
                Map.of("supplierId", "SUP-101", "hotelName", "Bali Luxury Villa", "roomType", "Ocean View", "price", 60000)
        ));
        return ResponseEntity.ok(envelope("Supplier search completed", data, "req-be-sup-res"));
    }

    @PostMapping("/supplier-bookings")
    public ResponseEntity<?> submitSupplierBooking(@RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
                                                  @RequestBody Map<String, Object> body) {
        Map<String, Object> sb = store.createSupplierBooking(body);
        store.recordAudit("TRAVEL_SUPPLIER_BOOKING_SUBMITTED", "supplierBookingId=" + sb.get("supplierBookingId"));
        return ResponseEntity.ok(envelope("Supplier booking request submitted", sb, "req-be-008"));
    }

    @GetMapping("/supplier-bookings/{supplierBookingId}")
    public ResponseEntity<?> getSupplierBooking(@PathVariable String supplierBookingId) {
        Map<String, Object> sb = store.getSupplierBookingsList().stream()
                .filter(s -> supplierBookingId.equalsIgnoreCase(String.valueOf(s.get("supplierBookingId"))))
                .findFirst().orElse(null);
        if (sb == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(envelope("Supplier booking not found", null, "req-be-err"));
        return ResponseEntity.ok(envelope("Supplier booking details retrieved", sb, "req-be-sb-get"));
    }

    @GetMapping("/supplier-bookings/{supplierBookingId}/status")
    public ResponseEntity<?> getSupplierBookingStatus(@PathVariable String supplierBookingId) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("supplierBookingId", supplierBookingId);
        data.put("bookingId", "TBOOK-1001");
        data.put("status", "CONFIRMED");
        data.put("supplierReference", "SUP-CONF-12345");
        data.put("lastVerifiedAt", "2026-10-28T16:30:00+05:30");
        return ResponseEntity.ok(envelope("Supplier booking status retrieved", data, "req-be-009"));
    }

    @PostMapping("/supplier-bookings/{supplierBookingId}/cancel-requests")
    public ResponseEntity<?> requestSupplierCancellation(@PathVariable String supplierBookingId, @RequestBody Map<String, Object> body) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("cancellationRequestId", "TCAN-1001");
        data.put("supplierBookingId", supplierBookingId);
        data.put("status", "PENDING_SUPPLIER_RESPONSE");
        return ResponseEntity.ok(envelope("Supplier cancellation request submitted", data, "req-be-013"));
    }

    @PostMapping("/supplier-bookings/{supplierBookingId}/change-requests")
    public ResponseEntity<?> requestSupplierChange(@PathVariable String supplierBookingId, @RequestBody Map<String, Object> body) {
        Map<String, Object> data = Map.of("supplierBookingId", supplierBookingId, "status", "CHANGE_REQUESTED");
        return ResponseEntity.ok(envelope("Supplier modification requested", data, "req-be-sb-change"));
    }

    @PostMapping("/supplier-bookings/{supplierBookingId}/reconcile")
    public ResponseEntity<?> reconcileSupplierBooking(@PathVariable String supplierBookingId) {
        Map<String, Object> data = Map.of("supplierBookingId", supplierBookingId, "reconciliationStatus", "RECONCILED", "matched", true);
        return ResponseEntity.ok(envelope("Supplier status reconciled", data, "req-be-sb-rec"));
    }

    // --- Payments & Invoices ---
    @GetMapping("/payments")
    public ResponseEntity<?> listPayments() {
        return ResponseEntity.ok(envelope("Permitted payment records retrieved", store.getPaymentsList(), "req-be-pay-list"));
    }

    @PostMapping("/payments/checkout-sessions")
    public ResponseEntity<?> createCheckoutSession(@RequestBody Map<String, Object> body) {
        Map<String, Object> pay = store.createPaymentSession(String.valueOf(body.get("bookingId")), ((Number) body.getOrDefault("amount", 63000)).doubleValue());
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("paymentReference", pay.get("paymentReference"));
        data.put("bookingId", pay.get("bookingId"));
        data.put("status", "PENDING");
        data.put("currency", pay.get("currency"));
        data.put("checkoutUrl", "https://checkout.zenelait.com/pay/" + pay.get("paymentReference"));
        return ResponseEntity.ok(envelope("Checkout session created", data, "req-be-010"));
    }

    @GetMapping("/payments/{paymentReference}/status")
    public ResponseEntity<?> getPaymentStatus(@PathVariable String paymentReference) {
        Map<String, Object> pay = store.getPaymentsList().stream()
                .filter(p -> paymentReference.equalsIgnoreCase(String.valueOf(p.get("paymentReference"))))
                .findFirst().orElse(null);
        if (pay == null) {
            Map<String, Object> def = Map.of(
                    "paymentReference", paymentReference,
                    "bookingId", "TBOOK-1001",
                    "status", "SUCCEEDED",
                    "amount", 63000,
                    "currency", "INR",
                    "providerReference", "PROVIDER-PAYMENT-1001"
            );
            return ResponseEntity.ok(envelope("Payment status retrieved", def, "req-be-011"));
        }
        return ResponseEntity.ok(envelope("Payment status retrieved", pay, "req-be-011"));
    }

    @GetMapping("/invoices")
    public ResponseEntity<?> listInvoices() {
        return ResponseEntity.ok(envelope("Authorized invoices retrieved", store.getInvoicesList(), "req-be-invs"));
    }

    @GetMapping("/invoices/{invoiceId}")
    public ResponseEntity<?> getInvoice(@PathVariable String invoiceId) {
        Map<String, Object> inv = store.getInvoicesList().stream()
                .filter(i -> invoiceId.equalsIgnoreCase(String.valueOf(i.get("invoiceId"))))
                .findFirst().orElse(null);
        if (inv == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(envelope("Invoice not found", null, "req-be-err"));
        return ResponseEntity.ok(envelope("Invoice details retrieved", inv, "req-be-inv-get"));
    }

    @PostMapping("/invoices")
    public ResponseEntity<?> createInvoice(@RequestBody Map<String, Object> body) {
        Map<String, Object> inv = new LinkedHashMap<>(body);
        String invId = "INV-" + System.currentTimeMillis();
        inv.put("invoiceId", invId);
        inv.put("status", "DRAFT");
        store.getInvoices().put(invId, inv);
        return ResponseEntity.status(HttpStatus.CREATED).body(envelope("Invoice created", inv, "req-be-inv-new"));
    }

    @PostMapping("/invoices/{invoiceId}/issue")
    public ResponseEntity<?> issueInvoice(@PathVariable String invoiceId) {
        Map<String, Object> inv = store.getInvoicesList().stream()
                .filter(i -> invoiceId.equalsIgnoreCase(String.valueOf(i.get("invoiceId"))))
                .findFirst().orElse(null);
        if (inv != null) inv.put("status", "ISSUED");
        return ResponseEntity.ok(envelope("Invoice issued", inv, "req-be-inv-issue"));
    }

    // --- Vouchers & Travel Documents ---
    @GetMapping("/vouchers")
    public ResponseEntity<?> listVouchers() {
        return ResponseEntity.ok(envelope("Booking vouchers retrieved", store.getVouchersList(), "req-be-v-list"));
    }

    @PostMapping("/bookings/{bookingId}/vouchers/generate")
    public ResponseEntity<?> generateVoucher(@PathVariable String bookingId, @RequestBody Map<String, Object> body) {
        Map<String, Object> v = store.createVoucher(bookingId, String.valueOf(body.getOrDefault("voucherType", "HOTEL_CONFIRMATION")));
        store.recordAudit("TRAVEL_DOCUMENT_GENERATED", "voucherId=" + v.get("voucherId"));
        return ResponseEntity.ok(envelope("Voucher generated", v, "req-be-012"));
    }

    @GetMapping("/vouchers/{voucherId}")
    public ResponseEntity<?> getVoucher(@PathVariable String voucherId) {
        Map<String, Object> v = store.getVouchersList().stream()
                .filter(x -> voucherId.equalsIgnoreCase(String.valueOf(x.get("voucherId"))))
                .findFirst().orElse(null);
        if (v == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(envelope("Voucher not found", null, "req-be-err"));
        return ResponseEntity.ok(envelope("Voucher details retrieved", v, "req-be-v-get"));
    }

    @PostMapping("/vouchers/{voucherId}/send")
    public ResponseEntity<?> sendVoucher(@PathVariable String voucherId, @RequestBody Map<String, Object> body) {
        Map<String, Object> data = Map.of("voucherId", voucherId, "status", "SENT", "channel", body.getOrDefault("channel", "EMAIL"));
        return ResponseEntity.ok(envelope("Voucher sent to guest", data, "req-be-v-send"));
    }

    @GetMapping("/travel-documents")
    public ResponseEntity<?> listTravelDocuments() {
        List<Map<String, Object>> docs = List.of(
                Map.of("docId", "DOC-1001", "type", "VOUCHER", "name", "Bali Grand Resort Hotel Voucher.pdf", "size", "450KB"),
                Map.of("docId", "DOC-1002", "type", "E-TICKET", "name", "Denpasar Airport Transfer Pass.pdf", "size", "220KB")
        );
        return ResponseEntity.ok(envelope("Authorized travel documents retrieved", docs, "req-be-tdocs"));
    }

    @PostMapping("/bookings/{bookingId}/documents")
    public ResponseEntity<?> addDocumentReference(@PathVariable String bookingId, @RequestBody Map<String, Object> body) {
        Map<String, Object> doc = new LinkedHashMap<>(body);
        doc.put("docId", "DOC-" + System.currentTimeMillis());
        doc.put("bookingId", bookingId);
        return ResponseEntity.ok(envelope("Document reference recorded", doc, "req-be-tdoc-new"));
    }

    // --- Cancellations, Refunds & Exceptions ---
    @GetMapping("/cancellations")
    public ResponseEntity<?> listCancellations() {
        return ResponseEntity.ok(envelope("Cancellations retrieved", store.getCancellationRequestsList(), "req-be-cans"));
    }

    @PostMapping("/cancellations")
    public ResponseEntity<?> createCancellation(@RequestBody Map<String, Object> body) {
        Map<String, Object> can = store.createCancellationRequest(body);
        return ResponseEntity.status(HttpStatus.CREATED).body(envelope("Cancellation request created", can, "req-be-can-new"));
    }

    @GetMapping("/cancellations/{cancellationId}")
    public ResponseEntity<?> getCancellation(@PathVariable String cancellationId) {
        Map<String, Object> can = store.getCancellationRequestsList().stream()
                .filter(c -> cancellationId.equalsIgnoreCase(String.valueOf(c.get("cancellationRequestId"))))
                .findFirst().orElse(null);
        return ResponseEntity.ok(envelope("Cancellation details retrieved", can, "req-be-can-get"));
    }

    @PostMapping("/cancellations/{cancellationId}/process")
    public ResponseEntity<?> processCancellation(@PathVariable String cancellationId, @RequestBody Map<String, Object> body) {
        Map<String, Object> can = store.getCancellationRequestsList().stream()
                .filter(c -> cancellationId.equalsIgnoreCase(String.valueOf(c.get("cancellationRequestId"))))
                .findFirst().orElse(null);
        if (can != null) {
            can.put("status", "PROCESSED");
            can.put("refundAmount", body.getOrDefault("refundAmount", 15000));
        }
        store.recordAudit("TRAVEL_CANCELLATION_CONFIRMED", "cancellationId=" + cancellationId);
        return ResponseEntity.ok(envelope("Cancellation processed", can, "req-be-can-proc"));
    }

    @GetMapping("/refunds")
    public ResponseEntity<?> listRefunds() {
        return ResponseEntity.ok(envelope("Refund records retrieved", store.getRefundsList(), "req-be-refs"));
    }

    @GetMapping("/refunds/{refundReference}/status")
    public ResponseEntity<?> getRefundStatus(@PathVariable String refundReference) {
        Map<String, Object> ref = store.getRefundsList().stream()
                .filter(r -> refundReference.equalsIgnoreCase(String.valueOf(r.get("refundReference"))))
                .findFirst().orElse(null);
        return ResponseEntity.ok(envelope("Refund status retrieved", ref, "req-be-ref-stat"));
    }

    @GetMapping("/exceptions")
    public ResponseEntity<?> listExceptions() {
        return ResponseEntity.ok(envelope("Booking exceptions retrieved", store.getExceptionsList(), "req-be-excs"));
    }

    @PostMapping("/exceptions")
    public ResponseEntity<?> createException(@RequestBody Map<String, Object> body) {
        Map<String, Object> exc = store.createException(body);
        return ResponseEntity.status(HttpStatus.CREATED).body(envelope("Booking exception created", exc, "req-be-exc-new"));
    }

    @PostMapping("/exceptions/{exceptionId}/assign")
    public ResponseEntity<?> assignException(@PathVariable String exceptionId, @RequestBody Map<String, Object> body) {
        Map<String, Object> exc = store.findException(exceptionId);
        if (exc != null) exc.put("assignedTo", body.get("assignee"));
        return ResponseEntity.ok(envelope("Exception assigned", exc, "req-be-exc-assign"));
    }

    @PostMapping("/exceptions/{exceptionId}/resolve")
    public ResponseEntity<?> resolveException(@PathVariable String exceptionId, @RequestBody Map<String, Object> body) {
        Map<String, Object> exc = store.findException(exceptionId);
        if (exc != null) exc.put("status", "RESOLVED");
        return ResponseEntity.ok(envelope("Exception resolved", exc, "req-be-exc-res"));
    }
}
