package com.zenelait.crm.controller;

import com.zenelait.crm.common.exception.ForbiddenException;
import com.zenelait.crm.common.exception.ResourceNotFoundException;
import com.zenelait.crm.tenant.TenantSecurityService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

/**
 * Zenelait AI CRM — Software/IT Tenant: AI Appointment Agent V1 Controller
 * Base Path: /api/v1/software/ai/appointments
 * 20 Endpoints covering appointment sessions, slot availability checks, booking requests, confirmations, rescheduling, cancellations, reminders, and audit metrics.
 */
@RestController
@RequestMapping("/api/v1/software/ai/appointments")
@CrossOrigin(origins = "*")
public class SoftwareAiAppointmentV1Controller {

    private final TenantSecurityService tenantSecurityService;

    // Agent Configuration
    private final Map<String, Object> agentConfig = new LinkedHashMap<>();

    // Sessions & Messages
    private final Map<String, Map<String, Object>> sessions = new LinkedHashMap<>();
    private final Map<String, List<Map<String, Object>>> sessionMessages = new LinkedHashMap<>();

    // Booking Requests & Confirmed Appointments
    private final Map<String, Map<String, Object>> bookingRequests = new LinkedHashMap<>();
    private final Map<String, Map<String, Object>> appointments = new LinkedHashMap<>();
    private final Map<String, List<Map<String, Object>>> appointmentEvents = new LinkedHashMap<>();
    private final Map<String, List<Map<String, Object>>> appointmentReminders = new LinkedHashMap<>();

    // Audit Events
    private final List<Map<String, Object>> auditEvents = new ArrayList<>();

    private final AtomicInteger sessionCounter = new AtomicInteger(1001);
    private final AtomicInteger requestCounter = new AtomicInteger(1001);
    private final AtomicInteger appointmentCounter = new AtomicInteger(2001);
    private final AtomicInteger reminderCounter = new AtomicInteger(5001);
    private final AtomicInteger auditCounter = new AtomicInteger(9001);

    public SoftwareAiAppointmentV1Controller(TenantSecurityService tenantSecurityService) {
        this.tenantSecurityService = tenantSecurityService;
        initSeedData();
    }

    private void validateSoftwareTenant() {
        try {
            String tenantId = tenantSecurityService.getCurrentTenantId();
            if (tenantId != null && tenantId.toUpperCase().contains("RE")) {
                throw new ForbiddenException("Access denied: AI Appointment Agent is restricted to Software/IT tenants only.");
            }
        } catch (ForbiddenException fe) {
            throw fe;
        } catch (Exception ignored) {
            // Mock or unauthenticated fallback
        }
    }

    private void initSeedData() {
        // Configuration
        agentConfig.put("agentName", "Zenelait Software Demo & Technical Scheduling Agent");
        agentConfig.put("enabled", true);
        agentConfig.put("defaultTimezone", "Asia/Kolkata");
        agentConfig.put("defaultDurationMinutes", 30);
        agentConfig.put("bufferMinutesBetweenMeetings", 15);
        agentConfig.put("autoConfirm", false);
        agentConfig.put("workingDays", List.of("MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"));
        agentConfig.put("workingHours", "09:00 - 18:00 IST");
        agentConfig.put("supportedTypes", List.of(
                "SOFTWARE_DEMO",
                "SALES_DISCOVERY",
                "TECHNICAL_CONSULTATION",
                "CUSTOMER_ONBOARDING",
                "SUPPORT_CONSULTATION",
                "REQUIREMENTS_MEETING"
        ));

        // Seed initial appointment session
        String sId = "AAS-1001";
        Map<String, Object> s = new LinkedHashMap<>();
        s.put("sessionId", sId);
        s.put("status", "ACTIVE");
        s.put("intent", "SOFTWARE_DEMO");
        s.put("channel", "WEBSITE_CHAT");
        s.put("customerId", "CUS-1001");
        s.put("customerName", "Arun Kumar");
        s.put("createdAt", "2026-10-26T11:00:00+05:30");
        sessions.put(sId, s);

        List<Map<String, Object>> msgs = new ArrayList<>();
        msgs.add(Map.of("messageId", "msg-1", "sender", "USER", "text", "I want to book a demo of your CRM software.", "timestamp", "2026-10-26T11:00:00+05:30"));
        msgs.add(Map.of("messageId", "msg-2", "sender", "AI", "text", "I can help arrange a 30-minute CRM demonstration. What timezone should I use for your appointment?", "timestamp", "2026-10-26T11:00:05+05:30"));
        sessionMessages.put(sId, msgs);

        // Seed initial Booking Request
        String rId = "APR-1001";
        Map<String, Object> req = new LinkedHashMap<>();
        req.put("requestId", rId);
        req.put("sessionId", sId);
        req.put("customerId", "CUS-1001");
        req.put("customerName", "Arun Kumar");
        req.put("customerEmail", "arun@example.com");
        req.put("appointmentType", "SOFTWARE_DEMO");
        req.put("subject", "Zenelait CRM demonstration");
        req.put("startAt", "2026-10-27T14:00:00+05:30");
        req.put("durationMinutes", 30);
        req.put("timezone", "Asia/Kolkata");
        req.put("attendees", List.of(Map.of("name", "Arun Kumar", "email", "arun@example.com")));
        req.put("notes", "Interested in sales and support automation");
        req.put("status", "PENDING_CONFIRMATION");
        req.put("createdAt", "2026-10-26T11:05:00+05:30");
        bookingRequests.put(rId, req);

        // Seed confirmed appointment
        String aptId = "APT-2001";
        Map<String, Object> apt = new LinkedHashMap<>();
        apt.put("appointmentId", aptId);
        apt.put("requestId", rId);
        apt.put("customerName", "Arun Kumar");
        apt.put("customerEmail", "arun@example.com");
        apt.put("subject", "Zenelait CRM demonstration");
        apt.put("appointmentType", "SOFTWARE_DEMO");
        apt.put("status", "CONFIRMED");
        apt.put("startAt", "2026-10-27T14:00:00+05:30");
        apt.put("durationMinutes", 30);
        apt.put("timezone", "Asia/Kolkata");
        apt.put("host", "Rahul Sharma");
        apt.put("confirmationDeliveryStatus", "QUEUED");
        apt.put("createdAt", "2026-10-26T11:10:00+05:30");
        appointments.put(aptId, apt);

        List<Map<String, Object>> events = new ArrayList<>();
        events.add(Map.of("eventId", "EVT-1", "type", "APPOINTMENT_REQUESTED", "timestamp", "2026-10-26T11:05:00+05:30", "details", "Slot requested for Oct 27 14:00"));
        events.add(Map.of("eventId", "EVT-2", "type", "CALENDAR_VALIDATED", "timestamp", "2026-10-26T11:09:00+05:30", "details", "Google Calendar availability confirmed"));
        events.add(Map.of("eventId", "EVT-3", "type", "APPOINTMENT_CONFIRMED", "timestamp", "2026-10-26T11:10:00+05:30", "details", "Confirmed with host Rahul Sharma"));
        appointmentEvents.put(aptId, events);

        recordAuditEvent("AGENT_STARTED", "SYS", "AI Appointment Agent service initialized.");
    }

    private void recordAuditEvent(String action, String targetId, String details) {
        Map<String, Object> evt = new LinkedHashMap<>();
        evt.put("auditId", "AUD-" + auditCounter.incrementAndGet());
        evt.put("action", action);
        evt.put("targetId", targetId);
        evt.put("details", details);
        evt.put("timestamp", LocalDateTime.now().toString());
        auditEvents.add(0, evt);
    }

    // 1. GET /config
    @GetMapping("/config")
    public ResponseEntity<Map<String, Object>> getConfig() {
        validateSoftwareTenant();
        return ResponseEntity.ok(Map.of("success", true, "message", "Appointment agent configuration retrieved", "data", agentConfig));
    }

    // 2. PATCH /config
    @PatchMapping("/config")
    public ResponseEntity<Map<String, Object>> updateConfig(@RequestBody Map<String, Object> updates) {
        validateSoftwareTenant();
        agentConfig.putAll(updates);
        recordAuditEvent("CONFIG_UPDATED", "AGENT_CONFIG", "Updated configuration settings: " + updates.keySet());
        return ResponseEntity.ok(Map.of("success", true, "message", "Appointment agent configuration updated", "data", agentConfig));
    }

    // 3. POST /sessions
    @PostMapping("/sessions")
    public ResponseEntity<Map<String, Object>> startSession(@RequestBody Map<String, Object> body) {
        validateSoftwareTenant();
        String sId = "AAS-" + sessionCounter.incrementAndGet();
        Map<String, Object> s = new LinkedHashMap<>();
        s.put("sessionId", sId);
        s.put("channel", body.getOrDefault("channel", "WEBSITE_CHAT"));
        s.put("customerId", body.get("customerId"));
        s.put("status", "ACTIVE");
        s.put("intent", "SOFTWARE_DEMO");
        s.put("language", body.getOrDefault("language", "en"));
        s.put("createdAt", LocalDateTime.now().toString());

        sessions.put(sId, s);
        sessionMessages.put(sId, new ArrayList<>());

        if (body.get("initialMessage") != null) {
            sessionMessages.get(sId).add(Map.of("messageId", UUID.randomUUID().toString(), "sender", "USER", "text", body.get("initialMessage"), "timestamp", LocalDateTime.now().toString()));
        }

        recordAuditEvent("SESSION_CREATED", sId, "Appointment conversation started on " + s.get("channel"));

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("sessionId", sId);
        data.put("status", "ACTIVE");
        data.put("intent", "SOFTWARE_DEMO");
        data.put("channel", s.get("channel"));

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "message", "Appointment conversation started", "data", data));
    }

    // 4. GET /sessions/{sessionId}
    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<Map<String, Object>> getSession(@PathVariable String sessionId) {
        validateSoftwareTenant();
        Map<String, Object> s = sessions.get(sessionId);
        if (s == null) {
            throw new ResourceNotFoundException("Appointment session not found: " + sessionId);
        }
        Map<String, Object> data = new LinkedHashMap<>(s);
        data.put("messages", sessionMessages.getOrDefault(sessionId, Collections.emptyList()));
        return ResponseEntity.ok(Map.of("success", true, "message", "Session retrieved", "data", data));
    }

    // 5. POST /sessions/{sessionId}/messages
    @PostMapping("/sessions/{sessionId}/messages")
    public ResponseEntity<Map<String, Object>> sendMessage(@PathVariable String sessionId, @RequestBody Map<String, Object> body) {
        validateSoftwareTenant();
        Map<String, Object> s = sessions.get(sessionId);
        if (s == null) {
            throw new ResourceNotFoundException("Session not found: " + sessionId);
        }

        String userMsg = (String) body.get("message");
        sessionMessages.get(sessionId).add(Map.of("messageId", UUID.randomUUID().toString(), "sender", "USER", "text", userMsg, "timestamp", LocalDateTime.now().toString()));

        String reply;
        Map<String, Object> collectedDetails = new LinkedHashMap<>();
        collectedDetails.put("appointmentType", "SOFTWARE_DEMO");
        collectedDetails.put("durationMinutes", 30);
        collectedDetails.put("preferredPeriod", "AFTERNOON");
        collectedDetails.put("preferredDate", "2026-10-27");
        collectedDetails.put("timezone", "Asia/Kolkata");

        if (userMsg.toLowerCase().contains("timezone") || userMsg.toLowerCase().contains("ist") || userMsg.toLowerCase().contains("kolkata")) {
            reply = "Great! I have available afternoon slots tomorrow at 14:00 IST and 15:00 IST. Would 14:00 work well for your team?";
        } else if (userMsg.toLowerCase().contains("afternoon") || userMsg.toLowerCase().contains("tomorrow")) {
            reply = "I can help arrange a 30-minute CRM demonstration. What timezone should I use for your appointment?";
        } else {
            reply = "Thank you! I have recorded your meeting request. Which date and time slot would you prefer?";
        }

        sessionMessages.get(sessionId).add(Map.of("messageId", UUID.randomUUID().toString(), "sender", "AI", "text", reply, "timestamp", LocalDateTime.now().toString()));

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("sessionId", sessionId);
        data.put("reply", reply);
        data.put("intent", "SOFTWARE_DEMO");
        data.put("collectedDetails", collectedDetails);
        data.put("nextAction", "COLLECT_TIMEZONE");

        return ResponseEntity.ok(Map.of("success", true, "message", "Appointment enquiry processed", "data", data));
    }

    // 6. GET /availability
    @GetMapping("/availability")
    public ResponseEntity<Map<String, Object>> getAvailability(
            @RequestParam(defaultValue = "2026-10-27") String date,
            @RequestParam(defaultValue = "30") int durationMinutes,
            @RequestParam(defaultValue = "Asia/Kolkata") String timezone,
            @RequestParam(defaultValue = "SOFTWARE_DEMO") String appointmentType
    ) {
        validateSoftwareTenant();
        List<Map<String, Object>> slots = new ArrayList<>();
        slots.add(Map.of("slotId", "SLOT-1001", "startAt", date + "T14:00:00+05:30", "endAt", date + "T14:30:00+05:30", "available", true));
        slots.add(Map.of("slotId", "SLOT-1002", "startAt", date + "T15:00:00+05:30", "endAt", date + "T15:30:00+05:30", "available", true));
        slots.add(Map.of("slotId", "SLOT-1003", "startAt", date + "T16:30:00+05:30", "endAt", date + "T17:00:00+05:30", "available", true));

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("date", date);
        data.put("timezone", timezone);
        data.put("slots", slots);

        return ResponseEntity.ok(Map.of("success", true, "message", "Available appointment slots retrieved", "data", data));
    }

    // 7. POST /booking-requests
    @PostMapping("/booking-requests")
    public ResponseEntity<Map<String, Object>> createBookingRequest(@RequestBody Map<String, Object> body) {
        validateSoftwareTenant();
        String rId = "APR-" + requestCounter.incrementAndGet();
        Map<String, Object> req = new LinkedHashMap<>(body);
        req.put("requestId", rId);
        req.put("status", "PENDING_CONFIRMATION");
        req.put("createdAt", LocalDateTime.now().toString());

        bookingRequests.put(rId, req);
        recordAuditEvent("REQUEST_SUBMITTED", rId, "Appointment requested: " + req.get("subject"));

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("requestId", rId);
        data.put("appointmentType", req.get("appointmentType"));
        data.put("startAt", req.get("startAt"));
        data.put("durationMinutes", req.get("durationMinutes"));
        data.put("status", "PENDING_CONFIRMATION");

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "message", "Appointment request submitted", "data", data));
    }

    // 8. GET /booking-requests
    @GetMapping("/booking-requests")
    public ResponseEntity<Map<String, Object>> listBookingRequests() {
        validateSoftwareTenant();
        return ResponseEntity.ok(Map.of("success", true, "message", "Booking requests loaded", "data", new ArrayList<>(bookingRequests.values())));
    }

    // 9. GET /booking-requests/{requestId}
    @GetMapping("/booking-requests/{requestId}")
    public ResponseEntity<Map<String, Object>> getBookingRequest(@PathVariable String requestId) {
        validateSoftwareTenant();
        Map<String, Object> req = bookingRequests.get(requestId);
        if (req == null) {
            throw new ResourceNotFoundException("Booking request not found: " + requestId);
        }
        return ResponseEntity.ok(Map.of("success", true, "message", "Booking request details", "data", req));
    }

    // 10. POST /booking-requests/{requestId}/confirm
    @PostMapping("/booking-requests/{requestId}/confirm")
    public ResponseEntity<Map<String, Object>> confirmBookingRequest(@PathVariable String requestId, @RequestBody(required = false) Map<String, Object> body) {
        validateSoftwareTenant();
        Map<String, Object> req = bookingRequests.get(requestId);
        if (req == null) {
            throw new ResourceNotFoundException("Booking request not found: " + requestId);
        }

        req.put("status", "CONFIRMED");
        String aptId = "APT-" + appointmentCounter.incrementAndGet();

        Map<String, Object> apt = new LinkedHashMap<>();
        apt.put("appointmentId", aptId);
        apt.put("requestId", requestId);
        apt.put("status", "CONFIRMED");
        apt.put("startAt", req.get("startAt"));
        apt.put("durationMinutes", req.get("durationMinutes"));
        apt.put("confirmationDeliveryStatus", "QUEUED");
        apt.put("subject", req.get("subject"));
        apt.put("appointmentType", req.get("appointmentType"));
        apt.put("createdAt", LocalDateTime.now().toString());

        appointments.put(aptId, apt);
        appointmentEvents.computeIfAbsent(aptId, k -> new ArrayList<>()).add(Map.of(
                "eventId", "EVT-CONF", "type", "CONFIRMED", "timestamp", LocalDateTime.now().toString(), "details", "Confirmed via calendar validation"
        ));

        recordAuditEvent("APPOINTMENT_CONFIRMED", aptId, "Appointment confirmed for request: " + requestId);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("appointmentId", aptId);
        data.put("requestId", requestId);
        data.put("status", "CONFIRMED");
        data.put("startAt", apt.get("startAt"));
        data.put("durationMinutes", apt.get("durationMinutes"));
        data.put("confirmationDeliveryStatus", "QUEUED");

        return ResponseEntity.ok(Map.of("success", true, "message", "Appointment confirmed", "data", data));
    }

    // 11. POST /booking-requests/{requestId}/reschedule
    @PostMapping("/booking-requests/{requestId}/reschedule")
    public ResponseEntity<Map<String, Object>> rescheduleBookingRequest(@PathVariable String requestId, @RequestBody Map<String, Object> body) {
        validateSoftwareTenant();
        Map<String, Object> req = bookingRequests.get(requestId);
        if (req == null) {
            throw new ResourceNotFoundException("Booking request not found: " + requestId);
        }

        String prevStart = (String) req.get("startAt");
        String newStart = (String) body.get("newStartAt");
        req.put("startAt", newStart);
        req.put("status", "RESCHEDULED");

        recordAuditEvent("APPOINTMENT_RESCHEDULED", requestId, "Rescheduled from " + prevStart + " to " + newStart);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("appointmentId", "APT-2001");
        data.put("previousStartAt", prevStart);
        data.put("startAt", newStart);
        data.put("status", "RESCHEDULED");

        return ResponseEntity.ok(Map.of("success", true, "message", "Reschedule request processed", "data", data));
    }

    // 12. POST /booking-requests/{requestId}/cancel
    @PostMapping("/booking-requests/{requestId}/cancel")
    public ResponseEntity<Map<String, Object>> cancelBookingRequest(@PathVariable String requestId, @RequestBody(required = false) Map<String, Object> body) {
        validateSoftwareTenant();
        Map<String, Object> req = bookingRequests.get(requestId);
        if (req == null) {
            throw new ResourceNotFoundException("Booking request not found: " + requestId);
        }

        req.put("status", "CANCELLED");
        String reason = body != null ? (String) body.getOrDefault("reason", "Cancelled by customer") : "Cancelled";
        req.put("cancellationReason", reason);

        recordAuditEvent("APPOINTMENT_CANCELLED", requestId, "Cancelled reason: " + reason);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("appointmentId", "APT-2001");
        data.put("status", "CANCELLED");
        data.put("cancellationReason", reason);
        data.put("notificationStatus", "QUEUED");

        return ResponseEntity.ok(Map.of("success", true, "message", "Appointment cancellation processed", "data", data));
    }

    // 13. GET /appointments
    @GetMapping("/appointments")
    public ResponseEntity<Map<String, Object>> listAppointments() {
        validateSoftwareTenant();
        return ResponseEntity.ok(Map.of("success", true, "message", "Appointments loaded", "data", new ArrayList<>(appointments.values())));
    }

    // 14. GET /appointments/{appointmentId}
    @GetMapping("/appointments/{appointmentId}")
    public ResponseEntity<Map<String, Object>> getAppointment(@PathVariable String appointmentId) {
        validateSoftwareTenant();
        Map<String, Object> apt = appointments.get(appointmentId);
        if (apt == null) {
            throw new ResourceNotFoundException("Appointment not found: " + appointmentId);
        }
        return ResponseEntity.ok(Map.of("success", true, "message", "Appointment details loaded", "data", apt));
    }

    // 15. POST /appointments/{appointmentId}/reminders
    @PostMapping("/appointments/{appointmentId}/reminders")
    public ResponseEntity<Map<String, Object>> createReminder(@PathVariable String appointmentId, @RequestBody Map<String, Object> body) {
        validateSoftwareTenant();
        String remId = "REM-" + reminderCounter.incrementAndGet();
        Map<String, Object> rem = new LinkedHashMap<>();
        rem.put("reminderId", remId);
        rem.put("appointmentId", appointmentId);
        rem.put("reminderType", body.getOrDefault("reminderType", "EMAIL_REMINDER_1H"));
        rem.put("scheduledAt", body.getOrDefault("scheduledAt", LocalDateTime.now().plusHours(2).toString()));
        rem.put("channel", body.getOrDefault("channel", "EMAIL"));
        rem.put("status", "SCHEDULED");

        appointmentReminders.computeIfAbsent(appointmentId, k -> new ArrayList<>()).add(rem);
        recordAuditEvent("REMINDER_SCHEDULED", remId, "Scheduled reminder for " + appointmentId);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "message", "Reminder created", "data", rem));
    }

    // 16. GET /appointments/{appointmentId}/events
    @GetMapping("/appointments/{appointmentId}/events")
    public ResponseEntity<Map<String, Object>> getAppointmentEvents(@PathVariable String appointmentId) {
        validateSoftwareTenant();
        List<Map<String, Object>> events = appointmentEvents.getOrDefault(appointmentId, Collections.emptyList());
        return ResponseEntity.ok(Map.of("success", true, "message", "Appointment events loaded", "data", events));
    }

    // 17. POST /sessions/{sessionId}/handoff
    @PostMapping("/sessions/{sessionId}/handoff")
    public ResponseEntity<Map<String, Object>> handoff(@PathVariable String sessionId, @RequestBody Map<String, Object> body) {
        validateSoftwareTenant();
        Map<String, Object> s = sessions.get(sessionId);
        if (s == null) {
            throw new ResourceNotFoundException("Session not found: " + sessionId);
        }
        s.put("status", "HANDOFF_PENDING");
        s.put("handoffReason", body.get("reason"));

        recordAuditEvent("SESSION_HANDOFF", sessionId, "Transferred appointment session to human representative");
        return ResponseEntity.ok(Map.of("success", true, "message", "Session transferred to human representative", "data", s));
    }

    // 18. POST /sessions/{sessionId}/close
    @PostMapping("/sessions/{sessionId}/close")
    public ResponseEntity<Map<String, Object>> closeSession(@PathVariable String sessionId) {
        validateSoftwareTenant();
        Map<String, Object> s = sessions.get(sessionId);
        if (s == null) {
            throw new ResourceNotFoundException("Session not found: " + sessionId);
        }
        s.put("status", "CLOSED");
        recordAuditEvent("SESSION_CLOSED", sessionId, "Appointment session closed");
        return ResponseEntity.ok(Map.of("success", true, "message", "Appointment session closed", "data", s));
    }

    // 19. GET /metrics
    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getMetrics(@RequestParam(defaultValue = "THIS_MONTH") String period) {
        validateSoftwareTenant();
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("appointmentsRequested", 320);
        data.put("appointmentsConfirmed", 240);
        data.put("appointmentsCompleted", 198);
        data.put("appointmentsCancelled", 18);
        data.put("rescheduleRequests", 25);
        data.put("noShows", 9);
        data.put("confirmationRatePercentage", 75.0);

        return ResponseEntity.ok(Map.of("success", true, "message", "Appointment metrics retrieved", "data", data));
    }

    // 20. GET /audit-events
    @GetMapping("/audit-events")
    public ResponseEntity<Map<String, Object>> getAuditEvents() {
        validateSoftwareTenant();
        return ResponseEntity.ok(Map.of("success", true, "message", "Audit events loaded", "data", auditEvents));
    }
}
