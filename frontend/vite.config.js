import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig(function (_a) {
    var command = _a.command;
    return ({
        plugins: [
            react(),
            tailwindcss(),
            VitePWA({
                registerType: 'autoUpdate',
                devOptions: {
                    enabled: true
                },
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
        resolve: {
            alias: command === 'serve'
                ? {
                    'virtual:pwa-register': '/src/shared/infrastructure/pwa/devRegisterSW.ts'
                }
                : {}
        },
        server: {
            port: 5174,
            watch: {
                usePolling: true,
                interval: 200
            }
        }
    });
});
