package com.example.demo.service.Impl;

import com.example.demo.dto.RestaurantRequest;
import com.example.demo.entity.Restaurant;
import com.example.demo.entity.Train;
import com.example.demo.repository.RestaurantRepository;
import com.example.demo.repository.TrainRepository;
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
    private TrainRepository trainRepository;

    @Override
    @Transactional
    public Restaurant createRestaurant(RestaurantRequest request) {
        Train train = trainRepository.findById(request.getTrainId())
                .orElseThrow(() -> new RuntimeException("Train not found"));

        Restaurant restaurant = new Restaurant();
        restaurant.setName(request.getName());
        restaurant.setDescription(request.getDescription());
        restaurant.setTrain(train);
        restaurant.setActive(true);
        restaurant.setRating(0.0);

        return restaurantRepository.save(restaurant);
    }

    @Override
    public Restaurant getRestaurantById(Long id) {
        return restaurantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));
    }

    @Override
    public List<Restaurant> getAllRestaurants() {
        return restaurantRepository.findByActiveTrue();
    }

    @Override
    public List<Restaurant> getRestaurantsByTrainId(Long trainId) {
        return restaurantRepository.findByTrainIdAndActiveTrue(trainId);
    }

    @Override
    @Transactional
    public Restaurant updateRestaurant(Long id, RestaurantRequest request) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        restaurant.setName(request.getName());
        restaurant.setDescription(request.getDescription());

        return restaurantRepository.save(restaurant);
    }

    @Override
    @Transactional
    public void deleteRestaurant(Long id) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));
        restaurant.setActive(false);
        restaurantRepository.save(restaurant);
    }
}