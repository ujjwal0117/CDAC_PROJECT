package com.example.demo.repository;

import com.example.demo.entity.DeliveryStatus;
import com.example.demo.entity.OrderTracking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderTrackingRepository extends JpaRepository<OrderTracking, Long> {

    Optional<OrderTracking> findByOrderId(Long orderId);

    List<OrderTracking> findByDeliveryPersonId(Long deliveryPersonId);

    List<OrderTracking> findByCurrentStatus(DeliveryStatus status);

    List<OrderTracking> findByDeliveryPersonIdAndCurrentStatus(Long deliveryPersonId, DeliveryStatus status);

    @Query("SELECT ot FROM OrderTracking ot WHERE ot.currentStatus IN ('OUT_FOR_DELIVERY', 'REACHED_STATION', 'ASSIGNED_TO_DELIVERY')")
    List<OrderTracking> findActiveDeliveries();

    boolean existsByOrderId(Long orderId);
}
