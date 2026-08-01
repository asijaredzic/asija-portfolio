import { defineConfig } from "vite";

export default defineConfig({
  base: "/asija-portfolio/",
  server: {
    host: true,
    port: 3000,
    strictPort: false,
    allowedHosts: true,
  },
});
