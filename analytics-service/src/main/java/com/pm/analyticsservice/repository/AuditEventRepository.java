package com.pm.analyticsservice.repository;

import com.pm.analyticsservice.model.AuditEvent;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditEventRepository extends JpaRepository<AuditEvent, UUID> {

  List<AuditEvent> findByPatientIdOrderByEventTimestampDesc(String patientId);
  
  List<AuditEvent> findAllByOrderByEventTimestampDesc();
}

