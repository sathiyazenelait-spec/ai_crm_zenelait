package com.zenelait.crm.hotel;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/v1/hotel/front-desk")
@CrossOrigin(origins = "*")
public class HotelFrontDeskV1Controller {

    @Autowired
    private HotelDataStore store;

    private String getTenantId(String tenantHeader) {
        return (tenantHeader != null && !tenantHeader.isBlank()) ? tenantHeader : "tenant-6";
    }

    private Map<String, Object> standardResponse(boolean success, String message, Object data, String reqId) {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", success);
        resp.put("message", message);
        resp.put("data", data);
        resp.put("timestamp", OffsetDateTime.now().toString());
        resp.put("requestId", reqId != null ? reqId : "req_" + UUID.randomUUID().toString().substring(0, 8));
        return resp;
    }

    // A. Dashboard & Arrivals
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(
            @RequestParam(required = false) String date,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        return ResponseEntity.ok(standardResponse(true, "Front Desk dashboard retrieved",
                store.getFrontDeskDashboard(tenantId, date), "req_frontdesk_dashboard_001"));
    }

    @GetMapping("/arrivals")
    public ResponseEntity<Map<String, Object>> getArrivals(
            @RequestParam(required = false) String date,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> arrivals = store.getArrivals(tenantId, date);
        Map<String, Object> paged = new LinkedHashMap<>();
        paged.put("items", arrivals);
        paged.put("page", page);
        paged.put("size", size);
        paged.put("totalElements", arrivals.size());
        paged.put("totalPages", 1);
        return ResponseEntity.ok(standardResponse(true, "Expected arrivals retrieved", paged, "req_arrivals_001"));
    }

    @GetMapping("/departures")
    public ResponseEntity<Map<String, Object>> getDepartures(
            @RequestParam(required = false) String date,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> departures = store.getDepartures(tenantId, date);
        return ResponseEntity.ok(standardResponse(true, "Expected departures retrieved", departures, "req_departures_001"));
    }

    @GetMapping("/in-house-guests")
    public ResponseEntity<Map<String, Object>> getInHouseGuests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> inHouse = store.getInHouseGuests(tenantId);
        Map<String, Object> paged = new LinkedHashMap<>();
        paged.put("items", inHouse);
        paged.put("page", page);
        paged.put("size", size);
        paged.put("totalElements", inHouse.size());
        paged.put("totalPages", 1);
        return ResponseEntity.ok(standardResponse(true, "In-house guest list retrieved", paged, "req_inhouse_001"));
    }

    @GetMapping("/reservations")
    public ResponseEntity<Map<String, Object>> getReservations(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> paged = store.getReservations(tenantId, status, search, page, size);
        return ResponseEntity.ok(standardResponse(true, "Authorized reservation list retrieved", paged, "req_res_list_001"));
    }

    @GetMapping("/reservations/{reservationId}")
    public ResponseEntity<Map<String, Object>> getReservation(
            @PathVariable String reservationId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> res = store.getReservation(tenantId, reservationId);
        if (res == null) {
            return ResponseEntity.status(404).body(standardResponse(false, "Reservation not found", null, "req_err_404"));
        }
        return ResponseEntity.ok(standardResponse(true, "Reservation details retrieved", res, "req_res_get_001"));
    }

    @GetMapping("/reservations/{reservationId}/history")
    public ResponseEntity<Map<String, Object>> getReservationHistory(
            @PathVariable String reservationId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> history = store.getReservationHistory(tenantId, reservationId);
        return ResponseEntity.ok(standardResponse(true, "Reservation history retrieved", history, "req_res_hist_001"));
    }

    // B. Guest Management
    @GetMapping("/guests")
    public ResponseEntity<Map<String, Object>> getGuests(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> paged = store.getGuests(tenantId, search, page, size);
        return ResponseEntity.ok(standardResponse(true, "Guests retrieved", paged, "req_guests_001"));
    }

    @PostMapping("/guests")
    public ResponseEntity<Map<String, Object>> registerGuest(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> guest = store.createGuest(tenantId, body);
        return ResponseEntity.ok(standardResponse(true, "Guest registered", guest, "req_guest_reg_001"));
    }

    @GetMapping("/guests/{guestId}")
    public ResponseEntity<Map<String, Object>> getGuest(
            @PathVariable String guestId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> guest = store.getGuest(tenantId, guestId);
        if (guest == null) {
            return ResponseEntity.status(404).body(standardResponse(false, "Guest not found", null, "req_err_404"));
        }
        return ResponseEntity.ok(standardResponse(true, "Guest details retrieved", guest, "req_guest_get_001"));
    }

    @PatchMapping("/guests/{guestId}")
    public ResponseEntity<Map<String, Object>> updateGuest(
            @PathVariable String guestId,
            @RequestBody Map<String, Object> updates,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> guest = store.updateGuest(tenantId, guestId, updates);
        return ResponseEntity.ok(standardResponse(true, "Permitted guest profile fields updated", guest, "req_guest_patch_001"));
    }

    @PostMapping("/guests/{guestId}/verification")
    public ResponseEntity<Map<String, Object>> recordGuestVerification(
            @PathVariable String guestId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> res = store.recordGuestVerification(tenantId, guestId, body);
        return ResponseEntity.ok(standardResponse(true, "Verification status recorded", res, "req_guest_verif_001"));
    }

    @GetMapping("/guests/{guestId}/stay-history")
    public ResponseEntity<Map<String, Object>> getGuestStayHistory(
            @PathVariable String guestId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> stays = store.getGuestStayHistory(tenantId, guestId);
        return ResponseEntity.ok(standardResponse(true, "Authorized stay history retrieved", stays, "req_guest_stays_001"));
    }

    // C. Room Assignment & Check-in
    @GetMapping("/room-availability")
    public ResponseEntity<Map<String, Object>> getAssignableRooms(
            @RequestParam(required = false) String reservationId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> assignable = store.getAssignableRooms(tenantId, reservationId);
        return ResponseEntity.ok(standardResponse(true, "Assignable rooms retrieved", assignable, "req_assignable_rooms_001"));
    }

    @GetMapping("/rooms")
    public ResponseEntity<Map<String, Object>> getRooms(
            @RequestParam(required = false) String status,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> rooms = store.getRooms(tenantId, status);
        return ResponseEntity.ok(standardResponse(true, "Rooms list retrieved", rooms, "req_rooms_001"));
    }

    @GetMapping("/rooms/{roomId}")
    public ResponseEntity<Map<String, Object>> getRoom(
            @PathVariable String roomId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> room = store.getRoom(tenantId, roomId);
        if (room == null) {
            return ResponseEntity.status(404).body(standardResponse(false, "Room not found", null, "req_err_404"));
        }
        return ResponseEntity.ok(standardResponse(true, "Room details retrieved", room, "req_room_get_001"));
    }

    @GetMapping("/reservations/{reservationId}/check-in-eligibility")
    public ResponseEntity<Map<String, Object>> evaluateCheckInEligibility(
            @PathVariable String reservationId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> elig = store.evaluateCheckInEligibility(tenantId, reservationId);
        return ResponseEntity.ok(standardResponse(true, "Check-in eligibility evaluated", elig, "req_checkin_eligibility_001"));
    }

    @PostMapping("/reservations/{reservationId}/room-assignment")
    public ResponseEntity<Map<String, Object>> assignRoomToReservation(
            @PathVariable String reservationId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> assignment = store.assignRoomToReservation(tenantId, reservationId, body);
        return ResponseEntity.ok(standardResponse(true, "Room assignment processed", assignment, "req_room_assignment_001"));
    }

    @PostMapping("/reservations/{reservationId}/check-in")
    public ResponseEntity<Map<String, Object>> processCheckIn(
            @PathVariable String reservationId,
            @RequestBody(required = false) Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> checkIn = store.processCheckIn(tenantId, reservationId, body);
        return ResponseEntity.ok(standardResponse(true, "Check-in processed", checkIn, "req_checkin_001"));
    }

    @PostMapping("/reservations/{reservationId}/check-in-validation")
    public ResponseEntity<Map<String, Object>> validateCheckIn(
            @PathVariable String reservationId,
            @RequestBody(required = false) Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> val = store.evaluateCheckInEligibility(tenantId, reservationId);
        return ResponseEntity.ok(standardResponse(true, "Check-in validation completed", val, "req_checkin_val_001"));
    }

    @PostMapping("/room-move-requests")
    public ResponseEntity<Map<String, Object>> createRoomMoveRequest(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> req = store.createRoomMoveRequest(tenantId, body);
        return ResponseEntity.ok(standardResponse(true, "Room-change request created", req, "req_roommove_create_001"));
    }

    @GetMapping("/room-move-requests")
    public ResponseEntity<Map<String, Object>> getRoomMoveRequests(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> moves = store.getRoomMoveRequests(tenantId);
        return ResponseEntity.ok(standardResponse(true, "Room-change request list retrieved", moves, "req_roommoves_list_001"));
    }

    @PostMapping("/room-move-requests/{requestId}/approve")
    public ResponseEntity<Map<String, Object>> approveRoomMoveRequest(
            @PathVariable String requestId,
            @RequestBody(required = false) Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> app = store.approveRoomMoveRequest(tenantId, requestId, body);
        return ResponseEntity.ok(standardResponse(true, "Authorized room move request approved", app, "req_roommove_app_001"));
    }

    @PostMapping("/room-move-requests/{requestId}/complete")
    public ResponseEntity<Map<String, Object>> completeRoomMoveRequest(
            @PathVariable String requestId,
            @RequestBody(required = false) Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> comp = store.completeRoomMoveRequest(tenantId, requestId, body);
        return ResponseEntity.ok(standardResponse(true, "Room move completed", comp, "req_roommove_comp_001"));
    }

    // D. In-stay Service & Reception
    @GetMapping("/guest-requests")
    public ResponseEntity<Map<String, Object>> getGuestRequests(
            @RequestParam(required = false) String status,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = store.getServiceRequests(tenantId, status, null);
        return ResponseEntity.ok(standardResponse(true, "Guest requests retrieved", list, "req_guest_req_list_001"));
    }

    @PostMapping("/guest-requests")
    public ResponseEntity<Map<String, Object>> createGuestRequest(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> req = store.createServiceRequest(tenantId, body);
        return ResponseEntity.ok(standardResponse(true, "Guest request created", req, "req_guest_request_001"));
    }

    @GetMapping("/guest-requests/{requestId}")
    public ResponseEntity<Map<String, Object>> getGuestRequest(
            @PathVariable String requestId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> req = store.getServiceRequest(tenantId, requestId);
        if (req == null) {
            return ResponseEntity.status(404).body(standardResponse(false, "Guest request not found", null, "req_err_404"));
        }
        return ResponseEntity.ok(standardResponse(true, "Guest request details retrieved", req, "req_guest_req_get_001"));
    }

    @PatchMapping("/guest-requests/{requestId}")
    public ResponseEntity<Map<String, Object>> updateGuestRequest(
            @PathVariable String requestId,
            @RequestBody Map<String, Object> updates,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> req = store.updateServiceRequest(tenantId, requestId, updates);
        return ResponseEntity.ok(standardResponse(true, "Permitted fields updated", req, "req_guest_req_patch_001"));
    }

    @PostMapping("/guest-requests/{requestId}/assign")
    public ResponseEntity<Map<String, Object>> assignGuestRequest(
            @PathVariable String requestId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> req = store.assignServiceRequest(tenantId, requestId, body);
        return ResponseEntity.ok(standardResponse(true, "Request assigned", req, "req_guest_req_assign_001"));
    }

    @PostMapping("/guest-requests/{requestId}/escalate")
    public ResponseEntity<Map<String, Object>> escalateGuestRequest(
            @PathVariable String requestId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> req = store.escalateServiceRequest(tenantId, requestId, body);
        return ResponseEntity.ok(standardResponse(true, "Request escalated", req, "req_guest_req_esc_001"));
    }

    @GetMapping("/reception-enquiries")
    public ResponseEntity<Map<String, Object>> getReceptionEnquiries(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = store.getEnquiries(tenantId, null, null);
        return ResponseEntity.ok(standardResponse(true, "Reception enquiries retrieved", list, "req_recep_enq_001"));
    }

    @PostMapping("/reception-enquiries")
    public ResponseEntity<Map<String, Object>> createReceptionEnquiry(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> enq = store.createEnquiry(tenantId, body);
        return ResponseEntity.ok(standardResponse(true, "Enquiry created", enq, "req_recep_enq_create_001"));
    }

    @PostMapping("/reception-enquiries/{enquiryId}/handoff")
    public ResponseEntity<Map<String, Object>> handoffReceptionEnquiry(
            @PathVariable String enquiryId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> handoff = store.handoffReceptionEnquiry(tenantId, enquiryId, body);
        return ResponseEntity.ok(standardResponse(true, "Enquiry handed to another team", handoff, "req_recep_handoff_001"));
    }

    // E. Check-out & Billing
    @GetMapping("/reservations/{reservationId}/check-out-eligibility")
    public ResponseEntity<Map<String, Object>> evaluateCheckOutEligibility(
            @PathVariable String reservationId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> elig = store.evaluateCheckOutEligibility(tenantId, reservationId);
        return ResponseEntity.ok(standardResponse(true, "Check-out eligibility evaluated", elig, "req_checkout_eligibility_001"));
    }

    @GetMapping("/reservations/{reservationId}/folio")
    public ResponseEntity<Map<String, Object>> getFolio(
            @PathVariable String reservationId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> folio = store.getFolio(tenantId, reservationId);
        return ResponseEntity.ok(standardResponse(true, "Guest folio retrieved", folio, "req_folio_001"));
    }

    @GetMapping("/reservations/{reservationId}/invoice")
    public ResponseEntity<Map<String, Object>> getInvoice(
            @PathVariable String reservationId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> inv = store.getInvoice(tenantId, reservationId);
        return ResponseEntity.ok(standardResponse(true, "Authorized invoice retrieved", inv, "req_inv_001"));
    }

    @PostMapping("/reservations/{reservationId}/check-out")
    public ResponseEntity<Map<String, Object>> processCheckOut(
            @PathVariable String reservationId,
            @RequestBody(required = false) Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> checkout = store.processCheckOut(tenantId, reservationId, body);
        return ResponseEntity.ok(standardResponse(true, "Check-out processed", checkout, "req_checkout_001"));
    }

    @PostMapping("/reservations/{reservationId}/late-checkout-requests")
    public ResponseEntity<Map<String, Object>> requestLateCheckout(
            @PathVariable String reservationId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> lateReq = store.requestLateCheckout(tenantId, reservationId, body);
        return ResponseEntity.ok(standardResponse(true, "Late check-out request created", lateReq, "req_late_checkout_001"));
    }

    @GetMapping("/reservations/{reservationId}/payment-status")
    public ResponseEntity<Map<String, Object>> getPaymentStatus(
            @PathVariable String reservationId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> payment = store.getReservationPaymentStatus(tenantId, reservationId);
        return ResponseEntity.ok(standardResponse(true, "Authoritative payment status", payment, "req_payment_status_001"));
    }

    // F. Operational Handoffs & Audit
    @GetMapping("/housekeeping-status")
    public ResponseEntity<Map<String, Object>> getHousekeepingStatus(
            @RequestParam(required = false) String status,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> hk = store.getHousekeepingStatus(tenantId, status);
        Map<String, Object> respData = new LinkedHashMap<>();
        respData.put("items", hk);
        respData.put("totalElements", hk.size());
        return ResponseEntity.ok(standardResponse(true, "Housekeeping status retrieved", respData, "req_housekeeping_status_001"));
    }

    @GetMapping("/maintenance-requests")
    public ResponseEntity<Map<String, Object>> getMaintenanceRequests(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> maint = store.getMaintenanceRequests(tenantId);
        return ResponseEntity.ok(standardResponse(true, "Maintenance requests retrieved", maint, "req_maint_list_001"));
    }

    @PostMapping("/maintenance-requests")
    public ResponseEntity<Map<String, Object>> createMaintenanceRequest(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> req = store.createMaintenanceRequest(tenantId, body);
        return ResponseEntity.ok(standardResponse(true, "Maintenance request created", req, "req_maint_create_001"));
    }

    @PostMapping("/reservations/{reservationId}/handoff")
    public ResponseEntity<Map<String, Object>> handoffReservation(
            @PathVariable String reservationId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> handoff = store.handoffReservation(tenantId, reservationId, body);
        return ResponseEntity.ok(standardResponse(true, "Reservation issue handed off", handoff, "req_res_handoff_001"));
    }

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getMetrics(
            @RequestParam(defaultValue = "LAST_30_DAYS") String period,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> metrics = store.getFrontDeskMetrics(tenantId, period);
        return ResponseEntity.ok(standardResponse(true, "Front Desk metrics retrieved", metrics, "req_fd_metrics_001"));
    }

    @GetMapping("/activity-logs")
    public ResponseEntity<Map<String, Object>> getActivityLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> logs = store.getAuditEvents(tenantId);
        Map<String, Object> paged = new LinkedHashMap<>();
        paged.put("items", logs);
        paged.put("page", page);
        paged.put("size", size);
        paged.put("totalElements", logs.size());
        return ResponseEntity.ok(standardResponse(true, "Authorized activity history retrieved", paged, "req_act_fd_001"));
    }
}
