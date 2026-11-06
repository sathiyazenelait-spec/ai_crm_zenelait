package com.zenelait.crm.ecommerce;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Zenelait AI CRM — E-commerce Company Tenant
 * Customer Support Manager V1 Controller
 * Base Path: /api/v1/ecommerce/customer-support-manager
 * Implements 30 REST API endpoints specified in Section 3.2.
 */
@RestController
@RequestMapping("/api/v1/ecommerce/customer-support-manager")
@CrossOrigin(origins = "*")
public class EcommerceCustomerSupportManagerV1Controller {

    private final EcommerceDataStore store;

    public EcommerceCustomerSupportManagerV1Controller(EcommerceDataStore store) {
        this.store = store;
    }

    private <T> ResponseEntity<Map<String, Object>> buildResponse(boolean success, String message, T data, HttpStatus status, String requestId) {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", success);
        resp.put("message", message);
        if (data != null) {
            resp.put("data", data);
        }
        resp.put("timestamp", "2026-10-28T11:00:00+05:30");
        resp.put("requestId", requestId != null ? requestId : "req_csm_" + UUID.randomUUID().toString().substring(0, 8));
        return ResponseEntity.status(status).body(resp);
    }

    // 1. GET /dashboard
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        long openTickets = store.getSupportTickets().values().stream()
                .filter(t -> !"CLOSED".equals(t.get("status")) && !"RESOLVED".equals(t.get("status")))
                .count();

        long unassigned = store.getSupportTickets().values().stream()
                .filter(t -> t.get("assignedAgentId") == null)
                .count();

        long openEscalations = store.getSupportEscalations().values().stream()
                .filter(e -> "OPEN".equals(e.get("status")))
                .count();

        long activeAgents = store.getSupportAgents().values().stream()
                .filter(a -> "ACTIVE".equals(a.get("status")))
                .count();

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("openTickets", openTickets > 0 ? openTickets : 240);
        data.put("unassignedTickets", unassigned > 0 ? unassigned : 18);
        data.put("ticketsAwaitingCustomer", 45);
        data.put("ticketsAwaitingInternalTeam", 22);
        data.put("openEscalations", openEscalations > 0 ? openEscalations : 12);
        data.put("activeAgents", activeAgents > 0 ? activeAgents : 15);
        data.put("averageFirstResponseMinutes", 12.5);
        data.put("averageResolutionHours", 8.4);
        data.put("customerSatisfactionScore", 4.4);
        data.put("aiDraftsAwaitingReview", 9);

        return buildResponse(true, "Customer support dashboard retrieved", data, HttpStatus.OK, "req_support_manager_dashboard_001");
    }

    // 2. GET /agents
    @GetMapping("/agents")
    public ResponseEntity<?> listAgents(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        List<Map<String, Object>> list = new ArrayList<>(store.getSupportAgents().values());
        if (status != null && !status.isEmpty()) {
            list = list.stream().filter(a -> status.equalsIgnoreCase(String.valueOf(a.get("status")))).collect(Collectors.toList());
        }

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", list);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", list.size());
        data.put("totalPages", 1);

        return buildResponse(true, "Support agents retrieved", data, HttpStatus.OK, "req_support_agents_001");
    }

    // 3. POST /agents
    @PostMapping("/agents")
    public ResponseEntity<?> inviteAgent(@RequestBody Map<String, Object> body) {
        String agentId = "usr_support_" + (store.getSupportAgents().size() + 101);
        String name = String.valueOf(body.getOrDefault("name", "New Agent"));
        String email = String.valueOf(body.getOrDefault("email", "agent@shop.example"));

        Map<String, Object> agent = new LinkedHashMap<>(body);
        agent.put("agentId", agentId);
        agent.put("name", name);
        agent.put("email", email);
        agent.put("role", "SUPPORT_AGENT");
        agent.put("status", "INVITATION_PENDING");
        agent.put("assignedOpenTickets", 0);
        agent.put("resolvedTicketsThisMonth", 0);
        agent.put("createdAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

        store.getSupportAgents().put(agentId, agent);
        store.recordAuditEvent("SUPPORT_AGENT_INVITED", "SUPPORT_MANAGER", agentId, "Invited support agent: " + email);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("agentId", agentId);
        data.put("name", name);
        data.put("email", email);
        data.put("role", "SUPPORT_AGENT");
        data.put("status", "INVITATION_PENDING");
        data.put("assignedQueues", body.get("queueIds"));

        return buildResponse(true, "Support agent invitation created", data, HttpStatus.CREATED, "req_support_agent_create_001");
    }

    // 4. GET /agents/{agentId}
    @GetMapping("/agents/{agentId}")
    public ResponseEntity<?> getAgent(@PathVariable String agentId) {
        Map<String, Object> agent = store.getSupportAgents().get(agentId);
        if (agent == null) {
            return buildResponse(false, "Agent not found: " + agentId, null, HttpStatus.NOT_FOUND, "req_agent_not_found");
        }
        return buildResponse(true, "Agent details retrieved", agent, HttpStatus.OK, "req_agent_detail_001");
    }

    // 5. PATCH /agents/{agentId}
    @PatchMapping("/agents/{agentId}")
    public ResponseEntity<?> updateAgent(@PathVariable String agentId, @RequestBody Map<String, Object> body) {
        Map<String, Object> agent = store.getSupportAgents().get(agentId);
        if (agent == null) {
            return buildResponse(false, "Agent not found: " + agentId, null, HttpStatus.NOT_FOUND, "req_agent_not_found");
        }
        agent.putAll(body);
        store.recordAuditEvent("SUPPORT_AGENT_UPDATED", "SUPPORT_MANAGER", agentId, "Updated agent settings");

        return buildResponse(true, "Agent updated successfully", agent, HttpStatus.OK, "req_agent_update_001");
    }

    // 6. PATCH /agents/{agentId}/status
    @PatchMapping("/agents/{agentId}/status")
    public ResponseEntity<?> updateAgentStatus(@PathVariable String agentId, @RequestBody Map<String, Object> body) {
        Map<String, Object> agent = store.getSupportAgents().get(agentId);
        if (agent == null) {
            return buildResponse(false, "Agent not found: " + agentId, null, HttpStatus.NOT_FOUND, "req_agent_not_found");
        }
        String status = String.valueOf(body.get("status"));
        agent.put("status", status);
        store.recordAuditEvent("SUPPORT_AGENT_STATUS_CHANGED", "SUPPORT_MANAGER", agentId, "Changed status to: " + status);

        return buildResponse(true, "Agent status updated", agent, HttpStatus.OK, "req_agent_status_001");
    }

    // 7. GET /tickets
    @GetMapping("/tickets")
    public ResponseEntity<?> listTickets(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        List<Map<String, Object>> list = new ArrayList<>(store.getSupportTickets().values());
        if (status != null && !status.isEmpty()) {
            list = list.stream().filter(t -> status.equalsIgnoreCase(String.valueOf(t.get("status")))).collect(Collectors.toList());
        }
        if (priority != null && !priority.isEmpty()) {
            list = list.stream().filter(t -> priority.equalsIgnoreCase(String.valueOf(t.get("priority")))).collect(Collectors.toList());
        }

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", list);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", list.size());
        data.put("totalPages", 1);

        return buildResponse(true, "Support tickets retrieved", data, HttpStatus.OK, "req_support_tickets_001");
    }

    // 8. GET /tickets/{ticketId}
    @GetMapping("/tickets/{ticketId}")
    public ResponseEntity<?> getTicket(@PathVariable String ticketId) {
        Map<String, Object> ticket = store.getSupportTickets().get(ticketId);
        if (ticket == null) {
            return buildResponse(false, "Ticket not found: " + ticketId, null, HttpStatus.NOT_FOUND, "req_ticket_not_found");
        }
        Map<String, Object> detail = new LinkedHashMap<>(ticket);
        detail.put("messages", store.getTicketMessages().getOrDefault(ticketId, Collections.emptyList()));
        detail.put("internalNotes", store.getTicketNotes().getOrDefault(ticketId, Collections.emptyList()));

        return buildResponse(true, "Ticket details retrieved", detail, HttpStatus.OK, "req_ticket_detail_001");
    }

    // 9. PATCH /tickets/{ticketId}/assign
    @PatchMapping("/tickets/{ticketId}/assign")
    public ResponseEntity<?> assignTicket(@PathVariable String ticketId, @RequestBody Map<String, Object> body) {
        Map<String, Object> ticket = store.getSupportTickets().get(ticketId);
        if (ticket == null) {
            return buildResponse(false, "Ticket not found: " + ticketId, null, HttpStatus.NOT_FOUND, "req_assign_err");
        }
        String newAgentId = String.valueOf(body.get("assignedAgentId"));
        String prev = String.valueOf(ticket.get("assignedAgentId"));

        ticket.put("previousAssigneeId", prev);
        ticket.put("assignedAgentId", newAgentId);
        ticket.put("assignedAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        ticket.put("assignmentReason", body.get("reason"));

        store.recordAuditEvent("TICKET_REASSIGNED", "SUPPORT_MANAGER", ticketId, "Assigned from " + prev + " to " + newAgentId);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("ticketId", ticketId);
        data.put("previousAssigneeId", prev);
        data.put("assignedAgentId", newAgentId);
        data.put("status", ticket.get("status"));
        data.put("assignedAt", "2026-10-28T11:12:00+05:30");

        return buildResponse(true, "Ticket assigned successfully", data, HttpStatus.OK, "req_support_assign_001");
    }

    // 10. PATCH /tickets/{ticketId}/priority
    @PatchMapping("/tickets/{ticketId}/priority")
    public ResponseEntity<?> changePriority(@PathVariable String ticketId, @RequestBody Map<String, Object> body) {
        Map<String, Object> ticket = store.getSupportTickets().get(ticketId);
        if (ticket == null) {
            return buildResponse(false, "Ticket not found: " + ticketId, null, HttpStatus.NOT_FOUND, "req_prio_err");
        }
        String priority = String.valueOf(body.get("priority"));
        ticket.put("priority", priority);
        ticket.put("priorityChangeReason", body.get("reason"));
        store.recordAuditEvent("TICKET_PRIORITY_CHANGED", "SUPPORT_MANAGER", ticketId, "Updated priority to " + priority);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("ticketId", ticketId);
        data.put("priority", priority);
        data.put("updatedBy", "usr_support_manager_100");
        data.put("updatedAt", "2026-10-28T11:15:00+05:30");

        return buildResponse(true, "Ticket priority updated", data, HttpStatus.OK, "req_support_priority_001");
    }

    // 11. PATCH /tickets/{ticketId}/status
    @PatchMapping("/tickets/{ticketId}/status")
    public ResponseEntity<?> changeStatus(@PathVariable String ticketId, @RequestBody Map<String, Object> body) {
        Map<String, Object> ticket = store.getSupportTickets().get(ticketId);
        if (ticket == null) {
            return buildResponse(false, "Ticket not found: " + ticketId, null, HttpStatus.NOT_FOUND, "req_status_err");
        }
        String status = String.valueOf(body.get("status"));
        ticket.put("status", status);
        store.recordAuditEvent("TICKET_STATUS_CHANGED", "SUPPORT_MANAGER", ticketId, "Updated ticket status to " + status);

        return buildResponse(true, "Ticket status updated", ticket, HttpStatus.OK, "req_ticket_status_001");
    }

    // 12. GET /queues
    @GetMapping("/queues")
    public ResponseEntity<?> listQueues() {
        List<Map<String, Object>> queues = new ArrayList<>(store.getSupportQueues().values());
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", queues);
        data.put("totalElements", queues.size());

        return buildResponse(true, "Support queues retrieved", data, HttpStatus.OK, "req_queues_001");
    }

    // 13. POST /queues
    @PostMapping("/queues")
    public ResponseEntity<?> createQueue(@RequestBody Map<String, Object> body) {
        String queueId = "queue_" + UUID.randomUUID().toString().substring(0, 8);
        Map<String, Object> queue = new LinkedHashMap<>(body);
        queue.put("queueId", queueId);
        queue.put("status", "ACTIVE");
        queue.put("ticketCount", 0);

        store.getSupportQueues().put(queueId, queue);
        store.recordAuditEvent("SUPPORT_QUEUE_CREATED", "SUPPORT_MANAGER", queueId, "Created queue: " + queue.get("name"));

        return buildResponse(true, "Support queue created", queue, HttpStatus.CREATED, "req_queue_create_001");
    }

    // 14. PATCH /queues/{queueId}
    @PatchMapping("/queues/{queueId}")
    public ResponseEntity<?> updateQueue(@PathVariable String queueId, @RequestBody Map<String, Object> body) {
        Map<String, Object> queue = store.getSupportQueues().get(queueId);
        if (queue == null) {
            return buildResponse(false, "Queue not found: " + queueId, null, HttpStatus.NOT_FOUND, "req_queue_not_found");
        }
        queue.putAll(body);
        store.recordAuditEvent("SUPPORT_QUEUE_UPDATED", "SUPPORT_MANAGER", queueId, "Updated queue parameters");

        return buildResponse(true, "Support queue updated", queue, HttpStatus.OK, "req_queue_update_001");
    }

    // 15. GET /escalations
    @GetMapping("/escalations")
    public ResponseEntity<?> listEscalations(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        List<Map<String, Object>> list = new ArrayList<>(store.getSupportEscalations().values());
        if (status != null && !status.isEmpty()) {
            list = list.stream().filter(e -> status.equalsIgnoreCase(String.valueOf(e.get("status")))).collect(Collectors.toList());
        }

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", list);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", list.size());
        data.put("totalPages", 1);

        return buildResponse(true, "Escalations retrieved", data, HttpStatus.OK, "req_escalations_001");
    }

    // 16. POST /escalations
    @PostMapping("/escalations")
    public ResponseEntity<?> createEscalation(@RequestBody Map<String, Object> body) {
        String escalationId = "esc_" + (store.getSupportEscalations().size() + 1001);
        String ticketId = String.valueOf(body.get("ticketId"));
        String targetTeam = String.valueOf(body.getOrDefault("targetTeam", "ORDER_OPERATIONS"));
        String reason = String.valueOf(body.getOrDefault("reason", "Customer escalation"));
        String priority = String.valueOf(body.getOrDefault("priority", "HIGH"));

        Map<String, Object> esc = new LinkedHashMap<>();
        esc.put("escalationId", escalationId);
        esc.put("ticketId", ticketId);
        esc.put("targetTeam", targetTeam);
        esc.put("reason", reason);
        esc.put("priority", priority);
        esc.put("status", "OPEN");
        esc.put("createdAt", "2026-10-28T11:18:00+05:30");

        store.getSupportEscalations().put(escalationId, esc);
        store.recordAuditEvent("TICKET_ESCALATED", "SUPPORT_MANAGER", escalationId, "Escalated ticket " + ticketId + " to " + targetTeam);

        return buildResponse(true, "Ticket escalation created", esc, HttpStatus.CREATED, "req_support_escalation_001");
    }

    // 17. PATCH /escalations/{escalationId}
    @PatchMapping("/escalations/{escalationId}")
    public ResponseEntity<?> updateEscalation(@PathVariable String escalationId, @RequestBody Map<String, Object> body) {
        Map<String, Object> esc = store.getSupportEscalations().get(escalationId);
        if (esc == null) {
            return buildResponse(false, "Escalation not found: " + escalationId, null, HttpStatus.NOT_FOUND, "req_esc_not_found");
        }
        esc.putAll(body);
        store.recordAuditEvent("ESCALATION_UPDATED", "SUPPORT_MANAGER", escalationId, "Updated escalation status: " + esc.get("status"));

        return buildResponse(true, "Escalation updated", esc, HttpStatus.OK, "req_esc_update_001");
    }

    // 18. GET /ai-support/config
    @GetMapping("/ai-support/config")
    public ResponseEntity<?> getAiSupportConfig() {
        Map<String, Object> config = store.getAiSupportConfig().get("config");
        return buildResponse(true, "AI Support configuration retrieved", config, HttpStatus.OK, "req_ai_support_config_001");
    }

    // 19. PATCH /ai-support/config
    @PatchMapping("/ai-support/config")
    public ResponseEntity<?> updateAiSupportConfig(@RequestBody Map<String, Object> body) {
        Map<String, Object> config = store.getAiSupportConfig().get("config");
        if (config == null) {
            config = new LinkedHashMap<>();
            store.getAiSupportConfig().put("config", config);
        }
        config.putAll(body);
        store.recordAuditEvent("AI_SUPPORT_CONFIG_UPDATED", "SUPPORT_MANAGER", "ai_support_001", "Updated AI Support config");

        return buildResponse(true, "AI Support configuration updated", config, HttpStatus.OK, "req_ai_support_config_002");
    }

    // 20. GET /ai-support/quality
    @GetMapping("/ai-support/quality")
    public ResponseEntity<?> getAiQualityMetrics() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("totalDraftsGenerated", 460);
        data.put("draftsApprovedUnmodified", 345);
        data.put("draftsEditedByAgent", 95);
        data.put("draftsRejected", 20);
        data.put("acceptanceRate", 95.6);
        data.put("knowledgeReferenceAccuracy", 98.2);
        data.put("escalationHandoffAccuracy", 97.4);

        return buildResponse(true, "AI Support quality metrics retrieved", data, HttpStatus.OK, "req_ai_quality_001");
    }

    // 21. GET /knowledge/articles
    @GetMapping("/knowledge/articles")
    public ResponseEntity<?> listKnowledgeArticles(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status
    ) {
        List<Map<String, Object>> list = new ArrayList<>(store.getKnowledgeArticles().values());
        if (category != null && !category.isEmpty()) {
            list = list.stream().filter(a -> category.equalsIgnoreCase(String.valueOf(a.get("category")))).collect(Collectors.toList());
        }
        if (status != null && !status.isEmpty()) {
            list = list.stream().filter(a -> status.equalsIgnoreCase(String.valueOf(a.get("status")))).collect(Collectors.toList());
        }

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", list);
        data.put("totalElements", list.size());

        return buildResponse(true, "Knowledge articles retrieved", data, HttpStatus.OK, "req_kb_articles_001");
    }

    // 22. POST /knowledge/articles
    @PostMapping("/knowledge/articles")
    public ResponseEntity<?> createArticle(@RequestBody Map<String, Object> body) {
        String articleId = "kb_" + (store.getKnowledgeArticles().size() + 1001);
        String title = String.valueOf(body.get("title"));

        Map<String, Object> article = new LinkedHashMap<>(body);
        article.put("articleId", articleId);
        article.put("title", title);
        article.put("status", "DRAFT");
        article.put("version", 1);
        article.put("createdBy", "usr_support_manager_100");
        article.put("createdAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

        store.getKnowledgeArticles().put(articleId, article);
        store.recordAuditEvent("KNOWLEDGE_ARTICLE_CREATED", "SUPPORT_MANAGER", articleId, "Created article draft: " + title);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("articleId", articleId);
        data.put("title", title);
        data.put("status", "DRAFT");
        data.put("createdBy", "usr_support_manager_100");

        return buildResponse(true, "Knowledge article draft created", data, HttpStatus.CREATED, "req_knowledge_create_001");
    }

    // 23. PATCH /knowledge/articles/{articleId}
    @PatchMapping("/knowledge/articles/{articleId}")
    public ResponseEntity<?> updateArticle(@PathVariable String articleId, @RequestBody Map<String, Object> body) {
        Map<String, Object> article = store.getKnowledgeArticles().get(articleId);
        if (article == null) {
            return buildResponse(false, "Article not found: " + articleId, null, HttpStatus.NOT_FOUND, "req_kb_not_found");
        }
        article.putAll(body);
        store.recordAuditEvent("KNOWLEDGE_ARTICLE_UPDATED", "SUPPORT_MANAGER", articleId, "Updated article content");

        return buildResponse(true, "Knowledge article updated", article, HttpStatus.OK, "req_kb_update_001");
    }

    // 24. POST /knowledge/articles/{articleId}/publish
    @PostMapping("/knowledge/articles/{articleId}/publish")
    public ResponseEntity<?> publishArticle(@PathVariable String articleId, @RequestBody(required = false) Map<String, Object> body) {
        Map<String, Object> article = store.getKnowledgeArticles().get(articleId);
        if (article == null) {
            return buildResponse(false, "Article not found: " + articleId, null, HttpStatus.NOT_FOUND, "req_kb_not_found");
        }
        article.put("status", "PUBLISHED");
        article.put("publishedAt", "2026-10-28T11:30:00+05:30");
        if (body != null && body.containsKey("approvalComment")) {
            article.put("approvalComment", body.get("approvalComment"));
        }
        store.recordAuditEvent("KNOWLEDGE_ARTICLE_PUBLISHED", "SUPPORT_MANAGER", articleId, "Published knowledge article: " + article.get("title"));

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("articleId", articleId);
        data.put("status", "PUBLISHED");
        data.put("publishedAt", "2026-10-28T11:30:00+05:30");

        return buildResponse(true, "Knowledge article published", data, HttpStatus.OK, "req_knowledge_publish_001");
    }

    // 25. GET /follow-up-rules
    @GetMapping("/follow-up-rules")
    public ResponseEntity<?> listFollowUpRules() {
        List<Map<String, Object>> rules = new ArrayList<>(store.getFollowUpRules().values());
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", rules);
        data.put("totalElements", rules.size());

        return buildResponse(true, "Follow-up rules retrieved", data, HttpStatus.OK, "req_fu_rules_001");
    }

    // 26. POST /follow-up-rules
    @PostMapping("/follow-up-rules")
    public ResponseEntity<?> createFollowUpRule(@RequestBody Map<String, Object> body) {
        String ruleId = "rule_" + UUID.randomUUID().toString().substring(0, 8);
        Map<String, Object> rule = new LinkedHashMap<>(body);
        rule.put("ruleId", ruleId);
        rule.put("status", "ACTIVE");

        store.getFollowUpRules().put(ruleId, rule);
        store.recordAuditEvent("FOLLOWUP_RULE_CREATED", "SUPPORT_MANAGER", ruleId, "Created rule: " + rule.get("name"));

        return buildResponse(true, "Follow-up rule created", rule, HttpStatus.CREATED, "req_fu_rule_create_001");
    }

    // 27. PATCH /follow-up-rules/{ruleId}
    @PatchMapping("/follow-up-rules/{ruleId}")
    public ResponseEntity<?> updateFollowUpRule(@PathVariable String ruleId, @RequestBody Map<String, Object> body) {
        Map<String, Object> rule = store.getFollowUpRules().get(ruleId);
        if (rule == null) {
            return buildResponse(false, "Rule not found: " + ruleId, null, HttpStatus.NOT_FOUND, "req_rule_not_found");
        }
        rule.putAll(body);
        store.recordAuditEvent("FOLLOWUP_RULE_UPDATED", "SUPPORT_MANAGER", ruleId, "Updated follow-up rule");

        return buildResponse(true, "Follow-up rule updated", rule, HttpStatus.OK, "req_fu_rule_update_001");
    }

    // 28. GET /metrics
    @GetMapping("/metrics")
    public ResponseEntity<?> getMetrics(
            @RequestParam(defaultValue = "2026-10-01") String from,
            @RequestParam(defaultValue = "2026-10-28") String to
    ) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("periodFrom", from);
        data.put("periodTo", to);
        data.put("ticketsCreated", 1250);
        data.put("ticketsResolved", 1100);
        data.put("averageFirstResponseMinutes", 12.5);
        data.put("averageResolutionHours", 8.4);
        data.put("slaBreaches", 22);
        data.put("escalationCount", 75);
        data.put("aiAssistedTickets", 460);
        data.put("customerSatisfactionScore", 4.4);

        return buildResponse(true, "Support metrics retrieved", data, HttpStatus.OK, "req_support_metrics_001");
    }

    // 29. GET /customer-satisfaction
    @GetMapping("/customer-satisfaction")
    public ResponseEntity<?> getCustomerSatisfaction() {
        Map<String, Object> csat = new LinkedHashMap<>();
        csat.put("overallScore", 4.4);
        csat.put("totalRatings", 820);
        csat.put("fiveStarPercent", 68.5);
        csat.put("fourStarPercent", 21.0);
        csat.put("threeStarPercent", 6.5);
        csat.put("twoStarPercent", 2.5);
        csat.put("oneStarPercent", 1.5);

        List<Map<String, Object>> recentFeedback = new ArrayList<>();
        recentFeedback.add(EcommerceDataStore.createMap("ticketId", "ticket_1001", "rating", 5, "comment", "Agent resolved the delivery delay promptly!"));
        recentFeedback.add(EcommerceDataStore.createMap("ticketId", "ticket_2001", "rating", 4, "comment", "Accurate tracking info provided without delay."));

        csat.put("recentFeedback", recentFeedback);

        return buildResponse(true, "Customer satisfaction results retrieved", csat, HttpStatus.OK, "req_csat_001");
    }

    // 30. GET /audit-events
    @GetMapping("/audit-events")
    public ResponseEntity<?> getAuditEvents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        List<Map<String, Object>> list = store.getAuditEvents();
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", list);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", list.size());
        data.put("totalPages", 1);

        return buildResponse(true, "Authorized audit events retrieved", data, HttpStatus.OK, "req_csm_audit_001");
    }
}
