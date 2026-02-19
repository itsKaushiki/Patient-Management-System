package com.pm.authservice.service;

import com.pm.authservice.model.Role;
import com.pm.authservice.model.User;
import com.pm.authservice.repository.UserRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;

  public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
  }

  public Optional<User> findByEmail(String email) {
    return userRepository.findByEmail(email);
  }

  public User registerUser(String name, String email, String password) {
    // Check if email already exists
    if (userRepository.findByEmail(email).isPresent()) {
      throw new IllegalArgumentException("Email already registered");
    }

    // Create new user
    User user = new User();
    user.setName(name);
    user.setEmail(email);
    user.setPassword(passwordEncoder.encode(password));
    user.setRole(Role.RECEPTIONIST.name()); // Default role

    return userRepository.save(user);
  }

  public List<User> getAllUsers() {
    return userRepository.findAll();
  }

  public Optional<User> getUserById(UUID id) {
    return userRepository.findById(id);
  }

  public User updateUserRole(UUID userId, String newRole) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new IllegalArgumentException("User not found"));

    user.setRole(newRole);
    return userRepository.save(user);
  }
}
