package com.symphony.devsol.config;

import com.symphony.bdk.core.auth.ExtensionAppAuthenticator;
import com.symphony.bdk.core.auth.jwt.JwtHelper;
import com.symphony.bdk.core.auth.jwt.UserClaim;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.env.Environment;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import javax.annotation.PostConstruct;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {
    private final ExtensionAppAuthenticator extAppAuth;
    private final Environment env;
    private String podCertificate;

    @PostConstruct
    public void init() {
        podCertificate = extAppAuth.getPodCertificate().getCertificate();
    }

    @Override
    protected void doFilterInternal(
        @NonNull HttpServletRequest request,
        @NonNull HttpServletResponse response,
        @NonNull FilterChain chain) throws ServletException, IOException
    {
        final String authHeader = request.getHeader("Authorization");

        if (Arrays.asList(env.getActiveProfiles()).contains("dev")) {
            UserClaim userClaim = new UserClaim();
            userClaim.setUsername("dev-user@company.com");
            var authToken = new UsernamePasswordAuthenticationToken(userClaim, null, List.of());
            SecurityContextHolder.getContext().setAuthentication(authToken);
            log.info("{} called {}", userClaim.getUsername(), request.getRequestURI());
        } else if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                String jwt = authHeader.substring(7);
                UserClaim userClaim = JwtHelper.validateJwt(jwt, podCertificate);
                var authToken = new UsernamePasswordAuthenticationToken(userClaim, null, List.of());
                SecurityContextHolder.getContext().setAuthentication(authToken);
                log.info("{} called {}", userClaim.getUsername(), request.getRequestURI());
            } catch (Exception e) {
                response.setStatus(401);
            }
        }
        chain.doFilter(request, response);
    }
}
