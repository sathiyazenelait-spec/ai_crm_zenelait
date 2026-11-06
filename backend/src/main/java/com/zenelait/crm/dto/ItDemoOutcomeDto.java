package com.zenelait.crm.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class ItDemoOutcomeDto {

    @NotBlank(message = "Outcome status is required")
    private String outcomeStatus = "POSITIVE_ADVANCING";

    @Min(value = 0, message = "Interest score must be between 0 and 100")
    @Max(value = 100, message = "Interest score must be between 0 and 100")
    private Integer interestScore = 90;

    private String questionsAsked;
    private String objectionsFaced;
    private String nextSteps;
    private Boolean techStaffRequired = false;

    public ItDemoOutcomeDto() {}

    public String getOutcomeStatus() { return outcomeStatus; }
    public void setOutcomeStatus(String outcomeStatus) { this.outcomeStatus = outcomeStatus; }

    public Integer getInterestScore() { return interestScore; }
    public void setInterestScore(Integer interestScore) { this.interestScore = interestScore; }

    public String getQuestionsAsked() { return questionsAsked; }
    public void setQuestionsAsked(String questionsAsked) { this.questionsAsked = questionsAsked; }

    public String getObjectionsFaced() { return objectionsFaced; }
    public void setObjectionsFaced(String objectionsFaced) { this.objectionsFaced = objectionsFaced; }

    public String getNextSteps() { return nextSteps; }
    public void setNextSteps(String nextSteps) { this.nextSteps = nextSteps; }

    public Boolean getTechStaffRequired() { return techStaffRequired; }
    public void setTechStaffRequired(Boolean techStaffRequired) { this.techStaffRequired = techStaffRequired; }
}
