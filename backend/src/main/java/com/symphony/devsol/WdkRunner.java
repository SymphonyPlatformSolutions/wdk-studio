package com.symphony.devsol;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.env.Environment;
import org.springframework.core.task.TaskExecutor;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import javax.annotation.PostConstruct;
import java.io.*;
import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class WdkRunner {
    private final Environment env;
    private final TaskExecutor taskExecutor;
    @Getter
    private SseEmitter emitter;

    @PostConstruct
    public void initBot() {
        taskExecutor.execute(this::runBot);
    }

    private void resetEmitter() {
        emitter = new SseEmitter(1000L * 60 * 60 * 24);
        emitter.onTimeout(this::resetEmitter);
        emitter.onCompletion(this::resetEmitter);
        emitter.onError(e -> log.error("Emitter Error", e));
    }

    public void runBot() {
        resetEmitter();
        String command = "java -jar workflow-bot-app.jar --spring.profiles.active=" + String.join(",", env.getActiveProfiles());
        try {
            Process p = Runtime.getRuntime().exec(command, null, new File("wdk-bot"));
            taskExecutor.execute(() -> new StreamListener(p.getInputStream()).run());
            taskExecutor.execute(() -> new StreamListener(p.getErrorStream()).run());
        } catch (IOException e) {
            log.error("Process Error", e);
        }
    }

    public void writeLog(String log) {
        System.out.println(log);
        try {
            emitter.send(SseEmitter.event()
                .data(log)
                .id(Instant.now().toString())
                .name("message"));
        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }

    private class StreamListener {
        private final BufferedReader reader;

        public StreamListener(InputStream s) {
            reader = new BufferedReader(new InputStreamReader(s));
        }

        public void run() {
            try {
                String line;
                while ((line = reader.readLine()) != null) {
                    writeLog(line);
                }
            } catch (IOException e) {
                log.error("I/O Error", e);
            }
        }
    }
}
