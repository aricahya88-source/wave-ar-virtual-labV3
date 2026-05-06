/// <reference types="vite/client" />

interface Navigator {
  xr?: {
    isSessionSupported(mode: "inline" | "immersive-vr" | "immersive-ar"): Promise<boolean>;
  };
}
