package com.zenelait.crm.task;

import com.zenelait.crm.common.exception.ResourceNotFoundException;
import com.zenelait.crm.common.exception.ValidationException;
import com.zenelait.crm.model.Appointment;
import com.zenelait.crm.model.Company;
import com.zenelait.crm.model.FollowUp;
import com.zenelait.crm.model.Task;
import com.zenelait.crm.repository.AppointmentRepository;
import com.zenelait.crm.repository.FollowUpRepository;
import com.zenelait.crm.repository.TaskRepository;
import com.zenelait.crm.tenant.TenantSecurityService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class TaskAppointmentController {

    private final TaskRepository taskRepository;
    private final AppointmentRepository appointmentRepository;
    private final FollowUpRepository followUpRepository;
    private final TenantSecurityService tenantSecurityService;

    public TaskAppointmentController(
            TaskRepository taskRepository,
            AppointmentRepository appointmentRepository,
            FollowUpRepository followUpRepository,
            TenantSecurityService tenantSecurityService
    ) {
        this.taskRepository = taskRepository;
        this.appointmentRepository = appointmentRepository;
        this.followUpRepository = followUpRepository;
        this.tenantSecurityService = tenantSecurityService;
    }

    // ==================== TASKS ====================
    @PostMapping("/tasks")
    public ResponseEntity<Task> createTask(@RequestBody Task task) {
        Company company = tenantSecurityService.getCurrentCompany();
        task.setTenant(company);
        return ResponseEntity.status(HttpStatus.CREATED).body(taskRepository.save(task));
    }

    @GetMapping("/tasks")
    public ResponseEntity<List<Task>> getTasks() {
        String tenantId = tenantSecurityService.getCurrentTenantId();
        return ResponseEntity.ok(taskRepository.findByTenantId(tenantId));
    }

    @PatchMapping("/tasks/{taskId}")
    public ResponseEntity<Task> updateTask(@PathVariable String taskId, @RequestBody Map<String, Object> updates) {
        String tenantId = tenantSecurityService.getCurrentTenantId();
        Task task = taskRepository.findByIdAndTenantId(taskId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + taskId));

        if (updates.containsKey("title")) task.setTitle((String) updates.get("title"));
        if (updates.containsKey("status")) task.setStatus((String) updates.get("status"));
        if (updates.containsKey("priority")) task.setPriority((String) updates.get("priority"));
        if (updates.containsKey("dueDate")) task.setDueDate((String) updates.get("dueDate"));

        return ResponseEntity.ok(taskRepository.save(task));
    }

    // ==================== APPOINTMENTS ====================
    @PostMapping("/appointments")
    public ResponseEntity<Map<String, Object>> scheduleAppointment(@RequestBody Map<String, Object> body) {
        String title = (String) body.get("title");
        if (title == null || title.trim().isEmpty()) {
            throw new ValidationException("Appointment title is required.");
        }

        Company company = tenantSecurityService.getCurrentCompany();

        Appointment apt = new Appointment();
        apt.setTitle(title);
        apt.setLeadId((String) body.get("leadId"));
        apt.setType((String) body.getOrDefault("type", "PRODUCT_DEMO"));
        apt.setStartAt((String) body.get("startAt"));
        apt.setEndAt((String) body.get("endAt"));
        apt.setAssignedTo((String) body.get("assignedTo"));
        apt.setChannel((String) body.getOrDefault("channel", "VIDEO_CALL"));
        apt.setStatus("SCHEDULED");
        apt.setTenant(company);

        Appointment saved = appointmentRepository.save(apt);

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("id", saved.getId());
        res.put("leadId", saved.getLeadId());
        res.put("title", saved.getTitle());
        res.put("status", saved.getStatus());
        res.put("assignedTo", saved.getAssignedTo());
        res.put("startAt", saved.getStartAt());
        res.put("endAt", saved.getEndAt());

        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @GetMapping("/appointments")
    public ResponseEntity<List<Appointment>> getAppointments() {
        String tenantId = tenantSecurityService.getCurrentTenantId();
        return ResponseEntity.ok(appointmentRepository.findByTenantId(tenantId));
    }

    @PatchMapping("/appointments/{appointmentId}")
    public ResponseEntity<Appointment> updateAppointment(
            @PathVariable String appointmentId,
            @RequestBody Map<String, Object> updates
    ) {
        String tenantId = tenantSecurityService.getCurrentTenantId();
        Appointment apt = appointmentRepository.findByIdAndTenantId(appointmentId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found: " + appointmentId));

        if (updates.containsKey("title")) apt.setTitle((String) updates.get("title"));
        if (updates.containsKey("status")) apt.setStatus((String) updates.get("status"));
        if (updates.containsKey("startAt")) apt.setStartAt((String) updates.get("startAt"));
        if (updates.containsKey("endAt")) apt.setEndAt((String) updates.get("endAt"));
        if (updates.containsKey("assignedTo")) apt.setAssignedTo((String) updates.get("assignedTo"));

        return ResponseEntity.ok(appointmentRepository.save(apt));
    }

    // ==================== FOLLOW-UPS ====================
    @PostMapping("/follow-ups")
    public ResponseEntity<FollowUp> createFollowUp(@RequestBody FollowUp followUp) {
        Company company = tenantSecurityService.getCurrentCompany();
        followUp.setTenant(company);
        return ResponseEntity.status(HttpStatus.CREATED).body(followUpRepository.save(followUp));
    }

    @GetMapping("/follow-ups")
    public ResponseEntity<List<FollowUp>> getFollowUps() {
        String tenantId = tenantSecurityService.getCurrentTenantId();
        return ResponseEntity.ok(followUpRepository.findByTenantId(tenantId));
    }
}
