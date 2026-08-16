import { GoogleGenAI } from "@google/genai";

function extractYouTubeId(url: string): string {
  if (!url) return "";
  if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) return url.trim();
  const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
  return match && match[2].length === 11 ? match[2] : "";
}

async function fetchYouTubeVideoDetails(urlOrId: string) {
  const videoId = extractYouTubeId(urlOrId) || "3AAdKl1UYZs";
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  
  let title = "";
  let description = "";
  let viewsCount = 125000;
  let uploadDate = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  let channelName = "Brasoi";
  let thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  try {
    const oembedRes = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(watchUrl)}`);
    if (oembedRes.ok) {
      const oembedData: any = await oembedRes.json();
      if (oembedData.title) title = oembedData.title;
      if (oembedData.author_name) channelName = oembedData.author_name;
    }
  } catch (e) {
    // Ignore error
  }

  return {
    videoId,
    youtubeUrl: watchUrl,
    title: title || "Cooking Video Recipe",
    description: description || "Authentic cooking tutorial.",
    viewsCount,
    uploadDate,
    channelName,
    thumbnailUrl
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
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
    }

    const ai = new GoogleGenAI({ apiKey });
    const isHindi = language === 'hindi' || (promptText && (promptText.toLowerCase().includes('hindi') || promptText.includes('हिंदी')));

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
