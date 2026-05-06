import { useMemo, useRef, useState } from "react";
import type { Lab, LabParameters } from "../types/lab";
import { WaveScene, type WaveSceneHandle } from "./WaveScene";
import { ParameterPanel } from "./ParameterPanel";
import { defaultParameters } from "../data/defaultParameters";
import { ARVariableHUD, clampVariableValue, getGestureControls } from "./ARVariableHUD";

type SimulationViewProps = {
  lab: Lab;
};

const MIN_AR_ZOOM = 0.6;
const MAX_AR_ZOOM = 2.4;
const AR_ZOOM_STEP = 0.15;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function SimulationView({ lab }: SimulationViewProps) {
  const [parameters, setParameters] = useState<LabParameters>(defaultParameters);
  const [activeGestureIndex, setActiveGestureIndex] = useState(0);
  const [zoomScale, setZoomScale] = useState(1);
  const [isHudVisible, setIsHudVisible] = useState(true);
  const waveSceneRef = useRef<WaveSceneHandle | null>(null);

  const gestureControls = useMemo(() => getGestureControls(lab.id), [lab.id]);
  const safeActiveIndex = gestureControls.length > 0 ? activeGestureIndex % gestureControls.length : 0;

  function changeParameters(next: Partial<LabParameters>) {
    setParameters((current) => ({ ...current, ...next }));
  }

  function selectNextGestureParameter() {
    setActiveGestureIndex((current) => (current + 1) % gestureControls.length);
  }

  function selectPreviousGestureParameter() {
    setActiveGestureIndex((current) => (current - 1 + gestureControls.length) % gestureControls.length);
  }

  function changeActiveGestureParameter(direction: 1 | -1) {
    const control = gestureControls[safeActiveIndex];
    if (!control) return;

    setParameters((current) => {
      const currentValue = current[control.key];
      const nextValue = clampVariableValue(control, currentValue + control.step * direction);
      return { ...current, [control.key]: nextValue };
    });
  }

  function zoomIn() {
    setZoomScale((current) => clamp(Number((current + AR_ZOOM_STEP).toFixed(2)), MIN_AR_ZOOM, MAX_AR_ZOOM));
  }

  function zoomOut() {
    setZoomScale((current) => clamp(Number((current - AR_ZOOM_STEP).toFixed(2)), MIN_AR_ZOOM, MAX_AR_ZOOM));
  }

  function resetSimulation() {
    setParameters(defaultParameters);
    setActiveGestureIndex(0);
    setZoomScale(1);
  }

  return (
    <section className="simulation-layout">
      <div className="simulation-main">
        <div className="simulation-title-row">
          <div>
            <p className="eyebrow">Simulasi Laser</p>
            <h2>{lab.title}</h2>
            <p>{lab.subtitle}</p>
          </div>
        </div>
        <WaveScene ref={waveSceneRef} labId={lab.id} parameters={parameters} zoomScale={zoomScale}>
          <ARVariableHUD
            activeLabId={lab.id}
            parameters={parameters}
            activeIndex={safeActiveIndex}
            zoomScale={zoomScale}
            isVisible={isHudVisible}
            onToggleVisible={() => setIsHudVisible((current) => !current)}
            onSelectNext={selectNextGestureParameter}
            onSelectPrevious={selectPreviousGestureParameter}
            onIncreaseActive={() => changeActiveGestureParameter(1)}
            onDecreaseActive={() => changeActiveGestureParameter(-1)}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onResetZoom={() => setZoomScale(1)}
          />
        </WaveScene>
      </div>

      <div className="simulation-sidebar">
        <ParameterPanel
          activeLabId={lab.id}
          parameters={parameters}
          onChange={changeParameters}
          onReset={resetSimulation}
          onStartAR={() => void waveSceneRef.current?.startAR()}
        />
      </div>
    </section>
  );
}
