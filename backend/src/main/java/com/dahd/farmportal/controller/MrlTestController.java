package com.dahd.farmportal.controller;

import com.dahd.farmportal.dto.request.MrlTestRequest;
import com.dahd.farmportal.dto.response.ApiResponse;
import com.dahd.farmportal.dto.response.PagedResponse;
import com.dahd.farmportal.model.MrlTestRecord;
import com.dahd.farmportal.service.MrlTestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/mrl-tests")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "MRL Testing", description = "Maximum Residue Limit testing and reporting APIs")
public class MrlTestController {

    private final MrlTestService mrlTestService;

    @PostMapping
    @PreAuthorize("hasAnyRole('VET_OFFICER', 'DISTRICT_OFFICER', 'ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Submit a new MRL test record")
    public ResponseEntity<ApiResponse<MrlTestRecord>> createTest(
            @Valid @RequestBody MrlTestRequest request,
            Authentication auth) {
        MrlTestRecord record = mrlTestService.createTestRecord(request, auth.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("MRL test record created", record));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('VET_OFFICER', 'ADMIN', 'SUPER_ADMIN', 'STATE_OFFICER', 'DISTRICT_OFFICER')")
    @Operation(summary = "Get all MRL test records")
    public ResponseEntity<ApiResponse<PagedResponse<MrlTestRecord>>> getAllTests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(mrlTestService.getAllTests(page, size)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get MRL test record by ID")
    public ResponseEntity<ApiResponse<MrlTestRecord>> getById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(mrlTestService.getById(id)));
    }

    @GetMapping("/ref/{refNumber}")
    @Operation(summary = "Get MRL test by reference number")
    public ResponseEntity<ApiResponse<MrlTestRecord>> getByRefNumber(@PathVariable String refNumber) {
        return ResponseEntity.ok(ApiResponse.success(mrlTestService.getByReferenceNumber(refNumber)));
    }

    @GetMapping("/farm/{farmId}")
    @Operation(summary = "Get all MRL tests for a farm")
    public ResponseEntity<ApiResponse<PagedResponse<MrlTestRecord>>> getByFarm(
            @PathVariable String farmId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(mrlTestService.getTestsByFarm(farmId, page, size)));
    }

    @GetMapping("/failed")
    @PreAuthorize("hasAnyRole('VET_OFFICER', 'ADMIN', 'SUPER_ADMIN', 'STATE_OFFICER', 'DISTRICT_OFFICER')")
    @Operation(summary = "Get all failed MRL tests")
    public ResponseEntity<ApiResponse<PagedResponse<MrlTestRecord>>> getFailedTests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(mrlTestService.getFailedTests(page, size)));
    }

    @GetMapping("/date-range")
    @Operation(summary = "Get MRL tests within a date range")
    public ResponseEntity<ApiResponse<PagedResponse<MrlTestRecord>>> getByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                mrlTestService.getTestsByDateRange(from, to, page, size)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('VET_OFFICER', 'DISTRICT_OFFICER', 'ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Update MRL test status")
    public ResponseEntity<ApiResponse<MrlTestRecord>> updateStatus(
            @PathVariable String id,
            @RequestParam MrlTestRecord.TestStatus status,
            Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success("Status updated",
                mrlTestService.updateTestStatus(id, status, auth.getName())));
    }

    @PatchMapping("/{id}/action")
    @PreAuthorize("hasAnyRole('DISTRICT_OFFICER', 'ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Record action taken on failed MRL test")
    public ResponseEntity<ApiResponse<MrlTestRecord>> updateAction(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success("Action recorded",
                mrlTestService.updateActionTaken(id, body.get("action"),
                        body.get("actionBy"), auth.getName())));
    }
}
