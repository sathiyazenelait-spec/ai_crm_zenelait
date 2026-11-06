package com.zenelait.crm.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;

public class LeadCreateDto {

    @NotBlank(message = "Lead name is required")
    private String name;

    @NotBlank(message = "Lead email is required")
    @Email(message = "Invalid email format")
    private String email;

    private String phone;
    private String companyName;
    private String source = "WEBSITE";
    private String productInterest = "HRMS";
    private String requirement;

    @PositiveOrZero(message = "Budget must be positive or zero")
    private Double budget = 500000.0;

    private String currency = "INR";
    private String ownerId;

    public LeadCreateDto() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getProductInterest() { return productInterest; }
    public void setProductInterest(String productInterest) { this.productInterest = productInterest; }

    public String getRequirement() { return requirement; }
    public void setRequirement(String requirement) { this.requirement = requirement; }

    public Double getBudget() { return budget; }
    public void setBudget(Double budget) { this.budget = budget; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getOwnerId() { return ownerId; }
    public void setOwnerId(String ownerId) { this.ownerId = ownerId; }
}
