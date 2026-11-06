package com.zenelait.crm.service;

import com.zenelait.crm.common.exception.ForbiddenException;
import com.zenelait.crm.common.exception.ResourceNotFoundException;
import com.zenelait.crm.common.exception.ValidationException;
import com.zenelait.crm.dto.*;
import com.zenelait.crm.model.Role;
import com.zenelait.crm.model.User;
import com.zenelait.crm.tenant.TenantSecurityService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SoftwareItService {

    private final TenantSecurityService tenantSecurityService;
    private final Map<String, Map<String, Object>> productsStore = new LinkedHashMap<>();
    private final Map<String, Map<String, Object>> requirementsStore = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> demosStore = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> proposalsStore = new ConcurrentHashMap<>();
    private final Map<String, List<Map<String, Object>>> approvalRequestsStore = new ConcurrentHashMap<>();
    private final List<Map<String, Object>> contractsStore = Collections.synchronizedList(new ArrayList<>());

    public SoftwareItService(TenantSecurityService tenantSecurityService) {
        this.tenantSecurityService = tenantSecurityService;
        initCatalogueAndSeedData();
    }

    private void initCatalogueAndSeedData() {
        // 1. HRMS Software
        Map<String, Object> hrms = new LinkedHashMap<>();
        hrms.put("id", "PROD-HRMS");
        hrms.put("productId", "PROD-HRMS");
        hrms.put("name", "Enterprise HRMS & Payroll Suite");
        hrms.put("sku", "HRMS-ENT-500");
        hrms.put("category", "HRMS");
        hrms.put("basePrice", 450000.0);
        hrms.put("currency", "INR");
        hrms.put("billingCycle", "ANNUAL");
        hrms.put("description", "Complete human resource management with AI attendance biometric sync, Indian statutory payroll, performance appraisals, and employee self-service.");
        hrms.put("modules", List.of("Statutory Payroll & Form 16", "Biometric & Geofenced Attendance", "Leave & Shift Management", "Performance OKRs & Appraisals", "Employee Self-Service Portal"));
        hrms.put("supportedDeployments", List.of("Cloud SaaS", "Dedicated VPC", "On-Premise"));
        hrms.put("supportedIntegrations", List.of("Slack", "Microsoft Teams", "SAP", "Tally ERP", "Biometric Hardware"));
        productsStore.put("PROD-HRMS", hrms);

        // 2. ERP Software
        Map<String, Object> erp = new LinkedHashMap<>();
        erp.put("id", "PROD-ERP");
        erp.put("productId", "PROD-ERP");
        erp.put("name", "Cloud ERP & Supply Chain Suite");
        erp.put("sku", "ERP-CORE-CLD");
        erp.put("category", "ERP");
        erp.put("basePrice", 750000.0);
        erp.put("currency", "INR");
        erp.put("billingCycle", "ANNUAL");
        erp.put("description", "End-to-end enterprise resource planning covering multi-warehouse inventory, procurement workflows, production scheduling, bill of materials, and financial ledger.");
        erp.put("modules", List.of("Financial Accounting & GST Ledger", "Multi-Location Inventory", "Purchase & Vendor Portal", "Production & BOM Management", "Logistics & Dispatch Tracking"));
        erp.put("supportedDeployments", List.of("Cloud SaaS", "Dedicated VPC"));
        erp.put("supportedIntegrations", List.of("Razorpay", "Stripe", "Shiprocket", "Salesforce", "Zoho Books"));
        productsStore.put("PROD-ERP", erp);

        // 3. LMS Software
        Map<String, Object> lms = new LinkedHashMap<>();
        lms.put("id", "PROD-LMS");
        lms.put("productId", "PROD-LMS");
        lms.put("name", "AI NextGen Corporate Learning LMS");
        lms.put("sku", "LMS-AI-ED");
        lms.put("category", "LMS");
        lms.put("basePrice", 350000.0);
        lms.put("currency", "INR");
        lms.put("billingCycle", "ANNUAL");
        lms.put("description", "Corporate & institutional LMS with interactive video courses, SCORM/xAPI compliance, proctored assessments, and AI skill gap recommendations.");
        lms.put("modules", List.of("Drag & Drop Course Builder", "Interactive Quizzes & Certificates", "SCORM / xAPI / AICC Player", "Compliance Audit Reports", "Live Classrooms & Zoom Bridge"));
        lms.put("supportedDeployments", List.of("Cloud SaaS", "Hybrid"));
        lms.put("supportedIntegrations", List.of("Zoom", "Google Meet", "Canvas", "Moodle", "Stripe"));
        productsStore.put("PROD-LMS", lms);

        // 4. CRM Software
        Map<String, Object> crm = new LinkedHashMap<>();
        crm.put("id", "PROD-CRM");
        crm.put("productId", "PROD-CRM");
        crm.put("name", "Omnichannel AI CRM & Sales Bot");
        crm.put("sku", "CRM-BOT-OMNI");
        crm.put("category", "CRM");
        crm.put("basePrice", 320000.0);
        crm.put("currency", "INR");
        crm.put("billingCycle", "ANNUAL");
        crm.put("description", "Unified sales workspace featuring AI lead capture, WhatsApp/Email auto-qualifier, pipeline deal stages, CPQ proposals, and customer 360.");
        crm.put("modules", List.of("Lead Inbound Auto-Routing", "WhatsApp & Web Chat Bot", "Deal Pipeline & Forecasting", "Automated CPQ Quotations", "Omnichannel Shared Inbox"));
        crm.put("supportedDeployments", List.of("Cloud SaaS", "Dedicated VPC"));
        crm.put("supportedIntegrations", List.of("WhatsApp Cloud API", "SendGrid", "Meta Ads", "Google Workspace", "Zapier"));
        productsStore.put("PROD-CRM", crm);

        // Prepopulate Seed Requirement
        Map<String, Object> req = new LinkedHashMap<>();
        req.put("id", "REQ-IT-1001");
        req.put("tenantId", "TEN-IT-001");
        req.put("leadId", "LEAD-5001");
        req.put("leadName", "Priya Sharma (Tech Solutions Inc.)");
        req.put("product", "HRMS");
        req.put("employeeCount", 500);
        req.put("modules", List.of("PAYROLL", "ATTENDANCE", "LEAVE_MANAGEMENT", "PERFORMANCE"));
        req.put("deployment", "CLOUD");
        req.put("integrations", List.of("Biometric Devices", "Slack", "Tally"));
        req.put("budget", 500000.0);
        req.put("currency", "INR");
        req.put("status", "QUALIFIED");
        req.put("notes", "Client requires automated salary slips dispatched via WhatsApp and biometric integration.");
        req.put("assignedTeam", "SOLUTION_ENGINEERING");
        req.put("createdAt", "2026-10-12T11:15:00");
        requirementsStore.put("REQ-IT-1001", req);

        // Prepopulate Seed Demo
        Map<String, Object> demo = new LinkedHashMap<>();
        demo.put("id", "DEMO-IT-2001");
        demo.put("demoId", "DEMO-IT-2001");
        demo.put("tenantId", "TEN-IT-001");
        demo.put("leadId", "LEAD-5001");
        demo.put("product", "HRMS");
        demo.put("status", "SCHEDULED");
        demo.put("presenterId", "USR-102");
        demo.put("presenterName", "Anita Sharma (Sales Executive)");
        demo.put("scheduledAt", "2026-10-18T11:00:00");
        demo.put("channel", "GOOGLE_MEET");
        demo.put("meetingLink", "https://meet.google.com/zen-hrms-demo");
        demo.put("attendees", List.of("priya.sharma@techsolutions.com", "cto@techsolutions.com"));
        demosStore.put("DEMO-IT-2001", demo);

        // Prepopulate Seed Proposal
        Map<String, Object> prop = new LinkedHashMap<>();
        prop.put("id", "PROP-IT-3001");
        prop.put("proposalId", "PROP-IT-3001");
        prop.put("tenantId", "TEN-IT-001");
        prop.put("opportunityId", "OPP-7001");
        prop.put("leadId", "LEAD-5001");
        prop.put("title", "Enterprise HRMS & Payroll Cloud Proposal (500 Seats)");
        prop.put("product", "Enterprise HRMS & Payroll Suite");
        prop.put("subtotal", 500000.0);
        prop.put("discountPercent", 5.0);
        prop.put("discountAmount", 25000.0);
        prop.put("taxPercent", 18.0);
        prop.put("taxAmount", 85500.0);
        prop.put("totalAmount", 560500.0);
        prop.put("currency", "INR");
        prop.put("status", "PENDING_APPROVAL");
        prop.put("approvalStatus", "SUBMITTED_TO_MANAGER");
        prop.put("validUntil", "2026-11-15");
        proposalsStore.put("PROP-IT-3001", prop);

        // Seed Contract
        contractsStore.add(Map.of(
                "id", "CON-IT-101",
                "tenantId", "tenant-1",
                "contractNumber", "ZEN-2026-HRMS-5001",
                "title", "Enterprise HRMS Cloud Service Agreement",
                "customerName", "Tech Solutions Inc.",
                "value", 560500.0,
                "currency", "INR",
                "status", "EXECUTED",
                "signedDate", "2026-10-16",
                "validUntil", "2027-10-15"
        ));
    }

    // ==========================================
    // PRODUCTS
    // ==========================================
    public List<Map<String, Object>> getProductsCatalogue() {
        return new ArrayList<>(productsStore.values());
    }

    public Map<String, Object> getProductDetails(String productId) {
        Map<String, Object> product = productsStore.get(productId.toUpperCase());
        if (product == null) {
            for (Map<String, Object> p : productsStore.values()) {
                if (productId.equalsIgnoreCase((String) p.get("id")) ||
                    productId.equalsIgnoreCase((String) p.get("category"))) {
                    return p;
                }
            }
            throw new ResourceNotFoundException("Product not found in software catalogue: " + productId);
        }
        return product;
    }

    // ==========================================
    // IT REQUIREMENTS
    // ==========================================
    public Map<String, Object> captureRequirement(ItRequirementDto dto) {
        String tenantId = tenantSecurityService.getCurrentTenantId();
        String id = "REQ-IT-" + (1000 + (long)(Math.random() * 9000));

        Map<String, Object> req = new LinkedHashMap<>();
        req.put("id", id);
        req.put("tenantId", tenantId);
        req.put("leadId", dto.getLeadId());
        req.put("customerId", dto.getCustomerId());
        req.put("product", dto.getProduct());
        req.put("employeeCount", dto.getEmployeeCount());
        req.put("modules", dto.getModules() != null ? dto.getModules() : List.of());
        req.put("deployment", dto.getDeployment());
        req.put("integrations", dto.getIntegrations() != null ? dto.getIntegrations() : List.of());
        req.put("budget", dto.getBudget());
        req.put("currency", dto.getCurrency());
        req.put("notes", dto.getNotes());
        req.put("status", "RECEIVED");
        req.put("assignedTeam", "SOLUTION_ENGINEERING");
        req.put("createdAt", LocalDateTime.now().toString());

        requirementsStore.put(id, req);
        return req;
    }

    public List<Map<String, Object>> listRequirements() {
        String tenantId = tenantSecurityService.getCurrentTenantId();
        List<Map<String, Object>> list = new ArrayList<>();
        for (Map<String, Object> r : requirementsStore.values()) {
            if (tenantId.equalsIgnoreCase((String) r.get("tenantId"))) {
                list.add(r);
            }
        }
        return list;
    }

    public Map<String, Object> getRequirement(String id) {
        Map<String, Object> req = requirementsStore.get(id);
        if (req == null) throw new ResourceNotFoundException("Requirement not found: " + id);
        tenantSecurityService.validateTenantOwnership((String) req.get("tenantId"));
        return req;
    }

    public Map<String, Object> updateRequirement(String id, Map<String, Object> updates) {
        Map<String, Object> req = getRequirement(id);
        req.putAll(updates);
        req.put("updatedAt", LocalDateTime.now().toString());
        return req;
    }

    // ==========================================
    // DEMOS & OUTCOMES
    // ==========================================
    public Map<String, Object> scheduleDemo(ItDemoDto dto) {
        String tenantId = tenantSecurityService.getCurrentTenantId();
        String id = "DEMO-IT-" + (2000 + (long)(Math.random() * 8000));

        Map<String, Object> demo = new LinkedHashMap<>();
        demo.put("id", id);
        demo.put("demoId", id);
        demo.put("tenantId", tenantId);
        demo.put("leadId", dto.getLeadId());
        demo.put("product", dto.getProduct());
        demo.put("scheduledAt", dto.getScheduledAt());
        demo.put("presenterId", dto.getPresenterId() != null ? dto.getPresenterId() : tenantSecurityService.getCurrentUser().getId());
        demo.put("presenterName", dto.getPresenterName() != null ? dto.getPresenterName() : tenantSecurityService.getCurrentUser().getFullName());
        demo.put("channel", dto.getChannel());
        demo.put("meetingLink", dto.getMeetingLink() != null ? dto.getMeetingLink() : "https://meet.google.com/zen-demo-" + id);
        demo.put("attendees", dto.getAttendees() != null ? dto.getAttendees() : List.of());
        demo.put("specialFocus", dto.getSpecialFocus());
        demo.put("status", "SCHEDULED");
        demo.put("createdAt", LocalDateTime.now().toString());

        demosStore.put(id, demo);
        return demo;
    }

    public List<Map<String, Object>> listDemos() {
        String tenantId = tenantSecurityService.getCurrentTenantId();
        List<Map<String, Object>> list = new ArrayList<>();
        for (Map<String, Object> d : demosStore.values()) {
            if (tenantId.equalsIgnoreCase((String) d.get("tenantId"))) {
                list.add(d);
            }
        }
        return list;
    }

    public Map<String, Object> updateDemo(String demoId, Map<String, Object> updates) {
        Map<String, Object> demo = demosStore.get(demoId);
        if (demo == null) throw new ResourceNotFoundException("Demo not found: " + demoId);
        tenantSecurityService.validateTenantOwnership((String) demo.get("tenantId"));
        demo.putAll(updates);
        demo.put("updatedAt", LocalDateTime.now().toString());
        return demo;
    }

    public Map<String, Object> recordDemoOutcome(String demoId, ItDemoOutcomeDto dto) {
        Map<String, Object> demo = demosStore.get(demoId);
        if (demo == null) throw new ResourceNotFoundException("Demo not found: " + demoId);
        tenantSecurityService.validateTenantOwnership((String) demo.get("tenantId"));

        demo.put("status", "COMPLETED");
        demo.put("outcomeStatus", dto.getOutcomeStatus());
        demo.put("interestScore", dto.getInterestScore());
        demo.put("questionsAsked", dto.getQuestionsAsked());
        demo.put("objectionsFaced", dto.getObjectionsFaced());
        demo.put("nextSteps", dto.getNextSteps() != null ? dto.getNextSteps() : "Prepare commercial proposal");
        demo.put("techStaffRequired", dto.getTechStaffRequired());
        demo.put("completedAt", LocalDateTime.now().toString());

        return Map.of(
                "demoId", demoId,
                "status", "OUTCOME_RECORDED",
                "nextSteps", demo.get("nextSteps"),
                "demo", demo
        );
    }

    // ==========================================
    // PROPOSALS & DISCOUNT APPROVAL GATE
    // ==========================================
    public Map<String, Object> createProposal(ItProposalDto dto) {
        String tenantId = tenantSecurityService.getCurrentTenantId();
        String id = "PROP-IT-" + (3000 + (long)(Math.random() * 7000));

        double subtotal = dto.getSubtotal() != null ? dto.getSubtotal() : 500000.0;
        double discPct = dto.getDiscountPercent() != null ? dto.getDiscountPercent() : 0.0;
        double discAmount = (subtotal * discPct) / 100.0;
        double taxable = subtotal - discAmount;
        double taxAmount = (taxable * (dto.getTaxPercent() != null ? dto.getTaxPercent() : 18.0)) / 100.0;
        double totalAmount = taxable + taxAmount;

        boolean approvalRequired = discPct > 0;

        Map<String, Object> prop = new LinkedHashMap<>();
        prop.put("id", id);
        prop.put("proposalId", id);
        prop.put("tenantId", tenantId);
        prop.put("opportunityId", dto.getOpportunityId());
        prop.put("leadId", dto.getLeadId());
        prop.put("title", dto.getTitle());
        prop.put("product", dto.getProduct());
        prop.put("subscriptionPlan", dto.getSubscriptionPlan());
        prop.put("lineItems", dto.getLineItems() != null ? dto.getLineItems() : List.of());
        prop.put("subtotal", subtotal);
        prop.put("discountPercent", discPct);
        prop.put("discountAmount", discAmount);
        prop.put("taxPercent", dto.getTaxPercent() != null ? dto.getTaxPercent() : 18.0);
        prop.put("taxAmount", taxAmount);
        prop.put("totalAmount", totalAmount);
        prop.put("currency", dto.getCurrency());
        prop.put("status", approvalRequired ? "PENDING_APPROVAL" : "DRAFT");
        prop.put("approvalRequired", approvalRequired);
        prop.put("approvalStatus", approvalRequired ? "SUBMITTED_TO_MANAGER" : "NOT_REQUIRED");
        prop.put("validUntil", dto.getValidUntil() != null ? dto.getValidUntil() : "2026-11-20");
        prop.put("preparedBy", tenantSecurityService.getCurrentUser().getFullName());
        prop.put("notes", dto.getNotes());
        prop.put("createdAt", LocalDateTime.now().toString());

        proposalsStore.put(id, prop);
        return prop;
    }

    public List<Map<String, Object>> listProposals() {
        String tenantId = tenantSecurityService.getCurrentTenantId();
        List<Map<String, Object>> list = new ArrayList<>();
        for (Map<String, Object> p : proposalsStore.values()) {
            if (tenantId.equalsIgnoreCase((String) p.get("tenantId"))) {
                list.add(p);
            }
        }
        return list;
    }

    public Map<String, Object> getProposal(String id) {
        Map<String, Object> prop = proposalsStore.get(id);
        if (prop == null) throw new ResourceNotFoundException("Proposal not found: " + id);
        tenantSecurityService.validateTenantOwnership((String) prop.get("tenantId"));
        return prop;
    }

    public Map<String, Object> updateProposal(String id, Map<String, Object> updates) {
        Map<String, Object> prop = getProposal(id);

        // Security boundary: Sales Executive cannot modify already accepted or executed proposals
        String currentStatus = (String) prop.get("status");
        if ("ACCEPTED".equalsIgnoreCase(currentStatus) || "EXECUTED".equalsIgnoreCase(currentStatus)) {
            throw new ValidationException("Cannot modify accepted or executed proposal commitment.");
        }

        prop.putAll(updates);
        prop.put("updatedAt", LocalDateTime.now().toString());
        return prop;
    }

    public Map<String, Object> updateProposalStatus(String id, String newStatus) {
        Map<String, Object> prop = getProposal(id);
        User user = tenantSecurityService.getCurrentUser();

        // Security boundary: Sales Executive cannot directly mark a discounted proposal as ACCEPTED unless approved
        if ("ACCEPTED".equalsIgnoreCase(newStatus) && Boolean.TRUE.equals(prop.get("approvalRequired"))) {
            String appStatus = (String) prop.get("approvalStatus");
            if (!"APPROVED".equalsIgnoreCase(appStatus) && user.getRole() == Role.SALES_REP) {
                throw new ForbiddenException("Proposal requires Sales Manager discount approval before acceptance.");
            }
        }

        prop.put("status", newStatus.toUpperCase());
        prop.put("updatedAt", LocalDateTime.now().toString());
        return prop;
    }

    public Map<String, Object> requestProposalApproval(String id, ProposalApprovalRequestDto dto) {
        Map<String, Object> prop = getProposal(id);

        String requestId = "APPR-PROP-" + System.currentTimeMillis() % 10000;
        Map<String, Object> req = new LinkedHashMap<>();
        req.put("requestId", requestId);
        req.put("proposalId", id);
        req.put("discountPercent", dto.getDiscountPercent() != null ? dto.getDiscountPercent() : prop.get("discountPercent"));
        req.put("requestedDiscountAmount", dto.getRequestedDiscountAmount() != null ? dto.getRequestedDiscountAmount() : prop.get("discountAmount"));
        req.put("reason", dto.getReason());
        req.put("requestedBy", dto.getRequestedBy() != null ? dto.getRequestedBy() : tenantSecurityService.getCurrentUser().getFullName());
        req.put("status", "PENDING_APPROVAL");
        req.put("createdAt", LocalDateTime.now().toString());

        approvalRequestsStore.computeIfAbsent(id, k -> new ArrayList<>()).add(req);
        prop.put("approvalRequired", true);
        prop.put("approvalStatus", "PENDING_MANAGER_APPROVAL");
        prop.put("status", "PENDING_APPROVAL");

        return Map.of(
                "proposalId", id,
                "requestId", requestId,
                "status", "APPROVAL_REQUEST_SUBMITTED",
                "message", "Approval request queued for Sales Manager / Admin authorization."
        );
    }

    public List<Map<String, Object>> listContracts() {
        String tenantId = tenantSecurityService.getCurrentTenantId();
        List<Map<String, Object>> list = new ArrayList<>();
        for (Map<String, Object> c : contractsStore) {
            if (tenantId.equalsIgnoreCase((String) c.get("tenantId"))) {
                list.add(c);
            }
        }
        return list;
    }
}
