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
class TravelTenantIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("01. Sales Manager Dashboard and Lead Assignment flow")
    void testSalesManagerWorkflow() throws Exception {
        // Dashboard
        mockMvc.perform(get("/api/v1/travel/sales-manager/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalLeads").exists());

        // Create lead
        String createLeadJson = """
                {
                  "customer": {
                    "firstName": "Arun",
                    "lastName": "Kumar",
                    "email": "arun@example.com",
                    "phone": "+919876543210"
                  },
                  "travelRequirements": {
                    "destination": "Bali",
                    "departureDate": "2026-12-10",
                    "returnDate": "2026-12-15",
                    "adults": 2,
                    "children": 0,
                    "budget": 120000,
                    "currency": "INR",
                    "travelType": "HOLIDAY_PACKAGE"
                  },
                  "leadSource": "WEBSITE",
                  "notes": "Interested in a five-night holiday package"
                }
                """;

        mockMvc.perform(post("/api/v1/travel/sales-manager/leads")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createLeadJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.leadId").exists());

        // Assign lead
        String assignJson = """
                {
                  "consultantId": "EMP-201",
                  "reason": "Bali holiday package enquiry"
                }
                """;
        mockMvc.perform(post("/api/v1/travel/sales-manager/leads/LEAD-1001/assign")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(assignJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.assignedConsultantId").value("EMP-201"));

        // Create target
        String targetJson = """
                {
                  "name": "November Travel Sales Target",
                  "targetType": "REVENUE",
                  "employeeId": "EMP-201",
                  "periodStart": "2026-11-01",
                  "periodEnd": "2026-11-30",
                  "targetValue": 500000,
                  "currency": "INR"
                }
                """;
        mockMvc.perform(post("/api/v1/travel/sales-manager/targets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(targetJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.targetValue").value(500000));
    }

    @Test
    @DisplayName("02. Travel Consultant requirements, itinerary, quote and handoff flow")
    void testTravelConsultantWorkflow() throws Exception {
        // List assigned leads
        mockMvc.perform(get("/api/v1/travel/consultant/leads"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items").isArray());

        // Record requirements
        String reqJson = """
                {
                  "destination": "Bali",
                  "departureDate": "2026-12-10",
                  "returnDate": "2026-12-15",
                  "adults": 2,
                  "children": 0,
                  "departureCity": "Chennai",
                  "budget": 120000,
                  "currency": "INR",
                  "hotelCategory": "FOUR_STAR",
                  "preferredTravelStyle": "RELAXED"
                }
                """;
        mockMvc.perform(post("/api/v1/travel/consultant/leads/LEAD-1001/requirements")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(reqJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("RECORDED"));

        // Create itinerary
        String itinJson = """
                {
                  "leadId": "LEAD-1001",
                  "customerId": "CUST-1001",
                  "title": "Bali Five-Night Holiday",
                  "destination": "Bali",
                  "startDate": "2026-12-10",
                  "endDate": "2026-12-15",
                  "currency": "INR"
                }
                """;
        mockMvc.perform(post("/api/v1/travel/consultant/itineraries")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(itinJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.itineraryId").exists());

        // Create quotation
        String quoteJson = """
                {
                  "leadId": "LEAD-1001",
                  "customerId": "CUST-1001",
                  "itineraryId": "ITIN-1001",
                  "currency": "INR",
                  "items": [
                    {"description": "Hotel accommodation", "quantity": 5, "unitPrice": 12000},
                    {"description": "Airport transfers", "quantity": 2, "unitPrice": 2500}
                  ],
                  "discountAmount": 2000,
                  "validUntil": "2026-11-05"
                }
                """;
        mockMvc.perform(post("/api/v1/travel/consultant/quotations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(quoteJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalAmount").value(63000));

        // Submit handoff to booking
        String handoffJson = """
                {
                  "quoteId": "TQUOTE-1001",
                  "itineraryId": "ITIN-1001",
                  "customerAcceptanceReference": "ACCEPTANCE-1001",
                  "notes": "Customer accepted the itinerary and requests booking processing"
                }
                """;
        mockMvc.perform(post("/api/v1/travel/consultant/leads/LEAD-1001/handoff-to-booking")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(handoffJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("PENDING_BOOKING_REVIEW"));
    }

    @Test
    @DisplayName("03. Booking Executive handoff acceptance, supplier booking, and voucher generation")
    void testBookingExecutiveWorkflow() throws Exception {
        // Dashboard
        mockMvc.perform(get("/api/v1/travel/booking-executive/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.pendingHandoffs").exists());

        // Accept handoff
        String acceptJson = """
                {
                  "notes": "Booking details reviewed; supplier availability must be verified"
                }
                """;
        mockMvc.perform(post("/api/v1/travel/booking-executive/handoffs/HANDOFF-1001/accept")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(acceptJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("ACCEPTED"));

        // Validate booking
        mockMvc.perform(post("/api/v1/travel/booking-executive/bookings/TBOOK-1001/validate"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.checks").isArray());

        // Submit supplier booking
        String supBookJson = """
                {
                  "bookingId": "TBOOK-1001",
                  "supplierId": "SUP-101",
                  "productType": "HOTEL",
                  "supplierOfferReference": "OFFER-1001",
                  "travellerReference": "TRAVELLER-SET-1001",
                  "currency": "INR"
                }
                """;
        mockMvc.perform(post("/api/v1/travel/booking-executive/supplier-bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(supBookJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.supplierBookingId").exists());

        // Generate voucher
        String voucherJson = """
                {
                  "voucherType": "HOTEL_CONFIRMATION",
                  "includeSupplierReference": true
                }
                """;
        mockMvc.perform(post("/api/v1/travel/booking-executive/bookings/TBOOK-1001/vouchers/generate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(voucherJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.voucherId").exists());
    }

    @Test
    @DisplayName("04. Customer Support tickets, change requests, and refund status")
    void testCustomerSupportWorkflow() throws Exception {
        // Dashboard
        mockMvc.perform(get("/api/v1/travel/customer-support/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.openTickets").exists());

        // Create ticket
        String ticketJson = """
                {
                  "customerId": "CUST-1001",
                  "bookingId": "TBOOK-1001",
                  "category": "ITINERARY_CHANGE",
                  "subject": "Request to change travel date",
                  "description": "Customer wants to move the departure date by one day",
                  "priority": "HIGH",
                  "channel": "EMAIL"
                }
                """;
        mockMvc.perform(post("/api/v1/travel/customer-support/tickets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(ticketJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.ticketId").exists());

        // Change request
        String changeReqJson = """
                {
                  "bookingId": "TBOOK-1001",
                  "changeType": "DEPARTURE_DATE",
                  "requestedChanges": {
                    "departureDate": "2026-12-11",
                    "returnDate": "2026-12-16"
                  },
                  "reason": "Customer travel schedule changed"
                }
                """;
        mockMvc.perform(post("/api/v1/travel/customer-support/change-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(changeReqJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("PENDING_SUPPLIER_REVIEW"));

        // Refund status check
        mockMvc.perform(get("/api/v1/travel/customer-support/refunds/REF-1001/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.refundReference").value("REF-1001"))
                .andExpect(jsonPath("$.data.status").value("PROCESSING"));
    }
}
