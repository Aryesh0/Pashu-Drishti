package com.dahd.farmportal.controller;

import com.dahd.farmportal.dto.request.AntimicrobialUsageRequest;
import com.dahd.farmportal.dto.response.ApiResponse;
import com.dahd.farmportal.dto.response.PagedResponse;
import com.dahd.farmportal.model.AntimicrobialUsage;
import com.dahd.farmportal.service.AntimicrobialUsageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/antimicrobial")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Antimicrobial Usage", description = "Antimicrobial / antibiotic usage tracking and AMR surveillance APIs")
public class AntimicrobialUsageController {

    private final AntimicrobialUsageService service;

    @PostMapping
    @PreAuthorize("hasAnyRole('VET_OFFICER', 'DISTRICT_OFFICER', 'ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Record antimicrobial drug usage")
    public ResponseEntity<ApiResponse<AntimicrobialUsage>> recordUsage(
            @Valid @RequestBody AntimicrobialUsageRequest request,
            Authentication auth) {
        AntimicrobialUsage usage = service.recordUsage(request, auth.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Antimicrobial usage recorded", usage));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('VET_OFFICER', 'ADMIN', 'SUPER_ADMIN', 'STATE_OFFICER', 'DISTRICT_OFFICER')")
    @Operation(summary = "Get all antimicrobial usage records")
    public ResponseEntity<ApiResponse<PagedResponse<AntimicrobialUsage>>> getAllUsages(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(service.getAllUsages(page, size)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get antimicrobial usage by ID")
    public ResponseEntity<ApiResponse<AntimicrobialUsage>> getById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(service.getById(id)));
    }

    @GetMapping("/farm/{farmId}")
    @Operation(summary = "Get antimicrobial usages for a farm")
    public ResponseEntity<ApiResponse<PagedResponse<AntimicrobialUsage>>> getByFarm(
            @PathVariable String farmId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(service.getUsagesByFarm(farmId, page, size)));
    }

    @GetMapping("/critical")
    @PreAuthorize("hasAnyRole('VET_OFFICER', 'ADMIN', 'SUPER_ADMIN', 'STATE_OFFICER', 'DISTRICT_OFFICER')")
    @Operation(summary = "Get records with critically important antibiotic usage (WHO CIA list)")
    public ResponseEntity<ApiResponse<PagedResponse<AntimicrobialUsage>>> getCriticalUsages(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(service.getCriticalAntibioticUsages(page, size)));
    }

    @GetMapping("/active-withdrawals")
    @PreAuthorize("hasAnyRole('VET_OFFICER', 'DISTRICT_OFFICER', 'ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Get records with active withdrawal periods")
    public ResponseEntity<ApiResponse<PagedResponse<AntimicrobialUsage>>> getActiveWithdrawals(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(service.getActiveWithdrawalPeriods(page, size)));
    }

    @PatchMapping("/{id}/outcome")
    @PreAuthorize("hasAnyRole('VET_OFFICER', 'DISTRICT_OFFICER', 'ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Update treatment outcome")
    public ResponseEntity<ApiResponse<AntimicrobialUsage>> updateOutcome(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            Authentication auth) {
        AntimicrobialUsage.TreatmentOutcome outcome =
                AntimicrobialUsage.TreatmentOutcome.valueOf(body.get("outcome"));
        return ResponseEntity.ok(ApiResponse.success("Outcome updated",
                service.updateOutcome(id, outcome, body.get("notes"), auth.getName())));
    }

    @PatchMapping("/{id}/withdrawal-complete")
    @PreAuthorize("hasAnyRole('VET_OFFICER', 'ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Mark withdrawal period as complete")
    public ResponseEntity<ApiResponse<AntimicrobialUsage>> markWithdrawalComplete(
            @PathVariable String id,
            Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success("Withdrawal period marked complete",
                service.markWithdrawalComplete(id, auth.getName())));
    }
}
