package com.zenelait.crm.manufacturing;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Manufacturing Sales Manager V1 REST API Controller
 * Base URL: /api/v1/manufacturing/sales-manager
 * Oversees B2B sales pipeline, quotation approvals, team targets, and order conversion.
 */
@RestController
@RequestMapping("/api/v1/manufacturing/sales-manager")
@CrossOrigin(origins = "*")
public class ManufacturingSalesManagerV1Controller {

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
        resp.put("requestId", reqId != null ? reqId : "req_mfg_mgr_" + UUID.randomUUID().toString().substring(0, 6));
        return resp;
    }

    private Map<String, Object> standardError(String message, List<Map<String, String>> errors, String reqId) {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", false);
        resp.put("message", message);
        resp.put("errors", errors != null ? errors : Collections.emptyList());
        resp.put("requestId", reqId != null ? reqId : "req_mfg_mgr_err_" + UUID.randomUUID().toString().substring(0, 6));
        return resp;
    }

    // ==========================================
    // A. DASHBOARD & SALES REPORTS
    // ==========================================

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(
            @RequestParam(value = "period", defaultValue = "MONTH") String period,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("period", period);
        data.put("totalLeads", 240);
        data.put("qualifiedLeads", 158);
        data.put("openOpportunities", 86);
        data.put("pendingQuotationApprovals", (int) store.getQuotationApprovals().values().stream()
                .filter(a -> "PENDING_REVIEW".equalsIgnoreCase((String) a.get("status"))).count());
        data.put("ordersCreated", 34);
        data.put("overdueFollowUps", 9);
        data.put("currency", "INR");
        data.put("revenue", 2850000.00);
        return ResponseEntity.ok(standardSuccess("Manufacturing sales dashboard retrieved", data, "req_mfg_manager_dashboard_001"));
    }

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getMetrics(
            @RequestParam(value = "period", defaultValue = "MONTH") String period,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> metrics = new LinkedHashMap<>();
        metrics.put("period", period);
        metrics.put("winRatePercent", 38.5);
        metrics.put("averageDealSizeInr", 485000.00);
        metrics.put("averageSalesCycleDays", 22.4);
        metrics.put("quotationTurnaroundHours", 14.2);
        metrics.put("discountLeakagePercent", 4.1);
        metrics.put("targetPacingPercent", 88.0);
        return ResponseEntity.ok(standardSuccess("Manufacturing sales metrics retrieved", metrics, null));
    }

    @GetMapping("/reports/revenue")
    public ResponseEntity<Map<String, Object>> getRevenueReport(
            @RequestParam(value = "period", defaultValue = "MONTH") String period,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> rev = new LinkedHashMap<>();
        rev.put("period", period);
        rev.put("grossOrderValue", 3450000.00);
        rev.put("invoicedRevenue", 2850000.00);
        rev.put("recognizedMarginPercent", 24.5);
        rev.put("byCategory", Map.of(
                "INDUSTRIAL_PUMP", 1650000.00,
                "INDUSTRIAL_MOTOR", 950000.00,
                "INDUSTRIAL_VALVE", 250000.00
        ));
        return ResponseEntity.ok(standardSuccess("Revenue report retrieved", rev, null));
    }

    @GetMapping("/reports/pipeline")
    public ResponseEntity<Map<String, Object>> getPipelineReport(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> pipe = new LinkedHashMap<>();
        pipe.put("stages", List.of(
                Map.of("stage", "QUALIFICATION", "count", 32, "value", 1250000.00),
                Map.of("stage", "TECHNICAL_EVALUATION", "count", 24, "value", 2100000.00),
                Map.of("stage", "QUOTATION_SUBMITTED", "count", 18, "value", 1950000.00),
                Map.of("stage", "COMMERCIAL_NEGOTIATION", "count", 12, "value", 1400000.00)
        ));
        pipe.put("weightedPipelineTotal", 3280000.00);
        return ResponseEntity.ok(standardSuccess("Pipeline report retrieved", pipe, null));
    }

    @GetMapping("/reports/conversion")
    public ResponseEntity<Map<String, Object>> getConversionReport(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> conv = new LinkedHashMap<>();
        conv.put("enquiriesReceived", 240);
        conv.put("qualifiedLeads", 158);
        conv.put("quotationsIssued", 92);
        conv.put("ordersWon", 34);
        conv.put("leadToOrderConversionPercent", 14.17);
        conv.put("quoteToOrderConversionPercent", 36.95);
        return ResponseEntity.ok(standardSuccess("Lead-to-order conversion report retrieved", conv, null));
    }

    @GetMapping("/reports/executive-performance")
    public ResponseEntity<Map<String, Object>> getExecutivePerformanceReport(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> list = new ArrayList<>();
        list.add(Map.of("userId", "user_sales_exec_101", "name", "Priya Sharma", "assignedLeads", 32, "qualifiedLeads", 22, "quotationsSent", 14, "ordersWon", 6, "targetAchievementPercent", 75));
        list.add(Map.of("userId", "user_sales_exec_102", "name", "Arjun Patel", "assignedLeads", 28, "qualifiedLeads", 19, "quotationsSent", 11, "ordersWon", 4, "targetAchievementPercent", 68));
        return ResponseEntity.ok(standardSuccess("Executive performance report retrieved", list, null));
    }

    @GetMapping("/reports/product-performance")
    public ResponseEntity<Map<String, Object>> getProductPerformanceReport(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> list = new ArrayList<>();
        list.add(Map.of("productId", "mfg_product_101", "sku", "PUMP-SS-100", "unitsSold", 58, "revenue", 580000.00, "demandTrend", "+18%"));
        list.add(Map.of("productId", "mfg_product_102", "sku", "MTR-IND-50HP", "unitsSold", 14, "revenue", 630000.00, "demandTrend", "+8%"));
        list.add(Map.of("productId", "mfg_product_103", "sku", "VLV-HYD-HP20", "unitsSold", 84, "revenue", 714000.00, "demandTrend", "+22%"));
        return ResponseEntity.ok(standardSuccess("Product performance report retrieved", list, null));
    }

    @GetMapping("/reports/forecast")
    public ResponseEntity<Map<String, Object>> getForecastReport(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> forecast = new LinkedHashMap<>();
        forecast.put("period", "NEXT_QUARTER");
        forecast.put("committedInr", 4200000.00);
        forecast.put("bestCaseInr", 5850000.00);
        forecast.put("pipelineCoverageRatio", 2.6);
        return ResponseEntity.ok(standardSuccess("Sales forecast retrieved", forecast, null));
    }

    @GetMapping("/reports/overdue-follow-ups")
    public ResponseEntity<Map<String, Object>> getOverdueFollowUps(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> list = new ArrayList<>();
        list.add(Map.of("taskId", "task_od_001", "leadId", "mfg_lead_1001", "companyName", "ABC Industrial Solutions", "assignedTo", "user_sales_exec_101", "dueDate", "2026-10-24", "daysOverdue", 4));
        return ResponseEntity.ok(standardSuccess("Overdue sales activities retrieved", list, null));
    }

    @GetMapping("/activity-logs")
    public ResponseEntity<Map<String, Object>> getActivityLogs(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Sales audit history retrieved", store.getAuditLogs(), null));
    }

    // ==========================================
    // B. LEAD & OPPORTUNITY MANAGEMENT
    // ==========================================

    @GetMapping("/leads")
    public ResponseEntity<Map<String, Object>> listLeads(
            @RequestParam(value = "status", required = false) String status,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenant = getTenantId(tenantHeader);
        List<Map<String, Object>> list = store.getLeads().values().stream()
                .filter(l -> tenant.equals(l.get("tenantId")))
                .filter(l -> status == null || status.equalsIgnoreCase((String) l.get("status")))
                .collect(Collectors.toList());
        return ResponseEntity.ok(standardSuccess("Manufacturing leads retrieved", list, null));
    }

    @PostMapping("/leads")
    public ResponseEntity<Map<String, Object>> createLead(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenant = getTenantId(tenantHeader);
        String leadId = "mfg_lead_" + (1000 + store.getLeads().size() + 1);
        Map<String, Object> lead = new LinkedHashMap<>(body);
        lead.put("leadId", leadId);
        lead.put("status", "NEW");
        lead.put("assignedUserId", null);
        lead.put("tenantId", tenant);
        lead.put("createdAt", Instant.now().toString());
        store.getLeads().put(leadId, lead);
        store.addAuditLog("LEAD", leadId, "LEAD_CREATED", "sales_manager", tenant);

        Map<String, Object> resData = new LinkedHashMap<>();
        resData.put("leadId", leadId);
        resData.put("companyName", lead.get("companyName"));
        resData.put("status", "NEW");
        resData.put("industry", lead.get("industry"));
        resData.put("assignedUserId", null);

        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Manufacturing lead created", resData, "req_mfg_lead_001"));
    }

    @GetMapping("/leads/{leadId}")
    public ResponseEntity<Map<String, Object>> getLead(
            @PathVariable("leadId") String leadId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> lead = store.getLeads().get(leadId);
        if (lead == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Lead not found", null, null));
        }
        return ResponseEntity.ok(standardSuccess("Lead details retrieved", lead, null));
    }

    @PatchMapping("/leads/{leadId}")
    public ResponseEntity<Map<String, Object>> updateLead(
            @PathVariable("leadId") String leadId,
            @RequestBody Map<String, Object> updates,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> lead = store.getLeads().get(leadId);
        if (lead == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Lead not found", null, null));
        }
        lead.putAll(updates);
        return ResponseEntity.ok(standardSuccess("Lead updated successfully", lead, null));
    }

    @PostMapping("/leads/{leadId}/assign")
    public ResponseEntity<Map<String, Object>> assignLead(
            @PathVariable("leadId") String leadId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> lead = store.getLeads().get(leadId);
        if (lead == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Lead not found", null, null));
        }
        String execId = (String) body.get("salesExecutiveId");
        if (execId == null || !store.getTeamMembers().containsKey(execId)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(standardError("Invalid sales executive for tenant", null, null));
        }
        lead.put("assignedUserId", execId);
        lead.put("status", "ASSIGNED");
        lead.put("assignmentReason", body.get("reason"));
        store.addAuditLog("LEAD", leadId, "LEAD_ASSIGNED_TO_" + execId, "sales_manager", getTenantId(tenantHeader));

        Map<String, Object> resData = new LinkedHashMap<>();
        resData.put("leadId", leadId);
        resData.put("assignedUserId", execId);
        resData.put("status", "ASSIGNED");

        return ResponseEntity.ok(standardSuccess("Lead assigned successfully", resData, "req_mfg_assign_001"));
    }

    @PostMapping("/leads/{leadId}/reassign")
    public ResponseEntity<Map<String, Object>> reassignLead(
            @PathVariable("leadId") String leadId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return assignLead(leadId, body, tenantHeader);
    }

    @PostMapping("/leads/{leadId}/qualify")
    public ResponseEntity<Map<String, Object>> qualifyLead(
            @PathVariable("leadId") String leadId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> lead = store.getLeads().get(leadId);
        if (lead == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Lead not found", null, null));
        }
        boolean qualified = Boolean.TRUE.equals(body.get("qualified"));
        lead.put("status", qualified ? "QUALIFIED" : "UNQUALIFIED");
        lead.put("qualificationNotes", body.get("notes"));
        return ResponseEntity.ok(standardSuccess("Lead qualification recorded", lead, null));
    }

    @GetMapping("/opportunities")
    public ResponseEntity<Map<String, Object>> listOpportunities(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Opportunities retrieved", new ArrayList<>(store.getOpportunities().values()), null));
    }

    @PostMapping("/opportunities")
    public ResponseEntity<Map<String, Object>> createOpportunity(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String oppId = "mfg_opp_" + (1000 + store.getOpportunities().size() + 1);
        Map<String, Object> opp = new LinkedHashMap<>(body);
        opp.put("opportunityId", oppId);
        opp.put("tenantId", getTenantId(tenantHeader));
        opp.put("createdAt", Instant.now().toString());
        store.getOpportunities().put(oppId, opp);
        store.addAuditLog("OPPORTUNITY", oppId, "OPPORTUNITY_CREATED", "sales_manager", getTenantId(tenantHeader));

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("opportunityId", oppId);
        data.put("leadId", opp.get("leadId"));
        data.put("stage", opp.get("stage"));
        data.put("expectedValue", opp.get("expectedValue"));
        data.put("probabilityPercent", opp.get("probabilityPercent"));

        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Sales opportunity created", data, "req_mfg_opportunity_001"));
    }

    @GetMapping("/opportunities/{opportunityId}")
    public ResponseEntity<Map<String, Object>> getOpportunity(
            @PathVariable("opportunityId") String oppId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> opp = store.getOpportunities().get(oppId);
        if (opp == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Opportunity not found", null, null));
        }
        return ResponseEntity.ok(standardSuccess("Opportunity retrieved", opp, null));
    }

    @PatchMapping("/opportunities/{opportunityId}")
    public ResponseEntity<Map<String, Object>> updateOpportunity(
            @PathVariable("opportunityId") String oppId,
            @RequestBody Map<String, Object> updates,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> opp = store.getOpportunities().get(oppId);
        if (opp == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Opportunity not found", null, null));
        }
        opp.putAll(updates);
        return ResponseEntity.ok(standardSuccess("Opportunity updated", opp, null));
    }

    @PostMapping("/opportunities/{opportunityId}/stage")
    public ResponseEntity<Map<String, Object>> changeOpportunityStage(
            @PathVariable("opportunityId") String oppId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> opp = store.getOpportunities().get(oppId);
        if (opp == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Opportunity not found", null, null));
        }
        opp.put("stage", body.get("stage"));
        return ResponseEntity.ok(standardSuccess("Opportunity stage updated", opp, null));
    }

    @PostMapping("/opportunities/{opportunityId}/close")
    public ResponseEntity<Map<String, Object>> closeOpportunity(
            @PathVariable("opportunityId") String oppId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> opp = store.getOpportunities().get(oppId);
        if (opp == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Opportunity not found", null, null));
        }
        opp.put("stage", body.get("outcome")); // "WON" or "LOST"
        opp.put("closedAt", Instant.now().toString());
        opp.put("closeReason", body.get("reason"));
        return ResponseEntity.ok(standardSuccess("Opportunity closed successfully", opp, null));
    }

    // ==========================================
    // C. SALES TEAM & TARGETS
    // ==========================================

    @GetMapping("/team")
    public ResponseEntity<Map<String, Object>> listTeam(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Permitted sales team members retrieved", new ArrayList<>(store.getTeamMembers().values()), null));
    }

    @GetMapping("/team/{userId}/performance")
    public ResponseEntity<Map<String, Object>> getTeamMemberPerformance(
            @PathVariable("userId") String userId,
            @RequestParam(value = "period", defaultValue = "MONTH") String period,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("userId", userId);
        data.put("period", period);
        data.put("assignedLeads", 32);
        data.put("qualifiedLeads", 22);
        data.put("quotationsSent", 14);
        data.put("ordersWon", 6);
        data.put("targetAchievementPercent", 75);
        return ResponseEntity.ok(standardSuccess("Sales executive performance retrieved", data, "req_mfg_performance_001"));
    }

    @GetMapping("/targets")
    public ResponseEntity<Map<String, Object>> listTargets(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Sales targets retrieved", new ArrayList<>(store.getSalesTargets().values()), null));
    }

    @PostMapping("/targets")
    public ResponseEntity<Map<String, Object>> createTarget(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String targetId = "mfg_target_" + (1000 + store.getSalesTargets().size() + 1);
        Map<String, Object> target = new LinkedHashMap<>(body);
        target.put("targetId", targetId);
        target.put("status", "ACTIVE");
        target.put("tenantId", getTenantId(tenantHeader));
        store.getSalesTargets().put(targetId, target);

        Map<String, Object> resData = new LinkedHashMap<>();
        resData.put("targetId", targetId);
        resData.put("name", target.get("name"));
        resData.put("status", "ACTIVE");
        resData.put("targetOrders", target.get("targetOrders"));

        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Sales target created", resData, "req_mfg_target_001"));
    }

    @GetMapping("/targets/{targetId}")
    public ResponseEntity<Map<String, Object>> getTarget(
            @PathVariable("targetId") String targetId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> target = store.getSalesTargets().get(targetId);
        if (target == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Target not found", null, null));
        }
        return ResponseEntity.ok(standardSuccess("Target retrieved", target, null));
    }

    @PatchMapping("/targets/{targetId}")
    public ResponseEntity<Map<String, Object>> updateTarget(
            @PathVariable("targetId") String targetId,
            @RequestBody Map<String, Object> updates,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> target = store.getSalesTargets().get(targetId);
        if (target == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Target not found", null, null));
        }
        target.putAll(updates);
        return ResponseEntity.ok(standardSuccess("Target updated", target, null));
    }

    @GetMapping("/assignments")
    public ResponseEntity<Map<String, Object>> getAssignments(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Assignments retrieved", new ArrayList<>(store.getSalesAssignments().values()), null));
    }

    @PostMapping("/assignments/bulk")
    public ResponseEntity<Map<String, Object>> bulkAssign(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<String> leadIds = (List<String>) body.get("leadIds");
        String execId = (String) body.get("salesExecutiveId");
        int count = 0;
        if (leadIds != null) {
            for (String lid : leadIds) {
                Map<String, Object> l = store.getLeads().get(lid);
                if (l != null) {
                    l.put("assignedUserId", execId);
                    l.put("status", "ASSIGNED");
                    count++;
                }
            }
        }
        return ResponseEntity.ok(standardSuccess("Bulk assigned " + count + " leads successfully", Map.of("assignedCount", count), null));
    }

    @GetMapping("/workload")
    public ResponseEntity<Map<String, Object>> getWorkload(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> workload = new ArrayList<>();
        for (Map<String, Object> exec : store.getTeamMembers().values()) {
            workload.add(Map.of(
                    "userId", exec.get("userId"),
                    "name", exec.get("name"),
                    "activeLeads", exec.get("activeLeadsCount"),
                    "capacityUtilizationPercent", 75
            ));
        }
        return ResponseEntity.ok(standardSuccess("Team workload distribution retrieved", workload, null));
    }

    // ==========================================
    // D. PRODUCT & PRICING VISIBILITY
    // ==========================================

    @GetMapping("/products")
    public ResponseEntity<Map<String, Object>> searchProducts(
            @RequestParam(value = "category", required = false) String category,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> list = store.getProducts().values().stream()
                .filter(p -> category == null || category.equalsIgnoreCase((String) p.get("category")))
                .collect(Collectors.toList());
        return ResponseEntity.ok(standardSuccess("Permitted products retrieved", list, null));
    }

    @GetMapping("/products/{productId}")
    public ResponseEntity<Map<String, Object>> getProduct(
            @PathVariable("productId") String productId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> product = store.getProducts().get(productId);
        if (product == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Product not found", null, null));
        }
        return ResponseEntity.ok(standardSuccess("Product retrieved", product, null));
    }

    @GetMapping("/price-lists")
    public ResponseEntity<Map<String, Object>> listPriceLists(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Price lists retrieved", new ArrayList<>(store.getPriceLists().values()), null));
    }

    @GetMapping("/price-lists/{priceListId}")
    public ResponseEntity<Map<String, Object>> getPriceList(
            @PathVariable("priceListId") String priceListId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> pl = store.getPriceLists().get(priceListId);
        if (pl == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Price list not found", null, null));
        }
        return ResponseEntity.ok(standardSuccess("Price list retrieved", pl, null));
    }

    @GetMapping("/discount-policies")
    public ResponseEntity<Map<String, Object>> getDiscountPolicies(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Discount policies retrieved", new ArrayList<>(store.getDiscountPolicies().values()), null));
    }

    @GetMapping("/inventory-summary")
    public ResponseEntity<Map<String, Object>> getInventorySummary(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Inventory summaries retrieved", new ArrayList<>(store.getInventoryRecords().values()), null));
    }

    // ==========================================
    // E. QUOTATIONS & APPROVALS
    // ==========================================

    @GetMapping("/quotations")
    public ResponseEntity<Map<String, Object>> listQuotations(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Quotations retrieved", new ArrayList<>(store.getQuotations().values()), null));
    }

    @GetMapping("/quotations/{quotationId}")
    public ResponseEntity<Map<String, Object>> getQuotation(
            @PathVariable("quotationId") String quotationId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> q = store.getQuotations().get(quotationId);
        if (q == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Quotation not found", null, null));
        }
        Map<String, Object> details = new LinkedHashMap<>(q);
        details.put("items", store.getQuotationItems().getOrDefault(quotationId, Collections.emptyList()));
        return ResponseEntity.ok(standardSuccess("Quotation retrieved", details, null));
    }

    @GetMapping("/quotation-approvals")
    public ResponseEntity<Map<String, Object>> getQuotationApprovals(
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> items = store.getQuotationApprovals().values().stream()
                .filter(a -> status == null || status.equalsIgnoreCase((String) a.get("status")))
                .collect(Collectors.toList());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("items", items);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", items.size());
        data.put("totalPages", 1);

        return ResponseEntity.ok(standardSuccess("Pending quotation approvals retrieved", data, "req_mfg_approvals_001"));
    }

    @GetMapping("/quotation-approvals/{approvalId}")
    public ResponseEntity<Map<String, Object>> getQuotationApproval(
            @PathVariable("approvalId") String approvalId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> app = store.getQuotationApprovals().get(approvalId);
        if (app == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Approval not found", null, null));
        }
        return ResponseEntity.ok(standardSuccess("Approval details retrieved", app, null));
    }

    @PostMapping("/quotation-approvals/{approvalId}/decision")
    public ResponseEntity<Map<String, Object>> decideQuotationApproval(
            @PathVariable("approvalId") String approvalId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> app = store.getQuotationApprovals().get(approvalId);
        if (app == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Approval request not found", null, null));
        }
        String decision = (String) body.get("decision"); // "APPROVE", "REJECT", "REQUEST_REVISION"
        String comment = (String) body.get("comment");
        String now = Instant.now().toString();

        app.put("status", "APPROVE".equalsIgnoreCase(decision) ? "APPROVED" : ("REJECT".equalsIgnoreCase(decision) ? "REJECTED" : "REVISION_REQUESTED"));
        app.put("decision", decision);
        app.put("comment", comment);
        app.put("approvedBy", "authenticated-manager");
        app.put("approvedAt", now);

        // Update corresponding quotation
        String qId = (String) app.get("quotationId");
        if (qId != null && store.getQuotations().containsKey(qId)) {
            Map<String, Object> q = store.getQuotations().get(qId);
            if ("APPROVE".equalsIgnoreCase(decision)) {
                q.put("status", "APPROVED");
                q.put("approvalStatus", "APPROVED");
                q.put("approved", true);
            } else if ("REJECT".equalsIgnoreCase(decision)) {
                q.put("status", "REJECTED");
                q.put("approvalStatus", "REJECTED");
            } else {
                q.put("status", "REVISION_REQUESTED");
                q.put("approvalStatus", "REVISION_REQUESTED");
            }
        }
        store.addAuditLog("QUOTATION_APPROVAL", approvalId, "DECISION_" + decision, "authenticated-manager", getTenantId(tenantHeader));

        Map<String, Object> resData = new LinkedHashMap<>();
        resData.put("approvalId", approvalId);
        resData.put("quotationId", qId);
        resData.put("status", app.get("status"));
        resData.put("decision", decision);
        resData.put("approvedBy", "authenticated-manager");
        resData.put("approvedAt", now);

        return ResponseEntity.ok(standardSuccess("Quotation approval decision recorded", resData, "req_mfg_approval_decision_001"));
    }

    @PostMapping("/quotations/{quotationId}/approve")
    public ResponseEntity<Map<String, Object>> approveQuotationDirect(
            @PathVariable("quotationId") String quotationId,
            @RequestBody(required = false) Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> q = store.getQuotations().get(quotationId);
        if (q == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Quotation not found", null, null));
        }
        q.put("status", "APPROVED");
        q.put("approvalStatus", "APPROVED");
        q.put("approved", true);
        q.put("approvedBy", "authenticated-manager");
        q.put("approvedAt", Instant.now().toString());
        return ResponseEntity.ok(standardSuccess("Quotation approved successfully", q, null));
    }

    @PostMapping("/quotations/{quotationId}/reject")
    public ResponseEntity<Map<String, Object>> rejectQuotationDirect(
            @PathVariable("quotationId") String quotationId,
            @RequestBody(required = false) Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> q = store.getQuotations().get(quotationId);
        if (q == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Quotation not found", null, null));
        }
        q.put("status", "REJECTED");
        q.put("approvalStatus", "REJECTED");
        return ResponseEntity.ok(standardSuccess("Quotation rejected", q, null));
    }

    @PostMapping("/quotations/{quotationId}/request-revision")
    public ResponseEntity<Map<String, Object>> requestRevisionDirect(
            @PathVariable("quotationId") String quotationId,
            @RequestBody(required = false) Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> q = store.getQuotations().get(quotationId);
        if (q == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Quotation not found", null, null));
        }
        q.put("status", "REVISION_REQUESTED");
        q.put("approvalStatus", "REVISION_REQUESTED");
        return ResponseEntity.ok(standardSuccess("Quotation revision requested", q, null));
    }

    // ==========================================
    // F. ORDERS & ESCALATION
    // ==========================================

    @GetMapping("/orders")
    public ResponseEntity<Map<String, Object>> listOrders(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Permitted orders retrieved", new ArrayList<>(store.getOrders().values()), null));
    }

    @GetMapping("/orders/{orderId}")
    public ResponseEntity<Map<String, Object>> getOrder(
            @PathVariable("orderId") String orderId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> o = store.getOrders().get(orderId);
        if (o == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Order not found", null, null));
        }
        return ResponseEntity.ok(standardSuccess("Order retrieved", o, null));
    }

    @GetMapping("/escalations")
    public ResponseEntity<Map<String, Object>> listEscalations(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Sales escalations retrieved", new ArrayList<>(store.getSupportEscalations().values()), null));
    }

    @PostMapping("/escalations/{escalationId}/assign")
    public ResponseEntity<Map<String, Object>> assignEscalation(
            @PathVariable("escalationId") String escId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> esc = store.getSupportEscalations().get(escId);
        if (esc == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Escalation not found", null, null));
        }
        esc.put("assignedTo", body.get("assignedTo"));
        return ResponseEntity.ok(standardSuccess("Escalation assigned", esc, null));
    }

    @PostMapping("/escalations/{escalationId}/resolve")
    public ResponseEntity<Map<String, Object>> resolveEscalation(
            @PathVariable("escalationId") String escId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> esc = store.getSupportEscalations().get(escId);
        if (esc == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Escalation not found", null, null));
        }
        esc.put("status", "RESOLVED");
        esc.put("resolutionNotes", body.get("resolutionNotes"));
        return ResponseEntity.ok(standardSuccess("Escalation resolved", esc, null));
    }
}
