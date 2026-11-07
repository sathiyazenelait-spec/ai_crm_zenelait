package com.zenelait.crm.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "email_copilot_logs")
public class EmailCopilotLog {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "lead_id", length = 64)
    private String leadId;

    @Column(name = "recipient_email", nullable = false, length = 150)
    private String recipientEmail;

    @Column(name = "recipient_name", length = 120)
    private String recipientName;

    @Column(nullable = false, length = 250)
    private String subject;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String bodyText;

    @Column(name = "inferred_sentiment", length = 50)
    private String inferredSentiment = "GHOSTED_7_DAYS";

    @Column(name = "suggested_offer", length = 120)
    private String suggestedOffer;

    @Column(length = 30)
    private String status = "AUTO_SENT"; // DRAFTED, AUTO_SENT, APPROVED_SENT, REPLIED

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id")
    private Company tenant;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public EmailCopilotLog() {}

    public EmailCopilotLog(String id, String leadId, String recipientEmail, String recipientName, String subject, String bodyText, String sentiment, Company tenant) {
        this.id = id;
        this.leadId = leadId;
        this.recipientEmail = recipientEmail;
        this.recipientName = recipientName;
        this.subject = subject;
        this.bodyText = bodyText;
        this.inferredSentiment = sentiment;
        this.tenant = tenant;
        this.createdAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getLeadId() { return leadId; }
    public void setLeadId(String leadId) { this.leadId = leadId; }

    public String getRecipientEmail() { return recipientEmail; }
    public void setRecipientEmail(String recipientEmail) { this.recipientEmail = recipientEmail; }

    public String getRecipientName() { return recipientName; }
    public void setRecipientName(String recipientName) { this.recipientName = recipientName; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getBodyText() { return bodyText; }
    public void setBodyText(String bodyText) { this.bodyText = bodyText; }

    public String getInferredSentiment() { return inferredSentiment; }
    public void setInferredSentiment(String inferredSentiment) { this.inferredSentiment = inferredSentiment; }

    public String getSuggestedOffer() { return suggestedOffer; }
    public void setSuggestedOffer(String suggestedOffer) { this.suggestedOffer = suggestedOffer; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Company getTenant() { return tenant; }
    public void setTenant(Company tenant) { this.tenant = tenant; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
