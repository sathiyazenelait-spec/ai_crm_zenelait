package com.zenelait.crm.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

/**
 * Zenelait AI CRM — Consulting Company Admin V1 REST API Controller
 * Implements Part 4 Consulting Company Admin API Catalogue:
 * - Dashboard & Settings (/api/v1/consulting/dashboard, /settings)
 * - Services & Consultants (/api/v1/consulting/services, /consultants)
 * - Prospects, Leads & Client Accounts (/api/v1/consulting/leads, /qualify, /accounts)
 * - Discovery Calls & Appointments (/api/v1/consulting/appointments)
 * - Proposals & Engagements (/api/v1/consulting/proposals, /send, /accept, /engagements)
 * - Projects, Milestones & Tasks (/api/v1/consulting/projects, /milestones, /tasks)
 * - Reports (/api/v1/reports/consulting/*)
 */
@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class ConsultingAdminV1Controller {

    private final Map<String, Object> consultingSettings = new LinkedHashMap<>();
    private final List<Map<String, Object>> services = new ArrayList<>();
    private final List<Map<String, Object>> consultants = new ArrayList<>();
    private final List<Map<String, Object>> leads = new ArrayList<>();
    private final List<Map<String, Object>> accounts = new ArrayList<>();
    private final List<Map<String, Object>> appointments = new ArrayList<>();
    private final List<Map<String, Object>> proposals = new ArrayList<>();
    private final List<Map<String, Object>> engagements = new ArrayList<>();
    private final List<Map<String, Object>> projects = new ArrayList<>();

    public ConsultingAdminV1Controller() {
        initConsultingData();
    }

    private void initConsultingData() {
        // 1. Settings
        consultingSettings.put("companyName", "Zenith Strategic & Management Advisory LLP");
        consultingSettings.put("defaultCurrency", "INR");
        consultingSettings.put("defaultBillingModel", "FIXED_FEE");
        consultingSettings.put("standardProposalValidityDays", 14);
        consultingSettings.put("contactEmail", "advisory@zenithadvisory.com");

        // 2. Services
        Map<String, Object> s1 = new LinkedHashMap<>();
        s1.put("id", "CSVC-001");
        s1.put("serviceCode", "IT-CONSULT-001");
        s1.put("name", "IT Strategy & Cloud Migration Consulting");
        s1.put("billingModel", "FIXED_FEE");
        s1.put("startingPrice", 50000.00);
        s1.put("currency", "INR");
        s1.put("status", "ACTIVE");
        s1.put("description", "Enterprise cloud architecture roadmap, vendor selection and modernization consulting");
        services.add(s1);

        Map<String, Object> s2 = new LinkedHashMap<>();
        s2.put("id", "CSVC-002");
        s2.put("serviceCode", "BIZ-TRANS-002");
        s2.put("name", "Business Process Optimization & ERP Audit");
        s2.put("billingModel", "TIME_AND_MATERIALS");
        s2.put("startingPrice", 75000.00);
        s2.put("currency", "INR");
        s2.put("status", "ACTIVE");
        s2.put("description", "Operational diagnosis, cost-reduction frameworks and ERP alignment audits");
        services.add(s2);

        // 3. Consultants
        Map<String, Object> c1 = new LinkedHashMap<>();
        c1.put("id", "CONS-001");
        c1.put("displayName", "Karthik Subramanian");
        c1.put("title", "Principal Cloud & Architecture Consultant");
        c1.put("specializations", List.of("Cloud Migration", "IT Strategy", "Enterprise Architecture"));
        c1.put("yearsOfExperience", 12);
        c1.put("status", "ACTIVE");
        c1.put("ratePerHour", 8500.00);
        consultants.add(c1);

        Map<String, Object> c2 = new LinkedHashMap<>();
        c2.put("id", "CONS-002");
        c2.put("displayName", "Meera Nambiar");
        c2.put("title", "Management & Operations Partner");
        c2.put("specializations", List.of("Supply Chain", "BPR", "ERP Advisory"));
        c2.put("yearsOfExperience", 14);
        c2.put("status", "ACTIVE");
        c2.put("ratePerHour", 9500.00);
        consultants.add(c2);

        // 4. Leads / Prospects
        Map<String, Object> l1 = new LinkedHashMap<>();
        l1.put("id", "CLEAD-001");
        l1.put("companyName", "TechSparks Solutions Ltd");
        l1.put("contactName", "Karthik Raj");
        l1.put("email", "karthik.r@techsparks.in");
        l1.put("phone", "+91 98401 23456");
        l1.put("serviceInterest", "IT Strategy & Cloud Migration Consulting");
        l1.put("budgetRange", "₹1,00,000 - ₹3,00,000");
        l1.put("stage", "QUALIFIED");
        l1.put("assignedConsultant", "Karthik Subramanian");
        l1.put("createdAt", "2026-10-24T04:15:00Z");
        leads.add(l1);

        // 5. Client Accounts
        Map<String, Object> a1 = new LinkedHashMap<>();
        a1.put("id", "CACC-001");
        a1.put("companyName", "Global FinTech Systems");
        a1.put("industry", "FinTech / Banking");
        a1.put("primaryContact", "Sunil Joshi (CTO)");
        a1.put("email", "sunil@globalfintech.io");
        a1.put("phone", "+91 80 4455 6677");
        a1.put("status", "ACTIVE_CLIENT");
        accounts.add(a1);

        // 6. Appointments / Discovery Calls
        Map<String, Object> app1 = new LinkedHashMap<>();
        app1.put("id", "CAPPT-001");
        app1.put("title", "Cloud Migration Strategy Discovery Call");
        app1.put("leadId", "CLEAD-001");
        app1.put("clientName", "TechSparks Solutions Ltd");
        app1.put("consultantName", "Karthik Subramanian");
        app1.put("meetingType", "VIDEO_CALL");
        app1.put("startAt", "2026-11-05T10:00:00+05:30");
        app1.put("status", "SCHEDULED");
        appointments.add(app1);

        // 7. Proposals
        Map<String, Object> prop1 = new LinkedHashMap<>();
        prop1.put("id", "CPROP-001");
        prop1.put("proposalNumber", "CON-2026-001");
        prop1.put("leadId", "CLEAD-001");
        prop1.put("title", "Cloud Migration Strategy & Architecture Roadmap");
        prop1.put("clientName", "TechSparks Solutions Ltd");
        prop1.put("fee", 120000.00);
        prop1.put("currency", "INR");
        prop1.put("estimatedDurationWeeks", 4);
        prop1.put("status", "SENT");
        prop1.put("validUntil", "2026-11-20");
        prop1.put("createdAt", "2026-10-24T06:00:00Z");
        proposals.add(prop1);

        // 8. Engagements & Projects
        Map<String, Object> eng1 = new LinkedHashMap<>();
        eng1.put("id", "CENG-001");
        eng1.put("name", "FinTech Modernization Architecture Review");
        eng1.put("clientName", "Global FinTech Systems");
        eng1.put("leadPartner", "Meera Nambiar");
        eng1.put("startDate", "2026-10-01");
        eng1.put("targetEndDate", "2026-11-30");
        eng1.put("budget", 280000.00);
        eng1.put("status", "IN_PROGRESS");
        engagements.add(eng1);

        Map<String, Object> prj1 = new LinkedHashMap<>();
        prj1.put("id", "CPRJ-001");
        prj1.put("name", "AWS Microservices Target Architecture");
        prj1.put("clientName", "Global FinTech Systems");
        prj1.put("progressPercent", 65);
        prj1.put("status", "ON_TRACK");
        prj1.put("milestones", List.of(
                Map.of("name", "Current State Audit", "status", "COMPLETED"),
                Map.of("name", "Target Cloud Blueprint", "status", "IN_PROGRESS"),
                Map.of("name", "Migration Runbook & Sign-off", "status", "UPCOMING")
        ));
        projects.add(prj1);
    }

    // ==========================================
    // 11.1 DASHBOARD & SETTINGS
    // ==========================================

    @GetMapping("/consulting/dashboard")
    public ResponseEntity<Map<String, Object>> getConsultingDashboard(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {

        Map<String, Object> metrics = new LinkedHashMap<>();
        metrics.put("newLeads", 95 + leads.size());
        metrics.put("qualifiedLeads", 48);
        metrics.put("discoveryCallsScheduled", 30 + appointments.size());
        metrics.put("proposalsSent", 22 + proposals.size());
        metrics.put("activeEngagements", 15 + engagements.size());

        Map<String, Object> sales = new LinkedHashMap<>();
        sales.put("proposalValue", 3200000.00);
        sales.put("acceptedProposalValue", 1450000.00);
        sales.put("currency", "INR");

        Map<String, Object> ai = new LinkedHashMap<>();
        ai.put("totalConversations", 390);
        ai.put("qualifiedLeadsCaptured", 82);
        ai.put("escalatedToHuman", 95);
        ai.put("resolutionRate", 75.6);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("period", Map.of("from", from != null ? from : "2026-10-01", "to", to != null ? to : "2026-10-24"));
        data.put("metrics", metrics);
        data.put("sales", sales);
        data.put("ai", ai);

        return ResponseEntity.ok(Map.of("success", true, "data", data));
    }

    @GetMapping("/consulting/settings")
    public ResponseEntity<Map<String, Object>> getConsultingSettings() {
        return ResponseEntity.ok(Map.of("success", true, "data", consultingSettings));
    }

    @PutMapping("/consulting/settings")
    public ResponseEntity<Map<String, Object>> updateConsultingSettings(@RequestBody Map<String, Object> updates) {
        consultingSettings.putAll(updates);
        return ResponseEntity.ok(Map.of("success", true, "message", "Consulting settings updated", "data", consultingSettings));
    }

    // ==========================================
    // 11.2 SERVICES & CONSULTANTS
    // ==========================================

    @GetMapping("/consulting/services")
    public ResponseEntity<Map<String, Object>> getServices() {
        return ResponseEntity.ok(Map.of("success", true, "data", services));
    }

    @PostMapping("/consulting/services")
    public ResponseEntity<Map<String, Object>> createService(@RequestBody Map<String, Object> req) {
        String id = "CSVC-" + String.format("%03d", services.size() + 1);
        Map<String, Object> s = new LinkedHashMap<>(req);
        s.put("id", id);
        s.putIfAbsent("status", "ACTIVE");
        s.putIfAbsent("currency", "INR");
        services.add(s);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "message", "Consulting service created successfully", "data", s));
    }

    @GetMapping("/consulting/consultants")
    public ResponseEntity<Map<String, Object>> getConsultants() {
        return ResponseEntity.ok(Map.of("success", true, "data", consultants));
    }

    @PostMapping("/consulting/consultants")
    public ResponseEntity<Map<String, Object>> createConsultant(@RequestBody Map<String, Object> req) {
        String id = "CONS-" + String.format("%03d", consultants.size() + 1);
        Map<String, Object> c = new LinkedHashMap<>(req);
        c.put("id", id);
        c.putIfAbsent("status", "ACTIVE");
        consultants.add(c);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "message", "Consultant profile created successfully", "data", c));
    }

    // ==========================================
    // 11.3 LEADS & CLIENT ACCOUNTS
    // ==========================================

    @GetMapping("/consulting/leads")
    public ResponseEntity<Map<String, Object>> getLeads() {
        return ResponseEntity.ok(Map.of("success", true, "data", leads));
    }

    @PostMapping("/consulting/leads")
    public ResponseEntity<Map<String, Object>> createLead(@RequestBody Map<String, Object> req) {
        String id = "CLEAD-" + String.format("%03d", leads.size() + 1);
        Map<String, Object> l = new LinkedHashMap<>(req);
        l.put("id", id);
        l.putIfAbsent("stage", "NEW");
        l.put("createdAt", Instant.now().toString());
        leads.add(0, l);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "message", "Consulting lead created successfully", "data", l));
    }

    @PostMapping("/consulting/leads/{leadId}/qualify")
    public ResponseEntity<Map<String, Object>> qualifyLead(@PathVariable String leadId, @RequestBody Map<String, Object> req) {
        for (Map<String, Object> l : leads) {
            if (leadId.equalsIgnoreCase((String) l.get("id"))) {
                l.put("stage", "QUALIFIED");
                l.put("qualificationNotes", req.get("qualificationNotes"));
                return ResponseEntity.ok(Map.of("success", true, "message", "Lead qualification recorded", "data", l));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Lead not found"));
    }

    @GetMapping("/consulting/accounts")
    public ResponseEntity<Map<String, Object>> getAccounts() {
        return ResponseEntity.ok(Map.of("success", true, "data", accounts));
    }

    @PostMapping("/consulting/accounts")
    public ResponseEntity<Map<String, Object>> createAccount(@RequestBody Map<String, Object> req) {
        String id = "CACC-" + String.format("%03d", accounts.size() + 1);
        Map<String, Object> a = new LinkedHashMap<>(req);
        a.put("id", id);
        a.putIfAbsent("status", "ACTIVE_CLIENT");
        accounts.add(a);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "message", "Client account created successfully", "data", a));
    }

    // ==========================================
    // 11.4 DISCOVERY CALLS & APPOINTMENTS
    // ==========================================

    @GetMapping("/consulting/appointments")
    public ResponseEntity<Map<String, Object>> getAppointments() {
        return ResponseEntity.ok(Map.of("success", true, "data", appointments));
    }

    @PostMapping("/consulting/appointments")
    public ResponseEntity<Map<String, Object>> createAppointment(@RequestBody Map<String, Object> req) {
        String id = "CAPPT-" + String.format("%03d", appointments.size() + 1);
        Map<String, Object> app = new LinkedHashMap<>(req);
        app.put("id", id);
        app.putIfAbsent("status", "SCHEDULED");
        appointments.add(0, app);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "message", "Discovery appointment created successfully", "data", app));
    }

    // ==========================================
    // 11.5 PROPOSALS & ENGAGEMENTS
    // ==========================================

    @GetMapping("/consulting/proposals")
    public ResponseEntity<Map<String, Object>> getProposals() {
        return ResponseEntity.ok(Map.of("success", true, "data", proposals));
    }

    @PostMapping("/consulting/proposals")
    public ResponseEntity<Map<String, Object>> createProposal(@RequestBody Map<String, Object> req) {
        String id = "CPROP-" + String.format("%03d", proposals.size() + 1);
        String pNum = "CON-2026-" + String.format("%03d", proposals.size() + 1);
        Map<String, Object> prop = new LinkedHashMap<>(req);
        prop.put("id", id);
        prop.put("proposalNumber", pNum);
        prop.putIfAbsent("status", "DRAFT");
        prop.putIfAbsent("currency", "INR");
        prop.put("createdAt", Instant.now().toString());
        proposals.add(0, prop);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "message", "Consulting proposal created successfully", "data", prop));
    }

    @PostMapping("/consulting/proposals/{proposalId}/send")
    public ResponseEntity<Map<String, Object>> sendProposal(@PathVariable String proposalId) {
        for (Map<String, Object> p : proposals) {
            if (proposalId.equalsIgnoreCase((String) p.get("id"))) {
                p.put("status", "SENT");
                return ResponseEntity.ok(Map.of("success", true, "message", "Proposal sent to prospect", "data", p));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Proposal not found"));
    }

    @PostMapping("/consulting/proposals/{proposalId}/accept")
    public ResponseEntity<Map<String, Object>> acceptProposal(@PathVariable String proposalId) {
        for (Map<String, Object> p : proposals) {
            if (proposalId.equalsIgnoreCase((String) p.get("id"))) {
                p.put("status", "ACCEPTED");
                return ResponseEntity.ok(Map.of("success", true, "message", "Proposal accepted by client", "data", p));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Proposal not found"));
    }

    @GetMapping("/consulting/engagements")
    public ResponseEntity<Map<String, Object>> getEngagements() {
        return ResponseEntity.ok(Map.of("success", true, "data", engagements));
    }

    @PostMapping("/consulting/engagements")
    public ResponseEntity<Map<String, Object>> createEngagement(@RequestBody Map<String, Object> req) {
        String id = "CENG-" + String.format("%03d", engagements.size() + 1);
        Map<String, Object> eng = new LinkedHashMap<>(req);
        eng.put("id", id);
        eng.putIfAbsent("status", "IN_PROGRESS");
        engagements.add(0, eng);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "message", "Consulting engagement created successfully", "data", eng));
    }

    // ==========================================
    // 11.6 PROJECTS & TASKS
    // ==========================================

    @GetMapping("/consulting/projects")
    public ResponseEntity<Map<String, Object>> getProjects() {
        return ResponseEntity.ok(Map.of("success", true, "data", projects));
    }

    @PostMapping("/consulting/projects")
    public ResponseEntity<Map<String, Object>> createProject(@RequestBody Map<String, Object> req) {
        String id = "CPRJ-" + String.format("%03d", projects.size() + 1);
        Map<String, Object> prj = new LinkedHashMap<>(req);
        prj.put("id", id);
        prj.putIfAbsent("progressPercent", 0);
        prj.putIfAbsent("status", "ON_TRACK");
        projects.add(0, prj);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "message", "Project created successfully", "data", prj));
    }

    // ==========================================
    // 11.7 REPORTS
    // ==========================================

    @GetMapping("/reports/consulting/revenue")
    public ResponseEntity<Map<String, Object>> getRevenueReport() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of(
                        "totalProposalValue", 3200000.00,
                        "acceptedProposalValue", 1450000.00,
                        "averageProjectSize", 185000.00,
                        "currency", "INR",
                        "topPractices", List.of(
                                Map.of("practice", "Cloud & IT Strategy", "engagements", 8, "revenue", 850000.00),
                                Map.of("practice", "Business Process Optimization", "engagements", 4, "revenue", 380000.00),
                                Map.of("practice", "Enterprise Architecture Audit", "engagements", 3, "revenue", 220000.00)
                        )
                )
        ));
    }
}
