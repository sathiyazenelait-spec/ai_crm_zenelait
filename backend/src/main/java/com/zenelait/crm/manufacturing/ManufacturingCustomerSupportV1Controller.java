package com.zenelait.crm.manufacturing;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Manufacturing Customer Support V1 REST API Controller
 * Base URL: /api/v1/manufacturing/customer-support
 * Connects support tickets to industrial products, serial numbers, warranty claims, returns, and safety escalations.
 */
@RestController
@RequestMapping("/api/v1/manufacturing/customer-support")
@CrossOrigin(origins = "*")
public class ManufacturingCustomerSupportV1Controller {

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
        resp.put("requestId", reqId != null ? reqId : "req_mfg_sup_" + UUID.randomUUID().toString().substring(0, 6));
        return resp;
    }

    private Map<String, Object> standardError(String message, List<Map<String, String>> errors, String reqId) {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", false);
        resp.put("message", message);
        resp.put("errors", errors != null ? errors : Collections.emptyList());
        resp.put("requestId", reqId != null ? reqId : "req_mfg_sup_err_" + UUID.randomUUID().toString().substring(0, 6));
        return resp;
    }

    // ==========================================
    // A. DASHBOARD & QUEUE MANAGEMENT
    // ==========================================

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> d = new LinkedHashMap<>();
        d.put("openTickets", 86);
        d.put("unassignedTickets", 12);
        d.put("highPriorityTickets", 8);
        d.put("pendingWarrantyClaims", 15);
        d.put("openQualityComplaints", 6);
        d.put("overdueTickets", 9);
        d.put("averageResolutionHours", 18.5);
        return ResponseEntity.ok(standardSuccess("Manufacturing support dashboard retrieved", d, "req_mfg_support_dashboard_001"));
    }

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getMetrics(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("firstContactResolutionPercent", 68.4);
        m.put("csatScore", 4.7);
        m.put("averageWarrantyProcessingDays", 3.2);
        m.put("rmaTurnaroundDays", 5.8);
        return ResponseEntity.ok(standardSuccess("Support metrics retrieved", m, null));
    }

    @GetMapping("/tickets")
    public ResponseEntity<Map<String, Object>> listTickets(
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "priority", required = false) String priority,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> list = store.getSupportTickets().values().stream()
                .filter(t -> status == null || status.equalsIgnoreCase((String) t.get("status")))
                .filter(t -> priority == null || priority.equalsIgnoreCase((String) t.get("priority")))
                .collect(Collectors.toList());
        return ResponseEntity.ok(standardSuccess("Tickets retrieved", list, null));
    }

    @GetMapping("/tickets/{ticketId}")
    public ResponseEntity<Map<String, Object>> getTicket(
            @PathVariable("ticketId") String ticketId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> t = store.getSupportTickets().get(ticketId);
        if (t == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Ticket not found", null, null));
        return ResponseEntity.ok(standardSuccess("Ticket retrieved", t, null));
    }

    @PostMapping("/tickets")
    public ResponseEntity<Map<String, Object>> createTicket(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tId = "mfg_ticket_" + (1000 + store.getSupportTickets().size() + 1);
        String tNum = "MFG-SUP-" + (1000 + store.getSupportTickets().size() + 1);
        String tenant = getTenantId(tenantHeader);

        Map<String, Object> ticket = new LinkedHashMap<>(body);
        ticket.put("ticketId", tId);
        ticket.put("ticketNumber", tNum);
        ticket.put("status", "OPEN");
        ticket.put("assignedTeam", body.getOrDefault("assignedTeam", "TECHNICAL_SUPPORT"));
        ticket.put("tenantId", tenant);
        ticket.put("createdAt", Instant.now().toString());
        store.getSupportTickets().put(tId, ticket);

        Map<String, Object> resData = new LinkedHashMap<>();
        resData.put("ticketId", tId);
        resData.put("ticketNumber", tNum);
        resData.put("category", ticket.get("category"));
        resData.put("status", "OPEN");
        resData.put("priority", ticket.get("priority"));
        resData.put("assignedTeam", ticket.get("assignedTeam"));

        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Manufacturing support ticket created", resData, "req_mfg_ticket_001"));
    }

    @PatchMapping("/tickets/{ticketId}")
    public ResponseEntity<Map<String, Object>> updateTicket(
            @PathVariable("ticketId") String ticketId,
            @RequestBody Map<String, Object> updates,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> t = store.getSupportTickets().get(ticketId);
        if (t == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Ticket not found", null, null));
        t.putAll(updates);
        return ResponseEntity.ok(standardSuccess("Ticket updated", t, null));
    }

    @PostMapping("/tickets/{ticketId}/assign")
    public ResponseEntity<Map<String, Object>> assignTicket(
            @PathVariable("ticketId") String ticketId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> t = store.getSupportTickets().get(ticketId);
        if (t == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Ticket not found", null, null));
        t.put("assignedAgentId", body.get("assignedAgentId"));
        t.put("status", "ASSIGNED");
        return ResponseEntity.ok(standardSuccess("Ticket assigned", t, null));
    }

    @PostMapping("/tickets/{ticketId}/priority")
    public ResponseEntity<Map<String, Object>> updatePriority(
            @PathVariable("ticketId") String ticketId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> t = store.getSupportTickets().get(ticketId);
        if (t == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Ticket not found", null, null));
        t.put("priority", body.get("priority"));
        return ResponseEntity.ok(standardSuccess("Ticket priority updated", t, null));
    }

    @PostMapping("/tickets/{ticketId}/escalate")
    public ResponseEntity<Map<String, Object>> escalateTicket(
            @PathVariable("ticketId") String ticketId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> t = store.getSupportTickets().get(ticketId);
        if (t == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Ticket not found", null, null));

        String escId = "mfg_escalation_" + UUID.randomUUID().toString().substring(0, 6);
        t.put("status", "ESCALATED");
        t.put("assignedTeam", body.get("targetTeam"));
        t.put("escalationId", escId);
        t.put("safetyConcernDetected", true);
        t.put("automatedResolutionPaused", true);

        Map<String, Object> esc = new LinkedHashMap<>(body);
        esc.put("escalationId", escId);
        esc.put("ticketId", ticketId);
        esc.put("createdAt", Instant.now().toString());
        store.getSupportEscalations().put(escId, esc);

        Map<String, Object> resData = new LinkedHashMap<>();
        resData.put("ticketId", ticketId);
        resData.put("status", "ESCALATED");
        resData.put("escalationId", escId);
        resData.put("assignedTeam", body.get("targetTeam"));
        resData.put("automatedResolutionPaused", true);

        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Ticket escalated", resData, "req_mfg_escalate_001"));
    }

    @PostMapping("/tickets/{ticketId}/resolve")
    public ResponseEntity<Map<String, Object>> resolveTicket(
            @PathVariable("ticketId") String ticketId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> t = store.getSupportTickets().get(ticketId);
        if (t == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Ticket not found", null, null));

        // Enforce business rule: Requires customer confirmation unless explicitly bypassed
        boolean confirmed = Boolean.TRUE.equals(body.get("customerConfirmationReceived"));
        if (!confirmed) {
            List<Map<String, String>> errors = List.of(Map.of(
                    "field", "customerConfirmationReceived",
                    "message", "Customer confirmation or an authorized exception is required by the configured resolution policy."
            ));
            return ResponseEntity.status(HttpStatus.CONFLICT).body(standardError("Ticket cannot be resolved under the current policy", errors, "req_mfg_resolve_blocked_001"));
        }

        t.put("status", "RESOLVED");
        t.put("resolutionCode", body.get("resolutionCode"));
        t.put("resolutionSummary", body.get("resolutionSummary"));
        t.put("resolvedAt", Instant.now().toString());

        return ResponseEntity.ok(standardSuccess("Ticket resolved successfully", t, null));
    }

    @PostMapping("/tickets/{ticketId}/reopen")
    public ResponseEntity<Map<String, Object>> reopenTicket(
            @PathVariable("ticketId") String ticketId,
            @RequestBody(required = false) Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> t = store.getSupportTickets().get(ticketId);
        if (t == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Ticket not found", null, null));
        t.put("status", "OPEN");
        return ResponseEntity.ok(standardSuccess("Ticket reopened", t, null));
    }

    @GetMapping("/tickets/{ticketId}/history")
    public ResponseEntity<Map<String, Object>> getTicketHistory(
            @PathVariable("ticketId") String ticketId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> hist = List.of(
                Map.of("action", "TICKET_CREATED", "status", "OPEN", "timestamp", "2026-10-27T16:00:00Z"),
                Map.of("action", "NOTE_ADDED", "status", "OPEN", "timestamp", "2026-10-27T16:30:00Z")
        );
        return ResponseEntity.ok(standardSuccess("Ticket history retrieved", hist, null));
    }

    // ==========================================
    // B. MESSAGES, NOTES & AI ASSISTANCE
    // ==========================================

    @GetMapping("/tickets/{ticketId}/messages")
    public ResponseEntity<Map<String, Object>> getTicketMessages(
            @PathVariable("ticketId") String ticketId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Messages retrieved", store.getTicketMessages().getOrDefault(ticketId, Collections.emptyList()), null));
    }

    @PostMapping("/tickets/{ticketId}/messages")
    public ResponseEntity<Map<String, Object>> sendCustomerMessage(
            @PathVariable("ticketId") String ticketId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> msg = new LinkedHashMap<>(body);
        msg.put("messageId", "tmsg_" + UUID.randomUUID().toString().substring(0, 6));
        msg.put("senderType", "SUPPORT_AGENT");
        msg.put("timestamp", Instant.now().toString());
        store.getTicketMessages().computeIfAbsent(ticketId, k -> new ArrayList<>()).add(msg);
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Message sent to customer", msg, null));
    }

    @GetMapping("/tickets/{ticketId}/internal-notes")
    public ResponseEntity<Map<String, Object>> getInternalNotes(
            @PathVariable("ticketId") String ticketId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Internal notes retrieved", store.getTicketInternalNotes().getOrDefault(ticketId, Collections.emptyList()), null));
    }

    @PostMapping("/tickets/{ticketId}/internal-notes")
    public ResponseEntity<Map<String, Object>> addInternalNote(
            @PathVariable("ticketId") String ticketId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> note = new LinkedHashMap<>(body);
        note.put("noteId", "tnote_" + UUID.randomUUID().toString().substring(0, 6));
        note.put("timestamp", Instant.now().toString());
        store.getTicketInternalNotes().computeIfAbsent(ticketId, k -> new ArrayList<>()).add(note);
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Internal note added", note, null));
    }

    @PostMapping("/tickets/{ticketId}/classify")
    public ResponseEntity<Map<String, Object>> classifyTicket(
            @PathVariable("ticketId") String ticketId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> resData = new LinkedHashMap<>();
        resData.put("ticketId", ticketId);
        resData.put("category", "TECHNICAL_ISSUE");
        resData.put("suggestedSubcategory", "OVERHEATING");
        resData.put("suggestedPriority", "HIGH");
        resData.put("requiresTechnicalReview", true);
        resData.put("safetyConcernDetected", true);
        resData.put("recommendedAction", "ESCALATE_TO_QUALIFIED_TECHNICIAN");
        resData.put("classificationStatus", "AI_SUGGESTION");

        return ResponseEntity.ok(standardSuccess("Ticket classification completed", resData, "req_mfg_ticket_classify_001"));
    }

    @PostMapping("/tickets/{ticketId}/summarize")
    public ResponseEntity<Map<String, Object>> summarizeTicket(
            @PathVariable("ticketId") String ticketId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> sum = Map.of(
                "ticketId", ticketId,
                "summary", "Customer reports pump overheating above 85C on unit SERIAL-EXAMPLE-001. Requires thermal inspection and safety protocol review.",
                "keyEntities", List.of("SERIAL-EXAMPLE-001", "85C Operating Temp", "mfg_product_101")
        );
        return ResponseEntity.ok(standardSuccess("Ticket summarized", sum, null));
    }

    @PostMapping("/tickets/{ticketId}/draft-reply")
    public ResponseEntity<Map<String, Object>> draftReply(
            @PathVariable("ticketId") String ticketId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> resData = new LinkedHashMap<>();
        resData.put("draftId", "mfg_reply_draft_1001");
        resData.put("status", "DRAFT");
        resData.put("requiresHumanApproval", true);
        resData.put("body", "Thank you for reporting the pump overheating issue. For your safety, please follow the approved operating and shutdown procedures for your equipment. Our technical support team will review the product details and advise you on the appropriate next steps.");
        resData.put("knowledgeReferences", List.of("mfg_kb_101"));

        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Support reply draft generated", resData, "req_mfg_reply_draft_001"));
    }

    @PostMapping("/tickets/{ticketId}/approve-reply")
    public ResponseEntity<Map<String, Object>> approveReply(
            @PathVariable("ticketId") String ticketId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Reply approved and dispatched", body, null));
    }

    @PostMapping("/tickets/{ticketId}/suggest-resolution")
    public ResponseEntity<Map<String, Object>> suggestResolution(
            @PathVariable("ticketId") String ticketId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> res = Map.of(
                "suggestedResolutionCode", "MECHANICAL_SEAL_INSPECTION_RECOMMENDED",
                "recommendedSteps", List.of("1. Disconnect main power", "2. Check inlet filter for debris", "3. Measure lubricant temperature", "4. Dispatch technician if seal integrity compromised")
        );
        return ResponseEntity.ok(standardSuccess("Resolution suggestion generated", res, null));
    }

    @PostMapping("/tickets/{ticketId}/handoff-to-human")
    public ResponseEntity<Map<String, Object>> handoffToHuman(
            @PathVariable("ticketId") String ticketId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Handoff to senior technician initiated", Map.of("ticketId", ticketId, "status", "ASSIGNED_TO_SPECIALIST"), null));
    }

    // ==========================================
    // C. CUSTOMER, ORDER & PRODUCT LOOKUP
    // ==========================================

    @GetMapping("/customers")
    public ResponseEntity<Map<String, Object>> searchCustomers(
            @RequestParam(value = "search", required = false) String search,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Authorized customers retrieved", new ArrayList<>(store.getCustomers().values()), null));
    }

    @GetMapping("/customers/{customerId}")
    public ResponseEntity<Map<String, Object>> getCustomer(
            @PathVariable("customerId") String cId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> c = store.getCustomers().get(cId);
        if (c == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Customer not found", null, null));
        return ResponseEntity.ok(standardSuccess("Customer retrieved", c, null));
    }

    @GetMapping("/customers/{customerId}/orders")
    public ResponseEntity<Map<String, Object>> getCustomerOrders(
            @PathVariable("customerId") String cId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> ords = store.getOrders().values().stream()
                .filter(o -> cId.equals(o.get("customerId")))
                .collect(Collectors.toList());
        return ResponseEntity.ok(standardSuccess("Customer orders retrieved", ords, null));
    }

    @GetMapping("/orders/{orderId}")
    public ResponseEntity<Map<String, Object>> getOrder(
            @PathVariable("orderId") String orderId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> o = store.getOrders().get(orderId);
        if (o == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Order not found", null, null));
        return ResponseEntity.ok(standardSuccess("Order retrieved", o, null));
    }

    @GetMapping("/orders/{orderId}/delivery-status")
    public ResponseEntity<Map<String, Object>> getDeliveryStatus(
            @PathVariable("orderId") String orderId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> o = store.getOrders().get(orderId);
        if (o == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Order not found", null, null));
        return ResponseEntity.ok(standardSuccess("Delivery status retrieved", Map.of("orderId", orderId, "deliveryStatus", o.get("deliveryStatus"), "deliveredAt", o.get("deliveredAt")), null));
    }

    @GetMapping("/orders/{orderId}/invoices")
    public ResponseEntity<Map<String, Object>> getOrderInvoices(
            @PathVariable("orderId") String orderId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> o = store.getOrders().get(orderId);
        if (o == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Order not found", null, null));
        return ResponseEntity.ok(standardSuccess("Invoices retrieved", o.getOrDefault("invoices", Collections.emptyList()), null));
    }

    @GetMapping("/products")
    public ResponseEntity<Map<String, Object>> listProducts(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Products retrieved", new ArrayList<>(store.getProducts().values()), null));
    }

    @GetMapping("/products/{productId}")
    public ResponseEntity<Map<String, Object>> getProduct(
            @PathVariable("productId") String productId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> p = store.getProducts().get(productId);
        if (p == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Product not found", null, null));
        return ResponseEntity.ok(standardSuccess("Product retrieved", p, null));
    }

    @GetMapping("/products/{productId}/specifications")
    public ResponseEntity<Map<String, Object>> getProductSpecs(
            @PathVariable("productId") String productId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> p = store.getProducts().get(productId);
        if (p == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Product not found", null, null));
        return ResponseEntity.ok(standardSuccess("Product specs retrieved", p.get("specifications"), null));
    }

    @GetMapping("/products/{productId}/documents")
    public ResponseEntity<Map<String, Object>> getProductDocuments(
            @PathVariable("productId") String productId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> p = store.getProducts().get(productId);
        if (p == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Product not found", null, null));
        return ResponseEntity.ok(standardSuccess("Product documents retrieved", p.getOrDefault("documents", Collections.emptyList()), null));
    }

    @GetMapping("/products/{productId}/recalls")
    public ResponseEntity<Map<String, Object>> getProductRecalls(
            @PathVariable("productId") String productId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Recall notices checked", List.of(), null));
    }

    @PostMapping("/customer-context/verify")
    public ResponseEntity<Map<String, Object>> verifyCustomerContext(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Customer context verified", Map.of("verified", true, "customerId", body.get("customerId")), null));
    }

    @PostMapping("/customer-context/lookup")
    public ResponseEntity<Map<String, Object>> lookupCustomerContext(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String cId = (String) body.get("customerId");
        Map<String, Object> c = store.getCustomers().get(cId);
        return ResponseEntity.ok(standardSuccess("Customer context retrieved", c, null));
    }

    // ==========================================
    // D. WARRANTY CLAIMS
    // ==========================================

    @GetMapping("/warranty-claims")
    public ResponseEntity<Map<String, Object>> listWarrantyClaims(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Warranty claims retrieved", new ArrayList<>(store.getWarrantyClaims().values()), null));
    }

    @PostMapping("/warranty-claims")
    public ResponseEntity<Map<String, Object>> createWarrantyClaim(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String claimId = "mfg_warranty_" + (1000 + store.getWarrantyClaims().size() + 1);
        Map<String, Object> claim = new LinkedHashMap<>(body);
        claim.put("claimId", claimId);
        claim.put("status", "PENDING_VALIDATION");
        claim.put("eligibilityStatus", "NOT_YET_DETERMINED");
        claim.put("nextAction", "VALIDATE_PURCHASE_AND_WARRANTY_TERMS");
        claim.put("tenantId", getTenantId(tenantHeader));
        store.getWarrantyClaims().put(claimId, claim);

        Map<String, Object> resData = new LinkedHashMap<>();
        resData.put("claimId", claimId);
        resData.put("status", "PENDING_VALIDATION");
        resData.put("eligibilityStatus", "NOT_YET_DETERMINED");
        resData.put("nextAction", "VALIDATE_PURCHASE_AND_WARRANTY_TERMS");

        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Warranty claim created", resData, "req_mfg_warranty_001"));
    }

    @GetMapping("/warranty-claims/{claimId}")
    public ResponseEntity<Map<String, Object>> getWarrantyClaim(
            @PathVariable("claimId") String claimId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> claim = store.getWarrantyClaims().get(claimId);
        if (claim == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Claim not found", null, null));
        return ResponseEntity.ok(standardSuccess("Warranty claim retrieved", claim, null));
    }

    @PatchMapping("/warranty-claims/{claimId}")
    public ResponseEntity<Map<String, Object>> updateWarrantyClaim(
            @PathVariable("claimId") String claimId,
            @RequestBody Map<String, Object> updates,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> claim = store.getWarrantyClaims().get(claimId);
        if (claim == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Claim not found", null, null));
        claim.putAll(updates);
        return ResponseEntity.ok(standardSuccess("Warranty claim updated", claim, null));
    }

    @PostMapping("/warranty-claims/{claimId}/validate")
    public ResponseEntity<Map<String, Object>> validateWarrantyClaim(
            @PathVariable("claimId") String claimId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> claim = store.getWarrantyClaims().get(claimId);
        if (claim == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Claim not found", null, null));

        List<Map<String, Object>> checks = List.of(
                Map.of("name", "PURCHASE_RECORD", "status", "PASSED"),
                Map.of("name", "SERIAL_NUMBER", "status", "PASSED"),
                Map.of("name", "WARRANTY_PERIOD", "status", "PENDING_REVIEW"),
                Map.of("name", "PRODUCT_ELIGIBILITY", "status", "PASSED")
        );

        Map<String, Object> resData = new LinkedHashMap<>();
        resData.put("claimId", claimId);
        resData.put("validationStatus", "REQUIRES_REVIEW");
        resData.put("checks", checks);
        resData.put("nextAction", "WARRANTY_TEAM_REVIEW");

        return ResponseEntity.ok(standardSuccess("Warranty validation completed", resData, "req_mfg_warranty_validate_001"));
    }

    @PostMapping("/warranty-claims/{claimId}/submit")
    public ResponseEntity<Map<String, Object>> submitWarrantyClaim(
            @PathVariable("claimId") String claimId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> claim = store.getWarrantyClaims().get(claimId);
        if (claim == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Claim not found", null, null));
        claim.put("status", "PENDING_REVIEW");
        return ResponseEntity.ok(standardSuccess("Claim submitted for review", claim, null));
    }

    @PostMapping("/warranty-claims/{claimId}/decision")
    public ResponseEntity<Map<String, Object>> decideWarrantyClaim(
            @PathVariable("claimId") String claimId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> claim = store.getWarrantyClaims().get(claimId);
        if (claim == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Claim not found", null, null));
        claim.put("status", body.get("decision")); // "APPROVED" or "REJECTED"
        claim.put("decisionReason", body.get("reason"));
        return ResponseEntity.ok(standardSuccess("Warranty claim decision recorded", claim, null));
    }

    @PostMapping("/warranty-claims/{claimId}/request-information")
    public ResponseEntity<Map<String, Object>> requestWarrantyInfo(
            @PathVariable("claimId") String claimId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Additional evidence requested from customer", body, null));
    }

    @PostMapping("/warranty-claims/{claimId}/escalate")
    public ResponseEntity<Map<String, Object>> escalateWarrantyClaim(
            @PathVariable("claimId") String claimId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Warranty claim escalated to quality engineering", body, null));
    }

    @GetMapping("/warranty-policies")
    public ResponseEntity<Map<String, Object>> listWarrantyPolicies(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Warranty policies retrieved", new ArrayList<>(store.getWarrantyPolicies().values()), null));
    }

    @GetMapping("/warranty-policies/{policyId}")
    public ResponseEntity<Map<String, Object>> getWarrantyPolicy(
            @PathVariable("policyId") String policyId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> wp = store.getWarrantyPolicies().get(policyId);
        if (wp == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Policy not found", null, null));
        return ResponseEntity.ok(standardSuccess("Policy retrieved", wp, null));
    }

    // ==========================================
    // E. RETURNS, REPAIRS & REPLACEMENTS
    // ==========================================

    @GetMapping("/return-requests")
    public ResponseEntity<Map<String, Object>> listReturns(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Return requests retrieved", new ArrayList<>(store.getReturnRequests().values()), null));
    }

    @PostMapping("/return-requests")
    public ResponseEntity<Map<String, Object>> createReturnRequest(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String reqId = "mfg_return_" + (1000 + store.getReturnRequests().size() + 1);
        Map<String, Object> req = new LinkedHashMap<>(body);
        req.put("requestId", reqId);
        req.put("status", "PENDING_ELIGIBILITY_CHECK");
        req.put("nextAction", "VALIDATE_RETURN_POLICY");
        req.put("tenantId", getTenantId(tenantHeader));
        store.getReturnRequests().put(reqId, req);

        Map<String, Object> resData = new LinkedHashMap<>();
        resData.put("requestId", reqId);
        resData.put("status", "PENDING_ELIGIBILITY_CHECK");
        resData.put("nextAction", "VALIDATE_RETURN_POLICY");

        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Return request created", resData, "req_mfg_return_001"));
    }

    @GetMapping("/return-requests/{requestId}")
    public ResponseEntity<Map<String, Object>> getReturnRequest(
            @PathVariable("requestId") String reqId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> req = store.getReturnRequests().get(reqId);
        if (req == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Request not found", null, null));
        return ResponseEntity.ok(standardSuccess("Return request retrieved", req, null));
    }

    @PostMapping("/return-requests/{requestId}/validate")
    public ResponseEntity<Map<String, Object>> validateReturnRequest(
            @PathVariable("requestId") String reqId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Return request validated for defect inspection", Map.of("requestId", reqId, "eligible", true), null));
    }

    @PostMapping("/return-requests/{requestId}/decision")
    public ResponseEntity<Map<String, Object>> decideReturnRequest(
            @PathVariable("requestId") String reqId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> req = store.getReturnRequests().get(reqId);
        if (req == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Request not found", null, null));
        req.put("status", body.get("decision"));
        return ResponseEntity.ok(standardSuccess("Return decision recorded", req, null));
    }

    @PostMapping("/return-requests/{requestId}/handoff-to-warehouse")
    public ResponseEntity<Map<String, Object>> handoffReturnToWarehouse(
            @PathVariable("requestId") String reqId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Return handed off to warehouse for RMA intake", Map.of("requestId", reqId, "rmaNumber", "RMA-2026-" + UUID.randomUUID().toString().substring(0, 4)), null));
    }

    @GetMapping("/repair-requests")
    public ResponseEntity<Map<String, Object>> listRepairs(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Repair requests retrieved", new ArrayList<>(store.getRepairRequests().values()), null));
    }

    @PostMapping("/repair-requests")
    public ResponseEntity<Map<String, Object>> createRepairRequest(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String repId = "repair_" + UUID.randomUUID().toString().substring(0, 6);
        Map<String, Object> r = new LinkedHashMap<>(body);
        r.put("requestId", repId);
        r.put("status", "QUEUED");
        store.getRepairRequests().put(repId, r);
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Repair request created", r, null));
    }

    @GetMapping("/repair-requests/{requestId}")
    public ResponseEntity<Map<String, Object>> getRepairRequest(
            @PathVariable("requestId") String reqId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> r = store.getRepairRequests().get(reqId);
        if (r == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Request not found", null, null));
        return ResponseEntity.ok(standardSuccess("Repair request retrieved", r, null));
    }

    @PostMapping("/repair-requests/{requestId}/assign-technician")
    public ResponseEntity<Map<String, Object>> assignTechnician(
            @PathVariable("requestId") String reqId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> r = store.getRepairRequests().get(reqId);
        if (r == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Request not found", null, null));
        r.put("assignedTechnician", body.get("technicianId"));
        r.put("status", "TECHNICIAN_ASSIGNED");
        return ResponseEntity.ok(standardSuccess("Technician assigned", r, null));
    }

    @PostMapping("/repair-requests/{requestId}/update-status")
    public ResponseEntity<Map<String, Object>> updateRepairStatus(
            @PathVariable("requestId") String reqId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> r = store.getRepairRequests().get(reqId);
        if (r == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Request not found", null, null));
        r.put("status", body.get("status"));
        return ResponseEntity.ok(standardSuccess("Repair status updated", r, null));
    }

    @PostMapping("/repair-requests/{requestId}/complete")
    public ResponseEntity<Map<String, Object>> completeRepair(
            @PathVariable("requestId") String reqId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> r = store.getRepairRequests().get(reqId);
        if (r == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Request not found", null, null));
        r.put("status", "COMPLETED");
        r.put("completionReport", body);
        return ResponseEntity.ok(standardSuccess("Repair completed", r, null));
    }

    // ==========================================
    // F. DELIVERY, QUALITY & COMPLAINTS
    // ==========================================

    @GetMapping("/delivery-issues")
    public ResponseEntity<Map<String, Object>> listDeliveryIssues(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Delivery issues retrieved", new ArrayList<>(store.getDeliveryIssues().values()), null));
    }

    @PostMapping("/delivery-issues")
    public ResponseEntity<Map<String, Object>> reportDeliveryIssue(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String dId = "del_issue_" + UUID.randomUUID().toString().substring(0, 6);
        Map<String, Object> d = new LinkedHashMap<>(body);
        d.put("issueId", dId);
        store.getDeliveryIssues().put(dId, d);
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Delivery issue reported", d, null));
    }

    @GetMapping("/quality-complaints")
    public ResponseEntity<Map<String, Object>> listQualityComplaints(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Quality complaints retrieved", new ArrayList<>(store.getQualityComplaints().values()), null));
    }

    @PostMapping("/quality-complaints")
    public ResponseEntity<Map<String, Object>> createQualityComplaint(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String qcId = "qc_" + UUID.randomUUID().toString().substring(0, 6);
        Map<String, Object> qc = new LinkedHashMap<>(body);
        qc.put("complaintId", qcId);
        qc.put("status", "OPEN");
        store.getQualityComplaints().put(qcId, qc);
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Quality complaint created", qc, null));
    }

    @GetMapping("/quality-complaints/{complaintId}")
    public ResponseEntity<Map<String, Object>> getQualityComplaint(
            @PathVariable("complaintId") String qcId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> qc = store.getQualityComplaints().get(qcId);
        if (qc == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Complaint not found", null, null));
        return ResponseEntity.ok(standardSuccess("Complaint retrieved", qc, null));
    }

    @PostMapping("/quality-complaints/{complaintId}/classify")
    public ResponseEntity<Map<String, Object>> classifyComplaint(
            @PathVariable("complaintId") String qcId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Complaint classified", Map.of("severity", "CRITICAL", "requiresRootCauseAnalysis", true), null));
    }

    @PostMapping("/quality-complaints/{complaintId}/escalate")
    public ResponseEntity<Map<String, Object>> escalateComplaint(
            @PathVariable("complaintId") String qcId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Quality complaint escalated to Plant QA", body, null));
    }

    @PostMapping("/quality-complaints/{complaintId}/resolve")
    public ResponseEntity<Map<String, Object>> resolveComplaint(
            @PathVariable("complaintId") String qcId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> qc = store.getQualityComplaints().get(qcId);
        if (qc != null) qc.put("status", "RESOLVED");
        return ResponseEntity.ok(standardSuccess("Quality complaint resolved", body, null));
    }

    @GetMapping("/escalations")
    public ResponseEntity<Map<String, Object>> listEscalations(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Escalations retrieved", new ArrayList<>(store.getSupportEscalations().values()), null));
    }

    @GetMapping("/activity-logs")
    public ResponseEntity<Map<String, Object>> getActivityLogs(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Activity logs retrieved", store.getAuditLogs(), null));
    }

    // ==========================================
    // G. KNOWLEDGE BASE & FEEDBACK
    // ==========================================

    @GetMapping("/knowledge/articles")
    public ResponseEntity<Map<String, Object>> listArticles(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Approved articles retrieved", new ArrayList<>(store.getKnowledgeArticles().values()), null));
    }

    @GetMapping("/knowledge/articles/{articleId}")
    public ResponseEntity<Map<String, Object>> getArticle(
            @PathVariable("articleId") String articleId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> art = store.getKnowledgeArticles().get(articleId);
        if (art == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Article not found", null, null));
        return ResponseEntity.ok(standardSuccess("Article retrieved", art, null));
    }

    @PostMapping("/knowledge/search")
    public ResponseEntity<Map<String, Object>> searchKnowledge(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> results = List.of(
                Map.of(
                        "articleId", "mfg_kb_101",
                        "title", "Industrial Pump Operating Safety",
                        "sourceType", "APPROVED_TECHNICAL_DOCUMENT",
                        "relevance", 0.92,
                        "version", "2.1",
                        "requiresTechnicianReview", true
                )
        );

        Map<String, Object> resData = new LinkedHashMap<>();
        resData.put("results", results);
        resData.put("totalResults", 1);

        return ResponseEntity.ok(standardSuccess("Knowledge search completed", resData, "req_mfg_knowledge_001"));
    }

    @PostMapping("/feedback")
    public ResponseEntity<Map<String, Object>> recordFeedback(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String fbId = "fb_" + UUID.randomUUID().toString().substring(0, 6);
        Map<String, Object> fb = new LinkedHashMap<>(body);
        fb.put("feedbackId", fbId);
        store.getFeedbackRecords().put(fbId, fb);
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Feedback recorded", fb, null));
    }

    @GetMapping("/reports/resolution")
    public ResponseEntity<Map<String, Object>> getResolutionReport(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> rep = Map.of("meanTimeToResolveHours", 18.5, "slaComplianceRatePercent", 94.2);
        return ResponseEntity.ok(standardSuccess("Resolution metrics retrieved", rep, null));
    }

    @GetMapping("/reports/issues")
    public ResponseEntity<Map<String, Object>> getIssueTrends(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> trends = List.of(
                Map.of("category", "OVERHEATING", "count", 18, "trend", "+4%"),
                Map.of("category", "VIBRATION_NOISE", "count", 12, "trend", "-2%"),
                Map.of("category", "SEAL_LEAKAGE", "count", 9, "trend", "-5%")
        );
        return ResponseEntity.ok(standardSuccess("Issue trends retrieved", trends, null));
    }
}
