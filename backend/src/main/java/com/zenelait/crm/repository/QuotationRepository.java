package com.zenelait.crm.repository;

import com.zenelait.crm.model.Quotation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuotationRepository extends JpaRepository<Quotation, String> {
    List<Quotation> findByTenantId(String tenantId);
    List<Quotation> findByTenantIdAndStatus(String tenantId, String status);
    List<Quotation> findByDealId(String dealId);
}
