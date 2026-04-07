package com.example.demo.repository;

import com.example.demo.entity.Pnr;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PnrRepository extends JpaRepository<Pnr, Long> {
    Optional<Pnr> findByPnrNumber(String pnrNumber);

    Boolean existsByPnrNumber(String pnrNumber);
}
