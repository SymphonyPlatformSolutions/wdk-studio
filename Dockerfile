FROM openjdk:18-slim-bullseye
WORKDIR /build
COPY ./backend/build/libs/*.jar /app/app.jar
RUN cd /app && jar -xf app.jar && \
    jdeps \
    --ignore-missing-deps \
    --print-module-deps \
    -q \
    --recursive \
    --multi-release 17 \
    --class-path="BOOT-INF/lib/*" \
    --module-path="BOOT-INF/lib/*" \
    app.jar > /deps1
COPY ./wdk-bot/workflow-bot-app.jar /bot/bot.jar
RUN cd /bot && jar -xf bot.jar && \
    jdeps \
    --ignore-missing-deps \
    --print-module-deps \
    -q \
    --recursive \
    --multi-release 17 \
    --class-path="BOOT-INF/lib/*" \
    --module-path="BOOT-INF/lib/*" \
    bot.jar > /deps2
RUN echo $(cat /deps1),$(cat /deps2) > /deps

FROM openjdk:17-slim-bullseye
COPY --from=0 /deps /deps
RUN jlink \
    --verbose \
    --add-modules $(cat /deps) \
    --strip-java-debug-attributes \
    --no-man-pages \
    --no-header-files \
    --compress=2 \
    --output /jre

FROM debian:bullseye-slim
COPY --from=1 /jre /jre
RUN ln -s /jre/bin/java /bin/java
WORKDIR /data/symphony
COPY ./backend/build/libs/*.jar app.jar
COPY ./wdk-bot/workflow-bot-app.jar wdk-bot/workflow-bot-app.jar
COPY ./wdk-bot/application.yaml wdk-bot/application.yaml
ENTRYPOINT [ "java", "-jar", "./app.jar", "--spring.profiles.active=prod" ]
