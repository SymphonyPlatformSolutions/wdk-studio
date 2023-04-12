FROM finos/symphony-wdk:1.5.0
WORKDIR /data/symphony
ENV GH_URI=https://github.com/SymphonyPlatformSolutions/wdk-federation-client/releases/download/
RUN mkdir staging && wget $GH_URI/1.0.1/wdk-federation-client.jar -P staging && wget $GH_URI/1.0.1/java-jwt-4.4.0.jar -P staging
COPY lib/wdk-studio.jar staging/wdk-studio.jar
COPY lib/symphony-bdk-app-spring-boot-starter*.jar staging/bdk-app-starter.jar
COPY application.yaml application.yaml
EXPOSE 8080
ENTRYPOINT [ \
  "/bin/sh", "-c", \
  "mkdir -p lib && cp staging/* lib/ && /custom/jre/bin/java -jar /wdk.jar --spring.profiles.active=prod" \
]
