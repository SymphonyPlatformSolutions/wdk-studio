package com.symphony.devsol.web;

import com.fasterxml.jackson.databind.JsonNode;
import com.symphony.devsol.client.WdkClient;
import com.symphony.devsol.model.studio.Workflow;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequiredArgsConstructor
public class WebService {
    private final WdkClient wdk;
    record TokenResponse(String token) {}

    @GetMapping("/api/workflows")
    public JsonNode listWorkflows() {
        return wdk.listWorkflows();
    }

    @GetMapping("/api/read-workflow/{workflowId}")
    public JsonNode readWorkflow(@PathVariable String workflowId) {
        return wdk.readWorkflow(workflowId);
    }

    @GetMapping("/api/management-token")
    public TokenResponse getManagementToken() {
        return new TokenResponse(wdk.getManagementToken());
    }

    @GetMapping("/api/monitoring/{workflowId}/definitions")
    public JsonNode getWorkflowDefinition(@PathVariable String workflowId) {
        return wdk.getWorkflowDefinition(workflowId);
    }

    @GetMapping("/api/monitoring/{workflowId}/instances")
    public JsonNode listWorkflowInstances(@PathVariable String workflowId) {
        return wdk.listWorkflowInstances(workflowId);
    }

    @GetMapping("/api/monitoring/{workflowId}/instances/{instanceId}/activities")
    public JsonNode listInstanceActivities(@PathVariable String workflowId, @PathVariable String instanceId) {
        return wdk.listInstanceActivities(workflowId, instanceId);
    }

    @GetMapping("/api/monitoring/{workflowId}/instances/{instanceId}/variables")
    public JsonNode listInstanceVariables(@PathVariable String workflowId, @PathVariable String instanceId) {
        return wdk.listInstanceVariables(workflowId, instanceId);
    }

    @PostMapping("/api/management/workflow")
    public JsonNode addWorkflow(@RequestBody Workflow workflow) {
        return wdk.addWorkflow(workflow);
    }

    @PutMapping("/api/management/workflow")
    public JsonNode editWorkflow(@RequestBody Workflow workflow) {
        return wdk.editWorkflow(workflow);
    }

    @DeleteMapping("/api/management/workflow/{workflowId}")
    public void deleteWorkflow(@PathVariable String workflowId) {
        wdk.deleteWorkflow(workflowId);
    }

    @PostMapping("/api/execute/{workflow}")
    public JsonNode executeRequest(
        @PathVariable String workflow,
        @RequestBody JsonNode body,
        @RequestHeader("X-Workflow-Token") String token
    ) {
        return wdk.executeRequest(workflow, body, token);
    }
}
