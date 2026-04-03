package com.dahd.farmportal.repository;

import com.dahd.farmportal.model.AntimicrobialUsage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface AntimicrobialUsageRepository extends MongoRepository<AntimicrobialUsage, String> {

    Page<AntimicrobialUsage> findByFarmId(String farmId, Pageable pageable);

    Page<AntimicrobialUsage> findByPrescribingVetId(String vetId, Pageable pageable);

    Page<AntimicrobialUsage> findByTreatmentStartDateBetween(LocalDate from, LocalDate to, Pageable pageable);

    @Query("{ 'drugsUsed.criticallyImportantAntibiotic': true }")
    Page<AntimicrobialUsage> findByCriticallyImportantAntibioticUsage(Pageable pageable);

    @Query("{ 'milkWithdrawalEndDate': { $gte: ?0 }, 'withdrawalPeriodComplete': false }")
    Page<AntimicrobialUsage> findActiveWithdrawalPeriods(LocalDate today, Pageable pageable);

    long countByFarmId(String farmId);

    long countByOutcome(AntimicrobialUsage.TreatmentOutcome outcome);
}
