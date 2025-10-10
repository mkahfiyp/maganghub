import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // server: {
  //   proxy: {
  //     "/api/maganghub": {
  //       target: "https://maganghub.kemnaker.go.id",
  //       changeOrigin: true,
  //       rewrite: (path) => path.replace(/^\/api\/maganghub/, "/be/v1/api"),
  //     },
  //   },
  // },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
