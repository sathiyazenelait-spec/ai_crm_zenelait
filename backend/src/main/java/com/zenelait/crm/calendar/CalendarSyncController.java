package com.zenelait.crm.calendar;

import com.zenelait.crm.model.CalendarSyncIntegration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/calendar")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class CalendarSyncController {

    private final CalendarSyncService syncService;

    public CalendarSyncController(CalendarSyncService syncService) {
        this.syncService = syncService;
    }

    @GetMapping("/integrations")
    public ResponseEntity<List<CalendarSyncIntegration>> getIntegrations(
            @RequestHeader(value = "X-Tenant-Id", defaultValue = "comp-software-001") String tenantId) {
        return ResponseEntity.ok(syncService.getTenantIntegrations(tenantId));
    }

    @PostMapping("/connect")
    public ResponseEntity<CalendarSyncIntegration> connectCalendar(
            @RequestHeader(value = "X-Tenant-Id", defaultValue = "comp-software-001") String tenantId,
            @RequestBody Map<String, String> payload) {
        String userId = payload.getOrDefault("userId", "USER-ADMIN-01");
        String provider = payload.getOrDefault("provider", "GOOGLE");
        String email = payload.getOrDefault("email", "sales.exec@zenelait.com");

        return ResponseEntity.ok(syncService.connectCalendar(tenantId, userId, provider, email));
    }

    @PostMapping("/sync/{id}")
    public ResponseEntity<Map<String, Object>> syncNow(
            @RequestHeader(value = "X-Tenant-Id", defaultValue = "comp-software-001") String tenantId,
            @PathVariable String id) {
        return ResponseEntity.ok(syncService.syncNow(tenantId, id));
    }

    /**
     * Public .ics Webcal live calendar feed endpoint
     * Works with Apple Calendar, Google Calendar, and Microsoft Outlook
     */
    @GetMapping(value = "/feed/{userId}.ics", produces = "text/calendar")
    public ResponseEntity<String> getIcsFeed(
            @PathVariable String userId,
            @RequestParam(value = "tenantId", defaultValue = "comp-software-001") String tenantId) {

        String icsContent = syncService.generateIcsFeed(tenantId, userId);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/calendar; charset=utf-8"));
        headers.setContentDispositionFormData("attachment", "zenelait-calendar.ics");

        return ResponseEntity.ok().headers(headers).body(icsContent);
    }
}

