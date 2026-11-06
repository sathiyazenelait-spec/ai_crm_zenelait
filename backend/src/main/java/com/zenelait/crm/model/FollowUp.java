package com.zenelait.crm.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "follow_ups")
@JsonIgnoreProperties(ignoreUnknown = true)
public class FollowUp {

    @Id
    @Column(length = 50)
    private String id;

    private String leadId;

    private String type = "CALL"; // CALL, EMAIL, WHATSAPP, MEETING

    private String scheduledAt;

    private String dueDate;

    @Column(columnDefinition = "TEXT")
    private String notes;

    private String status = "PENDING"; // PENDING, COMPLETED, CANCELLED

    private String assignedTo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Company tenant;

    private LocalDateTime createdAt = LocalDateTime.now();

    public FollowUp() {}

    public FollowUp(String id, String leadId, String type, String scheduledAt, String notes, String status, Company tenant) {
        this.id = id;
        this.leadId = leadId;
        this.type = type;
        this.scheduledAt = scheduledAt;
        this.dueDate = scheduledAt;
        this.notes = notes;
        this.status = status;
        this.tenant = tenant;
    }

    @PrePersist
    public void prePersist() {
        if (this.id == null || this.id.trim().isEmpty()) {
            this.id = "FOL-" + (1000 + (long)(Math.random() * 9000));
        }
        if (this.dueDate == null && this.scheduledAt != null) this.dueDate = this.scheduledAt;
        if (this.scheduledAt == null && this.dueDate != null) this.scheduledAt = this.dueDate;
        if (this.createdAt == null) this.createdAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getLeadId() { return leadId; }
    public void setLeadId(String leadId) { this.leadId = leadId; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(String scheduledAt) { this.scheduledAt = scheduledAt; }

    public String getDueDate() { return dueDate; }
    public void setDueDate(String dueDate) { this.dueDate = dueDate; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAssignedTo() { return assignedTo; }
    public void setAssignedTo(String assignedTo) { this.assignedTo = assignedTo; }

    public Company getTenant() { return tenant; }
    public void setTenant(Company tenant) { this.tenant = tenant; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
