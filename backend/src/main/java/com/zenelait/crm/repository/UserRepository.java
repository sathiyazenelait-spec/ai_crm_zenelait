package com.zenelait.crm.repository;

import com.zenelait.crm.model.User;
import com.zenelait.crm.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    List<User> findByCompanyId(String companyId);

    List<User> findByRole(Role role);
}
