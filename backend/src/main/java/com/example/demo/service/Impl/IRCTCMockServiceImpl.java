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
        // Create response object early
        TrainStatusResponse response = new TrainStatusResponse();
        response.setTrainNumber(trainNumber);

        try {
            // Try to find train
            Train train = trainRepository.findByTrainNumber(trainNumber).orElse(null);
            response.setTrainName(train != null ? train.getTrainName() : "Express Train " + trainNumber);

            // Try to get train route
            List<TrainRoute> routes = train != null
                    ? trainRouteRepository.findByTrainIdOrderByStopNumberAsc(train.getId())
                    : null;

            if (routes != null && !routes.isEmpty()) {
                // Scenario A: Real route data exists
                int currentStopIndex = random.nextInt(routes.size());
                TrainRoute currentStop = routes.get(currentStopIndex);
                TrainRoute nextStop = currentStopIndex < routes.size() - 1 ? routes.get(currentStopIndex + 1) : null;

                response.setCurrentStation(currentStop.getStation().getStationName());
                response.setCurrentStationCode(currentStop.getStation().getStationCode());
                response.setCurrentLatitude(currentStop.getStation().getLatitude());
                response.setCurrentLongitude(currentStop.getStation().getLongitude());

                if (nextStop != null) {
                    response.setNextStation(nextStop.getStation().getStationName());
                    response.setNextStationCode(nextStop.getStation().getStationCode());
                    response.setDistanceToNextStation(
                            nextStop.getDistanceFromSource() != null && currentStop.getDistanceFromSource() != null
                                    ? nextStop.getDistanceFromSource() - currentStop.getDistanceFromSource()
                                    : random.nextInt(50) + 10);
                    response.setEstimatedTimeToNextStation(random.nextInt(40) + 10);
                }
            } else {
                // Scenario B: Fallback mock for trains without routes in DB
                response.setCurrentStation("Bandra Terminus");
                response.setCurrentStationCode("BDTS");
                response.setCurrentLatitude(19.0622);
                response.setCurrentLongitude(72.8464);

                response.setNextStation("Borivali");
                response.setNextStationCode("BVI");
                response.setDistanceToNextStation(18);
                response.setEstimatedTimeToNextStation(25);
            }

            // Shared Mock Logic
            String[] statuses = { "ON_TIME", "DELAYED", "ON_TIME", "ON_TIME" };
            response.setCurrentStatus(statuses[random.nextInt(statuses.length)]);

            if ("DELAYED".equals(response.getCurrentStatus())) {
                response.setDelayMinutes(random.nextInt(30) + 1);
            } else {
                response.setDelayMinutes(0);
            }

            response.setAverageSpeed(65.0 + random.nextDouble() * 30);

        } catch (Exception e) {
            // Ultimate fallback
            response.setTrainName("Express " + trainNumber);
            response.setCurrentStatus("ON_TIME");
            response.setCurrentStation("Mumbai Central");
            response.setCurrentStationCode("MMCT");
            response.setCurrentLatitude(18.9696);
            response.setCurrentLongitude(72.8193);
            response.setDelayMinutes(0);
            response.setAverageSpeed(75.5);
        }

        return response;
    }

    @Override
    public TrainStatusResponse getRunningStatus(String trainNumber, String date) {
        // For simplicity, return same as live status
        // In real implementation, this would check historical data for specific date
        return getTrainStatus(trainNumber);
    }
}
