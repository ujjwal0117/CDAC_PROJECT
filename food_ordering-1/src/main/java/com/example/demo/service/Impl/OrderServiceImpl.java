package com.example.demo.service.Impl;

import com.example.demo.dto.*;
import com.example.demo.entity.*;
import com.example.demo.repository.*;
import com.example.demo.service.OrderService;
import com.example.demo.service.TrackingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TrainRepository trainRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private FoodItemRepository foodItemRepository;

    @Autowired
    private TrackingService trackingService; // ✅ ADDED FOR AUTO-TRACKING

    @Autowired
    private StationRepository stationRepository;

    @Override
    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        // Validate user
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Validate train
        Train train = trainRepository.findById(request.getTrainId())
                .orElseThrow(() -> new RuntimeException("Train not found"));

        // Validate restaurant (Self-Healing)
        Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                .orElseGet(() -> {
                    // Fallback: If ID 999 fails, try finding by Name "IRCTC Pantry"
                    if (request.getRestaurantId() != null && request.getRestaurantId() == 999L) {
                        return restaurantRepository.findByName("IRCTC Pantry")
                                .orElseGet(() -> {
                                    // 🚨 EMERGENCY CREATION
                                    System.out.println("⚠️ Pantry missing. Creating ON-THE-FLY.");
                                    com.example.demo.entity.Station station = stationRepository.findAll().stream()
                                            .findFirst().orElse(null);
                                    if (station == null) {
                                        station = new com.example.demo.entity.Station();
                                        station.setStationName("IRCTC Virtual Station");
                                        station.setStationCode("IRCTC");
                                        station.setLatitude(0.0);
                                        station.setLongitude(0.0);
                                        station = stationRepository.save(station);
                                    }
                                    Restaurant pantry = new Restaurant();
                                    pantry.setName("IRCTC Pantry");
                                    pantry.setDescription("Onboard Train Pantry Service");
                                    pantry.setCuisine("Pantry");
                                    pantry.setDeliveryTime("30-45 min");
                                    pantry.setActive(true);
                                    pantry.setRating(4.5);
                                    pantry.setStation(station);
                                    return restaurantRepository.save(pantry);
                                });
                    }
                    throw new RuntimeException("Restaurant not found with ID: " + request.getRestaurantId());
                });

        // Create order
        Order order = new Order();
        order.setUser(user);
        order.setTrain(train);
        order.setRestaurant(restaurant);
        order.setPnrNumber(request.getPnrNumber());
        order.setSeatNumber(request.getSeatNumber());
        order.setCoachNumber(request.getCoachNumber());
        order.setDeliveryInstructions(request.getDeliveryInstructions());
        order.setStatus(Order.OrderStatus.PENDING);

        // Create order items and calculate total
        List<OrderItem> orderItems = new ArrayList<>();
        double totalAmount = 0.0;

        // ✅ FIXED: Use OrderRequest.OrderItemRequest
        for (OrderRequest.OrderItemRequest itemRequest : request.getItems()) {
            FoodItem foodItem = foodItemRepository.findById(itemRequest.getFoodItemId())
                    .orElseThrow(() -> new RuntimeException("Food item not found"));

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setFoodItem(foodItem);
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setPrice(foodItem.getPrice());
            orderItem.setSubtotal(foodItem.getPrice() * itemRequest.getQuantity());

            orderItems.add(orderItem);
            totalAmount += orderItem.getSubtotal();
        }

        order.setOrderItems(orderItems);
        order.setTotalAmount(totalAmount);

        // Save order
        Order savedOrder = orderRepository.save(order);

        // ✅ AUTO-CREATE TRACKING RECORD
        try {
            trackingService.createTracking(savedOrder.getId());
            System.out.println("✅ Tracking created for order: " + savedOrder.getId());
        } catch (Exception e) {
            System.err.println("⚠️ Failed to create tracking for order " + savedOrder.getId() + ": " + e.getMessage());
        }

        return OrderResponse.fromEntity(savedOrder);
    }

    @Override
    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return OrderResponse.fromEntity(order);
    }

    @Override
    public List<OrderResponse> getOrdersByUserId(Long userId) {
        List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return orders.stream()
                .map(OrderResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    // @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_VENDOR')")
    public OrderResponse updateOrderStatus(Long id, Order.OrderStatus status) {
        return updateOrderStatusWithOtp(id, status, null);
    }

    @Transactional
    public OrderResponse updateOrderStatusWithOtp(Long id, Order.OrderStatus status, String otp) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // OTP Logic
        if (status == Order.OrderStatus.OUT_FOR_DELIVERY) {
            // Generate 4-digit OTP
            String generatedOtp = String.valueOf((int) (Math.random() * 9000) + 1000);
            order.setDeliveryOtp(generatedOtp);
        } else if (status == Order.OrderStatus.DELIVERED) {
            // Validate OTP if it exists on the order
            if (order.getDeliveryOtp() != null && !order.getDeliveryOtp().equals(otp)) {
                throw new RuntimeException("Invalid OTP. Delivery failed.");
            }
        }

        order.setStatus(status);
        Order updatedOrder = orderRepository.save(order);
        return OrderResponse.fromEntity(updatedOrder);
    }

    @Override
    public List<OrderResponse> getAllOrders() {
        List<Order> orders = orderRepository.findAll();
        return orders.stream()
                .map(OrderResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderResponse> getOrdersByOwnerId(Long ownerId) {
        List<Order> orders = orderRepository.findByRestaurantOwnerIdOrderByCreatedAtDesc(ownerId);
        return orders.stream()
                .map(OrderResponse::fromEntity)
                .collect(Collectors.toList());
    }
}