import type { LabParameters } from "../types/lab";

export const defaultParameters: LabParameters = {
  wavelengthNm: 650,
  incidentAngleDeg: 35,
  refractiveIndex1: 1.0,
  refractiveIndex2: 1.5,
  mirrorWidthCm: 30,
  mediumThicknessCm: 20,
  slitWidthUm: 80,
  slitSeparationMm: 0.25,
  slitOffsetCm: 0,
  screenOffsetCm: 0,
  screenDistanceM: 1.0
};
