package com.zenelait.crm.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

/**
 * Zenelait AI CRM — Ultra Super Admin V1 REST API Controller
 * Provides root platform oversight across all 9 industry tenant verticals:
 * - Common Page Contact Queries & Review (/api/v1/platform/contact-queries)
 * - 1-Click Provisioning of Tenant Workspaces from Queries (/approve)
 * - SaaS Package Settings & Versioning (/api/v1/platform/packages)
 * - Revenue & Financial Ledger Management (/api/v1/platform/revenue)
 * - Cross-Company Tenant Fleet & Quota Management (/api/v1/platform/tenants)
 * - Delegated Impersonation, Security Lockdown & Cloud Backups
 */
@RestController
@RequestMapping("/api/v1/platform")
@CrossOrigin(origins = "*")
public class PlatformAdminV1Controller {

    private final List<Map<String, Object>> contactQueries = new ArrayList<>();
    private final List<Map<String, Object>> packages = new ArrayList<>();
    private final List<Map<String, Object>> packageHistory = new ArrayList<>();
    private final List<Map<String, Object>> tenantsFleet = new ArrayList<>();
    private final List<Map<String, Object>> impersonationSessions = new ArrayList<>();
    private final List<Map<String, Object>> platformInvoices = new ArrayList<>();
    private final List<Map<String, Object>> platformPayments = new ArrayList<>();
    private final List<Map<String, Object>> platformRefunds = new ArrayList<>();
    private final List<Map<String, Object>> platformBackups = new ArrayList<>();

    private boolean isEmergencyLockdown = false;
    private String lockdownScope = "NONE";
    private String lockdownReason = "";

    public PlatformAdminV1Controller() {
        initPlatformData();
    }

    private void initPlatformData() {
        // 1. Initial Contact Queries from Public Landing Page
        contactQueries.add(new LinkedHashMap<>(Map.of(
                "queryId", "QRY-1001",
                "fullName", "Vikram Malhotra",
                "email", "vikram@malhotratech.com",
                "companyName", "Malhotra Cloud Systems",
                "industry", "SOFTWARE_IT",
                "teamSize", "15-50",
                "packageInterest", "Professional (₹7,999/mo)",
                "message", "We need an AI CRM that can automate lead qualification across WhatsApp and integrate with Jira.",
                "submittedAt", "2026-10-22T08:15:00Z",
                "status", "PENDING_REVIEW"
        )));
        contactQueries.add(new LinkedHashMap<>(Map.of(
                "queryId", "QRY-1002",
                "fullName", "Sanjay Singhania",
                "email", "sanjay@greenestate.in",
                "companyName", "Singhania Prime Estates",
                "industry", "REAL_ESTATE",
                "teamSize", "50-200",
                "packageInterest", "Enterprise Sovereign",
                "message", "Interested in automated site visit scheduling and inventory management for 3 new residential townships.",
                "submittedAt", "2026-10-22T10:30:00Z",
                "status", "PENDING_REVIEW"
        )));
        contactQueries.add(new LinkedHashMap<>(Map.of(
                "queryId", "QRY-1003",
                "fullName", "Dr. Meera Nambiar",
                "email", "meera@lotushospitals.org",
                "companyName", "Lotus Multispeciality Clinics",
                "industry", "HEALTHCARE",
                "teamSize", "20-50",
                "packageInterest", "Starter Free Trial",
                "message", "Looking for patient appointment booking bot with WhatsApp reminders.",
                "submittedAt", "2026-10-22T11:45:00Z",
                "status", "APPROVED"
        )));

        // 2. Global Packages (Starter, Growth, Professional, Enterprise)
        packages.add(buildFullPackage(
                "PKG-STARTER", "Starter", "STARTER", "Free entry package for small teams and exploratory trials.",
                0, 0, 0, "INR", 30, 0,
                5, 1, 2000, 5000, 10000, 15, 500, 20000, 2, 2,
                List.of("CRM_DASHBOARD", "LEAD_MANAGEMENT", "AI_SALES_AGENT", "BASIC_REPORTS"),
                List.of("SOFTWARE_IT", "REAL_ESTATE", "HEALTHCARE", "HOSPITALITY", "EDUCATION", "ECOMMERCE", "CONSULTING", "MANUFACTURING", "TRAVEL"),
                "ACTIVE"
        ));
        packages.add(buildFullPackage(
                "PKG-GROWTH", "Growth", "GROWTH", "Designed for accelerating businesses scaling outreach.",
                2999, 8299, 29999, "INR", 14, 0,
                15, 4, 10000, 25000, 50000, 50, 5000, 100000, 5, 4,
                List.of("CRM_DASHBOARD", "LEAD_MANAGEMENT", "AI_SALES_AGENT", "AI_SUPPORT_AGENT", "WHATSAPP", "EMAIL_AUTOMATION", "ADVANCED_REPORTS"),
                List.of("SOFTWARE_IT", "REAL_ESTATE", "HEALTHCARE", "HOSPITALITY", "EDUCATION", "ECOMMERCE", "CONSULTING", "MANUFACTURING", "TRAVEL"),
                "ACTIVE"
        ));
        packages.add(buildFullPackage(
                "PKG-PRO", "Professional", "PROFESSIONAL", "Comprehensive autonomous AI CRM with omnichannel mesh.",
                7999, 21999, 79999, "INR", 14, 0,
                50, 10, 25000, 50000, 100000, 250, 15000, 250000, 10, 8,
                List.of("CRM_DASHBOARD", "LEAD_MANAGEMENT", "AI_SALES_AGENT", "AI_SUPPORT_AGENT", "WHATSAPP", "EMAIL_AUTOMATION", "ADVANCED_REPORTS", "API_ACCESS", "CUSTOM_WORKFLOWS", "PRIORITY_SUPPORT"),
                List.of("SOFTWARE_IT", "REAL_ESTATE", "HEALTHCARE", "HOSPITALITY", "EDUCATION", "ECOMMERCE", "CONSULTING", "MANUFACTURING", "TRAVEL"),
                "ACTIVE"
        ));
        packages.add(buildFullPackage(
                "PKG-ENTERPRISE", "Enterprise Sovereign", "ENTERPRISE", "Dedicated cloud infrastructure, custom LLMs, and unlimited scale.",
                24999, 68999, 249999, "INR", 30, 0,
                200, 36, 100000, 250000, 500000, 1000, 50000, 1000000, 25, 16,
                List.of("CRM_DASHBOARD", "LEAD_MANAGEMENT", "AI_SALES_AGENT", "AI_SUPPORT_AGENT", "WHATSAPP", "EMAIL_AUTOMATION", "ADVANCED_REPORTS", "API_ACCESS", "CUSTOM_WORKFLOWS", "DEDICATED_SUPPORT", "CUSTOM_INTEGRATIONS", "SLA_9999", "CUSTOM_DOMAIN"),
                List.of("SOFTWARE_IT", "REAL_ESTATE", "HEALTHCARE", "HOSPITALITY", "EDUCATION", "ECOMMERCE", "CONSULTING", "MANUFACTURING", "TRAVEL"),
                "ACTIVE"
        ));

        // 3. Initial Fleet Tenants across all 9 industry verticals
        tenantsFleet.add(buildTenant("tenant-1", "ABC Technologies Pvt. Ltd.", "SOFTWARE_IT", "admin@abctech.com", "Sathiyaseelan", "Professional", 18, 50, 48.5, 250, 38500, 100000, "ACTIVE", 7999));
        tenantsFleet.add(buildTenant("tenant-2", "Prestige Skyline Realty", "REAL_ESTATE", "sanjay@skylineproperties.in", "Sanjay Dutt", "Enterprise Sovereign", 42, 200, 185.0, 1000, 84200, 500000, "ACTIVE", 24999));
        tenantsFleet.add(buildTenant("tenant-3", "Apollo Zenith Hospital", "HEALTHCARE", "admin@apollozenith.org", "Dr. Anand Raman", "Professional", 28, 50, 92.4, 250, 51200, 100000, "ACTIVE", 7999));
        tenantsFleet.add(buildTenant("tenant-4", "Grand Heritage Hotel & Resorts", "HOSPITALITY", "gm@grandheritage.com", "Vikramaditya Roy", "Growth", 14, 15, 34.0, 50, 21400, 50000, "ACTIVE", 2999));
        tenantsFleet.add(buildTenant("tenant-5", "St. Jude Global Academy", "EDUCATION", "principal@stjudeglobal.edu", "Dr. Sarah Paul", "Growth", 12, 15, 28.5, 50, 19800, 50000, "ACTIVE", 2999));
        tenantsFleet.add(buildTenant("tenant-6", "UrbanVogue Retail Co.", "ECOMMERCE", "founder@urbanvogue.store", "Rhea Sen", "Professional", 22, 50, 64.2, 250, 47100, 100000, "ACTIVE", 7999));
        tenantsFleet.add(buildTenant("tenant-7", "Apex Stratagem Consulting", "CONSULTING", "partner@apexstratagem.com", "Rohan Mehta", "Professional", 15, 50, 39.8, 250, 31200, 100000, "ACTIVE", 7999));
        tenantsFleet.add(buildTenant("tenant-8", "Bharat Precision Gears", "MANUFACTURING", "ops@bharatgears.in", "Vikram Singh", "Growth", 11, 15, 31.5, 50, 18400, 50000, "ACTIVE", 2999));
        tenantsFleet.add(buildTenant("tenant-9", "Wanderlust Expeditions", "TRAVEL", "tours@wanderlust.travel", "Priya Iyer", "Growth", 9, 15, 22.0, 50, 14900, 50000, "ACTIVE", 2999));

        // 4. Initial Invoices
        platformInvoices.add(buildInvoice("INV-2026-101", "tenant-1", "ABC Technologies Pvt. Ltd.", "SOFTWARE_IT", "2026-10-01", 7999, "INR", "PAID", "Stripe_ch_39482"));
        platformInvoices.add(buildInvoice("INV-2026-102", "tenant-2", "Prestige Skyline Realty", "REAL_ESTATE", "2026-10-01", 24999, "INR", "PAID", "Razorpay_pay_92819"));
        platformInvoices.add(buildInvoice("INV-2026-103", "tenant-3", "Apollo Zenith Hospital", "HEALTHCARE", "2026-10-02", 7999, "INR", "PAID", "Stripe_ch_40192"));
        platformInvoices.add(buildInvoice("INV-2026-104", "tenant-4", "Grand Heritage Hotel & Resorts", "HOSPITALITY", "2026-10-03", 2999, "INR", "PAID", "Razorpay_pay_19283"));
        platformInvoices.add(buildInvoice("INV-2026-105", "tenant-5", "St. Jude Global Academy", "EDUCATION", "2026-10-04", 2999, "INR", "PAID", "Stripe_ch_50192"));
        platformInvoices.add(buildInvoice("INV-2026-106", "tenant-6", "UrbanVogue Retail Co.", "ECOMMERCE", "2026-10-05", 7999, "INR", "PAID", "Razorpay_pay_67192"));
        platformInvoices.add(buildInvoice("INV-2026-107", "tenant-7", "Apex Stratagem Consulting", "CONSULTING", "2026-10-06", 7999, "INR", "PAID", "Stripe_ch_60192"));
        platformInvoices.add(buildInvoice("INV-2026-108", "tenant-8", "Bharat Precision Gears", "MANUFACTURING", "2026-10-07", 2999, "INR", "PAID", "Razorpay_pay_78192"));
        platformInvoices.add(buildInvoice("INV-2026-109", "tenant-9", "Wanderlust Expeditions", "TRAVEL", "2026-10-08", 2999, "INR", "PAID", "Stripe_ch_70192"));
        platformInvoices.add(buildInvoice("INV-2026-110", "tenant-1", "ABC Technologies Pvt. Ltd.", "SOFTWARE_IT", "2026-11-01", 7999, "INR", "PAID", "Stripe_ch_80192"));

        // 5. Initial Payments & Failed Transactions
        platformPayments.add(buildPayment("PAY-901", "INV-2026-101", "tenant-1", 7999, "INR", "Stripe", "SUCCESS", "2026-10-01T06:30:00Z"));
        platformPayments.add(buildPayment("PAY-902", "INV-2026-102", "tenant-2", 24999, "INR", "Razorpay", "SUCCESS", "2026-10-01T08:15:00Z"));
        platformPayments.add(buildPayment("PAY-903", "INV-2026-103", "tenant-3", 7999, "INR", "Stripe", "SUCCESS", "2026-10-02T10:00:00Z"));
        platformPayments.add(buildPayment("PAY-904", "INV-2026-104", "tenant-4", 2999, "INR", "Razorpay", "SUCCESS", "2026-10-03T11:20:00Z"));
        platformPayments.add(buildPayment("PAY-905", "INV-2026-105", "tenant-5", 2999, "INR", "Stripe", "SUCCESS", "2026-10-04T09:40:00Z"));
        platformPayments.add(buildPayment("PAY-906", "INV-2026-106", "tenant-6", 7999, "INR", "Razorpay", "SUCCESS", "2026-10-05T14:10:00Z"));
        platformPayments.add(buildPayment("PAY-907", "INV-2026-107", "tenant-7", 7999, "INR", "Stripe", "SUCCESS", "2026-10-06T12:00:00Z"));
        platformPayments.add(buildPayment("PAY-908", "INV-2026-108", "tenant-8", 2999, "INR", "Razorpay", "SUCCESS", "2026-10-07T16:30:00Z"));
        platformPayments.add(buildPayment("PAY-909", "INV-2026-109", "tenant-9", 2999, "INR", "Stripe", "SUCCESS", "2026-10-08T18:00:00Z"));
        platformPayments.add(buildPayment("PAY-910", "INV-2026-110", "tenant-1", 7999, "INR", "Stripe", "SUCCESS", "2026-11-01T07:00:00Z"));

        // 6. Initial Cloud Backups
        platformBackups.add(new LinkedHashMap<>(Map.of(
                "backupId", "BKP-2026-11-01-FULL",
                "backupType", "FULL",
                "scope", "PLATFORM_ALL_TENANTS",
                "sizeMB", 1845.2,
                "storageRegion", "ap-south-1 (Mumbai)",
                "status", "VERIFIED",
                "createdAt", "2026-11-01T02:00:00Z"
        )));
        platformBackups.add(new LinkedHashMap<>(Map.of(
                "backupId", "BKP-2026-10-25-FULL",
                "backupType", "FULL",
                "scope", "PLATFORM_ALL_TENANTS",
                "sizeMB", 1720.8,
                "storageRegion", "ap-south-1 (Mumbai)",
                "status", "VERIFIED",
                "createdAt", "2026-10-25T02:00:00Z"
        )));
    }

    private Map<String, Object> buildFullPackage(
            String id, String name, String code, String desc,
            double monthlyPrice, double quarterlyPrice, double yearlyPrice, String curr,
            int trialDays, double setupFee,
            int maxUsers, int maxAiAgents, int maxLeads, int maxContacts, int aiCredits,
            int storageGb, int whatsappMessages, int apiRequestsPerMonth, int integrations, int channels,
            List<String> features, List<String> supportedVerticals, String status
    ) {
        Map<String, Object> p = new LinkedHashMap<>();
        p.put("packageId", id);
        p.put("name", name);
        p.put("code", code);
        p.put("description", desc);
        p.put("billingCycles", Map.of(
                "monthly", monthlyPrice,
                "quarterly", quarterlyPrice,
                "yearly", yearlyPrice
        ));
        p.put("pricePerMonth", monthlyPrice);
        p.put("currency", curr);
        p.put("trialDays", trialDays);
        p.put("setupFee", setupFee);
        p.put("quotas", Map.of(
                "maxUsers", maxUsers,
                "maxAiAgents", maxAiAgents,
                "maxLeads", maxLeads,
                "maxContacts", maxContacts,
                "aiCredits", aiCredits,
                "storageGb", storageGb,
                "whatsappMessages", whatsappMessages,
                "apiRequestsPerMonth", apiRequestsPerMonth,
                "integrations", integrations,
                "channels", channels
        ));
        p.put("includedSeats", maxUsers);
        p.put("storageGB", storageGb);
        p.put("aiMessagesPerMonth", aiCredits);
        p.put("features", features);
        p.put("supportedVerticals", supportedVerticals);
        p.put("status", status);
        p.put("version", 1);
        p.put("updatedAt", Instant.now().toString());
        return p;
    }

    private Map<String, Object> buildTenant(
            String id, String name, String ind, String email, String ownerName,
            String plan, int seats, int seatsLimit, double storageUsed, int storageLimit,
            int aiMsgUsed, int aiMsgLimit, String status, double mrr
    ) {
        Map<String, Object> t = new LinkedHashMap<>();
        t.put("tenantId", id);
        t.put("id", id);
        t.put("companyName", name);
        t.put("name", name);
        t.put("industry", ind);
        t.put("industryId", ind.toLowerCase());
        t.put("ownerEmail", email);
        t.put("hrContact", email);
        t.put("ownerName", ownerName);
        t.put("plan", plan);
        t.put("seats", seats);
        t.put("seatsLimit", seatsLimit);
        t.put("storageUsedGB", storageUsed);
        t.put("storageGB", storageLimit);
        t.put("aiMessagesUsed", aiMsgUsed);
        t.put("aiMessagesLimit", aiMsgLimit);
        t.put("status", status);
        t.put("mrr", "₹" + (int) mrr + "/mo");
        t.put("mrrValue", mrr);
        t.put("createdAt", "2026-09-15T00:00:00Z");
        return t;
    }

    private Map<String, Object> buildInvoice(
            String id, String tenantId, String company, String industry,
            String date, double amount, String currency, String status, String transactionRef
    ) {
        Map<String, Object> inv = new LinkedHashMap<>();
        inv.put("invoiceId", id);
        inv.put("id", id);
        inv.put("tenantId", tenantId);
        inv.put("companyName", company);
        inv.put("industry", industry);
        inv.put("date", date);
        inv.put("amount", amount);
        inv.put("amountFormatted", "₹ " + (int) amount);
        inv.put("currency", currency);
        inv.put("status", status);
        inv.put("transactionRef", transactionRef);
        return inv;
    }

    private Map<String, Object> buildPayment(
            String id, String invoiceId, String tenantId, double amount, String currency,
            String gateway, String status, String timestamp
    ) {
        Map<String, Object> pay = new LinkedHashMap<>();
        pay.put("paymentId", id);
        pay.put("invoiceId", invoiceId);
        pay.put("tenantId", tenantId);
        pay.put("amount", amount);
        pay.put("currency", currency);
        pay.put("gateway", gateway);
        pay.put("status", status);
        pay.put("timestamp", timestamp);
        return pay;
    }

    // =========================================================================
    // 0. PLATFORM ROOT DASHBOARD TELEMETRY
    // =========================================================================

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardOverview() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of(
                        "totalTenants", tenantsFleet.size(),
                        "activeTenants", tenantsFleet.stream().filter(t -> "ACTIVE".equals(t.get("status"))).count(),
                        "monthlyRecurringRevenue", 1850000,
                        "annualRecurringRevenue", 22200000,
                        "totalAiAgentsActive", 48,
                        "monthlyAiActions", 842000,
                        "pendingContactQueries", contactQueries.stream().filter(q -> "PENDING_REVIEW".equals(q.get("status"))).count(),
                        "emergencyLockdown", isEmergencyLockdown,
                        "platformUptime", "99.98%",
                        "systemHealth", "HEALTHY"
                )
        ));
    }

    @GetMapping("/dashboard/tenant-summary")
    public ResponseEntity<?> getTenantSummary() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of(
                        "totalTenants", tenantsFleet.size(),
                        "activeTenants", tenantsFleet.stream().filter(t -> "ACTIVE".equals(t.get("status"))).count(),
                        "suspendedTenants", tenantsFleet.stream().filter(t -> "SUSPENDED".equals(t.get("status"))).count(),
                        "trialTenants", tenantsFleet.stream().filter(t -> "TRIAL".equals(t.get("status"))).count()
                )
        ));
    }

    @GetMapping("/dashboard/user-summary")
    public ResponseEntity<?> getUserSummary() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of(
                        "totalUsers", 432,
                        "activeUsersToday", 312,
                        "platformAdmins", 3
                )
        ));
    }

    @GetMapping("/dashboard/system-health")
    public ResponseEntity<?> getSystemHealth() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of(
                        "database", "HEALTHY",
                        "redisCache", "HEALTHY",
                        "aiGateway", "HEALTHY",
                        "storageCluster", "HEALTHY",
                        "avgLatencyMs", 42
                )
        ));
    }

    // =========================================================================
    // 1. PUBLIC CONTACT QUERIES & 1-CLICK PROVISIONING
    // =========================================================================

    @GetMapping("/contact-queries")
    public ResponseEntity<?> listContactQueries(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String industry
    ) {
        List<Map<String, Object>> filtered = new ArrayList<>();
        for (Map<String, Object> q : contactQueries) {
            boolean matches = true;
            if (status != null && !status.equalsIgnoreCase("ALL") && !status.equalsIgnoreCase((String) q.get("status"))) matches = false;
            if (industry != null && !industry.equalsIgnoreCase("ALL") && !industry.equalsIgnoreCase((String) q.get("industry"))) matches = false;
            if (matches) filtered.add(q);
        }
        return ResponseEntity.ok(Map.of("success", true, "data", filtered, "meta", Map.of("totalElements", filtered.size())));
    }

    @PostMapping("/contact-queries/submit")
    public ResponseEntity<?> submitPublicContactQuery(@RequestBody Map<String, Object> req) {
        String queryId = "QRY-" + (contactQueries.size() + 1001);
        Map<String, Object> q = new LinkedHashMap<>(req);
        q.put("queryId", queryId);
        q.put("submittedAt", Instant.now().toString());
        q.put("status", "PENDING_REVIEW");
        contactQueries.add(0, q);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "message", "Query submitted successfully", "data", q));
    }

    @PostMapping("/contact-queries/{queryId}/approve")
    public ResponseEntity<?> approveAndProvisionTenant(@PathVariable String queryId, @RequestBody(required = false) Map<String, Object> overrideData) {
        for (Map<String, Object> q : contactQueries) {
            if (queryId.equals(q.get("queryId"))) {
                q.put("status", "APPROVED");
                q.put("approvedAt", Instant.now().toString());

                String newTenantId = "TEN-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
                String companyName = (String) q.get("companyName");
                String ind = (String) q.get("industry");
                String email = (String) q.get("email");
                String ownerName = (String) q.get("fullName");

                Map<String, Object> newTenant = buildTenant(
                        newTenantId, companyName, ind != null ? ind : "SOFTWARE_IT",
                        email != null ? email : "admin@workspace.com",
                        ownerName != null ? ownerName : "Workspace Owner",
                        "Starter (30 Days Free Promotional Trial)",
                        1, 15, 0.5, 25, 120, 20000, "ACTIVE", 0
                );
                tenantsFleet.add(0, newTenant);

                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Contact query approved and tenant workspace provisioned successfully!",
                        "data", Map.of(
                                "query", q,
                                "provisionedTenant", newTenant
                        )
                ));
            }
        }
        return ResponseEntity.notFound().build();
    }

    @PatchMapping("/contact-queries/{queryId}/status")
    public ResponseEntity<?> updateQueryStatus(@PathVariable String queryId, @RequestBody Map<String, String> body) {
        for (Map<String, Object> q : contactQueries) {
            if (queryId.equals(q.get("queryId"))) {
                q.put("status", body.get("status"));
                return ResponseEntity.ok(Map.of("success", true, "message", "Query status updated", "data", q));
            }
        }
        return ResponseEntity.notFound().build();
    }

    // =========================================================================
    // 2. SAAS PACKAGES SETTINGS MODULE
    // =========================================================================

    @GetMapping("/packages")
    public ResponseEntity<?> listPackages() {
        return ResponseEntity.ok(Map.of("success", true, "data", packages, "meta", Map.of("totalPackages", packages.size())));
    }

    @PostMapping("/packages")
    public ResponseEntity<?> createPackage(@RequestBody Map<String, Object> req) {
        String id = "PKG-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase();
        Map<String, Object> p = new LinkedHashMap<>(req);
        p.put("packageId", id);
        p.put("status", "ACTIVE");
        p.put("version", 1);
        p.put("updatedAt", Instant.now().toString());

        if (!p.containsKey("billingCycles")) {
            double price = p.containsKey("pricePerMonth") ? Double.parseDouble(p.get("pricePerMonth").toString()) : 4999;
            p.put("billingCycles", Map.of("monthly", price, "quarterly", price * 2.8, "yearly", price * 10));
        }
        packages.add(p);
        recordPackageAudit(id, "CREATED", "Created SaaS package: " + p.get("name"));

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "Package created successfully",
                "data", p,
                "requestId", "req_pkg_" + id
        ));
    }

    private boolean matchPackageId(Map<String, Object> p, String packageId) {
        if (p == null || !p.containsKey("packageId") || packageId == null) return false;
        String id = p.get("packageId").toString();
        return id.equalsIgnoreCase(packageId)
                || id.replace("-", "_").equalsIgnoreCase(packageId)
                || id.replace("_", "-").equalsIgnoreCase(packageId);
    }

    @GetMapping("/packages/{packageId}")
    public ResponseEntity<?> getPackageDetails(@PathVariable String packageId) {
        for (Map<String, Object> p : packages) {
            if (matchPackageId(p, packageId)) {
                return ResponseEntity.ok(Map.of("success", true, "data", p));
            }
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/packages/{packageId}")
    public ResponseEntity<?> updatePackageFull(@PathVariable String packageId, @RequestBody Map<String, Object> updates) {
        for (Map<String, Object> p : packages) {
            if (matchPackageId(p, packageId)) {
                int currVer = p.containsKey("version") ? (int) p.get("version") : 1;
                p.putAll(updates);
                p.put("version", currVer + 1);
                p.put("updatedAt", Instant.now().toString());
                recordPackageAudit(packageId, "UPDATED", "Full update to package version " + (currVer + 1));
                return ResponseEntity.ok(Map.of("success", true, "message", "Package updated successfully", "data", p));
            }
        }
        return ResponseEntity.notFound().build();
    }

    @PatchMapping("/packages/{packageId}/status")
    public ResponseEntity<?> updatePackageStatus(@PathVariable String packageId, @RequestBody Map<String, String> body) {
        for (Map<String, Object> p : packages) {
            if (matchPackageId(p, packageId)) {
                p.put("status", body.get("status"));
                recordPackageAudit(packageId, "STATUS_CHANGED", "Status changed to " + body.get("status"));
                return ResponseEntity.ok(Map.of("success", true, "message", "Package status updated", "data", p));
            }
        }
        return ResponseEntity.notFound().build();
    }

    @PatchMapping("/packages/{packageId}/pricing")
    public ResponseEntity<?> updatePackagePricing(@PathVariable String packageId, @RequestBody Map<String, Object> body) {
        for (Map<String, Object> p : packages) {
            if (matchPackageId(p, packageId)) {
                if (body.containsKey("billingCycles")) p.put("billingCycles", body.get("billingCycles"));
                if (body.containsKey("pricePerMonth")) p.put("pricePerMonth", body.get("pricePerMonth"));
                if (body.containsKey("currency")) p.put("currency", body.get("currency"));
                recordPackageAudit(packageId, "PRICING_UPDATED", "Pricing updated for " + packageId);
                return ResponseEntity.ok(Map.of("success", true, "message", "Package pricing updated", "data", p));
            }
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/packages/{packageId}/quotas")
    public ResponseEntity<?> updatePackageQuotas(@PathVariable String packageId, @RequestBody Map<String, Object> quotas) {
        for (Map<String, Object> p : packages) {
            if (matchPackageId(p, packageId)) {
                p.put("quotas", quotas);
                int currVer = p.containsKey("version") ? (int) p.get("version") : 1;
                p.put("version", currVer + 1);
                recordPackageAudit(packageId, "QUOTAS_UPDATED", "Quotas updated to version " + (currVer + 1));
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Package quotas updated successfully",
                        "data", Map.of("packageId", packageId, "quotaVersion", currVer + 1, "quotas", quotas)
                ));
            }
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/packages/{packageId}/features")
    public ResponseEntity<?> updatePackageFeatures(@PathVariable String packageId, @RequestBody Map<String, Object> req) {
        for (Map<String, Object> p : packages) {
            if (matchPackageId(p, packageId)) {
                p.put("features", req.get("features"));
                recordPackageAudit(packageId, "FEATURES_UPDATED", "Features updated");
                return ResponseEntity.ok(Map.of("success", true, "message", "Package features updated", "data", p));
            }
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/packages/{packageId}/verticals")
    public ResponseEntity<?> updatePackageVerticals(@PathVariable String packageId, @RequestBody Map<String, Object> req) {
        for (Map<String, Object> p : packages) {
            if (matchPackageId(p, packageId)) {
                p.put("supportedVerticals", req.get("supportedVerticals"));
                recordPackageAudit(packageId, "VERTICALS_UPDATED", "Supported industry verticals updated");
                return ResponseEntity.ok(Map.of("success", true, "message", "Package verticals updated", "data", p));
            }
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/packages/{packageId}/duplicate")
    public ResponseEntity<?> duplicatePackage(@PathVariable String packageId) {
        for (Map<String, Object> p : packages) {
            if (matchPackageId(p, packageId)) {
                Map<String, Object> dup = new LinkedHashMap<>(p);
                String newId = "PKG-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase();
                dup.put("packageId", newId);
                dup.put("name", p.get("name") + " (Copy)");
                dup.put("status", "DRAFT");
                dup.put("version", 1);
                packages.add(dup);
                recordPackageAudit(newId, "DUPLICATED", "Duplicated from " + packageId);
                return ResponseEntity.ok(Map.of("success", true, "message", "Package duplicated", "data", dup));
            }
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/packages/{packageId}/archive")
    public ResponseEntity<?> archivePackage(@PathVariable String packageId) {
        for (Map<String, Object> p : packages) {
            if (matchPackageId(p, packageId)) {
                p.put("status", "ARCHIVED");
                recordPackageAudit(packageId, "ARCHIVED", "Package archived");
                return ResponseEntity.ok(Map.of("success", true, "message", "Package archived successfully", "data", p));
            }
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/packages/comparison")
    public ResponseEntity<?> getPackagesComparison() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Packages comparison retrieved",
                "data", packages
        ));
    }

    @GetMapping("/packages/change-history")
    public ResponseEntity<?> getPackageHistory() {
        return ResponseEntity.ok(Map.of("success", true, "data", packageHistory));
    }

    private void recordPackageAudit(String packageId, String action, String description) {
        packageHistory.add(0, Map.of(
                "auditId", "AUD-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase(),
                "packageId", packageId,
                "action", action,
                "description", description,
                "performedBy", "root@zenelait.ai (Ultra Super Admin)",
                "timestamp", Instant.now().toString()
        ));
    }

    // =========================================================================
    // 3. REVENUE MANAGEMENT MODULE
    // =========================================================================

    @GetMapping("/revenue/overview")
    public ResponseEntity<?> getRevenueOverview(
            @RequestParam(required = false, defaultValue = "MONTHLY") String period,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to
    ) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("currency", "INR");
        data.put("period", period);
        data.put("mrr", 1850000);
        data.put("arr", 22200000);
        data.put("mrrFormatted", "₹18,50,000 / mo");
        data.put("arrFormatted", "₹2,22,00,000 / yr");
        data.put("collectedRevenue", 1680000);
        data.put("pendingRevenue", 170000);
        data.put("failedPayments", 45000);
        data.put("refunds", 15000);
        data.put("netProfitability", 1340000);
        data.put("grossMarginPercentage", "72.4%");
        data.put("aiInfrastructureCosts", 340000);
        data.put("newSubscriptions", 42);
        data.put("renewals", 118);
        data.put("upgrades", 15);
        data.put("downgrades", 4);
        data.put("cancelledSubscriptions", 6);
        data.put("monthlyGrowthRate", "+14.8%");
        data.put("churnRate", "1.2%");

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Revenue overview retrieved",
                "data", data,
                "requestId", "req_rev_overview"
        ));
    }

    @GetMapping("/revenue/mrr")
    public ResponseEntity<?> getMrrReport() {
        List<Map<String, Object>> trend = List.of(
                Map.of("month", "May 2026", "mrr", 1120000, "growth", "+12%"),
                Map.of("month", "Jun 2026", "mrr", 1280000, "growth", "+14%"),
                Map.of("month", "Jul 2026", "mrr", 1410000, "growth", "+10%"),
                Map.of("month", "Aug 2026", "mrr", 1560000, "growth", "+11%"),
                Map.of("month", "Sep 2026", "mrr", 1690000, "growth", "+8%"),
                Map.of("month", "Oct 2026", "mrr", 1850000, "growth", "+9.5%")
        );
        return ResponseEntity.ok(Map.of("success", true, "data", Map.of("currentMrr", 1850000, "trajectory", trend)));
    }

    @GetMapping("/revenue/arr")
    public ResponseEntity<?> getArrReport() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of("currentArr", 22200000, "projectedEoyArr", 27500000, "targetArr", 30000000)
        ));
    }

    @GetMapping("/revenue/trends")
    public ResponseEntity<?> getRevenueTrends() {
        List<Map<String, Object>> trends = List.of(
                Map.of("date", "2026-05", "billed", 1250000, "collected", 1180000, "aiCost", 210000),
                Map.of("date", "2026-06", "billed", 1390000, "collected", 1340000, "aiCost", 240000),
                Map.of("date", "2026-07", "billed", 1520000, "collected", 1480000, "aiCost", 270000),
                Map.of("date", "2026-08", "billed", 1680000, "collected", 1620000, "aiCost", 295000),
                Map.of("date", "2026-09", "billed", 1790000, "collected", 1710000, "aiCost", 315000),
                Map.of("date", "2026-10", "billed", 1950000, "collected", 1850000, "aiCost", 340000)
        );
        return ResponseEntity.ok(Map.of("success", true, "data", trends));
    }

    @GetMapping("/revenue/by-package")
    public ResponseEntity<?> getRevenueByPackage() {
        List<Map<String, Object>> byPkg = List.of(
                Map.of("packageId", "PKG-ENTERPRISE", "name", "Enterprise Sovereign", "revenue", 999960, "percentage", "54.1%", "subscriptions", 40),
                Map.of("packageId", "PKG-PRO", "name", "Professional", "revenue", 639920, "percentage", "34.6%", "subscriptions", 80),
                Map.of("packageId", "PKG-GROWTH", "name", "Growth", "revenue", 210120, "percentage", "11.3%", "subscriptions", 70),
                Map.of("packageId", "PKG-STARTER", "name", "Starter Free Trial", "revenue", 0, "percentage", "0%", "subscriptions", 55)
        );
        return ResponseEntity.ok(Map.of("success", true, "data", byPkg));
    }

    @GetMapping("/revenue/by-vertical")
    public ResponseEntity<?> getRevenueByVertical(@RequestParam(required = false, defaultValue = "MONTHLY") String period) {
        List<Map<String, Object>> verticals = List.of(
                Map.of("vertical", "SOFTWARE_IT", "name", "Software / IT", "revenue", 550000, "revenueFormatted", "₹5,50,000", "activeSubscriptions", 35, "share", "29.7%"),
                Map.of("vertical", "REAL_ESTATE", "name", "Real Estate", "revenue", 320000, "revenueFormatted", "₹3,20,000", "activeSubscriptions", 20, "share", "17.3%"),
                Map.of("vertical", "HEALTHCARE", "name", "Healthcare", "revenue", 210000, "revenueFormatted", "₹2,10,000", "activeSubscriptions", 16, "share", "11.4%"),
                Map.of("vertical", "ECOMMERCE", "name", "E-Commerce", "revenue", 190000, "revenueFormatted", "₹1,90,000", "activeSubscriptions", 17, "share", "10.3%"),
                Map.of("vertical", "EDUCATION", "name", "Education", "revenue", 180000, "revenueFormatted", "₹1,80,000", "activeSubscriptions", 14, "share", "9.7%"),
                Map.of("vertical", "CONSULTING", "name", "Consulting", "revenue", 150000, "revenueFormatted", "₹1,50,000", "activeSubscriptions", 12, "share", "8.1%"),
                Map.of("vertical", "MANUFACTURING", "name", "Manufacturing", "revenue", 120000, "revenueFormatted", "₹1,20,000", "activeSubscriptions", 10, "share", "6.5%"),
                Map.of("vertical", "TRAVEL", "name", "Travel", "revenue", 80000, "revenueFormatted", "₹80,000", "activeSubscriptions", 8, "share", "4.3%"),
                Map.of("vertical", "HOSPITALITY", "name", "Hospitality", "revenue", 50000, "revenueFormatted", "₹50,000", "activeSubscriptions", 5, "share", "2.7%")
        );
        return ResponseEntity.ok(Map.of("success", true, "data", verticals));
    }

    @GetMapping("/revenue/by-tenant")
    public ResponseEntity<?> getRevenueByTenant() {
        return ResponseEntity.ok(Map.of("success", true, "data", tenantsFleet));
    }

    @GetMapping("/revenue/invoices")
    public ResponseEntity<?> listPlatformInvoices() {
        return ResponseEntity.ok(Map.of("success", true, "data", platformInvoices, "meta", Map.of("totalInvoices", platformInvoices.size())));
    }

    @GetMapping("/revenue/invoices/{invoiceId}")
    public ResponseEntity<?> getInvoiceDetails(@PathVariable String invoiceId) {
        for (Map<String, Object> inv : platformInvoices) {
            if (invoiceId.equals(inv.get("invoiceId"))) {
                return ResponseEntity.ok(Map.of("success", true, "data", inv));
            }
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/revenue/invoices/{invoiceId}/void")
    public ResponseEntity<?> voidInvoice(@PathVariable String invoiceId, @RequestBody(required = false) Map<String, String> body) {
        for (Map<String, Object> inv : platformInvoices) {
            if (invoiceId.equals(inv.get("invoiceId"))) {
                inv.put("status", "VOIDED");
                inv.put("voidReason", body != null ? body.get("reason") : "Voided by Ultra Super Admin");
                return ResponseEntity.ok(Map.of("success", true, "message", "Invoice #" + invoiceId + " has been voided", "data", inv));
            }
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/revenue/payments")
    public ResponseEntity<?> listPlatformPayments() {
        return ResponseEntity.ok(Map.of("success", true, "data", platformPayments, "meta", Map.of("totalPayments", platformPayments.size())));
    }

    @GetMapping("/revenue/payments/failed")
    public ResponseEntity<?> listFailedPayments() {
        List<Map<String, Object>> failed = List.of(
                Map.of("paymentId", "PAY-FAIL-01", "invoiceId", "INV-2026-098", "tenantId", "tenant-8", "companyName", "Bharat Precision Gears", "amount", 2999, "reason", "Insufficient funds on corporate card", "gateway", "Razorpay", "timestamp", "2026-10-28T09:15:00Z"),
                Map.of("paymentId", "PAY-FAIL-02", "invoiceId", "INV-2026-099", "tenantId", "tenant-9", "companyName", "Wanderlust Expeditions", "amount", 2999, "reason", "Card expired / Gateway 3D Secure timeout", "gateway", "Stripe", "timestamp", "2026-10-29T14:40:00Z")
        );
        return ResponseEntity.ok(Map.of("success", true, "data", failed));
    }

    @PostMapping({"/revenue/payments/{paymentId}/retry", "/revenue/payments/retry/{paymentId}"})
    public ResponseEntity<?> retryPayment(@PathVariable String paymentId) {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Payment retry dispatched through gateway adapter.",
                "data", Map.of("paymentId", paymentId, "status", "RETRY_QUEUED", "queuedAt", Instant.now().toString())
        ));
    }

    @GetMapping("/revenue/refunds")
    public ResponseEntity<?> listPlatformRefunds() {
        return ResponseEntity.ok(Map.of("success", true, "data", platformRefunds));
    }

    @PostMapping("/revenue/refunds")
    public ResponseEntity<?> requestRefund(@RequestBody Map<String, Object> body) {
        String refId = "REF-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        Map<String, Object> ref = new LinkedHashMap<>(body);
        ref.put("refundRequestId", refId);
        ref.put("status", "COMPLETED");
        ref.put("processedAt", Instant.now().toString());
        platformRefunds.add(0, ref);

        return ResponseEntity.status(HttpStatus.ACCEPTED).body(Map.of(
                "success", true,
                "message", "Refund processed and ledger updated successfully",
                "data", ref,
                "requestId", "req_refund_" + refId
        ));
    }

    @GetMapping("/revenue/gateway-summary")
    public ResponseEntity<?> getGatewaySummary() {
        return ResponseEntity.ok(Map.of("success", true, "data", List.of(
                Map.of("gateway", "Razorpay Cloud India", "status", "HEALTHY", "successRate", "99.4%", "monthlyVolume", 940000, "settlementSchedule", "T+1"),
                Map.of("gateway", "Stripe Global", "status", "HEALTHY", "successRate", "99.8%", "monthlyVolume", 910000, "settlementSchedule", "T+2")
        )));
    }

    @GetMapping("/revenue/tax-summary")
    public ResponseEntity<?> getTaxSummary() {
        return ResponseEntity.ok(Map.of("success", true, "data", Map.of(
                "taxRegime", "GST 18% (India) + Global Reverse Charge",
                "totalTaxCollected", 333000,
                "cgst", 166500,
                "sgst", 166500,
                "igst", 0,
                "currentFiscalYear", "FY2026-27"
        )));
    }

    @GetMapping("/revenue/ai-costs")
    public ResponseEntity<?> getAiCosts() {
        return ResponseEntity.ok(Map.of("success", true, "data", Map.of(
                "totalMonthlyCost", 340000,
                "anthropicClaudeSonnet", 185000,
                "openAiGpt4o", 115000,
                "googleGemini15Pro", 40000,
                "totalTokensProcessed", "184.2M tokens",
                "costAsPercentOfRevenue", "18.4%"
        )));
    }

    @GetMapping("/revenue/profitability")
    public ResponseEntity<?> getProfitability() {
        return ResponseEntity.ok(Map.of("success", true, "data", Map.of(
                "grossRevenue", 1850000,
                "cloudHostingAWS", 90000,
                "aiInferenceCost", 340000,
                "paymentGatewayFees", 37000,
                "netOperatingProfit", 1383000,
                "netMargin", "74.7%"
        )));
    }

    // =========================================================================
    // 4. CROSS-COMPANY TENANT FLEET & DELEGATED IMPERSONATION
    // =========================================================================

    @GetMapping("/tenants")
    public ResponseEntity<?> listFleetTenants() {
        return ResponseEntity.ok(Map.of("success", true, "data", tenantsFleet, "meta", Map.of("totalTenants", tenantsFleet.size())));
    }

    @PatchMapping("/tenants/{tenantId}/limits")
    public ResponseEntity<?> updateTenantLimits(@PathVariable String tenantId, @RequestBody Map<String, Object> limits) {
        for (Map<String, Object> t : tenantsFleet) {
            if (tenantId.equals(t.get("tenantId")) || tenantId.equals(t.get("id"))) {
                if (limits.containsKey("seatsLimit")) t.put("seatsLimit", limits.get("seatsLimit"));
                if (limits.containsKey("seats")) t.put("seatsLimit", limits.get("seats"));
                if (limits.containsKey("storageGB")) t.put("storageGB", limits.get("storageGB"));
                if (limits.containsKey("aiMessagesLimit")) t.put("aiMessagesLimit", limits.get("aiMessagesLimit"));
                if (limits.containsKey("plan")) t.put("plan", limits.get("plan"));
                return ResponseEntity.ok(Map.of("success", true, "message", "Tenant quotas updated successfully", "data", t));
            }
        }
        return ResponseEntity.notFound().build();
    }

    @PatchMapping("/tenants/{tenantId}/status")
    public ResponseEntity<?> updateTenantStatus(@PathVariable String tenantId, @RequestBody Map<String, String> body) {
        for (Map<String, Object> t : tenantsFleet) {
            if (tenantId.equals(t.get("tenantId")) || tenantId.equals(t.get("id"))) {
                t.put("status", body.get("status"));
                return ResponseEntity.ok(Map.of("success", true, "message", "Tenant status updated", "data", t));
            }
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/tenants/{tenantId}/suspend")
    public ResponseEntity<?> suspendTenant(@PathVariable String tenantId, @RequestBody(required = false) Map<String, String> body) {
        for (Map<String, Object> t : tenantsFleet) {
            if (tenantId.equals(t.get("tenantId")) || tenantId.equals(t.get("id"))) {
                t.put("status", "SUSPENDED");
                t.put("suspendReason", body != null ? body.get("reason") : "Administrative suspension");
                return ResponseEntity.ok(Map.of("success", true, "message", "Tenant has been suspended", "data", t));
            }
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/tenants/{tenantId}/activate")
    public ResponseEntity<?> activateTenant(@PathVariable String tenantId) {
        for (Map<String, Object> t : tenantsFleet) {
            if (tenantId.equals(t.get("tenantId")) || tenantId.equals(t.get("id"))) {
                t.put("status", "ACTIVE");
                return ResponseEntity.ok(Map.of("success", true, "message", "Tenant activated", "data", t));
            }
        }
        return ResponseEntity.notFound().build();
    }

    // Delegated Impersonation Sessions
    @PostMapping("/impersonation/sessions")
    public ResponseEntity<?> createImpersonationSession(@RequestBody Map<String, Object> req) {
        String sessionId = "IMP-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        Map<String, Object> sess = new LinkedHashMap<>(req);
        sess.put("sessionId", sessionId);
        sess.put("startedAt", Instant.now().toString());
        sess.put("status", "ACTIVE");
        sess.put("initiatedBy", "root@zenelait.ai (Ultra Super Admin)");
        sess.put("accessMode", req.getOrDefault("accessMode", "READ_ONLY"));
        impersonationSessions.add(0, sess);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "Delegated support access session authorized and initiated",
                "data", sess,
                "requestId", "req_imp_" + sessionId
        ));
    }

    @GetMapping("/impersonation/sessions")
    public ResponseEntity<?> listImpersonationSessions() {
        return ResponseEntity.ok(Map.of("success", true, "data", impersonationSessions));
    }

    @PostMapping("/impersonation/sessions/{sessionId}/terminate")
    public ResponseEntity<?> terminateImpersonationSession(@PathVariable String sessionId) {
        for (Map<String, Object> s : impersonationSessions) {
            if (sessionId.equals(s.get("sessionId"))) {
                s.put("status", "TERMINATED");
                s.put("terminatedAt", Instant.now().toString());
                return ResponseEntity.ok(Map.of("success", true, "message", "Delegated session terminated", "data", s));
            }
        }
        return ResponseEntity.notFound().build();
    }

    // =========================================================================
    // 5. SECURITY CENTER, EMERGENCY OPERATIONS & DISASTER RECOVERY
    // =========================================================================

    @GetMapping("/emergency/status")
    public ResponseEntity<?> getEmergencyStatus() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of(
                        "isEmergencyLockdown", isEmergencyLockdown,
                        "lockdownScope", lockdownScope,
                        "reason", lockdownReason
                )
        ));
    }

    @PostMapping("/emergency/lockdown")
    public ResponseEntity<?> triggerLockdown(@RequestBody Map<String, String> body) {
        this.isEmergencyLockdown = true;
        this.lockdownScope = body.getOrDefault("scope", "ALL_TENANTS_WRITES");
        this.lockdownReason = body.getOrDefault("reason", "Suspected security incident");

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "🚨 Emergency Lockdown Activated across " + lockdownScope,
                "data", Map.of("isEmergencyLockdown", true, "scope", lockdownScope, "reason", lockdownReason)
        ));
    }

    @PostMapping("/emergency/unlock")
    public ResponseEntity<?> triggerUnlock() {
        this.isEmergencyLockdown = false;
        this.lockdownScope = "NONE";
        this.lockdownReason = "";

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "✅ Emergency Lockdown Deactivated. Normal operations resumed.",
                "data", Map.of("isEmergencyLockdown", false)
        ));
    }

    @GetMapping("/backups")
    public ResponseEntity<?> listBackups() {
        return ResponseEntity.ok(Map.of("success", true, "data", platformBackups));
    }

    @PostMapping({"/backups", "/backups/snapshot"})
    public ResponseEntity<?> requestDatabaseBackup(@RequestBody(required = false) Map<String, Object> req) {
        String backupId = "BKP-" + Instant.now().toString().substring(0, 10) + "-SNAPSHOT";
        Map<String, Object> bkp = new LinkedHashMap<>();
        bkp.put("backupId", backupId);
        bkp.put("backupType", req != null && req.containsKey("backupType") ? req.get("backupType") : "FULL");
        bkp.put("scope", "PLATFORM_ALL_TENANTS");
        bkp.put("sizeMB", 1890.4);
        bkp.put("storageRegion", "ap-south-1 (Mumbai Multi-AZ)");
        bkp.put("status", "VERIFIED");
        bkp.put("createdAt", Instant.now().toString());
        platformBackups.add(0, bkp);

        return ResponseEntity.status(HttpStatus.ACCEPTED).body(Map.of(
                "success", true,
                "message", "Database snapshot backup executed and verified on S3 cold storage.",
                "data", bkp
        ));
    }
}
