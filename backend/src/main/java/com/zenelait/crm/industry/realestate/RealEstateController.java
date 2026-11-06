package com.zenelait.crm.industry.realestate;

import com.zenelait.crm.common.exception.ResourceNotFoundException;
import com.zenelait.crm.tenant.TenantSecurityService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

// Deprecated in favor of RealEstateOperationsV1Controller
// @RestController
// @RequestMapping("/api/v1/real-estate")
public class RealEstateController {

    private final TenantSecurityService tenantSecurityService;
    private final Map<String, Map<String, Object>> properties = new LinkedHashMap<>();
    private final Map<String, Map<String, Object>> siteVisits = new LinkedHashMap<>();
    private final Map<String, Map<String, Object>> bookings = new LinkedHashMap<>();

    public RealEstateController(TenantSecurityService tenantSecurityService) {
        this.tenantSecurityService = tenantSecurityService;
        initData();
    }

    private void initData() {
        properties.put("PROP-RE-101", Map.of(
                "id", "PROP-RE-101",
                "name", "Skyline Residency",
                "location", "Chennai",
                "bedrooms", 2,
                "price", 6500000,
                "currency", "INR",
                "availability", "AVAILABLE"
        ));
        properties.put("PROP-RE-102", Map.of(
                "id", "PROP-RE-102",
                "name", "Green Valley Apartments",
                "location", "Chennai",
                "bedrooms", 2,
                "price", 6800000,
                "currency", "INR",
                "availability", "AVAILABLE"
        ));
    }

    @GetMapping("/properties")
    public ResponseEntity<Map<String, Object>> getProperties(
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer bedrooms,
            @RequestParam(required = false) Double maxPrice
    ) {
        List<Map<String, Object>> items = new ArrayList<>();
        for (Map<String, Object> p : properties.values()) {
            boolean matches = true;
            if (location != null && !location.equalsIgnoreCase((String) p.get("location"))) matches = false;
            if (bedrooms != null && !bedrooms.equals(p.get("bedrooms"))) matches = false;
            if (maxPrice != null && ((Number) p.get("price")).doubleValue() > maxPrice) matches = false;
            if (matches) items.add(p);
        }
        return ResponseEntity.ok(Map.of("items", items, "totalElements", items.size()));
    }

    @GetMapping("/properties/{id}")
    public ResponseEntity<Map<String, Object>> getProperty(@PathVariable String id) {
        Map<String, Object> prop = properties.get(id);
        if (prop == null) throw new ResourceNotFoundException("Property not found: " + id);
        return ResponseEntity.ok(prop);
    }

    @PostMapping("/buyer-requirements")
    public ResponseEntity<Map<String, Object>> captureBuyerRequirement(@RequestBody Map<String, Object> body) {
        String id = "REQ-RE-2001";
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("id", id);
        res.put("leadId", body.get("leadId"));
        res.put("status", "CAPTURED");
        res.put("matchingPropertiesCount", 2);
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @PostMapping("/matches")
    public ResponseEntity<Map<String, Object>> matchProperties(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(Map.of(
                "matchingProperties", new ArrayList<>(properties.values()),
                "count", properties.size()
        ));
    }

    @PostMapping("/site-visits")
    public ResponseEntity<Map<String, Object>> scheduleSiteVisit(@RequestBody Map<String, Object> body) {
        String id = "VISIT-RE-" + (3000 + (long)(Math.random() * 7000));
        Map<String, Object> visit = new LinkedHashMap<>(body);
        visit.put("id", id);
        visit.put("status", "SCHEDULED");
        siteVisits.put(id, visit);
        return ResponseEntity.status(HttpStatus.CREATED).body(visit);
    }

    @GetMapping("/site-visits")
    public ResponseEntity<List<Map<String, Object>>> getSiteVisits() {
        return ResponseEntity.ok(new ArrayList<>(siteVisits.values()));
    }

    @PostMapping("/negotiations")
    public ResponseEntity<Map<String, Object>> recordNegotiation(@RequestBody Map<String, Object> body) {
        Map<String, Object> res = new LinkedHashMap<>(body);
        res.put("id", "NEG-RE-" + (100 + (long)(Math.random() * 900)));
        res.put("status", "IN_PROGRESS");
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @PostMapping("/bookings")
    public ResponseEntity<Map<String, Object>> createBooking(@RequestBody Map<String, Object> body) {
        String id = "BOOK-RE-" + (4000 + (long)(Math.random() * 6000));
        Map<String, Object> booking = new LinkedHashMap<>(body);
        booking.put("id", id);
        booking.put("status", "PENDING_CONFIRMATION");
        bookings.put(id, booking);
        return ResponseEntity.status(HttpStatus.CREATED).body(booking);
    }

    @PatchMapping("/bookings/{id}/status")
    public ResponseEntity<Map<String, Object>> updateBookingStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        Map<String, Object> booking = bookings.get(id);
        if (booking == null) {
            booking = new LinkedHashMap<>(Map.of("id", id, "status", body.get("status")));
            bookings.put(id, booking);
        } else {
            booking.put("status", body.get("status"));
        }
        return ResponseEntity.ok(booking);
    }
}
