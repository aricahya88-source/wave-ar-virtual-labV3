import { useMemo, useRef, useState } from "react";
import type { Lab, LabParameters } from "../types/lab";
import { WaveScene, type WaveSceneHandle } from "./WaveScene";
import { ParameterPanel } from "./ParameterPanel";
import { defaultParameters } from "../data/defaultParameters";
import { ARVariableHUD, clampVariableValue, getGestureControls } from "./ARVariableHUD";
import { MediaPipeGestureController } from "../gesture/MediaPipeGestureController";
import type { GestureName } from "../gesture/gestureTypes";

type SimulationViewProps = {
  lab: Lab;
};

const MIN_AR_ZOOM = 0.05;
const MAX_AR_ZOOM = 2.4;
const AR_ZOOM_STEP = 0.05;
const DEFAULT_AR_ZOOM = 0.25;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function SimulationView({ lab }: SimulationViewProps) {
  const [parameters, setParameters] = useState<LabParameters>(defaultParameters);
  const [activeGestureIndex, setActiveGestureIndex] = useState(0);
  const [zoomScale, setZoomScale] = useState(DEFAULT_AR_ZOOM);
  const [isHudVisible, setIsHudVisible] = useState(true);

  const waveSceneRef = useRef<WaveSceneHandle | null>(null);

  const gestureControls = useMemo(() => getGestureControls(lab.id), [lab.id]);

  const safeActiveIndex =
    gestureControls.length > 0 ? activeGestureIndex % gestureControls.length : 0;

  function changeParameters(next: Partial<LabParameters>) {
    setParameters((current) => ({ ...current, ...next }));
  }

  function selectNextGestureParameter() {
    if (!gestureControls.length) return;

    setActiveGestureIndex((current) => (current + 1) % gestureControls.length);
  }

  function selectPreviousGestureParameter() {
    if (!gestureControls.length) return;

    setActiveGestureIndex((current) => (current - 1 + gestureControls.length) % gestureControls.length);
  }

  function changeActiveGestureParameter(direction: 1 | -1) {
    const control = gestureControls[safeActiveIndex];

    if (!control) return;

    setParameters((current) => {
      const currentValue = current[control.key];
      const nextValue = clampVariableValue(control, currentValue + control.step * direction);

      return {
        ...current,
        [control.key]: nextValue
      };
    });
  }

  function zoomIn() {
    setZoomScale((current) =>
      clamp(Number((current + AR_ZOOM_STEP).toFixed(2)), MIN_AR_ZOOM, MAX_AR_ZOOM)
    );
  }

  function zoomOut() {
    setZoomScale((current) =>
      clamp(Number((current - AR_ZOOM_STEP).toFixed(2)), MIN_AR_ZOOM, MAX_AR_ZOOM)
    );
  }

  function resetSimulation() {
    setParameters(defaultParameters);
    setActiveGestureIndex(0);
    setZoomScale(DEFAULT_AR_ZOOM);
    setIsHudVisible(true);
  }

  function handleMediaPipeGesture(gesture: GestureName) {
    if (gesture === "open_palm") {
      setIsHudVisible((current) => !current);
      return;
    }

    if (gesture === "swipe_right") {
      selectNextGestureParameter();
      return;
    }

    if (gesture === "swipe_left") {
      selectPreviousGestureParameter();
      return;
    }

    if (gesture === "swipe_up") {
      changeActiveGestureParameter(1);
      return;
    }

    if (gesture === "swipe_down") {
      changeActiveGestureParameter(-1);
      return;
    }

    if (gesture === "two_hands_apart" || gesture === "zoom_in") {
      zoomIn();
      return;
    }

    if (gesture === "two_hands_close" || gesture === "zoom_out") {
      zoomOut();
      return;
    }

    if (gesture === "pinch") {
      setIsHudVisible(true);
      return;
    }

    if (gesture === "fist") {
      setIsHudVisible(true);
    }
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
  gestureSlot={
    <MediaPipeGestureController onGesture={handleMediaPipeGesture} />
  }
  onToggleVisible={() => setIsHudVisible((current) => !current)}
  onSelectNext={selectNextGestureParameter}
  onSelectPrevious={selectPreviousGestureParameter}
  onIncreaseActive={() => changeActiveGestureParameter(1)}
  onDecreaseActive={() => changeActiveGestureParameter(-1)}
  onZoomIn={zoomIn}
  onZoomOut={zoomOut}
  onResetZoom={() => setZoomScale(DEFAULT_AR_ZOOM)}
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
