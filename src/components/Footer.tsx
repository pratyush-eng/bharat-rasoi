import React, { useState } from 'react';
import { ChefHat, Utensils, Flame, Sparkles, CookingPot, Award, Youtube, Instagram, Twitter, Mail, Heart, Send, Lock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Category, SiteSettings } from '../types';

interface FooterProps {
  categories: Category[];
  onSelectCategory: (catId: string) => void;
  siteSettings: SiteSettings;
  isAdminLoggedIn?: boolean;
  onOpenAdminLogin?: () => void;
  onSubscribe?: (email: string) => Promise<void> | void;
}

const LOGO_ICONS: Record<string, any> = {
  ChefHat,
  Utensils,
  Flame,
  Sparkles,
  CookingPot,
  Award
};

export const Footer: React.FC<FooterProps> = ({
  categories,
  onSelectCategory,
  siteSettings,
  isAdminLoggedIn,
  onOpenAdminLogin,
  onSubscribe
}) => {
  const LogoComponent = LOGO_ICONS[siteSettings.logoIcon] || ChefHat;
  const [footerEmail, setFooterEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(() => {
    return localStorage.getItem('chef_studio_subscribed') === 'true';
  });
  const [subStatus, setSubStatus] = useState('');

  const handleFooterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!footerEmail || !footerEmail.includes('@')) return;
    if (onSubscribe) {
      await onSubscribe(footerEmail.trim());
    }
    localStorage.setItem('chef_studio_subscribed', 'true');
    setIsSubscribed(true);
    setSubStatus('🎉 Subscribed for notifications!');
    setFooterEmail('');
  };

  return (
    <footer className="bg-white border-t border-[#E5E5E1] text-[#1A1A1A] pt-12 pb-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md overflow-hidden bg-white"
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
              <span className="font-extrabold text-lg text-[#1A1A1A] tracking-tight">
                {siteSettings.siteName || 'CHEF STUDIO'}
              </span>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed max-w-sm">
              {siteSettings.tagline || 'Organizing top-rated YouTube cooking tutorials into searchable categories and downloadable printable recipe books for food enthusiasts worldwide.'}
            </p>

            <div className="flex flex-wrap items-center gap-3 text-gray-600">
              {siteSettings.youtubeUrl && (
                <a href={siteSettings.youtubeUrl} target="_blank" rel="noreferrer" className="p-2.5 bg-[#F3F3F1] hover:bg-[#FF5F1F] hover:text-white rounded-full transition-colors" title="YouTube Channel">
                  <Youtube className="w-4 h-4" />
                </a>
              )}
              {siteSettings.instagramUrl && (
                <a href={siteSettings.instagramUrl} target="_blank" rel="noreferrer" className="p-2.5 bg-[#F3F3F1] hover:bg-[#FF5F1F] hover:text-white rounded-full transition-colors" title="Instagram Profile">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {siteSettings.twitterUrl && (
                <a href={siteSettings.twitterUrl} target="_blank" rel="noreferrer" className="p-2.5 bg-[#F3F3F1] hover:bg-[#FF5F1F] hover:text-white rounded-full transition-colors" title="Twitter / X Profile">
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {siteSettings.contactEmail && (
                <a href={`mailto:${siteSettings.contactEmail}`} className="px-3.5 py-2 bg-[#F3F3F1] hover:bg-[#FF5F1F] hover:text-white rounded-full transition-colors flex items-center gap-1.5 text-xs font-bold" title="Contact Email">
                  <Mail className="w-3.5 h-3.5 text-[#FF5F1F] group-hover:text-white shrink-0" />
                  <span>{siteSettings.contactEmail}</span>
                </a>
              )}
            </div>
          </div>

          {/* Quick Categories */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#1A1A1A]">Cooking Categories</h4>
            <ul className="space-y-2 text-xs">
              {categories.slice(0, 5).map(cat => (
                <li key={cat.id}>
                  <button
                    onClick={() => onSelectCategory(cat.id)}
                    className="text-gray-600 hover:text-[#FF5F1F] transition-colors font-medium"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Recipe Newsletter */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#1A1A1A]">Join Channel Newsletter</h4>
            <p className="text-xs text-gray-500">
              Get notified when new video tutorials and downloadable cookbooks are published!
            </p>

            {isSubscribed ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-full px-4 py-2 flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Subscribed to Push Notifications!</span>
              </div>
            ) : (
              <form onSubmit={handleFooterSubscribe} className="space-y-1">
                <div className="flex gap-2 pt-1">
                  <input
                    type="email"
                    required
                    value={footerEmail}
                    onChange={(e) => setFooterEmail(e.target.value)}
                    placeholder="Enter email address..."
                    className="bg-[#F3F3F1] border border-[#E5E5E1] rounded-full px-4 py-2 text-xs text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#FF5F1F] w-full"
                  />
                  <button
                    type="submit"
                    className="bg-[#1A1A1A] hover:bg-[#FF5F1F] text-white font-bold px-5 py-2 rounded-full text-xs flex items-center justify-center shrink-0 transition-colors shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
                {subStatus && <p className="text-[11px] font-bold text-emerald-600">{subStatus}</p>}
              </form>
            )}
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-[#E5E5E1] flex flex-wrap items-center justify-between text-xs text-gray-500 gap-4">
          <p>&copy; {new Date().getFullYear()} {siteSettings.siteName || 'Chef Studio'} • All Rights Reserved.</p>
          
          <div className="flex items-center gap-4">
            <p className="flex items-center gap-1 font-medium">
              Crafted for Home Chefs <Heart className="w-3 h-3 text-[#FF5F1F] fill-[#FF5F1F]" />
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
};
