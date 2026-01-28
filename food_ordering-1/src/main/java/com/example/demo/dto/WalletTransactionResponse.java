package com.example.demo.dto;

import com.example.demo.entity.WalletTransaction;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WalletTransactionResponse {

    private Long id;
    private Long walletId;
    private String type;
    private Double amount;
    private Double balanceAfter;
    private String description;
    private Long orderId;
    private Long paymentId;
    private String transactionRef;
    private LocalDateTime createdAt;

    public static WalletTransactionResponse fromEntity(WalletTransaction transaction) {
        WalletTransactionResponse response = new WalletTransactionResponse();
        response.setId(transaction.getId());
        response.setWalletId(transaction.getWallet().getId());
        response.setType(transaction.getType().name());
        response.setAmount(transaction.getAmount());
        response.setBalanceAfter(transaction.getBalanceAfter());
        response.setDescription(transaction.getDescription());
        response.setOrderId(transaction.getOrder() != null ? transaction.getOrder().getId() : null);
        response.setPaymentId(transaction.getPayment() != null ? transaction.getPayment().getId() : null);
        response.setTransactionRef(transaction.getTransactionRef());
        response.setCreatedAt(transaction.getCreatedAt());
        return response;
    }
}
