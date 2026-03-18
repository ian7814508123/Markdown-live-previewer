
import React from 'react';
import ReactDOM from 'react-dom/client';
import './src/index.css';
import App from './App';

declare global {
  interface Window {
    trustedTypes?: {
      createPolicy: (
        name: string,
        rules: {
          createHTML?: (html: string) => string;
          createScriptURL?: (url: string) => string;
          createScript?: (script: string) => string;
        }
      ) => any;
    };
  }
}

// ─── Trusted Types Policy ──────────────────────────────────────────────────
// 解決 Mermaid, MathJax 在啟用 require-trusted-types-for 'script' CSP 後的報錯
if (window.trustedTypes && window.trustedTypes.createPolicy) {
  window.trustedTypes.createPolicy('default', {
    createHTML: (string) => string,
    createScriptURL: (string) => {
      // 僅允許來自 jsdelivr 的腳本 URL，這對 MathJax v4 動態加載是必要的
      if (string.includes('cdn.jsdelivr.net')) {
        return string;
      }
      return string; // 或者根據需要進行更嚴格的檢查
    },
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
