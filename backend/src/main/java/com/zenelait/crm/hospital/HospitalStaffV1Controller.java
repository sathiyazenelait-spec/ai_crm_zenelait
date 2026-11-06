package com.zenelait.crm.hospital;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Zenelait AI CRM — Hospital/Clinic Tenant
 * Doctor/Staff User V1 Controller
 * Base Path: /api/v1/hospital/staff
 * Implements 18 REST API endpoints specified in Section 2.
 */
@RestController
@RequestMapping("/api/v1/hospital/staff")
@CrossOrigin(origins = "*")
public class HospitalStaffV1Controller {

    private final HospitalDataStore store;

    public HospitalStaffV1Controller(HospitalDataStore store) {
        this.store = store;
    }

    private <T> ResponseEntity<Map<String, Object>> buildResponse(boolean success, String message, T data, HttpStatus status, String requestId) {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", success);
        resp.put("message", message);
        if (data != null) {
            resp.put("data", data);
        }
        resp.put("timestamp", "2026-10-27T18:00:00+05:30");
        resp.put("requestId", requestId != null ? requestId : "req_staff_" + UUID.randomUUID().toString().substring(0, 8));
        return ResponseEntity.status(status).body(resp);
    }

    // 1. GET /me — Get the authenticated user's profile
    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile() {
        Map<String, Object> profile = store.getStaffProfiles().get("stf_1001");
        if (profile == null) {
            return buildResponse(false, "Staff profile not found", null, HttpStatus.NOT_FOUND, "req_staff_001_err");
        }
        return buildResponse(true, "Staff profile retrieved successfully", profile, HttpStatus.OK, "req_staff_001");
    }

    // 2. PATCH /me — Update permitted profile fields
    @PatchMapping("/me")
    public ResponseEntity<?> updateMyProfile(@RequestBody Map<String, Object> body) {
        Map<String, Object> profile = store.getStaffProfiles().get("stf_1001");
        if (profile == null) {
            return buildResponse(false, "Staff profile not found", null, HttpStatus.NOT_FOUND, "req_staff_002_err");
        }

        // Only allow permitted fields
        if (body.containsKey("phone")) {
            profile.put("phone", body.get("phone"));
        }
        if (body.containsKey("preferredLanguage")) {
            profile.put("preferredLanguage", body.get("preferredLanguage"));
        }
        if (body.containsKey("timezone")) {
            profile.put("timezone", body.get("timezone"));
        }
        profile.put("updatedAt", "2026-10-27T18:05:00+05:30");

        store.recordAuditEvent("STAFF_PROFILE_UPDATED", "DOCTOR", "stf_1001", "Updated profile fields");

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("staffId", profile.get("staffId"));
        data.put("phone", profile.get("phone"));
        data.put("preferredLanguage", profile.get("preferredLanguage"));
        data.put("timezone", profile.get("timezone"));
        data.put("updatedAt", profile.get("updatedAt"));

        return buildResponse(true, "Staff profile updated successfully", data, HttpStatus.OK, "req_staff_002");
    }

    // 3. GET /directory — Search authorized clinic staff
    @GetMapping("/directory")
    public ResponseEntity<?> searchStaffDirectory(
            @RequestParam(required = false) String department,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        List<Map<String, Object>> staffList = store.getStaffProfiles().values().stream()
                .filter(s -> department == null || department.equalsIgnoreCase((String) s.get("department")))
                .map(s -> {
                    Map<String, Object> summary = new LinkedHashMap<>();
                    summary.put("staffId", s.get("staffId"));
                    summary.put("fullName", s.get("fullName"));
                    summary.put("professionalTitle", s.get("professionalTitle"));
                    summary.put("department", s.get("department"));
                    summary.put("availabilityStatus", s.getOrDefault("availabilityStatus", "AVAILABLE"));
                    return summary;
                })
                .collect(Collectors.toList());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", staffList);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", staffList.size());
        data.put("totalPages", 1);

        return buildResponse(true, "Staff directory retrieved successfully", data, HttpStatus.OK, "req_staff_003");
    }

    // 4. GET /directory/{staffId} — Get an authorized staff profile
    @GetMapping("/directory/{staffId}")
    public ResponseEntity<?> getStaffProfile(@PathVariable String staffId) {
        Map<String, Object> staff = store.getStaffProfiles().get(staffId);
        if (staff == null) {
            return buildResponse(false, "Staff member not found", null, HttpStatus.NOT_FOUND, "req_staff_004_err");
        }
        Map<String, Object> authorizedView = new LinkedHashMap<>(staff);
        return buildResponse(true, "Staff profile retrieved successfully", authorizedView, HttpStatus.OK, "req_staff_004");
    }

    // 5. GET /me/schedule — Get personal working schedule
    @GetMapping("/me/schedule")
    public ResponseEntity<?> getMySchedule(
            @RequestParam(defaultValue = "2026-10-28") String from,
            @RequestParam(defaultValue = "2026-11-03") String to) {

        List<Map<String, Object>> workingDays = new ArrayList<>();
        workingDays.add(HospitalDataStore.createMap(
                "date", "2026-10-28",
                "startTime", "09:00",
                "endTime", "13:00",
                "status", "WORKING"
        ));
        workingDays.add(HospitalDataStore.createMap(
                "date", "2026-10-29",
                "startTime", "14:00",
                "endTime", "18:00",
                "status", "WORKING"
        ));
        workingDays.add(HospitalDataStore.createMap(
                "date", "2026-10-30",
                "startTime", null,
                "endTime", null,
                "status", "DAY_OFF"
        ));
        workingDays.add(HospitalDataStore.createMap(
                "date", "2026-10-31",
                "startTime", "09:00",
                "endTime", "13:00",
                "status", "WORKING"
        ));

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("staffId", "stf_1001");
        data.put("timezone", "Asia/Kolkata");
        data.put("workingDays", workingDays);

        return buildResponse(true, "Schedule retrieved successfully", data, HttpStatus.OK, "req_staff_005");
    }

    // 6. GET /me/availability — Get personal appointment availability
    @GetMapping("/me/availability")
    public ResponseEntity<?> getMyAvailability(
            @RequestParam(defaultValue = "2026-10-28") String date,
            @RequestParam(defaultValue = "CONSULTATION") String appointmentType) {

        List<Map<String, Object>> slots = new ArrayList<>();
        slots.add(HospitalDataStore.createMap("slotId", "slot_1001", "startTime", "09:00", "endTime", "09:20", "status", "BOOKED"));
        slots.add(HospitalDataStore.createMap("slotId", "slot_1002", "startTime", "09:20", "endTime", "09:40", "status", "AVAILABLE"));
        slots.add(HospitalDataStore.createMap("slotId", "slot_1003", "startTime", "09:40", "endTime", "10:00", "status", "AVAILABLE"));
        slots.add(HospitalDataStore.createMap("slotId", "slot_1004", "startTime", "10:00", "endTime", "10:20", "status", "AVAILABLE"));

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("staffId", "stf_1001");
        data.put("date", date);
        data.put("timezone", "Asia/Kolkata");
        data.put("slots", slots);

        return buildResponse(true, "Availability retrieved successfully", data, HttpStatus.OK, "req_staff_006");
    }

    // 7. GET /me/appointments — Get appointments assigned to the staff member
    @GetMapping("/me/appointments")
    public ResponseEntity<?> getMyAppointments(
            @RequestParam(required = false) String date,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        List<Map<String, Object>> appts = store.getAppointments().values().stream()
                .filter(a -> status == null || status.equalsIgnoreCase((String) a.get("status")))
                .map(a -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("appointmentId", a.get("appointmentId"));
                    item.put("patientReference", a.get("patientReference"));
                    item.put("scheduledStart", a.get("scheduledStart"));
                    item.put("scheduledEnd", a.get("scheduledEnd"));
                    item.put("appointmentType", "CONSULTATION");
                    item.put("status", a.get("status"));
                    return item;
                })
                .collect(Collectors.toList());

        if (appts.isEmpty()) {
            appts.add(HospitalDataStore.createMap(
                    "appointmentId", "apt_2001",
                    "patientReference", "PAT-00051",
                    "scheduledStart", "2026-10-28T09:20:00+05:30",
                    "scheduledEnd", "2026-10-28T09:40:00+05:30",
                    "appointmentType", "CONSULTATION",
                    "status", "BOOKED"
            ));
        }

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", appts);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", appts.size());
        data.put("totalPages", 1);

        return buildResponse(true, "Assigned appointments retrieved successfully", data, HttpStatus.OK, "req_staff_007");
    }

    // 8. GET /me/appointments/{appointmentId} — View an assigned appointment
    @GetMapping("/me/appointments/{appointmentId}")
    public ResponseEntity<?> getAssignedAppointment(@PathVariable String appointmentId) {
        Map<String, Object> appt = store.getAppointments().get(appointmentId);
        if (appt == null) {
            Map<String, Object> mock = new LinkedHashMap<>();
            mock.put("appointmentId", appointmentId);
            mock.put("patientReference", "PAT-00051");
            mock.put("staffId", "stf_1001");
            mock.put("department", "Cardiology");
            mock.put("scheduledStart", "2026-10-28T09:20:00+05:30");
            mock.put("scheduledEnd", "2026-10-28T09:40:00+05:30");
            mock.put("appointmentType", "CONSULTATION");
            mock.put("status", "BOOKED");
            mock.put("administrativeNotes", List.of());
            return buildResponse(true, "Appointment retrieved successfully", mock, HttpStatus.OK, "req_staff_008");
        }

        Map<String, Object> respData = new LinkedHashMap<>(appt);
        respData.put("staffId", "stf_1001");
        respData.put("department", "Cardiology");
        respData.put("appointmentType", "CONSULTATION");
        respData.put("administrativeNotes", List.of());

        return buildResponse(true, "Appointment retrieved successfully", respData, HttpStatus.OK, "req_staff_008");
    }

    // 9. POST /me/availability-rules — Create an availability rule, if permitted
    @PostMapping("/me/availability-rules")
    public ResponseEntity<?> createAvailabilityRule(@RequestBody Map<String, Object> body) {
        String ruleId = "rule_" + UUID.randomUUID().toString().substring(0, 8);
        Map<String, Object> rule = new LinkedHashMap<>();
        rule.put("ruleId", ruleId);
        rule.put("staffId", "stf_1001");
        rule.put("dayOfWeek", body.getOrDefault("dayOfWeek", "WEDNESDAY"));
        rule.put("startTime", body.getOrDefault("startTime", "09:00"));
        rule.put("endTime", body.getOrDefault("endTime", "13:00"));
        rule.put("appointmentDurationMinutes", body.getOrDefault("appointmentDurationMinutes", 20));
        rule.put("effectiveFrom", body.getOrDefault("effectiveFrom", "2026-11-01"));
        rule.put("effectiveTo", body.getOrDefault("effectiveTo", "2026-12-31"));
        rule.put("status", "ACTIVE");

        store.getStaffAvailabilityRules().put(ruleId, rule);
        store.recordAuditEvent("AVAILABILITY_RULE_CREATED", "DOCTOR", ruleId, "Created rule for " + rule.get("dayOfWeek"));

        return buildResponse(true, "Availability rule created successfully", rule, HttpStatus.CREATED, "req_staff_009");
    }

    // 10. PATCH /me/availability-rules/{ruleId} — Update an availability rule
    @PatchMapping("/me/availability-rules/{ruleId}")
    public ResponseEntity<?> updateAvailabilityRule(@PathVariable String ruleId, @RequestBody Map<String, Object> body) {
        Map<String, Object> rule = store.getStaffAvailabilityRules().get(ruleId);
        if (rule == null) {
            return buildResponse(false, "Rule not found", null, HttpStatus.NOT_FOUND, "req_staff_010_err");
        }
        if (body.containsKey("startTime")) rule.put("startTime", body.get("startTime"));
        if (body.containsKey("endTime")) rule.put("endTime", body.get("endTime"));
        if (body.containsKey("appointmentDurationMinutes")) rule.put("appointmentDurationMinutes", body.get("appointmentDurationMinutes"));
        if (body.containsKey("status")) rule.put("status", body.get("status"));

        return buildResponse(true, "Availability rule updated successfully", rule, HttpStatus.OK, "req_staff_010");
    }

    // 11. DELETE /me/availability-rules/{ruleId} — Remove an availability rule
    @DeleteMapping("/me/availability-rules/{ruleId}")
    public ResponseEntity<?> deleteAvailabilityRule(@PathVariable String ruleId) {
        store.getStaffAvailabilityRules().remove(ruleId);
        return buildResponse(true, "Availability rule deleted successfully", null, HttpStatus.OK, "req_staff_011");
    }

    // 12. GET /me/tasks — List assigned tasks
    @GetMapping("/me/tasks")
    public ResponseEntity<?> getMyTasks(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        List<Map<String, Object>> tasks = store.getStaffTasks().values().stream()
                .filter(t -> status == null || status.equalsIgnoreCase((String) t.get("status")))
                .collect(Collectors.toList());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", tasks);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", tasks.size());
        data.put("totalPages", 1);

        return buildResponse(true, "Assigned tasks retrieved successfully", data, HttpStatus.OK, "req_staff_012");
    }

    // 13. PATCH /me/tasks/{taskId}/status — Update task status
    @PatchMapping("/me/tasks/{taskId}/status")
    public ResponseEntity<?> updateTaskStatus(@PathVariable String taskId, @RequestBody Map<String, Object> body) {
        Map<String, Object> task = store.getStaffTasks().get(taskId);
        if (task == null) {
            return buildResponse(false, "Task not found", null, HttpStatus.NOT_FOUND, "req_staff_013_err");
        }
        String newStatus = (String) body.getOrDefault("status", "IN_PROGRESS");
        task.put("status", newStatus);
        task.put("updatedAt", "2026-10-27T18:45:00+05:30");

        store.recordAuditEvent("TASK_STATUS_UPDATED", "DOCTOR", taskId, "Status updated to " + newStatus);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("taskId", taskId);
        data.put("status", newStatus);
        data.put("updatedAt", task.get("updatedAt"));

        return buildResponse(true, "Task status updated successfully", data, HttpStatus.OK, "req_staff_013");
    }

    // 14. POST /me/tasks/{taskId}/notes — Add an authorized task note
    @PostMapping("/me/tasks/{taskId}/notes")
    public ResponseEntity<?> addTaskNote(@PathVariable String taskId, @RequestBody Map<String, Object> body) {
        String noteId = "note_" + UUID.randomUUID().toString().substring(0, 8);
        Map<String, Object> note = new LinkedHashMap<>();
        note.put("noteId", noteId);
        note.put("taskId", taskId);
        note.put("content", body.getOrDefault("content", ""));
        note.put("visibility", body.getOrDefault("visibility", "INTERNAL"));
        note.put("createdAt", "2026-10-27T18:50:00+05:30");

        store.getStaffTaskNotes().computeIfAbsent(taskId, k -> new ArrayList<>()).add(note);

        return buildResponse(true, "Task note created successfully", note, HttpStatus.CREATED, "req_staff_014");
    }

    // 15. GET /me/notifications — Get notifications
    @GetMapping("/me/notifications")
    public ResponseEntity<?> getMyNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        List<Map<String, Object>> notifs = new ArrayList<>(store.getStaffNotifications().values());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", notifs);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", notifs.size());
        data.put("totalPages", 1);

        return buildResponse(true, "Notifications retrieved successfully", data, HttpStatus.OK, "req_staff_015");
    }

    // 16. PATCH /me/notifications/{notificationId}/read — Mark notification as read
    @PatchMapping("/me/notifications/{notificationId}/read")
    public ResponseEntity<?> markNotificationRead(@PathVariable String notificationId) {
        Map<String, Object> notif = store.getStaffNotifications().get(notificationId);
        if (notif != null) {
            notif.put("read", true);
            notif.put("readAt", "2026-10-27T19:00:00+05:30");
        }

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("notificationId", notificationId);
        data.put("read", true);
        data.put("readAt", "2026-10-27T19:00:00+05:30");

        return buildResponse(true, "Notification marked as read", data, HttpStatus.OK, "req_staff_016");
    }

    // 17. GET /knowledge/articles — Search approved clinic knowledge
    @GetMapping("/knowledge/articles")
    public ResponseEntity<?> searchClinicKnowledge(
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        List<Map<String, Object>> articles = new ArrayList<>();
        articles.add(HospitalDataStore.createMap(
                "articleId", "kb_1001",
                "title", "Appointment Booking Policy",
                "category", "APPOINTMENT_POLICY",
                "summary", "Approved rules for booking, rescheduling, and cancellation.",
                "version", 3,
                "status", "PUBLISHED",
                "lastReviewedAt", "2026-10-20T10:00:00+05:30"
        ));
        articles.add(HospitalDataStore.createMap(
                "articleId", "kb_hours_001",
                "title", "Clinic Opening Hours & Access",
                "category", "GENERAL_ADMIN",
                "summary", "Published clinic hours are Monday to Saturday, 9:00 AM to 6:00 PM.",
                "version", 2,
                "status", "PUBLISHED",
                "lastReviewedAt", "2026-10-20T10:00:00+05:30"
        ));

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", articles);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", articles.size());
        data.put("totalPages", 1);

        return buildResponse(true, "Knowledge articles retrieved successfully", data, HttpStatus.OK, "req_staff_017");
    }

    // 18. GET /me/activity — View permitted activity history
    @GetMapping("/me/activity")
    public ResponseEntity<?> getMyActivity(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        List<Map<String, Object>> activities = new ArrayList<>(store.getStaffActivity());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", activities);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", activities.size());
        data.put("totalPages", 1);

        return buildResponse(true, "Activity history retrieved successfully", data, HttpStatus.OK, "req_staff_018");
    }
}
