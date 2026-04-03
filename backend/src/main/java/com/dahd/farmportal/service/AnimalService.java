package com.dahd.farmportal.service;
import com.dahd.farmportal.dto.request.AnimalRequest;
import com.dahd.farmportal.dto.response.PagedResponse;
import com.dahd.farmportal.exception.DuplicateResourceException;
import com.dahd.farmportal.exception.ResourceNotFoundException;
import com.dahd.farmportal.model.Animal;
import com.dahd.farmportal.model.Farm;
import com.dahd.farmportal.repository.AnimalRepository;
import com.dahd.farmportal.repository.FarmRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnimalService {

    private final AnimalRepository animalRepository;
    private final FarmRepository farmRepository;
    private final AuditService auditService;

    public Animal registerAnimal(AnimalRequest request, String actorUsername) {
        if (animalRepository.existsByTagNumber(request.getTagNumber())) {
            throw new DuplicateResourceException("Animal with tag number already exists: " + request.getTagNumber());
        }

        Farm farm = farmRepository.findById(request.getFarmId())
                .orElseThrow(() -> new ResourceNotFoundException("Farm", "id", request.getFarmId()));

        Animal animal = Animal.builder()
                .tagNumber(request.getTagNumber())
                .farmId(request.getFarmId())
                .farmName(farm.getFarmName())
                .species(request.getSpecies())
                .breed(request.getBreed())
                .name(request.getName())
                .gender(request.getGender())
                .dateOfBirth(request.getDateOfBirth())
                .colorMarkings(request.getColorMarkings())
                .purpose(request.getPurpose())
                .bodyConditionScore(request.getBodyConditionScore())
                .notes(request.getNotes())
                .sourceType(request.getSourceType())
                .sourceFarmId(request.getSourceFarmId())
                .acquisitionDate(request.getAcquisitionDate())
                .bodyWeightKg(request.getBodyWeightKg())
                .lastWeightRecordedOn(LocalDate.now())
                .healthStatus(request.getHealthStatus() != null ? request.getHealthStatus() : Animal.HealthStatus.HEALTHY)
                .insurancePolicyNumber(request.getInsurancePolicyNumber())
                .insuranceCompany(request.getInsuranceCompany())
                .insuranceValidTill(request.getInsuranceValidTill())
                .status(Animal.AnimalStatus.ACTIVE)
                .isPregnant(request.getIsPregnant() != null ? request.getIsPregnant() : false)
                .expectedDeliveryDate(request.getExpectedDeliveryDate())
                .lastCalvingDate(request.getLastCalvingDate())
                .averageDailyMilkLitres(request.getAverageDailyMilkLitres())
                .build();

        animal = animalRepository.save(animal);

        // Update farm animal count
        farm.setTotalAnimals(farm.getTotalAnimals() == null ? 1 : farm.getTotalAnimals() + 1);
        farmRepository.save(farm);

        auditService.log(null, actorUsername, "CREATE", "Animal", animal.getId(),
                "Animal registered with tag: " + animal.getTagNumber(), null, true, null);
        return animal;
    }

    public Animal getAnimalById(String animalId) {
        return animalRepository.findById(animalId)
                .orElseThrow(() -> new ResourceNotFoundException("Animal", "id", animalId));
    }

    public Animal getAnimalByTagNumber(String tagNumber) {
        return animalRepository.findByTagNumber(tagNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Animal", "tagNumber", tagNumber));
    }

    public PagedResponse<Animal> getAllAnimals(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return PagedResponse.of(animalRepository.findAll(pageable));
    }

    public PagedResponse<Animal> getAnimalsByFarm(String farmId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return PagedResponse.of(animalRepository.findByFarmId(farmId, pageable));
    }

    public PagedResponse<Animal> getAnimalsByFarmAndHealthStatus(String farmId, Animal.HealthStatus healthStatus, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return PagedResponse.of(animalRepository.findByFarmIdAndHealthStatus(farmId, healthStatus, pageable));
    }

    public PagedResponse<Animal> getAnimalsByFarmAndStatus(String farmId, Animal.AnimalStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return PagedResponse.of(animalRepository.findByFarmIdAndStatus(farmId, status, pageable));
    }

    public PagedResponse<Animal> getAnimalsBySpecies(Animal.AnimalSpecies species, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return PagedResponse.of(animalRepository.findBySpecies(species, pageable));
    }

    public PagedResponse<Animal> getSickAnimals(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return PagedResponse.of(animalRepository.findByHealthStatus(Animal.HealthStatus.SICK, pageable));
    }

    public PagedResponse<Animal> getPregnantAnimals(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return PagedResponse.of(animalRepository.findAllPregnant(pageable));
    }

    public Animal updateAnimal(String animalId, AnimalRequest request, String actorUsername) {
        Animal animal = getAnimalById(animalId);

        if (!animal.getTagNumber().equals(request.getTagNumber())
                && animalRepository.existsByTagNumber(request.getTagNumber())) {
            throw new DuplicateResourceException("Tag number already used: " + request.getTagNumber());
        }

        animal.setTagNumber(request.getTagNumber());
        animal.setBreed(request.getBreed());
        animal.setName(request.getName());
        animal.setColorMarkings(request.getColorMarkings());
        animal.setPurpose(request.getPurpose());
        animal.setBodyConditionScore(request.getBodyConditionScore());
        animal.setNotes(request.getNotes());
        animal.setBodyWeightKg(request.getBodyWeightKg());
        animal.setLastWeightRecordedOn(LocalDate.now());
        if (request.getHealthStatus() != null) {
            animal.setHealthStatus(request.getHealthStatus());
        }
        animal.setInsurancePolicyNumber(request.getInsurancePolicyNumber());
        animal.setInsuranceCompany(request.getInsuranceCompany());
        animal.setInsuranceValidTill(request.getInsuranceValidTill());
        animal.setIsPregnant(request.getIsPregnant());
        animal.setExpectedDeliveryDate(request.getExpectedDeliveryDate());
        animal.setLastCalvingDate(request.getLastCalvingDate());
        animal.setAverageDailyMilkLitres(request.getAverageDailyMilkLitres());

        Animal updated = animalRepository.save(animal);
        auditService.log(null, actorUsername, "UPDATE", "Animal", animalId,
                "Animal updated: " + animalId, null, true, null);
        return updated;
    }

    public Animal updateHealthStatus(String animalId, Animal.HealthStatus healthStatus, String actorUsername) {
        Animal animal = getAnimalById(animalId);
        animal.setHealthStatus(healthStatus);
        Animal updated = animalRepository.save(animal);
        auditService.log(null, actorUsername, "UPDATE", "Animal", animalId,
                "Animal health status updated to: " + healthStatus, null, true, null);
        return updated;
    }

    public Animal updateAnimalStatus(String animalId, Animal.AnimalStatus status, String actorUsername) {
        Animal animal = getAnimalById(animalId);
        animal.setStatus(status);
        return animalRepository.save(animal);
    }

    public Animal addVaccinationRecord(String animalId, Animal.VaccinationRecord record, String actorUsername) {
        Animal animal = getAnimalById(animalId);
        if (animal.getVaccinationHistory() == null) {
            animal.setVaccinationHistory(new java.util.ArrayList<>());
        }
        animal.getVaccinationHistory().add(record);
        Animal updated = animalRepository.save(animal);
        auditService.log(null, actorUsername, "UPDATE", "Animal", animalId,
                "Vaccination record added: " + record.getVaccineName(), null, true, null);
        return updated;
    }

    public Map<String, String> getQrCodePayload(Animal animal, String qrBase64) {
        return Map.of(
                "tagNumber", animal.getTagNumber(),
                "qrCodeBase64", qrBase64
        );
    }
}
