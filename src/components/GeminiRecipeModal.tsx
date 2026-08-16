import React, { useState } from 'react';
import { RecipeVideo } from '../types';
import { extractYouTubeId, getYouTubeThumbnail } from '../utils/youtube';
import {
  Sparkles,
  X,
  Check,
  Bot,
  Play,
  Loader2,
  Clock,
  Utensils,
  ChefHat
} from 'lucide-react';

interface GeminiRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecipeGenerated: (recipe: RecipeVideo) => void;
}

export const GeminiRecipeModal: React.FC<GeminiRecipeModalProps> = ({
  isOpen,
  onClose,
  onRecipeGenerated
}) => {
  if (!isOpen) return null;

  const [promptText, setPromptText] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [selectedLang, setSelectedLang] = useState<'english' | 'hindi'>('hindi');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText && !youtubeUrl) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/gemini/extract-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptText, youtubeUrl, language: selectedLang })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to extract recipe details.');
      }

      const data = await response.json();

      const videoId = data.youtubeVideoId || extractYouTubeId(youtubeUrl || promptText || '3AAdKl1UYZs');
      const finalYoutubeUrl = data.youtubeUrl || (youtubeUrl ? (youtubeUrl.startsWith('http') ? youtubeUrl : `https://www.youtube.com/watch?v=${videoId}`) : `https://www.youtube.com/watch?v=${videoId}`);

      const fullRecipe: RecipeVideo = {
        id: `rec-ai-${Date.now()}`,
        title: data.title || promptText,
        description: data.description || (selectedLang === 'hindi' ? 'एआई द्वारा निर्मित स्टेप-बाय-स्टेप रेसिपी गाइड' : 'Auto-generated recipe structured by Gemini AI.'),
        youtubeUrl: finalYoutubeUrl,
        youtubeVideoId: videoId,
        categoryId: 'cat-quick',
        categoryName: data.categoryName || (selectedLang === 'hindi' ? 'स्पेशल कुकिंग रेसिपी' : 'Quick 15-Min Meals'),
        thumbnailUrl: data.thumbnailUrl || getYouTubeThumbnail(videoId),
        duration: '10:00',
        difficulty: data.difficulty || 'Medium',
        prepTime: data.prepTime || '15 mins',
        cookTime: data.cookTime || '20 mins',
        servings: data.servings || 4,
        calories: data.calories || 520,
        tags: data.tags || (selectedLang === 'hindi' ? ['हिंदी रेसिपी', 'शेफ स्टूडियो'] : ['AI Generated', 'Chef Studio']),
        rating: 4.9,
        viewsCount: typeof data.viewsCount === 'number' ? data.viewsCount : 125000,
        uploadDate: data.uploadDate || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        downloadsCount: 12,
        chefNote: data.chefNote || (selectedLang === 'hindi' ? 'वीडियो वॉइस ट्यूटोरियल से निकाली गई खास टिप' : 'Chef tip auto-extracted from tutorial.'),
        createdAt: new Date().toISOString().split('T')[0],
        ingredients: data.ingredients || [
          { id: 'i-ai-1', name: selectedLang === 'hindi' ? 'मुख्य सामग्री' : 'Main ingredient', amount: '250g', category: 'Produce' }
        ],
        steps: data.steps || [
          { stepNumber: 1, timestampSeconds: 0, title: selectedLang === 'hindi' ? 'कदम 1' : 'Step 1', instruction: selectedLang === 'hindi' ? 'वीडियो के निर्देशों का पालन करें।' : 'Follow video directions.' }
        ]
      };

      onRecipeGenerated(fullRecipe);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Something went wrong while generating the recipe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      
      <div className="relative w-full max-w-lg bg-zinc-900 border border-amber-500/30 rounded-3xl p-6 space-y-6 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                Gemini AI Voice & Recipe Extractor
              </h2>
              <p className="text-xs text-zinc-400">Extract steps, voice notes & ingredients in Hindi or English</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleGenerate} className="space-y-4 text-xs">
          
          {/* Language Selector */}
          <div>
            <label className="block text-zinc-300 font-semibold mb-1.5">
              Select Recipe Output Language (भाषा चुनें)
            </label>
            <div className="grid grid-cols-2 gap-2 bg-zinc-800 p-1 rounded-2xl border border-zinc-700">
              <button
                type="button"
                onClick={() => setSelectedLang('hindi')}
                className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  selectedLang === 'hindi'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>🇮🇳 Hindi (हिंदी वॉइस/टेक्स्ट)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedLang('english')}
                className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  selectedLang === 'english'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>🇬🇧 English</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-zinc-300 font-semibold mb-1">
              YouTube Video Title / Voice Note Concept
            </label>
            <input
              type="text"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder={selectedLang === 'hindi' ? "उदा: लच्छा समोसा स्पेशल रेसिपी #bharatzkitchen" : "e.g. Gordon Ramsay Crispy Skin Salmon with Honey Garlic Sauce"}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-zinc-300 font-semibold mb-1">
              YouTube Video URL (Optional)
            </label>
            <input
              type="text"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (!promptText && !youtubeUrl)}
            className={`w-full py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${
              loading
                ? 'bg-zinc-800 text-zinc-500'
                : 'bg-brand-accent text-white hover:scale-[1.02]'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                {selectedLang === 'hindi' ? 'वीडियो वॉइस एनालाइज एवं हिंदी रेसिपी निष्कर्षण...' : 'Analyzing Video & Generating Recipe...'}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> {selectedLang === 'hindi' ? 'हिंदी में रेसिपी एक्सट्रैक्ट करें (Extract Hindi Recipe)' : 'Extract Recipe & Timestamp Chapters'}
              </>
            )}
          </button>
        </form>

      </div>

    </div>
  );
};
