package com.example.demo.repository;

import com.example.demo.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(Long userId);

    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Order> findByStatus(Order.OrderStatus status);

    List<Order> findByPnrNumber(String pnrNumber);

    List<Order> findByRestaurantOwnerIdOrderByCreatedAtDesc(Long ownerId);
}