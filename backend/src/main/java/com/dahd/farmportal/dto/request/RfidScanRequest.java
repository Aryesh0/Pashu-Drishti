package com.dahd.farmportal.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RfidScanRequest {

    @NotBlank(message = "RFID tag number is required")
    private String rfidTagNumber;

    private String scanLocation;      // e.g., "Farm Gate", "Milking Parlor"
    private String scanDeviceId;      // ID of the scanner device
    private String scannedByUserId;
    private Double latitude;          // GPS of scan location
    private Double longitude;
}