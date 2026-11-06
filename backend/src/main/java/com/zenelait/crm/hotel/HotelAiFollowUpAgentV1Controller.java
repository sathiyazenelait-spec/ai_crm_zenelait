package com.zenelait.crm.hotel;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/v1/hotel/ai-follow-up-agent")
@CrossOrigin(origins = "*")
public class HotelAiFollowUpAgentV1Controller {

    @Autowired
    private HotelDataStore store;

    private String getTenantId(String tenantHeader) {
        return (tenantHeader != null && !tenantHeader.isBlank()) ? tenantHeader : "tenant-6";
    }

    private Map<String, Object> standardResponse(boolean success, String message, Object data, String reqId) {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", success);
        resp.put("message", message);
        resp.put("data", data);
        resp.put("timestamp", OffsetDateTime.now().toString());
        resp.put("requestId", reqId != null ? reqId : "req-fup-" + UUID.randomUUID().toString().substring(0, 6));
        return resp;
    }

    // 1. Dashboard & Config
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Follow-up dashboard retrieved",
                store.getAiFollowUpDashboard(tenantId), "req-fup-001"));
    }

    @GetMapping("/config")
    public ResponseEntity<Map<String, Object>> getConfig(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardResponse(true, "AI Follow-up Agent configuration retrieved",
                store.getAiConfig(), "req-fup-cfg"));
    }

    @PatchMapping("/config")
    public ResponseEntity<Map<String, Object>> updateConfig(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        store.getAiConfig().putAll(body);
        return ResponseEntity.ok(standardResponse(true, "AI Follow-up Agent configuration updated",
                store.getAiConfig(), "req-fup-cfg-upd"));
    }

    // 2. Campaigns
    @GetMapping("/campaigns")
    public ResponseEntity<Map<String, Object>> getCampaigns(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Campaigns retrieved",
                store.getCampaigns(tenantId), "req-fup-camps"));
    }

    @PostMapping("/campaigns")
    public ResponseEntity<Map<String, Object>> createCampaign(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> c = store.createCampaign(tenantId, body);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                standardResponse(true, "Campaign created", c, "req-fup-003"));
    }

    @GetMapping("/campaigns/{campaignId}")
    public ResponseEntity<Map<String, Object>> getCampaign(
            @PathVariable String campaignId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> c = store.getCampaign(tenantId, campaignId);
        if (c == null) {
            return ResponseEntity.status(404).body(standardResponse(false, "Campaign not found", null, "req-fup-404"));
        }
        return ResponseEntity.ok(standardResponse(true, "Campaign details retrieved", c, "req-fup-camp-get"));
    }

    @PatchMapping("/campaigns/{campaignId}")
    public ResponseEntity<Map<String, Object>> updateCampaign(
            @PathVariable String campaignId,
            @RequestBody Map<String, Object> updates,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Campaign updated",
                store.updateCampaign(tenantId, campaignId, updates), "req-fup-camp-patch"));
    }

    @PostMapping("/campaigns/{campaignId}/activate")
    public ResponseEntity<Map<String, Object>> activateCampaign(
            @PathVariable String campaignId,
            @RequestBody(required = false) Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Campaign activation accepted",
                store.activateCampaign(tenantId, campaignId, body), "req-fup-004"));
    }

    @PostMapping("/campaigns/{campaignId}/pause")
    public ResponseEntity<Map<String, Object>> pauseCampaign(
            @PathVariable String campaignId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Campaign paused",
                store.pauseCampaign(tenantId, campaignId), "req-fup-camp-pause"));
    }

    @PostMapping("/campaigns/{campaignId}/cancel")
    public ResponseEntity<Map<String, Object>> cancelCampaign(
            @PathVariable String campaignId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Campaign cancelled",
                store.cancelCampaign(tenantId, campaignId), "req-fup-camp-cancel"));
    }

    @GetMapping("/campaigns/{campaignId}/metrics")
    public ResponseEntity<Map<String, Object>> getCampaignMetrics(
            @PathVariable String campaignId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Campaign metrics retrieved",
                store.getCampaignMetrics(tenantId, campaignId), "req-fup-camp-met"));
    }

    // 3. Sequences
    @GetMapping("/sequences")
    public ResponseEntity<Map<String, Object>> getSequences(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Follow-up sequences retrieved",
                store.getSequences(tenantId), "req-fup-seqs"));
    }

    @PostMapping("/sequences")
    public ResponseEntity<Map<String, Object>> createSequence(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> s = store.createSequence(tenantId, body);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                standardResponse(true, "Follow-up sequence created", s, "req-fup-005"));
    }

    @GetMapping("/sequences/{sequenceId}")
    public ResponseEntity<Map<String, Object>> getSequence(
            @PathVariable String sequenceId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> s = store.getSequence(tenantId, sequenceId);
        if (s == null) {
            return ResponseEntity.status(404).body(standardResponse(false, "Sequence not found", null, "req-fup-404"));
        }
        return ResponseEntity.ok(standardResponse(true, "Sequence retrieved", s, "req-fup-seq-get"));
    }

    @PatchMapping("/sequences/{sequenceId}")
    public ResponseEntity<Map<String, Object>> updateSequence(
            @PathVariable String sequenceId,
            @RequestBody Map<String, Object> updates,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Sequence updated",
                store.updateSequence(tenantId, sequenceId, updates), "req-fup-seq-patch"));
    }

    @PostMapping("/sequences/{sequenceId}/activate")
    public ResponseEntity<Map<String, Object>> activateSequence(
            @PathVariable String sequenceId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Sequence activated",
                store.activateSequence(tenantId, sequenceId), "req-fup-seq-act"));
    }

    @PostMapping("/sequences/{sequenceId}/pause")
    public ResponseEntity<Map<String, Object>> pauseSequence(
            @PathVariable String sequenceId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Sequence paused",
                store.pauseSequence(tenantId, sequenceId), "req-fup-seq-pause"));
    }

    // 4. Automation Rules
    @GetMapping("/rules")
    public ResponseEntity<Map<String, Object>> getRules(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> list = new ArrayList<>(store.getAutomationRules().values());
        return ResponseEntity.ok(standardResponse(true, "Automation rules retrieved", list, "req-fup-rules"));
    }

    @PostMapping("/rules")
    public ResponseEntity<Map<String, Object>> createRule(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> r = store.createAutomationRule(tenantId, body);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                standardResponse(true, "Automation rule created", r, "req-fup-rule-create"));
    }

    @PatchMapping("/rules/{ruleId}")
    public ResponseEntity<Map<String, Object>> updateRule(
            @PathVariable String ruleId,
            @RequestBody Map<String, Object> updates,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Automation rule updated",
                store.updateAutomationRule(tenantId, ruleId, updates), "req-fup-rule-patch"));
    }

    @PostMapping("/rules/{ruleId}/activate")
    public ResponseEntity<Map<String, Object>> activateRule(
            @PathVariable String ruleId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Automation rule activated",
                store.activateAutomationRule(tenantId, ruleId), "req-fup-rule-act"));
    }

    @PostMapping("/rules/{ruleId}/pause")
    public ResponseEntity<Map<String, Object>> pauseRule(
            @PathVariable String ruleId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Automation rule paused",
                store.pauseAutomationRule(tenantId, ruleId), "req-fup-rule-pause"));
    }

    // 5. Follow-Up Tasks
    @GetMapping("/tasks")
    public ResponseEntity<Map<String, Object>> getTasks(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String type,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Follow-up tasks retrieved",
                store.getFollowUpTasks(tenantId, status, type), "req-fup-tasks"));
    }

    @PostMapping("/tasks")
    public ResponseEntity<Map<String, Object>> createTask(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> t = store.createFollowUpTask(tenantId, body);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                standardResponse(true, "Follow-up task created", t, "req-fup-002"));
    }

    @GetMapping("/tasks/{taskId}")
    public ResponseEntity<Map<String, Object>> getTask(
            @PathVariable String taskId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> t = store.getFollowUpTask(tenantId, taskId);
        if (t == null) {
            return ResponseEntity.status(404).body(standardResponse(false, "Task not found", null, "req-fup-404"));
        }
        return ResponseEntity.ok(standardResponse(true, "Task details retrieved", t, "req-fup-task-get"));
    }

    @PatchMapping("/tasks/{taskId}")
    public ResponseEntity<Map<String, Object>> updateTask(
            @PathVariable String taskId,
            @RequestBody Map<String, Object> updates,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Task updated",
                store.updateFollowUpTask(tenantId, taskId, updates), "req-fup-task-patch"));
    }

    @PostMapping("/tasks/{taskId}/assign")
    public ResponseEntity<Map<String, Object>> assignTask(
            @PathVariable String taskId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Follow-up task assigned",
                store.assignFollowUpTask(tenantId, taskId, body), "req-fup-009"));
    }

    @PostMapping("/tasks/{taskId}/complete")
    public ResponseEntity<Map<String, Object>> completeTask(
            @PathVariable String taskId,
            @RequestBody(required = false) Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Follow-up task completed",
                store.completeFollowUpTask(tenantId, taskId, body != null ? body : Collections.emptyMap()), "req-fup-011"));
    }

    @PostMapping("/tasks/{taskId}/snooze")
    public ResponseEntity<Map<String, Object>> snoozeTask(
            @PathVariable String taskId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Follow-up task rescheduled",
                store.snoozeFollowUpTask(tenantId, taskId, body), "req-fup-010"));
    }

    @PostMapping("/tasks/{taskId}/cancel")
    public ResponseEntity<Map<String, Object>> cancelTask(
            @PathVariable String taskId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Follow-up task cancelled",
                store.cancelFollowUpTask(tenantId, taskId), "req-fup-task-cancel"));
    }

    // 6. Eligible Lists & Contact Consent
    @GetMapping("/eligible-leads")
    public ResponseEntity<Map<String, Object>> getEligibleLeads(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Eligible reservation leads retrieved",
                store.getEligibleLeads(tenantId), "req-fup-leads"));
    }

    @GetMapping("/eligible-quotes")
    public ResponseEntity<Map<String, Object>> getEligibleQuotes(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Eligible unconverted quotes retrieved",
                store.getEligibleQuotes(tenantId), "req-fup-quotes"));
    }

    @GetMapping("/eligible-reservations")
    public ResponseEntity<Map<String, Object>> getEligibleReservations(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Eligible reservation-related follow-ups retrieved",
                store.getEligibleReservations(tenantId), "req-fup-resv"));
    }

    @GetMapping("/contacts/{guestId}/consent")
    public ResponseEntity<Map<String, Object>> getConsent(
            @PathVariable String guestId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Authorized consent information retrieved",
                store.getGuestConsent(tenantId, guestId), "req-fup-consent"));
    }

    @PatchMapping("/contacts/{guestId}/preferences")
    public ResponseEntity<Map<String, Object>> updatePreferences(
            @PathVariable String guestId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Communication preferences updated",
                store.updateGuestPreferences(tenantId, guestId, body), "req-fup-012"));
    }

    // 7. Message Drafts & Outbound
    @PostMapping("/messages/drafts")
    public ResponseEntity<Map<String, Object>> createMessageDraft(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Follow-up draft generated",
                store.createMessageDraft(tenantId, body), "req-fup-006"));
    }

    @GetMapping("/messages/drafts/{draftId}")
    public ResponseEntity<Map<String, Object>> getMessageDraft(
            @PathVariable String draftId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> d = store.getMessageDraft(tenantId, draftId);
        if (d == null) {
            return ResponseEntity.status(404).body(standardResponse(false, "Draft not found", null, "req-fup-404"));
        }
        return ResponseEntity.ok(standardResponse(true, "Draft retrieved", d, "req-fup-draft-get"));
    }

    @PostMapping("/messages/drafts/{draftId}/approve")
    public ResponseEntity<Map<String, Object>> approveDraft(
            @PathVariable String draftId,
            @RequestBody(required = false) Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Follow-up draft approved",
                store.approveMessageDraft(tenantId, draftId, body), "req-fup-007"));
    }

    @PostMapping("/messages/drafts/{draftId}/send")
    public ResponseEntity<Map<String, Object>> sendDraft(
            @PathVariable String draftId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Follow-up submitted to messaging provider",
                store.sendMessageDraft(tenantId, draftId, body, idempotencyKey), "req-fup-008"));
    }

    @GetMapping("/messages")
    public ResponseEntity<Map<String, Object>> getMessages(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Follow-up messages retrieved",
                store.getOutboundMessages(tenantId), "req-fup-msgs"));
    }

    @GetMapping("/messages/{messageId}")
    public ResponseEntity<Map<String, Object>> getMessage(
            @PathVariable String messageId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> m = store.getOutboundMessage(tenantId, messageId);
        if (m == null) {
            return ResponseEntity.status(404).body(standardResponse(false, "Message not found", null, "req-fup-404"));
        }
        return ResponseEntity.ok(standardResponse(true, "Message status retrieved", m, "req-fup-msg-get"));
    }

    @PostMapping("/messages/{messageId}/retry")
    public ResponseEntity<Map<String, Object>> retryMessage(
            @PathVariable String messageId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Eligible message requeued for retry",
                store.retryOutboundMessage(tenantId, messageId), "req-fup-msg-retry"));
    }

    // 8. Executions & Webhook
    @GetMapping("/executions")
    public ResponseEntity<Map<String, Object>> getExecutions(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = store.getExecutions(tenantId, status);
        Map<String, Object> paged = new LinkedHashMap<>();
        paged.put("items", list);
        paged.put("page", page);
        paged.put("size", size);
        paged.put("totalElements", list.size());
        return ResponseEntity.ok(standardResponse(true, "Automation executions retrieved", paged, "req-fup-013"));
    }

    @GetMapping("/executions/{executionId}")
    public ResponseEntity<Map<String, Object>> getExecution(
            @PathVariable String executionId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> ex = store.getExecution(tenantId, executionId);
        if (ex == null) {
            return ResponseEntity.status(404).body(standardResponse(false, "Execution not found", null, "req-fup-404"));
        }
        return ResponseEntity.ok(standardResponse(true, "Execution details retrieved", ex, "req-fup-exec-get"));
    }

    @PostMapping("/executions/{executionId}/retry")
    public ResponseEntity<Map<String, Object>> retryExecution(
            @PathVariable String executionId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Failed execution retried",
                store.retryExecution(tenantId, executionId), "req-fup-exec-retry"));
    }

    @PostMapping("/webhooks/messaging-status")
    public ResponseEntity<Map<String, Object>> handleWebhook(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Webhook status processed",
                store.receiveMessagingWebhook(tenantId, body), "req-fup-hook"));
    }

    // 9. Metrics & Logs
    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getMetrics(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Follow-up performance metrics retrieved",
                store.getAiFollowUpMetrics(tenantId), "req-fup-metrics"));
    }

    @GetMapping("/activity-logs")
    public ResponseEntity<Map<String, Object>> getActivityLogs(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Authorized audit records retrieved",
                store.getAuditEvents(tenantId), "req-fup-act"));
    }
}
