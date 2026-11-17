package com.cs261g7cstu.backend.mapper;

import com.cs261g7cstu.backend.dto.CourseDetailDTO;
import com.cs261g7cstu.backend.dto.CourseItemDTO;
import com.cs261g7cstu.backend.dto.PrerequisiteDTO;
import com.cs261g7cstu.backend.dto.ResourceDTO;
import com.cs261g7cstu.backend.dto.SkillTreeDTO;
import com.cs261g7cstu.backend.dto.TopicItemDTO;
import com.cs261g7cstu.backend.entity.Course;
import com.cs261g7cstu.backend.entity.CourseTopic;
import com.cs261g7cstu.backend.entity.Prerequisite;
import com.cs261g7cstu.backend.entity.Resource;
import com.cs261g7cstu.backend.entity.ResourceTopic;
import com.cs261g7cstu.backend.entity.Topic;
import com.cs261g7cstu.backend.entity.TopicRelation;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Component
public class CourseMapper {

    public SkillTreeDTO toSkillTreeDTO(List<Course> courses, List<Prerequisite> prerequisites) {
        return new SkillTreeDTO(
                courses.stream().map(this::toCourseItemDTO).toList(),
                prerequisites.stream().map(this::toPrerequisiteDTO).toList()
        );
    }

    public CourseItemDTO toCourseItemDTO(Course course) {
        return new CourseItemDTO(course.getId(), course.getCode(), course.getName(), course.getDesc());
    }

    public PrerequisiteDTO toPrerequisiteDTO(Prerequisite prerequisite) {
        return new PrerequisiteDTO(prerequisite.getCourseId(), prerequisite.getPrerequisiteId());
    }

    public CourseDetailDTO toDetailDTO(Course course,
                                       List<CourseTopic> courseTopics,
                                       List<TopicRelation> topicRelations,
                                       List<ResourceTopic> resourceTopics) {
        List<TopicItemDTO> topics = new ArrayList<>();
        for (CourseTopic courseTopic : courseTopics) {
            UUID topicId = courseTopic.getTopic().getId();
            List<UUID> prerequisites = findPrerequisites(topicId, topicRelations);
            List<ResourceDTO> resources = findResources(topicId, resourceTopics);
            topics.add(toTopicItemDTO(courseTopic, prerequisites, resources));
        }
        return new CourseDetailDTO(course.getId(), course.getCode(), course.getName(), course.getDesc(), topics);
    }

    // หัวข้อที่ต้องรู้ก่อน topicId (ไม่มีก็ได้ list ว่าง)
    private List<UUID> findPrerequisites(UUID topicId, List<TopicRelation> topicRelations) {
        List<UUID> prerequisites = new ArrayList<>();
        for (TopicRelation relation : topicRelations) {
            if (relation.getTopicId().equals(topicId)) {
                prerequisites.add(relation.getReqTopicId());
            }
        }
        return prerequisites;
    }

    // แหล่งเรียนของ topicId (ไม่มีก็ได้ list ว่าง)
    private List<ResourceDTO> findResources(UUID topicId, List<ResourceTopic> resourceTopics) {
        List<ResourceDTO> resources = new ArrayList<>();
        for (ResourceTopic resourceTopic : resourceTopics) {
            if (resourceTopic.getTopicId().equals(topicId)) {
                resources.add(toResourceDTO(resourceTopic.getResource()));
            }
        }
        return resources;
    }

    public TopicItemDTO toTopicItemDTO(CourseTopic courseTopic, List<UUID> prerequisites, List<ResourceDTO> resources) {
        Topic topic = courseTopic.getTopic();
        return new TopicItemDTO(
                topic.getId(),
                topic.getName(),
                topic.getDesc(),
                courseTopic.getSeqNo(),
                prerequisites,
                resources
        );
    }

    public ResourceDTO toResourceDTO(Resource resource) {
        return new ResourceDTO(
                resource.getId(),
                resource.getKind().name().toLowerCase(),
                resource.getFilePath(),
                resource.getUrl(),
                resource.getName(),
                resource.getDesc(),
                resource.getTimestamp()
        );
    }
}
