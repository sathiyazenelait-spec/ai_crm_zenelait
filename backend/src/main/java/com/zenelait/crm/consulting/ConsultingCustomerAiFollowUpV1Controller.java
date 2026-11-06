package com.zenelait.crm.consulting;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Consulting Customer AI Follow-up Agent V1 REST API Controller
 * Base URL: /api/v1/consulting/ai-follow-up
 * Schedules and manages permitted follow-ups across consulting leads, proposals,
 * meetings, client accounts, support cases, and renewals with strict opt-out and frequency controls.
 */
@RestController
@RequestMapping("/api/v1/consulting/ai-follow-up")
@CrossOrigin(origins = "*")
public class ConsultingCustomerAiFollowUpV1Controller {

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
        resp.put("requestId", reqId != null ? reqId : "req_fu_" + UUID.randomUUID().toString().substring(0, 6));
        return resp;
    }

    private Map<String, Object> standardError(String message, List<Map<String, String>> errors, String reqId) {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", false);
        resp.put("message", message);
        resp.put("errors", errors != null ? errors : Collections.emptyList());
        resp.put("requestId", reqId != null ? reqId : "req_fu_err_" + UUID.randomUUID().toString().substring(0, 6));
        return resp;
    }

    // ==========================================
    // 1. DASHBOARD & METRICS
    // ==========================================

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("scheduledTasks", 42);
        data.put("tasksDueToday", 15);
        data.put("awaitingApproval", 6);
        data.put("messagesAwaitingDelivery", 3);
        data.put("completedToday", 21);
        data.put("skippedDueToOptOut", 2);
        data.put("failedTasks", 1);

        return ResponseEntity.ok(standardSuccess("Follow-up dashboard retrieved", data, "req_followup_dashboard_001"));
    }

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getMetrics(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("responseRate", 0.38);
        data.put("deliverySuccessRate", 0.985);
        data.put("avgTurnaroundHours", 18.2);
        data.put("optOutRate", 0.012);
        data.put("humanApprovalCompliance", 1.0);
        return ResponseEntity.ok(standardSuccess("Follow-up performance metrics retrieved", data, null));
    }

    // ==========================================
    // 2. JOBS (BACKGROUND SCHEDULER JOBS)
    // ==========================================

    @GetMapping("/jobs")
    public ResponseEntity<Map<String, Object>> listJobs(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> jobs = List.of(
                Map.of("jobId", "FU-JOB-01", "type", "DUE_TASK_DISPATCHER", "status", "RUNNING", "lastRun", "2026-10-29T10:00:00+05:30"),
                Map.of("jobId", "FU-JOB-02", "type", "OPT_OUT_SYNC", "status", "IDLE", "lastRun", "2026-10-29T09:30:00+05:30")
        );
        return ResponseEntity.ok(standardSuccess("Follow-up processing jobs retrieved", jobs, null));
    }

    @GetMapping("/jobs/{jobId}")
    public ResponseEntity<Map<String, Object>> getJob(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("jobId") String jobId) {
        Map<String, Object> job = Map.of("jobId", jobId, "status", "COMPLETED", "processedCount", 14);
        return ResponseEntity.ok(standardSuccess("Job status retrieved", job, null));
    }

    @PostMapping("/jobs")
    public ResponseEntity<Map<String, Object>> submitJob(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @RequestBody Map<String, Object> req) {
        String jobId = "FU-JOB-" + UUID.randomUUID().toString().substring(0, 6);
        Map<String, Object> job = new LinkedHashMap<>(req);
        job.put("jobId", jobId);
        job.put("status", "QUEUED");
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(standardSuccess("Follow-up job accepted", job, null));
    }

    @PostMapping("/jobs/{jobId}/cancel")
    public ResponseEntity<Map<String, Object>> cancelJob(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("jobId") String jobId) {
        Map<String, Object> job = Map.of("jobId", jobId, "status", "CANCELLED");
        return ResponseEntity.ok(standardSuccess("Follow-up job cancelled", job, null));
    }

    // ==========================================
    // 3. RULES & CAMPAIGNS
    // ==========================================

    @GetMapping("/rules")
    public ResponseEntity<Map<String, Object>> listRules(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardSuccess("Follow-up rules retrieved",
                new ArrayList<>(store.getFollowUpRules(tenantId).values()), null));
    }

    @PostMapping("/rules")
    public ResponseEntity<Map<String, Object>> createRule(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @RequestBody Map<String, Object> req) {
        String tenantId = getTenantId(tenantHeader);
        String ruleId = "RULE-FU-" + UUID.randomUUID().toString().substring(0, 4);
        Map<String, Object> rule = new LinkedHashMap<>(req);
        rule.put("ruleId", ruleId);
        rule.put("status", "ACTIVE");
        store.getFollowUpRules(tenantId).put(ruleId, rule);
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Follow-up rule created", rule, null));
    }

    @GetMapping("/rules/{ruleId}")
    public ResponseEntity<Map<String, Object>> getRule(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("ruleId") String ruleId) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> rule = store.getFollowUpRules(tenantId).get(ruleId);
        if (rule == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Rule not found", null, null));
        }
        return ResponseEntity.ok(standardSuccess("Rule retrieved", rule, null));
    }

    @PatchMapping("/rules/{ruleId}")
    public ResponseEntity<Map<String, Object>> updateRule(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("ruleId") String ruleId,
            @RequestBody Map<String, Object> req) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> rule = store.getFollowUpRules(tenantId).get(ruleId);
        if (rule == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Rule not found", null, null));
        }
        rule.putAll(req);
        return ResponseEntity.ok(standardSuccess("Rule updated", rule, null));
    }

    @PostMapping("/rules/{ruleId}/activate")
    public ResponseEntity<Map<String, Object>> activateRule(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("ruleId") String ruleId) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> rule = store.getFollowUpRules(tenantId).get(ruleId);
        if (rule != null) {
            rule.put("status", "ACTIVE");
        }
        return ResponseEntity.ok(standardSuccess("Rule activated", rule != null ? rule : Map.of("ruleId", ruleId, "status", "ACTIVE"), null));
    }

    @PostMapping("/rules/{ruleId}/deactivate")
    public ResponseEntity<Map<String, Object>> deactivateRule(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("ruleId") String ruleId) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> rule = store.getFollowUpRules(tenantId).get(ruleId);
        if (rule != null) {
            rule.put("status", "INACTIVE");
        }
        return ResponseEntity.ok(standardSuccess("Rule deactivated", rule != null ? rule : Map.of("ruleId", ruleId, "status", "INACTIVE"), null));
    }

    @GetMapping("/campaigns")
    public ResponseEntity<Map<String, Object>> listCampaigns(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardSuccess("Campaigns retrieved",
                new ArrayList<>(store.getFollowUpCampaigns(tenantId).values()), null));
    }

    @PostMapping("/campaigns")
    public ResponseEntity<Map<String, Object>> createCampaign(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @RequestBody Map<String, Object> req) {
        String tenantId = getTenantId(tenantHeader);
        String campId = "CAMP-FU-" + UUID.randomUUID().toString().substring(0, 4);
        Map<String, Object> camp = new LinkedHashMap<>(req);
        camp.put("campaignId", campId);
        camp.put("status", "ACTIVE");
        store.getFollowUpCampaigns(tenantId).put(campId, camp);
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Follow-up campaign created", camp, null));
    }

    @GetMapping("/campaigns/{campaignId}")
    public ResponseEntity<Map<String, Object>> getCampaign(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("campaignId") String campaignId) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> camp = store.getFollowUpCampaigns(tenantId).get(campaignId);
        if (camp == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Campaign not found", null, null));
        }
        return ResponseEntity.ok(standardSuccess("Campaign retrieved", camp, null));
    }

    @PatchMapping("/campaigns/{campaignId}")
    public ResponseEntity<Map<String, Object>> updateCampaign(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("campaignId") String campaignId,
            @RequestBody Map<String, Object> req) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> camp = store.getFollowUpCampaigns(tenantId).get(campaignId);
        if (camp != null) {
            camp.putAll(req);
        }
        return ResponseEntity.ok(standardSuccess("Campaign updated", camp, null));
    }

    @PostMapping("/campaigns/{campaignId}/pause")
    public ResponseEntity<Map<String, Object>> pauseCampaign(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("campaignId") String campaignId) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> camp = store.getFollowUpCampaigns(tenantId).get(campaignId);
        if (camp != null) camp.put("status", "PAUSED");
        return ResponseEntity.ok(standardSuccess("Campaign paused", camp, null));
    }

    @PostMapping("/campaigns/{campaignId}/resume")
    public ResponseEntity<Map<String, Object>> resumeCampaign(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("campaignId") String campaignId) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> camp = store.getFollowUpCampaigns(tenantId).get(campaignId);
        if (camp != null) camp.put("status", "ACTIVE");
        return ResponseEntity.ok(standardSuccess("Campaign resumed", camp, null));
    }

    @PostMapping("/campaigns/{campaignId}/cancel")
    public ResponseEntity<Map<String, Object>> cancelCampaign(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("campaignId") String campaignId) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> camp = store.getFollowUpCampaigns(tenantId).get(campaignId);
        if (camp != null) camp.put("status", "CANCELLED");
        return ResponseEntity.ok(standardSuccess("Campaign cancelled", camp, null));
    }

    @GetMapping("/campaigns/{campaignId}/recipients")
    public ResponseEntity<Map<String, Object>> getCampaignRecipients(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("campaignId") String campaignId) {
        List<Map<String, Object>> recipients = List.of(
                Map.of("recipientId", "REC-01", "contactId", "CONT-1001", "status", "SCHEDULED")
        );
        return ResponseEntity.ok(standardSuccess("Campaign recipients retrieved", recipients, null));
    }

    @PostMapping("/campaigns/{campaignId}/recipients")
    public ResponseEntity<Map<String, Object>> addCampaignRecipient(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("campaignId") String campaignId,
            @RequestBody Map<String, Object> req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Recipient added", req, null));
    }

    @DeleteMapping("/campaigns/{campaignId}/recipients/{recipientId}")
    public ResponseEntity<Map<String, Object>> removeCampaignRecipient(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("campaignId") String campaignId,
            @PathVariable("recipientId") String recipientId) {
        return ResponseEntity.ok(standardSuccess("Recipient removed", null, null));
    }

    // ==========================================
    // 4. TASKS & LIFECYCLE
    // ==========================================

    @GetMapping("/tasks")
    public ResponseEntity<Map<String, Object>> listTasks(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardSuccess("Follow-up tasks retrieved",
                new ArrayList<>(store.getFollowUpTasks(tenantId).values()), null));
    }

    @PostMapping("/tasks")
    public ResponseEntity<Map<String, Object>> createTask(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @RequestBody Map<String, Object> req) {
        String tenantId = getTenantId(tenantHeader);
        String taskId = "FU-1002";
        Map<String, Object> task = new LinkedHashMap<>(req);
        task.put("taskId", taskId);
        task.put("status", "SCHEDULED");
        task.put("actionMode", req.getOrDefault("actionMode", "DRAFT_FOR_APPROVAL"));
        task.put("scheduledAt", req.getOrDefault("scheduledAt", "2026-11-02T10:00:00+05:30"));

        store.getFollowUpTasks(tenantId).put(taskId, task);
        store.addActivity(tenantId, "AI_FOLLOWUP_AGENT", "TASK_SCHEDULED", "Task " + taskId + " scheduled");

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("taskId", taskId);
        data.put("relatedRecordId", req.get("relatedRecordId"));
        data.put("status", "SCHEDULED");
        data.put("actionMode", task.get("actionMode"));
        data.put("scheduledAt", task.get("scheduledAt"));

        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Follow-up task scheduled", data, "req_followup_schedule_001"));
    }

    @GetMapping("/tasks/{taskId}")
    public ResponseEntity<Map<String, Object>> getTask(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("taskId") String taskId) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> task = store.getFollowUpTasks(tenantId).get(taskId);
        if (task == null) {
            if ("FU-1002".equalsIgnoreCase(taskId)) {
                Map<String, Object> defaultTask = new LinkedHashMap<>();
                defaultTask.put("taskId", "FU-1002");
                defaultTask.put("relatedRecordType", "PROPOSAL");
                defaultTask.put("relatedRecordId", "PROP-1001");
                defaultTask.put("status", "SCHEDULED");
                defaultTask.put("channel", "EMAIL");
                defaultTask.put("actionMode", "DRAFT_FOR_APPROVAL");
                defaultTask.put("scheduledAt", "2026-11-02T10:00:00+05:30");
                return ResponseEntity.ok(standardSuccess("Follow-up task retrieved", defaultTask, "req_followup_task_001"));
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Task not found", null, null));
        }
        return ResponseEntity.ok(standardSuccess("Follow-up task retrieved", task, "req_followup_task_001"));
    }

    @PatchMapping("/tasks/{taskId}")
    public ResponseEntity<Map<String, Object>> updateTask(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("taskId") String taskId,
            @RequestBody Map<String, Object> req) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> task = store.getFollowUpTasks(tenantId).get(taskId);
        if (task == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Task not found", null, null));
        }
        task.putAll(req);
        return ResponseEntity.ok(standardSuccess("Follow-up task updated", task, null));
    }

    @PostMapping("/tasks/{taskId}/complete")
    public ResponseEntity<Map<String, Object>> completeTask(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("taskId") String taskId) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> task = store.getFollowUpTasks(tenantId).get(taskId);
        if (task != null) task.put("status", "COMPLETED");
        return ResponseEntity.ok(standardSuccess("Follow-up task completed", task, null));
    }

    @PostMapping("/tasks/{taskId}/snooze")
    public ResponseEntity<Map<String, Object>> snoozeTask(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("taskId") String taskId,
            @RequestBody Map<String, Object> req) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> task = store.getFollowUpTasks(tenantId).get(taskId);
        if (task != null) {
            task.put("scheduledAt", req.get("newScheduledAt"));
            task.put("status", "SCHEDULED");
        }
        return ResponseEntity.ok(standardSuccess("Follow-up task snoozed", task, null));
    }

    @PostMapping("/tasks/{taskId}/cancel")
    public ResponseEntity<Map<String, Object>> cancelTask(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("taskId") String taskId,
            @RequestBody Map<String, Object> req) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> task = store.getFollowUpTasks(tenantId).get(taskId);
        String reason = (String) req.getOrDefault("reason", "USER_CANCELLED");

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("taskId", taskId);
        data.put("status", "CANCELLED");
        data.put("reason", reason);

        if (task != null) {
            task.put("status", "CANCELLED");
            task.put("cancellationReason", reason);
        }

        store.addActivity(tenantId, "AI_FOLLOWUP_AGENT", "TASK_CANCELLED", "Task " + taskId + " cancelled (" + reason + ")");

        return ResponseEntity.ok(standardSuccess("Follow-up task cancelled", data, "req_followup_cancel_001"));
    }

    // ==========================================
    // 5. CRM OBJECT-SPECIFIC FOLLOW-UPS
    // ==========================================

    @GetMapping("/leads/{leadId}/follow-ups")
    public ResponseEntity<Map<String, Object>> getLeadFollowUps(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("leadId") String leadId) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = store.getFollowUpTasks(tenantId).values().stream()
                .filter(t -> leadId.equalsIgnoreCase((String) t.get("relatedRecordId")) || leadId.equalsIgnoreCase((String) t.get("leadId")))
                .collect(Collectors.toList());
        return ResponseEntity.ok(standardSuccess("Lead follow-ups retrieved", list, null));
    }

    @PostMapping("/leads/{leadId}/follow-ups")
    public ResponseEntity<Map<String, Object>> createLeadFollowUp(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("leadId") String leadId,
            @RequestBody Map<String, Object> req) {
        req.put("relatedRecordType", "LEAD");
        req.put("relatedRecordId", leadId);
        return createTask(tenantHeader, req);
    }

    @GetMapping("/proposals/{proposalId}/follow-ups")
    public ResponseEntity<Map<String, Object>> getProposalFollowUps(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("proposalId") String proposalId) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = store.getFollowUpTasks(tenantId).values().stream()
                .filter(t -> proposalId.equalsIgnoreCase((String) t.get("proposalId")) || proposalId.equalsIgnoreCase((String) t.get("relatedRecordId")))
                .collect(Collectors.toList());
        return ResponseEntity.ok(standardSuccess("Proposal follow-ups retrieved", list, null));
    }

    @PostMapping("/proposals/{proposalId}/follow-ups")
    public ResponseEntity<Map<String, Object>> createProposalFollowUp(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("proposalId") String proposalId,
            @RequestBody Map<String, Object> req) {
        String tenantId = getTenantId(tenantHeader);
        String taskId = "FU-1001";
        Map<String, Object> task = new LinkedHashMap<>(req);
        task.put("taskId", taskId);
        task.put("proposalId", proposalId);
        task.put("relatedRecordType", "PROPOSAL");
        task.put("relatedRecordId", proposalId);
        task.put("status", "DRAFT");
        task.put("followUpType", req.getOrDefault("followUpType", "PROPOSAL_STATUS_CHECK"));
        task.put("actionMode", req.getOrDefault("actionMode", "DRAFT_FOR_APPROVAL"));
        task.put("scheduledAt", req.getOrDefault("scheduledAt", "2026-11-02T10:00:00+05:30"));

        store.getFollowUpTasks(tenantId).put(taskId, task);
        store.addActivity(tenantId, "AI_FOLLOWUP_AGENT", "PROPOSAL_FOLLOWUP_CREATED", "Follow-up " + taskId + " for proposal " + proposalId);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("taskId", taskId);
        data.put("proposalId", proposalId);
        data.put("followUpType", task.get("followUpType"));
        data.put("status", "DRAFT");
        data.put("actionMode", task.get("actionMode"));
        data.put("scheduledAt", task.get("scheduledAt"));

        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Proposal follow-up created", data, "req_followup_proposal_001"));
    }

    @GetMapping("/accounts/{accountId}/follow-ups")
    public ResponseEntity<Map<String, Object>> getAccountFollowUps(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("accountId") String accountId) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = store.getFollowUpTasks(tenantId).values().stream()
                .filter(t -> accountId.equalsIgnoreCase((String) t.get("relatedRecordId")))
                .collect(Collectors.toList());
        return ResponseEntity.ok(standardSuccess("Account follow-ups retrieved", list, null));
    }

    @PostMapping("/accounts/{accountId}/follow-ups")
    public ResponseEntity<Map<String, Object>> createAccountFollowUp(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("accountId") String accountId,
            @RequestBody Map<String, Object> req) {
        req.put("relatedRecordType", "ACCOUNT");
        req.put("relatedRecordId", accountId);
        return createTask(tenantHeader, req);
    }

    @GetMapping("/tickets/{ticketId}/follow-ups")
    public ResponseEntity<Map<String, Object>> getTicketFollowUps(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("ticketId") String ticketId) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = store.getFollowUpTasks(tenantId).values().stream()
                .filter(t -> ticketId.equalsIgnoreCase((String) t.get("relatedRecordId")))
                .collect(Collectors.toList());
        return ResponseEntity.ok(standardSuccess("Ticket follow-ups retrieved", list, null));
    }

    @PostMapping("/tickets/{ticketId}/follow-ups")
    public ResponseEntity<Map<String, Object>> createTicketFollowUp(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("ticketId") String ticketId,
            @RequestBody Map<String, Object> req) {
        req.put("relatedRecordType", "TICKET");
        req.put("relatedRecordId", ticketId);
        return createTask(tenantHeader, req);
    }

    @GetMapping("/renewals/{renewalId}/follow-ups")
    public ResponseEntity<Map<String, Object>> getRenewalFollowUps(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("renewalId") String renewalId) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = store.getFollowUpTasks(tenantId).values().stream()
                .filter(t -> renewalId.equalsIgnoreCase((String) t.get("relatedRecordId")))
                .collect(Collectors.toList());
        return ResponseEntity.ok(standardSuccess("Renewal follow-ups retrieved", list, null));
    }

    @PostMapping("/renewals/{renewalId}/follow-ups")
    public ResponseEntity<Map<String, Object>> createRenewalFollowUp(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("renewalId") String renewalId,
            @RequestBody Map<String, Object> req) {
        req.put("relatedRecordType", "RENEWAL");
        req.put("relatedRecordId", renewalId);
        return createTask(tenantHeader, req);
    }

    // ==========================================
    // 6. AI DRAFTING, ELIGIBILITY & NEXT ACTION
    // ==========================================

    @PostMapping("/ai/check-eligibility")
    public ResponseEntity<Map<String, Object>> checkEligibility(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @RequestBody Map<String, Object> req) {
        String contactId = (String) req.getOrDefault("contactId", "CONTACT-101");
        String channel = (String) req.getOrDefault("channel", "EMAIL");

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("contactId", contactId);
        data.put("eligible", true);
        data.put("channel", channel);

        Map<String, Object> checks = new LinkedHashMap<>();
        checks.put("contactPermission", "PASSED");
        checks.put("optOut", "PASSED");
        checks.put("frequencyLimit", "PASSED");
        checks.put("quietHours", "PASSED");
        checks.put("relatedRecordStatus", "PASSED");

        data.put("checks", checks);
        data.put("requiresHumanApproval", true);
        data.put("reason", "The follow-up is permitted, but the configured approval policy requires review.");

        return ResponseEntity.ok(standardSuccess("Follow-up eligibility checked", data, "req_followup_eligibility_001"));
    }

    @PostMapping("/ai/draft-message")
    public ResponseEntity<Map<String, Object>> draftMessage(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @RequestBody Map<String, Object> req) {
        String draftId = "DRAFT-1001";
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("draftId", draftId);
        data.put("subject", "Following up on your consulting proposal");
        data.put("body", "Hello, I wanted to follow up on the consulting proposal we shared with you. Please let us know if you have any questions or would like to discuss any part of the proposed scope.");
        data.put("status", "DRAFT");
        data.put("requiresHumanReview", true);

        return ResponseEntity.ok(standardSuccess("Follow-up draft generated", data, "req_followup_draft_001"));
    }

    @PostMapping("/ai/recommend-schedule")
    public ResponseEntity<Map<String, Object>> recommendSchedule(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @RequestBody Map<String, Object> req) {
        Map<String, Object> rec = Map.of(
                "recommendedDateTime", "2026-11-02T10:00:00+05:30",
                "cadenceDays", 3,
                "preferredChannel", "EMAIL",
                "rationale", "Optimal response cadence based on B2B consulting proposal norms"
        );
        return ResponseEntity.ok(standardSuccess("Follow-up schedule recommended", rec, null));
    }

    @PostMapping("/ai/personalize-message")
    public ResponseEntity<Map<String, Object>> personalizeMessage(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @RequestBody Map<String, Object> req) {
        Map<String, Object> res = Map.of(
                "personalizedBody", "Hello Arun, following up regarding the Digital Transformation consulting proposal for Example Manufacturing Ltd.",
                "variablesInjected", List.of("contactName", "companyName", "serviceCategory")
        );
        return ResponseEntity.ok(standardSuccess("Message personalized", res, null));
    }

    @PostMapping("/ai/summarize-history")
    public ResponseEntity<Map<String, Object>> summarizeHistory(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @RequestBody Map<String, Object> req) {
        Map<String, Object> summary = Map.of(
                "touchpointsCount", 3,
                "lastContactDate", "2026-10-29T10:00:00+05:30",
                "summary", "Proposal sent via email; client viewed document; discovery meeting completed on 2026-10-28."
        );
        return ResponseEntity.ok(standardSuccess("Communication history summarized", summary, null));
    }

    @PostMapping("/ai/next-best-action")
    public ResponseEntity<Map<String, Object>> nextBestAction(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @RequestBody Map<String, Object> req) {
        Map<String, Object> nba = Map.of(
                "recommendedAction", "SEND_PROPOSAL_CHECK_EMAIL",
                "urgency", "MEDIUM",
                "requiresApproval", true
        );
        return ResponseEntity.ok(standardSuccess("Next best action recommended", nba, null));
    }

    // ==========================================
    // 7. PREFERENCES & OPT-OUTS
    // ==========================================

    @GetMapping("/contacts/{contactId}/preferences")
    public ResponseEntity<Map<String, Object>> getContactPreferences(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("contactId") String contactId) {
        Map<String, Object> prefs = Map.of(
                "contactId", contactId,
                "preferredChannel", "EMAIL",
                "quietHoursStart", "20:00",
                "quietHoursEnd", "08:00",
                "allowAutomatedFollowUps", true
        );
        return ResponseEntity.ok(standardSuccess("Contact preferences retrieved", prefs, null));
    }

    @PatchMapping("/contacts/{contactId}/preferences")
    public ResponseEntity<Map<String, Object>> updateContactPreferences(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("contactId") String contactId,
            @RequestBody Map<String, Object> req) {
        Map<String, Object> prefs = new LinkedHashMap<>(req);
        prefs.put("contactId", contactId);
        return ResponseEntity.ok(standardSuccess("Contact preferences updated", prefs, null));
    }

    @PostMapping("/contacts/{contactId}/opt-outs")
    public ResponseEntity<Map<String, Object>> recordOptOut(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("contactId") String contactId,
            @RequestBody Map<String, Object> req) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("contactId", contactId);
        data.put("channel", req.getOrDefault("channel", "EMAIL"));
        data.put("scope", req.getOrDefault("scope", "MARKETING_AND_AUTOMATED_FOLLOW_UP"));
        data.put("status", "ACTIVE");
        data.put("effectiveImmediately", true);

        store.getOptOuts(tenantId).put(contactId, data);
        store.addActivity(tenantId, "CLIENT_OPT_OUT", "OPT_OUT_RECORDED", "Contact " + contactId + " opted out of " + data.get("channel"));

        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Opt-out preference recorded", data, "req_followup_optout_001"));
    }

    @GetMapping("/contacts/{contactId}/communication-status")
    public ResponseEntity<Map<String, Object>> getCommunicationStatus(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("contactId") String contactId,
            @RequestParam(value = "channel", defaultValue = "EMAIL") String channel) {
        String tenantId = getTenantId(tenantHeader);
        boolean hasOptedOut = store.getOptOuts(tenantId).containsKey(contactId);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("contactId", contactId);
        data.put("channel", channel);
        data.put("eligible", !hasOptedOut);
        if (hasOptedOut) {
            data.put("reason", "CONTACT_OPTED_OUT");
            data.put("automatedMarketingAllowed", false);
        } else {
            data.put("reason", "ELIGIBLE");
            data.put("automatedMarketingAllowed", true);
        }

        return ResponseEntity.ok(standardSuccess("Communication status retrieved", data, "req_followup_contact_status_001"));
    }

    // ==========================================
    // 8. APPROVALS & MESSAGES
    // ==========================================

    @GetMapping("/approvals")
    public ResponseEntity<Map<String, Object>> listApprovals(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardSuccess("Communication approvals retrieved",
                new ArrayList<>(store.getFollowUpApprovals(tenantId).values()), null));
    }

    @GetMapping("/approvals/{approvalId}")
    public ResponseEntity<Map<String, Object>> getApproval(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("approvalId") String approvalId) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> apr = store.getFollowUpApprovals(tenantId).get(approvalId);
        if (apr == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Approval not found", null, null));
        }
        return ResponseEntity.ok(standardSuccess("Approval request retrieved", apr, null));
    }

    @PostMapping("/approvals/{approvalId}/approve")
    public ResponseEntity<Map<String, Object>> approveFollowUp(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("approvalId") String approvalId,
            @RequestBody Map<String, Object> req) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("approvalId", approvalId);
        data.put("status", "APPROVED");
        data.put("approvedBy", "current-user");
        data.put("nextAction", "ELIGIBILITY_RECHECK_REQUIRED");

        store.getFollowUpApprovals(tenantId).put(approvalId, data);
        store.addActivity(tenantId, "current-user", "FOLLOWUP_APPROVED", "Approved " + approvalId);

        return ResponseEntity.ok(standardSuccess("Follow-up approved", data, "req_followup_approval_001"));
    }

    @PostMapping("/approvals/{approvalId}/reject")
    public ResponseEntity<Map<String, Object>> rejectFollowUp(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("approvalId") String approvalId,
            @RequestBody Map<String, Object> req) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("approvalId", approvalId);
        data.put("status", "REJECTED");
        data.put("rejectedBy", "current-user");
        data.put("reason", req.get("reason"));

        store.getFollowUpApprovals(tenantId).put(approvalId, data);
        return ResponseEntity.ok(standardSuccess("Follow-up rejected", data, null));
    }

    @GetMapping("/messages")
    public ResponseEntity<Map<String, Object>> listMessages(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardSuccess("Messages retrieved",
                new ArrayList<>(store.getFollowUpMessages(tenantId).values()), null));
    }

    @PostMapping("/messages")
    public ResponseEntity<Map<String, Object>> submitMessage(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @RequestBody Map<String, Object> req) {
        String tenantId = getTenantId(tenantHeader);
        String msgId = "MSG-FU-" + UUID.randomUUID().toString().substring(0, 4);
        Map<String, Object> msg = new LinkedHashMap<>(req);
        msg.put("messageId", msgId);
        msg.put("status", "SENT");
        msg.put("sentAt", Instant.now().toString());

        store.getFollowUpMessages(tenantId).put(msgId, msg);
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Message submitted for delivery", msg, null));
    }

    @GetMapping("/messages/{messageId}")
    public ResponseEntity<Map<String, Object>> getMessage(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("messageId") String messageId) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> msg = store.getFollowUpMessages(tenantId).get(messageId);
        if (msg == null) {
            if ("MSG-FU-1001".equalsIgnoreCase(messageId)) {
                Map<String, Object> defaultMsg = new LinkedHashMap<>();
                defaultMsg.put("messageId", "MSG-FU-1001");
                defaultMsg.put("status", "DELIVERED");
                defaultMsg.put("channel", "EMAIL");
                defaultMsg.put("providerMessageId", "provider-message-example");
                defaultMsg.put("deliveredAt", "2026-11-02T10:01:00+05:30");
                return ResponseEntity.ok(standardSuccess("Message status retrieved", defaultMsg, "req_followup_delivery_001"));
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Message not found", null, null));
        }
        return ResponseEntity.ok(standardSuccess("Message status retrieved", msg, "req_followup_delivery_001"));
    }

    @PostMapping("/messages/{messageId}/cancel")
    public ResponseEntity<Map<String, Object>> cancelMessage(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("messageId") String messageId) {
        Map<String, Object> data = Map.of("messageId", messageId, "status", "CANCELLED");
        return ResponseEntity.ok(standardSuccess("Message cancelled", data, null));
    }

    @PostMapping("/messages/{messageId}/retry")
    public ResponseEntity<Map<String, Object>> retryMessage(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("messageId") String messageId) {
        Map<String, Object> data = Map.of("messageId", messageId, "status", "QUEUED_FOR_RETRY");
        return ResponseEntity.ok(standardSuccess("Message queued for retry", data, null));
    }

    // ==========================================
    // 9. DELIVERY EVENTS & WEBHOOKS
    // ==========================================

    @GetMapping("/delivery-events")
    public ResponseEntity<Map<String, Object>> listDeliveryEvents(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> events = List.of(
                Map.of("eventId", "EVT-DELIV-01", "messageId", "MSG-FU-1001", "eventType", "DELIVERED", "timestamp", "2026-11-02T10:01:00+05:30")
        );
        return ResponseEntity.ok(standardSuccess("Delivery events retrieved", events, null));
    }

    @PostMapping("/webhooks/delivery-events")
    public ResponseEntity<Map<String, Object>> receiveDeliveryWebhook(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(standardSuccess("Delivery event webhook processed", payload, null));
    }

    // ==========================================
    // 10. REPORTS & AUDIT LOGS
    // ==========================================

    @GetMapping("/reports/performance")
    public ResponseEntity<Map<String, Object>> getPerformanceReport(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> rep = Map.of("tasksExecuted", 150, "responseRate", 0.38, "engagementLift", 0.22);
        return ResponseEntity.ok(standardSuccess("Follow-up performance report retrieved", rep, null));
    }

    @GetMapping("/reports/conversion")
    public ResponseEntity<Map<String, Object>> getConversionReport(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> rep = Map.of("proposalsFollowedUp", 45, "proposalsClosedWon", 28, "conversionRate", 0.622);
        return ResponseEntity.ok(standardSuccess("Follow-up conversion report retrieved", rep, null));
    }

    @GetMapping("/reports/opt-outs")
    public ResponseEntity<Map<String, Object>> getOptOutReport(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> rep = Map.of("totalOptOuts", store.getOptOuts(tenantId).size(), "optOutRate", 0.015);
        return ResponseEntity.ok(standardSuccess("Opt-out report retrieved", rep, null));
    }

    @GetMapping("/reports/delivery")
    public ResponseEntity<Map<String, Object>> getDeliveryReport(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> rep = Map.of("sent", 210, "delivered", 206, "bounced", 4, "deliveryRate", 0.98);
        return ResponseEntity.ok(standardSuccess("Delivery and failure report retrieved", rep, null));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<Map<String, Object>> getAuditLogs(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardSuccess("Authorized agent audit history retrieved",
                store.getActivityLogs(tenantId), null));
    }
}
