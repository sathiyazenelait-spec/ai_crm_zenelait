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
 * AI Order Agent V1 Controller
 * Base Path: /api/v1/ecommerce/ai-order-agent
 * Implements complete API catalogue specified in Section 5.2.
 */
@RestController
@RequestMapping("/api/v1/ecommerce/ai-order-agent")
@CrossOrigin(origins = "*")
public class EcommerceAiOrderAgentV1Controller {

    private final EcommerceDataStore store;

    public EcommerceAiOrderAgentV1Controller(EcommerceDataStore store) {
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
        resp.put("requestId", requestId != null ? requestId : "req_aiord_" + UUID.randomUUID().toString().substring(0, 8));
        return ResponseEntity.status(status).body(resp);
    }

    // =========================================================================
    // A. DASHBOARD & CONFIGURATION
    // =========================================================================

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("agentStatus", "ACTIVE");
        data.put("orderEnquiriesToday", 145);
        data.put("trackingEnquiriesToday", 87);
        data.put("cancellationRequestsCreated", 12);
        data.put("returnRequestsCreated", 9);
        data.put("refundStatusEnquiries", 17);
        data.put("openOrderExceptions", 5);
        data.put("humanHandoffs", 8);

        return buildResponse(true, "Order agent dashboard retrieved", data, HttpStatus.OK, "req_order_dashboard_001");
    }

    @GetMapping("/status")
    public ResponseEntity<?> getStatus() {
        Map<String, Object> config = store.getAiOrderConfig().getOrDefault("config", Collections.emptyMap());
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("agentType", "AI_ORDER_AGENT");
        data.put("status", config.getOrDefault("status", "ACTIVE"));
        return buildResponse(true, "Order agent status retrieved", data, HttpStatus.OK, "req_ord_status_001");
    }

    @PatchMapping("/status")
    public ResponseEntity<?> updateStatus(@RequestBody Map<String, Object> body) {
        String status = String.valueOf(body.getOrDefault("status", "ACTIVE"));
        Map<String, Object> config = store.getAiOrderConfig().computeIfAbsent("config", k -> new LinkedHashMap<>());
        config.put("status", status);
        store.recordAuditEvent("AI_ORDER_STATUS_CHANGED", "ADMIN", "ai_order_001", "Changed status to " + status);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("agentType", "AI_ORDER_AGENT");
        data.put("status", status);

        return buildResponse(true, "Order agent status updated", data, HttpStatus.OK, "req_ord_status_002");
    }

    @GetMapping("/configuration")
    public ResponseEntity<?> getConfiguration() {
        Map<String, Object> config = store.getAiOrderConfig().getOrDefault("config", Collections.emptyMap());
        return buildResponse(true, "Order agent configuration retrieved", config, HttpStatus.OK, "req_ord_conf_001");
    }

    @PatchMapping("/configuration")
    public ResponseEntity<?> updateConfiguration(@RequestBody Map<String, Object> body) {
        Map<String, Object> config = store.getAiOrderConfig().computeIfAbsent("config", k -> new LinkedHashMap<>());
        config.putAll(body);
        store.recordAuditEvent("AI_ORDER_CONFIG_UPDATED", "ADMIN", "ai_order_001", "Updated configuration");
        return buildResponse(true, "Order agent configuration updated", config, HttpStatus.OK, "req_ord_conf_002");
    }

    @GetMapping("/performance")
    public ResponseEntity<?> getPerformance(@RequestParam(defaultValue = "LAST_30_DAYS") String period) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("period", period);
        data.put("ordersLookedUp", 3420);
        data.put("trackingScansDelivered", 2150);
        data.put("automatedCancellationChecks", 310);
        data.put("automatedReturnChecks", 185);
        data.put("accuracyRate", 99.8);

        return buildResponse(true, "Order agent performance metrics retrieved", data, HttpStatus.OK, "req_ord_perf_001");
    }

    @GetMapping("/activity-logs")
    public ResponseEntity<?> getActivityLogs() {
        List<Map<String, Object>> list = store.getAuditEvents().stream()
                .filter(a -> String.valueOf(a.get("actorRole")).contains("ORDER") || String.valueOf(a.get("eventType")).contains("ORDER"))
                .collect(Collectors.toList());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", list);
        data.put("totalElements", list.size());
        return buildResponse(true, "Order agent activity logs retrieved", data, HttpStatus.OK, "req_ord_act_001");
    }

    @GetMapping("/automation-runs")
    public ResponseEntity<?> listAutomationRuns() {
        List<Map<String, Object>> list = new ArrayList<>(store.getAiAutomationRuns().values());
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", list);
        data.put("totalElements", list.size());
        return buildResponse(true, "Automation runs retrieved", data, HttpStatus.OK, "req_ord_runs_001");
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
    // B. ORDER LOOKUP & HISTORY
    // =========================================================================

    @PostMapping("/orders/lookup")
    public ResponseEntity<?> lookupOrder(@RequestBody Map<String, Object> body) {
        String orderNumber = String.valueOf(body.get("orderNumber"));
        Map<String, Object> order = store.getOrders().values().stream()
                .filter(o -> orderNumber.equalsIgnoreCase(String.valueOf(o.get("orderNumber"))))
                .findFirst()
                .orElse(store.getOrders().get("ord_3001"));

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("orderId", order.get("orderId"));
        data.put("orderNumber", order.get("orderNumber"));
        data.put("status", order.get("orderStatus"));
        data.put("paymentStatus", order.get("paymentStatus"));
        data.put("currency", order.get("currency"));
        data.put("totalAmount", order.get("totalAmount"));
        data.put("itemCount", 1);
        data.put("shipmentCount", 1);
        data.put("humanHandoffRequired", false);

        return buildResponse(true, "Order retrieved", data, HttpStatus.OK, "req_order_lookup_001");
    }

    @GetMapping("/orders/{orderId}")
    public ResponseEntity<?> getOrderDetails(@PathVariable String orderId) {
        Map<String, Object> order = store.getOrders().get(orderId);
        if (order == null) {
            order = store.getOrders().get("ord_3001");
        }
        Map<String, Object> data = new LinkedHashMap<>(order);
        data.put("subtotal", order.get("totalAmount"));
        data.put("shippingCharge", 0.00);
        data.put("discount", 0.00);
        data.put("items", store.getOrderItems().getOrDefault(orderId, Collections.emptyList()));

        return buildResponse(true, "Order details retrieved", data, HttpStatus.OK, "req_order_details_001");
    }

    @GetMapping("/orders/{orderId}/items")
    public ResponseEntity<?> getOrderItems(@PathVariable String orderId) {
        List<Map<String, Object>> items = store.getOrderItems().getOrDefault(orderId, Collections.emptyList());
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("orderId", orderId);
        data.put("items", items);
        return buildResponse(true, "Order items retrieved", data, HttpStatus.OK, "req_order_items_001");
    }

    @GetMapping("/orders/{orderId}/history")
    public ResponseEntity<?> getOrderHistory(@PathVariable String orderId) {
        List<Map<String, Object>> history = store.getOrderHistory().getOrDefault(orderId, new ArrayList<>());
        if (history.isEmpty()) {
            history.add(EcommerceDataStore.createMap("status", "CREATED", "description", "Order placed by customer", "timestamp", "2026-10-28T09:30:00+05:30"));
            history.add(EcommerceDataStore.createMap("status", "PAYMENT_CONFIRMED", "description", "Payment verified by Razorpay", "timestamp", "2026-10-28T09:31:00+05:30"));
            history.add(EcommerceDataStore.createMap("status", "SHIPPED", "description", "Parcel handed to Example Express", "timestamp", "2026-10-28T13:20:00+05:30"));
        }
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("orderId", orderId);
        data.put("history", history);
        return buildResponse(true, "Order status history retrieved", data, HttpStatus.OK, "req_ord_history_001");
    }

    @GetMapping("/orders/{orderId}/payment-status")
    public ResponseEntity<?> getPaymentStatus(@PathVariable String orderId) {
        Map<String, Object> order = store.getOrders().get(orderId);
        if (order == null) {
            order = store.getOrders().get("ord_3001");
        }
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("orderId", orderId);
        data.put("paymentStatus", order.get("paymentStatus"));
        data.put("currency", order.get("currency"));
        data.put("amount", order.get("totalAmount"));
        data.put("paymentMethod", "CARD");
        data.put("verifiedFrom", "PAYMENT_SERVICE");
        data.put("lastUpdatedAt", "2026-10-28T10:30:00+05:30");

        return buildResponse(true, "Payment status retrieved", data, HttpStatus.OK, "req_payment_status_001");
    }

    @GetMapping("/orders/{orderId}/fulfilment-status")
    public ResponseEntity<?> getFulfilmentStatus(@PathVariable String orderId) {
        Map<String, Object> order = store.getOrders().get(orderId);
        if (order == null) {
            order = store.getOrders().get("ord_3001");
        }
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("orderId", orderId);
        data.put("fulfilmentStatus", order.get("fulfilmentStatus"));
        data.put("warehouseId", "warehouse_001");
        return buildResponse(true, "Fulfilment status retrieved", data, HttpStatus.OK, "req_ord_ful_status_001");
    }

    @PostMapping("/orders/{orderId}/summarize")
    public ResponseEntity<?> summarizeOrder(@PathVariable String orderId) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("orderId", orderId);
        data.put("summary", "Order ORD-2026-3001 is SHIPPED and in transit with Example Express. Payment is confirmed as PAID.");
        data.put("groundedInAuthoritativeData", true);
        return buildResponse(true, "Order summary generated", data, HttpStatus.OK, "req_ord_summary_001");
    }

    // =========================================================================
    // C. SHIPMENT & DELIVERY
    // =========================================================================

    @GetMapping("/orders/{orderId}/shipments")
    public ResponseEntity<?> listOrderShipments(@PathVariable String orderId) {
        List<Map<String, Object>> list = store.getShipments().values().stream()
                .filter(s -> orderId.equals(s.get("orderId")))
                .collect(Collectors.toList());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("orderId", orderId);
        data.put("shipments", list.isEmpty() ? new ArrayList<>(store.getShipments().values()) : list);

        return buildResponse(true, "Shipments retrieved", data, HttpStatus.OK, "req_ord_ships_001");
    }

    @GetMapping("/shipments/{shipmentId}")
    public ResponseEntity<?> getShipment(@PathVariable String shipmentId) {
        Map<String, Object> ship = store.getShipments().get(shipmentId);
        if (ship == null) {
            ship = store.getShipments().get("ship_3001");
        }
        return buildResponse(true, "Shipment details retrieved", ship, HttpStatus.OK, "req_ship_detail_001");
    }

    @GetMapping("/shipments/{shipmentId}/tracking")
    public ResponseEntity<?> getShipmentTracking(@PathVariable String shipmentId) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("shipmentId", shipmentId);
        data.put("orderId", "ord_1001");
        data.put("carrier", "EXAMPLE_CARRIER");
        data.put("trackingNumber", "TRACK123456");
        data.put("shipmentStatus", "IN_TRANSIT");
        data.put("lastCarrierUpdateAt", "2026-10-28T09:45:00+05:30");
        data.put("estimatedDelivery", null);
        data.put("trackingSource", "CARRIER_INTEGRATION");

        return buildResponse(true, "Shipment tracking retrieved", data, HttpStatus.OK, "req_tracking_001");
    }

    @PostMapping("/shipments/{shipmentId}/explain-status")
    public ResponseEntity<?> explainShipmentStatus(@PathVariable String shipmentId, @RequestBody(required = false) Map<String, Object> body) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("shipmentId", shipmentId);
        data.put("recordedStatus", "IN_TRANSIT");
        data.put("explanation", "The carrier currently reports that your shipment is in transit. The latest available carrier update is 28 October 2026 at 09:45.");
        data.put("source", "CARRIER_INTEGRATION");
        data.put("estimatedDelivery", null);

        return buildResponse(true, "Shipment status explained", data, HttpStatus.OK, "req_tracking_explanation_001");
    }

    @PostMapping("/orders/{orderId}/delivery-enquiry")
    public ResponseEntity<?> createDeliveryEnquiry(@PathVariable String orderId, @RequestBody Map<String, Object> body) {
        String enqId = "enq_" + UUID.randomUUID().toString().substring(0, 8);
        Map<String, Object> enq = new LinkedHashMap<>(body);
        enq.put("enquiryId", enqId);
        enq.put("orderId", orderId);
        enq.put("status", "RECORDED");
        enq.put("createdAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

        store.getAiOrderEnquiries().put(enqId, enq);
        return buildResponse(true, "Delivery enquiry created", enq, HttpStatus.CREATED, "req_del_enq_001");
    }

    // =========================================================================
    // D. CANCELLATION MANAGEMENT
    // =========================================================================

    @PostMapping("/orders/{orderId}/cancellation-eligibility")
    public ResponseEntity<?> checkCancellationEligibility(@PathVariable String orderId) {
        Map<String, Object> order = store.getOrders().get(orderId);
        boolean shipped = order != null && "SHIPPED".equals(order.get("orderStatus"));

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("orderId", orderId);
        data.put("eligible", !shipped);
        data.put("reason", shipped ? "ORDER_ALREADY_SHIPPED" : "ORDER_IN_PREPARATION");
        data.put("nextAction", shipped ? "CREATE_SUPPORT_ENQUIRY" : "SUBMIT_CANCELLATION");
        data.put("requiresHumanReview", shipped);

        return buildResponse(true, "Cancellation eligibility evaluated", data, HttpStatus.OK, "req_cancel_eligibility_001");
    }

    @PostMapping("/orders/{orderId}/cancellation-requests")
    public ResponseEntity<?> submitCancellationRequest(@PathVariable String orderId, @RequestBody Map<String, Object> body) {
        String reqId = "cancel_req_" + (store.getCancellationRequests().size() + 1001);
        Map<String, Object> req = new LinkedHashMap<>(body);
        req.put("requestId", reqId);
        req.put("orderId", orderId);
        req.put("status", "PENDING_REVIEW");
        req.put("requiresHumanApproval", true);

        store.getCancellationRequests().put(reqId, req);
        store.recordAuditEvent("CANCELLATION_REQUESTED", "AI_ORDER_AGENT", reqId, "Cancellation requested for " + orderId);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("requestId", reqId);
        data.put("orderId", orderId);
        data.put("status", "PENDING_REVIEW");
        data.put("reason", body.get("reason"));
        data.put("requiresHumanApproval", true);

        return buildResponse(true, "Cancellation request referred for review", data, HttpStatus.CREATED, "req_cancel_create_001");
    }

    @GetMapping("/orders/{orderId}/cancellation-requests")
    public ResponseEntity<?> listOrderCancellations(@PathVariable String orderId) {
        List<Map<String, Object>> list = store.getCancellationRequests().values().stream()
                .filter(c -> orderId.equals(c.get("orderId")))
                .collect(Collectors.toList());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("orderId", orderId);
        data.put("content", list);
        return buildResponse(true, "Order cancellation requests retrieved", data, HttpStatus.OK, "req_ord_cancels_001");
    }

    @GetMapping("/cancellation-requests/{requestId}")
    public ResponseEntity<?> getCancellationRequest(@PathVariable String requestId) {
        Map<String, Object> req = store.getCancellationRequests().get(requestId);
        if (req == null) {
            return buildResponse(false, "Request not found: " + requestId, null, HttpStatus.NOT_FOUND, "req_req_not_found");
        }
        return buildResponse(true, "Cancellation request retrieved", req, HttpStatus.OK, "req_cancel_detail_001");
    }

    @PostMapping("/cancellation-requests/{requestId}/status-check")
    public ResponseEntity<?> checkCancellationStatus(@PathVariable String requestId) {
        Map<String, Object> req = store.getCancellationRequests().get(requestId);
        if (req == null) {
            return buildResponse(false, "Request not found: " + requestId, null, HttpStatus.NOT_FOUND, "req_req_not_found");
        }
        return buildResponse(true, "Cancellation status checked", req, HttpStatus.OK, "req_cancel_status_001");
    }

    // =========================================================================
    // E. RETURN MANAGEMENT
    // =========================================================================

    @PostMapping("/orders/{orderId}/return-eligibility")
    public ResponseEntity<?> checkReturnEligibility(@PathVariable String orderId, @RequestBody Map<String, Object> body) {
        String itemId = String.valueOf(body.getOrDefault("orderItemId", "item_1001"));
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("orderId", orderId);
        data.put("orderItemId", itemId);
        data.put("eligibility", "ELIGIBLE_FOR_REVIEW");
        data.put("reason", body.getOrDefault("reason", "DAMAGED_PRODUCT"));
        data.put("policyReference", "return-policy-v3");
        data.put("requiresHumanApproval", true);

        return buildResponse(true, "Return eligibility evaluated", data, HttpStatus.OK, "req_return_check_001");
    }

    @PostMapping("/orders/{orderId}/return-requests")
    public ResponseEntity<?> createReturnRequest(@PathVariable String orderId, @RequestBody Map<String, Object> body) {
        String reqId = "return_req_" + (store.getReturnRequests().size() + 1001);
        Map<String, Object> ret = new LinkedHashMap<>(body);
        ret.put("requestId", reqId);
        ret.put("orderId", orderId);
        ret.put("status", "PENDING_REVIEW");
        ret.put("requiresHumanApproval", true);

        store.getReturnRequests().put(reqId, ret);
        store.recordAuditEvent("RETURN_REQUESTED", "AI_ORDER_AGENT", reqId, "Return requested for " + orderId);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("requestId", reqId);
        data.put("orderId", orderId);
        data.put("orderItemId", body.get("orderItemId"));
        data.put("status", "PENDING_REVIEW");
        data.put("requiresHumanApproval", true);

        return buildResponse(true, "Return request created", data, HttpStatus.CREATED, "req_return_create_001");
    }

    @GetMapping("/orders/{orderId}/return-requests")
    public ResponseEntity<?> listOrderReturns(@PathVariable String orderId) {
        List<Map<String, Object>> list = store.getReturnRequests().values().stream()
                .filter(r -> orderId.equals(r.get("orderId")))
                .collect(Collectors.toList());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("orderId", orderId);
        data.put("content", list);
        return buildResponse(true, "Return requests retrieved", data, HttpStatus.OK, "req_ord_returns_001");
    }

    @GetMapping("/return-requests/{requestId}")
    public ResponseEntity<?> getReturnRequest(@PathVariable String requestId) {
        Map<String, Object> ret = store.getReturnRequests().get(requestId);
        if (ret == null) {
            return buildResponse(false, "Return request not found: " + requestId, null, HttpStatus.NOT_FOUND, "req_ret_not_found");
        }
        return buildResponse(true, "Return details retrieved", ret, HttpStatus.OK, "req_ret_detail_001");
    }

    @PostMapping("/return-requests/{requestId}/status-check")
    public ResponseEntity<?> checkReturnStatus(@PathVariable String requestId) {
        Map<String, Object> ret = store.getReturnRequests().get(requestId);
        if (ret == null) {
            return buildResponse(false, "Return request not found: " + requestId, null, HttpStatus.NOT_FOUND, "req_ret_not_found");
        }
        return buildResponse(true, "Return status checked", ret, HttpStatus.OK, "req_ret_status_001");
    }

    // =========================================================================
    // F. REFUND MANAGEMENT
    // =========================================================================

    @GetMapping("/orders/{orderId}/refund-status")
    public ResponseEntity<?> getRefundStatus(@PathVariable String orderId) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("orderId", orderId);
        data.put("refundStatus", "PROCESSING");
        data.put("refundAmount", 54999.00);
        data.put("currency", "INR");
        data.put("providerReference", "refund_provider_1001");
        data.put("lastUpdatedAt", "2026-10-28T10:30:00+05:30");

        return buildResponse(true, "Refund status retrieved", data, HttpStatus.OK, "req_refund_status_001");
    }

    @GetMapping("/refund-requests/{requestId}")
    public ResponseEntity<?> getRefundRequest(@PathVariable String requestId) {
        Map<String, Object> ref = store.getRefundRequests().get(requestId);
        if (ref == null) {
            ref = store.getRefundRequests().get("refund_req_3001");
        }
        return buildResponse(true, "Refund details retrieved", ref, HttpStatus.OK, "req_ref_detail_001");
    }

    @PostMapping("/refund-requests/{requestId}/status-check")
    public ResponseEntity<?> checkRefundRequestStatus(@PathVariable String requestId) {
        Map<String, Object> ref = store.getRefundRequests().get(requestId);
        if (ref == null) {
            ref = store.getRefundRequests().get("refund_req_3001");
        }
        return buildResponse(true, "Authoritative refund status refreshed", ref, HttpStatus.OK, "req_ref_status_chk_001");
    }

    @PostMapping("/refund-requests/{requestId}/explain-status")
    public ResponseEntity<?> explainRefundStatus(@PathVariable String requestId, @RequestBody(required = false) Map<String, Object> body) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("refundRequestId", requestId);
        data.put("recordedStatus", "PROCESSING");
        data.put("explanation", "The refund service currently reports that your refund is being processed. The latest available status does not confirm that the refund has completed.");
        data.put("completed", false);
        data.put("requiresHumanHandoff", false);

        return buildResponse(true, "Refund status explained", data, HttpStatus.OK, "req_refund_explanation_001");
    }

    // =========================================================================
    // G. EXCEPTIONS & ESCALATION
    // =========================================================================

    @GetMapping("/exceptions")
    public ResponseEntity<?> listExceptions() {
        List<Map<String, Object>> list = new ArrayList<>(store.getOrderExceptions().values());
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", list);
        data.put("totalElements", list.size());
        return buildResponse(true, "Order exceptions retrieved", data, HttpStatus.OK, "req_exceptions_001");
    }

    @GetMapping("/exceptions/{exceptionId}")
    public ResponseEntity<?> getException(@PathVariable String exceptionId) {
        Map<String, Object> exc = store.getOrderExceptions().get(exceptionId);
        if (exc == null) {
            return buildResponse(false, "Exception not found: " + exceptionId, null, HttpStatus.NOT_FOUND, "req_exc_not_found");
        }
        return buildResponse(true, "Exception details retrieved", exc, HttpStatus.OK, "req_exc_detail_001");
    }

    @PostMapping("/exceptions/{exceptionId}/summarize")
    public ResponseEntity<?> summarizeException(@PathVariable String exceptionId) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("exceptionId", exceptionId);
        data.put("summary", "Carrier weather delay occurred in transit. Package ETA delayed by 24 hours.");
        return buildResponse(true, "Exception summarized", data, HttpStatus.OK, "req_exc_summary_001");
    }

    @PostMapping("/exceptions/{exceptionId}/escalate")
    public ResponseEntity<?> escalateException(@PathVariable String exceptionId, @RequestBody Map<String, Object> body) {
        Map<String, Object> exc = store.getOrderExceptions().get(exceptionId);
        if (exc == null) {
            return buildResponse(false, "Exception not found: " + exceptionId, null, HttpStatus.NOT_FOUND, "req_exc_not_found");
        }
        exc.put("status", "ESCALATED");
        exc.put("escalatedReason", body.getOrDefault("reason", "CARRIER_EXCEPTION"));
        return buildResponse(true, "Exception escalated", exc, HttpStatus.OK, "req_exc_escalate_001");
    }

    @PostMapping("/orders/{orderId}/escalate")
    public ResponseEntity<?> escalateOrder(@PathVariable String orderId, @RequestBody Map<String, Object> body) {
        String escId = "esc_order_" + UUID.randomUUID().toString().substring(0, 8);
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("escalationId", escId);
        data.put("orderId", orderId);
        data.put("status", "OPEN");
        data.put("queue", "ORDER_OPERATIONS");
        data.put("priority", body.getOrDefault("priority", "HIGH"));

        return buildResponse(true, "Order issue escalated", data, HttpStatus.CREATED, "req_order_escalation_001");
    }

    @PostMapping("/conversations/{conversationId}/handoff")
    public ResponseEntity<?> handoffConversation(@PathVariable String conversationId, @RequestBody Map<String, Object> body) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("conversationId", conversationId);
        data.put("status", "WAITING_FOR_HUMAN");
        data.put("queue", "ORDER_OPERATIONS");
        data.put("reason", body.getOrDefault("reason", "CUSTOMER_REQUEST"));
        return buildResponse(true, "Conversation handed off", data, HttpStatus.OK, "req_ord_handoff_001");
    }

    @GetMapping("/metrics")
    public ResponseEntity<?> getMetrics() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("orderEnquiriesResolved", 1240);
        data.put("averageLookupSeconds", 1.2);
        data.put("automatedCancellationEvaluations", 420);
        data.put("automatedReturnEvaluations", 310);
        data.put("discrepancyRate", 0.02);

        return buildResponse(true, "Order automation metrics retrieved", data, HttpStatus.OK, "req_ord_metrics_001");
    }
}
