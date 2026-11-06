package com.zenelait.crm.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;

public class ProposalApprovalRequestDto {

    @PositiveOrZero(message = "Discount percentage must be positive")
    private Double discountPercent;

    private Double requestedDiscountAmount;

    @NotBlank(message = "Reason for discount / approval request is required")
    private String reason;

    private String requestedBy;

    public ProposalApprovalRequestDto() {}

    public Double getDiscountPercent() { return discountPercent; }
    public void setDiscountPercent(Double discountPercent) { this.discountPercent = discountPercent; }

    public Double getRequestedDiscountAmount() { return requestedDiscountAmount; }
    public void setRequestedDiscountAmount(Double requestedDiscountAmount) { this.requestedDiscountAmount = requestedDiscountAmount; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getRequestedBy() { return requestedBy; }
    public void setRequestedBy(String requestedBy) { this.requestedBy = requestedBy; }
}
