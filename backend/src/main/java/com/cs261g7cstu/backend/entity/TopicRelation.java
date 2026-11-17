package com.cs261g7cstu.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "topic_relations",
        uniqueConstraints = @UniqueConstraint(columnNames = {"topic_id", "req_topic_id"})
)
public class TopicRelation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "topic_id", nullable = false)
    private UUID topicId;

    @Column(name = "req_topic_id", nullable = false)
    private UUID reqTopicId;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    public TopicRelation() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getTopicId() {
        return topicId;
    }

    public void setTopicId(UUID topicId) {
        this.topicId = topicId;
    }

    public UUID getReqTopicId() {
        return reqTopicId;
    }

    public void setReqTopicId(UUID reqTopicId) {
        this.reqTopicId = reqTopicId;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
