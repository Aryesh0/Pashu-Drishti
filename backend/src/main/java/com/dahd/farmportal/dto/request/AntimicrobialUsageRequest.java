package com.dahd.farmportal.dto.request;

import com.dahd.farmportal.model.AntimicrobialUsage;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class AntimicrobialUsageRequest {

    @NotBlank(message = "Farm ID is required")
    private String farmId;

    private List<String> animalIds;

    @NotBlank(message = "Treatment description is required")
    private String treatmentDescription;

    @Min(value = 1, message = "At least 1 animal must be affected")
    private Integer numberOfAnimalsAffected;

    @NotBlank(message = "Diagnosis is required")
    private String diagnosis;

    private String diseaseCode;

    @NotBlank(message = "Prescribing vet ID is required")
    private String prescribingVetId;

    @NotBlank(message = "Prescribing vet name is required")
    private String prescribingVetName;

    @NotBlank(message = "Vet registration number is required")
    private String vetRegistrationNumber;

    private String vetContactNumber;

    @NotNull(message = "Prescription date is required")
    private LocalDate prescriptionDate;

    @NotEmpty(message = "At least one drug entry is required")
    @Valid
    private List<DrugEntryRequest> drugsUsed;

    @NotNull
    private LocalDate treatmentStartDate;
    private LocalDate treatmentEndDate;
    private LocalDate milkWithdrawalEndDate;
    private LocalDate meatWithdrawalEndDate;

    private boolean isEmergencyTreatment;
    private String emergencyJustification;

    @Data
    public static class DrugEntryRequest {
        @NotBlank(message = "Drug name is required")
        private String drugName;

        @NotBlank(message = "Active ingredient is required")
        private String activeIngredient;

        private AntimicrobialUsage.DrugClass drugClass;

        private String manufacturer;
        private String batchNumber;

        @NotBlank(message = "Dosage is required")
        private String dosage;

        private String unit;
        private String routeOfAdministration;

        @Min(value = 1)
        private Integer durationDays;

        @Min(value = 0)
        private Integer milkWithdrawalDays;

        @Min(value = 0)
        private Integer meatWithdrawalDays;

        private boolean criticallyImportantAntibiotic;
    }
}
