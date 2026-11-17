package com.cs261g7cstu.backend.repository;

import com.cs261g7cstu.backend.entity.TopicRelation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface TopicRelationRepository extends JpaRepository<TopicRelation, UUID> {

    List<TopicRelation> findByTopicIdIn(Collection<UUID> topicIds);
}
