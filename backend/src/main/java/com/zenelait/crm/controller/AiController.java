package com.zenelait.crm.controller;

import com.zenelait.crm.model.*;
import com.zenelait.crm.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AiController {

    private final AiAgentRepository aiAgentRepository;
    private final ConversationRepository conversationRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final DocumentRepository documentRepository;
    private final CompanyRepository companyRepository;

    public AiController(
            AiAgentRepository aiAgentRepository,
            ConversationRepository conversationRepository,
            ChatMessageRepository chatMessageRepository,
            DocumentRepository documentRepository,
            CompanyRepository companyRepository
    ) {
        this.aiAgentRepository = aiAgentRepository;
        this.conversationRepository = conversationRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.documentRepository = documentRepository;
        this.companyRepository = companyRepository;
    }

    // ==================== AI AGENTS ====================
    @GetMapping("/agents")
    public ResponseEntity<List<AiAgent>> getAgents(@RequestParam(required = false, defaultValue = "TEN-IT-001") String tenantId) {
        return ResponseEntity.ok(aiAgentRepository.findByTenantId(tenantId));
    }

    @PostMapping("/agents")
    public ResponseEntity<?> createAgent(@RequestParam(required = false, defaultValue = "TEN-IT-001") String tenantId, @RequestBody AiAgent agent) {
        Company company = companyRepository.findById(tenantId).orElse(null);
        if (company == null) company = companyRepository.findAll().stream().findFirst().orElse(null);
        agent.setTenant(company);
        return ResponseEntity.ok(aiAgentRepository.save(agent));
    }

    @PutMapping("/agents/{id}")
    public ResponseEntity<?> updateAgent(@PathVariable String id, @RequestBody Map<String, Object> updates) {
        return aiAgentRepository.findById(id).map(agent -> {
            if (updates.containsKey("name")) agent.setName((String) updates.get("name"));
            if (updates.containsKey("role")) agent.setRole((String) updates.get("role"));
            if (updates.containsKey("status")) agent.setStatus((String) updates.get("status"));
            if (updates.containsKey("temperature")) agent.setTemperature(((Number) updates.get("temperature")).doubleValue());
            if (updates.containsKey("systemPrompt")) agent.setSystemPrompt((String) updates.get("systemPrompt"));
            return ResponseEntity.ok(aiAgentRepository.save(agent));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/agents/{id}")
    public ResponseEntity<?> deleteAgent(@PathVariable String id) {
        if (aiAgentRepository.existsById(id)) {
            aiAgentRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "AI Agent deleted", "id", id));
        }
        return ResponseEntity.notFound().build();
    }

    // ==================== CONVERSATIONS & LIVE AI CHAT ====================
    @GetMapping("/conversations")
    public ResponseEntity<List<Conversation>> getConversations(@RequestParam(required = false, defaultValue = "TEN-IT-001") String tenantId) {
        return ResponseEntity.ok(conversationRepository.findByTenantIdOrderByUpdatedAtDesc(tenantId));
    }

    @PostMapping("/conversations/{id}/messages")
    public ResponseEntity<?> sendMessage(@PathVariable String id, @RequestBody Map<String, String> body) {
        String text = body.get("text");
        String sender = body.getOrDefault("sender", "user");

        return conversationRepository.findById(id).map(conv -> {
            ChatMessage userMsg = new ChatMessage(sender, text, null, conv);
            chatMessageRepository.save(userMsg);

            conv.setLastMessage(text);
            conv.setUpdatedAt(LocalDateTime.now());
            conversationRepository.save(conv);

            // Auto AI response simulation stored directly in MySQL
            String companyName = conv.getTenant() != null ? conv.getTenant().getName() : "Zenelait AI";
            String aiReplyText = "Thank you for contacting " + companyName + ". Your query regarding '" + text + "' has been processed and prioritized by our AI Agent.";
            ChatMessage aiMsg = new ChatMessage("ai", aiReplyText, "⚡ Autonomous AI Agent", conv);
            chatMessageRepository.save(aiMsg);

            return ResponseEntity.ok(Map.of(
                    "userMessage", userMsg,
                    "aiResponse", aiMsg,
                    "conversationId", id
            ));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ==================== KNOWLEDGE DOCUMENTS ====================
    @GetMapping("/documents")
    public ResponseEntity<List<DocumentEntity>> getDocuments(@RequestParam(required = false, defaultValue = "TEN-IT-001") String tenantId) {
        return ResponseEntity.ok(documentRepository.findByTenantId(tenantId));
    }

    @PostMapping("/documents")
    public ResponseEntity<?> uploadDocument(@RequestParam(required = false, defaultValue = "TEN-IT-001") String tenantId, @RequestBody DocumentEntity doc) {
        Company company = companyRepository.findById(tenantId).orElse(null);
        if (company == null) company = companyRepository.findAll().stream().findFirst().orElse(null);
        doc.setTenant(company);
        return ResponseEntity.ok(documentRepository.save(doc));
    }

    @DeleteMapping("/documents/{id}")
    public ResponseEntity<?> deleteDocument(@PathVariable Long id) {
        if (documentRepository.existsById(id)) {
            documentRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Document deleted from Vector Index", "id", id));
        }
        return ResponseEntity.notFound().build();
    }
}
