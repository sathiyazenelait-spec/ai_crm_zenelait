package com.zenelait.crm.repository;

import com.zenelait.crm.model.Company;
import com.zenelait.crm.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, String> {
    List<Task> findByTenant(Company tenant);
    List<Task> findByTenantId(String tenantId);
    Optional<Task> findByIdAndTenantId(String id, String tenantId);
    long countByTenantId(String tenantId);
}
