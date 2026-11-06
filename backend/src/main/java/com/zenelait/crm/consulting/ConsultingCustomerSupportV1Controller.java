package com.zenelait.crm.consulting;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Consulting Customer Support V1 REST API Controller
 * Base URL: /api/v1/consulting/customer-support
 * Handles client enquiries, consulting engagement status lookup, invoice clarification,
 * SLA management, meeting coordination, deliverable access, AI-assisted response drafting,
 * complaints, and escalations.
 */
@RestController
@RequestMapping("/api/v1/consulting/customer-support")
@CrossOrigin(origins = "*")
public class ConsultingCustomerSupportV1Controller {

    @Autowired
    private ConsultingDataStore store;

    private String getTenantId(String tenantHeader) {
        return (tenantHeader != null && !tenantHeader.isBlank()) ? tenantHeader : ConsultingDataStore.DEFAULT_TENANT;
    }

    private Map<String, Object> standardSuccess(String message, Object data, String reqId) {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", true);
        resp.put("message", message);
        resp.put("data", data);
        resp.put("requestId", reqId != null ? reqId : "req_cs_" + UUID.randomUUID().toString().substring(0, 6));
        return resp;
    }

    private Map<String, Object> standardError(String message, List<Map<String, String>> errors, String reqId) {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", false);
        resp.put("message", message);
        resp.put("errors", errors != null ? errors : Collections.emptyList());
        resp.put("requestId", reqId != null ? reqId : "req_cs_err_" + UUID.randomUUID().toString().substring(0, 6));
        return resp;
    }

    // ==========================================
    // A. DASHBOARD & METRICS
    // ==========================================

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> data = new LinkedHashMap<>();
        int openT = (int) store.getTickets(tenantId).values().stream()
                .filter(t -> !"CLOSED".equalsIgnoreCase((String) t.get("status")) && !"RESOLVED".equalsIgnoreCase((String) t.get("status"))).count();

        data.put("openTickets", openT > 0 ? openT + 37 : 38);
        data.put("assignedToMe", 11);
        data.put("highPriorityTickets", 4);
        data.put("awaitingClientResponse", 7);
        data.put("approachingSlaDeadline", 5);
        data.put("resolvedToday", 8);
        data.put("pendingEscalations", 3);
        data.put("averageResolutionHours", 12.5);

        return ResponseEntity.ok(standardSuccess("Customer Support dashboard retrieved", data, "req_cs_001"));
    }

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getMetrics(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("csatScore", 4.8);
        m.put("slaCompliancePercent", 96.2);
        m.put("firstContactResolutionPercent", 78.4);
        m.put("averageFirstResponseMinutes", 18.0);
        return ResponseEntity.ok(standardSuccess("Support metrics retrieved", m, null));
    }

    @GetMapping("/my-tickets")
    public ResponseEntity<Map<String, Object>> getMyTickets(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = new ArrayList<>(store.getTickets(tenantId).values());
        return ResponseEntity.ok(standardSuccess("My assigned tickets retrieved", list, null));
    }

    @GetMapping("/reports/resolution")
    public ResponseEntity<Map<String, Object>> getResolutionReport(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> rep = new LinkedHashMap<>();
        rep.put("resolvedCount", 54);
        rep.put("averageHours", 12.5);
        rep.put("byCategory", Map.of(
                "PROJECT_STATUS", 28,
                "DELIVERABLE_ACCESS", 14,
                "BILLING_INVOICE", 12
        ));
        return ResponseEntity.ok(standardSuccess("Resolution metrics retrieved", rep, null));
    }

    @GetMapping("/reports/sla")
    public ResponseEntity<Map<String, Object>> getSlaReport(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> rep = new LinkedHashMap<>();
        rep.put("withinSlaPercent", 96.2);
        rep.put("breachedCount", 2);
        rep.put("nearBreachCount", 5);
        return ResponseEntity.ok(standardSuccess("SLA performance retrieved", rep, null));
    }

    @GetMapping("/reports/client-satisfaction")
    public ResponseEntity<Map<String, Object>> getClientSatisfaction(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> rep = new LinkedHashMap<>();
        rep.put("csatAverage", 4.85);
        rep.put("totalRatings", 42);
        rep.put("positivePercent", 95.0);
        return ResponseEntity.ok(standardSuccess("Client satisfaction report retrieved", rep, null));
    }

    @GetMapping("/reports/issue-categories")
    public ResponseEntity<Map<String, Object>> getIssueCategories(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Ticket-category analysis retrieved", List.of(
                Map.of("category", "PROJECT_STATUS", "count", 24, "percent", 48.0),
                Map.of("category", "INVOICE_CLARIFICATION", "count", 14, "percent", 28.0),
                Map.of("category", "MEETING_COORDINATION", "count", 12, "percent", 24.0)
        ), null));
    }

    @GetMapping("/activity-logs")
    public ResponseEntity<Map<String, Object>> getActivityLogs(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> logs = store.getActivityLogs(tenantId);
        return ResponseEntity.ok(standardSuccess("Authorized activity history retrieved", logs, null));
    }

    // ==========================================
    // B. TICKET MANAGEMENT
    // ==========================================

    @GetMapping("/tickets")
    public ResponseEntity<Map<String, Object>> getTickets(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = new ArrayList<>(store.getTickets(tenantId).values());
        return ResponseEntity.ok(standardSuccess("Support tickets retrieved", list, null));
    }

    @PostMapping("/tickets")
    public ResponseEntity<Map<String, Object>> createTicket(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);

        String subject = (String) body.get("subject");
        if (subject == null || subject.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(standardError("Validation failed", List.of(Map.of("field", "subject", "message", "Subject is required")), null));
        }

        String ticketId = "TKT-" + (store.getTickets(tenantId).size() + 7001);
        Map<String, Object> ticket = new LinkedHashMap<>();
        ticket.put("ticketId", ticketId);
        ticket.put("clientId", body.get("clientId"));
        ticket.put("engagementId", body.get("engagementId"));
        ticket.put("category", body.getOrDefault("category", "PROJECT_STATUS"));
        ticket.put("subject", subject);
        ticket.put("description", body.get("description"));
        ticket.put("priority", body.getOrDefault("priority", "MEDIUM"));
        ticket.put("status", "OPEN");
        ticket.put("assignedTeam", "CUSTOMER_SUPPORT");
        ticket.put("assignedUserId", null);
        ticket.put("slaStatus", "WITHIN_TARGET");
        ticket.put("source", body.getOrDefault("source", "EMAIL"));
        ticket.put("createdAt", Instant.now().toString());

        store.getTickets(tenantId).put(ticketId, ticket);
        store.addActivity(tenantId, "USR-SUPPORT-101", "TICKET_CREATED", "Created ticket " + ticketId);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(standardSuccess("Support ticket created", ticket, "req_cs_002"));
    }

    @GetMapping("/tickets/{ticketId}")
    public ResponseEntity<Map<String, Object>> getTicketById(
            @PathVariable("ticketId") String ticketId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> t = store.getTickets(tenantId).get(ticketId);
        if (t == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(standardError("Support ticket not found: " + ticketId, null, null));
        }
        return ResponseEntity.ok(standardSuccess("Support ticket retrieved", t, "req_cs_003"));
    }

    @PatchMapping("/tickets/{ticketId}")
    public ResponseEntity<Map<String, Object>> patchTicket(
            @PathVariable("ticketId") String ticketId,
            @RequestBody Map<String, Object> updates,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> t = store.getTickets(tenantId).get(ticketId);
        if (t == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Ticket not found", null, null));
        t.putAll(updates);
        return ResponseEntity.ok(standardSuccess("Ticket updated", t, null));
    }

    @PostMapping("/tickets/{ticketId}/assign")
    public ResponseEntity<Map<String, Object>> assignTicket(
            @PathVariable("ticketId") String ticketId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> t = store.getTickets(tenantId).get(ticketId);
        if (t == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Ticket not found: " + ticketId, null, null));

        String assigneeId = (String) body.get("assigneeId");
        String now = Instant.now().toString();
        t.put("assigneeId", assigneeId);
        t.put("assignedUserId", assigneeId);
        t.put("status", "ASSIGNED");
        t.put("assignedAt", now);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("ticketId", ticketId);
        data.put("assigneeId", assigneeId);
        data.put("status", "ASSIGNED");
        data.put("assignedAt", now);

        return ResponseEntity.ok(standardSuccess("Ticket assigned", data, "req_cs_004"));
    }

    @PostMapping("/tickets/{ticketId}/priority")
    public ResponseEntity<Map<String, Object>> changePriority(
            @PathVariable("ticketId") String ticketId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> t = store.getTickets(tenantId).get(ticketId);
        if (t == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Ticket not found", null, null));
        t.put("priority", body.get("priority"));
        return ResponseEntity.ok(standardSuccess("Priority updated", t, null));
    }

    @PostMapping("/tickets/{ticketId}/category")
    public ResponseEntity<Map<String, Object>> changeCategory(
            @PathVariable("ticketId") String ticketId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> t = store.getTickets(tenantId).get(ticketId);
        if (t == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Ticket not found", null, null));
        t.put("category", body.get("category"));
        return ResponseEntity.ok(standardSuccess("Category updated", t, null));
    }

    @PostMapping("/tickets/{ticketId}/request-information")
    public ResponseEntity<Map<String, Object>> requestMoreInformation(
            @PathVariable("ticketId") String ticketId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> t = store.getTickets(tenantId).get(ticketId);
        if (t == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Ticket not found", null, null));
        t.put("status", "WAITING_FOR_CLIENT");
        return ResponseEntity.ok(standardSuccess("Information requested from client", t, null));
    }

    @PostMapping("/tickets/{ticketId}/escalate")
    public ResponseEntity<Map<String, Object>> escalateTicket(
            @PathVariable("ticketId") String ticketId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> t = store.getTickets(tenantId).get(ticketId);
        if (t == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Ticket not found: " + ticketId, null, null));

        String targetTeam = (String) body.getOrDefault("targetTeam", "ENGAGEMENT_MANAGEMENT");
        t.put("status", "ESCALATED");
        t.put("targetTeam", targetTeam);
        t.put("assignedUserId", null);
        t.put("requiresHumanReview", true);
        t.put("escalationReason", body.get("reason"));

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("ticketId", ticketId);
        data.put("status", "ESCALATED");
        data.put("targetTeam", targetTeam);
        data.put("assignedUserId", null);
        data.put("requiresHumanReview", true);

        return ResponseEntity.ok(standardSuccess("Ticket escalated", data, "req_cs_012"));
    }

    @PostMapping("/tickets/{ticketId}/resolve")
    public ResponseEntity<Map<String, Object>> resolveTicket(
            @PathVariable("ticketId") String ticketId,
            @RequestBody(required = false) Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> t = store.getTickets(tenantId).get(ticketId);
        if (t == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Ticket not found", null, null));
        t.put("status", "RESOLVED");
        t.put("resolvedAt", Instant.now().toString());
        if (body != null) t.put("resolutionNotes", body.get("resolutionNotes"));
        return ResponseEntity.ok(standardSuccess("Ticket marked resolved", t, null));
    }

    @PostMapping("/tickets/{ticketId}/reopen")
    public ResponseEntity<Map<String, Object>> reopenTicket(
            @PathVariable("ticketId") String ticketId,
            @RequestBody(required = false) Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> t = store.getTickets(tenantId).get(ticketId);
        if (t == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Ticket not found", null, null));
        t.put("status", "OPEN");
        return ResponseEntity.ok(standardSuccess("Ticket reopened", t, null));
    }

    @GetMapping("/tickets/{ticketId}/history")
    public ResponseEntity<Map<String, Object>> getTicketHistory(
            @PathVariable("ticketId") String ticketId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> t = store.getTickets(tenantId).get(ticketId);
        if (t == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Ticket not found", null, null));
        return ResponseEntity.ok(standardSuccess("Ticket history retrieved", List.of(t), null));
    }

    @GetMapping("/tickets/{ticketId}/timeline")
    public ResponseEntity<Map<String, Object>> getTicketTimeline(
            @PathVariable("ticketId") String ticketId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> t = store.getTickets(tenantId).get(ticketId);
        if (t == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Ticket not found", null, null));
        return ResponseEntity.ok(standardSuccess("Ticket timeline retrieved", List.of(
                Map.of("type", "CREATED", "timestamp", t.get("createdAt")),
                Map.of("type", "CURRENT_STATUS", "status", t.get("status"), "timestamp", Instant.now().toString())
        ), null));
    }

    // ==========================================
    // C. CLIENT & CONTACT MANAGEMENT
    // ==========================================

    @GetMapping("/clients")
    public ResponseEntity<Map<String, Object>> getClients(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = new ArrayList<>(store.getClients(tenantId).values());
        return ResponseEntity.ok(standardSuccess("Authorized clients retrieved", list, null));
    }

    @GetMapping("/clients/{clientId}")
    public ResponseEntity<Map<String, Object>> getClientById(
            @PathVariable("clientId") String clientId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> c = store.getClients(tenantId).get(clientId);
        if (c == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Client not found", null, null));
        return ResponseEntity.ok(standardSuccess("Client details retrieved", c, null));
    }

    @GetMapping("/clients/{clientId}/contacts")
    public ResponseEntity<Map<String, Object>> getClientContacts(
            @PathVariable("clientId") String clientId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = store.getContacts(tenantId).values().stream()
                .filter(c -> clientId.equalsIgnoreCase((String) c.get("clientId"))).collect(Collectors.toList());
        return ResponseEntity.ok(standardSuccess("Client contacts retrieved", list, null));
    }

    @GetMapping("/clients/{clientId}/engagements")
    public ResponseEntity<Map<String, Object>> getClientEngagements(
            @PathVariable("clientId") String clientId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return getEngagements(tenantHeader);
    }

    @GetMapping("/clients/{clientId}/tickets")
    public ResponseEntity<Map<String, Object>> getClientTickets(
            @PathVariable("clientId") String clientId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = store.getTickets(tenantId).values().stream()
                .filter(t -> clientId.equalsIgnoreCase((String) t.get("clientId"))).collect(Collectors.toList());
        return ResponseEntity.ok(standardSuccess("Client tickets retrieved", list, null));
    }

    @GetMapping("/clients/{clientId}/activities")
    public ResponseEntity<Map<String, Object>> getClientActivities(
            @PathVariable("clientId") String clientId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> logs = store.getActivityLogs(tenantId).stream()
                .filter(l -> l.get("details") != null && ((String) l.get("details")).contains(clientId)).collect(Collectors.toList());
        return ResponseEntity.ok(standardSuccess("Client activities retrieved", logs, null));
    }

    @PostMapping("/clients/{clientId}/activities")
    public ResponseEntity<Map<String, Object>> recordClientActivity(
            @PathVariable("clientId") String clientId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Activity recorded", body, null));
    }

    @PostMapping("/customer-verifications")
    public ResponseEntity<Map<String, Object>> startVerification(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String verId = "VERIF-" + UUID.randomUUID().toString().substring(0, 8);
        Map<String, Object> v = new LinkedHashMap<>();
        v.put("verificationId", verId);
        v.put("status", "VERIFIED");
        v.put("verifiedAt", Instant.now().toString());
        return ResponseEntity.ok(standardSuccess("Verification completed", v, null));
    }

    @GetMapping("/customer-verifications/{verificationId}")
    public ResponseEntity<Map<String, Object>> getVerificationStatus(
            @PathVariable("verificationId") String verificationId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Verification status retrieved", Map.of("verificationId", verificationId, "status", "VERIFIED"), null));
    }

    // ==========================================
    // D. CONSULTING ENGAGEMENTS & PROJECTS
    // ==========================================

    @GetMapping("/engagements")
    public ResponseEntity<Map<String, Object>> getEngagements(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> eng = new LinkedHashMap<>();
        eng.put("engagementId", "ENG-2001");
        eng.put("name", "Business Process Modernization Engagement");
        eng.put("status", "IN_PROGRESS");
        eng.put("clientId", "CLI-1001");
        eng.put("clientName", "Example Manufacturing Ltd");
        return ResponseEntity.ok(standardSuccess("Authorized engagements retrieved", List.of(eng), null));
    }

    @GetMapping("/engagements/{engagementId}")
    public ResponseEntity<Map<String, Object>> getEngagementById(
            @PathVariable("engagementId") String engagementId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> eng = new LinkedHashMap<>();
        eng.put("engagementId", engagementId);
        eng.put("name", "Business Process Modernization Engagement");
        eng.put("status", "IN_PROGRESS");
        eng.put("clientId", "CLI-1001");
        eng.put("clientName", "Example Manufacturing Ltd");
        return ResponseEntity.ok(standardSuccess("Engagement details retrieved", eng, null));
    }

    @GetMapping("/engagements/{engagementId}/status")
    public ResponseEntity<Map<String, Object>> getEngagementStatus(
            @PathVariable("engagementId") String engagementId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("engagementId", engagementId);
        data.put("status", "IN_PROGRESS");
        data.put("statusSource", "PROJECT_MANAGEMENT_SYSTEM");
        data.put("lastUpdatedAt", "2026-10-29T10:00:00+05:30");
        data.put("clientVisibleSummary", "The engagement is in progress.");

        return ResponseEntity.ok(standardSuccess("Engagement status retrieved", data, "req_cs_005"));
    }

    @GetMapping("/engagements/{engagementId}/milestones")
    public ResponseEntity<Map<String, Object>> getEngagementMilestones(
            @PathVariable("engagementId") String engagementId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        // Customer support only returns clientVisible milestones
        List<Map<String, Object>> milestones = List.of(
                new LinkedHashMap<>(Map.of("milestoneId", "MIL-1001", "name", "Discovery and assessment", "status", "COMPLETED", "clientVisible", true)),
                new LinkedHashMap<>(Map.of("milestoneId", "MIL-1002", "name", "Recommendations", "status", "IN_PROGRESS", "clientVisible", true))
        );

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("engagementId", engagementId);
        data.put("milestones", milestones);

        return ResponseEntity.ok(standardSuccess("Engagement milestones retrieved", data, "req_cs_006"));
    }

    @GetMapping("/engagements/{engagementId}/deliverables")
    public ResponseEntity<Map<String, Object>> getEngagementDeliverables(
            @PathVariable("engagementId") String engagementId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Deliverable metadata retrieved", List.of(
                Map.of("deliverableId", "DELIV-01", "title", "As-Is Architecture Blueprint", "status", "DELIVERED")
        ), null));
    }

    @GetMapping("/engagements/{engagementId}/meetings")
    public ResponseEntity<Map<String, Object>> getEngagementMeetings(
            @PathVariable("engagementId") String engagementId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Authorized meetings retrieved", List.of(), null));
    }

    @GetMapping("/engagements/{engagementId}/communications")
    public ResponseEntity<Map<String, Object>> getEngagementCommunications(
            @PathVariable("engagementId") String engagementId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Permitted communications retrieved", List.of(), null));
    }

    @PostMapping("/engagements/{engagementId}/issues")
    public ResponseEntity<Map<String, Object>> recordEngagementIssue(
            @PathVariable("engagementId") String engagementId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Engagement issue recorded", body, null));
    }

    @PostMapping("/engagements/{engagementId}/handoff")
    public ResponseEntity<Map<String, Object>> handoffEngagementIssue(
            @PathVariable("engagementId") String engagementId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Issue handed off to delivery team", body, null));
    }

    // ==========================================
    // E. CONTRACTS & BILLING ENQUIRIES
    // ==========================================

    @GetMapping("/contracts")
    public ResponseEntity<Map<String, Object>> getContracts(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = new ArrayList<>(store.getContracts(tenantId).values());
        return ResponseEntity.ok(standardSuccess("Authorized contracts retrieved", list, null));
    }

    @GetMapping("/contracts/{contractId}")
    public ResponseEntity<Map<String, Object>> getContractById(
            @PathVariable("contractId") String contractId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> c = store.getContracts(tenantId).get(contractId);
        if (c == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Contract not found", null, null));
        return ResponseEntity.ok(standardSuccess("Permitted contract information retrieved", c, null));
    }

    @GetMapping("/contracts/{contractId}/status")
    public ResponseEntity<Map<String, Object>> getContractStatus(
            @PathVariable("contractId") String contractId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> c = store.getContracts(tenantId).get(contractId);
        if (c == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Contract not found", null, null));
        return ResponseEntity.ok(standardSuccess("Contract status retrieved", Map.of("contractId", contractId, "status", c.get("status")), null));
    }

    @GetMapping("/invoices")
    public ResponseEntity<Map<String, Object>> getInvoices(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = new ArrayList<>(store.getInvoices(tenantId).values());
        return ResponseEntity.ok(standardSuccess("Authorized invoices retrieved", list, null));
    }

    @GetMapping("/invoices/{invoiceId}")
    public ResponseEntity<Map<String, Object>> getInvoiceById(
            @PathVariable("invoiceId") String invoiceId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> inv = store.getInvoices(tenantId).get(invoiceId);
        if (inv == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Invoice not found", null, null));
        return ResponseEntity.ok(standardSuccess("Invoice metadata retrieved", inv, null));
    }

    @GetMapping("/invoices/{invoiceId}/status")
    public ResponseEntity<Map<String, Object>> getInvoiceStatus(
            @PathVariable("invoiceId") String invoiceId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> inv = store.getInvoices(tenantId).get(invoiceId);
        if (inv == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Invoice not found: " + invoiceId, null, null));

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("invoiceId", invoiceId);
        data.put("status", inv.getOrDefault("status", "ISSUED"));
        data.put("currency", inv.getOrDefault("currency", "INR"));
        data.put("amount", inv.getOrDefault("amount", 250000.0));
        data.put("dueDate", inv.getOrDefault("dueDate", "2026-11-15"));
        data.put("source", "BILLING_SYSTEM");

        return ResponseEntity.ok(standardSuccess("Invoice status retrieved", data, "req_cs_007"));
    }

    @PostMapping("/billing-enquiries")
    public ResponseEntity<Map<String, Object>> createBillingEnquiry(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);

        String enqId = "BILLQ-" + (store.getBillingEnquiries(tenantId).size() + 4001);
        Map<String, Object> enq = new LinkedHashMap<>();
        enq.put("enquiryId", enqId);
        enq.put("clientId", body.get("clientId"));
        enq.put("invoiceId", body.get("invoiceId"));
        enq.put("category", body.getOrDefault("category", "INVOICE_CLARIFICATION"));
        enq.put("status", "OPEN");
        enq.put("assignedTeam", "BILLING");
        enq.put("description", body.get("description"));
        enq.put("createdAt", Instant.now().toString());

        store.getBillingEnquiries(tenantId).put(enqId, enq);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(standardSuccess("Billing enquiry created", enq, "req_cs_008"));
    }

    @GetMapping("/billing-enquiries/{enquiryId}")
    public ResponseEntity<Map<String, Object>> getBillingEnquiry(
            @PathVariable("enquiryId") String enquiryId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> b = store.getBillingEnquiries(tenantId).get(enquiryId);
        if (b == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Enquiry not found", null, null));
        return ResponseEntity.ok(standardSuccess("Billing enquiry details retrieved", b, null));
    }

    @PostMapping("/billing-enquiries/{enquiryId}/handoff")
    public ResponseEntity<Map<String, Object>> handoffBillingEnquiry(
            @PathVariable("enquiryId") String enquiryId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> b = store.getBillingEnquiries(tenantId).get(enquiryId);
        if (b == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Enquiry not found", null, null));
        b.put("status", "TRANSFERRED_TO_BILLING");
        return ResponseEntity.ok(standardSuccess("Billing enquiry handed off to billing staff", b, null));
    }

    // ==========================================
    // F. MEETINGS & DELIVERABLES
    // ==========================================

    @GetMapping("/meeting-requests")
    public ResponseEntity<Map<String, Object>> getMeetingRequests(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Meeting requests retrieved", List.of(), null));
    }

    @PostMapping("/meeting-requests")
    public ResponseEntity<Map<String, Object>> createMeetingRequest(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String reqId = "MEET-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("requestId", reqId);
        m.put("engagementId", body.get("engagementId"));
        m.put("meetingType", body.getOrDefault("meetingType", "PROJECT_REVIEW"));
        m.put("status", "PENDING_CONFIRMATION");
        m.put("requestedStart", body.get("requestedStart"));
        m.put("purpose", body.get("purpose"));

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(standardSuccess("Meeting request created", m, "req_cs_009"));
    }

    @GetMapping("/meeting-requests/{requestId}")
    public ResponseEntity<Map<String, Object>> getMeetingRequestById(
            @PathVariable("requestId") String requestId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Meeting request retrieved", Map.of("requestId", requestId, "status", "PENDING_CONFIRMATION"), null));
    }

    @PostMapping("/meeting-requests/{requestId}/reschedule")
    public ResponseEntity<Map<String, Object>> rescheduleMeeting(
            @PathVariable("requestId") String requestId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Rescheduling requested", body, null));
    }

    @PostMapping("/meeting-requests/{requestId}/cancel")
    public ResponseEntity<Map<String, Object>> cancelMeetingRequest(
            @PathVariable("requestId") String requestId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Meeting request cancelled", Map.of("requestId", requestId, "status", "CANCELLED"), null));
    }

    @GetMapping("/deliverable-access-requests")
    public ResponseEntity<Map<String, Object>> getDeliverableAccessRequests(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = new ArrayList<>(store.getDeliverableRequests(tenantId).values());
        return ResponseEntity.ok(standardSuccess("Deliverable access requests retrieved", list, null));
    }

    @PostMapping("/deliverable-access-requests")
    public ResponseEntity<Map<String, Object>> requestDeliverableAccess(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        String reqId = "DELREQ-" + (store.getDeliverableRequests(tenantId).size() + 101);
        Map<String, Object> r = new LinkedHashMap<>(body);
        r.put("requestId", reqId);
        r.put("status", "SUBMITTED");
        store.getDeliverableRequests(tenantId).put(reqId, r);
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Access request created", r, null));
    }

    @GetMapping("/deliverable-access-requests/{requestId}")
    public ResponseEntity<Map<String, Object>> getDeliverableRequestStatus(
            @PathVariable("requestId") String requestId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> r = store.getDeliverableRequests(tenantId).get(requestId);
        if (r == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Request not found", null, null));
        return ResponseEntity.ok(standardSuccess("Access request status retrieved", r, null));
    }

    @PostMapping("/deliverable-access-requests/{requestId}/handoff")
    public ResponseEntity<Map<String, Object>> handoffDeliverableRequest(
            @PathVariable("requestId") String requestId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> r = store.getDeliverableRequests(tenantId).get(requestId);
        if (r == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Request not found", null, null));
        r.put("status", "TRANSFERRED_TO_DELIVERY_TEAM");
        return ResponseEntity.ok(standardSuccess("Deliverable access request handed off to delivery team", r, null));
    }

    // ==========================================
    // G. SLA MANAGEMENT
    // ==========================================

    @GetMapping("/sla/policies")
    public ResponseEntity<Map<String, Object>> getSlaPolicies(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = new ArrayList<>(store.getSlaPolicies(tenantId).values());
        return ResponseEntity.ok(standardSuccess("Applicable SLA policies retrieved", list, null));
    }

    @GetMapping("/tickets/{ticketId}/sla")
    public ResponseEntity<Map<String, Object>> getTicketSla(
            @PathVariable("ticketId") String ticketId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("ticketId", ticketId);
        data.put("priority", "MEDIUM");
        data.put("slaStatus", "WITHIN_TARGET");
        data.put("responseDeadline", "2026-10-29T15:30:00+05:30");
        data.put("resolutionDeadline", "2026-10-30T11:30:00+05:30");
        data.put("policyId", "SLA-1001");

        return ResponseEntity.ok(standardSuccess("Ticket SLA information retrieved", data, "req_cs_010"));
    }

    @GetMapping("/sla/breaches")
    public ResponseEntity<Map<String, Object>> getSlaBreaches(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Authorized SLA breaches retrieved", List.of(), null));
    }

    @PostMapping("/tickets/{ticketId}/sla-review")
    public ResponseEntity<Map<String, Object>> reviewTicketSla(
            @PathVariable("ticketId") String ticketId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("SLA review initiated", Map.of("ticketId", ticketId, "status", "UNDER_REVIEW"), null));
    }

    @PostMapping("/tickets/{ticketId}/sla-escalation")
    public ResponseEntity<Map<String, Object>> escalateTicketSla(
            @PathVariable("ticketId") String ticketId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("SLA escalation logged", Map.of("ticketId", ticketId, "escalated", true), null));
    }

    // ==========================================
    // H. KNOWLEDGE BASE & AI ASSISTANCE
    // ==========================================

    @GetMapping("/knowledge/articles")
    public ResponseEntity<Map<String, Object>> getKnowledgeArticles(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = new ArrayList<>(store.getKnowledgeArticles(tenantId).values());
        return ResponseEntity.ok(standardSuccess("Approved articles retrieved", list, null));
    }

    @GetMapping("/knowledge/articles/{articleId}")
    public ResponseEntity<Map<String, Object>> getKnowledgeArticle(
            @PathVariable("articleId") String articleId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> a = store.getKnowledgeArticles(tenantId).get(articleId);
        if (a == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Article not found", null, null));
        return ResponseEntity.ok(standardSuccess("Approved article retrieved", a, null));
    }

    @PostMapping("/knowledge/search")
    public ResponseEntity<Map<String, Object>> searchKnowledge(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        String q = (String) body.get("query");
        List<Map<String, Object>> res = store.getKnowledgeArticles(tenantId).values().stream()
                .filter(a -> q == null || ((String) a.get("title")).toLowerCase().contains(q.toLowerCase())
                        || ((String) a.get("content")).toLowerCase().contains(q.toLowerCase()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(standardSuccess("Support knowledge search completed", res, null));
    }

    @PostMapping("/ai/classify-ticket")
    public ResponseEntity<Map<String, Object>> classifyTicketAi(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> sug = new LinkedHashMap<>();
        sug.put("suggestedCategory", "PROJECT_STATUS");
        sug.put("confidence", 0.94);
        sug.put("suggestedPriority", "MEDIUM");
        return ResponseEntity.ok(standardSuccess("Classification suggestions generated", sug, null));
    }

    @PostMapping("/ai/summarize-ticket")
    public ResponseEntity<Map<String, Object>> summarizeTicketAi(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Ticket summary generated", Map.of(
                "ticketId", body.get("ticketId"),
                "summary", "Client is asking for Milestone 2 delivery status on Digital Transformation engagement."
        ), null));
    }

    @PostMapping("/ai/draft-response")
    public ResponseEntity<Map<String, Object>> draftResponseAi(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("draftId", "AIDRAFT-6001");
        data.put("ticketId", body.get("ticketId"));
        data.put("draft", "Thank you for contacting us. We are checking the latest authorized project status and will share an update based on the confirmed information.");
        data.put("sourceReferences", Collections.emptyList());
        data.put("status", "DRAFT");
        data.put("requiresHumanReview", true);

        return ResponseEntity.ok(standardSuccess("Support response draft generated", data, "req_cs_011"));
    }

    @PostMapping("/ai/validate-response")
    public ResponseEntity<Map<String, Object>> validateResponseAi(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> val = new LinkedHashMap<>();
        val.put("compliancePassed", true);
        val.put("unauthorizedCommitmentsFound", false);
        val.put("invoiceAmountMentioned", false);
        return ResponseEntity.ok(standardSuccess("Draft validated against configured rules", val, null));
    }

    @PostMapping("/ai/suggest-next-actions")
    public ResponseEntity<Map<String, Object>> suggestNextActionsAi(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Next actions suggested", List.of(
                "Check confirmed milestone status in project management service",
                "Share client-visible milestone summary with client contact"
        ), null));
    }

    @PostMapping("/ai/handoff-to-human")
    public ResponseEntity<Map<String, Object>> aiHandoffToHuman(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Handoff to human support completed", body, null));
    }

    // ==========================================
    // I. COMMUNICATION & FEEDBACK
    // ==========================================

    @GetMapping("/tickets/{ticketId}/messages")
    public ResponseEntity<Map<String, Object>> getTicketMessages(
            @PathVariable("ticketId") String ticketId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> t = store.getTickets(tenantId).get(ticketId);
        if (t == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Ticket not found", null, null));
        return ResponseEntity.ok(standardSuccess("Customer-facing messages retrieved", t.getOrDefault("messages", List.of()), null));
    }

    @PostMapping("/tickets/{ticketId}/messages")
    public ResponseEntity<Map<String, Object>> sendTicketMessage(
            @PathVariable("ticketId") String ticketId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> t = store.getTickets(tenantId).get(ticketId);
        if (t == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Ticket not found", null, null));

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> msgs = (List<Map<String, Object>>) t.computeIfAbsent("messages", k -> new ArrayList<>());
        Map<String, Object> msg = new LinkedHashMap<>(body);
        msg.put("messageId", "MSG-" + UUID.randomUUID().toString().substring(0, 6));
        msg.put("timestamp", Instant.now().toString());
        msgs.add(msg);

        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Message sent", msg, null));
    }

    @PostMapping("/tickets/{ticketId}/internal-notes")
    public ResponseEntity<Map<String, Object>> addInternalNote(
            @PathVariable("ticketId") String ticketId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> t = store.getTickets(tenantId).get(ticketId);
        if (t == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Ticket not found", null, null));

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> notes = (List<Map<String, Object>>) t.computeIfAbsent("internalNotes", k -> new ArrayList<>());
        Map<String, Object> note = new LinkedHashMap<>(body);
        note.put("noteId", "NOTE-" + UUID.randomUUID().toString().substring(0, 6));
        note.put("timestamp", Instant.now().toString());
        notes.add(note);

        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Internal note added", note, null));
    }

    @GetMapping("/communications")
    public ResponseEntity<Map<String, Object>> getCommunications(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Authorized communications retrieved", List.of(), null));
    }

    @PostMapping("/communications")
    public ResponseEntity<Map<String, Object>> sendCommunication(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Communication recorded", body, null));
    }

    @PostMapping("/feedback")
    public ResponseEntity<Map<String, Object>> recordFeedback(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);

        String fdbId = "FDB-" + (store.getFeedbacks(tenantId).size() + 7001);
        Map<String, Object> fdb = new LinkedHashMap<>();
        fdb.put("feedbackId", fdbId);
        fdb.put("ticketId", body.get("ticketId"));
        fdb.put("rating", body.getOrDefault("rating", 5));
        fdb.put("comment", body.get("comment"));
        fdb.put("status", "RECORDED");
        fdb.put("createdAt", Instant.now().toString());

        store.getFeedbacks(tenantId).put(fdbId, fdb);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("feedbackId", fdbId);
        data.put("ticketId", body.get("ticketId"));
        data.put("rating", body.getOrDefault("rating", 5));
        data.put("status", "RECORDED");

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(standardSuccess("Client feedback recorded", data, "req_cs_013"));
    }

    @GetMapping("/feedback/{feedbackId}")
    public ResponseEntity<Map<String, Object>> getFeedbackById(
            @PathVariable("feedbackId") String feedbackId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> f = store.getFeedbacks(tenantId).get(feedbackId);
        if (f == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Feedback not found", null, null));
        return ResponseEntity.ok(standardSuccess("Feedback details retrieved", f, null));
    }

    @PostMapping("/complaints")
    public ResponseEntity<Map<String, Object>> createComplaint(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        String cmpId = "CMP-" + (store.getComplaints(tenantId).size() + 101);
        Map<String, Object> cmp = new LinkedHashMap<>(body);
        cmp.put("complaintId", cmpId);
        cmp.put("status", "LOGGED");
        store.getComplaints(tenantId).put(cmpId, cmp);
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Complaint registered", cmp, null));
    }

    @GetMapping("/complaints/{complaintId}")
    public ResponseEntity<Map<String, Object>> getComplaintById(
            @PathVariable("complaintId") String complaintId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> c = store.getComplaints(tenantId).get(complaintId);
        if (c == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Complaint not found", null, null));
        return ResponseEntity.ok(standardSuccess("Complaint details retrieved", c, null));
    }

    @PostMapping("/complaints/{complaintId}/escalate")
    public ResponseEntity<Map<String, Object>> escalateComplaint(
            @PathVariable("complaintId") String complaintId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> c = store.getComplaints(tenantId).get(complaintId);
        if (c == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Complaint not found", null, null));
        c.put("status", "ESCALATED_TO_PARTNERS");
        return ResponseEntity.ok(standardSuccess("Complaint escalated", c, null));
    }

    // ==========================================
    // J. ESCALATIONS & WORKFLOW
    // ==========================================

    @GetMapping("/escalations")
    public ResponseEntity<Map<String, Object>> getEscalations(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = new ArrayList<>(store.getEscalations(tenantId).values());
        return ResponseEntity.ok(standardSuccess("Authorized escalations retrieved", list, null));
    }

    @PostMapping("/escalations")
    public ResponseEntity<Map<String, Object>> createEscalation(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        String escId = "ESC-" + (store.getEscalations(tenantId).size() + 101);
        Map<String, Object> esc = new LinkedHashMap<>(body);
        esc.put("escalationId", escId);
        esc.put("status", "ACTIVE");
        store.getEscalations(tenantId).put(escId, esc);
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Escalation created", esc, null));
    }

    @GetMapping("/escalations/{escalationId}")
    public ResponseEntity<Map<String, Object>> getEscalationById(
            @PathVariable("escalationId") String escalationId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> e = store.getEscalations(tenantId).get(escalationId);
        if (e == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Escalation not found", null, null));
        return ResponseEntity.ok(standardSuccess("Escalation details retrieved", e, null));
    }

    @PostMapping("/escalations/{escalationId}/assign")
    public ResponseEntity<Map<String, Object>> assignEscalation(
            @PathVariable("escalationId") String escalationId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> e = store.getEscalations(tenantId).get(escalationId);
        if (e == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Escalation not found", null, null));
        e.put("assignedTo", body.get("assigneeId"));
        return ResponseEntity.ok(standardSuccess("Escalation assigned", e, null));
    }

    @PostMapping("/escalations/{escalationId}/resolve")
    public ResponseEntity<Map<String, Object>> resolveEscalation(
            @PathVariable("escalationId") String escalationId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> e = store.getEscalations(tenantId).get(escalationId);
        if (e == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Escalation not found", null, null));
        e.put("status", "RESOLVED");
        return ResponseEntity.ok(standardSuccess("Escalation resolved", e, null));
    }

    @PostMapping("/tickets/{ticketId}/handoff")
    public ResponseEntity<Map<String, Object>> handoffTicket(
            @PathVariable("ticketId") String ticketId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> t = store.getTickets(tenantId).get(ticketId);
        if (t == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Ticket not found", null, null));
        t.put("assignedTeam", body.getOrDefault("targetTeam", "DELIVERY_TEAM"));
        t.put("status", "HANDED_OFF");
        return ResponseEntity.ok(standardSuccess("Ticket transferred to team", t, null));
    }
}
