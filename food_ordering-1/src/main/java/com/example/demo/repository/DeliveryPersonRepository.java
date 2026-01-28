package com.example.demo.repository;

import com.example.demo.entity.DeliveryPerson;
import com.example.demo.entity.DeliveryPersonStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryPersonRepository extends JpaRepository<DeliveryPerson, Long> {

    Optional<DeliveryPerson> findByPhoneNumber(String phoneNumber);

    Optional<DeliveryPerson> findByEmail(String email);

    List<DeliveryPerson> findByCurrentStatusAndIsActiveTrue(DeliveryPersonStatus status);

    List<DeliveryPerson> findByIsActiveTrue();

    List<DeliveryPerson> findByCurrentStatus(DeliveryPersonStatus status);
}
