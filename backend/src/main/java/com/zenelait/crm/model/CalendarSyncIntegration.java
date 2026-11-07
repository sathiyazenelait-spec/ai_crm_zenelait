package com.zenelait.crm.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "calendar_sync_integrations")
public class CalendarSyncIntegration {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "tenant_id", nullable = false, length = 50)
    private String tenantId;

    @Column(name = "user_id", nullable = false, length = 64)
    private String userId;

    @Column(length = 30)
    private String provider = "GOOGLE"; // GOOGLE, OUTLOOK, ICAL

    @Column(name = "sync_email", length = 150)
    private String syncEmail;

    @Column(name = "access_token", columnDefinition = "TEXT")
    private String accessToken;

    @Column(name = "refresh_token", columnDefinition = "TEXT")
    private String refreshToken;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "auto_meet_link")
    private Boolean autoMeetLink = true;

    @Column(name = "last_sync_at")
    private LocalDateTime lastSyncAt = LocalDateTime.now();

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public CalendarSyncIntegration() {}

    public CalendarSyncIntegration(String id, String tenantId, String userId, String provider, String syncEmail, Boolean autoMeetLink) {
        this.id = id;
        this.tenantId = tenantId;
        this.userId = userId;
        this.provider = provider;
        this.syncEmail = syncEmail;
        this.autoMeetLink = autoMeetLink;
        this.isActive = true;
        this.lastSyncAt = LocalDateTime.now();
        this.createdAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }

    public String getSyncEmail() { return syncEmail; }
    public void setSyncEmail(String syncEmail) { this.syncEmail = syncEmail; }

    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }

    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Boolean getAutoMeetLink() { return autoMeetLink; }
    public void setAutoMeetLink(Boolean autoMeetLink) { this.autoMeetLink = autoMeetLink; }

    public LocalDateTime getLastSyncAt() { return lastSyncAt; }
    public void setLastSyncAt(LocalDateTime lastSyncAt) { this.lastSyncAt = lastSyncAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
