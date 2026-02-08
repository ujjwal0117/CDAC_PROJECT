package com.example.demo.service;

import com.example.demo.dto.RestaurantRequest;
import com.example.demo.entity.Restaurant;

import java.util.List;

public interface RestaurantService {
    Restaurant createRestaurant(RestaurantRequest request, com.example.demo.entity.User owner);

    Restaurant getRestaurantById(Long id);

    List<Restaurant> getAllRestaurants();

    List<Restaurant> getRestaurantsByStationId(Long stationId);

    Restaurant updateRestaurant(Long id, RestaurantRequest request);

    List<Restaurant> getRestaurantsByOwnerId(Long ownerId);

}