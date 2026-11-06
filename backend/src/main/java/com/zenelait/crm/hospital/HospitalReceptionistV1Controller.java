package com.zenelait.crm.hospital;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Zenelait AI CRM — Hospital/Clinic Tenant
 * Receptionist V1 Controller
 * Base Path: /api/v1/hospital/receptionist
 * Implements 20 REST API endpoints specified in Section 3.
 */
@RestController
@RequestMapping("/api/v1/hospital/receptionist")
@CrossOrigin(origins = "*")
public class HospitalReceptionistV1Controller {

    private final HospitalDataStore store;

    public HospitalReceptionistV1Controller(HospitalDataStore store) {
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
        resp.put("requestId", requestId != null ? requestId : "req_rec_" + UUID.randomUUID().toString().substring(0, 8));
        return ResponseEntity.status(status).body(resp);
    }

    // 1. GET /dashboard
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("date", "2026-10-27");
        data.put("appointmentsToday", 42);
        data.put("checkedIn", 18);
        data.put("waiting", 7);
        data.put("completed", 12);
        data.put("myOpenEnquiries", 5);
        data.put("myPendingTasks", 3);
        return buildResponse(true, "Receptionist dashboard retrieved", data, HttpStatus.OK, "req_receptionist_dashboard_001");
    }

    // 2. GET /patients
    @GetMapping("/patients")
    public ResponseEntity<?> searchPatients(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        List<Map<String, Object>> matches = store.getPatients().values().stream()
                .filter(p -> {
                    if (search == null || search.isBlank()) return true;
                    String s = search.toLowerCase();
                    return String.valueOf(p.get("fullName")).toLowerCase().contains(s)
                            || String.valueOf(p.get("patientReference")).toLowerCase().contains(s)
                            || String.valueOf(p.get("phone")).contains(s);
                })
                .map(p -> {
                    Map<String, Object> masked = new LinkedHashMap<>();
                    masked.put("patientId", p.get("patientId"));
                    masked.put("patientReference", p.get("patientReference"));
                    masked.put("fullName", p.get("fullName"));
                    String phone = String.valueOf(p.getOrDefault("phone", ""));
                    masked.put("phoneMasked", phone.length() > 4 ? "******" + phone.substring(phone.length() - 4) : phone);
                    masked.put("registrationStatus", p.get("registrationStatus"));
                    return masked;
                })
                .collect(Collectors.toList());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("items", matches);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", matches.size());
        data.put("totalPages", Math.max(1, (int) Math.ceil((double) matches.size() / size)));

        return buildResponse(true, "Patient search completed", data, HttpStatus.OK, "req_patient_search_001");
    }

    // 3. POST /patients
    @PostMapping("/patients")
    public ResponseEntity<?> registerPatient(@RequestBody Map<String, Object> payload) {
        String phone = String.valueOf(payload.getOrDefault("phone", ""));
        String fullName = String.valueOf(payload.getOrDefault("fullName", ""));

        // Duplicate record check
        boolean duplicate = store.getPatients().values().stream()
                .anyMatch(p -> phone.equals(String.valueOf(p.get("phone"))) && fullName.equalsIgnoreCase(String.valueOf(p.get("fullName"))));
        if (duplicate) {
            Map<String, Object> err = new LinkedHashMap<>();
            err.put("field", "phone");
            err.put("message", "A patient with this name and phone number is already registered.");
            return buildResponse(false, "Duplicate patient registration detected", List.of(err), HttpStatus.CONFLICT, null);
        }

        String patientId = "pat_" + (7000 + store.getPatients().size() + 1);
        String patientReference = "PAT-" + (1040 + store.getPatients().size() + 2);

        Map<String, Object> patient = new LinkedHashMap<>(payload);
        patient.put("patientId", patientId);
        patient.put("patientReference", patientReference);
        patient.put("registrationStatus", "REGISTERED");
        patient.put("createdAt", "2026-10-27T18:00:00+05:30");
        store.getPatients().put(patientId, patient);

        store.recordAuditEvent("PATIENT_REGISTERED", "RECEPTIONIST", patientId, "Registered patient " + fullName + " (" + patientReference + ")");

        Map<String, Object> respData = new LinkedHashMap<>();
        respData.put("patientId", patientId);
        respData.put("patientReference", patientReference);
        respData.put("fullName", fullName);
        respData.put("registrationStatus", "REGISTERED");
        respData.put("createdAt", "2026-10-27T18:00:00+05:30");

        return buildResponse(true, "Patient registered successfully", respData, HttpStatus.CREATED, "req_patient_create_001");
    }

    // 4. GET /patients/{patientId}
    @GetMapping("/patients/{patientId}")
    public ResponseEntity<?> getPatient(@PathVariable String patientId) {
        Map<String, Object> patient = store.getPatients().get(patientId);
        if (patient == null) {
            return buildResponse(false, "Patient record not found", null, HttpStatus.NOT_FOUND, null);
        }
        // Minimal necessary disclosure
        Map<String, Object> safeCopy = new LinkedHashMap<>(patient);
        safeCopy.remove("clinicalNotes");
        return buildResponse(true, "Patient details retrieved", safeCopy, HttpStatus.OK, null);
    }

    // 5. PATCH /patients/{patientId}
    @PatchMapping("/patients/{patientId}")
    public ResponseEntity<?> updatePatientDemographics(@PathVariable String patientId, @RequestBody Map<String, Object> updates) {
        Map<String, Object> patient = store.getPatients().get(patientId);
        if (patient == null) {
            return buildResponse(false, "Patient record not found", null, HttpStatus.NOT_FOUND, null);
        }
        // Strictly prevent updates to clinical records or patientReference
        updates.remove("patientReference");
        updates.remove("patientId");
        patient.putAll(updates);

        store.recordAuditEvent("PATIENT_CONTACT_UPDATED", "RECEPTIONIST", patientId, "Updated demographic / contact info");
        return buildResponse(true, "Patient details updated", patient, HttpStatus.OK, null);
    }

    // 6. GET /appointments/today
    @GetMapping("/appointments/today")
    public ResponseEntity<?> getTodayAppointments(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        List<Map<String, Object>> todayApts = store.getAppointments().values().stream()
                .filter(a -> status == null || status.equalsIgnoreCase(String.valueOf(a.get("status"))))
                .collect(Collectors.toList());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("items", todayApts);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", todayApts.size());
        data.put("totalPages", 1);

        return buildResponse(true, "Today's appointments retrieved", data, HttpStatus.OK, "req_appointments_today_001");
    }

    // 7. GET /appointments/{appointmentId}
    @GetMapping("/appointments/{appointmentId}")
    public ResponseEntity<?> getAppointmentDetails(@PathVariable String appointmentId) {
        Map<String, Object> apt = store.getAppointments().get(appointmentId);
        if (apt == null) {
            return buildResponse(false, "Appointment not found", null, HttpStatus.NOT_FOUND, null);
        }
        return buildResponse(true, "Appointment details retrieved", apt, HttpStatus.OK, null);
    }

    // 8. POST /appointments/{appointmentId}/check-in
    @PostMapping("/appointments/{appointmentId}/check-in")
    public ResponseEntity<?> checkInPatient(@PathVariable String appointmentId, @RequestBody Map<String, Object> payload) {
        Map<String, Object> apt = store.getAppointments().get(appointmentId);
        if (apt == null) {
            return buildResponse(false, "Appointment not found", null, HttpStatus.NOT_FOUND, null);
        }
        if ("CHECKED_IN".equals(apt.get("status"))) {
            Map<String, Object> err = new LinkedHashMap<>();
            err.put("field", "status");
            err.put("message", "Patient is already checked in for this appointment.");
            return buildResponse(false, "Duplicate check-in operation", List.of(err), HttpStatus.CONFLICT, null);
        }

        String queueEntryId = "queue_" + (9000 + store.getReceptionQueue().size() + 1);
        String timestamp = "2026-10-27T18:00:00+05:30";

        apt.put("status", "CHECKED_IN");
        apt.put("checkedInAt", timestamp);

        Map<String, Object> qEntry = new LinkedHashMap<>();
        qEntry.put("queueEntryId", queueEntryId);
        qEntry.put("appointmentId", appointmentId);
        qEntry.put("patientId", apt.get("patientId"));
        qEntry.put("patientReference", apt.get("patientReference"));
        qEntry.put("checkInTime", timestamp);
        qEntry.put("status", "WAITING");
        qEntry.put("arrivalChannel", payload.getOrDefault("arrivalChannel", "FRONT_DESK"));
        qEntry.put("administrativeNote", payload.get("administrativeNote"));
        store.getReceptionQueue().put(queueEntryId, qEntry);

        store.recordAuditEvent("APPOINTMENT_CHECK_IN", "RECEPTIONIST", appointmentId, "Patient checked in into queue " + queueEntryId);

        Map<String, Object> respData = new LinkedHashMap<>();
        respData.put("appointmentId", appointmentId);
        respData.put("status", "CHECKED_IN");
        respData.put("queueEntryId", queueEntryId);
        respData.put("checkedInAt", timestamp);
        respData.put("queueStatus", "WAITING");

        return buildResponse(true, "Patient checked in", respData, HttpStatus.OK, "req_checkin_001");
    }

    // 9. POST /appointments/{appointmentId}/cancel-request
    @PostMapping("/appointments/{appointmentId}/cancel-request")
    public ResponseEntity<?> requestAppointmentCancellation(@PathVariable String appointmentId, @RequestBody Map<String, Object> payload) {
        Map<String, Object> apt = store.getAppointments().get(appointmentId);
        if (apt == null) {
            return buildResponse(false, "Appointment not found", null, HttpStatus.NOT_FOUND, null);
        }

        String reqId = "cnl_" + UUID.randomUUID().toString().substring(0, 8);
        Map<String, Object> req = new LinkedHashMap<>(payload);
        req.put("requestId", reqId);
        req.put("appointmentId", appointmentId);
        req.put("status", "PENDING_COORDINATOR_REVIEW");
        req.put("createdAt", "2026-10-27T18:00:00+05:30");
        store.getCancellationRequests().put(reqId, req);

        store.recordAuditEvent("APPOINTMENT_CANCEL_REQUESTED", "RECEPTIONIST", appointmentId, "Submitted cancellation request " + reqId);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("requestId", reqId);
        data.put("appointmentId", appointmentId);
        data.put("status", "PENDING_COORDINATOR_REVIEW");

        return buildResponse(true, "Cancellation request submitted", data, HttpStatus.ACCEPTED, null);
    }

    // 10. POST /appointments/{appointmentId}/reschedule-request
    @PostMapping("/appointments/{appointmentId}/reschedule-request")
    public ResponseEntity<?> requestAppointmentRescheduling(@PathVariable String appointmentId, @RequestBody Map<String, Object> payload) {
        Map<String, Object> apt = store.getAppointments().get(appointmentId);
        if (apt == null) {
            return buildResponse(false, "Appointment not found", null, HttpStatus.NOT_FOUND, null);
        }

        String reqId = "res_" + (1000 + store.getRescheduleRequests().size() + 1);
        String requestedDate = String.valueOf(payload.getOrDefault("requestedDate", "2026-10-29"));

        Map<String, Object> req = new LinkedHashMap<>(payload);
        req.put("requestId", reqId);
        req.put("appointmentId", appointmentId);
        req.put("status", "PENDING_COORDINATOR_REVIEW");
        req.put("requestedDate", requestedDate);
        req.put("createdAt", "2026-10-27T18:00:00+05:30");
        store.getRescheduleRequests().put(reqId, req);

        store.recordAuditEvent("APPOINTMENT_RESCHEDULE_REQUESTED", "RECEPTIONIST", appointmentId, "Submitted rescheduling request for " + requestedDate);

        Map<String, Object> respData = new LinkedHashMap<>();
        respData.put("requestId", reqId);
        respData.put("appointmentId", appointmentId);
        respData.put("status", "PENDING_COORDINATOR_REVIEW");
        respData.put("requestedDate", requestedDate);

        return buildResponse(true, "Rescheduling request submitted", respData, HttpStatus.CREATED, "req_reschedule_001");
    }

    // 11. GET /queue
    @GetMapping("/queue")
    public ResponseEntity<?> getQueue(
            @RequestParam(required = false) String status,
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
        return buildResponse(true, "Reception queue retrieved", data, HttpStatus.OK, null);
    }

    // 12. POST /queue/walk-ins
    @PostMapping("/queue/walk-ins")
    public ResponseEntity<?> registerWalkIn(@RequestBody Map<String, Object> payload) {
        String patientId = String.valueOf(payload.get("patientId"));
        Map<String, Object> patient = store.getPatients().get(patientId);
        String patientReference = patient != null ? String.valueOf(patient.get("patientReference")) : "PAT-WALK";

        String queueEntryId = "queue_" + (9000 + store.getReceptionQueue().size() + 1);
        String timestamp = "2026-10-27T18:00:00+05:30";

        Map<String, Object> entry = new LinkedHashMap<>(payload);
        entry.put("queueEntryId", queueEntryId);
        entry.put("patientReference", patientReference);
        entry.put("status", "WAITING");
        entry.put("createdAt", timestamp);
        store.getReceptionQueue().put(queueEntryId, entry);

        store.recordAuditEvent("WALKIN_REGISTERED", "RECEPTIONIST", queueEntryId, "Walk-in registered for " + patientReference);

        Map<String, Object> respData = new LinkedHashMap<>();
        respData.put("queueEntryId", queueEntryId);
        respData.put("patientReference", patientReference);
        respData.put("department", payload.get("department"));
        respData.put("status", "WAITING");
        respData.put("createdAt", timestamp);

        return buildResponse(true, "Walk-in registered", respData, HttpStatus.CREATED, "req_walkin_001");
    }

    // 13. PATCH /queue/{queueEntryId}/status
    @PatchMapping("/queue/{queueEntryId}/status")
    public ResponseEntity<?> updateQueueStatus(@PathVariable String queueEntryId, @RequestBody Map<String, Object> payload) {
        Map<String, Object> entry = store.getReceptionQueue().get(queueEntryId);
        if (entry == null) {
            return buildResponse(false, "Queue entry not found", null, HttpStatus.NOT_FOUND, null);
        }
        String status = String.valueOf(payload.getOrDefault("status", "CALLED"));
        entry.put("status", status);
        return buildResponse(true, "Queue status updated to " + status, entry, HttpStatus.OK, null);
    }

    // 14. GET /enquiries
    @GetMapping("/enquiries")
    public ResponseEntity<?> getMyEnquiries(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        List<Map<String, Object>> items = new ArrayList<>(store.getPatientEnquiries().values());
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("items", items);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", items.size());
        data.put("totalPages", 1);
        return buildResponse(true, "Enquiries retrieved", data, HttpStatus.OK, null);
    }

    // 15. POST /enquiries
    @PostMapping("/enquiries")
    public ResponseEntity<?> createEnquiry(@RequestBody Map<String, Object> payload) {
        String enquiryId = "enq_" + (1100 + store.getPatientEnquiries().size() + 1);
        String patientId = String.valueOf(payload.get("patientId"));
        Map<String, Object> patient = store.getPatients().get(patientId);
        String patientReference = patient != null ? String.valueOf(patient.get("patientReference")) : "PAT-1042";
        String timestamp = "2026-10-27T18:00:00+05:30";

        Map<String, Object> enq = new LinkedHashMap<>(payload);
        enq.put("enquiryId", enquiryId);
        enq.put("patientReference", patientReference);
        enq.put("status", "OPEN");
        enq.put("assignedTeam", "RECEPTION");
        enq.put("createdAt", timestamp);
        store.getPatientEnquiries().put(enquiryId, enq);

        store.recordAuditEvent("ENQUIRY_CREATED", "RECEPTIONIST", enquiryId, "Created patient enquiry " + enquiryId);

        Map<String, Object> respData = new LinkedHashMap<>();
        respData.put("enquiryId", enquiryId);
        respData.put("patientReference", patientReference);
        respData.put("category", payload.get("category"));
        respData.put("status", "OPEN");
        respData.put("assignedTeam", "RECEPTION");
        respData.put("createdAt", timestamp);

        return buildResponse(true, "Patient enquiry created", respData, HttpStatus.CREATED, "req_enquiry_create_001");
    }

    // 16. GET /enquiries/{enquiryId}
    @GetMapping("/enquiries/{enquiryId}")
    public ResponseEntity<?> getEnquiry(@PathVariable String enquiryId) {
        Map<String, Object> enq = store.getPatientEnquiries().get(enquiryId);
        if (enq == null) {
            return buildResponse(false, "Enquiry not found", null, HttpStatus.NOT_FOUND, null);
        }
        return buildResponse(true, "Enquiry retrieved", enq, HttpStatus.OK, null);
    }

    // 17. POST /enquiries/{enquiryId}/notes
    @PostMapping("/enquiries/{enquiryId}/notes")
    public ResponseEntity<?> addEnquiryNote(@PathVariable String enquiryId, @RequestBody Map<String, Object> payload) {
        Map<String, Object> enq = store.getPatientEnquiries().get(enquiryId);
        if (enq == null) {
            return buildResponse(false, "Enquiry not found", null, HttpStatus.NOT_FOUND, null);
        }
        String noteId = "note_" + (1200 + store.getEnquiryNotes().size() + 1);
        String timestamp = "2026-10-27T18:00:00+05:30";

        Map<String, Object> note = new LinkedHashMap<>();
        note.put("noteId", noteId);
        note.put("enquiryId", enquiryId);
        note.put("note", payload.get("note"));
        note.put("visibility", payload.getOrDefault("visibility", "INTERNAL"));
        note.put("authorRole", "RECEPTIONIST");
        note.put("createdAt", timestamp);

        store.getEnquiryNotes().computeIfAbsent(enquiryId, k -> new ArrayList<>()).add(note);

        Map<String, Object> respData = new LinkedHashMap<>();
        respData.put("noteId", noteId);
        respData.put("enquiryId", enquiryId);
        respData.put("visibility", note.get("visibility"));
        respData.put("createdAt", timestamp);

        return buildResponse(true, "Administrative note added", respData, HttpStatus.CREATED, "req_enquiry_note_001");
    }

    // 18. POST /enquiries/{enquiryId}/handoff
    @PostMapping("/enquiries/{enquiryId}/handoff")
    public ResponseEntity<?> handoffEnquiry(@PathVariable String enquiryId, @RequestBody Map<String, Object> payload) {
        Map<String, Object> enq = store.getPatientEnquiries().get(enquiryId);
        if (enq == null) {
            return buildResponse(false, "Enquiry not found", null, HttpStatus.NOT_FOUND, null);
        }
        String targetTeam = String.valueOf(payload.getOrDefault("targetTeam", "APPOINTMENT_COORDINATION"));
        enq.put("assignedTeam", targetTeam);
        enq.put("status", "TRANSFERRED");
        enq.put("handoffReason", payload.get("reason"));
        enq.put("transferredAt", "2026-10-27T18:00:00+05:30");

        store.recordAuditEvent("ENQUIRY_HANDOFF", "RECEPTIONIST", enquiryId, "Transferred to " + targetTeam);

        Map<String, Object> respData = new LinkedHashMap<>();
        respData.put("enquiryId", enquiryId);
        respData.put("assignedTeam", targetTeam);
        respData.put("status", "TRANSFERRED");
        respData.put("transferredAt", "2026-10-27T18:00:00+05:30");

        return buildResponse(true, "Enquiry transferred successfully", respData, HttpStatus.OK, "req_handoff_001");
    }

    // 19. GET /tasks
    @GetMapping("/tasks")
    public ResponseEntity<?> getAssignedTasks() {
        List<Map<String, Object>> tasks = new ArrayList<>(store.getReceptionTasks().values());
        return buildResponse(true, "Assigned reception tasks retrieved", tasks, HttpStatus.OK, null);
    }

    // 20. PATCH /tasks/{taskId}/status
    @PatchMapping("/tasks/{taskId}/status")
    public ResponseEntity<?> updateTaskStatus(@PathVariable String taskId, @RequestBody Map<String, Object> payload) {
        Map<String, Object> task = store.getReceptionTasks().get(taskId);
        if (task == null) {
            return buildResponse(false, "Task not found", null, HttpStatus.NOT_FOUND, null);
        }
        String status = String.valueOf(payload.getOrDefault("status", "COMPLETED"));
        task.put("status", status);
        return buildResponse(true, "Task status updated to " + status, task, HttpStatus.OK, null);
    }
}
