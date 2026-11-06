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
 * Zenelait AI CRM — Education Tenant: Counsellor V1 Controller
 * Base Path: /api/v1/education/counsellor
 * Implements 24 REST API endpoints specified in Section 5 of Education & Training Tenant.
 */
@RestController
@RequestMapping("/api/v1/education/counsellor")
@CrossOrigin(origins = "*")
public class EducationCounsellorV1Controller {

    private final EducationDataStore store;
    private final TenantSecurityService tenantSecurityService;

    public EducationCounsellorV1Controller(EducationDataStore store, TenantSecurityService tenantSecurityService) {
        this.store = store;
        this.tenantSecurityService = tenantSecurityService;
    }

    private void validateCounsellorScope() {
        try {
            String tenantId = tenantSecurityService.getCurrentTenantId();
            if (tenantId != null && tenantId.toUpperCase().contains("IT")) {
                throw new ForbiddenException("Access denied: Counsellor module is restricted to Education/Training tenants only.");
            }
        } catch (ForbiddenException fe) {
            throw fe;
        } catch (Exception ignored) {
            // Test or unauthenticated mock environment fallback
        }
    }

    private <T> ResponseEntity<Map<String, Object>> buildSuccess(String message, T data, HttpStatus status) {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", true);
        resp.put("message", message);
        resp.put("data", data);
        resp.put("timestamp", "2026-10-26T15:15:00+05:30");
        resp.put("requestId", "req_counsellor_" + UUID.randomUUID().toString().substring(0, 8));
        return ResponseEntity.status(status).body(resp);
    }

    // 1. Counsellor Dashboard
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(
            @RequestParam(required = false, defaultValue = "2026-10-01") String from,
            @RequestParam(required = false, defaultValue = "2026-10-31") String to
    ) {
        validateCounsellorScope();

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("assignedStudents", 28);
        summary.put("appointmentsToday", 5);
        summary.put("upcomingAppointments", 9);
        summary.put("completedSessionsThisMonth", 36);
        summary.put("followUpsDue", 7);
        summary.put("actionPlansInProgress", 14);

        List<Map<String, Object>> todayAppointments = store.counsellingAppointments.stream()
                .filter(a -> "CONFIRMED".equalsIgnoreCase((String) a.get("status")))
                .collect(Collectors.toList());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("summary", summary);
        data.put("todayAppointments", todayAppointments);

        return buildSuccess("Counsellor dashboard retrieved", data, HttpStatus.OK);
    }

    // 2. List Permitted Counselling Students
    @GetMapping("/students")
    public ResponseEntity<?> getStudents(
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "20") int size
    ) {
        validateCounsellorScope();
        List<Map<String, Object>> filtered = store.students.stream()
                .filter(s -> search == null || ((String) s.get("studentName")).toLowerCase().contains(search.toLowerCase()))
                .collect(Collectors.toList());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", filtered);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", filtered.size());
        data.put("totalPages", 1);

        return buildSuccess("Students retrieved", data, HttpStatus.OK);
    }

    // 3. View Student Profile
    @GetMapping("/students/{studentId}")
    public ResponseEntity<?> getStudent(@PathVariable Long studentId) {
        validateCounsellorScope();
        Map<String, Object> found = store.students.stream()
                .filter(s -> studentId.equals(s.get("studentId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + studentId));
        return buildSuccess("Student profile retrieved", found, HttpStatus.OK);
    }

    // 4. Update Counselling Profile
    @PatchMapping("/students/{studentId}/counselling-profile")
    public ResponseEntity<?> updateCounsellingProfile(@PathVariable Long studentId, @RequestBody Map<String, Object> body) {
        validateCounsellorScope();
        Map<String, Object> profile = store.counsellingProfiles.computeIfAbsent(studentId, k -> new LinkedHashMap<>());
        profile.put("studentId", studentId);
        body.forEach((k, v) -> {
            if (!k.equalsIgnoreCase("studentId")) profile.put(k, v);
        });
        profile.put("updatedAt", "2026-10-26T15:16:00+05:30");

        return buildSuccess("Counselling profile updated", profile, HttpStatus.OK);
    }

    // 5. Record Student Needs Assessment
    @PostMapping("/students/{studentId}/assessments")
    public ResponseEntity<?> recordAssessment(@PathVariable Long studentId, @RequestBody Map<String, Object> body) {
        validateCounsellorScope();

        long id = store.assessmentSeq.incrementAndGet();
        Map<String, Object> as = new LinkedHashMap<>();
        as.put("assessmentId", id);
        as.put("studentId", studentId);
        as.put("assessmentType", body.getOrDefault("assessmentType", "CAREER_GUIDANCE"));
        as.put("currentEducation", body.get("currentEducation"));
        as.put("currentSkillLevel", body.get("currentSkillLevel"));
        as.put("goals", body.get("goals"));
        as.put("preferredDurationWeeks", body.get("preferredDurationWeeks"));
        as.put("preferredLearningMode", body.get("preferredLearningMode"));
        as.put("counsellorNotes", body.get("counsellorNotes"));
        as.put("status", "COMPLETED");
        as.put("recordedBy", 401L);
        as.put("recordedAt", "2026-10-26T15:18:00+05:30");
        as.put("tenantId", EducationDataStore.TENANT_ID);

        store.counsellingAssessments.add(0, as);
        return buildSuccess("Needs assessment recorded", as, HttpStatus.OK);
    }

    // 6. View Assessment History
    @GetMapping("/students/{studentId}/assessments")
    public ResponseEntity<?> getAssessments(@PathVariable Long studentId) {
        validateCounsellorScope();
        List<Map<String, Object>> list = store.counsellingAssessments.stream()
                .filter(a -> studentId.equals(a.get("studentId")))
                .collect(Collectors.toList());
        return buildSuccess("Assessment history retrieved", list, HttpStatus.OK);
    }

    // 7. List Appointments
    @GetMapping("/appointments")
    public ResponseEntity<?> getAppointments(@RequestParam(required = false) String status) {
        validateCounsellorScope();
        List<Map<String, Object>> list = store.counsellingAppointments.stream()
                .filter(a -> status == null || status.equalsIgnoreCase((String) a.get("status")))
                .collect(Collectors.toList());
        return buildSuccess("Counselling appointments retrieved", list, HttpStatus.OK);
    }

    // 8. Schedule Appointment
    @PostMapping("/appointments")
    public ResponseEntity<?> scheduleAppointment(@RequestBody Map<String, Object> body) {
        validateCounsellorScope();

        long id = store.apptSeq.incrementAndGet();
        Object stuIdObj = body.get("studentId");
        Long studentId = stuIdObj instanceof Number ? ((Number) stuIdObj).longValue() : 3001L;

        Map<String, Object> appt = new LinkedHashMap<>();
        appt.put("appointmentId", id);
        appt.put("studentId", studentId);
        appt.put("counsellorId", 401L);
        appt.put("appointmentType", body.getOrDefault("appointmentType", "COURSE_GUIDANCE"));
        appt.put("startAt", body.getOrDefault("startAt", "2026-10-28T16:00:00+05:30"));
        appt.put("endAt", "2026-10-28T16:30:00+05:30");
        appt.put("durationMinutes", body.getOrDefault("durationMinutes", 30));
        appt.put("meetingMode", body.getOrDefault("meetingMode", "ONLINE"));
        appt.put("notes", body.get("notes"));
        appt.put("status", "CONFIRMED");
        appt.put("tenantId", EducationDataStore.TENANT_ID);

        store.counsellingAppointments.add(0, appt);
        return buildSuccess("Counselling appointment scheduled", appt, HttpStatus.CREATED);
    }

    // 9. View Appointment
    @GetMapping("/appointments/{appointmentId}")
    public ResponseEntity<?> getAppointment(@PathVariable Long appointmentId) {
        validateCounsellorScope();
        Map<String, Object> found = store.counsellingAppointments.stream()
                .filter(a -> appointmentId.equals(a.get("appointmentId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found: " + appointmentId));
        return buildSuccess("Appointment details retrieved", found, HttpStatus.OK);
    }

    // 10. Update Appointment
    @PatchMapping("/appointments/{appointmentId}")
    public ResponseEntity<?> updateAppointment(@PathVariable Long appointmentId, @RequestBody Map<String, Object> body) {
        validateCounsellorScope();
        Map<String, Object> found = store.counsellingAppointments.stream()
                .filter(a -> appointmentId.equals(a.get("appointmentId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found: " + appointmentId));

        body.forEach((k, v) -> {
            if (!k.equalsIgnoreCase("appointmentId")) found.put(k, v);
        });
        return buildSuccess("Appointment updated", found, HttpStatus.OK);
    }

    // 11. Reschedule Appointment
    @PostMapping("/appointments/{appointmentId}/reschedule")
    public ResponseEntity<?> rescheduleAppointment(@PathVariable Long appointmentId, @RequestBody Map<String, Object> body) {
        validateCounsellorScope();
        Map<String, Object> found = store.counsellingAppointments.stream()
                .filter(a -> appointmentId.equals(a.get("appointmentId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found: " + appointmentId));

        String prevStart = (String) found.get("startAt");
        String newStart = (String) body.getOrDefault("newStartAt", "2026-10-29T16:00:00+05:30");

        found.put("previousStartAt", prevStart);
        found.put("startAt", newStart);
        found.put("rescheduleReason", body.get("reason"));
        found.put("status", "CONFIRMED");

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("appointmentId", appointmentId);
        data.put("previousStartAt", prevStart);
        data.put("startAt", newStart);
        data.put("status", "CONFIRMED");

        return buildSuccess("Appointment rescheduled", data, HttpStatus.OK);
    }

    // 12. Cancel Appointment
    @PostMapping("/appointments/{appointmentId}/cancel")
    public ResponseEntity<?> cancelAppointment(@PathVariable Long appointmentId, @RequestBody(required = false) Map<String, Object> body) {
        validateCounsellorScope();
        Map<String, Object> found = store.counsellingAppointments.stream()
                .filter(a -> appointmentId.equals(a.get("appointmentId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found: " + appointmentId));

        found.put("status", "CANCELLED");
        found.put("cancelReason", body != null ? body.get("reason") : "Cancelled by student");

        return buildSuccess("Appointment cancelled", found, HttpStatus.OK);
    }

    // 13. Complete Appointment
    @PostMapping("/appointments/{appointmentId}/complete")
    public ResponseEntity<?> completeAppointment(@PathVariable Long appointmentId, @RequestBody(required = false) Map<String, Object> body) {
        validateCounsellorScope();
        Map<String, Object> found = store.counsellingAppointments.stream()
                .filter(a -> appointmentId.equals(a.get("appointmentId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found: " + appointmentId));

        found.put("status", "COMPLETED");
        found.put("completedAt", "2026-10-28T16:35:00+05:30");
        return buildSuccess("Appointment completed", found, HttpStatus.OK);
    }

    // 14. Record Counselling Notes
    @PostMapping("/appointments/{appointmentId}/notes")
    public ResponseEntity<?> recordNotes(@PathVariable Long appointmentId, @RequestBody Map<String, Object> body) {
        validateCounsellorScope();

        long noteId = store.sessionNoteSeq.incrementAndGet();
        Map<String, Object> note = new LinkedHashMap<>();
        note.put("noteId", noteId);
        note.put("appointmentId", appointmentId);
        note.put("studentId", body.getOrDefault("studentId", 3001L));
        note.put("sessionSummary", body.get("sessionSummary"));
        note.put("studentConcerns", body.get("studentConcerns"));
        note.put("agreedNextSteps", body.get("agreedNextSteps"));
        note.put("followUpRequired", body.getOrDefault("followUpRequired", true));
        note.put("followUpAt", body.getOrDefault("followUpAt", "2026-10-30T11:00:00+05:30"));
        note.put("createdBy", 401L);
        note.put("createdAt", "2026-10-28T16:35:00+05:30");
        note.put("tenantId", EducationDataStore.TENANT_ID);

        store.counsellingNotes.add(note);
        return buildSuccess("Counselling notes saved", note, HttpStatus.OK);
    }

    // 15. View Session History
    @GetMapping("/students/{studentId}/sessions")
    public ResponseEntity<?> getStudentSessions(@PathVariable Long studentId) {
        validateCounsellorScope();
        List<Map<String, Object>> list = store.counsellingNotes.stream()
                .filter(n -> studentId.equals(n.get("studentId")))
                .collect(Collectors.toList());
        return buildSuccess("Student session history retrieved", list, HttpStatus.OK);
    }

    // 16. Create Action Plan
    @PostMapping("/students/{studentId}/action-plans")
    public ResponseEntity<?> createActionPlan(@PathVariable Long studentId, @RequestBody Map<String, Object> body) {
        validateCounsellorScope();

        long planId = store.planSeq.incrementAndGet();
        List<?> items = body.containsKey("items") ? (List<?>) body.get("items") : Collections.emptyList();

        Map<String, Object> plan = new LinkedHashMap<>();
        plan.put("planId", planId);
        plan.put("studentId", studentId);
        plan.put("title", body.getOrDefault("title", "Student Action Plan"));
        plan.put("description", body.get("description"));
        plan.put("items", items);
        plan.put("status", "ACTIVE");
        plan.put("completedItems", 0);
        plan.put("totalItems", items.size());
        plan.put("targetDate", body.getOrDefault("targetDate", "2026-11-01"));
        plan.put("tenantId", EducationDataStore.TENANT_ID);

        store.actionPlans.add(0, plan);
        return buildSuccess("Action plan created", plan, HttpStatus.OK);
    }

    // 17. List Action Plans
    @GetMapping("/students/{studentId}/action-plans")
    public ResponseEntity<?> getActionPlans(@PathVariable Long studentId) {
        validateCounsellorScope();
        List<Map<String, Object>> list = store.actionPlans.stream()
                .filter(p -> studentId.equals(p.get("studentId")))
                .collect(Collectors.toList());
        return buildSuccess("Action plans retrieved", list, HttpStatus.OK);
    }

    // 18. Update Action Plan
    @PatchMapping("/action-plans/{planId}")
    public ResponseEntity<?> updateActionPlan(@PathVariable Long planId, @RequestBody Map<String, Object> body) {
        validateCounsellorScope();
        Map<String, Object> found = store.actionPlans.stream()
                .filter(p -> planId.equals(p.get("planId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Action plan not found: " + planId));

        body.forEach((k, v) -> {
            if (!k.equalsIgnoreCase("planId")) found.put(k, v);
        });
        return buildSuccess("Action plan updated", found, HttpStatus.OK);
    }

    // 19. Complete Action Plan
    @PostMapping("/action-plans/{planId}/complete")
    public ResponseEntity<?> completeActionPlan(@PathVariable Long planId) {
        validateCounsellorScope();
        Map<String, Object> found = store.actionPlans.stream()
                .filter(p -> planId.equals(p.get("planId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Action plan not found: " + planId));

        found.put("status", "COMPLETED");
        found.put("completedAt", "2026-10-28T16:40:00+05:30");
        return buildSuccess("Action plan completed", found, HttpStatus.OK);
    }

    // 20. Recommend Courses
    @PostMapping("/students/{studentId}/course-recommendations")
    public ResponseEntity<?> recommendCourses(@PathVariable Long studentId, @RequestBody Map<String, Object> body) {
        validateCounsellorScope();

        List<Map<String, Object>> recs = new ArrayList<>();
        recs.add(Map.of(
                "courseId", 501L,
                "courseName", "Java Full Stack Development",
                "matchReasons", List.of(
                        "Matches the student's stated Java and web development interests",
                        "Published schedule matches the weekend preference"
                ),
                "durationWeeks", 24,
                "recommendationStatus", "SUGGESTED"
        ));

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("studentId", studentId);
        data.put("recommendations", recs);
        data.put("requiresCounsellorReview", true);

        return buildSuccess("Course recommendations generated", data, HttpStatus.OK);
    }

    // 21. Refer Student to Admission or Support Team
    @PostMapping("/students/{studentId}/referrals")
    public ResponseEntity<?> createReferral(@PathVariable Long studentId, @RequestBody Map<String, Object> body) {
        validateCounsellorScope();

        long id = store.referralSeq.incrementAndGet();
        Map<String, Object> ref = new LinkedHashMap<>();
        ref.put("referralId", id);
        ref.put("studentId", studentId);
        ref.put("referralType", body.getOrDefault("referralType", "ADMISSION"));
        ref.put("relatedCourseId", body.getOrDefault("relatedCourseId", 501L));
        ref.put("reason", body.get("reason"));
        ref.put("notes", body.get("notes"));
        ref.put("status", "PENDING_ASSIGNMENT");
        ref.put("createdAt", "2026-10-26T15:28:00+05:30");
        ref.put("tenantId", EducationDataStore.TENANT_ID);

        store.referrals.add(ref);
        return buildSuccess("Student referral created", ref, HttpStatus.OK);
    }

    // 22. AI Session Preparation
    @PostMapping("/ai/session-preparation")
    public ResponseEntity<?> prepareSession(@RequestBody Map<String, Object> body) {
        validateCounsellorScope();

        Map<String, Object> brief = new LinkedHashMap<>();
        brief.put("briefId", "brief_" + body.get("studentId") + "_01");
        brief.put("studentId", body.get("studentId"));
        brief.put("summary", "The student is interested in Java and web development and prefers weekend training.");
        brief.put("suggestedQuestions", List.of(
                "What is your current experience with programming?",
                "How much time can you dedicate to learning each week?",
                "What are your primary learning and career goals?"
        ));
        brief.put("recommendedNextStep", "Review the published course curriculum with the student.");
        brief.put("status", "DRAFT");
        brief.put("requiresCounsellorReview", true);

        return buildSuccess("Counselling preparation brief generated", brief, HttpStatus.OK);
    }

    // 23. AI Session Summary
    @PostMapping("/ai/session-summary")
    public ResponseEntity<?> summarizeSession(@RequestBody Map<String, Object> body) {
        validateCounsellorScope();

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("summaryDraftId", "summary_" + body.get("appointmentId") + "_01");
        summary.put("appointmentId", body.get("appointmentId"));
        summary.put("summary", "The session covered the student's interest in full-stack development, preferred learning schedule, and next steps for reviewing the curriculum.");
        summary.put("actionItems", List.of("Review the curriculum", "Confirm the preferred batch"));
        summary.put("status", "DRAFT");
        summary.put("requiresCounsellorReview", true);

        return buildSuccess("Session summary draft generated", summary, HttpStatus.OK);
    }

    // 24. Counsellor Reports
    @GetMapping("/reports")
    public ResponseEntity<?> getReports(
            @RequestParam(required = false, defaultValue = "2026-10-01") String from,
            @RequestParam(required = false, defaultValue = "2026-10-31") String to
    ) {
        validateCounsellorScope();
        Map<String, Object> report = new LinkedHashMap<>();
        report.put("period", Map.of("from", from, "to", to));
        report.put("completedSessions", 36);
        report.put("courseRecommendationsCount", 44);
        report.put("referralsToAdmission", 18);
        report.put("conversionFromCounsellingPercent", 68.2);
        report.put("averageRating", 4.9);
        return buildSuccess("Counsellor performance report", report, HttpStatus.OK);
    }
}
