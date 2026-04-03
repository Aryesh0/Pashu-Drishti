package com.dahd.farmportal.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "mrl_tests")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MrlTestRecord {

    @Id
    private String id;

    private String testReferenceNumber;
    private String farmId;
    private String farmName;
    private String animalId;        // optional, null for bulk/herd samples

    // Sample Details
    private SampleType sampleType;
    private String sampleId;
    private LocalDate sampleCollectionDate;
    private String collectedBy;
    private String collectorDesignation;

    // Lab Details
    private String labName;
    private String labAccreditationNumber;
    private String labState;
    private LocalDate sampleReceivedDate;
    private LocalDate testCompletedDate;

    // Test Parameters
    private List<ResidueParameter> residueParameters;

    // Result
    private MrlTestResult overallResult;
    private String remarks;
    private String labReportUrl;       // Stored file reference

    // Action taken if failed
    private String actionTaken;
    private LocalDate actionDate;
    private String actionTakenBy;

    private TestStatus status;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResidueParameter {
        private String parameterName;       // e.g., Oxytetracycline, Aflatoxin M1
        private String category;            // Antibiotic / Pesticide / Heavy Metal / Mycotoxin
        private Double detectedValue;
        private String unit;                // ppb, ppm, µg/kg
        private Double mrlLimit;            // Maximum Residue Limit as per FSSAI / Codex
        private String mrlStandard;         // FSSAI / Codex / EU
        private boolean withinLimit;
    }

    public enum SampleType {
        MILK, MEAT, EGG, BLOOD, URINE, FEED, WATER, MANURE
    }

    public enum MrlTestResult {
        PASS, FAIL, MARGINAL, INCONCLUSIVE
    }

    public enum TestStatus {
        SAMPLE_COLLECTED, LAB_RECEIVED, TESTING_IN_PROGRESS, COMPLETED, REPORT_DISPATCHED
    }
}
