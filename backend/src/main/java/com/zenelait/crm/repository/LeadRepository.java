package com.zenelait.crm.repository;

import com.zenelait.crm.model.Company;
import com.zenelait.crm.model.Lead;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LeadRepository extends JpaRepository<Lead, String> {
    List<Lead> findByTenant(Company tenant);
    List<Lead> findByTenantId(String tenantId);
    List<Lead> findByTenantIdAndStage(String tenantId, String stage);
    List<Lead> findByTenantIdAndStatus(String tenantId, String status);
    
    Optional<Lead> findByIdAndTenantId(String id, String tenantId);
    
    Page<Lead> findByTenantId(String tenantId, Pageable pageable);
    Page<Lead> findByTenantIdAndStage(String tenantId, String stage, Pageable pageable);

    @Query("SELECT l FROM Lead l WHERE l.tenant.id = :tenantId AND " +
           "(:stage IS NULL OR l.stage = :stage OR l.status = :stage) AND " +
           "(:search IS NULL OR LOWER(l.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(l.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(l.companyName) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Lead> searchLeads(@Param("tenantId") String tenantId, 
                           @Param("stage") String stage, 
                           @Param("search") String search, 
                           Pageable pageable);

    long countByTenantId(String tenantId);
    long countByTenantIdAndStage(String tenantId, String stage);
}
