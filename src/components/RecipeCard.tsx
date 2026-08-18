import React, { useState } from 'react';
import { RecipeVideo } from '../types';
import {
  Play,
  Download,
  Clock,
  Eye,
  Utensils,
  Sparkles,
  Flame,
  BookOpen,
  Calendar,
  Loader2
} from 'lucide-react';

interface RecipeCardProps {
  recipe: RecipeVideo;
  onWatchVideo: (recipe: RecipeVideo) => void;
  onDownloadPdf: (recipe: RecipeVideo) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onWatchVideo,
  onDownloadPdf
}) => {
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const handlePdfClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDownloadingPdf) return;
    setIsDownloadingPdf(true);
    try {
      await onDownloadPdf(recipe);
    } finally {
      setIsDownloadingPdf(false);
    }
  };
  return (
    <div className="group rounded-3xl bg-white border border-[#E5E5E1] hover:border-brand-accent overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full">
      
      {/* Video Thumbnail Box with Play Overlay */}
      <div className="relative aspect-video overflow-hidden bg-[#F3F3F1] cursor-pointer" onClick={() => onWatchVideo(recipe)}>
        <img
          src={recipe.thumbnailUrl}
          alt={recipe.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Play Button */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
          <div className="w-14 h-14 rounded-full bg-brand-accent text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
            <Play className="w-7 h-7 fill-white ml-0.5" />
          </div>
        </div>

        {/* Category Pill Top Left */}
        <div className="absolute top-3 left-3">
          <span className="bg-white/90 backdrop-blur-md text-[#1A1A1A] font-extrabold text-[11px] px-2.5 py-1 rounded-full shadow-sm">
            {recipe.categoryName}
          </span>
        </div>

        {/* Duration Top Right */}
        <div className="absolute top-3 right-3">
          <span className="bg-black/80 backdrop-blur-md text-white text-[11px] font-bold px-2 py-1 rounded-full">
            {recipe.duration}
          </span>
        </div>

        {/* Views & Servings Bottom */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-medium text-white">
          <span className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-full">
            <Eye className="w-3 h-3 text-gray-300" /> {recipe.viewsCount.toLocaleString()} views
          </span>
          <span className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-full">
            <Utensils className="w-3 h-3 text-brand-accent" /> {recipe.servings} servings
          </span>
        </div>
      </div>

      {/* Card Content Details */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        
        <div className="space-y-2">
          {/* Title */}
          <h3 
            onClick={() => onWatchVideo(recipe)}
            className="font-bold text-base text-[#1A1A1A] group-hover:text-brand-accent transition-colors line-clamp-2 cursor-pointer leading-snug"
          >
            {recipe.title}
          </h3>

          {/* Description */}
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {recipe.description}
          </p>
        </div>

        {/* Times & Difficulty Bar */}
        <div className="pt-3 border-t border-[#E5E5E1] flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-gray-400" /> {recipe.prepTime}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-brand-accent" /> {recipe.cookTime}
            </span>
          </div>

          <span className="font-extrabold px-2.5 py-0.5 rounded-full text-[10px] bg-brand-accent-light text-brand-accent">
            {recipe.difficulty}
          </span>
        </div>

        {/* Total Views & Uploaded Date displayed right above Watch and cook button */}
        <div className="flex items-center justify-between text-[11px] font-bold text-gray-700 bg-[#FAF9F6] border border-[#E5E5E1] px-3 py-1.5 rounded-xl">
          <span className="flex items-center gap-1.5 text-[#1A1A1A]">
            <Eye className="w-3.5 h-3.5 text-brand-accent" />
            {recipe.viewsCount ? `${recipe.viewsCount.toLocaleString()} views` : '1.2K views'}
          </span>
          <span className="flex items-center gap-1.5 text-gray-500">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            {recipe.uploadDate ? recipe.uploadDate : (recipe.createdAt || 'Recent')}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 grid grid-cols-2 gap-2">
          <button
            onClick={() => onWatchVideo(recipe)}
            className="w-full py-2.5 rounded-full bg-[#1A1A1A] hover:bg-brand-accent text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> Watch & Cook
          </button>

          <button
            onClick={handlePdfClick}
            disabled={isDownloadingPdf}
            className="w-full py-2.5 rounded-full bg-[#FAF9F6] hover:border-brand-accent text-[#1A1A1A] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-[#E5E5E1] disabled:opacity-75"
          >
            {isDownloadingPdf ? (
              <>
                <Loader2 className="w-3.5 h-3.5 text-brand-accent animate-spin" />
                <span>PDF Card...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-brand-accent" />
                <span>PDF Card</span>
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
};
