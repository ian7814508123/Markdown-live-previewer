# Mermaid Lens Pro

A professional, real-time editor for **Mermaid.js** diagrams and **Markdown** documentation.

<div align="center">
  <!-- You can replace this with a screenshot of the new UI later -->
  <h3>Live Editor • Dual Mode • High-Res Export</h3>
</div>

## Features

### 🧜‍♀️ Mermaid Diagram Editor
- **Real-time Rendering**: Instantly visualize flowcharts, sequence diagrams, gantt charts, and more.
- **Smart Controls**: Drag to pan, Ctrl+Scroll to zoom.
- **Theme Support**: Switch between Default, Neutral, Dark, and Forest themes.
- **Export Options**: 
  - **PNG** (High Fidelity)
  - **JPG** (Compressed)
  - **SVG** (Vector / Resolution Independent)

### 📝 Markdown Editor
- **Full GFM Support**: Write standard GitHub Flavored Markdown.
- **Rich Preview**: Immediate rendering of headers, lists, links, and code blocks.
- **MathJax & Mermaid**: Support for LaTeX formulas and Mermaid diagrams within Markdown.
- **Export & Print**: 
  - Save your work as `.md` files.
  - **Print to PDF** with customizable margins and paper sizes.
  - **Syntax Highlighting** preserved in print/PDF output.

### ⚡ Efficient Workflow
- **Image Uploader**: Upload local images to IndexedDB and insert them directly into documents.
- **Print & PDF Preview**: Visualize A4/Letter paper sizes with real-time page break indicators.
- **Tab Indentation**: Supports 2-space indentation with the Tab key.
- **Clean UI**: Minimalist, distraction-free interface with Material Design 3 aesthetics.
- **Local Execution**: Runs entirely in your browser/locally with data persistence.

## Getting Started

### Prerequisites
- Node.js (v16 or higher recommended)

### Installation

1. Clone the repository (if applicable) or download the source.
2. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally

Start the development server:
```bash
npm run dev
```
如果要打開網際網路存取(不安全), 在vite.config.ts中的server段落加上host: "0.0.0.0"
Open your browser to `http://localhost:5173` (or the port shown in your terminal).

## Usage

1. **Switch Modes**: Use the toggle in the top header to switch between `Mermaid` and `Markdown` modes.
   > **Note**: Switching modes will reset the current editor content.
2. **Editing**: Type on the left panel.
3. **Preview**: See the result on the right panel.
4. **Download**: Click the **Download** button in the header to save your creation.




## Deployment & Preview

This project is configured with a specific `base` path for GitHub Pages deployment.

### 🔧 Development (Local)
Runs on `http://localhost:3000/` (Root path).
```bash
npm run dev
```

### 🚀 Production Preview (Local)
To verify the production build locally, use the `preview` command.
**Do not use `npx serve dist`** directly, as it doesn't handle the base path configuration correctly.

```bash
npm run build
npm run preview
```
This will start a server at `http://localhost:4173/Markdown-live-previewer/`.

### 🐳 Docker Deployment (推薦用於生產環境)

使用 Docker 部署可以獲得一致的運行環境，適合生產環境使用。

**快速啟動**：
```bash
docker-compose up -d
```
訪問 `http://localhost:8080`

**詳細說明**請參考 [Docker 部署指南](docs/docker-deployment.md)。

### ☁️ 雲端部署 (推薦用於公開存取)

如果需要讓其他人也能存取你的應用,推薦使用免費的雲端平台:

- **Render** (最推薦): 永久免費,零配置,自動 HTTPS
- **Railway**: 簡單易用,每月 $5 免費額度  
- **Fly.io**: 高性能,免費 3 個 VM
- **Google Cloud Run**: Serverless,按使用計費

**完整教學**請參考 [雲端部署指南](docs/cloud-deployment.md)。

### 📦 Deployment (GitHub Pages)
The `vite.config.ts` is configured to set the base path to `/Markdown-live-previewer/` when running `vite build`.

1.  **Build**: `npm run build`
2.  **Deploy**: Push the `dist` folder to your `gh-pages` branch (or configure GitHub Actions).

**Note on Styling**:
Production builds include specific CSS overrides in `public/index.css` to ensure MathJax equations render correctly without unwanted line breaks. Always verify with `npm run preview` before deploying.

## License

This project is licensed under the [MIT License](LICENSE). 

For a complete list of third-party dependencies and their licenses, please refer to [docs/dependencies.md](docs/dependencies.md) or check the **About** tab in the application settings.

