package com.dahd.farmportal.repository;

import com.dahd.farmportal.model.MrlTestRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface MrlTestRepository extends MongoRepository<MrlTestRecord, String> {

    Optional<MrlTestRecord> findByTestReferenceNumber(String testReferenceNumber);

    Page<MrlTestRecord> findByFarmId(String farmId, Pageable pageable);

    Page<MrlTestRecord> findByAnimalId(String animalId, Pageable pageable);

    Page<MrlTestRecord> findByOverallResult(MrlTestRecord.MrlTestResult result, Pageable pageable);

    Page<MrlTestRecord> findByStatus(MrlTestRecord.TestStatus status, Pageable pageable);

    Page<MrlTestRecord> findBySampleCollectionDateBetween(LocalDate from, LocalDate to, Pageable pageable);

    long countByOverallResult(MrlTestRecord.MrlTestResult result);

    long countByFarmIdAndOverallResult(String farmId, MrlTestRecord.MrlTestResult result);

    long countByStatus(MrlTestRecord.TestStatus status);
}
