package com.zenelait.crm.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Zenelait AI CRM — Real Estate Tenant 4 Roles V1 REST API Controller
 * Base URL: /api/v1/real-estate
 * Covers:
 * 1. Real Estate Sales Manager (KPIs, Properties, Leads, Routing, Pipeline, Team, Visits, Quotations, Bookings, Automations, Reports)
 * 2. Property Sales Executive (Dashboard, My Leads, Property Search, Interaction Timeline, Quotations Draft, Booking Requests, My Follow-ups, AI Recommendations)
 * 3. Customer Relationship Manager (CRM Dashboard, Customers, Customer Timeline, Communications, Requests, Complaints, Feedback, Booking Updates, AI Summaries)
 * 4. Site Visit Coordinator (Coordinator Dashboard, Calendar, Availability Slots, Rescheduling, Check-in/Check-out, Outcomes, Checklists, Feedback)
 */
@RestController
@RequestMapping("/api/v1/real-estate")
@CrossOrigin(origins = "*")
public class RealEstateOperationsV1Controller {

    private final List<Map<String, Object>> properties = new ArrayList<>();
    private final List<Map<String, Object>> leads = new ArrayList<>();
    private final List<Map<String, Object>> teamMembers = new ArrayList<>();
    private final List<Map<String, Object>> siteVisits = new ArrayList<>();
    private final List<Map<String, Object>> quotations = new ArrayList<>();
    private final List<Map<String, Object>> bookings = new ArrayList<>();
    private final List<Map<String, Object>> bookingRequests = new ArrayList<>();
    private final List<Map<String, Object>> automationRules = new ArrayList<>();
    private final List<Map<String, Object>> customers = new ArrayList<>();
    private final Map<String, List<Map<String, Object>>> customerCommunications = new LinkedHashMap<>();
    private final List<Map<String, Object>> customerRequests = new ArrayList<>();
    private final List<Map<String, Object>> complaints = new ArrayList<>();
    private final List<Map<String, Object>> customerFeedbacks = new ArrayList<>();
    private final List<Map<String, Object>> followUps = new ArrayList<>();
    private final Map<String, List<Map<String, Object>>> leadActivities = new LinkedHashMap<>();
    private final Map<String, List<Map<String, Object>>> visitChecklists = new LinkedHashMap<>();

    public RealEstateOperationsV1Controller() {
        initRealEstateData();
    }

    private void initRealEstateData() {
        // Properties
        properties.add(buildProperty("PROP-RE-101", "Skyline Residency", "APARTMENT", "SALE", "Chennai", "Chennai", 6500000, "INR", 2, 2, 1100, "AVAILABLE", "Modern 2BHK"));
        properties.add(buildProperty("PROP-RE-102", "Green Valley Apartments", "APARTMENT", "SALE", "Chennai", "Chennai", 6800000, "INR", 2, 2, 1150, "AVAILABLE", "Spacious 2BHK"));
        properties.add(buildProperty("PROP-1001", "Green Valley Apartment", "APARTMENT", "SALE", "Chennai", "OMR", 7500000, "INR", 3, 2, 1450, "AVAILABLE", "Three-bedroom apartment near major IT offices"));
        properties.add(buildProperty("PROP-1002", "Skyline Azure Penthouse", "PENTHOUSE", "SALE", "Chennai", "ECR", 18500000, "INR", 4, 4, 3200, "AVAILABLE", "Luxury sea-facing penthouse with private jacuzzi"));
        properties.add(buildProperty("PROP-1003", "Silver Oak Villas", "VILLA", "SALE", "Bengaluru", "Whitefield", 24000000, "INR", 4, 4, 3600, "AVAILABLE", "Gated villa with private garden near ITPL"));
        properties.add(buildProperty("PROP-1004", "Metro Prime Suites", "APARTMENT", "SALE", "Coimbatore", "Saravanampatti", 6200000, "INR", 2, 2, 1080, "AVAILABLE", "Ready-to-move 2BHK near tech corridor"));

        // Sales Team
        teamMembers.add(new LinkedHashMap<>(Map.of("userId", "USR-3001", "name", "Arun Kumar", "role", "PROPERTY_SALES_EXECUTIVE", "activeLeads", 18, "closedDeals", 6, "achievedValue", 4500000, "targetValue", 6000000, "rating", 4.8)));
        teamMembers.add(new LinkedHashMap<>(Map.of("userId", "USR-3002", "name", "Priya Devi", "role", "PROPERTY_SALES_EXECUTIVE", "activeLeads", 14, "closedDeals", 5, "achievedValue", 3800000, "targetValue", 5000000, "rating", 4.7)));
        teamMembers.add(new LinkedHashMap<>(Map.of("userId", "USR-4001", "name", "Deepa Rao", "role", "SITE_VISIT_COORDINATOR", "assignedVisits", 12, "completedVisits", 24, "rating", 4.9)));
        teamMembers.add(new LinkedHashMap<>(Map.of("userId", "USR-5001", "name", "Pooja Iyer", "role", "CUSTOMER_RELATIONS_MANAGER", "openRequests", 8, "openComplaints", 3, "resolvedScore", 4.85)));

        // Leads
        leads.add(buildLead("RL-2001", "Arun Kumar", "arun@example.com", "+919876543210", "PROP-1001", "Green Valley Apartment", "WEBSITE", 6000000, 8000000, "OMR", "QUALIFIED", "USR-3001"));
        leads.add(buildLead("RL-2002", "Pooja Hegde", "pooja@investcorp.in", "+919840233445", "PROP-1002", "Skyline Azure Penthouse", "MAGICBRICKS", 15000000, 20000000, "ECR", "SITE_VISIT_SCHEDULED", "USR-3001"));
        leads.add(buildLead("RL-2003", "Karthik Subramanian", "karthik.sub@gmail.com", "+919840122334", "PROP-1004", "Metro Prime Suites", "WHATSAPP", 5500000, 7000000, "OMR", "NEW", null));
        leads.add(buildLead("RL-2004", "Suresh Menon", "suresh.m@yahoo.com", "+919840344556", "PROP-1003", "Silver Oak Villas", "REFERRAL", 20000000, 26000000, "Whitefield", "PRICE_NEGOTIATION", "USR-3002"));

        // Activities
        leadActivities.put("RL-2001", new ArrayList<>(List.of(
                buildActivity("ACT-8001", "RL-2001", "CALL", "Discussed property pricing and floor plans", "INTERESTED", "USR-3001", "2026-10-28T10:00:00+05:30")
        )));

        // Site Visits
        siteVisits.add(buildSiteVisit("SV-5001", "RL-2001", "PROP-1001", "CUS-4001", "Arun Kumar", "Green Valley Apartment", "2026-10-28T10:00:00+05:30", 60, "USR-4001", "USR-3001", "SCHEDULED", "Customer requested morning visit"));
        siteVisits.add(buildSiteVisit("SV-5002", "RL-2002", "PROP-1002", "CUS-4002", "Pooja Hegde", "Skyline Azure Penthouse", "2026-10-28T14:00:00+05:30", 60, "USR-4001", "USR-3001", "CONFIRMED", "High intent luxury buyer tour"));

        // Checklists
        visitChecklists.put("SV-5001", new ArrayList<>(List.of(
                new LinkedHashMap<>(Map.of("itemCode", "PROPERTY_ACCESS", "completed", true, "notes", "Access confirmed")),
                new LinkedHashMap<>(Map.of("itemCode", "PROPERTY_CLEANLINESS", "completed", true, "notes", "Property ready for viewing")),
                new LinkedHashMap<>(Map.of("itemCode", "CUSTOMER_DOCUMENTS", "completed", false, "notes", "No documents required at this stage"))
        )));

        // Quotations
        quotations.add(buildQuotation("QUO-6001", "RL-2001", "PROP-1001", 7500000, 100000, 150000, 7550000, "INR", "DRAFT", "2026-11-10"));
        quotations.add(buildQuotation("QUO-6002", "RL-2002", "PROP-1002", 18500000, 250000, 300000, 18550000, "INR", "APPROVED", "2026-11-15"));

        // Bookings
        bookings.add(new LinkedHashMap<>(Map.of(
                "bookingId", "BK-7001",
                "leadId", "RL-2001",
                "propertyId", "PROP-1001",
                "quotationId", "QUO-6001",
                "customerName", "Arun Kumar",
                "propertyName", "Green Valley Apartment",
                "bookingAmount", 100000,
                "currency", "INR",
                "status", "PENDING_VERIFICATION",
                "createdAt", "2026-10-26T09:10:00+05:30"
        )));

        // Booking Requests
        bookingRequests.add(new LinkedHashMap<>(Map.of(
                "bookingRequestId", "BR-7002",
                "leadId", "RL-2001",
                "propertyId", "PROP-1001",
                "status", "PENDING_VERIFICATION",
                "submittedBy", "USR-3001",
                "createdAt", "2026-10-26T09:12:00+05:30"
        )));

        // Customers
        customers.add(new LinkedHashMap<>(Map.of(
                "customerId", "CUS-4001",
                "customerName", "Arun Kumar",
                "email", "arun@example.com",
                "phoneMasked", "******3210",
                "relationshipStatus", "ACTIVE",
                "assignedExecutiveId", "USR-3001",
                "openRequests", 1,
                "openComplaints", 0,
                "totalBookings", 1
        )));
        customers.add(new LinkedHashMap<>(Map.of(
                "customerId", "CUS-4002",
                "customerName", "Pooja Hegde",
                "email", "pooja@investcorp.in",
                "phoneMasked", "******4455",
                "relationshipStatus", "VIP",
                "assignedExecutiveId", "USR-3001",
                "openRequests", 0,
                "openComplaints", 1,
                "totalBookings", 0
        )));

        // Customer Communications
        customerCommunications.put("CUS-4001", new ArrayList<>(List.of(
                new LinkedHashMap<>(Map.of(
                        "communicationId", "COM-5001",
                        "customerId", "CUS-4001",
                        "channel", "PHONE",
                        "direction", "OUTBOUND",
                        "subject", "Property visit confirmation",
                        "summary", "Confirmed the planned site visit for Oct 28",
                        "outcome", "CUSTOMER_CONFIRMED",
                        "recordedBy", "USR-5001",
                        "createdAt", "2026-10-26T09:20:00+05:30"
                ))
        )));

        // Customer Requests
        customerRequests.add(new LinkedHashMap<>(Map.of(
                "requestId", "CR-6001",
                "customerId", "CUS-4001",
                "relatedBookingId", "BK-7001",
                "category", "DOCUMENT_REQUEST",
                "subject", "Request for property documents",
                "description", "Customer needs approved RERA and floor plan",
                "status", "OPEN",
                "priority", "NORMAL",
                "assignedTo", "USR-5001",
                "createdAt", "2026-10-26T09:22:00+05:30"
        )));

        // Complaints
        complaints.add(new LinkedHashMap<>(Map.of(
                "complaintId", "CMP-7001",
                "customerId", "CUS-4001",
                "relatedBookingId", "BK-7001",
                "category", "BOOKING_DELAY",
                "subject", "Delay in booking confirmation",
                "description", "Customer reports that confirmation has not arrived within 24h",
                "priority", "HIGH",
                "status", "OPEN",
                "assignedTo", "USR-5001",
                "createdAt", "2026-10-26T09:10:00+05:30"
        )));

        // Customer Feedback
        customerFeedbacks.add(new LinkedHashMap<>(Map.of(
                "feedbackId", "FDB-8001",
                "customerId", "CUS-4001",
                "relatedSiteVisitId", "SV-5001",
                "rating", 5,
                "category", "SITE_VISIT_EXPERIENCE",
                "comments", "The property tour was well organized and coordinator was helpful",
                "status", "RECORDED",
                "createdAt", "2026-10-26T09:25:00+05:30"
        )));

        // Follow-ups
        followUps.add(new LinkedHashMap<>(Map.of(
                "taskId", "TSK-9001",
                "customerId", "CUS-4001",
                "leadId", "RL-2001",
                "assignedTo", "USR-3001",
                "title", "Follow-up after site visit",
                "dueAt", "2026-10-28T18:00:00+05:30",
                "status", "PENDING",
                "priority", "HIGH"
        )));

        // Automation Rules
        automationRules.add(new LinkedHashMap<>(Map.of(
                "ruleId", "AUT-9001",
                "name", "New property lead follow-up",
                "trigger", "LEAD_CREATED",
                "delayMinutes", 30,
                "action", "CREATE_FOLLOW_UP_TASK",
                "status", "ACTIVE",
                "enabled", true
        )));
        automationRules.add(new LinkedHashMap<>(Map.of(
                "ruleId", "AUT-9002",
                "name", "Post site visit feedback trigger",
                "trigger", "VISIT_COMPLETED",
                "delayMinutes", 60,
                "action", "SEND_FEEDBACK_REQUEST",
                "status", "ACTIVE",
                "enabled", true
        )));
    }

    private Map<String, Object> envelope(String message, Object data, String reqId) {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", true);
        resp.put("message", message);
        resp.put("data", data);
        resp.put("timestamp", "2026-10-26T09:00:00+05:30");
        resp.put("requestId", reqId != null ? reqId : "req_" + (System.currentTimeMillis() % 1000000));
        return resp;
    }

    private Map<String, Object> errorEnvelope(String message, List<Map<String, String>> errors, String reqId) {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", false);
        resp.put("message", message);
        resp.put("errors", errors);
        resp.put("timestamp", "2026-10-26T09:00:00+05:30");
        resp.put("requestId", reqId != null ? reqId : "req_" + (System.currentTimeMillis() % 1000000));
        return resp;
    }

    // =========================================================================
    // ROLE 1: REAL ESTATE SALES MANAGER APIS
    // =========================================================================

    @GetMapping("/sales-manager/dashboard")
    public ResponseEntity<Map<String, Object>> getSalesManagerDashboard(
            @RequestParam(required = false, defaultValue = "THIS_MONTH") String period
    ) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("period", period);
        data.put("totalLeads", 248);
        data.put("newLeads", 42);
        data.put("qualifiedLeads", 96);
        data.put("siteVisitsScheduled", 35);
        data.put("siteVisitsCompleted", 22);
        data.put("activeNegotiations", 18);
        data.put("bookingsCompleted", 9);
        data.put("salesTarget", 10000000);
        data.put("salesAchieved", 6400000);
        data.put("targetAchievementPercentage", 64.0);
        data.put("teamMembers", teamMembers.size());
        data.put("pendingFollowUps", 27);

        return ResponseEntity.ok(envelope("Sales manager dashboard loaded", data, "req_resm_001"));
    }

    @GetMapping("/properties")
    public ResponseEntity<Map<String, Object>> getProperties(
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer bedrooms,
            @RequestParam(required = false) Double maxPrice
    ) {
        List<Map<String, Object>> filtered = properties.stream().filter(p -> {
            if (location != null && !location.isEmpty() && !location.equalsIgnoreCase((String) p.get("city")) && !location.equalsIgnoreCase((String) p.get("area")) && !location.equalsIgnoreCase((String) p.get("location"))) return false;
            if (bedrooms != null && !bedrooms.equals(p.get("bedrooms"))) return false;
            if (maxPrice != null && ((Number) p.get("price")).doubleValue() > maxPrice) return false;
            return true;
        }).collect(Collectors.toList());

        Map<String, Object> resp = envelope("Properties retrieved", filtered, "req_prop_001");
        resp.put("items", filtered);
        resp.put("totalElements", filtered.size());
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/buyer-requirements")
    public ResponseEntity<Map<String, Object>> captureBuyerRequirement(@RequestBody Map<String, Object> body) {
        String id = "REQ-RE-2001";
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("id", id);
        res.put("leadId", body.get("leadId"));
        res.put("status", "CAPTURED");
        res.put("matchingPropertiesCount", 2);
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @PostMapping("/matches")
    public ResponseEntity<Map<String, Object>> matchProperties(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(Map.of(
                "matchingProperties", properties,
                "count", properties.size()
        ));
    }

    @PostMapping("/properties")
    public ResponseEntity<Map<String, Object>> createProperty(@RequestBody Map<String, Object> req) {
        String propId = "PROP-" + (1000 + properties.size() + 1);
        String name = (String) req.getOrDefault("propertyName", "New Property Listing");
        String pType = (String) req.getOrDefault("propertyType", "APARTMENT");
        String tType = (String) req.getOrDefault("transactionType", "SALE");
        Number price = (Number) req.getOrDefault("price", 7500000);
        String curr = (String) req.getOrDefault("currency", "INR");
        int beds = req.get("bedrooms") != null ? ((Number) req.get("bedrooms")).intValue() : 3;
        int baths = req.get("bathrooms") != null ? ((Number) req.get("bathrooms")).intValue() : 2;
        int area = req.get("areaSqFt") != null ? ((Number) req.get("areaSqFt")).intValue() : 1450;
        String desc = (String) req.getOrDefault("description", "Quality property near key amenities");

        Map<String, Object> locMap = (Map<String, Object>) req.get("location");
        String city = locMap != null ? (String) locMap.getOrDefault("city", "Chennai") : "Chennai";
        String areaName = locMap != null ? (String) locMap.getOrDefault("area", "OMR") : "OMR";

        Map<String, Object> prop = buildProperty(propId, name, pType, tType, city, areaName, price.doubleValue(), curr, beds, baths, area, "AVAILABLE", desc);
        properties.add(0, prop);

        Map<String, Object> respData = new LinkedHashMap<>();
        respData.put("propertyId", propId);
        respData.put("propertyName", name);
        respData.put("propertyType", pType);
        respData.put("transactionType", tType);
        respData.put("price", price);
        respData.put("currency", curr);
        respData.put("availabilityStatus", "AVAILABLE");
        respData.put("createdAt", "2026-10-26T09:00:00+05:30");

        return ResponseEntity.status(HttpStatus.CREATED).body(envelope("Property created successfully", respData, "req_prop_002"));
    }

    @GetMapping("/properties/{propertyId}")
    public ResponseEntity<Map<String, Object>> getProperty(@PathVariable String propertyId) {
        Optional<Map<String, Object>> prop = properties.stream().filter(p -> propertyId.equalsIgnoreCase((String) p.get("propertyId"))).findFirst();
        if (prop.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorEnvelope("Property not found", List.of(Map.of("field", "propertyId", "message", "Property does not exist")), "req_prop_err"));
        }
        return ResponseEntity.ok(envelope("Property details retrieved", prop.get(), "req_prop_003"));
    }

    @PatchMapping("/properties/{propertyId}")
    public ResponseEntity<Map<String, Object>> updateProperty(@PathVariable String propertyId, @RequestBody Map<String, Object> req) {
        Optional<Map<String, Object>> propOpt = properties.stream().filter(p -> propertyId.equalsIgnoreCase((String) p.get("propertyId"))).findFirst();
        if (propOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorEnvelope("Property not found", List.of(Map.of("field", "propertyId", "message", "Property not found")), "req_prop_err"));
        }
        Map<String, Object> prop = propOpt.get();
        req.forEach((k, v) -> {
            if (!"propertyId".equals(k)) prop.put(k, v);
        });
        return ResponseEntity.ok(envelope("Property updated successfully", prop, "req_prop_004"));
    }

    @GetMapping("/leads")
    public ResponseEntity<Map<String, Object>> getLeads() {
        return ResponseEntity.ok(envelope("Leads retrieved", leads, "req_lead_001"));
    }

    @PostMapping("/leads")
    public ResponseEntity<Map<String, Object>> createLead(@RequestBody Map<String, Object> req) {
        String leadId = "RL-" + (2000 + leads.size() + 1);
        String name = (String) req.getOrDefault("customerName", "Prospective Buyer");
        String email = (String) req.getOrDefault("email", "buyer@example.com");
        String phone = (String) req.getOrDefault("phone", "+919876543210");
        String propId = (String) req.getOrDefault("propertyId", "PROP-1001");
        String source = (String) req.getOrDefault("leadSource", "WEBSITE");
        double bMin = req.get("budgetMin") != null ? ((Number) req.get("budgetMin")).doubleValue() : 6000000;
        double bMax = req.get("budgetMax") != null ? ((Number) req.get("budgetMax")).doubleValue() : 8000000;
        String loc = (String) req.getOrDefault("preferredLocation", "OMR");

        Map<String, Object> lead = buildLead(leadId, name, email, phone, propId, "Green Valley Apartment", source, bMin, bMax, loc, "NEW", null);
        leads.add(0, lead);

        Map<String, Object> respData = new LinkedHashMap<>();
        respData.put("leadId", leadId);
        respData.put("customerName", name);
        respData.put("propertyId", propId);
        respData.put("leadSource", source);
        respData.put("stage", "NEW");
        respData.put("assignedTo", null);
        respData.put("createdAt", "2026-10-26T09:05:00+05:30");

        return ResponseEntity.status(HttpStatus.CREATED).body(envelope("Property lead created successfully", respData, "req_lead_002"));
    }

    @GetMapping("/leads/{leadId}")
    public ResponseEntity<Map<String, Object>> getLead(@PathVariable String leadId) {
        Optional<Map<String, Object>> lead = leads.stream().filter(l -> leadId.equalsIgnoreCase((String) l.get("leadId"))).findFirst();
        if (lead.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorEnvelope("Lead not found", List.of(Map.of("field", "leadId", "message", "Lead does not exist")), "req_lead_err"));
        }
        return ResponseEntity.ok(envelope("Lead details retrieved", lead.get(), "req_lead_003"));
    }

    @PatchMapping("/leads/{leadId}")
    public ResponseEntity<Map<String, Object>> updateLead(@PathVariable String leadId, @RequestBody Map<String, Object> req) {
        Optional<Map<String, Object>> leadOpt = leads.stream().filter(l -> leadId.equalsIgnoreCase((String) l.get("leadId"))).findFirst();
        if (leadOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorEnvelope("Lead not found", List.of(Map.of("field", "leadId", "message", "Lead does not exist")), "req_lead_err"));
        }
        Map<String, Object> lead = leadOpt.get();
        req.forEach((k, v) -> {
            if (!"leadId".equals(k)) lead.put(k, v);
        });
        return ResponseEntity.ok(envelope("Lead updated successfully", lead, "req_lead_004"));
    }

    @PostMapping("/leads/{leadId}/assign")
    public ResponseEntity<Map<String, Object>> assignLead(@PathVariable String leadId, @RequestBody Map<String, Object> req) {
        Optional<Map<String, Object>> leadOpt = leads.stream().filter(l -> leadId.equalsIgnoreCase((String) l.get("leadId"))).findFirst();
        if (leadOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorEnvelope("Lead not found", List.of(Map.of("field", "leadId", "message", "Lead does not exist")), "req_lead_err"));
        }
        String execId = (String) req.getOrDefault("salesExecutiveId", "USR-3001");
        Map<String, Object> lead = leadOpt.get();
        lead.put("assignedTo", execId);
        lead.put("stage", "ASSIGNED");

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("leadId", leadId);
        data.put("assignedTo", execId);
        data.put("assignedBy", "USR-1001");
        data.put("assignmentStatus", "ASSIGNED");

        return ResponseEntity.ok(envelope("Lead assigned successfully", data, "req_assign_001"));
    }

    @GetMapping("/sales-pipeline")
    public ResponseEntity<Map<String, Object>> getSalesPipeline(
            @RequestParam(required = false, defaultValue = "THIS_MONTH") String period,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "20") int size
    ) {
        List<Map<String, Object>> items = leads.stream().map(l -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("leadId", l.get("leadId"));
            m.put("customerName", l.get("customerName"));
            m.put("propertyName", l.get("propertyName"));
            m.put("stage", l.get("stage"));
            m.put("estimatedValue", l.get("budgetMax"));
            m.put("assignedExecutive", l.get("assignedTo"));
            m.put("nextFollowUpAt", "2026-10-28T10:00:00+05:30");
            return m;
        }).collect(Collectors.toList());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("items", items);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", items.size());
        data.put("totalPages", 1);

        return ResponseEntity.ok(envelope("Sales pipeline retrieved", data, "req_pipe_001"));
    }

    @PatchMapping("/leads/{leadId}/stage")
    public ResponseEntity<Map<String, Object>> updateLeadStage(@PathVariable String leadId, @RequestBody Map<String, Object> req) {
        Optional<Map<String, Object>> leadOpt = leads.stream().filter(l -> leadId.equalsIgnoreCase((String) l.get("leadId"))).findFirst();
        if (leadOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorEnvelope("Lead not found", List.of(Map.of("field", "leadId", "message", "Lead does not exist")), "req_lead_err"));
        }
        Map<String, Object> lead = leadOpt.get();
        String prevStage = (String) lead.get("stage");
        String nextStage = (String) req.getOrDefault("stage", "QUALIFIED");
        lead.put("stage", nextStage);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("leadId", leadId);
        data.put("previousStage", prevStage);
        data.put("currentStage", nextStage);
        data.put("updatedBy", "USR-1001");

        return ResponseEntity.ok(envelope("Lead stage updated successfully", data, "req_stage_001"));
    }

    @GetMapping("/team")
    public ResponseEntity<Map<String, Object>> getTeam() {
        return ResponseEntity.ok(envelope("Sales team members retrieved", teamMembers, "req_team_001"));
    }

    @GetMapping("/team/performance")
    public ResponseEntity<Map<String, Object>> getTeamPerformance(
            @RequestParam(required = false, defaultValue = "THIS_MONTH") String period
    ) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("period", period);
        data.put("teamMembers", teamMembers);
        data.put("topPerformer", "Arun Kumar");
        data.put("averageConversionRate", 24.5);
        data.put("totalRevenueAchieved", 8300000);
        return ResponseEntity.ok(envelope("Team performance reviewed", data, "req_team_002"));
    }

    @PostMapping("/leads/{leadId}/activities")
    public ResponseEntity<Map<String, Object>> createLeadActivity(@PathVariable String leadId, @RequestBody Map<String, Object> req) {
        String actId = "ACT-" + (8000 + (int)(Math.random() * 1000));
        String type = (String) req.getOrDefault("activityType", "CALL");
        String outcome = (String) req.getOrDefault("outcome", "INTERESTED");
        String summary = (String) req.getOrDefault("summary", "Customer conversation recorded");

        Map<String, Object> act = new LinkedHashMap<>();
        act.put("activityId", actId);
        act.put("leadId", leadId);
        act.put("activityType", type);
        act.put("summary", summary);
        act.put("outcome", outcome);
        act.put("createdBy", req.getOrDefault("createdBy", "USR-3001"));
        act.put("createdAt", "2026-10-26T09:30:00+05:30");

        leadActivities.computeIfAbsent(leadId, k -> new ArrayList<>()).add(0, act);

        return ResponseEntity.status(HttpStatus.CREATED).body(envelope("Activity recorded", act, "req_act_001"));
    }

    @GetMapping("/leads/{leadId}/activities")
    public ResponseEntity<Map<String, Object>> getLeadActivities(@PathVariable String leadId) {
        List<Map<String, Object>> list = leadActivities.getOrDefault(leadId, Collections.emptyList());
        return ResponseEntity.ok(envelope("Lead activity history retrieved", list, "req_act_002"));
    }

    @PostMapping("/site-visits")
    public ResponseEntity<Map<String, Object>> scheduleSiteVisit(@RequestBody Map<String, Object> req) {
        String visitId = "SV-" + (5000 + siteVisits.size() + 1);
        String leadId = (String) req.getOrDefault("leadId", "RL-2001");
        String propId = (String) req.getOrDefault("propertyId", "PROP-1001");
        String schedAt = (String) req.getOrDefault("scheduledAt", "2026-10-28T10:00:00+05:30");
        String coordId = (String) req.getOrDefault("assignedCoordinatorId", "USR-4001");
        String notes = (String) req.getOrDefault("notes", "Customer requested property tour");

        Map<String, Object> sv = buildSiteVisit(visitId, leadId, propId, "CUS-4001", "Arun Kumar", "Green Valley Apartment", schedAt, 60, coordId, "USR-3001", "SCHEDULED", notes);
        siteVisits.add(0, sv);

        Map<String, Object> respData = new LinkedHashMap<>();
        respData.put("siteVisitId", visitId);
        respData.put("leadId", leadId);
        respData.put("propertyId", propId);
        respData.put("status", "SCHEDULED");
        respData.put("scheduledAt", schedAt);
        respData.put("assignedCoordinatorId", coordId);

        return ResponseEntity.status(HttpStatus.CREATED).body(envelope("Site visit scheduled successfully", respData, "req_visit_001"));
    }

    @GetMapping("/site-visits")
    public ResponseEntity<Map<String, Object>> getSiteVisits(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String date,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "20") int size
    ) {
        List<Map<String, Object>> list = siteVisits;
        if (status != null && !status.isEmpty()) {
            list = list.stream().filter(v -> status.equalsIgnoreCase((String) v.get("status"))).collect(Collectors.toList());
        }
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("items", list);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", list.size());
        data.put("totalPages", 1);
        return ResponseEntity.ok(envelope("Site visits retrieved", data, "req_visit_002"));
    }

    @PostMapping("/quotations")
    public ResponseEntity<Map<String, Object>> createQuotation(@RequestBody Map<String, Object> req) {
        String quoId = "QUO-" + (6000 + quotations.size() + 1);
        String leadId = (String) req.getOrDefault("leadId", "RL-2001");
        String propId = (String) req.getOrDefault("propertyId", "PROP-1001");
        double base = req.get("basePrice") != null ? ((Number) req.get("basePrice")).doubleValue() : 7500000;
        double disc = req.get("discountAmount") != null ? ((Number) req.get("discountAmount")).doubleValue() : 100000;
        double addn = req.get("additionalCharges") != null ? ((Number) req.get("additionalCharges")).doubleValue() : 150000;
        double total = base - disc + addn;
        String curr = (String) req.getOrDefault("currency", "INR");
        String valid = (String) req.getOrDefault("validUntil", "2026-11-10");

        Map<String, Object> quo = buildQuotation(quoId, leadId, propId, base, disc, addn, total, curr, "DRAFT", valid);
        quotations.add(0, quo);

        return ResponseEntity.status(HttpStatus.CREATED).body(envelope("Quotation created successfully", quo, "req_quo_001"));
    }

    @GetMapping("/quotations/{quotationId}")
    public ResponseEntity<Map<String, Object>> getQuotation(@PathVariable String quotationId) {
        Optional<Map<String, Object>> quo = quotations.stream().filter(q -> quotationId.equalsIgnoreCase((String) q.get("quotationId"))).findFirst();
        if (quo.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorEnvelope("Quotation not found", List.of(Map.of("field", "quotationId", "message", "Quotation does not exist")), "req_quo_err"));
        }
        return ResponseEntity.ok(envelope("Quotation details retrieved", quo.get(), "req_quo_002"));
    }

    @PostMapping("/bookings")
    public ResponseEntity<Map<String, Object>> createBooking(@RequestBody Map<String, Object> req) {
        String bkId = "BK-" + (7000 + bookings.size() + 1);
        String leadId = (String) req.getOrDefault("leadId", "RL-2001");
        String propId = (String) req.getOrDefault("propertyId", "PROP-1001");
        double amt = req.get("bookingAmount") != null ? ((Number) req.get("bookingAmount")).doubleValue() : 100000;
        String curr = (String) req.getOrDefault("currency", "INR");

        Map<String, Object> bk = new LinkedHashMap<>();
        bk.put("bookingId", bkId);
        bk.put("leadId", leadId);
        bk.put("propertyId", propId);
        bk.put("customerName", "Arun Kumar");
        bk.put("propertyName", "Green Valley Apartment");
        bk.put("bookingAmount", amt);
        bk.put("currency", curr);
        bk.put("status", "PENDING_VERIFICATION");
        bk.put("createdAt", "2026-10-26T09:35:00+05:30");

        bookings.add(0, bk);
        return ResponseEntity.status(HttpStatus.CREATED).body(envelope("Property booking created", bk, "req_bk_001"));
    }

    @GetMapping("/bookings")
    public ResponseEntity<Map<String, Object>> getBookings() {
        return ResponseEntity.ok(envelope("Property bookings retrieved", bookings, "req_bk_002"));
    }

    @GetMapping("/reports/sales")
    public ResponseEntity<Map<String, Object>> getSalesReports(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to
    ) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("period", Map.of("from", from != null ? from : "2026-10-01", "to", to != null ? to : "2026-10-31"));
        data.put("totalRevenueAchieved", 6400000);
        data.put("targetRevenue", 10000000);
        data.put("totalBookings", bookings.size());
        data.put("conversionRate", 24.2);
        data.put("topPropertySold", "Green Valley Apartment");
        return ResponseEntity.ok(envelope("Sales reports generated", data, "req_rep_001"));
    }

    @GetMapping("/automation/rules")
    public ResponseEntity<Map<String, Object>> getAutomationRules() {
        return ResponseEntity.ok(envelope("Follow-up automation rules retrieved", automationRules, "req_auto_001"));
    }

    @PostMapping("/automation/rules")
    public ResponseEntity<Map<String, Object>> createAutomationRule(@RequestBody Map<String, Object> req) {
        String ruleId = "AUT-" + (9000 + automationRules.size() + 1);
        String name = (String) req.getOrDefault("name", "New Rule");
        String trigger = (String) req.getOrDefault("trigger", "LEAD_CREATED");
        int delay = req.get("delayMinutes") != null ? ((Number) req.get("delayMinutes")).intValue() : 30;
        String action = (String) req.getOrDefault("action", "CREATE_FOLLOW_UP_TASK");

        Map<String, Object> rule = new LinkedHashMap<>();
        rule.put("ruleId", ruleId);
        rule.put("name", name);
        rule.put("trigger", trigger);
        rule.put("delayMinutes", delay);
        rule.put("action", action);
        rule.put("status", "ACTIVE");
        rule.put("enabled", true);

        automationRules.add(0, rule);
        return ResponseEntity.status(HttpStatus.CREATED).body(envelope("Automation rule created", rule, "req_auto_002"));
    }

    @PatchMapping("/automation/rules/{ruleId}")
    public ResponseEntity<Map<String, Object>> updateAutomationRule(@PathVariable String ruleId, @RequestBody Map<String, Object> req) {
        Optional<Map<String, Object>> ruleOpt = automationRules.stream().filter(r -> ruleId.equalsIgnoreCase((String) r.get("ruleId"))).findFirst();
        if (ruleOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorEnvelope("Rule not found", List.of(Map.of("field", "ruleId", "message", "Rule does not exist")), "req_auto_err"));
        }
        Map<String, Object> rule = ruleOpt.get();
        req.forEach((k, v) -> {
            if (!"ruleId".equals(k)) rule.put(k, v);
        });
        return ResponseEntity.ok(envelope("Automation rule updated", rule, "req_auto_003"));
    }

    // =========================================================================
    // ROLE 2: PROPERTY SALES EXECUTIVE APIS
    // =========================================================================

    @GetMapping("/property-sales/dashboard")
    public ResponseEntity<Map<String, Object>> getPropertySalesDashboard(
            @RequestParam(required = false, defaultValue = "THIS_MONTH") String period
    ) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("assignedLeads", 32);
        data.put("newLeads", 8);
        data.put("qualifiedLeads", 12);
        data.put("siteVisitsScheduled", 6);
        data.put("siteVisitsCompleted", 4);
        data.put("quotationsPending", 3);
        data.put("bookingRequests", 2);
        data.put("followUpsDueToday", 5);
        data.put("salesAchieved", 1800000);
        data.put("currency", "INR");

        return ResponseEntity.ok(envelope("Property sales dashboard loaded", data, "req_pse_001"));
    }

    @GetMapping("/my-leads")
    public ResponseEntity<Map<String, Object>> getMyLeads(
            @RequestParam(required = false) String stage,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "10") int size
    ) {
        List<Map<String, Object>> filtered = leads.stream()
                .filter(l -> stage == null || stage.isEmpty() || stage.equalsIgnoreCase((String) l.get("stage")))
                .collect(Collectors.toList());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("items", filtered);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", filtered.size());
        data.put("totalPages", 1);

        return ResponseEntity.ok(envelope("Assigned leads retrieved", data, "req_pse_002"));
    }

    @GetMapping("/my-leads/{leadId}")
    public ResponseEntity<Map<String, Object>> getMyLead(@PathVariable String leadId) {
        return getLead(leadId);
    }

    @PatchMapping("/my-leads/{leadId}")
    public ResponseEntity<Map<String, Object>> updateMyLead(@PathVariable String leadId, @RequestBody Map<String, Object> req) {
        Optional<Map<String, Object>> leadOpt = leads.stream().filter(l -> leadId.equalsIgnoreCase((String) l.get("leadId"))).findFirst();
        if (leadOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorEnvelope("Lead not found", List.of(Map.of("field", "leadId", "message", "Lead does not exist")), "req_lead_err"));
        }
        Map<String, Object> lead = leadOpt.get();
        if (req.containsKey("preferredLocation")) lead.put("preferredLocation", req.get("preferredLocation"));
        if (req.containsKey("budgetMin")) lead.put("budgetMin", req.get("budgetMin"));
        if (req.containsKey("budgetMax")) lead.put("budgetMax", req.get("budgetMax"));
        if (req.containsKey("notes")) lead.put("notes", req.get("notes"));

        Map<String, Object> respData = new LinkedHashMap<>();
        respData.put("leadId", leadId);
        respData.put("preferredLocation", lead.get("preferredLocation"));
        respData.put("budgetMin", lead.get("budgetMin"));
        respData.put("budgetMax", lead.get("budgetMax"));
        respData.put("updatedBy", "USR-3001");

        return ResponseEntity.ok(envelope("Lead details updated", respData, "req_pse_003"));
    }

    @GetMapping("/properties/search")
    public ResponseEntity<Map<String, Object>> searchProperties(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String area,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Integer bedrooms
    ) {
        List<Map<String, Object>> results = properties.stream().filter(p -> {
            if (city != null && !city.equalsIgnoreCase((String) p.get("city"))) return false;
            if (area != null && !area.equalsIgnoreCase((String) p.get("area"))) return false;
            if (minPrice != null && ((Number) p.get("price")).doubleValue() < minPrice) return false;
            if (maxPrice != null && ((Number) p.get("price")).doubleValue() > maxPrice) return false;
            if (bedrooms != null && ((Number) p.get("bedrooms")).intValue() != bedrooms) return false;
            return true;
        }).collect(Collectors.toList());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("items", results);
        data.put("totalElements", results.size());

        return ResponseEntity.ok(envelope("Matching properties retrieved", data, "req_pse_004"));
    }

    @PostMapping("/my-leads/{leadId}/activities")
    public ResponseEntity<Map<String, Object>> createMyLeadActivity(@PathVariable String leadId, @RequestBody Map<String, Object> req) {
        return createLeadActivity(leadId, req);
    }

    @GetMapping("/my-leads/{leadId}/activities")
    public ResponseEntity<Map<String, Object>> getMyLeadActivities(@PathVariable String leadId) {
        return getLeadActivities(leadId);
    }

    @PatchMapping("/my-leads/{leadId}/stage")
    public ResponseEntity<Map<String, Object>> updateMyLeadStage(@PathVariable String leadId, @RequestBody Map<String, Object> req) {
        return updateLeadStage(leadId, req);
    }

    @GetMapping("/my-site-visits")
    public ResponseEntity<Map<String, Object>> getMySiteVisits() {
        List<Map<String, Object>> myVisits = siteVisits.stream()
                .filter(v -> "USR-3001".equals(v.get("assignedExecutiveId")))
                .collect(Collectors.toList());
        return ResponseEntity.ok(envelope("Assigned site visits retrieved", myVisits, "req_pse_005"));
    }

    @GetMapping("/my-quotations")
    public ResponseEntity<Map<String, Object>> getMyQuotations() {
        return ResponseEntity.ok(envelope("My quotations retrieved", quotations, "req_pse_006"));
    }

    @PostMapping("/booking-requests")
    public ResponseEntity<Map<String, Object>> submitBookingRequest(@RequestBody Map<String, Object> req) {
        String reqId = "BR-" + (7000 + bookingRequests.size() + 1);
        String leadId = (String) req.getOrDefault("leadId", "RL-2001");
        String propId = (String) req.getOrDefault("propertyId", "PROP-1001");

        Map<String, Object> br = new LinkedHashMap<>();
        br.put("bookingRequestId", reqId);
        br.put("leadId", leadId);
        br.put("propertyId", propId);
        br.put("status", "PENDING_VERIFICATION");
        br.put("submittedBy", "USR-3001");
        br.put("createdAt", "2026-10-26T09:40:00+05:30");

        bookingRequests.add(0, br);
        return ResponseEntity.status(HttpStatus.CREATED).body(envelope("Booking request submitted for verification", br, "req_pse_007"));
    }

    @GetMapping("/my-follow-ups")
    public ResponseEntity<Map<String, Object>> getMyFollowUps() {
        return ResponseEntity.ok(envelope("My follow-up tasks retrieved", followUps, "req_pse_008"));
    }

    @PatchMapping("/follow-ups/{taskId}")
    public ResponseEntity<Map<String, Object>> updateFollowUp(@PathVariable String taskId, @RequestBody Map<String, Object> req) {
        Optional<Map<String, Object>> fuOpt = followUps.stream().filter(f -> taskId.equalsIgnoreCase((String) f.get("taskId"))).findFirst();
        if (fuOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorEnvelope("Follow-up not found", List.of(Map.of("field", "taskId", "message", "Task not found")), "req_fu_err"));
        }
        Map<String, Object> fu = fuOpt.get();
        req.forEach((k, v) -> {
            if (!"taskId".equals(k)) fu.put(k, v);
        });
        return ResponseEntity.ok(envelope("Follow-up task updated", fu, "req_pse_009"));
    }

    @PostMapping("/follow-ups/{taskId}/complete")
    public ResponseEntity<Map<String, Object>> completeFollowUp(@PathVariable String taskId) {
        Optional<Map<String, Object>> fuOpt = followUps.stream().filter(f -> taskId.equalsIgnoreCase((String) f.get("taskId"))).findFirst();
        if (fuOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorEnvelope("Follow-up not found", List.of(Map.of("field", "taskId", "message", "Task not found")), "req_fu_err"));
        }
        Map<String, Object> fu = fuOpt.get();
        fu.put("status", "COMPLETED");
        fu.put("completedAt", "2026-10-26T09:42:00+05:30");
        return ResponseEntity.ok(envelope("Follow-up task completed", fu, "req_pse_010"));
    }

    @PostMapping("/ai/property-recommendations")
    public ResponseEntity<Map<String, Object>> getAiPropertyRecommendations(@RequestBody Map<String, Object> req) {
        String leadId = (String) req.getOrDefault("leadId", "RL-2001");
        List<Map<String, Object>> recs = List.of(
                new LinkedHashMap<>(Map.of(
                        "propertyId", "PROP-1001",
                        "propertyName", "Green Valley Apartment",
                        "price", 7500000,
                        "currency", "INR",
                        "matchReasons", List.of(
                                "Matches the requested location (OMR)",
                                "Within the specified budget (₹60L - ₹80L)",
                                "Has requested three bedrooms"
                        )
                )),
                new LinkedHashMap<>(Map.of(
                        "propertyId", "PROP-1004",
                        "propertyName", "Metro Prime Suites",
                        "price", 6200000,
                        "currency", "INR",
                        "matchReasons", List.of(
                                "Located near OMR tech corridor",
                                "Budget friendly ready-to-move option",
                                "Two bedrooms with modern modular fittings"
                        )
                ))
        );

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("leadId", leadId);
        data.put("recommendations", recs);

        return ResponseEntity.ok(envelope("Property recommendations generated", data, "req_ai_001"));
    }

    @PostMapping("/ai/lead-summary")
    public ResponseEntity<Map<String, Object>> getAiLeadSummary(@RequestBody Map<String, Object> req) {
        String leadId = (String) req.getOrDefault("leadId", "RL-2001");
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("leadId", leadId);
        data.put("summary", "Client Arun Kumar is actively seeking a 3BHK in OMR. Discussed pricing on Oct 25, confirmed high purchase intent, and scheduled an on-site walkthrough for Oct 28. Quotation draft QUO-6001 generated.");
        data.put("recommendedNextAction", "Call customer 2 hours prior to site visit to re-confirm pickup gate code.");
        data.put("generatedAt", "2026-10-26T09:45:00+05:30");

        return ResponseEntity.ok(envelope("Lead summary generated", data, "req_ai_002"));
    }

    @GetMapping("/notifications")
    public ResponseEntity<Map<String, Object>> getNotifications() {
        List<Map<String, Object>> notifs = List.of(
                Map.of("id", "NT-1", "title", "Site Visit Confirmed", "message", "Arun Kumar confirmed visit for Green Valley Apartment (10:00 AM)", "time", "10m ago"),
                Map.of("id", "NT-2", "title", "New Lead Assigned", "message", "Lead RL-2003 (Karthik Subramanian) assigned to you", "time", "25m ago"),
                Map.of("id", "NT-3", "title", "Quotation Approved", "message", "Manager approved quotation QUO-6002 for Skyline Azure Penthouse", "time", "1h ago")
        );
        return ResponseEntity.ok(envelope("Notifications retrieved", notifs, "req_notif_001"));
    }

    // =========================================================================
    // ROLE 3: CUSTOMER RELATIONSHIP MANAGER APIS
    // =========================================================================

    @GetMapping("/customer-relations/dashboard")
    public ResponseEntity<Map<String, Object>> getCustomerRelationsDashboard(
            @RequestParam(required = false, defaultValue = "THIS_MONTH") String period
    ) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("totalCustomers", 1250);
        data.put("openRequests", 28);
        data.put("openComplaints", 12);
        data.put("highPriorityComplaints", 3);
        data.put("followUpsDueToday", 18);
        data.put("averageResolutionHours", 19.5);
        data.put("customerSatisfactionScore", 4.3);
        data.put("pendingBookingUpdates", 7);

        return ResponseEntity.ok(envelope("Customer relations dashboard loaded", data, "req_crm_001"));
    }

    @GetMapping("/customers")
    public ResponseEntity<Map<String, Object>> getCustomers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "10") int size
    ) {
        List<Map<String, Object>> list = customers;
        if (search != null && !search.isEmpty()) {
            list = list.stream().filter(c -> ((String) c.get("customerName")).toLowerCase().contains(search.toLowerCase())).collect(Collectors.toList());
        }
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("items", list);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", list.size());
        data.put("totalPages", 1);

        return ResponseEntity.ok(envelope("Customers retrieved", data, "req_crm_002"));
    }

    @GetMapping("/customers/{customerId}")
    public ResponseEntity<Map<String, Object>> getCustomer(@PathVariable String customerId) {
        Optional<Map<String, Object>> cust = customers.stream().filter(c -> customerId.equalsIgnoreCase((String) c.get("customerId"))).findFirst();
        if (cust.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorEnvelope("Customer not found", List.of(Map.of("field", "customerId", "message", "Customer does not exist")), "req_cust_err"));
        }
        return ResponseEntity.ok(envelope("Customer profile retrieved", cust.get(), "req_crm_003"));
    }

    @PatchMapping("/customers/{customerId}")
    public ResponseEntity<Map<String, Object>> updateCustomer(@PathVariable String customerId, @RequestBody Map<String, Object> req) {
        Optional<Map<String, Object>> custOpt = customers.stream().filter(c -> customerId.equalsIgnoreCase((String) c.get("customerId"))).findFirst();
        if (custOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorEnvelope("Customer not found", List.of(Map.of("field", "customerId", "message", "Customer does not exist")), "req_cust_err"));
        }
        Map<String, Object> cust = custOpt.get();
        req.forEach((k, v) -> {
            if (!"customerId".equals(k)) cust.put(k, v);
        });
        return ResponseEntity.ok(envelope("Customer updated successfully", cust, "req_crm_004"));
    }

    @GetMapping("/customers/{customerId}/timeline")
    public ResponseEntity<Map<String, Object>> getCustomerTimeline(
            @PathVariable String customerId,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "20") int size
    ) {
        List<Map<String, Object>> events = List.of(
                Map.of("eventId", "EVT-1001", "eventType", "LEAD_CREATED", "description", "Customer enquired about Green Valley Apartment", "createdAt", "2026-10-24T10:00:00+05:30"),
                Map.of("eventId", "EVT-1002", "eventType", "CALL_COMPLETED", "description", "Property pricing discussed", "createdAt", "2026-10-25T11:30:00+05:30"),
                Map.of("eventId", "EVT-1003", "eventType", "SITE_VISIT_SCHEDULED", "description", "Site visit scheduled for October 28", "createdAt", "2026-10-26T09:00:00+05:30")
        );

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("items", events);
        data.put("page", page);
        data.put("size", size);
        data.put("totalElements", events.size());
        data.put("totalPages", 1);

        return ResponseEntity.ok(envelope("Customer timeline retrieved", data, "req_crm_005"));
    }

    @PostMapping("/customers/{customerId}/communications")
    public ResponseEntity<Map<String, Object>> recordCustomerCommunication(@PathVariable String customerId, @RequestBody Map<String, Object> req) {
        String comId = "COM-" + (5000 + (int)(Math.random() * 1000));
        String channel = (String) req.getOrDefault("channel", "PHONE");
        String direction = (String) req.getOrDefault("direction", "OUTBOUND");
        String outcome = (String) req.getOrDefault("outcome", "CUSTOMER_CONFIRMED");

        Map<String, Object> com = new LinkedHashMap<>();
        com.put("communicationId", comId);
        com.put("customerId", customerId);
        com.put("channel", channel);
        com.put("direction", direction);
        com.put("outcome", outcome);
        com.put("recordedBy", "USR-5001");
        com.put("createdAt", "2026-10-26T09:48:00+05:30");

        customerCommunications.computeIfAbsent(customerId, k -> new ArrayList<>()).add(0, com);
        return ResponseEntity.status(HttpStatus.CREATED).body(envelope("Customer communication recorded", com, "req_crm_006"));
    }

    @GetMapping("/customers/{customerId}/communications")
    public ResponseEntity<Map<String, Object>> getCustomerCommunications(@PathVariable String customerId) {
        List<Map<String, Object>> list = customerCommunications.getOrDefault(customerId, Collections.emptyList());
        return ResponseEntity.ok(envelope("Communications retrieved", list, "req_crm_007"));
    }

    @PostMapping("/customer-requests")
    public ResponseEntity<Map<String, Object>> createCustomerRequest(@RequestBody Map<String, Object> req) {
        String reqId = "CR-" + (6000 + customerRequests.size() + 1);
        String custId = (String) req.getOrDefault("customerId", "CUS-4001");
        String cat = (String) req.getOrDefault("category", "DOCUMENT_REQUEST");
        String prio = (String) req.getOrDefault("priority", "NORMAL");

        Map<String, Object> cr = new LinkedHashMap<>();
        cr.put("requestId", reqId);
        cr.put("customerId", custId);
        cr.put("category", cat);
        cr.put("status", "OPEN");
        cr.put("priority", prio);
        cr.put("assignedTo", "USR-5001");
        cr.put("createdAt", "2026-10-26T09:50:00+05:30");

        customerRequests.add(0, cr);
        return ResponseEntity.status(HttpStatus.CREATED).body(envelope("Customer request created", cr, "req_crm_008"));
    }

    @GetMapping("/customer-requests")
    public ResponseEntity<Map<String, Object>> getCustomerRequests() {
        return ResponseEntity.ok(envelope("Customer requests listed", customerRequests, "req_crm_009"));
    }

    @PatchMapping("/customer-requests/{requestId}")
    public ResponseEntity<Map<String, Object>> updateCustomerRequest(@PathVariable String requestId, @RequestBody Map<String, Object> req) {
        Optional<Map<String, Object>> crOpt = customerRequests.stream().filter(r -> requestId.equalsIgnoreCase((String) r.get("requestId"))).findFirst();
        if (crOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorEnvelope("Request not found", List.of(Map.of("field", "requestId", "message", "Request does not exist")), "req_cr_err"));
        }
        Map<String, Object> cr = crOpt.get();
        req.forEach((k, v) -> {
            if (!"requestId".equals(k)) cr.put(k, v);
        });
        return ResponseEntity.ok(envelope("Customer request updated", cr, "req_crm_010"));
    }

    @PostMapping("/complaints")
    public ResponseEntity<Map<String, Object>> registerComplaint(@RequestBody Map<String, Object> req) {
        String cmpId = "CMP-" + (7000 + complaints.size() + 1);
        String custId = (String) req.getOrDefault("customerId", "CUS-4001");
        String cat = (String) req.getOrDefault("category", "BOOKING_DELAY");
        String prio = (String) req.getOrDefault("priority", "HIGH");

        Map<String, Object> cmp = new LinkedHashMap<>();
        cmp.put("complaintId", cmpId);
        cmp.put("customerId", custId);
        cmp.put("category", cat);
        cmp.put("priority", prio);
        cmp.put("status", "OPEN");
        cmp.put("assignedTo", "USR-5001");
        cmp.put("createdAt", "2026-10-26T09:10:00+05:30");

        complaints.add(0, cmp);
        return ResponseEntity.status(HttpStatus.CREATED).body(envelope("Complaint registered", cmp, "req_crm_011"));
    }

    @GetMapping("/complaints")
    public ResponseEntity<Map<String, Object>> getComplaints() {
        return ResponseEntity.ok(envelope("Complaints retrieved", complaints, "req_crm_012"));
    }

    @GetMapping("/complaints/{complaintId}")
    public ResponseEntity<Map<String, Object>> getComplaint(@PathVariable String complaintId) {
        Optional<Map<String, Object>> cmp = complaints.stream().filter(c -> complaintId.equalsIgnoreCase((String) c.get("complaintId"))).findFirst();
        if (cmp.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorEnvelope("Complaint not found", List.of(Map.of("field", "complaintId", "message", "Complaint does not exist")), "req_cmp_err"));
        }
        return ResponseEntity.ok(envelope("Complaint details retrieved", cmp.get(), "req_crm_013"));
    }

    @PatchMapping("/complaints/{complaintId}")
    public ResponseEntity<Map<String, Object>> updateComplaintStatus(@PathVariable String complaintId, @RequestBody Map<String, Object> req) {
        Optional<Map<String, Object>> cmpOpt = complaints.stream().filter(c -> complaintId.equalsIgnoreCase((String) c.get("complaintId"))).findFirst();
        if (cmpOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorEnvelope("Complaint not found", List.of(Map.of("field", "complaintId", "message", "Complaint does not exist")), "req_cmp_err"));
        }
        Map<String, Object> cmp = cmpOpt.get();
        req.forEach((k, v) -> {
            if (!"complaintId".equals(k)) cmp.put(k, v);
        });
        return ResponseEntity.ok(envelope("Complaint status updated", cmp, "req_crm_014"));
    }

    @PostMapping("/complaints/{complaintId}/escalate")
    public ResponseEntity<Map<String, Object>> escalateComplaint(@PathVariable String complaintId, @RequestBody Map<String, Object> req) {
        Optional<Map<String, Object>> cmpOpt = complaints.stream().filter(c -> complaintId.equalsIgnoreCase((String) c.get("complaintId"))).findFirst();
        if (cmpOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorEnvelope("Complaint not found", List.of(Map.of("field", "complaintId", "message", "Complaint does not exist")), "req_cmp_err"));
        }
        Map<String, Object> cmp = cmpOpt.get();
        cmp.put("status", "ESCALATED");
        cmp.put("priority", "URGENT");
        cmp.put("escalatedBy", "USR-5001");

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("complaintId", complaintId);
        data.put("status", "ESCALATED");
        data.put("priority", "URGENT");
        data.put("escalatedBy", "USR-5001");

        return ResponseEntity.ok(envelope("Complaint escalated", data, "req_crm_015"));
    }

    @PostMapping("/customer-feedback")
    public ResponseEntity<Map<String, Object>> submitCustomerFeedback(@RequestBody Map<String, Object> req) {
        String fdbId = "FDB-" + (8000 + customerFeedbacks.size() + 1);
        String custId = (String) req.getOrDefault("customerId", "CUS-4001");
        int rating = req.get("rating") != null ? ((Number) req.get("rating")).intValue() : 5;
        String cat = (String) req.getOrDefault("category", "SITE_VISIT_EXPERIENCE");

        Map<String, Object> fdb = new LinkedHashMap<>();
        fdb.put("feedbackId", fdbId);
        fdb.put("customerId", custId);
        fdb.put("rating", rating);
        fdb.put("category", cat);
        fdb.put("status", "RECORDED");
        fdb.put("createdAt", "2026-10-26T09:55:00+05:30");

        customerFeedbacks.add(0, fdb);
        return ResponseEntity.status(HttpStatus.CREATED).body(envelope("Customer feedback recorded", fdb, "req_crm_016"));
    }

    @GetMapping("/customer-feedback")
    public ResponseEntity<Map<String, Object>> getCustomerFeedback() {
        return ResponseEntity.ok(envelope("Feedback retrieved", customerFeedbacks, "req_crm_017"));
    }

    @GetMapping("/bookings/{bookingId}/customer-updates")
    public ResponseEntity<Map<String, Object>> getBookingCustomerUpdates(@PathVariable String bookingId) {
        List<Map<String, Object>> updates = List.of(
                Map.of("updateId", "BUP-1", "bookingId", bookingId, "title", "Token Advance Received", "status", "VERIFIED", "timestamp", "2026-10-26T09:15:00+05:30"),
                Map.of("updateId", "BUP-2", "bookingId", bookingId, "title", "Legal Document Drafting", "status", "IN_PROGRESS", "timestamp", "2026-10-26T09:30:00+05:30")
        );
        return ResponseEntity.ok(envelope("Customer-facing booking updates retrieved", updates, "req_crm_018"));
    }

    @PostMapping("/customers/{customerId}/follow-ups")
    public ResponseEntity<Map<String, Object>> createCustomerFollowUp(@PathVariable String customerId, @RequestBody Map<String, Object> req) {
        String taskId = "TSK-" + (9000 + followUps.size() + 1);
        String title = (String) req.getOrDefault("title", "Customer follow-up call");

        Map<String, Object> t = new LinkedHashMap<>();
        t.put("taskId", taskId);
        t.put("customerId", customerId);
        t.put("title", title);
        t.put("status", "PENDING");
        t.put("assignedTo", "USR-5001");
        t.put("dueAt", "2026-10-28T14:00:00+05:30");

        followUps.add(0, t);
        return ResponseEntity.status(HttpStatus.CREATED).body(envelope("Customer follow-up created", t, "req_crm_019"));
    }

    @GetMapping("/customer-follow-ups")
    public ResponseEntity<Map<String, Object>> getCustomerFollowUps() {
        return ResponseEntity.ok(envelope("Assigned follow-ups retrieved", followUps, "req_crm_020"));
    }

    @PostMapping("/ai/customer-summary")
    public ResponseEntity<Map<String, Object>> getAiCustomerSummary(@RequestBody Map<String, Object> req) {
        String custId = (String) req.getOrDefault("customerId", "CUS-4001");
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("customerId", custId);
        data.put("summary", "The customer enquired about a three-bedroom property, discussed pricing, and has a site visit scheduled. One document request remains open.");
        data.put("openItems", List.of(
                Map.of("type", "CUSTOMER_REQUEST", "id", "CR-6001", "status", "OPEN")
        ));
        data.put("generatedAt", "2026-10-26T09:15:00+05:30");

        return ResponseEntity.ok(envelope("Customer summary generated", data, "req_crm_021"));
    }

    @PostMapping("/ai/reply-drafts")
    public ResponseEntity<Map<String, Object>> getAiReplyDraft(@RequestBody Map<String, Object> req) {
        String custId = (String) req.getOrDefault("customerId", "CUS-4001");
        String channel = (String) req.getOrDefault("channel", "EMAIL");

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("draftId", "DR-9001");
        data.put("customerId", custId);
        data.put("channel", channel);
        data.put("status", "DRAFT");
        data.put("subject", "Update on your property booking");
        data.put("body", "We are reviewing your booking request and will share an update once verification is complete.");

        return ResponseEntity.ok(envelope("Reply draft generated", data, "req_crm_022"));
    }

    @GetMapping("/customer-relations/reports")
    public ResponseEntity<Map<String, Object>> getCustomerRelationsReports() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("totalCustomers", 1250);
        data.put("npsScore", 72);
        data.put("csatScore", 4.3);
        data.put("resolvedComplaintsRate", 88.5);
        data.put("avgResolutionHours", 19.5);
        return ResponseEntity.ok(envelope("Customer relations reporting retrieved", data, "req_crm_023"));
    }

    // =========================================================================
    // ROLE 4: SITE VISIT COORDINATOR APIS
    // =========================================================================

    @GetMapping("/site-visit-coordinator/dashboard")
    public ResponseEntity<Map<String, Object>> getCoordinatorDashboard(
            @RequestParam(required = false, defaultValue = "TODAY") String period
    ) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("visitsToday", 12);
        data.put("visitsScheduled", 8);
        data.put("visitsConfirmed", 6);
        data.put("visitsCompleted", 2);
        data.put("pendingConfirmations", 3);
        data.put("rescheduleRequests", 2);
        data.put("cancelledVisits", 1);
        data.put("unassignedVisits", 1);

        return ResponseEntity.ok(envelope("Site visit dashboard loaded", data, "req_svc_001"));
    }

    @GetMapping("/site-visits/{visitId}")
    public ResponseEntity<Map<String, Object>> getSiteVisit(@PathVariable String visitId) {
        Optional<Map<String, Object>> sv = siteVisits.stream().filter(v -> visitId.equalsIgnoreCase((String) v.get("siteVisitId"))).findFirst();
        if (sv.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorEnvelope("Site visit not found", List.of(Map.of("field", "visitId", "message", "Visit does not exist")), "req_sv_err"));
        }
        return ResponseEntity.ok(envelope("Visit details retrieved", sv.get(), "req_svc_002"));
    }

    @PatchMapping("/site-visits/{visitId}")
    public ResponseEntity<Map<String, Object>> updateSiteVisit(@PathVariable String visitId, @RequestBody Map<String, Object> req) {
        Optional<Map<String, Object>> svOpt = siteVisits.stream().filter(v -> visitId.equalsIgnoreCase((String) v.get("siteVisitId"))).findFirst();
        if (svOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorEnvelope("Site visit not found", List.of(Map.of("field", "visitId", "message", "Visit not found")), "req_sv_err"));
        }
        Map<String, Object> sv = svOpt.get();
        req.forEach((k, v) -> {
            if (!"siteVisitId".equals(k)) sv.put(k, v);
        });
        return ResponseEntity.ok(envelope("Visit details updated", sv, "req_svc_003"));
    }

    @PostMapping("/site-visits/{visitId}/reschedule")
    public ResponseEntity<Map<String, Object>> rescheduleSiteVisit(@PathVariable String visitId, @RequestBody Map<String, Object> req) {
        Optional<Map<String, Object>> svOpt = siteVisits.stream().filter(v -> visitId.equalsIgnoreCase((String) v.get("siteVisitId"))).findFirst();
        if (svOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorEnvelope("Site visit not found", List.of(Map.of("field", "visitId", "message", "Visit not found")), "req_sv_err"));
        }
        Map<String, Object> sv = svOpt.get();
        String prevSched = (String) sv.get("scheduledAt");
        String newSched = (String) req.getOrDefault("newScheduledAt", "2026-10-28T14:00:00+05:30");

        sv.put("scheduledAt", newSched);
        sv.put("status", "RESCHEDULED");

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("siteVisitId", visitId);
        data.put("previousScheduledAt", prevSched);
        data.put("scheduledAt", newSched);
        data.put("status", "RESCHEDULED");

        return ResponseEntity.ok(envelope("Site visit rescheduled", data, "req_svc_004"));
    }

    @PostMapping("/site-visits/{visitId}/cancel")
    public ResponseEntity<Map<String, Object>> cancelSiteVisit(@PathVariable String visitId, @RequestBody Map<String, Object> req) {
        Optional<Map<String, Object>> svOpt = siteVisits.stream().filter(v -> visitId.equalsIgnoreCase((String) v.get("siteVisitId"))).findFirst();
        if (svOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorEnvelope("Site visit not found", List.of(Map.of("field", "visitId", "message", "Visit not found")), "req_sv_err"));
        }
        Map<String, Object> sv = svOpt.get();
        sv.put("status", "CANCELLED");
        sv.put("cancellationReason", req.getOrDefault("reason", "Customer requested cancellation"));

        return ResponseEntity.ok(envelope("Site visit cancelled", sv, "req_svc_005"));
    }

    @GetMapping("/site-visits/availability")
    public ResponseEntity<Map<String, Object>> getSiteVisitAvailability(
            @RequestParam(required = false, defaultValue = "PROP-1001") String propertyId,
            @RequestParam(required = false, defaultValue = "2026-10-28") String date,
            @RequestParam(required = false, defaultValue = "60") int durationMinutes
    ) {
        List<Map<String, Object>> slots = List.of(
                Map.of("startTime", date + "T10:00:00+05:30", "endTime", date + "T11:00:00+05:30", "available", true),
                Map.of("startTime", date + "T11:00:00+05:30", "endTime", date + "T12:00:00+05:30", "available", false),
                Map.of("startTime", date + "T14:00:00+05:30", "endTime", date + "T15:00:00+05:30", "available", true),
                Map.of("startTime", date + "T16:00:00+05:30", "endTime", date + "T17:00:00+05:30", "available", true)
        );

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("propertyId", propertyId);
        data.put("date", date);
        data.put("slots", slots);

        return ResponseEntity.ok(envelope("Available slots retrieved", data, "req_svc_006"));
    }

    @PostMapping("/site-visits/{visitId}/assign")
    public ResponseEntity<Map<String, Object>> assignSiteVisitStaff(@PathVariable String visitId, @RequestBody Map<String, Object> req) {
        Optional<Map<String, Object>> svOpt = siteVisits.stream().filter(v -> visitId.equalsIgnoreCase((String) v.get("siteVisitId"))).findFirst();
        if (svOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorEnvelope("Site visit not found", List.of(Map.of("field", "visitId", "message", "Visit not found")), "req_sv_err"));
        }
        Map<String, Object> sv = svOpt.get();
        String coordId = (String) req.getOrDefault("coordinatorId", "USR-4001");
        String execId = (String) req.getOrDefault("assignedExecutiveId", "USR-3001");

        sv.put("coordinatorId", coordId);
        sv.put("assignedExecutiveId", execId);
        sv.put("status", "SCHEDULED");

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("siteVisitId", visitId);
        data.put("coordinatorId", coordId);
        data.put("assignedExecutiveId", execId);
        data.put("status", "SCHEDULED");

        return ResponseEntity.ok(envelope("Site visit assignment updated", data, "req_svc_007"));
    }

    @PostMapping("/site-visits/{visitId}/confirm")
    public ResponseEntity<Map<String, Object>> confirmSiteVisit(@PathVariable String visitId, @RequestBody Map<String, Object> req) {
        Optional<Map<String, Object>> svOpt = siteVisits.stream().filter(v -> visitId.equalsIgnoreCase((String) v.get("siteVisitId"))).findFirst();
        if (svOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorEnvelope("Site visit not found", List.of(Map.of("field", "visitId", "message", "Visit not found")), "req_sv_err"));
        }
        Map<String, Object> sv = svOpt.get();
        sv.put("status", "CONFIRMED");
        sv.put("customerConfirmed", req.getOrDefault("customerConfirmed", true));
        sv.put("propertyAccessVerified", req.getOrDefault("propertyAccessVerified", true));
        sv.put("assignedStaffConfirmed", req.getOrDefault("assignedStaffConfirmed", true));

        return ResponseEntity.ok(envelope("Site visit arrangements confirmed", sv, "req_svc_008"));
    }

    @PostMapping("/site-visits/{visitId}/check-in")
    public ResponseEntity<Map<String, Object>> checkInSiteVisit(@PathVariable String visitId, @RequestBody Map<String, Object> req) {
        Optional<Map<String, Object>> svOpt = siteVisits.stream().filter(v -> visitId.equalsIgnoreCase((String) v.get("siteVisitId"))).findFirst();
        if (svOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorEnvelope("Site visit not found", List.of(Map.of("field", "visitId", "message", "Visit not found")), "req_sv_err"));
        }
        Map<String, Object> sv = svOpt.get();
        sv.put("status", "IN_PROGRESS");
        sv.put("checkInAt", "2026-10-28T13:55:00+05:30");

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("siteVisitId", visitId);
        data.put("checkInAt", "2026-10-28T13:55:00+05:30");
        data.put("status", "IN_PROGRESS");

        return ResponseEntity.ok(envelope("Site visit check-in recorded", data, "req_svc_009"));
    }

    @PostMapping("/site-visits/{visitId}/check-out")
    public ResponseEntity<Map<String, Object>> checkOutSiteVisit(@PathVariable String visitId, @RequestBody Map<String, Object> req) {
        Optional<Map<String, Object>> svOpt = siteVisits.stream().filter(v -> visitId.equalsIgnoreCase((String) v.get("siteVisitId"))).findFirst();
        if (svOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorEnvelope("Site visit not found", List.of(Map.of("field", "visitId", "message", "Visit not found")), "req_sv_err"));
        }
        Map<String, Object> sv = svOpt.get();
        sv.put("status", "COMPLETED");
        sv.put("checkOutAt", "2026-10-28T15:00:00+05:30");

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("siteVisitId", visitId);
        data.put("checkOutAt", "2026-10-28T15:00:00+05:30");
        data.put("status", "COMPLETED");

        return ResponseEntity.ok(envelope("Site visit check-out recorded", data, "req_svc_010"));
    }

    @PostMapping("/site-visits/{visitId}/outcome")
    public ResponseEntity<Map<String, Object>> recordVisitOutcome(@PathVariable String visitId, @RequestBody Map<String, Object> req) {
        Optional<Map<String, Object>> svOpt = siteVisits.stream().filter(v -> visitId.equalsIgnoreCase((String) v.get("siteVisitId"))).findFirst();
        if (svOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorEnvelope("Site visit not found", List.of(Map.of("field", "visitId", "message", "Visit not found")), "req_sv_err"));
        }
        Map<String, Object> sv = svOpt.get();
        String outcome = (String) req.getOrDefault("outcome", "INTERESTED");
        sv.put("outcome", outcome);
        sv.put("status", "COMPLETED");

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("siteVisitId", visitId);
        data.put("outcome", outcome);
        data.put("status", "COMPLETED");
        data.put("followUpCreated", true);
        data.put("followUpAt", "2026-10-30T10:00:00+05:30");

        return ResponseEntity.ok(envelope("Site visit outcome recorded", data, "req_svc_011"));
    }

    @GetMapping("/site-visits/{visitId}/checklist")
    public ResponseEntity<Map<String, Object>> getSiteVisitChecklist(@PathVariable String visitId) {
        List<Map<String, Object>> items = visitChecklists.getOrDefault(visitId, List.of(
                new LinkedHashMap<>(Map.of("itemCode", "PROPERTY_ACCESS", "completed", true, "notes", "Access confirmed")),
                new LinkedHashMap<>(Map.of("itemCode", "PROPERTY_CLEANLINESS", "completed", true, "notes", "Property ready for viewing")),
                new LinkedHashMap<>(Map.of("itemCode", "CUSTOMER_DOCUMENTS", "completed", false, "notes", "Pending verification"))
        ));
        return ResponseEntity.ok(envelope("Visit checklist retrieved", items, "req_svc_012"));
    }

    @PutMapping("/site-visits/{visitId}/checklist")
    public ResponseEntity<Map<String, Object>> saveSiteVisitChecklist(@PathVariable String visitId, @RequestBody Map<String, Object> req) {
        List<Map<String, Object>> items = (List<Map<String, Object>>) req.getOrDefault("items", Collections.emptyList());
        visitChecklists.put(visitId, items);

        long completed = items.stream().filter(i -> Boolean.TRUE.equals(i.get("completed"))).count();
        double pct = items.isEmpty() ? 100.0 : ((double) completed / items.size()) * 100.0;

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("siteVisitId", visitId);
        data.put("completedItems", completed);
        data.put("totalItems", items.size());
        data.put("completionPercentage", Math.round(pct * 100.0) / 100.0);

        return ResponseEntity.ok(envelope("Site visit checklist saved", data, "req_svc_013"));
    }

    @GetMapping("/site-visits/{visitId}/feedback")
    public ResponseEntity<Map<String, Object>> getSiteVisitFeedback(@PathVariable String visitId) {
        Optional<Map<String, Object>> fdb = customerFeedbacks.stream().filter(f -> visitId.equalsIgnoreCase((String) f.get("relatedSiteVisitId"))).findFirst();
        return ResponseEntity.ok(envelope("Visit feedback retrieved", fdb.orElse(Map.of()), "req_svc_014"));
    }

    @PostMapping("/site-visits/{visitId}/feedback-request")
    public ResponseEntity<Map<String, Object>> sendFeedbackRequest(@PathVariable String visitId) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("siteVisitId", visitId);
        data.put("status", "SENT");
        data.put("channel", "WHATSAPP");
        data.put("sentAt", "2026-10-26T09:58:00+05:30");
        return ResponseEntity.ok(envelope("Customer feedback requested successfully", data, "req_svc_015"));
    }

    @GetMapping("/site-visits/calendar")
    public ResponseEntity<Map<String, Object>> getSiteVisitsCalendar(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to
    ) {
        List<Map<String, Object>> calendarEvents = siteVisits.stream().map(v -> {
            Map<String, Object> e = new LinkedHashMap<>();
            e.put("id", v.get("siteVisitId"));
            e.put("title", v.get("customerName") + " - " + v.get("propertyName"));
            e.put("start", v.get("scheduledAt"));
            e.put("status", v.get("status"));
            e.put("coordinator", v.get("coordinatorId"));
            return e;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(envelope("Site visit calendar retrieved", calendarEvents, "req_svc_016"));
    }

    @GetMapping("/site-visits/reports")
    public ResponseEntity<Map<String, Object>> getSiteVisitReports() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("totalVisitsScheduled", 45);
        data.put("totalVisitsCompleted", 32);
        data.put("totalCancelled", 4);
        data.put("rescheduledCount", 9);
        data.put("completionRate", 71.11);
        data.put("avgRating", 4.8);
        return ResponseEntity.ok(envelope("Visit reports generated", data, "req_svc_017"));
    }

    // =========================================================================
    // HELPER BUILDERS
    // =========================================================================

    private Map<String, Object> buildProperty(String id, String name, String pType, String tType, String city, String area, double price, String curr, int beds, int baths, int areaSqFt, String status, String desc) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", id);
        m.put("propertyId", id);
        m.put("name", name);
        m.put("propertyName", name);
        m.put("propertyType", pType);
        m.put("transactionType", tType);
        m.put("city", city);
        m.put("area", area);
        m.put("location", city);
        m.put("price", price);
        m.put("currency", curr);
        m.put("bedrooms", beds);
        m.put("bathrooms", baths);
        m.put("areaSqFt", areaSqFt);
        m.put("availabilityStatus", status);
        m.put("availability", status);
        m.put("description", desc);
        m.put("createdAt", "2026-10-26T09:00:00+05:30");
        return m;
    }

    private Map<String, Object> buildLead(String id, String name, String email, String phone, String propId, String propName, String src, double bMin, double bMax, String loc, String stage, String assignedTo) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("leadId", id);
        m.put("customerName", name);
        m.put("email", email);
        m.put("phone", phone);
        m.put("propertyId", propId);
        m.put("propertyName", propName);
        m.put("leadSource", src);
        m.put("budgetMin", bMin);
        m.put("budgetMax", bMax);
        m.put("preferredLocation", loc);
        m.put("stage", stage);
        m.put("assignedTo", assignedTo);
        m.put("createdAt", "2026-10-26T09:05:00+05:30");
        return m;
    }

    private Map<String, Object> buildActivity(String id, String leadId, String type, String summary, String outcome, String by, String followUp) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("activityId", id);
        m.put("leadId", leadId);
        m.put("activityType", type);
        m.put("summary", summary);
        m.put("outcome", outcome);
        m.put("createdBy", by);
        m.put("nextFollowUpAt", followUp);
        m.put("createdAt", "2026-10-26T09:08:00+05:30");
        return m;
    }

    private Map<String, Object> buildSiteVisit(String id, String leadId, String propId, String custId, String custName, String propName, String schedAt, int dur, String coordId, String execId, String status, String notes) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("siteVisitId", id);
        m.put("leadId", leadId);
        m.put("propertyId", propId);
        m.put("customerId", custId);
        m.put("customerName", custName);
        m.put("propertyName", propName);
        m.put("scheduledAt", schedAt);
        m.put("durationMinutes", dur);
        m.put("coordinatorId", coordId);
        m.put("assignedExecutiveId", execId);
        m.put("status", status);
        m.put("notes", notes);
        m.put("createdAt", "2026-10-26T09:06:00+05:30");
        return m;
    }

    private Map<String, Object> buildQuotation(String id, String leadId, String propId, double base, double disc, double addn, double total, String curr, String status, String valid) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("quotationId", id);
        m.put("leadId", leadId);
        m.put("propertyId", propId);
        m.put("basePrice", base);
        m.put("discountAmount", disc);
        m.put("additionalCharges", addn);
        m.put("totalAmount", total);
        m.put("currency", curr);
        m.put("status", status);
        m.put("validUntil", valid);
        m.put("createdAt", "2026-10-26T09:07:00+05:30");
        return m;
    }
}
