# 雲端部署方案指南

本文件提供多種**免費或低成本**的雲端部署選項,確保 Markdown Live Previewer 可以公開存取,且前端畫面與本地完全一致。

---

使用 Docker 部署到**支援根路徑**的雲端平台,確保與本地環境完全一致!

---

## ☁️ 推薦雲端平台(按易用性排序)

### 🥇 選項 1: Render (最推薦)

**優點**:
- ✅ **永久免費方案**(每月 750 小時,足夠全天候運行)
- ✅ 自動 HTTPS
- ✅ 支援 Docker 部署
- ✅ 零配置 CI/CD(連接 GitHub 自動部署)
- ✅ 可自訂網域

**部署步驟**:

1. **註冊帳號**: [https://render.com](https://render.com)

2. **連接 GitHub**: 
   - 從 Dashboard 點選 **New** → **Web Service**
   - 選擇你的 GitHub 倉庫

3. **配置服務**:
   ```
   Name: markdown-previewer
   Region: Singapore (或任何近的區域)
   Branch: main
   Runtime: Docker
   Instance Type: Free
   ```

4. **部署**: 點選 **Create Web Service**

5. **訪問**: Render 會提供一個 `.onrender.com` 網址

**預估成本**: **完全免費**

**限制**: 
- 免費方案在無活動 15 分鐘後會休眠,下次訪問需要 30-60 秒啟動
- 如需避免休眠,可升級到 $7/月方案

---

### 🥈 選項 2: Railway

**優點**:
- ✅ 極簡單的部署流程
- ✅ 自動 HTTPS
- ✅ GitHub 整合
- ✅ 每月 $5 免費額度(約 500 小時運行時間)

**部署步驟**:

1. **註冊**: [https://railway.app](https://railway.app)

2. **New Project** → **Deploy from GitHub repo**

3. **選擇倉庫並部署** - Railway 會自動偵測 Dockerfile

4. **設定 Port**: 
   - 在 Settings → Networking 中確認 Port 為 80
   - Railway 會自動分配公開網址

**預估成本**: 
- 免費額度用完前: **$0**
- 超過後: 約 **$5-10/月**(取決於流量)

---

### 🥉 選項 3: Fly.io

**優點**:
- ✅ 高性能(使用 Firecracker microVM)
- ✅ 全球 CDN
- ✅ 免費方案: 3 個共享 CPU VM + 3GB 儲存

**部署步驟**:

1. **安裝 CLI**:
   ```bash
   # Windows (PowerShell)
   iwr https://fly.io/install.ps1 -useb | iex
   ```

2. **登入**:
   ```bash
   fly auth login
   ```

3. **初始化並部署**:
   ```bash
   fly launch
   # 選擇應用名稱、區域
   # Fly.io 會自動偵測 Dockerfile
   
   fly deploy
   ```

4. **開啟應用**:
   ```bash
   fly open
   ```

**預估成本**: **免費**(在免費額度內)

---

### 🏅 選項 4: Google Cloud Run

**優點**:
- ✅ 真正的 Serverless(只在有請求時計費)
- ✅ 自動擴展
- ✅ 每月 200 萬次請求免費

**部署步驟**:

1. **安裝 gcloud CLI**: [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)

2. **啟用 Cloud Run API** 並登入:
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

3. **部署**:
   ```bash
   # 標記 image 並推送到 GCR
   docker tag markdown-previewer:latest gcr.io/YOUR_PROJECT_ID/markdown-previewer
   docker push gcr.io/YOUR_PROJECT_ID/markdown-previewer
   
   # 部署到 Cloud Run
   gcloud run deploy markdown-previewer \
     --image gcr.io/YOUR_PROJECT_ID/markdown-previewer \
     --platform managed \
     --region asia-east1 \
     --allow-unauthenticated
   ```

**預估成本**: **免費**(低流量情況)

---

## 📊 平台比較表

| 平台 | 免費方案 | 部署難度 | 冷啟動時間 | 自訂網域 | 推薦指數 |
|------|---------|---------|-----------|---------|---------|
| **Render** | ✅ 750 小時/月 | ⭐ 超簡單 | ~30-60秒 | ✅ | ⭐⭐⭐⭐⭐ |
| **Railway** | ✅ $5 額度 | ⭐ 超簡單 | 幾乎即時 | ✅ | ⭐⭐⭐⭐ |
| **Fly.io** | ✅ 3 VM | ⭐⭐ 需要 CLI | 幾乎即時 | ✅ | ⭐⭐⭐⭐ |
| **Cloud Run** | ✅ 200萬請求 | ⭐⭐⭐ 需要 GCP | 幾秒 | ✅ | ⭐⭐⭐ |

---

## 🚀 最快速方案: Render 完整教學

### 步驟 1: 準備 GitHub 倉庫

確保你的專案已推送到 GitHub,包含:
- ✅ `Dockerfile`
- ✅ `.dockerignore`
- ✅ `nginx.conf`

### 步驟 2: 在 Render 創建服務

1. 前往 [https://dashboard.render.com](https://dashboard.render.com)
2. 點選 **New +** → **Web Service**
3. 連接你的 GitHub 倉庫
4. 填寫配置:

   ```
   Name: markdown-previewer
   Region: Singapore (或選擇最近的)
   Branch: main
   Runtime: Docker
   Docker Command: (留空,使用 Dockerfile 預設)
   Instance Type: Free
   ```

5. 點選 **Create Web Service**

### 步驟 3: 等待部署

Render 會自動:
1. 拉取你的 GitHub 倉庫
2. 構建 Docker image
3. 部署容器
4. 分配 HTTPS 網址

**預計時間**: 3-5 分鐘

### 步驟 4: 訪問你的應用

部署完成後,Render 會提供類似這樣的網址:
```
https://markdown-previewer-xxxx.onrender.com
```

**完全免費,永久可用!**

---

## 🔄 自動部署(推薦設定)

所有平台都支援 **Git Push 自動部署**:

1. 本地修改代碼
2. `git push origin main`
3. 雲端平台自動檢測並重新部署

無需手動操作!

---

## 🌐 自訂網域(可選)

所有平台都支援自訂網域,例如:
- `markdown.yourname.com`

**步驟**:
1. 在平台設定中添加自訂網域
2. 在你的 DNS 提供商(如 Cloudflare、GoDaddy)添加 CNAME 記錄
3. 等待 DNS 生效(通常幾分鐘)

---

## ❓ GitHub Pages 替代方案

如果你仍想使用 GitHub Pages,可以嘗試:

### 方案 A: 部署到根路徑

使用 GitHub Pages 的**自訂網域**功能:
1. 購買網域(如 Namecheap $2/年)
2. 設定自訂網域指向 GitHub Pages
3. 這樣就可以使用根路徑 `/`

### 方案 B: 修復子路徑配置

確保構建時使用正確的 base path:

```bash
# 本地構建時設定環境變數
VITE_BASE_PATH=/Markdown-live-previewer/ npm run build
```

然後部署 `dist/` 資料夾到 `gh-pages` 分支。

**但我們更推薦使用 Docker + 雲端平台,因為:**
- ✅ 環境一致性保證
- ✅ 更好的控制和彈性
- ✅ 避免 GitHub Pages 的限制

---

## 🎯 我的建議

**針對你的需求(存取性 + 畫面一致性)**:

1. **最佳方案**: 使用 **Render 免費方案**
   - 完全免費
   - 零配置
   - 與本地環境 100% 一致

2. **備選方案**: **Railway**
   - 如果需要避免冷啟動
   - 願意每月支付少量費用($5-10)

3. **長期方案**: 考慮購買便宜的 VPS(如 DigitalOcean $6/月)
   - 完全控制
   - 可運行多個應用

---

## 📝 相關檔案

- [`Dockerfile`](file:///C:/Users/User/Desktop/Markdown-live-previewer/Dockerfile) - 已優化的 Docker 配置
- [`docker-compose.yml`](file:///C:/Users/User/Desktop/Markdown-live-previewer/docker-compose.yml) - 本地測試用
- [`nginx.conf`](file:///C:/Users/User/Desktop/Markdown-live-previewer/nginx.conf) - Production 級 Nginx 配置

---

## 🆘 需要協助?

如果你在部署過程中遇到任何問題,可以:
1. 查看平台的官方文件
2. 檢查 Docker 容器日誌
3. 向我詢問具體步驟

**祝部署順利!** 🎉
