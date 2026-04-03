package com.dahd.farmportal.dto.request;

import com.dahd.farmportal.model.MrlTestRecord;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class MrlTestRequest {

    @NotBlank(message = "Farm ID is required")
    private String farmId;

    private String animalId;

    @NotNull(message = "Sample type is required")
    private MrlTestRecord.SampleType sampleType;

    @NotBlank(message = "Sample ID is required")
    private String sampleId;

    @NotNull(message = "Sample collection date is required")
    @PastOrPresent
    private LocalDate sampleCollectionDate;

    @NotBlank(message = "Collected by is required")
    private String collectedBy;

    private String collectorDesignation;

    @NotBlank(message = "Lab name is required")
    private String labName;

    private String labAccreditationNumber;
    private String labState;
    private LocalDate sampleReceivedDate;
    private LocalDate testCompletedDate;

    @NotEmpty(message = "At least one residue parameter is required")
    @Valid
    private List<ResidueParameterRequest> residueParameters;

    private String remarks;

    @Data
    public static class ResidueParameterRequest {
        @NotBlank
        private String parameterName;
        private String category;
        private Double detectedValue;
        @NotBlank
        private String unit;
        private Double mrlLimit;
        private String mrlStandard;
    }
}
