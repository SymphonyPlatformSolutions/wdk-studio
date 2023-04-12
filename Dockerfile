FROM finos/symphony-wdk:1.5.0
WORKDIR /symphony
COPY lib/wdk-studio.jar staging/wdk-studio.jar
COPY lib/symphony-bdk-app-spring-boot-starter*.jar staging/bdk-app-starter.jar
COPY application.yaml application.yaml
RUN ln -s /data/symphony /symphony
EXPOSE 8080
ENTRYPOINT [ \
  "/bin/sh", "-c", \
  "mkdir -p lib && cp staging/* lib/ && /custom/jre/bin/java -jar /wdk.jar --spring.profiles.active=prod" \
]
