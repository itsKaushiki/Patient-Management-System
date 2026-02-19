package com.pm.analyticsservice.controller;

import com.pm.analyticsservice.dto.AuditEventDTO;
import com.pm.analyticsservice.model.AuditEvent;
import com.pm.analyticsservice.repository.AuditEventRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/analytics/audit")
public class AuditController {

  private final AuditEventRepository auditEventRepository;

  public AuditController(AuditEventRepository auditEventRepository) {
    this.auditEventRepository = auditEventRepository;
  }

  @GetMapping("/recent")
  public List<AuditEventDTO> getRecentActivity(@RequestParam(defaultValue = "10") int limit) {
    Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "eventTimestamp"));
    return auditEventRepository.findAll(pageable)
        .stream()
        .map(this::convertToDTO)
        .collect(Collectors.toList());
  }

  @GetMapping("/patient/{patientId}")
  public List<AuditEventDTO> getPatientHistory(@PathVariable String patientId) {
    return auditEventRepository.findByPatientIdOrderByEventTimestampDesc(patientId)
        .stream()
        .map(this::convertToDTO)
        .collect(Collectors.toList());
  }

  private AuditEventDTO convertToDTO(AuditEvent auditEvent) {
    return new AuditEventDTO(
        auditEvent.getEventType(),
        auditEvent.getPatientName(),
        auditEvent.getPatientEmail(),
        auditEvent.getEventTimestamp()
    );
  }
}

