package com.zenelait.crm.hospital;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Zenelait AI CRM — Hospital/Clinic Tenant
 * Appointment Coordinator V1 Controller
 * Base Path: /api/v1/hospital/appointment-coordinator
 * Implements 28 REST API endpoints specified in Section 5.
 */
@RestController
@RequestMapping("/api/v1/hospital/appointment-coordinator")
@CrossOrigin(origins = "*")
public class HospitalAppointmentCoordinatorV1Controller {

    private final HospitalDataStore store;

    public HospitalAppointmentCoordinatorV1Controller(HospitalDataStore store) {
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
        resp.put("requestId", requestId != null ? requestId : "req_coord_" + UUID.randomUUID().toString().substring(0, 8));
        return ResponseEntity.status(status).body(resp);
    }

    // 1. GET /dashboard
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("date", "2026-10-27");
        data.put("totalAppointments", 86);
        data.put("confirmedAppointments", 68);
        data.put("pendingBookingRequests", 11);
        data.put("pendingRescheduleRequests", 5);
        data.put("pendingCancellationRequests", 2);
        data.put("waitingListCount", 17);
        data.put("remindersPending", 23);
        return buildResponse(true, "Appointment dashboard retrieved", data, HttpStatus.OK, "req_appt_dashboard_001");
    }

    // 2. GET /doctors
    @GetMapping("/doctors")
    public ResponseEntity<?> listDoctors(
            @RequestParam(required = false) String department,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        List<Map<String, Object>> docs = store.getDoctors().values().stream()
                .filter(d -> department == null || department.equalsIgnoreCase(String.valueOf(d.get("department"))))
                .collect(Collectors.toList());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("items", docs);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", docs.size());
        data.put("totalPages", 1);

        return buildResponse(true, "Doctor list retrieved", data, HttpStatus.OK, "req_doctors_001");
    }

    // 3. GET /departments
    @GetMapping("/departments")
    public ResponseEntity<?> listDepartments() {
        List<Map<String, Object>> depts = new ArrayList<>(store.getDepartments().values());
        return buildResponse(true, "Clinic departments retrieved", depts, HttpStatus.OK, null);
    }

    // 4. GET /availability
    @GetMapping("/availability")
    public ResponseEntity<?> getAvailability(
            @RequestParam String doctorId,
            @RequestParam String date,
            @RequestParam(required = false, defaultValue = "CONSULTATION") String appointmentType
    ) {
        List<Map<String, Object>> slots = store.getAppointmentSlots().values().stream()
                .filter(s -> doctorId.equals(s.get("doctorId"))
                        && date.equals(s.get("date"))
                        && "AVAILABLE".equals(s.get("status")))
                .collect(Collectors.toList());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("doctorId", doctorId);
        data.put("date", date);
        data.put("appointmentType", appointmentType);
        data.put("slots", slots);

        return buildResponse(true, "Available slots retrieved", data, HttpStatus.OK, "req_availability_001");
    }

    // 5. GET /appointments
    @GetMapping("/appointments")
    public ResponseEntity<?> listAppointments(
            @RequestParam(required = false) String date,
            @RequestParam(required = false) String doctorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        List<Map<String, Object>> items = store.getAppointments().values().stream()
                .filter(a -> (doctorId == null || doctorId.equals(a.get("doctorId"))))
                .collect(Collectors.toList());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("items", items);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", items.size());
        data.put("totalPages", 1);
        return buildResponse(true, "Appointments retrieved", data, HttpStatus.OK, null);
    }

    // 6. POST /appointments
    @PostMapping("/appointments")
    public synchronized ResponseEntity<?> createAppointment(
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @RequestBody Map<String, Object> payload
    ) {
        String slotId = String.valueOf(payload.get("slotId"));
        Map<String, Object> slot = store.getAppointmentSlots().get(slotId);

        // Concurrency / double-booking control: Reject unavailable slot with 409
        if (slot == null || !"AVAILABLE".equals(slot.get("status"))) {
            Map<String, Object> err = new LinkedHashMap<>();
            err.put("field", "slotId");
            err.put("message", "Please retrieve availability and select another slot");
            return buildResponse(false, "The selected slot is no longer available", List.of(err), HttpStatus.CONFLICT, "req_booking_conflict_001");
        }

        // Lock slot atomically
        slot.put("status", "BOOKED");

        String appointmentId = "apt_" + (2300 + store.getAppointments().size() + 1);
        String patientId = String.valueOf(payload.get("patientId"));
        Map<String, Object> patient = store.getPatients().get(patientId);
        String patientRef = patient != null ? String.valueOf(patient.get("patientReference")) : "PAT-1042";

        String scheduledStart = slot.get("date") + "T" + slot.get("startTime") + ":00+05:30";
        String scheduledEnd = slot.get("date") + "T" + slot.get("endTime") + ":00+05:30";

        Map<String, Object> apt = new LinkedHashMap<>(payload);
        apt.put("appointmentId", appointmentId);
        apt.put("patientReference", patientRef);
        apt.put("scheduledStart", scheduledStart);
        apt.put("scheduledEnd", scheduledEnd);
        apt.put("status", "BOOKED");
        apt.put("confirmationStatus", "PENDING");
        apt.put("createdAt", "2026-10-27T18:00:00+05:30");
        store.getAppointments().put(appointmentId, apt);

        store.recordAuditEvent("APPOINTMENT_BOOKED", "APPOINTMENT_COORDINATOR", appointmentId, "Booked slot " + slotId + " for patient " + patientRef);

        Map<String, Object> respData = new LinkedHashMap<>();
        respData.put("appointmentId", appointmentId);
        respData.put("patientReference", patientRef);
        respData.put("doctorId", payload.get("doctorId"));
        respData.put("slotId", slotId);
        respData.put("scheduledStart", scheduledStart);
        respData.put("scheduledEnd", scheduledEnd);
        respData.put("status", "BOOKED");
        respData.put("confirmationStatus", "PENDING");

        return buildResponse(true, "Appointment created successfully", respData, HttpStatus.CREATED, "req_booking_001");
    }

    // 7. GET /appointments/{appointmentId}
    @GetMapping("/appointments/{appointmentId}")
    public ResponseEntity<?> getAppointment(@PathVariable String appointmentId) {
        Map<String, Object> apt = store.getAppointments().get(appointmentId);
        if (apt == null) {
            return buildResponse(false, "Appointment not found", null, HttpStatus.NOT_FOUND, null);
        }
        return buildResponse(true, "Appointment details retrieved", apt, HttpStatus.OK, null);
    }

    // 8. PATCH /appointments/{appointmentId}
    @PatchMapping("/appointments/{appointmentId}")
    public ResponseEntity<?> updateAppointment(@PathVariable String appointmentId, @RequestBody Map<String, Object> updates) {
        Map<String, Object> apt = store.getAppointments().get(appointmentId);
        if (apt == null) {
            return buildResponse(false, "Appointment not found", null, HttpStatus.NOT_FOUND, null);
        }
        apt.putAll(updates);
        return buildResponse(true, "Appointment updated", apt, HttpStatus.OK, null);
    }

    // 9. POST /appointments/{appointmentId}/confirm
    @PostMapping("/appointments/{appointmentId}/confirm")
    public ResponseEntity<?> confirmAppointment(@PathVariable String appointmentId, @RequestBody Map<String, Object> payload) {
        Map<String, Object> apt = store.getAppointments().get(appointmentId);
        if (apt == null) {
            return buildResponse(false, "Appointment not found", null, HttpStatus.NOT_FOUND, null);
        }
        apt.put("confirmationStatus", "CONFIRMATION_QUEUED");
        String execId = "exe_" + (2400 + store.getAppointments().size() + 1);

        store.recordAuditEvent("APPOINTMENT_CONFIRMED", "APPOINTMENT_COORDINATOR", appointmentId, "Queued notification " + execId);

        Map<String, Object> respData = new LinkedHashMap<>();
        respData.put("appointmentId", appointmentId);
        respData.put("status", apt.get("status"));
        respData.put("confirmationStatus", "CONFIRMATION_QUEUED");
        respData.put("notificationExecutionId", execId);

        return buildResponse(true, "Appointment confirmation accepted for processing", respData, HttpStatus.ACCEPTED, "req_confirm_001");
    }

    // 10. POST /appointments/{appointmentId}/reschedule
    @PostMapping("/appointments/{appointmentId}/reschedule")
    public synchronized ResponseEntity<?> rescheduleAppointment(
            @PathVariable String appointmentId,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @RequestBody Map<String, Object> payload
    ) {
        Map<String, Object> apt = store.getAppointments().get(appointmentId);
        if (apt == null) {
            return buildResponse(false, "Appointment not found", null, HttpStatus.NOT_FOUND, null);
        }

        String newSlotId = String.valueOf(payload.get("newSlotId"));
        Map<String, Object> newSlot = store.getAppointmentSlots().get(newSlotId);
        if (newSlot == null || !"AVAILABLE".equals(newSlot.get("status"))) {
            Map<String, Object> err = new LinkedHashMap<>();
            err.put("field", "newSlotId");
            err.put("message", "Target slot is no longer available");
            return buildResponse(false, "Slot conflict", List.of(err), HttpStatus.CONFLICT, null);
        }

        // Release old slot if available
        String oldSlotId = String.valueOf(apt.get("slotId"));
        if (store.getAppointmentSlots().containsKey(oldSlotId)) {
            store.getAppointmentSlots().get(oldSlotId).put("status", "AVAILABLE");
        }

        // Reserve new slot
        newSlot.put("status", "BOOKED");

        String newStart = newSlot.get("date") + "T" + newSlot.get("startTime") + ":00+05:30";
        apt.put("previousSlotId", oldSlotId);
        apt.put("slotId", newSlotId);
        apt.put("scheduledStart", newStart);
        apt.put("status", "RESCHEDULED");

        // Cancel previous pending reminders
        store.getAppointmentReminders().values().stream()
                .filter(r -> appointmentId.equals(r.get("appointmentId")) && "SCHEDULED".equals(r.get("status")))
                .forEach(r -> r.put("status", "CANCELLED_DUE_TO_RESCHEDULE"));

        store.recordAuditEvent("APPOINTMENT_RESCHEDULED", "APPOINTMENT_COORDINATOR", appointmentId, "Rescheduled to " + newSlotId);

        Map<String, Object> respData = new LinkedHashMap<>();
        respData.put("appointmentId", appointmentId);
        respData.put("previousSlotId", oldSlotId);
        respData.put("newSlotId", newSlotId);
        respData.put("scheduledStart", newStart);
        respData.put("status", "RESCHEDULED");
        respData.put("notificationStatus", "QUEUED");

        return buildResponse(true, "Appointment rescheduled", respData, HttpStatus.OK, "req_reschedule_002");
    }

    // 11. POST /appointments/{appointmentId}/cancel
    @PostMapping("/appointments/{appointmentId}/cancel")
    public synchronized ResponseEntity<?> cancelAppointment(@PathVariable String appointmentId, @RequestBody Map<String, Object> payload) {
        Map<String, Object> apt = store.getAppointments().get(appointmentId);
        if (apt == null) {
            return buildResponse(false, "Appointment not found", null, HttpStatus.NOT_FOUND, null);
        }

        String slotId = String.valueOf(apt.get("slotId"));
        if (store.getAppointmentSlots().containsKey(slotId)) {
            store.getAppointmentSlots().get(slotId).put("status", "AVAILABLE");
        }

        apt.put("status", "CANCELLED");
        apt.put("cancellationReason", payload.get("reason"));
        apt.put("cancelledAt", "2026-10-27T18:00:00+05:30");

        // Invalidate reminders
        store.getAppointmentReminders().values().stream()
                .filter(r -> appointmentId.equals(r.get("appointmentId")) && "SCHEDULED".equals(r.get("status")))
                .forEach(r -> r.put("status", "CANCELLED_DUE_TO_APPOINTMENT_CANCEL"));

        store.recordAuditEvent("APPOINTMENT_CANCELLED", "APPOINTMENT_COORDINATOR", appointmentId, "Cancelled appointment");

        Map<String, Object> respData = new LinkedHashMap<>();
        respData.put("appointmentId", appointmentId);
        respData.put("status", "CANCELLED");
        respData.put("cancellationReason", payload.get("reason"));
        respData.put("cancelledAt", "2026-10-27T18:00:00+05:30");
        respData.put("notificationStatus", "QUEUED");

        return buildResponse(true, "Appointment cancelled", respData, HttpStatus.OK, "req_cancel_001");
    }

    // 12. GET /booking-requests
    @GetMapping("/booking-requests")
    public ResponseEntity<?> listBookingRequests() {
        List<Map<String, Object>> requests = new ArrayList<>(store.getBookingRequests().values());
        return buildResponse(true, "Incoming booking requests retrieved", requests, HttpStatus.OK, null);
    }

    // 13. POST /booking-requests
    @PostMapping("/booking-requests")
    public ResponseEntity<?> createBookingRequest(@RequestBody Map<String, Object> payload) {
        String reqId = "bkreq_" + UUID.randomUUID().toString().substring(0, 8);
        Map<String, Object> req = new LinkedHashMap<>(payload);
        req.put("requestId", reqId);
        req.put("status", "PENDING");
        req.put("createdAt", "2026-10-27T18:00:00+05:30");
        store.getBookingRequests().put(reqId, req);
        return buildResponse(true, "Booking request created", req, HttpStatus.CREATED, null);
    }

    // 14. POST /booking-requests/{requestId}/approve
    @PostMapping("/booking-requests/{requestId}/approve")
    public ResponseEntity<?> approveBookingRequest(@PathVariable String requestId, @RequestBody Map<String, Object> payload) {
        Map<String, Object> req = store.getBookingRequests().get(requestId);
        if (req == null) {
            return buildResponse(false, "Booking request not found", null, HttpStatus.NOT_FOUND, null);
        }
        req.put("status", "APPROVED");
        return buildResponse(true, "Booking request approved", req, HttpStatus.OK, null);
    }

    // 15. POST /booking-requests/{requestId}/reject
    @PostMapping("/booking-requests/{requestId}/reject")
    public ResponseEntity<?> rejectBookingRequest(@PathVariable String requestId, @RequestBody Map<String, Object> payload) {
        Map<String, Object> req = store.getBookingRequests().get(requestId);
        if (req == null) {
            return buildResponse(false, "Booking request not found", null, HttpStatus.NOT_FOUND, null);
        }
        req.put("status", "REJECTED");
        req.put("rejectionReason", payload.get("reason"));
        return buildResponse(true, "Booking request rejected", req, HttpStatus.OK, null);
    }

    // 16. GET /reschedule-requests
    @GetMapping("/reschedule-requests")
    public ResponseEntity<?> listRescheduleRequests() {
        List<Map<String, Object>> requests = new ArrayList<>(store.getRescheduleRequests().values());
        return buildResponse(true, "Rescheduling requests retrieved", requests, HttpStatus.OK, null);
    }

    // 17. POST /reschedule-requests/{requestId}/approve
    @PostMapping("/reschedule-requests/{requestId}/approve")
    public synchronized ResponseEntity<?> approveRescheduleRequest(@PathVariable String requestId, @RequestBody Map<String, Object> payload) {
        Map<String, Object> req = store.getRescheduleRequests().get(requestId);
        if (req == null) {
            return buildResponse(false, "Request not found", null, HttpStatus.NOT_FOUND, null);
        }
        String slotId = String.valueOf(payload.get("approvedSlotId"));
        req.put("status", "APPROVED");
        req.put("newSlotId", slotId);

        String apptId = String.valueOf(req.get("appointmentId"));
        Map<String, Object> apt = store.getAppointments().get(apptId);
        if (apt != null) {
            apt.put("slotId", slotId);
            apt.put("status", "RESCHEDULED");
        }

        store.recordAuditEvent("RESCHEDULE_APPROVED", "APPOINTMENT_COORDINATOR", requestId, "Approved rescheduling to " + slotId);

        Map<String, Object> respData = new LinkedHashMap<>();
        respData.put("requestId", requestId);
        respData.put("appointmentId", apptId);
        respData.put("status", "APPROVED");
        respData.put("newSlotId", slotId);
        respData.put("notificationStatus", "QUEUED");

        return buildResponse(true, "Rescheduling request approved", respData, HttpStatus.OK, "req_reschedule_approve_001");
    }

    // 18. POST /reschedule-requests/{requestId}/reject
    @PostMapping("/reschedule-requests/{requestId}/reject")
    public ResponseEntity<?> rejectRescheduleRequest(@PathVariable String requestId, @RequestBody Map<String, Object> payload) {
        Map<String, Object> req = store.getRescheduleRequests().get(requestId);
        if (req == null) {
            return buildResponse(false, "Request not found", null, HttpStatus.NOT_FOUND, null);
        }
        req.put("status", "REJECTED");
        req.put("rejectionReason", payload.get("reason"));
        return buildResponse(true, "Rescheduling request rejected", req, HttpStatus.OK, null);
    }

    // 19. GET /cancellation-requests
    @GetMapping("/cancellation-requests")
    public ResponseEntity<?> listCancellationRequests() {
        List<Map<String, Object>> requests = new ArrayList<>(store.getCancellationRequests().values());
        return buildResponse(true, "Cancellation requests retrieved", requests, HttpStatus.OK, null);
    }

    // 20. POST /cancellation-requests/{requestId}/approve
    @PostMapping("/cancellation-requests/{requestId}/approve")
    public ResponseEntity<?> approveCancellationRequest(@PathVariable String requestId) {
        Map<String, Object> req = store.getCancellationRequests().get(requestId);
        if (req == null) {
            return buildResponse(false, "Request not found", null, HttpStatus.NOT_FOUND, null);
        }
        req.put("status", "APPROVED");
        String apptId = (String) req.get("appointmentId");
        if (apptId != null && store.getAppointments().containsKey(apptId)) {
            store.getAppointments().get(apptId).put("status", "CANCELLED");
        }
        return buildResponse(true, "Cancellation approved", req, HttpStatus.OK, null);
    }

    // 21. GET /waiting-list
    @GetMapping("/waiting-list")
    public ResponseEntity<?> listWaitingList() {
        List<Map<String, Object>> list = new ArrayList<>(store.getWaitingList().values());
        return buildResponse(true, "Waiting-list entries retrieved", list, HttpStatus.OK, null);
    }

    // 22. POST /waiting-list
    @PostMapping("/waiting-list")
    public ResponseEntity<?> addToWaitingList(@RequestBody Map<String, Object> payload) {
        String entryId = "wl_" + (2500 + store.getWaitingList().size() + 1);
        String patientId = String.valueOf(payload.get("patientId"));
        Map<String, Object> patient = store.getPatients().get(patientId);
        String patientRef = patient != null ? String.valueOf(patient.get("patientReference")) : "PAT-1042";
        String timestamp = "2026-10-27T18:00:00+05:30";

        Map<String, Object> entry = new LinkedHashMap<>(payload);
        entry.put("waitingListEntryId", entryId);
        entry.put("patientReference", patientRef);
        entry.put("status", "ACTIVE");
        entry.put("createdAt", timestamp);
        store.getWaitingList().put(entryId, entry);

        store.recordAuditEvent("WAITING_LIST_ADDED", "APPOINTMENT_COORDINATOR", entryId, "Added " + patientRef + " to waiting list");

        Map<String, Object> respData = new LinkedHashMap<>();
        respData.put("waitingListEntryId", entryId);
        respData.put("patientReference", patientRef);
        respData.put("doctorId", payload.get("doctorId"));
        respData.put("status", "ACTIVE");
        respData.put("contactPreference", payload.getOrDefault("contactPreference", "SMS"));
        respData.put("createdAt", timestamp);

        return buildResponse(true, "Patient added to the waiting list", respData, HttpStatus.CREATED, "req_waiting_list_001");
    }

    // 23. DELETE /waiting-list/{entryId}
    @DeleteMapping("/waiting-list/{entryId}")
    public ResponseEntity<?> deleteWaitingListEntry(@PathVariable String entryId) {
        Map<String, Object> entry = store.getWaitingList().remove(entryId);
        if (entry == null) {
            return buildResponse(false, "Waiting list entry not found", null, HttpStatus.NOT_FOUND, null);
        }
        return ResponseEntity.noContent().build();
    }

    // 24. POST /waiting-list/{entryId}/offer-slot
    @PostMapping("/waiting-list/{entryId}/offer-slot")
    public ResponseEntity<?> offerSlotToWaitingList(@PathVariable String entryId, @RequestBody Map<String, Object> payload) {
        Map<String, Object> entry = store.getWaitingList().get(entryId);
        if (entry == null) {
            return buildResponse(false, "Waiting list entry not found", null, HttpStatus.NOT_FOUND, null);
        }
        String offerId = "offer_" + (2600 + store.getWaitingListOffers().size() + 1);
        String expiresAt = String.valueOf(payload.getOrDefault("expiresAt", "2026-10-28T12:00:00+05:30"));

        Map<String, Object> offer = new LinkedHashMap<>();
        offer.put("offerId", offerId);
        offer.put("waitingListEntryId", entryId);
        offer.put("slotId", payload.get("slotId"));
        offer.put("status", "QUEUED");
        offer.put("expiresAt", expiresAt);
        store.getWaitingListOffers().put(offerId, offer);

        entry.put("status", "OFFERED");
        store.recordAuditEvent("SLOT_OFFER_QUEUED", "APPOINTMENT_COORDINATOR", entryId, "Offered slot to waiting list entry");

        Map<String, Object> respData = new LinkedHashMap<>();
        respData.put("offerId", offerId);
        respData.put("waitingListEntryId", entryId);
        respData.put("slotId", payload.get("slotId"));
        respData.put("status", "QUEUED");
        respData.put("expiresAt", expiresAt);

        return buildResponse(true, "Slot offer queued", respData, HttpStatus.ACCEPTED, "req_slot_offer_001");
    }

    // 25. GET /reminders
    @GetMapping("/reminders")
    public ResponseEntity<?> listReminders() {
        List<Map<String, Object>> reminders = new ArrayList<>(store.getAppointmentReminders().values());
        return buildResponse(true, "Scheduled appointment reminders retrieved", reminders, HttpStatus.OK, null);
    }

    // 26. POST /reminders
    @PostMapping("/reminders")
    public ResponseEntity<?> scheduleReminder(@RequestBody Map<String, Object> payload) {
        String reminderId = "rem_" + (2700 + store.getAppointmentReminders().size() + 1);
        String apptId = String.valueOf(payload.get("appointmentId"));
        String scheduleAt = String.valueOf(payload.getOrDefault("scheduleAt", "2026-10-28T10:00:00+05:30"));

        Map<String, Object> rem = new LinkedHashMap<>(payload);
        rem.put("reminderId", reminderId);
        rem.put("status", "SCHEDULED");
        rem.put("createdAt", "2026-10-27T18:00:00+05:30");
        store.getAppointmentReminders().put(reminderId, rem);

        store.recordAuditEvent("REMINDER_SCHEDULED", "APPOINTMENT_COORDINATOR", reminderId, "Scheduled reminder for appt " + apptId);

        Map<String, Object> respData = new LinkedHashMap<>();
        respData.put("reminderId", reminderId);
        respData.put("appointmentId", apptId);
        respData.put("channel", payload.getOrDefault("channel", "SMS"));
        respData.put("status", "SCHEDULED");
        respData.put("scheduleAt", scheduleAt);

        return buildResponse(true, "Appointment reminder scheduled", respData, HttpStatus.CREATED, "req_reminder_001");
    }

    // 27. POST /reminders/{reminderId}/cancel
    @PostMapping("/reminders/{reminderId}/cancel")
    public ResponseEntity<?> cancelReminder(@PathVariable String reminderId) {
        Map<String, Object> rem = store.getAppointmentReminders().get(reminderId);
        if (rem == null) {
            return buildResponse(false, "Reminder not found", null, HttpStatus.NOT_FOUND, null);
        }
        rem.put("status", "CANCELLED");
        return buildResponse(true, "Reminder cancelled", rem, HttpStatus.OK, null);
    }

    // 28. GET /metrics
    @GetMapping("/metrics")
    public ResponseEntity<?> getSchedulingMetrics(
            @RequestParam(required = false, defaultValue = "2026-10-01") String from,
            @RequestParam(required = false, defaultValue = "2026-10-27") String to
    ) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("period", Map.of("from", from, "to", to));
        data.put("appointmentsBooked", 1840);
        data.put("appointmentsConfirmed", 1590);
        data.put("appointmentsCancelled", 96);
        data.put("appointmentsRescheduled", 125);
        data.put("noShows", 44);
        data.put("waitingListEntries", 180);
        data.put("remindersSent", 1420);
        data.put("reminderDeliveryFailures", 18);

        return buildResponse(true, "Appointment metrics retrieved", data, HttpStatus.OK, "req_appt_metrics_001");
    }
}
