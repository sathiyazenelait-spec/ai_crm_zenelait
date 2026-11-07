package com.zenelait.crm.repository;

import com.zenelait.crm.model.TenantKnowledgeChunk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TenantKnowledgeChunkRepository extends JpaRepository<TenantKnowledgeChunk, String> {
    List<TenantKnowledgeChunk> findByTenantId(String tenantId);
    List<TenantKnowledgeChunk> findByTenantIdAndCategory(String tenantId, String category);
    long countByTenantId(String tenantId);
    void deleteByTenantId(String tenantId);
}
