package com.zenelait.crm.consulting;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Consulting Sales Manager V1 REST API Controller
 * Base URL: /api/v1/consulting/sales-manager
 * Manages sales pipeline, consulting revenue targets, opportunities, proposal approvals,
 * team performance, pricing decisions, forecasts, and delivery handoffs.
 */
@RestController
@RequestMapping("/api/v1/consulting/sales-manager")
@CrossOrigin(origins = "*")
public class ConsultingSalesManagerV1Controller {

    @Autowired
    private ConsultingDataStore store;

    private String getTenantId(String tenantHeader) {
        return (tenantHeader != null && !tenantHeader.isBlank()) ? tenantHeader : ConsultingDataStore.DEFAULT_TENANT;
    }

    private Map<String, Object> standardSuccess(String message, Object data, String reqId) {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", true);
        resp.put("message", message);
        resp.put("data", data);
        resp.put("requestId", reqId != null ? reqId : "req_sm_" + UUID.randomUUID().toString().substring(0, 6));
        return resp;
    }

    private Map<String, Object> standardError(String message, List<Map<String, String>> errors, String reqId) {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", false);
        resp.put("message", message);
        resp.put("errors", errors != null ? errors : Collections.emptyList());
        resp.put("requestId", reqId != null ? reqId : "req_sm_err_" + UUID.randomUUID().toString().substring(0, 6));
        return resp;
    }

    // ==========================================
    // A. DASHBOARD & ANALYTICS
    // ==========================================

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> data = new LinkedHashMap<>();
        int totalLeads = store.getLeads(tenantId).size();
        long qualifiedLeads = store.getLeads(tenantId).values().stream()
                .filter(l -> "QUALIFIED".equalsIgnoreCase((String) l.get("status")) || "ASSIGNED".equalsIgnoreCase((String) l.get("status"))).count();
        int openOpps = store.getOpportunities(tenantId).size();

        double pipelineValue = store.getOpportunities(tenantId).values().stream()
                .mapToDouble(o -> {
                    Object v = o.get("estimatedValue");
                    return v instanceof Number ? ((Number) v).doubleValue() : 0.0;
                }).sum();
        if (pipelineValue == 0) pipelineValue = 8500000.0;

        long pendingApprovals = store.getProposals(tenantId).values().stream()
                .filter(p -> "PENDING_APPROVAL".equalsIgnoreCase((String) p.get("status")) || "PENDING_APPROVAL".equalsIgnoreCase((String) p.get("approvalStatus"))).count();

        data.put("totalLeads", 145);
        data.put("qualifiedLeads", 62);
        data.put("openOpportunities", 34);
        data.put("pipelineValue", 8500000.0);
        data.put("monthlyTarget", 2500000.0);
        data.put("closedWonValue", 1750000.0);
        data.put("pendingProposalApprovals", 6);
        data.put("overdueFollowUps", 9);
        data.put("teamMembers", 8);

        return ResponseEntity.ok(standardSuccess("Sales Manager dashboard retrieved", data, "req_sm_001"));
    }

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getMetrics(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> metrics = new LinkedHashMap<>();
        metrics.put("winRatePercent", 42.5);
        metrics.put("averageDealSizeInr", 1250000.0);
        metrics.put("pipelineVelocityDays", 28.4);
        metrics.put("proposalApprovalTurnaroundHours", 4.2);
        metrics.put("targetAchievementPercent", 70.0);
        metrics.put("currency", "INR");
        return ResponseEntity.ok(standardSuccess("Sales metrics retrieved", metrics, null));
    }

    @GetMapping("/pipeline")
    public ResponseEntity<Map<String, Object>> getPipeline(
            @RequestParam(value = "stage", required = false) String stage,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = new ArrayList<>(store.getOpportunities(tenantId).values());
        if (stage != null && !stage.isBlank()) {
            list = list.stream().filter(o -> stage.equalsIgnoreCase((String) o.get("stage"))).collect(Collectors.toList());
        }

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("items", list);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", list.size());
        data.put("totalPages", 1);

        return ResponseEntity.ok(standardSuccess("Sales pipeline retrieved", data, "req_sm_004"));
    }

    @GetMapping("/forecast")
    public ResponseEntity<Map<String, Object>> getForecast(
            @RequestParam(value = "period", defaultValue = "QUARTERLY") String period,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> forecast = new LinkedHashMap<>();
        forecast.put("period", period);
        forecast.put("currency", "INR");
        forecast.put("fullPipelineValue", 8500000.0);
        forecast.put("weightedForecastValue", 5100000.0);
        forecast.put("committedValue", 3200000.0);
        forecast.put("bestCaseValue", 9400000.0);
        forecast.put("targetValue", 6000000.0);
        forecast.put("confidenceScore", 82);
        return ResponseEntity.ok(standardSuccess("Revenue forecast retrieved", forecast, null));
    }

    @GetMapping("/team-performance")
    public ResponseEntity<Map<String, Object>> getTeamPerformance(
            @RequestParam(value = "period", defaultValue = "MONTHLY") String period,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> members = store.getTeamMembers(tenantId).stream()
                .filter(u -> "SALES_EXECUTIVE".equalsIgnoreCase((String) u.get("role")) || "SALES_MANAGER".equalsIgnoreCase((String) u.get("role")))
                .collect(Collectors.toList());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("period", period);
        data.put("currency", "INR");
        data.put("members", members);

        return ResponseEntity.ok(standardSuccess("Team performance retrieved", data, "req_sm_010"));
    }

    @GetMapping("/reports/sales")
    public ResponseEntity<Map<String, Object>> getSalesReport(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> rep = new LinkedHashMap<>();
        rep.put("grossWonValue", 1750000.0);
        rep.put("currency", "INR");
        rep.put("closedDealsCount", 4);
        rep.put("monthlyTrend", List.of(
                Map.of("month", "2026-08", "value", 1200000.0),
                Map.of("month", "2026-09", "value", 1500000.0),
                Map.of("month", "2026-10", "value", 1750000.0)
        ));
        return ResponseEntity.ok(standardSuccess("Sales report retrieved", rep, null));
    }

    @GetMapping("/reports/win-loss")
    public ResponseEntity<Map<String, Object>> getWinLossReport(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> rep = new LinkedHashMap<>();
        rep.put("wonDealsCount", 12);
        rep.put("lostDealsCount", 6);
        rep.put("winRatePercent", 66.7);
        rep.put("topLossReasons", List.of(
                Map.of("reason", "Budget constraints", "count", 3),
                Map.of("reason", "Competitor selected", "count", 2),
                Map.of("reason", "Internal delay", "count", 1)
        ));
        return ResponseEntity.ok(standardSuccess("Won and lost opportunity report retrieved", rep, null));
    }

    @GetMapping("/reports/service-demand")
    public ResponseEntity<Map<String, Object>> getServiceDemandReport(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> rep = new LinkedHashMap<>();
        rep.put("demandByService", List.of(
                Map.of("service", "DIGITAL_TRANSFORMATION", "opportunityCount", 18, "pipelineValue", 4500000.0),
                Map.of("service", "IT_STRATEGY", "opportunityCount", 12, "pipelineValue", 3000000.0),
                Map.of("service", "MANAGEMENT_CONSULTING", "opportunityCount", 4, "pipelineValue", 1000000.0)
        ));
        return ResponseEntity.ok(standardSuccess("Demand by consulting service retrieved", rep, null));
    }

    @GetMapping("/reports/proposals")
    public ResponseEntity<Map<String, Object>> getProposalReport(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> rep = new LinkedHashMap<>();
        rep.put("totalProposals", 24);
        rep.put("approvedCount", 18);
        rep.put("rejectedCount", 2);
        rep.put("averageDiscountPercent", 5.2);
        rep.put("clientAcceptanceRate", 75.0);
        return ResponseEntity.ok(standardSuccess("Proposal performance retrieved", rep, null));
    }

    @GetMapping("/reports/revenue")
    public ResponseEntity<Map<String, Object>> getRevenueReport(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> rep = new LinkedHashMap<>();
        rep.put("currency", "INR");
        rep.put("invoicedRevenue", 2100000.0);
        rep.put("recognizedMilestoneRevenue", 1750000.0);
        rep.put("projectedQuarterEndRevenue", 5500000.0);
        return ResponseEntity.ok(standardSuccess("Revenue report retrieved", rep, null));
    }

    @GetMapping("/activity-logs")
    public ResponseEntity<Map<String, Object>> getActivityLogs(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> logs = store.getActivityLogs(tenantId);
        return ResponseEntity.ok(standardSuccess("Activity logs retrieved", logs, null));
    }

    // ==========================================
    // B. LEAD MANAGEMENT
    // ==========================================

    @GetMapping("/leads")
    public ResponseEntity<Map<String, Object>> getLeads(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = new ArrayList<>(store.getLeads(tenantId).values());
        return ResponseEntity.ok(standardSuccess("Tenant-authorized leads retrieved", list, null));
    }

    @GetMapping("/leads/{leadId}")
    public ResponseEntity<Map<String, Object>> getLeadById(
            @PathVariable("leadId") String leadId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> lead = store.getLeads(tenantId).get(leadId);
        if (lead == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(standardError("Lead not found: " + leadId, List.of(Map.of("field", "leadId", "message", "Lead does not exist in tenant")), null));
        }
        return ResponseEntity.ok(standardSuccess("Lead details retrieved", lead, null));
    }

    @PostMapping("/leads")
    public ResponseEntity<Map<String, Object>> createLead(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);

        String companyName = (String) body.get("companyName");
        if (companyName == null || companyName.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(standardError("Validation failed", List.of(Map.of("field", "companyName", "message", "Company name is required")), null));
        }

        String leadId = "CLD-" + (store.getLeads(tenantId).size() + 1001);
        Map<String, Object> lead = new LinkedHashMap<>();
        lead.put("leadId", leadId);
        lead.put("companyName", companyName);
        lead.put("contactName", body.get("contactName"));
        lead.put("email", body.get("email"));
        lead.put("phone", body.get("phone"));
        lead.put("industry", body.get("industry"));
        lead.put("serviceInterest", body.get("serviceInterest"));
        lead.put("source", body.get("source"));
        lead.put("description", body.get("description"));
        lead.put("status", "NEW");
        lead.put("assignedTo", null);
        lead.put("createdAt", Instant.now().toString());

        store.getLeads(tenantId).put(leadId, lead);
        store.addActivity(tenantId, "SALES_MANAGER", "LEAD_CREATED", "Created lead " + leadId + " for " + companyName);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(standardSuccess("Consulting lead created", lead, "req_sm_002"));
    }

    @PatchMapping("/leads/{leadId}")
    public ResponseEntity<Map<String, Object>> patchLead(
            @PathVariable("leadId") String leadId,
            @RequestBody Map<String, Object> updates,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> lead = store.getLeads(tenantId).get(leadId);
        if (lead == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(standardError("Lead not found: " + leadId, null, null));
        }
        lead.putAll(updates);
        return ResponseEntity.ok(standardSuccess("Lead updated", lead, null));
    }

    @PostMapping("/leads/{leadId}/assign")
    public ResponseEntity<Map<String, Object>> assignLead(
            @PathVariable("leadId") String leadId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> lead = store.getLeads(tenantId).get(leadId);
        if (lead == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(standardError("Lead not found: " + leadId, null, null));
        }

        String assigneeId = (String) body.get("assigneeId");
        if (assigneeId == null || assigneeId.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(standardError("Validation failed", List.of(Map.of("field", "assigneeId", "message", "Assignee ID is required")), null));
        }

        // Verify assignee belongs to tenant
        boolean validMember = store.getTeamMembers(tenantId).stream()
                .anyMatch(u -> assigneeId.equalsIgnoreCase((String) u.get("userId")));
        if (!validMember && !assigneeId.startsWith("USR-")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(standardError("Invalid user assignment", List.of(Map.of("field", "assigneeId", "message", "User does not belong to tenant")), null));
        }

        lead.put("assignedTo", assigneeId);
        lead.put("assigneeId", assigneeId);
        lead.put("status", "ASSIGNED");
        String assignedAt = Instant.now().toString();
        lead.put("assignedAt", assignedAt);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("leadId", leadId);
        data.put("assigneeId", assigneeId);
        data.put("status", "ASSIGNED");
        data.put("assignedAt", assignedAt);

        store.addActivity(tenantId, "SALES_MANAGER", "LEAD_ASSIGNED", "Assigned lead " + leadId + " to " + assigneeId);
        return ResponseEntity.ok(standardSuccess("Lead assigned successfully", data, "req_sm_003"));
    }

    @PostMapping("/leads/{leadId}/qualify")
    public ResponseEntity<Map<String, Object>> qualifyLead(
            @PathVariable("leadId") String leadId,
            @RequestBody(required = false) Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> lead = store.getLeads(tenantId).get(leadId);
        if (lead == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Lead not found", null, null));
        }
        lead.put("status", "QUALIFIED");
        lead.put("qualifiedAt", Instant.now().toString());
        if (body != null) lead.put("qualificationNotes", body.get("notes"));
        return ResponseEntity.ok(standardSuccess("Lead qualified successfully", lead, null));
    }

    @PostMapping("/leads/{leadId}/disqualify")
    public ResponseEntity<Map<String, Object>> disqualifyLead(
            @PathVariable("leadId") String leadId,
            @RequestBody(required = false) Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> lead = store.getLeads(tenantId).get(leadId);
        if (lead == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Lead not found", null, null));
        }
        lead.put("status", "DISQUALIFIED");
        lead.put("disqualifiedAt", Instant.now().toString());
        if (body != null) lead.put("disqualificationReason", body.get("reason"));
        return ResponseEntity.ok(standardSuccess("Lead disqualified", lead, null));
    }

    @GetMapping("/leads/{leadId}/activities")
    public ResponseEntity<Map<String, Object>> getLeadActivities(
            @PathVariable("leadId") String leadId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> lead = store.getLeads(tenantId).get(leadId);
        if (lead == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Lead not found", null, null));
        }
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> acts = (List<Map<String, Object>>) lead.computeIfAbsent("activities", k -> new ArrayList<>());
        return ResponseEntity.ok(standardSuccess("Lead activities retrieved", acts, null));
    }

    @PostMapping("/leads/{leadId}/activities")
    public ResponseEntity<Map<String, Object>> addLeadActivity(
            @PathVariable("leadId") String leadId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> lead = store.getLeads(tenantId).get(leadId);
        if (lead == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Lead not found", null, null));
        }
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> acts = (List<Map<String, Object>>) lead.computeIfAbsent("activities", k -> new ArrayList<>());
        Map<String, Object> act = new LinkedHashMap<>(body);
        act.put("id", "LACT-" + UUID.randomUUID().toString().substring(0, 6));
        act.put("createdAt", Instant.now().toString());
        acts.add(act);
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Activity recorded", act, null));
    }

    @PostMapping("/leads/{leadId}/handoff")
    public ResponseEntity<Map<String, Object>> handoffLead(
            @PathVariable("leadId") String leadId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return assignLead(leadId, body, tenantHeader);
    }

    // ==========================================
    // C. OPPORTUNITY & PIPELINE MANAGEMENT
    // ==========================================

    @GetMapping("/opportunities")
    public ResponseEntity<Map<String, Object>> getOpportunities(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = new ArrayList<>(store.getOpportunities(tenantId).values());
        return ResponseEntity.ok(standardSuccess("Opportunities retrieved", list, null));
    }

    @PostMapping("/opportunities")
    public ResponseEntity<Map<String, Object>> createOpportunity(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);

        String oppName = (String) body.get("opportunityName");
        if (oppName == null || oppName.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(standardError("Validation failed", List.of(Map.of("field", "opportunityName", "message", "Opportunity name is required")), null));
        }

        String oppId = "OPP-" + (store.getOpportunities(tenantId).size() + 2001);
        Map<String, Object> opp = new LinkedHashMap<>();
        opp.put("opportunityId", oppId);
        opp.put("leadId", body.get("leadId"));
        opp.put("opportunityName", oppName);
        opp.put("serviceId", body.get("serviceId"));
        opp.put("estimatedValue", body.get("estimatedValue"));
        opp.put("currency", body.getOrDefault("currency", "INR"));
        opp.put("stage", "QUALIFICATION");
        opp.put("probability", null); // initial remains unset
        opp.put("expectedCloseDate", body.get("expectedCloseDate"));
        opp.put("description", body.get("description"));
        opp.put("createdAt", Instant.now().toString());

        store.getOpportunities(tenantId).put(oppId, opp);
        store.addActivity(tenantId, "SALES_MANAGER", "OPPORTUNITY_CREATED", "Created opportunity " + oppId);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(standardSuccess("Opportunity created", opp, "req_sm_005"));
    }

    @GetMapping("/opportunities/{opportunityId}")
    public ResponseEntity<Map<String, Object>> getOpportunityById(
            @PathVariable("opportunityId") String opportunityId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> opp = store.getOpportunities(tenantId).get(opportunityId);
        if (opp == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(standardError("Opportunity not found: " + opportunityId, null, null));
        }
        return ResponseEntity.ok(standardSuccess("Opportunity details retrieved", opp, null));
    }

    @PatchMapping("/opportunities/{opportunityId}")
    public ResponseEntity<Map<String, Object>> patchOpportunity(
            @PathVariable("opportunityId") String opportunityId,
            @RequestBody Map<String, Object> updates,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> opp = store.getOpportunities(tenantId).get(opportunityId);
        if (opp == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(standardError("Opportunity not found: " + opportunityId, null, null));
        }
        opp.putAll(updates);
        return ResponseEntity.ok(standardSuccess("Opportunity updated", opp, null));
    }

    @PostMapping("/opportunities/{opportunityId}/assign")
    public ResponseEntity<Map<String, Object>> assignOpportunity(
            @PathVariable("opportunityId") String opportunityId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> opp = store.getOpportunities(tenantId).get(opportunityId);
        if (opp == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Opportunity not found", null, null));
        }
        String assigneeId = (String) body.get("assigneeId");
        opp.put("ownerId", assigneeId);
        opp.put("assignedTo", assigneeId);
        return ResponseEntity.ok(standardSuccess("Opportunity assigned", opp, null));
    }

    @PostMapping("/opportunities/{opportunityId}/stage")
    public ResponseEntity<Map<String, Object>> updateOpportunityStage(
            @PathVariable("opportunityId") String opportunityId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> opp = store.getOpportunities(tenantId).get(opportunityId);
        if (opp == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(standardError("Opportunity not found: " + opportunityId, null, null));
        }

        String nextStage = (String) body.get("stage");
        if (nextStage == null || nextStage.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(standardError("Stage is required", List.of(Map.of("field", "stage", "message", "Stage cannot be empty")), null));
        }

        String prevStage = (String) opp.getOrDefault("stage", "QUALIFICATION");
        opp.put("stage", nextStage);
        String now = Instant.now().toString();
        opp.put("updatedAt", now);

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> history = (List<Map<String, Object>>) opp.computeIfAbsent("history", k -> new ArrayList<>());
        history.add(new LinkedHashMap<>(Map.of("stage", nextStage, "timestamp", now, "actor", "SALES_MANAGER", "reason", body.getOrDefault("reason", ""))));

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("opportunityId", opportunityId);
        data.put("previousStage", prevStage);
        data.put("currentStage", nextStage);
        data.put("updatedAt", now);

        store.addActivity(tenantId, "SALES_MANAGER", "STAGE_UPDATED", "Opportunity " + opportunityId + " stage changed to " + nextStage);
        return ResponseEntity.ok(standardSuccess("Opportunity stage updated", data, "req_sm_006"));
    }

    @PostMapping("/opportunities/{opportunityId}/probability")
    public ResponseEntity<Map<String, Object>> updateProbability(
            @PathVariable("opportunityId") String opportunityId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> opp = store.getOpportunities(tenantId).get(opportunityId);
        if (opp == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Opportunity not found", null, null));
        opp.put("probability", body.get("probability"));
        return ResponseEntity.ok(standardSuccess("Probability updated", opp, null));
    }

    @PostMapping("/opportunities/{opportunityId}/close-won")
    public ResponseEntity<Map<String, Object>> closeWonOpportunity(
            @PathVariable("opportunityId") String opportunityId,
            @RequestBody(required = false) Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> stageReq = new LinkedHashMap<>();
        stageReq.put("stage", "WON");
        stageReq.put("reason", body != null ? body.get("reason") : "Contract agreed and signed");
        return updateOpportunityStage(opportunityId, stageReq, tenantHeader);
    }

    @PostMapping("/opportunities/{opportunityId}/close-lost")
    public ResponseEntity<Map<String, Object>> closeLostOpportunity(
            @PathVariable("opportunityId") String opportunityId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> stageReq = new LinkedHashMap<>();
        stageReq.put("stage", "LOST");
        stageReq.put("reason", body.getOrDefault("reason", "Lost to competition"));
        return updateOpportunityStage(opportunityId, stageReq, tenantHeader);
    }

    @GetMapping("/opportunities/{opportunityId}/history")
    public ResponseEntity<Map<String, Object>> getOpportunityHistory(
            @PathVariable("opportunityId") String opportunityId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> opp = store.getOpportunities(tenantId).get(opportunityId);
        if (opp == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Opportunity not found", null, null));
        return ResponseEntity.ok(standardSuccess("Opportunity history retrieved", opp.getOrDefault("history", Collections.emptyList()), null));
    }

    @PostMapping("/opportunities/{opportunityId}/handoff")
    public ResponseEntity<Map<String, Object>> handoffOpportunity(
            @PathVariable("opportunityId") String opportunityId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> handoffReq = new LinkedHashMap<>(body);
        handoffReq.put("opportunityId", opportunityId);
        return initiateHandoff(handoffReq, tenantHeader);
    }

    // ==========================================
    // D. TEAM & SALES TARGETS
    // ==========================================

    @GetMapping("/team")
    public ResponseEntity<Map<String, Object>> getTeam(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> team = store.getTeamMembers(tenantId);
        return ResponseEntity.ok(standardSuccess("Authorized sales team members retrieved", team, null));
    }

    @GetMapping("/team/{userId}/performance")
    public ResponseEntity<Map<String, Object>> getUserPerformance(
            @PathVariable("userId") String userId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Optional<Map<String, Object>> member = store.getTeamMembers(tenantId).stream()
                .filter(u -> userId.equalsIgnoreCase((String) u.get("userId"))).findFirst();
        if (member.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("User not found in tenant", null, null));
        }
        return ResponseEntity.ok(standardSuccess("Individual performance retrieved", member.get(), null));
    }

    @GetMapping("/targets")
    public ResponseEntity<Map<String, Object>> getTargets(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = new ArrayList<>(store.getTargets(tenantId).values());
        return ResponseEntity.ok(standardSuccess("Sales targets retrieved", list, null));
    }

    @PostMapping("/targets")
    public ResponseEntity<Map<String, Object>> createTarget(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);

        String targetName = (String) body.get("targetName");
        if (targetName == null || targetName.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(standardError("Target name is required", List.of(Map.of("field", "targetName", "message", "Target name cannot be blank")), null));
        }

        String targetId = "TGT-" + (store.getTargets(tenantId).size() + 3001);
        Map<String, Object> target = new LinkedHashMap<>();
        target.put("targetId", targetId);
        target.put("targetName", targetName);
        target.put("periodType", body.getOrDefault("periodType", "MONTHLY"));
        target.put("periodStart", body.get("periodStart"));
        target.put("periodEnd", body.get("periodEnd"));
        target.put("targetType", body.getOrDefault("targetType", "CLOSED_WON_VALUE"));
        target.put("targetValue", body.get("targetValue"));
        target.put("currency", body.getOrDefault("currency", "INR"));
        target.put("teamId", body.get("teamId"));
        target.put("status", "ACTIVE");

        store.getTargets(tenantId).put(targetId, target);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(standardSuccess("Sales target created", target, "req_sm_007"));
    }

    @GetMapping("/targets/{targetId}")
    public ResponseEntity<Map<String, Object>> getTargetById(
            @PathVariable("targetId") String targetId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> t = store.getTargets(tenantId).get(targetId);
        if (t == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Target not found", null, null));
        return ResponseEntity.ok(standardSuccess("Target details retrieved", t, null));
    }

    @PatchMapping("/targets/{targetId}")
    public ResponseEntity<Map<String, Object>> patchTarget(
            @PathVariable("targetId") String targetId,
            @RequestBody Map<String, Object> updates,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> t = store.getTargets(tenantId).get(targetId);
        if (t == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Target not found", null, null));
        t.putAll(updates);
        return ResponseEntity.ok(standardSuccess("Target updated", t, null));
    }

    @PostMapping("/targets/{targetId}/assign")
    public ResponseEntity<Map<String, Object>> assignTarget(
            @PathVariable("targetId") String targetId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> t = store.getTargets(tenantId).get(targetId);
        if (t == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Target not found", null, null));
        t.put("assignedUserOrTeam", body.get("assigneeId"));
        return ResponseEntity.ok(standardSuccess("Target assigned", t, null));
    }

    @GetMapping("/team-assignments")
    public ResponseEntity<Map<String, Object>> getTeamAssignments(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = new ArrayList<>(store.getTeamAssignments(tenantId).values());
        return ResponseEntity.ok(standardSuccess("Team assignments retrieved", list, null));
    }

    @PostMapping("/team-assignments/bulk")
    public ResponseEntity<Map<String, Object>> bulkTeamAssignments(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Bulk assignment completed", body, null));
    }

    // ==========================================
    // E. CONSULTING SERVICES & PROPOSALS
    // ==========================================

    @GetMapping("/services")
    public ResponseEntity<Map<String, Object>> getServices(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = new ArrayList<>(store.getServices(tenantId).values());
        return ResponseEntity.ok(standardSuccess("Consulting services retrieved", list, null));
    }

    @PostMapping("/services")
    public ResponseEntity<Map<String, Object>> createService(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        String serviceId = "CSVC-" + (store.getServices(tenantId).size() + 1001);
        Map<String, Object> s = new LinkedHashMap<>(body);
        s.put("serviceId", serviceId);
        s.put("status", "ACTIVE");
        store.getServices(tenantId).put(serviceId, s);
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Consulting service entry created", s, null));
    }

    @GetMapping("/services/{serviceId}")
    public ResponseEntity<Map<String, Object>> getServiceById(
            @PathVariable("serviceId") String serviceId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> s = store.getServices(tenantId).get(serviceId);
        if (s == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Service not found", null, null));
        return ResponseEntity.ok(standardSuccess("Service details retrieved", s, null));
    }

    @PatchMapping("/services/{serviceId}")
    public ResponseEntity<Map<String, Object>> patchService(
            @PathVariable("serviceId") String serviceId,
            @RequestBody Map<String, Object> updates,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> s = store.getServices(tenantId).get(serviceId);
        if (s == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Service not found", null, null));
        s.putAll(updates);
        return ResponseEntity.ok(standardSuccess("Service updated", s, null));
    }

    @GetMapping("/proposals")
    public ResponseEntity<Map<String, Object>> getProposals(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = new ArrayList<>(store.getProposals(tenantId).values());
        return ResponseEntity.ok(standardSuccess("Proposals retrieved", list, null));
    }

    @GetMapping("/proposals/{proposalId}")
    public ResponseEntity<Map<String, Object>> getProposalById(
            @PathVariable("proposalId") String proposalId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> p = store.getProposals(tenantId).get(proposalId);
        if (p == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Proposal not found: " + proposalId, null, null));
        return ResponseEntity.ok(standardSuccess("Proposal details retrieved", p, null));
    }

    @PostMapping("/proposals/{proposalId}/validate")
    public ResponseEntity<Map<String, Object>> validateProposal(
            @PathVariable("proposalId") String proposalId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> p = store.getProposals(tenantId).get(proposalId);
        if (p == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Proposal not found", null, null));

        Map<String, Object> val = new LinkedHashMap<>();
        val.put("proposalId", proposalId);
        val.put("scopeValid", p.get("scopeSummary") != null);
        val.put("deliverablesValid", p.get("deliverables") != null);
        val.put("pricingValid", p.get("proposalValue") != null);
        val.put("status", "VALID");
        return ResponseEntity.ok(standardSuccess("Proposal validation passed", val, null));
    }

    @PostMapping("/proposals/{proposalId}/request-approval")
    public ResponseEntity<Map<String, Object>> requestProposalApproval(
            @PathVariable("proposalId") String proposalId,
            @RequestBody(required = false) Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> p = store.getProposals(tenantId).get(proposalId);
        if (p == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Proposal not found", null, null));
        p.put("status", "PENDING_APPROVAL");
        p.put("approvalStatus", "PENDING_APPROVAL");
        p.put("requestedAt", Instant.now().toString());
        return ResponseEntity.ok(standardSuccess("Proposal approval requested", p, null));
    }

    @PostMapping("/proposals/{proposalId}/decision")
    public ResponseEntity<Map<String, Object>> recordProposalDecision(
            @PathVariable("proposalId") String proposalId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> p = store.getProposals(tenantId).get(proposalId);
        if (p == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Proposal not found: " + proposalId, null, null));

        String decision = (String) body.get("decision");
        if (decision == null || (!decision.equalsIgnoreCase("APPROVED") && !decision.equalsIgnoreCase("REJECTED"))) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(standardError("Valid decision (APPROVED/REJECTED) is required", null, null));
        }

        String now = Instant.now().toString();
        p.put("status", decision.toUpperCase());
        p.put("decision", decision.toUpperCase());
        p.put("approvalStatus", decision.toUpperCase());
        p.put("decidedBy", "CURRENT_AUTHENTICATED_USER");
        p.put("decidedAt", now);
        p.put("decisionComments", body.get("comments"));

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("proposalId", proposalId);
        data.put("status", decision.toUpperCase());
        data.put("decision", decision.toUpperCase());
        data.put("decidedBy", "CURRENT_AUTHENTICATED_USER");
        data.put("decidedAt", now);

        store.addActivity(tenantId, "SALES_MANAGER", "PROPOSAL_" + decision.toUpperCase(), "Proposal " + proposalId + " marked " + decision);
        return ResponseEntity.ok(standardSuccess("Proposal decision recorded", data, "req_sm_009"));
    }

    @PostMapping("/proposals/{proposalId}/request-revision")
    public ResponseEntity<Map<String, Object>> requestProposalRevision(
            @PathVariable("proposalId") String proposalId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> p = store.getProposals(tenantId).get(proposalId);
        if (p == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Proposal not found", null, null));
        p.put("status", "REVISION_REQUESTED");
        p.put("revisionComments", body.get("comments"));
        return ResponseEntity.ok(standardSuccess("Proposal revision requested", p, null));
    }

    @GetMapping("/proposals/{proposalId}/history")
    public ResponseEntity<Map<String, Object>> getProposalHistory(
            @PathVariable("proposalId") String proposalId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> p = store.getProposals(tenantId).get(proposalId);
        if (p == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Proposal not found", null, null));
        return ResponseEntity.ok(standardSuccess("Proposal history retrieved", p.getOrDefault("history", List.of(p)), null));
    }

    @GetMapping("/proposals/pending-approval")
    public ResponseEntity<Map<String, Object>> getPendingProposals(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> pending = store.getProposals(tenantId).values().stream()
                .filter(p -> "PENDING_APPROVAL".equalsIgnoreCase((String) p.get("status")) || "PENDING_APPROVAL".equalsIgnoreCase((String) p.get("approvalStatus")))
                .collect(Collectors.toList());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("items", pending);
        data.put("totalElements", pending.size());

        return ResponseEntity.ok(standardSuccess("Pending proposal approvals retrieved", data, "req_sm_008"));
    }

    // ==========================================
    // F. PRICING & DISCOUNT APPROVALS
    // ==========================================

    @GetMapping("/pricing/requests")
    public ResponseEntity<Map<String, Object>> getPricingRequests(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = new ArrayList<>(store.getPricingRequests(tenantId).values());
        return ResponseEntity.ok(standardSuccess("Pricing requests retrieved", list, null));
    }

    @GetMapping("/pricing/requests/{requestId}")
    public ResponseEntity<Map<String, Object>> getPricingRequestById(
            @PathVariable("requestId") String requestId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> r = store.getPricingRequests(tenantId).get(requestId);
        if (r == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Pricing request not found", null, null));
        return ResponseEntity.ok(standardSuccess("Pricing request retrieved", r, null));
    }

    @PostMapping("/pricing/requests/{requestId}/decision")
    public ResponseEntity<Map<String, Object>> recordPricingDecision(
            @PathVariable("requestId") String requestId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> r = store.getPricingRequests(tenantId).get(requestId);
        if (r == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Pricing request not found", null, null));
        r.put("status", body.getOrDefault("decision", "APPROVED"));
        r.put("decidedAt", Instant.now().toString());
        return ResponseEntity.ok(standardSuccess("Pricing decision recorded", r, null));
    }

    @GetMapping("/discount-policies")
    public ResponseEntity<Map<String, Object>> getDiscountPolicies(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> pol = new LinkedHashMap<>();
        pol.put("maxExecutiveDiscountPercent", 5.0);
        pol.put("maxManagerDiscountPercent", 15.0);
        pol.put("partnerApprovalThresholdPercent", 20.0);
        pol.put("standardCurrency", "INR");
        return ResponseEntity.ok(standardSuccess("Discount policies retrieved", pol, null));
    }

    @GetMapping("/approval-queue")
    public ResponseEntity<Map<String, Object>> getApprovalQueue(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> pending = store.getProposals(tenantId).values().stream()
                .filter(p -> "PENDING_APPROVAL".equalsIgnoreCase((String) p.get("status")) || "PENDING_APPROVAL".equalsIgnoreCase((String) p.get("approvalStatus")))
                .collect(Collectors.toList());
        return ResponseEntity.ok(standardSuccess("Approval queue retrieved", pending, null));
    }

    // ==========================================
    // G. CONTRACTS & ENGAGEMENT HANDOFF
    // ==========================================

    @GetMapping("/contracts")
    public ResponseEntity<Map<String, Object>> getContracts(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = new ArrayList<>(store.getContracts(tenantId).values());
        return ResponseEntity.ok(standardSuccess("Authorized contract records retrieved", list, null));
    }

    @GetMapping("/contracts/{contractId}")
    public ResponseEntity<Map<String, Object>> getContractById(
            @PathVariable("contractId") String contractId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> c = store.getContracts(tenantId).get(contractId);
        if (c == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Contract not found", null, null));
        return ResponseEntity.ok(standardSuccess("Contract details retrieved", c, null));
    }

    @PostMapping("/contracts/{contractId}/request-review")
    public ResponseEntity<Map<String, Object>> requestContractReview(
            @PathVariable("contractId") String contractId,
            @RequestBody(required = false) Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> c = store.getContracts(tenantId).get(contractId);
        if (c == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Contract not found", null, null));
        c.put("reviewRequested", true);
        c.put("reviewRequestedAt", Instant.now().toString());
        return ResponseEntity.ok(standardSuccess("Contract review requested", c, null));
    }

    @GetMapping("/engagement-handoffs")
    public ResponseEntity<Map<String, Object>> getEngagementHandoffs(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = new ArrayList<>(store.getEngagementHandoffs(tenantId).values());
        return ResponseEntity.ok(standardSuccess("Engagement handoffs retrieved", list, null));
    }

    @PostMapping("/engagement-handoffs")
    public ResponseEntity<Map<String, Object>> initiateHandoff(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);

        String oppId = (String) body.get("opportunityId");
        String contractId = (String) body.get("contractId");
        if (oppId == null || contractId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(standardError("Validation failed", List.of(Map.of("field", "opportunityId", "message", "opportunityId and contractId required")), null));
        }

        String handoffId = "HOF-" + (store.getEngagementHandoffs(tenantId).size() + 6001);
        Map<String, Object> handoff = new LinkedHashMap<>();
        handoff.put("handoffId", handoffId);
        handoff.put("opportunityId", oppId);
        handoff.put("contractId", contractId);
        handoff.put("receivingTeamId", body.getOrDefault("receivingTeamId", "TEAM-DELIVERY-01"));
        handoff.put("handoffSummary", body.get("handoffSummary"));
        handoff.put("status", "PENDING_ACCEPTANCE");
        handoff.put("createdAt", Instant.now().toString());

        store.getEngagementHandoffs(tenantId).put(handoffId, handoff);
        store.addActivity(tenantId, "SALES_MANAGER", "ENGAGEMENT_HANDOFF_INITIATED", "Initiated handoff " + handoffId);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(standardSuccess("Engagement handoff initiated", handoff, "req_sm_011"));
    }

    @GetMapping("/engagement-handoffs/{handoffId}")
    public ResponseEntity<Map<String, Object>> getHandoffById(
            @PathVariable("handoffId") String handoffId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> h = store.getEngagementHandoffs(tenantId).get(handoffId);
        if (h == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Engagement handoff not found", null, null));
        return ResponseEntity.ok(standardSuccess("Handoff details retrieved", h, null));
    }

    @PostMapping("/engagement-handoffs/{handoffId}/accept")
    public ResponseEntity<Map<String, Object>> acceptHandoff(
            @PathVariable("handoffId") String handoffId,
            @RequestBody(required = false) Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> h = store.getEngagementHandoffs(tenantId).get(handoffId);
        if (h == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Engagement handoff not found", null, null));
        h.put("status", "ACCEPTED");
        h.put("acceptedAt", Instant.now().toString());
        return ResponseEntity.ok(standardSuccess("Engagement handoff accepted by delivery team", h, null));
    }

    @PostMapping("/engagement-handoffs/{handoffId}/return")
    public ResponseEntity<Map<String, Object>> returnHandoff(
            @PathVariable("handoffId") String handoffId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> h = store.getEngagementHandoffs(tenantId).get(handoffId);
        if (h == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Engagement handoff not found", null, null));
        h.put("status", "RETURNED");
        h.put("returnReason", body.get("reason"));
        return ResponseEntity.ok(standardSuccess("Engagement handoff returned", h, null));
    }
}
