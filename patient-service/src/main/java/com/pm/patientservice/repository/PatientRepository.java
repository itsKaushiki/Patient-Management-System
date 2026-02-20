package com.pm.patientservice.repository;

import com.pm.patientservice.model.Patient;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PatientRepository extends JpaRepository<Patient, UUID> {
  boolean existsByEmail(String email);
  boolean existsByEmailAndIdNot(String email, UUID id);

  // Search methods for pagination
  Page<Patient> findByNameContainingIgnoreCase(String name, Pageable pageable);

  Page<Patient> findByEmailContainingIgnoreCase(String email, Pageable pageable);

  @Query("SELECT p FROM Patient p WHERE " +
         "LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
         "LOWER(p.email) LIKE LOWER(CONCAT('%', :query, '%'))")
  Page<Patient> searchByMultipleFields(@Param("query") String query, Pageable pageable);
}
