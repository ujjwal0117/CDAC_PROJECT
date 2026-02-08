package com.example.demo.controller;

import com.example.demo.entity.Review;
import com.example.demo.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @Autowired
    private ReviewRepository reviewRepository;

    @GetMapping("/reviews")
    public List<String> getAllReviewsRaw() {
        List<Review> reviews = reviewRepository.findAll();
        System.out.println("DEBUG TEST: Found " + reviews.size() + " total reviews in DB.");
        return reviews.stream()
                .map(r -> "ID: " + r.getId() +
                        ", RestID: " + (r.getRestaurant() != null ? r.getRestaurant().getId() : "null") +
                        ", UserID: " + (r.getUser() != null ? r.getUser().getId() : "null") +
                        ", OrderID: " + (r.getOrder() != null ? r.getOrder().getId() : "null") +
                        ", Comment: " + r.getComment())
                .collect(Collectors.toList());
    }
}
