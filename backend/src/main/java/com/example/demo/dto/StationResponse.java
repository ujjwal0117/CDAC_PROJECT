package com.example.demo.dto;

import com.example.demo.entity.Station;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StationResponse {

    private Long id;
    private String stationCode;
    private String stationName;
    private Double latitude;
    private Double longitude;
    private String city;
    private String state;
    private Integer platformCount;
    private String contactNumber;
    private String address;
    private LocalDateTime createdAt;

    public static StationResponse fromEntity(Station station) {
        StationResponse response = new StationResponse();
        response.setId(station.getId());
        response.setStationCode(station.getStationCode());
        response.setStationName(station.getStationName());
        response.setLatitude(station.getLatitude());
        response.setLongitude(station.getLongitude());
        response.setCity(station.getCity());
        response.setState(station.getState());
        response.setPlatformCount(station.getPlatformCount());
        response.setContactNumber(station.getContactNumber());
        response.setAddress(station.getAddress());
        response.setCreatedAt(station.getCreatedAt());
        return response;
    }
}
