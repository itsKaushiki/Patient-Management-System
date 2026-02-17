package com.pm.patientservice.dto.validators;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = GenderValidator.class)
public @interface ValidGender {
  String message() default "Gender must be one of: Male, Female, Other, Prefer not to say";
  Class<?>[] groups() default {};
  Class<? extends Payload>[] payload() default {};
}

