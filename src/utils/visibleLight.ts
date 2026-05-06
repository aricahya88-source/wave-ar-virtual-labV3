export type RgbColor = {
  r: number;
  g: number;
  b: number;
};

export type VisibleLaserPreset = {
  label: string;
  wavelength: number;
  note: string;
};

export const VISIBLE_WAVELENGTH_MIN = 380;
export const VISIBLE_WAVELENGTH_MAX = 750;

export const visibleLaserPresets: VisibleLaserPreset[] = [
  { label: "Ungu", wavelength: 405, note: "violet laser" },
  { label: "Biru", wavelength: 445, note: "blue laser" },
  { label: "Sian", wavelength: 488, note: "cyan laser" },
  { label: "Hijau", wavelength: 532, note: "green laser" },
  { label: "Kuning", wavelength: 589, note: "yellow laser" },
  { label: "Jingga", wavelength: 610, note: "orange laser" },
  { label: "Merah", wavelength: 650, note: "red laser" }
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function toHexChannel(value: number) {
  return Math.round(clamp(value, 0, 255)).toString(16).padStart(2, "0");
}

export function getVisibleColorName(wavelength: number) {
  if (wavelength < 425) return "ungu";
  if (wavelength < 475) return "biru";
  if (wavelength < 500) return "sian";
  if (wavelength < 570) return "hijau";
  if (wavelength < 590) return "kuning";
  if (wavelength < 625) return "jingga";
  return "merah";
}

export function wavelengthToRgb(wavelength: number): RgbColor {
  const wl = clamp(wavelength, VISIBLE_WAVELENGTH_MIN, VISIBLE_WAVELENGTH_MAX);
  let r = 0;
  let g = 0;
  let b = 0;

  if (wl >= 380 && wl < 440) {
    r = -(wl - 440) / (440 - 380);
    g = 0;
    b = 1;
  } else if (wl >= 440 && wl < 490) {
    r = 0;
    g = (wl - 440) / (490 - 440);
    b = 1;
  } else if (wl >= 490 && wl < 510) {
    r = 0;
    g = 1;
    b = -(wl - 510) / (510 - 490);
  } else if (wl >= 510 && wl < 580) {
    r = (wl - 510) / (580 - 510);
    g = 1;
    b = 0;
  } else if (wl >= 580 && wl < 645) {
    r = 1;
    g = -(wl - 645) / (645 - 580);
    b = 0;
  } else if (wl >= 645 && wl <= 750) {
    r = 1;
    g = 0;
    b = 0;
  }

  let factor = 1;
  if (wl >= 380 && wl < 420) {
    factor = 0.3 + (0.7 * (wl - 380)) / (420 - 380);
  } else if (wl >= 420 && wl < 700) {
    factor = 1;
  } else if (wl >= 700 && wl <= 750) {
    factor = 0.3 + (0.7 * (750 - wl)) / (750 - 700);
  }

  const gamma = 0.8;

  return {
    r: 255 * Math.pow(r * factor, gamma),
    g: 255 * Math.pow(g * factor, gamma),
    b: 255 * Math.pow(b * factor, gamma)
  };
}

export function wavelengthToHex(wavelength: number) {
  const rgb = wavelengthToRgb(wavelength);
  return `#${toHexChannel(rgb.r)}${toHexChannel(rgb.g)}${toHexChannel(rgb.b)}`;
}
