package com.zenelait.crm.repository;

import com.zenelait.crm.model.Company;
import com.zenelait.crm.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, String> {
    List<Customer> findByTenant(Company tenant);
    List<Customer> findByTenantId(String tenantId);
    Optional<Customer> findByIdAndTenantId(String id, String tenantId);
    long countByTenantId(String tenantId);
}
