package com.zenelait.crm.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "companies")
public class Company {

    @Id
    @Column(length = 50)
    private String id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "clean_name", nullable = false, length = 150)
    private String cleanName; // Normalized (lowercase, no spaces, no punctuation) for fuzzy search

    @Column(name = "industry_id", nullable = false, length = 50)
    private String industryId;

    @Column(name = "industry_name", nullable = false, length = 100)
    private String industryName;

    @Column(length = 50)
    private String plan = "Professional";

    private Integer seats = 25;

    @Column(length = 50)
    private String mrr = "₹5,999/mo";

    @Column(name = "hr_contact", length = 100)
    private String hrContact;

    @Column(length = 50)
    private String phone;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "logo_letter", length = 10)
    private String logoLetter;

    @Column(length = 20)
    private String color = "#3b82f6";

    @Column(length = 30)
    private String status = "ACTIVE";

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Company() {}

    public Company(String id, String name, String industryId, String industryName, String plan, Integer seats, String hrContact, String color) {
        this.id = id;
        this.name = name;
        this.cleanName = normalizeName(name);
        this.industryId = industryId;
        this.industryName = industryName;
        this.plan = plan;
        this.seats = seats;
        this.hrContact = hrContact;
        this.color = color;
        this.logoLetter = name != null && !name.isEmpty() ? name.substring(0, Math.min(2, name.length())).toUpperCase() : "CO";
    }

    public static String normalizeName(String input) {
        if (input == null) return "";
        return input.toLowerCase().replaceAll("[^a-z0-9]", "");
    }

    @PrePersist
    @PreUpdate
    public void onSave() {
        if (this.name != null) {
            this.cleanName = normalizeName(this.name);
            if (this.logoLetter == null || this.logoLetter.isEmpty()) {
                this.logoLetter = this.name.substring(0, Math.min(2, this.name.length())).toUpperCase();
            }
        }
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { 
        this.name = name; 
        this.cleanName = normalizeName(name);
    }

    public String getCleanName() { return cleanName; }
    public void setCleanName(String cleanName) { this.cleanName = cleanName; }

    public String getIndustryId() { return industryId; }
    public void setIndustryId(String industryId) { this.industryId = industryId; }

    public String getIndustryName() { return industryName; }
    public void setIndustryName(String industryName) { this.industryName = industryName; }

    public String getPlan() { return plan; }
    public void setPlan(String plan) { this.plan = plan; }

    public Integer getSeats() { return seats; }
    public void setSeats(Integer seats) { this.seats = seats; }

    public String getMrr() { return mrr; }
    public void setMrr(String mrr) { this.mrr = mrr; }

    public String getHrContact() { return hrContact; }
    public void setHrContact(String hrContact) { this.hrContact = hrContact; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getLogoLetter() { return logoLetter; }
    public void setLogoLetter(String logoLetter) { this.logoLetter = logoLetter; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
