package com.cs261g7cstu.backend.dto;

import java.util.List;
import java.util.UUID;

public record TopicItemDTO(
        UUID id,
        String name,
        String desc,
        int seqNo,
        List<UUID> prerequisites,
        List<ResourceDTO> resources
) {
}
