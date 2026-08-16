import { GoogleGenAI } from "@google/genai";

function extractYouTubeId(url: string): string {
  if (!url) return "";
  if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) return url.trim();
  const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
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

async function fetchYouTubeVideoDetails(urlOrId: string) {
  const videoId = extractYouTubeId(urlOrId) || "3AAdKl1UYZs";
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  
  let title = "";
  let description = "";
  let viewsCount = 0;
  let uploadDate = "";
  let channelName = "";
  let duration = "10:00";
  let thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  try {
    // 1. Fetch YouTube oEmbed API for title and author
    const oembedRes = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`);
    if (oembedRes.ok) {
      const oembedData: any = await oembedRes.json();
      if (oembedData.title) title = oembedData.title;
      if (oembedData.author_name) channelName = oembedData.author_name;
      if (oembedData.thumbnail_url) thumbnailUrl = oembedData.thumbnail_url;
    }
  } catch (e) {
    // Ignore error
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
  } catch (e) {
    // Ignore html fetch error
  }

  if (!uploadDate) {
    uploadDate = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  return {
    videoId,
    youtubeUrl: watchUrl,
    title: title || "Cooking Video Recipe",
    description: description || "Authentic cooking tutorial.",
    viewsCount: viewsCount || 125000,
    uploadDate,
    channelName: channelName || "Chef Studio",
    thumbnailUrl,
    duration
  };
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { promptText, youtubeUrl, language } = req.body || {};
    if (!promptText && !youtubeUrl) {
      return res.status(400).json({ error: "promptText or youtubeUrl is required" });
    }

    let ytDetails: any = null;
    if (youtubeUrl || (promptText && (promptText.includes("youtube.com") || promptText.includes("youtu.be")))) {
      ytDetails = await fetchYouTubeVideoDetails(youtubeUrl || promptText);
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const isHindi = language === 'hindi' || (promptText && (promptText.toLowerCase().includes('hindi') || promptText.includes('हिंदी')));

    if (!apiKey) {
      // Fallback recipe when GEMINI_API_KEY is not configured in Vercel
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

    const ai = new GoogleGenAI({ apiKey });

    const contextInput = ytDetails 
      ? `YouTube Title: "${ytDetails.title}", Description: "${ytDetails.description}", Upload Date: "${ytDetails.uploadDate}", Views: ${ytDetails.viewsCount}, User Prompt: "${promptText || ''}"`
      : `User Prompt/Title: "${promptText}"`;

    const langInstruction = isHindi
      ? `Generate in rich Hindi Devanagari script (हिंदी):
- Title: Clear Hindi recipe title
- Description: 2-3 sentences in Hindi
- CategoryName: e.g. "स्पेशल कुकिंग रेसिपी"
- ChefNote: Secret pro tip in Hindi
- Ingredients: 6-10 authentic ingredients with measurements in Hindi
- Steps: 5-7 clear sequential steps in Hindi.`
      : `Generate in clear English:
- Provide 6-10 realistic ingredients with quantities.
- Provide 5-7 sequential cooking steps with instructions and tips.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `You are an expert master chef. Analyze this cooking video title and details: ${contextInput}.
${langInstruction}
Return ONLY valid JSON:
{
  "title": "string",
  "description": "string",
  "categoryName": "string",
  "difficulty": "Easy" | "Medium" | "Advanced",
  "prepTime": "string",
  "cookTime": "string",
  "servings": 4,
  "calories": 480,
  "viewsCount": 125000,
  "uploadDate": "string",
  "tags": ["string"],
  "chefNote": "string",
  "ingredients": [
    { "id": "i1", "name": "string", "amount": "string", "category": "Produce" }
  ],
  "steps": [
    { "stepNumber": 1, "timestampSeconds": 0, "title": "string", "instruction": "string", "tip": "string" }
  ]
}`,
      config: { responseMimeType: "application/json" }
    });

    const parsed = JSON.parse(response.text || "{}");
    if (ytDetails) {
      parsed.youtubeUrl = ytDetails.youtubeUrl;
      parsed.youtubeVideoId = ytDetails.videoId;
      parsed.thumbnailUrl = ytDetails.thumbnailUrl;
    }

    return res.status(200).json(parsed);
  } catch (error: any) {
    console.error("Vercel Gemini recipe extraction error:", error);
    return res.status(500).json({ error: error.message || "Failed to process recipe with Gemini AI" });
  }
}
