package com.pm.authservice.controller;

import com.pm.authservice.dto.LoginRequestDTO;
import com.pm.authservice.dto.LoginResponseDTO;
import com.pm.authservice.dto.RegisterRequestDTO;
import com.pm.authservice.dto.RegisterResponseDTO;
import com.pm.authservice.dto.UpdateRoleRequestDTO;
import com.pm.authservice.dto.UserDTO;
import com.pm.authservice.dto.ValidateResponseDTO;
import com.pm.authservice.model.User;
import com.pm.authservice.service.AuthService;
import com.pm.authservice.service.UserService;
import com.pm.authservice.util.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController {

  private final AuthService authService;
  private final UserService userService;
  private final JwtUtil jwtUtil;

  public AuthController(AuthService authService, UserService userService, JwtUtil jwtUtil) {
    this.authService = authService;
    this.userService = userService;
    this.jwtUtil = jwtUtil;
  }

  @Operation(summary = "Generate token on user login")
  @PostMapping("/login")
  public ResponseEntity<LoginResponseDTO> login(
      @RequestBody LoginRequestDTO loginRequestDTO) {

    Optional<String> tokenOptional = authService.authenticate(loginRequestDTO);

    if (tokenOptional.isEmpty()) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    String token = tokenOptional.get();
    return ResponseEntity.ok(new LoginResponseDTO(token));
  }

  @Operation(summary = "Register new user")
  @PostMapping("/register")
  public ResponseEntity<RegisterResponseDTO> register(
      @Valid @RequestBody RegisterRequestDTO registerRequestDTO) {

    try {
      User user = userService.registerUser(
          registerRequestDTO.getName(),
          registerRequestDTO.getEmail(),
          registerRequestDTO.getPassword()
      );

      RegisterResponseDTO response = new RegisterResponseDTO(
          user.getId(),
          user.getName(),
          user.getEmail(),
          user.getRole(),
          "User registered successfully"
      );

      return ResponseEntity.status(HttpStatus.CREATED).body(response);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.status(HttpStatus.CONFLICT).build();
    }
  }

  @Operation(summary = "Validate Token")
  @GetMapping("/validate")
  public ResponseEntity<ValidateResponseDTO> validateToken(
      @RequestHeader("Authorization") String authHeader) {

    // Authorization: Bearer <token>
    if(authHeader == null || !authHeader.startsWith("Bearer ")) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    ValidateResponseDTO response = authService.validateTokenWithDetails(authHeader.substring(7));

    if (!response.isValid()) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    return ResponseEntity.ok(response);
  }

  @Operation(summary = "Get all users (ADMIN only)")
  @GetMapping("/users")
  public ResponseEntity<List<UserDTO>> getAllUsers(
      @RequestHeader("Authorization") String authHeader) {

    // Validate token and check if user is ADMIN
    if(authHeader == null || !authHeader.startsWith("Bearer ")) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    String token = authHeader.substring(7);
    String role = jwtUtil.getRoleFromToken(token);

    if (!"ADMIN".equals(role)) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    List<User> users = userService.getAllUsers();
    List<UserDTO> userDTOs = users.stream()
        .map(user -> new UserDTO(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getRole()
        ))
        .collect(Collectors.toList());

    return ResponseEntity.ok(userDTOs);
  }

  @Operation(summary = "Update user role (ADMIN only)")
  @PutMapping("/users/{id}/role")
  public ResponseEntity<UserDTO> updateUserRole(
      @PathVariable UUID id,
      @Valid @RequestBody UpdateRoleRequestDTO request,
      @RequestHeader("Authorization") String authHeader) {

    // Validate token and check if user is ADMIN
    if(authHeader == null || !authHeader.startsWith("Bearer ")) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    String token = authHeader.substring(7);
    String role = jwtUtil.getRoleFromToken(token);

    if (!"ADMIN".equals(role)) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    try {
      User updatedUser = userService.updateUserRole(id, request.getRole());
      UserDTO userDTO = new UserDTO(
          updatedUser.getId(),
          updatedUser.getName(),
          updatedUser.getEmail(),
          updatedUser.getRole()
      );
      return ResponseEntity.ok(userDTO);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }
  }
}
