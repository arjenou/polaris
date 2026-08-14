import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Served under /admin on the public site's domain (proxied there via the
  // Next.js rewrite in ../next.config.ts), so all built asset URLs need the
  // matching prefix.
  base: "/admin/",
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://127.0.0.1:8788",
      "/media": "http://127.0.0.1:8788",
    },
  },
});
