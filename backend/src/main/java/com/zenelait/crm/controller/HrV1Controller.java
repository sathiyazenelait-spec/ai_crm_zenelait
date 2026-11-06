package com.zenelait.crm.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

/**
 * Zenelait AI CRM — HR Role V1 REST API Controller
 * Implements Part B of the Software/IT Tenant API Blueprint:
 * - 10. HR Dashboard & Employee Management
 * - 11. Recruitment and Applicant Tracking (ATS)
 * - 12. Employee Onboarding & Offboarding
 * - 13. Leave & Attendance Management
 * - 14. HR Documents, Policies & Service Requests
 * - 15. HR & AI Automation APIs
 */
@RestController
@RequestMapping("/api/v1/hr")
@CrossOrigin(origins = "*")
public class HrV1Controller {

    // In-memory dynamic HR database stores
    private final List<Map<String, Object>> employees = new ArrayList<>();
    private final List<Map<String, Object>> departments = new ArrayList<>();
    private final List<Map<String, Object>> designations = new ArrayList<>();
    private final List<Map<String, Object>> jobs = new ArrayList<>();
    private final List<Map<String, Object>> candidates = new ArrayList<>();
    private final List<Map<String, Object>> applications = new ArrayList<>();
    private final List<Map<String, Object>> onboardingCases = new ArrayList<>();
    private final List<Map<String, Object>> leaveRequests = new ArrayList<>();
    private final List<Map<String, Object>> hrServiceRequests = new ArrayList<>();
    private final List<Map<String, Object>> hrPolicies = new ArrayList<>();

    public HrV1Controller() {
        // 1. Departments & Designations
        departments.addAll(List.of(
                Map.of("departmentId", "DEPT-IT", "name", "Information Technology", "headCount", 18),
                Map.of("departmentId", "DEPT-HR", "name", "Human Resources", "headCount", 4),
                Map.of("departmentId", "DEPT-SALES", "name", "Sales & Business Dev", "headCount", 12),
                Map.of("departmentId", "DEPT-MKT", "name", "Marketing & Growth", "headCount", 6)
        ));

        designations.addAll(List.of(
                Map.of("id", "DES-1", "title", "Senior Full-Stack Engineer"),
                Map.of("id", "DES-2", "title", "Java Developer"),
                Map.of("id", "DES-3", "title", "DevOps & Cloud Specialist"),
                Map.of("id", "DES-4", "title", "HR Executive"),
                Map.of("id", "DES-5", "title", "Enterprise Account Executive")
        ));

        // 2. Initial Seed Employee: Arun Kumar (EMP-1001)
        Map<String, Object> emp1 = new LinkedHashMap<>();
        emp1.put("employeeId", "EMP-1001");
        emp1.put("employeeCode", "EMP-1001");
        emp1.put("firstName", "Arun");
        emp1.put("lastName", "Kumar");
        emp1.put("fullName", "Arun Kumar");
        emp1.put("workEmail", "arun.kumar@abctech.example");
        emp1.put("department", "Information Technology");
        emp1.put("departmentId", "DEPT-IT");
        emp1.put("designation", "Java Developer");
        emp1.put("employmentStatus", "ACTIVE");
        emp1.put("employmentType", "FULL_TIME");
        emp1.put("joiningDate", "2026-11-02");
        emp1.put("phone", "+91 98765 11001");
        employees.add(emp1);

        Map<String, Object> emp2 = new LinkedHashMap<>();
        emp2.put("employeeId", "EMP-1002");
        emp2.put("employeeCode", "EMP-1002");
        emp2.put("firstName", "Kavitha");
        emp2.put("lastName", "Raj");
        emp2.put("fullName", "Kavitha Raj");
        emp2.put("workEmail", "kavitha.hr@abctech.example");
        emp2.put("department", "Human Resources");
        emp2.put("departmentId", "DEPT-HR");
        emp2.put("designation", "HR Executive");
        emp2.put("employmentStatus", "ACTIVE");
        emp2.put("employmentType", "FULL_TIME");
        emp2.put("joiningDate", "2026-03-15");
        emp2.put("phone", "+91 98765 11002");
        employees.add(emp2);

        // 3. Initial Job Openings
        jobs.add(new LinkedHashMap<>(Map.of(
                "jobId", "JOB-101",
                "title", "Senior Java & Cloud Architect",
                "department", "Information Technology",
                "openings", 2,
                "status", "OPEN",
                "location", "Chennai / Hybrid",
                "postedDate", "2026-10-10"
        )));
        jobs.add(new LinkedHashMap<>(Map.of(
                "jobId", "JOB-102",
                "title", "React / Frontend Lead",
                "department", "Information Technology",
                "openings", 3,
                "status", "OPEN",
                "location", "Chennai / Remote",
                "postedDate", "2026-10-15"
        )));

        // 4. Initial Candidate: Meena Raj (CAN-1001)
        candidates.add(new LinkedHashMap<>(Map.of(
                "candidateId", "CAN-1001",
                "fullName", "Meena Raj",
                "email", "meena.candidate@example.com",
                "phone", "+91-9000000011",
                "source", "CAREER_PAGE",
                "skills", List.of("Java", "Spring Boot", "MySQL", "AWS"),
                "experienceYears", 2,
                "status", "ACTIVE",
                "createdAt", Instant.now().toString()
        )));

        // 5. Job Application (Recruitment Stage)
        applications.add(new LinkedHashMap<>(Map.of(
                "applicationId", "APP-501",
                "candidateId", "CAN-1001",
                "candidateName", "Meena Raj",
                "jobId", "JOB-101",
                "jobTitle", "Senior Java & Cloud Architect",
                "stage", "INTERVIEW", // APPLIED → SCREENING → INTERVIEW → OFFER → HIRED
                "rating", "4.8 / 5",
                "appliedAt", "2026-10-18"
        )));

        // 6. Onboarding Case: Arun Kumar (ONB-1001)
        List<Map<String, Object>> tasks = new ArrayList<>();
        tasks.add(new LinkedHashMap<>(Map.of("taskId", "TSK-1", "title", "Verify employment documents", "assignedToRole", "HR", "dueDate", "2026-11-02", "completed", true)));
        tasks.add(new LinkedHashMap<>(Map.of("taskId", "TSK-2", "title", "Prepare laptop and developer access", "assignedToRole", "IT_ADMIN", "dueDate", "2026-11-02", "completed", false)));
        tasks.add(new LinkedHashMap<>(Map.of("taskId", "TSK-3", "title", "Schedule team introduction", "assignedToRole", "MANAGER", "dueDate", "2026-11-03", "completed", false)));

        onboardingCases.add(new LinkedHashMap<>(Map.of(
                "onboardingId", "ONB-1001",
                "employeeId", "EMP-1001",
                "employeeName", "Arun Kumar",
                "startDate", "2026-11-02",
                "status", "IN_PROGRESS",
                "progressPercent", 33,
                "tasks", tasks
        )));

        // 7. Leave Request: LVR-1001
        leaveRequests.add(new LinkedHashMap<>(Map.of(
                "requestId", "LVR-1001",
                "employeeId", "EMP-1001",
                "employeeName", "Arun Kumar",
                "leaveType", "CASUAL_LEAVE",
                "from", "2026-11-14",
                "to", "2026-11-15",
                "days", 2,
                "reason", "Family gathering / personal commitment",
                "status", "PENDING_APPROVAL",
                "submittedAt", "2026-10-22T05:30:00Z"
        )));

        // 8. HR Service Request: HRR-1001
        hrServiceRequests.add(new LinkedHashMap<>(Map.of(
                "requestId", "HRR-1001",
                "employeeId", "EMP-1001",
                "employeeName", "Arun Kumar",
                "category", "EMPLOYMENT_LETTER",
                "subject", "Request for employment verification letter",
                "description", "I need an employment verification letter for loan pre-approval.",
                "priority", "NORMAL",
                "status", "OPEN",
                "channel", "HR_PORTAL",
                "createdAt", Instant.now().toString()
        )));

        // 9. HR Policies
        hrPolicies.add(new LinkedHashMap<>(Map.of(
                "policyId", "POL-01",
                "title", "Annual Leave & Holiday Calendar 2026",
                "category", "LEAVE_POLICY",
                "status", "PUBLISHED",
                "publishedAt", "2026-01-05"
        )));
    }

    // ==========================================
    // 10. HR Dashboard & Employee Management
    // ==========================================
    @GetMapping("/dashboard")
    public ResponseEntity<?> getHrDashboard() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of(
                        "totalHeadcount", employees.size(),
                        "openPositions", jobs.size(),
                        "activeCandidates", candidates.size(),
                        "onboardingCases", onboardingCases.size(),
                        "pendingLeaves", leaveRequests.stream().filter(l -> "PENDING_APPROVAL".equals(l.get("status"))).count(),
                        "openServiceRequests", hrServiceRequests.stream().filter(r -> "OPEN".equals(r.get("status"))).count(),
                        "aiTriageAssisted", "84.5%"
                )
        ));
    }

    @GetMapping("/dashboard/activity")
    public ResponseEntity<?> getHrActivity() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", List.of(
                        Map.of("id", "ACT-1", "title", "New Candidate Applied", "desc", "Meena Raj applied for Senior Java Architect", "time", "10m ago"),
                        Map.of("id", "ACT-2", "title", "Onboarding Task Updated", "desc", "Verified documents for Arun Kumar (EMP-1001)", "time", "1h ago"),
                        Map.of("id", "ACT-3", "title", "Leave Request Submitted", "desc", "Arun Kumar requested 2 days Casual Leave", "time", "2h ago")
                )
        ));
    }

    @GetMapping("/employees")
    public ResponseEntity<?> listEmployees(
            @RequestParam(required = false, defaultValue = "") String search,
            @RequestParam(required = false, defaultValue = "") String departmentId
    ) {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", employees,
                "meta", Map.of("totalElements", employees.size())
        ));
    }

    @PostMapping("/employees")
    public ResponseEntity<?> createEmployee(@RequestBody Map<String, Object> req) {
        String empCode = (String) req.getOrDefault("employeeCode", "EMP-" + (employees.size() + 1001));
        String firstName = (String) req.getOrDefault("firstName", "Arun");
        String lastName = (String) req.getOrDefault("lastName", "Kumar");
        String email = (String) req.getOrDefault("workEmail", "arun.kumar@abctech.example");
        String department = (String) req.getOrDefault("department", "Information Technology");
        String designation = (String) req.getOrDefault("designation", "Java Developer");
        String joiningDate = (String) req.getOrDefault("joiningDate", "2026-11-02");
        String employmentType = (String) req.getOrDefault("employmentType", "FULL_TIME");

        Map<String, Object> newEmp = new LinkedHashMap<>();
        newEmp.put("employeeId", empCode);
        newEmp.put("employeeCode", empCode);
        newEmp.put("firstName", firstName);
        newEmp.put("lastName", lastName);
        newEmp.put("fullName", firstName + " " + lastName);
        newEmp.put("workEmail", email);
        newEmp.put("department", department);
        newEmp.put("designation", designation);
        newEmp.put("employmentStatus", "PRE_ONBOARDING");
        newEmp.put("employmentType", employmentType);
        newEmp.put("joiningDate", joiningDate);
        newEmp.put("phone", req.getOrDefault("phone", "+91 90000 00000"));

        employees.add(newEmp);

        return ResponseEntity.status(201).body(Map.of(
                "success", true,
                "message", "Employee created successfully",
                "data", newEmp
        ));
    }

    @GetMapping("/employees/{employeeId}")
    public ResponseEntity<?> getEmployee(@PathVariable String employeeId) {
        return employees.stream()
                .filter(e -> employeeId.equalsIgnoreCase((String) e.get("employeeId")))
                .findFirst()
                .map(e -> ResponseEntity.ok(Map.of("success", true, "data", e)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/departments")
    public ResponseEntity<?> listDepartments() {
        return ResponseEntity.ok(Map.of("success", true, "data", departments));
    }

    @GetMapping("/designations")
    public ResponseEntity<?> listDesignations() {
        return ResponseEntity.ok(Map.of("success", true, "data", designations));
    }

    @GetMapping("/employees/export")
    public ResponseEntity<?> exportEmployees() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", employees,
                "exportFormat", "CSV",
                "generatedAt", Instant.now().toString()
        ));
    }

    // ==========================================
    // 11. Recruitment and Applicant Tracking (ATS)
    // ==========================================
    @GetMapping("/jobs")
    public ResponseEntity<?> listJobs() {
        return ResponseEntity.ok(Map.of("success", true, "data", jobs));
    }

    @PostMapping("/jobs")
    public ResponseEntity<?> createJob(@RequestBody Map<String, Object> req) {
        String title = (String) req.getOrDefault("title", "Full Stack Engineer");
        String dept = (String) req.getOrDefault("department", "Information Technology");
        Map<String, Object> newJob = new LinkedHashMap<>(req);
        newJob.put("jobId", "JOB-" + (jobs.size() + 101));
        newJob.put("title", title);
        newJob.put("department", dept);
        newJob.put("status", "OPEN");
        newJob.put("postedDate", Instant.now().toString());

        jobs.add(newJob);
        return ResponseEntity.status(201).body(Map.of("success", true, "data", newJob));
    }

    @GetMapping("/candidates")
    public ResponseEntity<?> listCandidates() {
        return ResponseEntity.ok(Map.of("success", true, "data", candidates));
    }

    @PostMapping("/candidates")
    public ResponseEntity<?> addCandidate(@RequestBody Map<String, Object> req) {
        String firstName = (String) req.getOrDefault("firstName", "Meena");
        String lastName = (String) req.getOrDefault("lastName", "Raj");
        String email = (String) req.getOrDefault("email", "meena.candidate@example.com");

        Map<String, Object> newCan = new LinkedHashMap<>(req);
        newCan.put("candidateId", "CAN-" + (candidates.size() + 1001));
        newCan.put("fullName", firstName + " " + lastName);
        newCan.put("email", email);
        newCan.put("status", "ACTIVE");
        newCan.put("createdAt", Instant.now().toString());

        candidates.add(newCan);
        return ResponseEntity.status(201).body(Map.of("success", true, "data", newCan));
    }

    @GetMapping("/applications")
    public ResponseEntity<?> listApplications() {
        return ResponseEntity.ok(Map.of("success", true, "data", applications));
    }

    @PatchMapping("/applications/{applicationId}/stage")
    public ResponseEntity<?> updateApplicationStage(@PathVariable String applicationId, @RequestBody Map<String, Object> req) {
        String newStage = (String) req.getOrDefault("stage", "INTERVIEW");
        for (Map<String, Object> app : applications) {
            if (applicationId.equalsIgnoreCase((String) app.get("applicationId"))) {
                app.put("stage", newStage);
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Recruitment stage updated to " + newStage,
                        "data", app
                ));
            }
        }
        return ResponseEntity.notFound().build();
    }

    // ==========================================
    // 12. Employee Onboarding & Offboarding
    // ==========================================
    @GetMapping("/onboarding")
    public ResponseEntity<?> listOnboarding() {
        return ResponseEntity.ok(Map.of("success", true, "data", onboardingCases));
    }

    @PostMapping("/onboarding")
    public ResponseEntity<?> createOnboardingPlan(@RequestBody Map<String, Object> req) {
        String empId = (String) req.getOrDefault("employeeId", "EMP-1001");
        String onbId = "ONB-" + (onboardingCases.size() + 1001);

        Map<String, Object> plan = new LinkedHashMap<>(req);
        plan.put("onboardingId", onbId);
        plan.put("employeeId", empId);
        plan.put("status", "IN_PROGRESS");
        plan.put("progressPercent", 0);

        onboardingCases.add(plan);
        return ResponseEntity.status(201).body(Map.of("success", true, "data", plan));
    }

    @PatchMapping("/onboarding/tasks/{taskId}")
    public ResponseEntity<?> updateOnboardingTask(@PathVariable String taskId, @RequestBody Map<String, Object> req) {
        boolean completed = Boolean.TRUE.equals(req.get("completed"));
        for (Map<String, Object> onb : onboardingCases) {
            List<Map<String, Object>> tasks = (List<Map<String, Object>>) onb.get("tasks");
            if (tasks != null) {
                for (Map<String, Object> t : tasks) {
                    if (taskId.equalsIgnoreCase((String) t.get("taskId"))) {
                        t.put("completed", completed);
                        return ResponseEntity.ok(Map.of("success", true, "data", t));
                    }
                }
            }
        }
        return ResponseEntity.ok(Map.of("success", true, "message", "Task updated"));
    }

    // ==========================================
    // 13. Leave & Attendance Management
    // ==========================================
    @GetMapping("/leave-types")
    public ResponseEntity<?> getLeaveTypes() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", List.of("CASUAL_LEAVE", "SICK_LEAVE", "EARNED_LEAVE", "MATERNITY_LEAVE", "PATERNITY_LEAVE")
        ));
    }

    @GetMapping("/leave-requests")
    public ResponseEntity<?> listLeaveRequests() {
        return ResponseEntity.ok(Map.of("success", true, "data", leaveRequests));
    }

    @PostMapping("/leave-requests/{requestId}/approve")
    public ResponseEntity<?> approveLeave(@PathVariable String requestId, @RequestBody(required = false) Map<String, Object> req) {
        for (Map<String, Object> l : leaveRequests) {
            if (requestId.equalsIgnoreCase((String) l.get("requestId"))) {
                l.put("status", "APPROVED");
                l.put("reviewedBy", "USR-HR-101");
                l.put("reviewedAt", Instant.now().toString());
                l.put("comment", req != null ? req.get("comment") : "Approved by HR");
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "data", l
                ));
            }
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/leave-requests/{requestId}/reject")
    public ResponseEntity<?> rejectLeave(@PathVariable String requestId, @RequestBody(required = false) Map<String, Object> req) {
        for (Map<String, Object> l : leaveRequests) {
            if (requestId.equalsIgnoreCase((String) l.get("requestId"))) {
                l.put("status", "REJECTED");
                l.put("reviewedBy", "USR-HR-101");
                l.put("reviewedAt", Instant.now().toString());
                l.put("comment", req != null ? req.get("comment") : "Rejected");
                return ResponseEntity.ok(Map.of("success", true, "data", l));
            }
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/leave-balances")
    public ResponseEntity<?> getLeaveBalances() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", List.of(
                        Map.of("employeeId", "EMP-1001", "casualLeaveRemaining", 10, "sickLeaveRemaining", 8, "earnedLeaveRemaining", 15),
                        Map.of("employeeId", "EMP-1002", "casualLeaveRemaining", 8, "sickLeaveRemaining", 10, "earnedLeaveRemaining", 18)
                )
        ));
    }

    // ==========================================
    // 14. HR Documents, Policies & Service Requests
    // ==========================================
    @GetMapping("/policies")
    public ResponseEntity<?> listPolicies() {
        return ResponseEntity.ok(Map.of("success", true, "data", hrPolicies));
    }

    @GetMapping("/requests")
    public ResponseEntity<?> listServiceRequests() {
        return ResponseEntity.ok(Map.of("success", true, "data", hrServiceRequests));
    }

    @PostMapping("/requests")
    public ResponseEntity<?> createServiceRequest(@RequestBody Map<String, Object> req) {
        String empId = (String) req.getOrDefault("employeeId", "EMP-1001");
        String category = (String) req.getOrDefault("category", "EMPLOYMENT_LETTER");
        String subject = (String) req.getOrDefault("subject", "Request for employment verification letter");

        Map<String, Object> newReq = new LinkedHashMap<>(req);
        newReq.put("requestId", "HRR-" + (hrServiceRequests.size() + 1001));
        newReq.put("employeeId", empId);
        newReq.put("category", category);
        newReq.put("subject", subject);
        newReq.put("status", "OPEN");
        newReq.put("assignedTeam", "HUMAN_RESOURCES");
        newReq.put("createdAt", Instant.now().toString());

        hrServiceRequests.add(newReq);
        return ResponseEntity.status(201).body(Map.of("success", true, "data", newReq));
    }

    // ==========================================
    // 15. HR AI Assistant & Automations
    // ==========================================
    @PostMapping("/automations/{workflowId}/runs")
    public ResponseEntity<?> runHrAutomation(@PathVariable String workflowId, @RequestBody(required = false) Map<String, Object> req) {
        String mode = (req != null && req.containsKey("mode")) ? (String) req.get("mode") : "DRY_RUN";
        return ResponseEntity.status(202).body(Map.of(
                "success", true,
                "data", Map.of(
                        "runId", "HR-RUN-" + System.currentTimeMillis() % 10000,
                        "workflowId", workflowId,
                        "status", "QUEUED",
                        "mode", mode
                )
        ));
    }

    @PostMapping("/ai-assistant/sessions")
    public ResponseEntity<?> startAiAssistantSession() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of(
                        "sessionId", "SESS-HR-" + UUID.randomUUID().toString().substring(0, 8),
                        "greeting", "Hello! I am your Zenelait HR Assistant. How can I assist with policies, leave, or onboarding today?"
                )
        ));
    }
}
