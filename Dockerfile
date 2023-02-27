FROM amazoncorretto:17
RUN jlink --verbose --strip-java-debug-attributes --no-man-pages \
--no-header-files --compress=2 --output /jre \
--add-modules java.base,java.compiler,java.desktop,java.instrument,java.prefs,java.rmi,java.scripting,\
java.security.jgss,java.security.sasl,java.sql.rowset,jdk.attach,jdk.httpserver,jdk.jdi,jdk.jfr,\
jdk.management,jdk.net,jdk.unsupported,jdk.crypto.ec

FROM gcr.io/distroless/java-base-debian11
WORKDIR /data/symphony
COPY --from=0 /jre /jre
COPY workflow-bot-app.jar app.jar
COPY lib/wdk-studio.jar lib/wdk-studio.jar
COPY lib/symphony-bdk-app-spring-boot-starter*.jar lib/bdk-app-starter.jar
COPY application.yaml application.yaml
ENTRYPOINT [ "/jre/bin/java", "-jar", "app.jar", "--spring.profiles.active=prod" ]
