package com.zenelait.crm.controller;

import com.zenelait.crm.model.AutomationRule;
import com.zenelait.crm.model.Company;
import com.zenelait.crm.repository.AutomationRepository;
import com.zenelait.crm.repository.CompanyRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/automations")
@CrossOrigin(origins = "*")
public class AutomationController {

    private final AutomationRepository automationRepository;
    private final CompanyRepository companyRepository;

    public AutomationController(AutomationRepository automationRepository, CompanyRepository companyRepository) {
        this.automationRepository = automationRepository;
        this.companyRepository = companyRepository;
    }

    @GetMapping
    public ResponseEntity<List<AutomationRule>> getAutomations(@RequestParam(required = false, defaultValue = "TEN-IT-001") String tenantId) {
        return ResponseEntity.ok(automationRepository.findByTenantId(tenantId));
    }

    @PostMapping
    public ResponseEntity<?> createAutomation(@RequestParam(required = false, defaultValue = "TEN-IT-001") String tenantId, @RequestBody AutomationRule rule) {
        Company company = companyRepository.findById(tenantId).orElse(null);
        if (company == null) company = companyRepository.findAll().stream().findFirst().orElse(null);
        rule.setTenant(company);
        return ResponseEntity.ok(automationRepository.save(rule));
    }

    @PutMapping("/{id}/toggle")
    public ResponseEntity<?> toggleAutomation(@PathVariable Long id) {
        return automationRepository.findById(id).map(rule -> {
            rule.setStatus("Active".equals(rule.getStatus()) ? "Paused" : "Active");
            return ResponseEntity.ok(automationRepository.save(rule));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAutomation(@PathVariable Long id) {
        if (automationRepository.existsById(id)) {
            automationRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Automation workflow deleted", "id", id));
        }
        return ResponseEntity.notFound().build();
    }
}
