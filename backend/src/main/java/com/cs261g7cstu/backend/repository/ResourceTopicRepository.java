package com.cs261g7cstu.backend.repository;

import com.cs261g7cstu.backend.entity.ResourceTopic;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface ResourceTopicRepository extends JpaRepository<ResourceTopic, UUID> {

    // ดึง resource มาใน query เดียวกัน (join) ไม่ต้องยิงทีละแถว
    @EntityGraph(attributePaths = "resource")
    List<ResourceTopic> findByTopicIdIn(Collection<UUID> topicIds);
}
