package com.dahd.farmportal.controller;

import com.dahd.farmportal.dto.request.FarmRequest;
import com.dahd.farmportal.dto.response.ApiResponse;
import com.dahd.farmportal.dto.response.PagedResponse;
import com.dahd.farmportal.model.Farm;
import com.dahd.farmportal.service.FarmService;
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

@RestController
@RequestMapping("/farms")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Farm Management", description = "APIs for managing farm registrations and details")
public class FarmController {

    private final FarmService farmService;

    @PostMapping
    @Operation(summary = "Register a new farm")
    public ResponseEntity<ApiResponse<Farm>> registerFarm(
            @Valid @RequestBody FarmRequest request,
            Authentication auth) {
        // For demo: ownerUserId derived from token. In production, map from userRepo.
        Farm farm = farmService.registerFarm(request, auth.getName(), auth.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Farm registered successfully", farm));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'STATE_OFFICER', 'DISTRICT_OFFICER', 'VET_OFFICER')")
    @Operation(summary = "Get all farms (paginated)")
    public ResponseEntity<ApiResponse<PagedResponse<Farm>>> getAllFarms(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(farmService.getAllFarms(page, size)));
    }

    @GetMapping("/{farmId}")
    @Operation(summary = "Get farm by ID")
    public ResponseEntity<ApiResponse<Farm>> getFarmById(@PathVariable String farmId) {
        return ResponseEntity.ok(ApiResponse.success(farmService.getFarmById(farmId)));
    }

    @GetMapping("/reg/{regNumber}")
    @Operation(summary = "Get farm by registration number")
    public ResponseEntity<ApiResponse<Farm>> getFarmByRegNumber(@PathVariable String regNumber) {
        return ResponseEntity.ok(ApiResponse.success(farmService.getFarmByRegNumber(regNumber)));
    }

    @GetMapping("/my-farms")
    @Operation(summary = "Get farms owned by the logged-in user")
    public ResponseEntity<ApiResponse<PagedResponse<Farm>>> getMyFarms(
            Authentication auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                farmService.getFarmsByOwner(auth.getName(), page, size)));
    }

    @GetMapping("/state/{stateCode}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'STATE_OFFICER')")
    @Operation(summary = "Get farms by state code")
    public ResponseEntity<ApiResponse<PagedResponse<Farm>>> getFarmsByState(
            @PathVariable String stateCode,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(farmService.getFarmsByState(stateCode, page, size)));
    }

    @GetMapping("/district/{districtCode}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'STATE_OFFICER', 'DISTRICT_OFFICER')")
    @Operation(summary = "Get farms by district code")
    public ResponseEntity<ApiResponse<PagedResponse<Farm>>> getFarmsByDistrict(
            @PathVariable String districtCode,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(farmService.getFarmsByDistrict(districtCode, page, size)));
    }

    @GetMapping("/search")
    @Operation(summary = "Search farms by name")
    public ResponseEntity<ApiResponse<PagedResponse<Farm>>> searchFarms(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(farmService.searchFarms(keyword, page, size)));
    }

    @PutMapping("/{farmId}")
    @Operation(summary = "Update farm details")
    public ResponseEntity<ApiResponse<Farm>> updateFarm(
            @PathVariable String farmId,
            @Valid @RequestBody FarmRequest request,
            Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success("Farm updated",
                farmService.updateFarm(farmId, request, auth.getName())));
    }

    @PatchMapping("/{farmId}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'DISTRICT_OFFICER')")
    @Operation(summary = "Update farm status")
    public ResponseEntity<ApiResponse<Farm>> updateFarmStatus(
            @PathVariable String farmId,
            @RequestParam Farm.FarmStatus status,
            Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success("Farm status updated",
                farmService.updateFarmStatus(farmId, status, auth.getName())));
    }

    @DeleteMapping("/{farmId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Delete a farm")
    public ResponseEntity<ApiResponse<Void>> deleteFarm(
            @PathVariable String farmId,
            Authentication auth) {
        farmService.deleteFarm(farmId, auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Farm deleted successfully", null));
    }
}
