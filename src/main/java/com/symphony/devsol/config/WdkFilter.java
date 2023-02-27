package com.symphony.devsol.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class WdkFilter extends OncePerRequestFilter {
    @Value("${wdk.properties.monitoring-token}")
    private String monitoringToken;
    @Value("${wdk.properties.management-token}")
    private String managementToken;

    private HttpServletRequestWrapper wdkTokenWrapper(HttpServletRequest request) {
        return new HttpServletRequestWrapper(request) {
            @Override
            public String getHeader(String name) {
                if (name.equals("X-Monitoring-Token")) {
                    return monitoringToken;
                }
                if (name.equals("X-Management-Token")) {
                    return managementToken;
                }
                return super.getHeader(name);
            }
        };
    }

    @Override
    protected void doFilterInternal(
        HttpServletRequest request, HttpServletResponse response, FilterChain chain
    ) throws ServletException, IOException {
        chain.doFilter(wdkTokenWrapper(request), response);
    }
}
