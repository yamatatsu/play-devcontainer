import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // bind to 0.0.0.0 to make accessible from outside the container
    port: 5173,
  },
});
