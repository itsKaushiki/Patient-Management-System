package com.pm.patientservice.dto.validators;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.util.Arrays;
import java.util.List;

public class BloodGroupValidator implements ConstraintValidator<ValidBloodGroup, String> {

  private static final List<String> VALID_BLOOD_GROUPS = Arrays.asList(
      "A+", "A-",
      "B+", "B-",
      "AB+", "AB-",
      "O+", "O-"
  );

  @Override
  public boolean isValid(String value, ConstraintValidatorContext context) {
    if (value == null || value.trim().isEmpty()) {
      return true;
    }
    return VALID_BLOOD_GROUPS.contains(value);
  }
}

