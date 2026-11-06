package com.zenelait.crm.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

/**
 * Zenelait AI CRM — Education/Training Company Admin V1 REST API Controller
 * Implements Part A Education/Training Company Admin API Catalogue:
 * - Courses & Categories (/api/v1/admin/education/courses, /course-categories)
 * - Batches & Enrolments (/api/v1/admin/education/batches, /batches/{id}/enrolments)
 * - Admission Configuration & Lead Routing (/api/v1/admin/education/admission-settings, /admission-stages, /qualification-questions, /assignment-rules)
 * - Admission Enquiries & Applications (/api/v1/admin/education/enquiries, /applications, /students)
 * - Counselling & Student Support (/api/v1/admin/education/counsellors, /counselling-sessions, /support-requests)
 */
@RestController
@RequestMapping("/api/v1/admin/education")
@CrossOrigin(origins = "*")
public class EducationAdminV1Controller {

    private final List<Map<String, Object>> courses = new ArrayList<>();
    private final List<Map<String, Object>> courseCategories = new ArrayList<>();
    private final List<Map<String, Object>> batches = new ArrayList<>();
    private final List<Map<String, Object>> enquiries = new ArrayList<>();
    private final List<Map<String, Object>> applications = new ArrayList<>();
    private final List<Map<String, Object>> students = new ArrayList<>();
    private final List<Map<String, Object>> counsellors = new ArrayList<>();
    private final List<Map<String, Object>> counsellingSessions = new ArrayList<>();
    private final List<Map<String, Object>> supportRequests = new ArrayList<>();
    private final List<Map<String, Object>> admissionStages = new ArrayList<>();
    private final List<Map<String, Object>> qualificationQuestions = new ArrayList<>();
    private final List<Map<String, Object>> assignmentRules = new ArrayList<>();
    private final Map<String, Object> admissionSettings = new LinkedHashMap<>();

    public EducationAdminV1Controller() {
        initEducationData();
    }

    private void initEducationData() {
        // 1. Course Categories
        courseCategories.add(new LinkedHashMap<>(Map.of("id", "CAT-01", "name", "Software Development", "code", "SOFTWARE_DEV", "coursesCount", 6)));
        courseCategories.add(new LinkedHashMap<>(Map.of("id", "CAT-02", "name", "Data Science & AI", "code", "DATA_AI", "coursesCount", 4)));
        courseCategories.add(new LinkedHashMap<>(Map.of("id", "CAT-03", "name", "Cloud & DevOps", "code", "CLOUD_DEVOPS", "coursesCount", 3)));
        courseCategories.add(new LinkedHashMap<>(Map.of("id", "CAT-04", "name", "Product & UI/UX", "code", "PRODUCT_DESIGN", "coursesCount", 5)));

        // 2. Courses
        courses.add(buildCourse("CRS-1001", "JAVA-FS-001", "Java Full Stack Development", "SOFTWARE_DEVELOPMENT",
                "Java 21, Spring Boot, React, Microservices and AWS deployment", 24, "HYBRID", "ACTIVE", 45000));
        courses.add(buildCourse("CRS-1002", "AI-ML-002", "Applied Generative AI & LLMs", "DATA_AI",
                "Python, PyTorch, LangChain, RAG Systems, Fine-Tuning & Multi-Agent orchestration", 16, "ONLINE", "ACTIVE", 60000));
        courses.add(buildCourse("CRS-1003", "CLOUD-DEV-003", "Cloud Native DevOps & Kubernetes", "CLOUD_DEVOPS",
                "Docker, K8s, Terraform, CI/CD, Observability & Site Reliability", 12, "WEEKEND", "ACTIVE", 38000));

        // 3. Batches
        batches.add(buildBatch("BAT-1001", "CRS-1001", "JAVA-OCT-2026", "October Java Full Stack Batch",
                "2026-11-02", "2027-04-30", 40, 28, "HYBRID", "PLANNED"));
        batches.add(buildBatch("BAT-1002", "CRS-1002", "AI-NOV-2026", "November GenAI Engineers Cohort",
                "2026-11-15", "2027-03-15", 35, 32, "ONLINE", "CONFIRMED"));

        // 4. Admission Stages
        admissionStages.add(new LinkedHashMap<>(Map.of("stageId", "STG-01", "name", "New Enquiry", "order", 1, "color", "#3b82f6")));
        admissionStages.add(new LinkedHashMap<>(Map.of("stageId", "STG-02", "name", "Counselling Scheduled", "order", 2, "color", "#8b5cf6")));
        admissionStages.add(new LinkedHashMap<>(Map.of("stageId", "STG-03", "name", "Application Submitted", "order", 3, "color", "#f59e0b")));
        admissionStages.add(new LinkedHashMap<>(Map.of("stageId", "STG-04", "name", "Interview / Aptitude Cleared", "order", 4, "color", "#06b6d4")));
        admissionStages.add(new LinkedHashMap<>(Map.of("stageId", "STG-05", "name", "Fee Paid & Enrolled", "order", 5, "color", "#10b981")));
        admissionStages.add(new LinkedHashMap<>(Map.of("stageId", "STG-06", "name", "Lost / Dropped", "order", 6, "color", "#ef4444")));

        // 5. Qualification Questions
        qualificationQuestions.add(new LinkedHashMap<>(Map.of("id", "QQ-01", "question", "Highest educational qualification?", "type", "DROPDOWN", "required", true)));
        qualificationQuestions.add(new LinkedHashMap<>(Map.of("id", "QQ-02", "question", "Years of coding experience?", "type", "NUMBER", "required", true)));
        qualificationQuestions.add(new LinkedHashMap<>(Map.of("id", "QQ-03", "question", "Target completion timeline?", "type", "TEXT", "required", false)));

        // 6. Assignment Rules
        assignmentRules.add(new LinkedHashMap<>(Map.of("ruleId", "RULE-EDU-01", "name", "Round Robin Counselors", "distribution", "ROUND_ROBIN", "status", "ACTIVE")));

        // 7. Enquiries
        enquiries.add(buildEnquiry("ENQ-1001", "Karthik Subramanian", "karthik.subramanian@gmail.com", "+91 98401 22334",
                "CRS-1001", "Java Full Stack Development", "STG-02", "USR-COUN-101", "WEBSITE_FORM", "HOT"));
        enquiries.add(buildEnquiry("ENQ-1002", "Ananya Deshmukh", "ananya.d@gmail.com", "+91 97654 33211",
                "CRS-1002", "Applied Generative AI & LLMs", "STG-01", "USR-COUN-102", "WHATSAPP", "WARM"));

        // 8. Applications
        applications.add(buildApplication("APP-1001", "ENQ-1001", "Karthik Subramanian", "CRS-1001", "BAT-1001", "SUBMITTED", "PENDING_REVIEW"));
        applications.add(buildApplication("APP-1002", "ENQ-1003", "Meera Krishnan", "CRS-1002", "BAT-1002", "APPROVED", "ACCEPTED"));

        // 9. Students
        students.add(buildStudent("STU-1001", "Rohan Verma", "rohan.v@gmail.com", "+91 98112 34567", "CRS-1001", "BAT-1001", "ENROLLED", "95% Attendance"));
        students.add(buildStudent("STU-1002", "Deepika Iyer", "deepika.i@gmail.com", "+91 99400 11223", "CRS-1002", "BAT-1002", "ENROLLED", "Top Performer"));

        // 10. Counsellors
        counsellors.add(new LinkedHashMap<>(Map.of("counsellorId", "USR-COUN-101", "name", "Rajesh Nambiar", "email", "rajesh.counsellor@brightpath.edu", "activeSessions", 4, "rating", 4.9)));
        counsellors.add(new LinkedHashMap<>(Map.of("counsellorId", "USR-COUN-102", "name", "Divya Menon", "email", "divya.counsellor@brightpath.edu", "activeSessions", 6, "rating", 4.8)));

        // 11. Counselling Sessions
        counsellingSessions.add(new LinkedHashMap<>(Map.of(
                "sessionId", "COUN-1001",
                "enquiryId", "ENQ-1001",
                "studentName", "Karthik Subramanian",
                "counsellorId", "USR-COUN-101",
                "counsellorName", "Rajesh Nambiar",
                "startAt", "2026-10-26T10:00:00+05:30",
                "endAt", "2026-10-26T10:30:00+05:30",
                "mode", "ONLINE",
                "meetingPlatform", "VIDEO_CALL",
                "status", "SCHEDULED"
        )));

        // 12. Support Requests
        supportRequests.add(new LinkedHashMap<>(Map.of(
                "requestId", "SUP-EDU-101",
                "studentId", "STU-1001",
                "studentName", "Rohan Verma",
                "subject", "LMS Portal Login issue for Docker module",
                "priority", "MEDIUM",
                "status", "OPEN",
                "assignedTo", "STUDENT_SUPPORT_AGENT",
                "createdAt", Instant.now().minusSeconds(3600).toString()
        )));

        // 13. Settings
        admissionSettings.put("allowAutoEnrolment", false);
        admissionSettings.put("defaultPaymentPlan", "SPLIT_TWO_TERMS");
        admissionSettings.put("enableWhatsappReminders", true);
        admissionSettings.put("counsellingBufferMinutes", 15);
    }

    private Map<String, Object> buildCourse(String id, String code, String name, String category,
                                           String desc, int weeks, String mode, String status, double fee) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("courseId", id);
        m.put("courseCode", code);
        m.put("name", name);
        m.put("category", category);
        m.put("description", desc);
        m.put("durationWeeks", weeks);
        m.put("deliveryMode", mode);
        m.put("status", status);
        m.put("fee", fee);
        m.put("currency", "INR");
        m.put("createdAt", Instant.now().toString());
        return m;
    }

    private Map<String, Object> buildBatch(String id, String courseId, String batchCode, String name,
                                          String startDate, String endDate, int capacity, int enrolled, String mode, String status) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("batchId", id);
        m.put("courseId", courseId);
        m.put("batchCode", batchCode);
        m.put("name", name);
        m.put("startDate", startDate);
        m.put("endDate", endDate);
        m.put("capacity", capacity);
        m.put("enrolledCount", enrolled);
        m.put("availableSeats", capacity - enrolled);
        m.put("deliveryMode", mode);
        m.put("status", status);
        return m;
    }

    private Map<String, Object> buildEnquiry(String id, String name, String email, String phone,
                                            String courseId, String courseName, String stageId, String ownerId, String channel, String leadScore) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("enquiryId", id);
        m.put("name", name);
        m.put("email", email);
        m.put("phone", phone);
        m.put("courseId", courseId);
        m.put("courseName", courseName);
        m.put("stageId", stageId);
        m.put("assignedOwnerId", ownerId);
        m.put("channel", channel);
        m.put("leadScore", leadScore);
        m.put("createdAt", Instant.now().minusSeconds(7200).toString());
        return m;
    }

    private Map<String, Object> buildApplication(String id, String enquiryId, String applicantName,
                                                String courseId, String batchId, String submissionStatus, String approvalStatus) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("applicationId", id);
        m.put("enquiryId", enquiryId);
        m.put("applicantName", applicantName);
        m.put("courseId", courseId);
        m.put("batchId", batchId);
        m.put("submissionStatus", submissionStatus);
        m.put("approvalStatus", approvalStatus);
        m.put("submittedAt", Instant.now().minusSeconds(14400).toString());
        return m;
    }

    private Map<String, Object> buildStudent(String id, String name, String email, String phone,
                                            String courseId, String batchId, String status, String note) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("studentId", id);
        m.put("name", name);
        m.put("email", email);
        m.put("phone", phone);
        m.put("courseId", courseId);
        m.put("batchId", batchId);
        m.put("status", status);
        m.put("note", note);
        m.put("enrolledDate", "2026-10-01");
        return m;
    }

    // ==========================================
    // 1. Courses Endpoints
    // ==========================================
    @GetMapping("/courses")
    public ResponseEntity<?> getCourses() {
        return ResponseEntity.ok(Map.of("success", true, "data", courses, "total", courses.size()));
    }

    @PostMapping("/courses")
    public ResponseEntity<?> createCourse(@RequestBody Map<String, Object> req) {
        String id = "CRS-" + (courses.size() + 1001);
        String code = (String) req.getOrDefault("courseCode", "CRS-CODE-" + System.currentTimeMillis());
        String name = (String) req.getOrDefault("name", "New Course");
        String cat = (String) req.getOrDefault("category", "SOFTWARE_DEVELOPMENT");
        String desc = (String) req.getOrDefault("description", "");
        int weeks = req.get("durationWeeks") != null ? Integer.parseInt(req.get("durationWeeks").toString()) : 12;
        String mode = (String) req.getOrDefault("deliveryMode", "ONLINE");
        String status = (String) req.getOrDefault("status", "ACTIVE");
        double fee = req.get("fee") != null ? Double.parseDouble(req.get("fee").toString()) : 50000;

        Map<String, Object> course = buildCourse(id, code, name, cat, desc, weeks, mode, status, fee);
        courses.add(0, course);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "Course created successfully",
                "data", course
        ));
    }

    @GetMapping("/courses/{courseId}")
    public ResponseEntity<?> getCourse(@PathVariable String courseId) {
        return courses.stream()
                .filter(c -> courseId.equals(c.get("courseId")))
                .findFirst()
                .map(c -> ResponseEntity.ok(Map.of("success", true, "data", c)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Course not found")));
    }

    @PatchMapping("/courses/{courseId}")
    public ResponseEntity<?> updateCourse(@PathVariable String courseId, @RequestBody Map<String, Object> updates) {
        for (Map<String, Object> c : courses) {
            if (courseId.equals(c.get("courseId"))) {
                c.putAll(updates);
                return ResponseEntity.ok(Map.of("success", true, "message", "Course updated", "data", c));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Course not found"));
    }

    @PatchMapping("/courses/{courseId}/status")
    public ResponseEntity<?> updateCourseStatus(@PathVariable String courseId, @RequestBody Map<String, Object> req) {
        for (Map<String, Object> c : courses) {
            if (courseId.equals(c.get("courseId"))) {
                c.put("status", req.getOrDefault("status", "ARCHIVED"));
                return ResponseEntity.ok(Map.of("success", true, "message", "Course status updated", "data", c));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Course not found"));
    }

    @GetMapping("/course-categories")
    public ResponseEntity<?> getCourseCategories() {
        return ResponseEntity.ok(Map.of("success", true, "data", courseCategories));
    }

    @PostMapping("/course-categories")
    public ResponseEntity<?> createCourseCategory(@RequestBody Map<String, Object> req) {
        Map<String, Object> cat = new LinkedHashMap<>();
        cat.put("id", "CAT-" + (courseCategories.size() + 1));
        cat.put("name", req.getOrDefault("name", "New Category"));
        cat.put("code", req.getOrDefault("code", "CAT_CODE"));
        cat.put("coursesCount", 0);
        courseCategories.add(cat);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "data", cat));
    }

    // ==========================================
    // 2. Batches Endpoints
    // ==========================================
    @GetMapping("/batches")
    public ResponseEntity<?> getBatches() {
        return ResponseEntity.ok(Map.of("success", true, "data", batches, "total", batches.size()));
    }

    @PostMapping("/batches")
    public ResponseEntity<?> createBatch(@RequestBody Map<String, Object> req) {
        String id = "BAT-" + (batches.size() + 1001);
        String courseId = (String) req.getOrDefault("courseId", "CRS-1001");
        String code = (String) req.getOrDefault("batchCode", "BAT-" + System.currentTimeMillis());
        String name = (String) req.getOrDefault("name", "New Batch");
        String start = (String) req.getOrDefault("startDate", "2026-11-01");
        String end = (String) req.getOrDefault("endDate", "2027-04-30");
        int cap = req.get("capacity") != null ? Integer.parseInt(req.get("capacity").toString()) : 30;
        String mode = (String) req.getOrDefault("deliveryMode", "HYBRID");
        String status = (String) req.getOrDefault("status", "PLANNED");

        Map<String, Object> batch = buildBatch(id, courseId, code, name, start, end, cap, 0, mode, status);
        batches.add(0, batch);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "Batch created successfully",
                "data", batch
        ));
    }

    @GetMapping("/batches/{batchId}")
    public ResponseEntity<?> getBatch(@PathVariable String batchId) {
        return batches.stream()
                .filter(b -> batchId.equals(b.get("batchId")))
                .findFirst()
                .map(b -> ResponseEntity.ok(Map.of("success", true, "data", b)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Batch not found")));
    }

    @PatchMapping("/batches/{batchId}")
    public ResponseEntity<?> updateBatch(@PathVariable String batchId, @RequestBody Map<String, Object> updates) {
        for (Map<String, Object> b : batches) {
            if (batchId.equals(b.get("batchId"))) {
                b.putAll(updates);
                return ResponseEntity.ok(Map.of("success", true, "message", "Batch updated", "data", b));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Batch not found"));
    }

    @PatchMapping("/batches/{batchId}/status")
    public ResponseEntity<?> updateBatchStatus(@PathVariable String batchId, @RequestBody Map<String, Object> req) {
        for (Map<String, Object> b : batches) {
            if (batchId.equals(b.get("batchId"))) {
                b.put("status", req.getOrDefault("status", "ACTIVE"));
                return ResponseEntity.ok(Map.of("success", true, "message", "Batch status updated", "data", b));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Batch not found"));
    }

    @GetMapping("/batches/{batchId}/enrolments")
    public ResponseEntity<?> getBatchEnrolments(@PathVariable String batchId) {
        List<Map<String, Object>> enrolled = students.stream()
                .filter(s -> batchId.equals(s.get("batchId")))
                .toList();
        return ResponseEntity.ok(Map.of("success", true, "batchId", batchId, "enrolments", enrolled, "count", enrolled.size()));
    }

    // ==========================================
    // 3. Admission Configuration Endpoints
    // ==========================================
    @GetMapping("/admission-settings")
    public ResponseEntity<?> getAdmissionSettings() {
        return ResponseEntity.ok(Map.of("success", true, "data", admissionSettings));
    }

    @PatchMapping("/admission-settings")
    public ResponseEntity<?> updateAdmissionSettings(@RequestBody Map<String, Object> updates) {
        admissionSettings.putAll(updates);
        return ResponseEntity.ok(Map.of("success", true, "message", "Admission settings updated", "data", admissionSettings));
    }

    @GetMapping("/admission-stages")
    public ResponseEntity<?> getAdmissionStages() {
        return ResponseEntity.ok(Map.of("success", true, "data", admissionStages));
    }

    @PostMapping("/admission-stages")
    public ResponseEntity<?> createAdmissionStage(@RequestBody Map<String, Object> req) {
        Map<String, Object> stg = new LinkedHashMap<>(req);
        stg.put("stageId", "STG-0" + (admissionStages.size() + 1));
        admissionStages.add(stg);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "data", stg));
    }

    @PatchMapping("/admission-stages/{stageId}")
    public ResponseEntity<?> updateAdmissionStage(@PathVariable String stageId, @RequestBody Map<String, Object> req) {
        for (Map<String, Object> s : admissionStages) {
            if (stageId.equals(s.get("stageId"))) {
                s.putAll(req);
                return ResponseEntity.ok(Map.of("success", true, "data", s));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Stage not found"));
    }

    @GetMapping("/qualification-questions")
    public ResponseEntity<?> getQualificationQuestions() {
        return ResponseEntity.ok(Map.of("success", true, "data", qualificationQuestions));
    }

    @PostMapping("/qualification-questions")
    public ResponseEntity<?> createQualificationQuestion(@RequestBody Map<String, Object> req) {
        Map<String, Object> q = new LinkedHashMap<>(req);
        q.put("id", "QQ-" + (qualificationQuestions.size() + 1));
        qualificationQuestions.add(q);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "data", q));
    }

    @PatchMapping("/qualification-questions/{questionId}")
    public ResponseEntity<?> updateQualificationQuestion(@PathVariable String questionId, @RequestBody Map<String, Object> req) {
        for (Map<String, Object> q : qualificationQuestions) {
            if (questionId.equals(q.get("id"))) {
                q.putAll(req);
                return ResponseEntity.ok(Map.of("success", true, "data", q));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Question not found"));
    }

    @GetMapping("/assignment-rules")
    public ResponseEntity<?> getAssignmentRules() {
        return ResponseEntity.ok(Map.of("success", true, "data", assignmentRules));
    }

    @PostMapping("/assignment-rules")
    public ResponseEntity<?> createAssignmentRule(@RequestBody Map<String, Object> req) {
        Map<String, Object> rule = new LinkedHashMap<>(req);
        rule.put("ruleId", "RULE-EDU-" + (assignmentRules.size() + 1));
        assignmentRules.add(rule);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "data", rule));
    }

    @PatchMapping("/assignment-rules/{ruleId}")
    public ResponseEntity<?> updateAssignmentRule(@PathVariable String ruleId, @RequestBody Map<String, Object> req) {
        for (Map<String, Object> r : assignmentRules) {
            if (ruleId.equals(r.get("ruleId"))) {
                r.putAll(req);
                return ResponseEntity.ok(Map.of("success", true, "data", r));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Rule not found"));
    }

    // ==========================================
    // 4. Enquiries, Applications & Students
    // ==========================================
    @GetMapping("/enquiries")
    public ResponseEntity<?> getEnquiries() {
        return ResponseEntity.ok(Map.of("success", true, "data", enquiries, "total", enquiries.size()));
    }

    @GetMapping("/enquiries/{enquiryId}")
    public ResponseEntity<?> getEnquiry(@PathVariable String enquiryId) {
        return enquiries.stream()
                .filter(e -> enquiryId.equals(e.get("enquiryId")))
                .findFirst()
                .map(e -> ResponseEntity.ok(Map.of("success", true, "data", e)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Enquiry not found")));
    }

    @PostMapping("/enquiries")
    public ResponseEntity<?> createEnquiry(@RequestBody Map<String, Object> req) {
        String id = "ENQ-" + (enquiries.size() + 1001);
        String name = (String) req.getOrDefault("name", "Prospective Student");
        String email = (String) req.getOrDefault("email", "student@example.com");
        String phone = (String) req.getOrDefault("phone", "+91 90000 00000");
        String courseId = (String) req.getOrDefault("courseId", "CRS-1001");
        String courseName = (String) req.getOrDefault("courseName", "Full Stack Development");
        String stageId = (String) req.getOrDefault("stageId", "STG-01");
        String ownerId = (String) req.getOrDefault("assignedOwnerId", "USR-COUN-101");
        String channel = (String) req.getOrDefault("channel", "WEBSITE");
        String leadScore = (String) req.getOrDefault("leadScore", "WARM");

        Map<String, Object> enq = buildEnquiry(id, name, email, phone, courseId, courseName, stageId, ownerId, channel, leadScore);
        enquiries.add(0, enq);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "message", "Enquiry created", "data", enq));
    }

    @PatchMapping("/enquiries/{enquiryId}")
    public ResponseEntity<?> updateEnquiry(@PathVariable String enquiryId, @RequestBody Map<String, Object> req) {
        for (Map<String, Object> e : enquiries) {
            if (enquiryId.equals(e.get("enquiryId"))) {
                e.putAll(req);
                return ResponseEntity.ok(Map.of("success", true, "data", e));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Enquiry not found"));
    }

    @PatchMapping("/enquiries/{enquiryId}/assignment")
    public ResponseEntity<?> updateEnquiryAssignment(@PathVariable String enquiryId, @RequestBody Map<String, Object> req) {
        for (Map<String, Object> e : enquiries) {
            if (enquiryId.equals(e.get("enquiryId"))) {
                e.put("assignedOwnerId", req.get("assignedOwnerId"));
                return ResponseEntity.ok(Map.of("success", true, "message", "Owner assigned", "data", e));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Enquiry not found"));
    }

    @PatchMapping("/enquiries/{enquiryId}/stage")
    public ResponseEntity<?> updateEnquiryStage(@PathVariable String enquiryId, @RequestBody Map<String, Object> req) {
        for (Map<String, Object> e : enquiries) {
            if (enquiryId.equals(e.get("enquiryId"))) {
                e.put("stageId", req.get("stageId"));
                return ResponseEntity.ok(Map.of("success", true, "message", "Stage updated", "data", e));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Enquiry not found"));
    }

    @GetMapping("/applications")
    public ResponseEntity<?> getApplications() {
        return ResponseEntity.ok(Map.of("success", true, "data", applications, "total", applications.size()));
    }

    @PostMapping("/applications")
    public ResponseEntity<?> createApplication(@RequestBody Map<String, Object> req) {
        String id = "APP-" + (applications.size() + 1001);
        String enqId = (String) req.getOrDefault("enquiryId", "ENQ-1001");
        String name = (String) req.getOrDefault("applicantName", "Applicant");
        String courseId = (String) req.getOrDefault("courseId", "CRS-1001");
        String batchId = (String) req.getOrDefault("batchId", "BAT-1001");

        Map<String, Object> app = buildApplication(id, enqId, name, courseId, batchId, "SUBMITTED", "PENDING_REVIEW");
        applications.add(0, app);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "data", app));
    }

    @GetMapping("/applications/{applicationId}")
    public ResponseEntity<?> getApplication(@PathVariable String applicationId) {
        return applications.stream()
                .filter(a -> applicationId.equals(a.get("applicationId")))
                .findFirst()
                .map(a -> ResponseEntity.ok(Map.of("success", true, "data", a)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Application not found")));
    }

    @PatchMapping("/applications/{applicationId}")
    public ResponseEntity<?> updateApplication(@PathVariable String applicationId, @RequestBody Map<String, Object> req) {
        for (Map<String, Object> a : applications) {
            if (applicationId.equals(a.get("applicationId"))) {
                a.putAll(req);
                return ResponseEntity.ok(Map.of("success", true, "data", a));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Application not found"));
    }

    @PatchMapping("/applications/{applicationId}/status")
    public ResponseEntity<?> updateApplicationStatus(@PathVariable String applicationId, @RequestBody Map<String, Object> req) {
        for (Map<String, Object> a : applications) {
            if (applicationId.equals(a.get("applicationId"))) {
                a.put("submissionStatus", req.getOrDefault("submissionStatus", a.get("submissionStatus")));
                a.put("approvalStatus", req.getOrDefault("approvalStatus", a.get("approvalStatus")));
                return ResponseEntity.ok(Map.of("success", true, "message", "Status updated", "data", a));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Application not found"));
    }

    @PostMapping("/applications/{applicationId}/approval")
    public ResponseEntity<?> requestApplicationApproval(@PathVariable String applicationId) {
        for (Map<String, Object> a : applications) {
            if (applicationId.equals(a.get("applicationId"))) {
                a.put("approvalStatus", "APPROVED");
                return ResponseEntity.ok(Map.of("success", true, "message", "Application approved", "data", a));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Application not found"));
    }

    @GetMapping("/students")
    public ResponseEntity<?> getStudents() {
        return ResponseEntity.ok(Map.of("success", true, "data", students, "total", students.size()));
    }

    @GetMapping("/students/{studentId}")
    public ResponseEntity<?> getStudent(@PathVariable String studentId) {
        return students.stream()
                .filter(s -> studentId.equals(s.get("studentId")))
                .findFirst()
                .map(s -> ResponseEntity.ok(Map.of("success", true, "data", s)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Student not found")));
    }

    @PostMapping("/students")
    public ResponseEntity<?> createStudent(@RequestBody Map<String, Object> req) {
        String id = "STU-" + (students.size() + 1001);
        String name = (String) req.getOrDefault("name", "Student Name");
        String email = (String) req.getOrDefault("email", "student@example.edu");
        String phone = (String) req.getOrDefault("phone", "+91 99999 88888");
        String courseId = (String) req.getOrDefault("courseId", "CRS-1001");
        String batchId = (String) req.getOrDefault("batchId", "BAT-1001");
        String status = (String) req.getOrDefault("status", "ENROLLED");
        String note = (String) req.getOrDefault("note", "New enrolment");

        Map<String, Object> stu = buildStudent(id, name, email, phone, courseId, batchId, status, note);
        students.add(0, stu);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "data", stu));
    }

    @PatchMapping("/students/{studentId}")
    public ResponseEntity<?> updateStudent(@PathVariable String studentId, @RequestBody Map<String, Object> req) {
        for (Map<String, Object> s : students) {
            if (studentId.equals(s.get("studentId"))) {
                s.putAll(req);
                return ResponseEntity.ok(Map.of("success", true, "data", s));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Student not found"));
    }

    // ==========================================
    // 5. Counselling & Student Support
    // ==========================================
    @GetMapping("/counsellors")
    public ResponseEntity<?> getCounsellors() {
        return ResponseEntity.ok(Map.of("success", true, "data", counsellors));
    }

    @GetMapping("/counselling-sessions")
    public ResponseEntity<?> getCounsellingSessions() {
        return ResponseEntity.ok(Map.of("success", true, "data", counsellingSessions, "total", counsellingSessions.size()));
    }

    @PostMapping("/counselling-sessions")
    public ResponseEntity<?> createCounsellingSession(@RequestBody Map<String, Object> req) {
        String id = "COUN-" + (counsellingSessions.size() + 1001);
        Map<String, Object> s = new LinkedHashMap<>(req);
        s.put("sessionId", id);
        s.put("status", req.getOrDefault("status", "SCHEDULED"));
        s.put("createdAt", Instant.now().toString());
        counsellingSessions.add(0, s);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "Counselling session scheduled",
                "data", s
        ));
    }

    @GetMapping("/counselling-sessions/{sessionId}")
    public ResponseEntity<?> getCounsellingSession(@PathVariable String sessionId) {
        return counsellingSessions.stream()
                .filter(s -> sessionId.equals(s.get("sessionId")))
                .findFirst()
                .map(s -> ResponseEntity.ok(Map.of("success", true, "data", s)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Session not found")));
    }

    @PatchMapping("/counselling-sessions/{sessionId}")
    public ResponseEntity<?> updateCounsellingSession(@PathVariable String sessionId, @RequestBody Map<String, Object> req) {
        for (Map<String, Object> s : counsellingSessions) {
            if (sessionId.equals(s.get("sessionId"))) {
                s.putAll(req);
                return ResponseEntity.ok(Map.of("success", true, "data", s));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Session not found"));
    }

    @PatchMapping("/counselling-sessions/{sessionId}/status")
    public ResponseEntity<?> updateCounsellingSessionStatus(@PathVariable String sessionId, @RequestBody Map<String, Object> req) {
        for (Map<String, Object> s : counsellingSessions) {
            if (sessionId.equals(s.get("sessionId"))) {
                s.put("status", req.getOrDefault("status", "COMPLETED"));
                return ResponseEntity.ok(Map.of("success", true, "message", "Status updated", "data", s));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Session not found"));
    }

    @GetMapping("/support-requests")
    public ResponseEntity<?> getSupportRequests() {
        return ResponseEntity.ok(Map.of("success", true, "data", supportRequests, "total", supportRequests.size()));
    }

    @PostMapping("/support-requests")
    public ResponseEntity<?> createSupportRequest(@RequestBody Map<String, Object> req) {
        String id = "SUP-EDU-" + (supportRequests.size() + 101);
        Map<String, Object> sup = new LinkedHashMap<>(req);
        sup.put("requestId", id);
        sup.put("status", "OPEN");
        sup.put("createdAt", Instant.now().toString());
        supportRequests.add(0, sup);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "data", sup));
    }

    @GetMapping("/support-requests/{requestId}")
    public ResponseEntity<?> getSupportRequest(@PathVariable String requestId) {
        return supportRequests.stream()
                .filter(r -> requestId.equals(r.get("requestId")))
                .findFirst()
                .map(r -> ResponseEntity.ok(Map.of("success", true, "data", r)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Request not found")));
    }

    @PatchMapping("/support-requests/{requestId}")
    public ResponseEntity<?> updateSupportRequest(@PathVariable String requestId, @RequestBody Map<String, Object> req) {
        for (Map<String, Object> r : supportRequests) {
            if (requestId.equals(r.get("requestId"))) {
                r.putAll(req);
                return ResponseEntity.ok(Map.of("success", true, "data", r));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Request not found"));
    }

    @PatchMapping("/support-requests/{requestId}/assignment")
    public ResponseEntity<?> updateSupportAssignment(@PathVariable String requestId, @RequestBody Map<String, Object> req) {
        for (Map<String, Object> r : supportRequests) {
            if (requestId.equals(r.get("requestId"))) {
                r.put("assignedTo", req.get("assignedTo"));
                return ResponseEntity.ok(Map.of("success", true, "data", r));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Request not found"));
    }

    @PostMapping("/support-requests/{requestId}/comments")
    public ResponseEntity<?> addSupportComment(@PathVariable String requestId, @RequestBody Map<String, Object> req) {
        for (Map<String, Object> r : supportRequests) {
            if (requestId.equals(r.get("requestId"))) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> comments = (List<Map<String, Object>>) r.computeIfAbsent("comments", k -> new ArrayList<>());
                Map<String, Object> comment = new LinkedHashMap<>();
                comment.put("commentId", "CMT-" + System.currentTimeMillis());
                comment.put("text", req.get("text"));
                comment.put("author", req.getOrDefault("author", "Support Agent"));
                comment.put("createdAt", Instant.now().toString());
                comments.add(comment);
                return ResponseEntity.ok(Map.of("success", true, "message", "Comment added", "data", comment));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Request not found"));
    }
}
