import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/wave-ar-virtual-labV3/",
  server: {
    host: "0.0.0.0",
    port: 5173
  }
});
