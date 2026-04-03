package com.dahd.farmportal.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "antimicrobial_usage")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AntimicrobialUsage {

    @Id
    private String id;

    private String usageReferenceNumber;
    private String farmId;
    private String farmName;

    // Treated animals
    private List<String> animalIds;
    private String treatmentDescription;   // e.g., "Herd treatment for mastitis"
    private Integer numberOfAnimalsAffected;

    // Diagnosis
    private String diagnosis;
    private String diseaseCode;            // ICD-10 or veterinary code

    // Prescribing Veterinarian
    private String prescribingVetId;
    private String prescribingVetName;
    private String vetRegistrationNumber;
    private String vetContactNumber;
    private LocalDate prescriptionDate;
    private String prescriptionDocumentUrl;

    // Drug Details
    private List<DrugEntry> drugsUsed;

    // Treatment Period
    private LocalDate treatmentStartDate;
    private LocalDate treatmentEndDate;

    // Withdrawal Period
    private LocalDate milkWithdrawalEndDate;
    private LocalDate meatWithdrawalEndDate;
    private boolean withdrawalPeriodComplete;

    // Outcome
    private TreatmentOutcome outcome;
    private String outcomeNotes;

    private boolean isEmergencyTreatment;
    private String emergencyJustification;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DrugEntry {
        private String drugName;
        private String activeIngredient;
        private DrugClass drugClass;
        private String manufacturer;
        private String batchNumber;
        private String dosage;
        private String unit;                // mg/kg, ml, tablets
        private String routeOfAdministration; // Oral / IM / IV / Topical
        private Integer durationDays;
        private Integer milkWithdrawalDays;
        private Integer meatWithdrawalDays;
        private boolean criticallyImportantAntibiotic;  // WHO CIA classification
    }

    public enum DrugClass {
        AMINOGLYCOSIDES, BETA_LACTAMS, CEPHALOSPORINS, FLUOROQUINOLONES,
        MACROLIDES, TETRACYCLINES, SULFONAMIDES, POLYMYXINS, OTHERS
    }

    public enum TreatmentOutcome {
        RECOVERED, IMPROVED, NO_CHANGE, DETERIORATED, DIED, ONGOING
    }
}
