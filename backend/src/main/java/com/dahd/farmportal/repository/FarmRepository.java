package com.dahd.farmportal.repository;

import com.dahd.farmportal.model.Farm;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FarmRepository extends MongoRepository<Farm, String> {

    Optional<Farm> findByFarmRegistrationNumber(String registrationNumber);

    boolean existsByFarmRegistrationNumber(String registrationNumber);

    Page<Farm> findByOwnerUserId(String userId, Pageable pageable);

    Page<Farm> findByStateCode(String stateCode, Pageable pageable);

    Page<Farm> findByDistrictCode(String districtCode, Pageable pageable);

    Page<Farm> findByStatus(Farm.FarmStatus status, Pageable pageable);

    Page<Farm> findByFarmType(Farm.FarmType farmType, Pageable pageable);

    @Query("{ 'farmName': { $regex: ?0, $options: 'i' } }")
    Page<Farm> searchByFarmName(String keyword, Pageable pageable);

    long countByStatus(Farm.FarmStatus status);

    long countByStateCode(String stateCode);

    long countByFarmType(Farm.FarmType farmType);

    List<Farm> findByDistrictCode(String districtCode);
}
