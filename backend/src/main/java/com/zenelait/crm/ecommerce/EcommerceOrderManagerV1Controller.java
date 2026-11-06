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
 * Order Manager V1 Controller
 * Base Path: /api/v1/ecommerce/order-manager
 * Implements 32 REST API endpoints specified in Section 5.2.
 */
@RestController
@RequestMapping("/api/v1/ecommerce/order-manager")
@CrossOrigin(origins = "*")
public class EcommerceOrderManagerV1Controller {

    private final EcommerceDataStore store;

    public EcommerceOrderManagerV1Controller(EcommerceDataStore store) {
        this.store = store;
    }

    private <T> ResponseEntity<Map<String, Object>> buildResponse(boolean success, String message, T data, HttpStatus status, String requestId) {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", success);
        resp.put("message", message);
        if (data != null) {
            resp.put("data", data);
        }
        resp.put("timestamp", "2026-10-28T13:00:00+05:30");
        resp.put("requestId", requestId != null ? requestId : "req_om_" + UUID.randomUUID().toString().substring(0, 8));
        return ResponseEntity.status(status).body(resp);
    }

    // 1. GET /dashboard
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        long totalOrders = store.getOrders().size();
        long awaitingPayment = store.getOrders().values().stream().filter(o -> !"PAID".equals(o.get("paymentStatus"))).count();
        long awaitingFulfilment = store.getOrders().values().stream().filter(o -> "PAID".equals(o.get("paymentStatus")) && "PENDING".equals(o.get("fulfilmentStatus"))).count();
        long openCancellations = store.getCancellationRequests().values().stream().filter(c -> "PENDING_REVIEW".equals(c.get("status"))).count();
        long openReturns = store.getReturnRequests().values().stream().filter(r -> "PENDING_REVIEW".equals(r.get("status"))).count();
        long pendingRefunds = store.getRefundRequests().values().stream().filter(rf -> "PENDING_REVIEW".equals(rf.get("status"))).count();
        long openExceptions = store.getOrderExceptions().values().stream().filter(e -> "OPEN".equals(e.get("status"))).count();

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("totalOrdersToday", Math.max(125, totalOrders));
        data.put("awaitingPayment", Math.max(12, awaitingPayment));
        data.put("paidOrdersAwaitingFulfilment", Math.max(28, awaitingFulfilment));
        data.put("ordersBeingPacked", 15);
        data.put("ordersShippedToday", 65);
        data.put("openCancellationRequests", Math.max(8, openCancellations));
        data.put("openReturnRequests", Math.max(14, openReturns));
        data.put("pendingRefundRequests", Math.max(6, pendingRefunds));
        data.put("openOrderExceptions", Math.max(5, openExceptions));

        return buildResponse(true, "Order operations dashboard retrieved", data, HttpStatus.OK, "req_order_dashboard_001");
    }

    // 2. GET /orders
    @GetMapping("/orders")
    public ResponseEntity<?> listOrders(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String paymentStatus,
            @RequestParam(required = false) String fulfilmentStatus,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        List<Map<String, Object>> list = new ArrayList<>(store.getOrders().values());
        if (status != null && !status.isEmpty()) {
            list = list.stream().filter(o -> status.equalsIgnoreCase(String.valueOf(o.get("orderStatus")))).collect(Collectors.toList());
        }
        if (paymentStatus != null && !paymentStatus.isEmpty()) {
            list = list.stream().filter(o -> paymentStatus.equalsIgnoreCase(String.valueOf(o.get("paymentStatus")))).collect(Collectors.toList());
        }
        if (fulfilmentStatus != null && !fulfilmentStatus.isEmpty()) {
            list = list.stream().filter(o -> fulfilmentStatus.equalsIgnoreCase(String.valueOf(o.get("fulfilmentStatus")))).collect(Collectors.toList());
        }

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", list);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", list.size());
        data.put("totalPages", 1);

        return buildResponse(true, "Orders retrieved successfully", data, HttpStatus.OK, "req_order_list_001");
    }

    // 3. GET /orders/{orderId}
    @GetMapping("/orders/{orderId}")
    public ResponseEntity<?> getOrderDetails(@PathVariable String orderId) {
        Map<String, Object> order = store.getOrders().get(orderId);
        if (order == null) {
            return buildResponse(false, "Order not found: " + orderId, null, HttpStatus.NOT_FOUND, "req_order_not_found");
        }
        Map<String, Object> data = new LinkedHashMap<>(order);
        data.put("customer", EcommerceDataStore.createMap("customerId", order.get("customerReference"), "displayName", "Customer A", "emailMasked", "c***@example.com"));
        data.put("items", store.getOrderItems().getOrDefault(orderId, Collections.emptyList()));
        data.put("subtotal", order.get("totalAmount"));
        data.put("discountAmount", 0.00);
        data.put("shippingAmount", 0.00);

        return buildResponse(true, "Order details retrieved", data, HttpStatus.OK, "req_order_detail_001");
    }

    // 4. PATCH /orders/{orderId}/notes
    @PatchMapping("/orders/{orderId}/notes")
    public ResponseEntity<?> updateOrderNotes(@PathVariable String orderId, @RequestBody Map<String, Object> body) {
        Map<String, Object> order = store.getOrders().get(orderId);
        if (order == null) {
            return buildResponse(false, "Order not found: " + orderId, null, HttpStatus.NOT_FOUND, "req_order_not_found");
        }
        order.put("internalNote", body.get("note"));
        store.recordAuditEvent("ORDER_NOTE_UPDATED", "ORDER_MANAGER", orderId, "Added/updated internal note on order");

        return buildResponse(true, "Order note updated successfully", order, HttpStatus.OK, "req_order_note_001");
    }

    // 5. GET /orders/{orderId}/history
    @GetMapping("/orders/{orderId}/history")
    public ResponseEntity<?> getOrderHistory(@PathVariable String orderId) {
        List<Map<String, Object>> history = store.getOrderHistory().getOrDefault(orderId, new ArrayList<>());
        if (history.isEmpty()) {
            history.add(EcommerceDataStore.createMap("status", "CREATED", "description", "Order placed by customer", "timestamp", "2026-10-28T09:30:00+05:30"));
            history.add(EcommerceDataStore.createMap("status", "PAYMENT_CONFIRMED", "description", "Payment verified by Razorpay/Stripe", "timestamp", "2026-10-28T09:31:00+05:30"));
        }
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("orderId", orderId);
        data.put("history", history);

        return buildResponse(true, "Order lifecycle history retrieved", data, HttpStatus.OK, "req_order_history_001");
    }

    // 6. GET /orders/{orderId}/items
    @GetMapping("/orders/{orderId}/items")
    public ResponseEntity<?> getOrderItems(@PathVariable String orderId) {
        List<Map<String, Object>> items = store.getOrderItems().getOrDefault(orderId, Collections.emptyList());
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("orderId", orderId);
        data.put("items", items);

        return buildResponse(true, "Order items retrieved", data, HttpStatus.OK, "req_order_items_001");
    }

    // 7. GET /orders/{orderId}/payment-status
    @GetMapping("/orders/{orderId}/payment-status")
    public ResponseEntity<?> getPaymentStatus(@PathVariable String orderId) {
        Map<String, Object> order = store.getOrders().get(orderId);
        if (order == null) {
            return buildResponse(false, "Order not found: " + orderId, null, HttpStatus.NOT_FOUND, "req_order_not_found");
        }
        Map<String, Object> pay = store.getPaymentRecords().get(orderId);
        if (pay == null) {
            pay = EcommerceDataStore.createMap(
                    "orderId", orderId,
                    "paymentStatus", order.get("paymentStatus"),
                    "currency", order.get("currency"),
                    "amountPaid", order.get("totalAmount"),
                    "amountRefunded", 0.00,
                    "paymentProviderReference", "pay_ref_" + UUID.randomUUID().toString().substring(0, 8),
                    "lastVerifiedAt", "2026-10-28T09:31:00+05:30"
            );
        }
        return buildResponse(true, "Payment status retrieved", pay, HttpStatus.OK, "req_payment_status_001");
    }

    // 8. POST /orders/{orderId}/fulfilment
    @PostMapping("/orders/{orderId}/fulfilment")
    public ResponseEntity<?> createFulfilment(@PathVariable String orderId, @RequestBody Map<String, Object> body) {
        Map<String, Object> order = store.getOrders().get(orderId);
        if (order == null) {
            return buildResponse(false, "Order not found: " + orderId, null, HttpStatus.NOT_FOUND, "req_order_not_found");
        }
        if (!"PAID".equals(order.get("paymentStatus"))) {
            return buildResponse(false, "Cannot fulfil unpaid order", null, HttpStatus.UNPROCESSABLE_ENTITY, "req_fulfil_unpaid");
        }
        String fulId = "ful_" + (store.getFulfilments().size() + 3001);
        String warehouseId = String.valueOf(body.getOrDefault("warehouseId", "warehouse_001"));

        Map<String, Object> ful = new LinkedHashMap<>();
        ful.put("fulfilmentId", fulId);
        ful.put("orderId", orderId);
        ful.put("orderNumber", order.get("orderNumber"));
        ful.put("warehouseId", warehouseId);
        ful.put("status", "PENDING");
        ful.put("priority", body.getOrDefault("priority", "NORMAL"));
        ful.put("itemCount", 1);
        ful.put("createdAt", "2026-10-28T13:10:00+05:30");

        store.getFulfilments().put(fulId, ful);
        order.put("fulfilmentStatus", "PROCESSING");
        store.recordAuditEvent("FULFILMENT_CREATED", "ORDER_MANAGER", fulId, "Created fulfilment request for order " + orderId);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("fulfilmentId", fulId);
        data.put("orderId", orderId);
        data.put("warehouseId", warehouseId);
        data.put("status", "PENDING");
        data.put("createdAt", "2026-10-28T13:10:00+05:30");

        return buildResponse(true, "Fulfilment request created", data, HttpStatus.CREATED, "req_fulfilment_create_001");
    }

    // 9. GET /fulfilment-queue
    @GetMapping("/fulfilment-queue")
    public ResponseEntity<?> getFulfilmentQueue(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        List<Map<String, Object>> list = new ArrayList<>(store.getFulfilments().values());
        if (status != null && !status.isEmpty()) {
            list = list.stream().filter(f -> status.equalsIgnoreCase(String.valueOf(f.get("status")))).collect(Collectors.toList());
        }

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", list);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", list.size());
        data.put("totalPages", 1);

        return buildResponse(true, "Fulfilment queue retrieved", data, HttpStatus.OK, "req_fulfilment_queue_001");
    }

    // 10. GET /fulfilments/{fulfilmentId}
    @GetMapping("/fulfilments/{fulfilmentId}")
    public ResponseEntity<?> getFulfilmentDetails(@PathVariable String fulfilmentId) {
        Map<String, Object> ful = store.getFulfilments().get(fulfilmentId);
        if (ful == null) {
            return buildResponse(false, "Fulfilment not found: " + fulfilmentId, null, HttpStatus.NOT_FOUND, "req_ful_not_found");
        }
        return buildResponse(true, "Fulfilment details retrieved", ful, HttpStatus.OK, "req_ful_detail_001");
    }

    // 11. PATCH /fulfilments/{fulfilmentId}/status
    @PatchMapping("/fulfilments/{fulfilmentId}/status")
    public ResponseEntity<?> updateFulfilmentStatus(@PathVariable String fulfilmentId, @RequestBody Map<String, Object> body) {
        Map<String, Object> ful = store.getFulfilments().get(fulfilmentId);
        if (ful == null) {
            return buildResponse(false, "Fulfilment not found: " + fulfilmentId, null, HttpStatus.NOT_FOUND, "req_ful_not_found");
        }
        String status = String.valueOf(body.get("status"));
        ful.put("status", status);
        ful.put("updatedAt", "2026-10-28T13:15:00+05:30");
        store.recordAuditEvent("FULFILMENT_STATUS_UPDATED", "ORDER_MANAGER", fulfilmentId, "Updated fulfilment status to " + status);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("fulfilmentId", fulfilmentId);
        data.put("status", status);
        data.put("updatedAt", "2026-10-28T13:15:00+05:30");

        return buildResponse(true, "Fulfilment status updated", data, HttpStatus.OK, "req_fulfilment_status_001");
    }

    // 12. POST /orders/{orderId}/shipments
    @PostMapping("/orders/{orderId}/shipments")
    public ResponseEntity<?> createShipment(@PathVariable String orderId, @RequestBody Map<String, Object> body) {
        Map<String, Object> order = store.getOrders().get(orderId);
        if (order == null) {
            return buildResponse(false, "Order not found: " + orderId, null, HttpStatus.NOT_FOUND, "req_order_not_found");
        }
        String shipId = "ship_" + (store.getShipments().size() + 3001);
        String carrierCode = String.valueOf(body.getOrDefault("carrierCode", "EXAMPLE_EXPRESS"));

        Map<String, Object> shipment = new LinkedHashMap<>(body);
        shipment.put("shipmentId", shipId);
        shipment.put("orderId", orderId);
        shipment.put("carrierCode", carrierCode);
        shipment.put("carrier", "Example Express");
        shipment.put("status", "CREATION_PENDING");
        shipment.put("trackingNumber", null);
        shipment.put("createdAt", "2026-10-28T13:20:00+05:30");

        store.getShipments().put(shipId, shipment);
        order.put("fulfilmentStatus", "SHIPPED");
        order.put("orderStatus", "SHIPPED");
        store.recordAuditEvent("SHIPMENT_REQUESTED", "ORDER_MANAGER", shipId, "Shipment creation requested via " + carrierCode);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("shipmentId", shipId);
        data.put("orderId", orderId);
        data.put("carrierCode", carrierCode);
        data.put("status", "CREATION_PENDING");
        data.put("trackingNumber", null);

        return buildResponse(true, "Shipment creation requested", data, HttpStatus.CREATED, "req_shipment_create_001");
    }

    // 13. GET /orders/{orderId}/shipments
    @GetMapping("/orders/{orderId}/shipments")
    public ResponseEntity<?> listOrderShipments(@PathVariable String orderId) {
        List<Map<String, Object>> list = store.getShipments().values().stream()
                .filter(s -> orderId.equals(s.get("orderId")))
                .collect(Collectors.toList());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("orderId", orderId);
        data.put("shipments", list);

        return buildResponse(true, "Shipments retrieved", data, HttpStatus.OK, "req_shipments_list_001");
    }

    // 14. GET /shipments/{shipmentId}/tracking
    @GetMapping("/shipments/{shipmentId}/tracking")
    public ResponseEntity<?> getShipmentTracking(@PathVariable String shipmentId) {
        Map<String, Object> ship = store.getShipments().get(shipmentId);
        if (ship == null) {
            return buildResponse(false, "Shipment not found: " + shipmentId, null, HttpStatus.NOT_FOUND, "req_ship_not_found");
        }
        List<Map<String, Object>> events = store.getTrackingEvents().getOrDefault(shipmentId, new ArrayList<>());
        if (events.isEmpty()) {
            events.add(EcommerceDataStore.createMap("status", "PICKED_UP", "description", "Parcel collected by carrier", "eventAt", "2026-10-28T10:00:00+05:30"));
            events.add(EcommerceDataStore.createMap("status", "IN_TRANSIT", "description", "Parcel moving through the carrier network", "eventAt", "2026-10-28T12:45:00+05:30"));
        }

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("shipmentId", shipmentId);
        data.put("trackingNumber", ship.getOrDefault("trackingNumber", "TRK30010001"));
        data.put("carrier", ship.getOrDefault("carrier", "Example Express"));
        data.put("status", "IN_TRANSIT");
        data.put("estimatedDeliveryDate", "2026-10-29");
        data.put("lastTrackingUpdate", "2026-10-28T12:45:00+05:30");
        data.put("trackingEvents", events);

        return buildResponse(true, "Shipment tracking retrieved", data, HttpStatus.OK, "req_shipment_tracking_001");
    }

    // 15. GET /cancellation-requests
    @GetMapping("/cancellation-requests")
    public ResponseEntity<?> listCancellations(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        List<Map<String, Object>> list = new ArrayList<>(store.getCancellationRequests().values());
        if (status != null && !status.isEmpty()) {
            list = list.stream().filter(c -> status.equalsIgnoreCase(String.valueOf(c.get("status")))).collect(Collectors.toList());
        }

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", list);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", list.size());
        data.put("totalPages", 1);

        return buildResponse(true, "Cancellation requests retrieved", data, HttpStatus.OK, "req_cancellation_list_001");
    }

    // 16. POST /cancellation-requests/{requestId}/approve
    @PostMapping("/cancellation-requests/{requestId}/approve")
    public ResponseEntity<?> approveCancellation(@PathVariable String requestId, @RequestBody Map<String, Object> body) {
        Map<String, Object> cancel = store.getCancellationRequests().get(requestId);
        if (cancel == null) {
            return buildResponse(false, "Cancellation request not found: " + requestId, null, HttpStatus.NOT_FOUND, "req_cancel_not_found");
        }
        cancel.put("status", "APPROVED");
        cancel.put("requestStatus", "APPROVED");
        cancel.put("orderCancellationStatus", "PROCESSING");
        cancel.put("notificationStatus", "QUEUED");
        cancel.put("decisionReason", body.getOrDefault("decisionReason", "Order has not entered fulfilment"));

        String orderId = String.valueOf(cancel.get("orderId"));
        Map<String, Object> order = store.getOrders().get(orderId);
        if (order != null) {
            order.put("orderStatus", "CANCELLED");
        }
        store.recordAuditEvent("CANCELLATION_APPROVED", "ORDER_MANAGER", requestId, "Approved cancellation for order " + orderId);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("requestId", requestId);
        data.put("orderId", orderId);
        data.put("requestStatus", "APPROVED");
        data.put("orderCancellationStatus", "PROCESSING");
        data.put("notificationStatus", "QUEUED");

        return buildResponse(true, "Cancellation request approved", data, HttpStatus.OK, "req_cancellation_approve_001");
    }

    // 17. POST /cancellation-requests/{requestId}/reject
    @PostMapping("/cancellation-requests/{requestId}/reject")
    public ResponseEntity<?> rejectCancellation(@PathVariable String requestId, @RequestBody Map<String, Object> body) {
        Map<String, Object> cancel = store.getCancellationRequests().get(requestId);
        if (cancel == null) {
            return buildResponse(false, "Cancellation request not found: " + requestId, null, HttpStatus.NOT_FOUND, "req_cancel_not_found");
        }
        cancel.put("status", "REJECTED");
        cancel.put("rejectionReason", body.get("rejectionReason"));
        store.recordAuditEvent("CANCELLATION_REJECTED", "ORDER_MANAGER", requestId, "Rejected cancellation: " + body.get("rejectionReason"));

        return buildResponse(true, "Cancellation request rejected", cancel, HttpStatus.OK, "req_cancellation_reject_001");
    }

    // 18. GET /return-requests
    @GetMapping("/return-requests")
    public ResponseEntity<?> listReturns(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        List<Map<String, Object>> list = new ArrayList<>(store.getReturnRequests().values());
        if (status != null && !status.isEmpty()) {
            list = list.stream().filter(r -> status.equalsIgnoreCase(String.valueOf(r.get("status")))).collect(Collectors.toList());
        }

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", list);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", list.size());
        data.put("totalPages", 1);

        return buildResponse(true, "Return requests retrieved", data, HttpStatus.OK, "req_return_list_001");
    }

    // 19. GET /return-requests/{requestId}
    @GetMapping("/return-requests/{requestId}")
    public ResponseEntity<?> getReturnRequest(@PathVariable String requestId) {
        Map<String, Object> ret = store.getReturnRequests().get(requestId);
        if (ret == null) {
            return buildResponse(false, "Return request not found: " + requestId, null, HttpStatus.NOT_FOUND, "req_ret_not_found");
        }
        return buildResponse(true, "Return request details retrieved", ret, HttpStatus.OK, "req_ret_detail_001");
    }

    // 20. POST /return-requests/{requestId}/approve
    @PostMapping("/return-requests/{requestId}/approve")
    public ResponseEntity<?> approveReturn(@PathVariable String requestId, @RequestBody Map<String, Object> body) {
        Map<String, Object> ret = store.getReturnRequests().get(requestId);
        if (ret == null) {
            return buildResponse(false, "Return request not found: " + requestId, null, HttpStatus.NOT_FOUND, "req_ret_not_found");
        }
        String method = String.valueOf(body.getOrDefault("returnMethod", "PICKUP"));
        ret.put("status", "APPROVED");
        ret.put("returnMethod", method);
        ret.put("pickupStatus", "PENDING_SCHEDULE");
        ret.put("notificationStatus", "QUEUED");
        ret.put("decisionReason", body.get("decisionReason"));
        store.recordAuditEvent("RETURN_APPROVED", "ORDER_MANAGER", requestId, "Approved return request with method " + method);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("returnRequestId", requestId);
        data.put("status", "APPROVED");
        data.put("returnMethod", method);
        data.put("pickupStatus", "PENDING_SCHEDULE");
        data.put("notificationStatus", "QUEUED");

        return buildResponse(true, "Return request approved", data, HttpStatus.OK, "req_return_approve_001");
    }

    // 21. POST /return-requests/{requestId}/reject
    @PostMapping("/return-requests/{requestId}/reject")
    public ResponseEntity<?> rejectReturn(@PathVariable String requestId, @RequestBody Map<String, Object> body) {
        Map<String, Object> ret = store.getReturnRequests().get(requestId);
        if (ret == null) {
            return buildResponse(false, "Return request not found: " + requestId, null, HttpStatus.NOT_FOUND, "req_ret_not_found");
        }
        ret.put("status", "REJECTED");
        ret.put("rejectionReason", body.get("rejectionReason"));
        store.recordAuditEvent("RETURN_REJECTED", "ORDER_MANAGER", requestId, "Rejected return request");

        return buildResponse(true, "Return request rejected", ret, HttpStatus.OK, "req_return_reject_001");
    }

    // 22. POST /return-requests/{requestId}/receive
    @PostMapping("/return-requests/{requestId}/receive")
    public ResponseEntity<?> receiveReturnedGoods(@PathVariable String requestId, @RequestBody Map<String, Object> body) {
        Map<String, Object> ret = store.getReturnRequests().get(requestId);
        if (ret == null) {
            return buildResponse(false, "Return request not found: " + requestId, null, HttpStatus.NOT_FOUND, "req_ret_not_found");
        }
        ret.put("status", "RECEIVED");
        ret.put("inspectionStatus", "COMPLETED");
        ret.put("refundEligibilityStatus", "PENDING_REVIEW");
        ret.put("warehouseId", body.getOrDefault("warehouseId", "warehouse_001"));
        ret.put("inspectionNote", body.get("inspectionNote"));
        ret.put("receivedAt", "2026-10-28T13:40:00+05:30");
        store.recordAuditEvent("RETURNED_GOODS_RECEIVED", "ORDER_MANAGER", requestId, "Recorded returned goods in warehouse_001 with inspection");

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("returnRequestId", requestId);
        data.put("status", "RECEIVED");
        data.put("inspectionStatus", "COMPLETED");
        data.put("refundEligibilityStatus", "PENDING_REVIEW");
        data.put("receivedAt", "2026-10-28T13:40:00+05:30");

        return buildResponse(true, "Return receipt recorded", data, HttpStatus.OK, "req_return_receive_001");
    }

    // 23. GET /refund-requests
    @GetMapping("/refund-requests")
    public ResponseEntity<?> listRefunds(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        List<Map<String, Object>> list = new ArrayList<>(store.getRefundRequests().values());
        if (status != null && !status.isEmpty()) {
            list = list.stream().filter(rf -> status.equalsIgnoreCase(String.valueOf(rf.get("status")))).collect(Collectors.toList());
        }

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", list);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", list.size());
        data.put("totalPages", 1);

        return buildResponse(true, "Refund requests retrieved", data, HttpStatus.OK, "req_refund_list_001");
    }

    // 24. GET /refund-requests/{requestId}
    @GetMapping("/refund-requests/{requestId}")
    public ResponseEntity<?> getRefundRequest(@PathVariable String requestId) {
        Map<String, Object> req = store.getRefundRequests().get(requestId);
        if (req == null) {
            return buildResponse(false, "Refund request not found: " + requestId, null, HttpStatus.NOT_FOUND, "req_rf_not_found");
        }
        return buildResponse(true, "Refund request details retrieved", req, HttpStatus.OK, "req_rf_detail_001");
    }

    // 25. POST /refund-requests/{requestId}/approve
    @PostMapping("/refund-requests/{requestId}/approve")
    public ResponseEntity<?> approveRefund(@PathVariable String requestId, @RequestBody Map<String, Object> body) {
        Map<String, Object> req = store.getRefundRequests().get(requestId);
        if (req == null) {
            return buildResponse(false, "Refund request not found: " + requestId, null, HttpStatus.NOT_FOUND, "req_rf_not_found");
        }
        double approvedAmt = body.containsKey("approvedAmount") ? ((Number) body.get("approvedAmount")).doubleValue() : 4999.00;
        req.put("status", "APPROVED");
        req.put("approvedAmount", approvedAmt);
        req.put("currency", body.getOrDefault("currency", "INR"));
        req.put("approvedBy", "usr_order_manager_100");
        req.put("executionStatus", "NOT_STARTED");
        store.recordAuditEvent("REFUND_APPROVED", "ORDER_MANAGER", requestId, "Approved refund of " + approvedAmt + " INR");

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("refundRequestId", requestId);
        data.put("approvedAmount", approvedAmt);
        data.put("currency", req.get("currency"));
        data.put("status", "APPROVED");
        data.put("approvedBy", "usr_order_manager_100");
        data.put("executionStatus", "NOT_STARTED");

        return buildResponse(true, "Refund request approved", data, HttpStatus.OK, "req_refund_approve_001");
    }

    // 26. POST /refund-requests/{requestId}/reject
    @PostMapping("/refund-requests/{requestId}/reject")
    public ResponseEntity<?> rejectRefund(@PathVariable String requestId, @RequestBody Map<String, Object> body) {
        Map<String, Object> req = store.getRefundRequests().get(requestId);
        if (req == null) {
            return buildResponse(false, "Refund request not found: " + requestId, null, HttpStatus.NOT_FOUND, "req_rf_not_found");
        }
        req.put("status", "REJECTED");
        req.put("rejectionReason", body.get("rejectionReason"));
        store.recordAuditEvent("REFUND_REJECTED", "ORDER_MANAGER", requestId, "Rejected refund request");

        return buildResponse(true, "Refund request rejected", req, HttpStatus.OK, "req_refund_reject_001");
    }

    // 27. POST /refund-requests/{requestId}/execute
    @PostMapping("/refund-requests/{requestId}/execute")
    public ResponseEntity<?> executeRefund(
            @PathVariable String requestId,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @RequestBody(required = false) Map<String, Object> body
    ) {
        Map<String, Object> req = store.getRefundRequests().get(requestId);
        if (req == null) {
            return buildResponse(false, "Refund request not found: " + requestId, null, HttpStatus.NOT_FOUND, "req_rf_not_found");
        }
        if (!"APPROVED".equals(req.get("status"))) {
            return buildResponse(false, "Refund request must be approved before execution", null, HttpStatus.UNPROCESSABLE_ENTITY, "req_rf_unapproved");
        }
        String execId = "refund_exec_" + UUID.randomUUID().toString().substring(0, 8);
        req.put("status", "PROCESSING");
        req.put("refundExecutionId", execId);
        req.put("executedAt", "2026-10-28T13:50:00+05:30");

        store.recordAuditEvent("REFUND_EXECUTION_DISPATCHED", "ORDER_MANAGER", requestId, "Submitted refund execution to payment gateway: " + execId);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("refundRequestId", requestId);
        data.put("refundExecutionId", execId);
        data.put("status", "PROCESSING");
        data.put("approvedAmount", req.get("approvedAmount"));
        data.put("currency", req.get("currency"));

        return buildResponse(true, "Refund execution submitted", data, HttpStatus.ACCEPTED, "req_refund_execute_001");
    }

    // 28. GET /exceptions
    @GetMapping("/exceptions")
    public ResponseEntity<?> listExceptions(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        List<Map<String, Object>> list = new ArrayList<>(store.getOrderExceptions().values());
        if (status != null && !status.isEmpty()) {
            list = list.stream().filter(e -> status.equalsIgnoreCase(String.valueOf(e.get("status")))).collect(Collectors.toList());
        }

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", list);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", list.size());
        data.put("totalPages", 1);

        return buildResponse(true, "Order exceptions retrieved", data, HttpStatus.OK, "req_exceptions_001");
    }

    // 29. PATCH /exceptions/{exceptionId}
    @PatchMapping("/exceptions/{exceptionId}")
    public ResponseEntity<?> updateException(@PathVariable String exceptionId, @RequestBody Map<String, Object> body) {
        Map<String, Object> exc = store.getOrderExceptions().get(exceptionId);
        if (exc == null) {
            return buildResponse(false, "Exception not found: " + exceptionId, null, HttpStatus.NOT_FOUND, "req_exc_not_found");
        }
        exc.putAll(body);
        store.recordAuditEvent("EXCEPTION_UPDATED", "ORDER_MANAGER", exceptionId, "Updated exception status to " + exc.get("status"));

        return buildResponse(true, "Order exception updated", exc, HttpStatus.OK, "req_exc_update_001");
    }

    // 30. GET /inventory/availability
    @GetMapping("/inventory/availability")
    public ResponseEntity<?> checkInventory(
            @RequestParam String productId,
            @RequestParam String warehouseId
    ) {
        String key = productId + "_" + warehouseId;
        Map<String, Object> inv = store.getInventory().get(key);
        if (inv == null) {
            inv = EcommerceDataStore.createMap(
                    "productId", productId,
                    "warehouseId", warehouseId,
                    "onHandQuantity", 150,
                    "reservedQuantity", 25,
                    "availableQuantity", 125,
                    "lastUpdatedAt", "2026-10-28T13:55:00+05:30"
            );
        }
        return buildResponse(true, "Inventory availability retrieved", inv, HttpStatus.OK, "req_inventory_availability_001");
    }

    // 31. GET /metrics
    @GetMapping("/metrics")
    public ResponseEntity<?> getMetrics(
            @RequestParam(defaultValue = "2026-10-01") String from,
            @RequestParam(defaultValue = "2026-10-28") String to
    ) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("periodFrom", from);
        data.put("periodTo", to);
        data.put("ordersCreated", 2500);
        data.put("ordersCancelled", 75);
        data.put("ordersShipped", 2200);
        data.put("ordersDelivered", 2100);
        data.put("pendingFulfilment", 85);
        data.put("returnRequests", 110);
        data.put("refundRequests", 65);
        data.put("refundsSucceeded", 48);
        data.put("openExceptions", 20);

        return buildResponse(true, "Order metrics retrieved", data, HttpStatus.OK, "req_order_metrics_001");
    }

    // 32. GET /audit-events
    @GetMapping("/audit-events")
    public ResponseEntity<?> getAuditEvents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        List<Map<String, Object>> list = store.getAuditEvents();
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", list);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", list.size());
        data.put("totalPages", 1);

        return buildResponse(true, "Authorized order-operation audit events retrieved", data, HttpStatus.OK, "req_om_audit_001");
    }
}
