package com.zenelait.crm.voice;

import com.zenelait.crm.model.Appointment;
import com.zenelait.crm.model.Company;
import com.zenelait.crm.model.VoiceCallLog;
import com.zenelait.crm.repository.AppointmentRepository;
import com.zenelait.crm.repository.CompanyRepository;
import com.zenelait.crm.repository.VoiceCallLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class VoiceAiService {

    private final VoiceCallLogRepository voiceCallLogRepository;
    private final AppointmentRepository appointmentRepository;
    private final CompanyRepository companyRepository;

    public VoiceAiService(
            VoiceCallLogRepository voiceCallLogRepository,
            AppointmentRepository appointmentRepository,
            CompanyRepository companyRepository
    ) {
        this.voiceCallLogRepository = voiceCallLogRepository;
        this.appointmentRepository = appointmentRepository;
        this.companyRepository = companyRepository;
    }

    /**
     * Generate conversational response for AI Voice Employee
     */
    public Map<String, Object> processVoiceUtterance(
            String callId,
            String role,
            String userUtterance,
            String tenantId,
            String callerName
    ) {
        String lower = userUtterance.toLowerCase();
        Map<String, Object> response = new LinkedHashMap<>();

        String replyText;
        String sentiment = "POSITIVE";
        boolean bookingTriggered = false;
        String scheduledTime = null;
        Double detectedBudget = null;

        // 1. Role-specific intelligence
        if ("AI_RECEPTIONIST".equalsIgnoreCase(role)) {
            if (lower.contains("appointment") || lower.contains("doctor") || lower.contains("book") || lower.contains("consult")) {
                replyText = "I would be happy to schedule a consultation with our specialist for you, " + callerName + 
                            ". We have an opening today at 4:30 PM or tomorrow at 10:00 AM. Which one works best for you?";
                bookingTriggered = true;
                scheduledTime = LocalDateTime.now().plusDays(1).withHour(10).withMinute(0).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            } else if (lower.contains("emergency") || lower.contains("severe") || lower.contains("urgent") || lower.contains("pain")) {
                replyText = "I understand this is urgent. I am immediately alerting our on-duty triage team and priority queue.";
                sentiment = "URGENT";
            } else {
                replyText = "Hello " + callerName + ", this is the Zenelait Clinic AI Receptionist. How can I assist with your care, appointments, or medical questions today?";
            }
        } else if ("AI_CONCIERGE".equalsIgnoreCase(role)) {
            if (lower.contains("property") || lower.contains("apartment") || lower.contains("visit") || lower.contains("tour") || lower.contains("bhk")) {
                replyText = "We have high-demand 2BHK and 3BHK luxury units available for a private site visit. Would tomorrow afternoon at 3:00 PM suit you?";
                bookingTriggered = true;
                scheduledTime = LocalDateTime.now().plusDays(1).withHour(15).withMinute(0).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            } else {
                replyText = "Greetings! I am your Autonomous Property Concierge. Are you exploring investment opportunities, luxury apartments, or booking a verified site visit?";
            }
        } else {
            // Default: Autonomous AI Sales SDR
            if (lower.contains("price") || lower.contains("cost") || lower.contains("pricing") || lower.contains("how much")) {
                replyText = "Our enterprise plans start with flexible multi-tenant licensing and customized seat tiers. To give you the exact ROI figure, could you share your expected team size?";
                detectedBudget = 500000.0;
            } else if (lower.contains("demo") || lower.contains("schedule") || lower.contains("meet") || lower.contains("tomorrow") || lower.contains("call")) {
                replyText = "Perfect! I have reserved a 15-minute live executive demo for tomorrow at 11:00 AM with our Principal Solution Engineer. I am sending the calendar invite right now.";
                bookingTriggered = true;
                scheduledTime = LocalDateTime.now().plusDays(1).withHour(11).withMinute(0).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            } else if (lower.contains("team") || lower.contains("seats") || lower.contains("employee")) {
                replyText = "That is an ideal team size for our autonomous workflows. Our AI employees can handle qualification, CRM sync, and omnichannel follow-ups seamlessly. Would you like a live demo?";
            } else {
                replyText = "Hello " + callerName + "! This is Alex, your Autonomous Sales Representative from ABC Technologies. I saw your enquiry about our AI-powered CRM suite. What key workflow are you looking to automate?";
            }
        }

        // 2. Auto-schedule appointment if booking triggered
        if (bookingTriggered && scheduledTime != null) {
            autoBookVoiceAppointment(callerName, role, scheduledTime, tenantId);
        }

        response.put("callId", callId);
        response.put("role", role);
        response.put("userTranscript", userUtterance);
        response.put("aiReplyText", replyText);
        response.put("sentiment", sentiment);
        response.put("bookingTriggered", bookingTriggered);
        response.put("scheduledTime", scheduledTime);
        response.put("detectedBudget", detectedBudget);
        response.put("audioSpeed", 1.0);
        response.put("voiceAccent", "en-US-Neural-Studio");

        return response;
    }

    @Transactional
    public VoiceCallLog saveCallSummary(
            String callId,
            String callerName,
            String callerPhone,
            String role,
            int durationSeconds,
            String transcript,
            String summary,
            String sentiment,
            String scheduledMeetingTime,
            Double budget,
            String tenantId
    ) {
        Company company = companyRepository.findById(tenantId).orElseGet(() ->
                companyRepository.findAll().stream().findFirst().orElse(null)
        );

        VoiceCallLog log = voiceCallLogRepository.findById(callId).orElse(new VoiceCallLog(
                callId,
                callerName,
                callerPhone,
                role,
                "INBOUND",
                company
        ));

        log.setDurationSeconds(durationSeconds);
        log.setFullTranscript(transcript);
        log.setQualificationSummary(summary);
        log.setSentiment(sentiment);
        log.setScheduledMeetingTime(scheduledMeetingTime);
        if (budget != null) log.setDetectedBudget(budget);
        log.setStatus(scheduledMeetingTime != null ? "BOOKED_DEMO" : "COMPLETED");

        return voiceCallLogRepository.save(log);
    }

    private void autoBookVoiceAppointment(String callerName, String role, String scheduledTime, String tenantId) {
        Company company = companyRepository.findById(tenantId).orElseGet(() ->
                companyRepository.findAll().stream().findFirst().orElse(null)
        );

        Appointment appt = new Appointment();
        appt.setId("APT-VOICE-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        appt.setTitle("AI Voice Booked: " + role + " - " + callerName);
        appt.setType("AI_VOICE_DEMO");
        appt.setStartAt(scheduledTime);
        appt.setEndAt(LocalDateTime.parse(scheduledTime).plusMinutes(30).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        appt.setChannel("GOOGLE_MEET");
        appt.setStatus("SCHEDULED");
        appt.setTenant(company);

        appointmentRepository.save(appt);
    }
}
