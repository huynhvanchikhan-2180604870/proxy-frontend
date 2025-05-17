import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";
// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  preview: {
    allowedHosts: ['proxy-check-app-4cd25acb8348.herokuapp.com'] 
  }
});
