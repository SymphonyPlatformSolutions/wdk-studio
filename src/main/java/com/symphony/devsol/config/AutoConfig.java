package com.symphony.devsol.config;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

@EnableCaching
@Configuration
@ComponentScan(basePackages = "com.symphony.devsol")
@EnableWebMvc
public class AutoConfig {}
