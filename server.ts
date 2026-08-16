import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// In-memory data store for persistence during session
let recipesStore: any[] = [];
let categoriesStore: any[] = [];
let cookbooksStore: any[] = [];
let downloadLogsStore: any[] = [];

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Record a download log event
app.post("/api/downloads/log", (req, res) => {
  const { itemType, itemId, itemName, device, location } = req.body;
  const newLog = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toLocaleString(),
    itemType: itemType || 'recipe_pdf',
    itemId: itemId || 'unknown',
    itemName: itemName || 'Recipe PDF',
    device: device || 'Desktop',
    location: location || 'United States'
  };
  downloadLogsStore.unshift(newLog);
  res.json({ success: true, log: newLog });
});

// Fetch download analytics
app.get("/api/downloads/analytics", (req, res) => {
  res.json({
    logs: downloadLogsStore,
    totalLogs: downloadLogsStore.length
  });
});

// Helper to extract YouTube video ID
function extractYouTubeIdFromUrl(url: string): string {
  if (!url) return "";
  if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) return url.trim();
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : "";
}

// Fetch YouTube video details (Title, Description, Views, Upload Date, Thumbnail, Channel)
async function fetchYouTubeVideoDetails(urlOrId: string) {
  const videoId = extractYouTubeIdFromUrl(urlOrId) || "3AAdKl1UYZs";
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  
  let title = "";
  let description = "";
  let viewsCount = 125000;
  let uploadDate = "";
  let channelName = "";
  let thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  try {
    // 1. Fetch YouTube oEmbed API for title and thumbnail
    const oembedRes = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`);
    if (oembedRes.ok) {
      const oembedData: any = await oembedRes.json();
      if (oembedData.title) title = oembedData.title;
      if (oembedData.author_name) channelName = oembedData.author_name;
      if (oembedData.thumbnail_url) thumbnailUrl = oembedData.thumbnail_url;
    }
  } catch (err) {
    console.error("oEmbed fetch error:", err);
  }

  try {
    // 2. Fetch YouTube watch HTML page for meta tags & initialData
    const htmlRes = await fetch(watchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9"
      }
    });
    if (htmlRes.ok) {
      const html = await htmlRes.text();

      // Extract title if missing
      if (!title) {
        const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/i) || html.match(/<meta name="title" content="([^"]+)"/i);
        if (titleMatch) title = titleMatch[1];
      }

      // Extract description
      const descMatch = html.match(/<meta property="og:description" content="([^"]+)"/i) || html.match(/<meta name="description" content="([^"]+)"/i);
      if (descMatch && descMatch[1] && !descMatch[1].includes("Enjoy the videos and music")) {
        description = descMatch[1];
      }

      // Extract views count
      const v1 = html.match(/"videoViewCountRenderer":\s*\{"viewCount":\{"simpleText":"([\d,.]+)\s+views"/i);
      const v2 = html.match(/"viewCount":\{"simpleText":"([\d,.]+)\s+views"/i);
      const v3 = html.match(/"originalViewCount":"(\d+)"/i);
      const v4 = html.match(/([\d,]+)\s+views/i);
      const v5 = html.match(/"viewCount":"(\d+)"/i);

      if (v1 && v1[1]) {
        viewsCount = parseInt(v1[1].replace(/,/g, ""), 10);
      } else if (v2 && v2[1]) {
        viewsCount = parseInt(v2[1].replace(/,/g, ""), 10);
      } else if (v3 && v3[1] && parseInt(v3[1], 10) > 0) {
        viewsCount = parseInt(v3[1], 10);
      } else if (v5 && v5[1] && parseInt(v5[1], 10) > 0) {
        viewsCount = parseInt(v5[1], 10);
      } else if (v4 && v4[1]) {
        viewsCount = parseInt(v4[1].replace(/,/g, ""), 10);
      }

      // Extract upload / published date
      const d1 = html.match(/"dateText":\s*\{"simpleText":"([^"]+)"\}/i);
      const d2 = html.match(/"publishDate":"([^"]+)"/i);
      const d3 = html.match(/"uploadDate":"([^"]+)"/i);
      const d4 = html.match(/<meta itemprop="datePublished" content="([^"]+)"/i);

      if (d1 && d1[1]) {
        uploadDate = d1[1];
      } else if (d2 && d2[1]) {
        uploadDate = d2[1];
      } else if (d3 && d3[1]) {
        uploadDate = d3[1];
      } else if (d4 && d4[1]) {
        uploadDate = d4[1];
      }

      // Extract Channel Name if missing
      if (!channelName) {
        const c1 = html.match(/"videoOwnerRenderer":\{"thumbnail":.*?"text":"([^"]+)"/i);
        const c2 = html.match(/"author":"([^"]+)"/i);
        if (c1) channelName = c1[1];
        else if (c2) channelName = c2[1];
      }
    }
  } catch (err) {
    console.error("YouTube HTML fetch error:", err);
  }

  if (!uploadDate) {
    uploadDate = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  return {
    videoId,
    youtubeUrl: watchUrl,
    title: title || "YouTube Cooking Tutorial",
    description: description || "Delicious step-by-step cooking tutorial video.",
    viewsCount,
    uploadDate,
    channelName: channelName || "Chef Studio",
    thumbnailUrl
  };
}

// Endpoint to fetch YouTube details directly
app.post("/api/youtube/details", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "YouTube URL is required" });
    }
    const details = await fetchYouTubeVideoDetails(url);
    return res.json(details);
  } catch (error: any) {
    console.error("Fetch YouTube details error:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch YouTube details" });
  }
});

// Helper for calling Gemini with retry logic
async function callGeminiWithRetry(ai: GoogleGenAI, params: any, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await ai.models.generateContent(params);
      return response;
    } catch (err: any) {
      if (attempt === retries) throw err;
      console.warn(`Gemini API call attempt ${attempt + 1} failed, retrying in 1s...`, err?.message || err);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  throw new Error("Failed after retries");
}

// Gemini AI endpoint to auto-generate recipe details from video title/URL
app.post("/api/gemini/extract-recipe", async (req, res) => {
  try {
    const { promptText, youtubeUrl, language } = req.body;
    if (!promptText && !youtubeUrl) {
      return res.status(400).json({ error: "promptText or youtubeUrl is required" });
    }

    // Attempt YouTube details fetch first
    let ytDetails: any = null;
    if (youtubeUrl || (promptText && (promptText.includes("youtube.com") || promptText.includes("youtu.be")))) {
      const urlToFetch = youtubeUrl || promptText;
      ytDetails = await fetchYouTubeVideoDetails(urlToFetch);
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY environment variable is missing" });
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });

    const isHindi = language === 'hindi' || (promptText && (promptText.toLowerCase().includes('hindi') || promptText.includes('हिंदी')));

    const contextInput = ytDetails 
      ? `YouTube Title: "${ytDetails.title}", Description: "${ytDetails.description}", Upload Date: "${ytDetails.uploadDate}", Views: ${ytDetails.viewsCount}, User Prompt: "${promptText || ''}"`
      : `User Prompt/Title: "${promptText}"`;

    const langInstruction = isHindi
      ? `CRITICAL MANDATE: You MUST generate ALL recipe details completely in rich, authentic Hindi language using Devanagari script (हिंदी भाषा).
- Title: Clear, attractive Hindi dish title (e.g. "वेज चीज़ बॉल्स रेसिपी | Vegetable Cheese Balls")
- Description: 2-3 engaging sentences describing the taste, texture, and serving suggestions in Hindi.
- CategoryName: e.g. "स्नैक्स एवं स्टार्टर्स" or "स्ट्रीट फूड"
- ChefNote: Secret pro-chef tip for perfect crispy results in Hindi.
- Ingredients: Provide 6-10 realistic ingredients extracted/inferred from the video dish with exact measurements in Hindi (e.g. "200 ग्राम प्रोसेस्ड या मोज़ेरेला चीज़", "2 उबले और मैश किए आलू", "1/2 कप उबले मकई के दाने", "2 बड़े चम्मच कॉर्नफ्लोर", "1 कप ब्रेड क्रम्ब्स (पावर कोटिंग)", "1 छोटा चम्मच कुटी लाल मिर्च (चिली फ्लेक्स)", "स्वादानुसार नमक और काली मिर्च", "तलने के लिए तेल").
- Steps: Provide 5-7 clear, sequential step-by-step cooking instructions in Hindi (e.g., Step 1: आलू और सब्जियों का मिश्रण तैयार करना, Step 2: चीज़ स्टफिंग और बॉल्स का आकार देना, Step 3: कॉर्नफ्लोर घोल और ब्रेडक्रम्ब्स की कोटिंग, Step 4: मध्यम आंच पर सुनहरा होने तक तलना, Step 5: गरमा-गरम परोसना). Do NOT return generic placeholders.`
      : `CRITICAL MANDATE: Generate rich, detailed culinary instructions in clear English.
- Provide 6-10 realistic ingredients with exact quantities.
- Provide 5-7 sequential, easy-to-follow cooking steps with clear instructions and chef tips. Do NOT return generic placeholders.`;

    const response = await callGeminiWithRetry(ai, {
      model: "gemini-3.7-flash",
      contents: `You are an expert master chef for YouTube cooking channels. Analyze this cooking video title and details: ${contextInput}.
${langInstruction}
Return ONLY valid JSON matching this exact structure:
{
  "title": "string",
  "description": "string",
  "categoryName": "string",
  "difficulty": "Easy" | "Medium" | "Advanced",
  "prepTime": "string",
  "cookTime": "string",
  "servings": number,
  "calories": number,
  "viewsCount": number,
  "uploadDate": "string",
  "tags": ["string"],
  "chefNote": "string",
  "ingredients": [
    { "id": "i1", "name": "string", "amount": "string", "category": "Produce" | "Dairy & Eggs" | "Pantry & Spices" | "Meat & Seafood" | "Other" }
  ],
  "steps": [
    { "stepNumber": 1, "timestampSeconds": number, "title": "string", "instruction": "string", "tip": "string" }
  ]
}`,
      config: {
        responseMimeType: "application/json"
      }
    });

    const resultText = response.text;
    const parsedData = JSON.parse(resultText || "{}");

    // Merge exact YouTube details if available
    if (ytDetails) {
      if (!isHindi && ytDetails.title && (!parsedData.title || parsedData.title === 'YouTube Cooking Tutorial')) {
        parsedData.title = ytDetails.title;
      }
      if (!isHindi && ytDetails.description && (!parsedData.description || parsedData.description.length < 10)) {
        parsedData.description = ytDetails.description;
      }
      if (ytDetails.viewsCount) {
        parsedData.viewsCount = ytDetails.viewsCount;
      }
      if (ytDetails.uploadDate) {
        parsedData.uploadDate = ytDetails.uploadDate;
      }
      parsedData.youtubeUrl = ytDetails.youtubeUrl;
      parsedData.youtubeVideoId = ytDetails.videoId;
      parsedData.thumbnailUrl = ytDetails.thumbnailUrl;
    }

    return res.json(parsedData);
  } catch (error: any) {
    console.error("Gemini recipe extraction error:", error);
    return res.status(500).json({ error: error.message || "Failed to process recipe with Gemini AI" });
  }
});

// Gemini AI endpoint to translate any recipe into Hindi
app.post("/api/gemini/translate-recipe", async (req, res) => {
  try {
    const { recipe, targetLanguage } = req.body;
    if (!recipe) {
      return res.status(400).json({ error: "recipe is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY environment variable is missing" });
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });

    const lang = targetLanguage || 'hindi';

    const response = await callGeminiWithRetry(ai, {
      model: "gemini-3.7-flash",
      contents: `You are an expert culinary translator. Translate this entire recipe object into ${lang === 'hindi' ? 'Hindi Devanagari script (हिंदी)' : 'English'}.
Translate the title, description, categoryName, chefNote, ingredients (names, amounts), and steps (titles, instructions, tips) into natural, authentic food terminology.
Original Recipe JSON: ${JSON.stringify(recipe)}.

Return ONLY valid JSON with the translated fields:
{
  "title": "string",
  "description": "string",
  "categoryName": "string",
  "prepTime": "string",
  "cookTime": "string",
  "chefNote": "string",
  "ingredients": [
    { "id": "string", "name": "string", "amount": "string", "category": "string" }
  ],
  "steps": [
    { "stepNumber": number, "timestampSeconds": number, "title": "string", "instruction": "string", "tip": "string" }
  ]
}`,
      config: {
        responseMimeType: "application/json"
      }
    });

    const translatedFields = JSON.parse(response.text || "{}");
    const updatedRecipe = {
      ...recipe,
      ...translatedFields,
      ingredients: translatedFields.ingredients || recipe.ingredients,
      steps: translatedFields.steps || recipe.steps
    };

    return res.json(updatedRecipe);
  } catch (error: any) {
    console.error("Gemini translation error:", error);
    return res.status(500).json({ error: error.message || "Failed to translate recipe" });
  }
});

async function startServer() {
  // Vite middleware for development
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
    console.log(`Chef Studio app running on http://localhost:${PORT}`);
  });
}

startServer();
