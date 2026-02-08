package com.example.demo.service;

import com.example.demo.dto.TrainStatusResponse;

public interface IRCTCMockService {

    /**
     * Get live train status (Mock implementation)
     */
    TrainStatusResponse getTrainStatus(String trainNumber);

    /**
     * Get running status for specific date (Mock implementation)
     */
    TrainStatusResponse getRunningStatus(String trainNumber, String date);
}
