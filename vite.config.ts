import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // json-server가 db.json을 쓸 때마다 Vite가 감지하면 페이지가 다시 로드되며 GET /posts가 또 나감 → 무시
  server: {
    watch: {
      ignored: ["**/server/**"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
