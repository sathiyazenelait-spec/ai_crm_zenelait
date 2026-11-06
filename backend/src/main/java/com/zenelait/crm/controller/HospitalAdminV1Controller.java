package com.zenelait.crm.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

/**
 * Zenelait AI CRM — Hospital/Clinic Company Admin V1 REST API Controller
 * Implements Part B Hospital/Clinic Company Admin API Catalogue:
 * - Hospital Settings & Locations (/api/v1/admin/hospital/settings, /locations)
 * - Departments & Clinic Services (/api/v1/admin/hospital/departments, /services)
 * - Staff & Schedules (/api/v1/admin/hospital/staff, /schedules, /appointment-types)
 * - Appointment Settings & Slots (/api/v1/admin/hospital/appointment-settings, /appointment-slots, /booking-rules)
 * - Appointments & Reception Queue (/api/v1/admin/hospital/appointments, /reception-queue)
 * - Patient Directory & Access Policies (/api/v1/admin/hospital/patients, /patient-access-policies, /data-retention-policy)
 */
@RestController
@RequestMapping("/api/v1/admin/hospital")
@CrossOrigin(origins = "*")
public class HospitalAdminV1Controller {

    private final List<Map<String, Object>> locations = new ArrayList<>();
    private final List<Map<String, Object>> departments = new ArrayList<>();
    private final List<Map<String, Object>> services = new ArrayList<>();
    private final List<Map<String, Object>> staff = new ArrayList<>();
    private final List<Map<String, Object>> schedules = new ArrayList<>();
    private final List<Map<String, Object>> appointmentTypes = new ArrayList<>();
    private final List<Map<String, Object>> appointmentSlots = new ArrayList<>();
    private final List<Map<String, Object>> appointments = new ArrayList<>();
    private final List<Map<String, Object>> receptionQueue = new ArrayList<>();
    private final List<Map<String, Object>> bookingRules = new ArrayList<>();
    private final List<Map<String, Object>> patients = new ArrayList<>();
    private final Map<String, Object> hospitalSettings = new LinkedHashMap<>();
    private final Map<String, Object> patientAccessPolicies = new LinkedHashMap<>();
    private final Map<String, Object> dataRetentionPolicy = new LinkedHashMap<>();

    public HospitalAdminV1Controller() {
        initHospitalData();
    }

    private void initHospitalData() {
        // 1. Locations
        locations.add(new LinkedHashMap<>(Map.of("locationId", "LOC-001", "name", "GreenCare Main Campus", "city", "Chennai", "state", "Tamil Nadu", "status", "ACTIVE")));
        locations.add(new LinkedHashMap<>(Map.of("locationId", "LOC-002", "name", "GreenCare City Centre Clinic", "city", "Coimbatore", "state", "Tamil Nadu", "status", "ACTIVE")));

        // 2. Departments
        departments.add(buildDepartment("DEPT-101", "DENTAL", "Dental Services", "LOC-001", "Dental consultation, hygiene and orthodontic appointment services", "ACTIVE"));
        departments.add(buildDepartment("DEPT-102", "CARDIOLOGY", "Cardiology OPD", "LOC-001", "Outpatient cardiovascular check-ups, ECG and preventive screening", "ACTIVE"));
        departments.add(buildDepartment("DEPT-103", "PEDIATRICS", "Pediatric Clinic", "LOC-001", "Child wellness, routine immunizations and pediatric care", "ACTIVE"));
        departments.add(buildDepartment("DEPT-104", "PHYSIO", "Physiotherapy & Rehab", "LOC-002", "Post-op rehabilitation, pain management and mobility therapy", "ACTIVE"));

        // 3. Services
        services.add(new LinkedHashMap<>(Map.of("serviceId", "SRV-01", "code", "GEN_CONSULT", "name", "General Physician Consultation", "departmentId", "DEPT-101", "durationMinutes", 20, "fee", 500, "status", "ACTIVE")));
        services.add(new LinkedHashMap<>(Map.of("serviceId", "SRV-02", "code", "DENTAL_CLEANING", "name", "Comprehensive Dental Scaling", "departmentId", "DEPT-101", "durationMinutes", 30, "fee", 1200, "status", "ACTIVE")));
        services.add(new LinkedHashMap<>(Map.of("serviceId", "SRV-03", "code", "CARDIAC_CHECK", "name", "Cardio Health Checkup", "departmentId", "DEPT-102", "durationMinutes", 45, "fee", 2500, "status", "ACTIVE")));

        // 4. Appointment Types
        appointmentTypes.add(new LinkedHashMap<>(Map.of("typeId", "APT-TYPE-001", "code", "IN_CLINIC_VISIT", "name", "In-Clinic Consultation", "durationMinutes", 30, "requiresConsent", true)));
        appointmentTypes.add(new LinkedHashMap<>(Map.of("typeId", "APT-TYPE-002", "code", "TELE_CONSULT", "name", "Telemedicine Video Appointment", "durationMinutes", 20, "requiresConsent", true)));
        appointmentTypes.add(new LinkedHashMap<>(Map.of("typeId", "APT-TYPE-003", "code", "FOLLOW_UP", "name", "Quick Routine Follow-up", "durationMinutes", 15, "requiresConsent", false)));

        // 5. Staff
        staff.add(buildStaff("STAFF-101", "Dr. Arvind Swaminathan", "arvind.dr@greencare.example", "+91 98401 55667", "DOCTOR", "DEPT-101", "Senior Dentist (BDS, MDS)", "ACTIVE"));
        staff.add(buildStaff("STAFF-102", "Dr. Sneha Pillai", "sneha.dr@greencare.example", "+91 99402 77889", "DOCTOR", "DEPT-102", "Consultant Cardiologist", "ACTIVE"));
        staff.add(buildStaff("STAFF-103", "Meena Kumar", "meena.reception@greencare.example", "+91 97654 11223", "RECEPTIONIST", "DEPT-101", "Front Desk Receptionist", "ACTIVE"));

        // 6. Schedules
        schedules.add(new LinkedHashMap<>(Map.of(
                "scheduleId", "SCHED-101",
                "staffId", "STAFF-101",
                "locationId", "LOC-001",
                "dayOfWeek", "MONDAY_TO_FRIDAY",
                "shiftStart", "09:00",
                "shiftEnd", "17:00",
                "slotDurationMinutes", 30
        )));

        // 7. Appointment Slots
        appointmentSlots.add(buildSlot("SLOT-HC-1001", "LOC-001", "DEPT-101", "APT-TYPE-001", "STAFF-101", "2026-10-26T10:00:00+05:30", "2026-10-26T10:30:00+05:30", 1, "AVAILABLE"));
        appointmentSlots.add(buildSlot("SLOT-HC-1002", "LOC-001", "DEPT-101", "APT-TYPE-001", "STAFF-101", "2026-10-26T10:30:00+05:30", "2026-10-26T11:00:00+05:30", 1, "AVAILABLE"));
        appointmentSlots.add(buildSlot("SLOT-HC-1003", "LOC-001", "DEPT-102", "APT-TYPE-001", "STAFF-102", "2026-10-26T11:00:00+05:30", "2026-10-26T11:45:00+05:30", 1, "AVAILABLE"));

        // 8. Appointments
        appointments.add(buildAppointment("APT-HC-5001", "PAT-101", "Ramesh Sundaram", "STAFF-101", "Dr. Arvind Swaminathan",
                "DEPT-101", "2026-10-26T10:00:00+05:30", "CONFIRMED", "Routine dental hygiene checkup"));
        appointments.add(buildAppointment("APT-HC-5002", "PAT-102", "Lakshmi Narayanan", "STAFF-102", "Dr. Sneha Pillai",
                "DEPT-102", "2026-10-26T11:00:00+05:30", "PENDING_CONFIRMATION", "Pre-op cardiac consultation"));

        // 9. Reception Queue
        receptionQueue.add(new LinkedHashMap<>(Map.of(
                "queueId", "Q-HC-01",
                "appointmentId", "APT-HC-5001",
                "patientName", "Ramesh Sundaram",
                "tokenNumber", "T-014",
                "doctorName", "Dr. Arvind Swaminathan",
                "checkInTime", "09:48 AM",
                "status", "WAITING",
                "roomNumber", "Room 102"
        )));
        receptionQueue.add(new LinkedHashMap<>(Map.of(
                "queueId", "Q-HC-02",
                "appointmentId", "APT-HC-5003",
                "patientName", "Vikram Seth",
                "tokenNumber", "T-015",
                "doctorName", "Dr. Sneha Pillai",
                "checkInTime", "09:55 AM",
                "status", "WITH_DOCTOR",
                "roomNumber", "Consultation Suite 4"
        )));

        // 10. Patients Directory (Demographics only, clinical notes stored separately)
        patients.add(buildPatient("PAT-101", "Ramesh Sundaram", "ramesh.s@example.com", "+91 98400 33445", "1984-06-12", "MALE", "A+"));
        patients.add(buildPatient("PAT-102", "Lakshmi Narayanan", "lakshmi.n@example.com", "+91 97100 22334", "1978-11-24", "FEMALE", "B+"));
        patients.add(buildPatient("PAT-103", "Vikram Seth", "vikram.seth@example.com", "+91 99620 44556", "1992-03-18", "MALE", "O+"));

        // 11. Booking Rules
        bookingRules.add(new LinkedHashMap<>(Map.of(
                "ruleId", "RULE-HC-01",
                "name", "Advance Booking Restriction",
                "maxAdvanceDays", 30,
                "minAdvanceHours", 2,
                "allowSameDayEmergency", true
        )));

        // 12. Settings & Policies
        hospitalSettings.put("clinicName", "GreenCare Clinic");
        hospitalSettings.put("operatingHours", "08:00 - 20:00 IST");
        hospitalSettings.put("telemedicineEnabled", true);
        hospitalSettings.put("emergencyContact", "+91 44 2800 9900");

        patientAccessPolicies.put("clinicalDataSealed", true);
        patientAccessPolicies.put("adminAccessDemographicsOnly", true);
        patientAccessPolicies.put("auditEveryPatientLookup", true);

        dataRetentionPolicy.put("demographicsRetentionYears", 10);
        dataRetentionPolicy.put("auditLogsRetentionYears", 7);
        dataRetentionPolicy.put("autoAnonymizeInactiveAfterYears", 5);
    }

    private Map<String, Object> buildDepartment(String id, String code, String name, String locId, String desc, String status) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("departmentId", id);
        m.put("code", code);
        m.put("name", name);
        m.put("locationId", locId);
        m.put("description", desc);
        m.put("status", status);
        m.put("createdAt", Instant.now().toString());
        return m;
    }

    private Map<String, Object> buildStaff(String id, String name, String email, String phone, String role, String deptId, String designation, String status) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("staffId", id);
        m.put("name", name);
        m.put("email", email);
        m.put("phone", phone);
        m.put("staffRole", role);
        m.put("departmentId", deptId);
        m.put("designation", designation);
        m.put("status", status);
        return m;
    }

    private Map<String, Object> buildSlot(String id, String locId, String deptId, String typeId, String staffId, String start, String end, int cap, String status) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("slotId", id);
        m.put("locationId", locId);
        m.put("departmentId", deptId);
        m.put("appointmentTypeId", typeId);
        m.put("staffId", staffId);
        m.put("startAt", start);
        m.put("endAt", end);
        m.put("capacity", cap);
        m.put("status", status);
        return m;
    }

    private Map<String, Object> buildAppointment(String id, String patientId, String patientName, String staffId, String staffName,
                                                String deptId, String start, String status, String note) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("appointmentId", id);
        m.put("patientId", patientId);
        m.put("patientName", patientName);
        m.put("staffId", staffId);
        m.put("staffName", staffName);
        m.put("departmentId", deptId);
        m.put("startAt", start);
        m.put("status", status);
        m.put("note", note);
        m.put("createdAt", Instant.now().minusSeconds(10800).toString());
        return m;
    }

    private Map<String, Object> buildPatient(String id, String name, String email, String phone, String dob, String gender, String bloodGroup) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("patientId", id);
        m.put("name", name);
        m.put("email", email);
        m.put("phone", phone);
        m.put("dateOfBirth", dob);
        m.put("gender", gender);
        m.put("bloodGroup", bloodGroup);
        m.put("registeredAt", "2026-09-15");
        return m;
    }

    // ==========================================
    // 1. Hospital Settings & Locations
    // ==========================================
    @GetMapping("/settings")
    public ResponseEntity<?> getHospitalSettings() {
        return ResponseEntity.ok(Map.of("success", true, "data", hospitalSettings));
    }

    @PatchMapping("/settings")
    public ResponseEntity<?> updateHospitalSettings(@RequestBody Map<String, Object> updates) {
        hospitalSettings.putAll(updates);
        return ResponseEntity.ok(Map.of("success", true, "message", "Hospital settings updated", "data", hospitalSettings));
    }

    @GetMapping("/locations")
    public ResponseEntity<?> getLocations() {
        return ResponseEntity.ok(Map.of("success", true, "data", locations));
    }

    @PostMapping("/locations")
    public ResponseEntity<?> createLocation(@RequestBody Map<String, Object> req) {
        Map<String, Object> loc = new LinkedHashMap<>(req);
        loc.put("locationId", "LOC-00" + (locations.size() + 1));
        locations.add(loc);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "data", loc));
    }

    @PatchMapping("/locations/{locationId}")
    public ResponseEntity<?> updateLocation(@PathVariable String locationId, @RequestBody Map<String, Object> req) {
        for (Map<String, Object> l : locations) {
            if (locationId.equals(l.get("locationId"))) {
                l.putAll(req);
                return ResponseEntity.ok(Map.of("success", true, "data", l));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Location not found"));
    }

    @GetMapping("/locations/{locationId}/departments")
    public ResponseEntity<?> getLocationDepartments(@PathVariable String locationId) {
        List<Map<String, Object>> depts = departments.stream()
                .filter(d -> locationId.equals(d.get("locationId")))
                .toList();
        return ResponseEntity.ok(Map.of("success", true, "locationId", locationId, "departments", depts));
    }

    // ==========================================
    // 2. Departments & Services
    // ==========================================
    @GetMapping("/departments")
    public ResponseEntity<?> getDepartments() {
        return ResponseEntity.ok(Map.of("success", true, "data", departments, "total", departments.size()));
    }

    @PostMapping("/departments")
    public ResponseEntity<?> createDepartment(@RequestBody Map<String, Object> req) {
        String id = "DEPT-" + (departments.size() + 101);
        String code = (String) req.getOrDefault("code", "DEPT_" + System.currentTimeMillis());
        String name = (String) req.getOrDefault("name", "New Department");
        String locId = (String) req.getOrDefault("locationId", "LOC-001");
        String desc = (String) req.getOrDefault("description", "Medical and clinical OPD service");
        String status = (String) req.getOrDefault("status", "ACTIVE");

        Map<String, Object> dept = buildDepartment(id, code, name, locId, desc, status);
        departments.add(0, dept);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "Department created successfully",
                "data", dept
        ));
    }

    @GetMapping("/departments/{departmentId}")
    public ResponseEntity<?> getDepartment(@PathVariable String departmentId) {
        return departments.stream()
                .filter(d -> departmentId.equals(d.get("departmentId")))
                .findFirst()
                .map(d -> ResponseEntity.ok(Map.of("success", true, "data", d)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Department not found")));
    }

    @PatchMapping("/departments/{departmentId}")
    public ResponseEntity<?> updateDepartment(@PathVariable String departmentId, @RequestBody Map<String, Object> req) {
        for (Map<String, Object> d : departments) {
            if (departmentId.equals(d.get("departmentId"))) {
                d.putAll(req);
                return ResponseEntity.ok(Map.of("success", true, "data", d));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Department not found"));
    }

    @PatchMapping("/departments/{departmentId}/status")
    public ResponseEntity<?> updateDepartmentStatus(@PathVariable String departmentId, @RequestBody Map<String, Object> req) {
        for (Map<String, Object> d : departments) {
            if (departmentId.equals(d.get("departmentId"))) {
                d.put("status", req.getOrDefault("status", "INACTIVE"));
                return ResponseEntity.ok(Map.of("success", true, "message", "Department status updated", "data", d));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Department not found"));
    }

    @GetMapping("/services")
    public ResponseEntity<?> getServices() {
        return ResponseEntity.ok(Map.of("success", true, "data", services));
    }

    @PostMapping("/services")
    public ResponseEntity<?> createService(@RequestBody Map<String, Object> req) {
        Map<String, Object> s = new LinkedHashMap<>(req);
        s.put("serviceId", "SRV-0" + (services.size() + 1));
        services.add(s);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "data", s));
    }

    @GetMapping("/services/{serviceId}")
    public ResponseEntity<?> getService(@PathVariable String serviceId) {
        return services.stream()
                .filter(s -> serviceId.equals(s.get("serviceId")))
                .findFirst()
                .map(s -> ResponseEntity.ok(Map.of("success", true, "data", s)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Service not found")));
    }

    @PatchMapping("/services/{serviceId}")
    public ResponseEntity<?> updateService(@PathVariable String serviceId, @RequestBody Map<String, Object> req) {
        for (Map<String, Object> s : services) {
            if (serviceId.equals(s.get("serviceId"))) {
                s.putAll(req);
                return ResponseEntity.ok(Map.of("success", true, "data", s));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Service not found"));
    }

    @PatchMapping("/services/{serviceId}/status")
    public ResponseEntity<?> updateServiceStatus(@PathVariable String serviceId, @RequestBody Map<String, Object> req) {
        for (Map<String, Object> s : services) {
            if (serviceId.equals(s.get("serviceId"))) {
                s.put("status", req.getOrDefault("status", "INACTIVE"));
                return ResponseEntity.ok(Map.of("success", true, "data", s));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Service not found"));
    }

    // ==========================================
    // 3. Staff & Schedules
    // ==========================================
    @GetMapping("/staff")
    public ResponseEntity<?> getStaff() {
        return ResponseEntity.ok(Map.of("success", true, "data", staff, "total", staff.size()));
    }

    @PostMapping("/staff")
    public ResponseEntity<?> createStaff(@RequestBody Map<String, Object> req) {
        String id = "STAFF-" + (staff.size() + 101);
        String name = (String) req.getOrDefault("name", "Staff Member");
        String email = (String) req.getOrDefault("email", "staff@greencare.example");
        String phone = (String) req.getOrDefault("phone", "+91 90000 11111");
        String role = (String) req.getOrDefault("staffRole", "DOCTOR");
        String deptId = (String) req.getOrDefault("departmentId", "DEPT-101");
        String desig = (String) req.getOrDefault("designation", "Physician");
        String status = (String) req.getOrDefault("status", "ACTIVE");

        Map<String, Object> st = buildStaff(id, name, email, phone, role, deptId, desig, status);
        staff.add(0, st);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "data", st));
    }

    @GetMapping("/staff/{staffId}")
    public ResponseEntity<?> getStaffMember(@PathVariable String staffId) {
        return staff.stream()
                .filter(s -> staffId.equals(s.get("staffId")))
                .findFirst()
                .map(s -> ResponseEntity.ok(Map.of("success", true, "data", s)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Staff member not found")));
    }

    @PatchMapping("/staff/{staffId}")
    public ResponseEntity<?> updateStaffMember(@PathVariable String staffId, @RequestBody Map<String, Object> req) {
        for (Map<String, Object> s : staff) {
            if (staffId.equals(s.get("staffId"))) {
                s.putAll(req);
                return ResponseEntity.ok(Map.of("success", true, "data", s));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Staff member not found"));
    }

    @PatchMapping("/staff/{staffId}/status")
    public ResponseEntity<?> updateStaffStatus(@PathVariable String staffId, @RequestBody Map<String, Object> req) {
        for (Map<String, Object> s : staff) {
            if (staffId.equals(s.get("staffId"))) {
                s.put("status", req.getOrDefault("status", "INACTIVE"));
                return ResponseEntity.ok(Map.of("success", true, "data", s));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Staff member not found"));
    }

    @GetMapping("/staff/{staffId}/schedules")
    public ResponseEntity<?> getStaffSchedules(@PathVariable String staffId) {
        List<Map<String, Object>> scheds = schedules.stream()
                .filter(sc -> staffId.equals(sc.get("staffId")))
                .toList();
        return ResponseEntity.ok(Map.of("success", true, "staffId", staffId, "schedules", scheds));
    }

    @PostMapping("/staff/{staffId}/schedules")
    public ResponseEntity<?> createStaffSchedule(@PathVariable String staffId, @RequestBody Map<String, Object> req) {
        Map<String, Object> sc = new LinkedHashMap<>(req);
        sc.put("scheduleId", "SCHED-" + (schedules.size() + 101));
        sc.put("staffId", staffId);
        schedules.add(sc);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "data", sc));
    }

    @GetMapping("/schedules")
    public ResponseEntity<?> getAllSchedules() {
        return ResponseEntity.ok(Map.of("success", true, "data", schedules));
    }

    @PatchMapping("/schedules/{scheduleId}")
    public ResponseEntity<?> updateSchedule(@PathVariable String scheduleId, @RequestBody Map<String, Object> req) {
        for (Map<String, Object> sc : schedules) {
            if (scheduleId.equals(sc.get("scheduleId"))) {
                sc.putAll(req);
                return ResponseEntity.ok(Map.of("success", true, "data", sc));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Schedule not found"));
    }

    @GetMapping("/appointment-types")
    public ResponseEntity<?> getAppointmentTypes() {
        return ResponseEntity.ok(Map.of("success", true, "data", appointmentTypes));
    }

    @PostMapping("/appointment-types")
    public ResponseEntity<?> createAppointmentType(@RequestBody Map<String, Object> req) {
        Map<String, Object> type = new LinkedHashMap<>(req);
        type.put("typeId", "APT-TYPE-00" + (appointmentTypes.size() + 1));
        appointmentTypes.add(type);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "data", type));
    }

    @PatchMapping("/appointment-types/{typeId}")
    public ResponseEntity<?> updateAppointmentType(@PathVariable String typeId, @RequestBody Map<String, Object> req) {
        for (Map<String, Object> t : appointmentTypes) {
            if (typeId.equals(t.get("typeId"))) {
                t.putAll(req);
                return ResponseEntity.ok(Map.of("success", true, "data", t));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Appointment type not found"));
    }

    // ==========================================
    // 4. Appointment Configuration & Operations
    // ==========================================
    @GetMapping("/appointment-settings")
    public ResponseEntity<?> getAppointmentSettings() {
        return ResponseEntity.ok(Map.of("success", true, "data", hospitalSettings));
    }

    @PatchMapping("/appointment-settings")
    public ResponseEntity<?> updateAppointmentSettings(@RequestBody Map<String, Object> updates) {
        hospitalSettings.putAll(updates);
        return ResponseEntity.ok(Map.of("success", true, "message", "Appointment settings updated", "data", hospitalSettings));
    }

    @GetMapping("/appointment-slots")
    public ResponseEntity<?> getAppointmentSlots() {
        return ResponseEntity.ok(Map.of("success", true, "data", appointmentSlots, "total", appointmentSlots.size()));
    }

    @PostMapping("/appointment-slots")
    public ResponseEntity<?> createAppointmentSlot(@RequestBody Map<String, Object> req) {
        String id = "SLOT-HC-" + (appointmentSlots.size() + 1001);
        String locId = (String) req.getOrDefault("locationId", "LOC-001");
        String deptId = (String) req.getOrDefault("departmentId", "DEPT-101");
        String typeId = (String) req.getOrDefault("appointmentTypeId", "APT-TYPE-001");
        String staffId = (String) req.getOrDefault("staffId", "STAFF-101");
        String start = (String) req.getOrDefault("startAt", "2026-10-26T10:00:00+05:30");
        String end = (String) req.getOrDefault("endAt", "2026-10-26T10:30:00+05:30");
        int cap = req.get("capacity") != null ? Integer.parseInt(req.get("capacity").toString()) : 1;

        Map<String, Object> slot = buildSlot(id, locId, deptId, typeId, staffId, start, end, cap, "AVAILABLE");
        appointmentSlots.add(0, slot);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "Appointment slot created",
                "data", slot
        ));
    }

    @PatchMapping("/appointment-slots/{slotId}")
    public ResponseEntity<?> updateAppointmentSlot(@PathVariable String slotId, @RequestBody Map<String, Object> req) {
        for (Map<String, Object> sl : appointmentSlots) {
            if (slotId.equals(sl.get("slotId"))) {
                sl.putAll(req);
                return ResponseEntity.ok(Map.of("success", true, "data", sl));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Slot not found"));
    }

    @GetMapping("/appointments")
    public ResponseEntity<?> getAppointments() {
        return ResponseEntity.ok(Map.of("success", true, "data", appointments, "total", appointments.size()));
    }

    @GetMapping("/appointments/{appointmentId}")
    public ResponseEntity<?> getAppointment(@PathVariable String appointmentId) {
        return appointments.stream()
                .filter(a -> appointmentId.equals(a.get("appointmentId")))
                .findFirst()
                .map(a -> ResponseEntity.ok(Map.of("success", true, "data", a)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Appointment not found")));
    }

    @PostMapping("/appointments")
    public ResponseEntity<?> createAppointment(@RequestBody Map<String, Object> req) {
        String id = "APT-HC-" + (appointments.size() + 5001);
        String patId = (String) req.getOrDefault("patientId", "PAT-101");
        String patName = (String) req.getOrDefault("patientName", "Patient");
        String staffId = (String) req.getOrDefault("staffId", "STAFF-101");
        String staffName = (String) req.getOrDefault("staffName", "Physician");
        String deptId = (String) req.getOrDefault("departmentId", "DEPT-101");
        String start = (String) req.getOrDefault("startAt", Instant.now().toString());
        String status = (String) req.getOrDefault("status", "CONFIRMED");
        String note = (String) req.getOrDefault("note", "Consultation");

        Map<String, Object> apt = buildAppointment(id, patId, patName, staffId, staffName, deptId, start, status, note);
        appointments.add(0, apt);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "data", apt));
    }

    @PatchMapping("/appointments/{appointmentId}")
    public ResponseEntity<?> updateAppointment(@PathVariable String appointmentId, @RequestBody Map<String, Object> req) {
        for (Map<String, Object> a : appointments) {
            if (appointmentId.equals(a.get("appointmentId"))) {
                a.putAll(req);
                return ResponseEntity.ok(Map.of("success", true, "data", a));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Appointment not found"));
    }

    @PatchMapping("/appointments/{appointmentId}/status")
    public ResponseEntity<?> updateAppointmentStatus(@PathVariable String appointmentId, @RequestBody Map<String, Object> req) {
        for (Map<String, Object> a : appointments) {
            if (appointmentId.equals(a.get("appointmentId"))) {
                a.put("status", req.getOrDefault("status", "CONFIRMED"));
                return ResponseEntity.ok(Map.of("success", true, "message", "Status updated", "data", a));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Appointment not found"));
    }

    @GetMapping("/reception-queue")
    public ResponseEntity<?> getReceptionQueue() {
        return ResponseEntity.ok(Map.of("success", true, "data", receptionQueue, "waitingCount", receptionQueue.size()));
    }

    @PatchMapping("/reception-queue/{queueId}")
    public ResponseEntity<?> updateReceptionQueue(@PathVariable String queueId, @RequestBody Map<String, Object> req) {
        for (Map<String, Object> q : receptionQueue) {
            if (queueId.equals(q.get("queueId"))) {
                q.putAll(req);
                return ResponseEntity.ok(Map.of("success", true, "data", q));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Queue record not found"));
    }

    @GetMapping("/booking-rules")
    public ResponseEntity<?> getBookingRules() {
        return ResponseEntity.ok(Map.of("success", true, "data", bookingRules));
    }

    @PostMapping("/booking-rules")
    public ResponseEntity<?> createBookingRule(@RequestBody Map<String, Object> req) {
        Map<String, Object> rule = new LinkedHashMap<>(req);
        rule.put("ruleId", "RULE-HC-0" + (bookingRules.size() + 1));
        bookingRules.add(rule);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "data", rule));
    }

    @PatchMapping("/booking-rules/{ruleId}")
    public ResponseEntity<?> updateBookingRule(@PathVariable String ruleId, @RequestBody Map<String, Object> req) {
        for (Map<String, Object> r : bookingRules) {
            if (ruleId.equals(r.get("ruleId"))) {
                r.putAll(req);
                return ResponseEntity.ok(Map.of("success", true, "data", r));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Rule not found"));
    }

    // ==========================================
    // 5. Patient Directory & Access Configuration
    // ==========================================
    @GetMapping("/patients")
    public ResponseEntity<?> getPatients() {
        return ResponseEntity.ok(Map.of("success", true, "data", patients, "total", patients.size()));
    }

    @GetMapping("/patients/{patientId}")
    public ResponseEntity<?> getPatient(@PathVariable String patientId) {
        return patients.stream()
                .filter(p -> patientId.equals(p.get("patientId")))
                .findFirst()
                .map(p -> ResponseEntity.ok(Map.of("success", true, "data", p)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Patient record not found")));
    }

    @PostMapping("/patients")
    public ResponseEntity<?> createPatient(@RequestBody Map<String, Object> req) {
        String id = "PAT-" + (patients.size() + 101);
        String name = (String) req.getOrDefault("name", "New Patient");
        String email = (String) req.getOrDefault("email", "patient@example.com");
        String phone = (String) req.getOrDefault("phone", "+91 90000 00000");
        String dob = (String) req.getOrDefault("dateOfBirth", "1990-01-01");
        String gender = (String) req.getOrDefault("gender", "OTHER");
        String bg = (String) req.getOrDefault("bloodGroup", "O+");

        Map<String, Object> pat = buildPatient(id, name, email, phone, dob, gender, bg);
        patients.add(0, pat);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "message", "Patient registered", "data", pat));
    }

    @PatchMapping("/patients/{patientId}")
    public ResponseEntity<?> updatePatient(@PathVariable String patientId, @RequestBody Map<String, Object> req) {
        for (Map<String, Object> p : patients) {
            if (patientId.equals(p.get("patientId"))) {
                p.putAll(req);
                return ResponseEntity.ok(Map.of("success", true, "data", p));
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "Patient not found"));
    }

    @GetMapping("/patient-access-policies")
    public ResponseEntity<?> getPatientAccessPolicies() {
        return ResponseEntity.ok(Map.of("success", true, "data", patientAccessPolicies));
    }

    @PatchMapping("/patient-access-policies")
    public ResponseEntity<?> updatePatientAccessPolicies(@RequestBody Map<String, Object> updates) {
        patientAccessPolicies.putAll(updates);
        return ResponseEntity.ok(Map.of("success", true, "message", "Patient access policies updated", "data", patientAccessPolicies));
    }

    @GetMapping("/data-retention-policy")
    public ResponseEntity<?> getDataRetentionPolicy() {
        return ResponseEntity.ok(Map.of("success", true, "data", dataRetentionPolicy));
    }

    @PatchMapping("/data-retention-policy")
    public ResponseEntity<?> updateDataRetentionPolicy(@RequestBody Map<String, Object> updates) {
        dataRetentionPolicy.putAll(updates);
        return ResponseEntity.ok(Map.of("success", true, "message", "Data retention policy updated", "data", dataRetentionPolicy));
    }
}
