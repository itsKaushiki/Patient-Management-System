package com.pm.analyticsservice.dto;

import java.time.LocalDateTime;

public class AuditEventDTO {
  
  private String eventType;
  private String patientName;
  private String patientEmail;
  private LocalDateTime timestamp;

  public AuditEventDTO() {
  }

  public AuditEventDTO(String eventType, String patientName, String patientEmail, LocalDateTime timestamp) {
    this.eventType = eventType;
    this.patientName = patientName;
    this.patientEmail = patientEmail;
    this.timestamp = timestamp;
  }

  public String getEventType() {
    return eventType;
  }

  public void setEventType(String eventType) {
    this.eventType = eventType;
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

  public LocalDateTime getTimestamp() {
    return timestamp;
  }

  public void setTimestamp(LocalDateTime timestamp) {
    this.timestamp = timestamp;
  }
}

