package com.zenelait.crm.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

/**
 * Zenelait AI CRM — Manufacturing Company Admin V1 REST API Controller
 * Implements Part 3 Manufacturing Company Admin API Catalogue:
 * - Dashboard & Settings (/api/v1/manufacturing/dashboard, /settings, /product-categories)
 * - Products, Specs & Documents (/api/v1/manufacturing/products, /specifications, /documents, /inventory)
 * - Dealers & Distributors (/api/v1/manufacturing/partners, /orders)
 * - B2B Enquiries & Quotations (/api/v1/manufacturing/enquiries, /quotations, /send, /accept)
 * - Sales Orders & Support Tickets (/api/v1/manufacturing/orders, /support-tickets)
 * - Reports (/api/v1/reports/manufacturing/*)
 */
@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class ManufacturingAdminV1Controller {

    private final Map<String, Object> mfgSettings = new LinkedHashMap<>();
    private final List<Map<String, Object>> categories = new ArrayList<>();
    private final List<Map<String, Object>> products = new ArrayList<>();
    private final List<Map<String, Object>> partners = new ArrayList<>();
    private final List<Map<String, Object>> enquiries = new ArrayList<>();
    private final List<Map<String, Object>> quotations = new ArrayList<>();
    private final List<Map<String, Object>> salesOrders = new ArrayList<>();
    private final List<Map<String, Object>> supportTickets = new ArrayList<>();

    public ManufacturingAdminV1Controller() {
        initManufacturingData();
    }

    private void initManufacturingData() {
        // 1. Settings
        mfgSettings.put("companyName", "Apex Precision Engineering & Hydraulics");
        mfgSettings.put("defaultCurrency", "INR");
        mfgSettings.put("gstNumber", "33AABCA1234F1Z8");
        mfgSettings.put("plantLocation", "Industrial Corridor, Sriperumbudur, Tamil Nadu");
        mfgSettings.put("standardWarrantyMonths", 24);
        mfgSettings.put("minimumOrderQuantityDefault", 50);

        // 2. Categories
        Map<String, Object> c1 = new LinkedHashMap<>();
        c1.put("id", "MCAT-001");
        c1.put("name", "Hydraulic Pumps & Valves");
        c1.put("code", "HYD-PUMP");
        c1.put("description", "High-pressure industrial hydraulic direction and flow control valves");
        categories.add(c1);

        Map<String, Object> c2 = new LinkedHashMap<>();
        c2.put("id", "MCAT-002");
        c2.put("name", "Electric Motors & Drives");
        c2.put("code", "ELEC-MTR");
        c2.put("description", "Heavy duty 3-phase induction motors, squirrel cage and servo drives");
        categories.add(c2);

        // 3. Products
        Map<String, Object> p1 = new LinkedHashMap<>();
        p1.put("id", "MPROD-001");
        p1.put("productCode", "MTR-001");
        p1.put("name", "Industrial Electric Motor 5.5kW");
        p1.put("categoryId", "MCAT-002");
        p1.put("unitOfMeasure", "UNIT");
        p1.put("currency", "INR");
        p1.put("listPrice", 25000.00);
        p1.put("minOrderQty", 10);
        p1.put("availableStock", 85);
        p1.put("status", "ACTIVE");
        p1.put("specifications", List.of(
                Map.of("name", "Rated Power", "value", "5.5", "unit", "kW"),
                Map.of("name", "Rated Voltage", "value", "415", "unit", "V"),
                Map.of("name", "Frequency", "value", "50", "unit", "Hz"),
                Map.of("name", "Protection Class", "value", "IP55", "unit", "")
        ));
        products.add(p1);

        Map<String, Object> p2 = new LinkedHashMap<>();
        p2.put("id", "MPROD-002");
        p2.put("productCode", "VAL-HV40");
        p2.put("name", "Stainless Steel Hydraulic Valve HV-40");
        p2.put("categoryId", "MCAT-001");
        p2.put("unitOfMeasure", "UNIT");
        p2.put("currency", "INR");
        p2.put("listPrice", 2800.00);
        p2.put("minOrderQty", 50);
        p2.put("availableStock", 420);
        p2.put("status", "ACTIVE");
        p2.put("specifications", List.of(
                Map.of("name", "Material Grade", "value", "SS-316", "unit", ""),
                Map.of("name", "Max Working Pressure", "value", "350", "unit", "BAR"),
                Map.of("name", "Flow Rate", "value", "40", "unit", "LPM")
        ));
        products.add(p2);

        // 4. Partners (Dealers & Distributors)
        Map<String, Object> d1 = new LinkedHashMap<>();
        d1.put("id", "PARTNER-001");
        d1.put("partnerCode", "DIST-001");
        d1.put("companyName", "ABC Industrial Supplies Pvt Ltd");
        d1.put("partnerType", "DISTRIBUTOR");
        d1.put("contactName", "Ravi Kumar");
        d1.put("email", "ravi@abcindustrial.in");
        d1.put("phone", "+91 98765 43210");
        d1.put("city", "Chennai");
        d1.put("tier", "TIER_1");
        d1.put("discountPercent", 15.0);
        d1.put("status", "ACTIVE");
        partners.add(d1);

        Map<String, Object> d2 = new LinkedHashMap<>();
        d2.put("id", "PARTNER-002");
        d2.put("partnerCode", "DLR-002");
        d2.put("companyName", "Southern Hydraulic Solutions");
        d2.put("partnerType", "DEALER");
        d2.put("contactName", "Manoj Pillai");
        d2.put("email", "manoj@southernhydraulics.com");
        d2.put("phone", "+91 98400 55667");
        d2.put("city", "Coimbatore");
        d2.put("tier", "TIER_2");
        d2.put("discountPercent", 10.0);
        d2.put("status", "ACTIVE");
        partners.add(d2);

        // 5. Enquiries
        Map<String, Object> e1 = new LinkedHashMap<>();
        e1.put("id", "MENQ-001");
        e1.put("companyName", "XYZ Heavy Engineering Ltd");
        e1.put("contactName", "Suresh Kumar");
        e1.put("email", "suresh@xyzeng.com");
        e1.put("phone", "+91 98401 23456");
        e1.put("productInterest", "Stainless Steel Hydraulic Valve HV-40");
        e1.put("estimatedQuantity", 50);
        e1.put("expectedPurchaseDate", "2026-12-15");
        e1.put("stage", "QUALIFIED");
        e1.put("source", "WEBSITE_CHAT");
        e1.put("createdAt", "2026-10-24T05:30:00Z");
        enquiries.add(e1);

        // 6. Quotations
        Map<String, Object> q1 = new LinkedHashMap<>();
        q1.put("id", "MQUO-001");
        q1.put("quotationNumber", "MFG-2026-001");
        q1.put("enquiryId", "MENQ-001");
        q1.put("companyName", "XYZ Heavy Engineering Ltd");
        q1.put("productCode", "VAL-HV40");
        q1.put("quantity", 500);
        q1.put("unitPrice", 2300.00);
        q1.put("subtotal", 1150000.00);
        q1.put("currency", "INR");
        q1.put("validUntil", "2026-11-30");
        q1.put("status", "SENT");
        q1.put("createdAt", "2026-10-24T06:00:00Z");
        quotations.add(q1);

        // 7. Orders
        Map<String, Object> o1 = new LinkedHashMap<>();
        o1.put("id", "MORD-001");
        o1.put("orderNumber", "MFG-ORD-2026-001");
        o1.put("companyName", "ABC Industrial Supplies Pvt Ltd");
        o1.put("quotationNumber", "MQUO-001");
        o1.put("totalAmount", 1150000.00);
        o1.put("currency", "INR");
        o1.put("orderStatus", "PRODUCTION_SCHEDULED");
        o1.put("paymentStatus", "ADVANCE_PAID");
        o1.put("deliveryDate", "2026-11-20");
        o1.put("createdAt", "2026-10-24T07:15:00Z");
        salesOrders.add(o1);

        // 8. Support Tickets
        Map<String, Object> t1 = new LinkedHashMap<>();
        t1.put("id", "MTKT-001");
        t1.put("ticketNumber", "TCK-MFG-001");
        t1.put("companyName", "XYZ Heavy Engineering Ltd");
        t1.put("productCode", "MTR-001");
        t1.put("subject", "Wiring schematic for Delta configuration 415V");
        t1.put("priority", "HIGH");
        t1.put("status", "RESOLVED");
        t1.put("assignedEngineer", "Karthik Nair");
        t1.put("createdAt", "2026-10-23T11:00:00Z");
        supportTickets.add(t1);
    }

    // ==========================================
    // 7.1 DASHBOARD & SETTINGS
    // ==========================================

    @GetMapping("/manufacturing/dashboard")
    public ResponseEntity<Map<String, Object>> getManufacturingDashboard(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {

        Map<String, Object> metrics = new LinkedHashMap<>();
        metrics.put("newB2BEnquiries", 120 + enquiries.size());
        metrics.put("qualifiedLeads", 70);
        metrics.put("quotationsSent", 55 + quotations.size());
        metrics.put("ordersPendingApproval", 12);
        metrics.put("openSupportTickets", 18);

        Map<String, Object> sales = new LinkedHashMap<>();
        sales.put("quotedValue", 8500000.00);
        sales.put("confirmedOrderValue", 5200000.00);
        sales.put("currency", "INR");

        Map<String, Object> ai = new LinkedHashMap<>();
        ai.put("totalConversations", 430);
        ai.put("resolvedWithoutHuman", 300);
        ai.put("escalatedToHuman", 130);
        ai.put("resolutionRate", 69.7);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("period", Map.of("from", from != null ? from : "2026-10-01", "to", to != null ? to : "2026-10-24"));
        data.put("metrics", metrics);
        data.put("sales", sales);
        data.put("ai", ai);

        return ResponseEntity.ok(Map.of("success", true, "data", data));
    }

    @GetMapping("/manufacturing/settings")
    public ResponseEntity<Map<String, Object>> getManufacturingSettings() {
        return ResponseEntity.ok(Map.of("success", true, "data", mfgSettings));
    }

    @PutMapping("/manufacturing/settings")
    public ResponseEntity<Map<String, Object>> updateManufacturingSettings(@RequestBody Map<String, Object> updates) {
        mfgSettings.putAll(updates);
        return ResponseEntity.ok(Map.of("success", true, "message", "Manufacturing settings updated", "data", mfgSettings));
    }

    @GetMapping("/manufacturing/product-categories")
    public ResponseEntity<Map<String, Object>> getProductCategories() {
        return ResponseEntity.ok(Map.of("success", true, "data", categories));
    }

    // ==========================================
    // 7.2 PRODUCTS & SPECIFICATIONS
    // ==========================================

    @GetMapping("/manufacturing/products")
    public ResponseEntity<Map<String, Object>> getProducts() {
        return ResponseEntity.ok(Map.of("success", true, "data", products));
    }

    @PostMapping("/manufacturing/products")
    public ResponseEntity<Map<String, Object>> createProduct(@RequestBody Map<String, Object> req) {
        String id = "MPROD-" + String.format("%03d", products.size() + 1);
        Map<String, Object> p = new LinkedHashMap<>(req);
        p.put("id", id);
        p.putIfAbsent("status", "ACTIVE");
        p.putIfAbsent("currency", "INR");
        products.add(0, p);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "message", "Manufacturing product created successfully", "data", p));
    }

    @GetMapping("/manufacturing/products/{productId}")
    public ResponseEntity<Map<String, Object>> getProduct(@PathVariable String productId) {
        return products.stream()
                .filter(p -> productId.equalsIgnoreCase((String) p.get("id")))
                .findFirst()
                .map(p -> ResponseEntity.ok(Map.of("success", true, "data", p)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Product not found")));
    }

    @PutMapping("/manufacturing/products/{productId}/specifications")
    public ResponseEntity<Map<String, Object>> updateProductSpecs(@PathVariable String productId, @RequestBody Map<String, Object> req) {
        for (Map<String, Object> p : products) {
            if (productId.equalsIgnoreCase((String) p.get("id"))) {
                p.put("specifications", req.get("specifications"));
                return ResponseEntity.ok(Map.of("success", true, "message", "Product specifications updated successfully", "data", p));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Product not found"));
    }

    @GetMapping("/manufacturing/inventory")
    public ResponseEntity<Map<String, Object>> getInventory() {
        List<Map<String, Object>> inv = new ArrayList<>();
        for (Map<String, Object> p : products) {
            inv.add(Map.of(
                    "productId", p.get("id"),
                    "productCode", p.get("productCode"),
                    "name", p.get("name"),
                    "availableStock", p.get("availableStock"),
                    "reservedStock", 25,
                    "unitOfMeasure", p.get("unitOfMeasure")
            ));
        }
        return ResponseEntity.ok(Map.of("success", true, "data", inv));
    }

    // ==========================================
    // 7.3 PARTNERS (DEALERS & DISTRIBUTORS)
    // ==========================================

    @GetMapping("/manufacturing/partners")
    public ResponseEntity<Map<String, Object>> getPartners() {
        return ResponseEntity.ok(Map.of("success", true, "data", partners));
    }

    @PostMapping("/manufacturing/partners")
    public ResponseEntity<Map<String, Object>> createPartner(@RequestBody Map<String, Object> req) {
        String id = "PARTNER-" + String.format("%03d", partners.size() + 1);
        Map<String, Object> pt = new LinkedHashMap<>(req);
        pt.put("id", id);
        pt.putIfAbsent("status", "ACTIVE");
        partners.add(pt);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "message", "Business partner created successfully", "data", pt));
    }

    // ==========================================
    // 7.4 B2B ENQUIRIES & QUOTATIONS
    // ==========================================

    @GetMapping("/manufacturing/enquiries")
    public ResponseEntity<Map<String, Object>> getEnquiries() {
        return ResponseEntity.ok(Map.of("success", true, "data", enquiries));
    }

    @PostMapping("/manufacturing/enquiries")
    public ResponseEntity<Map<String, Object>> createEnquiry(@RequestBody Map<String, Object> req) {
        String id = "MENQ-" + String.format("%03d", enquiries.size() + 1);
        Map<String, Object> e = new LinkedHashMap<>(req);
        e.put("id", id);
        e.putIfAbsent("stage", "NEW");
        e.put("createdAt", Instant.now().toString());
        enquiries.add(0, e);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "message", "B2B enquiry created successfully", "data", e));
    }

    @GetMapping("/manufacturing/quotations")
    public ResponseEntity<Map<String, Object>> getQuotations() {
        return ResponseEntity.ok(Map.of("success", true, "data", quotations));
    }

    @PostMapping("/manufacturing/quotations")
    public ResponseEntity<Map<String, Object>> createQuotation(@RequestBody Map<String, Object> req) {
        String id = "MQUO-" + String.format("%03d", quotations.size() + 1);
        String qNum = "MFG-2026-" + String.format("%03d", quotations.size() + 1);
        Map<String, Object> q = new LinkedHashMap<>(req);
        q.put("id", id);
        q.put("quotationNumber", qNum);
        q.putIfAbsent("status", "DRAFT");
        q.putIfAbsent("currency", "INR");
        q.put("createdAt", Instant.now().toString());
        quotations.add(0, q);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "message", "Manufacturing quotation created successfully", "data", q));
    }

    @PostMapping("/manufacturing/quotations/{quotationId}/send")
    public ResponseEntity<Map<String, Object>> sendQuotation(@PathVariable String quotationId) {
        for (Map<String, Object> q : quotations) {
            if (quotationId.equalsIgnoreCase((String) q.get("id"))) {
                q.put("status", "SENT");
                return ResponseEntity.ok(Map.of("success", true, "message", "Quotation sent to buyer", "data", q));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Quotation not found"));
    }

    // ==========================================
    // 7.5 SALES ORDERS & SUPPORT TICKETS
    // ==========================================

    @GetMapping("/manufacturing/orders")
    public ResponseEntity<Map<String, Object>> getOrders() {
        return ResponseEntity.ok(Map.of("success", true, "data", salesOrders));
    }

    @PostMapping("/manufacturing/orders")
    public ResponseEntity<Map<String, Object>> createOrder(@RequestBody Map<String, Object> req) {
        String id = "MORD-" + String.format("%03d", salesOrders.size() + 1);
        String ordNum = "MFG-ORD-2026-" + String.format("%03d", salesOrders.size() + 1);
        Map<String, Object> o = new LinkedHashMap<>(req);
        o.put("id", id);
        o.put("orderNumber", ordNum);
        o.putIfAbsent("orderStatus", "PENDING_APPROVAL");
        o.putIfAbsent("paymentStatus", "UNPAID");
        o.put("createdAt", Instant.now().toString());
        salesOrders.add(0, o);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "message", "Sales order created successfully", "data", o));
    }

    @GetMapping("/manufacturing/support-tickets")
    public ResponseEntity<Map<String, Object>> getSupportTickets() {
        return ResponseEntity.ok(Map.of("success", true, "data", supportTickets));
    }

    @PostMapping("/manufacturing/support-tickets")
    public ResponseEntity<Map<String, Object>> createSupportTicket(@RequestBody Map<String, Object> req) {
        String id = "MTKT-" + String.format("%03d", supportTickets.size() + 1);
        String tNum = "TCK-MFG-" + String.format("%03d", supportTickets.size() + 1);
        Map<String, Object> t = new LinkedHashMap<>(req);
        t.put("id", id);
        t.put("ticketNumber", tNum);
        t.putIfAbsent("status", "OPEN");
        t.put("createdAt", Instant.now().toString());
        supportTickets.add(0, t);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "message", "Support ticket registered", "data", t));
    }

    // ==========================================
    // 7.6 REPORTS
    // ==========================================

    @GetMapping("/reports/manufacturing/sales")
    public ResponseEntity<Map<String, Object>> getSalesReports() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of(
                        "totalQuotedValue", 8500000.00,
                        "confirmedOrderValue", 5200000.00,
                        "currency", "INR",
                        "topProducts", List.of(
                                Map.of("code", "VAL-HV40", "name", "Hydraulic Valve HV-40", "unitsSold", 1450, "revenue", 3335000.00),
                                Map.of("code", "MTR-001", "name", "Electric Motor 5.5kW", "unitsSold", 75, "revenue", 1865000.00)
                        )
                )
        ));
    }

    @GetMapping("/manufacturing/rfqs")
    public ResponseEntity<List<Map<String, Object>>> getRfqs() {
        return ResponseEntity.ok(List.of(
                Map.of("id", "RFQ-MFG-2001", "leadId", "LEAD-MFG-1001", "buyerCompany", "ABC Industrial Ltd", "status", "RECEIVED", "itemCount", 1, "currency", "INR")
        ));
    }

    @GetMapping("/manufacturing/purchase-orders")
    public ResponseEntity<List<Map<String, Object>>> getPurchaseOrders() {
        return ResponseEntity.ok(List.of(
                Map.of("id", "PO-MFG-4001", "purchaseOrderNumber", "ABC-PO-2026-501", "buyerCompany", "ABC Industrial Ltd", "amount", 1250000, "status", "CONFIRMED")
        ));
    }
}
