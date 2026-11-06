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
 * Sales Manager V1 Controller
 * Base Path: /api/v1/ecommerce/sales-manager
 * Implements 27 REST API endpoints specified in Section 2.2.
 */
@RestController
@RequestMapping("/api/v1/ecommerce/sales-manager")
@CrossOrigin(origins = "*")
public class EcommerceSalesManagerV1Controller {

    private final EcommerceDataStore store;

    public EcommerceSalesManagerV1Controller(EcommerceDataStore store) {
        this.store = store;
    }

    private <T> ResponseEntity<Map<String, Object>> buildResponse(boolean success, String message, T data, HttpStatus status, String requestId) {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", success);
        resp.put("message", message);
        if (data != null) {
            resp.put("data", data);
        }
        resp.put("timestamp", "2026-10-28T10:00:00+05:30");
        resp.put("requestId", requestId != null ? requestId : "req_sales_" + UUID.randomUUID().toString().substring(0, 8));
        return ResponseEntity.status(status).body(resp);
    }

    // 1. GET /dashboard
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        Map<String, Object> period = new LinkedHashMap<>();
        period.put("from", "2026-10-01");
        period.put("to", "2026-10-28");

        long totalOrders = store.getOrders().values().stream()
                .filter(o -> !"CANCELLED".equals(o.get("orderStatus")))
                .count();

        double totalRevenue = store.getOrders().values().stream()
                .filter(o -> !"CANCELLED".equals(o.get("orderStatus")))
                .mapToDouble(o -> {
                    Object amt = o.get("totalAmount");
                    return amt instanceof Number ? ((Number) amt).doubleValue() : 0.0;
                }).sum();

        long activeCampaigns = store.getSalesCampaigns().values().stream()
                .filter(c -> "ACTIVE".equals(c.get("status")))
                .count();

        long pendingApprovals = store.getSalesCampaigns().values().stream()
                .filter(c -> "PENDING_APPROVAL".equals(c.get("status")) || "PENDING".equals(c.get("approvalStatus")))
                .count();

        long pendingFollowUps = store.getSalesFollowUps().values().stream()
                .filter(f -> "PENDING".equals(f.get("status")) || "OPEN".equals(f.get("status")))
                .count();

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("period", period);
        data.put("totalRevenue", totalRevenue > 0 ? totalRevenue : 1250000.00);
        data.put("totalOrders", totalOrders > 0 ? totalOrders : 850);
        data.put("averageOrderValue", 1470.59);
        data.put("conversionRate", 3.8);
        data.put("abandonedCarts", store.getAbandonedCarts().size());
        data.put("recoveredCarts", 85);
        data.put("recoveredRevenue", 112500.00);
        data.put("activeCampaigns", activeCampaigns);
        data.put("pendingCampaignApprovals", pendingApprovals);
        data.put("pendingSalesFollowUps", pendingFollowUps);

        return buildResponse(true, "Sales dashboard retrieved successfully", data, HttpStatus.OK, "req_sales_dashboard_001");
    }

    // 2. GET /performance
    @GetMapping("/performance")
    public ResponseEntity<?> getPerformance(
            @RequestParam(defaultValue = "2026-10-01") String from,
            @RequestParam(defaultValue = "2026-10-28") String to
    ) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("periodFrom", from);
        data.put("periodTo", to);
        data.put("totalOrders", 850);
        data.put("grossSales", 1250000.00);
        data.put("discountAmount", 85000.00);
        data.put("refundAmount", 25000.00);
        data.put("netSales", 1140000.00);
        data.put("averageOrderValue", 1470.59);
        data.put("newCustomers", 210);
        data.put("repeatCustomers", 145);
        data.put("conversionRate", 3.8);

        return buildResponse(true, "Sales performance retrieved successfully", data, HttpStatus.OK, "req_sales_performance_001");
    }

    // 3. GET /sales-trends
    @GetMapping("/sales-trends")
    public ResponseEntity<?> getSalesTrends(
            @RequestParam(defaultValue = "DAILY") String interval,
            @RequestParam(defaultValue = "30") int days
    ) {
        List<Map<String, Object>> trends = new ArrayList<>();
        trends.add(EcommerceDataStore.createMap("date", "2026-10-22", "revenue", 42500.00, "orders", 29, "conversionRate", 3.6));
        trends.add(EcommerceDataStore.createMap("date", "2026-10-23", "revenue", 51200.00, "orders", 35, "conversionRate", 3.9));
        trends.add(EcommerceDataStore.createMap("date", "2026-10-24", "revenue", 48000.00, "orders", 33, "conversionRate", 3.7));
        trends.add(EcommerceDataStore.createMap("date", "2026-10-25", "revenue", 62000.00, "orders", 42, "conversionRate", 4.1));
        trends.add(EcommerceDataStore.createMap("date", "2026-10-26", "revenue", 58900.00, "orders", 39, "conversionRate", 4.0));
        trends.add(EcommerceDataStore.createMap("date", "2026-10-27", "revenue", 64500.00, "orders", 44, "conversionRate", 4.3));
        trends.add(EcommerceDataStore.createMap("date", "2026-10-28", "revenue", 71000.00, "orders", 48, "conversionRate", 4.5));

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("interval", interval);
        data.put("days", days);
        data.put("trends", trends);

        return buildResponse(true, "Sales trends retrieved successfully", data, HttpStatus.OK, "req_sales_trends_001");
    }

    // 4. GET /products/performance
    @GetMapping("/products/performance")
    public ResponseEntity<?> getProductPerformance(
            @RequestParam(defaultValue = "2026-10-01") String from,
            @RequestParam(defaultValue = "2026-10-28") String to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        List<Map<String, Object>> productMetrics = new ArrayList<>();
        productMetrics.add(EcommerceDataStore.createMap(
                "productId", "prod_1001",
                "productName", "Wireless Noise-Canceling Headphones",
                "unitsSold", 320,
                "grossSales", 320000.00,
                "refundAmount", 5000.00,
                "netSales", 315000.00,
                "conversionRate", 4.2
        ));
        productMetrics.add(EcommerceDataStore.createMap(
                "productId", "prod_1002",
                "productName", "Pro Smart Watch Series 5",
                "unitsSold", 215,
                "grossSales", 258000.00,
                "refundAmount", 3000.00,
                "netSales", 255000.00,
                "conversionRate", 3.5
        ));

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", productMetrics);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", productMetrics.size());
        data.put("totalPages", 1);

        return buildResponse(true, "Product sales performance retrieved successfully", data, HttpStatus.OK, "req_product_performance_001");
    }

    // 5. GET /categories/performance
    @GetMapping("/categories/performance")
    public ResponseEntity<?> getCategoryPerformance(
            @RequestParam(defaultValue = "2026-10-01") String from,
            @RequestParam(defaultValue = "2026-10-28") String to
    ) {
        List<Map<String, Object>> categoryMetrics = new ArrayList<>();
        categoryMetrics.add(EcommerceDataStore.createMap("categoryId", "cat_101", "name", "Audio & Headphones", "revenue", 520000.00, "units", 540, "sharePercent", 41.6));
        categoryMetrics.add(EcommerceDataStore.createMap("categoryId", "cat_102", "name", "Wearables & Watches", "revenue", 410000.00, "units", 320, "sharePercent", 32.8));
        categoryMetrics.add(EcommerceDataStore.createMap("categoryId", "cat_103", "name", "Smart Home & Accessories", "revenue", 320000.00, "units", 610, "sharePercent", 25.6));

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", categoryMetrics);
        data.put("totalCategories", categoryMetrics.size());

        return buildResponse(true, "Category sales performance retrieved successfully", data, HttpStatus.OK, "req_category_performance_001");
    }

    // 6. GET /orders
    @GetMapping("/orders")
    public ResponseEntity<?> searchOrders(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        List<Map<String, Object>> list = new ArrayList<>(store.getOrders().values());
        if (status != null && !status.isEmpty()) {
            list = list.stream().filter(o -> status.equalsIgnoreCase(String.valueOf(o.get("orderStatus")))).collect(Collectors.toList());
        }

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", list);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", list.size());
        data.put("totalPages", 1);

        return buildResponse(true, "Sales orders retrieved successfully", data, HttpStatus.OK, "req_sales_orders_001");
    }

    // 7. GET /customers/segments
    @GetMapping("/customers/segments")
    public ResponseEntity<?> listSegments() {
        List<Map<String, Object>> list = new ArrayList<>(store.getCustomerSegments().values());
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", list);
        data.put("totalElements", list.size());

        return buildResponse(true, "Customer segments retrieved successfully", data, HttpStatus.OK, "req_segments_001");
    }

    // 8. GET /campaigns
    @GetMapping("/campaigns")
    public ResponseEntity<?> listCampaigns(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        List<Map<String, Object>> list = new ArrayList<>(store.getSalesCampaigns().values());
        if (status != null && !status.isEmpty()) {
            list = list.stream().filter(c -> status.equalsIgnoreCase(String.valueOf(c.get("status")))).collect(Collectors.toList());
        }

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", list);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", list.size());
        data.put("totalPages", 1);

        return buildResponse(true, "Sales campaigns retrieved successfully", data, HttpStatus.OK, "req_campaigns_list_001");
    }

    // 9. POST /campaigns
    @PostMapping("/campaigns")
    public ResponseEntity<?> createCampaign(@RequestBody Map<String, Object> body) {
        String campaignId = "camp_" + (1000 + store.getSalesCampaigns().size() + 1);
        String name = String.valueOf(body.getOrDefault("name", "Untitled Campaign"));
        String type = String.valueOf(body.getOrDefault("campaignType", "DISCOUNT"));
        String channel = String.valueOf(body.getOrDefault("channel", "EMAIL"));

        Map<String, Object> campaign = new LinkedHashMap<>(body);
        campaign.put("campaignId", campaignId);
        campaign.put("name", name);
        campaign.put("campaignType", type);
        campaign.put("channel", channel);
        campaign.put("status", "DRAFT");
        campaign.put("approvalStatus", "PENDING");
        campaign.put("createdBy", "usr_1001");
        campaign.put("createdAt", "2026-10-28T10:10:00+05:30");

        store.getSalesCampaigns().put(campaignId, campaign);
        store.recordAuditEvent("CAMPAIGN_DRAFT_CREATED", "SALES_MANAGER", campaignId, "Created campaign draft: " + name);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("campaignId", campaignId);
        data.put("name", name);
        data.put("status", "DRAFT");
        data.put("approvalStatus", "PENDING");
        data.put("createdBy", "usr_1001");
        data.put("createdAt", "2026-10-28T10:10:00+05:30");

        return buildResponse(true, "Campaign draft created successfully", data, HttpStatus.CREATED, "req_campaign_001");
    }

    // 10. GET /campaigns/{campaignId}
    @GetMapping("/campaigns/{campaignId}")
    public ResponseEntity<?> getCampaignDetails(@PathVariable String campaignId) {
        Map<String, Object> campaign = store.getSalesCampaigns().get(campaignId);
        if (campaign == null) {
            return buildResponse(false, "Campaign not found: " + campaignId, null, HttpStatus.NOT_FOUND, "req_campaign_not_found");
        }
        return buildResponse(true, "Campaign details retrieved", campaign, HttpStatus.OK, "req_campaign_detail_001");
    }

    // 11. PATCH /campaigns/{campaignId}
    @PatchMapping("/campaigns/{campaignId}")
    public ResponseEntity<?> updateCampaign(@PathVariable String campaignId, @RequestBody Map<String, Object> body) {
        Map<String, Object> campaign = store.getSalesCampaigns().get(campaignId);
        if (campaign == null) {
            return buildResponse(false, "Campaign not found: " + campaignId, null, HttpStatus.NOT_FOUND, "req_camp_patch_err");
        }
        if (!"DRAFT".equals(campaign.get("status")) && !"PENDING_APPROVAL".equals(campaign.get("status"))) {
            return buildResponse(false, "Cannot edit campaign in status " + campaign.get("status"), null, HttpStatus.UNPROCESSABLE_ENTITY, "req_camp_patch_err");
        }
        campaign.putAll(body);
        campaign.put("updatedAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        store.recordAuditEvent("CAMPAIGN_UPDATED", "SALES_MANAGER", campaignId, "Updated campaign properties");

        return buildResponse(true, "Campaign draft updated successfully", campaign, HttpStatus.OK, "req_campaign_update_001");
    }

    // 12. POST /campaigns/{campaignId}/submit-approval
    @PostMapping("/campaigns/{campaignId}/submit-approval")
    public ResponseEntity<?> submitApproval(@PathVariable String campaignId, @RequestBody(required = false) Map<String, Object> body) {
        Map<String, Object> campaign = store.getSalesCampaigns().get(campaignId);
        if (campaign == null) {
            return buildResponse(false, "Campaign not found: " + campaignId, null, HttpStatus.NOT_FOUND, "req_camp_sub_err");
        }
        campaign.put("status", "PENDING_APPROVAL");
        campaign.put("approvalStatus", "PENDING");
        campaign.put("submittedAt", "2026-10-28T10:12:00+05:30");
        if (body != null && body.containsKey("comment")) {
            campaign.put("submissionComment", body.get("comment"));
        }
        store.recordAuditEvent("CAMPAIGN_SUBMITTED_APPROVAL", "SALES_MANAGER", campaignId, "Submitted campaign for approval");

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("campaignId", campaignId);
        data.put("status", "PENDING_APPROVAL");
        data.put("approvalStatus", "PENDING");
        data.put("submittedAt", "2026-10-28T10:12:00+05:30");

        return buildResponse(true, "Campaign submitted for approval", data, HttpStatus.OK, "req_campaign_approval_001");
    }

    // 13. POST /campaigns/{campaignId}/activate
    @PostMapping("/campaigns/{campaignId}/activate")
    public ResponseEntity<?> activateCampaign(@PathVariable String campaignId, @RequestBody(required = false) Map<String, Object> body) {
        Map<String, Object> campaign = store.getSalesCampaigns().get(campaignId);
        if (campaign == null) {
            return buildResponse(false, "Campaign not found: " + campaignId, null, HttpStatus.NOT_FOUND, "req_camp_act_err");
        }
        campaign.put("status", "ACTIVE");
        campaign.put("approvalStatus", "APPROVED");
        campaign.put("executionId", "exec_campaign_" + campaignId);
        campaign.put("activatedAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        store.recordAuditEvent("CAMPAIGN_ACTIVATED", "SALES_MANAGER", campaignId, "Activated campaign: " + campaign.get("name"));

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("campaignId", campaignId);
        data.put("status", "ACTIVE");
        data.put("executionId", "exec_campaign_" + campaignId);
        data.put("scheduledStartAt", "2026-10-29T09:00:00+05:30");

        return buildResponse(true, "Campaign activation scheduled", data, HttpStatus.OK, "req_campaign_activate_001");
    }

    // 14. POST /campaigns/{campaignId}/pause
    @PostMapping("/campaigns/{campaignId}/pause")
    public ResponseEntity<?> pauseCampaign(@PathVariable String campaignId) {
        Map<String, Object> campaign = store.getSalesCampaigns().get(campaignId);
        if (campaign == null) {
            return buildResponse(false, "Campaign not found: " + campaignId, null, HttpStatus.NOT_FOUND, "req_camp_pause_err");
        }
        campaign.put("status", "PAUSED");
        store.recordAuditEvent("CAMPAIGN_PAUSED", "SALES_MANAGER", campaignId, "Paused campaign");

        return buildResponse(true, "Campaign paused successfully", campaign, HttpStatus.OK, "req_campaign_pause_001");
    }

    // 15. GET /abandoned-carts
    @GetMapping("/abandoned-carts")
    public ResponseEntity<?> getAbandonedCarts(
            @RequestParam(defaultValue = "60") int minAgeMinutes,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        List<Map<String, Object>> list = new ArrayList<>(store.getAbandonedCarts().values());
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", list);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", list.size());
        data.put("totalPages", 1);

        return buildResponse(true, "Eligible abandoned carts retrieved", data, HttpStatus.OK, "req_abandoned_carts_001");
    }

    // 16. POST /abandoned-carts/{cartId}/recovery-drafts
    @PostMapping("/abandoned-carts/{cartId}/recovery-drafts")
    public ResponseEntity<?> createRecoveryDraft(@PathVariable String cartId, @RequestBody Map<String, Object> body) {
        Map<String, Object> cart = store.getAbandonedCarts().get(cartId);
        if (cart == null) {
            return buildResponse(false, "Abandoned cart not found: " + cartId, null, HttpStatus.NOT_FOUND, "req_draft_err");
        }
        String draftId = "recovery_draft_" + (store.getRecoveryDrafts().size() + 1001);
        String channel = String.valueOf(body.getOrDefault("channel", "EMAIL"));

        Map<String, Object> draft = new LinkedHashMap<>();
        draft.put("draftId", draftId);
        draft.put("cartId", cartId);
        draft.put("status", "AWAITING_REVIEW");
        draft.put("channel", channel);
        draft.put("subject", "Your shopping cart is waiting");
        draft.put("content", "You left some items in your cart. Return to your cart to review your selection.");
        draft.put("requiresApproval", true);
        draft.put("createdAt", "2026-10-28T10:22:00+05:30");

        store.getRecoveryDrafts().put(draftId, draft);
        store.recordAuditEvent("RECOVERY_DRAFT_GENERATED", "AI_SALES", draftId, "AI generated abandoned-cart recovery draft for " + cartId);

        return buildResponse(true, "Recovery message draft generated", draft, HttpStatus.CREATED, "req_recovery_draft_001");
    }

    // 17. POST /recovery-drafts/{draftId}/approve
    @PostMapping("/recovery-drafts/{draftId}/approve")
    public ResponseEntity<?> approveRecoveryDraft(@PathVariable String draftId, @RequestBody Map<String, Object> body) {
        Map<String, Object> draft = store.getRecoveryDrafts().get(draftId);
        if (draft == null) {
            return buildResponse(false, "Recovery draft not found: " + draftId, null, HttpStatus.NOT_FOUND, "req_rec_appr_err");
        }
        draft.put("status", "APPROVED");
        draft.put("approvedBy", "usr_1001");
        draft.put("approvalComment", body.getOrDefault("reviewComment", "Approved"));
        store.recordAuditEvent("RECOVERY_DRAFT_APPROVED", "SALES_MANAGER", draftId, "Recovery draft approved");

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("draftId", draftId);
        data.put("status", "APPROVED");
        data.put("approvedBy", "usr_1001");

        return buildResponse(true, "Recovery draft approved", data, HttpStatus.OK, "req_recovery_approve_001");
    }

    // 18. POST /recovery-drafts/{draftId}/send
    @PostMapping("/recovery-drafts/{draftId}/send")
    public ResponseEntity<?> sendRecoveryDraft(
            @PathVariable String draftId,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @RequestBody(required = false) Map<String, Object> body
    ) {
        Map<String, Object> draft = store.getRecoveryDrafts().get(draftId);
        if (draft == null) {
            return buildResponse(false, "Recovery draft not found: " + draftId, null, HttpStatus.NOT_FOUND, "req_rec_send_err");
        }
        if (!"APPROVED".equals(draft.get("status"))) {
            return buildResponse(false, "Draft must be approved before sending", null, HttpStatus.UNPROCESSABLE_ENTITY, "req_rec_send_err");
        }
        draft.put("status", "QUEUED");
        String execId = "recovery_exec_" + UUID.randomUUID().toString().substring(0, 8);
        draft.put("executionId", execId);
        store.recordAuditEvent("RECOVERY_MESSAGE_QUEUED", "SALES_MANAGER", draftId, "Recovery message queued for delivery: " + execId);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("draftId", draftId);
        data.put("executionId", execId);
        data.put("status", "QUEUED");

        return buildResponse(true, "Recovery message queued for delivery", data, HttpStatus.ACCEPTED, "req_recovery_send_001");
    }

    // 19. GET /sales-follow-ups
    @GetMapping("/sales-follow-ups")
    public ResponseEntity<?> listSalesFollowUps(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        List<Map<String, Object>> list = new ArrayList<>(store.getSalesFollowUps().values());
        if (status != null && !status.isEmpty()) {
            list = list.stream().filter(f -> status.equalsIgnoreCase(String.valueOf(f.get("status")))).collect(Collectors.toList());
        }

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", list);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", list.size());
        data.put("totalPages", 1);

        return buildResponse(true, "Sales follow-ups retrieved successfully", data, HttpStatus.OK, "req_sales_fu_001");
    }

    // 20. POST /sales-follow-ups
    @PostMapping("/sales-follow-ups")
    public ResponseEntity<?> createSalesFollowUp(@RequestBody Map<String, Object> body) {
        String taskId = "s_fu_" + (store.getSalesFollowUps().size() + 1001);
        Map<String, Object> task = new LinkedHashMap<>(body);
        task.put("taskId", taskId);
        task.put("status", body.getOrDefault("status", "PENDING"));
        task.put("createdAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

        store.getSalesFollowUps().put(taskId, task);
        store.recordAuditEvent("SALES_FOLLOWUP_CREATED", "SALES_MANAGER", taskId, "Created sales follow-up task");

        return buildResponse(true, "Sales follow-up created", task, HttpStatus.CREATED, "req_sales_fu_create_001");
    }

    // 21. PATCH /sales-follow-ups/{taskId}
    @PatchMapping("/sales-follow-ups/{taskId}")
    public ResponseEntity<?> updateSalesFollowUp(@PathVariable String taskId, @RequestBody Map<String, Object> body) {
        Map<String, Object> task = store.getSalesFollowUps().get(taskId);
        if (task == null) {
            return buildResponse(false, "Follow-up task not found: " + taskId, null, HttpStatus.NOT_FOUND, "req_sales_fu_err");
        }
        task.putAll(body);
        task.put("updatedAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        store.recordAuditEvent("SALES_FOLLOWUP_UPDATED", "SALES_MANAGER", taskId, "Updated follow-up task status to " + task.get("status"));

        return buildResponse(true, "Sales follow-up updated", task, HttpStatus.OK, "req_sales_fu_update_001");
    }

    // 22. GET /ai-sales/config
    @GetMapping("/ai-sales/config")
    public ResponseEntity<?> getAiSalesConfig() {
        Map<String, Object> config = store.getAiSalesConfig().get("config");
        return buildResponse(true, "AI Sales configuration retrieved", config, HttpStatus.OK, "req_ai_sales_config_001");
    }

    // 23. PATCH /ai-sales/config
    @PatchMapping("/ai-sales/config")
    public ResponseEntity<?> updateAiSalesConfig(@RequestBody Map<String, Object> body) {
        Map<String, Object> config = store.getAiSalesConfig().get("config");
        if (config == null) {
            config = new LinkedHashMap<>();
            store.getAiSalesConfig().put("config", config);
        }
        config.putAll(body);
        store.recordAuditEvent("AI_SALES_CONFIG_UPDATED", "SALES_MANAGER", "ai_sales_001", "Updated AI Sales agent parameters");

        return buildResponse(true, "AI Sales configuration updated", config, HttpStatus.OK, "req_ai_sales_config_002");
    }

    // 24. GET /ai-sales/activity
    @GetMapping("/ai-sales/activity")
    public ResponseEntity<?> getAiSalesActivity() {
        List<Map<String, Object>> activities = store.getAiSalesActivity();
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("content", activities);
        data.put("totalElements", activities.size());

        return buildResponse(true, "AI Sales activity retrieved", data, HttpStatus.OK, "req_ai_sales_activity_001");
    }

    // 25. GET /team/performance
    @GetMapping("/team/performance")
    public ResponseEntity<?> getTeamPerformance() {
        List<Map<String, Object>> team = new ArrayList<>();
        team.add(EcommerceDataStore.createMap(
                "memberId", "usr_1001",
                "name", "Arun Kumar",
                "role", "SALES_MANAGER",
                "campaignsManaged", 4,
                "revenueInfluenced", 450000.00,
                "leadsConverted", 28,
                "followUpsCompleted", 52
        ));
        team.add(EcommerceDataStore.createMap(
                "memberId", "usr_1002",
                "name", "Deepa Mehta",
                "role", "SALES_SPECIALIST",
                "campaignsManaged", 2,
                "revenueInfluenced", 280000.00,
                "leadsConverted", 19,
                "followUpsCompleted", 41
        ));

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("teamMembers", team);
        data.put("totalTeamMembers", team.size());

        return buildResponse(true, "Sales team metrics retrieved", data, HttpStatus.OK, "req_team_perf_001");
    }

    // 26. GET /reports
    @GetMapping("/reports")
    public ResponseEntity<?> listReports() {
        List<Map<String, Object>> reports = new ArrayList<>();
        reports.add(EcommerceDataStore.createMap("reportType", "SALES_PERFORMANCE", "title", "Sales Performance & Net Revenue", "formats", List.of("CSV", "PDF")));
        reports.add(EcommerceDataStore.createMap("reportType", "PRODUCT_PERFORMANCE", "title", "Product Velocity & Conversion Rate", "formats", List.of("CSV", "PDF")));
        reports.add(EcommerceDataStore.createMap("reportType", "ABANDONED_CART_RECOVERY", "title", "Abandoned Cart & Recovery Funnel", "formats", List.of("CSV")));
        reports.add(EcommerceDataStore.createMap("reportType", "CAMPAIGN_ROI", "title", "Promotional Campaigns & ROI Analysis", "formats", List.of("CSV", "PDF")));

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("availableReports", reports);

        return buildResponse(true, "Available sales reports retrieved", data, HttpStatus.OK, "req_sales_reports_001");
    }

    // 27. POST /reports/export
    @PostMapping("/reports/export")
    public ResponseEntity<?> exportReport(@RequestBody Map<String, Object> body) {
        String exportId = "export_" + UUID.randomUUID().toString().substring(0, 8);
        String reportType = String.valueOf(body.getOrDefault("reportType", "SALES_PERFORMANCE"));
        String format = String.valueOf(body.getOrDefault("format", "CSV"));

        Map<String, Object> job = new LinkedHashMap<>();
        job.put("exportId", exportId);
        job.put("reportType", reportType);
        job.put("format", format);
        job.put("status", "QUEUED");
        job.put("requestedAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        job.put("downloadUrl", "http://localhost:8080/api/v1/ecommerce/sales-manager/reports/downloads/" + exportId);

        store.getExportJobs().put(exportId, job);
        store.recordAuditEvent("REPORT_EXPORT_QUEUED", "SALES_MANAGER", exportId, "Report queued: " + reportType);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("exportId", exportId);
        data.put("status", "QUEUED");
        data.put("format", format);

        return buildResponse(true, "Sales report export queued", data, HttpStatus.ACCEPTED, "req_sales_export_001");
    }
}
