FROM amazoncorretto:17
RUN jlink --verbose --strip-java-debug-attributes --no-man-pages \
--no-header-files --compress=2 --output /jre \
--add-modules java.base,java.compiler,java.desktop,java.instrument,java.prefs,java.rmi,java.scripting,\
java.security.jgss,java.security.sasl,java.sql.rowset,jdk.attach,jdk.httpserver,jdk.jdi,jdk.jfr,\
jdk.management,jdk.net,jdk.unsupported,jdk.crypto.ec

FROM debian:bullseye-slim
WORKDIR /data/symphony
COPY --from=0 /jre /custom/jre
COPY workflow-bot-app.jar /wdk.jar
COPY lib/* staging/
COPY application.yaml application.yaml
EXPOSE 8080
ENTRYPOINT [ \
  "/bin/sh", "-c", \
  "mkdir -p lib && cp staging/* lib/ && /custom/jre/bin/java -jar /wdk.jar --spring.profiles.active=prod" \
]
