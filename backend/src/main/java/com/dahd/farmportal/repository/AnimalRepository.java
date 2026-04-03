package com.dahd.farmportal.repository;

import com.dahd.farmportal.model.Animal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AnimalRepository extends MongoRepository<Animal, String> {

    Optional<Animal> findByTagNumber(String tagNumber);
    Optional<Animal> findByRfidTagNumber(String rfidTagNumber);

    boolean existsByTagNumber(String tagNumber);

    Page<Animal> findByFarmId(String farmId, Pageable pageable);

    Page<Animal> findByFarmIdAndHealthStatus(String farmId, Animal.HealthStatus healthStatus, Pageable pageable);

    Page<Animal> findByFarmIdAndStatus(String farmId, Animal.AnimalStatus status, Pageable pageable);

    Page<Animal> findBySpecies(Animal.AnimalSpecies species, Pageable pageable);

    Page<Animal> findByHealthStatus(Animal.HealthStatus healthStatus, Pageable pageable);

    @Query("{ 'farmId': ?0, 'species': ?1 }")
    Page<Animal> findByFarmIdAndSpecies(String farmId, Animal.AnimalSpecies species, Pageable pageable);

    long countByFarmId(String farmId);

    long countByFarmIdAndStatus(String farmId, Animal.AnimalStatus status);

    long countByHealthStatus(Animal.HealthStatus healthStatus);

    long countBySpecies(Animal.AnimalSpecies species);

    @Query("{ 'isPregnant': true }")
    Page<Animal> findAllPregnant(Pageable pageable);
}
