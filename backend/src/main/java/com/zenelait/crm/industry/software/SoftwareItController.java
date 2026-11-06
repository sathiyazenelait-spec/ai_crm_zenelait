package com.zenelait.crm.industry.software;

import com.zenelait.crm.dto.*;
import com.zenelait.crm.service.LeadToSaleWorkflowService;
import com.zenelait.crm.service.SoftwareItService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/it")
@CrossOrigin(origins = "*")
public class SoftwareItController {

    private final SoftwareItService softwareItService;
    private final LeadToSaleWorkflowService leadToSaleWorkflowService;

    public SoftwareItController(
            SoftwareItService softwareItService,
            LeadToSaleWorkflowService leadToSaleWorkflowService
    ) {
        this.softwareItService = softwareItService;
        this.leadToSaleWorkflowService = leadToSaleWorkflowService;
    }

    // ==========================================
    // A. PRODUCTS CATALOGUE (HRMS, ERP, LMS, CRM)
    // ==========================================
    @GetMapping("/products")
    public ResponseEntity<List<Map<String, Object>>> getProducts() {
        return ResponseEntity.ok(softwareItService.getProductsCatalogue());
    }

    @GetMapping("/products/{productId}")
    public ResponseEntity<Map<String, Object>> getProductDetails(@PathVariable String productId) {
        return ResponseEntity.ok(softwareItService.getProductDetails(productId));
    }

    // ==========================================
    // E. IT REQUIREMENTS
    // ==========================================
    @PostMapping("/requirements")
    public ResponseEntity<Map<String, Object>> captureRequirement(@Valid @RequestBody ItRequirementDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(softwareItService.captureRequirement(dto));
    }

    @GetMapping("/requirements")
    public ResponseEntity<List<Map<String, Object>>> listRequirements() {
        return ResponseEntity.ok(softwareItService.listRequirements());
    }

    @GetMapping("/requirements/{id}")
    public ResponseEntity<Map<String, Object>> getRequirement(@PathVariable String id) {
        return ResponseEntity.ok(softwareItService.getRequirement(id));
    }

    @PatchMapping("/requirements/{id}")
    public ResponseEntity<Map<String, Object>> updateRequirement(
            @PathVariable String id,
            @RequestBody Map<String, Object> updates
    ) {
        return ResponseEntity.ok(softwareItService.updateRequirement(id, updates));
    }

    // ==========================================
    // E. DEMOS & OUTCOMES
    // ==========================================
    @PostMapping("/demos")
    public ResponseEntity<Map<String, Object>> scheduleDemo(@Valid @RequestBody ItDemoDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(softwareItService.scheduleDemo(dto));
    }

    @GetMapping("/demos")
    public ResponseEntity<List<Map<String, Object>>> getDemos() {
        return ResponseEntity.ok(softwareItService.listDemos());
    }

    @PatchMapping("/demos/{demoId}")
    public ResponseEntity<Map<String, Object>> updateDemo(
            @PathVariable String demoId,
            @RequestBody Map<String, Object> updates
    ) {
        return ResponseEntity.ok(softwareItService.updateDemo(demoId, updates));
    }

    @PostMapping("/demos/{demoId}/outcomes")
    public ResponseEntity<Map<String, Object>> recordDemoOutcome(
            @PathVariable String demoId,
            @Valid @RequestBody ItDemoOutcomeDto dto
    ) {
        return ResponseEntity.ok(softwareItService.recordDemoOutcome(demoId, dto));
    }

    // ==========================================
    // F. PROPOSALS & CONTRACTS
    // ==========================================
    @PostMapping("/proposals")
    public ResponseEntity<Map<String, Object>> createProposal(@Valid @RequestBody ItProposalDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(softwareItService.createProposal(dto));
    }

    @GetMapping("/proposals")
    public ResponseEntity<List<Map<String, Object>>> listProposals() {
        return ResponseEntity.ok(softwareItService.listProposals());
    }

    @GetMapping("/proposals/{id}")
    public ResponseEntity<Map<String, Object>> getProposal(@PathVariable String id) {
        return ResponseEntity.ok(softwareItService.getProposal(id));
    }

    @PatchMapping("/proposals/{id}")
    public ResponseEntity<Map<String, Object>> updateProposal(
            @PathVariable String id,
            @RequestBody Map<String, Object> updates
    ) {
        return ResponseEntity.ok(softwareItService.updateProposal(id, updates));
    }

    @PatchMapping("/proposals/{id}/status")
    public ResponseEntity<Map<String, Object>> updateProposalStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> body
    ) {
        return ResponseEntity.ok(softwareItService.updateProposalStatus(id, body.get("status")));
    }

    @PostMapping("/proposals/{id}/approval-requests")
    public ResponseEntity<Map<String, Object>> requestProposalApproval(
            @PathVariable String id,
            @Valid @RequestBody ProposalApprovalRequestDto dto
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(softwareItService.requestProposalApproval(id, dto));
    }

    @GetMapping("/contracts")
    public ResponseEntity<List<Map<String, Object>>> getContracts() {
        return ResponseEntity.ok(softwareItService.listContracts());
    }

    // ==========================================
    // GUIDED 5-STEP LEAD-TO-SALE WORKFLOW ENDPOINTS
    // ==========================================
    @PostMapping("/workflow/lead-to-sale/step1-enquiry")
    public ResponseEntity<Map<String, Object>> step1Enquiry(@Valid @RequestBody LeadCreateDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(leadToSaleWorkflowService.step1CaptureEnquiry(dto));
    }

    @PostMapping("/workflow/lead-to-sale/step2-qualify/{leadId}")
    public ResponseEntity<Map<String, Object>> step2Qualify(
            @PathVariable String leadId,
            @Valid @RequestBody LeadStageUpdateDto dto
    ) {
        return ResponseEntity.ok(leadToSaleWorkflowService.step2QualifyLead(leadId, dto));
    }

    @PostMapping("/workflow/lead-to-sale/step3-demo/{leadId}")
    public ResponseEntity<Map<String, Object>> step3Demo(
            @PathVariable String leadId,
            @RequestBody(required = false) Map<String, String> body
    ) {
        String scheduledAt = body != null ? body.get("scheduledAt") : null;
        return ResponseEntity.ok(leadToSaleWorkflowService.step3ScheduleDemo(leadId, scheduledAt));
    }

    @PostMapping("/workflow/lead-to-sale/step4-proposal/{leadId}")
    public ResponseEntity<Map<String, Object>> step4Proposal(
            @PathVariable String leadId,
            @RequestBody Map<String, Object> body
    ) {
        double subtotal = body.get("subtotal") != null ? ((Number) body.get("subtotal")).doubleValue() : 500000.0;
        double discountPercent = body.get("discountPercent") != null ? ((Number) body.get("discountPercent")).doubleValue() : 5.0;
        return ResponseEntity.ok(leadToSaleWorkflowService.step4SendProposal(leadId, subtotal, discountPercent));
    }

    @PostMapping("/workflow/lead-to-sale/step5-close-deal/{opportunityId}")
    public ResponseEntity<Map<String, Object>> step5CloseDeal(
            @PathVariable String opportunityId,
            @RequestBody(required = false) Map<String, String> body
    ) {
        String proposalId = body != null ? body.get("proposalId") : null;
        return ResponseEntity.ok(leadToSaleWorkflowService.step5CloseDeal(opportunityId, proposalId));
    }
}
