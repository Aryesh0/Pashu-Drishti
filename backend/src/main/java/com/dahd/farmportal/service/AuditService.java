package com.dahd.farmportal.service;

import com.dahd.farmportal.model.AuditLog;
import com.dahd.farmportal.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Async
    public void log(String userId, String username, String action, String entityType,
                    String entityId, String description, String ipAddress,
                    boolean success, String failureReason) {
        AuditLog log = AuditLog.builder()
                .userId(userId)
                .username(username)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .description(description)
                .ipAddress(ipAddress)
                .success(success)
                .failureReason(failureReason)
                .build();
        auditLogRepository.save(log);
    }
}
