package com.zenelait.crm.whatsapp;

import com.zenelait.crm.model.Company;
import com.zenelait.crm.model.WhatsAppMessage;
import com.zenelait.crm.repository.CompanyRepository;
import com.zenelait.crm.repository.WhatsAppMessageRepository;
import com.zenelait.crm.tenant.TenantSecurityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/whatsapp")
@CrossOrigin(origins = "*")
public class WhatsAppWebhookController {

    private static final String VERIFY_TOKEN = "zenelait_secret_token_2026";
    private final WhatsAppAiService whatsAppAiService;
    private final WhatsAppMessageRepository messageRepository;
    private final CompanyRepository companyRepository;
    private final TenantSecurityService tenantSecurityService;

    public WhatsAppWebhookController(
            WhatsAppAiService whatsAppAiService,
            WhatsAppMessageRepository messageRepository,
            CompanyRepository companyRepository,
            TenantSecurityService tenantSecurityService
    ) {
        this.whatsAppAiService = whatsAppAiService;
        this.messageRepository = messageRepository;
        this.companyRepository = companyRepository;
        this.tenantSecurityService = tenantSecurityService;
    }

    /**
     * 1. GET /api/v1/whatsapp/webhook
     * Meta Cloud API Webhook Subscription Verification
     */
    @GetMapping("/webhook")
    public ResponseEntity<String> verifyWebhook(
            @RequestParam(value = "hub.mode", required = false) String mode,
            @RequestParam(value = "hub.verify_token", required = false) String token,
            @RequestParam(value = "hub.challenge", required = false) String challenge
    ) {
        if ("subscribe".equals(mode) && VERIFY_TOKEN.equals(token)) {
            return ResponseEntity.ok(challenge);
        }
        return ResponseEntity.status(403).body("Verification token mismatch");
    }

    /**
     * 2. POST /api/v1/whatsapp/webhook
     * Inbound message notifications from Meta Graph API
     */
    @PostMapping("/webhook")
    public ResponseEntity<String> receiveWebhook(@RequestBody Map<String, Object> payload) {
        try {
            // Safe extraction from Meta's nested payload structure:
            // entry[0].changes[0].value.messages[0]
            List<Map<String, Object>> entries = (List<Map<String, Object>>) payload.get("entry");
            if (entries != null && !entries.isEmpty()) {
                Map<String, Object> entry = entries.get(0);
                List<Map<String, Object>> changes = (List<Map<String, Object>>) entry.get("changes");
                if (changes != null && !changes.isEmpty()) {
                    Map<String, Object> value = (Map<String, Object>) changes.get(0).get("value");
                    List<Map<String, Object>> messages = (List<Map<String, Object>>) value.get("messages");
                    if (messages != null && !messages.isEmpty()) {
                        Map<String, Object> msg = messages.get(0);
                        String from = (String) msg.get("from");
                        Map<String, Object> textObj = (Map<String, Object>) msg.get("text");
                        String body = textObj != null ? (String) textObj.get("body") : "Hello";

                        whatsAppAiService.processIncomingWhatsApp(from, "WhatsApp User", body, "TEN-IT-001");
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error parsing Meta webhook payload: " + e.getMessage());
        }
        return ResponseEntity.ok("EVENT_RECEIVED");
    }

    /**
     * 3. POST /api/v1/whatsapp/simulate-incoming
     * Live interactive simulation endpoint for UI and testing
     */
    @PostMapping("/simulate-incoming")
    public ResponseEntity<?> simulateIncoming(@RequestBody Map<String, String> request) {
        String phone = request.getOrDefault("senderPhone", "+91 98765 43210");
        String name = request.getOrDefault("senderName", "Rohan Mehta");
        String text = request.getOrDefault("messageText", "Hi, can you send the software pricing and brochure?");
        String tenantId = request.getOrDefault("tenantId", tenantSecurityService.getCurrentTenantId());

        Map<String, Object> result = whatsAppAiService.processIncomingWhatsApp(phone, name, text, tenantId);
        return ResponseEntity.ok(result);
    }

    /**
     * 4. GET /api/v1/whatsapp/messages
     */
    @GetMapping("/messages")
    public ResponseEntity<List<WhatsAppMessage>> getMessages(@RequestParam(required = false) String tenantId) {
        String effectiveTenant = tenantId != null ? tenantId : tenantSecurityService.getCurrentTenantId();
        return ResponseEntity.ok(whatsAppAiService.getMessagesForTenant(effectiveTenant));
    }

    /**
     * 5. POST /api/v1/whatsapp/send-reply
     * Manual Sales Representative reply from CRM inbox
     */
    @PostMapping("/send-reply")
    public ResponseEntity<?> sendManualReply(@RequestBody Map<String, String> request) {
        String phone = request.get("senderPhone");
        String text = request.get("messageText");
        String agentName = request.getOrDefault("agentName", "Sales Representative");
        String tenantId = request.getOrDefault("tenantId", tenantSecurityService.getCurrentTenantId());

        Company company = companyRepository.findById(tenantId).orElseGet(() ->
                companyRepository.findAll().stream().findFirst().orElse(null)
        );

        String id = "WA-OUT-REP-" + UUID.randomUUID().toString().substring(0, 8);
        WhatsAppMessage manual = new WhatsAppMessage(id, phone, agentName, text, "OUTBOUND", company);
        manual.setStatus("MANUAL_SENT");
        WhatsAppMessage saved = messageRepository.save(manual);

        return ResponseEntity.ok(saved);
    }
}
