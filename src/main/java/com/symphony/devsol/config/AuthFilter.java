package com.symphony.devsol.config;

import com.symphony.bdk.core.auth.ExtensionAppAuthenticator;
import com.symphony.bdk.core.auth.jwt.UserClaim;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.regex.Pattern;
import static javax.servlet.http.HttpServletResponse.SC_UNAUTHORIZED;

@Slf4j
@Component
@RequiredArgsConstructor
public class AuthFilter extends OncePerRequestFilter {
    @Value("${wdk.properties.management-token}")
    private String managementToken;
    private final ExtensionAppAuthenticator extAppAuth;
    private final Pattern execPattern = Pattern.compile("/wdk/v1/workflows/[\\w\\-]+/execute");

    @Override
    protected void doFilterInternal(
        @NonNull HttpServletRequest request,
        @NonNull HttpServletResponse response,
        @NonNull FilterChain chain
    ) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        String managementTokenHeader = request.getHeader("X-Management-Token");
        UserClaim userClaim = new UserClaim();

        if (managementToken.equals(managementTokenHeader)) {
            userClaim.setUsername("mgmt-token");
        } else if (execPattern.matcher(request.getRequestURI()).matches()) {
            userClaim.setUsername("webhook");
        } else {
            try {
                String jwt = authHeader.substring(7);
                userClaim = extAppAuth.validateJwt(jwt);
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
