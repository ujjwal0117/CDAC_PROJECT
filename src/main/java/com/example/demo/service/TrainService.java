package com.example.demo.service;

import com.example.demo.dto.TrainRequest;
import com.example.demo.entity.Train;

import java.util.List;

public interface TrainService {
    Train createTrain(TrainRequest request);
    Train getTrainById(Long id);
    Train getTrainByNumber(String trainNumber);
    List<Train> getAllTrains();
    List<Train> getActiveTrains();
    Train updateTrain(Long id, TrainRequest request);
    void deleteTrain(Long id);
}
