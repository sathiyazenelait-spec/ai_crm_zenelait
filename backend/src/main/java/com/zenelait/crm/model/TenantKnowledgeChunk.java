package com.zenelait.crm.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tenant_knowledge_chunks")
public class TenantKnowledgeChunk {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "tenant_id", nullable = false, length = 50)
    private String tenantId;

    @Column(name = "document_name", nullable = false)
    private String documentName;

    @Column(name = "content_chunk", columnDefinition = "TEXT", nullable = false)
    private String contentChunk;

    @Column(length = 50)
    private String category = "GENERAL";

    @Column(columnDefinition = "MEDIUMTEXT", nullable = false)
    private String embedding;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public TenantKnowledgeChunk() {}

    public TenantKnowledgeChunk(String id, String tenantId, String documentName, String contentChunk, String category, String embedding) {
        this.id = id;
        this.tenantId = tenantId;
        this.documentName = documentName;
        this.contentChunk = contentChunk;
        this.category = category;
        this.embedding = embedding;
        this.createdAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }

    public String getDocumentName() { return documentName; }
    public void setDocumentName(String documentName) { this.documentName = documentName; }

    public String getContentChunk() { return contentChunk; }
    public void setContentChunk(String contentChunk) { this.contentChunk = contentChunk; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getEmbedding() { return embedding; }
    public void setEmbedding(String embedding) { this.embedding = embedding; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
