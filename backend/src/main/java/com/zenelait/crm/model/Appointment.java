package com.zenelait.crm.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "appointments")
@JsonIgnoreProperties(ignoreUnknown = true)
public class Appointment {

    @Id
    @Column(length = 50)
    private String id;

    private String leadId;

    @Column(nullable = false)
    private String title;

    private String customer;

    private String company;

    private String type = "PRODUCT_DEMO"; // PRODUCT_DEMO, SITE_VISIT, CONSULTATION, COUNSELING

    private String channel = "VIDEO_CALL"; // VIDEO_CALL, PHONE, IN_PERSON, GOOGLE_MEET

    private String startAt;

    private String endAt;

    private String dateTime;

    private String assignedTo;

    private String host;

    @Column(nullable = false)
    private String status = "SCHEDULED"; // SCHEDULED, COMPLETED, RESCHEDULED, CANCELLED

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Company tenant;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Appointment() {}

    public Appointment(String id, String leadId, String title, String type, String startAt, String endAt, String assignedTo, String channel, Company tenant) {
        this.id = id;
        this.leadId = leadId;
        this.title = title;
        this.type = type;
        this.startAt = startAt;
        this.endAt = endAt;
        this.dateTime = startAt;
        this.assignedTo = assignedTo;
        this.host = assignedTo;
        this.channel = channel;
        this.tenant = tenant;
    }

    @PrePersist
    public void prePersist() {
        if (this.id == null || this.id.trim().isEmpty()) {
            this.id = "APT-" + (1000 + (long)(Math.random() * 9000));
        }
        if (this.dateTime == null && this.startAt != null) this.dateTime = this.startAt;
        if (this.startAt == null && this.dateTime != null) this.startAt = this.dateTime;
        if (this.host == null && this.assignedTo != null) this.host = this.assignedTo;
        if (this.assignedTo == null && this.host != null) this.assignedTo = this.host;
        if (this.createdAt == null) this.createdAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getLeadId() { return leadId; }
    public void setLeadId(String leadId) { this.leadId = leadId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCustomer() { return customer; }
    public void setCustomer(String customer) { this.customer = customer; }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getChannel() { return channel; }
    public void setChannel(String channel) { this.channel = channel; }

    public String getStartAt() { return startAt != null ? startAt : dateTime; }
    public void setStartAt(String startAt) { 
        this.startAt = startAt; 
        if (this.dateTime == null) this.dateTime = startAt;
    }

    public String getEndAt() { return endAt; }
    public void setEndAt(String endAt) { this.endAt = endAt; }

    public String getDateTime() { return dateTime != null ? dateTime : startAt; }
    public void setDateTime(String dateTime) { 
        this.dateTime = dateTime; 
        if (this.startAt == null) this.startAt = dateTime;
    }

    public String getAssignedTo() { return assignedTo != null ? assignedTo : host; }
    public void setAssignedTo(String assignedTo) { 
        this.assignedTo = assignedTo; 
        if (this.host == null) this.host = assignedTo;
    }

    public String getHost() { return host != null ? host : assignedTo; }
    public void setHost(String host) { 
        this.host = host; 
        if (this.assignedTo == null) this.assignedTo = host;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Company getTenant() { return tenant; }
    public void setTenant(Company tenant) { this.tenant = tenant; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
