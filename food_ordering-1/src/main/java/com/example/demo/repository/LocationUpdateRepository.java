package com.example.demo.repository;

import com.example.demo.entity.LocationUpdate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface LocationUpdateRepository extends JpaRepository<LocationUpdate, Long> {

    List<LocationUpdate> findByDeliveryPersonIdOrderByTimestampDesc(Long deliveryPersonId);

    @Query("SELECT lu FROM LocationUpdate lu WHERE lu.deliveryPerson.id = :deliveryPersonId ORDER BY lu.timestamp DESC LIMIT 1")
    Optional<LocationUpdate> findLatestByDeliveryPersonId(Long deliveryPersonId);

    List<LocationUpdate> findByOrderIdOrderByTimestampDesc(Long orderId);

    @Query("SELECT lu FROM LocationUpdate lu WHERE lu.order.id = :orderId ORDER BY lu.timestamp DESC LIMIT 1")
    Optional<LocationUpdate> findLatestByOrderId(Long orderId);

    List<LocationUpdate> findByTimestampBefore(LocalDateTime dateTime);

    void deleteByTimestampBefore(LocalDateTime dateTime);
}
