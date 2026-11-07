package com.zenelait.crm.repository;

import com.zenelait.crm.model.EmailCopilotLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmailCopilotLogRepository extends JpaRepository<EmailCopilotLog, String> {
    List<EmailCopilotLog> findByTenantIdOrderByCreatedAtDesc(String tenantId);
    List<EmailCopilotLog> findTop25ByTenantIdOrderByCreatedAtDesc(String tenantId);
}
