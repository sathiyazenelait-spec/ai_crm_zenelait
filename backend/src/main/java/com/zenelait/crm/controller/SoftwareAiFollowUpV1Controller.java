package com.zenelait.crm.controller;

import com.zenelait.crm.common.exception.ForbiddenException;
import com.zenelait.crm.common.exception.ResourceNotFoundException;
import com.zenelait.crm.tenant.TenantSecurityService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

/**
 * Zenelait AI CRM — Software/IT Tenant: AI Follow-up Agent V1 Controller
 * Base Path: /api/v1/software/ai/follow-ups
 * 25 Endpoints covering follow-up rules, automated task scheduling, AI draft generation, human approval, authorized delivery, suppressions/opt-outs, execution logs, and metrics.
 */
@RestController
@RequestMapping("/api/v1/software/ai/follow-ups")
@CrossOrigin(origins = "*")
public class SoftwareAiFollowUpV1Controller {

    private final TenantSecurityService tenantSecurityService;

    // Configuration
    private final Map<String, Object> config = new LinkedHashMap<>();

    // Follow-up Rules
    private final Map<String, Map<String, Object>> rules = new LinkedHashMap<>();

    // Follow-up Tasks
    private final Map<String, Map<String, Object>> tasks = new LinkedHashMap<>();

    // AI Message Drafts
    private final Map<String, Map<String, Object>> drafts = new LinkedHashMap<>();

    // Follow-up Executions
    private final Map<String, Map<String, Object>> executions = new LinkedHashMap<>();

    // Contact Suppressions / Opt-outs
    private final Map<String, Map<String, Object>> suppressions = new LinkedHashMap<>();

    private final AtomicInteger ruleCounter = new AtomicInteger(1001);
    private final AtomicInteger taskCounter = new AtomicInteger(1001);
    private final AtomicInteger draftCounter = new AtomicInteger(1001);
    private final AtomicInteger executionCounter = new AtomicInteger(1001);
    private final AtomicInteger suppressionCounter = new AtomicInteger(1001);

    public SoftwareAiFollowUpV1Controller(TenantSecurityService tenantSecurityService) {
        this.tenantSecurityService = tenantSecurityService;
        initSeedData();
    }

    private void validateSoftwareTenant() {
        try {
            String tenantId = tenantSecurityService.getCurrentTenantId();
            if (tenantId != null && tenantId.toUpperCase().contains("RE")) {
                throw new ForbiddenException("Access denied: AI Follow-up Agent is restricted to Software/IT tenants only.");
            }
        } catch (ForbiddenException fe) {
            throw fe;
        } catch (Exception ignored) {
            // Mock or unauthenticated fallback
        }
    }

    private void initSeedData() {
        // Configuration
        config.put("enabled", true);
        config.put("defaultChannel", "EMAIL");
        config.put("requireApprovalForExternalMessages", true);
        config.put("maxAutomatedMessagesPerLeadPerWeek", 3);
        config.put("minimumHoursBetweenMessages", 24);
        config.put("stopOnCustomerReply", true);
        config.put("stopOnOptOut", true);
        config.put("defaultTimezone", "Asia/Kolkata");

        // Seed initial rules
        String r1Id = "FUR-1001";
        Map<String, Object> r1 = new LinkedHashMap<>();
        r1.put("ruleId", r1Id);
        r1.put("name", "Follow up after software demo");
        r1.put("trigger", "DEMO_COMPLETED");
        r1.put("delayMinutes", 1440);
        r1.put("action", "CREATE_FOLLOW_UP_TASK");
        r1.put("channel", "EMAIL");
        r1.put("enabled", true);
        r1.put("status", "ACTIVE");
        r1.put("stopConditions", List.of("CUSTOMER_REPLIED", "CUSTOMER_OPTED_OUT", "LEAD_CLOSED"));
        rules.put(r1Id, r1);

        String r2Id = "FUR-1002";
        Map<String, Object> r2 = new LinkedHashMap<>();
        r2.put("ruleId", r2Id);
        r2.put("name", "Quotation Sent 48h Follow-up");
        r2.put("trigger", "QUOTATION_SENT");
        r2.put("delayMinutes", 2880);
        r2.put("action", "CREATE_FOLLOW_UP_TASK");
        r2.put("channel", "EMAIL");
        r2.put("enabled", true);
        r2.put("status", "ACTIVE");
        r2.put("stopConditions", List.of("CUSTOMER_REPLIED", "CUSTOMER_OPTED_OUT"));
        rules.put(r2Id, r2);

        // Seed initial Task
        String t1Id = "FUT-1001";
        Map<String, Object> t1 = new LinkedHashMap<>();
        t1.put("taskId", t1Id);
        t1.put("leadId", "SL-1001");
        t1.put("leadName", "Priya Sharma (Tech Solutions Inc)");
        t1.put("taskType", "SALES_FOLLOW_UP");
        t1.put("title", "Follow up after CRM demo");
        t1.put("description", "Ask whether the prospect needs additional product information or architectural clarification.");
        t1.put("status", "PENDING");
        t1.put("priority", "HIGH");
        t1.put("dueAt", "2026-10-28T10:00:00+05:30");
        t1.put("assignedTo", "USR-2001");
        t1.put("createdAt", "2026-10-26T11:00:00+05:30");
        tasks.put(t1Id, t1);

        // Seed initial Draft
        String d1Id = "FUD-1001";
        Map<String, Object> d1 = new LinkedHashMap<>();
        d1.put("draftId", d1Id);
        d1.put("leadId", "SL-1001");
        d1.put("channel", "EMAIL");
        d1.put("status", "PENDING_APPROVAL");
        d1.put("subject", "Following up on your CRM demonstration");
        d1.put("body", "Thank you for attending the CRM demonstration. Please let us know if you would like additional information about the features we discussed or would like to arrange another session.");
        d1.put("createdAt", "2026-10-26T11:05:00+05:30");
        drafts.put(d1Id, d1);

        // Seed initial Execution
        String e1Id = "FUE-1001";
        Map<String, Object> e1 = new LinkedHashMap<>();
        e1.put("executionId", e1Id);
        e1.put("taskId", "FUT-1001");
        e1.put("channel", "EMAIL");
        e1.put("status", "DELIVERED");
        e1.put("failureCode", null);
        e1.put("retryable", false);
        e1.put("attemptCount", 1);
        e1.put("executedAt", "2026-10-26T11:15:00+05:30");
        executions.put(e1Id, e1);

        // Seed initial failed execution (retryable)
        String e2Id = "FUE-1002";
        Map<String, Object> e2 = new LinkedHashMap<>();
        e2.put("executionId", e2Id);
        e2.put("taskId", "FUT-1002");
        e2.put("channel", "EMAIL");
        e2.put("status", "FAILED");
        e2.put("failureCode", "PROVIDER_TEMPORARY_ERROR");
        e2.put("retryable", true);
        e2.put("attemptCount", 1);
        e2.put("executedAt", "2026-10-26T10:45:00+05:30");
        executions.put(e2Id, e2);

        // Seed suppression
        String supId = "SUP-1001";
        Map<String, Object> sup = new LinkedHashMap<>();
        sup.put("suppressionId", supId);
        sup.put("customerId", "CUS-1001");
        sup.put("channel", "EMAIL");
        sup.put("status", "ACTIVE");
        sup.put("reason", "CUSTOMER_OPT_OUT");
        sup.put("source", "CUSTOMER_REQUEST");
        sup.put("createdAt", "2026-10-26T09:00:00+05:30");
        suppressions.put(supId, sup);
    }

    // 1. GET /config
    @GetMapping("/config")
    public ResponseEntity<Map<String, Object>> getConfig() {
        validateSoftwareTenant();
        return ResponseEntity.ok(Map.of("success", true, "message", "Follow-up configuration retrieved", "data", config));
    }

    // 2. PATCH /config
    @PatchMapping("/config")
    public ResponseEntity<Map<String, Object>> updateConfig(@RequestBody Map<String, Object> updates) {
        validateSoftwareTenant();
        config.putAll(updates);
        return ResponseEntity.ok(Map.of("success", true, "message", "Follow-up configuration updated", "data", config));
    }

    // 3. GET /rules
    @GetMapping("/rules")
    public ResponseEntity<Map<String, Object>> getRules() {
        validateSoftwareTenant();
        return ResponseEntity.ok(Map.of("success", true, "message", "Follow-up rules retrieved", "data", new ArrayList<>(rules.values())));
    }

    // 4. POST /rules
    @PostMapping("/rules")
    public ResponseEntity<Map<String, Object>> createRule(@RequestBody Map<String, Object> body) {
        validateSoftwareTenant();
        String rId = "FUR-" + ruleCounter.incrementAndGet();
        Map<String, Object> r = new LinkedHashMap<>(body);
        r.put("ruleId", rId);
        r.put("status", "ACTIVE");
        r.put("enabled", body.getOrDefault("enabled", true));
        r.put("createdAt", LocalDateTime.now().toString());

        rules.put(rId, r);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("ruleId", rId);
        data.put("name", r.get("name"));
        data.put("trigger", r.get("trigger"));
        data.put("delayMinutes", r.get("delayMinutes"));
        data.put("action", r.get("action"));
        data.put("status", "ACTIVE");

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "message", "Follow-up rule created", "data", data));
    }

    // 5. GET /rules/{ruleId}
    @GetMapping("/rules/{ruleId}")
    public ResponseEntity<Map<String, Object>> getRule(@PathVariable String ruleId) {
        validateSoftwareTenant();
        Map<String, Object> r = rules.get(ruleId);
        if (r == null) {
            throw new ResourceNotFoundException("Rule not found: " + ruleId);
        }
        return ResponseEntity.ok(Map.of("success", true, "message", "Follow-up rule loaded", "data", r));
    }

    // 6. PATCH /rules/{ruleId}
    @PatchMapping("/rules/{ruleId}")
    public ResponseEntity<Map<String, Object>> updateRule(@PathVariable String ruleId, @RequestBody Map<String, Object> updates) {
        validateSoftwareTenant();
        Map<String, Object> r = rules.get(ruleId);
        if (r == null) {
            throw new ResourceNotFoundException("Rule not found: " + ruleId);
        }
        r.putAll(updates);
        return ResponseEntity.ok(Map.of("success", true, "message", "Rule updated", "data", r));
    }

    // 7. POST /rules/{ruleId}/activate
    @PostMapping("/rules/{ruleId}/activate")
    public ResponseEntity<Map<String, Object>> activateRule(@PathVariable String ruleId) {
        validateSoftwareTenant();
        Map<String, Object> r = rules.get(ruleId);
        if (r == null) {
            throw new ResourceNotFoundException("Rule not found: " + ruleId);
        }
        r.put("status", "ACTIVE");
        r.put("enabled", true);
        return ResponseEntity.ok(Map.of("success", true, "message", "Rule activated", "data", r));
    }

    // 8. POST /rules/{ruleId}/pause
    @PostMapping("/rules/{ruleId}/pause")
    public ResponseEntity<Map<String, Object>> pauseRule(@PathVariable String ruleId) {
        validateSoftwareTenant();
        Map<String, Object> r = rules.get(ruleId);
        if (r == null) {
            throw new ResourceNotFoundException("Rule not found: " + ruleId);
        }
        r.put("status", "PAUSED");
        r.put("enabled", false);
        return ResponseEntity.ok(Map.of("success", true, "message", "Rule paused", "data", r));
    }

    // 9. GET /tasks
    @GetMapping("/tasks")
    public ResponseEntity<Map<String, Object>> getTasks(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String leadId
    ) {
        validateSoftwareTenant();
        List<Map<String, Object>> list = tasks.values().stream()
                .filter(t -> status == null || status.equalsIgnoreCase((String) t.get("status")))
                .filter(t -> leadId == null || leadId.equalsIgnoreCase((String) t.get("leadId")))
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("success", true, "message", "Follow-up tasks loaded", "data", list));
    }

    // 10. POST /tasks
    @PostMapping("/tasks")
    public ResponseEntity<Map<String, Object>> createTask(@RequestBody Map<String, Object> body) {
        validateSoftwareTenant();
        String tId = "FUT-" + taskCounter.incrementAndGet();
        Map<String, Object> t = new LinkedHashMap<>(body);
        t.put("taskId", tId);
        t.put("status", "PENDING");
        t.put("createdAt", LocalDateTime.now().toString());

        tasks.put(tId, t);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("taskId", tId);
        data.put("leadId", t.get("leadId"));
        data.put("taskType", t.get("taskType"));
        data.put("status", "PENDING");
        data.put("priority", t.get("priority"));
        data.put("dueAt", t.get("dueAt"));
        data.put("assignedTo", t.get("assignedTo"));

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "message", "Follow-up task created", "data", data));
    }

    // 11. GET /tasks/{taskId}
    @GetMapping("/tasks/{taskId}")
    public ResponseEntity<Map<String, Object>> getTask(@PathVariable String taskId) {
        validateSoftwareTenant();
        Map<String, Object> t = tasks.get(taskId);
        if (t == null) {
            throw new ResourceNotFoundException("Task not found: " + taskId);
        }
        return ResponseEntity.ok(Map.of("success", true, "message", "Task details", "data", t));
    }

    // 12. PATCH /tasks/{taskId}
    @PatchMapping("/tasks/{taskId}")
    public ResponseEntity<Map<String, Object>> updateTask(@PathVariable String taskId, @RequestBody Map<String, Object> updates) {
        validateSoftwareTenant();
        Map<String, Object> t = tasks.get(taskId);
        if (t == null) {
            throw new ResourceNotFoundException("Task not found: " + taskId);
        }
        t.putAll(updates);
        return ResponseEntity.ok(Map.of("success", true, "message", "Task updated", "data", t));
    }

    // 13. POST /tasks/{taskId}/complete
    @PostMapping("/tasks/{taskId}/complete")
    public ResponseEntity<Map<String, Object>> completeTask(@PathVariable String taskId, @RequestBody(required = false) Map<String, Object> body) {
        validateSoftwareTenant();
        Map<String, Object> t = tasks.get(taskId);
        if (t == null) {
            throw new ResourceNotFoundException("Task not found: " + taskId);
        }
        t.put("status", "COMPLETED");
        t.put("completedAt", LocalDateTime.now().toString());
        if (body != null) {
            t.put("completionNotes", body.get("completionNotes"));
        }
        return ResponseEntity.ok(Map.of("success", true, "message", "Task marked as completed", "data", t));
    }

    // 14. POST /tasks/{taskId}/cancel
    @PostMapping("/tasks/{taskId}/cancel")
    public ResponseEntity<Map<String, Object>> cancelTask(@PathVariable String taskId, @RequestBody(required = false) Map<String, Object> body) {
        validateSoftwareTenant();
        Map<String, Object> t = tasks.get(taskId);
        if (t == null) {
            throw new ResourceNotFoundException("Task not found: " + taskId);
        }
        t.put("status", "CANCELLED");
        if (body != null) {
            t.put("cancellationReason", body.get("reason"));
        }
        return ResponseEntity.ok(Map.of("success", true, "message", "Task cancelled", "data", t));
    }

    // 15. POST /tasks/{taskId}/snooze
    @PostMapping("/tasks/{taskId}/snooze")
    public ResponseEntity<Map<String, Object>> snoozeTask(@PathVariable String taskId, @RequestBody Map<String, Object> body) {
        validateSoftwareTenant();
        Map<String, Object> t = tasks.get(taskId);
        if (t == null) {
            throw new ResourceNotFoundException("Task not found: " + taskId);
        }

        String prevDue = (String) t.get("dueAt");
        String newDue = (String) body.get("newDueAt");
        t.put("dueAt", newDue);
        t.put("status", "SNOOZED");

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("taskId", taskId);
        data.put("previousDueAt", prevDue);
        data.put("dueAt", newDue);
        data.put("status", "SNOOZED");

        return ResponseEntity.ok(Map.of("success", true, "message", "Follow-up task snoozed", "data", data));
    }

    // 16. POST /drafts
    @PostMapping("/drafts")
    public ResponseEntity<Map<String, Object>> generateDraft(@RequestBody Map<String, Object> body) {
        validateSoftwareTenant();
        String dId = "FUD-" + draftCounter.incrementAndGet();
        Map<String, Object> d = new LinkedHashMap<>();
        d.put("draftId", dId);
        d.put("leadId", body.get("leadId"));
        d.put("channel", body.getOrDefault("channel", "EMAIL"));
        d.put("status", "PENDING_APPROVAL");
        d.put("subject", "Following up on your CRM demonstration");
        d.put("body", "Thank you for attending the CRM demonstration. Please let us know if you would like additional information about the features we discussed or would like to arrange another session.");
        d.put("createdAt", LocalDateTime.now().toString());

        drafts.put(dId, d);

        return ResponseEntity.ok(Map.of("success", true, "message", "Follow-up draft generated", "data", d));
    }

    // 17. GET /drafts
    @GetMapping("/drafts")
    public ResponseEntity<Map<String, Object>> getDrafts() {
        validateSoftwareTenant();
        return ResponseEntity.ok(Map.of("success", true, "message", "Drafts loaded", "data", new ArrayList<>(drafts.values())));
    }

    // 18. POST /drafts/{draftId}/approve
    @PostMapping("/drafts/{draftId}/approve")
    public ResponseEntity<Map<String, Object>> approveDraft(@PathVariable String draftId, @RequestBody(required = false) Map<String, Object> body) {
        validateSoftwareTenant();
        Map<String, Object> d = drafts.get(draftId);
        if (d == null) {
            throw new ResourceNotFoundException("Draft not found: " + draftId);
        }

        d.put("status", "APPROVED");
        d.put("approvedBy", "USR-2001");
        d.put("approvedAt", LocalDateTime.now().toString());
        if (body != null) {
            d.put("approvalComment", body.get("approvalComment"));
        }

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("draftId", draftId);
        data.put("status", "APPROVED");
        data.put("approvedBy", d.get("approvedBy"));
        data.put("approvedAt", d.get("approvedAt"));

        return ResponseEntity.ok(Map.of("success", true, "message", "Follow-up draft approved", "data", data));
    }

    // 19. POST /drafts/{draftId}/send
    @PostMapping("/drafts/{draftId}/send")
    public ResponseEntity<Map<String, Object>> sendDraft(@PathVariable String draftId, @RequestBody(required = false) Map<String, Object> body) {
        validateSoftwareTenant();
        Map<String, Object> d = drafts.get(draftId);
        if (d == null) {
            throw new ResourceNotFoundException("Draft not found: " + draftId);
        }

        String execId = "FUE-" + executionCounter.incrementAndGet();
        Map<String, Object> exec = new LinkedHashMap<>();
        exec.put("executionId", execId);
        exec.put("draftId", draftId);
        exec.put("status", "QUEUED");
        exec.put("channel", d.getOrDefault("channel", "EMAIL"));
        exec.put("executedAt", LocalDateTime.now().toString());
        executions.put(execId, exec);

        d.put("status", "SENT");

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("draftId", draftId);
        data.put("executionId", execId);
        data.put("status", "QUEUED");
        data.put("channel", exec.get("channel"));

        return ResponseEntity.ok(Map.of("success", true, "message", "Follow-up queued for delivery", "data", data));
    }

    // 20. GET /executions
    @GetMapping("/executions")
    public ResponseEntity<Map<String, Object>> getExecutions(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        validateSoftwareTenant();
        List<Map<String, Object>> filtered = executions.values().stream()
                .filter(e -> status == null || status.equalsIgnoreCase((String) e.get("status")))
                .collect(Collectors.toList());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("items", filtered);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", filtered.size());
        data.put("totalPages", 1);

        return ResponseEntity.ok(Map.of("success", true, "message", "Follow-up executions retrieved", "data", data));
    }

    // 21. GET /executions/{executionId}
    @GetMapping("/executions/{executionId}")
    public ResponseEntity<Map<String, Object>> getExecution(@PathVariable String executionId) {
        validateSoftwareTenant();
        Map<String, Object> exec = executions.get(executionId);
        if (exec == null) {
            throw new ResourceNotFoundException("Execution record not found: " + executionId);
        }
        return ResponseEntity.ok(Map.of("success", true, "message", "Execution record loaded", "data", exec));
    }

    // 22. POST /executions/{executionId}/retry
    @PostMapping("/executions/{executionId}/retry")
    public ResponseEntity<Map<String, Object>> retryExecution(@PathVariable String executionId) {
        validateSoftwareTenant();
        Map<String, Object> exec = executions.get(executionId);
        if (exec == null) {
            throw new ResourceNotFoundException("Execution not found: " + executionId);
        }

        exec.put("status", "DELIVERED");
        exec.put("failureCode", null);
        exec.put("retryable", false);
        exec.put("attemptCount", 2);
        exec.put("retriedAt", LocalDateTime.now().toString());

        return ResponseEntity.ok(Map.of("success", true, "message", "Execution retried and queued successfully", "data", exec));
    }

    // 23. POST /stop-contact
    @PostMapping("/stop-contact")
    public ResponseEntity<Map<String, Object>> stopContact(@RequestBody Map<String, Object> body) {
        validateSoftwareTenant();
        String supId = "SUP-" + suppressionCounter.incrementAndGet();
        Map<String, Object> sup = new LinkedHashMap<>();
        sup.put("suppressionId", supId);
        sup.put("customerId", body.get("customerId"));
        sup.put("channel", body.getOrDefault("channel", "EMAIL"));
        sup.put("status", "ACTIVE");
        sup.put("reason", body.getOrDefault("reason", "CUSTOMER_OPT_OUT"));
        sup.put("source", body.getOrDefault("source", "CUSTOMER_REQUEST"));
        sup.put("createdAt", LocalDateTime.now().toString());

        suppressions.put(supId, sup);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("suppressionId", supId);
        data.put("customerId", sup.get("customerId"));
        data.put("channel", sup.get("channel"));
        data.put("status", "ACTIVE");
        data.put("reason", sup.get("reason"));

        return ResponseEntity.ok(Map.of("success", true, "message", "Contact suppression recorded", "data", data));
    }

    // 24. GET /suppression-list
    @GetMapping("/suppression-list")
    public ResponseEntity<Map<String, Object>> getSuppressionList() {
        validateSoftwareTenant();
        return ResponseEntity.ok(Map.of("success", true, "message", "Suppression records loaded", "data", new ArrayList<>(suppressions.values())));
    }

    // 25. GET /metrics
    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getMetrics(@RequestParam(defaultValue = "THIS_MONTH") String period) {
        validateSoftwareTenant();
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("tasksCreated", 480);
        data.put("tasksCompleted", 350);
        data.put("messagesQueued", 280);
        data.put("messagesDelivered", 260);
        data.put("messagesFailed", 12);
        data.put("customersOptedOut", 8);
        data.put("humanEscalations", 25);
        data.put("taskCompletionRatePercentage", 72.92);

        return ResponseEntity.ok(Map.of("success", true, "message", "Follow-up metrics retrieved", "data", data));
    }
}
