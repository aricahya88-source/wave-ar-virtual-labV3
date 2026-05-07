import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode
} from "react";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Engine } from "@babylonjs/core/Engines/engine";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { WebXRDefaultExperience } from "@babylonjs/core/XR/webXRDefaultExperience";
import type { LabId, LabParameters } from "../types/lab";
import { createSimulationVisuals } from "../engine/createSimulationVisuals";

type WaveSceneProps = {
  labId: LabId;
  parameters: LabParameters;
  zoomScale: number;
  children?: ReactNode;
};

export type WaveSceneHandle = {
  startAR: () => Promise<void>;
};

function getReadableXRError(error: unknown) {
  if (error instanceof DOMException) {
    if (error.name === "NotSupportedError") {
      return "Mode AR tidak didukung oleh browser atau perangkat ini.";
    }

    if (error.name === "SecurityError") {
      return "Mode AR membutuhkan HTTPS, localhost, atau izin kamera yang valid.";
    }

    if (error.name === "NotAllowedError") {
      return "Izin AR/kamera ditolak. Izinkan akses kamera lalu coba lagi.";
    }

    return `${error.name}: ${error.message}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Mode AR gagal dijalankan. Periksa perangkat, browser, dan koneksi HTTPS.";
}

export const WaveScene = forwardRef<WaveSceneHandle, WaveSceneProps>(
  function WaveScene({ labId, parameters, zoomScale, children }, ref) {
    const shellRef = useRef<HTMLElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const engineRef = useRef<Engine | null>(null);
    const sceneRef = useRef<Scene | null>(null);
    const xrRef = useRef<WebXRDefaultExperience | null>(null);

    const [xrMessage, setXrMessage] = useState(
      "Mode AR siap dicoba jika perangkat mendukung WebXR."
    );
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const engine = new Engine(canvas, true, {
        preserveDrawingBuffer: false,
        stencil: true,
        antialias: true
      });

      const scene = new Scene(engine);
      scene.clearColor.set(0.02, 0.05, 0.1, 1);
      scene.skipPointerMovePicking = true;

      const camera = new ArcRotateCamera(
        "main-camera",
        -Math.PI / 2,
        Math.PI / 2.8,
        8.5,
        new Vector3(0, 0.4, 0),
        scene
      );

      camera.attachControl(canvas, true);
      camera.lowerRadiusLimit = 4;
      camera.upperRadiusLimit = 14;
      camera.wheelPrecision = 45;

      const light = new HemisphericLight(
        "main-light",
        new Vector3(0.4, 1, 0.3),
        scene
      );

      light.intensity = 0.92;
      light.groundColor = new Color3(0.08, 0.09, 0.12);

      engine.runRenderLoop(() => {
        scene.render();
      });

      const onResize = () => {
        engine.resize();
      };

      window.addEventListener("resize", onResize);

      engineRef.current = engine;
      sceneRef.current = scene;

      return () => {
        window.removeEventListener("resize", onResize);
        scene.dispose();
        engine.dispose();

        sceneRef.current = null;
        engineRef.current = null;
        xrRef.current = null;
      };
    }, []);

    useEffect(() => {
      const scene = sceneRef.current;
      if (!scene) return;

      const root = createSimulationVisuals(scene, labId, parameters);

      root.scaling.x = zoomScale;
      root.scaling.y = zoomScale;
      root.scaling.z = zoomScale;
    }, [labId, parameters, zoomScale]);


    useEffect(() => {
      const getFullscreenElement = () => {
        const webkitDocument = document as Document & {
          webkitFullscreenElement?: Element | null;
        };

        return document.fullscreenElement ?? webkitDocument.webkitFullscreenElement ?? null;
      };

      const handleFullscreenChange = () => {
        setIsFullscreen(getFullscreenElement() === shellRef.current);

        window.setTimeout(() => {
          engineRef.current?.resize();
        }, 80);
      };

      document.addEventListener("fullscreenchange", handleFullscreenChange);
      document.addEventListener("webkitfullscreenchange", handleFullscreenChange as EventListener);

      return () => {
        document.removeEventListener("fullscreenchange", handleFullscreenChange);
        document.removeEventListener("webkitfullscreenchange", handleFullscreenChange as EventListener);
      };
    }, []);

    const toggleFullscreen = useCallback(async () => {
      const shell = shellRef.current;

      if (!shell) {
        setXrMessage("Area simulasi belum siap untuk mode fullscreen.");
        return;
      }

      const webkitDocument = document as Document & {
        webkitFullscreenElement?: Element | null;
        webkitExitFullscreen?: () => Promise<void> | void;
      };

      const fullscreenElement =
        document.fullscreenElement ?? webkitDocument.webkitFullscreenElement ?? null;

      try {
        if (fullscreenElement) {
          if (document.exitFullscreen) {
            await document.exitFullscreen();
          } else if (webkitDocument.webkitExitFullscreen) {
            await webkitDocument.webkitExitFullscreen();
          }

          return;
        }

        const webkitShell = shell as HTMLElement & {
          webkitRequestFullscreen?: () => Promise<void> | void;
        };

        if (shell.requestFullscreen) {
          await shell.requestFullscreen();
        } else if (webkitShell.webkitRequestFullscreen) {
          await webkitShell.webkitRequestFullscreen();
        } else {
          setXrMessage("Browser ini belum mendukung tombol fullscreen untuk area simulasi.");
        }
      } catch (error) {
        console.error("Gagal mengaktifkan fullscreen:", error);

        if (error instanceof Error) {
          setXrMessage(`Fullscreen gagal aktif: ${error.message}`);
          return;
        }

        setXrMessage("Fullscreen gagal aktif. Coba gunakan browser Chrome atau Edge terbaru.");
      }
    }, []);

    const startAR = useCallback(async () => {
      const scene = sceneRef.current;

      if (!scene) {
        setXrMessage("Scene belum siap. Tunggu simulasi muncul, lalu tekan AR lagi.");
        return;
      }

      if (!window.isSecureContext) {
        setXrMessage(
          "Mode AR membutuhkan HTTPS atau localhost. Jangan buka dari file HTML langsung atau IP lokal HTTP biasa."
        );
        return;
      }

      if (!navigator.xr) {
        setXrMessage(
          "Browser ini belum menyediakan WebXR. Coba Chrome Android pada perangkat yang mendukung ARCore."
        );
        return;
      }

      try {
        const supported = await navigator.xr.isSessionSupported("immersive-ar");

        if (!supported) {
          setXrMessage(
            "Perangkat atau browser ini belum mendukung immersive-ar. Simulasi 3D tetap bisa digunakan."
          );
          return;
        }

        if (!xrRef.current) {
          xrRef.current = await WebXRDefaultExperience.CreateAsync(scene, {
            disableDefaultUI: true,
            disableTeleportation: true,
            disableNearInteraction: true,
            ignoreNativeCameraTransformation: true,
            uiOptions: {
              sessionMode: "immersive-ar",
              referenceSpaceType: "local"
            },
            optionalFeatures: true
          });
        }

        const overlayElement = document.getElementById("ar-dom-overlay");

        const xrSessionOptions = overlayElement
          ? ({
              optionalFeatures: ["dom-overlay"],
              domOverlay: {
                root: overlayElement
              }
            } as any)
          : ({
              optionalFeatures: []
            } as any);

        await xrRef.current.baseExperience.enterXRAsync(
          "immersive-ar",
          "local",
          xrRef.current.renderTarget,
          xrSessionOptions
        );

        setXrMessage("Mode AR aktif. Arahkan kamera ke permukaan datar.");
      } catch (error) {
        console.error("Gagal masuk mode AR:", error);
        setXrMessage(getReadableXRError(error));
      }
    }, []);

    useImperativeHandle(ref, () => ({ startAR }), [startAR]);

    return (
      <section ref={shellRef} className={`scene-shell${isFullscreen ? " is-fullscreen" : ""}`}>
        <button
          type="button"
          className="scene-fullscreen-button"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? "Keluar dari fullscreen" : "Tampilkan simulasi fullscreen"}
        >
          {isFullscreen ? "Keluar Fullscreen" : "Fullscreen"}
        </button>

        <canvas
          ref={canvasRef}
          className="wave-canvas"
          aria-label="Area simulasi gelombang cahaya"
        />

        <div id="ar-dom-overlay" className="xr-dom-overlay-root">
          {children}
        </div>

        <div className="scene-status">
          {xrMessage} Render dibuat stabil: objek hanya diperbarui saat parameter berubah.
        </div>
      </section>
    );
  }
);
