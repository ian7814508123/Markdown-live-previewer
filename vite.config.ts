import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteCommonjs } from '@originjs/vite-plugin-commonjs';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    base: '/',
    server: {
      port: 3000,
      host: "0.0.0.0"
    },
    plugins: [
      react(),
      tailwindcss(),
      viteCommonjs({
        include: ['mathjax-full']
      }),
      // 動態生成 Google 驗證檔案
      {
        name: 'generate-google-verify',
        closeBundle() {
          const verifyId = env.VITE_GOOGLE_VERIFY_ID;
          if (verifyId) {
            const outDir = path.resolve(__dirname, 'dist');
            const filePath = path.resolve(outDir, `${verifyId}.html`);
            if (fs.existsSync(outDir)) {
              fs.writeFileSync(filePath, `google-site-verification: ${verifyId}.html`);
              console.log(`\nGenerated Google verification file: ${verifyId}.html`);
            }
          }
        }
      }
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
