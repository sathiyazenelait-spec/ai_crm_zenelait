package com.zenelait.crm.dto;

public class RegisterRequest {
    private String fullName;
    private String email;
    private String password;
    private String companyId;     // Either direct companyId
    private String companyName;   // Or company name for case-insensitive lookup
    private String role;          // e.g. SALES_REP, SUPPORT_AGENT, HR_MANAGER, COMPANY_ADMIN
    private String department;
    private String phone;
    private Boolean isNewCompany;
    private String industryId;
    private String packagePlan; // Starter, Professional, Enterprise
    private String website;
    private String address;

    public RegisterRequest() {}

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getCompanyId() { return companyId; }
    public void setCompanyId(String companyId) { this.companyId = companyId; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public Boolean getIsNewCompany() { return isNewCompany; }
    public void setIsNewCompany(Boolean isNewCompany) { this.isNewCompany = isNewCompany; }

    public String getIndustryId() { return industryId; }
    public void setIndustryId(String industryId) { this.industryId = industryId; }

    public String getPackagePlan() { return packagePlan; }
    public void setPackagePlan(String packagePlan) { this.packagePlan = packagePlan; }

    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
}
