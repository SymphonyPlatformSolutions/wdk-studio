package com.symphony.devsol.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.symphony.devsol.model.studio.Workflow;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.List;
import static org.springframework.http.HttpMethod.*;

@Service
public class WdkClient {
    @Value("${wdk.studio.base-uri}")
    private String baseUri;
    @Value("${wdk.studio.monitoring-token}")
    private String monitoringToken;
    @Getter
    @Value("${wdk.studio.management-token}")
    private String managementToken;
    private final RestTemplate monitoringApi;
    private final RestTemplate managementApi;

    public WdkClient(RestTemplateBuilder restTemplateBuilder) {
        this.monitoringApi = restTemplateBuilder
            .additionalInterceptors((request, body, execution) -> {
                request.getHeaders().add("X-Monitoring-Token", monitoringToken);
                return execution.execute(request, body);
            })
            .defaultHeader("Accept", MediaType.APPLICATION_JSON.toString())
            .build();
        this.managementApi = restTemplateBuilder
            .additionalInterceptors((request, body, execution) -> {
                request.getHeaders().add("X-Management-Token", managementToken);
                return execution.execute(request, body);
            })
            .defaultHeader("Accept", MediaType.APPLICATION_JSON.toString())
            .build();
    }

    public JsonNode listWorkflows() {
        return request(GET, "/workflows/", null);
    }

    public JsonNode getWorkflowDefinition(String workflowId) {
        return request(GET, "/workflows/" + workflowId + "/definitions", null);
    }

    public JsonNode listWorkflowInstances(String workflowId) {
        return request(GET, "/workflows/" + workflowId + "/instances", null);
    }

    public JsonNode listInstanceActivities(String workflowId, String instanceId) {
        return request(GET, "/workflows/" + workflowId + "/instances/" + instanceId + "/states", null);
    }

    public JsonNode listInstanceVariables(String workflowId, String instanceId) {
        return request(GET, "/workflows/" + workflowId + "/instances/" + instanceId + "/variables", null);
    }

    public JsonNode executeRequest(String workflow, JsonNode body, String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));
        headers.set("X-Workflow-Token", token);
        HttpEntity<JsonNode> request = new HttpEntity<>(body, headers);
        return request(POST, "/workflows/" + workflow + "/execute", request);
    }

    public JsonNode addWorkflow(Workflow workflow) {
        return request(POST, "/management/workflows", workflow);
    }

    public JsonNode editWorkflow(Workflow workflow) {
        return request(PUT, "/management/workflows", workflow);
    }

    public JsonNode readWorkflow(String workflowId) {
        return request(GET, "/management/workflows/" + workflowId, null);
    }

    public void deleteWorkflow(String workflowId) {
        request(DELETE, "/management/workflows/" + workflowId, null);
    }

    @SuppressWarnings("unchecked")
    private JsonNode request(HttpMethod method, String path, Object object) {
        RestTemplate template = path.startsWith("/management") ? managementApi : monitoringApi;
        HttpEntity<Object> request = null;
        if (object != null) {
            request = object instanceof HttpEntity ? (HttpEntity<Object>) object : new HttpEntity<>(object);
        }
        return template.exchange(baseUri + path, method, request, JsonNode.class).getBody();
    }
}
