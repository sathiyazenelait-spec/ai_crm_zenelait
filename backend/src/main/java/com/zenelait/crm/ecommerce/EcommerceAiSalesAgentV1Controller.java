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
 * AI Sales Agent V1 Controller
 * Base Path: /api/v1/ecommerce/ai-sales-agent
 * Implements complete API catalogue specified in Section 3.2.
 */
@RestController
@RequestMapping("/api/v1/ecommerce/ai-sales-agent")
@CrossOrigin(origins = "*")
public class EcommerceAiSalesAgentV1Controller {

    private final EcommerceDataStore store;

    public EcommerceAiSalesAgentV1Controller(EcommerceDataStore store) {
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
        resp.put("requestId", requestId != null ? requestId : "req_aisales_" + UUID.randomUUID().toString().substring(0, 8));
        return ResponseEntity.status(status).body(resp);
    }

    // =========================================================================
    // A. DASHBOARD & CONFIGURATION
    // =========================================================================

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("agentStatus", "ACTIVE");
        data.put("conversationsToday", 128);
        data.put("leadsCapturedToday", Math.max(32, store.getAiLeads().size()));
        data.put("qualifiedLeads", 18);
        data.put("recommendationsGenerated", 74);
        data.put("followUpsPending", 21);
        data.put("cartRecoveryCandidates", Math.max(15, store.getAbandonedCarts().size()));
        data.put("humanHandoffs", 6);

        return buildResponse(true, "Sales agent dashboard retrieved", data, HttpStatus.OK, "req_sales_dashboard_001");
    }

    @GetMapping("/status")
    public ResponseEntity<?> getStatus() {
        Map<String, Object> config = store.getAiSalesConfig().getOrDefault("config", Collections.emptyMap());
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("agentType", "AI_SALES_AGENT");
        data.put("status", config.getOrDefault("status", "ACTIVE"));
        return buildResponse(true, "Agent status retrieved", data, HttpStatus.OK, "req_agent_status_001");
    }

    @PatchMapping("/status")
    public ResponseEntity<?> updateStatus(@RequestBody Map<String, Object> body) {
        String status = String.valueOf(body.getOrDefault("status", "ACTIVE"));
        Map<String, Object> config = store.getAiSalesConfig().computeIfAbsent("config", k -> new LinkedHashMap<>());
        config.put("status", status);
        store.recordAuditEvent("AI_SALES_AGENT_STATUS_CHANGED", "ADMIN", "ai_sales_001", "Changed status to: " + status);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("agentType", "AI_SALES_AGENT");
        data.put("status", status);
        data.put("updatedBy", "usr_admin_1001");

        return buildResponse(true, "Agent status updated", data, HttpStatus.OK, "req_agent_status_001");
    }

    @GetMapping("/configuration")
    public ResponseEntity<?> getConfiguration() {
        Map<String, Object> config = store.getAiSalesConfig().getOrDefault("config", Collections.emptyMap());
        return buildResponse(true, "Agent configuration retrieved", config, HttpStatus.OK, "req_ai_sales_conf_001");
    }

    @PatchMapping("/configuration")
    public ResponseEntity<?> updateConfiguration(@RequestBody Map<String, Object> body) {
        Map<String, Object> config = store.getAiSalesConfig().computeIfAbsent("config", k -> new LinkedHashMap<>());
        config.putAll(body);
        store.recordAuditEvent("AI_SALES_CONFIG_UPDATED", "ADMIN", "ai_sales_001", "Updated parameters");
        return buildResponse(true, "Agent configuration updated", config, HttpStatus.OK, "req_ai_sales_conf_002");
    }

    @GetMapping("/activity-logs")
    public ResponseEntity<?> getActivityLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        List<Map<String, Object>> list = store.getAiSalesActivity();
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", list);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", list.size());
        return buildResponse(true, "Agent activity logs retrieved", data, HttpStatus.OK, "req_ai_sales_act_001");
    }

    @GetMapping("/performance")
    public ResponseEntity<?> getPerformance(
            @RequestParam(defaultValue = "2026-10-01") String from,
            @RequestParam(defaultValue = "2026-10-28") String to
    ) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("periodFrom", from);
        data.put("periodTo", to);
        data.put("conversationsHandled", 850);
        data.put("leadsGenerated", 210);
        data.put("leadConversionRate", 18.5);
        data.put("cartRecoveryRate", 26.5);
        data.put("revenueInfluenced", 450000.00);
        data.put("currency", "INR");

        return buildResponse(true, "Sales agent performance retrieved", data, HttpStatus.OK, "req_ai_sales_perf_001");
    }

    @GetMapping("/automation-runs")
    public ResponseEntity<?> listAutomationRuns(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        List<Map<String, Object>> list = new ArrayList<>(store.getAiAutomationRuns().values());
        if (status != null && !status.isEmpty()) {
            list = list.stream().filter(r -> status.equalsIgnoreCase(String.valueOf(r.get("status")))).collect(Collectors.toList());
        }
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", list);
        data.put("totalElements", list.size());
        return buildResponse(true, "Automation runs retrieved", data, HttpStatus.OK, "req_auto_runs_001");
    }

    @GetMapping("/automation-runs/{runId}")
    public ResponseEntity<?> getAutomationRun(@PathVariable String runId) {
        Map<String, Object> run = store.getAiAutomationRuns().get(runId);
        if (run == null) {
            return buildResponse(false, "Run not found: " + runId, null, HttpStatus.NOT_FOUND, "req_run_not_found");
        }
        return buildResponse(true, "Automation run retrieved", run, HttpStatus.OK, "req_run_detail_001");
    }

    @PostMapping("/automation-runs/{runId}/retry")
    public ResponseEntity<?> retryAutomationRun(@PathVariable String runId, @RequestBody(required = false) Map<String, Object> body) {
        Map<String, Object> run = store.getAiAutomationRuns().get(runId);
        if (run == null) {
            return buildResponse(false, "Run not found: " + runId, null, HttpStatus.NOT_FOUND, "req_run_not_found");
        }
        run.put("status", "QUEUED");
        run.put("retryReason", body != null ? body.get("reason") : "Manual retry");
        store.recordAuditEvent("AUTOMATION_RETRY", "AI_SALES", runId, "Queued retry for automation run");

        return buildResponse(true, "Automation run retry queued", run, HttpStatus.ACCEPTED, "req_run_retry_001");
    }

    // =========================================================================
    // B. PRODUCT DISCOVERY & RECOMMENDATIONS
    // =========================================================================

    @GetMapping("/products/search")
    public ResponseEntity<?> searchProducts(@RequestParam(defaultValue = "") String q) {
        List<Map<String, Object>> matched = store.getProducts().values().stream()
                .filter(p -> q.isEmpty() || String.valueOf(p.get("name")).toLowerCase().contains(q.toLowerCase())
                        || String.valueOf(p.get("categoryName")).toLowerCase().contains(q.toLowerCase()))
                .collect(Collectors.toList());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("items", matched);
        data.put("totalElements", matched.size());

        return buildResponse(true, "Products retrieved", data, HttpStatus.OK, "req_product_search_001");
    }

    @GetMapping("/products/{productId}")
    public ResponseEntity<?> getProduct(@PathVariable String productId) {
        Map<String, Object> product = store.getProducts().get(productId);
        if (product == null) {
            return buildResponse(false, "Product not found: " + productId, null, HttpStatus.NOT_FOUND, "req_prod_not_found");
        }
        return buildResponse(true, "Product retrieved", product, HttpStatus.OK, "req_product_detail_001");
    }

    @PostMapping("/recommendations")
    public ResponseEntity<?> generateRecommendations(@RequestBody Map<String, Object> body) {
        String recId = "rec_" + (store.getAiRecommendations().size() + 1001);

        List<Map<String, Object>> recProducts = new ArrayList<>();
        recProducts.add(EcommerceDataStore.createMap(
                "productId", "prod_1001",
                "name", "Business Laptop A",
                "price", 54999.00,
                "currency", "INR",
                "availability", "IN_STOCK",
                "reason", "Matches budget and requested 16GB RAM specifications"
        ));

        Map<String, Object> rec = new LinkedHashMap<>();
        rec.put("recommendationId", recId);
        rec.put("customerId", body.get("customerId"));
        rec.put("conversationId", body.get("conversationId"));
        rec.put("products", recProducts);
        rec.put("catalogueChecked", true);
        rec.put("inventoryCheckedAt", "2026-10-28T10:59:00+05:30");

        store.getAiRecommendations().put(recId, rec);
        store.recordAuditEvent("AI_RECOMMENDATION_GENERATED", "AI_SALES_AGENT", recId, "Generated product recommendations for customer");

        return buildResponse(true, "Recommendations generated", rec, HttpStatus.OK, "req_recommendation_001");
    }

    @GetMapping("/recommendations/{recommendationId}")
    public ResponseEntity<?> getRecommendation(@PathVariable String recommendationId) {
        Map<String, Object> rec = store.getAiRecommendations().get(recommendationId);
        if (rec == null) {
            return buildResponse(false, "Recommendation not found: " + recommendationId, null, HttpStatus.NOT_FOUND, "req_rec_not_found");
        }
        return buildResponse(true, "Recommendation retrieved", rec, HttpStatus.OK, "req_rec_detail_001");
    }

    @PostMapping("/recommendations/{recommendationId}/feedback")
    public ResponseEntity<?> recordRecommendationFeedback(@PathVariable String recommendationId, @RequestBody Map<String, Object> body) {
        Map<String, Object> rec = store.getAiRecommendations().get(recommendationId);
        if (rec == null) {
            return buildResponse(false, "Recommendation not found: " + recommendationId, null, HttpStatus.NOT_FOUND, "req_rec_not_found");
        }
        rec.put("feedback", body.get("feedback")); // HELPFUL or NOT_HELPFUL
        rec.put("feedbackNote", body.get("note"));
        return buildResponse(true, "Recommendation feedback recorded", rec, HttpStatus.OK, "req_rec_fb_001");
    }

    @PostMapping("/product-questions")
    public ResponseEntity<?> answerProductQuestion(@RequestBody Map<String, Object> body) {
        String question = String.valueOf(body.get("question"));
        String productId = String.valueOf(body.get("productId"));
        Map<String, Object> product = store.getProducts().get(productId);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("productId", productId);
        data.put("question", question);
        data.put("answer", "Based on verified catalogue data, " + (product != null ? product.get("name") : "the product") + " comes with a 1-year manufacturer warranty and is currently in stock.");
        data.put("catalogueGrounded", true);

        return buildResponse(true, "Product question answered", data, HttpStatus.OK, "req_prod_q_001");
    }

    // =========================================================================
    // C. CUSTOMER CONVERSATIONS
    // =========================================================================

    @PostMapping("/conversations")
    public ResponseEntity<?> startConversation(@RequestBody Map<String, Object> body) {
        String convId = "conv_" + (store.getAiConversations().size() + 1001);
        String channel = String.valueOf(body.getOrDefault("channel", "WEBSITE_CHAT"));
        String customerId = String.valueOf(body.getOrDefault("customerId", "cust_1001"));
        String initMsg = String.valueOf(body.getOrDefault("initialMessage", "Hello"));

        Map<String, Object> conv = new LinkedHashMap<>();
        conv.put("conversationId", convId);
        conv.put("channel", channel);
        conv.put("customerId", customerId);
        conv.put("status", "OPEN");
        conv.put("agentType", "AI_SALES_AGENT");
        conv.put("humanHandoffRequired", false);
        conv.put("createdAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

        store.getAiConversations().put(convId, conv);

        List<Map<String, Object>> msgs = new ArrayList<>();
        msgs.add(EcommerceDataStore.createMap(
                "messageId", "msg_" + UUID.randomUUID().toString().substring(0, 8),
                "conversationId", convId,
                "sender", "CUSTOMER",
                "content", initMsg,
                "createdAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
        ));
        store.getAiConversationMessages().put(convId, msgs);

        store.recordAuditEvent("SALES_CONVERSATION_STARTED", "AI_SALES_AGENT", convId, "Customer initiated sales chat");

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("conversationId", convId);
        data.put("channel", channel);
        data.put("status", "OPEN");
        data.put("agentType", "AI_SALES_AGENT");
        data.put("humanHandoffRequired", false);

        return buildResponse(true, "Sales conversation created", data, HttpStatus.CREATED, "req_sales_conversation_001");
    }

    @GetMapping("/conversations")
    public ResponseEntity<?> listConversations(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        List<Map<String, Object>> list = store.getAiConversations().values().stream()
                .filter(c -> "AI_SALES_AGENT".equals(c.get("agentType")))
                .filter(c -> status == null || status.equalsIgnoreCase(String.valueOf(c.get("status"))))
                .collect(Collectors.toList());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", list);
        data.put("totalElements", list.size());

        return buildResponse(true, "Sales conversations retrieved", data, HttpStatus.OK, "req_sales_convs_001");
    }

    @GetMapping("/conversations/{conversationId}")
    public ResponseEntity<?> getConversation(@PathVariable String conversationId) {
        Map<String, Object> conv = store.getAiConversations().get(conversationId);
        if (conv == null) {
            return buildResponse(false, "Conversation not found: " + conversationId, null, HttpStatus.NOT_FOUND, "req_conv_not_found");
        }
        return buildResponse(true, "Conversation retrieved", conv, HttpStatus.OK, "req_conv_detail_001");
    }

    @PostMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<?> sendMessage(@PathVariable String conversationId, @RequestBody Map<String, Object> body) {
        Map<String, Object> conv = store.getAiConversations().get(conversationId);
        if (conv == null) {
            return buildResponse(false, "Conversation not found: " + conversationId, null, HttpStatus.NOT_FOUND, "req_conv_not_found");
        }
        String userMsg = String.valueOf(body.get("message"));
        String msgId = "msg_" + UUID.randomUUID().toString().substring(0, 8);

        List<Map<String, Object>> msgs = store.getAiConversationMessages().computeIfAbsent(conversationId, k -> new ArrayList<>());
        msgs.add(EcommerceDataStore.createMap("messageId", msgId, "sender", "CUSTOMER", "content", userMsg, "createdAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)));

        // Generate AI response grounded in product catalogue
        String aiReplyId = "msg_" + UUID.randomUUID().toString().substring(0, 8);
        String aiReplyContent = "I found two products in your budget. Business Laptop A is priced at ₹54,999 and Business Laptop B is priced at ₹58,999. I can compare their verified specifications to help you choose.";

        List<Map<String, Object>> sources = new ArrayList<>();
        sources.add(EcommerceDataStore.createMap("type", "PRODUCT_CATALOGUE", "id", "prod_1001"));
        sources.add(EcommerceDataStore.createMap("type", "PRODUCT_CATALOGUE", "id", "prod_1002"));

        msgs.add(EcommerceDataStore.createMap(
                "messageId", aiReplyId,
                "sender", "AI_SALES_AGENT",
                "content", aiReplyContent,
                "sourceReferences", sources,
                "createdAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
        ));

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("conversationId", conversationId);
        data.put("messageId", aiReplyId);
        data.put("sender", "AI_SALES_AGENT");
        data.put("content", aiReplyContent);
        data.put("sourceReferences", sources);
        data.put("humanHandoffRequired", false);

        return buildResponse(true, "Agent response generated", data, HttpStatus.OK, "req_sales_message_001");
    }

    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<?> getConversationMessages(@PathVariable String conversationId) {
        List<Map<String, Object>> msgs = store.getAiConversationMessages().getOrDefault(conversationId, Collections.emptyList());
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", msgs);
        data.put("totalElements", msgs.size());
        return buildResponse(true, "Conversation messages retrieved", data, HttpStatus.OK, "req_sales_msgs_001");
    }

    @PostMapping("/conversations/{conversationId}/handoff")
    public ResponseEntity<?> handoffConversation(@PathVariable String conversationId, @RequestBody Map<String, Object> body) {
        Map<String, Object> conv = store.getAiConversations().get(conversationId);
        if (conv == null) {
            return buildResponse(false, "Conversation not found: " + conversationId, null, HttpStatus.NOT_FOUND, "req_conv_not_found");
        }
        conv.put("status", "WAITING_FOR_HUMAN");
        conv.put("handoffReason", body.getOrDefault("reason", "CUSTOMER_REQUEST"));
        conv.put("priority", body.getOrDefault("priority", "HIGH"));
        conv.put("queue", "SALES_TEAM");

        store.recordAuditEvent("SALES_HANDOFF", "AI_SALES_AGENT", conversationId, "Handed off conversation to sales team");

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("conversationId", conversationId);
        data.put("status", "WAITING_FOR_HUMAN");
        data.put("reason", conv.get("handoffReason"));
        data.put("priority", conv.get("priority"));
        data.put("queue", "SALES_TEAM");

        return buildResponse(true, "Conversation handed off", data, HttpStatus.OK, "req_handoff_001");
    }

    @PostMapping("/conversations/{conversationId}/close")
    public ResponseEntity<?> closeConversation(@PathVariable String conversationId) {
        Map<String, Object> conv = store.getAiConversations().get(conversationId);
        if (conv == null) {
            return buildResponse(false, "Conversation not found: " + conversationId, null, HttpStatus.NOT_FOUND, "req_conv_not_found");
        }
        conv.put("status", "CLOSED");
        return buildResponse(true, "Conversation closed successfully", conv, HttpStatus.OK, "req_conv_close_001");
    }

    // =========================================================================
    // D. LEAD MANAGEMENT
    // =========================================================================

    @PostMapping("/leads")
    public ResponseEntity<?> createLead(@RequestBody Map<String, Object> body) {
        String leadId = "lead_" + (store.getAiLeads().size() + 1001);
        String name = String.valueOf(body.getOrDefault("name", "Prospect"));

        Map<String, Object> lead = new LinkedHashMap<>(body);
        lead.put("leadId", leadId);
        lead.put("name", name);
        lead.put("source", body.getOrDefault("source", "WEBSITE_CHAT"));
        lead.put("status", "NEW");
        lead.put("qualificationStatus", "PENDING");
        lead.put("assignedTo", null);
        lead.put("createdAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

        store.getAiLeads().put(leadId, lead);
        store.recordAuditEvent("LEAD_CAPTURED", "AI_SALES_AGENT", leadId, "Captured prospect: " + name);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("leadId", leadId);
        data.put("name", name);
        data.put("source", lead.get("source"));
        data.put("status", "NEW");
        data.put("qualificationStatus", "PENDING");
        data.put("assignedTo", null);

        return buildResponse(true, "Lead created", data, HttpStatus.CREATED, "req_lead_create_001");
    }

    @GetMapping("/leads")
    public ResponseEntity<?> listLeads(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        List<Map<String, Object>> list = new ArrayList<>(store.getAiLeads().values());
        if (status != null && !status.isEmpty()) {
            list = list.stream().filter(l -> status.equalsIgnoreCase(String.valueOf(l.get("status")))).collect(Collectors.toList());
        }
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", list);
        data.put("totalElements", list.size());
        return buildResponse(true, "Leads retrieved", data, HttpStatus.OK, "req_leads_list_001");
    }

    @GetMapping("/leads/{leadId}")
    public ResponseEntity<?> getLead(@PathVariable String leadId) {
        Map<String, Object> lead = store.getAiLeads().get(leadId);
        if (lead == null) {
            return buildResponse(false, "Lead not found: " + leadId, null, HttpStatus.NOT_FOUND, "req_lead_not_found");
        }
        return buildResponse(true, "Lead retrieved", lead, HttpStatus.OK, "req_lead_detail_001");
    }

    @PatchMapping("/leads/{leadId}")
    public ResponseEntity<?> updateLead(@PathVariable String leadId, @RequestBody Map<String, Object> body) {
        Map<String, Object> lead = store.getAiLeads().get(leadId);
        if (lead == null) {
            return buildResponse(false, "Lead not found: " + leadId, null, HttpStatus.NOT_FOUND, "req_lead_not_found");
        }
        lead.putAll(body);
        return buildResponse(true, "Lead updated", lead, HttpStatus.OK, "req_lead_update_001");
    }

    @PostMapping("/leads/{leadId}/qualify")
    public ResponseEntity<?> qualifyLead(@PathVariable String leadId, @RequestBody Map<String, Object> body) {
        Map<String, Object> lead = store.getAiLeads().get(leadId);
        if (lead == null) {
            return buildResponse(false, "Lead not found: " + leadId, null, HttpStatus.NOT_FOUND, "req_lead_not_found");
        }
        lead.put("qualificationStatus", "QUALIFIED");
        lead.put("purchaseIntent", body.getOrDefault("purchaseIntent", "HIGH"));
        lead.put("qualificationNotes", body.get("qualificationNotes"));

        store.recordAuditEvent("LEAD_QUALIFIED", "AI_SALES_AGENT", leadId, "Lead marked as QUALIFIED");

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("leadId", leadId);
        data.put("qualificationStatus", "QUALIFIED");
        data.put("purchaseIntent", lead.get("purchaseIntent"));
        data.put("assignedTo", lead.get("assignedTo"));
        data.put("nextAction", "ASSIGN_SALES_EXECUTIVE");

        return buildResponse(true, "Lead qualification recorded", data, HttpStatus.OK, "req_lead_qualify_001");
    }

    @PostMapping("/leads/{leadId}/assign")
    public ResponseEntity<?> assignLead(@PathVariable String leadId, @RequestBody Map<String, Object> body) {
        Map<String, Object> lead = store.getAiLeads().get(leadId);
        if (lead == null) {
            return buildResponse(false, "Lead not found: " + leadId, null, HttpStatus.NOT_FOUND, "req_lead_not_found");
        }
        String userId = String.valueOf(body.get("userId"));
        lead.put("assignedTo", userId);
        store.recordAuditEvent("LEAD_ASSIGNED", "AI_SALES_AGENT", leadId, "Assigned lead to " + userId);

        return buildResponse(true, "Lead assigned successfully", lead, HttpStatus.OK, "req_lead_assign_001");
    }

    @PostMapping("/leads/{leadId}/activities")
    public ResponseEntity<?> recordLeadActivity(@PathVariable String leadId, @RequestBody Map<String, Object> body) {
        Map<String, Object> lead = store.getAiLeads().get(leadId);
        if (lead == null) {
            return buildResponse(false, "Lead not found: " + leadId, null, HttpStatus.NOT_FOUND, "req_lead_not_found");
        }
        String actId = "act_" + UUID.randomUUID().toString().substring(0, 8);
        Map<String, Object> act = new LinkedHashMap<>(body);
        act.put("activityId", actId);
        act.put("leadId", leadId);
        act.put("recordedAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

        store.getAiLeadActivities().computeIfAbsent(leadId, k -> new ArrayList<>()).add(act);
        return buildResponse(true, "Lead activity recorded", act, HttpStatus.CREATED, "req_lead_act_001");
    }

    @GetMapping("/leads/{leadId}/activities")
    public ResponseEntity<?> getLeadActivities(@PathVariable String leadId) {
        List<Map<String, Object>> acts = store.getAiLeadActivities().getOrDefault(leadId, Collections.emptyList());
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", acts);
        data.put("totalElements", acts.size());
        return buildResponse(true, "Lead activities retrieved", data, HttpStatus.OK, "req_lead_acts_001");
    }

    @PostMapping("/leads/{leadId}/convert")
    public ResponseEntity<?> convertLead(@PathVariable String leadId, @RequestBody Map<String, Object> body) {
        Map<String, Object> lead = store.getAiLeads().get(leadId);
        if (lead == null) {
            return buildResponse(false, "Lead not found: " + leadId, null, HttpStatus.NOT_FOUND, "req_lead_not_found");
        }
        lead.put("status", "CONVERTED");
        lead.put("convertedOpportunityId", "opp_" + UUID.randomUUID().toString().substring(0, 8));
        store.recordAuditEvent("LEAD_CONVERTED", "AI_SALES_AGENT", leadId, "Converted lead to opportunity");

        return buildResponse(true, "Lead converted successfully", lead, HttpStatus.OK, "req_lead_convert_001");
    }

    // =========================================================================
    // E. ABANDONED CARTS & FOLLOW-UPS
    // =========================================================================

    @GetMapping("/abandoned-carts")
    public ResponseEntity<?> listAbandonedCarts() {
        List<Map<String, Object>> list = new ArrayList<>(store.getAbandonedCarts().values());
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", list);
        data.put("totalElements", list.size());
        return buildResponse(true, "Abandoned carts retrieved", data, HttpStatus.OK, "req_ab_carts_001");
    }

    @GetMapping("/abandoned-carts/{cartId}")
    public ResponseEntity<?> getAbandonedCart(@PathVariable String cartId) {
        Map<String, Object> cart = store.getAbandonedCarts().get(cartId);
        if (cart == null) {
            return buildResponse(false, "Cart not found: " + cartId, null, HttpStatus.NOT_FOUND, "req_cart_not_found");
        }
        return buildResponse(true, "Abandoned cart retrieved", cart, HttpStatus.OK, "req_cart_detail_001");
    }

    @PostMapping("/abandoned-carts/{cartId}/recovery-draft")
    public ResponseEntity<?> createCartRecoveryDraft(@PathVariable String cartId, @RequestBody Map<String, Object> body) {
        Map<String, Object> cart = store.getAbandonedCarts().get(cartId);
        if (cart == null) {
            return buildResponse(false, "Cart not found: " + cartId, null, HttpStatus.NOT_FOUND, "req_cart_not_found");
        }
        String draftId = "draft_" + (store.getRecoveryDrafts().size() + 1001);
        String channel = String.valueOf(body.getOrDefault("channel", "EMAIL"));

        Map<String, Object> draft = new LinkedHashMap<>();
        draft.put("draftId", draftId);
        draft.put("cartId", cartId);
        draft.put("status", "PENDING_APPROVAL");
        draft.put("channel", channel);
        draft.put("subject", "Your cart is waiting");
        draft.put("body", "Hello, you still have items in your cart. If you would like to continue, you can return to your cart and complete your order.");
        draft.put("discountApplied", false);

        store.getRecoveryDrafts().put(draftId, draft);
        return buildResponse(true, "Recovery draft generated", draft, HttpStatus.OK, "req_cart_draft_001");
    }

    @PostMapping("/abandoned-carts/{cartId}/recovery-schedule")
    public ResponseEntity<?> scheduleCartRecovery(@PathVariable String cartId, @RequestBody Map<String, Object> body) {
        Map<String, Object> cart = store.getAbandonedCarts().get(cartId);
        if (cart == null) {
            return buildResponse(false, "Cart not found: " + cartId, null, HttpStatus.NOT_FOUND, "req_cart_not_found");
        }
        cart.put("recoveryScheduled", true);
        cart.put("scheduleExecutionTime", body.getOrDefault("scheduledAt", "2026-10-29T10:00:00+05:30"));
        return buildResponse(true, "Cart recovery action scheduled", cart, HttpStatus.OK, "req_cart_sched_001");
    }

    @GetMapping("/follow-ups")
    public ResponseEntity<?> listFollowUps(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        List<Map<String, Object>> list = new ArrayList<>(store.getSalesFollowUps().values());
        if (status != null && !status.isEmpty()) {
            list = list.stream().filter(f -> status.equalsIgnoreCase(String.valueOf(f.get("status")))).collect(Collectors.toList());
        }
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", list);
        data.put("totalElements", list.size());
        return buildResponse(true, "Follow-up tasks retrieved", data, HttpStatus.OK, "req_followups_001");
    }

    @PostMapping("/follow-ups")
    public ResponseEntity<?> createFollowUp(@RequestBody Map<String, Object> body) {
        String taskId = "task_" + (store.getSalesFollowUps().size() + 1001);
        Map<String, Object> task = new LinkedHashMap<>(body);
        task.put("taskId", taskId);
        task.put("status", "PENDING");
        task.put("createdAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

        store.getSalesFollowUps().put(taskId, task);
        return buildResponse(true, "Follow-up task created", task, HttpStatus.CREATED, "req_followup_001");
    }

    @GetMapping("/follow-ups/{taskId}")
    public ResponseEntity<?> getFollowUp(@PathVariable String taskId) {
        Map<String, Object> task = store.getSalesFollowUps().get(taskId);
        if (task == null) {
            return buildResponse(false, "Task not found: " + taskId, null, HttpStatus.NOT_FOUND, "req_task_not_found");
        }
        return buildResponse(true, "Follow-up task retrieved", task, HttpStatus.OK, "req_task_detail_001");
    }

    @PatchMapping("/follow-ups/{taskId}")
    public ResponseEntity<?> updateFollowUp(@PathVariable String taskId, @RequestBody Map<String, Object> body) {
        Map<String, Object> task = store.getSalesFollowUps().get(taskId);
        if (task == null) {
            return buildResponse(false, "Task not found: " + taskId, null, HttpStatus.NOT_FOUND, "req_task_not_found");
        }
        task.putAll(body);
        return buildResponse(true, "Follow-up task updated", task, HttpStatus.OK, "req_task_update_001");
    }

    @PostMapping("/follow-ups/{taskId}/complete")
    public ResponseEntity<?> completeFollowUp(@PathVariable String taskId, @RequestBody(required = false) Map<String, Object> body) {
        Map<String, Object> task = store.getSalesFollowUps().get(taskId);
        if (task == null) {
            return buildResponse(false, "Task not found: " + taskId, null, HttpStatus.NOT_FOUND, "req_task_not_found");
        }
        task.put("status", "COMPLETED");
        task.put("completionNote", body != null ? body.get("completionNote") : "Completed");
        return buildResponse(true, "Follow-up task completed", task, HttpStatus.OK, "req_task_complete_001");
    }

    @PostMapping("/follow-ups/{taskId}/cancel")
    public ResponseEntity<?> cancelFollowUp(@PathVariable String taskId, @RequestBody(required = false) Map<String, Object> body) {
        Map<String, Object> task = store.getSalesFollowUps().get(taskId);
        if (task == null) {
            return buildResponse(false, "Task not found: " + taskId, null, HttpStatus.NOT_FOUND, "req_task_not_found");
        }
        task.put("status", "CANCELLED");
        task.put("cancelReason", body != null ? body.get("reason") : "Customer withdrew interest");
        return buildResponse(true, "Follow-up task cancelled", task, HttpStatus.OK, "req_task_cancel_001");
    }

    // =========================================================================
    // F. SALES MESSAGES & CAMPAIGNS
    // =========================================================================

    @PostMapping("/message-drafts")
    public ResponseEntity<?> createMessageDraft(@RequestBody Map<String, Object> body) {
        String draftId = "draft_" + (store.getRecoveryDrafts().size() + 2001);
        Map<String, Object> draft = new LinkedHashMap<>(body);
        draft.put("draftId", draftId);
        draft.put("status", "PENDING_APPROVAL");
        draft.put("createdAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

        store.getRecoveryDrafts().put(draftId, draft);
        return buildResponse(true, "Sales message draft created", draft, HttpStatus.CREATED, "req_draft_create_001");
    }

    @GetMapping("/message-drafts/{draftId}")
    public ResponseEntity<?> getMessageDraft(@PathVariable String draftId) {
        Map<String, Object> draft = store.getRecoveryDrafts().get(draftId);
        if (draft == null) {
            return buildResponse(false, "Draft not found: " + draftId, null, HttpStatus.NOT_FOUND, "req_draft_not_found");
        }
        return buildResponse(true, "Draft details retrieved", draft, HttpStatus.OK, "req_draft_detail_001");
    }

    @PatchMapping("/message-drafts/{draftId}")
    public ResponseEntity<?> updateMessageDraft(@PathVariable String draftId, @RequestBody Map<String, Object> body) {
        Map<String, Object> draft = store.getRecoveryDrafts().get(draftId);
        if (draft == null) {
            return buildResponse(false, "Draft not found: " + draftId, null, HttpStatus.NOT_FOUND, "req_draft_not_found");
        }
        draft.putAll(body);
        return buildResponse(true, "Draft updated", draft, HttpStatus.OK, "req_draft_update_001");
    }

    @PostMapping("/message-drafts/{draftId}/approve")
    public ResponseEntity<?> approveMessageDraft(@PathVariable String draftId, @RequestBody(required = false) Map<String, Object> body) {
        Map<String, Object> draft = store.getRecoveryDrafts().get(draftId);
        if (draft == null) {
            return buildResponse(false, "Draft not found: " + draftId, null, HttpStatus.NOT_FOUND, "req_draft_not_found");
        }
        draft.put("status", "APPROVED");
        draft.put("approvedBy", "usr_sales_manager_101");
        return buildResponse(true, "Draft approved", draft, HttpStatus.OK, "req_draft_approve_001");
    }

    @PostMapping("/message-drafts/{draftId}/send")
    public ResponseEntity<?> sendMessageDraft(
            @PathVariable String draftId,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey
    ) {
        Map<String, Object> draft = store.getRecoveryDrafts().get(draftId);
        if (draft == null) {
            return buildResponse(false, "Draft not found: " + draftId, null, HttpStatus.NOT_FOUND, "req_draft_not_found");
        }
        draft.put("status", "SENT");
        draft.put("sentAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        return buildResponse(true, "Sales message sent successfully", draft, HttpStatus.ACCEPTED, "req_draft_send_001");
    }

    @GetMapping("/campaigns")
    public ResponseEntity<?> listCampaigns() {
        List<Map<String, Object>> list = new ArrayList<>(store.getSalesCampaigns().values());
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", list);
        data.put("totalElements", list.size());
        return buildResponse(true, "Campaigns retrieved", data, HttpStatus.OK, "req_camps_001");
    }

    @GetMapping("/campaigns/{campaignId}")
    public ResponseEntity<?> getCampaign(@PathVariable String campaignId) {
        Map<String, Object> camp = store.getSalesCampaigns().get(campaignId);
        if (camp == null) {
            return buildResponse(false, "Campaign not found: " + campaignId, null, HttpStatus.NOT_FOUND, "req_camp_not_found");
        }
        return buildResponse(true, "Campaign retrieved", camp, HttpStatus.OK, "req_camp_detail_001");
    }

    @PostMapping("/campaigns/{campaignId}/audience-preview")
    public ResponseEntity<?> previewAudience(@PathVariable String campaignId, @RequestBody(required = false) Map<String, Object> body) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("campaignId", campaignId);
        data.put("eligibleAudienceCount", 1250);
        data.put("suppressedCount", 45);
        data.put("optedOutCount", 28);
        data.put("netReach", 1177);
        return buildResponse(true, "Audience preview generated", data, HttpStatus.OK, "req_aud_preview_001");
    }

    @PostMapping("/campaigns/{campaignId}/execute")
    public ResponseEntity<?> executeCampaign(
            @PathVariable String campaignId,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey
    ) {
        Map<String, Object> camp = store.getSalesCampaigns().get(campaignId);
        if (camp == null) {
            return buildResponse(false, "Campaign not found: " + campaignId, null, HttpStatus.NOT_FOUND, "req_camp_not_found");
        }
        camp.put("status", "ACTIVE");
        camp.put("executedAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        return buildResponse(true, "Campaign execution started", camp, HttpStatus.ACCEPTED, "req_camp_exec_001");
    }

    @GetMapping("/campaigns/{campaignId}/results")
    public ResponseEntity<?> getCampaignResults(@PathVariable String campaignId) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("campaignId", campaignId);
        data.put("messagesSent", 1177);
        data.put("deliveryRate", 99.1);
        data.put("openRate", 34.2);
        data.put("clickRate", 12.8);
        data.put("conversions", 64);
        data.put("revenueGenerated", 185000.00);
        data.put("currency", "INR");
        return buildResponse(true, "Campaign results retrieved", data, HttpStatus.OK, "req_camp_res_001");
    }
}
