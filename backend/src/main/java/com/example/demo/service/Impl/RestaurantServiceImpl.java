package com.example.demo.service.Impl;

import com.example.demo.dto.RestaurantRequest;
import com.example.demo.entity.Restaurant;
import com.example.demo.entity.Station;
import com.example.demo.repository.RestaurantRepository;
import com.example.demo.repository.StationRepository;
import com.example.demo.service.RestaurantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RestaurantServiceImpl implements RestaurantService {

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private StationRepository stationRepository;

    @Override
    @Transactional
    public Restaurant createRestaurant(RestaurantRequest request, com.example.demo.entity.User owner) {
        Long stationId = request.getStationId();
        if (stationId == null)
            throw new RuntimeException("Station ID is required");
        Station station = stationRepository.findById(stationId)
                .orElseThrow(() -> new RuntimeException("Station not found"));

        Restaurant restaurant = new Restaurant();
        restaurant.setName(request.getName());
        restaurant.setDescription(request.getDescription());
        restaurant.setCuisine(request.getCuisine());
        restaurant.setDeliveryTime(request.getDeliveryTime());
        restaurant.setImageUrl(request.getImageUrl());
        restaurant.setStation(station);
        restaurant.setOwner(owner);
        restaurant.setActive(true);
        // restaurant.setIsApproved(false); // Removed Admin approval
        restaurant.setRating(0.0);

        return restaurantRepository.save(restaurant);
    }

    @Override
    public Restaurant getRestaurantById(Long id) {
        Long restaurantId = id;
        if (restaurantId == null)
            return null;
        return restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));
    }

    @Override
    public List<Restaurant> getAllRestaurants() {
        return restaurantRepository.findAll();
    }

    @Override
    public List<Restaurant> getRestaurantsByStationId(Long stationId) {
        if (stationId == null)
            return new java.util.ArrayList<>();
        return restaurantRepository.findByStationId(stationId);
    }

    @Override
    @Transactional
    public Restaurant updateRestaurant(Long id, RestaurantRequest request) {
        if (id == null)
            throw new RuntimeException("ID is required");
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        restaurant.setName(request.getName());
        restaurant.setDescription(request.getDescription());
        restaurant.setCuisine(request.getCuisine());
        restaurant.setDeliveryTime(request.getDeliveryTime());
        restaurant.setImageUrl(request.getImageUrl());

        Long requestStationId = request.getStationId();
        if (requestStationId != null) {
            Station station = stationRepository.findById(requestStationId)
                    .orElseThrow(() -> new RuntimeException("Station not found"));
            restaurant.setStation(station);
        }

        if (request.getActive() != null) {
            restaurant.setActive(request.getActive());
        }

        return restaurantRepository.save(restaurant);
    }

    @Override
    public List<Restaurant> getRestaurantsByOwnerId(Long ownerId) {
        if (ownerId == null)
            return new java.util.ArrayList<>();
        return restaurantRepository.findByOwnerId(ownerId);
    }

}