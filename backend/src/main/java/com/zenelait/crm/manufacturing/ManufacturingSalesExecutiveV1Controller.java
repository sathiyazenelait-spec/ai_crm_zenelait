package com.zenelait.crm.manufacturing;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Manufacturing Sales Executive V1 REST API Controller
 * Base URL: /api/v1/manufacturing/sales-executive
 * Handles customer requirements, technical specifications, inventory checks, quotations, and order handoffs.
 */
@RestController
@RequestMapping("/api/v1/manufacturing/sales-executive")
@CrossOrigin(origins = "*")
public class ManufacturingSalesExecutiveV1Controller {

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
        resp.put("requestId", reqId != null ? reqId : "req_exec_" + UUID.randomUUID().toString().substring(0, 6));
        return resp;
    }

    private Map<String, Object> standardError(String message, List<Map<String, String>> errors, String reqId) {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", false);
        resp.put("message", message);
        resp.put("errors", errors != null ? errors : Collections.emptyList());
        resp.put("requestId", reqId != null ? reqId : "req_exec_err_" + UUID.randomUUID().toString().substring(0, 6));
        return resp;
    }

    // ==========================================
    // A. DASHBOARD & ASSIGNED WORK
    // ==========================================

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> d = new LinkedHashMap<>();
        d.put("assignedLeads", 14);
        d.put("openQuotations", 6);
        d.put("pendingApprovals", 2);
        d.put("pendingFollowUps", 5);
        d.put("activeOrders", 3);
        d.put("monthlyTargetInr", 1000000.00);
        d.put("monthlyAchievedInr", 750000.00);
        d.put("targetAchievementPercent", 75.0);
        return ResponseEntity.ok(standardSuccess("Sales executive dashboard retrieved", d, "req_exec_dash_001"));
    }

    @GetMapping("/my-leads")
    public ResponseEntity<Map<String, Object>> getMyLeads(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestParam(value = "status", required = false) String status,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> items = store.getLeads().values().stream()
                .filter(l -> status == null || status.equalsIgnoreCase((String) l.get("status")))
                .collect(Collectors.toList());

        Map<String, Object> pageData = new LinkedHashMap<>();
        pageData.put("items", items);
        pageData.put("page", page);
        pageData.put("size", size);
        pageData.put("totalElements", items.size());
        pageData.put("totalPages", 1);

        return ResponseEntity.ok(standardSuccess("Assigned leads retrieved", pageData, "req_exec_leads_001"));
    }

    @GetMapping("/my-opportunities")
    public ResponseEntity<Map<String, Object>> getMyOpportunities(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Assigned opportunities retrieved", new ArrayList<>(store.getOpportunities().values()), null));
    }

    @GetMapping("/my-tasks")
    public ResponseEntity<Map<String, Object>> getMyTasks(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Assigned tasks retrieved", new ArrayList<>(store.getFollowUpTasks().values()), null));
    }

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getMyMetrics(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("conversionRatePercent", 21.4);
        m.put("avgQuoteGenerationHours", 4.2);
        m.put("dealsWonThisMonth", 6);
        m.put("totalPipelineInr", 1850000.00);
        return ResponseEntity.ok(standardSuccess("Personal performance metrics retrieved", m, null));
    }

    @GetMapping("/activity-logs")
    public ResponseEntity<Map<String, Object>> getMyActivityLogs(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Personal activity logs retrieved", store.getAuditLogs(), null));
    }

    // ==========================================
    // B. CUSTOMER & LEAD MANAGEMENT
    // ==========================================

    @GetMapping("/customers")
    public ResponseEntity<Map<String, Object>> searchCustomers(
            @RequestParam(value = "search", required = false) String search,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Authorized customers retrieved", new ArrayList<>(store.getCustomers().values()), null));
    }

    @PostMapping("/customers")
    public ResponseEntity<Map<String, Object>> createCustomer(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String cId = "mfg_customer_" + (100 + store.getCustomers().size() + 1);
        Map<String, Object> c = new LinkedHashMap<>(body);
        c.put("customerId", cId);
        c.put("tenantId", getTenantId(tenantHeader));
        store.getCustomers().put(cId, c);
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Business customer created", c, null));
    }

    @GetMapping("/customers/{customerId}")
    public ResponseEntity<Map<String, Object>> getCustomer(
            @PathVariable("customerId") String cId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> c = store.getCustomers().get(cId);
        if (c == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Customer not found", null, null));
        return ResponseEntity.ok(standardSuccess("Customer retrieved", c, null));
    }

    @PatchMapping("/customers/{customerId}")
    public ResponseEntity<Map<String, Object>> updateCustomer(
            @PathVariable("customerId") String cId,
            @RequestBody Map<String, Object> updates,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> c = store.getCustomers().get(cId);
        if (c == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Customer not found", null, null));
        c.putAll(updates);
        return ResponseEntity.ok(standardSuccess("Customer updated", c, null));
    }

    @GetMapping("/leads")
    public ResponseEntity<Map<String, Object>> listLeads(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Leads retrieved", new ArrayList<>(store.getLeads().values()), null));
    }

    @PostMapping("/leads")
    public ResponseEntity<Map<String, Object>> createLead(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String leadId = "mfg_lead_" + (1000 + store.getLeads().size() + 1);
        Map<String, Object> lead = new LinkedHashMap<>(body);
        lead.put("leadId", leadId);
        lead.put("status", "NEW");
        lead.put("assignedUserId", "user_sales_exec_101");
        lead.put("tenantId", getTenantId(tenantHeader));
        store.getLeads().put(leadId, lead);
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Lead created", lead, null));
    }

    @GetMapping("/leads/{leadId}")
    public ResponseEntity<Map<String, Object>> getLead(
            @PathVariable("leadId") String leadId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> lead = store.getLeads().get(leadId);
        if (lead == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Lead not found", null, null));
        return ResponseEntity.ok(standardSuccess("Lead retrieved", lead, null));
    }

    @PatchMapping("/leads/{leadId}")
    public ResponseEntity<Map<String, Object>> updateLead(
            @PathVariable("leadId") String leadId,
            @RequestBody Map<String, Object> updates,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> lead = store.getLeads().get(leadId);
        if (lead == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Lead not found", null, null));
        lead.putAll(updates);
        return ResponseEntity.ok(standardSuccess("Lead updated", lead, null));
    }

    @PostMapping("/leads/{leadId}/activities")
    public ResponseEntity<Map<String, Object>> recordActivity(
            @PathVariable("leadId") String leadId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> act = new LinkedHashMap<>(body);
        act.put("activityId", "act_" + UUID.randomUUID().toString().substring(0, 6));
        act.put("leadId", leadId);
        act.put("timestamp", Instant.now().toString());
        store.getLeadActivities().computeIfAbsent(leadId, k -> new ArrayList<>()).add(act);
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Activity recorded", act, null));
    }

    @GetMapping("/leads/{leadId}/activities")
    public ResponseEntity<Map<String, Object>> getActivities(
            @PathVariable("leadId") String leadId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> acts = store.getLeadActivities().getOrDefault(leadId, Collections.emptyList());
        return ResponseEntity.ok(standardSuccess("Activities retrieved", acts, null));
    }

    @PostMapping("/leads/{leadId}/qualify")
    public ResponseEntity<Map<String, Object>> qualifyLead(
            @PathVariable("leadId") String leadId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> lead = store.getLeads().get(leadId);
        if (lead == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Lead not found", null, null));
        lead.put("status", "QUALIFIED");
        lead.put("qualificationResult", body);
        return ResponseEntity.ok(standardSuccess("Lead qualified", lead, null));
    }

    @PostMapping("/leads/{leadId}/handoff")
    public ResponseEntity<Map<String, Object>> requestHandoff(
            @PathVariable("leadId") String leadId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> lead = store.getLeads().get(leadId);
        if (lead == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Lead not found", null, null));
        lead.put("handoffRequested", true);
        lead.put("handoffDetails", body);
        return ResponseEntity.ok(standardSuccess("Lead reassignment requested", lead, null));
    }

    // ==========================================
    // C. PRODUCT CATALOGUE & REQUIREMENTS
    // ==========================================

    @GetMapping("/products")
    public ResponseEntity<Map<String, Object>> searchProducts(
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> items = store.getProducts().values().stream()
                .filter(p -> category == null || category.equalsIgnoreCase((String) p.get("category")))
                .filter(p -> {
                    if (search == null || search.isBlank()) return true;
                    String s = search.toLowerCase();
                    String name = ((String) p.getOrDefault("name", "")).toLowerCase();
                    String sku = ((String) p.getOrDefault("sku", "")).toLowerCase();
                    String cat = ((String) p.getOrDefault("category", "")).toLowerCase();
                    String specs = String.valueOf(p.getOrDefault("specifications", "")).toLowerCase();
                    return name.contains(s) || sku.contains(s) || cat.contains(s) || specs.contains(s) || (s.contains("water") && cat.contains("pump"));
                })
                .collect(Collectors.toList());

        Map<String, Object> pageData = new LinkedHashMap<>();
        pageData.put("items", items);
        pageData.put("page", page);
        pageData.put("size", size);
        pageData.put("totalElements", items.size());
        pageData.put("totalPages", 1);

        return ResponseEntity.ok(standardSuccess("Products retrieved", pageData, "req_exec_products_001"));
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
        return ResponseEntity.ok(standardSuccess("Product specifications retrieved", p.get("specifications"), null));
    }

    @GetMapping("/products/{productId}/compatible-products")
    public ResponseEntity<Map<String, Object>> getCompatibleProducts(
            @PathVariable("productId") String productId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> p = store.getProducts().get(productId);
        if (p == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Product not found", null, null));
        List<String> compIds = (List<String>) p.getOrDefault("compatibleProducts", Collections.emptyList());
        List<Map<String, Object>> comps = compIds.stream().map(store.getProducts()::get).filter(Objects::nonNull).collect(Collectors.toList());
        return ResponseEntity.ok(standardSuccess("Compatible products retrieved", comps, null));
    }

    @GetMapping("/products/{productId}/alternatives")
    public ResponseEntity<Map<String, Object>> getAlternatives(
            @PathVariable("productId") String productId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> p = store.getProducts().get(productId);
        if (p == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Product not found", null, null));
        List<String> altIds = (List<String>) p.getOrDefault("alternatives", Collections.emptyList());
        List<Map<String, Object>> alts = altIds.stream().map(store.getProducts()::get).filter(Objects::nonNull).collect(Collectors.toList());
        return ResponseEntity.ok(standardSuccess("Alternative products retrieved", alts, null));
    }

    @GetMapping("/price-lists")
    public ResponseEntity<Map<String, Object>> listPriceLists(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Price lists retrieved", new ArrayList<>(store.getPriceLists().values()), null));
    }

    @GetMapping("/price-lists/{priceListId}/products/{productId}")
    public ResponseEntity<Map<String, Object>> getProductPriceInList(
            @PathVariable("priceListId") String plId,
            @PathVariable("productId") String pId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> p = store.getProducts().get(pId);
        if (p == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Product not found", null, null));
        Map<String, Object> priceInfo = new LinkedHashMap<>();
        priceInfo.put("priceListId", plId);
        priceInfo.put("productId", pId);
        priceInfo.put("unitPrice", p.get("basePrice"));
        priceInfo.put("currency", p.get("currency"));
        return ResponseEntity.ok(standardSuccess("Price retrieved", priceInfo, null));
    }

    @PostMapping("/product-requirements")
    public ResponseEntity<Map<String, Object>> createProductRequirement(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String reqId = "mfg_req_" + (1000 + store.getProductRequirements().size() + 1);
        Map<String, Object> req = new LinkedHashMap<>(body);
        req.put("requirementId", reqId);
        req.put("status", "PENDING_TECHNICAL_VALIDATION");
        req.put("nextAction", "VALIDATE_PRODUCT_REQUIREMENTS");
        req.put("tenantId", getTenantId(tenantHeader));
        store.getProductRequirements().put(reqId, req);

        Map<String, Object> resData = new LinkedHashMap<>();
        resData.put("requirementId", reqId);
        resData.put("leadId", req.get("leadId"));
        resData.put("status", "PENDING_TECHNICAL_VALIDATION");
        resData.put("quantity", req.get("quantity"));
        resData.put("nextAction", "VALIDATE_PRODUCT_REQUIREMENTS");

        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Product requirements created", resData, "req_exec_requirements_001"));
    }

    @GetMapping("/product-requirements/{requirementId}")
    public ResponseEntity<Map<String, Object>> getProductRequirement(
            @PathVariable("requirementId") String reqId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> req = store.getProductRequirements().get(reqId);
        if (req == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Requirement not found", null, null));
        return ResponseEntity.ok(standardSuccess("Product requirement retrieved", req, null));
    }

    @PatchMapping("/product-requirements/{requirementId}")
    public ResponseEntity<Map<String, Object>> updateProductRequirement(
            @PathVariable("requirementId") String reqId,
            @RequestBody Map<String, Object> updates,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> req = store.getProductRequirements().get(reqId);
        if (req == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Requirement not found", null, null));
        req.putAll(updates);
        return ResponseEntity.ok(standardSuccess("Product requirement updated", req, null));
    }

    @PostMapping("/product-requirements/{requirementId}/validate")
    public ResponseEntity<Map<String, Object>> validateRequirement(
            @PathVariable("requirementId") String reqId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> req = store.getProductRequirements().get(reqId);
        if (req == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Requirement not found", null, null));
        req.put("status", "VALIDATED");
        req.put("technicalFeasibility", "FEASIBLE");
        return ResponseEntity.ok(standardSuccess("Product requirements validated", req, null));
    }

    @PostMapping("/product-requirements/{requirementId}/recommendations")
    public ResponseEntity<Map<String, Object>> getRecommendations(
            @PathVariable("requirementId") String reqId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> recs = List.of(
                Map.of("productId", "mfg_product_101", "name", "Stainless Steel Industrial Pump", "matchConfidence", 0.95),
                Map.of("productId", "mfg_product_102", "name", "Heavy Duty Induction Motor 50HP", "matchConfidence", 0.88)
        );
        return ResponseEntity.ok(standardSuccess("Recommended products retrieved", recs, null));
    }

    // ==========================================
    // D. INVENTORY & FULFILMENT ESTIMATES
    // ==========================================

    @GetMapping("/inventory/products/{productId}")
    public ResponseEntity<Map<String, Object>> getProductInventory(
            @PathVariable("productId") String productId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> inv = store.getInventoryRecords().get(productId);
        if (inv == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Inventory record not found", null, null));
        return ResponseEntity.ok(standardSuccess("Inventory availability retrieved", inv, null));
    }

    @PostMapping("/inventory/availability-checks")
    public ResponseEntity<Map<String, Object>> checkInventory(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> reqItems = (List<Map<String, Object>>) body.get("items");
        List<Map<String, Object>> checkedItems = new ArrayList<>();

        if (reqItems != null) {
            for (Map<String, Object> it : reqItems) {
                String pId = (String) it.get("productId");
                int qty = ((Number) it.get("quantity")).intValue();
                Map<String, Object> inv = store.getInventoryRecords().get(pId);
                int avail = inv != null ? ((Number) inv.get("availableQuantity")).intValue() : 0;
                int shortage = Math.max(0, qty - avail);

                Map<String, Object> ci = new LinkedHashMap<>();
                ci.put("productId", pId);
                ci.put("requestedQuantity", qty);
                ci.put("availableQuantity", avail);
                ci.put("shortageQuantity", shortage);
                ci.put("availability", shortage > 0 ? (avail > 0 ? "PARTIALLY_AVAILABLE" : "UNAVAILABLE") : "AVAILABLE");
                checkedItems.add(ci);
            }
        }

        Map<String, Object> resData = new LinkedHashMap<>();
        resData.put("checkId", "inventory_check_1001");
        resData.put("status", "COMPLETED");
        resData.put("items", checkedItems);
        resData.put("nextAction", "REQUEST_PRODUCTION_OR_ALTERNATIVE");

        return ResponseEntity.ok(standardSuccess("Inventory availability checked", resData, "req_exec_inventory_001"));
    }

    @GetMapping("/inventory/availability-checks/{checkId}")
    public ResponseEntity<Map<String, Object>> getAvailabilityCheck(
            @PathVariable("checkId") String checkId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> check = Map.of("checkId", checkId, "status", "COMPLETED", "note", "Availability check is informational and does not constitute a stock reservation.");
        return ResponseEntity.ok(standardSuccess("Availability check retrieved", check, null));
    }

    @PostMapping("/fulfilment-estimates")
    public ResponseEntity<Map<String, Object>> requestFulfilmentEstimate(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> est = new LinkedHashMap<>();
        est.put("estimateId", "fulfil_est_" + UUID.randomUUID().toString().substring(0, 6));
        est.put("estimatedLeadTimeWeeks", 3);
        est.put("earliestDispatchDate", LocalDate.now().plusWeeks(3).toString());
        est.put("isGuaranteed", false);
        return ResponseEntity.ok(standardSuccess("Fulfilment estimate generated", est, null));
    }

    @GetMapping("/fulfilment-estimates/{estimateId}")
    public ResponseEntity<Map<String, Object>> getFulfilmentEstimate(
            @PathVariable("estimateId") String estId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Estimate details retrieved", Map.of("estimateId", estId, "status", "CALCULATED"), null));
    }

    // ==========================================
    // E. QUOTATIONS
    // ==========================================

    @GetMapping("/quotations")
    public ResponseEntity<Map<String, Object>> listQuotations(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Permitted quotations retrieved", new ArrayList<>(store.getQuotations().values()), null));
    }

    @PostMapping("/quotations")
    public ResponseEntity<Map<String, Object>> createQuotation(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String qId = "mfg_quote_" + (1000 + store.getQuotations().size() + 1);
        String qNum = "MFG-Q-2026-" + (1000 + store.getQuotations().size() + 1);
        String tenant = getTenantId(tenantHeader);

        List<Map<String, Object>> items = (List<Map<String, Object>>) body.get("items");
        BigDecimal subtotal = BigDecimal.ZERO;
        List<Map<String, Object>> qItemsList = new ArrayList<>();

        if (items != null) {
            for (Map<String, Object> it : items) {
                String pId = (String) it.get("productId");
                int qty = ((Number) it.get("quantity")).intValue();
                double unitPrice = ((Number) it.getOrDefault("unitPrice", 10000.0)).doubleValue();
                BigDecimal lineSubtotal = BigDecimal.valueOf(unitPrice).multiply(BigDecimal.valueOf(qty));
                subtotal = subtotal.add(lineSubtotal);

                Map<String, Object> itemObj = new LinkedHashMap<>();
                itemObj.put("itemId", "qi_" + UUID.randomUUID().toString().substring(0, 6));
                itemObj.put("quotationId", qId);
                itemObj.put("productId", pId);
                itemObj.put("quantity", qty);
                itemObj.put("unitPrice", unitPrice);
                itemObj.put("subtotal", lineSubtotal.doubleValue());
                qItemsList.add(itemObj);
            }
        }
        store.getQuotationItems().put(qId, qItemsList);

        BigDecimal discount = BigDecimal.ZERO;
        BigDecimal tax = BigDecimal.ZERO;
        BigDecimal total = subtotal.subtract(discount).add(tax);

        Map<String, Object> q = new LinkedHashMap<>();
        q.put("quotationId", qId);
        q.put("quotationNumber", qNum);
        q.put("customerId", body.get("customerId"));
        q.put("leadId", body.get("leadId"));
        q.put("currency", body.getOrDefault("currency", "INR"));
        q.put("paymentTerms", body.getOrDefault("paymentTerms", "NET_30"));
        q.put("validUntil", body.getOrDefault("validUntil", "2026-11-15"));
        q.put("status", "DRAFT");
        q.put("subtotal", subtotal.doubleValue());
        q.put("tax", tax.doubleValue());
        q.put("discount", discount.doubleValue());
        q.put("total", total.doubleValue());
        q.put("approvalRequired", true); // Default threshold rule
        q.put("approved", false);
        q.put("tenantId", tenant);
        store.getQuotations().put(qId, q);

        Map<String, Object> resData = new LinkedHashMap<>();
        resData.put("quotationId", qId);
        resData.put("quotationNumber", qNum);
        resData.put("status", "DRAFT");
        resData.put("currency", q.get("currency"));
        resData.put("subtotal", q.get("subtotal"));
        resData.put("tax", q.get("tax"));
        resData.put("discount", q.get("discount"));
        resData.put("total", q.get("total"));
        resData.put("approvalRequired", true);

        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Quotation draft created", resData, "req_exec_quote_001"));
    }

    @GetMapping("/quotations/{quotationId}")
    public ResponseEntity<Map<String, Object>> getQuotation(
            @PathVariable("quotationId") String qId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> q = store.getQuotations().get(qId);
        if (q == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Quotation not found", null, null));
        Map<String, Object> res = new LinkedHashMap<>(q);
        res.put("items", store.getQuotationItems().getOrDefault(qId, Collections.emptyList()));
        return ResponseEntity.ok(standardSuccess("Quotation retrieved", res, null));
    }

    @PatchMapping("/quotations/{quotationId}")
    public ResponseEntity<Map<String, Object>> updateQuotation(
            @PathVariable("quotationId") String qId,
            @RequestBody Map<String, Object> updates,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> q = store.getQuotations().get(qId);
        if (q == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Quotation not found", null, null));
        q.putAll(updates);
        return ResponseEntity.ok(standardSuccess("Quotation updated", q, null));
    }

    @PostMapping("/quotations/{quotationId}/items")
    public ResponseEntity<Map<String, Object>> addQuotationItem(
            @PathVariable("quotationId") String qId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> q = store.getQuotations().get(qId);
        if (q == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Quotation not found", null, null));
        Map<String, Object> item = new LinkedHashMap<>(body);
        item.put("itemId", "qi_" + UUID.randomUUID().toString().substring(0, 6));
        item.put("quotationId", qId);
        store.getQuotationItems().computeIfAbsent(qId, k -> new ArrayList<>()).add(item);
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Line item added", item, null));
    }

    @PatchMapping("/quotations/{quotationId}/items/{itemId}")
    public ResponseEntity<Map<String, Object>> updateQuotationItem(
            @PathVariable("quotationId") String qId,
            @PathVariable("itemId") String itemId,
            @RequestBody Map<String, Object> updates,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> items = store.getQuotationItems().get(qId);
        if (items != null) {
            for (Map<String, Object> it : items) {
                if (itemId.equals(it.get("itemId"))) {
                    it.putAll(updates);
                    return ResponseEntity.ok(standardSuccess("Line item updated", it, null));
                }
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Item not found", null, null));
    }

    @DeleteMapping("/quotations/{quotationId}/items/{itemId}")
    public ResponseEntity<Map<String, Object>> removeQuotationItem(
            @PathVariable("quotationId") String qId,
            @PathVariable("itemId") String itemId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> items = store.getQuotationItems().get(qId);
        if (items != null) {
            items.removeIf(it -> itemId.equals(it.get("itemId")));
        }
        return ResponseEntity.ok(standardSuccess("Line item removed", Map.of("itemId", itemId), null));
    }

    @PostMapping("/quotations/{quotationId}/recalculate")
    public ResponseEntity<Map<String, Object>> recalculateQuotation(
            @PathVariable("quotationId") String qId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> q = store.getQuotations().get(qId);
        if (q == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Quotation not found", null, null));
        return ResponseEntity.ok(standardSuccess("Quotation recalculated", q, null));
    }

    @PostMapping("/quotations/{quotationId}/validate")
    public ResponseEntity<Map<String, Object>> validateQuotation(
            @PathVariable("quotationId") String qId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> q = store.getQuotations().get(qId);
        if (q == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Quotation not found", null, null));
        return ResponseEntity.ok(standardSuccess("Quotation is commercially valid", Map.of("valid", true), null));
    }

    @PostMapping("/quotations/{quotationId}/request-approval")
    public ResponseEntity<Map<String, Object>> requestApproval(
            @PathVariable("quotationId") String qId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> q = store.getQuotations().get(qId);
        if (q == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Quotation not found", null, null));

        String approvalId = "mfg_approval_" + (1000 + store.getQuotationApprovals().size() + 1);
        Map<String, Object> app = new LinkedHashMap<>();
        app.put("approvalId", approvalId);
        app.put("quotationId", qId);
        app.put("customerName", "ABC Industrial Solutions");
        app.put("reason", body.get("reason"));
        app.put("requestedDiscountPercent", body.get("requestedDiscountPercent"));
        app.put("comment", body.get("comment"));
        app.put("status", "PENDING_REVIEW");
        app.put("assignedRole", "SALES_MANAGER");
        app.put("tenantId", getTenantId(tenantHeader));
        store.getQuotationApprovals().put(approvalId, app);

        q.put("status", "PENDING_APPROVAL");
        q.put("approvalStatus", "PENDING_REVIEW");

        Map<String, Object> resData = new LinkedHashMap<>();
        resData.put("approvalId", approvalId);
        resData.put("quotationId", qId);
        resData.put("status", "PENDING_REVIEW");
        resData.put("assignedRole", "SALES_MANAGER");

        return ResponseEntity.status(HttpStatus.ACCEPTED).body(standardSuccess("Quotation approval requested", resData, "req_exec_approval_001"));
    }

    @PostMapping("/quotations/{quotationId}/send")
    public ResponseEntity<Map<String, Object>> sendQuotation(
            @PathVariable("quotationId") String qId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> q = store.getQuotations().get(qId);
        if (q == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Quotation not found", null, null));

        // Enforce business rule: Cannot send if approval is required and not granted
        boolean approvalRequired = Boolean.TRUE.equals(q.get("approvalRequired"));
        boolean approved = Boolean.TRUE.equals(q.get("approved")) || "APPROVED".equalsIgnoreCase((String) q.get("status"));
        if (approvalRequired && !approved) {
            List<Map<String, String>> errors = List.of(Map.of(
                    "field", "approvalStatus",
                    "message", "The quotation requires approval before sending."
            ));
            return ResponseEntity.status(HttpStatus.CONFLICT).body(standardError("Quotation cannot be sent", errors, "req_exec_send_blocked_001"));
        }

        q.put("status", "SENT");
        q.put("sentAt", Instant.now().toString());
        q.put("sendChannel", body.get("channel"));

        return ResponseEntity.ok(standardSuccess("Quotation sent to customer", q, null));
    }

    @PostMapping("/quotations/{quotationId}/revisions")
    public ResponseEntity<Map<String, Object>> createRevision(
            @PathVariable("quotationId") String qId,
            @RequestBody(required = false) Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> q = store.getQuotations().get(qId);
        if (q == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Quotation not found", null, null));
        q.put("version", 2);
        q.put("status", "DRAFT");
        return ResponseEntity.ok(standardSuccess("Quotation revision created", q, null));
    }

    @GetMapping("/quotations/{quotationId}/history")
    public ResponseEntity<Map<String, Object>> getQuotationHistory(
            @PathVariable("quotationId") String qId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> hist = List.of(
                Map.of("version", 1, "status", "DRAFT", "timestamp", "2026-10-25T10:00:00Z"),
                Map.of("version", 1, "status", "PENDING_APPROVAL", "timestamp", "2026-10-26T14:00:00Z")
        );
        return ResponseEntity.ok(standardSuccess("Quotation history retrieved", hist, null));
    }

    @PostMapping("/quotations/{quotationId}/record-response")
    public ResponseEntity<Map<String, Object>> recordResponse(
            @PathVariable("quotationId") String qId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> q = store.getQuotations().get(qId);
        if (q == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Quotation not found", null, null));
        String responseType = (String) body.get("responseType"); // "ACCEPTED", "REJECTED", "NEGOTIATING"
        q.put("status", responseType);
        q.put("customerResponse", body);
        return ResponseEntity.ok(standardSuccess("Customer response recorded", q, null));
    }

    // ==========================================
    // F. FOLLOW-UPS, CONVERSATIONS & ORDER HANDOFF
    // ==========================================

    @GetMapping("/follow-ups")
    public ResponseEntity<Map<String, Object>> listFollowUps(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Follow-up tasks retrieved", new ArrayList<>(store.getFollowUpTasks().values()), null));
    }

    @PostMapping("/follow-ups")
    public ResponseEntity<Map<String, Object>> createFollowUp(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tId = "task_" + UUID.randomUUID().toString().substring(0, 6);
        Map<String, Object> t = new LinkedHashMap<>(body);
        t.put("taskId", tId);
        t.put("status", "PENDING");
        store.getFollowUpTasks().put(tId, t);
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Follow-up task created", t, null));
    }

    @PatchMapping("/follow-ups/{taskId}")
    public ResponseEntity<Map<String, Object>> updateFollowUp(
            @PathVariable("taskId") String tId,
            @RequestBody Map<String, Object> updates,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> t = store.getFollowUpTasks().get(tId);
        if (t == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Task not found", null, null));
        t.putAll(updates);
        return ResponseEntity.ok(standardSuccess("Task updated", t, null));
    }

    @PostMapping("/follow-ups/{taskId}/complete")
    public ResponseEntity<Map<String, Object>> completeFollowUp(
            @PathVariable("taskId") String tId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> t = store.getFollowUpTasks().get(tId);
        if (t == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Task not found", null, null));
        t.put("status", "COMPLETED");
        return ResponseEntity.ok(standardSuccess("Task completed", t, null));
    }

    @PostMapping("/follow-ups/{taskId}/snooze")
    public ResponseEntity<Map<String, Object>> snoozeFollowUp(
            @PathVariable("taskId") String tId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> t = store.getFollowUpTasks().get(tId);
        if (t == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Task not found", null, null));
        t.put("dueDate", body.get("newDueDate"));
        return ResponseEntity.ok(standardSuccess("Task snoozed", t, null));
    }

    @GetMapping("/conversations")
    public ResponseEntity<Map<String, Object>> listConversations(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Conversations retrieved", new ArrayList<>(store.getConversations().values()), null));
    }

    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<Map<String, Object>> getMessages(
            @PathVariable("conversationId") String cId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Messages retrieved", store.getConversationMessages().getOrDefault(cId, Collections.emptyList()), null));
    }

    @PostMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<Map<String, Object>> sendMessage(
            @PathVariable("conversationId") String cId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> msg = new LinkedHashMap<>(body);
        msg.put("messageId", "msg_" + UUID.randomUUID().toString().substring(0, 6));
        msg.put("timestamp", Instant.now().toString());
        store.getConversationMessages().computeIfAbsent(cId, k -> new ArrayList<>()).add(msg);
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Message sent", msg, null));
    }

    @PostMapping("/conversations/{conversationId}/handoff")
    public ResponseEntity<Map<String, Object>> transferConversation(
            @PathVariable("conversationId") String cId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Conversation transferred", body, null));
    }

    @PostMapping("/quotations/{quotationId}/order-handoffs")
    public ResponseEntity<Map<String, Object>> createOrderHandoff(
            @PathVariable("quotationId") String qId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> q = store.getQuotations().get(qId);
        if (q == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Quotation not found", null, null));

        // Enforce business rule: Quotation MUST be ACCEPTED before creating an order handoff
        String status = (String) q.get("status");
        if (!"ACCEPTED".equalsIgnoreCase(status)) {
            List<Map<String, String>> errors = List.of(Map.of(
                    "field", "quotation",
                    "message", "A valid accepted quotation is required."
            ));
            return ResponseEntity.status(HttpStatus.CONFLICT).body(standardError("Order handoff cannot be created", errors, "req_exec_handoff_blocked_001"));
        }

        String handoffId = "handoff_" + UUID.randomUUID().toString().substring(0, 6);
        Map<String, Object> handoff = new LinkedHashMap<>(body);
        handoff.put("handoffId", handoffId);
        handoff.put("quotationId", qId);
        handoff.put("status", "SUBMITTED_TO_ERP");
        handoff.put("submittedAt", Instant.now().toString());
        store.getOrderHandoffs().put(handoffId, handoff);

        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Order handoff created successfully", handoff, null));
    }

    @GetMapping("/order-handoffs/{handoffId}")
    public ResponseEntity<Map<String, Object>> getOrderHandoff(
            @PathVariable("handoffId") String handoffId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> h = store.getOrderHandoffs().get(handoffId);
        if (h == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Handoff not found", null, null));
        return ResponseEntity.ok(standardSuccess("Order handoff retrieved", h, null));
    }

    @GetMapping("/orders/{orderId}")
    public ResponseEntity<Map<String, Object>> getOrder(
            @PathVariable("orderId") String orderId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> o = store.getOrders().get(orderId);
        if (o == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Order not found", null, null));
        return ResponseEntity.ok(standardSuccess("Order retrieved", o, null));
    }

    @GetMapping("/orders/{orderId}/status")
    public ResponseEntity<Map<String, Object>> getOrderStatus(
            @PathVariable("orderId") String orderId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> o = store.getOrders().get(orderId);
        if (o == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Order not found", null, null));
        return ResponseEntity.ok(standardSuccess("Order status retrieved", Map.of("orderId", orderId, "status", o.get("status"), "deliveryStatus", o.get("deliveryStatus")), null));
    }
}
