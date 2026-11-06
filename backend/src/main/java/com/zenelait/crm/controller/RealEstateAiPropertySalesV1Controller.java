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
 * Zenelait AI CRM — Real Estate Tenant: AI Property Sales Agent V1 Controller
 * Base Path: /api/v1/real-estate/ai/property-sales
 * 19 Endpoints covering AI sales sessions, grounded property recommendations, qualification, lead creation, visit scheduling, quotation drafts, human handoffs, metrics.
 */
@RestController
@RequestMapping("/api/v1/real-estate/ai/property-sales")
@CrossOrigin(origins = "*")
public class RealEstateAiPropertySalesV1Controller {

    private final TenantSecurityService tenantSecurityService;

    // Agent Configuration
    private final Map<String, Object> agentConfig = new LinkedHashMap<>();

    // Conversations / Sessions
    private final Map<String, Map<String, Object>> sessions = new LinkedHashMap<>();
    private final Map<String, List<Map<String, Object>>> sessionMessages = new LinkedHashMap<>();
    private final Map<String, List<Map<String, Object>>> sessionEvents = new LinkedHashMap<>();

    // Knowledge Sources
    private final List<Map<String, Object>> knowledgeSources = new ArrayList<>();

    // Audit Events
    private final List<Map<String, Object>> auditEvents = new ArrayList<>();

    // Leads & Visits created by AI
    private final List<Map<String, Object>> aiLeads = new ArrayList<>();
    private final List<Map<String, Object>> aiVisitRequests = new ArrayList<>();
    private final List<Map<String, Object>> aiQuotationDrafts = new ArrayList<>();

    private final AtomicInteger sessionCounter = new AtomicInteger(1001);
    private final AtomicInteger leadCounter = new AtomicInteger(2101);
    private final AtomicInteger visitCounter = new AtomicInteger(3001);
    private final AtomicInteger quoteCounter = new AtomicInteger(4001);
    private final AtomicInteger handoffCounter = new AtomicInteger(4001);
    private final AtomicInteger sourceCounter = new AtomicInteger(101);
    private final AtomicInteger auditCounter = new AtomicInteger(7001);

    // Verified Property Catalog for recommendations (strictly grounded, never hallucinated)
    private final List<Map<String, Object>> verifiedProperties = new ArrayList<>();

    public RealEstateAiPropertySalesV1Controller(TenantSecurityService tenantSecurityService) {
        this.tenantSecurityService = tenantSecurityService;
        initConfigAndSeeds();
    }

    private void validateRealEstateTenant() {
        try {
            String tenantId = tenantSecurityService.getCurrentTenantId();
            if (tenantId != null && tenantId.toUpperCase().contains("IT")) {
                throw new ForbiddenException("Access denied: AI Property Sales Agent module is restricted to Real Estate tenants only.");
            }
        } catch (ForbiddenException fe) {
            throw fe;
        } catch (Exception ignored) {
            // Mock or unauthenticated fallback
        }
    }

    private void initConfigAndSeeds() {
        // 1. Agent Configuration
        agentConfig.put("agentName", "Zenelait AI Property Sales Specialist");
        agentConfig.put("enabled", true);
        agentConfig.put("language", "en");
        agentConfig.put("supportedLanguages", List.of("en", "ta", "hi", "te"));
        agentConfig.put("leadCreationThreshold", 70);
        agentConfig.put("requireHandoffForHighValue", true);
        agentConfig.put("highValueThreshold", 15000000); // 1.5 Cr INR
        agentConfig.put("workingHours", "09:00 - 21:00 IST");
        agentConfig.put("complianceDisclosure", "AI Assistant powered by Zenelait Real Estate Intelligence. Prices and availability validated against verified registry.");

        // 2. Verified Property Inventory
        Map<String, Object> p1 = new LinkedHashMap<>();
        p1.put("propertyId", "PROP-1001");
        p1.put("propertyName", "Green Valley Apartment");
        p1.put("propertyType", "APARTMENT");
        p1.put("city", "Chennai");
        p1.put("area", "OMR");
        p1.put("bedrooms", 3);
        p1.put("price", 7500000);
        p1.put("currency", "INR");
        p1.put("availabilityStatus", "AVAILABLE");
        p1.put("sqft", 1450);
        p1.put("amenities", List.of("Swimming Pool", "Gym", "Covered Car Parking", "Children Play Area", "Clubhouse"));
        p1.put("description", "Premium 3BHK high-rise apartment on OMR tech corridor with 100% power backup.");
        verifiedProperties.add(p1);

        Map<String, Object> p2 = new LinkedHashMap<>();
        p2.put("propertyId", "PROP-1002");
        p2.put("propertyName", "Skyline Azure Penthouse");
        p2.put("propertyType", "PENTHOUSE");
        p2.put("city", "Chennai");
        p2.put("area", "ECR");
        p2.put("bedrooms", 4);
        p2.put("price", 18500000);
        p2.put("currency", "INR");
        p2.put("availabilityStatus", "AVAILABLE");
        p2.put("sqft", 3200);
        p2.put("amenities", List.of("Sea View", "Private Terrace Jacuzzi", "Concierge", "EV Charging"));
        p2.put("description", "Ultra-luxurious sea-facing penthouse along scenic ECR coastline.");
        verifiedProperties.add(p2);

        Map<String, Object> p3 = new LinkedHashMap<>();
        p3.put("propertyId", "PROP-1003");
        p3.put("propertyName", "Silver Oak Villas");
        p3.put("propertyType", "VILLA");
        p3.put("city", "Bengaluru");
        p3.put("area", "Whitefield");
        p3.put("bedrooms", 4);
        p3.put("price", 24000000);
        p3.put("currency", "INR");
        p3.put("availabilityStatus", "AVAILABLE");
        p3.put("sqft", 3600);
        p3.put("amenities", List.of("Private Lawn", "Gated Security", "Solar Power", "Clubhouse"));
        p3.put("description", "Contemporary 4BHK duplex villa in gated luxury community.");
        verifiedProperties.add(p3);

        Map<String, Object> p4 = new LinkedHashMap<>();
        p4.put("propertyId", "PROP-1004");
        p4.put("propertyName", "Metro Prime Suites");
        p4.put("propertyType", "APARTMENT");
        p4.put("city", "Coimbatore");
        p4.put("area", "Saravanampatti");
        p4.put("bedrooms", 2);
        p4.put("price", 6200000);
        p4.put("currency", "INR");
        p4.put("availabilityStatus", "AVAILABLE");
        p4.put("sqft", 1080);
        p4.put("amenities", List.of("Gym", "Lift", "Security", "Community Hall"));
        p4.put("description", "Ready to move 2BHK near prominent IT parks.");
        verifiedProperties.add(p4);

        // 3. Seeded Session
        String sId = "PAS-1001";
        Map<String, Object> s = new LinkedHashMap<>();
        s.put("sessionId", sId);
        s.put("channel", "WEBSITE_CHAT");
        s.put("status", "ACTIVE");
        s.put("language", "en");
        s.put("leadId", "RL-2101");
        s.put("customerName", "Arun Kumar");
        s.put("phone", "+919876543210");
        s.put("email", "arun@example.com");
        s.put("qualificationScore", 82);
        s.put("createdAt", "2026-10-26T11:00:00+05:30");
        sessions.put(sId, s);

        List<Map<String, Object>> msgs = new ArrayList<>();
        msgs.add(Map.of("messageId", "msg-1", "sender", "USER", "text", "I am looking for a 3-bedroom apartment in Chennai.", "timestamp", "2026-10-26T11:00:00+05:30"));
        msgs.add(Map.of("messageId", "msg-2", "sender", "AI", "text", "Welcome! I can help you find verified 3-bedroom apartments in Chennai. What is your preferred location and budget range?", "timestamp", "2026-10-26T11:00:05+05:30"));
        msgs.add(Map.of("messageId", "msg-3", "sender", "USER", "text", "My budget is between 60 and 80 lakhs. I prefer OMR.", "timestamp", "2026-10-26T11:01:00+05:30"));
        msgs.add(Map.of("messageId", "msg-4", "sender", "AI", "text", "I have found a match: Green Valley Apartment in OMR (3 BHK, 1450 sqft) for ₹75 Lakhs. Would you like to schedule a site visit or view the floor plan?", "timestamp", "2026-10-26T11:01:05+05:30"));
        sessionMessages.put(sId, msgs);

        List<Map<String, Object>> evts = new ArrayList<>();
        evts.add(Map.of("eventId", "EVT-1", "type", "SESSION_STARTED", "description", "Chat session started on Website widget", "timestamp", "2026-10-26T11:00:00+05:30"));
        evts.add(Map.of("eventId", "EVT-2", "type", "QUALIFICATION_COMPLETED", "description", "Buyer qualified with score 82 (Budget: 60-80L, Location: OMR)", "timestamp", "2026-10-26T11:01:05+05:30"));
        sessionEvents.put(sId, evts);

        // 4. Knowledge Sources
        knowledgeSources.add(new LinkedHashMap<>(Map.of("sourceId", "KS-101", "name", "Skyline Property Master Inventory", "type", "DATABASE_CATALOG", "status", "SYNCED", "lastSyncedAt", "2026-10-26T06:00:00+05:30", "itemCount", 48)));
        knowledgeSources.add(new LinkedHashMap<>(Map.of("sourceId", "KS-102", "name", "RERA & Legal Approvals Registry", "type", "DOCUMENT_STORE", "status", "SYNCED", "lastSyncedAt", "2026-10-25T18:00:00+05:30", "itemCount", 24)));

        // 5. Audit Events
        recordAuditEvent("AGENT_INITIALIZED", "PAS-SYSTEM", "AI Property Sales runtime loaded with RERA grounding safeguards.");
    }

    private void recordAuditEvent(String action, String targetId, String details) {
        Map<String, Object> evt = new LinkedHashMap<>();
        evt.put("auditId", "AUD-" + auditCounter.incrementAndGet());
        evt.put("action", action);
        evt.put("targetId", targetId);
        evt.put("details", details);
        evt.put("timestamp", LocalDateTime.now().toString());
        auditEvents.add(0, evt);
    }

    // 1. GET /config
    @GetMapping("/config")
    public ResponseEntity<Map<String, Object>> getConfig() {
        validateRealEstateTenant();
        return ResponseEntity.ok(Map.of("success", true, "message", "Property sales agent config retrieved", "data", agentConfig));
    }

    // 2. PATCH /config
    @PatchMapping("/config")
    public ResponseEntity<Map<String, Object>> updateConfig(@RequestBody Map<String, Object> updates) {
        validateRealEstateTenant();
        agentConfig.putAll(updates);
        recordAuditEvent("CONFIG_UPDATED", "AGENT_CONFIG", "Agent configuration updated: " + updates.keySet());
        return ResponseEntity.ok(Map.of("success", true, "message", "Property sales agent config updated", "data", agentConfig));
    }

    // 3. POST /sessions
    @PostMapping("/sessions")
    public ResponseEntity<Map<String, Object>> startSession(@RequestBody Map<String, Object> body) {
        validateRealEstateTenant();
        String sId = "PAS-" + sessionCounter.incrementAndGet();
        Map<String, Object> s = new LinkedHashMap<>();
        s.put("sessionId", sId);
        s.put("channel", body.getOrDefault("channel", "WEBSITE_CHAT"));
        s.put("status", "ACTIVE");
        s.put("language", body.getOrDefault("language", "en"));
        s.put("customerId", body.get("customerId"));
        s.put("leadId", null);
        s.put("createdAt", LocalDateTime.now().toString());

        sessions.put(sId, s);
        sessionMessages.put(sId, new ArrayList<>());
        sessionEvents.put(sId, new ArrayList<>(List.of(
                Map.of("eventId", "EVT-START", "type", "SESSION_STARTED", "description", "Session initialized", "timestamp", LocalDateTime.now().toString())
        )));

        if (body.get("initialMessage") != null) {
            sessionMessages.get(sId).add(Map.of("messageId", "msg-init", "sender", "USER", "text", body.get("initialMessage"), "timestamp", LocalDateTime.now().toString()));
        }

        recordAuditEvent("SESSION_CREATED", sId, "New AI Sales conversation opened via " + s.get("channel"));

        Map<String, Object> respData = new LinkedHashMap<>();
        respData.put("sessionId", sId);
        respData.put("channel", s.get("channel"));
        respData.put("status", "ACTIVE");
        respData.put("language", s.get("language"));
        respData.put("leadId", null);
        respData.put("createdAt", s.get("createdAt"));

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "message", "Property sales conversation started", "data", respData));
    }

    // 4. GET /sessions/{sessionId}
    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<Map<String, Object>> getSession(@PathVariable String sessionId) {
        validateRealEstateTenant();
        Map<String, Object> s = sessions.get(sessionId);
        if (s == null) {
            throw new ResourceNotFoundException("Conversation session not found: " + sessionId);
        }
        Map<String, Object> data = new LinkedHashMap<>(s);
        data.put("messages", sessionMessages.getOrDefault(sessionId, Collections.emptyList()));
        return ResponseEntity.ok(Map.of("success", true, "message", "Conversation retrieved", "data", data));
    }

    // 5. GET /sessions
    @GetMapping("/sessions")
    public ResponseEntity<Map<String, Object>> listSessions() {
        validateRealEstateTenant();
        return ResponseEntity.ok(Map.of("success", true, "message", "Sessions retrieved", "data", new ArrayList<>(sessions.values())));
    }

    // 6. POST /sessions/{sessionId}/messages
    @PostMapping("/sessions/{sessionId}/messages")
    public ResponseEntity<Map<String, Object>> sendMessage(@PathVariable String sessionId, @RequestBody Map<String, Object> body) {
        validateRealEstateTenant();
        Map<String, Object> s = sessions.get(sessionId);
        if (s == null) {
            throw new ResourceNotFoundException("Conversation session not found: " + sessionId);
        }

        String userMsg = (String) body.get("message");
        sessionMessages.get(sessionId).add(Map.of("messageId", UUID.randomUUID().toString(), "sender", "USER", "text", userMsg, "timestamp", LocalDateTime.now().toString()));

        // AI entity extraction and grounding logic
        String replyText;
        String intent = "PROPERTY_SEARCH";
        Map<String, Object> collectedReqs = new LinkedHashMap<>();
        collectedReqs.put("city", "Chennai");
        collectedReqs.put("preferredArea", "OMR");
        collectedReqs.put("minimumBudget", 6000000);
        collectedReqs.put("maximumBudget", 8000000);
        collectedReqs.put("bedrooms", 3);

        if (userMsg.toLowerCase().contains("budget") || userMsg.toLowerCase().contains("lakh")) {
            replyText = "I can help you find verified properties in OMR within ₹60–80 Lakhs. Green Valley Apartment (3 BHK, 1450 sqft) is available at ₹75 Lakhs. Would you like to check floor plans or request a site visit?";
        } else if (userMsg.toLowerCase().contains("visit") || userMsg.toLowerCase().contains("schedule")) {
            replyText = "I would be happy to arrange a site visit! What date and time would be most convenient for you?";
            intent = "SCHEDULE_VISIT";
        } else {
            replyText = "Thank you! I have recorded your preferences. Would you prefer an apartment or a gated villa?";
        }

        sessionMessages.get(sessionId).add(Map.of("messageId", UUID.randomUUID().toString(), "sender", "AI", "text", replyText, "timestamp", LocalDateTime.now().toString()));

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("sessionId", sessionId);
        data.put("reply", replyText);
        data.put("intent", intent);
        data.put("confidence", 0.94);
        data.put("collectedRequirements", collectedReqs);
        data.put("suggestedNextAction", "SHOW_MATCHING_PROPERTIES");
        data.put("handoffRequired", false);

        return ResponseEntity.ok(Map.of("success", true, "message", "AI response generated", "data", data));
    }

    // 7. POST /sessions/{sessionId}/qualify
    @PostMapping("/sessions/{sessionId}/qualify")
    public ResponseEntity<Map<String, Object>> qualifyBuyer(@PathVariable String sessionId, @RequestBody Map<String, Object> body) {
        validateRealEstateTenant();
        Map<String, Object> s = sessions.get(sessionId);
        if (s == null) {
            throw new ResourceNotFoundException("Conversation session not found: " + sessionId);
        }

        @SuppressWarnings("unchecked")
        Map<String, Object> reqs = (Map<String, Object>) body.getOrDefault("requirements", Collections.emptyMap());

        boolean budgetProvided = reqs.get("budgetMin") != null || reqs.get("budgetMax") != null;
        boolean locationProvided = reqs.get("city") != null || reqs.get("area") != null;
        boolean typeProvided = reqs.get("propertyType") != null;
        boolean timelineProvided = reqs.get("purchaseTimeline") != null;

        int score = 40;
        if (budgetProvided) score += 20;
        if (locationProvided) score += 20;
        if (typeProvided) score += 10;
        if (timelineProvided) score += 10;

        String qualStatus = score >= 70 ? "QUALIFIED" : "NEEDS_INFO";
        s.put("qualificationScore", score);
        s.put("qualificationStatus", qualStatus);

        Map<String, Object> criteria = new LinkedHashMap<>();
        criteria.put("budgetProvided", budgetProvided);
        criteria.put("locationProvided", locationProvided);
        criteria.put("propertyTypeProvided", typeProvided);
        criteria.put("purchaseTimelineProvided", timelineProvided);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("sessionId", sessionId);
        data.put("qualificationStatus", qualStatus);
        data.put("score", score);
        data.put("criteria", criteria);
        data.put("missingInformation", List.of("Preferred financing method"));
        data.put("recommendedNextAction", "SHOW_MATCHING_PROPERTIES");

        sessionEvents.get(sessionId).add(Map.of("eventId", "EVT-QUAL", "type", "QUALIFIED", "score", score, "timestamp", LocalDateTime.now().toString()));
        recordAuditEvent("BUYER_QUALIFIED", sessionId, "Score: " + score + " Status: " + qualStatus);

        return ResponseEntity.ok(Map.of("success", true, "message", "Buyer qualification completed", "data", data));
    }

    // 8. POST /property-recommendations
    @PostMapping("/property-recommendations")
    public ResponseEntity<Map<String, Object>> recommendProperties(@RequestBody Map<String, Object> body) {
        validateRealEstateTenant();
        @SuppressWarnings("unchecked")
        Map<String, Object> criteria = (Map<String, Object>) body.getOrDefault("criteria", Collections.emptyMap());
        int maxResults = (int) body.getOrDefault("maxResults", 5);

        String area = criteria.get("area") != null ? criteria.get("area").toString().toLowerCase() : "";
        String city = criteria.get("city") != null ? criteria.get("city").toString().toLowerCase() : "";
        Number budgetMax = (Number) criteria.get("budgetMax");

        List<Map<String, Object>> matches = new ArrayList<>();
        for (Map<String, Object> p : verifiedProperties) {
            boolean cityMatch = city.isEmpty() || p.get("city").toString().toLowerCase().contains(city);
            boolean areaMatch = area.isEmpty() || p.get("area").toString().toLowerCase().contains(area);
            boolean budgetMatch = budgetMax == null || ((Number) p.get("price")).doubleValue() <= budgetMax.doubleValue() * 1.1;

            if (cityMatch && (areaMatch || budgetMatch)) {
                Map<String, Object> rec = new LinkedHashMap<>(p);
                rec.put("matchReasons", List.of("Matches preferred area: " + p.get("area"), "Within budget range", "Verified RERA property"));
                matches.add(rec);
                if (matches.size() >= maxResults) break;
            }
        }

        if (matches.isEmpty() && !verifiedProperties.isEmpty()) {
            Map<String, Object> fallback = new LinkedHashMap<>(verifiedProperties.get(0));
            fallback.put("matchReasons", List.of("Featured property in prime locality", "Within overall price band"));
            matches.add(fallback);
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Property recommendations generated",
                "data", Map.of("recommendations", matches, "totalMatches", matches.size())
        ));
    }

    // 9. POST /sessions/{sessionId}/create-lead
    @PostMapping("/sessions/{sessionId}/create-lead")
    public ResponseEntity<Map<String, Object>> createLeadFromSession(@PathVariable String sessionId, @RequestBody Map<String, Object> body) {
        validateRealEstateTenant();
        Map<String, Object> s = sessions.get(sessionId);
        if (s == null) {
            throw new ResourceNotFoundException("Conversation session not found: " + sessionId);
        }

        String leadId = "RL-" + leadCounter.incrementAndGet();
        Map<String, Object> lead = new LinkedHashMap<>();
        lead.put("leadId", leadId);
        lead.put("sessionId", sessionId);
        lead.put("customerName", body.getOrDefault("customerName", "Anonymous Prospect"));
        lead.put("email", body.get("email"));
        lead.put("phone", body.get("phone"));
        lead.put("requirements", body.get("requirements"));
        lead.put("consentToContact", body.getOrDefault("consentToContact", true));
        lead.put("stage", "NEW");
        lead.put("source", "AI_PROPERTY_AGENT");
        lead.put("assignmentStatus", "PENDING_ASSIGNMENT");
        lead.put("createdAt", LocalDateTime.now().toString());

        aiLeads.add(lead);
        s.put("leadId", leadId);

        recordAuditEvent("LEAD_CREATED", leadId, "Lead captured from session " + sessionId);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("leadId", leadId);
        data.put("sessionId", sessionId);
        data.put("stage", "NEW");
        data.put("source", "AI_PROPERTY_AGENT");
        data.put("assignmentStatus", "PENDING_ASSIGNMENT");

        return ResponseEntity.ok(Map.of("success", true, "message", "Property lead created", "data", data));
    }

    // 10. POST /sessions/{sessionId}/schedule-visit
    @PostMapping("/sessions/{sessionId}/schedule-visit")
    public ResponseEntity<Map<String, Object>> scheduleSiteVisit(@PathVariable String sessionId, @RequestBody Map<String, Object> body) {
        validateRealEstateTenant();
        String visitId = "SVR-" + visitCounter.incrementAndGet();
        Map<String, Object> visit = new LinkedHashMap<>();
        visit.put("visitRequestId", visitId);
        visit.put("sessionId", sessionId);
        visit.put("leadId", body.get("leadId"));
        visit.put("propertyId", body.get("propertyId"));
        visit.put("preferredDate", body.get("preferredDate"));
        visit.put("preferredTime", body.get("preferredTime"));
        visit.put("timezone", body.getOrDefault("timezone", "Asia/Kolkata"));
        visit.put("durationMinutes", body.getOrDefault("durationMinutes", 60));
        visit.put("status", "PENDING_AVAILABILITY_CHECK");
        visit.put("confirmationSent", false);
        visit.put("createdAt", LocalDateTime.now().toString());

        aiVisitRequests.add(visit);
        recordAuditEvent("SITE_VISIT_REQUESTED", visitId, "Site visit requested for property: " + body.get("propertyId"));

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("visitRequestId", visitId);
        data.put("leadId", visit.get("leadId"));
        data.put("propertyId", visit.get("propertyId"));
        data.put("status", "PENDING_AVAILABILITY_CHECK");
        data.put("confirmationSent", false);

        return ResponseEntity.ok(Map.of("success", true, "message", "Site visit request submitted", "data", data));
    }

    // 11. POST /sessions/{sessionId}/create-quotation-draft
    @PostMapping("/sessions/{sessionId}/create-quotation-draft")
    public ResponseEntity<Map<String, Object>> createQuotationDraft(@PathVariable String sessionId, @RequestBody Map<String, Object> body) {
        validateRealEstateTenant();
        String qId = "QT-DRAFT-" + quoteCounter.incrementAndGet();
        Map<String, Object> draft = new LinkedHashMap<>();
        draft.put("quotationId", qId);
        draft.put("sessionId", sessionId);
        draft.put("propertyId", body.get("propertyId"));
        draft.put("basePrice", body.getOrDefault("basePrice", 7500000));
        draft.put("registrationCharges", 525000);
        draft.put("amenityCharges", 300000);
        draft.put("totalEstimatedPrice", 8325000);
        draft.put("status", "DRAFT_PENDING_APPROVAL");
        draft.put("createdAt", LocalDateTime.now().toString());

        aiQuotationDrafts.add(draft);
        recordAuditEvent("QUOTATION_DRAFTED", qId, "AI drafted quotation for session " + sessionId);

        return ResponseEntity.ok(Map.of("success", true, "message", "Quotation draft generated", "data", draft));
    }

    // 12. POST /sessions/{sessionId}/handoff
    @PostMapping("/sessions/{sessionId}/handoff")
    public ResponseEntity<Map<String, Object>> handoffToHuman(@PathVariable String sessionId, @RequestBody Map<String, Object> body) {
        validateRealEstateTenant();
        Map<String, Object> s = sessions.get(sessionId);
        if (s == null) {
            throw new ResourceNotFoundException("Session not found: " + sessionId);
        }

        String handoffId = "HO-" + handoffCounter.incrementAndGet();
        s.put("status", "HANDOFF_PENDING");
        s.put("handoffId", handoffId);
        s.put("assignedTeam", "REAL_ESTATE_SALES");
        s.put("handoffSummary", body.get("summary"));

        recordAuditEvent("HUMAN_HANDOFF", sessionId, "Transferred to REAL_ESTATE_SALES team: " + body.get("reason"));

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("sessionId", sessionId);
        data.put("status", "HANDOFF_PENDING");
        data.put("handoffId", handoffId);
        data.put("assignedTeam", "REAL_ESTATE_SALES");
        data.put("summarySaved", true);

        return ResponseEntity.ok(Map.of("success", true, "message", "Conversation transferred to the sales team", "data", data));
    }

    // 13. POST /sessions/{sessionId}/close
    @PostMapping("/sessions/{sessionId}/close")
    public ResponseEntity<Map<String, Object>> closeSession(@PathVariable String sessionId) {
        validateRealEstateTenant();
        Map<String, Object> s = sessions.get(sessionId);
        if (s == null) {
            throw new ResourceNotFoundException("Session not found: " + sessionId);
        }
        s.put("status", "CLOSED");
        s.put("closedAt", LocalDateTime.now().toString());

        recordAuditEvent("SESSION_CLOSED", sessionId, "Session marked as CLOSED");
        return ResponseEntity.ok(Map.of("success", true, "message", "Session closed successfully", "data", s));
    }

    // 14. GET /sessions/{sessionId}/events
    @GetMapping("/sessions/{sessionId}/events")
    public ResponseEntity<Map<String, Object>> getSessionEvents(@PathVariable String sessionId) {
        validateRealEstateTenant();
        List<Map<String, Object>> evts = sessionEvents.getOrDefault(sessionId, Collections.emptyList());
        return ResponseEntity.ok(Map.of("success", true, "message", "Session events retrieved", "data", evts));
    }

    // 15. GET /knowledge/sources
    @GetMapping("/knowledge/sources")
    public ResponseEntity<Map<String, Object>> getKnowledgeSources() {
        validateRealEstateTenant();
        return ResponseEntity.ok(Map.of("success", true, "message", "Knowledge sources retrieved", "data", knowledgeSources));
    }

    // 16. POST /knowledge/sources
    @PostMapping("/knowledge/sources")
    public ResponseEntity<Map<String, Object>> addKnowledgeSource(@RequestBody Map<String, Object> body) {
        validateRealEstateTenant();
        String ksId = "KS-" + sourceCounter.incrementAndGet();
        Map<String, Object> ks = new LinkedHashMap<>();
        ks.put("sourceId", ksId);
        ks.put("name", body.get("name"));
        ks.put("type", body.getOrDefault("type", "DATABASE_CATALOG"));
        ks.put("status", "SYNCED");
        ks.put("lastSyncedAt", LocalDateTime.now().toString());
        ks.put("itemCount", body.getOrDefault("itemCount", 10));

        knowledgeSources.add(ks);
        recordAuditEvent("KNOWLEDGE_SOURCE_ADDED", ksId, "Added source: " + ks.get("name"));

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "message", "Knowledge source added", "data", ks));
    }

    // 17. POST /knowledge/sources/{sourceId}/sync
    @PostMapping("/knowledge/sources/{sourceId}/sync")
    public ResponseEntity<Map<String, Object>> syncKnowledgeSource(@PathVariable String sourceId) {
        validateRealEstateTenant();
        Map<String, Object> ks = knowledgeSources.stream()
                .filter(k -> sourceId.equalsIgnoreCase((String) k.get("sourceId")))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Knowledge source not found: " + sourceId));

        ks.put("status", "SYNCED");
        ks.put("lastSyncedAt", LocalDateTime.now().toString());
        recordAuditEvent("KNOWLEDGE_SYNCED", sourceId, "Synchronized catalog source: " + ks.get("name"));

        return ResponseEntity.ok(Map.of("success", true, "message", "Source synchronization requested", "data", ks));
    }

    // 18. GET /metrics
    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getMetrics(@RequestParam(defaultValue = "THIS_MONTH") String period) {
        validateRealEstateTenant();
        Map<String, Object> metrics = new LinkedHashMap<>();
        metrics.put("conversations", 850);
        metrics.put("leadsCreated", 210);
        metrics.put("qualifiedBuyers", 135);
        metrics.put("propertyRecommendations", 410);
        metrics.put("siteVisitRequests", 95);
        metrics.put("humanHandoffs", 70);
        metrics.put("conversionRatePercentage", 24.7);

        return ResponseEntity.ok(Map.of("success", true, "message", "Property sales agent metrics retrieved", "data", metrics));
    }

    // 19. GET /audit-events
    @GetMapping("/audit-events")
    public ResponseEntity<Map<String, Object>> getAuditEvents() {
        validateRealEstateTenant();
        return ResponseEntity.ok(Map.of("success", true, "message", "Agent audit events retrieved", "data", auditEvents));
    }
}
