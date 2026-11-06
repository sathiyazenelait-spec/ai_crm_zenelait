package com.zenelait.crm.manufacturing;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Manufacturing Dealer Manager V1 REST API Controller
 * Base URL: /api/v1/manufacturing/dealer-manager
 * Oversees authorized dealers, territory distribution, dealer-specific pricing, and channel performance.
 */
@RestController
@RequestMapping("/api/v1/manufacturing/dealer-manager")
@CrossOrigin(origins = "*")
public class ManufacturingDealerManagerV1Controller {

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
        resp.put("requestId", reqId != null ? reqId : "req_dealer_" + UUID.randomUUID().toString().substring(0, 6));
        return resp;
    }

    private Map<String, Object> standardError(String message, List<Map<String, String>> errors, String reqId) {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", false);
        resp.put("message", message);
        resp.put("errors", errors != null ? errors : Collections.emptyList());
        resp.put("requestId", reqId != null ? reqId : "req_dealer_err_" + UUID.randomUUID().toString().substring(0, 6));
        return resp;
    }

    // ==========================================
    // A. DASHBOARD & REPORTING
    // ==========================================

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> d = new LinkedHashMap<>();
        d.put("totalAuthorizedDealers", 28);
        d.put("activeDistributors", 24);
        d.put("pendingVerificationDealers", 3);
        d.put("territoriesCovered", 8);
        d.put("quarterlyChannelRevenueInr", 14200000.00);
        d.put("pendingPricingRequests", 4);
        d.put("totalOpenEscalations", 2);
        return ResponseEntity.ok(standardSuccess("Dealer operations dashboard retrieved", d, "req_dealer_dash_001"));
    }

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getMetrics(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("averageDealerOrderValue", 650000.00);
        m.put("channelSalesGrowthQuarterlyPercent", 16.5);
        m.put("averageSettlementCycleDays", 32);
        m.put("dealerRetentionRatePercent", 94.2);
        return ResponseEntity.ok(standardSuccess("Dealer and channel KPIs retrieved", m, null));
    }

    @GetMapping("/reports/dealer-performance")
    public ResponseEntity<Map<String, Object>> getDealerPerformanceReport(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> list = List.of(
                Map.of("dealerId", "mfg_dealer_1001", "businessName", "Southern Industrial Distributors", "revenue", 1800000.00, "achievementPercent", 71, "status", "ACTIVE"),
                Map.of("dealerId", "mfg_dealer_1002", "businessName", "Western Machinery Network", "revenue", 2400000.00, "achievementPercent", 92, "status", "ACTIVE")
        );
        return ResponseEntity.ok(standardSuccess("Dealer performance report retrieved", list, null));
    }

    @GetMapping("/reports/territory-performance")
    public ResponseEntity<Map<String, Object>> getTerritoryPerformanceReport(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> list = List.of(
                Map.of("territoryId", "territory_south_01", "name", "South India - Industrial Corridor", "dealersCount", 12, "salesInr", 5800000.00),
                Map.of("territoryId", "territory_west_01", "name", "West India - Manufacturing Belt", "dealersCount", 16, "salesInr", 8400000.00)
        );
        return ResponseEntity.ok(standardSuccess("Territory performance report retrieved", list, null));
    }

    @GetMapping("/reports/product-performance")
    public ResponseEntity<Map<String, Object>> getDealerProductPerformance(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> list = List.of(
                Map.of("category", "INDUSTRIAL_PUMP", "unitsDistributed", 340, "channelRevenue", 3400000.00),
                Map.of("category", "INDUSTRIAL_MOTOR", "unitsDistributed", 120, "channelRevenue", 5400000.00)
        );
        return ResponseEntity.ok(standardSuccess("Dealer sales by product retrieved", list, null));
    }

    @GetMapping("/reports/order-performance")
    public ResponseEntity<Map<String, Object>> getOrderPerformance(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> ord = Map.of("totalDealerOrders", 94, "onTimeFulfilmentRatePercent", 96.2, "averageLeadTimeDays", 12.5);
        return ResponseEntity.ok(standardSuccess("Dealer order metrics retrieved", ord, null));
    }

    @GetMapping("/reports/credit-exposure")
    public ResponseEntity<Map<String, Object>> getCreditExposure(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> ce = Map.of("totalAllocatedCreditInr", 45000000.00, "utilizedCreditInr", 18500000.00, "utilizationPercent", 41.1);
        return ResponseEntity.ok(standardSuccess("Authorized dealer credit exposure retrieved", ce, null));
    }

    @GetMapping("/reports/overdue-payments")
    public ResponseEntity<Map<String, Object>> getOverduePayments(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> list = List.of(
                Map.of("dealerId", "mfg_dealer_1001", "businessName", "Southern Industrial Distributors", "overdueAmountInr", 150000.00, "daysOverdue", 14)
        );
        return ResponseEntity.ok(standardSuccess("Outstanding payment report retrieved", list, null));
    }

    @GetMapping("/activity-logs")
    public ResponseEntity<Map<String, Object>> getActivityLogs(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Dealer management audit history retrieved", store.getAuditLogs(), null));
    }

    // ==========================================
    // B. DEALER ONBOARDING & MANAGEMENT
    // ==========================================

    @GetMapping("/dealers")
    public ResponseEntity<Map<String, Object>> listDealers(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "status", required = false) String status,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> items = store.getDealers().values().stream()
                .filter(d -> status == null || status.equalsIgnoreCase((String) d.get("status")))
                .filter(d -> search == null || ((String) d.get("businessName")).toLowerCase().contains(search.toLowerCase()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(standardSuccess("Dealers retrieved", items, null));
    }

    @PostMapping("/dealers")
    public ResponseEntity<Map<String, Object>> registerDealer(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String dealerId = "mfg_dealer_" + (1000 + store.getDealers().size() + 1);
        String tenant = getTenantId(tenantHeader);

        Map<String, Object> dealer = new LinkedHashMap<>(body);
        dealer.put("dealerId", dealerId);
        dealer.put("status", "PENDING_VERIFICATION");
        dealer.put("verificationStatus", "NOT_SUBMITTED");
        dealer.put("tenantId", tenant);
        dealer.put("createdAt", Instant.now().toString());
        store.getDealers().put(dealerId, dealer);
        store.addAuditLog("DEALER", dealerId, "DEALER_REGISTERED", "dealer_manager", tenant);

        Map<String, Object> resData = new LinkedHashMap<>();
        resData.put("dealerId", dealerId);
        resData.put("businessName", dealer.get("businessName"));
        resData.put("status", "PENDING_VERIFICATION");
        resData.put("verificationStatus", "NOT_SUBMITTED");
        resData.put("requestedTerritoryId", dealer.get("requestedTerritoryId"));

        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Dealer registered", resData, "req_dealer_create_001"));
    }

    @GetMapping("/dealers/{dealerId}")
    public ResponseEntity<Map<String, Object>> getDealer(
            @PathVariable("dealerId") String dealerId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> d = store.getDealers().get(dealerId);
        if (d == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Dealer not found", null, null));
        return ResponseEntity.ok(standardSuccess("Dealer retrieved", d, null));
    }

    @PatchMapping("/dealers/{dealerId}")
    public ResponseEntity<Map<String, Object>> updateDealer(
            @PathVariable("dealerId") String dealerId,
            @RequestBody Map<String, Object> updates,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> d = store.getDealers().get(dealerId);
        if (d == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Dealer not found", null, null));
        d.putAll(updates);
        return ResponseEntity.ok(standardSuccess("Dealer updated", d, null));
    }

    @PostMapping("/dealers/{dealerId}/submit-verification")
    public ResponseEntity<Map<String, Object>> submitVerification(
            @PathVariable("dealerId") String dealerId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> d = store.getDealers().get(dealerId);
        if (d == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Dealer not found", null, null));

        d.put("verificationStatus", "PENDING_REVIEW");
        d.put("verificationSubmission", body);

        Map<String, Object> resData = new LinkedHashMap<>();
        resData.put("dealerId", dealerId);
        resData.put("verificationStatus", "PENDING_REVIEW");
        resData.put("reviewReference", "dealer_review_" + UUID.randomUUID().toString().substring(0, 6));

        return ResponseEntity.status(HttpStatus.ACCEPTED).body(standardSuccess("Dealer verification submitted", resData, "req_dealer_verify_001"));
    }

    @GetMapping("/dealers/{dealerId}/verification")
    public ResponseEntity<Map<String, Object>> getVerificationStatus(
            @PathVariable("dealerId") String dealerId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> d = store.getDealers().get(dealerId);
        if (d == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Dealer not found", null, null));
        return ResponseEntity.ok(standardSuccess("Verification status retrieved", Map.of("dealerId", dealerId, "verificationStatus", d.get("verificationStatus")), null));
    }

    @PostMapping("/dealers/{dealerId}/verification-decision")
    public ResponseEntity<Map<String, Object>> verificationDecision(
            @PathVariable("dealerId") String dealerId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> d = store.getDealers().get(dealerId);
        if (d == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Dealer not found", null, null));

        String decision = (String) body.get("decision"); // "APPROVE" or "REJECT"
        if ("APPROVE".equalsIgnoreCase(decision)) {
            d.put("verificationStatus", "VERIFIED");
            d.put("status", "PENDING_ACTIVATION");
        } else {
            d.put("verificationStatus", "REJECTED");
            d.put("status", "REJECTED");
        }
        d.put("verificationComment", body.get("comment"));

        Map<String, Object> resData = new LinkedHashMap<>();
        resData.put("dealerId", dealerId);
        resData.put("verificationStatus", d.get("verificationStatus"));
        resData.put("dealerStatus", d.get("status"));

        return ResponseEntity.ok(standardSuccess("Dealer verification decision recorded", resData, "req_dealer_decision_001"));
    }

    @PostMapping("/dealers/{dealerId}/activate")
    public ResponseEntity<Map<String, Object>> activateDealer(
            @PathVariable("dealerId") String dealerId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> d = store.getDealers().get(dealerId);
        if (d == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Dealer not found", null, null));

        if (!"VERIFIED".equalsIgnoreCase((String) d.get("verificationStatus"))) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(standardError("Cannot activate unverified dealer", List.of(Map.of("field", "verificationStatus", "message", "Dealer must be verified before activation.")), null));
        }
        d.put("status", "ACTIVE");
        return ResponseEntity.ok(standardSuccess("Dealer activated successfully", d, null));
    }

    @PostMapping("/dealers/{dealerId}/suspend")
    public ResponseEntity<Map<String, Object>> suspendDealer(
            @PathVariable("dealerId") String dealerId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> d = store.getDealers().get(dealerId);
        if (d == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Dealer not found", null, null));
        d.put("status", "SUSPENDED");
        d.put("suspensionReason", body.get("reason"));
        return ResponseEntity.ok(standardSuccess("Dealer suspended", d, null));
    }

    @PostMapping("/dealers/{dealerId}/reactivate")
    public ResponseEntity<Map<String, Object>> reactivateDealer(
            @PathVariable("dealerId") String dealerId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> d = store.getDealers().get(dealerId);
        if (d == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Dealer not found", null, null));
        d.put("status", "ACTIVE");
        return ResponseEntity.ok(standardSuccess("Dealer reactivated", d, null));
    }

    @GetMapping("/dealers/{dealerId}/contacts")
    public ResponseEntity<Map<String, Object>> getContacts(
            @PathVariable("dealerId") String dealerId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Dealer contacts retrieved", store.getDealerContacts().getOrDefault(dealerId, Collections.emptyList()), null));
    }

    @PostMapping("/dealers/{dealerId}/contacts")
    public ResponseEntity<Map<String, Object>> addContact(
            @PathVariable("dealerId") String dealerId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> contact = new LinkedHashMap<>(body);
        contact.put("contactId", "dc_" + UUID.randomUUID().toString().substring(0, 6));
        store.getDealerContacts().computeIfAbsent(dealerId, k -> new ArrayList<>()).add(contact);
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Contact added", contact, null));
    }

    @PatchMapping("/dealers/{dealerId}/contacts/{contactId}")
    public ResponseEntity<Map<String, Object>> updateContact(
            @PathVariable("dealerId") String dealerId,
            @PathVariable("contactId") String contactId,
            @RequestBody Map<String, Object> updates,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> list = store.getDealerContacts().get(dealerId);
        if (list != null) {
            for (Map<String, Object> c : list) {
                if (contactId.equals(c.get("contactId"))) {
                    c.putAll(updates);
                    return ResponseEntity.ok(standardSuccess("Contact updated", c, null));
                }
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Contact not found", null, null));
    }

    @GetMapping("/dealers/{dealerId}/documents")
    public ResponseEntity<Map<String, Object>> getDocuments(
            @PathVariable("dealerId") String dealerId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Dealer documents retrieved", store.getDealerDocuments().getOrDefault(dealerId, Collections.emptyList()), null));
    }

    @PostMapping("/dealers/{dealerId}/documents")
    public ResponseEntity<Map<String, Object>> addDocument(
            @PathVariable("dealerId") String dealerId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> doc = new LinkedHashMap<>(body);
        doc.put("documentId", "doc_" + UUID.randomUUID().toString().substring(0, 6));
        store.getDealerDocuments().computeIfAbsent(dealerId, k -> new ArrayList<>()).add(doc);
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Document registered", doc, null));
    }

    // ==========================================
    // C. TERRITORY & ASSIGNMENT MANAGEMENT
    // ==========================================

    @GetMapping("/territories")
    public ResponseEntity<Map<String, Object>> listTerritories(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Territories retrieved", new ArrayList<>(store.getTerritories().values()), null));
    }

    @PostMapping("/territories")
    public ResponseEntity<Map<String, Object>> createTerritory(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tId = "territory_" + UUID.randomUUID().toString().substring(0, 6);
        Map<String, Object> t = new LinkedHashMap<>(body);
        t.put("territoryId", tId);
        t.put("status", "ACTIVE");
        t.put("tenantId", getTenantId(tenantHeader));
        store.getTerritories().put(tId, t);
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Territory created", t, null));
    }

    @GetMapping("/territories/{territoryId}")
    public ResponseEntity<Map<String, Object>> getTerritory(
            @PathVariable("territoryId") String territoryId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> t = store.getTerritories().get(territoryId);
        if (t == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Territory not found", null, null));
        return ResponseEntity.ok(standardSuccess("Territory retrieved", t, null));
    }

    @PatchMapping("/territories/{territoryId}")
    public ResponseEntity<Map<String, Object>> updateTerritory(
            @PathVariable("territoryId") String territoryId,
            @RequestBody Map<String, Object> updates,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> t = store.getTerritories().get(territoryId);
        if (t == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Territory not found", null, null));
        t.putAll(updates);
        return ResponseEntity.ok(standardSuccess("Territory updated", t, null));
    }

    @GetMapping("/territories/{territoryId}/dealers")
    public ResponseEntity<Map<String, Object>> getTerritoryDealers(
            @PathVariable("territoryId") String territoryId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> dList = store.getDealers().values().stream()
                .filter(d -> territoryId.equals(d.get("requestedTerritoryId")))
                .collect(Collectors.toList());
        return ResponseEntity.ok(standardSuccess("Assigned territory dealers retrieved", dList, null));
    }

    @PostMapping("/territories/{territoryId}/dealers")
    public ResponseEntity<Map<String, Object>> assignDealerToTerritory(
            @PathVariable("territoryId") String territoryId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String dealerId = (String) body.get("dealerId");
        Map<String, Object> d = store.getDealers().get(dealerId);
        if (d == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Dealer not found", null, null));

        String assignmentId = "territory_assignment_" + UUID.randomUUID().toString().substring(0, 6);
        d.put("assignedTerritoryId", territoryId);

        Map<String, Object> resData = new LinkedHashMap<>();
        resData.put("assignmentId", assignmentId);
        resData.put("territoryId", territoryId);
        resData.put("dealerId", dealerId);
        resData.put("status", "PENDING_ACTIVATION");

        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Territory assignment created", resData, "req_dealer_territory_001"));
    }

    @DeleteMapping("/territories/{territoryId}/dealers/{dealerId}")
    public ResponseEntity<Map<String, Object>> removeDealerFromTerritory(
            @PathVariable("territoryId") String territoryId,
            @PathVariable("dealerId") String dealerId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> d = store.getDealers().get(dealerId);
        if (d != null) d.remove("assignedTerritoryId");
        return ResponseEntity.ok(standardSuccess("Dealer assignment removed", Map.of("dealerId", dealerId), null));
    }

    @GetMapping("/territory-assignments")
    public ResponseEntity<Map<String, Object>> getTerritoryAssignments(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Territory assignments retrieved", Collections.emptyList(), null));
    }

    @PostMapping("/territory-assignments/bulk")
    public ResponseEntity<Map<String, Object>> bulkAssignTerritory(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Bulk assigned dealers to territory", body, null));
    }

    // ==========================================
    // D. DEALER PRICING & AGREEMENTS
    // ==========================================

    @GetMapping("/price-lists")
    public ResponseEntity<Map<String, Object>> listPriceLists(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Approved price lists retrieved", new ArrayList<>(store.getPriceLists().values()), null));
    }

    @GetMapping("/dealers/{dealerId}/price-lists")
    public ResponseEntity<Map<String, Object>> getDealerPriceLists(
            @PathVariable("dealerId") String dealerId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Applicable dealer price lists retrieved", new ArrayList<>(store.getPriceLists().values()), null));
    }

    @PostMapping("/dealer-price-requests")
    public ResponseEntity<Map<String, Object>> createDealerPriceRequest(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String reqId = "dealer_price_request_" + (1000 + store.getDealerPriceRequests().size() + 1);
        Map<String, Object> req = new LinkedHashMap<>(body);
        req.put("requestId", reqId);
        req.put("status", "PENDING_APPROVAL");
        req.put("tenantId", getTenantId(tenantHeader));
        store.getDealerPriceRequests().put(reqId, req);

        Map<String, Object> resData = new LinkedHashMap<>();
        resData.put("requestId", reqId);
        resData.put("dealerId", req.get("dealerId"));
        resData.put("productId", req.get("productId"));
        resData.put("status", "PENDING_APPROVAL");
        resData.put("requestedDiscountPercent", req.get("requestedDiscountPercent"));

        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Dealer price request created", resData, "req_dealer_price_001"));
    }

    @GetMapping("/dealer-price-requests")
    public ResponseEntity<Map<String, Object>> listPriceRequests(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Dealer price requests retrieved", new ArrayList<>(store.getDealerPriceRequests().values()), null));
    }

    @GetMapping("/dealer-price-requests/{requestId}")
    public ResponseEntity<Map<String, Object>> getPriceRequest(
            @PathVariable("requestId") String reqId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> req = store.getDealerPriceRequests().get(reqId);
        if (req == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Request not found", null, null));
        return ResponseEntity.ok(standardSuccess("Price request retrieved", req, null));
    }

    @PostMapping("/dealer-price-requests/{requestId}/decision")
    public ResponseEntity<Map<String, Object>> decidePriceRequest(
            @PathVariable("requestId") String reqId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> req = store.getDealerPriceRequests().get(reqId);
        if (req == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Price request not found", null, null));

        String decision = (String) body.get("decision"); // "APPROVE" or "REJECT"
        req.put("status", "APPROVE".equalsIgnoreCase(decision) ? "APPROVED" : "REJECTED");
        req.put("decision", decision);
        req.put("decisionReason", body.get("reason"));

        Map<String, Object> resData = new LinkedHashMap<>();
        resData.put("requestId", reqId);
        resData.put("status", req.get("status"));
        resData.put("decision", decision);
        resData.put("nextAction", "REJECT".equalsIgnoreCase(decision) ? "REVISE_REQUEST_OR_ESCALATE" : "APPLY_PRICING");

        return ResponseEntity.ok(standardSuccess("Dealer pricing decision recorded", resData, "req_dealer_price_decision_001"));
    }

    @GetMapping("/dealer-agreements")
    public ResponseEntity<Map<String, Object>> listAgreements(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Dealer agreements retrieved", new ArrayList<>(store.getDealerAgreements().values()), null));
    }

    @PostMapping("/dealer-agreements")
    public ResponseEntity<Map<String, Object>> createAgreement(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String aId = "agreement_" + UUID.randomUUID().toString().substring(0, 6);
        Map<String, Object> a = new LinkedHashMap<>(body);
        a.put("agreementId", aId);
        a.put("status", "DRAFT");
        store.getDealerAgreements().put(aId, a);
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Agreement created", a, null));
    }

    @GetMapping("/dealer-agreements/{agreementId}")
    public ResponseEntity<Map<String, Object>> getAgreement(
            @PathVariable("agreementId") String aId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> a = store.getDealerAgreements().get(aId);
        if (a == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Agreement not found", null, null));
        return ResponseEntity.ok(standardSuccess("Agreement retrieved", a, null));
    }

    @PatchMapping("/dealer-agreements/{agreementId}")
    public ResponseEntity<Map<String, Object>> updateAgreement(
            @PathVariable("agreementId") String aId,
            @RequestBody Map<String, Object> updates,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> a = store.getDealerAgreements().get(aId);
        if (a == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Agreement not found", null, null));
        a.putAll(updates);
        return ResponseEntity.ok(standardSuccess("Agreement updated", a, null));
    }

    @PostMapping("/dealer-agreements/{agreementId}/submit-approval")
    public ResponseEntity<Map<String, Object>> submitAgreementForApproval(
            @PathVariable("agreementId") String aId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> a = store.getDealerAgreements().get(aId);
        if (a == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Agreement not found", null, null));
        a.put("status", "PENDING_APPROVAL");
        return ResponseEntity.ok(standardSuccess("Agreement submitted for approval", a, null));
    }

    @PostMapping("/dealer-agreements/{agreementId}/activate")
    public ResponseEntity<Map<String, Object>> activateAgreement(
            @PathVariable("agreementId") String aId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> a = store.getDealerAgreements().get(aId);
        if (a == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Agreement not found", null, null));
        a.put("status", "ACTIVE");
        return ResponseEntity.ok(standardSuccess("Agreement activated", a, null));
    }

    // ==========================================
    // E. DEALER TARGETS & ORDERS
    // ==========================================

    @GetMapping("/dealers/{dealerId}/targets")
    public ResponseEntity<Map<String, Object>> getDealerTargets(
            @PathVariable("dealerId") String dealerId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> targets = store.getDealerTargets().values().stream()
                .filter(t -> dealerId.equals(t.get("dealerId")))
                .collect(Collectors.toList());
        return ResponseEntity.ok(standardSuccess("Dealer targets retrieved", targets, null));
    }

    @PostMapping("/dealers/{dealerId}/targets")
    public ResponseEntity<Map<String, Object>> createDealerTarget(
            @PathVariable("dealerId") String dealerId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tId = "dealer_target_" + (1000 + store.getDealerTargets().size() + 1);
        Map<String, Object> target = new LinkedHashMap<>(body);
        target.put("targetId", tId);
        target.put("dealerId", dealerId);
        target.put("status", "ACTIVE");
        target.put("tenantId", getTenantId(tenantHeader));
        store.getDealerTargets().put(tId, target);

        Map<String, Object> resData = new LinkedHashMap<>();
        resData.put("targetId", tId);
        resData.put("dealerId", dealerId);
        resData.put("status", "ACTIVE");
        resData.put("targetUnits", target.get("targetUnits"));

        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Dealer target created", resData, "req_dealer_target_001"));
    }

    @PatchMapping("/dealer-targets/{targetId}")
    public ResponseEntity<Map<String, Object>> updateDealerTarget(
            @PathVariable("targetId") String targetId,
            @RequestBody Map<String, Object> updates,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> t = store.getDealerTargets().get(targetId);
        if (t == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Target not found", null, null));
        t.putAll(updates);
        return ResponseEntity.ok(standardSuccess("Dealer target updated", t, null));
    }

    @GetMapping("/dealers/{dealerId}/performance")
    public ResponseEntity<Map<String, Object>> getDealerPerformance(
            @PathVariable("dealerId") String dealerId,
            @RequestParam(value = "period", defaultValue = "QUARTER") String period,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("dealerId", dealerId);
        data.put("period", period);
        data.put("ordersPlaced", 28);
        data.put("unitsSold", 142);
        data.put("salesAmount", 1800000.00);
        data.put("targetUnits", 200);
        data.put("targetAchievementPercent", 71);
        data.put("openEscalations", 2);
        return ResponseEntity.ok(standardSuccess("Dealer performance retrieved", data, "req_dealer_performance_001"));
    }

    @GetMapping("/dealer-orders")
    public ResponseEntity<Map<String, Object>> listDealerOrders(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Dealer orders retrieved", new ArrayList<>(store.getOrders().values()), null));
    }

    @GetMapping("/dealer-orders/{orderId}")
    public ResponseEntity<Map<String, Object>> getDealerOrder(
            @PathVariable("orderId") String orderId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> o = store.getOrders().get(orderId);
        if (o == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Order not found", null, null));
        return ResponseEntity.ok(standardSuccess("Dealer order retrieved", o, null));
    }

    @GetMapping("/dealers/{dealerId}/inventory-reports")
    public ResponseEntity<Map<String, Object>> getDealerInventoryReports(
            @PathVariable("dealerId") String dealerId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Dealer inventory reports retrieved", Collections.emptyList(), null));
    }

    @PostMapping("/dealers/{dealerId}/inventory-reports")
    public ResponseEntity<Map<String, Object>> submitDealerInventoryReport(
            @PathVariable("dealerId") String dealerId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String repId = "inv_rep_" + UUID.randomUUID().toString().substring(0, 6);
        Map<String, Object> r = new LinkedHashMap<>(body);
        r.put("reportId", repId);
        r.put("dealerId", dealerId);
        r.put("submittedAt", Instant.now().toString());
        store.getDealerInventoryReports().put(repId, r);
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Inventory report submitted", r, null));
    }

    @GetMapping("/dealer-escalations")
    public ResponseEntity<Map<String, Object>> listDealerEscalations(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Dealer escalations retrieved", new ArrayList<>(store.getDealerEscalations().values()), null));
    }

    @PostMapping("/dealer-escalations/{escalationId}/assign")
    public ResponseEntity<Map<String, Object>> assignDealerEscalation(
            @PathVariable("escalationId") String escId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> esc = store.getDealerEscalations().get(escId);
        if (esc == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Escalation not found", null, null));
        esc.put("assignedTo", body.get("assignedTo"));
        return ResponseEntity.ok(standardSuccess("Escalation assigned", esc, null));
    }

    @PostMapping("/dealer-escalations/{escalationId}/resolve")
    public ResponseEntity<Map<String, Object>> resolveDealerEscalation(
            @PathVariable("escalationId") String escId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> esc = store.getDealerEscalations().get(escId);
        if (esc == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Escalation not found", null, null));
        esc.put("status", "RESOLVED");
        esc.put("resolutionNotes", body.get("notes"));
        return ResponseEntity.ok(standardSuccess("Escalation resolved", esc, null));
    }
}
