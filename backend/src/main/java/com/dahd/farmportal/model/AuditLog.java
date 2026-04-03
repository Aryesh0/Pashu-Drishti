package com.dahd.farmportal.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "audit_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {

    @Id
    private String id;

    private String userId;
    private String username;
    private String action;           // CREATE, UPDATE, DELETE, VIEW, LOGIN, LOGOUT
    private String entityType;       // Farm, Animal, MrlTest, etc.
    private String entityId;
    private String description;
    private String ipAddress;
    private String userAgent;
    private boolean success;
    private String failureReason;

    @CreatedDate
    private LocalDateTime timestamp;
}
