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
import com.cs261g7cstu.backend.enums.ResourceKind;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class CourseMapperTest {

    private CourseMapper courseMapper;

    @BeforeEach
    void setUp() {
        courseMapper = new CourseMapper();
    }

    @Test
    void toCourseItemDTO_shouldMapAllFields() {
        UUID courseId = UUID.randomUUID();
        Course course = new Course();
        course.setId(courseId);
        course.setCode("CS101");
        course.setName("Introduction to Programming");
        course.setDesc("Basic programming concepts");

        CourseItemDTO result = courseMapper.toCourseItemDTO(course);

        assertNotNull(result);
        assertEquals(courseId, result.id());
        assertEquals("CS101", result.code());
        assertEquals("Introduction to Programming", result.name());
        assertEquals("Basic programming concepts", result.desc());
    }

    @Test
    void toPrerequisiteDTO_shouldMapAllFields() {
        UUID courseId = UUID.randomUUID();
        UUID prereqId = UUID.randomUUID();
        Prerequisite prerequisite = new Prerequisite();
        prerequisite.setId(UUID.randomUUID());
        prerequisite.setCourseId(courseId);
        prerequisite.setPrerequisiteId(prereqId);
        prerequisite.setTimestamp(LocalDateTime.now());

        PrerequisiteDTO result = courseMapper.toPrerequisiteDTO(prerequisite);

        assertNotNull(result);
        assertEquals(courseId, result.courseId());
        assertEquals(prereqId, result.prerequisiteId());
    }

    @Test
    void toSkillTreeDTO_shouldMapCoursesAndPrerequisites() {
        UUID course1Id = UUID.randomUUID();
        UUID course2Id = UUID.randomUUID();

        Course course1 = new Course();
        course1.setId(course1Id);
        course1.setCode("CS101");
        course1.setName("Intro to CS");
        course1.setDesc("Course 1");

        Course course2 = new Course();
        course2.setId(course2Id);
        course2.setCode("CS102");
        course2.setName("Object-Oriented Programming");
        course2.setDesc("Course 2");

        Prerequisite prereq = new Prerequisite();
        prereq.setId(UUID.randomUUID());
        prereq.setCourseId(course2Id);
        prereq.setPrerequisiteId(course1Id);
        prereq.setTimestamp(LocalDateTime.now());

        SkillTreeDTO result = courseMapper.toSkillTreeDTO(List.of(course1, course2), List.of(prereq));

        assertNotNull(result);
        assertEquals(2, result.courses().size());
        assertEquals("CS101", result.courses().get(0).code());
        assertEquals("CS102", result.courses().get(1).code());
        assertEquals(1, result.prerequisites().size());
        assertEquals(course2Id, result.prerequisites().get(0).courseId());
        assertEquals(course1Id, result.prerequisites().get(0).prerequisiteId());
    }

    @Test
    void toTopicItemDTO_shouldMapTopicAndSeqNo() {
        UUID topicId = UUID.randomUUID();
        Topic topic = new Topic();
        topic.setId(topicId);
        topic.setName("Variables and Data Types");
        topic.setDesc("Primitive types in Java");

        CourseTopic courseTopic = new CourseTopic();
        courseTopic.setId(UUID.randomUUID());
        courseTopic.setCourseId(UUID.randomUUID());
        courseTopic.setTopic(topic);
        courseTopic.setSeqNo(1);

        TopicItemDTO result = courseMapper.toTopicItemDTO(courseTopic, List.of(), List.of());

        assertNotNull(result);
        assertEquals(topicId, result.id());
        assertEquals("Variables and Data Types", result.name());
        assertEquals("Primitive types in Java", result.desc());
        assertEquals(1, result.seqNo());
        assertNotNull(result.prerequisites());
        assertTrue(result.prerequisites().isEmpty());
        assertNotNull(result.resources());
        assertTrue(result.resources().isEmpty());
    }

    @Test
    void toTopicItemDTO_shouldMapPrerequisitesAndResources() {
        UUID topicId = UUID.randomUUID();
        UUID prereqTopicId = UUID.randomUUID();
        UUID resourceId = UUID.randomUUID();
        LocalDateTime now = LocalDateTime.now();

        Topic topic = new Topic();
        topic.setId(topicId);
        topic.setName("OOP");
        topic.setDesc("Classes and objects");

        CourseTopic courseTopic = new CourseTopic();
        courseTopic.setId(UUID.randomUUID());
        courseTopic.setCourseId(UUID.randomUUID());
        courseTopic.setTopic(topic);
        courseTopic.setSeqNo(2);

        ResourceDTO resourceDTO = new ResourceDTO(
                resourceId,
                "url",
                null,
                "https://example.com/oop",
                "OOP Guide",
                "Read chapter 1",
                now
        );

        TopicItemDTO result = courseMapper.toTopicItemDTO(
                courseTopic,
                List.of(prereqTopicId),
                List.of(resourceDTO)
        );

        assertNotNull(result);
        assertEquals(List.of(prereqTopicId), result.prerequisites());
        assertEquals(List.of(resourceDTO), result.resources());
    }

    @Test
    void toResourceDTO_shouldMapKindToLowercaseTypeNameToTitleAndDescToNote() {
        UUID urlResId = UUID.randomUUID();
        LocalDateTime timestamp = LocalDateTime.of(2026, 3, 1, 10, 0);

        Resource urlResource = new Resource();
        urlResource.setId(urlResId);
        urlResource.setKind(ResourceKind.URL);
        urlResource.setUrl("https://docs.spring.io");
        urlResource.setName("Spring Docs");
        urlResource.setDesc("Official reference");
        urlResource.setTimestamp(timestamp);

        ResourceDTO urlResult = courseMapper.toResourceDTO(urlResource);

        assertNotNull(urlResult);
        assertEquals(urlResId, urlResult.id());
        assertEquals("url", urlResult.type());
        assertNull(urlResult.filePath());
        assertEquals("https://docs.spring.io", urlResult.url());
        assertEquals("Spring Docs", urlResult.title());
        assertEquals("Official reference", urlResult.note());
        assertEquals(timestamp, urlResult.timestamp());

        UUID fileResId = UUID.randomUUID();
        Resource fileResource = new Resource();
        fileResource.setId(fileResId);
        fileResource.setKind(ResourceKind.FILE);
        fileResource.setFilePath("/slides/week1.pdf");
        fileResource.setName("Week 1 Slides");
        fileResource.setDesc("Lecture notes");
        fileResource.setTimestamp(timestamp);

        ResourceDTO fileResult = courseMapper.toResourceDTO(fileResource);

        assertNotNull(fileResult);
        assertEquals("file", fileResult.type());
        assertEquals("/slides/week1.pdf", fileResult.filePath());
        assertEquals("Week 1 Slides", fileResult.title());
        assertEquals("Lecture notes", fileResult.note());
    }

    @Test
    void toDetailDTO_shouldMapCourseAndOrderedTopicsWithEmptyListsWhenNoRelationsOrResources() {
        UUID courseId = UUID.randomUUID();
        Course course = new Course();
        course.setId(courseId);
        course.setCode("CS261");
        course.setName("Software Engineering");
        course.setDesc("SE fundamentals");

        Topic topic1 = new Topic();
        topic1.setId(UUID.randomUUID());
        topic1.setName("Requirements");
        topic1.setDesc("User stories");

        Topic topic2 = new Topic();
        topic2.setId(UUID.randomUUID());
        topic2.setName("Architecture");
        topic2.setDesc("Class and sequence diagrams");

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

        CourseDetailDTO result = courseMapper.toDetailDTO(course, List.of(ct1, ct2), List.of(), List.of());

        assertNotNull(result);
        assertEquals(courseId, result.id());
        assertEquals("CS261", result.code());
        assertEquals("Software Engineering", result.name());
        assertEquals("SE fundamentals", result.desc());
        assertEquals(2, result.topics().size());
        assertEquals("Requirements", result.topics().get(0).name());
        assertEquals(1, result.topics().get(0).seqNo());
        assertNotNull(result.topics().get(0).prerequisites());
        assertTrue(result.topics().get(0).prerequisites().isEmpty());
        assertNotNull(result.topics().get(0).resources());
        assertTrue(result.topics().get(0).resources().isEmpty());
        assertEquals("Architecture", result.topics().get(1).name());
        assertEquals(2, result.topics().get(1).seqNo());
        assertNotNull(result.topics().get(1).prerequisites());
        assertTrue(result.topics().get(1).prerequisites().isEmpty());
        assertNotNull(result.topics().get(1).resources());
        assertTrue(result.topics().get(1).resources().isEmpty());
    }

    @Test
    void toDetailDTO_shouldMapTopicPrerequisitesAndResourcesPerTopic() {
        UUID courseId = UUID.randomUUID();
        Course course = new Course();
        course.setId(courseId);
        course.setCode("CS261");
        course.setName("Software Engineering");
        course.setDesc("SE fundamentals");

        UUID topic1Id = UUID.randomUUID();
        Topic topic1 = new Topic();
        topic1.setId(topic1Id);
        topic1.setName("Requirements");
        topic1.setDesc("User stories");

        UUID topic2Id = UUID.randomUUID();
        Topic topic2 = new Topic();
        topic2.setId(topic2Id);
        topic2.setName("Architecture");
        topic2.setDesc("Class and sequence diagrams");

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

        TopicRelation relationForTopic2 = new TopicRelation();
        relationForTopic2.setId(UUID.randomUUID());
        relationForTopic2.setTopicId(topic2Id);
        relationForTopic2.setReqTopicId(topic1Id);
        relationForTopic2.setTimestamp(LocalDateTime.now());

        TopicRelation relationForOtherTopic = new TopicRelation();
        relationForOtherTopic.setId(UUID.randomUUID());
        relationForOtherTopic.setTopicId(UUID.randomUUID());
        relationForOtherTopic.setReqTopicId(topic1Id);
        relationForOtherTopic.setTimestamp(LocalDateTime.now());

        Resource resource1 = new Resource();
        resource1.setId(UUID.randomUUID());
        resource1.setKind(ResourceKind.URL);
        resource1.setUrl("https://example.com/req");
        resource1.setName("Requirements Video");
        resource1.setDesc("Intro to user stories");
        resource1.setTimestamp(LocalDateTime.now());

        ResourceTopic rtForTopic1 = new ResourceTopic();
        rtForTopic1.setId(UUID.randomUUID());
        rtForTopic1.setTopicId(topic1Id);
        rtForTopic1.setResource(resource1);

        ResourceTopic rtForOtherTopic = new ResourceTopic();
        rtForOtherTopic.setId(UUID.randomUUID());
        rtForOtherTopic.setTopicId(UUID.randomUUID());
        rtForOtherTopic.setResource(resource1);

        CourseDetailDTO result = courseMapper.toDetailDTO(
                course,
                List.of(ct1, ct2),
                List.of(relationForTopic2, relationForOtherTopic),
                List.of(rtForTopic1, rtForOtherTopic)
        );

        assertEquals(2, result.topics().size());

        TopicItemDTO mappedTopic1 = result.topics().get(0);
        assertNotNull(mappedTopic1.prerequisites());
        assertTrue(mappedTopic1.prerequisites().isEmpty());
        assertEquals(1, mappedTopic1.resources().size());
        assertEquals("url", mappedTopic1.resources().get(0).type());
        assertEquals("Requirements Video", mappedTopic1.resources().get(0).title());
        assertEquals("Intro to user stories", mappedTopic1.resources().get(0).note());
        assertEquals("https://example.com/req", mappedTopic1.resources().get(0).url());

        TopicItemDTO mappedTopic2 = result.topics().get(1);
        assertEquals(List.of(topic1Id), mappedTopic2.prerequisites());
        assertNotNull(mappedTopic2.resources());
        assertTrue(mappedTopic2.resources().isEmpty());
    }
}

