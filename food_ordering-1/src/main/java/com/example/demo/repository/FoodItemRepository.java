package com.example.demo.repository;

import com.example.demo.entity.FoodItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoodItemRepository extends JpaRepository<FoodItem, Long> {
    List<FoodItem> findByRestaurantId(Long restaurantId);
    List<FoodItem> findByRestaurantIdAndAvailableTrue(Long restaurantId);
    List<FoodItem> findByCategory(String category);
    List<FoodItem> findByVegetarian(Boolean vegetarian);
}