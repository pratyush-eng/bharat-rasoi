import React, { useState } from 'react';
import {
  ChefHat,
  Utensils,
  Flame,
  Sparkles,
  CookingPot,
  Award,
  Search,
  BookOpen,
  Menu,
  X,
  PlayCircle,
  Download,
  Lock,
  ShieldCheck,
  Megaphone,
  PanelLeft
} from 'lucide-react';
import { Category, SiteSettings } from '../types';

interface HeaderProps {
  activeTab: 'gallery' | 'cookbooks' | 'admin' | 'login';
  setActiveTab: (tab: 'gallery' | 'cookbooks' | 'admin' | 'login') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (catId: string | null) => void;
  categories: Category[];
  siteSettings: SiteSettings;
  isAdminLoggedIn: boolean;
  onOpenAdminLogin?: () => void;
  onOpenAiModal?: () => void;
  onToggleAdminSidebar?: () => void;
}

const LOGO_ICONS: Record<string, any> = {
  ChefHat,
  Utensils,
  Flame,
  Sparkles,
  CookingPot,
  Award
};

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories,
  siteSettings,
  isAdminLoggedIn,
  onOpenAdminLogin,
  onOpenAiModal,
  onToggleAdminSidebar
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const LogoComponent = LOGO_ICONS[siteSettings.logoIcon] || ChefHat;

  const handleAdminClick = () => {
    if (isAdminLoggedIn) {
      setActiveTab('admin');
    } else {
      onOpenAdminLogin();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E5E1] text-[#1A1A1A] transition-all">
      
      {/* Top Announcement Bar if enabled */}
      {siteSettings.showAnnouncement && siteSettings.announcementText && (
        <div 
          className="py-1.5 px-4 text-white text-xs font-bold text-center flex items-center justify-center gap-2"
          style={{ backgroundColor: siteSettings.accentColor || '#FF5F1F' }}
        >
          <Megaphone className="w-3.5 h-3.5 animate-bounce" />
          <span>{siteSettings.announcementText}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Brand Logo & Channel Title */}
          <div 
            onClick={() => { setActiveTab('gallery'); setSelectedCategory(null); }}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300 overflow-hidden bg-white"
              style={{ backgroundColor: siteSettings.customLogoUrl ? '#FFFFFF' : (siteSettings.accentColor || '#FF5F1F') }}
            >
              {siteSettings.customLogoUrl ? (
                <img
                  src={siteSettings.customLogoUrl}
                  alt={siteSettings.siteName || 'Logo'}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain p-0.5"
                />
              ) : (
                <LogoComponent className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-[#1A1A1A]">
                  {siteSettings.siteName || 'CHEF STUDIO'}
                </span>
                <span className="bg-[#1A1A1A]/5 text-[#1A1A1A] border border-[#E5E5E1] text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <PlayCircle className="w-3 h-3 text-brand-accent" /> YT CHANNEL
                </span>
              </div>
              <p className="text-xs text-gray-500 hidden sm:block">{siteSettings.tagline || 'Cooking Tutorials & Downloadable Recipe Books'}</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tutorials, ingredients or recipe books..."
                className="w-full bg-[#F3F3F1] border border-[#E5E5E1] rounded-full pl-10 pr-4 py-2.5 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-brand-accent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-[#1A1A1A]"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-2">
            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'gallery'
                  ? 'bg-[#1A1A1A] text-white'
                  : 'text-gray-600 hover:bg-[#F3F3F1] hover:text-[#1A1A1A]'
              }`}
            >
              <PlayCircle className="w-4 h-4" />
              Video Tutorials
            </button>

            <button
              onClick={() => setActiveTab('cookbooks')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'cookbooks'
                  ? 'bg-[#1A1A1A] text-white'
                  : 'text-gray-600 hover:bg-[#F3F3F1] hover:text-[#1A1A1A]'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Cookbooks & PDFs
            </button>

            {/* Admin Portal Button - Only visible when Admin is logged in */}
            {isAdminLoggedIn && (
              <button
                onClick={handleAdminClick}
                className={`ml-2 px-3.5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border ${
                  activeTab === 'admin'
                    ? 'bg-brand-accent text-white border-brand-accent shadow-sm'
                    : 'bg-brand-accent-light text-[#1A1A1A] border-brand-accent-light hover:border-brand-accent'
                }`}
                title="Open Admin Control Panel"
              >
                <ShieldCheck className="w-4 h-4 text-brand-accent" />
                <span>Admin Control</span>
              </button>
            )}
          </nav>

          {/* Mobile menu trigger */}
          <div className="flex items-center gap-2 lg:hidden">
            {activeTab === 'admin' && onToggleAdminSidebar && (
              <button
                onClick={onToggleAdminSidebar}
                className="p-2.5 bg-brand-accent text-white rounded-full shadow-md flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
                title="Open Admin Side Panel"
              >
                <PanelLeft className="w-5 h-5" />
              </button>
            )}

            {isAdminLoggedIn && (
              <button
                onClick={handleAdminClick}
                className={`p-2.5 rounded-full ${
                  activeTab === 'admin' ? 'bg-[#1A1A1A] text-white' : 'bg-gray-100 text-gray-700'
                }`}
                title="Admin Control"
              >
                <ShieldCheck className="w-4 h-4 text-brand-accent" />
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-700 hover:bg-[#F3F3F1] rounded-full"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Search Input */}
        <div className="md:hidden pb-4">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search recipes & ingredients..."
              className="w-full bg-[#F3F3F1] border border-[#E5E5E1] rounded-full pl-10 pr-4 py-2 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E5E5E1] bg-white px-4 pt-3 pb-6 space-y-2">
          {isAdminLoggedIn && activeTab === 'admin' && onToggleAdminSidebar && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onToggleAdminSidebar();
              }}
              className="w-full text-left px-4 py-3 rounded-2xl flex items-center gap-3 text-sm font-extrabold bg-brand-accent text-white shadow-md"
            >
              <PanelLeft className="w-5 h-5" /> Open Admin Side Panel
            </button>
          )}

          <button
            onClick={() => { setActiveTab('gallery'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-3 rounded-2xl flex items-center gap-3 text-sm font-bold ${
              activeTab === 'gallery' ? 'bg-brand-accent-light text-brand-accent' : 'text-gray-700'
            }`}
          >
            <PlayCircle className="w-5 h-5" /> Video Tutorials
          </button>
          <button
            onClick={() => { setActiveTab('cookbooks'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-3 rounded-2xl flex items-center gap-3 text-sm font-bold ${
              activeTab === 'cookbooks' ? 'bg-brand-accent-light text-brand-accent' : 'text-gray-700'
            }`}
          >
            <Download className="w-5 h-5" /> Download Cookbooks & PDFs
          </button>
          {isAdminLoggedIn && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleAdminClick();
              }}
              className="w-full text-left px-4 py-3 rounded-2xl flex items-center gap-3 text-sm font-bold bg-gray-100 text-[#1A1A1A]"
            >
              <ShieldCheck className="w-5 h-5 text-brand-accent" /> Admin Control Dashboard
            </button>
          )}
        </div>
      )}
    </header>
  );
};
