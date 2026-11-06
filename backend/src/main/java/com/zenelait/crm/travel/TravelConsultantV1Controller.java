package com.zenelait.crm.travel;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/travel/consultant")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class TravelConsultantV1Controller {

    private final TravelDataStore store;

    public TravelConsultantV1Controller(TravelDataStore store) {
        this.store = store;
    }

    private <T> Map<String, Object> envelope(String message, T data, String requestId) {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", true);
        resp.put("message", message);
        resp.put("data", data);
        resp.put("requestId", requestId != null ? requestId : "req-tc-" + System.currentTimeMillis());
        return resp;
    }

    // --- Dashboard & Metrics ---
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("assignedLeads", store.getLeadsList().size());
        data.put("upcomingFollowUps", store.getFollowUpsList().size());
        data.put("activeQuotations", store.getQuotationsList().size());
        data.put("acceptedTravelPlans", 2);
        data.put("pendingBookingHandoffs", store.getHandoffsList().size());
        data.put("conversionRate", 22.5);
        data.put("currency", "INR");
        return ResponseEntity.ok(envelope("Consultant dashboard retrieved", data, "req-tc-000"));
    }

    @GetMapping("/metrics")
    public ResponseEntity<?> getMetrics() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("consultantId", "EMP-201");
        data.put("assignedLeads", 15);
        data.put("itinerariesCreated", 12);
        data.put("quotesSent", 9);
        data.put("convertedBookings", 4);
        data.put("personalConversionRate", 26.6);
        return ResponseEntity.ok(envelope("Personal metrics retrieved", data, "req-tc-met"));
    }

    // --- Leads ---
    @GetMapping("/leads")
    public ResponseEntity<?> listAssignedLeads(@RequestParam(required = false) String stage,
                                               @RequestParam(defaultValue = "0") int page,
                                               @RequestParam(defaultValue = "20") int size) {
        List<Map<String, Object>> filtered = store.getLeadsList().stream()
                .filter(l -> stage == null || stage.equalsIgnoreCase(String.valueOf(l.get("stage"))))
                .toList();

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("items", filtered);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", filtered.size());
        return ResponseEntity.ok(envelope("Assigned leads retrieved", data, "req-tc-001"));
    }

    @GetMapping("/leads/{leadId}")
    public ResponseEntity<?> getLead(@PathVariable String leadId) {
        Map<String, Object> lead = store.findLead(leadId);
        if (lead == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(envelope("Lead not found: " + leadId, null, "req-tc-err"));
        }
        return ResponseEntity.ok(envelope("Lead details retrieved", lead, "req-tc-lead"));
    }

    @PatchMapping("/leads/{leadId}")
    public ResponseEntity<?> updateLead(@PathVariable String leadId, @RequestBody Map<String, Object> updates) {
        Map<String, Object> lead = store.findLead(leadId);
        if (lead == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(envelope("Lead not found: " + leadId, null, "req-tc-err"));
        }
        lead.putAll(updates);
        store.recordAudit("LEAD_UPDATED_BY_CONSULTANT", "leadId=" + leadId);
        return ResponseEntity.ok(envelope("Lead updated", lead, "req-tc-patch"));
    }

    @GetMapping("/leads/{leadId}/activities")
    public ResponseEntity<?> getLeadActivities(@PathVariable String leadId) {
        List<Map<String, Object>> activities = store.getLeadActivities(leadId);
        return ResponseEntity.ok(envelope("Lead activities retrieved", activities, "req-tc-acts"));
    }

    @PostMapping("/leads/{leadId}/activities")
    public ResponseEntity<?> recordActivity(@PathVariable String leadId, @RequestBody Map<String, Object> body) {
        Map<String, Object> act = store.addLeadActivity(leadId, body);
        return ResponseEntity.status(HttpStatus.CREATED).body(envelope("Activity recorded", act, "req-tc-act-new"));
    }

    // --- Travel Requirements ---
    @PostMapping("/leads/{leadId}/requirements")
    public ResponseEntity<?> recordRequirements(@PathVariable String leadId, @RequestBody Map<String, Object> req) {
        Map<String, Object> created = store.saveTravelRequirement(leadId, req);
        store.recordAudit("TRAVEL_REQUIREMENTS_UPDATED", "leadId=" + leadId + ", reqId=" + created.get("requirementId"));
        return ResponseEntity.ok(envelope("Travel requirements recorded", created, "req-tc-002"));
    }

    @GetMapping("/leads/{leadId}/requirements")
    public ResponseEntity<?> getRequirements(@PathVariable String leadId) {
        Map<String, Object> req = store.getTravelRequirement(leadId);
        return ResponseEntity.ok(envelope("Travel requirements retrieved", req, "req-tc-req-get"));
    }

    @PatchMapping("/leads/{leadId}/requirements/{requirementId}")
    public ResponseEntity<?> updateRequirements(@PathVariable String leadId,
                                                @PathVariable String requirementId,
                                                @RequestBody Map<String, Object> updates) {
        Map<String, Object> req = store.getTravelRequirement(leadId);
        if (req != null) {
            req.putAll(updates);
        }
        return ResponseEntity.ok(envelope("Travel requirements updated", req, "req-tc-req-patch"));
    }

    // --- Destinations & Packages Search ---
    @GetMapping("/destinations")
    public ResponseEntity<?> listDestinations(@RequestParam(required = false) String query) {
        List<Map<String, Object>> list = store.getDestinationsList().stream()
                .filter(d -> query == null || String.valueOf(d.get("name")).toLowerCase().contains(query.toLowerCase()))
                .toList();
        return ResponseEntity.ok(envelope("Destinations retrieved", list, "req-tc-dest"));
    }

    @GetMapping("/destinations/{destinationId}")
    public ResponseEntity<?> getDestination(@PathVariable String destinationId) {
        Map<String, Object> dest = store.getDestinationsList().stream()
                .filter(d -> destinationId.equalsIgnoreCase(String.valueOf(d.get("destinationId"))))
                .findFirst().orElse(null);
        return ResponseEntity.ok(envelope("Destination details retrieved", dest, "req-tc-dest-1"));
    }

    @GetMapping("/packages")
    public ResponseEntity<?> listPackages(@RequestParam(required = false) String destination) {
        List<Map<String, Object>> list = store.getPackagesList().stream()
                .filter(p -> destination == null || destination.equalsIgnoreCase(String.valueOf(p.get("destination"))))
                .toList();
        return ResponseEntity.ok(envelope("Travel packages retrieved", list, "req-tc-pkg"));
    }

    @GetMapping("/packages/{packageId}")
    public ResponseEntity<?> getPackage(@PathVariable String packageId) {
        Map<String, Object> pkg = store.getPackagesList().stream()
                .filter(p -> packageId.equalsIgnoreCase(String.valueOf(p.get("packageId"))))
                .findFirst().orElse(null);
        return ResponseEntity.ok(envelope("Package details retrieved", pkg, "req-tc-pkg-1"));
    }

    @PostMapping("/travel-search")
    public ResponseEntity<?> travelSearch(@RequestBody Map<String, Object> query) {
        String dest = String.valueOf(query.getOrDefault("destination", "Bali"));
        List<Map<String, Object>> matched = store.getPackagesList().stream()
                .filter(p -> dest.equalsIgnoreCase(String.valueOf(p.get("destination"))))
                .toList();

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("results", matched);
        return ResponseEntity.ok(envelope("Travel product search completed", data, "req-tc-003"));
    }

    @PostMapping("/supplier-searches")
    public ResponseEntity<?> createSupplierSearch(@RequestBody Map<String, Object> req) {
        String searchId = "SUP-SEARCH-" + System.currentTimeMillis();
        Map<String, Object> search = new LinkedHashMap<>(req);
        search.put("searchId", searchId);
        search.put("status", "COMPLETED");
        search.put("results", List.of(
                Map.of("supplierId", "SUP-101", "productType", "HOTEL", "price", 60000, "status", "AVAILABLE"),
                Map.of("supplierId", "SUP-102", "productType", "TRANSFER", "price", 5000, "status", "AVAILABLE")
        ));
        return ResponseEntity.ok(envelope("Supplier search initiated", search, "req-tc-sup-search"));
    }

    @GetMapping("/supplier-searches/{searchId}")
    public ResponseEntity<?> getSupplierSearch(@PathVariable String searchId) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("searchId", searchId);
        data.put("status", "COMPLETED");
        data.put("results", List.of(
                Map.of("supplierId", "SUP-101", "name", "Bali Grand Resort", "price", 60000, "currency", "INR")
        ));
        return ResponseEntity.ok(envelope("Supplier search results retrieved", data, "req-tc-sup-res"));
    }

    // --- Itineraries ---
    @PostMapping("/itineraries")
    public ResponseEntity<?> createItinerary(@RequestBody Map<String, Object> body) {
        Map<String, Object> itin = store.createItinerary(body);
        store.recordAudit("TRAVEL_ITINERARY_CREATED", "itineraryId=" + itin.get("itineraryId"));
        return ResponseEntity.status(HttpStatus.CREATED).body(envelope("Itinerary created", itin, "req-tc-004"));
    }

    @GetMapping("/itineraries")
    public ResponseEntity<?> listItineraries() {
        return ResponseEntity.ok(envelope("Authorized itineraries retrieved", store.getItinerariesList(), "req-tc-itin-all"));
    }

    @GetMapping("/itineraries/{itineraryId}")
    public ResponseEntity<?> getItinerary(@PathVariable String itineraryId) {
        Map<String, Object> itin = store.findItinerary(itineraryId);
        if (itin == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(envelope("Itinerary not found", null, "req-tc-err"));
        }
        return ResponseEntity.ok(envelope("Itinerary details retrieved", itin, "req-tc-itin"));
    }

    @PatchMapping("/itineraries/{itineraryId}")
    public ResponseEntity<?> updateItinerary(@PathVariable String itineraryId, @RequestBody Map<String, Object> updates) {
        Map<String, Object> itin = store.findItinerary(itineraryId);
        if (itin == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(envelope("Itinerary not found", null, "req-tc-err"));
        }
        itin.putAll(updates);
        return ResponseEntity.ok(envelope("Itinerary updated", itin, "req-tc-itin-p"));
    }

    @PostMapping("/itineraries/{itineraryId}/items")
    public ResponseEntity<?> addItineraryItem(@PathVariable String itineraryId, @RequestBody Map<String, Object> item) {
        Map<String, Object> added = store.addItineraryItem(itineraryId, item);
        if (added == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(envelope("Itinerary not found", null, "req-tc-err"));
        }
        return ResponseEntity.ok(envelope("Itinerary item added", added, "req-tc-005"));
    }

    @PatchMapping("/itineraries/{itineraryId}/items/{itemId}")
    public ResponseEntity<?> updateItineraryItem(@PathVariable String itineraryId,
                                                 @PathVariable String itemId,
                                                 @RequestBody Map<String, Object> updates) {
        Map<String, Object> itin = store.findItinerary(itineraryId);
        if (itin == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(envelope("Itinerary not found", null, "req-tc-err"));
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> items = (List<Map<String, Object>>) itin.get("items");
        for (Map<String, Object> it : items) {
            if (itemId.equalsIgnoreCase(String.valueOf(it.get("itemId")))) {
                it.putAll(updates);
                return ResponseEntity.ok(envelope("Itinerary item updated", it, "req-tc-item-p"));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(envelope("Item not found", null, "req-tc-err"));
    }

    @DeleteMapping("/itineraries/{itineraryId}/items/{itemId}")
    public ResponseEntity<?> deleteItineraryItem(@PathVariable String itineraryId, @PathVariable String itemId) {
        Map<String, Object> itin = store.findItinerary(itineraryId);
        if (itin == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(envelope("Itinerary not found", null, "req-tc-err"));
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> items = (List<Map<String, Object>>) itin.get("items");
        items.removeIf(i -> itemId.equalsIgnoreCase(String.valueOf(i.get("itemId"))));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/itineraries/{itineraryId}/validate")
    public ResponseEntity<?> validateItinerary(@PathVariable String itineraryId, @RequestBody(required = false) Map<String, Object> body) {
        Map<String, Object> itin = store.findItinerary(itineraryId);
        if (itin == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(envelope("Itinerary not found", null, "req-tc-err"));

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("itineraryId", itineraryId);
        data.put("valid", true);
        data.put("warnings", List.of(
                Map.of("code", "SUPPLIER_CONFIRMATION_REQUIRED",
                        "message", "One or more services have not been confirmed by the supplier.")
        ));
        return ResponseEntity.ok(envelope("Itinerary validation completed", data, "req-tc-006"));
    }

    @PostMapping("/itineraries/{itineraryId}/versions")
    public ResponseEntity<?> createItineraryVersion(@PathVariable String itineraryId, @RequestBody Map<String, Object> body) {
        Map<String, Object> itin = store.findItinerary(itineraryId);
        if (itin == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(envelope("Itinerary not found", null, "req-tc-err"));
        int currentV = ((Number) itin.getOrDefault("version", 1)).intValue();
        itin.put("version", currentV + 1);
        itin.put("notes", body.getOrDefault("notes", "New revision created"));
        return ResponseEntity.ok(envelope("New itinerary version created", itin, "req-tc-itin-v"));
    }

    // --- Quotations ---
    @PostMapping("/quotations")
    public ResponseEntity<?> createQuotation(@RequestBody Map<String, Object> body) {
        Map<String, Object> quote = store.createQuotation(body);
        store.recordAudit("TRAVEL_QUOTATION_CREATED", "quoteId=" + quote.get("quoteId"));
        return ResponseEntity.ok(envelope("Quotation created", quote, "req-tc-007"));
    }

    @GetMapping("/quotations")
    public ResponseEntity<?> listQuotations() {
        return ResponseEntity.ok(envelope("Quotations retrieved", store.getQuotationsList(), "req-tc-q-list"));
    }

    @GetMapping("/quotations/{quoteId}")
    public ResponseEntity<?> getQuotation(@PathVariable String quoteId) {
        Map<String, Object> q = store.findQuotation(quoteId);
        if (q == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(envelope("Quotation not found", null, "req-tc-err"));
        return ResponseEntity.ok(envelope("Quotation details retrieved", q, "req-tc-q-get"));
    }

    @PatchMapping("/quotations/{quoteId}")
    public ResponseEntity<?> updateQuotation(@PathVariable String quoteId, @RequestBody Map<String, Object> updates) {
        Map<String, Object> q = store.findQuotation(quoteId);
        if (q == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(envelope("Quotation not found", null, "req-tc-err"));
        q.putAll(updates);
        return ResponseEntity.ok(envelope("Quotation updated", q, "req-tc-q-patch"));
    }

    @PostMapping("/quotations/{quoteId}/recalculate")
    public ResponseEntity<?> recalculateQuotation(@PathVariable String quoteId, @RequestBody Map<String, Object> body) {
        Map<String, Object> q = store.findQuotation(quoteId);
        if (q == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(envelope("Quotation not found", null, "req-tc-err"));

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("quoteId", quoteId);
        data.put("status", q.get("status"));
        data.put("currency", q.get("currency"));
        data.put("totalAmount", q.get("totalAmount"));
        data.put("supplierPriceStatus", "REFRESHED");
        data.put("requiresApproval", false);
        return ResponseEntity.ok(envelope("Quotation recalculated", data, "req-tc-008"));
    }

    @PostMapping("/quotations/{quoteId}/approval-requests")
    public ResponseEntity<?> requestQuotationApproval(@PathVariable String quoteId, @RequestBody Map<String, Object> req) {
        Map<String, Object> q = store.findQuotation(quoteId);
        if (q != null) {
            q.put("approvalStatus", "PENDING_APPROVAL");
        }
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("quoteId", quoteId);
        data.put("approvalStatus", "PENDING_APPROVAL");
        return ResponseEntity.ok(envelope("Quotation approval requested", data, "req-tc-009-appr"));
    }

    @PostMapping("/quotations/{quoteId}/send")
    public ResponseEntity<?> sendQuotation(@PathVariable String quoteId, @RequestBody Map<String, Object> body) {
        Map<String, Object> q = store.findQuotation(quoteId);
        if (q != null) {
            q.put("status", "SENT");
        }
        store.recordAudit("TRAVEL_QUOTATION_SENT", "quoteId=" + quoteId);
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("quoteId", quoteId);
        data.put("status", "SENT");
        data.put("deliveryStatus", "QUEUED");
        return ResponseEntity.ok(envelope("Quotation submitted to messaging provider", data, "req-tc-009"));
    }

    @PostMapping("/quotations/{quoteId}/revisions")
    public ResponseEntity<?> createQuotationRevision(@PathVariable String quoteId, @RequestBody Map<String, Object> body) {
        Map<String, Object> q = store.findQuotation(quoteId);
        if (q == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(envelope("Quotation not found", null, "req-tc-err"));
        Map<String, Object> rev = new LinkedHashMap<>(q);
        String newId = "TQUOTE-" + (store.getQuotationsList().size() + 1001);
        rev.put("quoteId", newId);
        rev.put("status", "DRAFT");
        rev.put("revisionOf", quoteId);
        store.getQuotations().put(newId, rev);
        return ResponseEntity.ok(envelope("Quotation revision created", rev, "req-tc-q-rev"));
    }

    @GetMapping("/quotations/{quoteId}/history")
    public ResponseEntity<?> getQuotationHistory(@PathVariable String quoteId) {
        List<Map<String, Object>> hist = List.of(
                Map.of("version", 1, "status", "DRAFT", "timestamp", "2026-10-25T10:00:00+05:30"),
                Map.of("version", 2, "status", "SENT", "timestamp", "2026-10-26T12:00:00+05:30")
        );
        return ResponseEntity.ok(envelope("Quotation history retrieved", hist, "req-tc-q-hist"));
    }

    // --- Booking Handoff ---
    @PostMapping("/leads/{leadId}/handoff-to-booking")
    public ResponseEntity<?> handoffToBooking(@PathVariable String leadId, @RequestBody Map<String, Object> body) {
        Map<String, Object> handoff = store.createHandoff(leadId, body);
        store.recordAudit("TRAVEL_BOOKING_HANDOFF_CREATED", "handoffId=" + handoff.get("handoffId"));
        return ResponseEntity.ok(envelope("Travel plan submitted to booking team", handoff, "req-tc-010"));
    }

    // --- Authorized Booking Read ---
    @GetMapping("/bookings/{bookingId}")
    public ResponseEntity<?> getBooking(@PathVariable String bookingId) {
        Map<String, Object> b = store.findBooking(bookingId);
        if (b == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(envelope("Booking not found", null, "req-tc-err"));
        return ResponseEntity.ok(envelope("Booking details retrieved", b, "req-tc-bk-get"));
    }

    // --- Follow-ups ---
    @GetMapping("/follow-ups")
    public ResponseEntity<?> listFollowUps() {
        return ResponseEntity.ok(envelope("Assigned follow-ups retrieved", store.getFollowUpsList(), "req-tc-fu-list"));
    }

    @PostMapping("/follow-ups")
    public ResponseEntity<?> createFollowUp(@RequestBody Map<String, Object> body) {
        Map<String, Object> fu = store.createFollowUp(body);
        return ResponseEntity.status(HttpStatus.CREATED).body(envelope("Follow-up task created", fu, "req-tc-fu-create"));
    }

    @PostMapping("/follow-ups/{taskId}/complete")
    public ResponseEntity<?> completeFollowUp(@PathVariable String taskId) {
        Map<String, Object> fu = store.completeFollowUp(taskId);
        return ResponseEntity.ok(envelope("Follow-up task completed", fu, "req-tc-fu-comp"));
    }

    // --- Conversations & Messaging ---
    @PostMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<?> sendMessage(@PathVariable String conversationId, @RequestBody Map<String, Object> body) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("conversationId", conversationId);
        data.put("messageId", "MSG-" + System.currentTimeMillis());
        data.put("status", "SENT");
        data.put("content", body.get("content"));
        return ResponseEntity.ok(envelope("Message sent", data, "req-tc-msg"));
    }

    @PostMapping("/conversations/{conversationId}/handoff")
    public ResponseEntity<?> handoffConversation(@PathVariable String conversationId, @RequestBody Map<String, Object> body) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("conversationId", conversationId);
        data.put("transferredTo", body.get("targetRole"));
        data.put("status", "HANDED_OFF");
        return ResponseEntity.ok(envelope("Conversation transferred", data, "req-tc-conv-handoff"));
    }
}
