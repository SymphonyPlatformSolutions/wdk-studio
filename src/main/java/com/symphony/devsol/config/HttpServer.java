package com.symphony.devsol.config;

import org.apache.catalina.connector.Connector;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Profile("dev")
@Component
public class HttpServer implements WebServerFactoryCustomizer<TomcatServletWebServerFactory> {
    public void customize(TomcatServletWebServerFactory factory) {
        factory.addAdditionalTomcatConnectors(standardConnector());
    }

    private Connector standardConnector() {
        Connector connector = new Connector(TomcatServletWebServerFactory.DEFAULT_PROTOCOL);
        connector.setPort(8080);
        return connector;
    }
}
