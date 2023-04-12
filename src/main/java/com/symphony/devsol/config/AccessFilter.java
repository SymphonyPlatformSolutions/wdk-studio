package com.symphony.devsol.config;

import com.symphony.bdk.core.auth.jwt.UserClaim;
import com.symphony.bdk.workflow.api.v1.WorkflowsMgtApi;
import com.symphony.bdk.workflow.api.v1.dto.VersionedWorkflowView;
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
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import static java.nio.charset.StandardCharsets.UTF_8;
import static javax.servlet.http.HttpServletResponse.SC_UNAUTHORIZED;

@Slf4j
@Component
@RequiredArgsConstructor
public class AccessFilter extends OncePerRequestFilter {
    @Value("${wdk.studio.admins:}")
    private List<Long> admins;
    private final Pattern idPattern = Pattern.compile("^id: ([\\w\\-]+)");
    private final Pattern wfPattern = Pattern.compile("/v1/workflows/([\\w\\-]+)");
    private final WorkflowsMgtApi managementApi;
    @Value("${wdk.properties.management-token}")
    private String managementToken;

    @Override
    protected void doFilterInternal(
        @NonNull HttpServletRequest request,
        @NonNull HttpServletResponse response,
        @NonNull FilterChain chain
    ) throws ServletException, IOException {
        UserClaim user = (UserClaim) request.getAttribute("user");
        if (
            !List.of("GET", "OPTIONS").contains(request.getMethod()) &&
            !List.of("mgmt-token", "webhook").contains(user.getUsername())
        ) {
            long userId = user.getId();
            String workflowId = null;

            Matcher matcher = wfPattern.matcher(request.getServletPath());
            if (matcher.find()) {
                workflowId = matcher.group(1);
            }

            if (workflowId == null && List.of("POST", "PUT").contains(request.getMethod())) {
                // Check that caller matches declared author, or is an admin
                byte[] authorBytes = request.getPart("createdBy").getInputStream().readAllBytes();
                long authorId = Long.parseLong(new String(authorBytes, UTF_8));
                if (!admins.contains(userId) && userId != authorId) {
                    response.sendError(SC_UNAUTHORIZED, "Your identity does not match the provided author");
                    return;
                }

                byte[] swadlBytes = request.getPart("swadl").getInputStream().readAllBytes();
                String swadl = new String(swadlBytes, UTF_8);
                Matcher idMatcher = idPattern.matcher(swadl);
                if (idMatcher.find()) {
                    workflowId = idMatcher.group(1);
                }
            }

            // Check that caller owns the workflow
            List<VersionedWorkflowView> workflows = managementApi.getVersionedWorkflow(managementToken, workflowId, null, false).getBody();
            long ownerId = workflows == null || workflows.isEmpty() ? 0L : workflows.get(0).getCreatedBy();
            if (ownerId > 0L && !admins.contains(userId) && ownerId != userId) {
                response.sendError(SC_UNAUTHORIZED, "You are not allowed to modify this workflow");
                return;
            }
        }
        chain.doFilter(request, response);
    }
}
