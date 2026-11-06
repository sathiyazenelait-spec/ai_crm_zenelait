package com.zenelait.crm.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "leads")
@JsonIgnoreProperties(ignoreUnknown = true)
public class Lead {

    @Id
    @Column(length = 50)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String email;

    private String phone;

    private String company;

    private String companyName;

    private String designation;

    private String companySize;

    private String source = "WEBSITE";

    @Column(nullable = false)
    private String status = "NEW"; // NEW, CONTACTED, QUALIFIED, PROPOSAL, NEGOTIATION, WON, LOST

    private String stage = "NEW";

    private Integer score = 60;

    private String requirement;

    private Double budget;

    private String currency = "INR";

    private String ownerId;

    private String assignedTo;

    private String assigneeRole;

    @Column(columnDefinition = "TEXT")
    private String aiSummary;

    @Column(columnDefinition = "TEXT")
    private String recommendedAction;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Company tenant;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Lead() {}

    public Lead(String id, String name, String email, String phone, String companyName, String stage, Company tenant) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.companyName = companyName;
        this.company = companyName;
        this.stage = stage;
        this.status = stage;
        this.tenant = tenant;
    }

    @PrePersist
    public void prePersist() {
        if (this.id == null || this.id.trim().isEmpty()) {
            this.id = "LEAD-" + (1000 + (long)(Math.random() * 9000));
        }
        if (this.companyName != null && this.company == null) {
            this.company = this.companyName;
        } else if (this.company != null && this.companyName == null) {
            this.companyName = this.company;
        }
        if (this.stage != null && (this.status == null || "NEW".equals(this.status))) {
            this.status = this.stage;
        } else if (this.status != null && (this.stage == null || "NEW".equals(this.stage))) {
            this.stage = this.status;
        }
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
        if (this.companyName != null) this.company = this.companyName;
        if (this.stage != null) this.status = this.stage;
    }

    // Getters & Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getCompany() { return company != null ? company : companyName; }
    public void setCompany(String company) { 
        this.company = company; 
        this.companyName = company;
    }

    public String getCompanyName() { return companyName != null ? companyName : company; }
    public void setCompanyName(String companyName) { 
        this.companyName = companyName; 
        this.company = companyName;
    }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getCompanySize() { return companySize; }
    public void setCompanySize(String companySize) { this.companySize = companySize; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getStatus() { return status != null ? status : stage; }
    public void setStatus(String status) { 
        this.status = status; 
        this.stage = status;
    }

    public String getStage() { return stage != null ? stage : status; }
    public void setStage(String stage) { 
        this.stage = stage; 
        this.status = stage;
    }

    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }

    public String getRequirement() { return requirement; }
    public void setRequirement(String requirement) { this.requirement = requirement; }

    public Double getBudget() { return budget; }
    public void setBudget(Double budget) { this.budget = budget; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getOwnerId() { return ownerId != null ? ownerId : assignedTo; }
    public void setOwnerId(String ownerId) { 
        this.ownerId = ownerId; 
        this.assignedTo = ownerId;
    }

    public String getAssignedTo() { return assignedTo != null ? assignedTo : ownerId; }
    public void setAssignedTo(String assignedTo) { 
        this.assignedTo = assignedTo; 
        this.ownerId = assignedTo;
    }

    public String getAssigneeRole() { return assigneeRole; }
    public void setAssigneeRole(String assigneeRole) { this.assigneeRole = assigneeRole; }

    public String getAiSummary() { return aiSummary; }
    public void setAiSummary(String aiSummary) { this.aiSummary = aiSummary; }

    public String getRecommendedAction() { return recommendedAction; }
    public void setRecommendedAction(String recommendedAction) { this.recommendedAction = recommendedAction; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Company getTenant() { return tenant; }
    public void setTenant(Company tenant) { this.tenant = tenant; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
