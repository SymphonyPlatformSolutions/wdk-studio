package com.symphony.devsol;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
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

@RestController
@RequiredArgsConstructor
public class WebService {
    private final String workflowRoot = "workflows/";
    private final BotService botService;
    private final String template = """
        id: abc
        activities:
          - send-message:
            id: abcInit
            on:
              message-received:
                content: /hello
            content: hello
    """;

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
        String fileName = workflow.workflow + ".swadl.yaml";
        if ((new File(workflowRoot + fileName)).exists()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        }
        String cleanName = workflow.workflow.replaceAll("-", "");
        String workflowContents = template.replaceAll("abc", cleanName);
        BufferedWriter writer = new BufferedWriter(new FileWriter(workflowRoot + fileName));
        writer.write(workflowContents);
        writer.close();
        return new Workflow(fileName, workflowContents);
    }

    @PostMapping("delete-workflow")
    public String deleteWorkflow(@RequestBody Workflow workflow) {
        if (!(new File(workflowRoot + workflow.workflow)).delete()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        }
        return "ok";
    }

    record Workflow(String workflow, String contents) {}
    record ReadWorkflow(String workflow) {}
}
