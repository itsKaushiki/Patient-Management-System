package com.pm.patientservice.service;

import com.pm.patientservice.dto.PatientRequestDTO;
import com.pm.patientservice.dto.PatientResponseDTO;
import com.pm.patientservice.dto.PatientStatisticsDTO;
import com.pm.patientservice.exception.EmailAlreadyExistsException;
import com.pm.patientservice.exception.PatientNotFoundException;
import com.pm.patientservice.grpc.BillingServiceGrpcClient;
import com.pm.patientservice.kafka.KafkaProducer;
import com.pm.patientservice.mapper.PatientMapper;
import com.pm.patientservice.model.Patient;
import com.pm.patientservice.repository.PatientRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class PatientService {

  private final PatientRepository patientRepository;
  private final BillingServiceGrpcClient billingServiceGrpcClient;
  private final KafkaProducer kafkaProducer;

  public PatientService(PatientRepository patientRepository,
      BillingServiceGrpcClient billingServiceGrpcClient,
      KafkaProducer kafkaProducer) {
    this.patientRepository = patientRepository;
    this.billingServiceGrpcClient = billingServiceGrpcClient;
    this.kafkaProducer = kafkaProducer;
  }

  public Page<PatientResponseDTO> getPatients(Pageable pageable) {
    Page<Patient> patientsPage = patientRepository.findAll(pageable);
    return patientsPage.map(PatientMapper::toDTO);
  }

  public List<PatientResponseDTO> getAllPatients() {
    List<Patient> patients = patientRepository.findAll();

    return patients.stream().map(PatientMapper::toDTO).toList();
  }

  public PatientResponseDTO createPatient(PatientRequestDTO patientRequestDTO) {
    if (patientRepository.existsByEmail(patientRequestDTO.getEmail())) {
      throw new EmailAlreadyExistsException(
          "A patient with this email " + "already exists"
              + patientRequestDTO.getEmail());
    }

    Patient newPatient = patientRepository.save(
        PatientMapper.toModel(patientRequestDTO));

    billingServiceGrpcClient.createBillingAccount(newPatient.getId().toString(),
        newPatient.getName(), newPatient.getEmail());

    kafkaProducer.sendEvent(newPatient);

    return PatientMapper.toDTO(newPatient);
  }

  public PatientResponseDTO updatePatient(UUID id,
      PatientRequestDTO patientRequestDTO) {

    Patient patient = patientRepository.findById(id).orElseThrow(
        () -> new PatientNotFoundException("Patient not found with ID: " + id));

    if (patientRepository.existsByEmailAndIdNot(patientRequestDTO.getEmail(),
        id)) {
      throw new EmailAlreadyExistsException(
          "A patient with this email " + "already exists"
              + patientRequestDTO.getEmail());
    }

    patient.setName(patientRequestDTO.getName());
    patient.setAddress(patientRequestDTO.getAddress());
    patient.setEmail(patientRequestDTO.getEmail());
    patient.setDateOfBirth(LocalDate.parse(patientRequestDTO.getDateOfBirth()));
    patient.setGender(patientRequestDTO.getGender());
    patient.setBloodGroup(patientRequestDTO.getBloodGroup());

    Patient updatedPatient = patientRepository.save(patient);

    // Send Kafka event for patient update
    kafkaProducer.sendEvent(updatedPatient, "PATIENT_UPDATED");

    return PatientMapper.toDTO(updatedPatient);
  }

  public void deletePatient(UUID id) {
    // Fetch patient before deletion to send Kafka event
    Patient patient = patientRepository.findById(id).orElseThrow(
        () -> new PatientNotFoundException("Patient not found with ID: " + id));

    // Send Kafka event for patient deletion
    kafkaProducer.sendEvent(patient, "PATIENT_DELETED");

    // Delete the patient
    patientRepository.deleteById(id);
  }

  public PatientResponseDTO getPatientById(UUID id) {
    Patient patient = patientRepository.findById(id).orElseThrow(
        () -> new PatientNotFoundException("Patient not found with ID: " + id));

    return PatientMapper.toDTO(patient);
  }

  public Page<PatientResponseDTO> searchPatients(String name, String email, String phone,
                                                  String query, Pageable pageable) {
    Page<Patient> patientsPage;

    if (query != null && !query.trim().isEmpty()) {
      // Search across multiple fields
      patientsPage = patientRepository.searchByMultipleFields(query.trim(), pageable);
    } else if (name != null && !name.trim().isEmpty()) {
      patientsPage = patientRepository.findByNameContainingIgnoreCase(name.trim(), pageable);
    } else if (email != null && !email.trim().isEmpty()) {
      patientsPage = patientRepository.findByEmailContainingIgnoreCase(email.trim(), pageable);
    } else {
      // If no search criteria, return all with pagination
      patientsPage = patientRepository.findAll(pageable);
    }

    return patientsPage.map(PatientMapper::toDTO);
  }

  public PatientStatisticsDTO getPatientStatistics() {
    List<Patient> patients = patientRepository.findAll();

    // Count by gender
    Map<String, Long> byGender = patients.stream()
        .filter(p -> p.getGender() != null && !p.getGender().isEmpty())
        .collect(Collectors.groupingBy(Patient::getGender, Collectors.counting()));

    // Count by blood group
    Map<String, Long> byBloodGroup = patients.stream()
        .filter(p -> p.getBloodGroup() != null && !p.getBloodGroup().isEmpty())
        .collect(Collectors.groupingBy(Patient::getBloodGroup, Collectors.counting()));

    return new PatientStatisticsDTO(byGender, byBloodGroup);
  }

}
