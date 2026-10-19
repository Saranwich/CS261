package com.cs261g7cstu.backend.dto;

public record TuVerifyResponseDTO(
        boolean status,
        String message,
        String type,
        String username,
        String tuStatus,
        String statusId,
        String displayNameTh,
        String displayNameEn,
        String email,
        String department,
        String faculty
) {
}
