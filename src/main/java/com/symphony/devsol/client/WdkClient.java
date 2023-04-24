package com.symphony.devsol.client;

import com.symphony.bdk.core.auth.jwt.UserClaim;
import com.symphony.bdk.workflow.api.v1.dto.VersionedWorkflowView;
import com.symphony.bdk.workflow.management.WorkflowManagementService;
import com.symphony.bdk.workflow.monitoring.service.MonitoringService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@RestController
@RequiredArgsConstructor
public class WdkClient {
    @Value("${wdk.studio.admins:}")
    private List<Long> admins;
    private final MonitoringService monitoringService;
    private final WorkflowManagementService managementService;

    @GetMapping(value = "v1/export", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public ResponseEntity<byte[]> export(@RequestAttribute("user") UserClaim user) {
        if (!admins.contains(user.getId())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        Map<String, String> swadlMap = monitoringService.listAllWorkflows()
            .stream().map(w -> managementService.get(w.getId()).orElse(null))
            .collect(Collectors.toMap(VersionedWorkflowView::getWorkflowId, VersionedWorkflowView::getSwadl));

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        try (ZipOutputStream zipOut = new ZipOutputStream(outputStream)) {
            for (String workflowId : swadlMap.keySet()) {
                ZipEntry zipEntry = new ZipEntry(workflowId + ".swadl.yaml");
                zipOut.putNextEntry(zipEntry);

                ByteArrayInputStream stream = new ByteArrayInputStream(swadlMap.get(workflowId).getBytes());
                byte[] bytes = new byte[1024];
                int length;
                while ((length = stream.read(bytes)) >= 0) {
                    zipOut.write(bytes, 0, length);
                }
                zipOut.closeEntry();
            }
            zipOut.close();
            return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=wdk-export.zip")
                .body(outputStream.toByteArray());
        } catch (IOException e) {
            return null;
        }
    }
}
