package com.zenelait.crm.industry.travel;

import com.zenelait.crm.common.exception.ResourceNotFoundException;
import com.zenelait.crm.tenant.TenantSecurityService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

// @RestController
// @RequestMapping("/api/v1/travel/legacy")
// @CrossOrigin(origins = "*")
public class TravelController {

    private final TenantSecurityService tenantSecurityService;
    private final Map<String, Map<String, Object>> quotations = new LinkedHashMap<>();
    private final Map<String, Map<String, Object>> bookings = new LinkedHashMap<>();

    public TravelController(TenantSecurityService tenantSecurityService) {
        this.tenantSecurityService = tenantSecurityService;
    }

    @GetMapping("/destinations")
    public ResponseEntity<List<Map<String, Object>>> getDestinations() {
        return ResponseEntity.ok(List.of(
                Map.of("id", "DEST-1", "name", "Dubai, UAE", "tag", "Luxury & Desert Safari", "peakSeason", "Oct - Mar"),
                Map.of("id", "DEST-2", "name", "Bali, Indonesia", "tag", "Tropical & Cultural", "peakSeason", "Apr - Oct"),
                Map.of("id", "DEST-3", "name", "Switzerland", "tag", "Alps & Scenic Rail", "peakSeason", "Dec - Apr")
        ));
    }

    @GetMapping("/packages")
    public ResponseEntity<List<Map<String, Object>>> getPackages() {
        return ResponseEntity.ok(List.of(
                Map.of("id", "PKG-TR-101", "name", "Dubai Explorer - 5 Days", "estimatedPrice", 235000, "currency", "INR", "nights", 4, "matchScore", 94),
                Map.of("id", "PKG-TR-102", "name", "Bali Leisure & Villa Retreat", "estimatedPrice", 185000, "currency", "INR", "nights", 6, "matchScore", 90)
        ));
    }

    @PostMapping("/enquiries")
    public ResponseEntity<Map<String, Object>> createEnquiry(@RequestBody Map<String, Object> body) {
        String id = "ENQ-TR-2001";
        int travellers = body.get("adults") != null ? ((Number) body.get("adults")).intValue() : 4;
        if (body.get("children") != null) travellers += ((Number) body.get("children")).intValue();

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("id", id);
        res.put("leadId", body.get("leadId"));
        res.put("destination", body.get("destination"));
        res.put("status", "NEW");
        res.put("travellerCount", travellers);
        res.put("currency", body.getOrDefault("currency", "INR"));

        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @PostMapping("/package-matches")
    public ResponseEntity<Map<String, Object>> matchPackages(@RequestBody Map<String, Object> body) {
        String enquiryId = (String) body.getOrDefault("enquiryId", "ENQ-TR-2001");
        List<Map<String, Object>> matches = List.of(
                Map.of(
                        "packageId", "PKG-TR-101",
                        "name", "Dubai Explorer - 5 Days",
                        "estimatedPrice", 235000,
                        "currency", "INR",
                        "matchScore", 94
                )
        );
        return ResponseEntity.ok(Map.of("enquiryId", enquiryId, "matches", matches));
    }

    @PostMapping("/quotations")
    public ResponseEntity<Map<String, Object>> createQuotation(@RequestBody Map<String, Object> body) {
        String id = "QUOTE-TR-301";
        Map<String, Object> quote = new LinkedHashMap<>(body);
        quote.put("id", id);
        quote.put("subtotal", 195000);
        quote.put("currency", body.getOrDefault("currency", "INR"));
        quote.put("status", "DRAFT");
        quotations.put(id, quote);
        return ResponseEntity.status(HttpStatus.CREATED).body(quote);
    }

    @GetMapping("/quotations/{id}")
    public ResponseEntity<Map<String, Object>> getQuotation(@PathVariable String id) {
        Map<String, Object> q = quotations.get(id);
        if (q == null) {
            q = Map.of("id", id, "subtotal", 195000, "currency", "INR", "status", "DRAFT");
        }
        return ResponseEntity.ok(q);
    }

    @PostMapping("/bookings")
    public ResponseEntity<Map<String, Object>> createBooking(@RequestBody Map<String, Object> body) {
        String id = "BOOK-TR-401";
        Map<String, Object> b = new LinkedHashMap<>(body);
        b.put("id", id);
        b.put("status", "PENDING_SUPPLIER_CONFIRMATION");
        b.put("travellerCount", body.getOrDefault("travellerCount", 4));
        bookings.put(id, b);
        return ResponseEntity.status(HttpStatus.CREATED).body(b);
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<Map<String, Object>>> getBookings() {
        return ResponseEntity.ok(new ArrayList<>(bookings.values()));
    }

    @PatchMapping("/bookings/{id}/status")
    public ResponseEntity<Map<String, Object>> updateBookingStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        Map<String, Object> b = bookings.get(id);
        if (b == null) {
            b = new LinkedHashMap<>(Map.of("id", id, "status", body.get("status")));
            bookings.put(id, b);
        } else {
            b.put("status", body.get("status"));
        }
        return ResponseEntity.ok(b);
    }
}
