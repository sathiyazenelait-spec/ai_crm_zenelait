package com.zenelait.crm.hotel;

import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * Zenelait AI CRM — Hotel Tenant Shared Data Store
 * Coordinates shared records across:
 * 1. Reservation Manager (/api/v1/hotel/reservation-manager)
 * 2. Reservation Executive (/api/v1/hotel/reservation-executive)
 * 3. Customer Support (/api/v1/hotel/customer-support)
 * 4. Front Desk (/api/v1/hotel/front-desk)
 *
 * Ensures tenant isolation (tenant-6, hotel_1001 "Grand Azure Resort")
 * and thread-safe operations for rooms, reservations, folios, service requests, and guests.
 */
@Component
public class HotelDataStore {

    // 1. Hotel, Room Types & Rooms Inventory
    private final Map<String, Map<String, Object>> hotels = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> roomTypes = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> rooms = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> ratePlans = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> roomInventory = new ConcurrentHashMap<>();

    // 2. Guests & Verification
    private final Map<String, Map<String, Object>> guests = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> guestVerifications = new ConcurrentHashMap<>();

    // 3. Reservations, Quotes, Folios & Payments
    private final Map<String, Map<String, Object>> reservations = new ConcurrentHashMap<>();
    private final Map<String, List<Map<String, Object>>> reservationHistory = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> quotes = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> modificationRequests = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> cancellationRequests = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> folios = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> roomMoveRequests = new ConcurrentHashMap<>();

    // 4. Staff & Work Assignments
    private final Map<String, Map<String, Object>> staff = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> workAssignments = new ConcurrentHashMap<>();

    // 5. Enquiries & Follow-ups
    private final Map<String, Map<String, Object>> enquiries = new ConcurrentHashMap<>();
    private final Map<String, List<Map<String, Object>>> enquiryActivities = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> followUps = new ConcurrentHashMap<>();

    // 6. Customer Support: Conversations, Tickets, Service Requests, Knowledge
    private final Map<String, Map<String, Object>> conversations = new ConcurrentHashMap<>();
    private final Map<String, List<Map<String, Object>>> conversationMessages = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> tickets = new ConcurrentHashMap<>();
    private final Map<String, List<Map<String, Object>>> ticketMessages = new ConcurrentHashMap<>();
    private final Map<String, List<Map<String, Object>>> ticketNotes = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> ticketReplyDrafts = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> serviceRequests = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> maintenanceRequests = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> guestRequests = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> receptionEnquiries = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> knowledgeArticles = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> escalations = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> feedbackRecords = new ConcurrentHashMap<>();

    // 7. Automation & AI Configurations
    private final Map<String, Object> aiConfig = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> automationRules = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> automationRuns = new ConcurrentHashMap<>();
    private final List<Map<String, Object>> auditEvents = Collections.synchronizedList(new ArrayList<>());

    // 8. Hotel AI Employees (Reservation, Support, Follow-up) Shared Stores
    private final Map<String, Map<String, Object>> aiHandoffs = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> paymentSessions = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> guestVerificationSessions = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> campaigns = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> sequences = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> followUpRules = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> followUpMessages = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> followUpExecutions = new ConcurrentHashMap<>();

    public HotelDataStore() {
        seedInitialData();
    }

    private void seedInitialData() {
        // Hotel Info
        Map<String, Object> hotel = new LinkedHashMap<>();
        hotel.put("hotelId", "hotel_1001");
        hotel.put("tenantId", "tenant-6");
        hotel.put("name", "Grand Azure Resort");
        hotel.put("city", "Goa");
        hotel.put("address", "Calangute Beachfront Rd, Goa 403516");
        hotel.put("totalRooms", 100);
        hotel.put("currency", "INR");
        hotels.put("hotel_1001", hotel);

        // Room Types
        Map<String, Object> rt1 = new LinkedHashMap<>();
        rt1.put("roomTypeId", "roomtype_1001");
        rt1.put("hotelId", "hotel_1001");
        rt1.put("name", "Deluxe Room");
        rt1.put("code", "DLX");
        rt1.put("basePrice", 4500.00);
        rt1.put("currency", "INR");
        rt1.put("maxOccupancy", 2);
        rt1.put("description", "Spacious 350 sq.ft room with king bed, balcony and ocean view.");
        roomTypes.put("roomtype_1001", rt1);

        Map<String, Object> rt2 = new LinkedHashMap<>();
        rt2.put("roomTypeId", "roomtype_1002");
        rt2.put("hotelId", "hotel_1001");
        rt2.put("name", "Executive Suite");
        rt2.put("code", "STE");
        rt2.put("basePrice", 7500.00);
        rt2.put("currency", "INR");
        rt2.put("maxOccupancy", 3);
        rt2.put("description", "Luxury suite with living room, private bar, and panoramic sea view.");
        roomTypes.put("roomtype_1002", rt2);

        Map<String, Object> rt3 = new LinkedHashMap<>();
        rt3.put("roomTypeId", "roomtype_1003");
        rt3.put("hotelId", "hotel_1001");
        rt3.put("name", "Presidential Pool Villa");
        rt3.put("code", "VLA");
        rt3.put("basePrice", 18000.00);
        rt3.put("currency", "INR");
        rt3.put("maxOccupancy", 4);
        rt3.put("description", "Exclusive beachfront villa with private heated plunge pool & 24/7 butler.");
        roomTypes.put("roomtype_1003", rt3);

        // Rate Plans
        Map<String, Object> rp1 = new LinkedHashMap<>();
        rp1.put("ratePlanId", "rate_1001");
        rp1.put("roomTypeId", "roomtype_1001");
        rp1.put("name", "Standard Flexible Rate");
        rp1.put("pricePerNight", 4500.00);
        rp1.put("currency", "INR");
        rp1.put("refundable", true);
        rp1.put("status", "ACTIVE");
        ratePlans.put("rate_1001", rp1);

        Map<String, Object> rp2 = new LinkedHashMap<>();
        rp2.put("ratePlanId", "rate_1002");
        rp2.put("roomTypeId", "roomtype_1001");
        rp2.put("name", "Weekend Deluxe Rate");
        rp2.put("pricePerNight", 5000.00);
        rp2.put("currency", "INR");
        rp2.put("refundable", true);
        rp2.put("status", "ACTIVE");
        ratePlans.put("rate_1002", rp2);

        // Rooms
        String[] roomNums = {"201", "202", "203", "204", "205", "206", "301", "302", "401"};
        String[] statuses = {"AVAILABLE", "AVAILABLE", "OCCUPIED", "AVAILABLE", "AVAILABLE", "OUT_OF_SERVICE", "AVAILABLE", "OCCUPIED", "AVAILABLE"};
        String[] hkStatuses = {"CLEAN", "CLEAN", "OCCUPIED", "IN_PROGRESS", "CLEAN", "DIRTY", "INSPECTED", "OCCUPIED", "CLEAN"};
        for (int i = 0; i < roomNums.length; i++) {
            String rid = "room_" + (1001 + i);
            Map<String, Object> r = new LinkedHashMap<>();
            r.put("roomId", rid);
            r.put("hotelId", "hotel_1001");
            r.put("roomNumber", roomNums[i]);
            r.put("roomTypeId", i < 6 ? "roomtype_1001" : (i < 8 ? "roomtype_1002" : "roomtype_1003"));
            r.put("status", statuses[i]);
            r.put("housekeepingStatus", hkStatuses[i]);
            r.put("maintenanceStatus", "AVAILABLE");
            r.put("floor", i < 6 ? 2 : (i < 8 ? 3 : 4));
            rooms.put(rid, r);
        }

        // Room Inventory
        Map<String, Object> inv1 = new LinkedHashMap<>();
        inv1.put("inventoryId", "inv_1001");
        inv1.put("hotelId", "hotel_1001");
        inv1.put("roomTypeId", "roomtype_1001");
        inv1.put("date", "2026-11-05");
        inv1.put("totalRooms", 50);
        inv1.put("bookedRooms", 46);
        inv1.put("availableRooms", 4);
        inv1.put("status", "AVAILABLE");
        roomInventory.put("inv_1001", inv1);

        // Guests
        Map<String, Object> g1 = new LinkedHashMap<>();
        g1.put("guestId", "guest_1001");
        g1.put("hotelId", "hotel_1001");
        g1.put("firstName", "Arun");
        g1.put("lastName", "Kumar");
        g1.put("email", "arun@example.com");
        g1.put("phone", "+919876543210");
        g1.put("vipStatus", "GOLD");
        g1.put("preferredLanguage", "en");
        g1.put("communicationPreference", "EMAIL");
        g1.put("verificationStatus", "VERIFIED");
        guests.put("guest_1001", g1);

        Map<String, Object> g2 = new LinkedHashMap<>();
        g2.put("guestId", "guest_1002");
        g2.put("hotelId", "hotel_1001");
        g2.put("firstName", "Priya");
        g2.put("lastName", "Sharma");
        g2.put("email", "priya@example.com");
        g2.put("phone", "+919811223344");
        g2.put("vipStatus", "PLATINUM");
        g2.put("preferredLanguage", "en");
        g2.put("communicationPreference", "WHATSAPP");
        g2.put("verificationStatus", "VERIFIED");
        guests.put("guest_1002", g2);

        // Reservations
        Map<String, Object> res1 = new LinkedHashMap<>();
        res1.put("reservationId", "res_1001");
        res1.put("confirmationNumber", "GH-2026-1001");
        res1.put("hotelId", "hotel_1001");
        res1.put("guestId", "guest_1001");
        res1.put("guestName", "Arun Kumar");
        res1.put("roomTypeId", "roomtype_1001");
        res1.put("roomType", "DELUXE");
        res1.put("assignedRoomId", "room_1005");
        res1.put("roomNumber", "205");
        res1.put("checkInDate", "2026-11-05");
        res1.put("checkOutDate", "2026-11-07");
        res1.put("nights", 2);
        res1.put("adults", 2);
        res1.put("children", 0);
        res1.put("rooms", 1);
        res1.put("status", "CONFIRMED");
        res1.put("paymentStatus", "PAID");
        res1.put("totalAmount", 10620.00);
        res1.put("currency", "INR");
        res1.put("specialRequests", "Non-smoking room, high floor");
        res1.put("createdAt", "2026-10-28T10:00:00+05:30");
        reservations.put("res_1001", res1);

        List<Map<String, Object>> hist1 = new ArrayList<>();
        Map<String, Object> h1 = new LinkedHashMap<>();
        h1.put("action", "CREATED");
        h1.put("status", "PENDING_CONFIRMATION");
        h1.put("timestamp", "2026-10-28T10:00:00+05:30");
        h1.put("actor", "AI_RESERVATION_AGENT");
        hist1.add(h1);
        Map<String, Object> h2 = new LinkedHashMap<>();
        h2.put("action", "CONFIRMED");
        h2.put("status", "CONFIRMED");
        h2.put("timestamp", "2026-10-28T10:05:00+05:30");
        h2.put("actor", "PAYMENT_GATEWAY");
        hist1.add(h2);
        reservationHistory.put("res_1001", hist1);

        Map<String, Object> res2 = new LinkedHashMap<>();
        res2.put("reservationId", "res_1002");
        res2.put("confirmationNumber", "GH-2026-1002");
        res2.put("hotelId", "hotel_1001");
        res2.put("guestId", "guest_1002");
        res2.put("guestName", "Priya Sharma");
        res2.put("roomTypeId", "roomtype_1002");
        res2.put("roomType", "EXECUTIVE_SUITE");
        res2.put("assignedRoomId", "room_1007");
        res2.put("roomNumber", "301");
        res2.put("checkInDate", "2026-10-28");
        res2.put("checkOutDate", "2026-10-31");
        res2.put("nights", 3);
        res2.put("adults", 2);
        res2.put("children", 1);
        res2.put("rooms", 1);
        res2.put("status", "CHECKED_IN");
        res2.put("paymentStatus", "PAID");
        res2.put("totalAmount", 26550.00);
        res2.put("currency", "INR");
        res2.put("createdAt", "2026-10-27T14:30:00+05:30");
        reservations.put("res_1002", res2);

        // Quotes
        Map<String, Object> q1 = new LinkedHashMap<>();
        q1.put("quoteId", "quote_1001");
        q1.put("guestId", "guest_1001");
        q1.put("roomTypeId", "roomtype_1001");
        q1.put("roomType", "Deluxe Room");
        q1.put("nights", 2);
        q1.put("roomSubtotal", 9000.00);
        q1.put("taxes", 1620.00);
        q1.put("totalAmount", 10620.00);
        q1.put("currency", "INR");
        q1.put("status", "VALID");
        q1.put("expiresAt", "2026-10-28T18:00:00+05:30");
        quotes.put("quote_1001", q1);

        // Folios
        Map<String, Object> folio1 = new LinkedHashMap<>();
        folio1.put("folioId", "folio_1001");
        folio1.put("reservationId", "res_1001");
        folio1.put("currency", "INR");
        folio1.put("roomCharges", 9000.00);
        folio1.put("taxes", 1620.00);
        folio1.put("additionalCharges", 500.00);
        folio1.put("paymentsReceived", 11120.00);
        folio1.put("balanceDue", 0.00);
        folio1.put("folioStatus", "SETTLED");
        folios.put("res_1001", folio1);

        // Staff
        Map<String, Object> s1 = new LinkedHashMap<>();
        s1.put("staffId", "usr_res_101");
        s1.put("name", "Vikram Rathore");
        s1.put("role", "RESERVATION_EXECUTIVE");
        s1.put("status", "ACTIVE");
        s1.put("assignedEnquiries", 4);
        staff.put("usr_res_101", s1);

        Map<String, Object> s2 = new LinkedHashMap<>();
        s2.put("staffId", "usr_fd_101");
        s2.put("name", "Sneha Roy");
        s2.put("role", "FRONT_DESK_AGENT");
        s2.put("status", "ACTIVE");
        staff.put("usr_fd_101", s2);

        Map<String, Object> s3 = new LinkedHashMap<>();
        s3.put("staffId", "usr_cs_101");
        s3.put("name", "Rahul Sen");
        s3.put("role", "CUSTOMER_SUPPORT");
        s3.put("status", "ACTIVE");
        staff.put("usr_cs_101", s3);

        // Enquiries
        Map<String, Object> enq1 = new LinkedHashMap<>();
        enq1.put("enquiryId", "enq_1001");
        enq1.put("guestId", "guest_1001");
        enq1.put("guestName", "Arun Kumar");
        enq1.put("channel", "WEBSITE");
        enq1.put("subject", "Family room availability for weekend");
        enq1.put("message", "Do you have two interconnecting rooms or villa available?");
        enq1.put("status", "OPEN");
        enq1.put("priority", "NORMAL");
        enq1.put("assignedTo", "usr_res_101");
        enq1.put("createdAt", "2026-10-28T09:30:00+05:30");
        enquiries.put("enq_1001", enq1);

        // Follow-ups
        Map<String, Object> fu1 = new LinkedHashMap<>();
        fu1.put("taskId", "followup_1001");
        fu1.put("enquiryId", "enq_1001");
        fu1.put("guestId", "guest_1001");
        fu1.put("type", "EMAIL");
        fu1.put("description", "Follow up on family room quotation");
        fu1.put("dueAt", "2026-10-29T10:00:00+05:30");
        followUps.put("followup_1001", fu1);

        Map<String, Object> fuAi = new LinkedHashMap<>();
        fuAi.put("taskId", "FUP-1001");
        fuAi.put("guestId", "GUEST-1002");
        fuAi.put("relatedEntityType", "RESERVATION_QUOTE");
        fuAi.put("relatedEntityId", "QUOTE-1001");
        fuAi.put("taskType", "QUOTE_FOLLOW_UP");
        fuAi.put("scheduledAt", "2026-10-29T10:00:00+05:30");
        fuAi.put("status", "PENDING");
        fuAi.put("assignedRole", "RESERVATION_EXECUTIVE");
        followUps.put("FUP-1001", fuAi);

        // Tickets
        Map<String, Object> t1 = new LinkedHashMap<>();
        t1.put("ticketId", "ticket_1001");
        t1.put("guestId", "guest_1002");
        t1.put("reservationId", "res_1002");
        t1.put("subject", "Air conditioning is cooling slowly");
        t1.put("description", "Room 301 AC thermostat is set to 20C but room feels warm.");
        t1.put("category", "ROOM_MAINTENANCE");
        t1.put("priority", "HIGH");
        t1.put("status", "OPEN");
        t1.put("assignedTeam", "MAINTENANCE");
        t1.put("assignedTo", "usr_maint_101");
        t1.put("createdAt", "2026-10-28T10:30:00+05:30");
        tickets.put("ticket_1001", t1);

        // Service Requests
        Map<String, Object> sr1 = new LinkedHashMap<>();
        sr1.put("requestId", "service_1001");
        sr1.put("guestId", "guest_1002");
        sr1.put("reservationId", "res_1002");
        sr1.put("category", "HOUSEKEEPING");
        sr1.put("description", "Extra bath towels and bottled water requested.");
        sr1.put("status", "OPEN");
        sr1.put("priority", "NORMAL");
        sr1.put("assignedTeam", "HOUSEKEEPING");
        serviceRequests.put("service_1001", sr1);

        // Guest Requests (Front Desk)
        Map<String, Object> gr1 = new LinkedHashMap<>();
        gr1.put("requestId", "guest_request_1001");
        gr1.put("reservationId", "res_1002");
        gr1.put("category", "HOUSEKEEPING");
        gr1.put("description", "Guest requested extra bath towels.");
        gr1.put("status", "OPEN");
        gr1.put("assignedTeam", "HOUSEKEEPING");
        guestRequests.put("guest_request_1001", gr1);

        // Knowledge Base
        Map<String, Object> kb1 = new LinkedHashMap<>();
        kb1.put("articleId", "kb_hotel_1001");
        kb1.put("title", "Standard Check-In & Check-Out Policy");
        kb1.put("snippet", "Standard check-in time is 14:00. Check-out time is 11:00. Early check-in is subject to room readiness.");
        kb1.put("version", 3);
        kb1.put("status", "PUBLISHED");
        knowledgeArticles.put("kb_hotel_1001", kb1);

        Map<String, Object> kb2 = new LinkedHashMap<>();
        kb2.put("articleId", "kb_hotel_1002");
        kb2.put("title", "Cancellation and Refund Rules");
        kb2.put("snippet", "Cancellations made 48 hours prior to arrival are 100% refundable. Late cancellations forfeit 1st night room charge.");
        kb2.put("version", 2);
        kb2.put("status", "PUBLISHED");
        knowledgeArticles.put("kb_hotel_1002", kb2);

        // AI Configuration
        aiConfig.put("status", "ACTIVE");
        aiConfig.put("autoQuoteGeneration", true);
        aiConfig.put("requireApprovalForRates", true);
        aiConfig.put("escalateGroupBookingsMinRooms", 4);
        aiConfig.put("responseTone", "HOSPITABLE_LUXURY");
        aiConfig.put("groundingSource", "PUBLISHED_POLICIES_ONLY");

        // Automation Rules
        Map<String, Object> rule1 = new LinkedHashMap<>();
        rule1.put("ruleId", "rule_1001");
        rule1.put("name", "Reservation Confirmation Reminder");
        rule1.put("trigger", "RESERVATION_CONFIRMED");
        rule1.put("status", "ENABLED");
        rule1.put("actionsCount", 1);
        automationRules.put("rule_1001", rule1);

        // AI Follow-up Seed Data
        Map<String, Object> camp1 = new LinkedHashMap<>();
        camp1.put("campaignId", "CAMP-1001");
        camp1.put("name", "Unconverted Quote Follow-up");
        camp1.put("description", "Follow up with eligible guests who received a quote");
        camp1.put("campaignType", "QUOTE_CONVERSION");
        camp1.put("channel", "EMAIL");
        camp1.put("status", "ACTIVE");
        camp1.put("eligibleAudienceCount", 25);
        camp1.put("approvalRequired", false);
        campaigns.put("CAMP-1001", camp1);

        Map<String, Object> seq1 = new LinkedHashMap<>();
        seq1.put("sequenceId", "SEQ-1001");
        seq1.put("name", "Reservation Enquiry Follow-up");
        seq1.put("status", "ACTIVE");
        seq1.put("stepCount", 2);
        seq1.put("triggerEvent", "ENQUIRY_CREATED");
        sequences.put("SEQ-1001", seq1);

        Map<String, Object> exec1 = new LinkedHashMap<>();
        exec1.put("executionId", "EXEC-1001");
        exec1.put("sequenceId", "SEQ-1001");
        exec1.put("status", "FAILED");
        exec1.put("failureCode", "PROVIDER_TIMEOUT");
        exec1.put("retryable", true);
        exec1.put("attemptCount", 1);
        followUpExecutions.put("EXEC-1001", exec1);
    }

    // Customer Support Helper Methods
    public Map<String, Object> getCustomerSupportDashboard(String tenantId) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("openTickets", tickets.size());
        m.put("highPriorityTickets", 4);
        m.put("unassignedTickets", 3);
        m.put("openConversations", conversations.size() > 0 ? conversations.size() : 12);
        m.put("pendingServiceRequests", serviceRequests.size());
        m.put("pendingEscalations", escalations.size() > 0 ? escalations.size() : 2);
        m.put("ticketsResolvedToday", 17);
        return m;
    }

    public List<Map<String, Object>> getConversations(String tenantId, String status) {
        return new ArrayList<>(conversations.values());
    }

    public Map<String, Object> createConversation(String tenantId, Map<String, Object> body) {
        String id = "conv_" + (1001 + conversations.size());
        Map<String, Object> conv = new LinkedHashMap<>(body);
        conv.put("conversationId", id);
        conv.put("status", "OPEN");
        conv.put("createdAt", LocalDateTime.now().toString());
        conversations.put(id, conv);
        return conv;
    }

    public Map<String, Object> getConversation(String tenantId, String id) {
        return conversations.get(id);
    }

    public List<Map<String, Object>> getConversationMessages(String tenantId, String convId) {
        return conversationMessages.getOrDefault(convId, Collections.emptyList());
    }

    public Map<String, Object> addConversationMessage(String tenantId, String convId, Map<String, Object> body) {
        String mid = "msg_" + UUID.randomUUID().toString().substring(0, 8);
        Map<String, Object> msg = new LinkedHashMap<>(body);
        msg.put("messageId", mid);
        msg.put("conversationId", convId);
        msg.put("sentAt", LocalDateTime.now().toString());
        conversationMessages.computeIfAbsent(convId, k -> new ArrayList<>()).add(msg);
        return msg;
    }

    public Map<String, Object> summarizeConversation(String tenantId, String convId) {
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("conversationId", convId);
        res.put("summary", "Guest enquired about room upgrades and beach transfer shuttle schedule.");
        res.put("sentiment", "POSITIVE");
        res.put("suggestedAction", "Offer executive cabana package");
        return res;
    }

    public Map<String, Object> handoffConversation(String tenantId, String convId, Map<String, Object> body) {
        Map<String, Object> res = new LinkedHashMap<>(body);
        res.put("conversationId", convId);
        res.put("status", "HANDED_OFF");
        res.put("handoffTime", LocalDateTime.now().toString());
        return res;
    }

    public Map<String, Object> closeConversation(String tenantId, String convId) {
        Map<String, Object> conv = conversations.get(convId);
        if (conv != null) conv.put("status", "CLOSED");
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("conversationId", convId);
        res.put("status", "CLOSED");
        return res;
    }

    public Map<String, Object> getTickets(String tenantId, String status, String category, int page, int size) {
        List<Map<String, Object>> filtered = tickets.values().stream()
                .filter(t -> status == null || status.equalsIgnoreCase((String) t.get("status")))
                .filter(t -> category == null || category.equalsIgnoreCase((String) t.get("category")))
                .collect(Collectors.toList());
        Map<String, Object> paged = new LinkedHashMap<>();
        paged.put("items", filtered);
        paged.put("page", page);
        paged.put("size", size);
        paged.put("totalElements", filtered.size());
        paged.put("totalPages", 1);
        return paged;
    }

    public Map<String, Object> createTicket(String tenantId, Map<String, Object> body) {
        String id = "ticket_" + (1001 + tickets.size());
        Map<String, Object> t = new LinkedHashMap<>(body);
        t.put("ticketId", id);
        t.put("status", "OPEN");
        t.put("assignedTeam", body.getOrDefault("assignedTeam", "MAINTENANCE"));
        t.put("createdAt", LocalDateTime.now().toString());
        tickets.put(id, t);
        return t;
    }

    public Map<String, Object> getTicket(String tenantId, String id) {
        return tickets.get(id);
    }

    public Map<String, Object> updateTicket(String tenantId, String id, Map<String, Object> updates) {
        Map<String, Object> t = tickets.get(id);
        if (t != null) t.putAll(updates);
        return t;
    }

    public Map<String, Object> assignTicket(String tenantId, String id, Map<String, Object> body) {
        Map<String, Object> t = tickets.get(id);
        if (t != null) {
            t.put("assignedTo", body.get("assignedTo"));
            t.put("assignedTeam", body.getOrDefault("assignedTeam", t.get("assignedTeam")));
            t.put("status", "ASSIGNED");
        }
        return t != null ? t : body;
    }

    public Map<String, Object> addTicketCustomerMessage(String tenantId, String id, Map<String, Object> body) {
        String mid = "tmsg_" + UUID.randomUUID().toString().substring(0, 8);
        Map<String, Object> msg = new LinkedHashMap<>(body);
        msg.put("messageId", mid);
        msg.put("ticketId", id);
        msg.put("visibility", "CUSTOMER_VISIBLE");
        msg.put("timestamp", LocalDateTime.now().toString());
        ticketMessages.computeIfAbsent(id, k -> new ArrayList<>()).add(msg);
        return msg;
    }

    public Map<String, Object> addTicketInternalNote(String tenantId, String id, Map<String, Object> body) {
        String nid = "note_" + (1001 + (ticketNotes.get(id) != null ? ticketNotes.get(id).size() : 0));
        Map<String, Object> note = new LinkedHashMap<>(body);
        note.put("noteId", nid);
        note.put("ticketId", id);
        note.put("visibility", "INTERNAL");
        note.put("createdBy", body.getOrDefault("createdBy", "usr_support_101"));
        note.put("timestamp", LocalDateTime.now().toString());
        ticketNotes.computeIfAbsent(id, k -> new ArrayList<>()).add(note);
        return note;
    }

    public Map<String, Object> classifyTicket(String tenantId, String id) {
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("ticketId", id);
        res.put("suggestedCategory", "ROOM_MAINTENANCE");
        res.put("suggestedPriority", "HIGH");
        res.put("confidence", 0.94);
        return res;
    }

    public Map<String, Object> createTicketReplyDraft(String tenantId, String id, Map<String, Object> body) {
        String did = "draft_" + (1001 + ticketReplyDrafts.size());
        Map<String, Object> draft = new LinkedHashMap<>();
        draft.put("draftId", did);
        draft.put("ticketId", id);
        draft.put("status", "PENDING_APPROVAL");
        draft.put("body", "We apologize for the inconvenience. Our engineering team has dispatched a technician to inspect your room climate control.");
        draft.put("sourceReferences", Collections.emptyList());
        draft.put("requiresHumanApproval", true);
        ticketReplyDrafts.put(did, draft);
        return draft;
    }

    public Map<String, Object> approveReplyDraft(String tenantId, String ticketId, String draftId) {
        Map<String, Object> draft = ticketReplyDrafts.get(draftId);
        if (draft != null) draft.put("status", "APPROVED");
        return draft != null ? draft : Collections.singletonMap("draftId", draftId);
    }

    public Map<String, Object> sendReplyDraft(String tenantId, String ticketId, String draftId) {
        Map<String, Object> draft = ticketReplyDrafts.get(draftId);
        if (draft != null) {
            draft.put("status", "SENT");
            draft.put("sentAt", LocalDateTime.now().toString());
        }
        return draft != null ? draft : Collections.singletonMap("status", "SENT");
    }

    public Map<String, Object> escalateTicket(String tenantId, String id, Map<String, Object> body) {
        String eid = "esc_" + (1001 + escalations.size());
        Map<String, Object> esc = new LinkedHashMap<>(body);
        esc.put("escalationId", eid);
        esc.put("ticketId", id);
        esc.put("status", "OPEN");
        esc.put("assignedTeam", body.getOrDefault("assignedTeam", "DUTY_MANAGER"));
        escalations.put(eid, esc);
        return esc;
    }

    public Map<String, Object> resolveTicket(String tenantId, String id, Map<String, Object> body) {
        Map<String, Object> t = tickets.get(id);
        if (t != null) {
            t.put("status", "RESOLVED");
            t.put("resolutionCode", body.getOrDefault("resolutionCode", "MAINTENANCE_COMPLETED"));
            t.put("resolvedBy", "usr_support_101");
        }
        return t != null ? t : body;
    }

    public Map<String, Object> reopenTicket(String tenantId, String id, Map<String, Object> body) {
        Map<String, Object> t = tickets.get(id);
        if (t != null) {
            t.put("status", "OPEN");
        }
        return t != null ? t : Collections.singletonMap("ticketId", id);
    }

    public List<Map<String, Object>> getServiceRequests(String tenantId, String status, String category) {
        return serviceRequests.values().stream()
                .filter(sr -> status == null || status.equalsIgnoreCase((String) sr.get("status")))
                .filter(sr -> category == null || category.equalsIgnoreCase((String) sr.get("category")))
                .collect(Collectors.toList());
    }

    public Map<String, Object> createServiceRequest(String tenantId, Map<String, Object> body) {
        String id = "service_" + (1001 + serviceRequests.size());
        Map<String, Object> sr = new LinkedHashMap<>(body);
        sr.put("requestId", id);
        sr.put("status", "OPEN");
        sr.put("assignedTeam", body.getOrDefault("category", "HOUSEKEEPING"));
        serviceRequests.put(id, sr);
        return sr;
    }

    public Map<String, Object> getServiceRequest(String tenantId, String id) {
        return serviceRequests.get(id);
    }

    public Map<String, Object> updateServiceRequest(String tenantId, String id, Map<String, Object> updates) {
        Map<String, Object> sr = serviceRequests.get(id);
        if (sr != null) sr.putAll(updates);
        return sr;
    }

    public Map<String, Object> assignServiceRequest(String tenantId, String id, Map<String, Object> body) {
        Map<String, Object> sr = serviceRequests.get(id);
        if (sr != null) {
            sr.put("assignedTo", body.get("assignedTo"));
            sr.put("status", "ASSIGNED");
        }
        return sr != null ? sr : body;
    }

    public Map<String, Object> escalateServiceRequest(String tenantId, String id, Map<String, Object> body) {
        Map<String, Object> sr = serviceRequests.get(id);
        if (sr != null) {
            sr.put("priority", "HIGH");
            sr.put("status", "ESCALATED");
        }
        return sr != null ? sr : body;
    }

    public Map<String, Object> resolveServiceRequest(String tenantId, String id, Map<String, Object> body) {
        Map<String, Object> sr = serviceRequests.get(id);
        if (sr != null) {
            sr.put("status", "COMPLETED");
            sr.put("completedAt", LocalDateTime.now().toString());
        }
        return sr != null ? sr : body;
    }

    public List<Map<String, Object>> getKnowledgeArticles(String tenantId, String query) {
        return new ArrayList<>(knowledgeArticles.values());
    }

    public Map<String, Object> getKnowledgeArticle(String tenantId, String id) {
        return knowledgeArticles.get(id);
    }

    public Map<String, Object> generateGroundedAnswer(String tenantId, Map<String, Object> body) {
        Map<String, Object> ans = new LinkedHashMap<>();
        ans.put("question", body.get("question"));
        ans.put("answer", "Per Grand Azure Resort policy, standard check-in time is 14:00 and check-out is 11:00.");
        ans.put("sourceArticles", Collections.singletonList("kb_hotel_1001"));
        ans.put("confidence", 0.98);
        return ans;
    }

    public Map<String, Object> generateGeneralReplyDraft(String tenantId, Map<String, Object> body) {
        Map<String, Object> draft = new LinkedHashMap<>();
        draft.put("draft", "Dear Guest, thank you for reaching out to Grand Azure Resort. We have noted your request and our concierge is on standby to assist.");
        draft.put("tone", "HOSPITABLE");
        return draft;
    }

    public List<Map<String, Object>> getSupportEscalations(String tenantId, String status) {
        return new ArrayList<>(escalations.values());
    }

    public Map<String, Object> getSupportEscalation(String tenantId, String id) {
        return escalations.get(id);
    }

    public Map<String, Object> assignSupportEscalation(String tenantId, String id, Map<String, Object> body) {
        Map<String, Object> esc = escalations.get(id);
        if (esc != null) esc.put("assignedTo", body.get("assignedTo"));
        return esc != null ? esc : body;
    }

    public Map<String, Object> resolveSupportEscalation(String tenantId, String id, Map<String, Object> body) {
        Map<String, Object> esc = escalations.get(id);
        if (esc != null) esc.put("status", "RESOLVED");
        return esc != null ? esc : body;
    }

    public Map<String, Object> recordGuestFeedback(String tenantId, Map<String, Object> body) {
        String fid = "fb_" + (1001 + feedbackRecords.size());
        Map<String, Object> fb = new LinkedHashMap<>(body);
        fb.put("feedbackId", fid);
        fb.put("recordedAt", LocalDateTime.now().toString());
        feedbackRecords.put(fid, fb);
        return fb;
    }

    public Map<String, Object> getCustomerSupportMetrics(String tenantId, String period) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("period", period);
        m.put("averageFirstResponseMinutes", 4.2);
        m.put("averageResolutionHours", 1.8);
        m.put("csatScore", 4.8);
        m.put("totalTicketsResolved", 248);
        return m;
    }

    public List<Map<String, Object>> getAuditEvents(String tenantId) {
        return auditEvents;
    }

    // Front Desk Helper Methods
    public Map<String, Object> getFrontDeskDashboard(String tenantId, String date) {
        Map<String, Object> d = new LinkedHashMap<>();
        d.put("date", date != null ? date : "2026-10-28");
        d.put("expectedArrivals", 42);
        d.put("expectedDepartures", 31);
        d.put("inHouseGuests", 148);
        d.put("pendingCheckIns", 12);
        d.put("pendingCheckOuts", 7);
        d.put("roomsReady", 18);
        d.put("roomsAwaitingHousekeeping", 5);
        d.put("openGuestRequests", 9);
        return d;
    }

    public List<Map<String, Object>> getArrivals(String tenantId, String date) {
        List<Map<String, Object>> arrs = new ArrayList<>();
        Map<String, Object> a = new LinkedHashMap<>();
        a.put("reservationId", "res_1001");
        a.put("confirmationNumber", "GH-2026-1001");
        a.put("guestName", "Arun Kumar");
        a.put("checkInDate", date != null ? date : "2026-11-05");
        a.put("checkOutDate", "2026-11-07");
        a.put("reservationStatus", "CONFIRMED");
        a.put("assignedRoom", null);
        a.put("checkInStatus", "NOT_CHECKED_IN");
        arrs.add(a);
        return arrs;
    }

    public List<Map<String, Object>> getDepartures(String tenantId, String date) {
        List<Map<String, Object>> deps = new ArrayList<>();
        Map<String, Object> d = new LinkedHashMap<>();
        d.put("reservationId", "res_1002");
        d.put("confirmationNumber", "GH-2026-1002");
        d.put("guestName", "Priya Sharma");
        d.put("checkOutDate", date != null ? date : "2026-10-31");
        d.put("assignedRoom", "301");
        d.put("folioStatus", "SETTLED");
        d.put("checkOutStatus", "PENDING_DEPARTURE");
        deps.add(d);
        return deps;
    }

    public List<Map<String, Object>> getInHouseGuests(String tenantId) {
        return reservations.values().stream()
                .filter(r -> "CHECKED_IN".equalsIgnoreCase((String) r.get("status")))
                .collect(Collectors.toList());
    }

    public Map<String, Object> getReservations(String tenantId, String status, String search, int page, int size) {
        List<Map<String, Object>> filtered = reservations.values().stream()
                .filter(r -> status == null || status.equalsIgnoreCase((String) r.get("status")))
                .filter(r -> search == null || ((String) r.get("guestName")).toLowerCase().contains(search.toLowerCase()))
                .collect(Collectors.toList());
        Map<String, Object> paged = new LinkedHashMap<>();
        paged.put("items", filtered);
        paged.put("page", page);
        paged.put("size", size);
        paged.put("totalElements", filtered.size());
        paged.put("totalPages", 1);
        return paged;
    }

    public Map<String, Object> getReservation(String tenantId, String id) {
        return reservations.get(id);
    }

    public List<Map<String, Object>> getReservationHistory(String tenantId, String id) {
        return reservationHistory.getOrDefault(id, Collections.emptyList());
    }

    public Map<String, Object> getGuests(String tenantId, String search, int page, int size) {
        List<Map<String, Object>> list = guests.values().stream()
                .filter(g -> search == null || ((String) g.get("firstName")).toLowerCase().contains(search.toLowerCase()))
                .collect(Collectors.toList());
        Map<String, Object> paged = new LinkedHashMap<>();
        paged.put("items", list);
        paged.put("page", page);
        paged.put("size", size);
        paged.put("totalElements", list.size());
        paged.put("totalPages", 1);
        return paged;
    }

    public Map<String, Object> createGuest(String tenantId, Map<String, Object> body) {
        String gid = "guest_" + (1001 + guests.size());
        Map<String, Object> g = new LinkedHashMap<>(body);
        g.put("guestId", gid);
        g.put("verificationStatus", "VERIFIED");
        guests.put(gid, g);
        return g;
    }

    public Map<String, Object> getGuest(String tenantId, String id) {
        return guests.get(id);
    }

    public Map<String, Object> updateGuest(String tenantId, String id, Map<String, Object> updates) {
        Map<String, Object> g = guests.get(id);
        if (g != null) g.putAll(updates);
        return g;
    }

    public Map<String, Object> recordGuestVerification(String tenantId, String id, Map<String, Object> body) {
        Map<String, Object> res = new LinkedHashMap<>(body);
        res.put("guestId", id);
        res.put("verificationStatus", "VERIFIED");
        res.put("verifiedAt", LocalDateTime.now().toString());
        guestVerifications.put(id, res);
        return res;
    }

    public List<Map<String, Object>> getGuestStayHistory(String tenantId, String id) {
        return reservations.values().stream()
                .filter(r -> id.equals(r.get("guestId")))
                .collect(Collectors.toList());
    }

    public Map<String, Object> getAssignableRooms(String tenantId, String reservationId) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("reservationId", reservationId != null ? reservationId : "res_1001");
        List<Map<String, Object>> options = new ArrayList<>();
        for (Map<String, Object> r : rooms.values()) {
            if ("AVAILABLE".equalsIgnoreCase((String) r.get("status")) && "CLEAN".equalsIgnoreCase((String) r.get("housekeepingStatus"))) {
                Map<String, Object> ro = new LinkedHashMap<>();
                ro.put("roomId", r.get("roomId"));
                ro.put("roomNumber", r.get("roomNumber"));
                ro.put("roomType", "DELUXE");
                ro.put("housekeepingStatus", "CLEAN");
                ro.put("maintenanceStatus", "AVAILABLE");
                ro.put("assignmentEligible", true);
                options.add(ro);
            }
        }
        data.put("roomOptions", options);
        return data;
    }

    public List<Map<String, Object>> getRooms(String tenantId, String status) {
        return rooms.values().stream()
                .filter(r -> status == null || status.equalsIgnoreCase((String) r.get("status")))
                .collect(Collectors.toList());
    }

    public Map<String, Object> getRoom(String tenantId, String id) {
        return rooms.get(id);
    }

    public Map<String, Object> evaluateCheckInEligibility(String tenantId, String resId) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("reservationId", resId);
        m.put("eligible", true);
        m.put("reservationConfirmed", true);
        m.put("guestVerificationRequired", true);
        m.put("roomAssignmentRequired", true);
        m.put("paymentCheckRequired", true);
        m.put("blockers", Collections.emptyList());
        return m;
    }

    public Map<String, Object> assignRoomToReservation(String tenantId, String resId, Map<String, Object> body) {
        Map<String, Object> res = reservations.get(resId);
        String roomId = (String) body.get("roomId");
        Map<String, Object> rm = rooms.get(roomId);
        if (res != null) {
            res.put("assignedRoomId", roomId);
            res.put("roomNumber", rm != null ? rm.get("roomNumber") : "205");
        }
        Map<String, Object> ret = new LinkedHashMap<>();
        ret.put("reservationId", resId);
        ret.put("roomId", roomId);
        ret.put("roomNumber", rm != null ? rm.get("roomNumber") : "205");
        ret.put("assignmentStatus", "ASSIGNED");
        return ret;
    }

    public Map<String, Object> processCheckIn(String tenantId, String resId, Map<String, Object> body) {
        Map<String, Object> res = reservations.get(resId);
        if (res != null) {
            res.put("status", "CHECKED_IN");
            res.put("stayStatus", "CHECKED_IN");
            res.put("checkInTime", LocalDateTime.now().toString());
        }
        Map<String, Object> ret = new LinkedHashMap<>();
        ret.put("reservationId", resId);
        ret.put("stayStatus", "CHECKED_IN");
        ret.put("roomId", res != null ? res.get("assignedRoomId") : "room_1001");
        ret.put("checkInTime", LocalDateTime.now().toString());
        return ret;
    }

    public Map<String, Object> createRoomMoveRequest(String tenantId, Map<String, Object> body) {
        String mid = "roommove_" + (1001 + roomMoveRequests.size());
        Map<String, Object> move = new LinkedHashMap<>(body);
        move.put("requestId", mid);
        move.put("status", "PENDING_APPROVAL");
        roomMoveRequests.put(mid, move);
        return move;
    }

    public List<Map<String, Object>> getRoomMoveRequests(String tenantId) {
        return new ArrayList<>(roomMoveRequests.values());
    }

    public Map<String, Object> approveRoomMoveRequest(String tenantId, String reqId, Map<String, Object> body) {
        Map<String, Object> m = roomMoveRequests.get(reqId);
        if (m != null) m.put("status", "APPROVED");
        return m != null ? m : Collections.singletonMap("requestId", reqId);
    }

    public Map<String, Object> completeRoomMoveRequest(String tenantId, String reqId, Map<String, Object> body) {
        Map<String, Object> m = roomMoveRequests.get(reqId);
        if (m != null) m.put("status", "COMPLETED");
        return m != null ? m : Collections.singletonMap("requestId", reqId);
    }

    public Map<String, Object> createEnquiry(String tenantId, Map<String, Object> body) {
        String eid = "enq_" + (1001 + enquiries.size());
        Map<String, Object> enq = new LinkedHashMap<>(body);
        enq.put("enquiryId", eid);
        enq.put("status", "OPEN");
        enq.put("createdAt", LocalDateTime.now().toString());
        enquiries.put(eid, enq);
        return enq;
    }

    public List<Map<String, Object>> getEnquiries(String tenantId, String status, String channel) {
        return enquiries.values().stream()
                .filter(e -> status == null || status.equalsIgnoreCase((String) e.get("status")))
                .filter(e -> channel == null || channel.equalsIgnoreCase((String) e.get("channel")))
                .collect(Collectors.toList());
    }

    public Map<String, Object> handoffReceptionEnquiry(String tenantId, String id, Map<String, Object> body) {
        Map<String, Object> enq = enquiries.get(id);
        if (enq != null) enq.put("status", "HANDED_OFF");
        return enq != null ? enq : Collections.singletonMap("enquiryId", id);
    }

    public Map<String, Object> evaluateCheckOutEligibility(String tenantId, String resId) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("reservationId", resId);
        m.put("eligible", true);
        m.put("pendingCharges", false);
        m.put("paymentReviewRequired", false);
        m.put("openCriticalRequests", false);
        m.put("blockers", Collections.emptyList());
        return m;
    }

    public Map<String, Object> getFolio(String tenantId, String resId) {
        return folios.getOrDefault(resId, folios.get("res_1001"));
    }

    public Map<String, Object> getInvoice(String tenantId, String resId) {
        Map<String, Object> inv = new LinkedHashMap<>();
        inv.put("invoiceId", "inv_hotel_" + resId);
        inv.put("reservationId", resId);
        inv.put("currency", "INR");
        inv.put("totalAmount", 10620.00);
        inv.put("status", "PAID");
        return inv;
    }

    public Map<String, Object> processCheckOut(String tenantId, String resId, Map<String, Object> body) {
        Map<String, Object> res = reservations.get(resId);
        if (res != null) {
            res.put("status", "CHECKED_OUT");
            res.put("stayStatus", "CHECKED_OUT");
        }
        Map<String, Object> ret = new LinkedHashMap<>();
        ret.put("reservationId", resId);
        ret.put("stayStatus", "CHECKED_OUT");
        ret.put("checkedOutAt", LocalDateTime.now().toString());
        ret.put("folioStatus", "SETTLED");
        ret.put("housekeepingNotificationStatus", "QUEUED");
        return ret;
    }

    public Map<String, Object> requestLateCheckout(String tenantId, String resId, Map<String, Object> body) {
        Map<String, Object> ret = new LinkedHashMap<>(body);
        ret.put("reservationId", resId);
        ret.put("status", "APPROVED");
        ret.put("newCheckOutTime", "13:00");
        return ret;
    }

    public Map<String, Object> getReservationPaymentStatus(String tenantId, String resId) {
        Map<String, Object> p = new LinkedHashMap<>();
        p.put("reservationId", resId);
        p.put("paymentStatus", "PAID");
        p.put("amountPaid", 10620.00);
        p.put("currency", "INR");
        return p;
    }

    public List<Map<String, Object>> getHousekeepingStatus(String tenantId, String status) {
        return rooms.values().stream()
                .filter(r -> status == null || status.equalsIgnoreCase((String) r.get("housekeepingStatus")))
                .map(r -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("roomId", r.get("roomId"));
                    m.put("roomNumber", r.get("roomNumber"));
                    m.put("status", r.get("housekeepingStatus"));
                    m.put("assignmentEligible", "CLEAN".equalsIgnoreCase((String) r.get("housekeepingStatus")));
                    return m;
                })
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getMaintenanceRequests(String tenantId) {
        return new ArrayList<>(maintenanceRequests.values());
    }

    public Map<String, Object> createMaintenanceRequest(String tenantId, Map<String, Object> body) {
        String mid = "maint_" + (1001 + maintenanceRequests.size());
        Map<String, Object> mr = new LinkedHashMap<>(body);
        mr.put("requestId", mid);
        mr.put("status", "OPEN");
        maintenanceRequests.put(mid, mr);
        return mr;
    }

    public Map<String, Object> handoffReservation(String tenantId, String resId, Map<String, Object> body) {
        Map<String, Object> ret = new LinkedHashMap<>(body);
        ret.put("reservationId", resId);
        ret.put("handoffStatus", "COMPLETED");
        return ret;
    }

    public Map<String, Object> getFrontDeskMetrics(String tenantId, String period) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("period", period);
        m.put("averageCheckInSeconds", 145);
        m.put("averageCheckOutSeconds", 80);
        m.put("roomTurnaroundRateMinutes", 35);
        m.put("accuracyScore", 99.4);
        return m;
    }

    // Getters for Raw Maps
    public Map<String, Map<String, Object>> getHotels() { return hotels; }
    public Map<String, Map<String, Object>> getRoomTypes() { return roomTypes; }
    public Map<String, Map<String, Object>> getRooms() { return rooms; }
    public Map<String, Map<String, Object>> getRatePlans() { return ratePlans; }
    public Map<String, Map<String, Object>> getRoomInventory() { return roomInventory; }
    public Map<String, Map<String, Object>> getGuests() { return guests; }
    public Map<String, Map<String, Object>> getGuestVerifications() { return guestVerifications; }
    public Map<String, Map<String, Object>> getReservations() { return reservations; }
    public Map<String, List<Map<String, Object>>> getReservationHistory() { return reservationHistory; }
    public Map<String, Map<String, Object>> getQuotes() { return quotes; }
    public Map<String, Map<String, Object>> getModificationRequests() { return modificationRequests; }
    public Map<String, Map<String, Object>> getCancellationRequests() { return cancellationRequests; }
    public Map<String, Map<String, Object>> getFolios() { return folios; }
    public Map<String, Map<String, Object>> getRoomMoveRequests() { return roomMoveRequests; }
    public Map<String, Map<String, Object>> getStaff() { return staff; }
    public Map<String, Map<String, Object>> getWorkAssignments() { return workAssignments; }
    public Map<String, Map<String, Object>> getEnquiries() { return enquiries; }
    public Map<String, List<Map<String, Object>>> getEnquiryActivities() { return enquiryActivities; }
    public Map<String, Map<String, Object>> getFollowUps() { return followUps; }
    public Map<String, Map<String, Object>> getConversations() { return conversations; }
    public Map<String, List<Map<String, Object>>> getConversationMessages() { return conversationMessages; }
    public Map<String, Map<String, Object>> getTickets() { return tickets; }
    public Map<String, List<Map<String, Object>>> getTicketMessages() { return ticketMessages; }
    public Map<String, List<Map<String, Object>>> getTicketNotes() { return ticketNotes; }
    public Map<String, Map<String, Object>> getTicketReplyDrafts() { return ticketReplyDrafts; }
    public Map<String, Map<String, Object>> getServiceRequests() { return serviceRequests; }
    public Map<String, Map<String, Object>> getMaintenanceRequests() { return maintenanceRequests; }
    public Map<String, Map<String, Object>> getGuestRequests() { return guestRequests; }
    public Map<String, Map<String, Object>> getReceptionEnquiries() { return receptionEnquiries; }
    public Map<String, Map<String, Object>> getKnowledgeArticles() { return knowledgeArticles; }
    public Map<String, Map<String, Object>> getEscalations() { return escalations; }
    public Map<String, Map<String, Object>> getFeedbackRecords() { return feedbackRecords; }
    public Map<String, Object> getAiConfig() { return aiConfig; }
    public Map<String, Map<String, Object>> getAutomationRules() { return automationRules; }
    public Map<String, Map<String, Object>> getAutomationRuns() { return automationRuns; }
    public List<Map<String, Object>> getAuditEvents() { return auditEvents; }
    public Map<String, Map<String, Object>> getAiHandoffs() { return aiHandoffs; }
    public Map<String, Map<String, Object>> getPaymentSessions() { return paymentSessions; }
    public Map<String, Map<String, Object>> getGuestVerificationSessions() { return guestVerificationSessions; }
    public Map<String, Map<String, Object>> getCampaigns() { return campaigns; }
    public Map<String, Map<String, Object>> getSequences() { return sequences; }
    public Map<String, Map<String, Object>> getFollowUpRules() { return followUpRules; }
    public Map<String, Map<String, Object>> getFollowUpMessages() { return followUpMessages; }
    public Map<String, Map<String, Object>> getFollowUpExecutions() { return followUpExecutions; }

    // =========================================================================
    // 1. AI RESERVATION AGENT OPERATIONAL METHODS
    // =========================================================================

    public Map<String, Object> getAiReservationDashboard(String tenantId) {
        Map<String, Object> d = new LinkedHashMap<>();
        d.put("status", "ACTIVE");
        d.put("conversationsToday", 28);
        d.put("quotesGenerated", quotes.size() > 0 ? quotes.size() + 14 : 15);
        d.put("bookingsInitiated", 11);
        d.put("confirmedBookings", 9);
        d.put("conversionRate", 64.2);
        d.put("humanHandoffs", aiHandoffs.size());
        d.put("failedActions", 0);
        d.put("connectedChannels", Arrays.asList("WEBSITE_CHAT", "WHATSAPP", "EMAIL"));
        return d;
    }

    public List<Map<String, Object>> getAiReservationChannels(String tenantId) {
        List<Map<String, Object>> chs = new ArrayList<>();
        Map<String, Object> c1 = new LinkedHashMap<>();
        c1.put("channel", "WEBSITE_CHAT");
        c1.put("status", "CONNECTED");
        c1.put("authorized", true);
        chs.add(c1);

        Map<String, Object> c2 = new LinkedHashMap<>();
        c2.put("channel", "WHATSAPP");
        c2.put("status", "CONNECTED");
        c2.put("authorized", true);
        chs.add(c2);

        Map<String, Object> c3 = new LinkedHashMap<>();
        c3.put("channel", "EMAIL");
        c3.put("status", "CONNECTED");
        c3.put("authorized", true);
        chs.add(c3);
        return chs;
    }

    public Map<String, Object> startAiReservationConversation(String tenantId, Map<String, Object> body) {
        String id = "conv-" + (1001 + conversations.size());
        Map<String, Object> c = new LinkedHashMap<>(body);
        c.put("conversationId", id);
        c.put("status", "OPEN");
        c.put("intent", "ROOM_BOOKING");
        c.put("assignedAgent", "AI_RESERVATION_AGENT");
        c.put("createdAt", LocalDateTime.now().toString());
        conversations.put(id, c);

        String initialMessage = (String) body.get("initialMessage");
        if (initialMessage != null && !initialMessage.isBlank()) {
            addConversationMessage(tenantId, id, Collections.singletonMap("content", initialMessage));
        }
        return c;
    }

    public Map<String, Object> processAiReservationMessage(String tenantId, String convId, Map<String, Object> body) {
        String message = (String) body.get("message");
        String channel = (String) body.getOrDefault("channel", "WEBSITE_CHAT");

        addConversationMessage(tenantId, convId, Collections.singletonMap("content", message));

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("conversationId", convId);
        resp.put("intent", "AMENITY_OR_RATE_QUESTION");
        resp.put("reply", "Breakfast inclusion depends on the selected rate plan. All our Deluxe and Suite options have flexible breakfast add-ons.");
        resp.put("requiresHumanReview", false);

        Map<String, Object> source = new LinkedHashMap<>();
        source.put("type", "RATE_PLAN");
        source.put("referenceId", "FLEXIBLE");
        resp.put("sources", Collections.singletonList(source));
        return resp;
    }

    public Map<String, Object> handoffAiReservationConversation(String tenantId, String convId, Map<String, Object> body) {
        String hid = "handoff-" + (1001 + aiHandoffs.size());
        Map<String, Object> h = new LinkedHashMap<>(body);
        h.put("handoffId", hid);
        h.put("conversationId", convId);
        h.put("status", "HUMAN_HANDOFF");
        h.put("assignedRole", body.getOrDefault("targetRole", "RESERVATION_EXECUTIVE"));
        h.put("createdAt", LocalDateTime.now().toString());
        aiHandoffs.put(hid, h);

        Map<String, Object> conv = conversations.get(convId);
        if (conv != null) conv.put("status", "HUMAN_HANDOFF");
        return h;
    }

    public Map<String, Object> searchAiAvailability(String tenantId, Map<String, Object> body) {
        String in = (String) body.getOrDefault("checkInDate", "2026-11-15");
        String out = (String) body.getOrDefault("checkOutDate", "2026-11-17");
        String curr = (String) body.getOrDefault("currency", "INR");

        List<Map<String, Object>> options = new ArrayList<>();
        for (Map<String, Object> rt : roomTypes.values()) {
            Map<String, Object> opt = new LinkedHashMap<>();
            opt.put("roomTypeId", rt.get("roomTypeId"));
            opt.put("roomTypeName", rt.get("name"));
            opt.put("availableRooms", 3);
            opt.put("maxOccupancy", rt.get("maxOccupancy"));
            opt.put("startingPricePerNight", rt.get("basePrice"));
            options.add(opt);
        }

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("checkInDate", in);
        data.put("checkOutDate", out);
        data.put("nights", 2);
        data.put("currency", curr);
        data.put("availableRoomTypes", options);
        return data;
    }

    public Map<String, Object> calculateAiQuote(String tenantId, Map<String, Object> body) {
        String qid = "QUOTE-" + (1001 + quotes.size());
        String rtId = (String) body.getOrDefault("roomTypeId", "roomtype_1001");
        double base = 3500.00;
        Map<String, Object> rt = roomTypes.get(rtId);
        if (rt != null && rt.get("basePrice") instanceof Number) {
            base = ((Number) rt.get("basePrice")).doubleValue();
        }

        double subtotal = base * 2;
        double tax = subtotal * 0.12;
        double total = subtotal + tax;

        Map<String, Object> q = new LinkedHashMap<>();
        q.put("quoteId", qid);
        q.put("status", "ACTIVE");
        q.put("roomTypeId", rtId);
        q.put("nights", 2);
        q.put("currency", body.getOrDefault("currency", "INR"));
        q.put("roomSubtotal", subtotal);
        q.put("taxes", tax);
        q.put("fees", 0.00);
        q.put("totalAmount", total);
        q.put("cancellationPolicy", "Flexible 48-hour prior to arrival free cancellation");
        q.put("expiresAt", LocalDateTime.now().plusHours(4).toString());
        quotes.put(qid, q);
        return q;
    }

    public Map<String, Object> recalculateAiQuote(String tenantId, String quoteId) {
        Map<String, Object> q = quotes.get(quoteId);
        if (q != null) {
            q.put("expiresAt", LocalDateTime.now().plusHours(4).toString());
            q.put("status", "ACTIVE");
        }
        return q != null ? q : calculateAiQuote(tenantId, Collections.emptyMap());
    }

    public Map<String, Object> matchGuest(String tenantId, Map<String, Object> body) {
        String email = (String) body.get("email");
        String phone = (String) body.get("phone");

        Map<String, Object> match = null;
        for (Map<String, Object> g : guests.values()) {
            if ((email != null && email.equalsIgnoreCase((String) g.get("email"))) ||
                (phone != null && phone.equals(g.get("phone")))) {
                match = g;
                break;
            }
        }

        Map<String, Object> res = new LinkedHashMap<>();
        if (match != null) {
            res.put("matchFound", true);
            res.put("guestId", match.get("guestId"));
            res.put("verificationRequired", true);
        } else {
            res.put("matchFound", false);
            res.put("guestId", null);
            res.put("verificationRequired", false);
        }
        return res;
    }

    public Map<String, Object> createPendingReservation(String tenantId, Map<String, Object> body, String idempotencyKey) {
        String resId = "RES-" + (1001 + reservations.size());
        String bRef = "HTL-" + (1001 + reservations.size());

        Map<String, Object> r = new LinkedHashMap<>(body);
        r.put("reservationId", resId);
        r.put("bookingReference", bRef);
        r.put("confirmationNumber", bRef);
        r.put("status", "PENDING_CONFIRMATION");
        r.put("currency", body.getOrDefault("currency", "INR"));
        r.put("totalAmount", body.getOrDefault("totalAmount", 7840.00));
        r.put("idempotencyKey", idempotencyKey);
        r.put("createdAt", LocalDateTime.now().toString());

        Map<String, Object> primary = (Map<String, Object>) body.get("primaryGuest");
        if (primary != null) {
            r.put("guestName", primary.get("firstName") + " " + primary.get("lastName"));
        } else if (!r.containsKey("guestName")) {
            r.put("guestName", "Arun Kumar");
        }

        reservations.put(resId, r);
        return r;
    }

    public Map<String, Object> confirmReservationWithIdempotency(String tenantId, String resId, Map<String, Object> body, String idempotencyKey) {
        Map<String, Object> res = reservations.get(resId);
        if (res != null) {
            res.put("status", "CONFIRMED");
            res.put("confirmedAt", LocalDateTime.now().toString());
            res.put("confirmationDeliveryStatus", "QUEUED");
        }

        Map<String, Object> ret = new LinkedHashMap<>();
        ret.put("reservationId", resId);
        ret.put("bookingReference", res != null ? res.get("bookingReference") : "HTL-1001");
        ret.put("status", "CONFIRMED");
        ret.put("confirmationDeliveryStatus", "QUEUED");
        return ret;
    }

    public Map<String, Object> createCheckoutSession(String tenantId, Map<String, Object> body) {
        String sessId = "cs_live_" + UUID.randomUUID().toString().substring(0, 12);
        Map<String, Object> sess = new LinkedHashMap<>(body);
        sess.put("checkoutSessionId", sessId);
        sess.put("status", "OPEN");
        sess.put("paymentUrl", "https://checkout.stripe.com/pay/" + sessId);
        sess.put("expiresAt", LocalDateTime.now().plusMinutes(30).toString());
        paymentSessions.put(sessId, sess);
        return sess;
    }

    public Map<String, Object> getPaymentSessionStatus(String tenantId, String ref) {
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("paymentReference", ref);
        res.put("status", "SUCCEEDED");
        res.put("verified", true);
        res.put("amount", 7840.00);
        res.put("currency", "INR");
        return res;
    }

    // =========================================================================
    // 2. AI SUPPORT AGENT OPERATIONAL METHODS
    // =========================================================================

    public Map<String, Object> getAiSupportDashboard(String tenantId) {
        Map<String, Object> d = new LinkedHashMap<>();
        d.put("openConversations", conversations.size());
        d.put("openTickets", tickets.size());
        d.put("pendingServiceRequests", serviceRequests.size());
        d.put("averageFirstResponseSeconds", 45);
        d.put("csatScore", 4.9);
        d.put("autonomousResolutionsToday", 34);
        d.put("escalations", escalations.size());
        return d;
    }

    public List<Map<String, Object>> getAiSupportChannels(String tenantId) {
        List<Map<String, Object>> list = new ArrayList<>();
        list.add(Collections.singletonMap("channel", "WEBSITE_CHAT"));
        list.add(Collections.singletonMap("channel", "EMAIL"));
        list.add(Collections.singletonMap("channel", "PHONE_IVR"));
        return list;
    }

    public Map<String, Object> startAiSupportConversation(String tenantId, Map<String, Object> body) {
        String id = "SUP-CONV-" + (1001 + conversations.size());
        Map<String, Object> c = new LinkedHashMap<>(body);
        c.put("conversationId", id);
        c.put("status", "OPEN");
        c.put("intent", "MAINTENANCE");
        c.put("category", "MAINTENANCE");
        c.put("assignedAgent", "AI_SUPPORT_AGENT");
        c.put("createdAt", LocalDateTime.now().toString());
        conversations.put(id, c);
        return c;
    }

    public Map<String, Object> processAiSupportMessage(String tenantId, String convId, Map<String, Object> body) {
        String msg = (String) body.get("message");
        addConversationMessage(tenantId, convId, Collections.singletonMap("content", msg));

        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("conversationId", convId);
        resp.put("intent", "MAINTENANCE");
        resp.put("reply", "I'm sorry you're experiencing this issue. I can create a maintenance request for our duty engineering team.");
        resp.put("requiresHumanReview", false);
        resp.put("suggestedAction", "CREATE_SERVICE_REQUEST");
        return resp;
    }

    public Map<String, Object> startGuestVerificationSession(String tenantId, Map<String, Object> body) {
        String sid = "VERIF-SESS-" + (1001 + guestVerificationSessions.size());
        Map<String, Object> sess = new LinkedHashMap<>(body);
        sess.put("sessionId", sid);
        sess.put("status", "CHALLENGE_ISSUED");
        sess.put("expiresAt", LocalDateTime.now().plusMinutes(10).toString());
        guestVerificationSessions.put(sid, sess);
        return sess;
    }

    public Map<String, Object> verifyGuestSession(String tenantId, String sessionId, Map<String, Object> body) {
        Map<String, Object> sess = guestVerificationSessions.get(sessionId);
        if (sess != null) sess.put("status", "VERIFIED");
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("sessionId", sessionId);
        res.put("verified", true);
        res.put("guestId", sess != null ? sess.getOrDefault("guestId", "guest_1001") : "guest_1001");
        return res;
    }

    public Map<String, Object> lookupGuestContext(String tenantId, Map<String, Object> body) {
        String gid = (String) body.getOrDefault("guestId", "guest_1001");
        Map<String, Object> g = guests.get(gid);
        Map<String, Object> ret = new LinkedHashMap<>();
        ret.put("guest", g != null ? g : guests.get("guest_1001"));
        ret.put("currentStay", reservations.get("res_1002"));
        ret.put("verificationStatus", "VERIFIED");
        return ret;
    }

    // =========================================================================
    // 3. AI FOLLOW-UP AGENT OPERATIONAL METHODS
    // =========================================================================

    public Map<String, Object> getAiFollowUpDashboard(String tenantId) {
        Map<String, Object> d = new LinkedHashMap<>();
        d.put("pendingTasks", 48);
        d.put("overdueTasks", 5);
        d.put("messagesQueued", 12);
        d.put("messagesDelivered", 84);
        d.put("messagesFailed", 2);
        d.put("quotesAwaitingFollowUp", quotes.size());
        d.put("reservationsAttributed", 9);
        d.put("activeCampaigns", campaigns.size());
        return d;
    }

    public List<Map<String, Object>> getCampaigns(String tenantId) {
        return new ArrayList<>(campaigns.values());
    }

    public Map<String, Object> createCampaign(String tenantId, Map<String, Object> body) {
        String cid = "CAMP-" + (1001 + campaigns.size());
        Map<String, Object> c = new LinkedHashMap<>(body);
        c.put("campaignId", cid);
        c.put("status", "DRAFT");
        c.put("approvalRequired", true);
        campaigns.put(cid, c);
        return c;
    }

    public Map<String, Object> getCampaign(String tenantId, String cid) {
        return campaigns.get(cid);
    }

    public Map<String, Object> updateCampaign(String tenantId, String cid, Map<String, Object> updates) {
        Map<String, Object> c = campaigns.get(cid);
        if (c != null) c.putAll(updates);
        return c;
    }

    public Map<String, Object> activateCampaign(String tenantId, String cid, Map<String, Object> body) {
        Map<String, Object> c = campaigns.get(cid);
        if (c != null) {
            c.put("status", "ACTIVE");
            c.put("eligibleAudienceCount", 25);
            c.put("nextExecutionAt", LocalDateTime.now().plusHours(12).toString());
        }
        return c != null ? c : Collections.singletonMap("campaignId", cid);
    }

    public Map<String, Object> pauseCampaign(String tenantId, String cid) {
        Map<String, Object> c = campaigns.get(cid);
        if (c != null) c.put("status", "PAUSED");
        return c != null ? c : Collections.singletonMap("status", "PAUSED");
    }

    public Map<String, Object> cancelCampaign(String tenantId, String cid) {
        Map<String, Object> c = campaigns.get(cid);
        if (c != null) c.put("status", "CANCELLED");
        return c != null ? c : Collections.singletonMap("status", "CANCELLED");
    }

    public Map<String, Object> getCampaignMetrics(String tenantId, String cid) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("campaignId", cid);
        m.put("messagesSent", 42);
        m.put("deliveryRate", 98.2);
        m.put("replyRate", 24.5);
        m.put("conversionRate", 16.7);
        m.put("revenueAttributed", 148500.00);
        return m;
    }

    public List<Map<String, Object>> getSequences(String tenantId) {
        return new ArrayList<>(sequences.values());
    }

    public Map<String, Object> createSequence(String tenantId, Map<String, Object> body) {
        String sid = "SEQ-" + (1001 + sequences.size());
        Map<String, Object> s = new LinkedHashMap<>(body);
        s.put("sequenceId", sid);
        s.put("status", "DRAFT");
        sequences.put(sid, s);
        return s;
    }

    public Map<String, Object> getSequence(String tenantId, String sid) {
        return sequences.get(sid);
    }

    public Map<String, Object> updateSequence(String tenantId, String sid, Map<String, Object> updates) {
        Map<String, Object> s = sequences.get(sid);
        if (s != null) s.putAll(updates);
        return s;
    }

    public Map<String, Object> activateSequence(String tenantId, String sid) {
        Map<String, Object> s = sequences.get(sid);
        if (s != null) s.put("status", "ACTIVE");
        return s != null ? s : Collections.singletonMap("status", "ACTIVE");
    }

    public Map<String, Object> pauseSequence(String tenantId, String sid) {
        Map<String, Object> s = sequences.get(sid);
        if (s != null) s.put("status", "PAUSED");
        return s != null ? s : Collections.singletonMap("status", "PAUSED");
    }

    public Map<String, Object> createAutomationRule(String tenantId, Map<String, Object> body) {
        String rid = "RULE-" + (1001 + automationRules.size());
        Map<String, Object> r = new LinkedHashMap<>(body);
        r.put("ruleId", rid);
        r.put("status", body.getOrDefault("status", "ACTIVE"));
        r.put("createdAt", LocalDateTime.now().toString());
        automationRules.put(rid, r);
        return r;
    }

    public Map<String, Object> updateAutomationRule(String tenantId, String id, Map<String, Object> updates) {
        Map<String, Object> r = automationRules.get(id);
        if (r != null) r.putAll(updates);
        return r != null ? r : updates;
    }

    public Map<String, Object> activateAutomationRule(String tenantId, String id) {
        Map<String, Object> r = automationRules.get(id);
        if (r != null) r.put("status", "ACTIVE");
        return r != null ? r : Collections.singletonMap("status", "ACTIVE");
    }

    public Map<String, Object> pauseAutomationRule(String tenantId, String id) {
        Map<String, Object> r = automationRules.get(id);
        if (r != null) r.put("status", "PAUSED");
        return r != null ? r : Collections.singletonMap("status", "PAUSED");
    }

    public List<Map<String, Object>> getFollowUpTasks(String tenantId, String status, String type) {
        return followUps.values().stream()
                .filter(t -> status == null || status.equalsIgnoreCase((String) t.get("status")))
                .collect(Collectors.toList());
    }

    public Map<String, Object> createFollowUpTask(String tenantId, Map<String, Object> body) {
        String tid = "FUP-" + (1001 + followUps.size());
        Map<String, Object> t = new LinkedHashMap<>(body);
        t.put("taskId", tid);
        t.put("status", "PENDING");
        t.put("scheduledAt", body.getOrDefault("scheduledAt", LocalDateTime.now().plusDays(1).toString()));
        followUps.put(tid, t);
        return t;
    }

    public Map<String, Object> getFollowUpTask(String tenantId, String tid) {
        return followUps.get(tid);
    }

    public Map<String, Object> updateFollowUpTask(String tenantId, String tid, Map<String, Object> updates) {
        Map<String, Object> t = followUps.get(tid);
        if (t != null) t.putAll(updates);
        return t;
    }

    public Map<String, Object> assignFollowUpTask(String tenantId, String tid, Map<String, Object> body) {
        Map<String, Object> t = followUps.get(tid);
        if (t != null) {
            t.put("assignedEmployeeId", body.get("employeeId"));
            t.put("status", "ASSIGNED");
        }
        return t != null ? t : body;
    }

    public Map<String, Object> completeFollowUpTask(String tenantId, String tid, Map<String, Object> body) {
        Map<String, Object> t = followUps.get(tid);
        if (t != null) {
            t.put("status", "COMPLETED");
            t.put("outcome", body != null && body.containsKey("outcome") ? body.get("outcome") : "GUEST_CONTACTED");
            if (body != null && body.containsKey("notes")) t.put("notes", body.get("notes"));
        } else {
            t = new LinkedHashMap<>(body != null ? body : Collections.emptyMap());
            t.put("taskId", tid);
            t.put("status", "COMPLETED");
            t.put("outcome", body != null && body.containsKey("outcome") ? body.get("outcome") : "GUEST_CONTACTED");
            followUps.put(tid, t);
        }
        return t;
    }

    public Map<String, Object> snoozeFollowUpTask(String tenantId, String tid, Map<String, Object> body) {
        Map<String, Object> t = followUps.get(tid);
        if (t != null) {
            t.put("status", "PENDING");
            t.put("scheduledAt", body.get("newScheduledAt"));
        }
        return t != null ? t : body;
    }

    public Map<String, Object> cancelFollowUpTask(String tenantId, String tid) {
        Map<String, Object> t = followUps.get(tid);
        if (t != null) t.put("status", "CANCELLED");
        return t != null ? t : Collections.singletonMap("status", "CANCELLED");
    }

    public List<Map<String, Object>> getEligibleLeads(String tenantId) {
        return new ArrayList<>(enquiries.values());
    }

    public List<Map<String, Object>> getEligibleQuotes(String tenantId) {
        return new ArrayList<>(quotes.values());
    }

    public List<Map<String, Object>> getEligibleReservations(String tenantId) {
        return new ArrayList<>(reservations.values());
    }

    public Map<String, Object> getGuestConsent(String tenantId, String guestId) {
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("guestId", guestId);
        res.put("emailTransactionalConsent", true);
        res.put("emailMarketingConsent", false);
        res.put("whatsappMarketingConsent", false);
        return res;
    }

    public Map<String, Object> updateGuestPreferences(String tenantId, String guestId, Map<String, Object> body) {
        Map<String, Object> res = new LinkedHashMap<>(body);
        res.put("guestId", guestId);
        res.put("preferencesUpdated", true);
        return res;
    }

    public Map<String, Object> createMessageDraft(String tenantId, Map<String, Object> body) {
        String did = "FUP-DRAFT-" + (1001 + followUpMessages.size());
        Map<String, Object> d = new LinkedHashMap<>(body);
        d.put("draftId", did);
        d.put("status", "PENDING_APPROVAL");
        d.put("subject", "Following up on your hotel quote");
        d.put("body", "Hello Arun, I'm following up on the room quote you requested. If you would like to proceed or have questions about the available options, please let us know.");
        d.put("requiresApproval", true);
        followUpMessages.put(did, d);
        return d;
    }

    public Map<String, Object> getMessageDraft(String tenantId, String draftId) {
        return followUpMessages.get(draftId);
    }

    public Map<String, Object> approveMessageDraft(String tenantId, String draftId, Map<String, Object> body) {
        Map<String, Object> d = followUpMessages.get(draftId);
        if (d != null) {
            d.put("status", "APPROVED");
            d.put("approvedAt", LocalDateTime.now().toString());
        }
        return d != null ? d : Collections.singletonMap("status", "APPROVED");
    }

    public Map<String, Object> sendMessageDraft(String tenantId, String draftId, Map<String, Object> body, String idempotencyKey) {
        String mid = "FUP-MSG-" + (1001 + followUpMessages.size());
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("messageId", mid);
        m.put("draftId", draftId);
        m.put("status", "QUEUED");
        m.put("deliveryStatus", "QUEUED");
        m.put("idempotencyKey", idempotencyKey);
        followUpMessages.put(mid, m);
        return m;
    }

    public List<Map<String, Object>> getOutboundMessages(String tenantId) {
        return new ArrayList<>(followUpMessages.values());
    }

    public Map<String, Object> getOutboundMessage(String tenantId, String mid) {
        return followUpMessages.get(mid);
    }

    public Map<String, Object> retryOutboundMessage(String tenantId, String mid) {
        Map<String, Object> m = followUpMessages.get(mid);
        if (m != null) {
            m.put("status", "QUEUED");
            m.put("deliveryStatus", "QUEUED");
        }
        return m != null ? m : Collections.singletonMap("messageId", mid);
    }

    public List<Map<String, Object>> getExecutions(String tenantId, String status) {
        return new ArrayList<>(followUpExecutions.values());
    }

    public Map<String, Object> getExecution(String tenantId, String id) {
        return followUpExecutions.get(id);
    }

    public Map<String, Object> retryExecution(String tenantId, String id) {
        Map<String, Object> ex = followUpExecutions.get(id);
        if (ex != null) {
            ex.put("status", "RETRYING");
            ex.put("attemptCount", 2);
        }
        return ex != null ? ex : Collections.singletonMap("executionId", id);
    }

    public Map<String, Object> receiveMessagingWebhook(String tenantId, Map<String, Object> body) {
        Map<String, Object> ret = new LinkedHashMap<>();
        ret.put("received", true);
        ret.put("timestamp", LocalDateTime.now().toString());
        return ret;
    }

    public Map<String, Object> getAiFollowUpMetrics(String tenantId) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("totalCampaignsActive", campaigns.size());
        m.put("tasksCompletedToday", 19);
        m.put("conversionAttribution", 18.4);
        m.put("messagesQueued", 12);
        m.put("messagesDelivered", 84);
        return m;
    }
}
