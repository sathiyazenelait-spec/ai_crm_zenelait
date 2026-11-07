package com.zenelait.crm.repository;

import com.zenelait.crm.model.TenantSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TenantSubscriptionRepository extends JpaRepository<TenantSubscription, String> {
    Optional<TenantSubscription> findByTenantId(String tenantId);
    Optional<TenantSubscription> findBySubscriptionId(String subscriptionId);
}

