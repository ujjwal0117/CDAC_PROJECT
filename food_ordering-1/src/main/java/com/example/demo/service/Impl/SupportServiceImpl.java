package com.example.demo.service.Impl;

import com.example.demo.dto.SupportRequest;
import com.example.demo.entity.SupportTicket;
import com.example.demo.repository.SupportTicketRepository;
import com.example.demo.service.SupportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SupportServiceImpl implements SupportService {

    @Autowired
    private SupportTicketRepository supportTicketRepository;

    @Override
    public SupportTicket createTicket(SupportRequest request) {
        SupportTicket ticket = new SupportTicket();
        ticket.setName(request.getName());
        ticket.setEmail(request.getEmail());
        ticket.setMessage(request.getMessage());
        ticket.setStatus("OPEN");
        return supportTicketRepository.save(ticket);
    }

    @Override
    public List<SupportTicket> getAllTickets() {
        return supportTicketRepository.findAll();
    }

    @Override
    public List<SupportTicket> getTicketsByEmail(String email) {
        return supportTicketRepository.findByEmailOrderByCreatedAtDesc(email);
    }
}
