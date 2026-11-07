package com.zenelait.crm.widget;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/widget")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class WidgetPublicController {

    private final WidgetService widgetService;

    public WidgetPublicController(WidgetService widgetService) {
        this.widgetService = widgetService;
    }

    @GetMapping("/config/{tenantId}")
    public ResponseEntity<Map<String, Object>> getConfig(@PathVariable String tenantId) {
        return ResponseEntity.ok(widgetService.getWidgetBranding(tenantId));
    }

    @PostMapping("/chat")
    public ResponseEntity<Map<String, Object>> chatWithAgent(
            @RequestParam(value = "tenantId", defaultValue = "comp-software-001") String tenantId,
            @RequestBody Map<String, String> payload) {

        String message = payload.getOrDefault("message", "");
        if (message.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Message cannot be empty"));
        }

        return ResponseEntity.ok(widgetService.processWidgetChat(tenantId, message));
    }

    @PostMapping("/capture-lead")
    public ResponseEntity<Map<String, Object>> captureLead(
            @RequestParam(value = "tenantId", defaultValue = "comp-software-001") String tenantId,
            @RequestBody Map<String, String> payload) {

        String name = payload.get("name");
        String email = payload.get("email");
        String phone = payload.get("phone");
        String company = payload.get("company");
        String message = payload.get("message");

        return ResponseEntity.ok(widgetService.captureWidgetLead(tenantId, name, email, phone, company, message));
    }
}
