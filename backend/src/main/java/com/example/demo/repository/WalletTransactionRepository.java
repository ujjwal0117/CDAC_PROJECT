package com.example.demo.repository;

import com.example.demo.entity.TransactionType;
import com.example.demo.entity.WalletTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {

    List<WalletTransaction> findByWalletIdOrderByCreatedAtDesc(Long walletId);

    List<WalletTransaction> findByWalletIdAndTypeOrderByCreatedAtDesc(Long walletId, TransactionType type);

    List<WalletTransaction> findByWalletIdAndCreatedAtBetweenOrderByCreatedAtDesc(
            Long walletId, LocalDateTime startDate, LocalDateTime endDate);

    @Query("SELECT SUM(wt.amount) FROM WalletTransaction wt WHERE wt.wallet.id = :walletId AND wt.type = :type")
    Double getTotalAmountByType(Long walletId, TransactionType type);

    List<WalletTransaction> findByOrderId(Long orderId);

    List<WalletTransaction> findByPaymentId(Long paymentId);
}
