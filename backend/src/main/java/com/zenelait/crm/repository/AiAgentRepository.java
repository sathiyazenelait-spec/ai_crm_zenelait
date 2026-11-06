package com.zenelait.crm.repository;

import com.zenelait.crm.model.AiAgent;
import com.zenelait.crm.model.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AiAgentRepository extends JpaRepository<AiAgent, String> {
    List<AiAgent> findByTenant(Company tenant);
    List<AiAgent> findByTenantId(String tenantId);
    Optional<AiAgent> findByIdAndTenantId(String id, String tenantId);
    long countByTenantId(String tenantId);
}
