package com.zenelait.crm.repository;

import com.zenelait.crm.model.LeadVectorSignature;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LeadVectorSignatureRepository extends JpaRepository<LeadVectorSignature, String> {
    List<LeadVectorSignature> findByTenantId(String tenantId);
    Optional<LeadVectorSignature> findByTenantIdAndLeadId(String tenantId, String leadId);
    void deleteByTenantIdAndLeadId(String tenantId, String leadId);
}

