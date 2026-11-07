package com.zenelait.crm.whatsapp;

import com.zenelait.crm.model.Company;
import com.zenelait.crm.model.Lead;
import com.zenelait.crm.model.WhatsAppMessage;
import com.zenelait.crm.repository.CompanyRepository;
import com.zenelait.crm.repository.LeadRepository;
import com.zenelait.crm.repository.WhatsAppMessageRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class WhatsAppAiService {

    private final WhatsAppMessageRepository messageRepository;
    private final LeadRepository leadRepository;
    private final CompanyRepository companyRepository;

    @Value("${app.whatsapp.access-token:}")
    private String metaAccessToken;

    @Value("${app.whatsapp.phone-number-id:}")
    private String metaPhoneNumberId;

    public WhatsAppAiService(
            WhatsAppMessageRepository messageRepository,
            LeadRepository leadRepository,
            CompanyRepository companyRepository
    ) {
        this.messageRepository = messageRepository;
        this.leadRepository = leadRepository;
        this.companyRepository = companyRepository;
    }

    @Transactional
    public Map<String, Object> processIncomingWhatsApp(
            String senderPhone,
            String senderName,
            String messageText,
            String tenantId
    ) {
        Company company = companyRepository.findById(tenantId).orElseGet(() ->
                companyRepository.findAll().stream().findFirst().orElse(null)
        );

        // 1. Save Inbound Message
        String inboundId = "WA-IN-" + UUID.randomUUID().toString().substring(0, 8);
        WhatsAppMessage inbound = new WhatsAppMessage(inboundId, senderPhone, senderName, messageText, "INBOUND", company);
        messageRepository.save(inbound);

        // 2. Ensure Lead exists in TiDB Cloud
        autoSyncWhatsAppLead(senderPhone, senderName, messageText, company);

        // 3. AI Autonomous Reasoning Engine
        String lower = messageText.toLowerCase();
        String replyText;
        String mediaUrl = null;
        boolean handoff = false;

        if (lower.contains("human") || lower.contains("agent") || lower.contains("speak to someone") || lower.contains("manager")) {
            replyText = "Understood! I am handing you over to our Senior Relationship Manager right now. One of our team members will take over this chat momentarily.";
            handoff = true;
        } else if (lower.contains("brochure") || lower.contains("catalog") || lower.contains("pdf") || lower.contains("details")) {
            replyText = "Here is our official product brochure and feature breakdown. Let me know if you would like me to schedule a 15-minute walkthrough!";
            mediaUrl = "https://ai-crm-zenelait.onrender.com/Zenelait_Proposal.pdf";
        } else if (lower.contains("price") || lower.contains("cost") || lower.contains("pricing") || lower.contains("discount")) {
            replyText = "Our multi-tenant SaaS tiers start from ₹15,999/mo (or $199/mo) with unlimited AI autonomous workflows and full TiDB Cloud persistence. How many seats are in your team?";
        } else if (lower.contains("demo") || lower.contains("book") || lower.contains("meeting") || lower.contains("call")) {
            replyText = "Great! You can reserve your preferred time slot immediately on our calendar: https://ai-crm-zenelait.onrender.com/#demo. Would tomorrow at 11:00 AM work for you?";
        } else {
            replyText = "Hello " + senderName + "! 👋 Thanks for messaging Zenelait AI CRM. I am your 24/7 autonomous sales assistant. Are you looking to automate inbound leads, support queues, or omnichannel customer journeys?";
        }

        // 4. Save Outbound Message
        String outboundId = "WA-OUT-" + UUID.randomUUID().toString().substring(0, 8);
        WhatsAppMessage outbound = new WhatsAppMessage(outboundId, senderPhone, "AI Sales SDR", replyText, "OUTBOUND", company);
        outbound.setStatus(handoff ? "HANDED_OFF" : "AUTO_REPLIED");
        outbound.setMediaUrl(mediaUrl);
        messageRepository.save(outbound);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("inboundId", inboundId);
        result.put("outboundId", outboundId);
        result.put("senderPhone", senderPhone);
        result.put("senderName", senderName);
        result.put("replyText", replyText);
        result.put("mediaUrl", mediaUrl);
        result.put("status", outbound.getStatus());
        return result;
    }

    private void autoSyncWhatsAppLead(String phone, String name, String message, Company company) {
        boolean leadExists = leadRepository.findAll().stream()
                .anyMatch(l -> phone.equalsIgnoreCase(l.getPhone()));

        if (!leadExists) {
            Lead newLead = new Lead();
            newLead.setId("LEAD-WA-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            newLead.setName(name != null && !name.isBlank() ? name : "WhatsApp Inbound Prospect");
            newLead.setEmail(phone.replaceAll("[^0-9]", "") + "@whatsapp.zenelait.ai");
            newLead.setPhone(phone);
            newLead.setCompanyName("WhatsApp Lead (" + phone + ")");
            newLead.setStage("NEW");
            newLead.setStatus("NEW");
            newLead.setScore(85);
            newLead.setSource("WHATSAPP");
            newLead.setRequirement(message);
            newLead.setBudget(250000.0);
            newLead.setCurrency("INR");
            newLead.setTenant(company);
            leadRepository.save(newLead);
        }
    }

    public List<WhatsAppMessage> getMessagesForTenant(String tenantId) {
        return messageRepository.findByTenantIdOrderByCreatedAtDesc(tenantId);
    }
}
