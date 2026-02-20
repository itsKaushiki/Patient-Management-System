package com.pm.patientservice.controller;

import com.pm.patientservice.dto.PatientRequestDTO;
import com.pm.patientservice.dto.PatientResponseDTO;
import com.pm.patientservice.dto.PatientStatisticsDTO;
import com.pm.patientservice.dto.validators.CreatePatientValidationGroup;
import com.pm.patientservice.service.PatientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.groups.Default;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/patients")
@Tag(name = "Patient", description = "API for managing Patients")
public class PatientController {

  private final PatientService patientService;

  public PatientController(PatientService patientService) {
    this.patientService = patientService;
  }

  @GetMapping
  @Operation(summary = "Get Patients with Pagination")
  public ResponseEntity<Page<PatientResponseDTO>> getPatients(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size,
      @RequestParam(defaultValue = "name") String sortBy,
      @RequestParam(defaultValue = "asc") String sortDirection) {

    Sort.Direction direction = sortDirection.equalsIgnoreCase("desc")
        ? Sort.Direction.DESC
        : Sort.Direction.ASC;
    Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

    Page<PatientResponseDTO> patients = patientService.getPatients(pageable);
    return ResponseEntity.ok().body(patients);
  }

  @GetMapping("/all")
  @Operation(summary = "Get All Patients (No Pagination)")
  public ResponseEntity<List<PatientResponseDTO>> getAllPatients() {
    List<PatientResponseDTO> patients = patientService.getAllPatients();
    return ResponseEntity.ok().body(patients);
  }

  @GetMapping("/{id}")
  @Operation(summary = "Get Patient by ID")
  public ResponseEntity<PatientResponseDTO> getPatientById(@PathVariable UUID id) {
    PatientResponseDTO patientResponseDTO = patientService.getPatientById(id);
    return ResponseEntity.ok().body(patientResponseDTO);
  }

  @PostMapping
  @Operation(summary = "Create a new Patient")
  public ResponseEntity<PatientResponseDTO> createPatient(
      @Validated({Default.class, CreatePatientValidationGroup.class})
      @RequestBody PatientRequestDTO patientRequestDTO) {

    PatientResponseDTO patientResponseDTO = patientService.createPatient(
        patientRequestDTO);

    return ResponseEntity.ok().body(patientResponseDTO);
  }

  @PutMapping("/{id}")
  @Operation(summary = "Update a new Patient")
  public ResponseEntity<PatientResponseDTO> updatePatient(@PathVariable UUID id,
      @Validated({Default.class}) @RequestBody PatientRequestDTO patientRequestDTO) {

    PatientResponseDTO patientResponseDTO = patientService.updatePatient(id,
        patientRequestDTO);

    return ResponseEntity.ok().body(patientResponseDTO);
  }

  @DeleteMapping("/{id}")
  @Operation(summary = "Soft Delete a Patient", description = "Marks patient as deleted without removing from database")
  public ResponseEntity<Void> deletePatient(@PathVariable UUID id) {
    patientService.deletePatient(id);
    return ResponseEntity.noContent().build();
  }

  @PutMapping("/{id}/restore")
  @Operation(summary = "Restore a Deleted Patient", description = "Restores a soft-deleted patient")
  public ResponseEntity<Void> restorePatient(@PathVariable UUID id) {
    patientService.restorePatient(id);
    return ResponseEntity.ok().build();
  }

  @GetMapping("/search")
  @Operation(summary = "Search Patients by Name, Email, or Phone")
  public ResponseEntity<Page<PatientResponseDTO>> searchPatients(
      @RequestParam(required = false) String name,
      @RequestParam(required = false) String email,
      @RequestParam(required = false) String phone,
      @RequestParam(required = false) String query,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size,
      @RequestParam(defaultValue = "name") String sortBy,
      @RequestParam(defaultValue = "asc") String sortDirection) {

    Sort.Direction direction = sortDirection.equalsIgnoreCase("desc")
        ? Sort.Direction.DESC
        : Sort.Direction.ASC;
    Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

    Page<PatientResponseDTO> patients = patientService.searchPatients(name, email, phone, query, pageable);
    return ResponseEntity.ok().body(patients);
  }

  @GetMapping("/statistics")
  @Operation(summary = "Get Patient Statistics")
  public ResponseEntity<PatientStatisticsDTO> getPatientStatistics() {
    PatientStatisticsDTO statistics = patientService.getPatientStatistics();
    return ResponseEntity.ok().body(statistics);
  }
}
