package com.pm.apigateway.filter;

import com.pm.apigateway.dto.ValidateResponseDTO;
import java.util.Arrays;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Component
public class JwtValidationGatewayFilterFactory extends
    AbstractGatewayFilterFactory<Object> {

  private final WebClient webClient;

  public JwtValidationGatewayFilterFactory(WebClient.Builder webClientBuilder,
      @Value("${auth.service.url}") String authServiceUrl) {
    this.webClient = webClientBuilder.baseUrl(authServiceUrl).build();
  }

  @Override
  public GatewayFilter apply(Object config) {
    return (exchange, chain) -> {
      String token =
          exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

      if(token == null || !token.startsWith("Bearer ")) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        return exchange.getResponse().setComplete();
      }

      // Call /validate and get response with email and role
      return webClient.get()
          .uri("/validate")
          .header(HttpHeaders.AUTHORIZATION, token)
          .retrieve()
          .bodyToMono(ValidateResponseDTO.class)
          .flatMap(validateResponse -> {
            // Check if token is valid
            if (!validateResponse.isValid()) {
              exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
              return exchange.getResponse().setComplete();
            }

            // Get request details
            String method = exchange.getRequest().getMethod().name();
            String path = exchange.getRequest().getPath().value();
            String role = validateResponse.getRole();

            // Fallback to ADMIN if role is null (for existing users)
            if (role == null) {
              role = "ADMIN";
            }

            // Apply RBAC rules for /patients/** endpoints
            // Note: StripPrefix=1 removes /api, so path is /patients/...
            if (path.startsWith("/patients")) {
              if (!isAuthorized(method, role)) {
                exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
                return exchange.getResponse().setComplete();
              }
            }

            // Continue with the request
            return chain.filter(exchange);
          })
          .onErrorResume(e -> {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
          });
    };
  }

  private boolean isAuthorized(String method, String role) {
    List<String> allowedRoles;

    switch (method) {
      case "GET":
        // GET allowed for ADMIN, DOCTOR, RECEPTIONIST
        allowedRoles = Arrays.asList("ADMIN", "DOCTOR", "RECEPTIONIST");
        break;
      case "POST":
        // POST allowed for ADMIN, RECEPTIONIST
        allowedRoles = Arrays.asList("ADMIN", "RECEPTIONIST");
        break;
      case "PUT":
        // PUT allowed for ADMIN, DOCTOR
        allowedRoles = Arrays.asList("ADMIN", "DOCTOR");
        break;
      case "DELETE":
        // DELETE allowed for ADMIN only
        allowedRoles = Arrays.asList("ADMIN");
        break;
      default:
        // Other methods not allowed
        return false;
    }

    return allowedRoles.contains(role);
  }
}
