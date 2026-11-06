package com.zenelait.crm.travel;

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
class TravelAiAgentsIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("01. AI Travel Sales Agent: Enquiry to Qualified Lead, Requirement Extraction, Search & Quotation Flow")
    void testAiTravelSalesAgentWorkflow() throws Exception {
        // 1. Dashboard
        mockMvc.perform(get("/api/v1/travel/ai-sales-agent/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.leadsProcessed").value(greaterThanOrEqualTo(100)));

        // 2. Health check
        mockMvc.perform(get("/api/v1/travel/ai-sales-agent/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("UP"));

        // 3. Create lead from enquiry
        String createLeadJson = """
                {
                  "source": "WEBSITE_CHAT",
                  "customer": {
                    "name": "Arun Kumar",
                    "email": "arun@example.com",
                    "phone": "+919876543210"
                  },
                  "message": "I want a five-day Bali trip for two adults in December.",
                  "preferredLanguage": "en",
                  "communicationConsent": {
                    "channel": "EMAIL",
                    "status": "GRANTED",
                    "capturedAt": "2026-10-28T10:00:00Z",
                    "source": "WEBSITE_FORM"
                  }
                }
                """;

        mockMvc.perform(post("/api/v1/travel/ai-sales-agent/leads")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createLeadJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("NEW"))
                .andExpect(jsonPath("$.data.assignedAgent").value("AI_TRAVEL_SALES_AGENT"));

        // 4. Extract requirements
        String extractJson = """
                {
                  "message": "We are two adults planning a five-day Bali trip in December. Our total budget is around INR 100000.",
                  "language": "en"
                }
                """;

        mockMvc.perform(post("/api/v1/travel/ai-sales-agent/leads/LEAD-1001/extract-requirements")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(extractJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.destination").value("Bali"))
                .andExpect(jsonPath("$.data.travellers.adults").value(2))
                .andExpect(jsonPath("$.data.budget.amount").value(100000))
                .andExpect(jsonPath("$.data.missingInformation", hasItem("departureCity")));

        // 5. Travel search
        String searchJson = """
                {
                  "destination": "Bali",
                  "departureCity": "Chennai",
                  "departureDate": "2026-12-10",
                  "returnDate": "2026-12-15",
                  "travellers": { "adults": 2, "children": 0 },
                  "budget": { "amount": 100000, "currency": "INR" },
                  "components": ["FLIGHT", "HOTEL", "TRANSFER", "ACTIVITY"]
                }
                """;

        mockMvc.perform(post("/api/v1/travel/ai-sales-agent/travel-search")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(searchJson))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.data.searchId").exists());

        // 6. Generate Recommendations
        String recJson = """
                {
                  "leadId": "LEAD-1001",
                  "searchId": "search_travel_5001",
                  "preferences": {
                    "travelStyle": "RELAXED",
                    "accommodation": "FOUR_STAR",
                    "priority": ["BUDGET", "BEACH", "CULTURAL_ACTIVITIES"]
                  }
                }
                """;

        mockMvc.perform(post("/api/v1/travel/ai-sales-agent/recommendations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(recJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.options").isArray());

        // 7. Quotation Creation & Prohibited sending when unapproved
        String quoteJson = """
                {
                  "leadId": "LEAD-1001",
                  "itineraryId": "ITIN-1001",
                  "currency": "INR",
                  "items": [
                    { "description": "Hotel accommodation", "productReference": "supplier_product_101", "quantity": 1, "unitPrice": 32000 }
                  ],
                  "validUntil": "2026-11-05T23:59:59Z"
                }
                """;

        mockMvc.perform(post("/api/v1/travel/ai-sales-agent/quotations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(quoteJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("DRAFT"))
                .andExpect(jsonPath("$.data.subtotal").value(32000.0));

        // Attempting to send unapproved quotation must return 409 Conflict
        mockMvc.perform(post("/api/v1/travel/ai-sales-agent/quotations/QUOTE-1001/send")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"channel\":\"EMAIL\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errors[0].field").value("status"));

        // Booking handoff creation blocked if quotation not accepted
        mockMvc.perform(post("/api/v1/travel/ai-sales-agent/leads/LEAD-1001/booking-handoffs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"quotationId\":\"QUOTE-1001\",\"itineraryId\":\"ITIN-1001\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.errors[0].field").value("quotationId"));
    }

    @Test
    @DisplayName("02. AI Follow-up Agent: Plans, Queues, Drafts, Opt-Out Enforcement & Reply Handling")
    void testAiFollowUpAgentWorkflow() throws Exception {
        // 1. Dashboard
        mockMvc.perform(get("/api/v1/travel/ai-follow-up-agent/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.scheduledTasks").exists());

        // 2. Create follow-up plan
        String planJson = """
                {
                  "name": "Travel quotation follow-up",
                  "trigger": { "event": "TRAVEL_QUOTATION_SENT" },
                  "steps": [
                    { "delayMinutes": 1440, "channel": "EMAIL", "templateId": "travel_quote_followup_v1" },
                    { "delayMinutes": 4320, "channel": "EMAIL", "templateId": "travel_quote_followup_v2" }
                  ],
                  "rules": {
                    "stopOnCustomerReply": true,
                    "stopOnQuotationAccepted": true,
                    "stopOnOptOut": true,
                    "requireConsent": true,
                    "maxMessagesPerLeadPerWeek": 3,
                    "requireHumanApproval": true
                  }
                }
                """;

        mockMvc.perform(post("/api/v1/travel/ai-follow-up-agent/plans")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(planJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.planId").exists());

        // 3. Create follow-up task & draft message
        String taskJson = """
                {
                  "leadId": "LEAD-1001",
                  "quotationId": "QUOTE-1001",
                  "customerId": "CUST-1001",
                  "reason": "QUOTATION_PENDING_RESPONSE",
                  "scheduledAt": "2026-10-29T10:00:00Z",
                  "channel": "EMAIL",
                  "priority": "NORMAL"
                }
                """;

        mockMvc.perform(post("/api/v1/travel/ai-follow-up-agent/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(taskJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("PENDING"));

        // 4. Draft follow-up message
        String draftJson = """
                {
                  "tone": "FRIENDLY",
                  "language": "en",
                  "purpose": "ASK_IF_CUSTOMER_HAS_QUESTIONS",
                  "includeQuotationReference": true
                }
                """;

        mockMvc.perform(post("/api/v1/travel/ai-follow-up-agent/tasks/TASK-1001/draft-message")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(draftJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.claimsValidated").value(true));

        // 5. Customer opt-out must cancel pending tasks and update suppression status
        String optOutJson = """
                {
                  "channel": "EMAIL",
                  "reason": "CUSTOMER_REQUEST",
                  "source": "INBOUND_EMAIL"
                }
                """;

        mockMvc.perform(post("/api/v1/travel/ai-follow-up-agent/customers/CUST-1001/opt-out")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(optOutJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.suppressionStatus").value("OPTED_OUT"));

        // Attempting to send message to opted-out customer must be forbidden (403)
        mockMvc.perform(post("/api/v1/travel/ai-follow-up-agent/tasks/TASK-1001/send")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"draftId\":\"draft-1\",\"channel\":\"EMAIL\"}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.errors[0].field").value("communicationConsent"));

        // 6. Classify customer response (e.g. requesting lower price)
        String classifyJson = """
                {
                  "leadId": "LEAD-1001",
                  "text": "Can you show me a cheaper package?"
                }
                """;

        mockMvc.perform(post("/api/v1/travel/ai-follow-up-agent/responses/classify")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(classifyJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.intent").value("REQUEST_LOWER_PRICE"))
                .andExpect(jsonPath("$.data.cancelPendingFollowUps").value(true));
    }

    @Test
    @DisplayName("03. AI Booking Agent: Readiness Validation, Supplier Reservation, Checkout & Voucher Flow")
    void testAiBookingAgentWorkflow() throws Exception {
        // 1. Dashboard
        mockMvc.perform(get("/api/v1/travel/ai-booking-agent/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.confirmedBookings").exists());

        // 2. Validate booking readiness for incomplete handoff
        mockMvc.perform(post("/api/v1/travel/ai-booking-agent/handoffs/handoff_travel_1001/validate"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.ready").value(false))
                .andExpect(jsonPath("$.data.nextAction").value("REQUEST_MISSING_PASSENGER_DETAILS"));

        // 3. Return incomplete handoff
        mockMvc.perform(post("/api/v1/travel/ai-booking-agent/handoffs/handoff_travel_1001/return")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"reason\":\"PASSENGER_DETAILS_INCOMPLETE\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("RETURNED_TO_CONSULTANT"));

        // 4. Create internal booking
        String bookingJson = """
                {
                  "handoffId": "handoff_travel_1001",
                  "quotationId": "quote_travel_1001",
                  "itineraryId": "itin_travel_1001",
                  "itineraryVersion": 1,
                  "currency": "INR"
                }
                """;

        mockMvc.perform(post("/api/v1/travel/ai-booking-agent/bookings")
                        .header("Idempotency-Key", "booking-handoff-1001-v1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bookingJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.bookingId").exists())
                .andExpect(jsonPath("$.data.status").value("VALIDATION_PENDING"));

        // 5. Submit supplier reservation
        String resJson = """
                {
                  "productReference": "supplier_product_101",
                  "supplierReference": "supplier-ref-101",
                  "serviceType": "HOTEL",
                  "travellerCount": { "adults": 2, "children": 0 }
                }
                """;

        mockMvc.perform(post("/api/v1/travel/ai-booking-agent/bookings/TBOOK-1001/supplier-reservations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(resJson))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.data.status").value("PENDING_SUPPLIER_CONFIRMATION"));

        // 6. Create payment checkout session
        String checkoutJson = """
                {
                  "amount": 32000,
                  "currency": "INR",
                  "paymentPurpose": "TRAVEL_BOOKING",
                  "returnUrl": "https://frontend.example.com/travel/payment-result"
                }
                """;

        mockMvc.perform(post("/api/v1/travel/ai-booking-agent/bookings/TBOOK-1001/checkout-sessions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(checkoutJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("PENDING"))
                .andExpect(jsonPath("$.data.checkoutUrl").exists());

        // 7. Voucher generation blocked if supplier reservation is unconfirmed
        mockMvc.perform(post("/api/v1/travel/ai-booking-agent/bookings/TBOOK-1001/vouchers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"reservationId\":\"unconfirmed_res_999\",\"documentType\":\"HOTEL_VOUCHER\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.errors[0].field").value("reservationId"));

        // 8. Voucher generation succeeds for confirmed reservation
        mockMvc.perform(post("/api/v1/travel/ai-booking-agent/bookings/TBOOK-1001/vouchers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"reservationId\":\"supplier_reservation_2001\",\"documentType\":\"HOTEL_VOUCHER\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("GENERATED"));

        // 9. Cancellation request
        String cancelJson = """
                {
                  "reason": "CUSTOMER_REQUEST",
                  "reservationIds": ["supplier_reservation_2001"]
                }
                """;

        mockMvc.perform(post("/api/v1/travel/ai-booking-agent/bookings/TBOOK-1001/cancellation-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(cancelJson))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.data.status").value("PENDING_SUPPLIER_CONFIRMATION"));
    }
}
