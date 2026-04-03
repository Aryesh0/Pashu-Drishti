package com.dahd.farmportal.repository;

import com.dahd.farmportal.model.RfidScanLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface RfidScanLogRepository extends MongoRepository<RfidScanLog, String> {
    Page<RfidScanLog> findByRfidTagNumber(String rfidTagNumber, Pageable pageable);
    Page<RfidScanLog> findByAnimalId(String animalId, Pageable pageable);
    Page<RfidScanLog> findByFarmId(String farmId, Pageable pageable);
    Page<RfidScanLog> findByScannedAtBetween(LocalDateTime from, LocalDateTime to, Pageable pageable);
    long countByAnimalId(String animalId);
}