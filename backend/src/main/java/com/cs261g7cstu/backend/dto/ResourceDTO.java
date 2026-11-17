package com.cs261g7cstu.backend.dto;

import java.time.LocalDateTime;
import java.util.UUID;

// ชื่อ field ตั้งตามที่ frontend ใช้อยู่ (ResourceList.jsx): type, title, note
// map จาก column ใน ER: kind -> type, name -> title, desc -> note
public record ResourceDTO(
        UUID id,
        String type,
        String filePath,
        String url,
        String title,
        String note,
        LocalDateTime timestamp
) {
}
