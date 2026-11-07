package com.zenelait.crm.quotation;

import com.zenelait.crm.model.Quotation;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/quotations")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class QuotationController {

    private final QuotationService quotationService;

    public QuotationController(QuotationService quotationService) {
        this.quotationService = quotationService;
    }

    @GetMapping
    public ResponseEntity<List<Quotation>> getQuotations(
            @RequestHeader(value = "X-Tenant-Id", defaultValue = "comp-software-001") String tenantId) {
        return ResponseEntity.ok(quotationService.getTenantQuotations(tenantId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getQuotationById(@PathVariable String id) {
        return quotationService.getQuotationById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Quotation> createQuotation(
            @RequestHeader(value = "X-Tenant-Id", defaultValue = "comp-software-001") String tenantId,
            @RequestBody Quotation quotation) {
        return ResponseEntity.ok(quotationService.createQuotation(tenantId, quotation));
    }

    /**
     * Digital E-Sign Endpoint for /sign/:id portal
     */
    @PostMapping("/{id}/sign")
    public ResponseEntity<Map<String, Object>> signQuotation(
            @PathVariable String id,
            @RequestBody Map<String, String> payload) {
        String signatureData = payload.get("signatureData");
        String signerName = payload.getOrDefault("signerName", "Client Representative");

        if (signatureData == null || signatureData.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Signature data is required"));
        }

        return ResponseEntity.ok(quotationService.digitallySignQuotation(id, signatureData, signerName));
    }
}

