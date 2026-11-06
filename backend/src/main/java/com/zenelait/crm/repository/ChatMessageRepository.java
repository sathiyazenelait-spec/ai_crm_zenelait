package com.zenelait.crm.repository;

import com.zenelait.crm.model.ChatMessage;
import com.zenelait.crm.model.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByConversationOrderByCreatedAtAsc(Conversation conversation);
    List<ChatMessage> findByConversationIdOrderByCreatedAtAsc(String conversationId);
}
