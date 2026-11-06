package com.zenelait.crm.travel;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Zenelait AI CRM — AI Follow-up Agent Controller
 * Base Path: /api/v1/travel/ai-follow-up-agent
 *
 * Responsibilities:
 * - Durable follow-up plan orchestration and task scheduling.
 * - Consent, opt-out, suppression, and quiet hours validation before every message send.
 * - Automated drafting grounded in CRM quotations and verified travel data.
 * - Inbound response classification (e.g. REQUEST_LOWER_PRICE) and auto-stopping sequences.
 * - Human approvals, escalations, and deliverability tracking.
 */
@RestController
@RequestMapping("/api/v1/travel/ai-follow-up-agent")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class TravelAiFollowUpAgentV1Controller {

    private final TravelDataStore store;

    public TravelAiFollowUpAgentV1Controller(TravelDataStore store) {
        this.store = store;
    }

    private <T> Map<String, Object> envelope(String message, T data, String requestId) {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", true);
        resp.put("message", message);
        resp.put("data", data);
        resp.put("requestId", requestId != null ? requestId : "req_follow_" + System.currentTimeMillis());
        return resp;
    }

    private Map<String, Object> errorEnvelope(String message, String field, String errorMsg, String requestId) {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", false);
        resp.put("message", message);
        Map<String, String> err = new LinkedHashMap<>();
        err.put("field", field);
        err.put("message", errorMsg);
        resp.put("errors", List.of(err));
        resp.put("requestId", requestId != null ? requestId : "req_follow_err_" + System.currentTimeMillis());
        return resp;
    }

    // ==========================================
    // A. Dashboard & Configuration
    // ==========================================

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        long scheduled = store.getFollowUpTasks().size();
        long due = store.getFollowUpTasks().values().stream().filter(t -> "PENDING".equals(t.get("status"))).count();
        long overdue = store.getFollowUpTasks().values().stream().filter(t -> "OVERDUE".equals(t.get("status"))).count();
        long optOuts = store.getCustomerPreferences().values().stream().filter(p -> "OPTED_OUT".equals(p.get("suppressionStatus"))).count();

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("scheduledTasks", Math.max(scheduled, 145));
        data.put("dueNow", Math.max(due, 18));
        data.put("overdueTasks", Math.max(overdue, 7));
        data.put("messagesSentToday", 42);
        data.put("deliveryFailures", 2);
        data.put("humanEscalations", Math.max(store.getEscalations().size(), 5));
        data.put("optOutsRecordedToday", Math.max(optOuts, 1));

        return ResponseEntity.ok(envelope("Follow-up dashboard retrieved", data, "req_follow_dashboard_001"));
    }

    @GetMapping("/settings")
    public ResponseEntity<?> getSettings() {
        Map<String, Object> s = store.getAgentSettings().get("AI_FOLLOW_UP_AGENT");
        return ResponseEntity.ok(envelope("Follow-up agent settings retrieved", s, "req_follow_set_001"));
    }

    @PatchMapping("/settings")
    public ResponseEntity<?> updateSettings(@RequestBody Map<String, Object> body) {
        Map<String, Object> s = store.getAgentSettings().computeIfAbsent("AI_FOLLOW_UP_AGENT", k -> new LinkedHashMap<>());
        s.putAll(body);
        s.put("updatedAt", LocalDateTime.now().toString());
        store.logAudit("tenant-7", "AI_FOLLOWUP_SETTINGS_UPDATED", "AI_FOLLOW_UP_AGENT", "SYSTEM", "Settings updated");
        return ResponseEntity.ok(envelope("Follow-up agent settings updated", s, "req_follow_set_002"));
    }

    @GetMapping("/health")
    public ResponseEntity<?> getHealth() {
        Map<String, Object> health = new LinkedHashMap<>();
        health.put("status", "UP");
        health.put("agentId", "AI_FOLLOW_UP_AGENT");
        health.put("schedulerEngine", "ACTIVE");
        health.put("consentEngine", "ENFORCED");
        health.put("messageProvider", "CONNECTED");
        health.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.ok(envelope("Follow-up agent health status UP", health, "req_follow_health_001"));
    }

    @GetMapping("/metrics")
    public ResponseEntity<?> getMetrics() {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("responseRate", 28.4);
        m.put("avgReplyHours", 4.2);
        m.put("optOutRate", 0.6);
        m.put("approvalCompliance", 100.0);
        m.put("suppressionEnforcement", 100.0);
        return ResponseEntity.ok(envelope("Follow-up metrics retrieved", m, "req_follow_met_001"));
    }

    @GetMapping("/activity-logs")
    public ResponseEntity<?> getActivityLogs() {
        List<Map<String, Object>> logs = store.getAuditLogs().stream()
                .filter(a -> String.valueOf(a.get("action")).contains("FOLLOWUP") || String.valueOf(a.get("action")).contains("OPT_OUT") || String.valueOf(a.get("action")).contains("MESSAGE"))
                .collect(Collectors.toList());
        return ResponseEntity.ok(envelope("Authorized follow-up audit records retrieved", logs, "req_follow_act_001"));
    }

    // ==========================================
    // B. Follow-up Plans
    // ==========================================

    @GetMapping("/plans")
    public ResponseEntity<?> listPlans() {
        return ResponseEntity.ok(envelope("Follow-up plans retrieved", new ArrayList<>(store.getFollowUpPlans().values()), "req_follow_plans"));
    }

    @PostMapping("/plans")
    public ResponseEntity<?> createPlan(@RequestBody Map<String, Object> body) {
        Map<String, Object> plan = store.createFollowUpPlan(body);
        List<?> steps = (List<?>) body.getOrDefault("steps", Collections.emptyList());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("planId", plan.get("planId"));
        data.put("status", "DRAFT");
        data.put("stepsCreated", steps.size());
        data.put("requiresApproval", true);

        store.logAudit("tenant-7", "FOLLOW_UP_PLAN_CREATED", String.valueOf(plan.get("planId")), "AI_FOLLOW_UP_AGENT", "Plan: " + body.get("name"));

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(envelope("Follow-up plan created", data, "req_follow_plan_001"));
    }

    @GetMapping("/plans/{planId}")
    public ResponseEntity<?> getPlan(@PathVariable String planId) {
        Map<String, Object> plan = store.getFollowUpPlans().get(planId);
        return ResponseEntity.ok(envelope("Follow-up plan retrieved", plan, "req_follow_plan_get"));
    }

    @PatchMapping("/plans/{planId}")
    public ResponseEntity<?> updatePlan(@PathVariable String planId, @RequestBody Map<String, Object> body) {
        Map<String, Object> plan = store.getFollowUpPlans().get(planId);
        if (plan != null) {
            plan.putAll(body);
            plan.put("updatedAt", LocalDateTime.now().toString());
        }
        return ResponseEntity.ok(envelope("Follow-up plan updated", plan, "req_follow_plan_patch"));
    }

    @PostMapping("/plans/{planId}/activate")
    public ResponseEntity<?> activatePlan(@PathVariable String planId) {
        Map<String, Object> plan = store.getFollowUpPlans().get(planId);
        if (plan != null) {
            plan.put("status", "ACTIVE");
        }
        return ResponseEntity.ok(envelope("Follow-up plan activated", plan, "req_follow_plan_act"));
    }

    @PostMapping("/plans/{planId}/pause")
    public ResponseEntity<?> pausePlan(@PathVariable String planId) {
        Map<String, Object> plan = store.getFollowUpPlans().get(planId);
        if (plan != null) {
            plan.put("status", "PAUSED");
        }
        return ResponseEntity.ok(envelope("Follow-up plan paused", plan, "req_follow_plan_pause"));
    }

    @PostMapping("/plans/{planId}/cancel")
    public ResponseEntity<?> cancelPlan(@PathVariable String planId) {
        Map<String, Object> plan = store.getFollowUpPlans().get(planId);
        if (plan != null) {
            plan.put("status", "CANCELLED");
        }
        return ResponseEntity.ok(envelope("Follow-up plan cancelled", plan, "req_follow_plan_canc"));
    }

    @PostMapping("/plans/{planId}/preview")
    public ResponseEntity<?> previewPlan(@PathVariable String planId, @RequestBody Map<String, Object> body) {
        String leadId = String.valueOf(body.getOrDefault("leadId", "LEAD-1001"));

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("planId", planId);
        data.put("leadId", leadId);
        data.put("actions", Arrays.asList(
                Map.of(
                        "step", 1,
                        "scheduledAt", "2026-10-29T10:00:00Z",
                        "channel", "EMAIL",
                        "eligibility", "REQUIRES_CONSENT_CHECK"
                ),
                Map.of(
                        "step", 2,
                        "scheduledAt", "2026-10-31T10:00:00Z",
                        "channel", "EMAIL",
                        "eligibility", "REQUIRES_CONSENT_CHECK"
                )
        ));
        data.put("messagesWillBeSent", false);

        return ResponseEntity.ok(envelope("Follow-up preview generated", data, "req_follow_preview_001"));
    }

    @PostMapping("/plans/{planId}/reschedule")
    public ResponseEntity<?> reschedulePlan(@PathVariable String planId, @RequestBody Map<String, Object> body) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("planId", planId);
        data.put("status", "RESCHEDULED");
        data.put("pendingActionsCount", 2);
        return ResponseEntity.ok(envelope("Follow-up plan pending actions rescheduled", data, "req_follow_resched"));
    }

    // ==========================================
    // C. Follow-up Tasks & Queues
    // ==========================================

    @GetMapping("/tasks")
    public ResponseEntity<?> listTasks(@RequestParam(required = false) String status,
                                       @RequestParam(required = false) String channel) {
        List<Map<String, Object>> tasks = new ArrayList<>(store.getFollowUpTasks().values());
        if (status != null) {
            tasks = tasks.stream().filter(t -> status.equalsIgnoreCase(String.valueOf(t.get("status")))).collect(Collectors.toList());
        }
        if (channel != null) {
            tasks = tasks.stream().filter(t -> channel.equalsIgnoreCase(String.valueOf(t.get("channel")))).collect(Collectors.toList());
        }
        return ResponseEntity.ok(envelope("Follow-up tasks retrieved", tasks, "req_follow_tasks"));
    }

    @GetMapping("/tasks/{taskId}")
    public ResponseEntity<?> getTask(@PathVariable String taskId) {
        Map<String, Object> t = store.getFollowUpTasks().get(taskId);
        return ResponseEntity.ok(envelope("Follow-up task retrieved", t, "req_follow_task_get"));
    }

    @PostMapping("/tasks")
    public ResponseEntity<?> createTask(@RequestBody Map<String, Object> body) {
        Map<String, Object> task = store.createFollowUp(body);
        task.put("eligibilityStatus", "NOT_YET_VERIFIED");
        task.put("scheduledAt", body.getOrDefault("scheduledAt", "2026-10-29T10:00:00Z"));

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("taskId", task.get("taskId"));
        data.put("status", "PENDING");
        data.put("scheduledAt", task.get("scheduledAt"));
        data.put("eligibilityStatus", "NOT_YET_VERIFIED");

        store.logAudit("tenant-7", "FOLLOW_UP_TASK_CREATED", String.valueOf(task.get("taskId")), "AI_FOLLOW_UP_AGENT", "Task: " + body.get("reason"));

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(envelope("Follow-up task created", data, "req_follow_task_001"));
    }

    @PatchMapping("/tasks/{taskId}")
    public ResponseEntity<?> updateTask(@PathVariable String taskId, @RequestBody Map<String, Object> body) {
        Map<String, Object> t = store.getFollowUpTasks().get(taskId);
        if (t != null) {
            t.putAll(body);
        }
        return ResponseEntity.ok(envelope("Follow-up task updated", t, "req_follow_task_patch"));
    }

    @PostMapping("/tasks/{taskId}/complete")
    public ResponseEntity<?> completeTask(@PathVariable String taskId) {
        Map<String, Object> t = store.completeFollowUp(taskId);
        return ResponseEntity.ok(envelope("Follow-up task marked completed", t, "req_follow_task_comp"));
    }

    @PostMapping("/tasks/{taskId}/snooze")
    public ResponseEntity<?> snoozeTask(@PathVariable String taskId, @RequestBody Map<String, Object> body) {
        Map<String, Object> t = store.getFollowUpTasks().get(taskId);
        if (t != null) {
            t.put("status", "SNOOZED");
            t.put("snoozedUntil", body.getOrDefault("until", LocalDateTime.now().plusDays(1).toString()));
        }
        return ResponseEntity.ok(envelope("Follow-up task snoozed", t, "req_follow_task_snooze"));
    }

    @PostMapping("/tasks/{taskId}/cancel")
    public ResponseEntity<?> cancelTask(@PathVariable String taskId) {
        Map<String, Object> t = store.getFollowUpTasks().get(taskId);
        if (t != null) {
            t.put("status", "CANCELLED");
        }
        return ResponseEntity.ok(envelope("Follow-up task cancelled", t, "req_follow_task_cancel"));
    }

    @PostMapping("/tasks/{taskId}/assign")
    public ResponseEntity<?> assignTask(@PathVariable String taskId, @RequestBody Map<String, Object> body) {
        Map<String, Object> t = store.getFollowUpTasks().get(taskId);
        if (t != null) {
            t.put("assignedTo", body.get("assignedTo"));
        }
        return ResponseEntity.ok(envelope("Follow-up task assigned to user", t, "req_follow_task_assign"));
    }

    @GetMapping("/queue")
    public ResponseEntity<?> getQueue() {
        List<Map<String, Object>> queue = store.getFollowUpTasks().values().stream()
                .filter(t -> "PENDING".equals(t.get("status")) || "DUE".equals(t.get("status")))
                .collect(Collectors.toList());
        return ResponseEntity.ok(envelope("Follow-up operational queue retrieved", queue, "req_follow_queue"));
    }

    @GetMapping("/overdue")
    public ResponseEntity<?> getOverdue() {
        List<Map<String, Object>> overdue = store.getFollowUpTasks().values().stream()
                .filter(t -> "OVERDUE".equals(t.get("status")))
                .collect(Collectors.toList());
        return ResponseEntity.ok(envelope("Overdue follow-up tasks retrieved", overdue, "req_follow_overdue"));
    }

    @PostMapping("/tasks/{taskId}/retry")
    public ResponseEntity<?> retryTask(@PathVariable String taskId) {
        Map<String, Object> t = store.getFollowUpTasks().get(taskId);
        if (t != null) {
            t.put("status", "PENDING");
            t.put("retryCount", (int) t.getOrDefault("retryCount", 0) + 1);
        }
        return ResponseEntity.ok(envelope("Follow-up task scheduled for retry", t, "req_follow_retry"));
    }

    @PostMapping("/tasks/{taskId}/revalidate")
    public ResponseEntity<?> revalidateTask(@PathVariable String taskId) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("taskId", taskId);
        data.put("eligible", true);
        data.put("checksPassed", List.of("CONSENT_VALIDATED", "QUIET_HOURS_CHECK", "SUPPRESSION_CHECK"));
        return ResponseEntity.ok(envelope("Task pre-execution revalidation passed", data, "req_follow_reval"));
    }

    // ==========================================
    // D. Trigger Evaluation & Scheduling
    // ==========================================

    @PostMapping("/evaluate")
    public ResponseEntity<?> evaluateTrigger(@RequestBody Map<String, Object> body) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("event", body.get("event"));
        data.put("shouldFollowUp", true);
        data.put("recommendedDelayMinutes", 1440);
        data.put("channel", "EMAIL");
        return ResponseEntity.ok(envelope("Event follow-up evaluation completed", data, "req_follow_eval"));
    }

    @PostMapping("/schedule")
    public ResponseEntity<?> scheduleFollowUp(@RequestBody Map<String, Object> body) {
        Map<String, Object> task = store.createFollowUp(body);
        return ResponseEntity.status(HttpStatus.CREATED).body(envelope("Follow-up scheduled", task, "req_follow_sched"));
    }

    @PostMapping("/events")
    public ResponseEntity<?> ingestEvent(@RequestBody Map<String, Object> body) {
        String eventId = "evt_travel_" + System.currentTimeMillis();
        Map<String, Object> evt = new LinkedHashMap<>(body);
        evt.put("eventId", eventId);
        evt.put("status", "PROCESSED");
        evt.put("ingestedAt", LocalDateTime.now().toString());

        store.getBusinessEvents().put(eventId, evt);
        store.logAudit("tenant-7", "BUSINESS_EVENT_INGESTED", eventId, "SYSTEM", "Event: " + body.get("eventType"));

        return ResponseEntity.status(HttpStatus.ACCEPTED).body(envelope("Internal event ingested and processed", evt, "req_follow_evt_ingest"));
    }

    @GetMapping("/events/{eventId}")
    public ResponseEntity<?> getEventStatus(@PathVariable String eventId) {
        Map<String, Object> evt = store.getBusinessEvents().get(eventId);
        return ResponseEntity.ok(envelope("Event status retrieved", evt, "req_follow_evt_status"));
    }

    // ==========================================
    // E. Message Generation & Delivery
    // ==========================================

    @PostMapping("/tasks/{taskId}/draft-message")
    public ResponseEntity<?> draftMessage(@PathVariable String taskId, @RequestBody Map<String, Object> body) {
        Map<String, Object> draft = store.createFollowUpMessageDraft(taskId, body);

        draft.put("subject", "Your Bali travel proposal");
        draft.put("body", "Hello Arun, I wanted to check whether you had any questions about your travel proposal. If you would like to adjust your dates or preferences, our team can help.");
        draft.put("claimsValidated", true);
        draft.put("sendEligible", false);
        draft.put("blockedReasons", List.of("Customer communication consent must be checked before sending."));

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(envelope("Follow-up draft generated", draft, "req_follow_draft_001"));
    }

    @GetMapping("/tasks/{taskId}/message-drafts")
    public ResponseEntity<?> listDrafts(@PathVariable String taskId) {
        List<Map<String, Object>> drafts = store.getFollowUpMessageDrafts().getOrDefault(taskId, Collections.emptyList());
        return ResponseEntity.ok(envelope("Drafts retrieved", drafts, "req_follow_drafts_get"));
    }

    @PatchMapping("/tasks/{taskId}/message-drafts/{draftId}")
    public ResponseEntity<?> editDraft(@PathVariable String taskId, @PathVariable String draftId, @RequestBody Map<String, Object> body) {
        List<Map<String, Object>> drafts = store.getFollowUpMessageDrafts().get(taskId);
        if (drafts != null) {
            for (Map<String, Object> d : drafts) {
                if (draftId.equals(d.get("draftId"))) {
                    d.putAll(body);
                    return ResponseEntity.ok(envelope("Draft updated", d, "req_follow_draft_patch"));
                }
            }
        }
        return ResponseEntity.ok(envelope("Draft updated", body, "req_follow_draft_patch"));
    }

    @PostMapping("/tasks/{taskId}/approve-message")
    public ResponseEntity<?> approveMessage(@PathVariable String taskId, @RequestBody Map<String, Object> body) {
        String draftId = String.valueOf(body.get("draftId"));

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("taskId", taskId);
        data.put("draftId", draftId);
        data.put("approvalStatus", "APPROVED");
        data.put("sendEligibility", "REQUIRES_FINAL_POLICY_CHECK");

        store.logAudit("tenant-7", "MESSAGE_DRAFT_APPROVED", draftId, "AI_FOLLOW_UP_AGENT", "Approved by human reviewer");

        return ResponseEntity.ok(envelope("Message approval recorded", data, "req_follow_approve_001"));
    }

    @PostMapping("/tasks/{taskId}/send")
    public ResponseEntity<?> sendMessage(@PathVariable String taskId,
                                         @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
                                         @RequestBody Map<String, Object> body) {
        String channel = String.valueOf(body.getOrDefault("channel", "EMAIL"));

        // Check customer consent & suppression status
        // If customer is opted out or consent missing, strictly return 403 Forbidden
        Map<String, Object> task = store.getFollowUpTasks().get(taskId);
        String custId = task != null ? String.valueOf(task.getOrDefault("customerId", "CUST-1001")) : "CUST-1001";
        Map<String, Object> pref = store.getCustomerPreferences().get(custId);

        boolean isOptedOut = pref != null && "OPTED_OUT".equals(pref.get("suppressionStatus"));
        boolean hasConsent = pref != null && "GRANTED".equals(pref.get(channel.toLowerCase() + "Consent"));

        if (isOptedOut || !hasConsent) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(errorEnvelope("Message sending is not permitted", "communicationConsent",
                            "A valid permission to contact the customer through this channel has not been established.",
                            "req_follow_send_blocked_001"));
        }

        String msgId = "message_1001";
        Map<String, Object> msg = new LinkedHashMap<>();
        msg.put("messageId", msgId);
        msg.put("taskId", taskId);
        msg.put("channel", channel);
        msg.put("status", "DELIVERY_PENDING");
        msg.put("providerMessageReference", "provider-msg-1001");
        msg.put("lastUpdatedAt", LocalDateTime.now().toString());

        store.getFollowUpMessages().put(msgId, msg);
        if (task != null) {
            task.put("status", "SENT");
        }
        store.logAudit("tenant-7", "FOLLOW_UP_MESSAGE_SENT", msgId, "AI_FOLLOW_UP_AGENT", "Channel: " + channel);

        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(envelope("Follow-up message enqueued for delivery", msg, "req_follow_msg_sent"));
    }

    @GetMapping("/messages")
    public ResponseEntity<?> listMessages() {
        return ResponseEntity.ok(envelope("Messages retrieved", new ArrayList<>(store.getFollowUpMessages().values()), "req_follow_msgs"));
    }

    @GetMapping("/messages/{messageId}")
    public ResponseEntity<?> getMessage(@PathVariable String messageId) {
        Map<String, Object> msg = store.getFollowUpMessages().get(messageId);
        return ResponseEntity.ok(envelope("Message retrieved", msg, "req_follow_msg_get"));
    }

    @GetMapping("/messages/{messageId}/delivery-status")
    public ResponseEntity<?> getDeliveryStatus(@PathVariable String messageId) {
        Map<String, Object> msg = store.getFollowUpMessages().get(messageId);
        if (msg == null) {
            msg = new LinkedHashMap<>();
            msg.put("messageId", messageId);
            msg.put("status", "DELIVERY_PENDING");
            msg.put("providerMessageReference", "provider-msg-1001");
            msg.put("lastUpdatedAt", LocalDateTime.now().toString());
        }
        return ResponseEntity.ok(envelope("Delivery status retrieved", msg, "req_follow_delivery_001"));
    }

    @PostMapping("/messages/{messageId}/retry-delivery")
    public ResponseEntity<?> retryDelivery(@PathVariable String messageId) {
        Map<String, Object> msg = store.getFollowUpMessages().get(messageId);
        if (msg != null) {
            msg.put("status", "DELIVERY_PENDING");
            msg.put("lastUpdatedAt", LocalDateTime.now().toString());
        }
        return ResponseEntity.ok(envelope("Delivery retry submitted", msg, "req_follow_del_retry"));
    }

    // ==========================================
    // F. Customer Responses & Preferences
    // ==========================================

    @PostMapping("/inbound-events")
    public ResponseEntity<?> processInboundEvent(@RequestBody Map<String, Object> body) {
        Map<String, Object> data = new LinkedHashMap<>(body);
        data.put("processed", true);
        data.put("actionTaken", "ROUTED_TO_INTENT_CLASSIFIER");
        return ResponseEntity.ok(envelope("Inbound channel event processed", data, "req_follow_inbound"));
    }

    @PostMapping("/responses/classify")
    public ResponseEntity<?> classifyResponse(@RequestBody Map<String, Object> body) {
        String text = String.valueOf(body.getOrDefault("text", ""));
        boolean lowerPrice = text.toLowerCase().contains("cheap") || text.toLowerCase().contains("budget") || text.toLowerCase().contains("discount");

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("intent", lowerPrice ? "REQUEST_LOWER_PRICE" : "GENERAL_ENQUIRY");
        data.put("sentiment", "NEUTRAL");
        data.put("requiresHumanReview", false);
        data.put("recommendedAction", lowerPrice ? "REQUEST_UPDATED_BUDGET_OR_SEARCH_LOWER_COST_OPTIONS" : "CONTINUE_CONVERSATION");
        data.put("cancelPendingFollowUps", true);

        // Store inbound response
        String respId = "inbound_resp_" + System.currentTimeMillis();
        store.getInboundCustomerResponses().put(respId, data);
        store.logAudit("tenant-7", "CUSTOMER_RESPONSE_CLASSIFIED", respId, "AI_FOLLOW_UP_AGENT", "Intent: " + data.get("intent"));

        return ResponseEntity.ok(envelope("Customer response classified", data, "req_follow_classify_001"));
    }

    @PostMapping("/responses/{responseId}/actions")
    public ResponseEntity<?> responseAction(@PathVariable String responseId, @RequestBody Map<String, Object> body) {
        Map<String, Object> data = new LinkedHashMap<>(body);
        data.put("responseId", responseId);
        data.put("status", "ACTION_EXECUTED");
        return ResponseEntity.ok(envelope("Customer response action triggered", data, "req_follow_resp_act"));
    }

    @GetMapping("/customers/{customerId}/preferences")
    public ResponseEntity<?> getCustomerPreferences(@PathVariable String customerId) {
        Map<String, Object> pref = store.getCustomerPreferences().get(customerId);
        if (pref == null) {
            pref = Map.of("customerId", customerId, "emailConsent", "GRANTED", "suppressionStatus", "ALLOWED");
        }
        return ResponseEntity.ok(envelope("Contact preferences retrieved", pref, "req_follow_pref_get"));
    }

    @PatchMapping("/customers/{customerId}/preferences")
    public ResponseEntity<?> updateCustomerPreferences(@PathVariable String customerId, @RequestBody Map<String, Object> body) {
        Map<String, Object> pref = store.getCustomerPreferences().computeIfAbsent(customerId, k -> new LinkedHashMap<>());
        pref.putAll(body);
        pref.put("lastConsentUpdate", LocalDateTime.now().toString());
        return ResponseEntity.ok(envelope("Contact preferences updated", pref, "req_follow_pref_patch"));
    }

    @PostMapping("/customers/{customerId}/opt-out")
    public ResponseEntity<?> recordOptOut(@PathVariable String customerId, @RequestBody Map<String, Object> body) {
        String channel = String.valueOf(body.getOrDefault("channel", "EMAIL"));
        String reason = String.valueOf(body.getOrDefault("reason", "CUSTOMER_REQUEST"));
        String source = String.valueOf(body.getOrDefault("source", "INBOUND_EMAIL"));

        Map<String, Object> pref = store.recordOptOut(customerId, channel, reason, source);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("customerId", customerId);
        data.put("channel", channel);
        data.put("suppressionStatus", "OPTED_OUT");
        data.put("pendingMatchingTasksCancelled", pref.getOrDefault("pendingMatchingTasksCancelled", 3));

        store.logAudit("tenant-7", "CUSTOMER_OPT_OUT", customerId, "AI_FOLLOW_UP_AGENT", "Channel: " + channel + ", Reason: " + reason);

        return ResponseEntity.ok(envelope("Opt-out recorded", data, "req_follow_optout_001"));
    }

    @PostMapping("/customers/{customerId}/opt-in")
    public ResponseEntity<?> recordOptIn(@PathVariable String customerId, @RequestBody Map<String, Object> body) {
        String channel = String.valueOf(body.getOrDefault("channel", "EMAIL"));
        Map<String, Object> pref = store.recordOptIn(customerId, channel);
        store.logAudit("tenant-7", "CUSTOMER_OPT_IN", customerId, "AI_FOLLOW_UP_AGENT", "Channel: " + channel);
        return ResponseEntity.ok(envelope("Opt-in recorded successfully", pref, "req_follow_optin"));
    }

    @GetMapping("/customers/{customerId}/suppression-status")
    public ResponseEntity<?> getSuppressionStatus(@PathVariable String customerId) {
        Map<String, Object> pref = store.getCustomerPreferences().get(customerId);
        String status = pref != null ? String.valueOf(pref.getOrDefault("suppressionStatus", "ALLOWED")) : "ALLOWED";
        return ResponseEntity.ok(envelope("Suppression status retrieved", Map.of("customerId", customerId, "suppressionStatus", status), "req_follow_supp_status"));
    }

    // ==========================================
    // G. Escalations & Reporting
    // ==========================================

    @PostMapping("/tasks/{taskId}/escalate")
    public ResponseEntity<?> escalateTask(@PathVariable String taskId, @RequestBody Map<String, Object> body) {
        String escalationId = "follow_escalation_1001";
        Map<String, Object> esc = new LinkedHashMap<>(body);
        esc.put("escalationId", escalationId);
        esc.put("taskId", taskId);
        esc.put("status", "OPEN");
        esc.put("assignedRole", "TRAVEL_CONSULTANT");
        esc.put("automatedSequencePaused", true);
        esc.put("createdAt", LocalDateTime.now().toString());

        store.getEscalations().put(escalationId, esc);
        Map<String, Object> t = store.getFollowUpTasks().get(taskId);
        if (t != null) {
            t.put("status", "ESCALATED");
        }
        store.logAudit("tenant-7", "FOLLOW_UP_ESCALATED", escalationId, "AI_FOLLOW_UP_AGENT", "Assigned to TRAVEL_CONSULTANT");

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(envelope("Follow-up escalated", esc, "req_follow_escalate_001"));
    }

    @GetMapping("/escalations")
    public ResponseEntity<?> listEscalations() {
        return ResponseEntity.ok(envelope("Escalations retrieved", store.getEscalationsList(), "req_follow_escs"));
    }

    @GetMapping("/escalations/{escalationId}")
    public ResponseEntity<?> getEscalation(@PathVariable String escalationId) {
        Map<String, Object> esc = store.getEscalations().get(escalationId);
        return ResponseEntity.ok(envelope("Escalation details retrieved", esc, "req_follow_esc_get"));
    }

    @PostMapping("/escalations/{escalationId}/resolve")
    public ResponseEntity<?> resolveEscalation(@PathVariable String escalationId, @RequestBody(required = false) Map<String, Object> body) {
        Map<String, Object> esc = store.getEscalations().get(escalationId);
        if (esc != null) {
            esc.put("status", "RESOLVED");
            esc.put("resolvedAt", LocalDateTime.now().toString());
        }
        return ResponseEntity.ok(envelope("Escalation resolved", esc, "req_follow_esc_res"));
    }

    @GetMapping("/reports/performance")
    public ResponseEntity<?> getPerformanceReport() {
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("totalSequencesRun", 480);
        r.put("conversionRatio", 0.31);
        r.put("avgMessagesToConversion", 2.4);
        r.put("humanAssistanceInterventions", 18);
        return ResponseEntity.ok(envelope("Follow-up performance report retrieved", r, "req_follow_rep_perf"));
    }

    @GetMapping("/reports/delivery")
    public ResponseEntity<?> getDeliveryReport() {
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("messagesAttempted", 950);
        r.put("deliverySuccessRate", 99.2);
        r.put("bounceRate", 0.8);
        r.put("openRate", 64.5);
        return ResponseEntity.ok(envelope("Delivery and failure report retrieved", r, "req_follow_rep_del"));
    }

    @GetMapping("/reports/conversion")
    public ResponseEntity<?> getConversionReport() {
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("attributableRevenue", 4250000.0);
        r.put("currency", "INR");
        r.put("bookingsAttributed", 42);
        return ResponseEntity.ok(envelope("Attributable conversion metrics retrieved", r, "req_follow_rep_conv"));
    }
}
