package com.example.demo.repository;

import com.example.demo.entity.TrainRoute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrainRouteRepository extends JpaRepository<TrainRoute, Long> {

    List<TrainRoute> findByTrainIdOrderByStopNumberAsc(Long trainId);

    List<TrainRoute> findByStationId(Long stationId);

    @Query("SELECT tr FROM TrainRoute tr WHERE tr.train.id = :trainId AND tr.station.id = :stationId")
    TrainRoute findByTrainIdAndStationId(Long trainId, Long stationId);
}
