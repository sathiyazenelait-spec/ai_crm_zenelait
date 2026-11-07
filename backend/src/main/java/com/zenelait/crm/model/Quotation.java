package com.zenelait.crm.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "quotations")
public class Quotation {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "tenant_id", nullable = false, length = 50)
    private String tenantId;

    @Column(name = "deal_id", length = 64)
    private String dealId;

    @Column(name = "lead_id", length = 64)
    private String leadId;

    @Column(name = "client_name", nullable = false, length = 150)
    private String clientName;

    @Column(name = "client_email", nullable = false, length = 150)
    private String clientEmail;

    @Column(name = "company_name", length = 150)
    private String companyName;

    @Column(name = "items_json", columnDefinition = "TEXT", nullable = false)
    private String itemsJson;

    private Double subtotal = 0.0;

    @Column(name = "tax_rate")
    private Double taxRate = 18.0;

    @Column(name = "tax_amount")
    private Double taxAmount = 0.0;

    @Column(name = "discount_amount")
    private Double discountAmount = 0.0;

    @Column(name = "total_amount")
    private Double totalAmount = 0.0;

    @Column(length = 10)
    private String currency = "USD";

    @Column(length = 30)
    private String status = "DRAFT"; // DRAFT, SENT, VIEWED, SIGNED, EXPIRED

    @Column(name = "digital_signature_data", columnDefinition = "TEXT")
    private String digitalSignatureData;

    @Column(name = "signed_at")
    private LocalDateTime signedAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public Quotation() {}

    public Quotation(String id, String tenantId, String dealId, String leadId, String clientName, String clientEmail, String companyName, String itemsJson, Double subtotal, Double taxRate, Double taxAmount, Double discountAmount, Double totalAmount, String currency) {
        this.id = id;
        this.tenantId = tenantId;
        this.dealId = dealId;
        this.leadId = leadId;
        this.clientName = clientName;
        this.clientEmail = clientEmail;
        this.companyName = companyName;
        this.itemsJson = itemsJson;
        this.subtotal = subtotal;
        this.taxRate = taxRate;
        this.taxAmount = taxAmount;
        this.discountAmount = discountAmount;
        this.totalAmount = totalAmount;
        this.currency = currency;
        this.status = "DRAFT";
        this.createdAt = LocalDateTime.now();
        this.expiresAt = LocalDateTime.now().plusDays(15);
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }

    public String getDealId() { return dealId; }
    public void setDealId(String dealId) { this.dealId = dealId; }

    public String getLeadId() { return leadId; }
    public void setLeadId(String leadId) { this.leadId = leadId; }

    public String getClientName() { return clientName; }
    public void setClientName(String clientName) { this.clientName = clientName; }

    public String getClientEmail() { return clientEmail; }
    public void setClientEmail(String clientEmail) { this.clientEmail = clientEmail; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getItemsJson() { return itemsJson; }
    public void setItemsJson(String itemsJson) { this.itemsJson = itemsJson; }

    public Double getSubtotal() { return subtotal; }
    public void setSubtotal(Double subtotal) { this.subtotal = subtotal; }

    public Double getTaxRate() { return taxRate; }
    public void setTaxRate(Double taxRate) { this.taxRate = taxRate; }

    public Double getTaxAmount() { return taxAmount; }
    public void setTaxAmount(Double taxAmount) { this.taxAmount = taxAmount; }

    public Double getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(Double discountAmount) { this.discountAmount = discountAmount; }

    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDigitalSignatureData() { return digitalSignatureData; }
    public void setDigitalSignatureData(String digitalSignatureData) { this.digitalSignatureData = digitalSignatureData; }

    public LocalDateTime getSignedAt() { return signedAt; }
    public void setSignedAt(LocalDateTime signedAt) { this.signedAt = signedAt; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

