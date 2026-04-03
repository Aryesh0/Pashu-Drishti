package com.dahd.farmportal.service;

import com.dahd.farmportal.dto.request.FarmRequest;
import com.dahd.farmportal.dto.response.PagedResponse;
import com.dahd.farmportal.exception.ResourceNotFoundException;
import com.dahd.farmportal.model.Farm;
import com.dahd.farmportal.repository.FarmRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class FarmService {

    private final FarmRepository farmRepository;
    private final AuditService auditService;

    public Farm registerFarm(FarmRequest request, String ownerUserId, String actorUsername) {
        String regNumber = generateRegistrationNumber(request.getStateCode(), request.getDistrictCode());

        if (farmRepository.existsByFarmRegistrationNumber(regNumber)) {
            regNumber = regNumber + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        }

        Farm farm = Farm.builder()
                .farmRegistrationNumber(regNumber)
                .farmName(request.getFarmName())
                .ownerUserId(ownerUserId)
                .ownerName(request.getOwnerName())
                .ownerMobile(request.getOwnerMobile())
                .stateCode(request.getStateCode())
                .stateName(request.getStateName())
                .districtCode(request.getDistrictCode())
                .districtName(request.getDistrictName())
                .blockCode(request.getBlockCode())
                .blockName(request.getBlockName())
                .villageName(request.getVillageName())
                .pincode(request.getPincode())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .farmType(request.getFarmType())
                .totalAreaAcres(request.getTotalAreaAcres())
                .hasDairyShed(request.isHasDairyShed())
                .hasMilkingParlor(request.isHasMilkingParlor())
                .hasBiogas(request.isHasBiogas())
                .hasColdStorage(request.isHasColdStorage())
                .hasFodderStorage(request.isHasFodderStorage())
                .certifications(request.getCertifications())
                .gstNumber(request.getGstNumber())
                .status(Farm.FarmStatus.PENDING_VERIFICATION)
                .build();

        farm = farmRepository.save(farm);
        log.info("Farm registered: {} by user {}", farm.getFarmRegistrationNumber(), actorUsername);
        auditService.log(null, actorUsername, "CREATE", "Farm", farm.getId(),
                "Farm registered: " + farm.getFarmRegistrationNumber(), null, true, null);
        return farm;
    }

    public Farm getFarmById(String farmId) {
        return farmRepository.findById(farmId)
                .orElseThrow(() -> new ResourceNotFoundException("Farm", "id", farmId));
    }

    public Farm getFarmByRegNumber(String regNumber) {
        return farmRepository.findByFarmRegistrationNumber(regNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Farm", "registrationNumber", regNumber));
    }

    public PagedResponse<Farm> getAllFarms(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("registeredAt").descending());
        Page<Farm> farms = farmRepository.findAll(pageable);
        return PagedResponse.of(farms);
    }

    public PagedResponse<Farm> getFarmsByOwner(String ownerUserId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("registeredAt").descending());
        Page<Farm> farms = farmRepository.findByOwnerUserId(ownerUserId, pageable);
        return PagedResponse.of(farms);
    }

    public PagedResponse<Farm> getFarmsByState(String stateCode, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("registeredAt").descending());
        return PagedResponse.of(farmRepository.findByStateCode(stateCode, pageable));
    }

    public PagedResponse<Farm> getFarmsByDistrict(String districtCode, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("registeredAt").descending());
        return PagedResponse.of(farmRepository.findByDistrictCode(districtCode, pageable));
    }

    public PagedResponse<Farm> searchFarms(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return PagedResponse.of(farmRepository.searchByFarmName(keyword, pageable));
    }

    public Farm updateFarm(String farmId, FarmRequest request, String actorUsername) {
        Farm farm = getFarmById(farmId);

        farm.setFarmName(request.getFarmName());
        farm.setOwnerName(request.getOwnerName());
        farm.setOwnerMobile(request.getOwnerMobile());
        farm.setVillageName(request.getVillageName());
        farm.setPincode(request.getPincode());
        farm.setLatitude(request.getLatitude());
        farm.setLongitude(request.getLongitude());
        farm.setFarmType(request.getFarmType());
        farm.setTotalAreaAcres(request.getTotalAreaAcres());
        farm.setHasDairyShed(request.isHasDairyShed());
        farm.setHasMilkingParlor(request.isHasMilkingParlor());
        farm.setHasBiogas(request.isHasBiogas());
        farm.setHasColdStorage(request.isHasColdStorage());
        farm.setHasFodderStorage(request.isHasFodderStorage());
        farm.setCertifications(request.getCertifications());
        farm.setGstNumber(request.getGstNumber());

        Farm updated = farmRepository.save(farm);
        auditService.log(null, actorUsername, "UPDATE", "Farm", farmId,
                "Farm updated: " + farmId, null, true, null);
        return updated;
    }

    public Farm updateFarmStatus(String farmId, Farm.FarmStatus status, String actorUsername) {
        Farm farm = getFarmById(farmId);
        farm.setStatus(status);
        Farm updated = farmRepository.save(farm);
        auditService.log(null, actorUsername, "UPDATE", "Farm", farmId,
                "Farm status changed to: " + status, null, true, null);
        return updated;
    }

    public void deleteFarm(String farmId, String actorUsername) {
        Farm farm = getFarmById(farmId);
        farmRepository.delete(farm);
        auditService.log(null, actorUsername, "DELETE", "Farm", farmId,
                "Farm deleted: " + farmId, null, true, null);
    }

    private String generateRegistrationNumber(String stateCode, String districtCode) {
        String year = String.valueOf(java.time.Year.now().getValue()).substring(2);
        String seq = String.format("%06d", (long)(Math.random() * 900000) + 100000);
        return "FRM-" + stateCode.toUpperCase() + "-" + districtCode.toUpperCase() + "-" + year + seq;
    }
}
