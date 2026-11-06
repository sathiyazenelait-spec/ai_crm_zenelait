package com.zenelait.crm.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

/**
 * Zenelait AI CRM — Travel Company Admin V1 REST API Controller
 * Implements Part 2 Travel Company Admin API Catalogue:
 * - Dashboard & Settings (/api/v1/travel/dashboard, /settings, /business-hours)
 * - Destinations & Packages (/api/v1/travel/destinations, /packages, /itinerary, /departures, /availability)
 * - Enquiries & Quotations (/api/v1/travel/enquiries, /quotations, /send, /accept)
 * - Bookings, Travellers & Suppliers (/api/v1/travel/bookings, /travellers, /suppliers, /payments)
 * - Reports (/api/v1/reports/travel/*)
 */
@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class TravelAdminV1Controller {

    private final Map<String, Object> travelSettings = new LinkedHashMap<>();
    private final Map<String, Object> businessHours = new LinkedHashMap<>();
    private final List<Map<String, Object>> destinations = new ArrayList<>();
    private final List<Map<String, Object>> packages = new ArrayList<>();
    private final List<Map<String, Object>> enquiries = new ArrayList<>();
    private final List<Map<String, Object>> quotations = new ArrayList<>();
    private final List<Map<String, Object>> bookings = new ArrayList<>();
    private final List<Map<String, Object>> suppliers = new ArrayList<>();

    public TravelAdminV1Controller() {
        initTravelData();
    }

    private void initTravelData() {
        // 1. Settings & Business Hours
        travelSettings.put("companyName", "Wanderlust Global Expeditions");
        travelSettings.put("defaultCurrency", "INR");
        travelSettings.put("cancellationFeePercent", 15.0);
        travelSettings.put("quotationValidityDays", 7);
        travelSettings.put("supportEmail", "trips@wanderlusttours.com");
        travelSettings.put("emergencyContact", "+91 80 4910 2200");

        businessHours.put("mondayToFriday", "09:00 - 20:00 IST");
        businessHours.put("saturday", "10:00 - 17:00 IST");
        businessHours.put("sunday", "Emergency Support Desk Only");

        // 2. Destinations
        Map<String, Object> d1 = new LinkedHashMap<>();
        d1.put("id", "DEST-001");
        d1.put("name", "Dubai");
        d1.put("country", "United Arab Emirates");
        d1.put("state", "Dubai Emirate");
        d1.put("description", "Futuristic metropolis, desert safaris, luxury shopping and iconic skyscrapers");
        d1.put("status", "ACTIVE");
        destinations.add(d1);

        Map<String, Object> d2 = new LinkedHashMap<>();
        d2.put("id", "DEST-002");
        d2.put("name", "Ooty");
        d2.put("country", "India");
        d2.put("state", "Tamil Nadu");
        d2.put("description", "Serene Nilgiri hill station, tea plantations, botanical gardens, and toy train");
        d2.put("status", "ACTIVE");
        destinations.add(d2);

        Map<String, Object> d3 = new LinkedHashMap<>();
        d3.put("id", "DEST-003");
        d3.put("name", "Bali");
        d3.put("country", "Indonesia");
        d3.put("state", "Bali Island");
        d3.put("description", "Tropical paradise with lush rice terraces, ancient cliffside temples and beaches");
        d3.put("status", "ACTIVE");
        destinations.add(d3);

        // 3. Packages & Itineraries
        Map<String, Object> p1 = new LinkedHashMap<>();
        p1.put("id", "PKG-001");
        p1.put("packageCode", "OOTY-3D2N");
        p1.put("name", "Ooty Weekend Nature Retreat");
        p1.put("destinationIds", List.of("DEST-002"));
        p1.put("durationDays", 3);
        p1.put("durationNights", 2);
        p1.put("pricePerPerson", 12500.00);
        p1.put("currency", "INR");
        p1.put("inclusions", List.of("4-Star Heritage Stay", "Daily Breakfast", "Botanical Garden & Lake Cab Tour", "Tea Factory Visit"));
        p1.put("exclusions", List.of("Personal expenses", "Airfare/Train to Coimbatore"));
        p1.put("status", "ACTIVE");
        p1.put("capacity", 20);
        p1.put("availableSlots", 8);
        p1.put("itinerary", List.of(
                Map.of("dayNumber", 1, "title", "Arrival & Lake Cruise", "activities", List.of("Cab pickup from Coimbatore", "Hotel check-in", "Ooty Lake Boating")),
                Map.of("dayNumber", 2, "title", "Doddabetta Peak & Tea Trails", "activities", List.of("Viewpoint summit", "Tea factory tour & tasting", "Botanical garden")),
                Map.of("dayNumber", 3, "title", "Pykara Waterfalls & Departure", "activities", List.of("Breakfast", "Pykara lake cruise", "Drop at station/airport"))
        ));
        packages.add(p1);

        Map<String, Object> p2 = new LinkedHashMap<>();
        p2.put("id", "PKG-002");
        p2.put("packageCode", "DXB-5D4N");
        p2.put("name", "Dubai Extravaganza with Desert Safari");
        p2.put("destinationIds", List.of("DEST-001"));
        p2.put("durationDays", 5);
        p2.put("durationNights", 4);
        p2.put("pricePerPerson", 48000.00);
        p2.put("currency", "INR");
        p2.put("inclusions", List.of("4-Star Bur Dubai Stay", "Desert Safari with BBQ & Tanoura", "Burj Khalifa 124th Floor", "Marina Dhow Cruise"));
        p2.put("exclusions", List.of("UAE Tourist Visa fee", "International Flights"));
        p2.put("status", "ACTIVE");
        p2.put("capacity", 30);
        p2.put("availableSlots", 12);
        packages.add(p2);

        // 4. Enquiries
        Map<String, Object> enq1 = new LinkedHashMap<>();
        enq1.put("id", "ENQ-001");
        enq1.put("customerName", "Arun Kumar");
        enq1.put("email", "arun@example.com");
        enq1.put("phone", "+91 98765 43210");
        enq1.put("destinationId", "DEST-002");
        enq1.put("destinationName", "Ooty");
        enq1.put("travelStartDate", "2026-12-10");
        enq1.put("travelEndDate", "2026-12-12");
        enq1.put("adults", 2);
        enq1.put("children", 0);
        enq1.put("budget", 30000.00);
        enq1.put("currency", "INR");
        enq1.put("source", "WEBSITE_CHAT");
        enq1.put("stage", "QUALIFIED");
        enq1.put("assignedConsultantId", "USR-TRV-102");
        enq1.put("assignedConsultantName", "Priya Iyer");
        enq1.put("createdAt", "2026-10-24T04:30:00Z");
        enquiries.add(enq1);

        Map<String, Object> enq2 = new LinkedHashMap<>();
        enq2.put("id", "ENQ-002");
        enq2.put("customerName", "Rohit Malhotra");
        enq2.put("email", "rohit.m@globalcorp.com");
        enq2.put("phone", "+91 98111 22334");
        enq2.put("destinationId", "DEST-001");
        enq2.put("destinationName", "Dubai");
        enq2.put("travelStartDate", "2026-12-20");
        enq2.put("travelEndDate", "2026-12-25");
        enq2.put("adults", 4);
        enq2.put("children", 1);
        enq2.put("budget", 220000.00);
        enq2.put("currency", "INR");
        enq2.put("source", "WHATSAPP");
        enq2.put("stage", "NEW");
        enq2.put("assignedConsultantId", null);
        enq2.put("createdAt", "2026-10-24T08:15:00Z");
        enquiries.add(enq2);

        // 5. Quotations
        Map<String, Object> q1 = new LinkedHashMap<>();
        q1.put("id", "QUO-001");
        q1.put("quotationNumber", "TRV-2026-001");
        q1.put("enquiryId", "ENQ-001");
        q1.put("customerName", "Arun Kumar");
        q1.put("packageId", "PKG-001");
        q1.put("packageName", "Ooty Weekend Nature Retreat");
        q1.put("adults", 2);
        q1.put("children", 0);
        q1.put("subtotal", 27000.00);
        q1.put("currency", "INR");
        q1.put("status", "SENT");
        q1.put("validUntil", "2026-11-15");
        q1.put("createdAt", "2026-10-24T05:00:00Z");
        quotations.add(q1);

        // 6. Bookings
        Map<String, Object> b1 = new LinkedHashMap<>();
        b1.put("id", "BOOK-001");
        b1.put("bookingReference", "ZTR-2026-001");
        b1.put("quotationId", "QUO-001");
        b1.put("customerName", "Arun Kumar");
        b1.put("packageName", "Ooty Weekend Nature Retreat");
        b1.put("travelStartDate", "2026-12-10");
        b1.put("travelEndDate", "2026-12-12");
        b1.put("travellerCount", 2);
        b1.put("totalAmount", 27000.00);
        b1.put("currency", "INR");
        b1.put("bookingStatus", "CONFIRMED");
        b1.put("paymentStatus", "PAID");
        b1.put("createdAt", "2026-10-24T06:00:00Z");
        bookings.add(b1);

        // 7. Suppliers
        Map<String, Object> s1 = new LinkedHashMap<>();
        s1.put("id", "SUP-001");
        s1.put("name", "Sterling Nilgiri Heritage Resort");
        s1.put("category", "HOTEL");
        s1.put("destination", "Ooty");
        s1.put("contactName", "Kiran Rao");
        s1.put("email", "reservations@sterlingooty.com");
        s1.put("phone", "+91 423 244 5500");
        s1.put("status", "ACTIVE");
        suppliers.add(s1);

        Map<String, Object> s2 = new LinkedHashMap<>();
        s2.put("id", "SUP-002");
        s2.put("name", "Arabian Adventures Tours LLC");
        s2.put("category", "EXCURSION_OPERATOR");
        s2.put("destination", "Dubai");
        s2.put("contactName", "Tariq Mansoor");
        s2.put("email", "ops@arabianadventures.ae");
        s2.put("phone", "+971 4 303 4888");
        s2.put("status", "ACTIVE");
        suppliers.add(s2);
    }

    // ==========================================
    // 3.1 DASHBOARD & SETTINGS
    // ==========================================

    @GetMapping("/travel/dashboard")
    public ResponseEntity<Map<String, Object>> getTravelDashboard(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {

        Map<String, Object> metrics = new LinkedHashMap<>();
        metrics.put("newEnquiries", 185 + enquiries.size());
        metrics.put("openEnquiries", 62);
        metrics.put("quotationsSent", 90 + quotations.size());
        metrics.put("pendingBookings", 24);
        metrics.put("confirmedBookings", 48 + bookings.size());

        Map<String, Object> sales = new LinkedHashMap<>();
        sales.put("quotedValue", 1250000.00);
        sales.put("confirmedBookingValue", 760000.00);
        sales.put("currency", "INR");

        Map<String, Object> ai = new LinkedHashMap<>();
        ai.put("totalConversations", 510);
        ai.put("resolvedWithoutHuman", 350);
        ai.put("escalatedToHuman", 160);
        ai.put("resolutionRate", 68.6);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("period", Map.of("from", from != null ? from : "2026-10-01", "to", to != null ? to : "2026-10-24"));
        data.put("metrics", metrics);
        data.put("sales", sales);
        data.put("ai", ai);

        return ResponseEntity.ok(Map.of("success", true, "data", data));
    }

    @GetMapping("/travel/settings")
    public ResponseEntity<Map<String, Object>> getTravelSettings() {
        return ResponseEntity.ok(Map.of("success", true, "data", travelSettings));
    }

    @PutMapping("/travel/settings")
    public ResponseEntity<Map<String, Object>> updateTravelSettings(@RequestBody Map<String, Object> updates) {
        travelSettings.putAll(updates);
        return ResponseEntity.ok(Map.of("success", true, "message", "Travel settings updated", "data", travelSettings));
    }

    @GetMapping("/travel/business-hours")
    public ResponseEntity<Map<String, Object>> getBusinessHours() {
        return ResponseEntity.ok(Map.of("success", true, "data", businessHours));
    }

    // ==========================================
    // 3.2 DESTINATIONS & PACKAGES
    // ==========================================

    @GetMapping("/travel/destinations")
    public ResponseEntity<Map<String, Object>> getDestinations() {
        return ResponseEntity.ok(Map.of("success", true, "data", destinations));
    }

    @PostMapping("/travel/destinations")
    public ResponseEntity<Map<String, Object>> createDestination(@RequestBody Map<String, Object> req) {
        String id = "DEST-" + String.format("%03d", destinations.size() + 1);
        Map<String, Object> d = new LinkedHashMap<>(req);
        d.put("id", id);
        d.putIfAbsent("status", "ACTIVE");
        destinations.add(d);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "message", "Destination created successfully", "data", d));
    }

    @GetMapping("/travel/packages")
    public ResponseEntity<Map<String, Object>> getPackages() {
        return ResponseEntity.ok(Map.of("success", true, "data", packages));
    }

    @PostMapping("/travel/packages")
    public ResponseEntity<Map<String, Object>> createPackage(@RequestBody Map<String, Object> req) {
        String id = "PKG-" + String.format("%03d", packages.size() + 1);
        Map<String, Object> p = new LinkedHashMap<>(req);
        p.put("id", id);
        p.putIfAbsent("status", "DRAFT");
        p.putIfAbsent("currency", "INR");
        packages.add(0, p);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "message", "Travel package created successfully", "data", p));
    }

    @GetMapping("/travel/packages/{packageId}")
    public ResponseEntity<Map<String, Object>> getPackage(@PathVariable String packageId) {
        return packages.stream()
                .filter(p -> packageId.equalsIgnoreCase((String) p.get("id")))
                .findFirst()
                .map(p -> ResponseEntity.ok(Map.of("success", true, "data", p)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Package not found")));
    }

    @PatchMapping("/travel/packages/{packageId}/status")
    public ResponseEntity<Map<String, Object>> updatePackageStatus(@PathVariable String packageId, @RequestBody Map<String, String> body) {
        String newStatus = body.getOrDefault("status", "ACTIVE");
        for (Map<String, Object> p : packages) {
            if (packageId.equalsIgnoreCase((String) p.get("id"))) {
                p.put("status", newStatus);
                return ResponseEntity.ok(Map.of("success", true, "message", "Package status updated to " + newStatus, "data", p));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Package not found"));
    }

    // ==========================================
    // 3.3 ENQUIRIES & QUOTATIONS
    // ==========================================

    @GetMapping("/travel/enquiries")
    public ResponseEntity<Map<String, Object>> getEnquiries() {
        return ResponseEntity.ok(Map.of("success", true, "data", enquiries));
    }

    @PostMapping("/travel/enquiries")
    public ResponseEntity<Map<String, Object>> createEnquiry(@RequestBody Map<String, Object> req) {
        String id = "ENQ-TR-2001";
        Map<String, Object> e = new LinkedHashMap<>(req);
        e.put("id", id);
        e.putIfAbsent("stage", "NEW");
        e.put("createdAt", Instant.now().toString());
        enquiries.add(0, e);
        Map<String, Object> resp = new LinkedHashMap<>(e);
        resp.put("success", true);
        resp.put("message", "Travel enquiry created successfully");
        resp.put("data", e);
        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }

    @PostMapping("/travel/package-matches")
    public ResponseEntity<Map<String, Object>> matchPackages(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "matches", List.of(
                        Map.of("packageId", "PKG-TR-101", "name", "Dubai Explorer - 5 Days", "matchScore", 94, "estimatedPrice", 235000)
                )
        ));
    }

    @GetMapping("/travel/quotations")
    public ResponseEntity<Map<String, Object>> getQuotations() {
        return ResponseEntity.ok(Map.of("success", true, "data", quotations));
    }

    @PostMapping("/travel/quotations")
    public ResponseEntity<Map<String, Object>> createQuotation(@RequestBody Map<String, Object> req) {
        String id = "QUO-" + String.format("%03d", quotations.size() + 1);
        String quoNum = "TRV-2026-" + String.format("%03d", quotations.size() + 1);
        Map<String, Object> q = new LinkedHashMap<>(req);
        q.put("id", id);
        q.put("quotationNumber", quoNum);
        q.putIfAbsent("status", "DRAFT");
        q.putIfAbsent("currency", "INR");
        q.put("createdAt", Instant.now().toString());
        quotations.add(0, q);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "message", "Quotation created successfully", "data", q));
    }

    @PostMapping("/travel/quotations/{quotationId}/send")
    public ResponseEntity<Map<String, Object>> sendQuotation(@PathVariable String quotationId) {
        for (Map<String, Object> q : quotations) {
            if (quotationId.equalsIgnoreCase((String) q.get("id"))) {
                q.put("status", "SENT");
                return ResponseEntity.ok(Map.of("success", true, "message", "Quotation sent to customer", "data", q));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Quotation not found"));
    }

    @PostMapping("/travel/quotations/{quotationId}/accept")
    public ResponseEntity<Map<String, Object>> acceptQuotation(@PathVariable String quotationId) {
        for (Map<String, Object> q : quotations) {
            if (quotationId.equalsIgnoreCase((String) q.get("id"))) {
                q.put("status", "ACCEPTED");
                return ResponseEntity.ok(Map.of("success", true, "message", "Quotation accepted", "data", q));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Quotation not found"));
    }

    // ==========================================
    // 3.4 BOOKINGS & SUPPLIERS
    // ==========================================

    @GetMapping("/travel/bookings")
    public ResponseEntity<Map<String, Object>> getBookings() {
        return ResponseEntity.ok(Map.of("success", true, "data", bookings));
    }

    @PostMapping("/travel/bookings")
    public ResponseEntity<Map<String, Object>> createBooking(@RequestBody Map<String, Object> req) {
        String id = "BOOK-" + String.format("%03d", bookings.size() + 1);
        String ref = "ZTR-2026-" + String.format("%03d", bookings.size() + 1);
        Map<String, Object> b = new LinkedHashMap<>(req);
        b.put("id", id);
        b.put("bookingReference", ref);
        b.putIfAbsent("bookingStatus", "PENDING_CONFIRMATION");
        b.putIfAbsent("paymentStatus", "UNPAID");
        b.put("createdAt", Instant.now().toString());
        bookings.add(0, b);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "message", "Travel booking request created successfully", "data", b));
    }

    @PostMapping("/travel/bookings/{bookingId}/confirm")
    public ResponseEntity<Map<String, Object>> confirmBooking(@PathVariable String bookingId) {
        for (Map<String, Object> b : bookings) {
            if (bookingId.equalsIgnoreCase((String) b.get("id"))) {
                b.put("bookingStatus", "CONFIRMED");
                return ResponseEntity.ok(Map.of("success", true, "message", "Booking confirmed", "data", b));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Booking not found"));
    }

    @PostMapping("/travel/bookings/{bookingId}/cancel")
    public ResponseEntity<Map<String, Object>> cancelBooking(@PathVariable String bookingId) {
        for (Map<String, Object> b : bookings) {
            if (bookingId.equalsIgnoreCase((String) b.get("id"))) {
                b.put("bookingStatus", "CANCELLED");
                return ResponseEntity.ok(Map.of("success", true, "message", "Booking cancelled", "data", b));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Booking not found"));
    }

    @GetMapping("/travel/suppliers")
    public ResponseEntity<Map<String, Object>> getSuppliers() {
        return ResponseEntity.ok(Map.of("success", true, "data", suppliers));
    }

    @PostMapping("/travel/suppliers")
    public ResponseEntity<Map<String, Object>> createSupplier(@RequestBody Map<String, Object> req) {
        String id = "SUP-" + String.format("%03d", suppliers.size() + 1);
        Map<String, Object> s = new LinkedHashMap<>(req);
        s.put("id", id);
        s.putIfAbsent("status", "ACTIVE");
        suppliers.add(s);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "message", "Supplier added successfully", "data", s));
    }

    // ==========================================
    // 3.6 REPORTS
    // ==========================================

    @GetMapping("/reports/travel/revenue")
    public ResponseEntity<Map<String, Object>> getTravelRevenueReport() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of(
                        "totalQuotedValue", 1250000.00,
                        "totalConfirmedBookings", 760000.00,
                        "averageBookingValue", 38000.00,
                        "currency", "INR",
                        "topDestinations", List.of(
                                Map.of("name", "Dubai", "bookings", 28, "revenue", 480000.00),
                                Map.of("name", "Ooty", "bookings", 16, "revenue", 180000.00),
                                Map.of("name", "Bali", "bookings", 8, "revenue", 100000.00)
                        )
                )
        ));
    }
}
