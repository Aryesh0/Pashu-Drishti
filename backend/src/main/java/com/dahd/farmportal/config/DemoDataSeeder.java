package com.dahd.farmportal.config;

import com.dahd.farmportal.model.Animal;
import com.dahd.farmportal.model.AntimicrobialUsage;
import com.dahd.farmportal.model.Farm;
import com.dahd.farmportal.model.MrlTestRecord;
import com.dahd.farmportal.model.User;
import com.dahd.farmportal.repository.AnimalRepository;
import com.dahd.farmportal.repository.AntimicrobialUsageRepository;
import com.dahd.farmportal.repository.FarmRepository;
import com.dahd.farmportal.repository.MrlTestRepository;
import com.dahd.farmportal.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class DemoDataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final FarmRepository farmRepository;
    private final AnimalRepository animalRepository;
    private final MrlTestRepository mrlTestRepository;
    private final AntimicrobialUsageRepository antimicrobialUsageRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedUser("vet_demo", "vet@demo.in", "Vet@12345", "Dr. Meera Kulkarni",
                "9876501234", Set.of(User.Role.ROLE_VET_OFFICER), "MH", "PUN");
        seedUser("district_demo", "district@demo.in", "District@123", "Pune District Officer",
                "9876505678", Set.of(User.Role.ROLE_DISTRICT_OFFICER), "MH", "PUN");
        seedUser("state_demo", "state@demo.in", "State@12345", "Maharashtra State Officer",
                "9876512345", Set.of(User.Role.ROLE_STATE_OFFICER), "MH", null);
        seedDemoOperations();
    }

    private void seedUser(String username, String email, String password, String fullName,
                          String mobileNumber, Set<User.Role> roles, String stateCode, String districtCode) {
        if (userRepository.existsByUsername(username)) {
            return;
        }

        userRepository.save(User.builder()
                .username(username)
                .email(email)
                .password(passwordEncoder.encode(password))
                .fullName(fullName)
                .mobileNumber(mobileNumber)
                .roles(roles)
                .active(true)
                .emailVerified(true)
                .stateCode(stateCode)
                .districtCode(districtCode)
                .build());
        log.info("Seeded demo user: {} / {}", username, password);
    }

    private void seedDemoOperations() {
        if (farmRepository.count() > 0) {
            return;
        }

        Farm farm = farmRepository.save(Farm.builder()
                .farmRegistrationNumber("FRM-MH-PUN-26" + randomSuffix())
                .farmName("Sahyadri Dairy Collective")
                .ownerUserId("farmer_demo")
                .ownerName("Demo Farmer")
                .ownerMobile("9876543210")
                .stateCode("MH")
                .stateName("Maharashtra")
                .districtCode("PUN")
                .districtName("Pune")
                .blockCode("HVL")
                .blockName("Haveli")
                .villageName("Wagholi")
                .pincode("412207")
                .latitude(18.5793)
                .longitude(73.9826)
                .farmType(Farm.FarmType.DAIRY)
                .totalAreaAcres(7.5)
                .totalAnimals(3)
                .hasDairyShed(true)
                .hasMilkingParlor(true)
                .hasBiogas(true)
                .hasColdStorage(true)
                .hasFodderStorage(true)
                .certifications(List.of("Organic Feed", "FSSAI Registered"))
                .gstNumber("27AAAAA0000A1Z5")
                .status(Farm.FarmStatus.ACTIVE)
                .build());

        Animal healthyAnimal = animalRepository.save(Animal.builder()
                .tagNumber("IN2700104521")
                .farmId(farm.getId())
                .farmName(farm.getFarmName())
                .species(Animal.AnimalSpecies.COW)
                .breed("Gir")
                .name("Ganga")
                .gender(Animal.Gender.FEMALE)
                .dateOfBirth(LocalDate.now().minusYears(4))
                .colorMarkings("Brown with white blaze")
                .purpose("DAIRY")
                .bodyConditionScore("GOOD")
                .notes("High-yielding milch cow")
                .healthStatus(Animal.HealthStatus.HEALTHY)
                .bodyWeightKg(430.0)
                .isPregnant(false)
                .averageDailyMilkLitres(14.5)
                .rfidTagNumber("RFID-GANGA-001")
                .rfidTagType("EAR_TAG")
                .rfidTaggedDate(LocalDate.now().minusMonths(8))
                .rfidTaggedBy("vet_demo")
                .rfidActive(true)
                .status(Animal.AnimalStatus.ACTIVE)
                .vaccinationHistory(List.of(
                        Animal.VaccinationRecord.builder()
                                .vaccineName("FMD")
                                .disease("Foot and Mouth Disease")
                                .vaccinationDate(LocalDate.now().minusMonths(2))
                                .nextDueDate(LocalDate.now().plusMonths(4))
                                .administeredBy("Dr. Meera Kulkarni")
                                .batchNumber("FMD-2408")
                                .build()
                ))
                .build());

        animalRepository.save(Animal.builder()
                .tagNumber("IN2700104522")
                .farmId(farm.getId())
                .farmName(farm.getFarmName())
                .species(Animal.AnimalSpecies.COW)
                .breed("HF Cross")
                .name("Kamdhenu")
                .gender(Animal.Gender.FEMALE)
                .dateOfBirth(LocalDate.now().minusYears(5))
                .colorMarkings("Black and white")
                .purpose("DAIRY")
                .bodyConditionScore("FAIR")
                .notes("Under mastitis treatment")
                .healthStatus(Animal.HealthStatus.UNDER_TREATMENT)
                .bodyWeightKg(465.0)
                .isPregnant(false)
                .averageDailyMilkLitres(10.0)
                .rfidTagNumber("RFID-KAMDHENU-002")
                .rfidTagType("EAR_TAG")
                .rfidTaggedDate(LocalDate.now().minusMonths(6))
                .rfidTaggedBy("vet_demo")
                .rfidActive(true)
                .status(Animal.AnimalStatus.ACTIVE)
                .build());

        Animal sickAnimal = animalRepository.save(Animal.builder()
                .tagNumber("IN2700104523")
                .farmId(farm.getId())
                .farmName(farm.getFarmName())
                .species(Animal.AnimalSpecies.BUFFALO)
                .breed("Murrah")
                .name("Narmada")
                .gender(Animal.Gender.FEMALE)
                .dateOfBirth(LocalDate.now().minusYears(3))
                .colorMarkings("Jet black")
                .purpose("DAIRY")
                .bodyConditionScore("GOOD")
                .notes("Observed with fever and reduced feed intake")
                .healthStatus(Animal.HealthStatus.SICK)
                .bodyWeightKg(510.0)
                .isPregnant(true)
                .expectedDeliveryDate(LocalDate.now().plusMonths(2))
                .averageDailyMilkLitres(9.0)
                .status(Animal.AnimalStatus.ACTIVE)
                .build());

        String mrlPrefix = "MRL-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "-";
        mrlTestRepository.save(MrlTestRecord.builder()
                .testReferenceNumber(mrlPrefix + "PASS01")
                .farmId(farm.getId())
                .farmName(farm.getFarmName())
                .animalId(healthyAnimal.getId())
                .sampleType(MrlTestRecord.SampleType.MILK)
                .sampleId("MILK-LOT-001")
                .sampleCollectionDate(LocalDate.now().minusDays(3))
                .collectedBy("Dr. Meera Kulkarni")
                .collectorDesignation("Veterinary Officer")
                .labName("Pune Food Safety Lab")
                .labAccreditationNumber("NABL-1128")
                .labState("Maharashtra")
                .sampleReceivedDate(LocalDate.now().minusDays(2))
                .testCompletedDate(LocalDate.now().minusDays(1))
                .residueParameters(List.of(
                        MrlTestRecord.ResidueParameter.builder()
                                .parameterName("Oxytetracycline")
                                .category("Antibiotic")
                                .detectedValue(32.5)
                                .unit("ppb")
                                .mrlLimit(100.0)
                                .mrlStandard("FSSAI")
                                .withinLimit(true)
                                .build()
                ))
                .overallResult(MrlTestRecord.MrlTestResult.PASS)
                .remarks("Routine compliance sample")
                .status(MrlTestRecord.TestStatus.COMPLETED)
                .build());

        mrlTestRepository.save(MrlTestRecord.builder()
                .testReferenceNumber(mrlPrefix + "FAIL01")
                .farmId(farm.getId())
                .farmName(farm.getFarmName())
                .animalId(sickAnimal.getId())
                .sampleType(MrlTestRecord.SampleType.MILK)
                .sampleId("MILK-LOT-002")
                .sampleCollectionDate(LocalDate.now().minusDays(5))
                .collectedBy("Dr. Meera Kulkarni")
                .collectorDesignation("Veterinary Officer")
                .labName("State Residue Surveillance Lab")
                .labAccreditationNumber("NABL-2244")
                .labState("Maharashtra")
                .sampleReceivedDate(LocalDate.now().minusDays(4))
                .testCompletedDate(LocalDate.now().minusDays(3))
                .residueParameters(List.of(
                        MrlTestRecord.ResidueParameter.builder()
                                .parameterName("Enrofloxacin")
                                .category("Antibiotic")
                                .detectedValue(155.0)
                                .unit("ppb")
                                .mrlLimit(100.0)
                                .mrlStandard("FSSAI")
                                .withinLimit(false)
                                .build()
                ))
                .overallResult(MrlTestRecord.MrlTestResult.FAIL)
                .remarks("Withhold milk dispatch until corrective action is completed")
                .status(MrlTestRecord.TestStatus.COMPLETED)
                .actionTaken("Milk lot isolated and follow-up testing scheduled")
                .actionDate(LocalDate.now().minusDays(2))
                .actionTakenBy("Pune District Officer")
                .build());

        String amrPrefix = "AMR-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMM")) + "-";
        antimicrobialUsageRepository.save(AntimicrobialUsage.builder()
                .usageReferenceNumber(amrPrefix + "A1001")
                .farmId(farm.getId())
                .farmName(farm.getFarmName())
                .animalIds(List.of(sickAnimal.getId()))
                .treatmentDescription("Targeted mastitis treatment")
                .numberOfAnimalsAffected(1)
                .diagnosis("Clinical mastitis")
                .prescribingVetId("vet_demo")
                .prescribingVetName("Dr. Meera Kulkarni")
                .vetRegistrationNumber("MVC-2026-118")
                .vetContactNumber("9876501234")
                .prescriptionDate(LocalDate.now().minusDays(2))
                .drugsUsed(List.of(
                        AntimicrobialUsage.DrugEntry.builder()
                                .drugName("Enrofloxacin")
                                .activeIngredient("Enrofloxacin")
                                .drugClass(AntimicrobialUsage.DrugClass.FLUOROQUINOLONES)
                                .manufacturer("VetCare Labs")
                                .batchNumber("ENR-2411")
                                .dosage("5")
                                .unit("mg/kg")
                                .routeOfAdministration("INJECTABLE")
                                .durationDays(5)
                                .milkWithdrawalDays(7)
                                .meatWithdrawalDays(21)
                                .criticallyImportantAntibiotic(true)
                                .build()
                ))
                .treatmentStartDate(LocalDate.now().minusDays(2))
                .treatmentEndDate(LocalDate.now().plusDays(2))
                .milkWithdrawalEndDate(LocalDate.now().plusDays(9))
                .meatWithdrawalEndDate(LocalDate.now().plusDays(23))
                .withdrawalPeriodComplete(false)
                .outcome(AntimicrobialUsage.TreatmentOutcome.ONGOING)
                .isEmergencyTreatment(false)
                .build());

        antimicrobialUsageRepository.save(AntimicrobialUsage.builder()
                .usageReferenceNumber(amrPrefix + "A1002")
                .farmId(farm.getId())
                .farmName(farm.getFarmName())
                .animalIds(List.of(healthyAnimal.getId()))
                .treatmentDescription("Post-partum prophylaxis")
                .numberOfAnimalsAffected(1)
                .diagnosis("Post-partum infection prevention")
                .prescribingVetId("vet_demo")
                .prescribingVetName("Dr. Meera Kulkarni")
                .vetRegistrationNumber("MVC-2026-118")
                .vetContactNumber("9876501234")
                .prescriptionDate(LocalDate.now().minusMonths(1))
                .drugsUsed(List.of(
                        AntimicrobialUsage.DrugEntry.builder()
                                .drugName("Amoxicillin")
                                .activeIngredient("Amoxicillin")
                                .drugClass(AntimicrobialUsage.DrugClass.BETA_LACTAMS)
                                .manufacturer("AgriVet Pharma")
                                .batchNumber("AMX-2406")
                                .dosage("10")
                                .unit("mg/kg")
                                .routeOfAdministration("ORAL")
                                .durationDays(3)
                                .milkWithdrawalDays(3)
                                .meatWithdrawalDays(7)
                                .criticallyImportantAntibiotic(false)
                                .build()
                ))
                .treatmentStartDate(LocalDate.now().minusMonths(1))
                .treatmentEndDate(LocalDate.now().minusMonths(1).plusDays(2))
                .milkWithdrawalEndDate(LocalDate.now().minusMonths(1).plusDays(5))
                .meatWithdrawalEndDate(LocalDate.now().minusMonths(1).plusDays(9))
                .withdrawalPeriodComplete(true)
                .outcome(AntimicrobialUsage.TreatmentOutcome.RECOVERED)
                .outcomeNotes("Treatment completed successfully")
                .isEmergencyTreatment(false)
                .build());

        log.info("Seeded demo farm, animal, MRL, and AMR data");
    }

    private String randomSuffix() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase();
    }
}
