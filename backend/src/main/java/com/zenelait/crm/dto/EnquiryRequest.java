package com.zenelait.crm.dto;

public class EnquiryRequest {
    private String fullName;
    private String businessEmail;
    private String phone;
    private String companyName;
    private String industryId;
    private String teamSize;
    private String message;

    public EnquiryRequest() {}

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
}
