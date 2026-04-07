package com.example.demo.dto;

import com.example.demo.entity.Wallet;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WalletResponse {

    private Long id;
    private Long userId;
    private String username;
    private Double balance;
    private Boolean active;
    private Integer totalTransactions;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static WalletResponse fromEntity(Wallet wallet) {
        WalletResponse response = new WalletResponse();
        response.setId(wallet.getId());
        response.setUserId(wallet.getUser().getId());
        response.setUsername(wallet.getUser().getUsername());
        response.setBalance(wallet.getBalance());
        response.setActive(wallet.getActive());
        response.setTotalTransactions(wallet.getTransactions() != null ? wallet.getTransactions().size() : 0);
        response.setCreatedAt(wallet.getCreatedAt());
        response.setUpdatedAt(wallet.getUpdatedAt());
        return response;
    }
}
