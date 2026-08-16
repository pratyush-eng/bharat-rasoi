import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { recipe, targetLanguage } = req.body || {};
    if (!recipe) {
      return res.status(400).json({ error: "recipe is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
    }

    const ai = new GoogleGenAI({ apiKey });
    const lang = targetLanguage || 'hindi';

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `You are an expert culinary translator. Translate this entire recipe object into ${lang === 'hindi' ? 'Hindi Devanagari script (हिंदी)' : 'English'}.
Translate title, description, categoryName, chefNote, ingredients (names, amounts), and steps (titles, instructions, tips).
Recipe: ${JSON.stringify(recipe)}.
Return ONLY valid JSON with translated fields:
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
    { "stepNumber": 1, "timestampSeconds": 0, "title": "string", "instruction": "string", "tip": "string" }
  ]
}`,
      config: { responseMimeType: "application/json" }
    });

    const translatedFields = JSON.parse(response.text || "{}");
    const updatedRecipe = {
      ...recipe,
      ...translatedFields,
      ingredients: translatedFields.ingredients || recipe.ingredients,
      steps: translatedFields.steps || recipe.steps
    };

    return res.status(200).json(updatedRecipe);
  } catch (error: any) {
    console.error("Vercel Gemini translation error:", error);
    return res.status(500).json({ error: error.message || "Failed to translate recipe" });
  }
}
