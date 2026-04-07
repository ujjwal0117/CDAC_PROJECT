package com.example.demo.repository;

import com.example.demo.entity.Passenger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PassengerRepository extends JpaRepository<Passenger, Long> {
    List<Passenger> findByUserId(Long userId);

    void deleteByIdAndUserId(Long id, Long userId);
}
