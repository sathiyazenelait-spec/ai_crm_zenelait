package com.zenelait.crm.repository;

import com.zenelait.crm.model.Company;
import com.zenelait.crm.model.Opportunity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OpportunityRepository extends JpaRepository<Opportunity, String> {
    List<Opportunity> findByTenant(Company tenant);
    List<Opportunity> findByTenantId(String tenantId);
    List<Opportunity> findByTenantIdAndStage(String tenantId, String stage);
    Optional<Opportunity> findByIdAndTenantId(String id, String tenantId);
    long countByTenantId(String tenantId);
    long countByTenantIdAndStage(String tenantId, String stage);
}
