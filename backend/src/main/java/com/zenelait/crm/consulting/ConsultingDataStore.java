package com.zenelait.crm.consulting;

import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Thread-safe, tenant-aware in-memory data store for the Consulting Companies Tenant.
 * Seeded with standard illustrative records for:
 * - Sales Manager & Executive (CLD-1001, OPP-2001, PROP-4001, TGT-3001, etc.)
 * - Relationship Manager (ACC-1001, HLA-3001, RSK-4001, MTG-5001, GRO-6001, HO-7001)
 * - AI Lead Qualification Agent (LEAD-1001, LQ-JOB-1001, Q-101, Q-102, LQ-REVIEW-1001)
 * - Customer AI Support Agent (CONV-1001, TKT-1001, ESC-1001, HO-SUP-1001, FB-SUP-1001)
 * - Customer AI Follow-up Agent (FU-1001, FU-1002, APR-FU-1001, DRAFT-1001, MSG-FU-1001)
 */
@Component
public class ConsultingDataStore {

    public static final String DEFAULT_TENANT = "tenant-6";

    // Leads: Map<TenantId, Map<LeadId, Map<String, Object>>>
    private final Map<String, Map<String, Map<String, Object>>> leads = new ConcurrentHashMap<>();

    // Clients & Contacts
    private final Map<String, Map<String, Map<String, Object>>> clients = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Map<String, Object>>> contacts = new ConcurrentHashMap<>();

    // Relationship Manager Entities
    private final Map<String, Map<String, Map<String, Object>>> accounts = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Map<String, Object>>> healthAssessments = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Map<String, Object>>> risks = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Map<String, Object>>> stakeholders = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Map<String, Object>>> reviewMeetings = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Map<String, Object>>> satisfactionSurveys = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Map<String, Object>>> renewals = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Map<String, Object>>> growthOpportunities = new ConcurrentHashMap<>();

    // AI Lead Qualification Entities
    private final Map<String, Map<String, Map<String, Object>>> qualificationJobs = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Map<String, Object>>> qualificationQuestions = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Map<String, Object>>> qualificationReviewDecisions = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Map<String, Object>>> scoringRules = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Map<String, Object>>> routingRules = new ConcurrentHashMap<>();

    // Customer AI Support Entities
    private final Map<String, Map<String, Map<String, Object>>> conversations = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Map<String, Object>>> supportHandoffs = new ConcurrentHashMap<>();

    // Customer AI Follow-up Entities
    private final Map<String, Map<String, Map<String, Object>>> followUpRules = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Map<String, Object>>> followUpCampaigns = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Map<String, Object>>> followUpTasks = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Map<String, Object>>> followUpApprovals = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Map<String, Object>>> contactPreferences = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Map<String, Object>>> optOuts = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Map<String, Object>>> followUpMessages = new ConcurrentHashMap<>();

    // Services
    private final Map<String, Map<String, Map<String, Object>>> services = new ConcurrentHashMap<>();

    // Opportunities
    private final Map<String, Map<String, Map<String, Object>>> opportunities = new ConcurrentHashMap<>();

    // Proposals & Revisions
    private final Map<String, Map<String, Map<String, Object>>> proposals = new ConcurrentHashMap<>();

    // Targets & Team Assignments
    private final Map<String, Map<String, Map<String, Object>>> targets = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Map<String, Object>>> teamAssignments = new ConcurrentHashMap<>();

    // Discovery Sessions & Requirements
    private final Map<String, Map<String, Map<String, Object>>> discoverySessions = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Map<String, Object>>> requirements = new ConcurrentHashMap<>();

    // Meetings
    private final Map<String, Map<String, Map<String, Object>>> meetings = new ConcurrentHashMap<>();

    // Tasks & Follow-ups
    private final Map<String, Map<String, Map<String, Object>>> tasks = new ConcurrentHashMap<>();

    // Pricing & Discount Requests
    private final Map<String, Map<String, Map<String, Object>>> pricingRequests = new ConcurrentHashMap<>();

    // Contracts & Invoices
    private final Map<String, Map<String, Map<String, Object>>> contracts = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Map<String, Object>>> invoices = new ConcurrentHashMap<>();

    // Engagement Handoffs
    private final Map<String, Map<String, Map<String, Object>>> engagementHandoffs = new ConcurrentHashMap<>();

    // Support Tickets
    private final Map<String, Map<String, Map<String, Object>>> tickets = new ConcurrentHashMap<>();

    // Deliverable Access Requests
    private final Map<String, Map<String, Map<String, Object>>> deliverableRequests = new ConcurrentHashMap<>();

    // Billing Enquiries
    private final Map<String, Map<String, Map<String, Object>>> billingEnquiries = new ConcurrentHashMap<>();

    // SLA Policies
    private final Map<String, Map<String, Map<String, Object>>> slaPolicies = new ConcurrentHashMap<>();

    // Knowledge Articles
    private final Map<String, Map<String, Map<String, Object>>> knowledgeArticles = new ConcurrentHashMap<>();

    // Client Feedback & Complaints
    private final Map<String, Map<String, Map<String, Object>>> feedbacks = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Map<String, Object>>> complaints = new ConcurrentHashMap<>();

    // Escalations
    private final Map<String, Map<String, Map<String, Object>>> escalations = new ConcurrentHashMap<>();

    // Activity Logs
    private final Map<String, List<Map<String, Object>>> activityLogs = new ConcurrentHashMap<>();

    // Team Members (authorized per tenant)
    private final Map<String, List<Map<String, Object>>> teamMembers = new ConcurrentHashMap<>();

    public ConsultingDataStore() {
        seedTenant(DEFAULT_TENANT);
    }

    public synchronized void seedTenant(String tenantId) {
        if (leads.containsKey(tenantId)) return;

        leads.put(tenantId, new ConcurrentHashMap<>());
        clients.put(tenantId, new ConcurrentHashMap<>());
        contacts.put(tenantId, new ConcurrentHashMap<>());
        accounts.put(tenantId, new ConcurrentHashMap<>());
        healthAssessments.put(tenantId, new ConcurrentHashMap<>());
        risks.put(tenantId, new ConcurrentHashMap<>());
        stakeholders.put(tenantId, new ConcurrentHashMap<>());
        reviewMeetings.put(tenantId, new ConcurrentHashMap<>());
        satisfactionSurveys.put(tenantId, new ConcurrentHashMap<>());
        renewals.put(tenantId, new ConcurrentHashMap<>());
        growthOpportunities.put(tenantId, new ConcurrentHashMap<>());

        qualificationJobs.put(tenantId, new ConcurrentHashMap<>());
        qualificationQuestions.put(tenantId, new ConcurrentHashMap<>());
        qualificationReviewDecisions.put(tenantId, new ConcurrentHashMap<>());
        scoringRules.put(tenantId, new ConcurrentHashMap<>());
        routingRules.put(tenantId, new ConcurrentHashMap<>());

        conversations.put(tenantId, new ConcurrentHashMap<>());
        supportHandoffs.put(tenantId, new ConcurrentHashMap<>());

        followUpRules.put(tenantId, new ConcurrentHashMap<>());
        followUpCampaigns.put(tenantId, new ConcurrentHashMap<>());
        followUpTasks.put(tenantId, new ConcurrentHashMap<>());
        followUpApprovals.put(tenantId, new ConcurrentHashMap<>());
        contactPreferences.put(tenantId, new ConcurrentHashMap<>());
        optOuts.put(tenantId, new ConcurrentHashMap<>());
        followUpMessages.put(tenantId, new ConcurrentHashMap<>());

        services.put(tenantId, new ConcurrentHashMap<>());
        opportunities.put(tenantId, new ConcurrentHashMap<>());
        proposals.put(tenantId, new ConcurrentHashMap<>());
        targets.put(tenantId, new ConcurrentHashMap<>());
        teamAssignments.put(tenantId, new ConcurrentHashMap<>());
        discoverySessions.put(tenantId, new ConcurrentHashMap<>());
        requirements.put(tenantId, new ConcurrentHashMap<>());
        meetings.put(tenantId, new ConcurrentHashMap<>());
        tasks.put(tenantId, new ConcurrentHashMap<>());
        pricingRequests.put(tenantId, new ConcurrentHashMap<>());
        contracts.put(tenantId, new ConcurrentHashMap<>());
        invoices.put(tenantId, new ConcurrentHashMap<>());
        engagementHandoffs.put(tenantId, new ConcurrentHashMap<>());
        tickets.put(tenantId, new ConcurrentHashMap<>());
        deliverableRequests.put(tenantId, new ConcurrentHashMap<>());
        billingEnquiries.put(tenantId, new ConcurrentHashMap<>());
        slaPolicies.put(tenantId, new ConcurrentHashMap<>());
        knowledgeArticles.put(tenantId, new ConcurrentHashMap<>());
        feedbacks.put(tenantId, new ConcurrentHashMap<>());
        complaints.put(tenantId, new ConcurrentHashMap<>());
        escalations.put(tenantId, new ConcurrentHashMap<>());
        activityLogs.put(tenantId, Collections.synchronizedList(new ArrayList<>()));
        teamMembers.put(tenantId, Collections.synchronizedList(new ArrayList<>()));

        // Seed Team Members
        List<Map<String, Object>> tmList = teamMembers.get(tenantId);
        Map<String, Object> u1 = new LinkedHashMap<>();
        u1.put("userId", "USR-MGR-001");
        u1.put("name", "Deepak Sharma");
        u1.put("email", "deepak.sharma@zenelaitconsulting.com");
        u1.put("role", "SALES_MANAGER");
        u1.put("tenantId", tenantId);
        tmList.add(u1);

        Map<String, Object> u2 = new LinkedHashMap<>();
        u2.put("userId", "USR-EXEC-101");
        u2.put("name", "Consulting Sales Executive");
        u2.put("email", "priya.nair@zenelaitconsulting.com");
        u2.put("role", "SALES_EXECUTIVE");
        u2.put("assignedLeads", 25);
        u2.put("qualifiedLeads", 14);
        u2.put("openOpportunities", 8);
        u2.put("closedWonValue", 650000.0);
        u2.put("targetAchievementPercent", 65.0);
        u2.put("tenantId", tenantId);
        tmList.add(u2);

        Map<String, Object> u3 = new LinkedHashMap<>();
        u3.put("userId", "USR-SUPPORT-101");
        u3.put("name", "Ananya Verma");
        u3.put("email", "ananya.verma@zenelaitconsulting.com");
        u3.put("role", "CUSTOMER_SUPPORT");
        u3.put("tenantId", tenantId);
        tmList.add(u3);

        Map<String, Object> u4 = new LinkedHashMap<>();
        u4.put("userId", "USER-RM-101");
        u4.put("name", "Kavita Rao");
        u4.put("email", "kavita.rao@zenelaitconsulting.com");
        u4.put("role", "RELATIONSHIP_MANAGER");
        u4.put("tenantId", tenantId);
        tmList.add(u4);

        Map<String, Object> u5 = new LinkedHashMap<>();
        u5.put("userId", "USER-SE-201");
        u5.put("name", "Rahul Sen");
        u5.put("email", "rahul.sen@zenelaitconsulting.com");
        u5.put("role", "SALES_EXECUTIVE");
        u5.put("tenantId", tenantId);
        tmList.add(u5);

        // Seed Services
        Map<String, Object> s1 = new LinkedHashMap<>();
        s1.put("serviceId", "CSVC-1001");
        s1.put("name", "Digital Transformation Consulting");
        s1.put("code", "DIGITAL_TRANSFORMATION");
        s1.put("category", "DIGITAL_TRANSFORMATION");
        s1.put("standardRate", 60000.0);
        s1.put("rateUnit", "DAY");
        s1.put("currency", "INR");
        s1.put("description", "Consulting engagement to assess and modernize business processes.");
        s1.put("status", "ACTIVE");
        services.get(tenantId).put("CSVC-1001", s1);

        Map<String, Object> s2 = new LinkedHashMap<>();
        s2.put("serviceId", "CSVC-1002");
        s2.put("name", "IT Strategy & Enterprise Cloud Architecture");
        s2.put("code", "IT_STRATEGY");
        s2.put("category", "IT_CONSULTING");
        s2.put("standardRate", 75000.0);
        s2.put("rateUnit", "DAY");
        s2.put("currency", "INR");
        s2.put("description", "Roadmap planning, microservices, and hybrid cloud migrations.");
        s2.put("status", "ACTIVE");
        services.get(tenantId).put("CSVC-1002", s2);

        // Seed Clients & Contacts
        Map<String, Object> cli1 = new LinkedHashMap<>();
        cli1.put("clientId", "CLI-1001");
        cli1.put("companyName", "Example Manufacturing Ltd");
        cli1.put("industry", "MANUFACTURING");
        cli1.put("website", "https://examplemfg.com");
        cli1.put("status", "ACTIVE");
        cli1.put("createdAt", "2026-10-28T09:00:00+05:30");
        clients.get(tenantId).put("CLI-1001", cli1);
        clients.get(tenantId).put("CLIENT-1001", cli1); // alias

        Map<String, Object> cont1 = new LinkedHashMap<>();
        cont1.put("contactId", "CONT-1001");
        cont1.put("clientId", "CLI-1001");
        cont1.put("name", "Arun Kumar");
        cont1.put("title", "Chief Technology Officer");
        cont1.put("email", "arun@example.com");
        cont1.put("phone", "+91-9000000000");
        cont1.put("isPrimary", true);
        contacts.get(tenantId).put("CONT-1001", cont1);
        contacts.get(tenantId).put("CONTACT-101", cont1); // alias

        // Seed Relationship Manager Account ACC-1001
        Map<String, Object> acc1 = new LinkedHashMap<>();
        acc1.put("accountId", "ACC-1001");
        acc1.put("companyName", "Example Consulting Client");
        acc1.put("industry", "Financial Services");
        acc1.put("relationshipOwner", "current-user");
        acc1.put("accountStatus", "ACTIVE");
        acc1.put("healthStatus", "AT_RISK");
        acc1.put("activeEngagements", 2);
        acc1.put("activeEngagementCount", 2);
        acc1.put("openComplaintCount", 1);
        acc1.put("nextReviewDate", "2026-11-05");
        acc1.put("renewalDate", "2027-01-31");
        acc1.put("primaryContact", Map.of(
                "name", "Example Contact",
                "email", "contact@example.com"
        ));
        acc1.put("createdAt", "2026-10-29T09:00:00+05:30");
        accounts.get(tenantId).put("ACC-1001", acc1);

        // Seed Relationship Risk RSK-4001
        Map<String, Object> rsk1 = new LinkedHashMap<>();
        rsk1.put("riskId", "RSK-4001");
        rsk1.put("accountId", "ACC-1001");
        rsk1.put("riskCategory", "CLIENT_SATISFACTION");
        rsk1.put("title", "Client concerned about delivery communication");
        rsk1.put("description", "Client has requested more frequent delivery status updates.");
        rsk1.put("severity", "MEDIUM");
        rsk1.put("status", "OPEN");
        rsk1.put("ownerId", "USER-RM-101");
        rsk1.put("dueDate", "2026-11-02");
        risks.get(tenantId).put("RSK-4001", rsk1);

        // Seed Lead CLD-1001 / LEAD-1001
        Map<String, Object> l1 = new LinkedHashMap<>();
        l1.put("leadId", "CLD-1001");
        l1.put("companyName", "Example Manufacturing Ltd");
        l1.put("contactName", "Arun Kumar");
        l1.put("email", "arun@example.com");
        l1.put("phone", "+91-9000000000");
        l1.put("industry", "MANUFACTURING");
        l1.put("serviceInterest", "DIGITAL_TRANSFORMATION");
        l1.put("source", "WEBSITE");
        l1.put("description", "Looking for consulting services to modernize internal business processes.");
        l1.put("status", "ASSIGNED");
        l1.put("assignedTo", "USR-EXEC-101");
        l1.put("assigneeId", "USR-EXEC-101");
        l1.put("nextFollowUpDate", "2026-10-30");
        l1.put("createdAt", "2026-10-29T09:00:00+05:30");
        l1.put("activities", new ArrayList<Map<String, Object>>());
        leads.get(tenantId).put("CLD-1001", l1);
        leads.get(tenantId).put("LEAD-1001", l1); // alias

        // Seed Discovery Session DISC-1001 & Requirement REQ-1001
        Map<String, Object> disc1 = new LinkedHashMap<>();
        disc1.put("sessionId", "DISC-1001");
        disc1.put("leadId", "CLD-1001");
        disc1.put("clientId", "CLI-1001");
        disc1.put("meetingType", "BUSINESS_DISCOVERY");
        disc1.put("status", "SCHEDULE_REQUESTED");
        disc1.put("scheduledAt", "2026-10-30T10:00:00+05:30");
        disc1.put("objective", "Understand business challenges and consulting requirements.");
        disc1.put("notes", "Client reported bottlenecks in batch ERP synchronization.");
        discoverySessions.get(tenantId).put("DISC-1001", disc1);

        Map<String, Object> req1 = new LinkedHashMap<>();
        req1.put("requirementId", "REQ-1001");
        req1.put("discoverySessionId", "DISC-1001");
        req1.put("businessChallenge", "Manual processes cause reporting delays.");
        req1.put("desiredOutcomes", new ArrayList<>(List.of("Reduce reporting time", "Improve process visibility")));
        req1.put("currentSystems", new ArrayList<>(List.of("Legacy ERP", "Spreadsheet-based reporting")));
        Map<String, Object> bRange = new LinkedHashMap<>();
        bRange.put("minimum", 500000.0);
        bRange.put("maximum", 1500000.0);
        bRange.put("currency", "INR");
        req1.put("budgetRange", bRange);
        req1.put("targetCompletionDate", "2027-03-31");
        req1.put("status", "DRAFT");
        req1.put("missingInformation", new ArrayList<>(List.of("Required delivery approach", "Client-approved project scope")));
        requirements.get(tenantId).put("REQ-1001", req1);

        // Seed Opportunity OPP-2001
        Map<String, Object> opp1 = new LinkedHashMap<>();
        opp1.put("opportunityId", "OPP-2001");
        opp1.put("leadId", "CLD-1001");
        opp1.put("companyName", "Example Manufacturing Ltd");
        opp1.put("opportunityName", "Digital Transformation Consulting");
        opp1.put("serviceId", "CSVC-1001");
        opp1.put("service", "DIGITAL_TRANSFORMATION");
        opp1.put("stage", "PROPOSAL");
        opp1.put("estimatedValue", 1200000.0);
        opp1.put("currency", "INR");
        opp1.put("probability", 60);
        opp1.put("expectedCloseDate", "2026-11-30");
        opp1.put("ownerId", "USR-EXEC-101");
        opp1.put("requirementId", "REQ-1001");
        opp1.put("description", "Consulting engagement to assess and modernize business processes.");
        opp1.put("history", new ArrayList<>(List.of(
                new LinkedHashMap<>(Map.of("stage", "QUALIFICATION", "timestamp", "2026-10-29T09:15:00+05:30", "actor", "USR-EXEC-101")),
                new LinkedHashMap<>(Map.of("stage", "PROPOSAL", "timestamp", "2026-10-29T09:30:00+05:30", "actor", "USR-EXEC-101"))
        )));
        opportunities.get(tenantId).put("OPP-2001", opp1);

        // Seed Proposal PROP-4001 / PROP-1001
        Map<String, Object> prop1 = new LinkedHashMap<>();
        prop1.put("proposalId", "PROP-4001");
        prop1.put("opportunityId", "OPP-2001");
        prop1.put("clientName", "Example Manufacturing Ltd");
        prop1.put("proposalTitle", "Business Process Modernization Proposal");
        prop1.put("serviceId", "CSVC-1001");
        prop1.put("scopeSummary", "Assess existing processes and recommend a phased modernization plan.");
        prop1.put("deliverables", new ArrayList<>(List.of("Current-state assessment", "Gap analysis", "Target-state recommendations", "Implementation roadmap")));
        prop1.put("assumptions", new ArrayList<>(List.of("The client will provide access to relevant stakeholders.")));
        prop1.put("exclusions", new ArrayList<>(List.of("Software licensing costs", "Implementation work not explicitly included in the final scope")));
        prop1.put("milestones", new ArrayList<>(List.of(
                new LinkedHashMap<>(Map.of("name", "Phase 1: Inception & Assessment", "dueDate", "2026-12-15", "amount", 400000.0)),
                new LinkedHashMap<>(Map.of("name", "Phase 2: Modernization Architecture", "dueDate", "2027-01-31", "amount", 500000.0)),
                new LinkedHashMap<>(Map.of("name", "Phase 3: Rollout Roadmap & Handover", "dueDate", "2027-02-28", "amount", 300000.0))
        )));
        prop1.put("proposalValue", 1200000.0);
        prop1.put("currency", "INR");
        prop1.put("pricingStatus", "CALCULATED");
        prop1.put("approvalStatus", "PENDING_APPROVAL");
        prop1.put("status", "PENDING_APPROVAL");
        prop1.put("requestedAt", "2026-10-29T10:00:00+05:30");
        proposals.get(tenantId).put("PROP-4001", prop1);
        proposals.get(tenantId).put("PROP-1001", prop1); // alias

        // Seed Sales Target TGT-3001
        Map<String, Object> tgt1 = new LinkedHashMap<>();
        tgt1.put("targetId", "TGT-3001");
        tgt1.put("targetName", "November Consulting Sales");
        tgt1.put("periodType", "MONTHLY");
        tgt1.put("periodStart", "2026-11-01");
        tgt1.put("periodEnd", "2026-11-30");
        tgt1.put("targetType", "CLOSED_WON_VALUE");
        tgt1.put("targetValue", 2500000.0);
        tgt1.put("currency", "INR");
        tgt1.put("teamId", "TEAM-CONSULTING-01");
        tgt1.put("status", "ACTIVE");
        targets.get(tenantId).put("TGT-3001", tgt1);

        // Seed Contract CON-5001
        Map<String, Object> con1 = new LinkedHashMap<>();
        con1.put("contractId", "CON-5001");
        con1.put("opportunityId", "OPP-2001");
        con1.put("clientId", "CLI-1001");
        con1.put("contractName", "Master Consulting Services Agreement");
        con1.put("status", "SIGNED");
        con1.put("currency", "INR");
        con1.put("totalValue", 1200000.0);
        con1.put("signedDate", "2026-10-28");
        con1.put("terms", "Net 30 days payment on milestone deliverables.");
        contracts.get(tenantId).put("CON-5001", con1);

        // Seed Engagement ENG-2001 / ENG-1001
        Map<String, Object> eng1 = new LinkedHashMap<>();
        eng1.put("engagementId", "ENG-2001");
        eng1.put("contractId", "CON-5001");
        eng1.put("clientId", "CLI-1001");
        eng1.put("name", "Business Process Modernization Engagement");
        eng1.put("status", "IN_PROGRESS");
        eng1.put("statusSource", "PROJECT_MANAGEMENT_SYSTEM");
        eng1.put("lastUpdatedAt", "2026-10-29T10:00:00+05:30");
        eng1.put("clientVisibleSummary", "The engagement is in progress.");
        eng1.put("milestones", new ArrayList<>(List.of(
                new LinkedHashMap<>(Map.of("milestoneId", "MIL-1001", "name", "Discovery and assessment", "status", "COMPLETED", "clientVisible", true)),
                new LinkedHashMap<>(Map.of("milestoneId", "MIL-1002", "name", "Recommendations", "status", "IN_PROGRESS", "clientVisible", true)),
                new LinkedHashMap<>(Map.of("milestoneId", "MIL-1003", "name", "Internal architectural audit", "status", "IN_PROGRESS", "clientVisible", false))
        )));
        eng1.put("deliverables", new ArrayList<>(List.of(
                new LinkedHashMap<>(Map.of("deliverableId", "DELIV-01", "title", "As-Is Architecture Blueprint", "status", "DELIVERED", "isConfidential", false)),
                new LinkedHashMap<>(Map.of("deliverableId", "DELIV-02", "title", "Modernization Strategy Report", "status", "DRAFTING", "isConfidential", false))
        )));
        // Aliased as ENG-1001
        Map<String, Object> eng2 = new LinkedHashMap<>(eng1);
        eng2.put("engagementId", "ENG-1001");

        // Seed Invoice INV-3001
        Map<String, Object> inv1 = new LinkedHashMap<>();
        inv1.put("invoiceId", "INV-3001");
        inv1.put("contractId", "CON-5001");
        inv1.put("clientId", "CLI-1001");
        inv1.put("status", "ISSUED");
        inv1.put("currency", "INR");
        inv1.put("amount", 250000.0);
        inv1.put("dueDate", "2026-11-15");
        inv1.put("source", "BILLING_SYSTEM");
        invoices.get(tenantId).put("INV-3001", inv1);

        // Seed Engagement Handoff HOF-6001
        Map<String, Object> hof1 = new LinkedHashMap<>();
        hof1.put("handoffId", "HOF-6001");
        hof1.put("opportunityId", "OPP-2001");
        hof1.put("contractId", "CON-5001");
        hof1.put("receivingTeamId", "TEAM-DELIVERY-01");
        hof1.put("handoffSummary", "Client has accepted the consulting proposal and the engagement is ready for delivery planning.");
        hof1.put("status", "PENDING_ACCEPTANCE");
        hof1.put("createdAt", "2026-10-29T10:30:00+05:30");
        engagementHandoffs.get(tenantId).put("HOF-6001", hof1);

        // Seed Support Ticket TKT-7001 / TKT-1001
        Map<String, Object> tkt1 = new LinkedHashMap<>();
        tkt1.put("ticketId", "TKT-7001");
        tkt1.put("clientId", "CLI-1001");
        tkt1.put("engagementId", "ENG-2001");
        tkt1.put("category", "PROJECT_STATUS");
        tkt1.put("subject", "Request for project progress update");
        tkt1.put("description", "The client would like an update on the current engagement status.");
        tkt1.put("priority", "MEDIUM");
        tkt1.put("status", "OPEN");
        tkt1.put("assignedTeam", "CUSTOMER_SUPPORT");
        tkt1.put("assignedUserId", null);
        tkt1.put("slaStatus", "WITHIN_TARGET");
        tkt1.put("source", "EMAIL");
        tkt1.put("createdAt", "2026-10-29T11:30:00+05:30");
        tkt1.put("messages", new ArrayList<>(List.of(
                new LinkedHashMap<>(Map.of("messageId", "MSG-01", "sender", "Arun Kumar", "role", "CLIENT", "message", "Can you provide an update on our project?", "timestamp", "2026-10-29T11:30:00+05:30"))
        )));
        tkt1.put("internalNotes", new ArrayList<>(List.of(
                new LinkedHashMap<>(Map.of("noteId", "NOTE-01", "author", "USR-SUPPORT-101", "text", "Client contacted regarding Milestone 2 status.", "timestamp", "2026-10-29T11:32:00+05:30"))
        )));
        tickets.get(tenantId).put("TKT-7001", tkt1);
        tickets.get(tenantId).put("TKT-1001", tkt1); // alias

        // Seed Support Conversation CONV-1001
        Map<String, Object> conv1 = new LinkedHashMap<>();
        conv1.put("conversationId", "CONV-1001");
        conv1.put("clientId", "CLIENT-1001");
        conv1.put("channel", "WEB_CHAT");
        conv1.put("status", "OPEN");
        conv1.put("assignedAgent", "AI_SUPPORT_AGENT");
        conv1.put("subject", "Cloud migration project status");
        conv1.put("createdAt", "2026-10-29T10:00:00+05:30");
        conversations.get(tenantId).put("CONV-1001", conv1);

        // Seed Lead Qualification Job LQ-JOB-1001 & Questions
        Map<String, Object> lqJob1 = new LinkedHashMap<>();
        lqJob1.put("jobId", "LQ-JOB-1001");
        lqJob1.put("leadId", "LEAD-1001");
        lqJob1.put("status", "COMPLETED");
        lqJob1.put("submittedAt", "2026-10-29T10:00:00+05:30");
        lqJob1.put("completedAt", "2026-10-29T10:00:08+05:30");
        lqJob1.put("qualification", Map.of(
                "score", 82,
                "recommendation", "PRIORITIZE_FOR_SALES_REVIEW",
                "serviceFit", "HIGH",
                "informationCompleteness", "MEDIUM",
                "requiresHumanReview", true
        ));
        qualificationJobs.get(tenantId).put("LQ-JOB-1001", lqJob1);

        // Seed SLA Policy SLA-1001
        Map<String, Object> sla1 = new LinkedHashMap<>();
        sla1.put("policyId", "SLA-1001");
        sla1.put("name", "Standard Consulting Support SLA");
        sla1.put("firstResponseTargetHours", 4);
        sla1.put("resolutionTargetHours", 24);
        sla1.put("businessHoursOnly", true);
        slaPolicies.get(tenantId).put("SLA-1001", sla1);

        // Seed Knowledge Base Articles
        Map<String, Object> kb1 = new LinkedHashMap<>();
        kb1.put("articleId", "KB-101");
        kb1.put("title", "Consulting Milestone Delivery Lifecycle");
        kb1.put("category", "PROJECT_DELIVERY");
        kb1.put("content", "Deliverable sign-off requires client sponsor review within 5 business days of submission.");
        kb1.put("status", "APPROVED");
        knowledgeArticles.get(tenantId).put("KB-101", kb1);
        knowledgeArticles.get(tenantId).put("KB-1001", Map.of(
                "articleId", "KB-1001",
                "title", "Customer Support Escalation Policy",
                "category", "SUPPORT_POLICY",
                "published", true,
                "relevanceScore", 0.94
        ));

        // Seed Follow-up Task FU-1001 / FU-1002
        Map<String, Object> fu1 = new LinkedHashMap<>();
        fu1.put("taskId", "FU-1001");
        fu1.put("proposalId", "PROP-1001");
        fu1.put("relatedRecordType", "PROPOSAL");
        fu1.put("relatedRecordId", "PROP-1001");
        fu1.put("followUpType", "PROPOSAL_STATUS_CHECK");
        fu1.put("status", "DRAFT");
        fu1.put("actionMode", "DRAFT_FOR_APPROVAL");
        fu1.put("scheduledAt", "2026-11-02T10:00:00+05:30");
        followUpTasks.get(tenantId).put("FU-1001", fu1);

        Map<String, Object> fu2 = new LinkedHashMap<>(fu1);
        fu2.put("taskId", "FU-1002");
        fu2.put("status", "SCHEDULED");
        fu2.put("channel", "EMAIL");
        followUpTasks.get(tenantId).put("FU-1002", fu2);

        // Seed Activity Log
        Map<String, Object> act1 = new LinkedHashMap<>();
        act1.put("activityId", "ACT-001");
        act1.put("actorId", "USR-EXEC-101");
        act1.put("action", "PROPOSAL_CREATED");
        act1.put("details", "Created proposal PROP-4001 for OPP-2001");
        act1.put("timestamp", "2026-10-29T10:00:00+05:30");
        activityLogs.get(tenantId).add(act1);
    }

    private void ensureTenant(String tenantId) {
        if (!leads.containsKey(tenantId)) {
            seedTenant(tenantId);
        }
    }

    // Tenant-isolated getters
    public Map<String, Map<String, Object>> getLeads(String tenantId) {
        ensureTenant(tenantId);
        return leads.get(tenantId);
    }

    public Map<String, Map<String, Object>> getClients(String tenantId) {
        ensureTenant(tenantId);
        return clients.get(tenantId);
    }

    public Map<String, Map<String, Object>> getContacts(String tenantId) {
        ensureTenant(tenantId);
        return contacts.get(tenantId);
    }

    public Map<String, Map<String, Object>> getAccounts(String tenantId) {
        ensureTenant(tenantId);
        return accounts.get(tenantId);
    }

    public Map<String, Map<String, Object>> getHealthAssessments(String tenantId) {
        ensureTenant(tenantId);
        return healthAssessments.get(tenantId);
    }

    public Map<String, Map<String, Object>> getRisks(String tenantId) {
        ensureTenant(tenantId);
        return risks.get(tenantId);
    }

    public Map<String, Map<String, Object>> getStakeholders(String tenantId) {
        ensureTenant(tenantId);
        return stakeholders.get(tenantId);
    }

    public Map<String, Map<String, Object>> getReviewMeetings(String tenantId) {
        ensureTenant(tenantId);
        return reviewMeetings.get(tenantId);
    }

    public Map<String, Map<String, Object>> getSatisfactionSurveys(String tenantId) {
        ensureTenant(tenantId);
        return satisfactionSurveys.get(tenantId);
    }

    public Map<String, Map<String, Object>> getRenewals(String tenantId) {
        ensureTenant(tenantId);
        return renewals.get(tenantId);
    }

    public Map<String, Map<String, Object>> getGrowthOpportunities(String tenantId) {
        ensureTenant(tenantId);
        return growthOpportunities.get(tenantId);
    }

    public Map<String, Map<String, Object>> getQualificationJobs(String tenantId) {
        ensureTenant(tenantId);
        return qualificationJobs.get(tenantId);
    }

    public Map<String, Map<String, Object>> getQualificationQuestions(String tenantId) {
        ensureTenant(tenantId);
        return qualificationQuestions.get(tenantId);
    }

    public Map<String, Map<String, Object>> getQualificationReviewDecisions(String tenantId) {
        ensureTenant(tenantId);
        return qualificationReviewDecisions.get(tenantId);
    }

    public Map<String, Map<String, Object>> getScoringRules(String tenantId) {
        ensureTenant(tenantId);
        return scoringRules.get(tenantId);
    }

    public Map<String, Map<String, Object>> getRoutingRules(String tenantId) {
        ensureTenant(tenantId);
        return routingRules.get(tenantId);
    }

    public Map<String, Map<String, Object>> getConversations(String tenantId) {
        ensureTenant(tenantId);
        return conversations.get(tenantId);
    }

    public Map<String, Map<String, Object>> getSupportHandoffs(String tenantId) {
        ensureTenant(tenantId);
        return supportHandoffs.get(tenantId);
    }

    public Map<String, Map<String, Object>> getFollowUpRules(String tenantId) {
        ensureTenant(tenantId);
        return followUpRules.get(tenantId);
    }

    public Map<String, Map<String, Object>> getFollowUpCampaigns(String tenantId) {
        ensureTenant(tenantId);
        return followUpCampaigns.get(tenantId);
    }

    public Map<String, Map<String, Object>> getFollowUpTasks(String tenantId) {
        ensureTenant(tenantId);
        return followUpTasks.get(tenantId);
    }

    public Map<String, Map<String, Object>> getFollowUpApprovals(String tenantId) {
        ensureTenant(tenantId);
        return followUpApprovals.get(tenantId);
    }

    public Map<String, Map<String, Object>> getContactPreferences(String tenantId) {
        ensureTenant(tenantId);
        return contactPreferences.get(tenantId);
    }

    public Map<String, Map<String, Object>> getOptOuts(String tenantId) {
        ensureTenant(tenantId);
        return optOuts.get(tenantId);
    }

    public Map<String, Map<String, Object>> getFollowUpMessages(String tenantId) {
        ensureTenant(tenantId);
        return followUpMessages.get(tenantId);
    }

    public Map<String, Map<String, Object>> getServices(String tenantId) {
        ensureTenant(tenantId);
        return services.get(tenantId);
    }

    public Map<String, Map<String, Object>> getOpportunities(String tenantId) {
        ensureTenant(tenantId);
        return opportunities.get(tenantId);
    }

    public Map<String, Map<String, Object>> getProposals(String tenantId) {
        ensureTenant(tenantId);
        return proposals.get(tenantId);
    }

    public Map<String, Map<String, Object>> getTargets(String tenantId) {
        ensureTenant(tenantId);
        return targets.get(tenantId);
    }

    public Map<String, Map<String, Object>> getTeamAssignments(String tenantId) {
        ensureTenant(tenantId);
        return teamAssignments.get(tenantId);
    }

    public Map<String, Map<String, Object>> getDiscoverySessions(String tenantId) {
        ensureTenant(tenantId);
        return discoverySessions.get(tenantId);
    }

    public Map<String, Map<String, Object>> getRequirements(String tenantId) {
        ensureTenant(tenantId);
        return requirements.get(tenantId);
    }

    public Map<String, Map<String, Object>> getMeetings(String tenantId) {
        ensureTenant(tenantId);
        return meetings.get(tenantId);
    }

    public Map<String, Map<String, Object>> getTasks(String tenantId) {
        ensureTenant(tenantId);
        return tasks.get(tenantId);
    }

    public Map<String, Map<String, Object>> getPricingRequests(String tenantId) {
        ensureTenant(tenantId);
        return pricingRequests.get(tenantId);
    }

    public Map<String, Map<String, Object>> getContracts(String tenantId) {
        ensureTenant(tenantId);
        return contracts.get(tenantId);
    }

    public Map<String, Map<String, Object>> getInvoices(String tenantId) {
        ensureTenant(tenantId);
        return invoices.get(tenantId);
    }

    public Map<String, Map<String, Object>> getEngagementHandoffs(String tenantId) {
        ensureTenant(tenantId);
        return engagementHandoffs.get(tenantId);
    }

    public Map<String, Map<String, Object>> getTickets(String tenantId) {
        ensureTenant(tenantId);
        return tickets.get(tenantId);
    }

    public Map<String, Map<String, Object>> getDeliverableRequests(String tenantId) {
        ensureTenant(tenantId);
        return deliverableRequests.get(tenantId);
    }

    public Map<String, Map<String, Object>> getBillingEnquiries(String tenantId) {
        ensureTenant(tenantId);
        return billingEnquiries.get(tenantId);
    }

    public Map<String, Map<String, Object>> getSlaPolicies(String tenantId) {
        ensureTenant(tenantId);
        return slaPolicies.get(tenantId);
    }

    public Map<String, Map<String, Object>> getKnowledgeArticles(String tenantId) {
        ensureTenant(tenantId);
        return knowledgeArticles.get(tenantId);
    }

    public Map<String, Map<String, Object>> getFeedbacks(String tenantId) {
        ensureTenant(tenantId);
        return feedbacks.get(tenantId);
    }

    public Map<String, Map<String, Object>> getComplaints(String tenantId) {
        ensureTenant(tenantId);
        return complaints.get(tenantId);
    }

    public Map<String, Map<String, Object>> getEscalations(String tenantId) {
        ensureTenant(tenantId);
        return escalations.get(tenantId);
    }

    public List<Map<String, Object>> getActivityLogs(String tenantId) {
        ensureTenant(tenantId);
        return activityLogs.get(tenantId);
    }

    public List<Map<String, Object>> getTeamMembers(String tenantId) {
        ensureTenant(tenantId);
        return teamMembers.get(tenantId);
    }

    public void addActivity(String tenantId, String actorId, String action, String details) {
        ensureTenant(tenantId);
        Map<String, Object> log = new LinkedHashMap<>();
        log.put("activityId", "ACT-" + UUID.randomUUID().toString().substring(0, 8));
        log.put("actorId", actorId != null ? actorId : "SYSTEM");
        log.put("action", action);
        log.put("details", details);
        log.put("timestamp", Instant.now().toString());
        activityLogs.get(tenantId).add(0, log);
    }
}
