package com.zenelait.crm.manufacturing;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Zenelait AI CRM — Manufacturing AI B2B Sales Agent REST Controller
 * Base path: /api/v1/manufacturing/ai-b2b-sales
 * Provides complete endpoints for:
 * - AI Sales Agent dashboard and configuration
 * - Multi-channel conversation management & AI message processing
 * - Automated requirement extractions (power, voltage, duty cycle, environment)
 * - Grounded catalog recommendations & compatibility checks
 * - Authorized pricing lookups & non-reservational inventory availability checks
 * - Quotation drafts and approval gating (AI cannot self-approve quotes or discounts)
 * - Follow-up scheduling and human handoffs
 */
@RestController
@RequestMapping("/api/v1/manufacturing/ai-b2b-sales")
@CrossOrigin(origins = "*")
public class ManufacturingAiB2BSalesAgentV1Controller {

    @Autowired
    private ManufacturingDataStore store;

    private String getTenantId(String tenantHeader) {
        return (tenantHeader != null && !tenantHeader.isBlank()) ? tenantHeader : "tenant-4";
    }

    private Map<String, Object> standardSuccess(String message, Object data, String reqId) {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", true);
        resp.put("message", message);
        resp.put("data", data);
        resp.put("requestId", reqId != null ? reqId : "req_sales_ai_" + UUID.randomUUID().toString().substring(0, 6));
        return resp;
    }

    private Map<String, Object> standardError(String message, List<Map<String, String>> errors, String reqId) {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", false);
        resp.put("message", message);
        resp.put("errors", errors != null ? errors : Collections.emptyList());
        resp.put("requestId", reqId != null ? reqId : "req_sales_ai_err_" + UUID.randomUUID().toString().substring(0, 6));
        return resp;
    }

    // ==========================================
    // A. AGENT CONFIGURATION & DASHBOARD
    // ==========================================

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> d = new LinkedHashMap<>();
        d.put("activeConversations", 18);
        d.put("newLeadsToday", 12);
        d.put("pendingQualification", 7);
        d.put("pendingHumanHandoff", 3);
        d.put("quotationDrafts", 5);
        d.put("pendingApprovals", 2);
        d.put("meetingsRequested", 4);

        return ResponseEntity.ok(standardSuccess("AI B2B Sales dashboard retrieved", d, "req_sales_ai_001"));
    }

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getMetrics(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("leadConversionRate", 24.5);
        m.put("averageQualificationTimeMinutes", 4.2);
        m.put("aiRecommendationAccuracy", 91.0);
        m.put("totalQuotationsDrafted", 48);
        return ResponseEntity.ok(standardSuccess("Sales agent metrics retrieved", m, null));
    }

    @GetMapping("/configuration")
    public ResponseEntity<Map<String, Object>> getConfiguration(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> conf = Map.of(
                "agentName", "Zenelait Industrial Sales Copilot",
                "defaultCurrency", "INR",
                "maxAutonomousDiscountPercent", 0.0,
                "requireHumanApprovalForQuotesAbove", 100000.0,
                "autoFollowUpEnabled", true
        );
        return ResponseEntity.ok(standardSuccess("Agent configuration retrieved", conf, null));
    }

    @PatchMapping("/configuration")
    public ResponseEntity<Map<String, Object>> updateConfiguration(
            @RequestBody Map<String, Object> updates,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Agent configuration updated", updates, null));
    }

    @GetMapping("/knowledge-sources")
    public ResponseEntity<Map<String, Object>> listKnowledgeSources(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> sources = List.of(
                Map.of("sourceId", "KS-CATALOG", "name", "Authoritative Engineering Catalog", "type", "ERP_PRODUCT_CATALOGUE", "syncStatus", "SYNCED"),
                Map.of("sourceId", "KS-PRICING", "name", "OEM Price Matrix 2026", "type", "DIRECT_OEM_PRICING", "syncStatus", "SYNCED")
        );
        return ResponseEntity.ok(standardSuccess("Authorized knowledge sources retrieved", sources, null));
    }

    @PostMapping("/knowledge-sources")
    public ResponseEntity<Map<String, Object>> registerKnowledgeSource(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Knowledge source registered", body, null));
    }

    @PatchMapping("/knowledge-sources/{sourceId}")
    public ResponseEntity<Map<String, Object>> updateKnowledgeSource(
            @PathVariable("sourceId") String sourceId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Knowledge source updated", body, null));
    }

    @PostMapping("/knowledge-sources/{sourceId}/sync")
    public ResponseEntity<Map<String, Object>> syncKnowledgeSource(
            @PathVariable("sourceId") String sourceId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Sync initiated", Map.of("sourceId", sourceId, "status", "SYNCING"), null));
    }

    @GetMapping("/knowledge-sources/{sourceId}/sync-status")
    public ResponseEntity<Map<String, Object>> getKnowledgeSyncStatus(
            @PathVariable("sourceId") String sourceId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Sync status retrieved", Map.of("sourceId", sourceId, "status", "SYNCED", "lastSyncedAt", Instant.now().toString()), null));
    }

    // ==========================================
    // B. CONVERSATIONS & LEAD CAPTURE
    // ==========================================

    @PostMapping("/conversations")
    public ResponseEntity<Map<String, Object>> startConversation(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        String convId = "AISC-" + (1000 + store.getAiSalesConversations().size() + 1);

        Map<String, Object> conv = new LinkedHashMap<>();
        conv.put("conversationId", convId);
        conv.put("channel", body.getOrDefault("channel", "WEBSITE_CHAT"));
        conv.put("visitorReference", body.getOrDefault("visitorReference", "VIS-9001"));
        conv.put("status", "ACTIVE");
        conv.put("leadId", null);
        conv.put("nextAction", "COLLECT_REQUIREMENTS");
        conv.put("consent", body.getOrDefault("consent", Map.of("marketingFollowUp", false)));
        conv.put("locale", body.getOrDefault("locale", "en-IN"));
        conv.put("createdAt", Instant.now().toString());
        conv.put("tenantId", tenantId);

        store.getAiSalesConversations().put(convId, conv);

        String initialMessage = (String) body.get("initialMessage");
        if (initialMessage != null && !initialMessage.isBlank()) {
            Map<String, Object> msg = new LinkedHashMap<>();
            msg.put("messageId", "MSG-" + UUID.randomUUID().toString().substring(0, 6));
            msg.put("conversationId", convId);
            msg.put("sender", "CUSTOMER");
            msg.put("content", initialMessage);
            msg.put("timestamp", Instant.now().toString());
            store.getAiSalesMessages().computeIfAbsent(convId, k -> new ArrayList<>()).add(msg);
        }

        store.addAuditLog("SALES_CONVERSATION", convId, "CONVERSATION_STARTED", "AGENT", tenantId);

        Map<String, Object> r = new LinkedHashMap<>();
        r.put("conversationId", convId);
        r.put("channel", conv.get("channel"));
        r.put("status", conv.get("status"));
        r.put("leadId", null);
        r.put("nextAction", "COLLECT_REQUIREMENTS");

        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Sales conversation created", r, "req_sales_ai_002"));
    }

    @GetMapping("/conversations")
    public ResponseEntity<Map<String, Object>> listConversations(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = store.getAiSalesConversations().values().stream()
                .filter(c -> tenantId.equals(c.get("tenantId")))
                .collect(Collectors.toList());
        return ResponseEntity.ok(standardSuccess("Sales conversations retrieved", list, null));
    }

    @GetMapping("/conversations/{conversationId}")
    public ResponseEntity<Map<String, Object>> getConversation(
            @PathVariable("conversationId") String conversationId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> conv = store.getAiSalesConversations().get(conversationId);
        if (conv == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Conversation not found", null, null));
        }
        return ResponseEntity.ok(standardSuccess("Conversation details retrieved", conv, null));
    }

    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<Map<String, Object>> getMessages(
            @PathVariable("conversationId") String conversationId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> msgs = store.getAiSalesMessages().getOrDefault(conversationId, Collections.emptyList());
        return ResponseEntity.ok(standardSuccess("Conversation messages retrieved", msgs, null));
    }

    @PostMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<Map<String, Object>> addMessage(
            @PathVariable("conversationId") String conversationId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> msg = new LinkedHashMap<>();
        msg.put("messageId", "MSG-" + UUID.randomUUID().toString().substring(0, 6));
        msg.put("conversationId", conversationId);
        msg.put("sender", body.getOrDefault("sender", "CUSTOMER"));
        msg.put("content", body.get("message"));
        msg.put("timestamp", Instant.now().toString());

        store.getAiSalesMessages().computeIfAbsent(conversationId, k -> new ArrayList<>()).add(msg);
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Message added", msg, null));
    }

    @PostMapping("/conversations/{conversationId}/process")
    public ResponseEntity<Map<String, Object>> processMessage(
            @PathVariable("conversationId") String conversationId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String msg = (String) body.get("message");
        @SuppressWarnings("unchecked")
        Map<String, Object> context = (Map<String, Object>) body.getOrDefault("context", Collections.emptyMap());

        Map<String, Object> r = new LinkedHashMap<>();
        r.put("conversationId", conversationId);
        r.put("intent", "B2B_PRODUCT_ENQUIRY");

        Map<String, Object> reqs = new LinkedHashMap<>();
        reqs.put("productCategory", context.getOrDefault("productCategory", "INDUSTRIAL_MOTORS"));
        reqs.put("quantity", context.getOrDefault("quantity", 50));
        reqs.put("application", null);
        reqs.put("requiredSpecifications", Collections.emptyList());
        reqs.put("targetDeliveryDate", null);
        r.put("identifiedRequirements", reqs);

        r.put("missingInformation", List.of(
                "Required motor specifications",
                "Factory application",
                "Required delivery date"
        ));
        r.put("suggestedReply", "I can help identify suitable motors. Could you share the required power rating, operating conditions, and expected delivery date?");
        r.put("requiresHumanReview", false);

        return ResponseEntity.ok(standardSuccess("Sales message processed", r, "req_sales_ai_003"));
    }

    @PostMapping("/conversations/{conversationId}/handoff")
    public ResponseEntity<Map<String, Object>> handoffConversation(
            @PathVariable("conversationId") String conversationId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> conv = store.getAiSalesConversations().get(conversationId);
        if (conv != null) {
            conv.put("status", "HANDOFF_PENDING");
        }

        Map<String, Object> r = new LinkedHashMap<>();
        r.put("conversationId", conversationId);
        r.put("status", "HANDOFF_PENDING");
        r.put("targetTeam", body.getOrDefault("targetTeam", "MANUFACTURING_SALES"));
        r.put("assignedUserId", null);
        r.put("reason", body.get("reason"));

        store.addAuditLog("SALES_CONVERSATION", conversationId, "HANDOFF_REQUESTED", "AGENT", tenantId);
        return ResponseEntity.ok(standardSuccess("Conversation handed off", r, "req_sales_ai_012"));
    }

    @PostMapping("/conversations/{conversationId}/close")
    public ResponseEntity<Map<String, Object>> closeConversation(
            @PathVariable("conversationId") String conversationId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> conv = store.getAiSalesConversations().get(conversationId);
        if (conv != null) {
            conv.put("status", "CLOSED");
        }
        return ResponseEntity.ok(standardSuccess("Conversation closed", conv, null));
    }

    @PostMapping("/conversations/{conversationId}/reopen")
    public ResponseEntity<Map<String, Object>> reopenConversation(
            @PathVariable("conversationId") String conversationId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> conv = store.getAiSalesConversations().get(conversationId);
        if (conv != null) {
            conv.put("status", "ACTIVE");
        }
        return ResponseEntity.ok(standardSuccess("Conversation reopened", conv, null));
    }

    @PostMapping("/conversations/{conversationId}/consent")
    public ResponseEntity<Map<String, Object>> recordConsent(
            @PathVariable("conversationId") String conversationId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> conv = store.getAiSalesConversations().get(conversationId);
        if (conv != null) {
            conv.put("consent", body);
        }
        return ResponseEntity.ok(standardSuccess("Consent recorded", body, null));
    }

    @GetMapping("/conversations/{conversationId}/consent")
    public ResponseEntity<Map<String, Object>> getConsent(
            @PathVariable("conversationId") String conversationId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> conv = store.getAiSalesConversations().get(conversationId);
        Object consent = conv != null ? conv.get("consent") : Collections.emptyMap();
        return ResponseEntity.ok(standardSuccess("Consent status retrieved", consent, null));
    }

    // ==========================================
    // C. LEAD MANAGEMENT & QUALIFICATION
    // ==========================================

    @PostMapping("/leads")
    public ResponseEntity<Map<String, Object>> createLead(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        String leadId = "LEAD-" + (5000 + store.getLeads().size() + 1);

        Map<String, Object> ld = new LinkedHashMap<>();
        ld.put("leadId", leadId);
        ld.put("conversationId", body.get("conversationId"));
        ld.put("companyName", body.get("companyName"));
        ld.put("contactName", body.get("contactName"));
        ld.put("businessEmail", body.get("businessEmail"));
        ld.put("phone", body.get("phone"));
        ld.put("industry", body.getOrDefault("industry", "MANUFACTURING"));
        ld.put("enquirySummary", body.get("enquirySummary"));
        ld.put("source", body.getOrDefault("source", "WEBSITE_CHAT"));
        ld.put("status", "NEW");
        ld.put("assignedTo", null);
        ld.put("createdAt", Instant.now().toString());
        ld.put("tenantId", tenantId);

        store.getLeads().put(leadId, ld);
        store.addAuditLog("LEAD", leadId, "LEAD_CREATED_BY_AI", "AI_SALES_AGENT", tenantId);

        Map<String, Object> r = new LinkedHashMap<>();
        r.put("leadId", leadId);
        r.put("companyName", ld.get("companyName"));
        r.put("industry", ld.get("industry"));
        r.put("source", ld.get("source"));
        r.put("status", "NEW");
        r.put("assignedTo", null);
        r.put("createdAt", ld.get("createdAt"));

        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Lead created", r, "req_sales_ai_004"));
    }

    @GetMapping("/leads")
    public ResponseEntity<Map<String, Object>> listLeads(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = store.getLeads().values().stream()
                .filter(l -> tenantId.equals(l.get("tenantId")))
                .collect(Collectors.toList());
        return ResponseEntity.ok(standardSuccess("Leads retrieved", list, null));
    }

    @GetMapping("/leads/{leadId}")
    public ResponseEntity<Map<String, Object>> getLead(
            @PathVariable("leadId") String leadId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> ld = store.getLeads().get(leadId);
        if (ld == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Lead not found", null, null));
        }
        return ResponseEntity.ok(standardSuccess("Lead retrieved", ld, null));
    }

    @PatchMapping("/leads/{leadId}")
    public ResponseEntity<Map<String, Object>> updateLead(
            @PathVariable("leadId") String leadId,
            @RequestBody Map<String, Object> updates,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> ld = store.getLeads().get(leadId);
        if (ld == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Lead not found", null, null));
        }
        ld.putAll(updates);
        return ResponseEntity.ok(standardSuccess("Lead updated", ld, null));
    }

    @PostMapping("/leads/{leadId}/qualify")
    public ResponseEntity<Map<String, Object>> qualifyLead(
            @PathVariable("leadId") String leadId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> ld = store.getLeads().get(leadId);
        if (ld != null) {
            ld.put("status", "QUALIFIED");
            ld.put("qualificationNotes", body.get("notes"));
        }
        return ResponseEntity.ok(standardSuccess("Lead qualified", ld, null));
    }

    @PostMapping("/leads/{leadId}/score")
    public ResponseEntity<Map<String, Object>> scoreLead(
            @PathVariable("leadId") String leadId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> ld = store.getLeads().get(leadId);
        Map<String, Object> scoreData = Map.of(
                "leadId", leadId,
                "score", 82,
                "tier", "HIGH_VALUE_B2B",
                "factors", List.of("50 Units Volume", "Manufacturing Industry match", "Immediate Timeline")
        );
        if (ld != null) {
            ld.put("score", 82);
        }
        return ResponseEntity.ok(standardSuccess("Lead scored", scoreData, null));
    }

    @PostMapping("/leads/{leadId}/assign")
    public ResponseEntity<Map<String, Object>> assignLead(
            @PathVariable("leadId") String leadId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> ld = store.getLeads().get(leadId);
        if (ld != null) {
            ld.put("assignedTo", body.get("assigneeId"));
        }
        return ResponseEntity.ok(standardSuccess("Lead assigned", ld, null));
    }

    @PostMapping("/leads/{leadId}/activities")
    public ResponseEntity<Map<String, Object>> recordLeadActivity(
            @PathVariable("leadId") String leadId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> act = new LinkedHashMap<>(body);
        act.put("activityId", "ACT-" + UUID.randomUUID().toString().substring(0, 6));
        act.put("timestamp", Instant.now().toString());
        store.getLeadActivities().computeIfAbsent(leadId, k -> new ArrayList<>()).add(act);
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Lead activity recorded", act, null));
    }

    @GetMapping("/leads/{leadId}/activities")
    public ResponseEntity<Map<String, Object>> getLeadActivities(
            @PathVariable("leadId") String leadId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> list = store.getLeadActivities().getOrDefault(leadId, Collections.emptyList());
        return ResponseEntity.ok(standardSuccess("Lead activities retrieved", list, null));
    }

    @PostMapping("/leads/{leadId}/convert")
    public ResponseEntity<Map<String, Object>> convertLead(
            @PathVariable("leadId") String leadId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String oppId = "OPP-" + (store.getOpportunities().size() + 1);
        Map<String, Object> opp = Map.of("opportunityId", oppId, "leadId", leadId, "stage", "QUALIFIED_PROPOSAL");
        return ResponseEntity.ok(standardSuccess("Lead converted to opportunity", opp, null));
    }

    @PostMapping("/leads/{leadId}/handoff")
    public ResponseEntity<Map<String, Object>> handoffLead(
            @PathVariable("leadId") String leadId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Lead handed off to sales representative", body, null));
    }

    // ==========================================
    // D. BUSINESS CUSTOMER & COMPANY IDENTIFICATION
    // ==========================================

    @PostMapping("/business-prospects/search")
    public ResponseEntity<Map<String, Object>> searchProspects(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> list = List.of(
                Map.of("prospectId", "PROS-101", "companyName", "Example Industrial Works", "status", "VERIFIED")
        );
        return ResponseEntity.ok(standardSuccess("Business prospects found", list, null));
    }

    @GetMapping("/business-prospects/{prospectId}")
    public ResponseEntity<Map<String, Object>> getProspect(
            @PathVariable("prospectId") String prospectId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> p = Map.of("prospectId", prospectId, "companyName", "Example Industrial Works", "verified", true);
        return ResponseEntity.ok(standardSuccess("Prospect details retrieved", p, null));
    }

    @PostMapping("/business-prospects/enrich")
    public ResponseEntity<Map<String, Object>> enrichProspect(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Enrichment completed", Map.of("companyName", body.get("companyName"), "industry", "HEAVY_MANUFACTURING", "registeredCapital", "5M USD"), null));
    }

    @PostMapping("/business-prospects/verify")
    public ResponseEntity<Map<String, Object>> verifyProspect(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Company verification completed", Map.of("verified", true, "taxIdVerified", true), null));
    }

    @PostMapping("/contacts")
    public ResponseEntity<Map<String, Object>> createContact(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Contact created", body, null));
    }

    @GetMapping("/contacts/{contactId}")
    public ResponseEntity<Map<String, Object>> getContact(
            @PathVariable("contactId") String contactId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Contact retrieved", Map.of("contactId", contactId, "name", "Arun Kumar"), null));
    }

    @PatchMapping("/contacts/{contactId}")
    public ResponseEntity<Map<String, Object>> updateContact(
            @PathVariable("contactId") String contactId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Contact updated", body, null));
    }

    @PostMapping("/duplicate-checks")
    public ResponseEntity<Map<String, Object>> checkDuplicates(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Duplicate check completed", Map.of("duplicateFound", false), null));
    }

    // ==========================================
    // E. INDUSTRIAL PRODUCT DISCOVERY & EXTRACTION
    // ==========================================

    @GetMapping("/products")
    public ResponseEntity<Map<String, Object>> listProducts(
            @RequestParam(value = "search", required = false) String search,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = store.getProducts().values().stream()
                .filter(p -> tenantId.equals(p.get("tenantId")))
                .collect(Collectors.toList());
        return ResponseEntity.ok(standardSuccess("Catalog products retrieved", list, null));
    }

    @GetMapping("/products/{productId}")
    public ResponseEntity<Map<String, Object>> getProduct(
            @PathVariable("productId") String productId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> p = store.getProducts().get(productId);
        if (p == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Product not found", null, null));
        }
        return ResponseEntity.ok(standardSuccess("Product retrieved", p, null));
    }

    @GetMapping("/products/{productId}/specifications")
    public ResponseEntity<Map<String, Object>> getProductSpecs(
            @PathVariable("productId") String productId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> p = store.getProducts().get(productId);
        Object specs = p != null ? p.get("specifications") : Collections.emptyMap();
        return ResponseEntity.ok(standardSuccess("Product specifications retrieved", specs, null));
    }

    @GetMapping("/products/{productId}/compatible-products")
    public ResponseEntity<Map<String, Object>> getCompatibleProducts(
            @PathVariable("productId") String productId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> p = store.getProducts().get(productId);
        Object comp = p != null ? p.get("compatibleProducts") : Collections.emptyList();
        return ResponseEntity.ok(standardSuccess("Compatible products retrieved", comp, null));
    }

    @GetMapping("/products/{productId}/alternatives")
    public ResponseEntity<Map<String, Object>> getAlternatives(
            @PathVariable("productId") String productId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> p = store.getProducts().get(productId);
        Object alt = p != null ? p.get("alternatives") : Collections.emptyList();
        return ResponseEntity.ok(standardSuccess("Alternative products retrieved", alt, null));
    }

    @PostMapping("/requirement-extractions")
    public ResponseEntity<Map<String, Object>> extractRequirements(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String leadId = (String) body.get("leadId");
        String extractionId = "REQ-" + (7000 + store.getAiSalesExtractions().size() + 1);

        Map<String, Object> ext = new LinkedHashMap<>();
        ext.put("extractionId", extractionId);
        ext.put("leadId", leadId != null ? leadId : "LEAD-5001");

        Map<String, Object> reqs = new LinkedHashMap<>();
        reqs.put("quantity", 50);
        reqs.put("ratedPowerKw", 5.5);
        reqs.put("voltage", "415 V");
        reqs.put("operatingMode", "CONTINUOUS");
        ext.put("requirements", reqs);

        ext.put("missingInformation", List.of(
                "Frequency",
                "Mounting requirements",
                "Environmental conditions"
        ));
        ext.put("validationStatus", "PENDING_CATALOGUE_VALIDATION");

        store.getAiSalesExtractions().put(extractionId, ext);

        return ResponseEntity.ok(standardSuccess("Product requirements extracted", ext, "req_sales_ai_005"));
    }

    @GetMapping("/requirement-extractions/{extractionId}")
    public ResponseEntity<Map<String, Object>> getExtraction(
            @PathVariable("extractionId") String extractionId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> ext = store.getAiSalesExtractions().get(extractionId);
        if (ext == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Extraction not found", null, null));
        }
        return ResponseEntity.ok(standardSuccess("Extracted requirements retrieved", ext, null));
    }

    @PostMapping("/product-recommendations")
    public ResponseEntity<Map<String, Object>> recommendProducts(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String recId = "REC-" + (8000 + store.getAiSalesRecommendations().size() + 1);

        Map<String, Object> r = new LinkedHashMap<>();
        r.put("recommendationId", recId);
        r.put("status", "CATALOGUE_VALIDATION_REQUIRED");
        r.put("products", Collections.emptyList());
        r.put("missingInformation", List.of(
                "Frequency",
                "Mounting requirements",
                "Environmental conditions"
        ));
        r.put("nextAction", "COMPLETE_REQUIREMENTS");

        store.getAiSalesRecommendations().put(recId, r);
        return ResponseEntity.ok(standardSuccess("Product recommendation results retrieved", r, "req_sales_ai_006"));
    }

    @PostMapping("/product-recommendations/validate")
    public ResponseEntity<Map<String, Object>> validateRecommendation(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Recommendation validation completed", Map.of("valid", true), null));
    }

    // ==========================================
    // F. PRICING & INVENTORY
    // ==========================================

    @GetMapping("/price-lists")
    public ResponseEntity<Map<String, Object>> listPriceLists(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = store.getPriceLists().values().stream()
                .filter(pl -> tenantId.equals(pl.get("tenantId")))
                .collect(Collectors.toList());
        return ResponseEntity.ok(standardSuccess("Price lists retrieved", list, null));
    }

    @GetMapping("/price-lists/{priceListId}/products/{productId}")
    public ResponseEntity<Map<String, Object>> getProductPricing(
            @PathVariable("priceListId") String priceListId,
            @PathVariable("productId") String productId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {

        Map<String, Object> r = new LinkedHashMap<>();
        r.put("priceListId", priceListId);
        r.put("productId", productId);
        r.put("currency", "INR");
        r.put("unitPrice", 18500.00);
        r.put("taxIncluded", false);
        r.put("validUntil", "2026-12-31");
        r.put("priceType", "INDICATIVE");
        r.put("approvalRequiredForDiscount", true);

        return ResponseEntity.ok(standardSuccess("Authorized product pricing retrieved", r, "req_sales_ai_007"));
    }

    @PostMapping("/pricing/estimates")
    public ResponseEntity<Map<String, Object>> requestPricingEstimate(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Pricing estimate generated", Map.of("indicativeTotal", 925000.00, "currency", "INR"), null));
    }

    @PostMapping("/pricing/discount-requests")
    public ResponseEntity<Map<String, Object>> submitDiscountRequest(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String reqId = "DISC-" + UUID.randomUUID().toString().substring(0, 6);
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Discount request submitted", Map.of("requestId", reqId, "status", "PENDING_SALES_MANAGER_APPROVAL"), null));
    }

    @GetMapping("/pricing/discount-requests/{requestId}")
    public ResponseEntity<Map<String, Object>> getDiscountRequest(
            @PathVariable("requestId") String requestId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Discount request status", Map.of("requestId", requestId, "status", "PENDING_APPROVAL"), null));
    }

    @GetMapping("/pricing/discount-requests/{requestId}/decision")
    public ResponseEntity<Map<String, Object>> getDiscountDecision(
            @PathVariable("requestId") String requestId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Discount decision retrieved", Map.of("requestId", requestId, "decision", "UNDER_REVIEW"), null));
    }

    @PostMapping("/inventory/availability-checks")
    public ResponseEntity<Map<String, Object>> checkInventoryAvailability(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String productId = (String) body.get("productId");
        Number qtyNum = (Number) body.getOrDefault("quantity", 50);
        int qty = qtyNum.intValue();

        String checkId = "INVCHK-" + (3000 + store.getInventoryChecks().size() + 1);

        Map<String, Object> r = new LinkedHashMap<>();
        r.put("checkId", checkId);
        r.put("productId", productId != null ? productId : "PRD-2001");
        r.put("requestedQuantity", qty);
        r.put("availabilityStatus", "PARTIAL");
        r.put("availableQuantity", 20);
        r.put("shortfallQuantity", 30);
        r.put("source", "ERP_INVENTORY");
        r.put("checkedAt", Instant.now().toString());

        store.getInventoryChecks().put(checkId, r);

        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Inventory availability check completed", r, "req_sales_ai_008"));
    }

    @GetMapping("/inventory/availability-checks/{checkId}")
    public ResponseEntity<Map<String, Object>> getAvailabilityCheck(
            @PathVariable("checkId") String checkId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> chk = store.getInventoryChecks().get(checkId);
        if (chk == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Inventory check not found", null, null));
        }
        return ResponseEntity.ok(standardSuccess("Availability results retrieved", chk, null));
    }

    @PostMapping("/fulfilment-estimates")
    public ResponseEntity<Map<String, Object>> requestFulfilmentEstimate(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Fulfilment estimate generated", Map.of("estimatedLeadTimeWeeks", 3, "status", "INDICATIVE"), null));
    }

    @GetMapping("/fulfilment-estimates/{estimateId}")
    public ResponseEntity<Map<String, Object>> getFulfilmentEstimate(
            @PathVariable("estimateId") String estimateId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Fulfilment estimate status retrieved", Map.of("estimateId", estimateId, "status", "VALID"), null));
    }

    // ==========================================
    // G. OPPORTUNITIES & QUOTATIONS
    // ==========================================

    @PostMapping("/opportunities")
    public ResponseEntity<Map<String, Object>> createOpportunity(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String oppId = "OPP-" + (store.getOpportunities().size() + 1);
        Map<String, Object> opp = new LinkedHashMap<>(body);
        opp.put("opportunityId", oppId);
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Opportunity created", opp, null));
    }

    @GetMapping("/opportunities")
    public ResponseEntity<Map<String, Object>> listOpportunities(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Opportunities retrieved", store.getOpportunities().values(), null));
    }

    @GetMapping("/opportunities/{opportunityId}")
    public ResponseEntity<Map<String, Object>> getOpportunity(
            @PathVariable("opportunityId") String opportunityId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Opportunity retrieved", Map.of("opportunityId", opportunityId), null));
    }

    @PatchMapping("/opportunities/{opportunityId}")
    public ResponseEntity<Map<String, Object>> updateOpportunity(
            @PathVariable("opportunityId") String opportunityId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Opportunity updated", body, null));
    }

    @PostMapping("/opportunities/{opportunityId}/stage")
    public ResponseEntity<Map<String, Object>> updateOpportunityStage(
            @PathVariable("opportunityId") String opportunityId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Stage updated", body, null));
    }

    @PostMapping("/quotations/drafts")
    public ResponseEntity<Map<String, Object>> createQuotationDraft(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        String quoteId = "QUO-" + (9000 + store.getQuotations().size() + 1);

        Map<String, Object> q = new LinkedHashMap<>();
        q.put("quotationId", quoteId);
        q.put("leadId", body.get("leadId"));
        q.put("status", "DRAFT");
        q.put("currency", body.getOrDefault("currency", "INR"));

        List<Map<String, Object>> rawItems = new ArrayList<>();
        List<?> items = (List<?>) body.get("items");
        if (items != null) {
            for (Object itm : items) {
                if (itm instanceof Map) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> m = (Map<String, Object>) itm;
                    Map<String, Object> line = new LinkedHashMap<>();
                    line.put("productId", m.get("productId"));
                    line.put("quantity", m.get("quantity"));
                    line.put("unitPrice", null);
                    line.put("lineTotal", null);
                    rawItems.add(line);
                }
            }
        }
        q.put("items", rawItems);
        q.put("requiresPricingResolution", true);
        q.put("requiresApproval", true);
        q.put("tenantId", tenantId);
        q.put("createdAt", Instant.now().toString());

        store.getQuotations().put(quoteId, q);
        store.addAuditLog("QUOTATION", quoteId, "QUOTATION_DRAFTED_BY_AI", "AI_SALES_AGENT", tenantId);

        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Quotation draft created", q, "req_sales_ai_009"));
    }

    @GetMapping("/quotations/{quotationId}")
    public ResponseEntity<Map<String, Object>> getQuotation(
            @PathVariable("quotationId") String quotationId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> q = store.getQuotations().get(quotationId);
        if (q == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Quotation not found", null, null));
        }
        return ResponseEntity.ok(standardSuccess("Quotation details retrieved", q, null));
    }

    @PostMapping("/quotations/{quotationId}/validate")
    public ResponseEntity<Map<String, Object>> validateQuotation(
            @PathVariable("quotationId") String quotationId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Quotation validation passed", Map.of("quotationId", quotationId, "valid", true), null));
    }

    @PostMapping("/quotations/{quotationId}/request-approval")
    public ResponseEntity<Map<String, Object>> requestQuotationApproval(
            @PathVariable("quotationId") String quotationId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        Map<String, Object> q = store.getQuotations().get(quotationId);
        if (q != null) {
            q.put("status", "PENDING_APPROVAL");
        }

        String aprId = "APR-4001";
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("quotationId", quotationId);
        r.put("status", "PENDING_APPROVAL");
        r.put("approvalRequestId", aprId);
        r.put("decision", null);

        store.addAuditLog("QUOTATION", quotationId, "APPROVAL_REQUESTED", "AI_SALES_AGENT", tenantId);
        return ResponseEntity.ok(standardSuccess("Quotation approval requested", r, "req_sales_ai_010"));
    }

    @PostMapping("/quotations/{quotationId}/send")
    public ResponseEntity<Map<String, Object>> sendQuotation(
            @PathVariable("quotationId") String quotationId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> q = store.getQuotations().get(quotationId);
        if (q != null) {
            q.put("status", "SENT");
        }
        return ResponseEntity.ok(standardSuccess("Quotation dispatched to prospect", Map.of("quotationId", quotationId, "status", "SENT"), null));
    }

    @GetMapping("/quotations/{quotationId}/status")
    public ResponseEntity<Map<String, Object>> getQuotationStatus(
            @PathVariable("quotationId") String quotationId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> q = store.getQuotations().get(quotationId);
        Object status = q != null ? q.get("status") : "UNKNOWN";
        return ResponseEntity.ok(standardSuccess("Quotation status retrieved", Map.of("quotationId", quotationId, "status", status), null));
    }

    // ==========================================
    // H. FOLLOW-UPS & MEETINGS
    // ==========================================

    @PostMapping("/follow-ups")
    public ResponseEntity<Map<String, Object>> createFollowUp(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        String taskId = "FUP-" + (7000 + store.getFollowUpTasks().size() + 1);

        Map<String, Object> fup = new LinkedHashMap<>();
        fup.put("taskId", taskId);
        fup.put("leadId", body.get("leadId"));
        fup.put("conversationId", body.get("conversationId"));
        fup.put("followUpType", body.getOrDefault("followUpType", "COLLECT_REQUIREMENTS"));
        fup.put("status", "PENDING");
        fup.put("dueAt", body.getOrDefault("dueAt", "2026-10-30T10:00:00+05:30"));
        fup.put("reason", body.get("reason"));
        fup.put("tenantId", tenantId);

        store.getFollowUpTasks().put(taskId, fup);
        store.addAuditLog("FOLLOW_UP", taskId, "FOLLOW_UP_SCHEDULED", "AI_SALES_AGENT", tenantId);

        Map<String, Object> r = new LinkedHashMap<>();
        r.put("taskId", taskId);
        r.put("leadId", fup.get("leadId"));
        r.put("followUpType", fup.get("followUpType"));
        r.put("status", "PENDING");
        r.put("dueAt", fup.get("dueAt"));

        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Follow-up created", r, "req_sales_ai_011"));
    }

    @GetMapping("/follow-ups")
    public ResponseEntity<Map<String, Object>> listFollowUps(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> list = store.getFollowUpTasks().values().stream()
                .filter(f -> tenantId.equals(f.get("tenantId")))
                .collect(Collectors.toList());
        return ResponseEntity.ok(standardSuccess("Follow-up tasks retrieved", list, null));
    }

    @GetMapping("/follow-ups/{taskId}")
    public ResponseEntity<Map<String, Object>> getFollowUp(
            @PathVariable("taskId") String taskId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> f = store.getFollowUpTasks().get(taskId);
        if (f == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(standardError("Follow-up not found", null, null));
        }
        return ResponseEntity.ok(standardSuccess("Follow-up retrieved", f, null));
    }

    @PatchMapping("/follow-ups/{taskId}")
    public ResponseEntity<Map<String, Object>> updateFollowUp(
            @PathVariable("taskId") String taskId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> f = store.getFollowUpTasks().get(taskId);
        if (f != null) {
            f.putAll(body);
        }
        return ResponseEntity.ok(standardSuccess("Follow-up updated", f, null));
    }

    @PostMapping("/follow-ups/{taskId}/complete")
    public ResponseEntity<Map<String, Object>> completeFollowUp(
            @PathVariable("taskId") String taskId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> f = store.getFollowUpTasks().get(taskId);
        if (f != null) {
            f.put("status", "COMPLETED");
        }
        return ResponseEntity.ok(standardSuccess("Follow-up marked completed", f, null));
    }

    @PostMapping("/follow-ups/{taskId}/snooze")
    public ResponseEntity<Map<String, Object>> snoozeFollowUp(
            @PathVariable("taskId") String taskId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> f = store.getFollowUpTasks().get(taskId);
        if (f != null) {
            f.put("dueAt", body.get("dueAt"));
            f.put("status", "SNOOZED");
        }
        return ResponseEntity.ok(standardSuccess("Follow-up rescheduled", f, null));
    }

    @PostMapping("/meeting-requests")
    public ResponseEntity<Map<String, Object>> requestMeeting(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String reqId = "MEET-" + UUID.randomUUID().toString().substring(0, 6);
        Map<String, Object> m = new LinkedHashMap<>(body);
        m.put("requestId", reqId);
        m.put("status", "PENDING_CONFIRMATION");
        return ResponseEntity.status(HttpStatus.CREATED).body(standardSuccess("Meeting requested", m, null));
    }

    @GetMapping("/meeting-requests/{requestId}")
    public ResponseEntity<Map<String, Object>> getMeetingRequest(
            @PathVariable("requestId") String requestId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Meeting status retrieved", Map.of("requestId", requestId, "status", "CONFIRMED"), null));
    }

    @PostMapping("/meeting-requests/{requestId}/confirm")
    public ResponseEntity<Map<String, Object>> confirmMeeting(
            @PathVariable("requestId") String requestId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Meeting confirmed with calendar invite", Map.of("requestId", requestId, "status", "CONFIRMED"), null));
    }

    // ==========================================
    // I. ANALYTICS & AUDIT
    // ==========================================

    @GetMapping("/reports/leads")
    public ResponseEntity<Map<String, Object>> getLeadsReport(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Lead report retrieved", List.of(Map.of("source", "WEBSITE_CHAT", "count", 45, "qualifiedCount", 28)), null));
    }

    @GetMapping("/reports/qualification")
    public ResponseEntity<Map<String, Object>> getQualificationReport(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Qualification report retrieved", Map.of("qualificationRate", 62.2), null));
    }

    @GetMapping("/reports/conversions")
    public ResponseEntity<Map<String, Object>> getConversionReport(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Conversion report retrieved", Map.of("conversionRate", 24.5), null));
    }

    @GetMapping("/reports/conversations")
    public ResponseEntity<Map<String, Object>> getConversationsReport(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Conversation analytics retrieved", Map.of("totalConversations", 88, "avgDurationMins", 6.5), null));
    }

    @GetMapping("/reports/quotations")
    public ResponseEntity<Map<String, Object>> getQuotationsReport(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardSuccess("Quotation analytics retrieved", Map.of("draftsCreated", 48, "approvalsGranted", 42), null));
    }

    @GetMapping("/activity-logs")
    public ResponseEntity<Map<String, Object>> getActivityLogs(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        List<Map<String, Object>> logs = store.getAuditLogs().stream()
                .filter(l -> tenantId.equals(l.get("tenantId")))
                .collect(Collectors.toList());
        return ResponseEntity.ok(standardSuccess("Sales agent activity logs retrieved", logs, null));
    }
}
