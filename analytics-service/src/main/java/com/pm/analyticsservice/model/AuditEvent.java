package com.pm.analyticsservice.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "audit_events")
public class AuditEvent {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(name = "patient_id", nullable = false)
  private String patientId;

  @Column(name = "patient_name")
  private String patientName;

  @Column(name = "patient_email")
  private String patientEmail;

  @Column(name = "event_type", nullable = false)
  private String eventType;

  @Column(name = "event_timestamp", nullable = false)
  private LocalDateTime eventTimestamp;

  @Column(name = "source_service", nullable = false)
  private String sourceService;

  public AuditEvent() {
  }

  public AuditEvent(String patientId, String patientName, String patientEmail, 
                    String eventType, LocalDateTime eventTimestamp, String sourceService) {
    this.patientId = patientId;
    this.patientName = patientName;
    this.patientEmail = patientEmail;
    this.eventType = eventType;
    this.eventTimestamp = eventTimestamp;
    this.sourceService = sourceService;
  }

  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public String getPatientId() {
    return patientId;
  }

  public void setPatientId(String patientId) {
    this.patientId = patientId;
  }

  public String getPatientName() {
    return patientName;
  }

  public void setPatientName(String patientName) {
    this.patientName = patientName;
  }

  public String getPatientEmail() {
    return patientEmail;
  }

  public void setPatientEmail(String patientEmail) {
    this.patientEmail = patientEmail;
  }

  public String getEventType() {
    return eventType;
  }

  public void setEventType(String eventType) {
    this.eventType = eventType;
  }

  public LocalDateTime getEventTimestamp() {
    return eventTimestamp;
  }

  public void setEventTimestamp(LocalDateTime eventTimestamp) {
    this.eventTimestamp = eventTimestamp;
  }

  public String getSourceService() {
    return sourceService;
  }

  public void setSourceService(String sourceService) {
    this.sourceService = sourceService;
  }
}

