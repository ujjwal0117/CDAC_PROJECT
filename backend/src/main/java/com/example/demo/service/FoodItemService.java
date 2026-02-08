package com.example.demo.service;

import com.example.demo.dto.FoodItemRequest;
import com.example.demo.entity.FoodItem;

import java.util.List;

public interface FoodItemService {
    FoodItem createFoodItem(FoodItemRequest request);

    FoodItem getFoodItemById(Long id);

    List<FoodItem> getAllFoodItems();

    List<FoodItem> getFoodItemsByRestaurantId(Long restaurantId);

    List<FoodItem> getFoodItemsByCategory(String category);

    FoodItem updateFoodItem(Long id, FoodItemRequest request);

    void deleteFoodItem(Long id);

    FoodItem save(FoodItem foodItem);
}