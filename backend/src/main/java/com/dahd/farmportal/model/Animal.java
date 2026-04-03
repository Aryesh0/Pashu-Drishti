package com.dahd.farmportal.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "animals")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Animal {

    @Id
    private String id;

    private String tagNumber;           // ICAR tag number
    private String farmId;
    private String farmName;

    // Identity
    private AnimalSpecies species;
    private String breed;
    private String name;
    private Gender gender;
    private LocalDate dateOfBirth;
    private String colorMarkings;
    private String purpose;
    private String bodyConditionScore;
    private String notes;

    // Origin
    private String sourceType;          // Born on farm / Purchased / Government
    private String sourceFarmId;
    private LocalDate acquisitionDate;

    // Health
    private HealthStatus healthStatus;
    private Double bodyWeightKg;
    private LocalDate lastWeightRecordedOn;

    // Reproduction (for females)
    private Integer numberOfCalvings;
    private LocalDate lastCalvingDate;
    private Boolean isPregnant;
    private LocalDate expectedDeliveryDate;

    // Milk Production (if dairy)
    private Double averageDailyMilkLitres;

    // Vaccination
    private List<VaccinationRecord> vaccinationHistory;

    // Insurance
    private String insurancePolicyNumber;
    private String insuranceCompany;
    private LocalDate insuranceValidTill;
    private String rfidTagNumber;        // The actual RFID chip number
    private String rfidTagType;          // EAR_TAG, BOLUS, ANKLET
    private LocalDate rfidTaggedDate;
    private String rfidTaggedBy;
    private boolean rfidActive;
    private LocalDateTime lastRfidScanTime;
    private String lastRfidScanLocation;

    private AnimalStatus status;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VaccinationRecord {
        private String vaccineName;
        private String disease;
        private LocalDate vaccinationDate;
        private LocalDate nextDueDate;
        private String administeredBy;
        private String batchNumber;
    }

    public enum AnimalSpecies {
        COW, BUFFALO, GOAT, SHEEP, PIG, POULTRY, HORSE, CAMEL, RABBIT, OTHERS
    }

    public enum Gender {
        MALE, FEMALE
    }

    public enum HealthStatus {
        HEALTHY, SICK, UNDER_TREATMENT, QUARANTINED, RECOVERED
    }

    public enum AnimalStatus {
        ACTIVE, SOLD, DIED, SLAUGHTERED, TRANSFERRED
    }
}
