import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini client lazily/safely
  let ai: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI {
    if (!ai) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is required");
      }
      ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return ai;
  }

  // In-memory store for shared posts
  const posts: Record<string, { id: string; theme: string; caption: string; assetUrl: string; createdAt: string }> = {};

  function createPostId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  // API endpoint to create a shareable post representing Facebook engine requirements
  app.post("/api/create-post", (req, res) => {
    try {
      const { theme, caption, assetUrl } = req.body;
      if (!caption || typeof caption !== 'string' || caption.trim().length === 0) {
        return res.status(400).json({ error: "無效的文案內容。" });
      }

      const postId = createPostId();
      posts[postId] = {
        id: postId,
        theme: theme || "利嘉閣專在精選推介",
        caption: caption.trim(),
        assetUrl: assetUrl || "/assets/ricacorp_logo.png",
        createdAt: new Date().toISOString()
      };

      res.json({ postId });
    } catch (err: any) {
      res.status(500).json({ error: "建立分享貼文時發生錯誤", details: err.message });
    }
  });

  // Share preview route delivering Facebook Crawlers high-fidelity OG metadata HTML
  app.get("/post/:id", (req, res) => {
    const { id } = req.params;
    const post = posts[id];

    if (!post) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>未找到貼文 - Rica+</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { font-family: -apple-system, system-ui; background: #F5F5F7; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; color: #1D1D1F; }
              .card { background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); text-align: center; max-width: 400px; }
              h1 { color: #FF6600; font-size: 24px; margin-bottom: 10px; }
              p { color: #86868B; font-size: 14px; line-height: 1.5; }
              a { display: inline-block; margin-top: 20px; padding: 10px 20px; background: #FF6600; color: white; text-decoration: none; border-radius: 10px; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>🔍 未能尋獲此分享盤源</h1>
              <p>該文案或貼文已被移除或連結已失效，請回到 Rica+ 智慧地產助理重新生成。</p>
              <a href="/">返回 Rica+ 首頁</a>
            </div>
          </body>
        </html>
      `);
    }

    const hostUrl = `${req.protocol}://${req.get('host')}`;
    const postUrl = `${hostUrl}/post/${id}`;
    const cleanTitle = `【真盤源推薦】${post.theme}`;
    const description = post.caption.substring(0, 160) + "...";
    
    // Aesthetic preview template delivering to browser and crawlers
    res.send(`<!DOCTYPE html>
<html lang="zh-HK">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${cleanTitle}</title>
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${cleanTitle}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${postUrl}" />
    <meta property="og:site_name" content="利嘉閣 Rica+ 智能合規分享引擎" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${cleanTitle}" />
    <meta name="twitter:description" content="${description}" />
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        margin: 0;
        background: #F5F5F7;
        color: #1D1D1F;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        padding: 20px;
      }
      .preview-card {
        max-width: 600px;
        width: 100%;
        padding: 40px;
        border-radius: 32px;
        background: #FFFFFF;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.04);
        border: 1px solid rgba(0,0,0,0.05);
      }
      .brand-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: #FF6600/10;
        color: #FF6600;
        padding: 6px 14px;
        border-radius: 99px;
        font-size: 12px;
        font-weight: 700;
        margin-bottom: 24px;
      }
      h1 {
        font-size: 24px;
        font-weight: 800;
        margin-top: 0;
        color: #1D1D1F;
        letter-spacing: -0.5px;
        line-height: 1.3;
      }
      .caption-box {
        white-space: pre-wrap;
        background: #F5F5F7;
        padding: 24px;
        border-radius: 20px;
        font-size: 14px;
        line-height: 1.6;
        color: #333336;
        margin: 24px 0;
        border: 1px solid rgba(0,0,0,0.02);
      }
      .tag-row {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 12px;
        color: #86868B;
        font-weight: 500;
      }
      .footer-btn {
        display: inline-block;
        margin-top: 24px;
        width: 100%;
        text-align: center;
        background: #FF6600;
        color: #FFFFFF;
        padding: 16px;
        border-radius: 16px;
        text-decoration: none;
        font-weight: 700;
        box-shadow: 0 4px 15px rgba(255, 102, 0, 0.2);
        transition: transform 0.2s;
      }
      .footer-btn:hover {
        transform: translateY(-2px);
      }
    </style>
  </head>
  <body>
    <div class="preview-card">
      <div class="brand-badge">🍊 Rica+ 真盤源安全網合規驗證</div>
      <h1>【利嘉閣分享星級優質盤源】</h1>
      <p style="color: #86868B; font-size: 14px; margin-top: -12px; font-weight: 500;">
        客戶分類特色房產：${post.theme}
      </p>
      
      <div class="caption-box">${post.caption}</div>
      
      <div class="tag-row">
        <span>公司牌照號碼：C-001702</span>
        <span>•</span>
        <span>同步建立於：${new Date(post.createdAt).toLocaleString("zh-HK")}</span>
      </div>
      
      <a class="footer-btn" href="/">體驗 Rica+ 智能隨身助理</a>
    </div>
  </body>
</html>`);
  });

  // API endpoint to generate high-fidelity real estate copy
  app.post("/api/generate-copy", async (req, res) => {
    try {
      const { profile, estate, budget, extraDemands, tone } = req.body;

      let client: GoogleGenAI;
      try {
        client = getGeminiClient();
      } catch (err: any) {
        return res.status(400).json({
          error: "未設定 GEMINI_API_KEY 金鑰。請到 Settings > Secrets 設定。",
          details: err.message
        });
      }

      // Construction of system and prompt context
      const systemInstruction = `You are an elite senior estate agent and content marketing master at Ricacorp Properties (利嘉閣地產) in Hong Kong.
Your task is to write a highly persuasive, realistic, and legally-informed property marketing caption in colloquial Hong Kong Cantonese (廣東話/粵語).
The tone must match the user's selected platform:
- "WhatsApp": Personal, warm, polite, with helpful bullet points, easy to read on mobile.
- "小紅書": High energy, eye-catching title matching RED style, multiple emojis, uses hashtags like #香港租房 #香港買樓, clear spatial summaries.
- "Facebook": Professional but attractive, detailed layout with estate analysis, transportation context, and contact details.

Ensure the copy:
1. Speaks pure Hong Kong Cantonese naturally (e.g., uses words like '屋苑', '間隔實用', '上車首選', '租金回報', '即約即睇', '配套成熟', '真盤源'). Never use mainland-style words like '物業小區', use '屋苑' or '物業'.
2. Ingeniously incorporates the geographical and landmark features of the selected estate (e.g., Taikoo Shing is the ultimate blue-chip estate with high efficiency and premium office neighbors; Coastal Skyline/Tung Chung has beautiful sea views, proximity to the airport, clubhouses, great for HKU expats or aviation professionals).
3. Legally-compliant note at the bottom: Must include Ricacorp's Company License (利嘉閣地產牌照號碼: C-001702) and an Agent ID/Ad reference placeholder (e.g., 廣告日期: 2026-06-23, 盤源編號: RICA-${Math.floor(100000 + Math.random() * 900000)}).
4. Do NOT output markdown code blocks wrapping your text. Just return the pure text, formatted nicely with line breaks and emojis.`;

      const prompt = `請為以下房產需求生成一篇高成效廣東話推廣文案：
- 客戶畫像種類：${profile || "🎓 港大專才租房"}
- 屋苑/地標：${estate || "太古城"}
- 預算/售價：${budget || "700萬"}
- 額外自訂加強訴求/交通：${extraDemands || "鄰近港鐵站，配套成熟，即約即睇"}
- 要求的行銷平台文案風格：${tone || "WhatsApp 貼心回覆"}

請生成一篇結構清晰、內容吸睛且非常吸引人的廣東話文案。確保包含大標題、亮點分析、詳細規格，以及尾部利嘉閣地規牌照與真盤源宣告標籤。`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.85,
        }
      });

      const generatedText = response.text || "無法生成文案，請再試一次。";
      res.json({ text: generatedText.trim() });
    } catch (error: any) {
      console.error("Gemini copy generation error:", error);
      res.status(500).json({ error: "生成過程中發生錯誤，請稍後再試。", details: error.message });
    }
  });

  // Serve static assets or use Vite in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
