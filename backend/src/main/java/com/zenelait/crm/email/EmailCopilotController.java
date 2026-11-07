package com.zenelait.crm.email;

import com.zenelait.crm.model.EmailCopilotLog;
import com.zenelait.crm.repository.EmailCopilotLogRepository;
import com.zenelait.crm.tenant.TenantSecurityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/email-copilot")
@CrossOrigin(origins = "*")
public class EmailCopilotController {

    private final ColdLeadReactivationService reactivationService;
    private final EmailCopilotLogRepository logRepository;
    private final TenantSecurityService tenantSecurityService;

    public EmailCopilotController(
            ColdLeadReactivationService reactivationService,
            EmailCopilotLogRepository logRepository,
            TenantSecurityService tenantSecurityService
    ) {
        this.reactivationService = reactivationService;
        this.logRepository = logRepository;
        this.tenantSecurityService = tenantSecurityService;
    }

    /**
     * POST /api/v1/email-copilot/trigger-scan
     * Trigger autonomous scanning of inactive leads in TiDB Cloud
     */
    @PostMapping("/trigger-scan")
    public ResponseEntity<?> triggerColdLeadScan(@RequestBody(required = false) Map<String, Object> request) {
        String tenantId = request != null && request.containsKey("tenantId")
                ? (String) request.get("tenantId")
                : tenantSecurityService.getCurrentTenantId();
        boolean dryRun = request != null && Boolean.TRUE.equals(request.get("dryRun"));

        List<EmailCopilotLog> logs = reactivationService.runColdLeadReactivation(tenantId, dryRun);
        return ResponseEntity.ok(Map.of(
                "status", "SCAN_COMPLETED",
                "tenantId", tenantId,
                "reEngagedCount", logs.size(),
                "emails", logs
        ));
    }

    /**
     * POST /api/v1/email-copilot/draft-reply
     * AI drafts a smart response to a lead objection
     */
    @PostMapping("/draft-reply")
    public ResponseEntity<?> draftSmartReply(@RequestBody Map<String, String> request) {
        String recipient = request.getOrDefault("recipientEmail", "prospect@example.com");
        String message = request.getOrDefault("customerMessage", "It seems a bit pricey compared to competitors.");
        String objectionType = request.getOrDefault("objectionType", "PRICE");

        Map<String, Object> result = reactivationService.composeSmartReply(recipient, message, objectionType);
        return ResponseEntity.ok(result);
    }

    /**
     * GET /api/v1/email-copilot/logs
     */
    @GetMapping("/logs")
    public ResponseEntity<List<EmailCopilotLog>> getEmailLogs(@RequestParam(required = false) String tenantId) {
        String effectiveTenant = tenantId != null ? tenantId : tenantSecurityService.getCurrentTenantId();
        return ResponseEntity.ok(logRepository.findByTenantIdOrderByCreatedAtDesc(effectiveTenant));
    }
}
