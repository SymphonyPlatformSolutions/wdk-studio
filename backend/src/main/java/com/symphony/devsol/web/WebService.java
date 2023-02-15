package com.symphony.devsol.web;

import com.symphony.devsol.WdkRunner;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import static org.springframework.http.HttpStatus.BAD_REQUEST;

@Slf4j
@RestController
@RequiredArgsConstructor
public class WebService {
    private final String workflowRoot = "workflows/";
//    private final WdkRunner botService;
//
//    @GetMapping("/api/logs")
//    public SseEmitter stream() {
//        return botService.getEmitter();
//    }

    @GetMapping("/api/list-workflows")
    public Set<String> listWorkflows() {
        return Stream.of(new File(workflowRoot).listFiles())
            .filter(file -> !file.isDirectory())
            .map(File::getName)
            .filter(f -> f.endsWith(".swadl.yaml"))
            .sorted()
            .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    @PostMapping("/api/read-workflow")
    public Workflow readWorkflow(@RequestBody ReadWorkflow request) throws IOException {
        String path = workflowRoot + request.workflow;
        log.info("Workflow read: {}", request.workflow);
        return new Workflow(request.workflow, String.join("\n", Files.readAllLines(Paths.get(path), StandardCharsets.UTF_8)));
    }

    @PostMapping("/api/write-workflow")
    public Workflow writeWorkflow(@RequestBody Workflow workflow) throws Exception {
        BufferedWriter writer = new BufferedWriter(new FileWriter(workflowRoot + workflow.workflow));
        writer.write(workflow.contents);
        writer.close();
        log.info("Workflow updated: {}", workflow.workflow);
        return new Workflow(workflow.workflow, workflow.contents);
    }

    @PostMapping("/api/add-workflow")
    public Workflow addWorkflow(@RequestBody Workflow workflow) throws Exception {
        String workflowName = workflow.workflow.trim();
        if (workflowName.isEmpty()) {
            throw new ResponseStatusException(BAD_REQUEST, "Workflow name cannot be empty");
        }
        String fileName = workflowName + ".swadl.yaml";
        if ((new File(workflowRoot + fileName)).exists()) {
            throw new ResponseStatusException(BAD_REQUEST, "Workflow named " + workflowName + " already exists");
        }
        BufferedWriter writer = new BufferedWriter(new FileWriter(workflowRoot + fileName));
        writer.write(workflow.contents);
        writer.close();
        log.info("Workflow created: {}", workflow.workflow);
        return new Workflow(fileName, workflow.contents);
    }

    @PostMapping("/api/delete-workflow")
    public String deleteWorkflow(@RequestBody Workflow workflow) {
        if (!(new File(workflowRoot + workflow.workflow)).delete()) {
            throw new ResponseStatusException(BAD_REQUEST);
        }
        log.info("Workflow deleted: {}", workflow.workflow);
        return "ok";
    }

    record Workflow(String workflow, String contents) {}
    record ReadWorkflow(String workflow) {}
}
