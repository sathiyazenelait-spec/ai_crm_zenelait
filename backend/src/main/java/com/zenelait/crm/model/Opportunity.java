package com.zenelait.crm.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "opportunities")
@JsonIgnoreProperties(ignoreUnknown = true)
public class Opportunity {

    @Id
    @Column(length = 50)
    private String id;

    private String leadId;

    @Column(nullable = false)
    private String name;

    private String title;

    private String company;

    private Double amount = 0.0;

    private String currency = "INR";

    @Column(nullable = false)
    private String stage = "QUALIFICATION";

    private Integer probabilityPercent = 25;

    private Integer probability = 25;

    private String owner;

    private String expectedCloseDate;

    private String expectedClose;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Company tenant;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Opportunity() {}

    public Opportunity(String id, String leadId, String name, Double amount, String currency, String stage, Integer probabilityPercent, Company tenant) {
        this.id = id;
        this.leadId = leadId;
        this.name = name;
        this.title = name;
        this.amount = amount;
        this.currency = currency;
        this.stage = stage;
        this.probabilityPercent = probabilityPercent;
        this.probability = probabilityPercent;
        this.tenant = tenant;
    }

    @PrePersist
    public void prePersist() {
        if (this.id == null || this.id.trim().isEmpty()) {
            this.id = "OPP-" + (1000 + (long)(Math.random() * 9000));
        }
        if (this.title != null && this.name == null) this.name = this.title;
        if (this.name != null && this.title == null) this.title = this.name;
        if (this.probabilityPercent != null) this.probability = this.probabilityPercent;
        if (this.expectedCloseDate != null && this.expectedClose == null) this.expectedClose = this.expectedCloseDate;
        if (this.createdAt == null) this.createdAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getLeadId() { return leadId; }
    public void setLeadId(String leadId) { this.leadId = leadId; }

    public String getName() { return name != null ? name : title; }
    public void setName(String name) { 
        this.name = name; 
        this.title = name;
    }

    public String getTitle() { return title != null ? title : name; }
    public void setTitle(String title) { 
        this.title = title; 
        this.name = title;
    }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getStage() { return stage; }
    public void setStage(String stage) { this.stage = stage; }

    public Integer getProbabilityPercent() { return probabilityPercent != null ? probabilityPercent : probability; }
    public void setProbabilityPercent(Integer probabilityPercent) { 
        this.probabilityPercent = probabilityPercent; 
        this.probability = probabilityPercent;
    }

    public Integer getProbability() { return probability != null ? probability : probabilityPercent; }
    public void setProbability(Integer probability) { 
        this.probability = probability; 
        this.probabilityPercent = probability;
    }

    public String getOwner() { return owner; }
    public void setOwner(String owner) { this.owner = owner; }

    public String getExpectedCloseDate() { return expectedCloseDate != null ? expectedCloseDate : expectedClose; }
    public void setExpectedCloseDate(String expectedCloseDate) { 
        this.expectedCloseDate = expectedCloseDate; 
        this.expectedClose = expectedCloseDate;
    }

    public String getExpectedClose() { return expectedClose != null ? expectedClose : expectedCloseDate; }
    public void setExpectedClose(String expectedClose) { 
        this.expectedClose = expectedClose; 
        this.expectedCloseDate = expectedClose;
    }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Company getTenant() { return tenant; }
    public void setTenant(Company tenant) { this.tenant = tenant; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
