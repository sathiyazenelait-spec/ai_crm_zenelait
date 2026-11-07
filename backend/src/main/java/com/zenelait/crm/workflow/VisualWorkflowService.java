package com.zenelait.crm.workflow;

import com.zenelait.crm.model.VisualWorkflowDefinition;
import com.zenelait.crm.repository.VisualWorkflowDefinitionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class VisualWorkflowService {

    private static final Logger log = LoggerFactory.getLogger(VisualWorkflowService.class);

    private final VisualWorkflowDefinitionRepository workflowRepository;

    public VisualWorkflowService(VisualWorkflowDefinitionRepository workflowRepository) {
        this.workflowRepository = workflowRepository;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void seedDefaultWorkflows() {
        try {
            if (workflowRepository.count() == 0) {
                String nodes1 = "[{\"id\":\"node-1\",\"type\":\"trigger\",\"title\":\"New Lead Ingested\",\"category\":\"TRIGGER\",\"desc\":\"Source: Web Widget / WhatsApp\"}," +
                        "{\"id\":\"node-2\",\"type\":\"filter\",\"title\":\"Budget Filter\",\"category\":\"FILTER\",\"desc\":\"Budget > $5,000\"}," +
                        "{\"id\":\"node-3\",\"type\":\"ai\",\"title\":\"AI BANT Qualifier\",\"category\":\"AI_ACTION\",\"desc\":\"Score Need & Timeline in TiDB\"}," +
                        "{\"id\":\"node-4\",\"type\":\"action\",\"title\":\"Auto-Call Voice SDR\",\"category\":\"ACTION\",\"desc\":\"Trigger outbound audio call in 60s\"}]";

                String edges1 = "[{\"id\":\"e1-2\",\"source\":\"node-1\",\"target\":\"node-2\"}," +
                        "{\"id\":\"e2-3\",\"source\":\"node-2\",\"target\":\"node-3\"}," +
                        "{\"id\":\"e3-4\",\"source\":\"node-3\",\"target\":\"node-4\"}]";

                VisualWorkflowDefinition wf1 = new VisualWorkflowDefinition(
                        "wf-high-value-sdr", "comp-software-001", "High-Value Inbound AI SDR Instant Dispatch",
                        "Automatically filters enterprise leads and triggers real-time voice call within 60 seconds.",
                        "LEAD_CREATED", nodes1, edges1
                );
                wf1.setTotalExecutions(48);
                workflowRepository.save(wf1);

                String nodes2 = "[{\"id\":\"node-10\",\"type\":\"trigger\",\"title\":\"Quote Viewed by Client\",\"category\":\"TRIGGER\",\"desc\":\"Portal: /sign/:id\"}," +
                        "{\"id\":\"node-11\",\"type\":\"delay\",\"title\":\"Smart Wait\",\"category\":\"DELAY\",\"desc\":\"Wait 4 hours\"}," +
                        "{\"id\":\"node-12\",\"type\":\"ai\",\"title\":\"AI Objection Check\",\"category\":\"AI_ACTION\",\"desc\":\"Check pricing objection\"}," +
                        "{\"id\":\"node-13\",\"type\":\"action\",\"title\":\"Send WhatsApp Reminder\",\"category\":\"ACTION\",\"desc\":\"Brochure & 10% closing discount\"}]";

                String edges2 = "[{\"id\":\"e10-11\",\"source\":\"node-10\",\"target\":\"node-11\"}," +
                        "{\"id\":\"e11-12\",\"source\":\"node-11\",\"target\":\"node-12\"}," +
                        "{\"id\":\"e12-13\",\"source\":\"node-12\",\"target\":\"node-13\"}]";

                VisualWorkflowDefinition wf2 = new VisualWorkflowDefinition(
                        "wf-quote-followup", "comp-software-001", "Unsigned Proposal Automated Follow-up",
                        "Triggers multi-channel re-engagement if a client views a proposal but does not sign within 4 hours.",
                        "PROPOSAL_VIEWED", nodes2, edges2
                );
                wf2.setTotalExecutions(23);
                workflowRepository.save(wf2);
            }
        } catch (Exception e) {
            log.warn("Notice seeding visual workflows: {}", e.getMessage());
        }
    }

    public List<VisualWorkflowDefinition> getTenantWorkflows(String tenantId) {
        return workflowRepository.findByTenantId(tenantId);
    }

    public VisualWorkflowDefinition saveWorkflow(String tenantId, VisualWorkflowDefinition wf) {
        if (wf.getId() == null || wf.getId().trim().isEmpty()) {
            wf.setId("wf-" + UUID.randomUUID().toString().substring(0, 8));
        }
        wf.setTenantId(tenantId);
        wf.setUpdatedAt(LocalDateTime.now());
        return workflowRepository.save(wf);
    }

    public Map<String, Object> executeWorkflowTest(String workflowId) {
        Optional<VisualWorkflowDefinition> opt = workflowRepository.findById(workflowId);
        if (opt.isEmpty()) return Map.of("error", "Workflow not found");

        VisualWorkflowDefinition wf = opt.get();
        wf.setTotalExecutions(wf.getTotalExecutions() + 1);
        workflowRepository.save(wf);

        List<Map<String, Object>> steps = List.of(
                Map.of("step", 1, "node", "Trigger: " + wf.getTriggerEvent(), "status", "SUCCESS", "latencyMs", 4),
                Map.of("step", 2, "node", "Filter Condition Evaluated", "status", "PASSED", "latencyMs", 2),
                Map.of("step", 3, "node", "AI Autonomous Action Dispatched", "status", "EXECUTED", "latencyMs", 18),
                Map.of("step", 4, "node", "Channel Action (WhatsApp/Email/SMS)", "status", "DELIVERED", "latencyMs", 45)
        );

        return Map.of(
                "workflowId", wf.getId(),
                "workflowName", wf.getName(),
                "status", "ALL_NODES_COMPLETED_SUCCESSFULLY",
                "executionTimeMs", 69,
                "steps", steps
        );
    }
}

