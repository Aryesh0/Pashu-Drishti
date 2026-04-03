package com.dahd.farmportal.service;

import com.dahd.farmportal.dto.request.MrlTestRequest;
import com.dahd.farmportal.dto.response.PagedResponse;
import com.dahd.farmportal.exception.ResourceNotFoundException;
import com.dahd.farmportal.model.Farm;
import com.dahd.farmportal.model.MrlTestRecord;
import com.dahd.farmportal.repository.FarmRepository;
import com.dahd.farmportal.repository.MrlTestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MrlTestService {

    private final MrlTestRepository mrlTestRepository;
    private final FarmRepository farmRepository;
    private final AuditService auditService;

    public MrlTestRecord createTestRecord(MrlTestRequest request, String actorUsername) {
        Farm farm = farmRepository.findById(request.getFarmId())
                .orElseThrow(() -> new ResourceNotFoundException("Farm", "id", request.getFarmId()));

        List<MrlTestRecord.ResidueParameter> params = request.getResidueParameters().stream()
                .map(p -> {
                    boolean withinLimit = p.getDetectedValue() != null && p.getMrlLimit() != null
                            && p.getDetectedValue() <= p.getMrlLimit();
                    return MrlTestRecord.ResidueParameter.builder()
                            .parameterName(p.getParameterName())
                            .category(p.getCategory())
                            .detectedValue(p.getDetectedValue())
                            .unit(p.getUnit())
                            .mrlLimit(p.getMrlLimit())
                            .mrlStandard(p.getMrlStandard())
                            .withinLimit(withinLimit)
                            .build();
                }).collect(Collectors.toList());

        MrlTestRecord.MrlTestResult overallResult = params.stream().allMatch(MrlTestRecord.ResidueParameter::isWithinLimit)
                ? MrlTestRecord.MrlTestResult.PASS
                : MrlTestRecord.MrlTestResult.FAIL;

        MrlTestRecord record = MrlTestRecord.builder()
                .testReferenceNumber(generateTestReferenceNumber())
                .farmId(request.getFarmId())
                .farmName(farm.getFarmName())
                .animalId(request.getAnimalId())
                .sampleType(request.getSampleType())
                .sampleId(request.getSampleId())
                .sampleCollectionDate(request.getSampleCollectionDate())
                .collectedBy(request.getCollectedBy())
                .collectorDesignation(request.getCollectorDesignation())
                .labName(request.getLabName())
                .labAccreditationNumber(request.getLabAccreditationNumber())
                .labState(request.getLabState())
                .sampleReceivedDate(request.getSampleReceivedDate())
                .testCompletedDate(request.getTestCompletedDate())
                .residueParameters(params)
                .overallResult(overallResult)
                .remarks(request.getRemarks())
                .status(MrlTestRecord.TestStatus.SAMPLE_COLLECTED)
                .build();

        record = mrlTestRepository.save(record);
        auditService.log(null, actorUsername, "CREATE", "MrlTestRecord", record.getId(),
                "MRL test record created: " + record.getTestReferenceNumber(), null, true, null);
        return record;
    }

    public MrlTestRecord getById(String id) {
        return mrlTestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MrlTestRecord", "id", id));
    }

    public MrlTestRecord getByReferenceNumber(String refNumber) {
        return mrlTestRepository.findByTestReferenceNumber(refNumber)
                .orElseThrow(() -> new ResourceNotFoundException("MrlTestRecord", "referenceNumber", refNumber));
    }

    public PagedResponse<MrlTestRecord> getAllTests(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return PagedResponse.of(mrlTestRepository.findAll(pageable));
    }

    public PagedResponse<MrlTestRecord> getTestsByFarm(String farmId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return PagedResponse.of(mrlTestRepository.findByFarmId(farmId, pageable));
    }

    public PagedResponse<MrlTestRecord> getFailedTests(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return PagedResponse.of(mrlTestRepository.findByOverallResult(MrlTestRecord.MrlTestResult.FAIL, pageable));
    }

    public PagedResponse<MrlTestRecord> getTestsByDateRange(LocalDate from, LocalDate to, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("sampleCollectionDate").descending());
        return PagedResponse.of(mrlTestRepository.findBySampleCollectionDateBetween(from, to, pageable));
    }

    public MrlTestRecord updateTestStatus(String id, MrlTestRecord.TestStatus status, String actorUsername) {
        MrlTestRecord record = getById(id);
        record.setStatus(status);
        MrlTestRecord updated = mrlTestRepository.save(record);
        auditService.log(null, actorUsername, "UPDATE", "MrlTestRecord", id,
                "MRL test status updated to: " + status, null, true, null);
        return updated;
    }

    public MrlTestRecord updateActionTaken(String id, String action, String actionBy, String actorUsername) {
        MrlTestRecord record = getById(id);
        record.setActionTaken(action);
        record.setActionDate(LocalDate.now());
        record.setActionTakenBy(actionBy);
        return mrlTestRepository.save(record);
    }

    private String generateTestReferenceNumber() {
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String random = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return "MRL-" + date + "-" + random;
    }
}
