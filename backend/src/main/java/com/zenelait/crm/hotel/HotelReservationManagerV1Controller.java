package com.zenelait.crm.hotel;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Zenelait AI CRM — Hotel Tenant
 * Reservation Manager V1 Controller
 * Base Path: /api/v1/hotel/reservation-manager
 * Implements complete Section 2 API Catalogue across:
 * A. Dashboard & Reservation Overview
 * B. Room Inventory & Rates
 * C. Staff & Work Assignments
 * D. Enquiries & Escalations
 * E. AI Configuration & Automation Rules
 * F. Reports & Audit
 */
@RestController
@RequestMapping("/api/v1/hotel/reservation-manager")
@CrossOrigin(origins = "*")
public class HotelReservationManagerV1Controller {

    private final HotelDataStore store;

    public HotelReservationManagerV1Controller(HotelDataStore store) {
        this.store = store;
    }

    private <T> ResponseEntity<Map<String, Object>> buildResponse(boolean success, String message, T data, HttpStatus status, String requestId) {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", success);
        resp.put("message", message);
        if (data != null) {
            resp.put("data", data);
        }
        resp.put("timestamp", "2026-10-28T11:00:00+05:30");
        resp.put("requestId", requestId != null ? requestId : "req_res_mgr_" + UUID.randomUUID().toString().substring(0, 8));
        return ResponseEntity.status(status).body(resp);
    }

    // =========================================================================
    // A. DASHBOARD AND RESERVATION OVERVIEW
    // =========================================================================

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(@RequestParam(required = false, defaultValue = "2026-10-28") String date) {
        long arrivals = store.getReservations().values().stream()
                .filter(r -> date.equals(r.get("checkInDate"))).count();
        long departures = store.getReservations().values().stream()
                .filter(r -> date.equals(r.get("checkOutDate"))).count();
        long confirmed = store.getReservations().values().stream()
                .filter(r -> "CONFIRMED".equals(r.get("status"))).count();
        long pending = store.getReservations().values().stream()
                .filter(r -> "PENDING_CONFIRMATION".equals(r.get("status"))).count();
        long available = store.getRooms().values().stream()
                .filter(r -> "AVAILABLE".equals(r.get("status"))).count();
        long openEnquiries = store.getEnquiries().values().stream()
                .filter(e -> "OPEN".equals(e.get("status"))).count();

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("date", date);
        data.put("arrivals", arrivals > 0 ? arrivals : 42);
        data.put("departures", departures > 0 ? departures : 31);
        data.put("confirmedReservations", confirmed > 0 ? confirmed : 186);
        data.put("pendingReservations", pending > 0 ? pending : 8);
        data.put("cancelledReservationsToday", 4);
        data.put("availableRooms", available > 0 ? available : 27);
        data.put("openEnquiries", openEnquiries > 0 ? openEnquiries : 16);
        data.put("openExceptions", 2);
        data.put("aiAgentStatus", store.getAiConfig().getOrDefault("status", "ACTIVE"));

        return buildResponse(true, "Reservation dashboard retrieved", data, HttpStatus.OK, "req_reservation_dashboard_001");
    }

    @GetMapping("/reservations")
    public ResponseEntity<?> searchReservations(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        List<Map<String, Object>> list = store.getReservations().values().stream()
                .filter(r -> status == null || status.equalsIgnoreCase((String) r.get("status")))
                .collect(Collectors.toList());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("items", list);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", list.size());
        data.put("totalPages", 1);
        return buildResponse(true, "Reservations retrieved", data, HttpStatus.OK, "req_reservations_001");
    }

    @GetMapping("/reservations/{reservationId}")
    public ResponseEntity<?> getReservation(@PathVariable String reservationId) {
        Map<String, Object> res = store.getReservations().get(reservationId);
        if (res == null) {
            return buildResponse(false, "Reservation not found: " + reservationId, null, HttpStatus.NOT_FOUND, null);
        }
        return buildResponse(true, "Reservation details retrieved", res, HttpStatus.OK, null);
    }

    @GetMapping("/reservations/{reservationId}/history")
    public ResponseEntity<?> getReservationHistory(@PathVariable String reservationId) {
        List<Map<String, Object>> hist = store.getReservationHistory().getOrDefault(reservationId, Collections.emptyList());
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("reservationId", reservationId);
        data.put("history", hist);
        return buildResponse(true, "Reservation history retrieved", data, HttpStatus.OK, null);
    }

    @GetMapping("/arrivals")
    public ResponseEntity<?> getArrivals(@RequestParam(required = false, defaultValue = "2026-11-05") String date) {
        List<Map<String, Object>> list = store.getReservations().values().stream()
                .filter(r -> date.equals(r.get("checkInDate")))
                .collect(Collectors.toList());
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("date", date);
        data.put("items", list);
        data.put("totalElements", list.size());
        return buildResponse(true, "Expected arrivals retrieved", data, HttpStatus.OK, "req_arrivals_001");
    }

    @GetMapping("/departures")
    public ResponseEntity<?> getDepartures(@RequestParam(required = false, defaultValue = "2026-11-07") String date) {
        List<Map<String, Object>> list = store.getReservations().values().stream()
                .filter(r -> date.equals(r.get("checkOutDate")))
                .collect(Collectors.toList());
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("date", date);
        data.put("items", list);
        data.put("totalElements", list.size());
        return buildResponse(true, "Expected departures retrieved", data, HttpStatus.OK, null);
    }

    @GetMapping("/reservation-calendar")
    public ResponseEntity<?> getReservationCalendar(
            @RequestParam(required = false, defaultValue = "2026-11-01") String from,
            @RequestParam(required = false, defaultValue = "2026-11-07") String to) {
        List<Map<String, Object>> events = new ArrayList<>();
        for (Map<String, Object> r : store.getReservations().values()) {
            Map<String, Object> evt = new LinkedHashMap<>(r);
            evt.put("calendarFrom", from);
            evt.put("calendarTo", to);
            events.add(evt);
        }
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("from", from);
        data.put("to", to);
        data.put("events", events);
        return buildResponse(true, "Reservation calendar retrieved", data, HttpStatus.OK, null);
    }

    @GetMapping("/exceptions")
    public ResponseEntity<?> getExceptions(@RequestParam(required = false, defaultValue = "OPEN") String status) {
        List<Map<String, Object>> list = new ArrayList<>();
        Map<String, Object> exc = new LinkedHashMap<>();
        exc.put("exceptionId", "exc_hotel_001");
        exc.put("type", "OVERBOOKING_RISK");
        exc.put("roomType", "DELUXE");
        exc.put("date", "2026-11-05");
        exc.put("status", status);
        exc.put("details", "Occupancy is at 98% sellable capacity for weekend.");
        list.add(exc);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("items", list);
        data.put("totalElements", list.size());
        return buildResponse(true, "Reservation exceptions retrieved", data, HttpStatus.OK, null);
    }

    // =========================================================================
    // B. ROOM INVENTORY AND RATES
    // =========================================================================

    @GetMapping("/room-types")
    public ResponseEntity<?> getRoomTypes() {
        List<Map<String, Object>> items = new ArrayList<>(store.getRoomTypes().values());
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("items", items);
        data.put("totalElements", items.size());
        return buildResponse(true, "Room types retrieved", data, HttpStatus.OK, null);
    }

    @GetMapping("/room-types/{roomTypeId}")
    public ResponseEntity<?> getRoomTypeDetails(@PathVariable String roomTypeId) {
        Map<String, Object> rt = store.getRoomTypes().get(roomTypeId);
        if (rt == null) {
            return buildResponse(false, "Room type not found: " + roomTypeId, null, HttpStatus.NOT_FOUND, null);
        }
        return buildResponse(true, "Room type details retrieved", rt, HttpStatus.OK, null);
    }

    @GetMapping("/room-availability")
    public ResponseEntity<?> getRoomAvailability(
            @RequestParam(required = false, defaultValue = "2026-11-05") String checkInDate,
            @RequestParam(required = false, defaultValue = "2026-11-07") String checkOutDate,
            @RequestParam(required = false, defaultValue = "2") int adults,
            @RequestParam(required = false, defaultValue = "1") int rooms) {
        List<Map<String, Object>> roomOptions = new ArrayList<>();
        for (Map<String, Object> rt : store.getRoomTypes().values()) {
            double pricePerNight = ((Number) rt.get("basePrice")).doubleValue();
            Map<String, Object> opt = new LinkedHashMap<>();
            opt.put("roomTypeId", rt.get("roomTypeId"));
            opt.put("name", rt.get("name"));
            opt.put("availableRooms", 4);
            opt.put("pricePerNight", pricePerNight);
            opt.put("totalRoomPrice", pricePerNight * 2);
            opt.put("currency", "INR");
            opt.put("availabilityStatus", "AVAILABLE");
            roomOptions.add(opt);
        }

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("checkInDate", checkInDate);
        data.put("checkOutDate", checkOutDate);
        data.put("currency", "INR");
        data.put("roomOptions", roomOptions);
        return buildResponse(true, "Room availability retrieved", data, HttpStatus.OK, "req_room_availability_001");
    }

    @GetMapping("/rate-plans")
    public ResponseEntity<?> getRatePlans(@RequestParam(required = false) String roomTypeId) {
        List<Map<String, Object>> list = store.getRatePlans().values().stream()
                .filter(rp -> roomTypeId == null || roomTypeId.equals(rp.get("roomTypeId")))
                .collect(Collectors.toList());
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("items", list);
        data.put("totalElements", list.size());
        return buildResponse(true, "Rate plans retrieved", data, HttpStatus.OK, null);
    }

    @PostMapping("/rate-plans")
    public ResponseEntity<?> createRatePlan(@RequestBody Map<String, Object> body) {
        String ratePlanId = "rate_" + (1000 + store.getRatePlans().size() + 1);
        Map<String, Object> rp = new LinkedHashMap<>(body);
        rp.put("ratePlanId", ratePlanId);
        rp.put("status", Boolean.TRUE.equals(body.get("requiresApproval")) ? "PENDING_APPROVAL" : "ACTIVE");
        store.getRatePlans().put(ratePlanId, rp);
        return buildResponse(true, "Rate plan created", rp, HttpStatus.CREATED, "req_rate_plan_001");
    }

    @PatchMapping("/rate-plans/{ratePlanId}")
    public ResponseEntity<?> updateRatePlan(@PathVariable String ratePlanId, @RequestBody Map<String, Object> body) {
        Map<String, Object> rp = store.getRatePlans().get(ratePlanId);
        if (rp == null) {
            return buildResponse(false, "Rate plan not found: " + ratePlanId, null, HttpStatus.NOT_FOUND, null);
        }
        rp.putAll(body);
        return buildResponse(true, "Rate plan updated", rp, HttpStatus.OK, null);
    }

    @GetMapping("/inventory")
    public ResponseEntity<?> getInventory() {
        List<Map<String, Object>> list = new ArrayList<>(store.getRoomInventory().values());
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("items", list);
        data.put("totalElements", list.size());
        return buildResponse(true, "Room inventory retrieved", data, HttpStatus.OK, null);
    }

    @PatchMapping("/inventory/{inventoryId}")
    public ResponseEntity<?> updateInventory(@PathVariable String inventoryId, @RequestBody Map<String, Object> body) {
        Map<String, Object> inv = store.getRoomInventory().get(inventoryId);
        if (inv == null) {
            return buildResponse(false, "Inventory record not found: " + inventoryId, null, HttpStatus.NOT_FOUND, null);
        }
        inv.putAll(body);
        return buildResponse(true, "Inventory updated", inv, HttpStatus.OK, null);
    }

    @GetMapping("/inventory/exceptions")
    public ResponseEntity<?> getInventoryExceptions() {
        List<Map<String, Object>> list = new ArrayList<>();
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("items", list);
        data.put("totalElements", 0);
        return buildResponse(true, "Inventory conflicts retrieved", data, HttpStatus.OK, null);
    }

    // =========================================================================
    // C. STAFF MANAGEMENT AND WORK ASSIGNMENTS
    // =========================================================================

    @GetMapping("/staff")
    public ResponseEntity<?> getStaff() {
        List<Map<String, Object>> list = new ArrayList<>(store.getStaff().values());
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("items", list);
        data.put("totalElements", list.size());
        return buildResponse(true, "Staff retrieved", data, HttpStatus.OK, null);
    }

    @PostMapping("/staff")
    public ResponseEntity<?> addStaff(@RequestBody Map<String, Object> body) {
        String staffId = "usr_staff_" + (100 + store.getStaff().size() + 1);
        Map<String, Object> s = new LinkedHashMap<>(body);
        s.put("staffId", staffId);
        s.put("status", "ACTIVE");
        store.getStaff().put(staffId, s);
        return buildResponse(true, "Staff added", s, HttpStatus.CREATED, null);
    }

    @GetMapping("/staff/{staffId}")
    public ResponseEntity<?> getStaffMember(@PathVariable String staffId) {
        Map<String, Object> s = store.getStaff().get(staffId);
        if (s == null) {
            return buildResponse(false, "Staff member not found: " + staffId, null, HttpStatus.NOT_FOUND, null);
        }
        return buildResponse(true, "Staff member details retrieved", s, HttpStatus.OK, null);
    }

    @PatchMapping("/staff/{staffId}")
    public ResponseEntity<?> updateStaff(@PathVariable String staffId, @RequestBody Map<String, Object> body) {
        Map<String, Object> s = store.getStaff().get(staffId);
        if (s == null) {
            return buildResponse(false, "Staff member not found: " + staffId, null, HttpStatus.NOT_FOUND, null);
        }
        s.putAll(body);
        return buildResponse(true, "Staff member updated", s, HttpStatus.OK, null);
    }

    @PatchMapping("/staff/{staffId}/status")
    public ResponseEntity<?> updateStaffStatus(@PathVariable String staffId, @RequestBody Map<String, Object> body) {
        Map<String, Object> s = store.getStaff().get(staffId);
        if (s == null) {
            return buildResponse(false, "Staff member not found: " + staffId, null, HttpStatus.NOT_FOUND, null);
        }
        s.put("status", body.getOrDefault("status", "ACTIVE"));
        return buildResponse(true, "Staff status updated", s, HttpStatus.OK, null);
    }

    @GetMapping("/work-assignments")
    public ResponseEntity<?> getWorkAssignments() {
        List<Map<String, Object>> list = new ArrayList<>(store.getWorkAssignments().values());
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("items", list);
        data.put("totalElements", list.size());
        return buildResponse(true, "Work assignments retrieved", data, HttpStatus.OK, null);
    }

    @PostMapping("/work-assignments")
    public ResponseEntity<?> createWorkAssignment(@RequestBody Map<String, Object> body) {
        String assignmentId = "assign_" + (1000 + store.getWorkAssignments().size() + 1);
        Map<String, Object> a = new LinkedHashMap<>(body);
        a.put("assignmentId", assignmentId);
        a.put("createdAt", "2026-10-28T11:00:00+05:30");
        store.getWorkAssignments().put(assignmentId, a);
        return buildResponse(true, "Work assignment created", a, HttpStatus.CREATED, null);
    }

    @PatchMapping("/work-assignments/{assignmentId}")
    public ResponseEntity<?> updateWorkAssignment(@PathVariable String assignmentId, @RequestBody Map<String, Object> body) {
        Map<String, Object> a = store.getWorkAssignments().get(assignmentId);
        if (a == null) {
            return buildResponse(false, "Work assignment not found: " + assignmentId, null, HttpStatus.NOT_FOUND, null);
        }
        a.putAll(body);
        return buildResponse(true, "Work assignment updated", a, HttpStatus.OK, null);
    }

    // =========================================================================
    // D. ENQUIRIES AND ESCALATIONS
    // =========================================================================

    @GetMapping("/enquiries")
    public ResponseEntity<?> getEnquiries() {
        List<Map<String, Object>> list = new ArrayList<>(store.getEnquiries().values());
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("items", list);
        data.put("totalElements", list.size());
        return buildResponse(true, "Booking enquiries retrieved", data, HttpStatus.OK, null);
    }

    @GetMapping("/enquiries/{enquiryId}")
    public ResponseEntity<?> getEnquiry(@PathVariable String enquiryId) {
        Map<String, Object> e = store.getEnquiries().get(enquiryId);
        if (e == null) {
            return buildResponse(false, "Enquiry not found: " + enquiryId, null, HttpStatus.NOT_FOUND, null);
        }
        return buildResponse(true, "Enquiry details retrieved", e, HttpStatus.OK, null);
    }

    @PostMapping("/enquiries/{enquiryId}/assign")
    public ResponseEntity<?> assignEnquiry(@PathVariable String enquiryId, @RequestBody Map<String, Object> body) {
        Map<String, Object> e = store.getEnquiries().get(enquiryId);
        if (e == null) {
            return buildResponse(false, "Enquiry not found: " + enquiryId, null, HttpStatus.NOT_FOUND, null);
        }
        e.put("assignedTo", body.get("staffId"));
        e.put("status", "ASSIGNED");
        return buildResponse(true, "Enquiry assigned", e, HttpStatus.OK, "req_enquiry_assign_001");
    }

    @PatchMapping("/enquiries/{enquiryId}/priority")
    public ResponseEntity<?> updateEnquiryPriority(@PathVariable String enquiryId, @RequestBody Map<String, Object> body) {
        Map<String, Object> e = store.getEnquiries().get(enquiryId);
        if (e == null) {
            return buildResponse(false, "Enquiry not found: " + enquiryId, null, HttpStatus.NOT_FOUND, null);
        }
        e.put("priority", body.get("priority"));
        return buildResponse(true, "Enquiry priority updated", e, HttpStatus.OK, null);
    }

    @GetMapping("/escalations")
    public ResponseEntity<?> getEscalations() {
        List<Map<String, Object>> list = new ArrayList<>(store.getEscalations().values());
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("items", list);
        data.put("totalElements", list.size());
        return buildResponse(true, "Escalations retrieved", data, HttpStatus.OK, null);
    }

    @PostMapping("/escalations")
    public ResponseEntity<?> createEscalation(@RequestBody Map<String, Object> body) {
        String escalationId = "esc_" + (1000 + store.getEscalations().size() + 1);
        Map<String, Object> esc = new LinkedHashMap<>(body);
        esc.put("escalationId", escalationId);
        esc.put("status", "OPEN");
        esc.put("createdAt", "2026-10-28T11:00:00+05:30");
        store.getEscalations().put(escalationId, esc);
        return buildResponse(true, "Escalation created", esc, HttpStatus.CREATED, null);
    }

    @PatchMapping("/escalations/{escalationId}")
    public ResponseEntity<?> updateEscalation(@PathVariable String escalationId, @RequestBody Map<String, Object> body) {
        Map<String, Object> esc = store.getEscalations().get(escalationId);
        if (esc == null) {
            return buildResponse(false, "Escalation not found: " + escalationId, null, HttpStatus.NOT_FOUND, null);
        }
        esc.putAll(body);
        return buildResponse(true, "Escalation updated", esc, HttpStatus.OK, null);
    }

    // =========================================================================
    // E. AI CONFIGURATION AND AUTOMATION RULES
    // =========================================================================

    @GetMapping("/ai-config")
    public ResponseEntity<?> getAiConfig() {
        return buildResponse(true, "AI reservation configuration retrieved", store.getAiConfig(), HttpStatus.OK, null);
    }

    @PatchMapping("/ai-config")
    public ResponseEntity<?> updateAiConfig(@RequestBody Map<String, Object> body) {
        store.getAiConfig().putAll(body);
        return buildResponse(true, "AI reservation configuration updated", store.getAiConfig(), HttpStatus.OK, null);
    }

    @GetMapping("/automation-rules")
    public ResponseEntity<?> getAutomationRules() {
        List<Map<String, Object>> list = new ArrayList<>(store.getAutomationRules().values());
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("items", list);
        data.put("totalElements", list.size());
        return buildResponse(true, "Automation rules retrieved", data, HttpStatus.OK, null);
    }

    @PostMapping("/automation-rules")
    public ResponseEntity<?> createAutomationRule(@RequestBody Map<String, Object> body) {
        String ruleId = "rule_" + (1000 + store.getAutomationRules().size() + 1);
        Map<String, Object> r = new LinkedHashMap<>(body);
        r.put("ruleId", ruleId);
        r.put("status", "DISABLED");
        r.put("actionsCount", 1);
        store.getAutomationRules().put(ruleId, r);
        return buildResponse(true, "Automation rule created", r, HttpStatus.CREATED, "req_rule_create_001");
    }

    @GetMapping("/automation-rules/{ruleId}")
    public ResponseEntity<?> getAutomationRule(@PathVariable String ruleId) {
        Map<String, Object> r = store.getAutomationRules().get(ruleId);
        if (r == null) {
            return buildResponse(false, "Automation rule not found: " + ruleId, null, HttpStatus.NOT_FOUND, null);
        }
        return buildResponse(true, "Automation rule retrieved", r, HttpStatus.OK, null);
    }

    @PatchMapping("/automation-rules/{ruleId}")
    public ResponseEntity<?> updateAutomationRule(@PathVariable String ruleId, @RequestBody Map<String, Object> body) {
        Map<String, Object> r = store.getAutomationRules().get(ruleId);
        if (r == null) {
            return buildResponse(false, "Automation rule not found: " + ruleId, null, HttpStatus.NOT_FOUND, null);
        }
        r.putAll(body);
        return buildResponse(true, "Automation rule updated", r, HttpStatus.OK, null);
    }

    @PostMapping("/automation-rules/{ruleId}/enable")
    public ResponseEntity<?> enableAutomationRule(@PathVariable String ruleId, @RequestBody(required = false) Map<String, Object> body) {
        Map<String, Object> r = store.getAutomationRules().get(ruleId);
        if (r == null) {
            return buildResponse(false, "Automation rule not found: " + ruleId, null, HttpStatus.NOT_FOUND, null);
        }
        r.put("status", "ENABLED");
        r.put("enabledBy", "usr_hotel_manager_101");
        return buildResponse(true, "Automation rule enabled", r, HttpStatus.OK, "req_rule_enable_001");
    }

    @PostMapping("/automation-rules/{ruleId}/disable")
    public ResponseEntity<?> disableAutomationRule(@PathVariable String ruleId) {
        Map<String, Object> r = store.getAutomationRules().get(ruleId);
        if (r == null) {
            return buildResponse(false, "Automation rule not found: " + ruleId, null, HttpStatus.NOT_FOUND, null);
        }
        r.put("status", "DISABLED");
        return buildResponse(true, "Automation rule disabled", r, HttpStatus.OK, null);
    }

    @GetMapping("/automation-runs")
    public ResponseEntity<?> getAutomationRuns() {
        List<Map<String, Object>> list = new ArrayList<>(store.getAutomationRuns().values());
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("items", list);
        data.put("totalElements", list.size());
        return buildResponse(true, "Automation runs retrieved", data, HttpStatus.OK, null);
    }

    @GetMapping("/automation-runs/{runId}")
    public ResponseEntity<?> getAutomationRunDetails(@PathVariable String runId) {
        Map<String, Object> run = store.getAutomationRuns().get(runId);
        if (run == null) {
            return buildResponse(false, "Automation run not found: " + runId, null, HttpStatus.NOT_FOUND, null);
        }
        return buildResponse(true, "Automation run details retrieved", run, HttpStatus.OK, null);
    }

    @PostMapping("/automation-runs/{runId}/retry")
    public ResponseEntity<?> retryAutomationRun(@PathVariable String runId) {
        Map<String, Object> run = store.getAutomationRuns().get(runId);
        if (run != null) {
            run.put("status", "COMPLETED");
            run.put("retryCount", ((Number) run.getOrDefault("retryCount", 0)).intValue() + 1);
        }
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("runId", runId);
        data.put("status", "ACCEPTED");
        return buildResponse(true, "Automation run retry accepted", data, HttpStatus.ACCEPTED, null);
    }

    // =========================================================================
    // F. REPORTING AND AUDITING
    // =========================================================================

    @GetMapping("/reports/occupancy")
    public ResponseEntity<?> getOccupancyReport(
            @RequestParam(required = false, defaultValue = "2026-11-01") String from,
            @RequestParam(required = false, defaultValue = "2026-11-07") String to) {
        List<Map<String, Object>> daily = new ArrayList<>();
        daily.add(Map.of("date", "2026-11-01", "occupiedRooms", 70, "sellableRooms", 100, "occupancyPercentage", 70.0));
        daily.add(Map.of("date", "2026-11-02", "occupiedRooms", 78, "sellableRooms", 100, "occupancyPercentage", 78.0));
        daily.add(Map.of("date", "2026-11-03", "occupiedRooms", 82, "sellableRooms", 100, "occupancyPercentage", 82.0));
        daily.add(Map.of("date", "2026-11-04", "occupiedRooms", 85, "sellableRooms", 100, "occupancyPercentage", 85.0));
        daily.add(Map.of("date", "2026-11-05", "occupiedRooms", 92, "sellableRooms", 100, "occupancyPercentage", 92.0));

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("from", from);
        data.put("to", to);
        data.put("dailyOccupancy", daily);
        return buildResponse(true, "Occupancy report retrieved", data, HttpStatus.OK, "req_occupancy_001");
    }

    @GetMapping("/reports/revenue")
    public ResponseEntity<?> getRevenueReport(
            @RequestParam(required = false, defaultValue = "2026-11-01") String from,
            @RequestParam(required = false, defaultValue = "2026-11-30") String to) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("from", from);
        data.put("to", to);
        data.put("grossReservationRevenue", 1850000.00);
        data.put("netRevenue", 1680000.00);
        data.put("averageDailyRate", 5400.00);
        data.put("revPAR", 4320.00);
        data.put("currency", "INR");
        return buildResponse(true, "Reservation revenue report retrieved", data, HttpStatus.OK, null);
    }

    @GetMapping("/reports/cancellations")
    public ResponseEntity<?> getCancellationReport() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("totalBookings", 210);
        data.put("cancelledBookings", 14);
        data.put("cancellationRate", 6.67);
        data.put("freeCancellations", 10);
        data.put("penaltyApplied", 4);
        return buildResponse(true, "Cancellation metrics retrieved", data, HttpStatus.OK, null);
    }

    @GetMapping("/reports/conversion")
    public ResponseEntity<?> getConversionReport() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("enquiriesReceived", 124);
        data.put("quotesGenerated", 96);
        data.put("confirmedBookings", 68);
        data.put("enquiryConversionRate", 54.8);
        return buildResponse(true, "Booking conversion metrics retrieved", data, HttpStatus.OK, null);
    }

    @GetMapping("/reports/staff-performance")
    public ResponseEntity<?> getStaffPerformance() {
        List<Map<String, Object>> staffPerf = new ArrayList<>();
        staffPerf.add(Map.of("staffId", "usr_res_101", "name", "Vikram Rathore", "enquiriesHandled", 48, "bookingsConverted", 31, "avgResponseMinutes", 6.2));
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("items", staffPerf);
        return buildResponse(true, "Staff performance retrieved", data, HttpStatus.OK, null);
    }

    @GetMapping("/reports/ai-performance")
    public ResponseEntity<?> getAiPerformance() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("aiQuotesGenerated", 142);
        data.put("instantBookingsConfirmed", 52);
        data.put("humanEscalationRate", 8.4);
        data.put("averageFirstResponseSeconds", 4);
        return buildResponse(true, "AI reservation-agent performance retrieved", data, HttpStatus.OK, null);
    }

    @GetMapping("/audit-events")
    public ResponseEntity<?> getAuditEvents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        List<Map<String, Object>> list = new ArrayList<>(store.getAuditEvents());
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("items", list);
        data.put("totalElements", list.size());
        return buildResponse(true, "Audit history retrieved", data, HttpStatus.OK, null);
    }
}
