import React, { useState, useEffect, useMemo } from 'react';
import {
  Play,
  Download,
  BookOpen,
  Award,
  Video,
  Eye,
  TrendingUp,
  Sparkles,
  Youtube,
  ChevronLeft,
  ChevronRight,
  Pause,
  Mail,
  Bell,
  CheckCircle2,
  Send
} from 'lucide-react';
import { RecipeVideo, SiteSettings } from '../types';

interface ChannelHeroProps {
  featuredVideo: RecipeVideo | null;
  topVideos?: RecipeVideo[];
  totalVideos: number;
  totalCategories: number;
  totalDownloads?: number;
  siteVisits?: number;
  onWatchVideo: (video: RecipeVideo) => void;
  onGoToCookbooks: () => void;
  onSubscribe?: (email: string) => Promise<void> | void;
  siteSettings?: SiteSettings;
}

export const ChannelHero: React.FC<ChannelHeroProps> = ({
  featuredVideo,
  topVideos = [],
  totalVideos,
  totalCategories,
  totalDownloads = 0,
  siteVisits = 28450,
  onWatchVideo,
  onGoToCookbooks,
  onSubscribe,
  siteSettings,
}) => {
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(() => {
    return localStorage.getItem('chef_studio_subscribed') === 'true';
  });
  const [subscribeStatus, setSubscribeStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscribeEmail || !subscribeEmail.includes('@')) {
      setSubscribeStatus('Please enter a valid email address.');
      return;
    }
    setIsSubmitting(true);
    try {
      if (onSubscribe) {
        await onSubscribe(subscribeEmail.trim());
      }
      if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
        try {
          await Notification.requestPermission();
        } catch {
          // ignore
        }
      }
      localStorage.setItem('chef_studio_subscribed', 'true');
      setIsSubscribed(true);
      setSubscribeStatus('🎉 Subscribed! You will receive live push notifications.');
      setSubscribeEmail('');
    } catch (err) {
      setSubscribeStatus('Failed to subscribe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  // Construct list of top 10 uploaded videos (including featured video)
  const slideVideos = useMemo(() => {
    let list: RecipeVideo[] = [];
    if (topVideos && topVideos.length > 0) {
      list = [...topVideos];
      if (featuredVideo && !list.some((v) => v.id === featuredVideo.id)) {
        list.unshift(featuredVideo);
      } else if (featuredVideo) {
        list = [featuredVideo, ...list.filter((v) => v.id !== featuredVideo.id)];
      }
    } else if (featuredVideo) {
      list = [featuredVideo];
    }
    return list.slice(0, 10);
  }, [topVideos, featuredVideo]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Settings from Admin Dashboard
  const autoSlideEnabled = siteSettings?.heroAutoSlideEnabled !== false;
  const autoSlideInterval = siteSettings?.heroAutoSlideSpeed || 4500;
  const slideDirection = siteSettings?.heroSlideDirection || 'right-to-left';

  // Guard against index out of bounds when list changes
  useEffect(() => {
    if (currentIndex >= slideVideos.length && slideVideos.length > 0) {
      setCurrentIndex(0);
    }
  }, [slideVideos.length, currentIndex]);

  // Auto-slide timer with customizable interval and direction
  useEffect(() => {
    if (slideVideos.length <= 1 || isPaused || !autoSlideEnabled) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (slideDirection === 'left-to-right') {
          return (prev - 1 + slideVideos.length) % slideVideos.length;
        }
        return (prev + 1) % slideVideos.length;
      });
    }, autoSlideInterval);
    return () => clearInterval(interval);
  }, [slideVideos.length, isPaused, autoSlideEnabled, autoSlideInterval, slideDirection]);

  const currentVideo = slideVideos[currentIndex] || featuredVideo;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + slideVideos.length) % slideVideos.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % slideVideos.length);
  };

  return (
    <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Bento Grid Header Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Bento Card 1: Featured Top Uploads Right-to-Left Auto-Sliding Hero Banner (8 Cols) */}
        {slideVideos.length > 0 && (
          <div 
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="lg:col-span-8 bg-[#1A1A1A] rounded-3xl overflow-hidden relative group min-h-[380px] sm:min-h-[420px] shadow-xl border border-[#2A2A2A] transition-all flex flex-col justify-between"
          >
            {/* Horizontal Right-to-Left Sliding Track */}
            <div 
              className="flex w-full h-full min-h-[380px] sm:min-h-[420px] transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {slideVideos.map((video) => (
                <div 
                  key={video.id}
                  className="min-w-full w-full h-full min-h-[380px] sm:min-h-[420px] shrink-0 relative flex flex-col justify-end p-6 sm:p-8 select-none"
                >
                  {/* Background Thumbnail Image */}
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700 pointer-events-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-[#1A1A1A]/60 to-transparent pointer-events-none" />

                  {/* Slide Text Content */}
                  <div className="relative z-10 space-y-3 pt-12">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-gray-200 text-xs font-semibold bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                        ⏱️ {video.duration} • 📁 {video.categoryName} • 👁️ {video.viewsCount.toLocaleString()} views
                      </span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight line-clamp-2 max-w-2xl">
                      {video.title}
                    </h2>

                    <p className="text-gray-300 text-xs sm:text-sm line-clamp-2 max-w-xl">
                      {video.description}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          onClick={() => onWatchVideo(video)}
                          className="bg-white text-[#1A1A1A] hover:bg-brand-accent hover:text-white px-6 py-3 rounded-full font-extrabold text-xs flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg"
                        >
                          <Play className="w-4 h-4 fill-current" /> Watch Now
                        </button>

                        <button
                          onClick={onGoToCookbooks}
                          className="bg-white/10 backdrop-blur-md text-white hover:bg-white/20 px-5 py-3 rounded-full text-xs font-bold transition-all border border-white/10"
                        >
                          Download Recipe Books
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Floating Top Navigation & Status Bar */}
            <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-2 pointer-events-auto">
                <span className="px-3 py-1 bg-brand-accent text-white text-[10px] font-extrabold rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                  <Sparkles className="w-3 h-3" />
                  {slideVideos.length > 1 ? `Top Tutorial ${currentIndex + 1} / ${slideVideos.length}` : 'Featured Tutorial'}
                </span>
                {slideVideos.length > 1 && autoSlideEnabled && (
                  <button
                    onClick={() => setIsPaused(!isPaused)}
                    title={isPaused ? "Resume auto-slide" : "Pause auto-slide"}
                    className="bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/10 transition-colors"
                  >
                    {isPaused ? <Play className="w-2.5 h-2.5 fill-current text-amber-400" /> : <Pause className="w-2.5 h-2.5 fill-current text-white" />}
                    <span className="hidden sm:inline font-bold">{isPaused ? 'Paused' : 'Auto-sliding'}</span>
                  </button>
                )}
              </div>

              {/* Slide Navigation Arrows */}
              {slideVideos.length > 1 && (
                <div className="flex items-center gap-1.5 pointer-events-auto">
                  <button
                    onClick={handlePrev}
                    aria-label="Previous Slide"
                    className="p-2 rounded-full bg-black/50 hover:bg-brand-accent text-white backdrop-blur-md border border-white/20 transition-all hover:scale-110 active:scale-95"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNext}
                    aria-label="Next Slide"
                    className="p-2 rounded-full bg-black/50 hover:bg-brand-accent text-white backdrop-blur-md border border-white/20 transition-all hover:scale-110 active:scale-95"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Floating Central Play Glass Icon */}
            {currentVideo && (
              <div 
                onClick={() => onWatchVideo(currentVideo)}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 cursor-pointer hover:scale-110 transition-transform shadow-2xl z-10"
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <Play className="w-6 h-6 sm:w-8 sm:h-8 text-brand-accent fill-brand-accent ml-1" />
                </div>
              </div>
            )}

            {/* Floating Slide Indicator Dots at Bottom Right */}
            {slideVideos.length > 1 && (
              <div className="absolute bottom-6 right-6 z-20 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 pointer-events-auto">
                {slideVideos.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex(idx);
                    }}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentIndex
                        ? 'w-6 bg-brand-accent'
                        : 'w-2 bg-white/40 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bento Card 2: Site Visit Count & Subscription Box Callout (4 Cols) */}
        <div className="lg:col-span-4 bg-brand-accent-light/30 border border-brand-accent-light rounded-3xl p-6 flex flex-col justify-between shadow-sm space-y-4">
          {/* Site Visit Count Metric */}
          <div className="flex items-start justify-between">
            <div className="p-3 bg-brand-accent rounded-2xl text-white shadow-md">
              <Eye className="w-6 h-6" />
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-500 font-extrabold uppercase tracking-widest">Site Visit Count</p>
              <h4 className="text-3xl font-black text-[#1A1A1A]">{(siteVisits || 28450).toLocaleString()}</h4>
            </div>
          </div>

          {/* Email Subscription Box Below Visit Count */}
          <div className="space-y-3 pt-2 border-t border-brand-accent/20">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#1A1A1A]">
              <Bell className="w-4 h-4 text-brand-accent" /> Subscribe for Push Notifications
            </div>
            <p className="text-[11px] text-gray-600 leading-relaxed font-medium">
              Get instant recipe alerts & tutorial push notifications sent directly to your browser.
            </p>

            {isSubscribed ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl p-3 flex items-center justify-between font-bold">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Subscribed! Push Alerts Active</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('chef_studio_subscribed');
                    setIsSubscribed(false);
                    setSubscribeStatus('');
                  }}
                  className="text-[10px] text-emerald-700 underline font-normal"
                >
                  Change
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubscribeSubmit} className="space-y-2">
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 absolute left-3.5 text-gray-400 pointer-events-none" />
                  <input
                    type="email"
                    value={subscribeEmail}
                    onChange={(e) => setSubscribeEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    required
                    className="w-full bg-white border border-[#E5E5E1] rounded-2xl pl-10 pr-24 py-2.5 text-xs text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-brand-accent shadow-inner"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="absolute right-1.5 bg-[#1A1A1A] hover:bg-brand-accent text-white font-extrabold text-[11px] px-3 py-1.5 rounded-xl transition-all shadow flex items-center gap-1"
                  >
                    {isSubmitting ? '...' : <>Subscribe <Send className="w-3 h-3" /></>}
                  </button>
                </div>
                {subscribeStatus && (
                  <p className="text-[11px] font-bold text-brand-accent">{subscribeStatus}</p>
                )}
              </form>
            )}
          </div>
        </div>

        {/* Bento Card 3: Channel Stats (4 Cols) */}
        <div className="lg:col-span-4 bg-white border border-[#E5E5E1] rounded-3xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-gray-400">Channel Overview</span>
              <span className="bg-brand-accent-light text-brand-accent text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                Active YouTube Library
              </span>
            </div>
            <h3 className="text-xl font-bold text-[#1A1A1A]">Culinary Tutorials & Guides</h3>
          </div>

          <div className="grid grid-cols-2 gap-3 my-4">
            <div className="bg-[#FAF9F6] border border-[#E5E5E1] p-3.5 rounded-2xl">
              <div className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1 mb-1">
                <Video className="w-3.5 h-3.5 text-brand-accent" /> Tutorials
              </div>
              <div className="text-2xl font-black text-[#1A1A1A]">{totalVideos}</div>
            </div>

            <div className="bg-[#FAF9F6] border border-[#E5E5E1] p-3.5 rounded-2xl">
              <div className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1 mb-1">
                <Award className="w-3.5 h-3.5 text-brand-accent" /> Categories
              </div>
              <div className="text-2xl font-black text-[#1A1A1A]">{totalCategories}</div>
            </div>
          </div>

          <p className="text-xs text-gray-500">
            Searchable, category-filtered videos paired with AI recipe extraction.
          </p>
        </div>

        {/* Bento Card 4: Quick Digital Recipe Books Spotlight (8 Cols) */}
        <div className="lg:col-span-8 bg-white border border-[#E5E5E1] rounded-3xl p-6 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-[#1A1A1A]">Curated PDF Recipe Collections</h3>
              <p className="text-xs text-gray-500">Printable bundles designed for home cooks</p>
            </div>
            <button
              onClick={onGoToCookbooks}
              className="text-xs text-brand-accent font-bold hover:underline flex items-center gap-1"
            >
              Explore All Cookbooks &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#FAF9F6] border border-[#E5E5E1] rounded-2xl p-4 flex flex-col items-center text-center">
              <div className="w-10 h-12 bg-white border border-[#E5E5E1] rounded-lg shadow-sm mb-2 flex items-center justify-center text-xl">
                🥩
              </div>
              <p className="text-xs font-extrabold text-[#1A1A1A]">Mastering Steak</p>
              <button onClick={onGoToCookbooks} className="mt-2 text-[10px] bg-[#1A1A1A] text-white px-3 py-1 rounded-full font-bold hover:bg-brand-accent transition-colors">
                Download PDF
              </button>
            </div>

            <div className="bg-[#FAF9F6] border border-[#E5E5E1] rounded-2xl p-4 flex flex-col items-center text-center">
              <div className="w-10 h-12 bg-white border border-[#E5E5E1] rounded-lg shadow-sm mb-2 flex items-center justify-center text-xl">
                🥗
              </div>
              <p className="text-xs font-extrabold text-[#1A1A1A]">Healthy 15-Min</p>
              <button onClick={onGoToCookbooks} className="mt-2 text-[10px] bg-[#1A1A1A] text-white px-3 py-1 rounded-full font-bold hover:bg-brand-accent transition-colors">
                Download PDF
              </button>
            </div>

            <div className="bg-[#FAF9F6] border border-[#E5E5E1] rounded-2xl p-4 flex flex-col items-center text-center">
              <div className="w-10 h-12 bg-white border border-[#E5E5E1] rounded-lg shadow-sm mb-2 flex items-center justify-center text-xl">
                🧁
              </div>
              <p className="text-xs font-extrabold text-[#1A1A1A]">Artisan Baking</p>
              <button onClick={onGoToCookbooks} className="mt-2 text-[10px] bg-[#1A1A1A] text-white px-3 py-1 rounded-full font-bold hover:bg-brand-accent transition-colors">
                Download PDF
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
