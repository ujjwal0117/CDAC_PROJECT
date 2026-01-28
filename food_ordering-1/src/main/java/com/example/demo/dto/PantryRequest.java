package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PantryRequest {

    @NotNull(message = "Train ID is required")
    private Long trainId;

    @NotBlank(message = "Pantry code is required")
    private String pantryCode;

    @NotBlank(message = "Coach number is required")
    private String coachNumber;

    private String contactNumber;

    private String managerName;
}
