package com.zenelait.crm.repository;

import com.zenelait.crm.model.Company;
import com.zenelait.crm.model.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, String> {
    List<Conversation> findByTenant(Company tenant);
    List<Conversation> findByTenantIdOrderByUpdatedAtDesc(String tenantId);
    Optional<Conversation> findByIdAndTenantId(String id, String tenantId);
    long countByTenantId(String tenantId);
}
