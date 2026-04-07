package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PnrResponse {
    private String pnrNumber;
    private String coachNumber;
    private String seatNumber;
    private String passengerName;
    private String journeyDate;

    // Train info
    private Long trainId;
    private String trainNumber;
    private String trainName;
    private String source;
    private String destination;

    // Route info (stations)
    private List<TrainRouteResponse> route;
}
