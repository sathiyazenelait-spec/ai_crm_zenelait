package com.zenelait.crm.industry.financial;

import com.zenelait.crm.common.exception.ResourceNotFoundException;
import com.zenelait.crm.tenant.TenantSecurityService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/financial")
@CrossOrigin(origins = "*")
public class FinancialController {

    private final TenantSecurityService tenantSecurityService;
    private final Map<String, Map<String, Object>> consultations = new LinkedHashMap<>();
    private final Map<String, Map<String, Object>> applications = new LinkedHashMap<>();
    private final Map<String, Map<String, Object>> approvals = new LinkedHashMap<>();

    public FinancialController(TenantSecurityService tenantSecurityService) {
        this.tenantSecurityService = tenantSecurityService;
        initData();
    }

    private void initData() {
        applications.put("APP-FIN-4001", new LinkedHashMap<>(Map.of(
                "id", "APP-FIN-4001",
                "leadId", "LEAD-FIN-1001",
                "serviceCode", "WEALTH_MANAGEMENT",
                "status", "INITIATED",
                "nextStep", "HUMAN_REVIEW"
        )));
    }

    @GetMapping("/products")
    public ResponseEntity<List<Map<String, Object>>> getProducts() {
        return ResponseEntity.ok(List.of(
                Map.of("code", "WEALTH_MANAGEMENT", "name", "High Net-Worth Portfolio Management", "minAUM", 5000000, "currency", "INR"),
                Map.of("code", "COMMERCIAL_LENDING", "name", "SME Working Capital Term Loan", "minAmount", 2500000, "currency", "INR"),
                Map.of("code", "TAX_ADVISORY", "name", "Corporate Tax & Trust Planning", "fixedFee", 150000, "currency", "INR")
        ));
    }

    @PostMapping("/prospect-requirements")
    public ResponseEntity<Map<String, Object>> captureProspectRequirement(@RequestBody Map<String, Object> body) {
        String id = "REQ-FIN-2001";
        Map<String, Object> res = new LinkedHashMap<>(body);
        res.put("id", id);
        res.put("status", "CAPTURED");
        res.put("consentToContact", body.getOrDefault("consentToContact", true));
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @PostMapping("/consultations")
    public ResponseEntity<Map<String, Object>> scheduleConsultation(@RequestBody Map<String, Object> body) {
        String id = "CONS-FIN-3001";
        Map<String, Object> c = new LinkedHashMap<>(body);
        c.put("id", id);
        c.put("status", "SCHEDULED");
        consultations.put(id, c);
        return ResponseEntity.status(HttpStatus.CREATED).body(c);
    }

    @GetMapping("/consultations")
    public ResponseEntity<List<Map<String, Object>>> getConsultations() {
        return ResponseEntity.ok(new ArrayList<>(consultations.values()));
    }

    @PostMapping("/applications")
    public ResponseEntity<Map<String, Object>> startApplication(@RequestBody Map<String, Object> body) {
        String id = "APP-FIN-4001";
        Map<String, Object> app = new LinkedHashMap<>(body);
        app.put("id", id);
        app.put("status", "INITIATED");
        app.put("nextStep", "HUMAN_REVIEW");
        applications.put(id, app);
        return ResponseEntity.status(HttpStatus.CREATED).body(app);
    }

    @GetMapping("/applications/{id}")
    public ResponseEntity<Map<String, Object>> getApplication(@PathVariable String id) {
        Map<String, Object> app = applications.get(id);
        if (app == null) throw new ResourceNotFoundException("Application not found: " + id);
        return ResponseEntity.ok(app);
    }

    @PatchMapping("/applications/{id}/status")
    public ResponseEntity<Map<String, Object>> updateApplicationStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        Map<String, Object> app = applications.get(id);
        if (app == null) throw new ResourceNotFoundException("Application not found: " + id);
        app.put("status", body.get("status"));
        return ResponseEntity.ok(app);
    }

    @PostMapping("/approvals")
    public ResponseEntity<Map<String, Object>> requestApproval(@RequestBody Map<String, Object> body) {
        String id = "APR-FIN-5001";
        Map<String, Object> apr = new LinkedHashMap<>(body);
        apr.put("id", id);
        apr.put("status", "PENDING_REVIEW");
        apr.put("assignedQueue", "AUTHORIZED_REVIEWERS");
        approvals.put(id, apr);
        return ResponseEntity.status(HttpStatus.CREATED).body(apr);
    }

    @GetMapping("/approvals")
    public ResponseEntity<List<Map<String, Object>>> getApprovals() {
        if (approvals.isEmpty()) {
            return ResponseEntity.ok(List.of(
                    Map.of(
                            "id", "APR-FIN-5001",
                            "applicationId", "APP-FIN-4001",
                            "status", "PENDING_REVIEW",
                            "assignedQueue", "AUTHORIZED_REVIEWERS"
                    )
            ));
        }
        return ResponseEntity.ok(new ArrayList<>(approvals.values()));
    }
}
