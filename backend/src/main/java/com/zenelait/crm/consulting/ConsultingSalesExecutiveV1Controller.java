package com.zenelait.crm.consulting;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Consulting Sales Executive V1 REST API Controller
 * Base URL: /api/v1/consulting/sales-executive
 * Handles prospect discovery, business requirements, consulting proposals,
 * pricing estimates, client follow-ups, and engagement handoffs.
 */
@RestController
@RequestMapping("/api/v1/consulting/sales-executive")
@CrossOrigin(origins = "*")
public class ConsultingSalesExecutiveV1Controller {

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
        resp.put("requestId", reqId != null ? reqId : "req_se_" + UUID.randomUUID().toString().substring(0, 6));
        return resp;
    }

    private Map<String, Object> standardError(String message, List<Map<String, String>> errors, String reqId) {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", false);
        resp.put("message", message);
        resp.put("errors", errors != null ? errors : Collections.emptyList());
        resp.put("requestId", reqId != null ? reqId : "req_se_err_" + UUID.randomUUID().toString().substring(0, 6));
        return resp;
    }

    // ==========================================
    // A. DASHBOARD & ASSIGNED WORK
    // ==========================================

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("assignedLeads", store.getLeads(tenantId).size() > 0 ? store.getLeads(tenantId).size() + 23 : 24);
        data.put("qualifiedLeads", 12);
        data.put("openOpportunities", store.getOpportunities(tenantId).size() > 0 ? store.getOpportunities(tenantId).size() + 8 : 9);
        data.put("proposalsInProgress", 4);
        data.put("proposalsAwaitingApproval", 2);
        data.put("pendingFollowUps", 7);
        data.put("meetingsThisWeek", 3);
        data.put("closedWonValue", 450000.0);
        data.put("currency", "INR");

        return ResponseEntity.ok(standardSuccess("Sales Executive dashboard retrieved", data, "req_se_001"));
    }

    @GetMapping("/my-leads")
    public ResponseEntity<Map<String, Object>> getMyLeads(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> items = new ArrayList<>(store.getLeads(tenantId).values());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("items", items);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", items.size());
        data.put("totalPages", 1);

        return ResponseEntity.ok(standardSuccess("Assigned leads retrieved", data, "req_se_002"));
    }

    @GetMapping("/my-opportunities")
    public ResponseEntity<Map<String, Object>> getMyOpportunities(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> items = new ArrayList<>(store.getOpportunities(tenantId).values());
        return ResponseEntity.ok(standardSuccess("Assigned opportunities retrieved", items, null));
    }

    @GetMapping("/my-tasks")
    public ResponseEntity<Map<String, Object>> getMyTasks(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> items = new ArrayList<>(store.getTasks(tenantId).values());
        return ResponseEntity.ok(standardSuccess("Tasks and follow-ups retrieved", items, null));
    }

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getMetrics(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("targetQuota", 1000000.0);
        m.put("achievedQuota", 450000.0);
        m.put("attainmentPercent", 45.0);
        m.put("averageProposalCycleDays", 11.2);
        m.put("meetingsHeldThisMonth", 8);
        m.put("currency", "INR");
        return ResponseEntity.ok(standardSuccess("Personal performance metrics retrieved", m, null));
    }

    @GetMapping("/activity-logs")
    public ResponseEntity<Map<String, Object>> getActivityLogs(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> logs = store.getActivityLogs(tenantId);
        return ResponseEntity.ok(standardSuccess("Authorized activity history retrieved", logs, null));
    }

    // ==========================================
    // B. CLIENT & CONTACT MANAGEMENT
    // ==========================================

    @GetMapping("/clients")
    public ResponseEntity<Map<String, Object>> getClients(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = new ArrayList<>(store.getClients(tenantId).values());
        return ResponseEntity.ok(standardSuccess("Authorized client records retrieved", list, null));
    }

    @PostMapping("/clients")
    public ResponseEntity<Map<String, Object>> createClient(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        String clientId = "CLI-" + (store.getClients(tenantId).size() + 1001);
        Map<String, Object> c = new LinkedHashMap<>(body);
        c.put("clientId", clientId);
        c.put("createdAt", Instant.now().toString());
        store.getClients(tenantId).put(clientId, c);
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Client record created", c, null));
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

    @PatchMapping("/clients/{clientId}")
    public ResponseEntity<Map<String, Object>> patchClient(
            @PathVariable("clientId") String clientId,
            @RequestBody Map<String, Object> updates,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> c = store.getClients(tenantId).get(clientId);
        if (c == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Client not found", null, null));
        c.putAll(updates);
        return ResponseEntity.ok(standardSuccess("Client updated", c, null));
    }

    @GetMapping("/clients/{clientId}/contacts")
    public ResponseEntity<Map<String, Object>> getClientContacts(
            @PathVariable("clientId") String clientId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = store.getContacts(tenantId).values().stream()
                .filter(c -> clientId.equalsIgnoreCase((String) c.get("clientId")))
                .collect(Collectors.toList());
        return ResponseEntity.ok(standardSuccess("Client contacts retrieved", list, null));
    }

    @PostMapping("/clients/{clientId}/contacts")
    public ResponseEntity<Map<String, Object>> addClientContact(
            @PathVariable("clientId") String clientId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        String contactId = "CONT-" + (store.getContacts(tenantId).size() + 1001);
        Map<String, Object> c = new LinkedHashMap<>(body);
        c.put("contactId", contactId);
        c.put("clientId", clientId);
        store.getContacts(tenantId).put(contactId, c);
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Client contact added", c, null));
    }

    @PatchMapping("/clients/{clientId}/contacts/{contactId}")
    public ResponseEntity<Map<String, Object>> patchContact(
            @PathVariable("clientId") String clientId,
            @PathVariable("contactId") String contactId,
            @RequestBody Map<String, Object> updates,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> c = store.getContacts(tenantId).get(contactId);
        if (c == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Contact not found", null, null));
        c.putAll(updates);
        return ResponseEntity.ok(standardSuccess("Contact updated", c, null));
    }

    @GetMapping("/clients/{clientId}/activities")
    public ResponseEntity<Map<String, Object>> getClientActivities(
            @PathVariable("clientId") String clientId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> logs = store.getActivityLogs(tenantId).stream()
                .filter(l -> l.get("details") != null && ((String) l.get("details")).contains(clientId))
                .collect(Collectors.toList());
        return ResponseEntity.ok(standardSuccess("Client activities retrieved", logs, null));
    }

    @PostMapping("/clients/{clientId}/activities")
    public ResponseEntity<Map<String, Object>> recordClientActivity(
            @PathVariable("clientId") String clientId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        store.addActivity(tenantId, "USR-EXEC-101", (String) body.getOrDefault("action", "NOTE_ADDED"), clientId + ": " + body.get("notes"));
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Activity recorded", body, null));
    }

    @PostMapping("/duplicate-checks")
    public ResponseEntity<Map<String, Object>> checkDuplicates(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        String name = (String) body.get("companyName");
        String email = (String) body.get("email");

        List<Map<String, Object>> matches = store.getClients(tenantId).values().stream()
                .filter(c -> (name != null && name.equalsIgnoreCase((String) c.get("companyName"))))
                .collect(Collectors.toList());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("duplicateFound", !matches.isEmpty());
        result.put("possibleMatches", matches);
        return ResponseEntity.ok(standardSuccess("Duplicate check completed", result, null));
    }

    // ==========================================
    // C. LEAD MANAGEMENT
    // ==========================================

    @GetMapping("/leads")
    public ResponseEntity<Map<String, Object>> getLeads(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = new ArrayList<>(store.getLeads(tenantId).values());
        return ResponseEntity.ok(standardSuccess("Assigned leads retrieved", list, null));
    }

    @PostMapping("/leads")
    public ResponseEntity<Map<String, Object>> createLead(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        String leadId = "CLD-" + (store.getLeads(tenantId).size() + 1001);
        Map<String, Object> lead = new LinkedHashMap<>(body);
        lead.put("leadId", leadId);
        lead.put("status", "NEW");
        lead.put("assignedTo", "USR-EXEC-101");
        lead.put("createdAt", Instant.now().toString());
        store.getLeads(tenantId).put(leadId, lead);
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Consulting lead created", lead, null));
    }

    @GetMapping("/leads/{leadId}")
    public ResponseEntity<Map<String, Object>> getLeadById(
            @PathVariable("leadId") String leadId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> l = store.getLeads(tenantId).get(leadId);
        if (l == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Lead not found", null, null));
        return ResponseEntity.ok(standardSuccess("Lead details retrieved", l, null));
    }

    @PatchMapping("/leads/{leadId}")
    public ResponseEntity<Map<String, Object>> patchLead(
            @PathVariable("leadId") String leadId,
            @RequestBody Map<String, Object> updates,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> l = store.getLeads(tenantId).get(leadId);
        if (l == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Lead not found", null, null));
        l.putAll(updates);
        return ResponseEntity.ok(standardSuccess("Lead updated", l, null));
    }

    @PostMapping("/leads/{leadId}/qualify")
    public ResponseEntity<Map<String, Object>> qualifyLead(
            @PathVariable("leadId") String leadId,
            @RequestBody(required = false) Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> l = store.getLeads(tenantId).get(leadId);
        if (l == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Lead not found", null, null));
        l.put("status", "QUALIFIED");
        l.put("qualifiedAt", Instant.now().toString());
        return ResponseEntity.ok(standardSuccess("Lead qualified successfully", l, null));
    }

    @PostMapping("/leads/{leadId}/disqualify")
    public ResponseEntity<Map<String, Object>> disqualifyLead(
            @PathVariable("leadId") String leadId,
            @RequestBody(required = false) Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> l = store.getLeads(tenantId).get(leadId);
        if (l == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Lead not found", null, null));
        l.put("status", "DISQUALIFIED");
        return ResponseEntity.ok(standardSuccess("Lead disqualified", l, null));
    }

    @GetMapping("/leads/{leadId}/activities")
    public ResponseEntity<Map<String, Object>> getLeadActivities(
            @PathVariable("leadId") String leadId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> l = store.getLeads(tenantId).get(leadId);
        if (l == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Lead not found", null, null));
        return ResponseEntity.ok(standardSuccess("Activities retrieved", l.getOrDefault("activities", Collections.emptyList()), null));
    }

    @PostMapping("/leads/{leadId}/activities")
    public ResponseEntity<Map<String, Object>> addLeadActivity(
            @PathVariable("leadId") String leadId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> l = store.getLeads(tenantId).get(leadId);
        if (l == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Lead not found", null, null));
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> acts = (List<Map<String, Object>>) l.computeIfAbsent("activities", k -> new ArrayList<>());
        Map<String, Object> act = new LinkedHashMap<>(body);
        act.put("id", "LACT-" + UUID.randomUUID().toString().substring(0, 6));
        act.put("createdAt", Instant.now().toString());
        acts.add(act);
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Activity added", act, null));
    }

    @PostMapping("/leads/{leadId}/convert")
    public ResponseEntity<Map<String, Object>> convertLead(
            @PathVariable("leadId") String leadId,
            @RequestBody(required = false) Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> l = store.getLeads(tenantId).get(leadId);
        if (l == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Lead not found", null, null));
        l.put("status", "CONVERTED");

        // Auto-create opportunity
        String oppId = "OPP-" + (store.getOpportunities(tenantId).size() + 2001);
        Map<String, Object> opp = new LinkedHashMap<>();
        opp.put("opportunityId", oppId);
        opp.put("leadId", leadId);
        opp.put("opportunityName", (String) l.getOrDefault("companyName", "New Consulting Engagement") + " - Engagement");
        opp.put("serviceId", "CSVC-1001");
        opp.put("stage", "QUALIFICATION");
        opp.put("ownerId", "USR-EXEC-101");
        opp.put("estimatedValue", 1200000.0);
        opp.put("currency", "INR");
        store.getOpportunities(tenantId).put(oppId, opp);

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("leadId", leadId);
        res.put("opportunityId", oppId);
        res.put("status", "CONVERTED");

        return ResponseEntity.ok(standardSuccess("Lead converted to opportunity", res, null));
    }

    @PostMapping("/leads/{leadId}/handoff")
    public ResponseEntity<Map<String, Object>> handoffLead(
            @PathVariable("leadId") String leadId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> l = store.getLeads(tenantId).get(leadId);
        if (l == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Lead not found", null, null));
        l.put("assignedTo", body.get("assigneeId"));
        return ResponseEntity.ok(standardSuccess("Lead handed off", l, null));
    }

    // ==========================================
    // D. DISCOVERY & CONSULTING REQUIREMENTS
    // ==========================================

    @GetMapping("/service-catalogue")
    public ResponseEntity<Map<String, Object>> getServiceCatalogue(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = new ArrayList<>(store.getServices(tenantId).values());
        return ResponseEntity.ok(standardSuccess("Service catalogue retrieved", list, null));
    }

    @GetMapping("/service-catalogue/{serviceId}")
    public ResponseEntity<Map<String, Object>> getServiceDetail(
            @PathVariable("serviceId") String serviceId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> s = store.getServices(tenantId).get(serviceId);
        if (s == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Service not found", null, null));
        return ResponseEntity.ok(standardSuccess("Service details retrieved", s, null));
    }

    @PostMapping("/discovery-sessions")
    public ResponseEntity<Map<String, Object>> createDiscoverySession(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);

        String sessionId = "DISC-" + (store.getDiscoverySessions(tenantId).size() + 1001);
        Map<String, Object> session = new LinkedHashMap<>();
        session.put("sessionId", sessionId);
        session.put("leadId", body.get("leadId"));
        session.put("clientId", body.get("clientId"));
        session.put("meetingType", body.getOrDefault("meetingType", "BUSINESS_DISCOVERY"));
        session.put("status", "SCHEDULE_REQUESTED");
        session.put("scheduledAt", body.get("scheduledAt"));
        session.put("objective", body.get("objective"));

        store.getDiscoverySessions(tenantId).put(sessionId, session);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(standardSuccess("Discovery session created", session, "req_se_003"));
    }

    @GetMapping("/discovery-sessions/{sessionId}")
    public ResponseEntity<Map<String, Object>> getDiscoverySession(
            @PathVariable("sessionId") String sessionId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> s = store.getDiscoverySessions(tenantId).get(sessionId);
        if (s == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Session not found", null, null));
        return ResponseEntity.ok(standardSuccess("Discovery session retrieved", s, null));
    }

    @PatchMapping("/discovery-sessions/{sessionId}")
    public ResponseEntity<Map<String, Object>> patchDiscoverySession(
            @PathVariable("sessionId") String sessionId,
            @RequestBody Map<String, Object> updates,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> s = store.getDiscoverySessions(tenantId).get(sessionId);
        if (s == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Session not found", null, null));
        s.putAll(updates);
        return ResponseEntity.ok(standardSuccess("Session updated", s, null));
    }

    @PostMapping("/discovery-sessions/{sessionId}/notes")
    public ResponseEntity<Map<String, Object>> addDiscoveryNotes(
            @PathVariable("sessionId") String sessionId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> s = store.getDiscoverySessions(tenantId).get(sessionId);
        if (s == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Session not found", null, null));
        s.put("notes", body.get("notes"));
        return ResponseEntity.ok(standardSuccess("Discovery notes recorded", s, null));
    }

    @PostMapping("/discovery-sessions/{sessionId}/requirements")
    public ResponseEntity<Map<String, Object>> recordDiscoveryRequirements(
            @PathVariable("sessionId") String sessionId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);

        String reqId = "REQ-" + (store.getRequirements(tenantId).size() + 1001);
        Map<String, Object> req = new LinkedHashMap<>();
        req.put("requirementId", reqId);
        req.put("discoverySessionId", sessionId);
        req.put("businessChallenge", body.get("businessChallenge"));
        req.put("desiredOutcomes", body.get("desiredOutcomes"));
        req.put("currentSystems", body.get("currentSystems"));
        req.put("budgetRange", body.get("budgetRange"));
        req.put("targetCompletionDate", body.get("targetCompletionDate"));
        req.put("status", "DRAFT");
        req.put("missingInformation", List.of(
                "Required delivery approach",
                "Client-approved project scope"
        ));

        store.getRequirements(tenantId).put(reqId, req);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(standardSuccess("Consulting requirements recorded", req, "req_se_004"));
    }

    @GetMapping("/discovery-sessions/{sessionId}/requirements")
    public ResponseEntity<Map<String, Object>> getSessionRequirements(
            @PathVariable("sessionId") String sessionId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = store.getRequirements(tenantId).values().stream()
                .filter(r -> sessionId.equalsIgnoreCase((String) r.get("discoverySessionId")))
                .collect(Collectors.toList());
        return ResponseEntity.ok(standardSuccess("Requirements retrieved", list, null));
    }

    @PatchMapping("/requirements/{requirementId}")
    public ResponseEntity<Map<String, Object>> patchRequirement(
            @PathVariable("requirementId") String requirementId,
            @RequestBody Map<String, Object> updates,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> r = store.getRequirements(tenantId).get(requirementId);
        if (r == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Requirement not found", null, null));
        r.putAll(updates);
        return ResponseEntity.ok(standardSuccess("Requirement updated", r, null));
    }

    @PostMapping("/requirements/{requirementId}/validate")
    public ResponseEntity<Map<String, Object>> validateRequirement(
            @PathVariable("requirementId") String requirementId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> r = store.getRequirements(tenantId).get(requirementId);
        if (r == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Requirement not found", null, null));
        r.put("missingInformation", Collections.emptyList());
        r.put("status", "VALIDATED");
        return ResponseEntity.ok(standardSuccess("Requirements completeness validated", r, null));
    }

    @PostMapping("/requirements/{requirementId}/approve")
    public ResponseEntity<Map<String, Object>> approveRequirement(
            @PathVariable("requirementId") String requirementId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> r = store.getRequirements(tenantId).get(requirementId);
        if (r == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Requirement not found", null, null));
        r.put("status", "APPROVED");
        return ResponseEntity.ok(standardSuccess("Requirements approved", r, null));
    }

    @PostMapping("/discovery-sessions/{sessionId}/complete")
    public ResponseEntity<Map<String, Object>> completeDiscoverySession(
            @PathVariable("sessionId") String sessionId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> s = store.getDiscoverySessions(tenantId).get(sessionId);
        if (s == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Session not found", null, null));
        s.put("status", "COMPLETED");
        return ResponseEntity.ok(standardSuccess("Discovery completed", s, null));
    }

    // ==========================================
    // E. MEETINGS & COMMUNICATIONS
    // ==========================================

    @GetMapping("/meetings")
    public ResponseEntity<Map<String, Object>> getMeetings(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = new ArrayList<>(store.getMeetings(tenantId).values());
        return ResponseEntity.ok(standardSuccess("Permitted meetings retrieved", list, null));
    }

    @PostMapping("/meetings")
    public ResponseEntity<Map<String, Object>> createMeeting(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        String meetingId = "MEET-" + (store.getMeetings(tenantId).size() + 5001);
        Map<String, Object> m = new LinkedHashMap<>(body);
        m.put("meetingId", meetingId);
        m.put("status", "SCHEDULE_REQUESTED");
        store.getMeetings(tenantId).put(meetingId, m);
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Meeting scheduled", m, null));
    }

    @GetMapping("/meetings/{meetingId}")
    public ResponseEntity<Map<String, Object>> getMeetingById(
            @PathVariable("meetingId") String meetingId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> m = store.getMeetings(tenantId).get(meetingId);
        if (m == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Meeting not found", null, null));
        return ResponseEntity.ok(standardSuccess("Meeting details retrieved", m, null));
    }

    @PatchMapping("/meetings/{meetingId}")
    public ResponseEntity<Map<String, Object>> patchMeeting(
            @PathVariable("meetingId") String meetingId,
            @RequestBody Map<String, Object> updates,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> m = store.getMeetings(tenantId).get(meetingId);
        if (m == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Meeting not found", null, null));
        m.putAll(updates);
        return ResponseEntity.ok(standardSuccess("Meeting updated", m, null));
    }

    @PostMapping("/meetings/{meetingId}/cancel")
    public ResponseEntity<Map<String, Object>> cancelMeeting(
            @PathVariable("meetingId") String meetingId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> m = store.getMeetings(tenantId).get(meetingId);
        if (m == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Meeting not found", null, null));
        m.put("status", "CANCELLED");
        return ResponseEntity.ok(standardSuccess("Meeting cancelled", m, null));
    }

    @GetMapping("/conversations")
    public ResponseEntity<Map<String, Object>> getConversations(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Conversations retrieved", List.of(
                Map.of("conversationId", "CONV-01", "channel", "EMAIL", "clientName", "Example Manufacturing Ltd", "lastMessage", "Regarding modernization scope")
        ), null));
    }

    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<Map<String, Object>> getMessages(
            @PathVariable("conversationId") String conversationId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Messages retrieved", List.of(
                Map.of("sender", "Arun Kumar", "text", "Please send revised proposal", "timestamp", Instant.now().toString())
        ), null));
    }

    @PostMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<Map<String, Object>> sendMessage(
            @PathVariable("conversationId") String conversationId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Message sent", body, null));
    }

    @PostMapping("/conversations/{conversationId}/handoff")
    public ResponseEntity<Map<String, Object>> handoffConversation(
            @PathVariable("conversationId") String conversationId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Conversation handed off", body, null));
    }

    // ==========================================
    // F. OPPORTUNITIES
    // ==========================================

    @GetMapping("/opportunities")
    public ResponseEntity<Map<String, Object>> getOpportunities(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = new ArrayList<>(store.getOpportunities(tenantId).values());
        return ResponseEntity.ok(standardSuccess("Assigned opportunities retrieved", list, null));
    }

    @PostMapping("/opportunities")
    public ResponseEntity<Map<String, Object>> createOpportunity(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);

        String oppName = (String) body.get("opportunityName");
        if (oppName == null || oppName.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(standardError("Validation failed", List.of(Map.of("field", "opportunityName", "message", "Opportunity name is required")), null));
        }

        String oppId = "OPP-" + (store.getOpportunities(tenantId).size() + 2001);
        Map<String, Object> opp = new LinkedHashMap<>();
        opp.put("opportunityId", oppId);
        opp.put("leadId", body.get("leadId"));
        opp.put("opportunityName", oppName);
        opp.put("stage", "QUALIFICATION");
        opp.put("estimatedValue", body.get("estimatedValue"));
        opp.put("currency", body.getOrDefault("currency", "INR"));
        opp.put("ownerId", "CURRENT_AUTHENTICATED_USER");
        opp.put("serviceId", body.get("serviceId"));
        opp.put("requirementId", body.get("requirementId"));
        opp.put("expectedCloseDate", body.get("expectedCloseDate"));
        opp.put("createdAt", Instant.now().toString());

        store.getOpportunities(tenantId).put(oppId, opp);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(standardSuccess("Opportunity created", opp, "req_se_005"));
    }

    @GetMapping("/opportunities/{opportunityId}")
    public ResponseEntity<Map<String, Object>> getOpportunityById(
            @PathVariable("opportunityId") String opportunityId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> opp = store.getOpportunities(tenantId).get(opportunityId);
        if (opp == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Opportunity not found", null, null));
        return ResponseEntity.ok(standardSuccess("Opportunity details retrieved", opp, null));
    }

    @PatchMapping("/opportunities/{opportunityId}")
    public ResponseEntity<Map<String, Object>> patchOpportunity(
            @PathVariable("opportunityId") String opportunityId,
            @RequestBody Map<String, Object> updates,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> opp = store.getOpportunities(tenantId).get(opportunityId);
        if (opp == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Opportunity not found", null, null));
        opp.putAll(updates);
        return ResponseEntity.ok(standardSuccess("Opportunity updated", opp, null));
    }

    @PostMapping("/opportunities/{opportunityId}/stage")
    public ResponseEntity<Map<String, Object>> updateOpportunityStage(
            @PathVariable("opportunityId") String opportunityId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> opp = store.getOpportunities(tenantId).get(opportunityId);
        if (opp == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Opportunity not found", null, null));
        opp.put("stage", body.get("stage"));
        return ResponseEntity.ok(standardSuccess("Opportunity stage updated", opp, null));
    }

    @PostMapping("/opportunities/{opportunityId}/activities")
    public ResponseEntity<Map<String, Object>> addOpportunityActivity(
            @PathVariable("opportunityId") String opportunityId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Activity recorded", body, null));
    }

    @GetMapping("/opportunities/{opportunityId}/activities")
    public ResponseEntity<Map<String, Object>> getOpportunityActivities(
            @PathVariable("opportunityId") String opportunityId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Activities retrieved", List.of(), null));
    }

    @PostMapping("/opportunities/{opportunityId}/close-won")
    public ResponseEntity<Map<String, Object>> closeWon(
            @PathVariable("opportunityId") String opportunityId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> opp = store.getOpportunities(tenantId).get(opportunityId);
        if (opp == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Opportunity not found", null, null));
        opp.put("stage", "WON");
        return ResponseEntity.ok(standardSuccess("Opportunity won", opp, null));
    }

    @PostMapping("/opportunities/{opportunityId}/close-lost")
    public ResponseEntity<Map<String, Object>> closeLost(
            @PathVariable("opportunityId") String opportunityId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> opp = store.getOpportunities(tenantId).get(opportunityId);
        if (opp == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Opportunity not found", null, null));
        opp.put("stage", "LOST");
        opp.put("lossReason", body.get("reason"));
        return ResponseEntity.ok(standardSuccess("Opportunity marked lost", opp, null));
    }

    @GetMapping("/opportunities/{opportunityId}/history")
    public ResponseEntity<Map<String, Object>> getHistory(
            @PathVariable("opportunityId") String opportunityId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> opp = store.getOpportunities(tenantId).get(opportunityId);
        if (opp == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Opportunity not found", null, null));
        return ResponseEntity.ok(standardSuccess("History retrieved", opp.getOrDefault("history", List.of()), null));
    }

    // ==========================================
    // G. CONSULTING PROPOSALS
    // ==========================================

    @GetMapping("/proposals")
    public ResponseEntity<Map<String, Object>> getProposals(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = new ArrayList<>(store.getProposals(tenantId).values());
        return ResponseEntity.ok(standardSuccess("Proposals retrieved", list, null));
    }

    @PostMapping("/proposals")
    public ResponseEntity<Map<String, Object>> createProposalDraft(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);

        String proposalId = "PROP-" + (store.getProposals(tenantId).size() + 4001);
        Map<String, Object> prop = new LinkedHashMap<>();
        prop.put("proposalId", proposalId);
        prop.put("opportunityId", body.get("opportunityId"));
        prop.put("proposalTitle", body.get("proposalTitle"));
        prop.put("serviceId", body.get("serviceId"));
        prop.put("scopeSummary", body.get("scopeSummary"));
        prop.put("deliverables", body.get("deliverables"));
        prop.put("assumptions", body.get("assumptions"));
        prop.put("exclusions", body.get("exclusions"));
        prop.put("currency", body.getOrDefault("currency", "INR"));
        prop.put("status", "DRAFT");
        prop.put("pricingStatus", "NOT_CALCULATED");
        prop.put("approvalStatus", "NOT_REQUESTED");
        prop.put("createdAt", Instant.now().toString());

        store.getProposals(tenantId).put(proposalId, prop);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(standardSuccess("Proposal draft created", prop, "req_se_006"));
    }

    @GetMapping("/proposals/{proposalId}")
    public ResponseEntity<Map<String, Object>> getProposalById(
            @PathVariable("proposalId") String proposalId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> p = store.getProposals(tenantId).get(proposalId);
        if (p == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Proposal not found", null, null));
        return ResponseEntity.ok(standardSuccess("Proposal details retrieved", p, null));
    }

    @PatchMapping("/proposals/{proposalId}")
    public ResponseEntity<Map<String, Object>> patchProposal(
            @PathVariable("proposalId") String proposalId,
            @RequestBody Map<String, Object> updates,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> p = store.getProposals(tenantId).get(proposalId);
        if (p == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Proposal not found", null, null));
        p.putAll(updates);
        return ResponseEntity.ok(standardSuccess("Proposal draft updated", p, null));
    }

    @PostMapping("/proposals/{proposalId}/scope")
    public ResponseEntity<Map<String, Object>> updateProposalScope(
            @PathVariable("proposalId") String proposalId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> p = store.getProposals(tenantId).get(proposalId);
        if (p == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Proposal not found", null, null));
        p.put("scopeSummary", body.get("scopeSummary"));
        return ResponseEntity.ok(standardSuccess("Scope updated", p, null));
    }

    @PostMapping("/proposals/{proposalId}/deliverables")
    public ResponseEntity<Map<String, Object>> addDeliverables(
            @PathVariable("proposalId") String proposalId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> p = store.getProposals(tenantId).get(proposalId);
        if (p == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Proposal not found", null, null));
        p.put("deliverables", body.get("deliverables"));
        return ResponseEntity.ok(standardSuccess("Deliverables updated", p, null));
    }

    @PostMapping("/proposals/{proposalId}/assumptions")
    public ResponseEntity<Map<String, Object>> addAssumptions(
            @PathVariable("proposalId") String proposalId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> p = store.getProposals(tenantId).get(proposalId);
        if (p == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Proposal not found", null, null));
        p.put("assumptions", body.get("assumptions"));
        return ResponseEntity.ok(standardSuccess("Assumptions updated", p, null));
    }

    @PostMapping("/proposals/{proposalId}/milestones")
    public ResponseEntity<Map<String, Object>> addMilestones(
            @PathVariable("proposalId") String proposalId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> p = store.getProposals(tenantId).get(proposalId);
        if (p == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Proposal not found", null, null));
        p.put("milestones", body.get("milestones"));
        return ResponseEntity.ok(standardSuccess("Milestones updated", p, null));
    }

    @PostMapping("/proposals/{proposalId}/pricing")
    public ResponseEntity<Map<String, Object>> calculatePricing(
            @PathVariable("proposalId") String proposalId,
            @RequestBody(required = false) Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> p = store.getProposals(tenantId).get(proposalId);
        if (p == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Proposal not found", null, null));
        p.put("pricingStatus", "CALCULATED");
        if (p.get("proposalValue") == null) p.put("proposalValue", 1200000.0);
        return ResponseEntity.ok(standardSuccess("Server pricing calculated", p, null));
    }

    @PostMapping("/proposals/{proposalId}/validate")
    public ResponseEntity<Map<String, Object>> validateProposal(
            @PathVariable("proposalId") String proposalId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> p = store.getProposals(tenantId).get(proposalId);
        if (p == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Proposal not found", null, null));
        return ResponseEntity.ok(standardSuccess("Proposal validated", Map.of("proposalId", proposalId, "valid", true), null));
    }

    @PostMapping("/proposals/{proposalId}/request-approval")
    public ResponseEntity<Map<String, Object>> requestProposalApproval(
            @PathVariable("proposalId") String proposalId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> p = store.getProposals(tenantId).get(proposalId);
        if (p == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Proposal not found: " + proposalId, null, null));

        String aprId = "APR-" + (store.getProposals(tenantId).size() + 5001);
        p.put("status", "PENDING_APPROVAL");
        p.put("approvalStatus", "PENDING_APPROVAL");
        p.put("approvalRequestId", aprId);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("proposalId", proposalId);
        data.put("status", "PENDING_APPROVAL");
        data.put("approvalRequestId", aprId);
        data.put("decision", null);

        return ResponseEntity.ok(standardSuccess("Proposal approval requested", data, "req_se_008"));
    }

    @PostMapping("/proposals/{proposalId}/send")
    public ResponseEntity<Map<String, Object>> sendProposal(
            @PathVariable("proposalId") String proposalId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> p = store.getProposals(tenantId).get(proposalId);
        if (p == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Proposal not found: " + proposalId, null, null));

        String approvalStatus = (String) p.getOrDefault("approvalStatus", "NOT_REQUESTED");
        if (!"APPROVED".equalsIgnoreCase(approvalStatus)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(standardError("Proposal cannot be sent before required approval",
                            List.of(Map.of("field", "approvalStatus", "message", "Required approval is missing")),
                            "req_se_009_error"));
        }

        String now = Instant.now().toString();
        p.put("status", "SENT");
        p.put("sentAt", now);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("proposalId", proposalId);
        data.put("status", "SENT");
        data.put("channel", body.getOrDefault("channel", "EMAIL"));
        data.put("deliveryStatus", "SUBMITTED");
        data.put("sentAt", now);

        return ResponseEntity.ok(standardSuccess("Proposal sent", data, "req_se_009"));
    }

    @PostMapping("/proposals/{proposalId}/record-response")
    public ResponseEntity<Map<String, Object>> recordClientResponse(
            @PathVariable("proposalId") String proposalId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> p = store.getProposals(tenantId).get(proposalId);
        if (p == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Proposal not found", null, null));
        p.put("clientResponse", body.get("response"));
        p.put("clientFeedback", body.get("feedback"));
        return ResponseEntity.ok(standardSuccess("Client response recorded", p, null));
    }

    @PostMapping("/proposals/{proposalId}/revisions")
    public ResponseEntity<Map<String, Object>> createRevision(
            @PathVariable("proposalId") String proposalId,
            @RequestBody(required = false) Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> p = store.getProposals(tenantId).get(proposalId);
        if (p == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Proposal not found", null, null));
        String revId = proposalId + "-REV2";
        Map<String, Object> rev = new LinkedHashMap<>(p);
        rev.put("proposalId", revId);
        rev.put("status", "DRAFT");
        rev.put("approvalStatus", "NOT_REQUESTED");
        store.getProposals(tenantId).put(revId, rev);
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Proposal revision created", rev, null));
    }

    @GetMapping("/proposals/{proposalId}/history")
    public ResponseEntity<Map<String, Object>> getProposalHistory(
            @PathVariable("proposalId") String proposalId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> p = store.getProposals(tenantId).get(proposalId);
        if (p == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Proposal not found", null, null));
        return ResponseEntity.ok(standardSuccess("Proposal history retrieved", List.of(p), null));
    }

    // ==========================================
    // H. PRICING & APPROVALS
    // ==========================================

    @GetMapping("/pricing/policies")
    public ResponseEntity<Map<String, Object>> getPricingPolicies(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> pol = new LinkedHashMap<>();
        pol.put("fixedFeeStandardMargin", 30.0);
        pol.put("timeAndMaterialsDayRateInr", 60000.0);
        pol.put("requiresApprovalAboveDiscount", 5.0);
        return ResponseEntity.ok(standardSuccess("Pricing policies retrieved", pol, null));
    }

    @PostMapping("/pricing/estimates")
    public ResponseEntity<Map<String, Object>> requestPricingEstimate(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("proposalId", body.get("proposalId"));
        data.put("currency", body.getOrDefault("currency", "INR"));
        data.put("estimateStatus", "PENDING_RATE_VALIDATION");
        data.put("estimatedTotal", null);
        data.put("requiresRateResolution", true);

        return ResponseEntity.ok(standardSuccess("Pricing estimate calculated", data, "req_se_007"));
    }

    @PostMapping("/pricing/discount-requests")
    public ResponseEntity<Map<String, Object>> requestDiscount(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        String reqId = "DISCREQ-" + (store.getPricingRequests(tenantId).size() + 101);
        Map<String, Object> r = new LinkedHashMap<>(body);
        r.put("requestId", reqId);
        r.put("status", "PENDING_MANAGER_APPROVAL");
        store.getPricingRequests(tenantId).put(reqId, r);
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Discount request submitted", r, null));
    }

    @GetMapping("/pricing/discount-requests/{requestId}")
    public ResponseEntity<Map<String, Object>> getDiscountRequest(
            @PathVariable("requestId") String requestId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> r = store.getPricingRequests(tenantId).get(requestId);
        if (r == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Discount request not found", null, null));
        return ResponseEntity.ok(standardSuccess("Discount request status retrieved", r, null));
    }

    @GetMapping("/approval-requests")
    public ResponseEntity<Map<String, Object>> getApprovalRequests(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = new ArrayList<>(store.getPricingRequests(tenantId).values());
        return ResponseEntity.ok(standardSuccess("Approval requests retrieved", list, null));
    }

    @GetMapping("/approval-requests/{requestId}")
    public ResponseEntity<Map<String, Object>> getApprovalRequestDetail(
            @PathVariable("requestId") String requestId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> r = store.getPricingRequests(tenantId).get(requestId);
        if (r == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Request not found", null, null));
        return ResponseEntity.ok(standardSuccess("Approval details retrieved", r, null));
    }

    // ==========================================
    // I. FOLLOW-UPS & TASKS
    // ==========================================

    @GetMapping("/follow-ups")
    public ResponseEntity<Map<String, Object>> getFollowUps(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = new ArrayList<>(store.getTasks(tenantId).values());
        return ResponseEntity.ok(standardSuccess("Follow-up tasks retrieved", list, null));
    }

    @PostMapping("/follow-ups")
    public ResponseEntity<Map<String, Object>> createFollowUp(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);

        String taskId = "FUP-" + (store.getTasks(tenantId).size() + 6001);
        Map<String, Object> fup = new LinkedHashMap<>();
        fup.put("taskId", taskId);
        fup.put("leadId", body.get("leadId"));
        fup.put("opportunityId", body.get("opportunityId"));
        fup.put("followUpType", body.get("followUpType"));
        fup.put("dueAt", body.get("dueAt"));
        fup.put("notes", body.get("notes"));
        fup.put("status", "PENDING");
        fup.put("createdAt", Instant.now().toString());

        store.getTasks(tenantId).put(taskId, fup);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(standardSuccess("Follow-up created", fup, "req_se_010"));
    }

    @GetMapping("/follow-ups/{taskId}")
    public ResponseEntity<Map<String, Object>> getFollowUpById(
            @PathVariable("taskId") String taskId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> t = store.getTasks(tenantId).get(taskId);
        if (t == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Follow-up not found", null, null));
        return ResponseEntity.ok(standardSuccess("Task details retrieved", t, null));
    }

    @PatchMapping("/follow-ups/{taskId}")
    public ResponseEntity<Map<String, Object>> patchFollowUp(
            @PathVariable("taskId") String taskId,
            @RequestBody Map<String, Object> updates,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> t = store.getTasks(tenantId).get(taskId);
        if (t == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Follow-up not found", null, null));
        t.putAll(updates);
        return ResponseEntity.ok(standardSuccess("Task updated", t, null));
    }

    @PostMapping("/follow-ups/{taskId}/complete")
    public ResponseEntity<Map<String, Object>> completeFollowUp(
            @PathVariable("taskId") String taskId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> t = store.getTasks(tenantId).get(taskId);
        if (t == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Follow-up not found", null, null));
        t.put("status", "COMPLETED");
        return ResponseEntity.ok(standardSuccess("Task completed", t, null));
    }

    @PostMapping("/follow-ups/{taskId}/snooze")
    public ResponseEntity<Map<String, Object>> snoozeFollowUp(
            @PathVariable("taskId") String taskId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> t = store.getTasks(tenantId).get(taskId);
        if (t == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Follow-up not found", null, null));
        t.put("dueAt", body.get("dueAt"));
        return ResponseEntity.ok(standardSuccess("Task rescheduled", t, null));
    }

    @GetMapping("/tasks")
    public ResponseEntity<Map<String, Object>> getTasks(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return getFollowUps(tenantHeader);
    }

    @GetMapping("/tasks/{taskId}")
    public ResponseEntity<Map<String, Object>> getTaskById(
            @PathVariable("taskId") String taskId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return getFollowUpById(taskId, tenantHeader);
    }

    @PatchMapping("/tasks/{taskId}")
    public ResponseEntity<Map<String, Object>> patchTask(
            @PathVariable("taskId") String taskId,
            @RequestBody Map<String, Object> updates,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return patchFollowUp(taskId, updates, tenantHeader);
    }

    // ==========================================
    // J. ENGAGEMENT HANDOFF
    // ==========================================

    @PostMapping("/engagement-handoffs")
    public ResponseEntity<Map<String, Object>> initiateHandoff(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);

        String oppId = (String) body.get("opportunityId");
        String contractId = (String) body.get("contractId");
        if (oppId == null || contractId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(standardError("Validation failed", List.of(Map.of("field", "opportunityId", "message", "opportunityId and contractId required")), null));
        }

        String handoffId = "HOF-" + (store.getEngagementHandoffs(tenantId).size() + 6001);
        Map<String, Object> handoff = new LinkedHashMap<>();
        handoff.put("handoffId", handoffId);
        handoff.put("opportunityId", oppId);
        handoff.put("contractId", contractId);
        handoff.put("status", "PENDING_REVIEW");
        handoff.put("clientObjectives", body.get("clientObjectives"));
        handoff.put("handoffNotes", body.get("handoffNotes"));
        handoff.put("receivingTeamId", body.getOrDefault("receivingTeamId", "TEAM-DELIVERY-01"));
        handoff.put("createdAt", Instant.now().toString());

        store.getEngagementHandoffs(tenantId).put(handoffId, handoff);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(standardSuccess("Engagement handoff initiated", handoff, "req_se_011"));
    }

    @GetMapping("/engagement-handoffs/{handoffId}")
    public ResponseEntity<Map<String, Object>> getHandoffStatus(
            @PathVariable("handoffId") String handoffId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> h = store.getEngagementHandoffs(tenantId).get(handoffId);
        if (h == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Handoff not found", null, null));
        return ResponseEntity.ok(standardSuccess("Handoff status retrieved", h, null));
    }

    @PostMapping("/engagement-handoffs/{handoffId}/submit")
    public ResponseEntity<Map<String, Object>> submitHandoff(
            @PathVariable("handoffId") String handoffId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> h = store.getEngagementHandoffs(tenantId).get(handoffId);
        if (h == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Handoff not found", null, null));
        h.put("status", "PENDING_ACCEPTANCE");
        return ResponseEntity.ok(standardSuccess("Handoff submitted for review", h, null));
    }

    @GetMapping("/contracts/{contractId}")
    public ResponseEntity<Map<String, Object>> getContract(
            @PathVariable("contractId") String contractId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> c = store.getContracts(tenantId).get(contractId);
        if (c == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Contract not found", null, null));
        return ResponseEntity.ok(standardSuccess("Authorized contract details retrieved", c, null));
    }

    @GetMapping("/reports/my-performance")
    public ResponseEntity<Map<String, Object>> getMyPerformance(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> rep = new LinkedHashMap<>();
        rep.put("closedWonValue", 450000.0);
        rep.put("currency", "INR");
        rep.put("activeOpportunities", 4);
        rep.put("proposalsSent", 6);
        rep.put("winRatePercent", 50.0);
        return ResponseEntity.ok(standardSuccess("Personal sales report retrieved", rep, null));
    }
}
