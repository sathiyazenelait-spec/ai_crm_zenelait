package com.zenelait.crm.repository;

import com.zenelait.crm.model.Enquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EnquiryRepository extends JpaRepository<Enquiry, String> {

    List<Enquiry> findByStatusOrderByCreatedAtDesc(String status);

    List<Enquiry> findAllByOrderByCreatedAtDesc();
}
