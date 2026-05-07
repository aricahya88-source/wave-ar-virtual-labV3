
import type { LabId, LabParameters } from "../types/lab";
import { getVisibleColorName } from "../utils/visibleLight";

type ParameterKey = keyof LabParameters;

type VariableControl = {
  key: ParameterKey;
  label: string;
  unit?: string;
  min: number;
  max: number;
  step: number;
  precision?: number;
};

type ARVariableHUDProps = {
  activeLabId: LabId;
  parameters: LabParameters;
  activeIndex: number;
  zoomScale: number;
  isVisible: boolean;
  gestureSlot?: unknown;
  onToggleVisible: () => void;
  onSelectNext: () => void;
  onSelectPrevious: () => void;
  onIncreaseActive: () => void;
  onDecreaseActive: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
};

export const gestureVariableControls: Record<LabId, VariableControl[]> = {
  reflection: [
    { key: "wavelengthNm", label: "Panjang gelombang", unit: "nm", min: 380, max: 750, step: 10 },
    { key: "incidentAngleDeg", label: "Sudut datang", unit: "°", min: 5, max: 80, step: 5 },
    { key: "mirrorWidthCm", label: "Panjang cermin", unit: "cm", min: 10, max: 60, step: 5 }
  ],
  refraction: [
    { key: "wavelengthNm", label: "Panjang gelombang", unit: "nm", min: 380, max: 750, step: 10 },
    { key: "incidentAngleDeg", label: "Sudut datang", unit: "°", min: 5, max: 80, step: 5 },
    { key: "refractiveIndex1", label: "Indeks bias n1", min: 1, max: 2.5, step: 0.05, precision: 2 },
    { key: "refractiveIndex2", label: "Indeks bias n2", min: 1, max: 2.5, step: 0.05, precision: 2 },
    { key: "mediumThicknessCm", label: "Ketebalan medium", unit: "cm", min: 5, max: 50, step: 5 }
  ],
  interference: [
    { key: "wavelengthNm", label: "Panjang gelombang", unit: "nm", min: 380, max: 750, step: 10 },
    { key: "slitSeparationMm", label: "Jarak dua celah", unit: "mm", min: 0.05, max: 1, step: 0.05, precision: 2 },
    { key: "slitWidthUm", label: "Lebar celah", unit: "µm", min: 20, max: 300, step: 5 },
    { key: "slitOffsetCm", label: "Posisi celah", unit: "cm", min: -8, max: 8, step: 1 },
    { key: "screenOffsetCm", label: "Posisi layar", unit: "cm", min: -8, max: 8, step: 1 },
    { key: "screenDistanceM", label: "Jarak layar", unit: "m", min: 0.2, max: 2, step: 0.1, precision: 2 }
  ],
  diffraction: [
    { key: "wavelengthNm", label: "Panjang gelombang", unit: "nm", min: 380, max: 750, step: 10 },
    { key: "slitWidthUm", label: "Lebar celah", unit: "µm", min: 20, max: 300, step: 5 },
    { key: "slitOffsetCm", label: "Posisi celah", unit: "cm", min: -8, max: 8, step: 1 },
    { key: "screenOffsetCm", label: "Posisi layar", unit: "cm", min: -8, max: 8, step: 1 },
    { key: "screenDistanceM", label: "Jarak layar", unit: "m", min: 0.2, max: 2, step: 0.1, precision: 2 }
  ]
};

export function clampVariableValue(control: VariableControl, value: number) {
  return Math.min(control.max, Math.max(control.min, value));
}

export function formatVariableValue(control: VariableControl, value: number) {
  const precision = control.precision ?? 0;
  const formatted = Number.isFinite(value) ? value.toFixed(precision) : "-";
  return `${formatted}${control.unit ? ` ${control.unit}` : ""}`;
}

export function getGestureControls(activeLabId: LabId) {
  return gestureVariableControls[activeLabId];
}

export function ARVariableHUD({
  activeLabId,
  parameters,
  activeIndex,
  zoomScale,
  isVisible,
  onToggleVisible,
  onSelectNext,
  onSelectPrevious,
  onIncreaseActive,
  onDecreaseActive,
  onZoomIn,
  onZoomOut,
  onResetZoom
}: ARVariableHUDProps) {
  const controls = gestureVariableControls[activeLabId];
  const safeIndex = controls.length > 0 ? activeIndex % controls.length : 0;

  return (
    <div className={isVisible ? "ar-variable-hud" : "ar-variable-hud compact"}>
      <div className="ar-hud-header">
        
        <div>
          <span>Panel Gesture AR</span>
          <strong>Zoom visual: {(zoomScale * 100).toFixed(0)}%</strong>
        </div>
      
        <button type="button" className="hud-icon-button" onClick={onToggleVisible}>
          {isVisible ? "Sembunyikan" : "Tampilkan"}
        </button>
      </div>

      {isVisible && (
        <>
          <div className="ar-hud-variable-list">
            {controls.map((control, index) => {
              const value = parameters[control.key];
              return (
                <div key={control.key} className={index === safeIndex ? "ar-hud-variable active" : "ar-hud-variable"}>
                  <span>{index === safeIndex ? "▶" : ""} {control.label}</span>
                  <strong>{formatVariableValue(control, value)}</strong>
                </div>
              );
            })}
          </div>

          <div className="ar-hud-hint">
            <span>Warna: {getVisibleColorName(parameters.wavelengthNm)}</span>
            <span>Swipe kanan/kiri = pilih variabel</span>
            <span>Swipe atas/bawah = ubah nilai</span>
            <span>Dua tangan menjauh = zoom in</span>
            <span>Dua tangan mendekat = zoom out</span>
          </div>

          <div className="ar-hud-test-controls" aria-label="Tombol uji gesture sebelum kamera gesture diaktifkan">
            <button type="button" onClick={onSelectPrevious}>← Variabel</button>
            <button type="button" onClick={onSelectNext}>Variabel →</button>
            <button type="button" onClick={onDecreaseActive}>Nilai −</button>
            <button type="button" onClick={onIncreaseActive}>Nilai +</button>
            <button type="button" onClick={onZoomOut}>Zoom −</button>
            <button type="button" onClick={onZoomIn}>Zoom +</button>
            <button type="button" onClick={onResetZoom}>Reset Zoom</button>
          </div>
        </>
      )}
    </div>
  );
}
