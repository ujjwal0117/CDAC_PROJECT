package com.example.demo.repository;

import com.example.demo.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    List<Restaurant> findByTrainId(Long trainId);
    List<Restaurant> findByActiveTrue();
    List<Restaurant> findByTrainIdAndActiveTrue(Long trainId);
}