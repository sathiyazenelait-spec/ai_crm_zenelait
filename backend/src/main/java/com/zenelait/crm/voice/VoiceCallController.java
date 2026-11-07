package com.zenelait.crm.voice;

import com.zenelait.crm.model.VoiceCallLog;
import com.zenelait.crm.repository.VoiceCallLogRepository;
import com.zenelait.crm.tenant.TenantSecurityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/voice")
@CrossOrigin(origins = "*")
public class VoiceCallController {

    private final VoiceAiService voiceAiService;
    private final VoiceCallLogRepository voiceCallLogRepository;
    private final TenantSecurityService tenantSecurityService;

    public VoiceCallController(
            VoiceAiService voiceAiService,
            VoiceCallLogRepository voiceCallLogRepository,
            TenantSecurityService tenantSecurityService
    ) {
        this.voiceAiService = voiceAiService;
        this.voiceCallLogRepository = voiceCallLogRepository;
        this.tenantSecurityService = tenantSecurityService;
    }

    /**
     * GET /api/v1/voice/roles
     * Available autonomous AI Voice Agents
     */
    @GetMapping("/roles")
    public ResponseEntity<?> getAvailableVoiceRoles() {
        return ResponseEntity.ok(List.of(
                Map.of(
                        "roleId", "AI_SDR",
                        "title", "Alex — Autonomous Enterprise SDR",
                        "industry", "Software & IT / B2B",
                        "avatar", "🎙️",
                        "description", "Qualifies BANT, handles technical pricing queries, and books 15-min calendar demos."
                ),
                Map.of(
                        "roleId", "AI_RECEPTIONIST",
                        "title", "Sarah — Clinical Triage & Receptionist",
                        "industry", "Healthcare & Clinics",
                        "avatar", "🩺",
                        "description", "Handles after-hours patient intake, symptom triage, and physician calendar scheduling."
                ),
                Map.of(
                        "roleId", "AI_CONCIERGE",
                        "title", "Marcus — Real Estate Property Concierge",
                        "industry", "Real Estate & Hospitality",
                        "avatar", "🏢",
                        "description", "Explores buyer BHK preferences, verifies amenities, and reserves in-person site visits."
                )
        ));
    }

    /**
     * POST /api/v1/voice/start-call
     */
    @PostMapping("/start-call")
    public ResponseEntity<?> startVoiceCall(@RequestBody Map<String, String> request) {
        String callId = "CALL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String role = request.getOrDefault("role", "AI_SDR");
        String callerName = request.getOrDefault("callerName", "Prospective Client");
        String callerPhone = request.getOrDefault("callerPhone", "+91 98000 00000");

        String greeting;
        if ("AI_RECEPTIONIST".equalsIgnoreCase(role)) {
            greeting = "Hello " + callerName + ", this is Sarah from Zenelait Health Reception. How can I assist you with an appointment or medical inquiry today?";
        } else if ("AI_CONCIERGE".equalsIgnoreCase(role)) {
            greeting = "Greetings " + callerName + "! I am Marcus, your Autonomous Real Estate Concierge. Which luxury project or unit size are you interested in?";
        } else {
            greeting = "Hi " + callerName + "! This is Alex, autonomous SDR at ABC Technologies. Thanks for checking out our AI CRM platform! What workflow are you looking to automate?";
        }

        return ResponseEntity.ok(Map.of(
                "callId", callId,
                "status", "CONNECTED",
                "role", role,
                "initialGreeting", greeting,
                "sampleRate", 16000,
                "audioCodec", "OPUS_WEBRTC"
        ));
    }

    /**
     * POST /api/v1/voice/talk
     * Conversational step: receives user utterance, returns AI speech text & telemetry
     */
    @PostMapping("/talk")
    public ResponseEntity<?> talkToAgent(@RequestBody Map<String, Object> request) {
        String callId = (String) request.getOrDefault("callId", "CALL-DEMO");
        String role = (String) request.getOrDefault("role", "AI_SDR");
        String utterance = (String) request.getOrDefault("utterance", "Tell me more about your software.");
        String callerName = (String) request.getOrDefault("callerName", "Client");
        String tenantId = (String) request.getOrDefault("tenantId", tenantSecurityService.getCurrentTenantId());

        Map<String, Object> response = voiceAiService.processVoiceUtterance(callId, role, utterance, tenantId, callerName);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/v1/voice/end-call
     * Completes call session, saves full transcript and analytics to TiDB Cloud
     */
    @PostMapping("/end-call")
    public ResponseEntity<?> endVoiceCall(@RequestBody Map<String, Object> payload) {
        String callId = (String) payload.getOrDefault("callId", "CALL-" + System.currentTimeMillis());
        String callerName = (String) payload.getOrDefault("callerName", "Inbound Caller");
        String callerPhone = (String) payload.getOrDefault("callerPhone", "+91 98000 00000");
        String role = (String) payload.getOrDefault("role", "AI_SDR");
        int duration = ((Number) payload.getOrDefault("durationSeconds", 45)).intValue();
        String transcript = (String) payload.getOrDefault("transcript", "Full conversation logged.");
        String summary = (String) payload.getOrDefault("summary", "Client qualified by AI agent.");
        String sentiment = (String) payload.getOrDefault("sentiment", "POSITIVE");
        String scheduledTime = (String) payload.get("scheduledMeetingTime");
        Double budget = payload.get("budget") != null ? ((Number) payload.get("budget")).doubleValue() : null;
        String tenantId = (String) payload.getOrDefault("tenantId", tenantSecurityService.getCurrentTenantId());

        VoiceCallLog savedLog = voiceAiService.saveCallSummary(
                callId, callerName, callerPhone, role, duration, transcript, summary, sentiment, scheduledTime, budget, tenantId
        );

        return ResponseEntity.ok(Map.of(
                "status", "SAVED_TO_TIDB",
                "callLogId", savedLog.getId(),
                "durationSeconds", savedLog.getDurationSeconds(),
                "meetingBooked", savedLog.getScheduledMeetingTime() != null,
                "qualificationSummary", savedLog.getQualificationSummary()
        ));
    }

    /**
     * GET /api/v1/voice/logs
     */
    @GetMapping("/logs")
    public ResponseEntity<List<VoiceCallLog>> getCallLogs(@RequestParam(required = false) String tenantId) {
        String effectiveTenant = tenantId != null ? tenantId : tenantSecurityService.getCurrentTenantId();
        return ResponseEntity.ok(voiceCallLogRepository.findByTenantIdOrderByCreatedAtDesc(effectiveTenant));
    }
}
