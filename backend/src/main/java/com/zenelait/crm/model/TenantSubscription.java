package com.zenelait.crm.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tenant_subscriptions")
public class TenantSubscription {

    @Id
    @Column(name = "tenant_id", length = 50)
    private String tenantId;

    @Column(name = "plan_tier", length = 50)
    private String planTier = "STARTER"; // STARTER, GROWTH, ENTERPRISE

    @Column(length = 30)
    private String gateway = "STRIPE"; // STRIPE, RAZORPAY

    @Column(name = "subscription_id", length = 100)
    private String subscriptionId;

    @Column(name = "customer_id", length = 100)
    private String customerId;

    @Column(name = "seats_purchased")
    private Integer seatsPurchased = 3;

    @Column(name = "ai_credits_total")
    private Integer aiCreditsTotal = 250;

    @Column(name = "ai_credits_used")
    private Integer aiCreditsUsed = 0;

    @Column(length = 30)
    private String status = "ACTIVE"; // ACTIVE, PAST_DUE, CANCELLED

    @Column(length = 50)
    private String amount = "$29/mo";

    @Column(name = "billing_cycle", length = 30)
    private String billingCycle = "MONTHLY";

    @Column(name = "current_period_end")
    private LocalDateTime currentPeriodEnd;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public TenantSubscription() {}

    public TenantSubscription(String tenantId, String planTier, String gateway, String subscriptionId, String customerId, Integer seatsPurchased, Integer aiCreditsTotal, Integer aiCreditsUsed, String status, String amount, String billingCycle) {
        this.tenantId = tenantId;
        this.planTier = planTier;
        this.gateway = gateway;
        this.subscriptionId = subscriptionId;
        this.customerId = customerId;
        this.seatsPurchased = seatsPurchased;
        this.aiCreditsTotal = aiCreditsTotal;
        this.aiCreditsUsed = aiCreditsUsed;
        this.status = status;
        this.amount = amount;
        this.billingCycle = billingCycle;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.currentPeriodEnd = LocalDateTime.now().plusMonths(1);
    }

    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }

    public String getPlanTier() { return planTier; }
    public void setPlanTier(String planTier) { this.planTier = planTier; }

    public String getGateway() { return gateway; }
    public void setGateway(String gateway) { this.gateway = gateway; }

    public String getSubscriptionId() { return subscriptionId; }
    public void setSubscriptionId(String subscriptionId) { this.subscriptionId = subscriptionId; }

    public String getCustomerId() { return customerId; }
    public void setCustomerId(String customerId) { this.customerId = customerId; }

    public Integer getSeatsPurchased() { return seatsPurchased; }
    public void setSeatsPurchased(Integer seatsPurchased) { this.seatsPurchased = seatsPurchased; }

    public Integer getAiCreditsTotal() { return aiCreditsTotal; }
    public void setAiCreditsTotal(Integer aiCreditsTotal) { this.aiCreditsTotal = aiCreditsTotal; }

    public Integer getAiCreditsUsed() { return aiCreditsUsed; }
    public void setAiCreditsUsed(Integer aiCreditsUsed) { this.aiCreditsUsed = aiCreditsUsed; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAmount() { return amount; }
    public void setAmount(String amount) { this.amount = amount; }

    public String getBillingCycle() { return billingCycle; }
    public void setBillingCycle(String billingCycle) { this.billingCycle = billingCycle; }

    public LocalDateTime getCurrentPeriodEnd() { return currentPeriodEnd; }
    public void setCurrentPeriodEnd(LocalDateTime currentPeriodEnd) { this.currentPeriodEnd = currentPeriodEnd; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
