package com.zenelait.crm.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

/**
 * Zenelait AI CRM — E-Commerce Store Admin V1 REST API Controller
 * Implements Part A E-Commerce Store Admin API Catalogue:
 * - Store & Settings (/api/v1/ecommerce/store, /settings, /business-hours)
 * - Products & Categories (/api/v1/ecommerce/categories, /products, /inventory)
 * - Orders & Fulfillment (/api/v1/ecommerce/orders, /status, /cancel, /refund-requests, /shipments, /payments)
 * - Dashboard & Reports (/api/v1/ecommerce/dashboard, /api/v1/reports/ecommerce/*)
 */
@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class EcommerceAdminV1Controller {

    private final Map<String, Object> storeInfo = new LinkedHashMap<>();
    private final Map<String, Object> storeSettings = new LinkedHashMap<>();
    private final Map<String, Object> businessHours = new LinkedHashMap<>();
    private final List<Map<String, Object>> categories = new ArrayList<>();
    private final List<Map<String, Object>> products = new ArrayList<>();
    private final List<Map<String, Object>> orders = new ArrayList<>();
    private final List<Map<String, Object>> orderEvents = new ArrayList<>();
    private final List<Map<String, Object>> refundRequests = new ArrayList<>();
    private final List<Map<String, Object>> shipments = new ArrayList<>();
    private final List<Map<String, Object>> customerSegments = new ArrayList<>();

    public EcommerceAdminV1Controller() {
        initEcommerceData();
    }

    private void initEcommerceData() {
        // 1. Store Profile & Configuration
        storeInfo.put("id", "STORE-001");
        storeInfo.put("name", "UrbanStyle E-Commerce");
        storeInfo.put("brandName", "UrbanStyle");
        storeInfo.put("supportEmail", "support@urbanstyle.shop");
        storeInfo.put("phone", "+91 80 4567 8900");
        storeInfo.put("website", "https://urbanstyle.shop");
        storeInfo.put("currency", "INR");
        storeInfo.put("status", "ACTIVE");

        storeSettings.put("allowGuestCheckout", true);
        storeSettings.put("enableInventoryAlerts", true);
        storeSettings.put("defaultTaxRate", 18.0);
        storeSettings.put("freeShippingThreshold", 999.0);
        storeSettings.put("orderCancellationWindowHours", 24);

        businessHours.put("mondayToFriday", "09:00 - 21:00 IST");
        businessHours.put("saturday", "10:00 - 18:00 IST");
        businessHours.put("sunday", "11:00 - 16:00 IST");

        // 2. Categories
        categories.add(new LinkedHashMap<>(Map.of("id", "CAT-100", "name", "Clothing & Apparel", "description", "Premium cotton apparel, tees and casual wear", "status", "ACTIVE")));
        categories.add(new LinkedHashMap<>(Map.of("id", "CAT-101", "name", "Bags & Luggage", "description", "Travel backpacks, duffles and laptop bags", "status", "ACTIVE")));
        categories.add(new LinkedHashMap<>(Map.of("id", "CAT-102", "name", "Footwear", "description", "Sneakers, loafers and active sports shoes", "status", "ACTIVE")));
        categories.add(new LinkedHashMap<>(Map.of("id", "CAT-103", "name", "Accessories", "description", "Watches, wallets, caps and sunglasses", "status", "ACTIVE")));

        // 3. Products
        products.add(buildProduct("PROD-1001", "TSHIRT-001", "Premium Cotton T-Shirt", "CAT-100",
                "100% combed organic cotton, breathable everyday comfort", 799.00, "INR", 100, 10, "ACTIVE"));
        products.add(buildProduct("PROD-1002", "BAG-002", "Travel Backpack 35L", "CAT-101",
                "Water-resistant laptop travel bag with USB charging port", 1499.00, "INR", 25, 5, "ACTIVE"));
        products.add(buildProduct("PROD-1003", "SHOE-003", "Urban Sneaker Pro", "CAT-102",
                "Lightweight cushioning, durable rubber sole, streetwear design", 2499.00, "INR", 6, 8, "ACTIVE"));
        products.add(buildProduct("PROD-1004", "WATCH-004", "Minimalist Chrono Watch", "CAT-103",
                "Matte black case, Japanese quartz movement, genuine leather strap", 3299.00, "INR", 4, 5, "ACTIVE"));

        // 4. Orders
        orders.add(buildOrder("ORD-5001", "ZS-2026-5001", "CUS-1001", "Arun Kumar", "arun@example.com",
                2298.00, "INR", "PAID", "PROCESSING", List.of(
                        Map.of("productId", "PROD-1001", "name", "Premium Cotton T-Shirt", "quantity", 1, "price", 799.0),
                        Map.of("productId", "PROD-1002", "name", "Travel Backpack 35L", "quantity", 1, "price", 1499.0)
                )));
        orders.add(buildOrder("ORD-5002", "ZS-2026-5002", "CUS-1002", "Priya Sharma", "priya@example.com",
                2499.00, "INR", "PAID", "PENDING", List.of(
                        Map.of("productId", "PROD-1003", "name", "Urban Sneaker Pro", "quantity", 1, "price", 2499.0)
                )));
        orders.add(buildOrder("ORD-5003", "ZS-2026-5003", "CUS-1003", "Vikram Seth", "vikram@example.com",
                799.00, "INR", "PAID", "DELIVERED", List.of(
                        Map.of("productId", "PROD-1001", "name", "Premium Cotton T-Shirt", "quantity", 1, "price", 799.0)
                )));

        // 5. Order Events
        orderEvents.add(new LinkedHashMap<>(Map.of("id", "EVT-01", "orderId", "ORD-5001", "status", "PAID", "note", "Payment confirmed via Razorpay", "timestamp", "2026-10-23T09:30:00Z")));
        orderEvents.add(new LinkedHashMap<>(Map.of("id", "EVT-02", "orderId", "ORD-5001", "status", "PROCESSING", "note", "Order accepted for fulfillment", "timestamp", "2026-10-23T10:15:00Z")));

        // 6. Shipments
        shipments.add(new LinkedHashMap<>(Map.of(
                "shipmentId", "SHIP-1001",
                "orderId", "ORD-5001",
                "carrier", "BlueDart Express",
                "trackingNumber", "BD-98234710",
                "status", "IN_TRANSIT",
                "estimatedDelivery", "2026-10-26"
        )));

        // 7. Customer Segments
        customerSegments.add(new LinkedHashMap<>(Map.of("id", "SEG-01", "name", "High-Value Frequent Buyers", "count", 340, "criteria", "Spent > ₹5,000 in 90 days")));
        customerSegments.add(new LinkedHashMap<>(Map.of("id", "SEG-02", "name", "Cart Abandoners (Last 7 Days)", "count", 118, "criteria", "Added to cart without checkout")));
        customerSegments.add(new LinkedHashMap<>(Map.of("id", "SEG-03", "name", "First-Time Customers", "count", 520, "criteria", "Orders == 1")));
    }

    private Map<String, Object> buildProduct(String id, String sku, String name, String categoryId,
                                            String desc, double price, String currency, int stock, int lowStockThreshold, String status) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", id);
        m.put("sku", sku);
        m.put("name", name);
        m.put("categoryId", categoryId);
        m.put("description", desc);
        m.put("price", price);
        m.put("currency", currency);
        m.put("availableStock", stock);
        m.put("lowStockThreshold", lowStockThreshold);
        m.put("status", status);
        m.put("createdAt", Instant.now().toString());
        m.put("updatedAt", Instant.now().toString());
        return m;
    }

    private Map<String, Object> buildOrder(String id, String orderNumber, String customerId, String customerName, String email,
                                          double totalAmount, String currency, String paymentStatus, String orderStatus, List<Map<String, Object>> items) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", id);
        m.put("orderId", id);
        m.put("orderNumber", orderNumber);
        m.put("customerId", customerId);
        m.put("customerName", customerName);
        m.put("customerEmail", email);
        m.put("totalAmount", totalAmount);
        m.put("currency", currency);
        m.put("paymentStatus", paymentStatus);
        m.put("orderStatus", orderStatus);
        m.put("status", orderStatus);
        m.put("items", items);
        m.put("createdAt", "2026-10-23T09:30:00Z");
        return m;
    }

    // ==========================================
    // 1. Dashboard & Store Settings
    // ==========================================
    @GetMapping("/ecommerce/dashboard")
    public ResponseEntity<?> getDashboard(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to
    ) {
        long lowStockCount = products.stream()
                .filter(p -> ((Number) p.get("availableStock")).intValue() <= ((Number) p.get("lowStockThreshold")).intValue())
                .count();

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("period", Map.of("from", from != null ? from : "2026-10-01", "to", to != null ? to : "2026-10-23"));
        data.put("metrics", Map.of(
                "totalOrders", 245,
                "pendingOrders", 18,
                "totalCustomers", 1830,
                "newLeads", 126,
                "openConversations", 32,
                "lowStockProducts", lowStockCount
        ));
        data.put("sales", Map.of(
                "grossSales", 325000.00,
                "currency", "INR"
        ));
        data.put("ai", Map.of(
                "totalConversations", 850,
                "resolvedWithoutHuman", 620,
                "escalatedToHuman", 230
        ));

        return ResponseEntity.ok(Map.of("success", true, "data", data));
    }

    @GetMapping("/ecommerce/store")
    public ResponseEntity<?> getStore() {
        return ResponseEntity.ok(Map.of("success", true, "data", storeInfo));
    }

    @PutMapping("/ecommerce/store")
    public ResponseEntity<?> updateStore(@RequestBody Map<String, Object> updates) {
        storeInfo.putAll(updates);
        return ResponseEntity.ok(Map.of("success", true, "message", "Store updated successfully", "data", storeInfo));
    }

    @GetMapping("/ecommerce/store/settings")
    public ResponseEntity<?> getStoreSettings() {
        return ResponseEntity.ok(Map.of("success", true, "data", storeSettings));
    }

    @PutMapping("/ecommerce/store/settings")
    public ResponseEntity<?> updateStoreSettings(@RequestBody Map<String, Object> updates) {
        storeSettings.putAll(updates);
        return ResponseEntity.ok(Map.of("success", true, "message", "Settings updated successfully", "data", storeSettings));
    }

    @GetMapping("/ecommerce/store/business-hours")
    public ResponseEntity<?> getBusinessHours() {
        return ResponseEntity.ok(Map.of("success", true, "data", businessHours));
    }

    @PutMapping("/ecommerce/store/business-hours")
    public ResponseEntity<?> updateBusinessHours(@RequestBody Map<String, Object> updates) {
        businessHours.putAll(updates);
        return ResponseEntity.ok(Map.of("success", true, "message", "Business hours updated", "data", businessHours));
    }

    // ==========================================
    // 2. Categories
    // ==========================================
    @GetMapping("/ecommerce/categories")
    public ResponseEntity<?> getCategories() {
        return ResponseEntity.ok(Map.of("success", true, "data", categories));
    }

    @PostMapping("/ecommerce/categories")
    public ResponseEntity<?> createCategory(@RequestBody Map<String, Object> req) {
        String id = "CAT-" + (categories.size() + 100);
        Map<String, Object> cat = new LinkedHashMap<>(req);
        cat.put("id", id);
        categories.add(cat);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "Category created successfully",
                "data", cat
        ));
    }

    @GetMapping("/ecommerce/categories/{id}")
    public ResponseEntity<?> getCategory(@PathVariable String id) {
        return categories.stream()
                .filter(c -> id.equals(c.get("id")))
                .findFirst()
                .map(c -> ResponseEntity.ok(Map.of("success", true, "data", c)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Category not found")));
    }

    @PutMapping("/ecommerce/categories/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable String id, @RequestBody Map<String, Object> updates) {
        for (Map<String, Object> c : categories) {
            if (id.equals(c.get("id"))) {
                c.putAll(updates);
                return ResponseEntity.ok(Map.of("success", true, "message", "Category updated successfully", "data", c));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Category not found"));
    }

    @DeleteMapping("/ecommerce/categories/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable String id) {
        categories.removeIf(c -> id.equals(c.get("id")));
        return ResponseEntity.ok(Map.of("success", true, "message", "Category removed successfully"));
    }

    // ==========================================
    // 3. Products & Inventory
    // ==========================================
    @GetMapping("/ecommerce/products")
    public ResponseEntity<?> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status
    ) {
        List<Map<String, Object>> filtered = products.stream()
                .filter(p -> status == null || status.equalsIgnoreCase((String) p.get("status")))
                .toList();

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", filtered,
                "pagination", Map.of(
                        "page", page,
                        "size", size,
                        "totalElements", filtered.size(),
                        "totalPages", 1
                )
        ));
    }

    @PostMapping("/ecommerce/products")
    public ResponseEntity<?> createProduct(@RequestBody Map<String, Object> req) {
        String sku = (String) req.getOrDefault("sku", "SKU-" + System.currentTimeMillis());
        boolean skuExists = products.stream().anyMatch(p -> sku.equalsIgnoreCase((String) p.get("sku")));
        if (skuExists) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                    "success", false,
                    "errorCode", "INVENTORY_CONFLICT",
                    "message", "A product with SKU '" + sku + "' already exists in this tenant"
            ));
        }

        String id = "PROD-" + (products.size() + 1001);
        String name = (String) req.getOrDefault("name", "Product Name");
        String catId = (String) req.getOrDefault("categoryId", "CAT-100");
        String desc = (String) req.getOrDefault("description", "");
        double price = req.get("price") != null ? Double.parseDouble(req.get("price").toString()) : 0.0;
        String currency = (String) req.getOrDefault("currency", "INR");
        int initialStock = req.get("initialStock") != null ? Integer.parseInt(req.get("initialStock").toString()) : 0;
        int lowStock = req.get("lowStockThreshold") != null ? Integer.parseInt(req.get("lowStockThreshold").toString()) : 5;
        String status = (String) req.getOrDefault("status", "ACTIVE");

        Map<String, Object> prod = buildProduct(id, sku, name, catId, desc, price, currency, initialStock, lowStock, status);
        products.add(0, prod);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "Product created successfully",
                "data", prod
        ));
    }

    @GetMapping("/ecommerce/products/{id}")
    public ResponseEntity<?> getProduct(@PathVariable String id) {
        return products.stream()
                .filter(p -> id.equals(p.get("id")))
                .findFirst()
                .map(p -> ResponseEntity.ok(Map.of("success", true, "data", p)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Product not found")));
    }

    @PutMapping("/ecommerce/products/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable String id, @RequestBody Map<String, Object> req) {
        for (Map<String, Object> p : products) {
            if (id.equals(p.get("id"))) {
                if (req.containsKey("name")) p.put("name", req.get("name"));
                if (req.containsKey("description")) p.put("description", req.get("description"));
                if (req.containsKey("categoryId")) p.put("categoryId", req.get("categoryId"));
                if (req.containsKey("price")) p.put("price", Double.parseDouble(req.get("price").toString()));
                if (req.containsKey("currency")) p.put("currency", req.get("currency"));
                if (req.containsKey("lowStockThreshold")) p.put("lowStockThreshold", Integer.parseInt(req.get("lowStockThreshold").toString()));
                p.put("updatedAt", Instant.now().toString());

                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Product updated successfully",
                        "data", p
                ));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Product not found"));
    }

    @PatchMapping("/ecommerce/products/{id}/status")
    public ResponseEntity<?> updateProductStatus(@PathVariable String id, @RequestBody Map<String, Object> req) {
        for (Map<String, Object> p : products) {
            if (id.equals(p.get("id"))) {
                p.put("status", req.getOrDefault("status", "ACTIVE"));
                return ResponseEntity.ok(Map.of("success", true, "message", "Product status updated", "data", p));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Product not found"));
    }

    @GetMapping("/ecommerce/products/{id}/inventory")
    public ResponseEntity<?> getProductInventory(@PathVariable String id) {
        for (Map<String, Object> p : products) {
            if (id.equals(p.get("id"))) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "data", Map.of(
                                "productId", id,
                                "sku", p.get("sku"),
                                "availableStock", p.get("availableStock"),
                                "lowStockThreshold", p.get("lowStockThreshold")
                        )
                ));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Product not found"));
    }

    @PutMapping("/ecommerce/products/{id}/inventory")
    public ResponseEntity<?> updateProductInventory(@PathVariable String id, @RequestBody Map<String, Object> req) {
        for (Map<String, Object> p : products) {
            if (id.equals(p.get("id"))) {
                int stock = Integer.parseInt(req.get("availableStock").toString());
                p.put("availableStock", stock);
                p.put("updatedAt", Instant.now().toString());
                return ResponseEntity.ok(Map.of("success", true, "message", "Stock updated successfully", "data", p));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Product not found"));
    }

    @GetMapping("/ecommerce/inventory/low-stock")
    public ResponseEntity<?> getLowStockProducts() {
        List<Map<String, Object>> lowStock = products.stream()
                .filter(p -> ((Number) p.get("availableStock")).intValue() <= ((Number) p.get("lowStockThreshold")).intValue())
                .toList();
        return ResponseEntity.ok(Map.of("success", true, "data", lowStock, "count", lowStock.size()));
    }

    // ==========================================
    // 4. Orders & Fulfillment
    // ==========================================
    @GetMapping("/ecommerce/orders")
    public ResponseEntity<?> getOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status
    ) {
        List<Map<String, Object>> filtered = orders.stream()
                .filter(o -> status == null || status.equalsIgnoreCase((String) o.get("orderStatus")))
                .toList();

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", filtered,
                "pagination", Map.of(
                        "page", page,
                        "size", size,
                        "totalElements", filtered.size(),
                        "totalPages", 1
                )
        ));
    }

    @PostMapping("/ecommerce/orders")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> req) {
        String id = "ORD-" + (orders.size() + 5001);
        String ordNum = "ZS-2026-" + (orders.size() + 5001);
        String cusId = (String) req.getOrDefault("customerId", "CUS-1001");
        String cusName = (String) req.getOrDefault("customerName", "Customer");
        String email = (String) req.getOrDefault("email", "customer@example.com");
        double total = req.get("totalAmount") != null ? Double.parseDouble(req.get("totalAmount").toString()) : 799.0;
        String cur = (String) req.getOrDefault("currency", "INR");

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> items = (List<Map<String, Object>>) req.getOrDefault("items", List.of());

        Map<String, Object> ord = buildOrder(id, ordNum, cusId, cusName, email, total, cur, "PAID", "PENDING", items);
        orders.add(0, ord);

        orderEvents.add(new LinkedHashMap<>(Map.of(
                "id", "EVT-" + System.currentTimeMillis(),
                "orderId", id,
                "status", "PENDING",
                "note", "Order placed by customer",
                "timestamp", Instant.now().toString()
        )));

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "message", "Order created", "data", ord));
    }

    @GetMapping("/ecommerce/orders/{id}")
    public ResponseEntity<?> getOrder(@PathVariable String id) {
        return orders.stream()
                .filter(o -> id.equals(o.get("id")) || id.equals(o.get("orderId")))
                .findFirst()
                .map(o -> ResponseEntity.ok(Map.of("success", true, "data", o)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Order not found")));
    }

    @PatchMapping("/ecommerce/orders/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable String id, @RequestBody Map<String, Object> req) {
        for (Map<String, Object> o : orders) {
            if (id.equals(o.get("id")) || id.equals(o.get("orderId"))) {
                String newStatus = (String) req.get("status");
                o.put("orderStatus", newStatus);
                o.put("status", newStatus);

                orderEvents.add(new LinkedHashMap<>(Map.of(
                        "id", "EVT-" + System.currentTimeMillis(),
                        "orderId", id,
                        "status", newStatus,
                        "note", req.getOrDefault("reason", "Order status updated"),
                        "timestamp", Instant.now().toString()
                )));

                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Order status updated successfully",
                        "data", Map.of(
                                "orderId", id,
                                "orderStatus", newStatus,
                                "updatedAt", Instant.now().toString()
                        )
                ));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Order not found"));
    }

    @GetMapping("/ecommerce/orders/{id}/events")
    public ResponseEntity<?> getOrderEvents(@PathVariable String id) {
        List<Map<String, Object>> events = orderEvents.stream()
                .filter(e -> id.equals(e.get("orderId")))
                .toList();
        return ResponseEntity.ok(Map.of("success", true, "orderId", id, "events", events));
    }

    @PostMapping("/ecommerce/orders/{id}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable String id, @RequestBody(required = false) Map<String, Object> req) {
        for (Map<String, Object> o : orders) {
            if (id.equals(o.get("id")) || id.equals(o.get("orderId"))) {
                o.put("orderStatus", "CANCELLED");
                o.put("status", "CANCELLED");
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Cancellation requested and processed",
                        "data", Map.of("orderId", id, "status", "CANCELLED", "cancelledAt", Instant.now().toString())
                ));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Order not found"));
    }

    @PostMapping("/ecommerce/orders/{id}/refund-requests")
    public ResponseEntity<?> createRefundRequest(@PathVariable String id, @RequestBody Map<String, Object> req) {
        Map<String, Object> refund = new LinkedHashMap<>(req);
        refund.put("refundId", "REF-" + System.currentTimeMillis());
        refund.put("orderId", id);
        refund.put("status", "PENDING_VERIFICATION");
        refund.put("createdAt", Instant.now().toString());
        refundRequests.add(refund);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "Refund request created and queued for payment gateway verification",
                "data", refund
        ));
    }

    @GetMapping("/ecommerce/orders/{id}/shipments")
    public ResponseEntity<?> getOrderShipments(@PathVariable String id) {
        List<Map<String, Object>> orderShipments = shipments.stream()
                .filter(s -> id.equals(s.get("orderId")))
                .toList();
        return ResponseEntity.ok(Map.of("success", true, "orderId", id, "shipments", orderShipments));
    }

    @PostMapping("/ecommerce/orders/{id}/shipments")
    public ResponseEntity<?> registerShipment(@PathVariable String id, @RequestBody Map<String, Object> req) {
        Map<String, Object> s = new LinkedHashMap<>(req);
        s.put("shipmentId", "SHIP-" + (shipments.size() + 1001));
        s.put("orderId", id);
        s.put("status", "LABEL_CREATED");
        s.put("createdAt", Instant.now().toString());
        shipments.add(s);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "message", "Shipment registered", "data", s));
    }

    @GetMapping("/ecommerce/orders/{id}/payments")
    public ResponseEntity<?> getOrderPayments(@PathVariable String id) {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "orderId", id,
                "paymentMethod", "ONLINE_RAZORPAY",
                "paymentStatus", "CAPTURED",
                "currency", "INR",
                "verifiedByGateway", true
        ));
    }

    // ==========================================
    // 5. Customer Segments
    // ==========================================
    @GetMapping("/crm/segments")
    public ResponseEntity<?> getSegments() {
        return ResponseEntity.ok(Map.of("success", true, "data", customerSegments));
    }

    @PostMapping("/crm/segments")
    public ResponseEntity<?> createSegment(@RequestBody Map<String, Object> req) {
        Map<String, Object> seg = new LinkedHashMap<>(req);
        seg.put("id", "SEG-0" + (customerSegments.size() + 1));
        customerSegments.add(seg);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "data", seg));
    }

    // ==========================================
    // 6. Reports Endpoints
    // ==========================================
    @GetMapping("/reports/ecommerce/sales")
    public ResponseEntity<?> getSalesReport() {
        return ResponseEntity.ok(Map.of("success", true, "data", Map.of(
                "grossSales", 325000.00,
                "currency", "INR",
                "netSales", 308750.00,
                "refundsAmount", 16250.00,
                "averageOrderValue", 1326.50,
                "salesGrowthMonthOverMonth", "+18.4%"
        )));
    }

    @GetMapping("/reports/ecommerce/orders")
    public ResponseEntity<?> getOrdersReport() {
        return ResponseEntity.ok(Map.of("success", true, "data", Map.of(
                "totalOrders", 245,
                "fulfilledOrders", 227,
                "pendingOrders", 18,
                "cancelledOrders", 8,
                "fulfillmentRate", "92.6%"
        )));
    }

    @GetMapping("/reports/ecommerce/products")
    public ResponseEntity<?> getProductPerformanceReport() {
        return ResponseEntity.ok(Map.of("success", true, "data", Map.of(
                "topSellingSku", "TSHIRT-001 (Premium Cotton T-Shirt)",
                "unitsSold", 480,
                "highestRevenueProduct", "Minimalist Chrono Watch (₹1.58 Lakhs)",
                "fastestMovingCategory", "Clothing & Apparel"
        )));
    }

    @GetMapping("/ecommerce/sales-funnel")
    public ResponseEntity<Map<String, Object>> getSalesFunnel() {
        Map<String, Object> funnel = new LinkedHashMap<>();
        funnel.put("visitors", 12480);
        funnel.put("productViews", 8624);
        funnel.put("addToCart", 1842);
        funnel.put("purchases", 436);
        return ResponseEntity.ok(Map.of("success", true, "funnel", funnel));
    }

    @GetMapping("/ecommerce/carts/abandoned")
    public ResponseEntity<Map<String, Object>> getAbandonedCarts() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "items", List.of(
                        Map.of("id", "CART-EC-101", "cartValue", 79999, "customerName", "Pooja Hegde", "itemCount", 2)
                )
        ));
    }
}
