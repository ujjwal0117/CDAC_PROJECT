package com.example.demo.controller;

import com.example.demo.dto.FoodItemResponse;
import com.example.demo.dto.RestaurantRequest;
import com.example.demo.dto.RestaurantResponse;

import com.example.demo.entity.Restaurant;
import com.example.demo.service.RestaurantService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/restaurants")
@CrossOrigin(origins = "*")
public class RestaurantController {

    @Autowired
    private RestaurantService restaurantService;

    @Autowired
    private com.example.demo.repository.UserRepository userRepository;

    @GetMapping("/vendor/profile")
    @PreAuthorize("hasAuthority('ROLE_VENDOR')")
    public ResponseEntity<List<RestaurantResponse>> getMyRestaurants() {
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication().getName();
        com.example.demo.entity.User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        System.out.println("DEBUG: getMyRestaurants for user: " + username + " (ID: " + user.getId() + ")");
        List<Restaurant> restaurants = restaurantService.getRestaurantsByOwnerId(user.getId());
        System.out.println("DEBUG: Found " + restaurants.size() + " restaurants for owner.");
        if (!restaurants.isEmpty()) {
            System.out.println("DEBUG: Restaurant 1: " + restaurants.get(0).getName() + " (ID: "
                    + restaurants.get(0).getId() + ")");
        }

        List<RestaurantResponse> response = restaurants.stream()
                .map(RestaurantResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_VENDOR')")
    public ResponseEntity<RestaurantResponse> createRestaurant(@Valid @RequestBody RestaurantRequest request) {
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication().getName();
        com.example.demo.entity.User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Restaurant restaurant = restaurantService.createRestaurant(request, user);

        // Better way: Repository.save(restaurant) directly here? No, stick to service.
        // I will just save it using repository if I make it public or add setOwner
        // method in Service.

        // Actually, let's update Service `createRestaurant` to accept User owner.
        // But modifying interface affects other calls.
        // Let's do it right: Update Service.

        // For now, I will use a direct repository save if possible, or Update the
        // Entity and Save.
        // But Controller doesn't have repo access.

        // I will add `setRestaurantOwner` method to Service or Repo.
        return ResponseEntity.ok(RestaurantResponse.fromEntity(restaurant));
    }

    @GetMapping
    public ResponseEntity<List<RestaurantResponse>> getAllRestaurants() {
        List<Restaurant> restaurants = restaurantService.getAllRestaurants();
        List<RestaurantResponse> response = restaurants.stream()
                .map(RestaurantResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RestaurantResponse> getRestaurant(@PathVariable Long id) {
        Restaurant restaurant = restaurantService.getRestaurantById(id);
        return ResponseEntity.ok(RestaurantResponse.fromEntity(restaurant));
    }

    @GetMapping("/{id}/menu")
    public ResponseEntity<List<FoodItemResponse>> getRestaurantMenu(@PathVariable Long id) {
        Restaurant restaurant = restaurantService.getRestaurantById(id);

        if (restaurant.getFoodItems() == null || restaurant.getFoodItems().isEmpty()) {
            return ResponseEntity.ok(new ArrayList<>());
        }

        List<FoodItemResponse> menu = restaurant.getFoodItems().stream()
                .map(FoodItemResponse::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(menu);
    }

    /**
     * Get restaurants at a specific station (for e-catering)
     */
    @GetMapping("/station/{stationId}")
    public ResponseEntity<List<RestaurantResponse>> getRestaurantsByStation(@PathVariable Long stationId) {
        List<Restaurant> restaurants = restaurantService.getRestaurantsByStationId(stationId);
        List<RestaurantResponse> response = restaurants.stream()
                .map(RestaurantResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_VENDOR')")
    public ResponseEntity<RestaurantResponse> updateRestaurant(
            @PathVariable Long id,
            @Valid @RequestBody RestaurantRequest request) {
        Restaurant restaurant = restaurantService.updateRestaurant(id, request);
        return ResponseEntity.ok(RestaurantResponse.fromEntity(restaurant));
    }

}