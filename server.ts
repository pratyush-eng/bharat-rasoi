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

function cleanYouTubeDateString(raw: string): string {
  if (!raw) return "";
  let clean = raw
    .replace(/^Streamed live on /i, "")
    .replace(/^Premiered /i, "")
    .replace(/^Published on /i, "")
    .replace(/^Released on /i, "")
    .trim();

  if (clean.includes("-") && /\d{4}-\d{2}-\d{2}/.test(clean)) {
    try {
      const d = new Date(clean);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      }
    } catch (e) {}
  }
  return clean;
}

function formatYouTubeDurationSeconds(sec: number): string {
  if (!sec || isNaN(sec) || sec <= 0) return "10:00";
  const mins = Math.floor(sec / 60);
  const rem = sec % 60;
  return `${mins}:${rem.toString().padStart(2, "0")}`;
}

// Fetch YouTube video details (Title, Description, Views, Upload Date, Thumbnail, Channel, Duration)
async function fetchYouTubeVideoDetails(urlOrId: string) {
  const videoId = extractYouTubeIdFromUrl(urlOrId) || "3AAdKl1UYZs";
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  
  let title = "";
  let description = "";
  let viewsCount = 0;
  let uploadDate = "";
  let channelName = "";
  let duration = "10:00";
  let thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  try {
    // 1. Fetch YouTube oEmbed API for title and channel name
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
    // 2. Fetch YouTube watch HTML page with consent cookies & modern desktop user agent
    const htmlRes = await fetch(watchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        "Cookie": "SOCS=CAESEwgDEgk2MzE5NzE1NzQaAmVuIAEaBgiA_LyaBg; CONSENT=PENDING+999; PREF=tz=UTC&hl=en"
      }
    });

    if (htmlRes.ok) {
      const html = await htmlRes.text();

      // Check ytInitialPlayerResponse
      const playerMatch = html.match(/ytInitialPlayerResponse\s*=\s*(\{.+?\});\s*(?:var|<\/script>)/s);
      if (playerMatch) {
        try {
          const p = JSON.parse(playerMatch[1]);
          if (p.videoDetails) {
            if (!title && p.videoDetails.title) title = p.videoDetails.title;
            if (!channelName && p.videoDetails.author) channelName = p.videoDetails.author;
            if (p.videoDetails.shortDescription) description = p.videoDetails.shortDescription;
            if (p.videoDetails.viewCount) viewsCount = parseInt(p.videoDetails.viewCount, 10);
            if (p.videoDetails.lengthSeconds) duration = formatYouTubeDurationSeconds(parseInt(p.videoDetails.lengthSeconds, 10));
          }
          if (p.microformat?.playerMicroformatRenderer) {
            const micro = p.microformat.playerMicroformatRenderer;
            if (micro.publishDate || micro.uploadDate) uploadDate = cleanYouTubeDateString(micro.publishDate || micro.uploadDate);
            if (!viewsCount && micro.viewCount) viewsCount = parseInt(micro.viewCount, 10);
            if (!channelName && micro.ownerChannelName) channelName = micro.ownerChannelName;
          }
        } catch (e) {}
      }

      // Check ytInitialData
      const initialDataMatch = html.match(/ytInitialData\s*=\s*(\{.+?\});\s*(?:var|<\/script>)/s);
      if (initialDataMatch) {
        try {
          const d = JSON.parse(initialDataMatch[1]);
          const jsonStr = JSON.stringify(d);
          if (!viewsCount) {
            const vM = jsonStr.match(/"viewCount":\{"simpleText":"([\d,.]+)\s+views"/i) ||
                       jsonStr.match(/"originalViewCount":"(\d+)"/i) ||
                       jsonStr.match(/"viewCount":"(\d+)"/i);
            if (vM && vM[1]) viewsCount = parseInt(vM[1].replace(/,/g, ""), 10);
          }
          if (!uploadDate) {
            const dM = jsonStr.match(/"dateText":\s*\{"simpleText":"([^"]+)"\}/i) ||
                       jsonStr.match(/"publishDate":\s*\{"simpleText":"([^"]+)"\}/i);
            if (dM && dM[1]) uploadDate = cleanYouTubeDateString(dM[1]);
          }
        } catch (e) {}
      }

      // Regex fallback directly on HTML
      if (!viewsCount) {
        const vM = html.match(/"viewCount":"(\d+)"/i) ||
                   html.match(/"originalViewCount":"(\d+)"/i) ||
                   html.match(/"videoViewCountRenderer":\s*\{"viewCount":\{"simpleText":"([\d,.]+)\s+views"/i) ||
                   html.match(/"viewCount":\{"simpleText":"([\d,.]+)\s+views"/i) ||
                   html.match(/([\d,]+)\s+views/i);
        if (vM && vM[1]) viewsCount = parseInt(vM[1].replace(/,/g, ""), 10);
      }

      if (!uploadDate) {
        const dM = html.match(/<meta itemprop="datePublished" content="([^"]+)"/i) ||
                   html.match(/<meta itemprop="uploadDate" content="([^"]+)"/i) ||
                   html.match(/"publishDate":"([^"]+)"/i) ||
                   html.match(/"uploadDate":"([^"]+)"/i) ||
                   html.match(/"dateText":\s*\{"simpleText":"([^"]+)"\}/i);
        if (dM && dM[1]) uploadDate = cleanYouTubeDateString(dM[1]);
      }

      if (!title) {
        const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/i) || html.match(/<meta name="title" content="([^"]+)"/i);
        if (titleMatch) title = titleMatch[1];
      }

      if (!description) {
        const descMatch = html.match(/<meta property="og:description" content="([^"]+)"/i) || html.match(/<meta name="description" content="([^"]+)"/i);
        if (descMatch && descMatch[1] && !descMatch[1].includes("Enjoy the videos and music")) {
          description = descMatch[1];
        }
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
    viewsCount: viewsCount || 125000,
    uploadDate,
    channelName: channelName || "Chef Studio",
    thumbnailUrl,
    duration
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
    const isHindi = language === 'hindi' || (promptText && (promptText.toLowerCase().includes('hindi') || promptText.includes('हिंदी')));

    if (!apiKey) {
      const fallbackTitle = ytDetails?.title || promptText || (isHindi ? 'स्वादिष्ट स्पेशल रेसिपी' : 'Chef Special Recipe');
      const fallbackId = ytDetails?.videoId || '3AAdKl1UYZs';
      return res.status(200).json({
        title: fallbackTitle,
        description: isHindi ? 'स्टेप-बाय-स्टेप रेसिपी गाइड और कुकिंग ट्यूटोरियल।' : 'Step-by-step cooking tutorial and recipe guide.',
        categoryName: isHindi ? 'स्पेशल कुकिंग रेसिपी' : 'Chef Special',
        difficulty: 'Medium',
        prepTime: isHindi ? '15 मिनट' : '15 mins',
        cookTime: isHindi ? '20 मिनट' : '20 mins',
        servings: 4,
        calories: 480,
        viewsCount: ytDetails?.viewsCount || 125000,
        uploadDate: ytDetails?.uploadDate || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        tags: isHindi ? ['हिंदी रेसिपी', 'शेफ स्पेशल'] : ['Chef Special', 'Video Recipe'],
        chefNote: isHindi ? 'स्वादिष्ट स्वाद के लिए धीमी आंच पर भूनें।' : 'Cook over medium-low heat for rich caramelized flavors.',
        youtubeUrl: ytDetails?.youtubeUrl || `https://www.youtube.com/watch?v=${fallbackId}`,
        youtubeVideoId: fallbackId,
        thumbnailUrl: ytDetails?.thumbnailUrl || `https://img.youtube.com/vi/${fallbackId}/maxresdefault.jpg`,
        ingredients: isHindi ? [
          { id: 'i1', name: 'मुख्य सब्जी / पनीर / दाल', amount: '250 ग्राम', category: 'Produce' },
          { id: 'i2', name: 'कुकिंग ऑयल / घी', amount: '2 बड़े चम्मच', category: 'Pantry & Spices' },
          { id: 'i3', name: 'अदरक-लहसुन पेस्ट', amount: '1 बड़ा चम्मच', category: 'Produce' },
          { id: 'i4', name: 'हल्दी, धनिया, मिर्च पाउडर', amount: '1 छोटा चम्मच प्रत्येक', category: 'Pantry & Spices' },
          { id: 'i5', name: 'सेंधा नमक व गरम मसाला', amount: 'स्वादानुसार', category: 'Pantry & Spices' }
        ] : [
          { id: 'i1', name: 'Fresh Protein / Produce', amount: '350g', category: 'Produce' },
          { id: 'i2', name: 'Extra Virgin Olive Oil / Butter', amount: '2 tbsp', category: 'Dairy & Eggs' },
          { id: 'i3', name: 'Minced Garlic & Herbs', amount: '1 tbsp', category: 'Produce' },
          { id: 'i4', name: 'Ground Spices & Seasoning', amount: '1 tsp', category: 'Pantry & Spices' },
          { id: 'i5', name: 'Sea Salt & Pepper', amount: 'To taste', category: 'Pantry & Spices' }
        ],
        steps: isHindi ? [
          { stepNumber: 1, timestampSeconds: 0, title: 'सामग्री की तैयारी', instruction: 'सभी सब्जियों और मसालों को धोकर काटें और मापकर रख लें।', tip: 'ताजी सामग्री का उपयोग करें।' },
          { stepNumber: 2, timestampSeconds: 65, title: 'तड़का व भूनना', instruction: 'तेल गर्म करके जीरा और अदरक-लहसुन पेस्ट को खुशबू आने तक भूनें।', tip: 'आंच धीमी रखें।' },
          { stepNumber: 3, timestampSeconds: 180, title: 'मसाले व मुख्य पकाना', instruction: 'मसाले और मुख्य सामग्री डालकर 10 मिनट तक ढककर पकाएं।', tip: 'बीच-बीच में चलाते रहें।' },
          { stepNumber: 4, timestampSeconds: 320, title: 'गार्निश और परोसना', instruction: 'हरा धनिया और गरम मसाला छिड़ककर गरमा-गरम परोसें।', tip: 'रोटी या चावल के साथ सर्व करें।' }
        ] : [
          { stepNumber: 1, timestampSeconds: 0, title: 'Prep & Mise en Place', instruction: 'Wash, prep, and measure all ingredients before starting.', tip: 'Organize for smooth cooking.' },
          { stepNumber: 2, timestampSeconds: 65, title: 'Aromatics & Sauté', instruction: 'Heat oil/butter in pan, sauté garlic and aromatics until golden.', tip: 'Do not burn garlic.' },
          { stepNumber: 3, timestampSeconds: 180, title: 'Main Cooking & Simmer', instruction: 'Add main ingredients, seasonings and simmer until tender.', tip: 'Baste occasionally.' },
          { stepNumber: 4, timestampSeconds: 320, title: 'Garnish & Plate', instruction: 'Transfer to warm serving platter and garnish with fresh herbs.', tip: 'Serve immediately.' }
        ]
      });
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });

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
      return res.status(200).json(recipe);
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
