package com.example.demo.controller;

import com.example.demo.dto.FoodItemRequest;
import com.example.demo.dto.FoodItemResponse;
import com.example.demo.entity.FoodItem;
import com.example.demo.service.FoodItemService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/food-items")
@CrossOrigin(origins = "*")
public class FoodItemController {

    @Autowired
    private FoodItemService foodItemService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_VENDOR')")
    public ResponseEntity<FoodItemResponse> createFoodItem(@Valid @RequestBody FoodItemRequest request) {
        FoodItem foodItem = foodItemService.createFoodItem(request);
        return ResponseEntity.ok(FoodItemResponse.fromEntity(foodItem));
    }

    @GetMapping
    public ResponseEntity<List<FoodItemResponse>> getAllFoodItems() {
        List<FoodItem> foodItems = foodItemService.getAllFoodItems();
        List<FoodItemResponse> response = foodItems.stream()
                .map(FoodItemResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FoodItemResponse> getFoodItem(@PathVariable Long id) {
        FoodItem foodItem = foodItemService.getFoodItemById(id);
        return ResponseEntity.ok(FoodItemResponse.fromEntity(foodItem));
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<FoodItemResponse>> getFoodItemsByRestaurant(@PathVariable Long restaurantId) {
        List<FoodItem> foodItems = foodItemService.getFoodItemsByRestaurantId(restaurantId);
        List<FoodItemResponse> response = foodItems.stream()
                .map(FoodItemResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<FoodItemResponse>> getFoodItemsByCategory(@PathVariable String category) {
        List<FoodItem> foodItems = foodItemService.getFoodItemsByCategory(category);
        List<FoodItemResponse> response = foodItems.stream()
                .map(FoodItemResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_VENDOR')")
    public ResponseEntity<FoodItemResponse> updateFoodItem(
            @PathVariable Long id,
            @Valid @RequestBody FoodItemRequest request) {
        FoodItem foodItem = foodItemService.updateFoodItem(id, request);
        return ResponseEntity.ok(FoodItemResponse.fromEntity(foodItem));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_VENDOR')")
    public ResponseEntity<Void> deleteFoodItem(@PathVariable Long id) {
        foodItemService.deleteFoodItem(id);
        return ResponseEntity.ok().build();
    }
}