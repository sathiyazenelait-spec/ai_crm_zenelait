package com.zenelait.crm.industry.manufacturing;

import com.zenelait.crm.common.exception.ResourceNotFoundException;
import com.zenelait.crm.tenant.TenantSecurityService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

// @RestController
// @RequestMapping("/api/v1/manufacturing/legacy")
// @CrossOrigin(origins = "*")
public class ManufacturingController {

    private final TenantSecurityService tenantSecurityService;
    private final Map<String, Map<String, Object>> rfqs = new LinkedHashMap<>();
    private final Map<String, Map<String, Object>> quotations = new LinkedHashMap<>();
    private final Map<String, Map<String, Object>> purchaseOrders = new LinkedHashMap<>();

    public ManufacturingController(TenantSecurityService tenantSecurityService) {
        this.tenantSecurityService = tenantSecurityService;
        initData();
    }

    private void initData() {
        rfqs.put("RFQ-MFG-2001", Map.of(
                "id", "RFQ-MFG-2001",
                "leadId", "LEAD-MFG-1001",
                "buyerCompany", "ABC Industrial Ltd",
                "status", "RECEIVED",
                "itemCount", 1,
                "currency", "INR"
        ));
    }

    @GetMapping("/products")
    public ResponseEntity<List<Map<String, Object>>> getProducts() {
        return ResponseEntity.ok(List.of(
                Map.of("id", "MOTOR-101", "name", "Heavy Duty Induction Motor 5.5KW", "partNumber", "IND-MTR-5.5KW-415V", "unitPrice", 8500, "currency", "INR"),
                Map.of("id", "VALVE-201", "name", "Pneumatic Control Valve 2-Inch", "partNumber", "PCV-2IN-SS316", "unitPrice", 14500, "currency", "INR")
        ));
    }

    @GetMapping("/accounts")
    public ResponseEntity<List<Map<String, Object>>> getAccounts() {
        return ResponseEntity.ok(List.of(
                Map.of("id", "ACC-MFG-1", "companyName", "ABC Industrial Ltd", "creditLimit", 10000000, "paymentTerms", "NET_30", "status", "VERIFIED")
        ));
    }

    @PostMapping("/requirements")
    public ResponseEntity<Map<String, Object>> captureRequirements(@RequestBody Map<String, Object> body) {
        Map<String, Object> res = new LinkedHashMap<>(body);
        res.put("id", "REQ-MFG-" + (1000 + (long)(Math.random() * 9000)));
        res.put("status", "ANALYZED");
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @PostMapping("/rfqs")
    public ResponseEntity<Map<String, Object>> createRfq(@RequestBody Map<String, Object> body) {
        String id = "RFQ-MFG-2001";
        Map<String, Object> rfq = new LinkedHashMap<>(body);
        rfq.put("id", id);
        rfq.put("status", "RECEIVED");
        List<?> items = (List<?>) body.get("items");
        rfq.put("itemCount", items != null ? items.size() : 1);
        rfqs.put(id, rfq);
        return ResponseEntity.status(HttpStatus.CREATED).body(rfq);
    }

    @GetMapping("/rfqs")
    public ResponseEntity<List<Map<String, Object>>> getRfqs() {
        return ResponseEntity.ok(new ArrayList<>(rfqs.values()));
    }

    @PostMapping("/quotations")
    public ResponseEntity<Map<String, Object>> createQuotation(@RequestBody Map<String, Object> body) {
        String id = "QUOTE-MFG-3001";
        Map<String, Object> q = new LinkedHashMap<>(body);
        q.put("id", id);
        q.put("subtotal", 4250000);
        q.put("currency", body.getOrDefault("currency", "INR"));
        q.put("status", "PENDING_APPROVAL");
        q.put("deliveryDays", body.getOrDefault("deliveryDays", 30));
        quotations.put(id, q);
        return ResponseEntity.status(HttpStatus.CREATED).body(q);
    }

    @GetMapping("/quotations/{id}")
    public ResponseEntity<Map<String, Object>> getQuotation(@PathVariable String id) {
        Map<String, Object> q = quotations.get(id);
        if (q == null) {
            q = Map.of("id", id, "subtotal", 4250000, "currency", "INR", "status", "PENDING_APPROVAL", "deliveryDays", 30);
        }
        return ResponseEntity.ok(q);
    }

    @PostMapping("/purchase-orders")
    public ResponseEntity<Map<String, Object>> recordPurchaseOrder(@RequestBody Map<String, Object> body) {
        String id = "PO-MFG-4001";
        Map<String, Object> po = new LinkedHashMap<>(body);
        po.put("id", id);
        po.put("status", "PENDING_VALIDATION");
        purchaseOrders.put(id, po);
        return ResponseEntity.status(HttpStatus.CREATED).body(po);
    }

    @GetMapping("/purchase-orders")
    public ResponseEntity<List<Map<String, Object>>> getPurchaseOrders() {
        if (purchaseOrders.isEmpty()) {
            return ResponseEntity.ok(List.of(
                    Map.of(
                            "id", "PO-MFG-4001",
                            "purchaseOrderNumber", "ABC-PO-2026-501",
                            "quotationId", "QUOTE-MFG-3001",
                            "status", "PENDING_VALIDATION",
                            "amount", 4250000,
                            "currency", "INR"
                    )
            ));
        }
        return ResponseEntity.ok(new ArrayList<>(purchaseOrders.values()));
    }
}
