package com.example.demo.service;

import com.example.demo.dto.ReviewRequest;
import com.example.demo.dto.ReviewResponse;

import java.util.List;

public interface ReviewService {
    ReviewResponse addReview(ReviewRequest request, Long userId);

    List<ReviewResponse> getRestaurantReviews(Long restaurantId);

    List<ReviewResponse> getUserReviews(Long userId);

    List<ReviewResponse> getReviewsByOwnerId(Long ownerId);
}
