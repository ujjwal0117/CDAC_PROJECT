package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TrainStatusResponse {

    private String trainNumber;
    private String trainName;
    private String currentStatus; // ON_TIME, DELAYED, CANCELLED
    private String currentStation;
    private String currentStationCode;
    private Double currentLatitude;
    private Double currentLongitude;
    private Integer delayMinutes;
    private String nextStation;
    private String nextStationCode;
    private Integer distanceToNextStation; // in km
    private Integer estimatedTimeToNextStation; // in minutes
    private Double averageSpeed; // in km/h
}
