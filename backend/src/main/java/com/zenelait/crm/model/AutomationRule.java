package com.zenelait.crm.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "automations")
public class AutomationRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String triggerEvent; // Lead Form Submitted, Score > 80, Status Changed

    @Column(columnDefinition = "TEXT")
    private String conditions;

    @Column(nullable = false)
    private String actionEvent; // Assign to Rep, Send WhatsApp, Schedule Call

    private String status = "Active"; // Active, Paused

    private Integer runsCount = 0;

    private String successRate = "100%";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Company tenant;

    private LocalDateTime createdAt = LocalDateTime.now();

    public AutomationRule() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getTriggerEvent() { return triggerEvent; }
    public void setTriggerEvent(String triggerEvent) { this.triggerEvent = triggerEvent; }

    public String getConditions() { return conditions; }
    public void setConditions(String conditions) { this.conditions = conditions; }

    public String getActionEvent() { return actionEvent; }
    public void setActionEvent(String actionEvent) { this.actionEvent = actionEvent; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getRunsCount() { return runsCount; }
    public void setRunsCount(Integer runsCount) { this.runsCount = runsCount; }

    public String getSuccessRate() { return successRate; }
    public void setSuccessRate(String successRate) { this.successRate = successRate; }

    public Company getTenant() { return tenant; }
    public void setTenant(Company tenant) { this.tenant = tenant; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
