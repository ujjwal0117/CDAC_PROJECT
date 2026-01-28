package com.example.demo.dto;

import com.example.demo.entity.LocationUpdate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LocationUpdateResponse {

    private Long id;
    private Long deliveryPersonId;
    private String deliveryPersonName;
    private Long orderId;
    private Double latitude;
    private Double longitude;
    private Double accuracy;
    private Double speed;
    private LocalDateTime timestamp;

    public static LocationUpdateResponse fromEntity(LocationUpdate location) {
        LocationUpdateResponse response = new LocationUpdateResponse();
        response.setId(location.getId());
        response.setDeliveryPersonId(location.getDeliveryPerson().getId());
        response.setDeliveryPersonName(location.getDeliveryPerson().getName());
        response.setOrderId(location.getOrder() != null ? location.getOrder().getId() : null);
        response.setLatitude(location.getLatitude());
        response.setLongitude(location.getLongitude());
        response.setAccuracy(location.getAccuracy());
        response.setSpeed(location.getSpeed());
        response.setTimestamp(location.getTimestamp());
        return response;
    }
}
