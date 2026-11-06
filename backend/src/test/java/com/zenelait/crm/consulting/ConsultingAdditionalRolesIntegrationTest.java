package com.zenelait.crm.consulting;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class ConsultingAdditionalRolesIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    // ==========================================
    // ROLE 1: RELATIONSHIP MANAGER TESTS
    // ==========================================

    @Test
    @DisplayName("RM 1: View Relationship Manager dashboard")
    void testRmDashboard() throws Exception {
        mockMvc.perform(get("/api/v1/consulting/relationship-manager/dashboard")
                        .header("X-Tenant-Id", "tenant-6"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.assignedAccounts").value(35))
                .andExpect(jsonPath("$.data.activeEngagements").value(18))
                .andExpect(jsonPath("$.data.accountsRequiringAttention").value(4))
                .andExpect(jsonPath("$.requestId").value("req_rm_dashboard_001"));
    }

    @Test
    @DisplayName("RM 2: Retrieve assigned accounts with pagination")
    void testRmAccounts() throws Exception {
        mockMvc.perform(get("/api/v1/consulting/relationship-manager/my-accounts?page=0&size=10")
                        .header("X-Tenant-Id", "tenant-6"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].accountId").value("ACC-1001"))
                .andExpect(jsonPath("$.requestId").value("req_rm_accounts_001"));
    }

    @Test
    @DisplayName("RM 3: View account details")
    void testRmAccountDetail() throws Exception {
        mockMvc.perform(get("/api/v1/consulting/relationship-manager/accounts/ACC-1001")
                        .header("X-Tenant-Id", "tenant-6"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accountId").value("ACC-1001"))
                .andExpect(jsonPath("$.data.primaryContact.email").value("contact@example.com"))
                .andExpect(jsonPath("$.requestId").value("req_rm_account_001"));
    }

    @Test
    @DisplayName("RM 4: Record client interaction")
    void testRmRecordActivity() throws Exception {
        Map<String, Object> req = Map.of(
                "activityType", "CLIENT_CALL",
                "subject", "Monthly account review",
                "description", "Discussed engagement progress and upcoming business requirements.",
                "occurredAt", "2026-10-29T10:00:00+05:30",
                "nextAction", "Schedule technical review",
                "nextActionDueDate", "2026-11-02"
        );

        mockMvc.perform(post("/api/v1/consulting/relationship-manager/accounts/ACC-1001/activities")
                        .header("X-Tenant-Id", "tenant-6")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.activityType").value("CLIENT_CALL"))
                .andExpect(jsonPath("$.requestId").value("req_rm_activity_001"));
    }

    @Test
    @DisplayName("RM 5: Record health assessment")
    void testRmRecordHealthAssessment() throws Exception {
        Map<String, Object> req = Map.of(
                "assessmentPeriod", "2026-10",
                "deliveryHealth", "YELLOW",
                "communicationHealth", "GREEN",
                "satisfactionHealth", "YELLOW",
                "commercialHealth", "GREEN",
                "notes", "Client requested clearer weekly delivery updates."
        );

        mockMvc.perform(post("/api/v1/consulting/relationship-manager/accounts/ACC-1001/health-assessments")
                        .header("X-Tenant-Id", "tenant-6")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.assessmentId").value("HLA-3001"))
                .andExpect(jsonPath("$.data.overallHealth").value("AT_RISK"))
                .andExpect(jsonPath("$.requestId").value("req_rm_health_001"));
    }

    @Test
    @DisplayName("RM 6: Create relationship risk")
    void testRmCreateRisk() throws Exception {
        Map<String, Object> req = Map.of(
                "riskCategory", "CLIENT_SATISFACTION",
                "title", "Client concerned about delivery communication",
                "description", "Client has requested more frequent delivery status updates.",
                "severity", "MEDIUM",
                "ownerId", "USER-RM-101",
                "dueDate", "2026-11-02"
        );

        mockMvc.perform(post("/api/v1/consulting/relationship-manager/accounts/ACC-1001/risks")
                        .header("X-Tenant-Id", "tenant-6")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.riskId").value("RSK-4001"))
                .andExpect(jsonPath("$.data.severity").value("MEDIUM"))
                .andExpect(jsonPath("$.requestId").value("req_rm_risk_001"));
    }

    @Test
    @DisplayName("RM 7: Request review meeting")
    void testRmRequestMeeting() throws Exception {
        Map<String, Object> req = Map.of(
                "title", "Quarterly Business Review",
                "agenda", List.of("Engagement progress", "Client feedback", "Upcoming business requirements"),
                "requestedDateTime", "2026-11-05T11:00:00+05:30",
                "durationMinutes", 45,
                "attendeeContactIds", List.of("CONTACT-101")
        );

        mockMvc.perform(post("/api/v1/consulting/relationship-manager/accounts/ACC-1001/review-meetings")
                        .header("X-Tenant-Id", "tenant-6")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.meetingId").value("MTG-5001"))
                .andExpect(jsonPath("$.data.status").value("PENDING_CONFIRMATION"))
                .andExpect(jsonPath("$.requestId").value("req_rm_meeting_001"));
    }

    @Test
    @DisplayName("RM 8: Generate AI account summary")
    void testRmAiAccountSummary() throws Exception {
        Map<String, Object> req = Map.of(
                "accountId", "ACC-1001",
                "include", List.of("engagements", "recentActivities", "openRisks", "complaints", "renewals")
        );

        mockMvc.perform(post("/api/v1/consulting/relationship-manager/ai/account-summary")
                        .header("X-Tenant-Id", "tenant-6")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.riskLevel").value("MEDIUM"))
                .andExpect(jsonPath("$.data.requiresHumanReview").value(true))
                .andExpect(jsonPath("$.requestId").value("req_rm_ai_summary_001"));
    }

    @Test
    @DisplayName("RM 9: Create growth opportunity")
    void testRmCreateGrowthOpportunity() throws Exception {
        Map<String, Object> req = Map.of(
                "opportunityName", "Cloud Cost Optimization Consulting",
                "serviceCategory", "CLOUD_CONSULTING",
                "businessNeed", "Client requested a review of cloud operating costs.",
                "source", "CLIENT_REVIEW",
                "estimatedValue", 250000,
                "currency", "INR",
                "nextAction", "Discuss requirements with Sales"
        );

        mockMvc.perform(post("/api/v1/consulting/relationship-manager/accounts/ACC-1001/growth-opportunities")
                        .header("X-Tenant-Id", "tenant-6")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.opportunityId").value("GRO-6001"))
                .andExpect(jsonPath("$.requestId").value("req_rm_growth_001"));
    }

    @Test
    @DisplayName("RM 10: Hand opportunity to Sales")
    void testRmHandoffToSales() throws Exception {
        Map<String, Object> req = Map.of(
                "salesTeamId", "TEAM-CONSULTING-SALES",
                "assignedUserId", "USER-SE-201",
                "handoffNotes", "Client requested an initial cloud cost optimization discussion."
        );

        mockMvc.perform(post("/api/v1/consulting/relationship-manager/growth-opportunities/GRO-6001/handoff")
                        .header("X-Tenant-Id", "tenant-6")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("HANDED_OFF"))
                .andExpect(jsonPath("$.data.assignedUserId").value("USER-SE-201"))
                .andExpect(jsonPath("$.requestId").value("req_rm_handoff_001"));
    }

    // ==========================================
    // ROLE 2: AI LEAD QUALIFICATION AGENT TESTS
    // ==========================================

    @Test
    @DisplayName("LQ 1: View qualification dashboard")
    void testLqDashboard() throws Exception {
        mockMvc.perform(get("/api/v1/consulting/ai-lead-qualification/dashboard")
                        .header("X-Tenant-Id", "tenant-6"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.pendingLeads").value(24))
                .andExpect(jsonPath("$.data.processedToday").value(18))
                .andExpect(jsonPath("$.requestId").value("req_lq_dashboard_001"));
    }

    @Test
    @DisplayName("LQ 2: Submit lead for qualification (202 Accepted)")
    void testLqSubmitJob() throws Exception {
        Map<String, Object> req = Map.of(
                "leadId", "LEAD-1001",
                "requestedChecks", List.of("SERVICE_FIT", "BUSINESS_NEED", "INFORMATION_COMPLETENESS", "DUPLICATE_CHECK", "NEXT_ACTION"),
                "priority", "NORMAL"
        );

        mockMvc.perform(post("/api/v1/consulting/ai-lead-qualification/jobs")
                        .header("X-Tenant-Id", "tenant-6")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("QUEUED"))
                .andExpect(jsonPath("$.requestId").value("req_lq_job_001"));
    }

    @Test
    @DisplayName("LQ 3: Retrieve qualification job result")
    void testLqGetJobResult() throws Exception {
        mockMvc.perform(get("/api/v1/consulting/ai-lead-qualification/jobs/LQ-JOB-1001")
                        .header("X-Tenant-Id", "tenant-6"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.qualification.score").value(82))
                .andExpect(jsonPath("$.data.qualification.recommendation").value("PRIORITIZE_FOR_SALES_REVIEW"))
                .andExpect(jsonPath("$.requestId").value("req_lq_job_result_001"));
    }

    @Test
    @DisplayName("LQ 4: Retrieve outstanding questions")
    void testLqGetQuestions() throws Exception {
        mockMvc.perform(get("/api/v1/consulting/ai-lead-qualification/leads/LEAD-1001/questions")
                        .header("X-Tenant-Id", "tenant-6"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.questions", hasSize(greaterThanOrEqualTo(2))))
                .andExpect(jsonPath("$.requestId").value("req_lq_questions_001"));
    }

    @Test
    @DisplayName("LQ 5: Record qualification answers")
    void testLqRecordAnswers() throws Exception {
        Map<String, Object> req = Map.of(
                "answers", List.of(
                        Map.of("questionId", "Q-101", "answer", "We want to modernize our internal business application."),
                        Map.of("questionId", "Q-102", "answer", "We expect to begin discovery next quarter.")
                ),
                "source", "CLIENT_RESPONSE"
        );

        mockMvc.perform(post("/api/v1/consulting/ai-lead-qualification/leads/LEAD-1001/answers")
                        .header("X-Tenant-Id", "tenant-6")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.answersRecorded").value(2))
                .andExpect(jsonPath("$.data.qualificationStatus").value("READY_FOR_REASSESSMENT"))
                .andExpect(jsonPath("$.requestId").value("req_lq_answers_001"));
    }

    @Test
    @DisplayName("LQ 6: Check for duplicate leads")
    void testLqDuplicateCheck() throws Exception {
        Map<String, Object> req = Map.of(
                "matchFields", List.of("email", "companyName", "phone")
        );

        mockMvc.perform(post("/api/v1/consulting/ai-lead-qualification/leads/LEAD-1001/duplicate-check")
                        .header("X-Tenant-Id", "tenant-6")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.potentialDuplicates[0].candidateLeadId").value("LEAD-0998"))
                .andExpect(jsonPath("$.data.automaticMergeAllowed").value(false))
                .andExpect(jsonPath("$.requestId").value("req_lq_duplicate_001"));
    }

    @Test
    @DisplayName("LQ 7: Retrieve score explanation")
    void testLqGetExplanation() throws Exception {
        mockMvc.perform(get("/api/v1/consulting/ai-lead-qualification/leads/LEAD-1001/explanations")
                        .header("X-Tenant-Id", "tenant-6"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.score").value(82))
                .andExpect(jsonPath("$.data.factors", hasSize(3)))
                .andExpect(jsonPath("$.requestId").value("req_lq_explanation_001"));
    }

    @Test
    @DisplayName("LQ 8: Generate next-step recommendation")
    void testLqRecommendations() throws Exception {
        Map<String, Object> req = Map.of(
                "objective", "PREPARE_FOR_DISCOVERY",
                "includeMissingInformation", true
        );

        mockMvc.perform(post("/api/v1/consulting/ai-lead-qualification/leads/LEAD-1001/recommendations")
                        .header("X-Tenant-Id", "tenant-6")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.recommendedAction").value("SCHEDULE_DISCOVERY"))
                .andExpect(jsonPath("$.data.requiresHumanApproval").value(true))
                .andExpect(jsonPath("$.requestId").value("req_lq_recommendation_001"));
    }

    @Test
    @DisplayName("LQ 9: Route lead to Sales Executive")
    void testLqRouteLead() throws Exception {
        Map<String, Object> req = Map.of(
                "targetRole", "SALES_EXECUTIVE",
                "routingReason", "High service fit and clear business need",
                "preferredTeamId", "TEAM-CONSULTING-SALES"
        );

        mockMvc.perform(post("/api/v1/consulting/ai-lead-qualification/leads/LEAD-1001/route")
                        .header("X-Tenant-Id", "tenant-6")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.routingStatus").value("ASSIGNED"))
                .andExpect(jsonPath("$.data.assignedUserId").value("USER-SE-201"))
                .andExpect(jsonPath("$.requestId").value("req_lq_route_001"));
    }

    @Test
    @DisplayName("LQ 10: Record human review decision")
    void testLqRecordReviewDecision() throws Exception {
        Map<String, Object> req = Map.of(
                "decision", "APPROVE_QUALIFICATION",
                "comments", "The business need matches our consulting services.",
                "nextAction", "CREATE_SALES_TASK"
        );

        mockMvc.perform(post("/api/v1/consulting/ai-lead-qualification/leads/LEAD-1001/review-decisions")
                        .header("X-Tenant-Id", "tenant-6")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.reviewId").value("LQ-REVIEW-1001"))
                .andExpect(jsonPath("$.data.decision").value("APPROVE_QUALIFICATION"))
                .andExpect(jsonPath("$.requestId").value("req_lq_review_001"));
    }

    // ==========================================
    // ROLE 3: CUSTOMER AI SUPPORT AGENT TESTS
    // ==========================================

    @Test
    @DisplayName("SUP 1: View AI support dashboard")
    void testSupportDashboard() throws Exception {
        mockMvc.perform(get("/api/v1/consulting/ai-support/dashboard")
                        .header("X-Tenant-Id", "tenant-6"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.activeConversations").value(32))
                .andExpect(jsonPath("$.data.ticketsCreatedToday").value(14))
                .andExpect(jsonPath("$.requestId").value("req_ai_support_dashboard_001"));
    }

    @Test
    @DisplayName("SUP 2: Start client support conversation")
    void testSupportStartConversation() throws Exception {
        Map<String, Object> req = Map.of(
                "clientId", "CLIENT-1001",
                "channel", "WEB_CHAT",
                "subject", "Cloud migration project status",
                "initialMessage", "Can you provide an update on our cloud migration?"
        );

        mockMvc.perform(post("/api/v1/consulting/ai-support/conversations")
                        .header("X-Tenant-Id", "tenant-6")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("OPEN"))
                .andExpect(jsonPath("$.data.assignedAgent").value("AI_SUPPORT_AGENT"))
                .andExpect(jsonPath("$.requestId").value("req_ai_support_conversation_001"));
    }

    @Test
    @DisplayName("SUP 3: Submit message for processing")
    void testSupportSubmitMessage() throws Exception {
        Map<String, Object> req = Map.of(
                "message", "Can you provide an update on our cloud migration?",
                "messageType", "TEXT",
                "language", "en"
        );

        mockMvc.perform(post("/api/v1/consulting/ai-support/conversations/CONV-1001/messages")
                        .header("X-Tenant-Id", "tenant-6")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.classification.category").value("PROJECT_STATUS"))
                .andExpect(jsonPath("$.requestId").value("req_ai_support_message_001"));
    }

    @Test
    @DisplayName("SUP 4: Generate grounded answer")
    void testSupportGenerateAnswer() throws Exception {
        Map<String, Object> req = Map.of(
                "conversationId", "CONV-1001",
                "question", "What is the current status of our cloud migration?",
                "context", Map.of("clientId", "CLIENT-1001", "engagementId", "ENG-1001"),
                "responseMode", "GROUNDED"
        );

        mockMvc.perform(post("/api/v1/consulting/ai-support/ai/answer")
                        .header("X-Tenant-Id", "tenant-6")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.groundingStatus").value("GROUNDED"))
                .andExpect(jsonPath("$.data.sourceReferences[0].sourceId").value("ENG-1001"))
                .andExpect(jsonPath("$.requestId").value("req_ai_support_answer_001"));
    }

    @Test
    @DisplayName("SUP 5: Search approved knowledge")
    void testSupportKnowledgeSearch() throws Exception {
        Map<String, Object> req = Map.of(
                "query", "What is the support escalation process?",
                "filters", Map.of("category", "SUPPORT_POLICY", "publishedOnly", true),
                "limit", 5
        );

        mockMvc.perform(post("/api/v1/consulting/ai-support/knowledge/search")
                        .header("X-Tenant-Id", "tenant-6")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.results[0].articleId").value("KB-1001"))
                .andExpect(jsonPath("$.requestId").value("req_ai_support_knowledge_001"));
    }

    @Test
    @DisplayName("SUP 6: Create support ticket")
    void testSupportCreateTicket() throws Exception {
        Map<String, Object> req = Map.of(
                "clientId", "CLIENT-1001",
                "conversationId", "CONV-1001",
                "subject", "Unable to access project dashboard",
                "description", "The client reports that the project dashboard does not load.",
                "category", "TECHNICAL_SUPPORT",
                "priority", "NORMAL",
                "source", "AI_SUPPORT_AGENT"
        );

        mockMvc.perform(post("/api/v1/consulting/ai-support/tickets")
                        .header("X-Tenant-Id", "tenant-6")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.ticketId").value("TKT-1001"))
                .andExpect(jsonPath("$.data.humanAssignmentRequired").value(true))
                .andExpect(jsonPath("$.requestId").value("req_ai_support_ticket_001"));
    }

    @Test
    @DisplayName("SUP 7: Classify ticket")
    void testSupportClassifyTicket() throws Exception {
        Map<String, Object> req = Map.of(
                "include", List.of("category", "priority", "sentiment", "escalationRisk")
        );

        mockMvc.perform(post("/api/v1/consulting/ai-support/tickets/TKT-1001/classify")
                        .header("X-Tenant-Id", "tenant-6")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.category").value("TECHNICAL_SUPPORT"))
                .andExpect(jsonPath("$.data.escalationRisk").value("LOW"))
                .andExpect(jsonPath("$.requestId").value("req_ai_support_classify_001"));
    }

    @Test
    @DisplayName("SUP 8: Request missing information (202 Accepted)")
    void testSupportRequestInformation() throws Exception {
        Map<String, Object> req = Map.of(
                "requestedInformation", List.of(
                        "Approximate time the issue started",
                        "Error message displayed",
                        "Whether the issue affects other authorized users"
                ),
                "channel", "WEB_CHAT",
                "requiresHumanApproval", true
        );

        mockMvc.perform(post("/api/v1/consulting/ai-support/tickets/TKT-1001/request-information")
                        .header("X-Tenant-Id", "tenant-6")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("PENDING_APPROVAL"))
                .andExpect(jsonPath("$.data.requestedInformationCount").value(3))
                .andExpect(jsonPath("$.requestId").value("req_ai_support_info_001"));
    }

    @Test
    @DisplayName("SUP 9: Escalate ticket")
    void testSupportEscalateTicket() throws Exception {
        Map<String, Object> req = Map.of(
                "reason", "CLIENT_REQUEST",
                "targetTeam", "TECHNICAL_SUPPORT",
                "summary", "Client requests technical assistance with the project dashboard.",
                "priority", "HIGH"
        );

        mockMvc.perform(post("/api/v1/consulting/ai-support/tickets/TKT-1001/escalate")
                        .header("X-Tenant-Id", "tenant-6")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("ESCALATED"))
                .andExpect(jsonPath("$.data.escalationId").value("ESC-1001"))
                .andExpect(jsonPath("$.requestId").value("req_ai_support_escalate_001"));
    }

    @Test
    @DisplayName("SUP 10: Hand conversation to human")
    void testSupportHandoff() throws Exception {
        Map<String, Object> req = Map.of(
                "reason", "COMPLEX_TECHNICAL_ISSUE",
                "targetTeam", "TECHNICAL_SUPPORT",
                "summary", "The client needs help investigating a project dashboard issue.",
                "conversationSummary", "Client reported that the project dashboard does not load.",
                "urgency", "NORMAL"
        );

        mockMvc.perform(post("/api/v1/consulting/ai-support/conversations/CONV-1001/handoff")
                        .header("X-Tenant-Id", "tenant-6")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.handoffId").value("HO-SUP-1001"))
                .andExpect(jsonPath("$.data.status").value("PENDING_ASSIGNMENT"))
                .andExpect(jsonPath("$.requestId").value("req_ai_support_handoff_001"));
    }

    @Test
    @DisplayName("SUP 11: Record client feedback")
    void testSupportRecordFeedback() throws Exception {
        Map<String, Object> req = Map.of(
                "conversationId", "CONV-1001",
                "rating", 4,
                "comments", "The response was helpful.",
                "source", "WEB_CHAT"
        );

        mockMvc.perform(post("/api/v1/consulting/ai-support/feedback")
                        .header("X-Tenant-Id", "tenant-6")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.feedbackId").value("FB-SUP-1001"))
                .andExpect(jsonPath("$.data.rating").value(4))
                .andExpect(jsonPath("$.requestId").value("req_ai_support_feedback_001"));
    }

    // ==========================================
    // ROLE 4: CUSTOMER AI FOLLOW-UP AGENT TESTS
    // ==========================================

    @Test
    @DisplayName("FU 1: View follow-up dashboard")
    void testFollowUpDashboard() throws Exception {
        mockMvc.perform(get("/api/v1/consulting/ai-follow-up/dashboard")
                        .header("X-Tenant-Id", "tenant-6"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.scheduledTasks").value(42))
                .andExpect(jsonPath("$.data.tasksDueToday").value(15))
                .andExpect(jsonPath("$.requestId").value("req_followup_dashboard_001"));
    }

    @Test
    @DisplayName("FU 2: Create proposal follow-up")
    void testFollowUpCreateProposalTask() throws Exception {
        Map<String, Object> req = Map.of(
                "followUpType", "PROPOSAL_STATUS_CHECK",
                "scheduledAt", "2026-11-02T10:00:00+05:30",
                "channel", "EMAIL",
                "purpose", "Check whether the client needs clarification about the proposal.",
                "actionMode", "DRAFT_FOR_APPROVAL"
        );

        mockMvc.perform(post("/api/v1/consulting/ai-follow-up/proposals/PROP-1001/follow-ups")
                        .header("X-Tenant-Id", "tenant-6")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.taskId").value("FU-1001"))
                .andExpect(jsonPath("$.data.status").value("DRAFT"))
                .andExpect(jsonPath("$.requestId").value("req_followup_proposal_001"));
    }

    @Test
    @DisplayName("FU 3: Check eligibility")
    void testFollowUpCheckEligibility() throws Exception {
        Map<String, Object> req = Map.of(
                "contactId", "CONTACT-101",
                "channel", "EMAIL",
                "purpose", "PROPOSAL_STATUS_CHECK",
                "relatedRecordType", "PROPOSAL",
                "relatedRecordId", "PROP-1001"
        );

        mockMvc.perform(post("/api/v1/consulting/ai-follow-up/ai/check-eligibility")
                        .header("X-Tenant-Id", "tenant-6")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.eligible").value(true))
                .andExpect(jsonPath("$.data.checks.optOut").value("PASSED"))
                .andExpect(jsonPath("$.requestId").value("req_followup_eligibility_001"));
    }

    @Test
    @DisplayName("FU 4: Draft follow-up message")
    void testFollowUpDraftMessage() throws Exception {
        Map<String, Object> req = Map.of(
                "relatedRecordType", "PROPOSAL",
                "relatedRecordId", "PROP-1001",
                "contactId", "CONTACT-101",
                "channel", "EMAIL",
                "purpose", "PROPOSAL_STATUS_CHECK",
                "tone", "PROFESSIONAL",
                "includeCallToAction", true
        );

        mockMvc.perform(post("/api/v1/consulting/ai-follow-up/ai/draft-message")
                        .header("X-Tenant-Id", "tenant-6")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.draftId").value("DRAFT-1001"))
                .andExpect(jsonPath("$.data.status").value("DRAFT"))
                .andExpect(jsonPath("$.requestId").value("req_followup_draft_001"));
    }

    @Test
    @DisplayName("FU 5: Schedule follow-up task")
    void testFollowUpScheduleTask() throws Exception {
        Map<String, Object> req = Map.of(
                "relatedRecordType", "PROPOSAL",
                "relatedRecordId", "PROP-1001",
                "contactId", "CONTACT-101",
                "followUpType", "PROPOSAL_STATUS_CHECK",
                "scheduledAt", "2026-11-02T10:00:00+05:30",
                "channel", "EMAIL",
                "actionMode", "DRAFT_FOR_APPROVAL",
                "draftId", "DRAFT-1001"
        );

        mockMvc.perform(post("/api/v1/consulting/ai-follow-up/tasks")
                        .header("X-Tenant-Id", "tenant-6")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.taskId").value("FU-1002"))
                .andExpect(jsonPath("$.data.status").value("SCHEDULED"))
                .andExpect(jsonPath("$.requestId").value("req_followup_schedule_001"));
    }

    @Test
    @DisplayName("FU 6: Retrieve scheduled task")
    void testFollowUpGetTask() throws Exception {
        mockMvc.perform(get("/api/v1/consulting/ai-follow-up/tasks/FU-1002")
                        .header("X-Tenant-Id", "tenant-6"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.taskId").value("FU-1002"))
                .andExpect(jsonPath("$.data.status").value("SCHEDULED"))
                .andExpect(jsonPath("$.requestId").value("req_followup_task_001"));
    }

    @Test
    @DisplayName("FU 7: Approve follow-up")
    void testFollowUpApprove() throws Exception {
        Map<String, Object> req = Map.of(
                "decision", "APPROVE",
                "comments", "Reviewed and approved for sending."
        );

        mockMvc.perform(post("/api/v1/consulting/ai-follow-up/approvals/APR-FU-1001/approve")
                        .header("X-Tenant-Id", "tenant-6")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("APPROVED"))
                .andExpect(jsonPath("$.data.nextAction").value("ELIGIBILITY_RECHECK_REQUIRED"))
                .andExpect(jsonPath("$.requestId").value("req_followup_approval_001"));
    }

    @Test
    @DisplayName("FU 8: Record opt-out request")
    void testFollowUpRecordOptOut() throws Exception {
        Map<String, Object> req = Map.of(
                "channel", "EMAIL",
                "scope", "MARKETING_AND_AUTOMATED_FOLLOW_UP",
                "reason", "CONTACT_REQUEST",
                "source", "CLIENT_REQUEST"
        );

        mockMvc.perform(post("/api/v1/consulting/ai-follow-up/contacts/CONTACT-101/opt-outs")
                        .header("X-Tenant-Id", "tenant-6")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("ACTIVE"))
                .andExpect(jsonPath("$.data.effectiveImmediately").value(true))
                .andExpect(jsonPath("$.requestId").value("req_followup_optout_001"));
    }

    @Test
    @DisplayName("FU 9: Retrieve communication eligibility after opt-out")
    void testFollowUpCommunicationStatusAfterOptOut() throws Exception {
        Map<String, Object> req = Map.of(
                "channel", "EMAIL",
                "scope", "MARKETING_AND_AUTOMATED_FOLLOW_UP",
                "reason", "CONTACT_REQUEST",
                "source", "CLIENT_REQUEST"
        );
        mockMvc.perform(post("/api/v1/consulting/ai-follow-up/contacts/CONTACT-101/opt-outs")
                        .header("X-Tenant-Id", "tenant-6")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/v1/consulting/ai-follow-up/contacts/CONTACT-101/communication-status?channel=EMAIL")
                        .header("X-Tenant-Id", "tenant-6"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.eligible").value(false))
                .andExpect(jsonPath("$.data.reason").value("CONTACT_OPTED_OUT"))
                .andExpect(jsonPath("$.requestId").value("req_followup_contact_status_001"));
    }

    @Test
    @DisplayName("FU 10: Cancel scheduled follow-up")
    void testFollowUpCancelTask() throws Exception {
        Map<String, Object> req = Map.of(
                "reason", "CONTACT_OPTED_OUT"
        );

        mockMvc.perform(post("/api/v1/consulting/ai-follow-up/tasks/FU-1002/cancel")
                        .header("X-Tenant-Id", "tenant-6")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("CANCELLED"))
                .andExpect(jsonPath("$.data.reason").value("CONTACT_OPTED_OUT"))
                .andExpect(jsonPath("$.requestId").value("req_followup_cancel_001"));
    }

    @Test
    @DisplayName("FU 11: Retrieve message delivery status")
    void testFollowUpMessageDeliveryStatus() throws Exception {
        mockMvc.perform(get("/api/v1/consulting/ai-follow-up/messages/MSG-FU-1001")
                        .header("X-Tenant-Id", "tenant-6"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("DELIVERED"))
                .andExpect(jsonPath("$.requestId").value("req_followup_delivery_001"));
    }
}
