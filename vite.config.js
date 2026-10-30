import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite is the tool that runs and builds the React app.
export default defineConfig({
  plugins: [react()]
});
