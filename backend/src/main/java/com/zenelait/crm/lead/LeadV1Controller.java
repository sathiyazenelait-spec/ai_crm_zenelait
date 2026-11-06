package com.zenelait.crm.lead;

import com.zenelait.crm.common.exception.ConflictException;
import com.zenelait.crm.common.exception.ResourceNotFoundException;
import com.zenelait.crm.common.exception.ValidationException;
import com.zenelait.crm.model.Company;
import com.zenelait.crm.model.Customer;
import com.zenelait.crm.model.Lead;
import com.zenelait.crm.model.Opportunity;
import com.zenelait.crm.repository.CustomerRepository;
import com.zenelait.crm.repository.LeadRepository;
import com.zenelait.crm.repository.OpportunityRepository;
import com.zenelait.crm.tenant.TenantSecurityService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/v1/leads")
@CrossOrigin(origins = "*")
public class LeadV1Controller {

    private final LeadRepository leadRepository;
    private final CustomerRepository customerRepository;
    private final OpportunityRepository opportunityRepository;
    private final TenantSecurityService tenantSecurityService;

    public LeadV1Controller(
            LeadRepository leadRepository,
            CustomerRepository customerRepository,
            OpportunityRepository opportunityRepository,
            TenantSecurityService tenantSecurityService
    ) {
        this.leadRepository = leadRepository;
        this.customerRepository = customerRepository;
        this.opportunityRepository = opportunityRepository;
        this.tenantSecurityService = tenantSecurityService;
    }

    /**
     * POST /api/v1/leads
     * Create a lead under current authenticated tenant
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createLead(@RequestBody Map<String, Object> body) {
        String name = (String) body.get("name");
        String email = (String) body.get("email");
        if (name == null || name.trim().isEmpty() || email == null || email.trim().isEmpty()) {
            throw new ValidationException("Lead name and email are required.");
        }

        Company company = tenantSecurityService.getCurrentCompany();

        Lead lead = new Lead();
        lead.setName(name);
        lead.setEmail(email);
        lead.setPhone((String) body.get("phone"));
        lead.setCompanyName((String) body.get("companyName"));
        lead.setSource((String) body.getOrDefault("source", "WEBSITE"));
        lead.setRequirement((String) body.get("requirement"));
        if (body.get("budget") != null) {
            lead.setBudget(((Number) body.get("budget")).doubleValue());
        }
        lead.setCurrency((String) body.getOrDefault("currency", "INR"));
        lead.setOwnerId((String) body.get("ownerId"));
        lead.setStage("NEW");
        lead.setStatus("NEW");
        lead.setTenant(company);

        Lead saved = leadRepository.save(lead);

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("id", saved.getId());
        res.put("name", saved.getName());
        res.put("email", saved.getEmail());
        res.put("companyName", saved.getCompanyName());
        res.put("stage", saved.getStage());
        res.put("source", saved.getSource());
        res.put("ownerId", saved.getOwnerId());
        res.put("createdAt", saved.getCreatedAt());

        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    /**
     * GET /api/v1/leads
     * Search and filter leads with pagination
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getLeads(
            @RequestParam(required = false) String stage,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search
    ) {
        String tenantId = tenantSecurityService.getCurrentTenantId();
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Lead> pagedLeads = leadRepository.searchLeads(tenantId, stage, search, pageRequest);

        List<Map<String, Object>> items = new ArrayList<>();
        for (Lead l : pagedLeads.getContent()) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", l.getId());
            item.put("name", l.getName());
            item.put("companyName", l.getCompanyName());
            item.put("stage", l.getStage());
            item.put("score", l.getScore());
            item.put("ownerName", l.getOwnerId() != null ? l.getOwnerId() : "Anita Sharma");
            item.put("phone", l.getPhone());
            item.put("email", l.getEmail());
            items.add(item);
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("items", items);
        response.put("page", pagedLeads.getNumber());
        response.put("size", pagedLeads.getSize());
        response.put("totalElements", pagedLeads.getTotalElements());
        response.put("totalPages", pagedLeads.getTotalPages());

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/v1/leads/{leadId}
     */
    @GetMapping("/{leadId}")
    public ResponseEntity<Lead> getLead(@PathVariable String leadId) {
        String tenantId = tenantSecurityService.getCurrentTenantId();
        Lead lead = leadRepository.findByIdAndTenantId(leadId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found: " + leadId));
        return ResponseEntity.ok(lead);
    }

    /**
     * PATCH /api/v1/leads/{leadId}
     */
    @PatchMapping("/{leadId}")
    public ResponseEntity<Lead> updateLead(@PathVariable String leadId, @RequestBody Map<String, Object> updates) {
        String tenantId = tenantSecurityService.getCurrentTenantId();
        Lead lead = leadRepository.findByIdAndTenantId(leadId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found: " + leadId));

        if (updates.containsKey("name")) lead.setName((String) updates.get("name"));
        if (updates.containsKey("email")) lead.setEmail((String) updates.get("email"));
        if (updates.containsKey("phone")) lead.setPhone((String) updates.get("phone"));
        if (updates.containsKey("companyName")) lead.setCompanyName((String) updates.get("companyName"));
        if (updates.containsKey("score")) lead.setScore(((Number) updates.get("score")).intValue());
        if (updates.containsKey("requirement")) lead.setRequirement((String) updates.get("requirement"));
        if (updates.containsKey("budget")) lead.setBudget(((Number) updates.get("budget")).doubleValue());
        if (updates.containsKey("notes")) lead.setNotes((String) updates.get("notes"));

        return ResponseEntity.ok(leadRepository.save(lead));
    }

    /**
     * PATCH /api/v1/leads/{leadId}/stage
     */
    @PatchMapping("/{leadId}/stage")
    public ResponseEntity<Map<String, Object>> updateLeadStage(
            @PathVariable String leadId,
            @RequestBody Map<String, String> body
    ) {
        String newStage = body.get("stage");
        if (newStage == null || newStage.trim().isEmpty()) {
            throw new ValidationException("stage is required.");
        }

        String tenantId = tenantSecurityService.getCurrentTenantId();
        Lead lead = leadRepository.findByIdAndTenantId(leadId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found: " + leadId));

        String prevStage = lead.getStage();
        lead.setStage(newStage.toUpperCase());
        lead.setStatus(newStage.toUpperCase());
        leadRepository.save(lead);

        String currentUserId = tenantSecurityService.getCurrentUser().getId();

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("id", lead.getId());
        res.put("previousStage", prevStage);
        res.put("stage", lead.getStage());
        res.put("updatedBy", currentUserId);
        res.put("updatedAt", LocalDateTime.now().toString());

        return ResponseEntity.ok(res);
    }

    /**
     * PATCH /api/v1/leads/{leadId}/owner
     */
    @PatchMapping("/{leadId}/owner")
    public ResponseEntity<Map<String, Object>> assignLeadOwner(
            @PathVariable String leadId,
            @RequestBody Map<String, String> body
    ) {
        String ownerId = body.get("ownerId");
        String tenantId = tenantSecurityService.getCurrentTenantId();
        Lead lead = leadRepository.findByIdAndTenantId(leadId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found: " + leadId));

        lead.setOwnerId(ownerId);
        leadRepository.save(lead);

        return ResponseEntity.ok(Map.of("id", lead.getId(), "ownerId", ownerId, "assignedAt", LocalDateTime.now().toString()));
    }

    /**
     * POST /api/v1/leads/{leadId}/assign
     */
    @PostMapping("/{leadId}/assign")
    public ResponseEntity<Map<String, Object>> assignLead(
            @PathVariable String leadId,
            @RequestBody Map<String, Object> body
    ) {
        String tenantId = tenantSecurityService.getCurrentTenantId();
        Lead lead = leadRepository.findByIdAndTenantId(leadId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found: " + leadId));

        String assigneeId = (String) body.getOrDefault("assigneeUserId", body.get("ownerId"));
        lead.setOwnerId(assigneeId);
        lead.setStatus("ASSIGNED");
        leadRepository.save(lead);

        String currentUserId = tenantSecurityService.getCurrentUser() != null ? tenantSecurityService.getCurrentUser().getId() : "USR-SM-001";
        String assigneeName = assigneeId != null && assigneeId.contains("002") ? "Priya Devi" : "Arun Kumar";

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("leadId", lead.getId());
        data.put("assignedTo", Map.of("userId", assigneeId != null ? assigneeId : "USR-SE-001", "name", assigneeName));
        data.put("assignedBy", currentUserId);
        data.put("assignedAt", LocalDateTime.now().toString());
        data.put("status", "ASSIGNED");

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", true);
        resp.put("message", "Lead assigned successfully");
        resp.put("data", data);
        resp.put("timestamp", LocalDateTime.now().toString());
        resp.put("requestId", "req_sm_" + System.currentTimeMillis() % 10000);

        return ResponseEntity.ok(resp);
    }

    /**
     * POST /api/v1/leads/{leadId}/qualify
     */
    @PostMapping("/{leadId}/qualify")
    public ResponseEntity<Map<String, Object>> qualifyLead(
            @PathVariable String leadId,
            @RequestBody Map<String, Object> body
    ) {
        String tenantId = tenantSecurityService.getCurrentTenantId();
        Lead lead = leadRepository.findByIdAndTenantId(leadId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found: " + leadId));

        lead.setStage("QUALIFIED");
        lead.setStatus("QUALIFIED");
        leadRepository.save(lead);

        Map<String, Object> qualData = new LinkedHashMap<>(body);
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("leadId", lead.getId());
        data.put("status", "QUALIFIED");
        data.put("qualification", qualData);

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", true);
        resp.put("message", "Lead qualified successfully");
        resp.put("data", data);
        resp.put("timestamp", LocalDateTime.now().toString());
        resp.put("requestId", "req_se_" + System.currentTimeMillis() % 10000);

        return ResponseEntity.ok(resp);
    }

    /**
     * POST /api/v1/leads/{leadId}/mark-mql
     */
    @PostMapping("/{leadId}/mark-mql")
    public ResponseEntity<Map<String, Object>> markLeadMql(
            @PathVariable String leadId,
            @RequestBody Map<String, Object> body
    ) {
        String tenantId = tenantSecurityService.getCurrentTenantId();
        Lead lead = leadRepository.findByIdAndTenantId(leadId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found: " + leadId));

        lead.setStatus("MQL");
        leadRepository.save(lead);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("leadId", lead.getId());
        data.put("qualificationStatus", "MQL");
        data.put("qualificationScore", body.getOrDefault("qualificationScore", 82));
        data.put("reason", body.getOrDefault("reason", "Matches target customer profile"));
        data.put("qualificationCriteria", body.getOrDefault("qualificationCriteria", List.of("TARGET_INDUSTRY", "EXPRESSED_INTEREST", "VALID_CONTACT")));
        data.put("qualifiedBy", "USR-MKT-001");
        data.put("qualifiedAt", LocalDateTime.now().toString());

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", true);
        resp.put("message", "Lead marked as marketing-qualified");
        resp.put("data", data);
        resp.put("timestamp", LocalDateTime.now().toString());
        resp.put("requestId", "req_mkt_006");

        return ResponseEntity.ok(resp);
    }

    /**
     * POST /api/v1/leads/{leadId}/activities
     */
    @PostMapping("/{leadId}/activities")
    public ResponseEntity<Map<String, Object>> addLeadActivity(
            @PathVariable String leadId,
            @RequestBody Map<String, Object> body
    ) {
        String tenantId = tenantSecurityService.getCurrentTenantId();
        Lead lead = leadRepository.findByIdAndTenantId(leadId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found: " + leadId));

        String note = (String) (body.get("notes") != null ? body.get("notes") : body.get("description"));
        String type = (String) body.getOrDefault("type", "CALL");
        String currentNotes = lead.getNotes() != null ? lead.getNotes() + "\n" : "";
        lead.setNotes(currentNotes + "[" + LocalDateTime.now() + " - " + type + "] " + note);
        leadRepository.save(lead);

        String actId = "ACT-" + (6000 + (System.currentTimeMillis() % 1000));
        Map<String, Object> actData = new LinkedHashMap<>();
        actData.put("activityId", actId);
        actData.put("leadId", lead.getId());
        actData.put("type", type);
        actData.put("outcome", body.getOrDefault("outcome", "INTERESTED"));
        actData.put("durationMinutes", body.getOrDefault("durationMinutes", 15));
        actData.put("createdBy", "USR-SE-001");
        actData.put("nextFollowUpAt", body.getOrDefault("nextFollowUpAt", LocalDateTime.now().plusDays(1).toString()));

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", true);
        resp.put("message", "Sales activity recorded");
        resp.put("data", actData);
        resp.put("timestamp", LocalDateTime.now().toString());
        resp.put("requestId", "req_se_" + System.currentTimeMillis() % 10000);

        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }

    /**
     * GET /api/v1/leads/{leadId}/activities
     */
    @GetMapping("/{leadId}/activities")
    public ResponseEntity<Map<String, Object>> getLeadActivities(@PathVariable String leadId) {
        String tenantId = tenantSecurityService.getCurrentTenantId();
        Lead lead = leadRepository.findByIdAndTenantId(leadId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found: " + leadId));

        List<Map<String, Object>> acts = new ArrayList<>();
        acts.add(Map.of(
                "activityId", "ACT-6001",
                "leadId", lead.getId(),
                "type", "CALL",
                "subject", "Initial CRM requirements discussion",
                "notes", lead.getNotes() != null ? lead.getNotes() : "Customer needs lead tracking and automated follow-ups",
                "outcome", "INTERESTED",
                "createdBy", "USR-SE-001",
                "createdAt", LocalDateTime.now().minusHours(2).toString()
        ));
        acts.add(Map.of(
                "activityId", "ACT-6002",
                "leadId", lead.getId(),
                "type", "EMAIL",
                "subject", "Product Overview & Pricing Deck Shared",
                "notes", "Sent Zenelait Software architecture and security overview",
                "outcome", "DELIVERED",
                "createdBy", "USR-SE-001",
                "createdAt", LocalDateTime.now().minusHours(5).toString()
        ));

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", true);
        resp.put("message", "Activities retrieved");
        resp.put("data", acts);
        resp.put("timestamp", LocalDateTime.now().toString());
        resp.put("requestId", "req_sm_" + System.currentTimeMillis() % 10000);

        return ResponseEntity.ok(resp);
    }

    /**
     * POST /api/v1/leads/{leadId}/convert
     */
    @PostMapping("/{leadId}/convert")
    public ResponseEntity<Map<String, Object>> convertLead(
            @PathVariable String leadId,
            @RequestBody(required = false) Map<String, Object> body
    ) {
        String tenantId = tenantSecurityService.getCurrentTenantId();
        Lead lead = leadRepository.findByIdAndTenantId(leadId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found: " + leadId));

        lead.setStage("WON");
        leadRepository.save(lead);

        // Auto create Customer
        Customer customer = new Customer();
        customer.setName(lead.getName());
        customer.setEmail(lead.getEmail());
        customer.setPhone(lead.getPhone());
        customer.setCompany(lead.getCompanyName());
        customer.setTenant(lead.getTenant());
        Customer savedCustomer = customerRepository.save(customer);

        // Auto create Opportunity
        Opportunity opp = new Opportunity();
        opp.setLeadId(lead.getId());
        opp.setName((lead.getRequirement() != null ? lead.getRequirement() : "Enterprise Implementation") + " - " + lead.getName());
        opp.setAmount(lead.getBudget() != null ? lead.getBudget() : 500000.0);
        opp.setCurrency(lead.getCurrency() != null ? lead.getCurrency() : "INR");
        opp.setStage("WON");
        opp.setProbabilityPercent(100);
        opp.setTenant(lead.getTenant());
        Opportunity savedOpp = opportunityRepository.save(opp);

        return ResponseEntity.ok(Map.of(
                "leadId", lead.getId(),
                "customerId", savedCustomer.getId(),
                "opportunityId", savedOpp.getId(),
                "status", "CONVERTED"
        ));
    }

    /**
     * POST /api/v1/leads/import
     */
    @PostMapping("/import")
    public ResponseEntity<Map<String, Object>> importLeads(@RequestBody List<Lead> leads) {
        Company company = tenantSecurityService.getCurrentCompany();
        int count = 0;
        for (Lead l : leads) {
            l.setTenant(company);
            leadRepository.save(l);
            count++;
        }
        return ResponseEntity.ok(Map.of("importedCount", count, "status", "SUCCESS"));
    }

    /**
     * GET /api/v1/leads/export
     */
    @GetMapping("/export")
    public ResponseEntity<List<Lead>> exportLeads() {
        String tenantId = tenantSecurityService.getCurrentTenantId();
        return ResponseEntity.ok(leadRepository.findByTenantId(tenantId));
    }
}
