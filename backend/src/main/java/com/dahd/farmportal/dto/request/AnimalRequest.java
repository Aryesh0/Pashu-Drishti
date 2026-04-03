package com.dahd.farmportal.dto.request;
import com.dahd.farmportal.model.Animal;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

@Data
public class AnimalRequest {
    @NotBlank(message = "Tag number (ICAR) is required")
    private String tagNumber;

    @NotBlank(message = "Farm ID is required")
    private String farmId;

    @NotNull(message = "Species is required")
    private Animal.AnimalSpecies species;

    @NotBlank(message = "Breed is required")
    private String breed;

    private String name;

    @NotNull(message = "Gender is required")
    private Animal.Gender gender;

    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;

    private String colorMarkings;
    private String purpose;
    private String bodyConditionScore;
    private String notes;
    private String sourceType;
    private String sourceFarmId;

    @PastOrPresent(message = "Acquisition date cannot be in the future")
    private LocalDate acquisitionDate;

    @DecimalMin(value = "0.1", message = "Weight must be positive")
    private Double bodyWeightKg;

    private Animal.HealthStatus healthStatus;

    private String insurancePolicyNumber;
    private String insuranceCompany;
    private LocalDate insuranceValidTill;

    // ── Pregnancy & dairy fields ──────────────────────
    private Boolean isPregnant;
    private LocalDate expectedDeliveryDate;
    private LocalDate lastCalvingDate;
   private Double averageDailyMilkLitres;
}
