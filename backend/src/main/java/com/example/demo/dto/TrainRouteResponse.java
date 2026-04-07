package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TrainRouteResponse {
    private Long id;
    private Long stationId;
    private String stationCode;
    private String stationName;
    private Integer stopNumber;
    private String scheduledArrival;
    private String scheduledDeparture;
    private String platformNumber;
    private Integer distanceFromSource;
    private Integer dayNumber;
}
