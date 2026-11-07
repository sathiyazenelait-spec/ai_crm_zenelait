package com.zenelait.crm.dedup;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/dedup")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class LeadDeduplicationController {

    private final LeadDeduplicationService dedupService;

    public LeadDeduplicationController(LeadDeduplicationService dedupService) {
        this.dedupService = dedupService;
    }

    @PostMapping("/check")
    public ResponseEntity<Map<String, Object>> checkDuplicate(
            @RequestHeader(value = "X-Tenant-Id", defaultValue = "comp-software-001") String tenantId,
            @RequestBody Map<String, String> payload) {

        String name = payload.getOrDefault("name", "");
        String company = payload.getOrDefault("company", "");
        String phone = payload.getOrDefault("phone", "");
        String email = payload.getOrDefault("email", "");

        List<LeadDeduplicationService.DuplicateMatch> matches = dedupService.checkDuplicates(tenantId, name, company, phone, email);

        Map<String, Object> response = new HashMap<>();
        response.put("isDuplicateDetected", !matches.isEmpty());
        response.put("matchCount", matches.size());
        response.put("matches", matches);
        response.put("similarityEngine", "TiDB Vector Cosine Distance (<10ms)");

        return ResponseEntity.ok(response);
    }

    @PostMapping("/merge")
    public ResponseEntity<Map<String, Object>> mergeLeads(
            @RequestHeader(value = "X-Tenant-Id", defaultValue = "comp-software-001") String tenantId,
            @RequestBody Map<String, String> payload) {

        String primaryLeadId = payload.get("primaryLeadId");
        String duplicateLeadId = payload.get("duplicateLeadId");

        if (primaryLeadId == null || duplicateLeadId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Both primaryLeadId and duplicateLeadId are required"));
        }

        boolean success = dedupService.mergeLeads(tenantId, primaryLeadId, duplicateLeadId);
        return ResponseEntity.ok(Map.of(
                "success", success,
                "message", success ? "Successfully merged duplicate lead into primary record" : "Failed to find specified lead records",
                "primaryLeadId", primaryLeadId,
                "mergedDuplicateLeadId", duplicateLeadId
        ));
    }
}

