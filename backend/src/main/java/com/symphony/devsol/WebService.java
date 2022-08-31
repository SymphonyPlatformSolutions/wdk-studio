package com.symphony.devsol;

import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.LinkedHashSet;
import java.util.Scanner;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import static org.springframework.http.HttpStatus.BAD_REQUEST;

@RestController
@RequiredArgsConstructor
public class WebService {
    private final String workflowRoot = "workflows/";
    private final BotService botService;

    @GetMapping("logs")
    public SseEmitter stream() {
        return botService.getEmitter();
    }

    @GetMapping("list-workflows")
    public Set<String> listWorkflows() {
        return Stream.of(new File(workflowRoot).listFiles())
            .filter(file -> !file.isDirectory())
            .map(File::getName)
            .sorted()
            .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    @PostMapping("read-workflow")
    public Workflow readWorkflow(@RequestBody ReadWorkflow request) throws IOException {
        String path = workflowRoot + request.workflow;
        return new Workflow(request.workflow, String.join("\n", Files.readAllLines(Paths.get(path), StandardCharsets.UTF_8)));
    }

    @PostMapping("write-workflow")
    public Workflow writeWorkflow(@RequestBody Workflow workflow) throws Exception {
        BufferedWriter writer = new BufferedWriter(new FileWriter(workflowRoot + workflow.workflow));
        writer.write(workflow.contents);
        writer.close();
        return new Workflow(workflow.workflow, workflow.contents);
    }

    @PostMapping("add-workflow")
    public Workflow addWorkflow(@RequestBody Workflow workflow) throws Exception {
        String workflowName = workflow.workflow.trim();
        if (workflowName.isEmpty()) {
            throw new ResponseStatusException(BAD_REQUEST, "Workflow name cannot be empty");
        }
        String fileName = workflowName + ".swadl.yaml";
        if ((new File(workflowRoot + fileName)).exists()) {
            throw new ResponseStatusException(BAD_REQUEST, "Workflow named " + workflowName + " already exists");
        }
        String cleanName = workflow.workflow.replaceAll("-", "");
        InputStream inputStream = new ClassPathResource("template.yaml").getInputStream();
        String template = new Scanner(inputStream).useDelimiter("\\A").next();
        String workflowContents = template.replaceAll("abc", cleanName);
        BufferedWriter writer = new BufferedWriter(new FileWriter(workflowRoot + fileName));
        writer.write(workflowContents);
        writer.close();
        return new Workflow(fileName, workflowContents);
    }

    @PostMapping("delete-workflow")
    public String deleteWorkflow(@RequestBody Workflow workflow) {
        if (!(new File(workflowRoot + workflow.workflow)).delete()) {
            throw new ResponseStatusException(BAD_REQUEST);
        }
        return "ok";
    }

    record Workflow(String workflow, String contents) {}
    record ReadWorkflow(String workflow) {}
}
