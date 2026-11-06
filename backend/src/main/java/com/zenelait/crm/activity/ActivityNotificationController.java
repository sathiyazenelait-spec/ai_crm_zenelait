package com.zenelait.crm.activity;

import com.zenelait.crm.tenant.TenantSecurityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@CrossOrigin(origins = "*")
public class ActivityNotificationController {

    private final TenantSecurityService tenantSecurityService;

    public ActivityNotificationController(TenantSecurityService tenantSecurityService) {
        this.tenantSecurityService = tenantSecurityService;
    }

    // ==================== ACTIVITIES ====================
    @GetMapping("/api/v1/activities")
    public ResponseEntity<List<Map<String, Object>>> getActivities() {
        return ResponseEntity.ok(List.of(
                Map.of("id", "ACT-1", "type", "DEMO_COMPLETED", "title", "Product Demo Conducted", "actor", "Rahul Sharma", "time", "10 mins ago"),
                Map.of("id", "ACT-2", "type", "STAGE_CHANGE", "title", "Moved to Qualified Stage", "actor", "AI Qualification Agent", "time", "45 mins ago"),
                Map.of("id", "ACT-3", "type", "PROPOSAL_SENT", "title", "Enterprise SLA Proposal Dispatched", "actor", "Anita Sharma", "time", "2 hours ago")
        ));
    }

    // ==================== NOTIFICATIONS ====================
    @GetMapping("/api/v1/notifications")
    public ResponseEntity<List<Map<String, Object>>> getNotifications() {
        return ResponseEntity.ok(List.of(
                Map.of("id", "NOTIF-1", "title", "High Intent Lead Assigned", "message", "Priya Sharma (Tech Solutions) assigned to you.", "read", false, "createdAt", LocalDateTime.now().minusMinutes(15).toString()),
                Map.of("id", "NOTIF-2", "title", "Demo Scheduled", "message", "HRMS Demo booked for tomorrow 11:00 AM.", "read", false, "createdAt", LocalDateTime.now().minusHours(1).toString())
        ));
    }

    @PatchMapping("/api/v1/notifications/{id}/read")
    public ResponseEntity<Map<String, Object>> markNotificationRead(@PathVariable String id) {
        return ResponseEntity.ok(Map.of("id", id, "read", true, "readAt", LocalDateTime.now().toString()));
    }



    // ==================== AUDIT LOGS ====================
    @GetMapping("/api/v1/audit-logs")
    public ResponseEntity<List<Map<String, Object>>> getAuditLogs() {
        String tenantId = tenantSecurityService.getCurrentTenantId();
        return ResponseEntity.ok(List.of(
                Map.of("id", "AUD-101", "tenantId", tenantId, "action", "STAGE_UPDATE", "entity", "LEAD-5001", "actor", "USR-101", "timestamp", LocalDateTime.now().minusMinutes(20).toString()),
                Map.of("id", "AUD-102", "tenantId", tenantId, "action", "APPOINTMENT_SCHEDULED", "entity", "APT-8001", "actor", "USR-101", "timestamp", LocalDateTime.now().minusMinutes(10).toString()),
                Map.of("id", "AUD-103", "tenantId", tenantId, "action", "SECURITY_VERIFICATION", "entity", "AUTH_LOGIN", "actor", "USR-101", "timestamp", LocalDateTime.now().minusHours(1).toString())
        ));
    }
}
