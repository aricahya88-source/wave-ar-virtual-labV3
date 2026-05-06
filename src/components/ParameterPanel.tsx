import type { LabId, LabParameters } from "../types/lab";
import { ParameterSlider } from "./ParameterSlider";
import {
  VISIBLE_WAVELENGTH_MAX,
  VISIBLE_WAVELENGTH_MIN,
  getVisibleColorName,
  visibleLaserPresets,
  wavelengthToHex
} from "../utils/visibleLight";
import {
  calculateCriticalAngleDeg,
  calculateDiffractionFirstMinimumMm,
  calculateFrequencyTHz,
  calculateInterferenceFringeSpacingMm,
  calculateRefractionAngle,
  radToDeg
} from "../engine/waveMath";

type ParameterPanelProps = {
  activeLabId: LabId;
  parameters: LabParameters;
  onChange: (next: Partial<LabParameters>) => void;
  onReset: () => void;
  onStartAR: () => void;
};

function fmt(value: number, digits = 2) {
  return Number.isFinite(value) ? value.toFixed(digits) : "-";
}

function TheoryResult({ activeLabId, parameters }: { activeLabId: LabId; parameters: LabParameters }) {
  const frequencyTHz = calculateFrequencyTHz(parameters.wavelengthNm);

  if (activeLabId === "reflection") {
    return (
      <div className="result-card">
        <strong>Hasil teori</strong>
        <span>θ datang = θ pantul = {parameters.incidentAngleDeg.toFixed(0)}°</span>
        <span>Panjang cermin = {parameters.mirrorWidthCm.toFixed(0)} cm</span>
        <span>Frekuensi laser ≈ {fmt(frequencyTHz, 1)} THz</span>
      </div>
    );
  }

  if (activeLabId === "refraction") {
    const theta2 = calculateRefractionAngle(parameters.incidentAngleDeg, parameters.refractiveIndex1, parameters.refractiveIndex2);
    const critical = calculateCriticalAngleDeg(parameters.refractiveIndex1, parameters.refractiveIndex2);

    return (
      <div className="result-card">
        <strong>Hasil teori</strong>
        {theta2 === null ? <span>Terjadi pemantulan internal total</span> : <span>θ bias ≈ {fmt(radToDeg(theta2), 1)}°</span>}
        <span>Ketebalan medium = {parameters.mediumThicknessCm.toFixed(0)} cm</span>
        {critical !== null && <span>Sudut kritis ≈ {fmt(critical, 1)}°</span>}
        <span>Frekuensi laser ≈ {fmt(frequencyTHz, 1)} THz</span>
      </div>
    );
  }

  if (activeLabId === "interference") {
    const fringeSpacing = calculateInterferenceFringeSpacingMm(
      parameters.wavelengthNm,
      parameters.screenDistanceM,
      parameters.slitSeparationMm
    );

    return (
      <div className="result-card">
        <strong>Hasil teori</strong>
        <span>Jarak terang berurutan Δy ≈ {fmt(fringeSpacing, 2)} mm</span>
        <span>d = {parameters.slitSeparationMm.toFixed(2)} mm</span>
        <span>L = {parameters.screenDistanceM.toFixed(2)} m</span>
        <span>λ = {parameters.wavelengthNm.toFixed(0)} nm</span>
      </div>
    );
  }

  const firstMinimum = calculateDiffractionFirstMinimumMm(
    parameters.wavelengthNm,
    parameters.screenDistanceM,
    parameters.slitWidthUm
  );

  return (
    <div className="result-card">
      <strong>Hasil teori</strong>
      <span>Minimum pertama y₁ ≈ {fmt(firstMinimum, 2)} mm dari pusat</span>
      <span>Lebar celah a = {parameters.slitWidthUm.toFixed(0)} µm</span>
      <span>L = {parameters.screenDistanceM.toFixed(2)} m</span>
      <span>λ = {parameters.wavelengthNm.toFixed(0)} nm</span>
    </div>
  );
}

export function ParameterPanel({ activeLabId, parameters, onChange, onReset, onStartAR }: ParameterPanelProps) {
  const isOpticalSlitLab = activeLabId === "interference" || activeLabId === "diffraction";
  const currentLaserColor = wavelengthToHex(parameters.wavelengthNm);
  const visibleColorName = getVisibleColorName(parameters.wavelengthNm);

  return (
    <section className="panel parameter-panel">
      <div className="panel-heading">
        <h3>Parameter Ukuran Nyata</h3>
        <button className="ghost-button" onClick={onReset}>Reset</button>
      </div>

      <div className="wavelength-card">
        <div className="wavelength-preview" style={{ background: currentLaserColor, color: currentLaserColor }} aria-hidden="true" />
        <div>
          <span>Warna laser dihitung dari panjang gelombang</span>
          <strong>{parameters.wavelengthNm} nm, {visibleColorName}</strong>
        </div>
      </div>

      <ParameterSlider
        label="Panjang gelombang laser"
        value={parameters.wavelengthNm}
        min={VISIBLE_WAVELENGTH_MIN}
        max={VISIBLE_WAVELENGTH_MAX}
        step={1}
        unit="nm"
        onChange={(wavelengthNm) => onChange({ wavelengthNm })}
      />

      <div className="spectrum-bar" aria-hidden="true" />

      <div className="preset-row wavelength-presets" aria-label="Preset panjang gelombang laser tampak">
        {visibleLaserPresets.map((preset) => {
          const color = wavelengthToHex(preset.wavelength);
          return (
            <button
              key={preset.wavelength}
              className={parameters.wavelengthNm === preset.wavelength ? "preset active" : "preset"}
              style={{ background: color }}
              title={`${preset.label} ${preset.wavelength} nm, ${preset.note}`}
              aria-label={`Laser ${preset.label} ${preset.wavelength} nanometer`}
              onClick={() => onChange({ wavelengthNm: preset.wavelength })}
            >
              <span>{preset.wavelength}</span>
            </button>
          );
        })}
      </div>

      {(activeLabId === "reflection" || activeLabId === "refraction") && (
        <ParameterSlider
          label="Sudut datang"
          value={parameters.incidentAngleDeg}
          min={5}
          max={80}
          step={1}
          unit="°"
          onChange={(incidentAngleDeg) => onChange({ incidentAngleDeg })}
        />
      )}

      {activeLabId === "reflection" && (
        <ParameterSlider
          label="Panjang bidang cermin"
          value={parameters.mirrorWidthCm}
          min={10}
          max={60}
          step={1}
          unit="cm"
          onChange={(mirrorWidthCm) => onChange({ mirrorWidthCm })}
        />
      )}

      {activeLabId === "refraction" && (
        <>
          <ParameterSlider
            label="Indeks bias medium 1"
            value={parameters.refractiveIndex1}
            min={1}
            max={2.5}
            step={0.01}
            precision={2}
            onChange={(refractiveIndex1) => onChange({ refractiveIndex1 })}
          />
          <ParameterSlider
            label="Indeks bias medium 2"
            value={parameters.refractiveIndex2}
            min={1}
            max={2.5}
            step={0.01}
            precision={2}
            onChange={(refractiveIndex2) => onChange({ refractiveIndex2 })}
          />
          <ParameterSlider
            label="Ketebalan medium 2"
            value={parameters.mediumThicknessCm}
            min={5}
            max={50}
            step={1}
            unit="cm"
            onChange={(mediumThicknessCm) => onChange({ mediumThicknessCm })}
          />
        </>
      )}

      {activeLabId === "interference" && (
        <>
          <ParameterSlider
            label="Jarak dua celah"
            value={parameters.slitSeparationMm}
            min={0.05}
            max={1}
            step={0.01}
            precision={2}
            unit="mm"
            onChange={(slitSeparationMm) => onChange({ slitSeparationMm })}
          />
          <ParameterSlider
            label="Lebar setiap celah"
            value={parameters.slitWidthUm}
            min={20}
            max={300}
            step={5}
            unit="µm"
            onChange={(slitWidthUm) => onChange({ slitWidthUm })}
          />
        </>
      )}

      {activeLabId === "diffraction" && (
        <ParameterSlider
          label="Lebar celah tunggal"
          value={parameters.slitWidthUm}
          min={20}
          max={300}
          step={5}
          unit="µm"
          onChange={(slitWidthUm) => onChange({ slitWidthUm })}
        />
      )}

      {isOpticalSlitLab && (
        <>
          <ParameterSlider
            label="Geser posisi slit"
            value={parameters.slitOffsetCm}
            min={-8}
            max={8}
            step={0.5}
            precision={1}
            unit="cm"
            onChange={(slitOffsetCm) => onChange({ slitOffsetCm })}
          />
          <ParameterSlider
            label="Geser posisi layar"
            value={parameters.screenOffsetCm}
            min={-8}
            max={8}
            step={0.5}
            precision={1}
            unit="cm"
            onChange={(screenOffsetCm) => onChange({ screenOffsetCm })}
          />
          <ParameterSlider
            label="Jarak layar dari celah"
            value={parameters.screenDistanceM}
            min={0.2}
            max={2}
            step={0.05}
            precision={2}
            unit="m"
            onChange={(screenDistanceM) => onChange({ screenDistanceM })}
          />
        </>
      )}

      <TheoryResult activeLabId={activeLabId} parameters={parameters} />

      {isOpticalSlitLab && (
        <p className="panel-note">Catatan skala: ukuran celah divisualkan lebih besar agar terlihat di layar. Perhitungan pola memakai ukuran nyata: nm, µm, mm, dan m.</p>
      )}

      <button className="primary-button full" onClick={onStartAR}>Coba Mode AR</button>
      <p className="panel-note">Mode AR membutuhkan browser dan perangkat yang mendukung WebXR. Simulasi tetap berjalan tanpa AR.</p>
    </section>
  );
}
