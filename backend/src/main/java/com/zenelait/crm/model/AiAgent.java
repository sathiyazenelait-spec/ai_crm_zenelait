package com.zenelait.crm.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_agents")
@JsonIgnoreProperties(ignoreUnknown = true)
public class AiAgent {

    @Id
    @Column(length = 50)
    private String id;

    @Column(nullable = false)
    private String name;

    private String role; // Sales Agent, Support Agent, Appointment Agent, Triage Agent

    @Column(columnDefinition = "TEXT")
    private String description;

    private String status = "Active"; // Active, Paused

    private Integer leadsHandled = 0;

    private Integer appointmentsBooked = 0;

    private String accuracy = "99%";

    private Integer performance = 92;

    private String channels = "Website, WhatsApp";

    private String avatar = "🤖";

    @Column(columnDefinition = "TEXT")
    private String systemPrompt;

    private Double temperature = 0.3;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Company tenant;

    private LocalDateTime createdAt = LocalDateTime.now();

    public AiAgent() {}

    public AiAgent(String id, String name, String role, String description, String avatar, String channels, Company tenant) {
        this.id = id;
        this.name = name;
        this.role = role;
        this.description = description;
        this.avatar = avatar;
        this.channels = channels;
        this.tenant = tenant;
    }

    @PrePersist
    public void prePersist() {
        if (this.id == null || this.id.trim().isEmpty()) {
            this.id = "agent-" + (100 + (long)(Math.random() * 900));
        }
        if (this.createdAt == null) this.createdAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getLeadsHandled() { return leadsHandled; }
    public void setLeadsHandled(Integer leadsHandled) { this.leadsHandled = leadsHandled; }

    public Integer getAppointmentsBooked() { return appointmentsBooked; }
    public void setAppointmentsBooked(Integer appointmentsBooked) { this.appointmentsBooked = appointmentsBooked; }

    public String getAccuracy() { return accuracy; }
    public void setAccuracy(String accuracy) { this.accuracy = accuracy; }

    public Integer getPerformance() { return performance; }
    public void setPerformance(Integer performance) { this.performance = performance; }

    public String getChannels() { return channels; }
    public void setChannels(String channels) { this.channels = channels; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public String getSystemPrompt() { return systemPrompt; }
    public void setSystemPrompt(String systemPrompt) { this.systemPrompt = systemPrompt; }

    public Double getTemperature() { return temperature; }
    public void setTemperature(Double temperature) { this.temperature = temperature; }

    public Company getTenant() { return tenant; }
    public void setTenant(Company tenant) { this.tenant = tenant; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
