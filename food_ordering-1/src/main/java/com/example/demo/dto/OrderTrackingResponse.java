package com.example.demo.dto;

import com.example.demo.entity.OrderTracking;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderTrackingResponse {

    private Long id;
    private Long orderId;
    private Long deliveryPersonId;
    private String deliveryPersonName;
    private String deliveryPersonPhone;
    private String currentStatus;
    private LocalDateTime placedAt;
    private LocalDateTime confirmedAt;
    private LocalDateTime preparingAt;
    private LocalDateTime readyAt;
    private LocalDateTime assignedAt;
    private LocalDateTime outForDeliveryAt;
    private LocalDateTime reachedStationAt;
    private LocalDateTime deliveredAt;
    private LocalDateTime estimatedDeliveryTime;
    private LocationUpdateResponse currentLocation;
    private String notes;

    public static OrderTrackingResponse fromEntity(OrderTracking tracking) {
        OrderTrackingResponse response = new OrderTrackingResponse();
        response.setId(tracking.getId());
        response.setOrderId(tracking.getOrder().getId());

        if (tracking.getDeliveryPerson() != null) {
            response.setDeliveryPersonId(tracking.getDeliveryPerson().getId());
            response.setDeliveryPersonName(tracking.getDeliveryPerson().getName());
            response.setDeliveryPersonPhone(tracking.getDeliveryPerson().getPhoneNumber());
        }

        response.setCurrentStatus(tracking.getCurrentStatus().name());
        response.setPlacedAt(tracking.getPlacedAt());
        response.setConfirmedAt(tracking.getConfirmedAt());
        response.setPreparingAt(tracking.getPreparingAt());
        response.setReadyAt(tracking.getReadyAt());
        response.setAssignedAt(tracking.getAssignedAt());
        response.setOutForDeliveryAt(tracking.getOutForDeliveryAt());
        response.setReachedStationAt(tracking.getReachedStationAt());
        response.setDeliveredAt(tracking.getDeliveredAt());
        response.setEstimatedDeliveryTime(tracking.getEstimatedDeliveryTime());
        response.setNotes(tracking.getNotes());

        return response;
    }
}
