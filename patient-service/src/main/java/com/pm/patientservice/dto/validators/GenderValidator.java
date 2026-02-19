package com.pm.patientservice.dto.validators;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.util.Arrays;
import java.util.List;

public class GenderValidator implements ConstraintValidator<ValidGender, String> {

  private static final List<String> VALID_GENDERS = Arrays.asList(
      "Male",
      "Female",
      "Other",
      "Prefer not to say"
  );

  @Override
  public boolean isValid(String value, ConstraintValidatorContext context) {
    if (value == null || value.trim().isEmpty()) {
      return true;
    }
    return VALID_GENDERS.contains(value);
  }
}

