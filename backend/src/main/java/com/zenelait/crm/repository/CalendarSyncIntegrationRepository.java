package com.zenelait.crm.repository;

import com.zenelait.crm.model.CalendarSyncIntegration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CalendarSyncIntegrationRepository extends JpaRepository<CalendarSyncIntegration, String> {
    List<CalendarSyncIntegration> findByTenantId(String tenantId);
    Optional<CalendarSyncIntegration> findByTenantIdAndUserIdAndProvider(String tenantId, String userId, String provider);
    List<CalendarSyncIntegration> findByUserId(String userId);
}

