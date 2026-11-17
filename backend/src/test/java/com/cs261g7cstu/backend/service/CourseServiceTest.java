package com.cs261g7cstu.backend.service;

import com.cs261g7cstu.backend.dto.CourseDetailDTO;
import com.cs261g7cstu.backend.dto.CourseItemDTO;
import com.cs261g7cstu.backend.dto.PrerequisiteDTO;
import com.cs261g7cstu.backend.dto.ResourceDTO;
import com.cs261g7cstu.backend.dto.SkillTreeDTO;
import com.cs261g7cstu.backend.dto.TopicItemDTO;
import com.cs261g7cstu.backend.entity.Course;
import com.cs261g7cstu.backend.entity.CourseTopic;
import com.cs261g7cstu.backend.entity.Prerequisite;
import com.cs261g7cstu.backend.entity.ResourceTopic;
import com.cs261g7cstu.backend.entity.Topic;
import com.cs261g7cstu.backend.entity.TopicRelation;
import com.cs261g7cstu.backend.mapper.CourseMapper;
import com.cs261g7cstu.backend.repository.CourseRepository;
import com.cs261g7cstu.backend.repository.CourseTopicRepository;
import com.cs261g7cstu.backend.repository.PrerequisiteRepository;
import com.cs261g7cstu.backend.repository.ResourceTopicRepository;
import com.cs261g7cstu.backend.repository.TopicRelationRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CourseServiceTest {

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private CourseTopicRepository courseTopicRepository;

    @Mock
    private PrerequisiteRepository prerequisiteRepository;

    @Mock
    private TopicRelationRepository topicRelationRepository;

    @Mock
    private ResourceTopicRepository resourceTopicRepository;

    @Mock
    private CourseMapper courseMapper;

    @InjectMocks
    private CourseService courseService;

    @Test
    void getSkillTree_shouldFetchCoursesAndPrerequisitesAndReturnSkillTreeDTO() {
        Course course = new Course();
        course.setId(UUID.randomUUID());
        Prerequisite prerequisite = new Prerequisite();
        prerequisite.setId(UUID.randomUUID());

        List<Course> courses = List.of(course);
        List<Prerequisite> prerequisites = List.of(prerequisite);

        SkillTreeDTO expectedDto = new SkillTreeDTO(
                List.of(new CourseItemDTO(course.getId(), "CS101", "Intro", "Desc")),
                List.of(new PrerequisiteDTO(UUID.randomUUID(), course.getId()))
        );

        when(courseRepository.findAll()).thenReturn(courses);
        when(prerequisiteRepository.findAll()).thenReturn(prerequisites);
        when(courseMapper.toSkillTreeDTO(courses, prerequisites)).thenReturn(expectedDto);

        SkillTreeDTO result = courseService.getSkillTree();

        assertNotNull(result);
        assertEquals(expectedDto, result);
        verify(courseRepository).findAll();
        verify(prerequisiteRepository).findAll();
        verify(courseMapper).toSkillTreeDTO(courses, prerequisites);
    }

    @Test
    void getCourseDetail_whenCourseNotFound_shouldThrowNotFoundException() {
        UUID courseId = UUID.randomUUID();
        when(courseRepository.findById(courseId)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(
                ResponseStatusException.class,
                () -> courseService.getCourseDetail(courseId)
        );

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        verifyNoInteractions(courseTopicRepository, topicRelationRepository, resourceTopicRepository);
    }

    @Test
    void getCourseDetail_whenCourseExists_shouldReturnCourseDetailDTO() {
        UUID courseId = UUID.randomUUID();
        Course course = new Course();
        course.setId(courseId);
        course.setCode("CS261");
        course.setName("Software Engineering");
        course.setDesc("SE course");

        UUID topicId = UUID.randomUUID();
        Topic topic = new Topic();
        topic.setId(topicId);

        CourseTopic ct = new CourseTopic();
        ct.setId(UUID.randomUUID());
        ct.setCourseId(courseId);
        ct.setTopic(topic);
        ct.setSeqNo(1);
        List<CourseTopic> courseTopics = List.of(ct);
        List<UUID> topicIds = List.of(topicId);
        List<TopicRelation> topicRelations = List.of();
        List<ResourceTopic> resourceTopics = List.of();

        CourseDetailDTO expectedDto = new CourseDetailDTO(
                courseId,
                "CS261",
                "Software Engineering",
                "SE course",
                List.of(new TopicItemDTO(topicId, "Topic 1", "Desc", 1, List.of(), List.of()))
        );

        when(courseRepository.findById(courseId)).thenReturn(Optional.of(course));
        when(courseTopicRepository.findByCourseIdOrderBySeqNoAsc(courseId)).thenReturn(courseTopics);
        when(topicRelationRepository.findByTopicIdIn(topicIds)).thenReturn(topicRelations);
        when(resourceTopicRepository.findByTopicIdIn(topicIds)).thenReturn(resourceTopics);
        when(courseMapper.toDetailDTO(course, courseTopics, topicRelations, resourceTopics)).thenReturn(expectedDto);

        CourseDetailDTO result = courseService.getCourseDetail(courseId);

        assertNotNull(result);
        assertEquals(expectedDto, result);
        verify(courseRepository).findById(courseId);
        verify(courseTopicRepository).findByCourseIdOrderBySeqNoAsc(courseId);
        verify(topicRelationRepository).findByTopicIdIn(topicIds);
        verify(resourceTopicRepository).findByTopicIdIn(topicIds);
        verify(courseMapper).toDetailDTO(course, courseTopics, topicRelations, resourceTopics);
    }

    @Test
    void getCourseDetail_whenTopicsHavePrerequisitesAndResources_shouldQueryBothReposAndPassToMapper() {
        UUID courseId = UUID.randomUUID();
        Course course = new Course();
        course.setId(courseId);
        course.setCode("CS261");
        course.setName("Software Engineering");
        course.setDesc("SE course");

        UUID topic1Id = UUID.randomUUID();
        Topic topic1 = new Topic();
        topic1.setId(topic1Id);

        UUID topic2Id = UUID.randomUUID();
        Topic topic2 = new Topic();
        topic2.setId(topic2Id);

        CourseTopic ct1 = new CourseTopic();
        ct1.setId(UUID.randomUUID());
        ct1.setCourseId(courseId);
        ct1.setTopic(topic1);
        ct1.setSeqNo(1);

        CourseTopic ct2 = new CourseTopic();
        ct2.setId(UUID.randomUUID());
        ct2.setCourseId(courseId);
        ct2.setTopic(topic2);
        ct2.setSeqNo(2);

        List<CourseTopic> courseTopics = List.of(ct1, ct2);
        List<UUID> topicIds = List.of(topic1Id, topic2Id);

        TopicRelation relation = new TopicRelation();
        relation.setId(UUID.randomUUID());
        relation.setTopicId(topic2Id);
        relation.setReqTopicId(topic1Id);
        List<TopicRelation> topicRelations = List.of(relation);

        ResourceTopic resourceTopic = new ResourceTopic();
        resourceTopic.setId(UUID.randomUUID());
        resourceTopic.setTopicId(topic1Id);
        List<ResourceTopic> resourceTopics = List.of(resourceTopic);

        ResourceDTO resourceDTO = new ResourceDTO(
                UUID.randomUUID(),
                "url",
                null,
                "https://example.com/guide",
                "Guide",
                "Required reading",
                LocalDateTime.now()
        );
        CourseDetailDTO expectedDto = new CourseDetailDTO(
                courseId,
                "CS261",
                "Software Engineering",
                "SE course",
                List.of(
                        new TopicItemDTO(topic1Id, "Topic 1", "Desc 1", 1, List.of(), List.of(resourceDTO)),
                        new TopicItemDTO(topic2Id, "Topic 2", "Desc 2", 2, List.of(topic1Id), List.of())
                )
        );

        when(courseRepository.findById(courseId)).thenReturn(Optional.of(course));
        when(courseTopicRepository.findByCourseIdOrderBySeqNoAsc(courseId)).thenReturn(courseTopics);
        when(topicRelationRepository.findByTopicIdIn(topicIds)).thenReturn(topicRelations);
        when(resourceTopicRepository.findByTopicIdIn(topicIds)).thenReturn(resourceTopics);
        when(courseMapper.toDetailDTO(course, courseTopics, topicRelations, resourceTopics)).thenReturn(expectedDto);

        CourseDetailDTO result = courseService.getCourseDetail(courseId);

        assertNotNull(result);
        assertEquals(expectedDto, result);
        verify(topicRelationRepository).findByTopicIdIn(topicIds);
        verify(resourceTopicRepository).findByTopicIdIn(topicIds);
        verify(courseMapper).toDetailDTO(course, courseTopics, topicRelations, resourceTopics);
    }
}

