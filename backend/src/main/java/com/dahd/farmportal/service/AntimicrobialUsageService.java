package com.dahd.farmportal.service;

import com.dahd.farmportal.dto.request.AntimicrobialUsageRequest;
import com.dahd.farmportal.dto.response.PagedResponse;
import com.dahd.farmportal.exception.ResourceNotFoundException;
import com.dahd.farmportal.model.AntimicrobialUsage;
import com.dahd.farmportal.model.Farm;
import com.dahd.farmportal.repository.AntimicrobialUsageRepository;
import com.dahd.farmportal.repository.FarmRepository;
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
public class AntimicrobialUsageService {

    private final AntimicrobialUsageRepository repository;
    private final FarmRepository farmRepository;
    private final AuditService auditService;

    public AntimicrobialUsage recordUsage(AntimicrobialUsageRequest request, String actorUsername) {
        Farm farm = farmRepository.findById(request.getFarmId())
                .orElseThrow(() -> new ResourceNotFoundException("Farm", "id", request.getFarmId()));

        List<AntimicrobialUsage.DrugEntry> drugs = request.getDrugsUsed().stream()
                .map(d -> AntimicrobialUsage.DrugEntry.builder()
                        .drugName(d.getDrugName())
                        .activeIngredient(d.getActiveIngredient())
                        .drugClass(d.getDrugClass())
                        .manufacturer(d.getManufacturer())
                        .batchNumber(d.getBatchNumber())
                        .dosage(d.getDosage())
                        .unit(d.getUnit())
                        .routeOfAdministration(d.getRouteOfAdministration())
                        .durationDays(d.getDurationDays())
                        .milkWithdrawalDays(d.getMilkWithdrawalDays())
                        .meatWithdrawalDays(d.getMeatWithdrawalDays())
                        .criticallyImportantAntibiotic(d.isCriticallyImportantAntibiotic())
                        .build())
                .collect(Collectors.toList());

        int maxDuration = drugs.stream()
                .map(AntimicrobialUsage.DrugEntry::getDurationDays)
                .filter(java.util.Objects::nonNull)
                .max(Integer::compareTo)
                .orElse(0);

        int maxMilkWithdrawal = drugs.stream()
                .map(AntimicrobialUsage.DrugEntry::getMilkWithdrawalDays)
                .filter(java.util.Objects::nonNull)
                .max(Integer::compareTo)
                .orElse(0);

        int maxMeatWithdrawal = drugs.stream()
                .map(AntimicrobialUsage.DrugEntry::getMeatWithdrawalDays)
                .filter(java.util.Objects::nonNull)
                .max(Integer::compareTo)
                .orElse(0);

        LocalDate treatmentEndDate = request.getTreatmentEndDate() != null
                ? request.getTreatmentEndDate()
                : request.getTreatmentStartDate().plusDays(Math.max(maxDuration - 1L, 0L));

        LocalDate milkWithdrawalEndDate = request.getMilkWithdrawalEndDate() != null
                ? request.getMilkWithdrawalEndDate()
                : (maxMilkWithdrawal > 0 ? treatmentEndDate.plusDays(maxMilkWithdrawal) : null);

        LocalDate meatWithdrawalEndDate = request.getMeatWithdrawalEndDate() != null
                ? request.getMeatWithdrawalEndDate()
                : (maxMeatWithdrawal > 0 ? treatmentEndDate.plusDays(maxMeatWithdrawal) : null);

        AntimicrobialUsage usage = AntimicrobialUsage.builder()
                .usageReferenceNumber(generateReferenceNumber())
                .farmId(request.getFarmId())
                .farmName(farm.getFarmName())
                .animalIds(request.getAnimalIds())
                .treatmentDescription(request.getTreatmentDescription())
                .numberOfAnimalsAffected(request.getNumberOfAnimalsAffected())
                .diagnosis(request.getDiagnosis())
                .diseaseCode(request.getDiseaseCode())
                .prescribingVetId(request.getPrescribingVetId())
                .prescribingVetName(request.getPrescribingVetName())
                .vetRegistrationNumber(request.getVetRegistrationNumber())
                .vetContactNumber(request.getVetContactNumber())
                .prescriptionDate(request.getPrescriptionDate())
                .drugsUsed(drugs)
                .treatmentStartDate(request.getTreatmentStartDate())
                .treatmentEndDate(treatmentEndDate)
                .milkWithdrawalEndDate(milkWithdrawalEndDate)
                .meatWithdrawalEndDate(meatWithdrawalEndDate)
                .withdrawalPeriodComplete(milkWithdrawalEndDate == null && meatWithdrawalEndDate == null)
                .isEmergencyTreatment(request.isEmergencyTreatment())
                .emergencyJustification(request.getEmergencyJustification())
                .outcome(AntimicrobialUsage.TreatmentOutcome.ONGOING)
                .build();

        usage = repository.save(usage);
        log.info("AMR usage recorded: {} for farm {}", usage.getUsageReferenceNumber(), usage.getFarmId());
        auditService.log(null, actorUsername, "CREATE", "AntimicrobialUsage", usage.getId(),
                "AMR usage recorded: " + usage.getUsageReferenceNumber(), null, true, null);
        return usage;
    }

    public AntimicrobialUsage getById(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AntimicrobialUsage", "id", id));
    }

    public PagedResponse<AntimicrobialUsage> getAllUsages(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return PagedResponse.of(repository.findAll(pageable));
    }

    public PagedResponse<AntimicrobialUsage> getUsagesByFarm(String farmId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return PagedResponse.of(repository.findByFarmId(farmId, pageable));
    }

    public PagedResponse<AntimicrobialUsage> getCriticalAntibioticUsages(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return PagedResponse.of(repository.findByCriticallyImportantAntibioticUsage(pageable));
    }

    public PagedResponse<AntimicrobialUsage> getActiveWithdrawalPeriods(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return PagedResponse.of(repository.findActiveWithdrawalPeriods(LocalDate.now(), pageable));
    }

    public AntimicrobialUsage updateOutcome(String id, AntimicrobialUsage.TreatmentOutcome outcome,
                                             String notes, String actorUsername) {
        AntimicrobialUsage usage = getById(id);
        usage.setOutcome(outcome);
        usage.setOutcomeNotes(notes);
        AntimicrobialUsage updated = repository.save(usage);
        auditService.log(null, actorUsername, "UPDATE", "AntimicrobialUsage", id,
                "Treatment outcome updated to: " + outcome, null, true, null);
        return updated;
    }

    public AntimicrobialUsage markWithdrawalComplete(String id, String actorUsername) {
        AntimicrobialUsage usage = getById(id);
        usage.setWithdrawalPeriodComplete(true);
        return repository.save(usage);
    }

    private String generateReferenceNumber() {
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMM"));
        String random = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return "AMR-" + date + "-" + random;
    }
}
