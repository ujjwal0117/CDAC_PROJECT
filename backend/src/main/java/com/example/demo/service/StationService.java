package com.example.demo.service;

import com.example.demo.entity.Station;
import java.util.List;

public interface StationService {
    List<Station> getAllStations();

    Station getStationById(Long id);
}
