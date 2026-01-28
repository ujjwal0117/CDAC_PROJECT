package com.example.demo.dto;

import com.example.demo.entity.Restaurant;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantResponse {

    private Long id;
    private String name;
    private String description;
    private String cuisine;
    private String deliveryTime;
    private String imageUrl;
    private Long stationId;
    private String stationName;
    private String stationCode;
    private Long ownerId;
    private String ownerName;
    private String ownerEmail;
    private Boolean active;
    private Boolean isApproved;
    private Double rating;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static RestaurantResponse fromEntity(Restaurant restaurant) {
        RestaurantResponse response = new RestaurantResponse();
        response.setId(restaurant.getId());
        response.setName(restaurant.getName());
        response.setDescription(restaurant.getDescription());
        response.setCuisine(restaurant.getCuisine());
        response.setDeliveryTime(restaurant.getDeliveryTime());
        response.setImageUrl(restaurant.getImageUrl());
        response.setActive(restaurant.getActive());
        response.setIsApproved(restaurant.getIsApproved());
        response.setRating(restaurant.getRating());
        response.setCreatedAt(restaurant.getCreatedAt());
        response.setUpdatedAt(restaurant.getUpdatedAt());

        if (restaurant.getStation() != null) {
            response.setStationId(restaurant.getStation().getId());
            response.setStationName(restaurant.getStation().getStationName());
            response.setStationCode(restaurant.getStation().getStationCode());
        }

        if (restaurant.getOwner() != null) {
            response.setOwnerId(restaurant.getOwner().getId());
            response.setOwnerName(restaurant.getOwner().getFullName());
            response.setOwnerEmail(restaurant.getOwner().getEmail());
        }

        return response;
    }
}