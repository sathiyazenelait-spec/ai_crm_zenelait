package com.zenelait.crm.opportunity;

import com.zenelait.crm.common.exception.ResourceNotFoundException;
import com.zenelait.crm.common.exception.ValidationException;
import com.zenelait.crm.model.Company;
import com.zenelait.crm.model.Opportunity;
import com.zenelait.crm.repository.OpportunityRepository;
import com.zenelait.crm.tenant.TenantSecurityService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/opportunities")
@CrossOrigin(origins = "*")
public class OpportunityV1Controller {

    private final OpportunityRepository opportunityRepository;
    private final TenantSecurityService tenantSecurityService;

    public OpportunityV1Controller(OpportunityRepository opportunityRepository, TenantSecurityService tenantSecurityService) {
        this.opportunityRepository = opportunityRepository;
        this.tenantSecurityService = tenantSecurityService;
    }

    /**
     * POST /api/v1/opportunities
     * Create an opportunity
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createOpportunity(@RequestBody Map<String, Object> body) {
        String name = (String) body.get("name");
        if (name == null || name.trim().isEmpty()) {
            throw new ValidationException("Opportunity name is required.");
        }

        Company company = tenantSecurityService.getCurrentCompany();

        Opportunity opp = new Opportunity();
        opp.setName(name);
        opp.setTitle(name);
        opp.setLeadId((String) body.get("leadId"));
        if (body.get("amount") != null) {
            opp.setAmount(((Number) body.get("amount")).doubleValue());
        }
        opp.setCurrency((String) body.getOrDefault("currency", "INR"));
        opp.setStage((String) body.getOrDefault("stage", "QUALIFICATION"));
        opp.setExpectedCloseDate((String) body.get("expectedCloseDate"));
        opp.setProbabilityPercent(body.get("probabilityPercent") != null ? ((Number) body.get("probabilityPercent")).intValue() : 25);
        opp.setTenant(company);

        Opportunity saved = opportunityRepository.save(opp);

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("id", saved.getId());
        res.put("leadId", saved.getLeadId());
        res.put("name", saved.getName());
        res.put("amount", saved.getAmount());
        res.put("currency", saved.getCurrency());
        res.put("stage", saved.getStage());
        res.put("probabilityPercent", saved.getProbabilityPercent());
        res.put("expectedCloseDate", saved.getExpectedCloseDate());

        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    /**
     * GET /api/v1/opportunities
     */
    @GetMapping
    public ResponseEntity<List<Opportunity>> getOpportunities() {
        String tenantId = tenantSecurityService.getCurrentTenantId();
        return ResponseEntity.ok(opportunityRepository.findByTenantId(tenantId));
    }

    /**
     * GET /api/v1/opportunities/{opportunityId}
     */
    @GetMapping("/{opportunityId}")
    public ResponseEntity<Opportunity> getOpportunity(@PathVariable String opportunityId) {
        String tenantId = tenantSecurityService.getCurrentTenantId();
        Opportunity opp = opportunityRepository.findByIdAndTenantId(opportunityId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Opportunity not found: " + opportunityId));
        return ResponseEntity.ok(opp);
    }

    /**
     * PATCH /api/v1/opportunities/{opportunityId}
     */
    @PatchMapping("/{opportunityId}")
    public ResponseEntity<Opportunity> updateOpportunity(@PathVariable String opportunityId, @RequestBody Map<String, Object> updates) {
        String tenantId = tenantSecurityService.getCurrentTenantId();
        Opportunity opp = opportunityRepository.findByIdAndTenantId(opportunityId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Opportunity not found: " + opportunityId));

        if (updates.containsKey("name")) opp.setName((String) updates.get("name"));
        if (updates.containsKey("amount")) opp.setAmount(((Number) updates.get("amount")).doubleValue());
        if (updates.containsKey("stage")) opp.setStage((String) updates.get("stage"));
        if (updates.containsKey("probabilityPercent")) opp.setProbabilityPercent(((Number) updates.get("probabilityPercent")).intValue());
        if (updates.containsKey("expectedCloseDate")) opp.setExpectedCloseDate((String) updates.get("expectedCloseDate"));

        return ResponseEntity.ok(opportunityRepository.save(opp));
    }

    /**
     * PATCH /api/v1/opportunities/{opportunityId}/stage
     */
    @PatchMapping("/{opportunityId}/stage")
    public ResponseEntity<Map<String, Object>> updateOpportunityStage(
            @PathVariable String opportunityId,
            @RequestBody Map<String, String> body
    ) {
        String newStage = body.get("stage");
        if (newStage == null || newStage.trim().isEmpty()) {
            throw new ValidationException("stage is required.");
        }

        String tenantId = tenantSecurityService.getCurrentTenantId();
        Opportunity opp = opportunityRepository.findByIdAndTenantId(opportunityId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Opportunity not found: " + opportunityId));

        opp.setStage(newStage.toUpperCase());
        opportunityRepository.save(opp);

        return ResponseEntity.ok(Map.of(
                "id", opp.getId(),
                "stage", opp.getStage(),
                "updatedAt", java.time.LocalDateTime.now().toString()
        ));
    }
}
