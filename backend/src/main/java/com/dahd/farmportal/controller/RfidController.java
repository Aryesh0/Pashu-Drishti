package com.dahd.farmportal.controller;

import com.dahd.farmportal.dto.request.RfidScanRequest;
import com.dahd.farmportal.dto.response.ApiResponse;
import com.dahd.farmportal.dto.response.PagedResponse;
import com.dahd.farmportal.model.Animal;
import com.dahd.farmportal.model.RfidScanLog;
import com.dahd.farmportal.service.RfidService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/rfid")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "RFID Management",
     description = "RFID tag scanning, assignment and history tracking")
public class RfidController {

    private final RfidService rfidService;

    @PostMapping("/scan")
    @Operation(summary = "Process an RFID scan from a reader device")
    public ResponseEntity<ApiResponse<Map<String, Object>>> processScan(
            @Valid @RequestBody RfidScanRequest request) {
        Map<String, Object> result = rfidService.processScan(request);
        boolean found = (boolean) result.get("found");
        return ResponseEntity.ok(ApiResponse.success(
                found ? "Animal identified successfully" : "Unknown RFID tag",
                result));
    }

    @PostMapping("/assign/{animalId}")
    @Operation(summary = "Assign an RFID tag to an animal")
    public ResponseEntity<ApiResponse<Animal>> assignTag(
            @PathVariable String animalId,
            @RequestBody Map<String, String> body,
            Authentication auth) {
        Animal animal = rfidService.assignRfidTag(
                animalId,
                body.get("rfidTagNumber"),
                body.get("tagType"),
                auth.getName()
        );
        return ResponseEntity.ok(ApiResponse.success("RFID tag assigned", animal));
    }

    @GetMapping("/history/animal/{animalId}")
    @Operation(summary = "Get RFID scan history for an animal")
    public ResponseEntity<ApiResponse<PagedResponse<RfidScanLog>>> getAnimalHistory(
            @PathVariable String animalId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                rfidService.getScanHistory(animalId, page, size)));
    }

    @GetMapping("/history/farm/{farmId}")
    @Operation(summary = "Get all RFID scans for a farm")
    public ResponseEntity<ApiResponse<PagedResponse<RfidScanLog>>> getFarmHistory(
            @PathVariable String farmId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                rfidService.getFarmScanHistory(farmId, page, size)));
    }
}