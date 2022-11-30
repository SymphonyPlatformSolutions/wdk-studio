package com.symphony.devsol;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.util.List;

@RestController
public class WdkClient {
    @Value("${wdk.studio.base-uri}")
    private String baseUri;
    @Value("${wdk.studio.monitoring-token}")
    private String token;
    private final RestTemplate restTemplate;

    public WdkClient(RestTemplateBuilder restTemplateBuilder) {
        this.restTemplate = restTemplateBuilder
            .additionalInterceptors((request, body, execution) -> {
                request.getHeaders().add("X-Monitoring-Token", token);
                return execution.execute(request, body);
            })
            .defaultHeader("Accept", MediaType.APPLICATION_JSON.toString())
            .build();
    }

    @GetMapping("/api/monitoring/{workflowId}/definitions")
    public JsonNode getWorkflowDefinition(@PathVariable String workflowId) {
        return restTemplate.getForObject(baseUri + "/workflows/" + workflowId + "/definitions", JsonNode.class);
    }

    @GetMapping("/api/monitoring/{workflowId}/instances")
    public JsonNode listWorkflowInstances(@PathVariable String workflowId) {
        return restTemplate.getForObject(baseUri + "/workflows/" + workflowId + "/instances", JsonNode.class);
    }

    @GetMapping("/api/monitoring/{workflowId}/instances/{instanceId}/activities")
    public JsonNode listInstanceActivities(@PathVariable String workflowId, @PathVariable String instanceId) {
        return restTemplate.getForObject(baseUri + "/workflows/" + workflowId + "/instances/" + instanceId + "/states", JsonNode.class);
    }

    @GetMapping("/api/monitoring/{workflowId}/instances/{instanceId}/variables")
    public JsonNode listInstanceVariables(@PathVariable String workflowId, @PathVariable String instanceId) {
        return restTemplate.getForObject(baseUri + "/workflows/" + workflowId + "/instances/" + instanceId + "/variables", JsonNode.class);
    }

    @PostMapping("/api/execute/{workflow}")
    public JsonNode executeRequest(
        @PathVariable String workflow,
        @RequestBody JsonNode body,
        @RequestHeader("X-Workflow-Token") String token
    ) {
        HttpHeaders headers = new HttpHeaders();
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));
        headers.set("X-Workflow-Token", token);
        HttpEntity<Object> request = new HttpEntity<>(body, headers);
        return restTemplate.postForObject(baseUri + "/workflows/"+ workflow + "/execute", request, JsonNode.class);
    }
}
