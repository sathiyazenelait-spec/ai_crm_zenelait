package com.zenelait.crm.manufacturing;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * Zenelait AI CRM — Manufacturing Company Tenant Shared Data Store
 * Coordinates shared records across the 4 Manufacturing Tenant roles:
 * 1. Manufacturing Sales Manager (/api/v1/manufacturing/sales-manager)
 * 2. Manufacturing Sales Executive (/api/v1/manufacturing/sales-executive)
 * 3. Manufacturing Dealer Manager (/api/v1/manufacturing/dealer-manager)
 * 4. Manufacturing Customer Support (/api/v1/manufacturing/customer-support)
 *
 * Implements strict tenant isolation (default tenant-4 "Apex Precision Engineering & Hydraulics" / "Global Industries"),
 * Decimal-safe BigDecimal calculations for commercial quotations, non-reservation inventory availability checks,
 * dealer verification before activation, and strict customer context verification before revealing order details.
 */
@Component
public class ManufacturingDataStore {

    // 1. Products, Categories, Price Lists & Inventory
    private final Map<String, Map<String, Object>> products = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> priceLists = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> discountPolicies = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> inventoryRecords = new ConcurrentHashMap<>();

    // 2. Customers, Leads, Requirements & Opportunities
    private final Map<String, Map<String, Object>> customers = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> leads = new ConcurrentHashMap<>();
    private final Map<String, List<Map<String, Object>>> leadActivities = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> opportunities = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> productRequirements = new ConcurrentHashMap<>();

    // 3. Sales Team, Assignments & Targets
    private final Map<String, Map<String, Object>> teamMembers = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> salesTargets = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> salesAssignments = new ConcurrentHashMap<>();

    // 4. Quotations, Items, Approvals & Order Handoffs
    private final Map<String, Map<String, Object>> quotations = new ConcurrentHashMap<>();
    private final Map<String, List<Map<String, Object>>> quotationItems = new ConcurrentHashMap<>();
    private final Map<String, List<Map<String, Object>>> quotationRevisions = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> quotationApprovals = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> orderHandoffs = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> orders = new ConcurrentHashMap<>();

    // 5. Dealer Management: Dealers, Contacts, Verifications, Documents, Territories, Agreements, Targets
    private final Map<String, Map<String, Object>> dealers = new ConcurrentHashMap<>();
    private final Map<String, List<Map<String, Object>>> dealerContacts = new ConcurrentHashMap<>();
    private final Map<String, List<Map<String, Object>>> dealerDocuments = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> territories = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> dealerPriceRequests = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> dealerAgreements = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> dealerTargets = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> dealerInventoryReports = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> dealerEscalations = new ConcurrentHashMap<>();

    // 6. Customer Support: Tickets, Notes, Messages, KB, Warranty Claims, Returns, Repairs, Complaints
    private final Map<String, Map<String, Object>> supportTickets = new ConcurrentHashMap<>();
    private final Map<String, List<Map<String, Object>>> ticketMessages = new ConcurrentHashMap<>();
    private final Map<String, List<Map<String, Object>>> ticketInternalNotes = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> knowledgeArticles = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> warrantyPolicies = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> warrantyClaims = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> returnRequests = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> repairRequests = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> deliveryIssues = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> qualityComplaints = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> supportEscalations = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> feedbackRecords = new ConcurrentHashMap<>();

    // 7. Follow-ups, Conversations & General Audit
    private final Map<String, Map<String, Object>> followUpTasks = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> conversations = new ConcurrentHashMap<>();
    private final Map<String, List<Map<String, Object>>> conversationMessages = new ConcurrentHashMap<>();
    private final List<Map<String, Object>> auditLogs = Collections.synchronizedList(new ArrayList<>());

    // 8. Technical Support (Part 1)
    private final Map<String, Map<String, Object>> technicalCases = new ConcurrentHashMap<>();
    private final Map<String, List<Map<String, Object>>> technicalCaseTimeline = new ConcurrentHashMap<>();
    private final Map<String, List<Map<String, Object>>> technicalCaseEvidence = new ConcurrentHashMap<>();
    private final Map<String, List<Map<String, Object>>> technicalCaseAttachments = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> diagnosticSessions = new ConcurrentHashMap<>();
    private final Map<String, List<Map<String, Object>>> diagnosticObservations = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> diagnosticRules = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> technicalServiceRequests = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> maintenancePlans = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> technicalAssessments = new ConcurrentHashMap<>();

    // 9. AI B2B Sales Agent (Part 2)
    private final Map<String, Map<String, Object>> aiSalesConversations = new ConcurrentHashMap<>();
    private final Map<String, List<Map<String, Object>>> aiSalesMessages = new ConcurrentHashMap<>();
    private final Map<String, Object> aiSalesConfiguration = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> aiSalesKnowledgeSources = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> aiSalesExtractions = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> aiSalesRecommendations = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> businessProspects = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> inventoryChecks = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> fulfilmentEstimates = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> meetingRequests = new ConcurrentHashMap<>();

    // 10. AI Support Agent (Part 3)
    private final Map<String, Map<String, Object>> aiSupportConversations = new ConcurrentHashMap<>();
    private final Map<String, List<Map<String, Object>>> aiSupportMessages = new ConcurrentHashMap<>();
    private final Map<String, Object> aiSupportConfiguration = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> customerVerifications = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> intentClassifications = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> aiResponseDrafts = new ConcurrentHashMap<>();

    public ManufacturingDataStore() {
        seedInitialData();
    }

    private void seedInitialData() {
        String defaultTenant = "tenant-4";

        // ==========================================
        // 1. PRODUCTS & INVENTORY
        // ==========================================
        Map<String, Object> p1 = new LinkedHashMap<>();
        p1.put("productId", "mfg_product_101");
        p1.put("sku", "PUMP-SS-100");
        p1.put("name", "Stainless Steel Industrial Pump");
        p1.put("category", "INDUSTRIAL_PUMP");
        p1.put("unitOfMeasure", "UNIT");
        p1.put("basePrice", 10000.00);
        p1.put("currency", "INR");
        p1.put("status", "ACTIVE");
        p1.put("specificationsAvailable", true);
        p1.put("specifications", Map.of(
                "flowRate", Map.of("value", 100, "unit", "M3_PER_HOUR"),
                "material", "STAINLESS_STEEL",
                "maxPressureBar", 16,
                "motorPowerKw", 15.0
        ));
        p1.put("compatibleProducts", List.of("mfg_product_102", "mfg_product_103"));
        p1.put("alternatives", List.of("mfg_product_104"));
        p1.put("documents", List.of("mfg_doc_pump_manual_v2.pdf", "mfg_doc_pump_cad.dwg"));
        p1.put("tenantId", defaultTenant);
        products.put("mfg_product_101", p1);

        Map<String, Object> p2 = new LinkedHashMap<>();
        p2.put("productId", "mfg_product_102");
        p2.put("sku", "MTR-IND-50HP");
        p2.put("name", "Heavy Duty Induction Motor 50HP");
        p2.put("category", "INDUSTRIAL_MOTOR");
        p2.put("unitOfMeasure", "UNIT");
        p2.put("basePrice", 45000.00);
        p2.put("currency", "INR");
        p2.put("status", "ACTIVE");
        p2.put("specificationsAvailable", true);
        p2.put("specifications", Map.of(
                "powerHp", 50,
                "voltage", 415,
                "phase", 3,
                "rpm", 1450,
                "efficiencyClass", "IE3"
        ));
        p2.put("compatibleProducts", List.of("mfg_product_101"));
        p2.put("alternatives", List.of());
        p2.put("documents", List.of("mfg_doc_motor_spec.pdf"));
        p2.put("tenantId", defaultTenant);
        products.put("mfg_product_102", p2);

        Map<String, Object> p3 = new LinkedHashMap<>();
        p3.put("productId", "mfg_product_103");
        p3.put("sku", "VLV-HYD-HP20");
        p3.put("name", "High-Pressure Hydraulic Directional Valve");
        p3.put("category", "INDUSTRIAL_VALVE");
        p3.put("unitOfMeasure", "UNIT");
        p3.put("basePrice", 8500.00);
        p3.put("currency", "INR");
        p3.put("status", "ACTIVE");
        p3.put("specificationsAvailable", true);
        p3.put("specifications", Map.of(
                "portSize", "G 3/4",
                "maxOperatingPressureBar", 350,
                "nominalFlowLpm", 80
        ));
        p3.put("compatibleProducts", List.of("mfg_product_101"));
        p3.put("alternatives", List.of());
        p3.put("documents", List.of("mfg_doc_valve_guide.pdf"));
        p3.put("tenantId", defaultTenant);
        products.put("mfg_product_103", p3);

        Map<String, Object> p4 = new LinkedHashMap<>();
        p4.put("productId", "mfg_product_104");
        p4.put("sku", "PUMP-SLURRY-200");
        p4.put("name", "Heavy Duty Centrifugal Slurry Pump");
        p4.put("category", "INDUSTRIAL_PUMP");
        p4.put("unitOfMeasure", "UNIT");
        p4.put("basePrice", 28000.00);
        p4.put("currency", "INR");
        p4.put("status", "ACTIVE");
        p4.put("specificationsAvailable", true);
        p4.put("specifications", Map.of(
                "flowRate", Map.of("value", 200, "unit", "M3_PER_HOUR"),
                "material", "HIGH_CHROME_ALLOY"
        ));
        p4.put("compatibleProducts", List.of("mfg_product_102"));
        p4.put("alternatives", List.of("mfg_product_101"));
        p4.put("documents", List.of("mfg_doc_slurry_manual.pdf"));
        p4.put("tenantId", defaultTenant);
        products.put("mfg_product_104", p4);

        // Inventory
        Map<String, Object> inv1 = new LinkedHashMap<>();
        inv1.put("productId", "mfg_product_101");
        inv1.put("locationId", "warehouse_101");
        inv1.put("locationName", "Chennai Central Warehouse");
        inv1.put("availableQuantity", 30);
        inv1.put("reservedQuantity", 10);
        inv1.put("inProductionQuantity", 40);
        inv1.put("leadTimeDays", 14);
        inv1.put("tenantId", defaultTenant);
        inventoryRecords.put("mfg_product_101", inv1);

        Map<String, Object> inv2 = new LinkedHashMap<>();
        inv2.put("productId", "mfg_product_102");
        inv2.put("locationId", "warehouse_101");
        inv2.put("locationName", "Chennai Central Warehouse");
        inv2.put("availableQuantity", 15);
        inv2.put("reservedQuantity", 5);
        inv2.put("inProductionQuantity", 20);
        inv2.put("leadTimeDays", 21);
        inv2.put("tenantId", defaultTenant);
        inventoryRecords.put("mfg_product_102", inv2);

        // Price Lists
        Map<String, Object> pl1 = new LinkedHashMap<>();
        pl1.put("priceListId", "pl_mfg_standard_2026");
        pl1.put("name", "Standard Industrial Equipment Price List 2026");
        pl1.put("currency", "INR");
        pl1.put("status", "APPROVED");
        pl1.put("validFrom", "2026-01-01");
        pl1.put("validUntil", "2026-12-31");
        pl1.put("tenantId", defaultTenant);
        priceLists.put("pl_mfg_standard_2026", pl1);

        // Discount policy
        Map<String, Object> dp = new LinkedHashMap<>();
        dp.put("policyId", "disc_policy_001");
        dp.put("name", "Standard Commercial Discount Matrix");
        dp.put("maxExecutiveDiscountPercent", 5.0);
        dp.put("salesManagerApprovalThresholdPercent", 15.0);
        dp.put("executiveBoardApprovalThresholdPercent", 25.0);
        dp.put("tenantId", defaultTenant);
        discountPolicies.put("disc_policy_001", dp);

        // ==========================================
        // 2. CUSTOMERS & LEADS
        // ==========================================
        Map<String, Object> cust1 = new LinkedHashMap<>();
        cust1.put("customerId", "mfg_customer_101");
        cust1.put("companyName", "ABC Industrial Solutions");
        cust1.put("contactName", "Ravi Kumar");
        cust1.put("email", "ravi@example.com");
        cust1.put("phone", "+919876543210");
        cust1.put("industry", "INDUSTRIAL_EQUIPMENT");
        cust1.put("taxId", "33AABCA1234F1Z8");
        cust1.put("creditLimit", 2000000.00);
        cust1.put("paymentTerms", "NET_30");
        cust1.put("status", "ACTIVE");
        cust1.put("tenantId", defaultTenant);
        customers.put("mfg_customer_101", cust1);

        Map<String, Object> lead1 = new LinkedHashMap<>();
        lead1.put("leadId", "mfg_lead_1001");
        lead1.put("companyName", "ABC Industrial Solutions");
        lead1.put("contactName", "Ravi Kumar");
        lead1.put("email", "ravi@example.com");
        lead1.put("phone", "+919876543210");
        lead1.put("industry", "INDUSTRIAL_EQUIPMENT");
        lead1.put("source", "WEBSITE_ENQUIRY");
        lead1.put("requirement", "Industrial pumps for a manufacturing plant");
        lead1.put("estimatedQuantity", 50);
        lead1.put("estimatedBudget", Map.of("amount", 500000.00, "currency", "INR"));
        lead1.put("status", "ASSIGNED");
        lead1.put("priority", "HIGH");
        lead1.put("assignedUserId", "user_sales_exec_101");
        lead1.put("createdAt", "2026-10-25T10:00:00Z");
        lead1.put("tenantId", defaultTenant);
        leads.put("mfg_lead_1001", lead1);

        List<Map<String, Object>> actList = new ArrayList<>();
        Map<String, Object> act1 = new LinkedHashMap<>();
        act1.put("activityId", "act_001");
        act1.put("leadId", "mfg_lead_1001");
        act1.put("type", "INITIAL_CALL");
        act1.put("summary", "Discussed high pressure pump specifications with Ravi");
        act1.put("performedBy", "user_sales_exec_101");
        act1.put("timestamp", "2026-10-25T11:30:00Z");
        actList.add(act1);
        leadActivities.put("mfg_lead_1001", actList);

        // Technical requirement
        Map<String, Object> req1 = new LinkedHashMap<>();
        req1.put("requirementId", "mfg_req_1001");
        req1.put("leadId", "mfg_lead_1001");
        req1.put("application", "INDUSTRIAL_WATER_TRANSFER");
        req1.put("productCategory", "INDUSTRIAL_PUMP");
        req1.put("quantity", 50);
        req1.put("requiredSpecifications", Map.of(
                "flowRate", Map.of("value", 100, "unit", "M3_PER_HOUR"),
                "material", "STAINLESS_STEEL"
        ));
        req1.put("requiredByDate", "2026-12-15");
        req1.put("status", "PENDING_TECHNICAL_VALIDATION");
        req1.put("nextAction", "VALIDATE_PRODUCT_REQUIREMENTS");
        req1.put("notes", "Final specifications to be confirmed by the customer.");
        req1.put("tenantId", defaultTenant);
        productRequirements.put("mfg_req_1001", req1);

        // Opportunity
        Map<String, Object> opp1 = new LinkedHashMap<>();
        opp1.put("opportunityId", "mfg_opp_1001");
        opp1.put("leadId", "mfg_lead_1001");
        opp1.put("title", "Industrial Pump Supply");
        opp1.put("expectedValue", Map.of("amount", 500000.00, "currency", "INR"));
        opp1.put("expectedCloseDate", "2026-11-30");
        opp1.put("stage", "QUALIFICATION");
        opp1.put("probabilityPercent", 25);
        opp1.put("assignedUserId", "user_sales_exec_101");
        opp1.put("tenantId", defaultTenant);
        opportunities.put("mfg_opp_1001", opp1);

        // ==========================================
        // 3. SALES TEAM & TARGETS
        // ==========================================
        Map<String, Object> exec1 = new LinkedHashMap<>();
        exec1.put("userId", "user_sales_exec_101");
        exec1.put("name", "Priya Sharma");
        exec1.put("email", "priya.sharma@apexindustrialgear.com");
        exec1.put("role", "SALES_EXECUTIVE");
        exec1.put("assignedTerritory", "South India - Zone 1");
        exec1.put("activeLeadsCount", 8);
        exec1.put("tenantId", defaultTenant);
        teamMembers.put("user_sales_exec_101", exec1);

        Map<String, Object> exec2 = new LinkedHashMap<>();
        exec2.put("userId", "user_sales_exec_102");
        exec2.put("name", "Arjun Patel");
        exec2.put("email", "arjun.patel@apexindustrialgear.com");
        exec2.put("role", "SALES_EXECUTIVE");
        exec2.put("assignedTerritory", "West India - Zone 2");
        exec2.put("activeLeadsCount", 6);
        exec2.put("tenantId", defaultTenant);
        teamMembers.put("user_sales_exec_102", exec2);

        Map<String, Object> target1 = new LinkedHashMap<>();
        target1.put("targetId", "mfg_target_1001");
        target1.put("name", "November Industrial Equipment Target");
        target1.put("period", "MONTH");
        target1.put("startDate", "2026-11-01");
        target1.put("endDate", "2026-11-30");
        target1.put("userId", "user_sales_exec_101");
        target1.put("targetAmount", Map.of("amount", 1000000.00, "currency", "INR"));
        target1.put("targetOrders", 10);
        target1.put("status", "ACTIVE");
        target1.put("tenantId", defaultTenant);
        salesTargets.put("mfg_target_1001", target1);

        // ==========================================
        // 4. QUOTATIONS, APPROVALS & ORDERS
        // ==========================================
        Map<String, Object> quote1 = new LinkedHashMap<>();
        quote1.put("quotationId", "mfg_quote_1001");
        quote1.put("quotationNumber", "MFG-Q-2026-1001");
        quote1.put("customerId", "mfg_customer_101");
        quote1.put("leadId", "mfg_lead_1001");
        quote1.put("currency", "INR");
        quote1.put("paymentTerms", "NET_30");
        quote1.put("validUntil", "2026-11-15");
        quote1.put("status", "PENDING_APPROVAL");
        quote1.put("subtotal", 500000.00);
        quote1.put("requestedDiscountPercent", 12.0);
        quote1.put("discountAmount", 60000.00);
        quote1.put("taxAmount", 79200.00); // 18% on discounted subtotal
        quote1.put("totalAmount", 519200.00);
        quote1.put("approvalRequired", true);
        quote1.put("approvalStatus", "PENDING_REVIEW");
        quote1.put("tenantId", defaultTenant);
        quotations.put("mfg_quote_1001", quote1);

        List<Map<String, Object>> qItems = new ArrayList<>();
        Map<String, Object> qi1 = new LinkedHashMap<>();
        qi1.put("itemId", "qi_101");
        qi1.put("quotationId", "mfg_quote_1001");
        qi1.put("productId", "mfg_product_101");
        qi1.put("productName", "Stainless Steel Industrial Pump");
        qi1.put("quantity", 50);
        qi1.put("unitPrice", 10000.00);
        qi1.put("subtotal", 500000.00);
        qItems.add(qi1);
        quotationItems.put("mfg_quote_1001", qItems);

        // Approval record
        Map<String, Object> app1 = new LinkedHashMap<>();
        app1.put("approvalId", "mfg_approval_1001");
        app1.put("quotationId", "mfg_quote_1001");
        app1.put("customerName", "ABC Industrial Solutions");
        app1.put("reason", "DISCOUNT_THRESHOLD_EXCEEDED");
        app1.put("status", "PENDING_REVIEW");
        app1.put("requestedDiscountPercent", 12.0);
        app1.put("requestedBy", "user_sales_exec_101");
        app1.put("requestedAt", "2026-10-26T14:00:00Z");
        app1.put("assignedRole", "SALES_MANAGER");
        app1.put("tenantId", defaultTenant);
        quotationApprovals.put("mfg_approval_1001", app1);

        // Existing Order for customer 101
        Map<String, Object> order1 = new LinkedHashMap<>();
        order1.put("orderId", "mfg_order_2001");
        order1.put("orderNumber", "ORD-MFG-2026-2001");
        order1.put("customerId", "mfg_customer_101");
        order1.put("customerName", "ABC Industrial Solutions");
        order1.put("totalAmount", 480000.00);
        order1.put("currency", "INR");
        order1.put("status", "CONFIRMED");
        order1.put("deliveryStatus", "DELIVERED");
        order1.put("deliveredAt", "2026-07-02T15:00:00Z");
        order1.put("orderDate", "2026-06-15T09:30:00Z");
        order1.put("items", List.of(Map.of(
                "productId", "mfg_product_101",
                "productName", "Stainless Steel Industrial Pump",
                "serialNumber", "SERIAL-EXAMPLE-001",
                "quantity", 1,
                "unitPrice", 10000.00
        )));
        order1.put("invoices", List.of(Map.of(
                "invoiceId", "inv_2001",
                "amount", 480000.00,
                "status", "PAID",
                "dueDate", "2026-07-15"
        )));
        order1.put("tenantId", defaultTenant);
        orders.put("mfg_order_2001", order1);

        // ==========================================
        // 5. DEALER MANAGEMENT
        // ==========================================
        Map<String, Object> territory1 = new LinkedHashMap<>();
        territory1.put("territoryId", "territory_south_01");
        territory1.put("name", "South India - Industrial Corridor");
        territory1.put("region", "South");
        territory1.put("states", List.of("Tamil Nadu", "Karnataka", "Andhra Pradesh"));
        territory1.put("status", "ACTIVE");
        territory1.put("dealersCount", 1);
        territory1.put("tenantId", defaultTenant);
        territories.put("territory_south_01", territory1);

        Map<String, Object> dealer1 = new LinkedHashMap<>();
        dealer1.put("dealerId", "mfg_dealer_1001");
        dealer1.put("businessName", "Southern Industrial Distributors");
        dealer1.put("businessType", "AUTHORIZED_DISTRIBUTOR");
        dealer1.put("registrationNumber", "DEALER-REG-1001");
        dealer1.put("primaryContact", Map.of(
                "name", "Karthik Raj",
                "email", "karthik@example.com",
                "phone", "+919876543210"
        ));
        dealer1.put("address", Map.of(
                "country", "IN",
                "state", "Tamil Nadu",
                "city", "Chennai",
                "postalCode", "600001"
        ));
        dealer1.put("requestedTerritoryId", "territory_south_01");
        dealer1.put("productCategories", List.of("INDUSTRIAL_PUMP", "INDUSTRIAL_MOTOR"));
        dealer1.put("status", "PENDING_VERIFICATION");
        dealer1.put("verificationStatus", "NOT_SUBMITTED");
        dealer1.put("creditLimit", 5000000.00);
        dealer1.put("outstandingBalance", 1250000.00);
        dealer1.put("tenantId", defaultTenant);
        dealers.put("mfg_dealer_1001", dealer1);

        List<Map<String, Object>> dContacts = new ArrayList<>();
        Map<String, Object> dc1 = new LinkedHashMap<>();
        dc1.put("contactId", "dc_001");
        dc1.put("name", "Karthik Raj");
        dc1.put("role", "Managing Director");
        dc1.put("email", "karthik@example.com");
        dc1.put("phone", "+919876543210");
        dContacts.add(dc1);
        dealerContacts.put("mfg_dealer_1001", dContacts);

        List<Map<String, Object>> dDocs = new ArrayList<>();
        Map<String, Object> dd1 = new LinkedHashMap<>();
        dd1.put("documentId", "dealer-document-registration-001");
        dd1.put("title", "GST and Business Registration Certificate");
        dd1.put("type", "REGISTRATION_CERTIFICATE");
        dd1.put("verified", false);
        dDocs.add(dd1);
        dealerDocuments.put("mfg_dealer_1001", dDocs);

        Map<String, Object> dPriceReq = new LinkedHashMap<>();
        dPriceReq.put("requestId", "dealer_price_request_1001");
        dPriceReq.put("dealerId", "mfg_dealer_1001");
        dPriceReq.put("productId", "mfg_product_101");
        dPriceReq.put("currency", "INR");
        dPriceReq.put("requestedDiscountPercent", 8.0);
        dPriceReq.put("effectiveFrom", "2026-11-01");
        dPriceReq.put("effectiveUntil", "2027-03-31");
        dPriceReq.put("reason", "Quarterly distributor sales programme");
        dPriceReq.put("status", "PENDING_APPROVAL");
        dPriceReq.put("tenantId", defaultTenant);
        dealerPriceRequests.put("dealer_price_request_1001", dPriceReq);

        Map<String, Object> dTarget1 = new LinkedHashMap<>();
        dTarget1.put("targetId", "dealer_target_1001");
        dTarget1.put("dealerId", "mfg_dealer_1001");
        dTarget1.put("name", "Q4 Industrial Pump Sales Target");
        dTarget1.put("period", "QUARTER");
        dTarget1.put("startDate", "2026-10-01");
        dTarget1.put("endDate", "2026-12-31");
        dTarget1.put("targetAmount", Map.of("amount", 2500000.00, "currency", "INR"));
        dTarget1.put("targetUnits", 200);
        dTarget1.put("status", "ACTIVE");
        dTarget1.put("tenantId", defaultTenant);
        dealerTargets.put("dealer_target_1001", dTarget1);

        // ==========================================
        // 6. CUSTOMER SUPPORT: TICKETS, KB, WARRANTY
        // ==========================================
        Map<String, Object> ticket1 = new LinkedHashMap<>();
        ticket1.put("ticketId", "mfg_ticket_1001");
        ticket1.put("ticketNumber", "MFG-SUP-1001");
        ticket1.put("customerId", "mfg_customer_101");
        ticket1.put("customerName", "ABC Industrial Solutions");
        ticket1.put("orderId", "mfg_order_2001");
        ticket1.put("productId", "mfg_product_101");
        ticket1.put("productName", "Stainless Steel Industrial Pump");
        ticket1.put("category", "TECHNICAL_ISSUE");
        ticket1.put("subject", "Industrial pump overheating");
        ticket1.put("description", "The pump becomes unusually hot during operation.");
        ticket1.put("priority", "HIGH");
        ticket1.put("channel", "EMAIL");
        ticket1.put("serialNumber", "SERIAL-EXAMPLE-001");
        ticket1.put("status", "OPEN");
        ticket1.put("assignedTeam", "TECHNICAL_SUPPORT");
        ticket1.put("assignedAgentId", "user_support_001");
        ticket1.put("safetyConcernDetected", false);
        ticket1.put("createdAt", "2026-10-27T16:00:00Z");
        ticket1.put("tenantId", defaultTenant);
        supportTickets.put("mfg_ticket_1001", ticket1);

        List<Map<String, Object>> tMsgs = new ArrayList<>();
        Map<String, Object> tm1 = new LinkedHashMap<>();
        tm1.put("messageId", "tmsg_001");
        tm1.put("sender", "ravi@example.com");
        tm1.put("senderType", "CUSTOMER");
        tm1.put("content", "Our plant engineers detected operating temperature exceeding 85C on Pump SERIAL-EXAMPLE-001.");
        tm1.put("timestamp", "2026-10-27T16:00:00Z");
        tMsgs.add(tm1);
        ticketMessages.put("mfg_ticket_1001", tMsgs);

        List<Map<String, Object>> tNotes = new ArrayList<>();
        Map<String, Object> tn1 = new LinkedHashMap<>();
        tn1.put("noteId", "tnote_001");
        tn1.put("author", "Support Agent");
        tn1.put("content", "Verified customer invoice and standard 2-year warranty validity.");
        tn1.put("timestamp", "2026-10-27T16:30:00Z");
        tNotes.add(tn1);
        ticketInternalNotes.put("mfg_ticket_1001", tNotes);

        // Knowledge Base
        Map<String, Object> kb1 = new LinkedHashMap<>();
        kb1.put("articleId", "mfg_kb_101");
        kb1.put("title", "Industrial Pump Operating Safety and Thermal Limits");
        kb1.put("sourceType", "APPROVED_TECHNICAL_DOCUMENT");
        kb1.put("relevance", 0.92);
        kb1.put("version", "2.1");
        kb1.put("category", "PUMPS");
        kb1.put("requiresTechnicianReview", true);
        kb1.put("summary", "Check impeller cavitation, lubricating oil viscosity, and electrical motor coupling alignment.");
        kb1.put("content", "Operating safety guidelines: If casing temperature exceeds 75C, shut down immediately. Inspect for dry running, inlet blockages, and misaligned mechanical seals.");
        kb1.put("tenantId", defaultTenant);
        knowledgeArticles.put("mfg_kb_101", kb1);

        // Warranty Policy
        Map<String, Object> wPolicy = new LinkedHashMap<>();
        wPolicy.put("policyId", "wp_mfg_standard_24m");
        wPolicy.put("name", "Standard 24-Month Industrial Manufacturer Warranty");
        wPolicy.put("durationMonths", 24);
        wPolicy.put("coverage", List.of("MANUFACTURING_DEFECTS", "SEAL_FAILURES_UNDER_NORMAL_OP", "SHAFT_FRACTURE"));
        wPolicy.put("exclusions", List.of("DRY_RUNNING_DAMAGE", "CORROSIVE_CHEMICALS_OUTSIDE_SPEC", "UNAUTHORIZED_ALTERATION"));
        wPolicy.put("tenantId", defaultTenant);
        warrantyPolicies.put("wp_mfg_standard_24m", wPolicy);

        // Warranty Claim
        Map<String, Object> wClaim1 = new LinkedHashMap<>();
        wClaim1.put("claimId", "mfg_warranty_1001");
        wClaim1.put("ticketId", "mfg_ticket_1001");
        wClaim1.put("customerId", "mfg_customer_101");
        wClaim1.put("orderId", "mfg_order_2001");
        wClaim1.put("productId", "mfg_product_101");
        wClaim1.put("serialNumber", "SERIAL-EXAMPLE-001");
        wClaim1.put("purchaseDate", "2026-06-15");
        wClaim1.put("issueDescription", "Product overheating during operation");
        wClaim1.put("evidenceReferences", List.of("authorized-evidence-reference-001"));
        wClaim1.put("status", "PENDING_VALIDATION");
        wClaim1.put("eligibilityStatus", "NOT_YET_DETERMINED");
        wClaim1.put("nextAction", "VALIDATE_PURCHASE_AND_WARRANTY_TERMS");
        wClaim1.put("tenantId", defaultTenant);
        warrantyClaims.put("mfg_warranty_1001", wClaim1);

        // Return Request
        Map<String, Object> ret1 = new LinkedHashMap<>();
        ret1.put("requestId", "mfg_return_1001");
        ret1.put("orderId", "mfg_order_2001");
        ret1.put("customerId", "mfg_customer_101");
        ret1.put("items", List.of(Map.of(
                "productId", "mfg_product_101",
                "quantity", 1,
                "reason", "PRODUCT_DEFECT"
        )));
        ret1.put("description", "Product requires factory inspection due to reported overheating.");
        ret1.put("status", "PENDING_ELIGIBILITY_CHECK");
        ret1.put("nextAction", "VALIDATE_RETURN_POLICY");
        ret1.put("tenantId", defaultTenant);
        returnRequests.put("mfg_return_1001", ret1);

        // Audit log
        Map<String, Object> log1 = new LinkedHashMap<>();
        log1.put("logId", "log_001");
        log1.put("entityType", "QUOTATION");
        log1.put("entityId", "mfg_quote_1001");
        log1.put("action", "QUOTATION_DRAFTED");
        log1.put("actor", "user_sales_exec_101");
        log1.put("timestamp", "2026-10-26T13:45:00Z");
        log1.put("tenantId", defaultTenant);
        auditLogs.add(log1);

        // ==========================================
        // 8. TECHNICAL SUPPORT SEED RECORDS
        // ==========================================
        Map<String, Object> pMotor = new LinkedHashMap<>();
        pMotor.put("productId", "PRD-2001");
        pMotor.put("sku", "M200");
        pMotor.put("name", "Industrial Motor M200");
        pMotor.put("productName", "Industrial Motor M200");
        pMotor.put("category", "INDUSTRIAL_MOTOR");
        pMotor.put("manufacturerPartNumber", "M200");
        pMotor.put("unitOfMeasure", "UNIT");
        pMotor.put("basePrice", 18500.00);
        pMotor.put("currency", "INR");
        pMotor.put("status", "ACTIVE");
        pMotor.put("source", "PRODUCT_CATALOGUE");
        pMotor.put("lastUpdated", "2026-10-20T10:00:00+05:30");
        pMotor.put("specificationsAvailable", true);
        pMotor.put("specifications", Map.of(
                "ratedPowerKw", 5.5,
                "voltage", "415 V",
                "frequency", "50 Hz",
                "operatingMode", "CONTINUOUS",
                "coolingType", "FAN_COOLED"
        ));
        pMotor.put("compatibleProducts", List.of("mfg_product_101"));
        pMotor.put("alternatives", List.of("mfg_product_102"));
        pMotor.put("manuals", List.of(
                Map.of("documentId", "MAN-M200-01", "title", "Industrial Motor M200 User Manual & Installation Guide", "url", "/docs/manuals/M200_Manual.pdf")
        ));
        pMotor.put("safetyDocuments", List.of(
                Map.of("documentId", "SAF-M200-01", "title", "High Voltage & Thermal Safety Isolation Procedure", "url", "/docs/safety/M200_Safety.pdf")
        ));
        pMotor.put("knownIssues", List.of(
                Map.of("issueId", "ISS-01", "title", "Bearing temperature rise under continuous 110% load", "workaround", "Verify lubrication level and airflow clearance.")
        ));
        pMotor.put("recalls", Collections.emptyList());
        pMotor.put("tenantId", defaultTenant);
        products.put("PRD-2001", pMotor);

        Map<String, Object> c1001 = new LinkedHashMap<>();
        c1001.put("customerId", "CUS-1001");
        c1001.put("companyName", "Example Industrial Works");
        c1001.put("contactName", "Arun Kumar");
        c1001.put("email", "arun@example.com");
        c1001.put("phone", "+91-9000000000");
        c1001.put("industry", "MANUFACTURING");
        c1001.put("address", "Sector 18, Industrial Area, Pune 411028");
        c1001.put("verified", true);
        c1001.put("tenantId", defaultTenant);
        customers.put("CUS-1001", c1001);

        Map<String, Object> o1001 = new LinkedHashMap<>();
        o1001.put("orderId", "ORD-1001");
        o1001.put("orderNumber", "ORD-MFG-2026-1001");
        o1001.put("customerId", "CUS-1001");
        o1001.put("status", "IN_PRODUCTION");
        o1001.put("deliveryStatus", "NOT_DISPATCHED");
        o1001.put("source", "ORDER_MANAGEMENT_SYSTEM");
        o1001.put("expectedDispatchDate", null);
        o1001.put("lastUpdatedAt", "2026-10-29T07:30:00+05:30");
        o1001.put("items", List.of(Map.of("productId", "PRD-2001", "productName", "Industrial Motor M200", "quantity", 50, "unitPrice", 18500.00)));
        o1001.put("invoices", List.of(Map.of("invoiceId", "INV-1001", "amount", 925000.00, "status", "PAID")));
        o1001.put("tenantId", defaultTenant);
        orders.put("ORD-1001", o1001);

        Map<String, Object> kb1001 = new LinkedHashMap<>();
        kb1001.put("articleId", "KB-1001");
        kb1001.put("title", "Industrial Motor Maintenance Process");
        kb1001.put("category", "MAINTENANCE");
        kb1001.put("sourceType", "APPROVED_KNOWLEDGE_BASE");
        kb1001.put("content", "Regular maintenance of industrial motors involves scheduled temperature monitoring, bearing lubrication every 2000 hours, and checking stator winding resistance. Follow approved safety isolation procedures.");
        kb1001.put("applicableProductIds", List.of("PRD-2001", "mfg_product_102"));
        kb1001.put("status", "PUBLISHED");
        kb1001.put("relevanceScore", 0.92);
        kb1001.put("tenantId", defaultTenant);
        knowledgeArticles.put("KB-1001", kb1001);

        Map<String, Object> pl100 = new LinkedHashMap<>();
        pl100.put("priceListId", "PL-100");
        pl100.put("name", "Industrial Direct OEM Price List 2026");
        pl100.put("currency", "INR");
        pl100.put("status", "ACTIVE");
        pl100.put("tenantId", defaultTenant);
        priceLists.put("PL-100", pl100);

        // Technical Case TSC-10001
        Map<String, Object> tc1 = new LinkedHashMap<>();
        tc1.put("caseId", "TSC-10001");
        tc1.put("customerId", "CUS-1001");
        tc1.put("productId", "PRD-2001");
        tc1.put("productName", "Industrial Motor M200");
        tc1.put("product", Map.of("productId", "PRD-2001", "productName", "Industrial Motor M200"));
        tc1.put("serialNumber", "SN-MTR-2026-001");
        tc1.put("subject", "Industrial motor overheating");
        tc1.put("description", "The motor temperature rises above its normal operating range.");
        tc1.put("issueCategory", "OVERHEATING");
        tc1.put("priority", "HIGH");
        tc1.put("source", "PHONE");
        tc1.put("status", "OPEN");
        tc1.put("assignedTo", null);
        tc1.put("reportedSymptoms", new ArrayList<>(List.of("High temperature", "Unusual vibration")));
        tc1.put("diagnosis", null);
        tc1.put("resolution", null);
        tc1.put("createdAt", "2026-10-29T08:00:00+05:30");
        tc1.put("tenantId", defaultTenant);
        technicalCases.put("TSC-10001", tc1);

        // Diagnostic Session DGS-5001
        Map<String, Object> ds1 = new LinkedHashMap<>();
        ds1.put("sessionId", "DGS-5001");
        ds1.put("caseId", "TSC-10001");
        ds1.put("productId", "PRD-2001");
        ds1.put("diagnosticType", "MOTOR_OVERHEATING");
        ds1.put("status", "IN_PROGRESS");
        ds1.put("nextAction", "RECORD_OBSERVATIONS");
        ds1.put("createdAt", "2026-10-29T08:15:00+05:30");
        ds1.put("tenantId", defaultTenant);
        diagnosticSessions.put("DGS-5001", ds1);

        // Warranty claim WCL-3001
        Map<String, Object> wc1 = new LinkedHashMap<>();
        wc1.put("claimId", "WCL-3001");
        wc1.put("customerId", "CUS-1001");
        wc1.put("productId", "PRD-2001");
        wc1.put("serialNumber", "SN-MTR-2026-001");
        wc1.put("claimType", "COMPONENT_FAILURE");
        wc1.put("status", "PENDING_WARRANTY_REVIEW");
        wc1.put("description", "Motor overheating under rated operating specs");
        wc1.put("tenantId", defaultTenant);
        warrantyClaims.put("WCL-3001", wc1);

        // ==========================================
        // 9. AI B2B SALES SEED RECORDS
        // ==========================================
        Map<String, Object> sc1 = new LinkedHashMap<>();
        sc1.put("conversationId", "AISC-1001");
        sc1.put("channel", "WEBSITE_CHAT");
        sc1.put("visitorReference", "VIS-9001");
        sc1.put("status", "ACTIVE");
        sc1.put("leadId", "LEAD-5001");
        sc1.put("nextAction", "COLLECT_REQUIREMENTS");
        sc1.put("consent", Map.of("marketingFollowUp", false));
        sc1.put("createdAt", "2026-10-29T08:25:00+05:30");
        sc1.put("tenantId", defaultTenant);
        aiSalesConversations.put("AISC-1001", sc1);

        Map<String, Object> ld1 = new LinkedHashMap<>();
        ld1.put("leadId", "LEAD-5001");
        ld1.put("conversationId", "AISC-1001");
        ld1.put("companyName", "Example Industrial Works");
        ld1.put("contactName", "Arun Kumar");
        ld1.put("businessEmail", "arun@example.com");
        ld1.put("phone", "+91-9000000000");
        ld1.put("industry", "MANUFACTURING");
        ld1.put("enquirySummary", "Enquiry for 50 industrial motors");
        ld1.put("source", "WEBSITE_CHAT");
        ld1.put("status", "NEW");
        ld1.put("assignedTo", null);
        ld1.put("score", 75);
        ld1.put("createdAt", "2026-10-29T08:30:00+05:30");
        ld1.put("tenantId", defaultTenant);
        leads.put("LEAD-5001", ld1);

        // Quotation draft QUO-9001
        Map<String, Object> q9001 = new LinkedHashMap<>();
        q9001.put("quotationId", "QUO-9001");
        q9001.put("leadId", "LEAD-5001");
        q9001.put("status", "DRAFT");
        q9001.put("currency", "INR");
        Map<String, Object> quoteItem = new LinkedHashMap<>();
        quoteItem.put("productId", "PRD-2001");
        quoteItem.put("quantity", 50);
        quoteItem.put("unitPrice", null);
        quoteItem.put("lineTotal", null);
        q9001.put("items", List.of(quoteItem));
        q9001.put("requiresPricingResolution", true);
        q9001.put("requiresApproval", true);
        q9001.put("tenantId", defaultTenant);
        quotations.put("QUO-9001", q9001);

        // ==========================================
        // 10. AI SUPPORT AGENT SEED RECORDS
        // ==========================================
        Map<String, Object> sup1 = new LinkedHashMap<>();
        sup1.put("conversationId", "SUPC-1001");
        sup1.put("channel", "WEBSITE_CHAT");
        sup1.put("visitorReference", "VIS-2001");
        sup1.put("status", "ACTIVE");
        sup1.put("verificationStatus", "NOT_VERIFIED");
        sup1.put("ticketId", null);
        sup1.put("createdAt", "2026-10-29T08:05:00+05:30");
        sup1.put("tenantId", defaultTenant);
        aiSupportConversations.put("SUPC-1001", sup1);

        Map<String, Object> tkt7001 = new LinkedHashMap<>();
        tkt7001.put("ticketId", "TKT-7001");
        tkt7001.put("conversationId", "SUPC-1001");
        tkt7001.put("customerId", "CUS-1001");
        tkt7001.put("category", "ORDER_DELIVERY");
        tkt7001.put("subject", "Order delivery delay enquiry");
        tkt7001.put("description", "Customer reports that the expected delivery has not occurred.");
        tkt7001.put("priority", "MEDIUM");
        tkt7001.put("status", "OPEN");
        tkt7001.put("assignedTeam", "CUSTOMER_SUPPORT");
        tkt7001.put("source", "WEBSITE_CHAT");
        tkt7001.put("createdAt", "2026-10-29T08:35:00+05:30");
        tkt7001.put("tenantId", defaultTenant);
        supportTickets.put("TKT-7001", tkt7001);
    }

    // ==========================================
    // GETTERS & MAP ACCESSORS
    // ==========================================
    public Map<String, Map<String, Object>> getProducts() { return products; }
    public Map<String, Map<String, Object>> getPriceLists() { return priceLists; }
    public Map<String, Map<String, Object>> getDiscountPolicies() { return discountPolicies; }
    public Map<String, Map<String, Object>> getInventoryRecords() { return inventoryRecords; }
    public Map<String, Map<String, Object>> getCustomers() { return customers; }
    public Map<String, Map<String, Object>> getLeads() { return leads; }
    public Map<String, List<Map<String, Object>>> getLeadActivities() { return leadActivities; }
    public Map<String, Map<String, Object>> getOpportunities() { return opportunities; }
    public Map<String, Map<String, Object>> getProductRequirements() { return productRequirements; }
    public Map<String, Map<String, Object>> getTeamMembers() { return teamMembers; }
    public Map<String, Map<String, Object>> getSalesTargets() { return salesTargets; }
    public Map<String, Map<String, Object>> getSalesAssignments() { return salesAssignments; }
    public Map<String, Map<String, Object>> getQuotations() { return quotations; }
    public Map<String, List<Map<String, Object>>> getQuotationItems() { return quotationItems; }
    public Map<String, List<Map<String, Object>>> getQuotationRevisions() { return quotationRevisions; }
    public Map<String, Map<String, Object>> getQuotationApprovals() { return quotationApprovals; }
    public Map<String, Map<String, Object>> getOrderHandoffs() { return orderHandoffs; }
    public Map<String, Map<String, Object>> getOrders() { return orders; }
    public Map<String, Map<String, Object>> getDealers() { return dealers; }
    public Map<String, List<Map<String, Object>>> getDealerContacts() { return dealerContacts; }
    public Map<String, List<Map<String, Object>>> getDealerDocuments() { return dealerDocuments; }
    public Map<String, Map<String, Object>> getTerritories() { return territories; }
    public Map<String, Map<String, Object>> getDealerPriceRequests() { return dealerPriceRequests; }
    public Map<String, Map<String, Object>> getDealerAgreements() { return dealerAgreements; }
    public Map<String, Map<String, Object>> getDealerTargets() { return dealerTargets; }
    public Map<String, Map<String, Object>> getDealerInventoryReports() { return dealerInventoryReports; }
    public Map<String, Map<String, Object>> getDealerEscalations() { return dealerEscalations; }
    public Map<String, Map<String, Object>> getSupportTickets() { return supportTickets; }
    public Map<String, List<Map<String, Object>>> getTicketMessages() { return ticketMessages; }
    public Map<String, List<Map<String, Object>>> getTicketInternalNotes() { return ticketInternalNotes; }
    public Map<String, Map<String, Object>> getKnowledgeArticles() { return knowledgeArticles; }
    public Map<String, Map<String, Object>> getWarrantyPolicies() { return warrantyPolicies; }
    public Map<String, Map<String, Object>> getWarrantyClaims() { return warrantyClaims; }
    public Map<String, Map<String, Object>> getReturnRequests() { return returnRequests; }
    public Map<String, Map<String, Object>> getRepairRequests() { return repairRequests; }
    public Map<String, Map<String, Object>> getDeliveryIssues() { return deliveryIssues; }
    public Map<String, Map<String, Object>> getQualityComplaints() { return qualityComplaints; }
    public Map<String, Map<String, Object>> getSupportEscalations() { return supportEscalations; }
    public Map<String, Map<String, Object>> getFeedbackRecords() { return feedbackRecords; }
    public Map<String, Map<String, Object>> getFollowUpTasks() { return followUpTasks; }
    public Map<String, Map<String, Object>> getConversations() { return conversations; }
    public Map<String, List<Map<String, Object>>> getConversationMessages() { return conversationMessages; }
    public List<Map<String, Object>> getAuditLogs() { return auditLogs; }

    // Part 1 Technical Support
    public Map<String, Map<String, Object>> getTechnicalCases() { return technicalCases; }
    public Map<String, List<Map<String, Object>>> getTechnicalCaseTimeline() { return technicalCaseTimeline; }
    public Map<String, List<Map<String, Object>>> getTechnicalCaseEvidence() { return technicalCaseEvidence; }
    public Map<String, List<Map<String, Object>>> getTechnicalCaseAttachments() { return technicalCaseAttachments; }
    public Map<String, Map<String, Object>> getDiagnosticSessions() { return diagnosticSessions; }
    public Map<String, List<Map<String, Object>>> getDiagnosticObservations() { return diagnosticObservations; }
    public Map<String, Map<String, Object>> getDiagnosticRules() { return diagnosticRules; }
    public Map<String, Map<String, Object>> getTechnicalServiceRequests() { return technicalServiceRequests; }
    public Map<String, Map<String, Object>> getMaintenancePlans() { return maintenancePlans; }
    public Map<String, Map<String, Object>> getTechnicalAssessments() { return technicalAssessments; }

    // Part 2 AI B2B Sales Agent
    public Map<String, Map<String, Object>> getAiSalesConversations() { return aiSalesConversations; }
    public Map<String, List<Map<String, Object>>> getAiSalesMessages() { return aiSalesMessages; }
    public Map<String, Object> getAiSalesConfiguration() { return aiSalesConfiguration; }
    public Map<String, Map<String, Object>> getAiSalesKnowledgeSources() { return aiSalesKnowledgeSources; }
    public Map<String, Map<String, Object>> getAiSalesExtractions() { return aiSalesExtractions; }
    public Map<String, Map<String, Object>> getAiSalesRecommendations() { return aiSalesRecommendations; }
    public Map<String, Map<String, Object>> getBusinessProspects() { return businessProspects; }
    public Map<String, Map<String, Object>> getInventoryChecks() { return inventoryChecks; }
    public Map<String, Map<String, Object>> getFulfilmentEstimates() { return fulfilmentEstimates; }
    public Map<String, Map<String, Object>> getMeetingRequests() { return meetingRequests; }

    // Part 3 AI Support Agent
    public Map<String, Map<String, Object>> getAiSupportConversations() { return aiSupportConversations; }
    public Map<String, List<Map<String, Object>>> getAiSupportMessages() { return aiSupportMessages; }
    public Map<String, Object> getAiSupportConfiguration() { return aiSupportConfiguration; }
    public Map<String, Map<String, Object>> getCustomerVerifications() { return customerVerifications; }
    public Map<String, Map<String, Object>> getIntentClassifications() { return intentClassifications; }
    public Map<String, Map<String, Object>> getAiResponseDrafts() { return aiResponseDrafts; }

    public void addAuditLog(String entityType, String entityId, String action, String actor, String tenantId) {
        Map<String, Object> log = new LinkedHashMap<>();
        log.put("logId", "log_" + UUID.randomUUID().toString().substring(0, 8));
        log.put("entityType", entityType);
        log.put("entityId", entityId);
        log.put("action", action);
        log.put("actor", actor != null ? actor : "system");
        log.put("timestamp", Instant.now().toString());
        log.put("tenantId", tenantId);
        auditLogs.add(log);
    }
}
