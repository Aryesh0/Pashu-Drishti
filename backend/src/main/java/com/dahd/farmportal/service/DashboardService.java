package com.dahd.farmportal.service;

import com.dahd.farmportal.dto.response.DashboardStatsResponse;
import com.dahd.farmportal.model.*;
import com.dahd.farmportal.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {

    private final FarmRepository farmRepository;
    private final AnimalRepository animalRepository;
    private final MrlTestRepository mrlTestRepository;
    private final AntimicrobialUsageRepository antimicrobialUsageRepository;
    private final UserRepository userRepository;

    public DashboardStatsResponse getAdminDashboardStats() {
        // Farm stats
        long totalFarms = farmRepository.count();
        long activeFarms = farmRepository.countByStatus(Farm.FarmStatus.ACTIVE);
        long pendingFarms = farmRepository.countByStatus(Farm.FarmStatus.PENDING_VERIFICATION);

        Map<String, Long> farmsByType = Arrays.stream(Farm.FarmType.values())
                .collect(Collectors.toMap(
                        Enum::name,
                        type -> farmRepository.countByFarmType(type),
                        (a, b) -> a,
                        LinkedHashMap::new
                ));

        // Animal stats
        long totalAnimals = animalRepository.count();
        long healthyAnimals = animalRepository.countByHealthStatus(Animal.HealthStatus.HEALTHY);
        long sickAnimals = animalRepository.countByHealthStatus(Animal.HealthStatus.SICK);
        long underTreatmentAnimals = animalRepository.countByHealthStatus(Animal.HealthStatus.UNDER_TREATMENT);

        Map<String, Long> animalsBySpecies = Arrays.stream(Animal.AnimalSpecies.values())
                .collect(Collectors.toMap(
                        Enum::name,
                        species -> animalRepository.countBySpecies(species),
                        (a, b) -> a,
                        LinkedHashMap::new
                ));

        // MRL stats
        long totalMrlTests = mrlTestRepository.count();
        long passedMrlTests = mrlTestRepository.countByOverallResult(MrlTestRecord.MrlTestResult.PASS);
        long failedMrlTests = mrlTestRepository.countByOverallResult(MrlTestRecord.MrlTestResult.FAIL);
        long pendingMrlTests = mrlTestRepository.countByStatus(MrlTestRecord.TestStatus.TESTING_IN_PROGRESS);
        double mrlPassRate = totalMrlTests > 0 ? (double) passedMrlTests / totalMrlTests * 100 : 0;

        // AMR stats
        long totalAmrUsages = antimicrobialUsageRepository.count();
        long criticalAmrUsages = antimicrobialUsageRepository
                .findByCriticallyImportantAntibioticUsage(PageRequest.of(0, 1)).getTotalElements();
        long activeWithdrawals = antimicrobialUsageRepository
                .findActiveWithdrawalPeriods(LocalDate.now(), PageRequest.of(0, 1)).getTotalElements();

        // User stats
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByActiveTrue();

        return DashboardStatsResponse.builder()
                .totalFarms(totalFarms)
                .activeFarms(activeFarms)
                .pendingVerificationFarms(pendingFarms)
                .farmsByType(farmsByType)
                .farmsByState(Map.of()) // Would be populated via aggregation query
                .totalAnimals(totalAnimals)
                .healthyAnimals(healthyAnimals)
                .sickAnimals(sickAnimals)
                .underTreatmentAnimals(underTreatmentAnimals)
                .animalsBySpecies(animalsBySpecies)
                .totalMrlTests(totalMrlTests)
                .passedMrlTests(passedMrlTests)
                .failedMrlTests(failedMrlTests)
                .pendingMrlTests(pendingMrlTests)
                .mrlPassRate(Math.round(mrlPassRate * 100.0) / 100.0)
                .totalAntimicrobialUsages(totalAmrUsages)
                .criticalAntibioticUsages(criticalAmrUsages)
                .activeWithdrawalPeriods(activeWithdrawals)
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .monthlyFarmRegistrations(getLastSixMonthsLabel())
                .monthlyMrlTests(getLastSixMonthsLabel())
                .monthlyAntimicrobialUsages(getLastSixMonthsLabel())
                .build();
    }

    private Map<String, Long> getLastSixMonthsLabel() {
        Map<String, Long> monthMap = new LinkedHashMap<>();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM yyyy");
        for (int i = 5; i >= 0; i--) {
            monthMap.put(LocalDate.now().minusMonths(i).format(fmt), 0L);
        }
        return monthMap;
    }
}
