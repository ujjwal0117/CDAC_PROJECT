package com.example.demo.repository;

import com.example.demo.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    List<Restaurant> findByStationId(Long stationId);

    List<Restaurant> findByActiveTrue();

    List<Restaurant> findByStationIdAndActiveTrue(Long stationId);

    java.util.Optional<Restaurant> findByName(String name);

    List<Restaurant> findByOwnerId(Long ownerId);

    List<Restaurant> findByIsApproved(Boolean isApproved);

    List<Restaurant> findByIsApprovedTrue();

    List<Restaurant> findByIsApprovedFalse();

    List<Restaurant> findByStationIdAndIsApprovedTrue(Long stationId);

    List<Restaurant> findByIsApprovedTrueAndActiveTrue();

    List<Restaurant> findByIsApprovedFalseAndActiveTrue();
}