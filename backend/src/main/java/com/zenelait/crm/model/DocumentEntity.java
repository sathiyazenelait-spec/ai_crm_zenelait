package com.zenelait.crm.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "knowledge_documents")
public class DocumentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String type = "PDF"; // PDF, DOCX, TXT, URL

    private String size = "1.5 MB";

    private String uploadedBy;

    private String status = "Active";

    private String vectors = "Indexed (Sub-20ms RAG)";

    @Column(columnDefinition = "LONGTEXT")
    private String rawContent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Company tenant;

    private LocalDateTime createdAt = LocalDateTime.now();

    public DocumentEntity() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }

    public String getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(String uploadedBy) { this.uploadedBy = uploadedBy; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getVectors() { return vectors; }
    public void setVectors(String vectors) { this.vectors = vectors; }

    public String getRawContent() { return rawContent; }
    public void setRawContent(String rawContent) { this.rawContent = rawContent; }

    public Company getTenant() { return tenant; }
    public void setTenant(Company tenant) { this.tenant = tenant; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
