import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// [CRM DEF V.5] Configuración limpia: el prototipo no depende de claves de IA.
// No se inyectan variables process.env.API_KEY ni GEMINI_API_KEY.
export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  }
});
