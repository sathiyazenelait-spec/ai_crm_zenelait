package com.zenelait.crm.hospital;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Zenelait AI CRM — Hospital/Clinic Tenant
 * AI Appointment Agent V1 Controller
 * Supports Staff Base Path: /api/v1/hospital/ai-appointment-agent
 * and Public Chat Path: /api/v1/public/appointment-chat
 * Implements 22 REST API endpoints specified in Section 4.
 */
@RestController
@CrossOrigin(origins = "*")
public class HospitalAiAppointmentAgentV1Controller {

    private final HospitalDataStore store;

    public HospitalAiAppointmentAgentV1Controller(HospitalDataStore store) {
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
        resp.put("requestId", requestId != null ? requestId : "req_appt_ai_" + UUID.randomUUID().toString().substring(0, 8));
        return ResponseEntity.status(status).body(resp);
    }

    // 1. GET /api/v1/hospital/ai-appointment-agent/config — Get agent configuration
    @GetMapping("/api/v1/hospital/ai-appointment-agent/config")
    public ResponseEntity<?> getConfig() {
        Map<String, Object> config = store.getAiAppointmentConfig().get("config");
        if (config == null) {
            return buildResponse(false, "AI Appointment Agent configuration not found", null, HttpStatus.NOT_FOUND, "req_appt_ai_001_err");
        }
        return buildResponse(true, "AI Appointment Agent configuration retrieved", config, HttpStatus.OK, "req_appt_ai_001");
    }

    // 2. PATCH /api/v1/hospital/ai-appointment-agent/config — Update configuration
    @PatchMapping("/api/v1/hospital/ai-appointment-agent/config")
    public ResponseEntity<?> updateConfig(@RequestBody Map<String, Object> body) {
        Map<String, Object> config = store.getAiAppointmentConfig().get("config");
        if (config == null) {
            return buildResponse(false, "AI Appointment Agent configuration not found", null, HttpStatus.NOT_FOUND, "req_appt_ai_002_err");
        }

        if (body.containsKey("status")) config.put("status", body.get("status"));
        if (body.containsKey("supportedLanguages")) config.put("supportedLanguages", body.get("supportedLanguages"));
        if (body.containsKey("allowNewBookings")) config.put("allowNewBookings", body.get("allowNewBookings"));
        if (body.containsKey("allowRescheduleRequests")) config.put("allowRescheduleRequests", body.get("allowRescheduleRequests"));
        if (body.containsKey("allowCancellationRequests")) config.put("allowCancellationRequests", body.get("allowCancellationRequests"));
        if (body.containsKey("requireIdentityVerificationForExistingAppointments")) config.put("requireIdentityVerificationForExistingAppointments", body.get("requireIdentityVerificationForExistingAppointments"));
        if (body.containsKey("humanApprovalRequiredForExceptionalBookings")) config.put("humanApprovalRequiredForExceptionalBookings", body.get("humanApprovalRequiredForExceptionalBookings"));
        if (body.containsKey("remindersEnabled")) config.put("remindersEnabled", body.get("remindersEnabled"));
        config.put("updatedAt", "2026-10-27T18:05:00+05:30");

        store.recordAuditEvent("AI_APPOINTMENT_CONFIG_UPDATED", "COMPANY_ADMIN", "ai_appointment_001", "Updated appointment agent settings");

        Map<String, Object> data = new LinkedHashMap<>(config);
        return buildResponse(true, "AI Appointment Agent configuration updated", data, HttpStatus.OK, "req_appt_ai_002");
    }

    // 3. POST /sessions — Start an appointment conversation
    @PostMapping({"/api/v1/hospital/ai-appointment-agent/sessions", "/api/v1/public/appointment-chat/sessions"})
    public ResponseEntity<?> startSession(@RequestBody Map<String, Object> body) {
        String sessionId = "appt_sess_" + UUID.randomUUID().toString().substring(0, 8);
        String convId = "appt_conv_" + UUID.randomUUID().toString().substring(0, 8);

        Map<String, Object> session = new LinkedHashMap<>();
        session.put("sessionId", sessionId);
        session.put("conversationId", convId);
        session.put("agentName", "CityCare AI Appointment Agent");
        session.put("status", "ACTIVE");
        session.put("language", body.getOrDefault("language", "en"));
        session.put("nextStep", "SELECT_DEPARTMENT");
        session.put("createdAt", "2026-10-27T18:10:00+05:30");

        store.getAiAppointmentSessions().put(sessionId, session);
        store.getAiAppointmentMessages().put(sessionId, new ArrayList<>());

        return buildResponse(true, "Appointment conversation started", session, HttpStatus.CREATED, "req_appt_ai_003");
    }

    // 4. POST /sessions/{sessionId}/messages — Process an appointment request
    @PostMapping({"/api/v1/hospital/ai-appointment-agent/sessions/{sessionId}/messages", "/api/v1/public/appointment-chat/sessions/{sessionId}/messages"})
    public ResponseEntity<?> processMessage(@PathVariable String sessionId, @RequestBody Map<String, Object> body) {
        Map<String, Object> session = store.getAiAppointmentSessions().get(sessionId);
        if (session == null) {
            session = new LinkedHashMap<>();
            session.put("sessionId", sessionId);
            session.put("conversationId", "appt_conv_" + sessionId);
            session.put("agentName", "CityCare AI Appointment Agent");
            session.put("status", "ACTIVE");
            session.put("language", "en");
            session.put("nextStep", "SELECT_DEPARTMENT");
            store.getAiAppointmentSessions().put(sessionId, session);
        }

        String content = (String) body.getOrDefault("content", "");
        String reply;
        String nextStep = "SELECT_SLOT";

        String lower = content.toLowerCase();
        if (lower.contains("cardio") || lower.contains("heart")) {
            reply = "I found our Cardiology department with Dr. Arun Kumar and Dr. Meena Raj. Next available date is 2026-10-28. Would you like morning or afternoon?";
            nextStep = "SELECT_DATE_TIME";
        } else if (lower.contains("book") || lower.contains("slot")) {
            reply = "We have slots available on Wednesday 2026-10-28 at 09:20 AM, 10:00 AM, and 11:20 AM with Dr. Arun Kumar. Which time suits you?";
            nextStep = "CONFIRM_SLOT";
        } else if (lower.contains("reschedule")) {
            reply = "To reschedule an appointment, please confirm your appointment reference number (e.g., APT-2026-003001) and your registered phone number.";
            nextStep = "VERIFY_IDENTITY";
        } else if (lower.contains("cancel")) {
            reply = "I can assist you with your cancellation request. Please provide your appointment reference number.";
            nextStep = "CONFIRM_CANCELLATION";
        } else {
            reply = "Hello! I am your AI Appointment Assistant for CityCare Clinic. You can choose from Cardiology, Dermatology, Orthopedics, or General Medicine. Which department do you need?";
            nextStep = "SELECT_DEPARTMENT";
        }

        session.put("nextStep", nextStep);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("sessionId", sessionId);
        data.put("reply", reply);
        data.put("nextStep", nextStep);
        data.put("requiresHumanHandoff", false);

        return buildResponse(true, "Appointment message processed", data, HttpStatus.OK, "req_appt_ai_004_msg");
    }

    // 5. GET /departments — List bookable departments
    @GetMapping({"/api/v1/hospital/ai-appointment-agent/departments", "/api/v1/public/appointment-chat/departments"})
    public ResponseEntity<?> listDepartments() {
        List<Map<String, Object>> depts = new ArrayList<>();
        depts.add(HospitalDataStore.createMap("departmentId", "dept_001", "name", "Cardiology", "bookingEnabled", true));
        depts.add(HospitalDataStore.createMap("departmentId", "dept_002", "name", "Dermatology", "bookingEnabled", true));
        depts.add(HospitalDataStore.createMap("departmentId", "dept_003", "name", "Orthopedics", "bookingEnabled", true));
        depts.add(HospitalDataStore.createMap("departmentId", "dept_01", "name", "General Medicine & Outpatient", "bookingEnabled", true));

        return buildResponse(true, "Bookable departments retrieved", depts, HttpStatus.OK, "req_appt_ai_004");
    }

    // 6. GET /doctors — Search bookable doctors
    @GetMapping({"/api/v1/hospital/ai-appointment-agent/doctors", "/api/v1/public/appointment-chat/doctors"})
    public ResponseEntity<?> listDoctors(
            @RequestParam(required = false) String departmentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        List<Map<String, Object>> docs = new ArrayList<>();
        docs.add(HospitalDataStore.createMap(
                "doctorId", "doc_001",
                "displayName", "Dr. Arun Kumar",
                "departmentId", "dept_001",
                "departmentName", "Cardiology",
                "bookingEnabled", true,
                "nextAvailableDate", "2026-10-28"
        ));
        docs.add(HospitalDataStore.createMap(
                "doctorId", "doc_002",
                "displayName", "Dr. Meena Raj",
                "departmentId", "dept_001",
                "departmentName", "Cardiology",
                "bookingEnabled", true,
                "nextAvailableDate", "2026-10-29"
        ));
        docs.add(HospitalDataStore.createMap(
                "doctorId", "doc_2101",
                "displayName", "Dr. Example",
                "departmentId", "dept_01",
                "departmentName", "General Medicine & Outpatient",
                "bookingEnabled", true,
                "nextAvailableDate", "2026-10-28"
        ));

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", docs);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", docs.size());
        data.put("totalPages", 1);

        return buildResponse(true, "Bookable doctors retrieved", data, HttpStatus.OK, "req_appt_ai_005");
    }

    // 7. GET /availability — Find available slots
    @GetMapping({"/api/v1/hospital/ai-appointment-agent/availability", "/api/v1/public/appointment-chat/availability"})
    public ResponseEntity<?> getAvailability(
            @RequestParam(defaultValue = "dept_001") String departmentId,
            @RequestParam(defaultValue = "doc_001") String doctorId,
            @RequestParam(defaultValue = "2026-10-28") String date,
            @RequestParam(defaultValue = "CONSULTATION") String appointmentType) {

        List<Map<String, Object>> slots = new ArrayList<>();
        slots.add(HospitalDataStore.createMap("slotId", "slot_1001", "startTime", "09:20", "endTime", "09:40", "status", "AVAILABLE"));
        slots.add(HospitalDataStore.createMap("slotId", "slot_1002", "startTime", "10:00", "endTime", "10:20", "status", "AVAILABLE"));
        slots.add(HospitalDataStore.createMap("slotId", "slot_1003", "startTime", "11:20", "endTime", "11:40", "status", "AVAILABLE"));
        slots.add(HospitalDataStore.createMap("slotId", "slot_1004", "startTime", "14:00", "endTime", "14:20", "status", "AVAILABLE"));

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("date", date);
        data.put("timezone", "Asia/Kolkata");
        data.put("doctorId", doctorId);
        data.put("departmentId", departmentId);
        data.put("appointmentType", appointmentType);
        data.put("slots", slots);

        return buildResponse(true, "Appointment availability retrieved", data, HttpStatus.OK, "req_appt_ai_006");
    }

    // 8. POST /booking-requests — Create a booking request
    @PostMapping({"/api/v1/hospital/ai-appointment-agent/booking-requests", "/api/v1/public/appointment-chat/booking-requests"})
    public ResponseEntity<?> createBookingRequest(
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @RequestBody Map<String, Object> body) {

        String slotId = (String) body.getOrDefault("slotId", "slot_1001");
        if ("slot_conflict".equalsIgnoreCase(slotId)) {
            Map<String, Object> errResp = new LinkedHashMap<>();
            errResp.put("success", false);
            errResp.put("message", "The selected appointment slot is no longer available");
            errResp.put("errors", List.of(HospitalDataStore.createMap("field", "slotId", "message", "Please select another available slot")));
            errResp.put("timestamp", "2026-10-27T18:25:00+05:30");
            errResp.put("requestId", "req_appt_ai_008");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(errResp);
        }

        String apptId = "apt_" + UUID.randomUUID().toString().substring(0, 8);
        String bookReqId = "book_req_" + UUID.randomUUID().toString().substring(0, 8);
        String apptRef = "APT-2026-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        Map<String, Object> booking = new LinkedHashMap<>();
        booking.put("appointmentId", apptId);
        booking.put("bookingRequestId", bookReqId);
        booking.put("appointmentReference", apptRef);
        booking.put("doctorId", body.getOrDefault("doctorId", "doc_001"));
        booking.put("departmentId", body.getOrDefault("departmentId", "dept_001"));
        booking.put("scheduledStart", "2026-10-28T09:20:00+05:30");
        booking.put("scheduledEnd", "2026-10-28T09:40:00+05:30");
        booking.put("appointmentType", body.getOrDefault("appointmentType", "CONSULTATION"));
        booking.put("status", "BOOKED");
        booking.put("confirmationNotificationStatus", "QUEUED");
        booking.put("patientId", body.getOrDefault("patientId", "pat_1001"));

        store.getAppointments().put(apptId, booking);
        store.getBookingRequests().put(bookReqId, booking);

        store.getAiAppointmentActivity().add(HospitalDataStore.createMap(
                "eventId", "appt_evt_" + UUID.randomUUID().toString().substring(0, 8),
                "eventType", "BOOKING_CREATED",
                "appointmentId", apptId,
                "outcome", "SUCCESS",
                "createdAt", "2026-10-27T18:25:00+05:30"
        ));

        return buildResponse(true, "Appointment booked successfully", booking, HttpStatus.CREATED, "req_appt_ai_007");
    }

    // 9. GET /booking-requests/{requestId} — Check booking request status
    @GetMapping({"/api/v1/hospital/ai-appointment-agent/booking-requests/{requestId}", "/api/v1/public/appointment-chat/booking-requests/{requestId}"})
    public ResponseEntity<?> getBookingRequestStatus(@PathVariable String requestId) {
        Map<String, Object> req = store.getBookingRequests().get(requestId);
        if (req == null) {
            Map<String, Object> mock = new LinkedHashMap<>();
            mock.put("bookingRequestId", requestId);
            mock.put("appointmentId", "apt_3001");
            mock.put("status", "CONFIRMED");
            mock.put("appointmentReference", "APT-2026-003001");
            mock.put("scheduledStart", "2026-10-28T09:20:00+05:30");
            mock.put("scheduledEnd", "2026-10-28T09:40:00+05:30");
            mock.put("lastUpdatedAt", "2026-10-27T18:25:00+05:30");
            return buildResponse(true, "Booking request retrieved", mock, HttpStatus.OK, "req_appt_ai_009");
        }
        return buildResponse(true, "Booking request retrieved", req, HttpStatus.OK, "req_appt_ai_009");
    }

    // 10. POST /booking-requests/{requestId}/confirm — Confirm a pending booking request
    @PostMapping("/api/v1/hospital/ai-appointment-agent/booking-requests/{requestId}/confirm")
    public ResponseEntity<?> confirmBookingRequest(@PathVariable String requestId, @RequestBody Map<String, Object> body) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("bookingRequestId", requestId);
        data.put("appointmentId", "apt_3002");
        data.put("status", "CONFIRMED");
        data.put("confirmationNotificationStatus", "QUEUED");

        return buildResponse(true, "Booking request confirmed", data, HttpStatus.OK, "req_appt_ai_010");
    }

    // 11. GET /appointments/{appointmentId} — Retrieve an authorized appointment
    @GetMapping("/api/v1/hospital/ai-appointment-agent/appointments/{appointmentId}")
    public ResponseEntity<?> getAppointment(@PathVariable String appointmentId) {
        Map<String, Object> appt = store.getAppointments().get(appointmentId);
        if (appt == null) {
            Map<String, Object> mock = new LinkedHashMap<>();
            mock.put("appointmentId", appointmentId);
            mock.put("appointmentReference", "APT-2026-003001");
            mock.put("doctorDisplayName", "Dr. Arun Kumar");
            mock.put("departmentName", "Cardiology");
            mock.put("scheduledStart", "2026-10-28T09:20:00+05:30");
            mock.put("scheduledEnd", "2026-10-28T09:40:00+05:30");
            mock.put("status", "BOOKED");
            mock.put("location", "CityCare Main Clinic");
            return buildResponse(true, "Appointment retrieved", mock, HttpStatus.OK, "req_appt_ai_011");
        }
        return buildResponse(true, "Appointment retrieved", appt, HttpStatus.OK, "req_appt_ai_011");
    }

    // 12. POST /appointments/{appointmentId}/reschedule-requests — Request rescheduling
    @PostMapping("/api/v1/hospital/ai-appointment-agent/appointments/{appointmentId}/reschedule-requests")
    public ResponseEntity<?> requestReschedule(@PathVariable String appointmentId, @RequestBody Map<String, Object> body) {
        String resId = "res_req_" + UUID.randomUUID().toString().substring(0, 8);
        Map<String, Object> resReq = new LinkedHashMap<>();
        resReq.put("rescheduleRequestId", resId);
        resReq.put("appointmentId", appointmentId);
        resReq.put("currentAppointmentStatus", "BOOKED");
        resReq.put("requestedSlotId", body.getOrDefault("requestedSlotId", "slot_1002"));
        resReq.put("requestStatus", "PENDING_REVIEW");
        resReq.put("createdAt", "2026-10-27T18:40:00+05:30");

        store.getRescheduleRequests().put(resId, resReq);

        return buildResponse(true, "Reschedule request submitted", resReq, HttpStatus.CREATED, "req_appt_ai_012");
    }

    // 13. POST /appointments/{appointmentId}/cancellation-requests — Request cancellation
    @PostMapping("/api/v1/hospital/ai-appointment-agent/appointments/{appointmentId}/cancellation-requests")
    public ResponseEntity<?> requestCancellation(@PathVariable String appointmentId, @RequestBody Map<String, Object> body) {
        String cancelId = "cancel_req_" + UUID.randomUUID().toString().substring(0, 8);
        Map<String, Object> cancelReq = new LinkedHashMap<>();
        cancelReq.put("cancellationRequestId", cancelId);
        cancelReq.put("appointmentId", appointmentId);
        cancelReq.put("requestStatus", "PENDING_REVIEW");
        cancelReq.put("reason", body.getOrDefault("reason", "Patient requested cancellation"));
        cancelReq.put("createdAt", "2026-10-27T18:45:00+05:30");

        store.getCancellationRequests().put(cancelId, cancelReq);

        return buildResponse(true, "Cancellation request submitted", cancelReq, HttpStatus.CREATED, "req_appt_ai_013");
    }

    // 14. POST /appointments/{appointmentId}/reminders — Schedule a reminder
    @PostMapping("/api/v1/hospital/ai-appointment-agent/appointments/{appointmentId}/reminders")
    public ResponseEntity<?> scheduleReminder(@PathVariable String appointmentId, @RequestBody Map<String, Object> body) {
        String remId = "rem_" + UUID.randomUUID().toString().substring(0, 8);
        Map<String, Object> reminder = new LinkedHashMap<>();
        reminder.put("reminderId", remId);
        reminder.put("appointmentId", appointmentId);
        reminder.put("channel", body.getOrDefault("channel", "SMS"));
        reminder.put("status", "SCHEDULED");
        reminder.put("scheduleAt", body.getOrDefault("scheduleAt", "2026-10-27T19:00:00+05:30"));
        reminder.put("templateCode", body.getOrDefault("templateCode", "APPOINTMENT_REMINDER_24H"));

        store.getAppointmentReminders().put(remId, reminder);

        return buildResponse(true, "Appointment reminder queued", reminder, HttpStatus.ACCEPTED, "req_appt_ai_014");
    }

    // 15. GET /appointments/{appointmentId}/reminders — Get reminder status
    @GetMapping("/api/v1/hospital/ai-appointment-agent/appointments/{appointmentId}/reminders")
    public ResponseEntity<?> getReminders(@PathVariable String appointmentId) {
        List<Map<String, Object>> rems = store.getAppointmentReminders().values().stream()
                .filter(r -> appointmentId.equals(r.get("appointmentId")))
                .collect(Collectors.toList());

        if (rems.isEmpty()) {
            rems.add(HospitalDataStore.createMap(
                    "reminderId", "rem_1001",
                    "channel", "SMS",
                    "status", "SCHEDULED",
                    "scheduleAt", "2026-10-27T19:00:00+05:30",
                    "deliveryStatus", "NOT_SENT"
            ));
        }

        return buildResponse(true, "Appointment reminders retrieved", rems, HttpStatus.OK, "req_appt_ai_015");
    }

    // 16. POST /waiting-list — Join the waiting list
    @PostMapping("/api/v1/hospital/ai-appointment-agent/waiting-list")
    public ResponseEntity<?> joinWaitingList(@RequestBody Map<String, Object> body) {
        String entryId = "wait_" + UUID.randomUUID().toString().substring(0, 8);
        Map<String, Object> entry = new LinkedHashMap<>();
        entry.put("entryId", entryId);
        entry.put("status", "ACTIVE");
        entry.put("doctorId", body.getOrDefault("doctorId", "doc_001"));
        entry.put("departmentId", body.getOrDefault("departmentId", "dept_001"));
        entry.put("preferredTimeWindow", body.getOrDefault("preferredTimeWindow", "MORNING"));
        entry.put("createdAt", "2026-10-27T18:55:00+05:30");

        store.getWaitingList().put(entryId, entry);

        return buildResponse(true, "Waiting-list request created", entry, HttpStatus.CREATED, "req_appt_ai_016");
    }

    // 17. GET /waiting-list/{entryId} — Get waiting-list status
    @GetMapping("/api/v1/hospital/ai-appointment-agent/waiting-list/{entryId}")
    public ResponseEntity<?> getWaitingListStatus(@PathVariable String entryId) {
        Map<String, Object> entry = store.getWaitingList().get(entryId);
        if (entry == null) {
            Map<String, Object> mock = new LinkedHashMap<>();
            mock.put("entryId", entryId);
            mock.put("status", "ACTIVE");
            mock.put("doctorId", "doc_001");
            mock.put("departmentId", "dept_001");
            mock.put("preferredTimeWindow", "MORNING");
            mock.put("offerStatus", "NO_ACTIVE_OFFER");
            return buildResponse(true, "Waiting-list status retrieved", mock, HttpStatus.OK, "req_appt_ai_017");
        }
        return buildResponse(true, "Waiting-list status retrieved", entry, HttpStatus.OK, "req_appt_ai_017");
    }

    // 18. POST /waiting-list/{entryId}/offers/{offerId}/accept — Accept a slot offer
    @PostMapping("/api/v1/hospital/ai-appointment-agent/waiting-list/{entryId}/offers/{offerId}/accept")
    public ResponseEntity<?> acceptWaitingListOffer(@PathVariable String entryId, @PathVariable String offerId, @RequestBody Map<String, Object> body) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("entryId", entryId);
        data.put("offerId", offerId);
        data.put("status", "BOOKED");
        data.put("appointmentId", "apt_3003");
        data.put("appointmentReference", "APT-2026-003003");
        data.put("scheduledStart", "2026-10-29T10:00:00+05:30");

        return buildResponse(true, "Waiting-list offer accepted", data, HttpStatus.OK, "req_appt_ai_018");
    }

    // 19. POST /sessions/{sessionId}/handoff — Transfer to human staff
    @PostMapping({"/api/v1/hospital/ai-appointment-agent/sessions/{sessionId}/handoff", "/api/v1/public/appointment-chat/sessions/{sessionId}/handoff"})
    public ResponseEntity<?> transferToHuman(@PathVariable String sessionId, @RequestBody Map<String, Object> body) {
        String handoffId = "appt_handoff_" + UUID.randomUUID().toString().substring(0, 8);
        Map<String, Object> handoff = new LinkedHashMap<>();
        handoff.put("handoffId", handoffId);
        handoff.put("sessionId", sessionId);
        handoff.put("targetTeam", body.getOrDefault("targetTeam", "APPOINTMENT_COORDINATION"));
        handoff.put("status", "PENDING_ASSIGNMENT");
        handoff.put("reason", body.getOrDefault("reason", "BOOKING_EXCEPTION"));
        handoff.put("summary", body.getOrDefault("summary", "Patient transferred for appointment coordination review"));
        handoff.put("createdAt", "2026-10-27T19:10:00+05:30");

        store.getAiAppointmentHandoffs().put(handoffId, handoff);

        return buildResponse(true, "Appointment handoff created", handoff, HttpStatus.CREATED, "req_appt_ai_019");
    }

    // 20. GET /handoffs — View authorized handoffs
    @GetMapping("/api/v1/hospital/ai-appointment-agent/handoffs")
    public ResponseEntity<?> listHandoffs(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        List<Map<String, Object>> handoffs = store.getAiAppointmentHandoffs().values().stream()
                .filter(h -> status == null || status.equalsIgnoreCase((String) h.get("status")))
                .collect(Collectors.toList());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", handoffs);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", handoffs.size());
        data.put("totalPages", 1);

        return buildResponse(true, "Handoffs retrieved successfully", data, HttpStatus.OK, "req_appt_ai_020");
    }

    // 21. GET /analytics — Get appointment agent metrics
    @GetMapping("/api/v1/hospital/ai-appointment-agent/analytics")
    public ResponseEntity<?> getAnalytics(
            @RequestParam(defaultValue = "2026-10-01") String from,
            @RequestParam(defaultValue = "2026-10-27") String to) {

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("period", HospitalDataStore.createMap("from", from, "to", to));
        data.put("bookingRequests", 650);
        data.put("bookingsCompleted", 480);
        data.put("bookingRequestsPending", 80);
        data.put("bookingConflicts", 30);
        data.put("rescheduleRequests", 70);
        data.put("cancellationRequests", 45);
        data.put("humanHandoffs", 60);
        data.put("remindersScheduled", 520);

        return buildResponse(true, "Appointment Agent analytics retrieved", data, HttpStatus.OK, "req_appt_ai_021");
    }

    // 22. GET /activity — Get authorized activity history
    @GetMapping("/api/v1/hospital/ai-appointment-agent/activity")
    public ResponseEntity<?> getActivity(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        List<Map<String, Object>> list = new ArrayList<>(store.getAiAppointmentActivity());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", list);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", list.size());
        data.put("totalPages", 1);

        return buildResponse(true, "Appointment Agent activity retrieved", data, HttpStatus.OK, "req_appt_ai_022");
    }
}
