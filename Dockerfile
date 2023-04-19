FROM finos/symphony-wdk:1.5.1
WORKDIR /data/symphony
COPY federation/java-jwt-4.4.0.jar staging/java-jwt-4.4.0.jar
COPY federation/wdk-federation-client.jar staging/wdk-federation-client.jar
COPY lib/wdk-studio.jar staging/wdk-studio.jar
COPY lib/symphony-bdk-app-spring-boot-starter*.jar staging/bdk-app-starter.jar
COPY application.yaml application.yaml
EXPOSE 8080
ENTRYPOINT [ \
  "/bin/sh", "-c", \
  "mkdir -p lib && cp staging/* lib/ && /custom/jre/bin/java -jar /wdk.jar --spring.profiles.active=prod" \
]
