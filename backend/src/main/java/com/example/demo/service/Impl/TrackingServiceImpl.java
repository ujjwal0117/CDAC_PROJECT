package com.example.demo.service.Impl;

import com.example.demo.dto.*;
import com.example.demo.entity.*;
import com.example.demo.repository.*;
import com.example.demo.service.IRCTCMockService;
import com.example.demo.service.TrackingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TrackingServiceImpl implements TrackingService {

    @Autowired
    private OrderTrackingRepository trackingRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private IRCTCMockService irctcService;

    @Autowired
    private StationRepository stationRepository;

    @Override
    @Transactional
    public OrderTrackingResponse createTracking(Long orderId) {
        if (orderId == null)
            throw new RuntimeException("Order ID is required");
        if (trackingRepository.existsByOrderId(orderId)) {
            throw new RuntimeException("Tracking already exists for order: " + orderId);
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        OrderTracking tracking = new OrderTracking();
        tracking.setOrder(order);
        tracking.updateStatus(DeliveryStatus.PLACED);

        OrderTracking saved = trackingRepository.save(tracking);
        return OrderTrackingResponse.fromEntity(saved);
    }

    @Override
    public OrderTrackingResponse getOrderTracking(Long orderId) {
        if (orderId == null)
            return null;
        OrderTracking tracking = trackingRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Tracking not found for order: " + orderId));

        OrderTrackingResponse response = OrderTrackingResponse.fromEntity(tracking);

        return response;
    }

    @Override
    @Transactional
    public OrderTrackingResponse updateOrderStatus(Long orderId, DeliveryStatus newStatus) {
        if (orderId == null)
            throw new RuntimeException("Order ID is required");
        OrderTracking tracking = trackingRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Tracking not found for order: " + orderId));

        tracking.updateStatus(newStatus);
        OrderTracking updated = trackingRepository.save(tracking);

        return OrderTrackingResponse.fromEntity(updated);
    }

    @Override
    public StationResponse getOrderDestinationStation(Long orderId) {
        if (orderId == null)
            return null;
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        // Fetch the destination station entity based on station code
        String destinationCode = order.getTrain().getDestination();
        Station station = stationRepository.findByStationCode(destinationCode)
                .orElseThrow(() -> new RuntimeException("Station not found: " + destinationCode));

        return StationResponse.fromEntity(station);
    }

    @Override
    public TrainStatusResponse getOrderTrainStatus(Long orderId) {
        if (orderId == null)
            return null;
        System.out.println("Processing train status request for order: " + orderId);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        if (order.getTrain() == null) {
            System.out.println("No train associated with order: " + orderId + ". Using mock train number 12345.");
            return irctcService.getTrainStatus("12345");
        }

        System.out.println("Fetching status for train: " + order.getTrain().getTrainNumber());
        return irctcService.getTrainStatus(order.getTrain().getTrainNumber());
    }
}
