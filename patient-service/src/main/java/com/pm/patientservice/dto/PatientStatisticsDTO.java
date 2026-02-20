package com.pm.patientservice.dto;

import java.util.Map;

public class PatientStatisticsDTO {
  private Map<String, Long> byGender;
  private Map<String, Long> byBloodGroup;

  public PatientStatisticsDTO() {
  }

  public PatientStatisticsDTO(Map<String, Long> byGender, Map<String, Long> byBloodGroup) {
    this.byGender = byGender;
    this.byBloodGroup = byBloodGroup;
  }

  public Map<String, Long> getByGender() {
    return byGender;
  }

  public void setByGender(Map<String, Long> byGender) {
    this.byGender = byGender;
  }

  public Map<String, Long> getByBloodGroup() {
    return byBloodGroup;
  }

  public void setByBloodGroup(Map<String, Long> byBloodGroup) {
    this.byBloodGroup = byBloodGroup;
  }


}

