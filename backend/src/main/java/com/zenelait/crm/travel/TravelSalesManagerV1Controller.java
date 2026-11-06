package com.zenelait.crm.travel;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/travel/sales-manager")
@CrossOrigin(origins = "*")
public class TravelSalesManagerV1Controller {

    @Autowired
    private TravelDataStore store;

    private String getTenantId(String tenantHeader) {
        return (tenantHeader != null && !tenantHeader.isBlank()) ? tenantHeader : "tenant-7";
    }

    private Map<String, Object> standardResponse(boolean success, String message, Object data, String reqId) {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("success", success);
        resp.put("message", message);
        resp.put("data", data);
        resp.put("requestId", reqId != null ? reqId : "req-sm-" + UUID.randomUUID().toString().substring(0, 6));
        return resp;
    }

    // ==========================================
    // 1. DASHBOARD & METRICS
    // ==========================================

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("totalLeads", 420);
        data.put("newLeads", 35);
        data.put("qualifiedLeads", 120);
        data.put("activeQuotations", store.getQuotations().size() > 0 ? store.getQuotations().size() + 47 : 48);
        data.put("confirmedBookings", 76);
        data.put("overdueFollowUps", 12);
        data.put("conversionRate", 18.1);
        data.put("currency", "INR");
        data.put("period", "CURRENT_MONTH");
        return ResponseEntity.ok(standardResponse(true, "Sales dashboard retrieved", data, "req-sm-001"));
    }

    @GetMapping("/dashboard/pipeline")
    public ResponseEntity<Map<String, Object>> getPipelineSummary(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> p = new LinkedHashMap<>();
        p.put("NEW_ENQUIRY", 35);
        p.put("CONTACTED", 48);
        p.put("QUALIFIED", 120);
        p.put("ITINERARY_PREPARED", 64);
        p.put("QUOTATION_SENT", 48);
        p.put("NEGOTIATION", 29);
        p.put("BOOKED", 76);
        p.put("LOST", 18);
        return ResponseEntity.ok(standardResponse(true, "Sales pipeline summary retrieved", p, "req-sm-pipe"));
    }

    @GetMapping("/dashboard/conversion")
    public ResponseEntity<Map<String, Object>> getConversionSummary(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> c = new LinkedHashMap<>();
        c.put("inquiriesReceived", 420);
        c.put("qualifiedInquiries", 120);
        c.put("quotesIssued", 168);
        c.put("confirmedBookings", 76);
        c.put("conversionRatePercent", 18.1);
        c.put("avgDaysToConvert", 6.2);
        return ResponseEntity.ok(standardResponse(true, "Lead-to-booking conversion summary retrieved", c, "req-sm-conv"));
    }

    @GetMapping("/dashboard/revenue")
    public ResponseEntity<Map<String, Object>> getRevenueSummary(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("grossBookingValue", 4788000.00);
        r.put("netMarginValue", 718200.00);
        r.put("marginPercent", 15.0);
        r.put("currency", "INR");
        r.put("period", "CURRENT_MONTH");
        return ResponseEntity.ok(standardResponse(true, "Sales revenue summary retrieved", r, "req-sm-rev"));
    }

    @GetMapping("/dashboard/activity")
    public ResponseEntity<Map<String, Object>> getRecentActivity(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardResponse(true, "Recent sales activity retrieved", store.getAuditLogs(), "req-sm-act"));
    }

    // ==========================================
    // 2. LEADS MANAGEMENT
    // ==========================================

    @GetMapping("/leads")
    public ResponseEntity<Map<String, Object>> getLeads(
            @RequestParam(required = false) String stage,
            @RequestParam(required = false) String destination,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> list = store.getLeads().values().stream()
                .filter(l -> stage == null || stage.equalsIgnoreCase((String) l.get("stage")))
                .filter(l -> destination == null || destination.equalsIgnoreCase((String) l.get("destination")))
                .collect(Collectors.toList());
        Map<String, Object> paged = new LinkedHashMap<>();
        paged.put("items", list);
        paged.put("page", page);
        paged.put("size", size);
        paged.put("totalElements", list.size());
        paged.put("totalPages", 1);
        return ResponseEntity.ok(standardResponse(true, "Leads retrieved successfully", paged, "req-sm-leads"));
    }

    @PostMapping("/leads")
    public ResponseEntity<Map<String, Object>> createLead(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String tenantId = getTenantId(tenantHeader);
        String leadId = "LEAD-" + (1001 + store.getLeads().size());
        String custId = "CUST-" + (1001 + store.getCustomers().size());

        Map<String, Object> custBody = (Map<String, Object>) body.get("customer");
        if (custBody != null) {
            Map<String, Object> c = new LinkedHashMap<>(custBody);
            c.put("customerId", custId);
            c.put("tenantId", tenantId);
            store.getCustomers().put(custId, c);
        }

        Map<String, Object> reqs = (Map<String, Object>) body.get("travelRequirements");

        Map<String, Object> lead = new LinkedHashMap<>();
        lead.put("leadId", leadId);
        lead.put("tenantId", tenantId);
        lead.put("customerId", custId);
        if (custBody != null) {
            lead.put("customerName", custBody.get("firstName") + " " + custBody.get("lastName"));
            lead.put("customerEmail", custBody.get("email"));
            lead.put("customerPhone", custBody.get("phone"));
        }
        if (reqs != null) {
            lead.put("destination", reqs.get("destination"));
            lead.put("departureDate", reqs.get("departureDate"));
            lead.put("returnDate", reqs.get("returnDate"));
            lead.put("adults", reqs.get("adults"));
            lead.put("children", reqs.get("children"));
            lead.put("budget", reqs.get("budget"));
            lead.put("currency", reqs.getOrDefault("currency", "INR"));
            lead.put("travelType", reqs.get("travelType"));
        }
        lead.put("status", "NEW");
        lead.put("stage", "NEW_ENQUIRY");
        lead.put("leadSource", body.getOrDefault("leadSource", "WEBSITE"));
        lead.put("notes", body.get("notes"));
        lead.put("assignedConsultantId", null);
        lead.put("createdAt", LocalDateTime.now().toString());

        store.getLeads().put(leadId, lead);
        store.logAudit(tenantId, "LEAD_CREATED", leadId, "SALES_MANAGER", "Lead created for " + lead.get("destination"));

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("leadId", leadId);
        data.put("customerId", custId);
        data.put("destination", lead.get("destination"));
        data.put("status", "NEW");
        data.put("stage", "NEW_ENQUIRY");
        data.put("assignedConsultantId", null);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                standardResponse(true, "Travel lead created", data, "req-sm-002"));
    }

    @GetMapping("/leads/{leadId}")
    public ResponseEntity<Map<String, Object>> getLead(
            @PathVariable String leadId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> lead = store.getLeads().get(leadId);
        if (lead == null) {
            return ResponseEntity.status(404).body(standardResponse(false, "Lead not found", null, "req-sm-404"));
        }
        return ResponseEntity.ok(standardResponse(true, "Lead details retrieved", lead, "req-sm-lead-get"));
    }

    @PatchMapping("/leads/{leadId}")
    public ResponseEntity<Map<String, Object>> updateLead(
            @PathVariable String leadId,
            @RequestBody Map<String, Object> updates,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> lead = store.getLeads().get(leadId);
        if (lead == null) {
            return ResponseEntity.status(404).body(standardResponse(false, "Lead not found", null, "req-sm-404"));
        }
        lead.putAll(updates);
        return ResponseEntity.ok(standardResponse(true, "Lead updated", lead, "req-sm-lead-patch"));
    }

    @PostMapping("/leads/{leadId}/assign")
    public ResponseEntity<Map<String, Object>> assignLead(
            @PathVariable String leadId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String consultantId = (String) body.get("consultantId");
        Map<String, Object> lead = store.getLeads().get(leadId);
        if (lead != null) {
            lead.put("assignedConsultantId", consultantId);
            lead.put("status", "ASSIGNED");
        }
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("leadId", leadId);
        data.put("assignedConsultantId", consultantId);
        data.put("status", "ASSIGNED");

        store.logAudit(getTenantId(tenantHeader), "LEAD_ASSIGNED", leadId, "SALES_MANAGER", "Assigned to " + consultantId);
        return ResponseEntity.ok(standardResponse(true, "Lead assigned successfully", data, "req-sm-003"));
    }

    @PostMapping("/leads/{leadId}/reassign")
    public ResponseEntity<Map<String, Object>> reassignLead(
            @PathVariable String leadId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String newConsultantId = (String) body.get("newConsultantId");
        Map<String, Object> lead = store.getLeads().get(leadId);
        String prev = lead != null ? (String) lead.get("assignedConsultantId") : "EMP-201";
        if (lead != null) {
            lead.put("previousConsultantId", prev);
            lead.put("assignedConsultantId", newConsultantId);
            lead.put("status", "ASSIGNED");
        }
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("leadId", leadId);
        data.put("previousConsultantId", prev);
        data.put("assignedConsultantId", newConsultantId);
        data.put("status", "ASSIGNED");

        store.logAudit(getTenantId(tenantHeader), "LEAD_REASSIGNED", leadId, "SALES_MANAGER", "Reassigned from " + prev + " to " + newConsultantId);
        return ResponseEntity.ok(standardResponse(true, "Lead reassigned", data, "req-sm-005"));
    }

    @PostMapping("/leads/{leadId}/qualify")
    public ResponseEntity<Map<String, Object>> qualifyLead(
            @PathVariable String leadId,
            @RequestBody(required = false) Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> lead = store.getLeads().get(leadId);
        if (lead != null) {
            lead.put("status", "QUALIFIED");
            lead.put("stage", "QUALIFIED");
        }
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("leadId", leadId);
        data.put("status", "QUALIFIED");
        data.put("stage", "QUALIFIED");
        return ResponseEntity.ok(standardResponse(true, "Lead qualified", data, "req-sm-004"));
    }

    @PostMapping("/leads/{leadId}/disqualify")
    public ResponseEntity<Map<String, Object>> disqualifyLead(
            @PathVariable String leadId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> lead = store.getLeads().get(leadId);
        if (lead != null) {
            lead.put("status", "DISQUALIFIED");
            lead.put("stage", "LOST");
            lead.put("disqualificationReason", body.get("reason"));
        }
        return ResponseEntity.ok(standardResponse(true, "Lead disqualified", lead, "req-sm-disqualify"));
    }

    @GetMapping("/leads/{leadId}/activities")
    public ResponseEntity<Map<String, Object>> getLeadActivities(
            @PathVariable String leadId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> acts = store.getLeadActivities().getOrDefault(leadId, Collections.emptyList());
        return ResponseEntity.ok(standardResponse(true, "Lead activities retrieved", acts, "req-sm-acts"));
    }

    @PostMapping("/leads/{leadId}/activities")
    public ResponseEntity<Map<String, Object>> recordLeadActivity(
            @PathVariable String leadId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> acts = store.getLeadActivities().computeIfAbsent(leadId, k -> new ArrayList<>());
        Map<String, Object> a = new LinkedHashMap<>(body);
        a.put("activityId", "ACT-" + (1001 + acts.size()));
        a.put("leadId", leadId);
        a.put("createdAt", LocalDateTime.now().toString());
        acts.add(a);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                standardResponse(true, "Lead activity recorded", a, "req-sm-act-rec"));
    }

    // ==========================================
    // 3. CUSTOMERS, CONSULTANTS & TEAMS
    // ==========================================

    @GetMapping("/customers")
    public ResponseEntity<Map<String, Object>> getCustomers(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> list = new ArrayList<>(store.getCustomers().values());
        return ResponseEntity.ok(standardResponse(true, "Authorized customer records retrieved", list, "req-sm-custs"));
    }

    @GetMapping("/customers/{customerId}")
    public ResponseEntity<Map<String, Object>> getCustomer(
            @PathVariable String customerId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> c = store.getCustomers().get(customerId);
        if (c == null) {
            return ResponseEntity.status(404).body(standardResponse(false, "Customer not found", null, "req-sm-404"));
        }
        return ResponseEntity.ok(standardResponse(true, "Customer details retrieved", c, "req-sm-cust-get"));
    }

    @GetMapping("/consultants")
    public ResponseEntity<Map<String, Object>> getConsultants(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> list = new ArrayList<>(store.getConsultants().values());
        return ResponseEntity.ok(standardResponse(true, "Eligible sales consultants retrieved", list, "req-sm-cons"));
    }

    @GetMapping("/consultants/{employeeId}/performance")
    public ResponseEntity<Map<String, Object>> getConsultantPerformance(
            @PathVariable String employeeId,
            @RequestParam(required = false, defaultValue = "2026-10-01") String from,
            @RequestParam(required = false, defaultValue = "2026-10-31") String to,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("employeeId", employeeId);
        data.put("period", Map.of("from", from, "to", to));
        data.put("leadsAssigned", 42);
        data.put("leadsQualified", 28);
        data.put("quotesSent", 20);
        data.put("confirmedBookings", 9);
        data.put("conversionRate", 21.43);
        data.put("currency", "INR");
        return ResponseEntity.ok(standardResponse(true, "Consultant performance retrieved", data, "req-sm-008"));
    }

    @GetMapping("/teams")
    public ResponseEntity<Map<String, Object>> getTeams(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> list = new ArrayList<>(store.getTeams().values());
        return ResponseEntity.ok(standardResponse(true, "Sales teams retrieved", list, "req-sm-teams"));
    }

    @PostMapping("/teams")
    public ResponseEntity<Map<String, Object>> createTeam(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String teamId = "TEAM-" + (1001 + store.getTeams().size());
        Map<String, Object> t = new LinkedHashMap<>(body);
        t.put("teamId", teamId);
        store.getTeams().put(teamId, t);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                standardResponse(true, "Sales team created", t, "req-sm-team-create"));
    }

    @PatchMapping("/teams/{teamId}")
    public ResponseEntity<Map<String, Object>> updateTeam(
            @PathVariable String teamId,
            @RequestBody Map<String, Object> updates,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> t = store.getTeams().get(teamId);
        if (t != null) t.putAll(updates);
        return ResponseEntity.ok(standardResponse(true, "Sales team updated", t, "req-sm-team-patch"));
    }

    // ==========================================
    // 4. PIPELINE & STAGES
    // ==========================================

    @GetMapping("/pipeline/stages")
    public ResponseEntity<Map<String, Object>> getPipelineStages(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> stages = Arrays.asList(
                Map.of("stage", "NEW_ENQUIRY", "label", "New Enquiry", "order", 1),
                Map.of("stage", "QUALIFIED", "label", "Qualified", "order", 2),
                Map.of("stage", "ITINERARY_PREPARED", "label", "Itinerary Prepared", "order", 3),
                Map.of("stage", "QUOTATION_SENT", "label", "Quotation Sent", "order", 4),
                Map.of("stage", "NEGOTIATION", "label", "Negotiation", "order", 5),
                Map.of("stage", "HANDOFF_TO_BOOKING", "label", "Handoff to Booking", "order", 6),
                Map.of("stage", "BOOKED", "label", "Confirmed Booking", "order", 7),
                Map.of("stage", "LOST", "label", "Lost / Cancelled", "order", 8)
        );
        return ResponseEntity.ok(standardResponse(true, "Pipeline stages retrieved", stages, "req-sm-stages"));
    }

    @PatchMapping("/leads/{leadId}/stage")
    public ResponseEntity<Map<String, Object>> updateLeadStage(
            @PathVariable String leadId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String newStage = (String) body.get("stage");
        Map<String, Object> lead = store.getLeads().get(leadId);
        String prev = lead != null ? (String) lead.get("stage") : "QUALIFIED";
        if (lead != null) {
            lead.put("stage", newStage);
            lead.put("stageReason", body.get("reason"));
        }
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("leadId", leadId);
        data.put("previousStage", prev);
        data.put("stage", newStage);

        store.logAudit(getTenantId(tenantHeader), "LEAD_STAGE_UPDATED", leadId, "SALES_MANAGER", "Moved to " + newStage);
        return ResponseEntity.ok(standardResponse(true, "Lead stage updated", data, "req-sm-006"));
    }

    // ==========================================
    // 5. QUOTATIONS & APPROVALS
    // ==========================================

    @GetMapping("/quotations")
    public ResponseEntity<Map<String, Object>> getQuotations(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> list = new ArrayList<>(store.getQuotations().values());
        return ResponseEntity.ok(standardResponse(true, "Quotations retrieved", list, "req-sm-quotes"));
    }

    @GetMapping("/quotations/{quoteId}")
    public ResponseEntity<Map<String, Object>> getQuotation(
            @PathVariable String quoteId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> q = store.getQuotations().get(quoteId);
        if (q == null) {
            return ResponseEntity.status(404).body(standardResponse(false, "Quotation not found", null, "req-sm-404"));
        }
        return ResponseEntity.ok(standardResponse(true, "Quotation details retrieved", q, "req-sm-quote-get"));
    }

    @PostMapping("/quotations/{quoteId}/approval-requests")
    public ResponseEntity<Map<String, Object>> requestQuotationApproval(
            @PathVariable String quoteId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> q = store.getQuotations().get(quoteId);
        if (q != null) {
            q.put("approvalStatus", "PENDING_APPROVAL");
            q.put("requestedDiscountPercent", body.get("requestedDiscountPercent"));
            q.put("approvalReason", body.get("reason"));
        }
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("quoteId", quoteId);
        data.put("approvalStatus", "PENDING_APPROVAL");
        return ResponseEntity.ok(standardResponse(true, "Quotation approval requested", data, "req-sm-009"));
    }

    @PostMapping("/quotations/{quoteId}/approve")
    public ResponseEntity<Map<String, Object>> approveQuotation(
            @PathVariable String quoteId,
            @RequestBody(required = false) Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> q = store.getQuotations().get(quoteId);
        if (q != null) {
            q.put("approvalStatus", "APPROVED");
            q.put("approvedBy", "SALES_MANAGER");
            q.put("approvalComment", body != null ? body.get("comment") : "Approved");
        }
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("quoteId", quoteId);
        data.put("approvalStatus", "APPROVED");
        data.put("approvedBy", "AUTHENTICATED_MANAGER");

        store.logAudit(getTenantId(tenantHeader), "QUOTATION_APPROVED", quoteId, "SALES_MANAGER", "Discount approved");
        return ResponseEntity.ok(standardResponse(true, "Quotation approved", data, "req-sm-010"));
    }

    @PostMapping("/quotations/{quoteId}/reject")
    public ResponseEntity<Map<String, Object>> rejectQuotation(
            @PathVariable String quoteId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> q = store.getQuotations().get(quoteId);
        if (q != null) {
            q.put("approvalStatus", "REJECTED");
            q.put("rejectionReason", body.get("reason"));
        }
        return ResponseEntity.ok(standardResponse(true, "Quotation rejected", q, "req-sm-quote-reject"));
    }

    // ==========================================
    // 6. TARGETS & REPORTS
    // ==========================================

    @GetMapping("/targets")
    public ResponseEntity<Map<String, Object>> getTargets(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> list = new ArrayList<>(store.getSalesTargets().values());
        return ResponseEntity.ok(standardResponse(true, "Sales targets retrieved", list, "req-sm-targets"));
    }

    @PostMapping("/targets")
    public ResponseEntity<Map<String, Object>> createTarget(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String targetId = "TARGET-" + (1001 + store.getSalesTargets().size());
        Map<String, Object> t = new LinkedHashMap<>(body);
        t.put("targetId", targetId);
        t.put("achievedValue", 0.0);
        t.put("status", "ACTIVE");
        store.getSalesTargets().put(targetId, t);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("targetId", targetId);
        data.put("employeeId", body.get("employeeId"));
        data.put("targetValue", body.get("targetValue"));
        data.put("achievedValue", 0);
        data.put("currency", body.getOrDefault("currency", "INR"));
        data.put("status", "ACTIVE");

        return ResponseEntity.ok(standardResponse(true, "Sales target created", data, "req-sm-007"));
    }

    @GetMapping("/targets/{targetId}")
    public ResponseEntity<Map<String, Object>> getTarget(
            @PathVariable String targetId,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> t = store.getSalesTargets().get(targetId);
        return ResponseEntity.ok(standardResponse(true, "Target details retrieved", t, "req-sm-trg-get"));
    }

    @PatchMapping("/targets/{targetId}")
    public ResponseEntity<Map<String, Object>> updateTarget(
            @PathVariable String targetId,
            @RequestBody Map<String, Object> updates,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> t = store.getSalesTargets().get(targetId);
        if (t != null) t.putAll(updates);
        return ResponseEntity.ok(standardResponse(true, "Target updated", t, "req-sm-trg-patch"));
    }

    @GetMapping("/reports/lead-sources")
    public ResponseEntity<Map<String, Object>> getLeadSourceReport(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> list = Arrays.asList(
                Map.of("source", "WEBSITE", "leadsCount", 185, "conversionRate", 22.4),
                Map.of("source", "WHATSAPP", "leadsCount", 120, "conversionRate", 19.2),
                Map.of("source", "REFERRAL", "leadsCount", 65, "conversionRate", 34.0),
                Map.of("source", "INSTAGRAM", "leadsCount", 50, "conversionRate", 10.5)
        );
        return ResponseEntity.ok(standardResponse(true, "Lead source report retrieved", list, "req-sm-rep-src"));
    }

    @GetMapping("/reports/destination-performance")
    public ResponseEntity<Map<String, Object>> getDestinationPerformance(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> list = Arrays.asList(
                Map.of("destination", "Bali", "inquiries", 145, "bookings", 38, "revenue", 2394000.00),
                Map.of("destination", "Dubai", "inquiries", 120, "bookings", 24, "revenue", 2040000.00),
                Map.of("destination", "Switzerland", "inquiries", 55, "bookings", 8, "revenue", 1280000.00),
                Map.of("destination", "Maldives", "inquiries", 60, "bookings", 12, "revenue", 1920000.00)
        );
        return ResponseEntity.ok(standardResponse(true, "Destination performance report retrieved", list, "req-sm-rep-dest"));
    }

    @GetMapping("/reports/package-performance")
    public ResponseEntity<Map<String, Object>> getPackagePerformance(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> list = Arrays.asList(
                Map.of("packageId", "PKG-1001", "name", "Bali Five-Night Tropical Holiday", "sold", 28, "revenue", 2660000.00),
                Map.of("packageId", "PKG-1002", "name", "Dubai Luxury 5D/4N Extravaganza", "sold", 22, "revenue", 1870000.00)
        );
        return ResponseEntity.ok(standardResponse(true, "Package performance report retrieved", list, "req-sm-rep-pkg"));
    }

    @GetMapping("/reports/consultant-performance")
    public ResponseEntity<Map<String, Object>> getConsultantPerformanceReport(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> list = Arrays.asList(
                Map.of("employeeId", "EMP-201", "name", "Rajesh Verma", "leads", 42, "booked", 9, "conversion", 21.43),
                Map.of("employeeId", "EMP-202", "name", "Meera Nambiar", "leads", 35, "booked", 7, "conversion", 20.0)
        );
        return ResponseEntity.ok(standardResponse(true, "Consultant performance report retrieved", list, "req-sm-rep-cons"));
    }

    @GetMapping("/reports/booking-conversion")
    public ResponseEntity<Map<String, Object>> getBookingConversionReport(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> r = new LinkedHashMap<>();
        r.put("totalLeads", 420);
        r.put("totalBookings", 76);
        r.put("overallConversionRate", 18.1);
        r.put("monthlyTrend", Arrays.asList(
                Map.of("month", "August 2026", "rate", 16.5),
                Map.of("month", "September 2026", "rate", 17.8),
                Map.of("month", "October 2026", "rate", 18.1)
        ));
        return ResponseEntity.ok(standardResponse(true, "Booking conversion report retrieved", r, "req-sm-rep-conv"));
    }

    // ==========================================
    // 7. FOLLOW-UPS, ESCALATIONS & AUDIT
    // ==========================================

    @GetMapping("/follow-ups/overdue")
    public ResponseEntity<Map<String, Object>> getOverdueFollowUps(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> list = new ArrayList<>(store.getFollowUpTasks().values());
        return ResponseEntity.ok(standardResponse(true, "Overdue follow-ups retrieved", list, "req-sm-overdue"));
    }

    @PostMapping("/follow-ups/{taskId}/assign")
    public ResponseEntity<Map<String, Object>> assignFollowUpTask(
            @PathVariable String taskId,
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> t = store.getFollowUpTasks().get(taskId);
        if (t != null) {
            t.put("assignedTo", body.get("employeeId"));
            t.put("status", "ASSIGNED");
        }
        return ResponseEntity.ok(standardResponse(true, "Follow-up task assigned", t, "req-sm-task-assign"));
    }

    @PostMapping("/escalations")
    public ResponseEntity<Map<String, Object>> createEscalation(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        String escId = "ESC-" + (1001 + store.getEscalations().size());
        Map<String, Object> esc = new LinkedHashMap<>(body);
        esc.put("escalationId", escId);
        esc.put("status", "OPEN");
        esc.put("createdAt", LocalDateTime.now().toString());
        store.getEscalations().put(escId, esc);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                standardResponse(true, "Sales escalation created", esc, "req-sm-esc-create"));
    }

    @GetMapping("/escalations")
    public ResponseEntity<Map<String, Object>> getEscalations(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        List<Map<String, Object>> list = new ArrayList<>(store.getEscalations().values());
        return ResponseEntity.ok(standardResponse(true, "Sales escalations retrieved", list, "req-sm-escs"));
    }

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getMetrics(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("pipelineValue", 14500000.00);
        m.put("activeQuotesCount", store.getQuotations().size());
        m.put("averageDealSize", 63000.00);
        m.put("teamConversionRate", 18.1);
        return ResponseEntity.ok(standardResponse(true, "Sales metrics retrieved", m, "req-sm-met"));
    }

    @GetMapping("/activity-logs")
    public ResponseEntity<Map<String, Object>> getActivityLogs(
            @RequestHeader(value = "X-Tenant-Id", required = false) String tenantHeader) {
        return ResponseEntity.ok(standardResponse(true, "Authorized audit records retrieved", store.getAuditLogs(), "req-sm-logs"));
    }
}
