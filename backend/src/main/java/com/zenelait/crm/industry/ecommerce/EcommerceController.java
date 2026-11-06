package com.zenelait.crm.industry.ecommerce;

import com.zenelait.crm.common.exception.ResourceNotFoundException;
import com.zenelait.crm.tenant.TenantSecurityService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

// @RestController
// @RequestMapping("/api/v1/ecommerce/analytics")
// @CrossOrigin(origins = "*")
public class EcommerceController {

    private final TenantSecurityService tenantSecurityService;
    private final Map<String, Map<String, Object>> recoveries = new LinkedHashMap<>();
    private final Map<String, Map<String, Object>> promotions = new LinkedHashMap<>();

    public EcommerceController(TenantSecurityService tenantSecurityService) {
        this.tenantSecurityService = tenantSecurityService;
    }

    @GetMapping("/products")
    public ResponseEntity<List<Map<String, Object>>> getProducts() {
        return ResponseEntity.ok(List.of(
                Map.of("id", "PROD-EC-1", "sku", "SKU-LAPTOP-101", "name", "MacBook Pro M3 Pro", "price", 199900, "currency", "INR", "stock", 14),
                Map.of("id", "PROD-EC-2", "sku", "SKU-AUDIO-202", "name", "Sony WH-1000XM5", "price", 29990, "currency", "INR", "stock", 45)
        ));
    }

    @GetMapping("/sales-funnel")
    public ResponseEntity<Map<String, Object>> getSalesFunnel(
            @RequestParam(required = false, defaultValue = "2026-10-01") String from,
            @RequestParam(required = false, defaultValue = "2026-10-12") String to
    ) {
        Map<String, Object> funnel = new LinkedHashMap<>();
        funnel.put("visitors", 12480);
        funnel.put("productViews", 8624);
        funnel.put("addToCart", 1842);
        funnel.put("checkoutStarted", 942);
        funnel.put("purchases", 436);

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("period", Map.of("from", from, "to", to));
        res.put("funnel", funnel);
        res.put("currency", "INR");
        res.put("revenue", 1860000);

        return ResponseEntity.ok(res);
    }

    @GetMapping("/carts/abandoned")
    public ResponseEntity<Map<String, Object>> getAbandonedCarts(
            @RequestParam(defaultValue = "60") int minAgeMinutes,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        List<Map<String, Object>> items = List.of(
                Map.of(
                        "id", "CART-EC-101",
                        "customerId", "CUS-EC-501",
                        "itemCount", 2,
                        "cartValue", 79999,
                        "currency", "INR",
                        "abandonedAt", "2026-10-12T09:00:00+05:30",
                        "recoveryStatus", "NOT_CONTACTED"
                )
        );

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("items", items);
        res.put("page", page);
        res.put("size", size);
        res.put("totalElements", 1);

        return ResponseEntity.ok(res);
    }

    @PostMapping("/cart-recovery")
    public ResponseEntity<Map<String, Object>> createCartRecovery(@RequestBody Map<String, Object> body) {
        String id = "REC-EC-" + (200 + (long)(Math.random() * 800));
        Map<String, Object> rec = new LinkedHashMap<>(body);
        rec.put("id", id);
        rec.put("status", "SCHEDULED");
        recoveries.put(id, rec);
        return ResponseEntity.status(HttpStatus.CREATED).body(rec);
    }

    @GetMapping("/orders")
    public ResponseEntity<List<Map<String, Object>>> getOrders() {
        return ResponseEntity.ok(List.of(
                Map.of("id", "ORD-EC-901", "orderNumber", "ORD-2026-901", "customerId", "CUS-EC-501", "itemsCount", 2, "totalAmount", 79999, "currency", "INR", "status", "PAID"),
                Map.of("id", "ORD-EC-902", "orderNumber", "ORD-2026-902", "customerId", "CUS-EC-502", "itemsCount", 1, "totalAmount", 29990, "currency", "INR", "status", "SHIPPED")
        ));
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<Map<String, Object>> getOrder(@PathVariable String id) {
        return ResponseEntity.ok(Map.of(
                "id", id,
                "orderNumber", "ORD-2026-" + id,
                "totalAmount", 79999,
                "currency", "INR",
                "status", "CONFIRMED"
        ));
    }

    @PostMapping("/promotions")
    public ResponseEntity<Map<String, Object>> createPromotion(@RequestBody Map<String, Object> body) {
        String id = "PROMO-EC-" + (300 + (long)(Math.random() * 700));
        Map<String, Object> promo = new LinkedHashMap<>(body);
        promo.put("id", id);
        promo.put("status", "PENDING_APPROVAL");
        promotions.put(id, promo);
        return ResponseEntity.status(HttpStatus.CREATED).body(promo);
    }

    @GetMapping("/products/top-selling")
    public ResponseEntity<List<Map<String, Object>>> getTopSelling() {
        return ResponseEntity.ok(List.of(
                Map.of("sku", "SKU-LAPTOP-101", "name", "MacBook Pro M3 Pro", "unitsSold", 48, "revenue", 9595200),
                Map.of("sku", "SKU-AUDIO-202", "name", "Sony WH-1000XM5", "unitsSold", 82, "revenue", 2459180)
        ));
    }

    @GetMapping("/campaigns/performance")
    public ResponseEntity<List<Map<String, Object>>> getCampaignPerformance() {
        return ResponseEntity.ok(List.of(
                Map.of("campaignName", "Diwali Electronics Festival", "clicks", 3420, "conversions", 284, "revenue", 4850000, "roi", 4.8)
        ));
    }
}
