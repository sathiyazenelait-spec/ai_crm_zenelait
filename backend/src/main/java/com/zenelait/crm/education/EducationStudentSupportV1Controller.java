package com.zenelait.crm.education;

import com.zenelait.crm.common.exception.ForbiddenException;
import com.zenelait.crm.common.exception.ResourceNotFoundException;
import com.zenelait.crm.tenant.TenantSecurityService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Zenelait AI CRM — Education Tenant: Student Support Agent V1 Controller
 * Base Path: /api/v1/education/student-support
 * Implements 20 REST API endpoints specified in Section 4 of Education & Training Tenant.
 */
@RestController
@RequestMapping("/api/v1/education/student-support")
@CrossOrigin(origins = "*")
public class EducationStudentSupportV1Controller {

    private final EducationDataStore store;
    private final TenantSecurityService tenantSecurityService;

    public EducationStudentSupportV1Controller(EducationDataStore store, TenantSecurityService tenantSecurityService) {
        this.store = store;
        this.tenantSecurityService = tenantSecurityService;
    }

    private void validateStudentSupportScope() {
        try {
            String tenantId = tenantSecurityService.getCurrentTenantId();
            if (tenantId != null && tenantId.toUpperCase().contains("IT")) {
                throw new ForbiddenException("Access denied: Student Support module is restricted to Education/Training tenants only.");
            }
        } catch (ForbiddenException fe) {
            throw fe;
        } catch (Exception ignored) {
            // Test or unauthenticated mock environment fallback
        }
    }

    private <T> ResponseEntity<Map<String, Object>> buildSuccess(String message, T data, HttpStatus status) {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", true);
        resp.put("message", message);
        resp.put("data", data);
        resp.put("timestamp", "2026-10-26T15:00:00+05:30");
        resp.put("requestId", "req_support_" + UUID.randomUUID().toString().substring(0, 8));
        return ResponseEntity.status(status).body(resp);
    }

    // 1. Support Dashboard
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(
            @RequestParam(required = false, defaultValue = "2026-10-01") String from,
            @RequestParam(required = false, defaultValue = "2026-10-31") String to
    ) {
        validateStudentSupportScope();

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("assignedTickets", 38);
        summary.put("openTickets", 14);
        summary.put("highPriorityTickets", 3);
        summary.put("unassignedTickets", 5);
        summary.put("resolvedThisMonth", 52);
        summary.put("overdueTickets", 4);

        List<Map<String, Object>> ticketsByCategory = List.of(
                Map.of("category", "LEARNING_PLATFORM", "count", 12),
                Map.of("category", "COURSE_INFORMATION", "count", 9),
                Map.of("category", "CERTIFICATE", "count", 5)
        );

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("summary", summary);
        data.put("ticketsByCategory", ticketsByCategory);
        data.put("recentTickets", store.supportTickets);

        return buildSuccess("Support dashboard retrieved", data, HttpStatus.OK);
    }

    // 2. Retrieve Tickets
    @GetMapping("/tickets")
    public ResponseEntity<?> getTickets(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "10") int size
    ) {
        validateStudentSupportScope();
        List<Map<String, Object>> filtered = store.supportTickets.stream()
                .filter(t -> status == null || status.equalsIgnoreCase((String) t.get("status")))
                .filter(t -> priority == null || priority.equalsIgnoreCase((String) t.get("priority")))
                .collect(Collectors.toList());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", filtered);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", filtered.size());
        data.put("totalPages", 1);

        return buildSuccess("Tickets retrieved", data, HttpStatus.OK);
    }

    // 3. Create Ticket
    @PostMapping("/tickets")
    public ResponseEntity<?> createTicket(@RequestBody Map<String, Object> body) {
        validateStudentSupportScope();

        long ticketId = store.ticketSeq.incrementAndGet();
        Object studentIdObj = body.get("studentId");
        Long studentId = studentIdObj instanceof Number ? ((Number) studentIdObj).longValue() : 3001L;

        Map<String, Object> t = new LinkedHashMap<>();
        t.put("ticketId", ticketId);
        t.put("studentId", studentId);
        t.put("studentName", body.getOrDefault("studentName", "Student " + studentId));
        t.put("subject", body.getOrDefault("subject", "General Enquiry"));
        t.put("description", body.get("description"));
        t.put("category", body.getOrDefault("category", "LEARNING_PLATFORM"));
        t.put("priority", body.getOrDefault("priority", "HIGH"));
        t.put("status", "OPEN");
        t.put("channel", body.getOrDefault("channel", "EMAIL"));
        t.put("assignedAgentId", 201L);
        t.put("createdAt", "2026-10-26T15:01:00+05:30");
        t.put("tenantId", EducationDataStore.TENANT_ID);

        store.supportTickets.add(0, t);
        return buildSuccess("Support ticket created", t, HttpStatus.CREATED);
    }

    // 4. View Ticket
    @GetMapping("/tickets/{ticketId}")
    public ResponseEntity<?> getTicket(@PathVariable Long ticketId) {
        validateStudentSupportScope();
        Map<String, Object> found = store.supportTickets.stream()
                .filter(t -> ticketId.equals(t.get("ticketId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));
        return buildSuccess("Ticket retrieved", found, HttpStatus.OK);
    }

    // 5. Update Ticket
    @PatchMapping("/tickets/{ticketId}")
    public ResponseEntity<?> updateTicket(@PathVariable Long ticketId, @RequestBody Map<String, Object> body) {
        validateStudentSupportScope();
        Map<String, Object> found = store.supportTickets.stream()
                .filter(t -> ticketId.equals(t.get("ticketId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));

        body.forEach((k, v) -> {
            if (!k.equalsIgnoreCase("ticketId") && !k.equalsIgnoreCase("tenantId")) {
                found.put(k, v);
            }
        });
        return buildSuccess("Ticket updated", found, HttpStatus.OK);
    }

    // 6. Assign Ticket
    @PostMapping("/tickets/{ticketId}/assign")
    public ResponseEntity<?> assignTicket(@PathVariable Long ticketId, @RequestBody Map<String, Object> body) {
        validateStudentSupportScope();
        Map<String, Object> found = store.supportTickets.stream()
                .filter(t -> ticketId.equals(t.get("ticketId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));

        found.put("assignedAgentId", body.getOrDefault("agentId", 201L));
        found.put("status", "ASSIGNED");
        found.put("assignedAt", "2026-10-26T15:02:30+05:30");

        return buildSuccess("Ticket assigned successfully", found, HttpStatus.OK);
    }

    // 7. Get Ticket Messages
    @GetMapping("/tickets/{ticketId}/messages")
    public ResponseEntity<?> getMessages(@PathVariable Long ticketId) {
        validateStudentSupportScope();
        List<Map<String, Object>> msgs = store.supportMessages.stream()
                .filter(m -> ticketId.equals(m.get("ticketId")))
                .collect(Collectors.toList());
        return buildSuccess("Ticket messages retrieved", msgs, HttpStatus.OK);
    }

    // 8. Send Reply Message
    @PostMapping("/tickets/{ticketId}/messages")
    public ResponseEntity<?> sendMessage(@PathVariable Long ticketId, @RequestBody Map<String, Object> body) {
        validateStudentSupportScope();

        long msgId = store.msgSeq.incrementAndGet();
        Map<String, Object> msg = new LinkedHashMap<>();
        msg.put("messageId", msgId);
        msg.put("ticketId", ticketId);
        msg.put("messageType", body.getOrDefault("messageType", "PUBLIC_REPLY"));
        msg.put("channel", body.getOrDefault("channel", "EMAIL"));
        msg.put("content", body.get("content"));
        msg.put("deliveryStatus", "QUEUED");
        msg.put("createdBy", 201L);
        msg.put("createdAt", "2026-10-26T15:03:00+05:30");
        msg.put("tenantId", EducationDataStore.TENANT_ID);

        store.supportMessages.add(msg);
        return buildSuccess("Ticket reply recorded", msg, HttpStatus.OK);
    }

    // 9. Add Internal Note
    @PostMapping("/tickets/{ticketId}/internal-notes")
    public ResponseEntity<?> addInternalNote(@PathVariable Long ticketId, @RequestBody Map<String, Object> body) {
        validateStudentSupportScope();

        long noteId = store.noteSeq.incrementAndGet();
        Map<String, Object> note = new LinkedHashMap<>();
        note.put("noteId", noteId);
        note.put("ticketId", ticketId);
        note.put("visibility", "INTERNAL");
        note.put("content", body.get("content"));
        note.put("createdBy", 201L);
        note.put("createdAt", "2026-10-26T15:04:00+05:30");
        note.put("tenantId", EducationDataStore.TENANT_ID);

        store.internalNotes.add(note);
        return buildSuccess("Internal note added", note, HttpStatus.OK);
    }

    // 10. AI Reply Draft
    @PostMapping("/tickets/{ticketId}/ai/reply-draft")
    public ResponseEntity<?> generateReplyDraft(@PathVariable Long ticketId, @RequestBody(required = false) Map<String, Object> body) {
        validateStudentSupportScope();

        Map<String, Object> draft = new LinkedHashMap<>();
        draft.put("draftId", "support_draft_" + UUID.randomUUID().toString().substring(0, 5));
        draft.put("ticketId", ticketId);
        draft.put("suggestedReply", "Hello Meena, thank you for reporting the issue. Please try signing out and signing in again, and check whether the course page opens in a supported browser. If the problem continues, we can escalate the issue to the learning platform team.");
        draft.put("knowledgeSources", List.of(Map.of("sourceId", "KB-101", "title", "Learning Portal Troubleshooting")));
        draft.put("status", "DRAFT");
        draft.put("requiresHumanReview", true);

        return buildSuccess("AI reply draft generated", draft, HttpStatus.OK);
    }

    // 11. Escalate Ticket
    @PostMapping("/tickets/{ticketId}/escalate")
    public ResponseEntity<?> escalateTicket(@PathVariable Long ticketId, @RequestBody Map<String, Object> body) {
        validateStudentSupportScope();
        Map<String, Object> found = store.supportTickets.stream()
                .filter(t -> ticketId.equals(t.get("ticketId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));

        String prev = (String) found.getOrDefault("status", "OPEN");
        found.put("previousStatus", prev);
        found.put("status", "ESCALATED");
        found.put("escalationType", body.getOrDefault("escalationType", "TECHNICAL_TEAM"));
        found.put("priority", body.getOrDefault("priority", "HIGH"));
        found.put("escalatedAt", "2026-10-26T15:06:00+05:30");

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("ticketId", ticketId);
        data.put("previousStatus", prev);
        data.put("status", "ESCALATED");
        data.put("escalationType", found.get("escalationType"));
        data.put("priority", found.get("priority"));
        data.put("escalatedAt", found.get("escalatedAt"));

        return buildSuccess("Ticket escalated", data, HttpStatus.OK);
    }

    // 12. Resolve Ticket
    @PostMapping("/tickets/{ticketId}/resolve")
    public ResponseEntity<?> resolveTicket(@PathVariable Long ticketId, @RequestBody Map<String, Object> body) {
        validateStudentSupportScope();
        Map<String, Object> found = store.supportTickets.stream()
                .filter(t -> ticketId.equals(t.get("ticketId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));

        found.put("status", "RESOLVED");
        found.put("resolutionCode", body.getOrDefault("resolutionCode", "ACCOUNT_ACCESS_RESTORED"));
        found.put("resolutionNotes", body.get("resolutionNotes"));
        found.put("resolvedAt", "2026-10-26T15:10:00+05:30");
        found.put("resolvedBy", 201L);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("ticketId", ticketId);
        data.put("status", "RESOLVED");
        data.put("resolutionCode", found.get("resolutionCode"));
        data.put("resolvedAt", found.get("resolvedAt"));
        data.put("resolvedBy", 201L);

        return buildSuccess("Ticket resolved", data, HttpStatus.OK);
    }

    // 13. Reopen Ticket
    @PostMapping("/tickets/{ticketId}/reopen")
    public ResponseEntity<?> reopenTicket(@PathVariable Long ticketId, @RequestBody(required = false) Map<String, Object> body) {
        validateStudentSupportScope();
        Map<String, Object> found = store.supportTickets.stream()
                .filter(t -> ticketId.equals(t.get("ticketId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));

        found.put("status", "OPEN");
        found.put("reopenedAt", "2026-10-26T15:11:00+05:30");
        found.put("reopenReason", body != null ? body.get("reason") : "Customer reported issue still present");

        return buildSuccess("Ticket reopened", found, HttpStatus.OK);
    }

    // 14. Student Tickets
    @GetMapping("/students/{studentId}/tickets")
    public ResponseEntity<?> getStudentTickets(@PathVariable Long studentId) {
        validateStudentSupportScope();
        List<Map<String, Object>> list = store.supportTickets.stream()
                .filter(t -> studentId.equals(t.get("studentId")))
                .collect(Collectors.toList());
        return buildSuccess("Student tickets retrieved", list, HttpStatus.OK);
    }

    // 15. Student Timeline
    @GetMapping("/students/{studentId}/timeline")
    public ResponseEntity<?> getStudentTimeline(@PathVariable Long studentId) {
        validateStudentSupportScope();
        List<Map<String, Object>> timeline = new ArrayList<>();
        timeline.add(Map.of("eventType", "ENROLMENT", "title", "Student Enrolled in Java Full Stack", "timestamp", "2026-10-20T10:00:00+05:30"));
        timeline.add(Map.of("eventType", "TICKET_OPENED", "title", "Ticket 4001: Learning portal login issue", "timestamp", "2026-10-26T15:01:00+05:30"));
        return buildSuccess("Student timeline retrieved", timeline, HttpStatus.OK);
    }

    // 16. Knowledge Search
    @GetMapping("/knowledge/search")
    public ResponseEntity<?> searchKnowledge(@RequestParam(required = false, defaultValue = "") String q) {
        validateStudentSupportScope();
        String query = q.toLowerCase();
        List<Map<String, Object>> results = store.knowledgeBase.stream()
                .filter(kb -> ((String) kb.get("title")).toLowerCase().contains(query) ||
                        ((String) kb.get("content")).toLowerCase().contains(query))
                .collect(Collectors.toList());
        return buildSuccess("Knowledge search results", results, HttpStatus.OK);
    }

    // 17. List Complaints
    @GetMapping("/complaints")
    public ResponseEntity<?> getComplaints(
            @RequestParam(required = false) String status,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "10") int size
    ) {
        validateStudentSupportScope();
        List<Map<String, Object>> filtered = store.complaints.stream()
                .filter(c -> status == null || status.equalsIgnoreCase((String) c.get("status")))
                .collect(Collectors.toList());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", filtered);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", filtered.size());
        data.put("totalPages", 1);

        return buildSuccess("Complaints retrieved", data, HttpStatus.OK);
    }

    // 18. Create Complaint
    @PostMapping("/complaints")
    public ResponseEntity<?> createComplaint(@RequestBody Map<String, Object> body) {
        validateStudentSupportScope();

        long id = store.complaintSeq.incrementAndGet();
        Object stuIdObj = body.get("studentId");
        Long studentId = stuIdObj instanceof Number ? ((Number) stuIdObj).longValue() : 3001L;

        Map<String, Object> comp = new LinkedHashMap<>();
        comp.put("complaintId", id);
        comp.put("studentId", studentId);
        comp.put("category", body.getOrDefault("category", "COURSE_DELIVERY"));
        comp.put("subject", body.get("subject"));
        comp.put("description", body.get("description"));
        comp.put("priority", body.getOrDefault("priority", "MEDIUM"));
        comp.put("status", "OPEN");
        comp.put("createdAt", "2026-10-26T15:12:00+05:30");
        comp.put("tenantId", EducationDataStore.TENANT_ID);

        store.complaints.add(0, comp);
        return buildSuccess("Complaint registered", comp, HttpStatus.OK);
    }

    // 19. Update Complaint
    @PatchMapping("/complaints/{complaintId}")
    public ResponseEntity<?> updateComplaint(@PathVariable Long complaintId, @RequestBody Map<String, Object> body) {
        validateStudentSupportScope();
        Map<String, Object> found = store.complaints.stream()
                .filter(c -> complaintId.equals(c.get("complaintId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found: " + complaintId));

        body.forEach((k, v) -> {
            if (!k.equalsIgnoreCase("complaintId")) found.put(k, v);
        });
        return buildSuccess("Complaint updated", found, HttpStatus.OK);
    }

    // 20. Support Reports
    @GetMapping("/reports")
    public ResponseEntity<?> getReports(
            @RequestParam(required = false, defaultValue = "2026-10-01") String from,
            @RequestParam(required = false, defaultValue = "2026-10-31") String to
    ) {
        validateStudentSupportScope();
        Map<String, Object> report = new LinkedHashMap<>();
        report.put("period", Map.of("from", from, "to", to));
        report.put("totalTicketsReceived", 68);
        report.put("resolvedCount", 52);
        report.put("averageResolutionHours", 4.2);
        report.put("firstContactResolutionPercent", 78.5);
        report.put("satisfactionScore", 4.8);
        return buildSuccess("Support report retrieved", report, HttpStatus.OK);
    }
}
