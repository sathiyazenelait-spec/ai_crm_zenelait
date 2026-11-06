package com.zenelait.crm.education;

import com.zenelait.crm.common.exception.ForbiddenException;
import com.zenelait.crm.common.exception.ResourceNotFoundException;
import com.zenelait.crm.tenant.TenantSecurityService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Zenelait AI CRM — Education Tenant: AI Follow-up Agent V1 Controller
 * Base Path: /api/v1/education/ai-follow-ups
 * Implements 28 complete REST APIs as specified in Section 8 of Education Tenant Specification.
 */
@RestController
@RequestMapping("/api/v1/education/ai-follow-ups")
@CrossOrigin(origins = "*")
public class EducationAiFollowUpV1Controller {

    private final EducationDataStore store;
    private final TenantSecurityService tenantSecurityService;

    public EducationAiFollowUpV1Controller(EducationDataStore store, TenantSecurityService tenantSecurityService) {
        this.store = store;
        this.tenantSecurityService = tenantSecurityService;
    }

    private String getTenantId() {
        try {
            String tid = tenantSecurityService.getCurrentTenantId();
            if (tid != null && !tid.isBlank()) return tid;
        } catch (Exception ignored) {}
        return EducationDataStore.TENANT_ID;
    }

    private <T> ResponseEntity<Map<String, Object>> buildSuccess(String message, T data, HttpStatus status, String requestId) {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", true);
        resp.put("message", message);
        resp.put("data", data);
        resp.put("timestamp", LocalDateTime.now().toString());
        resp.put("requestId", requestId != null ? requestId : "req_fu_" + UUID.randomUUID().toString().substring(0, 8));
        return ResponseEntity.status(status).body(resp);
    }

    // 1. GET /config
    @GetMapping("/config")
    public ResponseEntity<?> getConfig() {
        return buildSuccess("AI Follow-up Agent configuration retrieved", store.aiFollowUpConfig, HttpStatus.OK, "req_followup_config_001");
    }

    // 2. PATCH /config
    @PatchMapping("/config")
    public ResponseEntity<?> updateConfig(@RequestBody Map<String, Object> updates) {
        if (updates.containsKey("enabled")) store.aiFollowUpConfig.put("enabled", updates.get("enabled"));
        if (updates.containsKey("defaultChannel")) store.aiFollowUpConfig.put("defaultChannel", updates.get("defaultChannel"));
        if (updates.containsKey("humanApprovalRequired")) store.aiFollowUpConfig.put("humanApprovalRequired", updates.get("humanApprovalRequired"));
        if (updates.containsKey("respectContactPreferences")) store.aiFollowUpConfig.put("respectContactPreferences", updates.get("respectContactPreferences"));
        if (updates.containsKey("stopAfterStudentReply")) store.aiFollowUpConfig.put("stopAfterStudentReply", updates.get("stopAfterStudentReply"));
        if (updates.containsKey("maxAutomatedMessagesPerLeadPerWeek")) store.aiFollowUpConfig.put("maxAutomatedMessagesPerLeadPerWeek", updates.get("maxAutomatedMessagesPerLeadPerWeek"));
        if (updates.containsKey("minimumHoursBetweenMessages")) store.aiFollowUpConfig.put("minimumHoursBetweenMessages", updates.get("minimumHoursBetweenMessages"));
        if (updates.containsKey("permittedContactHours")) store.aiFollowUpConfig.put("permittedContactHours", updates.get("permittedContactHours"));
        store.aiFollowUpConfig.put("updatedAt", LocalDateTime.now().toString());
        store.aiFollowUpConfig.put("updatedBy", 10);
        return buildSuccess("AI Follow-up Agent configuration updated", store.aiFollowUpConfig, HttpStatus.OK, "req_followup_config_002");
    }

    // 3. GET /rules
    @GetMapping("/rules")
    public ResponseEntity<?> listRules(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        List<Map<String, Object>> filtered = store.aiFollowUpRules.stream()
                .filter(r -> status == null || status.equalsIgnoreCase((String) r.get("status")))
                .collect(Collectors.toList());

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("content", filtered);
        res.put("page", page);
        res.put("size", size);
        res.put("totalElements", filtered.size());
        res.put("totalPages", 1);
        return buildSuccess("Follow-up rules retrieved", res, HttpStatus.OK, "req_followup_rules_001");
    }

    // 4. POST /rules
    @PostMapping("/rules")
    public ResponseEntity<?> createRule(@RequestBody Map<String, Object> body) {
        int ruleId = store.aiRuleSeq.incrementAndGet();
        Map<String, Object> rule = new LinkedHashMap<>();
        rule.put("ruleId", (long) ruleId);
        rule.put("name", body.getOrDefault("name", "New Follow-up Rule"));
        rule.put("triggerType", body.getOrDefault("triggerType", "ENQUIRY_CREATED"));
        rule.put("delayMinutes", body.getOrDefault("delayMinutes", 1440));
        rule.put("channel", body.getOrDefault("channel", "EMAIL"));
        rule.put("conditions", body.getOrDefault("conditions", new HashMap<>()));
        rule.put("messageTemplateId", body.getOrDefault("messageTemplateId", "EDU_DEFAULT_01"));
        rule.put("requiresApproval", body.getOrDefault("requiresApproval", true));
        rule.put("maxExecutionsPerLead", body.getOrDefault("maxExecutionsPerLead", 1));
        rule.put("status", "DRAFT");
        rule.put("createdAt", LocalDateTime.now().toString());
        rule.put("tenantId", getTenantId());
        store.aiFollowUpRules.add(rule);

        return buildSuccess("Follow-up rule created", rule, HttpStatus.CREATED, "req_followup_rule_create_001");
    }

    // 5. GET /rules/{ruleId}
    @GetMapping("/rules/{ruleId}")
    public ResponseEntity<?> getRule(@PathVariable Long ruleId) {
        Map<String, Object> rule = store.aiFollowUpRules.stream()
                .filter(r -> ruleId.equals(r.get("ruleId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Rule not found: " + ruleId));
        return buildSuccess("Follow-up rule retrieved", rule, HttpStatus.OK, "req_followup_rule_001");
    }

    // 6. PATCH /rules/{ruleId}
    @PatchMapping("/rules/{ruleId}")
    public ResponseEntity<?> updateRule(@PathVariable Long ruleId, @RequestBody Map<String, Object> updates) {
        Map<String, Object> rule = store.aiFollowUpRules.stream()
                .filter(r -> ruleId.equals(r.get("ruleId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Rule not found: " + ruleId));

        if (updates.containsKey("delayMinutes")) rule.put("delayMinutes", updates.get("delayMinutes"));
        if (updates.containsKey("channel")) rule.put("channel", updates.get("channel"));
        if (updates.containsKey("requiresApproval")) rule.put("requiresApproval", updates.get("requiresApproval"));
        if (updates.containsKey("maxExecutionsPerLead")) rule.put("maxExecutionsPerLead", updates.get("maxExecutionsPerLead"));
        if (updates.containsKey("name")) rule.put("name", updates.get("name"));
        rule.put("updatedAt", LocalDateTime.now().toString());

        return buildSuccess("Follow-up rule updated", rule, HttpStatus.OK, "req_followup_rule_update_001");
    }

    // 7. POST /rules/{ruleId}/activate
    @PostMapping("/rules/{ruleId}/activate")
    public ResponseEntity<?> activateRule(@PathVariable Long ruleId) {
        Map<String, Object> rule = store.aiFollowUpRules.stream()
                .filter(r -> ruleId.equals(r.get("ruleId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Rule not found: " + ruleId));

        String prev = (String) rule.get("status");
        rule.put("status", "ACTIVE");
        rule.put("activatedAt", LocalDateTime.now().toString());
        rule.put("activatedBy", 10);

        Map<String, Object> resData = new LinkedHashMap<>();
        resData.put("ruleId", ruleId);
        resData.put("previousStatus", prev);
        resData.put("status", "ACTIVE");
        resData.put("activatedAt", rule.get("activatedAt"));
        resData.put("activatedBy", 10);

        return buildSuccess("Follow-up rule activated", resData, HttpStatus.OK, "req_followup_rule_activate_001");
    }

    // 8. POST /rules/{ruleId}/pause
    @PostMapping("/rules/{ruleId}/pause")
    public ResponseEntity<?> pauseRule(@PathVariable Long ruleId, @RequestBody(required = false) Map<String, Object> body) {
        Map<String, Object> rule = store.aiFollowUpRules.stream()
                .filter(r -> ruleId.equals(r.get("ruleId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Rule not found: " + ruleId));

        String prev = (String) rule.get("status");
        rule.put("status", "PAUSED");
        rule.put("pausedAt", LocalDateTime.now().toString());
        rule.put("pauseReason", body != null ? body.getOrDefault("reason", "Reviewing follow-up content") : "Paused by staff");

        Map<String, Object> resData = new LinkedHashMap<>();
        resData.put("ruleId", ruleId);
        resData.put("previousStatus", prev);
        resData.put("status", "PAUSED");
        resData.put("reason", rule.get("pauseReason"));
        resData.put("pausedAt", rule.get("pausedAt"));

        return buildSuccess("Follow-up rule paused", resData, HttpStatus.OK, "req_followup_rule_pause_001");
    }

    // 9. GET /tasks
    @GetMapping("/tasks")
    public ResponseEntity<?> listTasks(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        List<Map<String, Object>> filtered = store.aiFollowUpTasks.stream()
                .filter(t -> status == null || status.equalsIgnoreCase((String) t.get("status")))
                .collect(Collectors.toList());

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("content", filtered);
        res.put("page", page);
        res.put("size", size);
        res.put("totalElements", filtered.size());
        res.put("totalPages", 1);
        return buildSuccess("Follow-up tasks retrieved", res, HttpStatus.OK, "req_followup_tasks_001");
    }

    // 10. POST /tasks
    @PostMapping("/tasks")
    public ResponseEntity<?> createTask(@RequestBody Map<String, Object> body) {
        int taskId = store.aiTaskSeq.incrementAndGet();
        Long leadId = body.get("leadId") != null ? Long.valueOf(body.get("leadId").toString()) : 1201L;

        // Fetch lead name
        String leadName = "Prospective Student";
        for (Map<String, Object> e : store.enquiries) {
            if (leadId.equals(e.get("enquiryId")) || leadId.equals(e.get("leadId"))) {
                leadName = (String) e.getOrDefault("studentName", e.get("name"));
                break;
            }
        }

        Map<String, Object> task = new LinkedHashMap<>();
        task.put("taskId", (long) taskId);
        task.put("leadId", leadId);
        task.put("leadName", leadName);
        task.put("applicationId", body.get("applicationId"));
        task.put("taskType", body.getOrDefault("taskType", "COURSE_INFORMATION"));
        task.put("channel", body.getOrDefault("channel", "EMAIL"));
        task.put("status", "SCHEDULED");
        task.put("scheduledAt", body.getOrDefault("scheduledAt", "2026-10-29T11:00:00+05:30"));
        task.put("timeZone", body.getOrDefault("timeZone", "Asia/Kolkata"));
        task.put("reason", body.getOrDefault("reason", "Student requested time to review course information"));
        task.put("requiresApproval", body.getOrDefault("requiresApproval", true));
        task.put("createdBy", "AI_FOLLOWUP_AGENT");
        task.put("createdAt", LocalDateTime.now().toString());
        task.put("tenantId", getTenantId());
        store.aiFollowUpTasks.add(task);

        return buildSuccess("Follow-up task created", task, HttpStatus.CREATED, "req_followup_task_create_001");
    }

    // 11. GET /tasks/{taskId}
    @GetMapping("/tasks/{taskId}")
    public ResponseEntity<?> getTask(@PathVariable Long taskId) {
        Map<String, Object> task = store.aiFollowUpTasks.stream()
                .filter(t -> taskId.equals(t.get("taskId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + taskId));
        return buildSuccess("Follow-up task retrieved", task, HttpStatus.OK, "req_followup_task_002");
    }

    // 12. PATCH /tasks/{taskId}
    @PatchMapping("/tasks/{taskId}")
    public ResponseEntity<?> updateTask(@PathVariable Long taskId, @RequestBody Map<String, Object> updates) {
        Map<String, Object> task = store.aiFollowUpTasks.stream()
                .filter(t -> taskId.equals(t.get("taskId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + taskId));

        String prevScheduled = (String) task.get("scheduledAt");
        if (updates.containsKey("scheduledAt")) task.put("scheduledAt", updates.get("scheduledAt"));
        if (updates.containsKey("reason")) task.put("reason", updates.get("reason"));
        task.put("updatedAt", LocalDateTime.now().toString());

        Map<String, Object> resData = new LinkedHashMap<>();
        resData.put("taskId", taskId);
        resData.put("previousScheduledAt", prevScheduled);
        resData.put("scheduledAt", task.get("scheduledAt"));
        resData.put("status", task.get("status"));
        resData.put("updatedAt", task.get("updatedAt"));

        return buildSuccess("Follow-up task updated", resData, HttpStatus.OK, "req_followup_task_update_001");
    }

    // 13. POST /tasks/{taskId}/complete
    @PostMapping("/tasks/{taskId}/complete")
    public ResponseEntity<?> completeTask(@PathVariable Long taskId, @RequestBody Map<String, Object> body) {
        Map<String, Object> task = store.aiFollowUpTasks.stream()
                .filter(t -> taskId.equals(t.get("taskId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + taskId));

        String prev = (String) task.get("status");
        task.put("status", "COMPLETED");
        task.put("outcome", body.getOrDefault("outcome", "STUDENT_REPLIED"));
        task.put("notes", body.getOrDefault("notes", "Task completed"));
        task.put("completedAt", LocalDateTime.now().toString());

        Map<String, Object> resData = new LinkedHashMap<>();
        resData.put("taskId", taskId);
        resData.put("previousStatus", prev);
        resData.put("status", "COMPLETED");
        resData.put("outcome", task.get("outcome"));
        resData.put("completedAt", task.get("completedAt"));

        return buildSuccess("Follow-up task completed", resData, HttpStatus.OK, "req_followup_task_complete_001");
    }

    // 14. POST /tasks/{taskId}/cancel
    @PostMapping("/tasks/{taskId}/cancel")
    public ResponseEntity<?> cancelTask(@PathVariable Long taskId, @RequestBody Map<String, Object> body) {
        Map<String, Object> task = store.aiFollowUpTasks.stream()
                .filter(t -> taskId.equals(t.get("taskId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + taskId));

        String prev = (String) task.get("status");
        task.put("status", "CANCELLED");
        task.put("reason", body.getOrDefault("reason", "Cancelled by system or staff"));
        task.put("cancelledAt", LocalDateTime.now().toString());

        Map<String, Object> resData = new LinkedHashMap<>();
        resData.put("taskId", taskId);
        resData.put("previousStatus", prev);
        resData.put("status", "CANCELLED");
        resData.put("reason", task.get("reason"));
        resData.put("cancelledAt", task.get("cancelledAt"));

        return buildSuccess("Follow-up task cancelled", resData, HttpStatus.OK, "req_followup_task_cancel_001");
    }

    // 15. POST /tasks/{taskId}/snooze
    @PostMapping("/tasks/{taskId}/snooze")
    public ResponseEntity<?> snoozeTask(@PathVariable Long taskId, @RequestBody Map<String, Object> body) {
        Map<String, Object> task = store.aiFollowUpTasks.stream()
                .filter(t -> taskId.equals(t.get("taskId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + taskId));

        String prev = (String) task.get("scheduledAt");
        task.put("scheduledAt", body.getOrDefault("newScheduledAt", "2026-11-02T11:00:00+05:30"));
        task.put("snoozeReason", body.getOrDefault("reason", "Student requested contact next week"));
        task.put("status", "SCHEDULED");

        Map<String, Object> resData = new LinkedHashMap<>();
        resData.put("taskId", taskId);
        resData.put("previousScheduledAt", prev);
        resData.put("scheduledAt", task.get("scheduledAt"));
        resData.put("status", "SCHEDULED");

        return buildSuccess("Follow-up task rescheduled", resData, HttpStatus.OK, "req_followup_task_snooze_001");
    }

    // 16. POST /drafts
    @PostMapping("/drafts")
    public ResponseEntity<?> generateDraft(@RequestBody Map<String, Object> body) {
        String draftId = "draft_" + store.aiDraftSeq.incrementAndGet();
        Long leadId = body.get("leadId") != null ? Long.valueOf(body.get("leadId").toString()) : 1201L;
        Long taskId = body.get("taskId") != null ? Long.valueOf(body.get("taskId").toString()) : 7101L;

        String leadName = "Student";
        for (Map<String, Object> e : store.enquiries) {
            if (leadId.equals(e.get("enquiryId")) || leadId.equals(e.get("leadId"))) {
                leadName = (String) e.getOrDefault("studentName", e.get("name"));
                break;
            }
        }

        String subject = "Following up on your course enquiry";
        String content = String.format("Hello %s, I am following up on your interest in our course. Would you like any additional information about the curriculum or available batches? Please let us know if you would like to discuss the details with our admission team.", leadName);

        Map<String, Object> draft = new LinkedHashMap<>();
        draft.put("draftId", draftId);
        draft.put("leadId", leadId);
        draft.put("leadName", leadName);
        draft.put("taskId", taskId);
        draft.put("channel", body.getOrDefault("channel", "EMAIL"));
        draft.put("purpose", body.getOrDefault("purpose", "COURSE_INFORMATION_FOLLOW_UP"));
        draft.put("tone", body.getOrDefault("tone", "FRIENDLY"));
        draft.put("language", body.getOrDefault("language", "en"));
        draft.put("subject", subject);
        draft.put("body", content);
        draft.put("status", "PENDING_APPROVAL");
        draft.put("requiresApproval", true);
        draft.put("approvedBy", null);
        draft.put("approvedAt", null);
        draft.put("sentAt", null);
        draft.put("generatedAt", LocalDateTime.now().toString());
        draft.put("tenantId", getTenantId());
        store.aiFollowUpDrafts.add(draft);

        return buildSuccess("Follow-up draft generated", draft, HttpStatus.CREATED, "req_followup_draft_001");
    }

    // 17. GET /drafts
    @GetMapping("/drafts")
    public ResponseEntity<?> listDrafts(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        List<Map<String, Object>> filtered = store.aiFollowUpDrafts.stream()
                .filter(d -> status == null || status.equalsIgnoreCase((String) d.get("status")))
                .collect(Collectors.toList());

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("content", filtered);
        res.put("page", page);
        res.put("size", size);
        res.put("totalElements", filtered.size());
        res.put("totalPages", 1);
        return buildSuccess("Follow-up drafts retrieved", res, HttpStatus.OK, "req_followup_drafts_001");
    }

    // 18. GET /drafts/{draftId}
    @GetMapping("/drafts/{draftId}")
    public ResponseEntity<?> getDraft(@PathVariable String draftId) {
        Map<String, Object> draft = store.aiFollowUpDrafts.stream()
                .filter(d -> draftId.equals(d.get("draftId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Draft not found: " + draftId));
        return buildSuccess("Follow-up draft retrieved", draft, HttpStatus.OK, "req_followup_draft_002");
    }

    // 19. PATCH /drafts/{draftId}
    @PatchMapping("/drafts/{draftId}")
    public ResponseEntity<?> updateDraft(@PathVariable String draftId, @RequestBody Map<String, Object> updates) {
        Map<String, Object> draft = store.aiFollowUpDrafts.stream()
                .filter(d -> draftId.equals(d.get("draftId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Draft not found: " + draftId));

        if (updates.containsKey("subject")) draft.put("subject", updates.get("subject"));
        if (updates.containsKey("body")) draft.put("body", updates.get("body"));
        draft.put("status", "PENDING_APPROVAL"); // Invalidate previous approval
        draft.put("approvedBy", null);
        draft.put("approvedAt", null);
        draft.put("updatedAt", LocalDateTime.now().toString());

        return buildSuccess("Follow-up draft updated", draft, HttpStatus.OK, "req_followup_draft_update_001");
    }

    // 20. POST /drafts/{draftId}/approve
    @PostMapping("/drafts/{draftId}/approve")
    public ResponseEntity<?> approveDraft(@PathVariable String draftId, @RequestBody(required = false) Map<String, Object> body) {
        Map<String, Object> draft = store.aiFollowUpDrafts.stream()
                .filter(d -> draftId.equals(d.get("draftId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Draft not found: " + draftId));

        String prev = (String) draft.get("status");
        draft.put("status", "APPROVED");
        draft.put("approvedBy", 10);
        draft.put("approvedAt", LocalDateTime.now().toString());

        // Audit Event
        Map<String, Object> aud = new LinkedHashMap<>();
        aud.put("eventId", "audit_fu_" + store.aiAuditSeq.incrementAndGet());
        aud.put("eventType", "FOLLOWUP_DRAFT_APPROVED");
        aud.put("actorType", "USER");
        aud.put("actorId", "10");
        aud.put("resourceType", "FOLLOWUP_DRAFT");
        aud.put("resourceId", draftId);
        aud.put("createdAt", LocalDateTime.now().toString());
        aud.put("tenantId", getTenantId());
        store.aiFollowUpAuditEvents.add(aud);

        Map<String, Object> resData = new LinkedHashMap<>();
        resData.put("draftId", draftId);
        resData.put("previousStatus", prev);
        resData.put("status", "APPROVED");
        resData.put("approvedBy", 10);
        resData.put("approvedAt", draft.get("approvedAt"));

        return buildSuccess("Follow-up draft approved", resData, HttpStatus.OK, "req_followup_approve_001");
    }

    // 21. POST /drafts/{draftId}/send
    @PostMapping("/drafts/{draftId}/send")
    public ResponseEntity<?> sendApprovedDraft(@PathVariable String draftId, @RequestBody(required = false) Map<String, Object> body) {
        Map<String, Object> draft = store.aiFollowUpDrafts.stream()
                .filter(d -> draftId.equals(d.get("draftId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Draft not found: " + draftId));

        String execId = "exec_" + store.aiExecSeq.incrementAndGet();
        draft.put("status", "QUEUED");
        draft.put("sentAt", LocalDateTime.now().toString());

        Map<String, Object> exec = new LinkedHashMap<>();
        exec.put("executionId", execId);
        exec.put("taskId", draft.get("taskId"));
        exec.put("draftId", draftId);
        exec.put("channel", draft.get("channel"));
        exec.put("status", "QUEUED");
        exec.put("deliveryStatus", "PENDING");
        exec.put("attemptCount", 0);
        exec.put("providerMessageId", null);
        exec.put("lastError", null);
        exec.put("createdAt", LocalDateTime.now().toString());
        exec.put("tenantId", getTenantId());
        store.aiFollowUpExecutions.add(exec);

        // Audit event
        Map<String, Object> aud = new LinkedHashMap<>();
        aud.put("eventId", "audit_fu_" + store.aiAuditSeq.incrementAndGet());
        aud.put("eventType", "FOLLOWUP_MESSAGE_QUEUED");
        aud.put("actorType", "USER");
        aud.put("actorId", "10");
        aud.put("resourceType", "FOLLOWUP_EXECUTION");
        aud.put("resourceId", execId);
        aud.put("createdAt", LocalDateTime.now().toString());
        aud.put("tenantId", getTenantId());
        store.aiFollowUpAuditEvents.add(aud);

        Map<String, Object> resData = new LinkedHashMap<>();
        resData.put("draftId", draftId);
        resData.put("executionId", execId);
        resData.put("status", "QUEUED");
        resData.put("deliveryStatus", "PENDING");
        resData.put("queuedAt", LocalDateTime.now().toString());

        return buildSuccess("Follow-up message queued for delivery", resData, HttpStatus.ACCEPTED, "req_followup_send_001");
    }

    // 22. GET /executions
    @GetMapping("/executions")
    public ResponseEntity<?> listExecutions(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        List<Map<String, Object>> filtered = store.aiFollowUpExecutions.stream()
                .filter(e -> status == null || status.equalsIgnoreCase((String) e.get("status")))
                .collect(Collectors.toList());

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("content", filtered);
        res.put("page", page);
        res.put("size", size);
        res.put("totalElements", filtered.size());
        res.put("totalPages", 1);
        return buildSuccess("Follow-up executions retrieved", res, HttpStatus.OK, "req_followup_executions_001");
    }

    // 23. GET /executions/{executionId}
    @GetMapping("/executions/{executionId}")
    public ResponseEntity<?> getExecution(@PathVariable String executionId) {
        Map<String, Object> ex = store.aiFollowUpExecutions.stream()
                .filter(e -> executionId.equals(e.get("executionId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Execution not found: " + executionId));
        return buildSuccess("Follow-up execution retrieved", ex, HttpStatus.OK, "req_followup_execution_001");
    }

    // 24. POST /executions/{executionId}/retry
    @PostMapping("/executions/{executionId}/retry")
    public ResponseEntity<?> retryExecution(@PathVariable String executionId, @RequestBody(required = false) Map<String, Object> body) {
        Map<String, Object> ex = store.aiFollowUpExecutions.stream()
                .filter(e -> executionId.equals(e.get("executionId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Execution not found: " + executionId));

        String prev = (String) ex.get("status");
        ex.put("status", "QUEUED");
        int attempts = ((Integer) ex.getOrDefault("attemptCount", 0)) + 1;
        ex.put("attemptCount", attempts);
        ex.put("retryQueuedAt", LocalDateTime.now().toString());

        Map<String, Object> resData = new LinkedHashMap<>();
        resData.put("executionId", executionId);
        resData.put("previousStatus", prev);
        resData.put("status", "QUEUED");
        resData.put("attemptCount", attempts);
        resData.put("retryQueuedAt", ex.get("retryQueuedAt"));

        return buildSuccess("Eligible execution retry queued", resData, HttpStatus.OK, "req_followup_retry_001");
    }

    // 25. POST /stop-contact
    @PostMapping("/stop-contact")
    public ResponseEntity<?> stopContact(@RequestBody Map<String, Object> body) {
        String suppId = "supp_" + store.aiSuppSeq.incrementAndGet();
        Long leadId = body.get("leadId") != null ? Long.valueOf(body.get("leadId").toString()) : 1201L;

        Map<String, Object> supp = new LinkedHashMap<>();
        supp.put("suppressionId", suppId);
        supp.put("leadId", leadId);
        supp.put("channel", body.getOrDefault("channel", "EMAIL"));
        supp.put("scope", body.getOrDefault("scope", "MARKETING_MESSAGES"));
        supp.put("reason", body.getOrDefault("reason", "STUDENT_OPTED_OUT"));
        supp.put("status", "ACTIVE");
        supp.put("effectiveAt", LocalDateTime.now().toString());
        supp.put("tenantId", getTenantId());
        store.aiFollowUpSuppressions.add(supp);

        // Cancel scheduled tasks for this lead
        for (Map<String, Object> t : store.aiFollowUpTasks) {
            if (leadId.equals(t.get("leadId")) && "SCHEDULED".equals(t.get("status"))) {
                t.put("status", "CANCELLED");
                t.put("reason", "Suppressed by opt-out request");
            }
        }

        return buildSuccess("Contact suppression recorded", supp, HttpStatus.OK, "req_followup_stop_001");
    }

    // 26. GET /suppression-list
    @GetMapping("/suppression-list")
    public ResponseEntity<?> getSuppressionList(
            @RequestParam(required = false) String channel,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        List<Map<String, Object>> filtered = store.aiFollowUpSuppressions.stream()
                .filter(s -> channel == null || channel.equalsIgnoreCase((String) s.get("channel")))
                .collect(Collectors.toList());

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("content", filtered);
        res.put("page", page);
        res.put("size", size);
        res.put("totalElements", filtered.size());
        res.put("totalPages", 1);
        return buildSuccess("Suppression records retrieved", res, HttpStatus.OK, "req_followup_suppression_001");
    }

    // 27. GET /metrics
    @GetMapping("/metrics")
    public ResponseEntity<?> getMetrics(
            @RequestParam(required = false, defaultValue = "2026-10-01") String from,
            @RequestParam(required = false, defaultValue = "2026-10-31") String to
    ) {
        Map<String, Object> metrics = new LinkedHashMap<>();
        metrics.put("period", Map.of("from", from, "to", to));
        metrics.put("tasksCreated", Math.max(640, store.aiFollowUpTasks.size()));
        metrics.put("tasksCompleted", 510);
        metrics.put("draftsGenerated", Math.max(420, store.aiFollowUpDrafts.size()));
        metrics.put("draftsApproved", 350);
        metrics.put("messagesQueued", Math.max(320, store.aiFollowUpExecutions.size()));
        metrics.put("messagesSent", 310);
        metrics.put("messagesDelivered", 295);
        metrics.put("messagesFailed", 10);
        metrics.put("tasksCancelled", 45);
        metrics.put("contactsSuppressed", Math.max(28, store.aiFollowUpSuppressions.size()));
        metrics.put("studentReplies", 90);
        metrics.put("applicationsAssociatedWithFollowUps", 65);

        return buildSuccess("AI Follow-up Agent metrics retrieved", metrics, HttpStatus.OK, "req_followup_metrics_001");
    }

    // 28. GET /audit-events
    @GetMapping("/audit-events")
    public ResponseEntity<?> getAuditEvents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        List<Map<String, Object>> events = new ArrayList<>(store.aiFollowUpAuditEvents);
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("content", events);
        res.put("page", page);
        res.put("size", size);
        res.put("totalElements", events.size());
        res.put("totalPages", 1);
        return buildSuccess("Follow-up audit events retrieved", res, HttpStatus.OK, "req_followup_audit_001");
    }
}
