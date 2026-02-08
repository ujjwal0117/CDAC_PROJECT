package com.example.demo.controller;

import com.example.demo.dto.SupportRequest;
import com.example.demo.entity.SupportTicket;
import com.example.demo.service.SupportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import java.util.List;

@RestController
@RequestMapping("/api/support")
@CrossOrigin(origins = "*")
public class SupportController {

    @Autowired
    private SupportService supportService;

    @Autowired
    private com.example.demo.repository.UserRepository userRepository;

    @PostMapping
    public ResponseEntity<SupportTicket> createTicket(@RequestBody SupportRequest request) {
        // Auto-fill email if user is logged in
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
            userRepository.findByUsername(auth.getName()).ifPresent(user -> {
                if (request.getEmail() == null || request.getEmail().isEmpty()) {
                    request.setEmail(user.getEmail());
                }
            });
        }
        return ResponseEntity.ok(supportService.createTicket(request));
    }

    @GetMapping("/my-tickets")
    public ResponseEntity<List<SupportTicket>> getMyTickets() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        String email = userRepository.findByUsername(username)
                .map(com.example.demo.entity.User::getEmail)
                .orElse(username);

        return ResponseEntity.ok(supportService.getTicketsByEmail(email));
    }

    @GetMapping
    public ResponseEntity<List<SupportTicket>> getAllTickets() {
        return ResponseEntity.ok(supportService.getAllTickets());
    }
}
