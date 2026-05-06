export function degToRad(deg: number) {
  return (deg * Math.PI) / 180;
}

export function radToDeg(rad: number) {
  return (rad * 180) / Math.PI;
}

export function calculateRefractionAngle(theta1Deg: number, n1: number, n2: number) {
  const theta1 = degToRad(theta1Deg);
  const sinTheta2 = (n1 / n2) * Math.sin(theta1);

  if (Math.abs(sinTheta2) > 1) {
    return null;
  }

  return Math.asin(sinTheta2);
}

export function calculateCriticalAngleDeg(n1: number, n2: number) {
  if (n1 <= n2) return null;
  return radToDeg(Math.asin(n2 / n1));
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function wavelengthNmToMeters(wavelengthNm: number) {
  return wavelengthNm * 1e-9;
}

export function micrometerToMeters(valueUm: number) {
  return valueUm * 1e-6;
}

export function millimeterToMeters(valueMm: number) {
  return valueMm * 1e-3;
}

export function calculateInterferenceFringeSpacingMm(wavelengthNm: number, screenDistanceM: number, slitSeparationMm: number) {
  const lambda = wavelengthNmToMeters(wavelengthNm);
  const d = millimeterToMeters(slitSeparationMm);
  if (d <= 0) return 0;
  return (lambda * screenDistanceM / d) * 1000;
}

export function calculateDiffractionFirstMinimumMm(wavelengthNm: number, screenDistanceM: number, slitWidthUm: number) {
  const lambda = wavelengthNmToMeters(wavelengthNm);
  const a = micrometerToMeters(slitWidthUm);
  if (a <= 0) return 0;
  return (lambda * screenDistanceM / a) * 1000;
}

export function calculateFrequencyTHz(wavelengthNm: number) {
  const c = 299_792_458;
  const lambda = wavelengthNmToMeters(wavelengthNm);
  return (c / lambda) / 1e12;
}
