package com.zenelait.crm.repository;

import com.zenelait.crm.model.Company;
import com.zenelait.crm.model.FollowUp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FollowUpRepository extends JpaRepository<FollowUp, String> {
    List<FollowUp> findByTenant(Company tenant);
    List<FollowUp> findByTenantId(String tenantId);
    List<FollowUp> findByTenantIdAndStatus(String tenantId, String status);
    Optional<FollowUp> findByIdAndTenantId(String id, String tenantId);
}
