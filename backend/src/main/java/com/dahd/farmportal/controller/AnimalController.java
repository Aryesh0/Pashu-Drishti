package com.dahd.farmportal.controller;

import com.dahd.farmportal.dto.request.AnimalRequest;
import com.dahd.farmportal.dto.response.ApiResponse;
import com.dahd.farmportal.dto.response.PagedResponse;
import com.dahd.farmportal.model.Animal;
import com.dahd.farmportal.service.AnimalService;
import com.dahd.farmportal.util.QrCodeGenerator;
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
@RequestMapping("/animals")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Animal Records", description = "APIs for managing livestock records and health tracking")
public class AnimalController {

    private final AnimalService animalService;
    private final QrCodeGenerator qrCodeGenerator;

    // ─────────────────────────────────────────────────────────────────────────
    // CREATE
    // ─────────────────────────────────────────────────────────────────────────

    @PostMapping
    @Operation(summary = "Register a new animal")
    public ResponseEntity<ApiResponse<Animal>> registerAnimal(
            @Valid @RequestBody AnimalRequest request,
            Authentication auth) {
        Animal animal = animalService.registerAnimal(request, auth.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Animal registered successfully", animal));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // READ — single animal
    // ─────────────────────────────────────────────────────────────────────────

    @GetMapping("/{animalId}")
    @Operation(summary = "Get animal by ID")
    public ResponseEntity<ApiResponse<Animal>> getAnimalById(
            @PathVariable String animalId) {
        return ResponseEntity.ok(ApiResponse.success(
                animalService.getAnimalById(animalId)));
    }

    @GetMapping("/tag/{tagNumber}")
    @Operation(summary = "Get animal by ICAR tag number")
    public ResponseEntity<ApiResponse<Animal>> getAnimalByTag(
            @PathVariable String tagNumber) {
        return ResponseEntity.ok(ApiResponse.success(
                animalService.getAnimalByTagNumber(tagNumber)));
    }

    @GetMapping("/{animalId}/qr-code")
    @Operation(summary = "Get QR code image for animal tag")
    public ResponseEntity<ApiResponse<java.util.Map<String, String>>> getQrCode(
            @PathVariable String animalId) throws Exception {
        Animal animal = animalService.getAnimalById(animalId);
        String qrBase64 = qrCodeGenerator.generateQrCodeBase64(animal.getTagNumber());
        return ResponseEntity.ok(ApiResponse.success("QR code generated",
                animalService.getQrCodePayload(animal, qrBase64)));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // READ — collections by farm
    // ─────────────────────────────────────────────────────────────────────────

    @GetMapping
    @PreAuthorize("hasAnyRole('VET_OFFICER', 'DISTRICT_OFFICER', 'STATE_OFFICER', 'ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Get all animals across all farms")
    public ResponseEntity<ApiResponse<PagedResponse<Animal>>> getAllAnimals(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                animalService.getAllAnimals(page, size)));
    }

    @GetMapping("/farm/{farmId}")
    @Operation(summary = "Get all animals on a specific farm")
    public ResponseEntity<ApiResponse<PagedResponse<Animal>>> getAnimalsByFarm(
            @PathVariable String farmId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                animalService.getAnimalsByFarm(farmId, page, size)));
    }

    @GetMapping("/farm/{farmId}/status/{status}")
    @Operation(summary = "Get animals on a farm filtered by status (ACTIVE, SOLD, DECEASED…)")
    public ResponseEntity<ApiResponse<PagedResponse<Animal>>> getByFarmAndStatus(
            @PathVariable String farmId,
            @PathVariable Animal.AnimalStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                animalService.getAnimalsByFarmAndStatus(farmId, status, page, size)));
    }

    @GetMapping("/farm/{farmId}/sick")
    @Operation(summary = "Get sick animals on a specific farm — accessible by farm owner too")
    public ResponseEntity<ApiResponse<PagedResponse<Animal>>> getSickByFarm(
            @PathVariable String farmId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                animalService.getAnimalsByFarmAndHealthStatus(farmId, Animal.HealthStatus.SICK, page, size)));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // READ — collections by species
    // ─────────────────────────────────────────────────────────────────────────

    @GetMapping("/species/{species}")
    @Operation(summary = "Get animals by species")
    public ResponseEntity<ApiResponse<PagedResponse<Animal>>> getBySpecies(
            @PathVariable Animal.AnimalSpecies species,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                animalService.getAnimalsBySpecies(species, page, size)));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // READ — global lists (privileged only)
    // ─────────────────────────────────────────────────────────────────────────

    @GetMapping("/sick")
    @PreAuthorize("hasAnyRole('VET_OFFICER', 'DISTRICT_OFFICER', 'STATE_OFFICER', 'ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Get all sick animals across all farms — privileged roles only")
    public ResponseEntity<ApiResponse<PagedResponse<Animal>>> getSickAnimals(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                animalService.getSickAnimals(page, size)));
    }

    @GetMapping("/pregnant")
    @Operation(summary = "Get all pregnant animals — any authenticated user")
    public ResponseEntity<ApiResponse<PagedResponse<Animal>>> getPregnantAnimals(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                animalService.getPregnantAnimals(page, size)));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // UPDATE
    // ─────────────────────────────────────────────────────────────────────────

    @PutMapping("/{animalId}")
    @Operation(summary = "Update full animal record")
    public ResponseEntity<ApiResponse<Animal>> updateAnimal(
            @PathVariable String animalId,
            @Valid @RequestBody AnimalRequest request,
            Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success("Animal updated",
                animalService.updateAnimal(animalId, request, auth.getName())));
    }

    @PatchMapping("/{animalId}/health-status")
    @Operation(summary = "Update animal health status")
    public ResponseEntity<ApiResponse<Animal>> updateHealthStatus(
            @PathVariable String animalId,
            @RequestParam Animal.HealthStatus healthStatus,
            Authentication auth) {
        // NOTE: Removed privileged-only restriction so farmers can mark their
        // own animals as recovered. If you need stricter control, re-add
        // @PreAuthorize and create a separate farmer-facing endpoint.
        return ResponseEntity.ok(ApiResponse.success("Health status updated",
                animalService.updateHealthStatus(animalId, healthStatus, auth.getName())));
    }

    @PatchMapping("/{animalId}/status")
    @Operation(summary = "Update animal status (ACTIVE, SOLD, DECEASED, TRANSFERRED…)")
    public ResponseEntity<ApiResponse<Animal>> updateAnimalStatus(
            @PathVariable String animalId,
            @RequestParam Animal.AnimalStatus status,
            Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success("Animal status updated",
                animalService.updateAnimalStatus(animalId, status, auth.getName())));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // VACCINATIONS
    // ─────────────────────────────────────────────────────────────────────────

    @PostMapping("/{animalId}/vaccinations")
    @PreAuthorize("hasAnyRole('VET_OFFICER', 'DISTRICT_OFFICER', 'STATE_OFFICER', 'ADMIN', 'SUPER_ADMIN')")
    @Operation(summary = "Add vaccination record — vet and admin roles only")
    public ResponseEntity<ApiResponse<Animal>> addVaccination(
            @PathVariable String animalId,
            @RequestBody Animal.VaccinationRecord record,
            Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Vaccination record added",
                        animalService.addVaccinationRecord(animalId, record, auth.getName())));
    }
}
