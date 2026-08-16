import React, { useState, useEffect, useMemo, useRef } from 'react';

// ... rest of imports ...
import { RecipeVideo, Category, RecipeBookBundle, DownloadLog, SiteSettings, AdminCredentials, Subscriber, PushNotification } from './types';
import {
  INITIAL_CATEGORIES,
  INITIAL_VIDEOS,
  INITIAL_COOKBOOKS,
  INITIAL_DOWNLOAD_LOGS,
  INITIAL_SITE_SETTINGS,
  DEFAULT_ADMIN_CREDENTIALS,
  INITIAL_SUBSCRIBERS,
  INITIAL_NOTIFICATIONS
} from './data/mockData';
import {
  initializeDatabaseIfEmpty,
  subscribeRecipes,
  subscribeCategories,
  subscribeCookbooks,
  subscribeDownloadLogs,
  subscribeSiteSettings,
  subscribeAdminCredentials,
  subscribeSubscribers,
  subscribeNotifications,
  fetchCurrentSiteSettings,
  saveRecipeToDb,
  saveDownloadLogToDb,
  saveSubscriberToDb,
  deleteSubscriberFromDb,
  saveNotificationToDb,
  saveSiteSettingsToDb,
  incrementSiteVisitsInDb
} from './lib/firebase';
import { downloadRecipePDF } from './utils/pdfGenerator';
import { Header } from './components/Header';
import { ChannelHero } from './components/ChannelHero';
import { CategoryBar } from './components/CategoryBar';
import { RecipeCard } from './components/RecipeCard';
import { VideoTheaterModal } from './components/VideoTheaterModal';
import { CookbookHub } from './components/CookbookHub';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLoginModal } from './components/AdminLoginModal';
import { GeminiRecipeModal } from './components/GeminiRecipeModal';
import { Footer } from './components/Footer';
import { Bell, X, Play, Sparkles, Loader2, RefreshCw } from 'lucide-react';

export default function App() {
  const [recipes, setRecipes] = useState<RecipeVideo[]>(INITIAL_VIDEOS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [cookbooks, setCookbooks] = useState<RecipeBookBundle[]>(INITIAL_COOKBOOKS);
  const [downloadLogs, setDownloadLogs] = useState<DownloadLog[]>(INITIAL_DOWNLOAD_LOGS);
  const [subscribers, setSubscribers] = useState<Subscriber[]>(INITIAL_SUBSCRIBERS);
  const [notifications, setNotifications] = useState<PushNotification[]>(INITIAL_NOTIFICATIONS);
  const [pdfGeneratingTitle, setPdfGeneratingTitle] = useState<string | null>(null);

  // Dynamic Site Settings & Admin Credentials
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    const cached = localStorage.getItem('chef_studio_site_settings');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // Fallback
      }
    }
    return INITIAL_SITE_SETTINGS;
  });
  const [adminCredentials, setAdminCredentials] = useState<AdminCredentials>(DEFAULT_ADMIN_CREDENTIALS);

  // Active push notification banner toast
  const [activePushToast, setActivePushToast] = useState<PushNotification | null>(null);

  // Fetch current site settings from DB immediately on load
  useEffect(() => {
    fetchCurrentSiteSettings().then(settings => {
      if (settings) {
        setSiteSettings(settings);
      }
    });
  }, []);

  // Increment site visits count once per browser session safely without overwriting site settings
  useEffect(() => {
    if (!sessionStorage.getItem('chef_studio_session_visited')) {
      sessionStorage.setItem('chef_studio_session_visited', 'true');
      incrementSiteVisitsInDb();
    }
  }, []);

  // Track broadcast push notification IDs to trigger alerts across devices
  const knownNotifIdsRef = useRef<Set<string>>(new Set());
  const isInitialNotifLoadRef = useRef(true);

  // Initialize and Subscribe to Cloud Firestore
  useEffect(() => {
    initializeDatabaseIfEmpty();

    const unsubRecipes = subscribeRecipes(setRecipes);
    const unsubCategories = subscribeCategories(setCategories);
    const unsubCookbooks = subscribeCookbooks(setCookbooks);
    const unsubLogs = subscribeDownloadLogs(setDownloadLogs);
    const unsubSettings = subscribeSiteSettings(setSiteSettings);
    const unsubAdmin = subscribeAdminCredentials(setAdminCredentials);
    const unsubSubscribers = subscribeSubscribers(setSubscribers);
    const unsubNotifications = subscribeNotifications((newNotifs) => {
      if (newNotifs && newNotifs.length > 0) {
        // Identify newly arrived notifications that weren't seen before
        const newlyArrived = newNotifs.filter(n => !knownNotifIdsRef.current.has(n.id));

        if (newlyArrived.length > 0) {
          // On subsequent updates after initial load, trigger real-time toast alert & native browser notification
          if (!isInitialNotifLoadRef.current) {
            const latest = newlyArrived[0];
            setActivePushToast(latest);

            if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
              try {
                new Notification(latest.title, { body: latest.message });
              } catch (err) {
                console.error('Error firing browser notification:', err);
              }
            }
          }

          // Register all new IDs into set
          newlyArrived.forEach(n => knownNotifIdsRef.current.add(n.id));
        }
      }

      isInitialNotifLoadRef.current = false;
      setNotifications(newNotifs);
    });

    return () => {
      unsubRecipes();
      unsubCategories();
      unsubCookbooks();
      unsubLogs();
      unsubSettings();
      unsubAdmin();
      unsubSubscribers();
      unsubNotifications();
    };
  }, []);

  // Update Dynamic CSS Variables for Brand Accent Color
  useEffect(() => {
    const accent = siteSettings.accentColor || '#FF5F1F';
    document.documentElement.style.setProperty('--brand-accent', accent);
    
    let r = 255, g = 95, b = 31;
    if (accent.startsWith('#') && accent.length === 7) {
      r = parseInt(accent.slice(1, 3), 16) || 255;
      g = parseInt(accent.slice(3, 5), 16) || 95;
      b = parseInt(accent.slice(5, 7), 16) || 31;
    }
    document.documentElement.style.setProperty('--brand-accent-light', `rgba(${r}, ${g}, ${b}, 0.1)`);
    document.documentElement.style.setProperty('--brand-accent-border', `rgba(${r}, ${g}, ${b}, 0.25)`);
  }, [siteSettings.accentColor]);

  // Auth State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('chef_studio_admin_session') === 'true';
  });
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);

  // App Tabs
  const [activeTab, setActiveTab] = useState<'gallery' | 'cookbooks' | 'admin'>('gallery');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'quickest'>('latest');

  const [activeVideoForTheater, setActiveVideoForTheater] = useState<RecipeVideo | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isMobileAdminSidebarOpen, setIsMobileAdminSidebarOpen] = useState(false);

  // Handle Tab Navigation with Admin Protection
  const handleSelectTab = (tab: 'gallery' | 'cookbooks' | 'admin') => {
    if (tab === 'admin') {
      if (isAdminLoggedIn) {
        setActiveTab('admin');
      } else {
        setIsAdminLoginModalOpen(true);
      }
    } else {
      setActiveTab(tab);
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('chef_studio_admin_session');
    setIsAdminLoggedIn(false);
    setActiveTab('gallery');
  };

  // Log download action to Firestore
  const handleLogDownload = async (
    itemType: 'recipe_pdf' | 'cookbook_bundle' | 'shopping_list',
    itemId: string,
    itemName: string
  ) => {
    const newLog: DownloadLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      itemType,
      itemId,
      itemName,
      device: window.innerWidth < 640 ? 'Mobile' : window.innerWidth < 1024 ? 'Tablet' : 'Desktop',
      location: 'United States'
    };

    await saveDownloadLogToDb(newLog);

    // Send to Express server if available
    try {
      await fetch('/api/downloads/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLog)
      });
    } catch {
      // Ignore fallback
    }
  };

  // Handle single PDF download
  const handleDownloadSingleRecipe = async (recipe: RecipeVideo) => {
    setPdfGeneratingTitle(recipe.title);
    try {
      await downloadRecipePDF(recipe);
      await handleLogDownload('recipe_pdf', recipe.id, `${recipe.title} PDF Card`);

      // Increment download count on recipe in Firestore
      const updatedRecipe = { ...recipe, downloadsCount: (recipe.downloadsCount || 0) + 1 };
      await saveRecipeToDb(updatedRecipe);
    } catch (err) {
      console.error('Failed to generate PDF card:', err);
    } finally {
      setPdfGeneratingTitle(null);
    }
  };

  // Handle Email Subscription from Visitor UI
  const handleSubscribe = async (email: string) => {
    if (subscribers.some(s => s.email.toLowerCase() === email.toLowerCase())) {
      return;
    }
    const newSub: Subscriber = {
      id: 'sub-' + Date.now(),
      email,
      subscribedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'active',
      source: 'Hero Banner'
    };
    await saveSubscriberToDb(newSub);
    setSubscribers(prev => [newSub, ...prev]);

    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      try {
        await Notification.requestPermission();
      } catch {
        // Ignore
      }
    }
  };

  const handleDeleteSubscriber = async (id: string) => {
    await deleteSubscriberFromDb(id);
    setSubscribers(prev => prev.filter(s => s.id !== id));
  };

  const handleSendPushNotification = async (
    title: string,
    message: string,
    recipeId?: string,
    linkUrl?: string
  ) => {
    const newNotif: PushNotification = {
      id: 'notif-' + Date.now(),
      title,
      message,
      recipeId,
      linkUrl,
      sentAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      sentBy: 'Chef Studio Admin',
      recipientCount: subscribers.length || 1
    };
    knownNotifIdsRef.current.add(newNotif.id);
    await saveNotificationToDb(newNotif);
    setNotifications(prev => [newNotif, ...prev]);
    setActivePushToast(newNotif);

    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try {
        new Notification(title, { body: message });
      } catch {
        // Ignore
      }
    }
  };

  // Featured video spotlight
  const featuredVideo = useMemo(() => {
    return recipes.find(r => r.featured) || recipes[0] || null;
  }, [recipes]);

  // Filter & Sort Recipes
  const filteredRecipes = useMemo(() => {
    return recipes.filter(r => {
      // Category Filter
      if (selectedCategory && r.categoryId !== selectedCategory) {
        return false;
      }
      // Difficulty Filter
      if (selectedDifficulty && r.difficulty !== selectedDifficulty) {
        return false;
      }
      // Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = r.title.toLowerCase().includes(q);
        const matchesDesc = r.description.toLowerCase().includes(q);
        const matchesCat = r.categoryName.toLowerCase().includes(q);
        const matchesTag = r.tags.some(t => t.toLowerCase().includes(q));
        const matchesIng = r.ingredients.some(i => i.name.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesCat && !matchesTag && !matchesIng) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'popular') {
        return b.viewsCount - a.viewsCount;
      }
      if (sortBy === 'quickest') {
        return parseInt(a.prepTime) - parseInt(b.prepTime);
      }
      // default 'latest'
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [recipes, selectedCategory, selectedDifficulty, searchQuery, sortBy]);

  // Total downloads count across channel
  const totalDownloads = useMemo(() => {
    const videoDownloads = recipes.reduce((acc, r) => acc + r.downloadsCount, 0);
    const bookDownloads = cookbooks.reduce((acc, c) => acc + c.downloadCount, 0);
    return videoDownloads + bookDownloads;
  }, [recipes, cookbooks]);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1A1A1A] flex flex-col font-sans selection:bg-[#FF5F1F] selection:text-white">
      
      {/* Sticky Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={handleSelectTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
        siteSettings={siteSettings}
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
        onOpenAiModal={() => setIsAiModalOpen(true)}
        onToggleAdminSidebar={() => setIsMobileAdminSidebarOpen(prev => !prev)}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1">
        
        {/* VIEW 1: VIDEO TUTORIALS GALLERY */}
        {activeTab === 'gallery' && (
          <div>
            {/* Hero Banner Section */}
            <ChannelHero
              featuredVideo={featuredVideo}
              topVideos={recipes.slice(0, 10)}
              totalVideos={recipes.length}
              totalCategories={categories.length}
              totalDownloads={totalDownloads}
              siteVisits={siteSettings.siteVisits}
              onWatchVideo={(v) => setActiveVideoForTheater(v)}
              onGoToCookbooks={() => handleSelectTab('cookbooks')}
              onSubscribe={handleSubscribe}
              siteSettings={siteSettings}
            />

            {/* Gallery Grid Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
              
              {/* Category & Filter Navigation Bar */}
              <CategoryBar
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedDifficulty={selectedDifficulty}
                setSelectedDifficulty={setSelectedDifficulty}
                sortBy={sortBy}
                setSortBy={setSortBy}
                totalResults={filteredRecipes.length}
              />

              {/* Recipe Cards Grid */}
              {filteredRecipes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
                  {filteredRecipes.map((recipe) => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      onWatchVideo={(v) => setActiveVideoForTheater(v)}
                      onDownloadPdf={handleDownloadSingleRecipe}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 space-y-3 bg-white rounded-3xl border border-[#E5E5E1] my-8 shadow-sm">
                  <p className="text-gray-500 text-sm">No cooking tutorials matched your search criteria.</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory(null);
                      setSelectedDifficulty(null);
                    }}
                    className="px-5 py-2.5 bg-[#1A1A1A] hover:bg-[#FF5F1F] text-white text-xs font-bold rounded-full transition-colors"
                  >
                    Reset Search Filters
                  </button>
                </div>
              )}

            </div>
          </div>
        )}

        {/* VIEW 2: DOWNLOADABLE COOKBOOKS HUB */}
        {activeTab === 'cookbooks' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <CookbookHub
              cookbooks={cookbooks}
              recipes={recipes}
              onLogDownload={handleLogDownload}
            />
          </div>
        )}

        {/* VIEW 3: ADMIN DASHBOARD (RESTRICTED TO LOGGED IN ADMINS) */}
        {activeTab === 'admin' && isAdminLoggedIn && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AdminDashboard
              recipes={recipes}
              setRecipes={setRecipes}
              categories={categories}
              setCategories={setCategories}
              cookbooks={cookbooks}
              setCookbooks={setCookbooks}
              downloadLogs={downloadLogs}
              siteSettings={siteSettings}
              setSiteSettings={setSiteSettings}
              adminCredentials={adminCredentials}
              setAdminCredentials={setAdminCredentials}
              subscribers={subscribers}
              setSubscribers={setSubscribers}
              notifications={notifications}
              setNotifications={setNotifications}
              onSendPushNotification={handleSendPushNotification}
              onDeleteSubscriber={handleDeleteSubscriber}
              onAddSubscriber={handleSubscribe}
              onLogout={handleAdminLogout}
              onOpenAiModal={() => setIsAiModalOpen(true)}
              isMobileSidebarOpen={isMobileAdminSidebarOpen}
              setIsMobileSidebarOpen={setIsMobileAdminSidebarOpen}
            />
          </div>
        )}

      </main>

      {/* FLOATING PDF GENERATION SPINNER TOAST OVERLAY */}
      {pdfGeneratingTitle && (
        <div className="fixed bottom-6 left-6 z-50 max-w-sm w-full bg-[#1A1A1A] border-2 border-amber-500 text-white rounded-3xl p-4 shadow-2xl animate-slideUp flex items-center gap-3.5 backdrop-blur-md">
          <div className="p-3 bg-amber-500/20 border border-amber-500/40 text-amber-400 rounded-2xl shrink-0">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] uppercase font-extrabold text-amber-400 tracking-wider block">
              Processing PDF Recipe Card
            </span>
            <p className="text-xs font-bold text-white truncate">{pdfGeneratingTitle}</p>
            <p className="text-[11px] text-zinc-400">Formatting Cookbook style layout & downloading...</p>
          </div>
        </div>
      )}

      {/* FLOATING REAL-TIME PUSH NOTIFICATION TOAST ALERT */}
      {activePushToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-[#1A1A1A] border-2 border-[#FF5F1F] text-white rounded-3xl p-5 shadow-2xl animate-slideUp">
          <div className="flex items-start justify-between gap-3">
            <div className="p-2.5 bg-[#FF5F1F] text-white rounded-2xl shadow-md shrink-0">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-extrabold text-[#FF5F1F] tracking-widest">
                  Live Push Alert
                </span>
                <span className="text-[10px] text-gray-400 font-mono">{activePushToast.sentAt}</span>
              </div>
              <h5 className="font-extrabold text-sm text-white leading-snug">{activePushToast.title}</h5>
              <p className="text-xs text-gray-300 leading-relaxed">{activePushToast.message}</p>

              {activePushToast.recipeId && (
                <button
                  onClick={() => {
                    const found = recipes.find(r => r.id === activePushToast.recipeId);
                    if (found) {
                      setActiveVideoForTheater(found);
                      setActivePushToast(null);
                    }
                  }}
                  className="mt-2.5 px-3.5 py-1.5 bg-[#FF5F1F] hover:bg-white hover:text-[#1A1A1A] text-white text-[11px] font-extrabold rounded-full transition-colors flex items-center gap-1.5 shadow"
                >
                  <Play className="w-3 h-3 fill-current" /> Watch Featured Recipe
                </button>
              )}
            </div>
            <button
              onClick={() => setActivePushToast(null)}
              className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Admin Login Portal Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        onLoginSuccess={() => {
          setIsAdminLoggedIn(true);
          setActiveTab('admin');
        }}
        credentials={adminCredentials}
        siteSettings={siteSettings}
      />

      {/* Latest Video Theater Modal */}
      {activeVideoForTheater && (
        <VideoTheaterModal
          recipe={activeVideoForTheater}
          onClose={() => setActiveVideoForTheater(null)}
          onDownloadPdf={handleDownloadSingleRecipe}
        />
      )}

      {/* Gemini AI Recipe Extractor Modal (Restricted to Admin) */}
      {isAdminLoggedIn && (
        <GeminiRecipeModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          onRecipeGenerated={async (newRec) => {
            await saveRecipeToDb(newRec);
            setActiveVideoForTheater(newRec);
          }}
        />
      )}

      {/* Footer */}
      <Footer
        categories={categories}
        onSelectCategory={(catId) => {
          setSelectedCategory(catId);
          handleSelectTab('gallery');
        }}
        siteSettings={siteSettings}
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenAdminLogin={() => {
          if (isAdminLoggedIn) {
            setActiveTab('admin');
          } else {
            setIsAdminLoginModalOpen(true);
          }
        }}
        onSubscribe={handleSubscribe}
      />

    </div>
  );
}
