package com.zenelait.crm.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

/**
 * Zenelait AI CRM — Company Admin V1 REST API Controller
 * Implements the Company Admin API Blueprint:
 * - /api/v1/admin/dashboard
 * - /api/v1/admin/dashboard/activity
 * - /api/v1/admin/dashboard/health
 * - /api/v1/company/profile
 * - /api/v1/company/industry-config
 * - /api/v1/company/preferences
 * - /api/v1/company/branding
 * - /api/v1/admin/users
 * - /api/v1/admin/roles
 * - /api/v1/admin/permissions
 * - /api/v1/admin/audit-logs
 * - /api/v1/admin/products (IT products like HRMS Pro, ERP, LMS)
 * - /api/v1/admin/crm/settings
 * - /api/v1/admin/integrations
 * - /api/v1/admin/ai-agents
 * - /api/v1/admin/automations
 * - /api/v1/admin/billing/*
 */
@RestController
@CrossOrigin(origins = "*")
public class CompanyAdminV1Controller {

    // In-memory dynamic tenant database stores for high-speed simulation & API compliance
    private final Map<String, Object> companyProfile = new LinkedHashMap<>();
    private final List<Map<String, Object>> tenantUsers = new ArrayList<>();
    private final List<Map<String, Object>> itProducts = new ArrayList<>();
    private final List<Map<String, Object>> auditLogs = new ArrayList<>();
    private final List<Map<String, Object>> integrations = new ArrayList<>();
    private final List<Map<String, Object>> aiAgents = new ArrayList<>();
    private final List<Map<String, Object>> automations = new ArrayList<>();

    public CompanyAdminV1Controller() {
        // Initialize Default Software/IT Tenant Data (ABC Technologies TEN-IT-001)
        companyProfile.put("tenantId", "TEN-IT-001");
        companyProfile.put("companyName", "ABC Technologies Pvt. Ltd.");
        companyProfile.put("website", "https://abctechnologies.com");
        companyProfile.put("industry", "SOFTWARE_IT");
        companyProfile.put("contactEmail", "contact@abctech.com");
        companyProfile.put("phone", "+91-9000000000");
        companyProfile.put("plan", "Enterprise Pro (₹0 Promotional Trial)");
        companyProfile.put("address", Map.of("city", "Chennai", "state", "Tamil Nadu", "country", "India"));
        companyProfile.put("updatedAt", Instant.now().toString());

        // Initial Seed Users
        tenantUsers.add(new LinkedHashMap<>(Map.of(
                "userId", "USR-ADM-001",
                "name", "Sathiyaseelan",
                "email", "admin@abctech.com",
                "department", "EXECUTIVE",
                "jobTitle", "Company Owner / Managing Director",
                "roles", List.of("COMPANY_ADMIN"),
                "status", "ACTIVE"
        )));
        tenantUsers.add(new LinkedHashMap<>(Map.of(
                "userId", "USR-HR-101",
                "name", "Kavitha Raj",
                "email", "kavitha.hr@abctech.com",
                "department", "HUMAN_RESOURCES",
                "jobTitle", "HR Executive",
                "roles", List.of("HR"),
                "status", "ACTIVE"
        )));
        tenantUsers.add(new LinkedHashMap<>(Map.of(
                "userId", "USR-SALES-102",
                "name", "Rahul Sharma",
                "email", "rahul.mgr@abctech.com",
                "department", "SALES",
                "jobTitle", "Sales Manager",
                "roles", List.of("SALES_MANAGER"),
                "status", "ACTIVE"
        )));

        // Initial Seed IT Products
        itProducts.add(new LinkedHashMap<>(Map.of(
                "productId", "PRD-101",
                "name", "HRMS Pro",
                "code", "HRMS-PRO",
                "category", "HR_SOFTWARE",
                "description", "Employee management, payroll and HR workflow platform",
                "billingModel", "SUBSCRIPTION",
                "currency", "INR",
                "status", "ACTIVE"
        )));
        itProducts.add(new LinkedHashMap<>(Map.of(
                "productId", "PRD-102",
                "name", "Cloud ERP Enterprise",
                "code", "ERP-ENT",
                "category", "ENTERPRISE_SOFTWARE",
                "description", "End-to-end supply chain, inventory and finance engine",
                "billingModel", "SUBSCRIPTION",
                "currency", "INR",
                "status", "ACTIVE"
        )));

        // Seed Integrations
        integrations.add(new LinkedHashMap<>(Map.of(
                "integrationId", "INT-EMAIL-01",
                "provider", "EMAIL",
                "status", "CONNECTED",
                "name", "Corporate SMTP / G-Suite",
                "enabled", true
        )));
        integrations.add(new LinkedHashMap<>(Map.of(
                "integrationId", "INT-WHATSAPP-02",
                "provider", "WHATSAPP",
                "status", "CONNECTED",
                "name", "Meta WhatsApp Cloud API",
                "enabled", true
        )));

        // Seed Audit Logs
        auditLogs.add(Map.of(
                "id", "LOG-1001",
                "action", "TENANT_INITIALIZED",
                "actor", "admin@abctech.com",
                "details", "Tenant TEN-IT-001 initialized with Enterprise Pro ₹0 package",
                "timestamp", Instant.now().toString()
        ));
    }

    // ==========================================
    // 4. Company Admin Dashboard & Settings
    // ==========================================
    @GetMapping("/api/v1/admin/dashboard")
    public ResponseEntity<?> getAdminDashboard(
            @RequestParam(required = false) String industry,
            @RequestHeader(value = "X-Tenant-Industry", required = false) String headerIndustry,
            @RequestHeader(value = "X-Tenant-Id", required = false) String headerTenantId
    ) {
        String effectiveIndustry = industry != null ? industry : (headerIndustry != null ? headerIndustry : (String) companyProfile.getOrDefault("industry", "SOFTWARE_IT"));
        boolean isRealEstate = "REAL_ESTATE".equalsIgnoreCase(effectiveIndustry) || (headerTenantId != null && headerTenantId.contains("RE"));
        boolean isEducation = "EDUCATION".equalsIgnoreCase(effectiveIndustry) || "EDUCATION_TRAINING".equalsIgnoreCase(effectiveIndustry) || (headerTenantId != null && (headerTenantId.contains("EDU") || "tenant-3".equals(headerTenantId)));
        boolean isHospital = "HOSPITAL_CLINIC".equalsIgnoreCase(effectiveIndustry) || "HOSPITALS".equalsIgnoreCase(effectiveIndustry) || (headerTenantId != null && (headerTenantId.contains("HC") || "tenant-4".equals(headerTenantId)));

        Map<String, Object> data = new LinkedHashMap<>();
        if (isRealEstate) {
            data.put("tenantId", headerTenantId != null ? headerTenantId : "TEN-RE-001");
            data.put("companyName", "GreenNest Properties");
            data.put("industry", "REAL_ESTATE");
            data.put("currency", "INR");
            data.put("activeProperties", 128);
            data.put("newEnquiries", 246);
            data.put("siteVisitsMonth", 74);
            data.put("pendingBookings", 12);
            data.put("totalBookingsValue", "₹14.8 Cr");
            data.put("agentProductivity", "94.2%");
            data.put("aiActivity", "1,420 interactions");
            data.put("integrationHealth", "100% Operational");
            data.put("packageStatus", "ACTIVE_PROMOTIONAL_0_COST");
        } else if (isEducation) {
            data.put("tenantId", headerTenantId != null ? headerTenantId : "TEN-EDU-001");
            data.put("companyName", "BrightPath Academy");
            data.put("industry", "EDUCATION");
            data.put("currency", "INR");
            data.put("totalActiveStudents", 1420);
            data.put("newAdmissionEnquiries", 384);
            data.put("applicationsAwaitingReview", 42);
            data.put("upcomingCounsellingSessions", 68);
            data.put("activeCoursesCount", 18);
            data.put("activeBatchesCount", 36);
            data.put("admissionConversionRate", "28.4%");
            data.put("followupsOverdue", 7);
            data.put("studentSupportRequests", 15);
            data.put("aiAdmissionAgentPerformance", "98.2% Accuracy (1,120 handled)");
            data.put("automationFailures", 0);
            data.put("integrationHealth", "100% Operational");
            data.put("packageStatus", "ACTIVE_PROMOTIONAL_0_COST");
        } else if (isHospital) {
            data.put("tenantId", headerTenantId != null ? headerTenantId : "TEN-HC-001");
            data.put("companyName", "GreenCare Clinic");
            data.put("industry", "HOSPITAL_CLINIC");
            data.put("currency", "INR");
            data.put("period", Map.of("from", "2026-10-01", "to", "2026-10-31"));
            data.put("metrics", Map.of(
                    "appointmentsScheduled", 320,
                    "appointmentsPending", 18,
                    "appointmentsCancelled", 12,
                    "openSupportRequests", 23,
                    "activeStaff", 25,
                    "activeAiAgents", 2
            ));
            data.put("alerts", List.of(
                    Map.of("type", "PENDING_APPOINTMENTS", "count", 18)
            ));
            data.put("appointmentsScheduled", 320);
            data.put("appointmentsPending", 18);
            data.put("todayAppointments", 46);
            data.put("receptionQueueWaiting", 8);
            data.put("totalRegisteredPatients", 1840);
            data.put("activeStaffCount", 25);
            data.put("aiReceptionistPerformance", "99.4% SLA (840 triaged)");
            data.put("integrationHealth", "100% Operational");
            data.put("packageStatus", "ACTIVE_PROMOTIONAL_0_COST");
        } else {
            data.put("tenantId", companyProfile.get("tenantId"));
            data.put("companyName", companyProfile.get("companyName"));
            data.put("industry", "SOFTWARE_IT");
            data.put("totalUsers", tenantUsers.size());
            data.put("leads", 342);
            data.put("openTickets", 14);
            data.put("activeProducts", itProducts.size());
            data.put("activeIntegrations", integrations.size());
            data.put("aiAgentsOnline", 4);
            data.put("aiUsage", "12,450 tokens / day");
            data.put("activeAutomations", 6);
            data.put("automationFailures", 0);
            data.put("healthScore", "99.98%");
            data.put("integrationHealth", "99.98% Operational");
            data.put("packageStatus", "ACTIVE_PROMOTIONAL_0_COST");
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", data,
                "meta", Map.of("requestId", "REQ-" + System.currentTimeMillis())
        ));
    }

    @GetMapping("/api/v1/admin/dashboard/activity")
    public ResponseEntity<?> getAdminActivity() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", auditLogs,
                "meta", Map.of("requestId", "REQ-" + System.currentTimeMillis())
        ));
    }

    @GetMapping("/api/v1/admin/dashboard/health")
    public ResponseEntity<?> getAdminHealth() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of(
                        "systemStatus", "ALL_SYSTEMS_OPERATIONAL",
                        "database", "CONNECTED_POSTGRESQL",
                        "redisCache", "ACTIVE_99_9_PERCENT",
                        "aiMesh", "HEALTHY_GPT4O_CLAUDE35_GEMINI",
                        "integrations", "2_CONNECTED_0_FAILED"
                ),
                "meta", Map.of("requestId", "REQ-" + System.currentTimeMillis())
        ));
    }

    @GetMapping("/api/v1/company/profile")
    public ResponseEntity<?> getCompanyProfile() {
        return ResponseEntity.ok(Map.of("success", true, "data", companyProfile));
    }

    @PatchMapping("/api/v1/company/profile")
    public ResponseEntity<?> updateCompanyProfile(@RequestBody Map<String, Object> updates) {
        if (updates.containsKey("companyName")) companyProfile.put("companyName", updates.get("companyName"));
        if (updates.containsKey("website")) companyProfile.put("website", updates.get("website"));
        if (updates.containsKey("contactEmail")) companyProfile.put("contactEmail", updates.get("contactEmail"));
        if (updates.containsKey("phone")) companyProfile.put("phone", updates.get("phone"));
        if (updates.containsKey("address")) companyProfile.put("address", updates.get("address"));
        companyProfile.put("updatedAt", Instant.now().toString());

        auditLogs.add(Map.of(
                "id", "LOG-" + System.currentTimeMillis(),
                "action", "PROFILE_UPDATED",
                "actor", "admin@abctech.com",
                "details", "Updated company details for " + companyProfile.get("companyName"),
                "timestamp", Instant.now().toString()
        ));

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Company profile updated successfully",
                "data", companyProfile
        ));
    }

    @GetMapping("/api/v1/company/industry-config")
    public ResponseEntity<?> getIndustryConfig() {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", true);
        resp.put("industry", "SOFTWARE_IT");
        resp.put("enabledModules", List.of("IT_DEMOS", "IT_REQUIREMENTS", "IT_PROPOSALS"));
        resp.put("pipelineStages", List.of("NEW", "QUALIFIED", "DEMO", "PROPOSAL", "WON"));
        resp.put("data", Map.of(
                "industryId", "SOFTWARE_IT",
                "industryName", "Software / IT",
                "supportedProducts", List.of("HRMS", "ERP", "LMS", "CRM", "SaaS"),
                "defaultLeadStages", List.of("NEW", "CONTACTED", "QUALIFIED", "DEMO", "PROPOSAL", "WON")
        ));
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/api/v1/company/preferences")
    public ResponseEntity<?> getPreferences() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of(
                        "timeZone", "Asia/Kolkata",
                        "currency", "INR",
                        "dateFormat", "DD/MM/YYYY",
                        "fiscalYearStart", "April"
                )
        ));
    }

    @GetMapping("/api/v1/company/branding")
    public ResponseEntity<?> getBranding() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of(
                        "primaryColor", "#3b82f6",
                        "accentColor", "#8b5cf6",
                        "companyLogo", "https://abctechnologies.com/logo.png",
                        "themeMode", "DARK"
                )
        ));
    }

    // ==========================================
    // 5. User, Role & Permission Management
    // ==========================================
    @GetMapping("/api/v1/admin/users")
    public ResponseEntity<?> listUsers() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", tenantUsers,
                "meta", Map.of("totalElements", tenantUsers.size())
        ));
    }

    @PostMapping("/api/v1/admin/users")
    public ResponseEntity<?> inviteUser(@RequestBody Map<String, Object> req) {
        String name = (String) req.getOrDefault("name", "New Employee");
        String email = (String) req.getOrDefault("email", "user@abctech.com");
        String department = (String) req.getOrDefault("department", "HUMAN_RESOURCES");
        String jobTitle = (String) req.getOrDefault("jobTitle", "HR Executive");
        List<?> roles = (List<?>) req.getOrDefault("roles", List.of("HR"));

        String newId = "USR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        Map<String, Object> newUser = new LinkedHashMap<>();
        newUser.put("userId", newId);
        newUser.put("name", name);
        newUser.put("email", email);
        newUser.put("department", department);
        newUser.put("jobTitle", jobTitle);
        newUser.put("roles", roles);
        newUser.put("status", "INVITED");
        newUser.put("invitationStatus", "SENT");
        newUser.put("createdAt", Instant.now().toString());

        tenantUsers.add(newUser);

        auditLogs.add(Map.of(
                "id", "LOG-" + System.currentTimeMillis(),
                "action", "USER_INVITED",
                "actor", "admin@abctech.com",
                "details", "Invited user " + name + " (" + email + ") with role " + roles,
                "timestamp", Instant.now().toString()
        ));

        return ResponseEntity.status(201).body(Map.of(
                "success", true,
                "message", "User invitation created",
                "data", newUser
        ));
    }

    @GetMapping("/api/v1/admin/roles")
    public ResponseEntity<?> listRoles() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", List.of(
                        Map.of("roleId", "ROLE-ADM", "name", "COMPANY_ADMIN", "desc", "Company Workspace Admin"),
                        Map.of("roleId", "ROLE-HR", "name", "HR", "desc", "Human Resources & Recruitment"),
                        Map.of("roleId", "ROLE-MGR", "name", "SALES_MANAGER", "desc", "Sales Quota & Approvals"),
                        Map.of("roleId", "ROLE-REP", "name", "SALES_REP", "desc", "Sales Executive & Demos"),
                        Map.of("roleId", "ROLE-SUP", "name", "SUPPORT_AGENT", "desc", "Customer Support & Triage"),
                        Map.of("roleId", "ROLE-ANL", "name", "ANALYST", "desc", "BI Telemetry & Read-Only")
                )
        ));
    }

    @GetMapping("/api/v1/admin/permissions")
    public ResponseEntity<?> listPermissions() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", List.of(
                        "company.profile.read", "company.profile.update",
                        "users.read", "users.invite", "users.update", "users.deactivate",
                        "roles.read", "roles.manage", "integrations.manage",
                        "ai_agents.manage", "automations.manage", "reports.company.read",
                        "billing.read", "billing.manage"
                )
        ));
    }

    @GetMapping("/api/v1/admin/audit-logs")
    public ResponseEntity<?> getAuditLogs() {
        return ResponseEntity.ok(Map.of("success", true, "data", auditLogs));
    }

    // ==========================================
    // 6. CRM & IT Products Catalog (HRMS Pro, ERP, LMS)
    // ==========================================
    @GetMapping("/api/v1/admin/products")
    public ResponseEntity<?> listProducts() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", itProducts,
                "meta", Map.of("totalElements", itProducts.size())
        ));
    }

    @PostMapping("/api/v1/admin/products")
    public ResponseEntity<?> addProduct(@RequestBody Map<String, Object> req) {
        String name = (String) req.getOrDefault("name", "HRMS Pro");
        String code = (String) req.getOrDefault("code", "HRMS-PRO");
        String category = (String) req.getOrDefault("category", "HR_SOFTWARE");
        String description = (String) req.getOrDefault("description", "Employee management and HR workflow platform");
        String billingModel = (String) req.getOrDefault("billingModel", "SUBSCRIPTION");
        String currency = (String) req.getOrDefault("currency", "INR");
        String status = (String) req.getOrDefault("status", "ACTIVE");

        String newId = "PRD-" + (itProducts.size() + 101);
        Map<String, Object> newProd = new LinkedHashMap<>();
        newProd.put("productId", newId);
        newProd.put("name", name);
        newProd.put("code", code);
        newProd.put("category", category);
        newProd.put("description", description);
        newProd.put("billingModel", billingModel);
        newProd.put("currency", currency);
        newProd.put("status", status);

        itProducts.add(newProd);

        auditLogs.add(Map.of(
                "id", "LOG-" + System.currentTimeMillis(),
                "action", "PRODUCT_CREATED",
                "actor", "admin@abctech.com",
                "details", "Created product " + name + " (" + code + ")",
                "timestamp", Instant.now().toString()
        ));

        return ResponseEntity.status(201).body(Map.of(
                "success", true,
                "data", newProd
        ));
    }

    @GetMapping("/api/v1/admin/crm/settings")
    public ResponseEntity<?> getCrmSettings() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of(
                        "autoAssignLeads", true,
                        "roundRobinEnabled", true,
                        "dealCurrency", "INR",
                        "defaultStage", "NEW",
                        "scoringThresholdHot", 80
                )
        ));
    }

    // ==========================================
    // 7. Integrations & Omnichannel
    // ==========================================
    @GetMapping("/api/v1/admin/integrations")
    public ResponseEntity<?> listIntegrations() {
        return ResponseEntity.ok(Map.of("success", true, "data", integrations));
    }

    @PostMapping("/api/v1/admin/integrations/{integrationId}/test")
    public ResponseEntity<?> testIntegration(@PathVariable String integrationId, @RequestBody(required = false) Map<String, Object> req) {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of(
                        "integrationId", integrationId,
                        "provider", integrationId.contains("EMAIL") ? "EMAIL" : "WHATSAPP",
                        "status", "CONNECTED",
                        "testMessageStatus", "SENT",
                        "testedAt", Instant.now().toString()
                )
        ));
    }

    // ==========================================
    // 8. AI Employees & Knowledge Base
    // ==========================================
    @GetMapping("/api/v1/admin/ai-agents")
    public ResponseEntity<?> listAiAgents() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", List.of(
                        Map.of("agentId", "AI-IT-001", "name", "Sales SDR AI", "status", "ACTIVE", "role", "Outbound Lead Qualification"),
                        Map.of("agentId", "AI-HR-001", "name", "HR Helpdesk Assistant", "status", "ACTIVE", "role", "HR FAQs & Leave Guidance")
                )
        ));
    }

    @PostMapping("/api/v1/admin/ai-agents")
    public ResponseEntity<?> createAiAgent(@RequestBody Map<String, Object> req) {
        String name = (String) req.getOrDefault("name", "HR Helpdesk Assistant");
        return ResponseEntity.status(201).body(Map.of(
                "success", true,
                "data", Map.of(
                        "agentId", "AI-HR-" + System.currentTimeMillis() % 1000,
                        "name", name,
                        "status", "DRAFT",
                        "validationStatus", "PENDING_REVIEW"
                )
        ));
    }

    // ==========================================
    // 9. Automations (with DRY_RUN mode) & Billing
    // ==========================================
    @GetMapping("/api/v1/admin/automations")
    public ResponseEntity<?> listAutomations() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", List.of(
                        Map.of("workflowId", "WF-LEAD-FOLLOWUP", "name", "Lead Auto Nurture Drip", "status", "ACTIVE"),
                        Map.of("workflowId", "WF-ONBOARDING", "name", "Employee Onboarding Checklist Drip", "status", "ACTIVE")
                )
        ));
    }

    @PostMapping("/api/v1/admin/automations/{workflowId}/runs")
    public ResponseEntity<?> runAutomation(@PathVariable String workflowId, @RequestBody(required = false) Map<String, Object> req) {
        String mode = (req != null && req.containsKey("mode")) ? (String) req.get("mode") : "DRY_RUN";
        return ResponseEntity.status(202).body(Map.of(
                "success", true,
                "data", Map.of(
                        "runId", "RUN-" + System.currentTimeMillis() % 10000,
                        "workflowId", workflowId,
                        "status", "QUEUED",
                        "mode", mode
                )
        ));
    }

    // ==========================================
    // 7. Lead Fields & Pipeline Stages
    // ==========================================
    private final List<Map<String, Object>> leadFields = new ArrayList<>(List.of(
            new LinkedHashMap<>(Map.of("fieldId", "FLD-01", "name", "annualRevenue", "label", "Annual IT Budget / Revenue", "type", "CURRENCY", "required", false)),
            new LinkedHashMap<>(Map.of("fieldId", "FLD-02", "name", "currentTechStack", "label", "Current ERP / Tech Stack", "type", "TEXT", "required", true)),
            new LinkedHashMap<>(Map.of("fieldId", "FLD-03", "name", "implementationTimeline", "label", "Deployment Timeline", "type", "DROPDOWN", "required", true))
    ));

    private final List<Map<String, Object>> pipelineStages = new ArrayList<>(List.of(
            new LinkedHashMap<>(Map.of("stageId", "STG-01", "name", "Discovery / Qualification", "order", 1, "winProbability", 20)),
            new LinkedHashMap<>(Map.of("stageId", "STG-02", "name", "Technical Demo Scheduled", "order", 2, "winProbability", 40)),
            new LinkedHashMap<>(Map.of("stageId", "STG-03", "name", "Architecture Review & POC", "order", 3, "winProbability", 60)),
            new LinkedHashMap<>(Map.of("stageId", "STG-04", "name", "Commercial Proposal", "order", 4, "winProbability", 80)),
            new LinkedHashMap<>(Map.of("stageId", "STG-05", "name", "Closed Won / Contract Signed", "order", 5, "winProbability", 100))
    ));

    private final List<Map<String, Object>> leadAssignmentRules = new ArrayList<>(List.of(
            new LinkedHashMap<>(Map.of("ruleId", "RULE-01", "name", "Enterprise Leads (>₹10L) to Rahul Sharma", "priority", 1, "assignee", "Rahul Sharma", "status", "ACTIVE")),
            new LinkedHashMap<>(Map.of("ruleId", "RULE-02", "name", "Website Inbound Round-Robin", "priority", 2, "assignee", "Round-Robin Sales Team", "status", "ACTIVE"))
    ));

    @GetMapping("/api/v1/admin/lead-fields")
    public ResponseEntity<?> getLeadFields() {
        return ResponseEntity.ok(Map.of("success", true, "data", leadFields));
    }

    @PostMapping("/api/v1/admin/lead-fields")
    public ResponseEntity<?> createLeadField(@RequestBody Map<String, Object> req) {
        String id = "FLD-" + (leadFields.size() + 1);
        Map<String, Object> f = new LinkedHashMap<>(req);
        f.put("fieldId", id);
        leadFields.add(f);
        return ResponseEntity.status(201).body(Map.of("success", true, "data", f));
    }

    @GetMapping("/api/v1/admin/pipeline-stages")
    public ResponseEntity<?> getPipelineStages() {
        return ResponseEntity.ok(Map.of("success", true, "data", pipelineStages));
    }

    @PostMapping("/api/v1/admin/pipeline-stages")
    public ResponseEntity<?> createPipelineStage(@RequestBody Map<String, Object> req) {
        String id = "STG-" + (pipelineStages.size() + 1);
        Map<String, Object> s = new LinkedHashMap<>(req);
        s.put("stageId", id);
        pipelineStages.add(s);
        return ResponseEntity.status(201).body(Map.of("success", true, "data", s));
    }

    @GetMapping("/api/v1/admin/lead-assignment-rules")
    public ResponseEntity<?> getLeadAssignmentRules() {
        return ResponseEntity.ok(Map.of("success", true, "data", leadAssignmentRules));
    }

    @PostMapping("/api/v1/admin/lead-assignment-rules")
    public ResponseEntity<?> createLeadAssignmentRule(@RequestBody Map<String, Object> req) {
        String id = "RULE-" + (leadAssignmentRules.size() + 1);
        Map<String, Object> r = new LinkedHashMap<>(req);
        r.put("ruleId", id);
        leadAssignmentRules.add(r);
        return ResponseEntity.status(201).body(Map.of("success", true, "data", r));
    }

    @GetMapping("/api/v1/admin/sales-settings")
    public ResponseEntity<?> getSalesSettings() {
        return ResponseEntity.ok(Map.of("success", true, "data", Map.of(
                "defaultCurrency", "INR",
                "fiscalYearStart", "April",
                "defaultCommissionPercentage", 5.0,
                "proposalExpiryDays", 30
        )));
    }

    // ==========================================
    // 8. Knowledge Sources & Escalation Rules
    // ==========================================
    private final List<Map<String, Object>> knowledgeSources = new ArrayList<>(List.of(
            new LinkedHashMap<>(Map.of("id", "KB-01", "name", "Zenelait Enterprise Product Brochure.pdf", "type", "PDF", "status", "INDEXED", "chunks", 48)),
            new LinkedHashMap<>(Map.of("id", "KB-02", "name", "IT Pricing and Service SLA Master.docx", "type", "DOCX", "status", "INDEXED", "chunks", 26))
    ));

    private final List<Map<String, Object>> escalationRules = new ArrayList<>(List.of(
            new LinkedHashMap<>(Map.of("id", "ESC-01", "name", "AI Confidence < 70% Handover to Human SDR", "condition", "CONFIDENCE_BELOW_70", "action", "NOTIFY_SALES_REP", "status", "ACTIVE")),
            new LinkedHashMap<>(Map.of("id", "ESC-02", "name", "Angry Customer Sentiment Handover to Manager", "condition", "NEGATIVE_SENTIMENT", "action", "NOTIFY_SALES_MANAGER", "status", "ACTIVE"))
    ));

    @GetMapping("/api/v1/admin/knowledge-sources")
    public ResponseEntity<?> getKnowledgeSources() {
        return ResponseEntity.ok(Map.of("success", true, "data", knowledgeSources));
    }

    @PostMapping("/api/v1/admin/knowledge-sources")
    public ResponseEntity<?> addKnowledgeSource(@RequestBody Map<String, Object> req) {
        String id = "KB-" + (knowledgeSources.size() + 1);
        Map<String, Object> kb = new LinkedHashMap<>(req);
        kb.put("id", id);
        kb.put("status", "INDEXED");
        kb.put("chunks", 32);
        knowledgeSources.add(kb);
        return ResponseEntity.status(201).body(Map.of("success", true, "data", kb));
    }

    @DeleteMapping("/api/v1/admin/knowledge-sources/{id}")
    public ResponseEntity<?> deleteKnowledgeSource(@PathVariable String id) {
        knowledgeSources.removeIf(k -> id.equals(k.get("id")));
        return ResponseEntity.ok(Map.of("success", true, "message", "Knowledge source deleted"));
    }

    @GetMapping("/api/v1/admin/escalation-rules")
    public ResponseEntity<?> getEscalationRules() {
        return ResponseEntity.ok(Map.of("success", true, "data", escalationRules));
    }

    @PostMapping("/api/v1/admin/escalation-rules")
    public ResponseEntity<?> createEscalationRule(@RequestBody Map<String, Object> req) {
        String id = "ESC-" + (escalationRules.size() + 1);
        Map<String, Object> esc = new LinkedHashMap<>(req);
        esc.put("id", id);
        esc.put("status", "ACTIVE");
        escalationRules.add(esc);
        return ResponseEntity.status(201).body(Map.of("success", true, "data", esc));
    }

    // ==========================================
    // 9. Webhooks & Channel Settings
    // ==========================================
    private final List<Map<String, Object>> webhooks = new ArrayList<>(List.of(
            new LinkedHashMap<>(Map.of("id", "WH-01", "name", "HubSpot Lead Sync Webhook", "url", "https://api.hubspot.com/v1/sync", "events", List.of("LEAD_CREATED", "DEAL_WON"), "status", "ACTIVE")),
            new LinkedHashMap<>(Map.of("id", "WH-02", "name", "Slack Deal Alert Webhook", "url", "https://hooks.slack.com/services/T00/B00/X", "events", List.of("DEAL_WON"), "status", "ACTIVE"))
    ));

    @GetMapping("/api/v1/admin/webhooks")
    public ResponseEntity<?> getWebhooks() {
        return ResponseEntity.ok(Map.of("success", true, "data", webhooks));
    }

    @PostMapping("/api/v1/admin/webhooks")
    public ResponseEntity<?> createWebhook(@RequestBody Map<String, Object> req) {
        String id = "WH-" + (webhooks.size() + 1);
        Map<String, Object> wh = new LinkedHashMap<>(req);
        wh.put("id", id);
        wh.put("status", "ACTIVE");
        webhooks.add(wh);
        return ResponseEntity.status(201).body(Map.of("success", true, "data", wh));
    }

    @PostMapping("/api/v1/admin/webhooks/{id}/test")
    public ResponseEntity<?> testWebhook(@PathVariable String id) {
        return ResponseEntity.ok(Map.of("success", true, "message", "Webhook ping delivered successfully (HTTP 200 OK)"));
    }

    @GetMapping("/api/v1/admin/channel-settings")
    public ResponseEntity<?> getChannelSettings() {
        return ResponseEntity.ok(Map.of("success", true, "data", Map.of(
                "emailNotifications", true,
                "whatsappCloudApiEnabled", true,
                "webchatWidgetEnabled", true,
                "instagramDmEnabled", false
        )));
    }

    @GetMapping("/api/v1/admin/webchat/settings")
    public ResponseEntity<?> getWebchatSettings() {
        return ResponseEntity.ok(Map.of("success", true, "data", Map.of(
                "widgetTitle", "Zenelait AI Sales & Support",
                "primaryColor", "#2563eb",
                "greetingMessage", "Hi there! How can our AI assistant help your business today?",
                "position", "BOTTOM_RIGHT"
        )));
    }

    // ==========================================
    // 10. Reports Endpoints
    // ==========================================
    @GetMapping("/api/v1/admin/reports/overview")
    public ResponseEntity<?> getOverviewReport() {
        return ResponseEntity.ok(Map.of("success", true, "data", Map.of(
                "totalLeads", 342,
                "convertedLeads", 86,
                "conversionRate", "25.1%",
                "totalPipelineValue", "₹4.2 Cr",
                "avgSalesCycleDays", 18,
                "aiContainmentRate", "82.4%"
        )));
    }

    @GetMapping("/api/v1/admin/reports/crm")
    public ResponseEntity<?> getCrmReport() {
        return ResponseEntity.ok(Map.of("success", true, "data", Map.of(
                "dealsWon", 42,
                "dealsLost", 18,
                "winRate", "70%",
                "topSource", "WhatsApp Inbound (44%)"
        )));
    }

    @GetMapping("/api/v1/admin/reports/users")
    public ResponseEntity<?> getUsersReport() {
        return ResponseEntity.ok(Map.of("success", true, "data", Map.of(
                "activeUsersCount", tenantUsers.size(),
                "topSalesPerformer", "Rahul Sharma (₹1.8 Cr closed)",
                "avgResponseTimeMinutes", 12
        )));
    }

    @GetMapping("/api/v1/admin/reports/ai-usage")
    public ResponseEntity<?> getAiUsageReport() {
        return ResponseEntity.ok(Map.of("success", true, "data", Map.of(
                "totalTokensConsumed", 248000,
                "conversationsHandled", 1850,
                "humanEscalations", 128,
                "satisfactionScore", "4.8 / 5.0"
        )));
    }

    @GetMapping("/api/v1/admin/reports/integrations")
    public ResponseEntity<?> getIntegrationsReport() {
        return ResponseEntity.ok(Map.of("success", true, "data", Map.of(
                "whatsappDeliveryRate", "99.4%",
                "smtpDeliveryRate", "98.9%",
                "webchatUptime", "100%"
        )));
    }

    // Education Reports
    @GetMapping("/api/v1/admin/reports/admissions")
    public ResponseEntity<?> getAdmissionsReport() {
        return ResponseEntity.ok(Map.of("success", true, "data", Map.of(
                "totalEnquiries", 384,
                "convertedEnrolments", 109,
                "conversionRate", "28.4%",
                "topEnquirySource", "Website Form (52%)",
                "avgDaysToEnrol", 14
        )));
    }

    @GetMapping("/api/v1/admin/reports/courses")
    public ResponseEntity<?> getCoursesReport() {
        return ResponseEntity.ok(Map.of("success", true, "data", Map.of(
                "mostPopularCourse", "Java Full Stack Development",
                "fastestFillingCohort", "November GenAI Engineers Cohort (91% full)",
                "totalActiveBatches", 36,
                "avgBatchOccupancy", "84.5%"
        )));
    }

    @GetMapping("/api/v1/admin/reports/counsellors")
    public ResponseEntity<?> getCounsellorsReport() {
        return ResponseEntity.ok(Map.of("success", true, "data", Map.of(
                "topCounsellor", "Rajesh Nambiar (38 enrolments closed)",
                "avgRating", "4.85 / 5.0",
                "sessionsCompletedMonth", 142,
                "counsellingToEnrolRate", "46.2%"
        )));
    }

    // Hospital / Clinic Reports
    @GetMapping("/api/v1/admin/reports/appointments")
    public ResponseEntity<?> getHospitalAppointmentsReport() {
        return ResponseEntity.ok(Map.of("success", true, "data", Map.of(
                "scheduledTotal", 320,
                "completedTotal", 274,
                "pendingReview", 18,
                "cancellations", 12,
                "noShowRate", "3.75%"
        )));
    }

    @GetMapping("/api/v1/admin/reports/reception")
    public ResponseEntity<?> getHospitalReceptionReport() {
        return ResponseEntity.ok(Map.of("success", true, "data", Map.of(
                "todayTotalCheckIns", 54,
                "avgWaitTimeMinutes", 11.4,
                "peakQueueHour", "10:00 AM - 11:30 AM",
                "receptionSatisfaction", "98.6%"
        )));
    }

    @GetMapping("/api/v1/admin/reports/support")
    public ResponseEntity<?> getHospitalSupportReport() {
        return ResponseEntity.ok(Map.of("success", true, "data", Map.of(
                "openSupportTickets", 23,
                "resolvedToday", 19,
                "avgResolutionHours", 2.4,
                "topCategory", "Billing & Insurance Queries"
        )));
    }

    @GetMapping("/api/v1/admin/reports/staff-schedules")
    public ResponseEntity<?> getHospitalStaffSchedulesReport() {
        return ResponseEntity.ok(Map.of("success", true, "data", Map.of(
                "activeDoctorsRostered", 18,
                "scheduleUtilization", "91.8%",
                "overtimeHours", 14,
                "teleconsultShare", "32%"
        )));
    }
}

