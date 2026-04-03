package com.dahd.farmportal.controller;

import com.dahd.farmportal.dto.response.ApiResponse;
import com.dahd.farmportal.dto.response.DashboardStatsResponse;
import com.dahd.farmportal.dto.response.PagedResponse;
import com.dahd.farmportal.model.AuditLog;
import com.dahd.farmportal.model.User;
import com.dahd.farmportal.repository.AuditLogRepository;
import com.dahd.farmportal.repository.UserRepository;
import com.dahd.farmportal.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Admin Dashboard", description = "Admin-only APIs for portal management and statistics")
public class AdminController {

    private final DashboardService dashboardService;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;

    @GetMapping("/dashboard")
    @Operation(summary = "Get comprehensive admin dashboard statistics")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getAdminDashboardStats()));
    }

    @GetMapping("/users")
    @Operation(summary = "Get all users")
    public ResponseEntity<ApiResponse<PagedResponse<User>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        var result = userRepository.findAll(
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(ApiResponse.success(PagedResponse.of(result)));
    }

    @PatchMapping("/users/{userId}/toggle-active")
    @Operation(summary = "Activate or deactivate a user account")
    public ResponseEntity<ApiResponse<User>> toggleUserActive(@PathVariable String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new com.dahd.farmportal.exception.ResourceNotFoundException("User", "id", userId));
        user.setActive(!user.isActive());
        User saved = userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success(
                "User " + (saved.isActive() ? "activated" : "deactivated"), saved));
    }

    @GetMapping("/audit-logs")
    @Operation(summary = "Get all audit logs")
    public ResponseEntity<ApiResponse<PagedResponse<AuditLog>>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        var result = auditLogRepository.findAll(
                PageRequest.of(page, size, Sort.by("timestamp").descending()));
        return ResponseEntity.ok(ApiResponse.success(PagedResponse.of(result)));
    }

    @GetMapping("/audit-logs/user/{userId}")
    @Operation(summary = "Get audit logs for a specific user")
    public ResponseEntity<ApiResponse<PagedResponse<AuditLog>>> getAuditLogsByUser(
            @PathVariable String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        var result = auditLogRepository.findByUserId(userId,
                PageRequest.of(page, size, Sort.by("timestamp").descending()));
        return ResponseEntity.ok(ApiResponse.success(PagedResponse.of(result)));
    }
}
