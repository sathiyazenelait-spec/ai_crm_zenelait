package com.zenelait.crm.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "conversations")
@JsonIgnoreProperties(ignoreUnknown = true)
public class Conversation {

    @Id
    @Column(length = 50)
    private String id;

    @Column(nullable = false)
    private String customer;

    private String email;

    private String phone;

    private String channel = "Website"; // Website, WhatsApp, Email, Instagram

    @Column(columnDefinition = "TEXT")
    private String lastMessage;

    private String status = "AI_RESPONDED"; // OPEN, ASSIGNED, WAITING_FOR_HUMAN, RESOLVED, AI_RESPONDED

    private String assignedTo = "AI Agent";

    private String assigneeId;

    private String assignedTeam;

    private String leadId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Company tenant;

    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ChatMessage> messages = new ArrayList<>();

    private LocalDateTime updatedAt = LocalDateTime.now();

    public Conversation() {}

    public Conversation(String id, String customer, String email, String phone, String channel, String lastMessage, String status, Company tenant) {
        this.id = id;
        this.customer = customer;
        this.email = email;
        this.phone = phone;
        this.channel = channel;
        this.lastMessage = lastMessage;
        this.status = status;
        this.tenant = tenant;
    }

    @PrePersist
    public void prePersist() {
        if (this.id == null || this.id.trim().isEmpty()) {
            this.id = "CONV-" + (100 + (long)(Math.random() * 900));
        }
        if (this.updatedAt == null) this.updatedAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCustomer() { return customer; }
    public void setCustomer(String customer) { this.customer = customer; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getChannel() { return channel; }
    public void setChannel(String channel) { this.channel = channel; }

    public String getLastMessage() { return lastMessage; }
    public void setLastMessage(String lastMessage) { this.lastMessage = lastMessage; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAssignedTo() { return assignedTo; }
    public void setAssignedTo(String assignedTo) { this.assignedTo = assignedTo; }

    public String getAssigneeId() { return assigneeId; }
    public void setAssigneeId(String assigneeId) { this.assigneeId = assigneeId; }

    public String getAssignedTeam() { return assignedTeam; }
    public void setAssignedTeam(String assignedTeam) { this.assignedTeam = assignedTeam; }

    public String getLeadId() { return leadId; }
    public void setLeadId(String leadId) { this.leadId = leadId; }

    public Company getTenant() { return tenant; }
    public void setTenant(Company tenant) { this.tenant = tenant; }

    public List<ChatMessage> getMessages() { return messages; }
    public void setMessages(List<ChatMessage> messages) { this.messages = messages; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
