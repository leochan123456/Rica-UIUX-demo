# R-plus-Share-to-Facebook
> 利嘉閣 Rica+ 智能社交電商分享引擎：動態網關生成與合規發布系統
### 📦 本地環境快速啟動 (Local Execution) Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
---

## 🇭🇰 【上半部：繁體中文】商業背景、核心痛點與設計哲學

### 🎯 專案使命與核心價值
在香港高密度的住宅物業市場中，前線地產經紀的推銷陣地已全面向社交電商（Social Commerce）轉移。本專案作為利嘉閣 Rica+ 生體系統的「幕後副駕駛」與「無形盾牌」，旨在幫助前線同事在零法律風險、零低級筆誤的前提下，一鍵將真盤源素材與專家級文案投射至 Facebook 鄰里社群中，實現流量爆數。

### 🛑 為什麼我們「退而求其次」選擇 Share 轉向，而非 API 後台自動發布？
在系統分析與解決方案設計（Systems Analysis & Design）的初期，團隊曾考慮過直接在後台調用 Facebook Graph API 的 `/feed` 端點進行全自動化靜默發布。但在香港地產的實務合規與 Meta 平台的強監管生態下，這會帶來毀滅性的連帶災難：

1. **Meta 商業登記與住房廣告特類（Housing Category）的高牆**：
   Facebook 目前實施極為嚴苛的帳號信用評級與機器學習去偏差系統。**API 僅允許已經通過官方「企業主體驗證（Business Verification）」、提交實體商業登記（BR）並綁定公司專頁的企業，才能調用 Page 自動發布貼文的權限**。
2. **防範設備指紋關聯封殺（Association Ban）**：
   如果讓全港數千名經紀直接共享同一個後台 Page Token 或在單一伺服器上高頻發布，會瞬間被 Meta AI 的垃圾偵測模型判定為 Spam 或惡意 Spreading，導致公司官方主頁遭遇「影子禁言（Shadowban）」甚至永久封號。
3. **地監局（EAA）網規框架的最終把關權**：
   根據地產代理監管局執業通告（18-02(CR)），物業廣告的真實售價與條款必須與業主最新指示完全一致，且必須有經紀個人牌照資訊。自動化後台發布會剝奪經紀作為「總編輯」的最後核實機會，一旦 AI 出現幻覺給錯數據，公司將面臨高達 30 萬港元的罰款甚至停牌刑事責任。

**【架構妥協與優化解法】**：
因此，本系統**退而求其次**，採用了最安全且用戶體驗最流暢的 **「動態網頁容器（Open Graph） + 用戶端 Share Dialog 彈窗」** 閉環架構。系統在後台將經紀上傳的圖片/影片進行雲端快取，自動為其複製合規文案至剪貼簿，然後拉起 Facebook 官方認證的分享彈窗。如此一來，既繞過了 Meta 企業認證的 API 限制，又把最終核實權安全地交還給經紀，達成「隨身掩護、隱形盾牌」的架構目標。
