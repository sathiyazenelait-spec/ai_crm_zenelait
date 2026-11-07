package com.zenelait.crm.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "visual_workflow_definitions")
public class VisualWorkflowDefinition {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "tenant_id", nullable = false, length = 50)
    private String tenantId;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "trigger_event", nullable = false, length = 60)
    private String triggerEvent = "LEAD_CREATED";

    @Column(name = "nodes_json", columnDefinition = "MEDIUMTEXT", nullable = false)
    private String nodesJson;

    @Column(name = "edges_json", columnDefinition = "MEDIUMTEXT", nullable = false)
    private String edgesJson;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "total_executions")
    private Integer totalExecutions = 0;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public VisualWorkflowDefinition() {}

    public VisualWorkflowDefinition(String id, String tenantId, String name, String description, String triggerEvent, String nodesJson, String edgesJson) {
        this.id = id;
        this.tenantId = tenantId;
        this.name = name;
        this.description = description;
        this.triggerEvent = triggerEvent;
        this.nodesJson = nodesJson;
        this.edgesJson = edgesJson;
        this.isActive = true;
        this.totalExecutions = 0;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getTriggerEvent() { return triggerEvent; }
    public void setTriggerEvent(String triggerEvent) { this.triggerEvent = triggerEvent; }

    public String getNodesJson() { return nodesJson; }
    public void setNodesJson(String nodesJson) { this.nodesJson = nodesJson; }

    public String getEdgesJson() { return edgesJson; }
    public void setEdgesJson(String edgesJson) { this.edgesJson = edgesJson; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Integer getTotalExecutions() { return totalExecutions; }
    public void setTotalExecutions(Integer totalExecutions) { this.totalExecutions = totalExecutions; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
