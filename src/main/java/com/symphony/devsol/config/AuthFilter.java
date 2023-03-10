package com.symphony.devsol.config;

import com.symphony.bdk.core.auth.ExtensionAppAuthenticator;
import com.symphony.bdk.core.auth.jwt.JwtHelper;
import com.symphony.bdk.core.auth.jwt.UserClaim;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.env.Environment;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import javax.annotation.PostConstruct;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.regex.Pattern;

import static javax.servlet.http.HttpServletResponse.SC_UNAUTHORIZED;

@Slf4j
@Component
@RequiredArgsConstructor
public class AuthFilter extends OncePerRequestFilter {
    private String podCertificate;
    private final Environment env;
    private final ExtensionAppAuthenticator extAppAuth;
    private final Pattern execPattern = Pattern.compile("/wdk/v1/workflows/[\\w\\-]+/execute");

    @PostConstruct
    public void init() {
        podCertificate = extAppAuth.getPodCertificate().getCertificate();
    }

    @Override
    protected void doFilterInternal(
        @NonNull HttpServletRequest request,
        @NonNull HttpServletResponse response,
        @NonNull FilterChain chain
    ) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        UserClaim userClaim = new UserClaim();

        if (authHeader == null && Arrays.asList(env.getActiveProfiles()).contains("dev")) {
            userClaim.setUsername("no-auth");
        } else if (execPattern.matcher(request.getRequestURI()).matches()) {
            userClaim.setUsername("webhook");
        } else {
            try {
                String jwt = authHeader.substring(7);
                userClaim = JwtHelper.validateJwt(jwt, podCertificate);
            } catch (Exception e) {
                response.sendError(SC_UNAUTHORIZED, "Invalid Credentials");
                return;
            }
        }
        if (userClaim.getUsername() != null) {
            request.setAttribute("user", userClaim);
        }
        chain.doFilter(request, response);
    }
}
