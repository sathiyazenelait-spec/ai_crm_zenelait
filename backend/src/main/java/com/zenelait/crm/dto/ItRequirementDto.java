package com.zenelait.crm.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class ItRequirementDto {

    private String leadId;
    private String customerId;

    @NotBlank(message = "Product name is required (e.g. HRMS, ERP, LMS, CRM)")
    private String product;

    private Integer employeeCount;
    private List<String> modules;
    private String deployment = "CLOUD";
    private List<String> integrations;
    private Double budget;
    private String currency = "INR";
    private String notes;

    public ItRequirementDto() {}

    public String getLeadId() { return leadId; }
    public void setLeadId(String leadId) { this.leadId = leadId; }

    public String getCustomerId() { return customerId; }
    public void setCustomerId(String customerId) { this.customerId = customerId; }

    public String getProduct() { return product; }
    public void setProduct(String product) { this.product = product; }

    public Integer getEmployeeCount() { return employeeCount; }
    public void setEmployeeCount(Integer employeeCount) { this.employeeCount = employeeCount; }

    public List<String> getModules() { return modules; }
    public void setModules(List<String> modules) { this.modules = modules; }

    public String getDeployment() { return deployment; }
    public void setDeployment(String deployment) { this.deployment = deployment; }

    public List<String> getIntegrations() { return integrations; }
    public void setIntegrations(List<String> integrations) { this.integrations = integrations; }

    public Double getBudget() { return budget; }
    public void setBudget(Double budget) { this.budget = budget; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
