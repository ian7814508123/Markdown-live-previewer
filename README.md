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
- **Export**: Save your work as `.md` files.

### ⚡ Efficient Workflow
- **Tab Indentation**: Supports 2-space indentation with the Tab key.
- **Clean UI**: Minimalist, distraction-free interface.
- **Local Execution**: Runs entirely in your browser/locally.

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

### 📦 Deployment (GitHub Pages)
The `vite.config.ts` is configured to set the base path to `/Markdown-live-previewer/` when running `vite build`.

1.  **Build**: `npm run build`
2.  **Deploy**: Push the `dist` folder to your `gh-pages` branch (or configure GitHub Actions).

**Note on Styling**:
Production builds include specific CSS overrides in `public/index.css` to ensure MathJax equations render correctly without unwanted line breaks. Always verify with `npm run preview` before deploying.
