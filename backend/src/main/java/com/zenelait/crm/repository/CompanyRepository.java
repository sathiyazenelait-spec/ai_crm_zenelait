package com.zenelait.crm.repository;

import com.zenelait.crm.model.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, String> {

    // 1. Direct name lookup (case-insensitive)
    Optional<Company> findByNameIgnoreCase(String name);

    // 2. Normalized clean name lookup (without spaces and punctuation)
    Optional<Company> findByCleanName(String cleanName);

    // 3. Auto-complete suggestion search as user types (case and space-insensitive)
    @Query("SELECT c FROM Company c WHERE LOWER(REPLACE(c.name, ' ', '')) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Company> searchCompaniesFuzzy(@Param("query") String query);

    // 4. Find companies by industry
    List<Company> findByIndustryId(String industryId);
}
