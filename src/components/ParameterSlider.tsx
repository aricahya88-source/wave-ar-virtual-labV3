type ParameterSliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  precision?: number;
  onChange: (value: number) => void;
};

function inferPrecision(step: number) {
  if (step >= 1) return 0;
  const text = step.toString();
  return text.includes(".") ? text.split(".")[1].length : 0;
}

export function ParameterSlider({ label, value, min, max, step = 0.1, unit = "", precision, onChange }: ParameterSliderProps) {
  const digits = precision ?? inferPrecision(step);

  return (
    <label className="slider-group">
      <span>
        {label}
        <strong>{value.toFixed(digits)} {unit}</strong>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}
