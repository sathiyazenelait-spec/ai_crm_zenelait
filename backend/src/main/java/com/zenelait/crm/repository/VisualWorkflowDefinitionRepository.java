package com.zenelait.crm.repository;

import com.zenelait.crm.model.VisualWorkflowDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VisualWorkflowDefinitionRepository extends JpaRepository<VisualWorkflowDefinition, String> {
    List<VisualWorkflowDefinition> findByTenantId(String tenantId);
    List<VisualWorkflowDefinition> findByTenantIdAndIsActiveTrue(String tenantId);
}

