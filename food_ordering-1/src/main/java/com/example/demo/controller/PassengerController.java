package com.example.demo.controller;

import com.example.demo.dto.PassengerRequest;
import com.example.demo.dto.PassengerResponse;
import com.example.demo.service.PassengerService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/passengers")
@CrossOrigin(origins = "*")
public class PassengerController {

    @Autowired
    private PassengerService passengerService;

    /**
     * Get all passengers for the current user
     * GET /api/passengers
     */
    @GetMapping
    public ResponseEntity<List<PassengerResponse>> getPassengers() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return ResponseEntity.ok(passengerService.getPassengers(username));
    }

    /**
     * Add a new passenger
     * POST /api/passengers
     */
    @PostMapping
    public ResponseEntity<PassengerResponse> addPassenger(@Valid @RequestBody PassengerRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return ResponseEntity.ok(passengerService.addPassenger(username, request));
    }

    /**
     * Update an existing passenger
     * PUT /api/passengers/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<PassengerResponse> updatePassenger(
            @PathVariable Long id,
            @Valid @RequestBody PassengerRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return ResponseEntity.ok(passengerService.updatePassenger(username, id, request));
    }

    /**
     * Delete a passenger
     * DELETE /api/passengers/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePassenger(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        passengerService.deletePassenger(username, id);
        return ResponseEntity.ok().build();
    }
}
