package com.example.demo.service.Impl;

import com.example.demo.dto.PassengerRequest;
import com.example.demo.dto.PassengerResponse;
import com.example.demo.entity.Passenger;
import com.example.demo.entity.User;
import com.example.demo.repository.PassengerRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.PassengerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PassengerServiceImpl implements PassengerService {

    @Autowired
    private PassengerRepository passengerRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public List<PassengerResponse> getPassengers(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        return passengerRepository.findByUserId(user.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PassengerResponse addPassenger(String username, PassengerRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        Passenger passenger = new Passenger();
        passenger.setName(request.getName());
        passenger.setAge(request.getAge());
        passenger.setGender(request.getGender());
        passenger.setUser(user);

        Passenger saved = passengerRepository.save(passenger);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public PassengerResponse updatePassenger(String username, Long passengerId, PassengerRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        if (passengerId == null)
            throw new RuntimeException("Passenger ID is required");
        Passenger passenger = passengerRepository.findById(passengerId)
                .orElseThrow(() -> new RuntimeException("Passenger not found: " + passengerId));

        // Verify the passenger belongs to the user
        if (!passenger.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Passenger does not belong to this user");
        }

        passenger.setName(request.getName());
        passenger.setAge(request.getAge());
        passenger.setGender(request.getGender());

        Passenger updated = passengerRepository.save(passenger);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deletePassenger(String username, Long passengerId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        if (passengerId == null)
            throw new RuntimeException("Passenger ID is required");
        Passenger passenger = passengerRepository.findById(passengerId)
                .orElseThrow(() -> new RuntimeException("Passenger not found: " + passengerId));

        // Verify the passenger belongs to the user
        if (!passenger.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Passenger does not belong to this user");
        }

        passengerRepository.delete(passenger);
    }

    private PassengerResponse mapToResponse(Passenger passenger) {
        return new PassengerResponse(
                passenger.getId(),
                passenger.getName(),
                passenger.getAge(),
                passenger.getGender());
    }
}
