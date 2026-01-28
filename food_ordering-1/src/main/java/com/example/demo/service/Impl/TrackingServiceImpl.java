package com.example.demo.service.Impl;

import com.example.demo.dto.*;
import com.example.demo.entity.*;
import com.example.demo.repository.*;
import com.example.demo.service.IRCTCMockService;
import com.example.demo.service.TrackingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TrackingServiceImpl implements TrackingService {

    @Autowired
    private OrderTrackingRepository trackingRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private DeliveryPersonRepository deliveryPersonRepository;

    @Autowired
    private LocationUpdateRepository locationRepository;

    @Autowired
    private TrainRepository trainRepository;

    @Autowired
    private IRCTCMockService irctcService;

    @Autowired
    private StationRepository stationRepository;

    @Override
    @Transactional
    public OrderTrackingResponse createTracking(Long orderId) {
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
        OrderTracking tracking = trackingRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Tracking not found for order: " + orderId));

        OrderTrackingResponse response = OrderTrackingResponse.fromEntity(tracking);

        // Add current location if delivery person assigned
        if (tracking.getDeliveryPerson() != null) {
            locationRepository.findLatestByOrderId(orderId)
                    .ifPresent(loc -> response.setCurrentLocation(LocationUpdateResponse.fromEntity(loc)));
        }

        return response;
    }

    @Override
    @Transactional
    public OrderTrackingResponse updateOrderStatus(Long orderId, DeliveryStatus newStatus) {
        OrderTracking tracking = trackingRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Tracking not found for order: " + orderId));

        tracking.updateStatus(newStatus);
        OrderTracking updated = trackingRepository.save(tracking);

        return OrderTrackingResponse.fromEntity(updated);
    }

    @Override
    @Transactional
    public OrderTrackingResponse assignDelivery(DeliveryAssignmentRequest request) {
        OrderTracking tracking = trackingRepository.findByOrderId(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Tracking not found for order: " + request.getOrderId()));

        DeliveryPerson deliveryPerson = deliveryPersonRepository.findById(request.getDeliveryPersonId())
                .orElseThrow(() -> new RuntimeException("Delivery person not found: " + request.getDeliveryPersonId()));

        if (deliveryPerson.getCurrentStatus() != DeliveryPersonStatus.AVAILABLE) {
            throw new RuntimeException("Delivery person is not available");
        }

        tracking.setDeliveryPerson(deliveryPerson);
        tracking.updateStatus(DeliveryStatus.ASSIGNED_TO_DELIVERY);

        if (request.getEstimatedDeliveryMinutes() != null) {
            tracking.setEstimatedDeliveryTime(LocalDateTime.now().plusMinutes(request.getEstimatedDeliveryMinutes()));
        }

        // Update delivery person status
        deliveryPerson.setCurrentStatus(DeliveryPersonStatus.BUSY);
        deliveryPersonRepository.save(deliveryPerson);

        OrderTracking updated = trackingRepository.save(tracking);
        return OrderTrackingResponse.fromEntity(updated);
    }

    @Override
    public List<OrderTrackingResponse> getDeliveryPersonOrders(Long deliveryPersonId) {
        List<OrderTracking> trackings = trackingRepository.findByDeliveryPersonId(deliveryPersonId);
        return trackings.stream()
                .map(OrderTrackingResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderTrackingResponse> getActiveDeliveries() {
        List<OrderTracking> trackings = trackingRepository.findActiveDeliveries();
        return trackings.stream()
                .map(OrderTrackingResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public LocationUpdateResponse updateLocation(LocationUpdateRequest request) {
        DeliveryPerson deliveryPerson = deliveryPersonRepository.findById(request.getDeliveryPersonId())
                .orElseThrow(() -> new RuntimeException("Delivery person not found: " + request.getDeliveryPersonId()));

        Order order = null;
        if (request.getOrderId() != null) {
            order = orderRepository.findById(request.getOrderId())
                    .orElseThrow(() -> new RuntimeException("Order not found: " + request.getOrderId()));
        }

        LocationUpdate location = new LocationUpdate();
        location.setDeliveryPerson(deliveryPerson);
        location.setOrder(order);
        location.setLatitude(request.getLatitude());
        location.setLongitude(request.getLongitude());
        location.setAccuracy(request.getAccuracy());
        location.setSpeed(request.getSpeed());
        location.setTimestamp(LocalDateTime.now());

        LocationUpdate saved = locationRepository.save(location);

        // Update delivery person's current location
        deliveryPerson.setCurrentLatitude(request.getLatitude());
        deliveryPerson.setCurrentLongitude(request.getLongitude());
        deliveryPerson.setLastLocationUpdate(LocalDateTime.now());
        deliveryPersonRepository.save(deliveryPerson);

        return LocationUpdateResponse.fromEntity(saved);
    }

    @Override
    public LocationUpdateResponse getLatestLocation(Long deliveryPersonId) {
        LocationUpdate location = locationRepository.findLatestByDeliveryPersonId(deliveryPersonId)
                .orElseThrow(() -> new RuntimeException("No location found for delivery person: " + deliveryPersonId));
        return LocationUpdateResponse.fromEntity(location);
    }

    @Override
    public LocationUpdateResponse getOrderDeliveryLocation(Long orderId) {
        LocationUpdate location = locationRepository.findLatestByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("No delivery location found for order: " + orderId));
        return LocationUpdateResponse.fromEntity(location);
    }

    @Override
    public StationResponse getOrderDestinationStation(Long orderId) {
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
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        return irctcService.getTrainStatus(order.getTrain().getTrainNumber());
    }
}
