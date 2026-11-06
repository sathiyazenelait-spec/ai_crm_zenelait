package com.zenelait.crm.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class LeadStageUpdateDto {

    @NotBlank(message = "Stage is required")
    private String stage;

    private Integer employeeCount;
    private Double verifiedBudget;
    private String purchaseTimeline;
    private List<String> requiredModules;
    private String qualificationNotes;

    public LeadStageUpdateDto() {}

    public String getStage() { return stage; }
    public void setStage(String stage) { this.stage = stage; }

    public Integer getEmployeeCount() { return employeeCount; }
    public void setEmployeeCount(Integer employeeCount) { this.employeeCount = employeeCount; }

    public Double getVerifiedBudget() { return verifiedBudget; }
    public void setVerifiedBudget(Double verifiedBudget) { this.verifiedBudget = verifiedBudget; }

    public String getPurchaseTimeline() { return purchaseTimeline; }
    public void setPurchaseTimeline(String purchaseTimeline) { this.purchaseTimeline = purchaseTimeline; }

    public List<String> getRequiredModules() { return requiredModules; }
    public void setRequiredModules(List<String> requiredModules) { this.requiredModules = requiredModules; }

    public String getQualificationNotes() { return qualificationNotes; }
    public void setQualificationNotes(String qualificationNotes) { this.qualificationNotes = qualificationNotes; }
}
