package com.dahd.farmportal.dto.response;

import lombok.*;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {

    // Farm Stats
    private long totalFarms;
    private long activeFarms;
    private long pendingVerificationFarms;
    private Map<String, Long> farmsByType;
    private Map<String, Long> farmsByState;

    // Animal Stats
    private long totalAnimals;
    private long healthyAnimals;
    private long sickAnimals;
    private long underTreatmentAnimals;
    private Map<String, Long> animalsBySpecies;

    // MRL Testing Stats
    private long totalMrlTests;
    private long passedMrlTests;
    private long failedMrlTests;
    private long pendingMrlTests;
    private double mrlPassRate;

    // AMR Stats
    private long totalAntimicrobialUsages;
    private long criticalAntibioticUsages;
    private long activeWithdrawalPeriods;

    // User Stats
    private long totalUsers;
    private long activeUsers;

    // Monthly Trends (last 6 months)
    private Map<String, Long> monthlyFarmRegistrations;
    private Map<String, Long> monthlyMrlTests;
    private Map<String, Long> monthlyAntimicrobialUsages;
}
