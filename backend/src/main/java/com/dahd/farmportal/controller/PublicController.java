package com.dahd.farmportal.controller;

import com.dahd.farmportal.dto.response.ApiResponse;
import com.dahd.farmportal.dto.response.DashboardStatsResponse;
import com.dahd.farmportal.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/public")
@RequiredArgsConstructor
@Tag(name = "Public", description = "Public platform information and summary APIs")
public class PublicController {

    private final DashboardService dashboardService;

    @GetMapping("/platform-summary")
    @Operation(summary = "Get public platform summary metrics")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getPlatformSummary() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getAdminDashboardStats()));
    }
}
