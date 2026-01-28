package com.example.demo.service.Impl;

import com.example.demo.dto.ReviewRequest;
import com.example.demo.dto.ReviewResponse;
import com.example.demo.entity.Order;
import com.example.demo.entity.Restaurant;
import com.example.demo.entity.Review;
import com.example.demo.entity.User;
import com.example.demo.repository.OrderRepository;
import com.example.demo.repository.RestaurantRepository;
import com.example.demo.repository.ReviewRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ReviewServiceImpl implements ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Override
    @Transactional
    public ReviewResponse addReview(ReviewRequest request, Long userId) {
        System.out.println("DEBUG: addReview called for OrderID: " + request.getOrderId() + ", UserID: " + userId);

        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));
        System.out.println("DEBUG: Order found. Status: " + order.getStatus());

        if (!order.getUser().getId().equals(userId)) {
            System.out.println(
                    "DEBUG: User mismatch. OrderUser: " + order.getUser().getId() + ", RequestUser: " + userId);
            throw new RuntimeException("You can only review your own orders");
        }

        if (order.getStatus() != Order.OrderStatus.DELIVERED) {
            System.out.println("DEBUG: Order not delivered.");
            throw new RuntimeException("You can only review delivered orders");
        }

        Optional<Review> existingReview = reviewRepository.findByOrderId(order.getId());
        if (existingReview.isPresent()) {
            System.out.println("DEBUG: Review already exists for this order.");
            throw new RuntimeException("You have already reviewed this order");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Review review = new Review();
        review.setOrder(order);
        review.setUser(user);
        review.setRestaurant(order.getRestaurant());
        review.setRating(request.getRating());
        review.setComment(request.getComment());

        System.out.println("DEBUG: Saving review for Restaurant ID: " + order.getRestaurant().getId());
        Review savedReview = reviewRepository.save(review);
        System.out.println("DEBUG: Review saved with ID: " + savedReview.getId());

        // Update restaurant average rating
        try {
            updateRestaurantRating(order.getRestaurant());
            System.out.println("DEBUG: Restaurant rating updated.");
        } catch (Exception e) {
            System.err.println("DEBUG: Error updating restaurant rating: " + e.getMessage());
            e.printStackTrace();
        }

        return ReviewResponse.fromEntity(savedReview);
    }

    private void updateRestaurantRating(Restaurant restaurant) {
        List<Review> reviews = reviewRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurant.getId());
        if (reviews.isEmpty()) {
            return;
        }
        double avg = reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
        restaurant.setRating(avg);
        restaurantRepository.save(restaurant);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getRestaurantReviews(Long restaurantId) {
        System.out.println("DEBUG: getRestaurantReviews called for ID: " + restaurantId);
        List<ReviewResponse> reviews = reviewRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurantId).stream()
                .map(ReviewResponse::fromEntity)
                .collect(Collectors.toList());
        System.out.println("DEBUG: Found " + reviews.size() + " reviews for restaurant ID: " + restaurantId);
        return reviews;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getUserReviews(Long userId) {
        return reviewRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(ReviewResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsByOwnerId(Long ownerId) {
        System.out.println("DEBUG: getReviewsByOwnerId called for Owner ID: " + ownerId);
        List<ReviewResponse> reviews = reviewRepository.findByRestaurantOwnerIdOrderByCreatedAtDesc(ownerId).stream()
                .map(ReviewResponse::fromEntity)
                .collect(Collectors.toList());
        System.out.println("DEBUG: Found " + reviews.size() + " reviews for Owner ID: " + ownerId);
        return reviews;
    }
}
