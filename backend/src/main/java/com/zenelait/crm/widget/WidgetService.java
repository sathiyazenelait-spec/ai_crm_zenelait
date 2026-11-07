package com.zenelait.crm.widget;

import com.zenelait.crm.billing.SubscriptionBillingService;
import com.zenelait.crm.dedup.LeadDeduplicationService;
import com.zenelait.crm.model.Company;
import com.zenelait.crm.model.Lead;
import com.zenelait.crm.rag.VectorRagService;
import com.zenelait.crm.repository.CompanyRepository;
import com.zenelait.crm.repository.LeadRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class WidgetService {

    private static final Logger log = LoggerFactory.getLogger(WidgetService.class);

    private final VectorRagService ragService;
    private final LeadRepository leadRepository;
    private final CompanyRepository companyRepository;
    private final LeadDeduplicationService dedupService;
    private final SubscriptionBillingService billingService;

    public WidgetService(VectorRagService ragService,
                         LeadRepository leadRepository,
                         CompanyRepository companyRepository,
                         LeadDeduplicationService dedupService,
                         SubscriptionBillingService billingService) {
        this.ragService = ragService;
        this.leadRepository = leadRepository;
        this.companyRepository = companyRepository;
        this.dedupService = dedupService;
        this.billingService = billingService;
    }

    public Map<String, Object> processWidgetChat(String tenantId, String userMessage) {
        // Meter 1 AI credit for widget interaction
        billingService.consumeAiCredit(tenantId, 1);

        // Grounded RAG query in TiDB Vector Knowledge
        VectorRagService.RagAnswer answer = ragService.answerQuestionWithRag(tenantId, userMessage);

        Map<String, Object> res = new HashMap<>();
        res.put("reply", answer.getAnswer());
        res.put("isGrounded", answer.isGrounded());
        res.put("sources", answer.getSources());
        res.put("timestamp", LocalDateTime.now().toString());
        return res;
    }

    public Map<String, Object> captureWidgetLead(String tenantId, String name, String email, String phone, String companyName, String message) {
        Company tenant = companyRepository.findById(tenantId).orElseGet(() -> {
            List<Company> all = companyRepository.findAll();
            return !all.isEmpty() ? all.get(0) : null;
        });

        if (tenant == null) {
            return Map.of("error", "Tenant workspace not found");
        }

        // Deduplication check
        List<LeadDeduplicationService.DuplicateMatch> duplicates = dedupService.checkDuplicates(tenantId, name, companyName, phone, email);
        boolean isDuplicate = !duplicates.isEmpty();

        String leadId = "LEAD-WIDGET-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        Lead lead = new Lead();
        lead.setId(leadId);
        lead.setName(name != null && !name.isEmpty() ? name : "Website Visitor");
        lead.setEmail(email != null && !email.isEmpty() ? email : "visitor@" + tenantId + ".com");
        lead.setPhone(phone);
        lead.setCompany(companyName != null && !companyName.isEmpty() ? companyName : "Inbound Web Visitor");
        lead.setCompanyName(lead.getCompany());
        lead.setSource("EMBEDDABLE_WEB_WIDGET");
        lead.setStatus("NEW");
        lead.setStage("QUALIFICATION");
        lead.setNotes("Captured via Embeddable Web Widget.\nInitial Message: " + (message != null ? message : ""));
        lead.setTenant(tenant);

        if (isDuplicate) {
            lead.setNotes(lead.getNotes() + "\n⚠️ Smart Deduplication: Near-duplicate of " + duplicates.get(0).getLeadId() + " (" + duplicates.get(0).getMatchPercentage() + "% match)");
        }

        leadRepository.save(lead);

        // Register vector signature for future dedup
        dedupService.registerLeadSignature(tenantId, lead.getId(), lead.getName(), lead.getCompany(), lead.getPhone(), lead.getEmail());

        log.info("Captured inbound lead {} for tenant {} via zenelait-widget.js", lead.getId(), tenantId);

        Map<String, Object> res = new HashMap<>();
        res.put("status", "SUCCESS");
        res.put("leadId", lead.getId());
        res.put("isDuplicateWarning", isDuplicate);
        if (isDuplicate) {
            res.put("duplicateMatch", duplicates.get(0));
        }
        res.put("message", "Thank you! Our AI employee has logged your details and an executive will follow up shortly.");
        return res;
    }

    public Map<String, Object> getWidgetBranding(String tenantId) {
        Optional<Company> opt = companyRepository.findById(tenantId);
        if (opt.isPresent()) {
            Company c = opt.get();
            return Map.of(
                    "tenantId", c.getId(),
                    "companyName", c.getName(),
                    "industry", c.getIndustryName() != null ? c.getIndustryName() : "General",
                    "primaryColor", c.getColor() != null ? c.getColor() : "#2563eb",
                    "greeting", "Hi there! 👋 How can we help you with " + c.getName() + " today?",
                    "logoLetter", c.getLogoLetter() != null ? c.getLogoLetter() : "Z"
            );
        }

        return Map.of(
                "tenantId", tenantId,
                "companyName", "Zenelait AI Client",
                "industry", "Software & IT",
                "primaryColor", "#2563eb",
                "greeting", "Hello! How can we assist you today?",
                "logoLetter", "Z"
        );
    }
}
