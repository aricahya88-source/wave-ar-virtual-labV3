export type LabId = "reflection" | "refraction" | "interference" | "diffraction";

export type TheoryBlock = {
  title: string;
  body: string;
  formulas?: string[];
};

export type Lab = {
  id: LabId;
  title: string;
  subtitle: string;
  objective: string;
  icon: string;
  guide: string[];
  theory: TheoryBlock[];
};

export type LabParameters = {
  wavelengthNm: number;
  incidentAngleDeg: number;
  refractiveIndex1: number;
  refractiveIndex2: number;
  mirrorWidthCm: number;
  mediumThicknessCm: number;
  slitWidthUm: number;
  slitSeparationMm: number;
  slitOffsetCm: number;
  screenOffsetCm: number;
  screenDistanceM: number;
};
