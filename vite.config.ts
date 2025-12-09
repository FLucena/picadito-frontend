import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Split node_modules into vendor chunks
          if (id.includes('node_modules')) {
            // React and React DOM
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            // React Query
            if (id.includes('@tanstack/react-query')) {
              return 'vendor-react-query';
            }
            // Other vendor libraries
            return 'vendor';
          }
          // Split pages into separate chunks
          if (id.includes('/pages/')) {
            const pageName = id.split('/pages/')[1].split('.')[0];
            return `page-${pageName}`;
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Increase limit to 1MB
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://picadito-backend.onrender.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path, // Keep the /api prefix
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log('Sending Request to the Target:', req.method, req.url);
            // Remove origin-related headers to avoid CORS issues
            proxyReq.removeHeader('origin');
            proxyReq.removeHeader('referer');
            // Ensure proper headers for JSON
            if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
              proxyReq.setHeader('Content-Type', 'application/json');
            }
          });
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            // Remove CORS-related headers since we're proxying (same-origin from browser's perspective)
            delete proxyRes.headers['access-control-allow-origin'];
            delete proxyRes.headers['access-control-allow-credentials'];
            delete proxyRes.headers['access-control-allow-methods'];
            delete proxyRes.headers['access-control-allow-headers'];
            delete proxyRes.headers['vary'];
          });
        },
      },
    },
  },
})
