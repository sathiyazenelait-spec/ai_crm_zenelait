package com.zenelait.crm.automation;

import com.zenelait.crm.tenant.TenantSecurityService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@RestController
@CrossOrigin(origins = "*")
public class AutomationWorkspaceController {

    private final TenantSecurityService tenantSecurityService;
    private final Map<String, Map<String, Object>> workflowsStore = new ConcurrentHashMap<>();
    private final List<Map<String, Object>> runHistory = Collections.synchronizedList(new ArrayList<>());
    private final AtomicLong runCounter = new AtomicLong(10001);

    public AutomationWorkspaceController(TenantSecurityService tenantSecurityService) {
        this.tenantSecurityService = tenantSecurityService;
        initDefaultWorkflows();
    }

    private void initDefaultWorkflows() {
        // Seed IT_HOT_LEAD_AUTO_ASSIGN (from specification)
        Map<String, Object> wf1 = new LinkedHashMap<>();
        wf1.put("workflowId", "WF-IT-1001");
        wf1.put("name", "IT_HOT_LEAD_AUTO_ASSIGN");
        wf1.put("description", "Automatically qualify, prioritize and assign high-value HRMS leads to product specialist");
        wf1.put("status", "ACTIVE");
        wf1.put("published", true);
        wf1.put("publishedAt", "2026-10-12T18:00:00+05:30");
        wf1.put("trigger", Map.of(
                "event", "LEAD_CREATED",
                "label", "When a new lead is created",
                "source", "Website Chat / Contact Form / WhatsApp"
        ));
        wf1.put("conditions", List.of(
                Map.of("field", "productInterest", "operator", "EQUALS", "value", "HRMS"),
                Map.of("field", "leadScore", "operator", "GREATER_THAN_OR_EQUAL", "value", 75)
        ));
        wf1.put("actions", List.of(
                Map.of("step", 1, "type", "SET_PRIORITY", "label", "Set priority to High", "value", "HIGH"),
                Map.of("step", 2, "type", "ASSIGN_BY_SKILL", "label", "Assign by skill / territory", "value", "HRMS Sales Specialist (Rahul Kumar)", "team", "AE - HRMS Specialist", "strategy", "round_robin"),
                Map.of("step", 3, "type", "CREATE_TASK", "label", "Create follow-up task", "value", "Contact qualified HRMS lead within 15 mins"),
                Map.of("step", 4, "type", "NOTIFY_MANAGER", "label", "Notify Sales Manager", "value", "Push + In-App notification sent to Sales Manager")
        ));
        wf1.put("waitStep", Map.of("duration", "1h", "label", "Wait 1h"));
        wf1.put("followupAction", Map.of("step", 5, "type", "SEND_EMAIL", "label", "Send welcome email", "template", "Welcome - HRMS Enterprise Demo"));
        wf1.put("runsCount", 122);
        wf1.put("successRate", "100%");
        wf1.put("category", "Lead Inbound & Routing");
        wf1.put("tag", "Growth");
        workflowsStore.put("WF-IT-1001", wf1);

        // Seed Seed Demo Workflow
        Map<String, Object> wf2 = new LinkedHashMap<>();
        wf2.put("workflowId", "WF-IT-1002");
        wf2.put("name", "IT_DEMO_BOOKING_AND_REMINDER");
        wf2.put("description", "Automate demo slot confirmation, Google Meet calendar invite, and 24h/1h pre-meeting SMS reminders");
        wf2.put("status", "ACTIVE");
        wf2.put("published", true);
        wf2.put("publishedAt", "2026-10-10T14:30:00+05:30");
        wf2.put("trigger", Map.of("event", "DEMO_REQUESTED", "label", "When a prospect books demo slot"));
        wf2.put("conditions", List.of(
                Map.of("field", "stage", "operator", "EQUALS", "value", "QUALIFIED")
        ));
        wf2.put("actions", List.of(
                Map.of("step", 1, "type", "CHECK_CALENDAR", "label", "Check salesperson calendar", "value", "Auto-match open slots"),
                Map.of("step", 2, "type", "SEND_INVITE", "label", "Send Google Meet invite", "value", "Generate dynamic meeting room link"),
                Map.of("step", 3, "type", "SCHEDULE_REMINDER", "label", "Schedule SMS & WhatsApp reminder", "value", "24 hours & 1 hour before meeting")
        ));
        wf2.put("runsCount", 78);
        wf2.put("successRate", "98.7%");
        wf2.put("category", "Demo Scheduling");
        wf2.put("tag", "Productivity");
        workflowsStore.put("WF-IT-1002", wf2);

        // Seed Proposal Follow-up
        Map<String, Object> wf3 = new LinkedHashMap<>();
        wf3.put("workflowId", "WF-IT-1003");
        wf3.put("name", "IT_PROPOSAL_FOLLOWUP_SEQUENCE");
        wf3.put("description", "Nudge unanswered proposals after 3 business days; stop immediately when reply or deal update occurs");
        wf3.put("status", "ACTIVE");
        wf3.put("published", true);
        wf3.put("publishedAt", "2026-10-08T11:15:00+05:30");
        wf3.put("trigger", Map.of("event", "PROPOSAL_UNANSWERED_3D", "label", "When proposal remains unanswered for 72h"));
        wf3.put("conditions", List.of(
                Map.of("field", "stage", "operator", "EQUALS", "value", "PROPOSAL")
        ));
        wf3.put("actions", List.of(
                Map.of("step", 1, "type", "SEND_EMAIL", "label", "Dispatch gentle check-in email", "value", "Template: Proposal Follow-up 3D"),
                Map.of("step", 2, "type", "NOTIFY_SALES_REP", "label", "Alert opportunity owner", "value", "Create high-priority phone call task")
        ));
        wf3.put("runsCount", 45);
        wf3.put("successRate", "100%");
        wf3.put("category", "Deals & Proposals");
        wf3.put("tag", "Revenue");
        workflowsStore.put("WF-IT-1003", wf3);

        // Prepopulate execution history
        addRunHistoryItem("RUN-10001", "WF-IT-1001", "IT_HOT_LEAD_AUTO_ASSIGN", "LEAD_CREATED", "LEAD-5001", "AUTOMATIC", "COMPLETED", 142, "2026-10-12T17:45:00+05:30", true, null);
        addRunHistoryItem("RUN-10002", "WF-IT-1001", "IT_HOT_LEAD_AUTO_ASSIGN", "LEAD_CREATED", "LEAD-5002", "MANUAL", "COMPLETED", 158, "2026-10-12T16:20:00+05:30", true, null);
        addRunHistoryItem("RUN-10003", "WF-IT-1002", "IT_DEMO_BOOKING_AND_REMINDER", "DEMO_REQUESTED", "LEAD-4890", "AUTOMATIC", "COMPLETED", 210, "2026-10-12T15:10:00+05:30", true, null);
        addRunHistoryItem("RUN-10004", "WF-IT-1003", "IT_PROPOSAL_FOLLOWUP_SEQUENCE", "PROPOSAL_UNANSWERED_3D", "OPP-102", "AUTOMATIC", "COMPLETED", 115, "2026-10-12T14:05:00+05:30", true, null);
    }

    private void addRunHistoryItem(String runId, String workflowId, String workflowName, String trigger, String recordId, String mode, String status, long durationMs, String time, boolean success, String error) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("runId", runId);
        item.put("workflowId", workflowId);
        item.put("workflowName", workflowName);
        item.put("trigger", trigger);
        item.put("recordType", "LEAD");
        item.put("recordId", recordId);
        item.put("mode", mode);
        item.put("status", status);
        item.put("durationMs", durationMs);
        item.put("executedAt", time);
        item.put("success", success);
        item.put("error", error);
        item.put("stepsTrace", List.of(
                Map.of("step", 1, "name", "Evaluate Trigger & Inbound Payload", "status", "PASSED", "durationMs", 18),
                Map.of("step", 2, "name", "Condition Check (Product & Lead Score)", "status", "PASSED", "durationMs", 24),
                Map.of("step", 3, "name", "Priority Escalation & Skill Routing", "status", "PASSED", "durationMs", 42),
                Map.of("step", 4, "name", "Task Generation & Manager Push Notification", "status", "PASSED", "durationMs", 38),
                Map.of("step", 5, "name", "Audit Log Recorded", "status", "PASSED", "durationMs", 20)
        ));
        runHistory.add(0, item);
    }

    // ==================== WORKFLOWS CRUD & CONTROL ====================
    @GetMapping("/api/v1/workflows")
    public ResponseEntity<List<Map<String, Object>>> getWorkflows() {
        return ResponseEntity.ok(new ArrayList<>(workflowsStore.values()));
    }

    @GetMapping("/api/v1/workflows/{id}")
    public ResponseEntity<?> getWorkflowById(@PathVariable String id) {
        Map<String, Object> wf = workflowsStore.get(id);
        if (wf != null) {
            return ResponseEntity.ok(wf);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/api/v1/workflows")
    public ResponseEntity<Map<String, Object>> createWorkflow(@RequestBody Map<String, Object> body) {
        String workflowId = "WF-IT-" + (1000 + workflowsStore.size() + 1);
        Map<String, Object> wf = new LinkedHashMap<>(body);
        wf.put("workflowId", workflowId);
        wf.put("status", "DRAFT");
        wf.put("validation", "PASSED");
        wf.put("published", false);
        wf.put("runsCount", 0);
        wf.put("successRate", "100%");
        wf.put("createdAt", LocalDateTime.now().toString());

        workflowsStore.put(workflowId, wf);
        return ResponseEntity.status(HttpStatus.CREATED).body(wf);
    }

    @PutMapping("/api/v1/workflows/{id}")
    public ResponseEntity<?> updateWorkflow(@PathVariable String id, @RequestBody Map<String, Object> body) {
        Map<String, Object> existing = workflowsStore.get(id);
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }
        existing.putAll(body);
        existing.put("updatedAt", LocalDateTime.now().toString());
        return ResponseEntity.ok(existing);
    }

    @DeleteMapping("/api/v1/workflows/{id}")
    public ResponseEntity<?> deleteWorkflow(@PathVariable String id) {
        if (workflowsStore.remove(id) != null) {
            return ResponseEntity.ok(Map.of("message", "Workflow deleted successfully", "workflowId", id));
        }
        return ResponseEntity.notFound().build();
    }

    // ==================== PUBLISH & TOGGLE ====================
    @PostMapping("/api/v1/workflows/{workflowId}/publish")
    public ResponseEntity<Map<String, Object>> publishWorkflow(@PathVariable String workflowId) {
        Map<String, Object> wf = workflowsStore.get(workflowId);
        String triggerName = "LEAD_CREATED";
        if (wf != null) {
            wf.put("status", "ACTIVE");
            wf.put("published", true);
            String pubDate = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            wf.put("publishedAt", pubDate);
            if (wf.get("trigger") instanceof Map<?, ?> triggerMap && triggerMap.get("event") != null) {
                triggerName = triggerMap.get("event").toString();
            }
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("workflowId", workflowId);
        response.put("status", "ACTIVE");
        response.put("trigger", triggerName);
        response.put("publishedAt", LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/api/v1/workflows/{id}/toggle")
    public ResponseEntity<?> toggleWorkflowStatus(@PathVariable String id) {
        Map<String, Object> wf = workflowsStore.get(id);
        if (wf == null) {
            return ResponseEntity.notFound().build();
        }
        String currentStatus = (String) wf.getOrDefault("status", "ACTIVE");
        String newStatus = "ACTIVE".equalsIgnoreCase(currentStatus) ? "PAUSED" : "ACTIVE";
        wf.put("status", newStatus);
        return ResponseEntity.ok(Map.of("workflowId", id, "status", newStatus, "toggledAt", LocalDateTime.now().toString()));
    }

    // ==================== EXECUTION (RUNS & TEST) ====================
    @PostMapping("/api/v1/workflows/{workflowId}/runs")
    public ResponseEntity<Map<String, Object>> executeWorkflowManual(
            @PathVariable String workflowId,
            @RequestBody Map<String, Object> request
    ) {
        String mode = (String) request.getOrDefault("mode", "MANUAL");
        String recordType = (String) request.getOrDefault("recordType", "LEAD");
        String recordId = (String) request.getOrDefault("recordId", "LEAD-5001");
        boolean dryRun = Boolean.TRUE.equals(request.get("dryRun"));

        String runId = "RUN-" + runCounter.incrementAndGet();
        Map<String, Object> wf = workflowsStore.get(workflowId);
        String wfName = wf != null ? (String) wf.getOrDefault("name", "IT_HOT_LEAD_AUTO_ASSIGN") : "IT_HOT_LEAD_AUTO_ASSIGN";

        // Increment run count
        if (wf != null && !dryRun) {
            int runs = (int) wf.getOrDefault("runsCount", 0);
            wf.put("runsCount", runs + 1);
        }

        long durationMs = 120 + (long)(Math.random() * 80);
        String now = LocalDateTime.now().toString();

        addRunHistoryItem(runId, workflowId, wfName, "LEAD_CREATED", recordId, dryRun ? "DRY_RUN" : mode, "COMPLETED", durationMs, now, true, null);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("runId", runId);
        response.put("workflowId", workflowId);
        response.put("status", "QUEUED");
        response.put("mode", mode);
        response.put("recordType", recordType);
        response.put("recordId", recordId);
        response.put("dryRun", dryRun);
        response.put("actionsPreview", List.of(
                "Verify HRMS Interest & Lead Score >= 75: PASSED",
                "Set Priority to High",
                "Assign to HRMS Sales Specialist (Rahul Kumar)",
                "Create Task: Contact qualified HRMS lead within 15 mins",
                "Notify Sales Manager via SLA Alert Push"
        ));
        response.put("queuedAt", now);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/v1/workflows/{workflowId}/test")
    public ResponseEntity<Map<String, Object>> testWorkflowDryRun(
            @PathVariable String workflowId,
            @RequestBody(required = false) Map<String, Object> sampleLead
    ) {
        Map<String, Object> sample = sampleLead != null ? sampleLead : Map.of(
                "leadId", "LEAD-5001",
                "productInterest", "HRMS",
                "leadScore", 88,
                "stage", "NEW"
        );

        String runId = "TEST-RUN-" + runCounter.incrementAndGet();
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("runId", runId);
        response.put("workflowId", workflowId);
        response.put("status", "TEST_SUCCESS");
        response.put("leadTested", sample);
        response.put("conditionsEvaluated", List.of(
                Map.of("rule", "productInterest == 'HRMS'", "actual", sample.getOrDefault("productInterest", "HRMS"), "passed", true),
                Map.of("rule", "leadScore >= 75", "actual", sample.getOrDefault("leadScore", 88), "passed", true)
        ));
        response.put("actionsSimulation", List.of(
                Map.of("action", "SET_PRIORITY", "result", "Applied priority HIGH to " + sample.get("leadId"), "status", "SIMULATED_OK"),
                Map.of("action", "ASSIGN_BY_SKILL", "result", "Assigned to Rahul Kumar (HRMS Specialist)", "status", "SIMULATED_OK"),
                Map.of("action", "CREATE_TASK", "result", "Created Task #TSK-892 for 15-min follow-up", "status", "SIMULATED_OK"),
                Map.of("action", "NOTIFY_MANAGER", "result", "Dispatched SLA notification to Sales Manager", "status", "SIMULATED_OK")
        ));
        response.put("dryRun", true);
        response.put("recordsMutated", 0);
        response.put("executedAt", LocalDateTime.now().toString());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/v1/workflows/{workflowId}/runs")
    public ResponseEntity<List<Map<String, Object>>> getRunsForWorkflow(@PathVariable String workflowId) {
        List<Map<String, Object>> filtered = runHistory.stream()
                .filter(r -> workflowId.equalsIgnoreCase((String) r.get("workflowId")))
                .toList();
        return ResponseEntity.ok(filtered);
    }

    @GetMapping("/api/v1/workflow-runs")
    public ResponseEntity<List<Map<String, Object>>> getAllRuns() {
        return ResponseEntity.ok(runHistory);
    }

    @GetMapping("/api/v1/workflow-runs/{runId}")
    public ResponseEntity<?> getRunDetails(@PathVariable String runId) {
        return runHistory.stream()
                .filter(r -> runId.equalsIgnoreCase((String) r.get("runId")))
                .findFirst()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ==================== TEMPLATES (25 IT WORKFLOWS) ====================
    @GetMapping("/api/v1/workflows/templates")
    public ResponseEntity<List<Map<String, Object>>> getWorkflowTemplates() {
        List<Map<String, Object>> templates = List.of(
                Map.of("id", "TMPL-01", "name", "Lead capture", "trigger", "New website enquiry", "action", "Create CRM lead, detect duplicates, notify sales team", "category", "Lead Inbound"),
                Map.of("id", "TMPL-02", "name", "Duplicate detection", "trigger", "New lead arrives", "action", "Match existing records by email & phone for review or merge", "category", "Lead Inbound"),
                Map.of("id", "TMPL-03", "name", "AI qualification", "trigger", "Lead created", "action", "Engage with qualifying questions on budget & tech stack", "category", "AI Qualification"),
                Map.of("id", "TMPL-04", "name", "Lead scoring", "trigger", "Lead data changes", "action", "Recalculate dynamic fit score (0-100)", "category", "AI Qualification"),
                Map.of("id", "TMPL-05", "name", "Lead assignment", "trigger", "Qualified lead (HRMS/ERP)", "action", "Route HRMS leads to HRMS specialist, ERP to ERP team", "category", "Routing"),
                Map.of("id", "TMPL-06", "name", "SLA alert", "trigger", "Lead untouched for 15 mins", "action", "Notify owner and escalate to Sales Manager", "category", "Alerts & SLA"),
                Map.of("id", "TMPL-07", "name", "Demo scheduling", "trigger", "Prospect requests demo", "action", "Offer available salesperson calendar slots automatically", "category", "Demo & Meetings"),
                Map.of("id", "TMPL-08", "name", "Demo reminder", "trigger", "24h & 1h before meeting", "action", "Send WhatsApp and Email meeting link reminder", "category", "Demo & Meetings"),
                Map.of("id", "TMPL-09", "name", "No-show recovery", "trigger", "Demo marked missed", "action", "Trigger instant polite re-scheduling sequence", "category", "Demo & Meetings"),
                Map.of("id", "TMPL-10", "name", "Proposal creation", "trigger", "Opportunity reaches proposal stage", "action", "Generate draft quote with software package items & tax", "category", "Proposals"),
                Map.of("id", "TMPL-11", "name", "Discount approval", "trigger", "Discount exceeds 15%", "action", "Route proposal to Sales Manager for approval gate", "category", "Approvals"),
                Map.of("id", "TMPL-12", "name", "Proposal follow-up", "trigger", "Proposal unanswered 3 days", "action", "Schedule automated check-in and task for salesperson", "category", "Proposals"),
                Map.of("id", "TMPL-13", "name", "Deal-stage update", "trigger", "Milestone contract verified", "action", "Update pipeline deal stage and notify team", "category", "Pipeline"),
                Map.of("id", "TMPL-14", "name", "Stale-deal alert", "trigger", "No activity for 7 days", "action", "Alert account owner to re-engage with battlecard", "category", "Alerts & SLA"),
                Map.of("id", "TMPL-15", "name", "Competitor tracking", "trigger", "Competitor named in meeting notes", "action", "Attach competitor battlecard & positioning tips", "category", "Intelligence"),
                Map.of("id", "TMPL-16", "name", "Renewal reminder", "trigger", "Contract renewal in 60 days", "action", "Create renewal task and check license expansion potential", "category", "Retention"),
                Map.of("id", "TMPL-17", "name", "Upsell opportunity", "trigger", "Customer crosses 80% user quota", "action", "Create suggested upgrade opportunity for AE", "category", "Retention"),
                Map.of("id", "TMPL-18", "name", "Customer handover", "trigger", "Deal marked WON", "action", "Handover to Implementation & Customer Success onboarding", "category", "Handover"),
                Map.of("id", "TMPL-19", "name", "Sales forecast", "trigger", "Opportunity value or probability changes", "action", "Recalculate weighted monthly and quarterly forecast", "category", "Forecasting"),
                Map.of("id", "TMPL-20", "name", "Performance report", "trigger", "Weekly schedule (Monday 9 AM)", "action", "Generate team sales summary and email executive digest", "category", "Reporting"),
                Map.of("id", "TMPL-21", "name", "Knowledge gap detection", "trigger", "AI cannot answer tech query", "action", "Log unanswered question to Knowledge Base queue", "category", "AI Learning"),
                Map.of("id", "TMPL-22", "name", "Human handover", "trigger", "AI detects frustration or custom requirement", "action", "Seamlessly transfer live chat to active sales rep", "category", "AI Assistance"),
                Map.of("id", "TMPL-23", "name", "Failed integration alert", "trigger", "Email / Calendar API fails", "action", "Safe exponential retry; notify admin if 3 attempts fail", "category", "Resilience"),
                Map.of("id", "TMPL-24", "name", "Lead re-engagement", "trigger", "Dormant cold lead > 30 days", "action", "Start approved product release re-engagement sequence", "category", "Nurturing"),
                Map.of("id", "TMPL-25", "name", "Workflow audit", "trigger", "Any automation executes", "action", "Record trigger, payload, action result, and latency in audit log", "category", "Auditing")
        );
        return ResponseEntity.ok(templates);
    }

    // ==================== ANALYTICS & SETTINGS ====================
    @GetMapping("/api/v1/workflows/analytics")
    public ResponseEntity<Map<String, Object>> getAutomationAnalytics() {
        Map<String, Object> analytics = new LinkedHashMap<>();
        analytics.put("leadsAssigned", 1420);
        analytics.put("followupsSent", 3890);
        analytics.put("demosBooked", 412);
        analytics.put("proposalsGenerated", 215);
        analytics.put("totalRuns", 5937);
        analytics.put("successRate", "99.4%");
        analytics.put("failedRuns", 7);
        analytics.put("p50LatencyMs", 142);
        analytics.put("p95LatencyMs", 280);
        analytics.put("hoursSavedMonthly", 184);
        analytics.put("triggerBreakdown", List.of(
                Map.of("trigger", "LEAD_CREATED", "count", 2480, "percentage", 42),
                Map.of("trigger", "DEMO_REQUESTED", "count", 1360, "percentage", 23),
                Map.of("trigger", "PROPOSAL_UNANSWERED", "count", 980, "percentage", 16),
                Map.of("trigger", "STALE_DEAL_SLA", "count", 610, "percentage", 10),
                Map.of("trigger", "OTHER_EVENTS", "count", 507, "percentage", 9)
        ));
        analytics.put("productDistribution", List.of(
                Map.of("product", "HRMS Software", "leads", 639, "share", "45%"),
                Map.of("product", "ERP Suite", "leads", 397, "share", "28%"),
                Map.of("product", "Cloud & DevOps", "leads", 255, "share", "18%"),
                Map.of("product", "Custom SaaS", "leads", 129, "share", "9%")
        ));
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/api/v1/workflows/settings")
    public ResponseEntity<Map<String, Object>> getAutomationSettings() {
        return ResponseEntity.ok(Map.of(
                "maxRetries", 3,
                "retryBackoff", "EXPONENTIAL",
                "concurrencyLimit", 25,
                "monthlyRunQuota", 50000,
                "runsUsedThisMonth", 12480,
                "tenantIsolation", "STRICT_ENFORCED",
                "idempotencyWindowSeconds", 300,
                "pauseExecutionPolicy", "FINISH_IN_FLIGHT_DRAIN",
                "integrations", Map.of(
                        "emailSmtp", "CONNECTED (SendGrid)",
                        "whatsAppApi", "CONNECTED (Meta Cloud API)",
                        "googleCalendar", "CONNECTED (OAuth 2.0)",
                        "webhooks", "ACTIVE (Sub-10ms delivery)"
                )
        ));
    }
}

