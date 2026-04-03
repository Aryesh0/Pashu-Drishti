package com.dahd.farmportal.dto.request;

import com.dahd.farmportal.model.Farm;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.List;

@Data
public class FarmRequest {

    @NotBlank(message = "Farm name is required")
    @Size(min = 2, max = 150)
    private String farmName;

    @NotBlank(message = "Owner name is required")
    private String ownerName;

    @NotBlank(message = "Owner mobile is required")
    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid Indian mobile number")
    private String ownerMobile;

    @NotBlank(message = "State code is required")
    private String stateCode;

    @NotBlank(message = "State name is required")
    private String stateName;

    @NotBlank(message = "District code is required")
    private String districtCode;

    @NotBlank(message = "District name is required")
    private String districtName;

    private String blockCode;
    private String blockName;
    private String villageName;

    @Pattern(regexp = "^[1-9][0-9]{5}$", message = "Invalid pincode")
    private String pincode;

    @DecimalMin("-90.0") @DecimalMax("90.0")
    private Double latitude;

    @DecimalMin("-180.0") @DecimalMax("180.0")
    private Double longitude;

    @NotNull(message = "Farm type is required")
    private Farm.FarmType farmType;

    @DecimalMin(value = "0.01", message = "Area must be positive")
    private Double totalAreaAcres;

    private boolean hasDairyShed;
    private boolean hasMilkingParlor;
    private boolean hasBiogas;
    private boolean hasColdStorage;
    private boolean hasFodderStorage;

    private List<String> certifications;
    private String gstNumber;
}
