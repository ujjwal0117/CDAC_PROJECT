package com.example.demo.repository;

import com.example.demo.entity.Pantry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PantryRepository extends JpaRepository<Pantry, Long> {

    Optional<Pantry> findByPantryCode(String pantryCode);

    List<Pantry> findByTrainId(Long trainId);

    List<Pantry> findByTrainIdAndActiveTrue(Long trainId);

    List<Pantry> findByActiveTrue();

    Optional<Pantry> findByTrainIdAndCoachNumber(Long trainId, String coachNumber);

    Boolean existsByPantryCode(String pantryCode);
}
