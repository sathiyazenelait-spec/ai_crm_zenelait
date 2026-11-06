package com.zenelait.crm.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "enquiries")
public class Enquiry {

    @Id
    @Column(length = 50)
    private String id;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(name = "business_email", nullable = false, length = 150)
    private String businessEmail;

    @Column(length = 50)
    private String phone;

    @Column(name = "company_name", nullable = false, length = 150)
    private String companyName;

    @Column(name = "industry_id", nullable = false, length = 50)
    private String industryId;

    @Column(name = "team_size", length = 50)
    private String teamSize = "10-50";

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(length = 30)
    private String status = "PENDING_APPROVAL"; // PENDING_APPROVAL, APPROVED_PROVISIONED, REJECTED

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @Column(name = "processed_by", length = 100)
    private String processedBy;

    public Enquiry() {}

    public Enquiry(String id, String fullName, String businessEmail, String phone, String companyName, String industryId, String teamSize, String message) {
        this.id = id;
        this.fullName = fullName;
        this.businessEmail = businessEmail;
        this.phone = phone;
        this.companyName = companyName;
        this.industryId = industryId;
        this.teamSize = teamSize;
        this.message = message;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getBusinessEmail() { return businessEmail; }
    public void setBusinessEmail(String businessEmail) { this.businessEmail = businessEmail; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getIndustryId() { return industryId; }
    public void setIndustryId(String industryId) { this.industryId = industryId; }

    public String getTeamSize() { return teamSize; }
    public void setTeamSize(String teamSize) { this.teamSize = teamSize; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getProcessedAt() { return processedAt; }
    public void setProcessedAt(LocalDateTime processedAt) { this.processedAt = processedAt; }

    public String getProcessedBy() { return processedBy; }
    public void setProcessedBy(String processedBy) { this.processedBy = processedBy; }
}
