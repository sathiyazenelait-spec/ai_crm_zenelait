package com.zenelait.crm.conversation;

import com.zenelait.crm.common.exception.ResourceNotFoundException;
import com.zenelait.crm.model.ChatMessage;
import com.zenelait.crm.model.Conversation;
import com.zenelait.crm.repository.ChatMessageRepository;
import com.zenelait.crm.repository.ConversationRepository;
import com.zenelait.crm.tenant.TenantSecurityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/v1/conversations")
@CrossOrigin(origins = "*")
public class ConversationV1Controller {

    private final ConversationRepository conversationRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final TenantSecurityService tenantSecurityService;

    public ConversationV1Controller(
            ConversationRepository conversationRepository,
            ChatMessageRepository chatMessageRepository,
            TenantSecurityService tenantSecurityService
    ) {
        this.conversationRepository = conversationRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.tenantSecurityService = tenantSecurityService;
    }

    /**
     * GET /api/v1/conversations
     */
    @GetMapping
    public ResponseEntity<List<Conversation>> getConversations() {
        String tenantId = tenantSecurityService.getCurrentTenantId();
        return ResponseEntity.ok(conversationRepository.findByTenantIdOrderByUpdatedAtDesc(tenantId));
    }

    /**
     * GET /api/v1/conversations/{conversationId}
     */
    @GetMapping("/{conversationId}")
    public ResponseEntity<Conversation> getConversation(@PathVariable String conversationId) {
        String tenantId = tenantSecurityService.getCurrentTenantId();
        Conversation conv = conversationRepository.findByIdAndTenantId(conversationId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found: " + conversationId));
        return ResponseEntity.ok(conv);
    }

    /**
     * POST /api/v1/conversations/{conversationId}/messages
     */
    @PostMapping("/{conversationId}/messages")
    public ResponseEntity<Map<String, Object>> sendMessage(
            @PathVariable String conversationId,
            @RequestBody Map<String, String> body
    ) {
        String tenantId = tenantSecurityService.getCurrentTenantId();
        Conversation conv = conversationRepository.findByIdAndTenantId(conversationId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found: " + conversationId));

        String text = body.get("text");
        String sender = body.getOrDefault("sender", "agent");

        ChatMessage message = new ChatMessage(sender, text, null, conv);
        chatMessageRepository.save(message);

        conv.setLastMessage(text);
        conv.setUpdatedAt(LocalDateTime.now());
        conversationRepository.save(conv);

        return ResponseEntity.ok(Map.of(
                "conversationId", conv.getId(),
                "messageId", message.getId(),
                "text", message.getText(),
                "sentAt", message.getCreatedAt()
        ));
    }

    /**
     * PATCH /api/v1/conversations/{conversationId}/assignment
     */
    @PatchMapping("/{conversationId}/assignment")
    public ResponseEntity<Map<String, Object>> assignConversation(
            @PathVariable String conversationId,
            @RequestBody Map<String, String> body
    ) {
        String tenantId = tenantSecurityService.getCurrentTenantId();
        Conversation conv = conversationRepository.findByIdAndTenantId(conversationId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found: " + conversationId));

        String assigneeId = body.get("assigneeId");
        conv.setAssigneeId(assigneeId);
        conv.setAssignedTo(assigneeId);
        conv.setStatus("ASSIGNED");
        conv.setUpdatedAt(LocalDateTime.now());
        conversationRepository.save(conv);

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("conversationId", conv.getId());
        res.put("assigneeId", assigneeId);
        res.put("status", "ASSIGNED");
        res.put("assignedAt", LocalDateTime.now().toString());

        return ResponseEntity.ok(res);
    }

    /**
     * POST /api/v1/conversations/{conversationId}/handover
     */
    @PostMapping("/{conversationId}/handover")
    public ResponseEntity<Map<String, Object>> handoverConversation(
            @PathVariable String conversationId,
            @RequestBody Map<String, String> body
    ) {
        String tenantId = tenantSecurityService.getCurrentTenantId();
        Conversation conv = conversationRepository.findByIdAndTenantId(conversationId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found: " + conversationId));

        String assignToTeam = body.getOrDefault("assignToTeam", "SALES");
        conv.setStatus("WAITING_FOR_HUMAN");
        conv.setAssignedTeam(assignToTeam);
        conv.setUpdatedAt(LocalDateTime.now());
        conversationRepository.save(conv);

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("conversationId", conv.getId());
        res.put("status", "WAITING_FOR_HUMAN");
        res.put("assignedTeam", assignToTeam);
        res.put("conversationHistoryPreserved", true);

        return ResponseEntity.ok(res);
    }
}
