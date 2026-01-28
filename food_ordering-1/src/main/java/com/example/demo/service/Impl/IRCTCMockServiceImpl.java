package com.example.demo.service.Impl;

import com.example.demo.dto.TrainStatusResponse;
import com.example.demo.entity.Train;
import com.example.demo.entity.TrainRoute;
import com.example.demo.repository.TrainRepository;
import com.example.demo.repository.TrainRouteRepository;
import com.example.demo.service.IRCTCMockService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;

@Service
public class IRCTCMockServiceImpl implements IRCTCMockService {

    @Autowired
    private TrainRepository trainRepository;

    @Autowired
    private TrainRouteRepository trainRouteRepository;

    private final Random random = new Random();

    @Override
    public TrainStatusResponse getTrainStatus(String trainNumber) {
        // Find train
        Train train = trainRepository.findByTrainNumber(trainNumber)
                .orElseThrow(() -> new RuntimeException("Train not found: " + trainNumber));

        // Get train route
        List<TrainRoute> routes = trainRouteRepository.findByTrainIdOrderByStopNumberAsc(train.getId());

        if (routes.isEmpty()) {
            throw new RuntimeException("No route found for train: " + trainNumber);
        }

        // Mock: Pick a random station as current location
        int currentStopIndex = random.nextInt(routes.size());
        TrainRoute currentStop = routes.get(currentStopIndex);

        TrainRoute nextStop = currentStopIndex < routes.size() - 1 ? routes.get(currentStopIndex + 1) : null;

        // Create mock response
        TrainStatusResponse response = new TrainStatusResponse();
        response.setTrainNumber(train.getTrainNumber());
        response.setTrainName(train.getTrainName());

        // Mock status
        String[] statuses = { "ON_TIME", "DELAYED", "ON_TIME", "ON_TIME" }; // 75% on time
        response.setCurrentStatus(statuses[random.nextInt(statuses.length)]);

        // Current station
        response.setCurrentStation(currentStop.getStation().getStationName());
        response.setCurrentStationCode(currentStop.getStation().getStationCode());
        response.setCurrentLatitude(currentStop.getStation().getLatitude());
        response.setCurrentLongitude(currentStop.getStation().getLongitude());

        // Mock delay (0-30 minutes if delayed)
        if ("DELAYED".equals(response.getCurrentStatus())) {
            response.setDelayMinutes(random.nextInt(30) + 1);
        } else {
            response.setDelayMinutes(0);
        }

        // Next station
        if (nextStop != null) {
            response.setNextStation(nextStop.getStation().getStationName());
            response.setNextStationCode(nextStop.getStation().getStationCode());

            // Mock distance and time
            if (nextStop.getDistanceFromSource() != null && currentStop.getDistanceFromSource() != null) {
                response.setDistanceToNextStation(
                        nextStop.getDistanceFromSource() - currentStop.getDistanceFromSource());
            } else {
                response.setDistanceToNextStation(random.nextInt(50) + 10); // 10-60 km
            }

            response.setEstimatedTimeToNextStation(random.nextInt(40) + 10); // 10-50 minutes
        }

        // Mock average speed
        response.setAverageSpeed(60.0 + random.nextDouble() * 40); // 60-100 km/h

        return response;
    }

    @Override
    public TrainStatusResponse getRunningStatus(String trainNumber, String date) {
        // For simplicity, return same as live status
        // In real implementation, this would check historical data for specific date
        return getTrainStatus(trainNumber);
    }
}
