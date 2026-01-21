import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Production build configuration
export default defineConfig({
  plugins: [react(), tailwindcss()],
});
