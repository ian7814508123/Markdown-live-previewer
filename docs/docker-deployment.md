# Docker 部署指南

本文件說明如何使用 Docker 部署 Markdown Live Previewer。

## 📋 前置需求

- Docker (版本 20.10+)
- Docker Compose (版本 1.29+，選配)

## 🚀 快速開始

### 方法一：使用 Docker Compose（推薦）

```bash
# 構建並啟動
docker-compose up -d

# 查看日誌
docker-compose logs -f

# 停止
docker-compose down
```

訪問 **http://localhost:8080**

### 方法二：直接使用 Docker 指令

```bash
# 構建 image
docker build -t markdown-previewer:latest .

# 運行容器
docker run -d \
  --name markdown-previewer \
  -p 8080:80 \
  markdown-previewer:latest

# 查看日誌
docker logs -f markdown-previewer

# 停止並刪除容器
docker stop markdown-previewer
docker rm markdown-previewer
```

## 🔧 進階配置

### 自訂 Port

修改 `docker-compose.yml` 中的 `ports` 配置：

```yaml
ports:
  - "3000:80"  # 改為 3000 端口
```

或直接在 `docker run` 指令中：

```bash
docker run -d -p 3000:80 markdown-previewer:latest
```

### 自訂 Base Path

如果需要部署在子路徑（例如 `/app/`），可以在構建時設定環境變數：

```bash
docker build -t markdown-previewer:latest \
  --build-arg VITE_BASE_PATH=/app/ .
```

### 資源限制

在 `docker-compose.yml` 中調整 `deploy.resources` 區段以限制 CPU 和記憶體使用。

## 📊 健康檢查

容器內建健康檢查，每 30 秒自動檢測服務狀態：

```bash
# 查看健康狀態
docker inspect --format='{{.State.Health.Status}}' markdown-previewer
```

## 🔍 故障排除

### 容器無法啟動

```bash
# 查看詳細錯誤日誌
docker logs markdown-previewer

# 檢查容器狀態
docker ps -a
```

### Port 衝突

如果 8080 端口已被占用，修改為其他端口（如 3000、9090）。

### 重新構建（清除快取）

```bash
docker-compose build --no-cache
```

## 🌐 生產部署建議

1. **使用反向代理**：在生產環境建議使用 Nginx 或 Traefik 作為反向代理
2. **HTTPS 支援**：配合 Let's Encrypt 或其他 SSL 證書
3. **日誌管理**：設定日誌輪替和集中式日誌收集
4. **監控**：整合 Prometheus + Grafana 監控容器狀態

## 📁 相關檔案

- [`Dockerfile`](file:///C:/Users/User/Desktop/Markdown-live-previewer/Dockerfile) - 多階段構建配置
- [`docker-compose.yml`](file:///C:/Users/User/Desktop/Markdown-live-previewer/docker-compose.yml) - Compose 配置
- [`nginx.conf`](file:///C:/Users/User/Desktop/Markdown-live-previewer/nginx.conf) - Nginx 伺服器配置
- [`.dockerignore`](file:///C:/Users/User/Desktop/Markdown-live-previewer/.dockerignore) - 排除不需要的檔案

## 🔐 安全性注意事項

- 容器以非 root 用戶運行（nginx 預設）
- 已配置基本的安全性標頭（X-Frame-Options, X-Content-Type-Options）
- 建議定期更新 base image 以修補安全漏洞
