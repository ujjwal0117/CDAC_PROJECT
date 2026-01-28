package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StationRequest {

    @NotBlank(message = "Station code is required")
    private String stationCode;

    @NotBlank(message = "Station name is required")
    private String stationName;

    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    private Double longitude;

    private String city;
    private String state;
    private Integer platformCount;
    private String contactNumber;
    private String address;
}
