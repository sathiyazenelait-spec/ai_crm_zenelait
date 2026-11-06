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
class ManufacturingAiAndTechnicalIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("01. Technical Support - End-to-End Diagnostic, Service, Warranty Assessment & Safety Escalation")
    void testTechnicalSupportWorkflow() throws Exception {
        // 1. Dashboard
        mockMvc.perform(get("/api/v1/manufacturing/technical-support/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.openCases").value(28))
                .andExpect(jsonPath("$.data.assignedToMe").value(8))
                .andExpect(jsonPath("$.data.averageResolutionHours").value(18.5));

        // 2. Create Case
        String createCaseJson = """
                {
                  "customerId": "CUS-1001",
                  "productId": "PRD-2001",
                  "serialNumber": "SN-MTR-2026-001",
                  "subject": "Industrial motor overheating",
                  "description": "The motor temperature rises above its normal operating range.",
                  "issueCategory": "OVERHEATING",
                  "priority": "HIGH",
                  "source": "PHONE",
                  "reportedSymptoms": [
                    "High temperature",
                    "Unusual vibration"
                  ]
                }
                """;
        mockMvc.perform(post("/api/v1/manufacturing/technical-support/cases")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createCaseJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.caseId").exists())
                .andExpect(jsonPath("$.data.status").value("OPEN"));

        // 3. Get Case
        mockMvc.perform(get("/api/v1/manufacturing/technical-support/cases/TSC-10001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.caseId").value("TSC-10001"))
                .andExpect(jsonPath("$.data.product.productId").value("PRD-2001"));

        // 4. Assign Case
        String assignJson = """
                {
                  "assigneeId": "USR-TECH-101",
                  "reason": "Requires motor diagnostics expertise"
                }
                """;
        mockMvc.perform(post("/api/v1/manufacturing/technical-support/cases/TSC-10001/assign")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(assignJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("ASSIGNED"))
                .andExpect(jsonPath("$.data.assigneeId").value("USR-TECH-101"));

        // 5. Product Specifications
        mockMvc.perform(get("/api/v1/manufacturing/technical-support/products/PRD-2001/specifications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.productId").value("PRD-2001"))
                .andExpect(jsonPath("$.data.specifications.ratedPowerKw").value(5.5));

        // 6. Start Diagnostic Session
        String startDiagJson = """
                {
                  "caseId": "TSC-10001",
                  "productId": "PRD-2001",
                  "diagnosticType": "MOTOR_OVERHEATING",
                  "reportedSymptoms": [
                    "High temperature",
                    "Unusual vibration"
                  ]
                }
                """;
        mockMvc.perform(post("/api/v1/manufacturing/technical-support/diagnostics/sessions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(startDiagJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.sessionId").exists())
                .andExpect(jsonPath("$.data.status").value("IN_PROGRESS"));

        // 7. Record Observations
        String obsJson = """
                {
                  "observations": [
                    {
                      "type": "TEMPERATURE",
                      "value": 92,
                      "unit": "C"
                    },
                    {
                      "type": "VIBRATION",
                      "value": "ABOVE_NORMAL",
                      "unit": "QUALITATIVE"
                    }
                  ]
                }
                """;
        mockMvc.perform(post("/api/v1/manufacturing/technical-support/diagnostics/sessions/DGS-5001/observations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(obsJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.observationsRecorded").value(2));

        // 8. AI Troubleshooting Suggestions
        String suggJson = """
                {
                  "includeKnowledgeBase": true,
                  "includeProductManuals": true,
                  "includeKnownIssues": true
                }
                """;
        mockMvc.perform(post("/api/v1/manufacturing/technical-support/diagnostics/sessions/DGS-5001/suggestions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(suggJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("REQUIRES_TECHNICIAN_REVIEW"))
                .andExpect(jsonPath("$.data.safetyWarning").exists());

        // 9. Service Request
        String srvJson = """
                {
                  "caseId": "TSC-10001",
                  "customerId": "CUS-1001",
                  "productId": "PRD-2001",
                  "serviceType": "ONSITE_INSPECTION",
                  "description": "Technical inspection requested for overheating issue.",
                  "requestedDate": "2026-10-31",
                  "locationId": "LOC-1001"
                }
                """;
        mockMvc.perform(post("/api/v1/manufacturing/technical-support/service-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(srvJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("PENDING_SCHEDULING"))
                .andExpect(jsonPath("$.data.confirmedAppointment").value(false));

        // 10. Warranty Technical Assessment
        String asmJson = """
                {
                  "caseId": "TSC-10001",
                  "findings": [
                    "Reported operating temperature exceeds the threshold entered in the submitted observation."
                  ],
                  "evidenceIds": [
                    "EVD-7001"
                  ],
                  "recommendedAction": "FURTHER_INSPECTION",
                  "confidence": "NEEDS_VERIFICATION"
                }
                """;
        mockMvc.perform(post("/api/v1/manufacturing/technical-support/warranty-claims/WCL-3001/technical-assessment")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(asmJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("PENDING_WARRANTY_REVIEW"))
                .andExpect(jsonPath("$.data.recommendedAction").value("FURTHER_INSPECTION"));

        // 11. Escalate Safety Case
        String escJson = """
                {
                  "reason": "Potential equipment safety concern",
                  "escalationType": "SAFETY",
                  "description": "The reported equipment condition requires immediate review under safety procedure."
                }
                """;
        mockMvc.perform(post("/api/v1/manufacturing/technical-support/cases/TSC-10001/escalate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(escJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("ESCALATED"))
                .andExpect(jsonPath("$.data.priority").value("CRITICAL"))
                .andExpect(jsonPath("$.data.requiresHumanReview").value(true));

        // 12. Resolve Case
        String resJson = """
                {
                  "resolutionCode": "INSPECTION_COMPLETED",
                  "resolutionSummary": "Inspection completed and documented corrective action recorded.",
                  "knowledgeArticleId": "KB-1001",
                  "customerInformed": true
                }
                """;
        mockMvc.perform(post("/api/v1/manufacturing/technical-support/cases/TSC-10001/resolve")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(resJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("RESOLVED"));
    }

    @Test
    @DisplayName("02. AI B2B Sales Agent - Conversation, Lead Creation, Catalog Recommendations, Stock Check & Quote Approval")
    void testAiB2BSalesAgentWorkflow() throws Exception {
        // 1. Dashboard
        mockMvc.perform(get("/api/v1/manufacturing/ai-b2b-sales/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.activeConversations").value(18))
                .andExpect(jsonPath("$.data.quotationDrafts").value(5));

        // 2. Start Conversation
        String convJson = """
                {
                  "channel": "WEBSITE_CHAT",
                  "visitorReference": "VIS-9001",
                  "initialMessage": "We need 50 industrial motors for our factory.",
                  "locale": "en-IN",
                  "consent": {
                    "marketingFollowUp": false
                  }
                }
                """;
        mockMvc.perform(post("/api/v1/manufacturing/ai-b2b-sales/conversations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(convJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.channel").value("WEBSITE_CHAT"))
                .andExpect(jsonPath("$.data.status").value("ACTIVE"));

        // 3. Process Message
        String procJson = """
                {
                  "message": "We need 50 industrial motors for our factory.",
                  "context": {
                    "productCategory": "INDUSTRIAL_MOTORS",
                    "quantity": 50
                  }
                }
                """;
        mockMvc.perform(post("/api/v1/manufacturing/ai-b2b-sales/conversations/AISC-1001/process")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(procJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.intent").value("B2B_PRODUCT_ENQUIRY"))
                .andExpect(jsonPath("$.data.identifiedRequirements.quantity").value(50));

        // 4. Create Lead
        String leadJson = """
                {
                  "conversationId": "AISC-1001",
                  "companyName": "Example Industrial Works",
                  "contactName": "Arun Kumar",
                  "businessEmail": "arun@example.com",
                  "phone": "+91-9000000000",
                  "industry": "MANUFACTURING",
                  "enquirySummary": "Enquiry for 50 industrial motors",
                  "source": "WEBSITE_CHAT"
                }
                """;
        mockMvc.perform(post("/api/v1/manufacturing/ai-b2b-sales/leads")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(leadJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.companyName").value("Example Industrial Works"))
                .andExpect(jsonPath("$.data.status").value("NEW"));

        // 5. Extract Requirements
        String extJson = """
                {
                  "leadId": "LEAD-5001",
                  "conversationId": "AISC-1001",
                  "customerMessage": "We need 50 motors, 5.5 kW, 415 V, for continuous operation."
                }
                """;
        mockMvc.perform(post("/api/v1/manufacturing/ai-b2b-sales/requirement-extractions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(extJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.requirements.ratedPowerKw").value(5.5))
                .andExpect(jsonPath("$.data.requirements.voltage").value("415 V"));

        // 6. Product Recommendations
        String recJson = """
                {
                  "leadId": "LEAD-5001",
                  "requirements": {
                    "quantity": 50,
                    "ratedPowerKw": 5.5,
                    "voltage": "415 V",
                    "operatingMode": "CONTINUOUS"
                  }
                }
                """;
        mockMvc.perform(post("/api/v1/manufacturing/ai-b2b-sales/product-recommendations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(recJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("CATALOGUE_VALIDATION_REQUIRED"));

        // 7. Check Pricing
        mockMvc.perform(get("/api/v1/manufacturing/ai-b2b-sales/price-lists/PL-100/products/PRD-2001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.unitPrice").value(18500.0))
                .andExpect(jsonPath("$.data.currency").value("INR"));

        // 8. Inventory Availability Check
        String invJson = """
                {
                  "productId": "PRD-2001",
                  "quantity": 50,
                  "requiredBy": "2026-11-15",
                  "locationId": "LOC-1001"
                }
                """;
        mockMvc.perform(post("/api/v1/manufacturing/ai-b2b-sales/inventory/availability-checks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.availabilityStatus").value("PARTIAL"))
                .andExpect(jsonPath("$.data.availableQuantity").value(20))
                .andExpect(jsonPath("$.data.shortfallQuantity").value(30));

        // 9. Quotation Draft
        String quoJson = """
                {
                  "leadId": "LEAD-5001",
                  "currency": "INR",
                  "items": [
                    {
                      "productId": "PRD-2001",
                      "quantity": 50
                    }
                  ],
                  "notes": "Draft prepared for internal review"
                }
                """;
        mockMvc.perform(post("/api/v1/manufacturing/ai-b2b-sales/quotations/drafts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(quoJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("DRAFT"))
                .andExpect(jsonPath("$.data.requiresApproval").value(true));

        // 10. Request Quotation Approval
        String aprJson = """
                {
                  "reason": "B2B quotation requires authorized commercial review"
                }
                """;
        mockMvc.perform(post("/api/v1/manufacturing/ai-b2b-sales/quotations/QUO-9001/request-approval")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(aprJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("PENDING_APPROVAL"));

        // 11. Create Follow-up
        String fupJson = """
                {
                  "leadId": "LEAD-5001",
                  "conversationId": "AISC-1001",
                  "followUpType": "COLLECT_REQUIREMENTS",
                  "dueAt": "2026-10-30T10:00:00+05:30",
                  "reason": "Awaiting technical requirements from prospect"
                }
                """;
        mockMvc.perform(post("/api/v1/manufacturing/ai-b2b-sales/follow-ups")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(fupJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.taskId").exists());

        // 12. Human Handoff
        String handoffJson = """
                {
                  "reason": "Technical product suitability requires human review",
                  "targetTeam": "MANUFACTURING_SALES",
                  "summary": "Prospect requires 50 motors and has supplied preliminary specs."
                }
                """;
        mockMvc.perform(post("/api/v1/manufacturing/ai-b2b-sales/conversations/AISC-1001/handoff")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(handoffJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("HANDOFF_PENDING"));
    }

    @Test
    @DisplayName("03. AI Support Agent - Support Conversation, Verification, Order Status, KB Grounding & RMA Return")
    void testAiSupportAgentWorkflow() throws Exception {
        // 1. Dashboard
        mockMvc.perform(get("/api/v1/manufacturing/ai-support/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.activeConversations").value(42))
                .andExpect(jsonPath("$.data.automationRate").value(68.5));

        // 2. Start Support Conversation
        String convJson = """
                {
                  "channel": "WEBSITE_CHAT",
                  "visitorReference": "VIS-2001",
                  "initialMessage": "My industrial equipment order has not arrived.",
                  "locale": "en-IN"
                }
                """;
        mockMvc.perform(post("/api/v1/manufacturing/ai-support/conversations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(convJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("ACTIVE"))
                .andExpect(jsonPath("$.data.verificationStatus").value("NOT_VERIFIED"));

        // 3. Classify Intent
        String classifyJson = """
                {
                  "conversationId": "SUPC-1001",
                  "message": "My industrial equipment order has not arrived."
                }
                """;
        mockMvc.perform(post("/api/v1/manufacturing/ai-support/intents/classify")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(classifyJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.intent").value("ORDER_DELIVERY_ENQUIRY"))
                .andExpect(jsonPath("$.data.requiresCustomerVerification").value(true));

        // 4. Begin Customer Verification
        String verJson = """
                {
                  "conversationId": "SUPC-1001",
                  "verificationMethod": "REGISTERED_CHANNEL_CHALLENGE"
                }
                """;
        mockMvc.perform(post("/api/v1/manufacturing/ai-support/customer-verifications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(verJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.verificationId").exists())
                .andExpect(jsonPath("$.data.status").value("PENDING"));

        // 5. Retrieve Order Status
        mockMvc.perform(get("/api/v1/manufacturing/ai-support/orders/ORD-1001/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.orderId").value("ORD-1001"))
                .andExpect(jsonPath("$.data.status").value("IN_PRODUCTION"))
                .andExpect(jsonPath("$.data.deliveryStatus").value("NOT_DISPATCHED"));

        // 6. Search Approved Knowledge
        String kbSearchJson = """
                {
                  "query": "How should a customer request industrial motor maintenance?",
                  "productId": "PRD-2001",
                  "topK": 5
                }
                """;
        mockMvc.perform(post("/api/v1/manufacturing/ai-support/knowledge/search")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(kbSearchJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.results", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.data.results[*].articleId", hasItem("KB-1001")));

        // 7. Grounded Answer
        String ansJson = """
                {
                  "conversationId": "SUPC-1001",
                  "question": "How do I request maintenance for my industrial motor?",
                  "productId": "PRD-2001"
                }
                """;
        mockMvc.perform(post("/api/v1/manufacturing/ai-support/knowledge/answer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(ansJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.answer").exists())
                .andExpect(jsonPath("$.data.sourceReferences[0].articleId").value("KB-1001"));

        // 8. Create Support Ticket
        String tktJson = """
                {
                  "conversationId": "SUPC-1001",
                  "customerId": "CUS-1001",
                  "category": "ORDER_DELIVERY",
                  "subject": "Order delivery delay enquiry",
                  "description": "Customer reports that expected delivery has not occurred.",
                  "priority": "MEDIUM",
                  "source": "WEBSITE_CHAT"
                }
                """;
        mockMvc.perform(post("/api/v1/manufacturing/ai-support/tickets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(tktJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.ticketId").exists())
                .andExpect(jsonPath("$.data.status").value("OPEN"));

        // 9. Draft Response
        String draftJson = """
                {
                  "conversationId": "SUPC-1001",
                  "ticketId": "TKT-7001",
                  "customerMessage": "Can you tell me why my order is delayed?",
                  "includeOrderContext": true,
                  "includeKnowledgeBase": true
                }
                """;
        mockMvc.perform(post("/api/v1/manufacturing/ai-support/responses/draft")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(draftJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("DRAFT"))
                .andExpect(jsonPath("$.data.requiresHumanReview").value(true));

        // 10. Validate Response
        String valJson = """
                {
                  "responseId": "RSP-8001"
                }
                """;
        mockMvc.perform(post("/api/v1/manufacturing/ai-support/responses/validate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(valJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.validationStatus").value("PASSED_WITH_REVIEW_REQUIRED"))
                .andExpect(jsonPath("$.data.humanApprovalRequired").value(true));

        // 11. Escalate Conversation to Human
        String escJson = """
                {
                  "reason": "Customer requires investigation into a delayed order",
                  "targetTeam": "CUSTOMER_SUPPORT",
                  "summary": "Customer reports delivery delay. Current status and cause require review."
                }
                """;
        mockMvc.perform(post("/api/v1/manufacturing/ai-support/conversations/SUPC-1001/handoff")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(escJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("HANDOFF_PENDING"));

        // 12. Create Return Request (RMA)
        String rmaJson = """
                {
                  "customerId": "CUS-1001",
                  "orderId": "ORD-1001",
                  "productId": "PRD-2001",
                  "quantity": 1,
                  "reason": "PRODUCT_DEFECT_REPORTED",
                  "description": "Customer reports a problem with delivered product."
                }
                """;
        mockMvc.perform(post("/api/v1/manufacturing/ai-support/return-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(rmaJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("PENDING_ELIGIBILITY_CHECK"));
    }
}
