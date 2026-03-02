import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['essence-icon.svg', 'essence-maskable.svg'],
      manifest: {
        name: 'ESSENCE FACTORY SAAS',
        short_name: 'ESSENCE',
        description: 'Plataforma white-label multiindustria para reservas y operaciones.',
        theme_color: '#0b0c10',
        background_color: '#0b0c10',
        display: 'standalone',
        icons: [
          {
            src: '/essence-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml'
          },
          {
            src: '/essence-maskable.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
  server: {
    port: 5174
  }
});
