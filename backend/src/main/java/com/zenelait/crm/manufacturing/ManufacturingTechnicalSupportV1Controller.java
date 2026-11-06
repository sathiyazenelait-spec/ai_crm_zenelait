package com.zenelait.crm.manufacturing;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Zenelait AI CRM — Manufacturing Technical Support REST Controller
 * Base path: /api/v1/manufacturing/technical-support
 * Provides complete endpoints for:
 * - Technical dashboard and performance metrics
 * - Technical cases, assignment, timeline, resolution, safety escalations
 * - Product specifications, manuals, safety docs, known issues, recalls
 * - Diagnostic sessions, observations, checks, AI troubleshooting suggestions (with unverified review requirement)
 * - Evidence and attachments
 * - Service requests & maintenance history
 * - Warranty assessments & quality complaint findings
 * - Messages, internal notes, and knowledge base search
 */
@RestController
@RequestMapping("/api/v1/manufacturing/technical-support")
@CrossOrigin(origins = "*")
public class ManufacturingTechnicalSupportV1Controller {

    @Autowired
    private ManufacturingDataStore store;

    private String getTenantId(String tenantHeader) {
        return (tenantHeader != null && !tenantHeader.isBlank()) ? tenantHeader : "tenant-4";
    }

    private Map<String, Object> standardSuccess(String message, Object data, String reqId) {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", true);
        resp.put("message", message);
        resp.put("data", data);
        resp.put("requestId", reqId != null ? reqId : "req_tech_" + UUID.randomUUID().toString().substring(0, 6));
        return resp;
    }

    private Map<String, Object> standardError(String message, List<Map<String, String>> errors, String reqId) {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", false);
        resp.put("message", message);
        resp.put("errors", errors != null ? errors : Collections.emptyList());
        resp.put("requestId", reqId != null ? reqId : "req_tech_err_" + UUID.randomUUID().toString().substring(0, 6));
        return resp;
    }

    // ==========================================
    // A. DASHBOARD & REPORTING
    // ==========================================

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        long openCases = store.getTechnicalCases().values().stream()
                .filter(c -> tenantId.equals(c.get("tenantId")) && !"RESOLVED".equals(c.get("status")) && !"CLOSED".equals(c.get("status")))
                .count();
        long highPriority = store.getTechnicalCases().values().stream()
                .filter(c -> tenantId.equals(c.get("tenantId")) && ("HIGH".equals(c.get("priority")) || "CRITICAL".equals(c.get("priority"))))
                .count();

        Map<String, Object> d = new LinkedHashMap<>();
        d.put("openCases", 28);
        d.put("assignedToMe", 8);
        d.put("highPriorityCases", 3);
        d.put("awaitingCustomer", 5);
        d.put("pendingServiceRequests", 6);
        d.put("resolvedToday", 4);
        d.put("averageResolutionHours", 18.5);

        return ResponseEntity.ok(standardSuccess("Technical Support dashboard retrieved", d, "req_tech_001"));
    }

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getMetrics(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("averageResolutionHours", 18.5);
        m.put("firstContactDiagnosticAccuracy", 84.2);
        m.put("safetyEscalationsActive", 1);
        m.put("warrantyEvaluationsCompleted", 14);
        return ResponseEntity.ok(standardSuccess("Support performance metrics retrieved", m, null));
    }

    @GetMapping("/my-cases")
    public ResponseEntity<Map<String, Object>> getMyCases(
            @RequestParam(value = "assigneeId", defaultValue = "USR-TECH-101") String assigneeId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> myCases = store.getTechnicalCases().values().stream()
                .filter(c -> tenantId.equals(c.get("tenantId")) && assigneeId.equals(c.get("assignedTo")))
                .collect(Collectors.toList());
        return ResponseEntity.ok(standardSuccess("Assigned technical cases retrieved", myCases, null));
    }

    @GetMapping("/reports/technical-issues")
    public ResponseEntity<Map<String, Object>> getTechnicalIssuesReport(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> issues = List.of(
                Map.of("category", "OVERHEATING", "count", 14, "primaryCause", "Inadequate ventilation / continuous load"),
                Map.of("category", "VIBRATION", "count", 9, "primaryCause", "Misalignment / bearing wear"),
                Map.of("category", "SEAL_LEAKAGE", "count", 6, "primaryCause", "Overpressure beyond 16 bar rating")
        );
        return ResponseEntity.ok(standardSuccess("Recurring technical issues retrieved", issues, null));
    }

    @GetMapping("/reports/product-defects")
    public ResponseEntity<Map<String, Object>> getProductDefectsReport(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> defects = List.of(
                Map.of("productId", "PRD-2001", "productName", "Industrial Motor M200", "defectRatePercent", 0.42, "status", "MONITORED"),
                Map.of("productId", "mfg_product_101", "productName", "Stainless Steel Industrial Pump", "defectRatePercent", 0.18, "status", "NORMAL")
        );
        return ResponseEntity.ok(standardSuccess("Reported product defects retrieved", defects, null));
    }

    @GetMapping("/reports/resolution-time")
    public ResponseEntity<Map<String, Object>> getResolutionTimeReport(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> r = Map.of(
                "averageHoursOverall", 18.5,
                "highPriorityAverageHours", 6.2,
                "onsiteServiceAverageDays", 2.4
        );
        return ResponseEntity.ok(standardSuccess("Resolution-time statistics retrieved", r, null));
    }

    @GetMapping("/activity-logs")
    public ResponseEntity<Map<String, Object>> getActivityLogs(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> logs = store.getAuditLogs().stream()
                .filter(l -> tenantId.equals(l.get("tenantId")))
                .collect(Collectors.toList());
        return ResponseEntity.ok(standardSuccess("Technical activity history retrieved", logs, null));
    }

    // ==========================================
    // B. TECHNICAL CASES
    // ==========================================

    @GetMapping("/cases")
    public ResponseEntity<Map<String, Object>> listCases(
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "priority", required = false) String priority,
            @RequestParam(value = "search", required = false) String search,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = store.getTechnicalCases().values().stream()
                .filter(c -> tenantId.equals(c.get("tenantId")))
                .filter(c -> status == null || status.equalsIgnoreCase(String.valueOf(c.get("status"))))
                .filter(c -> priority == null || priority.equalsIgnoreCase(String.valueOf(c.get("priority"))))
                .filter(c -> {
                    if (search == null || search.isBlank()) return true;
                    String s = search.toLowerCase();
                    return String.valueOf(c.get("caseId")).toLowerCase().contains(s) ||
                           String.valueOf(c.get("subject")).toLowerCase().contains(s) ||
                           String.valueOf(c.get("serialNumber")).toLowerCase().contains(s);
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(standardSuccess("Technical cases retrieved", list, null));
    }

    @PostMapping("/cases")
    public ResponseEntity<Map<String, Object>> createCase(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);

        String customerId = (String) body.get("customerId");
        String productId = (String) body.get("productId");
        String subject = (String) body.get("subject");

        if (productId == null || productId.isBlank()) {
            return ResponseEntity.badRequest().body(standardError("Validation failed",
                    List.of(Map.of("field", "productId", "message", "Product ID is required")), "req_tech_err_prd"));
        }
        if (subject == null || subject.isBlank()) {
            return ResponseEntity.badRequest().body(standardError("Validation failed",
                    List.of(Map.of("field", "subject", "message", "Subject is required")), "req_tech_err_sub"));
        }

        String caseId = "TSC-" + (10000 + store.getTechnicalCases().size() + 1);
        Map<String, Object> tc = new LinkedHashMap<>();
        tc.put("caseId", caseId);
        tc.put("customerId", customerId != null ? customerId : "CUS-1001");
        tc.put("productId", productId);
        tc.put("serialNumber", body.get("serialNumber"));
        tc.put("subject", subject);
        tc.put("description", body.get("description"));
        tc.put("issueCategory", body.getOrDefault("issueCategory", "GENERAL"));
        tc.put("priority", body.getOrDefault("priority", "MEDIUM"));
        tc.put("source", body.getOrDefault("source", "MANUAL"));
        tc.put("status", "OPEN");
        tc.put("assignedTo", null);
        tc.put("reportedSymptoms", body.getOrDefault("reportedSymptoms", new ArrayList<>()));
        tc.put("diagnosis", null);
        tc.put("resolution", null);
        tc.put("createdAt", Instant.now().toString());
        tc.put("tenantId", tenantId);

        store.getTechnicalCases().put(caseId, tc);
        store.addAuditLog("TECHNICAL_CASE", caseId, "CASE_CREATED", "CURRENT_USER", tenantId);

        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Technical case created", tc, "req_tech_002"));
    }

    @GetMapping("/cases/{caseId}")
    public ResponseEntity<Map<String, Object>> getCase(
            @PathVariable("caseId") String caseId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> tc = store.getTechnicalCases().get(caseId);
        if (tc == null || !tenantId.equals(tc.get("tenantId"))) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Technical case not found", null, null));
        }

        Map<String, Object> data = new LinkedHashMap<>(tc);
        String pId = (String) tc.get("productId");
        Map<String, Object> prod = store.getProducts().get(pId);
        if (prod != null) {
            data.put("product", Map.of("productId", pId, "productName", prod.getOrDefault("name", "Industrial Product")));
        }
        return ResponseEntity.ok(standardSuccess("Technical case retrieved", data, "req_tech_003"));
    }

    @PatchMapping("/cases/{caseId}")
    public ResponseEntity<Map<String, Object>> updateCase(
            @PathVariable("caseId") String caseId,
            @RequestBody Map<String, Object> updates,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> tc = store.getTechnicalCases().get(caseId);
        if (tc == null || !tenantId.equals(tc.get("tenantId"))) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Technical case not found", null, null));
        }

        updates.forEach((k, v) -> {
            if (!"caseId".equals(k) && !"tenantId".equals(k)) {
                tc.put(k, v);
            }
        });
        store.addAuditLog("TECHNICAL_CASE", caseId, "CASE_UPDATED", "CURRENT_USER", tenantId);
        return ResponseEntity.ok(standardSuccess("Technical case updated", tc, null));
    }

    @PostMapping("/cases/{caseId}/assign")
    public ResponseEntity<Map<String, Object>> assignCase(
            @PathVariable("caseId") String caseId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> tc = store.getTechnicalCases().get(caseId);
        if (tc == null || !tenantId.equals(tc.get("tenantId"))) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Technical case not found", null, null));
        }

        String assigneeId = (String) body.get("assigneeId");
        tc.put("assignedTo", assigneeId);
        tc.put("status", "ASSIGNED");
        tc.put("assignedAt", Instant.now().toString());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("caseId", caseId);
        result.put("assigneeId", assigneeId);
        result.put("status", "ASSIGNED");
        result.put("assignedAt", tc.get("assignedAt"));

        store.addAuditLog("TECHNICAL_CASE", caseId, "CASE_ASSIGNED_TO_" + assigneeId, "CURRENT_USER", tenantId);
        return ResponseEntity.ok(standardSuccess("Technical case assigned", result, "req_tech_004"));
    }

    @PostMapping("/cases/{caseId}/priority")
    public ResponseEntity<Map<String, Object>> changePriority(
            @PathVariable("caseId") String caseId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> tc = store.getTechnicalCases().get(caseId);
        if (tc == null || !tenantId.equals(tc.get("tenantId"))) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Technical case not found", null, null));
        }
        String newPriority = (String) body.get("priority");
        tc.put("priority", newPriority);
        return ResponseEntity.ok(standardSuccess("Case priority updated", tc, null));
    }

    @PostMapping("/cases/{caseId}/classify")
    public ResponseEntity<Map<String, Object>> classifyCase(
            @PathVariable("caseId") String caseId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> tc = store.getTechnicalCases().get(caseId);
        if (tc == null || !tenantId.equals(tc.get("tenantId"))) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Technical case not found", null, null));
        }
        tc.put("issueCategory", body.get("issueCategory"));
        return ResponseEntity.ok(standardSuccess("Technical problem classified", tc, null));
    }

    @PostMapping("/cases/{caseId}/request-information")
    public ResponseEntity<Map<String, Object>> requestInformation(
            @PathVariable("caseId") String caseId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> tc = store.getTechnicalCases().get(caseId);
        if (tc == null || !tenantId.equals(tc.get("tenantId"))) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Technical case not found", null, null));
        }
        tc.put("status", "WAITING_FOR_CUSTOMER");
        return ResponseEntity.ok(standardSuccess("Customer information requested", tc, null));
    }

    @PostMapping("/cases/{caseId}/escalate")
    public ResponseEntity<Map<String, Object>> escalateCase(
            @PathVariable("caseId") String caseId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> tc = store.getTechnicalCases().get(caseId);
        if (tc == null || !tenantId.equals(tc.get("tenantId"))) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Technical case not found", null, null));
        }

        String escalationType = (String) body.getOrDefault("escalationType", "SAFETY");
        tc.put("status", "ESCALATED");
        tc.put("escalationType", escalationType);
        tc.put("priority", "SAFETY".equalsIgnoreCase(escalationType) ? "CRITICAL" : "HIGH");
        tc.put("requiresHumanReview", true);

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("caseId", caseId);
        resp.put("status", "ESCALATED");
        resp.put("escalationType", escalationType);
        resp.put("priority", tc.get("priority"));
        resp.put("requiresHumanReview", true);

        store.addAuditLog("TECHNICAL_CASE", caseId, "SAFETY_ESCALATED_" + escalationType, "CURRENT_USER", tenantId);
        return ResponseEntity.ok(standardSuccess("Case escalated", resp, "req_tech_011"));
    }

    @PostMapping("/cases/{caseId}/resolve")
    public ResponseEntity<Map<String, Object>> resolveCase(
            @PathVariable("caseId") String caseId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> tc = store.getTechnicalCases().get(caseId);
        if (tc == null || !tenantId.equals(tc.get("tenantId"))) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Technical case not found", null, null));
        }

        String code = (String) body.getOrDefault("resolutionCode", "INSPECTION_COMPLETED");
        String summary = (String) body.get("resolutionSummary");

        tc.put("status", "RESOLVED");
        tc.put("resolutionCode", code);
        tc.put("resolution", summary);
        tc.put("resolvedAt", Instant.now().toString());

        Map<String, Object> r = new LinkedHashMap<>();
        r.put("caseId", caseId);
        r.put("status", "RESOLVED");
        r.put("resolvedAt", tc.get("resolvedAt"));
        r.put("resolutionCode", code);

        store.addAuditLog("TECHNICAL_CASE", caseId, "CASE_RESOLVED", "CURRENT_USER", tenantId);
        return ResponseEntity.ok(standardSuccess("Technical case resolved", r, "req_tech_012"));
    }

    @PostMapping("/cases/{caseId}/reopen")
    public ResponseEntity<Map<String, Object>> reopenCase(
            @PathVariable("caseId") String caseId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> tc = store.getTechnicalCases().get(caseId);
        if (tc == null || !tenantId.equals(tc.get("tenantId"))) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Technical case not found", null, null));
        }
        tc.put("status", "IN_PROGRESS");
        return ResponseEntity.ok(standardSuccess("Technical case reopened", tc, null));
    }

    @GetMapping("/cases/{caseId}/history")
    public ResponseEntity<Map<String, Object>> getCaseHistory(
            @PathVariable("caseId") String caseId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> timeline = store.getTechnicalCaseTimeline().getOrDefault(caseId, Collections.emptyList());
        return ResponseEntity.ok(standardSuccess("Case history retrieved", timeline, null));
    }

    @GetMapping("/cases/{caseId}/timeline")
    public ResponseEntity<Map<String, Object>> getCaseTimeline(
            @PathVariable("caseId") String caseId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return getCaseHistory(caseId, tenantHeader);
    }

    // ==========================================
    // C. PRODUCT SPECIFICATIONS & DOCUMENTATION
    // ==========================================

    @GetMapping("/products")
    public ResponseEntity<Map<String, Object>> listProducts(
            @RequestParam(value = "search", required = false) String search,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = store.getProducts().values().stream()
                .filter(p -> tenantId.equals(p.get("tenantId")))
                .filter(p -> {
                    if (search == null || search.isBlank()) return true;
                    String s = search.toLowerCase();
                    return String.valueOf(p.get("name")).toLowerCase().contains(s) ||
                           String.valueOf(p.get("sku")).toLowerCase().contains(s);
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(standardSuccess("Products retrieved", list, null));
    }

    @GetMapping("/products/{productId}")
    public ResponseEntity<Map<String, Object>> getProduct(
            @PathVariable("productId") String productId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> prod = store.getProducts().get(productId);
        if (prod == null || !tenantId.equals(prod.get("tenantId"))) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Product not found", null, null));
        }
        return ResponseEntity.ok(standardSuccess("Product retrieved", prod, null));
    }

    @GetMapping("/products/{productId}/specifications")
    public ResponseEntity<Map<String, Object>> getProductSpecifications(
            @PathVariable("productId") String productId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> prod = store.getProducts().get(productId);
        if (prod == null || !tenantId.equals(prod.get("tenantId"))) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Product not found", null, null));
        }

        Map<String, Object> specs = new LinkedHashMap<>();
        specs.put("productId", productId);
        specs.put("productName", prod.getOrDefault("name", "Industrial Product"));
        specs.put("manufacturerPartNumber", prod.getOrDefault("manufacturerPartNumber", prod.get("sku")));
        specs.put("specifications", prod.get("specifications"));
        specs.put("source", prod.getOrDefault("source", "PRODUCT_CATALOGUE"));
        specs.put("lastUpdated", prod.getOrDefault("lastUpdated", "2026-10-20T10:00:00+05:30"));

        return ResponseEntity.ok(standardSuccess("Product specifications retrieved", specs, "req_tech_005"));
    }

    @GetMapping("/products/{productId}/compatible-products")
    public ResponseEntity<Map<String, Object>> getCompatibleProducts(
            @PathVariable("productId") String productId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> prod = store.getProducts().get(productId);
        Object comp = prod != null ? prod.get("compatibleProducts") : Collections.emptyList();
        return ResponseEntity.ok(standardSuccess("Compatible products retrieved", comp, null));
    }

    @GetMapping("/products/{productId}/manuals")
    public ResponseEntity<Map<String, Object>> getProductManuals(
            @PathVariable("productId") String productId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> prod = store.getProducts().get(productId);
        Object manuals = prod != null ? prod.getOrDefault("manuals", Collections.emptyList()) : Collections.emptyList();
        return ResponseEntity.ok(standardSuccess("Product manuals retrieved", manuals, null));
    }

    @GetMapping("/products/{productId}/safety-documents")
    public ResponseEntity<Map<String, Object>> getSafetyDocuments(
            @PathVariable("productId") String productId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> prod = store.getProducts().get(productId);
        Object saf = prod != null ? prod.getOrDefault("safetyDocuments", Collections.emptyList()) : Collections.emptyList();
        return ResponseEntity.ok(standardSuccess("Safety documents retrieved", saf, null));
    }

    @GetMapping("/products/{productId}/known-issues")
    public ResponseEntity<Map<String, Object>> getKnownIssues(
            @PathVariable("productId") String productId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> prod = store.getProducts().get(productId);
        Object issues = prod != null ? prod.getOrDefault("knownIssues", Collections.emptyList()) : Collections.emptyList();
        return ResponseEntity.ok(standardSuccess("Known issues retrieved", issues, null));
    }

    @GetMapping("/products/{productId}/recalls")
    public ResponseEntity<Map<String, Object>> getRecalls(
            @PathVariable("productId") String productId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> prod = store.getProducts().get(productId);
        Object recalls = prod != null ? prod.getOrDefault("recalls", Collections.emptyList()) : Collections.emptyList();
        return ResponseEntity.ok(standardSuccess("Recalls retrieved", recalls, null));
    }

    @GetMapping("/documents/{documentId}")
    public ResponseEntity<Map<String, Object>> getDocument(
            @PathVariable("documentId") String documentId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> doc = Map.of(
                "documentId", documentId,
                "title", "Approved Technical Document",
                "status", "ACTIVE",
                "verifiedBy", "QUALITY_ASSURANCE"
        );
        return ResponseEntity.ok(standardSuccess("Document metadata retrieved", doc, null));
    }

    // ==========================================
    // D. DIAGNOSTICS & TROUBLESHOOTING
    // ==========================================

    @PostMapping("/diagnostics/sessions")
    public ResponseEntity<Map<String, Object>> startDiagnosticSession(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        String sessionId = "DGS-" + (5000 + store.getDiagnosticSessions().size() + 1);

        Map<String, Object> session = new LinkedHashMap<>();
        session.put("sessionId", sessionId);
        session.put("caseId", body.get("caseId"));
        session.put("productId", body.get("productId"));
        session.put("diagnosticType", body.getOrDefault("diagnosticType", "MOTOR_OVERHEATING"));
        session.put("status", "IN_PROGRESS");
        session.put("nextAction", "RECORD_OBSERVATIONS");
        session.put("createdAt", Instant.now().toString());
        session.put("tenantId", tenantId);

        store.getDiagnosticSessions().put(sessionId, session);
        store.addAuditLog("DIAGNOSTIC_SESSION", sessionId, "SESSION_STARTED", "CURRENT_USER", tenantId);

        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Diagnostic session created", session, "req_tech_006"));
    }

    @GetMapping("/diagnostics/sessions/{sessionId}")
    public ResponseEntity<Map<String, Object>> getDiagnosticSession(
            @PathVariable("sessionId") String sessionId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> session = store.getDiagnosticSessions().get(sessionId);
        if (session == null || !tenantId.equals(session.get("tenantId"))) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Diagnostic session not found", null, null));
        }
        return ResponseEntity.ok(standardSuccess("Diagnostic session retrieved", session, null));
    }

    @PostMapping("/diagnostics/sessions/{sessionId}/observations")
    public ResponseEntity<Map<String, Object>> recordObservations(
            @PathVariable("sessionId") String sessionId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> session = store.getDiagnosticSessions().get(sessionId);
        if (session == null || !tenantId.equals(session.get("tenantId"))) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Diagnostic session not found", null, null));
        }

        List<?> obsList = (List<?>) body.get("observations");
        int count = obsList != null ? obsList.size() : 0;

        List<Map<String, Object>> existing = store.getDiagnosticObservations().computeIfAbsent(sessionId, k -> new ArrayList<>());
        if (obsList != null) {
            for (Object o : obsList) {
                if (o instanceof Map) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> m = new LinkedHashMap<>((Map<String, Object>) o);
                    m.put("recordedAt", Instant.now().toString());
                    m.put("recordedBy", "CURRENT_AUTHENTICATED_USER");
                    existing.add(m);
                }
            }
        }

        Map<String, Object> r = new LinkedHashMap<>();
        r.put("sessionId", sessionId);
        r.put("observationsRecorded", count);
        r.put("status", "IN_PROGRESS");

        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Diagnostic observations recorded", r, "req_tech_007"));
    }

    @PostMapping("/diagnostics/sessions/{sessionId}/run-check")
    public ResponseEntity<Map<String, Object>> runDiagnosticCheck(
            @PathVariable("sessionId") String sessionId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> r = Map.of(
                "sessionId", sessionId,
                "checkId", "CHK-001",
                "checkName", "Stator Winding Resistance & Thermal Profile",
                "result", "WARNING_ELEVATED_TEMPERATURE",
                "measuredValue", "92 C",
                "status", "COMPLETED"
        );
        return ResponseEntity.ok(standardSuccess("Diagnostic check completed", r, null));
    }

    @PostMapping("/diagnostics/sessions/{sessionId}/suggestions")
    public ResponseEntity<Map<String, Object>> getTroubleshootingSuggestions(
            @PathVariable("sessionId") String sessionId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> session = store.getDiagnosticSessions().get(sessionId);
        if (session == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Diagnostic session not found", null, null));
        }

        List<Map<String, Object>> suggestions = List.of(
                Map.of(
                        "title", "Review the approved operating-temperature limits",
                        "sourceType", "PRODUCT_MANUAL",
                        "documentReference", "MAN-M200-01",
                        "requiresTechnicianReview", true
                ),
                Map.of(
                        "title", "Inspect the approved maintenance checklist",
                        "sourceType", "KNOWLEDGE_BASE",
                        "documentReference", "KB-1001",
                        "requiresTechnicianReview", true
                )
        );

        Map<String, Object> r = new LinkedHashMap<>();
        r.put("sessionId", sessionId);
        r.put("suggestions", suggestions);
        r.put("safetyWarning", "Follow the approved isolation and safety procedures before inspecting equipment.");
        r.put("status", "REQUIRES_TECHNICIAN_REVIEW");

        return ResponseEntity.ok(standardSuccess("Troubleshooting suggestions generated", r, "req_tech_008"));
    }

    @PostMapping("/diagnostics/sessions/{sessionId}/complete")
    public ResponseEntity<Map<String, Object>> completeSession(
            @PathVariable("sessionId") String sessionId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> s = store.getDiagnosticSessions().get(sessionId);
        if (s != null) {
            s.put("status", "COMPLETED");
        }
        return ResponseEntity.ok(standardSuccess("Diagnostic session completed", s, null));
    }

    @GetMapping("/diagnostics/rules")
    public ResponseEntity<Map<String, Object>> getDiagnosticRules(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> rules = List.of(
                Map.of("ruleId", "RULE-TH-01", "name", "Thermal Rise Limit > 85 C", "action", "INSPECT_COOLING_FAN"),
                Map.of("ruleId", "RULE-VB-02", "name", "Vibration Peak > 4.5 mm/s", "action", "CHECK_SHAFT_ALIGNMENT")
        );
        return ResponseEntity.ok(standardSuccess("Authorized diagnostic rules retrieved", rules, null));
    }

    // ==========================================
    // E. ATTACHMENTS & EVIDENCE
    // ==========================================

    @PostMapping("/cases/{caseId}/attachments")
    public ResponseEntity<Map<String, Object>> uploadAttachment(
            @PathVariable("caseId") String caseId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String attId = "ATT-" + UUID.randomUUID().toString().substring(0, 6);
        Map<String, Object> att = new LinkedHashMap<>();
        att.put("attachmentId", attId);
        att.put("caseId", caseId);
        att.put("fileName", body.getOrDefault("fileName", "evidence_log.csv"));
        att.put("fileType", body.getOrDefault("fileType", "text/csv"));
        att.put("fileSize", body.getOrDefault("fileSize", 10240));
        att.put("uploadedAt", Instant.now().toString());

        store.getTechnicalCaseAttachments().computeIfAbsent(caseId, k -> new ArrayList<>()).add(att);
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Attachment uploaded", att, null));
    }

    @GetMapping("/cases/{caseId}/attachments")
    public ResponseEntity<Map<String, Object>> listAttachments(
            @PathVariable("caseId") String caseId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> atts = store.getTechnicalCaseAttachments().getOrDefault(caseId, Collections.emptyList());
        return ResponseEntity.ok(standardSuccess("Case attachments retrieved", atts, null));
    }

    @PostMapping("/cases/{caseId}/evidence")
    public ResponseEntity<Map<String, Object>> recordEvidence(
            @PathVariable("caseId") String caseId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String evId = "EVD-" + (7000 + store.getTechnicalCaseEvidence().size() + 1);
        Map<String, Object> ev = new LinkedHashMap<>(body);
        ev.put("evidenceId", evId);
        ev.put("caseId", caseId);
        ev.put("recordedAt", Instant.now().toString());

        store.getTechnicalCaseEvidence().computeIfAbsent(caseId, k -> new ArrayList<>()).add(ev);
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Technical evidence recorded", ev, null));
    }

    @GetMapping("/cases/{caseId}/evidence")
    public ResponseEntity<Map<String, Object>> getEvidence(
            @PathVariable("caseId") String caseId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> evs = store.getTechnicalCaseEvidence().getOrDefault(caseId, Collections.emptyList());
        return ResponseEntity.ok(standardSuccess("Recorded evidence retrieved", evs, null));
    }

    // ==========================================
    // F. SERVICE, REPAIR & MAINTENANCE
    // ==========================================

    @GetMapping("/service-requests")
    public ResponseEntity<Map<String, Object>> listServiceRequests(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> reqs = store.getTechnicalServiceRequests().values().stream()
                .filter(r -> tenantId.equals(r.get("tenantId")))
                .collect(Collectors.toList());
        return ResponseEntity.ok(standardSuccess("Service requests retrieved", reqs, null));
    }

    @PostMapping("/service-requests")
    public ResponseEntity<Map<String, Object>> createServiceRequest(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        String reqId = "SRV-" + (9000 + store.getTechnicalServiceRequests().size() + 1);

        Map<String, Object> sr = new LinkedHashMap<>();
        sr.put("requestId", reqId);
        sr.put("caseId", body.get("caseId"));
        sr.put("customerId", body.getOrDefault("customerId", "CUS-1001"));
        sr.put("productId", body.getOrDefault("productId", "PRD-2001"));
        sr.put("serviceType", body.getOrDefault("serviceType", "ONSITE_INSPECTION"));
        sr.put("description", body.get("description"));
        sr.put("requestedDate", body.get("requestedDate"));
        sr.put("locationId", body.getOrDefault("locationId", "LOC-1001"));
        sr.put("status", "PENDING_SCHEDULING");
        sr.put("confirmedAppointment", false);
        sr.put("assignedTechnician", null);
        sr.put("tenantId", tenantId);
        sr.put("createdAt", Instant.now().toString());

        store.getTechnicalServiceRequests().put(reqId, sr);
        store.addAuditLog("SERVICE_REQUEST", reqId, "REQUEST_CREATED", "CURRENT_USER", tenantId);

        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Service request created", sr, "req_tech_009"));
    }

    @GetMapping("/service-requests/{requestId}")
    public ResponseEntity<Map<String, Object>> getServiceRequest(
            @PathVariable("requestId") String requestId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> sr = store.getTechnicalServiceRequests().get(requestId);
        if (sr == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Service request not found", null, null));
        }
        return ResponseEntity.ok(standardSuccess("Service request details retrieved", sr, null));
    }

    @PatchMapping("/service-requests/{requestId}")
    public ResponseEntity<Map<String, Object>> updateServiceRequest(
            @PathVariable("requestId") String requestId,
            @RequestBody Map<String, Object> updates,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> sr = store.getTechnicalServiceRequests().get(requestId);
        if (sr == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Service request not found", null, null));
        }
        sr.putAll(updates);
        return ResponseEntity.ok(standardSuccess("Service request updated", sr, null));
    }

    @PostMapping("/service-requests/{requestId}/schedule")
    public ResponseEntity<Map<String, Object>> scheduleService(
            @PathVariable("requestId") String requestId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> sr = store.getTechnicalServiceRequests().get(requestId);
        if (sr == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Service request not found", null, null));
        }
        sr.put("scheduledDate", body.get("scheduledDate"));
        sr.put("confirmedAppointment", true);
        sr.put("status", "SCHEDULED");
        return ResponseEntity.ok(standardSuccess("Service appointment confirmed", sr, null));
    }

    @PostMapping("/service-requests/{requestId}/assign-technician")
    public ResponseEntity<Map<String, Object>> assignTechnician(
            @PathVariable("requestId") String requestId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> sr = store.getTechnicalServiceRequests().get(requestId);
        if (sr == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Service request not found", null, null));
        }
        sr.put("assignedTechnician", body.get("technicianId"));
        sr.put("status", "TECHNICIAN_ASSIGNED");
        return ResponseEntity.ok(standardSuccess("Technician assigned", sr, null));
    }

    @PostMapping("/service-requests/{requestId}/update-status")
    public ResponseEntity<Map<String, Object>> updateServiceStatus(
            @PathVariable("requestId") String requestId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> sr = store.getTechnicalServiceRequests().get(requestId);
        if (sr == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Service request not found", null, null));
        }
        sr.put("status", body.get("status"));
        return ResponseEntity.ok(standardSuccess("Service request status updated", sr, null));
    }

    @PostMapping("/service-requests/{requestId}/complete")
    public ResponseEntity<Map<String, Object>> completeServiceRequest(
            @PathVariable("requestId") String requestId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> sr = store.getTechnicalServiceRequests().get(requestId);
        if (sr == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Service request not found", null, null));
        }
        sr.put("status", "COMPLETED");
        sr.put("completedAt", Instant.now().toString());
        sr.put("reportSummary", body.get("reportSummary"));
        return ResponseEntity.ok(standardSuccess("Service request completed", sr, null));
    }

    @GetMapping("/maintenance-plans")
    public ResponseEntity<Map<String, Object>> getMaintenancePlans(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> plans = List.of(
                Map.of("planId", "MP-01", "name", "Standard Industrial Motor Bi-Annual PM", "intervalHours", 2000),
                Map.of("planId", "MP-02", "name", "Heavy Duty Hydraulic Valve Annual Overhaul", "intervalHours", 4000)
        );
        return ResponseEntity.ok(standardSuccess("Maintenance plans retrieved", plans, null));
    }

    @GetMapping("/products/{productId}/maintenance-history")
    public ResponseEntity<Map<String, Object>> getMaintenanceHistory(
            @PathVariable("productId") String productId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> hist = List.of(
                Map.of("serviceId", "SRV-HIST-01", "productId", productId, "date", "2026-04-12", "technician", "USR-TECH-101", "findings", "Bearing greasing completed")
        );
        return ResponseEntity.ok(standardSuccess("Maintenance history retrieved", hist, null));
    }

    // ==========================================
    // G. WARRANTY & QUALITY SUPPORT
    // ==========================================

    @GetMapping("/warranty-claims")
    public ResponseEntity<Map<String, Object>> listWarrantyClaims(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> claims = store.getWarrantyClaims().values().stream()
                .filter(w -> tenantId.equals(w.get("tenantId")))
                .collect(Collectors.toList());
        return ResponseEntity.ok(standardSuccess("Warranty claims retrieved", claims, null));
    }

    @GetMapping("/warranty-claims/{claimId}")
    public ResponseEntity<Map<String, Object>> getWarrantyClaim(
            @PathVariable("claimId") String claimId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> w = store.getWarrantyClaims().get(claimId);
        if (w == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Warranty claim not found", null, null));
        }
        return ResponseEntity.ok(standardSuccess("Warranty claim retrieved", w, null));
    }

    @PostMapping("/warranty-claims/{claimId}/technical-assessment")
    public ResponseEntity<Map<String, Object>> recordWarrantyTechnicalAssessment(
            @PathVariable("claimId") String claimId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> w = store.getWarrantyClaims().get(claimId);
        if (w == null || !tenantId.equals(w.get("tenantId"))) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Warranty claim not found", null, null));
        }

        String asmId = "ASM-" + (4000 + store.getTechnicalAssessments().size() + 1);
        Map<String, Object> assessment = new LinkedHashMap<>();
        assessment.put("assessmentId", asmId);
        assessment.put("claimId", claimId);
        assessment.put("caseId", body.get("caseId"));
        assessment.put("findings", body.get("findings"));
        assessment.put("evidenceIds", body.get("evidenceIds"));
        assessment.put("recommendedAction", body.getOrDefault("recommendedAction", "FURTHER_INSPECTION"));
        assessment.put("confidence", body.getOrDefault("confidence", "NEEDS_VERIFICATION"));
        assessment.put("status", "PENDING_WARRANTY_REVIEW");
        assessment.put("recordedAt", Instant.now().toString());
        assessment.put("tenantId", tenantId);

        store.getTechnicalAssessments().put(asmId, assessment);
        w.put("status", "PENDING_WARRANTY_REVIEW");
        w.put("assessmentId", asmId);

        Map<String, Object> r = new LinkedHashMap<>();
        r.put("claimId", claimId);
        r.put("assessmentId", asmId);
        r.put("status", "PENDING_WARRANTY_REVIEW");
        r.put("recommendedAction", assessment.get("recommendedAction"));

        store.addAuditLog("WARRANTY_ASSESSMENT", asmId, "ASSESSMENT_RECORDED", "CURRENT_USER", tenantId);
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Technical assessment recorded", r, "req_tech_010"));
    }

    @PostMapping("/warranty-claims/{claimId}/request-evidence")
    public ResponseEntity<Map<String, Object>> requestWarrantyEvidence(
            @PathVariable("claimId") String claimId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Additional warranty evidence requested", Map.of("claimId", claimId, "status", "EVIDENCE_REQUESTED"), null));
    }

    @PostMapping("/warranty-claims/{claimId}/escalate")
    public ResponseEntity<Map<String, Object>> escalateWarranty(
            @PathVariable("claimId") String claimId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Warranty claim escalated to quality review", Map.of("claimId", claimId, "status", "ESCALATED_TO_QUALITY"), null));
    }

    @GetMapping("/quality-complaints")
    public ResponseEntity<Map<String, Object>> listQualityComplaints(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = store.getQualityComplaints().values().stream()
                .filter(q -> tenantId.equals(q.get("tenantId")))
                .collect(Collectors.toList());
        return ResponseEntity.ok(standardSuccess("Quality complaints retrieved", list, null));
    }

    @PostMapping("/quality-complaints")
    public ResponseEntity<Map<String, Object>> recordQualityComplaint(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        String cid = "QC-" + UUID.randomUUID().toString().substring(0, 6);
        Map<String, Object> q = new LinkedHashMap<>(body);
        q.put("complaintId", cid);
        q.put("tenantId", tenantId);
        q.put("status", "REGISTERED");
        store.getQualityComplaints().put(cid, q);
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Quality complaint recorded", q, null));
    }

    @GetMapping("/quality-complaints/{complaintId}")
    public ResponseEntity<Map<String, Object>> getQualityComplaint(
            @PathVariable("complaintId") String complaintId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> q = store.getQualityComplaints().get(complaintId);
        if (q == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Quality complaint not found", null, null));
        }
        return ResponseEntity.ok(standardSuccess("Quality complaint details retrieved", q, null));
    }

    @PostMapping("/quality-complaints/{complaintId}/technical-findings")
    public ResponseEntity<Map<String, Object>> addQualityFindings(
            @PathVariable("complaintId") String complaintId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> q = store.getQualityComplaints().get(complaintId);
        if (q == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Quality complaint not found", null, null));
        }
        q.put("findings", body.get("findings"));
        q.put("status", "FINDINGS_RECORDED");
        return ResponseEntity.ok(standardSuccess("Technical findings added to quality complaint", q, null));
    }

    @PostMapping("/quality-complaints/{complaintId}/escalate")
    public ResponseEntity<Map<String, Object>> escalateQualityComplaint(
            @PathVariable("complaintId") String complaintId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> q = store.getQualityComplaints().get(complaintId);
        if (q != null) {
            q.put("status", "ESCALATED_TO_PLANT_ENGINEERING");
        }
        return ResponseEntity.ok(standardSuccess("Potential defect escalated to engineering", q, null));
    }

    // ==========================================
    // H. CUSTOMER COMMUNICATION & KNOWLEDGE BASE
    // ==========================================

    @GetMapping("/cases/{caseId}/messages")
    public ResponseEntity<Map<String, Object>> listCaseMessages(
            @PathVariable("caseId") String caseId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> msgs = store.getTicketMessages().getOrDefault(caseId, Collections.emptyList());
        return ResponseEntity.ok(standardSuccess("Case messages retrieved", msgs, null));
    }

    @PostMapping("/cases/{caseId}/messages")
    public ResponseEntity<Map<String, Object>> addCaseMessage(
            @PathVariable("caseId") String caseId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> msg = new LinkedHashMap<>();
        msg.put("messageId", "MSG-" + UUID.randomUUID().toString().substring(0, 6));
        msg.put("caseId", caseId);
        msg.put("sender", "TECHNICAL_SUPPORT");
        msg.put("content", body.get("message"));
        msg.put("timestamp", Instant.now().toString());

        store.getTicketMessages().computeIfAbsent(caseId, k -> new ArrayList<>()).add(msg);
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Customer message added", msg, null));
    }

    @PostMapping("/cases/{caseId}/internal-notes")
    public ResponseEntity<Map<String, Object>> addInternalNote(
            @PathVariable("caseId") String caseId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> note = new LinkedHashMap<>();
        note.put("noteId", "NOTE-" + UUID.randomUUID().toString().substring(0, 6));
        note.put("caseId", caseId);
        note.put("author", "CURRENT_USER");
        note.put("content", body.get("note"));
        note.put("timestamp", Instant.now().toString());

        store.getTicketInternalNotes().computeIfAbsent(caseId, k -> new ArrayList<>()).add(note);
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Internal note added", note, null));
    }

    @GetMapping("/knowledge/articles")
    public ResponseEntity<Map<String, Object>> listArticles(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = store.getKnowledgeArticles().values().stream()
                .filter(a -> tenantId.equals(a.get("tenantId")))
                .collect(Collectors.toList());
        return ResponseEntity.ok(standardSuccess("Knowledge base articles retrieved", list, null));
    }

    @GetMapping("/knowledge/articles/{articleId}")
    public ResponseEntity<Map<String, Object>> getArticle(
            @PathVariable("articleId") String articleId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> art = store.getKnowledgeArticles().get(articleId);
        if (art == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Article not found", null, null));
        }
        return ResponseEntity.ok(standardSuccess("Knowledge article retrieved", art, null));
    }

    @PostMapping("/knowledge/search")
    public ResponseEntity<Map<String, Object>> searchKnowledge(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        String query = (String) body.get("query");
        List<Map<String, Object>> results = store.getKnowledgeArticles().values().stream()
                .filter(a -> tenantId.equals(a.get("tenantId")))
                .filter(a -> {
                    if (query == null || query.isBlank()) return true;
                    String q = query.toLowerCase();
                    return String.valueOf(a.get("title")).toLowerCase().contains(q) ||
                           String.valueOf(a.get("content")).toLowerCase().contains(q);
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(standardSuccess("Knowledge search completed", results, null));
    }

    @PostMapping("/cases/{caseId}/handoff")
    public ResponseEntity<Map<String, Object>> handoffCase(
            @PathVariable("caseId") String caseId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> r = Map.of(
                "caseId", caseId,
                "targetTeam", body.getOrDefault("targetTeam", "FIELD_SERVICE"),
                "status", "TRANSFERRED"
        );
        return ResponseEntity.ok(standardSuccess("Case handoff initiated", r, null));
    }

    @PostMapping("/feedback")
    public ResponseEntity<Map<String, Object>> recordFeedback(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Customer feedback recorded", body, null));
    }
}
