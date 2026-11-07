package com.zenelait.crm.dedup;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zenelait.crm.model.Lead;
import com.zenelait.crm.model.LeadVectorSignature;
import com.zenelait.crm.rag.VectorRagService;
import com.zenelait.crm.repository.LeadRepository;
import com.zenelait.crm.repository.LeadVectorSignatureRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class LeadDeduplicationService {

    private static final Logger log = LoggerFactory.getLogger(LeadDeduplicationService.class);

    private final LeadVectorSignatureRepository signatureRepository;
    private final LeadRepository leadRepository;
    private final VectorRagService vectorRagService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public LeadDeduplicationService(LeadVectorSignatureRepository signatureRepository,
                                    LeadRepository leadRepository,
                                    VectorRagService vectorRagService) {
        this.signatureRepository = signatureRepository;
        this.leadRepository = leadRepository;
        this.vectorRagService = vectorRagService;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void indexExistingLeads() {
        try {
            List<Lead> leads = leadRepository.findAll();
            for (Lead lead : leads) {
                String tenantId = lead.getTenant() != null ? lead.getTenant().getId() : "comp-software-001";
                if (signatureRepository.findByTenantIdAndLeadId(tenantId, lead.getId()).isEmpty()) {
                    registerLeadSignature(tenantId, lead.getId(), lead.getName(), lead.getCompany(), lead.getPhone(), lead.getEmail());
                }
            }
        } catch (Exception e) {
            log.warn("Notice indexing existing leads: {}", e.getMessage());
        }
    }

    public void registerLeadSignature(String tenantId, String leadId, String name, String company, String phone, String email) {
        try {
            String contactStr = buildNormalizedContactString(name, company, phone, email);
            float[] vector = vectorRagService.generateEmbedding(contactStr);
            String vectorJson = objectMapper.writeValueAsString(vector);

            String id = "sig-" + UUID.randomUUID().toString().substring(0, 8);
            LeadVectorSignature signature = new LeadVectorSignature(
                    id, tenantId, leadId, name, company, phone, email, contactStr, vectorJson
            );
            signatureRepository.save(signature);
        } catch (Exception e) {
            log.error("Failed to register lead signature: {}", e.getMessage());
        }
    }

    public List<DuplicateMatch> checkDuplicates(String tenantId, String name, String company, String phone, String email) {
        String contactStr = buildNormalizedContactString(name, company, phone, email);
        float[] newVector = vectorRagService.generateEmbedding(contactStr);

        List<LeadVectorSignature> signatures = signatureRepository.findByTenantId(tenantId);
        List<DuplicateMatch> matches = new ArrayList<>();

        for (LeadVectorSignature sig : signatures) {
            try {
                float[] sigVector = objectMapper.readValue(sig.getContactVector(), new TypeReference<float[]>() {});
                double similarity = vectorRagService.computeCosineSimilarity(newVector, sigVector);

                // Near duplicate threshold (similarity > 0.70 or identical phone/email)
                boolean emailMatch = email != null && !email.isEmpty() && email.equalsIgnoreCase(sig.getEmail());
                boolean phoneMatch = phone != null && !phone.isEmpty() && phone.replaceAll("[^0-9]", "").equals((sig.getPhone() != null ? sig.getPhone() : "").replaceAll("[^0-9]", ""));

                if (similarity >= 0.70 || emailMatch || phoneMatch) {
                    double finalScore = (emailMatch || phoneMatch) ? Math.max(similarity, 0.95) : similarity;
                    matches.add(new DuplicateMatch(
                            sig.getLeadId(),
                            sig.getFullName(),
                            sig.getCompanyName(),
                            sig.getPhone(),
                            sig.getEmail(),
                            Math.round(finalScore * 1000.0) / 10.0,
                            emailMatch ? "EXACT_EMAIL_MATCH" : phoneMatch ? "EXACT_PHONE_MATCH" : "VECTOR_FUZZY_MATCH"
                    ));
                }
            } catch (Exception e) {
                log.warn("Error comparing signature: {}", e.getMessage());
            }
        }

        matches.sort((a, b) -> Double.compare(b.getMatchPercentage(), a.getMatchPercentage()));
        return matches;
    }

    public boolean mergeLeads(String tenantId, String primaryLeadId, String duplicateLeadId) {
        Optional<Lead> primaryOpt = leadRepository.findById(primaryLeadId);
        Optional<Lead> duplicateOpt = leadRepository.findById(duplicateLeadId);

        if (primaryOpt.isPresent() && duplicateOpt.isPresent()) {
            Lead primary = primaryOpt.get();
            Lead duplicate = duplicateOpt.get();

            // Merge notes & status
            String existingNotes = primary.getNotes() != null ? primary.getNotes() : "";
            String dupNotes = duplicate.getNotes() != null ? duplicate.getNotes() : "";
            primary.setNotes(existingNotes + "\n[Merged from duplicate " + duplicate.getId() + "]: " + dupNotes);

            // Update primary if any fields were missing
            if ((primary.getPhone() == null || primary.getPhone().isEmpty()) && duplicate.getPhone() != null) {
                primary.setPhone(duplicate.getPhone());
            }
            leadRepository.save(primary);

            // Mark duplicate as MERGED
            duplicate.setStatus("MERGED");
            duplicate.setNotes("[Merged into primary lead: " + primary.getId() + "]");
            leadRepository.save(duplicate);

            // Clean up duplicate vector signature
            signatureRepository.deleteByTenantIdAndLeadId(tenantId, duplicateLeadId);
            return true;
        }
        return false;
    }

    private String buildNormalizedContactString(String name, String company, String phone, String email) {
        StringBuilder sb = new StringBuilder();
        if (name != null) sb.append(name.toLowerCase().trim()).append(" ");
        if (company != null) {
            String normCompany = company.toLowerCase()
                    .replace("ltd", "")
                    .replace("inc", "")
                    .replace("corp", "")
                    .replace("llc", "")
                    .replace("technologies", "tech")
                    .trim();
            sb.append(normCompany).append(" ");
        }
        if (phone != null) sb.append(phone.replaceAll("[^0-9]", "")).append(" ");
        if (email != null) sb.append(email.toLowerCase().trim());
        return sb.toString().trim();
    }

    public static class DuplicateMatch {
        private final String leadId;
        private final String name;
        private final String company;
        private final String phone;
        private final String email;
        private final double matchPercentage;
        private final String matchReason;

        public DuplicateMatch(String leadId, String name, String company, String phone, String email, double matchPercentage, String matchReason) {
            this.leadId = leadId;
            this.name = name;
            this.company = company;
            this.phone = phone;
            this.email = email;
            this.matchPercentage = matchPercentage;
            this.matchReason = matchReason;
        }

        public String getLeadId() { return leadId; }
        public String getName() { return name; }
        public String getCompany() { return company; }
        public String getPhone() { return phone; }
        public String getEmail() { return email; }
        public double getMatchPercentage() { return matchPercentage; }
        public String getMatchReason() { return matchReason; }
    }
}
