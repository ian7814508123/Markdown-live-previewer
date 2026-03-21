import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteCommonjs } from '@originjs/vite-plugin-commonjs';

export default defineConfig(() => {
  const isElectron = process.env.VITE_ELECTRON === 'true';
  
  return {
    base: isElectron ? './' : '/',
    server: {
      port: 5173,
      host: "0.0.0.0"
    },
    plugins: [
      react(),
      tailwindcss(),
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
      sourcemap: true,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-mermaid': ['mermaid'],
            'vendor-vega': ['vega', 'vega-lite', 'vega-embed'],
            'vendor-mathjax': ['better-react-mathjax', 'rehype-mathjax', 'mathjax-full'],
            'vendor-utils': ['xlsx', 'pdf-lib'],
            'vendor-ui': [
              'react',
              'react-dom',
              'lucide-react',
              '@uiw/react-codemirror',
              '@codemirror/view',
              '@codemirror/state'
            ],
          }
        }
      }
    }
  };
});
