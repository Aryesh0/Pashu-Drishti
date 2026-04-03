package com.dahd.farmportal.service;

import com.dahd.farmportal.dto.request.RfidScanRequest;
import com.dahd.farmportal.dto.response.PagedResponse;
import com.dahd.farmportal.exception.ResourceNotFoundException;
import com.dahd.farmportal.model.Animal;
import com.dahd.farmportal.model.RfidScanLog;
import com.dahd.farmportal.repository.AnimalRepository;
import com.dahd.farmportal.repository.RfidScanLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class RfidService {

    private final AnimalRepository animalRepository;
    private final RfidScanLogRepository rfidScanLogRepository;

    // Called when a scanner scans a tag
    public Map<String, Object> processScan(RfidScanRequest request) {
        Map<String, Object> result = new HashMap<>();

        // Look up animal by RFID tag number
        Optional<Animal> animalOpt = animalRepository.findByRfidTagNumber(
                request.getRfidTagNumber());

        // Also try matching against regular tagNumber as fallback
        if (animalOpt.isEmpty()) {
            animalOpt = animalRepository.findByTagNumber(request.getRfidTagNumber());
        }

        boolean found = animalOpt.isPresent();

        // Log the scan regardless of whether animal was found
        RfidScanLog scanLog = RfidScanLog.builder()
                .rfidTagNumber(request.getRfidTagNumber())
                .animalId(found ? animalOpt.get().getId() : null)
                .animalTagNumber(found ? animalOpt.get().getTagNumber() : null)
                .farmId(found ? animalOpt.get().getFarmId() : null)
                .farmName(found ? animalOpt.get().getFarmName() : null)
                .scanLocation(request.getScanLocation())
                .scanDeviceId(request.getScanDeviceId())
                .scannedByUserId(request.getScannedByUserId())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .animalFound(found)
                .scanPurpose(RfidScanLog.ScanPurpose.IDENTIFICATION)
                .build();

        rfidScanLogRepository.save(scanLog);

        if (found) {
            Animal animal = animalOpt.get();

            // Update last scan time on animal
            animal.setLastRfidScanTime(LocalDateTime.now());
            animal.setLastRfidScanLocation(request.getScanLocation());
            animalRepository.save(animal);

            result.put("found", true);
            result.put("animal", animal);
            result.put("scanLogId", scanLog.getId());
            log.info("RFID scan matched animal: {}", animal.getTagNumber());
        } else {
            result.put("found", false);
            result.put("message", "No animal found for RFID tag: "
                    + request.getRfidTagNumber());
            result.put("scanLogId", scanLog.getId());
            log.warn("RFID scan - unknown tag: {}", request.getRfidTagNumber());
        }

        return result;
    }

    public Animal assignRfidTag(String animalId, String rfidTagNumber,
                                 String tagType, String taggedBy) {
        Animal animal = animalRepository.findById(animalId)
                .orElseThrow(() -> new ResourceNotFoundException("Animal", "id", animalId));

        animal.setRfidTagNumber(rfidTagNumber);
        animal.setRfidTagType(tagType);
        animal.setRfidTaggedDate(java.time.LocalDate.now());
        animal.setRfidTaggedBy(taggedBy);
        animal.setRfidActive(true);

        return animalRepository.save(animal);
    }

    public PagedResponse<RfidScanLog> getScanHistory(String animalId, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by("scannedAt").descending());
        return PagedResponse.of(rfidScanLogRepository.findByAnimalId(animalId, pageable));
    }

    public PagedResponse<RfidScanLog> getFarmScanHistory(String farmId, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by("scannedAt").descending());
        return PagedResponse.of(rfidScanLogRepository.findByFarmId(farmId, pageable));
    }
}