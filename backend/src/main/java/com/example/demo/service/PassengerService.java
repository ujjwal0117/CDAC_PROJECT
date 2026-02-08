package com.example.demo.service;

import com.example.demo.dto.PassengerRequest;
import com.example.demo.dto.PassengerResponse;

import java.util.List;

public interface PassengerService {

    /**
     * Get all passengers for a user
     * 
     * @param username the current user's username
     * @return list of passengers
     */
    List<PassengerResponse> getPassengers(String username);

    /**
     * Add a new passenger for the user
     * 
     * @param username the current user's username
     * @param request  passenger details
     * @return created passenger
     */
    PassengerResponse addPassenger(String username, PassengerRequest request);

    /**
     * Update an existing passenger
     * 
     * @param username    the current user's username
     * @param passengerId the passenger ID
     * @param request     updated details
     * @return updated passenger
     */
    PassengerResponse updatePassenger(String username, Long passengerId, PassengerRequest request);

    /**
     * Delete a passenger
     * 
     * @param username    the current user's username
     * @param passengerId the passenger ID to delete
     */
    void deletePassenger(String username, Long passengerId);
}
