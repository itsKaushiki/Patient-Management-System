package com.pm.apigateway.dto;

public class ValidateResponseDTO {

  private String email;
  private String role;
  private boolean valid;

  public ValidateResponseDTO() {
  }

  public ValidateResponseDTO(String email, String role, boolean valid) {
    this.email = email;
    this.role = role;
    this.valid = valid;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getRole() {
    return role;
  }

  public void setRole(String role) {
    this.role = role;
  }

  public boolean isValid() {
    return valid;
  }

  public void setValid(boolean valid) {
    this.valid = valid;
  }
}

