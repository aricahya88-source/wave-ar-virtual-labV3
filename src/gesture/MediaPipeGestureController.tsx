import { useEffect, useRef, useState } from "react";
import { FilesetResolver, GestureRecognizer } from "@mediapipe/tasks-vision";
import type { GestureName } from "./gestureTypes";

type Landmark = {
  x: number;
  y: number;
  z?: number;
};

type Point3D = {
  x: number;
  y: number;
  z: number;
};

type MediaPipeGestureControllerProps = {
  onGesture: (gesture: GestureName) => void;
};

const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm";

const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task";

const SWIPE_THRESHOLD = 0.12;
const TWO_HANDS_ZOOM_THRESHOLD = 0.07;
const PINCH_THRESHOLD = 0.055;

const DEFAULT_COOLDOWN_MS = 850;
const OPEN_PALM_COOLDOWN_MS = 1800;
const ZOOM_COOLDOWN_MS = 700;

function distance(a: Landmark | Point3D, b: Landmark | Point3D) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = (a.z ?? 0) - (b.z ?? 0);

  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function getHandCenter(hand: Landmark[]): Point3D {
  const total = hand.reduce<Point3D>(
    (acc, point) => {
      return {
        x: acc.x + point.x,
        y: acc.y + point.y,
        z: acc.z + (point.z ?? 0)
      };
    },
    { x: 0, y: 0, z: 0 }
  );

  const length = Math.max(hand.length, 1);

  return {
    x: total.x / length,
    y: total.y / length,
    z: total.z / length
  };
}

function getCooldown(gesture: GestureName) {
  if (gesture === "open_palm") return OPEN_PALM_COOLDOWN_MS;

  if (
    gesture === "two_hands_apart" ||
    gesture === "two_hands_close" ||
    gesture === "zoom_in" ||
    gesture === "zoom_out"
  ) {
    return ZOOM_COOLDOWN_MS;
  }

  return DEFAULT_COOLDOWN_MS;
}

function mapBuiltInGesture(categoryName: string): GestureName | null {
  if (categoryName === "Open_Palm") return "open_palm";
  if (categoryName === "Closed_Fist") return "fist";

  return null;
}

export function MediaPipeGestureController({
  onGesture
}: MediaPipeGestureControllerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const recognizerRef = useRef<GestureRecognizer | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const onGestureRef = useRef(onGesture);
  const lastActionAtRef = useRef<Partial<Record<GestureName, number>>>({});
  const previousHandCenterRef = useRef<Point3D | null>(null);
  const previousTwoHandsDistanceRef = useRef<number | null>(null);

  const [isRunning, setIsRunning] = useState(false);
  const [statusText, setStatusText] = useState("Gesture kamera belum aktif.");
  const [lastGesture, setLastGesture] = useState<GestureName | "-">("-");

  useEffect(() => {
    onGestureRef.current = onGesture;
  }, [onGesture]);

  function emitGesture(gesture: GestureName) {
    const now = Date.now();
    const lastActionAt = lastActionAtRef.current[gesture] ?? 0;
    const cooldown = getCooldown(gesture);

    if (now - lastActionAt < cooldown) return;

    lastActionAtRef.current[gesture] = now;
    setLastGesture(gesture);
    onGestureRef.current(gesture);
  }

  function analyzeResult(result: any) {
    const hands = (result.landmarks ?? []) as Landmark[][];

    if (!hands.length) {
      previousHandCenterRef.current = null;
      previousTwoHandsDistanceRef.current = null;
      return;
    }

    if (hands.length >= 2) {
      const firstCenter = getHandCenter(hands[0]);
      const secondCenter = getHandCenter(hands[1]);
      const currentDistance = distance(firstCenter, secondCenter);
      const previousDistance = previousTwoHandsDistanceRef.current;

      if (previousDistance !== null) {
        const delta = currentDistance - previousDistance;

        if (delta > TWO_HANDS_ZOOM_THRESHOLD) {
          emitGesture("two_hands_apart");
        }

        if (delta < -TWO_HANDS_ZOOM_THRESHOLD) {
          emitGesture("two_hands_close");
        }
      }

      previousTwoHandsDistanceRef.current = currentDistance;
      previousHandCenterRef.current = null;
      return;
    }

    previousTwoHandsDistanceRef.current = null;

    const hand = hands[0];
    const center = getHandCenter(hand);
    const previousCenter = previousHandCenterRef.current;

    const thumbTip = hand[4];
    const indexTip = hand[8];

    if (thumbTip && indexTip) {
      const pinchDistance = distance(thumbTip, indexTip);

      if (pinchDistance < PINCH_THRESHOLD) {
        emitGesture("pinch");
      }
    }

    const bestGesture = result.gestures?.[0]?.[0];
    const categoryName = bestGesture?.categoryName;
    const score = bestGesture?.score ?? 0;

    if (categoryName && score >= 0.55) {
      const mappedGesture = mapBuiltInGesture(categoryName);

      if (mappedGesture) {
        emitGesture(mappedGesture);
      }
    }

    if (previousCenter) {
      const dx = center.x - previousCenter.x;
      const dy = center.y - previousCenter.y;

      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_THRESHOLD) {
        emitGesture(dx > 0 ? "swipe_right" : "swipe_left");
      }

      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > SWIPE_THRESHOLD) {
        emitGesture(dy < 0 ? "swipe_up" : "swipe_down");
      }
    }

    previousHandCenterRef.current = center;
  }

  function startLoop() {
    const video = videoRef.current;
    const recognizer = recognizerRef.current;

    if (!video || !recognizer) return;

    if (video.readyState >= 2) {
      const result = recognizer.recognizeForVideo(video, performance.now());
      analyzeResult(result);
    }

    animationFrameRef.current = window.requestAnimationFrame(startLoop);
  }

  async function startCameraGesture() {
    try {
      setStatusText("Memuat MediaPipe dan meminta izin kamera...");

      if (!navigator.mediaDevices?.getUserMedia) {
        setStatusText("Browser belum mendukung akses kamera.");
        return;
      }

      const vision = await FilesetResolver.forVisionTasks(WASM_URL);

      const recognizer = await GestureRecognizer.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: MODEL_URL,
          delegate: "CPU"
        },
        runningMode: "VIDEO",
        numHands: 2
      });

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      });

      const video = videoRef.current;

      if (!video) {
        stream.getTracks().forEach((track) => track.stop());
        recognizer.close();
        setStatusText("Elemen video belum siap.");
        return;
      }

      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;

      await video.play();

      recognizerRef.current = recognizer;
      streamRef.current = stream;

      previousHandCenterRef.current = null;
      previousTwoHandsDistanceRef.current = null;

      setIsRunning(true);
      setStatusText("Gesture kamera aktif. Gerakkan tangan di depan kamera.");

      startLoop();
    } catch (error) {
      console.error("Gagal mengaktifkan MediaPipe:", error);

      if (error instanceof DOMException && error.name === "NotAllowedError") {
        setStatusText("Izin kamera ditolak. Izinkan kamera lalu coba lagi.");
        return;
      }

      if (error instanceof Error) {
        setStatusText(`Gesture gagal aktif: ${error.message}`);
        return;
      }

      setStatusText("Gesture gagal aktif. Periksa browser, kamera, dan koneksi internet.");
    }
  }

  function stopCameraGesture() {
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    recognizerRef.current?.close();
    recognizerRef.current = null;

    previousHandCenterRef.current = null;
    previousTwoHandsDistanceRef.current = null;

    const video = videoRef.current;

    if (video) {
      video.pause();
      video.srcObject = null;
    }

    setIsRunning(false);
    setStatusText("Gesture kamera dimatikan.");
  }

  useEffect(() => {
    return () => {
      stopCameraGesture();
    };
  }, []);

  return (
    <div className="mediapipe-gesture-controller">
      <div className="mediapipe-gesture-header">
        <strong>Gesture Kamera</strong>
        <span>{isRunning ? "Aktif" : "Nonaktif"}</span>
      </div>

      <video
        ref={videoRef}
        className="mediapipe-gesture-video"
        autoPlay
        muted
        playsInline
      />

      <p className="mediapipe-gesture-status">{statusText}</p>

      <p className="mediapipe-gesture-last">
        Gesture terakhir: <strong>{lastGesture}</strong>
      </p>

      <div className="mediapipe-gesture-actions">
        <button
          type="button"
          onClick={isRunning ? stopCameraGesture : startCameraGesture}
        >
          {isRunning ? "Matikan Gesture" : "Aktifkan Gesture"}
        </button>
      </div>

      <div className="mediapipe-gesture-help">
        <span>Swipe kanan/kiri: pilih variabel</span>
        <span>Swipe atas/bawah: ubah nilai</span>
        <span>Dua tangan menjauh/mendekat: zoom</span>
      </div>
    </div>
  );
}
