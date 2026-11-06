package com.zenelait.crm.travel;

import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * Zenelait AI CRM — Travel Company Tenant Shared Data Store
 * Coordinates shared records across the 4 Travel Tenant roles:
 * 1. Sales Manager (/api/v1/travel/sales-manager)
 * 2. Travel Consultant (/api/v1/travel/consultant)
 * 3. Customer Support (/api/v1/travel/customer-support)
 * 4. Booking Executive (/api/v1/travel/booking-executive)
 *
 * Implements strict tenant isolation (default tenant-7 "Wanderlust Expeditions")
 * and thread-safe operations across leads, requirements, itineraries, quotations,
 * bookings, supplier bookings, payments, vouchers, change requests, and support tickets.
 */
@Component
public class TravelDataStore {

    // 1. Destinations, Packages & Suppliers
    private final Map<String, Map<String, Object>> destinations = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> packages = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> suppliers = new ConcurrentHashMap<>();

    // 2. Customers & Leads
    private final Map<String, Map<String, Object>> customers = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> leads = new ConcurrentHashMap<>();
    private final Map<String, List<Map<String, Object>>> leadActivities = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> travelRequirements = new ConcurrentHashMap<>();

    // 3. Teams, Consultants & Targets
    private final Map<String, Map<String, Object>> teams = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> consultants = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> salesTargets = new ConcurrentHashMap<>();

    // 4. Itineraries & Quotations
    private final Map<String, Map<String, Object>> itineraries = new ConcurrentHashMap<>();
    private final Map<String, List<Map<String, Object>>> itineraryItems = new ConcurrentHashMap<>();
    private final Map<String, List<Map<String, Object>>> itineraryVersions = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> quotations = new ConcurrentHashMap<>();
    private final Map<String, List<Map<String, Object>>> quotationHistory = new ConcurrentHashMap<>();

    // 5. Booking Handoffs, Bookings & Items
    private final Map<String, Map<String, Object>> bookingHandoffs = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> bookings = new ConcurrentHashMap<>();
    private final Map<String, List<Map<String, Object>>> bookingItems = new ConcurrentHashMap<>();
    private final Map<String, List<Map<String, Object>>> bookingHistory = new ConcurrentHashMap<>();

    // 6. Supplier Searches & Supplier Bookings
    private final Map<String, Map<String, Object>> supplierSearches = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> supplierBookings = new ConcurrentHashMap<>();

    // 7. Payments, Invoices, Vouchers & Documents
    private final Map<String, Map<String, Object>> payments = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> invoices = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> vouchers = new ConcurrentHashMap<>();
    private final Map<String, List<Map<String, Object>>> travelDocuments = new ConcurrentHashMap<>();

    // 8. Support: Conversations, Verification, Tickets, Changes, Cancellations, Refunds, Feedback
    private final Map<String, Map<String, Object>> conversations = new ConcurrentHashMap<>();
    private final Map<String, List<Map<String, Object>>> conversationMessages = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> guestVerificationSessions = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> supportTickets = new ConcurrentHashMap<>();
    private final Map<String, List<Map<String, Object>>> ticketNotes = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> replyDrafts = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> changeRequests = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> cancellationRequests = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> refunds = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> serviceRequests = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> knowledgeArticles = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> feedbackRecords = new ConcurrentHashMap<>();

    // 9. Follow-up Tasks, Exceptions, Escalations, Audit
    private final Map<String, Map<String, Object>> followUpTasks = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> bookingExceptions = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> escalations = new ConcurrentHashMap<>();
    private final List<Map<String, Object>> auditLogs = Collections.synchronizedList(new ArrayList<>());

    // 10. AI Agents Specific Maps (Sales, Follow-up, Booking)
    private final Map<String, Map<String, Object>> recommendations = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> followUpPlans = new ConcurrentHashMap<>();
    private final Map<String, List<Map<String, Object>>> followUpMessageDrafts = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> followUpMessages = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> customerPreferences = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> customerSuppression = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> inboundCustomerResponses = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> supplierReservations = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> quotationApprovals = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> agentSettings = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> businessEvents = new ConcurrentHashMap<>();

    public TravelDataStore() {
        seedInitialData();
    }

    private void seedInitialData() {
        String tenantId = "tenant-7";

        // 1. Destinations
        Map<String, Object> d1 = new LinkedHashMap<>();
        d1.put("destinationId", "DEST-1001");
        d1.put("tenantId", tenantId);
        d1.put("name", "Bali");
        d1.put("country", "Indonesia");
        d1.put("region", "Southeast Asia");
        d1.put("currency", "IDR");
        d1.put("bestSeason", "April to October");
        d1.put("status", "ACTIVE");
        destinations.put("DEST-1001", d1);

        Map<String, Object> d2 = new LinkedHashMap<>();
        d2.put("destinationId", "DEST-1002");
        d2.put("tenantId", tenantId);
        d2.put("name", "Dubai");
        d2.put("country", "United Arab Emirates");
        d2.put("region", "Middle East");
        d2.put("currency", "AED");
        d2.put("bestSeason", "November to March");
        d2.put("status", "ACTIVE");
        destinations.put("DEST-1002", d2);

        Map<String, Object> d3 = new LinkedHashMap<>();
        d3.put("destinationId", "DEST-1003");
        d3.put("tenantId", tenantId);
        d3.put("name", "Switzerland");
        d3.put("country", "Switzerland");
        d3.put("region", "Europe");
        d3.put("currency", "CHF");
        d3.put("bestSeason", "May to September & Dec to March");
        d3.put("status", "ACTIVE");
        destinations.put("DEST-1003", d3);

        // 2. Packages
        Map<String, Object> p1 = new LinkedHashMap<>();
        p1.put("packageId", "PKG-1001");
        p1.put("tenantId", tenantId);
        p1.put("name", "Bali Five-Night Tropical Holiday Package");
        p1.put("destination", "Bali");
        p1.put("destinationId", "DEST-1001");
        p1.put("durationNights", 5);
        p1.put("durationDays", 6);
        p1.put("priceFrom", 95000.00);
        p1.put("currency", "INR");
        p1.put("inclusions", Arrays.asList("4-Star Resort Stay", "Daily Breakfast", "Airport Transfers", "Nusa Penida Day Tour", "Kintamani Volcano & Ubud"));
        p1.put("productType", "HOLIDAY_PACKAGE");
        p1.put("availabilityStatus", "REQUIRES_SUPPLIER_CONFIRMATION");
        p1.put("status", "ACTIVE");
        packages.put("PKG-1001", p1);

        Map<String, Object> p2 = new LinkedHashMap<>();
        p2.put("packageId", "PKG-1002");
        p2.put("tenantId", tenantId);
        p2.put("name", "Dubai Luxury 5D/4N Extravaganza");
        p2.put("destination", "Dubai");
        p2.put("destinationId", "DEST-1002");
        p2.put("durationNights", 4);
        p2.put("durationDays", 5);
        p2.put("priceFrom", 85000.00);
        p2.put("currency", "INR");
        p2.put("inclusions", Arrays.asList("5-Star Downtown Hotel", "Burj Khalifa 124th Floor", "Desert Safari with BBQ", "Marina Dhow Cruise"));
        p2.put("productType", "HOLIDAY_PACKAGE");
        p2.put("availabilityStatus", "CONFIRMED");
        p2.put("status", "ACTIVE");
        packages.put("PKG-1002", p2);

        // 3. Suppliers
        Map<String, Object> sup1 = new LinkedHashMap<>();
        sup1.put("supplierId", "SUP-101");
        sup1.put("tenantId", tenantId);
        sup1.put("name", "Bali Paradise DMC & Tours");
        sup1.put("category", "DMC_AND_HOTELS");
        sup1.put("contactEmail", "reservations@baliparadisedmc.com");
        sup1.put("contactPhone", "+62 361 889900");
        sup1.put("rating", 4.9);
        sup1.put("status", "ACTIVE");
        suppliers.put("SUP-101", sup1);

        Map<String, Object> sup2 = new LinkedHashMap<>();
        sup2.put("supplierId", "SUP-102");
        sup2.put("tenantId", tenantId);
        sup2.put("name", "Emirates Gateway Holidays");
        sup2.put("category", "FLIGHTS_AND_ACTIVITIES");
        sup2.put("contactEmail", "partners@emiratesgateway.ae");
        sup2.put("rating", 4.8);
        sup2.put("status", "ACTIVE");
        suppliers.put("SUP-102", sup2);

        // 4. Teams & Consultants
        Map<String, Object> tm1 = new LinkedHashMap<>();
        tm1.put("teamId", "TEAM-101");
        tm1.put("tenantId", tenantId);
        tm1.put("name", "International Holiday Packages Desk");
        tm1.put("teamLeadId", "EMP-201");
        tm1.put("activeMembersCount", 4);
        teams.put("TEAM-101", tm1);

        Map<String, Object> c1 = new LinkedHashMap<>();
        c1.put("employeeId", "EMP-201");
        c1.put("tenantId", tenantId);
        c1.put("name", "Rajesh Verma");
        c1.put("email", "rajesh.verma@wanderlusttours.com");
        c1.put("role", "TRAVEL_CONSULTANT");
        c1.put("teamId", "TEAM-101");
        c1.put("activeLeads", 14);
        c1.put("conversionRate", 21.43);
        c1.put("status", "ACTIVE");
        consultants.put("EMP-201", c1);

        Map<String, Object> c2 = new LinkedHashMap<>();
        c2.put("employeeId", "EMP-202");
        c2.put("tenantId", tenantId);
        c2.put("name", "Meera Nambiar");
        c2.put("email", "meera.nambiar@wanderlusttours.com");
        c2.put("role", "TRAVEL_CONSULTANT");
        c2.put("teamId", "TEAM-101");
        c2.put("activeLeads", 11);
        c2.put("conversionRate", 19.8);
        c2.put("status", "ACTIVE");
        consultants.put("EMP-202", c2);

        // 5. Sales Targets
        Map<String, Object> trg1 = new LinkedHashMap<>();
        trg1.put("targetId", "TARGET-1001");
        trg1.put("tenantId", tenantId);
        trg1.put("name", "November Travel Sales Target");
        trg1.put("targetType", "REVENUE");
        trg1.put("employeeId", "EMP-201");
        trg1.put("periodStart", "2026-11-01");
        trg1.put("periodEnd", "2026-11-30");
        trg1.put("targetValue", 500000.00);
        trg1.put("achievedValue", 142000.00);
        trg1.put("currency", "INR");
        trg1.put("status", "ACTIVE");
        salesTargets.put("TARGET-1001", trg1);

        // 6. Customers & Leads
        Map<String, Object> cust1 = new LinkedHashMap<>();
        cust1.put("customerId", "CUST-1001");
        cust1.put("tenantId", tenantId);
        cust1.put("firstName", "Arun");
        cust1.put("lastName", "Kumar");
        cust1.put("email", "arun@example.com");
        cust1.put("phone", "+919876543210");
        cust1.put("city", "Chennai");
        cust1.put("status", "ACTIVE");
        customers.put("CUST-1001", cust1);

        Map<String, Object> cust2 = new LinkedHashMap<>();
        cust2.put("customerId", "CUST-1002");
        cust2.put("tenantId", tenantId);
        cust2.put("firstName", "Priya");
        cust2.put("lastName", "Sharma");
        cust2.put("email", "priya.sharma@example.com");
        cust2.put("phone", "+919811223344");
        cust2.put("city", "Bangalore");
        cust2.put("status", "ACTIVE");
        customers.put("CUST-1002", cust2);

        Map<String, Object> lead1 = new LinkedHashMap<>();
        lead1.put("leadId", "LEAD-1001");
        lead1.put("tenantId", tenantId);
        lead1.put("customerId", "CUST-1001");
        lead1.put("customerName", "Arun Kumar");
        lead1.put("customerEmail", "arun@example.com");
        lead1.put("customerPhone", "+919876543210");
        lead1.put("destination", "Bali");
        lead1.put("departureDate", "2026-12-10");
        lead1.put("returnDate", "2026-12-15");
        lead1.put("travellers", 2);
        lead1.put("adults", 2);
        lead1.put("children", 0);
        lead1.put("budget", 120000.00);
        lead1.put("currency", "INR");
        lead1.put("leadSource", "WEBSITE");
        lead1.put("travelType", "HOLIDAY_PACKAGE");
        lead1.put("status", "QUALIFIED");
        lead1.put("stage", "QUALIFIED");
        lead1.put("assignedConsultantId", "EMP-201");
        lead1.put("assignedConsultantName", "Rajesh Verma");
        lead1.put("notes", "Interested in a five-night holiday package with beach resort & transfers");
        lead1.put("createdAt", "2026-10-28T09:30:00+05:30");
        leads.put("LEAD-1001", lead1);

        List<Map<String, Object>> acts1 = new ArrayList<>();
        Map<String, Object> a1 = new LinkedHashMap<>();
        a1.put("activityId", "ACT-1001");
        a1.put("leadId", "LEAD-1001");
        a1.put("type", "INQUIRY_RECEIVED");
        a1.put("description", "Customer filled website holiday inquiry form");
        a1.put("createdAt", "2026-10-28T09:30:00+05:30");
        acts1.add(a1);
        leadActivities.put("LEAD-1001", acts1);

        Map<String, Object> req1 = new LinkedHashMap<>();
        req1.put("requirementId", "TR-REQ-1001");
        req1.put("tenantId", tenantId);
        req1.put("leadId", "LEAD-1001");
        req1.put("destination", "Bali");
        req1.put("departureDate", "2026-12-10");
        req1.put("returnDate", "2026-12-15");
        req1.put("adults", 2);
        req1.put("children", 0);
        req1.put("departureCity", "Chennai");
        req1.put("budget", 120000.00);
        req1.put("currency", "INR");
        req1.put("hotelCategory", "FOUR_STAR");
        req1.put("preferredTravelStyle", "RELAXED");
        req1.put("specialRequirements", Arrays.asList("Airport transfers", "Breakfast", "High-floor room"));
        req1.put("status", "RECORDED");
        travelRequirements.put("LEAD-1001", req1);

        // 7. Itinerary & Items
        Map<String, Object> itin1 = new LinkedHashMap<>();
        itin1.put("itineraryId", "ITIN-1001");
        itin1.put("tenantId", tenantId);
        itin1.put("leadId", "LEAD-1001");
        itin1.put("customerId", "CUST-1001");
        itin1.put("title", "Bali Five-Night Holiday");
        itin1.put("destination", "Bali");
        itin1.put("startDate", "2026-12-10");
        itin1.put("endDate", "2026-12-15");
        itin1.put("travellers", Map.of("adults", 2, "children", 0));
        itin1.put("currency", "INR");
        itin1.put("status", "DRAFT");
        itin1.put("version", 1);
        itineraries.put("ITIN-1001", itin1);

        List<Map<String, Object>> items = new ArrayList<>();
        Map<String, Object> itm1 = new LinkedHashMap<>();
        itm1.put("itemId", "ITIN-ITEM-1001");
        itm1.put("itineraryId", "ITIN-1001");
        itm1.put("dayNumber", 1);
        itm1.put("date", "2026-12-10");
        itm1.put("itemType", "TRANSFER");
        itm1.put("title", "Airport transfer");
        itm1.put("description", "Transfer from Denpasar Ngurah Rai Airport to Seminyak Resort");
        itm1.put("supplierId", "SUP-101");
        itm1.put("estimatedPrice", 2500.00);
        itm1.put("currency", "INR");
        itm1.put("confirmationStatus", "NOT_BOOKED");
        items.add(itm1);

        Map<String, Object> itm2 = new LinkedHashMap<>();
        itm2.put("itemId", "ITIN-ITEM-1002");
        itm2.put("itineraryId", "ITIN-1001");
        itm2.put("dayNumber", 1);
        itm2.put("date", "2026-12-10");
        itm2.put("itemType", "HOTEL");
        itm2.put("title", "Seminyak Beach Resort & Spa");
        itm2.put("description", "5 nights in Deluxe Ocean View Room with daily buffet breakfast");
        itm2.put("supplierId", "SUP-101");
        itm2.put("estimatedPrice", 60000.00);
        itm2.put("currency", "INR");
        itm2.put("confirmationStatus", "NOT_BOOKED");
        items.add(itm2);

        itineraryItems.put("ITIN-1001", items);

        // 8. Quotations
        Map<String, Object> q1 = new LinkedHashMap<>();
        q1.put("quoteId", "TQUOTE-1001");
        q1.put("tenantId", tenantId);
        q1.put("leadId", "LEAD-1001");
        q1.put("customerId", "CUST-1001");
        q1.put("itineraryId", "ITIN-1001");
        q1.put("status", "DRAFT");
        q1.put("currency", "INR");
        q1.put("subtotal", 65000.00);
        q1.put("discountAmount", 2000.00);
        q1.put("taxAmount", 0.00);
        q1.put("totalAmount", 63000.00);
        q1.put("approvalStatus", "NOT_REQUIRED");
        q1.put("validUntil", "2026-11-05");
        q1.put("createdAt", "2026-10-28T11:00:00+05:30");
        quotations.put("TQUOTE-1001", q1);

        List<Map<String, Object>> qHist = new ArrayList<>();
        Map<String, Object> qh1 = new LinkedHashMap<>();
        qh1.put("version", 1);
        qh1.put("totalAmount", 63000.00);
        qh1.put("status", "DRAFT");
        qh1.put("createdAt", "2026-10-28T11:00:00+05:30");
        qHist.add(qh1);
        quotationHistory.put("TQUOTE-1001", qHist);

        // 9. Booking Handoff
        Map<String, Object> h1 = new LinkedHashMap<>();
        h1.put("handoffId", "HANDOFF-1001");
        h1.put("tenantId", tenantId);
        h1.put("leadId", "LEAD-1001");
        h1.put("customerId", "CUST-1001");
        h1.put("quoteId", "TQUOTE-1001");
        h1.put("itineraryId", "ITIN-1001");
        h1.put("status", "PENDING_BOOKING_REVIEW");
        h1.put("supplierConfirmationRequired", true);
        h1.put("submittedBy", "EMP-201");
        h1.put("submittedAt", "2026-10-28T14:30:00+05:30");
        h1.put("notes", "Customer accepted Bali 5N package. Ready for supplier reservation.");
        bookingHandoffs.put("HANDOFF-1001", h1);

        // 10. Bookings
        Map<String, Object> b1 = new LinkedHashMap<>();
        b1.put("bookingId", "TBOOK-1001");
        b1.put("tenantId", tenantId);
        b1.put("bookingReference", "TRV-1001");
        b1.put("customerId", "CUST-1001");
        b1.put("customerName", "Arun Kumar");
        b1.put("customerEmail", "arun@example.com");
        b1.put("customerPhone", "+919876543210");
        b1.put("destination", "Bali");
        b1.put("departureDate", "2026-12-10");
        b1.put("returnDate", "2026-12-15");
        b1.put("status", "CONFIRMED");
        b1.put("supplierStatus", "CONFIRMED");
        b1.put("totalAmount", 63000.00);
        b1.put("amountPaid", 63000.00);
        b1.put("paymentStatus", "SUCCEEDED");
        b1.put("currency", "INR");
        b1.put("createdAt", "2026-10-28T15:00:00+05:30");
        bookings.put("TBOOK-1001", b1);

        // 11. Supplier Bookings
        Map<String, Object> sb1 = new LinkedHashMap<>();
        sb1.put("supplierBookingId", "SB-1001");
        sb1.put("tenantId", tenantId);
        sb1.put("bookingId", "TBOOK-1001");
        sb1.put("supplierId", "SUP-101");
        sb1.put("productType", "HOTEL");
        sb1.put("status", "CONFIRMED");
        sb1.put("supplierReference", "SUP-CONF-12345");
        sb1.put("lastVerifiedAt", "2026-10-28T16:30:00+05:30");
        sb1.put("amount", 60000.00);
        sb1.put("currency", "INR");
        supplierBookings.put("SB-1001", sb1);

        // 12. Payments & Invoices
        Map<String, Object> pay1 = new LinkedHashMap<>();
        pay1.put("paymentReference", "PAY-1001");
        pay1.put("tenantId", tenantId);
        pay1.put("bookingId", "TBOOK-1001");
        pay1.put("status", "SUCCEEDED");
        pay1.put("amount", 63000.00);
        pay1.put("currency", "INR");
        pay1.put("providerReference", "PROVIDER-PAYMENT-1001");
        pay1.put("paymentMethod", "UPI_OR_CARD");
        pay1.put("verifiedAt", "2026-10-28T15:45:00+05:30");
        payments.put("PAY-1001", pay1);

        Map<String, Object> inv1 = new LinkedHashMap<>();
        inv1.put("invoiceId", "INV-1001");
        inv1.put("tenantId", tenantId);
        inv1.put("bookingId", "TBOOK-1001");
        inv1.put("amount", 63000.00);
        inv1.put("currency", "INR");
        inv1.put("status", "ISSUED");
        inv1.put("issuedAt", "2026-10-28T15:50:00+05:30");
        invoices.put("INV-1001", inv1);

        // 13. Vouchers & Documents
        Map<String, Object> v1 = new LinkedHashMap<>();
        v1.put("voucherId", "VOUCHER-1001");
        v1.put("tenantId", tenantId);
        v1.put("bookingId", "TBOOK-1001");
        v1.put("voucherType", "HOTEL_CONFIRMATION");
        v1.put("status", "GENERATED");
        v1.put("documentReference", "DOC-1001");
        v1.put("supplierReference", "SUP-CONF-12345");
        v1.put("generatedAt", "2026-10-28T16:00:00+05:30");
        vouchers.put("VOUCHER-1001", v1);

        List<Map<String, Object>> docs = new ArrayList<>();
        Map<String, Object> doc1 = new LinkedHashMap<>();
        doc1.put("documentId", "DOC-1001");
        doc1.put("title", "Bali Hotel Confirmation Voucher");
        doc1.put("type", "HOTEL_VOUCHER");
        doc1.put("url", "https://docs.wanderlusttours.com/vouchers/DOC-1001.pdf");
        docs.add(doc1);
        travelDocuments.put("TBOOK-1001", docs);

        // 14. Customer Support: Conversations, Verification, Tickets, Changes, Refunds
        Map<String, Object> conv1 = new LinkedHashMap<>();
        conv1.put("conversationId", "TCONV-1001");
        conv1.put("tenantId", tenantId);
        conv1.put("customerId", "CUST-1001");
        conv1.put("channel", "WEBSITE_CHAT");
        conv1.put("status", "OPEN");
        conv1.put("subject", "Change in departure date request");
        conversations.put("TCONV-1001", conv1);

        List<Map<String, Object>> msgs = new ArrayList<>();
        Map<String, Object> m1 = new LinkedHashMap<>();
        m1.put("messageId", "MSG-1001");
        m1.put("sender", "CUSTOMER");
        m1.put("content", "Hi, can I move my Bali departure by 1 day to Dec 11?");
        m1.put("sentAt", "2026-10-28T16:15:00+05:30");
        msgs.add(m1);
        conversationMessages.put("TCONV-1001", msgs);

        Map<String, Object> tkt1 = new LinkedHashMap<>();
        tkt1.put("ticketId", "TTICKET-1001");
        tkt1.put("tenantId", tenantId);
        tkt1.put("ticketNumber", "TR-SUP-1001");
        tkt1.put("customerId", "CUST-1001");
        tkt1.put("bookingId", "TBOOK-1001");
        tkt1.put("category", "ITINERARY_CHANGE");
        tkt1.put("subject", "Request to change travel date");
        tkt1.put("description", "Customer wants to move the departure date by one day");
        tkt1.put("priority", "HIGH");
        tkt1.put("status", "OPEN");
        tkt1.put("assignedTeam", null);
        tkt1.put("createdAt", "2026-10-28T16:20:00+05:30");
        supportTickets.put("TTICKET-1001", tkt1);

        Map<String, Object> chg1 = new LinkedHashMap<>();
        chg1.put("changeRequestId", "CHG-1001");
        chg1.put("tenantId", tenantId);
        chg1.put("bookingId", "TBOOK-1001");
        chg1.put("changeType", "DEPARTURE_DATE");
        chg1.put("requestedChanges", Map.of("departureDate", "2026-12-11", "returnDate", "2026-12-16"));
        chg1.put("reason", "Customer travel schedule changed");
        chg1.put("status", "PENDING_SUPPLIER_REVIEW");
        changeRequests.put("CHG-1001", chg1);

        Map<String, Object> can1 = new LinkedHashMap<>();
        can1.put("cancellationRequestId", "TCAN-1001");
        can1.put("tenantId", tenantId);
        can1.put("bookingId", "TBOOK-1001");
        can1.put("reason", "Customer no longer wishes to travel");
        can1.put("requestedBy", "CUSTOMER");
        can1.put("status", "PENDING_REVIEW");
        cancellationRequests.put("TCAN-1001", can1);

        Map<String, Object> ref1 = new LinkedHashMap<>();
        ref1.put("refundReference", "REF-1001");
        ref1.put("tenantId", tenantId);
        ref1.put("status", "PROCESSING");
        ref1.put("currency", "INR");
        ref1.put("amount", 15000.00);
        ref1.put("lastUpdatedAt", "2026-10-28T16:00:00+05:30");
        refunds.put("REF-1001", ref1);

        // 15. Follow-ups & Exceptions
        Map<String, Object> fu1 = new LinkedHashMap<>();
        fu1.put("taskId", "TASK-1001");
        fu1.put("tenantId", tenantId);
        fu1.put("leadId", "LEAD-1001");
        fu1.put("title", "Check Bali quote response");
        fu1.put("assignedTo", "EMP-201");
        fu1.put("dueAt", "2026-10-29T10:00:00+05:30");
        fu1.put("status", "PENDING");
        followUpTasks.put("TASK-1001", fu1);

        Map<String, Object> exc1 = new LinkedHashMap<>();
        exc1.put("exceptionId", "EXC-1001");
        exc1.put("tenantId", tenantId);
        exc1.put("bookingId", "TBOOK-1001");
        exc1.put("title", "Hotel Room Category Sold Out");
        exc1.put("status", "OPEN");
        exc1.put("severity", "MEDIUM");
        exc1.put("assignedTo", "EMP-201");
        bookingExceptions.put("EXC-1001", exc1);

        // 16. Knowledge Articles
        Map<String, Object> kb1 = new LinkedHashMap<>();
        kb1.put("articleId", "KB-101");
        kb1.put("tenantId", tenantId);
        kb1.put("title", "Bali Visa on Arrival & Customs Guidelines");
        kb1.put("snippet", "Indian passport holders can avail 30-day Visa on Arrival (VoA) for USD 35. Ensure passport is valid for min 6 months.");
        knowledgeArticles.put("KB-101", kb1);

        Map<String, Object> kb2 = new LinkedHashMap<>();
        kb2.put("articleId", "KB-102");
        kb2.put("tenantId", tenantId);
        kb2.put("title", "Standard Cancellation & Supplier Penalties Policy");
        kb2.put("snippet", "Cancellations made 15+ days prior to departure incur only 15% agency administrative fee. Flight tickets are governed by airline fare rules.");
        knowledgeArticles.put("KB-102", kb2);

        // 17. Audit Log
        Map<String, Object> aud1 = new LinkedHashMap<>();
        aud1.put("logId", "AUD-1001");
        aud1.put("tenantId", tenantId);
        aud1.put("action", "LEAD_CREATED");
        aud1.put("entity", "LEAD-1001");
        aud1.put("performedBy", "SYSTEM");
        aud1.put("timestamp", "2026-10-28T09:30:00+05:30");
        auditLogs.add(aud1);

        // 18. AI Agent Initial Settings
        Map<String, Object> salesSettings = new LinkedHashMap<>();
        salesSettings.put("agentId", "AI_TRAVEL_SALES_AGENT");
        salesSettings.put("tenantId", tenantId);
        salesSettings.put("name", "AI Travel Sales Agent");
        salesSettings.put("status", "ACTIVE");
        salesSettings.put("maxDiscountWithoutApproval", 5.0);
        salesSettings.put("requireApprovalOverBudget", true);
        salesSettings.put("autoHandoffThreshold", 0.85);
        salesSettings.put("liveSearchEnabled", true);
        salesSettings.put("preferredCurrency", "INR");
        salesSettings.put("lastActive", "2026-10-28T10:00:00Z");
        agentSettings.put("AI_TRAVEL_SALES_AGENT", salesSettings);

        Map<String, Object> followUpSettings = new LinkedHashMap<>();
        followUpSettings.put("agentId", "AI_FOLLOW_UP_AGENT");
        followUpSettings.put("tenantId", tenantId);
        followUpSettings.put("name", "AI Follow-up Agent");
        followUpSettings.put("status", "ACTIVE");
        followUpSettings.put("quietHoursStart", "21:00");
        followUpSettings.put("quietHoursEnd", "08:00");
        followUpSettings.put("maxMessagesPerLeadPerWeek", 3);
        followUpSettings.put("consentRequired", true);
        followUpSettings.put("humanApprovalRequiredForDrafts", true);
        followUpSettings.put("autoRetryFailedSends", true);
        followUpSettings.put("lastActive", "2026-10-28T10:05:00Z");
        agentSettings.put("AI_FOLLOW_UP_AGENT", followUpSettings);

        Map<String, Object> bookingSettings = new LinkedHashMap<>();
        bookingSettings.put("agentId", "AI_BOOKING_AGENT");
        bookingSettings.put("tenantId", tenantId);
        bookingSettings.put("name", "AI Booking Agent");
        bookingSettings.put("status", "ACTIVE");
        bookingSettings.put("autoReconcileTimeoutMs", 30000);
        bookingSettings.put("maxAutoReservationValue", 150000.0);
        bookingSettings.put("requireDepositBeforeBooking", true);
        bookingSettings.put("enforceSupplierPolicies", true);
        bookingSettings.put("lastActive", "2026-10-28T10:10:00Z");
        agentSettings.put("AI_BOOKING_AGENT", bookingSettings);

        // 19. Initial Follow-up Plan
        Map<String, Object> plan1 = new LinkedHashMap<>();
        plan1.put("planId", "follow_plan_1001");
        plan1.put("tenantId", tenantId);
        plan1.put("name", "Travel quotation follow-up");
        plan1.put("status", "ACTIVE");
        plan1.put("trigger", Map.of("event", "TRAVEL_QUOTATION_SENT"));
        plan1.put("steps", Arrays.asList(
            Map.of("step", 1, "delayMinutes", 1440, "channel", "EMAIL", "templateId", "travel_quote_followup_v1"),
            Map.of("step", 2, "delayMinutes", 4320, "channel", "EMAIL", "templateId", "travel_quote_followup_v2")
        ));
        plan1.put("rules", Map.of(
            "stopOnCustomerReply", true,
            "stopOnQuotationAccepted", true,
            "stopOnOptOut", true,
            "requireConsent", true,
            "maxMessagesPerLeadPerWeek", 3,
            "requireHumanApproval", true
        ));
        followUpPlans.put("follow_plan_1001", plan1);

        // 20. Seed Recommendation
        Map<String, Object> rec1 = new LinkedHashMap<>();
        rec1.put("recommendationId", "rec_travel_1001");
        rec1.put("leadId", "LEAD-1001");
        rec1.put("searchId", "search_travel_5001");
        rec1.put("status", "DRAFT");
        rec1.put("options", Arrays.asList(
            Map.of(
                "optionId", "option_1",
                "title", "Beach and Culture",
                "productReferences", List.of("supplier_product_101"),
                "reason", "Matches the requested relaxed travel style and beach preference.",
                "priceStatus", "PARTIAL",
                "missingComponents", List.of("FLIGHT", "TRANSFER", "ACTIVITY")
            )
        ));
        rec1.put("requiresHumanReview", false);
        recommendations.put("rec_travel_1001", rec1);

        // 21. Customer Communication Preferences & Suppression
        Map<String, Object> pref1 = new LinkedHashMap<>();
        pref1.put("customerId", "CUST-1001");
        pref1.put("tenantId", tenantId);
        pref1.put("email", "arun@example.com");
        pref1.put("phone", "+919876543210");
        pref1.put("emailConsent", "GRANTED");
        pref1.put("smsConsent", "GRANTED");
        pref1.put("whatsappConsent", "GRANTED");
        pref1.put("suppressionStatus", "ALLOWED");
        pref1.put("lastConsentUpdate", "2026-10-28T09:30:00Z");
        customerPreferences.put("CUST-1001", pref1);

        // 22. Seed Supplier Reservation
        Map<String, Object> sRes1 = new LinkedHashMap<>();
        sRes1.put("reservationId", "supplier_reservation_2001");
        sRes1.put("bookingId", "TBOOK-1001");
        sRes1.put("tenantId", tenantId);
        sRes1.put("serviceType", "HOTEL");
        sRes1.put("productReference", "supplier_product_101");
        sRes1.put("supplierReference", "supplier-ref-101");
        sRes1.put("supplierConfirmationReference", "supplier-confirmation-2001");
        sRes1.put("status", "CONFIRMED");
        sRes1.put("confirmedAt", "2026-10-28T11:10:00Z");
        sRes1.put("price", 32000.0);
        sRes1.put("currency", "INR");
        supplierReservations.put("supplier_reservation_2001", sRes1);
    }

    // ==========================================
    // GETTERS FOR SHARED MAPS
    // ==========================================
    public Map<String, Map<String, Object>> getDestinations() { return destinations; }
    public Map<String, Map<String, Object>> getPackages() { return packages; }
    public Map<String, Map<String, Object>> getSuppliers() { return suppliers; }
    public Map<String, Map<String, Object>> getCustomers() { return customers; }
    public Map<String, Map<String, Object>> getLeads() { return leads; }
    public Map<String, List<Map<String, Object>>> getLeadActivities() { return leadActivities; }
    public Map<String, Map<String, Object>> getTravelRequirements() { return travelRequirements; }
    public Map<String, Map<String, Object>> getTeams() { return teams; }
    public Map<String, Map<String, Object>> getConsultants() { return consultants; }
    public Map<String, Map<String, Object>> getSalesTargets() { return salesTargets; }
    public Map<String, Map<String, Object>> getItineraries() { return itineraries; }
    public Map<String, List<Map<String, Object>>> getItineraryItems() { return itineraryItems; }
    public Map<String, List<Map<String, Object>>> getItineraryVersions() { return itineraryVersions; }
    public Map<String, Map<String, Object>> getQuotations() { return quotations; }
    public Map<String, List<Map<String, Object>>> getQuotationHistory() { return quotationHistory; }
    public Map<String, Map<String, Object>> getBookingHandoffs() { return bookingHandoffs; }
    public Map<String, Map<String, Object>> getBookings() { return bookings; }
    public Map<String, List<Map<String, Object>>> getBookingItems() { return bookingItems; }
    public Map<String, List<Map<String, Object>>> getBookingHistory() { return bookingHistory; }
    public Map<String, Map<String, Object>> getSupplierSearches() { return supplierSearches; }
    public Map<String, Map<String, Object>> getSupplierBookings() { return supplierBookings; }
    public Map<String, Map<String, Object>> getPayments() { return payments; }
    public Map<String, Map<String, Object>> getInvoices() { return invoices; }
    public Map<String, Map<String, Object>> getVouchers() { return vouchers; }

    // AI Agents getters
    public Map<String, Map<String, Object>> getRecommendations() { return recommendations; }
    public Map<String, Map<String, Object>> getFollowUpPlans() { return followUpPlans; }
    public Map<String, List<Map<String, Object>>> getFollowUpMessageDrafts() { return followUpMessageDrafts; }
    public Map<String, Map<String, Object>> getFollowUpMessages() { return followUpMessages; }
    public Map<String, Map<String, Object>> getCustomerPreferences() { return customerPreferences; }
    public Map<String, Map<String, Object>> getCustomerSuppression() { return customerSuppression; }
    public Map<String, Map<String, Object>> getInboundCustomerResponses() { return inboundCustomerResponses; }
    public Map<String, Map<String, Object>> getSupplierReservations() { return supplierReservations; }
    public Map<String, Map<String, Object>> getQuotationApprovals() { return quotationApprovals; }
    public Map<String, Map<String, Object>> getAgentSettings() { return agentSettings; }
    public Map<String, Map<String, Object>> getBusinessEvents() { return businessEvents; }
    public Map<String, List<Map<String, Object>>> getTravelDocuments() { return travelDocuments; }
    public Map<String, Map<String, Object>> getConversations() { return conversations; }
    public Map<String, List<Map<String, Object>>> getConversationMessages() { return conversationMessages; }
    public Map<String, Map<String, Object>> getGuestVerificationSessions() { return guestVerificationSessions; }
    public Map<String, Map<String, Object>> getSupportTickets() { return supportTickets; }
    public Map<String, List<Map<String, Object>>> getTicketNotes() { return ticketNotes; }
    public Map<String, Map<String, Object>> getReplyDrafts() { return replyDrafts; }
    public Map<String, Map<String, Object>> getChangeRequests() { return changeRequests; }
    public Map<String, Map<String, Object>> getCancellationRequests() { return cancellationRequests; }
    public Map<String, Map<String, Object>> getRefunds() { return refunds; }
    public Map<String, Map<String, Object>> getServiceRequests() { return serviceRequests; }
    public Map<String, Map<String, Object>> getKnowledgeArticles() { return knowledgeArticles; }
    public Map<String, Map<String, Object>> getFeedbackRecords() { return feedbackRecords; }
    public Map<String, Map<String, Object>> getFollowUpTasks() { return followUpTasks; }
    public Map<String, Map<String, Object>> getBookingExceptions() { return bookingExceptions; }
    public Map<String, Map<String, Object>> getEscalations() { return escalations; }
    public List<Map<String, Object>> getAuditLogs() { return auditLogs; }

    public void logAudit(String tenantId, String action, String entity, String performedBy, String details) {
        Map<String, Object> entry = new LinkedHashMap<>();
        entry.put("logId", "AUD-" + (1001 + auditLogs.size()));
        entry.put("tenantId", tenantId);
        entry.put("action", action);
        entry.put("entity", entity);
        entry.put("performedBy", performedBy != null ? performedBy : "AUTHENTICATED_USER");
        entry.put("details", details);
        entry.put("timestamp", LocalDateTime.now().toString());
        auditLogs.add(entry);
    }

    // Entity lookup helpers
    public Map<String, Object> findCustomer(String id) { return customers.get(id); }
    public Map<String, Object> findLead(String id) { return leads.get(id); }
    public Map<String, Object> findItinerary(String id) { return itineraries.get(id); }
    public Map<String, Object> findQuotation(String id) { return quotations.get(id); }
    public Map<String, Object> findBooking(String id) { return bookings.get(id); }
    public Map<String, Object> findTicket(String id) { return supportTickets.get(id); }
    public Map<String, Object> findChangeRequest(String id) { return changeRequests.get(id); }
    public Map<String, Object> findCancellationRequest(String id) { return cancellationRequests.get(id); }
    public Map<String, Object> findHandoff(String id) { return bookingHandoffs.get(id); }
    public Map<String, Object> findException(String id) { return bookingExceptions.get(id); }

    // List helpers
    public List<Map<String, Object>> getDestinationsList() { return new ArrayList<>(destinations.values()); }
    public List<Map<String, Object>> getPackagesList() { return new ArrayList<>(packages.values()); }
    public List<Map<String, Object>> getSuppliersList() { return new ArrayList<>(suppliers.values()); }
    public List<Map<String, Object>> getCustomersList() { return new ArrayList<>(customers.values()); }
    public List<Map<String, Object>> getLeadsList() { return new ArrayList<>(leads.values()); }
    public List<Map<String, Object>> getItinerariesList() { return new ArrayList<>(itineraries.values()); }
    public List<Map<String, Object>> getQuotationsList() { return new ArrayList<>(quotations.values()); }
    public List<Map<String, Object>> getHandoffsList() { return new ArrayList<>(bookingHandoffs.values()); }
    public List<Map<String, Object>> getBookingsList() { return new ArrayList<>(bookings.values()); }
    public List<Map<String, Object>> getSupplierBookingsList() { return new ArrayList<>(supplierBookings.values()); }
    public List<Map<String, Object>> getPaymentsList() { return new ArrayList<>(payments.values()); }
    public List<Map<String, Object>> getInvoicesList() { return new ArrayList<>(invoices.values()); }
    public List<Map<String, Object>> getVouchersList() { return new ArrayList<>(vouchers.values()); }
    public List<Map<String, Object>> getTicketsList() { return new ArrayList<>(supportTickets.values()); }
    public List<Map<String, Object>> getChangeRequestsList() { return new ArrayList<>(changeRequests.values()); }
    public List<Map<String, Object>> getCancellationRequestsList() { return new ArrayList<>(cancellationRequests.values()); }
    public List<Map<String, Object>> getRefundsList() { return new ArrayList<>(refunds.values()); }
    public List<Map<String, Object>> getFollowUpsList() { return new ArrayList<>(followUpTasks.values()); }
    public List<Map<String, Object>> getExceptionsList() { return new ArrayList<>(bookingExceptions.values()); }
    public List<Map<String, Object>> getEscalationsList() { return new ArrayList<>(escalations.values()); }
    public List<Map<String, Object>> getConversationsList() { return new ArrayList<>(conversations.values()); }
    public Map<String, Object> findConversation(String id) { return conversations.get(id); }

    public Map<String, Object> createLead(Map<String, Object> body) {
        String id = "LEAD-" + (1001 + leads.size());
        Map<String, Object> l = new LinkedHashMap<>(body);
        l.put("leadId", id);
        l.put("createdAt", LocalDateTime.now().toString());
        leads.put(id, l);
        return l;
    }

    public List<Map<String, Object>> getLeadActivities(String leadId) {
        return leadActivities.computeIfAbsent(leadId, k -> Collections.synchronizedList(new ArrayList<>()));
    }

    public List<Map<String, Object>> getActivities(String leadId) {
        return getLeadActivities(leadId);
    }

    public Map<String, Object> addLeadActivity(String leadId, Map<String, Object> body) {
        Map<String, Object> act = new LinkedHashMap<>(body);
        act.put("activityId", "ACT-" + System.currentTimeMillis());
        act.put("leadId", leadId);
        act.put("timestamp", LocalDateTime.now().toString());
        getLeadActivities(leadId).add(act);
        return act;
    }

    public Map<String, Object> recordActivity(String leadId, String type, String summary) {
        Map<String, Object> act = new LinkedHashMap<>();
        act.put("type", type);
        act.put("summary", summary);
        return addLeadActivity(leadId, act);
    }

    public Map<String, Object> saveTravelRequirement(String leadId, Map<String, Object> req) {
        String reqId = "TR-REQ-" + (1001 + travelRequirements.size());
        Map<String, Object> record = new LinkedHashMap<>(req);
        record.put("requirementId", reqId);
        record.put("leadId", leadId);
        record.put("status", "RECORDED");
        travelRequirements.put(leadId, record);
        return record;
    }

    public Map<String, Object> updateRequirements(String leadId, Map<String, Object> req) {
        return saveTravelRequirement(leadId, req);
    }

    public Map<String, Object> getTravelRequirement(String leadId) {
        return travelRequirements.get(leadId);
    }

    public Map<String, Object> findRequirements(String leadId) {
        return travelRequirements.get(leadId);
    }

    public Map<String, Object> createEscalation(String refId, Map<String, Object> body) {
        String id = "ESC-" + (1001 + escalations.size());
        Map<String, Object> e = new LinkedHashMap<>(body);
        e.put("escalationId", id);
        e.put("referenceId", refId);
        e.put("status", "OPEN");
        e.put("createdAt", LocalDateTime.now().toString());
        escalations.put(id, e);
        return e;
    }

    public Map<String, Object> createItinerary(Map<String, Object> body) {
        String id = "ITIN-" + (1001 + itineraries.size());
        Map<String, Object> itin = new LinkedHashMap<>(body);
        itin.put("itineraryId", id);
        itin.put("status", "DRAFT");
        itin.put("version", 1);
        itin.put("items", new ArrayList<Map<String, Object>>());
        itineraries.put(id, itin);
        return itin;
    }

    public Map<String, Object> createItinerary(String leadId, Map<String, Object> body) {
        Map<String, Object> b = new LinkedHashMap<>(body);
        b.put("leadId", leadId);
        return createItinerary(b);
    }

    public Map<String, Object> addItineraryItem(String itineraryId, Map<String, Object> item) {
        Map<String, Object> itin = itineraries.get(itineraryId);
        if (itin == null) return null;
        String itemId = "ITIN-ITEM-" + (1001 + System.currentTimeMillis() % 10000);
        Map<String, Object> it = new LinkedHashMap<>(item);
        it.put("itemId", itemId);
        it.put("itineraryId", itineraryId);
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> items = (List<Map<String, Object>>) itin.computeIfAbsent("items", k -> new ArrayList<>());
        items.add(it);
        return it;
    }

    public Map<String, Object> createQuotation(String leadId, String itineraryId, Map<String, Object> body) {
        Map<String, Object> b = new LinkedHashMap<>(body);
        b.put("leadId", leadId);
        b.put("itineraryId", itineraryId);
        return createQuotation(b);
    }

    public Map<String, Object> createQuotation(Map<String, Object> body) {
        String id = "TQUOTE-" + (1001 + quotations.size());
        Map<String, Object> q = new LinkedHashMap<>(body);
        q.put("quotationId", id);
        q.put("quoteId", id);
        q.put("status", "DRAFT");
        q.put("currency", body.getOrDefault("currency", "INR"));
        
        double subtotal = 0;
        if (body.get("items") instanceof List<?> list) {
            for (Object obj : list) {
                if (obj instanceof Map<?, ?> m) {
                    Object qVal = m.get("quantity");
                    double qty = (qVal instanceof Number n) ? n.doubleValue() : 1.0;
                    Object pVal = m.get("unitPrice");
                    double price = (pVal instanceof Number n) ? n.doubleValue() : 0.0;
                    subtotal += qty * price;
                }
            }
        }
        if (subtotal == 0) subtotal = 65000.0;
        double discount = ((Number) body.getOrDefault("discountAmount", 2000.0)).doubleValue();
        q.put("subtotal", subtotal);
        q.put("discountAmount", discount);
        q.put("taxAmount", 0.0);
        q.put("totalAmount", subtotal - discount);
        q.put("approvalStatus", "NOT_REQUIRED");
        quotations.put(id, q);
        return q;
    }

    public Map<String, Object> createHandoff(String leadId, Map<String, Object> body) {
        String id = "HANDOFF-" + (1001 + bookingHandoffs.size());
        Map<String, Object> h = new LinkedHashMap<>(body);
        h.put("handoffId", id);
        h.put("leadId", leadId);
        h.put("status", "PENDING_BOOKING_REVIEW");
        bookingHandoffs.put(id, h);
        return h;
    }

    public Map<String, Object> createBooking(Map<String, Object> body) {
        String id = "TBOOK-" + (1001 + bookings.size());
        Map<String, Object> b = new LinkedHashMap<>(body);
        b.put("bookingId", id);
        b.put("bookingReference", "TRV-" + (1001 + bookings.size()));
        b.put("status", "PENDING_CONFIRMATION");
        b.put("supplierStatus", "NOT_SUBMITTED");
        b.put("currency", body.getOrDefault("currency", "INR"));
        bookings.put(id, b);
        return b;
    }

    public Map<String, Object> createSupplierBooking(Map<String, Object> body) {
        String id = "SB-" + (1001 + supplierBookings.size());
        Map<String, Object> sb = new LinkedHashMap<>(body);
        sb.put("supplierBookingId", id);
        sb.put("status", "PENDING_SUPPLIER_CONFIRMATION");
        sb.put("supplierReference", null);
        supplierBookings.put(id, sb);
        return sb;
    }

    public Map<String, Object> createPaymentSession(String bookingId, double amount) {
        String id = "PAY-" + (1001 + payments.size());
        Map<String, Object> p = new LinkedHashMap<>();
        p.put("paymentReference", id);
        p.put("bookingId", bookingId);
        p.put("status", "PENDING");
        p.put("amount", amount);
        p.put("currency", "INR");
        payments.put(id, p);
        return p;
    }

    public Map<String, Object> createVoucher(String bookingId, String type) {
        String id = "VOUCHER-" + (1001 + vouchers.size());
        Map<String, Object> v = new LinkedHashMap<>();
        v.put("voucherId", id);
        v.put("bookingId", bookingId);
        v.put("status", "GENERATED");
        v.put("voucherType", type != null ? type : "HOTEL_CONFIRMATION");
        v.put("documentReference", "DOC-" + (1001 + vouchers.size()));
        vouchers.put(id, v);
        return v;
    }

    public Map<String, Object> createTicket(Map<String, Object> body) {
        String id = "TTICKET-" + (1001 + supportTickets.size());
        Map<String, Object> t = new LinkedHashMap<>(body);
        t.put("ticketId", id);
        t.put("ticketNumber", "TR-SUP-" + (1001 + supportTickets.size()));
        t.put("status", "OPEN");
        supportTickets.put(id, t);
        return t;
    }

    public Map<String, Object> createChangeRequest(Map<String, Object> body) {
        String id = "CHG-" + (1001 + changeRequests.size());
        Map<String, Object> c = new LinkedHashMap<>(body);
        c.put("changeRequestId", id);
        c.put("status", "PENDING_SUPPLIER_REVIEW");
        changeRequests.put(id, c);
        return c;
    }

    public Map<String, Object> createCancellationRequest(Map<String, Object> body) {
        String id = "TCAN-" + (1001 + cancellationRequests.size());
        Map<String, Object> c = new LinkedHashMap<>(body);
        c.put("cancellationRequestId", id);
        c.put("status", "PENDING_REVIEW");
        cancellationRequests.put(id, c);
        return c;
    }

    public Map<String, Object> createFollowUp(Map<String, Object> body) {
        String id = "TASK-" + (1001 + followUpTasks.size());
        Map<String, Object> f = new LinkedHashMap<>(body);
        f.put("taskId", id);
        f.put("status", "PENDING");
        followUpTasks.put(id, f);
        return f;
    }

    public Map<String, Object> completeFollowUp(String taskId) {
        Map<String, Object> f = followUpTasks.get(taskId);
        if (f == null) {
            f = new LinkedHashMap<>();
            f.put("taskId", taskId);
            followUpTasks.put(taskId, f);
        }
        f.put("status", "COMPLETED");
        return f;
    }

    public Map<String, Object> createException(Map<String, Object> body) {
        String id = "EXC-" + (1001 + bookingExceptions.size());
        Map<String, Object> e = new LinkedHashMap<>(body);
        e.put("exceptionId", id);
        e.put("status", "OPEN");
        bookingExceptions.put(id, e);
        return e;
    }

    public void recordAudit(String action, String details) {
        logAudit("tenant-7", action, "TRAVEL", "CURRENT_USER", details);
    }

    // AI Agents helpers
    public Map<String, Object> createRecommendation(Map<String, Object> body) {
        String id = "rec_travel_" + (1001 + recommendations.size());
        Map<String, Object> rec = new LinkedHashMap<>(body);
        rec.put("recommendationId", id);
        rec.put("status", body.getOrDefault("status", "DRAFT"));
        rec.put("createdAt", LocalDateTime.now().toString());
        recommendations.put(id, rec);
        return rec;
    }

    public Map<String, Object> createFollowUpPlan(Map<String, Object> body) {
        String id = "follow_plan_" + (1001 + followUpPlans.size());
        Map<String, Object> plan = new LinkedHashMap<>(body);
        plan.put("planId", id);
        plan.put("status", body.getOrDefault("status", "DRAFT"));
        plan.put("createdAt", LocalDateTime.now().toString());
        followUpPlans.put(id, plan);
        return plan;
    }

    public Map<String, Object> createFollowUpMessageDraft(String taskId, Map<String, Object> body) {
        String draftId = "follow_draft_" + (1001 + followUpMessageDrafts.values().stream().mapToInt(List::size).sum());
        Map<String, Object> draft = new LinkedHashMap<>(body);
        draft.put("draftId", draftId);
        draft.put("taskId", taskId);
        draft.put("status", "DRAFT");
        draft.put("createdAt", LocalDateTime.now().toString());
        followUpMessageDrafts.computeIfAbsent(taskId, k -> new ArrayList<>()).add(draft);
        return draft;
    }

    public Map<String, Object> createSupplierReservation(String bookingId, Map<String, Object> body) {
        String resId = "supplier_reservation_" + (2001 + supplierReservations.size());
        Map<String, Object> res = new LinkedHashMap<>(body);
        res.put("reservationId", resId);
        res.put("bookingId", bookingId);
        res.put("status", "PENDING_SUPPLIER_CONFIRMATION");
        res.put("submittedAt", LocalDateTime.now().toString());
        supplierReservations.put(resId, res);
        return res;
    }

    public Map<String, Object> reconcileSupplierReservation(String resId) {
        Map<String, Object> res = supplierReservations.get(resId);
        if (res != null) {
            res.put("status", "CONFIRMED");
            res.put("supplierConfirmationReference", "supplier-conf-" + (System.currentTimeMillis() % 10000));
            res.put("reconciledAt", LocalDateTime.now().toString());
        }
        return res;
    }

    public Map<String, Object> recordOptOut(String customerId, String channel, String reason, String source) {
        Map<String, Object> pref = customerPreferences.computeIfAbsent(customerId, k -> {
            Map<String, Object> p = new LinkedHashMap<>();
            p.put("customerId", customerId);
            p.put("suppressionStatus", "ALLOWED");
            return p;
        });
        pref.put(channel.toLowerCase() + "Consent", "REVOKED");
        pref.put("suppressionStatus", "OPTED_OUT");
        pref.put("optOutReason", reason);
        pref.put("optOutSource", source);
        pref.put("lastConsentUpdate", LocalDateTime.now().toString());
        
        int cancelled = 0;
        for (Map<String, Object> task : followUpTasks.values()) {
            if ("PENDING".equals(task.get("status")) && channel.equalsIgnoreCase(String.valueOf(task.get("channel")))) {
                task.put("status", "CANCELLED_OPT_OUT");
                cancelled++;
            }
        }
        pref.put("pendingMatchingTasksCancelled", cancelled);
        return pref;
    }

    public Map<String, Object> recordOptIn(String customerId, String channel) {
        Map<String, Object> pref = customerPreferences.computeIfAbsent(customerId, k -> {
            Map<String, Object> p = new LinkedHashMap<>();
            p.put("customerId", customerId);
            return p;
        });
        pref.put(channel.toLowerCase() + "Consent", "GRANTED");
        pref.put("suppressionStatus", "ALLOWED");
        pref.put("lastConsentUpdate", LocalDateTime.now().toString());
        return pref;
    }
}

