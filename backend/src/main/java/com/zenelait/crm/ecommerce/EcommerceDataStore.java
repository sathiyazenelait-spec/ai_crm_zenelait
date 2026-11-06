package com.zenelait.crm.ecommerce;

import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Zenelait AI CRM — E-Commerce Company Tenant Shared Data Store
 * Coordinates shared records across Sales Manager, Customer Support Manager,
 * Support Agent, and Order Manager modules.
 *
 * All four modules share authoritative data for:
 * - Customers, Products, Inventory, Warehouses
 * - Orders, Order Items, Payments, Fulfilment, Shipments
 * - Cancellation Requests, Return Requests, Refund Requests
 * - Support Tickets, Messages, Internal Notes, Escalations, Queues
 * - Sales Campaigns, Abandoned Carts, Recovery Drafts, AI Agents, Audit Events
 */
@Component
public class EcommerceDataStore {

    // 1. Products, Categories & Inventory
    private final Map<String, Map<String, Object>> products = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> categories = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> inventory = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> warehouses = new ConcurrentHashMap<>();

    // 2. Customers & Carts
    private final Map<String, Map<String, Object>> customers = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> customerSegments = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> abandonedCarts = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> recoveryDrafts = new ConcurrentHashMap<>();

    // 3. Orders, Fulfilments, Shipments & Payments
    private final Map<String, Map<String, Object>> orders = new ConcurrentHashMap<>();
    private final Map<String, List<Map<String, Object>>> orderItems = new ConcurrentHashMap<>();
    private final Map<String, List<Map<String, Object>>> orderHistory = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> paymentRecords = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> fulfilments = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> shipments = new ConcurrentHashMap<>();
    private final Map<String, List<Map<String, Object>>> trackingEvents = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> orderExceptions = new ConcurrentHashMap<>();

    // 4. Cancellations, Returns & Refunds
    private final Map<String, Map<String, Object>> cancellationRequests = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> returnRequests = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> refundRequests = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> refundExecutions = new ConcurrentHashMap<>();

    // 5. Customer Support (Tickets, Messages, Notes, Queues, Escalations, Follow-ups)
    private final Map<String, Map<String, Object>> supportTickets = new ConcurrentHashMap<>();
    private final Map<String, List<Map<String, Object>>> ticketMessages = new ConcurrentHashMap<>();
    private final Map<String, List<Map<String, Object>>> ticketNotes = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> supportQueues = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> supportAgents = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> supportEscalations = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> supportFollowUpTasks = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> followUpRules = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> aiReplyDrafts = new ConcurrentHashMap<>();

    // 6. Sales Management (Campaigns, Follow-ups, AI Sales)
    private final Map<String, Map<String, Object>> salesCampaigns = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> salesFollowUps = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> aiSalesConfig = new ConcurrentHashMap<>();
    private final List<Map<String, Object>> aiSalesActivity = Collections.synchronizedList(new ArrayList<>());

    // 7. AI Support & Knowledge Base
    private final Map<String, Map<String, Object>> aiSupportConfig = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> knowledgeArticles = new ConcurrentHashMap<>();

    // 8. Audit & Exports
    private final List<Map<String, Object>> auditEvents = Collections.synchronizedList(new ArrayList<>());
    private final Map<String, Map<String, Object>> exportJobs = new ConcurrentHashMap<>();

    // 9. AI Employees (AI Sales Agent, AI Support Agent, AI Order Agent)
    private final Map<String, Map<String, Object>> aiConversations = new ConcurrentHashMap<>();
    private final Map<String, List<Map<String, Object>>> aiConversationMessages = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> aiRecommendations = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> aiLeads = new ConcurrentHashMap<>();
    private final Map<String, List<Map<String, Object>>> aiLeadActivities = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> aiAutomationRuns = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> aiOrderConfig = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> aiOrderEnquiries = new ConcurrentHashMap<>();
    private final List<Map<String, Object>> aiFeedback = Collections.synchronizedList(new ArrayList<>());

    public EcommerceDataStore() {
        initSeedData();
    }

    private void initSeedData() {
        String ts = "2026-10-28T10:00:00+05:30";

        // Warehouses
        warehouses.put("warehouse_001", createMap(
                "warehouseId", "warehouse_001",
                "name", "Central Bengaluru Warehouse",
                "city", "Bengaluru",
                "state", "Karnataka",
                "status", "ACTIVE"
        ));
        warehouses.put("warehouse_002", createMap(
                "warehouseId", "warehouse_002",
                "name", "Mumbai Coastal Hub",
                "city", "Mumbai",
                "state", "Maharashtra",
                "status", "ACTIVE"
        ));

        // Products & Categories
        categories.put("cat_101", createMap("categoryId", "cat_101", "name", "Electronics & Gadgets", "unitsSold", 535, "netSales", 570000.00, "percentageContribution", 45.6));
        categories.put("cat_102", createMap("categoryId", "cat_102", "name", "Audio & Wearables", "unitsSold", 380, "netSales", 345000.00, "percentageContribution", 27.6));
        categories.put("cat_103", createMap("categoryId", "cat_103", "name", "Fashion & Lifestyle", "unitsSold", 420, "netSales", 225000.00, "percentageContribution", 18.0));

        products.put("prod_1001", createMap(
                "productId", "prod_1001",
                "productName", "Wireless Headphones",
                "sku", "SKU-HEADPHONE-ANC",
                "categoryId", "cat_102",
                "unitPrice", 4999.00,
                "currency", "INR",
                "unitsSold", 320,
                "grossSales", 320000.00,
                "refundAmount", 5000.00,
                "netSales", 315000.00,
                "conversionRate", 4.2
        ));
        products.put("prod_1002", createMap(
                "productId", "prod_1002",
                "productName", "Smart Watch Pro",
                "sku", "SKU-WATCH-PRO",
                "categoryId", "cat_101",
                "unitPrice", 6999.00,
                "currency", "INR",
                "unitsSold", 215,
                "grossSales", 258000.00,
                "refundAmount", 3000.00,
                "netSales", 255000.00,
                "conversionRate", 3.5
        ));

        // Inventory
        inventory.put("prod_1001_warehouse_001", createMap(
                "productId", "prod_1001",
                "warehouseId", "warehouse_001",
                "onHandQuantity", 150,
                "reservedQuantity", 25,
                "availableQuantity", 125,
                "lastUpdatedAt", ts
        ));
        inventory.put("prod_1002_warehouse_001", createMap(
                "productId", "prod_1002",
                "warehouseId", "warehouse_001",
                "onHandQuantity", 90,
                "reservedQuantity", 10,
                "availableQuantity", 80,
                "lastUpdatedAt", ts
        ));

        // Customers
        customers.put("cust_1001", createMap(
                "customerId", "cust_1001",
                "displayName", "Vikram Patel",
                "emailMasked", "v***@example.com",
                "phoneMasked", "+91 98****0001",
                "segment", "ELECTRONICS_ENTHUSIASTS",
                "totalOrders", 4,
                "totalSpent", 18500.00,
                "status", "ACTIVE"
        ));
        customers.put("cust_2001", createMap(
                "customerId", "cust_2001",
                "displayName", "Meera Nair",
                "emailMasked", "m***@example.com",
                "phoneMasked", "+91 98****2233",
                "segment", "HIGH_VALUE_VIPS",
                "totalOrders", 8,
                "totalSpent", 42000.00,
                "status", "ACTIVE"
        ));
        customers.put("cust_3001", createMap(
                "customerId", "cust_3001",
                "displayName", "Customer A",
                "emailMasked", "c***@example.com",
                "phoneMasked", "+91 98****4455",
                "segment", "STANDARD",
                "totalOrders", 2,
                "totalSpent", 7498.00,
                "status", "ACTIVE"
        ));

        customerSegments.put("segment_electronics_customers", createMap(
                "segmentId", "segment_electronics_customers",
                "name", "Electronics Enthusiasts",
                "customerCount", 1240,
                "description", "Shoppers with 2+ purchases in electronics category"
        ));
        customerSegments.put("segment_high_value_vips", createMap(
                "segmentId", "segment_high_value_vips",
                "name", "High-Value VIPs",
                "customerCount", 480,
                "description", "Customers with lifetime spend over INR 25,000"
        ));

        // Abandoned Carts
        abandonedCarts.put("cart_1001", createMap(
                "cartId", "cart_1001",
                "customerReference", "cust_1001",
                "itemCount", 2,
                "cartValue", 5499.00,
                "currency", "INR",
                "abandonedAt", "2026-10-28T08:00:00+05:30",
                "recoveryEligible", true,
                "previousRecoveryAttempts", 0
        ));
        abandonedCarts.put("cart_1002", createMap(
                "cartId", "cart_1002",
                "customerReference", "cust_3001",
                "itemCount", 1,
                "cartValue", 6999.00,
                "currency", "INR",
                "abandonedAt", "2026-10-28T07:15:00+05:30",
                "recoveryEligible", true,
                "previousRecoveryAttempts", 1
        ));

        // Orders
        orders.put("ord_2001", createMap(
                "orderId", "ord_2001",
                "orderNumber", "ORD-2026-2001",
                "customerReference", "cust_2001",
                "orderStatus", "SHIPPED",
                "paymentStatus", "PAID",
                "fulfilmentStatus", "SHIPPED",
                "trackingStatus", "IN_TRANSIT",
                "carrier", "Example Express",
                "estimatedDeliveryDate", "2026-10-29",
                "currency", "INR",
                "subtotal", 2499.00,
                "discountAmount", 0.00,
                "shippingAmount", 0.00,
                "totalAmount", 2499.00,
                "createdAt", "2026-10-27T14:30:00+05:30"
        ));
        orders.put("ord_3001", createMap(
                "orderId", "ord_3001",
                "orderNumber", "ORD-2026-3001",
                "customerReference", "cust_3001",
                "orderStatus", "CONFIRMED",
                "paymentStatus", "PAID",
                "fulfilmentStatus", "PENDING",
                "currency", "INR",
                "subtotal", 4999.00,
                "discountAmount", 0.00,
                "shippingAmount", 0.00,
                "totalAmount", 4999.00,
                "createdAt", "2026-10-28T09:30:00+05:30"
        ));
        orders.put("ord_3002", createMap(
                "orderId", "ord_3002",
                "orderNumber", "ORD-2026-3002",
                "customerReference", "cust_1001",
                "orderStatus", "CONFIRMED",
                "paymentStatus", "PAID",
                "fulfilmentStatus", "PENDING",
                "currency", "INR",
                "subtotal", 3299.00,
                "discountAmount", 300.00,
                "shippingAmount", 0.00,
                "totalAmount", 2999.00,
                "createdAt", "2026-10-28T09:45:00+05:30"
        ));

        // Order Items
        orderItems.put("ord_3001", List.of(createMap(
                "orderItemId", "item_3001",
                "productId", "prod_1001",
                "productName", "Wireless Headphones",
                "quantity", 1,
                "unitPrice", 4999.00,
                "currency", "INR"
        )));
        orderItems.put("ord_2001", List.of(createMap(
                "orderItemId", "item_2001",
                "productId", "prod_1001",
                "productName", "Wireless Headphones",
                "quantity", 1,
                "unitPrice", 2499.00,
                "currency", "INR"
        )));

        // Payments
        paymentRecords.put("ord_3001", createMap(
                "orderId", "ord_3001",
                "paymentStatus", "PAID",
                "currency", "INR",
                "amountPaid", 4999.00,
                "amountRefunded", 0.00,
                "paymentProviderReference", "pay_ref_3001",
                "lastVerifiedAt", "2026-10-28T09:31:00+05:30"
        ));
        paymentRecords.put("ord_2001", createMap(
                "orderId", "ord_2001",
                "paymentStatus", "PAID",
                "currency", "INR",
                "amountPaid", 2499.00,
                "amountRefunded", 0.00,
                "paymentProviderReference", "pay_ref_2001",
                "lastVerifiedAt", "2026-10-27T14:32:00+05:30"
        ));

        // Fulfilments & Shipments
        fulfilments.put("ful_3001", createMap(
                "fulfilmentId", "ful_3001",
                "orderId", "ord_3001",
                "orderNumber", "ORD-2026-3001",
                "warehouseId", "warehouse_001",
                "status", "PENDING",
                "itemCount", 1,
                "createdAt", "2026-10-28T13:10:00+05:30"
        ));

        shipments.put("ship_3001", createMap(
                "shipmentId", "ship_3001",
                "orderId", "ord_3001",
                "carrierCode", "EXAMPLE_EXPRESS",
                "carrier", "Example Express",
                "trackingNumber", "TRK30010001",
                "status", "IN_TRANSIT",
                "estimatedDeliveryDate", "2026-10-29",
                "lastTrackingUpdate", "2026-10-28T12:45:00+05:30"
        ));

        List<Map<String, Object>> trkEvents = new ArrayList<>();
        trkEvents.add(createMap("status", "PICKED_UP", "description", "Parcel collected by carrier", "eventAt", "2026-10-28T10:00:00+05:30"));
        trkEvents.add(createMap("status", "IN_TRANSIT", "description", "Parcel moving through the carrier network", "eventAt", "2026-10-28T12:45:00+05:30"));
        trackingEvents.put("ship_3001", trkEvents);

        // Cancellations, Returns & Refunds
        cancellationRequests.put("cancel_req_3001", createMap(
                "requestId", "cancel_req_3001",
                "orderId", "ord_3002",
                "orderNumber", "ORD-2026-3002",
                "reason", "CUSTOMER_REQUEST",
                "orderStatus", "CONFIRMED",
                "fulfilmentStatus", "PENDING",
                "status", "PENDING_REVIEW",
                "createdAt", "2026-10-28T12:30:00+05:30"
        ));

        returnRequests.put("return_req_3001", createMap(
                "returnRequestId", "return_req_3001",
                "orderId", "ord_3001",
                "orderNumber", "ORD-2026-3001",
                "reason", "DAMAGED_ITEM",
                "status", "PENDING_REVIEW",
                "requestedItemCount", 1,
                "createdAt", "2026-10-28T12:20:00+05:30"
        ));

        refundRequests.put("refund_req_3001", createMap(
                "refundRequestId", "refund_req_3001",
                "orderId", "ord_3001",
                "orderNumber", "ORD-2026-3001",
                "requestedAmount", 4999.00,
                "currency", "INR",
                "reason", "DAMAGED_ITEM",
                "status", "PENDING_REVIEW",
                "createdAt", "2026-10-28T13:45:00+05:30"
        ));

        // Order Exceptions
        orderExceptions.put("exc_1001", createMap(
                "exceptionId", "exc_1001",
                "orderId", "ord_3001",
                "exceptionType", "ADDRESS_INCOMPLETE",
                "severity", "HIGH",
                "status", "OPEN",
                "description", "Apartment number missing in delivery address",
                "createdAt", ts
        ));

        // Support Queues
        supportQueues.put("queue_orders", createMap("queueId", "queue_orders", "name", "Order Management Queue", "activeTickets", 18, "status", "ACTIVE"));
        supportQueues.put("queue_delivery", createMap("queueId", "queue_delivery", "name", "Delivery & Logistics Queue", "activeTickets", 12, "status", "ACTIVE"));
        supportQueues.put("queue_returns", createMap("queueId", "queue_returns", "name", "Returns & Refunds Queue", "activeTickets", 8, "status", "ACTIVE"));

        // Support Agents
        supportAgents.put("usr_support_101", createMap(
                "agentId", "usr_support_101",
                "name", "Priya S",
                "email", "priya@shop.example",
                "status", "ACTIVE",
                "assignedOpenTickets", 18,
                "resolvedTicketsThisMonth", 120
        ));
        supportAgents.put("usr_support_102", createMap(
                "agentId", "usr_support_102",
                "name", "Kumar R",
                "email", "kumar@shop.example",
                "status", "ACTIVE",
                "assignedOpenTickets", 12,
                "resolvedTicketsThisMonth", 105
        ));

        // Support Tickets
        supportTickets.put("ticket_1001", createMap(
                "ticketId", "ticket_1001",
                "ticketNumber", "SUP-1001",
                "subject", "Order delivery delay",
                "category", "DELIVERY",
                "priority", "HIGH",
                "status", "OPEN",
                "assignedAgentId", "usr_support_101",
                "createdAt", "2026-10-28T09:00:00+05:30",
                "slaStatus", "AT_RISK"
        ));
        supportTickets.put("ticket_2001", createMap(
                "ticketId", "ticket_2001",
                "ticketNumber", "SUP-2001",
                "subject", "Where is my order?",
                "category", "ORDER_TRACKING",
                "priority", "NORMAL",
                "status", "OPEN",
                "customerReference", "cust_2001",
                "orderReference", "ORD-2026-2001",
                "assignedAgentId", "usr_support_101",
                "assignedToMe", true,
                "createdAt", "2026-10-28T09:30:00+05:30",
                "slaStatus", "ON_TRACK"
        ));

        // Support Messages
        ticketMessages.put("ticket_2001", new ArrayList<>(List.of(createMap(
                "messageId", "msg_1001",
                "ticketId", "ticket_2001",
                "senderType", "CUSTOMER",
                "content", "Hi, my package was supposed to arrive yesterday. Can you check?",
                "createdAt", "2026-10-28T09:30:00+05:30"
        ))));

        ticketNotes.put("ticket_2001", new ArrayList<>(List.of(createMap(
                "noteId", "note_2001",
                "ticketId", "ticket_2001",
                "visibility", "INTERNAL",
                "content", "Checked shipping status with carrier Example Express. Next delivery attempt scheduled for tomorrow.",
                "createdBy", "usr_support_101",
                "createdAt", "2026-10-28T12:15:00+05:30"
        ))));

        // Escalations
        supportEscalations.put("esc_1001", createMap(
                "escalationId", "esc_1001",
                "ticketId", "ticket_1001",
                "targetTeam", "ORDER_OPERATIONS",
                "reason", "Shipment tracking requires investigation",
                "status", "OPEN",
                "priority", "HIGH",
                "createdAt", "2026-10-28T11:18:00+05:30"
        ));

        // Follow Up Tasks
        supportFollowUpTasks.put("followup_2001", createMap(
                "taskId", "followup_2001",
                "ticketId", "ticket_2001",
                "title", "Check carrier update",
                "status", "OPEN",
                "dueAt", "2026-10-29T10:00:00+05:30",
                "createdAt", "2026-10-28T12:35:00+05:30"
        ));

        // Knowledge Base
        knowledgeArticles.put("kb_1001", createMap(
                "articleId", "kb_1001",
                "title", "How to track an order",
                "category", "ORDER_TRACKING",
                "content", "Customers can view shipment updates through the authorized order-tracking page.",
                "language", "en",
                "status", "PUBLISHED",
                "version", 1,
                "publishedAt", "2026-10-28T11:30:00+05:30"
        ));
        knowledgeArticles.put("kb_1002", createMap(
                "articleId", "kb_1002",
                "title", "Return & Refund Policy Guidelines",
                "category", "RETURNS_REFUNDS",
                "content", "Items can be returned within 7 days of delivery in original condition.",
                "language", "en",
                "status", "PUBLISHED",
                "version", 2,
                "publishedAt", "2026-10-20T10:00:00+05:30"
        ));

        // Follow Up Rules
        followUpRules.put("rule_01", createMap(
                "ruleId", "rule_01",
                "name", "Awaiting Customer 48H Reminder",
                "triggerCondition", "TICKET_AWAITING_CUSTOMER_48H",
                "action", "SEND_EMAIL_REMINDER",
                "status", "ACTIVE"
        ));

        // Campaigns
        salesCampaigns.put("camp_1001", createMap(
                "campaignId", "camp_1001",
                "name", "October Electronics Promotion",
                "campaignType", "DISCOUNT",
                "channel", "EMAIL",
                "audienceSegmentId", "segment_electronics_customers",
                "status", "DRAFT",
                "approvalStatus", "PENDING",
                "budget", 25000.00,
                "createdBy", "usr_1001",
                "createdAt", "2026-10-28T10:10:00+05:30"
        ));

        // Recovery Drafts
        recoveryDrafts.put("recovery_draft_1001", createMap(
                "draftId", "recovery_draft_1001",
                "cartId", "cart_1001",
                "status", "AWAITING_REVIEW",
                "channel", "EMAIL",
                "subject", "Your shopping cart is waiting",
                "content", "You left some items in your cart. Return to your cart to review your selection.",
                "requiresApproval", true,
                "createdAt", "2026-10-28T10:22:00+05:30"
        ));

        // Sales Follow-ups
        salesFollowUps.put("s_fu_1001", createMap(
                "taskId", "s_fu_1001",
                "customerId", "cust_1001",
                "title", "Follow up on high-value cart",
                "priority", "HIGH",
                "status", "PENDING",
                "dueAt", "2026-10-29T12:00:00+05:30",
                "assignedTo", "usr_1001"
        ));

        // AI Sales Config
        aiSalesConfig.put("config", createMap(
                "agentId", "ai_sales_001",
                "name", "Zenelait E-Commerce Sales AI",
                "status", "ACTIVE",
                "leadQualificationEnabled", true,
                "abandonedCartRecoveryEnabled", true,
                "automaticDiscountsEnabled", false,
                "requireApprovalForPromotionalMessages", true,
                "maxRecoveryAttempts", 2,
                "approvedChannels", List.of("EMAIL", "WEBSITE_CHAT")
        ));

        aiSalesActivity.add(createMap(
                "eventId", "evt_sales_101",
                "eventType", "ABANDONED_CART_DETECTED",
                "cartId", "cart_1001",
                "action", "RECOVERY_DRAFT_GENERATED",
                "outcome", "AWAITING_REVIEW",
                "timestamp", "2026-10-28T10:22:00+05:30"
        ));

        // AI Support Config
        aiSupportConfig.put("config", createMap(
                "agentId", "ai_support_001",
                "name", "Zenelait E-Commerce Support AI",
                "status", "ACTIVE",
                "supportedChannels", List.of("WEBSITE_CHAT", "EMAIL"),
                "approvedKnowledgeOnly", true,
                "automaticReplyEnabled", false,
                "humanApprovalRequiredForRefundAdvice", true,
                "automaticTicketClassification", true,
                "automaticEscalationEnabled", true
        ));

        // AI Order Agent Config
        aiOrderConfig.put("config", createMap(
                "agentId", "ai_order_001",
                "name", "Zenelait E-Commerce Order AI",
                "status", "ACTIVE",
                "requireHumanApprovalForCancellation", true,
                "requireHumanApprovalForReturn", true,
                "allowAutomatedTrackingEnquiries", true,
                "allowAutomatedCancellationCheck", true,
                "allowAutomatedReturnCheck", true
        ));

        // Seed an AI Sales Conversation
        aiConversations.put("conv_1001", createMap(
                "conversationId", "conv_1001",
                "customerId", "cust_1001",
                "channel", "WEBSITE_CHAT",
                "status", "OPEN",
                "agentType", "AI_SALES_AGENT",
                "humanHandoffRequired", false,
                "createdAt", "2026-10-28T10:30:00+05:30"
        ));
        aiConversationMessages.put("conv_1001", new ArrayList<>(List.of(
                createMap("messageId", "msg_101", "sender", "CUSTOMER", "content", "I need a laptop under 60000 for office work", "createdAt", "2026-10-28T10:30:00+05:30"),
                createMap("messageId", "msg_102", "sender", "AI_SALES_AGENT", "content", "I found two products in your budget: Business Laptop A (₹54,999) and Business Laptop B (₹58,999).", "createdAt", "2026-10-28T10:30:15+05:30")
        )));

        // Seed an AI Support Conversation
        aiConversations.put("conv_support_1001", createMap(
                "conversationId", "conv_support_1001",
                "customerId", "cust_1001",
                "channel", "WEBSITE_CHAT",
                "status", "OPEN",
                "agentType", "AI_SUPPORT_AGENT",
                "category", "RETURNS",
                "humanHandoffRequired", false,
                "createdAt", "2026-10-28T10:45:00+05:30"
        ));
        aiConversationMessages.put("conv_support_1001", new ArrayList<>(List.of(
                createMap("messageId", "msg_supp_101", "sender", "CUSTOMER", "content", "How can I return a damaged product?", "createdAt", "2026-10-28T10:45:00+05:30"),
                createMap("messageId", "msg_supp_102", "sender", "AI_SUPPORT_AGENT", "content", "I can help you with the return process. Please provide or confirm your order number so I can check your return eligibility.", "createdAt", "2026-10-28T10:45:10+05:30")
        )));

        // Seed AI Lead
        aiLeads.put("lead_1001", createMap(
                "leadId", "lead_1001",
                "name", "Raj Kumar",
                "email", "raj@example.com",
                "phone", "+919876543210",
                "source", "WEBSITE_CHAT",
                "status", "NEW",
                "qualificationStatus", "QUALIFIED",
                "purchaseIntent", "HIGH",
                "budget", 60000.0,
                "currency", "INR",
                "interest", "Business Laptop",
                "createdAt", "2026-10-28T10:35:00+05:30"
        ));

        // Seed Automation Run
        aiAutomationRuns.put("run_1001", createMap(
                "runId", "run_1001",
                "agentType", "AI_SALES_AGENT",
                "workflow", "ABANDONED_CART_RECOVERY",
                "status", "COMPLETED",
                "targetEntityId", "cart_1001",
                "startTime", "2026-10-28T10:22:00+05:30",
                "endTime", "2026-10-28T10:22:05+05:30",
                "result", "RECOVERY_DRAFT_GENERATED"
        ));

        // Audit Events
        recordAuditEvent("ECOMMERCE_DATASTORE_INIT", "SYSTEM", "SYS", "E-commerce data store initialized with 4-role unified architecture and 3 AI employees");
    }

    public synchronized void recordAuditEvent(String eventType, String actorRole, String resourceId, String details) {
        Map<String, Object> event = new LinkedHashMap<>();
        event.put("eventId", "aud_ec_" + UUID.randomUUID().toString().substring(0, 8));
        event.put("eventType", eventType);
        event.put("actorRole", actorRole);
        event.put("resourceId", resourceId);
        event.put("details", details);
        event.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        auditEvents.add(0, event);
    }

    // Getters for maps and collections
    public Map<String, Map<String, Object>> getProducts() { return products; }
    public Map<String, Map<String, Object>> getCategories() { return categories; }
    public Map<String, Map<String, Object>> getInventory() { return inventory; }
    public Map<String, Map<String, Object>> getWarehouses() { return warehouses; }
    public Map<String, Map<String, Object>> getCustomers() { return customers; }
    public Map<String, Map<String, Object>> getCustomerSegments() { return customerSegments; }
    public Map<String, Map<String, Object>> getAbandonedCarts() { return abandonedCarts; }
    public Map<String, Map<String, Object>> getRecoveryDrafts() { return recoveryDrafts; }
    public Map<String, Map<String, Object>> getOrders() { return orders; }
    public Map<String, List<Map<String, Object>>> getOrderItems() { return orderItems; }
    public Map<String, List<Map<String, Object>>> getOrderHistory() { return orderHistory; }
    public Map<String, Map<String, Object>> getPaymentRecords() { return paymentRecords; }
    public Map<String, Map<String, Object>> getFulfilments() { return fulfilments; }
    public Map<String, Map<String, Object>> getShipments() { return shipments; }
    public Map<String, List<Map<String, Object>>> getTrackingEvents() { return trackingEvents; }
    public Map<String, Map<String, Object>> getOrderExceptions() { return orderExceptions; }
    public Map<String, Map<String, Object>> getCancellationRequests() { return cancellationRequests; }
    public Map<String, Map<String, Object>> getReturnRequests() { return returnRequests; }
    public Map<String, Map<String, Object>> getRefundRequests() { return refundRequests; }
    public Map<String, Map<String, Object>> getRefundExecutions() { return refundExecutions; }
    public Map<String, Map<String, Object>> getSupportTickets() { return supportTickets; }
    public Map<String, List<Map<String, Object>>> getTicketMessages() { return ticketMessages; }
    public Map<String, List<Map<String, Object>>> getTicketNotes() { return ticketNotes; }
    public Map<String, Map<String, Object>> getSupportQueues() { return supportQueues; }
    public Map<String, Map<String, Object>> getSupportAgents() { return supportAgents; }
    public Map<String, Map<String, Object>> getSupportEscalations() { return supportEscalations; }
    public Map<String, Map<String, Object>> getSupportFollowUpTasks() { return supportFollowUpTasks; }
    public Map<String, Map<String, Object>> getFollowUpRules() { return followUpRules; }
    public Map<String, Map<String, Object>> getAiReplyDrafts() { return aiReplyDrafts; }
    public Map<String, Map<String, Object>> getSalesCampaigns() { return salesCampaigns; }
    public Map<String, Map<String, Object>> getSalesFollowUps() { return salesFollowUps; }
    public Map<String, Map<String, Object>> getAiSalesConfig() { return aiSalesConfig; }
    public List<Map<String, Object>> getAiSalesActivity() { return aiSalesActivity; }
    public Map<String, Map<String, Object>> getAiSupportConfig() { return aiSupportConfig; }
    public Map<String, Map<String, Object>> getKnowledgeArticles() { return knowledgeArticles; }
    public List<Map<String, Object>> getAuditEvents() { return auditEvents; }
    public Map<String, Map<String, Object>> getExportJobs() { return exportJobs; }
    public Map<String, Map<String, Object>> getAiConversations() { return aiConversations; }
    public Map<String, List<Map<String, Object>>> getAiConversationMessages() { return aiConversationMessages; }
    public Map<String, Map<String, Object>> getAiRecommendations() { return aiRecommendations; }
    public Map<String, Map<String, Object>> getAiLeads() { return aiLeads; }
    public Map<String, List<Map<String, Object>>> getAiLeadActivities() { return aiLeadActivities; }
    public Map<String, Map<String, Object>> getAiAutomationRuns() { return aiAutomationRuns; }
    public Map<String, Map<String, Object>> getAiOrderConfig() { return aiOrderConfig; }
    public Map<String, Map<String, Object>> getAiOrderEnquiries() { return aiOrderEnquiries; }
    public List<Map<String, Object>> getAiFeedback() { return aiFeedback; }

    @SafeVarargs
    public static Map<String, Object> createMap(Object... keyValues) {
        Map<String, Object> map = new LinkedHashMap<>();
        for (int i = 0; i < keyValues.length; i += 2) {
            if (i + 1 < keyValues.length) {
                map.put(String.valueOf(keyValues[i]), keyValues[i + 1]);
            }
        }
        return map;
    }
}
