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
    private final RestTemplate restTemplate;

    public BotMonitoringService(RestTemplateBuilder restTemplateBuilder) {
        this.restTemplate = restTemplateBuilder
            .defaultHeader("Accept", MediaType.APPLICATION_JSON.toString())
            .build();
    }

    @GetMapping("/api/monitoring/{workflowId}/instances")
    public JsonNode listWorkflowInstances(@PathVariable String workflowId) {
        return restTemplate.getForObject(baseUri + "/workflows/" + workflowId + "/instances", JsonNode.class);
    }

    @GetMapping("/api/monitoring/{workflowId}/instances/{instanceId}/activities")
    public JsonNode listInstanceActivities(@PathVariable String workflowId, @PathVariable String instanceId) {
        return restTemplate.getForObject(baseUri + "/workflows/" + workflowId + "/instances/" + instanceId + "/activities", JsonNode.class);
    }
}
