package com.zenelait.crm.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Zenelait AI CRM — Analyst V1 REST API Controller
 * Provides read-only analytical aggregations across sales funnels, lead sources,
 * conversion velocity, revenue pipelines, marketing attribution, support SLAs,
 * AI agent metrics, custom report definitions, asynchronous executions, and export jobs.
 */
@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class SoftwareAnalystV1Controller {

    private final List<Map<String, Object>> savedReports = new ArrayList<>();
    private final Map<String, Map<String, Object>> reportRuns = new LinkedHashMap<>();
    private final Map<String, Map<String, Object>> exports = new LinkedHashMap<>();

    public SoftwareAnalystV1Controller() {
        initAnalystData();
    }

    private void initAnalystData() {
        // Saved Reports
        Map<String, Object> rpt1 = new LinkedHashMap<>();
        rpt1.put("reportId", "RPT-1001");
        rpt1.put("name", "Monthly Lead Conversion Report");
        rpt1.put("reportType", "LEAD_CONVERSION");
        rpt1.put("status", "SAVED");
        rpt1.put("groupBy", "SOURCE");
        rpt1.put("filters", Map.of(
                "from", "2026-10-01",
                "to", "2026-10-31",
                "leadSources", List.of("WEBSITE", "EMAIL_CAMPAIGN", "REFERRAL")
        ));
        rpt1.put("columns", List.of("source", "totalLeads", "qualifiedLeads", "opportunities", "conversionPercent"));
        rpt1.put("createdBy", "USR-AN-001");
        savedReports.add(rpt1);

        Map<String, Object> rpt2 = new LinkedHashMap<>();
        rpt2.put("reportId", "RPT-1002");
        rpt2.put("name", "Executive Revenue Pipeline Velocity");
        rpt2.put("reportType", "REVENUE_PIPELINE");
        rpt2.put("status", "SAVED");
        rpt2.put("groupBy", "EXECUTIVE");
        rpt2.put("createdBy", "USR-AN-001");
        savedReports.add(rpt2);

        // Seeded completed run
        Map<String, Object> run1 = new LinkedHashMap<>();
        run1.put("runId", "RUN-1001");
        run1.put("reportId", "RPT-1001");
        run1.put("status", "COMPLETED");
        run1.put("rowCount", 3);
        run1.put("resultEndpoint", "/api/v1/report-runs/RUN-1001/results");
        run1.put("completedAt", LocalDateTime.now().minusMinutes(5).toString());
        run1.put("format", "JSON");
        reportRuns.put("RUN-1001", run1);
    }

    private Map<String, Object> envelope(String message, Object data, String requestId) {
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("message", message);
        res.put("data", data);
        res.put("timestamp", LocalDateTime.now().toString());
        res.put("requestId", requestId != null ? requestId : "req_an_" + (System.currentTimeMillis() % 100000));
        return res;
    }

    // =========================================================================
    // 1. ANALYTICS AGGREGATIONS
    // =========================================================================

    @GetMapping("/analytics/sales-funnel")
    public ResponseEntity<Map<String, Object>> getSalesFunnel(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to
    ) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("period", Map.of("from", from != null ? from : "2026-10-01", "to", to != null ? to : "2026-10-24"));
        data.put("stages", List.of(
                Map.of("stage", "NEW_LEAD", "count", 420),
                Map.of("stage", "QUALIFIED", "count", 125),
                Map.of("stage", "OPPORTUNITY", "count", 64),
                Map.of("stage", "WON", "count", 12)
        ));
        data.put("leadToQualifiedPercent", 29.76);
        data.put("qualifiedToOpportunityPercent", 51.2);
        data.put("opportunityToWonPercent", 18.75);

        return ResponseEntity.ok(envelope("Sales funnel retrieved", data, "req_an_002"));
    }

    @GetMapping("/analytics/lead-sources")
    public ResponseEntity<Map<String, Object>> getLeadSources(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to
    ) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("sources", List.of(
                Map.of("source", "WEBSITE", "leads", 180, "qualifiedLeads", 62, "opportunities", 24, "conversionPercent", 13.33),
                Map.of("source", "EMAIL_CAMPAIGN", "leads", 120, "qualifiedLeads", 38, "opportunities", 18, "conversionPercent", 15.0),
                Map.of("source", "REFERRAL", "leads", 70, "qualifiedLeads", 25, "opportunities", 14, "conversionPercent", 20.0),
                Map.of("source", "LINKEDIN_ADS", "leads", 50, "qualifiedLeads", 18, "opportunities", 8, "conversionPercent", 16.0)
        ));
        return ResponseEntity.ok(envelope("Lead-source analytics retrieved", data, "req_an_003"));
    }

    @GetMapping("/analytics/conversions")
    public ResponseEntity<Map<String, Object>> getConversions() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("mqlToSqlRate", 48.5);
        data.put("sqlToOpportunityRate", 62.0);
        data.put("oppToWonRate", 24.2);
        data.put("avgSalesCycleDays", 18.4);
        data.put("topPerformingChannel", "REFERRAL");
        return ResponseEntity.ok(envelope("Conversion metrics retrieved", data, "req_an_conv_001"));
    }

    @GetMapping("/analytics/revenue-pipeline")
    public ResponseEntity<Map<String, Object>> getRevenuePipeline() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("pipelineTotal", 4200000);
        data.put("wonRevenue", 1250000);
        data.put("weightedPipeline", 2850000);
        data.put("currency", "INR");
        data.put("byStage", List.of(
                Map.of("stage", "DISCOVERY", "value", 1200000, "count", 22),
                Map.of("stage", "PROPOSAL", "value", 1800000, "count", 28),
                Map.of("stage", "NEGOTIATION", "value", 1200000, "count", 14)
        ));
        return ResponseEntity.ok(envelope("Revenue pipeline retrieved", data, "req_an_rev_001"));
    }

    @GetMapping("/analytics/marketing")
    public ResponseEntity<Map<String, Object>> getMarketingAnalytics() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("totalCampaignSpend", 150000);
        data.put("costPerMql", 1200);
        data.put("attributedRevenue", 1800000);
        data.put("blendedRoas", 12.0);
        data.put("topCampaign", "Enterprise CRM Lead Generation");
        return ResponseEntity.ok(envelope("Marketing analytics retrieved", data, "req_an_mkt_001"));
    }

    @GetMapping("/analytics/support")
    public ResponseEntity<Map<String, Object>> getSupportAnalytics() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("totalTicketsHandled", 820);
        data.put("firstContactResolutionRate", 76.5);
        data.put("slaCompliancePercent", 94.51);
        data.put("averageResolutionHours", 4.8);
        data.put("csatScore", 91.2);
        return ResponseEntity.ok(envelope("Support analytics retrieved", data, "req_an_sup_001"));
    }

    @GetMapping("/analytics/ai-agents")
    public ResponseEntity<Map<String, Object>> getAiAgentsAnalytics(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to
    ) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("agents", List.of(
                Map.of(
                        "agentId", "AI-SALES-001",
                        "agentName", "Software Sales Assistant",
                        "conversations", 850,
                        "completedWithoutHandoff", 610,
                        "humanHandoffs", 120,
                        "failedRuns", 12,
                        "leadsCreated", 95,
                        "averageResponseTimeMs", 950
                ),
                Map.of(
                        "agentId", "AI-SUPPORT-001",
                        "agentName", "IT Customer Support Assistant",
                        "conversations", 600,
                        "completedWithoutHandoff", 390,
                        "humanHandoffs", 90,
                        "failedRuns", 8,
                        "ticketsCreated", 145,
                        "averageResponseTimeMs", 1100
                ),
                Map.of(
                        "agentId", "AI-FOLLOWUP-001",
                        "agentName", "Autonomous Follow-up Assistant",
                        "conversations", 420,
                        "completedWithoutHandoff", 385,
                        "humanHandoffs", 15,
                        "failedRuns", 4,
                        "leadsCreated", 28,
                        "averageResponseTimeMs", 450
                )
        ));
        return ResponseEntity.ok(envelope("AI agent analytics retrieved", data, "req_an_004"));
    }

    @GetMapping("/analytics/follow-ups")
    public ResponseEntity<Map<String, Object>> getFollowUpsAnalytics() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("tasksScheduled", 620);
        data.put("completionRate", 82.25);
        data.put("deliveryRate", 96.25);
        data.put("customerReplyRate", 23.75);
        data.put("conversionsAttributed", 28);
        return ResponseEntity.ok(envelope("Follow-up analytics retrieved", data, "req_an_fut_001"));
    }

    @GetMapping("/analytics/data-quality")
    public ResponseEntity<Map<String, Object>> getDataQuality() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("duplicateLeadCount", 4);
        data.put("leadsMissingPhone", 12);
        data.put("contactsMissingEmail", 2);
        data.put("dataCompletenessPercent", 96.8);
        data.put("recommendedFixes", List.of(
                "Merge duplicate lead 'Karthik Raj (ABC Tech)' with existing contact CON-1001",
                "Enforce phone number capture on inbound website gate forms"
        ));
        return ResponseEntity.ok(envelope("Data quality metrics retrieved", data, "req_an_dq_001"));
    }

    // =========================================================================
    // 2. SAVED REPORTS & RUNS
    // =========================================================================

    @GetMapping("/reports")
    public ResponseEntity<Map<String, Object>> getSavedReports() {
        return ResponseEntity.ok(envelope("Saved reports retrieved", savedReports, "req_an_rep_001"));
    }

    @PostMapping("/reports")
    public ResponseEntity<Map<String, Object>> createReportDefinition(@RequestBody Map<String, Object> body) {
        String newId = "RPT-" + (1000 + savedReports.size() + 1);
        Map<String, Object> rpt = new LinkedHashMap<>(body);
        rpt.put("reportId", newId);
        rpt.put("status", "SAVED");
        rpt.put("createdBy", "USR-AN-001");
        savedReports.add(0, rpt);

        return ResponseEntity.status(HttpStatus.CREATED).body(envelope("Report definition created", rpt, "req_an_005"));
    }

    @GetMapping("/reports/{reportId}")
    public ResponseEntity<Map<String, Object>> getReportDefinition(@PathVariable String reportId) {
        return savedReports.stream()
                .filter(r -> reportId.equalsIgnoreCase((String) r.get("reportId")))
                .findFirst()
                .map(r -> ResponseEntity.ok(envelope("Report definition retrieved", r, "req_an_rep_002")))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(envelope("Report not found", null, "req_err")));
    }

    @PatchMapping("/reports/{reportId}")
    public ResponseEntity<Map<String, Object>> updateReportDefinition(@PathVariable String reportId, @RequestBody Map<String, Object> body) {
        for (Map<String, Object> r : savedReports) {
            if (reportId.equalsIgnoreCase((String) r.get("reportId"))) {
                r.putAll(body);
                return ResponseEntity.ok(envelope("Report definition updated", r, "req_an_rep_003"));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(envelope("Report not found", null, "req_err"));
    }

    @PostMapping("/reports/{reportId}/run")
    public ResponseEntity<Map<String, Object>> runReport(@PathVariable String reportId, @RequestBody(required = false) Map<String, Object> body) {
        String runId = "RUN-" + (1000 + reportRuns.size() + 1);
        String format = body != null && body.containsKey("format") ? (String) body.get("format") : "JSON";

        Map<String, Object> run = new LinkedHashMap<>();
        run.put("runId", runId);
        run.put("reportId", reportId);
        run.put("status", "COMPLETED");
        run.put("rowCount", 3);
        run.put("resultEndpoint", "/api/v1/report-runs/" + runId + "/results");
        run.put("completedAt", LocalDateTime.now().toString());
        run.put("format", format);

        reportRuns.put(runId, run);

        Map<String, Object> ack = new LinkedHashMap<>();
        ack.put("runId", runId);
        ack.put("reportId", reportId);
        ack.put("status", "QUEUED");
        ack.put("format", format);

        return ResponseEntity.status(HttpStatus.ACCEPTED).body(envelope("Report execution queued", ack, "req_an_006"));
    }

    @GetMapping("/report-runs/{runId}")
    public ResponseEntity<Map<String, Object>> getReportRunStatus(@PathVariable String runId) {
        Map<String, Object> run = reportRuns.get(runId);
        if (run != null) {
            return ResponseEntity.ok(envelope("Report execution status retrieved", run, "req_an_007"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(envelope("Run not found", null, "req_err"));
    }

    @GetMapping("/report-runs/{runId}/results")
    public ResponseEntity<Map<String, Object>> getReportRunResults(@PathVariable String runId) {
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("columns", List.of("source", "totalLeads", "qualifiedLeads", "opportunities", "conversionPercent"));
        res.put("rows", List.of(
                Map.of("source", "WEBSITE", "totalLeads", 180, "qualifiedLeads", 62, "opportunities", 24, "conversionPercent", 13.33),
                Map.of("source", "EMAIL_CAMPAIGN", "totalLeads", 120, "qualifiedLeads", 38, "opportunities", 18, "conversionPercent", 15.0),
                Map.of("source", "REFERRAL", "totalLeads", 70, "qualifiedLeads", 25, "opportunities", 14, "conversionPercent", 20.0)
        ));
        res.put("rowCount", 3);

        return ResponseEntity.ok(envelope("Report results retrieved", res, "req_an_008"));
    }

    @PostMapping("/reports/{reportId}/schedule")
    public ResponseEntity<Map<String, Object>> scheduleReport(@PathVariable String reportId, @RequestBody Map<String, Object> body) {
        for (Map<String, Object> r : savedReports) {
            if (reportId.equalsIgnoreCase((String) r.get("reportId"))) {
                r.put("scheduleCron", body.getOrDefault("cron", "0 0 9 * * MON"));
                r.put("scheduleStatus", "ACTIVE");
                return ResponseEntity.ok(envelope("Report scheduled successfully", r, "req_an_sched_001"));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(envelope("Report not found", null, "req_err"));
    }

    @DeleteMapping("/reports/{reportId}/schedule")
    public ResponseEntity<Map<String, Object>> cancelReportSchedule(@PathVariable String reportId) {
        for (Map<String, Object> r : savedReports) {
            if (reportId.equalsIgnoreCase((String) r.get("reportId"))) {
                r.remove("scheduleCron");
                r.put("scheduleStatus", "INACTIVE");
                return ResponseEntity.ok(envelope("Report schedule cancelled", r, "req_an_sched_002"));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(envelope("Report not found", null, "req_err"));
    }

    // =========================================================================
    // 3. EXPORTS
    // =========================================================================

    @PostMapping("/exports")
    public ResponseEntity<Map<String, Object>> requestExport(@RequestBody Map<String, Object> body) {
        String exportId = "EXP-" + (1000 + exports.size() + 1);
        Map<String, Object> exp = new LinkedHashMap<>();
        exp.put("exportId", exportId);
        exp.put("dataset", body.getOrDefault("dataset", "LEADS_AND_DEALS"));
        exp.put("format", body.getOrDefault("format", "CSV"));
        exp.put("status", "COMPLETED");
        exp.put("downloadUrl", "/api/v1/exports/" + exportId + "/download");
        exp.put("createdAt", LocalDateTime.now().toString());

        exports.put(exportId, exp);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(envelope("Export request queued", exp, "req_an_exp_001"));
    }

    @GetMapping("/exports/{exportId}")
    public ResponseEntity<Map<String, Object>> getExportStatus(@PathVariable String exportId) {
        Map<String, Object> exp = exports.get(exportId);
        if (exp != null) {
            return ResponseEntity.ok(envelope("Export status retrieved", exp, "req_an_exp_002"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(envelope("Export not found", null, "req_err"));
    }
}
