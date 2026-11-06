package com.zenelait.crm.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import java.util.List;
import java.util.Map;

public class ItProposalDto {

    private String opportunityId;
    private String leadId;

    @NotBlank(message = "Proposal title is required")
    private String title;

    @NotBlank(message = "Product name is required")
    private String product;

    private String subscriptionPlan;
    private List<Map<String, Object>> lineItems;

    @PositiveOrZero(message = "Subtotal must be positive or zero")
    private Double subtotal;

    private Double discountPercent = 0.0;
    private Double taxPercent = 18.0;
    private String currency = "INR";
    private String validUntil;
    private String notes;

    public ItProposalDto() {}

    public String getOpportunityId() { return opportunityId; }
    public void setOpportunityId(String opportunityId) { this.opportunityId = opportunityId; }

    public String getLeadId() { return leadId; }
    public void setLeadId(String leadId) { this.leadId = leadId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getProduct() { return product; }
    public void setProduct(String product) { this.product = product; }

    public String getSubscriptionPlan() { return subscriptionPlan; }
    public void setSubscriptionPlan(String subscriptionPlan) { this.subscriptionPlan = subscriptionPlan; }

    public List<Map<String, Object>> getLineItems() { return lineItems; }
    public void setLineItems(List<Map<String, Object>> lineItems) { this.lineItems = lineItems; }

    public Double getSubtotal() { return subtotal; }
    public void setSubtotal(Double subtotal) { this.subtotal = subtotal; }

    public Double getDiscountPercent() { return discountPercent; }
    public void setDiscountPercent(Double discountPercent) { this.discountPercent = discountPercent; }

    public Double getTaxPercent() { return taxPercent; }
    public void setTaxPercent(Double taxPercent) { this.taxPercent = taxPercent; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getValidUntil() { return validUntil; }
    public void setValidUntil(String validUntil) { this.validUntil = validUntil; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
