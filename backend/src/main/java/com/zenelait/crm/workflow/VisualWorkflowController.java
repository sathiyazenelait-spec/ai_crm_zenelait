package com.zenelait.crm.workflow;

import com.zenelait.crm.model.VisualWorkflowDefinition;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/visual-workflows")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class VisualWorkflowController {

    private final VisualWorkflowService workflowService;

    public VisualWorkflowController(VisualWorkflowService workflowService) {
        this.workflowService = workflowService;
    }

    @GetMapping
    public ResponseEntity<List<VisualWorkflowDefinition>> getWorkflows(
            @RequestHeader(value = "X-Tenant-Id", defaultValue = "comp-software-001") String tenantId) {
        return ResponseEntity.ok(workflowService.getTenantWorkflows(tenantId));
    }

    @PostMapping
    public ResponseEntity<VisualWorkflowDefinition> saveWorkflow(
            @RequestHeader(value = "X-Tenant-Id", defaultValue = "comp-software-001") String tenantId,
            @RequestBody VisualWorkflowDefinition workflow) {
        return ResponseEntity.ok(workflowService.saveWorkflow(tenantId, workflow));
    }

    @PostMapping("/{id}/test-run")
    public ResponseEntity<Map<String, Object>> testRunWorkflow(@PathVariable String id) {
        return ResponseEntity.ok(workflowService.executeWorkflowTest(id));
    }
}

