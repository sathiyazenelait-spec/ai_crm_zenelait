package com.zenelait.crm.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Zenelait AI CRM — Marketing Manager V1 REST API Controller
 * Implements campaign lifecycle, audience segmentation, forms, lead sources,
 * attribution reporting, marketing automations, and AI content draft generators.
 */
@RestController
@RequestMapping("/api/v1/marketing")
@CrossOrigin(origins = "*")
public class SoftwareMarketingV1Controller {

    private final List<Map<String, Object>> campaigns = new ArrayList<>();
    private final List<Map<String, Object>> audiences = new ArrayList<>();
    private final List<Map<String, Object>> forms = new ArrayList<>();
    private final List<Map<String, Object>> automations = new ArrayList<>();
    private final List<Map<String, Object>> sources = new ArrayList<>();
    private final List<Map<String, Object>> recipients = new ArrayList<>();

    public SoftwareMarketingV1Controller() {
        initMarketingData();
    }

    private void initMarketingData() {
        // Audiences
        Map<String, Object> aud1 = new LinkedHashMap<>();
        aud1.put("audienceId", "AUD-1001");
        aud1.put("name", "Software Companies Interested in CRM");
        aud1.put("description", "Business contacts interested in CRM services");
        aud1.put("matchMode", "ALL");
        aud1.put("estimatedContactCount", 245);
        aud1.put("status", "ACTIVE");
        aud1.put("rules", List.of(
                Map.of("field", "industry", "operator", "EQUALS", "value", "SOFTWARE_IT"),
                Map.of("field", "interest", "operator", "EQUALS", "value", "CRM"),
                Map.of("field", "marketingConsent", "operator", "EQUALS", "value", true)
        ));
        audiences.add(aud1);

        Map<String, Object> aud2 = new LinkedHashMap<>();
        aud2.put("audienceId", "AUD-1002");
        aud2.put("name", "High-Growth Tech Startups (50-200 Seats)");
        aud2.put("description", "Startups expanding their customer success and sales operations");
        aud2.put("matchMode", "ALL");
        aud2.put("estimatedContactCount", 180);
        aud2.put("status", "ACTIVE");
        audiences.add(aud2);

        // Campaigns
        Map<String, Object> cam1 = new LinkedHashMap<>();
        cam1.put("campaignId", "CAM-1001");
        cam1.put("name", "Enterprise CRM Lead Generation");
        cam1.put("campaignType", "EMAIL");
        cam1.put("objective", "LEAD_GENERATION");
        cam1.put("audienceId", "AUD-1001");
        cam1.put("audienceName", "Software Companies Interested in CRM");
        cam1.put("status", "SCHEDULED");
        cam1.put("scheduledAt", "2026-10-27T10:00:00+05:30");
        cam1.put("timeZone", "Asia/Kolkata");
        cam1.put("sent", 220);
        cam1.put("delivered", 215);
        cam1.put("opened", 120);
        cam1.put("clicked", 35);
        cam1.put("leadsGenerated", 28);
        cam1.put("opportunitiesAttributed", 6);
        cam1.put("spend", 15000);
        cam1.put("currency", "INR");
        cam1.put("subject", "Explore a CRM solution tailored for your software team");
        cam1.put("createdBy", "USR-MKT-001");
        campaigns.add(cam1);

        Map<String, Object> cam2 = new LinkedHashMap<>();
        cam2.put("campaignId", "CAM-1002");
        cam2.put("name", "Q4 Cloud Modernization Webinar");
        cam2.put("campaignType", "WEBINAR");
        cam2.put("objective", "BRAND_AWARENESS");
        cam2.put("audienceId", "AUD-1002");
        cam2.put("audienceName", "High-Growth Tech Startups");
        cam2.put("status", "ACTIVE");
        cam2.put("sent", 500);
        cam2.put("delivered", 488);
        cam2.put("opened", 290);
        cam2.put("clicked", 95);
        cam2.put("leadsGenerated", 45);
        cam2.put("opportunitiesAttributed", 8);
        cam2.put("spend", 25000);
        cam2.put("currency", "INR");
        cam2.put("createdBy", "USR-MKT-001");
        campaigns.add(cam2);

        // Forms
        Map<String, Object> form1 = new LinkedHashMap<>();
        form1.put("formId", "FRM-101");
        form1.put("name", "Website CRM Demo Request Form");
        form1.put("fields", List.of("Name", "Work Email", "Company Name", "Phone", "Estimated Budget"));
        form1.put("submissions", 185);
        form1.put("conversionRate", 14.8);
        form1.put("status", "ACTIVE");
        forms.add(form1);

        Map<String, Object> form2 = new LinkedHashMap<>();
        form2.put("formId", "FRM-102");
        form2.put("name", "SaaS Pricing Calculator Lead Gate");
        form2.put("fields", List.of("Email", "Team Size", "Industry"));
        form2.put("submissions", 320);
        form2.put("conversionRate", 22.4);
        form2.put("status", "ACTIVE");
        forms.add(form2);

        // Sources
        sources.add(Map.of("source", "WEBSITE", "leadsGenerated", 180, "mqls", 62, "attributedPipeline", 950000, "conversionRate", 34.4));
        sources.add(Map.of("source", "EMAIL_CAMPAIGN", "leadsGenerated", 120, "mqls", 38, "attributedPipeline", 520000, "conversionRate", 31.6));
        sources.add(Map.of("source", "LINKEDIN_ADS", "leadsGenerated", 70, "mqls", 25, "attributedPipeline", 330000, "conversionRate", 35.7));

        // Automations
        Map<String, Object> auto1 = new LinkedHashMap<>();
        auto1.put("automationId", "MKT-AUTO-1");
        auto1.put("name", "New Website Lead Welcome & Nurture Sequence");
        auto1.put("trigger", "FORM_SUBMITTED");
        auto1.put("status", "ACTIVE");
        auto1.put("stepsCount", 3);
        automations.add(auto1);

        // Recipients Sample
        recipients.add(Map.of("recipientId", "REC-1", "contactName", "Karthik Raj", "company", "ABC Technologies", "email", "karthik@abctech.example", "status", "DELIVERED", "opened", true, "clicked", true));
        recipients.add(Map.of("recipientId", "REC-2", "contactName", "Rohit Joshi", "company", "Apex Cloud", "email", "rohit@apexcloud.example", "status", "DELIVERED", "opened", true, "clicked", false));
    }

    private Map<String, Object> envelope(String message, Object data, String requestId) {
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("message", message);
        res.put("data", data);
        res.put("timestamp", LocalDateTime.now().toString());
        res.put("requestId", requestId != null ? requestId : "req_mkt_" + (System.currentTimeMillis() % 100000));
        return res;
    }

    // =========================================================================
    // 1. CAMPAIGNS
    // =========================================================================

    @GetMapping("/campaigns")
    public ResponseEntity<Map<String, Object>> getCampaigns() {
        return ResponseEntity.ok(envelope("Campaigns retrieved", campaigns, "req_mkt_cam_001"));
    }

    @PostMapping("/campaigns")
    public ResponseEntity<Map<String, Object>> createCampaign(@RequestBody Map<String, Object> body) {
        String newId = "CAM-" + (1000 + campaigns.size() + 1);
        Map<String, Object> camp = new LinkedHashMap<>(body);
        camp.put("campaignId", newId);
        camp.put("status", "DRAFT");
        camp.put("createdBy", "USR-MKT-001");
        camp.put("sent", 0);
        camp.put("delivered", 0);
        camp.put("opened", 0);
        camp.put("clicked", 0);
        camp.put("leadsGenerated", 0);
        camp.put("opportunitiesAttributed", 0);
        campaigns.add(0, camp);

        return ResponseEntity.status(HttpStatus.CREATED).body(envelope("Campaign created in draft mode", camp, "req_mkt_002"));
    }

    @GetMapping("/campaigns/{campaignId}")
    public ResponseEntity<Map<String, Object>> getCampaign(@PathVariable String campaignId) {
        return campaigns.stream()
                .filter(c -> campaignId.equalsIgnoreCase((String) c.get("campaignId")))
                .findFirst()
                .map(c -> ResponseEntity.ok(envelope("Campaign details retrieved", c, "req_mkt_cam_002")))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(envelope("Campaign not found", null, "req_err")));
    }

    @PatchMapping("/campaigns/{campaignId}")
    public ResponseEntity<Map<String, Object>> updateCampaign(@PathVariable String campaignId, @RequestBody Map<String, Object> body) {
        for (Map<String, Object> c : campaigns) {
            if (campaignId.equalsIgnoreCase((String) c.get("campaignId"))) {
                c.putAll(body);
                return ResponseEntity.ok(envelope("Campaign updated", c, "req_mkt_cam_003"));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(envelope("Campaign not found", null, "req_err"));
    }

    @PostMapping("/campaigns/{campaignId}/schedule")
    public ResponseEntity<Map<String, Object>> scheduleCampaign(@PathVariable String campaignId, @RequestBody Map<String, Object> body) {
        for (Map<String, Object> c : campaigns) {
            if (campaignId.equalsIgnoreCase((String) c.get("campaignId"))) {
                c.put("status", "SCHEDULED");
                c.put("scheduledAt", body.getOrDefault("scheduledAt", LocalDateTime.now().plusDays(2).toString()));
                c.put("timeZone", body.getOrDefault("timeZone", "Asia/Kolkata"));
                c.put("eligibleRecipients", 245);

                Map<String, Object> res = new LinkedHashMap<>();
                res.put("campaignId", campaignId);
                res.put("status", "SCHEDULED");
                res.put("scheduledAt", c.get("scheduledAt"));
                res.put("timeZone", c.get("timeZone"));
                res.put("eligibleRecipients", 245);
                return ResponseEntity.ok(envelope("Campaign scheduled", res, "req_mkt_005"));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(envelope("Campaign not found", null, "req_err"));
    }

    @PostMapping("/campaigns/{campaignId}/pause")
    public ResponseEntity<Map<String, Object>> pauseCampaign(@PathVariable String campaignId) {
        for (Map<String, Object> c : campaigns) {
            if (campaignId.equalsIgnoreCase((String) c.get("campaignId"))) {
                c.put("status", "PAUSED");
                return ResponseEntity.ok(envelope("Campaign paused", c, "req_mkt_cam_004"));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(envelope("Campaign not found", null, "req_err"));
    }

    @PostMapping("/campaigns/{campaignId}/cancel")
    public ResponseEntity<Map<String, Object>> cancelCampaign(@PathVariable String campaignId) {
        for (Map<String, Object> c : campaigns) {
            if (campaignId.equalsIgnoreCase((String) c.get("campaignId"))) {
                c.put("status", "CANCELLED");
                return ResponseEntity.ok(envelope("Campaign cancelled", c, "req_mkt_cam_005"));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(envelope("Campaign not found", null, "req_err"));
    }

    @GetMapping("/campaigns/{campaignId}/recipients")
    public ResponseEntity<Map<String, Object>> getCampaignRecipients(@PathVariable String campaignId) {
        return ResponseEntity.ok(envelope("Campaign recipients retrieved", recipients, "req_mkt_cam_006"));
    }

    // =========================================================================
    // 2. AUDIENCE SEGMENTS
    // =========================================================================

    @GetMapping("/audiences")
    public ResponseEntity<Map<String, Object>> getAudiences() {
        return ResponseEntity.ok(envelope("Audiences retrieved", audiences, "req_mkt_aud_001"));
    }

    @PostMapping("/audiences")
    public ResponseEntity<Map<String, Object>> createAudience(@RequestBody Map<String, Object> body) {
        String newId = "AUD-" + (1000 + audiences.size() + 1);
        Map<String, Object> aud = new LinkedHashMap<>(body);
        aud.put("audienceId", newId);
        aud.put("estimatedContactCount", 245);
        aud.put("status", "ACTIVE");
        audiences.add(0, aud);

        return ResponseEntity.status(HttpStatus.CREATED).body(envelope("Audience segment created", aud, "req_mkt_003"));
    }

    @GetMapping("/audiences/{audienceId}")
    public ResponseEntity<Map<String, Object>> getAudience(@PathVariable String audienceId) {
        return audiences.stream()
                .filter(a -> audienceId.equalsIgnoreCase((String) a.get("audienceId")))
                .findFirst()
                .map(a -> ResponseEntity.ok(envelope("Audience details retrieved", a, "req_mkt_aud_002")))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(envelope("Audience not found", null, "req_err")));
    }

    @PatchMapping("/audiences/{audienceId}")
    public ResponseEntity<Map<String, Object>> updateAudience(@PathVariable String audienceId, @RequestBody Map<String, Object> body) {
        for (Map<String, Object> a : audiences) {
            if (audienceId.equalsIgnoreCase((String) a.get("audienceId"))) {
                a.putAll(body);
                return ResponseEntity.ok(envelope("Audience segment updated", a, "req_mkt_aud_003"));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(envelope("Audience not found", null, "req_err"));
    }

    @PostMapping("/audiences/{audienceId}/preview")
    public ResponseEntity<Map<String, Object>> previewAudience(@PathVariable String audienceId, @RequestBody(required = false) Map<String, Object> body) {
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("audienceId", audienceId);
        res.put("eligibleCount", 245);
        res.put("preview", List.of(
                Map.of("contactId", "CON-2001", "companyName", "ABC Technologies", "industry", "SOFTWARE_IT", "marketingConsent", true),
                Map.of("contactId", "CON-2002", "companyName", "TechSparks Pvt Ltd", "industry", "SOFTWARE_IT", "marketingConsent", true),
                Map.of("contactId", "CON-2003", "companyName", "CloudForge Systems", "industry", "SOFTWARE_IT", "marketingConsent", true)
        ));
        return ResponseEntity.ok(envelope("Audience preview generated", res, "req_mkt_004"));
    }

    // =========================================================================
    // 3. FORMS, SOURCES & ATTRIBUTION
    // =========================================================================

    @GetMapping("/forms")
    public ResponseEntity<Map<String, Object>> getForms() {
        return ResponseEntity.ok(envelope("Lead capture forms retrieved", forms, "req_mkt_frm_001"));
    }

    @PostMapping("/forms")
    public ResponseEntity<Map<String, Object>> createForm(@RequestBody Map<String, Object> body) {
        String newId = "FRM-" + (100 + forms.size() + 1);
        Map<String, Object> form = new LinkedHashMap<>(body);
        form.put("formId", newId);
        form.put("submissions", 0);
        form.put("conversionRate", 0.0);
        form.put("status", "ACTIVE");
        forms.add(0, form);

        return ResponseEntity.status(HttpStatus.CREATED).body(envelope("Lead capture form created", form, "req_mkt_frm_002"));
    }

    @PatchMapping("/forms/{formId}")
    public ResponseEntity<Map<String, Object>> updateForm(@PathVariable String formId, @RequestBody Map<String, Object> body) {
        for (Map<String, Object> f : forms) {
            if (formId.equalsIgnoreCase((String) f.get("formId"))) {
                f.putAll(body);
                return ResponseEntity.ok(envelope("Lead capture form updated", f, "req_mkt_frm_003"));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(envelope("Form not found", null, "req_err"));
    }

    @GetMapping("/sources")
    public ResponseEntity<Map<String, Object>> getSources() {
        return ResponseEntity.ok(envelope("Lead-source performance retrieved", sources, "req_mkt_src_001"));
    }

    @GetMapping("/attribution")
    public ResponseEntity<Map<String, Object>> getAttribution() {
        Map<String, Object> attr = new LinkedHashMap<>();
        attr.put("model", "FIRST_TOUCH");
        attr.put("totalAttributedPipeline", 1800000);
        attr.put("currency", "INR");
        attr.put("topCampaigns", List.of(
                Map.of("campaignId", "CAM-1001", "name", "Enterprise CRM Lead Generation", "pipelineWon", 650000, "dealsWon", 4),
                Map.of("campaignId", "CAM-1002", "name", "Q4 Cloud Modernization Webinar", "pipelineWon", 420000, "dealsWon", 3)
        ));
        return ResponseEntity.ok(envelope("Campaign attribution report retrieved", attr, "req_mkt_attr_001"));
    }

    // =========================================================================
    // 4. MARKETING AUTOMATIONS
    // =========================================================================

    @GetMapping("/automations")
    public ResponseEntity<Map<String, Object>> getAutomations() {
        return ResponseEntity.ok(envelope("Marketing automations retrieved", automations, "req_mkt_auto_001"));
    }

    @PostMapping("/automations")
    public ResponseEntity<Map<String, Object>> createAutomation(@RequestBody Map<String, Object> body) {
        String newId = "MKT-AUTO-" + (automations.size() + 1);
        Map<String, Object> auto = new LinkedHashMap<>(body);
        auto.put("automationId", newId);
        auto.put("status", "ACTIVE");
        automations.add(0, auto);

        return ResponseEntity.status(HttpStatus.CREATED).body(envelope("Marketing automation created", auto, "req_mkt_auto_002"));
    }

    @PatchMapping("/automations/{automationId}")
    public ResponseEntity<Map<String, Object>> updateAutomation(@PathVariable String automationId, @RequestBody Map<String, Object> body) {
        for (Map<String, Object> a : automations) {
            if (automationId.equalsIgnoreCase((String) a.get("automationId"))) {
                a.putAll(body);
                return ResponseEntity.ok(envelope("Marketing automation updated", a, "req_mkt_auto_003"));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(envelope("Automation not found", null, "req_err"));
    }

    @PostMapping("/automations/{automationId}/activate")
    public ResponseEntity<Map<String, Object>> activateAutomation(@PathVariable String automationId) {
        for (Map<String, Object> a : automations) {
            if (automationId.equalsIgnoreCase((String) a.get("automationId"))) {
                a.put("status", "ACTIVE");
                return ResponseEntity.ok(envelope("Automation activated", a, "req_mkt_auto_004"));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(envelope("Automation not found", null, "req_err"));
    }

    @PostMapping("/automations/{automationId}/pause")
    public ResponseEntity<Map<String, Object>> pauseAutomation(@PathVariable String automationId) {
        for (Map<String, Object> a : automations) {
            if (automationId.equalsIgnoreCase((String) a.get("automationId"))) {
                a.put("status", "PAUSED");
                return ResponseEntity.ok(envelope("Automation paused", a, "req_mkt_auto_005"));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(envelope("Automation not found", null, "req_err"));
    }

    // =========================================================================
    // 5. AI MARKETING ASSISTANTS
    // =========================================================================

    @PostMapping("/ai/content-draft")
    public ResponseEntity<Map<String, Object>> generateContentDraft(@RequestBody Map<String, Object> body) {
        String product = (String) body.getOrDefault("productOrService", "Enterprise Custom CRM");
        String tone = (String) body.getOrDefault("tone", "PROFESSIONAL");

        Map<String, Object> draft = new LinkedHashMap<>();
        draft.put("draftId", "AIDRAFT-" + (1000 + (System.currentTimeMillis() % 9000)));
        draft.put("subject", "Simplify Your Software Sales Pipeline with " + product);
        draft.put("body", "Looking for a faster way to qualify software leads and automate proposals? Discover how Zenelait AI CRM gives your engineering and sales teams unified visibility.");
        draft.put("callToAction", "Schedule a 15-Minute Technical Consultation");
        draft.put("status", "DRAFT");
        draft.put("tone", tone);
        draft.put("requiresHumanReview", true);

        return ResponseEntity.ok(envelope("Marketing content draft generated", draft, "req_mkt_007"));
    }

    @PostMapping("/ai/campaign-insights")
    public ResponseEntity<Map<String, Object>> generateCampaignInsights(@RequestBody Map<String, Object> body) {
        Map<String, Object> insights = new LinkedHashMap<>();
        insights.put("topPerformingSubject", "Simplify Your Customer Management");
        insights.put("recommendedSendTime", "Tuesday at 10:00 AM IST");
        insights.put("predictedMqlLiftPercent", 14.5);
        insights.put("recommendations", List.of(
                "Segment contacts by industry before dispatching custom CRM copy",
                "A/B test subject lines focusing on time-to-delivery vs pricing transparency"
        ));
        return ResponseEntity.ok(envelope("Campaign insights generated", insights, "req_mkt_ai_002"));
    }
}
