package com.zenelait.crm.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.*;

/**
 * Zenelait AI CRM — Hotel Admin V1 REST API Controller
 * Implements Part B Hotel Admin API Catalogue:
 * - Hotel Profile & Properties (/api/v1/hotel/profile, /properties)
 * - Room Types & Inventory (/api/v1/hotel/properties/{id}/room-types, /rooms, /availability, /inventory, /rates, /policies)
 * - Reservations Lifecycle (/api/v1/hotel/reservations, /confirm, /cancel, /check-in, /check-out, /events, /payments)
 * - Guests & Staff (/api/v1/hotel/guests, /staff)
 * - Front Desk Operations (/api/v1/hotel/front-desk/arrivals, /departures, /queue, /rooms/housekeeping-status)
 * - Dashboard & Reports (/api/v1/hotel/dashboard, /api/v1/reports/hotel/*)
 */
@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class HotelAdminV1Controller {

    private final Map<String, Object> hotelProfile = new LinkedHashMap<>();
    private final List<Map<String, Object>> properties = new ArrayList<>();
    private final List<Map<String, Object>> roomTypes = new ArrayList<>();
    private final List<Map<String, Object>> rooms = new ArrayList<>();
    private final List<Map<String, Object>> reservations = new ArrayList<>();
    private final List<Map<String, Object>> reservationEvents = new ArrayList<>();
    private final List<Map<String, Object>> guests = new ArrayList<>();
    private final List<Map<String, Object>> staffList = new ArrayList<>();
    private final List<Map<String, Object>> ratePlans = new ArrayList<>();

    public HotelAdminV1Controller() {
        initHotelData();
    }

    private void initHotelData() {
        // Hotel Company Profile
        hotelProfile.put("id", "HOTEL-GRP-001");
        hotelProfile.put("name", "Grand Azure Resorts & Hotels");
        hotelProfile.put("corporateCode", "GA-GRP");
        hotelProfile.put("email", "admin@grandazure.com");
        hotelProfile.put("phone", "+91 44 2820 9000");
        hotelProfile.put("headquarters", "Chennai, India");
        hotelProfile.put("currency", "INR");
        hotelProfile.put("tier", "LUXURY_HOSPITALITY");

        // Properties
        Map<String, Object> prop1 = new LinkedHashMap<>();
        prop1.put("id", "PROP-001");
        prop1.put("propertyCode", "CHN-001");
        prop1.put("name", "Chennai City Hotel");
        prop1.put("propertyType", "HOTEL");
        prop1.put("city", "Chennai");
        prop1.put("state", "Tamil Nadu");
        prop1.put("country", "India");
        prop1.put("timezone", "Asia/Kolkata");
        prop1.put("currency", "INR");
        prop1.put("checkInTime", "14:00");
        prop1.put("checkOutTime", "11:00");
        prop1.put("status", "ACTIVE");
        prop1.put("totalRooms", 45);
        properties.add(prop1);

        Map<String, Object> prop2 = new LinkedHashMap<>();
        prop2.put("id", "PROP-002");
        prop2.put("propertyCode", "PND-002");
        prop2.put("name", "Pondicherry Beach Resort");
        prop2.put("propertyType", "RESORT");
        prop2.put("city", "Pondicherry");
        prop2.put("state", "Puducherry");
        prop2.put("country", "India");
        prop2.put("timezone", "Asia/Kolkata");
        prop2.put("currency", "INR");
        prop2.put("checkInTime", "15:00");
        prop2.put("checkOutTime", "12:00");
        prop2.put("status", "ACTIVE");
        prop2.put("totalRooms", 60);
        properties.add(prop2);

        // Room Types
        Map<String, Object> rt1 = new LinkedHashMap<>();
        rt1.put("id", "ROOMTYPE-001");
        rt1.put("propertyId", "PROP-001");
        rt1.put("code", "DELUXE");
        rt1.put("name", "Deluxe King Room");
        rt1.put("description", "Spacious luxury room with city views, plush king bed, workspace, and ensuite rain shower.");
        rt1.put("maxAdults", 2);
        rt1.put("maxChildren", 1);
        rt1.put("bedConfiguration", "KING");
        rt1.put("amenities", List.of("WIFI", "AIR_CONDITIONING", "SMART_TV", "MINI_BAR", "COFFEE_MAKER", "WORK_DESK"));
        rt1.put("baseRate", 4500.00);
        rt1.put("currency", "INR");
        rt1.put("totalUnits", 20);
        rt1.put("status", "ACTIVE");
        roomTypes.add(rt1);

        Map<String, Object> rt2 = new LinkedHashMap<>();
        rt2.put("id", "ROOMTYPE-002");
        rt2.put("propertyId", "PROP-001");
        rt2.put("code", "EXECUTIVE_SUITE");
        rt2.put("name", "Executive Suite");
        rt2.put("description", "Expansive 65sqm suite featuring separate living lounge, panoramic balcony, jacuzzi bathtub.");
        rt2.put("maxAdults", 3);
        rt2.put("maxChildren", 2);
        rt2.put("bedConfiguration", "KING + SOFA_BED");
        rt2.put("amenities", List.of("WIFI", "AIR_CONDITIONING", "SMART_TV", "MINI_BAR", "JACUZZI", "LOUNGE_ACCESS"));
        rt2.put("baseRate", 8500.00);
        rt2.put("currency", "INR");
        rt2.put("totalUnits", 10);
        rt2.put("status", "ACTIVE");
        roomTypes.add(rt2);

        Map<String, Object> rt3 = new LinkedHashMap<>();
        rt3.put("id", "ROOMTYPE-003");
        rt3.put("propertyId", "PROP-001");
        rt3.put("code", "STANDARD_TWIN");
        rt3.put("name", "Standard Twin Room");
        rt3.put("description", "Comfortable dual-occupancy room equipped with two twin beds, high-speed WiFi and work station.");
        rt3.put("maxAdults", 2);
        rt3.put("maxChildren", 1);
        rt3.put("bedConfiguration", "TWIN");
        rt3.put("amenities", List.of("WIFI", "AIR_CONDITIONING", "TV", "DESK"));
        rt3.put("baseRate", 3200.00);
        rt3.put("currency", "INR");
        rt3.put("totalUnits", 15);
        rt3.put("status", "ACTIVE");
        roomTypes.add(rt3);

        // Physical Rooms
        addRoom("ROOM-301", "PROP-001", "301", "ROOMTYPE-001", 3, "AVAILABLE", "CLEAN");
        addRoom("ROOM-302", "PROP-001", "302", "ROOMTYPE-001", 3, "OCCUPIED", "INSPECTED");
        addRoom("ROOM-303", "PROP-001", "303", "ROOMTYPE-001", 3, "AVAILABLE", "CLEAN");
        addRoom("ROOM-401", "PROP-001", "401", "ROOMTYPE-002", 4, "OCCUPIED", "CLEAN");
        addRoom("ROOM-402", "PROP-001", "402", "ROOMTYPE-002", 4, "AVAILABLE", "PENDING_CLEANING");
        addRoom("ROOM-201", "PROP-001", "201", "ROOMTYPE-003", 2, "AVAILABLE", "CLEAN");
        addRoom("ROOM-202", "PROP-001", "202", "ROOMTYPE-003", 2, "MAINTENANCE", "OUT_OF_SERVICE");

        // Guests
        Map<String, Object> g1 = new LinkedHashMap<>();
        g1.put("id", "GUEST-1001");
        g1.put("firstName", "Arun");
        g1.put("lastName", "Kumar");
        g1.put("name", "Arun Kumar");
        g1.put("email", "arun@example.com");
        g1.put("phone", "+91 98765 43210");
        g1.put("vipStatus", "GOLD");
        g1.put("loyaltyPoints", 1250);
        g1.put("totalVisits", 4);
        g1.put("city", "Bangalore");
        guests.add(g1);

        Map<String, Object> g2 = new LinkedHashMap<>();
        g2.put("id", "GUEST-1002");
        g2.put("firstName", "Priya");
        g2.put("lastName", "Sharma");
        g2.put("name", "Priya Sharma");
        g2.put("email", "priya@example.com");
        g2.put("phone", "+91 98765 43211");
        g2.put("vipStatus", "PLATINUM");
        g2.put("loyaltyPoints", 3400);
        g2.put("totalVisits", 8);
        g2.put("city", "Mumbai");
        guests.add(g2);

        Map<String, Object> g3 = new LinkedHashMap<>();
        g3.put("id", "GUEST-1003");
        g3.put("firstName", "David");
        g3.put("lastName", "Miller");
        g3.put("name", "David Miller");
        g3.put("email", "david.m@globalcorp.com");
        g3.put("phone", "+1 415 555 2671");
        g3.put("vipStatus", "STANDARD");
        g3.put("loyaltyPoints", 450);
        g3.put("totalVisits", 1);
        g3.put("city", "San Francisco");
        guests.add(g3);

        // Staff
        addStaff("STF-001", "Rajesh Varma", "rajesh.v@grandazure.com", "+91 98401 23456", "FRONT_DESK_MANAGER", "Front Desk", "PROP-001", "ACTIVE");
        addStaff("STF-002", "Deepa Sundaram", "deepa.s@grandazure.com", "+91 98401 23457", "RESERVATION_MANAGER", "Reservations", "PROP-001", "ACTIVE");
        addStaff("STF-003", "Karthik Nair", "karthik.n@grandazure.com", "+91 98401 23458", "FRONT_DESK_EXECUTIVE", "Front Desk", "PROP-001", "ACTIVE");
        addStaff("STF-004", "Lakshmi Devi", "lakshmi.d@grandazure.com", "+91 98401 23459", "HOUSEKEEPING_SUPERVISOR", "Housekeeping", "PROP-001", "ACTIVE");

        // Rate Plans
        Map<String, Object> rp1 = new LinkedHashMap<>();
        rp1.put("id", "RATE-001");
        rp1.put("propertyId", "PROP-001");
        rp1.put("code", "BAR_FLEX");
        rp1.put("name", "Best Available Flexible Rate");
        rp1.put("description", "Free cancellation up to 24 hours prior to check-in. Includes high speed wifi.");
        rp1.put("cancellationPolicy", "FLEXIBLE_24H");
        rp1.put("includesBreakfast", false);
        rp1.put("status", "ACTIVE");
        ratePlans.add(rp1);

        Map<String, Object> rp2 = new LinkedHashMap<>();
        rp2.put("id", "RATE-002");
        rp2.put("propertyId", "PROP-001");
        rp2.put("code", "CORP_BB");
        rp2.put("name", "Corporate Bed & Breakfast");
        rp2.put("description", "Includes complimentary buffet breakfast at Spice Route and early check-in subject to availability.");
        rp2.put("cancellationPolicy", "SAME_DAY_6PM");
        rp2.put("includesBreakfast", true);
        rp2.put("status", "ACTIVE");
        ratePlans.add(rp2);

        // Reservations
        Map<String, Object> r1 = new LinkedHashMap<>();
        r1.put("id", "RES-1001");
        r1.put("confirmationNumber", "ZHT-2026-1001");
        r1.put("propertyId", "PROP-001");
        r1.put("propertyName", "Chennai City Hotel");
        r1.put("roomTypeId", "ROOMTYPE-001");
        r1.put("roomTypeName", "Deluxe King Room");
        r1.put("assignedRoomId", "ROOM-301");
        r1.put("assignedRoomNumber", "301");
        r1.put("checkIn", "2026-11-10");
        r1.put("checkOut", "2026-11-12");
        r1.put("nights", 2);
        r1.put("adults", 2);
        r1.put("children", 0);
        r1.put("guest", g1);
        r1.put("totalAmount", 9000.00);
        r1.put("currency", "INR");
        r1.put("reservationStatus", "CONFIRMED");
        r1.put("paymentStatus", "PAID");
        r1.put("source", "ADMIN_DASHBOARD");
        r1.put("specialRequests", "Late arrival requested. Quiet floor preferred.");
        r1.put("createdAt", "2026-10-23T10:00:00Z");
        reservations.add(r1);

        Map<String, Object> r2 = new LinkedHashMap<>();
        r2.put("id", "RES-1002");
        r2.put("confirmationNumber", "ZHT-2026-1002");
        r2.put("propertyId", "PROP-001");
        r2.put("propertyName", "Chennai City Hotel");
        r2.put("roomTypeId", "ROOMTYPE-002");
        r2.put("roomTypeName", "Executive Suite");
        r2.put("assignedRoomId", "ROOM-401");
        r2.put("assignedRoomNumber", "401");
        r2.put("checkIn", "2026-10-23");
        r2.put("checkOut", "2026-10-25");
        r2.put("nights", 2);
        r2.put("adults", 2);
        r2.put("children", 1);
        r2.put("guest", g2);
        r2.put("totalAmount", 17000.00);
        r2.put("currency", "INR");
        r2.put("reservationStatus", "CHECKED_IN");
        r2.put("paymentStatus", "PAID");
        r2.put("source", "WEBSITE_BOOKING_ENGINE");
        r2.put("specialRequests", "Celebrating anniversary. High floor.");
        r2.put("createdAt", "2026-10-21T08:15:00Z");
        reservations.add(r2);

        Map<String, Object> r3 = new LinkedHashMap<>();
        r3.put("id", "RES-1003");
        r3.put("confirmationNumber", "ZHT-2026-1003");
        r3.put("propertyId", "PROP-001");
        r3.put("propertyName", "Chennai City Hotel");
        r3.put("roomTypeId", "ROOMTYPE-003");
        r3.put("roomTypeName", "Standard Twin Room");
        r3.put("assignedRoomId", null);
        r3.put("assignedRoomNumber", "UNASSIGNED");
        r3.put("checkIn", "2026-10-23");
        r3.put("checkOut", "2026-10-24");
        r3.put("nights", 1);
        r3.put("adults", 1);
        r3.put("children", 0);
        r3.put("guest", g3);
        r3.put("totalAmount", 3200.00);
        r3.put("currency", "INR");
        r3.put("reservationStatus", "PENDING_CONFIRMATION");
        r3.put("paymentStatus", "UNPAID");
        r3.put("source", "AI_RESERVATION_AGENT");
        r3.put("specialRequests", "Airport taxi pickup required.");
        r3.put("createdAt", "2026-10-23T11:45:00Z");
        reservations.add(r3);
    }

    private void addRoom(String id, String propId, String num, String typeId, int floor, String opStatus, String hkStatus) {
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("id", id);
        r.put("propertyId", propId);
        r.put("roomNumber", num);
        r.put("roomTypeId", typeId);
        r.put("floor", floor);
        r.put("operationalStatus", opStatus);
        r.put("housekeepingStatus", hkStatus);
        rooms.add(r);
    }

    private void addStaff(String id, String name, String email, String phone, String role, String dept, String propId, String status) {
        Map<String, Object> s = new LinkedHashMap<>();
        s.put("id", id);
        s.put("name", name);
        s.put("email", email);
        s.put("phone", phone);
        s.put("role", role);
        s.put("department", dept);
        s.put("propertyId", propId);
        s.put("status", status);
        staffList.add(s);
    }

    // ==========================================
    // 7.1 HOTEL PROFILE & PROPERTIES
    // ==========================================

    @GetMapping("/hotel/profile")
    public ResponseEntity<Map<String, Object>> getHotelProfile() {
        return ResponseEntity.ok(Map.of("success", true, "data", hotelProfile));
    }

    @PutMapping("/hotel/profile")
    public ResponseEntity<Map<String, Object>> updateHotelProfile(@RequestBody Map<String, Object> updates) {
        hotelProfile.putAll(updates);
        return ResponseEntity.ok(Map.of("success", true, "message", "Hotel profile updated successfully", "data", hotelProfile));
    }

    @GetMapping("/hotel/properties")
    public ResponseEntity<Map<String, Object>> getProperties() {
        return ResponseEntity.ok(Map.of("success", true, "data", properties));
    }

    @PostMapping("/hotel/properties")
    public ResponseEntity<Map<String, Object>> createProperty(@RequestBody Map<String, Object> request) {
        String propId = "PROP-" + String.format("%03d", properties.size() + 1);
        Map<String, Object> prop = new LinkedHashMap<>(request);
        prop.put("id", propId);
        prop.putIfAbsent("status", "ACTIVE");
        prop.putIfAbsent("checkInTime", "14:00");
        prop.putIfAbsent("checkOutTime", "11:00");
        properties.add(prop);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "Hotel property created successfully",
                "data", prop
        ));
    }

    @GetMapping("/hotel/properties/{propertyId}")
    public ResponseEntity<Map<String, Object>> getProperty(@PathVariable String propertyId) {
        return properties.stream()
                .filter(p -> propertyId.equalsIgnoreCase((String) p.get("id")))
                .findFirst()
                .map(p -> ResponseEntity.ok(Map.of("success", true, "data", p)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Property not found")));
    }

    @PutMapping("/hotel/properties/{propertyId}")
    public ResponseEntity<Map<String, Object>> updateProperty(@PathVariable String propertyId, @RequestBody Map<String, Object> updates) {
        for (Map<String, Object> p : properties) {
            if (propertyId.equalsIgnoreCase((String) p.get("id"))) {
                p.putAll(updates);
                return ResponseEntity.ok(Map.of("success", true, "message", "Property updated successfully", "data", p));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Property not found"));
    }

    @PatchMapping("/hotel/properties/{propertyId}/status")
    public ResponseEntity<Map<String, Object>> patchPropertyStatus(@PathVariable String propertyId, @RequestBody Map<String, String> body) {
        String newStatus = body.getOrDefault("status", "ACTIVE");
        for (Map<String, Object> p : properties) {
            if (propertyId.equalsIgnoreCase((String) p.get("id"))) {
                p.put("status", newStatus);
                return ResponseEntity.ok(Map.of("success", true, "message", "Property status changed to " + newStatus, "data", p));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Property not found"));
    }

    // ==========================================
    // 7.2 ROOM TYPES, ROOMS & AVAILABILITY
    // ==========================================

    @GetMapping("/hotel/properties/{propertyId}/room-types")
    public ResponseEntity<Map<String, Object>> getRoomTypes(@PathVariable String propertyId) {
        List<Map<String, Object>> filtered = roomTypes.stream()
                .filter(rt -> propertyId.equalsIgnoreCase((String) rt.get("propertyId")))
                .toList();
        return ResponseEntity.ok(Map.of("success", true, "data", filtered));
    }

    @PostMapping("/hotel/properties/{propertyId}/room-types")
    public ResponseEntity<Map<String, Object>> createRoomType(@PathVariable String propertyId, @RequestBody Map<String, Object> request) {
        String rtId = "ROOMTYPE-" + String.format("%03d", roomTypes.size() + 1);
        Map<String, Object> rt = new LinkedHashMap<>(request);
        rt.put("id", rtId);
        rt.put("propertyId", propertyId);
        rt.putIfAbsent("status", "ACTIVE");
        rt.putIfAbsent("currency", "INR");
        roomTypes.add(rt);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "Room type created successfully",
                "data", rt
        ));
    }

    @GetMapping("/hotel/room-types/{roomTypeId}")
    public ResponseEntity<Map<String, Object>> getRoomTypeById(@PathVariable String roomTypeId) {
        return roomTypes.stream()
                .filter(rt -> roomTypeId.equalsIgnoreCase((String) rt.get("id")))
                .findFirst()
                .map(rt -> ResponseEntity.ok(Map.of("success", true, "data", rt)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Room type not found")));
    }

    @PutMapping("/hotel/room-types/{roomTypeId}")
    public ResponseEntity<Map<String, Object>> updateRoomType(@PathVariable String roomTypeId, @RequestBody Map<String, Object> updates) {
        for (Map<String, Object> rt : roomTypes) {
            if (roomTypeId.equalsIgnoreCase((String) rt.get("id"))) {
                rt.putAll(updates);
                return ResponseEntity.ok(Map.of("success", true, "message", "Room type updated successfully", "data", rt));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Room type not found"));
    }

    @GetMapping("/hotel/properties/{propertyId}/rooms")
    public ResponseEntity<Map<String, Object>> getRoomsByProperty(@PathVariable String propertyId) {
        List<Map<String, Object>> filtered = rooms.stream()
                .filter(r -> propertyId.equalsIgnoreCase((String) r.get("propertyId")))
                .toList();
        return ResponseEntity.ok(Map.of("success", true, "data", filtered));
    }

    @PostMapping("/hotel/properties/{propertyId}/rooms")
    public ResponseEntity<Map<String, Object>> createRoom(@PathVariable String propertyId, @RequestBody Map<String, Object> req) {
        String roomNumber = String.valueOf(req.get("roomNumber"));
        String roomId = "ROOM-" + roomNumber;
        Map<String, Object> r = new LinkedHashMap<>(req);
        r.put("id", roomId);
        r.put("propertyId", propertyId);
        r.putIfAbsent("operationalStatus", "AVAILABLE");
        r.putIfAbsent("housekeepingStatus", "CLEAN");
        rooms.add(r);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "Room created successfully",
                "data", r
        ));
    }

    @PatchMapping("/hotel/rooms/{roomId}/status")
    public ResponseEntity<Map<String, Object>> updateRoomStatus(@PathVariable String roomId, @RequestBody Map<String, String> body) {
        String newStatus = body.getOrDefault("operationalStatus", "AVAILABLE");
        for (Map<String, Object> r : rooms) {
            if (roomId.equalsIgnoreCase((String) r.get("id"))) {
                r.put("operationalStatus", newStatus);
                return ResponseEntity.ok(Map.of("success", true, "message", "Room status updated to " + newStatus, "data", r));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Room not found"));
    }

    @GetMapping("/hotel/properties/{propertyId}/availability")
    public ResponseEntity<Map<String, Object>> searchAvailability(
            @PathVariable String propertyId,
            @RequestParam(required = false, defaultValue = "2026-11-10") String checkIn,
            @RequestParam(required = false, defaultValue = "2026-11-12") String checkOut,
            @RequestParam(required = false, defaultValue = "2") int adults,
            @RequestParam(required = false, defaultValue = "0") int children) {

        List<Map<String, Object>> availableRooms = new ArrayList<>();
        for (Map<String, Object> rt : roomTypes) {
            if (propertyId.equalsIgnoreCase((String) rt.get("propertyId"))) {
                Map<String, Object> av = new LinkedHashMap<>();
                av.put("roomTypeId", rt.get("id"));
                av.put("name", rt.get("name"));
                av.put("code", rt.get("code"));
                av.put("availableUnits", 4);
                av.put("pricePerNight", rt.get("baseRate"));
                double base = ((Number) rt.get("baseRate")).doubleValue();
                av.put("estimatedTotal", base * 2);
                av.put("currency", rt.get("currency"));
                av.put("maxAdults", rt.get("maxAdults"));
                av.put("maxChildren", rt.get("maxChildren"));
                availableRooms.add(av);
            }
        }

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("propertyId", propertyId);
        data.put("checkIn", checkIn);
        data.put("checkOut", checkOut);
        data.put("nights", 2);
        data.put("adults", adults);
        data.put("children", children);
        data.put("rooms", availableRooms);

        return ResponseEntity.ok(Map.of("success", true, "data", data));
    }

    @GetMapping("/hotel/properties/{propertyId}/rates")
    public ResponseEntity<Map<String, Object>> getRatePlans(@PathVariable String propertyId) {
        return ResponseEntity.ok(Map.of("success", true, "data", ratePlans));
    }

    @GetMapping("/hotel/properties/{propertyId}/policies")
    public ResponseEntity<Map<String, Object>> getPolicies(@PathVariable String propertyId) {
        Map<String, Object> policies = new LinkedHashMap<>();
        policies.put("propertyId", propertyId);
        policies.put("checkInTime", "14:00");
        policies.put("checkOutTime", "11:00");
        policies.put("cancellationPolicy", "Free cancellation up to 24 hours before check-in. Cancellations within 24h incur 1 night room charge.");
        policies.put("childPolicy", "Children under 6 stay free of charge using existing bedding.");
        policies.put("petPolicy", "Pets allowed with prior notification in designated pet-friendly suites.");
        policies.put("smokingPolicy", "All rooms and indoor areas are 100% non-smoking.");
        return ResponseEntity.ok(Map.of("success", true, "data", policies));
    }

    // ==========================================
    // 7.3 RESERVATIONS LIFECYCLE
    // ==========================================

    @GetMapping("/hotel/reservations")
    public ResponseEntity<Map<String, Object>> getReservations(
            @RequestParam(required = false) String status,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "10") int size) {

        List<Map<String, Object>> filtered = reservations.stream()
                .filter(r -> status == null || status.equalsIgnoreCase((String) r.get("reservationStatus")))
                .toList();

        Map<String, Object> pagination = Map.of(
                "page", page,
                "size", size,
                "totalElements", filtered.size(),
                "totalPages", Math.max(1, (int) Math.ceil((double) filtered.size() / size))
        );

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", filtered,
                "pagination", pagination
        ));
    }

    @PostMapping("/hotel/reservations")
    public ResponseEntity<Map<String, Object>> createReservation(@RequestBody Map<String, Object> request) {
        String resId = "RES-" + (1000 + reservations.size() + 1);
        String confNum = "ZHT-2026-" + (1000 + reservations.size() + 1);

        Map<String, Object> res = new LinkedHashMap<>(request);
        res.put("id", resId);
        res.put("confirmationNumber", confNum);
        res.putIfAbsent("reservationStatus", "PENDING_CONFIRMATION");
        res.putIfAbsent("paymentStatus", "UNPAID");
        res.putIfAbsent("currency", "INR");
        res.putIfAbsent("totalAmount", 9000.00);
        res.put("createdAt", Instant.now().toString());

        reservations.add(0, res);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "Reservation created successfully",
                "data", res
        ));
    }

    @GetMapping("/hotel/reservations/{reservationId}")
    public ResponseEntity<Map<String, Object>> getReservationDetails(@PathVariable String reservationId) {
        return reservations.stream()
                .filter(r -> reservationId.equalsIgnoreCase((String) r.get("id")))
                .findFirst()
                .map(r -> ResponseEntity.ok(Map.of("success", true, "data", r)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Reservation not found")));
    }

    @PatchMapping("/hotel/reservations/{reservationId}/status")
    public ResponseEntity<Map<String, Object>> updateReservationStatus(@PathVariable String reservationId, @RequestBody Map<String, String> body) {
        String newStatus = body.getOrDefault("status", "CONFIRMED");
        for (Map<String, Object> r : reservations) {
            if (reservationId.equalsIgnoreCase((String) r.get("id"))) {
                r.put("reservationStatus", newStatus);
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Reservation status updated to " + newStatus,
                        "data", Map.of("reservationId", reservationId, "reservationStatus", newStatus, "updatedAt", Instant.now().toString())
                ));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Reservation not found"));
    }

    @PostMapping("/hotel/reservations/{reservationId}/confirm")
    public ResponseEntity<Map<String, Object>> confirmReservation(@PathVariable String reservationId, @RequestBody(required = false) Map<String, Object> body) {
        for (Map<String, Object> r : reservations) {
            if (reservationId.equalsIgnoreCase((String) r.get("id"))) {
                r.put("reservationStatus", "CONFIRMED");
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Reservation confirmed successfully",
                        "data", Map.of(
                                "id", reservationId,
                                "confirmationNumber", r.get("confirmationNumber"),
                                "reservationStatus", "CONFIRMED",
                                "notificationStatus", "QUEUED"
                        )
                ));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Reservation not found"));
    }

    @PostMapping("/hotel/reservations/{reservationId}/cancel")
    public ResponseEntity<Map<String, Object>> cancelReservation(@PathVariable String reservationId, @RequestBody(required = false) Map<String, Object> body) {
        for (Map<String, Object> r : reservations) {
            if (reservationId.equalsIgnoreCase((String) r.get("id"))) {
                r.put("reservationStatus", "CANCELLED");
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Cancellation processed successfully",
                        "data", Map.of(
                                "reservationId", reservationId,
                                "reservationStatus", "CANCELLED",
                                "refundStatus", "NOT_APPLICABLE",
                                "cancelledAt", Instant.now().toString()
                        )
                ));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Reservation not found"));
    }

    @PostMapping("/hotel/reservations/{reservationId}/check-in")
    public ResponseEntity<Map<String, Object>> checkInGuest(@PathVariable String reservationId, @RequestBody Map<String, Object> body) {
        String assignedRoom = String.valueOf(body.getOrDefault("roomId", "ROOM-301"));
        for (Map<String, Object> r : reservations) {
            if (reservationId.equalsIgnoreCase((String) r.get("id"))) {
                r.put("reservationStatus", "CHECKED_IN");
                r.put("assignedRoomId", assignedRoom);
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Guest checked in successfully",
                        "data", Map.of(
                                "reservationId", reservationId,
                                "roomId", assignedRoom,
                                "reservationStatus", "CHECKED_IN",
                                "checkedInAt", Instant.now().toString()
                        )
                ));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Reservation not found"));
    }

    @PostMapping("/hotel/reservations/{reservationId}/check-out")
    public ResponseEntity<Map<String, Object>> checkOutGuest(@PathVariable String reservationId, @RequestBody(required = false) Map<String, Object> body) {
        for (Map<String, Object> r : reservations) {
            if (reservationId.equalsIgnoreCase((String) r.get("id"))) {
                r.put("reservationStatus", "CHECKED_OUT");
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Guest checked out successfully",
                        "data", Map.of(
                                "reservationId", reservationId,
                                "reservationStatus", "CHECKED_OUT",
                                "checkedOutAt", Instant.now().toString(),
                                "housekeepingStatus", "PENDING_CLEANING"
                        )
                ));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Reservation not found"));
    }

    // ==========================================
    // 7.4 GUESTS & STAFF
    // ==========================================

    @GetMapping("/hotel/guests")
    public ResponseEntity<Map<String, Object>> getGuests() {
        return ResponseEntity.ok(Map.of("success", true, "data", guests));
    }

    @PostMapping("/hotel/guests")
    public ResponseEntity<Map<String, Object>> createGuest(@RequestBody Map<String, Object> req) {
        String gId = "GUEST-" + (1000 + guests.size() + 1);
        Map<String, Object> g = new LinkedHashMap<>(req);
        g.put("id", gId);
        g.putIfAbsent("vipStatus", "STANDARD");
        g.putIfAbsent("loyaltyPoints", 100);
        guests.add(g);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "message", "Guest profile created", "data", g));
    }

    @GetMapping("/hotel/staff")
    public ResponseEntity<Map<String, Object>> getStaff() {
        return ResponseEntity.ok(Map.of("success", true, "data", staffList));
    }

    // ==========================================
    // 7.5 FRONT DESK OPERATIONS
    // ==========================================

    @GetMapping("/hotel/admin/front-desk/arrivals")
    public ResponseEntity<Map<String, Object>> getExpectedArrivalsToday() {
        List<Map<String, Object>> arrivals = reservations.stream()
                .filter(r -> "CONFIRMED".equalsIgnoreCase((String) r.get("reservationStatus")) || "PENDING_CONFIRMATION".equalsIgnoreCase((String) r.get("reservationStatus")))
                .toList();
        return ResponseEntity.ok(Map.of("success", true, "data", arrivals, "count", arrivals.size()));
    }

    @GetMapping("/hotel/admin/front-desk/departures")
    public ResponseEntity<Map<String, Object>> getExpectedDeparturesToday() {
        List<Map<String, Object>> departures = reservations.stream()
                .filter(r -> "CHECKED_IN".equalsIgnoreCase((String) r.get("reservationStatus")))
                .toList();
        return ResponseEntity.ok(Map.of("success", true, "data", departures, "count", departures.size()));
    }

    @GetMapping("/hotel/front-desk/queue")
    public ResponseEntity<Map<String, Object>> getFrontDeskQueue() {
        Map<String, Object> queue = new LinkedHashMap<>();
        queue.put("priorityGuestArrivals", 3);
        queue.put("expressCheckoutsPending", 2);
        queue.put("luggageAssistanceRequests", 1);
        queue.put("airportTransfersScheduled", 4);
        return ResponseEntity.ok(Map.of("success", true, "data", queue));
    }

    @GetMapping("/hotel/rooms/housekeeping-status")
    public ResponseEntity<Map<String, Object>> getHousekeepingStatus() {
        long clean = rooms.stream().filter(r -> "CLEAN".equalsIgnoreCase((String) r.get("housekeepingStatus"))).count();
        long pending = rooms.stream().filter(r -> "PENDING_CLEANING".equalsIgnoreCase((String) r.get("housekeepingStatus"))).count();
        long inspected = rooms.stream().filter(r -> "INSPECTED".equalsIgnoreCase((String) r.get("housekeepingStatus"))).count();
        long outOfService = rooms.stream().filter(r -> "OUT_OF_SERVICE".equalsIgnoreCase((String) r.get("housekeepingStatus"))).count();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("clean", clean);
        stats.put("pendingCleaning", pending);
        stats.put("inspected", inspected);
        stats.put("outOfService", outOfService);
        stats.put("rooms", rooms);

        return ResponseEntity.ok(Map.of("success", true, "data", stats));
    }

    @PatchMapping("/hotel/rooms/{roomId}/housekeeping-status")
    public ResponseEntity<Map<String, Object>> updateHousekeepingStatus(@PathVariable String roomId, @RequestBody Map<String, String> body) {
        String newStatus = body.getOrDefault("housekeepingStatus", "CLEAN");
        for (Map<String, Object> r : rooms) {
            if (roomId.equalsIgnoreCase((String) r.get("id"))) {
                r.put("housekeepingStatus", newStatus);
                return ResponseEntity.ok(Map.of("success", true, "message", "Housekeeping status set to " + newStatus, "data", r));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Room not found"));
    }

    // ==========================================
    // 7.8 HOTEL DASHBOARD & REPORTS
    // ==========================================

    @GetMapping("/hotel/dashboard")
    public ResponseEntity<Map<String, Object>> getHotelDashboard(
            @RequestParam(required = false, defaultValue = "PROP-001") String propertyId,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {

        long totalRes = reservations.size();
        long pendingRes = reservations.stream().filter(r -> "PENDING_CONFIRMATION".equalsIgnoreCase((String) r.get("reservationStatus"))).count();
        long confirmedRes = reservations.stream().filter(r -> "CONFIRMED".equalsIgnoreCase((String) r.get("reservationStatus"))).count();
        long cancelledRes = reservations.stream().filter(r -> "CANCELLED".equalsIgnoreCase((String) r.get("reservationStatus"))).count();

        Map<String, Object> metrics = new LinkedHashMap<>();
        metrics.put("totalReservations", 320 + totalRes);
        metrics.put("pendingReservations", 15 + pendingRes);
        metrics.put("confirmedReservations", 240 + confirmedRes);
        metrics.put("cancelledReservations", 20 + cancelledRes);
        metrics.put("expectedArrivalsToday", 12);
        metrics.put("expectedDeparturesToday", 9);
        metrics.put("openEnquiries", 28);

        Map<String, Object> occupancy = new LinkedHashMap<>();
        occupancy.put("occupiedRoomNights", 410);
        occupancy.put("availableRoomNights", 575);
        occupancy.put("occupancyRate", 71.30);

        Map<String, Object> revenue = new LinkedHashMap<>();
        revenue.put("roomRevenue", 850000.00);
        revenue.put("currency", "INR");

        Map<String, Object> ai = new LinkedHashMap<>();
        ai.put("totalConversations", 640);
        ai.put("resolvedWithoutHuman", 460);
        ai.put("escalatedToHuman", 180);
        ai.put("resolutionRate", 71.88);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("propertyId", propertyId);
        data.put("period", Map.of("from", from != null ? from : "2026-10-01", "to", to != null ? to : "2026-10-23"));
        data.put("metrics", metrics);
        data.put("occupancy", occupancy);
        data.put("revenue", revenue);
        data.put("ai", ai);

        return ResponseEntity.ok(Map.of("success", true, "data", data));
    }

    @GetMapping("/reports/hotel/reservations")
    public ResponseEntity<Map<String, Object>> getHotelReservationsReport() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of(
                        "totalBookings", 320,
                        "directWebBookings", 185,
                        "aiAgentBookings", 92,
                        "otaBookings", 43,
                        "averageStayNights", 2.4,
                        "cancellationRatePercent", 6.25
                )
        ));
    }

    @GetMapping("/reports/hotel/occupancy")
    public ResponseEntity<Map<String, Object>> getHotelOccupancyReport() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of(
                        "occupancyRate", 71.30,
                        "availableRooms", 45,
                        "averageDailyRate", 5200.00,
                        "revPAR", 3707.60,
                        "monthlyTrend", List.of(
                                Map.of("week", "W1", "rate", 68.5),
                                Map.of("week", "W2", "rate", 74.0),
                                Map.of("week", "W3", "rate", 71.3),
                                Map.of("week", "W4", "rate", 72.8)
                        )
                )
        ));
    }

    @GetMapping("/reports/hotel/revenue")
    public ResponseEntity<Map<String, Object>> getHotelRevenueReport() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of(
                        "totalRevenue", 1250000.00,
                        "roomRevenue", 850000.00,
                        "foodAndBeverage", 280000.00,
                        "spaAndWellness", 85000.00,
                        "transfers", 35000.00,
                        "currency", "INR"
                )
        ));
    }

    @GetMapping("/reports/hotel/room-performance")
    public ResponseEntity<Map<String, Object>> getRoomPerformanceReport() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", List.of(
                        Map.of("roomTypeCode", "DELUXE", "name", "Deluxe King Room", "totalNightsSold", 220, "revenue", 990000.00, "occupancy", 78.5),
                        Map.of("roomTypeCode", "EXECUTIVE_SUITE", "name", "Executive Suite", "totalNightsSold", 95, "revenue", 807500.00, "occupancy", 65.0),
                        Map.of("roomTypeCode", "STANDARD_TWIN", "name", "Standard Twin Room", "totalNightsSold", 140, "revenue", 448000.00, "occupancy", 72.1)
                )
        ));
    }
}
