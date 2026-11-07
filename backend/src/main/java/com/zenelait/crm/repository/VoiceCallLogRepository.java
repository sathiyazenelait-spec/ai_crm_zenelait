package com.zenelait.crm.repository;

import com.zenelait.crm.model.VoiceCallLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VoiceCallLogRepository extends JpaRepository<VoiceCallLog, String> {
    List<VoiceCallLog> findByTenantIdOrderByCreatedAtDesc(String tenantId);
    List<VoiceCallLog> findTop10ByTenantIdOrderByCreatedAtDesc(String tenantId);
}
