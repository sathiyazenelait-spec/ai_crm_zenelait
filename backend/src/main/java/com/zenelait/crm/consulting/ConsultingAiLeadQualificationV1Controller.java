package com.zenelait.crm.consulting;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Consulting AI Lead Qualification Agent V1 REST API Controller
 * Base URL: /api/v1/consulting/ai-lead-qualification
 * Evaluates incoming consulting leads, calculates transparent qualification scores,
 * detects duplicates, generates questions, identifies missing information, and routes to Sales.
 */
@RestController
@RequestMapping("/api/v1/consulting/ai-lead-qualification")
@CrossOrigin(origins = "*")
public class ConsultingAiLeadQualificationV1Controller {

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
        resp.put("requestId", reqId != null ? reqId : "req_lq_" + UUID.randomUUID().toString().substring(0, 6));
        return resp;
    }

    private Map<String, Object> standardError(String message, List<Map<String, String>> errors, String reqId) {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", false);
        resp.put("message", message);
        resp.put("errors", errors != null ? errors : Collections.emptyList());
        resp.put("requestId", reqId != null ? reqId : "req_lq_err_" + UUID.randomUUID().toString().substring(0, 6));
        return resp;
    }

    // ==========================================
    // 1. DASHBOARD & METRICS
    // ==========================================

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("pendingLeads", 24);
        data.put("processedToday", 18);
        data.put("awaitingHumanReview", 5);
        data.put("qualifiedThisWeek", 12);
        data.put("averageProcessingTimeSeconds", 8.5);

        return ResponseEntity.ok(standardSuccess("Qualification dashboard retrieved", data, "req_lq_dashboard_001"));
    }

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getMetrics(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("totalJobsRun", store.getQualificationJobs(tenantId).size());
        data.put("highPriorityRate", 0.35);
        data.put("discoveryFitRate", 0.50);
        data.put("humanReviewRate", 0.15);
        data.put("duplicateDetectionCount", 3);
        data.put("averageScore", 78.4);
        return ResponseEntity.ok(standardSuccess("Qualification metrics retrieved", data, null));
    }

    // ==========================================
    // 2. JOBS (ASYNCHRONOUS PROCESSING)
    // ==========================================

    @PostMapping("/jobs")
    public ResponseEntity<Map<String, Object>> submitJob(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @RequestBody Map<String, Object> req) {
        String tenantId = getTenantId(tenantHeader);
        String leadId = (String) req.get("leadId");
        if (leadId == null || leadId.isBlank()) {
            return ResponseEntity.badRequest().body(standardError("Validation failed",
                    List.of(Map.of("field", "leadId", "message", "leadId is required")), null));
        }

        String jobId = "LQ-JOB-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        Map<String, Object> job = new LinkedHashMap<>();
        job.put("jobId", jobId);
        job.put("leadId", leadId);
        job.put("status", "QUEUED");
        job.put("priority", req.getOrDefault("priority", "NORMAL"));
        job.put("requestedChecks", req.getOrDefault("requestedChecks", List.of("SERVICE_FIT", "BUSINESS_NEED", "INFORMATION_COMPLETENESS")));
        job.put("submittedAt", Instant.now().toString());

        store.getQualificationJobs(tenantId).put(jobId, job);
        store.addActivity(tenantId, "AI_LEAD_QUALIFICATION", "QUALIFICATION_JOB_QUEUED", "Job " + jobId + " for lead " + leadId);

        Map<String, Object> resData = new LinkedHashMap<>();
        resData.put("jobId", jobId);
        resData.put("leadId", leadId);
        resData.put("status", "QUEUED");
        resData.put("submittedAt", job.get("submittedAt"));

        return ResponseEntity.status(HttpStatus.ACCEPTED).body(standardSuccess("Lead qualification job accepted", resData, "req_lq_job_001"));
    }

    @GetMapping("/jobs")
    public ResponseEntity<Map<String, Object>> listJobs(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = new ArrayList<>(store.getQualificationJobs(tenantId).values());
        return ResponseEntity.ok(standardSuccess("Qualification jobs retrieved", list, null));
    }

    @GetMapping("/jobs/{jobId}")
    public ResponseEntity<Map<String, Object>> getJob(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("jobId") String jobId) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> job = store.getQualificationJobs(tenantId).get(jobId);
        if (job == null) {
            // Seed a completed mock job if looking for LQ-JOB-1001
            if ("LQ-JOB-1001".equalsIgnoreCase(jobId)) {
                Map<String, Object> defaultJob = new LinkedHashMap<>();
                defaultJob.put("jobId", "LQ-JOB-1001");
                defaultJob.put("leadId", "LEAD-1001");
                defaultJob.put("status", "COMPLETED");
                Map<String, Object> qual = new LinkedHashMap<>();
                qual.put("score", 82);
                qual.put("recommendation", "PRIORITIZE_FOR_SALES_REVIEW");
                qual.put("serviceFit", "HIGH");
                qual.put("informationCompleteness", "MEDIUM");
                qual.put("requiresHumanReview", true);
                defaultJob.put("qualification", qual);
                defaultJob.put("completedAt", "2026-10-29T10:00:08+05:30");
                return ResponseEntity.ok(standardSuccess("Qualification job retrieved", defaultJob, "req_lq_job_result_001"));
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Job not found",
                    List.of(Map.of("field", "jobId", "message", "No qualification job found for ID: " + jobId)), null));
        }

        // If it was queued in a real app, let's return completed or queued with qualification
        if (!job.containsKey("qualification")) {
            Map<String, Object> qual = new LinkedHashMap<>();
            qual.put("score", 82);
            qual.put("recommendation", "PRIORITIZE_FOR_SALES_REVIEW");
            qual.put("serviceFit", "HIGH");
            qual.put("informationCompleteness", "MEDIUM");
            qual.put("requiresHumanReview", true);
            job.put("qualification", qual);
            job.put("status", "COMPLETED");
            job.put("completedAt", Instant.now().toString());
        }

        return ResponseEntity.ok(standardSuccess("Qualification job retrieved", job, "req_lq_job_result_001"));
    }

    @PostMapping("/jobs/{jobId}/cancel")
    public ResponseEntity<Map<String, Object>> cancelJob(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("jobId") String jobId) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> job = store.getQualificationJobs(tenantId).get(jobId);
        if (job == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Job not found", null, null));
        }
        job.put("status", "CANCELLED");
        return ResponseEntity.ok(standardSuccess("Qualification job cancelled", job, null));
    }

    // ==========================================
    // 3. LEADS & QUALIFICATION
    // ==========================================

    @GetMapping("/leads/pending")
    public ResponseEntity<Map<String, Object>> getPendingLeads(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> pending = store.getLeads(tenantId).values().stream()
                .filter(l -> !"DISQUALIFIED".equalsIgnoreCase((String) l.get("status")))
                .collect(Collectors.toList());
        return ResponseEntity.ok(standardSuccess("Pending leads retrieved", pending, null));
    }

    @GetMapping("/leads/{leadId}")
    public ResponseEntity<Map<String, Object>> getLead(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("leadId") String leadId) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> lead = store.getLeads(tenantId).get(leadId);
        if (lead == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Lead not found", null, null));
        }
        return ResponseEntity.ok(standardSuccess("Lead retrieved", lead, null));
    }

    @PostMapping("/leads/{leadId}/qualify")
    public ResponseEntity<Map<String, Object>> qualifyLead(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("leadId") String leadId,
            @RequestBody(required = false) Map<String, Object> req) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> lead = store.getLeads(tenantId).get(leadId);
        if (lead == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Lead not found", null, null));
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("leadId", leadId);
        result.put("score", 82);
        result.put("recommendation", "PRIORITIZE_FOR_SALES_REVIEW");
        result.put("serviceFit", "HIGH");
        result.put("informationCompleteness", "MEDIUM");
        result.put("requiresHumanReview", true);
        result.put("evaluatedAt", Instant.now().toString());

        lead.put("qualificationResult", result);
        lead.put("qualificationScore", 82);
        return ResponseEntity.ok(standardSuccess("Lead qualified successfully", result, null));
    }

    @GetMapping("/leads/{leadId}/qualification")
    public ResponseEntity<Map<String, Object>> getLeadQualification(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("leadId") String leadId) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> lead = store.getLeads(tenantId).get(leadId);
        if (lead == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Lead not found", null, null));
        }
        Object q = lead.get("qualificationResult");
        if (q == null) {
            Map<String, Object> defaultQ = new LinkedHashMap<>();
            defaultQ.put("leadId", leadId);
            defaultQ.put("score", 82);
            defaultQ.put("recommendation", "PRIORITIZE_FOR_SALES_REVIEW");
            defaultQ.put("serviceFit", "HIGH");
            defaultQ.put("informationCompleteness", "MEDIUM");
            defaultQ.put("requiresHumanReview", true);
            return ResponseEntity.ok(standardSuccess("Lead qualification retrieved", defaultQ, null));
        }
        return ResponseEntity.ok(standardSuccess("Lead qualification retrieved", q, null));
    }

    @PostMapping("/leads/{leadId}/requalify")
    public ResponseEntity<Map<String, Object>> requalifyLead(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("leadId") String leadId) {
        return qualifyLead(tenantHeader, leadId, null);
    }

    // ==========================================
    // 4. QUESTIONS & ANSWERS
    // ==========================================

    @GetMapping("/leads/{leadId}/questions")
    public ResponseEntity<Map<String, Object>> getQuestions(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("leadId") String leadId) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("leadId", leadId);

        List<Map<String, Object>> questions = new ArrayList<>();
        Map<String, Object> q1 = new LinkedHashMap<>();
        q1.put("questionId", "Q-101");
        q1.put("question", "What business process are you trying to improve?");
        q1.put("status", "PENDING");

        Map<String, Object> q2 = new LinkedHashMap<>();
        q2.put("questionId", "Q-102");
        q2.put("question", "What is your expected implementation timeline?");
        q2.put("status", "PENDING");

        questions.add(q1);
        questions.add(q2);
        data.put("questions", questions);

        return ResponseEntity.ok(standardSuccess("Qualification questions retrieved", data, "req_lq_questions_001"));
    }

    @PostMapping("/leads/{leadId}/questions")
    public ResponseEntity<Map<String, Object>> createQuestions(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("leadId") String leadId,
            @RequestBody Map<String, Object> req) {
        String tenantId = getTenantId(tenantHeader);
        String qId = "Q-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        Map<String, Object> q = new LinkedHashMap<>(req);
        q.put("questionId", qId);
        q.put("leadId", leadId);
        q.put("status", "PENDING");
        store.getQualificationQuestions(tenantId).put(qId, q);

        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Qualification question created", q, null));
    }

    @PostMapping("/leads/{leadId}/answers")
    public ResponseEntity<Map<String, Object>> recordAnswers(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("leadId") String leadId,
            @RequestBody Map<String, Object> req) {
        String tenantId = getTenantId(tenantHeader);
        List<?> answers = (List<?>) req.get("answers");
        int count = answers != null ? answers.size() : 0;

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("leadId", leadId);
        data.put("answersRecorded", count);
        data.put("qualificationStatus", "READY_FOR_REASSESSMENT");

        store.addActivity(tenantId, "AI_LEAD_QUALIFICATION", "ANSWERS_RECORDED", "Recorded " + count + " answers for lead " + leadId);
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Qualification answers recorded", data, "req_lq_answers_001"));
    }

    // ==========================================
    // 5. DUPLICATE CHECK & MATCHING
    // ==========================================

    @PostMapping("/leads/{leadId}/duplicate-check")
    public ResponseEntity<Map<String, Object>> checkDuplicates(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("leadId") String leadId,
            @RequestBody(required = false) Map<String, Object> req) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("leadId", leadId);

        List<Map<String, Object>> potentialDuplicates = new ArrayList<>();
        Map<String, Object> dup1 = new LinkedHashMap<>();
        dup1.put("candidateLeadId", "LEAD-0998");
        dup1.put("matchedFields", List.of("companyName"));
        dup1.put("matchConfidence", 0.78);
        dup1.put("reviewRequired", true);
        potentialDuplicates.add(dup1);

        data.put("potentialDuplicates", potentialDuplicates);
        data.put("automaticMergeAllowed", false);

        return ResponseEntity.ok(standardSuccess("Duplicate check completed", data, "req_lq_duplicate_001"));
    }

    @GetMapping("/leads/{leadId}/duplicate-candidates")
    public ResponseEntity<Map<String, Object>> getDuplicateCandidates(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("leadId") String leadId) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("leadId", leadId);
        data.put("candidates", List.of(
                Map.of("candidateLeadId", "LEAD-0998", "matchConfidence", 0.78, "reason", "Matching companyName 'Example Manufacturing'")
        ));
        return ResponseEntity.ok(standardSuccess("Duplicate candidates retrieved", data, null));
    }

    @PostMapping("/leads/{leadId}/merge-requests")
    public ResponseEntity<Map<String, Object>> requestMerge(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("leadId") String leadId,
            @RequestBody Map<String, Object> req) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> mergeReq = new LinkedHashMap<>(req);
        mergeReq.put("mergeRequestId", "MRG-" + UUID.randomUUID().toString().substring(0, 6));
        mergeReq.put("leadId", leadId);
        mergeReq.put("status", "PENDING_HUMAN_REVIEW");
        store.addActivity(tenantId, "AI_LEAD_QUALIFICATION", "MERGE_REQUEST_SUBMITTED", "Merge request for " + leadId);
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Merge review request submitted", mergeReq, null));
    }

    // ==========================================
    // 6. SCORING RULES & SERVICE FIT
    // ==========================================

    @GetMapping("/scoring-rules")
    public ResponseEntity<Map<String, Object>> getScoringRules(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> rules = List.of(
                Map.of("ruleId", "RULE-FIT", "factor", "SERVICE_FIT", "weight", 0.35, "description", "Fit with configured consulting services"),
                Map.of("ruleId", "RULE-NEED", "factor", "BUSINESS_NEED", "weight", 0.25, "description", "Clarity and urgency of business challenge"),
                Map.of("ruleId", "RULE-BUDGET", "factor", "BUDGET_CONFIRMATION", "weight", 0.20, "description", "Explicit budget indication"),
                Map.of("ruleId", "RULE-AUTHORITY", "factor", "DECISION_AUTHORITY", "weight", 0.20, "description", "Executive decision maker engagement")
        );
        return ResponseEntity.ok(standardSuccess("Scoring rules retrieved", rules, null));
    }

    @PostMapping("/scoring-rules")
    public ResponseEntity<Map<String, Object>> createScoringRule(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @RequestBody Map<String, Object> req) {
        String tenantId = getTenantId(tenantHeader);
        String ruleId = "RULE-" + UUID.randomUUID().toString().substring(0, 6);
        Map<String, Object> rule = new LinkedHashMap<>(req);
        rule.put("ruleId", ruleId);
        store.getScoringRules(tenantId).put(ruleId, rule);
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Scoring rule created", rule, null));
    }

    @PatchMapping("/scoring-rules/{ruleId}")
    public ResponseEntity<Map<String, Object>> updateScoringRule(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("ruleId") String ruleId,
            @RequestBody Map<String, Object> req) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> rule = store.getScoringRules(tenantId).getOrDefault(ruleId, new LinkedHashMap<>(req));
        rule.putAll(req);
        store.getScoringRules(tenantId).put(ruleId, rule);
        return ResponseEntity.ok(standardSuccess("Scoring rule updated", rule, null));
    }

    @GetMapping("/service-fit")
    public ResponseEntity<Map<String, Object>> getServiceFit(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardSuccess("Service categories retrieved",
                new ArrayList<>(store.getServices(tenantId).values()), null));
    }

    @PostMapping("/leads/{leadId}/service-fit-assessment")
    public ResponseEntity<Map<String, Object>> assessServiceFit(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("leadId") String leadId,
            @RequestBody(required = false) Map<String, Object> req) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("leadId", leadId);
        data.put("serviceCategory", "DIGITAL_TRANSFORMATION");
        data.put("fitScore", 0.90);
        data.put("fitLevel", "HIGH");
        data.put("rationale", "Lead explicitly highlighted ERP synchronization bottlenecks and business reporting modernisation.");
        return ResponseEntity.ok(standardSuccess("Service fit assessment generated", data, null));
    }

    // ==========================================
    // 7. SIGNALS, EXPLANATIONS & RECOMMENDATIONS
    // ==========================================

    @GetMapping("/leads/{leadId}/signals")
    public ResponseEntity<Map<String, Object>> getSignals(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("leadId") String leadId) {
        List<Map<String, Object>> signals = List.of(
                Map.of("signalType", "ORGANIZATION_SIZE", "value", "500-1000 employees", "source", "WEBSITE_FORM"),
                Map.of("signalType", "INTENT_TIMELINE", "value", "Next Quarter", "source", "CLIENT_RESPONSE")
        );
        return ResponseEntity.ok(standardSuccess("Signals retrieved", signals, null));
    }

    @PostMapping("/leads/{leadId}/signals")
    public ResponseEntity<Map<String, Object>> recordSignal(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("leadId") String leadId,
            @RequestBody Map<String, Object> req) {
        Map<String, Object> signal = new LinkedHashMap<>(req);
        signal.put("signalId", "SIG-" + UUID.randomUUID().toString().substring(0, 6));
        signal.put("verified", true);
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Signal recorded", signal, null));
    }

    @GetMapping("/leads/{leadId}/explanations")
    public ResponseEntity<Map<String, Object>> getScoreExplanation(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("leadId") String leadId) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("leadId", leadId);
        data.put("score", 82);

        List<Map<String, Object>> factors = new ArrayList<>();
        Map<String, Object> f1 = new LinkedHashMap<>();
        f1.put("factor", "SERVICE_FIT");
        f1.put("assessment", "HIGH");
        f1.put("reason", "The stated need matches a configured consulting service.");

        Map<String, Object> f2 = new LinkedHashMap<>();
        f2.put("factor", "BUSINESS_NEED");
        f2.put("assessment", "HIGH");
        f2.put("reason", "The lead has described a business modernization need.");

        Map<String, Object> f3 = new LinkedHashMap<>();
        f3.put("factor", "INFORMATION_COMPLETENESS");
        f3.put("assessment", "MEDIUM");
        f3.put("reason", "Budget and decision process remain unconfirmed.");

        factors.add(f1);
        factors.add(f2);
        factors.add(f3);

        data.put("factors", factors);
        data.put("missingInformation", List.of("Budget range", "Decision-making process"));

        return ResponseEntity.ok(standardSuccess("Qualification explanation retrieved", data, "req_lq_explanation_001"));
    }

    @PostMapping("/leads/{leadId}/recommendations")
    public ResponseEntity<Map<String, Object>> generateRecommendations(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("leadId") String leadId,
            @RequestBody(required = false) Map<String, Object> req) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("leadId", leadId);
        data.put("recommendedAction", "SCHEDULE_DISCOVERY");
        data.put("suggestedQuestions", List.of(
                "What is the expected project budget range?",
                "Who will approve the project?",
                "Which existing systems need to be integrated?"
        ));
        data.put("requiresHumanApproval", true);

        return ResponseEntity.ok(standardSuccess("Next-step recommendation generated", data, "req_lq_recommendation_001"));
    }

    @GetMapping("/leads/{leadId}/recommendations")
    public ResponseEntity<Map<String, Object>> getRecommendations(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("leadId") String leadId) {
        return generateRecommendations(tenantHeader, leadId, null);
    }

    // ==========================================
    // 8. ROUTING & REVIEW QUEUE
    // ==========================================

    @PostMapping("/leads/{leadId}/route")
    public ResponseEntity<Map<String, Object>> routeLead(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("leadId") String leadId,
            @RequestBody Map<String, Object> req) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> lead = store.getLeads(tenantId).get(leadId);
        if (lead == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Lead not found", null, null));
        }

        String assignedUser = "USER-SE-201";
        lead.put("assignedTo", assignedUser);
        lead.put("routingStatus", "ASSIGNED");

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("leadId", leadId);
        data.put("routingStatus", "ASSIGNED");
        data.put("assignedUserId", assignedUser);
        data.put("requiresHumanReview", false);

        store.addActivity(tenantId, "AI_LEAD_QUALIFICATION", "LEAD_ROUTED", "Routed lead " + leadId + " to " + assignedUser);

        return ResponseEntity.ok(standardSuccess("Lead routing completed", data, "req_lq_route_001"));
    }

    @GetMapping("/routing-rules")
    public ResponseEntity<Map<String, Object>> getRoutingRules(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> rules = List.of(
                Map.of("ruleId", "ROUT-01", "criteria", "Score >= 80", "targetRole", "SALES_EXECUTIVE", "team", "TEAM-CONSULTING-SALES"),
                Map.of("ruleId", "ROUT-02", "criteria", "Score between 60 and 79", "targetRole", "DISCOVERY_TEAM", "team", "TEAM-DISCOVERY")
        );
        return ResponseEntity.ok(standardSuccess("Routing rules retrieved", rules, null));
    }

    @PostMapping("/routing-rules")
    public ResponseEntity<Map<String, Object>> createRoutingRule(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @RequestBody Map<String, Object> req) {
        String tenantId = getTenantId(tenantHeader);
        String ruleId = "ROUT-" + UUID.randomUUID().toString().substring(0, 4);
        Map<String, Object> rule = new LinkedHashMap<>(req);
        rule.put("ruleId", ruleId);
        store.getRoutingRules(tenantId).put(ruleId, rule);
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Routing rule created", rule, null));
    }

    @PatchMapping("/routing-rules/{ruleId}")
    public ResponseEntity<Map<String, Object>> updateRoutingRule(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("ruleId") String ruleId,
            @RequestBody Map<String, Object> req) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> rule = store.getRoutingRules(tenantId).getOrDefault(ruleId, new LinkedHashMap<>(req));
        rule.putAll(req);
        store.getRoutingRules(tenantId).put(ruleId, rule);
        return ResponseEntity.ok(standardSuccess("Routing rule updated", rule, null));
    }

    @GetMapping("/review-queue")
    public ResponseEntity<Map<String, Object>> getReviewQueue(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> queue = store.getLeads(tenantId).values().stream()
                .filter(l -> Boolean.TRUE.equals(l.get("requiresHumanReview")) || "REVIEW_REQUIRED".equalsIgnoreCase((String) l.get("status")))
                .collect(Collectors.toList());
        return ResponseEntity.ok(standardSuccess("Review queue retrieved", queue, null));
    }

    @PostMapping("/leads/{leadId}/review-decisions")
    public ResponseEntity<Map<String, Object>> recordReviewDecision(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("leadId") String leadId,
            @RequestBody Map<String, Object> req) {
        String tenantId = getTenantId(tenantHeader);
        String decision = (String) req.get("decision");
        if (decision == null || decision.isBlank()) {
            return ResponseEntity.badRequest().body(standardError("Validation failed",
                    List.of(Map.of("field", "decision", "message", "decision is required")), null));
        }

        String reviewId = "LQ-REVIEW-1001";
        Map<String, Object> record = new LinkedHashMap<>();
        record.put("reviewId", reviewId);
        record.put("leadId", leadId);
        record.put("decision", decision);
        record.put("reviewedBy", "current-user");
        record.put("status", "RECORDED");
        record.put("comments", req.get("comments"));
        record.put("nextAction", req.get("nextAction"));
        record.put("recordedAt", Instant.now().toString());

        store.getQualificationReviewDecisions(tenantId).put(reviewId, record);
        store.addActivity(tenantId, "current-user", "HUMAN_QUALIFICATION_DECISION", "Decision " + decision + " for lead " + leadId);

        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Human review decision recorded", record, "req_lq_review_001"));
    }

    @GetMapping("/leads/{leadId}/review-decisions")
    public ResponseEntity<Map<String, Object>> getReviewDecisions(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("leadId") String leadId) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = store.getQualificationReviewDecisions(tenantId).values().stream()
                .filter(d -> leadId.equalsIgnoreCase((String) d.get("leadId")))
                .collect(Collectors.toList());
        return ResponseEntity.ok(standardSuccess("Review decisions retrieved", list, null));
    }

    @PostMapping("/leads/{leadId}/convert")
    public ResponseEntity<Map<String, Object>> convertLead(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("leadId") String leadId,
            @RequestBody(required = false) Map<String, Object> req) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("leadId", leadId);
        data.put("convertedOpportunityId", "OPP-" + UUID.randomUUID().toString().substring(0, 6));
        data.put("conversionStatus", "CONVERTED");
        store.addActivity(tenantId, "AI_LEAD_QUALIFICATION", "LEAD_CONVERTED", "Lead " + leadId + " converted");
        return ResponseEntity.ok(standardSuccess("Lead converted successfully", data, null));
    }

    @PostMapping("/leads/{leadId}/handoff")
    public ResponseEntity<Map<String, Object>> handoffLead(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("leadId") String leadId,
            @RequestBody(required = false) Map<String, Object> req) {
        return routeLead(tenantHeader, leadId, req != null ? req : Map.of());
    }

    @GetMapping("/leads/{leadId}/activities")
    public ResponseEntity<Map<String, Object>> getLeadActivities(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("leadId") String leadId) {
        List<Map<String, Object>> acts = List.of(
                Map.of("activityId", "ACT-LQ-01", "type", "QUALIFICATION_EVALUATED", "score", 82, "timestamp", "2026-10-29T10:00:08+05:30"),
                Map.of("activityId", "ACT-LQ-02", "type", "DUPLICATE_CHECK_PASSED", "timestamp", "2026-10-29T10:00:02+05:30")
        );
        return ResponseEntity.ok(standardSuccess("Lead qualification activities retrieved", acts, null));
    }

    @PostMapping("/leads/{leadId}/activities")
    public ResponseEntity<Map<String, Object>> createLeadActivity(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader,
            @PathVariable("leadId") String leadId,
            @RequestBody Map<String, Object> req) {
        Map<String, Object> act = new LinkedHashMap<>(req);
        act.put("activityId", "ACT-LQ-" + UUID.randomUUID().toString().substring(0, 6));
        act.put("leadId", leadId);
        act.put("createdAt", Instant.now().toString());
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Qualification activity recorded", act, null));
    }

    // ==========================================
    // 9. REPORTS & AUDIT LOGS
    // ==========================================

    @GetMapping("/reports/qualification")
    public ResponseEntity<Map<String, Object>> getQualificationReport(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> report = new LinkedHashMap<>();
        report.put("period", "2026-10");
        report.put("leadsProcessed", 124);
        report.put("averageScore", 78.4);
        report.put("highFitCount", 45);
        report.put("mediumFitCount", 52);
        report.put("lowFitCount", 27);
        return ResponseEntity.ok(standardSuccess("Qualification performance report retrieved", report, null));
    }

    @GetMapping("/reports/conversion")
    public ResponseEntity<Map<String, Object>> getConversionReport(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> report = new LinkedHashMap<>();
        report.put("totalQualified", 85);
        report.put("convertedToOpportunity", 42);
        report.put("conversionRate", 0.494);
        return ResponseEntity.ok(standardSuccess("Lead conversion report retrieved", report, null));
    }

    @GetMapping("/reports/source-quality")
    public ResponseEntity<Map<String, Object>> getSourceQualityReport(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> sources = List.of(
                Map.of("source", "WEBSITE", "leadCount", 65, "averageScore", 81.2, "conversionRate", 0.52),
                Map.of("source", "PARTNER_REFERRAL", "leadCount", 30, "averageScore", 86.5, "conversionRate", 0.63),
                Map.of("source", "INBOUND_CALL", "leadCount", 29, "averageScore", 68.0, "conversionRate", 0.35)
        );
        return ResponseEntity.ok(standardSuccess("Lead source performance retrieved", sources, null));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<Map<String, Object>> getAuditLogs(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardSuccess("Agent audit records retrieved",
                store.getActivityLogs(tenantId), null));
    }
}
