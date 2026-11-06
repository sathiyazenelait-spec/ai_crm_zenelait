package com.zenelait.crm.hotel;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Zenelait AI CRM — Hotel Tenant
 * Reservation Executive V1 Controller
 * Base Path: /api/v1/hotel/reservation-executive
 * Implements complete Section 3.2 API Catalogue:
 * - Room availability and rate discovery
 * - Guest registration and profiles
 * - Reservation quotations and creation
 * - Booking confirmations, modifications, and cancellations
 * - Enquiries, activities, and follow-ups
 * - Confirmation messages and issue escalation
 */
@RestController
@RequestMapping("/api/v1/hotel/reservation-executive")
@CrossOrigin(origins = "*")
public class HotelReservationExecutiveV1Controller {

    private final HotelDataStore store;

    public HotelReservationExecutiveV1Controller(HotelDataStore store) {
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
        resp.put("requestId", requestId != null ? requestId : "req_res_exec_" + UUID.randomUUID().toString().substring(0, 8));
        return ResponseEntity.status(status).body(resp);
    }

    // 1. GET /dashboard
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("enquiriesToday", 28);
        data.put("quotesActive", 14);
        data.put("confirmedBookingsToday", 9);
        data.put("pendingFollowUps", 7);
        data.put("cancellationsRequested", 2);
        data.put("averageQuoteConversion", 62.5);
        return buildResponse(true, "Reservation executive dashboard retrieved", data, HttpStatus.OK, null);
    }

    // 2. GET /room-types
    @GetMapping("/room-types")
    public ResponseEntity<?> getRoomTypes() {
        List<Map<String, Object>> list = new ArrayList<>(store.getRoomTypes().values());
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("items", list);
        data.put("totalElements", list.size());
        return buildResponse(true, "Room types retrieved", data, HttpStatus.OK, null);
    }

    // 3. GET /room-availability
    @GetMapping("/room-availability")
    public ResponseEntity<?> getRoomAvailability(
            @RequestParam(required = false, defaultValue = "2026-11-05") String checkInDate,
            @RequestParam(required = false, defaultValue = "2026-11-07") String checkOutDate) {
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
            roomOptions.add(opt);
        }
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("checkInDate", checkInDate);
        data.put("checkOutDate", checkOutDate);
        data.put("roomOptions", roomOptions);
        return buildResponse(true, "Available room options retrieved", data, HttpStatus.OK, null);
    }

    // 4. GET /rate-plans
    @GetMapping("/rate-plans")
    public ResponseEntity<?> getRatePlans(@RequestParam(required = false) String roomTypeId) {
        List<Map<String, Object>> list = store.getRatePlans().values().stream()
                .filter(rp -> roomTypeId == null || roomTypeId.equals(rp.get("roomTypeId")))
                .collect(Collectors.toList());
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("items", list);
        data.put("totalElements", list.size());
        return buildResponse(true, "Applicable rate plans retrieved", data, HttpStatus.OK, null);
    }

    // 5. POST /availability/search
    @PostMapping("/availability/search")
    public ResponseEntity<?> searchAvailabilityStructured(@RequestBody Map<String, Object> body) {
        String checkInDate = (String) body.getOrDefault("checkInDate", "2026-11-05");
        String checkOutDate = (String) body.getOrDefault("checkOutDate", "2026-11-07");

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
            roomOptions.add(opt);
        }

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("searchId", "search_" + UUID.randomUUID().toString().substring(0, 8));
        data.put("checkInDate", checkInDate);
        data.put("checkOutDate", checkOutDate);
        data.put("roomOptions", roomOptions);
        return buildResponse(true, "Availability search completed", data, HttpStatus.OK, "req_availability_001");
    }

    // 6. POST /guests
    @PostMapping("/guests")
    public ResponseEntity<?> createGuest(@RequestBody Map<String, Object> body) {
        String guestId = "guest_" + (1000 + store.getGuests().size() + 1);
        Map<String, Object> g = new LinkedHashMap<>(body);
        g.put("guestId", guestId);
        g.put("hotelId", "hotel_1001");
        g.put("verificationStatus", "PENDING");
        store.getGuests().put(guestId, g);
        return buildResponse(true, "Guest created", g, HttpStatus.CREATED, "req_guest_create_001");
    }

    // 7. GET /guests
    @GetMapping("/guests")
    public ResponseEntity<?> searchGuests(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        List<Map<String, Object>> list = store.getGuests().values().stream()
                .filter(g -> search == null || ((String) g.get("firstName")).toLowerCase().contains(search.toLowerCase())
                        || ((String) g.get("lastName")).toLowerCase().contains(search.toLowerCase())
                        || ((String) g.get("email")).toLowerCase().contains(search.toLowerCase()))
                .collect(Collectors.toList());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("items", list);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", list.size());
        return buildResponse(true, "Guest records retrieved", data, HttpStatus.OK, null);
    }

    // 8. GET /guests/{guestId}
    @GetMapping("/guests/{guestId}")
    public ResponseEntity<?> getGuest(@PathVariable String guestId) {
        Map<String, Object> g = store.getGuests().get(guestId);
        if (g == null) {
            return buildResponse(false, "Guest not found: " + guestId, null, HttpStatus.NOT_FOUND, null);
        }
        return buildResponse(true, "Guest details retrieved", g, HttpStatus.OK, null);
    }

    // 9. PATCH /guests/{guestId}
    @PatchMapping("/guests/{guestId}")
    public ResponseEntity<?> updateGuest(@PathVariable String guestId, @RequestBody Map<String, Object> body) {
        Map<String, Object> g = store.getGuests().get(guestId);
        if (g == null) {
            return buildResponse(false, "Guest not found: " + guestId, null, HttpStatus.NOT_FOUND, null);
        }
        g.putAll(body);
        return buildResponse(true, "Guest details updated", g, HttpStatus.OK, null);
    }

    // 10. POST /reservations/quotes
    @PostMapping("/reservations/quotes")
    public ResponseEntity<?> generateQuote(@RequestBody Map<String, Object> body) {
        String quoteId = "quote_" + (1000 + store.getQuotes().size() + 1);
        String roomTypeId = (String) body.getOrDefault("roomTypeId", "roomtype_1001");
        Map<String, Object> rt = store.getRoomTypes().getOrDefault(roomTypeId, store.getRoomTypes().values().iterator().next());
        double basePrice = ((Number) rt.getOrDefault("basePrice", 4500.00)).doubleValue();

        int nights = 2;
        double subtotal = basePrice * nights;
        double taxes = subtotal * 0.18;
        double total = subtotal + taxes;

        Map<String, Object> q = new LinkedHashMap<>();
        q.put("quoteId", quoteId);
        q.put("guestId", body.get("guestId"));
        q.put("roomTypeId", roomTypeId);
        q.put("roomType", rt.get("name"));
        q.put("nights", nights);
        q.put("roomSubtotal", subtotal);
        q.put("taxes", taxes);
        q.put("totalAmount", total);
        q.put("currency", "INR");
        q.put("status", "VALID");
        q.put("expiresAt", "2026-10-28T18:00:00+05:30");
        store.getQuotes().put(quoteId, q);

        return buildResponse(true, "Reservation quote generated", q, HttpStatus.OK, "req_quote_001");
    }

    // 11. GET /reservations/quotes/{quoteId}
    @GetMapping("/reservations/quotes/{quoteId}")
    public ResponseEntity<?> getQuote(@PathVariable String quoteId) {
        Map<String, Object> q = store.getQuotes().get(quoteId);
        if (q == null) {
            return buildResponse(false, "Quote not found: " + quoteId, null, HttpStatus.NOT_FOUND, null);
        }
        return buildResponse(true, "Quote details retrieved", q, HttpStatus.OK, null);
    }

    // 12. POST /reservations
    @PostMapping("/reservations")
    public ResponseEntity<?> createReservation(@RequestBody Map<String, Object> body) {
        String resId = "res_" + (1000 + store.getReservations().size() + 1);
        String confNum = "GH-2026-" + (1000 + store.getReservations().size() + 1);

        Map<String, Object> res = new LinkedHashMap<>(body);
        res.put("reservationId", resId);
        res.put("confirmationNumber", confNum);
        res.put("hotelId", "hotel_1001");
        res.put("status", "PENDING_CONFIRMATION");
        res.put("paymentStatus", "PENDING");
        res.put("currency", "INR");
        res.put("totalAmount", body.getOrDefault("totalAmount", 10620.00));
        res.put("createdAt", "2026-10-28T11:00:00+05:30");
        store.getReservations().put(resId, res);

        List<Map<String, Object>> hist = new ArrayList<>();
        hist.add(Map.of("action", "CREATED", "status", "PENDING_CONFIRMATION", "timestamp", "2026-10-28T11:00:00+05:30", "actor", "RESERVATION_EXECUTIVE"));
        store.getReservationHistory().put(resId, hist);

        return buildResponse(true, "Reservation created", res, HttpStatus.CREATED, "req_reservation_create_001");
    }

    // 13. GET /reservations
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
        data.put("totalElements", list.size());
        return buildResponse(true, "Reservation list retrieved", data, HttpStatus.OK, null);
    }

    // 14. GET /reservations/{reservationId}
    @GetMapping("/reservations/{reservationId}")
    public ResponseEntity<?> getReservation(@PathVariable String reservationId) {
        Map<String, Object> res = store.getReservations().get(reservationId);
        if (res == null) {
            return buildResponse(false, "Reservation not found: " + reservationId, null, HttpStatus.NOT_FOUND, null);
        }
        return buildResponse(true, "Reservation details retrieved", res, HttpStatus.OK, null);
    }

    // 15. PATCH /reservations/{reservationId}
    @PatchMapping("/reservations/{reservationId}")
    public ResponseEntity<?> updateReservation(@PathVariable String reservationId, @RequestBody Map<String, Object> body) {
        Map<String, Object> res = store.getReservations().get(reservationId);
        if (res == null) {
            return buildResponse(false, "Reservation not found: " + reservationId, null, HttpStatus.NOT_FOUND, null);
        }
        res.putAll(body);
        return buildResponse(true, "Reservation updated", res, HttpStatus.OK, null);
    }

    // 16. GET /reservations/{reservationId}/history
    @GetMapping("/reservations/{reservationId}/history")
    public ResponseEntity<?> getReservationHistory(@PathVariable String reservationId) {
        List<Map<String, Object>> hist = store.getReservationHistory().getOrDefault(reservationId, Collections.emptyList());
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("reservationId", reservationId);
        data.put("history", hist);
        return buildResponse(true, "Reservation history retrieved", data, HttpStatus.OK, null);
    }

    // 17. POST /reservations/{reservationId}/confirm
    @PostMapping("/reservations/{reservationId}/confirm")
    public ResponseEntity<?> confirmReservation(@PathVariable String reservationId, @RequestBody(required = false) Map<String, Object> body) {
        Map<String, Object> res = store.getReservations().get(reservationId);
        if (res == null) {
            return buildResponse(false, "Reservation not found: " + reservationId, null, HttpStatus.NOT_FOUND, null);
        }
        res.put("status", "CONFIRMED");
        res.put("paymentStatus", "PAID");

        List<Map<String, Object>> hist = store.getReservationHistory().computeIfAbsent(reservationId, k -> new ArrayList<>());
        hist.add(Map.of("action", "CONFIRMED", "status", "CONFIRMED", "timestamp", "2026-10-28T11:00:00+05:30", "actor", "RESERVATION_EXECUTIVE"));

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("reservationId", reservationId);
        data.put("status", "CONFIRMED");
        data.put("confirmationNumber", res.get("confirmationNumber"));
        data.put("confirmationMessageStatus", "QUEUED");
        return buildResponse(true, "Reservation confirmation processed", data, HttpStatus.OK, "req_reservation_confirm_001");
    }

    // 18. POST /reservations/{reservationId}/modification-requests
    @PostMapping("/reservations/{reservationId}/modification-requests")
    public ResponseEntity<?> requestModification(@PathVariable String reservationId, @RequestBody Map<String, Object> body) {
        String modId = "mod_" + (1000 + store.getModificationRequests().size() + 1);
        Map<String, Object> mod = new LinkedHashMap<>(body);
        mod.put("modificationRequestId", modId);
        mod.put("reservationId", reservationId);
        mod.put("status", "PENDING_REVIEW");
        mod.put("requiresAvailabilityRecheck", true);
        store.getModificationRequests().put(modId, mod);

        return buildResponse(true, "Modification request created", mod, HttpStatus.OK, "req_modification_001");
    }

    // 19. POST /reservations/{reservationId}/cancellation-requests
    @PostMapping("/reservations/{reservationId}/cancellation-requests")
    public ResponseEntity<?> requestCancellation(@PathVariable String reservationId, @RequestBody Map<String, Object> body) {
        String cancelId = "cancel_" + (1000 + store.getCancellationRequests().size() + 1);
        Map<String, Object> c = new LinkedHashMap<>(body);
        c.put("cancellationRequestId", cancelId);
        c.put("reservationId", reservationId);
        c.put("status", "PENDING_REVIEW");
        c.put("refundAssessmentStatus", "NOT_YET_ASSESSED");
        store.getCancellationRequests().put(cancelId, c);

        return buildResponse(true, "Cancellation request created", c, HttpStatus.OK, "req_cancellation_001");
    }

    // 20. GET /enquiries
    @GetMapping("/enquiries")
    public ResponseEntity<?> getEnquiries() {
        List<Map<String, Object>> list = new ArrayList<>(store.getEnquiries().values());
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("items", list);
        data.put("totalElements", list.size());
        return buildResponse(true, "Enquiry list retrieved", data, HttpStatus.OK, null);
    }

    // 21. POST /enquiries
    @PostMapping("/enquiries")
    public ResponseEntity<?> createEnquiry(@RequestBody Map<String, Object> body) {
        String enquiryId = "enq_" + (1000 + store.getEnquiries().size() + 1);
        Map<String, Object> e = new LinkedHashMap<>(body);
        e.put("enquiryId", enquiryId);
        e.put("status", "OPEN");
        e.put("createdAt", "2026-10-28T11:00:00+05:30");
        store.getEnquiries().put(enquiryId, e);
        return buildResponse(true, "Enquiry created", e, HttpStatus.CREATED, "req_enquiry_create_001");
    }

    // 22. GET /enquiries/{enquiryId}
    @GetMapping("/enquiries/{enquiryId}")
    public ResponseEntity<?> getEnquiry(@PathVariable String enquiryId) {
        Map<String, Object> e = store.getEnquiries().get(enquiryId);
        if (e == null) {
            return buildResponse(false, "Enquiry not found: " + enquiryId, null, HttpStatus.NOT_FOUND, null);
        }
        return buildResponse(true, "Enquiry details retrieved", e, HttpStatus.OK, null);
    }

    // 23. PATCH /enquiries/{enquiryId}
    @PatchMapping("/enquiries/{enquiryId}")
    public ResponseEntity<?> updateEnquiry(@PathVariable String enquiryId, @RequestBody Map<String, Object> body) {
        Map<String, Object> e = store.getEnquiries().get(enquiryId);
        if (e == null) {
            return buildResponse(false, "Enquiry not found: " + enquiryId, null, HttpStatus.NOT_FOUND, null);
        }
        e.putAll(body);
        return buildResponse(true, "Enquiry updated", e, HttpStatus.OK, null);
    }

    // 24. POST /enquiries/{enquiryId}/assign
    @PostMapping("/enquiries/{enquiryId}/assign")
    public ResponseEntity<?> assignEnquiry(@PathVariable String enquiryId, @RequestBody Map<String, Object> body) {
        Map<String, Object> e = store.getEnquiries().get(enquiryId);
        if (e == null) {
            return buildResponse(false, "Enquiry not found: " + enquiryId, null, HttpStatus.NOT_FOUND, null);
        }
        e.put("assignedTo", body.get("staffId"));
        e.put("status", "ASSIGNED");
        return buildResponse(true, "Enquiry assigned", e, HttpStatus.OK, null);
    }

    // 25. POST /enquiries/{enquiryId}/activities
    @PostMapping("/enquiries/{enquiryId}/activities")
    public ResponseEntity<?> recordEnquiryActivity(@PathVariable String enquiryId, @RequestBody Map<String, Object> body) {
        String actId = "act_" + System.currentTimeMillis();
        Map<String, Object> act = new LinkedHashMap<>(body);
        act.put("activityId", actId);
        act.put("enquiryId", enquiryId);
        act.put("timestamp", "2026-10-28T11:00:00+05:30");

        store.getEnquiryActivities().computeIfAbsent(enquiryId, k -> new ArrayList<>()).add(act);
        return buildResponse(true, "Activity recorded", act, HttpStatus.CREATED, null);
    }

    // 26. GET /enquiries/{enquiryId}/activities
    @GetMapping("/enquiries/{enquiryId}/activities")
    public ResponseEntity<?> getEnquiryActivities(@PathVariable String enquiryId) {
        List<Map<String, Object>> acts = store.getEnquiryActivities().getOrDefault(enquiryId, Collections.emptyList());
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("enquiryId", enquiryId);
        data.put("items", acts);
        return buildResponse(true, "Activity history retrieved", data, HttpStatus.OK, null);
    }

    // 27. GET /follow-ups
    @GetMapping("/follow-ups")
    public ResponseEntity<?> getFollowUps(@RequestParam(required = false) String status) {
        List<Map<String, Object>> list = store.getFollowUps().values().stream()
                .filter(fu -> status == null || status.equalsIgnoreCase((String) fu.get("status")))
                .collect(Collectors.toList());
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("items", list);
        data.put("totalElements", list.size());
        return buildResponse(true, "Follow-ups retrieved", data, HttpStatus.OK, null);
    }

    // 28. POST /follow-ups
    @PostMapping("/follow-ups")
    public ResponseEntity<?> createFollowUp(@RequestBody Map<String, Object> body) {
        String taskId = "followup_" + (1000 + store.getFollowUps().size() + 1);
        Map<String, Object> fu = new LinkedHashMap<>(body);
        fu.put("taskId", taskId);
        fu.put("status", "PENDING");
        store.getFollowUps().put(taskId, fu);
        return buildResponse(true, "Follow-up created", fu, HttpStatus.CREATED, "req_followup_001");
    }

    // 29. PATCH /follow-ups/{taskId}
    @PatchMapping("/follow-ups/{taskId}")
    public ResponseEntity<?> updateFollowUp(@PathVariable String taskId, @RequestBody Map<String, Object> body) {
        Map<String, Object> fu = store.getFollowUps().get(taskId);
        if (fu == null) {
            return buildResponse(false, "Follow-up not found: " + taskId, null, HttpStatus.NOT_FOUND, null);
        }
        fu.putAll(body);
        return buildResponse(true, "Follow-up updated", fu, HttpStatus.OK, null);
    }

    // 30. POST /follow-ups/{taskId}/complete
    @PostMapping("/follow-ups/{taskId}/complete")
    public ResponseEntity<?> completeFollowUp(@PathVariable String taskId, @RequestBody(required = false) Map<String, Object> body) {
        Map<String, Object> fu = store.getFollowUps().get(taskId);
        if (fu == null) {
            return buildResponse(false, "Follow-up not found: " + taskId, null, HttpStatus.NOT_FOUND, null);
        }
        fu.put("status", "COMPLETED");
        if (body != null && body.containsKey("completionNote")) {
            fu.put("completionNote", body.get("completionNote"));
        }
        return buildResponse(true, "Follow-up completed", fu, HttpStatus.OK, null);
    }

    // 31. POST /messages/confirmation-drafts
    @PostMapping("/messages/confirmation-drafts")
    public ResponseEntity<?> createConfirmationDraft(@RequestBody Map<String, Object> body) {
        String draftId = "draft_" + UUID.randomUUID().toString().substring(0, 8);
        Map<String, Object> d = new LinkedHashMap<>();
        d.put("draftId", draftId);
        d.put("reservationId", body.get("reservationId"));
        d.put("channel", body.getOrDefault("channel", "EMAIL"));
        d.put("subject", "Your Booking at Grand Azure Resort is Confirmed!");
        d.put("body", "Dear Guest, We are delighted to confirm your upcoming stay from " + body.getOrDefault("checkInDate", "2026-11-05") + ". We look forward to welcoming you.");
        d.put("status", "PENDING_APPROVAL");
        return buildResponse(true, "Confirmation draft generated", d, HttpStatus.OK, null);
    }

    // 32. POST /messages/{draftId}/send
    @PostMapping("/messages/{draftId}/send")
    public ResponseEntity<?> sendConfirmationMessage(@PathVariable String draftId) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("draftId", draftId);
        data.put("deliveryStatus", "SENT");
        data.put("sentAt", "2026-10-28T11:00:00+05:30");
        return buildResponse(true, "Approved message send request accepted", data, HttpStatus.OK, null);
    }

    // 33. POST /reservations/{reservationId}/escalate
    @PostMapping("/reservations/{reservationId}/escalate")
    public ResponseEntity<?> escalateReservation(@PathVariable String reservationId, @RequestBody Map<String, Object> body) {
        String escId = "esc_" + (1000 + store.getEscalations().size() + 1);
        Map<String, Object> esc = new LinkedHashMap<>(body);
        esc.put("escalationId", escId);
        esc.put("reservationId", reservationId);
        esc.put("status", "OPEN");
        esc.put("queue", "RESERVATION_MANAGEMENT");
        store.getEscalations().put(escId, esc);
        return buildResponse(true, "Reservation escalated", esc, HttpStatus.OK, null);
    }
}
