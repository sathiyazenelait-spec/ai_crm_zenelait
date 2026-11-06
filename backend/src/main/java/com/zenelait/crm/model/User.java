package com.zenelait.crm.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @Column(length = 50)
    private String id;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash; // BCrypt hash

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50, columnDefinition = "VARCHAR(50)")
    private Role role = Role.COMPANY_ADMIN;

    @Column(length = 50)
    private String department = "Operations";

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "company_id")
    private Company company;

    @Column(length = 30)
    private String status = "ACTIVE";

    @Column(length = 50)
    private String phone;

    @Column(name = "avatar_letter", length = 5)
    private String avatarLetter;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public User() {}

    public User(String id, String email, String passwordHash, String fullName, Role role, Company company) {
        this.id = id;
        this.email = email.toLowerCase().trim();
        this.passwordHash = passwordHash;
        this.fullName = fullName;
        this.role = role;
        this.company = company;
        this.avatarLetter = fullName != null && !fullName.isEmpty() ? fullName.substring(0, 1).toUpperCase() : "U";
    }

    @PrePersist
    @PreUpdate
    public void onSave() {
        if (this.email != null) {
            this.email = this.email.toLowerCase().trim();
        }
        if (this.fullName != null && (this.avatarLetter == null || this.avatarLetter.isEmpty())) {
            this.avatarLetter = this.fullName.substring(0, 1).toUpperCase();
        }
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public Company getCompany() { return company; }
    public void setCompany(Company company) { this.company = company; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAvatarLetter() { return avatarLetter; }
    public void setAvatarLetter(String avatarLetter) { this.avatarLetter = avatarLetter; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
