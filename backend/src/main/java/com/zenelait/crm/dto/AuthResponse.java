package com.zenelait.crm.dto;

import com.zenelait.crm.model.Role;

public class AuthResponse {
    private String token;
    private String tokenType = "Bearer";
    private String userId;
    private String email;
    private String fullName;
    private String role;
    private String companyId;
    private String companyName;
    private String industryId;
    private String industryName;
    private String plan;
    private String avatarLetter;
    private String message;

    public AuthResponse() {}

    public AuthResponse(String token, String userId, String email, String fullName, Role role, String companyId, String companyName, String industryId, String industryName, String plan, String avatarLetter) {
        this.token = token;
        this.userId = userId;
        this.email = email;
        this.fullName = fullName;
        this.role = role != null ? role.name() : "COMPANY_ADMIN";
        this.companyId = companyId;
        this.companyName = companyName;
        this.industryId = industryId;
        this.industryName = industryName;
        this.plan = plan;
        this.avatarLetter = avatarLetter;
        this.message = "Authenticated successfully";
    }

    // Getters and Setters
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getCompanyId() { return companyId; }
    public void setCompanyId(String companyId) { this.companyId = companyId; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getIndustryId() { return industryId; }
    public void setIndustryId(String industryId) { this.industryId = industryId; }

    public String getIndustryName() { return industryName; }
    public void setIndustryName(String industryName) { this.industryName = industryName; }

    public String getPlan() { return plan; }
    public void setPlan(String plan) { this.plan = plan; }

    public String getAvatarLetter() { return avatarLetter; }
    public void setAvatarLetter(String avatarLetter) { this.avatarLetter = avatarLetter; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
