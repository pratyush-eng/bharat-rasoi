import React from 'react';
import { Category } from '../types';
import {
  UtensilsCrossed,
  Zap,
  Cake,
  Flame,
  Leaf,
  FlameKindling,
  Grid,
  Filter,
  ArrowUpDown
} from 'lucide-react';

interface CategoryBarProps {
  categories: Category[];
  selectedCategory: string | null;
  setSelectedCategory: (catId: string | null) => void;
  selectedDifficulty: string | null;
  setSelectedDifficulty: (diff: string | null) => void;
  sortBy: 'latest' | 'popular' | 'quickest';
  setSortBy: (sort: 'latest' | 'popular' | 'quickest') => void;
  totalResults: number;
}

// Icon mapper for Lucide icons
const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case 'UtensilsCrossed': return <UtensilsCrossed className="w-4 h-4" />;
    case 'Zap': return <Zap className="w-4 h-4" />;
    case 'Cake': return <Cake className="w-4 h-4" />;
    case 'Flame': return <Flame className="w-4 h-4" />;
    case 'Leaf': return <Leaf className="w-4 h-4" />;
    case 'FlameKindling': return <FlameKindling className="w-4 h-4" />;
    default: return <UtensilsCrossed className="w-4 h-4" />;
  }
};

export const CategoryBar: React.FC<CategoryBarProps> = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  selectedDifficulty,
  setSelectedDifficulty,
  sortBy,
  setSortBy,
  totalResults
}) => {
  return (
    <div className="space-y-4 py-6 border-b border-[#E5E5E1]">
      
      {/* Category Horizontal Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {/* All Categories Pill */}
        <button
          onClick={() => setSelectedCategory(null)}
          className={`shrink-0 px-4 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
            selectedCategory === null
              ? 'bg-[#1A1A1A] text-white shadow-md'
              : 'bg-white text-[#1A1A1A] hover:border-brand-accent border border-[#E5E5E1]'
          }`}
        >
          <Grid className="w-4 h-4" />
          All Categories
        </button>

        {/* Dynamic Categories */}
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
              className={`shrink-0 px-4 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 border ${
                isSelected
                  ? 'bg-brand-accent text-white border-brand-accent shadow-md'
                  : 'bg-white text-[#1A1A1A] hover:border-brand-accent border-[#E5E5E1]'
              }`}
            >
              <span className={isSelected ? 'text-white' : 'text-brand-accent'}>
                {getCategoryIcon(cat.icon)}
              </span>
              <span>{cat.name}</span>
              {cat.videoCount !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-[#F3F3F1] text-gray-500'
                }`}>
                  {cat.videoCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Filter & Sort Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-1 text-xs">
        
        {/* Results Counter & Active Category Badge */}
        <div className="flex items-center gap-2 text-gray-500 font-medium">
          <span className="font-extrabold text-[#1A1A1A]">{totalResults}</span> cooking tutorials found
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="bg-brand-accent-light text-brand-accent border border-brand-accent-light px-3 py-1 rounded-full text-[11px] font-bold hover:bg-brand-accent-light/80 transition-colors"
            >
              Clear category &times;
            </button>
          )}
        </div>

        {/* Difficulty Filter & Sort Options */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Difficulty Dropdown */}
          <div className="flex items-center gap-1.5 bg-white border border-[#E5E5E1] rounded-full px-3.5 py-1.5 text-[#1A1A1A] shadow-sm">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-400 font-medium">Level:</span>
            <select
              value={selectedDifficulty || ''}
              onChange={(e) => setSelectedDifficulty(e.target.value ? e.target.value : null)}
              className="bg-transparent text-[#1A1A1A] font-bold focus:outline-none cursor-pointer"
            >
              <option value="">All Levels</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5 bg-white border border-[#E5E5E1] rounded-full px-3.5 py-1.5 text-[#1A1A1A] shadow-sm">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-400 font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-[#1A1A1A] font-bold focus:outline-none cursor-pointer"
            >
              <option value="latest">Latest Uploads</option>
              <option value="popular">Most Popular (Views)</option>
              <option value="quickest">Quickest Prep Time</option>
            </select>
          </div>

        </div>

      </div>

    </div>
  );
};
