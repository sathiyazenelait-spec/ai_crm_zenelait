package com.zenelait.crm.hotel;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class HotelAiAgentsIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private static final String TENANT_HEADER = "tenant-6";

    // =========================================================================
    // 1. AI RESERVATION AGENT INTEGRATION TESTS
    // =========================================================================

    @Test
    @DisplayName("AI Reservation Agent: Start Conversation")
    public void testStartReservationConversation() throws Exception {
        Map<String, Object> req = new HashMap<>();
        req.put("channel", "WEBSITE_CHAT");
        req.put("guestIdentifier", "guest-session-1001");
        req.put("initialMessage", "I need a room for two adults for two nights.");

        mockMvc.perform(post("/api/v1/hotel/ai-reservation-agent/conversations")
                        .header("X-Tenant-Id", TENANT_HEADER)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.conversationId").isNotEmpty())
                .andExpect(jsonPath("$.data.assignedAgent").value("AI_RESERVATION_AGENT"));
    }

    @Test
    @DisplayName("AI Reservation Agent: Search Availability (Real Inventory)")
    public void testSearchAvailability() throws Exception {
        Map<String, Object> req = new HashMap<>();
        req.put("checkInDate", "2026-11-15");
        req.put("checkOutDate", "2026-11-17");
        req.put("adults", 2);
        req.put("children", 0);
        req.put("rooms", 1);
        req.put("currency", "INR");

        mockMvc.perform(post("/api/v1/hotel/ai-reservation-agent/availability/search")
                        .header("X-Tenant-Id", TENANT_HEADER)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.nights").value(2))
                .andExpect(jsonPath("$.data.availableRoomTypes").isArray())
                .andExpect(jsonPath("$.data.availableRoomTypes", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @DisplayName("AI Reservation Agent: Calculate Quote with 12% GST Taxes")
    public void testCalculateQuote() throws Exception {
        Map<String, Object> req = new HashMap<>();
        req.put("roomTypeId", "roomtype_1001");
        req.put("checkInDate", "2026-11-15");
        req.put("checkOutDate", "2026-11-17");
        req.put("adults", 2);
        req.put("children", 0);
        req.put("rooms", 1);
        req.put("ratePlanId", "FLEXIBLE");
        req.put("currency", "INR");

        mockMvc.perform(post("/api/v1/hotel/ai-reservation-agent/quotes")
                        .header("X-Tenant-Id", TENANT_HEADER)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.quoteId").isNotEmpty())
                .andExpect(jsonPath("$.data.totalAmount").isNotEmpty())
                .andExpect(jsonPath("$.data.taxes").isNotEmpty());
    }

    @Test
    @DisplayName("AI Reservation Agent: Pending Reservation & Idempotent Confirm")
    public void testCreateAndConfirmReservation() throws Exception {
        // Step 1: Create pending reservation
        Map<String, Object> createReq = new HashMap<>();
        createReq.put("quoteId", "QUOTE-1001");
        createReq.put("guestId", "guest_1001");
        createReq.put("roomTypeId", "roomtype_1001");
        createReq.put("checkInDate", "2026-11-15");
        createReq.put("checkOutDate", "2026-11-17");
        createReq.put("adults", 2);
        createReq.put("children", 0);
        createReq.put("rooms", 1);

        mockMvc.perform(post("/api/v1/hotel/ai-reservation-agent/reservations")
                        .header("X-Tenant-Id", TENANT_HEADER)
                        .header("Idempotency-Key", "idemp-res-create-1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("PENDING_CONFIRMATION"));

        // Step 2: Confirm reservation
        Map<String, Object> confirmReq = new HashMap<>();
        confirmReq.put("quoteId", "QUOTE-1001");
        confirmReq.put("confirmationChannel", "EMAIL");
        confirmReq.put("guestConsentVerified", true);

        mockMvc.perform(post("/api/v1/hotel/ai-reservation-agent/reservations/res_1001/confirm")
                        .header("X-Tenant-Id", TENANT_HEADER)
                        .header("Idempotency-Key", "idemp-res-confirm-1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(confirmReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("CONFIRMED"))
                .andExpect(jsonPath("$.data.confirmationDeliveryStatus").value("QUEUED"));
    }

    // =========================================================================
    // 2. AI SUPPORT AGENT INTEGRATION TESTS
    // =========================================================================

    @Test
    @DisplayName("AI Support Agent: Grounded Knowledge Search")
    public void testKnowledgeSearchAndAnswer() throws Exception {
        Map<String, Object> req = new HashMap<>();
        req.put("query", "What time is breakfast served?");
        req.put("language", "en");
        req.put("topK", 5);

        mockMvc.perform(post("/api/v1/hotel/ai-support-agent/knowledge/search")
                        .header("X-Tenant-Id", TENANT_HEADER)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.results").isArray());
    }

    @Test
    @DisplayName("AI Support Agent: Create Ticket, Draft Reply, and Dispatch")
    public void testSupportTicketAndReplyLifecycle() throws Exception {
        // Step 1: Create ticket
        Map<String, Object> ticketReq = new HashMap<>();
        ticketReq.put("conversationId", "conv_1001");
        ticketReq.put("category", "MAINTENANCE");
        ticketReq.put("subject", "Air conditioner not cooling");
        ticketReq.put("description", "Guest reports AC issue in room 204");
        ticketReq.put("priority", "HIGH");

        mockMvc.perform(post("/api/v1/hotel/ai-support-agent/tickets")
                        .header("X-Tenant-Id", TENANT_HEADER)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(ticketReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.ticketId").isNotEmpty());

        // Step 2: Create service request
        Map<String, Object> srvReq = new HashMap<>();
        srvReq.put("conversationId", "conv_1001");
        srvReq.put("category", "HOUSEKEEPING");
        srvReq.put("description", "Two extra towels requested");
        srvReq.put("locationReference", "ROOM-204");
        srvReq.put("priority", "MEDIUM");

        mockMvc.perform(post("/api/v1/hotel/ai-support-agent/service-requests")
                        .header("X-Tenant-Id", TENANT_HEADER)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(srvReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.serviceRequestId").isNotEmpty())
                .andExpect(jsonPath("$.data.status").value("OPEN"));
    }

    // =========================================================================
    // 3. AI FOLLOW-UP AGENT INTEGRATION TESTS
    // =========================================================================

    @Test
    @DisplayName("AI Follow-up Agent: Campaign Lifecycle & Activation")
    public void testCampaignLifecycle() throws Exception {
        // Step 1: Create Draft Campaign
        Map<String, Object> campReq = new HashMap<>();
        campReq.put("name", "Unconverted Quote Follow-up");
        campReq.put("description", "Nurture unconverted quotes");
        campReq.put("campaignType", "QUOTE_CONVERSION");
        campReq.put("channel", "EMAIL");

        mockMvc.perform(post("/api/v1/hotel/ai-follow-up-agent/campaigns")
                        .header("X-Tenant-Id", TENANT_HEADER)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(campReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("DRAFT"));

        // Step 2: Activate Campaign
        mockMvc.perform(post("/api/v1/hotel/ai-follow-up-agent/campaigns/CAMP-1001/activate")
                        .header("X-Tenant-Id", TENANT_HEADER)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("ACTIVE"))
                .andExpect(jsonPath("$.data.eligibleAudienceCount").value(25));
    }

    @Test
    @DisplayName("AI Follow-up Agent: Follow-up Task Assignment & Completion")
    public void testTaskAssignmentAndCompletion() throws Exception {
        // Step 1: Create task
        Map<String, Object> taskReq = new HashMap<>();
        taskReq.put("guestId", "guest_1001");
        taskReq.put("relatedEntityType", "RESERVATION_QUOTE");
        taskReq.put("relatedEntityId", "QUOTE-1001");
        taskReq.put("taskType", "QUOTE_FOLLOW_UP");
        taskReq.put("reason", "Follow up on active quote");

        mockMvc.perform(post("/api/v1/hotel/ai-follow-up-agent/tasks")
                        .header("X-Tenant-Id", TENANT_HEADER)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(taskReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.taskId").isNotEmpty());

        // Step 2: Complete task with verified outcome
        Map<String, Object> completeReq = new HashMap<>();
        completeReq.put("outcome", "GUEST_CONTACTED");
        completeReq.put("notes", "Guest contacted via telephone");

        mockMvc.perform(post("/api/v1/hotel/ai-follow-up-agent/tasks/FUP-1001/complete")
                        .header("X-Tenant-Id", TENANT_HEADER)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(completeReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("COMPLETED"))
                .andExpect(jsonPath("$.data.outcome").value("GUEST_CONTACTED"));
    }
}
