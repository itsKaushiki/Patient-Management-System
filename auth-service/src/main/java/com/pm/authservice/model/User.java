package com.pm.authservice.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.UUID;

@Entity
@Table(name="users")
public class User {
  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private UUID id;

  @Column(unique = true, nullable = false)
  private String email;

  @Column(nullable = false)
  private String password;

  @Column(nullable = true) // Nullable for backward compatibility with existing users
  private String name;

  @Column(nullable = true) // Nullable for backward compatibility with existing users
  private String role;

  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getPassword() {
    return password;
  }

  public void setPassword(String password) {
    this.password = password;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getRole() {
    return role;
  }

  public void setRole(String role) {
    this.role = role;
  }

  // Helper method to get Role enum with fallback to ADMIN for null values
  public Role getRoleEnum() {
    if (role == null) {
      return Role.ADMIN; // Fallback for existing users
    }
    try {
      return Role.valueOf(role);
    } catch (IllegalArgumentException e) {
      return Role.ADMIN; // Fallback for invalid values
    }
  }
}
