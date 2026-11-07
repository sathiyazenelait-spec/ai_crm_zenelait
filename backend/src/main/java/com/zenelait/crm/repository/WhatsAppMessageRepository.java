package com.zenelait.crm.repository;

import com.zenelait.crm.model.WhatsAppMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WhatsAppMessageRepository extends JpaRepository<WhatsAppMessage, String> {
    List<WhatsAppMessage> findByTenantIdOrderByCreatedAtDesc(String tenantId);
    List<WhatsAppMessage> findBySenderPhoneOrderByCreatedAtAsc(String senderPhone);
    List<WhatsAppMessage> findTop50ByTenantIdOrderByCreatedAtDesc(String tenantId);
}
