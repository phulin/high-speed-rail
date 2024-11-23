import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  base: "/high-speed-rail/",
  plugins: [react()],
  server: {
    // this ensures that the browser opens upon server start
    open: true,
    port: 3000,
    proxy: {
      [`^/(?!high-speed-rail/|src/|node_modules/|@react-refresh|@vite).*(?<!.js.map)$`]:
        {
          target: "http://127.0.0.1:60080",
          changeOrigin: true,
          secure: false,
        },
    },
  },
});
