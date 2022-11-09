package com.symphony.devsol;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
public class BotMonitoringService {
    @Value("${wdk.studio.base-uri}")
    private String baseUri;
    @Value("${wdk.studio.monitoring-token}")
    private String token;
    private final RestTemplate restTemplate;

    public BotMonitoringService(RestTemplateBuilder restTemplateBuilder) {
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
}
