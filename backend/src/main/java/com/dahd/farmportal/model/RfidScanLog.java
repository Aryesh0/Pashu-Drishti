package com.dahd.farmportal.model;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "rfid_scan_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RfidScanLog {

    @Id
    private String id;

    private String rfidTagNumber;
    private String animalId;
    private String animalTagNumber;
    private String farmId;
    private String farmName;

    private String scanLocation;
    private String scanDeviceId;
    private String scannedByUserId;

    private Double latitude;
    private Double longitude;

    private ScanPurpose scanPurpose;  // IDENTIFICATION, HEALTH_CHECK, MOVEMENT
    private boolean animalFound;      // false if unknown tag scanned
    private String notes;

    @CreatedDate
    private LocalDateTime scannedAt;

    public enum ScanPurpose {
        IDENTIFICATION,
        HEALTH_CHECK,
        MOVEMENT_TRACKING,
        VACCINATION,
        MILKING,
        FEEDING,
        UNKNOWN
    }
}