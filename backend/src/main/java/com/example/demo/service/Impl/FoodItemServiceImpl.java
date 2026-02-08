package com.example.demo.service.Impl;

import com.example.demo.dto.FoodItemRequest;
import com.example.demo.entity.FoodItem;
import com.example.demo.entity.Restaurant;
import com.example.demo.repository.FoodItemRepository;
import com.example.demo.repository.RestaurantRepository;
import com.example.demo.service.FoodItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FoodItemServiceImpl implements FoodItemService {

    @Autowired
    private FoodItemRepository foodItemRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Override
    @Transactional
    public FoodItem createFoodItem(FoodItemRequest request) {
        Long restaurantId = request.getRestaurantId();
        if (restaurantId == null)
            throw new RuntimeException("Restaurant ID is required");
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        FoodItem foodItem = new FoodItem();
        foodItem.setName(request.getName());
        foodItem.setDescription(request.getDescription());
        foodItem.setPrice(request.getPrice());
        foodItem.setCategory(request.getCategory());
        foodItem.setImageUrl(request.getImageUrl());
        foodItem.setRestaurant(restaurant);
        foodItem.setVegetarian(request.getVegetarian());
        foodItem.setAvailable(true);

        return foodItemRepository.save(foodItem);
    }

    @Override
    public FoodItem getFoodItemById(Long id) {
        if (id == null)
            throw new RuntimeException("ID is required");
        return foodItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Food item not found"));
    }

    @Override
    public List<FoodItem> getAllFoodItems() {
        return foodItemRepository.findAll();
    }

    @Override
    public List<FoodItem> getFoodItemsByRestaurantId(Long restaurantId) {
        return foodItemRepository.findByRestaurantIdAndAvailableTrue(restaurantId);
    }

    @Override
    public List<FoodItem> getFoodItemsByCategory(String category) {
        return foodItemRepository.findByCategory(category);
    }

    @Override
    @Transactional
    public FoodItem updateFoodItem(Long id, FoodItemRequest request) {
        if (id == null)
            throw new RuntimeException("ID is required");
        FoodItem foodItem = foodItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Food item not found"));

        foodItem.setName(request.getName());
        foodItem.setDescription(request.getDescription());
        foodItem.setPrice(request.getPrice());
        foodItem.setCategory(request.getCategory());
        foodItem.setImageUrl(request.getImageUrl());
        foodItem.setVegetarian(request.getVegetarian());

        return foodItemRepository.save(foodItem);
    }

    @Override
    @Transactional
    public void deleteFoodItem(Long id) {
        if (id == null)
            throw new RuntimeException("ID is required");
        FoodItem foodItem = foodItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Food item not found"));
        foodItem.setAvailable(false);
        foodItemRepository.save(foodItem);
    }

    @Override
    @Transactional
    public FoodItem save(FoodItem foodItem) {
        if (foodItem == null)
            throw new RuntimeException("FoodItem cannot be null");
        return foodItemRepository.save(foodItem);
    }
}