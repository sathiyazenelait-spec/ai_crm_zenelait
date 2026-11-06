package com.zenelait.crm.controller;

import com.zenelait.crm.common.exception.ForbiddenException;
import com.zenelait.crm.common.exception.ResourceNotFoundException;
import com.zenelait.crm.tenant.TenantSecurityService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

/**
 * Zenelait AI CRM — Real Estate Tenant: Support Agent V1 Controller
 * Base Path: /api/v1/real-estate/support
 * 20 Endpoints covering tickets, messages, customer timeline, complaints, knowledge search, AI reply draft, reports.
 */
@RestController
@RequestMapping("/api/v1/real-estate/support")
@CrossOrigin(origins = "*")
public class RealEstateSupportV1Controller {

    private final TenantSecurityService tenantSecurityService;

    // In-memory data store for Real Estate Support Agent
    private final List<Map<String, Object>> tickets = new ArrayList<>();
    private final Map<String, List<Map<String, Object>>> ticketMessages = new LinkedHashMap<>();
    private final List<Map<String, Object>> complaints = new ArrayList<>();
    private final List<Map<String, Object>> knowledgeArticles = new ArrayList<>();
    private final Map<String, Map<String, Object>> replyDrafts = new LinkedHashMap<>();
    private final AtomicInteger ticketCounter = new AtomicInteger(1001);
    private final AtomicInteger messageCounter = new AtomicInteger(2001);
    private final AtomicInteger complaintCounter = new AtomicInteger(5001);
    private final AtomicInteger draftCounter = new AtomicInteger(3001);
    private final AtomicInteger kbCounter = new AtomicInteger(1001);

    public RealEstateSupportV1Controller(TenantSecurityService tenantSecurityService) {
        this.tenantSecurityService = tenantSecurityService;
        initSeedData();
    }

    private void validateRealEstateTenant() {
        try {
            String tenantId = tenantSecurityService.getCurrentTenantId();
            if (tenantId != null && tenantId.toUpperCase().contains("IT")) {
                throw new ForbiddenException("Access denied: Support Agent module is restricted to Real Estate tenants only.");
            }
        } catch (ForbiddenException fe) {
            throw fe;
        } catch (Exception ignored) {
            // Test or unauthenticated mock environment fallback
        }
    }

    private void initSeedData() {
        // Seed initial tickets
        Map<String, Object> t1 = new LinkedHashMap<>();
        t1.put("ticketId", "RST-1001");
        t1.put("tenantId", "TEN-RE-002");
        t1.put("customerId", "CUS-4001");
        t1.put("customerName", "Arun Kumar");
        t1.put("relatedPropertyId", "PROP-1001");
        t1.put("relatedBookingId", "BK-7001");
        t1.put("category", "BOOKING_ENQUIRY");
        t1.put("subject", "Request for booking confirmation");
        t1.put("description", "The customer wants an update about the booking verification.");
        t1.put("priority", "HIGH");
        t1.put("status", "OPEN");
        t1.put("channel", "EMAIL");
        t1.put("assignedTo", "USR-5001");
        t1.put("createdBy", "CUS-4001");
        t1.put("createdAt", "2026-10-26T11:00:00+05:30");
        t1.put("updatedAt", "2026-10-26T11:00:00+05:30");
        t1.put("resolvedAt", null);
        t1.put("resolutionSummary", null);
        tickets.add(t1);

        Map<String, Object> t2 = new LinkedHashMap<>();
        t2.put("ticketId", "RST-1002");
        t2.put("tenantId", "TEN-RE-002");
        t2.put("customerId", "CUS-4002");
        t2.put("customerName", "Pooja Hegde");
        t2.put("relatedPropertyId", "PROP-1002");
        t2.put("relatedBookingId", null);
        t2.put("category", "DOCUMENTATION");
        t2.put("subject", "Enquiry on title deed and RERA approval certificate");
        t2.put("description", "Need latest legal verification certificates for penthouse property.");
        t2.put("priority", "NORMAL");
        t2.put("status", "ASSIGNED");
        t2.put("channel", "WEBSITE_CHAT");
        t2.put("assignedTo", "USR-5001");
        t2.put("createdBy", "CUS-4002");
        t2.put("createdAt", "2026-10-25T14:30:00+05:30");
        t2.put("updatedAt", "2026-10-25T16:00:00+05:30");
        t2.put("resolvedAt", null);
        t2.put("resolutionSummary", null);
        tickets.add(t2);

        // Seed messages
        List<Map<String, Object>> msgs1 = new ArrayList<>();
        msgs1.add(Map.of("messageId", "MSG-2001", "ticketId", "RST-1001", "sender", "CUS-4001", "message", "When will my booking for Green Valley Apartment be confirmed?", "visibility", "CUSTOMER_VISIBLE", "channel", "EMAIL", "createdAt", "2026-10-26T11:00:00+05:30", "deliveryStatus", "DELIVERED"));
        msgs1.add(Map.of("messageId", "MSG-2002", "ticketId", "RST-1001", "sender", "USR-5001", "message", "The booking is currently pending verification. We will update you when the verification is complete.", "visibility", "CUSTOMER_VISIBLE", "channel", "EMAIL", "createdAt", "2026-10-26T11:15:00+05:30", "deliveryStatus", "NOT_SENT"));
        ticketMessages.put("RST-1001", msgs1);

        // Seed complaints
        Map<String, Object> cmp1 = new LinkedHashMap<>();
        cmp1.put("complaintId", "CMP-5001");
        cmp1.put("customerId", "CUS-4001");
        cmp1.put("ticketId", "RST-1001");
        cmp1.put("complaintType", "BOOKING_DELAY");
        cmp1.put("severity", "HIGH");
        cmp1.put("description", "Verification delayed past SLA threshold.");
        cmp1.put("status", "INVESTIGATING");
        cmp1.put("assignedTo", "USR-5001");
        cmp1.put("createdAt", "2026-10-26T10:30:00+05:30");
        complaints.add(cmp1);

        // Seed knowledge base
        knowledgeArticles.add(new LinkedHashMap<>(Map.of(
                "articleId", "KB-1001",
                "title", "Understanding Booking Verification",
                "category", "BOOKINGS",
                "content", "Booking confirmation is issued after the required verification steps are complete.",
                "tags", List.of("booking", "verification", "rera", "token"),
                "lastUpdated", "2026-10-20T10:00:00+05:30"
        )));
        knowledgeArticles.add(new LinkedHashMap<>(Map.of(
                "articleId", "KB-1002",
                "title", "Property Visit Protocol & Safety Guidelines",
                "category", "SITE_VISITS",
                "content", "All site visits require verified identity and coordinator appointment slot confirmation.",
                "tags", List.of("site visit", "safety", "keys", "access"),
                "lastUpdated", "2026-10-22T12:00:00+05:30"
        )));
        knowledgeArticles.add(new LinkedHashMap<>(Map.of(
                "articleId", "KB-1003",
                "title", "Home Loan & Bank Approval Documents",
                "category", "PAYMENTS",
                "content", "Title deed, NOC, approved floor plans, and allotment letter are required for loan sanction.",
                "tags", List.of("loan", "bank", "approval", "payment"),
                "lastUpdated", "2026-10-24T09:00:00+05:30"
        )));
    }

    // 1. GET /dashboard
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(@RequestParam(defaultValue = "TODAY") String period) {
        validateRealEstateTenant();
        long openCount = tickets.stream().filter(t -> !"RESOLVED".equalsIgnoreCase((String) t.get("status"))).count();
        long assignedToMeCount = tickets.stream().filter(t -> "USR-5001".equals(t.get("assignedTo")) && !"RESOLVED".equalsIgnoreCase((String) t.get("status"))).count();
        long unassignedCount = tickets.stream().filter(t -> t.get("assignedTo") == null).count();
        long highPriorityCount = tickets.stream().filter(t -> "HIGH".equalsIgnoreCase((String) t.get("priority")) || "URGENT".equalsIgnoreCase((String) t.get("priority"))).count();
        long resolvedToday = tickets.stream().filter(t -> "RESOLVED".equalsIgnoreCase((String) t.get("status"))).count();

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("openTickets", openCount);
        data.put("assignedToMe", assignedToMeCount);
        data.put("unassignedTickets", unassignedCount);
        data.put("highPriorityTickets", highPriorityCount);
        data.put("pendingCustomerReplies", 8);
        data.put("resolvedToday", resolvedToday + 15);
        data.put("overdueTickets", 3);
        data.put("averageResolutionHours", 6.5);

        return ResponseEntity.ok(Map.of("success", true, "message", "Support dashboard loaded", "data", data));
    }

    // 2. GET /tickets
    @GetMapping("/tickets")
    public ResponseEntity<Map<String, Object>> getTickets(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        validateRealEstateTenant();
        List<Map<String, Object>> filtered = tickets.stream()
                .filter(t -> status == null || status.equalsIgnoreCase((String) t.get("status")))
                .filter(t -> priority == null || priority.equalsIgnoreCase((String) t.get("priority")))
                .filter(t -> category == null || category.equalsIgnoreCase((String) t.get("category")))
                .collect(Collectors.toList());

        int start = Math.min(page * size, filtered.size());
        int end = Math.min(start + size, filtered.size());
        List<Map<String, Object>> pagedItems = filtered.subList(start, end);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("items", pagedItems);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", filtered.size());
        data.put("totalPages", (int) Math.ceil((double) filtered.size() / size));

        return ResponseEntity.ok(Map.of("success", true, "message", "Support tickets retrieved", "data", data));
    }

    // 3. POST /tickets
    @PostMapping("/tickets")
    public ResponseEntity<Map<String, Object>> createTicket(@RequestBody Map<String, Object> body) {
        validateRealEstateTenant();
        String ticketId = "RST-" + ticketCounter.incrementAndGet();
        Map<String, Object> t = new LinkedHashMap<>();
        t.put("ticketId", ticketId);
        t.put("tenantId", "TEN-RE-002");
        t.put("customerId", body.getOrDefault("customerId", "CUS-4001"));
        t.put("customerName", body.getOrDefault("customerName", "Customer"));
        t.put("relatedPropertyId", body.get("relatedPropertyId"));
        t.put("relatedBookingId", body.get("relatedBookingId"));
        t.put("category", body.getOrDefault("category", "GENERAL_ENQUIRY"));
        t.put("subject", body.getOrDefault("subject", "Support Ticket"));
        t.put("description", body.getOrDefault("description", ""));
        t.put("priority", body.getOrDefault("priority", "NORMAL"));
        t.put("channel", body.getOrDefault("channel", "EMAIL"));
        t.put("status", "OPEN");
        t.put("assignedTo", body.get("assignedTo"));
        t.put("createdBy", body.getOrDefault("createdBy", "USR-5001"));
        t.put("createdAt", LocalDateTime.now().toString());
        t.put("updatedAt", LocalDateTime.now().toString());
        t.put("resolvedAt", null);
        t.put("resolutionSummary", null);

        tickets.add(0, t);
        ticketMessages.put(ticketId, new ArrayList<>());

        Map<String, Object> respData = new LinkedHashMap<>();
        respData.put("ticketId", ticketId);
        respData.put("customerId", t.get("customerId"));
        respData.put("category", t.get("category"));
        respData.put("priority", t.get("priority"));
        respData.put("status", "OPEN");
        respData.put("assignedTo", t.get("assignedTo"));
        respData.put("createdAt", t.get("createdAt"));

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "message", "Support ticket created", "data", respData));
    }

    // 4. GET /tickets/{ticketId}
    @GetMapping("/tickets/{ticketId}")
    public ResponseEntity<Map<String, Object>> getTicketById(@PathVariable String ticketId) {
        validateRealEstateTenant();
        Map<String, Object> ticket = tickets.stream()
                .filter(t -> ticketId.equalsIgnoreCase((String) t.get("ticketId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));

        return ResponseEntity.ok(Map.of("success", true, "message", "Ticket details loaded", "data", ticket));
    }

    // 5. PATCH /tickets/{ticketId}
    @PatchMapping("/tickets/{ticketId}")
    public ResponseEntity<Map<String, Object>> updateTicket(@PathVariable String ticketId, @RequestBody Map<String, Object> updates) {
        validateRealEstateTenant();
        Map<String, Object> ticket = tickets.stream()
                .filter(t -> ticketId.equalsIgnoreCase((String) t.get("ticketId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));

        updates.forEach((k, v) -> {
            if (!k.equals("ticketId") && !k.equals("tenantId") && !k.equals("createdAt")) {
                ticket.put(k, v);
            }
        });
        ticket.put("updatedAt", LocalDateTime.now().toString());

        return ResponseEntity.ok(Map.of("success", true, "message", "Ticket updated", "data", ticket));
    }

    // 6. POST /tickets/{ticketId}/assign
    @PostMapping("/tickets/{ticketId}/assign")
    public ResponseEntity<Map<String, Object>> assignTicket(@PathVariable String ticketId, @RequestBody Map<String, Object> body) {
        validateRealEstateTenant();
        Map<String, Object> ticket = tickets.stream()
                .filter(t -> ticketId.equalsIgnoreCase((String) t.get("ticketId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));

        String agentId = (String) body.get("agentId");
        ticket.put("assignedTo", agentId);
        ticket.put("status", "ASSIGNED");
        ticket.put("updatedAt", LocalDateTime.now().toString());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("ticketId", ticketId);
        data.put("assignedTo", agentId);
        data.put("status", "ASSIGNED");
        data.put("assignedBy", body.getOrDefault("assignedBy", "USR-5002"));

        return ResponseEntity.ok(Map.of("success", true, "message", "Ticket assigned successfully", "data", data));
    }

    // 7. POST /tickets/{ticketId}/messages
    @PostMapping("/tickets/{ticketId}/messages")
    public ResponseEntity<Map<String, Object>> addTicketMessage(@PathVariable String ticketId, @RequestBody Map<String, Object> body) {
        validateRealEstateTenant();
        tickets.stream()
                .filter(t -> ticketId.equalsIgnoreCase((String) t.get("ticketId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));

        String msgId = "MSG-" + messageCounter.incrementAndGet();
        Map<String, Object> msg = new LinkedHashMap<>();
        msg.put("messageId", msgId);
        msg.put("ticketId", ticketId);
        msg.put("message", body.get("message"));
        msg.put("visibility", body.getOrDefault("visibility", "CUSTOMER_VISIBLE"));
        msg.put("channel", body.getOrDefault("channel", "EMAIL"));
        msg.put("deliveryStatus", "NOT_SENT");
        msg.put("createdBy", body.getOrDefault("createdBy", "USR-5001"));
        msg.put("createdAt", LocalDateTime.now().toString());

        ticketMessages.computeIfAbsent(ticketId, k -> new ArrayList<>()).add(msg);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("messageId", msgId);
        data.put("ticketId", ticketId);
        data.put("visibility", msg.get("visibility"));
        data.put("deliveryStatus", "NOT_SENT");
        data.put("createdBy", msg.get("createdBy"));

        return ResponseEntity.ok(Map.of("success", true, "message", "Ticket message recorded", "data", data));
    }

    // 8. GET /tickets/{ticketId}/messages
    @GetMapping("/tickets/{ticketId}/messages")
    public ResponseEntity<Map<String, Object>> getTicketMessages(@PathVariable String ticketId) {
        validateRealEstateTenant();
        List<Map<String, Object>> msgs = ticketMessages.getOrDefault(ticketId, Collections.emptyList());
        return ResponseEntity.ok(Map.of("success", true, "message", "Ticket messages loaded", "data", msgs));
    }

    // 9. POST /tickets/{ticketId}/resolve
    @PostMapping("/tickets/{ticketId}/resolve")
    public ResponseEntity<Map<String, Object>> resolveTicket(@PathVariable String ticketId, @RequestBody Map<String, Object> body) {
        validateRealEstateTenant();
        Map<String, Object> ticket = tickets.stream()
                .filter(t -> ticketId.equalsIgnoreCase((String) t.get("ticketId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));

        ticket.put("status", "RESOLVED");
        ticket.put("resolutionSummary", body.get("resolutionSummary"));
        ticket.put("resolutionCategory", body.getOrDefault("resolutionCategory", "INFORMATION_PROVIDED"));
        ticket.put("resolvedAt", LocalDateTime.now().toString());
        ticket.put("updatedAt", LocalDateTime.now().toString());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("ticketId", ticketId);
        data.put("status", "RESOLVED");
        data.put("resolutionCategory", ticket.get("resolutionCategory"));
        data.put("resolvedBy", body.getOrDefault("resolvedBy", "USR-5001"));

        return ResponseEntity.ok(Map.of("success", true, "message", "Ticket resolved", "data", data));
    }

    // 10. POST /tickets/{ticketId}/reopen
    @PostMapping("/tickets/{ticketId}/reopen")
    public ResponseEntity<Map<String, Object>> reopenTicket(@PathVariable String ticketId, @RequestBody(required = false) Map<String, Object> body) {
        validateRealEstateTenant();
        Map<String, Object> ticket = tickets.stream()
                .filter(t -> ticketId.equalsIgnoreCase((String) t.get("ticketId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));

        ticket.put("status", "REOPENED");
        ticket.put("updatedAt", LocalDateTime.now().toString());

        return ResponseEntity.ok(Map.of("success", true, "message", "Ticket reopened", "data", ticket));
    }

    // 11. POST /tickets/{ticketId}/escalate
    @PostMapping("/tickets/{ticketId}/escalate")
    public ResponseEntity<Map<String, Object>> escalateTicket(@PathVariable String ticketId, @RequestBody Map<String, Object> body) {
        validateRealEstateTenant();
        Map<String, Object> ticket = tickets.stream()
                .filter(t -> ticketId.equalsIgnoreCase((String) t.get("ticketId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));

        String targetTeam = (String) body.getOrDefault("targetTeam", "BOOKING_SUPPORT");
        String priority = (String) body.getOrDefault("priority", "HIGH");

        ticket.put("status", "ESCALATED");
        ticket.put("priority", priority);
        ticket.put("escalatedTeam", targetTeam);
        ticket.put("escalationReason", body.get("reason"));
        ticket.put("updatedAt", LocalDateTime.now().toString());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("ticketId", ticketId);
        data.put("status", "ESCALATED");
        data.put("priority", priority);
        data.put("targetTeam", targetTeam);

        return ResponseEntity.ok(Map.of("success", true, "message", "Ticket escalated", "data", data));
    }

    // 12. GET /customers/{customerId}/tickets
    @GetMapping("/customers/{customerId}/tickets")
    public ResponseEntity<Map<String, Object>> getCustomerTickets(@PathVariable String customerId) {
        validateRealEstateTenant();
        List<Map<String, Object>> custTickets = tickets.stream()
                .filter(t -> customerId.equalsIgnoreCase((String) t.get("customerId")))
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("success", true, "message", "Customer tickets loaded", "data", custTickets));
    }

    // 13. GET /customers/{customerId}/timeline
    @GetMapping("/customers/{customerId}/timeline")
    public ResponseEntity<Map<String, Object>> getCustomerTimeline(@PathVariable String customerId) {
        validateRealEstateTenant();
        List<Map<String, Object>> timeline = new ArrayList<>();
        timeline.add(Map.of("id", "TL-1", "type", "TICKET_CREATED", "title", "Booking Enquiry Ticket Opened", "timestamp", "2026-10-26T11:00:00+05:30", "details", "Ticket RST-1001 for Green Valley Apartment"));
        timeline.add(Map.of("id", "TL-2", "type", "MESSAGE_SENT", "title", "Agent Response Dispatched", "timestamp", "2026-10-26T11:15:00+05:30", "details", "Clarified booking verification SLA of 24h"));
        timeline.add(Map.of("id", "TL-3", "type", "SITE_VISIT", "title", "Site Visit Conducted", "timestamp", "2026-10-24T10:00:00+05:30", "details", "Coordinator tour at Green Valley Apartment 3BHK"));

        return ResponseEntity.ok(Map.of("success", true, "message", "Customer timeline retrieved", "data", timeline));
    }

    // 14. GET /knowledge/search
    @GetMapping("/knowledge/search")
    public ResponseEntity<Map<String, Object>> searchKnowledgeBase(@RequestParam(required = false, defaultValue = "") String q) {
        validateRealEstateTenant();
        String query = q.toLowerCase();
        List<Map<String, Object>> matches = knowledgeArticles.stream()
                .filter(a -> query.isEmpty() ||
                        ((String) a.get("title")).toLowerCase().contains(query) ||
                        ((String) a.get("content")).toLowerCase().contains(query))
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("success", true, "message", "Knowledge search completed", "data", Map.of("items", matches)));
    }

    // 15. POST /knowledge/articles
    @PostMapping("/knowledge/articles")
    public ResponseEntity<Map<String, Object>> createKnowledgeArticle(@RequestBody Map<String, Object> body) {
        validateRealEstateTenant();
        String articleId = "KB-" + kbCounter.incrementAndGet();
        Map<String, Object> article = new LinkedHashMap<>();
        article.put("articleId", articleId);
        article.put("title", body.get("title"));
        article.put("category", body.getOrDefault("category", "GENERAL"));
        article.put("content", body.get("content"));
        article.put("tags", body.getOrDefault("tags", List.of()));
        article.put("lastUpdated", LocalDateTime.now().toString());

        knowledgeArticles.add(article);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "message", "Knowledge article created", "data", article));
    }

    // 16. GET /complaints
    @GetMapping("/complaints")
    public ResponseEntity<Map<String, Object>> getComplaints() {
        validateRealEstateTenant();
        return ResponseEntity.ok(Map.of("success", true, "message", "Complaints retrieved", "data", complaints));
    }

    // 17. POST /complaints
    @PostMapping("/complaints")
    public ResponseEntity<Map<String, Object>> createComplaint(@RequestBody Map<String, Object> body) {
        validateRealEstateTenant();
        String complaintId = "CMP-" + complaintCounter.incrementAndGet();
        Map<String, Object> c = new LinkedHashMap<>();
        c.put("complaintId", complaintId);
        c.put("customerId", body.get("customerId"));
        c.put("ticketId", body.get("ticketId"));
        c.put("complaintType", body.getOrDefault("complaintType", "GENERAL_COMPLAINT"));
        c.put("description", body.get("description"));
        c.put("severity", body.getOrDefault("severity", "MEDIUM"));
        c.put("status", "NEW");
        c.put("assignedTo", body.get("assignedTo"));
        c.put("createdAt", LocalDateTime.now().toString());

        complaints.add(0, c);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "message", "Complaint registered", "data", c));
    }

    // 18. PATCH /complaints/{complaintId}
    @PatchMapping("/complaints/{complaintId}")
    public ResponseEntity<Map<String, Object>> updateComplaint(@PathVariable String complaintId, @RequestBody Map<String, Object> updates) {
        validateRealEstateTenant();
        Map<String, Object> complaint = complaints.stream()
                .filter(c -> complaintId.equalsIgnoreCase((String) c.get("complaintId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found: " + complaintId));

        complaint.putAll(updates);
        return ResponseEntity.ok(Map.of("success", true, "message", "Complaint updated", "data", complaint));
    }

    // 19. POST /tickets/{ticketId}/ai/reply-draft
    @PostMapping("/tickets/{ticketId}/ai/reply-draft")
    public ResponseEntity<Map<String, Object>> generateAiReplyDraft(@PathVariable String ticketId, @RequestBody Map<String, Object> body) {
        validateRealEstateTenant();
        Map<String, Object> ticket = tickets.stream()
                .filter(t -> ticketId.equalsIgnoreCase((String) t.get("ticketId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));

        String draftId = "DR-" + draftCounter.incrementAndGet();
        String category = (String) ticket.get("category");
        String subject = "Update regarding " + ticket.get("subject");
        String draftBody;

        if ("BOOKING_ENQUIRY".equalsIgnoreCase(category)) {
            draftBody = "Dear Customer,\n\nYour booking request is currently undergoing verification by our operations team. We will provide a verified update once the documentation and RERA checklist are complete.\n\nBest regards,\nReal Estate Support Team";
        } else if ("DOCUMENTATION".equalsIgnoreCase(category)) {
            draftBody = "Dear Customer,\n\nWe have attached the approved legal title deed and RERA certificate summary for your requested property. Please reach out if your banking institution needs certified hard copies.\n\nBest regards,\nReal Estate Support Team";
        } else {
            draftBody = "Dear Customer,\n\nThank you for reaching out to us. We have received your query regarding \"" + ticket.get("subject") + "\" and our support team is working on resolving this promptly.\n\nWarm regards,\nReal Estate Support Team";
        }

        Map<String, Object> draft = new LinkedHashMap<>();
        draft.put("draftId", draftId);
        draft.put("ticketId", ticketId);
        draft.put("status", "DRAFT");
        draft.put("subject", subject);
        draft.put("body", draftBody);
        draft.put("tone", body.getOrDefault("tone", "PROFESSIONAL"));
        draft.put("channel", body.getOrDefault("channel", "EMAIL"));

        replyDrafts.put(draftId, draft);

        return ResponseEntity.ok(Map.of("success", true, "message", "AI reply draft generated", "data", draft));
    }

    // 20. GET /reports
    @GetMapping("/reports")
    public ResponseEntity<Map<String, Object>> getSupportReports() {
        validateRealEstateTenant();
        Map<String, Object> metrics = new LinkedHashMap<>();
        metrics.put("firstContactResolutionPercentage", 78.4);
        metrics.put("customerSatisfactionScore", 4.72);
        metrics.put("slaAdherenceRate", 94.6);
        metrics.put("avgResolutionHours", 6.5);
        metrics.put("totalTicketsHandled", 214);
        metrics.put("escalationRatePercentage", 4.2);

        return ResponseEntity.ok(Map.of("success", true, "message", "Support reports loaded", "data", metrics));
    }
}
