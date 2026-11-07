package com.zenelait.crm.email;

import com.zenelait.crm.model.Company;
import com.zenelait.crm.model.EmailCopilotLog;
import com.zenelait.crm.model.Lead;
import com.zenelait.crm.repository.EmailCopilotLogRepository;
import com.zenelait.crm.repository.LeadRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class ColdLeadReactivationService {

    private final LeadRepository leadRepository;
    private final EmailCopilotLogRepository emailLogRepository;

    public ColdLeadReactivationService(
            LeadRepository leadRepository,
            EmailCopilotLogRepository emailLogRepository
    ) {
        this.leadRepository = leadRepository;
        this.emailLogRepository = emailLogRepository;
    }

    /**
     * Automatic Cron: Scans TiDB Cloud every day at 9:00 AM
     */
    @Scheduled(cron = "0 0 9 * * ?")
    public void scheduledMorningScan() {
        System.out.println("⏰ [Autonomous Email Copilot] Running 9:00 AM scheduled cold lead scan...");
        runColdLeadReactivation("TEN-IT-001", false);
    }

    /**
     * Executes re-activation scan and generates context-aware emails
     */
    @Transactional
    public List<EmailCopilotLog> runColdLeadReactivation(String tenantId, boolean dryRun) {
        List<Lead> leads = leadRepository.findByTenantId(tenantId);
        List<EmailCopilotLog> generatedLogs = new ArrayList<>();

        for (Lead lead : leads) {
            // Re-activate leads that are in NEW or QUALIFIED state
            if ("NEW".equalsIgnoreCase(lead.getStage()) || "QUALIFIED".equalsIgnoreCase(lead.getStage())) {
                String logId = "EM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
                String recipientName = lead.getName() != null ? lead.getName() : "Team Leader";
                String comp = lead.getCompanyName() != null ? lead.getCompanyName() : "your team";
                String req = lead.getRequirement() != null ? lead.getRequirement() : "AI Automation Suite";

                String subject = "Following up regarding " + req + " for " + comp;
                String body = "Hi " + recipientName + ",\n\n" +
                        "I wanted to quickly check in regarding your interest in " + req + ".\n\n" +
                        "We recently deployed our Autonomous AI Employees on TiDB Cloud Serverless, which has helped similar teams at " + comp +
                        " achieve a 4x reduction in manual CRM workload and 60-second inbound lead response times.\n\n" +
                        "I would love to share a 10-minute executive walkthrough with you this week. Would tomorrow at 11:00 AM or 3:30 PM suit your calendar?\n\n" +
                        "Best regards,\n" +
                        "Alex Rivera\n" +
                        "Autonomous Sales Copilot | Zenelait AI CRM";

                Company company = lead.getTenant();
                EmailCopilotLog log = new EmailCopilotLog(
                        logId,
                        lead.getId(),
                        lead.getEmail() != null ? lead.getEmail() : "prospect@example.com",
                        recipientName,
                        subject,
                        body,
                        "GHOSTED_7_DAYS",
                        company
                );

                log.setSuggestedOffer("Complimentary 14-Day Autonomous SDR Sandbox");
                log.setStatus(dryRun ? "DRAFTED" : "AUTO_SENT");

                emailLogRepository.save(log);
                generatedLogs.add(log);

                // Update lead stage to indicate follow-up
                if (!dryRun) {
                    lead.setStage("FOLLOW_UP_SENT");
                    leadRepository.save(lead);
                }
            }
        }

        return generatedLogs;
    }

    /**
     * AI Reply Composer: Crafts tailored reply to an incoming customer email objection
     */
    public Map<String, Object> composeSmartReply(String recipientEmail, String customerMessage, String objectionType) {
        String subject;
        String draftedReply;
        String strategy;

        String lower = customerMessage.toLowerCase();
        if (lower.contains("expensive") || lower.contains("budget") || lower.contains("price") || "PRICE".equalsIgnoreCase(objectionType)) {
            strategy = "Value-based ROI justification with flexible monthly milestone billing";
            subject = "Flexible Deployment & ROI Framework for your Team";
            draftedReply = "Hi there,\n\n" +
                    "Thank you for sharing your feedback on pricing. We understand budget allocation is paramount.\n\n" +
                    "To ensure zero risk, we can structure your rollout under our Growth tier with monthly milestone billing, " +
                    "allowing your team to measure lead conversion ROI within the first 30 days before committing to annual contracts.\n\n" +
                    "Let's schedule a brief 10-minute discussion to review how this fits your quarterly numbers.\n\n" +
                    "Best regards,\nZenelait Sales Operations";
        } else if (lower.contains("competitor") || lower.contains("salesforce") || lower.contains("hubspot") || "COMPETITOR".equalsIgnoreCase(objectionType)) {
            strategy = "Autonomous AI Employee differentiation vs legacy manual CRMs";
            subject = "Why Modern Teams Choose Autonomous AI over Traditional CRMs";
            draftedReply = "Hi there,\n\n" +
                    "While legacy CRMs like Salesforce and HubSpot require manual data entry and human follow-up logging, " +
                    "Zenelait AI CRM comes with native autonomous AI employees who qualify leads over real-time voice, WhatsApp, " +
                    "and email 24/7—directly connected to TiDB Cloud Serverless.\n\n" +
                    "Would you like to test a 5-minute live side-by-side comparison?\n\n" +
                    "Best regards,\nZenelait Sales Operations";
        } else {
            strategy = "Consultative demo proposition and calendar link";
            subject = "Quick question regarding your workflow automation goals";
            draftedReply = "Hi there,\n\n" +
                    "Thanks for getting back to us! Based on your requirements, our autonomous workflows can automate " +
                    "your inbound lead intake and pipeline updates end-to-end.\n\n" +
                    "Would tomorrow at 11:00 AM work for a quick screen-share?\n\n" +
                    "Best regards,\nZenelait Sales Operations";
        }

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("recipientEmail", recipientEmail);
        res.put("detectedObjection", objectionType != null ? objectionType : "GENERAL_INQUIRY");
        res.put("recommendedStrategy", strategy);
        res.put("subject", subject);
        res.put("draftedReply", draftedReply);
        return res;
    }
}
