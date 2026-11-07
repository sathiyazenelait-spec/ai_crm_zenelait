package com.zenelait.crm.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "voice_call_logs")
public class VoiceCallLog {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "lead_id", length = 64)
    private String leadId;

    @Column(name = "caller_name", length = 120)
    private String callerName;

    @Column(name = "caller_phone", length = 50)
    private String callerPhone;

    @Column(name = "call_role", length = 50)
    private String callRole = "AI_SDR"; // AI_SDR, AI_RECEPTIONIST, AI_CONCIERGE

    @Column(length = 20)
    private String direction = "INBOUND"; // INBOUND, OUTBOUND

    @Column(name = "duration_seconds")
    private Integer durationSeconds = 0;

    @Column(columnDefinition = "TEXT")
    private String fullTranscript;

    @Column(columnDefinition = "TEXT")
    private String qualificationSummary;

    @Column(name = "detected_budget")
    private Double detectedBudget;

    @Column(length = 30)
    private String sentiment = "POSITIVE"; // POSITIVE, NEUTRAL, URGENT, NEGATIVE

    @Column(name = "scheduled_meeting_time", length = 100)
    private String scheduledMeetingTime;

    @Column(length = 30)
    private String status = "COMPLETED"; // COMPLETED, BOOKED_DEMO, HANDOFF_REQUIRED

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id")
    private Company tenant;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public VoiceCallLog() {}

    public VoiceCallLog(String id, String callerName, String callerPhone, String callRole, String direction, Company tenant) {
        this.id = id;
        this.callerName = callerName;
        this.callerPhone = callerPhone;
        this.callRole = callRole;
        this.direction = direction;
        this.tenant = tenant;
        this.createdAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getLeadId() { return leadId; }
    public void setLeadId(String leadId) { this.leadId = leadId; }

    public String getCallerName() { return callerName; }
    public void setCallerName(String callerName) { this.callerName = callerName; }

    public String getCallerPhone() { return callerPhone; }
    public void setCallerPhone(String callerPhone) { this.callerPhone = callerPhone; }

    public String getCallRole() { return callRole; }
    public void setCallRole(String callRole) { this.callRole = callRole; }

    public String getDirection() { return direction; }
    public void setDirection(String direction) { this.direction = direction; }

    public Integer getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(Integer durationSeconds) { this.durationSeconds = durationSeconds; }

    public String getFullTranscript() { return fullTranscript; }
    public void setFullTranscript(String fullTranscript) { this.fullTranscript = fullTranscript; }

    public String getQualificationSummary() { return qualificationSummary; }
    public void setQualificationSummary(String qualificationSummary) { this.qualificationSummary = qualificationSummary; }

    public Double getDetectedBudget() { return detectedBudget; }
    public void setDetectedBudget(Double detectedBudget) { this.detectedBudget = detectedBudget; }

    public String getSentiment() { return sentiment; }
    public void setSentiment(String sentiment) { this.sentiment = sentiment; }

    public String getScheduledMeetingTime() { return scheduledMeetingTime; }
    public void setScheduledMeetingTime(String scheduledMeetingTime) { this.scheduledMeetingTime = scheduledMeetingTime; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Company getTenant() { return tenant; }
    public void setTenant(Company tenant) { this.tenant = tenant; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
