import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { viteCommonjs } from '@originjs/vite-plugin-commonjs';

export default defineConfig(({ mode }) => {
  // 支援環境變數控制 base path，預設 Docker 環境使用根路徑

  return {
    base: '/',
    server: {
      port: 3000,
      host: "0.0.0.0"
    },
    plugins: [
      react(),
      viteCommonjs({
        include: ['mathjax-full']
      }),
    ],
    define: {
      'global': 'window',
      'process.env': {},
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    optimizeDeps: {
      include: [
        'mathjax-full',
        'mathjax-full/js/components/version.js',
        'rehype-mathjax'
      ],
      esbuildOptions: {
        define: {
          global: 'globalThis'
        }
      }
    },
    build: {
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    }
  };
});
