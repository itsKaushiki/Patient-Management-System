package com.pm.authservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class UpdateRoleRequestDTO {
  
  @NotBlank(message = "Role is required")
  @Pattern(regexp = "ADMIN|DOCTOR|RECEPTIONIST", message = "Role must be ADMIN, DOCTOR, or RECEPTIONIST")
  private String role;

  public UpdateRoleRequestDTO() {
  }

  public UpdateRoleRequestDTO(String role) {
    this.role = role;
  }

  public String getRole() {
    return role;
  }

  public void setRole(String role) {
    this.role = role;
  }
}

