package com.zenelait.crm.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "lead_vector_signatures")
public class LeadVectorSignature {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "tenant_id", nullable = false, length = 50)
    private String tenantId;

    @Column(name = "lead_id", nullable = false, length = 64)
    private String leadId;

    @Column(name = "full_name", length = 150)
    private String fullName;

    @Column(name = "company_name", length = 150)
    private String companyName;

    @Column(length = 50)
    private String phone;

    @Column(length = 150)
    private String email;

    @Column(name = "normalized_contact_str", columnDefinition = "TEXT")
    private String normalizedContactStr;

    @Column(name = "contact_vector", columnDefinition = "MEDIUMTEXT", nullable = false)
    private String contactVector;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public LeadVectorSignature() {}

    public LeadVectorSignature(String id, String tenantId, String leadId, String fullName, String companyName, String phone, String email, String normalizedContactStr, String contactVector) {
        this.id = id;
        this.tenantId = tenantId;
        this.leadId = leadId;
        this.fullName = fullName;
        this.companyName = companyName;
        this.phone = phone;
        this.email = email;
        this.normalizedContactStr = normalizedContactStr;
        this.contactVector = contactVector;
        this.createdAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }

    public String getLeadId() { return leadId; }
    public void setLeadId(String leadId) { this.leadId = leadId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getNormalizedContactStr() { return normalizedContactStr; }
    public void setNormalizedContactStr(String normalizedContactStr) { this.normalizedContactStr = normalizedContactStr; }

    public String getContactVector() { return contactVector; }
    public void setContactVector(String contactVector) { this.contactVector = contactVector; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
