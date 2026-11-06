package com.zenelait.crm.controller;

import com.zenelait.crm.dto.EnquiryRequest;
import com.zenelait.crm.model.Enquiry;
import com.zenelait.crm.service.EnquiryService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/enquiries")
@CrossOrigin(origins = "*")
public class EnquiryController {

    private final EnquiryService enquiryService;

    public EnquiryController(EnquiryService enquiryService) {
        this.enquiryService = enquiryService;
    }

    /**
     * POST /api/enquiries/submit
     * Public endpoint: Visitors enquire to get the software.
     */
    @PostMapping("/submit")
    public ResponseEntity<?> submitEnquiry(@RequestBody EnquiryRequest request) {
        try {
            Enquiry enquiry = enquiryService.submitEnquiry(request);
            return ResponseEntity.ok(Map.of(
                    "status", "SUCCESS",
                    "message", "Thank you for your enquiry! Our Super Admin team will review and provision your company workspace.",
                    "enquiryId", enquiry.getId()
            ));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of(
                    "status", "ERROR",
                    "message", ex.getMessage()
            ));
        }
    }

    /**
     * GET /api/enquiries (Protected: Super Admin Only)
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ULTRA_SUPER_ADMIN', 'PLATFORM_SUPER_ADMIN')")
    public ResponseEntity<List<Enquiry>> listAllEnquiries() {
        return ResponseEntity.ok(enquiryService.getAllEnquiries());
    }

    /**
     * POST /api/enquiries/{id}/approve (Protected: Super Admin Only)
     * Automatically provisions company and Company Admin account.
     */
    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ULTRA_SUPER_ADMIN', 'PLATFORM_SUPER_ADMIN')")
    public ResponseEntity<?> approveEnquiry(@PathVariable String id) {
        try {
            var company = enquiryService.approveAndProvisionCompany(id, "root@zenelait.ai");
            return ResponseEntity.ok(Map.of(
                    "status", "PROVISIONED",
                    "message", "Company " + company.getName() + " provisioned successfully with Admin account!",
                    "companyId", company.getId()
            ));
        } catch (Exception ex) {
            return ResponseEntity.status(400).body(Map.of("error", ex.getMessage()));
        }
    }
}
