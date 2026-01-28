package com.example.demo.repository;

import com.example.demo.entity.Station;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StationRepository extends JpaRepository<Station, Long> {

    Optional<Station> findByStationCode(String stationCode);

    List<Station> findByCity(String city);

    List<Station> findByState(String state);

    boolean existsByStationCode(String stationCode);
}
