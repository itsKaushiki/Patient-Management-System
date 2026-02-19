package com.pm.analyticsservice.kafka;

import com.google.protobuf.InvalidProtocolBufferException;
import com.pm.analyticsservice.model.AuditEvent;
import com.pm.analyticsservice.repository.AuditEventRepository;
import java.time.LocalDateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import patient.events.PatientEvent;

@Service
public class KafkaConsumer {

  private static final Logger log = LoggerFactory.getLogger(KafkaConsumer.class);

  private final AuditEventRepository auditEventRepository;

  public KafkaConsumer(AuditEventRepository auditEventRepository) {
    this.auditEventRepository = auditEventRepository;
  }

  @KafkaListener(topics="patient", groupId = "analytics-service")
  public void consumeEvent(byte[] event) {
    try {
      // Parse protobuf message
      PatientEvent patientEvent = PatientEvent.parseFrom(event);

      log.info("Received Patient Event: [PatientId={},PatientName={},PatientEmail={},EventType={}]",
            patientEvent.getPatientId(),
            patientEvent.getName(),
            patientEvent.getEmail(),
            patientEvent.getEventType());

      // Create and persist audit event
      try {
        AuditEvent auditEvent = new AuditEvent(
            patientEvent.getPatientId(),
            patientEvent.getName(),
            patientEvent.getEmail(),
            patientEvent.getEventType(),
            LocalDateTime.now(),
            "patient-service"
        );

        auditEventRepository.save(auditEvent);
        log.info("Audit event persisted successfully for patient: {}", patientEvent.getPatientId());

      } catch (Exception e) {
        // Don't crash Kafka consumer if DB fails
        log.error("Failed to persist audit event: {}", e.getMessage(), e);
      }

    } catch (InvalidProtocolBufferException e) {
      // Don't crash Kafka consumer if parsing fails
      log.error("Error deserializing event: {}", e.getMessage());
    }
  }
}
