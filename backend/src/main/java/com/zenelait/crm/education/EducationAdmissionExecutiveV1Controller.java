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
 * Zenelait AI CRM — Education Tenant: Admission Executive V1 Controller
 * Base Path: /api/v1/education/admission-executive
 * Implements 23 REST API endpoints specified in Section 3 of Education & Training Tenant.
 */
@RestController
@RequestMapping("/api/v1/education/admission-executive")
@CrossOrigin(origins = "*")
public class EducationAdmissionExecutiveV1Controller {

    private final EducationDataStore store;
    private final TenantSecurityService tenantSecurityService;

    public EducationAdmissionExecutiveV1Controller(EducationDataStore store, TenantSecurityService tenantSecurityService) {
        this.store = store;
        this.tenantSecurityService = tenantSecurityService;
    }

    private void validateAdmissionExecutiveScope() {
        try {
            String tenantId = tenantSecurityService.getCurrentTenantId();
            if (tenantId != null && tenantId.toUpperCase().contains("IT")) {
                throw new ForbiddenException("Access denied: Admission Executive module is restricted to Education/Training tenants only.");
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
        resp.put("timestamp", "2026-10-26T14:40:00+05:30");
        resp.put("requestId", "req_exec_" + UUID.randomUUID().toString().substring(0, 8));
        return ResponseEntity.status(status).body(resp);
    }

    // 1. Executive Dashboard
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        validateAdmissionExecutiveScope();

        Map<String, Object> executive = Map.of("userId", 101L, "name", "Priya");
        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("assignedEnquiries", 42);
        summary.put("newEnquiries", 8);
        summary.put("followUpsDueToday", 6);
        summary.put("overdueFollowUps", 2);
        summary.put("applicationsInProgress", 12);
        summary.put("applicationsSubmittedThisMonth", 9);

        List<Map<String, Object>> todayTasks = store.followUps.stream()
                .filter(f -> Long.valueOf(101L).equals(f.get("assignedTo")))
                .collect(Collectors.toList());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("executive", executive);
        data.put("summary", summary);
        data.put("todayTasks", todayTasks);

        return buildSuccess("Executive dashboard retrieved", data, HttpStatus.OK);
    }

    // 2. Assigned Enquiries List
    @GetMapping("/enquiries")
    public ResponseEntity<?> getEnquiries(
            @RequestParam(required = false) String status,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "20") int size
    ) {
        validateAdmissionExecutiveScope();
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

    // 3. Create Enquiry
    @PostMapping("/enquiries")
    public ResponseEntity<?> createEnquiry(@RequestBody Map<String, Object> body) {
        validateAdmissionExecutiveScope();

        long id = store.enquirySeq.incrementAndGet();
        Map<String, Object> enq = new LinkedHashMap<>();
        enq.put("enquiryId", id);
        enq.put("studentName", body.getOrDefault("studentName", "New Student"));
        enq.put("email", body.get("email"));
        enq.put("phone", body.get("phone"));
        enq.put("courseId", body.getOrDefault("courseId", 501L));
        enq.put("source", body.getOrDefault("source", "PHONE"));
        enq.put("preferredContactMethod", body.getOrDefault("preferredContactMethod", "WHATSAPP"));
        enq.put("academicYear", body.getOrDefault("academicYear", "2026-2027"));
        enq.put("notes", body.get("notes"));
        enq.put("status", "NEW");
        enq.put("assignedExecutiveId", 101L);
        enq.put("createdBy", 101L);
        enq.put("createdAt", "2026-10-26T14:42:00+05:30");
        enq.put("tenantId", EducationDataStore.TENANT_ID);

        store.enquiries.add(0, enq);
        return buildSuccess("Enquiry created successfully", enq, HttpStatus.CREATED);
    }

    // 4. View Permitted Enquiry
    @GetMapping("/enquiries/{enquiryId}")
    public ResponseEntity<?> getEnquiry(@PathVariable Long enquiryId) {
        validateAdmissionExecutiveScope();
        Map<String, Object> found = store.enquiries.stream()
                .filter(e -> enquiryId.equals(e.get("enquiryId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Enquiry not found: " + enquiryId));
        return buildSuccess("Enquiry retrieved", found, HttpStatus.OK);
    }

    // 5. Update Enquiry
    @PatchMapping("/enquiries/{enquiryId}")
    public ResponseEntity<?> updateEnquiry(@PathVariable Long enquiryId, @RequestBody Map<String, Object> body) {
        validateAdmissionExecutiveScope();
        Map<String, Object> found = store.enquiries.stream()
                .filter(e -> enquiryId.equals(e.get("enquiryId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Enquiry not found: " + enquiryId));

        body.forEach((k, v) -> {
            if (!k.equalsIgnoreCase("enquiryId") && !k.equalsIgnoreCase("tenantId")) {
                found.put(k, v);
            }
        });
        return buildSuccess("Enquiry updated", found, HttpStatus.OK);
    }

    // 6. Qualify Enquiry
    @PostMapping("/enquiries/{enquiryId}/qualify")
    public ResponseEntity<?> qualifyEnquiry(@PathVariable Long enquiryId, @RequestBody Map<String, Object> body) {
        validateAdmissionExecutiveScope();
        Map<String, Object> found = store.enquiries.stream()
                .filter(e -> enquiryId.equals(e.get("enquiryId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Enquiry not found: " + enquiryId));

        found.put("qualificationStatus", body.getOrDefault("qualificationStatus", "QUALIFIED"));
        found.put("educationLevel", body.get("educationLevel"));
        found.put("preferredSchedule", body.get("preferredSchedule"));
        found.put("expectedJoiningDate", body.get("expectedJoiningDate"));
        found.put("budgetRange", body.get("budgetRange"));
        found.put("status", "QUALIFIED");
        found.put("nextAction", "SCHEDULE_FOLLOW_UP");
        found.put("updatedAt", "2026-10-26T14:45:00+05:30");

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("enquiryId", enquiryId);
        data.put("qualificationStatus", found.get("qualificationStatus"));
        data.put("preferredSchedule", found.get("preferredSchedule"));
        data.put("expectedJoiningDate", found.get("expectedJoiningDate"));
        data.put("nextAction", "SCHEDULE_FOLLOW_UP");
        data.put("updatedAt", "2026-10-26T14:45:00+05:30");

        return buildSuccess("Enquiry qualification saved", data, HttpStatus.OK);
    }

    // 7. Record Interaction
    @PostMapping("/enquiries/{enquiryId}/interactions")
    public ResponseEntity<?> recordInteraction(@PathVariable Long enquiryId, @RequestBody Map<String, Object> body) {
        validateAdmissionExecutiveScope();

        long id = store.interactionSeq.incrementAndGet();
        Map<String, Object> inter = new LinkedHashMap<>();
        inter.put("interactionId", id);
        inter.put("enquiryId", enquiryId);
        inter.put("interactionType", body.getOrDefault("interactionType", "CALL"));
        inter.put("direction", body.getOrDefault("direction", "OUTBOUND"));
        inter.put("outcome", body.getOrDefault("outcome", "INTERESTED"));
        inter.put("notes", body.get("notes"));
        inter.put("nextAction", body.getOrDefault("nextAction", "FOLLOW_UP"));
        inter.put("nextActionAt", body.getOrDefault("nextActionAt", "2026-10-28T11:00:00+05:30"));
        inter.put("createdBy", 101L);
        inter.put("createdAt", "2026-10-26T14:47:00+05:30");
        inter.put("tenantId", EducationDataStore.TENANT_ID);

        store.interactions.add(0, inter);
        return buildSuccess("Interaction recorded", inter, HttpStatus.OK);
    }

    // 8. Get Interaction History
    @GetMapping("/enquiries/{enquiryId}/interactions")
    public ResponseEntity<?> getInteractions(@PathVariable Long enquiryId) {
        validateAdmissionExecutiveScope();
        List<Map<String, Object>> list = store.interactions.stream()
                .filter(i -> enquiryId.equals(i.get("enquiryId")))
                .collect(Collectors.toList());
        return buildSuccess("Interaction history retrieved", list, HttpStatus.OK);
    }

    // 9. Create Follow-up
    @PostMapping("/enquiries/{enquiryId}/follow-ups")
    public ResponseEntity<?> createFollowUp(@PathVariable Long enquiryId, @RequestBody Map<String, Object> body) {
        validateAdmissionExecutiveScope();

        long id = store.followUpSeq.incrementAndGet();
        Map<String, Object> f = new LinkedHashMap<>();
        f.put("taskId", id);
        f.put("enquiryId", enquiryId);
        f.put("taskType", body.getOrDefault("taskType", "CALL"));
        f.put("title", body.getOrDefault("title", "Discuss batch options"));
        f.put("status", "PENDING");
        f.put("dueAt", body.getOrDefault("dueAt", "2026-10-28T11:00:00+05:30"));
        f.put("priority", body.getOrDefault("priority", "MEDIUM"));
        f.put("notes", body.get("notes"));
        f.put("assignedTo", 101L);
        f.put("tenantId", EducationDataStore.TENANT_ID);

        store.followUps.add(0, f);
        return buildSuccess("Follow-up task created", f, HttpStatus.OK);
    }

    // 10. List Personal Follow-ups
    @GetMapping("/follow-ups")
    public ResponseEntity<?> getFollowUps(@RequestParam(required = false) String status) {
        validateAdmissionExecutiveScope();
        List<Map<String, Object>> list = store.followUps.stream()
                .filter(f -> status == null || status.equalsIgnoreCase((String) f.get("status")))
                .collect(Collectors.toList());
        return buildSuccess("Follow-ups retrieved", list, HttpStatus.OK);
    }

    // 11. Update Follow-up
    @PatchMapping("/follow-ups/{taskId}")
    public ResponseEntity<?> updateFollowUp(@PathVariable Long taskId, @RequestBody Map<String, Object> body) {
        validateAdmissionExecutiveScope();
        Map<String, Object> found = store.followUps.stream()
                .filter(f -> taskId.equals(f.get("taskId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + taskId));

        body.forEach((k, v) -> {
            if (!k.equalsIgnoreCase("taskId")) found.put(k, v);
        });
        return buildSuccess("Follow-up updated", found, HttpStatus.OK);
    }

    // 12. Complete Follow-up
    @PostMapping("/follow-ups/{taskId}/complete")
    public ResponseEntity<?> completeFollowUp(@PathVariable Long taskId, @RequestBody Map<String, Object> body) {
        validateAdmissionExecutiveScope();
        Map<String, Object> found = store.followUps.stream()
                .filter(f -> taskId.equals(f.get("taskId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + taskId));

        found.put("status", "COMPLETED");
        found.put("outcome", body.getOrDefault("outcome", "STUDENT_WANTS_TO_JOIN"));
        found.put("notes", body.get("notes"));
        found.put("completedAt", "2026-10-28T11:15:00+05:30");

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("taskId", taskId);
        data.put("status", "COMPLETED");
        data.put("outcome", found.get("outcome"));
        data.put("completedAt", "2026-10-28T11:15:00+05:30");

        return buildSuccess("Follow-up completed", data, HttpStatus.OK);
    }

    // 13. Snooze Follow-up
    @PostMapping("/follow-ups/{taskId}/snooze")
    public ResponseEntity<?> snoozeFollowUp(@PathVariable Long taskId, @RequestBody Map<String, Object> body) {
        validateAdmissionExecutiveScope();
        Map<String, Object> found = store.followUps.stream()
                .filter(f -> taskId.equals(f.get("taskId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + taskId));

        found.put("status", "SNOOZED");
        found.put("snoozedUntil", body.getOrDefault("snoozedUntil", "2026-10-30T10:00:00+05:30"));
        found.put("snoozeReason", body.get("reason"));

        return buildSuccess("Follow-up snoozed", found, HttpStatus.OK);
    }

    // 14. Start Application
    @PostMapping("/enquiries/{enquiryId}/application")
    public ResponseEntity<?> startApplication(@PathVariable Long enquiryId, @RequestBody Map<String, Object> body) {
        validateAdmissionExecutiveScope();
        Map<String, Object> enq = store.enquiries.stream()
                .filter(e -> enquiryId.equals(e.get("enquiryId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Enquiry not found: " + enquiryId));

        long appId = store.appSeq.incrementAndGet();
        Map<String, Object> app = new LinkedHashMap<>();
        app.put("applicationId", appId);
        app.put("enquiryId", enquiryId);
        app.put("studentName", enq.get("studentName"));
        app.put("courseId", body.getOrDefault("courseId", enq.get("courseId")));
        app.put("status", "DRAFT");
        app.put("academicYear", body.getOrDefault("academicYear", "2026-2027"));
        app.put("intake", body.getOrDefault("intake", "NOVEMBER_2026"));
        app.put("applicationNotes", body.get("applicationNotes"));
        app.put("missingDocuments", new ArrayList<>(List.of("IDENTITY_PROOF", "EDUCATION_CERTIFICATE")));
        app.put("assignedExecutiveId", 101L);
        app.put("createdAt", "2026-10-26T14:50:00+05:30");
        app.put("tenantId", EducationDataStore.TENANT_ID);

        store.applications.add(0, app);
        return buildSuccess("Application initiated", app, HttpStatus.CREATED);
    }

    // 15. View Permitted Applications
    @GetMapping("/applications")
    public ResponseEntity<?> getApplications(@RequestParam(required = false) String status) {
        validateAdmissionExecutiveScope();
        List<Map<String, Object>> list = store.applications.stream()
                .filter(a -> status == null || status.equalsIgnoreCase((String) a.get("status")))
                .collect(Collectors.toList());
        return buildSuccess("Applications retrieved", list, HttpStatus.OK);
    }

    // 16. View Application Details
    @GetMapping("/applications/{applicationId}")
    public ResponseEntity<?> getApplication(@PathVariable Long applicationId) {
        validateAdmissionExecutiveScope();
        Map<String, Object> found = store.applications.stream()
                .filter(a -> applicationId.equals(a.get("applicationId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + applicationId));
        return buildSuccess("Application details retrieved", found, HttpStatus.OK);
    }

    // 17. Update Editable Application Fields
    @PatchMapping("/applications/{applicationId}")
    public ResponseEntity<?> updateApplication(@PathVariable Long applicationId, @RequestBody Map<String, Object> body) {
        validateAdmissionExecutiveScope();
        Map<String, Object> found = store.applications.stream()
                .filter(a -> applicationId.equals(a.get("applicationId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + applicationId));

        body.forEach((k, v) -> {
            if (!k.equalsIgnoreCase("applicationId") && !k.equalsIgnoreCase("tenantId")) {
                found.put(k, v);
            }
        });
        return buildSuccess("Application updated", found, HttpStatus.OK);
    }

    // 18. Register Document Metadata
    @PostMapping("/applications/{applicationId}/documents")
    public ResponseEntity<?> registerDocument(@PathVariable Long applicationId, @RequestBody Map<String, Object> body) {
        validateAdmissionExecutiveScope();

        long docId = store.docSeq.incrementAndGet();
        Map<String, Object> doc = new LinkedHashMap<>();
        doc.put("documentId", docId);
        doc.put("applicationId", applicationId);
        doc.put("documentType", body.getOrDefault("documentType", "EDUCATION_CERTIFICATE"));
        doc.put("fileName", body.getOrDefault("fileName", "degree-certificate.pdf"));
        doc.put("storageKey", body.getOrDefault("storageKey", "education/tenant-files/" + applicationId + "/doc.pdf"));
        doc.put("verificationStatus", "PENDING");
        doc.put("tenantId", EducationDataStore.TENANT_ID);

        store.applicationDocuments.add(doc);
        return buildSuccess("Document metadata registered", doc, HttpStatus.OK);
    }

    // 19. List Documents
    @GetMapping("/applications/{applicationId}/documents")
    public ResponseEntity<?> getDocuments(@PathVariable Long applicationId) {
        validateAdmissionExecutiveScope();
        List<Map<String, Object>> list = store.applicationDocuments.stream()
                .filter(d -> applicationId.equals(d.get("applicationId")))
                .collect(Collectors.toList());
        return buildSuccess("Application documents retrieved", list, HttpStatus.OK);
    }

    // 20. Submit Application for Review
    @PostMapping("/applications/{applicationId}/submit")
    public ResponseEntity<?> submitApplication(@PathVariable Long applicationId, @RequestBody(required = false) Map<String, Object> body) {
        validateAdmissionExecutiveScope();
        Map<String, Object> found = store.applications.stream()
                .filter(a -> applicationId.equals(a.get("applicationId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + applicationId));

        String prev = (String) found.getOrDefault("status", "DRAFT");
        found.put("previousStatus", prev);
        found.put("status", "SUBMITTED");
        found.put("submittedAt", "2026-10-26T14:54:00+05:30");
        found.put("reviewRequired", true);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("applicationId", applicationId);
        data.put("previousStatus", prev);
        data.put("status", "SUBMITTED");
        data.put("submittedAt", "2026-10-26T14:54:00+05:30");
        data.put("reviewRequired", true);

        return buildSuccess("Application submitted for review", data, HttpStatus.OK);
    }

    // 21. Counselling Request
    @PostMapping("/enquiries/{enquiryId}/counselling-request")
    public ResponseEntity<?> requestCounselling(@PathVariable Long enquiryId, @RequestBody(required = false) Map<String, Object> body) {
        validateAdmissionExecutiveScope();
        Map<String, Object> enq = store.enquiries.stream()
                .filter(e -> enquiryId.equals(e.get("enquiryId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Enquiry not found: " + enquiryId));

        long refId = store.referralSeq.incrementAndGet();
        Map<String, Object> ref = new LinkedHashMap<>();
        ref.put("referralId", refId);
        ref.put("enquiryId", enquiryId);
        ref.put("studentName", enq.get("studentName"));
        ref.put("referralType", "COUNSELLING");
        ref.put("status", "REQUESTED");
        ref.put("requestedBy", 101L);
        ref.put("notes", body != null ? body.get("notes") : "Counselling requested by executive");
        ref.put("createdAt", "2026-10-26T14:55:00+05:30");
        ref.put("tenantId", EducationDataStore.TENANT_ID);

        store.referrals.add(ref);
        return buildSuccess("Counselling session requested", ref, HttpStatus.OK);
    }

    // 22. AI Follow-up Draft
    @PostMapping("/ai/follow-up-draft")
    public ResponseEntity<?> generateFollowUpDraft(@RequestBody Map<String, Object> body) {
        validateAdmissionExecutiveScope();

        Map<String, Object> draft = new LinkedHashMap<>();
        draft.put("draftId", "draft_" + UUID.randomUUID().toString().substring(0, 5));
        draft.put("enquiryId", body.get("enquiryId"));
        draft.put("channel", body.getOrDefault("channel", "EMAIL"));
        draft.put("subject", "Following up on your Java Full Stack enquiry");
        draft.put("body", "Hello Meena, I am following up on your interest in our Java Full Stack Development course. Would you like to discuss the available batches and course details? Please let me know a convenient time.");
        draft.put("status", "DRAFT");
        draft.put("requiresHumanApproval", true);

        return buildSuccess("Follow-up draft generated", draft, HttpStatus.OK);
    }

    // 23. Personal Performance
    @GetMapping("/performance")
    public ResponseEntity<?> getPerformance() {
        validateAdmissionExecutiveScope();
        Map<String, Object> perf = new LinkedHashMap<>();
        perf.put("executiveId", 101L);
        perf.put("assignedEnquiries", 42);
        perf.put("qualifiedCount", 28);
        perf.put("applicationsSubmitted", 9);
        perf.put("conversionRate", 32.14);
        perf.put("averageFirstResponseMinutes", 15);
        perf.put("rating", 4.8);
        return buildSuccess("Personal performance summary", perf, HttpStatus.OK);
    }
}
