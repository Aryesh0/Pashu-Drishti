package com.dahd.farmportal.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "farms")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Farm {

    @Id
    private String id;

    @Indexed(unique = true)
    private String farmRegistrationNumber;

    private String farmName;
    private String ownerUserId;
    private String ownerName;
    private String ownerMobile;

    // Location
    private String stateCode;
    private String stateName;
    private String districtCode;
    private String districtName;
    private String blockCode;
    private String blockName;
    private String villageName;
    private String pincode;
    private Double latitude;
    private Double longitude;

    // Farm Details
    private FarmType farmType;
    private Double totalAreaAcres;
    private Integer totalAnimals;

    // Infrastructure
    private boolean hasDairyShed;
    private boolean hasMilkingParlor;
    private boolean hasBiogas;
    private boolean hasColdStorage;
    private boolean hasFodderStorage;

    // Certifications
    private List<String> certifications;
    private String gstNumber;

    private FarmStatus status;

    @CreatedDate
    private LocalDateTime registeredAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum FarmType {
        DAIRY, POULTRY, PIGGERY, GOAT, SHEEP, MIXED, AQUACULTURE, OTHERS
    }

    public enum FarmStatus {
        ACTIVE, INACTIVE, SUSPENDED, PENDING_VERIFICATION
    }
}
