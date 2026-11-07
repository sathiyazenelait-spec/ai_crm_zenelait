package com.zenelait.crm.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "whatsapp_messages")
public class WhatsAppMessage {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "sender_phone", nullable = false, length = 50)
    private String senderPhone;

    @Column(name = "sender_name", length = 120)
    private String senderName;

    @Column(name = "message_text", columnDefinition = "TEXT", nullable = false)
    private String messageText;

    @Column(length = 20)
    private String direction = "INBOUND"; // INBOUND, OUTBOUND

    @Column(length = 30)
    private String status = "RECEIVED"; // RECEIVED, AUTO_REPLIED, HANDED_OFF, MANUAL_SENT

    @Column(name = "media_url", length = 500)
    private String mediaUrl;

    @Column(name = "ai_agent_role", length = 60)
    private String aiAgentRole = "AI_WHATSAPP_SDR";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id")
    private Company tenant;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public WhatsAppMessage() {}

    public WhatsAppMessage(String id, String senderPhone, String senderName, String messageText, String direction, Company tenant) {
        this.id = id;
        this.senderPhone = senderPhone;
        this.senderName = senderName;
        this.messageText = messageText;
        this.direction = direction;
        this.tenant = tenant;
        this.createdAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSenderPhone() { return senderPhone; }
    public void setSenderPhone(String senderPhone) { this.senderPhone = senderPhone; }

    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }

    public String getMessageText() { return messageText; }
    public void setMessageText(String messageText) { this.messageText = messageText; }

    public String getDirection() { return direction; }
    public void setDirection(String direction) { this.direction = direction; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getMediaUrl() { return mediaUrl; }
    public void setMediaUrl(String mediaUrl) { this.mediaUrl = mediaUrl; }

    public String getAiAgentRole() { return aiAgentRole; }
    public void setAiAgentRole(String aiAgentRole) { this.aiAgentRole = aiAgentRole; }

    public Company getTenant() { return tenant; }
    public void setTenant(Company tenant) { this.tenant = tenant; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
