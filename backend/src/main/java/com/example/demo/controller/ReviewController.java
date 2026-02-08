package com.example.demo.controller;

import com.example.demo.dto.ReviewRequest;
import com.example.demo.dto.ReviewResponse;
import com.example.demo.security.CustomUserDetails;
import com.example.demo.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @PostMapping
    public ResponseEntity<ReviewResponse> addReview(
            @RequestBody ReviewRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        System.out.println("DEBUG: ReviewController.addReview HIT. UserID: "
                + (userDetails != null ? userDetails.getId() : "NULL"));
        if (userDetails == null)
            throw new RuntimeException("User not authenticated");
        return ResponseEntity.ok(reviewService.addReview(request, userDetails.getId()));
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<ReviewResponse>> getRestaurantReviews(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(reviewService.getRestaurantReviews(restaurantId));
    }

    @GetMapping("/user/my-reviews")
    public ResponseEntity<List<ReviewResponse>> getMyReviews(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(reviewService.getUserReviews(userDetails.getId()));
    }

    @GetMapping("/vendor/my-reviews")
    @PreAuthorize("hasAnyAuthority('ROLE_VENDOR', 'ROLE_ADMIN')")
    public ResponseEntity<List<ReviewResponse>> getMyRestaurantReviews(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(reviewService.getReviewsByOwnerId(userDetails != null ? userDetails.getId() : null));
    }
}
