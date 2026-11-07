package com.zenelait.crm.quotation;

import com.zenelait.crm.model.Opportunity;
import com.zenelait.crm.model.Quotation;
import com.zenelait.crm.repository.OpportunityRepository;
import com.zenelait.crm.repository.QuotationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class QuotationService {

    private static final Logger log = LoggerFactory.getLogger(QuotationService.class);

    private final QuotationRepository quotationRepository;
    private final OpportunityRepository opportunityRepository;

    public QuotationService(QuotationRepository quotationRepository, OpportunityRepository opportunityRepository) {
        this.quotationRepository = quotationRepository;
        this.opportunityRepository = opportunityRepository;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void seedDefaultQuotations() {
        try {
            if (quotationRepository.count() == 0) {
                Quotation q1 = new Quotation(
                        "QT-2026-001",
                        "comp-software-001",
                        "OPP-101",
                        "LEAD-101",
                        "Sarah Jenkins",
                        "s.jenkins@acmecloud.com",
                        "Acme Cloud Technologies",
                        "[{\"name\":\"Zenelait Enterprise Platform (10 Seats)\",\"qty\":1,\"price\":790.00},{\"name\":\"AI SDR Voice Calling Add-On (2,000 credits)\",\"qty\":1,\"price\":150.00},{\"name\":\"Custom TiDB Vector RAG Setup\",\"qty\":1,\"price\":500.00}]",
                        1440.00,
                        18.0,
                        259.20,
                        100.00,
                        1599.20,
                        "USD"
                );
                q1.setStatus("SENT");
                quotationRepository.save(q1);

                Quotation q2 = new Quotation(
                        "QT-2026-002",
                        "comp-software-001",
                        "OPP-102",
                        "LEAD-102",
                        "David Miller",
                        "david@globalfintech.org",
                        "Global Fintech Partners",
                        "[{\"name\":\"Growth Plan Annual License\",\"qty\":1,\"price\":948.00},{\"name\":\"WhatsApp Omnichannel Webhook Gateway\",\"qty\":1,\"price\":250.00}]",
                        1198.00,
                        18.0,
                        215.64,
                        50.00,
                        1363.64,
                        "USD"
                );
                q2.setStatus("DRAFT");
                quotationRepository.save(q2);
            }
        } catch (Exception e) {
            log.warn("Notice seeding quotations: {}", e.getMessage());
        }
    }

    public List<Quotation> getTenantQuotations(String tenantId) {
        return quotationRepository.findByTenantId(tenantId);
    }

    public Optional<Quotation> getQuotationById(String id) {
        return quotationRepository.findById(id);
    }

    public Quotation createQuotation(String tenantId, Quotation quotation) {
        if (quotation.getId() == null || quotation.getId().trim().isEmpty()) {
            quotation.setId("QT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }
        quotation.setTenantId(tenantId);
        quotation.setCreatedAt(LocalDateTime.now());
        quotation.setExpiresAt(LocalDateTime.now().plusDays(15));

        // Recompute totals
        double subtotal = quotation.getSubtotal() != null ? quotation.getSubtotal() : 0.0;
        double taxRate = quotation.getTaxRate() != null ? quotation.getTaxRate() : 18.0;
        double taxAmount = Math.round((subtotal * (taxRate / 100.0)) * 100.0) / 100.0;
        double discount = quotation.getDiscountAmount() != null ? quotation.getDiscountAmount() : 0.0;
        double total = Math.round((subtotal + taxAmount - discount) * 100.0) / 100.0;

        quotation.setTaxAmount(taxAmount);
        quotation.setTotalAmount(total);
        quotation.setStatus("DRAFT");

        return quotationRepository.save(quotation);
    }

    public Map<String, Object> digitallySignQuotation(String quotationId, String signatureData, String signerName) {
        Optional<Quotation> opt = quotationRepository.findById(quotationId);
        if (opt.isEmpty()) {
            return Map.of("error", "Quotation not found");
        }

        Quotation q = opt.get();
        q.setDigitalSignatureData(signatureData);
        q.setSignedAt(LocalDateTime.now());
        q.setStatus("SIGNED");
        quotationRepository.save(q);

        // Auto-win the associated opportunity/deal if present
        if (q.getDealId() != null) {
            Optional<Opportunity> oppOpt = opportunityRepository.findById(q.getDealId());
            if (oppOpt.isPresent()) {
                Opportunity opp = oppOpt.get();
                opp.setStage("WON");
                opp.setProbability(100);
                opportunityRepository.save(opp);
                log.info("Auto-advanced Opportunity {} to WON after digital signing of {}", opp.getId(), q.getId());
            }
        }

        return Map.of(
                "status", "SUCCESS",
                "message", "Quotation digitally signed successfully. Contract is now legally binding.",
                "quotationId", q.getId(),
                "signedAt", q.getSignedAt().toString(),
                "dealWon", q.getDealId() != null,
                "totalAmount", q.getTotalAmount(),
                "currency", q.getCurrency()
        );
    }
}
