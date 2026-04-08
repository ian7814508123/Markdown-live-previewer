# 🌐 網域擁有權驗證與 DNS 設定指南 (DNS & Domain Verification Guide)

當您將專案部署在 Render 並希望使用自訂網域時，通常會涉及兩種驗證：
1. **Render 的網域解析驗證**：確保您的網域正確指向 Render 伺服器。
2. **外部服務驗證 (如 Google Search Console)**：證明您擁有該網域的控制權，通常使用 TXT 紀錄。

---

## 1️⃣ Render 自訂網域設定 (必要)

若要讓您的網域連到 Render，請按照以下步驟操作：

1. **在 Render Dashboard 設定**：
   - 進入您的 Web Service -> **Settings** -> **Custom Domains**。
   - 點擊 **Add Custom Domain** 並輸入您的網域 (例如 `previewer.yourdomain.com`)。

2. **在 DNS 提供商 (如 Cloudflare, GoDaddy) 設定**：
   - **子網域 (Subdomain)**: 新增一個 `CNAME` 紀錄。
     - Name: `previewer` (或您的子網域名稱)
     - Target: Render 提供的網址 (例如 `markdown-previewer.onrender.com`)
   - **根網域 (Root Domain)**: 新增一個 `A` 紀錄。
     - Name: `@`
     - Value: `216.24.57.1` (這是 Render 的標準 IP，請以 Dashboard 顯示的為準)

---

## 2️⃣ 網域擁有權驗證 (TXT 紀錄)

如果您是要進行 **Google Search Console**、**FB 網域驗證** 或 **郵件紀錄驗證**，通常需要新增 `TXT` 紀錄：

1. **獲取驗證碼**：從第三方服務獲取類似 `google-site-verification=xxxxxx` 的字串。
2. **在 DNS 提供商新增紀錄**：
   - **Type (類型)**: `TXT`
   - **Name/Host (主機)**: `@` (代表根網域) 或保留空白。
   - **Value/Content (內容)**: 貼上剛才獲取的驗證字串。
   - **TTL**: 預設 (通常為 3600 或 Auto)。

---

## 3️⃣ 驗證生效檢查

DNS 變更可能需要一段時間生效（通常 5-30 分鐘，最多 48 小時）。

*   **使用指令檢查** (Windows PowerShell):
    ```powershell
    # 檢查 CNAME
    nslookup -type=cname previewer.yourdomain.com
    
    # 檢查 TXT 紀錄
    nslookup -type=txt yourdomain.com
    ```
*   **線上工具**: 使用 [Google Admin Toolbox Dig](https://toolbox.googleapps.com/apps/dig/) 檢查紀錄。

---

## 💡 專業提示 (Senior Engineer Advice)

*   **Cloudflare 使用者**: 如果您使用 Cloudflare，請注意 **Proxy (橘色雲朵)** 模式。在進行某些所有權驗證時，若驗證一直失敗，可以暫時切換為 **DNS Only (灰色雲朵)**，驗證成功後再切換回 Proxy。
*   **HTTPS 憑證**: Render 會自動為自訂網域申請 Let's Encrypt 憑證，前提是您的 DNS 解析已正確指向 Render。
