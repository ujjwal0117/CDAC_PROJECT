package com.example.demo.service.Impl;

import com.example.demo.dto.TrainRequest;
import com.example.demo.entity.Train;
import com.example.demo.repository.TrainRepository;
import com.example.demo.service.TrainService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TrainServiceImpl implements TrainService {

    @Autowired
    private TrainRepository trainRepository;

    @Override
    @Transactional
    public Train createTrain(TrainRequest request) {
        if (trainRepository.existsByTrainNumber(request.getTrainNumber())) {
            throw new RuntimeException("Train number already exists");
        }

        Train train = new Train();
        train.setTrainNumber(request.getTrainNumber());
        train.setTrainName(request.getTrainName());
        train.setSource(request.getSource());
        train.setDestination(request.getDestination());
        train.setDepartureTime(request.getDepartureTime());
        train.setArrivalTime(request.getArrivalTime());
        train.setActive(true);

        return trainRepository.save(train);
    }

    @Override
    public Train getTrainById(Long id) {
        if (id == null)
            return null;
        return trainRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Train not found"));
    }

    @Override
    public Train getTrainByNumber(String trainNumber) {
        return trainRepository.findByTrainNumber(trainNumber)
                .orElseThrow(() -> new RuntimeException("Train not found"));
    }

    @Override
    public List<Train> getAllTrains() {
        return trainRepository.findAll();
    }

    @Override
    public List<Train> getActiveTrains() {
        return trainRepository.findByActiveTrue();
    }

    @Override
    @Transactional
    public Train updateTrain(Long id, TrainRequest request) {
        if (id == null)
            throw new RuntimeException("ID is required");
        Train train = trainRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Train not found"));

        train.setTrainName(request.getTrainName());
        train.setSource(request.getSource());
        train.setDestination(request.getDestination());
        train.setDepartureTime(request.getDepartureTime());
        train.setArrivalTime(request.getArrivalTime());

        return trainRepository.save(train);
    }

    @Override
    @Transactional
    public void deleteTrain(Long id) {
        if (id == null)
            return;
        Train train = trainRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Train not found"));
        train.setActive(false);
        trainRepository.save(train);
    }
}