package com.zenelait.crm.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

/**
 * Zenelait AI CRM — Real Estate Company Admin V1 REST API Controller
 * Implements Part B Real Estate Company Admin API Catalogue:
 * - Projects (/api/v1/admin/real-estate/projects)
 * - Properties & Units (/api/v1/admin/real-estate/properties)
 * - Property Types & Amenities (/api/v1/admin/real-estate/property-types, amenities, locations)
 * - Pricing & Offers (/api/v1/admin/real-estate/pricing-rules, offers, booking-settings, approval-rules)
 * - Site Visits & Slots (/api/v1/admin/real-estate/site-visits, site-visit-slots, coordinator-assignments)
 */
@RestController
@RequestMapping("/api/v1/admin/real-estate")
@CrossOrigin(origins = "*")
public class RealEstateAdminV1Controller {

    private final List<Map<String, Object>> projects = new ArrayList<>();
    private final List<Map<String, Object>> properties = new ArrayList<>();
    private final List<Map<String, Object>> propertyTypes = new ArrayList<>();
    private final List<Map<String, Object>> amenities = new ArrayList<>();
    private final List<Map<String, Object>> locations = new ArrayList<>();
    private final List<Map<String, Object>> pricingRules = new ArrayList<>();
    private final List<Map<String, Object>> offers = new ArrayList<>();
    private final Map<String, Object> bookingSettings = new LinkedHashMap<>();
    private final List<Map<String, Object>> approvalRules = new ArrayList<>();
    private final List<Map<String, Object>> siteVisits = new ArrayList<>();
    private final List<Map<String, Object>> siteVisitSlots = new ArrayList<>();
    private final List<Map<String, Object>> coordinatorAssignments = new ArrayList<>();

    public RealEstateAdminV1Controller() {
        initRealEstateData();
    }

    private void initRealEstateData() {
        // 1. Projects
        projects.add(new LinkedHashMap<>(Map.of(
                "projectId", "PROJ-001",
                "projectCode", "GN-RES-001",
                "name", "GreenNest Residency",
                "propertyCategory", "RESIDENTIAL",
                "propertyTypes", List.of("APARTMENT", "PENTHOUSE"),
                "location", Map.of("city", "Chennai", "state", "Tamil Nadu", "country", "India"),
                "totalUnits", 64,
                "availableUnits", 42,
                "status", "ACTIVE"
        )));
        projects.add(new LinkedHashMap<>(Map.of(
                "projectId", "PROJ-002",
                "projectCode", "GN-VIL-002",
                "name", "GreenNest Sky Villas",
                "propertyCategory", "LUXURY_VILLAS",
                "propertyTypes", List.of("VILLA", "DUPLEX"),
                "location", Map.of("city", "Bengaluru", "state", "Karnataka", "country", "India"),
                "totalUnits", 28,
                "availableUnits", 11,
                "status", "ACTIVE"
        )));

        // 2. Properties / Units
        properties.add(buildProperty("PROP-1001", "PROJ-001", "GreenNest Residency", "A-1204", "APARTMENT", 3, 2, 1450, 9500000, "AVAILABLE", "NORTH_EAST", 12));
        properties.add(buildProperty("PROP-1002", "PROJ-001", "GreenNest Residency", "B-0402", "APARTMENT", 2, 2, 1120, 6800000, "AVAILABLE", "EAST", 4));
        properties.add(buildProperty("PROP-1003", "PROJ-002", "GreenNest Sky Villas", "V-08", "VILLA", 4, 4, 3200, 24500000, "RESERVED", "EAST", 1));

        // 3. Types, Amenities, Locations
        propertyTypes.addAll(List.of(
                Map.of("id", "PT-1", "name", "Apartment", "code", "APARTMENT"),
                Map.of("id", "PT-2", "name", "Luxury Villa", "code", "VILLA"),
                Map.of("id", "PT-3", "name", "Penthouse", "code", "PENTHOUSE"),
                Map.of("id", "PT-4", "name", "Commercial Space", "code", "COMMERCIAL")
        ));

        amenities.addAll(List.of(
                Map.of("id", "AM-1", "name", "Infinity Swimming Pool", "category", "RECREATION"),
                Map.of("id", "AM-2", "name", "Clubhouse & Gym", "category", "WELLNESS"),
                Map.of("id", "AM-3", "name", "24/7 EV Charging Stations", "category", "SUSTAINABILITY"),
                Map.of("id", "AM-4", "name", "Automated Multilevel Parking", "category", "INFRASTRUCTURE"),
                Map.of("id", "AM-5", "name", "Rooftop Jogging Track", "category", "SPORTS")
        ));

        locations.addAll(List.of(
                Map.of("id", "LOC-1", "city", "Chennai", "area", "OMR IT Corridor", "landmark", "Near Tidal Park"),
                Map.of("id", "LOC-2", "city", "Bengaluru", "area", "Whitefield", "landmark", "Near ITPL"),
                Map.of("id", "LOC-3", "city", "Hyderabad", "area", "Gachibowli", "landmark", "Financial District")
        ));

        // 4. Pricing Rules & Offers
        pricingRules.add(new LinkedHashMap<>(Map.of(
                "ruleId", "PR-01",
                "name", "Base Floor Rise Premium",
                "type", "FLOOR_RISE",
                "ratePerSqFt", 50,
                "applicableFloors", "5-25",
                "status", "ACTIVE"
        )));
        pricingRules.add(new LinkedHashMap<>(Map.of(
                "ruleId", "PR-02",
                "name", "East Facing Corner Premium",
                "type", "CORNER_PREMIUM",
                "fixedAmount", 250000,
                "status", "ACTIVE"
        )));

        offers.add(new LinkedHashMap<>(Map.of(
                "offerId", "OFF-2026-FESTIVE",
                "title", "Diwali Early Bird Booking Waiver",
                "discountPercentage", 3.5,
                "validUntil", "2026-11-15",
                "status", "ACTIVE"
        )));

        bookingSettings.put("initialDepositPercentage", 10.0);
        bookingSettings.put("reservationHoldDays", 7);
        bookingSettings.put("allowOnlineTokenPayment", true);
        bookingSettings.put("kycDocumentsRequired", List.of("PAN_CARD", "AADHAAR", "SALARY_SLIP_3M"));

        approvalRules.add(new LinkedHashMap<>(Map.of(
                "ruleId", "APR-01",
                "name", "Discounts Over 5% Require MD Approval",
                "thresholdDiscount", 5.0,
                "approverRole", "COMPANY_ADMIN"
        )));

        // 5. Site Visits & Slots
        siteVisits.add(new LinkedHashMap<>(Map.of(
                "visitId", "VISIT-1001",
                "leadName", "Ananya Deshmukh",
                "phone", "+91 98765 22001",
                "projectId", "PROJ-001",
                "projectName", "GreenNest Residency",
                "coordinatorName", "Suresh Nair",
                "scheduledAt", "2026-10-24T10:00:00+05:30",
                "status", "CONFIRMED",
                "notes", "Interested in 3BHK East-facing with high floor view"
        )));
        siteVisits.add(new LinkedHashMap<>(Map.of(
                "visitId", "VISIT-1002",
                "leadName", "Rajesh Varma",
                "phone", "+91 98765 22002",
                "projectId", "PROJ-002",
                "projectName", "GreenNest Sky Villas",
                "coordinatorName", "Deepak Kumar",
                "scheduledAt", "2026-10-25T14:30:00+05:30",
                "status", "SCHEDULED",
                "notes", "Looking for 4BHK with private pool"
        )));

        siteVisitSlots.add(new LinkedHashMap<>(Map.of(
                "slotId", "SLOT-1001",
                "projectId", "PROJ-001",
                "coordinatorId", "USR-SVC-101",
                "coordinatorName", "Suresh Nair",
                "startAt", "2026-10-24T10:00:00+05:30",
                "endAt", "2026-10-24T10:30:00+05:30",
                "capacity", 1,
                "status", "AVAILABLE"
        )));
        siteVisitSlots.add(new LinkedHashMap<>(Map.of(
                "slotId", "SLOT-1002",
                "projectId", "PROJ-001",
                "coordinatorId", "USR-SVC-101",
                "coordinatorName", "Suresh Nair",
                "startAt", "2026-10-24T11:00:00+05:30",
                "endAt", "2026-10-24T11:30:00+05:30",
                "capacity", 1,
                "status", "AVAILABLE"
        )));

        coordinatorAssignments.add(new LinkedHashMap<>(Map.of(
                "ruleId", "RULE-COORD-01",
                "projectId", "PROJ-001",
                "coordinatorName", "Suresh Nair",
                "assignmentType", "ROUND_ROBIN",
                "maxVisitsPerDay", 6
        )));
    }

    private Map<String, Object> buildProperty(
            String id, String projId, String projName, String unitNo, String type,
            int beds, int baths, int sqft, double amount, String avail, String facing, int floor
    ) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("propertyId", id);
        map.put("projectId", projId);
        map.put("projectName", projName);
        map.put("unitNumber", unitNo);
        map.put("propertyType", type);
        map.put("bedrooms", beds);
        map.put("bathrooms", baths);
        map.put("areaSqFt", sqft);
        map.put("price", Map.of("amount", amount, "currency", "INR"));
        map.put("availability", avail);
        map.put("facing", facing);
        map.put("floor", floor);
        return map;
    }

    // Projects API
    @GetMapping("/projects")
    public ResponseEntity<?> listProjects() {
        return ResponseEntity.ok(Map.of("success", true, "data", projects, "meta", Map.of("totalElements", projects.size())));
    }

    @PostMapping("/projects")
    public ResponseEntity<?> createProject(@RequestBody Map<String, Object> req) {
        String newId = "PROJ-" + (projects.size() + 101);
        Map<String, Object> p = new LinkedHashMap<>(req);
        p.put("projectId", newId);
        p.put("status", req.getOrDefault("status", "PLANNING"));
        p.put("createdAt", Instant.now().toString());
        projects.add(p);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "message", "Project created successfully", "data", p));
    }

    @GetMapping("/projects/{projectId}")
    public ResponseEntity<?> getProject(@PathVariable String projectId) {
        return projects.stream()
                .filter(p -> projectId.equals(p.get("projectId")))
                .findFirst()
                .map(p -> ResponseEntity.ok(Map.of("success", true, "data", p)))
                .orElse(ResponseEntity.notFound().build());
    }

    // Properties API
    @GetMapping("/properties")
    public ResponseEntity<?> searchProperties(
            @RequestParam(required = false) String projectId,
            @RequestParam(required = false) String availability,
            @RequestParam(required = false) Integer bedrooms
    ) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Map<String, Object> p : properties) {
            boolean matches = true;
            if (projectId != null && !projectId.equalsIgnoreCase((String) p.get("projectId"))) matches = false;
            if (availability != null && !availability.equalsIgnoreCase((String) p.get("availability"))) matches = false;
            if (bedrooms != null && !bedrooms.equals(p.get("bedrooms"))) matches = false;
            if (matches) result.add(p);
        }
        return ResponseEntity.ok(Map.of("success", true, "data", result, "meta", Map.of("totalElements", result.size())));
    }

    @PostMapping("/properties")
    public ResponseEntity<?> createProperty(@RequestBody Map<String, Object> req) {
        String newId = "PROP-" + (properties.size() + 1001);
        Map<String, Object> prop = new LinkedHashMap<>(req);
        prop.put("propertyId", newId);
        prop.put("availability", req.getOrDefault("availability", "AVAILABLE"));
        properties.add(prop);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "message", "Property unit created successfully", "data", prop));
    }

    @PatchMapping("/properties/{propertyId}/availability")
    public ResponseEntity<?> updatePropertyAvailability(@PathVariable String propertyId, @RequestBody Map<String, String> body) {
        for (Map<String, Object> p : properties) {
            if (propertyId.equals(p.get("propertyId"))) {
                p.put("availability", body.get("availability"));
                return ResponseEntity.ok(Map.of("success", true, "message", "Availability updated", "data", p));
            }
        }
        return ResponseEntity.notFound().build();
    }

    // Property Types & Amenities & Locations
    @GetMapping("/property-types")
    public ResponseEntity<?> getPropertyTypes() {
        return ResponseEntity.ok(Map.of("success", true, "data", propertyTypes));
    }

    @PostMapping("/property-types")
    public ResponseEntity<?> createPropertyType(@RequestBody Map<String, Object> req) {
        String id = "PT-" + (propertyTypes.size() + 1);
        Map<String, Object> item = new LinkedHashMap<>(req);
        item.put("id", id);
        propertyTypes.add(item);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "data", item));
    }

    @GetMapping("/amenities")
    public ResponseEntity<?> getAmenities() {
        return ResponseEntity.ok(Map.of("success", true, "data", amenities));
    }

    @PostMapping("/amenities")
    public ResponseEntity<?> createAmenity(@RequestBody Map<String, Object> req) {
        String id = "AM-" + (amenities.size() + 1);
        Map<String, Object> item = new LinkedHashMap<>(req);
        item.put("id", id);
        amenities.add(item);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "data", item));
    }

    @GetMapping("/locations")
    public ResponseEntity<?> getLocations() {
        return ResponseEntity.ok(Map.of("success", true, "data", locations));
    }

    @PostMapping("/locations")
    public ResponseEntity<?> createLocation(@RequestBody Map<String, Object> req) {
        String id = "LOC-" + (locations.size() + 1);
        Map<String, Object> item = new LinkedHashMap<>(req);
        item.put("id", id);
        locations.add(item);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "data", item));
    }

    // Pricing & Booking Settings
    @GetMapping("/pricing-rules")
    public ResponseEntity<?> getPricingRules() {
        return ResponseEntity.ok(Map.of("success", true, "data", pricingRules));
    }

    @PostMapping("/pricing-rules")
    public ResponseEntity<?> createPricingRule(@RequestBody Map<String, Object> req) {
        String id = "PR-" + (pricingRules.size() + 1);
        Map<String, Object> item = new LinkedHashMap<>(req);
        item.put("ruleId", id);
        item.put("status", "ACTIVE");
        pricingRules.add(item);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "data", item));
    }

    @GetMapping("/offers")
    public ResponseEntity<?> getOffers() {
        return ResponseEntity.ok(Map.of("success", true, "data", offers));
    }

    @PostMapping("/offers")
    public ResponseEntity<?> createOffer(@RequestBody Map<String, Object> req) {
        String id = "OFF-" + System.currentTimeMillis() % 10000;
        Map<String, Object> item = new LinkedHashMap<>(req);
        item.put("offerId", id);
        item.put("status", "ACTIVE");
        offers.add(item);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "data", item));
    }

    @GetMapping("/booking-settings")
    public ResponseEntity<?> getBookingSettings() {
        return ResponseEntity.ok(Map.of("success", true, "data", bookingSettings));
    }

    @PatchMapping("/booking-settings")
    public ResponseEntity<?> updateBookingSettings(@RequestBody Map<String, Object> req) {
        bookingSettings.putAll(req);
        return ResponseEntity.ok(Map.of("success", true, "message", "Booking settings saved", "data", bookingSettings));
    }

    @GetMapping("/approval-rules")
    public ResponseEntity<?> getApprovalRules() {
        return ResponseEntity.ok(Map.of("success", true, "data", approvalRules));
    }

    @PostMapping("/approval-rules")
    public ResponseEntity<?> createApprovalRule(@RequestBody Map<String, Object> req) {
        String id = "APR-" + (approvalRules.size() + 1);
        Map<String, Object> item = new LinkedHashMap<>(req);
        item.put("ruleId", id);
        approvalRules.add(item);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "data", item));
    }

    // Site Visits & Slots
    @GetMapping("/site-visits")
    public ResponseEntity<?> getSiteVisits() {
        return ResponseEntity.ok(Map.of("success", true, "data", siteVisits, "meta", Map.of("totalElements", siteVisits.size())));
    }

    @GetMapping("/site-visit-slots")
    public ResponseEntity<?> getSiteVisitSlots() {
        return ResponseEntity.ok(Map.of("success", true, "data", siteVisitSlots, "meta", Map.of("totalElements", siteVisitSlots.size())));
    }

    @PostMapping("/site-visit-slots")
    public ResponseEntity<?> createSiteVisitSlot(@RequestBody Map<String, Object> req) {
        String id = "SLOT-" + (siteVisitSlots.size() + 1001);
        Map<String, Object> item = new LinkedHashMap<>(req);
        item.put("slotId", id);
        item.put("status", "AVAILABLE");
        siteVisitSlots.add(item);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "data", item));
    }

    @GetMapping("/coordinator-assignments")
    public ResponseEntity<?> getCoordinatorAssignments() {
        return ResponseEntity.ok(Map.of("success", true, "data", coordinatorAssignments));
    }

    @PostMapping("/coordinator-assignments")
    public ResponseEntity<?> createCoordinatorAssignment(@RequestBody Map<String, Object> req) {
        String id = "RULE-COORD-" + (coordinatorAssignments.size() + 1);
        Map<String, Object> item = new LinkedHashMap<>(req);
        item.put("ruleId", id);
        coordinatorAssignments.add(item);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "data", item));
    }
}
