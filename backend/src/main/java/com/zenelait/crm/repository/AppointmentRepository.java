package com.zenelait.crm.repository;

import com.zenelait.crm.model.Appointment;
import com.zenelait.crm.model.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, String> {
    List<Appointment> findByTenant(Company tenant);
    List<Appointment> findByTenantId(String tenantId);
    Optional<Appointment> findByIdAndTenantId(String id, String tenantId);
    long countByTenantId(String tenantId);
    long countByTenantIdAndStatus(String tenantId, String status);
}
