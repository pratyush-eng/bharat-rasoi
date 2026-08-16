import React, { useState } from 'react';
import { RecipeBookBundle, RecipeVideo } from '../types';
import { downloadCookbookBundlePDF, downloadRecipePDF } from '../utils/pdfGenerator';
import { saveCookbookToDb } from '../lib/firebase';
import {
  BookOpen,
  Download,
  Plus,
  Check,
  Sparkles,
  FileText,
  Utensils,
  Layers,
  ArrowRight,
  Printer,
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CookbookHubProps {
  cookbooks: RecipeBookBundle[];
  recipes: RecipeVideo[];
  onLogDownload: (itemType: 'cookbook_bundle' | 'recipe_pdf', itemId: string, itemName: string) => void;
}

export const CookbookHub: React.FC<CookbookHubProps> = ({
  cookbooks,
  recipes,
  onLogDownload
}) => {
  const [selectedRecipesForCustom, setSelectedRecipesForCustom] = useState<string[]>([]);
  const [customBookTitle, setCustomBookTitle] = useState('My Custom Chef Studio Cookbook');
  const [isGeneratingCustom, setIsGeneratingCustom] = useState(false);
  const [downloadingBundleId, setDownloadingBundleId] = useState<string | null>(null);

  // Toggle selection for custom cookbook builder
  const toggleRecipeSelection = (id: string) => {
    setSelectedRecipesForCustom(prev =>
      prev.includes(id) ? prev.filter(rId => rId !== id) : [...prev, id]
    );
  };

  const handleDownloadCuratedCookbook = async (bundle: RecipeBookBundle) => {
    setDownloadingBundleId(bundle.id);
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    try {
      const bundleRecipes = recipes.filter(r => bundle.recipeIds.includes(r.id));
      await downloadCookbookBundlePDF(bundle, bundleRecipes.length > 0 ? bundleRecipes : recipes.slice(0, 3));
      
      // Save updated download count to Firestore
      const updatedBundle = { ...bundle, downloadCount: bundle.downloadCount + 1 };
      await saveCookbookToDb(updatedBundle);

      onLogDownload('cookbook_bundle', bundle.id, bundle.title);
    } finally {
      setDownloadingBundleId(null);
    }
  };

  const handleDownloadCustomCookbook = async () => {
    if (selectedRecipesForCustom.length === 0) return;
    setIsGeneratingCustom(true);
    confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });

    const selectedList = recipes.filter(r => selectedRecipesForCustom.includes(r.id));
    const customBundle: RecipeBookBundle = {
      id: `custom-${Date.now()}`,
      title: customBookTitle,
      description: `Personalized cookbook bundle featuring ${selectedList.length} recipes selected from Chef Studio.`,
      coverImageUrl: selectedList[0]?.thumbnailUrl || '',
      recipeIds: selectedRecipesForCustom,
      category: 'Custom Bundle',
      downloadCount: 1
    };

    await downloadCookbookBundlePDF(customBundle, selectedList);
    onLogDownload('cookbook_bundle', customBundle.id, customBookTitle);
    setIsGeneratingCustom(false);
  };

  return (
    <div className="space-y-12 py-8">
      
      {/* Hero Header */}
      <div className="bg-[#1A1A1A] p-8 sm:p-12 rounded-3xl text-white relative overflow-hidden shadow-xl border border-[#2A2A2A]">
        <div className="max-w-2xl space-y-4 relative z-10">
          <span className="bg-brand-accent text-white text-xs font-bold px-3 py-1 rounded-full inline-flex items-center gap-1.5 shadow-sm">
            <BookOpen className="w-3.5 h-3.5" /> Printable Digital Library
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Downloadable Cookbook Collections
          </h1>
          <p className="text-gray-300 text-sm leading-relaxed">
            Get high-resolution PDF cookbooks complete with ingredient checklists, precise step-by-step cooking instructions, and chef secret notes.
          </p>
        </div>
      </div>

      {/* Featured Curated Cookbooks Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-[#1A1A1A] flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-accent" /> Curated Channel Cookbooks
          </h2>
          <span className="text-xs text-gray-500 font-medium">Ready to download in 1-click</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cookbooks.map((bundle) => {
            const bundleRecipeList = recipes.filter(r => bundle.recipeIds.includes(r.id));
            return (
              <div
                key={bundle.id}
                className="bg-white border border-[#E5E5E1] rounded-3xl overflow-hidden hover:border-brand-accent transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-md"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={bundle.coverImageUrl}
                    alt={bundle.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-[#1A1A1A] text-[10px] font-extrabold px-3 py-1 rounded-full shadow-sm">
                    {bundle.category}
                  </span>

                  <span className="absolute bottom-3 left-3 text-xs text-white font-medium bg-black/60 backdrop-blur-md px-3 py-1 rounded-full">
                    {bundle.downloadCount.toLocaleString()} downloads
                  </span>
                </div>

                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="font-bold text-base text-[#1A1A1A]">{bundle.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                      {bundle.description}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDownloadCuratedCookbook(bundle)}
                    disabled={downloadingBundleId === bundle.id}
                    className="w-full py-3 rounded-full bg-[#1A1A1A] hover:bg-brand-accent text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-sm group disabled:opacity-75"
                  >
                    {downloadingBundleId === bundle.id ? (
                      <>
                        <Loader2 className="w-4 h-4 text-brand-accent animate-spin" />
                        <span>Generating Cookbook PDF...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 text-brand-accent group-hover:text-white" />
                        <span>Download PDF Cookbook</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CUSTOM COOKBOOK BUILDER SECTION */}
      <div className="bg-white border border-[#E5E5E1] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5E5E1] pb-6">
          <div className="space-y-1">
            <span className="bg-brand-accent-light text-brand-accent border border-brand-accent-light text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Custom Compiler
            </span>
            <h2 className="text-xl font-bold text-[#1A1A1A]">
              Build Your Own Custom Recipe Book
            </h2>
            <p className="text-xs text-gray-500">
              Select your favorite recipe tutorials from the channel below and generate a single merged PDF cookbook!
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <input
              type="text"
              value={customBookTitle}
              onChange={(e) => setCustomBookTitle(e.target.value)}
              placeholder="Cookbook Title..."
              className="bg-[#F3F3F1] border border-[#E5E5E1] rounded-full px-4 py-2 text-xs text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-brand-accent w-full sm:w-64"
            />

            <button
              disabled={selectedRecipesForCustom.length === 0 || isGeneratingCustom}
              onClick={handleDownloadCustomCookbook}
              className={`px-5 py-2.5 rounded-full font-bold text-xs flex items-center gap-2 shrink-0 transition-all ${
                selectedRecipesForCustom.length > 0
                  ? 'bg-brand-accent text-white shadow-md hover:scale-105'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Printer className="w-4 h-4" />
              {isGeneratingCustom ? 'Generating...' : `Compile & Download (${selectedRecipesForCustom.length})`}
            </button>
          </div>
        </div>

        {/* Recipe Selection Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recipes.map((recipe) => {
            const isSelected = selectedRecipesForCustom.includes(recipe.id);
            return (
              <div
                key={recipe.id}
                onClick={() => toggleRecipeSelection(recipe.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-4 ${
                  isSelected
                    ? 'bg-brand-accent-light/30 border-brand-accent text-[#1A1A1A] shadow-sm'
                    : 'bg-[#FAF9F6] border-[#E5E5E1] text-gray-600 hover:border-gray-400'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  isSelected ? 'bg-brand-accent text-white' : 'bg-white border border-[#E5E5E1]'
                }`}>
                  {isSelected ? <Check className="w-4 h-4 stroke-[3]" /> : <Plus className="w-3.5 h-3.5 text-gray-400" />}
                </div>

                <img
                  src={recipe.thumbnailUrl}
                  alt={recipe.title}
                  className="w-16 h-12 rounded-xl object-cover shrink-0"
                />

                <div className="overflow-hidden">
                  <h4 className="font-bold text-xs text-[#1A1A1A] truncate">{recipe.title}</h4>
                  <p className="text-[10px] text-gray-500">{recipe.categoryName} • {recipe.prepTime}</p>
                </div>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};
