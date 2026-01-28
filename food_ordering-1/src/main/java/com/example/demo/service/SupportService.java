package com.example.demo.service;

import com.example.demo.dto.SupportRequest;
import com.example.demo.entity.SupportTicket;

import java.util.List;

public interface SupportService {
    SupportTicket createTicket(SupportRequest request);

    List<SupportTicket> getAllTickets();

    List<SupportTicket> getTicketsByEmail(String email);
}
