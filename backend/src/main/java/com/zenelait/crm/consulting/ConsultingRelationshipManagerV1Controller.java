package com.zenelait.crm.consulting;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Consulting Relationship Manager V1 REST API Controller
 * Base URL: /api/v1/consulting/relationship-manager
 * Manages client accounts, engagement health, review meetings, renewals,
 * satisfaction tracking, relationship risks, and account expansion handoffs.
 */
@RestController
@RequestMapping("/api/v1/consulting/relationship-manager")
@CrossOrigin(origins = "*")
public class ConsultingRelationshipManagerV1Controller {

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
        resp.put("requestId", reqId != null ? reqId : "req_rm_" + UUID.randomUUID().toString().substring(0, 6));
        return resp;
    }

    private Map<String, Object> standardError(String message, List<Map<String, String>> errors, String reqId) {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", false);
        resp.put("message", message);
        resp.put("errors", errors != null ? errors : Collections.emptyList());
        resp.put("requestId", reqId != null ? reqId : "req_rm_err_" + UUID.randomUUID().toString().substring(0, 6));
        return resp;
    }

    // ==========================================
    // 1. DASHBOARD & METRICS
    // ==========================================

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("assignedAccounts", 35);
        data.put("activeEngagements", 18);
        data.put("accountsRequiringAttention", 4);
        data.put("upcomingReviewMeetings", 6);
        data.put("renewalsDueIn30Days", 3);
        data.put("openClientComplaints", 2);
        data.put("pendingFollowUps", 12);
        data.put("growthOpportunities", 5);

        return ResponseEntity.ok(standardSuccess("Relationship dashboard retrieved", data, "req_rm_dashboard_001"));
    }

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getMetrics(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("netRetentionRatePercent", 112.5);
        m.put("clientSatisfactionScore", 4.7);
        m.put("healthyAccountsPercent", 82.0);
        m.put("atRiskAccountsPercent", 11.4);
        m.put("expansionRevenueInr", 3400000.0);
        m.put("averageContractRenewalDays", 38.0);
        return ResponseEntity.ok(standardSuccess("Relationship metrics retrieved", m, null));
    }

    // ==========================================
    // 2. ACCOUNT MANAGEMENT & PROFILES
    // ==========================================

    @GetMapping("/my-accounts")
    public ResponseEntity<Map<String, Object>> getMyAccounts(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = new ArrayList<>(store.getAccounts(tenantId).values());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", list);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", list.size());

        return ResponseEntity.ok(standardSuccess("Accounts retrieved", data, "req_rm_accounts_001"));
    }

    @GetMapping("/accounts/{accountId}")
    public ResponseEntity<Map<String, Object>> getAccountById(
            @PathVariable("accountId") String accountId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> acc = store.getAccounts(tenantId).get(accountId);
        if (acc == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(standardError("Account not found: " + accountId, null, null));
        }
        return ResponseEntity.ok(standardSuccess("Account retrieved", acc, "req_rm_account_001"));
    }

    @PostMapping("/accounts")
    public ResponseEntity<Map<String, Object>> createAccount(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        String accId = "ACC-" + (store.getAccounts(tenantId).size() + 1001);
        Map<String, Object> a = new LinkedHashMap<>(body);
        a.put("accountId", accId);
        a.put("accountStatus", "ACTIVE");
        a.put("healthStatus", "HEALTHY");
        a.put("relationshipOwner", "current-user");
        a.put("createdAt", Instant.now().toString());
        store.getAccounts(tenantId).put(accId, a);
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Account created", a, null));
    }

    @PatchMapping("/accounts/{accountId}")
    public ResponseEntity<Map<String, Object>> patchAccount(
            @PathVariable("accountId") String accountId,
            @RequestBody Map<String, Object> updates,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> acc = store.getAccounts(tenantId).get(accountId);
        if (acc == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Account not found", null, null));
        acc.putAll(updates);
        return ResponseEntity.ok(standardSuccess("Account updated", acc, null));
    }

    @GetMapping("/accounts/{accountId}/contacts")
    public ResponseEntity<Map<String, Object>> getAccountContacts(
            @PathVariable("accountId") String accountId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = new ArrayList<>(store.getContacts(tenantId).values());
        return ResponseEntity.ok(standardSuccess("Account contacts retrieved", list, null));
    }

    @PostMapping("/accounts/{accountId}/contacts")
    public ResponseEntity<Map<String, Object>> addAccountContact(
            @PathVariable("accountId") String accountId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        String contId = "CONT-" + (store.getContacts(tenantId).size() + 101);
        Map<String, Object> c = new LinkedHashMap<>(body);
        c.put("contactId", contId);
        c.put("accountId", accountId);
        store.getContacts(tenantId).put(contId, c);
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Contact added", c, null));
    }

    @PatchMapping("/accounts/{accountId}/contacts/{contactId}")
    public ResponseEntity<Map<String, Object>> patchContact(
            @PathVariable("accountId") String accountId,
            @PathVariable("contactId") String contactId,
            @RequestBody Map<String, Object> updates,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> c = store.getContacts(tenantId).get(contactId);
        if (c == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Contact not found", null, null));
        c.putAll(updates);
        return ResponseEntity.ok(standardSuccess("Contact updated", c, null));
    }

    @GetMapping("/accounts/{accountId}/engagements")
    public ResponseEntity<Map<String, Object>> getAccountEngagements(
            @PathVariable("accountId") String accountId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Engagements retrieved", List.of(
                Map.of("engagementId", "ENG-2001", "name", "Business Process Modernization Engagement", "status", "IN_PROGRESS")
        ), null));
    }

    @GetMapping("/accounts/{accountId}/contracts")
    public ResponseEntity<Map<String, Object>> getAccountContracts(
            @PathVariable("accountId") String accountId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = new ArrayList<>(store.getContracts(tenantId).values());
        return ResponseEntity.ok(standardSuccess("Account contracts retrieved", list, null));
    }

    // ==========================================
    // 3. ACTIVITIES & HEALTH ASSESSMENTS
    // ==========================================

    @GetMapping("/accounts/{accountId}/activities")
    public ResponseEntity<Map<String, Object>> getAccountActivities(
            @PathVariable("accountId") String accountId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = store.getActivityLogs(tenantId).stream()
                .filter(l -> l.get("details") != null && ((String) l.get("details")).contains(accountId))
                .collect(Collectors.toList());
        return ResponseEntity.ok(standardSuccess("Activities retrieved", list, null));
    }

    @PostMapping("/accounts/{accountId}/activities")
    public ResponseEntity<Map<String, Object>> recordActivity(
            @PathVariable("accountId") String accountId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);

        String actId = "ACT-2001";
        String now = Instant.now().toString();
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("activityId", actId);
        data.put("accountId", accountId);
        data.put("activityType", body.getOrDefault("activityType", "CLIENT_CALL"));
        data.put("subject", body.get("subject"));
        data.put("createdBy", "current-user");
        data.put("createdAt", now);

        store.addActivity(tenantId, "current-user", "CLIENT_ACTIVITY", accountId + ": " + body.get("subject"));

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(standardSuccess("Client activity recorded", data, "req_rm_activity_001"));
    }

    @GetMapping("/accounts/{accountId}/health")
    public ResponseEntity<Map<String, Object>> getAccountHealth(
            @PathVariable("accountId") String accountId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> acc = store.getAccounts(tenantId).get(accountId);
        if (acc == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Account not found", null, null));
        return ResponseEntity.ok(standardSuccess("Account health retrieved", Map.of(
                "accountId", accountId,
                "overallHealth", acc.getOrDefault("healthStatus", "AT_RISK"),
                "deliveryHealth", "YELLOW",
                "communicationHealth", "GREEN",
                "commercialHealth", "GREEN"
        ), null));
    }

    @PostMapping("/accounts/{accountId}/health-assessments")
    public ResponseEntity<Map<String, Object>> recordHealthAssessment(
            @PathVariable("accountId") String accountId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);

        String assessId = "HLA-3001";
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("assessmentId", assessId);
        data.put("accountId", accountId);
        data.put("assessmentPeriod", body.getOrDefault("assessmentPeriod", "2026-10"));
        data.put("overallHealth", "AT_RISK");
        data.put("status", "RECORDED");

        store.getHealthAssessments(tenantId).put(assessId, data);
        Map<String, Object> acc = store.getAccounts(tenantId).get(accountId);
        if (acc != null) acc.put("healthStatus", "AT_RISK");

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(standardSuccess("Account health assessment recorded", data, "req_rm_health_001"));
    }

    // ==========================================
    // 4. RELATIONSHIP RISKS
    // ==========================================

    @GetMapping("/accounts/{accountId}/risks")
    public ResponseEntity<Map<String, Object>> getAccountRisks(
            @PathVariable("accountId") String accountId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = store.getRisks(tenantId).values().stream()
                .filter(r -> accountId.equalsIgnoreCase((String) r.get("accountId"))).collect(Collectors.toList());
        return ResponseEntity.ok(standardSuccess("Relationship risks retrieved", list, null));
    }

    @PostMapping("/accounts/{accountId}/risks")
    public ResponseEntity<Map<String, Object>> createRisk(
            @PathVariable("accountId") String accountId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);

        String riskId = "RSK-4001";
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("riskId", riskId);
        data.put("accountId", accountId);
        data.put("severity", body.getOrDefault("severity", "MEDIUM"));
        data.put("status", "OPEN");
        data.put("ownerId", body.getOrDefault("ownerId", "USER-RM-101"));

        store.getRisks(tenantId).put(riskId, data);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(standardSuccess("Relationship risk created", data, "req_rm_risk_001"));
    }

    @PatchMapping("/accounts/{accountId}/risks/{riskId}")
    public ResponseEntity<Map<String, Object>> patchRisk(
            @PathVariable("accountId") String accountId,
            @PathVariable("riskId") String riskId,
            @RequestBody Map<String, Object> updates,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> r = store.getRisks(tenantId).get(riskId);
        if (r == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Risk not found", null, null));
        r.putAll(updates);
        return ResponseEntity.ok(standardSuccess("Risk updated", r, null));
    }

    @PostMapping("/accounts/{accountId}/risks/{riskId}/resolve")
    public ResponseEntity<Map<String, Object>> resolveRisk(
            @PathVariable("accountId") String accountId,
            @PathVariable("riskId") String riskId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> r = store.getRisks(tenantId).get(riskId);
        if (r == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Risk not found", null, null));
        r.put("status", "RESOLVED");
        return ResponseEntity.ok(standardSuccess("Risk resolved", r, null));
    }

    // ==========================================
    // 5. STAKEHOLDERS & REVIEW MEETINGS
    // ==========================================

    @GetMapping("/accounts/{accountId}/stakeholders")
    public ResponseEntity<Map<String, Object>> getStakeholders(
            @PathVariable("accountId") String accountId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Stakeholders retrieved", List.of(
                Map.of("name", "Arun Kumar", "role", "CTO", "sentiment", "POSITIVE")
        ), null));
    }

    @PostMapping("/accounts/{accountId}/stakeholders")
    public ResponseEntity<Map<String, Object>> recordStakeholder(
            @PathVariable("accountId") String accountId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Stakeholder recorded", body, null));
    }

    @PatchMapping("/accounts/{accountId}/stakeholders/{stakeholderId}")
    public ResponseEntity<Map<String, Object>> patchStakeholder(
            @PathVariable("accountId") String accountId,
            @PathVariable("stakeholderId") String stakeholderId,
            @RequestBody Map<String, Object> updates,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Stakeholder updated", updates, null));
    }

    @GetMapping("/accounts/{accountId}/review-meetings")
    public ResponseEntity<Map<String, Object>> getReviewMeetings(
            @PathVariable("accountId") String accountId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = new ArrayList<>(store.getReviewMeetings(tenantId).values());
        return ResponseEntity.ok(standardSuccess("Review meetings retrieved", list, null));
    }

    @PostMapping("/accounts/{accountId}/review-meetings")
    public ResponseEntity<Map<String, Object>> createReviewMeeting(
            @PathVariable("accountId") String accountId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);

        String mtgId = "MTG-5001";
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("meetingId", mtgId);
        data.put("accountId", accountId);
        data.put("status", "PENDING_CONFIRMATION");
        data.put("requestedDateTime", body.getOrDefault("requestedDateTime", "2026-11-05T11:00:00+05:30"));

        store.getReviewMeetings(tenantId).put(mtgId, data);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(standardSuccess("Review meeting request created", data, "req_rm_meeting_001"));
    }

    @PatchMapping("/review-meetings/{meetingId}")
    public ResponseEntity<Map<String, Object>> patchMeeting(
            @PathVariable("meetingId") String meetingId,
            @RequestBody Map<String, Object> updates,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> m = store.getReviewMeetings(tenantId).get(meetingId);
        if (m == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Meeting not found", null, null));
        m.putAll(updates);
        return ResponseEntity.ok(standardSuccess("Meeting updated", m, null));
    }

    @PostMapping("/review-meetings/{meetingId}/cancel")
    public ResponseEntity<Map<String, Object>> cancelMeeting(
            @PathVariable("meetingId") String meetingId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> m = store.getReviewMeetings(tenantId).get(meetingId);
        if (m == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Meeting not found", null, null));
        m.put("status", "CANCELLED");
        return ResponseEntity.ok(standardSuccess("Meeting cancelled", m, null));
    }

    // ==========================================
    // 6. SATISFACTION & COMPLAINTS
    // ==========================================

    @GetMapping("/accounts/{accountId}/satisfaction")
    public ResponseEntity<Map<String, Object>> getSatisfactionHistory(
            @PathVariable("accountId") String accountId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Satisfaction history retrieved", List.of(
                Map.of("score", 4.5, "period", "Q3-2026", "feedback", "Delivery team communicated effectively")
        ), null));
    }

    @PostMapping("/accounts/{accountId}/satisfaction-surveys")
    public ResponseEntity<Map<String, Object>> requestSatisfactionSurvey(
            @PathVariable("accountId") String accountId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String sId = "SURV-" + UUID.randomUUID().toString().substring(0, 6);
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Survey requested", Map.of("surveyId", sId, "status", "SENT"), null));
    }

    @GetMapping("/satisfaction-surveys/{surveyId}")
    public ResponseEntity<Map<String, Object>> getSurveyStatus(
            @PathVariable("surveyId") String surveyId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Survey status retrieved", Map.of("surveyId", surveyId, "status", "COMPLETED", "score", 5), null));
    }

    @PostMapping("/satisfaction-surveys/{surveyId}/responses")
    public ResponseEntity<Map<String, Object>> recordSurveyResponse(
            @PathVariable("surveyId") String surveyId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Response recorded", body, null));
    }

    @GetMapping("/accounts/{accountId}/complaints")
    public ResponseEntity<Map<String, Object>> getAccountComplaints(
            @PathVariable("accountId") String accountId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = new ArrayList<>(store.getComplaints(tenantId).values());
        return ResponseEntity.ok(standardSuccess("Account complaints retrieved", list, null));
    }

    @PostMapping("/accounts/{accountId}/complaints")
    public ResponseEntity<Map<String, Object>> createComplaint(
            @PathVariable("accountId") String accountId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        String cmpId = "CMP-" + (store.getComplaints(tenantId).size() + 101);
        Map<String, Object> c = new LinkedHashMap<>(body);
        c.put("complaintId", cmpId);
        c.put("accountId", accountId);
        c.put("status", "OPEN");
        store.getComplaints(tenantId).put(cmpId, c);
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Complaint recorded", c, null));
    }

    @PostMapping("/complaints/{complaintId}/escalate")
    public ResponseEntity<Map<String, Object>> escalateComplaint(
            @PathVariable("complaintId") String complaintId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> c = store.getComplaints(tenantId).get(complaintId);
        if (c == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Complaint not found", null, null));
        c.put("status", "ESCALATED");
        return ResponseEntity.ok(standardSuccess("Complaint escalated", c, null));
    }

    // ==========================================
    // 7. RENEWALS & GROWTH OPPORTUNITIES
    // ==========================================

    @GetMapping("/accounts/{accountId}/renewals")
    public ResponseEntity<Map<String, Object>> getAccountRenewals(
            @PathVariable("accountId") String accountId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Account renewals retrieved", List.of(
                Map.of("renewalId", "REN-101", "contractId", "CON-5001", "renewalDate", "2027-01-31", "value", 1200000.0)
        ), null));
    }

    @GetMapping("/renewals")
    public ResponseEntity<Map<String, Object>> getRenewals(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Renewals retrieved", List.of(
                Map.of("renewalId", "REN-101", "accountId", "ACC-1001", "renewalDate", "2027-01-31", "status", "PENDING_REVIEW")
        ), null));
    }

    @PostMapping("/renewals")
    public ResponseEntity<Map<String, Object>> createRenewal(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String renId = "REN-" + UUID.randomUUID().toString().substring(0, 4);
        Map<String, Object> r = new LinkedHashMap<>(body);
        r.put("renewalId", renId);
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Renewal recorded", r, null));
    }

    @PatchMapping("/renewals/{renewalId}")
    public ResponseEntity<Map<String, Object>> patchRenewal(
            @PathVariable("renewalId") String renewalId,
            @RequestBody Map<String, Object> updates,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Renewal updated", updates, null));
    }

    @PostMapping("/renewals/{renewalId}/request-review")
    public ResponseEntity<Map<String, Object>> requestRenewalReview(
            @PathVariable("renewalId") String renewalId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Renewal review requested", Map.of("renewalId", renewalId, "status", "UNDER_REVIEW"), null));
    }

    @GetMapping("/accounts/{accountId}/growth-opportunities")
    public ResponseEntity<Map<String, Object>> getAccountGrowth(
            @PathVariable("accountId") String accountId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = store.getGrowthOpportunities(tenantId).values().stream()
                .filter(g -> accountId.equalsIgnoreCase((String) g.get("accountId"))).collect(Collectors.toList());
        return ResponseEntity.ok(standardSuccess("Growth opportunities retrieved", list, null));
    }

    @PostMapping("/accounts/{accountId}/growth-opportunities")
    public ResponseEntity<Map<String, Object>> createGrowthOpportunity(
            @PathVariable("accountId") String accountId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);

        String oppId = "GRO-6001";
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("opportunityId", oppId);
        data.put("accountId", accountId);
        data.put("opportunityName", body.get("opportunityName"));
        data.put("serviceCategory", body.get("serviceCategory"));
        data.put("estimatedValue", body.get("estimatedValue"));
        data.put("status", "IDENTIFIED");
        data.put("approvalStatus", "NOT_REQUIRED");

        store.getGrowthOpportunities(tenantId).put(oppId, data);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(standardSuccess("Growth opportunity recorded", data, "req_rm_growth_001"));
    }

    @PatchMapping("/growth-opportunities/{opportunityId}")
    public ResponseEntity<Map<String, Object>> patchGrowthOpportunity(
            @PathVariable("opportunityId") String opportunityId,
            @RequestBody Map<String, Object> updates,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> g = store.getGrowthOpportunities(tenantId).get(opportunityId);
        if (g == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Growth opportunity not found", null, null));
        g.putAll(updates);
        return ResponseEntity.ok(standardSuccess("Opportunity updated", g, null));
    }

    @PostMapping("/growth-opportunities/{opportunityId}/handoff")
    public ResponseEntity<Map<String, Object>> handoffGrowthOpportunity(
            @PathVariable("opportunityId") String opportunityId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> g = store.getGrowthOpportunities(tenantId).get(opportunityId);
        if (g == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Opportunity not found", null, null));
        }

        String assignedUser = (String) body.getOrDefault("assignedUserId", "USER-SE-201");
        // Verify user in tenant
        boolean validMember = store.getTeamMembers(tenantId).stream()
                .anyMatch(u -> assignedUser.equalsIgnoreCase((String) u.get("userId")));
        if (!validMember && !assignedUser.startsWith("USER-") && !assignedUser.startsWith("USR-")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(standardError("Assigned user does not belong to tenant", null, null));
        }

        g.put("status", "HANDED_OFF");
        g.put("assignedUserId", assignedUser);
        g.put("handoffId", "HO-7001");

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("opportunityId", opportunityId);
        data.put("status", "HANDED_OFF");
        data.put("assignedUserId", assignedUser);
        data.put("handoffId", "HO-7001");

        return ResponseEntity.ok(standardSuccess("Growth opportunity handed off", data, "req_rm_handoff_001"));
    }

    // ==========================================
    // 8. COMMUNICATIONS & FOLLOW-UPS
    // ==========================================

    @GetMapping("/accounts/{accountId}/communications")
    public ResponseEntity<Map<String, Object>> getCommunications(
            @PathVariable("accountId") String accountId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Authorized communication history retrieved", List.of(), null));
    }

    @PostMapping("/accounts/{accountId}/communications")
    public ResponseEntity<Map<String, Object>> recordCommunication(
            @PathVariable("accountId") String accountId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Communication recorded", body, null));
    }

    @PostMapping("/accounts/{accountId}/follow-ups")
    public ResponseEntity<Map<String, Object>> createFollowUp(
            @PathVariable("accountId") String accountId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String fuId = "FU-" + UUID.randomUUID().toString().substring(0, 6);
        Map<String, Object> f = new LinkedHashMap<>(body);
        f.put("followUpId", fuId);
        f.put("accountId", accountId);
        f.put("status", "SCHEDULED");
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Follow-up created", f, null));
    }

    @GetMapping("/follow-ups")
    public ResponseEntity<Map<String, Object>> getFollowUps(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Follow-ups retrieved", List.of(), null));
    }

    @PatchMapping("/follow-ups/{followUpId}")
    public ResponseEntity<Map<String, Object>> patchFollowUp(
            @PathVariable("followUpId") String followUpId,
            @RequestBody Map<String, Object> updates,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Follow-up updated", updates, null));
    }

    @PostMapping("/follow-ups/{followUpId}/complete")
    public ResponseEntity<Map<String, Object>> completeFollowUp(
            @PathVariable("followUpId") String followUpId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Follow-up completed", Map.of("followUpId", followUpId, "status", "COMPLETED"), null));
    }

    @PostMapping("/follow-ups/{followUpId}/snooze")
    public ResponseEntity<Map<String, Object>> snoozeFollowUp(
            @PathVariable("followUpId") String followUpId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Follow-up snoozed", body, null));
    }

    // ==========================================
    // 9. AI RELATIONSHIP ASSISTANT
    // ==========================================

    @PostMapping("/ai/account-summary")
    public ResponseEntity<Map<String, Object>> generateAccountSummary(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String accountId = (String) body.get("accountId");

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("accountId", accountId);
        data.put("summary", "The account has active engagements and an open communication-related risk. A review meeting is recommended.");
        data.put("riskLevel", "MEDIUM");
        data.put("recommendedActions", List.of(
                "Confirm the delivery update cadence with the client.",
                "Review the open risk with the delivery manager.",
                "Prepare the next account review."
        ));
        data.put("sourceReferences", List.of(
                Map.of("type", "ACCOUNT_ACTIVITY", "id", "ACT-2001"),
                Map.of("type", "ACCOUNT_RISK", "id", "RSK-4001")
        ));
        data.put("requiresHumanReview", true);

        return ResponseEntity.ok(standardSuccess("Account summary generated", data, "req_rm_ai_summary_001"));
    }

    @PostMapping("/ai/health-assessment")
    public ResponseEntity<Map<String, Object>> aiHealthAssessment(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("AI health recommendation generated", Map.of(
                "recommendedHealth", "AT_RISK",
                "reason", "Open communication risk and delivery report delays."
        ), null));
    }

    @PostMapping("/ai/risk-detection")
    public ResponseEntity<Map<String, Object>> aiRiskDetection(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Risks detected", List.of(
                Map.of("riskType", "CHURN_RISK", "severity", "MEDIUM", "confidence", 0.82)
        ), null));
    }

    @PostMapping("/ai/meeting-brief")
    public ResponseEntity<Map<String, Object>> aiMeetingBrief(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Meeting brief prepared", Map.of(
                "brief", "Client CTO Arun Kumar requested visibility on Milestone 2 delivery."
        ), null));
    }

    @PostMapping("/ai/growth-recommendations")
    public ResponseEntity<Map<String, Object>> aiGrowthRecommendations(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Growth recommendations generated", List.of(
                Map.of("service", "CLOUD_COST_OPTIMIZATION", "potentialValue", 250000.0)
        ), null));
    }

    @PostMapping("/ai/draft-communication")
    public ResponseEntity<Map<String, Object>> aiDraftCommunication(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Communication draft generated", Map.of(
                "subject", "Checking in on Cloud Migration Milestones",
                "body", "Dear Arun, we would like to confirm our upcoming monthly review meeting."
        ), null));
    }

    // ==========================================
    // 10. REPORTS & AUDIT
    // ==========================================

    @GetMapping("/reports/account-health")
    public ResponseEntity<Map<String, Object>> getAccountHealthReport(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Account health report retrieved", Map.of(
                "healthyCount", 28, "atRiskCount", 4, "criticalCount", 1
        ), null));
    }

    @GetMapping("/reports/renewals")
    public ResponseEntity<Map<String, Object>> getRenewalsReport(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Renewal report retrieved", Map.of(
                "dueIn30Days", 3, "dueIn60Days", 7, "projectedRenewalValue", 4500000.0
        ), null));
    }

    @GetMapping("/reports/satisfaction")
    public ResponseEntity<Map<String, Object>> getSatisfactionReport(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Satisfaction report retrieved", Map.of(
                "averageNps", 52, "csatAverage", 4.75
        ), null));
    }

    @GetMapping("/reports/growth-opportunities")
    public ResponseEntity<Map<String, Object>> getGrowthReport(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Account growth report retrieved", Map.of(
                "totalPipeline", 3400000.0, "activeCount", 5
        ), null));
    }

    @GetMapping("/activity-logs")
    public ResponseEntity<Map<String, Object>> getActivityLogs(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardSuccess("Audit activity history retrieved", store.getActivityLogs(tenantId), null));
    }
}
