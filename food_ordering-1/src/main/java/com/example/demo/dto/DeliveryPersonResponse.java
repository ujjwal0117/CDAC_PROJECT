package com.example.demo.dto;

import com.example.demo.entity.DeliveryPerson;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryPersonResponse {

    private Long id;
    private String name;
    private String phoneNumber;
    private String email;
    private String currentStatus;
    private Boolean isActive;
    private Double rating;
    private Integer totalDeliveries;
    private Double currentLatitude;
    private Double currentLongitude;
    private LocalDateTime lastLocationUpdate;

    public static DeliveryPersonResponse fromEntity(DeliveryPerson person) {
        DeliveryPersonResponse response = new DeliveryPersonResponse();
        response.setId(person.getId());
        response.setName(person.getName());
        response.setPhoneNumber(person.getPhoneNumber());
        response.setEmail(person.getEmail());
        response.setCurrentStatus(person.getCurrentStatus().name());
        response.setIsActive(person.getIsActive());
        response.setRating(person.getRating());
        response.setTotalDeliveries(person.getTotalDeliveries());
        response.setCurrentLatitude(person.getCurrentLatitude());
        response.setCurrentLongitude(person.getCurrentLongitude());
        response.setLastLocationUpdate(person.getLastLocationUpdate());
        return response;
    }
}
