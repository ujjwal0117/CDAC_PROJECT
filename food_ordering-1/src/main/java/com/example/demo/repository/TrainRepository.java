package com.example.demo.repository;

import com.example.demo.entity.Train;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TrainRepository extends JpaRepository<Train, Long> {
    Optional<Train> findByTrainNumber(String trainNumber);

    List<Train> findByActiveTrue();

    Boolean existsByTrainNumber(String trainNumber);

    // Search methods
    List<Train> findByTrainNameContainingIgnoreCaseAndActiveTrue(String trainName);

    List<Train> findByTrainNumberContainingAndActiveTrue(String trainNumber);
}
