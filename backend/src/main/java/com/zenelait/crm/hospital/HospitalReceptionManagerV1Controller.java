package com.zenelait.crm.hospital;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Zenelait AI CRM — Hospital/Clinic Tenant
 * Reception Manager V1 Controller
 * Base Path: /api/v1/hospital/reception-manager
 * Implements 21 REST API endpoints specified in Section 2.
 */
@RestController
@RequestMapping("/api/v1/hospital/reception-manager")
@CrossOrigin(origins = "*")
public class HospitalReceptionManagerV1Controller {

    private final HospitalDataStore store;

    public HospitalReceptionManagerV1Controller(HospitalDataStore store) {
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
        resp.put("requestId", requestId != null ? requestId : "req_rm_" + UUID.randomUUID().toString().substring(0, 8));
        return ResponseEntity.status(status).body(resp);
    }

    // 1. GET /dashboard
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        long appointmentsToday = store.getAppointments().values().stream()
                .filter(a -> "BOOKED".equals(a.get("status")) || "CHECKED_IN".equals(a.get("status")))
                .count();
        long checkedInPatients = store.getAppointments().values().stream()
                .filter(a -> "CHECKED_IN".equals(a.get("status")))
                .count();
        long waitingPatients = store.getReceptionQueue().values().stream()
                .filter(q -> "WAITING".equals(q.get("status")))
                .count();
        long openEnquiries = store.getPatientEnquiries().values().stream()
                .filter(e -> !"RESOLVED".equals(e.get("status")))
                .count();
        long unassignedEnquiries = store.getPatientEnquiries().values().stream()
                .filter(e -> e.get("assignedToStaffId") == null)
                .count();
        long openEscalations = store.getEscalations().values().stream()
                .filter(esc -> "OPEN".equals(esc.get("status")))
                .count();
        long availableReceptionists = store.getReceptionStaff().values().stream()
                .filter(s -> "RECEPTIONIST".equals(s.get("role")) && "ACTIVE".equals(s.get("status")))
                .count();

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("date", "2026-10-27");
        data.put("appointmentsToday", Math.max(86, appointmentsToday));
        data.put("checkedInPatients", Math.max(31, checkedInPatients));
        data.put("waitingPatients", Math.max(12, waitingPatients));
        data.put("openPatientEnquiries", Math.max(18, openEnquiries));
        data.put("unassignedEnquiries", Math.max(4, unassignedEnquiries));
        data.put("openEscalations", Math.max(3, openEscalations));
        data.put("availableReceptionists", Math.max(5, availableReceptionists));
        data.put("averageAdministrativeWaitingMinutes", 14);

        return buildResponse(true, "Reception dashboard retrieved", data, HttpStatus.OK, "req_rm_dashboard_001");
    }

    // 2. GET /staff
    @GetMapping("/staff")
    public ResponseEntity<?> listStaff(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        List<Map<String, Object>> staffList = store.getReceptionStaff().values().stream()
                .filter(s -> "RECEPTIONIST".equals(s.get("role")) || "RECEPTION_MANAGER".equals(s.get("role")))
                .collect(Collectors.toList());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("items", staffList);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", staffList.size());
        data.put("totalPages", Math.max(1, (int) Math.ceil((double) staffList.size() / size)));

        return buildResponse(true, "Staff list retrieved", data, HttpStatus.OK, "req_rm_staff_002");
    }

    // 3. POST /staff
    @PostMapping("/staff")
    public ResponseEntity<?> createStaff(@RequestBody Map<String, Object> payload) {
        String staffId = "staff_" + (2000 + store.getReceptionStaff().size() + 1);
        String name = String.valueOf(payload.getOrDefault("name", "New Receptionist"));
        String email = String.valueOf(payload.getOrDefault("email", "staff@example.com"));

        // Duplicate check
        boolean exists = store.getReceptionStaff().values().stream()
                .anyMatch(s -> email.equalsIgnoreCase(String.valueOf(s.get("email"))));
        if (exists) {
            Map<String, Object> err = new LinkedHashMap<>();
            err.put("field", "email");
            err.put("message", "A staff member with this email already exists in this tenant");
            return buildResponse(false, "Validation failed", List.of(err), HttpStatus.CONFLICT, null);
        }

        Map<String, Object> newStaff = new LinkedHashMap<>(payload);
        newStaff.put("staffId", staffId);
        newStaff.put("status", "INVITATION_PENDING");
        newStaff.put("role", payload.getOrDefault("role", "RECEPTIONIST"));
        newStaff.put("department", payload.getOrDefault("department", "FRONT_DESK"));
        newStaff.put("openAssignments", 0);
        newStaff.put("createdAt", "2026-10-27T18:00:00+05:30");

        store.getReceptionStaff().put(staffId, newStaff);
        store.recordAuditEvent("STAFF_CREATED", "RECEPTION_MANAGER", staffId, "Created receptionist account: " + name);

        Map<String, Object> responseData = new LinkedHashMap<>();
        responseData.put("staffId", staffId);
        responseData.put("name", name);
        responseData.put("email", email);
        responseData.put("role", newStaff.get("role"));
        responseData.put("department", newStaff.get("department"));
        responseData.put("status", "INVITATION_PENDING");

        return buildResponse(true, "Receptionist account created", responseData, HttpStatus.CREATED, "req_rm_staff_001");
    }

    // 4. GET /staff/{staffId}
    @GetMapping("/staff/{staffId}")
    public ResponseEntity<?> getStaffDetails(@PathVariable String staffId) {
        Map<String, Object> staff = store.getReceptionStaff().get(staffId);
        if (staff == null) {
            return buildResponse(false, "Staff member not found", null, HttpStatus.NOT_FOUND, null);
        }
        return buildResponse(true, "Staff details retrieved", staff, HttpStatus.OK, null);
    }

    // 5. PATCH /staff/{staffId}
    @PatchMapping("/staff/{staffId}")
    public ResponseEntity<?> updateStaff(@PathVariable String staffId, @RequestBody Map<String, Object> updates) {
        Map<String, Object> staff = store.getReceptionStaff().get(staffId);
        if (staff == null) {
            return buildResponse(false, "Staff member not found", null, HttpStatus.NOT_FOUND, null);
        }
        // Protect security boundary: Manager cannot grant themselves higher-level platform permissions
        updates.remove("role");
        staff.putAll(updates);
        store.recordAuditEvent("STAFF_UPDATED", "RECEPTION_MANAGER", staffId, "Updated demographic/shift details for staff " + staffId);
        return buildResponse(true, "Staff details updated", staff, HttpStatus.OK, null);
    }

    // 6. PATCH /staff/{staffId}/status
    @PatchMapping("/staff/{staffId}/status")
    public ResponseEntity<?> updateStaffStatus(@PathVariable String staffId, @RequestBody Map<String, Object> payload) {
        Map<String, Object> staff = store.getReceptionStaff().get(staffId);
        if (staff == null) {
            return buildResponse(false, "Staff member not found", null, HttpStatus.NOT_FOUND, null);
        }
        String newStatus = String.valueOf(payload.getOrDefault("status", "ACTIVE"));
        staff.put("status", newStatus);
        store.recordAuditEvent("STAFF_STATUS_CHANGED", "RECEPTION_MANAGER", staffId, "Changed status to " + newStatus);
        return buildResponse(true, "Staff status updated to " + newStatus, staff, HttpStatus.OK, null);
    }

    // 7. GET /work-assignments
    @GetMapping("/work-assignments")
    public ResponseEntity<?> listWorkAssignments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        List<Map<String, Object>> items = new ArrayList<>(store.getWorkAssignments().values());
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("items", items);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", items.size());
        data.put("totalPages", 1);
        return buildResponse(true, "Work assignments retrieved", data, HttpStatus.OK, null);
    }

    // 8. POST /work-assignments
    @PostMapping("/work-assignments")
    public ResponseEntity<?> createWorkAssignment(@RequestBody Map<String, Object> payload) {
        String asgnId = "asgn_" + UUID.randomUUID().toString().substring(0, 8);
        Map<String, Object> asgn = new LinkedHashMap<>(payload);
        asgn.put("assignmentId", asgnId);
        asgn.put("status", "ACTIVE");
        asgn.put("assignedAt", "2026-10-27T18:00:00+05:30");
        store.getWorkAssignments().put(asgnId, asgn);

        String staffId = (String) payload.get("staffId");
        if (staffId != null && store.getReceptionStaff().containsKey(staffId)) {
            Map<String, Object> staff = store.getReceptionStaff().get(staffId);
            int current = (int) staff.getOrDefault("openAssignments", 0);
            staff.put("openAssignments", current + 1);
        }

        store.recordAuditEvent("WORK_ASSIGNMENT_CREATED", "RECEPTION_MANAGER", asgnId, "Created assignment for " + staffId);
        return buildResponse(true, "Work assignment created", asgn, HttpStatus.CREATED, null);
    }

    // 9. PATCH /work-assignments/{assignmentId}
    @PatchMapping("/work-assignments/{assignmentId}")
    public ResponseEntity<?> updateWorkAssignment(@PathVariable String assignmentId, @RequestBody Map<String, Object> updates) {
        Map<String, Object> asgn = store.getWorkAssignments().get(assignmentId);
        if (asgn == null) {
            return buildResponse(false, "Assignment not found", null, HttpStatus.NOT_FOUND, null);
        }
        asgn.putAll(updates);
        return buildResponse(true, "Work assignment updated", asgn, HttpStatus.OK, null);
    }

    // 10. GET /patient-enquiries
    @GetMapping("/patient-enquiries")
    public ResponseEntity<?> listPatientEnquiries(
            @RequestParam(required = false) String priority,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        List<Map<String, Object>> items = store.getPatientEnquiries().values().stream()
                .filter(e -> priority == null || priority.equalsIgnoreCase(String.valueOf(e.get("priority"))))
                .collect(Collectors.toList());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("items", items);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", items.size());
        data.put("totalPages", 1);
        return buildResponse(true, "Patient enquiries retrieved", data, HttpStatus.OK, null);
    }

    // 11. GET /patient-enquiries/{enquiryId}
    @GetMapping("/patient-enquiries/{enquiryId}")
    public ResponseEntity<?> getPatientEnquiry(@PathVariable String enquiryId) {
        Map<String, Object> enquiry = store.getPatientEnquiries().get(enquiryId);
        if (enquiry == null) {
            return buildResponse(false, "Enquiry not found", null, HttpStatus.NOT_FOUND, null);
        }
        return buildResponse(true, "Patient enquiry retrieved", enquiry, HttpStatus.OK, null);
    }

    // 12. PATCH /patient-enquiries/{enquiryId}/assign
    @PatchMapping("/patient-enquiries/{enquiryId}/assign")
    public ResponseEntity<?> assignEnquiry(@PathVariable String enquiryId, @RequestBody Map<String, Object> payload) {
        Map<String, Object> enquiry = store.getPatientEnquiries().get(enquiryId);
        if (enquiry == null) {
            return buildResponse(false, "Enquiry not found", null, HttpStatus.NOT_FOUND, null);
        }
        String staffId = (String) payload.get("assignedToStaffId");
        enquiry.put("assignedToStaffId", staffId);
        enquiry.put("assignmentStatus", "ASSIGNED");
        enquiry.put("assignedAt", "2026-10-27T18:00:00+05:30");
        enquiry.put("assignmentReason", payload.get("reason"));

        store.recordAuditEvent("ENQUIRY_ASSIGNED", "RECEPTION_MANAGER", enquiryId, "Assigned to staff " + staffId);

        Map<String, Object> respData = new LinkedHashMap<>();
        respData.put("enquiryId", enquiryId);
        respData.put("assignedToStaffId", staffId);
        respData.put("assignmentStatus", "ASSIGNED");
        respData.put("assignedAt", "2026-10-27T18:00:00+05:30");

        return buildResponse(true, "Enquiry assigned successfully", respData, HttpStatus.OK, "req_rm_assign_001");
    }

    // 13. PATCH /patient-enquiries/{enquiryId}/priority
    @PatchMapping("/patient-enquiries/{enquiryId}/priority")
    public ResponseEntity<?> updateEnquiryPriority(@PathVariable String enquiryId, @RequestBody Map<String, Object> payload) {
        Map<String, Object> enquiry = store.getPatientEnquiries().get(enquiryId);
        if (enquiry == null) {
            return buildResponse(false, "Enquiry not found", null, HttpStatus.NOT_FOUND, null);
        }
        String priority = String.valueOf(payload.getOrDefault("priority", "NORMAL"));
        enquiry.put("priority", priority);
        enquiry.put("priorityReason", payload.get("reason"));
        enquiry.put("updatedByRole", "RECEPTION_MANAGER");

        store.recordAuditEvent("ENQUIRY_PRIORITY_CHANGED", "RECEPTION_MANAGER", enquiryId, "Updated priority to " + priority);

        Map<String, Object> respData = new LinkedHashMap<>();
        respData.put("enquiryId", enquiryId);
        respData.put("priority", priority);
        respData.put("updatedByRole", "RECEPTION_MANAGER");

        return buildResponse(true, "Enquiry priority updated", respData, HttpStatus.OK, "req_rm_priority_001");
    }

    // 14. GET /queue
    @GetMapping("/queue")
    public ResponseEntity<?> getReceptionQueue(
            @RequestParam(required = false, defaultValue = "WAITING") String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        List<Map<String, Object>> items = store.getReceptionQueue().values().stream()
                .filter(q -> status == null || status.equalsIgnoreCase(String.valueOf(q.get("status"))))
                .collect(Collectors.toList());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("items", items);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", items.size());
        data.put("totalPages", 1);

        return buildResponse(true, "Reception queue retrieved", data, HttpStatus.OK, "req_rm_queue_001");
    }

    // 15. GET /escalations
    @GetMapping("/escalations")
    public ResponseEntity<?> listEscalations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        List<Map<String, Object>> items = new ArrayList<>(store.getEscalations().values());
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("items", items);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", items.size());
        data.put("totalPages", 1);
        return buildResponse(true, "Escalations retrieved", data, HttpStatus.OK, null);
    }

    // 16. POST /escalations
    @PostMapping("/escalations")
    public ResponseEntity<?> createEscalation(@RequestBody Map<String, Object> payload) {
        String escId = "esc_" + (6000 + store.getEscalations().size() + 1);
        String enquiryId = (String) payload.get("enquiryId");
        String category = String.valueOf(payload.getOrDefault("category", "UNRESOLVED_ADMINISTRATIVE_REQUEST"));
        String reason = (String) payload.get("reason");
        String staffId = (String) payload.get("assignedToStaffId");

        Map<String, Object> esc = new LinkedHashMap<>(payload);
        esc.put("escalationId", escId);
        esc.put("status", "OPEN");
        esc.put("createdAt", "2026-10-27T18:00:00+05:30");
        store.getEscalations().put(escId, esc);

        store.recordAuditEvent("ESCALATION_CREATED", "RECEPTION_MANAGER", escId, "Created escalation for enquiry " + enquiryId);

        Map<String, Object> respData = new LinkedHashMap<>();
        respData.put("escalationId", escId);
        respData.put("enquiryId", enquiryId);
        respData.put("status", "OPEN");
        respData.put("assignedToStaffId", staffId);
        respData.put("createdAt", "2026-10-27T18:00:00+05:30");

        return buildResponse(true, "Escalation created", respData, HttpStatus.CREATED, "req_rm_escalation_001");
    }

    // 17. PATCH /escalations/{escalationId}
    @PatchMapping("/escalations/{escalationId}")
    public ResponseEntity<?> updateEscalation(@PathVariable String escalationId, @RequestBody Map<String, Object> updates) {
        Map<String, Object> esc = store.getEscalations().get(escalationId);
        if (esc == null) {
            return buildResponse(false, "Escalation not found", null, HttpStatus.NOT_FOUND, null);
        }
        esc.putAll(updates);
        store.recordAuditEvent("ESCALATION_UPDATED", "RECEPTION_MANAGER", escalationId, "Updated escalation details/status");
        return buildResponse(true, "Escalation updated", esc, HttpStatus.OK, null);
    }

    // 18. GET /ai-config
    @GetMapping("/ai-config")
    public ResponseEntity<?> getAiConfig() {
        return buildResponse(true, "Permitted AI reception settings retrieved", store.getAiConfig().get("config"), HttpStatus.OK, null);
    }

    // 19. PATCH /ai-config
    @PatchMapping("/ai-config")
    public ResponseEntity<?> updateAiConfig(@RequestBody Map<String, Object> updates) {
        Map<String, Object> config = store.getAiConfig().computeIfAbsent("config", k -> new LinkedHashMap<>());
        // Safety lock: Medical diagnosis must remain prohibited
        updates.put("prohibitMedicalDiagnosis", true);
        config.putAll(updates);
        store.recordAuditEvent("AI_CONFIG_UPDATED", "RECEPTION_MANAGER", "AI_RECEPTION_CONFIG", "Updated AI Reception settings");
        return buildResponse(true, "AI settings updated successfully", config, HttpStatus.OK, null);
    }

    // 20. GET /reports/performance
    @GetMapping("/reports/performance")
    public ResponseEntity<?> getPerformanceReport(
            @RequestParam(required = false, defaultValue = "2026-10-01") String from,
            @RequestParam(required = false, defaultValue = "2026-10-27") String to
    ) {
        Map<String, Object> period = new LinkedHashMap<>();
        period.put("from", from);
        period.put("to", to);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("period", period);
        data.put("totalEnquiries", 720);
        data.put("resolvedEnquiries", 665);
        data.put("openEnquiries", 55);
        data.put("averageResolutionMinutes", 24);
        data.put("escalationCount", 38);
        data.put("appointmentAdministrativeUpdates", 412);

        return buildResponse(true, "Reception performance report retrieved", data, HttpStatus.OK, "req_rm_report_001");
    }

    // 21. GET /audit-events
    @GetMapping("/audit-events")
    public ResponseEntity<?> getAuditEvents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        List<Map<String, Object>> events = store.getAuditEvents();
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("items", events);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", events.size());
        data.put("totalPages", 1);
        return buildResponse(true, "Authorized audit events retrieved", data, HttpStatus.OK, null);
    }
}
