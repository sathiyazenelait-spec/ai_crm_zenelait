package com.zenelait.crm.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Zenelait AI CRM — Software/IT Company Tenant V1 REST API Controller
 * Implements the complete specification for the 4 Software/IT roles:
 * 1. Sales Manager (Team overview, lead assignment, quotation approvals, automations, team reports)
 * 2. Sales Executive (Personal dashboard, assigned leads, sales activities, qualification, quotations, sales assist)
 * 3. Support Manager (Support dashboard, ticket assignment, SLA monitoring, escalations, internal notes, support automations)
 * 4. Support Agent (Personal tickets, conversation inbox, public replies, internal notes, knowledge search, AI support assist)
 */
@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class SoftwareTenantAdminV1Controller {

    private final Map<String, Object> tenantProfile = new LinkedHashMap<>();
    private final List<Map<String, Object>> users = new ArrayList<>();
    private final List<Map<String, Object>> contacts = new ArrayList<>();
    private final List<Map<String, Object>> products = new ArrayList<>();
    private final List<Map<String, Object>> quotes = new ArrayList<>();
    private final List<Map<String, Object>> tickets = new ArrayList<>();
    private final Map<String, List<Map<String, Object>>> ticketMessages = new LinkedHashMap<>();
    private final List<Map<String, Object>> knowledgeSources = new ArrayList<>();
    private final List<Map<String, Object>> knowledgeArticles = new ArrayList<>();
    private final List<Map<String, Object>> escalations = new ArrayList<>();
    private final List<Map<String, Object>> automations = new ArrayList<>();
    private final List<Map<String, Object>> automationRuns = new ArrayList<>();
    private final List<Map<String, Object>> auditLogs = new ArrayList<>();

    public SoftwareTenantAdminV1Controller() {
        initSoftwareTenantData();
    }

    private void initSoftwareTenantData() {
        // 1. Tenant Profile
        tenantProfile.put("tenantId", "TEN-IT-001");
        tenantProfile.put("tenantName", "Zenelait Software Solutions Pvt. Ltd.");
        tenantProfile.put("industry", "SOFTWARE_IT");
        tenantProfile.put("defaultCurrency", "INR");
        tenantProfile.put("contactEmail", "admin@abctech.com");
        tenantProfile.put("slaTargetFirstResponseMinutes", 30);
        tenantProfile.put("slaTargetResolutionHours", 8);

        // 2. Users (Sales Executives & Support Agents)
        users.add(new LinkedHashMap<>(Map.of(
                "userId", "USR-SE-001",
                "name", "Arun Kumar",
                "email", "arun@example.com",
                "role", "SALES_EXECUTIVE",
                "status", "ACTIVE",
                "assignedLeads", 32,
                "openOpportunities", 8,
                "followUpsDue", 4
        )));
        users.add(new LinkedHashMap<>(Map.of(
                "userId", "USR-SE-002",
                "name", "Priya Devi",
                "email", "priya@example.com",
                "role", "SALES_EXECUTIVE",
                "status", "ACTIVE",
                "assignedLeads", 28,
                "openOpportunities", 6,
                "followUpsDue", 2
        )));
        users.add(new LinkedHashMap<>(Map.of(
                "userId", "USR-SA-001",
                "name", "Meena Raj",
                "email", "meena@example.com",
                "role", "SUPPORT_AGENT",
                "status", "ACTIVE",
                "assignedTickets", 18,
                "resolvedToday", 7,
                "slaComplianceRate", 96.5
        )));
        users.add(new LinkedHashMap<>(Map.of(
                "userId", "USR-SA-002",
                "name", "Kiran Verma",
                "email", "kiran@example.com",
                "role", "SUPPORT_AGENT",
                "status", "ACTIVE",
                "assignedTickets", 14,
                "resolvedToday", 5,
                "slaComplianceRate", 93.0
        )));

        // 3. Contacts
        contacts.add(new LinkedHashMap<>(Map.of(
                "contactId", "CON-1001",
                "name", "Karthik Raj",
                "companyName", "ABC Technologies",
                "email", "karthik@abctech.example",
                "phone", "+919876543210",
                "title", "VP of Engineering",
                "status", "ACTIVE"
        )));

        // 4. Products / Services Catalogue
        products.add(new LinkedHashMap<>(Map.of(
                "productId", "PRD-3001",
                "name", "Enterprise CRM Development",
                "code", "SVC-CRM-001",
                "category", "SOFTWARE_DEVELOPMENT",
                "description", "Custom enterprise CRM development service",
                "unitPrice", 500000.0,
                "currency", "INR",
                "billingType", "PROJECT",
                "active", true
        )));
        products.add(new LinkedHashMap<>(Map.of(
                "productId", "PRD-3002",
                "name", "HRMS Pro SaaS Suite",
                "code", "SaaS-HRMS-002",
                "category", "CLOUD_SAAS",
                "description", "Full payroll, attendance and performance management",
                "unitPrice", 85000.0,
                "currency", "INR",
                "billingType", "ANNUAL_SUBSCRIPTION",
                "active", true
        )));

        // 5. Quotations
        Map<String, Object> q1 = new LinkedHashMap<>();
        q1.put("quoteId", "QUO-4001");
        q1.put("quotationNumber", "QUO-4001");
        q1.put("leadId", "LEAD-1001");
        q1.put("opportunityId", "OPP-2001");
        q1.put("clientName", "ABC Technologies (Karthik Raj)");
        q1.put("currency", "INR");
        q1.put("subtotal", 500000.0);
        q1.put("discountAmount", 25000.0);
        q1.put("totalAmount", 475000.0);
        q1.put("status", "PENDING_APPROVAL");
        q1.put("validUntil", "2026-11-30");
        q1.put("ownerId", "USR-SE-001");
        q1.put("createdAt", "2026-10-24T12:00:00+05:30");
        quotes.add(q1);

        // 6. Tickets
        Map<String, Object> t1 = new LinkedHashMap<>();
        t1.put("ticketId", "TKT-8001");
        t1.put("customerId", "CUS-9001");
        t1.put("customerName", "Ravi Kumar");
        t1.put("companyName", "TechNova Systems Ltd");
        t1.put("subject", "Unable to log in to the customer portal");
        t1.put("description", "Customer receives an authentication error after entering valid credentials.");
        t1.put("category", "AUTHENTICATION");
        t1.put("priority", "HIGH");
        t1.put("status", "OPEN");
        t1.put("assignedTo", "USR-SA-001");
        t1.put("slaDueAt", "2026-10-24T15:30:00+05:30");
        t1.put("createdAt", "2026-10-24T11:00:00+05:30");
        tickets.add(t1);

        List<Map<String, Object>> t1Msgs = new ArrayList<>();
        t1Msgs.add(Map.of(
                "messageId", "MSG-8201",
                "ticketId", "TKT-8001",
                "messageType", "INTERNAL_NOTE",
                "body", "Check the authentication service logs and confirm whether the issue affects multiple users.",
                "createdBy", "USR-SPM-001",
                "createdAt", "2026-10-24T11:15:00+05:30"
        ));
        t1Msgs.add(Map.of(
                "messageId", "MSG-8202",
                "ticketId", "TKT-8001",
                "messageType", "PUBLIC_REPLY",
                "body", "Hello Ravi, we are investigating the login issue. Please confirm whether you see an error code.",
                "deliveryStatus", "DELIVERED",
                "createdBy", "USR-SA-001",
                "createdAt", "2026-10-24T11:30:00+05:30"
        ));
        ticketMessages.put("TKT-8001", t1Msgs);

        // 7. Knowledge Base
        knowledgeSources.add(new LinkedHashMap<>(Map.of(
                "sourceId", "KB-8301",
                "name", "Customer Portal Troubleshooting",
                "sourceType", "URL",
                "sourceUri", "https://docs.zenelait.ai/portal/troubleshooting",
                "status", "ACTIVE",
                "articleCount", 12
        )));

        knowledgeArticles.add(new LinkedHashMap<>(Map.of(
                "articleId", "KB-ART-001",
                "title", "Customer Portal Login Troubleshooting",
                "summary", "Approved troubleshooting steps for common portal login and JWT token expiration errors.",
                "sourceId", "KB-8301",
                "relevanceScore", 0.94,
                "content", "1. Verify SSO SAML configuration. 2. Clear browser cookies. 3. Check IAM user status in Zenelait Directory."
        )));

        // 8. Automations
        automations.add(new LinkedHashMap<>(Map.of(
                "automationId", "AUT-5001",
                "name", "New Lead Follow-up",
                "triggerEvent", "LEAD_CREATED",
                "status", "ACTIVE",
                "createdBy", "USR-SM-001"
        )));

        automationRuns.add(new LinkedHashMap<>(Map.of(
                "runId", "RUN-1001",
                "automationId", "AUT-5001",
                "name", "New Lead Follow-up",
                "trigger", "LEAD-1001 created",
                "status", "SUCCESS",
                "executedAt", "2026-10-24T12:05:00+05:30"
        )));

        // 9. Audit Logs
        auditLogs.add(new LinkedHashMap<>(Map.of(
                "logId", "AUD-1001",
                "action", "LEAD_ASSIGNMENT",
                "actor", "USR-SM-001",
                "details", "Assigned LEAD-1001 to Arun Kumar",
                "timestamp", "2026-10-24T12:00:00+05:30"
        )));
    }

    private Map<String, Object> envelope(String message, Object data, String reqId) {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", true);
        resp.put("message", message);
        resp.put("data", data);
        resp.put("timestamp", LocalDateTime.now().toString());
        resp.put("requestId", reqId != null ? reqId : "req_" + System.currentTimeMillis() % 100000);
        return resp;
    }

    // =========================================================================
    // 1. DASHBOARD & TENANT SUMMARY
    // =========================================================================

    @GetMapping("/tenant")
    public ResponseEntity<Map<String, Object>> getTenantProfile() {
        return ResponseEntity.ok(envelope("Company details retrieved", tenantProfile, "req_ten_001"));
    }

    @GetMapping("/dashboard/summary")
    public ResponseEntity<Map<String, Object>> getDashboardSummary(
            @RequestParam(required = false) String period,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String role
    ) {
        if ("SUPPORT".equalsIgnoreCase(department) || "SUPPORT_MANAGER".equalsIgnoreCase(role)) {
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("totalOpenTickets", 156);
            data.put("newTicketsToday", 24);
            data.put("unassignedTickets", 12);
            data.put("inProgressTickets", 86);
            data.put("pendingCustomerResponse", 30);
            data.put("escalatedTickets", 8);
            data.put("overdueTickets", 6);
            data.put("resolvedToday", 38);
            data.put("activeSupportAgents", 8);
            data.put("slaCompliancePercent", 94.5);
            data.put("averageFirstResponseMinutes", 18);
            data.put("customerSatisfactionPercent", 91.2);
            return ResponseEntity.ok(envelope("Support dashboard retrieved", data, "req_spm_001"));
        }

        if ("SUPPORT_AGENT".equalsIgnoreCase(role)) {
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("myOpenTickets", 18);
            data.put("newAssignedToday", 5);
            data.put("inProgressTickets", 10);
            data.put("waitingForCustomer", 3);
            data.put("slaDueSoon", 4);
            data.put("overdueTickets", 1);
            data.put("resolvedToday", 7);
            data.put("unreadConversations", 3);
            data.put("pendingTasks", 5);
            return ResponseEntity.ok(envelope("Personal support dashboard retrieved", data, "req_sa_001"));
        }

        if ("SALES_EXECUTIVE".equalsIgnoreCase(role)) {
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("myLeads", 32);
            data.put("newLeads", 7);
            data.put("qualifiedLeads", 12);
            data.put("openOpportunities", 8);
            data.put("followUpsDueToday", 4);
            data.put("overdueTasks", 2);
            data.put("quotationsPending", 3);
            data.put("wonDealsThisMonth", 4);
            data.put("revenueWonThisMonth", 650000);
            data.put("currency", "INR");
            return ResponseEntity.ok(envelope("Personal dashboard retrieved", data, "req_se_001"));
        }

        if ("MARKETING".equalsIgnoreCase(department) || "MARKETING_MANAGER".equalsIgnoreCase(role)) {
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("activeCampaigns", 8);
            data.put("scheduledCampaigns", 3);
            data.put("leadsGenerated", 420);
            data.put("marketingQualifiedLeads", 125);
            data.put("campaignSpend", 150000);
            data.put("attributedPipelineValue", 1800000);
            data.put("emailDeliveryRate", 97.5);
            data.put("emailClickRate", 4.8);
            data.put("unsubscribeCount", 12);
            data.put("topSource", "WEBSITE");
            data.put("currency", "INR");
            return ResponseEntity.ok(envelope("Marketing dashboard retrieved", data, "req_mkt_001"));
        }

        if ("ANALYTICS".equalsIgnoreCase(department) || "ANALYST".equalsIgnoreCase(role)) {
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("totalLeads", 420);
            data.put("qualifiedLeads", 125);
            data.put("opportunitiesCreated", 64);
            data.put("opportunitiesWon", 12);
            data.put("pipelineValue", 4200000);
            data.put("wonRevenue", 1250000);
            data.put("marketingQualifiedLeads", 125);
            data.put("supportTicketsCreated", 820);
            data.put("supportTicketsResolved", 775);
            data.put("aiConversations", 1450);
            data.put("aiHumanHandoffs", 135);
            data.put("currency", "INR");
            return ResponseEntity.ok(envelope("Analytics dashboard retrieved", data, "req_an_001"));
        }

        // Default: Sales Manager Dashboard
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("period", period != null ? period : "THIS_MONTH");
        data.put("totalLeads", 240);
        data.put("newLeads", 45);
        data.put("assignedLeads", 210);
        data.put("unassignedLeads", 30);
        data.put("openOpportunities", 64);
        data.put("quotationValue", 1250000);
        data.put("wonDeals", 12);
        data.put("lostDeals", 4);
        data.put("conversionRate", 18.75);
        data.put("followUpsDueToday", 18);
        data.put("activeSalesExecutives", 6);
        return ResponseEntity.ok(envelope("Dashboard summary retrieved", data, "req_sm_001"));
    }

    @GetMapping("/dashboard/activity")
    public ResponseEntity<Map<String, Object>> getDashboardActivity() {
        List<Map<String, Object>> acts = new ArrayList<>();
        acts.add(Map.of("id", "act-1", "title", "Lead Assigned", "description", "Karthik Raj assigned to Arun Kumar", "time", "15m ago", "type", "LEAD"));
        acts.add(Map.of("id", "act-2", "title", "Quote Submitted", "description", "QUO-4001 submitted for approval by Arun Kumar", "time", "35m ago", "type", "QUOTE"));
        acts.add(Map.of("id", "act-3", "title", "Ticket Escalated", "description", "TKT-8001 escalated by Meena Raj (Auth Timeout)", "time", "1h ago", "type", "TICKET"));
        acts.add(Map.of("id", "act-4", "title", "Deal Won", "description", "Apex Cloud migration deal ₹5,00,000 signed", "time", "2h ago", "type", "DEAL"));
        return ResponseEntity.ok(envelope("Recent activity retrieved", acts, "req_act_001"));
    }

    // =========================================================================
    // 2. USERS (SALES & SUPPORT ROSTERS)
    // =========================================================================

    @GetMapping("/users")
    public ResponseEntity<Map<String, Object>> getUsers(
            @RequestParam(required = false) String role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        List<Map<String, Object>> filtered = users;
        if (role != null && !role.trim().isEmpty()) {
            filtered = users.stream().filter(u -> role.equalsIgnoreCase((String) u.get("role"))).toList();
        }

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", filtered);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", filtered.size());

        return ResponseEntity.ok(envelope("Users retrieved", data, "req_usr_001"));
    }

    // =========================================================================
    // 3. CONTACTS & PRODUCTS
    // =========================================================================

    @GetMapping("/contacts")
    public ResponseEntity<Map<String, Object>> getContacts() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", contacts);
        data.put("totalElements", contacts.size());
        return ResponseEntity.ok(envelope("Contacts retrieved", data, "req_con_001"));
    }

    @PostMapping("/contacts")
    public ResponseEntity<Map<String, Object>> createContact(@RequestBody Map<String, Object> body) {
        Map<String, Object> c = new LinkedHashMap<>(body);
        c.put("contactId", "CON-" + (1000 + contacts.size() + 1));
        c.putIfAbsent("status", "ACTIVE");
        contacts.add(0, c);
        return ResponseEntity.status(HttpStatus.CREATED).body(envelope("Contact created successfully", c, "req_con_002"));
    }

    @PatchMapping("/contacts/{contactId}")
    public ResponseEntity<Map<String, Object>> updateContact(@PathVariable String contactId, @RequestBody Map<String, Object> updates) {
        Map<String, Object> found = contacts.stream().filter(c -> contactId.equals(c.get("contactId"))).findFirst().orElse(null);
        if (found != null) {
            found.putAll(updates);
            return ResponseEntity.ok(envelope("Contact updated", found, "req_con_003"));
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/products")
    public ResponseEntity<Map<String, Object>> getProducts() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", products);
        data.put("totalElements", products.size());
        return ResponseEntity.ok(envelope("Products catalogue retrieved", data, "req_prd_001"));
    }

    @PostMapping("/products")
    public ResponseEntity<Map<String, Object>> createProduct(@RequestBody Map<String, Object> body) {
        Map<String, Object> p = new LinkedHashMap<>(body);
        p.put("productId", "PRD-" + (3000 + products.size() + 1));
        products.add(0, p);
        return ResponseEntity.status(HttpStatus.CREATED).body(envelope("Product created successfully", p, "req_prd_002"));
    }

    @PatchMapping("/products/{productId}")
    public ResponseEntity<Map<String, Object>> updateProduct(@PathVariable String productId, @RequestBody Map<String, Object> updates) {
        Map<String, Object> found = products.stream().filter(p -> productId.equals(p.get("productId"))).findFirst().orElse(null);
        if (found != null) {
            found.putAll(updates);
            return ResponseEntity.ok(envelope("Product updated", found, "req_prd_003"));
        }
        return ResponseEntity.notFound().build();
    }

    // =========================================================================
    // 4. QUOTATIONS
    // =========================================================================

    @GetMapping("/quotes")
    public ResponseEntity<Map<String, Object>> getQuotes(@RequestParam(required = false) String owner) {
        List<Map<String, Object>> result = quotes;
        if ("me".equalsIgnoreCase(owner)) {
            result = quotes.stream().filter(q -> "USR-SE-001".equals(q.get("ownerId"))).toList();
        }
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", result);
        data.put("totalElements", result.size());
        return ResponseEntity.ok(envelope("Quotations retrieved", data, "req_quo_001"));
    }

    @PostMapping("/quotes")
    public ResponseEntity<Map<String, Object>> createQuote(@RequestBody Map<String, Object> body) {
        String quoteId = "QUO-" + (4000 + quotes.size() + 1);
        double subtotal = 0.0;
        double discountAmount = 0.0;

        List<Map<String, Object>> items = (List<Map<String, Object>>) body.get("items");
        if (items != null) {
            for (Map<String, Object> itm : items) {
                double qty = itm.get("quantity") != null ? ((Number) itm.get("quantity")).doubleValue() : 1.0;
                double rate = itm.get("unitPrice") != null ? ((Number) itm.get("unitPrice")).doubleValue() : 0.0;
                double discPct = itm.get("discountPercent") != null ? ((Number) itm.get("discountPercent")).doubleValue() : 0.0;
                double itemSub = qty * rate;
                subtotal += itemSub;
                discountAmount += (itemSub * discPct / 100.0);
            }
        } else {
            subtotal = body.get("subtotal") != null ? ((Number) body.get("subtotal")).doubleValue() : 500000.0;
            discountAmount = body.get("discountAmount") != null ? ((Number) body.get("discountAmount")).doubleValue() : 25000.0;
        }

        double totalAmount = subtotal - discountAmount;

        Map<String, Object> q = new LinkedHashMap<>(body);
        q.put("quoteId", quoteId);
        q.put("quotationNumber", quoteId);
        q.put("subtotal", subtotal);
        q.put("discountAmount", discountAmount);
        q.put("totalAmount", totalAmount);
        q.put("currency", body.getOrDefault("currency", "INR"));
        q.put("status", "DRAFT");
        q.put("validUntil", body.getOrDefault("validUntil", "2026-11-30"));
        q.put("createdAt", LocalDateTime.now().toString());

        quotes.add(0, q);
        return ResponseEntity.status(HttpStatus.CREATED).body(envelope("Quotation draft created", q, "req_sm_008"));
    }

    @GetMapping("/quotes/{quoteId}")
    public ResponseEntity<Map<String, Object>> getQuote(@PathVariable String quoteId) {
        Map<String, Object> found = quotes.stream().filter(q -> quoteId.equals(q.get("quoteId"))).findFirst().orElse(null);
        if (found != null) {
            return ResponseEntity.ok(envelope("Quotation retrieved", found, "req_quo_002"));
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/quotes/{quoteId}/submit-for-approval")
    public ResponseEntity<Map<String, Object>> submitQuoteForApproval(@PathVariable String quoteId, @RequestBody(required = false) Map<String, Object> body) {
        Map<String, Object> found = quotes.stream().filter(q -> quoteId.equals(q.get("quoteId"))).findFirst().orElse(null);
        if (found != null) {
            found.put("status", "PENDING_APPROVAL");
            found.put("submittedAt", LocalDateTime.now().toString());
            found.put("submittedBy", "USR-SE-001");
            return ResponseEntity.ok(envelope("Quotation submitted for approval", found, "req_sm_009"));
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/quotes/{quoteId}/approve")
    public ResponseEntity<Map<String, Object>> approveQuote(@PathVariable String quoteId, @RequestBody(required = false) Map<String, Object> body) {
        Map<String, Object> found = quotes.stream().filter(q -> quoteId.equals(q.get("quoteId"))).findFirst().orElse(null);
        if (found != null) {
            found.put("status", "APPROVED");
            found.put("approvedAt", LocalDateTime.now().toString());
            found.put("approvedBy", "USR-SM-001");
            return ResponseEntity.ok(envelope("Quotation approved", found, "req_sm_010"));
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/quotes/{quoteId}/reject")
    public ResponseEntity<Map<String, Object>> rejectQuote(@PathVariable String quoteId, @RequestBody(required = false) Map<String, Object> body) {
        Map<String, Object> found = quotes.stream().filter(q -> quoteId.equals(q.get("quoteId"))).findFirst().orElse(null);
        if (found != null) {
            found.put("status", "REJECTED");
            found.put("rejectedReason", body != null ? body.get("reason") : "Discount exceeds threshold");
            return ResponseEntity.ok(envelope("Quotation rejected", found, "req_quo_003"));
        }
        return ResponseEntity.notFound().build();
    }

    // =========================================================================
    // 5. TICKETS (SUPPORT MANAGER & SUPPORT AGENT)
    // =========================================================================

    @GetMapping("/tickets")
    public ResponseEntity<Map<String, Object>> getTickets(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String assignee,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        List<Map<String, Object>> filtered = new ArrayList<>(tickets);
        if (status != null && !status.trim().isEmpty()) {
            filtered = filtered.stream().filter(t -> status.equalsIgnoreCase((String) t.get("status"))).toList();
        }
        if (priority != null && !priority.trim().isEmpty()) {
            filtered = filtered.stream().filter(t -> priority.equalsIgnoreCase((String) t.get("priority"))).toList();
        }
        if ("me".equalsIgnoreCase(assignee)) {
            filtered = filtered.stream().filter(t -> "USR-SA-001".equals(t.get("assignedTo"))).toList();
        }

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", filtered);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", filtered.size());

        return ResponseEntity.ok(envelope("Support tickets retrieved", data, "req_spm_002"));
    }

    @PostMapping("/tickets")
    public ResponseEntity<Map<String, Object>> createTicket(@RequestBody Map<String, Object> body) {
        String ticketId = "TKT-" + (8000 + tickets.size() + 1);
        String prio = (String) body.getOrDefault("priority", "MEDIUM");

        // SLA calculation: HIGH/CRITICAL = 2 hours, MEDIUM = 4 hours, LOW = 8 hours
        int slaHours = "CRITICAL".equalsIgnoreCase(prio) || "HIGH".equalsIgnoreCase(prio) ? 2 : 6;
        String slaDueAt = LocalDateTime.now().plusHours(slaHours).toString();

        Map<String, Object> t = new LinkedHashMap<>(body);
        t.put("ticketId", ticketId);
        t.put("status", "OPEN");
        t.put("priority", prio);
        t.put("slaDueAt", slaDueAt);
        t.put("createdAt", LocalDateTime.now().toString());

        tickets.add(0, t);
        return ResponseEntity.status(HttpStatus.CREATED).body(envelope("Support ticket created", t, "req_spm_003"));
    }

    @GetMapping("/tickets/{ticketId}")
    public ResponseEntity<Map<String, Object>> getTicket(@PathVariable String ticketId) {
        Map<String, Object> found = tickets.stream().filter(t -> ticketId.equals(t.get("ticketId"))).findFirst().orElse(null);
        if (found != null) {
            return ResponseEntity.ok(envelope("Ticket retrieved", found, "req_tkt_001"));
        }
        return ResponseEntity.notFound().build();
    }

    @PatchMapping("/tickets/{ticketId}")
    public ResponseEntity<Map<String, Object>> updateTicket(@PathVariable String ticketId, @RequestBody Map<String, Object> updates) {
        Map<String, Object> found = tickets.stream().filter(t -> ticketId.equals(t.get("ticketId"))).findFirst().orElse(null);
        if (found != null) {
            found.putAll(updates);
            found.put("updatedAt", LocalDateTime.now().toString());
            found.put("updatedBy", "USR-SA-001");
            return ResponseEntity.ok(envelope("Ticket updated", found, "req_sa_003"));
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/tickets/{ticketId}/assign")
    public ResponseEntity<Map<String, Object>> assignTicket(@PathVariable String ticketId, @RequestBody Map<String, Object> body) {
        Map<String, Object> found = tickets.stream().filter(t -> ticketId.equals(t.get("ticketId"))).findFirst().orElse(null);
        if (found != null) {
            String assignee = (String) body.get("assigneeUserId");
            found.put("assignedTo", assignee != null ? assignee : "USR-SA-001");
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("ticketId", ticketId);
            data.put("assignedTo", Map.of("userId", assignee, "name", "Meena Raj"));
            data.put("assignedBy", "USR-SPM-001");
            data.put("status", "OPEN");
            data.put("assignedAt", LocalDateTime.now().toString());
            return ResponseEntity.ok(envelope("Ticket assigned successfully", data, "req_spm_004"));
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/tickets/{ticketId}/escalate")
    public ResponseEntity<Map<String, Object>> escalateTicket(@PathVariable String ticketId, @RequestBody Map<String, Object> body) {
        Map<String, Object> found = tickets.stream().filter(t -> ticketId.equals(t.get("ticketId"))).findFirst().orElse(null);
        if (found != null) {
            found.put("status", "ESCALATED");
            String escId = "ESC-" + (8100 + escalations.size() + 1);

            Map<String, Object> esc = new LinkedHashMap<>(body);
            esc.put("escalationId", escId);
            esc.put("ticketId", ticketId);
            esc.put("status", "ESCALATED");
            esc.put("escalatedAt", LocalDateTime.now().toString());
            escalations.add(0, esc);

            return ResponseEntity.ok(envelope("Ticket escalated successfully", esc, "req_spm_005"));
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/tickets/{ticketId}/resolve")
    public ResponseEntity<Map<String, Object>> resolveTicket(@PathVariable String ticketId, @RequestBody(required = false) Map<String, Object> body) {
        Map<String, Object> found = tickets.stream().filter(t -> ticketId.equals(t.get("ticketId"))).findFirst().orElse(null);
        if (found != null) {
            found.put("status", "RESOLVED");
            found.put("resolvedAt", LocalDateTime.now().toString());
            found.put("resolvedBy", "USR-SA-001");
            found.put("resolutionNotes", body != null ? body.get("resolutionNotes") : "Issue resolved");
            return ResponseEntity.ok(envelope("Ticket resolved", found, "req_sa_008"));
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/tickets/{ticketId}/reopen")
    public ResponseEntity<Map<String, Object>> reopenTicket(@PathVariable String ticketId, @RequestBody(required = false) Map<String, Object> body) {
        Map<String, Object> found = tickets.stream().filter(t -> ticketId.equals(t.get("ticketId"))).findFirst().orElse(null);
        if (found != null) {
            found.put("status", "OPEN");
            return ResponseEntity.ok(envelope("Ticket reopened", found, "req_tkt_002"));
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/tickets/{ticketId}/messages")
    public ResponseEntity<Map<String, Object>> getTicketMessages(@PathVariable String ticketId) {
        List<Map<String, Object>> msgs = ticketMessages.getOrDefault(ticketId, new ArrayList<>());
        return ResponseEntity.ok(envelope("Ticket messages retrieved", msgs, "req_msg_001"));
    }

    @PostMapping("/tickets/{ticketId}/messages")
    public ResponseEntity<Map<String, Object>> addTicketMessage(@PathVariable String ticketId, @RequestBody Map<String, Object> body) {
        String msgId = "MSG-" + (8200 + System.currentTimeMillis() % 1000);
        String msgType = (String) body.getOrDefault("messageType", "PUBLIC_REPLY");

        Map<String, Object> msg = new LinkedHashMap<>();
        msg.put("messageId", msgId);
        msg.put("ticketId", ticketId);
        msg.put("messageType", msgType);
        msg.put("body", body.get("body"));
        msg.put("deliveryStatus", "INTERNAL_NOTE".equals(msgType) ? "LOCAL" : "QUEUED");
        msg.put("createdBy", "USR-SA-001");
        msg.put("createdAt", LocalDateTime.now().toString());

        ticketMessages.computeIfAbsent(ticketId, k -> new ArrayList<>()).add(msg);

        return ResponseEntity.ok(envelope("INTERNAL_NOTE".equals(msgType) ? "Internal note added" : "Customer reply accepted", msg, "req_sa_004"));
    }

    // =========================================================================
    // 6. KNOWLEDGE BASE
    // =========================================================================

    @GetMapping("/knowledge-sources")
    public ResponseEntity<Map<String, Object>> getKnowledgeSources() {
        return ResponseEntity.ok(envelope("Knowledge sources retrieved", knowledgeSources, "req_kb_001"));
    }

    @PostMapping("/knowledge-sources")
    public ResponseEntity<Map<String, Object>> createKnowledgeSource(@RequestBody Map<String, Object> body) {
        Map<String, Object> kb = new LinkedHashMap<>(body);
        kb.put("sourceId", "KB-" + (8300 + knowledgeSources.size() + 1));
        kb.put("status", "PENDING_SYNC");
        kb.put("createdBy", "USR-SPM-001");
        knowledgeSources.add(0, kb);
        return ResponseEntity.status(HttpStatus.CREATED).body(envelope("Knowledge source created", kb, "req_spm_007"));
    }

    @PostMapping("/knowledge-sources/{sourceId}/sync")
    public ResponseEntity<Map<String, Object>> syncKnowledgeSource(@PathVariable String sourceId) {
        Map<String, Object> res = Map.of("sourceId", sourceId, "syncJobId", "SYNC-" + sourceId, "status", "QUEUED");
        return ResponseEntity.ok(envelope("Knowledge synchronization queued", res, "req_spm_008"));
    }

    @GetMapping("/knowledge/search")
    public ResponseEntity<Map<String, Object>> searchKnowledge(@RequestParam(required = false, defaultValue = "") String q) {
        List<Map<String, Object>> results = knowledgeArticles;
        if (!q.trim().isEmpty()) {
            results = knowledgeArticles.stream()
                    .filter(a -> a.get("title").toString().toLowerCase().contains(q.toLowerCase())
                            || a.get("summary").toString().toLowerCase().contains(q.toLowerCase()))
                    .toList();
        }
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("results", results);
        data.put("totalElements", results.size());
        return ResponseEntity.ok(envelope("Knowledge search completed", data, "req_sa_006"));
    }

    // =========================================================================
    // 7. AI ASSISTANCE & ESCALATIONS
    // =========================================================================

    @PostMapping("/ai/sales-assist")
    public ResponseEntity<Map<String, Object>> salesAssist(@RequestBody Map<String, Object> body) {
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("suggestion", "Send a concise software proposal summary detailing enterprise SLA, 24-month roadmap and cloud staging environment. Ask whether the customer would like a 30-min technical architecture review meeting.");
        res.put("recommendedNextAction", "SCHEDULE_MEETING");
        res.put("requiresHumanReview", true);
        return ResponseEntity.ok(envelope("Sales assistance generated", res, "req_se_009"));
    }

    @PostMapping("/ai/support-assist")
    public ResponseEntity<Map<String, Object>> supportAssist(@RequestBody Map<String, Object> body) {
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("suggestions", List.of(
                "Confirm the exact error message and whether customer is accessing through custom corporate SAML SSO.",
                "Review the approved authentication-service troubleshooting guide (KB-ART-001).",
                "Check whether the issue affects single user or tenant-wide active directory sync.",
                "Escalate to technical DevOps if token signing certificate needs rotation."
        ));
        res.put("sourceArticleIds", List.of("KB-ART-001"));
        res.put("requiresHumanReview", true);
        return ResponseEntity.ok(envelope("Troubleshooting suggestions generated", res, "req_sa_007"));
    }

    @GetMapping("/ai/escalations")
    public ResponseEntity<Map<String, Object>> getEscalations() {
        return ResponseEntity.ok(envelope("AI escalations retrieved", escalations, "req_esc_001"));
    }

    @PostMapping("/ai/escalations")
    public ResponseEntity<Map<String, Object>> createAiEscalation(@RequestBody Map<String, Object> body) {
        Map<String, Object> esc = new LinkedHashMap<>(body);
        esc.put("escalationId", "ESC-" + (8100 + escalations.size() + 1));
        esc.put("status", "ESCALATED");
        esc.put("createdAt", LocalDateTime.now().toString());
        escalations.add(0, esc);
        return ResponseEntity.ok(envelope("AI escalation logged", esc, "req_esc_002"));
    }

    @PostMapping("/ai/escalations/{escalationId}/assign")
    public ResponseEntity<Map<String, Object>> assignEscalation(@PathVariable String escalationId, @RequestBody Map<String, Object> body) {
        Map<String, Object> found = escalations.stream().filter(e -> escalationId.equals(e.get("escalationId"))).findFirst().orElse(null);
        if (found != null) {
            found.put("assignedTo", body.get("assigneeUserId"));
            found.put("status", "IN_PROGRESS");
            return ResponseEntity.ok(envelope("Escalation assigned", found, "req_esc_003"));
        }
        return ResponseEntity.notFound().build();
    }

    // =========================================================================
    // 8. AUTOMATIONS & AUDIT LOGS
    // =========================================================================

    @GetMapping("/automations")
    public ResponseEntity<Map<String, Object>> getAutomations() {
        return ResponseEntity.ok(envelope("Automations retrieved", automations, "req_aut_001"));
    }

    @PostMapping("/automations")
    public ResponseEntity<Map<String, Object>> createAutomation(@RequestBody Map<String, Object> body) {
        Map<String, Object> aut = new LinkedHashMap<>(body);
        aut.put("automationId", "AUT-" + (5000 + automations.size() + 1));
        aut.put("status", "DRAFT");
        aut.put("createdBy", "USR-SM-001");
        automations.add(0, aut);
        return ResponseEntity.status(HttpStatus.CREATED).body(envelope("Automation created in draft mode", aut, "req_sm_011"));
    }

    @PostMapping("/automations/{automationId}/activate")
    public ResponseEntity<Map<String, Object>> activateAutomation(@PathVariable String automationId) {
        Map<String, Object> found = automations.stream().filter(a -> automationId.equals(a.get("automationId"))).findFirst().orElse(null);
        if (found != null) {
            found.put("status", "ACTIVE");
            return ResponseEntity.ok(envelope("Automation activated", found, "req_sm_012"));
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/automations/{automationId}/pause")
    public ResponseEntity<Map<String, Object>> pauseAutomation(@PathVariable String automationId) {
        Map<String, Object> found = automations.stream().filter(a -> automationId.equals(a.get("automationId"))).findFirst().orElse(null);
        if (found != null) {
            found.put("status", "PAUSED");
            return ResponseEntity.ok(envelope("Automation paused", found, "req_aut_002"));
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/automation-runs")
    public ResponseEntity<Map<String, Object>> getAutomationRuns() {
        return ResponseEntity.ok(envelope("Automation runs retrieved", automationRuns, "req_run_001"));
    }

    // =========================================================================
    // 9. REPORTS
    // =========================================================================

    @GetMapping("/reports/sales")
    public ResponseEntity<Map<String, Object>> getSalesReport() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("from", "2026-10-01");
        data.put("to", "2026-10-24");
        data.put("currency", "INR");
        data.put("team", List.of(
                Map.of("userId", "USR-SE-001", "name", "Arun Kumar", "leadsAssigned", 32, "opportunitiesWon", 4, "revenueWon", 650000, "activitiesCompleted", 48),
                Map.of("userId", "USR-SE-002", "name", "Priya Devi", "leadsAssigned", 28, "opportunitiesWon", 3, "revenueWon", 420000, "activitiesCompleted", 40)
        ));
        return ResponseEntity.ok(envelope("Sales report retrieved", data, "req_sm_014"));
    }

    @GetMapping("/reports/leads")
    public ResponseEntity<Map<String, Object>> getLeadsReport() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("totalLeads", 240);
        data.put("convertedLeads", 45);
        data.put("conversionRate", 18.75);
        data.put("sources", Map.of("WEBSITE", 95, "WHATSAPP", 65, "REFERRAL", 48, "LINKEDIN", 32));
        return ResponseEntity.ok(envelope("Leads report retrieved", data, "req_rep_001"));
    }

    @GetMapping("/reports/activities")
    public ResponseEntity<Map<String, Object>> getActivitiesReport() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("totalCalls", 142);
        data.put("totalEmails", 215);
        data.put("totalDemos", 38);
        data.put("totalProposals", 24);
        return ResponseEntity.ok(envelope("Activity report retrieved", data, "req_rep_002"));
    }

    @GetMapping("/reports/my-performance")
    public ResponseEntity<Map<String, Object>> getMyPerformance(@RequestParam(required = false) String role) {
        if ("SUPPORT_AGENT".equalsIgnoreCase(role)) {
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("ticketsAssigned", 86);
            data.put("ticketsResolved", 72);
            data.put("averageFirstResponseMinutes", 16);
            data.put("averageResolutionHours", 5.4);
            data.put("slaCompliancePercent", 96.5);
            data.put("customerSatisfactionPercent", 92.0);
            return ResponseEntity.ok(envelope("Personal support performance retrieved", data, "req_sa_010"));
        }

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("leadsAssigned", 32);
        data.put("leadsContacted", 25);
        data.put("qualifiedLeads", 12);
        data.put("opportunitiesWon", 4);
        data.put("revenueWon", 650000);
        data.put("activitiesCompleted", 48);
        data.put("currency", "INR");
        return ResponseEntity.ok(envelope("Personal performance retrieved", data, "req_se_010"));
    }

    @GetMapping("/reports/support")
    public ResponseEntity<Map<String, Object>> getSupportReport() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("totalTicketsHandled", 480);
        data.put("resolvedTickets", 442);
        data.put("avgResolutionHours", 4.8);
        data.put("agentWorkload", List.of(
                Map.of("agentName", "Meena Raj", "activeTickets", 18, "resolved", 72),
                Map.of("agentName", "Kiran Verma", "activeTickets", 14, "resolved", 64)
        ));
        return ResponseEntity.ok(envelope("Support report retrieved", data, "req_rep_003"));
    }

    @GetMapping("/reports/sla")
    public ResponseEntity<Map<String, Object>> getSlaReport() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("totalTickets", 820);
        data.put("ticketsWithinSla", 775);
        data.put("ticketsBreachedSla", 45);
        data.put("slaCompliancePercent", 94.51);
        data.put("byPriority", List.of(
                Map.of("priority", "HIGH", "totalTickets", 150, "breachedTickets", 12),
                Map.of("priority", "MEDIUM", "totalTickets", 420, "breachedTickets", 21),
                Map.of("priority", "LOW", "totalTickets", 250, "breachedTickets", 12)
        ));
        return ResponseEntity.ok(envelope("SLA report retrieved", data, "req_spm_010"));
    }

    @GetMapping("/reports/customer-satisfaction")
    public ResponseEntity<Map<String, Object>> getCsatReport() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("csatScore", 91.2);
        data.put("totalRatingsReceived", 340);
        data.put("fiveStarRatings", 260);
        data.put("fourStarRatings", 52);
        data.put("threeStarOrLess", 28);
        return ResponseEntity.ok(envelope("CSAT report retrieved", data, "req_rep_004"));
    }

    @GetMapping("/reports/marketing")
    public ResponseEntity<Map<String, Object>> getMarketingReport() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("activeCampaigns", 8);
        data.put("leadsGenerated", 420);
        data.put("mqlConversionRate", 29.76);
        data.put("totalSpend", 150000);
        data.put("pipelineAttributed", 1800000);
        data.put("roiMultiplier", 12.0);
        return ResponseEntity.ok(envelope("Marketing performance report retrieved", data, "req_rep_mkt_001"));
    }

    @GetMapping("/reports/campaigns")
    public ResponseEntity<Map<String, Object>> getCampaignsReport(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to
    ) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("period", Map.of("from", from != null ? from : "2026-10-01", "to", to != null ? to : "2026-10-24"));
        data.put("campaigns", List.of(
                Map.of("campaignId", "CAM-1001", "name", "Enterprise CRM Lead Generation", "sent", 220, "delivered", 215, "opened", 120, "clicked", 35, "leadsGenerated", 28, "opportunitiesAttributed", 6, "spend", 15000, "currency", "INR"),
                Map.of("campaignId", "CAM-1002", "name", "Q4 Cloud Modernization Webinar", "sent", 500, "delivered", 488, "opened", 290, "clicked", 95, "leadsGenerated", 45, "opportunitiesAttributed", 8, "spend", 25000, "currency", "INR")
        ));
        return ResponseEntity.ok(envelope("Campaign report retrieved", data, "req_mkt_008"));
    }
}
