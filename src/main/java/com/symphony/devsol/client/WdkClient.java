package com.symphony.devsol.client;

import com.symphony.devsol.model.wdk.Workflow;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.List;

@Slf4j
@Service
public class WdkClient {
    private String baseUri = "http://localhost:8080";
    private final RestTemplate restTemplate;

    public WdkClient(
        @Value("${wdk.properties.management-token}") String managementToken,
        RestTemplateBuilder builder
    ) {
        this.restTemplate = builder
            .defaultHeader("X-Management-Token", managementToken)
            .defaultHeader("Accept", MediaType.APPLICATION_JSON.toString())
            .build();
    }

    public long getWorkflowOwner(String workflowId) {
        List<Workflow> workflows = restTemplate.exchange(
            baseUri + "/v1/workflows/" + workflowId, HttpMethod.GET,
            null, new ParameterizedTypeReference<List<Workflow>>() {}).getBody();
        if (workflows == null) {
            return 0L;
        }
        return workflows.stream().filter(Workflow::isActive)
            .findFirst().map(Workflow::getCreatedBy).orElse(0L);
    }
}
