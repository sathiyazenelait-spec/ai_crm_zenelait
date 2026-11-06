package com.zenelait.crm.dto;

public class CompanyCreateRequest {
    private String name;
    private String industryId;
    private String industryName;
    private String plan = "Professional";
    private Integer seats = 25;
    private String hrContact;
    private String ownerName;
    private String ownerPassword; // If super admin is provisioning initial owner account
    private String phone;
    private String address;
    private String color = "#3b82f6";

    public CompanyCreateRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getIndustryId() { return industryId; }
    public void setIndustryId(String industryId) { this.industryId = industryId; }

    public String getIndustryName() { return industryName; }
    public void setIndustryName(String industryName) { this.industryName = industryName; }

    public String getPlan() { return plan; }
    public void setPlan(String plan) { this.plan = plan; }

    public Integer getSeats() { return seats; }
    public void setSeats(Integer seats) { this.seats = seats; }

    public String getHrContact() { return hrContact; }
    public void setHrContact(String hrContact) { this.hrContact = hrContact; }

    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }

    public String getOwnerPassword() { return ownerPassword; }
    public void setOwnerPassword(String ownerPassword) { this.ownerPassword = ownerPassword; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
}
