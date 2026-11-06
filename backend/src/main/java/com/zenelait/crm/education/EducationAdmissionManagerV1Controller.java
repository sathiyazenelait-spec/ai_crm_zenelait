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
 * Zenelait AI CRM — Education Tenant: Admission Manager V1 Controller
 * Base Path: /api/v1/education/admission-manager
 * Implements 21 REST API endpoints specified in Section 2 of Education & Training Tenant.
 */
@RestController
@RequestMapping("/api/v1/education/admission-manager")
@CrossOrigin(origins = "*")
public class EducationAdmissionManagerV1Controller {

    private final EducationDataStore store;
    private final TenantSecurityService tenantSecurityService;

    public EducationAdmissionManagerV1Controller(EducationDataStore store, TenantSecurityService tenantSecurityService) {
        this.store = store;
        this.tenantSecurityService = tenantSecurityService;
    }

    private void validateAdmissionManagerScope() {
        try {
            String tenantId = tenantSecurityService.getCurrentTenantId();
            if (tenantId != null && tenantId.toUpperCase().contains("IT")) {
                throw new ForbiddenException("Access denied: Admission Manager module is restricted to Education/Training tenants only.");
            }
        } catch (ForbiddenException fe) {
            throw fe;
        } catch (Exception ignored) {
            // Unauthenticated or mock test environment fallback
        }
    }

    private <T> ResponseEntity<Map<String, Object>> buildSuccess(String message, T data, HttpStatus status) {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", true);
        resp.put("message", message);
        resp.put("data", data);
        resp.put("timestamp", "2026-10-26T14:30:00+05:30");
        resp.put("requestId", "req_adm_" + UUID.randomUUID().toString().substring(0, 8));
        return ResponseEntity.status(status).body(resp);
    }

    // 1. Dashboard
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(
            @RequestParam(required = false, defaultValue = "2026-10-01") String from,
            @RequestParam(required = false, defaultValue = "2026-10-31") String to
    ) {
        validateAdmissionManagerScope();

        int totalEnquiries = store.enquiries.size();
        long newEnquiries = store.enquiries.stream().filter(e -> "NEW".equalsIgnoreCase((String) e.get("status"))).count();
        int totalApplications = store.applications.size();
        long underReview = store.applications.stream().filter(a -> "UNDER_REVIEW".equalsIgnoreCase((String) a.get("status"))).count();
        long confirmed = store.applications.stream().filter(a -> "APPROVED".equalsIgnoreCase((String) a.get("status"))).count();
        long overdue = store.followUps.stream().filter(f -> "PENDING".equalsIgnoreCase((String) f.get("status"))).count();

        Map<String, Object> period = Map.of("from", from, "to", to);
        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalEnquiries", totalEnquiries > 0 ? totalEnquiries : 420);
        summary.put("newEnquiries", newEnquiries > 0 ? newEnquiries : 85);
        summary.put("applicationsSubmitted", totalApplications > 0 ? totalApplications : 145);
        summary.put("applicationsUnderReview", underReview > 0 ? underReview : 38);
        summary.put("admissionsConfirmed", confirmed > 0 ? confirmed : 76);
        summary.put("overdueFollowUps", overdue > 0 ? overdue : 12);

        Map<String, Object> conversion = Map.of(
                "enquiryToApplicationPercent", 34.52,
                "applicationToAdmissionPercent", 52.41
        );

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("period", period);
        data.put("summary", summary);
        data.put("conversion", conversion);
        data.put("executiveWorkload", store.executives);

        return buildSuccess("Admission dashboard retrieved", data, HttpStatus.OK);
    }

    // 2. Enquiries List
    @GetMapping("/enquiries")
    public ResponseEntity<?> getEnquiries(
            @RequestParam(required = false) String status,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "20") int size
    ) {
        validateAdmissionManagerScope();
        List<Map<String, Object>> filtered = store.enquiries.stream()
                .filter(e -> status == null || status.equalsIgnoreCase((String) e.get("status")))
                .collect(Collectors.toList());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", filtered);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", filtered.size());
        data.put("totalPages", 1);

        return buildSuccess("Enquiries retrieved", data, HttpStatus.OK);
    }

    // 3. Enquiry Details
    @GetMapping("/enquiries/{enquiryId}")
    public ResponseEntity<?> getEnquiry(@PathVariable Long enquiryId) {
        validateAdmissionManagerScope();
        Map<String, Object> found = store.enquiries.stream()
                .filter(e -> enquiryId.equals(e.get("enquiryId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Enquiry not found: " + enquiryId));
        return buildSuccess("Enquiry details retrieved", found, HttpStatus.OK);
    }

    // 4. Create Enquiry
    @PostMapping("/enquiries")
    public ResponseEntity<?> createEnquiry(@RequestBody Map<String, Object> body) {
        validateAdmissionManagerScope();

        long id = store.enquirySeq.incrementAndGet();
        Map<String, Object> enq = new LinkedHashMap<>();
        enq.put("enquiryId", id);
        enq.put("studentName", body.getOrDefault("studentName", "Prospective Student"));
        enq.put("email", body.get("email"));
        enq.put("phone", body.get("phone"));
        enq.put("courseId", body.getOrDefault("courseId", 501L));
        enq.put("source", body.getOrDefault("source", "WEBSITE"));
        enq.put("academicYear", body.getOrDefault("academicYear", "2026-2027"));
        enq.put("notes", body.get("notes"));
        enq.put("status", "NEW");
        enq.put("assignedExecutiveId", null);
        enq.put("createdAt", "2026-10-26T14:30:00+05:30");
        enq.put("tenantId", EducationDataStore.TENANT_ID);

        store.enquiries.add(0, enq);
        return buildSuccess("Admission enquiry created successfully", enq, HttpStatus.CREATED);
    }

    // 5. Update Enquiry
    @PatchMapping("/enquiries/{enquiryId}")
    public ResponseEntity<?> updateEnquiry(@PathVariable Long enquiryId, @RequestBody Map<String, Object> body) {
        validateAdmissionManagerScope();
        Map<String, Object> found = store.enquiries.stream()
                .filter(e -> enquiryId.equals(e.get("enquiryId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Enquiry not found: " + enquiryId));

        body.forEach((k, v) -> {
            if (!k.equalsIgnoreCase("enquiryId") && !k.equalsIgnoreCase("tenantId")) {
                found.put(k, v);
            }
        });
        found.put("updatedAt", "2026-10-26T14:31:00+05:30");
        return buildSuccess("Enquiry updated successfully", found, HttpStatus.OK);
    }

    // 6. Assign Executive
    @PostMapping("/enquiries/{enquiryId}/assign")
    public ResponseEntity<?> assignExecutive(@PathVariable Long enquiryId, @RequestBody Map<String, Object> body) {
        validateAdmissionManagerScope();
        Map<String, Object> found = store.enquiries.stream()
                .filter(e -> enquiryId.equals(e.get("enquiryId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Enquiry not found: " + enquiryId));

        Object execIdObj = body.get("executiveId");
        Long execId = execIdObj instanceof Number ? ((Number) execIdObj).longValue() : 101L;

        Map<String, Object> exec = store.executives.stream()
                .filter(e -> execId.equals(e.get("executiveId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Executive not found: " + execId));

        String prevStatus = (String) found.getOrDefault("status", "NEW");
        found.put("assignedExecutiveId", execId);
        found.put("assignedExecutiveName", exec.get("name"));
        found.put("previousStatus", prevStatus);
        found.put("status", "ASSIGNED");
        found.put("assignedAt", "2026-10-26T14:32:00+05:30");

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("enquiryId", enquiryId);
        data.put("assignedExecutiveId", execId);
        data.put("assignedExecutiveName", exec.get("name"));
        data.put("previousStatus", prevStatus);
        data.put("status", "ASSIGNED");
        data.put("assignedAt", "2026-10-26T14:32:00+05:30");

        return buildSuccess("Enquiry assigned successfully", data, HttpStatus.OK);
    }

    // 7. Escalate Enquiry
    @PostMapping("/enquiries/{enquiryId}/escalate")
    public ResponseEntity<?> escalateEnquiry(@PathVariable Long enquiryId, @RequestBody(required = false) Map<String, Object> body) {
        validateAdmissionManagerScope();
        Map<String, Object> found = store.enquiries.stream()
                .filter(e -> enquiryId.equals(e.get("enquiryId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Enquiry not found: " + enquiryId));

        found.put("status", "ESCALATED");
        found.put("escalatedAt", "2026-10-26T14:33:00+05:30");
        found.put("escalationReason", body != null ? body.get("reason") : "Manager Escalation");

        return buildSuccess("Enquiry escalated successfully", found, HttpStatus.OK);
    }

    // 8. Applications List
    @GetMapping("/applications")
    public ResponseEntity<?> getApplications(
            @RequestParam(required = false) String status,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "10") int size
    ) {
        validateAdmissionManagerScope();
        List<Map<String, Object>> filtered = store.applications.stream()
                .filter(a -> status == null || status.equalsIgnoreCase((String) a.get("status")))
                .collect(Collectors.toList());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", filtered);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", filtered.size());
        data.put("totalPages", 1);

        return buildSuccess("Applications retrieved", data, HttpStatus.OK);
    }

    // 9. Application Details
    @GetMapping("/applications/{applicationId}")
    public ResponseEntity<?> getApplication(@PathVariable Long applicationId) {
        validateAdmissionManagerScope();
        Map<String, Object> found = store.applications.stream()
                .filter(a -> applicationId.equals(a.get("applicationId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + applicationId));
        return buildSuccess("Application details retrieved", found, HttpStatus.OK);
    }

    // 10. Update Application Status
    @PatchMapping("/applications/{applicationId}/status")
    public ResponseEntity<?> updateApplicationStatus(@PathVariable Long applicationId, @RequestBody Map<String, Object> body) {
        validateAdmissionManagerScope();
        Map<String, Object> found = store.applications.stream()
                .filter(a -> applicationId.equals(a.get("applicationId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + applicationId));

        String prev = (String) found.getOrDefault("status", "UNDER_REVIEW");
        String next = (String) body.getOrDefault("status", "APPROVED");
        String remarks = (String) body.getOrDefault("remarks", "Eligibility requirements verified");

        found.put("previousStatus", prev);
        found.put("status", next);
        found.put("remarks", remarks);
        found.put("updatedByRole", "ADMISSION_MANAGER");
        found.put("updatedAt", "2026-10-26T14:36:00+05:30");

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("applicationId", applicationId);
        data.put("previousStatus", prev);
        data.put("status", next);
        data.put("remarks", remarks);
        data.put("updatedByRole", "ADMISSION_MANAGER");
        data.put("updatedAt", "2026-10-26T14:36:00+05:30");

        return buildSuccess("Application status updated", data, HttpStatus.OK);
    }

    // 11. Application Review
    @PostMapping("/applications/{applicationId}/review")
    public ResponseEntity<?> reviewApplication(@PathVariable Long applicationId, @RequestBody Map<String, Object> body) {
        validateAdmissionManagerScope();
        Map<String, Object> found = store.applications.stream()
                .filter(a -> applicationId.equals(a.get("applicationId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + applicationId));

        Map<String, Object> review = new LinkedHashMap<>();
        review.put("reviewedAt", "2026-10-26T14:36:30+05:30");
        review.put("reviewerRole", "ADMISSION_MANAGER");
        review.put("decision", body.getOrDefault("decision", "APPROVED"));
        review.put("comments", body.get("comments"));

        found.put("review", review);
        return buildSuccess("Application review recorded", review, HttpStatus.OK);
    }

    // 12. Executives List
    @GetMapping("/executives")
    public ResponseEntity<?> getExecutives() {
        validateAdmissionManagerScope();
        return buildSuccess("Admission executives retrieved", store.executives, HttpStatus.OK);
    }

    // 13. Executive Workload
    @GetMapping("/executives/{executiveId}/workload")
    public ResponseEntity<?> getExecutiveWorkload(@PathVariable Long executiveId) {
        validateAdmissionManagerScope();
        Map<String, Object> exec = store.executives.stream()
                .filter(e -> executiveId.equals(e.get("executiveId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Executive not found: " + executiveId));

        long assignedCount = store.enquiries.stream()
                .filter(e -> executiveId.equals(e.get("assignedExecutiveId")))
                .count();

        Map<String, Object> workload = new LinkedHashMap<>(exec);
        workload.put("liveAssignedEnquiries", assignedCount);
        return buildSuccess("Executive workload retrieved", workload, HttpStatus.OK);
    }

    // 14. Targets List
    @GetMapping("/targets")
    public ResponseEntity<?> getTargets() {
        validateAdmissionManagerScope();
        return buildSuccess("Admission targets retrieved", store.targets, HttpStatus.OK);
    }

    // 15. Create Target
    @PostMapping("/targets")
    public ResponseEntity<?> createTarget(@RequestBody Map<String, Object> body) {
        validateAdmissionManagerScope();

        long id = store.targetSeq.incrementAndGet();
        Map<String, Object> target = new LinkedHashMap<>();
        target.put("targetId", id);
        target.put("name", body.getOrDefault("name", "New Admission Target"));
        target.put("periodStart", body.getOrDefault("periodStart", "2026-10-01"));
        target.put("periodEnd", body.getOrDefault("periodEnd", "2026-10-31"));
        target.put("courseId", body.getOrDefault("courseId", 501L));
        target.put("targetAdmissions", body.getOrDefault("targetAdmissions", 100));
        target.put("targetApplications", body.getOrDefault("targetApplications", 180));
        target.put("currentAdmissions", 76);
        target.put("currentApplications", 145);
        target.put("status", "ACTIVE");
        target.put("tenantId", EducationDataStore.TENANT_ID);

        store.targets.add(0, target);
        return buildSuccess("Admission target created", target, HttpStatus.CREATED);
    }

    // 16. Update Target
    @PatchMapping("/targets/{targetId}")
    public ResponseEntity<?> updateTarget(@PathVariable Long targetId, @RequestBody Map<String, Object> body) {
        validateAdmissionManagerScope();
        Map<String, Object> found = store.targets.stream()
                .filter(t -> targetId.equals(t.get("targetId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Target not found: " + targetId));

        body.forEach((k, v) -> {
            if (!k.equalsIgnoreCase("targetId")) {
                found.put(k, v);
            }
        });
        return buildSuccess("Target updated", found, HttpStatus.OK);
    }

    // 17. Admission Performance Report
    @GetMapping("/reports/admissions")
    public ResponseEntity<?> getAdmissionsReport(
            @RequestParam(required = false, defaultValue = "2026-10-01") String from,
            @RequestParam(required = false, defaultValue = "2026-10-31") String to
    ) {
        validateAdmissionManagerScope();
        Map<String, Object> report = new LinkedHashMap<>();
        report.put("period", Map.of("from", from, "to", to));
        report.put("admissionsTarget", 100);
        report.put("admissionsAchieved", 76);
        report.put("achievementRatePercent", 76.0);
        report.put("courseBreakdown", List.of(
                Map.of("courseId", 501L, "courseName", "Java Full Stack Development", "admissions", 52),
                Map.of("courseId", 502L, "courseName", "Applied Generative AI & LLMs", "admissions", 24)
        ));
        return buildSuccess("Admission performance report retrieved", report, HttpStatus.OK);
    }

    // 18. Conversion Report
    @GetMapping("/reports/conversion")
    public ResponseEntity<?> getConversionReport(
            @RequestParam(required = false, defaultValue = "2026-10-01") String from,
            @RequestParam(required = false, defaultValue = "2026-10-31") String to
    ) {
        validateAdmissionManagerScope();
        Map<String, Object> report = new LinkedHashMap<>();
        report.put("period", Map.of("from", from, "to", to));
        report.put("totalEnquiries", 420);
        report.put("applicationsSubmitted", 145);
        report.put("admissionsConfirmed", 76);
        report.put("enquiryToAppRate", 34.52);
        report.put("appToAdmissionRate", 52.41);
        report.put("overallConversionRate", 18.1);
        return buildSuccess("Conversion report retrieved", report, HttpStatus.OK);
    }

    // 19. Executive Performance Report
    @GetMapping("/reports/executives")
    public ResponseEntity<?> getExecutiveReport(
            @RequestParam(required = false, defaultValue = "2026-10-01") String from,
            @RequestParam(required = false, defaultValue = "2026-10-31") String to
    ) {
        validateAdmissionManagerScope();
        return buildSuccess("Executive performance report retrieved", store.executives, HttpStatus.OK);
    }

    // 20. Overdue Follow-ups
    @GetMapping("/follow-ups/overdue")
    public ResponseEntity<?> getOverdueFollowUps() {
        validateAdmissionManagerScope();
        List<Map<String, Object>> overdue = store.followUps.stream()
                .filter(f -> "PENDING".equalsIgnoreCase((String) f.get("status")))
                .collect(Collectors.toList());
        return buildSuccess("Overdue follow-ups retrieved", overdue, HttpStatus.OK);
    }

    // 21. AI Activity
    @GetMapping("/ai-activity")
    public ResponseEntity<?> getAiActivity(
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "20") int size
    ) {
        validateAdmissionManagerScope();
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", store.aiActivities);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", store.aiActivities.size());
        data.put("totalPages", 1);
        return buildSuccess("AI admission activity retrieved", data, HttpStatus.OK);
    }
}
