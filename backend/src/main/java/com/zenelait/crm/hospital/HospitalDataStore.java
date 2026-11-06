package com.zenelait.crm.hospital;

import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * Zenelait AI CRM — Hospital / Clinic Tenant Shared Data Store
 * Coordinates shared records across Reception Manager, Receptionist, Customer Support,
 * and Appointment Coordinator modules.
 *
 * Scope boundary:
 * Administrative workflows only. AI agents must NOT diagnose, prescribe, or independently
 * decide clinical urgency. Potential emergencies follow the clinic's approved escalation protocol.
 */
@Component
public class HospitalDataStore {

    private final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ssXXX");

    // Shared Entities
    private final Map<String, Map<String, Object>> patients = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> doctors = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> departments = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> appointmentSlots = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> appointments = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> receptionQueue = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> receptionStaff = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> workAssignments = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> patientEnquiries = new ConcurrentHashMap<>();
    private final Map<String, List<Map<String, Object>>> enquiryNotes = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> escalations = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> supportTickets = new ConcurrentHashMap<>();
    private final Map<String, List<Map<String, Object>>> ticketMessages = new ConcurrentHashMap<>();
    private final Map<String, List<Map<String, Object>>> ticketNotes = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> conversations = new ConcurrentHashMap<>();
    private final Map<String, List<Map<String, Object>>> conversationMessages = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> aiReplyDrafts = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> supportFollowUpTasks = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> knowledgeArticles = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> bookingRequests = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> rescheduleRequests = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> cancellationRequests = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> waitingList = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> waitingListOffers = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> appointmentReminders = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> aiConfig = new ConcurrentHashMap<>();
    private final List<Map<String, Object>> auditEvents = Collections.synchronizedList(new ArrayList<>());
    private final Map<String, Map<String, Object>> receptionTasks = new ConcurrentHashMap<>();

    // Additional Modules Data Stores
    // 1. Doctor / Staff User
    private final Map<String, Map<String, Object>> staffProfiles = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> staffAvailabilityRules = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> staffTasks = new ConcurrentHashMap<>();
    private final Map<String, List<Map<String, Object>>> staffTaskNotes = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> staffNotifications = new ConcurrentHashMap<>();
    private final List<Map<String, Object>> staffActivity = Collections.synchronizedList(new ArrayList<>());

    // 2. AI Receptionist
    private final Map<String, Map<String, Object>> aiReceptionistConfig = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> aiReceptionistSessions = new ConcurrentHashMap<>();
    private final Map<String, List<Map<String, Object>>> aiReceptionistMessages = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> aiReceptionistFeedback = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> aiReceptionistHandoffs = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> knowledgeSources = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> knowledgeSyncs = new ConcurrentHashMap<>();
    private final List<Map<String, Object>> aiReceptionistActivity = Collections.synchronizedList(new ArrayList<>());

    // 3. AI Appointment Agent
    private final Map<String, Map<String, Object>> aiAppointmentConfig = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> aiAppointmentSessions = new ConcurrentHashMap<>();
    private final Map<String, List<Map<String, Object>>> aiAppointmentMessages = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> aiAppointmentHandoffs = new ConcurrentHashMap<>();
    private final List<Map<String, Object>> aiAppointmentActivity = Collections.synchronizedList(new ArrayList<>());

    public HospitalDataStore() {
        initDefaultSeedData();
    }

    private void initDefaultSeedData() {
        String timestamp = "2026-10-27T18:00:00+05:30";

        // 1. Departments
        departments.put("dept_01", createMap(
                "departmentId", "dept_01",
                "code", "GENERAL_MEDICINE",
                "name", "General Medicine & Outpatient",
                "floor", "1st Floor, Wing A",
                "status", "ACTIVE"
        ));
        departments.put("dept_02", createMap(
                "departmentId", "dept_02",
                "code", "CARDIOLOGY",
                "name", "Cardiology Clinic",
                "floor", "2nd Floor, Wing B",
                "status", "ACTIVE"
        ));
        departments.put("dept_03", createMap(
                "departmentId", "dept_03",
                "code", "PEDIATRICS",
                "name", "Pediatrics & Child Wellness",
                "floor", "Ground Floor, Wing C",
                "status", "ACTIVE"
        ));

        // 2. Doctors
        doctors.put("doc_2101", createMap(
                "doctorId", "doc_2101",
                "displayName", "Dr. Example",
                "specialization", "Internal Medicine",
                "department", "GENERAL_MEDICINE",
                "bookingEnabled", true,
                "consultationDurationMinutes", 15,
                "availableDays", List.of("MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY")
        ));
        doctors.put("doc_2102", createMap(
                "doctorId", "doc_2102",
                "displayName", "Dr. Shalini Menon",
                "specialization", "Cardiologist",
                "department", "CARDIOLOGY",
                "bookingEnabled", true,
                "consultationDurationMinutes", 20,
                "availableDays", List.of("MONDAY", "WEDNESDAY", "FRIDAY")
        ));

        // 3. Appointment Slots for Dr. Example
        appointmentSlots.put("slot_2201", createMap(
                "slotId", "slot_2201",
                "doctorId", "doc_2101",
                "date", "2026-10-29",
                "startTime", "10:00",
                "endTime", "10:15",
                "appointmentType", "CONSULTATION",
                "status", "AVAILABLE"
        ));
        appointmentSlots.put("slot_2202", createMap(
                "slotId", "slot_2202",
                "doctorId", "doc_2101",
                "date", "2026-10-29",
                "startTime", "10:15",
                "endTime", "10:30",
                "appointmentType", "CONSULTATION",
                "status", "AVAILABLE"
        ));
        appointmentSlots.put("slot_2203", createMap(
                "slotId", "slot_2203",
                "doctorId", "doc_2101",
                "date", "2026-10-29",
                "startTime", "10:30",
                "endTime", "10:45",
                "appointmentType", "CONSULTATION",
                "status", "AVAILABLE"
        ));

        // 4. Shared Patient
        patients.put("pat_7001", createMap(
                "patientId", "pat_7001",
                "patientReference", "PAT-1042",
                "fullName", "Arun Kumar",
                "dateOfBirth", "1998-04-15",
                "phone", "+919876543210",
                "phoneMasked", "******3210",
                "email", "arun.kumar@example.com",
                "preferredLanguage", "en",
                "registrationSource", "WALK_IN",
                "registrationStatus", "REGISTERED",
                "consents", createMap("appointmentNotifications", true, "marketingMessages", false),
                "tenantId", "tenant-4",
                "createdAt", timestamp
        ));

        // 5. Staff (Receptionists & Managers)
        receptionStaff.put("staff_2001", createMap(
                "staffId", "staff_2001",
                "name", "Priya Kumar",
                "email", "priya.reception@example.com",
                "phone", "+919876543210",
                "role", "RECEPTIONIST",
                "department", "FRONT_DESK",
                "shift", createMap("startTime", "09:00", "endTime", "17:00"),
                "status", "ACTIVE",
                "openAssignments", 7,
                "tenantId", "tenant-4"
        ));
        receptionStaff.put("usr_1001", createMap(
                "staffId", "usr_1001",
                "name", "Reception Manager",
                "email", "reception.manager@citycare.example",
                "role", "RECEPTION_MANAGER",
                "department", "RECEPTION_OPERATIONS",
                "status", "ACTIVE",
                "openAssignments", 0,
                "tenantId", "tenant-4"
        ));
        receptionStaff.put("usr_1401", createMap(
                "staffId", "usr_1401",
                "name", "Support Agent Vikram",
                "email", "vikram.support@citycare.example",
                "role", "CUSTOMER_SUPPORT",
                "department", "CUSTOMER_SUPPORT",
                "status", "ACTIVE",
                "openAssignments", 12,
                "tenantId", "tenant-4"
        ));

        // 6. Appointments
        appointments.put("apt_8001", createMap(
                "appointmentId", "apt_8001",
                "patientId", "pat_7001",
                "patientReference", "PAT-1042",
                "patientName", "Arun Kumar",
                "doctorId", "doc_2101",
                "doctorDisplayName", "Dr. Example",
                "department", "GENERAL_MEDICINE",
                "scheduledStart", "2026-10-27T18:30:00+05:30",
                "scheduledEnd", "2026-10-27T18:45:00+05:30",
                "status", "BOOKED",
                "confirmationStatus", "CONFIRMED",
                "bookingSource", "FRONT_DESK",
                "tenantId", "tenant-4"
        ));
        appointments.put("apt_5001", createMap(
                "appointmentId", "apt_5001",
                "patientId", "pat_7001",
                "patientReference", "PAT-1042",
                "patientName", "Arun Kumar",
                "doctorId", "doc_2101",
                "doctorDisplayName", "Dr. Example",
                "department", "GENERAL_MEDICINE",
                "scheduledStart", "2026-10-27T17:30:00+05:30",
                "scheduledEnd", "2026-10-27T17:45:00+05:30",
                "status", "CHECKED_IN",
                "confirmationStatus", "CONFIRMED",
                "checkedInAt", "2026-10-27T17:42:00+05:30",
                "tenantId", "tenant-4"
        ));

        // 7. Reception Queue Entry
        receptionQueue.put("queue_4001", createMap(
                "queueEntryId", "queue_4001",
                "appointmentId", "apt_5001",
                "patientId", "pat_7001",
                "patientReference", "PAT-1042",
                "checkInTime", "2026-10-27T17:42:00+05:30",
                "status", "WAITING",
                "administrativeWaitMinutes", 18,
                "arrivalChannel", "FRONT_DESK",
                "tenantId", "tenant-4"
        ));

        // 8. Patient Enquiry
        patientEnquiries.put("enq_3001", createMap(
                "enquiryId", "enq_3001",
                "patientId", "pat_7001",
                "patientReference", "PAT-1042",
                "category", "UNRESOLVED_ADMINISTRATIVE_REQUEST",
                "channel", "PHONE",
                "subject", "Appointment scheduling assistance",
                "summary", "Patient requires supervisor assistance regarding front desk follow-up",
                "priority", "HIGH",
                "status", "ASSIGNED",
                "assignedToStaffId", "staff_2001",
                "assignedTeam", "RECEPTION",
                "assignedAt", timestamp,
                "tenantId", "tenant-4",
                "createdAt", timestamp
        ));

        // 9. Work Assignment
        workAssignments.put("asgn_01", createMap(
                "assignmentId", "asgn_01",
                "staffId", "staff_2001",
                "title", "Front Desk Queue & Triage Support",
                "type", "QUEUE_MANAGEMENT",
                "status", "ACTIVE",
                "priority", "HIGH",
                "assignedAt", timestamp,
                "tenantId", "tenant-4"
        ));

        // 10. Escalation
        escalations.put("esc_6001", createMap(
                "escalationId", "esc_6001",
                "enquiryId", "enq_3001",
                "category", "UNRESOLVED_ADMINISTRATIVE_REQUEST",
                "reason", "The enquiry requires supervisor assistance",
                "status", "OPEN",
                "assignedToStaffId", "staff_2001",
                "targetTeam", "RECEPTION_MANAGEMENT",
                "createdAt", timestamp,
                "tenantId", "tenant-4"
        ));

        // 11. Support Ticket
        supportTickets.put("tic_1301", createMap(
                "ticketId", "tic_1301",
                "ticketNumber", "SUP-2026-001301",
                "patientId", "pat_7001",
                "category", "APPOINTMENT_ENQUIRY",
                "channel", "WEBSITE_CHAT",
                "subject", "Appointment confirmation",
                "description", "The patient would like confirmation of an existing appointment.",
                "priority", "NORMAL",
                "status", "OPEN",
                "assignedToUserId", "usr_1401",
                "assignedTeam", "CUSTOMER_SUPPORT",
                "sourceReference", "webchat_2001",
                "createdAt", timestamp,
                "tenantId", "tenant-4"
        ));

        // Support Messages
        List<Map<String, Object>> msgs = new ArrayList<>();
        msgs.add(createMap(
                "messageId", "msg_1501",
                "ticketId", "tic_1301",
                "messageType", "PUBLIC_REPLY",
                "channel", "WEBSITE_CHAT",
                "content", "We can help you check your appointment details. Please complete the clinic's identity-verification process first.",
                "deliveryStatus", "RECORDED",
                "createdAt", timestamp
        ));
        ticketMessages.put("tic_1301", msgs);

        // 12. Support Conversation
        conversations.put("conversation_1801", createMap(
                "conversationId", "conversation_1801",
                "ticketId", "tic_1301",
                "patientReference", "PAT-1042",
                "channel", "WEBSITE_CHAT",
                "status", "ACTIVE",
                "createdAt", timestamp
        ));

        // 13. AI Reply Draft
        aiReplyDrafts.put("drf_1601", createMap(
                "draftId", "drf_1601",
                "ticketId", "tic_1301",
                "replyGoal", "Explain how the patient can confirm an appointment",
                "tone", "POLITE_AND_CLEAR",
                "status", "AWAITING_REVIEW",
                "content", "You can confirm your appointment through the clinic's approved booking channel. If you need assistance, our support team can help after the required identity verification.",
                "requiresHumanApproval", true,
                "knowledgeReferences", List.of(createMap("articleId", "kb_1701", "title", "Appointment Confirmation Process")),
                "createdAt", timestamp
        ));

        // 14. Support Follow-up Task
        supportFollowUpTasks.put("task_3001", createMap(
                "taskId", "task_3001",
                "ticketId", "tic_1301",
                "title", "Follow up with patient after identity verification",
                "status", "PENDING",
                "dueDate", "2026-10-28T10:00:00+05:30",
                "assignedToUserId", "usr_1401",
                "createdAt", timestamp
        ));

        // 15. Knowledge Base
        knowledgeArticles.put("kb_1701", createMap(
                "articleId", "kb_1701",
                "title", "Appointment Confirmation Process",
                "category", "APPOINTMENTS",
                "summary", "Standard administrative operating procedure for verifying and confirming patient bookings.",
                "approved", true,
                "content", "Appointments booked online or at reception require identity verification prior to confirmation notification."
        ));
        knowledgeArticles.put("kb_1702", createMap(
                "articleId", "kb_1702",
                "title", "Visiting Hours & Reception Check-in",
                "category", "CLINIC_POLICIES",
                "summary", "Operating hours are 08:00 - 20:00. Arrive 15 minutes before scheduled slot.",
                "approved", true,
                "content", "Patients checking in at the front desk should present registration ID PAT-XXXX."
        ));

        // 16. AI Config
        aiConfig.put("config", createMap(
                "autoReplyEnabled", false,
                "humanReviewRequired", true,
                "escalateExplicitEmergency", true,
                "emergencyProtocolContact", "+91 44 2800 9900",
                "prohibitMedicalDiagnosis", true,
                "tone", "EMPATHIC_PROFESSIONAL",
                "supportedChannels", List.of("WEBSITE_CHAT", "WHATSAPP", "SMS", "PHONE")
        ));

        // 17. Reception Tasks
        receptionTasks.put("rec_task_01", createMap(
                "taskId", "rec_task_01",
                "title", "Verify check-in documents for waiting queue",
                "status", "IN_PROGRESS",
                "priority", "HIGH",
                "assignedTo", "staff_2001",
                "createdAt", timestamp
        ));
        receptionTasks.put("rec_task_02", createMap(
                "taskId", "rec_task_02",
                "title", "Follow up on phone enquiry for Dr. Example schedule",
                "status", "PENDING",
                "priority", "NORMAL",
                "assignedTo", "staff_2001",
                "createdAt", timestamp
        ));

        // 18. Doctor / Staff User Seed Data
        staffProfiles.put("stf_1001", createMap(
                "staffId", "stf_1001",
                "userId", "usr_1001",
                "fullName", "Dr. Arun Kumar",
                "professionalTitle", "Doctor",
                "department", "Cardiology",
                "email", "doctor@citycare.example",
                "phone", "+919876543210",
                "role", "DOCTOR",
                "employmentStatus", "ACTIVE",
                "profileStatus", "VERIFIED",
                "timezone", "Asia/Kolkata",
                "preferredLanguage", "en",
                "availabilityStatus", "AVAILABLE"
        ));
        staffProfiles.put("stf_1002", createMap(
                "staffId", "stf_1002",
                "userId", "usr_1002",
                "fullName", "Dr. Meena Raj",
                "professionalTitle", "Doctor",
                "department", "Cardiology",
                "email", "meena.raj@citycare.example",
                "phone", "+919876543212",
                "role", "DOCTOR",
                "employmentStatus", "ACTIVE",
                "profileStatus", "VERIFIED",
                "timezone", "Asia/Kolkata",
                "preferredLanguage", "en",
                "availabilityStatus", "ON_LEAVE"
        ));
        staffProfiles.put("stf_reception_001", createMap(
                "staffId", "stf_reception_001",
                "userId", "usr_2001",
                "fullName", "Priya Sharma",
                "professionalTitle", "Receptionist",
                "department", "Front Desk",
                "email", "priya.s@citycare.example",
                "phone", "+919876543215",
                "role", "RECEPTIONIST",
                "employmentStatus", "ACTIVE",
                "profileStatus", "VERIFIED",
                "timezone", "Asia/Kolkata",
                "preferredLanguage", "en",
                "availabilityStatus", "AVAILABLE"
        ));

        staffAvailabilityRules.put("rule_1001", createMap(
                "ruleId", "rule_1001",
                "staffId", "stf_1001",
                "dayOfWeek", "WEDNESDAY",
                "startTime", "09:00",
                "endTime", "13:00",
                "appointmentDurationMinutes", 20,
                "effectiveFrom", "2026-11-01",
                "effectiveTo", "2026-12-31",
                "status", "ACTIVE"
        ));

        staffTasks.put("task_1001", createMap(
                "taskId", "task_1001",
                "staffId", "stf_1001",
                "title", "Review appointment confirmation issue",
                "description", "Check the status of a pending administrative confirmation.",
                "priority", "NORMAL",
                "status", "OPEN",
                "dueAt", "2026-10-28T12:00:00+05:30",
                "assignedBy", "usr_manager_001",
                "createdAt", timestamp
        ));

        List<Map<String, Object>> notes1001 = new ArrayList<>();
        notes1001.add(createMap(
                "noteId", "note_1001",
                "taskId", "task_1001",
                "content", "Checked the notification queue. Awaiting the delivery result.",
                "visibility", "INTERNAL",
                "createdAt", "2026-10-27T18:50:00+05:30"
        ));
        staffTaskNotes.put("task_1001", notes1001);

        staffNotifications.put("ntf_1001", createMap(
                "notificationId", "ntf_1001",
                "staffId", "stf_1001",
                "title", "Appointment schedule updated",
                "message", "An appointment in your schedule has changed.",
                "type", "SCHEDULE_UPDATE",
                "read", false,
                "createdAt", "2026-10-27T17:50:00+05:30"
        ));

        Map<String, Object> staffEvt = createMap(
                "eventId", "evt_1001",
                "staffId", "stf_1001",
                "eventType", "TASK_STATUS_UPDATED",
                "resourceType", "STAFF_TASK",
                "resourceId", "task_1001",
                "createdAt", "2026-10-27T18:45:00+05:30"
        );
        staffActivity.add(staffEvt);

        // 19. AI Receptionist Seed Data
        aiReceptionistConfig.put("config", createMap(
                "agentId", "ai_rec_001",
                "name", "CityCare AI Receptionist",
                "status", "ACTIVE",
                "channels", List.of("WEBSITE_CHAT", "WHATSAPP", "EMAIL"),
                "supportedLanguages", List.of("en", "ta"),
                "businessHours", createMap(
                        "timezone", "Asia/Kolkata",
                        "startTime", "09:00",
                        "endTime", "18:00"
                ),
                "afterHoursBehavior", "ANSWER_APPROVED_FAQS_AND_OFFER_HANDOFF",
                "requireHumanApprovalForExternalActions", true,
                "knowledgeOnlyMode", true,
                "updatedAt", timestamp
        ));

        aiReceptionistSessions.put("sess_1001", createMap(
                "sessionId", "sess_1001",
                "conversationId", "conv_1001",
                "agentName", "CityCare AI Receptionist",
                "channel", "WEBSITE_CHAT",
                "language", "en",
                "status", "ACTIVE",
                "expiresAt", "2026-10-27T20:00:00+05:30",
                "createdAt", timestamp
        ));

        List<Map<String, Object>> sess1001Msgs = new ArrayList<>();
        sess1001Msgs.add(createMap(
                "messageId", "msg_1001",
                "senderType", "PATIENT",
                "content", "What are your clinic opening hours?",
                "createdAt", "2026-10-27T18:16:00+05:30"
        ));
        sess1001Msgs.add(createMap(
                "messageId", "msg_1002",
                "senderType", "AI_RECEPTIONIST",
                "content", "Our published clinic hours are Monday to Saturday, 9:00 AM to 6:00 PM. Would you like help with an appointment?",
                "createdAt", "2026-10-27T18:16:01+05:30",
                "knowledgeReferences", List.of("kb_hours_001")
        ));
        aiReceptionistMessages.put("sess_1001", sess1001Msgs);

        aiReceptionistFeedback.put("fb_1001", createMap(
                "feedbackId", "fb_1001",
                "sessionId", "sess_1001",
                "rating", 5,
                "category", "HELPFUL",
                "comment", "The opening hours were clear.",
                "status", "RECORDED",
                "createdAt", timestamp
        ));

        aiReceptionistHandoffs.put("handoff_1001", createMap(
                "handoffId", "handoff_1001",
                "sessionId", "sess_1001",
                "targetTeam", "RECEPTION",
                "reason", "PATIENT_REQUESTED_HUMAN",
                "status", "PENDING_ASSIGNMENT",
                "assignedToStaffId", null,
                "summary", "Patient requested human reception assistance.",
                "createdAt", "2026-10-27T18:20:00+05:30"
        ));

        knowledgeSources.put("src_1001", createMap(
                "sourceId", "src_1001",
                "name", "Clinic FAQs",
                "sourceType", "DOCUMENT_COLLECTION",
                "status", "ACTIVE",
                "lastSyncedAt", "2026-10-27T17:00:00+05:30",
                "publishedArticleCount", 24,
                "description", "Approved administrative FAQs for the clinic.",
                "contentReference", "collection_citycare_faqs"
        ));
        knowledgeSources.put("src_1002", createMap(
                "sourceId", "src_1002",
                "name", "Registration Guidelines",
                "sourceType", "DOCUMENT_COLLECTION",
                "status", "PENDING_REVIEW",
                "lastSyncedAt", null,
                "publishedArticleCount", 6,
                "description", "Official guidelines on documentation and registration.",
                "contentReference", "collection_citycare_registration"
        ));

        knowledgeSyncs.put("sync_1001", createMap(
                "executionId", "sync_1001",
                "sourceId", "src_1002",
                "status", "QUEUED",
                "mode", "INCREMENTAL",
                "createdAt", timestamp
        ));

        aiReceptionistActivity.add(createMap(
                "eventId", "evt_ai_1001",
                "agentId", "ai_rec_001",
                "eventType", "KNOWLEDGE_GROUNDED_RESPONSE",
                "sessionId", "sess_1001",
                "outcome", "ANSWERED",
                "createdAt", "2026-10-27T18:16:01+05:30"
        ));
        aiReceptionistActivity.add(createMap(
                "eventId", "evt_ai_1002",
                "agentId", "ai_rec_001",
                "eventType", "HUMAN_HANDOFF_CREATED",
                "sessionId", "sess_1001",
                "outcome", "PENDING_ASSIGNMENT",
                "createdAt", "2026-10-27T18:20:00+05:30"
        ));

        // 20. AI Appointment Agent Seed Data
        aiAppointmentConfig.put("config", createMap(
                "agentId", "ai_appointment_001",
                "name", "CityCare AI Appointment Agent",
                "status", "ACTIVE",
                "supportedLanguages", List.of("en", "ta"),
                "supportedAppointmentTypes", List.of("CONSULTATION", "FOLLOW_UP"),
                "allowNewBookings", true,
                "allowRescheduleRequests", true,
                "allowCancellationRequests", true,
                "requireIdentityVerificationForExistingAppointments", true,
                "humanApprovalRequiredForExceptionalBookings", true,
                "remindersEnabled", true,
                "timezone", "Asia/Kolkata",
                "updatedAt", timestamp
        ));

        aiAppointmentSessions.put("appt_sess_1001", createMap(
                "sessionId", "appt_sess_1001",
                "conversationId", "appt_conv_1001",
                "agentName", "CityCare AI Appointment Agent",
                "status", "ACTIVE",
                "language", "en",
                "nextStep", "SELECT_DEPARTMENT",
                "createdAt", timestamp
        ));

        aiAppointmentHandoffs.put("appt_handoff_1001", createMap(
                "handoffId", "appt_handoff_1001",
                "sessionId", "appt_sess_1001",
                "targetTeam", "APPOINTMENT_COORDINATION",
                "status", "PENDING_ASSIGNMENT",
                "reason", "BOOKING_EXCEPTION",
                "summary", "Patient needs assistance with a booking that requires manual review.",
                "createdAt", "2026-10-27T19:10:00+05:30"
        ));

        aiAppointmentActivity.add(createMap(
                "eventId", "appt_evt_1001",
                "eventType", "AVAILABILITY_SEARCHED",
                "sessionId", "appt_sess_1001",
                "outcome", "SLOTS_FOUND",
                "createdAt", "2026-10-27T18:20:00+05:30"
        ));
        aiAppointmentActivity.add(createMap(
                "eventId", "appt_evt_1002",
                "eventType", "BOOKING_CREATED",
                "appointmentId", "apt_3001",
                "outcome", "SUCCESS",
                "createdAt", "2026-10-27T18:25:00+05:30"
        ));

        // 21. Audit Events
        recordAuditEvent("SYSTEM_INIT", "SYSTEM", "SYS", "Hospital data store initialized with compliant role models");
    }

    public synchronized void recordAuditEvent(String eventType, String actorRole, String resourceId, String details) {
        Map<String, Object> event = new LinkedHashMap<>();
        event.put("eventId", "aud_" + UUID.randomUUID().toString().substring(0, 8));
        event.put("eventType", eventType);
        event.put("actorRole", actorRole);
        event.put("resourceId", resourceId);
        event.put("details", details);
        event.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        auditEvents.add(0, event);
    }

    // Accessors for controllers
    public Map<String, Map<String, Object>> getPatients() { return patients; }
    public Map<String, Map<String, Object>> getDoctors() { return doctors; }
    public Map<String, Map<String, Object>> getDepartments() { return departments; }
    public Map<String, Map<String, Object>> getAppointmentSlots() { return appointmentSlots; }
    public Map<String, Map<String, Object>> getAppointments() { return appointments; }
    public Map<String, Map<String, Object>> getReceptionQueue() { return receptionQueue; }
    public Map<String, Map<String, Object>> getReceptionStaff() { return receptionStaff; }
    public Map<String, Map<String, Object>> getWorkAssignments() { return workAssignments; }
    public Map<String, Map<String, Object>> getPatientEnquiries() { return patientEnquiries; }
    public Map<String, List<Map<String, Object>>> getEnquiryNotes() { return enquiryNotes; }
    public Map<String, Map<String, Object>> getEscalations() { return escalations; }
    public Map<String, Map<String, Object>> getSupportTickets() { return supportTickets; }
    public Map<String, List<Map<String, Object>>> getTicketMessages() { return ticketMessages; }
    public Map<String, List<Map<String, Object>>> getTicketNotes() { return ticketNotes; }
    public Map<String, Map<String, Object>> getConversations() { return conversations; }
    public Map<String, List<Map<String, Object>>> getConversationMessages() { return conversationMessages; }
    public Map<String, Map<String, Object>> getAiReplyDrafts() { return aiReplyDrafts; }
    public Map<String, Map<String, Object>> getSupportFollowUpTasks() { return supportFollowUpTasks; }
    public Map<String, Map<String, Object>> getKnowledgeArticles() { return knowledgeArticles; }
    public Map<String, Map<String, Object>> getBookingRequests() { return bookingRequests; }
    public Map<String, Map<String, Object>> getRescheduleRequests() { return rescheduleRequests; }
    public Map<String, Map<String, Object>> getCancellationRequests() { return cancellationRequests; }
    public Map<String, Map<String, Object>> getWaitingList() { return waitingList; }
    public Map<String, Map<String, Object>> getWaitingListOffers() { return waitingListOffers; }
    public Map<String, Map<String, Object>> getAppointmentReminders() { return appointmentReminders; }
    public Map<String, Map<String, Object>> getAiConfig() { return aiConfig; }
    public Map<String, Map<String, Object>> getReceptionTasks() { return receptionTasks; }

    // Additional modules accessors
    public Map<String, Map<String, Object>> getStaffProfiles() { return staffProfiles; }
    public Map<String, Map<String, Object>> getStaffAvailabilityRules() { return staffAvailabilityRules; }
    public Map<String, Map<String, Object>> getStaffTasks() { return staffTasks; }
    public Map<String, List<Map<String, Object>>> getStaffTaskNotes() { return staffTaskNotes; }
    public Map<String, Map<String, Object>> getStaffNotifications() { return staffNotifications; }
    public List<Map<String, Object>> getStaffActivity() { return staffActivity; }

    public Map<String, Map<String, Object>> getAiReceptionistConfig() { return aiReceptionistConfig; }
    public Map<String, Map<String, Object>> getAiReceptionistSessions() { return aiReceptionistSessions; }
    public Map<String, List<Map<String, Object>>> getAiReceptionistMessages() { return aiReceptionistMessages; }
    public Map<String, Map<String, Object>> getAiReceptionistFeedback() { return aiReceptionistFeedback; }
    public Map<String, Map<String, Object>> getAiReceptionistHandoffs() { return aiReceptionistHandoffs; }
    public Map<String, Map<String, Object>> getKnowledgeSources() { return knowledgeSources; }
    public Map<String, Map<String, Object>> getKnowledgeSyncs() { return knowledgeSyncs; }
    public List<Map<String, Object>> getAiReceptionistActivity() { return aiReceptionistActivity; }

    public Map<String, Map<String, Object>> getAiAppointmentConfig() { return aiAppointmentConfig; }
    public Map<String, Map<String, Object>> getAiAppointmentSessions() { return aiAppointmentSessions; }
    public Map<String, List<Map<String, Object>>> getAiAppointmentMessages() { return aiAppointmentMessages; }
    public Map<String, Map<String, Object>> getAiAppointmentHandoffs() { return aiAppointmentHandoffs; }
    public List<Map<String, Object>> getAiAppointmentActivity() { return aiAppointmentActivity; }
    public List<Map<String, Object>> getAuditEvents() { return auditEvents; }

    @SafeVarargs
    public static Map<String, Object> createMap(Object... keyValues) {
        Map<String, Object> map = new LinkedHashMap<>();
        for (int i = 0; i < keyValues.length; i += 2) {
            if (i + 1 < keyValues.length) {
                map.put(String.valueOf(keyValues[i]), keyValues[i + 1]);
            }
        }
        return map;
    }
}
