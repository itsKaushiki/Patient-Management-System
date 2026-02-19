package com.pm.patientservice.dto.validators;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = BloodGroupValidator.class)
public @interface ValidBloodGroup {
  String message() default "Blood group must be one of: A+, A-, B+, B-, AB+, AB-, O+, O-";
  Class<?>[] groups() default {};
  Class<? extends Payload>[] payload() default {};
}

