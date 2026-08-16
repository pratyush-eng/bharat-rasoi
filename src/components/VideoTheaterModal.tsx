import React, { useState, useEffect } from 'react';
import { RecipeVideo } from '../types';
import { getYouTubeEmbedUrl, formatTime } from '../utils/youtube';
import {
  X,
  Play,
  Download,
  Clock,
  CheckSquare,
  Square,
  Sparkles,
  Users,
  ChefHat,
  Share2,
  Bookmark,
  Check,
  Flame,
  MessageSquare,
  Eye,
  Calendar,
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface VideoTheaterModalProps {
  recipe: RecipeVideo | null;
  onClose: () => void;
  onDownloadPdf: (recipe: RecipeVideo) => void;
}

export const VideoTheaterModal: React.FC<VideoTheaterModalProps> = ({
  recipe: initialRecipe,
  onClose,
  onDownloadPdf
}) => {
  if (!initialRecipe) return null;

  const [recipe, setRecipe] = useState<RecipeVideo>(initialRecipe);
  const [activeTab, setActiveTab] = useState<'steps' | 'ingredients'>('steps');
  const [currentTimestamp, setCurrentTimestamp] = useState<number>(0);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  const [servingsMultiplier, setServingsMultiplier] = useState<number>(initialRecipe.servings || 2);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [liveViews, setLiveViews] = useState<number>(initialRecipe.viewsCount || 0);
  const [liveUploadDate, setLiveUploadDate] = useState<string>(initialRecipe.uploadDate || initialRecipe.createdAt || '');
  const [translating, setTranslating] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const handleDownloadPdfClick = async () => {
    if (isDownloadingPdf) return;
    setIsDownloadingPdf(true);
    confetti({ particleCount: 50, spread: 60 });
    try {
      await onDownloadPdf(recipe);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  useEffect(() => {
    setRecipe(initialRecipe);
    setServingsMultiplier(initialRecipe.servings || 2);
  }, [initialRecipe]);

  const handleTranslateHindi = async () => {
    setTranslating(true);
    try {
      const response = await fetch('/api/gemini/translate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipe, targetLanguage: 'hindi' })
      });
      const contentType = response.headers.get('content-type') || '';
      if (response.ok && contentType.includes('application/json')) {
        const translated = await response.json();
        setRecipe(translated);
        confetti({ particleCount: 40, spread: 60 });
      } else {
        console.warn('Translate endpoint not returning JSON, keeping original recipe.');
      }
    } catch (err) {
      console.error('Translation error:', err);
    } finally {
      setTranslating(false);
    }
  };

  // Fetch real-time YouTube metrics on modal open
  useEffect(() => {
    if (recipe?.youtubeUrl) {
      setLiveViews(recipe.viewsCount || 0);
      setLiveUploadDate(recipe.uploadDate || recipe.createdAt || '');

      fetch('/api/youtube/details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: recipe.youtubeUrl })
      })
        .then(res => {
          const contentType = res.headers.get('content-type') || '';
          if (res.ok && contentType.includes('application/json')) {
            return res.json();
          }
          return null;
        })
        .then(data => {
          if (data) {
            if (data.viewsCount) setLiveViews(data.viewsCount);
            if (data.uploadDate) setLiveUploadDate(data.uploadDate);
          }
        })
        .catch(err => console.error("Failed to fetch live YT details:", err));
    }
  }, [recipe?.id, recipe?.youtubeUrl]);

  // Toggle ingredient checklist
  const toggleIngredient = (id: string) => {
    setCheckedIngredients(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Jump YouTube video to step timestamp
  const jumpToStep = (seconds: number, index: number) => {
    setCurrentTimestamp(seconds);
    setActiveStepIndex(index);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(recipe.youtubeUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Calculate scaled ingredient amount
  const scaleAmount = (amountStr: string) => {
    if (!amountStr) return '';
    const ratio = servingsMultiplier / (recipe.servings || 2);
    return amountStr.replace(/([\d.\/]+)/g, (match) => {
      // Evaluate fraction if any, e.g. 1/2 or numbers like 2, 200
      try {
        let num = 0;
        if (match.includes('/')) {
          const parts = match.split('/');
          num = parseFloat(parts[0]) / parseFloat(parts[1]);
        } else {
          num = parseFloat(match);
        }
        if (isNaN(num)) return match;
        const scaled = num * ratio;
        // Format cleanly
        return Number.isInteger(scaled) ? scaled.toString() : scaled.toFixed(1);
      } catch {
        return match;
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md overflow-y-auto flex items-center justify-center p-2 sm:p-4 lg:p-6 animate-fadeIn">
      
      <div className="relative w-full max-w-6xl bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col my-auto max-h-[92vh]">
        
        {/* Top Header Bar */}
        <div className="px-6 py-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <ChefHat className="w-3.5 h-3.5" /> Theater Mode
            </span>
            <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-md sm:max-w-xl">
              {recipe.title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTranslateHindi}
              disabled={translating}
              className="px-3 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              title="Translate entire recipe steps & ingredients to Hindi Devanagari using Gemini AI"
            >
              <Sparkles className={`w-3.5 h-3.5 text-amber-400 ${translating ? 'animate-spin' : ''}`} />
              <span>{translating ? 'अनुवाद हो रहा है...' : '🇮🇳 Translate to Hindi (हिंदी)'}</span>
            </button>

            <button
              onClick={handleShare}
              className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{copiedLink ? 'Link Copied' : 'Share'}</span>
            </button>

            <button
              onClick={handleDownloadPdfClick}
              disabled={isDownloadingPdf}
              className="px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-75"
            >
              {isDownloadingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  <span className="hidden sm:inline">Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">AI PDF Card</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-xl transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Body Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
          
          {/* Left Column: Embedded YouTube Video Player (7 cols) */}
          <div className="lg:col-span-7 bg-black flex flex-col justify-between overflow-y-auto">
            <div className="relative aspect-video w-full bg-black shadow-lg">
              <iframe
                key={currentTimestamp} // Force iframe reload with start timestamp
                src={getYouTubeEmbedUrl(recipe.youtubeVideoId, currentTimestamp)}
                title={recipe.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Video Meta Info Footer */}
            <div className="p-5 space-y-4 bg-zinc-950/60 border-t border-zinc-800/80">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-300">
                <div className="flex items-center gap-3">
                  <span className="bg-amber-500/20 text-amber-400 px-2.5 py-1 rounded-md font-bold">
                    {recipe.categoryName}
                  </span>
                  <span className="flex items-center gap-1.5 text-orange-400 font-extrabold bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-md">
                    <Eye className="w-3.5 h-3.5" />
                    {liveViews ? `${liveViews.toLocaleString()} views` : '125K views'}
                  </span>
                  {liveUploadDate && (
                    <span className="flex items-center gap-1 text-zinc-400">
                      <Calendar className="w-3.5 h-3.5" /> {liveUploadDate}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" /> Prep: {recipe.prepTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-orange-400" /> Cook: {recipe.cookTime}
                  </span>
                </div>

                {/* Servings Scaler */}
                <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-xl">
                  <Users className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-zinc-400">Servings:</span>
                  <div className="flex items-center gap-1 font-bold text-white">
                    <button
                      onClick={() => setServingsMultiplier(Math.max(1, servingsMultiplier - 1))}
                      className="w-5 h-5 rounded bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-300"
                    >
                      -
                    </button>
                    <span className="px-1 text-amber-400">{servingsMultiplier}</span>
                    <button
                      onClick={() => setServingsMultiplier(servingsMultiplier + 1)}
                      className="w-5 h-5 rounded bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-300"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Chef Tip Banner */}
              {recipe.chefNote && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-400 block mb-0.5">Chef's Secret Tip:</span>
                    {recipe.chefNote}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Interactive Chapters & Ingredients Drawer (5 cols) */}
          <div className="lg:col-span-5 bg-zinc-900 flex flex-col border-l border-zinc-800/80 overflow-hidden">
            
            {/* Sidebar Tab Selector */}
            <div className="flex border-b border-zinc-800 bg-zinc-950/40 p-2 gap-2">
              <button
                onClick={() => setActiveTab('steps')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'steps'
                    ? 'bg-brand-accent text-white shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                <Play className="w-3.5 h-3.5" />
                Step Chapters ({recipe.steps.length})
              </button>

              <button
                onClick={() => setActiveTab('ingredients')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'ingredients'
                    ? 'bg-brand-accent text-white shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                Ingredients ({recipe.ingredients.length})
              </button>
            </div>

            {/* Sidebar Content Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              
              {/* TAB 1: Timestamped Steps */}
              {activeTab === 'steps' && (
                <div className="space-y-3">
                  <p className="text-[11px] text-zinc-400 mb-2">
                    Click any step below to jump directly to that part of the video tutorial:
                  </p>

                  {recipe.steps.map((step, idx) => {
                    const isActive = activeStepIndex === idx;
                    return (
                      <div
                        key={idx}
                        onClick={() => jumpToStep(step.timestampSeconds, idx)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          isActive
                            ? 'bg-amber-500/10 border-amber-500/50 text-white shadow-md'
                            : 'bg-zinc-800/40 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                              isActive ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400'
                            }`}>
                              {step.stepNumber}
                            </span>
                            <span className="font-bold text-xs">{step.title}</span>
                          </div>

                          <span className="bg-zinc-950 text-amber-400 border border-amber-500/30 text-[10px] font-mono px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Play className="w-2.5 h-2.5 fill-amber-400" />
                            {formatTime(step.timestampSeconds)}
                          </span>
                        </div>

                        <p className="text-xs text-zinc-400 leading-relaxed pl-7">
                          {step.instruction}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TAB 2: Interactive Ingredient Checklist */}
              {activeTab === 'ingredients' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-2">
                    <span>Check off ingredients as you prepare:</span>
                    <button
                      onClick={() => setCheckedIngredients({})}
                      className="text-amber-400 hover:underline"
                    >
                      Reset Checklist
                    </button>
                  </div>

                  {recipe.ingredients.map((ing) => {
                    const isChecked = !!checkedIngredients[ing.id];
                    return (
                      <div
                        key={ing.id}
                        onClick={() => toggleIngredient(ing.id)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                          isChecked
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-zinc-400 line-through'
                            : 'bg-zinc-800/40 border-zinc-800 text-zinc-100 hover:bg-zinc-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-zinc-500 shrink-0" />
                          )}
                          <span className="text-xs font-medium">{ing.name}</span>
                        </div>

                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                          isChecked ? 'bg-zinc-900/50 text-emerald-500' : 'bg-zinc-950 text-amber-400'
                        }`}>
                          {scaleAmount(ing.amount)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>

            {/* Sidebar Bottom Action */}
            <div className="p-4 bg-zinc-950/80 border-t border-zinc-800">
              <button
                onClick={() => onDownloadPdf(recipe)}
                className="w-full py-3 rounded-xl bg-brand-accent hover:opacity-90 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg"
              >
                <Download className="w-4 h-4" /> Download Printable Recipe PDF Card
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
