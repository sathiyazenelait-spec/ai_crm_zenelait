package com.zenelait.crm.consulting;

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
class ConsultingTenantIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("01. Sales Manager - Dashboard, Lead Creation & Assignment")
    void testSalesManagerDashboardAndLeadAssignment() throws Exception {
        // API 1: Dashboard
        mockMvc.perform(get("/api/v1/consulting/sales-manager/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Sales Manager dashboard retrieved"))
                .andExpect(jsonPath("$.data.totalLeads").value(145))
                .andExpect(jsonPath("$.data.pipelineValue").value(8500000.0))
                .andExpect(jsonPath("$.requestId").value("req_sm_001"));

        // API 2: Create consulting lead
        String createLead = """
                {
                  "companyName": "Example Manufacturing Ltd",
                  "contactName": "Arun Kumar",
                  "email": "arun@example.com",
                  "phone": "+91-9000000000",
                  "industry": "MANUFACTURING",
                  "serviceInterest": "DIGITAL_TRANSFORMATION",
                  "source": "WEBSITE",
                  "description": "Looking for consulting services to modernize internal business processes."
                }
                """;

        mockMvc.perform(post("/api/v1/consulting/sales-manager/leads")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createLead))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Consulting lead created"))
                .andExpect(jsonPath("$.data.leadId").exists())
                .andExpect(jsonPath("$.data.status").value("NEW"))
                .andExpect(jsonPath("$.requestId").value("req_sm_002"));

        // API 3: Assign lead
        String assignLead = """
                {
                  "assigneeId": "USR-EXEC-101",
                  "reason": "Relevant experience in digital transformation consulting"
                }
                """;

        mockMvc.perform(post("/api/v1/consulting/sales-manager/leads/CLD-1001/assign")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(assignLead))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Lead assigned successfully"))
                .andExpect(jsonPath("$.data.leadId").value("CLD-1001"))
                .andExpect(jsonPath("$.data.status").value("ASSIGNED"))
                .andExpect(jsonPath("$.requestId").value("req_sm_003"));
    }

    @Test
    @DisplayName("02. Sales Manager - Pipeline, Opportunities, Targets, Proposals & Engagement Handoff")
    void testSalesManagerCommercialWorkflows() throws Exception {
        // API 4: Pipeline
        mockMvc.perform(get("/api/v1/consulting/sales-manager/pipeline?stage=PROPOSAL&size=20&page=0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Sales pipeline retrieved"))
                .andExpect(jsonPath("$.data.items").isArray())
                .andExpect(jsonPath("$.requestId").value("req_sm_004"));

        // API 5: Create Opportunity
        String createOpp = """
                {
                  "leadId": "CLD-1001",
                  "opportunityName": "Digital Transformation Consulting",
                  "serviceId": "CSVC-1001",
                  "estimatedValue": 1200000,
                  "currency": "INR",
                  "expectedCloseDate": "2026-11-30",
                  "description": "Consulting engagement to assess and modernize business processes."
                }
                """;

        mockMvc.perform(post("/api/v1/consulting/sales-manager/opportunities")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createOpp))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Opportunity created"))
                .andExpect(jsonPath("$.data.stage").value("QUALIFICATION"))
                .andExpect(jsonPath("$.requestId").value("req_sm_005"));

        // API 6: Update Opportunity Stage
        String updateStage = """
                {
                  "stage": "PROPOSAL",
                  "reason": "Client requirements have been documented and proposal preparation has started."
                }
                """;

        mockMvc.perform(post("/api/v1/consulting/sales-manager/opportunities/OPP-2001/stage")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateStage))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Opportunity stage updated"))
                .andExpect(jsonPath("$.data.currentStage").value("PROPOSAL"))
                .andExpect(jsonPath("$.requestId").value("req_sm_006"));

        // API 7: Create Sales Target
        String createTarget = """
                {
                  "targetName": "November Consulting Sales",
                  "periodType": "MONTHLY",
                  "periodStart": "2026-11-01",
                  "periodEnd": "2026-11-30",
                  "targetType": "CLOSED_WON_VALUE",
                  "targetValue": 2500000,
                  "currency": "INR",
                  "teamId": "TEAM-CONSULTING-01"
                }
                """;

        mockMvc.perform(post("/api/v1/consulting/sales-manager/targets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createTarget))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Sales target created"))
                .andExpect(jsonPath("$.data.targetId").exists())
                .andExpect(jsonPath("$.requestId").value("req_sm_007"));

        // API 8: Pending Proposal Approvals
        mockMvc.perform(get("/api/v1/consulting/sales-manager/proposals/pending-approval"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Pending proposal approvals retrieved"))
                .andExpect(jsonPath("$.requestId").value("req_sm_008"));

        // API 9: Approve proposal
        String approveProposal = """
                {
                  "decision": "APPROVED",
                  "comments": "Approved within the configured commercial authority."
                }
                """;

        mockMvc.perform(post("/api/v1/consulting/sales-manager/proposals/PROP-4001/decision")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(approveProposal))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Proposal decision recorded"))
                .andExpect(jsonPath("$.data.status").value("APPROVED"))
                .andExpect(jsonPath("$.requestId").value("req_sm_009"));

        // API 10: Team Performance
        mockMvc.perform(get("/api/v1/consulting/sales-manager/team-performance?period=MONTHLY"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Team performance retrieved"))
                .andExpect(jsonPath("$.requestId").value("req_sm_010"));

        // API 11: Initiate Delivery Handoff
        String handoffJson = """
                {
                  "opportunityId": "OPP-2001",
                  "contractId": "CON-5001",
                  "receivingTeamId": "TEAM-DELIVERY-01",
                  "handoffSummary": "Client has accepted the consulting proposal and the engagement is ready for delivery planning."
                }
                """;

        mockMvc.perform(post("/api/v1/consulting/sales-manager/engagement-handoffs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(handoffJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Engagement handoff initiated"))
                .andExpect(jsonPath("$.data.status").value("PENDING_ACCEPTANCE"))
                .andExpect(jsonPath("$.requestId").value("req_sm_011"));
    }

    @Test
    @DisplayName("03. Sales Executive - Dashboard, Discovery, Proposals & Handoffs")
    void testSalesExecutiveWorkflows() throws Exception {
        // API 1: Dashboard
        mockMvc.perform(get("/api/v1/consulting/sales-executive/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Sales Executive dashboard retrieved"))
                .andExpect(jsonPath("$.data.assignedLeads").exists())
                .andExpect(jsonPath("$.requestId").value("req_se_001"));

        // API 2: My Leads
        mockMvc.perform(get("/api/v1/consulting/sales-executive/my-leads?page=0&size=20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Assigned leads retrieved"))
                .andExpect(jsonPath("$.requestId").value("req_se_002"));

        // API 3: Discovery Session
        String discJson = """
                {
                  "leadId": "CLD-1001",
                  "clientId": "CLI-1001",
                  "meetingType": "BUSINESS_DISCOVERY",
                  "scheduledAt": "2026-10-30T10:00:00+05:30",
                  "objective": "Understand business challenges and consulting requirements."
                }
                """;

        mockMvc.perform(post("/api/v1/consulting/sales-executive/discovery-sessions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(discJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Discovery session created"))
                .andExpect(jsonPath("$.data.status").value("SCHEDULE_REQUESTED"))
                .andExpect(jsonPath("$.requestId").value("req_se_003"));

        // API 4: Record requirements
        String reqJson = """
                {
                  "businessChallenge": "Manual processes cause reporting delays.",
                  "desiredOutcomes": [
                    "Reduce reporting time",
                    "Improve process visibility"
                  ],
                  "currentSystems": [
                    "Legacy ERP",
                    "Spreadsheet-based reporting"
                  ],
                  "budgetRange": {
                    "minimum": 500000,
                    "maximum": 1500000,
                    "currency": "INR"
                  },
                  "targetCompletionDate": "2027-03-31"
                }
                """;

        mockMvc.perform(post("/api/v1/consulting/sales-executive/discovery-sessions/DISC-1001/requirements")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(reqJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Consulting requirements recorded"))
                .andExpect(jsonPath("$.data.status").value("DRAFT"))
                .andExpect(jsonPath("$.requestId").value("req_se_004"));

        // API 5: Create Opportunity
        String oppJson = """
                {
                  "leadId": "CLD-1001",
                  "opportunityName": "Business Process Modernization",
                  "serviceId": "CSVC-1001",
                  "estimatedValue": 1200000,
                  "currency": "INR",
                  "expectedCloseDate": "2026-11-30",
                  "requirementId": "REQ-1001"
                }
                """;

        mockMvc.perform(post("/api/v1/consulting/sales-executive/opportunities")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(oppJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Opportunity created"))
                .andExpect(jsonPath("$.requestId").value("req_se_005"));

        // API 6: Create Proposal Draft
        String propJson = """
                {
                  "opportunityId": "OPP-2001",
                  "proposalTitle": "Business Process Modernization Proposal",
                  "serviceId": "CSVC-1001",
                  "scopeSummary": "Assess existing processes and recommend a phased modernization plan.",
                  "deliverables": [
                    "Current-state assessment",
                    "Gap analysis",
                    "Target-state recommendations",
                    "Implementation roadmap"
                  ],
                  "assumptions": [
                    "The client will provide access to relevant stakeholders."
                  ],
                  "exclusions": [
                    "Software licensing costs",
                    "Implementation work not explicitly included in the final scope"
                  ],
                  "currency": "INR"
                }
                """;

        mockMvc.perform(post("/api/v1/consulting/sales-executive/proposals")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(propJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Proposal draft created"))
                .andExpect(jsonPath("$.data.status").value("DRAFT"))
                .andExpect(jsonPath("$.requestId").value("req_se_006"));

        // API 7: Request Pricing Estimate
        String estJson = """
                {
                  "proposalId": "PROP-4001",
                  "pricingModel": "FIXED_FEE",
                  "currency": "INR",
                  "costComponents": [
                    {
                      "componentType": "DISCOVERY_AND_ASSESSMENT",
                      "quantity": 1,
                      "unit": "PROJECT"
                    },
                    {
                      "componentType": "CONSULTING_DAYS",
                      "quantity": 20,
                      "unit": "DAY"
                    }
                  ]
                }
                """;

        mockMvc.perform(post("/api/v1/consulting/sales-executive/pricing/estimates")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(estJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Pricing estimate calculated"))
                .andExpect(jsonPath("$.data.requiresRateResolution").value(true))
                .andExpect(jsonPath("$.requestId").value("req_se_007"));

        // API 8: Request Proposal Approval
        String reqAprJson = """
                {
                  "reason": "Proposal scope and commercial terms are ready for manager review."
                }
                """;

        mockMvc.perform(post("/api/v1/consulting/sales-executive/proposals/PROP-4001/request-approval")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(reqAprJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Proposal approval requested"))
                .andExpect(jsonPath("$.data.status").value("PENDING_APPROVAL"))
                .andExpect(jsonPath("$.requestId").value("req_se_008"));

        // API 9: Attempt to send unapproved proposal -> Expected 409 Conflict
        String sendJson = """
                {
                  "channel": "EMAIL",
                  "recipientContactId": "CONT-1001",
                  "message": "Please review the attached consulting proposal and share your feedback."
                }
                """;

        mockMvc.perform(post("/api/v1/consulting/sales-executive/proposals/PROP-4001/send")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(sendJson))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Proposal cannot be sent before required approval"))
                .andExpect(jsonPath("$.requestId").value("req_se_009_error"));

        // Approve proposal first via manager endpoint
        mockMvc.perform(post("/api/v1/consulting/sales-manager/proposals/PROP-4001/decision")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                { "decision": "APPROVED", "comments": "Approved by manager" }
                                """))
                .andExpect(status().isOk());

        // Now send approved proposal -> Expected 200 OK
        mockMvc.perform(post("/api/v1/consulting/sales-executive/proposals/PROP-4001/send")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(sendJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Proposal sent"))
                .andExpect(jsonPath("$.data.deliveryStatus").value("SUBMITTED"))
                .andExpect(jsonPath("$.requestId").value("req_se_009"));

        // API 10: Create Follow-up
        String fupJson = """
                {
                  "leadId": "CLD-1001",
                  "opportunityId": "OPP-2001",
                  "followUpType": "PROPOSAL_REVIEW",
                  "dueAt": "2026-10-31T10:00:00+05:30",
                  "notes": "Follow up with the client regarding proposal feedback."
                }
                """;

        mockMvc.perform(post("/api/v1/consulting/sales-executive/follow-ups")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(fupJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Follow-up created"))
                .andExpect(jsonPath("$.data.status").value("PENDING"))
                .andExpect(jsonPath("$.requestId").value("req_se_010"));

        // API 11: Initiate Delivery Handoff
        String execHandoff = """
                {
                  "opportunityId": "OPP-2001",
                  "contractId": "CON-5001",
                  "receivingTeamId": "TEAM-DELIVERY-01",
                  "clientObjectives": [
                    "Reduce reporting time",
                    "Improve process visibility"
                  ],
                  "handoffNotes": "Transfer the approved scope, deliverables, assumptions, exclusions, and client contacts to the delivery team."
                }
                """;

        mockMvc.perform(post("/api/v1/consulting/sales-executive/engagement-handoffs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(execHandoff))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Engagement handoff initiated"))
                .andExpect(jsonPath("$.data.status").value("PENDING_REVIEW"))
                .andExpect(jsonPath("$.requestId").value("req_se_011"));
    }

    @Test
    @DisplayName("04. Customer Support - Tickets, Engagements, Invoices, SLA, AI & Feedback")
    void testCustomerSupportWorkflows() throws Exception {
        // API 1: Dashboard
        mockMvc.perform(get("/api/v1/consulting/customer-support/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Customer Support dashboard retrieved"))
                .andExpect(jsonPath("$.data.openTickets").exists())
                .andExpect(jsonPath("$.requestId").value("req_cs_001"));

        // API 2: Create Support Ticket
        String createTkt = """
                {
                  "clientId": "CLI-1001",
                  "engagementId": "ENG-2001",
                  "category": "PROJECT_STATUS",
                  "subject": "Request for project progress update",
                  "description": "The client would like an update on the current engagement status.",
                  "priority": "MEDIUM",
                  "source": "EMAIL"
                }
                """;

        mockMvc.perform(post("/api/v1/consulting/customer-support/tickets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createTkt))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Support ticket created"))
                .andExpect(jsonPath("$.data.ticketId").exists())
                .andExpect(jsonPath("$.data.status").value("OPEN"))
                .andExpect(jsonPath("$.requestId").value("req_cs_002"));

        // API 3: Ticket details
        mockMvc.perform(get("/api/v1/consulting/customer-support/tickets/TKT-7001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Support ticket retrieved"))
                .andExpect(jsonPath("$.data.ticketId").value("TKT-7001"))
                .andExpect(jsonPath("$.data.slaStatus").value("WITHIN_TARGET"))
                .andExpect(jsonPath("$.requestId").value("req_cs_003"));

        // API 4: Assign Ticket
        String assignTkt = """
                {
                  "assigneeId": "USR-SUPPORT-101",
                  "reason": "Requires engagement-status coordination"
                }
                """;

        mockMvc.perform(post("/api/v1/consulting/customer-support/tickets/TKT-7001/assign")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(assignTkt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Ticket assigned"))
                .andExpect(jsonPath("$.data.status").value("ASSIGNED"))
                .andExpect(jsonPath("$.requestId").value("req_cs_004"));

        // API 5: Engagement Status
        mockMvc.perform(get("/api/v1/consulting/customer-support/engagements/ENG-2001/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Engagement status retrieved"))
                .andExpect(jsonPath("$.data.status").value("IN_PROGRESS"))
                .andExpect(jsonPath("$.requestId").value("req_cs_005"));

        // API 6: Engagement Milestones (Filtered for client safety)
        mockMvc.perform(get("/api/v1/consulting/customer-support/engagements/ENG-2001/milestones"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Engagement milestones retrieved"))
                .andExpect(jsonPath("$.data.milestones").isArray())
                .andExpect(jsonPath("$.requestId").value("req_cs_006"));

        // API 7: Invoice Status
        mockMvc.perform(get("/api/v1/consulting/customer-support/invoices/INV-3001/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Invoice status retrieved"))
                .andExpect(jsonPath("$.data.status").value("ISSUED"))
                .andExpect(jsonPath("$.data.amount").value(250000.0))
                .andExpect(jsonPath("$.requestId").value("req_cs_007"));

        // API 8: Create Billing Enquiry
        String billingEnq = """
                {
                  "clientId": "CLI-1001",
                  "invoiceId": "INV-3001",
                  "category": "INVOICE_CLARIFICATION",
                  "description": "The client requests clarification of the services included in the invoice."
                }
                """;

        mockMvc.perform(post("/api/v1/consulting/customer-support/billing-enquiries")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(billingEnq))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Billing enquiry created"))
                .andExpect(jsonPath("$.data.status").value("OPEN"))
                .andExpect(jsonPath("$.requestId").value("req_cs_008"));

        // API 9: Request Meeting
        String meetReq = """
                {
                  "engagementId": "ENG-2001",
                  "meetingType": "PROJECT_REVIEW",
                  "requestedStart": "2026-10-30T14:00:00+05:30",
                  "requestedEnd": "2026-10-30T14:30:00+05:30",
                  "purpose": "Discuss the current engagement progress."
                }
                """;

        mockMvc.perform(post("/api/v1/consulting/customer-support/meeting-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(meetReq))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Meeting request created"))
                .andExpect(jsonPath("$.data.status").value("PENDING_CONFIRMATION"))
                .andExpect(jsonPath("$.requestId").value("req_cs_009"));

        // API 10: SLA Information
        mockMvc.perform(get("/api/v1/consulting/customer-support/tickets/TKT-7001/sla"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Ticket SLA information retrieved"))
                .andExpect(jsonPath("$.data.policyId").value("SLA-1001"))
                .andExpect(jsonPath("$.requestId").value("req_cs_010"));

        // API 11: Draft AI-assisted response
        String draftReq = """
                {
                  "ticketId": "TKT-7001",
                  "clientMessage": "Can you provide an update on our project?",
                  "includeEngagementStatus": true,
                  "includeKnowledgeBase": true
                }
                """;

        mockMvc.perform(post("/api/v1/consulting/customer-support/ai/draft-response")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(draftReq))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Support response draft generated"))
                .andExpect(jsonPath("$.data.requiresHumanReview").value(true))
                .andExpect(jsonPath("$.requestId").value("req_cs_011"));

        // API 12: Escalate Ticket
        String escReq = """
                {
                  "reason": "Client reports a potential contractual or delivery commitment issue",
                  "targetTeam": "ENGAGEMENT_MANAGEMENT",
                  "description": "The client needs a review of commitments that Customer Support cannot independently change."
                }
                """;

        mockMvc.perform(post("/api/v1/consulting/customer-support/tickets/TKT-7001/escalate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(escReq))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Ticket escalated"))
                .andExpect(jsonPath("$.data.status").value("ESCALATED"))
                .andExpect(jsonPath("$.requestId").value("req_cs_012"));

        // API 13: Record Client Feedback
        String fdbReq = """
                {
                  "ticketId": "TKT-7001",
                  "rating": 5,
                  "comment": "The support team provided a clear update.",
                  "channel": "EMAIL"
                }
                """;

        mockMvc.perform(post("/api/v1/consulting/customer-support/feedback")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(fdbReq))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Client feedback recorded"))
                .andExpect(jsonPath("$.data.status").value("RECORDED"))
                .andExpect(jsonPath("$.requestId").value("req_cs_013"));
    }
}
