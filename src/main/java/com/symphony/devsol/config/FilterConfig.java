package com.symphony.devsol.config;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.filter.OncePerRequestFilter;

@Configuration
public class FilterConfig {
    @Bean
    public FilterRegistrationBean<OncePerRequestFilter> authFilterRegistration(AuthFilter authFilter) {
        FilterRegistrationBean<OncePerRequestFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(authFilter);
        registration.addUrlPatterns("/v1/*", "/gallery/*");
        registration.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return registration;
    }

    @Bean
    public FilterRegistrationBean<OncePerRequestFilter> wdkFilterRegistration(WdkFilter wdkFilter) {
        FilterRegistrationBean<OncePerRequestFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(wdkFilter);
        registration.addUrlPatterns("/v1/*");
        registration.setOrder(Ordered.HIGHEST_PRECEDENCE + 1);
        return registration;
    }
}
