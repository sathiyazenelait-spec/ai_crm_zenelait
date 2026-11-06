package com.zenelait.crm.manufacturing;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ManufacturingTenantIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("01. Sales Manager - Dashboard, Lead Creation, Assignment & Quotation Approval")
    void testSalesManagerWorkflow() throws Exception {
        // 1. Dashboard
        mockMvc.perform(get("/api/v1/manufacturing/sales-manager/dashboard?period=MONTH"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.revenue").value(2850000.00))
                .andExpect(jsonPath("$.data.totalLeads").value(240));

        // 2. Create Lead
        String createLeadJson = """
                {
                  "companyName": "ABC Industrial Solutions",
                  "contactName": "Ravi Kumar",
                  "email": "ravi@example.com",
                  "phone": "+919876543210",
                  "industry": "INDUSTRIAL_EQUIPMENT",
                  "source": "WEBSITE_ENQUIRY",
                  "requirement": "Industrial pumps for a manufacturing plant",
                  "estimatedQuantity": 50,
                  "estimatedBudget": {
                    "amount": 500000,
                    "currency": "INR"
                  }
                }
                """;

        mockMvc.perform(post("/api/v1/manufacturing/sales-manager/leads")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createLeadJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.leadId").exists())
                .andExpect(jsonPath("$.data.status").value("NEW"));

        // 3. Assign Lead
        String assignJson = """
                {
                  "salesExecutiveId": "user_sales_exec_101",
                  "reason": "Industrial equipment enquiry"
                }
                """;

        mockMvc.perform(post("/api/v1/manufacturing/sales-manager/leads/mfg_lead_1001/assign")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(assignJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.assignedUserId").value("user_sales_exec_101"))
                .andExpect(jsonPath("$.data.status").value("ASSIGNED"));

        // 4. Pending Quotation Approvals
        mockMvc.perform(get("/api/v1/manufacturing/sales-manager/quotation-approvals?status=PENDING_REVIEW"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.items", hasSize(greaterThanOrEqualTo(1))));

        // 5. Approve Quotation
        String approveJson = """
                {
                  "decision": "APPROVE",
                  "comment": "Approved according to the configured discount policy."
                }
                """;

        mockMvc.perform(post("/api/v1/manufacturing/sales-manager/quotation-approvals/mfg_approval_1001/decision")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(approveJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("APPROVED"))
                .andExpect(jsonPath("$.data.decision").value("APPROVE"))
                .andExpect(jsonPath("$.data.approvedBy").value("authenticated-manager"));
    }

    @Test
    @DisplayName("02. Sales Executive - Product Requirements, Inventory Availability & Quotation Draft")
    void testSalesExecutiveRequirementsAndInventory() throws Exception {
        // 1. Get assigned leads
        mockMvc.perform(get("/api/v1/manufacturing/sales-executive/my-leads?status=ASSIGNED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.items", hasSize(greaterThanOrEqualTo(1))));

        // 2. Create product requirement
        String reqJson = """
                {
                  "leadId": "mfg_lead_1001",
                  "application": "INDUSTRIAL_WATER_TRANSFER",
                  "productCategory": "INDUSTRIAL_PUMP",
                  "quantity": 50,
                  "requiredSpecifications": {
                    "flowRate": {
                      "value": 100,
                      "unit": "M3_PER_HOUR"
                    },
                    "material": "STAINLESS_STEEL"
                  },
                  "requiredByDate": "2026-12-15",
                  "notes": "Final specifications to be confirmed by the customer."
                }
                """;

        mockMvc.perform(post("/api/v1/manufacturing/sales-executive/product-requirements")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(reqJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("PENDING_TECHNICAL_VALIDATION"))
                .andExpect(jsonPath("$.data.nextAction").value("VALIDATE_PRODUCT_REQUIREMENTS"));

        // 3. Search products
        mockMvc.perform(get("/api/v1/manufacturing/sales-executive/products?category=INDUSTRIAL_PUMP&search=water"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.items[0].sku").value("PUMP-SS-100"));

        // 4. Check inventory availability
        String invCheckJson = """
                {
                  "items": [
                    {
                      "productId": "mfg_product_101",
                      "quantity": 50
                    }
                  ],
                  "requiredByDate": "2026-12-15",
                  "fulfilmentLocationId": "warehouse_101"
                }
                """;

        mockMvc.perform(post("/api/v1/manufacturing/sales-executive/inventory/availability-checks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invCheckJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("COMPLETED"))
                .andExpect(jsonPath("$.data.items[0].requestedQuantity").value(50))
                .andExpect(jsonPath("$.data.items[0].availableQuantity").value(30))
                .andExpect(jsonPath("$.data.items[0].shortageQuantity").value(20))
                .andExpect(jsonPath("$.data.items[0].availability").value("PARTIALLY_AVAILABLE"));

        // 5. Create quotation draft
        String quoteJson = """
                {
                  "leadId": "mfg_lead_1001",
                  "customerId": "mfg_customer_101",
                  "currency": "INR",
                  "paymentTerms": "NET_30",
                  "validUntil": "2026-11-15",
                  "items": [
                    {
                      "productId": "mfg_product_101",
                      "quantity": 50,
                      "unitPrice": 10000
                    }
                  ]
                }
                """;

        mockMvc.perform(post("/api/v1/manufacturing/sales-executive/quotations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(quoteJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("DRAFT"))
                .andExpect(jsonPath("$.data.subtotal").value(500000.00))
                .andExpect(jsonPath("$.data.approvalRequired").value(true));
    }

    @Test
    @DisplayName("03. Quotation Guardrails - Unapproved Send & Unaccepted Handoff Blocked with 409 Conflict")
    void testQuotationAndOrderHandoffGuardrails() throws Exception {
        // 1. Create a draft quotation that requires approval
        String quoteJson = """
                {
                  "leadId": "mfg_lead_1001",
                  "customerId": "mfg_customer_101",
                  "currency": "INR",
                  "items": [
                    {
                      "productId": "mfg_product_101",
                      "quantity": 20,
                      "unitPrice": 10000
                    }
                  ]
                }
                """;

        String res = mockMvc.perform(post("/api/v1/manufacturing/sales-executive/quotations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(quoteJson))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        // Extract quotationId
        String qId = res.split("\"quotationId\":\"")[1].split("\"")[0];

        // 2. Attempt to send unapproved quotation -> must return 409 Conflict
        String sendJson = """
                {
                  "channel": "EMAIL",
                  "templateId": "manufacturing_quotation_v1"
                }
                """;

        mockMvc.perform(post("/api/v1/manufacturing/sales-executive/quotations/" + qId + "/send")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(sendJson))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Quotation cannot be sent"))
                .andExpect(jsonPath("$.errors[0].field").value("approvalStatus"));

        // 3. Attempt to create order handoff for unaccepted quotation -> must return 409 Conflict
        String handoffJson = """
                {
                  "customerAcceptanceReference": "verified-customer-acceptance",
                  "requestedDeliveryDate": "2026-12-15",
                  "notes": "Verify production capacity and inventory before order confirmation."
                }
                """;

        mockMvc.perform(post("/api/v1/manufacturing/sales-executive/quotations/" + qId + "/order-handoffs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(handoffJson))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Order handoff cannot be created"))
                .andExpect(jsonPath("$.errors[0].field").value("quotation"));
    }

    @Test
    @DisplayName("04. Dealer Manager - Registration, Verification, Territory & Price Request")
    void testDealerManagerWorkflow() throws Exception {
        // 1. Register Dealer
        String regDealerJson = """
                {
                  "businessName": "Southern Industrial Distributors",
                  "businessType": "AUTHORIZED_DISTRIBUTOR",
                  "registrationNumber": "DEALER-REG-1001",
                  "primaryContact": {
                    "name": "Karthik Raj",
                    "email": "karthik@example.com",
                    "phone": "+919876543210"
                  },
                  "address": {
                    "country": "IN",
                    "state": "Tamil Nadu",
                    "city": "Chennai",
                    "postalCode": "600001"
                  },
                  "requestedTerritoryId": "territory_south_01",
                  "productCategories": [
                    "INDUSTRIAL_PUMP",
                    "INDUSTRIAL_MOTOR"
                  ]
                }
                """;

        mockMvc.perform(post("/api/v1/manufacturing/dealer-manager/dealers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(regDealerJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("PENDING_VERIFICATION"))
                .andExpect(jsonPath("$.data.verificationStatus").value("NOT_SUBMITTED"));

        // 2. Submit Verification
        String verifyJson = """
                {
                  "documentReferences": [
                    "dealer-document-registration-001",
                    "dealer-document-tax-001"
                  ],
                  "declarationAccepted": true
                }
                """;

        mockMvc.perform(post("/api/v1/manufacturing/dealer-manager/dealers/mfg_dealer_1001/submit-verification")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(verifyJson))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.verificationStatus").value("PENDING_REVIEW"));

        // 3. Verification Decision
        String decisionJson = """
                {
                  "decision": "APPROVE",
                  "comment": "Required dealer documents verified according to company policy."
                }
                """;

        mockMvc.perform(post("/api/v1/manufacturing/dealer-manager/dealers/mfg_dealer_1001/verification-decision")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(decisionJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.verificationStatus").value("VERIFIED"))
                .andExpect(jsonPath("$.data.dealerStatus").value("PENDING_ACTIVATION"));

        // 4. Assign Dealer to Territory
        String territoryJson = """
                {
                  "dealerId": "mfg_dealer_1001",
                  "effectiveFrom": "2026-11-01",
                  "productCategories": [
                    "INDUSTRIAL_PUMP",
                    "INDUSTRIAL_MOTOR"
                  ]
                }
                """;

        mockMvc.perform(post("/api/v1/manufacturing/dealer-manager/territories/territory_south_01/dealers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(territoryJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.territoryId").value("territory_south_01"));

        // 5. Dealer Price Request
        String priceReqJson = """
                {
                  "dealerId": "mfg_dealer_1001",
                  "productId": "mfg_product_101",
                  "currency": "INR",
                  "requestedDiscountPercent": 8,
                  "effectiveFrom": "2026-11-01",
                  "effectiveUntil": "2027-03-31",
                  "reason": "Quarterly distributor sales programme"
                }
                """;

        mockMvc.perform(post("/api/v1/manufacturing/dealer-manager/dealer-price-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(priceReqJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("PENDING_APPROVAL"));
    }

    @Test
    @DisplayName("05. Customer Support - Ticket Creation, AI Classification, Knowledge Search & Warranty Validation")
    void testCustomerSupportWorkflow() throws Exception {
        // 1. Dashboard
        mockMvc.perform(get("/api/v1/manufacturing/customer-support/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.openTickets").value(86));

        // 2. Create Ticket
        String ticketJson = """
                {
                  "customerId": "mfg_customer_101",
                  "orderId": "mfg_order_2001",
                  "productId": "mfg_product_101",
                  "category": "TECHNICAL_ISSUE",
                  "subject": "Industrial pump overheating",
                  "description": "The pump becomes unusually hot during operation.",
                  "priority": "HIGH",
                  "channel": "EMAIL",
                  "serialNumber": "SERIAL-EXAMPLE-001"
                }
                """;

        mockMvc.perform(post("/api/v1/manufacturing/customer-support/tickets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(ticketJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.category").value("TECHNICAL_ISSUE"))
                .andExpect(jsonPath("$.data.priority").value("HIGH"));

        // 3. Classify Ticket
        String classifyJson = """
                {
                  "includePriorityRecommendation": true,
                  "includeSafetyRiskAssessment": true
                }
                """;

        mockMvc.perform(post("/api/v1/manufacturing/customer-support/tickets/mfg_ticket_1001/classify")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(classifyJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.suggestedSubcategory").value("OVERHEATING"))
                .andExpect(jsonPath("$.data.safetyConcernDetected").value(true))
                .andExpect(jsonPath("$.data.recommendedAction").value("ESCALATE_TO_QUALIFIED_TECHNICIAN"));

        // 4. Knowledge Search Grounded in Approved Docs
        String kbSearchJson = """
                {
                  "query": "industrial pump overheating troubleshooting",
                  "productId": "mfg_product_101",
                  "language": "en",
                  "limit": 5
                }
                """;

        mockMvc.perform(post("/api/v1/manufacturing/customer-support/knowledge/search")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(kbSearchJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.results[0].articleId").value("mfg_kb_101"))
                .andExpect(jsonPath("$.data.results[0].sourceType").value("APPROVED_TECHNICAL_DOCUMENT"));

        // 5. Validate Warranty Claim
        String validateClaimJson = """
                {
                  "checkPurchaseRecord": true,
                  "checkSerialNumber": true,
                  "checkWarrantyPeriod": true,
                  "checkProductEligibility": true
                }
                """;

        mockMvc.perform(post("/api/v1/manufacturing/customer-support/warranty-claims/mfg_warranty_1001/validate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validateClaimJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.validationStatus").value("REQUIRES_REVIEW"))
                .andExpect(jsonPath("$.data.checks", hasSize(4)));

        // 6. Resolution Guardrail - Blocked without customer confirmation
        String resolveJson = """
                {
                  "resolutionCode": "TECHNICAL_GUIDANCE_PROVIDED",
                  "resolutionSummary": "Approved technical support instructions were provided.",
                  "customerConfirmationReceived": false
                }
                """;

        mockMvc.perform(post("/api/v1/manufacturing/customer-support/tickets/mfg_ticket_1001/resolve")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(resolveJson))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Ticket cannot be resolved under the current policy"))
                .andExpect(jsonPath("$.errors[0].field").value("customerConfirmationReceived"));
    }
}
